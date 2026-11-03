import fs from "fs";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";
import { prisma } from "./db";
import { getSettings, saveSettings, BackupSettings, defaultBackupSettings } from "./settings";
import { createAuditLog } from "./audit";

const BACKUPS_DIR = path.join(process.cwd(), "backups");
const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");
const SETTINGS_PATH = path.join(process.cwd(), "workshop-settings.json");

const MAGIC_HEADER = Buffer.from("MOTOBACKUP", "utf8"); // 10 bytes
const BACKUP_VERSION = 2; // 1 byte
const MASTER_BACKUP_KEY =
  process.env.BACKUP_ENCRYPTION_SECRET ||
  "MOTO-TALLER-TS7-AES256-GCM-SYSTEM-BACKUP-SECRET-KEY-PROD-2026-ENCRYPTED";

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

/**
 * Deriva una clave AES-256 (32 bytes) usando PBKDF2 con SHA-256 y 100.000 iteraciones
 */
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(MASTER_BACKUP_KEY, salt, 100000, 32, "sha256");
}

export interface BackupStats {
  [key: string]: any;
  productsCount: number;
  invoicesCount: number;
  ordersCount: number;
  customersCount: number;
  usersCount: number;
  creditsCount: number;
  quotesCount: number;
  databaseSizeBytes: number;
}

export interface BackupMetadata {
  [key: string]: any;
  version: number;
  createdAt: string;
  triggeredBy: string;
  isAuto: boolean;
  appName: string;
  stats: BackupStats;
  checksumSha256: string;
}

/**
 * Crea una copia de seguridad cifrada con AES-256-GCM.
 * Solo este software con su llave puede descifrarla.
 */
export async function createEncryptedBackup(options?: {
  triggeredBy?: string;
  isAuto?: boolean;
}): Promise<{
  filename: string;
  filePath: string;
  sizeBytes: number;
  metadata: BackupMetadata;
}> {
  ensureBackupsDir();

  const isAuto = Boolean(options?.isAuto);
  const triggeredBy = options?.triggeredBy || "Sistema";

  // 1. Sincronizar WAL de SQLite para asegurar que toda la información reciente esté en disco
  try {
    await prisma.$queryRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE);");
  } catch (e) {
    console.warn("Checkpoint warning (continuando):", e);
  }

  // 2. Leer base de datos SQLite y configuración actual
  if (!fs.existsSync(DB_PATH)) {
    throw new Error("No se encontró el archivo de base de datos SQLite.");
  }

  const dbBuffer = fs.readFileSync(DB_PATH);
  const settingsJson = fs.existsSync(SETTINGS_PATH)
    ? fs.readFileSync(SETTINGS_PATH, "utf-8")
    : JSON.stringify(getSettings());

  // 3. Recopilar estadísticas del sistema
  const [
    productsCount,
    invoicesCount,
    ordersCount,
    customersCount,
    usersCount,
    creditsCount,
    quotesCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.invoice.count(),
    prisma.workOrder.count(),
    prisma.customer.count(),
    prisma.user.count(),
    prisma.credit.count(),
    prisma.quote.count(),
  ]);

  const stats: BackupStats = {
    productsCount,
    invoicesCount,
    ordersCount,
    customersCount,
    usersCount,
    creditsCount,
    quotesCount,
    databaseSizeBytes: dbBuffer.length,
  };

  const checksumSha256 = crypto.createHash("sha256").update(dbBuffer).digest("hex");

  const metadata: BackupMetadata = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    triggeredBy,
    isAuto,
    appName: "MotoTaller TS7",
    stats,
    checksumSha256,
  };

  // 4. Preparar paquete de datos completo
  const packagePayload = {
    metadata,
    settingsJson,
    dbBase64: dbBuffer.toString("base64"),
  };

  // 5. Compresión gzip para reducir drásticamente el tamaño
  const plainJsonBuffer = Buffer.from(JSON.stringify(packagePayload), "utf-8");
  const compressedBuffer = zlib.gzipSync(plainJsonBuffer, { level: 9 });

  // 6. Cifrado de grado militar con AES-256-GCM
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12); // Recomendado para GCM
  const key = deriveKey(salt);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(compressedBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes para verificar autenticidad e integridad

  // Estructura binaria final del archivo .motobackup:
  // [10 bytes: MAGIC_HEADER "MOTOBACKUP"]
  // [1 byte: BACKUP_VERSION (0x02)]
  // [16 bytes: Salt]
  // [12 bytes: IV]
  // [16 bytes: AuthTag]
  // [Resto: Ciphertext cifrado]
  const finalEncryptedFileBuffer = Buffer.concat([
    MAGIC_HEADER,
    Buffer.from([BACKUP_VERSION]),
    salt,
    iv,
    authTag,
    ciphertext,
  ]);

  // 7. Guardar en disco
  const timestampStr = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  const prefix = isAuto ? "auto-backup" : "manual-backup";
  const filename = `${prefix}_mototaller_${timestampStr}.motobackup`;
  const filePath = path.join(BACKUPS_DIR, filename);

  fs.writeFileSync(filePath, finalEncryptedFileBuffer);

  // 8. Actualizar configuración de backups automáticos
  const settings = getSettings();
  const currentBackupConfig: BackupSettings = {
    ...defaultBackupSettings,
    ...(settings.backupSettings || {}),
  };

  const intervalHours = currentBackupConfig.intervalHours || 24;
  const nextBackupAt = new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString();

  settings.backupSettings = {
    ...currentBackupConfig,
    lastBackupAt: metadata.createdAt,
    nextBackupAt,
  };
  saveSettings(settings);

  // 9. Rotación de copias: eliminar las más antiguas si superan el límite configurado
  await rotateOldBackups(currentBackupConfig.maxBackupsToKeep || 7);

  // 10. Registro inmutable de auditoría
  await createAuditLog({
    action: isAuto ? "BACKUP_AUTO_CREATED" : "BACKUP_MANUAL_CREATED",
    resource: "SystemBackup",
    resourceId: filename,
    details: {
      filename,
      sizeBytes: finalEncryptedFileBuffer.length,
      stats,
      triggeredBy,
    },
  });

  return {
    filename,
    filePath,
    sizeBytes: finalEncryptedFileBuffer.length,
    metadata,
  };
}

/**
 * Descifra e inspecciona el contenido de un archivo .motobackup sin aplicarlo
 */
export function decryptAndInspectBackup(fileBuffer: Buffer): {
  metadata: BackupMetadata;
  settingsJson: string;
  dbBuffer: Buffer;
} {
  if (fileBuffer.length < 55) {
    throw new Error("El archivo está corrupto o es demasiado pequeño.");
  }

  // 1. Validar cabecera mágica
  const header = fileBuffer.subarray(0, 10);
  if (!header.equals(MAGIC_HEADER)) {
    throw new Error(
      "Formato no reconocido. El archivo debe ser una copia cifrada (.motobackup) generada por MotoTaller TS7."
    );
  }

  // 2. Extraer parámetros criptográficos
  const version = fileBuffer[10];
  const salt = fileBuffer.subarray(11, 27);
  const iv = fileBuffer.subarray(27, 39);
  const authTag = fileBuffer.subarray(39, 55);
  const ciphertext = fileBuffer.subarray(55);

  // 3. Descifrar con AES-256-GCM y verificar autenticidad con AuthTag
  const key = deriveKey(salt);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let compressedBuffer: Buffer;
  try {
    compressedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (err: any) {
    throw new Error(
      "Fallo de descifrado criptográfico: La clave del sistema no coincide o el archivo fue manipulado externamente."
    );
  }

  // 4. Descomprimir gzip
  let plainJsonBuffer: Buffer;
  try {
    plainJsonBuffer = zlib.gunzipSync(compressedBuffer);
  } catch (err) {
    throw new Error("Error al descomprimir los datos del backup.");
  }

  // 5. Parsear payload JSON
  const payload = JSON.parse(plainJsonBuffer.toString("utf-8"));
  if (!payload.metadata || !payload.dbBase64) {
    throw new Error("Estructura de copia de seguridad inválida o incompleta.");
  }

  const dbBuffer = Buffer.from(payload.dbBase64, "base64");

  // Validar integridad SHA-256
  const actualHash = crypto.createHash("sha256").update(dbBuffer).digest("hex");
  if (payload.metadata.checksumSha256 && payload.metadata.checksumSha256 !== actualHash) {
    throw new Error("Error de integridad: El hash de la base de datos no coincide con el paquete.");
  }

  return {
    metadata: payload.metadata,
    settingsJson: payload.settingsJson || "{}",
    dbBuffer,
  };
}

/**
 * Restaura el sistema completo a partir de un archivo cifrado .motobackup
 */
export async function restoreEncryptedBackup(
  fileBuffer: Buffer,
  user: { id: string; name: string }
): Promise<{
  success: boolean;
  message: string;
  metadata: BackupMetadata;
}> {
  // 1. Descifrar e inspeccionar
  const decrypted = decryptAndInspectBackup(fileBuffer);

  // 2. Crear copia de seguridad preventiva del estado actual antes de sobrescribir
  const preRestoreBackupPath = `${DB_PATH}.pre_restore_${Date.now()}`;
  if (fs.existsSync(DB_PATH)) {
    fs.copyFileSync(DB_PATH, preRestoreBackupPath);
  }

  try {
    // 3. Escribir base de datos restaurada
    fs.writeFileSync(DB_PATH, decrypted.dbBuffer);

    // 4. Restaurar configuración de settings si está presente
    if (decrypted.settingsJson && decrypted.settingsJson.trim().startsWith("{")) {
      fs.writeFileSync(SETTINGS_PATH, decrypted.settingsJson, "utf-8");
    }

    // 5. Verificar salud de la base de datos restaurada
    const verifiedUsersCount = await prisma.user.count();
    const verifiedProductsCount = await prisma.product.count();

    // 6. Registrar en auditoría
    await createAuditLog({
      userId: user.id,
      action: "BACKUP_SYSTEM_RESTORED",
      resource: "SystemBackup",
      resourceId: decrypted.metadata.checksumSha256,
      details: {
        restoredBy: user.name,
        backupCreatedAt: decrypted.metadata.createdAt,
        verifiedUsersCount,
        verifiedProductsCount,
        stats: decrypted.metadata.stats,
      },
    });

    // Limpiar copia preventiva si la restauración fue 100% exitosa
    if (fs.existsSync(preRestoreBackupPath)) {
      try {
        fs.unlinkSync(preRestoreBackupPath);
      } catch {}
    }

    return {
      success: true,
      message: `Sistema restaurado con éxito. Se recuperaron ${verifiedProductsCount} repuestos/artículos y todos los registros del ${new Date(
        decrypted.metadata.createdAt
      ).toLocaleString("es-CO")}.`,
      metadata: decrypted.metadata,
    };
  } catch (error: any) {
    // Rollback de emergencia en caso de fallo crítico
    if (fs.existsSync(preRestoreBackupPath)) {
      fs.copyFileSync(preRestoreBackupPath, DB_PATH);
    }
    console.error("Error crítico durante la restauración de backup:", error);
    throw new Error(`Error al aplicar la copia de seguridad: ${error.message}`);
  }
}

/**
 * Lista todas las copias de seguridad existentes en la carpeta de backups
 */
export async function listStoredBackups(): Promise<
  Array<{
    filename: string;
    sizeBytes: number;
    sizeFormatted: string;
    createdAt: string;
    isAuto: boolean;
    stats?: BackupStats;
  }>
> {
  ensureBackupsDir();

  const files = fs
    .readdirSync(BACKUPS_DIR)
    .filter((f) => f.endsWith(".motobackup"))
    .sort()
    .reverse();

  const results = [];

  for (const filename of files) {
    const filePath = path.join(BACKUPS_DIR, filename);
    const stat = fs.statSync(filePath);

    let isAuto = filename.startsWith("auto-backup");
    let stats: BackupStats | undefined = undefined;

    // Intentar leer metadatos rápidos sin descifrar todo el cuerpo pesado
    try {
      const buffer = fs.readFileSync(filePath);
      const inspected = decryptAndInspectBackup(buffer);
      isAuto = inspected.metadata.isAuto;
      stats = inspected.metadata.stats;
    } catch {
      // Si falla lectura detallada, mantener la info del archivo
    }

    const sizeKb = (stat.size / 1024).toFixed(1);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    const sizeFormatted = stat.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

    results.push({
      filename,
      sizeBytes: stat.size,
      sizeFormatted,
      createdAt: stat.mtime.toISOString(),
      isAuto,
      stats,
    });
  }

  return results;
}

/**
 * Elimina una copia de seguridad almacenada en el servidor
 */
export function deleteStoredBackup(filename: string): boolean {
  ensureBackupsDir();
  // Validar nombre seguro para evitar Path Traversal
  const safeFilename = path.basename(filename);
  if (!safeFilename.endsWith(".motobackup")) {
    throw new Error("Nombre de archivo inválido.");
  }

  const filePath = path.join(BACKUPS_DIR, safeFilename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function getStoredBackupPath(filename: string): string | null {
  ensureBackupsDir();
  const safeFilename = path.basename(filename);
  const filePath = path.join(BACKUPS_DIR, safeFilename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

/**
 * Rota copias de seguridad antiguas conservando únicamente las más recientes
 */
async function rotateOldBackups(maxToKeep: number) {
  try {
    ensureBackupsDir();
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith(".motobackup"))
      .map((f) => ({
        name: f,
        fullPath: path.join(BACKUPS_DIR, f),
        time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxToKeep) {
      const toRemove = files.slice(maxToKeep);
      for (const item of toRemove) {
        try {
          fs.unlinkSync(item.fullPath);
        } catch {}
      }
    }
  } catch (err) {
    console.warn("Advertencia en rotación de backups:", err);
  }
}

/**
 * Evalúa y ejecuta automáticamente una copia de seguridad cifrada si ya venció el intervalo programado
 */
let isAutoBackupRunning = false;

export async function checkAndRunAutoBackup(): Promise<{
  executed: boolean;
  reason?: string;
  filename?: string;
}> {
  if (isAutoBackupRunning) {
    return { executed: false, reason: "Backup en progreso" };
  }

  const settings = getSettings();
  const config: BackupSettings = {
    ...defaultBackupSettings,
    ...(settings.backupSettings || {}),
  };

  if (!config.enabled) {
    return { executed: false, reason: "Backups automáticos desactivados por el usuario" };
  }

  const now = Date.now();
  let due = false;

  if (!config.lastBackupAt) {
    due = true;
  } else {
    const lastTime = new Date(config.lastBackupAt).getTime();
    const intervalMs = (config.intervalHours || 24) * 60 * 60 * 1000;
    if (now - lastTime >= intervalMs) {
      due = true;
    }
  }

  if (!due) {
    return { executed: false, reason: "Intervalo aún no cumplido" };
  }

  isAutoBackupRunning = true;
  try {
    const result = await createEncryptedBackup({
      triggeredBy: "Programador Automático (Segundo Plano)",
      isAuto: true,
    });
    return { executed: true, filename: result.filename };
  } catch (err: any) {
    console.error("Error al ejecutar backup automático:", err);
    return { executed: false, reason: err.message };
  } finally {
    isAutoBackupRunning = false;
  }
}

// Iniciar comprobador en segundo plano cada 10 minutos
if (typeof setInterval !== "undefined") {
  const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos
  setInterval(() => {
    checkAndRunAutoBackup().catch((e) => console.warn("AutoBackup interval check error:", e));
  }, CHECK_INTERVAL_MS);
}

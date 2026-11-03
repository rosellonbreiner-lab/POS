import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings, BackupSettings } from "@/lib/settings";
import {
  createEncryptedBackup,
  listStoredBackups,
  deleteStoredBackup,
  checkAndRunAutoBackup,
} from "@/lib/backup";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo administradores pueden gestionar copias de seguridad." },
      { status: 403 }
    );
  }

  try {
    // Evaluar si corresponde ejecutar backup automático en segundo plano
    await checkAndRunAutoBackup();

    const settings = getSettings();
    const storedBackups = await listStoredBackups();

    return NextResponse.json({
      config: settings.backupSettings,
      backups: storedBackups,
      systemRecommendedIntervalHours: 24, // Recomendado: diario cada 24h
    });
  } catch (error: any) {
    console.error("Error al obtener backups:", error);
    return NextResponse.json({ error: error.message || "Error al listar backups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo administradores pueden generar copias de seguridad." },
      { status: 403 }
    );
  }

  try {
    const result = await createEncryptedBackup({
      triggeredBy: `${user.name} (${user.email})`,
      isAuto: false,
    });

    return NextResponse.json({
      success: true,
      message: `Copia de seguridad cifrada (${(result.sizeBytes / 1024).toFixed(1)} KB) generada exitosamente.`,
      backup: {
        filename: result.filename,
        sizeBytes: result.sizeBytes,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error("Error al crear copia de seguridad:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear copia de seguridad cifrada." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo administradores pueden configurar copias de seguridad." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { enabled, intervalHours, maxBackupsToKeep } = body;

    const settings = getSettings();
    const currentConfig: BackupSettings = settings.backupSettings || {
      enabled: true,
      intervalHours: 24,
      maxBackupsToKeep: 7,
      lastBackupAt: null,
      nextBackupAt: null,
    };

    const newEnabled = enabled !== undefined ? Boolean(enabled) : currentConfig.enabled;
    const newInterval = [6, 12, 24, 168].includes(Number(intervalHours))
      ? Number(intervalHours)
      : currentConfig.intervalHours || 24;
    const newMaxToKeep = Math.max(3, Math.min(30, Number(maxBackupsToKeep) || 7));

    let nextBackupAt = currentConfig.nextBackupAt;
    if (newEnabled) {
      const baseTime = currentConfig.lastBackupAt ? new Date(currentConfig.lastBackupAt).getTime() : Date.now();
      nextBackupAt = new Date(baseTime + newInterval * 60 * 60 * 1000).toISOString();
      // Si la fecha calculada ya quedó en el pasado, reprogramar a partir de ahora
      if (new Date(nextBackupAt).getTime() <= Date.now()) {
        nextBackupAt = new Date(Date.now() + newInterval * 60 * 60 * 1000).toISOString();
      }
    } else {
      nextBackupAt = null;
    }

    settings.backupSettings = {
      ...currentConfig,
      enabled: newEnabled,
      intervalHours: newInterval,
      maxBackupsToKeep: newMaxToKeep,
      nextBackupAt,
    };

    saveSettings(settings);

    await createAuditLog({
      userId: user.id,
      action: "BACKUP_CONFIG_UPDATED",
      resource: "SystemBackup",
      resourceId: "CONFIG",
      details: {
        enabled: newEnabled,
        intervalHours: newInterval,
        maxBackupsToKeep: newMaxToKeep,
        nextBackupAt,
        updatedBy: user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configuración de copias de seguridad actualizada con éxito.",
      config: settings.backupSettings,
    });
  } catch (error: any) {
    console.error("Error al actualizar configuración de backup:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo administradores pueden eliminar copias de seguridad." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Nombre de archivo requerido." }, { status: 400 });
    }

    const deleted = deleteStoredBackup(filename);
    if (!deleted) {
      return NextResponse.json({ error: "El archivo no existe o ya fue eliminado." }, { status: 404 });
    }

    await createAuditLog({
      userId: user.id,
      action: "BACKUP_FILE_DELETED",
      resource: "SystemBackup",
      resourceId: filename,
      details: {
        filename,
        deletedBy: user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Copia de seguridad "${filename}" eliminada.`,
    });
  } catch (error: any) {
    console.error("Error al eliminar backup:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar archivo" }, { status: 500 });
  }
}


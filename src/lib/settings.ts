import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "workshop-settings.json");
const BACKUP_SETTINGS_FILE = path.join(process.cwd(), "workshop-settings.backup.json");

export interface Company {
  id: string;
  name: string;
  type: "TALLER_MOTOS" | "TIENDA_COMERCIO" | "FERRETERIA" | "COMERCIO_GENERAL";
  slogan?: string;
  nit: string;
  phone: string;
  address: string;
  logoUrl?: string;
  receiptMessage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: string;
}

export interface AuthorCreditSettings {
  enabled: boolean;
  text: string;
  url: string;
}

export interface BackupSettings {
  enabled: boolean;
  intervalHours: number; // 24 = Diario (Recomendado)
  maxBackupsToKeep: number;
  lastBackupAt: string | null;
  nextBackupAt: string | null;
}

export const defaultBackupSettings: BackupSettings = {
  enabled: true,
  intervalHours: 24, // Recomendado: cada 24 horas
  maxBackupsToKeep: 7,
  lastBackupAt: null,
  nextBackupAt: null,
};

export const defaultCompanies: Company[] = [
  {
    id: "comp-mototaller",
    name: "MotoTaller TS7",
    type: "TALLER_MOTOS",
    slogan: "Especialistas en Reparación y Repuestos Multimarca",
    nit: "901.452.889-1",
    phone: "(+57) 300 123 4567",
    address: "Calle 16 # 10-45, Maicao, La Guajira",
    logoUrl: "",
    receiptMessage: "¡Gracias por confiar en nosotros! Garantía de 30 días en repuestos con este ticket.",
    primaryColor: "#5AA9E6",
    secondaryColor: "#1F3A5F",
    createdAt: "2026-10-28T00:00:00.000Z",
  },
];

export const defaultUserCompanies: Record<string, string> = {
  "super@mototaller.co": "ALL",
  "admin@mototaller.co": "ALL",
  "dueno@mototaller.co": "comp-mototaller",
  "trabajador@mototaller.co": "comp-mototaller",
};

export const defaultSettings = {
  name: "MotoTaller TS7",
  slogan: "Especialistas en Reparación y Repuestos Multimarca",
  nit: "901.452.889-1",
  phone: "(+57) 300 123 4567",
  address: "Calle 16 # 10-45, Maicao, La Guajira",
  logoUrl: "",
  receiptMessage: "¡Gracias por confiar en nosotros! Garantía de 30 días en repuestos con este ticket.",
  companies: defaultCompanies,
  userCompanies: defaultUserCompanies,
  invoiceCompanies: {} as Record<string, string>,
  productCompanies: {} as Record<string, string>,
  orderCompanies: {} as Record<string, string>,
  quoteCompanies: {} as Record<string, string>,
  userCredentials: {
    "super@mototaller.co": "SuperAdmin2026!",
    "admin@mototaller.co": "SuperAdmin2026!",
    "dueno@mototaller.co": "AdminDueño123!",
    "trabajador@mototaller.co": "Trabajador123!",
  },
  roleModulePermissions: {
    ADMIN: {
      "Dashboard": true,
      "Inventario & Kardex": true,
      "Bajo Stock": true,
      "Punto de Venta (POS)": true,
      "Órdenes de Trabajo": true,
      "Cotizaciones": true,
      "Créditos": true,
      "Contabilidad & Caja": true,
      "Configuración": true,
    },
    TRABAJADOR: {
      "Dashboard": true,
      "Inventario & Kardex": true,
      "Bajo Stock": true,
      "Punto de Venta (POS)": true,
      "Órdenes de Trabajo": true,
      "Cotizaciones": true,
      "Créditos": false,
      "Contabilidad & Caja": false,
      "Configuración": false,
    },
  },
  roleFeaturePermissions: {
    ADMIN: {
      eliminarRepuestos: true,
      descuentosVentas: true,
      verCostosUtilidad: true,
      arqueoCaja: true,
      escanerCamara: true,
    },
    TRABAJADOR: {
      eliminarRepuestos: false,
      descuentosVentas: true,
      verCostosUtilidad: false,
      arqueoCaja: false,
      escanerCamara: true,
    },
  },
  backupSettings: defaultBackupSettings,
  authorCredit: {
    enabled: true,
    text: "By Breiner Rosellon",
    url: "https://github.com/rosellonbreiner-lab/POS",
  },
};

export function getSettings() {
  let rawData: string | null = null;
  let usedBackup = false;

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      rawData = fs.readFileSync(SETTINGS_FILE, "utf-8");
    }
  } catch (e) {
    console.error("Error reading primary settings file:", e);
  }

  // Si el archivo principal no existe o falló, intentar recuperar desde el espejo de respaldo
  if (!rawData || !rawData.trim()) {
    try {
      if (fs.existsSync(BACKUP_SETTINGS_FILE)) {
        rawData = fs.readFileSync(BACKUP_SETTINGS_FILE, "utf-8");
        usedBackup = true;
        console.warn("[SETTINGS PERSISTENCE] Archivo principal no disponible. Restaurando configuración desde espejo de respaldo...");
      }
    } catch (e) {
      console.error("Error reading mirror backup settings file:", e);
    }
  }

  try {
    if (rawData) {
      const parsed = JSON.parse(rawData);

      // Si usamos el backup para revivir, resincronizar el archivo principal
      if (usedBackup) {
        try {
          fs.writeFileSync(SETTINGS_FILE, JSON.stringify(parsed, null, 2), "utf-8");
        } catch (_) {}
      } else {
        // Mantener el espejo al día silenciosamente
        try {
          if (!fs.existsSync(BACKUP_SETTINGS_FILE)) {
            fs.writeFileSync(BACKUP_SETTINGS_FILE, rawData, "utf-8");
          }
        } catch (_) {}
      }

      return {
        ...defaultSettings,
        ...parsed,
        companies: parsed.companies && parsed.companies.length > 0 ? parsed.companies : defaultCompanies,
        userCompanies: {
          ...defaultUserCompanies,
          ...(parsed.userCompanies || {}),
        },
        invoiceCompanies: { ...(parsed.invoiceCompanies || {}) },
        productCompanies: { ...(parsed.productCompanies || {}) },
        orderCompanies: { ...(parsed.orderCompanies || {}) },
        quoteCompanies: { ...(parsed.quoteCompanies || {}) },
        userCredentials: {
          ...defaultSettings.userCredentials,
          ...(parsed.userCredentials || {}),
        },
        roleModulePermissions: {
          ADMIN: {
            ...defaultSettings.roleModulePermissions.ADMIN,
            ...(parsed.roleModulePermissions?.ADMIN || {}),
          },
          TRABAJADOR: {
            ...defaultSettings.roleModulePermissions.TRABAJADOR,
            ...(parsed.roleModulePermissions?.TRABAJADOR || {}),
          },
        },
        roleFeaturePermissions: {
          ADMIN: {
            ...defaultSettings.roleFeaturePermissions.ADMIN,
            ...(parsed.roleFeaturePermissions?.ADMIN || {}),
          },
          TRABAJADOR: {
            ...defaultSettings.roleFeaturePermissions.TRABAJADOR,
            ...(parsed.roleFeaturePermissions?.TRABAJADOR || {}),
          },
        },
        backupSettings: {
          ...defaultBackupSettings,
          ...(parsed.backupSettings || {}),
        },
        authorCredit: {
          ...defaultSettings.authorCredit,
          ...(parsed.authorCredit || {}),
        },
      };
    }
  } catch (e) {
    console.error("Error parsing settings data:", e);
  }
  return defaultSettings;
}

export function saveSettings(settings: any) {
  try {
    const payload = JSON.stringify(settings, null, 2);
    const tempFile = `${SETTINGS_FILE}.tmp`;

    // 1. Escritura atómica para evitar archivos corruptos en caídas de energía
    fs.writeFileSync(tempFile, payload, "utf-8");
    fs.renameSync(tempFile, SETTINGS_FILE);

    // 2. Espejo de respaldo persistente inmediato
    fs.writeFileSync(BACKUP_SETTINGS_FILE, payload, "utf-8");
  } catch (e) {
    console.error("Error saving settings file:", e);
  }
}


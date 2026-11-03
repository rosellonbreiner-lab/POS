import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "workshop-settings.json");

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
  createdAt?: string;
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
};

export function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(data);
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
      };
    }
  } catch (e) {
    console.error("Error reading settings file:", e);
  }
  return defaultSettings;
}

export function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving settings file:", e);
  }
}


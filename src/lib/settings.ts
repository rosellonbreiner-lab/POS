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
  {
    id: "comp-tienda",
    name: "Minimarket & Tienda La 14",
    type: "TIENDA_COMERCIO",
    slogan: "Abarrotes, Bebidas, Víveres y Productos para el Hogar",
    nit: "800.123.456-7",
    phone: "(+57) 310 987 6543",
    address: "Carrera 9 # 12-30, Maicao",
    logoUrl: "",
    receiptMessage: "¡Gracias por su compra en Minimarket La 14! Vuelva pronto.",
    createdAt: "2026-11-03T00:00:00.000Z",
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


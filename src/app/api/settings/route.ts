import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "workshop-settings.json");

export const defaultSettings = {
  name: "MotoTaller TS7",
  slogan: "Especialistas en Reparación y Repuestos Multimarca",
  nit: "901.452.889-1",
  phone: "(+57) 300 123 4567",
  address: "Calle 16 # 10-45, Maicao, La Guajira",
  logoUrl: "",
  receiptMessage: "¡Gracias por confiar en nosotros! Garantía de 30 días en repuestos con este ticket.",
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
      "eliminarRepuestos": true,
      "descuentosVentas": true,
      "verCostosUtilidad": true,
      "arqueoCaja": true,
      "escanerCamara": true,
    },
    TRABAJADOR: {
      "eliminarRepuestos": false,
      "descuentosVentas": true,
      "verCostosUtilidad": false,
      "arqueoCaja": false,
      "escanerCamara": true,
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

export async function GET() {
  const user = await getCurrentUser();
  const config = getSettings();

  // Si el usuario no es SUPERADMIN, no exponer las contraseñas en claro
  if (!user || user.role !== "SUPERADMIN") {
    const { userCredentials, ...safeConfig } = config;
    return NextResponse.json({ config: safeConfig });
  }

  return NextResponse.json({ config });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "No tienes permisos para modificar la configuración." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const current = getSettings();

    // Solo el SUPERADMIN puede cambiar permisos de módulos y credenciales
    if (user.role !== "SUPERADMIN") {
      delete body.roleModulePermissions;
      delete body.roleFeaturePermissions;
      delete body.userCredentials;
    }

    const updated = {
      ...current,
      ...body,
    };

    saveSettings(updated);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

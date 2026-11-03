import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings, defaultSettings, Company } from "@/lib/settings";

export { getSettings, saveSettings, defaultSettings };
export type { Company };

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

    // Solo el SUPERADMIN puede cambiar permisos de módulos, credenciales y empresas
    if (user.role !== "SUPERADMIN") {
      delete body.roleModulePermissions;
      delete body.roleFeaturePermissions;
      delete body.userCredentials;
      delete body.companies;
      delete body.userCompanies;
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

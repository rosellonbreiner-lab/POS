import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { UserRole } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede ver la lista de usuarios y credenciales." },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const settings = getSettings();
    const credentials = settings.userCredentials || {};
    const userCompanies = settings.userCompanies || {};
    const companies = settings.companies || [];

    const usersWithCredentials = users.map((u) => {
      const emailLower = u.email.toLowerCase();
      const assignedCompId = userCompanies[emailLower] || (u.role === "SUPERADMIN" ? "ALL" : companies[0]?.id || "");
      const foundCompany = companies.find((c: any) => c.id === assignedCompId);

      return {
        ...u,
        password: credentials[emailLower] || credentials[u.email] || "No registrada",
        companyId: assignedCompId,
        companyName: assignedCompId === "ALL" ? "Todas las Empresas (Superadmin)" : (foundCompany?.name || "Empresa por Defecto"),
        companyType: foundCompany?.type || (assignedCompId === "ALL" ? "GLOBAL" : "TALLER_MOTOS"),
      };
    });

    return NextResponse.json({
      users: usersWithCredentials,
      companies,
    });
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Solo el Super Usuario puede registrar nuevos usuarios." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password, role, companyId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nombre, correo, contraseña y rol son obligatorios." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con este correo electrónico." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailClean,
        passwordHash,
        role: role as UserRole,
        forcePasswordReset: false,
      },
    });

    // Guardar credenciales y empresa asignada en workshop-settings.json
    const settings = getSettings();
    const updatedCredentials = {
      ...(settings.userCredentials || {}),
      [emailClean]: password,
    };

    const targetCompanyId = role === "SUPERADMIN"
      ? "ALL"
      : (companyId || settings.companies?.[0]?.id || "comp-mototaller");

    const updatedUserCompanies = {
      ...(settings.userCompanies || {}),
      [emailClean]: targetCompanyId,
    };

    saveSettings({
      ...settings,
      userCredentials: updatedCredentials,
      userCompanies: updatedUserCompanies,
    });

    const assignedCompany = settings.companies?.find((c: any) => c.id === targetCompanyId);

    return NextResponse.json({
      success: true,
      message: `Usuario ${newUser.name} creado exitosamente y asignado a "${assignedCompany?.name || targetCompanyId}".`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password,
        companyId: targetCompanyId,
        companyName: assignedCompany?.name || targetCompanyId,
      },
    });
  } catch (error: any) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

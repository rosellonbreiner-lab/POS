import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { getSettings, saveSettings } from "@/app/api/settings/route";
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

    const usersWithCredentials = users.map((u) => ({
      ...u,
      password: credentials[u.email.toLowerCase()] || credentials[u.email] || "No registrada",
    }));

    return NextResponse.json({ users: usersWithCredentials });
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
    const { name, email, password, role } = body;

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

    // Guardar la credencial en el archivo de configuración para que el Superadmin pueda consultarla
    const settings = getSettings();
    const updatedCredentials = {
      ...(settings.userCredentials || {}),
      [emailClean]: password,
    };
    saveSettings({ ...settings, userCredentials: updatedCredentials });

    return NextResponse.json({
      success: true,
      message: `Usuario ${newUser.name} creado exitosamente.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password,
      },
    });
  } catch (error: any) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


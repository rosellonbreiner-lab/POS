import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { createAuditLog } from "@/lib/audit";
import { UserRole } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede modificar usuarios." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, email, role, newPassword, companyId } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "El usuario a modificar no existe." }, { status: 404 });
    }

    const updateData: any = {};
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    let updatedEmail = existingUser.email;
    if (email && email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailClean = email.trim().toLowerCase();
      const duplicate = await prisma.user.findUnique({ where: { email: emailClean } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso por otro usuario." },
          { status: 400 }
        );
      }
      updateData.email = emailClean;
      updatedEmail = emailClean;
    }

    if (role) {
      updateData.role = role as UserRole;
    }

    const settings = getSettings();
    const credentials = { ...(settings.userCredentials || {}) };
    const userCompanies = { ...(settings.userCompanies || {}) };

    if (newPassword && newPassword.trim()) {
      updateData.passwordHash = await hashPassword(newPassword.trim());
      updateData.forcePasswordReset = false;
      credentials[updatedEmail.toLowerCase()] = newPassword.trim();
    } else if (updatedEmail.toLowerCase() !== existingUser.email.toLowerCase()) {
      // Si cambió el correo pero conservó la contraseña, mover la credencial al nuevo correo
      const currentPass = credentials[existingUser.email.toLowerCase()] || credentials[existingUser.email];
      if (currentPass) {
        credentials[updatedEmail.toLowerCase()] = currentPass;
        delete credentials[existingUser.email.toLowerCase()];
        delete credentials[existingUser.email];
      }
    }

    // Actualizar empresa asignada si se especificó
    if (companyId) {
      userCompanies[updatedEmail.toLowerCase()] = companyId;
    } else if (updatedEmail.toLowerCase() !== existingUser.email.toLowerCase()) {
      const currentComp = userCompanies[existingUser.email.toLowerCase()] || userCompanies[existingUser.email];
      if (currentComp) {
        userCompanies[updatedEmail.toLowerCase()] = currentComp;
        delete userCompanies[existingUser.email.toLowerCase()];
        delete userCompanies[existingUser.email];
      }
    }

    saveSettings({ ...settings, userCredentials: credentials, userCompanies });

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: currentUser.id,
      action: "USER_UPDATED",
      resource: "User",
      resourceId: updated.id,
      details: {
        updatedUserId: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        companyId: companyId || userCompanies[updated.email.toLowerCase()],
        passwordChanged: Boolean(newPassword && newPassword.trim()),
      },
    });

    const assignedCompany = (settings.companies || []).find(
      (c: any) => c.id === userCompanies[updated.email.toLowerCase()]
    );

    return NextResponse.json({
      success: true,
      message: `Usuario "${updated.name}" actualizado correctamente.`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        companyId: userCompanies[updated.email.toLowerCase()],
        companyName: assignedCompany?.name || userCompanies[updated.email.toLowerCase()],
        password: credentials[updated.email.toLowerCase()] || "••••••••",
      },
    });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede eliminar usuarios." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
  }

  // Prevenir que el Superadmin se elimine a sí mismo
  if (currentUser.id === id) {
    return NextResponse.json(
      { error: "Por seguridad, no puedes eliminar tu propia cuenta de Super Usuario activa." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: true,
        invoices: true,
        quotes: true,
        workOrders: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "El usuario a eliminar no existe." }, { status: 404 });
    }

    // Ejecutar eliminación atómica
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar sesiones activas del usuario para forzar cierre inmediato
      await tx.session.deleteMany({ where: { userId: id } });

      // 2. Si el usuario creó facturas, cotizaciones u órdenes históricas, reasignarlas al superadmin
      if (existingUser.invoices.length > 0) {
        await tx.invoice.updateMany({
          where: { userId: id },
          data: { userId: currentUser.id },
        });
      }

      if (existingUser.quotes.length > 0) {
        await tx.quote.updateMany({
          where: { userId: id },
          data: { userId: currentUser.id },
        });
      }

      if (existingUser.workOrders.length > 0) {
        await tx.workOrder.updateMany({
          where: { userId: id },
          data: { userId: currentUser.id },
        });
      }

      // 3. Eliminar usuario de la base de datos
      await tx.user.delete({ where: { id } });
    });

    // 4. Limpiar credenciales y empresa del archivo de configuración
    const settings = getSettings();
    const credentials = { ...(settings.userCredentials || {}) };
    const userCompanies = { ...(settings.userCompanies || {}) };

    delete credentials[existingUser.email.toLowerCase()];
    delete credentials[existingUser.email];
    delete userCompanies[existingUser.email.toLowerCase()];
    delete userCompanies[existingUser.email];

    saveSettings({ ...settings, userCredentials: credentials, userCompanies });

    // 5. Registrar en auditoría
    await createAuditLog({
      userId: currentUser.id,
      action: "USER_DELETED",
      resource: "User",
      resourceId: id,
      details: {
        deletedUserEmail: existingUser.email,
        deletedUserName: existingUser.name,
        deletedUserRole: existingUser.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: `El usuario "${existingUser.name}" (${existingUser.email}) ha sido eliminado definitivamente del sistema.`,
    });
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar el usuario." },
      { status: 500 }
    );
  }
}

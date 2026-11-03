import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings, Company } from "@/lib/settings";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede editar información de empresas." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de empresa requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const settings = getSettings();
    const companies: Company[] = settings.companies || [];

    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "La empresa no existe." }, { status: 404 });
    }

    const currentCompany = companies[index];
    const updatedCompany: Company = {
      ...currentCompany,
      name: body.name !== undefined ? body.name.trim() : currentCompany.name,
      type: body.type !== undefined ? body.type : currentCompany.type,
      slogan: body.slogan !== undefined ? body.slogan.trim() : currentCompany.slogan,
      nit: body.nit !== undefined ? body.nit.trim() : currentCompany.nit,
      phone: body.phone !== undefined ? body.phone.trim() : currentCompany.phone,
      address: body.address !== undefined ? body.address.trim() : currentCompany.address,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : currentCompany.logoUrl,
      receiptMessage: body.receiptMessage !== undefined ? body.receiptMessage.trim() : currentCompany.receiptMessage,
    };

    companies[index] = updatedCompany;

    // Si se modificó la empresa principal por defecto, sincronizar campos raíz de settings
    if (id === "comp-mototaller" || index === 0) {
      settings.name = updatedCompany.name;
      settings.slogan = updatedCompany.slogan || "";
      settings.nit = updatedCompany.nit;
      settings.phone = updatedCompany.phone;
      settings.address = updatedCompany.address;
      if (updatedCompany.logoUrl) settings.logoUrl = updatedCompany.logoUrl;
      if (updatedCompany.receiptMessage) settings.receiptMessage = updatedCompany.receiptMessage;
    }

    saveSettings({ ...settings, companies });

    await createAuditLog({
      userId: user.id,
      action: "COMPANY_UPDATED",
      resource: "Company",
      resourceId: id,
      details: {
        companyId: id,
        name: updatedCompany.name,
        type: updatedCompany.type,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Empresa "${updatedCompany.name}" actualizada con éxito.`,
      company: updatedCompany,
    });
  } catch (error: any) {
    console.error("Error al actualizar empresa:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar empresa" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede eliminar empresas." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de empresa requerido" }, { status: 400 });
  }

  try {
    const settings = getSettings();
    const companies: Company[] = settings.companies || [];

    if (companies.length <= 1) {
      return NextResponse.json(
        { error: "No puedes eliminar la única empresa registrada en el sistema." },
        { status: 400 }
      );
    }

    const companyToDelete = companies.find((c) => c.id === id);
    if (!companyToDelete) {
      return NextResponse.json({ error: "Empresa no encontrada." }, { status: 404 });
    }

    // Verificar si hay usuarios asignados a esta empresa
    const userCompanies = settings.userCompanies || {};
    const assignedEmails = Object.keys(userCompanies).filter((email) => userCompanies[email] === id);

    if (assignedEmails.length > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la empresa porque tiene ${assignedEmails.length} usuario(s) asignado(s) (${assignedEmails.join(", ")}). Reasigna los usuarios primero.`,
        },
        { status: 400 }
      );
    }

    const filteredCompanies = companies.filter((c) => c.id !== id);
    saveSettings({ ...settings, companies: filteredCompanies });

    await createAuditLog({
      userId: user.id,
      action: "COMPANY_DELETED",
      resource: "Company",
      resourceId: id,
      details: {
        companyId: id,
        name: companyToDelete.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Empresa "${companyToDelete.name}" eliminada exitosamente.`,
    });
  } catch (error: any) {
    console.error("Error al eliminar empresa:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar empresa" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings, Company } from "@/lib/settings";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const settings = getSettings();
  const companies: Company[] = settings.companies || [];

  // Superadmin ve todas las empresas. Otros usuarios ven su empresa asignada o la lista general
  return NextResponse.json({
    companies,
    userCompanyId: settings.userCompanies?.[user.email.toLowerCase()] || (user.role === "SUPERADMIN" ? "ALL" : companies[0]?.id),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede registrar nuevas empresas o microempresas." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, type, slogan, nit, phone, address, logoUrl, receiptMessage } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre de la empresa es obligatorio." }, { status: 400 });
    }

    if (!nit || !nit.trim()) {
      return NextResponse.json({ error: "El NIT o identificación fiscal es obligatorio." }, { status: 400 });
    }

    const validTypes = ["TALLER_MOTOS", "TIENDA_COMERCIO", "FERRETERIA", "COMERCIO_GENERAL"];
    const businessType = validTypes.includes(type) ? type : "TIENDA_COMERCIO";

    const settings = getSettings();
    const companies: Company[] = settings.companies || [];

    // Generar ID único amigable
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 20);
    const newId = `comp-${slug}-${Date.now().toString().slice(-4)}`;

    const newCompany: Company = {
      id: newId,
      name: name.trim(),
      type: businessType,
      slogan: slogan ? slogan.trim() : "",
      nit: nit.trim(),
      phone: phone ? phone.trim() : "",
      address: address ? address.trim() : "",
      logoUrl: logoUrl || "",
      receiptMessage: receiptMessage ? receiptMessage.trim() : "¡Gracias por su compra! Vuelva pronto.",
      createdAt: new Date().toISOString(),
    };

    companies.push(newCompany);
    saveSettings({ ...settings, companies });

    await createAuditLog({
      userId: user.id,
      action: "COMPANY_CREATED",
      resource: "Company",
      resourceId: newId,
      details: {
        name: newCompany.name,
        type: newCompany.type,
        nit: newCompany.nit,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Empresa "${newCompany.name}" registrada exitosamente.`,
      company: newCompany,
    });
  } catch (error: any) {
    console.error("Error al registrar empresa:", error);
    return NextResponse.json({ error: error.message || "Error al crear empresa" }, { status: 500 });
  }
}

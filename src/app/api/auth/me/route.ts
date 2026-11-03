import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const settings = getSettings();
  const companies = settings.companies || [];
  const userCompanies = settings.userCompanies || {};

  const userEmailLower = user.email.toLowerCase();
  let assignedCompanyId = userCompanies[userEmailLower];

  if (!assignedCompanyId) {
    assignedCompanyId = user.role === "SUPERADMIN" ? "ALL" : (companies[0]?.id || "comp-mototaller");
  }

  let assignedCompany = null;
  if (assignedCompanyId === "ALL") {
    // Para Superadmin, empresa por defecto es la primera
    assignedCompany = companies[0] || null;
  } else {
    assignedCompany = companies.find((c: any) => c.id === assignedCompanyId) || companies[0] || null;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: assignedCompanyId,
      company: assignedCompany,
    },
    companies: user.role === "SUPERADMIN" ? companies : (assignedCompany ? [assignedCompany] : []),
  });
}

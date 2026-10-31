import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. La auditoría de seguridad está reservada exclusivamente para el Super Usuario." },
      { status: 403 }
    );
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, role: true },
      },
    },
  });

  return NextResponse.json({ logs });
}

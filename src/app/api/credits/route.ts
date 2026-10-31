import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const credits = await prisma.credit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        invoice: {
          include: {
            items: { include: { product: true } },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Calcular KPIs de cartera y créditos
    const totalReceivable = credits
      .filter((c) => c.status !== "PAGADO")
      .reduce((sum, c) => sum + c.remainingAmount, 0);

    const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0);
    const pendingCount = credits.filter((c) => c.status !== "PAGADO").length;
    const paidCount = credits.filter((c) => c.status === "PAGADO").length;

    return NextResponse.json({
      credits,
      stats: {
        totalReceivable,
        totalPaid,
        pendingCount,
        paidCount,
        totalCredits: credits.length,
      },
    });
  } catch (error: any) {
    console.error("Error al listar créditos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


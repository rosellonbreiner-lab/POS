import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const credit = await prisma.credit.findUnique({
    where: { id },
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

  if (!credit) {
    return NextResponse.json({ error: "Crédito no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ credit });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const paymentType = body.paymentType || "EFECTIVO";
    const notes = body.notes || "";

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "El monto del abono debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const credit = await tx.credit.findUnique({
        where: { id },
        include: { customer: true },
      });

      if (!credit) {
        throw new Error("Crédito no encontrado");
      }

      if (credit.status === "PAGADO" || credit.remainingAmount <= 0) {
        throw new Error("Este crédito ya se encuentra totalmente saldado y pagado.");
      }

      if (amount > credit.remainingAmount) {
        throw new Error(
          `El valor del abono ($${amount.toLocaleString("es-CO")}) supera el saldo pendiente de $${credit.remainingAmount.toLocaleString("es-CO")}.`
        );
      }

      const previousBalance = credit.remainingAmount;
      const newPaidAmount = credit.paidAmount + amount;
      const newRemainingAmount = credit.totalAmount - newPaidAmount;
      const isFullyPaid = newRemainingAmount === 0;
      const newStatus = isFullyPaid ? "PAGADO" : "PARCIAL";

      // 1. Crear registro de abono
      const payment = await tx.creditPayment.create({
        data: {
          creditId: id,
          amount,
          paymentType,
          previousBalance,
          newBalance: newRemainingAmount,
          notes,
          receivedBy: user.name,
        },
      });

      // 2. Actualizar el estado del crédito
      const updatedCredit = await tx.credit.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
        },
        include: {
          customer: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
      });

      // 3. Si se pagó por completo y tiene factura vinculada, actualizar factura a PAGADA
      if (isFullyPaid && credit.invoiceId) {
        await tx.invoice.update({
          where: { id: credit.invoiceId },
          data: { status: "PAGADA" },
        });
      }

      // 4. Registro de auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: isFullyPaid ? "CREDIT_FULLY_PAID" : "CREDIT_PAYMENT_RECEIVED",
          resource: "Credit",
          resourceId: id,
          details: {
            creditConsecutive: credit.consecutive,
            customerName: credit.customer?.name,
            amount,
            paymentType,
            previousBalance,
            newBalance: newRemainingAmount,
            status: newStatus,
          },
        },
      });

      return {
        payment,
        credit: updatedCredit,
        receiptInfo: {
          creditConsecutive: credit.consecutive,
          customerName: credit.customer?.name,
          customerPhone: credit.customer?.phone,
          plate: credit.plate,
          amount,
          paymentType,
          previousBalance,
          newBalance: newRemainingAmount,
          date: new Date().toISOString(),
          receivedBy: user.name,
        },
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error al registrar abono:", error);
    return NextResponse.json(
      { error: error?.message || "Error al procesar el abono" },
      { status: 400 }
    );
  }
}

// ELIMINAR DEUDA / CRÉDITO POR COMPLETO
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "No tienes permisos para eliminar créditos de cartera." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de crédito requerido" }, { status: 400 });
  }

  try {
    const credit = await prisma.credit.findUnique({
      where: { id },
      include: {
        customer: true,
        payments: true,
        invoice: {
          include: { items: true },
        },
      },
    });

    if (!credit) {
      return NextResponse.json({ error: "Crédito no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Eliminar abonos del crédito
      await tx.creditPayment.deleteMany({ where: { creditId: id } });

      // 2. Si tiene factura a crédito vinculada, eliminar sus items y factura
      if (credit.invoiceId) {
        await tx.creditNote.deleteMany({ where: { invoiceId: credit.invoiceId } });
        await tx.invoiceItem.deleteMany({ where: { invoiceId: credit.invoiceId } });
        await tx.credit.delete({ where: { id } });
        await tx.invoice.delete({ where: { id: credit.invoiceId } });
      } else {
        await tx.credit.delete({ where: { id } });
      }

      // 3. Auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREDIT_PURGED",
          resource: "Credit",
          resourceId: id,
          details: {
            consecutive: credit.consecutive,
            customerName: credit.customer?.name,
            totalAmount: credit.totalAmount,
            deletedBy: user.name,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `El crédito CRE-${credit.consecutive} y sus abonos han sido eliminados por completo.`,
    });
  } catch (error: any) {
    console.error("Error al eliminar crédito:", error);
    return NextResponse.json(
      { error: error?.message || "Error al eliminar el crédito." },
      { status: 500 }
    );
  }
}



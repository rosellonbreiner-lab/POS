import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "No tienes permisos para anular o eliminar ventas." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de factura requerido" }, { status: 400 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        credit: {
          include: { payments: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "La factura no existe." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Reponer el stock de los productos vendidos
      for (const item of invoice.items) {
        if (item.productId && item.quantity > 0) {
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const restoredStock = prod.currentStock + item.quantity;
            await tx.product.update({
              where: { id: prod.id },
              data: { currentStock: restoredStock },
            });

            await tx.stockMovement.create({
              data: {
                productId: prod.id,
                type: "AJUSTE_POSITIVO",
                quantity: item.quantity,
                previousQty: prod.currentStock,
                newQty: restoredStock,
                reason: `Eliminación de Factura INV-${invoice.consecutive} (Reingreso de stock)`,
              },
            });
          }
        }
      }

      // 2. Si tenía crédito asociado, eliminar sus abonos y el crédito
      if (invoice.credit) {
        await tx.creditPayment.deleteMany({ where: { creditId: invoice.credit.id } });
        await tx.credit.delete({ where: { id: invoice.credit.id } });
      }

      // 3. Eliminar notas crédito vinculadas si existieran
      await tx.creditNote.deleteMany({ where: { invoiceId: id } });

      // 4. Eliminar ítems de la factura
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      // 5. Eliminar la factura físicamente
      await tx.invoice.delete({ where: { id } });

      // 6. Registro de auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "INVOICE_PURGED",
          resource: "Invoice",
          resourceId: id,
          details: {
            consecutive: invoice.consecutive,
            total: invoice.total,
            deletedBy: user.name,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Venta INV-${invoice.consecutive} y sus registros han sido eliminados por completo y el stock fue repuesto.`,
    });
  } catch (error: any) {
    console.error("Error al eliminar venta:", error);
    return NextResponse.json(
      { error: error?.message || "Error al eliminar la venta." },
      { status: 500 }
    );
  }
}


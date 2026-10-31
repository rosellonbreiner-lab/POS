import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Acceso denegado. Solo el Super Usuario puede restablecer los datos del sistema." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { scope, confirmationCode, resetStockToZero } = body;

    // Código de confirmación obligatorio para evitar ejecuciones accidentales
    if (confirmationCode !== "LIMPIAR-SISTEMA-2026") {
      return NextResponse.json(
        { error: "Código de confirmación incorrecto. Escribe 'LIMPIAR-SISTEMA-2026' para confirmar." },
        { status: 400 }
      );
    }

    const summary: Record<string, number> = {};

    await prisma.$transaction(async (tx) => {
      // 1. LIMPIEZA DE TRANSACCIONES OPERATIVAS Y VENTAS
      if (scope === "ALL" || scope === "SALES_AND_CREDITS") {
        // Eliminar abonos de créditos
        const deletedCreditPayments = await tx.creditPayment.deleteMany({});
        summary.abonosEliminados = deletedCreditPayments.count;

        // Eliminar créditos
        const deletedCredits = await tx.credit.deleteMany({});
        summary.creditosEliminados = deletedCredits.count;

        // Eliminar notas crédito
        const deletedCreditNotes = await tx.creditNote.deleteMany({});
        summary.notasCreditoEliminadas = deletedCreditNotes.count;

        // Eliminar items de facturas
        const deletedInvoiceItems = await tx.invoiceItem.deleteMany({});
        summary.itemsFacturaEliminados = deletedInvoiceItems.count;

        // Eliminar facturas
        const deletedInvoices = await tx.invoice.deleteMany({});
        summary.facturasEliminadas = deletedInvoices.count;
      }

      // 2. LIMPIEZA DE ÓRDENES Y COTIZACIONES
      if (scope === "ALL" || scope === "ORDERS_AND_QUOTES") {
        // Eliminar items de órdenes
        const deletedOrderItems = await tx.workOrderItem.deleteMany({});
        summary.itemsOrdenesEliminados = deletedOrderItems.count;

        // Eliminar órdenes de trabajo
        const deletedOrders = await tx.workOrder.deleteMany({});
        summary.ordenesEliminadas = deletedOrders.count;

        // Eliminar items de cotizaciones
        const deletedQuoteItems = await tx.quoteItem.deleteMany({});
        summary.itemsCotizacionesEliminados = deletedQuoteItems.count;

        // Eliminar cotizaciones
        const deletedQuotes = await tx.quote.deleteMany({});
        summary.cotizacionesEliminadas = deletedQuotes.count;
      }

      // 3. LIMPIEZA DE KARDEX Y MOVIMIENTOS
      if (scope === "ALL") {
        const deletedMovements = await tx.stockMovement.deleteMany({});
        summary.movimientosKardexEliminados = deletedMovements.count;

        // Si el usuario eligió reiniciar el stock a 0
        if (resetStockToZero) {
          await tx.product.updateMany({
            data: { currentStock: 0 },
          });
          await tx.productLocation.updateMany({
            data: { quantity: 0 },
          });
          summary.stockReiniciadoACero = 1;
        }
      }

      // 4. Registro de auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "SYSTEM_DATA_PURGED",
          resource: "System",
          resourceId: "DATABASE_RESET",
          details: {
            scope,
            resetStockToZero: Boolean(resetStockToZero),
            executedBy: user.name,
            summary,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Limpieza del sistema completada con éxito. Todos los datos de prueba han sido eliminados.",
      summary,
    });
  } catch (error: any) {
    console.error("Error al limpiar datos del sistema:", error);
    return NextResponse.json(
      { error: error?.message || "Error al procesar la limpieza del sistema." },
      { status: 500 }
    );
  }
}


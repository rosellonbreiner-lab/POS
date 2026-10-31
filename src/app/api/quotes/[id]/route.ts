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
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      motorcycle: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({ quote });
}

// CONVERTIR COTIZACIÓN A VENTA OFICIAL (Se borra la cotización para no acumular ni salir como convertida)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const { action, paymentType } = body;

    if (action === "CONVERT_TO_SALE") {
      const result = await prisma.$transaction(async (tx) => {
        const quote = await tx.quote.findUnique({
          where: { id },
          include: { items: true, customer: true, motorcycle: true },
        });

        if (!quote) throw new Error("Cotización no encontrada");

        // 1. Descontar stock de los repuestos que tengan productId
        for (const item of quote.items) {
          if (item.productId) {
            const prod = await tx.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              if (prod.currentStock < item.quantity) {
                throw new Error(
                  `Stock insuficiente para "${prod.name}". Solicitados: ${item.quantity}, Disponibles: ${prod.currentStock}`
                );
              }

              await tx.product.update({
                where: { id: prod.id },
                data: { currentStock: prod.currentStock - item.quantity },
              });

              await tx.stockMovement.create({
                data: {
                  productId: prod.id,
                  type: "SALIDA_VENTA",
                  quantity: -item.quantity,
                  previousQty: prod.currentStock,
                  newQty: prod.currentStock - item.quantity,
                  reason: `Venta originada de Cotización #${quote.consecutive}`,
                },
              });
            }
          }
        }

        // 2. Consecutivo para la factura
        const lastInvoice = await tx.invoice.findFirst({
          orderBy: { consecutive: "desc" },
        });
        const nextInvoiceConsecutive = lastInvoice ? lastInvoice.consecutive + 1 : 1001;

        const isCredit = paymentType === "CREDITO";

        // 3. Crear Factura oficial (PAGADA o PENDIENTE si es crédito)
        const invoice = await tx.invoice.create({
          data: {
            consecutive: nextInvoiceConsecutive,
            customerId: quote.customerId,
            userId: user.id,
            status: isCredit ? "PENDIENTE" : "PAGADA",
            subtotal: quote.subtotal,
            taxAmount: quote.taxAmount,
            total: quote.total,
            paymentType: paymentType || "EFECTIVO",
            items: {
              create: quote.items
                .filter((i) => i.productId !== null)
                .map((i) => ({
                  productId: i.productId as string,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                  taxRate: 19,
                  totalPrice: i.totalPrice,
                })),
            },
          },
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        });

        // Si es a crédito, registrar en el modelo Credit
        if (isCredit && quote.customerId) {
          const lastCredit = await tx.credit.findFirst({
            orderBy: { consecutive: "desc" },
          });
          const nextCreditConsecutive = lastCredit ? lastCredit.consecutive + 1 : 1001;

          await tx.credit.create({
            data: {
              consecutive: nextCreditConsecutive,
              invoiceId: invoice.id,
              customerId: quote.customerId,
              plate: quote.motorcycle?.plate || null,
              totalAmount: quote.total,
              paidAmount: 0,
              remainingAmount: quote.total,
              status: "PENDIENTE",
              notes: `Crédito originado de Cotización #${quote.consecutive}`,
            },
          });
        }

        // 4. Auditoría
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: isCredit ? "QUOTE_CONVERTED_TO_CREDIT" : "QUOTE_CONVERTED_TO_SALE",
            resource: "Quote",
            resourceId: id,
            details: {
              quoteConsecutive: quote.consecutive,
              invoiceConsecutive: invoice.consecutive,
              total: quote.total,
              paymentType: paymentType || "EFECTIVO",
            },
          },
        });

        // 5. BORRAR LA COTIZACIÓN: Ya pasó a ser venta oficial, se elimina para que no acumule ni aparezca 'CONVERTIDA'
        await tx.quoteItem.deleteMany({ where: { quoteId: id } });
        await tx.quote.delete({ where: { id } });

        return {
          invoice,
          quoteInfo: {
            consecutive: quote.consecutive,
            customer: quote.customer,
            motorcycle: quote.motorcycle,
            items: quote.items,
            total: quote.total,
          },
        };
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error al convertir cotización:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// BORRAR COTIZACIÓN
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    await prisma.quote.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "QUOTE_DELETED",
        resource: "Quote",
        resourceId: id,
        details: { consecutive: quote.consecutive },
      },
    });

    return NextResponse.json({ success: true, message: "Cotización eliminada correctamente" });
  } catch (error: any) {
    console.error("Error al borrar cotización:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

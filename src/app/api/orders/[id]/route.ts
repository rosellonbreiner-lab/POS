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
  const order = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      motorcycle: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({ order });
}

// Agregar o quitar repuestos dinámicamente, o dar por terminada/facturada la orden
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const { action, itemId, productId, quantity, unitPrice: customUnitPrice, paymentType } = body;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.workOrder.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          customer: true,
          motorcycle: true,
        },
      });
      if (!order) throw new Error("Orden no encontrada");

      // 1. Quitar repuesto individual
      if (action === "REMOVE_ITEM") {
        const item = await tx.workOrderItem.findUnique({
          where: { id: itemId },
        });
        if (!item) throw new Error("Ítem no encontrado en la orden");

        // Devolver al stock
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          await tx.product.update({
            where: { id: prod.id },
            data: { currentStock: prod.currentStock + item.quantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: prod.id,
              type: "AJUSTE_POSITIVO",
              quantity: item.quantity,
              previousQty: prod.currentStock,
              newQty: prod.currentStock + item.quantity,
              reason: `Repuesto quitado de Orden #${order.consecutive}`,
            },
          });
        }

        await tx.workOrderItem.delete({ where: { id: itemId } });

        // Recalcular orden (solo repuestos)
        const remainingItems = await tx.workOrderItem.findMany({ where: { orderId: id } });
        const partsCost = remainingItems.reduce((acc, i) => acc + i.totalPrice, 0);
        const total = partsCost;

        return tx.workOrder.update({
          where: { id },
          data: { partsCost, laborCost: 0, total },
          include: { items: { include: { product: true } }, customer: true, motorcycle: true },
        });
      }

      // 2. Agregar repuesto adicional
      if (action === "ADD_ITEM") {
        const prod = await tx.product.findUnique({ where: { id: productId } });
        if (!prod || prod.currentStock < quantity) {
          throw new Error(`Stock insuficiente para "${prod?.name || "repuesto"}". Disponible: ${prod?.currentStock || 0}`);
        }

        // Descontar del stock
        await tx.product.update({
          where: { id: prod.id },
          data: { currentStock: prod.currentStock - quantity },
        });

        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            type: "SALIDA_ORDEN_TRABAJO",
            quantity: -quantity,
            previousQty: prod.currentStock,
            newQty: prod.currentStock - quantity,
            reason: `Repuesto extra para Orden #${order.consecutive}`,
          },
        });

        const effectivePrice =
          typeof customUnitPrice === "number" && customUnitPrice >= 0
            ? customUnitPrice
            : prod.salePrice;

        await tx.workOrderItem.create({
          data: {
            orderId: id,
            productId: prod.id,
            quantity,
            unitPrice: effectivePrice,
            totalPrice: effectivePrice * quantity,
          },
        });

        const allItems = await tx.workOrderItem.findMany({ where: { orderId: id } });
        const partsCost = allItems.reduce((acc, i) => acc + i.totalPrice, 0);
        const total = partsCost;

        return tx.workOrder.update({
          where: { id },
          data: { partsCost, laborCost: 0, total },
          include: { items: { include: { product: true } }, customer: true, motorcycle: true },
        });
      }

      // 3. DAR POR TERMINADA Y FACTURAR REPUESTOS
      if (action === "COMPLETE_AND_INVOICE") {
        if (!order.items || order.items.length === 0) {
          throw new Error("No se puede finalizar una orden sin repuestos asignados.");
        }

        // Consecutivo para factura
        const lastInvoice = await tx.invoice.findFirst({
          orderBy: { consecutive: "desc" },
        });
        const nextInvoiceConsecutive = lastInvoice ? lastInvoice.consecutive + 1 : 1001;

        const totalVenta = order.items.reduce((acc, i) => acc + i.totalPrice, 0);

        const isCredit = paymentType === "CREDITO";

        // Crear Factura oficial de Venta POS con los repuestos de la orden
        const invoice = await tx.invoice.create({
          data: {
            consecutive: nextInvoiceConsecutive,
            customerId: order.customerId,
            userId: user.id,
            status: isCredit ? "PENDIENTE" : "PAGADA",
            subtotal: totalVenta,
            taxAmount: Math.round(totalVenta * 0.19),
            total: totalVenta,
            paymentType: paymentType || "EFECTIVO",
            items: {
              create: order.items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                taxRate: 19,
                totalPrice: i.totalPrice,
              })),
            },
          },
        });

        // Si se eligió pagar a Crédito, crear registro de Crédito
        if (isCredit) {
          const lastCredit = await tx.credit.findFirst({
            orderBy: { consecutive: "desc" },
          });
          const nextCreditConsecutive = lastCredit ? lastCredit.consecutive + 1 : 1001;

          await tx.credit.create({
            data: {
              consecutive: nextCreditConsecutive,
              invoiceId: invoice.id,
              customerId: order.customerId,
              plate: order.motorcycle?.plate || null,
              totalAmount: totalVenta,
              paidAmount: 0,
              remainingAmount: totalVenta,
              status: "PENDIENTE",
              notes: `Crédito originado de Orden de Trabajo #${order.consecutive}`,
            },
          });
        }

        // Registrar en Auditoría
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: isCredit ? "WORK_ORDER_CREDIT_INVOICED" : "WORK_ORDER_COMPLETED_INVOICED",
            resource: "WorkOrder",
            resourceId: id,
            details: {
              orderConsecutive: order.consecutive,
              invoiceConsecutive: invoice.consecutive,
              plate: order.motorcycle?.plate,
              total: totalVenta,
              itemsCount: order.items.length,
              paymentType: paymentType || "EFECTIVO",
            },
          },
        });

        // AL PASAR A VENTA: Se quita de las órdenes de trabajo activas
        await tx.workOrderItem.deleteMany({ where: { orderId: id } });
        await tx.workOrder.delete({ where: { id } });

        return {
          invoice,
          orderInfo: {
            consecutive: order.consecutive,
            customer: order.customer,
            motorcycle: order.motorcycle,
            items: order.items,
            total: totalVenta,
          },
        };
      }

      // 4. Cambiar estado simple
      if (action === "UPDATE_STATUS") {
        return tx.workOrder.update({
          where: { id },
          data: { status: body.status || "EN_REPARACION" },
          include: { items: { include: { product: true } }, customer: true, motorcycle: true },
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// BORRAR ORDEN DE TRABAJO (Reintegra stock si no estaba facturada)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.workOrder.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
          motorcycle: true,
        },
      });

      if (!order) throw new Error("Orden de trabajo no encontrada");

      // Devolver los repuestos al stock en la estantería física
      for (const item of order.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          await tx.product.update({
            where: { id: prod.id },
            data: { currentStock: prod.currentStock + item.quantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: prod.id,
              type: "AJUSTE_POSITIVO",
              quantity: item.quantity,
              previousQty: prod.currentStock,
              newQty: prod.currentStock + item.quantity,
              reason: `Orden #${order.consecutive} eliminada: repuestos reintegrados a bodega`,
            },
          });
        }
      }

      // Eliminar los ítems de la orden y la orden
      await tx.workOrderItem.deleteMany({ where: { orderId: id } });
      await tx.workOrder.delete({ where: { id } });

      // Auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "WORK_ORDER_DELETED",
          resource: "WorkOrder",
          resourceId: id,
          details: {
            orderConsecutive: order.consecutive,
            plate: order.motorcycle?.plate,
            partsReturned: true,
            itemsCount: order.items.length,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Orden eliminada exitosamente y repuestos reintegrados al inventario.",
    });
  } catch (error: any) {
    console.error("Error al eliminar orden:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

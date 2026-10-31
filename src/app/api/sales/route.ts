import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({ invoices });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "La venta debe incluir al menos un producto." },
        { status: 400 }
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Cliente
      const clientName = (body.customerName || "").trim() || "Consumidor Final";
      let customer = await tx.customer.findFirst({
        where: { name: clientName },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: clientName,
            phone: body.customerPhone || null,
          },
        });
      } else if (body.customerPhone && !customer.phone) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { phone: body.customerPhone },
        });
      }

      // 2. Descontar stock y validar
      let subtotal = 0;
      let taxAmount = 0;

      for (const item of body.items) {
        const qty = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if (!qty || qty <= 0 || !Number.isInteger(qty)) {
          throw new Error(`Cantidad inválida (${item.quantity}) para el producto.`);
        }

        if (isNaN(unitPrice) || unitPrice < 0) {
          throw new Error(`Precio unitario inválido ($${item.unitPrice}).`);
        }

        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod || prod.currentStock < qty) {
          throw new Error(`Stock insuficiente para "${prod?.name || item.productId}"`);
        }

        const newStock = prod.currentStock - qty;
        await tx.product.update({
          where: { id: prod.id },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            type: "SALIDA_VENTA",
            quantity: -qty,
            previousQty: prod.currentStock,
            newQty: newStock,
            reason: body.paymentType === "CREDITO" ? `Venta a Crédito POS` : `Venta POS`,
          },
        });

        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;
        taxAmount += Math.round((lineTotal * (item.taxRate || 19)) / 100);
      }

      const total = subtotal;

      // 3. Consecutivo único
      const lastInv = await tx.invoice.findFirst({
        orderBy: { consecutive: "desc" },
      });
      const nextConsecutive = lastInv ? lastInv.consecutive + 1 : 1001;

      const isCredit = body.paymentType === "CREDITO";

      // 4. Crear factura (PAGADA o PENDIENTE si es a crédito)
      const createdInvoice = await tx.invoice.create({
        data: {
          consecutive: nextConsecutive,
          customerId: customer.id,
          userId: user.id,
          status: isCredit ? "PENDIENTE" : "PAGADA",
          subtotal,
          taxAmount,
          discount: 0,
          total,
          paymentType: body.paymentType || "EFECTIVO",
          items: {
            create: body.items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxRate: i.taxRate || 19,
              totalPrice: i.unitPrice * i.quantity,
            })),
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      // 5. Si es a crédito, registrar en el modelo Credit
      if (isCredit) {
        const lastCredit = await tx.credit.findFirst({
          orderBy: { consecutive: "desc" },
        });
        const nextCreditConsecutive = lastCredit ? lastCredit.consecutive + 1 : 1001;

        await tx.credit.create({
          data: {
            consecutive: nextCreditConsecutive,
            invoiceId: createdInvoice.id,
            customerId: customer.id,
            plate: body.plate || null,
            totalAmount: total,
            paidAmount: 0,
            remainingAmount: total,
            status: "PENDIENTE",
            notes: body.notes || "Venta mostrador a crédito",
          },
        });
      }

      // 6. Auditoría
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: isCredit ? "SALE_CREDIT_CREATED" : "SALE_INVOICE_CREATED",
          resource: "Invoice",
          resourceId: createdInvoice.id,
          details: {
            consecutive: createdInvoice.consecutive,
            total,
            paymentType: body.paymentType,
            customer: customer.name,
          },
        },
      });

      return createdInvoice;
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: error?.message || "Error al generar la venta" },
      { status: 400 }
    );
  }
}


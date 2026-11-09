import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filterCompanyId = searchParams.get("companyId");

  const settings = getSettings();
  const invoiceCompanies = settings.invoiceCompanies || {};
  const userCompanies = settings.userCompanies || {};

  const rawInvoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: { include: { product: true } },
    },
  });

  const invoices = rawInvoices.map((inv) => {
    const directComp = invoiceCompanies[inv.id];
    const creatorEmail = inv.user?.email?.toLowerCase();
    const creatorComp = creatorEmail ? userCompanies[creatorEmail] : null;
    const finalCompanyId = directComp || (creatorComp && creatorComp !== "ALL" ? creatorComp : "comp-mototaller");

    return {
      ...inv,
      companyId: finalCompanyId,
    };
  });

  let result = invoices;
  if (filterCompanyId && filterCompanyId !== "ALL") {
    result = invoices.filter((i) => i.companyId === filterCompanyId);
  } else if (user.role !== "SUPERADMIN") {
    const userAssigned = userCompanies[user.email.toLowerCase()] || "comp-mototaller";
    result = invoices.filter((i) => i.companyId === userAssigned);
  }

  return NextResponse.json({ invoices: result });
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

      // Cálculo transparente de descuento aplicado a la factura
      const explicitDiscount = Number(body.discount) || 0;
      const finalDiscount = explicitDiscount > 0 ? explicitDiscount : 0;
      const finalSubtotal = body.subtotal ? Number(body.subtotal) : (subtotal + finalDiscount);
      const total = body.total !== undefined ? Number(body.total) : Math.max(0, finalSubtotal - finalDiscount);

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
          subtotal: finalSubtotal,
          taxAmount,
          discount: finalDiscount,
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

    // Guardar la empresa asignada a esta venta en invoiceCompanies
    const settings = getSettings();
    const userComp = settings.userCompanies?.[user.email.toLowerCase()];
    const targetCompId = body.companyId || (userComp && userComp !== "ALL" ? userComp : "comp-mototaller");

    const invoiceCompanies = {
      ...(settings.invoiceCompanies || {}),
      [invoice.id]: targetCompId,
    };
    saveSettings({ ...settings, invoiceCompanies });

    return NextResponse.json({
      success: true,
      invoice: { ...invoice, companyId: targetCompId },
    });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: error?.message || "Error al generar la venta" },
      { status: 400 }
    );
  }
}


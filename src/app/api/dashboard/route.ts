import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 1. Facturas reales de hoy
  const todayInvoices = await prisma.invoice.findMany({
    where: {
      status: "PAGADA",
      createdAt: { gte: todayStart },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  // 1.1 Abonos a créditos recibidos hoy (Entradas de dinero reales a caja)
  const todayCreditPayments = await prisma.creditPayment.findMany({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  let todaySales = 0;
  let todayCost = 0;
  for (const inv of todayInvoices) {
    todaySales += inv.total;
    for (const item of inv.items) {
      todayCost += (item.product?.costPrice || 0) * item.quantity;
    }
  }

  // Sumar a las ventas/entradas de dinero los abonos de cartera recibidos hoy
  let todayCreditPaymentsTotal = 0;
  for (const cp of todayCreditPayments) {
    todayCreditPaymentsTotal += cp.amount;
  }
  todaySales += todayCreditPaymentsTotal;

  const todayProfit = todaySales - todayCost;

  // 2. Órdenes de trabajo reales
  const activeWorkOrders = await prisma.workOrder.findMany({
    where: {
      status: { in: ["RECIBIDA", "EN_DIAGNOSTICO", "EN_REPARACION", "LISTA_PARA_ENTREGA"] },
    },
    include: {
      customer: true,
      motorcycle: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Productos y alertas
  const allProducts = await prisma.product.findMany({
    include: {
      locations: { include: { location: true } },
    },
  });
  const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStock);

  // 4. Últimas ventas/facturas
  const recentInvoices = await prisma.invoice.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  // 5. Cotizaciones
  const quotes = await prisma.quote.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      motorcycle: true,
      items: true,
    },
  });

  // 6. Cajas abiertas
  const currentCashSession = await prisma.cashSession.findFirst({
    where: { status: "ABIERTA" },
  });

  // 7. Clientes y motos
  const customers = await prisma.customer.findMany({
    take: 10,
    orderBy: { name: "asc" },
    include: { motos: true },
  });

  return NextResponse.json({
    kpis: {
      todaySales,
      todayProfit,
      todayCreditPaymentsTotal,
      activeOrdersCount: activeWorkOrders.length,
      lowStockCount: lowStockProducts.length,
      totalProductsCount: allProducts.length,
    },
    activeWorkOrders,
    recentInvoices,
    quotes,
    lowStockProducts,
    currentCashSession,
    customers,
  });
}


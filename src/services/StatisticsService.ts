import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export class StatisticsService {
  /**
   * Resumen y KPIs globales para el Dashboard
   */
  static async getDashboardMetrics() {
    await requirePermission("inventario:leer");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // Ventas de hoy
    const todayInvoices = await prisma.invoice.findMany({
      where: {
        status: "PAGADA",
        createdAt: { gte: todayStart },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    let todaySales = 0;
    let todayCost = 0;
    for (const inv of todayInvoices) {
      todaySales += inv.total;
      for (const item of inv.items) {
        todayCost += (item.product.costPrice || 0) * item.quantity;
      }
    }
    const todayProfit = todaySales - todayCost;

    // Órdenes activas
    const activeWorkOrdersCount = await prisma.workOrder.count({
      where: {
        status: { in: ["RECIBIDA", "EN_DIAGNOSTICO", "EN_REPARACION", "LISTA_PARA_ENTREGA"] },
      },
    });

    // Productos bajo mínimo
    const allProducts = await prisma.product.findMany();
    const lowStockCount = allProducts.filter((p) => p.currentStock <= p.minStock).length;

    // Productos sin movimiento en los últimos 30 días
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMovementProductIds = await prisma.stockMovement
      .findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { productId: true },
        distinct: ["productId"],
      })
      .then((res) => new Set(res.map((r) => r.productId)));

    const deadStockCount = allProducts.filter((p) => !recentMovementProductIds.has(p.id)).length;

    // Top 5 repuestos más vendidos
    const topItems = await prisma.invoiceItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topProducts = await Promise.all(
      topItems.map(async (item) => {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        return {
          product: prod,
          totalSold: item._sum.quantity || 0,
          revenue: item._sum.totalPrice || 0,
        };
      })
    );

    return {
      todaySales,
      todayProfit,
      activeWorkOrdersCount,
      lowStockCount,
      deadStockCount,
      topProducts,
    };
  }
}


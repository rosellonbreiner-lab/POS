import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { CreateProductSchema, AdjustStockSchema } from "@/features/inventario/schemas";
import { z } from "zod";
import { MovementType } from "@prisma/client";

export class InventoryService {
  /**
   * Obtiene todos los productos con categorías, marcas y ubicaciones físicas
   */
  static async getProducts(search?: string) {
    await requirePermission("inventario:leer");

    return prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { sku: { contains: search } },
              { barcode: { contains: search } },
              { motorcycleFit: { contains: search } },
            ],
          }
        : undefined,
      include: {
        category: true,
        brand: true,
        locations: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Obtiene productos con stock menor o igual al mínimo
   */
  static async getLowStockAlerts() {
    await requirePermission("inventario:leer");

    // Buscamos productos donde currentStock <= minStock
    const products = await prisma.product.findMany({
      include: {
        locations: {
          include: { location: true },
        },
      },
      orderBy: { currentStock: "asc" },
    });

    return products.filter((p) => p.currentStock <= p.minStock);
  }

  /**
   * Busca producto por código de barras o SKU (soporta escaneo rápido)
   */
  static async findByBarcodeOrSku(code: string) {
    await requirePermission("inventario:leer");

    return prisma.product.findFirst({
      where: {
        OR: [{ barcode: code }, { sku: code }],
      },
      include: {
        locations: {
          include: { location: true },
        },
      },
    });
  }

  /**
   * Crea un producto con su ubicación física y movimiento inicial de stock
   */
  static async createProduct(rawInput: z.infer<typeof CreateProductSchema>) {
    const user = await requirePermission("inventario:crear");
    const data = CreateProductSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      // 1. Encontrar o crear la ubicación física
      let location = await tx.location.findFirst({
        where: {
          warehouse: "Principal",
          shelf: data.shelf,
          level: data.level,
          position: data.position || null,
        },
      });

      if (!location) {
        location = await tx.location.create({
          data: {
            warehouse: "Principal",
            shelf: data.shelf,
            level: data.level,
            position: data.position || null,
          },
        });
      }

      // 2. Crear producto
      const product = await tx.product.create({
        data: {
          sku: data.sku,
          barcode: data.barcode || null,
          name: data.name,
          description: data.description || null,
          categoryId: data.categoryId || null,
          brandId: data.brandId || null,
          motorcycleFit: data.motorcycleFit || null,
          costPrice: data.costPrice,
          salePrice: data.salePrice,
          taxRate: data.taxRate,
          currentStock: data.initialStock,
          minStock: data.minStock,
        },
      });

      // 3. Asociar producto con la ubicación física
      await tx.productLocation.create({
        data: {
          productId: product.id,
          locationId: location.id,
          quantity: data.initialStock,
        },
      });

      // 4. Kardex si hay stock inicial
      if (data.initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: MovementType.AJUSTE_POSITIVO,
            quantity: data.initialStock,
            previousQty: 0,
            newQty: data.initialStock,
            reason: "Inventario inicial al crear repuesto",
          },
        });
      }

      // 5. Auditoría
      await createAuditLog({
        userId: user.id,
        action: "PRODUCT_CREATED",
        resource: "Product",
        resourceId: product.id,
        details: { sku: product.sku, name: product.name },
      });

      return product;
    });
  }

  /**
   * Ajuste de inventario con motivo obligatorio (append-only Kardex)
   */
  static async adjustStock(rawInput: z.infer<typeof AdjustStockSchema>) {
    const user = await requirePermission("inventario:ajustar");
    const data = AdjustStockSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      const newQty = product.currentStock + data.quantity;
      if (newQty < 0) {
        throw new Error("El ajuste dejaría el stock en negativo");
      }

      // Actualizar stock del producto
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newQty },
      });

      // Movimiento en Kardex
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: data.quantity >= 0 ? MovementType.AJUSTE_POSITIVO : MovementType.AJUSTE_NEGATIVO,
          quantity: data.quantity,
          previousQty: product.currentStock,
          newQty,
          reason: data.reason,
        },
      });

      // Auditoría
      await createAuditLog({
        userId: user.id,
        action: "STOCK_ADJUSTED",
        resource: "Product",
        resourceId: product.id,
        details: {
          quantity: data.quantity,
          previousQty: product.currentStock,
          newQty,
          reason: data.reason,
        },
      });

      return updatedProduct;
    });
  }
}


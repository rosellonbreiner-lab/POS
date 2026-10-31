import { z } from "zod";

export const CreateProductSchema = z.object({
  sku: z.string().min(2, "El SKU debe tener al menos 2 caracteres").toUpperCase(),
  barcode: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  motorcycleFit: z.string().optional(),
  costPrice: z.number().int().nonnegative("El costo debe ser un valor entero no negativo"),
  salePrice: z.number().int().positive("El precio de venta debe ser positivo"),
  taxRate: z.number().int().default(19),
  minStock: z.number().int().default(3),
  initialStock: z.number().int().default(0),
  // Ubicación física
  shelf: z.string().min(1, "El estante es obligatorio (ej. E-03)"),
  level: z.number().int().positive("El nivel debe ser positivo"),
  position: z.string().optional(),
});

export const AdjustStockSchema = z.object({
  productId: z.string().uuid("ID de producto inválido"),
  quantity: z.number().int("La cantidad de ajuste debe ser un entero"),
  reason: z.string().min(4, "Debe especificar un motivo para el ajuste de stock"),
});


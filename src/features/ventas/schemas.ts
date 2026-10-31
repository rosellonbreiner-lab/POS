import { z } from "zod";

export const CreateCustomerSchema = z.object({
  name: z.string().min(3, "El nombre del cliente es obligatorio"),
  documentId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  address: z.string().optional(),
});

export const CreateMotorcycleSchema = z.object({
  customerId: z.string().uuid("ID de cliente inválido"),
  plate: z.string().min(5, "Placa inválida").max(7, "Placa inválida").toUpperCase(),
  brand: z.string().min(2, "La marca de la moto es obligatoria"),
  model: z.string().min(2, "El modelo es obligatorio"),
  year: z.number().int().min(1980).max(2035).optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateInvoiceItemSchema = z.object({
  productId: z.string().uuid("ID de producto inválido"),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.number().int().positive("El precio debe ser mayor a 0"),
  taxRate: z.number().int().default(19),
});

export const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z.array(CreateInvoiceItemSchema).min(1, "Debe incluir al menos un producto o servicio"),
  discount: z.number().int().nonnegative().default(0),
  paymentType: z.enum(["EFECTIVO", "TRANSFERENCIA", "TARJETA", "MIXTO"]),
});

export const CreateQuoteSchema = z.object({
  customerId: z.string().uuid().optional(),
  motorcycleId: z.string().uuid().optional(),
  validDays: z.number().int().positive().default(15),
  items: z.array(
    z.object({
      productId: z.string().uuid().optional(),
      description: z.string().min(2, "La descripción del ítem es requerida"),
      quantity: z.number().int().positive(),
      unitPrice: z.number().int().positive(),
    })
  ).min(1, "Debe incluir al menos un ítem"),
});

export const CreateWorkOrderSchema = z.object({
  customerId: z.string().uuid("Cliente obligatorio"),
  motorcycleId: z.string().uuid("Moto obligatoria"),
  mileage: z.number().int().nonnegative().optional(),
  diagnosis: z.string().min(5, "El diagnóstico o motivo de ingreso es obligatorio"),
  workDetails: z.string().optional(),
  laborCost: z.number().int().nonnegative().default(0),
  parts: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().int().positive(),
    })
  ).default([]),
});


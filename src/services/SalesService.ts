import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { 
  CreateInvoiceSchema, 
  CreateQuoteSchema, 
  CreateCustomerSchema, 
  CreateMotorcycleSchema,
  CreateWorkOrderSchema 
} from "@/features/ventas/schemas";
import { z } from "zod";
import { MovementType, InvoiceStatus, OrderStatus, QuoteStatus } from "@prisma/client";

export class SalesService {
  /**
   * Registro de clientes
   */
  static async createCustomer(rawInput: z.infer<typeof CreateCustomerSchema>) {
    await requirePermission("ventas:crear");
    const data = CreateCustomerSchema.parse(rawInput);
    return prisma.customer.create({ data });
  }

  /**
   * Registro de motocicleta
   */
  static async createMotorcycle(rawInput: z.infer<typeof CreateMotorcycleSchema>) {
    await requirePermission("ventas:crear");
    const data = CreateMotorcycleSchema.parse(rawInput);
    return prisma.motorcycle.create({ data });
  }

  /**
   * Creación atómica de Factura (POS):
   * 1. Valida stock de cada producto
   * 2. Descuenta stock y genera Kardex append-only
   * 3. Crea factura e items
   * 4. Asiento contable automático (Caja/Bancos vs Ventas e IVA)
   * 5. Auditoría
   */
  static async createInvoice(rawInput: z.infer<typeof CreateInvoiceSchema>) {
    const user = await requirePermission("ventas:facturar");
    const data = CreateInvoiceSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let taxAmount = 0;

      // 1. Validar y descontar stock
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${product.name}". Disponible: ${product.currentStock}, Solicitado: ${item.quantity}`
          );
        }

        const newStock = product.currentStock - item.quantity;

        // Actualizar stock
        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: newStock },
        });

        // Registrar en Kardex
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: MovementType.SALIDA_VENTA,
            quantity: -item.quantity,
            previousQty: product.currentStock,
            newQty: newStock,
            reason: `Venta POS`,
          },
        });

        const itemTotal = item.unitPrice * item.quantity;
        const itemTax = Math.round((itemTotal * item.taxRate) / 100);
        subtotal += itemTotal;
        taxAmount += itemTax;
      }

      const total = subtotal + taxAmount - data.discount;

      // 2. Crear factura
      const invoice = await tx.invoice.create({
        data: {
          customerId: data.customerId || null,
          userId: user.id,
          status: InvoiceStatus.PAGADA,
          subtotal,
          taxAmount,
          discount: data.discount,
          total,
          paymentType: data.paymentType,
          items: {
            create: data.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxRate: i.taxRate,
              totalPrice: i.unitPrice * i.quantity,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          customer: true,
        },
      });

      // 3. Asiento contable automático (Doble partida balanceada)
      const cashAccount = await tx.account.findUnique({ where: { code: "110505" } }); // Caja
      const salesAccount = await tx.account.findUnique({ where: { code: "413501" } }); // Ventas
      const taxAccount = await tx.account.findUnique({ where: { code: "240801" } }); // IVA

      if (cashAccount && salesAccount) {
        await tx.journalEntry.create({
          data: {
            concept: `Venta Factura #${invoice.consecutive}`,
            reference: `INV-${invoice.consecutive}`,
            lines: {
              create: [
                { accountId: cashAccount.id, debit: total, credit: 0 },
                { accountId: salesAccount.id, debit: 0, credit: subtotal },
                ...(taxAccount && taxAmount > 0
                  ? [{ accountId: taxAccount.id, debit: 0, credit: taxAmount }]
                  : []),
              ],
            },
          },
        });
      }

      // 4. Auditoría
      await createAuditLog({
        userId: user.id,
        action: "INVOICE_CREATED",
        resource: "Invoice",
        resourceId: invoice.id,
        details: { consecutive: invoice.consecutive, total, itemsCount: data.items.length },
      });

      return invoice;
    });
  }

  /**
   * Anulación de Factura con Nota Crédito (Inmutable - Append-only):
   * Restituye stock y crea contra-asiento contable
   */
  static async cancelInvoice(invoiceId: string, reason: string) {
    const user = await requirePermission("ventas:anular");

    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true },
      });

      if (!invoice) throw new Error("Factura no encontrada");
      if (invoice.status === InvoiceStatus.ANULADA) throw new Error("La factura ya se encuentra anulada");

      // 1. Restituir inventario
      for (const item of invoice.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const newQty = prod.currentStock + item.quantity;
          await tx.product.update({
            where: { id: prod.id },
            data: { currentStock: newQty },
          });

          await tx.stockMovement.create({
            data: {
              productId: prod.id,
              type: MovementType.AJUSTE_POSITIVO,
              quantity: item.quantity,
              previousQty: prod.currentStock,
              newQty,
              reason: `Anulación Factura #${invoice.consecutive}: ${reason}`,
            },
          });
        }
      }

      // 2. Marcar anulada y crear Nota Crédito
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.ANULADA },
      });

      await tx.creditNote.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.total,
          reason,
        },
      });

      // 3. Contra-asiento contable
      const cashAccount = await tx.account.findUnique({ where: { code: "110505" } });
      const salesAccount = await tx.account.findUnique({ where: { code: "413501" } });

      if (cashAccount && salesAccount) {
        await tx.journalEntry.create({
          data: {
            concept: `Anulación Nota Crédito Factura #${invoice.consecutive}`,
            reference: `NC-${invoice.consecutive}`,
            lines: {
              create: [
                { accountId: salesAccount.id, debit: invoice.subtotal, credit: 0 },
                { accountId: cashAccount.id, debit: 0, credit: invoice.total },
              ],
            },
          },
        });
      }

      // 4. Auditoría
      await createAuditLog({
        userId: user.id,
        action: "INVOICE_CANCELLED",
        resource: "Invoice",
        resourceId: invoice.id,
        details: { consecutive: invoice.consecutive, reason },
      });

      return { success: true };
    });
  }

  /**
   * Cotizaciones (con opción de conversión a factura u orden de trabajo)
   */
  static async createQuote(rawInput: z.infer<typeof CreateQuoteSchema>) {
    const user = await requirePermission("cotizaciones:crear");
    const data = CreateQuoteSchema.parse(rawInput);

    let subtotal = 0;
    const itemsData = data.items.map((i) => {
      const itemTotal = i.unitPrice * i.quantity;
      subtotal += itemTotal;
      return {
        productId: i.productId || null,
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: itemTotal,
      };
    });

    const taxAmount = Math.round(subtotal * 0.19);
    const total = subtotal + taxAmount;
    const validUntil = new Date(Date.now() + data.validDays * 24 * 60 * 60 * 1000);

    return prisma.quote.create({
      data: {
        customerId: data.customerId || null,
        motorcycleId: data.motorcycleId || null,
        userId: user.id,
        status: QuoteStatus.ENVIADA,
        subtotal,
        taxAmount,
        total,
        validUntil,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
        customer: true,
        motorcycle: true,
      },
    });
  }

  /**
   * Órdenes de Trabajo para el taller mecánico
   */
  static async createWorkOrder(rawInput: z.infer<typeof CreateWorkOrderSchema>) {
    const user = await requirePermission("ordenes:crear");
    const data = CreateWorkOrderSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      let partsCost = 0;

      // Descontar repuestos comprometidos en la orden
      for (const part of data.parts) {
        const prod = await tx.product.findUnique({ where: { id: part.productId } });
        if (!prod || prod.currentStock < part.quantity) {
          throw new Error(`Stock insuficiente para repuesto en orden: ${prod?.name || part.productId}`);
        }

        const newStock = prod.currentStock - part.quantity;
        await tx.product.update({
          where: { id: prod.id },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            type: MovementType.SALIDA_ORDEN_TRABAJO,
            quantity: -part.quantity,
            previousQty: prod.currentStock,
            newQty: newStock,
            reason: `Repuesto asignado a Orden de Trabajo`,
          },
        });

        partsCost += part.unitPrice * part.quantity;
      }

      const total = partsCost + data.laborCost;

      return tx.workOrder.create({
        data: {
          customerId: data.customerId,
          motorcycleId: data.motorcycleId,
          userId: user.id,
          status: OrderStatus.RECIBIDA,
          mileage: data.mileage || null,
          diagnosis: data.diagnosis,
          workDetails: data.workDetails || null,
          laborCost: data.laborCost,
          partsCost,
          total,
          items: {
            create: data.parts.map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              totalPrice: p.unitPrice * p.quantity,
            })),
          },
        },
        include: {
          customer: true,
          motorcycle: true,
          items: { include: { product: true } },
        },
      });
    });
  }
}


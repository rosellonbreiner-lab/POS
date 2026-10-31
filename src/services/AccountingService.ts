import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import {
  CreateAccountSchema,
  OpenCashSessionSchema,
  CloseCashSessionSchema,
  CreateJournalEntrySchema,
} from "@/features/contabilidad/schemas";
import { z } from "zod";

export class AccountingService {
  /**
   * Plan de Cuentas Extensible: El usuario puede agregar más libremente
   */
  static async getAccounts() {
    await requirePermission("contabilidad:ver");
    return prisma.account.findMany({
      orderBy: { code: "asc" },
    });
  }

  static async createAccount(rawInput: z.infer<typeof CreateAccountSchema>) {
    const user = await requirePermission("contabilidad:editar");
    const data = CreateAccountSchema.parse(rawInput);

    const account = await prisma.account.create({ data });

    await createAuditLog({
      userId: user.id,
      action: "ACCOUNT_CREATED",
      resource: "Account",
      resourceId: account.id,
      details: { code: account.code, name: account.name },
    });

    return account;
  }

  /**
   * Apertura de Caja Diaria
   */
  static async openCashSession(rawInput: z.infer<typeof OpenCashSessionSchema>) {
    const user = await requirePermission("caja:abrir");
    const data = OpenCashSessionSchema.parse(rawInput);

    const activeSession = await prisma.cashSession.findFirst({
      where: { status: "ABIERTA" },
    });

    if (activeSession) {
      throw new Error("Ya existe una sesión de caja abierta. Debe cerrarla antes de iniciar una nueva.");
    }

    return prisma.cashSession.create({
      data: {
        initialCash: data.initialCash,
        status: "ABIERTA",
      },
    });
  }

  /**
   * Cierre y Arqueo de Caja Diaria:
   * Calcula ventas en efectivo y compara con arqueo físico
   */
  static async closeCashSession(rawInput: z.infer<typeof CloseCashSessionSchema>) {
    const user = await requirePermission("caja:cerrar");
    const data = CloseCashSessionSchema.parse(rawInput);

    const session = await prisma.cashSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session || session.status === "CERRADA") {
      throw new Error("Sesión no encontrada o ya se encuentra cerrada.");
    }

    // Calcular ventas en efectivo desde la apertura
    const cashInvoices = await prisma.invoice.findMany({
      where: {
        paymentType: "EFECTIVO",
        status: "PAGADA",
        createdAt: { gte: session.openedAt },
      },
    });

    const totalCashSales = cashInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const calculatedCash = session.initialCash + totalCashSales;
    const difference = data.finalCash - calculatedCash; // Sobrante (+) o Faltante (-)

    const closed = await prisma.cashSession.update({
      where: { id: session.id },
      data: {
        finalCash: data.finalCash,
        calculatedCash,
        difference,
        status: "CERRADA",
        closedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "CASH_SESSION_CLOSED",
      resource: "CashSession",
      resourceId: closed.id,
      details: { initialCash: session.initialCash, finalCash: data.finalCash, difference },
    });

    return closed;
  }

  /**
   * Asiento Contable Manual (Partida Doble Balanceada obligatoria)
   */
  static async createJournalEntry(rawInput: z.infer<typeof CreateJournalEntrySchema>) {
    const user = await requirePermission("contabilidad:editar");
    const data = CreateJournalEntrySchema.parse(rawInput);

    const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);

    if (totalDebit !== totalCredit) {
      throw new Error(
        `El asiento contable no está cuadrado. Débito ($${totalDebit}) ≠ Crédito ($${totalCredit})`
      );
    }

    return prisma.journalEntry.create({
      data: {
        concept: data.concept,
        reference: data.reference || null,
        lines: {
          create: data.lines,
        },
      },
      include: {
        lines: { include: { account: true } },
      },
    });
  }

  /**
   * Resumen de IVA y Utilidad
   */
  static async getTaxAndProfitSummary(startDate: Date, endDate: Date) {
    await requirePermission("contabilidad:ver");

    const invoices = await prisma.invoice.findMany({
      where: {
        status: "PAGADA",
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    let totalSales = 0;
    let totalTaxCollected = 0;
    let totalCost = 0;

    for (const inv of invoices) {
      totalSales += inv.subtotal;
      totalTaxCollected += inv.taxAmount;

      for (const item of inv.items) {
        totalCost += (item.product.costPrice || 0) * item.quantity;
      }
    }

    const grossProfit = totalSales - totalCost;

    return {
      period: { startDate, endDate },
      totalInvoices: invoices.length,
      totalSales,
      totalTaxCollected, // IVA por pagar
      totalCost,
      grossProfit,
      marginPercent: totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : "0.0",
    };
  }
}


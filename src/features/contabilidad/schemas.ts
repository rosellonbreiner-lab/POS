import { z } from "zod";

export const CreateAccountSchema = z.object({
  code: z.string().min(4, "El código de cuenta contable debe tener al menos 4 dígitos"),
  name: z.string().min(3, "El nombre de la cuenta es requerido"),
  type: z.enum(["ACTIVO", "PASIVO", "PATRIMONIO", "INGRESO", "GASTO"]),
});

export const OpenCashSessionSchema = z.object({
  initialCash: z.number().int().nonnegative("La base de caja debe ser mayor o igual a 0"),
});

export const CloseCashSessionSchema = z.object({
  sessionId: z.string().uuid("ID de sesión inválido"),
  finalCash: z.number().int().nonnegative("El arqueo físico debe ser mayor o igual a 0"),
});

export const CreateJournalEntrySchema = z.object({
  concept: z.string().min(4, "El concepto del asiento es requerido"),
  reference: z.string().optional(),
  lines: z.array(
    z.object({
      accountId: z.string().uuid("ID de cuenta inválido"),
      debit: z.number().int().nonnegative().default(0),
      credit: z.number().int().nonnegative().default(0),
    })
  ).min(2, "Un asiento contable requiere al menos dos partidas"),
});


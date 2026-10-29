import { z } from "zod";
import { FinancialEntryType } from "@prisma/client";

export const OpenCashSessionSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string({ required_error: "ID da unidade e obrigatorio" }).min(1),
  openedByUserId: z.string({ required_error: "ID do operador e obrigatorio" }).min(1),
  openingBalanceInCents: z
    .number()
    .int("Saldo inicial deve ser inteiro em centavos")
    .nonnegative("Saldo inicial nao pode ser negativo")
    .default(0),
});

export const CloseCashSessionSchema = z.object({
  organizationId: z.string().min(1),
  cashSessionId: z.string().min(1),
  closedByUserId: z.string().min(1),
  closingBalanceInCents: z
    .number()
    .int("Saldo final contado deve ser inteiro em centavos")
    .nonnegative("Saldo final nao pode ser negativo"),
});

export const CreateFinancialEntrySchema = z.object({
  organizationId: z.string().min(1),
  unitId: z.string().min(1),
  type: z.nativeEnum(FinancialEntryType),
  category: z.string().trim().min(2),
  description: z.string().trim().min(2).max(255),
  amountInCents: z.number().int().positive("Valor deve ser maior que zero em centavos"),
  dueDate: z.coerce.date().default(() => new Date()),
  paidAt: z.coerce.date().optional().nullable(),
});

export type OpenCashSessionInput = z.infer<typeof OpenCashSessionSchema>;
export type CloseCashSessionInput = z.infer<typeof CloseCashSessionSchema>;
export type CreateFinancialEntryInput = z.infer<typeof CreateFinancialEntrySchema>;

import { z } from "zod";

export const CalculateCommissionFilterSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string().optional().nullable(),
  professionalId: z.string().optional().nullable(),
  startDate: z.coerce.date({ required_error: "Data inicial e obrigatoria" }),
  endDate: z.coerce.date({ required_error: "Data final e obrigatoria" }),
});

export const SettleCommissionSchema = z.object({
  organizationId: z.string().min(1),
  unitId: z.string().min(1),
  professionalId: z.string().min(1),
  amountInCents: z.number().int().positive("Valor do repasse deve ser positivo"),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
});

export type CalculateCommissionFilterInput = z.infer<typeof CalculateCommissionFilterSchema>;
export type SettleCommissionInput = z.infer<typeof SettleCommissionSchema>;


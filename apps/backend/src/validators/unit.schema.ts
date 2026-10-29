import { z } from "zod";

export const CreateUnitSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  name: z
    .string({ required_error: "Nome da unidade e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres")
    .max(120, "Nome deve conter no maximo 120 caracteres"),
  address: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(30).optional(),
  timezone: z.string().trim().default("America/Sao_Paulo"),
});

export const UpdateUnitSchema = CreateUnitSchema.omit({ organizationId: true }).partial();

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;
export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>;

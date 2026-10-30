import { z } from "zod";

export const CreateServiceSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  name: z
    .string({ required_error: "Nome do servico e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres")
    .max(100, "Nome deve conter no maximo 100 caracteres"),
  description: z.string().trim().max(500).optional(),
  durationMinutes: z
    .number({ required_error: "Duracao em minutos e obrigatoria" })
    .int("Duracao deve ser um numero inteiro")
    .min(5, "Duracao minima de 5 minutos")
    .max(480, "Duracao maxima de 480 minutos"),
  priceInCents: z
    .number({ required_error: "Preco em centavos e obrigatorio" })
    .int("Preco deve ser um numero inteiro em centavos")
    .nonnegative("Preco nao pode ser negativo"),
  category: z.string().trim().default("corte"),
  bufferBeforeMinutes: z.number().int().min(0).default(0),
  bufferAfterMinutes: z.number().int().min(0).default(0),
  color: z.string().trim().default("#3B82F6"),
  active: z.boolean().default(true),
});

export const UpdateServiceSchema = CreateServiceSchema.omit({ organizationId: true }).partial();

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;

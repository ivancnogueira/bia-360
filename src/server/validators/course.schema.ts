import { z } from "zod";

export const CreateCourseSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  name: z
    .string({ required_error: "Nome do curso e obrigatorio" })
    .trim()
    .min(3, "Nome deve conter no minimo 3 caracteres")
    .max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  workloadHours: z
    .number({ required_error: "Carga horaria e obrigatoria" })
    .int("Carga horaria deve ser um numero inteiro")
    .min(4, "Carga horaria minima de 4 horas")
    .max(600, "Carga horaria maxima de 600 horas"),
  priceInCents: z
    .number({ required_error: "Valor do curso e obrigatorio" })
    .int("Valor deve ser um numero inteiro em centavos")
    .nonnegative("Valor nao pode ser negativo"),
  modality: z
    .string()
    .trim()
    .refine((val) => ["presencial", "online", "hibrido"].includes(val.toLowerCase()), {
      message: "Modalidade deve ser: presencial, online ou hibrido",
    })
    .default("presencial"),
  active: z.boolean().default(true),
});

export const UpdateCourseSchema = CreateCourseSchema.omit({ organizationId: true }).partial();

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;

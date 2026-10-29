import { z } from "zod";

export const CreateOrganizationSchema = z.object({
  name: z
    .string({ required_error: "Nome da organizacao e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres")
    .max(120, "Nome deve conter no maximo 120 caracteres"),
  slug: z
    .string({ required_error: "Slug e obrigatorio" })
    .trim()
    .min(2, "Slug deve conter no minimo 2 caracteres")
    .max(80, "Slug deve conter no maximo 80 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  document: z.string().trim().max(20, "Documento invalido").optional(),
  phone: z.string().trim().max(30, "Telefone invalido").optional(),
  email: z.string().trim().email("E-mail corporativo invalido").optional(),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

import { z } from "zod";

export const CreateProductSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  name: z
    .string({ required_error: "Nome do produto e obrigatorio" })
    .trim()
    .min(2, "Nome deve ter no minimo 2 caracteres")
    .max(120),
  barcode: z.string().trim().max(50).optional().nullable(),
  category: z.string().trim().default("pomada"),
  priceInCents: z
    .number({ required_error: "Preco de venda e obrigatorio" })
    .int("Preco deve ser inteiro em centavos")
    .nonnegative("Preco nao pode ser negativo"),
  costInCents: z
    .number()
    .int("Custo deve ser inteiro em centavos")
    .nonnegative()
    .default(0),
  stockQuantity: z
    .number()
    .int("Estoque deve ser numero inteiro")
    .default(0),
  minStockAlert: z
    .number()
    .int()
    .min(0)
    .default(5),
  active: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.omit({ organizationId: true }).partial();

export const AdjustStockSchema = z.object({
  organizationId: z.string().min(1),
  productId: z.string().min(1),
  quantityChange: z.number().int("Ajuste deve ser numero inteiro"),
  reason: z.string().trim().min(3, "Motivo do ajuste e obrigatorio"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;

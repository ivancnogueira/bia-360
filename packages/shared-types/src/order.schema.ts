import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const OpenOrderSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string({ required_error: "ID da unidade e obrigatorio" }).min(1),
  contactId: z.string().optional().nullable(),
  appointmentId: z.string().optional().nullable(),
});

export const AddOrderItemSchema = z
  .object({
    orderId: z.string().min(1),
    serviceId: z.string().optional().nullable(),
    productId: z.string().optional().nullable(),
    professionalId: z.string().optional().nullable(),
    quantity: z.number().int("Quantidade deve ser inteira").min(1, "Quantidade minima e 1").default(1),
    priceInCents: z.number().int("Preco unitario deve ser em centavos").nonnegative("Preco nao pode ser negativo"),
  })
  .refine((data) => data.serviceId || data.productId, {
    message: "O item deve referenciar um servico ou um produto",
  });

export const CloseOrderSchema = z.object({
  organizationId: z.string().min(1),
  orderId: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Metodo de pagamento invalido" }),
  }),
  discountInCents: z.number().int().nonnegative().default(0),
  cashSessionId: z.string().optional().nullable(),
});

export type OpenOrderInput = z.infer<typeof OpenOrderSchema>;
export type AddOrderItemInput = z.infer<typeof AddOrderItemSchema>;
export type CloseOrderInput = z.infer<typeof CloseOrderSchema>;

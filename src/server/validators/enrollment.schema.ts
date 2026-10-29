import { z } from "zod";
import { EnrollmentStatus, PaymentMethod } from "@prisma/client";

export const CaptureLeadSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  name: z
    .string({ required_error: "Nome e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres"),
  phone: z
    .string({ required_error: "Telefone e obrigatorio" })
    .trim()
    .min(8, "Telefone invalido"),
  email: z.string().trim().email("E-mail invalido").optional().nullable(),
  courseId: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const PreEnrollmentSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  classGroupId: z.string({ required_error: "ID da turma e obrigatorio" }).min(1),
  customerName: z
    .string({ required_error: "Nome do aluno e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres"),
  customerPhone: z
    .string({ required_error: "Telefone do aluno e obrigatorio" })
    .trim()
    .min(8, "Telefone invalido"),
  customerEmail: z.string().trim().email("E-mail invalido").optional().nullable(),
});

export const ConfirmEnrollmentSchema = z.object({
  organizationId: z.string().min(1),
  enrollmentId: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Metodo de pagamento invalido" }),
  }),
  amountPaidInCents: z
    .number()
    .int("Valor pago deve ser inteiro em centavos")
    .positive("Valor pago deve ser positivo"),
});

export const CancelEnrollmentSchema = z.object({
  organizationId: z.string().min(1),
  enrollmentId: z.string().min(1),
  reason: z.string().trim().min(3, "Motivo do cancelamento e obrigatorio"),
});

export type CaptureLeadInput = z.infer<typeof CaptureLeadSchema>;
export type PreEnrollmentInput = z.infer<typeof PreEnrollmentSchema>;
export type ConfirmEnrollmentInput = z.infer<typeof ConfirmEnrollmentSchema>;
export type CancelEnrollmentInput = z.infer<typeof CancelEnrollmentSchema>;

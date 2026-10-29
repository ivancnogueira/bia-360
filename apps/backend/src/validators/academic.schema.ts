import { z } from "zod";

export const AttendanceItemSchema = z.object({
  enrollmentId: z.string({ required_error: "ID da matricula e obrigatorio" }).min(1),
  present: z.boolean().default(true),
  notes: z.string().trim().max(255).optional().nullable(),
});

export const RecordAttendanceBatchSchema = z.object({
  organizationId: z.string().min(1),
  sessionDate: z.coerce.date({ required_error: "Data da aula e obrigatoria" }),
  records: z
    .array(AttendanceItemSchema)
    .min(1, "E necessario enviar ao menos um registro de presenca"),
});

export const IssueCertificateSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  enrollmentId: z.string({ required_error: "ID da matricula e obrigatorio" }).min(1),
});

export const VerifyCertificateSchema = z.object({
  verificationCode: z
    .string({ required_error: "Codigo de verificacao e obrigatorio" })
    .trim()
    .min(8, "Codigo de verificacao invalido"),
});

export type AttendanceItemInput = z.infer<typeof AttendanceItemSchema>;
export type RecordAttendanceBatchInput = z.infer<typeof RecordAttendanceBatchSchema>;
export type IssueCertificateInput = z.infer<typeof IssueCertificateSchema>;
export type VerifyCertificateInput = z.infer<typeof VerifyCertificateSchema>;

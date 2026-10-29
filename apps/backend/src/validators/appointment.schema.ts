import { z } from "zod";
import { AppointmentStatus, BookingHoldStatus } from "@prisma/client";

export const CreateBookingHoldSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string({ required_error: "ID da unidade e obrigatorio" }).min(1),
  professionalId: z.string({ required_error: "ID do profissional e obrigatorio" }).min(1),
  serviceId: z.string({ required_error: "ID do servico e obrigatorio" }).min(1),
  customerName: z
    .string({ required_error: "Nome do cliente e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres"),
  customerPhone: z
    .string({ required_error: "Telefone do cliente e obrigatorio" })
    .trim()
    .min(8, "Telefone invalido"),
  startTime: z.coerce.date({ required_error: "Horario de inicio e obrigatorio" }),
  notes: z.string().trim().max(500).optional(),
});

export const ConfirmBookingHoldSchema = z.object({
  organizationId: z.string().min(1),
  token: z.string({ required_error: "Token da reserva temporaria e obrigatorio" }).min(1),
  notes: z.string().trim().max(500).optional(),
});

export const CreateAppointmentSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string({ required_error: "ID da unidade e obrigatorio" }).min(1),
  professionalId: z.string({ required_error: "ID do profissional e obrigatorio" }).min(1),
  serviceId: z.string({ required_error: "ID do servico e obrigatorio" }).min(1),
  contactId: z.string({ required_error: "ID do contato e obrigatorio" }).min(1),
  startTime: z.coerce.date({ required_error: "Horario de inicio e obrigatorio" }),
  notes: z.string().trim().max(500).optional(),
});

export const CancelAppointmentSchema = z.object({
  organizationId: z.string().min(1),
  appointmentId: z.string().min(1),
  reason: z.string().trim().min(3, "Motivo do cancelamento e obrigatorio"),
  actorId: z.string().optional(),
});

export const QueryAvailabilitySchema = z.object({
  organizationId: z.string().min(1),
  unitId: z.string().min(1),
  serviceId: z.string().min(1),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data deve ser YYYY-MM-DD"),
  professionalId: z.string().optional(),
});

export type CreateBookingHoldInput = z.infer<typeof CreateBookingHoldSchema>;
export type ConfirmBookingHoldInput = z.infer<typeof ConfirmBookingHoldSchema>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;
export type QueryAvailabilityInput = z.infer<typeof QueryAvailabilitySchema>;

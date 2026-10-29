import { z } from "zod";

const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const WorkScheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0, "Dia deve ser entre 0 e 6").max(6, "Dia deve ser entre 0 e 6"),
  startTime: z.string().regex(timeStringRegex, "Horario de inicio invalido (use HH:MM)"),
  endTime: z.string().regex(timeStringRegex, "Horario de termino invalido (use HH:MM)"),
  breakStartTime: z.string().regex(timeStringRegex, "Horario de intervalo invalido").optional().nullable(),
  breakEndTime: z.string().regex(timeStringRegex, "Horario de fim de intervalo invalido").optional().nullable(),
  active: z.boolean().default(true),
});

export const CreateProfessionalSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  name: z
    .string({ required_error: "Nome do profissional e obrigatorio" })
    .trim()
    .min(2, "Nome deve conter no minimo 2 caracteres")
    .max(100, "Nome deve conter no maximo 100 caracteres"),
  nickname: z.string().trim().max(50).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  commissionRate: z
    .number()
    .int("Taxa de comissao deve ser numero inteiro")
    .min(0, "Comissao minima 0%")
    .max(100, "Comissao maxima 100%")
    .default(50),
  color: z.string().trim().default("#c22ef3"),
  active: z.boolean().default(true),
  schedules: z.array(WorkScheduleItemSchema).optional(),
});

export const UpdateProfessionalSchema = CreateProfessionalSchema.omit({ organizationId: true }).partial();

export const SetProfessionalServicesSchema = z.object({
  services: z.array(
    z.object({
      serviceId: z.string().min(1),
      customPriceInCents: z.number().int().nonnegative().optional().nullable(),
      customCommission: z.number().int().min(0).max(100).optional().nullable(),
    })
  ),
});

export type CreateProfessionalInput = z.infer<typeof CreateProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof UpdateProfessionalSchema>;
export type WorkScheduleItemInput = z.infer<typeof WorkScheduleItemSchema>;

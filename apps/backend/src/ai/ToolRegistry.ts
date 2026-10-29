import { z } from "zod";
import { ToolDefinition } from "./types";
import { ServiceDomainService } from "../services/ServiceDomainService";
import { AvailabilityEngine } from "../services/AvailabilityEngine";
import { AppointmentService } from "../services/AppointmentService";
import { CourseService } from "../services/CourseService";
import { EnrollmentService } from "../services/EnrollmentService";

export class ToolRegistry {
  /**
   * Retorna todas as ferramentas de negocio disponiveis para os agentes da BIA.
   */
  static getTools(): ToolDefinition[] {
    return [
      // 1. Listar servicos de barbearia
      {
        name: "list_services",
        description: "Lista todos os servicos da barbearia com nome, duracao em minutos e valor.",
        schema: z.object({
          category: z.string().optional(),
        }),
        execute: async (args, context) => {
          const services = await ServiceDomainService.listByOrganization(context.organizationId, {
            category: args.category,
          });
          return services.map((s) => ({
            id: s.id,
            name: s.name,
            durationMinutes: s.durationMinutes,
            price: `R$ ${(s.priceInCents / 100).toFixed(2).replace(".", ",")}`,
            category: s.category,
          }));
        },
      },

      // 2. Consultar slots disponiveis
      {
        name: "check_available_slots",
        description: "Consulta horarios livres para agendamento em uma data especifica (formato YYYY-MM-DD).",
        schema: z.object({
          serviceId: z.string().min(1),
          targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          professionalId: z.string().optional(),
        }),
        execute: async (args, context) => {
          if (!context.unitId) {
            throw new Error("ID da unidade nao especificado no contexto.");
          }
          const slots = await AvailabilityEngine.getAvailableSlots({
            organizationId: context.organizationId,
            unitId: context.unitId,
            serviceId: args.serviceId,
            targetDate: args.targetDate,
            professionalId: args.professionalId,
          });
          return slots.map((s) => ({
            time: s.timeLabel,
            professionalId: s.professionalId,
            professionalName: s.professionalName,
            isoStart: s.startTimeUtc.toISOString(),
          }));
        },
      },

      // 3. Criar reserva temporaria de 10 minutos (Booking Hold)
      {
        name: "create_booking_hold",
        description: "Cria uma reserva temporaria de 10 minutos para garantir o horario enquanto o cliente confirma.",
        schema: z.object({
          serviceId: z.string().min(1),
          professionalId: z.string().min(1),
          startTime: z.string(),
          customerName: z.string().min(2),
          customerPhone: z.string().min(8),
        }),
        execute: async (args, context) => {
          if (!context.unitId) {
            throw new Error("ID da unidade obrigatorio.");
          }
          const hold = await AppointmentService.createBookingHold({
            organizationId: context.organizationId,
            unitId: context.unitId,
            professionalId: args.professionalId,
            serviceId: args.serviceId,
            customerName: args.customerName,
            customerPhone: args.customerPhone,
            startTime: new Date(args.startTime),
          });
          return {
            status: "HELD",
            token: hold.token,
            expiresAt: hold.expiresAt.toISOString(),
            priceFormatted: `R$ ${(hold.priceInCents / 100).toFixed(2).replace(".", ",")}`,
          };
        },
      },

      // 4. Confirmar agendamento via Hold
      {
        name: "confirm_booking",
        description: "Confirma definitivamente o agendamento a partir do token de reserva temporaria.",
        schema: z.object({
          token: z.string().min(1),
          contactId: z.string().min(1),
          serviceId: z.string().min(1),
        }),
        execute: async (args, context) => {
          const appointment = await AppointmentService.confirmHold(
            { organizationId: context.organizationId, token: args.token },
            args.contactId,
            args.serviceId
          );
          return {
            status: "CONFIRMED",
            appointmentId: appointment.id,
            startTime: appointment.startTime.toISOString(),
            professional: appointment.professional.name,
          };
        },
      },

      // 5. Listar cursos da Escola Barone
      {
        name: "list_courses",
        description: "Lista os cursos profissionalizantes da Barone Academy com carga horaria e precos.",
        schema: z.object({
          modality: z.string().optional(),
        }),
        execute: async (args, context) => {
          const courses = await CourseService.listByOrganization(context.organizationId, {
            modality: args.modality,
          });
          return courses.map((c) => ({
            id: c.id,
            name: c.name,
            workloadHours: `${c.workloadHours} horas`,
            modality: c.modality,
            price: `R$ ${(c.priceInCents / 100).toFixed(2).replace(".", ",")}`,
          }));
        },
      },

      // 6. Pre-matricula em curso
      {
        name: "reserve_course_seat",
        description: "Reserva provisoriamente uma vaga na turma da escola Barone.",
        schema: z.object({
          classGroupId: z.string().min(1),
          customerName: z.string().min(2),
          customerPhone: z.string().min(8),
        }),
        execute: async (args, context) => {
          const enrollment = await EnrollmentService.preEnroll({
            organizationId: context.organizationId,
            classGroupId: args.classGroupId,
            customerName: args.customerName,
            customerPhone: args.customerPhone,
          });
          return {
            status: "RESERVED",
            enrollmentId: enrollment.id,
            studentName: enrollment.contact.name,
            classCode: enrollment.classGroup.code,
            priceFormatted: `R$ ${(enrollment.priceInCents / 100).toFixed(2).replace(".", ",")}`,
          };
        },
      },
    ];
  }
}


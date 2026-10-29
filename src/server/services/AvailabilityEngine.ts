import { prisma } from "../db/prisma";
import { QueryAvailabilityInput, QueryAvailabilitySchema } from "../validators/appointment.schema";

export interface AvailableSlot {
  professionalId: string;
  professionalName: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  timeLabel: string; // Ex: "09:00"
}

export class AvailabilityEngine {
  /**
   * Calcula todos os slots de horarios disponiveis para agendamento.
   */
  static async getAvailableSlots(rawInput: QueryAvailabilityInput): Promise<AvailableSlot[]> {
    const validated = QueryAvailabilitySchema.parse(rawInput);

    const [unit, service] = await Promise.all([
      prisma.unit.findFirst({
        where: { id: validated.unitId, organizationId: validated.organizationId },
      }),
      prisma.service.findFirst({
        where: { id: validated.serviceId, organizationId: validated.organizationId, active: true },
      }),
    ]);

    if (!unit) {
      throw new Error("Unidade nao encontrada ou acesso negado.");
    }
    if (!service) {
      throw new Error("Servico nao encontrado ou inativo.");
    }

    const durationMinutes = service.durationMinutes;

    // Converte a data alvo YYYY-MM-DD para objeto Date
    const [year, month, day] = validated.targetDate.split("-").map(Number);
    const targetDateLocal = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = targetDateLocal.getUTCDay();

    // Inicio e fim do dia em UTC para consulta
    const dayStartUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const dayEndUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // Busca profissionais habilitados
    const professionals = await prisma.professional.findMany({
      where: {
        organizationId: validated.organizationId,
        active: true,
        ...(validated.professionalId ? { id: validated.professionalId } : {}),
      },
      include: {
        workSchedules: {
          where: { dayOfWeek, active: true },
        },
      },
    });

    const now = new Date();
    const availableSlots: AvailableSlot[] = [];

    for (const prof of professionals) {
      const schedule = prof.workSchedules[0];
      if (!schedule) {
        continue; // Nao atende neste dia
      }

      const [startHour, startMin] = schedule.startTime.split(":").map(Number);
      const [endHour, endMin] = schedule.endTime.split(":").map(Number);

      const dayScheduleStartMin = startHour * 60 + startMin;
      const dayScheduleEndMin = endHour * 60 + endMin;

      let breakStartMin: number | null = null;
      let breakEndMin: number | null = null;
      if (schedule.breakStartTime && schedule.breakEndTime) {
        const [bSh, bSm] = schedule.breakStartTime.split(":").map(Number);
        const [bEh, bEm] = schedule.breakEndTime.split(":").map(Number);
        breakStartMin = bSh * 60 + bSm;
        breakEndMin = bEh * 60 + bEm;
      }

      // Busca agendamentos e holds ativos do profissional no dia
      const [existingAppointments, activeHolds] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            professionalId: prof.id,
            status: { in: ["SCHEDULED", "CONFIRMED"] },
            startTime: { lt: dayEndUtc },
            endTime: { gt: dayStartUtc },
          },
        }),
        prisma.bookingHold.findMany({
          where: {
            professionalId: prof.id,
            status: "HOLD",
            expiresAt: { gt: now },
            startTime: { lt: dayEndUtc },
            endTime: { gt: dayStartUtc },
          },
        }),
      ]);

      // Mapeia ocupacoes em minutos a partir da meia noite
      const busyIntervals: { start: number; end: number }[] = [];

      for (const app of existingAppointments) {
        const appStartMin = app.startTime.getUTCHours() * 60 + app.startTime.getUTCMinutes();
        const appEndMin = app.endTime.getUTCHours() * 60 + app.endTime.getUTCMinutes();
        busyIntervals.push({ start: appStartMin, end: appEndMin });
      }

      for (const hold of activeHolds) {
        const holdStartMin = hold.startTime.getUTCHours() * 60 + hold.startTime.getUTCMinutes();
        const holdEndMin = hold.endTime.getUTCHours() * 60 + hold.endTime.getUTCMinutes();
        busyIntervals.push({ start: holdStartMin, end: holdEndMin });
      }

      // Intervalo de geracao de slots a cada 30 minutos
      const stepMinutes = 30;
      for (
        let currentMin = dayScheduleStartMin;
        currentMin + durationMinutes <= dayScheduleEndMin;
        currentMin += stepMinutes
      ) {
        const slotEndMin = currentMin + durationMinutes;

        // Verifica se conflita com o almoco
        if (breakStartMin !== null && breakEndMin !== null) {
          if (currentMin < breakEndMin && slotEndMin > breakStartMin) {
            continue;
          }
        }

        // Verifica conflito com agendamentos ou holds
        const hasConflict = busyIntervals.some(
          (interval) => currentMin < interval.end && slotEndMin > interval.start
        );

        if (!hasConflict) {
          const slotHour = Math.floor(currentMin / 60);
          const slotMinute = currentMin % 60;
          const endSlotHour = Math.floor(slotEndMin / 60);
          const endSlotMinute = slotEndMin % 60;

          const slotStartUtc = new Date(Date.UTC(year, month - 1, day, slotHour, slotMinute, 0));
          const slotEndUtc = new Date(Date.UTC(year, month - 1, day, endSlotHour, endSlotMinute, 0));

          // Se a data for hoje, nao oferece horarios que ja passaram
          if (slotStartUtc > now) {
            const timeLabel = `${String(slotHour).padStart(2, "0")}:${String(slotMinute).padStart(2, "0")}`;
            availableSlots.push({
              professionalId: prof.id,
              professionalName: prof.name,
              startTimeUtc: slotStartUtc,
              endTimeUtc: slotEndUtc,
              timeLabel,
            });
          }
        }
      }
    }

    return availableSlots.sort((a, b) => a.startTimeUtc.getTime() - b.startTimeUtc.getTime());
  }
}

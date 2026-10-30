import crypto from "node:crypto";
import { prisma } from "../db/prisma";
import { formatBrazilianPhoneNumber, sanitizeCustomerName } from "../utils/phone-sanitizer";
import {
  CancelAppointmentInput,
  CancelAppointmentSchema,
  ConfirmBookingHoldInput,
  ConfirmBookingHoldSchema,
  CreateAppointmentInput,
  CreateAppointmentSchema,
  CreateBookingHoldInput,
  CreateBookingHoldSchema,
} from "../validators/appointment.schema";
import { AuditService } from "./AuditService";

export class AppointmentService {
  /**
   * Cria uma reserva temporaria (Booking Hold) de 10 minutos para prevencao de concorrencia.
   */
  static async createBookingHold(rawInput: CreateBookingHoldInput) {
    const validated = CreateBookingHoldSchema.parse(rawInput);

    const service = await prisma.service.findFirst({
      where: { id: validated.serviceId, organizationId: validated.organizationId, active: true },
    });

    if (!service) {
      throw new Error("Servico nao encontrado ou inativo.");
    }

    const startTime = validated.startTime;
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos de trava

    // Transacao atomica para garantir que nao haja conflito
    return prisma.$transaction(async (tx) => {
      // 1. Verifica agendamentos existentes no periodo
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          professionalId: validated.professionalId,
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (conflictingAppointment) {
        throw new Error("Horario indisponivel: ja existe um agendamento confirmado para este profissional.");
      }

      // 2. Verifica holds ativos nao expirados
      const conflictingHold = await tx.bookingHold.findFirst({
        where: {
          professionalId: validated.professionalId,
          status: "HOLD",
          expiresAt: { gt: now },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (conflictingHold) {
        throw new Error("Horario temporariamente reservado por outro cliente. Tente novamente em alguns minutos.");
      }

      // 3. Localiza ou cria o contato com telefone sanitizado
      const cleanPhone = formatBrazilianPhoneNumber(validated.customerPhone);
      const cleanName = sanitizeCustomerName(validated.customerName);

      let contact = await tx.contact.findFirst({
        where: {
          organizationId: validated.organizationId,
          phone: cleanPhone,
        },
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            organizationId: validated.organizationId,
            name: cleanName,
            phone: cleanPhone,
          },
        });
      }

      // 4. Cria o BookingHold
      const token = crypto.randomUUID();
      const hold = await tx.bookingHold.create({
        data: {
          organizationId: validated.organizationId,
          unitId: validated.unitId,
          professionalId: validated.professionalId,
          startTime,
          endTime,
          status: "HOLD",
          token,
          expiresAt,
        },
      });

      return {
        hold,
        token,
        contactId: contact.id,
        serviceId: service.id,
        durationMinutes: service.durationMinutes,
        priceInCents: service.priceInCents,
        expiresAt,
      };
    });
  }

  /**
   * Confirma um Booking Hold transformando-o em agendamento definitivo de forma atomica.
   */
  static async confirmHold(rawInput: ConfirmBookingHoldInput, contactId: string, serviceId: string) {
    const validated = ConfirmBookingHoldSchema.parse(rawInput);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const hold = await tx.bookingHold.findUnique({
        where: { token: validated.token },
      });

      if (!hold || hold.organizationId !== validated.organizationId) {
        throw new Error("Reserva temporaria nao encontrada para esta organizacao.");
      }

      if (hold.status !== "HOLD") {
        throw new Error(`Reserva temporaria ja foi processada com status: ${hold.status}`);
      }

      if (hold.expiresAt < now) {
        await tx.bookingHold.update({
          where: { id: hold.id },
          data: { status: "EXPIRED" },
        });
        throw new Error("Reserva temporaria expirada (limite de 10 minutos excedido). Selecione o horario novamente.");
      }

      const service = await tx.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new Error("Servico especificado nao encontrado.");
      }

      // Atualiza o hold para CONVERTED
      await tx.bookingHold.update({
        where: { id: hold.id },
        data: { status: "CONVERTED" },
      });

      // Cria o Appointment definitivo
      const appointment = await tx.appointment.create({
        data: {
          organizationId: hold.organizationId,
          unitId: hold.unitId,
          professionalId: hold.professionalId,
          contactId,
          startTime: hold.startTime,
          endTime: hold.endTime,
          status: "CONFIRMED",
          totalInCents: service.priceInCents,
          notes: validated.notes,
        },
        include: {
          professional: { select: { id: true, name: true, phone: true } },
          contact: { select: { id: true, name: true, phone: true } },
          unit: { select: { id: true, name: true, timezone: true } },
        },
      });

      await AuditService.logEvent({
        organizationId: appointment.organizationId,
        unitId: appointment.unitId,
        action: "APPOINTMENT_CONFIRMED_VIA_HOLD",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: {
          professionalId: appointment.professionalId,
          startTime: appointment.startTime.toISOString(),
          totalInCents: appointment.totalInCents,
        },
      });

      return appointment;
    });
  }

  /**
   * Cria agendamento direto na recepcao/balcao.
   */
  static async createDirect(rawInput: CreateAppointmentInput, actorId?: string) {
    const validated = CreateAppointmentSchema.parse(rawInput);

    const service = await prisma.service.findFirst({
      where: { id: validated.serviceId, organizationId: validated.organizationId, active: true },
    });

    if (!service) {
      throw new Error("Servico nao encontrado.");
    }

    const startTime = validated.startTime;
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          professionalId: validated.professionalId,
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (conflict) {
        throw new Error("Conflito de horario: profissional ja possui agendamento no periodo.");
      }

      const appointment = await tx.appointment.create({
        data: {
          organizationId: validated.organizationId,
          unitId: validated.unitId,
          professionalId: validated.professionalId,
          contactId: validated.contactId,
          serviceId: validated.serviceId,
          startTime,
          endTime,
          status: "CONFIRMED",
          totalInCents: service.priceInCents,
          notes: validated.notes,
        },
        include: {
          professional: true,
          contact: true,
          service: true,
        },
      });

      await AuditService.logEvent({
        organizationId: appointment.organizationId,
        unitId: appointment.unitId,
        actorId,
        action: "APPOINTMENT_CREATED_DIRECT",
        entityType: "Appointment",
        entityId: appointment.id,
        metadata: { totalInCents: appointment.totalInCents },
      });

      return appointment;
    });
  }

  /**
   * Cancela agendamento e libera o horario.
   */
  static async cancel(rawInput: CancelAppointmentInput) {
    const validated = CancelAppointmentSchema.parse(rawInput);

    const appointment = await prisma.appointment.findFirst({
      where: { id: validated.appointmentId, organizationId: validated.organizationId },
    });

    if (!appointment) {
      throw new Error("Agendamento nao encontrado ou nao pertence a esta organizacao.");
    }

    const updated = await prisma.appointment.update({
      where: { id: validated.appointmentId },
      data: {
        status: "CANCELLED",
        notes: appointment.notes ? `${appointment.notes} | Cancelado: ${validated.reason}` : `Cancelado: ${validated.reason}`,
      },
    });

    await AuditService.logEvent({
      organizationId: validated.organizationId,
      unitId: updated.unitId,
      actorId: validated.actorId,
      action: "APPOINTMENT_CANCELLED",
      entityType: "Appointment",
      entityId: updated.id,
      metadata: { reason: validated.reason },
    });

    return updated;
  }

  /**
   * Lista agendamentos com filtros flexiveis e relacionamentos completos.
   */
  static async list(filter: {
    organizationId: string;
    unitId?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    professionalId?: string;
    status?: any;
  }) {
    const whereClause: any = {
      organizationId: filter.organizationId,
    };

    if (filter.unitId) {
      whereClause.unitId = filter.unitId;
    }

    if (filter.professionalId) {
      whereClause.professionalId = filter.professionalId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      whereClause.startTime = {};
      if (filter.startDate) {
        whereClause.startTime.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        whereClause.startTime.lte = new Date(filter.endDate);
      }
    }

    return prisma.appointment.findMany({
      where: whereClause,
      include: {
        professional: {
          select: { id: true, name: true, nickname: true, phone: true, color: true },
        },
        contact: {
          select: { id: true, name: true, phone: true },
        },
        service: {
          select: { id: true, name: true, durationMinutes: true, priceInCents: true, color: true },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  /**
   * Atualiza status, horario ou profissional de um agendamento.
   */
  static async update(
    id: string,
    data: {
      status?: any;
      notes?: string;
      startTime?: Date | string;
      endTime?: Date | string;
      professionalId?: string;
    }
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new Error("Agendamento nao encontrado.");
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.professionalId) updateData.professionalId = data.professionalId;
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        professional: true,
        contact: true,
        service: true,
      },
    });

    await AuditService.logEvent({
      organizationId: updated.organizationId,
      unitId: updated.unitId,
      action: "APPOINTMENT_UPDATED",
      entityType: "Appointment",
      entityId: updated.id,
      metadata: data,
    });

    return updated;
  }

  /**
   * Remove agendamento permanentemente.
   */
  static async delete(id: string) {
    return prisma.appointment.delete({
      where: { id },
    });
  }
}

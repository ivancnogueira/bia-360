import { prisma } from "../db/prisma";
import {
  CreateProfessionalInput,
  CreateProfessionalSchema,
  UpdateProfessionalInput,
  UpdateProfessionalSchema,
  WorkScheduleItemInput,
} from "../validators/professional.schema";
import { AuditService } from "./AuditService";

export class ProfessionalService {
  /**
   * Cria novo profissional com horarios semanais opcionais.
   */
  static async create(rawInput: CreateProfessionalInput, actorId?: string) {
    const validated = CreateProfessionalSchema.parse(rawInput);

    const professional = await prisma.professional.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        nickname: validated.nickname,
        phone: validated.phone,
        commissionRate: validated.commissionRate,
        color: validated.color,
        active: validated.active,
        workSchedules: validated.schedules
          ? {
              create: validated.schedules.map((s) => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                breakStartTime: s.breakStartTime,
                breakEndTime: s.breakEndTime,
                active: s.active,
              })),
            }
          : undefined,
      },
      include: {
        workSchedules: true,
      },
    });

    await AuditService.logEvent({
      organizationId: professional.organizationId,
      actorId,
      action: "PROFESSIONAL_CREATED",
      entityType: "Professional",
      entityId: professional.id,
      metadata: { name: professional.name, commissionRate: professional.commissionRate },
    });

    return professional;
  }

  /**
   * Lista todos os profissionais de uma organizacao.
   */
  static async listByOrganization(organizationId: string, options?: { activeOnly?: boolean }) {
    return prisma.professional.findMany({
      where: {
        organizationId,
        ...(options?.activeOnly !== false ? { active: true } : {}),
      },
      include: {
        workSchedules: { where: { active: true }, orderBy: { dayOfWeek: "asc" } },
        services: { include: { service: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Busca profissional por id garantindo isolamento da organizacao.
   */
  static async getById(organizationId: string, professionalId: string) {
    const professional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        organizationId,
      },
      include: {
        workSchedules: { orderBy: { dayOfWeek: "asc" } },
        services: { include: { service: true } },
      },
    });

    if (!professional) {
      throw new Error("Profissional nao encontrado ou nao pertence a esta organizacao.");
    }

    return professional;
  }

  /**
   * Atualiza dados cadastrais do profissional.
   */
  static async update(
    organizationId: string,
    professionalId: string,
    rawInput: UpdateProfessionalInput,
    actorId?: string
  ) {
    const validated = UpdateProfessionalSchema.parse(rawInput);

    await this.getById(organizationId, professionalId);

    const updated = await prisma.professional.update({
      where: { id: professionalId },
      data: {
        name: validated.name,
        nickname: validated.nickname,
        phone: validated.phone,
        commissionRate: validated.commissionRate,
        color: validated.color,
        active: validated.active,
      },
    });

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "PROFESSIONAL_UPDATED",
      entityType: "Professional",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Configura ou substitui a grade semanal de trabalho do profissional.
   */
  static async setWorkSchedules(
    organizationId: string,
    professionalId: string,
    schedules: WorkScheduleItemInput[],
    actorId?: string
  ) {
    await this.getById(organizationId, professionalId);

    // Substitui a grade inteira em transacao
    await prisma.$transaction([
      prisma.workSchedule.deleteMany({
        where: { professionalId },
      }),
      prisma.workSchedule.createMany({
        data: schedules.map((s) => ({
          professionalId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          breakStartTime: s.breakStartTime,
          breakEndTime: s.breakEndTime,
          active: s.active,
        })),
      }),
    ]);

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "PROFESSIONAL_SCHEDULE_UPDATED",
      entityType: "Professional",
      entityId: professionalId,
      metadata: { scheduleCount: schedules.length },
    });

    return this.getById(organizationId, professionalId);
  }

  /**
   * Vincula catalogo de servicos habilitados para o profissional.
   */
  static async setServices(
    organizationId: string,
    professionalId: string,
    serviceBindings: { serviceId: string; customPriceInCents?: number | null; customCommission?: number | null }[],
    actorId?: string
  ) {
    await this.getById(organizationId, professionalId);

    await prisma.$transaction([
      prisma.professionalService.deleteMany({
        where: { professionalId },
      }),
      prisma.professionalService.createMany({
        data: serviceBindings.map((sb) => ({
          professionalId,
          serviceId: sb.serviceId,
          customPriceInCents: sb.customPriceInCents ?? null,
          customCommission: sb.customCommission ?? null,
        })),
      }),
    ]);

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "PROFESSIONAL_SERVICES_BOUND",
      entityType: "Professional",
      entityId: professionalId,
      metadata: { boundServicesCount: serviceBindings.length },
    });

    return this.getById(organizationId, professionalId);
  }
}

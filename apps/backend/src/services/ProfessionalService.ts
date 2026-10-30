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

    // Gera slug amigavel se nao fornecido
    const baseSlug = validated.slug
      ? validated.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : (validated.nickname || validated.name)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

    const slug = baseSlug || `barbeiro-${Date.now().toString(36)}`;

    const professional = await prisma.professional.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        nickname: validated.nickname,
        email: validated.email,
        phone: validated.phone,
        slug,
        scheduleId: validated.scheduleId,
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
        schedule: true,
      },
    });

    await AuditService.logEvent({
      organizationId: professional.organizationId,
      actorId,
      action: "PROFESSIONAL_CREATED",
      entityType: "Professional",
      entityId: professional.id,
      metadata: { name: professional.name, commissionRate: professional.commissionRate, slug },
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
        schedule: { include: { workSchedules: true } },
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
        schedule: { include: { workSchedules: true } },
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

    const slug = validated.slug
      ? validated.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : undefined;

    const updated = await prisma.professional.update({
      where: { id: professionalId },
      data: {
        ...(validated.name ? { name: validated.name } : {}),
        ...(validated.nickname !== undefined ? { nickname: validated.nickname } : {}),
        ...(validated.email !== undefined ? { email: validated.email } : {}),
        ...(validated.phone !== undefined ? { phone: validated.phone } : {}),
        ...(slug ? { slug } : {}),
        ...(validated.scheduleId !== undefined ? { scheduleId: validated.scheduleId } : {}),
        ...(validated.commissionRate !== undefined ? { commissionRate: validated.commissionRate } : {}),
        ...(validated.color ? { color: validated.color } : {}),
        ...(validated.active !== undefined ? { active: validated.active } : {}),
      },
      include: {
        schedule: true,
        workSchedules: true,
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
   * Exclui ou desativa profissional.
   */
  static async delete(organizationId: string, professionalId: string) {
    await this.getById(organizationId, professionalId);

    await prisma.professional.update({
      where: { id: professionalId },
      data: { active: false },
    });

    return { success: true };
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

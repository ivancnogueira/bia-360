import { prisma } from "../db/prisma";
import {
  CreateServiceInput,
  CreateServiceSchema,
  UpdateServiceInput,
  UpdateServiceSchema,
} from "../validators/service.schema";
import { AuditService } from "./AuditService";

export class ServiceDomainService {
  /**
   * Cria novo servico no catalogo da organizacao.
   */
  static async create(rawInput: CreateServiceInput, actorId?: string) {
    const validated = CreateServiceSchema.parse(rawInput);

    const service = await prisma.service.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        description: validated.description,
        durationMinutes: validated.durationMinutes,
        priceInCents: validated.priceInCents,
        category: validated.category,
        categoryId: validated.categoryId || null,
        bufferBeforeMinutes: validated.bufferBeforeMinutes,
        bufferAfterMinutes: validated.bufferAfterMinutes,
        color: validated.color,
        active: validated.active,
      },
    });

    await AuditService.logEvent({
      organizationId: service.organizationId,
      actorId,
      action: "SERVICE_CREATED",
      entityType: "Service",
      entityId: service.id,
      metadata: { name: service.name, priceInCents: service.priceInCents },
    });

    return service;
  }

  /**
   * Lista todos os servicos da organizacao.
   */
  static async listByOrganization(organizationId: string, options?: { category?: string; activeOnly?: boolean }) {
    return prisma.service.findMany({
      where: {
        organizationId,
        ...(options?.category ? { category: options.category } : {}),
        ...(options?.activeOnly !== false ? { active: true } : {}),
      },
      include: {
        serviceCategory: true,
        professionals: {
          include: {
            professional: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Busca servico por id garantindo isolamento multi-tenant.
   */
  static async getById(organizationId: string, serviceId: string) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId,
      },
      include: {
        serviceCategory: true,
        professionals: {
          include: {
            professional: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    });

    if (!service) {
      throw new Error("Servico nao encontrado ou nao pertence a esta organizacao.");
    }

    return service;
  }

  /**
   * Atualiza dados de um servico.
   */
  static async update(
    organizationId: string,
    serviceId: string,
    rawInput: UpdateServiceInput,
    actorId?: string
  ) {
    const validated = UpdateServiceSchema.parse(rawInput);

    await this.getById(organizationId, serviceId);

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: validated,
    });

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "SERVICE_UPDATED",
      entityType: "Service",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Desativa um servico mantendo historico de atendimentos.
   */
  static async deactivate(organizationId: string, serviceId: string, actorId?: string) {
    await this.getById(organizationId, serviceId);

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: { active: false },
    });

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "SERVICE_DEACTIVATED",
      entityType: "Service",
      entityId: updated.id,
    });

    return updated;
  }
}

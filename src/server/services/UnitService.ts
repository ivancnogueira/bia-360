import { prisma } from "../db/prisma";
import {
  CreateUnitInput,
  CreateUnitSchema,
  UpdateUnitInput,
  UpdateUnitSchema,
} from "../validators/unit.schema";
import { AuditService } from "./AuditService";

export class UnitService {
  /**
   * Cria nova unidade vinculada obrigatoriamente a uma organizacao.
   */
  static async create(rawInput: CreateUnitInput, actorId?: string) {
    const validated = CreateUnitSchema.parse(rawInput);

    const organization = await prisma.organization.findUnique({
      where: { id: validated.organizationId },
    });

    if (!organization) {
      throw new Error(`Organizacao com id "${validated.organizationId}" nao encontrada.`);
    }

    const unit = await prisma.unit.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        address: validated.address,
        phone: validated.phone,
        timezone: validated.timezone,
        active: true,
      },
    });

    await AuditService.logEvent({
      organizationId: unit.organizationId,
      unitId: unit.id,
      actorId,
      action: "UNIT_CREATED",
      entityType: "Unit",
      entityId: unit.id,
      metadata: { name: unit.name },
    });

    return unit;
  }

  /**
   * Lista unidades pertencentes estritamente a organizacao informada.
   */
  static async listByOrganization(organizationId: string) {
    return prisma.unit.findMany({
      where: {
        organizationId,
        active: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Busca unidade por id garantindo o isolamento multi-tenant da organizacao.
   */
  static async getById(organizationId: string, unitId: string) {
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        organizationId,
      },
    });

    if (!unit) {
      throw new Error(
        `Unidade nao encontrada ou acesso negado para a organizacao especificada.`
      );
    }

    return unit;
  }

  /**
   * Atualiza dados da unidade assegurando isolamento multi-tenant.
   */
  static async update(
    organizationId: string,
    unitId: string,
    rawInput: UpdateUnitInput,
    actorId?: string
  ) {
    const validated = UpdateUnitSchema.parse(rawInput);

    // Garante que a unidade existe e pertence a organizacao
    await this.getById(organizationId, unitId);

    const updated = await prisma.unit.update({
      where: { id: unitId },
      data: validated,
    });

    await AuditService.logEvent({
      organizationId,
      unitId: updated.id,
      actorId,
      action: "UNIT_UPDATED",
      entityType: "Unit",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Desativa uma unidade com validacao de tenant.
   */
  static async deactivate(organizationId: string, unitId: string, actorId?: string) {
    await this.getById(organizationId, unitId);

    const updated = await prisma.unit.update({
      where: { id: unitId },
      data: { active: false },
    });

    await AuditService.logEvent({
      organizationId,
      unitId: updated.id,
      actorId,
      action: "UNIT_DEACTIVATED",
      entityType: "Unit",
      entityId: updated.id,
    });

    return updated;
  }
}

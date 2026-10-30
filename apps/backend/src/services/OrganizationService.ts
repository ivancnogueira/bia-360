import { prisma } from "../db/prisma";
import {
  CreateOrganizationInput,
  CreateOrganizationSchema,
  UpdateOrganizationInput,
  UpdateOrganizationSchema,
} from "../validators/organization.schema";
import { AuditService } from "./AuditService";

export class OrganizationService {
  /**
   * Cria uma nova organizacao validando schema e persistindo no banco.
   */
  static async create(rawInput: CreateOrganizationInput, actorId?: string) {
    const validated = CreateOrganizationSchema.parse(rawInput);

    const existingSlug = await prisma.organization.findUnique({
      where: { slug: validated.slug },
    });

    if (existingSlug) {
      throw new Error(`O slug "${validated.slug}" ja esta em uso por outra organizacao.`);
    }

    const organization = await prisma.organization.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        document: validated.document,
        phone: validated.phone,
        active: true,
      },
    });

    await AuditService.logEvent({
      organizationId: organization.id,
      actorId,
      action: "ORGANIZATION_CREATED",
      entityType: "Organization",
      entityId: organization.id,
      metadata: { name: organization.name, slug: organization.slug },
    });

    return organization;
  }

  /**
   * Busca organizacao por identificador unico.
   */
  static async getById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        units: { where: { active: true } },
      },
    });
  }

  /**
   * Busca organizacao por slug publico.
   */
  static async getBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug },
      include: {
        units: { where: { active: true } },
      },
    });
  }

  /**
   * Atualiza dados de uma organizacao existente.
   */
  static async update(id: string, rawInput: UpdateOrganizationInput, actorId?: string) {
    const validated = UpdateOrganizationSchema.parse(rawInput);

    if (validated.slug) {
      const existingSlug = await prisma.organization.findFirst({
        where: {
          slug: validated.slug,
          NOT: { id },
        },
      });

      if (existingSlug) {
        throw new Error(`O slug "${validated.slug}" ja esta em uso.`);
      }
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: validated,
    });

    await AuditService.logEvent({
      organizationId: updated.id,
      actorId,
      action: "ORGANIZATION_UPDATED",
      entityType: "Organization",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Garante que uma organizacao e unidade padrao existam para operacao local e testes.
   */
  static async ensureDefaultOrganization(id: string = "org-barone-matriz") {
    const existing = await prisma.organization.findUnique({
      where: { id },
      include: { units: true },
    });
    if (existing) {
      if (existing.units.length === 0) {
        await prisma.unit.create({
          data: {
            id: "unit-matriz",
            organizationId: id,
            name: "Barone Matriz Centro",
            timezone: "America/Sao_Paulo",
            active: true,
          },
        });
      }
      return existing;
    }

    const org = await prisma.organization.create({
      data: {
        id,
        name: "Barone Academy Matriz",
        slug: "barone-academy-matriz",
        email: "contato@baroneacademy.com",
        phone: "5541999999999",
        active: true,
        units: {
          create: {
            id: "unit-matriz",
            name: "Barone Matriz Centro",
            timezone: "America/Sao_Paulo",
            active: true,
          },
        },
      },
      include: { units: true },
    });

    return org;
  }

  /**
   * Desativa uma organizacao.
   */
  static async deactivate(id: string, actorId?: string) {
    const updated = await prisma.organization.update({
      where: { id },
      data: { active: false },
    });

    await AuditService.logEvent({
      organizationId: updated.id,
      actorId,
      action: "ORGANIZATION_DEACTIVATED",
      entityType: "Organization",
      entityId: updated.id,
    });

    return updated;
  }
}


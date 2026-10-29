import { prisma } from "../db/prisma";
import { RoleType } from "@prisma/client";
import {
  CreateMemberInput,
  CreateMemberSchema,
  UpdateMemberInput,
  UpdateMemberSchema,
} from "../validators/member.schema";
import { AuditService } from "./AuditService";

export class MemberService {
  /**
   * Adiciona um membro a organizacao apos validar dados e autorizacao do solicitante.
   */
  static async addMember(
    rawInput: CreateMemberInput,
    actorUserId?: string
  ) {
    const validated = CreateMemberSchema.parse(rawInput);

    if (actorUserId) {
      await this.assertUserHasAdminRole(validated.organizationId, actorUserId);
    }

    const existingMember = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: validated.organizationId,
          userId: validated.userId,
        },
      },
    });

    if (existingMember) {
      throw new Error("O usuario ja e membro desta organizacao.");
    }

    const member = await prisma.member.create({
      data: {
        organizationId: validated.organizationId,
        userId: validated.userId,
        unitId: validated.unitId ?? null,
        role: validated.role,
        active: validated.active ?? true,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    await AuditService.logEvent({
      organizationId: member.organizationId,
      unitId: member.unitId,
      actorId: actorUserId,
      action: "MEMBER_ADDED",
      entityType: "Member",
      entityId: member.id,
      metadata: { userId: member.userId, role: member.role },
    });

    return member;
  }

  /**
   * Lista todos os membros de uma organizacao.
   */
  static async listByOrganization(organizationId: string, options?: { unitId?: string }) {
    return prisma.member.findMany({
      where: {
        organizationId,
        ...(options?.unitId ? { unitId: options.unitId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        unit: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Busca membro garantindo pertencimento a organizacao informada.
   */
  static async getById(organizationId: string, memberId: string) {
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        unit: { select: { id: true, name: true } },
      },
    });

    if (!member) {
      throw new Error("Membro nao encontrado ou nao pertence a esta organizacao.");
    }

    return member;
  }

  /**
   * Atualiza papel ou unidade de um membro.
   */
  static async update(
    organizationId: string,
    memberId: string,
    rawInput: UpdateMemberInput,
    actorUserId?: string
  ) {
    const validated = UpdateMemberSchema.parse(rawInput);

    if (actorUserId) {
      await this.assertUserHasAdminRole(organizationId, actorUserId);
    }

    await this.getById(organizationId, memberId);

    const updated = await prisma.member.update({
      where: { id: memberId },
      data: validated,
    });

    await AuditService.logEvent({
      organizationId,
      unitId: updated.unitId,
      actorId: actorUserId,
      action: "MEMBER_UPDATED",
      entityType: "Member",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Valida se o usuario solicitante possui papel com privilegios administrativos na organizacao.
   */
  private static async assertUserHasAdminRole(
    organizationId: string,
    userId: string
  ): Promise<void> {
    const member = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member || !member.active) {
      throw new Error("Acesso negado: usuario nao e membro ativo desta organizacao.");
    }

    const privilegedRoles: RoleType[] = [RoleType.OWNER, RoleType.MANAGER];
    if (!privilegedRoles.includes(member.role)) {
      throw new Error("Acesso negado: acao requer privilegios de proprietario ou gerente.");
    }
  }
}


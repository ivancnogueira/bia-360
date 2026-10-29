import { prisma } from "../db/prisma";

export interface LogAuditEventInput {
  organizationId: string;
  unitId?: string | null;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export class AuditService {
  /**
   * Registra evento de auditoria de forma assincrona sem bloquear fluxo critico.
   */
  static async logEvent(data: LogAuditEventInput): Promise<void> {
    try {
      await prisma.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          unitId: data.unitId ?? null,
          actorId: data.actorId ?? null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
          ipAddress: data.ipAddress ?? null,
        },
      });
    } catch (error) {
      console.error("Falha ao gravar evento de auditoria no banco:", error);
    }
  }

  /**
   * Consulta registros de auditoria com isolamento estrito por organizacao.
   */
  static async listByOrganization(
    organizationId: string,
    options?: { unitId?: string; limit?: number; offset?: number }
  ) {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    return prisma.auditEvent.findMany({
      where: {
        organizationId,
        ...(options?.unitId ? { unitId: options.unitId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }
}


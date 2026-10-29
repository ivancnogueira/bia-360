import { prisma } from "../db/prisma";
import {
  CalculateCommissionFilterInput,
  SettleCommissionInput,
  SettleCommissionSchema,
} from "../validators/commission.schema";
import { CommissionEngine } from "./CommissionEngine";
import { AuditService } from "./AuditService";

export class CommissionService {
  /**
   * Emite relatorio consolidado de repasses por periodo.
   */
  static async getReport(rawInput: CalculateCommissionFilterInput) {
    return CommissionEngine.calculateCommissions(rawInput);
  }

  /**
   * Registra a liquidacao e repasse pago ao profissional.
   */
  static async settleCommission(rawInput: SettleCommissionInput, actorId?: string) {
    const validated = SettleCommissionSchema.parse(rawInput);

    const professional = await prisma.professional.findFirst({
      where: { id: validated.professionalId, organizationId: validated.organizationId },
    });

    if (!professional) {
      throw new Error("Profissional nao encontrado para esta organizacao.");
    }

    const now = new Date();

    const entry = await prisma.financialEntry.create({
      data: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        type: "EXPENSE",
        category: "comissao_barbeiro",
        description: `Repasse de comissao pago a ${professional.name}`,
        amountInCents: validated.amountInCents,
        dueDate: now,
        paidAt: now,
      },
    });

    await AuditService.logEvent({
      organizationId: validated.organizationId,
      unitId: validated.unitId,
      actorId,
      action: "COMMISSION_SETTLED",
      entityType: "FinancialEntry",
      entityId: entry.id,
      metadata: {
        professionalId: professional.id,
        professionalName: professional.name,
        amountInCents: validated.amountInCents,
        periodStart: validated.periodStart.toISOString(),
        periodEnd: validated.periodEnd.toISOString(),
        notes: validated.notes,
      },
    });

    return entry;
  }
}


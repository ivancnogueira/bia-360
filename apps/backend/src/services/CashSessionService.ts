import { prisma } from "../db/prisma";
import {
  CloseCashSessionInput,
  CloseCashSessionSchema,
  CreateFinancialEntryInput,
  CreateFinancialEntrySchema,
  OpenCashSessionInput,
  OpenCashSessionSchema,
} from "../validators/cash-session.schema";
import { AuditService } from "./AuditService";

export class CashSessionService {
  /**
   * Abre nova sessao de caixa para a unidade.
   */
  static async openSession(rawInput: OpenCashSessionInput, actorId?: string) {
    const validated = OpenCashSessionSchema.parse(rawInput);

    // Verifica se ja existe sessao aberta para esta unidade
    const existingOpenSession = await prisma.cashSession.findFirst({
      where: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        closedAt: null,
      },
    });

    if (existingOpenSession) {
      throw new Error("Ja existe uma sessao de caixa aberta para esta unidade. Feche-a antes de abrir nova.");
    }

    const session = await prisma.cashSession.create({
      data: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        openedByUserId: validated.openedByUserId,
        openingBalanceInCents: validated.openingBalanceInCents,
        openedAt: new Date(),
      },
    });

    await AuditService.logEvent({
      organizationId: session.organizationId,
      unitId: session.unitId,
      actorId: actorId ?? validated.openedByUserId,
      action: "CASH_SESSION_OPENED",
      entityType: "CashSession",
      entityId: session.id,
      metadata: { openingBalanceInCents: session.openingBalanceInCents },
    });

    return session;
  }

  /**
   * Registra sangria ou suprimento no caixa.
   */
  static async registerMovement(rawInput: CreateFinancialEntryInput, actorId?: string) {
    const validated = CreateFinancialEntrySchema.parse(rawInput);

    const entry = await prisma.financialEntry.create({
      data: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        type: validated.type,
        category: validated.category,
        description: validated.description,
        amountInCents: validated.amountInCents,
        dueDate: validated.dueDate,
        paidAt: validated.paidAt ?? new Date(),
      },
    });

    await AuditService.logEvent({
      organizationId: entry.organizationId,
      unitId: entry.unitId,
      actorId,
      action: validated.type === "REVENUE" ? "CASH_SUPPLY_REGISTERED" : "CASH_BLEED_REGISTERED",
      entityType: "FinancialEntry",
      entityId: entry.id,
      metadata: { amountInCents: entry.amountInCents, description: entry.description },
    });

    return entry;
  }

  /**
   * Encerra a sessao de caixa apurando o saldo esperado vs contado.
   */
  static async closeSession(rawInput: CloseCashSessionInput, actorId?: string) {
    const validated = CloseCashSessionSchema.parse(rawInput);

    const session = await prisma.cashSession.findFirst({
      where: { id: validated.cashSessionId, organizationId: validated.organizationId },
    });

    if (!session) {
      throw new Error("Sessao de caixa nao encontrada.");
    }

    if (session.closedAt !== null) {
      throw new Error("Esta sessao de caixa ja foi encerrada.");
    }

    const closedAt = new Date();

    // Calcula receitas e despesas registradas no periodo da sessao
    const entries = await prisma.financialEntry.findMany({
      where: {
        organizationId: validated.organizationId,
        unitId: session.unitId,
        paidAt: {
          gte: session.openedAt,
          lte: closedAt,
        },
      },
    });

    const totalIncomeInCents = entries
      .filter((e) => e.type === "REVENUE")
      .reduce((acc, curr) => acc + curr.amountInCents, 0);

    const totalExpenseInCents = entries
      .filter((e) => e.type === "EXPENSE")
      .reduce((acc, curr) => acc + curr.amountInCents, 0);

    const expectedBalanceInCents = session.openingBalanceInCents + totalIncomeInCents - totalExpenseInCents;
    const differenceInCents = validated.closingBalanceInCents - expectedBalanceInCents;

    const updated = await prisma.cashSession.update({
      where: { id: session.id },
      data: {
        closedByUserId: validated.closedByUserId,
        closingBalanceInCents: validated.closingBalanceInCents,
        closedAt,
      },
    });

    await AuditService.logEvent({
      organizationId: session.organizationId,
      unitId: session.unitId,
      actorId: actorId ?? validated.closedByUserId,
      action: "CASH_SESSION_CLOSED",
      entityType: "CashSession",
      entityId: session.id,
      metadata: {
        openingBalanceInCents: session.openingBalanceInCents,
        totalIncomeInCents,
        totalExpenseInCents,
        expectedBalanceInCents,
        closingBalanceInCents: validated.closingBalanceInCents,
        differenceInCents,
      },
    });

    return {
      session: updated,
      summary: {
        openingBalanceInCents: session.openingBalanceInCents,
        totalIncomeInCents,
        totalExpenseInCents,
        expectedBalanceInCents,
        closingBalanceInCents: validated.closingBalanceInCents,
        differenceInCents,
      },
    };
  }
}

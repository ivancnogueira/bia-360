import { prisma } from "../db/prisma";
import {
  CalculateCommissionFilterInput,
  CalculateCommissionFilterSchema,
} from "../validators/commission.schema";

export interface ProfessionalCommissionSummary {
  professionalId: string;
  professionalName: string;
  commissionRate: number;
  totalProducedInCents: number;
  totalCommissionInCents: number;
  itemsCount: number;
  items: {
    orderId: string;
    paidAt: Date;
    description: string;
    itemType: "service" | "product";
    totalInCents: number;
    appliedRate: number;
    commissionInCents: number;
  }[];
}

export class CommissionEngine {
  /**
   * Calcula o extrato de comissoes da equipe para o periodo informado.
   */
  static async calculateCommissions(
    rawInput: CalculateCommissionFilterInput
  ): Promise<ProfessionalCommissionSummary[]> {
    const validated = CalculateCommissionFilterSchema.parse(rawInput);

    // 1. Busca todas as comandas pagas no periodo para a organizacao
    const paidOrders = await prisma.order.findMany({
      where: {
        organizationId: validated.organizationId,
        status: "PAID",
        paidAt: {
          gte: validated.startDate,
          lte: validated.endDate,
        },
        ...(validated.unitId ? { unitId: validated.unitId } : {}),
      },
      include: {
        appointment: { select: { professionalId: true } },
        items: {
          include: {
            service: true,
            product: true,
            professional: true,
          },
        },
      },
    });

    // 2. Mapeamento por profissional
    const summariesMap = new Map<string, ProfessionalCommissionSummary>();

    for (const order of paidOrders) {
      const paidDate = order.paidAt ?? new Date();

      for (const item of order.items) {
        // O profissional do item pode ser o associado direto no item ou o do agendamento
        const effectiveProfessionalId = item.professionalId ?? order.appointment?.professionalId;
        if (!effectiveProfessionalId) {
          continue; // Item avulso sem barbeiro atribuido
        }

        if (validated.professionalId && effectiveProfessionalId !== validated.professionalId) {
          continue;
        }

        const professional =
          item.professional ??
          (await prisma.professional.findUnique({ where: { id: effectiveProfessionalId } }));

        if (!professional) {
          continue;
        }

        let summary = summariesMap.get(effectiveProfessionalId);
        if (!summary) {
          summary = {
            professionalId: professional.id,
            professionalName: professional.name,
            commissionRate: professional.commissionRate,
            totalProducedInCents: 0,
            totalCommissionInCents: 0,
            itemsCount: 0,
            items: [],
          };
          summariesMap.set(effectiveProfessionalId, summary);
        }

        // Determina a taxa de comissao aplicavel
        let appliedRate = professional.commissionRate;

        // Se for servico, verifica se existe taxa customizada na tabela profissional_services
        if (item.serviceId) {
          const customBinding = await prisma.professionalService.findUnique({
            where: {
              professionalId_serviceId: {
                professionalId: professional.id,
                serviceId: item.serviceId,
              },
            },
          });
          if (customBinding?.customCommission !== null && customBinding?.customCommission !== undefined) {
            appliedRate = customBinding.customCommission;
          }
        }

        const itemCommissionInCents = Math.round((item.totalInCents * appliedRate) / 100);

        summary.totalProducedInCents += item.totalInCents;
        summary.totalCommissionInCents += itemCommissionInCents;
        summary.itemsCount += 1;
        summary.items.push({
          orderId: order.id,
          paidAt: paidDate,
          description: item.service?.name ?? item.product?.name ?? "Item de comanda",
          itemType: item.serviceId ? "service" : "product",
          totalInCents: item.totalInCents,
          appliedRate,
          commissionInCents: itemCommissionInCents,
        });
      }
    }

    return Array.from(summariesMap.values()).sort(
      (a, b) => b.totalCommissionInCents - a.totalCommissionInCents
    );
  }
}


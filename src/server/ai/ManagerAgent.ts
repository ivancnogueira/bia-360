import { prisma } from "../db/prisma";
import { formatBrazilianPhoneNumber } from "../utils/phone-sanitizer";

export class ManagerAgent {
  /**
   * Verifica se o telefone pertence a um usuario gestor (OWNER ou MANAGER) da organizacao.
   */
  static async isManager(organizationId: string, phone: string): Promise<boolean> {
    const cleanPhone = formatBrazilianPhoneNumber(phone);

    const user = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        members: {
          some: {
            organizationId,
            active: true,
            role: { in: ["OWNER", "MANAGER"] },
          },
        },
      },
    });

    return !!user;
  }

  /**
   * Processa comando administrativo do gestor e gera relatorio executivo em texto.
   */
  static async handleManagerQuery(
    organizationId: string,
    unitId: string | undefined,
    query: string
  ): Promise<string> {
    const textLower = query.toLowerCase();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    if (textLower.includes("faturamento") || textLower.includes("caixa") || textLower.includes("receita")) {
      const paidOrders = await prisma.order.findMany({
        where: {
          organizationId,
          status: "PAID",
          paidAt: { gte: startOfDay, lte: endOfDay },
          ...(unitId ? { unitId } : {}),
        },
      });

      const totalRevenueInCents = paidOrders.reduce((acc, curr) => acc + curr.totalInCents, 0);
      const ordersCount = paidOrders.length;
      const formattedTotal = `R$ ${(totalRevenueInCents / 100).toFixed(2).replace(".", ",")}`;

      return `Relatorio de Faturamento do Dia:
Total faturado: ${formattedTotal}
Comandas finalizadas: ${ordersCount} atendimentos
Data de apuracao: ${today.toLocaleDateString("pt-BR")}`;
    }

    if (textLower.includes("agenda") || textLower.includes("ocupacao") || textLower.includes("horarios")) {
      const appointments = await prisma.appointment.findMany({
        where: {
          organizationId,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          ...(unitId ? { unitId } : {}),
        },
        include: { professional: { select: { name: true } } },
      });

      return `Ocupacao de Cadeiras Hoje:
Total de agendamentos: ${appointments.length} clientes
Profissionais em atendimento: ${new Set(appointments.map((a) => a.professional.name)).size} barbeiros`;
    }

    if (textLower.includes("turma") || textLower.includes("escola") || textLower.includes("aluno")) {
      const classGroups = await prisma.classGroup.findMany({
        where: { organizationId, active: true },
        include: {
          course: { select: { name: true } },
          _count: {
            select: { enrollments: { where: { status: { in: ["RESERVED", "ENROLLED"] } } } },
          },
        },
      });

      const lines = classGroups.map(
        (g) => `${g.code} (${g.course.name}): ${g._count.enrollments} de ${g.maxCapacity} vagas ocupadas`
      );

      return `Status das Turmas da Barone Academy:
${lines.join("\n") || "Nenhuma turma ativa no momento."}`;
    }

    return "Comando de gestao recebido. Voce pode consultar: faturamento do dia, ocupacao da agenda ou turmas da escola.";
  }
}


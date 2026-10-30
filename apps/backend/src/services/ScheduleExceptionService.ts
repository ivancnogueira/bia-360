import { prisma } from "../db/prisma";

export class ScheduleExceptionService {
  /**
   * Lista excecoes e folgas configuradas por organizacao e opcionalmente por profissional.
   */
  static async list(organizationId: string, professionalId?: string) {
    return prisma.scheduleException.findMany({
      where: {
        organizationId,
        ...(professionalId ? { professionalId } : {}),
      },
      include: {
        professional: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  /**
   * Cria nova excecao/folga de data.
   */
  static async create(data: {
    organizationId: string;
    professionalId?: string;
    date: string;
    isAvailable?: boolean;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }) {
    return prisma.scheduleException.create({
      data: {
        organizationId: data.organizationId,
        professionalId: data.professionalId || null,
        date: data.date,
        isAvailable: data.isAvailable ?? false,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        reason: data.reason || null,
      },
      include: {
        professional: true,
      },
    });
  }

  /**
   * Exclui uma excecao/folga de data.
   */
  static async delete(id: string, organizationId: string) {
    const existing = await prisma.scheduleException.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      throw new Error("Excecao de agenda nao encontrada.");
    }
    return prisma.scheduleException.delete({
      where: { id },
    });
  }
}


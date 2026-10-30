import { prisma } from "../db/prisma";

export interface ScheduleDayBlockInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  active: boolean;
}

export class ScheduleSchemeService {
  /**
   * Garante ao menos um esquema padrao (seed transparente)
   */
  private static async ensureDefault(organizationId: string) {
    const count = await prisma.scheduleScheme.count({
      where: { organizationId },
    });

    if (count === 0) {
      const defaultScheme = await prisma.scheduleScheme.create({
        data: {
          organizationId,
          name: "Horário Comercial Padrão",
          timeZone: "America/Sao_Paulo",
          isDefault: true,
          workSchedules: {
            create: [
              { dayOfWeek: 1, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
              { dayOfWeek: 2, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
              { dayOfWeek: 3, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
              { dayOfWeek: 4, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
              { dayOfWeek: 5, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
              { dayOfWeek: 6, startTime: "08:30", endTime: "18:00", breakStartTime: "12:30", breakEndTime: "13:30", active: true },
              { dayOfWeek: 0, startTime: "09:00", endTime: "14:00", active: false },
            ],
          },
        },
      });

      // Vincula barbeiros sem esquema para esse esquema padrao
      await prisma.professional.updateMany({
        where: { organizationId, scheduleId: null },
        data: { scheduleId: defaultScheme.id },
      });
    }
  }

  static async list(organizationId: string) {
    await this.ensureDefault(organizationId);

    return prisma.scheduleScheme.findMany({
      where: { organizationId },
      include: {
        workSchedules: { orderBy: { dayOfWeek: "asc" } },
        professionals: { select: { id: true, name: true, nickname: true, color: true, slug: true } },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  static async getById(organizationId: string, id: string) {
    const scheme = await prisma.scheduleScheme.findFirst({
      where: { id, organizationId },
      include: {
        workSchedules: { orderBy: { dayOfWeek: "asc" } },
        professionals: { select: { id: true, name: true, nickname: true, color: true, slug: true } },
      },
    });

    if (!scheme) {
      throw new Error("Esquema de disponibilidade não encontrado.");
    }

    return scheme;
  }

  static async create(
    organizationId: string,
    data: {
      name: string;
      timeZone?: string;
      isDefault?: boolean;
      schedules?: ScheduleDayBlockInput[];
      professionalIds?: string[];
    }
  ) {
    if (data.isDefault) {
      await prisma.scheduleScheme.updateMany({
        where: { organizationId },
        data: { isDefault: false },
      });
    }

    const defaultBlocks: ScheduleDayBlockInput[] = data.schedules || [
      { dayOfWeek: 1, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
      { dayOfWeek: 2, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
      { dayOfWeek: 3, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
      { dayOfWeek: 4, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
      { dayOfWeek: 5, startTime: "09:00", endTime: "19:00", breakStartTime: "12:00", breakEndTime: "13:00", active: true },
      { dayOfWeek: 6, startTime: "08:30", endTime: "18:00", breakStartTime: "12:30", breakEndTime: "13:30", active: true },
      { dayOfWeek: 0, startTime: "09:00", endTime: "14:00", active: false },
    ];

    const scheme = await prisma.scheduleScheme.create({
      data: {
        organizationId,
        name: data.name.trim(),
        timeZone: data.timeZone || "America/Sao_Paulo",
        isDefault: Boolean(data.isDefault),
        workSchedules: {
          create: defaultBlocks.map((b) => ({
            dayOfWeek: b.dayOfWeek,
            startTime: b.startTime,
            endTime: b.endTime,
            breakStartTime: b.breakStartTime || null,
            breakEndTime: b.breakEndTime || null,
            active: b.active,
          })),
        },
      },
      include: {
        workSchedules: true,
      },
    });

    if (data.professionalIds && data.professionalIds.length > 0) {
      await prisma.professional.updateMany({
        where: { id: { in: data.professionalIds }, organizationId },
        data: { scheduleId: scheme.id },
      });
    }

    return this.getById(organizationId, scheme.id);
  }

  static async update(
    organizationId: string,
    id: string,
    data: {
      name?: string;
      timeZone?: string;
      isDefault?: boolean;
      schedules?: ScheduleDayBlockInput[];
      professionalIds?: string[];
    }
  ) {
    await this.getById(organizationId, id);

    if (data.isDefault) {
      await prisma.scheduleScheme.updateMany({
        where: { organizationId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Atualiza dados cadastrais do esquema
    await prisma.scheduleScheme.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.timeZone ? { timeZone: data.timeZone } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
      },
    });

    // Se foram enviados blocos de escala, recria de forma atômica
    if (data.schedules) {
      await prisma.$transaction([
        prisma.workSchedule.deleteMany({
          where: { scheduleSchemeId: id },
        }),
        prisma.workSchedule.createMany({
          data: data.schedules.map((s) => ({
            scheduleSchemeId: id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            breakStartTime: s.breakStartTime || null,
            breakEndTime: s.breakEndTime || null,
            active: s.active,
          })),
        }),
      ]);
    }

    // Se foram enviados vínculos de barbeiros
    if (data.professionalIds) {
      // Remove quem estava antes e não está mais
      await prisma.professional.updateMany({
        where: { scheduleId: id, id: { notIn: data.professionalIds }, organizationId },
        data: { scheduleId: null },
      });
      // Atribui aos novos
      if (data.professionalIds.length > 0) {
        await prisma.professional.updateMany({
          where: { id: { in: data.professionalIds }, organizationId },
          data: { scheduleId: id },
        });
      }
    }

    return this.getById(organizationId, id);
  }

  static async delete(organizationId: string, id: string) {
    const scheme = await this.getById(organizationId, id);
    if (scheme.isDefault) {
      throw new Error("Não é permitido excluir o esquema de disponibilidade padrão.");
    }

    // Desvincula barbeiros antes de deletar
    await prisma.professional.updateMany({
      where: { scheduleId: id },
      data: { scheduleId: null },
    });

    await prisma.scheduleScheme.delete({
      where: { id },
    });

    return { success: true };
  }
}


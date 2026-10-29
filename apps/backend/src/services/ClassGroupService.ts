import { prisma } from "../db/prisma";
import {
  CreateClassGroupInput,
  CreateClassGroupSchema,
  UpdateClassGroupInput,
  UpdateClassGroupSchema,
} from "../validators/class-group.schema";
import { AuditService } from "./AuditService";

export class ClassGroupService {
  /**
   * Abre nova turma vinculada a um curso e unidade.
   */
  static async create(rawInput: CreateClassGroupInput, actorId?: string) {
    const validated = CreateClassGroupSchema.parse(rawInput);

    const [course, unit] = await Promise.all([
      prisma.course.findFirst({
        where: { id: validated.courseId, organizationId: validated.organizationId, active: true },
      }),
      prisma.unit.findFirst({
        where: { id: validated.unitId, organizationId: validated.organizationId, active: true },
      }),
    ]);

    if (!course) {
      throw new Error("Curso nao encontrado ou inativo.");
    }
    if (!unit) {
      throw new Error("Unidade nao encontrada ou inativa.");
    }

    const classGroup = await prisma.classGroup.create({
      data: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        courseId: validated.courseId,
        code: validated.code,
        startDate: validated.startDate,
        endDate: validated.endDate,
        maxCapacity: validated.maxCapacity,
        active: validated.active,
      },
    });

    await AuditService.logEvent({
      organizationId: classGroup.organizationId,
      unitId: classGroup.unitId,
      actorId,
      action: "CLASS_GROUP_OPENED",
      entityType: "ClassGroup",
      entityId: classGroup.id,
      metadata: { code: classGroup.code, maxCapacity: classGroup.maxCapacity },
    });

    return classGroup;
  }

  /**
   * Lista turmas com calculo de vagas ocupadas e vagas restantes em tempo real.
   */
  static async listByOrganization(
    organizationId: string,
    options?: { courseId?: string; unitId?: string; activeOnly?: boolean }
  ) {
    const groups = await prisma.classGroup.findMany({
      where: {
        organizationId,
        ...(options?.courseId ? { courseId: options.courseId } : {}),
        ...(options?.unitId ? { unitId: options.unitId } : {}),
        ...(options?.activeOnly !== false ? { active: true } : {}),
      },
      include: {
        course: { select: { id: true, name: true, workloadHours: true, priceInCents: true } },
        unit: { select: { id: true, name: true } },
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ["RESERVED", "ENROLLED"] },
              },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return groups.map((g) => {
      const occupiedSeats = g._count.enrollments;
      const availableSeats = Math.max(0, g.maxCapacity - occupiedSeats);
      const isFull = availableSeats === 0;

      return {
        ...g,
        occupiedSeats,
        availableSeats,
        isFull,
      };
    });
  }

  /**
   * Busca turma por id com lista de matriculados.
   */
  static async getById(organizationId: string, classGroupId: string) {
    const group = await prisma.classGroup.findFirst({
      where: { id: classGroupId, organizationId },
      include: {
        course: true,
        unit: true,
        enrollments: {
          include: {
            contact: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
      },
    });

    if (!group) {
      throw new Error("Turma nao encontrada ou nao pertence a esta organizacao.");
    }

    const occupiedSeats = group.enrollments.filter((e) =>
      ["RESERVED", "ENROLLED"].includes(e.status)
    ).length;

    return {
      ...group,
      occupiedSeats,
      availableSeats: Math.max(0, group.maxCapacity - occupiedSeats),
      isFull: occupiedSeats >= group.maxCapacity,
    };
  }

  /**
   * Valida atomicamente se ha vagas livres na turma antes de prosseguir com matricula.
   */
  static async assertHasAvailableSeat(classGroupId: string): Promise<void> {
    const group = await prisma.classGroup.findUnique({
      where: { id: classGroupId },
      include: {
        _count: {
          select: {
            enrollments: {
              where: { status: { in: ["RESERVED", "ENROLLED"] } },
            },
          },
        },
      },
    });

    if (!group || !group.active) {
      throw new Error("Turma nao disponivel para novas matriculas.");
    }

    if (group._count.enrollments >= group.maxCapacity) {
      throw new Error(
        `Capacidade maxima atingida: a turma ${group.code} ja preencheu todas as ${group.maxCapacity} vagas.`
      );
    }
  }
}

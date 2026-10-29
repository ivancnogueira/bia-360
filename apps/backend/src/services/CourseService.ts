import { prisma } from "../db/prisma";
import {
  CreateCourseInput,
  CreateCourseSchema,
  UpdateCourseInput,
  UpdateCourseSchema,
} from "../validators/course.schema";
import { AuditService } from "./AuditService";

export class CourseService {
  /**
   * Cadastra novo curso na grade academica da organizacao.
   */
  static async create(rawInput: CreateCourseInput, actorId?: string) {
    const validated = CreateCourseSchema.parse(rawInput);

    const course = await prisma.course.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        description: validated.description,
        workloadHours: validated.workloadHours,
        priceInCents: validated.priceInCents,
        modality: validated.modality.toLowerCase(),
        active: validated.active,
      },
    });

    await AuditService.logEvent({
      organizationId: course.organizationId,
      actorId,
      action: "COURSE_CREATED",
      entityType: "Course",
      entityId: course.id,
      metadata: {
        name: course.name,
        workloadHours: course.workloadHours,
        priceInCents: course.priceInCents,
      },
    });

    return course;
  }

  /**
   * Lista cursos da organizacao.
   */
  static async listByOrganization(
    organizationId: string,
    options?: { modality?: string; activeOnly?: boolean }
  ) {
    return prisma.course.findMany({
      where: {
        organizationId,
        ...(options?.modality ? { modality: options.modality.toLowerCase() } : {}),
        ...(options?.activeOnly !== false ? { active: true } : {}),
      },
      include: {
        classGroups: {
          where: { active: true },
          select: { id: true, code: true, startDate: true, endDate: true, maxCapacity: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Busca curso por identificador unico com garantia de isolamento.
   */
  static async getById(organizationId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, organizationId },
      include: {
        classGroups: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    if (!course) {
      throw new Error("Curso nao encontrado ou nao pertence a esta organizacao.");
    }

    return course;
  }

  /**
   * Atualiza dados de um curso existente.
   */
  static async update(
    organizationId: string,
    courseId: string,
    rawInput: UpdateCourseInput,
    actorId?: string
  ) {
    const validated = UpdateCourseSchema.parse(rawInput);
    await this.getById(organizationId, courseId);

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...validated,
        modality: validated.modality ? validated.modality.toLowerCase() : undefined,
      },
    });

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "COURSE_UPDATED",
      entityType: "Course",
      entityId: updated.id,
      metadata: validated as Record<string, unknown>,
    });

    return updated;
  }

  /**
   * Desativa um curso mantendo o historico de turmas passadas.
   */
  static async deactivate(organizationId: string, courseId: string, actorId?: string) {
    await this.getById(organizationId, courseId);

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { active: false },
    });

    await AuditService.logEvent({
      organizationId,
      actorId,
      action: "COURSE_DEACTIVATED",
      entityType: "Course",
      entityId: updated.id,
    });

    return updated;
  }
}

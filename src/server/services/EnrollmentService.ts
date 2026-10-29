import { prisma } from "../db/prisma";
import { formatBrazilianPhoneNumber, sanitizeCustomerName } from "../utils/phone-sanitizer";
import {
  CancelEnrollmentInput,
  CancelEnrollmentSchema,
  CaptureLeadInput,
  CaptureLeadSchema,
  ConfirmEnrollmentInput,
  ConfirmEnrollmentSchema,
  PreEnrollmentInput,
  PreEnrollmentSchema,
} from "../validators/enrollment.schema";
import { ClassGroupService } from "./ClassGroupService";
import { AuditService } from "./AuditService";

export class EnrollmentService {
  /**
   * Captura interessado da escola (lead) salvando ou atualizando o contato.
   */
  static async captureLead(rawInput: CaptureLeadInput, actorId?: string) {
    const validated = CaptureLeadSchema.parse(rawInput);
    const cleanPhone = formatBrazilianPhoneNumber(validated.phone);
    const cleanName = sanitizeCustomerName(validated.name);

    let contact = await prisma.contact.findFirst({
      where: {
        organizationId: validated.organizationId,
        phone: cleanPhone,
      },
    });

    if (contact) {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: {
          name: cleanName,
          email: validated.email ?? contact.email,
          notes: validated.notes ? `${contact.notes ?? ""}\n${validated.notes}`.trim() : contact.notes,
        },
      });
    } else {
      contact = await prisma.contact.create({
        data: {
          organizationId: validated.organizationId,
          name: cleanName,
          phone: cleanPhone,
          email: validated.email,
          notes: validated.notes,
        },
      });
    }

    await AuditService.logEvent({
      organizationId: validated.organizationId,
      actorId,
      action: "ACADEMY_LEAD_CAPTURED",
      entityType: "Contact",
      entityId: contact.id,
      metadata: { phone: contact.phone, courseId: validated.courseId },
    });

    return contact;
  }

  /**
   * Pre-matricula o aluno com reserva de vaga e trava de capacidade em transacao.
   */
  static async preEnroll(rawInput: PreEnrollmentInput) {
    const validated = PreEnrollmentSchema.parse(rawInput);
    const cleanPhone = formatBrazilianPhoneNumber(validated.customerPhone);
    const cleanName = sanitizeCustomerName(validated.customerName);

    return prisma.$transaction(async (tx) => {
      // 1. Verifica atomicamente capacidade da turma
      const classGroup = await tx.classGroup.findFirst({
        where: { id: validated.classGroupId, organizationId: validated.organizationId },
        include: {
          course: true,
          _count: {
            select: {
              enrollments: {
                where: { status: { in: ["RESERVED", "ENROLLED"] } },
              },
            },
          },
        },
      });

      if (!classGroup || !classGroup.active) {
        throw new Error("Turma nao encontrada ou inativa.");
      }

      if (classGroup._count.enrollments >= classGroup.maxCapacity) {
        throw new Error(
          `A turma ${classGroup.code} ja atingiu o limite de ${classGroup.maxCapacity} vagas.`
        );
      }

      // 2. Localiza ou cria o contato
      let contact = await tx.contact.findFirst({
        where: {
          organizationId: validated.organizationId,
          phone: cleanPhone,
        },
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            organizationId: validated.organizationId,
            name: cleanName,
            phone: cleanPhone,
            email: validated.customerEmail,
          },
        });
      }

      // 3. Verifica se ja existe matricula ativa para este aluno nesta turma
      const existingEnrollment = await tx.enrollment.findFirst({
        where: {
          classGroupId: classGroup.id,
          contactId: contact.id,
          status: { in: ["RESERVED", "ENROLLED"] },
        },
      });

      if (existingEnrollment) {
        throw new Error("Este aluno ja possui reserva ou matricula ativa nesta turma.");
      }

      // 4. Cria a inscricao provisoria RESERVED
      const enrollment = await tx.enrollment.create({
        data: {
          organizationId: validated.organizationId,
          classGroupId: classGroup.id,
          contactId: contact.id,
          status: "RESERVED",
          priceInCents: classGroup.course.priceInCents,
        },
        include: {
          contact: { select: { id: true, name: true, phone: true } },
          classGroup: { select: { id: true, code: true, startDate: true } },
        },
      });

      return enrollment;
    });
  }

  /**
   * Confirma a matricula de forma definitiva e registra o recebimento financeiro.
   */
  static async confirmEnrollment(rawInput: ConfirmEnrollmentInput, actorId?: string) {
    const validated = ConfirmEnrollmentSchema.parse(rawInput);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findFirst({
        where: { id: validated.enrollmentId, organizationId: validated.organizationId },
        include: {
          classGroup: { include: { course: true, unit: true } },
          contact: true,
        },
      });

      if (!enrollment) {
        throw new Error("Matricula nao encontrada para esta organizacao.");
      }

      if (enrollment.status === "ENROLLED") {
        throw new Error("Esta matricula ja esta confirmada.");
      }

      // Atualiza status para ENROLLED
      const confirmed = await tx.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "ENROLLED" },
        include: {
          contact: { select: { id: true, name: true, phone: true, email: true } },
          classGroup: { select: { id: true, code: true } },
        },
      });

      // Registra entrada no livro caixa da escola
      await tx.financialEntry.create({
        data: {
          organizationId: enrollment.organizationId,
          unitId: enrollment.classGroup.unitId,
          type: "REVENUE",
          category: "matricula_curso",
          description: `Matricula de ${enrollment.contact.name} no curso ${enrollment.classGroup.course.name} (Turma ${enrollment.classGroup.code})`,
          amountInCents: validated.amountPaidInCents,
          dueDate: now,
          paidAt: now,
        },
      });

      await AuditService.logEvent({
        organizationId: enrollment.organizationId,
        unitId: enrollment.classGroup.unitId,
        actorId,
        action: "ENROLLMENT_CONFIRMED",
        entityType: "Enrollment",
        entityId: confirmed.id,
        metadata: {
          paymentMethod: validated.paymentMethod,
          amountPaidInCents: validated.amountPaidInCents,
          classGroupCode: enrollment.classGroup.code,
        },
      });

      return confirmed;
    });
  }

  /**
   * Cancela uma reserva ou matricula liberando a vaga imediatamente.
   */
  static async cancelEnrollment(rawInput: CancelEnrollmentInput, actorId?: string) {
    const validated = CancelEnrollmentSchema.parse(rawInput);

    const enrollment = await prisma.enrollment.findFirst({
      where: { id: validated.enrollmentId, organizationId: validated.organizationId },
    });

    if (!enrollment) {
      throw new Error("Matricula nao encontrada.");
    }

    const cancelled = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "DROPPED" },
    });

    await AuditService.logEvent({
      organizationId: validated.organizationId,
      actorId,
      action: "ENROLLMENT_CANCELLED",
      entityType: "Enrollment",
      entityId: cancelled.id,
      metadata: { reason: validated.reason },
    });

    return cancelled;
  }
}

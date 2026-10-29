import crypto from "node:crypto";
import { prisma } from "../db/prisma";
import {
  IssueCertificateInput,
  IssueCertificateSchema,
  RecordAttendanceBatchInput,
  RecordAttendanceBatchSchema,
  VerifyCertificateInput,
  VerifyCertificateSchema,
} from "../validators/academic.schema";
import { AuditService } from "./AuditService";

export class AcademicService {
  /**
   * Registra presencas de uma aula em lote.
   */
  static async recordAttendanceBatch(rawInput: RecordAttendanceBatchInput, actorId?: string) {
    const validated = RecordAttendanceBatchSchema.parse(rawInput);

    await prisma.$transaction(
      validated.records.map((rec) =>
        prisma.studentAttendance.create({
          data: {
            enrollmentId: rec.enrollmentId,
            sessionDate: validated.sessionDate,
            present: rec.present,
            notes: rec.notes,
          },
        })
      )
    );

    await AuditService.logEvent({
      organizationId: validated.organizationId,
      actorId,
      action: "ATTENDANCE_RECORDED",
      entityType: "StudentAttendance",
      entityId: `batch-${validated.sessionDate.toISOString()}`,
      metadata: { count: validated.records.length, sessionDate: validated.sessionDate.toISOString() },
    });

    return { recordedCount: validated.records.length };
  }

  /**
   * Calcula o resumo de frequencia de um aluno matriculado.
   */
  static async getAttendanceSummary(enrollmentId: string) {
    const attendances = await prisma.studentAttendance.findMany({
      where: { enrollmentId },
    });

    const totalSessions = attendances.length;
    const presentSessions = attendances.filter((a) => a.present).length;
    const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

    return {
      totalSessions,
      presentSessions,
      absentSessions: totalSessions - presentSessions,
      rate,
      isEligibleForCertificate: rate >= 75 && totalSessions >= 1,
    };
  }

  /**
   * Emite certificado digital com hash criptografico anti-fraude se frequencia >= 75%.
   */
  static async issueCertificate(rawInput: IssueCertificateInput, actorId?: string) {
    const validated = IssueCertificateSchema.parse(rawInput);

    const enrollment = await prisma.enrollment.findFirst({
      where: { id: validated.enrollmentId, organizationId: validated.organizationId },
      include: {
        contact: true,
        classGroup: { include: { course: true } },
        certificate: true,
      },
    });

    if (!enrollment) {
      throw new Error("Matricula nao encontrada.");
    }

    if (enrollment.certificate) {
      return enrollment.certificate;
    }

    if (enrollment.status !== "ENROLLED" && enrollment.status !== "COMPLETED") {
      throw new Error(
        `Nao e possivel emitir certificado para matricula com status ${enrollment.status}. O aluno deve estar ativo ou concluido.`
      );
    }

    const attendanceSummary = await this.getAttendanceSummary(enrollment.id);

    // Se houve aulas registradas, exige frequencia minima de 75%
    if (attendanceSummary.totalSessions > 0 && attendanceSummary.rate < 75) {
      throw new Error(
        `Frequencia insuficiente: o aluno possui ${attendanceSummary.rate}% de presenca, sendo exigido no minimo 75% para conclusao e emissao do certificado.`
      );
    }

    const now = new Date();
    // Gera codigo criptografico SHA-256 no padrao BARONE-XXXX-XXXX-XXXX
    const rawHash = crypto
      .createHash("sha256")
      .update(`${enrollment.id}-${enrollment.contact.phone}-${now.toISOString()}`)
      .digest("hex")
      .toUpperCase();

    const verificationCode = `BARONE-${rawHash.substring(0, 4)}-${rawHash.substring(4, 8)}-${rawHash.substring(8, 12)}`;

    return prisma.$transaction(async (tx) => {
      const certificate = await tx.certificate.create({
        data: {
          organizationId: enrollment.organizationId,
          enrollmentId: enrollment.id,
          verificationCode,
          attendanceRate: attendanceSummary.rate || 100,
          issuedAt: now,
        },
      });

      // Atualiza o status da matricula para COMPLETED
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED" },
      });

      await AuditService.logEvent({
        organizationId: enrollment.organizationId,
        actorId,
        action: "CERTIFICATE_ISSUED",
        entityType: "Certificate",
        entityId: certificate.id,
        metadata: {
          studentName: enrollment.contact.name,
          courseName: enrollment.classGroup.course.name,
          verificationCode: certificate.verificationCode,
          attendanceRate: certificate.attendanceRate,
        },
      });

      return certificate;
    });
  }

  /**
   * Valida publicamente a autenticidade de um certificado emitido.
   */
  static async verifyCertificate(rawInput: VerifyCertificateInput) {
    const validated = VerifyCertificateSchema.parse(rawInput);

    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: validated.verificationCode.trim().toUpperCase() },
      include: {
        enrollment: {
          include: {
            contact: { select: { name: true } },
            classGroup: {
              include: {
                course: { select: { name: true, workloadHours: true, modality: true } },
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return {
        isValid: false,
        message: "Certificado nao encontrado ou codigo invalido.",
      };
    }

    return {
      isValid: true,
      verificationCode: certificate.verificationCode,
      issuedAt: certificate.issuedAt,
      studentName: certificate.enrollment.contact.name,
      courseName: certificate.enrollment.classGroup.course.name,
      workloadHours: certificate.enrollment.classGroup.course.workloadHours,
      modality: certificate.enrollment.classGroup.course.modality,
      attendanceRate: certificate.attendanceRate,
    };
  }
}

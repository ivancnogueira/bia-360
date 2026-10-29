import {
  CaptureLeadSchema,
  PreEnrollmentSchema,
  ConfirmEnrollmentSchema,
} from "../validators/enrollment.schema";
import { formatBrazilianPhoneNumber } from "../utils/phone-sanitizer";
import { PaymentMethod, EnrollmentStatus } from "@prisma/client";

async function runTests() {
  console.log("Iniciando testes de pipeline de matriculas (Plano 03-03)...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASSOU] ${testName}`);
      passed++;
    } else {
      console.error(`[FALHOU] ${testName}`);
      failed++;
    }
  }

  // 1. Validacao de Captura de Lead com Sanitizacao de Telefone
  try {
    const rawLead = {
      organizationId: "org-academy-1",
      name: "Rodrigo Barbeiro Iniciante",
      phone: "(41) 98765-4321",
      email: "rodrigo@exemplo.com",
    };
    const validLead = CaptureLeadSchema.parse(rawLead);
    const cleanPhone = formatBrazilianPhoneNumber(validLead.phone);
    assert(cleanPhone === "5541987654321", "CaptureLead normaliza telefone celular com 9o digito (5541987654321)");
  } catch (e) {
    assert(false, "CaptureLeadSchema falhou com dados validos");
  }

  // 2. Validacao de Pre-matricula
  try {
    const validPre = PreEnrollmentSchema.parse({
      organizationId: "org-academy-1",
      classGroupId: "class-1",
      customerName: "Rodrigo",
      customerPhone: "41987654321",
    });
    assert(validPre.classGroupId === "class-1", "PreEnrollmentSchema valida intencao de inscricao");
  } catch (e) {
    assert(false, "PreEnrollmentSchema falhou com dados validos");
  }

  // 3. Validacao de Confirmacao com Metodo e Centavos
  try {
    const validConfirm = ConfirmEnrollmentSchema.parse({
      organizationId: "org-academy-1",
      enrollmentId: "enr-1",
      paymentMethod: PaymentMethod.PIX,
      amountPaidInCents: 249000, // R$ 2.490,00
    });
    assert(validConfirm.amountPaidInCents === 249000, "ConfirmEnrollmentSchema valida recebimento em centavos (249000)");
    assert(validConfirm.paymentMethod === PaymentMethod.PIX, "ConfirmEnrollmentSchema aceita metodo PIX");
  } catch (e) {
    assert(false, "ConfirmEnrollmentSchema falhou com dados validos");
  }

  // 4. Rejeicao de valor pago negativo ou zero
  try {
    ConfirmEnrollmentSchema.parse({
      organizationId: "org-academy-1",
      enrollmentId: "enr-1",
      paymentMethod: PaymentMethod.CASH,
      amountPaidInCents: 0,
    });
    assert(false, "ConfirmEnrollmentSchema deveria rejeitar valor pago igual a zero");
  } catch (e) {
    assert(true, "ConfirmEnrollmentSchema exige valor pago positivo em centavos");
  }

  // 5. Validacao dos Enums de Ciclo de Vida da Matricula
  const statusCiclo: EnrollmentStatus[] = [
    EnrollmentStatus.PROSPECT,
    EnrollmentStatus.RESERVED,
    EnrollmentStatus.ENROLLED,
    EnrollmentStatus.COMPLETED,
    EnrollmentStatus.DROPPED,
  ];
  assert(statusCiclo.length === 5, "Enum EnrollmentStatus contempla todas as 5 etapas da jornada do aluno");

  console.log(`\nResultado Plano 03-03: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

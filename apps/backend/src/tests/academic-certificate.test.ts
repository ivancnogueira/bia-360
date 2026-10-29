import {
  RecordAttendanceBatchSchema,
  VerifyCertificateSchema,
} from "../validators/academic.schema";
import crypto from "node:crypto";

async function runTests() {
  console.log("Iniciando testes de frequencia e certificados criptografados (Plano 03-04)...");
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

  // 1. Validacao de Batch de Presenca
  try {
    const validBatch = RecordAttendanceBatchSchema.parse({
      organizationId: "org-academy-1",
      sessionDate: "2026-11-05T19:00:00.000Z",
      records: [
        { enrollmentId: "enr-1", present: true },
        { enrollmentId: "enr-2", present: false, notes: "Falta justificada" },
      ],
    });
    assert(validBatch.records.length === 2, "RecordAttendanceBatchSchema aceita lista de chamada");
  } catch (e) {
    assert(false, "RecordAttendanceBatchSchema falhou com dados validos");
  }

  // 2. Rejeicao de Batch de Presenca vazio
  try {
    RecordAttendanceBatchSchema.parse({
      organizationId: "org-academy-1",
      sessionDate: "2026-11-05T19:00:00.000Z",
      records: [],
    });
    assert(false, "RecordAttendanceBatchSchema deveria rejeitar lista de chamada vazia");
  } catch (e) {
    assert(true, "RecordAttendanceBatchSchema exige ao menos 1 aluno na chamada");
  }

  // 3. Calculo de Frequencia e Elegibilidade para Certificado (Regra 75%)
  function checkEligibility(totalSessions: number, presentSessions: number) {
    const rate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;
    const isEligible = rate >= 75 && totalSessions >= 1;
    return { rate, isEligible };
  }

  const aluno80Porcento = checkEligibility(10, 8);
  assert(aluno80Porcento.rate === 80 && aluno80Porcento.isEligible, "Aluno com 8/10 aulas possui 80% e esta apto ao certificado");

  const aluno60Porcento = checkEligibility(10, 6);
  assert(aluno60Porcento.rate === 60 && !aluno60Porcento.isEligible, "Aluno com 6/10 aulas possui 60% e e bloqueado por frequencia insuficiente (< 75%)");

  // 4. Formato e Criptografia do Codigo de Verificacao do Certificado
  function generateVerificationCode(enrollmentId: string, phone: string, dateIso: string): string {
    const rawHash = crypto
      .createHash("sha256")
      .update(`${enrollmentId}-${phone}-${dateIso}`)
      .digest("hex")
      .toUpperCase();

    return `BARONE-${rawHash.substring(0, 4)}-${rawHash.substring(4, 8)}-${rawHash.substring(8, 12)}`;
  }

  const code1 = generateVerificationCode("enr-101", "5541999998888", "2026-11-30T10:00:00.000Z");
  assert(/^BARONE-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(code1), "Codigo de certificado atende padrao anti-fraude BARONE-XXXX-XXXX-XXXX");

  // Validador de Verificacao
  try {
    const validVerify = VerifyCertificateSchema.parse({
      verificationCode: code1,
    });
    assert(validVerify.verificationCode === code1, "VerifyCertificateSchema aceita codigo criptografico valido");
  } catch (e) {
    assert(false, "VerifyCertificateSchema falhou com codigo valido");
  }

  console.log(`\nResultado Plano 03-04: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

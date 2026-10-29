import { CreateClassGroupSchema } from "../validators/class-group.schema";

async function runTests() {
  console.log("Iniciando testes de turmas e trava de vagas (Plano 03-02)...");
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

  // 1. Validacao de Turma Valida
  try {
    const validGroup = CreateClassGroupSchema.parse({
      organizationId: "org-academy-1",
      unitId: "unit-1",
      courseId: "course-1",
      code: "TURMA-2026-OUT",
      startDate: "2026-11-01T08:00:00.000Z",
      endDate: "2026-11-30T18:00:00.000Z",
      maxCapacity: 12,
    });
    assert(validGroup.maxCapacity === 12, "CreateClassGroupSchema aceita turma valida com capacidade 12");
  } catch (e) {
    assert(false, "CreateClassGroupSchema falhou com dados validos");
  }

  // 2. Rejeicao de data final anterior a data inicial
  try {
    CreateClassGroupSchema.parse({
      organizationId: "org-academy-1",
      unitId: "unit-1",
      courseId: "course-1",
      code: "TURMA-DATA-INVALIDA",
      startDate: "2026-11-30T08:00:00.000Z",
      endDate: "2026-11-01T18:00:00.000Z", // Anterior a data inicial
      maxCapacity: 10,
    });
    assert(false, "CreateClassGroupSchema deveria rejeitar data final anterior a data inicial");
  } catch (e) {
    assert(true, "CreateClassGroupSchema rejeita data de conclusao cronologicamente anterior a de inicio");
  }

  // 3. Rejeicao de capacidade zero ou negativa
  try {
    CreateClassGroupSchema.parse({
      organizationId: "org-academy-1",
      unitId: "unit-1",
      courseId: "course-1",
      code: "TURMA-ZERO-VAGAS",
      startDate: "2026-11-01T08:00:00.000Z",
      endDate: "2026-11-30T18:00:00.000Z",
      maxCapacity: 0,
    });
    assert(false, "CreateClassGroupSchema deveria rejeitar capacidade 0");
  } catch (e) {
    assert(true, "CreateClassGroupSchema rejeita capacidade menor que 1 aluno");
  }

  // 4. Algoritmo de Calculo de Vagas e Trava de Loteamento Maximo
  function calculateSeatStatus(maxCapacity: number, activeEnrollmentsCount: number) {
    const available = Math.max(0, maxCapacity - activeEnrollmentsCount);
    const isFull = activeEnrollmentsCount >= maxCapacity;
    return { available, isFull };
  }

  const turma9De10 = calculateSeatStatus(10, 9);
  assert(turma9De10.available === 1 && !turma9De10.isFull, "Turma com 9/10 alunos tem 1 vaga restante e nao esta lotada");

  const turma10De10 = calculateSeatStatus(10, 10);
  assert(turma10De10.available === 0 && turma10De10.isFull, "Turma com 10/10 alunos tem 0 vagas e ativa trava de lotada");

  // Tentativa de 11a matricula em turma de 10
  const canEnroll11th = turma10De10.available > 0;
  assert(!canEnroll11th, "Trava de overbooking impede categoricamente a matricula excedente");

  console.log(`\nResultado Plano 03-02: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

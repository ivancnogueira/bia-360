import { CreateCourseSchema } from "../validators/course.schema";

async function runTests() {
  console.log("Iniciando testes de cursos academicos (Plano 03-01)...");
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

  // 1. Validacao de Curso Valido com centavos
  try {
    const validCourse = CreateCourseSchema.parse({
      organizationId: "org-academy-1",
      name: "Formacao Profissional de Barbeiro Classico e Visagismo",
      description: "Curso completo do basico a navalha com certificacao oficial Barone",
      workloadHours: 120,
      priceInCents: 249000, // R$ 2.490,00
      modality: "presencial",
    });
    assert(validCourse.priceInCents === 249000, "CreateCourseSchema aceita valor em centavos inteiros (249000)");
    assert(validCourse.workloadHours === 120, "CreateCourseSchema aceita carga horaria de 120 horas");
  } catch (e) {
    assert(false, "CreateCourseSchema falhou com dados validos");
  }

  // 2. Rejeicao de Float em valor do curso
  try {
    CreateCourseSchema.parse({
      organizationId: "org-academy-1",
      name: "Curso Float Proibido",
      workloadHours: 40,
      priceInCents: 1500.5, // Float proibido
    });
    assert(false, "CreateCourseSchema deveria rejeitar valor fracionado (Float)");
  } catch (e) {
    assert(true, "CreateCourseSchema rejeita estritamente valores fracionados em centavos");
  }

  // 3. Rejeicao de Carga Horaria insuficiente
  try {
    CreateCourseSchema.parse({
      organizationId: "org-academy-1",
      name: "Curso Rapido Demais",
      workloadHours: 2, // Menor que 4h
      priceInCents: 50000,
    });
    assert(false, "CreateCourseSchema deveria rejeitar carga horaria < 4h");
  } catch (e) {
    assert(true, "CreateCourseSchema rejeita carga horaria abaixo de 4 horas");
  }

  // 4. Validacao de Modalidades Permitidas
  try {
    const onlineCourse = CreateCourseSchema.parse({
      organizationId: "org-academy-1",
      name: "Gestao e Financas de Barbearia",
      workloadHours: 20,
      priceInCents: 49700,
      modality: "online",
    });
    assert(onlineCourse.modality === "online", "CreateCourseSchema aceita modalidade online");
  } catch (e) {
    assert(false, "CreateCourseSchema falhou ao aceitar modalidade online");
  }

  // 5. Rejeicao de Modalidade Invalida
  try {
    CreateCourseSchema.parse({
      organizationId: "org-academy-1",
      name: "Curso Modalidade Invalida",
      workloadHours: 40,
      priceInCents: 100000,
      modality: "telepatia",
    });
    assert(false, "CreateCourseSchema deveria rejeitar modalidade invalida");
  } catch (e) {
    assert(true, "CreateCourseSchema rejeita modalidades fora de presencial, online ou hibrido");
  }

  console.log(`\nResultado Plano 03-01: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

import { CreateServiceSchema } from "../validators/service.schema";
import { CreateProfessionalSchema, WorkScheduleItemSchema } from "../validators/professional.schema";

async function runTests() {
  console.log("Iniciando testes de servicos e profissionais (Plano 02-01)...");
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

  // 1. Validacao de Servico
  try {
    const validService = CreateServiceSchema.parse({
      organizationId: "org-barber-1",
      name: "Corte Degradê Clássico",
      description: "Corte navalhado com acabamento em toalha quente",
      durationMinutes: 45,
      priceInCents: 6500, // R$ 65,00
      category: "corte",
    });
    assert(validService.priceInCents === 6500, "CreateServiceSchema aceita centavos inteiros (6500)");
  } catch (e) {
    assert(false, "CreateServiceSchema falhou ao processar servico valido");
  }

  // 2. Rejeicao de Float em preco de servico
  try {
    CreateServiceSchema.parse({
      organizationId: "org-barber-1",
      name: "Corte Com Float",
      durationMinutes: 30,
      priceInCents: 65.5, // Float proibido
    });
    assert(false, "CreateServiceSchema deveria rejeitar preco fracionado/Float");
  } catch (e) {
    assert(true, "CreateServiceSchema rejeita estritamente precos fracionados (Float)");
  }

  // 3. Rejeicao de duracao invalida
  try {
    CreateServiceSchema.parse({
      organizationId: "org-barber-1",
      name: "Corte Rapido Demais",
      durationMinutes: 2, // Menor que 5 min
      priceInCents: 3000,
    });
    assert(false, "CreateServiceSchema deveria rejeitar duracao menor que 5 min");
  } catch (e) {
    assert(true, "CreateServiceSchema rejeita duracao de servico abaixo de 5 min");
  }

  // 4. Validacao de Profissional e Comissao
  try {
    const validProfessional = CreateProfessionalSchema.parse({
      organizationId: "org-barber-1",
      name: "Carlos Barbeiro Mestre",
      nickname: "Carlinhos",
      phone: "5511988887777",
      commissionRate: 50, // 50%
    });
    assert(validProfessional.commissionRate === 50, "CreateProfessionalSchema aceita comissao valida (50%)");
  } catch (e) {
    assert(false, "CreateProfessionalSchema falhou com dados validos");
  }

  // 5. Rejeicao de Comissao invalida (> 100)
  try {
    CreateProfessionalSchema.parse({
      organizationId: "org-barber-1",
      name: "Barbeiro Comissao Impossivel",
      commissionRate: 150, // > 100
    });
    assert(false, "CreateProfessionalSchema deveria rejeitar comissao > 100%");
  } catch (e) {
    assert(true, "CreateProfessionalSchema rejeita comissao superior a 100%");
  }

  // 6. Validacao de Formato de Horarios da Grade Semanal
  try {
    const validSchedule = WorkScheduleItemSchema.parse({
      dayOfWeek: 1, // Segunda
      startTime: "09:00",
      endTime: "19:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    });
    assert(validSchedule.startTime === "09:00", "WorkScheduleItemSchema aceita horarios validos HH:MM");
  } catch (e) {
    assert(false, "WorkScheduleItemSchema falhou com horario valido");
  }

  // 7. Rejeicao de Horario com formato invalido
  try {
    WorkScheduleItemSchema.parse({
      dayOfWeek: 1,
      startTime: "9:00", // Faltando 0 a esquerda
      endTime: "25:00", // Hora impossivel
    });
    assert(false, "WorkScheduleItemSchema deveria rejeitar horario fora do padrao HH:MM");
  } catch (e) {
    assert(true, "WorkScheduleItemSchema rejeita formatos invalidos de horario");
  }

  console.log(`\nResultado Plano 02-01: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

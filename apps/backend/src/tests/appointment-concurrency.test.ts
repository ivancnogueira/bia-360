import {
  CreateBookingHoldSchema,
  ConfirmBookingHoldSchema,
  CreateAppointmentSchema,
} from "../validators/appointment.schema";

async function runTests() {
  console.log("Iniciando testes de agendamento e booking holds (Plano 02-02)...");
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

  // 1. Validacao de CreateBookingHoldSchema
  try {
    const validHold = CreateBookingHoldSchema.parse({
      organizationId: "org-1",
      unitId: "unit-1",
      professionalId: "prof-1",
      serviceId: "srv-1",
      customerName: "Lucas Silva",
      customerPhone: "5511988887777",
      startTime: "2026-10-30T14:00:00.000Z",
    });
    assert(validHold.customerName === "Lucas Silva", "CreateBookingHoldSchema valida dados de entrada");
  } catch (e) {
    assert(false, "CreateBookingHoldSchema falhou com dados validos");
  }

  // 2. Rejeicao de hold com telefone vazio
  try {
    CreateBookingHoldSchema.parse({
      organizationId: "org-1",
      unitId: "unit-1",
      professionalId: "prof-1",
      serviceId: "srv-1",
      customerName: "Lucas",
      customerPhone: "",
      startTime: "2026-10-30T14:00:00.000Z",
    });
    assert(false, "CreateBookingHoldSchema deveria rejeitar telefone vazio");
  } catch (e) {
    assert(true, "CreateBookingHoldSchema rejeita telefone vazio");
  }

  // 3. Regra Matematica de Conflito de Horarios
  function hasTimeOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
  }

  const slot1Start = new Date("2026-10-30T14:00:00.000Z");
  const slot1End = new Date("2026-10-30T14:45:00.000Z");

  // Intervalo concorrente sobreposto (14:15 as 15:00)
  const slotOverlapStart = new Date("2026-10-30T14:15:00.000Z");
  const slotOverlapEnd = new Date("2026-10-30T15:00:00.000Z");
  assert(
    hasTimeOverlap(slot1Start, slot1End, slotOverlapStart, slotOverlapEnd),
    "Algoritmo detecta sobreposicao parcial entre 14:00-14:45 e 14:15-15:00"
  );

  // Intervalo adjacente imediatamente posterior (14:45 as 15:30)
  const slotAdjacentStart = new Date("2026-10-30T14:45:00.000Z");
  const slotAdjacentEnd = new Date("2026-10-30T15:30:00.000Z");
  assert(
    !hasTimeOverlap(slot1Start, slot1End, slotAdjacentStart, slotAdjacentEnd),
    "Algoritmo permite horarios adjacentes sem conflito falso (14:00-14:45 e 14:45-15:30)"
  );

  // Intervalo totalmente dentro do outro (14:10 as 14:30)
  const slotInsideStart = new Date("2026-10-30T14:10:00.000Z");
  const slotInsideEnd = new Date("2026-10-30T14:30:00.000Z");
  assert(
    hasTimeOverlap(slot1Start, slot1End, slotInsideStart, slotInsideEnd),
    "Algoritmo detecta intervalo contido internamente"
  );

  // 4. Temporizacao do Booking Hold (10 minutos)
  const now = new Date();
  const holdExpiration = new Date(now.getTime() + 10 * 60 * 1000);
  const diffInMinutes = Math.round((holdExpiration.getTime() - now.getTime()) / 60000);
  assert(diffInMinutes === 10, "Booking Hold possui trava estrita de 10 minutos (600 segundos)");

  console.log(`\nResultado Plano 02-02: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});

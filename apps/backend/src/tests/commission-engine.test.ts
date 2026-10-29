import {
  CalculateCommissionFilterSchema,
  SettleCommissionSchema,
} from "../validators/commission.schema";

async function runTests() {
  console.log("Iniciando testes de comissoes e repasses (Plano 02-04)...");
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

  // 1. Validacao de CalculateCommissionFilterSchema
  try {
    const validFilter = CalculateCommissionFilterSchema.parse({
      organizationId: "org-1",
      startDate: "2026-10-01T00:00:00.000Z",
      endDate: "2026-10-31T23:59:59.999Z",
    });
    assert(validFilter.organizationId === "org-1", "CalculateCommissionFilterSchema valida periodo com sucesso");
  } catch (e) {
    assert(false, "CalculateCommissionFilterSchema falhou com dados validos");
  }

  // 2. Validacao de SettleCommissionSchema
  try {
    const validSettle = SettleCommissionSchema.parse({
      organizationId: "org-1",
      unitId: "unit-1",
      professionalId: "prof-1",
      amountInCents: 185000, // R$ 1.850,00
      periodStart: "2026-10-01T00:00:00.000Z",
      periodEnd: "2026-10-15T23:59:59.999Z",
      notes: "Repasse da primeira quinzena de outubro",
    });
    assert(validSettle.amountInCents === 185000, "SettleCommissionSchema valida liquidacao em centavos inteiros");
  } catch (e) {
    assert(false, "SettleCommissionSchema falhou com dados validos");
  }

  // 3. Calculo Matematico de Comissoes sem Ponto Flutuante
  function calculateItemCommission(priceInCents: number, ratePercentage: number): number {
    return Math.round((priceInCents * ratePercentage) / 100);
  }

  const cortePriceInCents = 6000; // R$ 60,00
  const corteRate = 50; // 50%
  const corteCommission = calculateItemCommission(cortePriceInCents, corteRate);
  assert(corteCommission === 3000, "Calculo de comissao de 50% sobre R$ 60,00 resulta em exatos 3000 centavos");

  const barbaPriceInCents = 4500; // R$ 45,00
  const barbaRate = 40; // 40%
  const barbaCommission = calculateItemCommission(barbaPriceInCents, barbaRate);
  assert(barbaCommission === 1800, "Calculo de comissao de 40% sobre R$ 45,00 resulta em exatos 1800 centavos");

  const totalBruto = cortePriceInCents + barbaPriceInCents;
  const totalRepasse = corteCommission + barbaCommission;
  assert(totalBruto === 10500, "Total bruto de faturamento apurado em 10500 centavos (R$ 105,00)");
  assert(totalRepasse === 4800, "Total de comissao a repassar apurado em 4800 centavos (R$ 48,00)");
  assert(Number.isInteger(totalRepasse), "Comissao e estritamente inteira sem dizimas de ponto flutuante");

  console.log(`\nResultado Plano 02-04: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});


import { ToolRegistry } from "../ai/ToolRegistry";
import { getCustomerAgentPrompt } from "../ai/prompts/customerAgentPrompt";

async function runTests() {
  console.log("Iniciando testes do Agente de IA e Tool Calling (Fase 05)...\n");
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

  // 1. Catalogo de Ferramentas do ToolRegistry
  const tools = ToolRegistry.getTools();
  assert(tools.length === 6, "ToolRegistry registra exatamente 6 ferramentas de negocio");

  const toolNames = tools.map((t) => t.name);
  const expectedTools = [
    "list_services",
    "check_available_slots",
    "create_booking_hold",
    "confirm_booking",
    "list_courses",
    "reserve_course_seat",
  ];

  for (const exp of expectedTools) {
    assert(toolNames.includes(exp), `ToolRegistry contem a ferramenta ${exp}`);
  }

  // 2. Validacao do Schema da Ferramenta check_available_slots
  const checkSlotsTool = tools.find((t) => t.name === "check_available_slots")!;
  try {
    const validArgs = checkSlotsTool.schema.parse({
      serviceId: "srv-1",
      targetDate: "2026-11-05",
    });
    assert(validArgs.targetDate === "2026-11-05", "check_available_slots aceita data valida YYYY-MM-DD");
  } catch (e) {
    assert(false, "check_available_slots falhou com data valida");
  }

  try {
    checkSlotsTool.schema.parse({
      serviceId: "srv-1",
      targetDate: "05/11/2026", // Formato invalido
    });
    assert(false, "check_available_slots deveria rejeitar data fora do formato YYYY-MM-DD");
  } catch (e) {
    assert(true, "check_available_slots rejeita datas que nao seguem padrao YYYY-MM-DD");
  }

  // 3. Deteccao Heuristica de Handoff Humano
  function detectHumanHandoff(text: string): boolean {
    const textLower = text.toLowerCase();
    const humanKeywords = ["atendente", "falar com atendente", "humano", "pessoa real", "falar com alguem"];
    return humanKeywords.some((kw) => textLower.includes(kw));
  }

  assert(
    detectHumanHandoff("Quero falar com um atendente por favor"),
    "Detecta solicitacao explicita de atendente humano"
  );
  assert(
    detectHumanHandoff("Tem como falar com alguem do balcao?"),
    "Detecta solicitacao de falar com pessoa real"
  );
  assert(
    !detectHumanHandoff("Qual o valor do corte degradê?"),
    "Mantem fluxo automatizado de IA para perguntas normais de servico"
  );

  // 4. Inspecao de Ausencia de Emojis e Travessoes no Prompt
  const prompt = getCustomerAgentPrompt("Barone Academy");
  const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(prompt);
  const hasEmDash = prompt.includes("—") || prompt.includes("–");

  assert(!hasEmoji, "Prompt de sistema da BIA nao contem nenhum emoji");
  assert(!hasEmDash, "Prompt de sistema da BIA nao contem nenhum travessao longo");

  console.log(`\nResultado Fase 05: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});


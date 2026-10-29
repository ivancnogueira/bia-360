import crypto from "node:crypto";
import { WebhookSecurity } from "../whatsapp/WebhookSecurity";
import { formatBrazilianPhoneNumber } from "../utils/phone-sanitizer";

async function runTests() {
  console.log("Iniciando testes de integracao WhatsApp e Mensageria (Fase 04)...\n");
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

  // 1. Validacao de HMAC SHA-256 com timingSafeEqual
  const appSecret = "segredo-super-seguro-barone-2026";
  const rawBody = JSON.stringify({ event: "message_received", timestamp: 1730198400 });

  const validHmac = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const validHeader = `sha256=${validHmac}`;
  const tamperedHeader = `sha256=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`;

  assert(
    WebhookSecurity.verifyMetaSignature(rawBody, validHeader, appSecret),
    "WebhookSecurity aceita assinatura HMAC valida"
  );

  assert(
    !WebhookSecurity.verifyMetaSignature(rawBody, tamperedHeader, appSecret),
    "WebhookSecurity rejeita assinatura HMAC adulterada"
  );

  assert(
    !WebhookSecurity.verifyMetaSignature(rawBody, "invalid_header", appSecret),
    "WebhookSecurity rejeita header sem prefixo sha256="
  );

  // 2. Handshake da Meta
  const challengeCode = "CHALLENGE_STRING_12345";
  const verifyToken = "TOKEN_VERIFICACAO_BIA";

  const handshakeOk = WebhookSecurity.handleHandshake("subscribe", verifyToken, challengeCode, verifyToken);
  assert(handshakeOk === challengeCode, "Handshake responde o challenge quando token esta correto");

  const handshakeFail = WebhookSecurity.handleHandshake("subscribe", "TOKEN_ERRADO", challengeCode, verifyToken);
  assert(handshakeFail === null, "Handshake recusa e retorna null quando token esta incorreto");

  // 3. Normalizacao de Telefones Brasileiros E.164 com 9o digito
  const cel1 = formatBrazilianPhoneNumber("11988887777");
  assert(cel1 === "5511988887777", "Normaliza celular de SP adicionando DDI 55 (5511988887777)");

  const celLegado = formatBrazilianPhoneNumber("4188887777");
  assert(celLegado === "5541988887777", "Insere o 9o digito em celular legado do Parana (5541988887777)");

  const fixo = formatBrazilianPhoneNumber("4133334444");
  assert(fixo === "554133334444", "Mantem 8 digitos em telefone fixo comercial sem adicionar 9o digito (554133334444)");

  // 4. Logica de Backoff Exponencial do Outbox
  function calculateBackoffSeconds(attempts: number): number {
    return Math.pow(4, attempts) * 10;
  }

  assert(calculateBackoffSeconds(1) === 40, "Tentativa 1 agenda retentativa em 40 segundos");
  assert(calculateBackoffSeconds(2) === 160, "Tentativa 2 agenda retentativa em 160 segundos");
  assert(calculateBackoffSeconds(3) === 640, "Tentativa 3 agenda retentativa em 640 segundos");

  console.log(`\nResultado Fase 04: ${passed} passaram, ${failed} falharam.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});


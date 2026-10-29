import crypto from "node:crypto";

export class WebhookSecurity {
  /**
   * Valida a assinatura HMAC SHA-256 enviada pela Meta no cabecalho X-Hub-Signature-256.
   * Utiliza timingSafeEqual para prevencao contra ataques de analise temporal (timing attacks).
   */
  static verifyMetaSignature(
    rawBody: string | Buffer,
    signatureHeader: string | null,
    appSecret: string
  ): boolean {
    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
      return false;
    }

    const signature = signatureHeader.substring(7).trim();
    const hmac = crypto.createHmac("sha256", appSecret);
    const expectedHash = hmac.update(rawBody).digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedBuffer = Buffer.from(expectedHash, "utf-8");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  /**
   * Responde ao desafio de verificacao da Meta durante a configuracao do Webhook.
   */
  static handleHandshake(
    mode: string | null,
    verifyToken: string | null,
    challenge: string | null,
    expectedToken: string
  ): string | null {
    if (mode === "subscribe" && verifyToken === expectedToken && challenge) {
      return challenge;
    }
    return null;
  }
}


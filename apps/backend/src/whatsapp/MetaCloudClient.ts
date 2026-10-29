import { formatBrazilianPhoneNumber } from "../utils/phone-sanitizer";
import { InteractiveButton, MetaClientConfig, MetaSuccessResponse } from "./types";

export class MetaCloudClient {
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly apiVersion: string;

  constructor(config: MetaClientConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.accessToken = config.accessToken.replace(/^Bearer\s+/i, "").trim();
    this.apiVersion = config.apiVersion ?? "v21.0";
  }

  /**
   * Envia mensagem de texto formatada para o WhatsApp do destinatario.
   */
  async sendTextMessage(recipientPhone: string, text: string): Promise<MetaSuccessResponse> {
    const to = formatBrazilianPhoneNumber(recipientPhone);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Falha no envio Meta WhatsApp (${response.status}): ${errorData}`);
    }

    return response.json() as Promise<MetaSuccessResponse>;
  }

  /**
   * Envia mensagem com botoes interativos de resposta rapida (ate 3 botoes).
   */
  async sendInteractiveButtons(
    recipientPhone: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<MetaSuccessResponse> {
    const to = formatBrazilianPhoneNumber(recipientPhone);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const interactiveButtons: InteractiveButton[] = buttons.slice(0, 3).map((b) => ({
      type: "reply",
      reply: {
        id: b.id,
        title: b.title.slice(0, 20), // Limite oficial da Meta: 20 caracteres por botao
      },
    }));

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: interactiveButtons,
        },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Falha no envio de botoes Meta WhatsApp (${response.status}): ${errorData}`);
    }

    return response.json() as Promise<MetaSuccessResponse>;
  }

  /**
   * Envia imagem com legenda opcional.
   */
  async sendImageMessage(recipientPhone: string, imageUrl: string, caption?: string): Promise<MetaSuccessResponse> {
    const to = formatBrazilianPhoneNumber(recipientPhone);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "image",
      image: {
        link: imageUrl,
        caption: caption ?? undefined,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Falha no envio de imagem Meta WhatsApp (${response.status}): ${errorData}`);
    }

    return response.json() as Promise<MetaSuccessResponse>;
  }
}


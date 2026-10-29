import { WhatsAppChannelService } from "../services/WhatsAppChannelService";
import { ConversationService } from "../services/ConversationService";
import { MetaWebhookPayload } from "./types";

export class WebhookDispatcher {
  /**
   * Processa o payload JSON completo recebido no endpoint de webhook da Meta.
   */
  static async dispatch(payload: MetaWebhookPayload) {
    if (payload.object !== "whatsapp_business_account") {
      return { status: "ignored", reason: "Objeto nao suportado" };
    }

    const processedMessages = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== "messages") {
          continue;
        }

        const value = change.value;
        const phoneNumberId = value.metadata.phone_number_id;

        // Busca o canal cadastrado
        const channel = await WhatsAppChannelService.getByPhoneNumberId(phoneNumberId);
        if (!channel) {
          console.warn(`Canal nao encontrado para phoneNumberId: ${phoneNumberId}`);
          continue;
        }

        const messages = value.messages ?? [];
        const contacts = value.contacts ?? [];

        for (const msg of messages) {
          const contactProfile = contacts.find((c) => c.wa_id === msg.from);
          const customerName = contactProfile?.profile?.name ?? "Cliente";

          let textContent = "";
          if (msg.type === "text" && msg.text) {
            textContent = msg.text.body;
          } else if (msg.type === "interactive" && msg.interactive?.button_reply) {
            textContent = msg.interactive.button_reply.title;
          } else {
            textContent = `[Mensagem do tipo ${msg.type}]`;
          }

          const result = await ConversationService.processInboundMessage({
            organizationId: channel.organizationId,
            senderPhone: msg.from,
            senderName: customerName,
            wamid: msg.id,
            content: textContent,
          });

          processedMessages.push(result);
        }
      }
    }

    return { status: "processed", count: processedMessages.length, messages: processedMessages };
  }
}


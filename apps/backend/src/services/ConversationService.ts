import { prisma } from "../db/prisma";
import { formatBrazilianPhoneNumber, sanitizeCustomerName } from "../utils/phone-sanitizer";
import { AuditService } from "./AuditService";

export interface InboundMessageInput {
  organizationId: string;
  senderPhone: string;
  senderName: string;
  wamid: string;
  content: string;
}

export class ConversationService {
  /**
   * Processa mensagem recebida do cliente no WhatsApp evitando duplicidade por wamid.
   */
  static async processInboundMessage(data: InboundMessageInput) {
    const cleanPhone = formatBrazilianPhoneNumber(data.senderPhone);
    const cleanName = sanitizeCustomerName(data.senderName);

    // 1. Deteccao de duplicidade pelo wamid da Meta
    const existingMessage = await prisma.message.findUnique({
      where: { wamid: data.wamid },
    });

    if (existingMessage) {
      return { isDuplicate: true, message: existingMessage };
    }

    return prisma.$transaction(async (tx) => {
      // 2. Localiza ou cria o contato
      let contact = await tx.contact.findFirst({
        where: {
          organizationId: data.organizationId,
          phone: cleanPhone,
        },
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: {
            organizationId: data.organizationId,
            name: cleanName,
            phone: cleanPhone,
          },
        });
      }

      // 3. Localiza conversa ativa recente ou cria nova sessao
      let conversation = await tx.conversation.findFirst({
        where: {
          organizationId: data.organizationId,
          contactId: contact.id,
        },
        orderBy: { lastMessageAt: "desc" },
      });

      const now = new Date();

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            organizationId: data.organizationId,
            contactId: contact.id,
            channelType: "WHATSAPP_OFFICIAL",
            status: "BOT",
            lastMessageAt: now,
          },
        });
      } else {
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: now },
        });
      }

      // 4. Salva a mensagem recebida
      const message = await tx.message.create({
        data: {
          conversationId: conversation.id,
          direction: "INBOUND",
          senderType: "CLIENT",
          content: data.content,
          wamid: data.wamid,
          status: "DELIVERED",
        },
      });

      return {
        isDuplicate: false,
        contact,
        conversation,
        message,
      };
    });
  }

  /**
   * Alterna a conversa para atendimento humano ou encerra o atendimento.
   */
  static async setStatus(conversationId: string, status: "BOT" | "HUMAN" | "CLOSED", actorId?: string) {
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status },
    });

    await AuditService.logEvent({
      organizationId: updated.organizationId,
      actorId,
      action: `CONVERSATION_STATUS_${status}`,
      entityType: "Conversation",
      entityId: updated.id,
      metadata: { newStatus: status },
    });

    return updated;
  }
}


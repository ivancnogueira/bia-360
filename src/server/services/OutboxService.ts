import { prisma } from "../db/prisma";
import { WhatsAppChannelService } from "./WhatsAppChannelService";

export interface EnqueueOutboxInput {
  organizationId: string;
  channelId: string;
  recipient: string;
  payload: {
    type: "text" | "interactive" | "image";
    content: string;
    buttons?: Array<{ id: string; title: string }>;
    imageUrl?: string;
  };
}

export class OutboxService {
  /**
   * Enfileira uma mensagem para envio duravel dentro ou fora de uma transacao Prisma.
   */
  static async enqueue(data: EnqueueOutboxInput, tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) {
    const db = tx ?? prisma;

    return db.outboxMessage.create({
      data: {
        organizationId: data.organizationId,
        channelId: data.channelId,
        recipient: data.recipient,
        payload: data.payload,
        status: "PENDING",
        attempts: 0,
        scheduledFor: new Date(),
      },
    });
  }

  /**
   * Processa lote de mensagens pendentes com retentativa exponencial.
   */
  static async processBatch(batchSize = 20): Promise<{ processed: number; sent: number; failed: number }> {
    const now = new Date();

    const pendingMessages = await prisma.outboxMessage.findMany({
      where: {
        status: "PENDING",
        scheduledFor: { lte: now },
      },
      take: batchSize,
      orderBy: { scheduledFor: "asc" },
    });

    let sent = 0;
    let failed = 0;

    for (const msg of pendingMessages) {
      try {
        await prisma.outboxMessage.update({
          where: { id: msg.id },
          data: { status: "PROCESSING" },
        });

        const client = await WhatsAppChannelService.getClient(msg.channelId);
        const payload = msg.payload as EnqueueOutboxInput["payload"];

        if (payload.type === "text") {
          await client.sendTextMessage(msg.recipient, payload.content);
        } else if (payload.type === "interactive" && payload.buttons) {
          await client.sendInteractiveButtons(msg.recipient, payload.content, payload.buttons);
        } else if (payload.type === "image" && payload.imageUrl) {
          await client.sendImageMessage(msg.recipient, payload.imageUrl, payload.content);
        }

        await prisma.outboxMessage.update({
          where: { id: msg.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            lastError: null,
          },
        });

        sent++;
      } catch (error) {
        failed++;
        const nextAttempt = msg.attempts + 1;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (nextAttempt >= 5) {
          // Excedeu o limite maximo de 5 tentativas: marca como FAILED
          await prisma.outboxMessage.update({
            where: { id: msg.id },
            data: {
              status: "FAILED",
              attempts: nextAttempt,
              lastError: errorMessage,
            },
          });
        } else {
          // Backoff exponencial: 15s, 60s, 300s, 900s
          const backoffSeconds = Math.pow(4, nextAttempt) * 10;
          const nextRetryDate = new Date(now.getTime() + backoffSeconds * 1000);

          await prisma.outboxMessage.update({
            where: { id: msg.id },
            data: {
              status: "PENDING",
              attempts: nextAttempt,
              scheduledFor: nextRetryDate,
              lastError: errorMessage,
            },
          });
        }
      }
    }

    return { processed: pendingMessages.length, sent, failed };
  }
}

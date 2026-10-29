import { prisma } from "../db/prisma";
import {
  CreateWhatsAppChannelInput,
  CreateWhatsAppChannelSchema,
} from "../validators/channel.schema";
import { MetaCloudClient } from "../whatsapp/MetaCloudClient";
import { AuditService } from "./AuditService";

export class WhatsAppChannelService {
  /**
   * Registra um novo canal oficial da Meta Cloud API.
   */
  static async createChannel(rawInput: CreateWhatsAppChannelInput, actorId?: string) {
    const validated = CreateWhatsAppChannelSchema.parse(rawInput);

    const existing = await prisma.whatsAppChannel.findUnique({
      where: { phoneNumberId: validated.phoneNumberId },
    });

    if (existing) {
      throw new Error(`O Phone Number ID "${validated.phoneNumberId}" ja esta cadastrado.`);
    }

    const channel = await prisma.whatsAppChannel.create({
      data: {
        organizationId: validated.organizationId,
        unitId: validated.unitId,
        name: validated.name,
        phoneNumberId: validated.phoneNumberId,
        displayPhoneNumber: validated.displayPhoneNumber,
        accessToken: validated.accessToken,
        webhookSecret: validated.webhookSecret,
        active: validated.active,
      },
    });

    await AuditService.logEvent({
      organizationId: channel.organizationId,
      unitId: channel.unitId,
      actorId,
      action: "WHATSAPP_CHANNEL_REGISTERED",
      entityType: "WhatsAppChannel",
      entityId: channel.id,
      metadata: { phoneNumberId: channel.phoneNumberId, name: channel.name },
    });

    return channel;
  }

  /**
   * Busca canal pelo Phone Number ID fornecido no payload do Webhook da Meta.
   */
  static async getByPhoneNumberId(phoneNumberId: string) {
    return prisma.whatsAppChannel.findUnique({
      where: { phoneNumberId, active: true },
      include: { organization: true, unit: true },
    });
  }

  /**
   * Instancia um cliente autenticado para envio direto.
   */
  static async getClient(channelId: string): Promise<MetaCloudClient> {
    const channel = await prisma.whatsAppChannel.findUnique({
      where: { id: channelId },
    });

    if (!channel || !channel.active) {
      throw new Error("Canal de WhatsApp inativo ou inexistente.");
    }

    return new MetaCloudClient({
      phoneNumberId: channel.phoneNumberId,
      accessToken: channel.accessToken,
    });
  }
}


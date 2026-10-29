import { z } from "zod";

export const CreateWhatsAppChannelSchema = z.object({
  organizationId: z.string({ required_error: "ID da organizacao e obrigatorio" }).min(1),
  unitId: z.string().optional().nullable(),
  name: z.string().trim().default("WhatsApp Oficial"),
  phoneNumberId: z
    .string({ required_error: "Phone Number ID da Meta e obrigatorio" })
    .trim()
    .min(5, "Phone Number ID invalido"),
  displayPhoneNumber: z.string().trim().optional().nullable(),
  accessToken: z
    .string({ required_error: "Access Token da Meta e obrigatorio" })
    .trim()
    .min(10, "Access Token invalido"),
  webhookSecret: z
    .string({ required_error: "Webhook Secret (App Secret) e obrigatorio" })
    .trim()
    .min(5, "Webhook Secret invalido"),
  active: z.boolean().default(true),
});

export const SendMessageSchema = z.object({
  organizationId: z.string().min(1),
  channelId: z.string().min(1),
  recipientPhone: z.string().min(8, "Telefone do destinatario invalido"),
  content: z.string().min(1, "Conteudo da mensagem e obrigatorio"),
});

export type CreateWhatsAppChannelInput = z.infer<typeof CreateWhatsAppChannelSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;


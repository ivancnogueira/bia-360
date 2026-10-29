export interface MetaClientConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

export interface MetaSuccessResponse {
  messaging_product: "whatsapp";
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface InteractiveButton {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

export interface MetaInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "interactive" | "button" | "image" | "audio";
  text?: {
    body: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
  };
}

export interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: MetaInboundMessage[];
      };
      field: string;
    }>;
  }>;
}


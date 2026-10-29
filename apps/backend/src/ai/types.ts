import { z } from "zod";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export interface ToolDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  schema: T;
  execute: (args: z.infer<T>, context: { organizationId: string; unitId?: string }) => Promise<unknown>;
}

export interface AiCompletionOptions {
  systemPrompt: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

export interface AiCompletionResult {
  textResponse?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  providerUsed: "gemini" | "grok";
}


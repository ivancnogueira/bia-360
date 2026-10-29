import { AiCompletionOptions, AiCompletionResult } from "./types";

export class GeminiProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey?: string, model = "gemini-2.5-flash") {
    this.apiKey = apiKey ?? process.env.GEMINI_API_KEY ?? "";
    this.model = model;
  }

  async generate(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY nao configurada no ambiente.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Monta contents no formato Gemini
    const contents = options.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : m.role === "system" ? "user" : m.role,
      parts: [{ text: m.content }],
    }));

    // Se houver tools, mapeia para functionDeclarations
    const toolsPayload =
      options.tools && options.tools.length > 0
        ? [
            {
              functionDeclarations: options.tools.map((t) => ({
                name: t.name,
                description: t.description,
                parameters: {
                  type: "object",
                },
              })),
            },
          ]
        : undefined;

    const payload = {
      systemInstruction: {
        parts: [{ text: options.systemPrompt }],
      },
      contents,
      tools: toolsPayload,
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 1000,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Erro Gemini (${response.status}): ${err}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
            functionCall?: {
              name: string;
              args: Record<string, unknown>;
            };
          }>;
        };
      }>;
    };

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    let textResponse = "";
    const toolCalls: AiCompletionResult["toolCalls"] = [];

    for (const part of parts) {
      if (part.text) {
        textResponse += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args,
        });
      }
    }

    return {
      textResponse: textResponse.trim() || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      providerUsed: "gemini",
    };
  }
}


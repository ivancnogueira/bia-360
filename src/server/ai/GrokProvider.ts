import { AiCompletionOptions, AiCompletionResult } from "./types";

export class GrokProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey?: string, model = "grok-2-latest") {
    this.apiKey = apiKey ?? process.env.GROK_API_KEY ?? process.env.XAI_API_KEY ?? "";
    this.model = model;
  }

  async generate(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.apiKey) {
      throw new Error("GROK_API_KEY / XAI_API_KEY nao configurada no ambiente.");
    }

    const url = "https://api.x.ai/v1/chat/completions";

    const messages = [
      { role: "system", content: options.systemPrompt },
      ...options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const toolsPayload =
      options.tools && options.tools.length > 0
        ? options.tools.map((t) => ({
            type: "function",
            function: {
              name: t.name,
              description: t.description,
              parameters: {
                type: "object",
              },
            },
          }))
        : undefined;

    const payload = {
      model: this.model,
      messages,
      tools: toolsPayload,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1000,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Erro Grok (${response.status}): ${err}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
          tool_calls?: Array<{
            id: string;
            function: {
              name: string;
              arguments: string;
            };
          }>;
        };
      }>;
    };

    const choice = data.choices?.[0]?.message;
    const textResponse = choice?.content?.trim();
    const toolCalls: AiCompletionResult["toolCalls"] = [];

    if (choice?.tool_calls) {
      for (const tc of choice.tool_calls) {
        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments);
        } catch {
          parsedArgs = {};
        }
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: parsedArgs,
        });
      }
    }

    return {
      textResponse: textResponse || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      providerUsed: "grok",
    };
  }
}


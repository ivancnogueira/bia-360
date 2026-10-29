import { AiRouter } from "./AiRouter";
import { ToolRegistry } from "./ToolRegistry";
import { ChatMessage } from "./types";
import { getCustomerAgentPrompt } from "./prompts/customerAgentPrompt";
import { ConversationService } from "../services/ConversationService";

export interface RunAgentInput {
  organizationId: string;
  unitId?: string;
  conversationId: string;
  userMessage: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export class CustomerAgent {
  /**
   * Processa uma mensagem do cliente atraves do agente conversacional com tool calling.
   */
  static async handleMessage(input: RunAgentInput): Promise<{
    replyText: string;
    isHandoff: boolean;
    providerUsed: string;
  }> {
    const textLower = input.userMessage.toLowerCase();

    // 1. Verificacao heuristica de solicitacao de atendente humano
    const humanKeywords = ["atendente", "falar com atendente", "humano", "pessoa real", "falar com alguem"];
    const wantsHuman = humanKeywords.some((kw) => textLower.includes(kw));

    if (wantsHuman) {
      await ConversationService.setStatus(input.conversationId, "HUMAN");
      return {
        replyText:
          "Entendido perfeitamente. Estou transferindo seu atendimento para a nossa equipe no balcao. Em instantes um de nossos atendentes continuara a conversa com voce por aqui.",
        isHandoff: true,
        providerUsed: "rule_engine",
      };
    }

    // 2. Monta mensagens com historico recente
    const systemPrompt = getCustomerAgentPrompt("Barone Academy");
    const messages: ChatMessage[] = [
      ...(input.history ?? []).slice(-8).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: input.userMessage },
    ];

    const tools = ToolRegistry.getTools();
    let currentTurn = 0;
    const maxTurns = 3;
    let finalReply = "";
    let providerUsed = "gemini";

    while (currentTurn < maxTurns) {
      currentTurn++;

      const completion = await AiRouter.complete({
        systemPrompt,
        messages,
        tools,
        temperature: 0.3,
      });

      providerUsed = completion.providerUsed;

      if (!completion.toolCalls || completion.toolCalls.length === 0) {
        finalReply = completion.textResponse ?? "Como posso ajudar voce hoje com nossos cortes ou cursos?";
        break;
      }

      // Executa as ferramentas chamadas
      for (const call of completion.toolCalls) {
        const toolDef = tools.find((t) => t.name === call.name);
        let resultData: unknown = { error: "Ferramenta nao encontrada" };

        if (toolDef) {
          try {
            resultData = await toolDef.execute(call.arguments, {
              organizationId: input.organizationId,
              unitId: input.unitId,
            });
          } catch (err) {
            resultData = { error: err instanceof Error ? err.message : String(err) };
          }
        }

        messages.push({
          role: "assistant",
          content: `Invocando ${call.name}`,
          toolCalls: [call],
        });

        messages.push({
          role: "tool",
          toolCallId: call.id,
          content: JSON.stringify(resultData),
        });
      }
    }

    if (!finalReply) {
      finalReply = "Consegui verificar essas opcoes para voce. Qual horario ou servico voce prefere?";
    }

    return {
      replyText: finalReply,
      isHandoff: false,
      providerUsed,
    };
  }
}


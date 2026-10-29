import { GeminiProvider } from "./GeminiProvider";
import { GrokProvider } from "./GrokProvider";
import { AiCompletionOptions, AiCompletionResult } from "./types";

export class AiRouter {
  private static gemini = new GeminiProvider();
  private static grok = new GrokProvider();

  /**
   * Executa a conclusao do LLM com tentativa primario e fallback automatico.
   */
  static async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const primaryProvider = process.env.PRIMARY_AI_PROVIDER ?? "gemini";

    if (primaryProvider === "grok") {
      try {
        return await this.grok.generate(options);
      } catch (err) {
        console.warn("Provedor primario Grok falhou. Tentando fallback para Gemini...", err);
        return await this.gemini.generate(options);
      }
    } else {
      try {
        return await this.gemini.generate(options);
      } catch (err) {
        console.warn("Provedor primario Gemini falhou. Tentando fallback para Grok...", err);
        return await this.grok.generate(options);
      }
    }
  }
}


/**
 * LLM Service - Provider-Agnostic LLM Interface
 *
 * Provides a unified interface for interacting with LLM providers.
 * Supports easy provider swapping via configuration.
 *
 * @example
 * import { llmService, getLLMProvider } from "@/services/llm";
 *
 * // Use default provider (OpenAI)
 * const response = await llmService.complete({ ... });
 *
 * // Use specific provider
 * const provider = getLLMProvider("anthropic");
 * const response = await provider.complete({ ... });
 */

import type {
  LLMProvider,
  CompletionParams,
  CompletionResponse,
  StreamChunk,
  CanonicalModel,
  Message,
} from "./types";
import { MODEL_MAPPINGS } from "./types";
import { getOpenAIProvider } from "./providers/openai";
import { getAnthropicProvider } from "./providers/anthropic";

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================

type ProviderName = "openai" | "anthropic" | "ollama";

const providerFactories: Record<ProviderName, () => LLMProvider> = {
  openai: getOpenAIProvider,
  anthropic: getAnthropicProvider,
  ollama: () => {
    throw new Error("Ollama provider not yet implemented");
  },
};

/**
 * Get an LLM provider by name
 */
export function getLLMProvider(name: ProviderName = "openai"): LLMProvider {
  const factory = providerFactories[name];
  if (!factory) {
    throw new Error(`Unknown LLM provider: ${name}`);
  }
  return factory();
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): ProviderName[] {
  return (Object.keys(providerFactories) as ProviderName[]).filter((name) => {
    try {
      const provider = getLLMProvider(name);
      return provider.isAvailable();
    } catch {
      return false;
    }
  });
}

// =============================================================================
// LLM SERVICE CLASS
// =============================================================================

export class LLMService {
  private defaultProvider: ProviderName;
  private debug: boolean;

  constructor(defaultProvider: ProviderName = "openai") {
    this.defaultProvider = defaultProvider;
    this.debug = process.env.DEBUG_LLM === "true";
  }

  /**
   * Get the appropriate model for a canonical model name
   */
  getModel(canonical: CanonicalModel, provider?: ProviderName): string {
    const providerName = provider || this.defaultProvider;
    const mapping = MODEL_MAPPINGS[canonical];
    return mapping[providerName as keyof typeof mapping] || mapping.openai;
  }

  /**
   * Generate a completion (non-streaming)
   */
  async complete(
    params: CompletionParams,
    providerName?: ProviderName
  ): Promise<CompletionResponse> {
    const provider = getLLMProvider(providerName || this.defaultProvider);

    if (this.debug) {
      console.log(`[LLM] Complete request to ${provider.name}:`, {
        model: params.model,
        messageCount: params.messages.length,
        temperature: params.temperature,
      });
    }

    const startTime = Date.now();
    const response = await provider.complete(params);

    if (this.debug) {
      console.log(`[LLM] Complete response:`, {
        model: response.model,
        tokens: response.usage.totalTokens,
        latencyMs: Date.now() - startTime,
      });
    }

    return response;
  }

  /**
   * Generate a streaming completion
   */
  async *stream(
    params: CompletionParams,
    providerName?: ProviderName
  ): AsyncIterable<StreamChunk> {
    const provider = getLLMProvider(providerName || this.defaultProvider);

    if (this.debug) {
      console.log(`[LLM] Stream request to ${provider.name}:`, {
        model: params.model,
        messageCount: params.messages.length,
      });
    }

    let totalContent = "";
    for await (const chunk of provider.stream(params)) {
      totalContent += chunk.content;

      if (this.debug && chunk.done) {
        console.log(`[LLM] Stream complete:`, {
          contentLength: totalContent.length,
          tokens: chunk.usage?.totalTokens,
        });
      }

      yield chunk;
    }
  }

  /**
   * Count tokens for text
   */
  async countTokens(
    text: string,
    model?: string,
    providerName?: ProviderName
  ): Promise<number> {
    const provider = getLLMProvider(providerName || this.defaultProvider);
    return provider.countTokens(text, model);
  }

  /**
   * Build messages array with system prompt
   */
  buildMessages(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Message[] = []
  ): Message[] {
    return [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(providerName: ProviderName): boolean {
    try {
      const provider = getLLMProvider(providerName);
      return provider.isAvailable();
    } catch {
      return false;
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

const defaultProvider = (process.env.LLM_PROVIDER as ProviderName) || "openai";
export const llmService = new LLMService(defaultProvider);

// Re-export types
export type {
  LLMProvider,
  CompletionParams,
  CompletionResponse,
  StreamChunk,
  Message,
  CanonicalModel,
} from "./types";

export { MODEL_MAPPINGS } from "./types";

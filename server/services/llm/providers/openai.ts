/**
 * OpenAI Provider Implementation
 *
 * Implements LLMProvider interface for OpenAI models.
 */

import OpenAI from "openai";
import type {
  LLMProvider,
  CompletionParams,
  CompletionResponse,
  StreamChunk,
  ProviderConfig,
} from "../types";

// =============================================================================
// PROVIDER IMPLEMENTATION
// =============================================================================

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  readonly defaultModel = "gpt-4o";
  readonly availableModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
  ];

  private client: OpenAI | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;

    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        organization: config.organization,
        baseURL: config.baseUrl,
        timeout: config.timeout || 60000,
        maxRetries: config.maxRetries || 2,
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async complete(params: CompletionParams): Promise<CompletionResponse> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized. Check OPENAI_API_KEY.");
    }

    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
      })),
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
      stop: params.stop,
      user: params.user,
    });

    const latencyMs = Date.now() - startTime;
    const choice = response.choices[0];

    return {
      content: choice?.message?.content || "",
      finishReason: this.mapFinishReason(choice?.finish_reason),
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
      latencyMs,
    };
  }

  async *stream(params: CompletionParams): AsyncIterable<StreamChunk> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized. Check OPENAI_API_KEY.");
    }

    const stream = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
      })),
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
      stop: params.stop,
      user: params.user,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      const content = choice?.delta?.content || "";
      const finishReason = choice?.finish_reason;
      const done = finishReason === "stop" || finishReason === "length";

      yield {
        content,
        done,
        finishReason: finishReason ? this.mapFinishReason(finishReason) : undefined,
        ...(chunk.usage && {
          usage: {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
          },
        }),
      };
    }
  }

  async countTokens(text: string, _model?: string): Promise<number> {
    // Rough approximation: ~4 characters per token for English
    // For accurate counts, use tiktoken library
    return Math.ceil(text.length / 4);
  }

  private mapFinishReason(
    reason: string | null | undefined
  ): "stop" | "length" | "content_filter" | "error" {
    switch (reason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "content_filter":
        return "content_filter";
      default:
        return "stop";
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let instance: OpenAIProvider | null = null;

export function getOpenAIProvider(config?: ProviderConfig): OpenAIProvider {
  if (!instance) {
    instance = new OpenAIProvider(config);
  }
  return instance;
}

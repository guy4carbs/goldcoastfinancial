/**
 * Anthropic Provider Implementation (Future)
 *
 * Placeholder for Anthropic Claude models.
 * Implements LLMProvider interface.
 */

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

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  readonly defaultModel = "claude-3-5-sonnet-20241022";
  readonly availableModels = [
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ];

  private apiKey: string | null = null;
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || null;
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async complete(params: CompletionParams): Promise<CompletionResponse> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured. Set ANTHROPIC_API_KEY.");
    }

    // TODO: Implement when Anthropic SDK is added
    // For now, throw not implemented error
    throw new Error("Anthropic provider not yet implemented. Use OpenAI.");

    // Future implementation:
    // const anthropic = new Anthropic({ apiKey: this.apiKey });
    // const response = await anthropic.messages.create({
    //   model: params.model || this.defaultModel,
    //   max_tokens: params.maxTokens || 1024,
    //   messages: this.convertMessages(params.messages),
    // });
  }

  async *stream(params: CompletionParams): AsyncIterable<StreamChunk> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key not configured. Set ANTHROPIC_API_KEY.");
    }

    // TODO: Implement when Anthropic SDK is added
    throw new Error("Anthropic provider not yet implemented. Use OpenAI.");

    // Future implementation:
    // const anthropic = new Anthropic({ apiKey: this.apiKey });
    // const stream = anthropic.messages.stream({
    //   model: params.model || this.defaultModel,
    //   max_tokens: params.maxTokens || 1024,
    //   messages: this.convertMessages(params.messages),
    // });
    //
    // for await (const event of stream) {
    //   if (event.type === 'content_block_delta') {
    //     yield {
    //       content: event.delta.text,
    //       done: false,
    //     };
    //   }
    // }
    // yield { content: '', done: true };
  }

  async countTokens(text: string, _model?: string): Promise<number> {
    // Claude uses similar tokenization to GPT models
    // ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Convert OpenAI-style messages to Anthropic format
   */
  private convertMessages(messages: CompletionParams["messages"]): any[] {
    // Anthropic separates system prompt from messages
    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    return conversationMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let instance: AnthropicProvider | null = null;

export function getAnthropicProvider(config?: ProviderConfig): AnthropicProvider {
  if (!instance) {
    instance = new AnthropicProvider(config);
  }
  return instance;
}

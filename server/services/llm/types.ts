/**
 * LLM Provider Types
 *
 * Abstractions for swappable LLM providers (OpenAI, Anthropic, Ollama, etc.)
 */

// =============================================================================
// MESSAGE TYPES
// =============================================================================

export type MessageRole = "system" | "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  name?: string;  // For multi-agent scenarios
}

// =============================================================================
// COMPLETION PARAMS
// =============================================================================

export interface CompletionParams {
  model: string;
  messages: Message[];

  // Generation settings
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Stop sequences
  stop?: string[];

  // Metadata
  user?: string;  // For rate limiting / tracking
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface CompletionResponse {
  content: string;
  finishReason: "stop" | "length" | "content_filter" | "error";

  // Usage stats
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  // Metadata
  model: string;
  latencyMs: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  finishReason?: "stop" | "length" | "content_filter";

  // Only on final chunk
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================

export interface LLMProvider {
  /**
   * Provider name (e.g., "openai", "anthropic", "ollama")
   */
  readonly name: string;

  /**
   * Default model for this provider
   */
  readonly defaultModel: string;

  /**
   * Available models
   */
  readonly availableModels: string[];

  /**
   * Generate a completion (non-streaming)
   */
  complete(params: CompletionParams): Promise<CompletionResponse>;

  /**
   * Generate a streaming completion
   */
  stream(params: CompletionParams): AsyncIterable<StreamChunk>;

  /**
   * Count tokens for a given text (approximate)
   */
  countTokens(text: string, model?: string): Promise<number>;

  /**
   * Check if provider is available/configured
   */
  isAvailable(): boolean;
}

// =============================================================================
// PROVIDER CONFIG
// =============================================================================

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  timeout?: number;
  maxRetries?: number;
}

// =============================================================================
// MODEL MAPPINGS
// =============================================================================

/**
 * Canonical model names that map to provider-specific models
 */
export type CanonicalModel =
  | "fast"      // Fastest response, lower quality
  | "balanced"  // Balance of speed and quality
  | "quality"   // Highest quality, slower
  | "vision";   // Multimodal support

export interface ModelMapping {
  openai: string;
  anthropic: string;
  ollama: string;
}

export const MODEL_MAPPINGS: Record<CanonicalModel, ModelMapping> = {
  fast: {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-haiku-20240307",
    ollama: "llama3.2",
  },
  balanced: {
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    ollama: "llama3.1:70b",
  },
  quality: {
    openai: "gpt-4-turbo",
    anthropic: "claude-3-opus-20240229",
    ollama: "llama3.1:405b",
  },
  vision: {
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet-20241022",
    ollama: "llava",
  },
};

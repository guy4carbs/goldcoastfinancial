/**
 * Voice Service Types (Future-Ready)
 *
 * Abstractions for voice synthesis providers (ElevenLabs, PlayHT, etc.)
 */

// =============================================================================
// VOICE TYPES
// =============================================================================

export interface Voice {
  id: string;
  name: string;
  provider: string;
  language: string;
  gender?: "male" | "female" | "neutral";
  previewUrl?: string;
  description?: string;
}

// =============================================================================
// SYNTHESIS PARAMS
// =============================================================================

export interface SynthesisParams {
  text: string;
  voiceId: string;

  // Voice modulation
  speed?: number;       // 0.5 - 2.0, default 1.0
  pitch?: number;       // -20 to 20 semitones, default 0
  volume?: number;      // 0.0 - 1.0, default 1.0

  // Quality settings
  sampleRate?: number;  // 22050, 44100, etc.
  format?: "mp3" | "wav" | "ogg" | "pcm";

  // Emotion/style (provider-specific)
  style?: string;
  emotion?: string;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface SynthesisResponse {
  audio: Buffer;
  format: string;
  durationMs: number;
  characterCount: number;
}

export interface AudioChunk {
  data: Buffer;
  done: boolean;
  sequence: number;
}

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================

export interface VoiceProvider {
  /**
   * Provider name (e.g., "elevenlabs", "playht")
   */
  readonly name: string;

  /**
   * Synthesize text to audio (non-streaming)
   */
  synthesize(params: SynthesisParams): Promise<SynthesisResponse>;

  /**
   * Synthesize text to audio (streaming)
   */
  streamSynthesize(params: SynthesisParams): AsyncIterable<AudioChunk>;

  /**
   * Get available voices
   */
  getVoices(): Promise<Voice[]>;

  /**
   * Get a specific voice by ID
   */
  getVoice(voiceId: string): Promise<Voice | null>;

  /**
   * Check if provider is available/configured
   */
  isAvailable(): boolean;

  /**
   * Estimate cost for synthesis (optional)
   */
  estimateCost?(text: string): Promise<number>;
}

// =============================================================================
// PROVIDER CONFIG
// =============================================================================

export interface VoiceProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

// =============================================================================
// AVATAR VOICE MAPPING
// =============================================================================

export interface AvatarVoiceMapping {
  avatarId: string;
  avatarSlug: string;
  provider: string;
  voiceId: string;
  voiceName: string;

  // Optional customizations per avatar
  speed?: number;
  pitch?: number;
  style?: string;
}

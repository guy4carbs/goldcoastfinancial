/**
 * Voice Service (Future-Ready)
 *
 * Placeholder service for voice synthesis integration.
 * Will support ElevenLabs, PlayHT, and other providers.
 *
 * @example
 * import { voiceService } from "@/services/voice";
 *
 * // Synthesize for an avatar
 * const audio = await voiceService.synthesizeForAvatar(avatarId, text);
 *
 * // Stream synthesis
 * for await (const chunk of voiceService.streamForAvatar(avatarId, text)) {
 *   // Send chunk to client
 * }
 */

import type {
  VoiceProvider,
  SynthesisParams,
  SynthesisResponse,
  AudioChunk,
  Voice,
  AvatarVoiceMapping,
} from "./types";

// =============================================================================
// VOICE SERVICE
// =============================================================================

export class VoiceService {
  private providers: Map<string, VoiceProvider> = new Map();
  private defaultProvider: string = "elevenlabs";
  private avatarMappings: Map<string, AvatarVoiceMapping> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.ENABLE_VOICE === "true";

    if (this.enabled) {
      this.loadAvatarMappings();
    }
  }

  /**
   * Check if voice service is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled && this.providers.size > 0;
  }

  /**
   * Register a voice provider
   */
  registerProvider(provider: VoiceProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Get a provider by name
   */
  getProvider(name?: string): VoiceProvider | null {
    const providerName = name || this.defaultProvider;
    return this.providers.get(providerName) || null;
  }

  /**
   * Load avatar voice mappings from config
   */
  private async loadAvatarMappings(): Promise<void> {
    // TODO: Load from config/voice-mappings.json or database
    // For now, use hardcoded defaults

    const defaultMappings: AvatarVoiceMapping[] = [
      {
        avatarId: "",  // Will be resolved at runtime
        avatarSlug: "insurance-expert",
        provider: "elevenlabs",
        voiceId: "pNInz6obpgDQGcFmaJgB",  // Adam - professional male
        voiceName: "Adam",
      },
      {
        avatarId: "",
        avatarSlug: "sales-closer",
        provider: "elevenlabs",
        voiceId: "ErXwobaYiN019PkySvjV",  // Antoni - energetic male
        voiceName: "Antoni",
      },
      {
        avatarId: "",
        avatarSlug: "mindset-coach",
        provider: "elevenlabs",
        voiceId: "EXAVITQu4vr4xnSDxMaL",  // Bella - warm female
        voiceName: "Bella",
      },
      {
        avatarId: "",
        avatarSlug: "compliance-specialist",
        provider: "elevenlabs",
        voiceId: "onwK4e9ZLuTAKqWW03F9",  // Daniel - authoritative male
        voiceName: "Daniel",
      },
      // Add more as needed
    ];

    for (const mapping of defaultMappings) {
      this.avatarMappings.set(mapping.avatarSlug, mapping);
    }
  }

  /**
   * Get voice mapping for an avatar
   */
  getAvatarVoiceMapping(avatarSlug: string): AvatarVoiceMapping | null {
    return this.avatarMappings.get(avatarSlug) || null;
  }

  /**
   * Synthesize speech for an avatar
   */
  async synthesizeForAvatar(
    avatarSlug: string,
    text: string
  ): Promise<SynthesisResponse | null> {
    if (!this.enabled) {
      console.warn("[Voice] Voice service is disabled");
      return null;
    }

    const mapping = this.avatarMappings.get(avatarSlug);
    if (!mapping) {
      console.warn(`[Voice] No voice mapping for avatar: ${avatarSlug}`);
      return null;
    }

    const provider = this.providers.get(mapping.provider);
    if (!provider) {
      console.warn(`[Voice] Provider not available: ${mapping.provider}`);
      return null;
    }

    const params: SynthesisParams = {
      text,
      voiceId: mapping.voiceId,
      speed: mapping.speed,
      pitch: mapping.pitch,
      style: mapping.style,
    };

    return provider.synthesize(params);
  }

  /**
   * Stream synthesis for an avatar
   */
  async *streamForAvatar(
    avatarSlug: string,
    text: string
  ): AsyncIterable<AudioChunk> {
    if (!this.enabled) {
      console.warn("[Voice] Voice service is disabled");
      return;
    }

    const mapping = this.avatarMappings.get(avatarSlug);
    if (!mapping) {
      console.warn(`[Voice] No voice mapping for avatar: ${avatarSlug}`);
      return;
    }

    const provider = this.providers.get(mapping.provider);
    if (!provider) {
      console.warn(`[Voice] Provider not available: ${mapping.provider}`);
      return;
    }

    const params: SynthesisParams = {
      text,
      voiceId: mapping.voiceId,
      speed: mapping.speed,
      pitch: mapping.pitch,
      style: mapping.style,
    };

    yield* provider.streamSynthesize(params);
  }

  /**
   * Get all available voices across providers
   */
  async getAllVoices(): Promise<Voice[]> {
    const allVoices: Voice[] = [];

    for (const provider of this.providers.values()) {
      if (provider.isAvailable()) {
        const voices = await provider.getVoices();
        allVoices.push(...voices);
      }
    }

    return allVoices;
  }

  /**
   * Update avatar voice mapping
   */
  setAvatarVoiceMapping(mapping: AvatarVoiceMapping): void {
    this.avatarMappings.set(mapping.avatarSlug, mapping);
    // TODO: Persist to database or config file
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const voiceService = new VoiceService();

// Re-export types
export type {
  VoiceProvider,
  SynthesisParams,
  SynthesisResponse,
  AudioChunk,
  Voice,
  AvatarVoiceMapping,
} from "./types";

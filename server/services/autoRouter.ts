/**
 * =============================================================================
 * AUTO-ROUTER SERVICE
 * =============================================================================
 *
 * Handles automatic avatar selection when the user does not manually choose.
 * Features:
 * - Semantic relevance scoring
 * - Deterministic tie-breaking
 * - Debate mode with opposing stance assignment
 * - Edge case handling
 * - Admin override support
 */

import { type AiAvatar } from "@shared/schema";
import { avatarRegistry } from "./avatarRegistry";
import { personaRegistry, type PersonaDefinition, type DebateStyle } from "./personaRegistry";
import {
  orchestrationLayer,
  type IntentClassification,
  type AvatarScore,
  type ConversationContext,
  type AdminOverrides,
  type Domain,
} from "./orchestrationLayer";

// =============================================================================
// TYPES
// =============================================================================

export enum DebateStance {
  ADVOCATE = "advocate",           // Supports the proposition
  CHALLENGER = "challenger",       // Challenges the proposition
  EVALUATOR = "evaluator",         // Weighs pros and cons objectively
  DEVILS_ADVOCATE = "devils_advocate", // Questions assumptions
}

export interface DebateAssignment {
  avatar: AiAvatar;
  persona?: PersonaDefinition;
  stance: DebateStance;
  speakingOrder: number;
  systemPromptAddendum: string;
}

export interface AutoRoutingResult {
  mode: "single" | "multi" | "debate";
  selectedAvatars: AiAvatar[];
  debateAssignments?: DebateAssignment[];
  scores: AvatarScore[];
  intent: IntentClassification;
  reasoning: string;
  determinismKey: string; // Hash for reproducibility verification
  edgeCaseHandled?: string;
}

export interface AutoRoutingConfig {
  scoring: {
    primaryDomainMatch: number;
    secondaryDomainMatch: number;
    partialDomainMatch: number;
    priorityMultiplier: number;
    recentAvatarPenalty: number;
    followUpBonus: number;
    maxAdminAdjustment: number;
  };
  thresholds: {
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    singleModeMinScore: number;
    multiModeScoreGap: number;
    debateModeMinScore: number;
  };
  limits: {
    multiModeMaxAvatars: number;
    multiModeMinAvatars: number;
  };
  fallback: {
    useDefaultOnLowConfidence: boolean;
    useMultiOnAmbiguous: boolean;
    defaultAvatarSlug: string;
  };
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: AutoRoutingConfig = {
  scoring: {
    primaryDomainMatch: 30,
    secondaryDomainMatch: 15,
    partialDomainMatch: 8,
    priorityMultiplier: 2,
    recentAvatarPenalty: -5,
    followUpBonus: 10,
    maxAdminAdjustment: 20,
  },
  thresholds: {
    highConfidence: 0.85,
    mediumConfidence: 0.65,
    lowConfidence: 0.45,
    singleModeMinScore: 50,
    multiModeScoreGap: 15,
    debateModeMinScore: 40,
  },
  limits: {
    multiModeMaxAvatars: 3,
    multiModeMinAvatars: 2,
  },
  fallback: {
    useDefaultOnLowConfidence: true,
    useMultiOnAmbiguous: true,
    defaultAvatarSlug: "insurance-expert",
  },
};

// =============================================================================
// CONTRADICTORY DOMAIN PAIRS (trigger debate consideration)
// =============================================================================

const CONTRADICTORY_DOMAINS: [Domain, Domain][] = [
  ["sales", "compliance"],      // Revenue vs rules
  ["mindset", "compliance"],    // Emotion vs logic
  ["persuasion", "compliance"], // Influence vs ethics
];

// =============================================================================
// DEBATE STYLE TO STANCE MAPPING
// =============================================================================

const STYLE_TO_STANCE: Record<DebateStyle, DebateStance> = {
  aggressive: DebateStance.CHALLENGER,
  supportive: DebateStance.ADVOCATE,
  analytical: DebateStance.EVALUATOR,
  skeptical: DebateStance.DEVILS_ADVOCATE,
  empathetic: DebateStance.ADVOCATE,
  logical: DebateStance.EVALUATOR,
};

const OPPOSITE_STANCES: Record<DebateStance, DebateStance> = {
  [DebateStance.ADVOCATE]: DebateStance.CHALLENGER,
  [DebateStance.CHALLENGER]: DebateStance.ADVOCATE,
  [DebateStance.EVALUATOR]: DebateStance.DEVILS_ADVOCATE,
  [DebateStance.DEVILS_ADVOCATE]: DebateStance.EVALUATOR,
};

// =============================================================================
// AUTO-ROUTER CLASS
// =============================================================================

export class AutoRouter {
  private config: AutoRoutingConfig;

  constructor(config: Partial<AutoRoutingConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, config);
  }

  private mergeConfig(
    defaults: AutoRoutingConfig,
    overrides: Partial<AutoRoutingConfig>
  ): AutoRoutingConfig {
    return {
      scoring: { ...defaults.scoring, ...overrides.scoring },
      thresholds: { ...defaults.thresholds, ...overrides.thresholds },
      limits: { ...defaults.limits, ...overrides.limits },
      fallback: { ...defaults.fallback, ...overrides.fallback },
    };
  }

  // ---------------------------------------------------------------------------
  // MAIN ENTRY POINT
  // ---------------------------------------------------------------------------

  async route(
    prompt: string,
    context?: ConversationContext,
    userSelectedMode?: "single" | "multi" | "debate"
  ): Promise<AutoRoutingResult> {
    const startTime = Date.now();

    // Step 1: Get routing decision from orchestration layer
    const routingDecision = await orchestrationLayer.routePrompt(
      prompt,
      context,
      userSelectedMode,
      undefined // No user-selected avatars
    );

    // Step 2: Apply deterministic sorting
    const sortedScores = this.applyDeterministicSort(routingDecision.scores);

    // Step 3: Handle edge cases
    const edgeCaseResult = this.handleEdgeCases(
      routingDecision.intent,
      sortedScores,
      routingDecision.mode
    );

    if (edgeCaseResult) {
      return {
        ...edgeCaseResult,
        determinismKey: this.generateDeterminismKey(prompt, sortedScores),
      };
    }

    // Step 4: Select avatars based on mode
    let selectedAvatars: AiAvatar[];
    let debateAssignments: DebateAssignment[] | undefined;
    let edgeCaseHandled: string | undefined;

    switch (routingDecision.mode) {
      case "single":
        selectedAvatars = await this.selectForSingleMode(sortedScores);
        break;

      case "multi":
        selectedAvatars = await this.selectForMultiMode(sortedScores);
        break;

      case "debate":
        const debateResult = await this.selectForDebateMode(
          sortedScores,
          prompt,
          routingDecision.intent
        );
        selectedAvatars = debateResult.avatars;
        debateAssignments = debateResult.assignments;
        break;

      default:
        selectedAvatars = await this.selectForSingleMode(sortedScores);
    }

    // Step 5: Generate determinism key
    const determinismKey = this.generateDeterminismKey(prompt, sortedScores);

    return {
      mode: routingDecision.mode,
      selectedAvatars,
      debateAssignments,
      scores: sortedScores,
      intent: routingDecision.intent,
      reasoning: this.buildDetailedReasoning(
        routingDecision.intent,
        sortedScores,
        routingDecision.mode,
        selectedAvatars,
        debateAssignments
      ),
      determinismKey,
      edgeCaseHandled,
    };
  }

  // ---------------------------------------------------------------------------
  // DETERMINISTIC SORTING
  // ---------------------------------------------------------------------------

  /**
   * Apply deterministic tie-breaking sort to ensure reproducible results
   */
  private applyDeterministicSort(scores: AvatarScore[]): AvatarScore[] {
    return [...scores].sort((a, b) => {
      // 1. Primary: Total score (descending)
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      // 2. Secondary: Domain match component (descending)
      if (b.breakdown.domainMatch !== a.breakdown.domainMatch) {
        return b.breakdown.domainMatch - a.breakdown.domainMatch;
      }

      // 3. Tertiary: Priority bonus (descending)
      if (b.breakdown.priorityBonus !== a.breakdown.priorityBonus) {
        return b.breakdown.priorityBonus - a.breakdown.priorityBonus;
      }

      // 4. Final: Alphabetical by slug (ascending) - guaranteed unique
      return a.avatarSlug.localeCompare(b.avatarSlug);
    });
  }

  /**
   * Generate a determinism key for verification
   */
  private generateDeterminismKey(prompt: string, scores: AvatarScore[]): string {
    const data = {
      promptHash: this.hashString(prompt),
      topScores: scores.slice(0, 5).map(s => ({
        slug: s.avatarSlug,
        score: s.totalScore,
      })),
    };
    return this.hashString(JSON.stringify(data));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // ---------------------------------------------------------------------------
  // EDGE CASE HANDLING
  // ---------------------------------------------------------------------------

  private handleEdgeCases(
    intent: IntentClassification,
    scores: AvatarScore[],
    mode: "single" | "multi" | "debate"
  ): AutoRoutingResult | null {
    const eligibleScores = scores.filter(s => s.eligible);

    // Edge Case 1: No eligible avatars
    if (eligibleScores.length === 0) {
      return this.handleNoEligibleAvatars(intent, scores);
    }

    // Edge Case 2: Ambiguous low-confidence intent
    if (intent.confidence < this.config.thresholds.lowConfidence) {
      const topScore = eligibleScores[0]?.totalScore || 0;
      const secondScore = eligibleScores[1]?.totalScore || 0;

      // Very close scores = truly ambiguous
      if (topScore - secondScore < 10 && this.config.fallback.useMultiOnAmbiguous) {
        return this.handleAmbiguousIntent(intent, eligibleScores);
      }
    }

    // Edge Case 3: Debate mode but less than 2 avatars
    if (mode === "debate" && eligibleScores.length < 2) {
      return this.handleInsufficientDebateParticipants(intent, eligibleScores);
    }

    // No edge case - proceed normally
    return null;
  }

  private async handleNoEligibleAvatars(
    intent: IntentClassification,
    scores: AvatarScore[]
  ): Promise<AutoRoutingResult> {
    // Try to get any active avatar as fallback
    const allAvatars = await avatarRegistry.getActiveAvatars();

    if (allAvatars.length === 0) {
      throw new Error("No active avatars available in system");
    }

    // Use highest priority active avatar
    const fallback = allAvatars.sort((a, b) =>
      b.responsePriority - a.responsePriority
    )[0];

    return {
      mode: "single",
      selectedAvatars: [fallback],
      scores,
      intent,
      reasoning: "No eligible avatars for query - using highest priority fallback",
      determinismKey: this.generateDeterminismKey("fallback", scores),
      edgeCaseHandled: "no_eligible_avatars",
    };
  }

  private async handleAmbiguousIntent(
    intent: IntentClassification,
    eligibleScores: AvatarScore[]
  ): Promise<AutoRoutingResult> {
    // Use multi-mode for diverse perspectives
    const topTwo = eligibleScores.slice(0, 2);
    const avatars = await avatarRegistry.getAvatarsByIds(topTwo.map(s => s.avatarId));

    return {
      mode: "multi",
      selectedAvatars: avatars,
      scores: eligibleScores,
      intent,
      reasoning: `Ambiguous intent (${Math.round(intent.confidence * 100)}% confidence) - providing multiple perspectives`,
      determinismKey: this.generateDeterminismKey("ambiguous", eligibleScores),
      edgeCaseHandled: "ambiguous_intent",
    };
  }

  private async handleInsufficientDebateParticipants(
    intent: IntentClassification,
    eligibleScores: AvatarScore[]
  ): Promise<AutoRoutingResult> {
    // Fall back to single mode
    const topAvatar = await avatarRegistry.getAvatarById(eligibleScores[0].avatarId);

    return {
      mode: "single",
      selectedAvatars: topAvatar ? [topAvatar] : [],
      scores: eligibleScores,
      intent,
      reasoning: "Insufficient avatars for debate - falling back to single mode",
      determinismKey: this.generateDeterminismKey("insufficient_debate", eligibleScores),
      edgeCaseHandled: "insufficient_debate_participants",
    };
  }

  // ---------------------------------------------------------------------------
  // MODE-SPECIFIC SELECTION
  // ---------------------------------------------------------------------------

  private async selectForSingleMode(scores: AvatarScore[]): Promise<AiAvatar[]> {
    const eligibleScores = scores.filter(s => s.eligible);

    if (eligibleScores.length === 0) {
      // Use default avatar
      const defaultAvatar = await avatarRegistry.getAvatarBySlug(
        this.config.fallback.defaultAvatarSlug
      );
      return defaultAvatar ? [defaultAvatar] : [];
    }

    const topScore = eligibleScores[0];

    // Check minimum score threshold
    if (topScore.totalScore < this.config.thresholds.singleModeMinScore) {
      // Score too low, use default if configured
      if (this.config.fallback.useDefaultOnLowConfidence) {
        const defaultAvatar = await avatarRegistry.getAvatarBySlug(
          this.config.fallback.defaultAvatarSlug
        );
        if (defaultAvatar) {
          return [defaultAvatar];
        }
      }
    }

    const avatar = await avatarRegistry.getAvatarById(topScore.avatarId);
    return avatar ? [avatar] : [];
  }

  private async selectForMultiMode(scores: AvatarScore[]): Promise<AiAvatar[]> {
    const eligibleScores = scores.filter(s => s.eligible);

    if (eligibleScores.length === 0) {
      return this.selectForSingleMode(scores);
    }

    const topScore = eligibleScores[0].totalScore;
    const threshold = topScore - this.config.thresholds.multiModeScoreGap;

    // Select avatars within the score gap
    let selectedScores = eligibleScores.filter(
      (s, i) => i < this.config.limits.multiModeMaxAvatars && s.totalScore >= threshold
    );

    // Ensure minimum avatars
    if (selectedScores.length < this.config.limits.multiModeMinAvatars) {
      selectedScores = eligibleScores.slice(0, this.config.limits.multiModeMinAvatars);
    }

    const avatarIds = selectedScores.map(s => s.avatarId);
    return avatarRegistry.getAvatarsByIds(avatarIds);
  }

  private async selectForDebateMode(
    scores: AvatarScore[],
    topic: string,
    intent: IntentClassification
  ): Promise<{ avatars: AiAvatar[]; assignments: DebateAssignment[] }> {
    const eligibleScores = scores.filter(s => s.eligible);

    if (eligibleScores.length < 2) {
      const avatar = await avatarRegistry.getAvatarById(eligibleScores[0]?.avatarId);
      return {
        avatars: avatar ? [avatar] : [],
        assignments: [],
      };
    }

    // Get top avatar
    const avatar1 = await avatarRegistry.getAvatarById(eligibleScores[0].avatarId);
    if (!avatar1) {
      return { avatars: [], assignments: [] };
    }

    // Find debate partner with different style
    const avatar2 = await this.findDebatePartner(avatar1, eligibleScores.slice(1));
    if (!avatar2) {
      return {
        avatars: [avatar1],
        assignments: [],
      };
    }

    // Assign stances
    const assignments = this.assignDebateStances(avatar1, avatar2, topic);

    return {
      avatars: [avatar1, avatar2],
      assignments,
    };
  }

  // ---------------------------------------------------------------------------
  // DEBATE LOGIC
  // ---------------------------------------------------------------------------

  /**
   * Find the best debate partner for the primary avatar
   * Prefers avatars with different debate styles for diversity
   */
  private async findDebatePartner(
    primaryAvatar: AiAvatar,
    candidateScores: AvatarScore[]
  ): Promise<AiAvatar | null> {
    // First pass: Find highest-scoring avatar with different debate style
    for (const score of candidateScores) {
      if (!score.eligible) continue;

      const candidate = await avatarRegistry.getAvatarById(score.avatarId);
      if (candidate && candidate.debateStyle !== primaryAvatar.debateStyle) {
        console.log(
          `[AutoRouter] Selected debate partner with different style: ${candidate.slug} (${candidate.debateStyle}) vs ${primaryAvatar.slug} (${primaryAvatar.debateStyle})`
        );
        return candidate;
      }
    }

    // Second pass: Accept any eligible avatar if no different style found
    for (const score of candidateScores) {
      if (!score.eligible) continue;

      const candidate = await avatarRegistry.getAvatarById(score.avatarId);
      if (candidate) {
        console.warn(
          `[AutoRouter] No different debate style available - using ${candidate.slug}`
        );
        return candidate;
      }
    }

    return null;
  }

  /**
   * Assign debate stances to avatars based on their styles and the topic
   */
  private assignDebateStances(
    avatar1: AiAvatar,
    avatar2: AiAvatar,
    topic: string
  ): DebateAssignment[] {
    // Get natural stances based on debate styles
    let stance1 = STYLE_TO_STANCE[avatar1.debateStyle as DebateStyle] || DebateStance.EVALUATOR;
    let stance2 = STYLE_TO_STANCE[avatar2.debateStyle as DebateStyle] || DebateStance.EVALUATOR;

    // Ensure stance diversity
    if (stance1 === stance2) {
      stance2 = OPPOSITE_STANCES[stance1];
    }

    // Get personas for enhanced prompts
    const persona1 = personaRegistry.getBySlug(avatar1.slug);
    const persona2 = personaRegistry.getBySlug(avatar2.slug);

    return [
      {
        avatar: avatar1,
        persona: persona1,
        stance: stance1,
        speakingOrder: 1,
        systemPromptAddendum: this.buildStancePrompt(stance1, topic, 1),
      },
      {
        avatar: avatar2,
        persona: persona2,
        stance: stance2,
        speakingOrder: 2,
        systemPromptAddendum: this.buildStancePrompt(stance2, topic, 2),
      },
    ];
  }

  /**
   * Build stance-specific system prompt addendum
   */
  private buildStancePrompt(
    stance: DebateStance,
    topic: string,
    speakingOrder: number
  ): string {
    const stanceInstructions: Record<DebateStance, string> = {
      [DebateStance.ADVOCATE]: `
DEBATE STANCE: ADVOCATE
Your role is to SUPPORT and BUILD UPON the proposition. Find the strongest arguments in favor.
- Lead with the most compelling evidence
- Acknowledge opposing points but pivot to strengths
- Use optimistic, constructive language
- End with a forward-looking recommendation`,

      [DebateStance.CHALLENGER]: `
DEBATE STANCE: CHALLENGER
Your role is to CHALLENGE and QUESTION the proposition. Find potential weaknesses and risks.
- Point out what could go wrong
- Ask probing "what if" questions
- Don't be contrarian for its own sake, but ensure all angles are considered
- Offer alternatives when criticizing`,

      [DebateStance.EVALUATOR]: `
DEBATE STANCE: EVALUATOR
Your role is to ANALYZE and WEIGH both sides objectively.
- Present pros and cons systematically
- Use data and evidence where possible
- Avoid taking sides until you've analyzed all factors
- Conclude with a balanced assessment`,

      [DebateStance.DEVILS_ADVOCATE]: `
DEBATE STANCE: DEVIL'S ADVOCATE
Your role is to QUESTION ASSUMPTIONS and STRESS-TEST ideas.
- Ask "have we considered..."
- Challenge conventional wisdom
- Bring up edge cases and exceptions
- Push back on certainty`,
    };

    const orderInstructions = speakingOrder === 1
      ? "You speak FIRST. Set the stage and establish the key points."
      : "You speak SECOND. Respond to what was said and build on or counter the arguments.";

    return `
---
DEBATE MODE ACTIVE
Topic: "${topic}"
${stanceInstructions[stance]}

${orderInstructions}

Keep your response focused (under 250 words). Engage with the topic directly.
`;
  }

  // ---------------------------------------------------------------------------
  // DEBATE TRIGGER DETECTION
  // ---------------------------------------------------------------------------

  /**
   * Check if the prompt should automatically trigger debate mode
   */
  shouldTriggerDebate(
    intent: IntentClassification,
    scores: AvatarScore[]
  ): { trigger: boolean; reason?: string } {
    const eligibleScores = scores.filter(s => s.eligible);

    // Trigger 1: Explicit comparison question
    if (intent.questionType === "compare") {
      return { trigger: true, reason: "Comparison question detected" };
    }

    // Trigger 2: Opinion question with closely matched avatars
    if (intent.questionType === "opinion" && eligibleScores.length >= 2) {
      const [first, second] = eligibleScores;
      const scoreGap = first.totalScore - second.totalScore;
      const threshold = this.config.thresholds.multiModeScoreGap * 0.75;

      if (scoreGap <= threshold) {
        return { trigger: true, reason: `Opinion question with close scores (gap: ${scoreGap})` };
      }
    }

    // Trigger 3: Multi-domain question with contradictory domains
    if (intent.secondaryDomains.length >= 1) {
      const domains = [intent.primaryDomain, ...intent.secondaryDomains];
      const hasContradiction = CONTRADICTORY_DOMAINS.some(
        ([a, b]) => domains.includes(a) && domains.includes(b)
      );

      if (hasContradiction) {
        return { trigger: true, reason: "Contradictory domains detected (e.g., sales vs compliance)" };
      }
    }

    return { trigger: false };
  }

  // ---------------------------------------------------------------------------
  // REASONING
  // ---------------------------------------------------------------------------

  private buildDetailedReasoning(
    intent: IntentClassification,
    scores: AvatarScore[],
    mode: "single" | "multi" | "debate",
    selectedAvatars: AiAvatar[],
    debateAssignments?: DebateAssignment[]
  ): string {
    const parts: string[] = [];

    // Intent summary
    parts.push(`Intent: ${intent.primaryDomain} (${intent.questionType})`);
    parts.push(`Confidence: ${Math.round(intent.confidence * 100)}%`);

    if (intent.secondaryDomains.length > 0) {
      parts.push(`Secondary domains: ${intent.secondaryDomains.join(", ")}`);
    }

    // Top scores
    const topScores = scores.slice(0, 3).filter(s => s.eligible);
    if (topScores.length > 0) {
      parts.push(`Top candidates: ${topScores.map(s => `${s.avatarName}(${s.totalScore})`).join(", ")}`);
    }

    // Mode reasoning
    parts.push(`Mode: ${mode}`);

    // Selection
    const selectedNames = selectedAvatars.map(a => a.name).join(", ");
    parts.push(`Selected: ${selectedNames}`);

    // Debate-specific
    if (debateAssignments && debateAssignments.length > 0) {
      const stanceInfo = debateAssignments
        .map(a => `${a.avatar.name}: ${a.stance}`)
        .join(", ");
      parts.push(`Debate stances: ${stanceInfo}`);
    }

    return parts.join(". ");
  }

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------

  getConfig(): AutoRoutingConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AutoRoutingConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const autoRouter = new AutoRouter();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Quick route - simple interface for common use cases
 */
export async function quickRoute(prompt: string): Promise<AutoRoutingResult> {
  return autoRouter.route(prompt);
}

/**
 * Route with context - includes conversation history
 */
export async function routeWithContext(
  prompt: string,
  context: ConversationContext
): Promise<AutoRoutingResult> {
  return autoRouter.route(prompt, context);
}

/**
 * Force debate mode routing
 */
export async function routeForDebate(
  prompt: string,
  context?: ConversationContext
): Promise<AutoRoutingResult> {
  return autoRouter.route(prompt, context, "debate");
}

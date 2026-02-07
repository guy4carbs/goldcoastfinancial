/**
 * =============================================================================
 * AGENT ORCHESTRATION LAYER - THE CORE BRAIN
 * =============================================================================
 *
 * This module is the central decision-making engine for the Avatar Council.
 * It receives user prompts and determines:
 *   1. What domain(s) the question relates to
 *   2. What type of question it is
 *   3. Which avatar(s) should respond
 *   4. What mode to use (single, multi, debate)
 *
 * ARCHITECTURE OVERVIEW:
 *
 *   User Prompt
 *        │
 *        ▼
 *   ┌─────────────────────────────────────┐
 *   │     INTENT CLASSIFIER               │
 *   │  - Domain detection                 │
 *   │  - Question type analysis           │
 *   │  - Confidence scoring               │
 *   │  - Multi-domain detection           │
 *   └─────────────────────────────────────┘
 *        │
 *        ▼
 *   ┌─────────────────────────────────────┐
 *   │     ADMIN OVERRIDE CHECK            │
 *   │  - Forced avatar selection          │
 *   │  - Disabled avatars                 │
 *   │  - Domain restrictions              │
 *   │  - Mode overrides                   │
 *   └─────────────────────────────────────┘
 *        │
 *        ▼
 *   ┌─────────────────────────────────────┐
 *   │     AVATAR RANKER                   │
 *   │  - Score each avatar                │
 *   │  - Apply weighting factors          │
 *   │  - Consider conversation context    │
 *   │  - Apply admin adjustments          │
 *   └─────────────────────────────────────┘
 *        │
 *        ▼
 *   ┌─────────────────────────────────────┐
 *   │     ROUTING DECISION ENGINE         │
 *   │  - Determine response mode          │
 *   │  - Select final avatar(s)           │
 *   │  - Apply deterministic rules        │
 *   └─────────────────────────────────────┘
 *        │
 *        ▼
 *   Orchestration Result
 */

import { type AiAvatar } from "@shared/schema";
import { avatarRegistry } from "./avatarRegistry";
import { llmService } from "./llmService";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Recognized domains for insurance agent support
 */
export type Domain =
  | "insurance"      // Policies, underwriting, products, claims
  | "sales"          // Closing, presentations, prospecting
  | "compliance"     // Regulations, licensing, documentation
  | "mindset"        // Motivation, confidence, call reluctance
  | "persuasion"     // Influence, tonality, rapport
  | "objections"     // Handling specific objections
  | "general";       // Catch-all for unclear intent

/**
 * Types of questions users might ask
 */
export type QuestionType =
  | "how_to"         // Step-by-step guidance needed
  | "explain"        // Seeking understanding/education
  | "script"         // Wanting specific language to use
  | "opinion"        // Seeking advice on best approach
  | "troubleshoot"   // Having a problem to solve
  | "compare"        // Comparing options or approaches
  | "validate"       // Seeking confirmation of approach
  | "general";       // General inquiry

/**
 * Response modes the system can use
 */
export type ResponseMode = "single" | "multi" | "debate";

/**
 * Result of intent classification
 */
export interface IntentClassification {
  primaryDomain: Domain;
  secondaryDomains: Domain[];
  questionType: QuestionType;
  confidence: number;           // 0.0 - 1.0
  keywords: string[];           // Detected keywords that influenced classification
  suggestedMode: ResponseMode;  // Recommended mode based on question
  reasoning: string;            // Explanation of classification
  targetedAvatarSlug?: string;  // If user directly addressed an avatar by name
}

/**
 * Avatar score with breakdown
 */
export interface AvatarScore {
  avatarId: string;
  avatarSlug: string;
  avatarName: string;
  totalScore: number;
  breakdown: {
    domainMatch: number;        // Score from domain expertise match
    questionTypeMatch: number;  // Score from question type fit
    priorityBonus: number;      // Bonus from avatar priority setting
    contextBonus: number;       // Bonus from conversation context
    adminAdjustment: number;    // Admin-applied score adjustment
  };
  eligible: boolean;            // Whether avatar can be selected
  disqualifyReason?: string;    // Why avatar is not eligible
}

/**
 * Final routing decision
 */
export interface RoutingDecision {
  mode: ResponseMode;
  selectedAvatars: AiAvatar[];
  scores: AvatarScore[];
  intent: IntentClassification;
  reasoning: string;
  adminOverrideApplied: boolean;
  overrideDetails?: string;
}

/**
 * Admin override configuration
 */
export interface AdminOverrides {
  forceAvatarId?: string;           // Force specific avatar regardless of scoring
  forceMode?: ResponseMode;         // Force specific mode
  disabledAvatarIds?: string[];     // Avatars that cannot be selected
  domainRestrictions?: {            // Restrict domains to specific avatars
    [domain: string]: string[];     // domain -> allowed avatar IDs
  };
  priorityAdjustments?: {           // Adjust avatar priorities
    [avatarId: string]: number;     // avatar ID -> adjustment (-10 to +10)
  };
  minConfidenceThreshold?: number;  // Minimum confidence to auto-route (default 0.6)
  defaultAvatar?: string;           // Fallback avatar when confidence is low
}

/**
 * Conversation context for smarter routing
 */
export interface ConversationContext {
  recentDomains: Domain[];          // Domains from recent messages
  recentAvatarIds: string[];        // Avatars that have responded recently
  messageCount: number;             // Number of messages in conversation
  isFollowUp: boolean;              // Whether this seems like a follow-up
}

// =============================================================================
// KEYWORD MAPPINGS
// =============================================================================

/**
 * Domain keyword mappings for classification
 * Each domain has primary keywords (strong signal) and secondary keywords (weaker signal)
 */
const DOMAIN_KEYWORDS: Record<Domain, { primary: string[]; secondary: string[] }> = {
  insurance: {
    primary: [
      "policy", "coverage", "underwriting", "premium", "beneficiary",
      "term life", "whole life", "iul", "final expense", "death benefit",
      "cash value", "rider", "exclusion", "claim", "insured", "applicant"
    ],
    secondary: [
      "insurance", "carrier", "product", "illustration", "face amount",
      "medical", "health", "age", "rate", "quote", "application"
    ]
  },
  sales: {
    primary: [
      "close", "closing", "sale", "selling", "prospect", "presentation",
      "deal", "pipeline", "follow up", "appointment", "pitch"
    ],
    secondary: [
      "client", "customer", "meeting", "call", "lead", "convert",
      "approach", "technique", "strategy", "win"
    ]
  },
  compliance: {
    primary: [
      "compliance", "regulation", "finra", "sec", "hipaa", "license",
      "audit", "documentation", "suitability", "disclosure", "e&o"
    ],
    secondary: [
      "legal", "requirement", "rule", "law", "state", "federal",
      "ethics", "violation", "penalty", "record"
    ]
  },
  mindset: {
    primary: [
      "motivation", "mindset", "confidence", "fear", "reluctance",
      "rejection", "burnout", "struggle", "overwhelm", "anxiety"
    ],
    secondary: [
      "goal", "success", "believe", "focus", "energy", "positive",
      "negative", "mental", "emotional", "attitude", "habit"
    ]
  },
  persuasion: {
    primary: [
      "persuade", "persuasion", "influence", "tonality", "straight line",
      "certainty", "rapport", "convince", "belfort", "body language"
    ],
    secondary: [
      "trust", "connection", "psychology", "technique", "control",
      "frame", "loop", "pattern", "script"
    ]
  },
  objections: {
    primary: [
      "objection", "rebuttal", "overcome", "handle", "response",
      "think about it", "spouse", "too expensive", "not interested"
    ],
    secondary: [
      "pushback", "concern", "hesitation", "resistance", "excuse",
      "stall", "delay", "no", "maybe"
    ]
  },
  general: {
    primary: [],
    secondary: []
  }
};

/**
 * Avatar name aliases - maps various ways users might address an avatar
 * Used to detect direct mentions like "Hey Wolf" or "Jordan, what do you think"
 */
const AVATAR_NAME_ALIASES: Record<string, string[]> = {
  "warren-buffett": [
    "warren", "buffett", "oracle", "oracle of omaha"
  ],
  "patrick-bet-david": [
    "patrick", "pbd", "bet-david", "valuetainment"
  ],
  "ben-feldman": [
    "ben", "feldman", "billion dollar"
  ],
  "elizur-wright": [
    "elizur", "wright", "father of life insurance"
  ],
  "jordan-belfort": [
    "jordan", "belfort", "wolf", "wolf of wall street"
  ],
  "andy-elliott": [
    "andy", "elliott", "closer"
  ],
};

/**
 * Question type indicators
 */
const QUESTION_TYPE_PATTERNS: Record<QuestionType, RegExp[]> = {
  how_to: [
    /how (do|can|should|would) (i|we|you)/i,
    /what('s| is) the (best |right |)way to/i,
    /steps to/i,
    /guide me/i,
    /teach me/i,
    /walk me through/i
  ],
  explain: [
    /what (is|are|does)/i,
    /explain/i,
    /why (is|does|do|would)/i,
    /tell me about/i,
    /describe/i,
    /difference between/i
  ],
  script: [
    /what (do|should|can) i say/i,
    /give me (a |the )(script|words|language)/i,
    /how (do|should) i (word|phrase|respond)/i,
    /exact words/i,
    /verbatim/i,
    /word for word/i
  ],
  opinion: [
    /what do you (think|recommend|suggest)/i,
    /should i/i,
    /would you/i,
    /best (way|approach|strategy)/i,
    /your (advice|opinion|take)/i,
    /pros and cons/i
  ],
  troubleshoot: [
    /not working/i,
    /having (trouble|issues|problems)/i,
    /can't (seem to|figure out|get)/i,
    /what('m| am) i doing wrong/i,
    /keeps (happening|failing)/i,
    /stuck on/i
  ],
  compare: [
    /compare/i,
    /versus|vs\.?/i,
    /difference between/i,
    /which (is|one) (better|best)/i,
    /or should i/i,
    /pros and cons/i
  ],
  validate: [
    /is (this|it|that) (right|correct|ok|good)/i,
    /am i (right|correct|on track)/i,
    /does this (make sense|sound right)/i,
    /confirm/i,
    /verify/i
  ],
  general: []
};

// =============================================================================
// SCORING WEIGHTS
// =============================================================================

const SCORING_WEIGHTS = {
  // Domain matching weights
  primaryDomainMatch: 30,      // Avatar's primary domain matches
  secondaryDomainMatch: 15,    // Avatar has secondary domain match
  partialDomainMatch: 8,       // Partial keyword overlap

  // Question type weights (avatar-slug -> bonus points)
  questionTypeBonus: {
    script: { "objection-handler": 15, "sales-closer": 10, "persuasion-strategist": 10 },
    how_to: { "insurance-expert": 10, "compliance-specialist": 10, "underwriting-analyst": 10 },
    explain: { "insurance-expert": 15, "compliance-specialist": 10, "underwriting-analyst": 8 },
    opinion: { "mindset-coach": 10, "sales-closer": 10, "intensity-coach": 8 },
    troubleshoot: { "mindset-coach": 10, "objection-handler": 10 },
    compare: { "insurance-expert": 10, "underwriting-analyst": 8 },
    validate: { "compliance-specialist": 15, "insurance-expert": 10, "underwriting-analyst": 8 },
    general: {}
  },

  // Priority multiplier (applied to avatar.responsePriority)
  priorityMultiplier: 2,

  // Context bonuses
  recentAvatarPenalty: -5,     // Penalty for avatar that just responded (variety)
  followUpBonus: 10,           // Bonus for keeping same avatar on follow-ups

  // Admin adjustment cap
  maxAdminAdjustment: 20,
};

// =============================================================================
// ROUTING THRESHOLDS
// =============================================================================

const ROUTING_THRESHOLDS = {
  // Confidence thresholds
  highConfidence: 0.85,        // Very confident in classification
  mediumConfidence: 0.65,      // Reasonably confident
  lowConfidence: 0.45,         // Uncertain, might need fallback

  // Score thresholds for mode selection
  singleModeMinScore: 50,      // Minimum score for single avatar response
  multiModeScoreGap: 15,       // If top 2-3 are within this gap, consider multi
  debateModeMinScore: 40,      // Minimum score for debate participants

  // Multi-mode selection
  multiModeMaxAvatars: 3,      // Maximum avatars in multi mode
  multiModeMinAvatars: 2,      // Minimum avatars in multi mode
};

// =============================================================================
// ORCHESTRATION LAYER CLASS
// =============================================================================

export class OrchestrationLayer {
  private adminOverrides: AdminOverrides = {};

  // ---------------------------------------------------------------------------
  // MAIN ENTRY POINT
  // ---------------------------------------------------------------------------

  /**
   * Process a user prompt and determine the optimal routing
   */
  async routePrompt(
    prompt: string,
    context?: ConversationContext,
    userSelectedMode?: ResponseMode,
    userSelectedAvatarIds?: string[]
  ): Promise<RoutingDecision> {
    // Step 1: Classify intent
    const intent = await this.classifyIntent(prompt, context);

    // Step 2: Check for user selection (takes precedence over auto-routing)
    if (userSelectedAvatarIds && userSelectedAvatarIds.length > 0) {
      // Step 2b: Check if user mentioned a specific avatar in the message
      // This allows natural language targeting even when multiple avatars selected
      if (intent.targetedAvatarSlug && userSelectedAvatarIds.length > 1) {
        // Find the targeted avatar among the selected ones
        const allAvatars = await avatarRegistry.getAllAvatars();
        const targetedAvatar = allAvatars.find(a => a.slug === intent.targetedAvatarSlug);

        if (targetedAvatar && userSelectedAvatarIds.includes(targetedAvatar.id)) {
          // Route only to the targeted avatar
          return this.handleUserSelection(
            [targetedAvatar.id],
            "single",
            intent
          );
        }
      }

      return this.handleUserSelection(
        userSelectedAvatarIds,
        userSelectedMode || "single",
        intent
      );
    }

    // Step 3: Check for admin forced avatar
    if (this.adminOverrides.forceAvatarId) {
      return this.handleAdminForcedAvatar(intent);
    }

    // Step 3b: Check for natural language avatar targeting (when no selection made)
    if (intent.targetedAvatarSlug) {
      const allAvatars = await avatarRegistry.getAllAvatars();
      const targetedAvatar = allAvatars.find(a => a.slug === intent.targetedAvatarSlug);

      if (targetedAvatar) {
        return this.handleUserSelection(
          [targetedAvatar.id],
          "single",
          intent
        );
      }
    }

    // Step 4: Get and score all avatars
    const scores = await this.scoreAvatars(intent, context);

    // Step 5: Apply admin adjustments
    const adjustedScores = this.applyAdminAdjustments(scores, intent);

    // Step 6: Make routing decision
    const mode = this.determineMode(intent, adjustedScores, userSelectedMode);

    // Step 7: Select avatars based on mode
    const selectedAvatars = await this.selectAvatarsForMode(mode, adjustedScores);

    return {
      mode,
      selectedAvatars,
      scores: adjustedScores,
      intent,
      reasoning: this.buildReasoning(intent, adjustedScores, mode, selectedAvatars),
      adminOverrideApplied: false,
    };
  }

  // ---------------------------------------------------------------------------
  // INTENT CLASSIFICATION
  // ---------------------------------------------------------------------------

  /**
   * Classify the intent of a user prompt
   */
  async classifyIntent(
    prompt: string,
    context?: ConversationContext
  ): Promise<IntentClassification> {
    const promptLower = prompt.toLowerCase();

    // Detect if user directly addressed a specific avatar
    const targetedAvatarSlug = this.detectDirectAvatarMention(prompt);

    // Detect domains using keyword matching
    const domainScores = this.scoreDomains(promptLower);
    const sortedDomains = Object.entries(domainScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    const primaryDomain = (sortedDomains[0]?.[0] || "general") as Domain;
    const secondaryDomains = sortedDomains
      .slice(1, 3)
      .filter(([_, score]) => score > 5)
      .map(([domain]) => domain as Domain);

    // Detect question type
    const questionType = this.detectQuestionType(promptLower);

    // Calculate confidence
    const confidence = this.calculateConfidence(
      domainScores,
      primaryDomain,
      questionType,
      context
    );

    // Determine suggested mode - if user targeted a specific avatar, suggest single mode
    const suggestedMode = targetedAvatarSlug
      ? "single" as ResponseMode
      : this.suggestMode(
          primaryDomain,
          secondaryDomains,
          questionType,
          confidence
        );

    // Extract keywords that matched
    const keywords = this.extractMatchedKeywords(promptLower);

    // Build reasoning
    let reasoning = this.buildClassificationReasoning(
      primaryDomain,
      secondaryDomains,
      questionType,
      confidence,
      keywords
    );

    // Add targeted avatar info to reasoning
    if (targetedAvatarSlug) {
      reasoning = `User directly addressed ${targetedAvatarSlug}. ${reasoning}`;
    }

    // Optionally enhance with LLM for low confidence cases
    if (confidence < ROUTING_THRESHOLDS.lowConfidence && llmService.isAvailable()) {
      const enhanced = await this.enhanceWithLLM(prompt, {
        primaryDomain,
        secondaryDomains,
        questionType,
        confidence,
        keywords,
        suggestedMode,
        reasoning,
      });
      // Preserve targeted avatar even after LLM enhancement
      return { ...enhanced, targetedAvatarSlug };
    }

    return {
      primaryDomain,
      secondaryDomains,
      questionType,
      confidence,
      keywords,
      suggestedMode,
      reasoning,
      targetedAvatarSlug,
    };
  }

  /**
   * Score each domain based on keyword matches
   */
  private scoreDomains(prompt: string): Record<Domain, number> {
    const scores: Record<Domain, number> = {
      insurance: 0,
      sales: 0,
      compliance: 0,
      mindset: 0,
      persuasion: 0,
      objections: 0,
      general: 0,
    };

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      if (domain === "general") continue;

      // Score primary keywords (strong signal)
      for (const keyword of keywords.primary) {
        if (prompt.includes(keyword.toLowerCase())) {
          scores[domain as Domain] += 10;
        }
      }

      // Score secondary keywords (weaker signal)
      for (const keyword of keywords.secondary) {
        if (prompt.includes(keyword.toLowerCase())) {
          scores[domain as Domain] += 5;
        }
      }
    }

    // If no domain scored, mark as general
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) {
      scores.general = 5;
    }

    return scores;
  }

  /**
   * Detect the type of question being asked
   */
  private detectQuestionType(prompt: string): QuestionType {
    for (const [type, patterns] of Object.entries(QUESTION_TYPE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(prompt)) {
          return type as QuestionType;
        }
      }
    }
    return "general";
  }

  /**
   * Detect if user directly addressed a specific avatar by name
   * Returns the avatar slug if found, undefined otherwise
   */
  private detectDirectAvatarMention(prompt: string): string | undefined {
    const promptLower = prompt.toLowerCase();

    // Common patterns for direct address
    const directAddressPatterns = [
      /^(hey|hi|hello|yo|ok|okay|alright)?\s*,?\s*(\w+)/i,  // "Hey Warren," "Hi Wolf"
      /\b(ask|tell|want|need)\s+(\w+)/i,                      // "ask Warren", "tell Jordan"
      /\b(\w+)\s*,?\s*(what|how|can|do|tell|help|give)/i,     // "Warren, what do you think"
      /\b(from|by|to)\s+(\w+)/i,                               // "I want to hear from Wolf"
    ];

    for (const [avatarSlug, aliases] of Object.entries(AVATAR_NAME_ALIASES)) {
      for (const alias of aliases) {
        // Check if alias appears in the prompt
        const aliasLower = alias.toLowerCase();

        // Direct mention check (word boundary)
        const wordBoundaryPattern = new RegExp(`\\b${aliasLower}\\b`, 'i');
        if (wordBoundaryPattern.test(promptLower)) {
          // Verify it's in an addressing context (not just a casual mention)
          // Look for patterns that suggest the user wants to talk to this avatar

          // Check for direct address patterns
          for (const pattern of directAddressPatterns) {
            const match = prompt.match(pattern);
            if (match && match[0].toLowerCase().includes(aliasLower)) {
              return avatarSlug;
            }
          }

          // Check for "I want X's opinion" or "What does X think" patterns
          const opinionPatterns = [
            new RegExp(`${aliasLower}['']?s\\s+(opinion|take|view|thought|perspective|advice)`, 'i'),
            new RegExp(`what\\s+(does|would|do)\\s+${aliasLower}\\s+(think|say|recommend)`, 'i'),
            new RegExp(`(talk|speak|chat)\\s+(to|with)\\s+${aliasLower}`, 'i'),
            new RegExp(`${aliasLower}\\s*,`, 'i'),  // "Warren, ..."
          ];

          for (const pattern of opinionPatterns) {
            if (pattern.test(prompt)) {
              return avatarSlug;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Calculate confidence in the classification
   */
  private calculateConfidence(
    domainScores: Record<Domain, number>,
    primaryDomain: Domain,
    questionType: QuestionType,
    context?: ConversationContext
  ): number {
    const scores = Object.values(domainScores);
    const maxScore = Math.max(...scores);
    const secondMaxScore = scores.sort((a, b) => b - a)[1] || 0;

    // Base confidence from score dominance
    let confidence = 0.5;

    // Strong primary domain signal
    if (maxScore >= 20) {
      confidence += 0.2;
    } else if (maxScore >= 10) {
      confidence += 0.1;
    }

    // Clear separation from second domain
    if (maxScore - secondMaxScore >= 15) {
      confidence += 0.15;
    } else if (maxScore - secondMaxScore >= 10) {
      confidence += 0.08;
    }

    // Clear question type detected
    if (questionType !== "general") {
      confidence += 0.1;
    }

    // Context alignment
    if (context?.recentDomains.includes(primaryDomain)) {
      confidence += 0.05;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Suggest response mode based on classification
   */
  private suggestMode(
    primaryDomain: Domain,
    secondaryDomains: Domain[],
    questionType: QuestionType,
    confidence: number
  ): ResponseMode {
    // Compare questions are good for debate
    if (questionType === "compare") {
      return "debate";
    }

    // Multiple strong domains suggest multi-avatar response
    if (secondaryDomains.length >= 2 && confidence < ROUTING_THRESHOLDS.highConfidence) {
      return "multi";
    }

    // Opinion questions with multiple domains could be debate
    if (questionType === "opinion" && secondaryDomains.length >= 1) {
      return "debate";
    }

    // Default to single for focused questions
    return "single";
  }

  /**
   * Extract keywords that matched from the prompt
   */
  private extractMatchedKeywords(prompt: string): string[] {
    const matched: string[] = [];

    for (const keywords of Object.values(DOMAIN_KEYWORDS)) {
      for (const keyword of [...keywords.primary, ...keywords.secondary]) {
        if (prompt.includes(keyword.toLowerCase()) && !matched.includes(keyword)) {
          matched.push(keyword);
        }
      }
    }

    return matched.slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Build human-readable classification reasoning
   */
  private buildClassificationReasoning(
    primaryDomain: Domain,
    secondaryDomains: Domain[],
    questionType: QuestionType,
    confidence: number,
    keywords: string[]
  ): string {
    const parts: string[] = [];

    parts.push(`Primary domain: ${primaryDomain} (${Math.round(confidence * 100)}% confidence)`);

    if (secondaryDomains.length > 0) {
      parts.push(`Secondary domains: ${secondaryDomains.join(", ")}`);
    }

    parts.push(`Question type: ${questionType.replace("_", " ")}`);

    if (keywords.length > 0) {
      parts.push(`Key terms: ${keywords.slice(0, 5).join(", ")}`);
    }

    return parts.join(". ");
  }

  /**
   * Enhance classification with LLM for uncertain cases
   */
  private async enhanceWithLLM(
    prompt: string,
    baseClassification: IntentClassification
  ): Promise<IntentClassification> {
    try {
      const llmResult = await llmService.classifyIntent(prompt);

      // Merge LLM insights with rule-based classification
      return {
        ...baseClassification,
        primaryDomain: (llmResult.domain as Domain) || baseClassification.primaryDomain,
        questionType: (llmResult.questionType as QuestionType) || baseClassification.questionType,
        confidence: Math.max(baseClassification.confidence, llmResult.confidence),
        reasoning: `${baseClassification.reasoning}. LLM: ${llmResult.domain} (${Math.round(llmResult.confidence * 100)}%)`,
      };
    } catch (error) {
      // Fall back to rule-based classification
      return baseClassification;
    }
  }

  // ---------------------------------------------------------------------------
  // AVATAR SCORING
  // ---------------------------------------------------------------------------

  /**
   * Score all avatars for the given intent
   */
  async scoreAvatars(
    intent: IntentClassification,
    context?: ConversationContext
  ): Promise<AvatarScore[]> {
    const avatars = await avatarRegistry.getActiveAvatars();
    const scores: AvatarScore[] = [];

    for (const avatar of avatars) {
      const score = this.scoreAvatar(avatar, intent, context);
      scores.push(score);
    }

    // Sort by total score descending
    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Score a single avatar
   */
  private scoreAvatar(
    avatar: AiAvatar,
    intent: IntentClassification,
    context?: ConversationContext
  ): AvatarScore {
    const breakdown = {
      domainMatch: 0,
      questionTypeMatch: 0,
      priorityBonus: 0,
      contextBonus: 0,
      adminAdjustment: 0,
    };

    // Check eligibility first
    const eligibility = this.checkEligibility(avatar, intent);
    if (!eligibility.eligible) {
      return {
        avatarId: avatar.id,
        avatarSlug: avatar.slug,
        avatarName: avatar.name,
        totalScore: 0,
        breakdown,
        eligible: false,
        disqualifyReason: eligibility.reason,
      };
    }

    // Domain matching
    breakdown.domainMatch = this.scoreDomainMatch(avatar, intent);

    // Question type matching
    breakdown.questionTypeMatch = this.scoreQuestionTypeMatch(avatar, intent);

    // Priority bonus
    breakdown.priorityBonus = avatar.responsePriority * SCORING_WEIGHTS.priorityMultiplier;

    // Context bonus
    if (context) {
      breakdown.contextBonus = this.scoreContext(avatar, intent, context);
    }

    const totalScore =
      breakdown.domainMatch +
      breakdown.questionTypeMatch +
      breakdown.priorityBonus +
      breakdown.contextBonus +
      breakdown.adminAdjustment;

    return {
      avatarId: avatar.id,
      avatarSlug: avatar.slug,
      avatarName: avatar.name,
      totalScore,
      breakdown,
      eligible: true,
    };
  }

  /**
   * Check if avatar is eligible for selection
   */
  private checkEligibility(
    avatar: AiAvatar,
    intent: IntentClassification
  ): { eligible: boolean; reason?: string } {
    // Check if avatar is active
    if (!avatar.isActive) {
      return { eligible: false, reason: "Avatar is inactive" };
    }

    // Check admin disabled list
    if (this.adminOverrides.disabledAvatarIds?.includes(avatar.id)) {
      return { eligible: false, reason: "Avatar disabled by admin" };
    }

    // Check domain restrictions
    const domainRestrictions = this.adminOverrides.domainRestrictions?.[intent.primaryDomain];
    if (domainRestrictions && !domainRestrictions.includes(avatar.id)) {
      return { eligible: false, reason: `Avatar not allowed for ${intent.primaryDomain} domain` };
    }

    return { eligible: true };
  }

  /**
   * Score domain expertise match
   */
  private scoreDomainMatch(avatar: AiAvatar, intent: IntentClassification): number {
    let score = 0;
    const expertise = avatar.domainExpertise || [];

    // Primary domain match
    if (expertise.includes(intent.primaryDomain)) {
      score += SCORING_WEIGHTS.primaryDomainMatch;
    }

    // Secondary domain matches
    for (const domain of intent.secondaryDomains) {
      if (expertise.includes(domain)) {
        score += SCORING_WEIGHTS.secondaryDomainMatch;
      }
    }

    // Partial matches (domain keywords appear in expertise)
    for (const exp of expertise) {
      if (intent.keywords.some(kw => exp.includes(kw) || kw.includes(exp))) {
        score += SCORING_WEIGHTS.partialDomainMatch;
      }
    }

    return score;
  }

  /**
   * Score question type match
   */
  private scoreQuestionTypeMatch(avatar: AiAvatar, intent: IntentClassification): number {
    const bonuses = SCORING_WEIGHTS.questionTypeBonus[intent.questionType] || {};
    return bonuses[avatar.slug] || 0;
  }

  /**
   * Score based on conversation context
   */
  private scoreContext(
    avatar: AiAvatar,
    intent: IntentClassification,
    context: ConversationContext
  ): number {
    let bonus = 0;

    // Penalty for avatar that just responded (encourage variety)
    if (context.recentAvatarIds.includes(avatar.id)) {
      bonus += SCORING_WEIGHTS.recentAvatarPenalty;
    }

    // Bonus for keeping same avatar on follow-up questions
    if (context.isFollowUp && context.recentAvatarIds[0] === avatar.id) {
      bonus += SCORING_WEIGHTS.followUpBonus;
    }

    return bonus;
  }

  // ---------------------------------------------------------------------------
  // ADMIN ADJUSTMENTS
  // ---------------------------------------------------------------------------

  /**
   * Apply admin priority adjustments to scores
   */
  private applyAdminAdjustments(scores: AvatarScore[], intent: IntentClassification): AvatarScore[] {
    const adjustments = this.adminOverrides.priorityAdjustments;
    if (!adjustments) return scores;

    return scores.map(score => {
      const adjustment = adjustments[score.avatarId] || 0;
      const clampedAdjustment = Math.max(
        -SCORING_WEIGHTS.maxAdminAdjustment,
        Math.min(SCORING_WEIGHTS.maxAdminAdjustment, adjustment)
      );

      return {
        ...score,
        breakdown: {
          ...score.breakdown,
          adminAdjustment: clampedAdjustment,
        },
        totalScore: score.totalScore + clampedAdjustment,
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Set admin overrides
   */
  setAdminOverrides(overrides: AdminOverrides): void {
    this.adminOverrides = overrides;
  }

  /**
   * Get current admin overrides
   */
  getAdminOverrides(): AdminOverrides {
    return { ...this.adminOverrides };
  }

  /**
   * Clear all admin overrides
   */
  clearAdminOverrides(): void {
    this.adminOverrides = {};
  }

  // ---------------------------------------------------------------------------
  // MODE DETERMINATION
  // ---------------------------------------------------------------------------

  /**
   * Determine the response mode based on scores and intent
   */
  private determineMode(
    intent: IntentClassification,
    scores: AvatarScore[],
    userSelectedMode?: ResponseMode
  ): ResponseMode {
    // User or admin forced mode takes precedence
    if (userSelectedMode) return userSelectedMode;
    if (this.adminOverrides.forceMode) return this.adminOverrides.forceMode;

    // Get eligible scores
    const eligibleScores = scores.filter(s => s.eligible);
    if (eligibleScores.length === 0) return "single";

    const topScore = eligibleScores[0].totalScore;
    const secondScore = eligibleScores[1]?.totalScore || 0;
    const thirdScore = eligibleScores[2]?.totalScore || 0;

    // Rule 1: Compare questions default to debate
    if (intent.questionType === "compare" && eligibleScores.length >= 2) {
      return "debate";
    }

    // Rule 2: Multiple domains with close scores -> multi
    if (intent.secondaryDomains.length >= 1) {
      if (topScore - secondScore <= ROUTING_THRESHOLDS.multiModeScoreGap) {
        return "multi";
      }
    }

    // Rule 3: Opinion questions with close scores -> debate
    if (intent.questionType === "opinion") {
      if (topScore - secondScore <= ROUTING_THRESHOLDS.multiModeScoreGap * 0.75) {
        return "debate";
      }
    }

    // Rule 4: Very close top 3 scores -> multi
    if (
      topScore - secondScore <= ROUTING_THRESHOLDS.multiModeScoreGap &&
      secondScore - thirdScore <= ROUTING_THRESHOLDS.multiModeScoreGap
    ) {
      return "multi";
    }

    // Rule 5: Use suggested mode if confidence is high
    if (intent.confidence >= ROUTING_THRESHOLDS.highConfidence) {
      return intent.suggestedMode;
    }

    // Default to single
    return "single";
  }

  // ---------------------------------------------------------------------------
  // AVATAR SELECTION
  // ---------------------------------------------------------------------------

  /**
   * Select avatars for the determined mode
   */
  private async selectAvatarsForMode(
    mode: ResponseMode,
    scores: AvatarScore[]
  ): Promise<AiAvatar[]> {
    const eligibleScores = scores.filter(s => s.eligible);

    if (eligibleScores.length === 0) {
      // Fallback to default avatar or first available
      const defaultId = this.adminOverrides.defaultAvatar;
      if (defaultId) {
        const defaultAvatar = await avatarRegistry.getAvatarById(defaultId);
        if (defaultAvatar) return [defaultAvatar];
      }
      const allAvatars = await avatarRegistry.getActiveAvatars();
      return allAvatars.slice(0, 1);
    }

    switch (mode) {
      case "single":
        return this.selectForSingleMode(eligibleScores);

      case "multi":
        return this.selectForMultiMode(eligibleScores);

      case "debate":
        return this.selectForDebateMode(eligibleScores);

      default:
        return this.selectForSingleMode(eligibleScores);
    }
  }

  /**
   * Select single best avatar
   */
  private async selectForSingleMode(scores: AvatarScore[]): Promise<AiAvatar[]> {
    const topScore = scores[0];
    if (topScore.totalScore < ROUTING_THRESHOLDS.singleModeMinScore) {
      // Score too low, use default if available
      const defaultId = this.adminOverrides.defaultAvatar;
      if (defaultId) {
        const defaultAvatar = await avatarRegistry.getAvatarById(defaultId);
        if (defaultAvatar) return [defaultAvatar];
      }
    }

    const avatar = await avatarRegistry.getAvatarById(topScore.avatarId);
    return avatar ? [avatar] : [];
  }

  /**
   * Select multiple avatars for multi mode
   */
  private async selectForMultiMode(scores: AvatarScore[]): Promise<AiAvatar[]> {
    const topScore = scores[0].totalScore;
    const threshold = topScore - ROUTING_THRESHOLDS.multiModeScoreGap;

    // Select avatars within the score gap
    const selectedScores = scores.filter(
      (s, i) => i < ROUTING_THRESHOLDS.multiModeMaxAvatars && s.totalScore >= threshold
    );

    // Ensure minimum avatars
    if (selectedScores.length < ROUTING_THRESHOLDS.multiModeMinAvatars) {
      const needed = ROUTING_THRESHOLDS.multiModeMinAvatars - selectedScores.length;
      for (let i = selectedScores.length; i < selectedScores.length + needed && i < scores.length; i++) {
        selectedScores.push(scores[i]);
      }
    }

    const avatarIds = selectedScores.map(s => s.avatarId);
    return avatarRegistry.getAvatarsByIds(avatarIds);
  }

  /**
   * Select two avatars for debate mode
   */
  private async selectForDebateMode(scores: AvatarScore[]): Promise<AiAvatar[]> {
    if (scores.length < 2) {
      return this.selectForSingleMode(scores);
    }

    // Select top 2 avatars, preferring different debate styles
    const avatar1Score = scores[0];
    let avatar2Score = scores[1];

    // Try to find an avatar with different debate style
    const avatar1 = await avatarRegistry.getAvatarById(avatar1Score.avatarId);
    if (avatar1) {
      for (let i = 1; i < scores.length; i++) {
        const candidate = await avatarRegistry.getAvatarById(scores[i].avatarId);
        if (candidate && candidate.debateStyle !== avatar1.debateStyle) {
          avatar2Score = scores[i];
          break;
        }
      }
    }

    const avatarIds = [avatar1Score.avatarId, avatar2Score.avatarId];
    return avatarRegistry.getAvatarsByIds(avatarIds);
  }

  // ---------------------------------------------------------------------------
  // USER SELECTION HANDLING
  // ---------------------------------------------------------------------------

  /**
   * Handle user-selected avatars (bypass auto-routing)
   */
  private async handleUserSelection(
    avatarIds: string[],
    mode: ResponseMode,
    intent: IntentClassification
  ): Promise<RoutingDecision> {
    const avatars = await avatarRegistry.getAvatarsByIds(avatarIds);

    // Adjust mode based on selection count
    let finalMode = mode;
    if (avatars.length === 1) {
      finalMode = "single";
    } else if (avatars.length === 2 && mode === "debate") {
      finalMode = "debate";
    } else if (avatars.length > 1) {
      finalMode = "multi";
    }

    return {
      mode: finalMode,
      selectedAvatars: avatars,
      scores: [], // No scoring needed for user selection
      intent,
      reasoning: `User selected ${avatars.length} avatar(s): ${avatars.map(a => a.name).join(", ")}`,
      adminOverrideApplied: false,
    };
  }

  /**
   * Handle admin-forced avatar selection
   */
  private async handleAdminForcedAvatar(intent: IntentClassification): Promise<RoutingDecision> {
    const avatarId = this.adminOverrides.forceAvatarId!;
    const avatar = await avatarRegistry.getAvatarById(avatarId);

    if (!avatar) {
      throw new Error(`Forced avatar ${avatarId} not found`);
    }

    return {
      mode: this.adminOverrides.forceMode || "single",
      selectedAvatars: [avatar],
      scores: [],
      intent,
      reasoning: `Admin forced selection: ${avatar.name}`,
      adminOverrideApplied: true,
      overrideDetails: `Forced avatar: ${avatar.name}${this.adminOverrides.forceMode ? `, forced mode: ${this.adminOverrides.forceMode}` : ""}`,
    };
  }

  // ---------------------------------------------------------------------------
  // UTILITY METHODS
  // ---------------------------------------------------------------------------

  /**
   * Build human-readable reasoning for the routing decision
   */
  private buildReasoning(
    intent: IntentClassification,
    scores: AvatarScore[],
    mode: ResponseMode,
    selectedAvatars: AiAvatar[]
  ): string {
    const parts: string[] = [];

    // Intent summary
    parts.push(`Intent: ${intent.primaryDomain} (${intent.questionType})`);
    parts.push(`Confidence: ${Math.round(intent.confidence * 100)}%`);

    // Top scores
    const topScores = scores.slice(0, 3).filter(s => s.eligible);
    if (topScores.length > 0) {
      parts.push(`Top candidates: ${topScores.map(s => `${s.avatarName}(${s.totalScore})`).join(", ")}`);
    }

    // Mode reasoning
    parts.push(`Mode: ${mode}`);

    // Selection
    parts.push(`Selected: ${selectedAvatars.map(a => a.name).join(", ")}`);

    return parts.join(". ");
  }

  /**
   * Detect if the current prompt is a follow-up question
   */
  detectFollowUp(prompt: string, previousMessages: string[]): boolean {
    const followUpIndicators = [
      /^(and |also |what about |how about |but |okay |ok |yes |no )/i,
      /^(can you |could you |would you )(also |explain |elaborate)/i,
      /^(that|this|it) (doesn't|does not|isn't|is not)/i,
      /^(more |another |different )/i,
      /\?$/,  // Questions without clear subject often are follow-ups
    ];

    // Short prompts are often follow-ups
    if (prompt.split(" ").length <= 5) {
      return true;
    }

    for (const pattern of followUpIndicators) {
      if (pattern.test(prompt)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Build conversation context from message history
   */
  buildContext(
    messages: Array<{ role: string; content: string; avatarId?: string }>,
    domains: Domain[]
  ): ConversationContext {
    const recentAvatarIds = messages
      .filter(m => m.role === "avatar" && m.avatarId)
      .slice(-3)
      .map(m => m.avatarId as string);

    const lastUserMessage = messages
      .filter(m => m.role === "user")
      .slice(-1)[0]?.content || "";

    return {
      recentDomains: domains.slice(-3),
      recentAvatarIds,
      messageCount: messages.length,
      isFollowUp: this.detectFollowUp(
        lastUserMessage,
        messages.filter(m => m.role === "user").map(m => m.content)
      ),
    };
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const orchestrationLayer = new OrchestrationLayer();

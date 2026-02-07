/**
 * Avatar Council Services - Barrel Export
 *
 * Central export point for all Avatar Council related services.
 * Import from here for clean, organized imports.
 *
 * @example
 * import {
 *   orchestrationEngine,
 *   autoRouter,
 *   debateModeEngine,
 *   avatarRegistry,
 * } from "@/services/avatar-council";
 */

// =============================================================================
// ORCHESTRATION
// =============================================================================

export {
  orchestrationEngine,
  OrchestrationEngine,
  type OrchestrationResult,
  type ProcessedIntent,
} from "../orchestrationEngine";

export {
  orchestrationLayer,
  type IntentClassification,
  type AvatarScore,
  type Domain,
  type QuestionType,
  type ConversationContext,
} from "../orchestrationLayer";

// =============================================================================
// ROUTING
// =============================================================================

export {
  autoRouter,
  AutoRouter,
  quickRoute,
  routeWithContext,
  routeForDebate,
  type AutoRoutingResult,
  type DebateRoutingResult,
  DebateStance,
} from "../autoRouter";

// =============================================================================
// DEBATE ENGINE
// =============================================================================

export {
  debateModeEngine,
  DebateModeEngine,
  TurnStrategy,
  MemoryScope,
  type DebateConfig,
  type DebateState,
  type DebateTurn,
  type DebateParticipant,
  type DebateCallbacks,
  type AdminDebateControl,
} from "../debateModeEngine";

// Legacy debate engine (for backward compatibility)
export { debateEngine, DebateEngine } from "../debateEngine";

// =============================================================================
// AVATAR MANAGEMENT
// =============================================================================

export {
  avatarRegistry,
  AvatarRegistry,
} from "../avatarRegistry";

export {
  personaRegistry,
  getSystemPrompt,
  getDebatePair,
  findPersonaForDomain,
  type PersonaDefinition,
} from "../personaRegistry";

// =============================================================================
// OBSERVABILITY
// =============================================================================

export {
  observabilityService,
  ObservabilityService,
  type LogEntry,
  type LogEventType,
  type LogSeverity,
} from "../observabilityService";

// =============================================================================
// LLM SERVICE
// =============================================================================

export { llmService, LLMService } from "../llmService";

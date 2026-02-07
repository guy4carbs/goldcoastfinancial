/**
 * Avatar Council Component Barrel Export
 *
 * All components related to the Avatar Council (AI multi-persona chat) system.
 * Import from here for cleaner imports:
 *
 * import {
 *   AvatarCard,
 *   AvatarChat,
 *   DebateView,
 *   MessageBubble,
 *   ChatInput,
 *   ModeSelector,
 * } from "@/components/agent/avatar-council";
 */

// =============================================================================
// CORE COMPONENTS
// =============================================================================

// Avatar selection and display
export { AvatarCard, AvatarGrid } from "../AvatarCard";
export type { default as AvatarCardProps } from "../AvatarCard";

// Main chat interfaces
export { AvatarChat } from "../AvatarChat";
export { EnhancedAvatarChat } from "../EnhancedAvatarChat";
export { DebateView } from "../DebateView";

// =============================================================================
// MESSAGE COMPONENTS
// =============================================================================

// Individual message display
export { MessageBubble } from "../MessageBubble";
export type { MessageBubbleProps } from "../MessageBubble";

// Debate turn display
export { DebateTurnCard } from "../DebateTurnCard";
export type { DebateTurnCardProps, DebateTurn, DebateStance } from "../DebateTurnCard";

// Debate participant card
export { DebateParticipantCard } from "../DebateParticipantCard";
export type { DebateParticipantCardProps } from "../DebateParticipantCard";

// =============================================================================
// INPUT COMPONENTS
// =============================================================================

// Message input
export { ChatInput } from "../ChatInput";
export type { ChatInputProps } from "../ChatInput";

// =============================================================================
// CONTROL COMPONENTS
// =============================================================================

// Mode selection (single/multi/debate)
export { ModeSelector } from "../ModeSelector";
export type { ModeSelectorProps, ChatMode } from "../ModeSelector";

// Avatar selection bar
export { SelectionBar } from "../SelectionBar";
export type { SelectionBarProps } from "../SelectionBar";

// Debate controls
export { DebateControls } from "../DebateControls";
export type { DebateControlsProps, DebateStatus } from "../DebateControls";

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

// WebSocket connection status
export { ConnectionBadge } from "../ConnectionBadge";
export type { ConnectionBadgeProps, ConnectionStatus } from "../ConnectionBadge";

// Voice playback (placeholder)
export { VoicePlaybackControl } from "../VoicePlaybackControl";
export type { VoicePlaybackControlProps } from "../VoicePlaybackControl";

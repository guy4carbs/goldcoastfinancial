/**
 * Admin Avatar Council Component Barrel Export
 *
 * All components for the Admin Lounge dashboard.
 * Import from here for cleaner imports:
 *
 * import {
 *   AdminHeader,
 *   NetworkGraphPanel,
 *   AvatarManagementPanel,
 *   DebateControlPanel,
 *   ObservabilityPanel,
 * } from "@/components/admin/avatar-council";
 */

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

export { AdminHeader } from "./AdminHeader";
export type {
  AdminHeaderProps,
  SystemStats,
  SystemHealth,
  ConnectionStatus,
} from "./AdminHeader";

// =============================================================================
// MAIN PANELS
// =============================================================================

// Network visualization
export { NetworkGraphPanel } from "./NetworkGraphPanel";
export type {
  NetworkGraphPanelProps,
  GraphNode,
  GraphEdge,
} from "./NetworkGraphPanel";

// Avatar management
export { AvatarManagementPanel } from "./AvatarManagementPanel";
export type {
  AvatarManagementPanelProps,
  AvatarWithStats,
  AvatarStats,
} from "./AvatarManagementPanel";

// Debate control
export { DebateControlPanel } from "./DebateControlPanel";
export type {
  DebateControlPanelProps,
  ActiveDebate,
  DebateParticipant,
  DebateStatus,
} from "./DebateControlPanel";

// Observability / Logs
export { ObservabilityPanel } from "./ObservabilityPanel";
export type {
  ObservabilityPanelProps,
  LogEntry,
  LogEntryType,
  LogSeverity,
  LogFilters,
} from "./ObservabilityPanel";

// =============================================================================
// MODALS
// =============================================================================

export { AvatarEditModal } from "./AvatarEditModal";
export type {
  AvatarEditModalProps,
  AvatarFormData,
  DebateStyle,
} from "./AvatarEditModal";

export { InjectMessageModal } from "./InjectMessageModal";
export type {
  InjectMessageModalProps,
  InjectMessageData,
  InjectionType,
} from "./InjectMessageModal";

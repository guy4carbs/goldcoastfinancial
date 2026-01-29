// Existing Components
export { CommandPalette } from './CommandPalette';
export { XPToast, LevelUpCelebration } from './XPToast';
export { NotificationDropdown, type Notification } from './NotificationDropdown';
export { LeadDetailDrawer } from './LeadDetailDrawer';
export { AddLeadModal } from './AddLeadModal';
export { AddTaskModal } from './AddTaskModal';
export { LeaderboardModal } from './LeaderboardModal';
export { ActivityFeed, ActivityTicker, type ActivityItem } from './ActivityFeed';
export { DailyChallenge, type DailyChallengeData } from './DailyChallenge';
export { TrainingModuleViewer } from './TrainingModuleViewer';
export { LogCallModal } from './LogCallModal';
export { default as ChatRoom } from './ChatRoom';
export {
  DashboardSkeleton,
  LeaderboardSkeleton,
  CRMSkeleton,
  TrainingSkeleton,
  EarningsSkeleton
} from './SkeletonLoaders';

// New Phase 3 Components
export { QuickActions } from './QuickActions';
export { PipelineKanban, type PipelineLead, type PipelineStage } from './PipelineKanban';
export { ChatInterface, type ChatMessage, type ChatContact } from './ChatInterface';

// Celebrations
export * from './celebrations';

// Modals
export * from './modals';

// Forms
export * from './forms';

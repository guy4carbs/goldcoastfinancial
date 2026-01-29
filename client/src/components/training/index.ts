/**
 * Training Components Index
 *
 * Centralized exports for all training-related UI components.
 * These components provide interactive learning experiences including
 * glossary tooltips, quick reference cards, mock call viewers,
 * carrier comparisons, achievements, and streak tracking.
 */

// Glossary Components
export {
  GlossaryTooltip,
  GlossarySearch,
  GlossaryPanel
} from "./GlossaryTooltip";

// Quick Reference Components
export {
  QuickReferenceCard,
  QuickReferenceButton,
  QuickReferenceList
} from "./QuickReferenceCard";

// Mock Call Components
export {
  MockCallViewer,
  MockCallList,
  MockCallCompact
} from "./MockCallViewer";

// Carrier Components
export {
  CarrierComparison,
  CarrierCard,
  CarrierList
} from "./CarrierComparison";

// Achievement & Gamification Components
export {
  AchievementBadge,
  AchievementList,
  AchievementUnlocked,
  LevelProgress,
  LevelBadge,
  RecentAchievements
} from "./AchievementDisplay";

// Streak Components
export {
  StreakCounter,
  StreakReminder,
  StreakStats
} from "./StreakCounter";

// Leaderboard Components
export {
  Leaderboard,
  LeaderboardMini,
  LeaderboardPosition
} from "./Leaderboard";

// Assessment Enhancement Components
export { AssessmentTimer, useAssessmentTimer } from "./AssessmentTimer";
export { AssessmentScoreReport } from "./AssessmentScoreReport";

// Certificate Components
export {
  CertificateList,
  CertificateCard,
  CertificateEarned
} from "./CertificateDisplay";

// Call Simulation Components
export { CallSimulator } from "./CallSimulator";
export type { SimulationResult } from "./CallSimulator";

// Video Components
export { VideoPlayer } from "./VideoPlayer";
export type { TrainingVideo, TranscriptSegment } from "./VideoPlayer";
export { VideoLibrary } from "./VideoLibrary";

// Product Visual Aids
export { IULVisualDiagram, IULCapFloorMini } from "./IULVisualDiagram";
export { AnnuityCreditingFlowchart, CreditingMethodBadge } from "./AnnuityCreditingFlowchart";

// Phase 3.1 & 3.3 - Dashboard Widgets & Progress Visualization
export {
  CurrentFocusCard,
  TodaysFocusCard,
  ComplianceCountdown,
  EstimatedCompletion,
  QuickStats,
  WeeklyProgressChart,
  CohortComparison,
  StreakDisplay,
  ResumeLastModuleButton
} from "./TrainingDashboardWidgets";

// Phase 3.2 - Navigation Components
export {
  TrainingSidebar,
  TrainingBreadcrumb,
  NextUpRecommendation,
  TrainingSearch,
  FilterSortControls,
  QuickJumpMenu
} from "./TrainingNavigation";

// Phase 3.3 - Celebration Components
export {
  Confetti,
  CertificationEarnedModal,
  ModuleCompletedCelebration,
  StreakMilestoneCelebration,
  AchievementUnlockedToast
} from "./TrainingCelebrations";

// Phase 3.4 - Module Viewer Enhancements
export {
  ModuleProgressBar,
  BookmarkButton,
  NoteTakingSidebar,
  MarkAsReviewedButton,
  MicroQuiz,
  ReadingProgressIndicator,
  SectionNavigation
} from "./ModuleViewerEnhancements";

// Phase 3.5 - Mobile Components
export {
  CertificationPathwayVertical,
  MobileTabNavigation,
  DEFAULT_TRAINING_TABS,
  TouchTarget,
  SwipeNavigator,
  PullToRefresh,
  OfflineIndicator,
  useOfflineStorage,
  MobileModuleCard,
  ResponsiveContainer,
  MobileHeader,
  OfflineDownloadManager,
  ModuleDownloadButton
} from "./MobileTrainingComponents";

// Phase 4 - Gamification System
export {
  calculateModuleXP,
  calculateAssessmentXP,
  calculateDailyChallengeXP,
  getStreakMultiplier,
  getStreakMultiplierInfo,
  XPEarnedPopup,
  LevelUpCelebration,
  StreakMultiplierCard,
  DailyChallengeCard,
  QuestionOfTheDay,
  QuestionOfTheDayPopup,
  useQuestionOfTheDayPopup,
  XPHistory,
  PointsBreakdown
} from "./GamificationSystem";
export type { XPEarnedEvent, DailyChallenge } from "./GamificationSystem";

// Phase 5.1 - Training Analytics
export {
  PersonalAnalytics,
  SkillRadarChart,
  WeakAreasCard,
  AssessmentTrendChart,
  LearningVelocity
} from "./TrainingAnalytics";

// Phase 5.2 - Spaced Repetition System
export {
  SmartReviewQueue,
  RetentionQuiz,
  KnowledgeDecayAlert,
  ReviewScheduleCard,
  QuickReviewButton
} from "./SpacedRepetition";
export type { ReviewItem, RetentionQuestion } from "./SpacedRepetition";

// Phase 5.4 - Social Learning
export {
  ModuleRating,
  DiscussionThread,
  PeerRecognition,
  StudyGroups,
  CompactRating
} from "./SocialLearning";

// Phase 5.5 - Training Reports
export {
  ExportTrainingRecords,
  CertificateGenerator,
  TrainingTranscript,
  QuickExportButton
} from "./TrainingReports";
export type { TrainingRecord, CertificateData } from "./TrainingReports";

// Accessibility Utilities
export {
  useAnnounce,
  useFocusTrap,
  useRovingTabIndex,
  handleKeyboardActivation,
  getButtonA11yProps,
  useProgressAnnounce,
  AccessibleIcon,
  SkipLink,
  LiveRegion
} from "./AccessibilityUtils";

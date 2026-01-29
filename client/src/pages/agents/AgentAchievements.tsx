import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Target,
  Flame,
  Users,
  DollarSign,
  Phone,
  Award,
  Lock,
  CheckCircle2,
  Heart,
  Shield,
  Sparkles,
  GraduationCap,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/agentStore";

// Import Phase 2 training components
import {
  AchievementList,
  LevelProgress,
  LevelBadge,
  CertificateList,
  // Phase 4 - Gamification
  StreakMultiplierCard,
  XPHistory,
  PointsBreakdown,
  XPEarnedPopup,
  LevelUpCelebration,
  // Phase 5 - Certificate Generator
  CertificateGenerator
} from "@/components/training";
import type { XPEarnedEvent } from "@/components/training";
import type { LucideIcon } from "lucide-react";

// Types
type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'sales' | 'onboarding' | 'consistency' | 'referral' | 'revenue' | 'calls' | 'level' | 'satisfaction' | 'training' | 'streak' | 'milestone';
type FilterKey = 'all' | 'unlocked' | 'in_progress' | 'locked';

interface DisplayAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedDate?: string;
  xpReward: number;
  rarity: AchievementRarity;
  progress?: number;
  target?: number;
  locked?: boolean;
}

interface FilterOption {
  key: FilterKey;
  label: string;
}

// Constants extracted outside component
const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const STAGGER_CHILDREN = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'locked', label: 'Locked' },
];

const RARITY_CONFIG: Record<AchievementRarity, { label: string; color: string; glow: string }> = {
  common: { label: 'Common', color: 'bg-gray-500/10 text-gray-600 border-gray-300', glow: '' },
  uncommon: { label: 'Uncommon', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300', glow: '' },
  rare: { label: 'Rare', color: 'bg-blue-500/10 text-blue-600 border-blue-300', glow: 'shadow-blue-500/20' },
  epic: { label: 'Epic', color: 'bg-purple-500/10 text-purple-600 border-purple-300', glow: 'shadow-purple-500/30' },
  legendary: { label: 'Legendary', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-300', glow: 'shadow-yellow-500/40' },
};

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; color: string }> = {
  sales: { label: 'Sales', color: 'text-emerald-600' },
  onboarding: { label: 'Onboarding', color: 'text-blue-600' },
  consistency: { label: 'Consistency', color: 'text-orange-600' },
  referral: { label: 'Referral', color: 'text-purple-600' },
  revenue: { label: 'Revenue', color: 'text-emerald-600' },
  calls: { label: 'Calls', color: 'text-cyan-600' },
  level: { label: 'Level', color: 'text-yellow-600' },
  satisfaction: { label: 'Satisfaction', color: 'text-pink-600' },
  training: { label: 'Training', color: 'text-indigo-600' },
  streak: { label: 'Streak', color: 'text-orange-600' },
  milestone: { label: 'Milestone', color: 'text-amber-600' },
};

// Icon mapping for achievements from store (store has string icon names)
const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  target: Target,
  flame: Flame,
  users: Users,
  dollar: DollarSign,
  phone: Phone,
  award: Award,
  heart: Heart,
  shield: Shield,
  sparkles: Sparkles,
  zap: Zap,
  graduationCap: GraduationCap,
};

// Demo achievements data (sales/activity based) - fallback if store empty
const DEMO_ACHIEVEMENTS: DisplayAchievement[] = [
  // Unlocked
  {
    id: '1',
    title: 'First Sale',
    description: 'Close your first insurance policy',
    category: 'sales',
    icon: Trophy,
    unlocked: true,
    unlockedDate: 'Jan 5, 2026',
    xpReward: 100,
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Quick Start',
    description: 'Complete onboarding within 24 hours',
    category: 'onboarding',
    icon: Zap,
    unlocked: true,
    unlockedDate: 'Jan 3, 2026',
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: '3',
    title: 'Hot Streak',
    description: 'Maintain a 7-day activity streak',
    category: 'consistency',
    icon: Flame,
    unlocked: true,
    unlockedDate: 'Jan 12, 2026',
    xpReward: 150,
    rarity: 'uncommon',
  },
  {
    id: '4',
    title: 'Team Player',
    description: 'Refer 3 new agents to the platform',
    category: 'referral',
    icon: Users,
    unlocked: true,
    unlockedDate: 'Jan 18, 2026',
    xpReward: 200,
    rarity: 'uncommon',
  },
  // In Progress
  {
    id: '5',
    title: 'Sales Champion',
    description: 'Close 25 policies in a single month',
    category: 'sales',
    icon: Star,
    unlocked: false,
    progress: 18,
    target: 25,
    xpReward: 500,
    rarity: 'rare',
  },
  {
    id: '6',
    title: 'Revenue King',
    description: 'Generate $50,000 in premium revenue',
    category: 'revenue',
    icon: DollarSign,
    unlocked: false,
    progress: 35800,
    target: 50000,
    xpReward: 750,
    rarity: 'epic',
  },
  {
    id: '7',
    title: 'Call Master',
    description: 'Log 500 calls with positive outcomes',
    category: 'calls',
    icon: Phone,
    unlocked: false,
    progress: 234,
    target: 500,
    xpReward: 400,
    rarity: 'rare',
  },
  // Locked
  {
    id: '8',
    title: 'Diamond Agent',
    description: 'Reach Diamond level status',
    category: 'level',
    icon: Award,
    unlocked: false,
    locked: true,
    xpReward: 1000,
    rarity: 'legendary',
  },
  {
    id: '9',
    title: 'Client Champion',
    description: 'Receive 50 five-star client reviews',
    category: 'satisfaction',
    icon: Heart,
    unlocked: false,
    locked: true,
    xpReward: 600,
    rarity: 'epic',
  },
  {
    id: '10',
    title: 'Iron Will',
    description: 'Maintain a 30-day activity streak',
    category: 'consistency',
    icon: Shield,
    unlocked: false,
    progress: 7,
    target: 30,
    xpReward: 300,
    rarity: 'rare',
  },
];

// XP History sample data - extracted as constant
const SAMPLE_XP_HISTORY: XPEarnedEvent[] = [
  { type: 'module_complete', baseXP: 60, multiplier: 1.5, totalXP: 90, description: 'Completed: Institutional Doctrine', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { type: 'assessment_pass', baseXP: 100, multiplier: 1.5, totalXP: 150, description: 'Passed: Doctrine Assessment (92%)', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { type: 'daily_challenge', baseXP: 50, multiplier: 1.5, totalXP: 75, description: 'Daily Challenge: Module Marathon', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { type: 'module_complete', baseXP: 40, multiplier: 1.0, totalXP: 40, description: 'Completed: Welcome & Onboarding', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  { type: 'milestone', baseXP: 100, multiplier: 1.0, totalXP: 100, description: 'Achievement: First Module', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  { type: 'daily_challenge', baseXP: 25, multiplier: 1.0, totalXP: 25, description: 'Question of the Day - Correct!', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000) }
];

// Points breakdown - extracted as constant
const SAMPLE_POINTS_BREAKDOWN = {
  modules: 340,
  assessments: 280,
  achievements: 200,
  dailyChallenges: 130,
  streakBonus: 50
};

// Earned training milestones - extracted as constant
const SAMPLE_EARNED_MILESTONES = [
  { id: 'milestone-first-module', earnedAt: '2026-01-03T10:00:00Z' },
  { id: 'milestone-doctrine-complete', earnedAt: '2026-01-10T14:30:00Z' }
];

export default function AgentAchievements() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [activeTab, setActiveTab] = useState('achievements');
  const [xpEarnedEvent, setXpEarnedEvent] = useState<XPEarnedEvent | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Get data from store
  const { achievements: storeAchievements, performance, currentUser } = useAgentStore();

  // Map store achievements to display format, fallback to demo if empty
  const displayAchievements = useMemo<DisplayAchievement[]>(() => {
    if (!storeAchievements || storeAchievements.length === 0) {
      return DEMO_ACHIEVEMENTS;
    }
    return storeAchievements.map((a) => ({
      id: a.id,
      title: a.name,
      description: a.description,
      category: (a.category || 'sales') as AchievementCategory,
      icon: ICON_MAP[a.icon] || Trophy,
      unlocked: a.unlocked,
      unlockedDate: a.unlockedDate,
      xpReward: a.xpReward,
      rarity: 'common' as AchievementRarity, // Store doesn't have rarity, default to common
    }));
  }, [storeAchievements]);

  // Memoize achievement counts
  const { unlockedCount, inProgressCount, lockedCount } = useMemo(() => ({
    unlockedCount: displayAchievements.filter(a => a.unlocked).length,
    inProgressCount: displayAchievements.filter(a => !a.unlocked && !a.locked && a.progress !== undefined).length,
    lockedCount: displayAchievements.filter(a => a.locked).length,
  }), [displayAchievements]);

  // Memoize filtered achievements
  const filteredAchievements = useMemo(() => {
    return displayAchievements.filter(a => {
      if (filter === 'all') return true;
      if (filter === 'unlocked') return a.unlocked;
      if (filter === 'in_progress') return !a.unlocked && !a.locked && a.progress !== undefined;
      if (filter === 'locked') return a.locked;
      return true;
    });
  }, [displayAchievements, filter]);

  // Get XP from store with fallback
  const totalXP = performance?.xp ?? 0;
  const currentStreak = performance?.currentStreak ?? 0;

  return (
    <AgentLoungeLayout>
      {/* Phase 4: XP Earned Popup */}
      {xpEarnedEvent && (
        <XPEarnedPopup
          event={xpEarnedEvent}
          onDismiss={() => setXpEarnedEvent(null)}
        />
      )}

      {/* Phase 4: Level Up Celebration */}
      <LevelUpCelebration
        show={showLevelUp}
        levelName="Advisor"
        levelColor="blue"
        onDismiss={() => setShowLevelUp(false)}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={STAGGER_CHILDREN}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={FADE_IN_UP} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Achievements & Progress</h1>
            <p className="text-sm text-gray-600">Track your milestones, training progress, and rewards</p>
          </div>
        </motion.div>

        {/* Level & Streak Overview */}
        <motion.div variants={FADE_IN_UP} className="grid md:grid-cols-3 gap-4">
          {/* Level Progress */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" aria-hidden="true" />
                Your Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LevelProgress currentPoints={totalXP} />
              <div className="flex items-center justify-center mt-4">
                <LevelBadge points={totalXP} showPoints />
              </div>
            </CardContent>
          </Card>

          {/* Streak with Multiplier */}
          <StreakMultiplierCard
            currentStreak={currentStreak}
            showProgress={true}
          />

          {/* Stats Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-xl font-bold text-emerald-600">{unlockedCount}</p>
                  <p className="text-[10px] text-emerald-600">Unlocked</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-[10px] text-blue-600">In Progress</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-600">{lockedCount}</p>
                  <p className="text-[10px] text-gray-600">Locked</p>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded-lg">
                  <p className="text-xl font-bold text-primary">{totalXP.toLocaleString()}</p>
                  <p className="text-[10px] text-primary">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={FADE_IN_UP}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy className="w-4 h-4" aria-hidden="true" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="training" className="gap-2">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                Training Milestones
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <Award className="w-4 h-4" aria-hidden="true" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="xp-details" className="gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                XP Details
              </TabsTrigger>
            </TabsList>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-2" role="group" aria-label="Filter achievements">
                {FILTER_OPTIONS.map((option) => (
                  <Button
                    key={option.key}
                    variant={filter === option.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(option.key)}
                    className={filter === option.key ? 'bg-primary' : ''}
                    aria-pressed={filter === option.key}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Empty State */}
              {filteredAchievements.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-gray-500 font-medium">No achievements found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {filter === 'unlocked' && "You haven't unlocked any achievements yet. Keep going!"}
                      {filter === 'in_progress' && "No achievements are currently in progress."}
                      {filter === 'locked' && "All achievements are available to earn!"}
                    </p>
                    {filter !== 'all' && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="mt-2 text-primary"
                      >
                        View all achievements
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Achievements Grid */}
              {filteredAchievements.length > 0 && (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0" aria-label="Achievements list">
                  {filteredAchievements.map((achievement) => {
                    const rarity = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common;
                    const category = CATEGORY_CONFIG[achievement.category] || CATEGORY_CONFIG.sales;
                    const Icon = achievement.icon;
                    const isInProgress = !achievement.unlocked && !achievement.locked && achievement.progress !== undefined;
                    const progressPercent = isInProgress ? Math.round((achievement.progress! / achievement.target!) * 100) : 0;

                    return (
                      <li key={achievement.id}>
                        <Card
                          className={cn(
                            "border-gray-100 transition-all h-full",
                            achievement.unlocked && `shadow-lg ${rarity.glow}`,
                            achievement.locked && "opacity-60"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                achievement.unlocked ? "bg-gradient-to-br from-primary to-violet-500 text-white" :
                                achievement.locked ? "bg-gray-100 text-gray-400" : "bg-primary/10 text-primary"
                              )}>
                                {achievement.locked ? (
                                  <Lock className="w-6 h-6" aria-hidden="true" />
                                ) : (
                                  <Icon className="w-6 h-6" aria-hidden="true" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-primary truncate">{achievement.title}</h3>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>

                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={cn("text-[10px]", rarity.color)}>{rarity.label}</Badge>
                                  <Badge variant="outline" className={cn("text-[10px]", category.color)}>{category.label}</Badge>
                                </div>

                                {isInProgress && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">Progress</span>
                                      <span className="text-primary font-medium">
                                        {typeof achievement.progress === 'number' && achievement.progress > 1000
                                          ? `$${achievement.progress.toLocaleString()}`
                                          : achievement.progress} / {typeof achievement.target === 'number' && achievement.target > 1000
                                          ? `$${achievement.target.toLocaleString()}`
                                          : achievement.target}
                                      </span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                  </div>
                                )}

                                {achievement.unlocked && achievement.unlockedDate && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                    Unlocked <time dateTime={achievement.unlockedDate}>{achievement.unlockedDate}</time>
                                  </div>
                                )}

                                <div className="flex items-center gap-1 mt-2 text-xs">
                                  <Sparkles className="w-3 h-3 text-primary" aria-hidden="true" />
                                  <span className="text-primary font-medium">+{achievement.xpReward} XP</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>

            {/* Training Milestones Tab */}
            <TabsContent value="training" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
                    Training Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AchievementList earnedMilestones={SAMPLE_EARNED_MILESTONES} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" aria-hidden="true" />
                    Earned Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CertificateList />
                </CardContent>
              </Card>

              {/* Certificate Generator - Preview your latest certificate */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                    Generate Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CertificateGenerator
                    certificate={{
                      id: 'cert-1',
                      name: 'Pre-Access Certification',
                      recipientName: currentUser?.name || 'Agent',
                      certificationName: 'Pre-Access Certification',
                      certificationLevel: 'Pre-Access',
                      earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      modules: ['Welcome & Onboarding', 'Institutional Doctrine', 'Compliance Fundamentals', 'Disclosures & Ethics', 'Professional Standards'],
                      issuerName: 'Gold Coast Financial Training',
                      certificateNumber: 'GCF-2026-PA-001'
                    }}
                    onPrint={() => {
                      // TODO: Implement proper print functionality with PDF generation
                      toast.info('Printing Certificate...', {
                        description: 'Opening print dialog'
                      });
                      setTimeout(() => window.print(), 500);
                    }}
                    onDownload={() => {
                      // TODO: Implement PDF generation and download
                      toast.success('Certificate Downloaded!', {
                        description: 'Pre-Access Certification saved to your downloads'
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* XP Details Tab */}
            <TabsContent value="xp-details" className="space-y-6">
              {/* Points Breakdown */}
              <PointsBreakdown
                breakdown={SAMPLE_POINTS_BREAKDOWN}
                totalXP={totalXP}
              />

              {/* XP History */}
              <XPHistory
                events={SAMPLE_XP_HISTORY}
                showLoadMore={true}
                onLoadMore={() => {
                  // TODO: Implement pagination to load more XP history from API
                }}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}

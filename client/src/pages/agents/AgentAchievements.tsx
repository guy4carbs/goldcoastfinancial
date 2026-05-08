import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Flame,
  Users,
  DollarSign,
  Phone,
  Award,
  Lock,
  CheckCircle2,
  Heart,
  Shield,
  Zap,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AgentPageHero } from "@/components/agent/primitives";
import { AchievementUnlock } from "@/components/agent/celebrations/AchievementUnlock";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";

type AchievementCategory = 'sales' | 'onboarding' | 'consistency' | 'referral' | 'revenue' | 'calls' | 'level' | 'satisfaction' | 'activity' | 'training';
type FilterKey = 'all' | 'unlocked' | 'in_progress' | 'locked';

interface DisplayAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
  locked?: boolean;
}

// Using Heritage Design System animations: fadeInUp, staggerContainer, scaleIn

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'locked', label: 'Locked' },
];

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  users: Users,
  dollar: DollarSign,
  phone: Phone,
  award: Award,
  heart: Heart,
  shield: Shield,
  zap: Zap,
};

// Map tier to rarity for the celebration modal
const TIER_TO_RARITY: Record<string, 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'> = {
  bronze: 'common',
  silver: 'uncommon',
  gold: 'rare',
  platinum: 'epic',
};

interface ApiAchievement {
  id: string;
  name: string;
  description: string;
  tier: string;
  icon: string;
  category: string;
  points: number;
  requirement: number;
  progress: number;
  type: string;
  status: 'unlocked' | 'in_progress' | 'locked';
  earnedAt: string | null;
  progressPercent: number;
}

interface AchievementsResponse {
  achievements: ApiAchievement[];
  stats: {
    totalUnlocked: number;
    totalInProgress: number;
    totalLocked: number;
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
  };
  newlyUnlocked: ApiAchievement[];
}

export default function AgentAchievements() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const queryClient = useQueryClient();

  const { data: achievementsData, isLoading, error } = useQuery<AchievementsResponse>({
    queryKey: ['/api/achievements'],
    refetchInterval: 60000, // Check for new unlocks every minute
  });

  const achievements = achievementsData?.achievements || [];
  const stats = achievementsData?.stats || { totalUnlocked: 0, totalInProgress: 0, totalLocked: 0, totalPoints: 0, currentStreak: 0, longestStreak: 0 };
  const newlyUnlocked = achievementsData?.newlyUnlocked || [];

  // Show celebration for the first newly unlocked achievement (only once per page load)
  const celebrationTarget = !celebrationDismissed && newlyUnlocked.length > 0 ? newlyUnlocked[0] : null;

  const displayAchievements = useMemo<DisplayAchievement[]>(() => {
    if (!achievements || achievements.length === 0) return [];
    return achievements.map((a) => ({
      id: a.id,
      title: a.name,
      description: a.description,
      category: (a.category || 'sales') as AchievementCategory,
      icon: ICON_MAP[a.icon] || Trophy,
      unlocked: a.status === 'unlocked',
      unlockedDate: a.earnedAt ? new Date(a.earnedAt).toLocaleDateString() : undefined,
      progress: a.progress,
      target: a.requirement,
      locked: a.status === 'locked',
    }));
  }, [achievements]);

  const { unlockedCount, inProgressCount, lockedCount } = useMemo(() => ({
    unlockedCount: displayAchievements.filter(a => a.unlocked).length,
    inProgressCount: displayAchievements.filter(a => !a.unlocked && !a.locked && a.progress !== undefined && a.progress > 0).length,
    lockedCount: displayAchievements.filter(a => a.locked).length,
  }), [displayAchievements]);

  const filteredAchievements = useMemo(() => {
    return displayAchievements.filter(a => {
      if (filter === 'all') return true;
      if (filter === 'unlocked') return a.unlocked;
      if (filter === 'in_progress') return !a.unlocked && !a.locked && a.progress !== undefined && a.progress > 0;
      if (filter === 'locked') return a.locked;
      return true;
    });
  }, [displayAchievements, filter]);

  if (isLoading) {
    return (
      <AgentLoungeLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </AgentLoungeLayout>
    );
  }

  if (error) {
    return (
      <AgentLoungeLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <p className="text-gray-600">Failed to load achievements.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/achievements'] })}>Retry</Button>
        </div>
      </AgentLoungeLayout>
    );
  }

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card with Violet Gradient */}
        <motion.div data-tour-id={TOUR.AGENT.ACHIEVEMENTS.HEADER} variants={fadeInUp}>
          <AgentPageHero
            icon={Trophy}
            title="Achievements"
            subtitle="Track your milestones and rewards"
          >
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{unlockedCount}</p>
                <p className="text-white/70 text-xs">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{inProgressCount}</p>
                <p className="text-white/70 text-xs">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white/60">{lockedCount}</p>
                <p className="text-white/70 text-xs">Locked</p>
              </div>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Filters */}
        <motion.div
          data-tour-id={TOUR.AGENT.ACHIEVEMENTS.FILTER_TABS}
          variants={fadeInUp}
          className="flex gap-1 p-1 w-fit"
          style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
        >
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-all",
                filter === option.key
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              style={{ borderRadius: RADIUS.button }}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="border-dashed" style={{ borderRadius: RADIUS.card }}>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No achievements found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === 'unlocked' && "You haven't unlocked any achievements yet. Keep going!"}
                  {filter === 'in_progress' && "No achievements are currently in progress."}
                  {filter === 'locked' && "All achievements are available to earn!"}
                </p>
                {filter !== 'all' && (
                  <Button variant="link" size="sm" onClick={() => setFilter('all')} className="mt-2">
                    View all achievements
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Achievements Grid */}
        {filteredAchievements.length > 0 && (
          <motion.div data-tour-id={TOUR.AGENT.ACHIEVEMENTS.GRID} variants={fadeInUp}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement, index) => {
                const Icon = achievement.icon;
                const isInProgress = !achievement.unlocked && !achievement.locked && achievement.progress !== undefined;
                const progressPercent = isInProgress ? Math.round((achievement.progress! / achievement.target!) * 100) : 0;

                return (
                  <motion.li
                    key={achievement.id}
                    variants={scaleIn}
                    custom={index}
                  >
                    <motion.div
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      transition={{ duration: MOTION.duration.hover }}
                    >
                      <Card
                        className={cn(
                          "border-0 h-full overflow-hidden relative",
                          achievement.locked
                            ? "opacity-50"
                            : "bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                        )}
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        {/* Decorative blobs */}
                        {!achievement.locked && (
                          <>
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-amber-400/15 rounded-full blur-lg" />
                          </>
                        )}
                        <CardContent className="p-4 relative z-10">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-12 h-12 flex items-center justify-center flex-shrink-0",
                                achievement.locked
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-white/20 backdrop-blur"
                              )}
                              style={{ borderRadius: RADIUS.button }}
                            >
                              {achievement.locked ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5 text-amber-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={cn("font-semibold truncate", achievement.locked ? "text-gray-900" : "text-white")} style={{ fontSize: TYPE.meta }}>{achievement.title}</h3>
                              <p className={cn("line-clamp-2 mt-1", achievement.locked ? "text-gray-500" : "text-white/70")} style={{ fontSize: TYPE.caption }}>{achievement.description}</p>

                              {isInProgress && (
                                <div className="mt-3">
                                  <div className="h-2 rounded-full overflow-hidden bg-white/20">
                                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: `${progressPercent}%` }} />
                                  </div>
                                  <p className="text-white/60 mt-1" style={{ fontSize: TYPE.micro }}>{progressPercent}% complete</p>
                                </div>
                              )}

                              {achievement.unlocked && (
                                <p className="text-emerald-300 mt-2 flex items-center gap-1" style={{ fontSize: TYPE.micro }}>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Unlocked {achievement.unlockedDate && `on ${achievement.unlockedDate}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </motion.div>

      {/* Achievement Unlock Celebration Modal */}
      {celebrationTarget && (
        <AchievementUnlock
          isVisible={true}
          achievement={{
            title: celebrationTarget.name,
            description: celebrationTarget.description,
            icon: ICON_MAP[celebrationTarget.icon] || Trophy,
            xpReward: celebrationTarget.points,
            rarity: TIER_TO_RARITY[celebrationTarget.tier] || 'common',
          }}
          onClose={() => setCelebrationDismissed(true)}
        />
      )}
    </AgentLoungeLayout>
  );
}

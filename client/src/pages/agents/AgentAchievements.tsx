import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";
import type { LucideIcon } from "lucide-react";
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

type AchievementCategory = 'sales' | 'onboarding' | 'consistency' | 'referral' | 'revenue' | 'calls' | 'level' | 'satisfaction';
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

const DEMO_ACHIEVEMENTS: DisplayAchievement[] = [];

export default function AgentAchievements() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const { achievements: storeAchievements } = useAgentStore();

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
    }));
  }, [storeAchievements]);

  const { unlockedCount, inProgressCount, lockedCount } = useMemo(() => ({
    unlockedCount: displayAchievements.filter(a => a.unlocked).length,
    inProgressCount: displayAchievements.filter(a => !a.unlocked && !a.locked && a.progress !== undefined).length,
    lockedCount: displayAchievements.filter(a => a.locked).length,
  }), [displayAchievements]);

  const filteredAchievements = useMemo(() => {
    return displayAchievements.filter(a => {
      if (filter === 'all') return true;
      if (filter === 'unlocked') return a.unlocked;
      if (filter === 'in_progress') return !a.unlocked && !a.locked && a.progress !== undefined;
      if (filter === 'locked') return a.locked;
      return true;
    });
  }, [displayAchievements, filter]);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card with Violet Gradient */}
        <motion.div variants={fadeInUp}>
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
          <motion.div variants={fadeInUp}>
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
    </AgentLoungeLayout>
  );
}

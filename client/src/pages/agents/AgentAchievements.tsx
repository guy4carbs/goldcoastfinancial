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

const DEMO_ACHIEVEMENTS: DisplayAchievement[] = [
  { id: '1', title: 'First Sale', description: 'Close your first insurance policy', category: 'sales', icon: Trophy, unlocked: true, unlockedDate: 'Jan 5, 2026' },
  { id: '2', title: 'Quick Start', description: 'Complete onboarding within 24 hours', category: 'onboarding', icon: Zap, unlocked: true, unlockedDate: 'Jan 3, 2026' },
  { id: '3', title: 'Hot Streak', description: 'Maintain a 7-day activity streak', category: 'consistency', icon: Flame, unlocked: true, unlockedDate: 'Jan 12, 2026' },
  { id: '4', title: 'Team Player', description: 'Refer 3 new agents to the platform', category: 'referral', icon: Users, unlocked: true, unlockedDate: 'Jan 18, 2026' },
  { id: '5', title: 'Sales Champion', description: 'Close 25 policies in a single month', category: 'sales', icon: Star, unlocked: false, progress: 18, target: 25 },
  { id: '6', title: 'Revenue King', description: 'Generate $50,000 in premium revenue', category: 'revenue', icon: DollarSign, unlocked: false, progress: 35800, target: 50000 },
  { id: '7', title: 'Call Master', description: 'Log 500 calls with positive outcomes', category: 'calls', icon: Phone, unlocked: false, progress: 234, target: 500 },
  { id: '8', title: 'Diamond Agent', description: 'Reach Diamond level status', category: 'level', icon: Award, unlocked: false, locked: true },
  { id: '9', title: 'Client Champion', description: 'Receive 50 five-star client reviews', category: 'satisfaction', icon: Heart, unlocked: false, locked: true },
  { id: '10', title: 'Iron Will', description: 'Maintain a 30-day activity streak', category: 'consistency', icon: Shield, unlocked: false, progress: 7, target: 30 },
];

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
          <motion.div
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-6"
            style={{
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
            }}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            transition={{ duration: MOTION.duration.hover }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center"
                style={{ borderRadius: RADIUS.card }}
              >
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ fontSize: TYPE.section }}>Achievements</h1>
                <p className="text-white/80 mt-1" style={{ fontSize: TYPE.meta }}>Track your milestones and rewards</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{unlockedCount}</p>
                <p className="text-white/70 text-sm">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{inProgressCount}</p>
                <p className="text-white/70 text-sm">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white/60">{lockedCount}</p>
                <p className="text-white/70 text-sm">Locked</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp} className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.key}
              variant={filter === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.key)}
              className={filter === option.key ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-md' : ''}
              style={{ borderRadius: RADIUS.button }}
            >
              {option.label}
            </Button>
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
                          "border-0 h-full",
                          achievement.locked && "opacity-50"
                        )}
                        style={{
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.card,
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-12 h-12 flex items-center justify-center flex-shrink-0",
                                achievement.unlocked ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white" :
                                achievement.locked ? "bg-gray-100 text-gray-400" : "bg-violet-100 text-violet-600"
                              )}
                              style={{ borderRadius: RADIUS.button }}
                            >
                              {achievement.locked ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{achievement.title}</h3>
                              <p className="text-gray-500 line-clamp-2 mt-1" style={{ fontSize: TYPE.caption }}>{achievement.description}</p>

                              {isInProgress && (
                                <div className="mt-3">
                                  <Progress value={progressPercent} className="h-2" />
                                  <p className="text-gray-400 mt-1" style={{ fontSize: TYPE.micro }}>{progressPercent}% complete</p>
                                </div>
                              )}

                              {achievement.unlocked && (
                                <p className="text-emerald-600 mt-2 flex items-center gap-1" style={{ fontSize: TYPE.micro }}>
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

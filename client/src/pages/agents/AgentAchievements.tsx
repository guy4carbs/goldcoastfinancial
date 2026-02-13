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

const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const STAGGER_CHILDREN = {
  visible: { transition: { staggerChildren: 0.1 } }
};

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
        variants={STAGGER_CHILDREN}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={FADE_IN_UP}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Achievements</h1>
              <p className="text-sm text-gray-500">Track your milestones and rewards</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{unlockedCount}</p>
                  <p className="text-xs text-gray-500">Unlocked</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">{lockedCount}</p>
                  <p className="text-xs text-gray-500">Locked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={FADE_IN_UP} className="flex gap-2">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.key}
              variant={filter === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.key)}
              className={filter === option.key ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-md' : ''}
            >
              {option.label}
            </Button>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <motion.div variants={FADE_IN_UP}>
            <Card className="border-dashed">
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
          <motion.div variants={FADE_IN_UP}>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAchievements.map((achievement) => {
                const Icon = achievement.icon;
                const isInProgress = !achievement.unlocked && !achievement.locked && achievement.progress !== undefined;
                const progressPercent = isInProgress ? Math.round((achievement.progress! / achievement.target!) * 100) : 0;

                return (
                  <li key={achievement.id}>
                    <Card className={cn(
                      "border-0 shadow-md hover:shadow-lg transition-all h-full",
                      achievement.locked && "opacity-50"
                    )}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            achievement.unlocked ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white" :
                            achievement.locked ? "bg-gray-100 text-gray-400" : "bg-violet-100 text-violet-600"
                          )}>
                            {achievement.locked ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 truncate">{achievement.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{achievement.description}</p>

                            {isInProgress && (
                              <div className="mt-2">
                                <Progress value={progressPercent} className="h-1.5" />
                                <p className="text-[10px] text-gray-400 mt-0.5">{progressPercent}% complete</p>
                              </div>
                            )}

                            {achievement.unlocked && (
                              <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Unlocked {achievement.unlockedDate && `on ${achievement.unlockedDate}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </AgentLoungeLayout>
  );
}

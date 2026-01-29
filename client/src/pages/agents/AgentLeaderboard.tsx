import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Medal,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Flame,
  GraduationCap,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";

// Import Phase 2 training leaderboard
import {
  Leaderboard,
  // Phase 4 - Gamification
  StreakMultiplierCard,
  LevelBadge,
} from "@/components/training";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Leaderboard entry shape for the sales view
// Extends store data with sales-specific fields for demo
interface SalesLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string | null;
  level: string;
  xp: number;
  sales: number;
  revenue: number;
  streak: number;
  trend: 'up' | 'down' | 'same';
  change: number;
  isCurrentUser: boolean;
}

// Demo leaderboard data for sales/revenue
const DEMO_LEADERBOARD: SalesLeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Marcus Johnson',
    avatar: null,
    level: 'Diamond',
    xp: 15420,
    sales: 47,
    revenue: 89500,
    streak: 28,
    trend: 'up',
    change: 2,
    isCurrentUser: false,
  },
  {
    rank: 2,
    name: 'Sarah Williams',
    avatar: null,
    level: 'Diamond',
    xp: 14890,
    sales: 43,
    revenue: 82300,
    streak: 21,
    trend: 'same',
    change: 0,
    isCurrentUser: false,
  },
  {
    rank: 3,
    name: 'David Chen',
    avatar: null,
    level: 'Platinum',
    xp: 13200,
    sales: 38,
    revenue: 71200,
    streak: 14,
    trend: 'up',
    change: 1,
    isCurrentUser: false,
  },
  {
    rank: 4,
    name: 'Emily Rodriguez',
    avatar: null,
    level: 'Platinum',
    xp: 12150,
    sales: 35,
    revenue: 65800,
    streak: 12,
    trend: 'down',
    change: -2,
    isCurrentUser: false,
  },
  {
    rank: 5,
    name: 'You',
    avatar: null,
    level: 'Gold',
    xp: 11500,
    sales: 32,
    revenue: 58900,
    streak: 7,
    trend: 'up',
    change: 3,
    isCurrentUser: true,
  },
  {
    rank: 6,
    name: 'Michael Thompson',
    avatar: null,
    level: 'Gold',
    xp: 10800,
    sales: 29,
    revenue: 52400,
    streak: 5,
    trend: 'down',
    change: -1,
    isCurrentUser: false,
  },
  {
    rank: 7,
    name: 'Lisa Anderson',
    avatar: null,
    level: 'Gold',
    xp: 9950,
    sales: 26,
    revenue: 48200,
    streak: 3,
    trend: 'up',
    change: 2,
    isCurrentUser: false,
  },
  {
    rank: 8,
    name: 'James Wilson',
    avatar: null,
    level: 'Silver',
    xp: 8700,
    sales: 23,
    revenue: 41500,
    streak: 0,
    trend: 'same',
    change: 0,
    isCurrentUser: false,
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Diamond: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  Platinum: 'bg-gradient-to-r from-slate-400 to-slate-600',
  Gold: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  Silver: 'bg-gradient-to-r from-gray-300 to-gray-400',
  Bronze: 'bg-gradient-to-r from-orange-400 to-orange-600',
};

const TIME_RANGES = ['This Week', 'This Month', 'All Time'] as const;

type SortKey = 'xp' | 'sales' | 'revenue';

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof Star }[] = [
  { key: 'xp', label: 'XP', icon: Star },
  { key: 'sales', label: 'Sales', icon: Target },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
];

// Podium styling constants
const PODIUM_ICONS = [Crown, Medal, Medal] as const;
const PODIUM_ICON_COLORS = ['text-yellow-500', 'text-gray-400', 'text-orange-400'] as const;
const PODIUM_BG_COLORS = ['bg-yellow-500/10', 'bg-gray-500/10', 'bg-orange-500/10'] as const;
const PODIUM_LABELS = ['1st place', '2nd place', '3rd place'] as const;

// XP level thresholds for computing "next level" info
const XP_LEVELS = [
  { threshold: 0, name: 'Newcomer' },
  { threshold: 500, name: 'Apprentice' },
  { threshold: 1500, name: 'Advisor' },
  { threshold: 3000, name: 'Senior Advisor' },
  { threshold: 5000, name: 'Expert' },
  { threshold: 10000, name: 'Master' },
  { threshold: 15000, name: 'Diamond' },
];

function getXpToNextLevel(currentXp: number): number {
  const nextLevel = XP_LEVELS.find(l => l.threshold > currentXp);
  return nextLevel ? nextLevel.threshold - currentXp : 0;
}

function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map(n => n[0]).join('');
}

export default function AgentLeaderboard() {
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>('This Month');
  const [sortBy, setSortBy] = useState<SortKey>('xp');
  const [activeView, setActiveView] = useState<'sales' | 'training'>('sales');

  const { performance } = useAgentStore();

  const sortedLeaderboard = useMemo(() =>
    [...DEMO_LEADERBOARD]
      .sort((a, b) => b[sortBy] - a[sortBy])
      .map((entry, index) => ({ ...entry, rank: index + 1 })),
    [sortBy]
  );

  const currentUser = sortedLeaderboard.find(e => e.isCurrentUser);
  const xpToNext = getXpToNextLevel(performance.xp);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
            <p className="text-sm text-gray-500">See how you stack up against other agents</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Leaderboard view">
            <Button
              variant={activeView === 'sales' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('sales')}
              className={activeView === 'sales' ? 'bg-primary' : ''}
              aria-pressed={activeView === 'sales'}
            >
              <DollarSign className="w-4 h-4 mr-1" aria-hidden="true" />
              Sales
            </Button>
            <Button
              variant={activeView === 'training' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('training')}
              className={activeView === 'training' ? 'bg-primary' : ''}
              aria-pressed={activeView === 'training'}
            >
              <GraduationCap className="w-4 h-4 mr-1" aria-hidden="true" />
              Training
            </Button>
          </div>
        </motion.div>

        {/* Training Leaderboard (Phase 2 Component) */}
        {activeView === 'training' && (
          <>
            {/* Your XP Status Card */}
            <motion.div variants={fadeInUp}>
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <LevelBadge points={performance.xp} showPoints />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Your Training Progress</p>
                        <p className="text-2xl font-bold text-primary">{performance.xp.toLocaleString()} XP</p>
                        {xpToNext > 0 && (
                          <p className="text-xs text-gray-500">{xpToNext.toLocaleString()} XP to next level</p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <StreakMultiplierCard currentStreak={performance.currentStreak} showProgress={false} compact />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
                    Training XP Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Leaderboard />
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Sales Leaderboard */}
        {activeView === 'sales' && (
          <>
            {/* Time Range Filter */}
            <motion.div variants={fadeInUp} className="flex gap-2" role="group" aria-label="Time range filter">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={timeRange === range ? 'bg-primary' : ''}
                  aria-pressed={timeRange === range}
                >
                  {range}
                </Button>
              ))}
            </motion.div>

            {/* Your Position Card */}
            {currentUser ? (
              <motion.div variants={fadeInUp}>
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xl">
                        #{currentUser.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Your Current Position</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold text-primary">Rank #{currentUser.rank}</p>
                          {currentUser.trend === 'up' && (
                            <Badge className="bg-emerald-500/10 text-emerald-600" aria-label={`Up ${currentUser.change} positions`}>
                              <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                              +{currentUser.change}
                            </Badge>
                          )}
                          {currentUser.trend === 'down' && (
                            <Badge className="bg-red-500/10 text-red-600" aria-label={`Down ${Math.abs(currentUser.change)} positions`}>
                              <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />
                              {currentUser.change}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{currentUser.xp.toLocaleString()} XP</p>
                        <p className="text-xs text-gray-500">{currentUser.sales} sales | ${currentUser.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp}>
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-gray-500">You are not yet ranked on the leaderboard. Start making sales to appear here!</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sort Options */}
            <motion.div variants={fadeInUp} className="flex gap-2" role="group" aria-label="Sort leaderboard by">
              <span className="text-sm text-gray-500 self-center" aria-hidden="true">Sort by:</span>
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  variant={sortBy === option.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(option.key)}
                  className={sortBy === option.key ? 'bg-primary' : ''}
                  aria-pressed={sortBy === option.key}
                >
                  <option.icon className="w-3 h-3 mr-1" aria-hidden="true" />
                  {option.label}
                </Button>
              ))}
            </motion.div>

            {sortedLeaderboard.length === 0 ? (
              /* Empty state */
              <motion.div variants={fadeInUp}>
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                    <h3 className="font-medium text-gray-600">No Rankings Yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Leaderboard data will appear once agents start recording activity.</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                {/* Top 3 Podium */}
                <motion.div variants={fadeInUp}>
                  <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 list-none p-0 m-0" aria-label="Top 3 agents">
                    {sortedLeaderboard.slice(0, 3).map((entry, index) => {
                      const Icon = PODIUM_ICONS[index];
                      return (
                        <li key={entry.name}>
                          <Card
                            className={cn(
                              "border-gray-100 h-full",
                              index === 0 && "ring-2 ring-yellow-400/50",
                              entry.isCurrentUser && "bg-primary/5"
                            )}
                          >
                            <CardContent className="p-4 text-center">
                              <div
                                className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", PODIUM_BG_COLORS[index])}
                                aria-label={PODIUM_LABELS[index]}
                              >
                                <Icon className={cn("w-6 h-6", PODIUM_ICON_COLORS[index])} aria-hidden="true" />
                              </div>
                              <div className={cn("w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold", LEVEL_COLORS[entry.level] || LEVEL_COLORS.Silver)}>
                                {getInitials(entry.name)}
                              </div>
                              <p className="font-semibold text-primary">{entry.name}</p>
                              <Badge className="text-[10px] mt-1" variant="outline">{entry.level}</Badge>
                              <p className="text-lg font-bold text-primary mt-2">
                                {sortBy === 'xp' && `${entry.xp.toLocaleString()} XP`}
                                {sortBy === 'sales' && `${entry.sales} sales`}
                                {sortBy === 'revenue' && `$${entry.revenue.toLocaleString()}`}
                              </p>
                              {entry.streak > 0 && (
                                <p className="text-xs text-orange-500 flex items-center justify-center gap-1 mt-1">
                                  <Flame className="w-3 h-3" aria-hidden="true" />
                                  {entry.streak} day streak
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </li>
                      );
                    })}
                  </ol>
                </motion.div>

                {/* Full Leaderboard */}
                {sortedLeaderboard.length > 3 && (
                  <motion.div variants={fadeInUp}>
                    <Card className="border-gray-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                          All Rankings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ol className="divide-y divide-gray-100 list-none p-0 m-0" aria-label="Full rankings">
                          {sortedLeaderboard.slice(3).map((entry) => (
                            <li
                              key={entry.name}
                              className={cn(
                                "p-4 transition-colors",
                                entry.isCurrentUser && "bg-primary/5"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 text-center font-bold text-gray-400">
                                  #{entry.rank}
                                </div>
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm", LEVEL_COLORS[entry.level] || LEVEL_COLORS.Silver)}>
                                  {getInitials(entry.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={cn("font-semibold", entry.isCurrentUser ? "text-primary" : "text-gray-900")}>
                                      {entry.name}
                                    </p>
                                    <Badge className="text-[10px]" variant="outline">{entry.level}</Badge>
                                    {entry.trend === 'up' && (
                                      <TrendingUp className="w-3 h-3 text-emerald-500" aria-label="Trending up" />
                                    )}
                                    {entry.trend === 'down' && (
                                      <TrendingDown className="w-3 h-3 text-red-500" aria-label="Trending down" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{entry.sales} sales</span>
                                    <span>${entry.revenue.toLocaleString()}</span>
                                    {entry.streak > 0 && (
                                      <span className="text-orange-500 flex items-center gap-0.5">
                                        <Flame className="w-3 h-3" aria-hidden="true" />
                                        {entry.streak}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary">{entry.xp.toLocaleString()} XP</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </AgentLoungeLayout>
  );
}

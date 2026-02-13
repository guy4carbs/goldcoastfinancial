import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Medal,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Star,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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

const DEMO_LEADERBOARD: SalesLeaderboardEntry[] = [
  { rank: 1, name: 'Marcus Johnson', avatar: null, level: 'Diamond', xp: 15420, sales: 47, revenue: 89500, streak: 28, trend: 'up', change: 2, isCurrentUser: false },
  { rank: 2, name: 'Sarah Williams', avatar: null, level: 'Diamond', xp: 14890, sales: 43, revenue: 82300, streak: 21, trend: 'same', change: 0, isCurrentUser: false },
  { rank: 3, name: 'David Chen', avatar: null, level: 'Platinum', xp: 13200, sales: 38, revenue: 71200, streak: 14, trend: 'up', change: 1, isCurrentUser: false },
  { rank: 4, name: 'Emily Rodriguez', avatar: null, level: 'Platinum', xp: 12150, sales: 35, revenue: 65800, streak: 12, trend: 'down', change: -2, isCurrentUser: false },
  { rank: 5, name: 'You', avatar: null, level: 'Gold', xp: 11500, sales: 32, revenue: 58900, streak: 7, trend: 'up', change: 3, isCurrentUser: true },
  { rank: 6, name: 'Michael Thompson', avatar: null, level: 'Gold', xp: 10800, sales: 29, revenue: 52400, streak: 5, trend: 'down', change: -1, isCurrentUser: false },
  { rank: 7, name: 'Lisa Anderson', avatar: null, level: 'Gold', xp: 9950, sales: 26, revenue: 48200, streak: 3, trend: 'up', change: 2, isCurrentUser: false },
  { rank: 8, name: 'James Wilson', avatar: null, level: 'Silver', xp: 8700, sales: 23, revenue: 41500, streak: 0, trend: 'same', change: 0, isCurrentUser: false },
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

const PODIUM_ICONS = [Crown, Medal, Medal] as const;

function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map(n => n[0]).join('');
}

export default function AgentLeaderboard() {
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>('This Month');
  const [sortBy, setSortBy] = useState<SortKey>('sales');

  const sortedLeaderboard = useMemo(() =>
    [...DEMO_LEADERBOARD]
      .sort((a, b) => b[sortBy] - a[sortBy])
      .map((entry, index) => ({ ...entry, rank: index + 1 })),
    [sortBy]
  );

  const currentUser = sortedLeaderboard.find(e => e.isCurrentUser);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-sm text-gray-500">See how you rank against other agents</p>
            </div>
          </div>
        </motion.div>

        {/* Time Range Filter */}
        <motion.div variants={fadeInUp} className="flex gap-2">
          {TIME_RANGES.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-gradient-to-r from-indigo-500 to-violet-500 border-0 shadow-md' : ''}
            >
              {range}
            </Button>
          ))}
        </motion.div>

        {/* Your Position Card */}
        {currentUser && (
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    #{currentUser.rank}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/70">Your Position</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Rank #{currentUser.rank}</p>
                      {currentUser.trend === 'up' && (
                        <span className="text-xs text-emerald-300 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-0.5" />+{currentUser.change}
                        </span>
                      )}
                      {currentUser.trend === 'down' && (
                        <span className="text-xs text-red-300 flex items-center">
                          <TrendingDown className="w-3 h-3 mr-0.5" />{currentUser.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{currentUser.sales} sales</p>
                    <p className="text-xs text-white/70">${currentUser.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sort Options */}
        <motion.div variants={fadeInUp} className="flex gap-2">
          <span className="text-sm text-gray-500 self-center">Sort by:</span>
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.key}
              variant={sortBy === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(option.key)}
              className={sortBy === option.key
                ? option.key === 'xp' ? 'bg-violet-600 border-0'
                : option.key === 'sales' ? 'bg-blue-600 border-0'
                : 'bg-emerald-600 border-0'
                : ''
              }
            >
              <option.icon className="w-3 h-3 mr-1" />
              {option.label}
            </Button>
          ))}
        </motion.div>

        {sortedLeaderboard.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium text-gray-600">No Rankings Yet</h3>
                <p className="text-sm text-gray-500 mt-1">Leaderboard data will appear once agents start recording activity.</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <motion.div variants={fadeInUp}>
              <ol className="grid grid-cols-3 gap-3">
                {sortedLeaderboard.slice(0, 3).map((entry, index) => {
                  const Icon = PODIUM_ICONS[index];
                  const podiumGradients = [
                    'from-yellow-400 to-amber-500',
                    'from-gray-400 to-slate-500',
                    'from-orange-400 to-orange-500'
                  ];
                  return (
                    <li key={entry.name}>
                      <Card className={cn(
                        "border-0 shadow-lg hover:shadow-xl transition-all",
                        entry.isCurrentUser && "ring-2 ring-violet-400"
                      )}>
                        <CardContent className="p-3 text-center">
                          <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br text-white shadow-md", podiumGradients[index])}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-sm text-gray-800 truncate">{entry.name}</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            {sortBy === 'xp' && entry.xp.toLocaleString()}
                            {sortBy === 'sales' && entry.sales}
                            {sortBy === 'revenue' && `$${(entry.revenue / 1000).toFixed(0)}K`}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {sortBy === 'xp' && 'XP'}
                            {sortBy === 'sales' && 'sales'}
                            {sortBy === 'revenue' && 'revenue'}
                          </p>
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
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <ol className="divide-y divide-gray-100">
                      {sortedLeaderboard.slice(3).map((entry) => (
                        <li
                          key={entry.name}
                          className={cn(
                            "px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors",
                            entry.isCurrentUser && "bg-violet-50"
                          )}
                        >
                          <span className="w-8 text-sm font-medium text-gray-400">#{entry.rank}</span>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold", LEVEL_COLORS[entry.level] || LEVEL_COLORS.Silver)}>
                            {getInitials(entry.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-medium text-sm truncate", entry.isCurrentUser ? "text-violet-600" : "text-gray-900")}>
                              {entry.name}
                            </p>
                            <p className="text-xs text-gray-500">{entry.sales} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-gray-900">
                              {sortBy === 'xp' && entry.xp.toLocaleString()}
                              {sortBy === 'sales' && entry.sales}
                              {sortBy === 'revenue' && `$${entry.revenue.toLocaleString()}`}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {sortBy === 'xp' && 'XP'}
                              {sortBy === 'sales' && 'sales'}
                              {sortBy === 'revenue' && 'revenue'}
                            </p>
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
      </motion.div>
    </AgentLoungeLayout>
  );
}

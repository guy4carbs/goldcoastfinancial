import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

interface SalesLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string | null;
  level: string;
  sales: { week: number; month: number; allTime: number };
  revenue: { week: number; month: number; allTime: number };
  streak: number;
  trend: { week: 'up' | 'down' | 'same'; month: 'up' | 'down' | 'same'; allTime: 'up' | 'down' | 'same' };
  change: { week: number; month: number; allTime: number };
  isCurrentUser: boolean;
}

const DEMO_LEADERBOARD: SalesLeaderboardEntry[] = [
  { rank: 1, name: 'Marcus Johnson', avatar: null, level: 'Diamond', sales: { week: 12, month: 47, allTime: 312 }, revenue: { week: 22800, month: 89500, allTime: 594000 }, streak: 28, trend: { week: 'up', month: 'up', allTime: 'up' }, change: { week: 1, month: 2, allTime: 0 }, isCurrentUser: false },
  { rank: 2, name: 'Sarah Williams', avatar: null, level: 'Diamond', sales: { week: 9, month: 43, allTime: 298 }, revenue: { week: 17100, month: 82300, allTime: 567000 }, streak: 21, trend: { week: 'down', month: 'same', allTime: 'up' }, change: { week: -1, month: 0, allTime: 1 }, isCurrentUser: false },
  { rank: 3, name: 'David Chen', avatar: null, level: 'Platinum', sales: { week: 11, month: 38, allTime: 245 }, revenue: { week: 20900, month: 71200, allTime: 459000 }, streak: 14, trend: { week: 'up', month: 'up', allTime: 'up' }, change: { week: 2, month: 1, allTime: 1 }, isCurrentUser: false },
  { rank: 4, name: 'Emily Rodriguez', avatar: null, level: 'Platinum', sales: { week: 8, month: 35, allTime: 267 }, revenue: { week: 15200, month: 65800, allTime: 501000 }, streak: 12, trend: { week: 'same', month: 'down', allTime: 'same' }, change: { week: 0, month: -2, allTime: 0 }, isCurrentUser: false },
  { rank: 5, name: 'You', avatar: null, level: 'Gold', sales: { week: 10, month: 32, allTime: 189 }, revenue: { week: 19500, month: 58900, allTime: 348000 }, streak: 7, trend: { week: 'up', month: 'up', allTime: 'up' }, change: { week: 3, month: 3, allTime: 2 }, isCurrentUser: true },
  { rank: 6, name: 'Michael Thompson', avatar: null, level: 'Gold', sales: { week: 6, month: 29, allTime: 201 }, revenue: { week: 11400, month: 52400, allTime: 372000 }, streak: 5, trend: { week: 'down', month: 'down', allTime: 'down' }, change: { week: -2, month: -1, allTime: -1 }, isCurrentUser: false },
  { rank: 7, name: 'Lisa Anderson', avatar: null, level: 'Gold', sales: { week: 7, month: 26, allTime: 178 }, revenue: { week: 13300, month: 48200, allTime: 329000 }, streak: 3, trend: { week: 'up', month: 'up', allTime: 'same' }, change: { week: 1, month: 2, allTime: 0 }, isCurrentUser: false },
  { rank: 8, name: 'James Wilson', avatar: null, level: 'Silver', sales: { week: 5, month: 23, allTime: 142 }, revenue: { week: 9500, month: 41500, allTime: 256000 }, streak: 0, trend: { week: 'same', month: 'same', allTime: 'down' }, change: { week: 0, month: 0, allTime: -1 }, isCurrentUser: false },
];

type TimeKey = 'week' | 'month' | 'allTime';
const TIME_RANGE_KEY: Record<string, TimeKey> = {
  'This Week': 'week',
  'This Month': 'month',
  'All Time': 'allTime',
};

const LEVEL_COLORS: Record<string, string> = {
  Diamond: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  Platinum: 'bg-gradient-to-r from-slate-400 to-slate-600',
  Gold: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  Silver: 'bg-gradient-to-r from-gray-300 to-gray-400',
  Bronze: 'bg-gradient-to-r from-orange-400 to-orange-600',
};

const TIME_RANGES = ['This Week', 'This Month', 'All Time'] as const;

type SortKey = 'revenue' | 'sales';

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof DollarSign }[] = [
  { key: 'revenue', label: 'Revenue (AP)', icon: DollarSign },
  { key: 'sales', label: 'Sales', icon: Target },
];

const PODIUM_ICONS = [Crown, Medal, Medal] as const;

function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map(n => n[0]).join('');
}

export default function AgentLeaderboard() {
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>('This Month');
  const [sortBy, setSortBy] = useState<SortKey>('revenue');

  const timeKey = TIME_RANGE_KEY[timeRange];
  const periodParam = timeKey === 'week' ? 'week' : timeKey === 'month' ? 'month' : 'all';

  // Fetch real leaderboard from deals API
  const { data: apiLeaderboard } = useQuery<{ success: boolean; data: Array<{
    rank: number; agentUserId: string; firstName: string; lastName: string; name: string; totalAP: number; dealCount: number;
  }> }>({
    queryKey: [`/api/deals/leaderboard?period=${periodParam}`],
    staleTime: 30000,
  });

  // Map API data to the SalesLeaderboardEntry format, falling back to demo data if empty
  const sortedLeaderboard = useMemo(() => {
    const apiData = apiLeaderboard?.data;
    if (apiData && apiData.length > 0) {
      return apiData.map((entry, index): SalesLeaderboardEntry => ({
        rank: index + 1,
        name: entry.name || `${entry.firstName} ${entry.lastName}`.trim(),
        avatar: null,
        level: entry.totalAP >= 50000 ? 'Diamond' : entry.totalAP >= 30000 ? 'Platinum' : entry.totalAP >= 15000 ? 'Gold' : entry.totalAP >= 5000 ? 'Silver' : 'Bronze',
        sales: { week: entry.dealCount, month: entry.dealCount, allTime: entry.dealCount },
        revenue: { week: entry.totalAP, month: entry.totalAP, allTime: entry.totalAP },
        streak: 0,
        trend: { week: 'same' as const, month: 'same' as const, allTime: 'same' as const },
        change: { week: 0, month: 0, allTime: 0 },
        isCurrentUser: false,
      }));
    }
    // Fallback to demo data if no real deals
    return [...DEMO_LEADERBOARD]
      .sort((a, b) => b[sortBy][timeKey] - a[sortBy][timeKey])
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [apiLeaderboard, sortBy, timeKey]);

  const currentUser = sortedLeaderboard.find(e => e.isCurrentUser);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Crown}
            title="Leaderboard"
            subtitle="See how you rank against other agents"
          />
        </motion.div>

        {/* Time Range Filter */}
        <motion.div
          variants={fadeInUp}
          className="flex gap-1 p-1 w-fit"
          style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
        >
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-all",
                timeRange === range
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              style={{ borderRadius: RADIUS.button }}
            >
              {range}
            </button>
          ))}
        </motion.div>

        {/* Your Position Card */}
        {currentUser && (
          <motion.div variants={fadeInUp}>
            <motion.div
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card
                className="border-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 overflow-hidden relative"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                }}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-amber-400/15 rounded-full blur-lg" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 bg-white/20 backdrop-blur flex items-center justify-center text-amber-200 font-bold text-lg"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      #{currentUser.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white/70">Your Position</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">Rank #{currentUser.rank}</p>
                        {currentUser.trend[timeKey] === 'up' && (
                          <span className="text-xs text-emerald-300 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-0.5" />+{currentUser.change[timeKey]}
                          </span>
                        )}
                        {currentUser.trend[timeKey] === 'down' && (
                          <span className="text-xs text-red-300 flex items-center">
                            <TrendingDown className="w-3 h-3 mr-0.5" />{currentUser.change[timeKey]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${currentUser.revenue[timeKey].toLocaleString()} AP</p>
                      <p className="text-xs text-white/70">{currentUser.sales[timeKey]} sales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Sort Options */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div
            className="flex gap-1 p-1"
            style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-all",
                  sortBy === option.key
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
                style={{ borderRadius: RADIUS.button }}
              >
                <option.icon className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {sortedLeaderboard.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card
              className="border-dashed"
              style={{ borderRadius: RADIUS.card }}
            >
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
                      <motion.div
                        variants={scaleIn}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                      >
                        <Card
                          className={cn(
                            "border-0 transition-all",
                            entry.isCurrentUser && "ring-2 ring-violet-400"
                          )}
                          style={{
                            borderRadius: RADIUS.card,
                            boxShadow: SHADOW.card,
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br text-white shadow-md", podiumGradients[index])}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <p className="font-semibold text-sm text-gray-800 truncate">{entry.name}</p>
                            <p className="text-lg font-bold text-violet-700">
                              {sortBy === 'revenue' ? `$${(entry.revenue[timeKey] / 1000).toFixed(0)}K` : entry.sales[timeKey]}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {sortBy === 'revenue' ? 'AP' : 'sales'}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </li>
                  );
                })}
              </ol>
            </motion.div>

            {/* Full Leaderboard */}
            {sortedLeaderboard.length > 3 && (
              <motion.div variants={fadeInUp}>
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <Card
                    className="border-0"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card,
                    }}
                  >
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
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm text-gray-900">
                                {sortBy === 'revenue' ? `$${entry.revenue[timeKey].toLocaleString()}` : entry.sales[timeKey]}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {sortBy === 'revenue' ? 'AP' : 'sales'}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </AgentLoungeLayout>
  );
}

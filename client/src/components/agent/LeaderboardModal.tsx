import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown, Trophy, Flame, ArrowUp, ArrowDown, Minus,
  Zap, Medal, Star, DollarSign, Calendar, CalendarDays, CalendarRange
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID, TYPE, RADIUS, SHADOW, MOTION, COLORS,
  fadeInUp
} from '@/lib/heritageDesignSystem';
import type { LeaderboardEntry } from "@/lib/agentStore";

type LeaderboardVariant = 'agent' | 'manager';

const THEME = {
  agent: {
    accent: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    gradientText: 'from-violet-600 to-purple-600',
    tabBg: 'bg-violet-50 border-violet-100',
    tabActive: 'data-[state=active]:from-violet-500 data-[state=active]:to-purple-600',
    rowHighlight: 'from-violet-50 to-purple-50 border-violet-200 ring-violet-500/20',
    rowHover: 'hover:bg-violet-50/50 hover:border-violet-200',
    rankBg: 'bg-violet-100',
    rankText: 'text-violet-600',
    avatarGradient: 'from-violet-500 to-purple-600 shadow-violet-500/20',
    zapColor: 'text-violet-500',
    footerBg: 'from-violet-50 to-purple-50 border-violet-100',
    footerIcon: 'from-violet-500 to-purple-600',
  },
  manager: {
    accent: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    gradientText: 'from-emerald-600 to-teal-600',
    tabBg: 'bg-emerald-50 border-emerald-100',
    tabActive: 'data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600',
    rowHighlight: 'from-emerald-50 to-teal-50 border-emerald-200 ring-emerald-500/20',
    rowHover: 'hover:bg-emerald-50/50 hover:border-emerald-200',
    rankBg: 'bg-emerald-100',
    rankText: 'text-emerald-600',
    avatarGradient: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    zapColor: 'text-emerald-500',
    footerBg: 'from-emerald-50 to-teal-50 border-emerald-100',
    footerIcon: 'from-emerald-500 to-teal-600',
  },
} as const;

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
  variant?: LeaderboardVariant;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const getRankBadge = (rank: number) => {
  if (rank === 1) return { icon: Crown, color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-400 to-orange-500' };
  if (rank === 2) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gradient-to-br from-gray-300 to-gray-500' };
  if (rank === 3) return { icon: Medal, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-600 to-orange-700' };
  return { icon: Star, color: 'text-violet-400', bg: 'bg-violet-100' };
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

const periodLabels: Record<TimePeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'This Year'
};

const periodIcons: Record<TimePeriod, typeof Calendar> = {
  daily: Calendar,
  weekly: CalendarDays,
  monthly: CalendarRange,
  yearly: Trophy
};

export function LeaderboardModal({
  open,
  onOpenChange,
  leaderboard,
  currentUserId,
  variant = 'agent',
}: LeaderboardModalProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const t = THEME[variant];

  const getSortedByAP = (period: TimePeriod) => {
    return [...leaderboard].sort((a, b) => b.ap[period] - a.ap[period]);
  };

  const sortedEntries = getSortedByAP(timePeriod);
  const topThree = getSortedByAP(timePeriod).slice(0, 3);

  const LeaderboardList = ({ entries, period }: { entries: LeaderboardEntry[]; period: TimePeriod }) => (
    <div className="space-y-2">
      {entries.map((entry, idx) => {
        const rankInfo = getRankBadge(idx + 1);
        const RankIcon = rankInfo.icon;
        const isCurrentUser = entry.id === currentUserId;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, ease: MOTION.easing }}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
              isCurrentUser
                ? `bg-gradient-to-r ${t.rowHighlight} ring-2`
                : `bg-white border-gray-100 ${t.rowHover}`
            )}
          >
            {/* Rank Badge */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm",
              idx < 3 ? rankInfo.bg : t.rankBg
            )}>
              {idx < 3 ? (
                <RankIcon className="w-5 h-5 text-white" />
              ) : (
                <span className={cn(t.rankText, "font-bold")}>{idx + 1}</span>
              )}
            </div>

            {/* Avatar */}
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center font-bold text-lg text-white shadow-lg", t.avatarGradient)}>
              {entry.avatar || entry.name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Name & Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{entry.name}</p>
                {isCurrentUser && (
                  <Badge className={cn("bg-gradient-to-r text-white text-[10px] px-1.5 border-0", t.gradient)}>You</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Zap className={cn("w-3 h-3", t.zapColor)} />
                  Level {entry.level}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {entry.streak} day streak
                </span>
              </div>
            </div>

            {/* AP Amount */}
            <div className="text-right">
              <p className={cn("font-bold text-lg bg-gradient-to-r bg-clip-text text-transparent", t.gradientText)}>
                {formatCurrency(entry.ap[period])}
              </p>
              <p className="text-xs text-gray-400">Annual Premium</p>
            </div>

            {/* Trend Arrow */}
            <div className="w-8 flex justify-center">
              {entry.trend === 'up' && <ArrowUp className="w-5 h-5 text-emerald-500" />}
              {entry.trend === 'down' && <ArrowDown className="w-5 h-5 text-red-500" />}
              {entry.trend === 'same' && <Minus className="w-5 h-5 text-gray-300" />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] p-0 flex flex-col border-0"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: RADIUS.hero,
          boxShadow: SHADOW.hero,
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3 font-serif text-2xl">
            {/* Icon Badge - 48px with amber/gold gradient for leaderboard */}
            <div
              className="flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
              style={{ width: 48, height: 48, borderRadius: RADIUS.card }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900">AP Leaderboard</span>
            <Badge
              className={cn("ml-2 text-xs font-medium border-0 bg-gradient-to-r text-white", t.gradient)}
            >
              {periodLabels[timePeriod]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Podium Section */}
          <div className="flex justify-center items-end gap-4 mb-6 py-4">
            {topThree.map((entry, idx) => {
              // idx 0 = highest AP = 1st place (gold, center)
              // idx 1 = second highest = 2nd place (silver, left)
              // idx 2 = third highest = 3rd place (bronze, right)
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const displayRank = idx + 1;
              // Reorder for visual: 2nd on left, 1st in center, 3rd on right
              const order = isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3';

              return (
                <motion.div
                  key={entry.id}
                  className={cn("text-center", order)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, ease: MOTION.easing }}
                  whileHover={{ y: -4, scale: 1.05 }}
                >
                  <div className={cn(
                    "relative mx-auto mb-2",
                    isFirst ? "w-20 h-20" : "w-16 h-16 mt-4"
                  )}>
                    {/* Avatar Circle */}
                    <div className={cn(
                      "w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white shadow-xl",
                      isFirst ? "from-amber-400 to-orange-500 text-2xl ring-4 ring-amber-400/40" :
                      isSecond ? "from-gray-300 to-gray-500 text-xl ring-4 ring-gray-300/40" :
                      "from-amber-600 to-orange-700 text-xl ring-4 ring-amber-600/40"
                    )}>
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {/* Rank Badge */}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg",
                      isFirst ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                      isSecond ? "bg-gradient-to-br from-gray-400 to-gray-600" :
                      "bg-gradient-to-br from-amber-600 to-orange-700"
                    )}>
                      {displayRank}
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{entry.name.split(' ')[0]}</p>
                  <p className={cn("font-bold bg-gradient-to-r bg-clip-text text-transparent", t.gradientText)}>
                    {formatCurrency(entry.ap[timePeriod])}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)} className="w-full">
            <TabsList
              className={cn("grid w-full grid-cols-4 mb-4 p-1 border", t.tabBg)}
              style={{ borderRadius: RADIUS.card }}
            >
              {([
                { value: 'daily', Icon: Calendar, label: 'Daily', short: 'Day' },
                { value: 'weekly', Icon: CalendarDays, label: 'Weekly', short: 'Week' },
                { value: 'monthly', Icon: CalendarRange, label: 'Monthly', short: 'Month' },
                { value: 'yearly', Icon: DollarSign, label: 'Yearly', short: 'Year' },
              ] as const).map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "gap-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all",
                    t.tabActive
                  )}
                >
                  <tab.Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <ScrollArea className="h-[300px]">
              <TabsContent value="daily" className="mt-0">
                <LeaderboardList entries={getSortedByAP('daily')} period="daily" />
              </TabsContent>
              <TabsContent value="weekly" className="mt-0">
                <LeaderboardList entries={getSortedByAP('weekly')} period="weekly" />
              </TabsContent>
              <TabsContent value="monthly" className="mt-0">
                <LeaderboardList entries={getSortedByAP('monthly')} period="monthly" />
              </TabsContent>
              <TabsContent value="yearly" className="mt-0">
                <LeaderboardList entries={getSortedByAP('yearly')} period="yearly" />
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer Note */}
          <div
            className={cn("mt-4 p-3 bg-gradient-to-r border", t.footerBg)}
            style={{ borderRadius: RADIUS.card }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={cn("w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center", t.footerIcon)}>
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              <span>AP = Annual Premium written. Rankings update in real-time.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import type { LeaderboardEntry } from "@/lib/agentStore";

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const getRankBadge = (rank: number) => {
  if (rank === 1) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  if (rank === 2) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/10' };
  if (rank === 3) return { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10' };
  return { icon: Star, color: 'text-muted-foreground', bg: 'bg-muted' };
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
  currentUserId 
}: LeaderboardModalProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');

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
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-all",
              isCurrentUser 
                ? "bg-violet-50 border-violet-300/30 ring-2 ring-secondary/20" 
                : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold",
              idx < 3 ? rankInfo.bg : "bg-muted"
            )}>
              {idx < 3 ? (
                <RankIcon className={cn("w-5 h-5", rankInfo.color)} />
              ) : (
                <span className="text-muted-foreground">{idx + 1}</span>
              )}
            </div>
            
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-lg">
              {entry.avatar || entry.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{entry.name}</p>
                {isCurrentUser && (
                  <Badge className="bg-secondary text-white text-[10px] px-1.5">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-violet-600" />
                  Level {entry.level}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {entry.streak} day streak
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-lg text-violet-600">{formatCurrency(entry.ap[period])}</p>
              <p className="text-xs text-muted-foreground">Annual Premium</p>
            </div>
            
            <div className="w-8 flex justify-center">
              {entry.trend === 'up' && <ArrowUp className="w-5 h-5 text-green-500" />}
              {entry.trend === 'down' && <ArrowDown className="w-5 h-5 text-red-500" />}
              {entry.trend === 'same' && <Minus className="w-5 h-5 text-muted-foreground" />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3 font-serif text-2xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            AP Leaderboard
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {periodLabels[timePeriod]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="flex justify-center gap-2 mb-6">
            {topThree.map((entry, idx) => {
              const isFirst = idx === 1;
              const isSecond = idx === 0;
              const reorderedIdx = isFirst ? 0 : isSecond ? 1 : 2;
              const order = isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3';
              
              return (
                <motion.div
                  key={entry.id}
                  className={cn("text-center", order)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reorderedIdx * 0.1 }}
                >
                  <div className={cn(
                    "relative mx-auto mb-2",
                    isFirst ? "w-20 h-20" : "w-16 h-16 mt-4"
                  )}>
                    <div className={cn(
                      "w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center font-bold",
                      isFirst ? "from-yellow-400 to-yellow-600 text-2xl ring-4 ring-yellow-400/30" :
                      isSecond ? "from-gray-300 to-gray-500 text-xl ring-2 ring-gray-300/30" :
                      "from-amber-500 to-amber-700 text-xl ring-2 ring-amber-500/30"
                    )}>
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm",
                      isFirst ? "bg-yellow-500" : isSecond ? "bg-gray-400" : "bg-amber-600"
                    )}>
                      {reorderedIdx + 1}
                    </div>
                  </div>
                  <p className="font-semibold text-sm">{entry.name.split(' ')[0]}</p>
                  <p className="text-violet-600 font-bold">{formatCurrency(entry.ap[timePeriod])}</p>
                </motion.div>
              );
            })}
          </div>

          <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="daily" className="gap-1 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">Daily</span>
                <span className="sm:hidden">Day</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-1 text-xs sm:text-sm">
                <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">Weekly</span>
                <span className="sm:hidden">Week</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-1 text-xs sm:text-sm">
                <CalendarRange className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">Monthly</span>
                <span className="sm:hidden">Month</span>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">Yearly</span>
                <span className="sm:hidden">Year</span>
              </TabsTrigger>
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

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 text-violet-600" />
              <span>AP = Annual Premium written. Rankings update in real-time.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

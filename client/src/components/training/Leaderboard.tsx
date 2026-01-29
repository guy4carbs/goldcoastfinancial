/**
 * Leaderboard - Training leaderboard showing top agents by XP
 *
 * Shows rankings with user avatars, XP totals, and level badges.
 * Supports different time period filters, cohort comparison, and team views.
 * Phase 4: Enhanced with cohort/team tabs and privacy opt-out.
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  User,
  ChevronUp,
  ChevronDown,
  Minus,
  Users,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Flame,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";
import { getAdvisorLevel, AdvisorLevel } from "@/lib/trainingInfrastructure";
import { LevelBadge } from "./AchievementDisplay";

type TimePeriod = "all" | "monthly" | "weekly";
type LeaderboardView = "global" | "cohort" | "team";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  totalXp: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: {
    rank: number | null;
    totalXp: number;
  };
}

interface LeaderboardProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Award className="w-5 h-5 text-amber-600" />
};

const rankColors: Record<number, string> = {
  1: "bg-yellow-50 border-yellow-200",
  2: "bg-gray-50 border-gray-200",
  3: "bg-amber-50 border-amber-200"
};

export function Leaderboard({
  className,
  limit = 10,
  showHeader = true,
  compact = false
}: LeaderboardProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [view, setView] = useState<LeaderboardView>("global");
  const [isVisible, setIsVisible] = useState(true);

  // Fallback: use store leaderboard data when API is unavailable
  const { leaderboard: storeLeaderboard, performance } = useAgentStore();

  const { data, isLoading, error } = useQuery<LeaderboardData>({
    queryKey: ["/api/training/leaderboard", limit, timePeriod, view],
    queryFn: async () => {
      const res = await fetch(`/api/training/leaderboard?limit=${limit}&period=${timePeriod}&view=${view}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    retry: false,
  });

  // When API fails, build fallback data from the store
  const fallbackData = useMemo<LeaderboardData | null>(() => {
    if (!error || storeLeaderboard.length === 0) return null;
    return {
      leaderboard: storeLeaderboard.map((entry) => ({
        rank: entry.rank,
        userId: entry.id,
        firstName: entry.name.split(' ')[0] || entry.name,
        lastName: entry.name.split(' ').slice(1).join(' ') || '',
        totalXp: entry.xp,
        isCurrentUser: entry.id === 'agent-1',
      })),
      currentUser: {
        rank: storeLeaderboard.find(e => e.id === 'agent-1')?.rank ?? null,
        totalXp: performance.xp,
      },
    };
  }, [error, storeLeaderboard, performance.xp]);

  const effectiveData = data || fallbackData;

  // Simulated cohort and team data (in production, would come from API)
  const viewLabels = {
    global: { label: "All Agents", icon: Users, description: "Compete with everyone" },
    cohort: { label: "Your Cohort", icon: Calendar, description: "Agents who started same month" },
    team: { label: "Your Team", icon: Building2, description: "Your office/team only" }
  };

  if (error && !fallbackData) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardContent className="p-6 text-center text-red-600">
          <p>Failed to load leaderboard</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-violet-500/20", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-500" />
              Leaderboard
            </CardTitle>

            {/* Privacy toggle */}
            <div className="flex items-center gap-2">
              <Label htmlFor="visibility" className="text-xs text-gray-500 cursor-pointer">
                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Label>
              <Switch
                id="visibility"
                checked={isVisible}
                onCheckedChange={setIsVisible}
                className="scale-75"
              />
            </div>
          </div>

          {/* View tabs */}
          <Tabs value={view} onValueChange={(v) => setView(v as LeaderboardView)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-9">
              {(Object.keys(viewLabels) as LeaderboardView[]).map((v) => {
                const ViewIcon = viewLabels[v].icon;
                return (
                  <TabsTrigger key={v} value={v} className="text-xs gap-1 px-2">
                    <ViewIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">{viewLabels[v].label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Time period filter */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">{viewLabels[view].description}</p>
            <div className="flex gap-1">
              {(["weekly", "monthly", "all"] as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-6 text-[10px] px-2",
                    timePeriod === period
                      ? "bg-primary text-white"
                      : "text-gray-500"
                  )}
                  onClick={() => setTimePeriod(period)}
                >
                  {period === "all" ? "All Time" : period === "monthly" ? "Month" : "Week"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={showHeader ? "" : "pt-4"}>
        {!isVisible ? (
          <div className="text-center py-8 text-gray-500">
            <EyeOff className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">You've opted out of the leaderboard</p>
            <p className="text-xs mt-1">Toggle visibility above to participate</p>
          </div>
        ) : isLoading ? (
          <LeaderboardSkeleton count={compact ? 5 : limit} />
        ) : effectiveData?.leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No rankings yet</p>
            <p className="text-xs mt-1">Complete training to earn XP!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {effectiveData?.leaderboard.slice(0, compact ? 5 : limit).map((entry, idx) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                compact={compact}
                showStreak={timePeriod === "weekly"}
              />
            ))}

            {/* Current user position if not in top list */}
            {effectiveData?.currentUser.rank &&
              effectiveData.currentUser.rank > (compact ? 5 : limit) && (
                <>
                  <div className="flex items-center gap-2 py-2 text-gray-400">
                    <div className="flex-1 border-t border-dashed" />
                    <span className="text-xs">Your Position</span>
                    <div className="flex-1 border-t border-dashed" />
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 text-center font-bold text-primary">
                      #{effectiveData.currentUser.rank}
                    </div>
                    <Avatar className="w-8 h-8 bg-primary">
                      <AvatarFallback className="text-white text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-medium text-sm">You</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {effectiveData.currentUser.totalXp.toLocaleString()} XP
                    </Badge>
                  </div>
                </>
              )}
          </div>
        )}

        {/* Weekly XP gained indicator */}
        {timePeriod === "weekly" && effectiveData?.currentUser && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Your XP this week
              </span>
              <Badge className="bg-emerald-100 text-emerald-700">
                +{effectiveData.currentUser.totalXp} XP
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * LeaderboardRow - Individual row in the leaderboard
 */
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  compact?: boolean;
  showStreak?: boolean;
}

function LeaderboardRow({ entry, compact = false, showStreak = false }: LeaderboardRowProps) {
  const initials = `${entry.firstName?.[0] || ""}${entry.lastName?.[0] || ""}`;
  const level = getAdvisorLevel(entry.totalXp);

  // Simulated streak data (in production would come from entry)
  const streak = Math.floor(Math.random() * 15) + 1;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        entry.isCurrentUser
          ? "bg-violet-500/10 border-violet-500/30"
          : entry.rank <= 3
          ? rankColors[entry.rank]
          : "bg-white border-gray-100 hover:bg-gray-50"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center">
        {entry.rank <= 3 ? (
          rankIcons[entry.rank]
        ) : (
          <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar
        className={cn(
          "w-8 h-8",
          entry.isCurrentUser ? "ring-2 ring-violet-500" : ""
        )}
      >
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            entry.rank === 1
              ? "bg-yellow-100 text-yellow-700"
              : entry.rank === 2
              ? "bg-gray-200 text-gray-700"
              : entry.rank === 3
              ? "bg-amber-100 text-amber-700"
              : "bg-primary/10 text-primary"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium text-sm truncate",
              entry.isCurrentUser && "text-primary"
            )}
          >
            {entry.firstName} {entry.lastName}
            {entry.isCurrentUser && (
              <span className="text-xs text-violet-500 ml-1">(You)</span>
            )}
          </span>
          {showStreak && streak >= 7 && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 text-orange-600 border-orange-200">
              <Flame className="w-2.5 h-2.5 mr-0.5" />
              {streak}
            </Badge>
          )}
        </div>
        {!compact && (
          <div className="mt-0.5">
            <LevelBadge points={entry.totalXp} className="text-[10px] h-5" />
          </div>
        )}
      </div>

      {/* XP */}
      <div className="text-right">
        <div className="font-bold text-sm text-primary">
          {entry.totalXp.toLocaleString()}
        </div>
        <div className="text-[10px] text-gray-400">XP</div>
      </div>
    </div>
  );
}

/**
 * LeaderboardSkeleton - Loading state
 */
function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-8 h-5" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

/**
 * LeaderboardMini - Compact version showing just top 3
 */
interface LeaderboardMiniProps {
  className?: string;
}

export function LeaderboardMini({ className }: LeaderboardMiniProps) {
  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ["/api/training/leaderboard", 3],
    queryFn: async () => {
      const res = await fetch("/api/training/leaderboard?limit=3");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-20 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.leaderboard.length) {
    return null;
  }

  // Reorder to show 2nd, 1st, 3rd (podium style)
  const podiumOrder = [
    data.leaderboard[1],
    data.leaderboard[0],
    data.leaderboard[2]
  ].filter(Boolean);

  return (
    <div className={cn("flex items-end justify-center gap-2", className)}>
      {podiumOrder.map((entry, idx) => {
        if (!entry) return null;
        const isFirst = entry.rank === 1;
        const initials = `${entry.firstName?.[0] || ""}${entry.lastName?.[0] || ""}`;

        return (
          <div
            key={entry.userId}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border",
              isFirst ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200",
              isFirst && "pb-6"
            )}
          >
            {rankIcons[entry.rank]}
            <Avatar
              className={cn(
                "mt-2",
                isFirst ? "w-12 h-12" : "w-10 h-10",
                entry.isCurrentUser && "ring-2 ring-violet-500"
              )}
            >
              <AvatarFallback
                className={cn(
                  "text-xs font-medium",
                  entry.rank === 1
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-200 text-gray-700"
                )}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs font-medium mt-2 truncate max-w-[80px]">
              {entry.firstName}
            </p>
            <p className="text-[10px] text-gray-500">
              {entry.totalXp.toLocaleString()} XP
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * LeaderboardPosition - Shows just current user's position
 */
interface LeaderboardPositionProps {
  className?: string;
}

export function LeaderboardPosition({ className }: LeaderboardPositionProps) {
  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ["/api/training/leaderboard", 10],
    queryFn: async () => {
      const res = await fetch("/api/training/leaderboard?limit=10");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-16 h-4" />
      </div>
    );
  }

  if (!data?.currentUser.rank) {
    return null;
  }

  const rankChange = 0; // TODO: Calculate based on previous position

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <TrendingUp className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-medium">#{data.currentUser.rank}</span>
      </div>
      {rankChange !== 0 && (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] h-5",
            rankChange > 0
              ? "text-green-600 border-green-300"
              : "text-red-600 border-red-300"
          )}
        >
          {rankChange > 0 ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {Math.abs(rankChange)}
        </Badge>
      )}
    </div>
  );
}

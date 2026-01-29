/**
 * StreakCounter - Learning streak tracking and display components
 *
 * Shows consecutive days of learning activity with visual indicators,
 * streak milestones, and motivation for maintaining streaks.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Flame,
  Calendar,
  CheckCircle,
  Circle,
  Target,
  TrendingUp,
  Award,
  Zap,
  Clock,
  AlertCircle,
  Sparkles,
  Star,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningStreak } from "@/lib/trainingInfrastructure";

interface StreakCounterProps {
  streak: LearningStreak;
  variant?: "compact" | "full" | "mini";
  className?: string;
}

const milestoneThresholds = [3, 7, 14, 30, 60, 90, 180, 365];

const getStreakColor = (days: number) => {
  if (days >= 30) return "text-orange-500";
  if (days >= 14) return "text-amber-500";
  if (days >= 7) return "text-yellow-500";
  return "text-gray-400";
};

const getStreakBackground = (days: number) => {
  if (days >= 30) return "bg-orange-50 border-orange-200";
  if (days >= 14) return "bg-amber-50 border-amber-200";
  if (days >= 7) return "bg-yellow-50 border-yellow-200";
  return "bg-gray-50 border-gray-200";
};

const getFlameIntensity = (days: number) => {
  if (days >= 30) return 3;
  if (days >= 14) return 2;
  if (days >= 7) return 1;
  return 0;
};

export function StreakCounter({
  streak,
  variant = "full",
  className
}: StreakCounterProps) {
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate if today's activity is complete
  const today = new Date().toDateString();
  const lastActiveDate = streak.lastActivityDate
    ? new Date(streak.lastActivityDate).toDateString()
    : null;
  const isActiveToday = lastActiveDate === today;

  // Calculate streak at risk (no activity yesterday and none today)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasActiveYesterday = lastActiveDate === yesterday.toDateString();
  const isAtRisk = !isActiveToday && !wasActiveYesterday && streak.currentStreak > 0;

  // Next milestone
  const nextMilestone = milestoneThresholds.find(m => m > streak.currentStreak) || null;
  const daysToMilestone = nextMilestone ? nextMilestone - streak.currentStreak : 0;

  // Mini variant - just the flame and number
  if (variant === "mini") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full",
            streak.currentStreak > 0 ? getStreakBackground(streak.currentStreak) : "bg-gray-100",
            className
          )}>
            <FlameIcon days={streak.currentStreak} size="sm" />
            <span className={cn(
              "font-bold text-sm",
              streak.currentStreak > 0 ? getStreakColor(streak.currentStreak) : "text-gray-400"
            )}>
              {streak.currentStreak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{streak.currentStreak} day streak</p>
          {isActiveToday && <p className="text-xs text-green-500">Active today!</p>}
          {isAtRisk && <p className="text-xs text-red-500">At risk! Learn today to maintain.</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className={cn("border", getStreakBackground(streak.currentStreak), className)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <FlameIcon days={streak.currentStreak} size="md" animated />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-bold text-lg",
                  getStreakColor(streak.currentStreak)
                )}>
                  {streak.currentStreak} Day{streak.currentStreak !== 1 ? "s" : ""}
                </span>
                {isActiveToday && (
                  <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
                {isAtRisk && (
                  <Badge variant="outline" className="text-red-600 border-red-300 text-[10px]">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    At Risk
                  </Badge>
                )}
              </div>
              {nextMilestone && (
                <p className="text-xs text-gray-500">
                  {daysToMilestone} day{daysToMilestone !== 1 ? "s" : ""} to {nextMilestone}-day streak
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn("border-violet-500/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-violet-500" />
            Learning Streak
          </span>
          {streak.longestStreak > 0 && (
            <Badge variant="outline" className="text-[10px]">
              Best: {streak.longestStreak} days
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main streak display */}
        <div className="flex items-center gap-4 mb-4">
          <FlameIcon days={streak.currentStreak} size="lg" animated />
          <div>
            <div className={cn(
              "text-3xl font-bold",
              getStreakColor(streak.currentStreak)
            )}>
              {streak.currentStreak}
            </div>
            <p className="text-sm text-gray-500">
              Day{streak.currentStreak !== 1 ? "s" : ""} in a row
            </p>
          </div>

          {/* Status badge */}
          <div className="ml-auto">
            {isActiveToday && (
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-[10px] text-green-600">Today</p>
              </div>
            )}
            {isAtRisk && (
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-1 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-[10px] text-red-600">At Risk!</p>
              </div>
            )}
            {!isActiveToday && !isAtRisk && streak.currentStreak > 0 && (
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-[10px] text-amber-600">Pending</p>
              </div>
            )}
          </div>
        </div>

        {/* Week view */}
        <WeekStreak activeDates={streak.activeDates} />

        {/* Next milestone */}
        {nextMilestone && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                Next milestone: {nextMilestone}-day streak
              </span>
              <span className="text-xs font-medium">
                {streak.currentStreak}/{nextMilestone}
              </span>
            </div>
            <Progress
              value={(streak.currentStreak / nextMilestone) * 100}
              className="h-2"
            />
            <p className="text-xs text-gray-400 mt-1">
              {daysToMilestone} more day{daysToMilestone !== 1 ? "s" : ""} to go!
            </p>
          </div>
        )}

        {/* Completed milestones */}
        {streak.currentStreak >= 3 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Milestones Achieved</p>
            <div className="flex flex-wrap gap-2">
              {milestoneThresholds
                .filter(m => streak.currentStreak >= m)
                .map(milestone => (
                  <Badge
                    key={milestone}
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      milestone >= 30 ? "bg-orange-100 text-orange-700" :
                      milestone >= 7 ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    )}
                  >
                    <Star className="w-2 h-2 mr-1" />
                    {milestone} days
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * FlameIcon - Animated flame with intensity based on streak
 */
interface FlameIconProps {
  days: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

function FlameIcon({ days, size = "md", animated = false }: FlameIconProps) {
  const intensity = getFlameIntensity(days);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const baseColor = getStreakColor(days);

  if (days === 0) {
    return <Flame className={cn(sizeClasses[size], "text-gray-300")} />;
  }

  return (
    <div className="relative">
      <motion.div
        animate={animated ? {
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0]
        } : {}}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Flame className={cn(sizeClasses[size], baseColor, "fill-current")} />
      </motion.div>

      {/* Glow effect for higher streaks */}
      {intensity >= 2 && (
        <div className={cn(
          "absolute inset-0 rounded-full blur-md -z-10",
          intensity >= 3 ? "bg-orange-400/40" : "bg-yellow-400/30"
        )} />
      )}

      {/* Sparkles for 30+ day streaks */}
      {intensity >= 3 && animated && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${50 + Math.cos(i * 120 * Math.PI / 180) * 60}%`,
                top: `${50 + Math.sin(i * 120 * Math.PI / 180) * 60}%`
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5
              }}
            >
              <Sparkles className="w-3 h-3 text-orange-400" />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * WeekStreak - Show the last 7 days activity
 */
interface WeekStreakProps {
  activeDates: string[];
}

function WeekStreak({ activeDates }: WeekStreakProps) {
  const days = useMemo(() => {
    const result = [];
    const activeDateSet = new Set(activeDates.map(d => new Date(d).toDateString()));

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      result.push({
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        isActive: activeDateSet.has(dateStr),
        isToday: i === 0
      });
    }

    return result;
  }, [activeDates]);

  return (
    <div className="flex justify-between gap-1">
      {days.map((day, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                day.isToday && "bg-violet-500/10",
                day.isActive && !day.isToday && "bg-green-50"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium",
                day.isToday ? "text-primary" : "text-gray-400"
              )}>
                {day.dayName}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                day.isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-300"
              )}>
                {day.isActive ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{day.date.toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">
              {day.isActive ? "Active" : "No activity"}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/**
 * StreakReminder - Notification card when streak is at risk
 */
interface StreakReminderProps {
  streak: LearningStreak;
  onDismiss?: () => void;
  className?: string;
}

export function StreakReminder({ streak, onDismiss, className }: StreakReminderProps) {
  const today = new Date().toDateString();
  const lastActiveDate = streak.lastActivityDate
    ? new Date(streak.lastActivityDate).toDateString()
    : null;
  const isActiveToday = lastActiveDate === today;

  // Only show if there's a streak at risk
  if (isActiveToday || streak.currentStreak === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-4 shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="w-10 h-10 fill-white" />
        </motion.div>
        <div className="flex-1">
          <h4 className="font-bold">Don't break your streak!</h4>
          <p className="text-sm opacity-90">
            You're on a {streak.currentStreak}-day streak. Complete a module today to keep it going!
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={onDismiss}
          >
            Later
          </Button>
          <Button
            size="sm"
            className="bg-white text-orange-600 hover:bg-white/90"
          >
            Learn Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * StreakStats - Statistics about streak history
 */
interface StreakStatsProps {
  streak: LearningStreak;
  className?: string;
}

export function StreakStats({ streak, className }: StreakStatsProps) {
  const stats = [
    {
      label: "Current Streak",
      value: streak.currentStreak,
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      suffix: "days"
    },
    {
      label: "Longest Streak",
      value: streak.longestStreak,
      icon: <Trophy className="w-4 h-4 text-yellow-500" />,
      suffix: "days"
    },
    {
      label: "Total Active Days",
      value: streak.activeDates.length,
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      suffix: "days"
    },
    {
      label: "This Week",
      value: streak.activeDates.filter(d => {
        const date = new Date(d);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }).length,
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      suffix: "of 7 days"
    }
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-gray-50 rounded-lg p-3 text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            {stat.icon}
            <span className="text-xs text-gray-500">{stat.label}</span>
          </div>
          <div className="text-xl font-bold text-primary">
            {stat.value}
          </div>
          <div className="text-[10px] text-gray-400">{stat.suffix}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Training Dashboard Widgets - Phase 3.1 & 3.3 Components
 *
 * Modern LMS-style dashboard widgets including:
 * - Today's Focus card
 * - Compliance countdown
 * - Estimated completion date
 * - Quick stats (time, streak)
 * - Resume Last Module button
 * - Weekly progress chart
 * - Cohort comparison
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Target,
  Clock,
  Calendar,
  Flame,
  TrendingUp,
  Play,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Award,
  Users,
  Zap,
  BookOpen,
  BarChart3,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/circular-progress";
import type { TrainingModuleData, CertificationStatus } from "@/lib/trainingData";

// ============================================================================
// CURRENT FOCUS CARD (Combined full-width component)
// ============================================================================

interface CurrentFocusCardProps {
  currentModule: TrainingModuleData | null;
  currentProgress: number;
  certificationName?: string;
  lastModule?: TrainingModuleData | null;
  lastModuleProgress?: number;
  onContinue: () => void;
  onResumeLast?: () => void;
  className?: string;
}

export function CurrentFocusCard({
  currentModule,
  currentProgress,
  certificationName = 'Pre-Access Certification',
  lastModule,
  lastModuleProgress = 0,
  onContinue,
  onResumeLast,
  className
}: CurrentFocusCardProps) {
  // Show last module if different from current and has progress
  const showResume = lastModule &&
    lastModule.id !== currentModule?.id &&
    lastModuleProgress > 0 &&
    lastModuleProgress < 100;

  if (!currentModule) {
    return (
      <Card className={cn("border-2 border-dashed border-green-300 bg-green-50", className)}>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="font-semibold text-green-800">All Caught Up!</h3>
          <p className="text-sm text-green-600 mt-1">
            You've completed all required training for now.
          </p>
        </CardContent>
      </Card>
    );
  }

  const estimatedTimeRemaining = Math.round(currentModule.duration * (1 - currentProgress / 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="overflow-hidden border-violet-500/30 bg-gradient-to-r from-violet-500/5 via-white to-primary/5">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-5 lg:p-6">
              <div className="flex items-start gap-4">
                {/* Progress Ring */}
                <div className="hidden sm:block">
                  <CircularProgress
                    value={currentProgress}
                    size={72}
                    strokeWidth={6}
                    color="accent"
                  >
                    <span className="text-sm font-bold">{currentProgress}%</span>
                  </CircularProgress>
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className="bg-violet-500/20 text-violet-500 border-0 text-[10px]">
                      {certificationName}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {currentModule.code}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg text-primary mb-1 line-clamp-1">
                    {currentModule.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                    {currentModule.subtitle}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{estimatedTimeRemaining > 0 ? `${estimatedTimeRemaining} min left` : `${currentModule.duration} min`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{currentModule.sections.length} sections</span>
                    </div>
                    {currentModule.assessmentRequired && (
                      <Badge className="text-[10px] h-5 bg-amber-100 text-amber-700 border-0">
                        Quiz Required
                      </Badge>
                    )}
                  </div>

                  {/* Mobile Progress */}
                  <div className="sm:hidden mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{currentProgress}%</span>
                    </div>
                    <Progress value={currentProgress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="flex flex-col justify-center gap-2 p-5 lg:p-6 lg:pl-0 lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50/50">
              <Button
                size="lg"
                className="w-full bg-violet-500 text-primary hover:bg-violet-500/90 font-semibold"
                onClick={onContinue}
              >
                {currentProgress > 0 ? "Continue" : "Start Module"}
                <Play className="w-5 h-5 ml-2" />
              </Button>

              {showResume && onResumeLast && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-600 hover:text-primary"
                  onClick={onResumeLast}
                >
                  <span className="truncate">Resume: {lastModule.title}</span>
                  <ChevronRight className="w-4 h-4 ml-1 flex-shrink-0" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// TODAY'S FOCUS CARD (Legacy - kept for compatibility)
// ============================================================================

interface TodaysFocusProps {
  currentModule: TrainingModuleData | null;
  currentProgress: number;
  estimatedTimeRemaining: number; // minutes
  onContinue: () => void;
  className?: string;
}

export function TodaysFocusCard({
  currentModule,
  currentProgress,
  estimatedTimeRemaining,
  onContinue,
  className
}: TodaysFocusProps) {
  if (!currentModule) {
    return (
      <Card className={cn("border-2 border-dashed border-green-300 bg-green-50", className)}>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="font-semibold text-green-800">All Caught Up!</h3>
          <p className="text-sm text-green-600 mt-1">
            You've completed all required training for now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="overflow-hidden border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-white to-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-violet-500 uppercase tracking-wider">
                Today's Focus
              </p>
              <CardTitle className="text-lg">{currentModule.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{currentModule.subtitle}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{estimatedTimeRemaining} min left</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>{currentModule.sections.length} sections</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {currentModule.code}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          <Button
            className="w-full bg-violet-500 text-primary hover:bg-violet-500/90 font-semibold"
            onClick={onContinue}
          >
            {currentProgress > 0 ? "Continue Learning" : "Start Module"}
            <Play className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// COMPLIANCE COUNTDOWN
// ============================================================================

interface ComplianceCountdownProps {
  certifications: {
    name: string;
    status: CertificationStatus;
    expiresAt?: Date;
    daysRemaining?: number;
  }[];
  className?: string;
}

export function ComplianceCountdown({ certifications, className }: ComplianceCountdownProps) {
  const expiringCerts = certifications.filter(c =>
    c.status === 'certified' && c.daysRemaining !== undefined && c.daysRemaining <= 90
  );

  const urgentCerts = expiringCerts.filter(c => c.daysRemaining! <= 30);
  const warningCerts = expiringCerts.filter(c => c.daysRemaining! > 30 && c.daysRemaining! <= 90);

  if (expiringCerts.length === 0) {
    return null; // Don't show if nothing is expiring soon
  }

  return (
    <Card className={cn(
      "border-l-4",
      urgentCerts.length > 0 ? "border-l-red-500 bg-red-50/50" : "border-l-amber-500 bg-amber-50/50",
      className
    )}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            urgentCerts.length > 0 ? "bg-red-100" : "bg-amber-100"
          )}>
            <AlertTriangle className={cn(
              "w-5 h-5",
              urgentCerts.length > 0 ? "text-red-600" : "text-amber-600"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-sm",
              urgentCerts.length > 0 ? "text-red-800" : "text-amber-800"
            )}>
              {urgentCerts.length > 0 ? "Certification Expiring Soon" : "Upcoming Renewals"}
            </h4>
            <div className="mt-2 space-y-2">
              {expiringCerts.slice(0, 3).map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate">{cert.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-2 flex-shrink-0",
                      cert.daysRemaining! <= 30 ? "border-red-300 text-red-700 bg-red-50" : "border-amber-300 text-amber-700 bg-amber-50"
                    )}
                  >
                    {cert.daysRemaining} days
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ESTIMATED COMPLETION
// ============================================================================

interface EstimatedCompletionProps {
  completedModules: number;
  totalModules: number;
  averagePacePerWeek: number; // modules per week
  targetCertification: string;
  className?: string;
}

export function EstimatedCompletion({
  completedModules,
  totalModules,
  averagePacePerWeek,
  targetCertification,
  className
}: EstimatedCompletionProps) {
  const remainingModules = totalModules - completedModules;
  const weeksRemaining = averagePacePerWeek > 0 ? Math.ceil(remainingModules / averagePacePerWeek) : 0;

  const estimatedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + (weeksRemaining * 7));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [weeksRemaining]);

  const progressPercent = Math.round((completedModules / totalModules) * 100);

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <CircularProgress
            value={progressPercent}
            size={56}
            strokeWidth={5}
            color="accent"
          >
            <span className="text-sm font-bold">{progressPercent}%</span>
          </CircularProgress>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {targetCertification}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedModules} of {totalModules} modules complete
            </p>
            {remainingModules > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-violet-500">
                <Calendar className="w-3 h-3" />
                <span>Est. completion: {estimatedDate}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUICK STATS ROW
// ============================================================================

interface QuickStatsProps {
  timeSpentThisWeek: number; // minutes
  currentStreak: number; // days
  modulesThisWeek: number;
  assessmentsPassed: number;
  className?: string;
}

export function QuickStats({
  timeSpentThisWeek,
  currentStreak,
  modulesThisWeek,
  assessmentsPassed,
  className
}: QuickStatsProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const stats = [
    {
      icon: Timer,
      label: "Time This Week",
      value: formatTime(timeSpentThisWeek),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${currentStreak} days`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
      highlight: currentStreak >= 7
    },
    {
      icon: BookOpen,
      label: "Modules This Week",
      value: modulesThisWeek.toString(),
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100"
    },
    {
      icon: Award,
      label: "Assessments Passed",
      value: assessmentsPassed.toString(),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100"
    }
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className={cn(
            "transition-all hover:shadow-md border-0",
            stat.bgColor,
            stat.highlight && "ring-2 ring-orange-400"
          )}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  stat.iconBg
                )}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// WEEKLY PROGRESS CHART
// ============================================================================

interface WeeklyProgressProps {
  data: {
    day: string;
    modules: number;
    minutes: number;
  }[];
  className?: string;
}

export function WeeklyProgressChart({ data, className }: WeeklyProgressProps) {
  const maxModules = Math.max(...data.map(d => d.modules), 1);
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const totalModules = data.reduce((sum, d) => sum + d.modules, 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            This Week's Activity
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{totalModules} modules</span>
            <span>{Math.round(totalMinutes / 60)}h total</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-24">
          {data.map((day, idx) => (
            <TooltipProvider key={day.day}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className={cn(
                        "w-full rounded-t transition-colors",
                        day.modules > 0 ? "bg-violet-500" : "bg-gray-200"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.modules / maxModules) * 64}px` }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      style={{ minHeight: day.modules > 0 ? '8px' : '4px' }}
                    />
                    <span className={cn(
                      "text-[10px]",
                      idx === data.length - 1 ? "font-medium text-primary" : "text-gray-400"
                    )}>
                      {day.day}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{day.day}</p>
                  <p className="text-xs">{day.modules} modules, {day.minutes} min</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COHORT COMPARISON
// ============================================================================

interface CohortComparisonProps {
  userProgress: number; // 0-100
  cohortAverage: number; // 0-100
  percentileRank: number; // 0-100 (e.g., 65 means "ahead of 65%")
  className?: string;
}

export function CohortComparison({
  userProgress,
  cohortAverage,
  percentileRank,
  className
}: CohortComparisonProps) {
  const isAhead = userProgress > cohortAverage;

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isAhead ? "bg-emerald-100" : "bg-amber-100"
          )}>
            <Users className={cn(
              "w-6 h-6",
              isAhead ? "text-emerald-600" : "text-amber-600"
            )} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-2xl font-bold",
                isAhead ? "text-emerald-600" : "text-amber-600"
              )}>
                {percentileRank}%
              </span>
              <span className="text-sm text-gray-500">of agents</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isAhead
                ? `You're ahead of ${percentileRank}% of your cohort`
                : `${100 - percentileRank}% of agents are further along`
              }
            </p>
          </div>
          {isAhead && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <TrendingUp className="w-3 h-3 mr-1" />
              On Track
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RESUME LAST MODULE BUTTON
// ============================================================================

interface ResumeButtonProps {
  lastModule: TrainingModuleData | null;
  lastSection?: string;
  progress: number;
  onResume: () => void;
  className?: string;
}

export function ResumeLastModuleButton({
  lastModule,
  lastSection,
  progress,
  onResume,
  className
}: ResumeButtonProps) {
  if (!lastModule || progress >= 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={className}
    >
      <Button
        variant="outline"
        className="w-full justify-between h-auto py-3 px-4 border-2 hover:border-violet-500/50 hover:bg-violet-500/5"
        onClick={onResume}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Resume: {lastModule.title}</p>
            <p className="text-xs text-gray-500">{progress}% complete</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </Button>
    </motion.div>
  );
}

// ============================================================================
// STREAK DISPLAY (Enhanced)
// ============================================================================

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezeAvailable: boolean;
  lastActiveDate: Date;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  streakFreezeAvailable,
  lastActiveDate,
  className
}: StreakDisplayProps) {
  const isActiveToday = useMemo(() => {
    const today = new Date();
    return lastActiveDate.toDateString() === today.toDateString();
  }, [lastActiveDate]);

  const streakLevel = currentStreak >= 30 ? "legendary" : currentStreak >= 14 ? "master" : currentStreak >= 7 ? "strong" : "building";

  const levelConfig = {
    building: {
      gradient: "from-orange-400 to-orange-600",
      bg: "bg-orange-50",
      label: "Building Momentum"
    },
    strong: {
      gradient: "from-orange-500 to-red-500",
      bg: "bg-orange-50",
      label: "Strong Streak"
    },
    master: {
      gradient: "from-red-500 to-purple-500",
      bg: "bg-purple-50",
      label: "Master Streak"
    },
    legendary: {
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      label: "Legendary"
    }
  };

  const config = levelConfig[streakLevel];

  return (
    <Card className={cn("overflow-hidden h-full", className)}>
      <div className={cn("h-1.5 bg-gradient-to-r", config.gradient)} />
      <CardContent className="p-5">
        <div className="flex items-center gap-5">
          <motion.div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
              config.gradient
            )}
            animate={isActiveToday ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-8 h-8 text-white" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900">{currentStreak}</span>
              <span className="text-base text-gray-500 font-medium">day streak</span>
            </div>
            <p className="text-sm text-gray-400">Personal best: {longestStreak} days</p>
          </div>

          <div className="text-right space-y-2">
            {isActiveToday ? (
              <Badge className="bg-green-100 text-green-700 px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Active Today
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300 px-3 py-1">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Train to maintain!
              </Badge>
            )}
            {streakFreezeAvailable && (
              <p className="text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  1 freeze available
                </span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

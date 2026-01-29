/**
 * Gamification System - Phase 4
 *
 * XP & Points system with:
 * - XP calculation based on duration + assessment score
 * - Streak multipliers (1.5x after 7 days, 2x after 30)
 * - Level-up celebration modal
 * - Daily challenges
 * - Question of the Day
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Zap,
  Flame,
  Star,
  Trophy,
  Target,
  Clock,
  Gift,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  TrendingUp,
  Award,
  Crown,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Confetti } from "./TrainingCelebrations";

// ============================================================================
// XP CALCULATION SYSTEM
// ============================================================================

export interface XPEarnedEvent {
  type: 'module_complete' | 'assessment_passed' | 'assessment_pass' | 'daily_challenge' | 'streak_bonus' | 'achievement' | 'milestone';
  baseXP: number;
  multiplier: number;
  totalXP: number;
  description: string;
  timestamp?: Date;
}

/**
 * Calculate XP for completing a module
 * Base: 10 XP per 5 minutes of content
 */
export function calculateModuleXP(durationMinutes: number, streakDays: number): XPEarnedEvent {
  const baseXP = Math.round((durationMinutes / 5) * 10);
  const multiplier = getStreakMultiplier(streakDays);
  const totalXP = Math.round(baseXP * multiplier);

  return {
    type: 'module_complete',
    baseXP,
    multiplier,
    totalXP,
    description: `Module completed (${durationMinutes} min)`
  };
}

/**
 * Calculate XP for passing an assessment
 * Base: 50 XP + bonus based on score
 */
export function calculateAssessmentXP(
  score: number,
  passingScore: number,
  streakDays: number
): XPEarnedEvent {
  const baseXP = 50;
  const scoreBonus = Math.round((score - passingScore) * 2); // 2 XP per point above passing
  const perfectBonus = score === 100 ? 50 : 0;
  const totalBase = baseXP + Math.max(0, scoreBonus) + perfectBonus;
  const multiplier = getStreakMultiplier(streakDays);
  const totalXP = Math.round(totalBase * multiplier);

  return {
    type: 'assessment_passed',
    baseXP: totalBase,
    multiplier,
    totalXP,
    description: score === 100 ? 'Perfect score!' : `Assessment passed (${score}%)`
  };
}

/**
 * Calculate XP for completing daily challenge
 */
export function calculateDailyChallengeXP(streakDays: number): XPEarnedEvent {
  const baseXP = 25;
  const multiplier = getStreakMultiplier(streakDays);
  const totalXP = Math.round(baseXP * multiplier);

  return {
    type: 'daily_challenge',
    baseXP,
    multiplier,
    totalXP,
    description: 'Daily challenge completed'
  };
}

/**
 * Get streak multiplier
 * 1.0x: 0-6 days
 * 1.5x: 7-29 days
 * 2.0x: 30+ days
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 7) return 1.5;
  return 1.0;
}

/**
 * Get streak multiplier display info
 */
export function getStreakMultiplierInfo(streakDays: number): {
  multiplier: number;
  label: string;
  nextMilestone: number | null;
  daysToNext: number;
} {
  if (streakDays >= 30) {
    return { multiplier: 2.0, label: '2x XP Bonus', nextMilestone: null, daysToNext: 0 };
  }
  if (streakDays >= 7) {
    return { multiplier: 1.5, label: '1.5x XP Bonus', nextMilestone: 30, daysToNext: 30 - streakDays };
  }
  return { multiplier: 1.0, label: 'No Bonus', nextMilestone: 7, daysToNext: 7 - streakDays };
}

// ============================================================================
// XP EARNED POPUP
// ============================================================================

interface XPEarnedPopupProps {
  show?: boolean;
  event: XPEarnedEvent | null;
  onDismiss: () => void;
}

export function XPEarnedPopup({ show, event, onDismiss }: XPEarnedPopupProps) {
  // Show if show is true OR if event exists (backwards compatible)
  const shouldShow = show ?? !!event;

  useEffect(() => {
    if (shouldShow && event) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, event, onDismiss]);

  return (
    <AnimatePresence>
      {shouldShow && event && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-2xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center"
                >
                  <Zap className="w-6 h-6 text-primary" />
                </motion.div>
                <div>
                  <p className="text-sm opacity-80">{event.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">+{event.totalXP} XP</span>
                    {event.multiplier > 1 && (
                      <Badge className="bg-white/20 text-white text-xs">
                        {event.multiplier}x streak bonus
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// LEVEL UP CELEBRATION
// ============================================================================

const levelIcons: Record<string, typeof Star> = {
  gray: Star,
  green: Award,
  blue: Trophy,
  purple: Crown,
  gold: Crown,
  diamond: Sparkles
};

const levelGradients: Record<string, string> = {
  gray: 'from-gray-400 to-gray-500',
  green: 'from-green-400 to-emerald-500',
  blue: 'from-blue-400 to-indigo-500',
  purple: 'from-purple-400 to-violet-500',
  gold: 'from-yellow-400 to-amber-500',
  diamond: 'from-cyan-400 to-blue-500'
};

interface LevelUpCelebrationProps {
  show: boolean;
  previousLevel?: string;
  newLevel?: string;
  levelName?: string; // Alias for newLevel
  levelColor?: string;
  newLevelIcon?: React.ElementType;
  onDismiss: () => void;
}

export function LevelUpCelebration({
  show,
  previousLevel,
  newLevel,
  levelName,
  levelColor = 'gold',
  newLevelIcon,
  onDismiss
}: LevelUpCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const displayLevel = levelName || newLevel || 'New Level';
  const Icon = newLevelIcon || levelIcons[levelColor] || Star;
  const gradient = levelGradients[levelColor] || levelGradients.gold;

  return (
    <>
      <Confetti active={showConfetti} particleCount={150} />

      <Dialog open={show} onOpenChange={(open) => !open && onDismiss()}>
        <DialogContent className="sm:max-w-md text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className={cn(
              "mx-auto w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center shadow-xl",
              gradient
            )}
          >
            <Icon className="w-14 h-14 text-white" />
          </motion.div>

          <DialogHeader className="pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="mx-auto bg-violet-500 text-primary mb-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Level Up!
              </Badge>
              <DialogTitle className="text-2xl font-serif">
                Congratulations!
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {previousLevel ? (
                  <>You've advanced from <span className="font-semibold">{previousLevel}</span> to</>
                ) : (
                  <>You've reached a new level!</>
                )}
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="py-4"
          >
            <div className={cn(
              "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r rounded-xl text-white",
              gradient
            )}>
              <Icon className="w-6 h-6" />
              <span className="text-xl font-bold">{displayLevel}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              className="bg-violet-500 text-primary hover:bg-violet-500/90"
              onClick={onDismiss}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// STREAK MULTIPLIER CARD
// ============================================================================

interface StreakMultiplierCardProps {
  streakDays?: number;
  currentStreak?: number; // Alias for streakDays
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export function StreakMultiplierCard({
  streakDays,
  currentStreak,
  showProgress = true,
  compact = false,
  className
}: StreakMultiplierCardProps) {
  const days = currentStreak ?? streakDays ?? 0;
  const info = getStreakMultiplierInfo(days);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        info.multiplier >= 2 ? "bg-purple-100" :
        info.multiplier >= 1.5 ? "bg-orange-100" :
        "bg-gray-100",
        className
      )}>
        <Flame className={cn(
          "w-4 h-4",
          info.multiplier >= 2 ? "text-purple-600" :
          info.multiplier >= 1.5 ? "text-orange-600" :
          "text-gray-500"
        )} />
        <div>
          <p className="text-xs font-medium">{days} day streak</p>
          <p className={cn(
            "text-[10px] font-semibold",
            info.multiplier >= 2 ? "text-purple-600" :
            info.multiplier >= 1.5 ? "text-orange-600" :
            "text-gray-500"
          )}>{info.label}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className={cn(
        "h-1 bg-gradient-to-r",
        info.multiplier >= 2 ? "from-purple-500 to-pink-500" :
        info.multiplier >= 1.5 ? "from-orange-500 to-red-500" :
        "from-gray-300 to-gray-400"
      )} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              info.multiplier >= 2 ? "bg-purple-100" :
              info.multiplier >= 1.5 ? "bg-orange-100" :
              "bg-gray-100"
            )}>
              <Flame className={cn(
                "w-6 h-6",
                info.multiplier >= 2 ? "text-purple-600" :
                info.multiplier >= 1.5 ? "text-orange-600" :
                "text-gray-500"
              )} />
            </div>
            <div>
              <p className="text-xl font-bold">{days} Day Streak</p>
              <p className={cn(
                "text-sm font-semibold",
                info.multiplier >= 2 ? "text-purple-600" :
                info.multiplier >= 1.5 ? "text-orange-600" :
                "text-gray-500"
              )}>{info.label}</p>
            </div>
          </div>

          {info.nextMilestone && (
            <div className="text-right">
              <Badge variant="outline" className={cn(
                "text-xs",
                info.multiplier >= 1.5 ? "border-purple-300 text-purple-600" :
                "border-orange-300 text-orange-600"
              )}>
                {info.daysToNext} days to {info.multiplier >= 1.5 ? '2x' : '1.5x'}
              </Badge>
            </div>
          )}
        </div>

        {showProgress && info.nextMilestone && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to next XP bonus</span>
              <span>{days}/{info.nextMilestone}</span>
            </div>
            <Progress
              value={(days / info.nextMilestone) * 100}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DAILY CHALLENGE
// ============================================================================

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'modules' | 'quiz' | 'assessment' | 'review' | 'time';
  target: number;
  current: number;
  xpReward: number;
  expiresAt: Date;
}

interface DailyChallengeCardProps {
  challenge?: DailyChallenge;
  challenges?: DailyChallenge[];
  onAccept?: () => void;
  onComplete?: () => void;
  onClaimReward?: (challengeId: string) => void;
  className?: string;
}

// Single challenge item component
function DailyChallengeItem({
  challenge,
  onClaimReward
}: {
  challenge: DailyChallenge;
  onClaimReward?: (id: string) => void;
}) {
  const [claimed, setClaimed] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [showXPFloat, setShowXPFloat] = useState(false);
  const isComplete = challenge.current >= challenge.target;
  const progress = Math.min((challenge.current / challenge.target) * 100, 100);

  const typeIcons: Record<string, typeof Target> = {
    module: Target,
    modules: Target,
    quiz: HelpCircle,
    assessment: HelpCircle,
    review: CheckCircle2,
    time: Clock
  };

  const Icon = typeIcons[challenge.type] || Target;

  const handleClaim = () => {
    if (claimed) return;
    setClaimed(true);
    setShowBurst(true);
    setShowXPFloat(true);
    onClaimReward?.(challenge.id);
    setTimeout(() => setShowBurst(false), 1000);
    setTimeout(() => setShowXPFloat(false), 1500);
  };

  // Particle burst colors
  const burstColors = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4'];

  return (
    <div className={cn(
      "relative flex items-center gap-3 p-3 rounded-lg transition-all",
      claimed ? "bg-emerald-50/80 border border-emerald-200" :
      isComplete ? "bg-green-50 border border-green-200" : "bg-gray-50"
    )}>
      {/* Particle burst on claim */}
      <AnimatePresence>
        {showBurst && (
          <>
            {burstColors.map((color, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute z-20 rounded-full"
                style={{
                  width: 6 + Math.random() * 4,
                  height: 6 + Math.random() * 4,
                  backgroundColor: color,
                  right: 60,
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: (Math.random() - 0.5) * 120,
                  y: (Math.random() - 0.5) * 80,
                  opacity: [1, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.03 }}
              />
            ))}
            {/* Star sparkles */}
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={`star-${i}`}
                className="absolute z-20"
                style={{ right: 60, top: '50%' }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 140,
                  y: -20 - Math.random() * 60,
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Floating XP text */}
      <AnimatePresence>
        {showXPFloat && (
          <motion.div
            className="absolute z-30 right-8 font-bold text-lg text-emerald-500 pointer-events-none"
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -50, scale: [0.5, 1.2, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            +{challenge.xpReward} XP
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          claimed ? "bg-emerald-100" :
          isComplete ? "bg-green-100" : "bg-violet-500/20"
        )}
        animate={claimed ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {claimed ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Trophy className="w-5 h-5 text-emerald-600" />
          </motion.div>
        ) : isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Icon className="w-5 h-5 text-primary" />
        )}
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            "font-medium text-sm truncate",
            claimed && "text-emerald-700"
          )}>{challenge.title}</h4>
          <Badge className={cn(
            "text-[10px] flex-shrink-0",
            claimed ? "bg-emerald-100 text-emerald-700" : "bg-violet-500/20 text-primary"
          )}>
            {claimed ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Claimed
              </motion.span>
            ) : (
              <>+{challenge.xpReward} XP</>
            )}
          </Badge>
        </div>
        <div className="mt-1.5">
          <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
            <span>{challenge.description}</span>
            <span>{challenge.current}/{challenge.target}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {isComplete && onClaimReward && !claimed && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-8 text-xs flex-shrink-0 shadow-lg shadow-green-500/25 gap-1"
            onClick={handleClaim}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Gift className="w-3.5 h-3.5" />
            </motion.div>
            Claim
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export function DailyChallengeCard({
  challenge,
  challenges,
  onAccept,
  onComplete,
  onClaimReward,
  className
}: DailyChallengeCardProps) {
  // Support both single challenge and array of challenges
  const allChallenges = challenges || (challenge ? [challenge] : []);

  if (allChallenges.length === 0) return null;

  const completedCount = allChallenges.filter(c => c.current >= c.target).length;
  const hoursRemaining = Math.max(0, Math.floor(
    (allChallenges[0].expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  ));

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-1 bg-gradient-to-r from-violet-500 to-amber-400" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            Daily Challenges
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completedCount}/{allChallenges.length} done
            </Badge>
            {hoursRemaining <= 6 && (
              <Badge variant="outline" className="text-[10px] text-red-600 border-red-200">
                <Clock className="w-3 h-3 mr-1" />
                {hoursRemaining}h left
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {allChallenges.map((c) => (
          <DailyChallengeItem
            key={c.id}
            challenge={c}
            onClaimReward={onClaimReward}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUESTION OF THE DAY
// ============================================================================

interface QuestionOfTheDayProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  moduleReference?: string;
  xpReward: number;
  onAnswer: (isCorrect: boolean) => void;
  hasAnswered?: boolean;
  className?: string;
}

export function QuestionOfTheDay({
  question,
  options,
  correctIndex,
  explanation,
  moduleReference,
  xpReward,
  onAnswer,
  hasAnswered = false,
  className
}: QuestionOfTheDayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(hasAnswered);

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setShowResult(true);
    onAnswer(selectedIndex === correctIndex);
  };

  const isCorrect = selectedIndex === correctIndex;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary/90">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Question of the Day
          <Badge className="ml-auto bg-white/20 text-white">
            +{xpReward} XP
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <p className="font-medium mb-4">{question}</p>

        <div className="space-y-2">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !showResult && setSelectedIndex(idx)}
              disabled={showResult}
              className={cn(
                "w-full p-3 rounded-lg border text-left text-sm transition-all",
                !showResult && selectedIndex === idx && "border-violet-500 bg-violet-500/10",
                !showResult && selectedIndex !== idx && "border-gray-200 hover:border-gray-300",
                showResult && idx === correctIndex && "border-green-500 bg-green-50",
                showResult && selectedIndex === idx && idx !== correctIndex && "border-red-500 bg-red-50"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  !showResult && selectedIndex === idx && "bg-violet-500 text-primary",
                  !showResult && selectedIndex !== idx && "bg-gray-100 text-gray-500",
                  showResult && idx === correctIndex && "bg-green-500 text-white",
                  showResult && selectedIndex === idx && idx !== correctIndex && "bg-red-500 text-white"
                )}>
                  {showResult && idx === correctIndex ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : showResult && selectedIndex === idx ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {!showResult ? (
          <Button
            className="w-full mt-4 bg-primary"
            disabled={selectedIndex === null}
            onClick={handleSubmit}
          >
            Submit Answer
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 p-3 rounded-lg",
              isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">Correct! +{xpReward} XP</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-700">Not quite!</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">{explanation}</p>
            {moduleReference && (
              <p className="text-xs text-gray-500 mt-2">
                Review: {moduleReference}
              </p>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUESTION OF THE DAY LOGIN POPUP
// ============================================================================

interface QuestionOfTheDayPopupProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  moduleReference?: string;
  xpReward: number;
  onAnswer: (isCorrect: boolean) => void;
  onDismiss: () => void;
}

const QOTD_STORAGE_KEY = 'gcf_qotd_last_shown';

export function useQuestionOfTheDayPopup() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(QOTD_STORAGE_KEY);
    const today = new Date().toDateString();

    if (lastShown !== today) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const markAsShown = () => {
    localStorage.setItem(QOTD_STORAGE_KEY, new Date().toDateString());
    setShouldShow(false);
  };

  return { shouldShow, markAsShown };
}

export function QuestionOfTheDayPopup({
  question,
  options,
  correctIndex,
  explanation,
  moduleReference,
  xpReward,
  onAnswer,
  onDismiss
}: QuestionOfTheDayPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setShowResult(true);
    setAnswered(true);
    onAnswer(selectedIndex === correctIndex);
  };

  const handleClose = () => {
    onDismiss();
  };

  const isCorrect = selectedIndex === correctIndex;

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/90 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Question of the Day
            <Badge className="ml-auto bg-white/20 text-white border-0">
              +{xpReward} XP
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Test your knowledge and earn bonus XP
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="font-medium text-lg mb-4">{question}</p>

          <div className="space-y-2">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedIndex(idx)}
                disabled={showResult}
                className={cn(
                  "w-full p-3 rounded-lg border text-left text-sm transition-all",
                  !showResult && selectedIndex === idx && "border-violet-500 bg-violet-500/10",
                  !showResult && selectedIndex !== idx && "border-gray-200 hover:border-gray-300",
                  showResult && idx === correctIndex && "border-green-500 bg-green-50",
                  showResult && selectedIndex === idx && idx !== correctIndex && "border-red-500 bg-red-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    !showResult && selectedIndex === idx && "bg-violet-500 text-primary",
                    !showResult && selectedIndex !== idx && "bg-gray-100 text-gray-500",
                    showResult && idx === correctIndex && "bg-green-500 text-white",
                    showResult && selectedIndex === idx && idx !== correctIndex && "bg-red-500 text-white"
                  )}>
                    {showResult && idx === correctIndex ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : showResult && selectedIndex === idx ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {!showResult ? (
            <Button
              className="w-full mt-4 bg-primary"
              disabled={selectedIndex === null}
              onClick={handleSubmit}
            >
              Submit Answer
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className={cn(
                "p-3 rounded-lg mb-4",
                isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">Correct! +{xpReward} XP</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-700">Not quite</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">{explanation}</p>
                {moduleReference && (
                  <p className="text-xs text-gray-500 mt-2">
                    Review: {moduleReference}
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-primary"
                onClick={handleClose}
              >
                Continue to Training
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// XP HISTORY
// ============================================================================

interface XPHistoryItem {
  id: string;
  type: string;
  xp: number;
  description: string;
  earnedAt: Date;
}

interface XPHistoryProps {
  history?: XPHistoryItem[];
  events?: (XPEarnedEvent & { timestamp?: Date })[];
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function XPHistory({ history, events, showLoadMore, onLoadMore, className }: XPHistoryProps) {
  // Support both history (old format) and events (new format)
  const items = useMemo(() => {
    if (history && history.length > 0) {
      return history.map(h => ({
        id: h.id,
        type: h.type,
        description: h.description,
        xp: h.xp,
        earnedAt: h.earnedAt
      }));
    }
    if (events && events.length > 0) {
      return events.map((e, idx) => ({
        id: `event-${idx}`,
        type: e.type,
        description: e.description,
        xp: e.totalXP,
        earnedAt: e.timestamp || new Date()
      }));
    }
    return [];
  }, [history, events]);

  const recentHistory = items.slice(0, 10);

  const typeIcons: Record<string, React.ElementType> = {
    module_complete: Target,
    assessment_pass: Award,
    assessment_passed: Award,
    daily_challenge: Calendar,
    streak_bonus: Flame,
    achievement: Trophy,
    milestone: Trophy
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          Recent XP Earned
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentHistory.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Complete modules to earn XP!
          </p>
        ) : (
          <div className="space-y-2">
            {recentHistory.map(item => {
              const Icon = typeIcons[item.type] || Zap;
              return (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(item.earnedAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    +{item.xp}
                  </Badge>
                </div>
              );
            })}
            {showLoadMore && onLoadMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-violet-500"
                onClick={onLoadMore}
              >
                Load more
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// POINTS BREAKDOWN
// ============================================================================

interface PointsBreakdownProps {
  totalXP: number;
  moduleXP?: number;
  assessmentXP?: number;
  achievementXP?: number;
  bonusXP?: number;
  breakdown?: {
    modules?: number;
    assessments?: number;
    achievements?: number;
    dailyChallenges?: number;
    streakBonus?: number;
  };
  className?: string;
}

export function PointsBreakdown({
  totalXP,
  moduleXP,
  assessmentXP,
  achievementXP,
  bonusXP,
  breakdown,
  className
}: PointsBreakdownProps) {
  // Support both individual props and breakdown object
  const modulesValue = moduleXP ?? breakdown?.modules ?? 0;
  const assessmentsValue = assessmentXP ?? breakdown?.assessments ?? 0;
  const achievementsValue = achievementXP ?? breakdown?.achievements ?? 0;
  const dailyChallengesValue = breakdown?.dailyChallenges ?? 0;
  const streakBonusValue = breakdown?.streakBonus ?? 0;
  const bonusValue = bonusXP ?? (dailyChallengesValue + streakBonusValue);

  const categories = [
    { label: 'Modules', xp: modulesValue, color: 'bg-blue-500', icon: Target },
    { label: 'Assessments', xp: assessmentsValue, color: 'bg-purple-500', icon: Award },
    { label: 'Achievements', xp: achievementsValue, color: 'bg-amber-500', icon: Trophy },
    ...(dailyChallengesValue > 0 ? [{ label: 'Daily Challenges', xp: dailyChallengesValue, color: 'bg-orange-500', icon: Calendar }] : []),
    ...(streakBonusValue > 0 ? [{ label: 'Streak Bonus', xp: streakBonusValue, color: 'bg-red-500', icon: Flame }] : []),
    ...(bonusXP && bonusXP > 0 ? [{ label: 'Bonuses', xp: bonusXP, color: 'bg-green-500', icon: Gift }] : [])
  ].filter(c => c.xp > 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            XP Breakdown
          </CardTitle>
          <Badge className="bg-primary text-white">
            {totalXP.toLocaleString()} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map(cat => {
            const Icon = cat.icon;
            const percentage = totalXP > 0 ? (cat.xp / totalXP) * 100 : 0;
            return (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="font-medium">{cat.xp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", cat.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

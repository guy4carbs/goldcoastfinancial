/**
 * AchievementDisplay - Achievement badges, levels, and progress components
 *
 * Gamification elements for the training system including badges,
 * level progression, and unlock animations.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Star,
  Trophy,
  Medal,
  Target,
  Flame,
  Zap,
  BookOpen,
  Shield,
  GraduationCap,
  Crown,
  Lock,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Gift,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LearningMilestone,
  AdvisorLevel,
  getMilestoneById,
  getAdvisorLevel,
  calculateTotalPoints,
  LEARNING_MILESTONES
} from "@/lib/trainingInfrastructure";

// Icon mapping for milestone types
const milestoneIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  first_login: Rocket,
  first_module: BookOpen,
  first_quiz: Target,
  first_certification: GraduationCap,
  streak_3: Flame,
  streak_7: Flame,
  streak_30: Flame,
  perfect_quiz: Star,
  speed_learner: Zap,
  module_master: Trophy,
  all_certifications: Crown,
  compliance_champion: Shield,
  product_expert: Medal,
  sales_specialist: Users,
  default: Award
};

// Tier colors
const tierColors: Record<string, string> = {
  bronze: "text-amber-700 bg-amber-100 border-amber-300",
  silver: "text-gray-600 bg-gray-100 border-gray-300",
  gold: "text-yellow-600 bg-yellow-100 border-yellow-300",
  platinum: "text-cyan-600 bg-cyan-100 border-cyan-300"
};

const tierGradients: Record<string, string> = {
  bronze: "from-amber-400 to-amber-600",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-300 to-cyan-500"
};

// Level configurations
const levelConfigs: Record<AdvisorLevel, {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  minPoints: number;
  maxPoints: number;
}> = {
  newcomer: {
    label: "Newcomer",
    color: "text-gray-500 bg-gray-100",
    icon: Rocket,
    minPoints: 0,
    maxPoints: 100
  },
  apprentice: {
    label: "Apprentice",
    color: "text-green-600 bg-green-100",
    icon: BookOpen,
    minPoints: 100,
    maxPoints: 300
  },
  advisor: {
    label: "Advisor",
    color: "text-blue-600 bg-blue-100",
    icon: Shield,
    minPoints: 300,
    maxPoints: 600
  },
  senior_advisor: {
    label: "Senior Advisor",
    color: "text-purple-600 bg-purple-100",
    icon: Medal,
    minPoints: 600,
    maxPoints: 1000
  },
  expert: {
    label: "Expert",
    color: "text-amber-600 bg-amber-100",
    icon: Trophy,
    minPoints: 1000,
    maxPoints: 1500
  },
  master: {
    label: "Master",
    color: "text-primary bg-violet-500/20",
    icon: Crown,
    minPoints: 1500,
    maxPoints: 9999
  }
};

interface AchievementBadgeProps {
  milestone: LearningMilestone;
  earned?: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  milestone,
  earned = false,
  earnedAt,
  size = "md",
  showDetails = true,
  onClick,
  className
}: AchievementBadgeProps) {
  const IconComponent = milestoneIcons[milestone.id] || milestoneIcons.default;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const badge = (
    <div
      className={cn(
        "relative group",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Badge circle */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center border-2 transition-all",
          sizeClasses[size],
          earned
            ? cn(tierColors[milestone.tier], "shadow-lg")
            : "bg-gray-100 border-gray-200 opacity-50"
        )}
      >
        {earned ? (
          <IconComponent className={cn(iconSizes[size])} />
        ) : (
          <Lock className={cn(iconSizes[size], "text-gray-400")} />
        )}
      </div>

      {/* Shine effect for earned */}
      {earned && (
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-tr opacity-0 group-hover:opacity-30 transition-opacity",
          tierGradients[milestone.tier]
        )} />
      )}

      {/* Points badge */}
      {earned && size !== "sm" && (
        <div className="absolute -bottom-1 -right-1 bg-violet-500 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          +{milestone.points}
        </div>
      )}
    </div>
  );

  if (!showDetails) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="text-center">
          <p className="font-semibold">{milestone.name}</p>
          <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
          {earned && earnedAt && (
            <p className="text-[10px] text-gray-400 mt-2">
              Earned on {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
          {!earned && (
            <p className="text-[10px] text-violet-500 mt-2">
              {milestone.points} points when unlocked
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * AchievementList - Display grid of all achievements
 */
interface AchievementListProps {
  earnedMilestones?: { id: string; earnedAt: string }[];
  category?: "progress" | "mastery" | "special";
  className?: string;
}

export function AchievementList({
  earnedMilestones = [],
  category,
  className
}: AchievementListProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<LearningMilestone | null>(null);

  const milestones = category
    ? LEARNING_MILESTONES.filter(m => m.category === category)
    : LEARNING_MILESTONES;

  const earnedIds = new Set(earnedMilestones.map(e => e.id));
  const earnedCount = milestones.filter(m => earnedIds.has(m.id)).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary">Achievements</h3>
          <p className="text-sm text-gray-500">
            {earnedCount} of {milestones.length} unlocked
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {calculateTotalPoints(earnedMilestones.map(e => e.id))} pts
        </Badge>
      </div>

      {/* Progress bar */}
      <Progress value={(earnedCount / milestones.length) * 100} className="h-2" />

      {/* Badge grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {milestones.map(milestone => {
          const earnedEntry = earnedMilestones.find(e => e.id === milestone.id);
          return (
            <AchievementBadge
              key={milestone.id}
              milestone={milestone}
              earned={!!earnedEntry}
              earnedAt={earnedEntry?.earnedAt}
              size="md"
              onClick={() => setSelectedMilestone(milestone)}
            />
          );
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedMilestone && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AchievementBadge
                    milestone={selectedMilestone}
                    earned={earnedIds.has(selectedMilestone.id)}
                    size="sm"
                    showDetails={false}
                  />
                  {selectedMilestone.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-600">{selectedMilestone.description}</p>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Points Reward</span>
                  <Badge className="bg-violet-500 text-primary">
                    +{selectedMilestone.points} pts
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Tier</span>
                  <Badge className={cn("capitalize", tierColors[selectedMilestone.tier])}>
                    {selectedMilestone.tier}
                  </Badge>
                </div>

                {earnedIds.has(selectedMilestone.id) ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-700">Achievement Unlocked!</p>
                    <p className="text-sm text-green-600">
                      Earned on {new Date(
                        earnedMilestones.find(e => e.id === selectedMilestone.id)?.earnedAt || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-gray-600">Not Yet Unlocked</p>
                    <p className="text-sm text-gray-500">
                      Complete the required action to earn this badge
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * AchievementUnlocked - Celebration animation for new achievements
 */
interface AchievementUnlockedProps {
  milestone: LearningMilestone;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementUnlocked({
  milestone,
  isOpen,
  onClose
}: AchievementUnlockedProps) {
  const IconComponent = milestoneIcons[milestone.id] || milestoneIcons.default;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-visible">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative"
        >
          {/* Confetti effect */}
          <AnimatePresence>
            {isOpen && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4"][i % 4],
                      left: "50%",
                      top: "50%"
                    }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos(i * 30 * Math.PI / 180) * 100,
                      y: Math.sin(i * 30 * Math.PI / 180) * 100,
                      opacity: 0
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Achievement content */}
          <div className="text-center py-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-medium text-violet-500 uppercase tracking-wide">
                Achievement Unlocked
              </span>
              <Sparkles className="w-5 h-5 text-violet-500" />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className={cn(
                "w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 shadow-xl",
                tierColors[milestone.tier]
              )}
            >
              <IconComponent className="w-12 h-12" />
            </motion.div>

            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold text-primary mt-4"
            >
              {milestone.name}
            </motion.h3>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mt-2"
            >
              {milestone.description}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <Badge className="text-lg px-4 py-2 bg-violet-500 text-primary">
                <Gift className="w-4 h-4 mr-2" />
                +{milestone.points} Points
              </Badge>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={onClose}
                className="mt-6 bg-primary hover:bg-primary/90"
              >
                Continue Learning
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * LevelProgress - Visual level indicator with progress
 */
interface LevelProgressProps {
  currentPoints: number;
  className?: string;
}

export function LevelProgress({ currentPoints, className }: LevelProgressProps) {
  const currentLevel = getAdvisorLevel(currentPoints);
  const config = levelConfigs[currentLevel];
  const IconComponent = config.icon;

  // Calculate progress to next level
  const pointsInLevel = currentPoints - config.minPoints;
  const levelRange = config.maxPoints - config.minPoints;
  const progressPercent = Math.min((pointsInLevel / levelRange) * 100, 100);

  // Get next level info
  const levels = Object.keys(levelConfigs) as AdvisorLevel[];
  const currentIndex = levels.indexOf(currentLevel);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  const nextConfig = nextLevel ? levelConfigs[nextLevel] : null;

  return (
    <Card className={cn("border-violet-500/20", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Level badge */}
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            config.color
          )}>
            <IconComponent className="w-7 h-7" />
          </div>

          {/* Level info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-primary">
                {config.label}
              </span>
              <span className="text-sm text-gray-500">
                {currentPoints.toLocaleString()} pts
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Next level hint */}
            {nextConfig && (
              <p className="text-xs text-gray-500 mt-1">
                {config.maxPoints - currentPoints} pts to {nextConfig.label}
              </p>
            )}
            {!nextConfig && (
              <p className="text-xs text-violet-500 mt-1">
                Maximum level achieved!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * LevelBadge - Compact level indicator
 */
interface LevelBadgeProps {
  points: number;
  showPoints?: boolean;
  className?: string;
}

export function LevelBadge({ points, showPoints = false, className }: LevelBadgeProps) {
  const level = getAdvisorLevel(points);
  const config = levelConfigs[level];
  const IconComponent = config.icon;

  return (
    <Badge className={cn("gap-1", config.color, className)}>
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
      {showPoints && <span className="ml-1 opacity-70">({points})</span>}
    </Badge>
  );
}

/**
 * RecentAchievements - Shows recently earned badges
 */
interface RecentAchievementsProps {
  earnedMilestones: { id: string; earnedAt: string }[];
  limit?: number;
  className?: string;
}

export function RecentAchievements({
  earnedMilestones,
  limit = 5,
  className
}: RecentAchievementsProps) {
  // Sort by most recent
  const recent = [...earnedMilestones]
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, limit);

  if (recent.length === 0) {
    return (
      <Card className={cn("border-gray-200", className)}>
        <CardContent className="p-6 text-center text-gray-500">
          <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No achievements earned yet</p>
          <p className="text-xs mt-1">Complete modules to earn badges!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-violet-500/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-violet-500" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recent.map(entry => {
            const milestone = getMilestoneById(entry.id);
            if (!milestone) return null;

            const IconComponent = milestoneIcons[milestone.id] || milestoneIcons.default;

            return (
              <div key={entry.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  tierColors[milestone.tier]
                )}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{milestone.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.earnedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  +{milestone.points}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

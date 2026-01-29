import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target, Zap, Clock, Trophy, Phone, Users,
  CheckCircle2, Flame, Gift, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";

export interface DailyChallengeData {
  id: string;
  title: string;
  description: string;
  type: 'calls' | 'leads' | 'training' | 'streak' | 'special';
  target: number;
  current: number;
  xpReward: number;
  bonusXp?: number;
  expiresIn: string;
  completed: boolean;
}

interface DailyChallengeProps {
  challenges: DailyChallengeData[];
  className?: string;
  onClaimReward?: (challengeId: string) => void;
}

const challengeConfig = {
  calls: {
    icon: Phone,
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-primary',
    progressColor: 'bg-primary',
  },
  leads: {
    icon: Users,
    gradient: 'from-violet-500/10 to-violet-500/5',
    iconBg: 'bg-violet-500',
    progressColor: 'bg-violet-500',
  },
  training: {
    icon: Target,
    gradient: 'from-blue-500/10 to-blue-500/5',
    iconBg: 'bg-blue-500',
    progressColor: 'bg-blue-500',
  },
  streak: {
    icon: Flame,
    gradient: 'from-orange-500/10 to-orange-500/5',
    iconBg: 'bg-orange-500',
    progressColor: 'bg-orange-500',
  },
  special: {
    icon: Gift,
    gradient: 'from-purple-500/10 to-purple-500/5',
    iconBg: 'bg-purple-500',
    progressColor: 'bg-purple-500',
  },
};

export function DailyChallenge({ challenges, className, onClaimReward }: DailyChallengeProps) {
  const completedCount = challenges.filter(c => c.completed).length;
  const totalXP = challenges.reduce((acc, c) =>
    c.completed ? acc + c.xpReward + (c.bonusXp || 0) : acc, 0
  );

  return (
    <Card className={cn("overflow-hidden border-gray-100", className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 to-transparent border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center"
            >
              <Target className="w-4 h-4 text-violet-500" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-sm text-primary">Daily Challenges</h3>
              <p className="text-[10px] text-gray-500">{completedCount}/{challenges.length} completed</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 border-gray-200">
            <Clock className="w-3 h-3" />
            Resets at midnight
          </Badge>
        </div>

        {/* Total XP Earned */}
        {totalXP > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 flex items-center gap-1 text-violet-500"
          >
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-medium">{totalXP} XP earned today</span>
          </motion.div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {challenges.map((challenge, idx) => {
          const config = challengeConfig[challenge.type];
          const Icon = config.icon;
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);

          return (
            <motion.div
              key={challenge.id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative p-4 rounded-xl border overflow-hidden transition-all",
                challenge.completed
                  ? "bg-green-50 border-green-200"
                  : `bg-gradient-to-br ${config.gradient} border-gray-100 hover:border-gray-200`
              )}
            >
              {/* Completed Checkmark */}
              {challenge.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute top-3 right-3"
                >
                  <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  challenge.completed
                    ? "bg-green-500 text-white"
                    : `${config.iconBg} text-white`
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  {/* Title & Bonus */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className={cn(
                      "font-semibold text-sm text-primary",
                      challenge.completed && "line-through opacity-70"
                    )}>
                      {challenge.title}
                    </p>
                    {challenge.bonusXp && !challenge.completed && (
                      <Badge className="bg-purple-500/10 text-purple-600 text-[10px] px-1.5 py-0">
                        +{challenge.bonusXp} Bonus
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mb-3">{challenge.description}</p>

                  {/* Progress */}
                  {!challenge.completed ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">
                          {challenge.current} / {challenge.target}
                        </span>
                        <span className="text-violet-500 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          +{challenge.xpReward} XP
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={cn("h-full rounded-full", config.progressColor)}
                        />
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-green-600"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        +{challenge.xpReward + (challenge.bonusXp || 0)} XP Earned!
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* All Completed State */}
        {completedCount === challenges.length && challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-violet-500/10 to-[#E1B138]/10 rounded-xl border border-violet-500/20 text-center"
          >
            <Trophy className="w-8 h-8 text-[#E1B138] mx-auto mb-2" />
            <p className="font-semibold text-primary">All Challenges Complete!</p>
            <p className="text-xs text-gray-500">Come back tomorrow for new challenges</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyChallenge;

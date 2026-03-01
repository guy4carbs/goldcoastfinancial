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

// Unified violet/purple palette for all challenge types
const challengeConfig = {
  calls: {
    icon: Phone,
    gradient: 'from-violet-50 to-purple-50/50',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    progressColor: 'bg-gradient-to-r from-violet-500 to-purple-600',
  },
  leads: {
    icon: Users,
    gradient: 'from-violet-50 to-purple-50/50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    progressColor: 'bg-gradient-to-r from-purple-500 to-violet-600',
  },
  training: {
    icon: Target,
    gradient: 'from-violet-50 to-purple-50/50',
    iconBg: 'bg-gradient-to-br from-violet-600 to-purple-700',
    progressColor: 'bg-gradient-to-r from-violet-600 to-purple-700',
  },
  streak: {
    icon: Flame,
    gradient: 'from-amber-50 to-orange-50/50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    progressColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  special: {
    icon: Gift,
    gradient: 'from-violet-50 to-purple-50/50',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    progressColor: 'bg-gradient-to-r from-violet-500 to-purple-600',
  },
};

export function DailyChallenge({ challenges, className, onClaimReward }: DailyChallengeProps) {
  const completedCount = challenges.filter(c => c.completed).length;
  const totalXP = challenges.reduce((acc, c) =>
    c.completed ? acc + c.xpReward + (c.bonusXp || 0) : acc, 0
  );

  return (
    <Card
      className={cn("overflow-hidden border-0 relative", className)}
      style={{
        borderRadius: 24,
        boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Full gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
      {/* Decorative elements */}
      <div style={{ width: 120, height: 120 }} className="absolute top-0 right-0 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
      <div style={{ width: 80, height: 80 }} className="absolute bottom-0 left-0 bg-amber-400/15 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
      <div style={{ width: 50, height: 50 }} className="absolute top-1/2 right-1/4 bg-purple-300/10 rounded-full blur-lg" />

      {/* Header */}
      <div className="px-5 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center bg-white/20 backdrop-blur shadow-lg"
              style={{ width: 40, height: 40, borderRadius: 16 }}
            >
              <Target className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-semibold text-white" style={{ fontSize: 20 }}>Daily Challenges</h3>
              <p className="text-xs text-white/70">{completedCount}/{challenges.length} completed</p>
            </div>
          </div>
          <Badge className="text-[10px] gap-1 border-0 bg-white/15 text-white/80 backdrop-blur">
            <Clock className="w-3 h-3" />
            Resets at midnight
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3 relative z-10">
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
                "relative p-4 rounded-xl overflow-hidden transition-all backdrop-blur",
                challenge.completed
                  ? "bg-emerald-500/20 border border-emerald-400/30"
                  : "bg-white/15 border border-white/10 hover:bg-white/20"
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
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-lg",
                  challenge.completed
                    ? "bg-emerald-500/30 shadow-emerald-500/10"
                    : "bg-white/20 shadow-black/5"
                )}>
                  <Icon className="w-5 h-5 text-amber-200" />
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  {/* Title & Bonus */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className={cn(
                      "font-semibold text-sm text-white",
                      challenge.completed && "line-through opacity-70"
                    )}>
                      {challenge.title}
                    </p>
                    {challenge.bonusXp && !challenge.completed && (
                      <Badge className="bg-amber-400/20 text-amber-200 border-0 text-[10px] px-1.5 py-0">
                        +{challenge.bonusXp} Bonus
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/60 mb-3">{challenge.description}</p>

                  {/* Progress */}
                  {!challenge.completed ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60 font-medium">
                          {challenge.current} / {challenge.target}
                        </span>
                        <span className="text-amber-200 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-emerald-300"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Completed!
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
            className="p-4 bg-white/15 backdrop-blur rounded-xl border border-white/10 text-center"
          >
            <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-2" />
            <p className="font-semibold text-white">All Challenges Complete!</p>
            <p className="text-xs text-white/60">Come back tomorrow for new challenges</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyChallenge;

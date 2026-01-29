/**
 * Training Celebrations - Phase 3.3
 *
 * Milestone celebration components including:
 * - Confetti animation for certifications
 * - Achievement unlocked modal
 * - Module completion celebration
 * - Streak milestone celebration
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Award,
  Trophy,
  Star,
  Sparkles,
  CheckCircle2,
  Flame,
  Zap,
  PartyPopper,
  Share2,
  Download,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// CONFETTI ANIMATION
// ============================================================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocity: { x: number; y: number };
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  className?: string;
}

export function Confetti({
  active,
  duration = 3000,
  particleCount = 100,
  className
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const colors = [
    '#FFD700', // Gold
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
  ];

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      velocity: {
        x: (Math.random() - 0.5) * 3,
        y: 2 + Math.random() * 3
      }
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, particleCount]);

  if (pieces.length === 0) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50 overflow-hidden", className)}>
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          className="absolute"
          initial={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            rotate: piece.rotation,
            scale: piece.scale
          }}
          animate={{
            top: '120%',
            left: `${piece.x + piece.velocity.x * 30}%`,
            rotate: piece.rotation + 360 * 3,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: 'linear'
          }}
        >
          <div
            className="w-3 h-3"
            style={{
              backgroundColor: piece.color,
              clipPath: Math.random() > 0.5
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// CERTIFICATION EARNED MODAL
// ============================================================================

interface CertificationEarnedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificationName: string;
  certificationLevel: string;
  earnedDate: Date;
  onContinue: () => void;
  onViewCertificate?: () => void;
}

export function CertificationEarnedModal({
  open,
  onOpenChange,
  certificationName,
  certificationLevel,
  earnedDate,
  onContinue,
  onViewCertificate
}: CertificationEarnedModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      <Confetti active={showConfetti} particleCount={150} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
            className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg"
          >
            <Award className="w-12 h-12 text-white" />
          </motion.div>

          <DialogHeader className="pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Badge className="mx-auto bg-amber-100 text-amber-800 mb-2">
                <Sparkles className="w-3 h-3 mr-1" />
                Certification Earned
              </Badge>
              <DialogTitle className="text-2xl font-serif">
                Congratulations!
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                You've earned the <span className="font-semibold text-primary">{certificationName}</span> certification!
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="py-6"
          >
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Level</span>
                <span className="font-medium">{certificationLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Earned</span>
                <span className="font-medium">
                  {earnedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-2"
          >
            <Button
              className="bg-violet-500 text-primary hover:bg-violet-500/90"
              onClick={onContinue}
            >
              Continue Training
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            {onViewCertificate && (
              <Button variant="outline" onClick={onViewCertificate}>
                <Download className="w-4 h-4 mr-2" />
                View Certificate
              </Button>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// MODULE COMPLETED CELEBRATION
// ============================================================================

interface ModuleCompletedProps {
  show: boolean;
  moduleName: string;
  onDismiss: () => void;
  onNextModule?: () => void;
  hasNextModule: boolean;
}

export function ModuleCompletedCelebration({
  show,
  moduleName,
  onDismiss,
  onNextModule,
  hasNextModule
}: ModuleCompletedProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-green-200 p-4 flex items-center gap-4 max-w-md">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800">Module Complete!</p>
              <p className="text-sm text-gray-600 truncate">{moduleName}</p>
            </div>
            {hasNextModule && onNextModule && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={onNextModule}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// STREAK MILESTONE CELEBRATION
// ============================================================================

interface StreakMilestoneProps {
  show: boolean;
  streakDays: number;
  onDismiss: () => void;
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

export function StreakMilestoneCelebration({
  show,
  streakDays,
  onDismiss
}: StreakMilestoneProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const milestoneInfo = {
    7: { title: "Week Warrior", description: "7 days of consistent learning!", color: "from-orange-400 to-orange-600" },
    14: { title: "Two Week Champion", description: "14 days strong!", color: "from-red-400 to-red-600" },
    30: { title: "Monthly Master", description: "30 days of dedication!", color: "from-purple-400 to-purple-600" },
    60: { title: "Streak Legend", description: "60 days of excellence!", color: "from-pink-400 to-pink-600" },
    100: { title: "Century Club", description: "100 days! Incredible!", color: "from-amber-400 to-amber-600" }
  };

  const milestone = milestoneInfo[streakDays as keyof typeof milestoneInfo] || milestoneInfo[7];

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setTimeout(onDismiss, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <>
      <Confetti active={showConfetti} particleCount={80} />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onDismiss}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br",
                  milestone.color
                )}
              >
                <Flame className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mt-4">{milestone.title}</h2>
                <p className="text-gray-600 mt-2">{milestone.description}</p>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800">
                    <Flame className="w-4 h-4 mr-1" />
                    {streakDays} Day Streak
                  </Badge>
                </div>

                <Button
                  className="mt-6"
                  onClick={onDismiss}
                >
                  Keep Going!
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// ACHIEVEMENT UNLOCKED TOAST
// ============================================================================

interface AchievementUnlockedProps {
  show: boolean;
  achievement: {
    name: string;
    description: string;
    icon: React.ElementType;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onDismiss: () => void;
}

export function AchievementUnlockedToast({
  show,
  achievement,
  onDismiss
}: AchievementUnlockedProps) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600'
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl border overflow-hidden max-w-xs">
            <div className={cn(
              "h-1 bg-gradient-to-r",
              rarityColors[achievement.rarity]
            )} />
            <div className="p-4 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                  rarityColors[achievement.rarity]
                )}
              >
                <achievement.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievement Unlocked
                </p>
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-xs text-gray-500">{achievement.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

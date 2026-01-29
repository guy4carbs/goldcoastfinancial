import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overlayVariants, celebrationVariants, streakFlameVariants } from "@/lib/animations";

interface StreakCelebrationProps {
  isVisible: boolean;
  streakDays: number;
  xpBonus: number;
  onClose: () => void;
}

export function StreakCelebration({ isVisible, streakDays, xpBonus, onClose }: StreakCelebrationProps) {
  const isMilestone = streakDays % 7 === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={celebrationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-3xl p-8 max-w-sm mx-4 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>

            {/* Flame particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{
                    y: -100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="absolute bottom-0"
                  style={{ left: `${10 + i * 9}%` }}
                >
                  <Flame className="w-6 h-6 text-yellow-400/60" />
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                variants={streakFlameVariants}
                initial="idle"
                animate="burning"
                className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/50"
              >
                <Flame className="w-14 h-14 text-white fill-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-white/20 text-white">
                  {isMilestone ? "Streak Milestone!" : "Streak Extended!"}
                </span>

                <h2 className="text-5xl font-bold text-white mb-2">
                  {streakDays}
                </h2>
                <p className="text-white/90 text-lg mb-4">
                  Day Streak
                </p>

                <p className="text-white/70 mb-4">
                  {isMilestone
                    ? "Amazing! You've hit a weekly milestone!"
                    : "Keep the momentum going!"}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="font-bold text-white">+{xpBonus} XP Bonus</span>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold"
                >
                  Keep Going!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StreakCelebration;

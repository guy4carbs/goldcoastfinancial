import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overlayVariants, celebrationVariants } from "@/lib/animations";

interface LevelUpCelebrationProps {
  isVisible: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpCelebration({ isVisible, newLevel, onClose }: LevelUpCelebrationProps) {
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
            className="relative bg-gradient-to-br from-primary via-primary to-violet-500 rounded-3xl p-8 max-w-sm mx-4 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 300 - 150,
                    y: Math.random() * 300 - 150,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold uppercase tracking-wider text-sm">
                    Level Up!
                  </span>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>

                <h2 className="text-4xl font-bold text-white mb-2">
                  Level {newLevel}
                </h2>

                <p className="text-white/80 mb-6">
                  Congratulations! You've reached a new milestone.
                  Keep up the amazing work!
                </p>

                <Button
                  onClick={onClose}
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LevelUpCelebration;

import { motion, AnimatePresence } from "framer-motion";
import { Award, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { overlayVariants, celebrationVariants } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface AchievementUnlockProps {
  isVisible: boolean;
  achievement: {
    title: string;
    description: string;
    icon?: LucideIcon;
    xpReward: number;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  };
  onClose: () => void;
}

const rarityConfig = {
  common: {
    gradient: "from-gray-400 to-gray-600",
    glow: "shadow-gray-500/30",
    label: "Common",
  },
  uncommon: {
    gradient: "from-green-400 to-green-600",
    glow: "shadow-green-500/30",
    label: "Uncommon",
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/40",
    label: "Rare",
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    glow: "shadow-purple-500/50",
    label: "Epic",
  },
  legendary: {
    gradient: "from-yellow-400 to-orange-500",
    glow: "shadow-yellow-500/60",
    label: "Legendary",
  },
};

export function AchievementUnlock({ isVisible, achievement, onClose }: AchievementUnlockProps) {
  const rarity = rarityConfig[achievement.rarity];
  const Icon = achievement.icon || Award;

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
            className="relative bg-white rounded-3xl p-8 max-w-sm mx-4 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Sparkle decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
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
                className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${rarity.gradient} rounded-2xl flex items-center justify-center shadow-xl ${rarity.glow}`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-gradient-to-r ${rarity.gradient} text-white`}>
                  {rarity.label} Achievement
                </span>

                <h2 className="text-2xl font-bold text-primary mb-2">
                  {achievement.title}
                </h2>

                <p className="text-gray-600 mb-4">
                  {achievement.description}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="font-bold text-violet-500">+{achievement.xpReward} XP</span>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Awesome!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AchievementUnlock;

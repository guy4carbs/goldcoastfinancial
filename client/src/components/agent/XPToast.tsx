import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Flame, Star, Gift } from "lucide-react";
import { useEffect, useState } from "react";

interface XPToastProps {
  amount: number;
  reason?: string;
  type?: 'xp' | 'achievement' | 'streak' | 'bonus' | 'level-up';
  show: boolean;
  onComplete: () => void;
}

export function XPToast({ amount, reason, type = 'xp', show, onComplete }: XPToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'achievement': return <Trophy className="w-5 h-5" />;
      case 'streak': return <Flame className="w-5 h-5" />;
      case 'bonus': return <Gift className="w-5 h-5" />;
      case 'level-up': return <Star className="w-5 h-5" fill="currentColor" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'achievement': return 'from-secondary via-secondary to-yellow-500';
      case 'streak': return 'from-orange-500 via-red-500 to-pink-500';
      case 'bonus': return 'from-purple-500 via-pink-500 to-rose-500';
      case 'level-up': return 'from-yellow-400 via-secondary to-yellow-600';
      default: return 'from-secondary to-yellow-500';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-20 right-4 z-[100] pointer-events-none"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.div 
            className={`bg-gradient-to-r ${getGradient()} text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3`}
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(225, 177, 56, 0.3)",
                "0 0 40px rgba(225, 177, 56, 0.6)",
                "0 0 20px rgba(225, 177, 56, 0.3)"
              ]
            }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {getIcon()}
            </motion.div>
            <div>
              <motion.p 
                className="font-bold text-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                +{amount} XP
              </motion.p>
              {reason && (
                <motion.p 
                  className="text-xs opacity-90"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {reason}
                </motion.p>
              )}
            </div>
          </motion.div>
          
          <motion.div
            className="absolute -z-10 inset-0"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 1 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-secondary rounded-full"
                initial={{ 
                  x: "50%", 
                  y: "50%",
                  opacity: 1 
                }}
                animate={{ 
                  x: `${50 + Math.cos(i * 45 * Math.PI / 180) * 100}%`,
                  y: `${50 + Math.sin(i * 45 * Math.PI / 180) * 100}%`,
                  opacity: 0,
                  scale: [1, 0.5]
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LevelUpCelebration({ 
  show, 
  newLevel, 
  onComplete 
}: { 
  show: boolean; 
  newLevel: number; 
  onComplete: () => void 
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          <motion.div
            className="relative bg-gradient-to-br from-primary via-primary to-black p-8 rounded-2xl shadow-2xl text-center text-white max-w-sm mx-4"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  "0 0 30px rgba(225, 177, 56, 0.3)",
                  "0 0 60px rgba(225, 177, 56, 0.6)",
                  "0 0 30px rgba(225, 177, 56, 0.3)"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 left-1/2 -translate-x-1/2"
            >
              <Star className="w-12 h-12 text-violet-600" fill="currentColor" />
            </motion.div>
            
            <motion.p 
              className="text-violet-600 font-bold text-sm tracking-widest mb-2 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              LEVEL UP!
            </motion.p>
            
            <motion.div
              className="text-7xl font-bold font-serif mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {newLevel}
            </motion.div>
            
            <motion.p 
              className="text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Keep up the amazing work!
            </motion.p>
            
            <motion.div 
              className="mt-4 flex justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <span className="px-3 py-1 bg-violet-100 rounded-full text-violet-600 text-xs font-medium">
                +100 Bonus XP
              </span>
            </motion.div>

            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-secondary rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -50 - Math.random() * 50],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

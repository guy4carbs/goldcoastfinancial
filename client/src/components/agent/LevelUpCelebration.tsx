import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, Crown, Gift, Zap } from "lucide-react";

interface LevelUpCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  rewards?: string[];
}

const levelTitles: Record<number, { title: string; icon: React.ReactNode }> = {
  1: { title: "Newcomer", icon: <Star className="w-8 h-8 text-yellow-500" /> },
  2: { title: "Rising Star", icon: <Star className="w-8 h-8 text-yellow-500" /> },
  3: { title: "Associate Agent", icon: <Star className="w-8 h-8 text-yellow-500" /> },
  4: { title: "Senior Agent", icon: <Trophy className="w-8 h-8 text-amber-500" /> },
  5: { title: "Top Producer", icon: <Trophy className="w-8 h-8 text-amber-500" /> },
  6: { title: "Elite Agent", icon: <Crown className="w-8 h-8 text-amber-500" /> },
  7: { title: "Gold Partner", icon: <Crown className="w-8 h-8 text-yellow-500" /> },
  8: { title: "Platinum Partner", icon: <Crown className="w-8 h-8 text-slate-400" /> },
  9: { title: "Diamond Partner", icon: <Crown className="w-8 h-8 text-blue-400" /> },
  10: { title: "Legend", icon: <Crown className="w-8 h-8 text-purple-500" /> },
};

export function LevelUpCelebration({ open, onOpenChange, newLevel, rewards = [] }: LevelUpCelebrationProps) {
  const levelInfo = levelTitles[newLevel] || levelTitles[1];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden">
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: -100,
                      x: (Math.random() - 0.5) * 200 
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute"
                    style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: `${50 + Math.random() * 50}%` 
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-violet-600" />
                  </motion.div>
                ))}
              </motion.div>
              
              <DialogHeader className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-yellow-500/20 to-secondary/20 rounded-full blur-xl"
                    />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-yellow-500 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {levelInfo.icon}
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    >
                      {newLevel}
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DialogTitle className="text-2xl font-serif">Level Up!</DialogTitle>
                  <DialogDescription className="text-lg">
                    You've reached <span className="font-bold text-violet-600">{levelInfo.title}</span>
                  </DialogDescription>
                </motion.div>
              </DialogHeader>
              
              {rewards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 py-4"
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Gift className="w-4 h-4" />
                    <span>Rewards Unlocked</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {rewards.map((reward, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      >
                        <Badge variant="secondary" className="text-sm py-1">
                          <Zap className="w-3 h-3 mr-1" />
                          {reward}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  onClick={() => onOpenChange(false)} 
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                  data-testid="button-close-levelup"
                >
                  <Sparkles className="w-4 h-4" />
                  Continue Your Journey
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

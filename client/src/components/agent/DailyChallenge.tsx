import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, Zap, Clock, Trophy, Phone, Users, 
  CheckCircle2, Flame, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const getChallengeIcon = (type: DailyChallengeData['type']) => {
  switch (type) {
    case 'calls': return Phone;
    case 'leads': return Users;
    case 'streak': return Flame;
    case 'special': return Gift;
    default: return Target;
  }
};

const getChallengeGradient = (type: DailyChallengeData['type']) => {
  switch (type) {
    case 'calls': return 'from-primary/10 to-primary/5';
    case 'leads': return 'from-secondary/10 to-secondary/5';
    case 'streak': return 'from-orange-500/10 to-orange-500/5';
    case 'special': return 'from-purple-500/10 to-purple-500/5';
    default: return 'from-muted to-muted/50';
  }
};

export function DailyChallenge({ challenges, className }: DailyChallengeProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-4 py-3 bg-gradient-to-r from-secondary/10 to-transparent border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Target className="w-5 h-5 text-secondary" />
          </motion.div>
          <h3 className="font-semibold text-sm">Daily Challenges</h3>
        </div>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Clock className="w-3 h-3" />
          Resets at midnight
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        {challenges.map((challenge, idx) => {
          const Icon = getChallengeIcon(challenge.type);
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative p-4 rounded-lg border overflow-hidden",
                challenge.completed 
                  ? "bg-secondary/5 border-secondary/30" 
                  : `bg-gradient-to-br ${getChallengeGradient(challenge.type)}`
              )}
            >
              {challenge.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle2 className="w-6 h-6 text-secondary" fill="currentColor" />
                </motion.div>
              )}
              
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  challenge.completed ? "bg-secondary text-white" : "bg-white shadow-sm"
                )}>
                  <Icon className={cn("w-5 h-5", !challenge.completed && "text-primary")} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn(
                      "font-medium text-sm",
                      challenge.completed && "line-through opacity-70"
                    )}>
                      {challenge.title}
                    </p>
                    {challenge.bonusXp && !challenge.completed && (
                      <Badge className="bg-purple-500/10 text-purple-600 text-[10px] px-1.5">
                        +{challenge.bonusXp} Bonus
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
                  
                  {!challenge.completed && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {challenge.current} / {challenge.target}
                        </span>
                        <span className="text-secondary font-medium">
                          +{challenge.xpReward} XP
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                  
                  {challenge.completed && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-secondary text-sm font-medium"
                    >
                      <Zap className="w-4 h-4" />
                      +{challenge.xpReward + (challenge.bonusXp || 0)} XP Earned!
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

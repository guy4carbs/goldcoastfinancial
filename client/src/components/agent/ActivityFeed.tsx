import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Phone, Target, Star, Flame, DollarSign, 
  GraduationCap, Users, Award, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  type: 'deal' | 'call' | 'lead' | 'achievement' | 'streak' | 'training' | 'earning';
  agentName: string;
  message: string;
  timestamp: string;
  highlight?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'deal': return <Trophy className="w-4 h-4 text-secondary" />;
    case 'call': return <Phone className="w-4 h-4 text-primary" />;
    case 'lead': return <Users className="w-4 h-4 text-primary" />;
    case 'achievement': return <Award className="w-4 h-4 text-secondary" />;
    case 'streak': return <Flame className="w-4 h-4 text-orange-500" />;
    case 'training': return <GraduationCap className="w-4 h-4 text-primary" />;
    case 'earning': return <DollarSign className="w-4 h-4 text-secondary" />;
    default: return <Sparkles className="w-4 h-4 text-secondary" />;
  }
};

const getActivityBg = (type: ActivityItem['type']) => {
  switch (type) {
    case 'deal': return 'bg-secondary/10';
    case 'achievement': return 'bg-secondary/10';
    case 'earning': return 'bg-secondary/10';
    case 'streak': return 'bg-orange-500/10';
    default: return 'bg-muted/50';
  }
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              delay: idx * 0.05 
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              getActivityBg(activity.type),
              activity.highlight && "ring-1 ring-secondary/30"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-white/80 shadow-sm",
              activity.type === 'deal' && "ring-2 ring-secondary/30"
            )}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{activity.agentName}</span>{' '}
                <span className="text-muted-foreground">{activity.message}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">{activity.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ActivityTicker({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) return null;
  
  const latestActivity = activities[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent rounded-lg border border-secondary/20"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {getActivityIcon(latestActivity.type)}
      </motion.div>
      <p className="text-sm flex-1">
        <span className="font-semibold">{latestActivity.agentName}</span>{' '}
        <span className="text-muted-foreground">{latestActivity.message}</span>
      </p>
      <span className="text-[10px] text-muted-foreground">{latestActivity.timestamp}</span>
    </motion.div>
  );
}

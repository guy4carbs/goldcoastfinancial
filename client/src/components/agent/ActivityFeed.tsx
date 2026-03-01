import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Phone, Target, Star, Flame, DollarSign,
  GraduationCap, Users, Award, Sparkles, Filter, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listItemVariants, fastStaggerContainer } from "@/lib/animations";

export interface ActivityItem {
  id: string;
  type: 'deal' | 'call' | 'lead' | 'achievement' | 'streak' | 'training' | 'earning';
  agentName: string;
  message: string;
  timestamp: string;
  highlight?: boolean;
  xp?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
  showFilters?: boolean;
  maxItems?: number;
  showLiveIndicator?: boolean;
}

// Simulated new activities for live effect
const simulatedActivities: Omit<ActivityItem, 'id' | 'timestamp'>[] = [
  { type: 'deal', agentName: 'Ryan Peters', message: 'closed a $500K Term Life policy!', highlight: true },
  { type: 'call', agentName: 'Lisa Wong', message: 'completed 15 calls this hour' },
  { type: 'achievement', agentName: 'Mike Torres', message: 'unlocked "Persistence Pays" badge' },
  { type: 'lead', agentName: 'Jennifer Adams', message: 'added 3 new qualified leads' },
  { type: 'training', agentName: 'Chris Brown', message: 'passed "Advanced IUL" certification' },
  { type: 'streak', agentName: 'Amanda Lee', message: 'reached a 14-day streak!' },
];

// Unified violet/purple palette for consistent elegant styling
const activityConfig = {
  deal: {
    icon: Trophy,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    label: 'Deals'
  },
  call: {
    icon: Phone,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-200',
    label: 'Calls'
  },
  lead: {
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-200',
    label: 'Leads'
  },
  achievement: {
    icon: Award,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-200',
    label: 'Achievements'
  },
  streak: {
    icon: Flame,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    label: 'Streaks'
  },
  training: {
    icon: GraduationCap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-200',
    label: 'Training'
  },
  earning: {
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    label: 'Earnings'
  },
};

const filterOptions: Array<{ key: ActivityItem['type'] | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'deal', label: 'Deals' },
  { key: 'call', label: 'Calls' },
  { key: 'lead', label: 'Leads' },
  { key: 'achievement', label: 'Achievements' },
];

export function ActivityFeed({
  activities,
  className,
  showFilters = false,
  maxItems,
  showLiveIndicator = true
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityItem['type'] | 'all'>('all');
  const [liveActivities, setLiveActivities] = useState<ActivityItem[]>(activities);
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(true);

  // Simulate live activity updates
  useEffect(() => {
    if (!showLiveIndicator) return;

    const interval = setInterval(() => {
      const randomActivity = simulatedActivities[Math.floor(Math.random() * simulatedActivities.length)];
      const newActivity: ActivityItem = {
        ...randomActivity,
        id: `live-${Date.now()}`,
        timestamp: 'Just now',
      };

      setLiveActivities(prev => [newActivity, ...prev].slice(0, 20));
      setNewActivityIds(prev => new Set(Array.from(prev).concat(newActivity.id)));

      // Clear "new" indicator after 5 seconds
      setTimeout(() => {
        setNewActivityIds(prev => {
          const next = new Set(prev);
          next.delete(newActivity.id);
          return next;
        });
      }, 5000);
    }, 30000); // New activity every 30 seconds

    return () => clearInterval(interval);
  }, [showLiveIndicator]);

  // Merge initial activities with live ones
  useEffect(() => {
    setLiveActivities(activities);
  }, [activities]);

  const filteredActivities = liveActivities.filter(activity =>
    filter === 'all' || activity.type === filter
  );

  const displayActivities = maxItems
    ? filteredActivities.slice(0, maxItems)
    : filteredActivities;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Live Indicator */}
      {showLiveIndicator && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-gray-500"
            onClick={() => {
              const randomActivity = simulatedActivities[Math.floor(Math.random() * simulatedActivities.length)];
              const newActivity: ActivityItem = {
                ...randomActivity,
                id: `live-${Date.now()}`,
                timestamp: 'Just now',
              };
              setLiveActivities(prev => [newActivity, ...prev].slice(0, 20));
              setNewActivityIds(prev => new Set(Array.from(prev).concat(newActivity.id)));
              setTimeout(() => {
                setNewActivityIds(prev => {
                  const next = new Set(prev);
                  next.delete(newActivity.id);
                  return next;
                });
              }, 5000);
            }}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 pb-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {filterOptions.map((option) => (
            <Button
              key={option.key}
              variant={filter === option.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(option.key)}
              className={cn(
                "text-xs h-7 px-3 flex-shrink-0",
                filter === option.key
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-primary"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {/* Activity List */}
      <motion.div
        variants={fastStaggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {displayActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 text-sm"
            >
              No activities yet
            </motion.div>
          ) : (
            displayActivities.map((activity) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id}
                  variants={listItemVariants}
                  layout
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    config.bg,
                    activity.highlight && `ring-1 ${config.ring}`
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm flex-shrink-0",
                    activity.type === 'deal' && "ring-2 ring-[#E1B138]/30"
                  )}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold text-primary">{activity.agentName}</span>{' '}
                      <span className="text-gray-600">{activity.message}</span>
                      {newActivityIds.has(activity.id) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                          <Badge className="ml-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[9px] px-1.5 py-0 shadow-sm">
                            <motion.span
                              animate={{ opacity: [1, 0.7, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              NEW
                            </motion.span>
                          </Badge>
                        </motion.span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* View More */}
      {maxItems && filteredActivities.length > maxItems && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-violet-500 hover:text-primary"
        >
          View all {filteredActivities.length} activities
        </Button>
      )}
    </div>
  );
}

export function ActivityTicker({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) return null;

  const latestActivity = activities[0];
  const config = activityConfig[latestActivity.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent rounded-xl border border-violet-500/20"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.bg)}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          <span className="font-semibold text-primary">{latestActivity.agentName}</span>{' '}
          <span className="text-gray-600">{latestActivity.message}</span>
        </p>
      </div>
      <span className="text-[10px] text-gray-400 flex-shrink-0">{latestActivity.timestamp}</span>
    </motion.div>
  );
}

export default ActivityFeed;

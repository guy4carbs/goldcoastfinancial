/**
 * useOnboardingProgress - Hook for tracking and persisting onboarding task progress
 *
 * Uses localStorage for client-side persistence (no backend required)
 *
 * Provides functionality to:
 * - Track completed tasks across all onboarding days
 * - Persist progress across page refreshes and sessions
 * - Calculate XP earned and badges unlocked
 * - Track current onboarding day/phase
 */

import { useState, useEffect, useCallback, useMemo } from "react";

// Storage keys
const STORAGE_KEYS = {
  COMPLETED_TASKS: "heritage_onboarding_completed_tasks",
  TOTAL_XP: "heritage_onboarding_total_xp",
  BADGES: "heritage_onboarding_badges",
  CURRENT_DAY: "heritage_onboarding_current_day",
  START_DATE: "heritage_onboarding_start_date",
} as const;

export interface OnboardingBadge {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface OnboardingProgress {
  completedTasks: string[];
  totalXp: number;
  badges: OnboardingBadge[];
  currentDay: number;
  startDate: string | null;
}

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Badge definitions
const BADGE_DEFINITIONS = {
  "first-task": {
    id: "first-task",
    name: "First Steps",
    description: "Completed your first onboarding task",
    icon: "🎯",
  },
  "day-1-complete": {
    id: "day-1-complete",
    name: "Day 1 Champion",
    description: "Completed all Day 1 tasks",
    icon: "🏆",
  },
  "day-2-complete": {
    id: "day-2-complete",
    name: "Foundation Builder",
    description: "Completed all Day 2 tasks",
    icon: "🏗️",
  },
  "week-1-complete": {
    id: "week-1-complete",
    name: "Week 1 Graduate",
    description: "Completed your first week of onboarding",
    icon: "🎓",
  },
  "xp-500": {
    id: "xp-500",
    name: "Rising Star",
    description: "Earned 500 XP",
    icon: "⭐",
  },
  "xp-1000": {
    id: "xp-1000",
    name: "Knowledge Seeker",
    description: "Earned 1,000 XP",
    icon: "📚",
  },
  "xp-2500": {
    id: "xp-2500",
    name: "Expert in Training",
    description: "Earned 2,500 XP",
    icon: "💎",
  },
  "video-master": {
    id: "video-master",
    name: "Video Master",
    description: "Watched 10 training videos",
    icon: "🎬",
  },
  "quiz-ace": {
    id: "quiz-ace",
    name: "Quiz Ace",
    description: "Passed 5 quizzes",
    icon: "✅",
  },
} as const;

/**
 * Main hook for managing onboarding progress
 */
export function useOnboardingProgress() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [badges, setBadges] = useState<OnboardingBadge[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedTasks = safeJsonParse<string[]>(
      localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS),
      []
    );
    const storedXp = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_XP) || "0", 10);
    const storedBadges = safeJsonParse<OnboardingBadge[]>(
      localStorage.getItem(STORAGE_KEYS.BADGES),
      []
    );
    const storedDay = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_DAY) || "1", 10);
    const storedStartDate = localStorage.getItem(STORAGE_KEYS.START_DATE);

    setCompletedTasks(storedTasks);
    setTotalXp(storedXp);
    setBadges(storedBadges);
    setCurrentDay(storedDay);
    setStartDate(storedStartDate);
    setIsLoaded(true);

    // Set start date if not already set
    if (!storedStartDate) {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.START_DATE, now);
      setStartDate(now);
    }
  }, []);

  // Save completed tasks to localStorage
  const saveCompletedTasks = useCallback((tasks: string[]) => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(tasks));
  }, []);

  // Save XP to localStorage
  const saveXp = useCallback((xp: number) => {
    localStorage.setItem(STORAGE_KEYS.TOTAL_XP, xp.toString());
  }, []);

  // Save badges to localStorage
  const saveBadges = useCallback((newBadges: OnboardingBadge[]) => {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(newBadges));
  }, []);

  // Save current day to localStorage
  const saveCurrentDay = useCallback((day: number) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DAY, day.toString());
  }, []);

  // Check if a task is completed
  const isTaskCompleted = useCallback(
    (taskId: string): boolean => {
      return completedTasks.includes(taskId);
    },
    [completedTasks]
  );

  // Award a badge
  const awardBadge = useCallback(
    (badgeId: keyof typeof BADGE_DEFINITIONS) => {
      if (badges.some((b) => b.id === badgeId)) return; // Already has badge

      const badgeDef = BADGE_DEFINITIONS[badgeId];
      const newBadge: OnboardingBadge = {
        ...badgeDef,
        unlockedAt: new Date().toISOString(),
      };

      const updatedBadges = [...badges, newBadge];
      setBadges(updatedBadges);
      saveBadges(updatedBadges);

      return newBadge;
    },
    [badges, saveBadges]
  );

  // Complete a task
  const completeTask = useCallback(
    (taskId: string, xpEarned: number = 0): { newBadges: OnboardingBadge[] } => {
      if (completedTasks.includes(taskId)) {
        return { newBadges: [] }; // Already completed
      }

      const newCompletedTasks = [...completedTasks, taskId];
      const newTotalXp = totalXp + xpEarned;
      const earnedBadges: OnboardingBadge[] = [];

      // Update state
      setCompletedTasks(newCompletedTasks);
      setTotalXp(newTotalXp);

      // Persist
      saveCompletedTasks(newCompletedTasks);
      saveXp(newTotalXp);

      // Check for badge unlocks
      // First task badge
      if (newCompletedTasks.length === 1) {
        const badge = awardBadge("first-task");
        if (badge) earnedBadges.push(badge);
      }

      // XP milestones
      if (totalXp < 500 && newTotalXp >= 500) {
        const badge = awardBadge("xp-500");
        if (badge) earnedBadges.push(badge);
      }
      if (totalXp < 1000 && newTotalXp >= 1000) {
        const badge = awardBadge("xp-1000");
        if (badge) earnedBadges.push(badge);
      }
      if (totalXp < 2500 && newTotalXp >= 2500) {
        const badge = awardBadge("xp-2500");
        if (badge) earnedBadges.push(badge);
      }

      // Video master badge - awarded after completing 10 video/watch/tour tasks
      const videoKeywords = ["video", "watch", "tour"];
      const completedVideoTasks = newCompletedTasks.filter((id) =>
        videoKeywords.some((keyword) => id.toLowerCase().includes(keyword))
      );
      if (completedVideoTasks.length >= 10) {
        const badge = awardBadge("video-master");
        if (badge) earnedBadges.push(badge);
      }

      // Quiz ace badge - awarded after completing 5 quiz/assessment/exam/cert tasks
      const quizKeywords = ["quiz", "assessment", "exam", "cert"];
      const completedQuizTasks = newCompletedTasks.filter((id) =>
        quizKeywords.some((keyword) => id.toLowerCase().includes(keyword))
      );
      if (completedQuizTasks.length >= 5) {
        const badge = awardBadge("quiz-ace");
        if (badge) earnedBadges.push(badge);
      }

      return { newBadges: earnedBadges };
    },
    [completedTasks, totalXp, saveCompletedTasks, saveXp, awardBadge]
  );

  // Mark day as complete
  const markDayComplete = useCallback(
    (day: number) => {
      const badgeMap: Record<number, keyof typeof BADGE_DEFINITIONS | undefined> = {
        1: "day-1-complete",
        2: "day-2-complete",
        7: "week-1-complete",
      };

      const badgeId = badgeMap[day];
      if (badgeId) {
        awardBadge(badgeId);
      }

      // Advance to next day if completing current day
      if (day === currentDay) {
        const nextDay = day + 1;
        setCurrentDay(nextDay);
        saveCurrentDay(nextDay);
      }
    },
    [currentDay, awardBadge, saveCurrentDay]
  );

  // Get tasks completed for a specific day
  const getCompletedTasksForDay = useCallback(
    (dayTaskIds: string[]): string[] => {
      return completedTasks.filter((id) => dayTaskIds.includes(id));
    },
    [completedTasks]
  );

  // Calculate progress percentage for a list of tasks
  const getProgressPercent = useCallback(
    (taskIds: string[]): number => {
      if (taskIds.length === 0) return 0;
      const completed = taskIds.filter((id) => completedTasks.includes(id)).length;
      return Math.round((completed / taskIds.length) * 100);
    },
    [completedTasks]
  );

  // Reset all progress (for testing/demo purposes)
  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_TASKS);
    localStorage.removeItem(STORAGE_KEYS.TOTAL_XP);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DAY);
    localStorage.removeItem(STORAGE_KEYS.START_DATE);

    setCompletedTasks([]);
    setTotalXp(0);
    setBadges([]);
    setCurrentDay(1);
    setStartDate(null);
  }, []);

  // Derived values
  const progress = useMemo<OnboardingProgress>(
    () => ({
      completedTasks,
      totalXp,
      badges,
      currentDay,
      startDate,
    }),
    [completedTasks, totalXp, badges, currentDay, startDate]
  );

  return {
    // State
    progress,
    isLoaded,
    completedTasks,
    totalXp,
    badges,
    currentDay,

    // Actions
    completeTask,
    markDayComplete,
    resetProgress,

    // Queries
    isTaskCompleted,
    getCompletedTasksForDay,
    getProgressPercent,
  };
}

/**
 * Hook for managing tasks within a specific onboarding day
 * Integrates with useOnboardingProgress for persistence
 */
export function useDayProgress<T extends { id: string; xp: number; completed: boolean }>(
  dayId: string,
  initialTasks: T[]
) {
  const {
    isLoaded,
    completedTasks,
    totalXp,
    badges,
    completeTask: persistTaskCompletion,
    isTaskCompleted,
    markDayComplete,
  } = useOnboardingProgress();

  // Local task state with completed status from persistence
  const [tasks, setTasks] = useState<T[]>(initialTasks);

  // Sync local task state with persisted completion status
  useEffect(() => {
    if (!isLoaded) return;

    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        completed: isTaskCompleted(task.id),
      }))
    );
  }, [isLoaded, isTaskCompleted, completedTasks]);

  // Handle task completion - updates both local and persisted state
  const handleTaskComplete = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;

      // Update local state immediately for UI responsiveness
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );

      // Persist completion with XP
      persistTaskCompletion(taskId, task.xp);
    },
    [tasks, persistTaskCompletion]
  );

  // Check if all tasks are complete
  const allTasksComplete = useMemo(() => {
    return tasks.every((t) => t.completed);
  }, [tasks]);

  // Calculate completion stats
  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const xpEarned = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.xp, 0);
    const totalXpAvailable = tasks.reduce((sum, t) => sum + t.xp, 0);
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      remaining: total - completed,
      xpEarned,
      totalXpAvailable,
      progressPercent,
    };
  }, [tasks]);

  return {
    tasks,
    setTasks,
    handleTaskComplete,
    allTasksComplete,
    stats,
    isLoaded,
    totalXp,
    badges,
    markDayComplete,
  };
}

/**
 * Hook for managing activity-based progress (used by Days 8-30 and later pages)
 * Syncs activities with the global progress tracking
 */
export function useActivityProgress<
  T extends { title: string; xp: number; completed: boolean }
>(
  weekId: string,
  initialActivities: Record<number, { keyActivities: T[] } & Record<string, any>>
) {
  const {
    isLoaded,
    completedTasks,
    totalXp,
    completeTask,
    isTaskCompleted,
  } = useOnboardingProgress();

  // Generate unique activity ID from week and title
  const getActivityId = useCallback((week: number, title: string) => {
    return `week${week}-${title.toLowerCase().replace(/\s+/g, "-")}`;
  }, []);

  // Local activities state with completed status from persistence
  const [activities, setActivities] = useState(initialActivities);

  // Sync activities with persisted completion status
  useEffect(() => {
    if (!isLoaded) return;

    setActivities((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((weekKey) => {
        const week = parseInt(weekKey);
        updated[week] = {
          ...updated[week],
          keyActivities: updated[week].keyActivities.map((activity) => ({
            ...activity,
            completed: isTaskCompleted(getActivityId(week, activity.title)),
          })),
        };
      });
      return updated;
    });
  }, [isLoaded, isTaskCompleted, getActivityId, completedTasks]);

  // Toggle activity completion - updates both local and persisted state
  const toggleActivity = useCallback(
    (week: number, index: number) => {
      const activity = activities[week]?.keyActivities[index];
      if (!activity) return;

      const activityId = getActivityId(week, activity.title);
      const newCompleted = !activity.completed;

      // Update local state immediately for UI responsiveness
      setActivities((prev) => ({
        ...prev,
        [week]: {
          ...prev[week],
          keyActivities: prev[week].keyActivities.map((a, i) =>
            i === index ? { ...a, completed: newCompleted } : a
          ),
        },
      }));

      // Persist if marking as complete
      if (newCompleted) {
        completeTask(activityId, activity.xp);
      }
    },
    [activities, getActivityId, completeTask]
  );

  // Calculate stats across all weeks
  const stats = useMemo(() => {
    const allActivities = Object.values(activities).flatMap(
      (w) => w.keyActivities
    );
    const completed = allActivities.filter((a) => a.completed).length;
    const total = allActivities.length;
    const xpEarned = allActivities
      .filter((a) => a.completed)
      .reduce((sum, a) => sum + a.xp, 0);
    const totalXpAvailable = allActivities.reduce((sum, a) => sum + a.xp, 0);

    return {
      completed,
      total,
      remaining: total - completed,
      xpEarned,
      totalXpAvailable,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [activities]);

  return {
    activities,
    setActivities,
    toggleActivity,
    stats,
    isLoaded,
    totalXp,
    getActivityId,
  };
}

export { BADGE_DEFINITIONS };

/**
 * useTrainingProgress - Hook for tracking and persisting training module progress
 *
 * Provides functionality to:
 * - Fetch user's progress for all modules
 * - Update progress as user navigates through content
 * - Resume from last position
 * - Track time spent
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useEffect } from "react";

export interface TrainingProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
  lastPosition: {
    sectionIndex: number;
    contentIndex: number;
  } | null;
  timeSpentMinutes: number;
  createdAt: string;
  updatedAt: string;
}

interface ProgressUpdate {
  moduleId: string;
  status?: "not_started" | "in_progress" | "completed";
  progressPercent?: number;
  lastPosition?: { sectionIndex: number; contentIndex: number };
  timeSpentMinutes?: number;
}

/**
 * Hook to fetch and manage all training progress
 */
export function useTrainingProgress() {
  const queryClient = useQueryClient();

  const { data: progress, isLoading, error } = useQuery<TrainingProgress[]>({
    queryKey: ["/api/training/progress"],
    queryFn: async () => {
      const res = await fetch("/api/training/progress", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch progress");
      }
      return res.json();
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: ProgressUpdate) => {
      const res = await fetch("/api/training/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/progress"] });
    }
  });

  const getModuleProgress = useCallback(
    (moduleId: string): TrainingProgress | undefined => {
      return progress?.find((p) => p.moduleId === moduleId);
    },
    [progress]
  );

  const getCompletedModules = useCallback((): string[] => {
    return progress?.filter((p) => p.status === "completed").map((p) => p.moduleId) || [];
  }, [progress]);

  const getInProgressModules = useCallback((): string[] => {
    return progress?.filter((p) => p.status === "in_progress").map((p) => p.moduleId) || [];
  }, [progress]);

  const getTotalTimeSpent = useCallback((): number => {
    return progress?.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0) || 0;
  }, [progress]);

  return {
    progress: progress || [],
    isLoading,
    error,
    updateProgress: updateProgressMutation.mutate,
    isUpdating: updateProgressMutation.isPending,
    getModuleProgress,
    getCompletedModules,
    getInProgressModules,
    getTotalTimeSpent
  };
}

/**
 * Hook for tracking progress within a specific module
 */
export function useModuleProgress(moduleId: string) {
  const queryClient = useQueryClient();
  const startTimeRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(0);

  const { data: progress, isLoading } = useQuery<TrainingProgress | null>({
    queryKey: ["/api/training/progress", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/training/progress/${moduleId}`, {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch module progress");
      }
      return res.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<ProgressUpdate, "moduleId">) => {
      const res = await fetch("/api/training/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ moduleId, ...data })
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/progress"] });
    }
  });

  // Start tracking when module is opened
  const startModule = useCallback(() => {
    startTimeRef.current = Date.now();
    if (!progress || progress.status === "not_started") {
      updateMutation.mutate({ status: "in_progress" });
    }
  }, [progress, updateMutation]);

  // Save position as user navigates
  const savePosition = useCallback(
    (sectionIndex: number, contentIndex: number, totalSections: number) => {
      // Don't save too frequently (throttle to every 5 seconds)
      const now = Date.now();
      if (now - lastSaveRef.current < 5000) return;
      lastSaveRef.current = now;

      const timeSpent = Math.floor((now - startTimeRef.current) / 60000);
      const progressPercent = Math.round(
        ((sectionIndex * 10 + contentIndex) / (totalSections * 10)) * 100
      );

      updateMutation.mutate({
        lastPosition: { sectionIndex, contentIndex },
        progressPercent: Math.min(progressPercent, 99), // 100% only on completion
        timeSpentMinutes: (progress?.timeSpentMinutes || 0) + timeSpent
      });
    },
    [progress, updateMutation]
  );

  // Mark module as completed
  const completeModule = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 60000);
    updateMutation.mutate({
      status: "completed",
      progressPercent: 100,
      timeSpentMinutes: (progress?.timeSpentMinutes || 0) + timeSpent
    });
  }, [progress, updateMutation]);

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (progress?.status === "in_progress") {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 60000);
        if (timeSpent > 0) {
          // Fire and forget - don't await
          fetch("/api/training/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              moduleId,
              timeSpentMinutes: (progress?.timeSpentMinutes || 0) + timeSpent
            })
          }).catch(() => {
            // Ignore errors on unmount
          });
        }
      }
    };
  }, [moduleId, progress]);

  return {
    progress,
    isLoading,
    startModule,
    savePosition,
    completeModule,
    isUpdating: updateMutation.isPending,
    // Resume info
    canResume: progress?.status === "in_progress" && progress.lastPosition !== null,
    resumePosition: progress?.lastPosition
  };
}

/**
 * Hook for fetching assessment history
 */
export function useAssessmentHistory() {
  const { data: history, isLoading, error } = useQuery<AssessmentResult[]>({
    queryKey: ["/api/training/assessments/history"],
    queryFn: async () => {
      const res = await fetch("/api/training/assessments/history", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch assessment history");
      }
      return res.json();
    }
  });

  const getAssessmentAttempts = useCallback(
    (assessmentId: string): AssessmentResult[] => {
      return history?.filter((h) => h.assessmentId === assessmentId) || [];
    },
    [history]
  );

  const getBestScore = useCallback(
    (assessmentId: string): number | null => {
      const attempts = getAssessmentAttempts(assessmentId);
      if (attempts.length === 0) return null;
      return Math.max(...attempts.map((a) => a.score));
    },
    [getAssessmentAttempts]
  );

  const hasPassed = useCallback(
    (assessmentId: string): boolean => {
      const attempts = getAssessmentAttempts(assessmentId);
      return attempts.some((a) => a.passed && !a.autoFailed);
    },
    [getAssessmentAttempts]
  );

  return {
    history: history || [],
    isLoading,
    error,
    getAssessmentAttempts,
    getBestScore,
    hasPassed
  };
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  passed: boolean;
  autoFailed: boolean;
  autoFailReason: string | null;
  timeSpentMinutes: number | null;
  attemptNumber: number;
  answers: Record<string, unknown> | null;
  completedAt: string;
}

/**
 * Hook for submitting assessment results
 */
export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      assessmentId: string;
      score: number;
      passed: boolean;
      autoFailed?: boolean;
      autoFailReason?: string;
      timeSpentMinutes?: number;
      answers?: Record<string, unknown>;
    }) => {
      const res = await fetch("/api/training/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit assessment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/assessments/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training/xp/total"] });
    }
  });
}

/**
 * Hook for fetching XP data
 */
export function useTrainingXp() {
  const { data: totalXp, isLoading: loadingTotal } = useQuery<{ totalXp: number }>({
    queryKey: ["/api/training/xp/total"],
    queryFn: async () => {
      const res = await fetch("/api/training/xp/total", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return { totalXp: 0 };
        throw new Error("Failed to fetch XP");
      }
      return res.json();
    }
  });

  const { data: history, isLoading: loadingHistory } = useQuery<XpTransaction[]>({
    queryKey: ["/api/training/xp/history"],
    queryFn: async () => {
      const res = await fetch("/api/training/xp/history", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch XP history");
      }
      return res.json();
    }
  });

  return {
    totalXp: totalXp?.totalXp || 0,
    history: history || [],
    isLoading: loadingTotal || loadingHistory
  };
}

interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceType: string | null;
  sourceId: string | null;
  createdAt: string;
}

/**
 * Hook for fetching training summary
 */
export function useTrainingSummary() {
  const { data, isLoading, error } = useQuery<TrainingSummary>({
    queryKey: ["/api/training/summary"],
    queryFn: async () => {
      const res = await fetch("/api/training/summary", {
        credentials: "include"
      });
      if (!res.ok) {
        if (res.status === 401)
          return {
            modules: { completed: 0, inProgress: 0, total: 0 },
            assessments: { passed: 0, total: 0, averageScore: 0 },
            simulations: { passed: 0, total: 0 },
            certificates: 0,
            totalXp: 0
          };
        throw new Error("Failed to fetch summary");
      }
      return res.json();
    }
  });

  return {
    summary: data,
    isLoading,
    error
  };
}

interface TrainingSummary {
  modules: {
    completed: number;
    inProgress: number;
    total: number;
  };
  assessments: {
    passed: number;
    total: number;
    averageScore: number;
  };
  simulations: {
    passed: number;
    total: number;
  };
  certificates: number;
  totalXp: number;
}

/**
 * AssessmentTimer - Countdown timer for timed assessments
 *
 * Features:
 * - Visual countdown with progress ring
 * - Warning states at 5min and 1min
 * - Auto-submit callback when time expires
 * - Pause capability (for accessibility)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Clock, AlertTriangle, Pause, Play, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentTimerProps {
  /** Total time limit in minutes */
  timeLimitMinutes: number;
  /** Callback when time expires */
  onTimeUp: () => void;
  /** Optional callback on each second tick */
  onTick?: (remainingSeconds: number) => void;
  /** Whether the timer is paused */
  isPaused?: boolean;
  /** Show compact version */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

export function AssessmentTimer({
  timeLimitMinutes,
  onTimeUp,
  onTick,
  isPaused = false,
  compact = false,
  className
}: AssessmentTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitMinutes * 60);
  const [showWarning, setShowWarning] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeUp = useRef(false);

  // Calculate warning thresholds
  const fiveMinWarning = 5 * 60;
  const oneMinWarning = 60;

  // Calculate progress percentage
  const totalSeconds = timeLimitMinutes * 60;
  const progressPercent = (remainingSeconds / totalSeconds) * 100;

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine color based on remaining time
  const getTimerColor = () => {
    if (remainingSeconds <= oneMinWarning) return "text-red-600";
    if (remainingSeconds <= fiveMinWarning) return "text-amber-600";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (remainingSeconds <= oneMinWarning) return "stroke-red-500";
    if (remainingSeconds <= fiveMinWarning) return "stroke-amber-500";
    return "stroke-violet-500";
  };

  // Timer logic
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;

        // Trigger tick callback
        if (onTick) onTick(newValue);

        // Show warnings
        if (newValue === fiveMinWarning || newValue === oneMinWarning) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
        }

        // Handle time up
        if (newValue <= 0 && !hasCalledTimeUp.current) {
          hasCalledTimeUp.current = true;
          setShowTimeUpDialog(true);
          return 0;
        }

        return Math.max(0, newValue);
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, onTick]);

  // Handle time up confirmation
  const handleTimeUpConfirm = () => {
    setShowTimeUpDialog(false);
    onTimeUp();
  };

  if (compact) {
    return (
      <>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border",
            remainingSeconds <= oneMinWarning
              ? "bg-red-50 border-red-200"
              : remainingSeconds <= fiveMinWarning
              ? "bg-amber-50 border-amber-200"
              : "bg-gray-50 border-gray-200",
            className
          )}
        >
          <Timer className={cn("w-4 h-4", getTimerColor())} />
          <span className={cn("font-mono font-bold text-sm", getTimerColor())}>
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Warning toast */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50"
            >
              <Card
                className={cn(
                  "border-2",
                  remainingSeconds <= oneMinWarning
                    ? "border-red-300 bg-red-50"
                    : "border-amber-300 bg-amber-50"
                )}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle
                    className={cn(
                      "w-5 h-5",
                      remainingSeconds <= oneMinWarning
                        ? "text-red-600"
                        : "text-amber-600"
                    )}
                  />
                  <div>
                    <p className="font-medium">
                      {remainingSeconds <= oneMinWarning
                        ? "1 minute remaining!"
                        : "5 minutes remaining"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {remainingSeconds <= oneMinWarning
                        ? "Complete your assessment now"
                        : "Consider wrapping up soon"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time up dialog */}
        <Dialog open={showTimeUpDialog} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Clock className="w-5 h-5" />
                Time's Up!
              </DialogTitle>
              <DialogDescription>
                Your assessment time has expired. Your answers will be submitted
                automatically.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleTimeUpConfirm} className="w-full">
                Submit Assessment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full timer display
  return (
    <>
      <Card className={cn("border-violet-500/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  className={getProgressColor()}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 1.76} 176`}
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              </svg>
              {/* Timer icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Timer className={cn("w-6 h-6", getTimerColor())} />
              </div>
            </div>

            {/* Time display */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn("font-mono text-2xl font-bold", getTimerColor())}
                >
                  {formatTime(remainingSeconds)}
                </span>
                {isPaused && (
                  <Badge variant="outline" className="text-xs">
                    Paused
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {remainingSeconds <= oneMinWarning
                  ? "Time almost up!"
                  : remainingSeconds <= fiveMinWarning
                  ? "Less than 5 minutes"
                  : "Time remaining"}
              </p>
            </div>
          </div>

          {/* Warning banner */}
          <AnimatePresence>
            {remainingSeconds <= oneMinWarning && remainingSeconds > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-sm text-red-700 font-medium">
                    Submit now to save your progress!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Time up dialog */}
      <Dialog open={showTimeUpDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Clock className="w-5 h-5" />
              Time's Up!
            </DialogTitle>
            <DialogDescription>
              Your assessment time has expired. Your answers will be submitted
              automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTimeUpConfirm} className="w-full">
              Submit Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Hook for managing assessment timer state
 */
export function useAssessmentTimer(timeLimitMinutes: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const getElapsedMinutes = useCallback(() => {
    return Math.floor((Date.now() - startTimeRef.current) / 60000);
  }, []);

  const handleTick = useCallback((seconds: number) => {
    setRemainingSeconds(seconds);
    if (seconds <= 0) {
      setIsExpired(true);
    }
  }, []);

  return {
    remainingSeconds,
    isPaused,
    isExpired,
    pause,
    resume,
    getElapsedMinutes,
    handleTick
  };
}

/**
 * Spaced Repetition System - Phase 5.2
 *
 * Learning retention components:
 * - SmartReviewQueue: Content to review based on forgetting curve
 * - RetentionQuiz: Micro-quizzes on completed modules
 * - KnowledgeDecayAlert: Notifications for topics needing refresh
 * - ReviewScheduleCard: Upcoming review schedule
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Zap,
  ChevronRight,
  Play,
  RotateCcw,
  TrendingDown,
  Lightbulb,
  Timer,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  topic: string;
  lastReviewed: Date;
  nextReviewDate: Date;
  strength: number; // 0-100, represents retention strength
  reviewCount: number;
  category: string;
}

export interface RetentionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  moduleId: string;
  topic: string;
}

// ============================================================================
// FORGETTING CURVE UTILITIES
// ============================================================================

/**
 * Calculate retention strength based on time since last review
 * Uses Ebbinghaus forgetting curve approximation
 */
function calculateRetention(lastReviewed: Date, reviewCount: number): number {
  const daysSinceReview = Math.floor(
    (Date.now() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Base retention decays over time, but improves with more reviews
  const stabilityFactor = Math.min(reviewCount * 1.5, 10); // Max 10x stability
  const retention = 100 * Math.exp(-daysSinceReview / (3 * stabilityFactor));

  return Math.max(0, Math.min(100, Math.round(retention)));
}

/**
 * Calculate next optimal review date
 */
function calculateNextReview(lastReviewed: Date, reviewCount: number): Date {
  // Intervals increase with each successful review
  const intervals = [1, 3, 7, 14, 30, 60, 90]; // days
  const intervalIndex = Math.min(reviewCount, intervals.length - 1);
  const daysUntilNext = intervals[intervalIndex];

  const nextDate = new Date(lastReviewed);
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  return nextDate;
}

// ============================================================================
// SMART REVIEW QUEUE
// ============================================================================

interface SmartReviewQueueProps {
  items: ReviewItem[];
  onStartReview: (item: ReviewItem) => void;
  onViewAll?: () => void;
  className?: string;
}

export function SmartReviewQueue({
  items,
  onStartReview,
  onViewAll,
  className
}: SmartReviewQueueProps) {
  // Calculate current retention for all items
  const itemsWithRetention = useMemo(() => {
    return items.map(item => ({
      ...item,
      currentRetention: calculateRetention(item.lastReviewed, item.reviewCount),
      isOverdue: new Date() > item.nextReviewDate
    })).sort((a, b) => {
      // Sort by: overdue first, then by lowest retention
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.currentRetention - b.currentRetention;
    });
  }, [items]);

  const dueForReview = itemsWithRetention.filter(
    i => i.isOverdue || i.currentRetention < 70
  );
  const displayItems = dueForReview.slice(0, 5);

  const getRetentionColor = (retention: number) => {
    if (retention >= 80) return { bg: "bg-green-100", text: "text-green-700", icon: "text-green-500" };
    if (retention >= 50) return { bg: "bg-amber-100", text: "text-amber-700", icon: "text-amber-500" };
    return { bg: "bg-red-100", text: "text-red-700", icon: "text-red-500" };
  };

  const formatDaysAgo = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            Smart Review Queue
          </CardTitle>
          {dueForReview.length > 0 && (
            <Badge className="bg-purple-100 text-purple-700">
              {dueForReview.length} due
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">All caught up!</p>
            <p className="text-xs text-gray-500">No reviews due right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => {
              const colors = getRetentionColor(item.currentRetention);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-50",
                    item.isOverdue && "border-l-4 border-red-400"
                  )}
                  onClick={() => onStartReview(item)}
                >
                  {/* Retention indicator */}
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0",
                    colors.bg
                  )}>
                    <span className={cn("text-lg font-bold", colors.text)}>
                      {item.currentRetention}%
                    </span>
                    <TrendingDown className={cn("w-3 h-3", colors.icon)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.topic}</p>
                    <p className="text-xs text-gray-500">{item.moduleTitle}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Last reviewed: {formatDaysAgo(item.lastReviewed)}
                    </p>
                  </div>

                  {/* Action */}
                  <Button size="sm" variant="ghost" className="text-purple-600">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}

            {onViewAll && dueForReview.length > 5 && (
              <Button
                variant="ghost"
                className="w-full text-purple-600"
                onClick={onViewAll}
              >
                View all {dueForReview.length} items
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RETENTION QUIZ
// ============================================================================

interface RetentionQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: RetentionQuestion[];
  moduleTitle: string;
  onComplete: (results: { correct: number; total: number; answers: boolean[] }) => void;
}

export function RetentionQuiz({
  open,
  onOpenChange,
  questions,
  moduleTitle,
  onComplete
}: RetentionQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswers([]);
    }
  }, [open]);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    setAnswers(prev => [...prev, isCorrect]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalAnswers = [...answers, isCorrect];
      const correct = finalAnswers.filter(Boolean).length;
      onComplete({ correct, total: questions.length, answers: finalAnswers });
      onOpenChange(false);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  if (!currentQuestion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-100 text-purple-700">
              <Brain className="w-3 h-3 mr-1" />
              Retention Quiz
            </Badge>
            <Badge variant="outline">
              {currentIndex + 1}/{questions.length}
            </Badge>
          </div>
          <DialogTitle className="text-lg">{moduleTitle}</DialogTitle>
          <DialogDescription>
            Quick review to reinforce your learning
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress bar */}
          <Progress
            value={((currentIndex + 1) / questions.length) * 100}
            className="h-1 mb-6"
          />

          {/* Question */}
          <p className="font-medium mb-4">{currentQuestion.question}</p>

          {/* Options */}
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(val) => !showResult && setSelectedAnswer(parseInt(val))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  showResult && idx === currentQuestion.correctIndex && "bg-green-50 border-green-300",
                  showResult && idx === selectedAnswer && idx !== currentQuestion.correctIndex && "bg-red-50 border-red-300",
                  !showResult && selectedAnswer === idx && "border-purple-300 bg-purple-50",
                  !showResult && "hover:bg-gray-50 cursor-pointer"
                )}
              >
                <RadioGroupItem
                  value={idx.toString()}
                  id={`option-${idx}`}
                  disabled={showResult}
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option}
                </Label>
                {showResult && idx === currentQuestion.correctIndex && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {showResult && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "mt-4 p-4 rounded-lg",
                  isCorrect ? "bg-green-50" : "bg-amber-50"
                )}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className={cn(
                    "w-5 h-5 flex-shrink-0 mt-0.5",
                    isCorrect ? "text-green-600" : "text-amber-600"
                  )} />
                  <div>
                    <p className={cn(
                      "font-medium text-sm mb-1",
                      isCorrect ? "text-green-700" : "text-amber-700"
                    )}>
                      {isCorrect ? "Correct!" : "Not quite right"}
                    </p>
                    <p className="text-sm text-gray-600">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
              {isLastQuestion ? "Complete" : "Next Question"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// KNOWLEDGE DECAY ALERT
// ============================================================================

interface KnowledgeDecayAlertProps {
  show: boolean;
  topics: Array<{
    topic: string;
    moduleTitle: string;
    retention: number;
    daysOverdue: number;
  }>;
  onDismiss: () => void;
  onStartReview: () => void;
}

export function KnowledgeDecayAlert({
  show,
  topics,
  onDismiss,
  onStartReview
}: KnowledgeDecayAlertProps) {
  if (!show || topics.length === 0) return null;

  const criticalCount = topics.filter(t => t.retention < 40).length;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card className="border-amber-300 bg-amber-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800">Knowledge Decay Alert</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {criticalCount > 0 ? (
                      <>{criticalCount} topic{criticalCount > 1 ? 's' : ''} critically need review</>
                    ) : (
                      <>{topics.length} topic{topics.length > 1 ? 's' : ''} due for review</>
                    )}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={onStartReview}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Review Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-700"
                      onClick={onDismiss}
                    >
                      Later
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// REVIEW SCHEDULE CARD
// ============================================================================

interface ScheduledReview {
  date: Date;
  items: Array<{
    id: string;
    topic: string;
    moduleTitle: string;
  }>;
}

interface ReviewScheduleCardProps {
  schedule: ScheduledReview[];
  className?: string;
}

export function ReviewScheduleCard({ schedule, className }: ReviewScheduleCardProps) {
  const upcomingDays = schedule.slice(0, 7);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const totalUpcoming = upcomingDays.reduce((acc, day) => acc + day.items.length, 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            Review Schedule
          </CardTitle>
          <Badge variant="outline">{totalUpcoming} upcoming</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingDays.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No reviews scheduled
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingDays.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={cn(
                  "w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0",
                  idx === 0 ? "bg-purple-100" : "bg-gray-100"
                )}>
                  <span className={cn(
                    "text-lg font-bold",
                    idx === 0 ? "text-purple-700" : "text-gray-600"
                  )}>
                    {day.items.length}
                  </span>
                  <span className="text-[10px] text-gray-500">items</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    idx === 0 && "text-purple-700"
                  )}>
                    {formatDate(day.date)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {day.items.map(i => i.topic).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUICK REVIEW BUTTON
// ============================================================================

interface QuickReviewButtonProps {
  dueCount: number;
  onStart: () => void;
  className?: string;
}

export function QuickReviewButton({ dueCount, onStart, className }: QuickReviewButtonProps) {
  if (dueCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={className}
    >
      <Button
        onClick={onStart}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
      >
        <Brain className="w-4 h-4 mr-2" />
        Quick Review ({dueCount})
        <Play className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

/**
 * AssessmentScoreReport - Detailed score breakdown and remediation paths
 *
 * Shows:
 * - Overall score with pass/fail status
 * - Category-by-category breakdown
 * - Question review with correct answers
 * - Time analysis
 * - Remediation suggestions for weak areas
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  ChevronRight,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionResult {
  questionId: string;
  questionText: string;
  category: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  explanation?: string;
  timeSpentSeconds?: number;
}

interface CategoryScore {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

interface AssessmentScoreReportProps {
  assessmentTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  autoFailed?: boolean;
  autoFailReason?: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  timeLimitMinutes?: number;
  questionResults: QuestionResult[];
  attemptNumber: number;
  onRetry?: () => void;
  onReview?: () => void;
  onContinue?: () => void;
  className?: string;
}

// Module suggestions based on category
const categoryModuleSuggestions: Record<string, { moduleId: string; title: string }[]> = {
  compliance: [
    { moduleId: "mod-compliance-intro", title: "Compliance Fundamentals" },
    { moduleId: "mod-disclosure", title: "Proper Disclosure" },
    { moduleId: "mod-suitability-defense", title: "Suitability Defense" }
  ],
  product: [
    { moduleId: "mod-product-term", title: "Term Life Products" },
    { moduleId: "mod-product-iul", title: "IUL Products" },
    { moduleId: "mod-product-fe", title: "Final Expense" },
    { moduleId: "mod-product-annuity", title: "Annuities" }
  ],
  sales: [
    { moduleId: "mod-sales-needs", title: "Needs Analysis" },
    { moduleId: "mod-sales-objections", title: "Objection Handling" },
    { moduleId: "mod-education-call", title: "Education Call Framework" }
  ],
  underwriting: [
    { moduleId: "mod-underwriting-basics", title: "Underwriting Basics" }
  ],
  regulatory: [
    { moduleId: "mod-state-regulations", title: "State Regulations" }
  ],
  doctrine: [
    { moduleId: "mod-philosophy", title: "Company Philosophy" },
    { moduleId: "mod-standards", title: "Advisor Standards" }
  ]
};

export function AssessmentScoreReport({
  assessmentTitle,
  score,
  passingScore,
  passed,
  autoFailed,
  autoFailReason,
  totalQuestions,
  correctAnswers,
  timeSpentMinutes,
  timeLimitMinutes,
  questionResults,
  attemptNumber,
  onRetry,
  onReview,
  onContinue,
  className
}: AssessmentScoreReportProps) {
  // Calculate category scores
  const categoryScores = useMemo(() => {
    const categories: Record<string, { correct: number; total: number }> = {};

    questionResults.forEach((q) => {
      if (!categories[q.category]) {
        categories[q.category] = { correct: 0, total: 0 };
      }
      categories[q.category].total++;
      if (q.isCorrect) categories[q.category].correct++;
    });

    return Object.entries(categories)
      .map(([category, data]) => ({
        category,
        correct: data.correct,
        total: data.total,
        percentage: Math.round((data.correct / data.total) * 100)
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, [questionResults]);

  // Find weak categories (below 70%)
  const weakCategories = categoryScores.filter((c) => c.percentage < 70);

  // Get remediation suggestions
  const remediationSuggestions = useMemo(() => {
    const suggestions: { moduleId: string; title: string; category: string }[] = [];

    weakCategories.forEach((weak) => {
      const categoryKey = weak.category.toLowerCase();
      const modules = categoryModuleSuggestions[categoryKey] || [];
      modules.slice(0, 2).forEach((mod) => {
        suggestions.push({ ...mod, category: weak.category });
      });
    });

    return suggestions.slice(0, 4);
  }, [weakCategories]);

  // Calculate average time per question
  const avgTimePerQuestion = useMemo(() => {
    const questionsWithTime = questionResults.filter((q) => q.timeSpentSeconds);
    if (questionsWithTime.length === 0) return null;
    const total = questionsWithTime.reduce(
      (sum, q) => sum + (q.timeSpentSeconds || 0),
      0
    );
    return Math.round(total / questionsWithTime.length);
  }, [questionResults]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Score Card */}
      <Card
        className={cn(
          "border-2 overflow-hidden",
          passed
            ? "border-green-200"
            : autoFailed
            ? "border-red-300"
            : "border-amber-200"
        )}
      >
        {/* Header Banner */}
        <div
          className={cn(
            "px-6 py-4",
            passed
              ? "bg-green-50"
              : autoFailed
              ? "bg-red-50"
              : "bg-amber-50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {passed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
              ) : autoFailed ? (
                <AlertTriangle className="w-10 h-10 text-red-600" />
              ) : (
                <XCircle className="w-10 h-10 text-amber-600" />
              )}
              <div>
                <h2
                  className={cn(
                    "text-xl font-bold",
                    passed
                      ? "text-green-700"
                      : autoFailed
                      ? "text-red-700"
                      : "text-amber-700"
                  )}
                >
                  {passed ? "Congratulations!" : autoFailed ? "Auto-Failed" : "Not Passed"}
                </h2>
                <p className="text-sm text-gray-600">{assessmentTitle}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-lg px-4 py-1",
                passed
                  ? "border-green-300 text-green-700"
                  : autoFailed
                  ? "border-red-300 text-red-700"
                  : "border-amber-300 text-amber-700"
              )}
            >
              {score}%
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Auto-fail reason */}
          {autoFailed && autoFailReason && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Critical Failure</p>
                  <p className="text-sm text-red-600 mt-1">{autoFailReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Target className="w-5 h-5 mx-auto text-violet-500 mb-1" />
              <p className="text-2xl font-bold text-primary">
                {correctAnswers}/{totalQuestions}
              </p>
              <p className="text-xs text-gray-500">Correct Answers</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 mx-auto text-violet-500 mb-1" />
              <p className="text-2xl font-bold text-primary">
                {timeSpentMinutes}
                <span className="text-sm font-normal text-gray-500">
                  {timeLimitMinutes && ` / ${timeLimitMinutes}`}
                </span>
              </p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <RefreshCw className="w-5 h-5 mx-auto text-violet-500 mb-1" />
              <p className="text-2xl font-bold text-primary">
                {attemptNumber}
              </p>
              <p className="text-xs text-gray-500">Attempt #</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Your Score</span>
              <span>Passing: {passingScore}%</span>
            </div>
            <div className="relative">
              <Progress value={score} className="h-3" />
              {/* Passing threshold marker */}
              <div
                className="absolute top-0 h-3 w-0.5 bg-gray-800"
                style={{ left: `${passingScore}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!passed && onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {onReview && (
              <Button
                variant={passed ? "default" : "outline"}
                onClick={onReview}
                className="flex-1"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Review Answers
              </Button>
            )}
            {passed && onContinue && (
              <Button onClick={onContinue} className="flex-1">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            Performance by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryScores.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium capitalize">
                    {cat.category}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      cat.percentage >= 80
                        ? "text-green-600"
                        : cat.percentage >= 70
                        ? "text-amber-600"
                        : "text-red-600"
                    )}
                  >
                    {cat.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={cat.percentage}
                    className={cn(
                      "h-2 flex-1",
                      cat.percentage >= 80
                        ? "[&>div]:bg-green-500"
                        : cat.percentage >= 70
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-red-500"
                    )}
                  />
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {cat.correct}/{cat.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remediation Suggestions */}
      {!passed && remediationSuggestions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Recommended Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Based on your results, we recommend reviewing these modules before
              retrying:
            </p>
            <div className="space-y-2">
              {remediationSuggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <BookOpen className="w-4 h-4 mr-2 text-violet-500" />
                  <span className="flex-1 text-left">{suggestion.title}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {suggestion.category}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-500" />
            Question Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {questionResults.map((q, idx) => (
              <AccordionItem
                key={q.questionId}
                value={q.questionId}
                className={cn(
                  "border rounded-lg px-4",
                  q.isCorrect
                    ? "border-green-200 bg-green-50/30"
                    : "border-red-200 bg-red-50/30"
                )}
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {q.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <span className="text-sm font-medium">
                        Question {idx + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px] capitalize"
                      >
                        {q.category}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3 pl-8">
                    <p className="text-sm text-gray-700">{q.questionText}</p>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-500 w-20">
                          Your answer:
                        </span>
                        <span
                          className={cn(
                            "text-sm",
                            q.isCorrect ? "text-green-700" : "text-red-700"
                          )}
                        >
                          {Array.isArray(q.userAnswer)
                            ? q.userAnswer.join(", ")
                            : q.userAnswer}
                        </span>
                      </div>
                      {!q.isCorrect && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-gray-500 w-20">
                            Correct:
                          </span>
                          <span className="text-sm text-green-700">
                            {Array.isArray(q.correctAnswer)
                              ? q.correctAnswer.join(", ")
                              : q.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-700 mb-1">
                          Explanation:
                        </p>
                        <p className="text-sm text-blue-800">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Time Analysis (if data available) */}
      {avgTimePerQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-500" />
              Time Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {timeSpentMinutes}
                  <span className="text-sm font-normal text-gray-500">min</span>
                </p>
                <p className="text-xs text-gray-500">Total Time</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {avgTimePerQuestion}
                  <span className="text-sm font-normal text-gray-500">sec</span>
                </p>
                <p className="text-xs text-gray-500">Avg per Question</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

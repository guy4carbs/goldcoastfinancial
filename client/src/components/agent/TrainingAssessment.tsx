/**
 * TrainingAssessment - Heritage Design System Enhanced
 *
 * A premium quiz/assessment component with:
 * - Heritage brand colors (violet → purple → amber)
 * - Smooth Framer Motion animations
 * - Glass morphism effects
 * - Consistent design system tokens
 */

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Award,
  Shield,
  BookOpen,
  RotateCcw,
  Sparkles,
  Zap,
  Trophy,
  Target,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assessment, AssessmentQuestion } from "@/lib/trainingData";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
} from "@/lib/heritageDesignSystem";

interface TrainingAssessmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment;
  onComplete: (result: AssessmentResult) => void;
  attemptNumber: number;
  /** When true, renders without Dialog wrapper for embedding in other modals */
  inline?: boolean;
}

export interface AssessmentResult {
  assessmentId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  autoFailed: boolean;
  autoFailQuestion?: string;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedOptions: string[];
    correct: boolean;
  }[];
}

interface QuestionState {
  questionId: string;
  selectedOptions: string[];
  answered: boolean;
}

// Gradient Progress Bar Component
function GradientProgress({ value }: { value: number }) {
  return (
    <div
      className="w-full bg-gray-100 overflow-hidden relative"
      style={{ height: 8, borderRadius: RADIUS.pill }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="h-full relative"
        style={{
          background: `linear-gradient(90deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.purple[500]} 50%, ${COLORS.accent.amber[500]} 100%)`,
          borderRadius: RADIUS.pill,
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
}

export function TrainingAssessment({
  open,
  onOpenChange,
  assessment,
  onComplete,
  attemptNumber,
  inline = false,
}: TrainingAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shuffle questions if required
  const questions = useMemo(() => {
    const qs = [...assessment.questions];
    if (assessment.shuffleQuestions) {
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
    }
    return qs;
  }, [assessment]);

  // Initialize question states
  useState(() => {
    setQuestionStates(
      questions.map(q => ({
        questionId: q.id,
        selectedOptions: [],
        answered: false
      }))
    );
  });

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex] || {
    questionId: currentQuestion?.id,
    selectedOptions: [],
    answered: false
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = questionStates.filter(s => s.answered).length;

  const handleOptionSelect = useCallback((optionId: string) => {
    setQuestionStates(prev => {
      const newStates = [...prev];
      const stateIndex = newStates.findIndex(s => s.questionId === currentQuestion.id);

      if (stateIndex === -1) {
        newStates.push({
          questionId: currentQuestion.id,
          selectedOptions: [optionId],
          answered: true
        });
      } else {
        if (currentQuestion.type === 'select_all') {
          // Toggle for multi-select
          const current = newStates[stateIndex].selectedOptions;
          if (current.includes(optionId)) {
            newStates[stateIndex] = {
              ...newStates[stateIndex],
              selectedOptions: current.filter(id => id !== optionId),
              answered: current.filter(id => id !== optionId).length > 0
            };
          } else {
            newStates[stateIndex] = {
              ...newStates[stateIndex],
              selectedOptions: [...current, optionId],
              answered: true
            };
          }
        } else {
          // Single select
          newStates[stateIndex] = {
            ...newStates[stateIndex],
            selectedOptions: [optionId],
            answered: true
          };
        }
      }

      return newStates;
    });
  }, [currentQuestion]);

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResult = useCallback((): AssessmentResult => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60);
    let correctAnswers = 0;
    let autoFailed = false;
    let autoFailQuestion: string | undefined;

    const answers = questions.map(question => {
      const state = questionStates.find(s => s.questionId === question.id);
      const selectedOptions = state?.selectedOptions || [];

      // Determine if answer is correct
      let correct = false;
      if (question.type === 'select_all') {
        const correctOptionIds = question.options
          .filter(o => o.isCorrect)
          .map(o => o.id);
        correct =
          selectedOptions.length === correctOptionIds.length &&
          selectedOptions.every(id => correctOptionIds.includes(id));
      } else {
        const correctOption = question.options.find(o => o.isCorrect);
        correct = selectedOptions.length === 1 && selectedOptions[0] === correctOption?.id;
      }

      if (correct) {
        correctAnswers++;
      } else if (question.autoFailOnIncorrect || assessment.autoFailQuestions.includes(question.id)) {
        autoFailed = true;
        autoFailQuestion = question.id;
      }

      return {
        questionId: question.id,
        selectedOptions,
        correct
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = !autoFailed && score >= assessment.passingScore;

    return {
      assessmentId: assessment.id,
      score,
      passed,
      totalQuestions: questions.length,
      correctAnswers,
      autoFailed,
      autoFailQuestion,
      timeSpent,
      answers
    };
  }, [questions, questionStates, assessment, startTime]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    const assessmentResult = calculateResult();
    setResult(assessmentResult);
    setShowResults(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  const handleClose = () => {
    if (result) {
      onComplete(result);
    }
    onOpenChange(false);
    // Reset state
    setCurrentQuestionIndex(0);
    setQuestionStates([]);
    setShowResults(false);
    setResult(null);
  };

  const getQuestionIcon = (type: AssessmentQuestion['type']) => {
    switch (type) {
      case 'scenario':
        return <FileText className="w-4 h-4" />;
      case 'select_all':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Results view
  if (showResults && result) {
    const failedQuestion = result.autoFailQuestion
      ? questions.find(q => q.id === result.autoFailQuestion)
      : null;

    const resultsContent = (
      <div
        className={cn(
          "overflow-y-auto",
          !inline && "max-w-2xl max-h-[90vh]"
        )}
        style={{ borderRadius: inline ? 0 : RADIUS.hero }}
      >
          {/* Results Header */}
          <div
            className={cn(
              "relative overflow-hidden text-white",
              result.passed
                ? "bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500"
                : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"
            )}
            style={{ padding: GRID.spacing.lg }}
          >
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                backgroundSize: '16px 16px',
              }}
            />
            {/* Decorative blurs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto mb-4 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                {result.passed ? (
                  <Trophy className="w-10 h-10 text-amber-300" />
                ) : (
                  <Target className="w-10 h-10 text-white/70" />
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-2"
              >
                {result.passed ? 'Assessment Passed!' : 'Keep Practicing'}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold">{result.score}%</div>
                  <div className="text-white/70 text-sm">Your Score</div>
                </div>
                <div className="w-px h-12 bg-white/30" />
                <div className="text-center">
                  <div className="text-2xl font-semibold">{assessment.passingScore}%</div>
                  <div className="text-white/70 text-sm">Required</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Results Content */}
          <div style={{ padding: GRID.spacing.md }} className="space-y-4">
            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { label: "Correct", value: result.correctAnswers, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                { label: "Incorrect", value: result.totalQuestions - result.correctAnswers, icon: XCircle, color: "text-red-500 bg-red-50" },
                { label: "Time", value: `${result.timeSpent}m`, icon: Clock, color: "text-violet-600 bg-violet-50" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn("p-3 rounded-xl text-center", stat.color.split(' ')[1])}
                >
                  <stat.icon className={cn("w-5 h-5 mx-auto mb-1", stat.color.split(' ')[0])} />
                  <div className={cn("text-xl font-bold", stat.color.split(' ')[0])}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Auto-fail warning */}
            {result.autoFailed && failedQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertTitle className="text-red-800">Critical Question Missed</AlertTitle>
                  <AlertDescription className="text-red-700">
                    You answered a critical compliance question incorrectly. This question requires mastery for certification.
                    <div className="mt-2 p-3 bg-red-100 rounded-lg text-sm">
                      <strong>Question:</strong> {failedQuestion.question}
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Attempt info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">Attempt {attemptNumber} of {assessment.maxAttempts}</p>
                <p className="text-xs text-gray-500">
                  {assessment.maxAttempts - attemptNumber} attempts remaining
                </p>
              </div>
              {!result.passed && attemptNumber < assessment.maxAttempts && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  Retry Available
                </Badge>
              )}
            </motion.div>

            {/* Answer Review */}
            {assessment.showCorrectAnswers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                  Answer Review
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {questions.map((question, idx) => {
                    const answer = result.answers.find(a => a.questionId === question.id);
                    return (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.05 }}
                        className={cn(
                          "p-3 rounded-xl border",
                          answer?.correct
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {answer?.correct ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">
                              {idx + 1}. {question.question}
                            </p>
                            {!answer?.correct && question.incorrectFeedback && (
                              <p className="text-xs text-gray-600 mt-1">
                                {question.incorrectFeedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Next steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-end gap-3 pt-4 border-t"
            >
              {!result.passed && attemptNumber < assessment.maxAttempts ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    Review Material
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setCurrentQuestionIndex(0);
                      setQuestionStates([]);
                      setResult(null);
                    }}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Assessment
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleClose}
                  className={cn(
                    "text-white",
                    result.passed
                      ? "bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:opacity-90"
                      : "bg-gray-600 hover:bg-gray-700"
                  )}
                  style={{ borderRadius: RADIUS.button }}
                >
                  {result.passed && <Sparkles className="w-4 h-4 mr-2" />}
                  {result.passed ? 'Continue' : 'Close'}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
    );

    // Wrap in Dialog if not inline
    if (inline) {
      return resultsContent;
    }

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0"
          style={{ borderRadius: RADIUS.hero }}
        >
          {resultsContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Question view content
  const questionContent = (
    <div
      className={cn(
        "flex flex-col",
        inline ? "h-full" : "max-w-3xl max-h-[90vh] overflow-hidden"
      )}
      style={{ borderRadius: inline ? 0 : RADIUS.hero }}
    >
        {/* Header */}
        <div
          className="flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 text-white"
          style={{ padding: GRID.spacing.md }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: '12px 12px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold" style={{ fontSize: TYPE.body }}>{assessment.title}</h2>
                  <p className="text-white/70 text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length} • {answeredCount} answered
                  </p>
                </div>
              </div>
              {assessment.timeLimit > 0 && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </Badge>
              )}
            </div>

            {/* Progress bar */}
            <GradientProgress value={progress} />
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: GRID.spacing.md }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question header badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge className="bg-violet-100 text-violet-700 border-0">
                  {getQuestionIcon(currentQuestion.type)}
                  <span className="ml-1">{currentQuestion.category}</span>
                </Badge>
                {(currentQuestion.autoFailOnIncorrect || assessment.autoFailQuestions.includes(currentQuestion.id)) && (
                  <Badge className="bg-red-100 text-red-700 border-0">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Critical
                  </Badge>
                )}
                <Badge className="bg-gray-100 text-gray-600 border-0">
                  Level {currentQuestion.difficultyLevel}
                </Badge>
              </div>

              {/* Scenario (if applicable) */}
              {currentQuestion.scenario && (
                <Card
                  className="mb-4 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-800 mb-1">Scenario</p>
                        <p className="text-sm text-violet-700">{currentQuestion.scenario}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question text */}
              <p className="text-lg font-medium text-gray-800 mb-6" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                {currentQuestion.question}
              </p>

              {/* Options */}
              {currentQuestion.type === 'select_all' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Select all that apply
                  </p>
                  {currentQuestion.options.map((option, idx) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        currentState.selectedOptions.includes(option.id)
                          ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
                          : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
                      )}
                      onClick={() => handleOptionSelect(option.id)}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Checkbox
                        checked={currentState.selectedOptions.includes(option.id)}
                        className={cn(
                          "mt-0.5 border-2",
                          currentState.selectedOptions.includes(option.id)
                            ? "border-violet-500 bg-violet-500 text-white"
                            : "border-gray-300"
                        )}
                      />
                      <span className="text-sm text-gray-700">{option.text}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={currentState.selectedOptions[0] || ''}
                  onValueChange={handleOptionSelect}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        currentState.selectedOptions[0] === option.id
                          ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
                          : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
                      )}
                      onClick={() => handleOptionSelect(option.id)}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <RadioGroupItem
                        value={option.id}
                        className={cn(
                          "mt-0.5 border-2",
                          currentState.selectedOptions[0] === option.id
                            ? "border-violet-500 text-violet-500"
                            : "border-gray-300"
                        )}
                      />
                      <Label className="text-sm text-gray-700 cursor-pointer flex-1">
                        {option.text}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div
          className="flex-shrink-0 flex items-center justify-between border-t bg-gray-50"
          style={{ padding: GRID.spacing.md }}
        >
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            style={{ borderRadius: RADIUS.button }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => {
              const state = questionStates[idx];
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "rounded-full transition-all",
                    idx === currentQuestionIndex
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 w-6 h-3"
                      : state?.answered
                      ? "bg-emerald-500 w-3 h-3"
                      : "bg-gray-300 w-3 h-3 hover:bg-gray-400"
                  )}
                  onClick={() => setCurrentQuestionIndex(idx)}
                />
              );
            })}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length || isSubmitting}
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:opacity-90 text-white shadow-lg shadow-violet-500/25"
              style={{ borderRadius: RADIUS.button }}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNext}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              style={{ borderRadius: RADIUS.button }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
  );

  // Wrap in Dialog if not inline
  if (inline) {
    return questionContent;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-0"
        style={{ borderRadius: RADIUS.hero }}
      >
        {questionContent}
      </DialogContent>
    </Dialog>
  );
}

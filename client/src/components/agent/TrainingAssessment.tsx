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
import { Progress } from "@/components/ui/progress";
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
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Assessment, AssessmentQuestion } from "@/lib/trainingData";

interface TrainingAssessmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment;
  onComplete: (result: AssessmentResult) => void;
  attemptNumber: number;
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

export function TrainingAssessment({
  open,
  onOpenChange,
  assessment,
  onComplete,
  attemptNumber
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

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result.passed ? (
                <>
                  <Award className="w-6 h-6 text-green-600" />
                  Assessment Passed
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  Assessment Not Passed
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Score Summary */}
            <Card className={cn(
              "border-2",
              result.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Your Score</p>
                    <p className={cn(
                      "text-4xl font-bold",
                      result.passed ? "text-green-600" : "text-red-600"
                    )}>
                      {result.score}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Required</p>
                    <p className="text-2xl font-semibold text-gray-700">
                      {assessment.passingScore}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{result.correctAnswers}</p>
                    <p className="text-xs text-gray-500">Correct</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{result.totalQuestions - result.correctAnswers}</p>
                    <p className="text-xs text-gray-500">Incorrect</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{result.timeSpent}m</p>
                    <p className="text-xs text-gray-500">Time Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-fail warning */}
            {result.autoFailed && failedQuestion && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Critical Question Missed</AlertTitle>
                <AlertDescription>
                  You answered a critical compliance question incorrectly. This question is marked as
                  auto-fail because understanding this concept is essential for certification.
                  <div className="mt-2 p-3 bg-red-100 rounded text-sm">
                    <strong>Question:</strong> {failedQuestion.question}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Attempt info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Attempt {attemptNumber} of {assessment.maxAttempts}</p>
                <p className="text-xs text-gray-500">
                  {assessment.maxAttempts - attemptNumber} attempts remaining
                </p>
              </div>
              {!result.passed && attemptNumber < assessment.maxAttempts && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Retry Available
                </Badge>
              )}
            </div>

            {/* Answer Review */}
            {assessment.showCorrectAnswers && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Answer Review</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {questions.map((question, idx) => {
                    const answer = result.answers.find(a => a.questionId === question.id);
                    return (
                      <div
                        key={question.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          answer?.correct
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {answer?.correct ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">
                              {idx + 1}. {question.question}
                            </p>
                            {!answer?.correct && (
                              <p className="text-xs text-gray-600 mt-1">
                                {question.incorrectFeedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {!result.passed && attemptNumber < assessment.maxAttempts ? (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    Review Material
                  </Button>
                  <Button onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setQuestionStates([]);
                    setResult(null);
                  }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Assessment
                  </Button>
                </>
              ) : (
                <Button onClick={handleClose}>
                  {result.passed ? 'Continue' : 'Close'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Question view
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {assessment.title}
            </span>
            {assessment.timeLimit > 0 && (
              <Badge variant="outline" className="ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Question {currentQuestionIndex + 1} of {questions.length} • {answeredCount} answered
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex-shrink-0 py-2">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  currentQuestion.type === 'scenario' ? "bg-purple-100" : "bg-primary/10"
                )}>
                  {getQuestionIcon(currentQuestion.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {currentQuestion.category}
                    </Badge>
                    {(currentQuestion.autoFailOnIncorrect || assessment.autoFailQuestions.includes(currentQuestion.id)) && (
                      <Badge variant="destructive" className="text-[10px]">
                        Critical
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      Level {currentQuestion.difficultyLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scenario (if applicable) */}
              {currentQuestion.scenario && (
                <Card className="mb-4 bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-purple-800 mb-1">Scenario:</p>
                    <p className="text-sm text-purple-700">{currentQuestion.scenario}</p>
                  </CardContent>
                </Card>
              )}

              {/* Question text */}
              <p className="text-lg font-medium text-gray-800 mb-6">
                {currentQuestion.question}
              </p>

              {/* Options */}
              {currentQuestion.type === 'select_all' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">Select all that apply:</p>
                  {currentQuestion.options.map(option => (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        currentState.selectedOptions.includes(option.id)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <Checkbox
                        checked={currentState.selectedOptions.includes(option.id)}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-gray-700">{option.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={currentState.selectedOptions[0] || ''}
                  onValueChange={handleOptionSelect}
                  className="space-y-3"
                >
                  {currentQuestion.options.map(option => (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        currentState.selectedOptions[0] === option.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <RadioGroupItem value={option.id} className="mt-0.5" />
                      <Label className="text-sm text-gray-700 cursor-pointer flex-1">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question dots */}
          <div className="flex items-center gap-1">
            {questions.map((_, idx) => {
              const state = questionStates[idx];
              return (
                <button
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    idx === currentQuestionIndex
                      ? "bg-primary w-4"
                      : state?.answered
                      ? "bg-green-500"
                      : "bg-gray-300"
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
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          ) : (
            <Button onClick={goToNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

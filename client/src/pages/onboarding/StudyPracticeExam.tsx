import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives/AgentPageHero";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Brain,
  FileText,
  Target,
  TrendingUp,
  RotateCcw,
  PlayCircle,
  Flag,
  AlertCircle,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  fadeInUp,
  staggerContainer,
} from "@/lib/heritageDesignSystem";

// Practice exam questions organized by category
const EXAM_QUESTIONS = [
  {
    id: 1,
    category: "Policy Types",
    question: "Which type of life insurance provides coverage for a specific period and does NOT accumulate cash value?",
    options: [
      "Whole Life Insurance",
      "Term Life Insurance",
      "Universal Life Insurance",
      "Variable Life Insurance",
    ],
    correctAnswer: 1,
    explanation: "Term life insurance provides coverage for a specific term (e.g., 10, 20, or 30 years) and does not build cash value. It's often the most affordable type of life insurance.",
  },
  {
    id: 2,
    category: "Underwriting",
    question: "What is the primary purpose of underwriting in life insurance?",
    options: [
      "To calculate the agent's commission",
      "To assess and classify the risk of insuring an applicant",
      "To determine the policy's cash value",
      "To process claims after death",
    ],
    correctAnswer: 1,
    explanation: "Underwriting evaluates the risk of insuring an applicant based on factors like health, age, occupation, and lifestyle to determine appropriate premiums.",
  },
  {
    id: 3,
    category: "Policy Components",
    question: "Which policy rider allows the policyholder to purchase additional coverage without providing evidence of insurability?",
    options: [
      "Waiver of Premium Rider",
      "Accidental Death Benefit Rider",
      "Guaranteed Insurability Rider",
      "Long-Term Care Rider",
    ],
    correctAnswer: 2,
    explanation: "The Guaranteed Insurability Rider (GIR) allows policyholders to purchase additional coverage at specified intervals without a medical exam.",
  },
  {
    id: 4,
    category: "Policy Types",
    question: "What distinguishes Universal Life insurance from Whole Life insurance?",
    options: [
      "Universal Life has no death benefit",
      "Universal Life offers flexible premiums and death benefits",
      "Universal Life cannot accumulate cash value",
      "Universal Life is only available to seniors",
    ],
    correctAnswer: 1,
    explanation: "Universal Life offers flexible premiums and adjustable death benefits, unlike Whole Life which has fixed premiums and death benefits.",
  },
  {
    id: 5,
    category: "Beneficiaries",
    question: "If a policyholder names 'my estate' as the beneficiary, what potential issue may arise?",
    options: [
      "The death benefit will be paid immediately",
      "The proceeds may be subject to estate taxes and probate",
      "The policy becomes void",
      "The premium will decrease",
    ],
    correctAnswer: 1,
    explanation: "Naming an estate as beneficiary subjects the death benefit to probate and potential estate taxes, delaying distribution and reducing the amount received.",
  },
  {
    id: 6,
    category: "Premiums",
    question: "Which factor does NOT typically affect life insurance premium calculations?",
    options: [
      "Age of the applicant",
      "Health history",
      "Education level",
      "Tobacco use",
    ],
    correctAnswer: 2,
    explanation: "Education level is not a typical factor in premium calculations. Age, health, and tobacco use are primary factors affecting premiums.",
  },
  {
    id: 7,
    category: "Cash Value",
    question: "What happens to the cash value of a whole life policy when the policyholder dies?",
    options: [
      "It is paid in addition to the death benefit",
      "It is returned to the insurance company",
      "It becomes part of the death benefit",
      "It is donated to charity",
    ],
    correctAnswer: 2,
    explanation: "The cash value of a whole life policy becomes part of the death benefit upon the policyholder's death. Beneficiaries receive the death benefit, not the cash value separately.",
  },
  {
    id: 8,
    category: "Regulations",
    question: "What is the purpose of the contestability period in life insurance?",
    options: [
      "To allow the policyholder to cancel without penalty",
      "To give the insurer time to investigate potential fraud or misrepresentation",
      "To calculate the correct premium amount",
      "To determine the agent's commission",
    ],
    correctAnswer: 1,
    explanation: "The contestability period (typically 2 years) allows insurers to investigate and potentially deny claims if material misrepresentation is discovered on the application.",
  },
  {
    id: 9,
    category: "Policy Components",
    question: "What is the 'free look' period in life insurance?",
    options: [
      "A period where no premium is required",
      "Time allowed to review and cancel a policy with a full refund",
      "A grace period for late payments",
      "Time to add additional riders",
    ],
    correctAnswer: 1,
    explanation: "The free look period (typically 10-30 days) allows policyholders to review their policy and cancel for a full refund if not satisfied.",
  },
  {
    id: 10,
    category: "Sales Ethics",
    question: "When is it appropriate for an agent to replace an existing life insurance policy?",
    options: [
      "Whenever the agent will earn a higher commission",
      "When it genuinely benefits the client after thorough comparison",
      "When the client hasn't paid premiums in the last month",
      "When the existing policy has accumulated cash value",
    ],
    correctAnswer: 1,
    explanation: "Policy replacement should only occur when it genuinely benefits the client. Agents must provide full disclosure and compare both policies' features and costs.",
  },
  {
    id: 11,
    category: "Policy Types",
    question: "What is Indexed Universal Life (IUL) insurance primarily linked to?",
    options: [
      "Real estate market performance",
      "Stock market index performance",
      "Government bond yields",
      "Cryptocurrency values",
    ],
    correctAnswer: 1,
    explanation: "IUL policies tie cash value growth to stock market index performance (like the S&P 500) while providing downside protection through a floor rate.",
  },
  {
    id: 12,
    category: "Claims",
    question: "What is the typical time frame for an insurance company to pay a death benefit claim?",
    options: [
      "Within 24 hours",
      "Within 30-60 days of receiving complete documentation",
      "Within 6 months",
      "Within 1 year",
    ],
    correctAnswer: 1,
    explanation: "Most insurers process death benefit claims within 30-60 days of receiving complete documentation, though simple claims may be paid faster.",
  },
  {
    id: 13,
    category: "Underwriting",
    question: "What does 'rated' or 'substandard' risk classification mean?",
    options: [
      "The applicant receives the lowest premium",
      "The applicant poses higher risk and pays higher premiums",
      "The policy has been cancelled",
      "The applicant is eligible for additional coverage",
    ],
    correctAnswer: 1,
    explanation: "A rated or substandard risk classification means the applicant poses higher-than-average risk (often due to health issues) and will pay higher premiums.",
  },
  {
    id: 14,
    category: "Beneficiaries",
    question: "What is the difference between a primary and contingent beneficiary?",
    options: [
      "Primary beneficiaries must be family members",
      "Contingent beneficiaries receive proceeds only if the primary beneficiary cannot",
      "Primary beneficiaries receive less money",
      "Contingent beneficiaries must be named first",
    ],
    correctAnswer: 1,
    explanation: "Primary beneficiaries are first in line to receive death benefits. Contingent beneficiaries only receive proceeds if the primary beneficiary is deceased or cannot be located.",
  },
  {
    id: 15,
    category: "Policy Components",
    question: "What does the 'grace period' provision in a life insurance policy allow?",
    options: [
      "Extra time to file a claim",
      "Time to pay overdue premiums without policy lapse",
      "Additional time to add beneficiaries",
      "Extended coverage during hospitalization",
    ],
    correctAnswer: 1,
    explanation: "The grace period (typically 30-31 days) allows policyholders to pay overdue premiums and maintain coverage without the policy lapsing.",
  },
  {
    id: 16,
    category: "Cash Value",
    question: "What is a policy loan in life insurance?",
    options: [
      "A loan the insurer takes from the policy",
      "A loan the policyholder takes against the policy's cash value",
      "A loan to pay for additional coverage",
      "A loan from a bank using the policy as collateral",
    ],
    correctAnswer: 1,
    explanation: "A policy loan allows the policyholder to borrow against the accumulated cash value of a permanent life insurance policy at favorable interest rates.",
  },
  {
    id: 17,
    category: "Regulations",
    question: "What is the primary purpose of state insurance department regulations?",
    options: [
      "To increase insurance company profits",
      "To protect consumers and ensure fair practices",
      "To reduce the number of insurance agents",
      "To set uniform national standards",
    ],
    correctAnswer: 1,
    explanation: "State insurance departments regulate the industry to protect consumers, ensure company solvency, and maintain fair and ethical business practices.",
  },
  {
    id: 18,
    category: "Sales Ethics",
    question: "What is 'twisting' in insurance?",
    options: [
      "A legitimate sales technique",
      "Misrepresenting policy features to induce a replacement",
      "Combining multiple policies",
      "Changing beneficiaries frequently",
    ],
    correctAnswer: 1,
    explanation: "Twisting is an illegal practice where an agent misrepresents policy features to convince a client to replace an existing policy, typically for commission purposes.",
  },
  {
    id: 19,
    category: "Policy Types",
    question: "What type of insurance is typically used to cover final expenses and burial costs?",
    options: [
      "Term Life Insurance",
      "Final Expense/Burial Insurance",
      "Variable Life Insurance",
      "Group Life Insurance",
    ],
    correctAnswer: 1,
    explanation: "Final Expense or Burial Insurance is a type of whole life policy with smaller face amounts designed specifically to cover funeral costs and final expenses.",
  },
  {
    id: 20,
    category: "Premiums",
    question: "What is a 'waiver of premium' rider?",
    options: [
      "A discount on premiums for good health",
      "Waives premium payments if the insured becomes disabled",
      "Eliminates all future premium payments",
      "Allows premium payments to be made annually",
    ],
    correctAnswer: 1,
    explanation: "The Waiver of Premium rider waives premium payments if the insured becomes totally disabled, keeping the policy in force without payment during the disability.",
  },
];

type ExamMode = "not-started" | "in-progress" | "review" | "completed";

interface AnswerRecord {
  questionId: number;
  selectedAnswer: number | null;
  isCorrect: boolean;
  flagged: boolean;
}

export default function StudyPracticeExam() {
  const [examMode, setExamMode] = useState<ExamMode>("not-started");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = EXAM_QUESTIONS[currentQuestionIndex];
  const totalQuestions = EXAM_QUESTIONS.length;

  // Timer effect
  useEffect(() => {
    if (examMode !== "in-progress") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setExamMode("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startExam = () => {
    setExamMode("in-progress");
    setCurrentQuestionIndex(0);
    setAnswers(
      EXAM_QUESTIONS.map((q) => ({
        questionId: q.id,
        selectedAnswer: null,
        isCorrect: false,
        flagged: false,
      }))
    );
    setTimeRemaining(40 * 60);
    setShowExplanation(false);
  };

  const selectAnswer = (answerIndex: number) => {
    if (examMode !== "in-progress") return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      selectedAnswer: answerIndex,
      isCorrect: answerIndex === currentQuestion.correctAnswer,
    };
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      flagged: !newAnswers[currentQuestionIndex].flagged,
    };
    setAnswers(newAnswers);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  const submitExam = () => {
    setExamMode("completed");
  };

  const reviewExam = () => {
    setExamMode("review");
    setCurrentQuestionIndex(0);
  };

  const retakeExam = () => {
    startExam();
  };

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= 70;

  const answeredCount = answers.filter((a) => a.selectedAnswer !== null).length;
  const flaggedCount = answers.filter((a) => a.flagged).length;

  // Get category stats for results
  const getCategoryStats = () => {
    const stats: Record<string, { correct: number; total: number }> = {};
    EXAM_QUESTIONS.forEach((q, idx) => {
      if (!stats[q.category]) {
        stats[q.category] = { correct: 0, total: 0 };
      }
      stats[q.category].total++;
      if (answers[idx]?.isCorrect) {
        stats[q.category].correct++;
      }
    });
    return stats;
  };

  return (
    <OnboardingLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Hero Section */}
        <AgentPageHero
          icon={FileText}
          title="Practice Licensing Exam"
          subtitle="Simulate the real exam experience -- timed, scored, and reviewed"
        >
          {examMode === "in-progress" && (
            <div className="flex items-center gap-4">
              <div className={cn(
                "bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center",
                timeRemaining < 300 && "bg-red-500/30 animate-pulse"
              )}>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white" />
                  <p className="text-2xl font-bold text-white">{formatTime(timeRemaining)}</p>
                </div>
                <p className="text-white/70 text-xs">Remaining</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-white">{answeredCount}/{totalQuestions}</p>
                <p className="text-white/70 text-xs">Answered</p>
              </div>
            </div>
          )}

          {examMode === "completed" && (
            <div className="flex items-center gap-4">
              <div className={cn(
                "backdrop-blur-sm rounded-xl px-6 py-4 text-center",
                passed ? "bg-emerald-500/30" : "bg-red-500/30"
              )}>
                <p className="text-4xl font-bold text-white">{score}%</p>
                <p className="text-white/70 text-sm">{passed ? "Passing Score" : "Below 70% -- Review & Retry"}</p>
              </div>
            </div>
          )}
        </AgentPageHero>

        {/* Back Navigation */}
        <Link href="/agents/onboarding/study/course">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-violet-600">
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </Button>
        </Link>

        {/* Not Started State */}
        {examMode === "not-started" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
              <CardContent className="p-8">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">See Where You Stand</h2>
                  <p className="text-gray-600 mb-8">
                    {totalQuestions} multiple-choice questions across every major topic.
                    You have 40 minutes. Score 70% or higher to pass. You can flag questions and come back to them, and you can retake the exam as many times as you need.
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Brain className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">{totalQuestions}</p>
                      <p className="text-sm text-gray-500">Questions</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Clock className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">40 min</p>
                      <p className="text-sm text-gray-500">Time Allowed</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <Award className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">70%</p>
                      <p className="text-sm text-gray-500">To Pass</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={startExam}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Begin Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* In Progress State */}
        {(examMode === "in-progress" || examMode === "review") && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Navigator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-1"
            >
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Question Navigator
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {EXAM_QUESTIONS.map((_, idx) => {
                      const answer = answers[idx];
                      const isCurrent = idx === currentQuestionIndex;
                      const isAnswered = answer?.selectedAnswer !== null;
                      const isFlagged = answer?.flagged;
                      const isCorrect = answer?.isCorrect;

                      return (
                        <button
                          key={idx}
                          onClick={() => goToQuestion(idx)}
                          className={cn(
                            "w-10 h-10 rounded-lg text-sm font-medium transition-all relative",
                            isCurrent && "ring-2 ring-violet-500 ring-offset-2",
                            examMode === "review"
                              ? isCorrect
                                ? "bg-emerald-100 text-emerald-700"
                                : isAnswered
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-500"
                              : isAnswered
                                ? "bg-violet-100 text-violet-700"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          )}
                        >
                          {idx + 1}
                          {isFlagged && (
                            <Flag className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded bg-violet-100" />
                      <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded bg-gray-100" />
                      <span className="text-gray-600">Unanswered</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Flag className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-600">Flagged ({flaggedCount})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Question Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3"
            >
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {currentQuestion.category}
                      </Badge>
                    </div>
                    {examMode === "in-progress" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "gap-1.5",
                          answers[currentQuestionIndex]?.flagged && "bg-amber-50 border-amber-200 text-amber-700"
                        )}
                        onClick={toggleFlag}
                      >
                        <Flag className="w-4 h-4" />
                        {answers[currentQuestionIndex]?.flagged ? "Flagged" : "Flag"}
                      </Button>
                    )}
                  </div>

                  {/* Question */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = answers[currentQuestionIndex]?.selectedAnswer === idx;
                      const isCorrectAnswer = idx === currentQuestion.correctAnswer;
                      const showResult = examMode === "review";

                      return (
                        <button
                          key={idx}
                          disabled={examMode === "review"}
                          onClick={() => selectAnswer(idx)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                            examMode === "in-progress" && !isSelected && "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50",
                            examMode === "in-progress" && isSelected && "border-violet-500 bg-violet-50",
                            showResult && isCorrectAnswer && "border-emerald-500 bg-emerald-50",
                            showResult && isSelected && !isCorrectAnswer && "border-red-500 bg-red-50"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-medium",
                            !showResult && !isSelected && "bg-gray-100 text-gray-600",
                            !showResult && isSelected && "bg-violet-500 text-white",
                            showResult && isCorrectAnswer && "bg-emerald-500 text-white",
                            showResult && isSelected && !isCorrectAnswer && "bg-red-500 text-white"
                          )}>
                            {showResult && isCorrectAnswer ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : showResult && isSelected && !isCorrectAnswer ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </div>
                          <span className={cn(
                            "font-medium",
                            showResult && isCorrectAnswer && "text-emerald-700",
                            showResult && isSelected && !isCorrectAnswer && "text-red-700"
                          )}>
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (Review Mode) */}
                  {examMode === "review" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 mb-1">Explanation</p>
                          <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-3">
                      {examMode === "in-progress" && currentQuestionIndex === totalQuestions - 1 && (
                        <Button
                          className="gap-2 bg-gradient-to-r from-violet-500 to-amber-500 hover:from-violet-600 hover:to-amber-600"
                          style={{ borderRadius: RADIUS.button }}
                          onClick={submitExam}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Submit Exam
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => goToQuestion(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Completed State */}
        {examMode === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Results Summary */}
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className={cn(
                      "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4",
                      passed ? "bg-gradient-to-br from-violet-500 to-amber-500" : "bg-gradient-to-br from-violet-500 to-purple-500"
                    )}
                  >
                    {passed ? (
                      <Award className="w-12 h-12 text-white" />
                    ) : (
                      <TrendingUp className="w-12 h-12 text-white" />
                    )}
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {passed ? "You Passed -- Well Done!" : "Almost There -- Keep Building"}
                  </h2>
                  <p className="text-gray-600">
                    {passed
                      ? "You have demonstrated strong knowledge across every major topic. You are ready for the real thing."
                      : "Review your weak categories below, revisit the course modules, then retake the exam. Most agents pass on the second or third try."}
                  </p>
                </div>

                {/* Score Card */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <div className={cn(
                    "rounded-xl p-4 text-center",
                    passed ? "bg-violet-50" : "bg-amber-50"
                  )}>
                    <p className={cn(
                      "text-4xl font-bold",
                      passed ? "text-violet-600" : "text-amber-600"
                    )}>
                      {score}%
                    </p>
                    <p className="text-sm text-gray-600">Your Score</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-4xl font-bold text-amber-500">{correctAnswers}</p>
                    <p className="text-sm text-gray-600">Right</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-4xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
                    <p className="text-sm text-gray-600">Missed</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-4xl font-bold text-gray-700">
                      {formatTime(40 * 60 - timeRemaining)}
                    </p>
                    <p className="text-sm text-gray-600">Time Spent</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Breakdown by Topic</h3>
                  {Object.entries(getCategoryStats()).map(([category, stats]) => {
                    const categoryScore = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={category} className="flex items-center gap-4">
                        <span className="w-32 text-sm text-gray-600 flex-shrink-0">{category}</span>
                        <div className="flex-1">
                          <Progress
                            value={categoryScore}
                            className={cn(
                              "h-3",
                              categoryScore >= 70
                                ? "[&>div]:bg-emerald-500"
                                : categoryScore >= 50
                                  ? "[&>div]:bg-amber-500"
                                  : "[&>div]:bg-red-500"
                            )}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-16 text-right">
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    onClick={reviewExam}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Brain className="w-5 h-5" />
                    Review Every Answer
                  </Button>
                  <Button
                    className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 w-full sm:w-auto"
                    onClick={retakeExam}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Retake Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </OnboardingLoungeLayout>
  );
}

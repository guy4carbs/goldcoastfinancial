import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
  BookOpen,
  Target,
  Trophy,
  Star,
  Timer,
  BarChart3,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Shuffle,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface ExamResult {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  flagged: boolean;
  timeSpent: number;
}

const EXAM_QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'General Concepts',
    question: 'Which of the following is NOT a requirement for an insurable risk?',
    options: [
      'The loss must be definite and measurable',
      'The loss must be fortuitous (accidental)',
      'The loss must be catastrophic',
      'There must be a large number of similar exposure units'
    ],
    correctAnswer: 2,
    explanation: 'For a risk to be insurable, the loss should NOT be catastrophic. Insurers spread risk across many policyholders, so catastrophic losses affecting many at once would be problematic.',
    difficulty: 'Medium'
  },
  {
    id: 'q2',
    category: 'Life Insurance Types',
    question: 'A Level Term Life Insurance policy provides:',
    options: [
      'Increasing premiums and increasing death benefit',
      'Level premiums and level death benefit',
      'Decreasing premiums and level death benefit',
      'Level premiums and decreasing death benefit'
    ],
    correctAnswer: 1,
    explanation: 'Level Term Life Insurance maintains both a constant premium and a constant death benefit for the duration of the term.',
    difficulty: 'Easy'
  },
  {
    id: 'q3',
    category: 'Policy Provisions',
    question: 'The grace period provision in a life insurance policy typically allows how many days to pay an overdue premium?',
    options: [
      '10 days',
      '20 days',
      '30-31 days',
      '60 days'
    ],
    correctAnswer: 2,
    explanation: 'The standard grace period in life insurance policies is 30-31 days. During this time, the policy remains in force even if the premium is unpaid.',
    difficulty: 'Easy'
  },
  {
    id: 'q4',
    category: 'Policy Provisions',
    question: 'An incontestability clause prevents the insurer from denying a claim after the policy has been in force for:',
    options: [
      '1 year',
      '2 years',
      '3 years',
      '5 years'
    ],
    correctAnswer: 1,
    explanation: 'The incontestability clause typically prevents the insurer from contesting the validity of the policy after it has been in force for 2 years, except for non-payment of premiums.',
    difficulty: 'Medium'
  },
  {
    id: 'q5',
    category: 'Riders',
    question: 'Which rider allows the policyholder to purchase additional insurance at specified intervals without evidence of insurability?',
    options: [
      'Waiver of Premium Rider',
      'Accidental Death Benefit Rider',
      'Guaranteed Insurability Rider',
      'Term Rider'
    ],
    correctAnswer: 2,
    explanation: 'The Guaranteed Insurability Rider (also called Guaranteed Purchase Option) allows the insured to purchase additional coverage at specified dates or events without proving insurability.',
    difficulty: 'Medium'
  },
  {
    id: 'q6',
    category: 'Life Insurance Types',
    question: 'Which type of life insurance accumulates cash value?',
    options: [
      'Annual Renewable Term',
      'Level Term',
      'Whole Life',
      'Decreasing Term'
    ],
    correctAnswer: 2,
    explanation: 'Whole Life insurance is a permanent policy that accumulates cash value over time. Term life policies do not build cash value.',
    difficulty: 'Easy'
  },
  {
    id: 'q7',
    category: 'Ethics & Regulations',
    question: 'When an agent uses misrepresentation to induce a policyholder to replace an existing policy, this is called:',
    options: [
      'Churning',
      'Twisting',
      'Rebating',
      'Defamation'
    ],
    correctAnswer: 1,
    explanation: 'Twisting is the practice of using misrepresentation or misleading comparisons to induce a policyholder to replace an existing policy.',
    difficulty: 'Medium'
  },
  {
    id: 'q8',
    category: 'Underwriting',
    question: 'Which organization provides coded medical information about insurance applicants to member insurance companies?',
    options: [
      'NAIC',
      'MIB',
      'HIPAA',
      'DOI'
    ],
    correctAnswer: 1,
    explanation: 'The Medical Information Bureau (MIB) is a membership organization that provides coded medical information about insurance applicants to help prevent fraud.',
    difficulty: 'Hard'
  },
  {
    id: 'q9',
    category: 'Policy Provisions',
    question: 'If an insured dies by suicide within the first two years of a policy, most life insurance policies will:',
    options: [
      'Pay the full death benefit',
      'Pay double the death benefit',
      'Return only the premiums paid',
      'Pay nothing at all'
    ],
    correctAnswer: 2,
    explanation: 'The suicide clause typically limits the benefit to a return of premiums paid if the insured dies by suicide within the first 1-2 years of the policy.',
    difficulty: 'Medium'
  },
  {
    id: 'q10',
    category: 'Life Insurance Types',
    question: 'Universal Life Insurance differs from Whole Life Insurance primarily because it offers:',
    options: [
      'A death benefit',
      'Cash value accumulation',
      'Flexible premiums and death benefits',
      'Tax-deferred growth'
    ],
    correctAnswer: 2,
    explanation: 'Universal Life Insurance distinguishes itself by offering flexibility in both premium payments and death benefit amounts, unlike the fixed nature of Whole Life.',
    difficulty: 'Medium'
  },
  {
    id: 'q11',
    category: 'General Concepts',
    question: 'Insurable interest must exist in life insurance:',
    options: [
      'Only at the time of loss',
      'Only at the time of application',
      'At both application and time of loss',
      'It is not required in life insurance'
    ],
    correctAnswer: 1,
    explanation: 'In life insurance, insurable interest must exist at the time of application. Unlike property insurance, it does not need to exist at the time of loss.',
    difficulty: 'Hard'
  },
  {
    id: 'q12',
    category: 'Riders',
    question: 'The Waiver of Premium rider:',
    options: [
      'Returns all premiums paid upon death',
      'Waives premiums if the insured becomes disabled',
      'Doubles the death benefit for accidental death',
      'Allows the insured to borrow against the policy'
    ],
    correctAnswer: 1,
    explanation: 'The Waiver of Premium rider waives premium payments if the insured becomes totally disabled, keeping the policy in force without payment.',
    difficulty: 'Easy'
  },
  {
    id: 'q13',
    category: 'Ethics & Regulations',
    question: 'Rebating is defined as:',
    options: [
      'Replacing one policy with another',
      'Returning part of the premium to induce a sale',
      'Making false statements about a competitor',
      'Excessive policy replacements'
    ],
    correctAnswer: 1,
    explanation: 'Rebating is the illegal practice of returning part of the premium or giving anything of value to the applicant as an inducement to purchase insurance.',
    difficulty: 'Easy'
  },
  {
    id: 'q14',
    category: 'Policy Provisions',
    question: 'Which nonforfeiture option provides the highest amount of coverage?',
    options: [
      'Cash Surrender Value',
      'Reduced Paid-Up Insurance',
      'Extended Term Insurance',
      'All provide equal coverage'
    ],
    correctAnswer: 2,
    explanation: 'Extended Term Insurance typically provides the highest face amount of coverage (equal to the original policy) but only for a limited period of time.',
    difficulty: 'Hard'
  },
  {
    id: 'q15',
    category: 'Life Insurance Types',
    question: 'Modified Whole Life Insurance features:',
    options: [
      'A death benefit that increases over time',
      'Lower premiums in early years that increase later',
      'Premiums that decrease as the insured ages',
      'No cash value accumulation'
    ],
    correctAnswer: 1,
    explanation: 'Modified Whole Life Insurance offers lower premiums during the initial years of the policy, which then increase to a higher level premium.',
    difficulty: 'Medium'
  },
  {
    id: 'q16',
    category: 'Underwriting',
    question: 'A substandard risk classification means the applicant will:',
    options: [
      'Be declined for coverage',
      'Pay a higher premium than standard',
      'Receive a lower death benefit',
      'Only be eligible for term insurance'
    ],
    correctAnswer: 1,
    explanation: 'Substandard (or rated) risks pay higher premiums than standard risks due to factors that increase their mortality risk.',
    difficulty: 'Medium'
  },
  {
    id: 'q17',
    category: 'Policy Provisions',
    question: 'The automatic premium loan provision:',
    options: [
      'Requires the policyholder to request a loan',
      'Automatically pays overdue premiums from cash value',
      'Provides a loan at the time of application',
      'Increases premiums automatically'
    ],
    correctAnswer: 1,
    explanation: 'The Automatic Premium Loan provision allows the insurer to automatically borrow from the policy\'s cash value to pay overdue premiums, keeping the policy in force.',
    difficulty: 'Medium'
  },
  {
    id: 'q18',
    category: 'General Concepts',
    question: 'The principle of utmost good faith requires:',
    options: [
      'The insurer to pay all claims immediately',
      'Both parties to deal honestly and disclose all material facts',
      'The agent to sell only the most expensive policies',
      'The insured to never file a claim'
    ],
    correctAnswer: 1,
    explanation: 'Utmost good faith is a basic insurance principle requiring both the insurer and the applicant to deal honestly and disclose all material information.',
    difficulty: 'Easy'
  },
  {
    id: 'q19',
    category: 'Life Insurance Types',
    question: 'In a Variable Universal Life policy, the cash value is invested in:',
    options: [
      'The insurer\'s general account',
      'Separate accounts chosen by the policyholder',
      'Government bonds only',
      'Real estate investments'
    ],
    correctAnswer: 1,
    explanation: 'Variable Universal Life allows policyholders to invest the cash value in separate accounts (similar to mutual funds) of their choosing, with the investment risk borne by the policyholder.',
    difficulty: 'Medium'
  },
  {
    id: 'q20',
    category: 'Ethics & Regulations',
    question: 'An agent\'s fiduciary duty requires them to:',
    options: [
      'Always sell the most expensive policy',
      'Act in the best interest of the client',
      'Split commissions with clients',
      'Guarantee policy returns'
    ],
    correctAnswer: 1,
    explanation: 'A fiduciary duty requires the agent to act in the best interest of the client, putting the client\'s needs ahead of their own.',
    difficulty: 'Easy'
  }
];

const EXAM_MODES = [
  { id: 'practice', label: 'Practice Mode', description: 'See explanations after each question', time: null },
  { id: 'timed', label: 'Timed Exam (90 min)', description: 'Simulate real exam conditions', time: 90 },
  { id: 'quick', label: 'Quick Quiz (10 questions)', description: 'Short practice session', time: 15 },
];

export default function AgentStudyPracticeExam() {
  const [examMode, setExamMode] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<Map<string, ExamResult>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Shuffle questions for exam
  const shuffleQuestions = (count: number) => {
    const shuffled = [...EXAM_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Start exam
  const startExam = (mode: string) => {
    setExamMode(mode);
    const questionCount = mode === 'quick' ? 10 : EXAM_QUESTIONS.length;
    const examTime = EXAM_MODES.find(m => m.id === mode)?.time;

    setQuestions(shuffleQuestions(questionCount));
    setCurrentQuestionIndex(0);
    setResults(new Map());
    setShowExplanation(false);
    setExamStarted(true);
    setExamCompleted(false);
    setTimeRemaining(examTime ? examTime * 60 : null);
    setIsPaused(false);
  };

  // Timer effect
  useEffect(() => {
    if (!examStarted || isPaused || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          completeExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, isPaused, timeRemaining]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const existingResult = results.get(currentQuestion.id);

    setResults(new Map(results.set(currentQuestion.id, {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      flagged: existingResult?.flagged || false,
      timeSpent: existingResult?.timeSpent || 0
    })));

    if (examMode === 'practice') {
      setShowExplanation(true);
    }
  };

  const handleFlagQuestion = () => {
    if (!currentQuestion) return;
    const existingResult = results.get(currentQuestion.id);
    setResults(new Map(results.set(currentQuestion.id, {
      ...existingResult,
      questionId: currentQuestion.id,
      selectedAnswer: existingResult?.selectedAnswer ?? null,
      isCorrect: existingResult?.isCorrect ?? false,
      flagged: !existingResult?.flagged,
      timeSpent: existingResult?.timeSpent || 0
    })));
    toast.info(existingResult?.flagged ? 'Flag removed' : 'Question flagged for review');
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const completeExam = () => {
    setExamCompleted(true);
    setShowResultsDialog(true);
  };

  const resetExam = () => {
    setExamMode(null);
    setExamStarted(false);
    setExamCompleted(false);
    setResults(new Map());
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setTimeRemaining(null);
  };

  // Calculate score
  const score = useMemo(() => {
    const answered = Array.from(results.values()).filter(r => r.selectedAnswer !== null);
    const correct = answered.filter(r => r.isCorrect).length;
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
      answered: answered.length,
      flagged: Array.from(results.values()).filter(r => r.flagged).length
    };
  }, [results, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Exam Selection Screen
  if (!examStarted) {
    return (
      <AgentLoungeLayout>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-6 pb-20 lg:pb-0"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/agents/getting-started">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Target className="w-4 h-4" />
                  <span>Heritage Life</span>
                  <Badge className="bg-green-100 text-green-700">Free</Badge>
                </div>
                <h1 className="text-2xl font-bold text-primary">Practice Exam Simulator</h1>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp}>
            <div className="grid sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{EXAM_QUESTIONS.length}</p>
                  <p className="text-xs text-gray-500">Total Questions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">6</p>
                  <p className="text-xs text-gray-500">Categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-3xl font-bold">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-violet-600">890</p>
                  <p className="text-xs text-gray-500">Enrolled</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Exam Modes */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Select Exam Mode</CardTitle>
                <CardDescription>Choose how you want to practice</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {EXAM_MODES.map(mode => (
                  <Card
                    key={mode.id}
                    className={cn(
                      "cursor-pointer hover:border-violet-300 hover:shadow-md transition-all",
                      examMode === mode.id && "border-violet-500 bg-violet-50"
                    )}
                    onClick={() => setExamMode(mode.id)}
                  >
                    <CardContent className="p-4 text-center">
                      {mode.id === 'practice' && <BookOpen className="w-10 h-10 text-green-500 mx-auto mb-3" />}
                      {mode.id === 'timed' && <Timer className="w-10 h-10 text-red-500 mx-auto mb-3" />}
                      {mode.id === 'quick' && <Shuffle className="w-10 h-10 text-blue-500 mx-auto mb-3" />}
                      <h3 className="font-semibold">{mode.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{mode.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Start Button */}
          <motion.div variants={fadeInUp}>
            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!examMode}
              onClick={() => examMode && startExam(examMode)}
            >
              <Play className="w-5 h-5" />
              Start Exam
            </Button>
          </motion.div>

          {/* Tips */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Exam Tips</h4>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1">
                      <li>• Read each question carefully before selecting an answer</li>
                      <li>• Flag difficult questions to review later</li>
                      <li>• The real exam typically requires 70% to pass</li>
                      <li>• Practice under timed conditions when you feel ready</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AgentLoungeLayout>
    );
  }

  // Active Exam Screen
  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-4 pb-20 lg:pb-0"
      >
        {/* Exam Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={resetExam}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-primary">Practice Exam</h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {timeRemaining !== null && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-gray-100"
              )}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </Button>
              </div>
            )}
            <Button
              variant={results.get(currentQuestion?.id)?.flagged ? "destructive" : "outline"}
              size="sm"
              onClick={handleFlagQuestion}
            >
              <Flag className="w-4 h-4 mr-1" />
              {results.get(currentQuestion?.id)?.flagged ? 'Flagged' : 'Flag'}
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress: {score.answered}/{questions.length} answered</span>
              <span>{score.flagged} flagged</span>
            </div>
            <Progress value={(score.answered / questions.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        {currentQuestion && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Badge className={cn(
                  "text-xs",
                  currentQuestion.difficulty === 'Easy' && "bg-green-100 text-green-700",
                  currentQuestion.difficulty === 'Medium' && "bg-amber-100 text-amber-700",
                  currentQuestion.difficulty === 'Hard' && "bg-red-100 text-red-700"
                )}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">{currentQuestion.category}</Badge>
              </div>

              <h2 className="text-lg font-medium mb-6">{currentQuestion.question}</h2>

              <RadioGroup
                value={results.get(currentQuestion.id)?.selectedAnswer?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const result = results.get(currentQuestion.id);
                    const isSelected = result?.selectedAnswer === index;
                    const showCorrect = showExplanation || examCompleted;
                    const isCorrect = index === currentQuestion.correctAnswer;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                          isSelected && !showCorrect && "border-violet-500 bg-violet-50",
                          showCorrect && isCorrect && "border-green-500 bg-green-50",
                          showCorrect && isSelected && !isCorrect && "border-red-500 bg-red-50",
                          !isSelected && !showCorrect && "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => !showCorrect && handleAnswerSelect(index)}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          disabled={showCorrect}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                        {showCorrect && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {showCorrect && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">Explanation</h4>
                        <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            <ScrollArea className="max-w-[200px] sm:max-w-[400px]">
              <div className="flex gap-1 p-1">
                {questions.map((q, idx) => {
                  const result = results.get(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={cn(
                        "w-8 h-8 rounded text-xs font-medium transition-colors flex-shrink-0",
                        idx === currentQuestionIndex && "ring-2 ring-violet-500",
                        result?.isCorrect && "bg-green-500 text-white",
                        result?.selectedAnswer !== null && result?.selectedAnswer !== undefined && !result?.isCorrect && "bg-red-500 text-white",
                        result?.flagged && !result?.selectedAnswer && "bg-amber-100 text-amber-700",
                        !result?.selectedAnswer && result?.selectedAnswer !== 0 && !result?.flagged && "bg-gray-100 hover:bg-gray-200"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={completeExam}>
              Finish Exam
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Exam Complete!</DialogTitle>
              <DialogDescription>Here are your results</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className={cn(
                  "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center",
                  score.percentage >= 70 ? "bg-green-100" : "bg-red-100"
                )}>
                  {score.percentage >= 70 ? (
                    <Trophy className="w-12 h-12 text-green-600" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  )}
                </div>
                <p className="text-4xl font-bold text-primary">{score.percentage}%</p>
                <p className="text-gray-500">
                  {score.correct} of {score.total} correct
                </p>
                <Badge className={cn(
                  "mt-2",
                  score.percentage >= 70 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {score.percentage >= 70 ? 'PASSED' : 'NEEDS MORE PRACTICE'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{score.correct}</p>
                  <p className="text-xs text-gray-500">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{score.total - score.correct}</p>
                  <p className="text-xs text-gray-500">Incorrect</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{score.flagged}</p>
                  <p className="text-xs text-gray-500">Flagged</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowResultsDialog(false);
                  setExamCompleted(false);
                }}>
                  Review Answers
                </Button>
                <Button className="flex-1" onClick={resetExam}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AgentLoungeLayout>
  );
}

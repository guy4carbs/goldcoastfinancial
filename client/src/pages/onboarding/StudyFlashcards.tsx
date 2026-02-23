import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OnboardingLoungeLayout } from "@/components/agent/OnboardingLoungeLayout";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Brain,
  RotateCcw,
  Shuffle,
  Zap,
  BookOpen,
  Target,
  Star,
  RefreshCw,
  Layers,
  TrendingUp,
  Trophy,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
} from "@/lib/onboardingDesignSystem";

// Flashcard data organized by category
const FLASHCARD_DECKS = {
  "Policy Types": [
    {
      id: "pt-1",
      front: "What is Term Life Insurance?",
      back: "Life insurance that provides coverage for a specific period (term) without cash value accumulation. Most affordable option for temporary coverage needs.",
    },
    {
      id: "pt-2",
      front: "What is Whole Life Insurance?",
      back: "Permanent life insurance with fixed premiums, guaranteed death benefit, and cash value that grows at a guaranteed rate. Provides lifetime coverage.",
    },
    {
      id: "pt-3",
      front: "What is Universal Life Insurance?",
      back: "Permanent life insurance with flexible premiums and adjustable death benefits. Cash value earns interest based on current market rates.",
    },
    {
      id: "pt-4",
      front: "What is Indexed Universal Life (IUL)?",
      back: "Universal life policy where cash value growth is tied to a stock market index (like S&P 500) with a guaranteed floor protecting against losses.",
    },
    {
      id: "pt-5",
      front: "What is Variable Life Insurance?",
      back: "Permanent insurance where cash value is invested in sub-accounts (similar to mutual funds). Higher risk/reward potential.",
    },
    {
      id: "pt-6",
      front: "What is Final Expense Insurance?",
      back: "Small whole life policy (typically $5,000-$25,000) designed to cover funeral costs and final expenses. Often simplified issue.",
    },
  ],
  "Underwriting": [
    {
      id: "uw-1",
      front: "What is underwriting?",
      back: "The process insurers use to evaluate risk and determine whether to insure an applicant and at what premium rate.",
    },
    {
      id: "uw-2",
      front: "What are the main risk classifications?",
      back: "Preferred Plus, Preferred, Standard Plus, Standard, and Substandard (rated). Each class reflects different risk levels and premium rates.",
    },
    {
      id: "uw-3",
      front: "What is a paramedical exam?",
      back: "A medical examination required by insurers including measurements, blood/urine samples, and health history to assess applicant risk.",
    },
    {
      id: "uw-4",
      front: "What is simplified issue insurance?",
      back: "Coverage requiring only a health questionnaire without medical exam. Higher premiums but faster approval.",
    },
    {
      id: "uw-5",
      front: "What is guaranteed issue insurance?",
      back: "Coverage with no health questions or medical exam. Highest premiums and often includes graded death benefits.",
    },
    {
      id: "uw-6",
      front: "What is a MIB check?",
      back: "Medical Information Bureau check - reviews past insurance applications for previously disclosed medical conditions.",
    },
  ],
  "Policy Components": [
    {
      id: "pc-1",
      front: "What is a death benefit?",
      back: "The amount paid to beneficiaries when the insured dies. Can be level (fixed) or decreasing over time.",
    },
    {
      id: "pc-2",
      front: "What is cash value?",
      back: "The savings component in permanent life insurance that grows tax-deferred and can be accessed through loans or withdrawals.",
    },
    {
      id: "pc-3",
      front: "What is a policy rider?",
      back: "An optional add-on to a policy that provides additional benefits or features, usually for an extra premium.",
    },
    {
      id: "pc-4",
      front: "What is the Waiver of Premium rider?",
      back: "Rider that waives premium payments if the insured becomes totally disabled, keeping the policy active.",
    },
    {
      id: "pc-5",
      front: "What is the Accelerated Death Benefit rider?",
      back: "Allows access to a portion of the death benefit if diagnosed with a terminal illness (usually 6-24 months life expectancy).",
    },
    {
      id: "pc-6",
      front: "What is a Guaranteed Insurability rider?",
      back: "Allows purchase of additional coverage at specified future dates without proving insurability.",
    },
  ],
  "Beneficiaries": [
    {
      id: "bn-1",
      front: "What is a primary beneficiary?",
      back: "The first person(s) entitled to receive the death benefit. Can be individuals, trusts, or organizations.",
    },
    {
      id: "bn-2",
      front: "What is a contingent beneficiary?",
      back: "The backup beneficiary who receives proceeds only if the primary beneficiary cannot (deceased or unreachable).",
    },
    {
      id: "bn-3",
      front: "What is a revocable beneficiary?",
      back: "A beneficiary designation that can be changed by the policyholder at any time without the beneficiary's consent.",
    },
    {
      id: "bn-4",
      front: "What is an irrevocable beneficiary?",
      back: "A beneficiary designation that cannot be changed without the beneficiary's written consent.",
    },
    {
      id: "bn-5",
      front: "What happens if no beneficiary is named?",
      back: "Proceeds typically go to the insured's estate, subjecting them to probate and potential estate taxes.",
    },
    {
      id: "bn-6",
      front: "What is per stirpes distribution?",
      back: "Distribution method where if a beneficiary dies, their share passes to their descendants rather than other beneficiaries.",
    },
  ],
  "Regulations": [
    {
      id: "rg-1",
      front: "What is the contestability period?",
      back: "Typically 2 years from policy issue. Insurer can investigate and deny claims for misrepresentation on the application.",
    },
    {
      id: "rg-2",
      front: "What is the grace period?",
      back: "Typically 30-31 days after premium due date during which coverage continues and payment can be made without lapse.",
    },
    {
      id: "rg-3",
      front: "What is the free look period?",
      back: "Typically 10-30 days after policy delivery to review and return the policy for a full refund.",
    },
    {
      id: "rg-4",
      front: "What is incontestability?",
      back: "After the contestability period, the insurer cannot deny claims based on misstatements in the application (except fraud).",
    },
    {
      id: "rg-5",
      front: "What is insurable interest?",
      back: "Legal requirement that the policy owner would suffer financial loss from the insured's death. Must exist at policy inception.",
    },
    {
      id: "rg-6",
      front: "What is the suicide clause?",
      back: "Provision excluding death benefit payment for suicide within the first 1-2 years of the policy. Premiums are returned.",
    },
  ],
  "Sales Ethics": [
    {
      id: "se-1",
      front: "What is twisting?",
      back: "Illegal practice of misrepresenting policy features to induce a client to replace an existing policy, usually for commission.",
    },
    {
      id: "se-2",
      front: "What is churning?",
      back: "Illegal practice of replacing a client's policies repeatedly to generate commissions with no benefit to the client.",
    },
    {
      id: "se-3",
      front: "What is rebating?",
      back: "Illegal in most states - returning part of the commission to the client as an inducement to purchase.",
    },
    {
      id: "se-4",
      front: "What is needs-based selling?",
      back: "Ethical approach analyzing client's financial situation, goals, and needs before recommending appropriate coverage.",
    },
    {
      id: "se-5",
      front: "What is suitability?",
      back: "The requirement that recommended products are appropriate for the client's financial situation, needs, and objectives.",
    },
    {
      id: "se-6",
      front: "What is a replacement form?",
      back: "Required disclosure when replacing existing insurance. Compares old and new policies so client can make informed decision.",
    },
  ],
};

const DECK_COLORS = {
  "Policy Types": { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-600" },
  "Underwriting": { bg: "from-purple-500 to-violet-600", light: "bg-purple-50", text: "text-purple-600" },
  "Policy Components": { bg: "from-violet-600 to-purple-600", light: "bg-violet-50", text: "text-violet-600" },
  "Beneficiaries": { bg: "from-violet-500 to-amber-500", light: "bg-amber-50", text: "text-amber-600" },
  "Regulations": { bg: "from-purple-600 to-violet-600", light: "bg-purple-50", text: "text-purple-600" },
  "Sales Ethics": { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-600" },
};

type StudyMode = "select-deck" | "studying" | "results";

interface CardProgress {
  id: string;
  correct: number;
  incorrect: number;
  mastered: boolean;
}

export default function StudyFlashcards() {
  const [studyMode, setStudyMode] = useState<StudyMode>("select-deck");
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [currentCards, setCurrentCards] = useState<typeof FLASHCARD_DECKS["Policy Types"]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [shuffleMode, setShuffleMode] = useState(false);

  const totalCardsAll = Object.values(FLASHCARD_DECKS).flat().length;
  const currentCard = currentCards[currentCardIndex];

  const startDeck = (deckName: string) => {
    let cards = [...FLASHCARD_DECKS[deckName as keyof typeof FLASHCARD_DECKS]];
    if (shuffleMode) {
      cards = shuffleArray(cards);
    }
    setSelectedDeck(deckName);
    setCurrentCards(cards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setStudyMode("studying");
  };

  const startAllCards = () => {
    let cards = Object.values(FLASHCARD_DECKS).flat();
    if (shuffleMode) {
      cards = shuffleArray(cards);
    }
    setSelectedDeck("All Cards");
    setCurrentCards(cards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setStudyMode("studying");
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markCard = (correct: boolean) => {
    // Update session stats
    setSessionStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Update card progress
    setCardProgress((prev) => {
      const existing = prev.find((p) => p.id === currentCard.id);
      if (existing) {
        const updated = {
          ...existing,
          correct: existing.correct + (correct ? 1 : 0),
          incorrect: existing.incorrect + (correct ? 0 : 1),
          mastered: correct && existing.correct >= 2,
        };
        return prev.map((p) => (p.id === currentCard.id ? updated : p));
      }
      return [
        ...prev,
        {
          id: currentCard.id,
          correct: correct ? 1 : 0,
          incorrect: correct ? 0 : 1,
          mastered: false,
        },
      ];
    });

    // Move to next card or finish
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setStudyMode("results");
    }
  };

  const restartDeck = () => {
    if (selectedDeck === "All Cards") {
      startAllCards();
    } else if (selectedDeck) {
      startDeck(selectedDeck);
    }
  };

  const goBack = () => {
    setStudyMode("select-deck");
    setSelectedDeck(null);
    setCurrentCards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (studyMode !== "studying") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          flipCard();
          break;
        case "ArrowLeft":
          if (isFlipped) markCard(false);
          break;
        case "ArrowRight":
          if (isFlipped) markCard(true);
          break;
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          flipCard();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [studyMode, isFlipped, currentCardIndex]);

  const progress = currentCards.length > 0
    ? Math.round(((currentCardIndex + (isFlipped ? 0.5 : 0)) / currentCards.length) * 100)
    : 0;

  const score = sessionStats.correct + sessionStats.incorrect > 0
    ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
    : 0;

  return (
    <OnboardingLoungeLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white border-0 overflow-hidden relative"
            style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.hero }}
          >
            {/* Decorative elements */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />

            <CardContent className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                    className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: RADIUS.card,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Layers className="w-9 h-9 text-amber-200" />
                  </motion.div>
                  <div>
                    <Badge
                      className="bg-white/25 text-white border-0 backdrop-blur-sm font-medium mb-2"
                      style={{ padding: '4px 12px' }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Heritage Life Academy
                    </Badge>
                    <h1
                      className="font-bold tracking-tight text-white"
                      style={{ fontSize: TYPE.hero, lineHeight: 1.1 }}
                    >
                      Flashcards
                    </h1>
                    <p className="text-white/80 mt-2" style={{ fontSize: TYPE.body }}>
                      Master key concepts with interactive flashcards
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                    <p className="text-3xl font-bold text-white">{Object.keys(FLASHCARD_DECKS).length}</p>
                    <p className="text-white/70 text-xs">Decks</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                    <p className="text-3xl font-bold text-white">{totalCardsAll}</p>
                    <p className="text-white/70 text-xs">Cards</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Navigation */}
        <Link href="/agents/onboarding/study/course">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-violet-600">
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </Button>
        </Link>

        {/* Deck Selection */}
        {studyMode === "select-deck" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Controls */}
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant={shuffleMode ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "gap-2",
                        shuffleMode && "bg-amber-500 hover:bg-amber-600"
                      )}
                      onClick={() => setShuffleMode(!shuffleMode)}
                    >
                      <Shuffle className="w-4 h-4" />
                      Shuffle Mode
                    </Button>
                  </div>
                  <Button
                    className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={startAllCards}
                  >
                    <Zap className="w-4 h-4" />
                    Study All Cards ({totalCardsAll})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deck Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(FLASHCARD_DECKS).map(([deckName, cards], index) => {
                const colors = DECK_COLORS[deckName as keyof typeof DECK_COLORS];
                const masteredCount = cardProgress.filter(
                  (p) => cards.some((c) => c.id === p.id) && p.mastered
                ).length;

                return (
                  <motion.div
                    key={deckName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-gray-200"
                      style={{ borderRadius: RADIUS.card }}
                      onClick={() => startDeck(deckName)}
                    >
                      {/* Deck Header */}
                      <div className={cn("h-24 relative bg-gradient-to-br", colors.bg)}>
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers className="w-12 h-12 text-white/80" />
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{deckName}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{cards.length} cards</span>
                          {masteredCount > 0 && (
                            <Badge variant="outline" className={cn(colors.light, colors.text, "border-0")}>
                              <Star className="w-3 h-3 mr-1" />
                              {masteredCount} mastered
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Studying Mode */}
        {studyMode === "studying" && currentCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Progress Bar */}
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level1 }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {selectedDeck}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Card {currentCardIndex + 1} of {currentCards.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-amber-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      {sessionStats.correct}
                    </span>
                    <span className="text-red-500 font-medium">
                      <XCircle className="w-4 h-4 inline mr-1" />
                      {sessionStats.incorrect}
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-amber-500" />
              </CardContent>
            </Card>

            {/* Flashcard */}
            <div
              className="cursor-pointer"
              style={{ perspective: '1000px', minHeight: 400 }}
            >
              <motion.div
                className="relative w-full"
                onClick={flipCard}
                style={{ transformStyle: "preserve-3d", minHeight: 400 }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", damping: 20 }}
              >
                {/* Front */}
                <Card
                  className="absolute inset-0 flex flex-col justify-center border-2 border-gray-200"
                  style={{
                    borderRadius: RADIUS.hero,
                    boxShadow: SHADOW.level3,
                    backfaceVisibility: "hidden",
                    minHeight: 400,
                  }}
                >
                  <CardContent className="p-8 text-center flex-1 flex flex-col justify-center">
                    <Badge variant="outline" className="self-center mb-6 bg-gray-50">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Question
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-relaxed">
                      {currentCard.front}
                    </h2>
                    <p className="text-gray-400 mt-8 text-sm">
                      Click to reveal answer
                    </p>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card
                  className="absolute inset-0 flex flex-col justify-center border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50"
                  style={{
                    borderRadius: RADIUS.hero,
                    boxShadow: SHADOW.level3,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    minHeight: 400,
                  }}
                >
                  <CardContent className="p-8 text-center flex-1 flex flex-col justify-center">
                    <Badge variant="outline" className="self-center mb-6 bg-white/80 text-violet-700 border-violet-200">
                      <Target className="w-3 h-3 mr-1" />
                      Answer
                    </Badge>
                    <p className="text-xl md:text-2xl text-gray-800 leading-relaxed">
                      {currentCard.back}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              {isFlipped ? (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 min-w-32"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => markCard(false)}
                  >
                    <XCircle className="w-5 h-5" />
                    Incorrect
                  </Button>
                  <Button
                    size="lg"
                    className="gap-2 bg-violet-500 hover:bg-violet-600 min-w-32"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => markCard(true)}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Correct
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                  onClick={flipCard}
                >
                  <RefreshCw className="w-5 h-5" />
                  Show Answer
                </Button>
              )}
            </div>

            {/* Keyboard Hint */}
            <p className="text-center text-sm text-gray-400">
              Keyboard: Space/Enter to flip • Left arrow: Incorrect • Right arrow: Correct
            </p>
          </motion.div>
        )}

        {/* Results */}
        {studyMode === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className={cn(
                      "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4",
                      score >= 80
                        ? "bg-gradient-to-br from-violet-500 to-amber-500"
                        : score >= 60
                          ? "bg-gradient-to-br from-violet-500 to-purple-500"
                          : "bg-gradient-to-br from-purple-500 to-violet-500"
                    )}
                  >
                    <Trophy className="w-12 h-12 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {score >= 80 ? "Excellent!" : score >= 60 ? "Good Progress!" : "Keep Practicing!"}
                  </h2>
                  <p className="text-gray-600">
                    You completed the {selectedDeck} deck
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className={cn(
                    "rounded-xl p-4 text-center",
                    score >= 70 ? "bg-violet-50" : "bg-amber-50"
                  )}>
                    <p className={cn(
                      "text-4xl font-bold",
                      score >= 70 ? "text-violet-600" : "text-amber-600"
                    )}>
                      {score}%
                    </p>
                    <p className="text-sm text-gray-600">Accuracy</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-4 text-center">
                    <p className="text-4xl font-bold text-amber-500">{sessionStats.correct}</p>
                    <p className="text-sm text-gray-600">Correct</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-4xl font-bold text-red-600">{sessionStats.incorrect}</p>
                    <p className="text-sm text-gray-600">Incorrect</p>
                  </div>
                </div>

                {/* Performance Tips */}
                {score < 80 && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-8">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-violet-800 mb-1">Tips to Improve</p>
                        <ul className="text-violet-700 text-sm space-y-1">
                          <li>• Focus on cards you marked incorrect</li>
                          <li>• Use shuffle mode to test your recall</li>
                          <li>• Review the fundamentals course for difficult topics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    onClick={goBack}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Layers className="w-5 h-5" />
                    Choose Another Deck
                  </Button>
                  <Button
                    className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 w-full sm:w-auto"
                    onClick={restartDeck}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Study Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </OnboardingLoungeLayout>
  );
}

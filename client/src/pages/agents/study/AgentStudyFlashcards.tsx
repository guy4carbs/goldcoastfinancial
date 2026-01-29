import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Star,
  BookOpen,
  Layers,
  Clock,
  Target,
  Lightbulb,
  Volume2,
  Eye,
  EyeOff,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Sparkles,
  Zap,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Flashcard {
  id: string;
  category: string;
  term: string;
  definition: string;
  example?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starred: boolean;
  mastered: boolean;
}

const FLASHCARDS: Flashcard[] = [
  // Insurance Basics
  { id: 'fc1', category: 'Insurance Basics', term: 'Premium', definition: 'The amount paid by the policyholder to the insurance company for coverage. Can be paid monthly, quarterly, semi-annually, or annually.', example: 'A policyholder pays $150/month for their life insurance policy.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc2', category: 'Insurance Basics', term: 'Death Benefit', definition: 'The amount paid to beneficiaries upon the death of the insured person. This is the primary purpose of life insurance.', example: 'A $500,000 policy pays $500,000 to the beneficiary when the insured dies.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc3', category: 'Insurance Basics', term: 'Beneficiary', definition: 'The person, persons, or entity designated to receive the death benefit proceeds when the insured dies.', example: 'John names his wife Mary as the primary beneficiary of his life insurance.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc4', category: 'Insurance Basics', term: 'Insurable Interest', definition: 'The financial stake a person has in the continued life of the insured. Must exist at the time of application.', example: 'A spouse has insurable interest in their partner because their death would cause financial hardship.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc5', category: 'Insurance Basics', term: 'Face Amount', definition: 'The stated value of the death benefit specified in the policy. Also called the face value or policy amount.', example: 'A policy with a $250,000 face amount will pay $250,000 upon death.', difficulty: 'Easy', starred: false, mastered: false },

  // Policy Types
  { id: 'fc6', category: 'Policy Types', term: 'Term Life Insurance', definition: 'Life insurance that provides coverage for a specified period (term). Has no cash value and is typically the most affordable option.', example: 'A 20-year term policy covers the insured for 20 years only.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc7', category: 'Policy Types', term: 'Whole Life Insurance', definition: 'Permanent life insurance with fixed premiums that builds cash value over time. Provides coverage for the insured\'s entire life.', example: 'A whole life policy builds cash value that can be borrowed against.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc8', category: 'Policy Types', term: 'Universal Life Insurance', definition: 'Permanent life insurance with flexible premiums and death benefits. Interest is credited to the cash value based on current rates.', example: 'A policyholder can adjust their premium payments based on their current financial situation.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc9', category: 'Policy Types', term: 'Variable Life Insurance', definition: 'Permanent insurance where the cash value is invested in separate accounts (similar to mutual funds). Investment risk is borne by the policyholder.', example: 'The cash value performance depends on the underlying investments chosen.', difficulty: 'Hard', starred: false, mastered: false },
  { id: 'fc10', category: 'Policy Types', term: 'Indexed Universal Life (IUL)', definition: 'A type of universal life where cash value growth is tied to a market index (like S&P 500) with caps and floors.', example: 'If the S&P 500 gains 12% and the cap is 10%, the policy credits 10%.', difficulty: 'Hard', starred: false, mastered: false },

  // Policy Provisions
  { id: 'fc11', category: 'Policy Provisions', term: 'Grace Period', definition: 'A period (typically 30-31 days) after a premium due date during which the policy remains in force even if the premium is unpaid.', example: 'If payment is due on the 1st, the policy stays active until the 31st without payment.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc12', category: 'Policy Provisions', term: 'Incontestability Clause', definition: 'A provision that prevents the insurer from denying claims based on misstatements after the policy has been in force for 2 years.', example: 'After 2 years, the insurer cannot void the policy due to application errors.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc13', category: 'Policy Provisions', term: 'Suicide Clause', definition: 'A provision that limits benefits to a return of premiums if the insured commits suicide within 1-2 years of policy issue.', example: 'If suicide occurs in year 1, only premiums paid are returned to beneficiaries.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc14', category: 'Policy Provisions', term: 'Free Look Period', definition: 'A period (typically 10-30 days) after policy delivery during which the owner can cancel and receive a full refund.', example: 'The policyholder has 10 days to review and return the policy for a full refund.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc15', category: 'Policy Provisions', term: 'Misstatement of Age', definition: 'A provision that adjusts the death benefit if the insured\'s age was misstated on the application, rather than voiding the policy.', example: 'If age was understated, the benefit is reduced to what the premium would have purchased.', difficulty: 'Medium', starred: false, mastered: false },

  // Nonforfeiture Options
  { id: 'fc16', category: 'Nonforfeiture Options', term: 'Cash Surrender Value', definition: 'The amount of cash value available to the policyholder if they surrender (cancel) a permanent life insurance policy.', example: 'A policyholder surrenders their policy and receives $15,000 in cash.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc17', category: 'Nonforfeiture Options', term: 'Reduced Paid-Up Insurance', definition: 'A nonforfeiture option that uses the cash value to purchase a smaller amount of paid-up whole life insurance.', example: 'Cash value of $10,000 purchases $25,000 of paid-up coverage with no future premiums.', difficulty: 'Hard', starred: false, mastered: false },
  { id: 'fc18', category: 'Nonforfeiture Options', term: 'Extended Term Insurance', definition: 'A nonforfeiture option that uses the cash value to purchase term insurance for the original face amount for a limited period.', example: 'Cash value provides 7 years of term coverage at the original $100,000 face amount.', difficulty: 'Hard', starred: false, mastered: false },

  // Riders
  { id: 'fc19', category: 'Riders', term: 'Waiver of Premium', definition: 'A rider that waives premium payments if the insured becomes totally disabled. The policy remains in force during disability.', example: 'If the insured becomes disabled, premiums are waived but coverage continues.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc20', category: 'Riders', term: 'Accelerated Death Benefit', definition: 'A rider allowing the insured to receive a portion of the death benefit while still alive if diagnosed with a terminal illness.', example: 'A terminally ill person receives 80% of their death benefit to pay for care.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc21', category: 'Riders', term: 'Guaranteed Insurability Rider', definition: 'A rider that allows the insured to purchase additional coverage at specified times without proof of insurability.', example: 'At age 30, 35, and 40, the insured can add coverage without a medical exam.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc22', category: 'Riders', term: 'Accidental Death Benefit', definition: 'A rider that pays an additional death benefit (usually double) if death results from an accident.', example: 'If the insured dies in a car accident, beneficiaries receive $1M instead of $500K.', difficulty: 'Easy', starred: false, mastered: false },

  // Underwriting
  { id: 'fc23', category: 'Underwriting', term: 'Underwriting', definition: 'The process of evaluating and classifying the risk presented by an applicant to determine insurability and premium rates.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc24', category: 'Underwriting', term: 'Standard Risk', definition: 'An applicant who presents average mortality risk and qualifies for standard premium rates.', example: 'A healthy 35-year-old non-smoker is classified as standard risk.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc25', category: 'Underwriting', term: 'Substandard Risk', definition: 'An applicant who presents higher than average mortality risk and may be charged higher premiums or have limited coverage.', example: 'A person with diabetes may be rated substandard and pay 150% of standard rates.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc26', category: 'Underwriting', term: 'MIB (Medical Information Bureau)', definition: 'An organization that maintains coded medical information about insurance applicants to help detect fraud and omissions.', difficulty: 'Hard', starred: false, mastered: false },

  // Ethics & Regulations
  { id: 'fc27', category: 'Ethics & Regulations', term: 'Twisting', definition: 'The illegal practice of using misrepresentation to induce a policyholder to replace an existing policy with a new one.', example: 'Falsely telling a client their current policy is worthless to sell them a new one.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc28', category: 'Ethics & Regulations', term: 'Churning', definition: 'The excessive replacement of policies, often to generate commissions, without benefit to the client.', example: 'Convincing a client to replace their policy every year to earn new commissions.', difficulty: 'Medium', starred: false, mastered: false },
  { id: 'fc29', category: 'Ethics & Regulations', term: 'Rebating', definition: 'The illegal practice of returning part of the premium or giving anything of value to induce the purchase of insurance.', example: 'Offering a $500 gift card to a client who buys a policy.', difficulty: 'Easy', starred: false, mastered: false },
  { id: 'fc30', category: 'Ethics & Regulations', term: 'Fiduciary Duty', definition: 'The legal obligation to act in the best interest of another party, putting their needs above your own.', example: 'Recommending a smaller policy that better fits the client\'s budget and needs.', difficulty: 'Medium', starred: false, mastered: false },
];

const CATEGORIES = ['All', 'Insurance Basics', 'Policy Types', 'Policy Provisions', 'Nonforfeiture Options', 'Riders', 'Underwriting', 'Ethics & Regulations'];

type StudyMode = 'browse' | 'study' | 'quiz';

export default function AgentStudyFlashcards() {
  const [cards, setCards] = useState(FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [category, setCategory] = useState('All');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('browse');
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [studySessionStarted, setStudySessionStarted] = useState(false);

  // Filter cards
  const filteredCards = useMemo(() => {
    let result = [...cards];
    if (category !== 'All') {
      result = result.filter(c => c.category === category);
    }
    if (showStarredOnly) {
      result = result.filter(c => c.starred);
    }
    return result;
  }, [cards, category, showStarredOnly]);

  const currentCard = filteredCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success('Cards shuffled!');
  };

  const handleToggleStar = () => {
    if (!currentCard) return;
    setCards(prev => prev.map(c =>
      c.id === currentCard.id ? { ...c, starred: !c.starred } : c
    ));
    toast.info(currentCard.starred ? 'Removed from starred' : 'Added to starred');
  };

  const handleKnown = () => {
    setKnownCount(prev => prev + 1);
    if (!currentCard) return;
    setCards(prev => prev.map(c =>
      c.id === currentCard.id ? { ...c, mastered: true } : c
    ));
    handleNext();
  };

  const handleUnknown = () => {
    setUnknownCount(prev => prev + 1);
    handleNext();
  };

  const startStudySession = () => {
    setStudyMode('study');
    setStudySessionStarted(true);
    setKnownCount(0);
    setUnknownCount(0);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetStudySession = () => {
    setStudyMode('browse');
    setStudySessionStarted(false);
    setKnownCount(0);
    setUnknownCount(0);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = cards.length;
    const mastered = cards.filter(c => c.mastered).length;
    const starred = cards.filter(c => c.starred).length;
    return { total, mastered, starred };
  }, [cards]);

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
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Layers className="w-4 h-4" />
                <span>Heritage Life</span>
                <Badge className="bg-green-100 text-green-700">Free</Badge>
              </div>
              <h1 className="text-2xl font-bold text-primary">Insurance Terminology Flashcards</h1>
            </div>
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">4.7</span>
              </div>
              <p className="text-sm text-gray-500">{stats.total} cards</p>
            </div>
          </div>
        </motion.div>

        {/* Stats & Controls */}
        <motion.div variants={fadeInUp}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredCards.length}</p>
                  <p className="text-xs text-gray-500">Cards to Study</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.mastered}</p>
                  <p className="text-xs text-gray-500">Mastered</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.starred}</p>
                  <p className="text-xs text-gray-500">Starred</p>
                </div>
              </CardContent>
            </Card>
            {studySessionStarted && (
              <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{knownCount}/{knownCount + unknownCount}</p>
                    <p className="text-xs text-white/80">Session Progress</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={category} onValueChange={(value) => {
                  setCategory(value);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={showStarredOnly ? "default" : "outline"}
                  onClick={() => {
                    setShowStarredOnly(!showStarredOnly);
                    setCurrentIndex(0);
                  }}
                  className="gap-2"
                >
                  <Star className={cn("w-4 h-4", showStarredOnly && "fill-current")} />
                  Starred Only
                </Button>

                <Button variant="outline" onClick={handleShuffle} className="gap-2">
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </Button>

                <div className="flex-1" />

                {!studySessionStarted ? (
                  <Button onClick={startStudySession} className="gap-2">
                    <Zap className="w-4 h-4" />
                    Start Study Session
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resetStudySession} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    End Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flashcard */}
        <motion.div variants={fadeInUp}>
          {filteredCards.length === 0 ? (
            <Card className="p-12 text-center">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No cards found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </Card>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
                <Progress
                  value={((currentIndex + 1) / filteredCards.length) * 100}
                  className="w-32 h-2"
                />
              </div>

              {/* Card */}
              <div
                className="perspective-1000 cursor-pointer"
                onClick={handleFlip}
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="relative w-full aspect-[3/2] preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <Card
                    className="absolute inset-0 backface-hidden flex flex-col"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{currentCard?.category}</Badge>
                        <Badge className={getDifficultyColor(currentCard?.difficulty || 'Easy')}>
                          {currentCard?.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                      <h2 className="text-3xl font-bold text-primary text-center">
                        {currentCard?.term}
                      </h2>
                      <p className="text-gray-500 mt-4 text-center">
                        Click to reveal definition
                      </p>
                    </CardContent>
                  </Card>

                  {/* Back */}
                  <Card
                    className="absolute inset-0 backface-hidden flex flex-col rotate-y-180"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-primary">{currentCard?.term}</h3>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar();
                        }}>
                          <Star className={cn(
                            "w-5 h-5",
                            currentCard?.starred ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          )} />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-6">
                      <p className="text-gray-700 mb-4">{currentCard?.definition}</p>
                      {currentCard?.example && (
                        <div className="mt-4 p-3 bg-violet-50 rounded-lg">
                          <p className="text-sm text-violet-700">
                            <span className="font-medium">Example: </span>
                            {currentCard.example}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {studySessionStarted && isFlipped ? (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnknown();
                      }}
                      className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Still Learning
                    </Button>
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKnown();
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Got It!
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleFlip}
                    className="gap-2 px-8"
                  >
                    <RotateCw className="w-5 h-5" />
                    Flip Card
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex === filteredCards.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Navigation Dots */}
              <div className="flex justify-center gap-1 mt-6 flex-wrap max-w-lg mx-auto">
                {filteredCards.slice(0, 30).map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsFlipped(false);
                    }}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      idx === currentIndex
                        ? "bg-violet-500 scale-125"
                        : card.mastered
                          ? "bg-green-400"
                          : card.starred
                            ? "bg-amber-400"
                            : "bg-gray-200 hover:bg-gray-300"
                    )}
                  />
                ))}
                {filteredCards.length > 30 && (
                  <span className="text-xs text-gray-400 ml-2">+{filteredCards.length - 30} more</span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div variants={fadeInUp}>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Study Tips</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Click on the card or press Space to flip it</li>
                    <li>• Star cards you want to review more often</li>
                    <li>• Use Study Mode to track your progress</li>
                    <li>• Focus on one category at a time for better retention</li>
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

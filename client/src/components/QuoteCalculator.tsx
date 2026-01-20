import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  Clock,
  Phone,
  Mail,
  User,
  MapPin,
  Heart,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  Home,
  PiggyBank,
  TrendingUp,
  Baby,
  Briefcase,
  DollarSign,
  Calendar,
  Scale,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface DiscoveryAnswers {
  primaryGoal: string[]; // Multi-select: can have multiple goals
  familySituation: string;
  financialPriority: string;
  coverageDuration: string;
  healthStatus: string;
  monthlyBudget: string;
  cashValueImportance: string;
  existingCoverage: string;
}

interface PersonalInfo {
  age: number | null;
  gender: string;
  smoker: boolean | null;
  zipCode: string;
}

interface Beneficiary {
  firstName: string;
  lastName: string;
  relationship: string;
  percentage: number;
}

interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  zipCode: string; // Pre-filled from personal info
  healthAnswers: Record<string, boolean | null>;
  beneficiaries: Beneficiary[];
}

interface Recommendation {
  productType: string;
  productName: string;
  coverageAmount: number;
  termLength: string;
  monthlyRate: number;
  annualRate: number;
  reasoning: string[];
  benefits: string[];
  alternativeProducts: {
    name: string;
    reason: string;
  }[];
}

type Phase = "discovery" | "personal" | "recommendation" | "application" | "review" | "submitted";

// ============================================
// DISCOVERY QUESTIONS
// ============================================

const discoveryQuestions = [
  {
    id: "primaryGoal",
    question: "What are your goals with life insurance?",
    subtitle: "Select all that apply - most people have multiple reasons",
    icon: Target,
    multiSelect: true, // Allow selecting multiple options
    options: [
      {
        value: "protect_family",
        label: "Protect my family",
        description: "Replace my income if something happens to me",
        icon: Users,
      },
      {
        value: "pay_debts",
        label: "Cover debts & mortgage",
        description: "Ensure my family isn't burdened with payments",
        icon: Home,
      },
      {
        value: "leave_inheritance",
        label: "Leave an inheritance",
        description: "Pass wealth to my children or loved ones",
        icon: PiggyBank,
      },
      {
        value: "build_wealth",
        label: "Build cash value",
        description: "Use insurance as a financial planning tool",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "familySituation",
    question: "What best describes your family situation?",
    subtitle: "Your coverage needs depend on who relies on you",
    icon: Users,
    options: [
      {
        value: "single_no_dependents",
        label: "Single, no dependents",
        description: "Just myself to consider",
        icon: User,
      },
      {
        value: "married_no_kids",
        label: "Married or partnered",
        description: "No children yet",
        icon: Heart,
      },
      {
        value: "young_children",
        label: "Have young children",
        description: "Kids under 18 at home",
        icon: Baby,
      },
      {
        value: "adult_children_elderly",
        label: "Adult children or caring for parents",
        description: "Different stage of life",
        icon: Users,
      },
    ],
  },
  {
    id: "financialPriority",
    question: "What's most important to you financially?",
    subtitle: "We'll match coverage to your priorities",
    icon: Scale,
    options: [
      {
        value: "low_cost",
        label: "Keep costs low",
        description: "Maximum coverage for minimum premium",
        icon: DollarSign,
      },
      {
        value: "max_coverage",
        label: "Maximum protection",
        description: "Comprehensive coverage is worth the cost",
        icon: Shield,
      },
      {
        value: "build_value",
        label: "Build long-term value",
        description: "I want my premiums working for me",
        icon: TrendingUp,
      },
      {
        value: "flexibility",
        label: "Flexibility to adjust",
        description: "My needs may change over time",
        icon: Target,
      },
    ],
  },
  {
    id: "coverageDuration",
    question: "How long do you need coverage for?",
    subtitle: "This determines the type of policy that fits best",
    icon: Calendar,
    options: [
      {
        value: "until_kids_grown",
        label: "Until my kids are grown",
        description: "10-20 years of protection",
        icon: Baby,
      },
      {
        value: "until_mortgage_paid",
        label: "Until mortgage is paid",
        description: "Match my home loan timeline",
        icon: Home,
      },
      {
        value: "entire_life",
        label: "For my entire life",
        description: "Permanent, lifelong coverage",
        icon: Shield,
      },
      {
        value: "not_sure",
        label: "I'm not sure yet",
        description: "Help me figure it out",
        icon: Target,
      },
    ],
  },
  {
    id: "healthStatus",
    question: "How would you describe your current health?",
    subtitle: "This helps us find the best approval path for you",
    icon: Heart,
    options: [
      {
        value: "excellent",
        label: "Excellent",
        description: "No health issues, active lifestyle",
        icon: Sparkles,
      },
      {
        value: "good",
        label: "Good",
        description: "Minor issues, generally healthy",
        icon: Check,
      },
      {
        value: "fair",
        label: "Fair",
        description: "Some ongoing conditions or medications",
        icon: Heart,
      },
      {
        value: "no_exam_preferred",
        label: "Prefer no medical exam",
        description: "Want simplified underwriting",
        icon: FileText,
      },
    ],
  },
  {
    id: "monthlyBudget",
    question: "What monthly budget feels comfortable?",
    subtitle: "There's no wrong answer - we'll optimize for your range",
    icon: DollarSign,
    options: [
      {
        value: "under_50",
        label: "Under $50/month",
        description: "Keep it affordable",
        icon: DollarSign,
      },
      {
        value: "50_to_100",
        label: "$50 - $100/month",
        description: "Balanced approach",
        icon: Scale,
      },
      {
        value: "100_to_200",
        label: "$100 - $200/month",
        description: "Solid coverage priority",
        icon: Shield,
      },
      {
        value: "over_200",
        label: "$200+/month",
        description: "Comprehensive protection",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "cashValueImportance",
    question: "How important is building cash value?",
    subtitle: "Some policies build savings you can access later",
    icon: PiggyBank,
    options: [
      {
        value: "not_important",
        label: "Not important",
        description: "I just want death benefit protection",
        icon: Shield,
      },
      {
        value: "nice_to_have",
        label: "Nice to have",
        description: "But not my main priority",
        icon: Check,
      },
      {
        value: "important",
        label: "Important",
        description: "I want my premiums building value",
        icon: PiggyBank,
      },
      {
        value: "very_important",
        label: "Very important",
        description: "Wealth building is a key goal",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "existingCoverage",
    question: "Do you currently have any life insurance?",
    subtitle: "We'll factor this into our recommendation",
    icon: FileText,
    options: [
      {
        value: "none",
        label: "No coverage",
        description: "This would be my first policy",
        icon: AlertCircle,
      },
      {
        value: "employer_only",
        label: "Through employer only",
        description: "Usually 1-2x salary",
        icon: Briefcase,
      },
      {
        value: "have_personal",
        label: "Have a personal policy",
        description: "Looking to review or add more",
        icon: FileText,
      },
      {
        value: "need_more",
        label: "Have coverage but need more",
        description: "Current policy isn't enough",
        icon: TrendingUp,
      },
    ],
  },
];

// ============================================
// RECOMMENDATION ENGINE
// ============================================

function generateRecommendation(
  answers: DiscoveryAnswers,
  personal: PersonalInfo
): Recommendation {
  let productType = "term";
  let termLength = "20 years";
  let coverageMultiplier = 10;
  const reasoning: string[] = [];
  const benefits: string[] = [];
  const alternatives: { name: string; reason: string }[] = [];

  // Helper to check if any goal matches (primaryGoal is now an array)
  const hasGoal = (goal: string) => answers.primaryGoal.includes(goal);

  // Determine if user wants cash value / permanent coverage
  const wantsCashValue =
    answers.cashValueImportance === "very_important" ||
    answers.cashValueImportance === "important" ||
    hasGoal("build_wealth");

  const wantsPermanent =
    answers.coverageDuration === "entire_life" ||
    hasGoal("leave_inheritance") ||
    answers.financialPriority === "build_value";

  // Product Type Logic - prioritize permanent products when user indicates interest
  if (wantsCashValue || wantsPermanent) {
    // User wants cash value or permanent coverage
    if (wantsCashValue || answers.financialPriority === "build_value") {
      // Strong interest in wealth building → IUL
      productType = "iul";
      reasoning.push("Based on your interest in building cash value and wealth accumulation");
      if (hasGoal("build_wealth")) {
        reasoning.push("IUL is ideal for your wealth-building goals");
      }
      if (answers.financialPriority === "build_value") {
        reasoning.push("Your premiums will work for you with market-linked growth potential");
      }
      benefits.push("Market-linked growth potential with downside protection");
      benefits.push("Tax-advantaged cash value you can access");
      benefits.push("Flexible premiums as your income changes");
      benefits.push("Death benefit plus living benefits");
      alternatives.push({
        name: "Whole Life",
        reason: "If you prefer guaranteed, predictable growth over market-linked returns",
      });
      alternatives.push({
        name: "Term Life",
        reason: "If you want maximum coverage at the lowest cost (no cash value)",
      });
    } else {
      // Wants permanent but not focused on growth → Whole Life
      productType = "whole";
      reasoning.push("You're looking for permanent, lifelong coverage");
      if (hasGoal("leave_inheritance")) {
        reasoning.push("Whole life ensures a guaranteed inheritance for your loved ones");
      }
      benefits.push("Coverage that never expires");
      benefits.push("Guaranteed cash value growth");
      benefits.push("Fixed premiums that never increase");
      benefits.push("Predictable, stable returns");
      alternatives.push({
        name: "IUL",
        reason: "If you want higher growth potential with some market exposure",
      });
      alternatives.push({
        name: "Term Life",
        reason: "If you want maximum coverage at the lowest cost (no cash value)",
      });
    }
  } else if (
    answers.healthStatus === "no_exam_preferred" &&
    (personal.age || 50) >= 50
  ) {
    // Older applicant wanting simplified underwriting → Final Expense
    productType = "final_expense";
    reasoning.push("Simplified underwriting with no medical exam required");
    benefits.push("Guaranteed acceptance options available");
    benefits.push("Coverage typically starts immediately");
    benefits.push("Affordable premiums for essential coverage");
    alternatives.push({
      name: "Term Life",
      reason: "If you qualify and want more coverage for less",
    });
  } else {
    // Default to term for pure protection needs
    productType = "term";
    reasoning.push("Term life offers the most coverage for your budget");
    if (answers.financialPriority === "low_cost") {
      reasoning.push("Maximizes your death benefit protection at the lowest cost");
    }
    benefits.push("Affordable premiums locked in for the full term");
    benefits.push("Simple, straightforward protection");
    benefits.push("Easy to understand - pure death benefit coverage");
    alternatives.push({
      name: "Whole Life",
      reason: "If you want permanent coverage that builds cash value",
    });
    alternatives.push({
      name: "IUL",
      reason: "If you want coverage plus wealth-building potential",
    });
  }

  // Term Length Logic
  if (productType === "term") {
    if (answers.coverageDuration === "until_kids_grown") {
      if (answers.familySituation === "young_children") {
        termLength = "20 years";
        reasoning.push("20-year term covers until your children are independent");
      } else {
        termLength = "15 years";
      }
    } else if (answers.coverageDuration === "until_mortgage_paid") {
      termLength = "30 years";
      reasoning.push("30-year term aligns with typical mortgage duration");
    } else if (answers.financialPriority === "low_cost") {
      termLength = "10 years";
      reasoning.push("10-year term offers lowest premiums");
    } else {
      termLength = "20 years";
      reasoning.push("20-year term balances coverage length and affordability");
    }
  } else {
    termLength = "Permanent";
  }

  // Coverage Amount Logic - consider all selected goals
  // Priority: protect_family > leave_inheritance > pay_debts > build_wealth
  if (hasGoal("protect_family")) {
    coverageMultiplier = 12;
    reasoning.push("Income replacement typically needs 10-12x annual salary");
  } else if (hasGoal("leave_inheritance")) {
    coverageMultiplier = 15;
    reasoning.push("Higher coverage to leave meaningful inheritance");
  } else if (hasGoal("pay_debts")) {
    coverageMultiplier = 8;
    reasoning.push("Coverage sized to pay off debts plus provide cushion");
  }

  // Adjust for family situation
  if (answers.familySituation === "young_children") {
    coverageMultiplier += 2;
    reasoning.push("Added coverage for young children's future needs (education, etc.)");
  } else if (answers.familySituation === "single_no_dependents") {
    coverageMultiplier = 5;
    reasoning.push("Lower coverage appropriate for no dependents");
  }

  // Budget adjustment - realistic coverage amounts based on what premiums can buy
  // These are rough estimates assuming healthy non-smoker in their 30s-40s
  let baseCoverage = 500000;
  if (answers.monthlyBudget === "under_50") {
    // $50/mo can typically buy $500k-$750k term for young healthy person
    baseCoverage = productType === "term" ? 500000 : 100000;
  } else if (answers.monthlyBudget === "50_to_100") {
    // $50-100/mo can buy significant term coverage or modest permanent
    baseCoverage = productType === "term" ? 1000000 : 250000;
  } else if (answers.monthlyBudget === "100_to_200") {
    // $100-200/mo opens up substantial coverage options
    baseCoverage = productType === "term" ? 2000000 : 500000;
  } else if (answers.monthlyBudget === "over_200") {
    // $200+/mo can buy premium coverage - no artificial cap
    baseCoverage = productType === "term" ? 3000000 : 1000000;
    // For IUL/whole life at $200+, they could be looking at significant wealth building
    if (productType === "iul") {
      baseCoverage = 1500000;
      reasoning.push("Higher budget allows for substantial cash value accumulation alongside death benefit");
    }
  }

  // Final Expense specific coverage
  if (productType === "final_expense") {
    baseCoverage = 25000;
    termLength = "Whole Life";
  }

  // Calculate rate
  const rates = calculateRate(productType, baseCoverage, termLength, personal);

  // Product display names
  const productNames: Record<string, string> = {
    term: "Term Life Insurance",
    whole: "Whole Life Insurance",
    iul: "Indexed Universal Life (IUL)",
    final_expense: "Final Expense Insurance",
  };

  return {
    productType,
    productName: productNames[productType] || "Term Life Insurance",
    coverageAmount: baseCoverage,
    termLength,
    monthlyRate: rates.monthly,
    annualRate: rates.annual,
    reasoning,
    benefits,
    alternativeProducts: alternatives,
  };
}

function calculateRate(
  productType: string,
  coverage: number,
  termLength: string,
  personal: PersonalInfo
): { monthly: number; annual: number } {
  const baseRates: Record<string, number> = {
    term: 0.12,
    whole: 0.85,
    iul: 0.65,
    final_expense: 8.5,
  };

  let baseRate = baseRates[productType] || 0.15;
  const age = personal.age || 35;
  const ageFactor = 1 + (age - 25) * 0.028;
  const genderFactor = personal.gender === "female" ? 0.9 : 1;
  const smokerFactor = personal.smoker ? 2.3 : 1;

  const termFactors: Record<string, number> = {
    "10 years": 0.65,
    "15 years": 0.8,
    "20 years": 1,
    "25 years": 1.15,
    "30 years": 1.35,
    Permanent: 1.5,
    "Whole Life": 1.5,
  };
  const termFactor = termFactors[termLength] || 1;

  const annualRate =
    (coverage / 1000) * baseRate * ageFactor * genderFactor * smokerFactor * termFactor;
  const monthlyRate = annualRate / 12;

  return {
    monthly: Math.round(monthlyRate * 100) / 100,
    annual: Math.round(annualRate * 100) / 100,
  };
}

// ============================================
// CONSTANTS
// ============================================

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "Washington D.C." }
];

const HEALTH_QUESTIONS = [
  { id: "chronic_condition", question: "Have you been diagnosed with or treated for any chronic condition in the past 5 years?" },
  { id: "hospitalized", question: "Have you been hospitalized overnight in the past 2 years (excluding childbirth)?" },
  { id: "medication", question: "Are you currently taking prescription medication for any ongoing health condition?" },
  { id: "hazardous_activity", question: "Do you participate in hazardous activities (skydiving, racing, etc.)?" },
  { id: "dui", question: "Have you had a DUI or DWI conviction in the past 5 years?" },
];

const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other Family", "Trust", "Estate", "Other"];

// ============================================
// ANIMATION VARIANTS
// ============================================

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
};

// ============================================
// MAIN COMPONENT
// ============================================

// Export the prefill data type for use by parent components
export interface QuoteCalculatorPrefillData {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  tobacco?: boolean;
  zipCode?: string;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
}

interface QuoteCalculatorProps {
  prefillData?: QuoteCalculatorPrefillData | null;
}

export default function QuoteCalculator({ prefillData }: QuoteCalculatorProps) {
  const [phase, setPhase] = useState<Phase>("discovery");
  const [discoveryStep, setDiscoveryStep] = useState(0);
  const [applicationStep, setApplicationStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [discoveryAnswers, setDiscoveryAnswers] = useState<DiscoveryAnswers>({
    primaryGoal: [], // Multi-select array
    familySituation: "",
    financialPriority: "",
    coverageDuration: "",
    healthStatus: "",
    monthlyBudget: "",
    cashValueImportance: "",
    existingCoverage: "",
  });

  // Pre-fill personal info from widget data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    age: prefillData?.age ?? null,
    gender: prefillData?.gender || "",
    smoker: prefillData?.tobacco ?? null,
    zipCode: prefillData?.zipCode || "",
  });

  // Pre-fill application data from widget data
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: prefillData?.firstName || "",
    lastName: prefillData?.lastName || "",
    email: "",
    phone: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zipCode: prefillData?.zipCode || "",
    healthAnswers: {},
    beneficiaries: [{ firstName: "", lastName: "", relationship: "", percentage: 100 }],
  });

  // Store height/weight for potential use in underwriting
  const [healthMetrics] = useState({
    heightFeet: prefillData?.heightFeet || 5,
    heightInches: prefillData?.heightInches || 8,
    weight: prefillData?.weight || 170,
  });

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const currentQuestion = discoveryQuestions[discoveryStep];
  const isMultiSelect = (currentQuestion as { multiSelect?: boolean }).multiSelect === true;

  // ============================================
  // NAVIGATION
  // ============================================

  const handleDiscoverySelect = (value: string) => {
    const questionId = currentQuestion.id as keyof DiscoveryAnswers;

    if (isMultiSelect) {
      // Toggle selection for multi-select questions
      const currentValues = discoveryAnswers.primaryGoal;
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      setDiscoveryAnswers({ ...discoveryAnswers, [questionId]: newValues });
      // Don't auto-advance for multi-select
    } else {
      // Single select - set value and auto-advance
      setDiscoveryAnswers({ ...discoveryAnswers, [questionId]: value });

      // Auto-advance after selection
      setTimeout(() => {
        if (discoveryStep < discoveryQuestions.length - 1) {
          setDirection(1);
          setDiscoveryStep(discoveryStep + 1);
        } else {
          setPhase("personal");
        }
      }, 300);
    }
  };

  const handleDiscoveryContinue = () => {
    // Manual continue for multi-select questions
    if (discoveryStep < discoveryQuestions.length - 1) {
      setDirection(1);
      setDiscoveryStep(discoveryStep + 1);
    } else {
      setPhase("personal");
    }
  };

  const handleDiscoveryBack = () => {
    if (discoveryStep > 0) {
      setDirection(-1);
      setDiscoveryStep(discoveryStep - 1);
    }
  };

  const handlePersonalComplete = () => {
    const rec = generateRecommendation(discoveryAnswers, personalInfo);
    setRecommendation(rec);
    setPhase("recommendation");
  };

  const handleStartApplication = () => {
    // Pre-fill ZIP code from personal info into application address
    if (personalInfo.zipCode && !applicationData.zipCode) {
      setApplicationData(prev => ({ ...prev, zipCode: personalInfo.zipCode }));
    }
    setPhase("application");
    setApplicationStep(0);
  };

  const handleApplicationNext = () => {
    if (applicationStep < 2) {
      setDirection(1);
      setApplicationStep(applicationStep + 1);
    } else {
      setPhase("review");
    }
  };

  const handleApplicationBack = () => {
    if (applicationStep > 0) {
      setDirection(-1);
      setApplicationStep(applicationStep - 1);
    } else {
      setPhase("recommendation");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setApplicationId(`HLS-${Date.now()}`);
    setSubmitting(false);
    setPhase("submitted");
  };

  const resetForm = () => {
    setPhase("discovery");
    setDiscoveryStep(0);
    setApplicationStep(0);
    setDiscoveryAnswers({
      primaryGoal: [],
      familySituation: "",
      financialPriority: "",
      coverageDuration: "",
      healthStatus: "",
      monthlyBudget: "",
      cashValueImportance: "",
      existingCoverage: "",
    });
    setPersonalInfo({ age: null, gender: "", smoker: null, zipCode: "" });
    setRecommendation(null);
    setApplicationId(null);
  };

  // ============================================
  // VALIDATION
  // ============================================

  const isPersonalValid = () =>
    personalInfo.age !== null &&
    personalInfo.age >= 18 &&
    personalInfo.age <= 85 &&
    personalInfo.gender !== "" &&
    personalInfo.smoker !== null &&
    personalInfo.zipCode.length === 5;

  const isAppStep1Valid = () =>
    applicationData.firstName.length >= 2 &&
    applicationData.lastName.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationData.email) &&
    applicationData.phone.replace(/\D/g, "").length === 10 &&
    applicationData.dateOfBirth !== "";

  const isAppStep2Valid = () =>
    applicationData.street.length >= 5 &&
    applicationData.city.length >= 2 &&
    applicationData.state !== "" &&
    applicationData.zipCode.length === 5;

  const isAppStep3Valid = () => {
    // Check all beneficiaries are valid
    const allBeneficiariesValid = applicationData.beneficiaries.every(
      (b) => b.firstName.length >= 2 && b.lastName.length >= 2 && b.relationship !== ""
    );
    // Check percentages add up to 100
    const totalPercentage = applicationData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    return allBeneficiariesValid && totalPercentage === 100 && applicationData.beneficiaries.length > 0;
  };

  const isAppStepValid = () => {
    if (applicationStep === 0) return isAppStep1Valid();
    if (applicationStep === 1) return isAppStep2Valid();
    return isAppStep3Valid();
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Beneficiary management helpers
  const addBeneficiary = () => {
    const currentTotal = applicationData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    const remainingPercentage = Math.max(0, 100 - currentTotal);
    setApplicationData({
      ...applicationData,
      beneficiaries: [
        ...applicationData.beneficiaries,
        { firstName: "", lastName: "", relationship: "", percentage: remainingPercentage },
      ],
    });
  };

  const removeBeneficiary = (index: number) => {
    if (applicationData.beneficiaries.length <= 1) return;
    const newBeneficiaries = applicationData.beneficiaries.filter((_, i) => i !== index);
    // If only one left, set to 100%
    if (newBeneficiaries.length === 1) {
      newBeneficiaries[0].percentage = 100;
    }
    setApplicationData({ ...applicationData, beneficiaries: newBeneficiaries });
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string | number) => {
    const newBeneficiaries = [...applicationData.beneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    setApplicationData({ ...applicationData, beneficiaries: newBeneficiaries });
  };

  const getTotalPercentage = () => applicationData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  // ============================================
  // RENDER: DISCOVERY PHASE
  // ============================================

  const renderDiscovery = () => (
    <div className="space-y-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {discoveryStep + 1} of {discoveryQuestions.length}
          </span>
          <span className="text-sm font-medium text-heritage-primary">
            {Math.round(((discoveryStep + 1) / discoveryQuestions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-heritage-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((discoveryStep + 1) / discoveryQuestions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={discoveryStep}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Question Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <currentQuestion.icon className="w-6 h-6 text-heritage-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {currentQuestion.question}
              </h2>
              <p className="text-gray-500">{currentQuestion.subtitle}</p>
            </div>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const questionId = currentQuestion.id as keyof DiscoveryAnswers;
              const isSelected = isMultiSelect
                ? discoveryAnswers.primaryGoal.includes(option.value)
                : discoveryAnswers[questionId] === option.value;

              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleDiscoverySelect(option.value)}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-heritage-primary bg-heritage-primary/5"
                      : "border-gray-200 hover:border-heritage-primary/50 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox style for multi-select */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-heritage-primary text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isMultiSelect && isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <option.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-0.5">{option.label}</h3>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-heritage-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Continue button for multi-select */}
          {isMultiSelect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <button
                onClick={handleDiscoveryContinue}
                disabled={discoveryAnswers.primaryGoal.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-heritage-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-sm text-gray-500 mt-2">
                {discoveryAnswers.primaryGoal.length === 0
                  ? "Select at least one goal"
                  : `${discoveryAnswers.primaryGoal.length} selected`}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {discoveryStep > 0 && (
        <button
          onClick={handleDiscoveryBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous question
        </button>
      )}
    </div>
  );

  // ============================================
  // RENDER: PERSONAL INFO PHASE
  // ============================================

  const renderPersonal = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-heritage-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-heritage-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Almost there!</h2>
          <p className="text-gray-500">A few quick details to personalize your quote</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
            <input
              type="number"
              min="18"
              max="85"
              value={personalInfo.age || ""}
              onChange={(e) => setPersonalInfo({ ...personalInfo, age: parseInt(e.target.value) || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
              placeholder="35"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
            <input
              type="text"
              value={personalInfo.zipCode}
              onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
              placeholder="60601"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="grid grid-cols-2 gap-4">
            {["male", "female"].map((g) => (
              <button
                key={g}
                onClick={() => setPersonalInfo({ ...personalInfo, gender: g })}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all capitalize ${
                  personalInfo.gender === g
                    ? "border-heritage-primary bg-heritage-primary/5 text-heritage-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Do you use tobacco?</label>
          <div className="grid grid-cols-2 gap-4">
            {[{ v: false, l: "No" }, { v: true, l: "Yes" }].map((opt) => (
              <button
                key={opt.l}
                onClick={() => setPersonalInfo({ ...personalInfo, smoker: opt.v })}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  personalInfo.smoker === opt.v
                    ? "border-heritage-primary bg-heritage-primary/5 text-heritage-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => { setPhase("discovery"); setDiscoveryStep(discoveryQuestions.length - 1); }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handlePersonalComplete}
          disabled={!isPersonalValid()}
          className="flex items-center gap-2 px-6 py-3 bg-heritage-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          See My Recommendation
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  // ============================================
  // RENDER: RECOMMENDATION PHASE
  // ============================================

  const renderRecommendation = () => {
    if (!recommendation) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Personalized Recommendation
          </h2>
          <p className="text-gray-600">Based on your goals and situation</p>
        </div>

        {/* Main Recommendation Card */}
        <div className="bg-heritage-primary rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">We Recommend</p>
              <h3 className="text-2xl font-bold text-white">{recommendation.productName}</h3>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm mb-1">Starting at</p>
              <p className="text-3xl font-bold text-white">${recommendation.monthlyRate.toFixed(0)}<span className="text-lg text-white">/mo</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-sm">Coverage Amount</p>
              <p className="font-semibold text-lg text-white">${recommendation.coverageAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Term Length</p>
              <p className="font-semibold text-lg text-white">{recommendation.termLength}</p>
            </div>
          </div>
        </div>

        {/* Why This Recommendation */}
        <div className="bg-blue-50 rounded-xl p-5">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Why this fits your needs
          </h4>
          <ul className="space-y-2">
            {recommendation.reasoning.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-blue-800 text-sm">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Benefits */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h4 className="font-semibold text-gray-900 mb-3">Key Benefits</h4>
          <div className="grid gap-3">
            {recommendation.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-heritage-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-heritage-primary" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Options */}
        {recommendation.alternativeProducts.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 mb-3">Other Options to Consider</h4>
            {recommendation.alternativeProducts.map((alt, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900">{alt.name}:</span>{" "}
                  <span className="text-gray-600">{alt.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleStartApplication}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-heritage-primary text-white rounded-xl font-semibold hover:bg-heritage-dark transition-colors text-lg"
          >
            Continue to Application
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <a
              href="tel:+16307780800"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Speak with an Agent
            </a>
            <button
              onClick={resetForm}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================
  // RENDER: APPLICATION PHASE
  // ============================================

  const renderApplication = () => (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Application Step {applicationStep + 1} of 3
        </span>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs text-gray-500">Secure & Encrypted</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-heritage-primary h-2 rounded-full transition-all"
          style={{ width: `${((applicationStep + 1) / 3) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {applicationStep === 0 && (
          <motion.div
            key="app-1"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-heritage-primary" />
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={applicationData.firstName}
                  onChange={(e) => setApplicationData({ ...applicationData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={applicationData.lastName}
                  onChange={(e) => setApplicationData({ ...applicationData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={applicationData.email}
                onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={applicationData.phone}
                onChange={(e) => setApplicationData({ ...applicationData, phone: formatPhone(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={applicationData.dateOfBirth}
                onChange={(e) => setApplicationData({ ...applicationData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
              />
            </div>
          </motion.div>
        )}

        {applicationStep === 1 && (
          <motion.div
            key="app-2"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-heritage-primary" />
              <h3 className="text-xl font-bold text-gray-900">Your Address</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={applicationData.street}
                onChange={(e) => setApplicationData({ ...applicationData, street: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={applicationData.city}
                  onChange={(e) => setApplicationData({ ...applicationData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={applicationData.state}
                  onChange={(e) => setApplicationData({ ...applicationData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={applicationData.zipCode}
                  onChange={(e) => setApplicationData({ ...applicationData, zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}

        {applicationStep === 2 && (
          <motion.div
            key="app-3"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-heritage-primary" />
                <h3 className="text-xl font-bold text-gray-900">Beneficiary Information</h3>
              </div>
              {applicationData.beneficiaries.length < 4 && (
                <button
                  onClick={addBeneficiary}
                  className="flex items-center gap-1 text-sm text-heritage-primary hover:text-heritage-dark font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Beneficiary
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Who should receive the policy benefit? {applicationData.beneficiaries.length > 1 && "Percentages must total 100%."}
            </p>

            {applicationData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Beneficiary {index + 1}
                  </span>
                  {applicationData.beneficiaries.length > 1 && (
                    <button
                      onClick={() => removeBeneficiary(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      value={beneficiary.firstName}
                      onChange={(e) => updateBeneficiary(index, "firstName", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={beneficiary.lastName}
                      onChange={(e) => updateBeneficiary(index, "lastName", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                    <select
                      value={beneficiary.relationship}
                      onChange={(e) => updateBeneficiary(index, "relationship", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Percentage (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={beneficiary.percentage}
                      onChange={(e) => updateBeneficiary(index, "percentage", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Percentage total indicator */}
            {applicationData.beneficiaries.length > 1 && (
              <div className={`text-sm font-medium text-center py-2 rounded-lg ${
                getTotalPercentage() === 100
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                Total: {getTotalPercentage()}% {getTotalPercentage() !== 100 && "(must equal 100%)"}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={handleApplicationBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleApplicationNext}
          disabled={!isAppStepValid()}
          className="flex items-center gap-2 px-6 py-3 bg-heritage-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {applicationStep === 2 ? "Review Application" : "Continue"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: REVIEW PHASE
  // ============================================

  const renderReview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-heritage-primary" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Your Application</h2>
          <p className="text-gray-500">Please verify all information is correct</p>
        </div>
      </div>

      {/* Coverage Summary */}
      {recommendation && (
        <div className="bg-heritage-primary rounded-xl p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/70 text-sm">Your Coverage</p>
              <p className="font-bold text-lg">{recommendation.productName}</p>
              <p className="text-sm">${recommendation.coverageAmount.toLocaleString()} • {recommendation.termLength}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Monthly</p>
              <p className="text-2xl font-bold">${recommendation.monthlyRate.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Name:</span> {applicationData.firstName} {applicationData.lastName}</div>
          <div><span className="text-gray-500">Email:</span> {applicationData.email}</div>
          <div><span className="text-gray-500">Phone:</span> {applicationData.phone}</div>
          <div><span className="text-gray-500">DOB:</span> {applicationData.dateOfBirth}</div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Address
        </h4>
        <p className="text-sm text-gray-700">
          {applicationData.street}<br />
          {applicationData.city}, {applicationData.state} {applicationData.zipCode}
        </p>
      </div>

      {/* Beneficiaries */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" /> {applicationData.beneficiaries.length > 1 ? "Beneficiaries" : "Beneficiary"}
        </h4>
        <div className="space-y-2">
          {applicationData.beneficiaries.map((b, i) => (
            <p key={i} className="text-sm text-gray-700">
              {b.firstName} {b.lastName} ({b.relationship}) - {b.percentage}%
            </p>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        By submitting, you confirm all information is accurate and authorize Heritage Life Solutions
        to verify this information for underwriting purposes.
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 bg-heritage-primary text-white rounded-xl font-semibold hover:bg-heritage-dark disabled:opacity-70 transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Submit Application
            </>
          )}
        </button>
        <button
          onClick={() => { setPhase("application"); setApplicationStep(2); }}
          disabled={submitting}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Go Back to Edit
        </button>
      </div>
    </motion.div>
  );

  // ============================================
  // RENDER: SUBMITTED PHASE
  // ============================================

  const renderSubmitted = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-600">Thank you for choosing Heritage Life Solutions</p>
      </div>

      {applicationId && (
        <div className="bg-gray-50 rounded-xl p-4 inline-block">
          <p className="text-sm text-gray-500">Reference Number</p>
          <p className="text-xl font-mono font-bold text-heritage-primary">{applicationId}</p>
        </div>
      )}

      <div className="bg-heritage-primary/5 rounded-xl p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
        <div className="space-y-4">
          {[
            { step: "1", title: "Application Review", desc: "Our team will review within 24-48 hours" },
            { step: "2", title: "Confirmation Email", desc: `You'll receive updates at ${applicationData.email}` },
            { step: "3", title: "Policy Issuance", desc: "Once approved, your policy documents will be sent" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-heritage-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-gray-600">Questions? We're here to help.</p>
        <div className="flex gap-3 justify-center">
          <a
            href="tel:+16307780800"
            className="flex items-center gap-2 px-6 py-3 bg-heritage-primary text-white rounded-lg font-medium hover:bg-heritage-dark transition-colors"
          >
            <Phone className="w-4 h-4" />
            (630) 778-0800
          </a>
          <a
            href="mailto:support@heritagels.com"
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </a>
        </div>
      </div>

      <button onClick={resetForm} className="text-heritage-primary hover:underline font-medium">
        Start a new quote
      </button>
    </motion.div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        {phase === "discovery" && renderDiscovery()}
        {phase === "personal" && renderPersonal()}
        {phase === "recommendation" && renderRecommendation()}
        {phase === "application" && renderApplication()}
        {phase === "review" && renderReview()}
        {phase === "submitted" && renderSubmitted()}
      </div>
    </div>
  );
}

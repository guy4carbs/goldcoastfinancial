/**
 * LessonContentModal - Interactive lesson content viewer
 *
 * Handles three lesson types:
 * - Video: Educational video player with progress tracking
 * - Reading: Formatted text content with key takeaways
 * - Quiz: Interactive assessment with immediate feedback
 *
 * Follows Heritage Design System guidelines
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  FileText,
  Brain,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
  Award,
  Lightbulb,
  BookOpen,
  RotateCcw,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  MOTION,
} from "@/lib/heritageDesignSystem";

// ============================================
// LESSON CONTENT DATA
// ============================================

export interface VideoContent {
  title: string;
  duration: string;
  description: string;
  keyPoints: string[];
  transcript?: string;
}

export interface ReadingContent {
  title: string;
  duration: string;
  sections: {
    heading: string;
    content: string;
  }[];
  keyTakeaways: string[];
}

export interface QuizContent {
  title: string;
  duration: string;
  passingScore: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export type LessonContent =
  | { type: "video"; data: VideoContent }
  | { type: "reading"; data: ReadingContent }
  | { type: "quiz"; data: QuizContent };

// Full lesson content database
export const LESSON_CONTENT: Record<string, LessonContent> = {
  // Module 1: Introduction to Life Insurance
  "l1-1": {
    type: "video",
    data: {
      title: "What is Life Insurance?",
      duration: "8 min",
      description: "An introduction to the fundamental concept of life insurance and how it provides financial protection for loved ones.",
      keyPoints: [
        "Life insurance is a contract between a policyholder and an insurance company",
        "The insurer promises to pay a designated beneficiary a sum of money upon the death of the insured",
        "Premiums are paid by the policyholder in exchange for this protection",
        "Life insurance can provide income replacement, debt payoff, and legacy planning"
      ],
      transcript: "Life insurance is fundamentally a promise—a contract between you and an insurance company that ensures your loved ones will be financially protected when you're no longer there to provide for them..."
    }
  },
  "l1-2": {
    type: "reading",
    data: {
      title: "The History of Life Insurance",
      duration: "6 min",
      sections: [
        {
          heading: "Ancient Origins",
          content: "The concept of life insurance dates back to ancient Rome, where burial clubs called 'collegia' would cover funeral expenses and provide financial support to surviving family members. Members would pay regular dues, and upon death, the club would pay for burial costs and provide stipends to the family."
        },
        {
          heading: "Modern Life Insurance",
          content: "The first modern life insurance company was founded in London in 1706 by the Amicable Society for a Perpetual Assurance Office. This organization introduced the concept of age-based premiums—a revolutionary idea that recognized mortality risk varied by age."
        },
        {
          heading: "Life Insurance in America",
          content: "The first American life insurance company, the Presbyterian Ministers' Fund, was established in 1759 in Philadelphia. The industry grew significantly after the Civil War as families recognized the need for financial protection. Today, the U.S. life insurance industry manages over $21 trillion in assets."
        },
        {
          heading: "The Modern Era",
          content: "Today's life insurance industry offers diverse products including term life, whole life, universal life, and variable life insurance. Technological advances have streamlined underwriting, allowing for faster approvals and more personalized coverage options."
        }
      ],
      keyTakeaways: [
        "Life insurance concepts date back thousands of years to ancient Rome",
        "Modern life insurance began in 1706 with age-based premium calculations",
        "The American life insurance industry started in 1759",
        "Today's industry offers diverse products and uses technology for faster service"
      ]
    }
  },
  "l1-3": {
    type: "video",
    data: {
      title: "Why Life Insurance Matters",
      duration: "10 min",
      description: "Understanding the critical role life insurance plays in financial planning and protecting those who depend on you.",
      keyPoints: [
        "Income replacement: Replaces lost income when a breadwinner passes away",
        "Debt protection: Pays off mortgages, car loans, and credit card debt",
        "Education funding: Ensures children can still attend college",
        "Final expenses: Covers funeral costs and medical bills",
        "Estate planning: Provides liquidity for estate taxes and wealth transfer"
      ]
    }
  },
  "l1-4": {
    type: "quiz",
    data: {
      title: "Module 1 Quiz",
      duration: "6 min",
      passingScore: 75,
      questions: [
        {
          id: "q1-1",
          question: "What is the primary purpose of life insurance?",
          options: [
            "To provide investment returns",
            "To provide financial protection for beneficiaries upon the insured's death",
            "To avoid paying taxes",
            "To build emergency savings"
          ],
          correctAnswer: 1,
          explanation: "Life insurance's primary purpose is to provide financial protection for designated beneficiaries when the insured person passes away."
        },
        {
          id: "q1-2",
          question: "When was the first modern life insurance company founded?",
          options: [
            "1650 in Paris",
            "1706 in London",
            "1759 in Philadelphia",
            "1800 in New York"
          ],
          correctAnswer: 1,
          explanation: "The Amicable Society for a Perpetual Assurance Office was founded in London in 1706, introducing age-based premiums."
        },
        {
          id: "q1-3",
          question: "Which of the following is NOT a common use of life insurance?",
          options: [
            "Income replacement",
            "Paying off debt",
            "Funding retirement",
            "Covering funeral expenses"
          ],
          correctAnswer: 2,
          explanation: "While some life insurance products have cash value that can supplement retirement, the primary uses are income replacement, debt payoff, and covering final expenses."
        },
        {
          id: "q1-4",
          question: "What were the ancient Roman burial clubs called?",
          options: [
            "Fraternitas",
            "Collegia",
            "Societatis",
            "Mutualis"
          ],
          correctAnswer: 1,
          explanation: "Ancient Roman burial clubs called 'collegia' are considered early predecessors to modern life insurance."
        }
      ]
    }
  },

  // Module 2: Types of Life Insurance
  "l2-1": {
    type: "video",
    data: {
      title: "Term Life Insurance",
      duration: "12 min",
      description: "A comprehensive look at term life insurance—the most straightforward and affordable type of life insurance coverage.",
      keyPoints: [
        "Term life provides coverage for a specific period (10, 20, or 30 years)",
        "Premiums are typically lower than permanent insurance",
        "Coverage ends when the term expires with no cash value",
        "Ideal for temporary needs like mortgage protection or raising children",
        "Can often be converted to permanent coverage without a medical exam"
      ]
    }
  },
  "l2-2": {
    type: "video",
    data: {
      title: "Whole Life Insurance",
      duration: "12 min",
      description: "Understanding whole life insurance—permanent coverage with guaranteed death benefits and cash value accumulation.",
      keyPoints: [
        "Provides lifetime coverage as long as premiums are paid",
        "Builds cash value that grows tax-deferred",
        "Premiums remain level throughout the life of the policy",
        "Cash value can be borrowed against or used to pay premiums",
        "Generally more expensive than term but offers permanent protection"
      ]
    }
  },
  "l2-3": {
    type: "video",
    data: {
      title: "Universal Life Insurance",
      duration: "10 min",
      description: "Exploring universal life insurance—flexible permanent coverage with adjustable premiums and death benefits.",
      keyPoints: [
        "Offers flexibility in premium payments and death benefit amounts",
        "Cash value earns interest based on current market rates",
        "Can increase or decrease coverage as needs change",
        "More complex than whole life but offers greater customization",
        "Requires careful monitoring to ensure adequate funding"
      ]
    }
  },
  "l2-4": {
    type: "reading",
    data: {
      title: "Variable Life Insurance",
      duration: "8 min",
      sections: [
        {
          heading: "What is Variable Life Insurance?",
          content: "Variable life insurance is a form of permanent life insurance that allows policyholders to invest the cash value portion in various sub-accounts, similar to mutual funds. This gives the policy owner potential for higher returns but also exposes them to market risk."
        },
        {
          heading: "Investment Options",
          content: "Policyholders can typically choose from stock funds, bond funds, money market funds, and balanced funds. The cash value and potentially the death benefit fluctuate based on the performance of these investments."
        },
        {
          heading: "Benefits and Risks",
          content: "The main benefit is the potential for higher returns compared to traditional whole life insurance. However, poor investment performance can reduce both cash value and death benefits. There is typically a minimum guaranteed death benefit."
        },
        {
          heading: "Who Should Consider Variable Life?",
          content: "Variable life is best suited for individuals with a higher risk tolerance, a long investment time horizon, and the financial sophistication to monitor and manage their investment choices within the policy."
        }
      ],
      keyTakeaways: [
        "Variable life allows investment of cash value in sub-accounts",
        "Returns depend on market performance—both gains and losses possible",
        "Offers potential for higher growth but with increased risk",
        "Best for financially sophisticated clients with higher risk tolerance"
      ]
    }
  },
  "l2-5": {
    type: "quiz",
    data: {
      title: "Module 2 Quiz",
      duration: "8 min",
      passingScore: 75,
      questions: [
        {
          id: "q2-1",
          question: "Which type of life insurance provides coverage for a specific period only?",
          options: [
            "Whole life insurance",
            "Term life insurance",
            "Universal life insurance",
            "Variable life insurance"
          ],
          correctAnswer: 1,
          explanation: "Term life insurance provides coverage for a specific period (term) such as 10, 20, or 30 years."
        },
        {
          id: "q2-2",
          question: "What is a key feature of whole life insurance?",
          options: [
            "Premiums that increase with age",
            "No cash value accumulation",
            "Guaranteed level premiums for life",
            "Coverage that expires after 30 years"
          ],
          correctAnswer: 2,
          explanation: "Whole life insurance features guaranteed level premiums that never increase, along with lifetime coverage and cash value accumulation."
        },
        {
          id: "q2-3",
          question: "Which type of insurance allows policyholders to adjust premium payments?",
          options: [
            "Term life insurance",
            "Whole life insurance",
            "Universal life insurance",
            "Group life insurance"
          ],
          correctAnswer: 2,
          explanation: "Universal life insurance offers flexibility in premium payments and death benefit amounts, unlike the fixed premiums of whole life."
        },
        {
          id: "q2-4",
          question: "In variable life insurance, the cash value is invested in:",
          options: [
            "Government bonds only",
            "The company's general account",
            "Sub-accounts similar to mutual funds",
            "Real estate investments"
          ],
          correctAnswer: 2,
          explanation: "Variable life insurance allows policyholders to invest the cash value in sub-accounts similar to mutual funds, including stock and bond funds."
        }
      ]
    }
  },

  // Module 3: Underwriting Basics
  "l3-1": {
    type: "video",
    data: {
      title: "What is Underwriting?",
      duration: "10 min",
      description: "Understanding the underwriting process—how insurance companies evaluate risk and determine coverage eligibility.",
      keyPoints: [
        "Underwriting is the process of evaluating risk to determine insurability",
        "Underwriters review applications, medical records, and other information",
        "The goal is to classify risk accurately and price coverage appropriately",
        "Underwriting protects both the insurance company and existing policyholders",
        "Modern underwriting increasingly uses data analytics and automation"
      ]
    }
  },
  "l3-2": {
    type: "video",
    data: {
      title: "Risk Classification",
      duration: "12 min",
      description: "Learning how insurance companies classify applicants into different risk categories.",
      keyPoints: [
        "Preferred Plus/Super Preferred: Excellent health, no tobacco, ideal build",
        "Preferred: Very good health with minor conditions",
        "Standard: Average health and mortality risk",
        "Substandard/Rated: Higher risk due to health conditions or lifestyle",
        "Declined: Risk too high to insure at any price"
      ]
    }
  },
  "l3-3": {
    type: "reading",
    data: {
      title: "Medical Underwriting",
      duration: "10 min",
      sections: [
        {
          heading: "The Medical Exam",
          content: "Most life insurance applications over certain amounts require a paramedical exam. This typically includes blood pressure measurement, blood and urine samples, height and weight recording, and a health questionnaire. Results help determine risk classification."
        },
        {
          heading: "Medical History Review",
          content: "Underwriters review the applicant's medical history through the MIB (Medical Information Bureau), attending physician statements, and prescription drug databases. Chronic conditions, surgeries, and hospitalizations are all considered."
        },
        {
          heading: "Build Charts",
          content: "Insurance companies use build charts that relate height and weight to mortality risk. Being significantly over or underweight can result in higher premiums or declined coverage. Build is one of the most significant rating factors."
        },
        {
          heading: "Accelerated Underwriting",
          content: "Many insurers now offer accelerated or simplified underwriting for healthy applicants, using data analytics, electronic health records, and prescription histories to make quick decisions without a traditional medical exam."
        }
      ],
      keyTakeaways: [
        "Paramedical exams include blood work, urinalysis, and vital signs",
        "MIB and prescription databases reveal applicant health history",
        "Build (height/weight ratio) significantly impacts risk classification",
        "Accelerated underwriting uses data analytics for faster decisions"
      ]
    }
  },
  "l3-4": {
    type: "quiz",
    data: {
      title: "Module 3 Quiz",
      duration: "8 min",
      passingScore: 75,
      questions: [
        {
          id: "q3-1",
          question: "What is the primary purpose of underwriting?",
          options: [
            "To sell more policies",
            "To evaluate risk and determine insurability",
            "To process claims quickly",
            "To market insurance products"
          ],
          correctAnswer: 1,
          explanation: "Underwriting evaluates risk to determine whether to insure an applicant and at what premium rate."
        },
        {
          id: "q3-2",
          question: "Which risk classification typically offers the lowest premiums?",
          options: [
            "Standard",
            "Preferred",
            "Preferred Plus/Super Preferred",
            "Substandard"
          ],
          correctAnswer: 2,
          explanation: "Preferred Plus or Super Preferred classifications are reserved for applicants in excellent health and offer the lowest premium rates."
        },
        {
          id: "q3-3",
          question: "What does MIB stand for?",
          options: [
            "Medical Insurance Bureau",
            "Medical Information Bureau",
            "Mutual Insurance Board",
            "Medical Investigation Board"
          ],
          correctAnswer: 1,
          explanation: "MIB (Medical Information Bureau) is a database that helps insurers share information about applicant health history."
        },
        {
          id: "q3-4",
          question: "What is accelerated underwriting?",
          options: [
            "Underwriting done by faster computers",
            "A process that skips all medical evaluation",
            "Using data analytics to make quick decisions without traditional exams",
            "Emergency underwriting for terminal patients"
          ],
          correctAnswer: 2,
          explanation: "Accelerated underwriting uses data analytics, electronic health records, and prescription histories to make faster decisions without requiring a traditional medical exam."
        }
      ]
    }
  },

  // Module 4: Policy Components
  "l4-1": {
    type: "video",
    data: {
      title: "Understanding Premiums",
      duration: "10 min",
      description: "A deep dive into how life insurance premiums are calculated and the factors that affect your cost.",
      keyPoints: [
        "Premiums are based on age, health, coverage amount, and policy type",
        "Mortality tables predict life expectancy and inform pricing",
        "Younger applicants typically pay lower premiums",
        "Tobacco use can double or triple premium costs",
        "Payment frequency (annual vs monthly) can affect total cost"
      ]
    }
  },
  "l4-2": {
    type: "video",
    data: {
      title: "Death Benefits Explained",
      duration: "12 min",
      description: "Understanding how death benefits work, including payout options and tax implications.",
      keyPoints: [
        "Death benefits are typically paid income tax-free to beneficiaries",
        "Payout options include lump sum, installments, or retained assets",
        "Beneficiary designations override wills and trusts",
        "Primary and contingent beneficiaries should be named",
        "Benefits may be reduced for policy loans or late premium payments"
      ]
    }
  },
  "l4-3": {
    type: "video",
    data: {
      title: "Cash Value & Loans",
      duration: "10 min",
      description: "Learning about the cash value component of permanent life insurance and how policy loans work.",
      keyPoints: [
        "Cash value grows tax-deferred within permanent policies",
        "Policy loans don't require credit checks or approval",
        "Outstanding loans reduce the death benefit",
        "Interest accrues on policy loans",
        "Cash value can be surrendered for its accumulated value"
      ]
    }
  },
  "l4-4": {
    type: "reading",
    data: {
      title: "Common Policy Riders",
      duration: "10 min",
      sections: [
        {
          heading: "Accelerated Death Benefit Rider",
          content: "This rider allows the policyholder to receive a portion of the death benefit while still living if diagnosed with a terminal illness. Most policies include this rider at no additional cost. It can help cover medical expenses or allow the insured to fulfill final wishes."
        },
        {
          heading: "Waiver of Premium Rider",
          content: "If the policyholder becomes totally disabled, this rider waives premium payments while keeping the policy in force. It's especially valuable for income earners whose disability would make premium payments difficult."
        },
        {
          heading: "Guaranteed Insurability Rider",
          content: "This rider allows the policyholder to purchase additional coverage at specified future dates without medical underwriting. It's particularly valuable for young people who may want to increase coverage as their family and financial obligations grow."
        },
        {
          heading: "Term Conversion Rider",
          content: "Allows term policyholders to convert to permanent insurance without evidence of insurability. This is valuable if health declines during the term period, as the new policy is issued at the original health rating."
        },
        {
          heading: "Child Term Rider",
          content: "Provides a small amount of term coverage on the policyholder's children. When the child reaches adulthood, they can convert this coverage to their own permanent policy without medical underwriting."
        }
      ],
      keyTakeaways: [
        "Accelerated death benefit provides living benefits for terminal illness",
        "Waiver of premium protects coverage during disability",
        "Guaranteed insurability allows future coverage increases without underwriting",
        "Term conversion lets you switch to permanent coverage without new medical exams"
      ]
    }
  },
  "l4-5": {
    type: "quiz",
    data: {
      title: "Module 4 Quiz",
      duration: "8 min",
      passingScore: 75,
      questions: [
        {
          id: "q4-1",
          question: "How are life insurance death benefits typically taxed?",
          options: [
            "Taxed as ordinary income",
            "Taxed as capital gains",
            "Generally received income tax-free",
            "Taxed at 15% flat rate"
          ],
          correctAnswer: 2,
          explanation: "Life insurance death benefits are generally received income tax-free by beneficiaries, making them an efficient wealth transfer tool."
        },
        {
          id: "q4-2",
          question: "What happens to the death benefit if there is an outstanding policy loan?",
          options: [
            "It remains unchanged",
            "It is reduced by the loan amount",
            "It is increased to cover interest",
            "The policy is cancelled"
          ],
          correctAnswer: 1,
          explanation: "Outstanding policy loans reduce the death benefit paid to beneficiaries by the amount of the loan plus any accrued interest."
        },
        {
          id: "q4-3",
          question: "Which rider allows purchase of additional coverage without medical underwriting?",
          options: [
            "Accelerated Death Benefit",
            "Waiver of Premium",
            "Guaranteed Insurability",
            "Term Conversion"
          ],
          correctAnswer: 2,
          explanation: "The Guaranteed Insurability Rider allows policyholders to purchase additional coverage at specified future dates without medical underwriting."
        },
        {
          id: "q4-4",
          question: "What is the main benefit of a Waiver of Premium rider?",
          options: [
            "Lower initial premiums",
            "Premium payments are waived if totally disabled",
            "Access to cash value without penalty",
            "Automatic coverage increases"
          ],
          correctAnswer: 1,
          explanation: "The Waiver of Premium rider waives premium payments if the policyholder becomes totally disabled, keeping the policy in force without payment."
        }
      ]
    }
  },

  // Module 5: Selling Life Insurance
  "l5-1": {
    type: "video",
    data: {
      title: "Needs-Based Selling",
      duration: "15 min",
      description: "Mastering the consultative approach to life insurance sales that puts client needs first.",
      keyPoints: [
        "Focus on understanding client's financial situation and goals",
        "Use fact-finding to uncover protection gaps",
        "Calculate coverage needs using income replacement or needs analysis",
        "Recommend solutions that match identified needs",
        "Build trust by acting as a financial advisor, not a salesperson"
      ]
    }
  },
  "l5-2": {
    type: "video",
    data: {
      title: "Client Discovery Process",
      duration: "12 min",
      description: "Effective techniques for gathering information and building rapport with potential clients.",
      keyPoints: [
        "Ask open-ended questions to understand the client's situation",
        "Listen actively and take notes",
        "Explore family structure, income, debts, and financial goals",
        "Identify emotional motivators (protecting family, leaving a legacy)",
        "Summarize and confirm understanding before making recommendations"
      ]
    }
  },
  "l5-3": {
    type: "reading",
    data: {
      title: "Ethical Considerations",
      duration: "10 min",
      sections: [
        {
          heading: "Fiduciary Responsibility",
          content: "While insurance agents aren't always held to a fiduciary standard, ethical agents act in their clients' best interests. This means recommending appropriate coverage amounts, suitable products, and being transparent about costs and commissions."
        },
        {
          heading: "Suitability Requirements",
          content: "Agents must ensure recommended products are suitable for the client's financial situation, needs, and objectives. Selling inappropriate or excessive coverage is not only unethical but can lead to regulatory action and legal liability."
        },
        {
          heading: "Disclosure Obligations",
          content: "Agents must fully disclose policy features, limitations, exclusions, and costs. This includes explaining surrender charges, potential for premium increases, and how cash value projections work. Hidden fees or misleading illustrations are serious violations."
        },
        {
          heading: "Replacement Rules",
          content: "When replacing an existing policy with a new one, agents must carefully document why the replacement is in the client's best interest. Churning—replacing policies primarily to generate new commissions—is prohibited and subject to penalties."
        }
      ],
      keyTakeaways: [
        "Always act in the client's best interest, not just to earn commissions",
        "Ensure all recommendations are suitable for the client's situation",
        "Fully disclose all costs, features, and limitations",
        "Document the reasons for any policy replacements"
      ]
    }
  },
  "l5-4": {
    type: "video",
    data: {
      title: "Overcoming Objections",
      duration: "10 min",
      description: "Professional techniques for addressing common client concerns and objections.",
      keyPoints: [
        "\"It's too expensive\" - Break down to daily cost, compare to discretionary spending",
        "\"I'll think about it\" - Create urgency around health and insurability",
        "\"I have coverage at work\" - Explain portability and coverage gaps",
        "\"I don't believe in insurance\" - Use stories and examples to illustrate value",
        "\"My spouse handles finances\" - Involve all decision makers early"
      ]
    }
  },
  "l5-5": {
    type: "quiz",
    data: {
      title: "Module 5 Quiz",
      duration: "8 min",
      passingScore: 75,
      questions: [
        {
          id: "q5-1",
          question: "What is the foundation of needs-based selling?",
          options: [
            "Selling the most expensive product",
            "Understanding client's situation and recommending appropriate solutions",
            "Convincing clients they need maximum coverage",
            "Focusing on product features"
          ],
          correctAnswer: 1,
          explanation: "Needs-based selling focuses on understanding the client's financial situation and goals, then recommending solutions that address identified needs."
        },
        {
          id: "q5-2",
          question: "What is 'churning' in insurance sales?",
          options: [
            "Selling multiple policies to one client",
            "Replacing policies primarily to generate new commissions",
            "Cold calling potential clients",
            "Upselling additional riders"
          ],
          correctAnswer: 1,
          explanation: "Churning is the unethical practice of replacing existing policies with new ones primarily to generate new sales commissions rather than to benefit the client."
        },
        {
          id: "q5-3",
          question: "When a client says \"it's too expensive,\" what's an effective response?",
          options: [
            "Offer a cheaper, less suitable product",
            "Pressure them to buy anyway",
            "Break down the cost to a daily amount and compare to discretionary spending",
            "End the conversation immediately"
          ],
          correctAnswer: 2,
          explanation: "Breaking down premiums to a daily cost (like \"the cost of a coffee\") and comparing to discretionary spending helps clients see the value proposition."
        },
        {
          id: "q5-4",
          question: "Why should agents involve all decision makers early in the sales process?",
          options: [
            "To sell more policies",
            "To avoid the \"I need to talk to my spouse\" objection",
            "It's required by law",
            "To intimidate clients"
          ],
          correctAnswer: 1,
          explanation: "Involving all decision makers (like a spouse) early prevents the common objection of needing to discuss with someone else before making a decision."
        }
      ]
    }
  },

  // Module 6: Final Assessment
  "l6-1": {
    type: "reading",
    data: {
      title: "Course Review",
      duration: "15 min",
      sections: [
        {
          heading: "Module 1 Recap: Introduction to Life Insurance",
          content: "Life insurance is a contract that provides financial protection to beneficiaries upon the insured's death. It dates back to ancient Rome and serves purposes including income replacement, debt protection, education funding, and estate planning."
        },
        {
          heading: "Module 2 Recap: Types of Life Insurance",
          content: "The main types are: Term (temporary, affordable), Whole Life (permanent with level premiums and cash value), Universal Life (flexible premiums and death benefits), and Variable Life (cash value invested in sub-accounts)."
        },
        {
          heading: "Module 3 Recap: Underwriting",
          content: "Underwriting evaluates risk to determine insurability and pricing. Risk classifications range from Preferred Plus to Declined. Medical underwriting involves exams, MIB checks, and prescription histories. Accelerated underwriting uses data analytics for faster decisions."
        },
        {
          heading: "Module 4 Recap: Policy Components",
          content: "Key components include premiums (based on age, health, and coverage), death benefits (typically tax-free), cash value (in permanent policies), and riders (like accelerated death benefit, waiver of premium, and guaranteed insurability)."
        },
        {
          heading: "Module 5 Recap: Selling Life Insurance",
          content: "Ethical sales focus on client needs through discovery and fact-finding. Agents must ensure suitability, make full disclosures, and avoid practices like churning. Objection handling requires empathy and education."
        }
      ],
      keyTakeaways: [
        "Life insurance provides essential financial protection for families",
        "Different policy types serve different needs and budgets",
        "Underwriting ensures fair pricing and protects all policyholders",
        "Understanding policy components helps match clients with the right coverage",
        "Ethical, needs-based selling builds long-term client relationships"
      ]
    }
  },
  "l6-2": {
    type: "quiz",
    data: {
      title: "Final Exam",
      duration: "15 min",
      passingScore: 80,
      questions: [
        {
          id: "qf-1",
          question: "Which type of life insurance typically has the lowest premiums for the same coverage amount?",
          options: [
            "Whole life insurance",
            "Universal life insurance",
            "Term life insurance",
            "Variable life insurance"
          ],
          correctAnswer: 2,
          explanation: "Term life insurance typically has the lowest premiums because it provides pure death benefit protection without cash value accumulation."
        },
        {
          id: "qf-2",
          question: "A client wants permanent coverage with the ability to adjust premiums. Which product is most suitable?",
          options: [
            "Term life",
            "Whole life",
            "Universal life",
            "Annually renewable term"
          ],
          correctAnswer: 2,
          explanation: "Universal life insurance offers permanent coverage with flexible premium payments, making it ideal for clients who want adjustability."
        },
        {
          id: "qf-3",
          question: "How does tobacco use typically affect life insurance premiums?",
          options: [
            "No effect",
            "Slight increase of 10-20%",
            "Can double or triple the premium",
            "Automatic decline"
          ],
          correctAnswer: 2,
          explanation: "Tobacco use significantly increases mortality risk and can double or even triple life insurance premiums."
        },
        {
          id: "qf-4",
          question: "Which rider allows a policyholder to access death benefits if diagnosed with a terminal illness?",
          options: [
            "Waiver of Premium",
            "Accelerated Death Benefit",
            "Guaranteed Insurability",
            "Term Conversion"
          ],
          correctAnswer: 1,
          explanation: "The Accelerated Death Benefit rider allows policyholders to receive a portion of the death benefit while still living if diagnosed with a terminal illness."
        },
        {
          id: "qf-5",
          question: "What is the purpose of the MIB in underwriting?",
          options: [
            "To sell insurance policies",
            "To share medical history information between insurers",
            "To process claims",
            "To regulate insurance agents"
          ],
          correctAnswer: 1,
          explanation: "The Medical Information Bureau (MIB) helps insurers share information about applicant health history to detect fraud and ensure accurate risk assessment."
        },
        {
          id: "qf-6",
          question: "A client objects that they already have coverage at work. What's the best response?",
          options: [
            "Agree that they don't need personal coverage",
            "Explain portability issues and potential coverage gaps",
            "Criticize their employer's plan",
            "Offer to replace their work coverage"
          ],
          correctAnswer: 1,
          explanation: "Employer coverage often isn't portable (you lose it if you leave) and may not be sufficient for the client's total needs. Explaining these gaps is the professional approach."
        },
        {
          id: "qf-7",
          question: "What happens to cash value in a whole life policy if the insured dies?",
          options: [
            "It's paid to beneficiaries in addition to the death benefit",
            "It becomes part of the death benefit",
            "It's returned to the insurance company",
            "It's taxed and then distributed"
          ],
          correctAnswer: 1,
          explanation: "When the insured dies, the cash value merges with and becomes part of the death benefit—beneficiaries don't receive both separately."
        },
        {
          id: "qf-8",
          question: "Which risk classification offers the best (lowest) premium rates?",
          options: [
            "Standard",
            "Preferred",
            "Super Preferred / Preferred Plus",
            "Substandard"
          ],
          correctAnswer: 2,
          explanation: "Super Preferred or Preferred Plus classifications are reserved for applicants in the best health and offer the lowest premium rates."
        }
      ]
    }
  }
};

// ============================================
// LESSON CONTENT MODAL COMPONENT
// ============================================

interface LessonContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string | null;
  lessonTitle: string;
  lessonType: "video" | "reading" | "quiz";
  onComplete: (lessonId: string) => void;
}

export function LessonContentModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  lessonType,
  onComplete,
}: LessonContentModalProps) {
  const content = lessonId ? LESSON_CONTENT[lessonId] : null;

  if (!content || !lessonId) return null;

  const handleComplete = () => {
    onComplete(lessonId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] p-0 overflow-visible border-0 [&>button]:hidden"
        style={{ borderRadius: RADIUS.card, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Glass Close Button - wrapped in div to avoid [&>button]:hidden */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ borderRadius: RADIUS.card }}>
          {content.type === "video" && (
            <VideoLessonContent
              data={content.data}
              onComplete={handleComplete}
              onClose={onClose}
            />
          )}
          {content.type === "reading" && (
            <ReadingLessonContent
              data={content.data}
              onComplete={handleComplete}
              onClose={onClose}
            />
          )}
          {content.type === "quiz" && (
            <QuizLessonContent
              data={content.data}
              onComplete={handleComplete}
              onClose={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// VIDEO LESSON COMPONENT
// ============================================

function VideoLessonContent({
  data,
  onComplete,
  onClose,
}: {
  data: VideoContent;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedEnough, setWatchedEnough] = useState(false);

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 2, 100);
          if (newProgress >= 80) setWatchedEnough(true);
          return newProgress;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  return (
    <div className="flex flex-col">
      {/* Video Player Area */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3 text-white text-sm mb-2">
            <Clock className="w-4 h-4" />
            <span>{data.duration}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/60">{progress}% watched</span>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <Badge className="bg-violet-600 text-white border-0 mb-2">
            <Video className="w-3 h-3 mr-1" />
            Video Lesson
          </Badge>
          <h2 className="text-white text-xl font-semibold">{data.title}</h2>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <p className="text-gray-600 mb-6">{data.description}</p>

        <div className="bg-violet-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-violet-600" />
            Key Points
          </h3>
          <ul className="space-y-2">
            {data.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onComplete}
            disabled={!watchedEnough}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            style={{ borderRadius: RADIUS.button }}
          >
            {watchedEnough ? (
              <>
                Mark Complete
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Watch 80% to Complete
                <Clock className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// READING LESSON COMPONENT
// ============================================

function ReadingLessonContent({
  data,
  onComplete,
  onClose,
}: {
  data: ReadingContent;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [readSections, setReadSections] = useState<number[]>([0]);

  const progress = Math.round((readSections.length / data.sections.length) * 100);
  const canComplete = readSections.length === data.sections.length;

  const goToSection = (index: number) => {
    setCurrentSection(index);
    if (!readSections.includes(index)) {
      setReadSections(prev => [...prev, index]);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 pt-8 text-white">
        <Badge className="bg-white/20 text-white border-0 mb-2">
          <FileText className="w-3 h-3 mr-1" />
          Reading Material
        </Badge>
        <h2 className="text-xl font-semibold mb-2">{data.title}</h2>
        <div className="flex items-center gap-4 text-sm text-white/80">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {data.duration}
          </span>
          <span>•</span>
          <span>{data.sections.length} sections</span>
          <span>•</span>
          <span>{progress}% read</span>
        </div>
        <Progress
          value={progress}
          className="mt-4 h-2 bg-white/20 [&>div]:bg-white"
        />
      </div>

      {/* Section Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {data.sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => goToSection(idx)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              currentSection === idx
                ? "border-violet-600 text-violet-600"
                : readSections.includes(idx)
                  ? "border-transparent text-gray-600 hover:text-violet-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {readSections.includes(idx) && idx !== currentSection && (
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-500" />
            )}
            {section.heading}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {data.sections[currentSection].heading}
            </h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {data.sections[currentSection].content}
            </p>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => goToSection(currentSection - 1)}
                disabled={currentSection === 0}
              >
                Previous
              </Button>
              {currentSection < data.sections.length - 1 ? (
                <Button
                  onClick={() => goToSection(currentSection + 1)}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Next Section
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Key Takeaways - shown at the end */}
        {currentSection === data.sections.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-emerald-50 rounded-xl p-5 border border-emerald-200"
          >
            <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {data.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{takeaway}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <Button
          onClick={onComplete}
          disabled={!canComplete}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          style={{ borderRadius: RADIUS.button }}
        >
          {canComplete ? (
            <>
              Mark Complete
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Read All Sections
              <BookOpen className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// QUIZ LESSON COMPONENT
// ============================================

function QuizLessonContent({
  data,
  onComplete,
  onClose,
}: {
  data: QuizContent;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = data.questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const isAnswered = selectedAnswer !== undefined;

  const totalCorrect = Object.entries(answers).filter(
    ([qId, ans]) => data.questions.find(q => q.id === qId)?.correctAnswer === ans
  ).length;
  const score = Math.round((totalCorrect / data.questions.length) * 100);
  const passed = score >= data.passingScore;

  const handleAnswer = (answerIndex: number) => {
    if (!isAnswered) {
      setAnswers(prev => ({ ...prev, [question.id]: answerIndex }));
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setShowExplanation(false);
  };

  if (showResults) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className={cn(
              "w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6",
              passed
                ? "bg-gradient-to-br from-violet-500 to-amber-500"
                : "bg-gradient-to-br from-red-500 to-rose-500"
            )}
          >
            {passed ? (
              <Award className="w-12 h-12 text-white" />
            ) : (
              <RotateCcw className="w-12 h-12 text-white" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? "Congratulations!" : "Keep Learning!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {passed
              ? "You've successfully completed this quiz."
              : `You need ${data.passingScore}% to pass. Let's try again!`}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-sm mx-auto">
            <div className="text-5xl font-bold mb-2" style={{
              background: passed
                ? "linear-gradient(135deg, #10b981, #14b8a6)"
                : "linear-gradient(135deg, #f97316, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {score}%
            </div>
            <p className="text-gray-500 text-sm">
              {totalCorrect} of {data.questions.length} correct
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Passing score: {data.passingScore}%
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {!passed && (
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button
              onClick={passed ? onComplete : onClose}
              className={cn(
                "text-white",
                passed
                  ? "bg-gradient-to-r from-violet-600 to-purple-600"
                  : "bg-gray-600"
              )}
              style={{ borderRadius: RADIUS.button }}
            >
              {passed ? (
                <>
                  Complete Lesson
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                "Close"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 pt-8 text-white">
        <Badge className="bg-white/20 text-white border-0 mb-2">
          <Brain className="w-3 h-3 mr-1" />
          Quiz
        </Badge>
        <h2 className="text-xl font-semibold mb-2">{data.title}</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">
            Question {currentQuestion + 1} of {data.questions.length}
          </span>
          <span className="text-white/80">
            Passing: {data.passingScore}%
          </span>
        </div>
        <Progress
          value={((currentQuestion + 1) / data.questions.length) * 100}
          className="mt-4 h-2 bg-white/20 [&>div]:bg-white"
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = question.correctAnswer === idx;
            const showCorrectness = isAnswered;

            return (
              <motion.button
                key={idx}
                whileHover={!isAnswered ? { scale: 1.01 } : {}}
                whileTap={!isAnswered ? { scale: 0.99 } : {}}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all border-2",
                  !isAnswered && "hover:border-violet-300 hover:bg-violet-50",
                  !isAnswered && "border-gray-200 bg-white",
                  showCorrectness && isCorrect && "border-emerald-500 bg-emerald-50",
                  showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-50",
                  showCorrectness && !isSelected && !isCorrect && "border-gray-200 bg-gray-50 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium",
                    !isAnswered && "bg-gray-100 text-gray-600",
                    showCorrectness && isCorrect && "bg-emerald-500 text-white",
                    showCorrectness && isSelected && !isCorrect && "bg-red-500 text-white",
                    showCorrectness && !isSelected && !isCorrect && "bg-gray-200 text-gray-500"
                  )}>
                    {showCorrectness && isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : showCorrectness && isSelected && !isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </div>
                  <span className={cn(
                    "text-sm",
                    showCorrectness && isCorrect && "text-emerald-700 font-medium",
                    showCorrectness && isSelected && !isCorrect && "text-red-700",
                    !showCorrectness && "text-gray-700"
                  )}>
                    {option}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mt-6 p-4 rounded-xl",
                selectedAnswer === question.correctAnswer
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-amber-50 border border-amber-200"
              )}
            >
              <h4 className={cn(
                "font-semibold mb-2 flex items-center gap-2",
                selectedAnswer === question.correctAnswer
                  ? "text-emerald-800"
                  : "text-amber-800"
              )}>
                <Lightbulb className="w-4 h-4" />
                Explanation
              </h4>
              <p className={cn(
                "text-sm",
                selectedAnswer === question.correctAnswer
                  ? "text-emerald-700"
                  : "text-amber-700"
              )}>
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          style={{ borderRadius: RADIUS.button }}
        >
          {currentQuestion < data.questions.length - 1 ? (
            <>
              Next Question
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              See Results
              <Award className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

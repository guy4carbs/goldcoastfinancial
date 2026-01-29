/**
 * GOLD COAST FINANCIAL - TRAINING INFRASTRUCTURE
 *
 * Extended data structures, types, and utilities to support
 * comprehensive training content including carriers, state regulations,
 * mock calls, glossary, and enhanced assessments.
 *
 * This file provides the foundation for Phase 1+ content additions.
 */

// ============================================================================
// CARRIER INFORMATION SYSTEM
// ============================================================================

export type CarrierRating = 'A++' | 'A+' | 'A' | 'A-' | 'B++' | 'B+' | 'B' | 'NR';

export type ProductType =
  | 'term_life'
  | 'whole_life'
  | 'iul'
  | 'final_expense'
  | 'fixed_annuity'
  | 'fia';

export type UnderwritingApproach =
  | 'simplified'      // No medical exam, limited health questions
  | 'accelerated'     // Algorithm-based, no exam for qualified applicants
  | 'full'            // Traditional underwriting with exam
  | 'guaranteed';     // No health questions, guaranteed issue

export interface CarrierProduct {
  productType: ProductType;
  productName: string;
  minCoverage: number;
  maxCoverage: number;
  termLengths?: number[];           // For term products
  minIssueAge: number;
  maxIssueAge: number;
  underwritingApproach: UnderwritingApproach;
  averageIssueTime: string;         // e.g., "3-5 days", "2-3 weeks"
  keyFeatures: string[];
  limitations: string[];
  idealClientProfile: string;
  complianceNotes?: string[];
}

export interface CarrierInfo {
  id: string;
  name: string;
  shortName: string;                // For compact displays
  amBestRating: CarrierRating;
  ratingDate: string;               // When rating was assigned
  headquarters: string;
  foundedYear: number;
  website: string;

  // Appointment Information
  appointmentRequirements: {
    backgroundCheck: boolean;
    productTraining: boolean;
    trainingHours?: number;
    minimumProduction?: string;
    otherRequirements?: string[];
  };

  // Products offered
  products: CarrierProduct[];

  // Strengths & Considerations
  strengths: string[];
  considerations: string[];         // Not "weaknesses" - professional framing

  // Contact & Support
  agentSupport: {
    phone: string;
    email: string;
    hours: string;
    portalUrl?: string;
  };

  // Status
  isActive: boolean;
  statesAvailable: string[];        // State abbreviations
  lastUpdated: string;
}

// Carrier comparison helper type
export interface CarrierComparison {
  productType: ProductType;
  carriers: {
    carrierId: string;
    carrierName: string;
    rating: CarrierRating;
    priceCompetitiveness: 'budget' | 'mid-range' | 'premium';
    issueSpeed: 'fast' | 'average' | 'slow';
    underwriting: UnderwritingApproach;
    bestFor: string;
  }[];
}

// ============================================================================
// STATE REGULATION SYSTEM
// ============================================================================

export type StateCode =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY' | 'DC';

export interface StateRegulation {
  stateCode: StateCode;
  stateName: string;

  // Regulatory Body
  regulatoryBody: {
    name: string;                   // e.g., "Illinois Department of Insurance"
    abbreviation: string;           // e.g., "IDOI"
    website: string;
    phone: string;
    email?: string;
  };

  // Licensing Requirements
  licensing: {
    residentLicenseRequired: boolean;
    nonResidentAccepted: boolean;
    ceRequirements: {
      totalHours: number;
      ethicsHours: number;
      cycleLengthYears: number;
      specialRequirements?: string[];
    };
    licenseRenewalFee: number;
    renewalCycle: string;           // e.g., "Biennial", "Annual"
  };

  // Product-Specific Regulations
  productRegulations: {
    productType: ProductType;
    freeLookPeriod: number;         // Days
    replacementRules: string[];
    seniorProtections?: string[];   // For products sold to seniors
    disclosureRequirements: string[];
    prohibitions: string[];
  }[];

  // Senior-Specific Rules (if any)
  seniorProtections?: {
    ageThreshold: number;           // Age at which protections apply
    requirements: string[];
    prohibitions: string[];
  };

  // Annuity-Specific (varies significantly by state)
  annuitySuitability?: {
    requiresBestInterest: boolean;
    documentationRequirements: string[];
    supervisionRequirements: string[];
  };

  // Complaint/Enforcement
  enforcement: {
    complaintProcess: string;
    penaltyRanges: string;
    commonViolations: string[];
  };

  // GCF Status
  gcfOperates: boolean;
  gcfNotes?: string;
  lastUpdated: string;
}

// ============================================================================
// MOCK CALL TRANSCRIPT SYSTEM
// ============================================================================

export type CallOutcome =
  | 'application_submitted'
  | 'follow_up_scheduled'
  | 'declined_politely'
  | 'needs_spouse'
  | 'needs_time'
  | 'not_qualified'
  | 'compliance_concern';

export type CallRating = 'excellent' | 'good' | 'satisfactory' | 'acceptable' | 'needs_improvement' | 'poor' | 'failing';

export type SpeakerRole = 'advisor' | 'client' | 'narrator' | 'annotation';

export interface CallTranscriptLine {
  timestamp: string;                // e.g., "[00:30]"
  speaker: SpeakerRole;
  speakerName?: string;             // For client/advisor names
  content: string;

  // Annotations for training purposes
  annotation?: {
    type: 'excellent' | 'acceptable' | 'violation' | 'tip' | 'warning';
    text: string;
    rubricReference?: string;       // e.g., "Opening & Consent (3/3)"
  };

  // Highlight for emphasis
  isHighlighted?: boolean;
  highlightColor?: 'green' | 'yellow' | 'red' | 'blue';
}

export interface CallTranscriptSection {
  id: string;
  title: string;                    // e.g., "Opening & Consent"
  startTimestamp: string;
  endTimestamp: string;
  rubricCategory?: string;
  score?: {
    earned: number;
    possible: number;
  };
  lines: CallTranscriptLine[];
}

export interface MockCallTranscript {
  id: string;
  title: string;
  description: string;

  // Call Context
  context: {
    advisorName: string;
    advisorExperience: string;      // e.g., "2 years with GCF"
    clientProfile: {
      name: string;
      age: number;
      maritalStatus: string;
      dependents?: string;
      occupation: string;
      income?: string;
      existingCoverage?: string;
      primaryConcern: string;
    };
    callType: 'initial_contact' | 'follow_up' | 'application' | 'service';
    productDiscussed: ProductType[];
  };

  // Outcome & Rating
  outcome: CallOutcome;
  rating: CallRating;
  overallScore?: {
    earned: number;
    possible: number;
    percentage: number;
  };

  // Transcript Content
  sections: CallTranscriptSection[];

  // Summary & Learning Points
  summary: {
    whatWentWell: string[];
    areasForImprovement: string[];
    keyTakeaways: string[];
    complianceNotes?: string[];
  };

  // Audio/Video (if available)
  mediaUrl?: string;
  mediaDuration?: number;           // Seconds

  // Metadata
  certificationLevel: 'pre_access' | 'core_advisor' | 'live_client';
  rubricId?: string;
  lastUpdated: string;
}

// ============================================================================
// INTERACTIVE CALL SIMULATION SYSTEM
// ============================================================================

export type SimulationDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type SimulationNodeType =
  | 'advisor_prompt'    // System shows what advisor should say
  | 'client_response'   // Client speaks (scripted)
  | 'decision_point'    // Agent must choose a response
  | 'feedback'          // Shows feedback on previous choice
  | 'end';              // Simulation complete

export interface SimulationChoice {
  id: string;
  text: string;
  nextNodeId: string;
  scoreImpact: {
    category: string;
    points: number;
  };
  feedback?: string;
  isCompliant: boolean;
}

export interface SimulationNode {
  id: string;
  type: SimulationNodeType;
  speaker?: SpeakerRole;
  speakerName?: string;
  content: string;
  audioUrl?: string;

  // For decision points
  choices?: SimulationChoice[];

  // For linear progression
  nextNodeId?: string;

  // End node properties
  outcome?: CallOutcome;
  finalRating?: CallRating;
}

export interface ClientProfile {
  name: string;
  age: number;
  occupation: string;
  maritalStatus: string;
  dependents?: string;
  income?: string;
  primaryConcern: string;
  personality: 'agreeable' | 'skeptical' | 'busy' | 'emotional' | 'analytical';
  avatar?: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: SimulationDifficulty;
  estimatedMinutes: number;
  clientProfile: ClientProfile;
  productType: ProductType;
  startNodeId: string;
  nodes: SimulationNode[];
  scoringRubric: {
    categories: { name: string; maxPoints: number }[];
    passingScore: number;
    autoFailConditions: string[];
  };
  certificationLevel: 'pre_access' | 'core_advisor' | 'live_client';
}

export interface SimulationSession {
  scenarioId: string;
  currentNodeId: string;
  pathTaken: string[];
  score: Record<string, number>;
  startTime: Date;
  feedback: { nodeId: string; text: string; type: 'positive' | 'negative' | 'tip' }[];
  isRecording: boolean;
  audioBlob?: Blob;
}

// ============================================================================
// GLOSSARY & KEY TERMS SYSTEM
// ============================================================================

export type TermCategory =
  | 'product'
  | 'compliance'
  | 'underwriting'
  | 'sales'
  | 'regulatory'
  | 'financial'
  | 'company';

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type AdvisorLevel = 'newcomer' | 'apprentice' | 'advisor' | 'senior_advisor' | 'expert' | 'master';

export type MilestoneTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type MilestoneCategory = 'progress' | 'mastery' | 'special';

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition: string;          // One sentence, for tooltips
  fullDefinition: string;           // Complete explanation
  category: TermCategory;

  // Context
  usedInModules: string[];          // Module IDs where term appears
  relatedTerms: string[];           // IDs of related terms

  // Examples
  examples?: {
    context: string;
    usage: string;
  }[];

  // Compliance relevance
  complianceImportance?: 'critical' | 'important' | 'helpful' | 'standard';
  complianceNote?: string;

  // Common mistakes
  commonMistakes?: string[];

  // Pronunciation (if needed)
  pronunciation?: string;
}

// ============================================================================
// QUICK REFERENCE CARD SYSTEM
// ============================================================================

export interface QuickReferenceSection {
  title: string;
  items: {
    label: string;
    value: string;
    isHighlighted?: boolean;
    icon?: string;
  }[];
}

export interface QuickReferenceCard {
  id: string;
  title: string;
  subtitle?: string;
  description: string;

  // Content sections
  sections: QuickReferenceSection[];

  // Do's and Don'ts
  doList?: string[];
  dontList?: string[];

  // Key reminders
  keyReminders?: string[];

  // Compliance warnings
  complianceWarnings?: string[];

  // Related module
  moduleId: string;
  moduleName: string;

  // Download
  downloadable: boolean;
  pdfUrl?: string;

  lastUpdated: string;
}

// ============================================================================
// ENHANCED ASSESSMENT QUESTION TYPES
// ============================================================================

export type EnhancedQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'select_all'
  | 'scenario'
  | 'ordering'              // Put items in correct order
  | 'matching'              // Match items from two columns
  | 'fill_in_blank'         // Complete the statement
  | 'calculation'           // Numerical answer required
  | 'hotspot'               // Click on correct area of image
  | 'drag_drop';            // Drag items to correct categories

export interface OrderingQuestion {
  id: string;
  type: 'ordering';
  category: string;
  question: string;
  instructions: string;
  items: {
    id: string;
    text: string;
    correctPosition: number;
  }[];
  correctFeedback: string;
  incorrectFeedback: string;
  difficultyLevel: 1 | 2 | 3;
  partialCreditAllowed: boolean;
}

export interface MatchingQuestion {
  id: string;
  type: 'matching';
  category: string;
  question: string;
  instructions: string;
  leftColumn: {
    id: string;
    text: string;
  }[];
  rightColumn: {
    id: string;
    text: string;
    matchesLeftId: string;
  }[];
  correctFeedback: string;
  incorrectFeedback: string;
  difficultyLevel: 1 | 2 | 3;
}

export interface CalculationQuestion {
  id: string;
  type: 'calculation';
  category: string;
  question: string;
  scenario: string;
  givenValues: {
    label: string;
    value: string | number;
  }[];
  correctAnswer: number;
  tolerance: number;              // Acceptable variance (+/-)
  unit?: string;                  // e.g., "$", "%", "years"
  showCalculator: boolean;
  solutionSteps: string[];        // Shown after answer
  correctFeedback: string;
  incorrectFeedback: string;
  difficultyLevel: 1 | 2 | 3;
}

export interface DragDropQuestion {
  id: string;
  type: 'drag_drop';
  category: string;
  question: string;
  instructions: string;
  categories: {
    id: string;
    title: string;
    description?: string;
  }[];
  items: {
    id: string;
    text: string;
    correctCategoryId: string;
  }[];
  correctFeedback: string;
  incorrectFeedback: string;
  difficultyLevel: 1 | 2 | 3;
  partialCreditAllowed: boolean;
}

// Union type for all question types
export type EnhancedAssessmentQuestion =
  | OrderingQuestion
  | MatchingQuestion
  | CalculationQuestion
  | DragDropQuestion;

// ============================================================================
// LEARNING PATH & MILESTONE SYSTEM
// ============================================================================

export interface LearningMilestone {
  id: string;
  title: string;
  name: string;                   // Short display name (for badges)
  description: string;
  type: 'module_complete' | 'assessment_passed' | 'certification_earned' | 'streak' | 'special';
  tier: MilestoneTier;            // bronze, silver, gold, platinum
  category: MilestoneCategory;    // progress, mastery, special

  // Requirements to earn
  requirements: {
    moduleIds?: string[];
    assessmentIds?: string[];
    certificationIds?: string[];
    streakDays?: number;
    customCondition?: string;
  };

  // Reward
  badge?: {
    name: string;
    icon: string;
    color: string;
    description: string;
  };
  points: number;

  // Display
  celebrationMessage: string;
  isHidden: boolean;              // Hidden until earned (surprise achievements)
}

export interface LearningStreak {
  advisorId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activeDates: string[];
  streakFreezeAvailable: boolean;
  streakFreezeUsedDate?: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

// ============================================================================
// OPERATING STATES CONFIGURATION
// ============================================================================

export interface OperatingState {
  stateCode: StateCode;
  stateName: string;
  isActive: boolean;
  launchDate?: string;
  stateModuleId?: string;
  stateAssessmentId?: string;
  requiredForNewAdvisors: boolean;
  specialRequirements?: string[];
}

// ============================================================================
// IMPORT CONTENT DATA
// ============================================================================
// Content is imported from trainingContent.ts and re-exported here

import {
  CARRIER_DATA,
  OPERATING_STATES_DATA,
  STATE_REGULATIONS_DATA,
  MOCK_CALL_TRANSCRIPTS_DATA,
  EXPANDED_GLOSSARY_TERMS,
  QUICK_REFERENCE_CARDS_DATA
} from './trainingContent';

// Operating states - populated from content data
export const OPERATING_STATES: OperatingState[] = OPERATING_STATES_DATA;

// Carrier data - populated from content data
export const CARRIERS: CarrierInfo[] = CARRIER_DATA;

// State regulations - populated from content data
export const STATE_REGULATIONS: StateRegulation[] = STATE_REGULATIONS_DATA;

// Mock call transcripts - populated from content data
export const MOCK_CALL_TRANSCRIPTS: MockCallTranscript[] = MOCK_CALL_TRANSCRIPTS_DATA;

// ============================================================================
// GLOSSARY TERMS - COMBINED (Initial + Expanded from trainingContent)
// ============================================================================

// Base glossary terms - will be combined with expanded terms below
const BASE_GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'term-cap-rate',
    term: 'Cap Rate',
    shortDefinition: 'Maximum return that can be credited to an IUL policy in a given period.',
    fullDefinition: 'The cap rate is the upper limit on the interest rate that can be credited to an indexed universal life (IUL) policy based on index performance. For example, if the S&P 500 returns 15% and the cap rate is 10%, only 10% would be credited to the policy. Cap rates are set by the insurance carrier and can change over time.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-floor', 'term-participation-rate', 'term-spread'],
    examples: [
      {
        context: 'IUL illustration review',
        usage: 'The policy has a 10% cap rate, meaning even if the index gains 20%, the maximum credited return would be 10%.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Must always explain that cap rates can change and are not guaranteed.',
    commonMistakes: [
      'Implying cap rates are guaranteed for the life of the policy',
      'Not explaining that caps limit upside potential'
    ]
  },
  {
    id: 'term-floor',
    term: 'Floor',
    shortDefinition: 'Minimum return guaranteed in an IUL policy, typically 0%.',
    fullDefinition: 'The floor is the minimum interest rate that will be credited to an indexed universal life (IUL) policy regardless of index performance. Most IUL policies have a 0% floor, meaning the policy won\'t lose value due to negative index performance (though charges still apply). This provides downside protection.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-cap-rate', 'term-participation-rate'],
    examples: [
      {
        context: 'Client education',
        usage: 'With a 0% floor, even if the S&P 500 drops 20%, your policy won\'t be credited a negative return from the index.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Must clarify that the floor protects against index losses but policy charges still apply.'
  },
  {
    id: 'term-participation-rate',
    term: 'Participation Rate',
    shortDefinition: 'Percentage of index gain credited to an IUL policy before cap is applied.',
    fullDefinition: 'The participation rate determines what percentage of the index\'s gain is used to calculate the credited interest. For example, if the index gains 10% and the participation rate is 80%, the calculation starts with 8% (before the cap is applied). Participation rates can vary by carrier and crediting strategy.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-cap-rate', 'term-floor', 'term-spread'],
    complianceImportance: 'important'
  },
  {
    id: 'term-surrender-period',
    term: 'Surrender Period',
    shortDefinition: 'Time during which withdrawing from an annuity incurs penalties.',
    fullDefinition: 'The surrender period is the timeframe during which an annuity owner will face surrender charges if they withdraw more than the free withdrawal amount or fully surrender the contract. Surrender periods typically range from 3-10 years, with charges decreasing each year.',
    category: 'product',
    usedInModules: ['mod-product-annuity'],
    relatedTerms: ['term-surrender-charge', 'term-free-withdrawal'],
    complianceImportance: 'critical',
    complianceNote: 'Must clearly disclose surrender period length and charge schedule before sale.'
  },
  {
    id: 'term-suitability',
    term: 'Suitability',
    shortDefinition: 'Requirement that product recommendations match client needs and circumstances.',
    fullDefinition: 'Suitability is the regulatory and ethical requirement that any product recommendation must be appropriate for the specific client based on their financial situation, needs, objectives, risk tolerance, and other relevant factors. Documentation of suitability analysis is required for every recommendation.',
    category: 'compliance',
    usedInModules: ['mod-suitability-defense', 'mod-disclosure', 'mod-product-annuity'],
    relatedTerms: ['term-needs-analysis', 'term-best-interest'],
    complianceImportance: 'critical',
    complianceNote: 'Failure to document suitability is a compliance violation regardless of client satisfaction.'
  },
  {
    id: 'term-replacement',
    term: 'Replacement',
    shortDefinition: 'Purchasing new insurance to take the place of existing coverage.',
    fullDefinition: 'A replacement occurs when a new insurance policy is purchased and an existing policy is surrendered, lapsed, or reduced in value. Replacements require additional disclosure and documentation to ensure the client understands the implications and that the replacement is suitable.',
    category: 'compliance',
    usedInModules: ['mod-disclosure', 'mod-compliance-intro'],
    relatedTerms: ['term-suitability', 'term-disclosure'],
    complianceImportance: 'critical',
    complianceNote: 'Replacement transactions have additional disclosure and documentation requirements.'
  },
  {
    id: 'term-free-look',
    term: 'Free Look Period',
    shortDefinition: 'Time after policy delivery when client can cancel for full refund.',
    fullDefinition: 'The free look period is a state-mandated timeframe (typically 10-30 days) after policy delivery during which the client can review the policy and cancel for a full refund of premiums paid. The length varies by state and product type.',
    category: 'regulatory',
    usedInModules: ['mod-sales-closing', 'mod-disclosure'],
    relatedTerms: ['term-policy-delivery'],
    complianceImportance: 'important',
    complianceNote: 'Must inform clients of their free look rights during policy delivery.'
  },
  {
    id: 'term-needs-analysis',
    term: 'Needs Analysis',
    shortDefinition: 'Process of determining client\'s insurance coverage requirements.',
    fullDefinition: 'A needs analysis is a systematic evaluation of a client\'s financial situation, obligations, and goals to determine appropriate insurance coverage. It includes assessing income replacement needs, debt obligations, final expenses, education funding, and existing resources. Documentation of the needs analysis is required.',
    category: 'sales',
    usedInModules: ['mod-sales-needs', 'mod-education-call', 'mod-suitability-defense'],
    relatedTerms: ['term-suitability', 'term-coverage-gap'],
    complianceImportance: 'critical'
  },
  {
    id: 'term-persistency',
    term: 'Persistency',
    shortDefinition: 'Measure of how long policies remain in force after issue.',
    fullDefinition: 'Persistency is the rate at which policies remain active and premiums continue to be paid over time. High persistency indicates satisfied clients and suitable sales. Low persistency (many lapses/cancellations) can indicate unsuitable sales, poor client education, or other problems.',
    category: 'company',
    usedInModules: ['mod-performance', 'mod-philosophy'],
    relatedTerms: ['term-lapse', 'term-chargeback'],
    complianceImportance: 'important',
    complianceNote: 'Persistency is a key quality metric monitored by carriers and compliance.'
  },
  {
    id: 'term-chargeback',
    term: 'Chargeback',
    shortDefinition: 'Requirement to return commission when a policy lapses early.',
    fullDefinition: 'A chargeback occurs when a policy lapses or is cancelled within a specified period (typically 6-12 months) and the advisor must return all or part of the commission previously paid. Chargebacks protect carriers from paying commissions on policies that don\'t persist.',
    category: 'financial',
    usedInModules: ['mod-business-setup', 'mod-performance'],
    relatedTerms: ['term-persistency', 'term-lapse'],
    complianceImportance: 'helpful'
  }
];

// Combine base terms with expanded terms from trainingContent
export const GLOSSARY_TERMS: GlossaryTerm[] = [...BASE_GLOSSARY_TERMS, ...EXPANDED_GLOSSARY_TERMS];

// ============================================================================
// QUICK REFERENCE CARDS - COMBINED (Initial + Expanded from trainingContent)
// ============================================================================

const BASE_QUICK_REFERENCE_CARDS: QuickReferenceCard[] = [
  {
    id: 'qrc-education-call',
    title: 'Education Call Framework',
    subtitle: 'Quick Reference',
    description: 'The five-phase call structure for client education conversations.',
    sections: [
      {
        title: 'Phase 1: Opening & Consent',
        items: [
          { label: 'Identify yourself', value: 'Name, company, licensed advisor', icon: 'user' },
          { label: 'State purpose', value: 'Educational call about coverage options', icon: 'target' },
          { label: 'Recording disclosure', value: 'If applicable, state call may be recorded', icon: 'mic' },
          { label: 'Confirm time', value: 'Verify they have 20-25 minutes', icon: 'clock' },
          { label: 'Get permission', value: '"May I proceed with some questions?"', icon: 'check', isHighlighted: true }
        ]
      },
      {
        title: 'Phase 2: Discovery & Needs',
        items: [
          { label: 'Family situation', value: 'Marital status, dependents, ages', icon: 'users' },
          { label: 'Employment', value: 'Occupation, income stability', icon: 'briefcase' },
          { label: 'Current coverage', value: 'Existing policies, employer coverage', icon: 'shield' },
          { label: 'Protection needs', value: 'What are they trying to protect?', icon: 'heart' },
          { label: 'Budget', value: 'Address AFTER needs identified', icon: 'dollar', isHighlighted: true }
        ]
      },
      {
        title: 'Phase 3: Education',
        items: [
          { label: 'Explain product', value: 'What it is, how it works', icon: 'book' },
          { label: 'Connect to needs', value: 'Why this addresses their situation', icon: 'link' },
          { label: 'Alternatives', value: 'Mention other options considered', icon: 'list', isHighlighted: true },
          { label: 'Limitations', value: 'What it does NOT cover', icon: 'alert', isHighlighted: true }
        ]
      },
      {
        title: 'Phase 4: Confirmation',
        items: [
          { label: 'Check understanding', value: '"Can you explain back what you\'re considering?"', icon: 'message', isHighlighted: true },
          { label: 'Invite questions', value: 'Make space for concerns', icon: 'help' },
          { label: 'Respect decision', value: 'Accept any answer without pressure', icon: 'thumbs-up' }
        ]
      },
      {
        title: 'Phase 5: Documentation',
        items: [
          { label: 'Same-day notes', value: 'Log call in CRM immediately', icon: 'edit' },
          { label: '24-hour deadline', value: 'Complete needs analysis documentation', icon: 'clock', isHighlighted: true },
          { label: 'Next steps', value: 'Schedule follow-up or application', icon: 'calendar' }
        ]
      }
    ],
    doList: [
      'Always get permission before proceeding',
      'Document needs BEFORE discussing solutions',
      'Mention alternatives and limitations',
      'Verify client understanding before closing',
      'Document same-day'
    ],
    dontList: [
      'Skip the consent phase',
      'Discuss budget before understanding needs',
      'Proceed if client seems confused',
      'Use pressure or urgency tactics',
      'Delay documentation'
    ],
    keyReminders: [
      'If education and a sale conflict, the sale loses',
      'No means no—end professionally',
      'Document as if a regulator will read it'
    ],
    complianceWarnings: [
      'Calls may be reviewed for quality and compliance',
      'Patterns of pressure tactics result in termination'
    ],
    moduleId: 'mod-education-call',
    moduleName: 'Education Call Framework',
    downloadable: true,
    lastUpdated: '2024-12-01'
  },
  {
    id: 'qrc-suitability',
    title: 'Suitability Checklist',
    subtitle: 'Five-Element Defense',
    description: 'Documentation required for every product recommendation.',
    sections: [
      {
        title: '1. Documented Need',
        items: [
          { label: 'What', value: 'Specific protection need identified', icon: 'target' },
          { label: 'Example', value: '"Income replacement for spouse and 2 children"', icon: 'quote' }
        ]
      },
      {
        title: '2. Product Rationale',
        items: [
          { label: 'What', value: 'Why THIS product type', icon: 'target' },
          { label: 'Example', value: '"20-year term aligns with children reaching independence"', icon: 'quote' }
        ]
      },
      {
        title: '3. Coverage Calculation',
        items: [
          { label: 'What', value: 'How amount was determined', icon: 'target' },
          { label: 'Example', value: '"$380K mortgage + $150K income gap + $70K education = $600K"', icon: 'quote' }
        ]
      },
      {
        title: '4. Affordability Verified',
        items: [
          { label: 'What', value: 'Budget reviewed, confirmed sustainable', icon: 'target' },
          { label: 'Example', value: '"Premium is 0.7% of household income; client confirmed fits budget"', icon: 'quote' }
        ]
      },
      {
        title: '5. Comprehension Confirmed',
        items: [
          { label: 'What', value: 'Client can explain what they\'re buying', icon: 'target' },
          { label: 'Example', value: '"Client explained policy terms, asked about conversion option"', icon: 'quote' }
        ]
      }
    ],
    dontList: [
      '"Client wanted this product" (not suitability)',
      '"Client can afford it" (not complete)',
      '"Standard recommendation for this age" (not specific)',
      '"Client seemed to understand" (not verification)'
    ],
    keyReminders: [
      'Document WHY, not just WHAT',
      'Complete within 24 hours',
      'If you can\'t document it, don\'t recommend it'
    ],
    complianceWarnings: [
      'Weak documentation = weak defense in audit',
      'Suitability failures result in termination'
    ],
    moduleId: 'mod-suitability-defense',
    moduleName: 'Suitability Analysis & Recommendation Defense',
    downloadable: true,
    lastUpdated: '2024-12-01'
  }
];

// Combine base cards with expanded cards from trainingContent
export const QUICK_REFERENCE_CARDS: QuickReferenceCard[] = [...BASE_QUICK_REFERENCE_CARDS, ...QUICK_REFERENCE_CARDS_DATA];

// ============================================================================
// LEARNING MILESTONES
// ============================================================================

export const LEARNING_MILESTONES: LearningMilestone[] = [
  {
    id: 'milestone-first-module',
    title: 'First Steps',
    name: 'First Steps',
    description: 'Complete your first training module',
    type: 'module_complete',
    tier: 'bronze',
    category: 'progress',
    requirements: {
      customCondition: 'Complete any 1 module'
    },
    badge: {
      name: 'Quick Start',
      icon: 'rocket',
      color: 'blue',
      description: 'Started your training journey'
    },
    points: 50,
    celebrationMessage: 'You\'ve taken your first step! Welcome to Gold Coast Financial.',
    isHidden: false
  },
  {
    id: 'milestone-onboarding-complete',
    title: 'Onboarding Complete',
    name: 'Onboarded',
    description: 'Complete all onboarding modules',
    type: 'module_complete',
    tier: 'bronze',
    category: 'progress',
    requirements: {
      moduleIds: ['mod-welcome', 'mod-business-setup', 'mod-portal']
    },
    badge: {
      name: 'Onboarded',
      icon: 'check-circle',
      color: 'cyan',
      description: 'Completed orientation successfully'
    },
    points: 100,
    celebrationMessage: 'Orientation complete! You\'re ready for institutional training.',
    isHidden: false
  },
  {
    id: 'milestone-doctrine-master',
    title: 'Doctrine Master',
    name: 'Doctrine Master',
    description: 'Pass the Institutional Doctrine Assessment',
    type: 'assessment_passed',
    tier: 'silver',
    category: 'mastery',
    requirements: {
      assessmentIds: ['assess-doctrine']
    },
    badge: {
      name: 'Doctrine Master',
      icon: 'shield',
      color: 'purple',
      description: 'Demonstrated mastery of institutional values'
    },
    points: 150,
    celebrationMessage: 'You understand what it means to be a Gold Coast Financial Advisor.',
    isHidden: false
  },
  {
    id: 'milestone-compliance-champion',
    title: 'Compliance Champion',
    name: 'Compliance Champion',
    description: 'Pass the Compliance Stress Test on first attempt',
    type: 'assessment_passed',
    tier: 'gold',
    category: 'special',
    requirements: {
      assessmentIds: ['assess-compliance-stress'],
      customCondition: 'First attempt'
    },
    badge: {
      name: 'Compliance Champion',
      icon: 'award',
      color: 'amber',
      description: 'Passed stress test on first try'
    },
    points: 250,
    celebrationMessage: 'Exceptional! You\'re ready for real-world compliance challenges.',
    isHidden: true
  },
  {
    id: 'milestone-product-expert',
    title: 'Product Expert',
    name: 'Product Expert',
    description: 'Complete all four product knowledge modules',
    type: 'module_complete',
    tier: 'gold',
    category: 'mastery',
    requirements: {
      moduleIds: ['mod-product-term', 'mod-product-iul', 'mod-product-fe', 'mod-product-annuity']
    },
    badge: {
      name: 'Product Expert',
      icon: 'package',
      color: 'emerald',
      description: 'Mastered all product categories'
    },
    points: 300,
    celebrationMessage: 'You now understand our complete product portfolio.',
    isHidden: false
  },
  {
    id: 'milestone-perfect-score',
    title: 'Perfect Score',
    name: 'Perfect',
    description: 'Score 100% on any assessment',
    type: 'special',
    tier: 'gold',
    category: 'special',
    requirements: {
      customCondition: 'Score 100% on any assessment'
    },
    badge: {
      name: 'Perfect',
      icon: 'star',
      color: 'gold',
      description: 'Achieved a perfect assessment score'
    },
    points: 100,
    celebrationMessage: 'Flawless performance!',
    isHidden: true
  },
  {
    id: 'milestone-streak-7',
    title: 'Week Warrior',
    name: 'Week Warrior',
    description: 'Train for 7 consecutive days',
    type: 'streak',
    tier: 'bronze',
    category: 'progress',
    requirements: {
      streakDays: 7
    },
    badge: {
      name: 'Week Warrior',
      icon: 'flame',
      color: 'orange',
      description: 'Maintained a 7-day learning streak'
    },
    points: 75,
    celebrationMessage: 'A full week of dedication! Keep it going.',
    isHidden: false
  },
  {
    id: 'milestone-streak-30',
    title: 'Monthly Master',
    name: 'Monthly Master',
    description: 'Train for 30 consecutive days',
    type: 'streak',
    tier: 'platinum',
    category: 'special',
    requirements: {
      streakDays: 30
    },
    badge: {
      name: 'Monthly Master',
      icon: 'zap',
      color: 'purple',
      description: 'Maintained a 30-day learning streak'
    },
    points: 300,
    celebrationMessage: 'Incredible dedication! A full month of consistent learning.',
    isHidden: true
  },
  {
    id: 'milestone-pre-access-cert',
    title: 'Pre-Access Certified',
    name: 'Pre-Access',
    description: 'Earn Pre-Access Certification',
    type: 'certification_earned',
    tier: 'silver',
    category: 'progress',
    requirements: {
      certificationIds: ['cert-pre-access']
    },
    badge: {
      name: 'Pre-Access Certified',
      icon: 'key',
      color: 'blue',
      description: 'Authorized for system access'
    },
    points: 500,
    celebrationMessage: 'You\'re officially authorized! System access granted.',
    isHidden: false
  },
  {
    id: 'milestone-core-advisor-cert',
    title: 'Core Advisor',
    name: 'Core Advisor',
    description: 'Earn Core Advisor Certification',
    type: 'certification_earned',
    tier: 'gold',
    category: 'mastery',
    requirements: {
      certificationIds: ['cert-core-advisor']
    },
    badge: {
      name: 'Core Advisor',
      icon: 'user-check',
      color: 'purple',
      description: 'Certified Gold Coast Financial Advisor'
    },
    points: 750,
    celebrationMessage: 'Congratulations! You\'re now a certified Core Advisor.',
    isHidden: false
  },
  {
    id: 'milestone-live-client-cert',
    title: 'Live Client Ready',
    name: 'Client Ready',
    description: 'Earn Live Client Authorization',
    type: 'certification_earned',
    tier: 'platinum',
    category: 'mastery',
    requirements: {
      certificationIds: ['cert-live-client']
    },
    badge: {
      name: 'Client Ready',
      icon: 'users',
      color: 'green',
      description: 'Authorized for live client contact'
    },
    points: 1000,
    celebrationMessage: 'You\'re authorized for live client interactions. Make us proud!',
    isHidden: false
  },
  // Phase 4 Achievements
  {
    id: 'milestone-quick-learner',
    title: 'Quick Learner',
    name: 'Quick Learner',
    description: 'Complete a module faster than the estimated time',
    type: 'special',
    tier: 'bronze',
    category: 'special',
    requirements: {
      customCondition: 'Complete module under estimated time'
    },
    badge: {
      name: 'Quick Learner',
      icon: 'zap',
      color: 'blue',
      description: 'Finished ahead of schedule'
    },
    points: 50,
    celebrationMessage: 'Speed and accuracy! You\'re a fast learner.',
    isHidden: false
  },
  {
    id: 'milestone-early-bird',
    title: 'Early Bird',
    name: 'Early Bird',
    description: 'Complete training before 9 AM',
    type: 'special',
    tier: 'bronze',
    category: 'special',
    requirements: {
      customCondition: 'Training completed before 9:00 AM'
    },
    badge: {
      name: 'Early Bird',
      icon: 'sunrise',
      color: 'amber',
      description: 'Morning training warrior'
    },
    points: 25,
    celebrationMessage: 'The early agent gets the commission!',
    isHidden: true
  },
  {
    id: 'milestone-night-owl',
    title: 'Night Owl',
    name: 'Night Owl',
    description: 'Complete training after 9 PM',
    type: 'special',
    tier: 'bronze',
    category: 'special',
    requirements: {
      customCondition: 'Training completed after 9:00 PM'
    },
    badge: {
      name: 'Night Owl',
      icon: 'moon',
      color: 'indigo',
      description: 'Burning the midnight oil'
    },
    points: 25,
    celebrationMessage: 'Dedication knows no bedtime!',
    isHidden: true
  },
  {
    id: 'milestone-assessment-ace',
    title: 'Assessment Ace',
    name: 'Assessment Ace',
    description: 'Pass 5 assessments with 90% or higher',
    type: 'assessment_passed',
    tier: 'gold',
    category: 'mastery',
    requirements: {
      customCondition: 'Pass 5 assessments with 90%+ score'
    },
    badge: {
      name: 'Assessment Ace',
      icon: 'trophy',
      color: 'gold',
      description: 'Consistently high performer'
    },
    points: 200,
    celebrationMessage: 'You set the standard for excellence!',
    isHidden: false
  },
  {
    id: 'milestone-streak-14',
    title: 'Two Week Titan',
    name: 'Two Week Titan',
    description: 'Train for 14 consecutive days',
    type: 'streak',
    tier: 'silver',
    category: 'progress',
    requirements: {
      streakDays: 14
    },
    badge: {
      name: 'Two Week Titan',
      icon: 'flame',
      color: 'orange',
      description: 'Two weeks of dedication'
    },
    points: 150,
    celebrationMessage: 'Two weeks strong! You\'re building great habits.',
    isHidden: false
  },
  {
    id: 'milestone-first-assessment',
    title: 'Test Taker',
    name: 'Test Taker',
    description: 'Complete your first assessment',
    type: 'assessment_passed',
    tier: 'bronze',
    category: 'progress',
    requirements: {
      customCondition: 'Pass any 1 assessment'
    },
    badge: {
      name: 'Test Taker',
      icon: 'clipboard-check',
      color: 'green',
      description: 'First assessment conquered'
    },
    points: 50,
    celebrationMessage: 'First test in the books!',
    isHidden: false
  },
  {
    id: 'milestone-speed-demon',
    title: 'Speed Demon',
    name: 'Speed Demon',
    description: 'Complete 3 modules in a single day',
    type: 'special',
    tier: 'silver',
    category: 'special',
    requirements: {
      customCondition: 'Complete 3 modules in one day'
    },
    badge: {
      name: 'Speed Demon',
      icon: 'rocket',
      color: 'red',
      description: 'Training marathon champion'
    },
    points: 100,
    celebrationMessage: 'Unstoppable! Three modules in one day.',
    isHidden: true
  },
  {
    id: 'milestone-weekend-warrior',
    title: 'Weekend Warrior',
    name: 'Weekend Warrior',
    description: 'Complete training on both Saturday and Sunday',
    type: 'special',
    tier: 'bronze',
    category: 'special',
    requirements: {
      customCondition: 'Train on Saturday and Sunday'
    },
    badge: {
      name: 'Weekend Warrior',
      icon: 'calendar',
      color: 'purple',
      description: 'No days off mentality'
    },
    points: 50,
    celebrationMessage: 'Weekends are for winners!',
    isHidden: true
  },
  {
    id: 'milestone-daily-challenger',
    title: 'Daily Challenger',
    name: 'Daily Challenger',
    description: 'Complete 7 daily challenges',
    type: 'special',
    tier: 'silver',
    category: 'progress',
    requirements: {
      customCondition: 'Complete 7 daily challenges'
    },
    badge: {
      name: 'Daily Challenger',
      icon: 'target',
      color: 'cyan',
      description: 'Challenge accepted and conquered'
    },
    points: 100,
    celebrationMessage: 'You never back down from a challenge!',
    isHidden: false
  },
  {
    id: 'milestone-knowledge-seeker',
    title: 'Knowledge Seeker',
    name: 'Knowledge Seeker',
    description: 'Answer 10 Questions of the Day correctly',
    type: 'special',
    tier: 'silver',
    category: 'mastery',
    requirements: {
      customCondition: 'Answer 10 daily questions correctly'
    },
    badge: {
      name: 'Knowledge Seeker',
      icon: 'lightbulb',
      color: 'yellow',
      description: 'Curious mind, sharp skills'
    },
    points: 100,
    celebrationMessage: 'Your thirst for knowledge is impressive!',
    isHidden: false
  },
  {
    id: 'milestone-xp-1000',
    title: 'XP Milestone',
    name: '1K Club',
    description: 'Earn 1,000 total XP',
    type: 'special',
    tier: 'gold',
    category: 'progress',
    requirements: {
      customCondition: 'Accumulate 1,000 XP'
    },
    badge: {
      name: '1K Club',
      icon: 'star',
      color: 'gold',
      description: 'Reached 1,000 XP'
    },
    points: 100,
    celebrationMessage: 'Welcome to the 1K Club!',
    isHidden: false
  },
  {
    id: 'milestone-all-products',
    title: 'Full Portfolio',
    name: 'Full Portfolio',
    description: 'Complete all product modules and pass all product assessments',
    type: 'special',
    tier: 'platinum',
    category: 'mastery',
    requirements: {
      moduleIds: ['mod-product-term', 'mod-product-iul', 'mod-product-fe', 'mod-product-annuity'],
      assessmentIds: ['assess-term', 'assess-iul', 'assess-fe', 'assess-annuity']
    },
    badge: {
      name: 'Full Portfolio',
      icon: 'briefcase',
      color: 'emerald',
      description: 'Complete product mastery'
    },
    points: 500,
    celebrationMessage: 'You know every product inside and out!',
    isHidden: false
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get carrier by ID
 */
export function getCarrierById(carrierId: string): CarrierInfo | undefined {
  return CARRIERS.find(c => c.id === carrierId);
}

/**
 * Get carriers offering a specific product type
 */
export function getCarriersByProduct(productType: ProductType): CarrierInfo[] {
  return CARRIERS.filter(c =>
    c.isActive && c.products.some(p => p.productType === productType)
  );
}

/**
 * Get carriers available in a specific state
 */
export function getCarriersByState(stateCode: StateCode): CarrierInfo[] {
  return CARRIERS.filter(c =>
    c.isActive && c.statesAvailable.includes(stateCode)
  );
}

/**
 * Get state regulation by state code
 */
export function getStateRegulation(stateCode: StateCode): StateRegulation | undefined {
  return STATE_REGULATIONS.find(s => s.stateCode === stateCode);
}

/**
 * Get operating states where GCF is active
 */
export function getActiveOperatingStates(): OperatingState[] {
  return OPERATING_STATES.filter(s => s.isActive);
}

/**
 * Get glossary term by ID
 */
export function getGlossaryTerm(termId: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find(t => t.id === termId);
}

/**
 * Get glossary terms used in a specific module
 */
export function getTermsForModule(moduleId: string): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter(t => t.usedInModules.includes(moduleId));
}

/**
 * Search glossary terms
 */
export function searchGlossary(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return GLOSSARY_TERMS.filter(t =>
    t.term.toLowerCase().includes(lowerQuery) ||
    t.shortDefinition.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get quick reference card by ID
 */
export function getQuickReferenceCard(cardId: string): QuickReferenceCard | undefined {
  return QUICK_REFERENCE_CARDS.find(c => c.id === cardId);
}

/**
 * Get quick reference card for a module
 */
export function getQuickReferenceForModule(moduleId: string): QuickReferenceCard | undefined {
  return QUICK_REFERENCE_CARDS.find(c => c.moduleId === moduleId);
}

/**
 * Get mock call transcripts by rating
 */
export function getMockCallsByRating(rating: CallRating): MockCallTranscript[] {
  return MOCK_CALL_TRANSCRIPTS.filter(t => t.rating === rating);
}

/**
 * Get mock call by ID
 */
export function getMockCallById(callId: string): MockCallTranscript | undefined {
  return MOCK_CALL_TRANSCRIPTS.find(t => t.id === callId);
}

/**
 * Get mock calls for a specific module/certification level
 */
export function getMockCallsForModule(moduleId: string): MockCallTranscript[] {
  return MOCK_CALL_TRANSCRIPTS.filter(t => t.certificationLevel === moduleId || t.rubricId === moduleId);
}

/**
 * Get milestone by ID
 */
export function getMilestoneById(milestoneId: string): LearningMilestone | undefined {
  return LEARNING_MILESTONES.find(m => m.id === milestoneId);
}

/**
 * Check if milestone is earned based on progress
 */
export function checkMilestoneEarned(
  milestone: LearningMilestone,
  completedModules: string[],
  passedAssessments: string[],
  earnedCertifications: string[],
  currentStreak: number
): boolean {
  const { requirements } = milestone;

  // Check module requirements
  if (requirements.moduleIds) {
    if (!requirements.moduleIds.every(id => completedModules.includes(id))) {
      return false;
    }
  }

  // Check assessment requirements
  if (requirements.assessmentIds) {
    if (!requirements.assessmentIds.every(id => passedAssessments.includes(id))) {
      return false;
    }
  }

  // Check certification requirements
  if (requirements.certificationIds) {
    if (!requirements.certificationIds.every(id => earnedCertifications.includes(id))) {
      return false;
    }
  }

  // Check streak requirements
  if (requirements.streakDays) {
    if (currentStreak < requirements.streakDays) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate total points from earned milestones
 */
export function calculateTotalPoints(earnedMilestoneIds: string[]): number {
  return earnedMilestoneIds.reduce((total, id) => {
    const milestone = getMilestoneById(id);
    return total + (milestone?.points || 0);
  }, 0);
}

/**
 * Get advisor level based on points
 * Returns the AdvisorLevel type based on XP thresholds
 */
export function getAdvisorLevel(points: number): AdvisorLevel {
  if (points >= 1500) return 'master';
  if (points >= 1000) return 'expert';
  if (points >= 600) return 'senior_advisor';
  if (points >= 300) return 'advisor';
  if (points >= 100) return 'apprentice';
  return 'newcomer';
}

/**
 * Get detailed advisor level info (for progress displays)
 */
export function getAdvisorLevelInfo(points: number): {
  level: AdvisorLevel;
  title: string;
  nextLevel: string;
  pointsToNext: number;
  minPoints: number;
  maxPoints: number;
} {
  const levels: { level: AdvisorLevel; threshold: number; title: string }[] = [
    { level: 'newcomer', threshold: 0, title: 'Newcomer' },
    { level: 'apprentice', threshold: 100, title: 'Apprentice' },
    { level: 'advisor', threshold: 300, title: 'Advisor' },
    { level: 'senior_advisor', threshold: 600, title: 'Senior Advisor' },
    { level: 'expert', threshold: 1000, title: 'Expert' },
    { level: 'master', threshold: 1500, title: 'Master' }
  ];

  let currentIndex = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].threshold) {
      currentIndex = i;
      break;
    }
  }

  const current = levels[currentIndex];
  const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
  const next = levels[nextIndex];

  return {
    level: current.level,
    title: current.title,
    nextLevel: next.title,
    pointsToNext: currentIndex === levels.length - 1 ? 0 : next.threshold - points,
    minPoints: current.threshold,
    maxPoints: nextIndex < levels.length ? levels[nextIndex].threshold : 9999
  };
}

/**
 * Format carrier product for display
 */
export function formatCarrierProduct(product: CarrierProduct): string {
  const terms = product.termLengths ? product.termLengths.join(', ') + ' year' : '';
  const coverage = `$${(product.minCoverage / 1000).toFixed(0)}K - $${(product.maxCoverage / 1000000).toFixed(1)}M`;
  return `${product.productName} (${terms ? terms + ', ' : ''}${coverage})`;
}

/**
 * Get product type display name
 */
export function getProductTypeDisplayName(productType: ProductType): string {
  const names: Record<ProductType, string> = {
    term_life: 'Term Life',
    whole_life: 'Whole Life',
    iul: 'Indexed Universal Life (IUL)',
    final_expense: 'Final Expense',
    fixed_annuity: 'Fixed Annuity',
    fia: 'Fixed Indexed Annuity (FIA)'
  };
  return names[productType];
}

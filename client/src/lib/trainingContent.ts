/**
 * GOLD COAST FINANCIAL - PHASE 1 TRAINING CONTENT
 *
 * Comprehensive content data for the training system including:
 * - Carrier information (8 major carriers with full details)
 * - State regulations (10 operating states)
 * - Mock call transcripts (7 scenarios)
 * - Expanded glossary (50+ terms)
 * - Quick reference cards (all product types)
 * - Enhanced assessments
 *
 * This file contains the actual content that populates the training infrastructure.
 */

import {
  CarrierInfo,
  CarrierProduct,
  StateRegulation,
  OperatingState,
  MockCallTranscript,
  GlossaryTerm,
  QuickReferenceCard,
  ProductType,
  StateCode,
  UnderwritingApproach
} from './trainingInfrastructure';

// ============================================================================
// CARRIER DATA - COMPREHENSIVE INFORMATION
// ============================================================================

export const CARRIER_DATA: CarrierInfo[] = [
  // ---------------------------------------------------------------------------
  // CARRIER 1: PROTECTIVE LIFE
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-protective',
    name: 'Protective Life Insurance Company',
    shortName: 'Protective',
    amBestRating: 'A+',
    ratingDate: '2025-06-15',
    headquarters: 'Birmingham, AL',
    foundedYear: 1907,
    website: 'https://www.protective.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 2,
      otherRequirements: ['E&O insurance verification', 'Anti-money laundering certification']
    },
    products: [
      {
        productType: 'term_life',
        productName: 'Protective Classic Choice Term',
        minCoverage: 100000,
        maxCoverage: 10000000,
        termLengths: [10, 15, 20, 25, 30],
        minIssueAge: 18,
        maxIssueAge: 70,
        underwritingApproach: 'accelerated',
        averageIssueTime: '3-5 days',
        keyFeatures: [
          'Accelerated underwriting up to $3M',
          'Living benefits included at no extra cost',
          'Conversion privilege to permanent products',
          'Terminal illness accelerated death benefit'
        ],
        limitations: [
          'Build chart requirements for larger face amounts',
          'Medical exam required over $3M in most cases'
        ],
        idealClientProfile: 'Healthy individuals ages 25-55 seeking affordable term coverage with living benefits'
      },
      {
        productType: 'iul',
        productName: 'Protective Indexed Choice UL',
        minCoverage: 50000,
        maxCoverage: 50000000,
        minIssueAge: 0,
        maxIssueAge: 80,
        underwritingApproach: 'full',
        averageIssueTime: '2-4 weeks',
        keyFeatures: [
          'Multiple index options including S&P 500',
          'Uncapped index account options',
          '0% floor protection',
          'Overloan protection rider available',
          'Chronic illness rider included'
        ],
        limitations: [
          'Full underwriting required',
          'Complex product requires thorough client education',
          'Cap rates subject to change'
        ],
        idealClientProfile: 'Clients seeking permanent protection with cash value accumulation potential',
        complianceNotes: [
          'Must explain cap rates are not guaranteed',
          'Illustration must show current AND guaranteed values'
        ]
      }
    ],
    strengths: [
      'Strong AM Best rating with stable outlook',
      'Competitive accelerated underwriting program',
      'Excellent agent portal and case management tools',
      'Living benefits included on term products',
      'Strong conversion options'
    ],
    considerations: [
      'Build chart requirements can impact underwriting',
      'Limited final expense offerings',
      'Premium positioning in mid-tier range'
    ],
    agentSupport: {
      phone: '1-800-866-7655',
      email: 'agentsupport@protective.com',
      hours: 'Mon-Fri 8am-6pm CT',
      portalUrl: 'https://agentportal.protective.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA', 'NY', 'NJ', 'CA', 'AZ'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 2: MUTUAL OF OMAHA
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-mutual-omaha',
    name: 'Mutual of Omaha Insurance Company',
    shortName: 'Mutual of Omaha',
    amBestRating: 'A+',
    ratingDate: '2025-06-01',
    headquarters: 'Omaha, NE',
    foundedYear: 1909,
    website: 'https://www.mutualofomaha.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 3,
      otherRequirements: ['Product certification for each product line']
    },
    products: [
      {
        productType: 'term_life',
        productName: 'Term Life Express',
        minCoverage: 25000,
        maxCoverage: 500000,
        termLengths: [10, 15, 20, 30],
        minIssueAge: 18,
        maxIssueAge: 65,
        underwritingApproach: 'simplified',
        averageIssueTime: '24-72 hours',
        keyFeatures: [
          'No medical exam required',
          'Simplified issue up to $500K',
          'E-application with instant decision',
          'Competitive pricing for healthy applicants'
        ],
        limitations: [
          'Health questions can result in decline',
          'Lower face amount maximums than fully underwritten',
          'Limited to age 65'
        ],
        idealClientProfile: 'Clients seeking quick, easy-issue term coverage without medical exams'
      },
      {
        productType: 'final_expense',
        productName: 'Living Promise',
        minCoverage: 2000,
        maxCoverage: 40000,
        minIssueAge: 45,
        maxIssueAge: 85,
        underwritingApproach: 'simplified',
        averageIssueTime: '24-48 hours',
        keyFeatures: [
          'Simplified underwriting - no medical exam',
          'Level death benefit from day one (most applicants)',
          'Graded benefit option for applicants with health issues',
          'Builds cash value',
          'Affordable premiums for seniors'
        ],
        limitations: [
          'Lower coverage amounts',
          'Graded benefit for applicants with health conditions',
          'Higher cost per thousand than term insurance'
        ],
        idealClientProfile: 'Seniors ages 50-80 seeking affordable burial/final expense coverage',
        complianceNotes: [
          'Must explain graded benefit if applicable',
          'Document need for final expense vs. other options'
        ]
      },
      {
        productType: 'whole_life',
        productName: 'Whole Life 100',
        minCoverage: 10000,
        maxCoverage: 250000,
        minIssueAge: 0,
        maxIssueAge: 80,
        underwritingApproach: 'simplified',
        averageIssueTime: '1-2 weeks',
        keyFeatures: [
          'Guaranteed death benefit',
          'Guaranteed cash value accumulation',
          'Participating - eligible for dividends',
          'Premium remains level for life'
        ],
        limitations: [
          'Higher premiums than term',
          'Cash value grows slowly in early years',
          'Surrender charges in first years'
        ],
        idealClientProfile: 'Clients seeking guaranteed permanent protection with cash value'
      }
    ],
    strengths: [
      'Excellent simplified issue program',
      'Strong final expense products',
      'Fast issue times',
      'Well-known brand with television presence',
      'Comprehensive training and sales support'
    ],
    considerations: [
      'Face amount limits on simplified issue',
      'Premium can be higher for preferred risks',
      'Limited IUL offerings'
    ],
    agentSupport: {
      phone: '1-800-775-6000',
      email: 'agentservices@mutualofomaha.com',
      hours: 'Mon-Fri 7am-7pm CT',
      portalUrl: 'https://agent.mutualofomaha.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA', 'NJ', 'AZ', 'CO', 'MO', 'IA', 'NE', 'KS', 'MN'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 3: NATIONAL LIFE GROUP / LSW
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-nlg',
    name: 'National Life Group / Life Insurance Company of the Southwest',
    shortName: 'NLG / LSW',
    amBestRating: 'A',
    ratingDate: '2025-05-15',
    headquarters: 'Montpelier, VT / Dallas, TX',
    foundedYear: 1848,
    website: 'https://www.nationallife.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 4,
      otherRequirements: ['Living benefits certification', 'IUL product training']
    },
    products: [
      {
        productType: 'iul',
        productName: 'LSW FlexLife',
        minCoverage: 50000,
        maxCoverage: 25000000,
        minIssueAge: 0,
        maxIssueAge: 80,
        underwritingApproach: 'accelerated',
        averageIssueTime: '5-10 days',
        keyFeatures: [
          'Living benefits suite (chronic, critical, terminal illness)',
          'Multiple index crediting strategies',
          'Flexible premium payments',
          'Policy loan options',
          'Death benefit flexibility'
        ],
        limitations: [
          'Product complexity requires thorough explanation',
          'Illustration-driven sales require proper disclosure',
          'Cap rates and participation rates can change'
        ],
        idealClientProfile: 'Clients seeking living benefits protection with cash value potential',
        complianceNotes: [
          'Living benefits must be explained completely',
          'Must show impact of loans/withdrawals on death benefit',
          'Cap rate changes must be disclosed'
        ]
      },
      {
        productType: 'term_life',
        productName: 'TC-120 Term',
        minCoverage: 100000,
        maxCoverage: 5000000,
        termLengths: [10, 15, 20, 25, 30],
        minIssueAge: 18,
        maxIssueAge: 75,
        underwritingApproach: 'accelerated',
        averageIssueTime: '3-7 days',
        keyFeatures: [
          'Living benefits included',
          'Conversion to permanent products',
          'Accelerated underwriting available',
          'Competitive pricing'
        ],
        limitations: [
          'Accelerated UW has face amount limits',
          'Conversion privilege has time limits'
        ],
        idealClientProfile: 'Families seeking affordable term with living benefits protection'
      }
    ],
    strengths: [
      'Industry-leading living benefits on all products',
      'Strong IUL product line',
      'Good accelerated underwriting program',
      'Comprehensive training resources',
      'Competitive commission structure'
    ],
    considerations: [
      'A rating (not A+ or A++)',
      'Product complexity requires education investment',
      'Some underwriting delays on larger cases'
    ],
    agentSupport: {
      phone: '1-800-732-8939',
      email: 'agentservices@nationallife.com',
      hours: 'Mon-Fri 8am-6pm ET',
      portalUrl: 'https://agent.nationallife.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'TX', 'FL', 'GA', 'NC', 'VA', 'PA', 'NJ', 'AZ', 'CO', 'TN'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 4: AMERICAN EQUITY
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-american-equity',
    name: 'American Equity Investment Life Insurance Company',
    shortName: 'American Equity',
    amBestRating: 'A-',
    ratingDate: '2025-04-20',
    headquarters: 'West Des Moines, IA',
    foundedYear: 1995,
    website: 'https://www.american-equity.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 6,
      otherRequirements: ['Annuity suitability training', 'State-specific annuity training where required']
    },
    products: [
      {
        productType: 'fia',
        productName: 'AssetShield',
        minCoverage: 10000,
        maxCoverage: 2000000,
        minIssueAge: 40,
        maxIssueAge: 85,
        underwritingApproach: 'simplified',
        averageIssueTime: '1-2 weeks',
        keyFeatures: [
          'Principal protection - no market losses',
          'Multiple index crediting options',
          'Guaranteed minimum surrender value',
          '10% free withdrawal annually',
          'Death benefit equal to accumulation value'
        ],
        limitations: [
          'Surrender period (typically 10 years)',
          'Participation in index gains is limited',
          'Early withdrawal penalties apply'
        ],
        idealClientProfile: 'Pre-retirees and retirees seeking principal protection with growth potential',
        complianceNotes: [
          'Must complete suitability form before recommendation',
          'Surrender period must be fully disclosed',
          'Not suitable for short-term needs or liquidity needs'
        ]
      },
      {
        productType: 'fixed_annuity',
        productName: 'Guarantee Shield',
        minCoverage: 5000,
        maxCoverage: 1000000,
        minIssueAge: 0,
        maxIssueAge: 90,
        underwritingApproach: 'guaranteed',
        averageIssueTime: '1 week',
        keyFeatures: [
          'Guaranteed interest rate for term',
          'Principal protection',
          'Choice of 3, 5, 7 year terms',
          'Death benefit protection',
          'Simple, easy to understand'
        ],
        limitations: [
          'Lower potential returns than FIA',
          'Surrender charges apply',
          'Interest rate locked for term'
        ],
        idealClientProfile: 'Conservative savers seeking guaranteed returns and principal safety'
      }
    ],
    strengths: [
      'Annuity specialist with deep product knowledge',
      'Competitive crediting rates',
      'Strong customer service reputation',
      'Straightforward products for conservative clients',
      'Good training materials for annuity sales'
    ],
    considerations: [
      'A- rating (lower than some competitors)',
      'Primary focus is annuities, limited life insurance',
      'Newer company compared to traditional carriers'
    ],
    agentSupport: {
      phone: '1-888-221-1234',
      email: 'agentservices@american-equity.com',
      hours: 'Mon-Fri 7am-6pm CT',
      portalUrl: 'https://portal.american-equity.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA', 'AZ', 'CO', 'IA'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 5: NORTH AMERICAN (SAMMONS FINANCIAL)
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-north-american',
    name: 'North American Company for Life and Health Insurance',
    shortName: 'North American',
    amBestRating: 'A+',
    ratingDate: '2025-06-01',
    headquarters: 'Cedar Rapids, IA',
    foundedYear: 1886,
    website: 'https://www.nacolah.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 4,
      otherRequirements: ['Product certification by line', 'Annual compliance training']
    },
    products: [
      {
        productType: 'iul',
        productName: 'Builder Plus IUL',
        minCoverage: 50000,
        maxCoverage: 20000000,
        minIssueAge: 0,
        maxIssueAge: 80,
        underwritingApproach: 'accelerated',
        averageIssueTime: '5-10 days',
        keyFeatures: [
          'Multiplier bonus on index credits',
          'Multiple index strategies including uncapped',
          'Chronic illness rider included',
          'Flexible premiums and death benefits',
          'Competitive cap rates'
        ],
        limitations: [
          'Multiplier has cost of insurance implications',
          'Complex product requires education',
          'Cap rates can change'
        ],
        idealClientProfile: 'Clients seeking maximum growth potential with permanent protection',
        complianceNotes: [
          'Must fully explain multiplier mechanism and costs',
          'Illustration review required with client',
          'Document client understanding of non-guaranteed elements'
        ]
      },
      {
        productType: 'fia',
        productName: 'BenefitSolutions FIA',
        minCoverage: 20000,
        maxCoverage: 3000000,
        minIssueAge: 45,
        maxIssueAge: 80,
        underwritingApproach: 'simplified',
        averageIssueTime: '1-2 weeks',
        keyFeatures: [
          'Income rider with guaranteed withdrawal benefit',
          'Principal protection with growth potential',
          'Nursing home waiver of surrender',
          'Multiple index options'
        ],
        limitations: [
          'Surrender charges for 10 years',
          'Income rider has additional cost',
          'Withdrawal limits apply'
        ],
        idealClientProfile: 'Pre-retirees seeking guaranteed lifetime income with market participation'
      },
      {
        productType: 'term_life',
        productName: 'ADDvantage Term',
        minCoverage: 100000,
        maxCoverage: 5000000,
        termLengths: [10, 15, 20, 25, 30],
        minIssueAge: 18,
        maxIssueAge: 70,
        underwritingApproach: 'accelerated',
        averageIssueTime: '3-7 days',
        keyFeatures: [
          'Accelerated death benefit for terminal illness',
          'Conversion option to permanent',
          'Accelerated underwriting to $3M',
          'ADD rider included'
        ],
        limitations: [
          'Conversion window limited',
          'Medical exam required for larger cases'
        ],
        idealClientProfile: 'Healthy families seeking affordable term with living benefit'
      }
    ],
    strengths: [
      'A+ rated with strong parent company (Sammons Financial)',
      'Innovative IUL products with competitive features',
      'Good accelerated underwriting',
      'Strong annuity products for retirement income',
      'Excellent agent support and training'
    ],
    considerations: [
      'IUL products are complex, require education',
      'Some products have higher minimum premiums',
      'Annuity commission structure varies by product'
    ],
    agentSupport: {
      phone: '1-877-812-4400',
      email: 'agentservices@nacolah.com',
      hours: 'Mon-Fri 8am-6pm CT',
      portalUrl: 'https://agentservices.nacolah.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA', 'NY', 'NJ', 'AZ', 'CO', 'IA'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 6: FORESTERS FINANCIAL
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-foresters',
    name: 'Foresters Financial',
    shortName: 'Foresters',
    amBestRating: 'A',
    ratingDate: '2025-05-01',
    headquarters: 'Toronto, Canada / USA offices',
    foundedYear: 1874,
    website: 'https://www.foresters.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 2,
      otherRequirements: ['Membership organization understanding']
    },
    products: [
      {
        productType: 'final_expense',
        productName: 'PlanRight',
        minCoverage: 5000,
        maxCoverage: 50000,
        minIssueAge: 50,
        maxIssueAge: 85,
        underwritingApproach: 'simplified',
        averageIssueTime: '24-72 hours',
        keyFeatures: [
          'Simplified issue - no medical exam',
          'Level premiums guaranteed for life',
          'Full death benefit from day one (qualified applicants)',
          'Cash value accumulation',
          'Member benefits included'
        ],
        limitations: [
          'Health questions can result in graded benefit',
          'Limited face amounts',
          'Age restrictions'
        ],
        idealClientProfile: 'Seniors seeking affordable final expense coverage with quick issue',
        complianceNotes: [
          'Disclose graded benefit period if applicable',
          'Explain member benefits are separate from insurance'
        ]
      },
      {
        productType: 'whole_life',
        productName: 'Strong Foundation',
        minCoverage: 10000,
        maxCoverage: 150000,
        minIssueAge: 18,
        maxIssueAge: 65,
        underwritingApproach: 'simplified',
        averageIssueTime: '1-2 weeks',
        keyFeatures: [
          'Guaranteed death benefit',
          'Guaranteed cash value growth',
          'Member benefits for whole family',
          'Participating - dividend eligible',
          'Simplified underwriting'
        ],
        limitations: [
          'Limited face amounts',
          'Not competitive for preferred risks',
          'Dividend not guaranteed'
        ],
        idealClientProfile: 'Families seeking permanent coverage with fraternal member benefits'
      }
    ],
    strengths: [
      'Fraternal organization with member benefits',
      'Strong final expense and simplified issue products',
      'Community-focused organization',
      'Quick issue times',
      'No commission clawbacks in most situations'
    ],
    considerations: [
      'A rating (not A+)',
      'Limited high-face-amount offerings',
      'Less competitive for fully underwritten cases'
    ],
    agentSupport: {
      phone: '1-800-828-1540',
      email: 'agentservices@foresters.com',
      hours: 'Mon-Fri 8am-5pm ET',
      portalUrl: 'https://portal.foresters.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 7: ATHENE
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-athene',
    name: 'Athene Annuity and Life Company',
    shortName: 'Athene',
    amBestRating: 'A',
    ratingDate: '2025-06-01',
    headquarters: 'West Des Moines, IA',
    foundedYear: 2009,
    website: 'https://www.athene.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 6,
      otherRequirements: ['Annuity suitability certification', 'Product-specific training']
    },
    products: [
      {
        productType: 'fia',
        productName: 'Athene Agility',
        minCoverage: 25000,
        maxCoverage: 5000000,
        minIssueAge: 40,
        maxIssueAge: 85,
        underwritingApproach: 'simplified',
        averageIssueTime: '1-2 weeks',
        keyFeatures: [
          'Principal protection with growth potential',
          'Multiple index options including volatility-controlled',
          'Premium bonus available',
          '10% annual free withdrawal',
          'Enhanced death benefit options'
        ],
        limitations: [
          'Surrender period up to 10 years',
          'Premium bonus may have vesting schedule',
          'Index participation is limited'
        ],
        idealClientProfile: 'Pre-retirees seeking safe money growth with optional income benefits',
        complianceNotes: [
          'Must complete full suitability analysis',
          'Bonus vesting schedule must be disclosed',
          'Surrender period prominently disclosed'
        ]
      },
      {
        productType: 'fixed_annuity',
        productName: 'Athene MaxRate',
        minCoverage: 10000,
        maxCoverage: 2000000,
        minIssueAge: 0,
        maxIssueAge: 85,
        underwritingApproach: 'guaranteed',
        averageIssueTime: '1 week',
        keyFeatures: [
          'Competitive guaranteed rates',
          'Multiple term options (3-10 years)',
          'Principal guarantee',
          'Interest compounds tax-deferred',
          'Simple, straightforward product'
        ],
        limitations: [
          'Rate locked for term',
          'Early withdrawal penalties',
          'Lower growth potential than FIA'
        ],
        idealClientProfile: 'Conservative savers seeking guaranteed returns'
      }
    ],
    strengths: [
      'Competitive annuity rates',
      'Modern technology and e-application',
      'Strong financial backing (Apollo Global)',
      'Innovative product features',
      'Growing market presence'
    ],
    considerations: [
      'Newer company (founded 2009)',
      'A rating (monitoring for upgrade)',
      'Limited life insurance products'
    ],
    agentSupport: {
      phone: '1-855-428-4363',
      email: 'agentservices@athene.com',
      hours: 'Mon-Fri 8am-6pm CT',
      portalUrl: 'https://connect.athene.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA', 'AZ', 'CO'],
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // CARRIER 8: TRANSAMERICA
  // ---------------------------------------------------------------------------
  {
    id: 'carrier-transamerica',
    name: 'Transamerica Life Insurance Company',
    shortName: 'Transamerica',
    amBestRating: 'A',
    ratingDate: '2025-06-15',
    headquarters: 'Cedar Rapids, IA',
    foundedYear: 1904,
    website: 'https://www.transamerica.com',
    appointmentRequirements: {
      backgroundCheck: true,
      productTraining: true,
      trainingHours: 4,
      otherRequirements: ['Product line certification', 'Suitability training']
    },
    products: [
      {
        productType: 'term_life',
        productName: 'Trendsetter Super',
        minCoverage: 100000,
        maxCoverage: 10000000,
        termLengths: [10, 15, 20, 25, 30, 35, 40],
        minIssueAge: 18,
        maxIssueAge: 80,
        underwritingApproach: 'accelerated',
        averageIssueTime: '3-7 days',
        keyFeatures: [
          'Up to 40-year term lengths available',
          'Accelerated underwriting to $3M',
          'Chronic illness living benefit rider',
          'Conversion to permanent products',
          'Children rider available'
        ],
        limitations: [
          'Longer terms have age restrictions',
          'Living benefit rider has limitations'
        ],
        idealClientProfile: 'Young families seeking long-term affordable protection'
      },
      {
        productType: 'iul',
        productName: 'Financial Foundation IUL',
        minCoverage: 50000,
        maxCoverage: 25000000,
        minIssueAge: 0,
        maxIssueAge: 75,
        underwritingApproach: 'full',
        averageIssueTime: '2-3 weeks',
        keyFeatures: [
          'Flexible death benefit options',
          'Multiple index strategies',
          'Living benefits included',
          'Cash value accumulation',
          'Policy loans available'
        ],
        limitations: [
          'Full underwriting required for larger amounts',
          'Cap rates subject to change',
          'Complex product'
        ],
        idealClientProfile: 'Clients seeking permanent protection with cash value potential',
        complianceNotes: [
          'Review illustration with client',
          'Document understanding of non-guaranteed elements'
        ]
      },
      {
        productType: 'whole_life',
        productName: 'WealthSecure',
        minCoverage: 25000,
        maxCoverage: 1000000,
        minIssueAge: 0,
        maxIssueAge: 75,
        underwritingApproach: 'full',
        averageIssueTime: '2-3 weeks',
        keyFeatures: [
          'Guaranteed death benefit',
          'Guaranteed cash value',
          'Dividend eligible (not guaranteed)',
          'Paid-up additions option',
          'Premium flexibility'
        ],
        limitations: [
          'Higher premiums than term',
          'Full underwriting required',
          'Dividends not guaranteed'
        ],
        idealClientProfile: 'Clients seeking guaranteed permanent coverage with wealth transfer'
      }
    ],
    strengths: [
      'Well-known national brand',
      'Broad product portfolio',
      'Long term lengths available (up to 40 years)',
      'Strong digital tools and e-applications',
      'Comprehensive training resources'
    ],
    considerations: [
      'A rating (down from historical A+ periods)',
      'Some underwriting can be slower',
      'Premium positioning varies by product'
    ],
    agentSupport: {
      phone: '1-800-851-7555',
      email: 'agentservices@transamerica.com',
      hours: 'Mon-Fri 8am-6pm CT',
      portalUrl: 'https://agent.transamerica.com'
    },
    isActive: true,
    statesAvailable: ['IL', 'IN', 'OH', 'MI', 'WI', 'TX', 'FL', 'GA', 'TN', 'NC', 'VA', 'PA', 'NY', 'NJ', 'CA', 'AZ', 'CO', 'WA', 'OR'],
    lastUpdated: '2025-12-01'
  }
];

// ============================================================================
// OPERATING STATES CONFIGURATION
// ============================================================================

export const OPERATING_STATES_DATA: OperatingState[] = [
  {
    stateCode: 'IL',
    stateName: 'Illinois',
    isActive: true,
    launchDate: '2023-01-01',
    stateModuleId: 'mod-state-il',
    stateAssessmentId: 'assess-state-il',
    requiredForNewAdvisors: true,
    specialRequirements: ['Senior suitability attestation for 65+', 'Annuity replacement forms required']
  },
  {
    stateCode: 'IN',
    stateName: 'Indiana',
    isActive: true,
    launchDate: '2023-03-01',
    stateModuleId: 'mod-state-in',
    stateAssessmentId: 'assess-state-in',
    requiredForNewAdvisors: true,
    specialRequirements: ['Standard suitability requirements']
  },
  {
    stateCode: 'OH',
    stateName: 'Ohio',
    isActive: true,
    launchDate: '2023-03-01',
    stateModuleId: 'mod-state-oh',
    stateAssessmentId: 'assess-state-oh',
    requiredForNewAdvisors: true,
    specialRequirements: ['Life insurance illustration requirements']
  },
  {
    stateCode: 'MI',
    stateName: 'Michigan',
    isActive: true,
    launchDate: '2023-06-01',
    stateModuleId: 'mod-state-mi',
    stateAssessmentId: 'assess-state-mi',
    requiredForNewAdvisors: true,
    specialRequirements: ['Standard disclosure requirements']
  },
  {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    isActive: true,
    launchDate: '2023-09-01',
    stateModuleId: 'mod-state-wi',
    stateAssessmentId: 'assess-state-wi',
    requiredForNewAdvisors: false,
    specialRequirements: ['OCI complaint notification requirements']
  },
  {
    stateCode: 'TX',
    stateName: 'Texas',
    isActive: true,
    launchDate: '2024-01-01',
    stateModuleId: 'mod-state-tx',
    stateAssessmentId: 'assess-state-tx',
    requiredForNewAdvisors: true,
    specialRequirements: ['TDI regulations', 'Annuity best interest standard']
  },
  {
    stateCode: 'FL',
    stateName: 'Florida',
    isActive: true,
    launchDate: '2024-03-01',
    stateModuleId: 'mod-state-fl',
    stateAssessmentId: 'assess-state-fl',
    requiredForNewAdvisors: true,
    specialRequirements: ['Senior protection rules (60+)', 'Annuity suitability requirements']
  },
  {
    stateCode: 'GA',
    stateName: 'Georgia',
    isActive: true,
    launchDate: '2024-06-01',
    stateModuleId: 'mod-state-ga',
    stateAssessmentId: 'assess-state-ga',
    requiredForNewAdvisors: false,
    specialRequirements: ['Standard suitability requirements']
  },
  {
    stateCode: 'TN',
    stateName: 'Tennessee',
    isActive: true,
    launchDate: '2024-09-01',
    stateModuleId: 'mod-state-tn',
    stateAssessmentId: 'assess-state-tn',
    requiredForNewAdvisors: false,
    specialRequirements: ['Standard suitability requirements']
  },
  {
    stateCode: 'NC',
    stateName: 'North Carolina',
    isActive: true,
    launchDate: '2025-01-01',
    stateModuleId: 'mod-state-nc',
    stateAssessmentId: 'assess-state-nc',
    requiredForNewAdvisors: false,
    specialRequirements: ['NCDOI disclosure requirements']
  }
];

// ============================================================================
// STATE REGULATIONS - DETAILED COMPLIANCE INFORMATION
// ============================================================================

export const STATE_REGULATIONS_DATA: StateRegulation[] = [
  // ---------------------------------------------------------------------------
  // ILLINOIS STATE REGULATIONS
  // ---------------------------------------------------------------------------
  {
    stateCode: 'IL',
    stateName: 'Illinois',
    regulatoryBody: {
      name: 'Illinois Department of Insurance',
      abbreviation: 'IDOI',
      website: 'https://insurance.illinois.gov',
      phone: '217-782-4515',
      email: 'DOI.InfoDesk@illinois.gov'
    },
    licensing: {
      residentLicenseRequired: true,
      nonResidentAccepted: true,
      ceRequirements: {
        totalHours: 24,
        ethicsHours: 3,
        cycleLengthYears: 2,
        specialRequirements: ['3 hours must be in ethics or industry regulations']
      },
      licenseRenewalFee: 75,
      renewalCycle: 'Biennial'
    },
    productRegulations: [
      {
        productType: 'term_life',
        freeLookPeriod: 10,
        replacementRules: [
          'Replacement form required when replacing existing coverage',
          'Comparison of existing vs. new coverage required',
          'Agent must retain copy of replacement form for 3 years'
        ],
        disclosureRequirements: [
          'Policy summary must be provided',
          'Buyers guide required at or before application'
        ],
        prohibitions: [
          'Twisting (misrepresenting existing coverage)',
          'Churning (excessive replacements for commission)'
        ]
      },
      {
        productType: 'iul',
        freeLookPeriod: 20,
        replacementRules: [
          'Enhanced replacement disclosure for permanent products',
          'Side-by-side comparison required',
          'Must document client understanding of surrender charges'
        ],
        disclosureRequirements: [
          'Illustration must show guaranteed and non-guaranteed values',
          'Cap rate and participation rate disclosure required',
          'Living benefit rider disclosure'
        ],
        prohibitions: [
          'Cannot illustrate rates higher than current',
          'Cannot guarantee non-guaranteed elements verbally'
        ]
      },
      {
        productType: 'fia',
        freeLookPeriod: 30,
        replacementRules: [
          'Full suitability analysis required',
          'Replacement comparison required if replacing existing annuity',
          'Surrender charge comparison mandatory'
        ],
        seniorProtections: [
          'Enhanced suitability for clients 65+',
          'Right to have trusted person present at sale',
          'Extended free look period'
        ],
        disclosureRequirements: [
          'Buyer\'s guide required before or at application',
          'Surrender schedule clearly disclosed',
          'Index crediting methodology explained'
        ],
        prohibitions: [
          'Cannot sell unsuitable products',
          'Cannot misrepresent guarantees',
          'Cannot project future index performance'
        ]
      },
      {
        productType: 'final_expense',
        freeLookPeriod: 20,
        replacementRules: [
          'Must document reason for replacement',
          'Cannot replace to generate commission if not in client interest'
        ],
        seniorProtections: [
          'Age-appropriate suitability analysis',
          'Must verify client understands graded benefits if applicable'
        ],
        disclosureRequirements: [
          'Graded benefit disclosure (if applicable)',
          'Premium comparison to face amount'
        ],
        prohibitions: [
          'Cannot replace existing coverage without documented benefit to client'
        ]
      }
    ],
    seniorProtections: {
      ageThreshold: 65,
      requirements: [
        'Suitability form specifically addresses senior needs',
        'Documentation of financial resources and liquidity needs',
        'Clear disclosure of surrender periods in context of client age',
        'Right to have family member or advisor present'
      ],
      prohibitions: [
        'Cannot recommend products with surrender periods exceeding reasonable life expectancy consideration',
        'Cannot pressure seniors into same-day decisions'
      ]
    },
    annuitySuitability: {
      requiresBestInterest: true,
      documentationRequirements: [
        'Complete suitability form for every annuity sale',
        'Document client\'s financial situation, objectives, and risk tolerance',
        'Document how product meets client needs',
        'Supervisor review required'
      ],
      supervisionRequirements: [
        'IMO must have suitability review procedures',
        'Supervisory review of annuity applications',
        'Training documentation requirements'
      ]
    },
    enforcement: {
      complaintProcess: 'Complaints filed online or by mail. Investigation timeline: 30-90 days typical.',
      penaltyRanges: 'Fines from $500 to $50,000 per violation. License suspension/revocation for serious violations.',
      commonViolations: [
        'Failure to document suitability',
        'Misrepresentation of product features',
        'Replacement without proper disclosure',
        'Selling to unsuitable clients'
      ]
    },
    gcfOperates: true,
    gcfNotes: 'Primary market state. Full carrier support. Enhanced senior protocols in place.',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // TEXAS STATE REGULATIONS
  // ---------------------------------------------------------------------------
  {
    stateCode: 'TX',
    stateName: 'Texas',
    regulatoryBody: {
      name: 'Texas Department of Insurance',
      abbreviation: 'TDI',
      website: 'https://www.tdi.texas.gov',
      phone: '1-800-252-3439',
      email: 'ConsumerProtection@tdi.texas.gov'
    },
    licensing: {
      residentLicenseRequired: true,
      nonResidentAccepted: true,
      ceRequirements: {
        totalHours: 24,
        ethicsHours: 2,
        cycleLengthYears: 2,
        specialRequirements: ['2 hours ethics required', 'No self-study limits']
      },
      licenseRenewalFee: 50,
      renewalCycle: 'Biennial'
    },
    productRegulations: [
      {
        productType: 'term_life',
        freeLookPeriod: 10,
        replacementRules: [
          'Texas Replacement of Life Insurance or Annuities form required',
          'Agent must leave copy with policyholder',
          'Must be signed by applicant'
        ],
        disclosureRequirements: [
          'Policy summary required',
          'Buyers guide at application'
        ],
        prohibitions: [
          'Twisting prohibited',
          'Rebating prohibited except as permitted'
        ]
      },
      {
        productType: 'fia',
        freeLookPeriod: 30,
        replacementRules: [
          'Suitability requirements apply',
          'Replacement disclosure if replacing existing annuity',
          'Best interest standard applies'
        ],
        seniorProtections: [
          'Enhanced suitability for seniors',
          'Additional disclosure requirements'
        ],
        disclosureRequirements: [
          'Annuity buyer\'s guide required',
          'Surrender charge schedule',
          'Index crediting disclosure'
        ],
        prohibitions: [
          'Cannot recommend unsuitable products',
          'Cannot misrepresent guarantees'
        ]
      }
    ],
    seniorProtections: {
      ageThreshold: 65,
      requirements: [
        'Suitability documentation required',
        'Financial situation assessment',
        'Liquidity needs analysis'
      ],
      prohibitions: [
        'Cannot sell unsuitable long-surrender products'
      ]
    },
    annuitySuitability: {
      requiresBestInterest: true,
      documentationRequirements: [
        'Complete suitability determination',
        'Document client profile and needs',
        'Explain why recommended product is suitable'
      ],
      supervisionRequirements: [
        'Insurer must have suitability oversight',
        'Training requirements for agents'
      ]
    },
    enforcement: {
      complaintProcess: 'File online or call TDI consumer helpline.',
      penaltyRanges: 'Administrative penalties up to $25,000 per violation.',
      commonViolations: [
        'Suitability violations',
        'Misrepresentation',
        'Unfair trade practices'
      ]
    },
    gcfOperates: true,
    gcfNotes: 'Major market. Strong carrier support. Best interest standard in effect.',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // FLORIDA STATE REGULATIONS
  // ---------------------------------------------------------------------------
  {
    stateCode: 'FL',
    stateName: 'Florida',
    regulatoryBody: {
      name: 'Florida Department of Financial Services',
      abbreviation: 'FLDFS',
      website: 'https://www.myfloridacfo.com/division/agents',
      phone: '1-877-693-5236',
      email: 'agent.licensing@myfloridacfo.com'
    },
    licensing: {
      residentLicenseRequired: true,
      nonResidentAccepted: true,
      ceRequirements: {
        totalHours: 24,
        ethicsHours: 5,
        cycleLengthYears: 2,
        specialRequirements: ['5 hours must be in ethics/laws/regulations', '3 hours must cover state laws']
      },
      licenseRenewalFee: 48,
      renewalCycle: 'Biennial'
    },
    productRegulations: [
      {
        productType: 'term_life',
        freeLookPeriod: 14,
        replacementRules: [
          'Replacement notice required',
          'Documentation of replacement decision'
        ],
        disclosureRequirements: [
          'Policy summary',
          'Buyers guide'
        ],
        prohibitions: [
          'Twisting',
          'Misrepresentation'
        ]
      },
      {
        productType: 'fia',
        freeLookPeriod: 21,
        replacementRules: [
          'Full suitability required',
          'Replacement comparison mandatory'
        ],
        seniorProtections: [
          'Special protections for seniors 60+',
          'Right to rescind for 21 days',
          'Trusted contact person recommended'
        ],
        disclosureRequirements: [
          'Annuity disclosure document',
          'Surrender charges clearly explained',
          'No guaranteed language for non-guaranteed elements'
        ],
        prohibitions: [
          'Cannot sell to unsuitable clients',
          'Cannot use misleading illustrations'
        ]
      }
    ],
    seniorProtections: {
      ageThreshold: 60,
      requirements: [
        'Enhanced suitability analysis',
        'Longer free look periods',
        'Right to have advisor present'
      ],
      prohibitions: [
        'High-pressure tactics on seniors prohibited'
      ]
    },
    annuitySuitability: {
      requiresBestInterest: true,
      documentationRequirements: [
        'Suitability form completed',
        'Client financial profile documented',
        'Recommendation rationale explained'
      ],
      supervisionRequirements: [
        'Supervisory review procedures required'
      ]
    },
    enforcement: {
      complaintProcess: 'File through FLDFS consumer portal.',
      penaltyRanges: 'Fines up to $20,000 per violation. License actions for serious violations.',
      commonViolations: [
        'Senior exploitation',
        'Suitability violations',
        'Misrepresentation'
      ]
    },
    gcfOperates: true,
    gcfNotes: 'Key retirement market. Enhanced senior protection protocols. High final expense demand.',
    lastUpdated: '2025-12-01'
  }
];

// ============================================================================
// MOCK CALL TRANSCRIPTS - TRAINING SCENARIOS
// ============================================================================

export const MOCK_CALL_TRANSCRIPTS_DATA: MockCallTranscript[] = [
  // ---------------------------------------------------------------------------
  // MOCK CALL 1: EXCELLENT EDUCATION CALL
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-excellent-term',
    title: 'Excellence in Action: Term Life Education',
    description: 'Demonstrates exemplary education-first approach with proper consent, discovery, education, and documentation. This call represents the Gold Coast Financial standard.',
    context: {
      advisorName: 'Sarah Mitchell',
      advisorExperience: '2 years with GCF',
      clientProfile: {
        name: 'David Chen',
        age: 38,
        maritalStatus: 'Married',
        dependents: 'Wife Sarah (36), two children ages 8 and 5',
        occupation: 'IT Project Manager',
        income: '$95,000 annually',
        existingCoverage: '$50,000 through employer',
        primaryConcern: 'Ensuring family is protected if something happens to him'
      },
      callType: 'initial_contact',
      productDiscussed: ['term_life']
    },
    outcome: 'application_submitted',
    rating: 'excellent',
    overallScore: {
      earned: 47,
      possible: 50,
      percentage: 94
    },
    sections: [
      {
        id: 'sec-opening',
        title: 'Opening & Consent',
        startTimestamp: '[0:00]',
        endTimestamp: '[2:30]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 10, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Good afternoon, this is Sarah Mitchell calling from Gold Coast Financial. I\'m a licensed life insurance advisor. Is this David Chen?',
            annotation: {
              type: 'excellent',
              text: 'Proper identification: name, company, role',
              rubricReference: 'Opening (2/2)'
            }
          },
          {
            timestamp: '[0:08]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Yes, this is David. Hi Sarah.'
          },
          {
            timestamp: '[0:12]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Hi David. Thank you for taking my call. I see you recently requested information about life insurance options. I\'m calling to provide education about coverage that might fit your situation. Before we continue, I want to let you know this call may be recorded for quality and training purposes. Is that alright with you?',
            annotation: {
              type: 'excellent',
              text: 'States purpose as educational, discloses recording',
              rubricReference: 'Purpose & Disclosure (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[0:32]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Sure, that\'s fine.'
          },
          {
            timestamp: '[0:35]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Great. This conversation typically takes about 20 to 25 minutes. Do you have that time available right now, or would a different time work better for you?',
            annotation: {
              type: 'excellent',
              text: 'Confirms time availability, offers flexibility',
              rubricReference: 'Time Confirmation (2/2)'
            }
          },
          {
            timestamp: '[0:45]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Now works great. I\'m on my lunch break.'
          },
          {
            timestamp: '[0:49]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Perfect. To help me understand your situation and provide relevant information, I\'ll need to ask you some questions about your family and financial goals. May I proceed with those questions?',
            annotation: {
              type: 'excellent',
              text: 'Explicit consent before proceeding to discovery',
              rubricReference: 'Consent (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[0:58]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Yes, absolutely. Ask away.'
          }
        ]
      },
      {
        id: 'sec-discovery',
        title: 'Discovery & Needs Analysis',
        startTimestamp: '[2:30]',
        endTimestamp: '[10:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 12, possible: 12 },
        lines: [
          {
            timestamp: '[2:35]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Tell me a little about your family situation. Are you married? Do you have children?'
          },
          {
            timestamp: '[2:42]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Yes, I\'m married. My wife\'s name is Sarah—same as you actually—she\'s 36. We have two kids, Emma is 8 and Jake is 5.'
          },
          {
            timestamp: '[2:55]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Wonderful. Does your wife work outside the home?'
          },
          {
            timestamp: '[3:02]',
            speaker: 'client',
            speakerName: 'David',
            content: 'She works part-time, about 20 hours a week as a dental hygienist. She makes around $28,000 a year. We rely mostly on my income though.'
          },
          {
            timestamp: '[3:15]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'That\'s helpful to understand. What\'s your current occupation and roughly what is your annual income, if you\'re comfortable sharing?',
            annotation: {
              type: 'excellent',
              text: 'Respectful approach to income question',
              rubricReference: 'Financial Discovery (3/3)'
            }
          },
          {
            timestamp: '[3:28]',
            speaker: 'client',
            speakerName: 'David',
            content: 'I\'m an IT project manager at a tech company. I make about $95,000.'
          },
          {
            timestamp: '[3:38]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Great. Now, do you currently have any life insurance coverage?'
          },
          {
            timestamp: '[3:45]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Just what I get through work. I think it\'s like one times my salary, so around $50,000.'
          },
          {
            timestamp: '[3:55]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Got it. Employer coverage is a good start. Keep in mind that coverage is tied to your job, so if you ever change employers, that coverage typically doesn\'t follow you. Do you have any personal policies outside of work?',
            annotation: {
              type: 'tip',
              text: 'Educating about employer coverage limitations',
              rubricReference: 'Education (ongoing)'
            }
          },
          {
            timestamp: '[4:10]',
            speaker: 'client',
            speakerName: 'David',
            content: 'No, just the work policy. That\'s kind of why I\'m looking into this.'
          },
          {
            timestamp: '[4:18]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'That makes sense. What specifically prompted you to look into additional coverage now?'
          },
          {
            timestamp: '[4:25]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Honestly? A coworker\'s husband passed away unexpectedly last month. He was only 42. It really made me think about what would happen to Sarah and the kids if something happened to me. $50,000 wouldn\'t go very far.'
          },
          {
            timestamp: '[4:45]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'I\'m sorry to hear about your coworker\'s loss. It\'s natural for events like that to prompt us to think about protecting our own families. If something were to happen to you, what would be most important for your family to be able to maintain?',
            annotation: {
              type: 'excellent',
              text: 'Empathy + open-ended needs question',
              rubricReference: 'Needs Exploration (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[5:02]',
            speaker: 'client',
            speakerName: 'David',
            content: 'I\'d want them to be able to stay in our house. We still owe about $320,000 on the mortgage. And I want the kids to be able to go to college. I also don\'t want Sarah to have to worry about money while she\'s grieving and taking care of the kids.'
          },
          {
            timestamp: '[5:25]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Those are exactly the kinds of needs we should plan for. Let me make sure I capture this correctly. You\'re looking at protecting your mortgage of about $320,000, ensuring college is possible for both kids, and providing income replacement so your wife can focus on the family. Is there anything else you\'d add?',
            annotation: {
              type: 'excellent',
              text: 'Summarizing needs for confirmation',
              rubricReference: 'Needs Confirmation (3/3)'
            }
          },
          {
            timestamp: '[5:48]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Maybe some cushion for unexpected expenses. Funerals are expensive, medical bills, that kind of thing.'
          },
          {
            timestamp: '[6:00]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Absolutely. Final expenses and a emergency buffer are important to factor in. Let me ask about your health briefly. In general, would you say you\'re in good health? Any major conditions or medications?',
            annotation: {
              type: 'tip',
              text: 'Health discovery for underwriting context'
            }
          },
          {
            timestamp: '[6:15]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Pretty good health. I take medication for mild high blood pressure, but it\'s been well controlled for years. I had a physical last month and my doctor said I\'m doing great.'
          },
          {
            timestamp: '[6:30]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'That\'s great to hear. Controlled blood pressure with good recent medical history is generally viewed favorably by carriers. Non-smoker?'
          },
          {
            timestamp: '[6:40]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Never smoked.'
          }
        ]
      },
      {
        id: 'sec-education',
        title: 'Product Education',
        startTimestamp: '[10:00]',
        endTimestamp: '[17:00]',
        rubricCategory: 'Education & Alternatives',
        score: { earned: 13, possible: 14 },
        lines: [
          {
            timestamp: '[10:05]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Based on what you\'ve shared—your family situation, income, mortgage, and goals for the kids\' education—let me walk you through what coverage might look like and the different options available.',
            annotation: {
              type: 'excellent',
              text: 'Connecting education to documented needs',
              rubricReference: 'Needs-Based Education (3/3)'
            }
          },
          {
            timestamp: '[10:22]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Let me share how I arrived at a coverage amount. You mentioned $320,000 on your mortgage. For college, estimating roughly $80,000 to $100,000 per child for four-year schools. That\'s about $180,000 for both kids. For income replacement, many families look at 5 to 10 years of income, especially with young children. At $95,000, that\'s $475,000 to $950,000. And adding $20,000 to $30,000 for final expenses and a buffer.',
            annotation: {
              type: 'excellent',
              text: 'Transparent coverage calculation',
              rubricReference: 'Coverage Rationale (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[10:55]',
            speaker: 'client',
            speakerName: 'David',
            content: 'So we\'re talking what, like a million dollars total?'
          },
          {
            timestamp: '[11:02]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'That\'s the range we\'d be looking at to fully address those needs—somewhere between $750,000 and $1 million when you add it up. But the right amount depends on your comfort level and budget. More coverage provides more protection, but we want this to be sustainable for your family.'
          },
          {
            timestamp: '[11:22]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Now, for someone in your situation, there are a few types of life insurance to consider. Let me explain the main options so you understand the differences.',
            annotation: {
              type: 'excellent',
              text: 'Presenting alternatives before recommendation',
              rubricReference: 'Alternatives Presented (3/3)'
            }
          },
          {
            timestamp: '[11:35]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'First, there\'s term life insurance. This provides coverage for a specific period—10, 20, or 30 years. It\'s the most affordable option and works well when you have a specific time-limited need, like until your mortgage is paid off or kids are independent. The downside is that after the term ends, coverage expires or becomes very expensive to renew.'
          },
          {
            timestamp: '[12:00]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Second, there\'s permanent life insurance, like whole life or universal life. These policies cover you for your entire life and build cash value over time. They\'re more expensive, but the coverage doesn\'t expire. Some people use them for estate planning or leaving a legacy.'
          },
          {
            timestamp: '[12:22]',
            speaker: 'client',
            speakerName: 'David',
            content: 'What would you recommend for someone like me?'
          },
          {
            timestamp: '[12:28]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Based on your specific situation—two young children who will be independent in about 20 years, a mortgage that will be paid off in a similar timeframe, and a need for maximum protection at an affordable premium—a 20 or 25-year term policy would likely fit well.',
            annotation: {
              type: 'excellent',
              text: 'Recommendation tied to specific client needs',
              rubricReference: 'Recommendation Rationale (4/4)'
            }
          },
          {
            timestamp: '[12:50]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'I should mention what term insurance does NOT do. It doesn\'t build cash value, so there\'s no savings component. And if you outlive the term—which statistically is likely—you won\'t receive any money back. The value is the peace of mind and protection during those critical years when your family depends on your income.',
            annotation: {
              type: 'excellent',
              text: 'Clear disclosure of limitations',
              rubricReference: 'Limitations Disclosed (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[13:15]',
            speaker: 'client',
            speakerName: 'David',
            content: 'That makes sense. I\'m not looking for an investment. I just want to make sure Sarah and the kids are protected.'
          },
          {
            timestamp: '[13:25]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'That\'s a healthy way to look at it. Life insurance is about protection, not investment returns. The policies I work with include some additional features at no extra cost that might interest you—like a living benefit that allows you to access a portion of the death benefit if you\'re ever diagnosed with a terminal illness.'
          },
          {
            timestamp: '[13:50]',
            speaker: 'client',
            speakerName: 'David',
            content: 'That\'s included? Interesting.'
          },
          {
            timestamp: '[13:55]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Yes, with most of the carriers I work with. Also, these policies typically include a conversion option, which means you can convert to a permanent policy later without new medical underwriting. That\'s valuable if your health changes.'
          }
        ]
      },
      {
        id: 'sec-confirmation',
        title: 'Understanding Confirmation & Next Steps',
        startTimestamp: '[17:00]',
        endTimestamp: '[22:00]',
        rubricCategory: 'Confirmation & Closing',
        score: { earned: 12, possible: 14 },
        lines: [
          {
            timestamp: '[17:05]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'David, I want to make sure everything I\'ve explained makes sense. Can you tell me in your own words what we\'ve been discussing and what you\'re considering?',
            annotation: {
              type: 'excellent',
              text: 'Verification of understanding - client explains back',
              rubricReference: 'Understanding Confirmed (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[17:18]',
            speaker: 'client',
            speakerName: 'David',
            content: 'So basically, I\'m looking at a term life policy—probably 20 years—for somewhere around $750,000 to a million dollars. It would cover the mortgage, help with the kids\' college, and give Sarah income replacement if I die during that time. After 20 years, the coverage ends but by then the kids would be grown and the mortgage should be paid off.'
          },
          {
            timestamp: '[17:45]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'That\'s exactly right. You\'ve captured it well. Do you have any questions about how the coverage works or anything I\'ve explained?',
            annotation: {
              type: 'excellent',
              text: 'Inviting questions before proceeding'
            }
          },
          {
            timestamp: '[17:55]',
            speaker: 'client',
            speakerName: 'David',
            content: 'What happens if I can\'t afford the premium at some point?'
          },
          {
            timestamp: '[18:02]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Great question. With term insurance, if you stop paying premiums, the policy lapses and coverage ends. There\'s typically a grace period of 30 days to make a late payment. That\'s why it\'s important to choose a coverage amount and premium that fits comfortably in your budget, not just the maximum you could afford today.',
            annotation: {
              type: 'excellent',
              text: 'Honest answer about lapse risk'
            }
          },
          {
            timestamp: '[18:25]',
            speaker: 'client',
            speakerName: 'David',
            content: 'That makes sense. What would the monthly cost be roughly?'
          },
          {
            timestamp: '[18:32]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'For a healthy 38-year-old non-smoker, a 20-year $750,000 term policy typically runs $50 to $70 per month. At $1 million, it might be $65 to $85. These are estimates—actual pricing depends on underwriting, but with your health profile, you\'d likely qualify for competitive rates.'
          },
          {
            timestamp: '[18:55]',
            speaker: 'client',
            speakerName: 'David',
            content: 'That\'s a lot more affordable than I thought. I can definitely work that into the budget.'
          },
          {
            timestamp: '[19:05]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Would you like to proceed with an application today, or would you prefer to discuss this with your wife first? Either option is completely fine.',
            annotation: {
              type: 'excellent',
              text: 'No pressure - clear options given',
              rubricReference: 'No Pressure (3/3)'
            }
          },
          {
            timestamp: '[19:18]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Actually, Sarah and I have already talked about this. She\'s the one who pushed me to finally do something about it. I\'d like to move forward.'
          },
          {
            timestamp: '[19:30]',
            speaker: 'advisor',
            speakerName: 'Sarah',
            content: 'Excellent. Before we start the application, I want to remind you that even after we submit it, you\'ll have a free look period—usually 10 to 20 days depending on the state—after the policy is delivered. During that time, you can review everything with your wife and cancel for a full refund if it\'s not what you expected.',
            annotation: {
              type: 'excellent',
              text: 'Free look disclosure before application',
              rubricReference: 'Rights Disclosed (3/3)'
            }
          },
          {
            timestamp: '[19:55]',
            speaker: 'client',
            speakerName: 'David',
            content: 'Good to know. Let\'s do it.'
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Perfect opening with identification, purpose, and recording disclosure',
        'Obtained explicit consent before discovery',
        'Thorough needs analysis covering all relevant areas',
        'Clear explanation of alternatives before recommendation',
        'Tied recommendation specifically to documented needs',
        'Proactively disclosed limitations of term insurance',
        'Verified client understanding through explain-back',
        'No pressure tactics—offered time to think',
        'Disclosed free look rights before application'
      ],
      areasForImprovement: [
        'Could have explored spouse\'s coverage needs as well',
        'Did not mention riders or additional options beyond living benefit'
      ],
      keyTakeaways: [
        'Education-first approach builds trust and leads to informed decisions',
        'Tying recommendations to specific documented needs creates defensible suitability',
        'Disclosing limitations actually increases client confidence',
        'No-pressure approach leads to motivated, satisfied clients'
      ],
      complianceNotes: [
        'All required disclosures completed',
        'Needs documented before product discussion',
        'Suitability elements properly addressed'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-education-call',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // MOCK CALL 2: NEEDS IMPROVEMENT - COMPLIANCE ISSUES
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-needs-improvement',
    title: 'Learning Opportunity: Common Compliance Pitfalls',
    description: 'This call demonstrates common mistakes that violate Gold Coast Financial standards. Study this to recognize and avoid these behaviors.',
    context: {
      advisorName: 'Mike Roberts',
      advisorExperience: '6 months with GCF',
      clientProfile: {
        name: 'Carol Thompson',
        age: 72,
        maritalStatus: 'Widowed',
        occupation: 'Retired teacher',
        income: 'Fixed income - pension and Social Security',
        existingCoverage: '$25,000 final expense policy (5 years old)',
        primaryConcern: 'Someone called about reviewing her coverage'
      },
      callType: 'initial_contact',
      productDiscussed: ['final_expense', 'fia']
    },
    outcome: 'compliance_concern',
    rating: 'needs_improvement',
    overallScore: {
      earned: 18,
      possible: 50,
      percentage: 36
    },
    sections: [
      {
        id: 'sec-opening-bad',
        title: 'Opening & Consent',
        startTimestamp: '[0:00]',
        endTimestamp: '[1:30]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 3, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'Hi Mrs. Thompson, this is Mike. How are you doing today?',
            annotation: {
              type: 'violation',
              text: 'VIOLATION: Did not identify company or role',
              rubricReference: 'Opening (0/2)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          },
          {
            timestamp: '[0:08]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'I\'m fine, Mike. Do I know you?'
          },
          {
            timestamp: '[0:12]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'I\'m calling about the life insurance review you requested. We have some new programs that could save you money.',
            annotation: {
              type: 'violation',
              text: 'VIOLATION: Did not clarify company, implied existing relationship, mentioned "saving money" before needs analysis',
              rubricReference: 'Purpose (0/3)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          },
          {
            timestamp: '[0:25]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'I don\'t remember requesting a review. Is this from my insurance company?'
          },
          {
            timestamp: '[0:32]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'We work with many top companies. Let me just ask you a few quick questions and I can show you how to get better coverage for less.',
            annotation: {
              type: 'violation',
              text: 'VIOLATION: Evasive answer, no recording disclosure, no explicit consent, product-first language',
              rubricReference: 'Consent (0/3)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          }
        ]
      },
      {
        id: 'sec-discovery-bad',
        title: 'Discovery (Inadequate)',
        startTimestamp: '[1:30]',
        endTimestamp: '[4:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 4, possible: 12 },
        lines: [
          {
            timestamp: '[1:35]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'So you\'re 72, right? And you have that $25,000 policy?'
          },
          {
            timestamp: '[1:42]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'Yes, I\'ve had it about 5 years. It covers my funeral expenses. My daughter helped me pick it out.'
          },
          {
            timestamp: '[1:52]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'I see. Well, funeral costs have gone up a lot. $25,000 might not be enough anymore. Plus, do you have any savings set aside for retirement income?',
            annotation: {
              type: 'violation',
              text: 'VIOLATION: Created unnecessary fear, immediately pivoted to another product without exploring needs',
              rubricReference: 'Needs Analysis (2/6)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          },
          {
            timestamp: '[2:08]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'I have my teacher\'s pension and Social Security. I put some money in a CD at the bank too.'
          },
          {
            timestamp: '[2:18]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'CDs are paying almost nothing these days. I have something that can get you a much better return and it\'s completely safe.',
            annotation: {
              type: 'violation',
              text: 'VIOLATION: Disparaging existing financial vehicle, making return promises, no suitability analysis',
              rubricReference: 'Education (0/3)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          }
        ]
      },
      {
        id: 'sec-pressure',
        title: 'Pressure Tactics',
        startTimestamp: '[4:00]',
        endTimestamp: '[8:00]',
        rubricCategory: 'Closing Approach',
        score: { earned: 0, possible: 14 },
        lines: [
          {
            timestamp: '[4:05]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'I can get you signed up for an annuity today that will give you guaranteed income for life. The rates are changing at the end of this week, so we\'d need to move on this today.',
            annotation: {
              type: 'violation',
              text: 'CRITICAL VIOLATION: Artificial urgency, no suitability analysis, unsuitable product for client profile',
              rubricReference: 'No Pressure (0/3)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          },
          {
            timestamp: '[4:25]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'I don\'t know. This is a lot to think about. I should talk to my daughter first.'
          },
          {
            timestamp: '[4:32]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'I totally understand, but if we wait, you\'ll miss this rate. It\'s really in your best interest to lock this in now. Your daughter will thank you.',
            annotation: {
              type: 'violation',
              text: 'CRITICAL VIOLATION: Overriding client\'s desire to consult family, continued urgency pressure',
              rubricReference: 'Client Autonomy (0/3)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          },
          {
            timestamp: '[4:50]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'I really don\'t want to make a decision today. Can you send me some information?'
          },
          {
            timestamp: '[4:58]',
            speaker: 'advisor',
            speakerName: 'Mike',
            content: 'Mrs. Thompson, at your age, you really can\'t afford to wait. Every day you wait is a day you\'re losing money in that CD. I\'m trying to help you here.',
            annotation: {
              type: 'violation',
              text: 'CRITICAL VIOLATION: Age-based pressure, not respecting "no", manipulative language',
              rubricReference: 'Senior Protection (0/4)'
            },
            isHighlighted: true,
            highlightColor: 'red'
          },
          {
            timestamp: '[5:15]',
            speaker: 'client',
            speakerName: 'Carol',
            content: 'I said no. I want to talk to my daughter. Please don\'t call me again.',
            annotation: {
              type: 'warning',
              text: 'Client has clearly declined and requested no further contact',
              rubricReference: 'Call Outcome'
            }
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Nothing in this call meets Gold Coast Financial standards'
      ],
      areasForImprovement: [
        'Did not properly identify self, company, or role',
        'Did not obtain consent before proceeding',
        'Did not disclose call recording',
        'Inadequate needs analysis - jumped to products immediately',
        'Attempted to replace existing coverage without proper review',
        'Introduced unsuitable product (annuity) to 72-year-old with fixed income',
        'Used artificial urgency and pressure tactics',
        'Did not respect client\'s request to think about it',
        'Made age-related pressure statements',
        'Failed to honor client\'s "no"'
      ],
      keyTakeaways: [
        'This call demonstrates multiple grounds for termination',
        'Senior clients require enhanced protections, not pressure',
        'NO always means NO - end professionally',
        'Artificial urgency is a compliance violation',
        'Products must match documented needs, not agent goals'
      ],
      complianceNotes: [
        'Potential senior exploitation violation',
        'Suitability violation - inappropriate product recommendation',
        'Disclosure failures - company, recording, purpose',
        'Pressure tactics - multiple instances',
        'Do Not Call violation - client requested no further contact'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-education-call',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // MOCK CALL 3: EXCELLENT IUL EDUCATION CALL
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-iul-education',
    title: 'IUL Deep Dive: Education-First Permanent Insurance',
    description: 'Demonstrates proper indexed universal life education with transparent explanation of features, limitations, and realistic expectations.',
    context: {
      advisorName: 'Jennifer Park',
      advisorExperience: '4 years with GCF',
      clientProfile: {
        name: 'Michael and Lisa Rodriguez',
        age: 45,
        maritalStatus: 'Married',
        dependents: 'One child age 16, one age 19 in college',
        occupation: 'Michael: Business owner (electrical contractor), Lisa: Office manager',
        income: '$185,000 combined household income',
        existingCoverage: '$500,000 term (10 years remaining)',
        primaryConcern: 'Interested in cash value accumulation for retirement supplement'
      },
      callType: 'follow_up',
      productDiscussed: ['iul']
    },
    outcome: 'application_submitted',
    rating: 'excellent',
    overallScore: {
      earned: 48,
      possible: 50,
      percentage: 96
    },
    sections: [
      {
        id: 'sec-iul-recap',
        title: 'Recap & Agenda Setting',
        startTimestamp: '[0:00]',
        endTimestamp: '[3:00]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 10, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Hi Michael and Lisa, it\'s Jennifer Park from Gold Coast Financial. Thank you for making time for our follow-up call today. As a reminder, this call is being recorded for quality purposes. Is that still okay?',
            annotation: {
              type: 'excellent',
              text: 'Proper re-identification and recording reminder',
              rubricReference: 'Opening (2/2)'
            }
          },
          {
            timestamp: '[0:15]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'Yes, that\'s fine. Lisa\'s on the line too.'
          },
          {
            timestamp: '[0:20]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Hi Lisa! In our last conversation, you both expressed interest in learning more about permanent life insurance options that could provide death benefit protection while also accumulating cash value for retirement. You mentioned wanting something that offered some growth potential without market risk to principal. Is that still accurate?',
            annotation: {
              type: 'excellent',
              text: 'Confirms understanding of documented needs',
              rubricReference: 'Needs Confirmation (3/3)'
            }
          },
          {
            timestamp: '[0:45]',
            speaker: 'client',
            speakerName: 'Lisa',
            content: 'Yes, exactly. We want to understand how the indexed universal life works, especially the cash value part.'
          },
          {
            timestamp: '[0:55]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Perfect. Today I\'ll walk you through exactly how IUL works—the good parts AND the limitations. I believe in full transparency so you can make an informed decision. This should take about 30 to 35 minutes. I\'ll also show you an illustration, but I want to explain what those numbers mean before we look at them. Do you have questions before we start?',
            annotation: {
              type: 'excellent',
              text: 'Sets transparent expectations, mentions limitations upfront',
              rubricReference: 'Purpose & Disclosure (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          }
        ]
      },
      {
        id: 'sec-iul-education',
        title: 'IUL Mechanics Education',
        startTimestamp: '[3:00]',
        endTimestamp: '[15:00]',
        rubricCategory: 'Education & Alternatives',
        score: { earned: 14, possible: 14 },
        lines: [
          {
            timestamp: '[3:05]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Let me explain how indexed universal life works conceptually. IUL is a permanent life insurance product—meaning it\'s designed to last your whole life, not just a term. It has two main components: a death benefit that pays your beneficiaries, and a cash value that accumulates over time.',
            annotation: {
              type: 'excellent',
              text: 'Clear foundational explanation',
              rubricReference: 'Education Fundamentals (3/3)'
            }
          },
          {
            timestamp: '[3:30]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'The cash value earns interest based on the performance of a market index—most commonly the S&P 500. But here\'s the critical thing to understand: your money is NOT invested in the stock market. The insurance company uses index performance as a measuring stick to determine your interest credit.'
          },
          {
            timestamp: '[3:55]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'So we\'re not actually in the market?'
          },
          {
            timestamp: '[4:00]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Correct. You don\'t own stocks. The insurer credits interest to your cash value based on how the index performs, but with a floor—typically 0%—meaning you don\'t lose value when the market drops. However, there\'s a tradeoff.',
            annotation: {
              type: 'excellent',
              text: 'Clear distinction - not invested in market',
              rubricReference: 'Index Mechanics (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[4:22]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'The tradeoff is that your upside is also limited. There\'s usually a cap—say 10%—meaning if the index goes up 15%, you only get credited 10%. Or there\'s a participation rate, where you get a percentage of the gain. These caps and rates can change over time; they\'re not guaranteed.',
            annotation: {
              type: 'excellent',
              text: 'Honest disclosure of caps and limitations',
              rubricReference: 'Limitations Disclosed (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[4:50]',
            speaker: 'client',
            speakerName: 'Lisa',
            content: 'What kind of returns should we realistically expect?'
          },
          {
            timestamp: '[4:58]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'That\'s an important question, and I have to be careful here. Illustrations often show non-guaranteed projections using assumed rates like 5.5% or 6.5%. But these are NOT promises. Actual historical performance of well-funded IUL policies has varied widely—some years 0%, some years hitting the cap. A reasonable expectation for planning purposes might be 4% to 6% long-term, but nothing is guaranteed except the floor.',
            annotation: {
              type: 'excellent',
              text: 'Realistic expectations, no over-promising',
              rubricReference: 'Illustration Explanation (4/4)'
            }
          },
          {
            timestamp: '[5:35]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'I want to show you two illustrations: one at a more optimistic rate, and one at the guaranteed rate—which shows what happens with just the floor. The guaranteed column is the worst-case scenario, and you should make sure you\'re comfortable with that before deciding.'
          },
          {
            timestamp: '[6:00]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'That makes sense. We\'ve heard some people talk about IUL as a retirement strategy. Is that legitimate?'
          },
          {
            timestamp: '[6:10]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'It can be a supplement to retirement, but I need to be honest about the limitations. You can access cash value through policy loans, which are generally tax-free if done correctly. But loans reduce your death benefit, and if you take too much, the policy can lapse—which could trigger a significant tax bill. IUL should never be your primary retirement vehicle. It works best as a complement to 401(k)s and other retirement accounts.',
            annotation: {
              type: 'excellent',
              text: 'Balanced view, warns about over-reliance',
              rubricReference: 'Appropriate Use Cases (3/3)'
            }
          },
          {
            timestamp: '[6:50]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'There\'s another consideration: costs. IUL has internal costs—mortality charges, administrative fees—that come out of your cash value. In the early years especially, a significant portion of your premium goes to these costs and the death benefit, not cash accumulation. It typically takes 10 to 15 years before cash value really starts building momentum.',
            annotation: {
              type: 'excellent',
              text: 'Transparent about costs and timeline',
              rubricReference: 'Cost Disclosure (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          }
        ]
      },
      {
        id: 'sec-iul-suitability',
        title: 'Suitability Confirmation',
        startTimestamp: '[15:00]',
        endTimestamp: '[22:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 12, possible: 12 },
        lines: [
          {
            timestamp: '[15:05]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Before we go further, let me make sure IUL is actually appropriate for your situation. You mentioned you have $500,000 in term coverage with 10 years left. You also mentioned maxing out your 401(k) contributions. Is that still the case?'
          },
          {
            timestamp: '[15:25]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'Yes, I contribute the max to my SEP-IRA for the business, and Lisa maxes her 401(k). We have about 18 years until we want to retire.'
          },
          {
            timestamp: '[15:40]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Good. IUL is most suitable for people who have already maxed out tax-advantaged retirement accounts and have a long time horizon—at least 15 years—to let the cash value grow. With 18 years to retirement, you have enough runway. If you needed this money in 5 years, I wouldn\'t recommend IUL.',
            annotation: {
              type: 'excellent',
              text: 'Clear suitability criteria explained',
              rubricReference: 'Suitability Assessment (4/4)'
            }
          },
          {
            timestamp: '[16:10]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'One more question: You\'re comfortable with the idea that this money is committed long-term? Unlike a savings account, you can\'t just withdraw cash value freely in the early years without consequences.'
          },
          {
            timestamp: '[16:28]',
            speaker: 'client',
            speakerName: 'Lisa',
            content: 'Yes, we understand. We have emergency savings separate from this. This would be long-term money we don\'t touch for 15 plus years.'
          },
          {
            timestamp: '[16:42]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'That\'s exactly the right mindset for IUL. Let me also ask—how would you feel if ten years from now, your cash value was lower than the illustrations projected because the market underperformed?'
          },
          {
            timestamp: '[17:00]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'I mean, we\'d be disappointed, but that\'s why we have other retirement accounts. This is supplemental.'
          },
          {
            timestamp: '[17:12]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Perfect answer. That\'s the right way to think about it. You understand this is not guaranteed performance, and you have other resources. That tells me you\'re approaching this appropriately.',
            annotation: {
              type: 'excellent',
              text: 'Confirms client has appropriate expectations',
              rubricReference: 'Expectation Setting (4/4)'
            }
          }
        ]
      },
      {
        id: 'sec-iul-closing',
        title: 'Understanding Confirmation & Next Steps',
        startTimestamp: '[22:00]',
        endTimestamp: '[30:00]',
        rubricCategory: 'Confirmation & Closing',
        score: { earned: 12, possible: 14 },
        lines: [
          {
            timestamp: '[22:05]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'I\'ve covered a lot. Can you summarize back to me what you understand about how IUL works and its limitations?',
            annotation: {
              type: 'excellent',
              text: 'Understanding verification through explain-back',
              rubricReference: 'Understanding Confirmed (4/4)'
            }
          },
          {
            timestamp: '[22:18]',
            speaker: 'client',
            speakerName: 'Lisa',
            content: 'Okay, so it\'s permanent life insurance with a death benefit plus cash value. The cash value earns interest based on an index like S&P 500, but we\'re not actually invested in stocks. There\'s a floor of 0% so we don\'t lose money, but also a cap on gains. The caps can change. It takes a long time—10 to 15 years—before cash value builds up because of internal costs. And if we take loans, it reduces the death benefit and we need to be careful not to let it lapse.'
          },
          {
            timestamp: '[22:55]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'That\'s an excellent summary, Lisa. You\'ve clearly understood the key concepts. Michael, anything you\'d add or any questions?'
          },
          {
            timestamp: '[23:05]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'I think I get it. The illustrations aren\'t guaranteed—the guaranteed column shows worst case. And we should think of this as supplemental to our other retirement, not the main thing.'
          },
          {
            timestamp: '[23:20]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Exactly right. You both have a clear understanding. Would you like to proceed with an application, or would you like some time to review the illustration together first?'
          },
          {
            timestamp: '[23:35]',
            speaker: 'client',
            speakerName: 'Michael',
            content: 'We\'ve been thinking about this for a while. I think we\'re ready to move forward. What coverage amount makes sense?'
          },
          {
            timestamp: '[23:48]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Based on our earlier discussions about budget and goals, a $500,000 policy with a premium around $800 monthly would provide a meaningful death benefit and allow for solid cash accumulation over your timeline. That amount fit comfortably in the budget you mentioned. Does that still work?'
          },
          {
            timestamp: '[24:10]',
            speaker: 'client',
            speakerName: 'Lisa',
            content: 'Yes, that works for us.'
          },
          {
            timestamp: '[24:15]',
            speaker: 'advisor',
            speakerName: 'Jennifer',
            content: 'Before we proceed, I want to remind you that once the policy is issued, you\'ll have a free look period—typically 10 to 20 days—to review everything. If it\'s not what you expected, you can return it for a full refund. You\'ll also receive the full illustration with the policy documents.',
            annotation: {
              type: 'excellent',
              text: 'Free look disclosure',
              rubricReference: 'Rights Disclosed (3/3)'
            }
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Excellent explanation of IUL mechanics without overselling',
        'Clearly distinguished between market investment and index crediting',
        'Disclosed caps, participation rates, and their variability',
        'Set realistic return expectations',
        'Emphasized long time horizon requirement',
        'Verified suitability with appropriate questions',
        'Had client explain back their understanding',
        'Positioned IUL appropriately as supplemental strategy'
      ],
      areasForImprovement: [
        'Could have reviewed specific illustration columns in more detail',
        'Did not discuss specific carrier or product features in depth'
      ],
      keyTakeaways: [
        'IUL education requires full transparency about limitations',
        'Client understanding verification is essential for complex products',
        'Suitability must be documented—time horizon, existing coverage, risk tolerance',
        'Never position IUL as primary retirement vehicle'
      ],
      complianceNotes: [
        'All required IUL disclosures completed',
        'Non-guaranteed nature clearly explained',
        'Suitability properly assessed and documented',
        'Client demonstrated understanding'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-iul-education',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // MOCK CALL 4: FINAL EXPENSE WITH SENIOR - EXCELLENT HANDLING
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-senior-fe',
    title: 'Senior Client Excellence: Final Expense Education',
    description: 'Demonstrates exemplary handling of a senior client with appropriate pacing, family involvement, and extra care required for vulnerable populations.',
    context: {
      advisorName: 'Robert Chen',
      advisorExperience: '3 years with GCF',
      clientProfile: {
        name: 'Margaret Wilson',
        age: 68,
        maritalStatus: 'Widowed',
        dependents: 'Adult daughter Susan, grandson age 12',
        occupation: 'Retired nurse',
        income: 'Pension $2,400/month, Social Security $1,800/month',
        existingCoverage: 'None currently - let previous policy lapse after husband passed',
        primaryConcern: 'Does not want to burden daughter with funeral costs'
      },
      callType: 'initial_contact',
      productDiscussed: ['final_expense']
    },
    outcome: 'follow_up_scheduled',
    rating: 'excellent',
    overallScore: {
      earned: 49,
      possible: 50,
      percentage: 98
    },
    sections: [
      {
        id: 'sec-senior-opening',
        title: 'Senior-Appropriate Opening',
        startTimestamp: '[0:00]',
        endTimestamp: '[4:00]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 10, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Good morning, may I speak with Margaret Wilson please?'
          },
          {
            timestamp: '[0:05]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'This is Margaret.'
          },
          {
            timestamp: '[0:08]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Good morning Mrs. Wilson. My name is Robert Chen and I\'m a licensed life insurance advisor with Gold Coast Financial. I\'m calling because you recently requested information about final expense insurance coverage. This is not an emergency or anything urgent—I\'m simply following up on your request. Is this a good time to talk?',
            annotation: {
              type: 'excellent',
              text: 'Clear identification, explicitly states non-urgent, asks about timing',
              rubricReference: 'Senior Opening (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[0:35]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'Oh yes, I did fill something out online. My daughter helped me. What is this about exactly?'
          },
          {
            timestamp: '[0:45]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'I\'d be happy to explain. Final expense insurance is a type of life insurance designed to cover end-of-life costs like funeral expenses, so your family doesn\'t have to pay out of pocket. I\'m calling to answer any questions you have and explain your options. There\'s no obligation—my job is simply to provide information so you can make an informed decision.',
            annotation: {
              type: 'excellent',
              text: 'Clear purpose, no obligation emphasized',
              rubricReference: 'Purpose Clarity (3/3)'
            }
          },
          {
            timestamp: '[1:15]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Before we continue, I want to let you know this call is recorded for quality purposes. Also, is there a family member who helps you with financial decisions that you\'d like to have join us? Perhaps your daughter Susan?',
            annotation: {
              type: 'excellent',
              text: 'Recording disclosure + proactively inviting family involvement',
              rubricReference: 'Senior Protection (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[1:38]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'Susan is actually here visiting. Should I put her on the phone too?'
          },
          {
            timestamp: '[1:45]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'That would be wonderful if she\'s available. Having a family member on the call helps ensure you have support and someone to discuss things with afterward. Take your time.',
            annotation: {
              type: 'excellent',
              text: 'Encourages family support, no rush',
              rubricReference: 'Family Involvement (2/2)'
            }
          },
          {
            timestamp: '[2:10]',
            speaker: 'client',
            speakerName: 'Susan',
            content: 'Hi, this is Susan. I\'m Mom\'s daughter. She said you\'re calling about burial insurance?'
          },
          {
            timestamp: '[2:18]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Hi Susan, thank you for joining us. Yes, I\'m Robert Chen with Gold Coast Financial. Your mother requested information about final expense insurance. I\'m here to explain options and answer questions—there\'s no pressure and no obligation. My goal is to provide education so your family can decide what\'s right for you.'
          }
        ]
      },
      {
        id: 'sec-senior-discovery',
        title: 'Gentle Discovery',
        startTimestamp: '[4:00]',
        endTimestamp: '[12:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 12, possible: 12 },
        lines: [
          {
            timestamp: '[4:05]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Mrs. Wilson, what prompted you to look into this coverage? What\'s important to you?'
          },
          {
            timestamp: '[4:15]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'Well, my husband Harold passed two years ago. We had a policy on him but I let mine lapse after he died—money was tight and I just... forgot about it. Now I\'m worried about Susan having to pay for my funeral when the time comes.'
          },
          {
            timestamp: '[4:40]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'I\'m sorry for your loss, Mrs. Wilson. It\'s very thoughtful of you to think about easing that burden for Susan. Many people in your situation have the same concern.',
            annotation: {
              type: 'excellent',
              text: 'Empathy and validation without pressure',
              rubricReference: 'Emotional Intelligence (3/3)'
            }
          },
          {
            timestamp: '[5:02]',
            speaker: 'client',
            speakerName: 'Susan',
            content: 'Mom, you don\'t need to worry about that. I can handle it.'
          },
          {
            timestamp: '[5:08]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'I know sweetie, but Harold\'s funeral was almost $12,000. I don\'t want you dipping into your savings or worse, going into debt for me.'
          },
          {
            timestamp: '[5:22]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Mrs. Wilson, that\'s a very realistic concern. Average funeral costs today are between $8,000 and $15,000 depending on the arrangements. May I ask a few questions to understand your situation better?'
          },
          {
            timestamp: '[5:40]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'Of course.'
          },
          {
            timestamp: '[5:45]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'You mentioned you\'re retired. Can you tell me about your monthly income? I want to make sure any coverage we discuss fits comfortably in your budget.',
            annotation: {
              type: 'excellent',
              text: 'Budget-first approach with seniors',
              rubricReference: 'Affordability Focus (3/3)'
            }
          },
          {
            timestamp: '[6:00]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'I get about $4,200 a month total—my nursing pension and Social Security. After rent and bills, I have maybe $300 to $400 left over.'
          },
          {
            timestamp: '[6:18]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Thank you for sharing that. We\'ll make sure anything we discuss fits well within that budget. May I ask about your general health? This helps me understand what options might be available to you.',
            annotation: {
              type: 'excellent',
              text: 'Gentle health inquiry',
              rubricReference: 'Health Discovery (3/3)'
            }
          },
          {
            timestamp: '[6:40]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'I have high blood pressure and Type 2 diabetes, but both are controlled with medication. I see my doctor regularly.'
          },
          {
            timestamp: '[6:55]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'That\'s great that you\'re managing those conditions well. Those are common conditions and many carriers work with clients who have well-controlled diabetes and blood pressure.'
          }
        ]
      },
      {
        id: 'sec-senior-education',
        title: 'Clear, Simple Education',
        startTimestamp: '[12:00]',
        endTimestamp: '[20:00]',
        rubricCategory: 'Education & Alternatives',
        score: { earned: 14, possible: 14 },
        lines: [
          {
            timestamp: '[12:05]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Let me explain how final expense insurance works in simple terms. It\'s a smaller whole life insurance policy—usually $5,000 to $25,000—designed specifically to cover funeral costs and maybe some final bills. The premium stays the same for life and the coverage never expires.',
            annotation: {
              type: 'excellent',
              text: 'Simple, clear explanation appropriate for audience',
              rubricReference: 'Education Clarity (4/4)'
            }
          },
          {
            timestamp: '[12:35]',
            speaker: 'client',
            speakerName: 'Susan',
            content: 'What\'s the difference between this and regular life insurance?'
          },
          {
            timestamp: '[12:42]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Great question. Regular life insurance—like term insurance—is usually for larger amounts to replace income or pay off a mortgage. Final expense is smaller and specifically designed for end-of-life costs. The underwriting is also simpler, which means fewer health questions and faster approval for most people.'
          },
          {
            timestamp: '[13:10]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Based on your health, Mrs. Wilson, you would likely qualify for what\'s called a "simplified issue" policy. This means you answer some health questions but don\'t need a medical exam. For coverage around $10,000 to $15,000—enough to cover a typical funeral—the monthly premium would probably be somewhere between $70 and $120 depending on the exact amount and carrier.',
            annotation: {
              type: 'excellent',
              text: 'Realistic pricing range given',
              rubricReference: 'Cost Transparency (3/3)'
            }
          },
          {
            timestamp: '[13:45]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'That sounds manageable. What about if my health gets worse?'
          },
          {
            timestamp: '[13:52]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Once you\'re approved and the policy is in place, your premium is locked in for life—it never increases regardless of health changes. And the coverage can\'t be cancelled as long as you pay the premium. That\'s one of the benefits of whole life—the protection is permanent.',
            annotation: {
              type: 'excellent',
              text: 'Explains permanent nature clearly',
              rubricReference: 'Product Features (3/3)'
            }
          },
          {
            timestamp: '[14:20]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'There is one limitation I should mention. Some policies have a two-year waiting period for full benefits, meaning if you pass away in the first two years from natural causes, the policy might only return premiums paid plus interest rather than the full death benefit. Accidental death is usually covered immediately. I would work to find you a policy without this waiting period if possible.',
            annotation: {
              type: 'excellent',
              text: 'Proactively discloses graded benefit limitation',
              rubricReference: 'Limitations Disclosed (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          }
        ]
      },
      {
        id: 'sec-senior-closing',
        title: 'No-Pressure Conclusion',
        startTimestamp: '[20:00]',
        endTimestamp: '[28:00]',
        rubricCategory: 'Confirmation & Closing',
        score: { earned: 13, possible: 14 },
        lines: [
          {
            timestamp: '[20:05]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Mrs. Wilson, Susan, I\'ve covered a lot of information. Do you have any questions so far?'
          },
          {
            timestamp: '[20:15]',
            speaker: 'client',
            speakerName: 'Susan',
            content: 'This has been really helpful. Mom, what do you think?'
          },
          {
            timestamp: '[20:22]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'I think this makes sense. But I\'d like to think about it and maybe have Susan look at the numbers with me.'
          },
          {
            timestamp: '[20:35]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'That\'s a very wise approach, Mrs. Wilson. I always recommend people take time to think about these decisions and discuss with family. There\'s no urgency—this coverage will still be available next week or next month.',
            annotation: {
              type: 'excellent',
              text: 'Explicitly supports taking time to decide',
              rubricReference: 'No Pressure (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[21:00]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'What I\'d like to do is put together a written summary of what we discussed, along with one or two specific options that fit your budget and health situation. I can email this to Susan so you can review it together. Then we can schedule a follow-up call when you\'re ready—whether that\'s next week or in a few weeks. How does that sound?',
            annotation: {
              type: 'excellent',
              text: 'Offers documentation for review, puts client in control of timing',
              rubricReference: 'Client Control (3/3)'
            }
          },
          {
            timestamp: '[21:30]',
            speaker: 'client',
            speakerName: 'Susan',
            content: 'That would be really helpful. My email is susan.wilson@email.com.'
          },
          {
            timestamp: '[21:40]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'Perfect. I\'ll send that over by end of day tomorrow. Mrs. Wilson, would next Thursday afternoon work for a follow-up call? That gives you about a week to review everything with Susan.'
          },
          {
            timestamp: '[22:00]',
            speaker: 'client',
            speakerName: 'Margaret',
            content: 'Thursday afternoon would be fine. Thank you for being so patient with all my questions, Robert.'
          },
          {
            timestamp: '[22:10]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'It\'s my pleasure, Mrs. Wilson. That\'s exactly what I\'m here for. Susan, would you like to be on the follow-up call as well?'
          },
          {
            timestamp: '[22:22]',
            speaker: 'client',
            speakerName: 'Susan',
            content: 'Yes, definitely. What time Thursday?'
          },
          {
            timestamp: '[22:28]',
            speaker: 'advisor',
            speakerName: 'Robert',
            content: 'How about 2:00 PM? I\'ll call the same number and you can both be on.'
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Calm, clear opening with no false urgency',
        'Proactively invited family member to join call',
        'Gentle, respectful discovery questions',
        'Budget-first approach before discussing products',
        'Simple, age-appropriate explanations',
        'Voluntarily disclosed policy limitations (graded benefits)',
        'Enthusiastically supported client\'s desire to think about decision',
        'Provided documentation for family review',
        'Set follow-up with family involvement'
      ],
      areasForImprovement: [
        'Could have asked more about specific funeral preferences/wishes'
      ],
      keyTakeaways: [
        'Senior clients require extra care and slower pace',
        'Family involvement should be encouraged, not discouraged',
        'Never create urgency with senior clients',
        'Written documentation helps seniors review with family',
        'Supporting client\'s desire to wait is good practice, not lost sale'
      ],
      complianceNotes: [
        'Excellent senior protection protocol followed',
        'Family member included throughout',
        'No pressure tactics',
        'Clear disclosures provided',
        'Documentation promised for review'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-senior-call',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // MOCK CALL 5: ANNUITY SUITABILITY CALL - EXCELLENT
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-annuity-suitable',
    title: 'Annuity Suitability: Retirement Income Education',
    description: 'Demonstrates proper fixed indexed annuity education and suitability assessment for a pre-retiree seeking guaranteed income.',
    context: {
      advisorName: 'Amanda Torres',
      advisorExperience: '5 years with GCF',
      clientProfile: {
        name: 'Richard and Barbara Stevens',
        age: 62,
        maritalStatus: 'Married',
        occupation: 'Richard: Engineer (retiring in 3 years), Barbara: Part-time consultant',
        income: '$145,000 currently, expecting $48,000/year in Social Security combined',
        existingCoverage: 'Life insurance in place, adequate',
        primaryConcern: 'Worried about outliving retirement savings, want guaranteed income'
      },
      callType: 'application',
      productDiscussed: ['fia']
    },
    outcome: 'application_submitted',
    rating: 'excellent',
    overallScore: {
      earned: 46,
      possible: 50,
      percentage: 92
    },
    sections: [
      {
        id: 'sec-annuity-opening',
        title: 'Appointment Confirmation',
        startTimestamp: '[0:00]',
        endTimestamp: '[3:00]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 10, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Good afternoon, Richard and Barbara. This is Amanda Torres from Gold Coast Financial. Thank you for setting up this appointment to discuss retirement income options. I have you both on the line?',
            annotation: {
              type: 'excellent',
              text: 'Confirms both decision-makers present',
              rubricReference: 'Opening (2/2)'
            }
          },
          {
            timestamp: '[0:15]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'Yes, we\'re both here. Thanks for calling on time.'
          },
          {
            timestamp: '[0:20]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'My pleasure. As a reminder, this call is recorded for quality purposes. Today we\'re going to discuss fixed indexed annuities and whether one might fit your retirement income strategy. My goal is to educate you thoroughly so you can make an informed decision—there\'s no pressure to do anything today. This conversation usually takes about 40 minutes. Does that work for you?',
            annotation: {
              type: 'excellent',
              text: 'Recording disclosure, purpose, no pressure, time estimate',
              rubricReference: 'Disclosure & Purpose (4/4)'
            }
          }
        ]
      },
      {
        id: 'sec-annuity-suitability',
        title: 'Suitability Assessment',
        startTimestamp: '[3:00]',
        endTimestamp: '[15:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 11, possible: 12 },
        lines: [
          {
            timestamp: '[3:05]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Before we discuss any products, I need to understand your complete financial picture. This ensures anything I recommend is actually suitable for your situation. Is that okay?',
            annotation: {
              type: 'excellent',
              text: 'Establishes suitability assessment necessity',
              rubricReference: 'Suitability Process (3/3)'
            }
          },
          {
            timestamp: '[3:25]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'Of course. What do you need to know?'
          },
          {
            timestamp: '[3:30]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Let\'s start with your overall retirement assets. Can you give me a rough picture? You don\'t need exact numbers—ranges are fine.'
          },
          {
            timestamp: '[3:45]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'We have about $850,000 in 401(k) and IRAs combined. Our house is paid off—worth about $400,000. We\'ll get around $48,000 a year combined from Social Security starting at 67.'
          },
          {
            timestamp: '[4:10]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'That\'s helpful context. And what are your monthly expenses? What do you estimate you\'ll need in retirement?'
          },
          {
            timestamp: '[4:22]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'We\'ve budgeted it out. We think we need about $6,500 a month to maintain our lifestyle—that includes some travel.'
          },
          {
            timestamp: '[4:35]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'So $78,000 annually. Social Security gives you $48,000, leaving a $30,000 gap to fill from your savings. That\'s about $2,500 per month. Does that math match your planning?',
            annotation: {
              type: 'excellent',
              text: 'Verifies income gap calculation',
              rubricReference: 'Needs Quantification (3/3)'
            }
          },
          {
            timestamp: '[4:55]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'Yes, that\'s exactly what we calculated. The concern is—what if we live to 95? Our savings would run out.'
          },
          {
            timestamp: '[5:10]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'That\'s the longevity risk concern, and it\'s completely valid. Before we discuss solutions, a few more important questions. What percentage of your retirement assets would you consider committing to a product with a multi-year surrender period—meaning you couldn\'t access it freely for, say, 7 to 10 years?',
            annotation: {
              type: 'excellent',
              text: 'Tests understanding of liquidity tradeoff',
              rubricReference: 'Liquidity Assessment (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[5:40]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'We\'ve discussed this. We\'d be comfortable putting 25% to 30% of our retirement money—maybe $200,000 to $250,000—into something less liquid if it meant guaranteed income.'
          },
          {
            timestamp: '[6:00]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'And you would keep the remaining 70% or so accessible for emergencies, healthcare, and flexible spending?'
          },
          {
            timestamp: '[6:12]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'Yes, exactly. We want to layer our income—Social Security is guaranteed, then something else guaranteed to fill the gap, then we can draw from the rest as needed.'
          },
          {
            timestamp: '[6:28]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'That\'s excellent retirement planning thinking. The layering approach makes a lot of sense. Now, have you worked with fixed indexed annuities before, or is this new territory?'
          },
          {
            timestamp: '[6:45]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'We\'ve heard about them but honestly, we don\'t fully understand them. Some people say they\'re great, others say avoid them.'
          },
          {
            timestamp: '[6:58]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Both perspectives have merit depending on the situation. Let me explain how they work, including the drawbacks, so you can decide if it fits your needs.',
            annotation: {
              type: 'excellent',
              text: 'Acknowledges both sides, promises balanced view',
              rubricReference: 'Balanced Education (2/2)'
            }
          }
        ]
      },
      {
        id: 'sec-annuity-education',
        title: 'Product Education & Limitations',
        startTimestamp: '[15:00]',
        endTimestamp: '[30:00]',
        rubricCategory: 'Education & Alternatives',
        score: { earned: 13, possible: 14 },
        lines: [
          {
            timestamp: '[15:05]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'A fixed indexed annuity is a contract with an insurance company. You give them a lump sum, and in exchange, they can provide guaranteed income for life. The "indexed" part means your account value can grow based on market index performance—but like IUL, you\'re not actually in the market. Your principal is protected from market losses.',
            annotation: {
              type: 'excellent',
              text: 'Clear foundational explanation',
              rubricReference: 'Product Education (4/4)'
            }
          },
          {
            timestamp: '[15:40]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Now for the tradeoffs—and there are several important ones. First, the surrender period. Most FIAs have a 7 to 10 year period where withdrawing more than 10% per year triggers surrender charges. Those charges can be significant—often starting at 8% to 10% and declining each year.'
          },
          {
            timestamp: '[16:10]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'So if we needed all the money in year 3, we\'d lose a chunk?'
          },
          {
            timestamp: '[16:18]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Exactly. That\'s why I asked about what percentage you\'re comfortable committing. This money needs to be money you won\'t need for emergencies. The 10% annual free withdrawal helps, but this isn\'t a savings account.',
            annotation: {
              type: 'excellent',
              text: 'Clear liquidity limitation explanation',
              rubricReference: 'Limitations Disclosure (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[16:45]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Second limitation: the guaranteed income rider—which is what provides that lifetime income—usually has an annual fee, often 0.95% to 1.25% of the benefit base. This comes out of your account value.'
          },
          {
            timestamp: '[17:10]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Third, and this is important: the income rider tracks a separate number called the "benefit base" for calculating your lifetime income. This is NOT the same as your actual cash value. The benefit base can look impressive, but you can\'t withdraw that amount as a lump sum—it\'s only for calculating your income payments.',
            annotation: {
              type: 'excellent',
              text: 'Critical distinction explained clearly',
              rubricReference: 'Complex Concepts (3/3)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[17:45]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'Wait, can you explain that again? The benefit base versus cash value?'
          },
          {
            timestamp: '[17:52]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Absolutely—this confuses a lot of people. Think of it this way: you have two separate buckets. The accumulation value is your actual money—what you\'d get if you surrendered the contract. The benefit base is a calculation number that grows by a guaranteed rate—say 7% simple—but it\'s only used to determine your monthly income. If the benefit base is $300,000 and the payout rate is 5%, you\'d get $15,000 per year for life. But you couldn\'t withdraw the $300,000 as a lump sum.',
            annotation: {
              type: 'excellent',
              text: 'Patient re-explanation with concrete example',
              rubricReference: 'Client Understanding (3/3)'
            }
          },
          {
            timestamp: '[18:35]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'Oh, I see. So the benefit base is kind of a fictional number for calculation purposes.'
          },
          {
            timestamp: '[18:45]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'That\'s a good way to think about it. It\'s real in the sense that it determines your guaranteed income, but it\'s not money you can access in a lump sum.'
          },
          {
            timestamp: '[19:00]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Given all that—the surrender period, the fees, and the benefit base complexity—an annuity is most appropriate for someone like you who has a specific income gap to fill, has other liquid assets for emergencies, and values the guarantee of lifetime income over maximum growth potential. Does that still sound like your situation?',
            annotation: {
              type: 'excellent',
              text: 'Re-confirms suitability after disclosures',
              rubricReference: 'Suitability Re-confirmation (2/2)'
            }
          }
        ]
      },
      {
        id: 'sec-annuity-closing',
        title: 'Confirmation & Application',
        startTimestamp: '[30:00]',
        endTimestamp: '[42:00]',
        rubricCategory: 'Confirmation & Closing',
        score: { earned: 12, possible: 14 },
        lines: [
          {
            timestamp: '[30:05]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'Yes, this is exactly what we\'re looking for. The guaranteed income is worth the tradeoffs for us. What would $200,000 give us?'
          },
          {
            timestamp: '[30:18]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Based on current rates, a $200,000 premium with a 7-year deferral—meaning you start income at age 69—would likely provide around $14,000 to $16,000 per year for life. That\'s both of you—joint life. Combined with your $48,000 Social Security, you\'d have $62,000 to $64,000 guaranteed annually.'
          },
          {
            timestamp: '[30:50]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'That covers most of our $78,000 need. We could fill the rest from our other savings.'
          },
          {
            timestamp: '[31:02]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Exactly. And at a 4% withdrawal rate on your remaining $650,000, you\'d have access to about $26,000 more annually—giving you plenty of cushion plus a healthcare reserve.'
          },
          {
            timestamp: '[31:25]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'This makes a lot of sense. We\'d like to move forward.'
          },
          {
            timestamp: '[31:32]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Before we do, I want to make sure you can both summarize back to me the key features and limitations. Barbara, can you explain the surrender period and why it matters?',
            annotation: {
              type: 'excellent',
              text: 'Verification of understanding before application',
              rubricReference: 'Understanding Confirmed (4/4)'
            }
          },
          {
            timestamp: '[31:50]',
            speaker: 'client',
            speakerName: 'Barbara',
            content: 'The surrender period is 7 years where we can only take out 10% per year without a penalty. If we take more, we pay surrender charges that start high and go down. So this needs to be money we don\'t need to touch.'
          },
          {
            timestamp: '[32:15]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Perfect. Richard, can you explain the difference between the benefit base and the cash value?'
          },
          {
            timestamp: '[32:25]',
            speaker: 'client',
            speakerName: 'Richard',
            content: 'The benefit base is the number used to calculate our lifetime income—it grows by a guaranteed rate. But it\'s not real money we can withdraw. The cash value is what we\'d actually get if we cashed out, which is different.'
          },
          {
            timestamp: '[32:48]',
            speaker: 'advisor',
            speakerName: 'Amanda',
            content: 'Excellent. You both clearly understand the product. One more reminder: after the policy is issued, you\'ll have a free look period—usually 10 days but up to 30 days in some states for seniors—where you can review everything and cancel for a full refund if anything isn\'t as expected.',
            annotation: {
              type: 'excellent',
              text: 'Free look disclosure',
              rubricReference: 'Rights Disclosed (3/3)'
            }
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Thorough suitability assessment before any product discussion',
        'Verified liquidity comfort level with specific percentage question',
        'Transparent disclosure of surrender period and charges',
        'Clear explanation of benefit base vs accumulation value distinction',
        'Patient re-explanation when client needed clarification',
        'Re-confirmed suitability after disclosures',
        'Had both clients explain back key concepts before application',
        'Positioned annuity as part of layered retirement strategy'
      ],
      areasForImprovement: [
        'Could have discussed specific carrier and contract features in more detail',
        'Did not mention inflation risk to purchasing power'
      ],
      keyTakeaways: [
        'Annuity suitability requires thorough financial assessment',
        'Benefit base vs cash value is critical client education point',
        'Never recommend annuity without verifying adequate liquid assets remain',
        'Client understanding verification prevents future complaints'
      ],
      complianceNotes: [
        'Complete suitability assessment documented',
        'All annuity disclosures provided',
        'Client understanding verified through explain-back',
        'Free look period disclosed'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-annuity-call',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // MOCK CALL 6: OBJECTION HANDLING - EXCELLENT
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-objections',
    title: 'Masterful Objection Handling',
    description: 'Demonstrates professional, compliant handling of common client objections while maintaining education-first approach.',
    context: {
      advisorName: 'Marcus Williams',
      advisorExperience: '2 years with GCF',
      clientProfile: {
        name: 'Kevin Park',
        age: 34,
        maritalStatus: 'Married',
        dependents: 'Wife pregnant with first child',
        occupation: 'Marketing manager',
        income: '$92,000 annually',
        existingCoverage: '$50,000 through employer',
        primaryConcern: 'Skeptical of life insurance, approached by multiple agents'
      },
      callType: 'initial_contact',
      productDiscussed: ['term_life']
    },
    outcome: 'application_submitted',
    rating: 'excellent',
    overallScore: {
      earned: 45,
      possible: 50,
      percentage: 90
    },
    sections: [
      {
        id: 'sec-objection-opening',
        title: 'Opening & Initial Resistance',
        startTimestamp: '[0:00]',
        endTimestamp: '[5:00]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 9, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Good afternoon, this is Marcus Williams, a licensed life insurance advisor with Gold Coast Financial. Is this Kevin Park?'
          },
          {
            timestamp: '[0:10]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Yeah. Look, I\'m going to stop you right there. I\'ve had three insurance agents call me this week. I\'m really not interested in a sales pitch.'
          },
          {
            timestamp: '[0:22]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'I completely understand, and I appreciate you being direct. You requested information online, so I\'m required to follow up, but I promise I\'m not here to push anything. My role is education—helping you understand your options so you can make your own decision. If at any point you want me to stop, just say so. Fair enough?',
            annotation: {
              type: 'excellent',
              text: 'Acknowledges frustration, reframes as education, gives control to client',
              rubricReference: 'Objection Response (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[0:48]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Alright, that\'s different from the others. What do you want to know?'
          },
          {
            timestamp: '[0:55]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'First, is this a good time? I want to make sure you can talk freely. Also, this call is recorded for quality purposes—is that okay?'
          },
          {
            timestamp: '[1:08]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Sure, I\'ve got about 15 minutes.'
          }
        ]
      },
      {
        id: 'sec-objection-skepticism',
        title: 'Handling Industry Skepticism',
        startTimestamp: '[5:00]',
        endTimestamp: '[12:00]',
        rubricCategory: 'Objection Handling',
        score: { earned: 12, possible: 12 },
        lines: [
          {
            timestamp: '[5:05]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'I saw you and your wife are expecting your first child. Congratulations! What prompted you to request information about life insurance?'
          },
          {
            timestamp: '[5:18]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'My wife actually. She\'s been on me about it since she got pregnant. I just... I don\'t trust insurance companies. They take your money for years and then find ways not to pay.'
          },
          {
            timestamp: '[5:35]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'That\'s a concern I hear often, and I understand where it comes from. There have been news stories about denied claims that rightfully make people skeptical. Can I share some facts that might help put this in perspective?',
            annotation: {
              type: 'excellent',
              text: 'Validates concern, asks permission to share info',
              rubricReference: 'Trust Building (3/3)'
            }
          },
          {
            timestamp: '[5:55]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Sure, go ahead.'
          },
          {
            timestamp: '[6:00]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Life insurance actually has the highest claim payment rate of any insurance type. Industry-wide, about 99% of claims are paid. The small percentage that aren\'t are usually because of material misrepresentation on the application—like not disclosing a serious health condition—or the policy lapsed due to non-payment. If you\'re honest on your application and pay your premiums, claims get paid.',
            annotation: {
              type: 'excellent',
              text: 'Uses facts to address concern, explains when claims aren\'t paid',
              rubricReference: 'Education Response (4/4)'
            },
            isHighlighted: true,
            highlightColor: 'green'
          },
          {
            timestamp: '[6:35]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'I didn\'t know the rate was that high. But what about all these different products? Whole life, universal life, term... it feels like they\'re designed to confuse people and upsell them.'
          },
          {
            timestamp: '[6:52]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'I agree it can be confusing, and unfortunately some agents do push more complex products because they pay higher commissions. I\'ll be transparent: for someone in your situation—young, healthy, growing family, need to replace your income—term life insurance is almost always the right fit. It\'s straightforward, affordable, and does exactly what you need. The more complex products like IUL or whole life make sense in specific situations, but probably not yours right now.',
            annotation: {
              type: 'excellent',
              text: 'Complete transparency about industry practices, recommends appropriate simple product',
              rubricReference: 'Honest Guidance (4/4)'
            }
          },
          {
            timestamp: '[7:30]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Okay, I appreciate you being straight with me. What about those "buy term and invest the difference" arguments? Is term life a waste of money because it doesn\'t build cash value?'
          },
          {
            timestamp: '[7:48]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'That\'s actually a solid financial strategy that many advisors recommend. The idea is: term insurance costs less, so you invest what you save into retirement accounts where it grows tax-advantaged. Life insurance is for protection, not investment. The two shouldn\'t be mixed unless you have very specific advanced planning needs—which most people don\'t.',
            annotation: {
              type: 'excellent',
              text: 'Validates competing philosophy rather than disparaging it',
              rubricReference: 'Balanced View (3/3)'
            }
          }
        ]
      },
      {
        id: 'sec-objection-cost',
        title: 'Handling Cost Objection',
        startTimestamp: '[12:00]',
        endTimestamp: '[18:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 12, possible: 14 },
        lines: [
          {
            timestamp: '[12:05]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'So what are we talking about cost-wise? With a baby coming, we\'re watching every dollar.'
          },
          {
            timestamp: '[12:15]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Totally understand. Before I throw out numbers, help me understand what you\'re protecting. If something happened to you, what would your wife and child need?'
          },
          {
            timestamp: '[12:30]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'She\'d need to cover the mortgage—we owe about $280,000. Plus, she\'s taking a year off for the baby, so she\'d need income until she can go back to work. Honestly, I\'d want her to have enough cushion to not worry about money while grieving.'
          },
          {
            timestamp: '[12:55]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Those are the right things to think about. So mortgage payoff, income replacement for several years, and a buffer. That\'s roughly $280,000 plus maybe 5 to 7 years of your $92,000 income, plus a cushion. We\'re probably looking at $700,000 to $900,000 in coverage to be comfortable.'
          },
          {
            timestamp: '[13:25]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'That sounds expensive.'
          },
          {
            timestamp: '[13:30]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Here\'s where term insurance shines. For a healthy 34-year-old non-smoker, a 20-year $750,000 policy would likely run $40 to $55 per month. That\'s less than most streaming service bundles.',
            annotation: {
              type: 'excellent',
              text: 'Uses relatable comparison, doesn\'t oversell amount',
              rubricReference: 'Cost Contextualization (3/3)'
            }
          },
          {
            timestamp: '[13:55]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Really? That\'s way less than I expected. I thought life insurance was like $200 a month.'
          },
          {
            timestamp: '[14:05]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'That\'s a common misconception. Studies show people overestimate term insurance costs by 3 to 4 times. The agents pushing whole life at $300 per month probably contributed to that impression. Term is designed to be affordable.',
            annotation: {
              type: 'excellent',
              text: 'Explains misconception source',
              rubricReference: 'Education (3/3)'
            }
          },
          {
            timestamp: '[14:30]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'What if I lose my job? I don\'t want another bill I can\'t pay.'
          },
          {
            timestamp: '[14:40]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Valid concern. Term policies have a 30-day grace period for late payments, so one missed payment doesn\'t cancel coverage immediately. If money gets really tight, you could also reduce the coverage amount or term length to lower the premium. But I\'d encourage you to treat this like any essential bill—because that\'s what protection for your family is.',
            annotation: {
              type: 'excellent',
              text: 'Addresses concern with flexibility options',
              rubricReference: 'Objection Resolution (3/3)'
            }
          }
        ]
      },
      {
        id: 'sec-objection-closing',
        title: 'Natural Close',
        startTimestamp: '[18:00]',
        endTimestamp: '[25:00]',
        rubricCategory: 'Confirmation & Closing',
        score: { earned: 12, possible: 14 },
        lines: [
          {
            timestamp: '[18:05]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Alright, you\'ve addressed most of my concerns. But I still need to talk to my wife before doing anything.'
          },
          {
            timestamp: '[18:15]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Absolutely. That\'s important—she should be part of this decision. Would it help if I set up a quick call with both of you, or would you prefer to discuss it first and call back if you have questions?',
            annotation: {
              type: 'excellent',
              text: 'Supports spousal involvement, offers options',
              rubricReference: 'Client Autonomy (3/3)'
            }
          },
          {
            timestamp: '[18:35]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'Actually... let me text her real quick. She\'s been bugging me about this for months.'
          },
          {
            timestamp: '[18:45]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Take your time.'
          },
          {
            timestamp: '[19:30]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'She says, and I quote, "Finally! Yes, do it!" I guess I\'m approved at home.'
          },
          {
            timestamp: '[19:40]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Ha! Smart woman. Before we proceed, let me make sure you understand what happens next. We\'ll complete an application which asks health questions. Based on your answers, you\'ll either get approved at standard rates or they may want additional information. The whole process usually takes 1 to 3 weeks. And remember, even after the policy is issued, you have a free look period to review everything and cancel for a full refund if it\'s not right.',
            annotation: {
              type: 'excellent',
              text: 'Sets process expectations, free look disclosure',
              rubricReference: 'Process Explanation (3/3)'
            }
          },
          {
            timestamp: '[20:15]',
            speaker: 'client',
            speakerName: 'Kevin',
            content: 'That sounds fair. What do you need from me?'
          },
          {
            timestamp: '[20:22]',
            speaker: 'advisor',
            speakerName: 'Marcus',
            content: 'Just honest answers to health questions. And I mean honest—remember what I said about the 99% claim rate? The 1% that aren\'t paid usually involve misrepresentation. So if you have any health conditions, disclose them. It\'s always better to be upfront.',
            annotation: {
              type: 'excellent',
              text: 'Reinforces honesty importance',
              rubricReference: 'Compliance Reminder (2/2)'
            }
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Immediately acknowledged client skepticism without defensiveness',
        'Reframed role from salesperson to educator',
        'Used industry statistics to address trust concerns',
        'Recommended simple term product despite higher commission potential with complex products',
        'Validated competing philosophies (buy term invest difference)',
        'Used relatable cost comparisons (streaming services)',
        'Supported spousal involvement without pushing',
        'Natural close without pressure tactics'
      ],
      areasForImprovement: [
        'Could have explored employer coverage options',
        'Did not discuss rider options available'
      ],
      keyTakeaways: [
        'Meet skepticism with transparency, not defensiveness',
        'Industry statistics can overcome trust objections',
        'Recommending simple products builds credibility',
        'Cost objections often stem from misconceptions',
        'Support for spousal involvement often accelerates decisions'
      ],
      complianceNotes: [
        'All disclosures completed',
        'No pressure tactics used',
        'Appropriate product recommendation',
        'Client autonomy respected throughout'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-objection-handling',
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // MOCK CALL 7: CALL RECOVERY - SATISFACTORY
  // ---------------------------------------------------------------------------
  {
    id: 'mock-call-recovery',
    title: 'Call Recovery: Turning Around a Rough Start',
    description: 'Demonstrates how to recover professionally when a call starts poorly, including self-correction and getting back on track.',
    context: {
      advisorName: 'Daniel Foster',
      advisorExperience: '8 months with GCF',
      clientProfile: {
        name: 'Anthony Martinez',
        age: 44,
        maritalStatus: 'Divorced',
        dependents: 'Two children ages 14 and 11 (joint custody)',
        occupation: 'Restaurant manager',
        income: '$58,000 annually',
        existingCoverage: 'None',
        primaryConcern: 'Wants children protected if something happens to him'
      },
      callType: 'initial_contact',
      productDiscussed: ['term_life']
    },
    outcome: 'application_submitted',
    rating: 'satisfactory',
    overallScore: {
      earned: 35,
      possible: 50,
      percentage: 70
    },
    sections: [
      {
        id: 'sec-recovery-rough-start',
        title: 'Rough Start',
        startTimestamp: '[0:00]',
        endTimestamp: '[3:00]',
        rubricCategory: 'Opening & Consent',
        score: { earned: 5, possible: 10 },
        lines: [
          {
            timestamp: '[0:00]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Hey Anthony, it\'s Daniel calling about the life insurance you were looking at. Got a minute?',
            annotation: {
              type: 'warning',
              text: 'Too casual, missing company identification',
              rubricReference: 'Opening (1/2)'
            },
            isHighlighted: true,
            highlightColor: 'yellow'
          },
          {
            timestamp: '[0:10]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Daniel who? What company?'
          },
          {
            timestamp: '[0:15]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Sorry about that—let me start over. My name is Daniel Foster and I\'m a licensed life insurance advisor with Gold Coast Financial. You recently requested information about coverage options online. I apologize for the casual opening—that wasn\'t professional of me.',
            annotation: {
              type: 'tip',
              text: 'RECOVERY: Self-corrects and apologizes',
              rubricReference: 'Self-Correction (+2)'
            },
            isHighlighted: true,
            highlightColor: 'blue'
          },
          {
            timestamp: '[0:38]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Okay, no worries. Yeah, I did fill something out. What do you need?'
          },
          {
            timestamp: '[0:45]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'I want to let you know this call is being recorded for quality and training purposes. Is that alright with you?',
            annotation: {
              type: 'excellent',
              text: 'Recording disclosure - back on track',
              rubricReference: 'Disclosure (2/2)'
            }
          },
          {
            timestamp: '[0:55]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Sure, that\'s fine.'
          }
        ]
      },
      {
        id: 'sec-recovery-discovery',
        title: 'Discovery with Minor Missteps',
        startTimestamp: '[3:00]',
        endTimestamp: '[10:00]',
        rubricCategory: 'Discovery & Needs',
        score: { earned: 9, possible: 12 },
        lines: [
          {
            timestamp: '[3:05]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Perfect. I\'d like to understand your situation so I can explain what options might work for you. What prompted you to look into life insurance?'
          },
          {
            timestamp: '[3:18]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'My kids. I\'m divorced, but I have them half the time. I want to make sure they\'re taken care of if something happens to me.'
          },
          {
            timestamp: '[3:32]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'That\'s a responsible thing to do. How old are your children?'
          },
          {
            timestamp: '[3:38]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Michael is 14 and Sofia is 11.'
          },
          {
            timestamp: '[3:45]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Great ages. So you\'ve got about 7 years until Michael is independent and 10 for Sofia. That helps me understand the timeframe you\'re protecting.',
            annotation: {
              type: 'excellent',
              text: 'Connecting children\'s ages to coverage duration',
              rubricReference: 'Needs Analysis (3/3)'
            }
          },
          {
            timestamp: '[4:05]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Do you pay child support or have any financial obligations that would continue after...?',
            annotation: {
              type: 'warning',
              text: 'Slightly awkward phrasing, but acceptable',
              rubricReference: 'Communication (-1)'
            }
          },
          {
            timestamp: '[4:15]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'I pay $1,200 a month in child support, yeah. Plus I cover their health insurance through work.'
          },
          {
            timestamp: '[4:28]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Got it. And if something happened to you, would you want the insurance to replace that support until they\'re adults?'
          },
          {
            timestamp: '[4:38]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Yeah, at least that. Honestly, I\'d want my ex to have some cushion too—she\'d need to cover the extra costs of having them full time plus maybe help with college.'
          },
          {
            timestamp: '[4:55]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'That\'s thoughtful. Let me make sure I understand: $1,200 monthly support for about 10 years is roughly $144,000 just for the child support portion. If we add a buffer for college and unexpected costs, we\'re probably looking at $250,000 to $400,000 range. Does that align with what you were thinking?',
            annotation: {
              type: 'excellent',
              text: 'Quantifies needs with client input',
              rubricReference: 'Needs Quantification (3/3)'
            }
          },
          {
            timestamp: '[5:25]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Yeah, that sounds about right. I was thinking around $300,000.'
          }
        ]
      },
      {
        id: 'sec-recovery-education',
        title: 'Solid Education',
        startTimestamp: '[10:00]',
        endTimestamp: '[18:00]',
        rubricCategory: 'Education & Alternatives',
        score: { earned: 11, possible: 14 },
        lines: [
          {
            timestamp: '[10:05]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Based on your needs—protecting your children until they\'re adults, covering child support, and providing a cushion for their education—term life insurance is what I\'d recommend. Let me explain how it works.',
            annotation: {
              type: 'excellent',
              text: 'Connects recommendation to documented needs',
              rubricReference: 'Needs-Based Recommendation (3/3)'
            }
          },
          {
            timestamp: '[10:28]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Term insurance covers you for a specific period—like 15 or 20 years. If you pass away during that time, your beneficiaries get the full death benefit tax-free. If you outlive the term, the coverage ends and there\'s no payout.',
            annotation: {
              type: 'excellent',
              text: 'Clear explanation of term basics',
              rubricReference: 'Product Education (3/3)'
            }
          },
          {
            timestamp: '[10:55]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'So I could end up paying for years and getting nothing?'
          },
          {
            timestamp: '[11:02]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'That\'s right—statistically, most term policies never pay out because the insured outlives the term. Think of it like car insurance: you pay your premiums hoping you never need it, and if you don\'t get in an accident, you don\'t get a refund. The value is the protection during the years your kids depend on you.',
            annotation: {
              type: 'excellent',
              text: 'Good analogy, honest about statistics',
              rubricReference: 'Limitations Disclosed (3/3)'
            }
          },
          {
            timestamp: '[11:35]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Fair point. What about those policies that build cash value?'
          },
          {
            timestamp: '[11:42]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Those are permanent policies—whole life or universal life. They\'re more expensive because part of your premium goes toward building cash value. For your situation, honestly, term is more practical. The premium savings let you get more coverage for your kids, and you can invest the difference elsewhere if you want.',
            annotation: {
              type: 'excellent',
              text: 'Honest comparison, recommends appropriate product',
              rubricReference: 'Alternatives Presented (2/2)'
            }
          },
          {
            timestamp: '[12:15]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'For a 44-year-old non-smoker—you don\'t smoke, right?'
          },
          {
            timestamp: '[12:22]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Quit five years ago.'
          },
          {
            timestamp: '[12:26]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'That\'s great—most carriers consider you non-smoker after 12 months tobacco-free. For $300,000 over 15 years, you\'re probably looking at $35 to $50 per month depending on underwriting.',
            annotation: {
              type: 'tip',
              text: 'Good tobacco follow-up, realistic pricing',
              rubricReference: 'Cost Transparency (2/2)'
            }
          }
        ]
      },
      {
        id: 'sec-recovery-closing',
        title: 'Competent Close',
        startTimestamp: '[18:00]',
        endTimestamp: '[25:00]',
        rubricCategory: 'Confirmation & Closing',
        score: { earned: 10, possible: 14 },
        lines: [
          {
            timestamp: '[18:05]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'That fits in my budget. I think this makes sense.'
          },
          {
            timestamp: '[18:12]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Before we proceed, I want to make sure you understand what you\'re getting. Can you tell me in your own words what this coverage does?',
            annotation: {
              type: 'excellent',
              text: 'Understanding verification',
              rubricReference: 'Understanding Confirmed (3/3)'
            }
          },
          {
            timestamp: '[18:25]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'It\'s a 15-year policy for $300,000. If I die during that time, my kids get the money through their mom. If I don\'t die, the coverage ends and I don\'t get anything back.'
          },
          {
            timestamp: '[18:42]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'That\'s exactly right. One thing to add—after the policy is delivered, you\'ll have a free look period, usually 10 days, where you can review everything and cancel for a full refund if anything isn\'t what you expected.',
            annotation: {
              type: 'excellent',
              text: 'Free look disclosure',
              rubricReference: 'Rights Disclosed (3/3)'
            }
          },
          {
            timestamp: '[19:00]',
            speaker: 'client',
            speakerName: 'Anthony',
            content: 'Good to know. Let\'s do it.'
          },
          {
            timestamp: '[19:05]',
            speaker: 'advisor',
            speakerName: 'Daniel',
            content: 'Great. I\'ll need to ask you some health questions. Please answer honestly—it protects you and ensures the claim gets paid when needed.',
            annotation: {
              type: 'tip',
              text: 'Honesty reminder, though could be more thorough',
              rubricReference: 'Application Setup (2/3)'
            }
          }
        ]
      }
    ],
    summary: {
      whatWentWell: [
        'Quickly recognized and corrected unprofessional opening',
        'Self-correction with apology demonstrated accountability',
        'Good recovery from rough start',
        'Solid needs discovery and quantification',
        'Appropriate term recommendation for situation',
        'Honest about term insurance statistics',
        'Verified client understanding before application'
      ],
      areasForImprovement: [
        'Opening lacked professionalism (recovered)',
        'Some awkward phrasing during discovery',
        'Could have explored beneficiary designation in more detail',
        'Did not discuss riders or living benefits'
      ],
      keyTakeaways: [
        'Mistakes happen—how you recover matters',
        'Self-correction with accountability builds trust',
        'A rough start doesn\'t doom a call',
        'Substance of conversation can overcome early missteps'
      ],
      complianceNotes: [
        'All required disclosures completed (after correction)',
        'Appropriate product recommendation',
        'Understanding verified',
        'Opening issue would be flagged in QA review but call is compliant'
      ]
    },
    certificationLevel: 'core_advisor',
    rubricId: 'rubric-education-call',
    lastUpdated: '2025-12-01'
  }
];

// ============================================================================
// EXPANDED GLOSSARY TERMS
// ============================================================================

export const EXPANDED_GLOSSARY_TERMS: GlossaryTerm[] = [
  // PRODUCT TERMS
  {
    id: 'term-death-benefit',
    term: 'Death Benefit',
    shortDefinition: 'The amount paid to beneficiaries when the insured person dies.',
    fullDefinition: 'The death benefit is the primary purpose of life insurance—the sum of money paid to the designated beneficiary or beneficiaries upon the death of the insured. This amount is typically income tax-free to recipients. Death benefits can be level (same amount throughout the policy) or decreasing (reduces over time, often used for mortgage protection).',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-iul', 'mod-product-fe'],
    relatedTerms: ['term-face-amount', 'term-beneficiary', 'term-living-benefit'],
    examples: [
      {
        context: 'Term life explanation',
        usage: 'The policy provides a $500,000 death benefit if the insured passes away during the 20-year term.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Never guarantee death benefit payment—explain that claims are subject to policy terms and conditions.'
  },
  {
    id: 'term-face-amount',
    term: 'Face Amount',
    shortDefinition: 'The stated dollar value of a life insurance policy.',
    fullDefinition: 'The face amount, also called the face value or coverage amount, is the dollar amount stated on the policy that will be paid as the death benefit (subject to any policy loans, withdrawals, or riders that may affect the amount). For term insurance, this amount is typically level. For universal life, the face amount may be adjusted during the policy life.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-iul'],
    relatedTerms: ['term-death-benefit', 'term-premium'],
    complianceImportance: 'important'
  },
  {
    id: 'term-premium',
    term: 'Premium',
    shortDefinition: 'The payment made to keep an insurance policy in force.',
    fullDefinition: 'The premium is the amount paid to the insurance company to maintain coverage. Premiums can be paid monthly, quarterly, semi-annually, or annually. For term insurance, premiums are typically level for the term period. For permanent insurance, premiums may be flexible (universal life) or level (whole life). Failure to pay premiums results in policy lapse.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-iul', 'mod-product-fe', 'mod-product-annuity'],
    relatedTerms: ['term-face-amount', 'term-lapse'],
    examples: [
      {
        context: 'Explaining payment',
        usage: 'The monthly premium for this coverage would be $65, which remains level for the entire 20-year term.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Always verify premium fits client budget. Document affordability assessment.'
  },
  {
    id: 'term-beneficiary',
    term: 'Beneficiary',
    shortDefinition: 'The person or entity designated to receive the death benefit.',
    fullDefinition: 'A beneficiary is the person, people, or organization named to receive the death benefit proceeds when the insured dies. Primary beneficiaries receive proceeds first; contingent beneficiaries receive proceeds if primary beneficiaries are deceased or cannot be located. Beneficiaries can be changed at any time unless the designation is irrevocable.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-compliance-intro'],
    relatedTerms: ['term-death-benefit', 'term-insured'],
    examples: [
      {
        context: 'Application discussion',
        usage: 'You can name your spouse as primary beneficiary and your children as contingent beneficiaries.'
      }
    ],
    complianceImportance: 'important',
    complianceNote: 'Ensure beneficiary designations are clear and up to date. Never give tax or legal advice about beneficiaries.'
  },
  {
    id: 'term-living-benefit',
    term: 'Living Benefits',
    shortDefinition: 'Ability to access death benefit while still alive under certain conditions.',
    fullDefinition: 'Living benefits, also called accelerated death benefits, allow policyholders to access a portion of their death benefit while still alive if diagnosed with a qualifying condition such as terminal illness, chronic illness, or critical illness. The amount accessed is deducted from the death benefit. These riders are often included at no additional premium cost.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-iul'],
    relatedTerms: ['term-death-benefit', 'term-rider'],
    examples: [
      {
        context: 'Feature explanation',
        usage: 'If you\'re diagnosed with a terminal illness, you can access up to 75% of your death benefit to use for any purpose—medical bills, final wishes, or family support.'
      }
    ],
    complianceImportance: 'important',
    complianceNote: 'Clearly explain that accessing living benefits reduces the death benefit. Explain qualification requirements.'
  },
  {
    id: 'term-rider',
    term: 'Rider',
    shortDefinition: 'An add-on provision that modifies or adds benefits to a policy.',
    fullDefinition: 'A rider is an additional provision attached to a base insurance policy that either modifies the policy\'s terms or adds coverage. Common riders include accidental death benefit, waiver of premium, child term rider, and living benefit riders. Some riders are included at no cost; others require additional premium.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-iul'],
    relatedTerms: ['term-living-benefit', 'term-waiver-of-premium'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-waiver-of-premium',
    term: 'Waiver of Premium',
    shortDefinition: 'Rider that waives premiums if the insured becomes disabled.',
    fullDefinition: 'A waiver of premium rider provides that if the insured becomes totally disabled as defined by the policy, the insurance company will waive (not require payment of) premiums while the disability continues. The policy remains in force without premium payment during this period. Definitions of disability and waiting periods vary by carrier.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-iul'],
    relatedTerms: ['term-rider', 'term-premium'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-cash-value',
    term: 'Cash Value',
    shortDefinition: 'The savings component that accumulates in permanent life insurance.',
    fullDefinition: 'Cash value is the savings or investment component of permanent life insurance policies (whole life, universal life, IUL). A portion of premium payments goes toward building this cash value, which grows tax-deferred. Policyholders can access cash value through loans or withdrawals, though this may reduce the death benefit and could have tax implications if the policy lapses.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-policy-loan', 'term-surrender-value'],
    examples: [
      {
        context: 'IUL explanation',
        usage: 'Your policy builds cash value over time based on index performance, which you can access for retirement income or emergencies.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Cash value growth is not guaranteed in IUL. Always show guaranteed and non-guaranteed values.',
    commonMistakes: [
      'Treating cash value as a guaranteed savings account',
      'Not explaining how loans/withdrawals affect death benefit'
    ]
  },
  {
    id: 'term-policy-loan',
    term: 'Policy Loan',
    shortDefinition: 'A loan taken against the cash value of a permanent life insurance policy.',
    fullDefinition: 'A policy loan allows the policyholder to borrow against the accumulated cash value of a permanent life insurance policy. Interest is charged on the loan, and unpaid loans with interest are deducted from the death benefit. If the loan balance exceeds the cash value, the policy may lapse, potentially creating taxable income.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-cash-value', 'term-lapse'],
    complianceImportance: 'critical',
    complianceNote: 'Must explain that loans reduce death benefit and can cause policy lapse if not managed properly.'
  },
  {
    id: 'term-surrender-value',
    term: 'Surrender Value',
    shortDefinition: 'The cash amount available if a policy is cancelled.',
    fullDefinition: 'The surrender value, also called cash surrender value, is the amount the policyholder receives if they terminate (surrender) a permanent life insurance policy before death or maturity. This amount equals the cash value minus any surrender charges and outstanding policy loans. Surrender charges typically decrease over time.',
    category: 'product',
    usedInModules: ['mod-product-iul', 'mod-product-annuity'],
    relatedTerms: ['term-cash-value', 'term-surrender-charge'],
    complianceImportance: 'important'
  },
  {
    id: 'term-surrender-charge',
    term: 'Surrender Charge',
    shortDefinition: 'Fee charged for early termination of a policy or annuity.',
    fullDefinition: 'Surrender charges are fees deducted when a policyholder or annuity owner surrenders (cancels) their contract during the surrender charge period. These charges compensate the insurer for acquisition costs and typically decrease each year until they reach zero. Common surrender periods range from 5 to 15 years.',
    category: 'product',
    usedInModules: ['mod-product-iul', 'mod-product-annuity'],
    relatedTerms: ['term-surrender-value', 'term-surrender-period'],
    examples: [
      {
        context: 'Annuity explanation',
        usage: 'This annuity has a 10-year surrender period. If you withdraw more than 10% per year during this time, surrender charges apply, starting at 10% in year one and decreasing to 0% by year eleven.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Surrender charges must be clearly disclosed before sale. Document client understanding.',
    commonMistakes: [
      'Not emphasizing how long the surrender period lasts',
      'Minimizing impact of surrender charges in conversation'
    ]
  },
  {
    id: 'term-index-crediting',
    term: 'Index Crediting',
    shortDefinition: 'Method of calculating interest based on market index performance.',
    fullDefinition: 'Index crediting is the mechanism by which fixed indexed annuities (FIA) and indexed universal life (IUL) policies determine the interest credited to the contract. The credited rate is based on the performance of a market index (like the S&P 500) but is subject to caps, participation rates, and spreads. The principal is protected from market losses.',
    category: 'product',
    usedInModules: ['mod-product-iul', 'mod-product-annuity'],
    relatedTerms: ['term-cap-rate', 'term-participation-rate', 'term-floor'],
    complianceImportance: 'critical',
    complianceNote: 'Must explain that client is NOT directly invested in the index. Past index performance does not predict future results.'
  },
  {
    id: 'term-spread',
    term: 'Spread',
    shortDefinition: 'A percentage deducted from index gains before crediting interest.',
    fullDefinition: 'In indexed products, the spread (also called margin or asset fee) is a percentage deducted from the index return before calculating the interest credit. For example, if the index gains 8% and the spread is 2%, the calculation starts at 6%. Some indexed accounts use spreads instead of or in combination with caps.',
    category: 'product',
    usedInModules: ['mod-product-iul', 'mod-product-annuity'],
    relatedTerms: ['term-cap-rate', 'term-participation-rate', 'term-index-crediting'],
    complianceImportance: 'important'
  },
  {
    id: 'term-accumulation-value',
    term: 'Accumulation Value',
    shortDefinition: 'The total value accumulated in an annuity contract.',
    fullDefinition: 'The accumulation value is the current total value of an annuity contract, including all premiums paid, interest credited, and any bonuses, minus withdrawals and fees. This value is used to determine the amount available for annuitization or withdrawal (subject to surrender charges if applicable).',
    category: 'product',
    usedInModules: ['mod-product-annuity'],
    relatedTerms: ['term-surrender-value', 'term-income-rider'],
    complianceImportance: 'important'
  },
  {
    id: 'term-income-rider',
    term: 'Income Rider',
    shortDefinition: 'Optional benefit providing guaranteed lifetime withdrawal income.',
    fullDefinition: 'An income rider, also called a guaranteed lifetime withdrawal benefit (GLWB), is an optional add-on to an annuity that guarantees a minimum income stream for life regardless of account performance. The rider tracks a separate "benefit base" for income calculation purposes. Income riders typically have an annual fee.',
    category: 'product',
    usedInModules: ['mod-product-annuity'],
    relatedTerms: ['term-accumulation-value', 'term-benefit-base'],
    examples: [
      {
        context: 'Retirement income discussion',
        usage: 'With the income rider, you\'re guaranteed 5% of your benefit base annually for life, even if the account value drops to zero.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Must clearly explain that income base is different from accumulation value. Explain rider fee.',
    commonMistakes: [
      'Confusing benefit base with account value',
      'Not explaining that income payments reduce account value'
    ]
  },
  {
    id: 'term-annuitization',
    term: 'Annuitization',
    shortDefinition: 'Converting an annuity into a stream of periodic payments.',
    fullDefinition: 'Annuitization is the process of converting an annuity\'s accumulated value into a series of periodic income payments. Once annuitized, the contract value is exchanged for guaranteed payments for a specified period or for life. Annuitization is typically irrevocable—the owner gives up access to the lump sum in exchange for guaranteed income.',
    category: 'product',
    usedInModules: ['mod-product-annuity'],
    relatedTerms: ['term-accumulation-value', 'term-income-rider'],
    complianceImportance: 'critical',
    complianceNote: 'Explain that annuitization is typically irreversible. Client loses access to lump sum.'
  },

  // COMPLIANCE TERMS
  {
    id: 'term-twisting',
    term: 'Twisting',
    shortDefinition: 'Misrepresenting existing coverage to induce replacement.',
    fullDefinition: 'Twisting is the illegal practice of misrepresenting the terms or benefits of an existing insurance policy to convince a policyholder to surrender it and purchase a new policy. This is a serious compliance violation that can result in license revocation, fines, and criminal charges.',
    category: 'compliance',
    usedInModules: ['mod-compliance-intro', 'mod-disclosure'],
    relatedTerms: ['term-replacement', 'term-churning'],
    complianceImportance: 'critical',
    complianceNote: 'Never disparage or misrepresent a client\'s existing coverage. Always provide accurate comparisons.'
  },
  {
    id: 'term-churning',
    term: 'Churning',
    shortDefinition: 'Excessive replacement of policies primarily to generate commissions.',
    fullDefinition: 'Churning, also called sliding, occurs when an agent convinces clients to repeatedly replace insurance policies primarily to generate commission income rather than for the client\'s benefit. This practice is illegal, unethical, and harmful to clients who may face new surrender charges, contestability periods, and commission costs.',
    category: 'compliance',
    usedInModules: ['mod-compliance-intro', 'mod-disclosure'],
    relatedTerms: ['term-twisting', 'term-replacement'],
    complianceImportance: 'critical',
    complianceNote: 'Every replacement must be documented as being in the client\'s best interest.'
  },
  {
    id: 'term-misrepresentation',
    term: 'Misrepresentation',
    shortDefinition: 'False or misleading statements about insurance products or coverage.',
    fullDefinition: 'Misrepresentation occurs when an agent makes false, deceptive, or misleading statements about an insurance policy, its benefits, terms, dividends, or the financial condition of the insurer. This includes oral statements, written materials, and illustrations. Misrepresentation is grounds for policy rescission, license revocation, and legal action.',
    category: 'compliance',
    usedInModules: ['mod-compliance-intro', 'mod-disclosure'],
    relatedTerms: ['term-illustration', 'term-disclosure'],
    examples: [
      {
        context: 'Prohibited behavior',
        usage: 'Telling a client that illustrated values are "guaranteed" when they are projections is misrepresentation.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Always distinguish between guaranteed and non-guaranteed elements. Never exaggerate benefits.'
  },
  {
    id: 'term-disclosure',
    term: 'Disclosure',
    shortDefinition: 'Required communication of material product information to clients.',
    fullDefinition: 'Disclosure refers to the legal and ethical requirement to provide clients with complete, accurate information about insurance products before purchase. This includes policy features, limitations, costs, risks, and surrender charges. Proper disclosure protects both the client and the advisor by ensuring informed decision-making.',
    category: 'compliance',
    usedInModules: ['mod-disclosure', 'mod-compliance-intro'],
    relatedTerms: ['term-illustration', 'term-buyer-guide'],
    complianceImportance: 'critical'
  },
  {
    id: 'term-illustration',
    term: 'Illustration',
    shortDefinition: 'Projection of policy values under various assumptions.',
    fullDefinition: 'An illustration is a document that projects future policy values, including premiums, death benefits, and cash values, based on stated assumptions. Illustrations must show both guaranteed values and non-guaranteed (current) values. They are educational tools, not predictions or guarantees of performance.',
    category: 'compliance',
    usedInModules: ['mod-product-iul', 'mod-disclosure'],
    relatedTerms: ['term-guaranteed-values', 'term-non-guaranteed'],
    examples: [
      {
        context: 'Proper usage',
        usage: 'Let me walk you through this illustration. The left column shows guaranteed values, which assume the minimum interest rate. The right column shows projected values at the current rate, which is not guaranteed.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Always explain that illustrations are projections, not guarantees. Review both guaranteed and non-guaranteed columns.',
    commonMistakes: [
      'Only showing non-guaranteed values',
      'Implying illustrated values are guaranteed',
      'Using aggressive assumptions to make product look better'
    ]
  },
  {
    id: 'term-buyer-guide',
    term: 'Buyer\'s Guide',
    shortDefinition: 'Standardized document explaining insurance concepts and consumer rights.',
    fullDefinition: 'A buyer\'s guide is a standardized educational document required by regulators that explains basic insurance concepts, policy types, and consumer rights. For life insurance and annuities, buyer\'s guides must be provided at or before the time of application. They help consumers make informed decisions.',
    category: 'compliance',
    usedInModules: ['mod-disclosure', 'mod-compliance-intro'],
    relatedTerms: ['term-disclosure', 'term-free-look'],
    complianceImportance: 'critical',
    complianceNote: 'Buyer\'s guide delivery must be documented. Never skip or rush through this requirement.'
  },
  {
    id: 'term-best-interest',
    term: 'Best Interest Standard',
    shortDefinition: 'Requirement to act in the client\'s best interest when making recommendations.',
    fullDefinition: 'The best interest standard requires that when making insurance recommendations, advisors must act in the consumer\'s best interest without placing their own financial interest ahead of the consumer. This includes proper needs analysis, fair disclosure, and recommending only suitable products. Many states have adopted best interest requirements for annuity sales.',
    category: 'compliance',
    usedInModules: ['mod-suitability-defense', 'mod-compliance-intro'],
    relatedTerms: ['term-suitability', 'term-fiduciary'],
    complianceImportance: 'critical',
    complianceNote: 'Best interest goes beyond suitability. Must document why recommendation is in client\'s BEST interest.'
  },
  {
    id: 'term-contestability',
    term: 'Contestability Period',
    shortDefinition: 'Initial period when insurer can investigate and deny claims.',
    fullDefinition: 'The contestability period, typically the first two years after policy issue, is when an insurance company can investigate claims and potentially deny or rescind coverage based on material misrepresentation on the application. After this period, the insurer\'s ability to contest claims is significantly limited.',
    category: 'compliance',
    usedInModules: ['mod-product-term', 'mod-disclosure'],
    relatedTerms: ['term-incontestability', 'term-misrepresentation'],
    complianceImportance: 'important',
    complianceNote: 'Explain to clients the importance of accurate application information.'
  },
  {
    id: 'term-do-not-call',
    term: 'Do Not Call List',
    shortDefinition: 'Registry of consumers who have opted out of telemarketing calls.',
    fullDefinition: 'The National Do Not Call Registry, managed by the FTC, allows consumers to opt out of receiving telemarketing calls. Calling someone on the DNC list without permission is a federal violation with significant penalties. There are limited exceptions for existing business relationships and express written consent.',
    category: 'regulatory',
    usedInModules: ['mod-compliance-intro'],
    relatedTerms: ['term-tcpa'],
    complianceImportance: 'critical',
    complianceNote: 'Always verify DNC status before calling. Honor client requests to stop calling immediately.'
  },

  // UNDERWRITING TERMS
  {
    id: 'term-underwriting',
    term: 'Underwriting',
    shortDefinition: 'The process of evaluating risk and determining policy terms.',
    fullDefinition: 'Underwriting is the process by which an insurance company evaluates the risk of insuring an applicant and determines the terms under which coverage will be offered, including premium rates. This may involve reviewing medical history, lab results, prescription drug history, driving records, and other factors.',
    category: 'underwriting',
    usedInModules: ['mod-product-term', 'mod-product-iul'],
    relatedTerms: ['term-medical-exam', 'term-rate-class'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-rate-class',
    term: 'Rate Class',
    shortDefinition: 'Category that determines premium pricing based on risk factors.',
    fullDefinition: 'Rate classes (also called risk classes) are categories into which insurers group applicants based on health, lifestyle, and other risk factors. Common classes include Preferred Plus (best rates), Preferred, Standard Plus, Standard, and Substandard (table ratings). Smokers have separate, higher-priced categories.',
    category: 'underwriting',
    usedInModules: ['mod-product-term'],
    relatedTerms: ['term-underwriting', 'term-table-rating'],
    examples: [
      {
        context: 'Setting expectations',
        usage: 'Based on what you\'ve shared about your health, you would likely qualify for Preferred rates, which would make your monthly premium approximately $65.'
      }
    ],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-table-rating',
    term: 'Table Rating',
    shortDefinition: 'Substandard rating that increases premium above standard rates.',
    fullDefinition: 'A table rating (also called substandard rating) is applied when an applicant\'s health or lifestyle doesn\'t qualify for standard rates. Table ratings add a percentage to the base premium—typically 25% per table (Table A/1 = +25%, Table B/2 = +50%, etc.). Table ratings allow coverage for higher-risk individuals.',
    category: 'underwriting',
    usedInModules: ['mod-product-term'],
    relatedTerms: ['term-rate-class', 'term-underwriting'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-medical-exam',
    term: 'Medical Exam',
    shortDefinition: 'Health examination required for certain life insurance applications.',
    fullDefinition: 'A medical exam, also called a paramed exam, is a health examination required by insurers for many life insurance applications. It typically includes height, weight, blood pressure, blood and urine samples, and health history questions. Results are used for underwriting. Many carriers now offer accelerated or simplified issue options that skip the exam for qualified applicants.',
    category: 'underwriting',
    usedInModules: ['mod-product-term', 'mod-product-iul'],
    relatedTerms: ['term-underwriting', 'term-accelerated-uw'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-accelerated-uw',
    term: 'Accelerated Underwriting',
    shortDefinition: 'Fast-track underwriting that may skip the medical exam.',
    fullDefinition: 'Accelerated underwriting uses algorithms, data sources, and predictive analytics to evaluate applicants quickly, often in minutes or days rather than weeks. Qualified applicants may be approved without a medical exam. This approach typically has face amount limits and health qualification requirements.',
    category: 'underwriting',
    usedInModules: ['mod-product-term'],
    relatedTerms: ['term-medical-exam', 'term-simplified-issue'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-simplified-issue',
    term: 'Simplified Issue',
    shortDefinition: 'Application process with health questions but no medical exam.',
    fullDefinition: 'Simplified issue products require applicants to answer health questions but do not require a medical exam. Coverage is typically issued within days based on the answers provided. These products often have lower face amount limits and may cost more than fully underwritten coverage for healthy applicants.',
    category: 'underwriting',
    usedInModules: ['mod-product-fe', 'mod-product-term'],
    relatedTerms: ['term-accelerated-uw', 'term-guaranteed-issue'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-guaranteed-issue',
    term: 'Guaranteed Issue',
    shortDefinition: 'Coverage issued without health questions or exam.',
    fullDefinition: 'Guaranteed issue products accept all applicants regardless of health status—no health questions, no medical exam, no possibility of decline. However, these products typically have graded death benefits (reduced payout in early years), lower face amounts, and higher premiums to account for the increased risk.',
    category: 'underwriting',
    usedInModules: ['mod-product-fe'],
    relatedTerms: ['term-simplified-issue', 'term-graded-benefit'],
    examples: [
      {
        context: 'Product explanation',
        usage: 'Guaranteed issue means you cannot be turned down, but the policy has a graded benefit—if you pass away in the first two years, your beneficiary receives a return of premiums plus interest rather than the full death benefit.'
      }
    ],
    complianceImportance: 'critical',
    complianceNote: 'Must clearly explain graded benefit limitations with guaranteed issue products.'
  },
  {
    id: 'term-graded-benefit',
    term: 'Graded Benefit',
    shortDefinition: 'Reduced death benefit during initial policy years.',
    fullDefinition: 'A graded benefit (also called graduated benefit) is a death benefit structure where the full face amount is not paid if death occurs in the first 2-3 years of the policy. Instead, beneficiaries receive a return of premiums paid (sometimes with interest). Full death benefit applies after the grading period. This structure allows coverage for high-risk applicants.',
    category: 'underwriting',
    usedInModules: ['mod-product-fe'],
    relatedTerms: ['term-guaranteed-issue'],
    complianceImportance: 'critical',
    complianceNote: 'Must clearly disclose graded benefit period and what beneficiaries would receive during that time.'
  },

  // FINANCIAL TERMS
  {
    id: 'term-tax-deferred',
    term: 'Tax-Deferred',
    shortDefinition: 'Growth that is not taxed until funds are withdrawn.',
    fullDefinition: 'Tax-deferred means that earnings on an investment or savings vehicle are not subject to income tax until the money is withdrawn. Cash value in life insurance and accumulation in annuities grow tax-deferred. This allows for compound growth without annual tax drag. Taxes are due when money is withdrawn or the policy is surrendered.',
    category: 'financial',
    usedInModules: ['mod-product-iul', 'mod-product-annuity'],
    relatedTerms: ['term-cash-value', 'term-accumulation-value'],
    complianceImportance: 'important',
    complianceNote: 'Do not give tax advice. Recommend clients consult their tax advisor for specific situations.'
  },
  {
    id: 'term-1035-exchange',
    term: '1035 Exchange',
    shortDefinition: 'Tax-free transfer from one insurance product to another.',
    fullDefinition: 'A 1035 exchange, named after the IRS code section, allows the tax-free transfer of cash value from one life insurance policy or annuity to another of like kind. This preserves the tax basis and avoids immediate taxation. Strict requirements apply—the owner and insured must remain the same.',
    category: 'financial',
    usedInModules: ['mod-product-iul', 'mod-product-annuity', 'mod-disclosure'],
    relatedTerms: ['term-replacement', 'term-tax-deferred'],
    complianceImportance: 'critical',
    complianceNote: 'Do not provide tax advice. Recommend clients consult their tax advisor. 1035 exchanges involve replacement regulations.'
  },

  // COMPANY TERMS
  {
    id: 'term-imo',
    term: 'IMO',
    shortDefinition: 'Insurance Marketing Organization - distributor of insurance products.',
    fullDefinition: 'An Insurance Marketing Organization (IMO) is an independent distributor that contracts with insurance carriers to market and distribute their products through licensed agents. IMOs provide agents with carrier access, training, marketing support, and back-office services. Gold Coast Financial operates as an IMO.',
    category: 'company',
    usedInModules: ['mod-welcome', 'mod-role'],
    relatedTerms: ['term-carrier', 'term-appointment'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-carrier',
    term: 'Carrier',
    shortDefinition: 'Insurance company that issues and backs policies.',
    fullDefinition: 'The carrier (also called insurance company or insurer) is the company that issues insurance policies and is responsible for paying claims. Carriers are regulated by state insurance departments and must maintain sufficient reserves to pay claims. Agents must be appointed with each carrier to sell their products.',
    category: 'company',
    usedInModules: ['mod-business-setup', 'mod-product-term'],
    relatedTerms: ['term-appointment', 'term-imo'],
    complianceImportance: 'helpful'
  },
  {
    id: 'term-appointment',
    term: 'Appointment',
    shortDefinition: 'Authorization from a carrier to sell their products.',
    fullDefinition: 'An appointment is the authorization granted by an insurance carrier to an agent, allowing that agent to sell the carrier\'s products. Appointments require contracting paperwork, background checks, and often product training. Agents must be both licensed in the state and appointed with the carrier to sell products.',
    category: 'company',
    usedInModules: ['mod-business-setup'],
    relatedTerms: ['term-carrier', 'term-imo'],
    complianceImportance: 'important',
    complianceNote: 'Cannot sell products until appointment is active. Verify appointment status before taking applications.'
  },
  {
    id: 'term-eo-insurance',
    term: 'E&O Insurance',
    shortDefinition: 'Errors and Omissions insurance protecting against professional liability.',
    fullDefinition: 'Errors and Omissions (E&O) insurance, also called professional liability insurance, protects insurance agents and agencies from claims arising from mistakes, oversights, or negligence in their professional services. Most carriers and IMOs require agents to maintain E&O coverage.',
    category: 'company',
    usedInModules: ['mod-business-setup'],
    relatedTerms: ['term-appointment'],
    complianceImportance: 'important'
  },
  {
    id: 'term-mec',
    term: 'MEC (Modified Endowment Contract)',
    shortDefinition: 'A life insurance policy that has been over-funded beyond IRS limits.',
    fullDefinition: 'A Modified Endowment Contract (MEC) is a life insurance policy that has received more premium payments than allowed under IRS guidelines (the 7-pay test). While still providing a tax-free death benefit, MECs lose favorable tax treatment on withdrawals and loans - distributions are taxed on a last-in-first-out basis and may incur a 10% penalty if taken before age 59½.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-cash-value', 'term-policy-loan'],
    complianceImportance: 'critical'
  },
  {
    id: 'term-coi',
    term: 'COI (Cost of Insurance)',
    shortDefinition: 'The actual cost of the death benefit protection within a permanent policy.',
    fullDefinition: 'Cost of Insurance (COI) is the monthly charge deducted from a permanent life insurance policy\'s cash value to pay for the pure death benefit protection. COI increases with age and is based on the insured\'s risk classification. Understanding COI is essential when illustrating IUL policies as it directly impacts long-term policy performance.',
    category: 'product',
    usedInModules: ['mod-product-iul'],
    relatedTerms: ['term-cash-value', 'term-death-benefit'],
    complianceImportance: 'important'
  },
  {
    id: 'term-suitability',
    term: 'Suitability',
    shortDefinition: 'Requirement that recommended products match client needs and circumstances.',
    fullDefinition: 'Suitability is a regulatory standard requiring that insurance recommendations be appropriate for the client\'s financial situation, needs, objectives, and risk tolerance. Agents must gather sufficient information to make suitable recommendations and document the basis for their recommendations. Suitability violations can result in regulatory action, carrier termination, and legal liability.',
    category: 'compliance',
    usedInModules: ['mod-suitability-defense', 'mod-disclosure'],
    relatedTerms: ['term-best-interest', 'term-disclosure'],
    complianceImportance: 'critical'
  },
  {
    id: 'term-needs-analysis',
    term: 'Needs Analysis',
    shortDefinition: 'Process of determining a client\'s insurance and financial requirements.',
    fullDefinition: 'A needs analysis is the systematic process of gathering information about a client\'s financial situation, goals, concerns, and existing coverage to determine appropriate insurance solutions. A thorough needs analysis includes income, debts, dependents, existing coverage, health status, and long-term objectives. This forms the foundation for making suitable product recommendations.',
    category: 'sales',
    usedInModules: ['mod-client-needs', 'mod-call-framework'],
    relatedTerms: ['term-suitability', 'term-disclosure'],
    complianceImportance: 'important'
  },
  {
    id: 'term-replacement',
    term: 'Replacement',
    shortDefinition: 'Purchasing new insurance to substitute for existing coverage.',
    fullDefinition: 'Replacement occurs when a client surrenders, lapses, or reduces existing insurance to purchase new coverage. Replacements are heavily regulated because they can disadvantage clients through new contestability periods, surrender charges, or loss of favorable policy provisions. Most states require specific disclosure forms and comparison documents when a replacement is involved.',
    category: 'compliance',
    usedInModules: ['mod-disclosure', 'mod-suitability-defense'],
    relatedTerms: ['term-twisting', 'term-churning', 'term-disclosure'],
    complianceImportance: 'critical'
  },
  {
    id: 'term-free-look',
    term: 'Free Look Period',
    shortDefinition: 'Time after policy delivery when client can cancel for full refund.',
    fullDefinition: 'The free look period is a mandatory window (typically 10-30 days depending on state and product type) after policy delivery during which the client can examine the policy and cancel for a full refund of premiums paid. This consumer protection allows clients to verify the policy matches what was presented and ensures they understand the coverage they purchased.',
    category: 'regulatory',
    usedInModules: ['mod-disclosure'],
    relatedTerms: ['term-buyer-guide', 'term-disclosure'],
    complianceImportance: 'important'
  },
  {
    id: 'term-exclusions',
    term: 'Exclusions',
    shortDefinition: 'Specific circumstances or conditions not covered by a policy.',
    fullDefinition: 'Exclusions are provisions in an insurance policy that eliminate coverage for specific risks, circumstances, or causes of loss. Common life insurance exclusions include suicide within the first two years, death while committing a felony, and certain hazardous activities. Agents must clearly disclose exclusions to clients to avoid misunderstandings about coverage.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-disclosure'],
    relatedTerms: ['term-rider', 'term-contestability'],
    complianceImportance: 'important'
  },
  {
    id: 'term-incontestable',
    term: 'Incontestable Clause',
    shortDefinition: 'Provision limiting insurer\'s ability to deny claims after a set period.',
    fullDefinition: 'The incontestable clause is a standard policy provision stating that after a policy has been in force for a specified period (usually two years), the insurer cannot contest or void the policy based on misstatements in the application, except for non-payment of premium. This protects beneficiaries from claim denials based on old application errors.',
    category: 'product',
    usedInModules: ['mod-product-term', 'mod-product-fe'],
    relatedTerms: ['term-contestability', 'term-misrepresentation'],
    complianceImportance: 'important'
  },
  {
    id: 'term-convertibility',
    term: 'Convertibility',
    shortDefinition: 'Option to change term insurance to permanent coverage without new underwriting.',
    fullDefinition: 'Convertibility is a valuable feature of term life insurance that allows the policyholder to convert to a permanent policy (whole life or universal life) without proving insurability. This is particularly valuable if the insured\'s health deteriorates during the term period. Conversion deadlines and available products vary by carrier.',
    category: 'product',
    usedInModules: ['mod-product-term'],
    relatedTerms: ['term-rider', 'term-underwriting'],
    complianceImportance: 'standard'
  },
  {
    id: 'term-level-term',
    term: 'Level Term',
    shortDefinition: 'Term insurance with premiums that stay the same throughout the term.',
    fullDefinition: 'Level term life insurance provides coverage for a specific period (10, 15, 20, 25, or 30 years) with premiums that remain constant for the entire term. This predictability makes budgeting easier for clients. At the end of the term, the policy either expires, renews at significantly higher rates, or may be converted to permanent coverage.',
    category: 'product',
    usedInModules: ['mod-product-term'],
    relatedTerms: ['term-premium', 'term-convertibility'],
    complianceImportance: 'standard'
  },
  {
    id: 'term-annuity-owner',
    term: 'Annuity Owner',
    shortDefinition: 'The person who owns and controls the annuity contract.',
    fullDefinition: 'The annuity owner is the person or entity that holds the annuity contract, makes contributions, and has the right to make withdrawals, change beneficiaries, and surrender the contract. The owner is typically also the annuitant (the person whose life determines certain contract benefits), but they can be different individuals in some situations.',
    category: 'product',
    usedInModules: ['mod-product-annuity'],
    relatedTerms: ['term-annuitization', 'term-beneficiary'],
    complianceImportance: 'standard'
  },
  {
    id: 'term-participation-rate',
    term: 'Participation Rate',
    shortDefinition: 'Percentage of index gain credited to a fixed indexed product.',
    fullDefinition: 'The participation rate determines what percentage of an index\'s gain is credited to a fixed indexed annuity or IUL policy. For example, with a 70% participation rate, if the index gains 10%, the policy would be credited 7%. Participation rates can change annually and vary by crediting strategy. Understanding this is crucial when illustrating indexed products.',
    category: 'product',
    usedInModules: ['mod-product-iul', 'mod-product-annuity'],
    relatedTerms: ['term-index-crediting', 'term-spread'],
    complianceImportance: 'important'
  }
];

// ============================================================================
// QUICK REFERENCE CARDS - ALL PRODUCT TYPES
// ============================================================================

export const QUICK_REFERENCE_CARDS_DATA: QuickReferenceCard[] = [
  // ---------------------------------------------------------------------------
  // TERM LIFE INSURANCE QUICK REFERENCE
  // ---------------------------------------------------------------------------
  {
    id: 'qrc-term-life',
    title: 'Term Life Insurance',
    subtitle: 'Product Quick Reference',
    description: 'Essential information about term life insurance products, features, and client profiles.',
    sections: [
      {
        title: 'Product Overview',
        items: [
          { label: 'What It Is', value: 'Temporary life insurance for a specific period (10-40 years)', icon: 'shield' },
          { label: 'Death Benefit', value: 'Level face amount paid tax-free to beneficiaries', icon: 'dollar' },
          { label: 'Premiums', value: 'Level for the term period, guaranteed not to increase', icon: 'lock' },
          { label: 'Cash Value', value: 'None - pure protection product', icon: 'x-circle' }
        ]
      },
      {
        title: 'Ideal Client Profile',
        items: [
          { label: 'Age Range', value: 'Typically 25-60 (varies by carrier)', icon: 'users' },
          { label: 'Primary Need', value: 'Income replacement, mortgage protection, education funding', icon: 'target', isHighlighted: true },
          { label: 'Time Horizon', value: 'Specific protection need (until retirement, kids independent, mortgage paid)', icon: 'clock' },
          { label: 'Budget', value: 'Maximum coverage at lowest cost is priority', icon: 'trending-down' }
        ]
      },
      {
        title: 'Key Features to Highlight',
        items: [
          { label: 'Living Benefits', value: 'Access to death benefit for terminal/chronic illness (most carriers)', icon: 'heart', isHighlighted: true },
          { label: 'Conversion Option', value: 'Convert to permanent coverage without new underwriting', icon: 'refresh', isHighlighted: true },
          { label: 'Renewability', value: 'Can renew at higher premium after term ends', icon: 'repeat' }
        ]
      },
      {
        title: 'Coverage Calculation',
        items: [
          { label: 'Income Replacement', value: '10x annual income is common starting point', icon: 'calculator' },
          { label: 'Debt Coverage', value: 'Add mortgage + other debts', icon: 'home' },
          { label: 'Education Funding', value: 'Add $80K-$150K per child for college', icon: 'graduation-cap' },
          { label: 'Final Expenses', value: 'Add $15K-$30K for burial/estate costs', icon: 'file-text' }
        ]
      }
    ],
    doList: [
      'Match term length to protection need (mortgage payoff, kids\' independence)',
      'Explain what happens after term ends (expires or renews at much higher cost)',
      'Highlight living benefits and conversion options',
      'Document why term is appropriate vs. permanent insurance',
      'Discuss spouse coverage if applicable'
    ],
    dontList: [
      'Recommend term lengths that don\'t align with documented needs',
      'Skip disclosure that coverage expires with no value if client outlives term',
      'Forget to mention conversion window limitations',
      'Sell more coverage than client can sustainably afford'
    ],
    keyReminders: [
      'Term insurance is about protection, not investment',
      'Right amount of coverage + affordability = sustainable protection',
      'Coverage that lapses for non-payment helps no one'
    ],
    complianceWarnings: [
      'Never guarantee issue or rate class before underwriting completes',
      'Document suitability: why term, why this amount, why this term length'
    ],
    moduleId: 'mod-product-term',
    moduleName: 'Term Life Insurance Deep Dive',
    downloadable: true,
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // IUL QUICK REFERENCE
  // ---------------------------------------------------------------------------
  {
    id: 'qrc-iul',
    title: 'Indexed Universal Life (IUL)',
    subtitle: 'Product Quick Reference',
    description: 'Essential information about IUL products, features, compliance requirements, and client profiles.',
    sections: [
      {
        title: 'Product Overview',
        items: [
          { label: 'What It Is', value: 'Permanent life insurance with cash value linked to market index performance', icon: 'shield' },
          { label: 'Death Benefit', value: 'Flexible - level or increasing, adjustable over time', icon: 'dollar' },
          { label: 'Premiums', value: 'Flexible within limits - can adjust based on needs', icon: 'sliders' },
          { label: 'Cash Value', value: 'Grows tax-deferred based on index performance with floor protection', icon: 'trending-up', isHighlighted: true }
        ]
      },
      {
        title: 'How Index Crediting Works',
        items: [
          { label: 'Index Options', value: 'S&P 500, other indices - client not directly invested', icon: 'bar-chart', isHighlighted: true },
          { label: 'Cap Rate', value: 'Maximum credit (e.g., 10%) - CAN CHANGE', icon: 'arrow-up' },
          { label: 'Floor', value: 'Minimum credit (typically 0%) - protects from negative returns', icon: 'arrow-down' },
          { label: 'Participation Rate', value: 'Percentage of index gain credited (before cap)', icon: 'percent' }
        ]
      },
      {
        title: 'Ideal Client Profile',
        items: [
          { label: 'Age Range', value: 'Typically 30-60 for accumulation focus', icon: 'users' },
          { label: 'Primary Need', value: 'Permanent protection + supplemental retirement income', icon: 'target', isHighlighted: true },
          { label: 'Time Horizon', value: 'Long-term (15+ years for optimal cash value growth)', icon: 'clock' },
          { label: 'Risk Tolerance', value: 'Wants market participation with downside protection', icon: 'shield' }
        ]
      },
      {
        title: 'Living Benefits',
        items: [
          { label: 'Terminal Illness', value: 'Access 50-100% of death benefit if diagnosed terminal', icon: 'heart' },
          { label: 'Chronic Illness', value: 'Access death benefit if unable to perform ADLs', icon: 'activity' },
          { label: 'Critical Illness', value: 'Access upon diagnosis of specified conditions (some carriers)', icon: 'alert-circle' }
        ]
      }
    ],
    doList: [
      'Show BOTH guaranteed and non-guaranteed illustration columns',
      'Explain that cap rates, participation rates can change',
      'Clarify client is NOT directly invested in the stock market',
      'Document client understanding of non-guaranteed elements',
      'Explain how loans/withdrawals affect death benefit',
      'Discuss policy charges and their impact'
    ],
    dontList: [
      'Project future performance as if guaranteed',
      'Only show non-guaranteed illustration values',
      'Compare to direct stock market investment',
      'Minimize importance of policy charges',
      'Guarantee any rate of return'
    ],
    keyReminders: [
      'IUL is life insurance FIRST, accumulation second',
      'Policy must be properly funded to perform as illustrated',
      'Loans can cause policy lapse if not managed'
    ],
    complianceWarnings: [
      'Illustrations are NOT predictions - document client understanding',
      'Cap rates and participation rates are NOT guaranteed',
      'Policy charges reduce cash value growth',
      'Living benefit access reduces death benefit'
    ],
    moduleId: 'mod-product-iul',
    moduleName: 'Indexed Universal Life (IUL) Fundamentals',
    downloadable: true,
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // FINAL EXPENSE QUICK REFERENCE
  // ---------------------------------------------------------------------------
  {
    id: 'qrc-final-expense',
    title: 'Final Expense Insurance',
    subtitle: 'Product Quick Reference',
    description: 'Essential information about final expense products for the senior market.',
    sections: [
      {
        title: 'Product Overview',
        items: [
          { label: 'What It Is', value: 'Simplified issue whole life designed for burial/final expenses', icon: 'shield' },
          { label: 'Face Amounts', value: 'Typically $5,000 - $50,000', icon: 'dollar' },
          { label: 'Underwriting', value: 'Simplified issue (health questions, no exam) or guaranteed issue', icon: 'clipboard' },
          { label: 'Cash Value', value: 'Builds over time, available for loans/withdrawals', icon: 'piggy-bank' }
        ]
      },
      {
        title: 'Benefit Types',
        items: [
          { label: 'Level Benefit', value: 'Full death benefit from day one - healthier applicants', icon: 'check-circle', isHighlighted: true },
          { label: 'Graded Benefit', value: 'Reduced benefit in years 1-2, then full - applicants with health issues', icon: 'alert-triangle', isHighlighted: true },
          { label: 'Modified Benefit', value: 'Similar to graded, varies by carrier', icon: 'edit' }
        ]
      },
      {
        title: 'Ideal Client Profile',
        items: [
          { label: 'Age Range', value: 'Typically 50-85', icon: 'users' },
          { label: 'Primary Need', value: 'Burial costs, final expenses, small legacy', icon: 'target' },
          { label: 'Health Status', value: 'May have health conditions that prevent larger policies', icon: 'activity' },
          { label: 'Budget', value: 'Fixed income, needs affordable premium', icon: 'dollar-sign' }
        ]
      },
      {
        title: 'Cost Considerations',
        items: [
          { label: 'Average Funeral', value: '$7,000 - $12,000 (traditional burial)', icon: 'file-text' },
          { label: 'Cremation', value: '$3,000 - $7,000', icon: 'file' },
          { label: 'Other Costs', value: 'Medical bills, legal fees, outstanding debts', icon: 'list' },
          { label: 'Premium Range', value: '$30 - $150/month typical', icon: 'credit-card' }
        ]
      }
    ],
    doList: [
      'Clearly explain Level vs. Graded benefit and when each applies',
      'Verify coverage amount aligns with anticipated expenses',
      'Document why final expense vs. other coverage types',
      'Confirm premium fits fixed income budget',
      'Explain cash value and loan provisions'
    ],
    dontList: [
      'Sell graded benefit without full explanation of waiting period',
      'Recommend coverage that strains fixed income budget',
      'Skip explanation of what happens in graded benefit period',
      'Pressure seniors to buy immediately',
      'Replace existing coverage without documented benefit'
    ],
    keyReminders: [
      'Seniors need extra time and patience',
      'Verify understanding by having client explain back',
      'Family member presence is often appropriate'
    ],
    complianceWarnings: [
      'Enhanced suitability requirements for seniors',
      'Document client understanding of graded benefit if applicable',
      'Replacement of existing coverage requires additional scrutiny',
      'No pressure tactics with senior clients'
    ],
    moduleId: 'mod-product-fe',
    moduleName: 'Final Expense Insurance Mastery',
    downloadable: true,
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // FIXED INDEXED ANNUITY QUICK REFERENCE
  // ---------------------------------------------------------------------------
  {
    id: 'qrc-fia',
    title: 'Fixed Indexed Annuities',
    subtitle: 'Product Quick Reference',
    description: 'Essential information about FIA products, features, and suitability requirements.',
    sections: [
      {
        title: 'Product Overview',
        items: [
          { label: 'What It Is', value: 'Annuity with interest credited based on index performance', icon: 'trending-up' },
          { label: 'Principal Protection', value: 'Cannot lose money due to market decline (0% floor)', icon: 'shield', isHighlighted: true },
          { label: 'Surrender Period', value: 'Typically 5-10 years with declining charges', icon: 'clock' },
          { label: 'Tax Treatment', value: 'Tax-deferred growth until withdrawal', icon: 'file-text' }
        ]
      },
      {
        title: 'How Crediting Works',
        items: [
          { label: 'Index Options', value: 'S&P 500, others - NOT direct investment', icon: 'bar-chart', isHighlighted: true },
          { label: 'Cap Rate', value: 'Maximum credit per period (can change)', icon: 'arrow-up' },
          { label: 'Participation Rate', value: 'Percentage of gain credited', icon: 'percent' },
          { label: 'Floor', value: '0% minimum - protects principal', icon: 'lock' }
        ]
      },
      {
        title: 'Ideal Client Profile',
        items: [
          { label: 'Age Range', value: 'Typically 50-80, varies by product', icon: 'users' },
          { label: 'Time Horizon', value: 'Can leave money for surrender period + retirement income needs', icon: 'clock', isHighlighted: true },
          { label: 'Risk Tolerance', value: 'Conservative - wants protection with growth opportunity', icon: 'shield' },
          { label: 'Primary Need', value: 'Safe accumulation, retirement income, legacy', icon: 'target' }
        ]
      },
      {
        title: 'Income Rider Features',
        items: [
          { label: 'Guaranteed Income', value: 'Lifetime income option regardless of account value', icon: 'repeat' },
          { label: 'Income Base', value: 'Separate value used for income calculation (not cash value)', icon: 'calculator', isHighlighted: true },
          { label: 'Rider Fee', value: 'Annual charge (typically 0.95% - 1.25%)', icon: 'credit-card' }
        ]
      }
    ],
    doList: [
      'Complete full suitability analysis BEFORE recommendation',
      'Verify client can leave money for surrender period',
      'Explain that cap rates and participation rates can change',
      'Clearly distinguish accumulation value from income benefit base',
      'Document client\'s other liquid assets and income sources',
      'Provide buyer\'s guide at or before application'
    ],
    dontList: [
      'Recommend if client may need money during surrender period',
      'Project future index performance',
      'Compare directly to stock market returns',
      'Minimize surrender charges or period length',
      'Confuse income base with actual account value'
    ],
    keyReminders: [
      'Suitability is paramount - document everything',
      'This is protection + opportunity, not investment',
      'Client profile must match surrender period'
    ],
    complianceWarnings: [
      'Full suitability documentation required',
      'Surrender charges must be prominently disclosed',
      'Best interest standard applies in most states',
      'Senior protections apply (age varies by state)'
    ],
    moduleId: 'mod-product-annuity',
    moduleName: 'Fixed & Fixed Indexed Annuity Essentials',
    downloadable: true,
    lastUpdated: '2025-12-01'
  },

  // ---------------------------------------------------------------------------
  // COMPLIANCE ESSENTIALS QUICK REFERENCE
  // ---------------------------------------------------------------------------
  {
    id: 'qrc-compliance-essentials',
    title: 'Compliance Essentials',
    subtitle: 'Daily Reference Guide',
    description: 'Key compliance requirements every advisor must follow in every client interaction.',
    sections: [
      {
        title: 'Every Call Must Include',
        items: [
          { label: 'Identification', value: 'Your name, company (Gold Coast Financial), role (licensed advisor)', icon: 'user', isHighlighted: true },
          { label: 'Purpose', value: 'Educational purpose of call - not sales pitch', icon: 'target' },
          { label: 'Recording Disclosure', value: 'If call is recorded, disclose before substantive discussion', icon: 'mic' },
          { label: 'Consent', value: 'Explicit permission to proceed with questions', icon: 'check-circle', isHighlighted: true }
        ]
      },
      {
        title: 'Before Any Recommendation',
        items: [
          { label: 'Needs Analysis', value: 'Document specific protection needs', icon: 'clipboard' },
          { label: 'Financial Profile', value: 'Income, assets, existing coverage', icon: 'dollar-sign' },
          { label: 'Suitability Assessment', value: 'Match product to documented needs', icon: 'check-square' },
          { label: 'Alternatives', value: 'Discuss why this product vs. other options', icon: 'list' }
        ]
      },
      {
        title: 'During Product Discussion',
        items: [
          { label: 'What It Does', value: 'Clear explanation of product features', icon: 'book' },
          { label: 'What It Does NOT Do', value: 'Limitations and exclusions', icon: 'x-circle', isHighlighted: true },
          { label: 'Cost', value: 'Premium and any fees clearly stated', icon: 'credit-card' },
          { label: 'Understanding', value: 'Have client explain back what they\'re considering', icon: 'message-circle', isHighlighted: true }
        ]
      },
      {
        title: 'Documentation Requirements',
        items: [
          { label: 'Same Day', value: 'Log call notes in CRM', icon: 'clock' },
          { label: '24 Hours', value: 'Complete needs analysis documentation', icon: 'file-text', isHighlighted: true },
          { label: 'Application', value: 'Ensure all required forms completed', icon: 'clipboard-check' }
        ]
      }
    ],
    doList: [
      'Identify yourself properly on EVERY call',
      'Get explicit consent before discovery questions',
      'Document needs BEFORE discussing products',
      'Explain alternatives and limitations',
      'Verify understanding through client explain-back',
      'Document same-day, complete within 24 hours'
    ],
    dontList: [
      'Skip identification or consent steps to "save time"',
      'Lead with product before understanding needs',
      'Use pressure tactics or artificial urgency',
      'Proceed if client seems confused',
      'Delay documentation beyond 24 hours',
      'Disparage existing coverage or competitors'
    ],
    keyReminders: [
      'If education and a sale conflict, the sale loses',
      'No means no - end professionally',
      'Document as if a regulator will read it (they might)'
    ],
    complianceWarnings: [
      'All calls may be reviewed',
      'Compliance failures result in termination',
      'Poor documentation = poor defense'
    ],
    moduleId: 'mod-compliance-intro',
    moduleName: 'Compliance Fundamentals',
    downloadable: true,
    lastUpdated: '2025-12-01'
  }
];

// Carrier Branding Configuration
// Each carrier has unique colors, messaging, and form fields

export interface CarrierBranding {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;

  // Logo
  logoUrl?: string;
  logoAlt?: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  textOnPrimary: string;

  // Trust messaging
  trustMessage: string;
  securityMessage: string;
  partnerMessage: string;

  // Form customization
  ssnFormTitle: string;
  bankingFormTitle: string;
  applicationFormTitle: string;

  // Product types offered by this carrier (for Coverage Details)
  productTypes?: string[];

  // Additional carrier-specific fields (for Additional Information section)
  additionalFields?: {
    id: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'checkbox' | 'textarea';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];

  // Footer info
  footerText: string;
  regulatoryInfo?: string;
}

export const CARRIER_BRANDING: Record<string, CarrierBranding> = {
  "americo": {
    id: "americo",
    name: "Americo Financial Life and Annuity Insurance Company",
    shortName: "Americo",
    tagline: "Life Insurance That Fits Your Life",
    description: "Providing quality life insurance and annuity products since 1983",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba",
    logoAlt: "Americo Logo",

    primaryColor: "#1E3A5F",
    secondaryColor: "#C4A052",
    accentColor: "#2563EB",
    gradientFrom: "#1E3A5F",
    gradientTo: "#2D5A87",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Americo has been protecting families for over 40 years with A- (Excellent) rated financial strength.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Americo distribution partner.",

    ssnFormTitle: "Americo Secure Identity Verification",
    bankingFormTitle: "Americo Premium Payment Setup",
    applicationFormTitle: "Americo Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Indexed Universal Life (IUL)", "Final Expense", "Fixed Annuity", "Fixed Indexed Annuity"],

    additionalFields: [
      { id: "replacingExisting", label: "Will this policy replace any existing life insurance or annuity?", type: "select", required: true, options: ["No", "Yes"] },
      { id: "existingPolicies", label: "If yes, please list existing policy details", type: "textarea", required: false, placeholder: "Company name, policy number, face amount" }
    ],

    footerText: "Americo Financial Life and Annuity Insurance Company",
    regulatoryInfo: "Licensed in all 50 states. Home Office: Kansas City, MO"
  },

  "athene": {
    id: "athene",
    name: "Athene Annuity and Life Company",
    shortName: "Athene",
    tagline: "Retirement Innovators",
    description: "Leading provider of retirement savings products",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277359214-logo.png?alt=media&token=6770c112-2236-4b92-b80e-2811635f6643",
    logoAlt: "Athene Logo",

    primaryColor: "#00205B",
    secondaryColor: "#00A3E0",
    accentColor: "#00A3E0",
    gradientFrom: "#00205B",
    gradientTo: "#003380",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Athene is one of the largest providers of retirement savings products in the United States.",
    securityMessage: "Bank-level encryption protects all data transmitted through this secure form.",
    partnerMessage: "Heritage Life Solutions is a licensed Athene distribution partner.",

    ssnFormTitle: "Athene Identity Verification",
    bankingFormTitle: "Athene Account Information",
    applicationFormTitle: "Athene Retirement Application",

    productTypes: ["Fixed Annuity", "Fixed Indexed Annuity", "Multi-Year Guaranteed Annuity (MYGA)", "Income Annuity"],

    additionalFields: [
      { id: "fundingSource", label: "Source of Funds", type: "select", required: true, options: ["401(k) Rollover", "IRA Transfer", "Pension Distribution", "Personal Savings", "CD Maturity", "Other"] },
      { id: "investmentObjective", label: "Primary Investment Objective", type: "select", required: true, options: ["Growth", "Income", "Preservation of Capital", "Combination"] },
      { id: "surrenderPeriod", label: "Preferred Surrender Period", type: "select", required: true, options: ["3 Years", "5 Years", "7 Years", "10 Years"] }
    ],

    footerText: "Athene Annuity and Life Company",
    regulatoryInfo: "Licensed nationwide. Headquarters: West Des Moines, IA"
  },

  "baltimore-life": {
    id: "baltimore-life",
    name: "Baltimore Life Insurance Company",
    shortName: "Baltimore Life",
    tagline: "Protecting Families Since 1882",
    description: "One of America's oldest life insurance companies",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277409363-logo%402x.png?alt=media&token=cdd3c6d0-e497-4a4c-a357-6e3b548dd95c",
    logoAlt: "Baltimore Life Logo",

    primaryColor: "#3471B6",
    secondaryColor: "#2860A0",
    accentColor: "#4080C4",
    gradientFrom: "#3471B6",
    gradientTo: "#4080C4",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Baltimore Life has over 140 years of experience protecting American families.",
    securityMessage: "Your sensitive information is secured with military-grade encryption.",
    partnerMessage: "Heritage Life Solutions is an authorized Baltimore Life agency.",

    ssnFormTitle: "Baltimore Life Identity Verification",
    bankingFormTitle: "Baltimore Life Payment Authorization",
    applicationFormTitle: "Baltimore Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Final Expense", "Single Premium Annuity"],

    additionalFields: [
      { id: "paymentFrequency", label: "Preferred Payment Frequency", type: "select", required: true, options: ["Monthly", "Quarterly", "Semi-Annually", "Annually"] },
      { id: "existingBaltimorePolicy", label: "Do you have an existing Baltimore Life policy?", type: "select", required: true, options: ["No", "Yes"] }
    ],

    footerText: "Baltimore Life Insurance Company",
    regulatoryInfo: "Established 1882. Home Office: Owings Mills, MD"
  },

  "corebridge": {
    id: "corebridge",
    name: "Corebridge Financial",
    shortName: "Corebridge",
    tagline: "Helping People Act on Their Ambitions",
    description: "Formerly AIG Life & Retirement, now independently focused on your financial future",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
    logoAlt: "Corebridge Financial Logo",

    primaryColor: "#4808C1",
    secondaryColor: "#5A1AD3",
    accentColor: "#6020E0",
    gradientFrom: "#4808C1",
    gradientTo: "#5A1AD3",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Corebridge Financial, formerly part of AIG, serves millions of customers nationwide.",
    securityMessage: "Enterprise-grade security protects every piece of information you share.",
    partnerMessage: "Heritage Life Solutions is a registered Corebridge Financial partner.",

    ssnFormTitle: "Corebridge Secure Verification",
    bankingFormTitle: "Corebridge Payment Setup",
    applicationFormTitle: "Corebridge Financial Application",

    productTypes: ["Term Life", "Universal Life", "Indexed Universal Life (IUL)", "Fixed Annuity", "Variable Annuity", "Fixed Indexed Annuity"],

    additionalFields: [
      { id: "riskTolerance", label: "Investment Risk Tolerance", type: "select", required: true, options: ["Conservative", "Moderate", "Aggressive"] },
      { id: "qualifiedFunds", label: "Will this be funded with qualified (retirement) funds?", type: "select", required: true, options: ["No - Non-Qualified", "Yes - IRA", "Yes - 401(k) Rollover", "Yes - Other Qualified"] },
      { id: "primaryPurpose", label: "Primary Purpose of Coverage", type: "select", required: true, options: ["Income Protection", "Estate Planning", "Retirement Savings", "Wealth Transfer", "Business Planning"] }
    ],

    footerText: "Corebridge Financial, Inc.",
    regulatoryInfo: "NYSE: CRBG. Houston, TX"
  },

  "mutual-of-omaha": {
    id: "mutual-of-omaha",
    name: "Mutual of Omaha Insurance Company",
    shortName: "Mutual of Omaha",
    tagline: "The Company You Keep",
    description: "A Fortune 500 mutual insurance company serving millions of Americans",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277474666-Mutual-of-Omaha-logo.png?alt=media&token=0382cf9c-c262-4931-8155-688210c1c173",
    logoAlt: "Mutual of Omaha Logo",

    primaryColor: "#003057",
    secondaryColor: "#FFB81C",
    accentColor: "#FFB81C",
    gradientFrom: "#003057",
    gradientTo: "#004477",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Mutual of Omaha is a Fortune 500 company with A+ (Superior) financial strength rating.",
    securityMessage: "Your data is protected with the same encryption used by major banks.",
    partnerMessage: "Heritage Life Solutions is a licensed Mutual of Omaha representative.",

    ssnFormTitle: "Mutual of Omaha Identity Verification",
    bankingFormTitle: "Mutual of Omaha Bank Draft Authorization",
    applicationFormTitle: "Mutual of Omaha Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Universal Life", "Indexed Universal Life (IUL)", "Final Expense", "Children's Whole Life"],

    additionalFields: [
      { id: "draftDate", label: "Preferred Monthly Draft Date", type: "select", required: true, options: ["1st of Month", "15th of Month", "Last Day of Month"] },
      { id: "ownerInsuredSame", label: "Is the policy owner the same as the insured?", type: "select", required: true, options: ["Yes", "No - Different Owner"] },
      { id: "replacingInsurance", label: "Will this policy replace existing life insurance?", type: "select", required: true, options: ["No", "Yes"] }
    ],

    footerText: "Mutual of Omaha Insurance Company",
    regulatoryInfo: "Fortune 500 company. Home Office: Omaha, NE"
  },

  "ethos": {
    id: "ethos",
    name: "Ethos Life Insurance",
    shortName: "Ethos",
    tagline: "Life Insurance for the Modern Family",
    description: "Making life insurance simple, accessible, and affordable",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277532663-6341f9fa-fd59-42aa-b238-d23e46658048.png?alt=media&token=ea3d4914-d65e-4817-9a81-1ea709064e52",
    logoAlt: "Ethos Logo",

    primaryColor: "#23514A",
    secondaryColor: "#1A3F3A",
    accentColor: "#2D635A",
    gradientFrom: "#23514A",
    gradientTo: "#2D635A",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Ethos partners with top-rated carriers to provide seamless, affordable coverage.",
    securityMessage: "Modern encryption technology keeps your information completely secure.",
    partnerMessage: "Heritage Life Solutions is an authorized Ethos distribution partner.",

    ssnFormTitle: "Ethos Secure Identity Check",
    bankingFormTitle: "Ethos Payment Information",
    applicationFormTitle: "Ethos Life Application",

    productTypes: ["Term Life (10-Year)", "Term Life (15-Year)", "Term Life (20-Year)", "Term Life (30-Year)", "Whole Life", "Indexed Universal Life (IUL)"],

    additionalFields: [
      { id: "coverageReason", label: "Primary Reason for Coverage", type: "select", required: true, options: ["Family Protection", "Mortgage/Debt Coverage", "Income Replacement", "Final Expenses", "Business Protection"] },
      { id: "householdIncome", label: "Annual Household Income Range", type: "select", required: true, options: ["Under $50,000", "$50,000 - $100,000", "$100,000 - $200,000", "$200,000 - $500,000", "Over $500,000"] }
    ],

    footerText: "Ethos Technologies, Inc.",
    regulatoryInfo: "San Francisco, CA"
  },

  "royal-neighbors": {
    id: "royal-neighbors",
    name: "Royal Neighbors of America",
    shortName: "Royal Neighbors",
    tagline: "More Than Insurance. A Sisterhood.",
    description: "Women-led fraternal benefit society since 1895",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56",
    logoAlt: "Royal Neighbors Logo",

    primaryColor: "#6B2D7B",
    secondaryColor: "#E91E8C",
    accentColor: "#E91E8C",
    gradientFrom: "#6B2D7B",
    gradientTo: "#8B3D9B",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Royal Neighbors has been empowering communities and protecting families since 1895.",
    securityMessage: "Your information is protected with bank-level security protocols.",
    partnerMessage: "Heritage Life Solutions proudly partners with Royal Neighbors of America.",

    ssnFormTitle: "Royal Neighbors Identity Verification",
    bankingFormTitle: "Royal Neighbors Payment Setup",
    applicationFormTitle: "Royal Neighbors Membership Application",

    productTypes: ["Term Life", "Whole Life", "Final Expense", "Single Premium Whole Life", "Fixed Annuity"],

    additionalFields: [
      { id: "membershipInterest", label: "Interested in Royal Neighbors Member Benefits?", type: "select", required: true, options: ["Yes - Tell me more", "No - Insurance only"] },
      { id: "referralSource", label: "How did you hear about Royal Neighbors?", type: "select", required: true, options: ["Agent/Representative", "Friend/Family Member", "Online Search", "Community Event", "Other"] }
    ],

    footerText: "Royal Neighbors of America",
    regulatoryInfo: "Fraternal Benefit Society. Home Office: Rock Island, IL"
  },

  "transamerica": {
    id: "transamerica",
    name: "Transamerica Life Insurance Company",
    shortName: "Transamerica",
    tagline: "Tomorrow Makers",
    description: "Helping people live their best lives for over 100 years",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d",
    logoAlt: "Transamerica Logo",

    primaryColor: "#C41230",
    secondaryColor: "#002B5C",
    accentColor: "#002B5C",
    gradientFrom: "#C41230",
    gradientTo: "#E01540",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Transamerica has been a trusted name in life insurance for over a century.",
    securityMessage: "Enterprise security standards protect all information submitted through this form.",
    partnerMessage: "Heritage Life Solutions is a registered Transamerica distribution partner.",

    ssnFormTitle: "Transamerica Secure Verification",
    bankingFormTitle: "Transamerica ACH Authorization",
    applicationFormTitle: "Transamerica Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Universal Life", "Indexed Universal Life (IUL)", "Variable Universal Life (VUL)", "Final Expense"],

    additionalFields: [
      { id: "coverageGoal", label: "Primary Coverage Goal", type: "select", required: true, options: ["Family Protection", "Mortgage Payoff", "Final Expenses", "Income Replacement", "Legacy Planning", "Business Continuation"] },
      { id: "existingTransamerica", label: "Do you have existing Transamerica coverage?", type: "select", required: true, options: ["No", "Yes - Life Insurance", "Yes - Annuity", "Yes - Both"] },
      { id: "preferredContact", label: "Preferred Contact Method", type: "select", required: true, options: ["Phone", "Email", "Text Message"] }
    ],

    footerText: "Transamerica Life Insurance Company",
    regulatoryInfo: "Part of Aegon. Licensed nationwide. Cedar Rapids, IA"
  },

  "american-home-life": {
    id: "american-home-life",
    name: "American Home Life Insurance Company",
    shortName: "American Home Life",
    tagline: "Protecting What Matters Most",
    description: "Providing affordable life insurance to American families",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b",
    logoAlt: "American Home Life Logo",

    primaryColor: "#1B4F72",
    secondaryColor: "#D4AC0D",
    accentColor: "#2980B9",
    gradientFrom: "#1B4F72",
    gradientTo: "#2471A3",
    textOnPrimary: "#FFFFFF",

    trustMessage: "American Home Life is committed to providing quality coverage at affordable rates.",
    securityMessage: "State-of-the-art encryption protects your personal information.",
    partnerMessage: "Heritage Life Solutions is an authorized American Home Life agency.",

    ssnFormTitle: "AHL Identity Verification",
    bankingFormTitle: "AHL Payment Authorization",
    applicationFormTitle: "American Home Life Application",

    productTypes: ["Final Expense", "Whole Life", "Guaranteed Issue Whole Life"],

    additionalFields: [
      { id: "funeralPreplanning", label: "Have you made funeral pre-planning arrangements?", type: "select", required: true, options: ["No", "Yes - Partially", "Yes - Fully Planned"] },
      { id: "livingBenefitInterest", label: "Interested in Living Benefit Rider?", type: "select", required: true, options: ["Yes", "No", "Need more information"] },
      { id: "paymentMethod", label: "Preferred Payment Method", type: "select", required: true, options: ["Bank Draft (EFT)", "Direct Bill"] }
    ],

    footerText: "American Home Life Insurance Company",
    regulatoryInfo: "Home Office: Kansas City, MO"
  },

  "polish-falcons": {
    id: "polish-falcons",
    name: "Polish Falcons of America",
    shortName: "Polish Falcons",
    tagline: "Strength Through Unity",
    description: "Fraternal benefit society serving Polish-American communities",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238",
    logoAlt: "Polish Falcons Logo",

    primaryColor: "#DC143C",
    secondaryColor: "#FFFFFF",
    accentColor: "#B22222",
    gradientFrom: "#DC143C",
    gradientTo: "#E83C5C",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Polish Falcons has served Polish-American families with pride and dedication for generations.",
    securityMessage: "Your information is encrypted and protected at the highest security level.",
    partnerMessage: "Heritage Life Solutions is a partner of Polish Falcons of America.",

    ssnFormTitle: "Polish Falcons Member Verification",
    bankingFormTitle: "Polish Falcons Payment Setup",
    applicationFormTitle: "Polish Falcons Membership Application",

    productTypes: ["Term Life", "Whole Life", "Final Expense"],

    additionalFields: [
      { id: "nestAffiliation", label: "Local Nest Affiliation (if known)", type: "text", required: false, placeholder: "Enter your local nest name or number" },
      { id: "membershipStatus", label: "Current Polish Falcons Membership Status", type: "select", required: true, options: ["New Member", "Existing Member", "Family of Member"] },
      { id: "polishHeritage", label: "Polish Heritage Connection", type: "select", required: false, options: ["Polish Descent", "Polish Spouse/Family", "Interest in Polish Culture", "Other"] }
    ],

    footerText: "Polish Falcons of America",
    regulatoryInfo: "Fraternal Benefit Society. Pittsburgh, PA"
  },

  "ladder": {
    id: "ladder",
    name: "Ladder Life Insurance",
    shortName: "Ladder",
    tagline: "Flexible Life Insurance for Today",
    description: "Digital-first life insurance that adapts to your life",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733",
    logoAlt: "Ladder Logo",

    primaryColor: "#1A1A2E",
    secondaryColor: "#16C79A",
    accentColor: "#16C79A",
    gradientFrom: "#1A1A2E",
    gradientTo: "#2D2D44",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Ladder provides instant, flexible coverage backed by Allianz and Fidelity Security Life.",
    securityMessage: "Modern security technology protects every interaction.",
    partnerMessage: "Heritage Life Solutions is an authorized Ladder distribution partner.",

    ssnFormTitle: "Ladder Identity Verification",
    bankingFormTitle: "Ladder Payment Setup",
    applicationFormTitle: "Ladder Life Application",

    productTypes: ["10-Year Term", "15-Year Term", "20-Year Term", "25-Year Term", "30-Year Term"],

    additionalFields: [
      { id: "coverageFlexibility", label: "Interested in Ladder's coverage flexibility feature?", type: "select", required: true, options: ["Yes - Want ability to adjust coverage", "No - Fixed coverage is fine"] },
      { id: "primaryDependents", label: "Number of Financial Dependents", type: "select", required: true, options: ["0", "1", "2", "3", "4 or more"] },
      { id: "mortgageBalance", label: "Approximate Mortgage Balance (if applicable)", type: "select", required: false, options: ["No Mortgage", "Under $100,000", "$100,000 - $300,000", "$300,000 - $500,000", "Over $500,000"] }
    ],

    footerText: "Ladder Insurance Services, LLC",
    regulatoryInfo: "Palo Alto, CA. Policies issued by Allianz Life Insurance Company"
  },

  "lincoln-financial": {
    id: "lincoln-financial",
    name: "Lincoln Financial Group",
    shortName: "Lincoln Financial",
    tagline: "Chief Life Officer",
    description: "A Fortune 200 financial services company",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b",
    logoAlt: "Lincoln Financial Logo",

    primaryColor: "#6B1C23",
    secondaryColor: "#8B2D35",
    accentColor: "#7B2530",
    gradientFrom: "#6B1C23",
    gradientTo: "#8B2D35",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Lincoln Financial is a Fortune 200 company with an A+ rating for financial strength.",
    securityMessage: "Fortune 200 security standards protect all submitted information.",
    partnerMessage: "Heritage Life Solutions is a registered Lincoln Financial producer.",

    ssnFormTitle: "Lincoln Financial Identity Verification",
    bankingFormTitle: "Lincoln Financial Payment Authorization",
    applicationFormTitle: "Lincoln Financial Life Application",

    productTypes: ["Term Life", "Indexed Universal Life (IUL)", "Variable Universal Life (VUL)", "Survivorship IUL", "Survivorship VUL"],

    additionalFields: [
      { id: "investmentExperience", label: "Investment Experience Level", type: "select", required: true, options: ["Beginner", "Intermediate", "Experienced"] },
      { id: "premiumFrequency", label: "Intended Premium Payment Frequency", type: "select", required: true, options: ["Monthly", "Quarterly", "Semi-Annual", "Annual", "Single Premium"] },
      { id: "cashValuePriority", label: "Priority: Death Benefit vs Cash Value Growth", type: "select", required: true, options: ["Death Benefit Focused", "Cash Value Growth Focused", "Balanced Approach"] },
      { id: "businessOwner", label: "Are you a business owner?", type: "select", required: true, options: ["No", "Yes - Sole Proprietor", "Yes - Partnership", "Yes - Corporation"] }
    ],

    footerText: "Lincoln National Life Insurance Company",
    regulatoryInfo: "NYSE: LNC. Fortune 200. Radnor, PA"
  }
};

export function getCarrierBranding(carrierId: string): CarrierBranding | null {
  return CARRIER_BRANDING[carrierId] || null;
}

export function getAllCarriers(): CarrierBranding[] {
  return Object.values(CARRIER_BRANDING);
}

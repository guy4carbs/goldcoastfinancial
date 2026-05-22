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
  "aetna": {
    id: "aetna",
    name: "Aetna Life Insurance Company",
    shortName: "Aetna",
    tagline: "Trusted Life Insurance Protection",
    description: "A CVS Health company offering life insurance solutions for families",

    primaryColor: "#7D3F98",
    secondaryColor: "#5E2D73",
    accentColor: "#2563EB",
    gradientFrom: "#7D3F98",
    gradientTo: "#5E2D73",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Aetna Life Insurance Company is part of CVS Health, with A (Excellent) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Aetna distribution partner.",

    ssnFormTitle: "Aetna Secure Identity Verification",
    bankingFormTitle: "Aetna Premium Payment Setup",
    applicationFormTitle: "Aetna Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Final Expense"],

    footerText: "Aetna Life Insurance Company"
  },

  "american-amicable": {
    id: "american-amicable",
    name: "American-Amicable Life Insurance Company of Texas",
    shortName: "American Amicable",
    tagline: "Texas Heritage Since 1910",
    description: "Waco-based life insurer specializing in whole life, term, and final expense coverage; a wholly owned subsidiary of iA Financial Group.",

    primaryColor: "#1B365D",
    secondaryColor: "#C4A052",
    accentColor: "#2563EB",
    gradientFrom: "#1B365D",
    gradientTo: "#0F2240",
    textOnPrimary: "#FFFFFF",

    trustMessage: "American-Amicable Life Insurance Company of Texas operates with an A (Excellent) financial strength rating from A.M. Best and is part of iA Financial Group, one of the largest insurance organizations in North America.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized American Amicable distribution partner.",

    ssnFormTitle: "American Amicable Secure Identity Verification",
    bankingFormTitle: "American Amicable Premium Payment Setup",
    applicationFormTitle: "American Amicable Life Insurance Application",

    productTypes: ["Whole Life", "Term Life", "Final Expense", "Annuities"],

    footerText: "American-Amicable Life Insurance Company of Texas"
  },

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

  "banner-life": {
    id: "banner-life",
    name: "Banner Life Insurance Company",
    shortName: "Banner Life",
    tagline: "Term Life Insurance Specialists",
    description: "Part of Legal & General America, specializing in term life insurance",

    primaryColor: "#0033A0",
    secondaryColor: "#002270",
    accentColor: "#2563EB",
    gradientFrom: "#0033A0",
    gradientTo: "#002270",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Banner Life Insurance Company is part of Legal & General America, with A+ (Superior) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Banner Life distribution partner.",

    ssnFormTitle: "Banner Life Secure Identity Verification",
    bankingFormTitle: "Banner Life Premium Payment Setup",
    applicationFormTitle: "Banner Life Life Insurance Application",

    productTypes: ["Term Life", "Universal Life"],

    footerText: "Banner Life Insurance Company"
  },

  "chubb": {
    id: "chubb",
    name: "Chubb Life Insurance Company",
    shortName: "Chubb",
    tagline: "Insurance Built for the World's Most Discerning Clients",
    description: "A global insurer with A++ (Superior) financial strength from AM Best",

    primaryColor: "#0A2D5F",
    secondaryColor: "#1B4480",
    accentColor: "#2563EB",
    gradientFrom: "#0A2D5F",
    gradientTo: "#051A38",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Chubb is one of the world's largest publicly traded property and casualty insurers, with A++ (Superior) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Chubb distribution partner.",

    ssnFormTitle: "Chubb Secure Identity Verification",
    bankingFormTitle: "Chubb Premium Payment Setup",
    applicationFormTitle: "Chubb Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Universal Life", "Accident & Health"],

    footerText: "Chubb Life Insurance Company",
    regulatoryInfo: "NYSE: CB. Licensed in all 50 states."
  },

  "corebridge": {
    id: "corebridge",
    name: "Corebridge Financial",
    shortName: "Corebridge",
    tagline: "Helping People Act on Their Ambitions",
    description: "Spun out from its former parent in 2022, now independently focused on your financial future",

    logoUrl: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
    logoAlt: "Corebridge Financial Logo",

    primaryColor: "#4808C1",
    secondaryColor: "#5A1AD3",
    accentColor: "#6020E0",
    gradientFrom: "#4808C1",
    gradientTo: "#5A1AD3",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Corebridge Financial, spun out from its former parent company in 2022, serves millions of customers nationwide.",
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

  "foresters": {
    id: "foresters",
    name: "Foresters Financial (The Independent Order of Foresters)",
    shortName: "Foresters",
    tagline: "More Than Insurance, a Fraternal Benefit Society",
    description: "A fraternal benefit society offering life insurance and member benefits",

    primaryColor: "#5B2D8A",
    secondaryColor: "#7849A6",
    accentColor: "#2563EB",
    gradientFrom: "#5B2D8A",
    gradientTo: "#3A1A5C",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Foresters Financial is a fraternal benefit society with A (Excellent) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Foresters distribution partner.",

    ssnFormTitle: "Foresters Secure Identity Verification",
    bankingFormTitle: "Foresters Premium Payment Setup",
    applicationFormTitle: "Foresters Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Universal Life", "Final Expense"],

    footerText: "The Independent Order of Foresters"
  },

  "globe-life": {
    id: "globe-life",
    name: "Globe Life And Accident Insurance Company",
    shortName: "Globe Life",
    tagline: "Making Life Insurance Simple",
    description: "A subsidiary of Globe Life Inc, offering mortgage protection and final expense coverage",

    primaryColor: "#005EB8",
    secondaryColor: "#0080C8",
    accentColor: "#2563EB",
    gradientFrom: "#005EB8",
    gradientTo: "#003D7A",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Globe Life And Accident Insurance Company is a subsidiary of Globe Life Inc, with A (Excellent) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Globe Life distribution partner.",

    ssnFormTitle: "Globe Life Secure Identity Verification",
    bankingFormTitle: "Globe Life Premium Payment Setup",
    applicationFormTitle: "Globe Life Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Final Expense", "Mortgage Protection"],

    footerText: "Globe Life And Accident Insurance Company"
  },

  "guarantee-trust": {
    id: "guarantee-trust",
    name: "Guarantee Trust Life Insurance Company",
    shortName: "Guarantee Trust",
    tagline: "Supplemental Health and Life Protection",
    description: "Specializing in supplemental health and final expense coverage",

    primaryColor: "#1976D2",
    secondaryColor: "#0D47A1",
    accentColor: "#2563EB",
    gradientFrom: "#1976D2",
    gradientTo: "#0D47A1",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Guarantee Trust Life Insurance Company holds an A- (Excellent) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Guarantee Trust distribution partner.",

    ssnFormTitle: "Guarantee Trust Secure Identity Verification",
    bankingFormTitle: "Guarantee Trust Premium Payment Setup",
    applicationFormTitle: "Guarantee Trust Life Insurance Application",

    productTypes: ["Final Expense", "Whole Life", "Supplemental Health"],

    footerText: "Guarantee Trust Life Insurance Company"
  },

  "instabrain": {
    id: "instabrain",
    name: "Fidelity Life Association",
    shortName: "InstaBrain",
    tagline: "Instant-Decision Life Insurance",
    description: "Chicago-based legal reserve life insurer (founded 1896) delivering instant-decision underwriting via the InstaBrain platform, backed by iA Financial Corporation.",

    primaryColor: "#0066CC",
    secondaryColor: "#003D7A",
    accentColor: "#00A3E0",
    gradientFrom: "#0066CC",
    gradientTo: "#003D7A",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Fidelity Life Association holds an A- (Excellent) financial strength rating from A.M. Best (affirmed 2024) and is backed by iA Financial Corporation, with the InstaBrain platform delivering instant-decision underwriting.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized InstaBrain distribution partner.",

    ssnFormTitle: "InstaBrain Secure Identity Verification",
    bankingFormTitle: "InstaBrain Premium Payment Setup",
    applicationFormTitle: "InstaBrain Life Insurance Application",

    productTypes: ["Term Life", "Whole Life", "Final Expense", "Accelerated Underwriting"],

    footerText: "Fidelity Life Association"
  },

  "lafayette-life": {
    id: "lafayette-life",
    name: "The Lafayette Life Insurance Company",
    shortName: "Lafayette Life",
    tagline: "Participating Whole Life Since 1905",
    description: "Indiana-based mutual-structured life insurer (founded 1905) and member of Western & Southern Financial Group, specializing in participating whole life and fixed/indexed annuities.",

    primaryColor: "#7B1838",
    secondaryColor: "#C4A052",
    accentColor: "#2563EB",
    gradientFrom: "#7B1838",
    gradientTo: "#4F0F23",
    textOnPrimary: "#FFFFFF",

    trustMessage: "The Lafayette Life Insurance Company carries an A+ (Superior) financial strength rating from A.M. Best and is a member of Western & Southern Financial Group, a Fortune 500 diversified financial services organization.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Lafayette Life distribution partner.",

    ssnFormTitle: "Lafayette Life Secure Identity Verification",
    bankingFormTitle: "Lafayette Life Premium Payment Setup",
    applicationFormTitle: "Lafayette Life Life Insurance Application",

    productTypes: ["Whole Life", "Term Life", "Fixed Indexed Annuities", "Immediate Annuities"],

    footerText: "The Lafayette Life Insurance Company"
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

  "trinity-life": {
    id: "trinity-life",
    name: "Trinity Life Insurance Company",
    shortName: "Trinity Life",
    tagline: "Final Expense Protection",
    description: "Specializing in final expense and burial protection coverage",

    primaryColor: "#2E7D32",
    secondaryColor: "#3F9B43",
    accentColor: "#2563EB",
    gradientFrom: "#2E7D32",
    gradientTo: "#1B5E20",
    textOnPrimary: "#FFFFFF",

    trustMessage: "Trinity Life Insurance Company offers final expense and burial protection products.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized Trinity Life distribution partner.",

    ssnFormTitle: "Trinity Life Secure Identity Verification",
    bankingFormTitle: "Trinity Life Premium Payment Setup",
    applicationFormTitle: "Trinity Life Life Insurance Application",

    productTypes: ["Final Expense", "Whole Life"],

    footerText: "Trinity Life Insurance Company"
  },

  "united-home-life": {
    id: "united-home-life",
    name: "United Home Life Insurance Company",
    shortName: "United Home Life",
    tagline: "Burial and Final Expense Protection",
    description: "Focused on burial and final expense coverage for families",

    primaryColor: "#7B1E3B",
    secondaryColor: "#A02D52",
    accentColor: "#2563EB",
    gradientFrom: "#7B1E3B",
    gradientTo: "#5C1129",
    textOnPrimary: "#FFFFFF",

    trustMessage: "United Home Life Insurance Company holds an A- (Excellent) financial strength rating from AM Best.",
    securityMessage: "Your information is encrypted with 256-bit SSL security, the same level used by major financial institutions.",
    partnerMessage: "Heritage Life Solutions is an authorized United Home Life distribution partner.",

    ssnFormTitle: "United Home Life Secure Identity Verification",
    bankingFormTitle: "United Home Life Premium Payment Setup",
    applicationFormTitle: "United Home Life Life Insurance Application",

    productTypes: ["Final Expense", "Whole Life", "Burial Insurance"],

    footerText: "United Home Life Insurance Company"
  }
};

export function getCarrierBranding(carrierId: string): CarrierBranding | null {
  return CARRIER_BRANDING[carrierId] || null;
}

export function getAllCarriers(): CarrierBranding[] {
  return Object.values(CARRIER_BRANDING);
}

/**
 * ENTERPRISE KNOWLEDGE BASE
 * Products, carriers, scripts, objections, compliance rules.
 * All agents read from this. Training Agent updates it.
 */

// ─── Carrier ─────────────────────────────────────────────────────
export interface Carrier {
  id: string;
  name: string;
  products: string[];
  states: string[];       // Licensed states
  underwritingType: 'simplified' | 'full' | 'guaranteed';
  avgApprovalDays: number;
  commissionSchedule: {
    firstYear: number;     // Percentage
    renewal: number;
    bonus?: number;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    portal?: string;
  };
  notes?: string;
}

// ─── Product Template ────────────────────────────────────────────
export interface ProductTemplate {
  id: string;
  type: 'term_life' | 'whole_life' | 'iul' | 'final_expense' | 'mortgage_protection' | 'annuity';
  name: string;
  description: string;
  carriers: string[];
  minCoverage: number;
  maxCoverage: number;
  minAge: number;
  maxAge: number;
  idealCustomerProfile: string;
  keyBenefits: string[];
  commonObjections: ObjectionResponse[];
  talkingPoints: string[];
  complianceNotes: string[];
}

// ─── Objection Handling ──────────────────────────────────────────
export interface ObjectionResponse {
  objection: string;
  category: 'price' | 'timing' | 'trust' | 'need' | 'competitor' | 'spouse' | 'other';
  response: string;
  followUp?: string;
  effectiveness?: number; // 0-100 score
}

// ─── Compliance Rule ─────────────────────────────────────────────
export interface ComplianceRule {
  id: string;
  state?: string;         // If state-specific
  category: 'disclosure' | 'suitability' | 'replacement' | 'advertising' | 'licensing' | 'privacy';
  rule: string;
  severity: 'info' | 'warning' | 'critical' | 'blocking';
  action: string;         // What to do
  reference?: string;     // Legal reference
}

// ─── Sales Script ────────────────────────────────────────────────
export interface SalesScript {
  id: string;
  name: string;
  type: 'cold_call' | 'follow_up' | 'closing' | 'objection' | 'referral' | 'retention';
  productType?: string;
  script: string;
  variations?: string[];
  performanceScore?: number;
  lastUpdated: number;
}

// ─── Email Template ──────────────────────────────────────────────
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'follow_up' | 'quote' | 'application' | 'policy' | 'renewal' | 'win_back' | 'drip';
  sequencePosition?: number;
  openRate?: number;
  clickRate?: number;
}

// ─── The Knowledge Base ──────────────────────────────────────────
export class KnowledgeBase {
  private carriers: Map<string, Carrier> = new Map();
  private products: Map<string, ProductTemplate> = new Map();
  private objections: ObjectionResponse[] = [];
  private complianceRules: ComplianceRule[] = [];
  private scripts: Map<string, SalesScript> = new Map();
  private emailTemplates: Map<string, EmailTemplate> = new Map();

  private static instance: KnowledgeBase;

  static getInstance(): KnowledgeBase {
    if (!KnowledgeBase.instance) {
      KnowledgeBase.instance = new KnowledgeBase();
      KnowledgeBase.instance.seedDefaults();
    }
    return KnowledgeBase.instance;
  }

  // ─── Carriers ──────────────────────────────────────────────
  addCarrier(carrier: Carrier): void {
    this.carriers.set(carrier.id, carrier);
  }

  getCarrier(id: string): Carrier | undefined {
    return this.carriers.get(id);
  }

  getAllCarriers(): Carrier[] {
    return Array.from(this.carriers.values());
  }

  getCarriersForState(state: string): Carrier[] {
    return this.getAllCarriers().filter((c) => c.states.includes(state));
  }

  // ─── Products ──────────────────────────────────────────────
  addProduct(product: ProductTemplate): void {
    this.products.set(product.id, product);
  }

  getProduct(id: string): ProductTemplate | undefined {
    return this.products.get(id);
  }

  getProductsByType(type: string): ProductTemplate[] {
    return Array.from(this.products.values()).filter((p) => p.type === type);
  }

  getAllProducts(): ProductTemplate[] {
    return Array.from(this.products.values());
  }

  // ─── Objections ────────────────────────────────────────────
  addObjection(objection: ObjectionResponse): void {
    this.objections.push(objection);
  }

  getObjectionsByCategory(category: string): ObjectionResponse[] {
    return this.objections.filter((o) => o.category === category);
  }

  getBestObjectionResponse(objectionText: string): ObjectionResponse | null {
    // Simple keyword matching — AI Sales Agent will do semantic matching
    const lower = objectionText.toLowerCase();
    const match = this.objections.find((o) =>
      lower.includes(o.objection.toLowerCase()) ||
      o.objection.toLowerCase().includes(lower)
    );
    return match || null;
  }

  // ─── Compliance ────────────────────────────────────────────
  addComplianceRule(rule: ComplianceRule): void {
    this.complianceRules.push(rule);
  }

  getRulesForState(state: string): ComplianceRule[] {
    return this.complianceRules.filter(
      (r) => !r.state || r.state === state
    );
  }

  getBlockingRules(state?: string): ComplianceRule[] {
    return this.complianceRules.filter(
      (r) => r.severity === 'blocking' && (!state || !r.state || r.state === state)
    );
  }

  // ─── Scripts ───────────────────────────────────────────────
  addScript(script: SalesScript): void {
    this.scripts.set(script.id, script);
  }

  getScript(id: string): SalesScript | undefined {
    return this.scripts.get(id);
  }

  getScriptsByType(type: string): SalesScript[] {
    return Array.from(this.scripts.values()).filter((s) => s.type === type);
  }

  // ─── Email Templates ──────────────────────────────────────
  addEmailTemplate(template: EmailTemplate): void {
    this.emailTemplates.set(template.id, template);
  }

  getEmailTemplate(id: string): EmailTemplate | undefined {
    return this.emailTemplates.get(id);
  }

  getEmailTemplatesByType(type: string): EmailTemplate[] {
    return Array.from(this.emailTemplates.values()).filter((t) => t.type === type);
  }

  // ─── Seed Default Data ─────────────────────────────────────
  private seedDefaults(): void {
    // Default Products
    this.addProduct({
      id: 'term-life',
      type: 'term_life',
      name: 'Term Life Insurance',
      description: 'Affordable coverage for a specific period',
      carriers: [],
      minCoverage: 25000,
      maxCoverage: 5000000,
      minAge: 18,
      maxAge: 75,
      idealCustomerProfile: 'Young families, mortgage holders, income replacement needs',
      keyBenefits: [
        'Most affordable life insurance option',
        'Fixed premiums for the term length',
        'Convertible to permanent coverage',
        'Large coverage amounts available',
      ],
      commonObjections: [],
      talkingPoints: [
        'If something happened to you tomorrow, could your family maintain their lifestyle?',
        'Term life is the most cost-effective way to protect your family during critical years',
        'Lock in your health rating now — premiums only go up with age',
      ],
      complianceNotes: ['Must disclose term expiration', 'Suitability analysis required'],
    });

    this.addProduct({
      id: 'whole-life',
      type: 'whole_life',
      name: 'Whole Life Insurance',
      description: 'Permanent coverage with cash value accumulation',
      carriers: [],
      minCoverage: 10000,
      maxCoverage: 2000000,
      minAge: 0,
      maxAge: 85,
      idealCustomerProfile: 'Estate planning, wealth transfer, permanent protection needs',
      keyBenefits: [
        'Lifetime coverage — never expires',
        'Cash value grows tax-deferred',
        'Fixed premiums that never increase',
        'Dividends from participating policies',
      ],
      commonObjections: [],
      talkingPoints: [
        'This is the only policy that guarantees a death benefit no matter when you pass',
        'The cash value is like a savings account that grows alongside your protection',
        'Perfect for legacy planning and final expenses',
      ],
      complianceNotes: ['Must explain cash value vs death benefit', 'Illustration requirements vary by state'],
    });

    this.addProduct({
      id: 'iul',
      type: 'iul',
      name: 'Indexed Universal Life',
      description: 'Flexible permanent coverage linked to market indexes',
      carriers: [],
      minCoverage: 50000,
      maxCoverage: 10000000,
      minAge: 18,
      maxAge: 70,
      idealCustomerProfile: 'High earners, supplemental retirement, tax-advantaged growth',
      keyBenefits: [
        'Cash value linked to market indexes with downside protection',
        'Flexible premiums and death benefit',
        'Tax-free loans and withdrawals',
        '0% floor protects against market losses',
      ],
      commonObjections: [],
      talkingPoints: [
        'IUL gives you market-linked growth without the market risk',
        'It\'s like having a 401k and life insurance in one vehicle',
        'Tax-free retirement income that doesn\'t affect Social Security',
      ],
      complianceNotes: [
        'Must provide policy illustration',
        'Cannot guarantee index returns',
        'Must disclose cap rates and participation rates',
      ],
    });

    this.addProduct({
      id: 'final-expense',
      type: 'final_expense',
      name: 'Final Expense Insurance',
      description: 'Simplified whole life for burial and final costs',
      carriers: [],
      minCoverage: 2000,
      maxCoverage: 50000,
      minAge: 40,
      maxAge: 85,
      idealCustomerProfile: 'Seniors, fixed income, simplified underwriting needs',
      keyBenefits: [
        'No medical exam required',
        'Guaranteed acceptance options available',
        'Covers funeral, burial, and outstanding debts',
        'Small affordable premiums',
      ],
      commonObjections: [],
      talkingPoints: [
        'The average funeral costs $10,000-$15,000 — don\'t leave that burden on your family',
        'Simple health questions, no needles or doctor visits',
        'Coverage starts immediately (or graded for guaranteed issue)',
      ],
      complianceNotes: ['Graded benefit disclosure required', 'Must verify age and health questions'],
    });

    this.addProduct({
      id: 'mortgage-protection',
      type: 'mortgage_protection',
      name: 'Mortgage Protection Insurance',
      description: 'Coverage designed to pay off your mortgage',
      carriers: [],
      minCoverage: 50000,
      maxCoverage: 1000000,
      minAge: 18,
      maxAge: 70,
      idealCustomerProfile: 'New homeowners, refinancers, families with mortgage debt',
      keyBenefits: [
        'Pays off mortgage if you pass away',
        'Keeps family in their home',
        'Often includes living benefits',
        'Decreasing or level term options',
      ],
      commonObjections: [],
      talkingPoints: [
        'Your bank sent you that letter because they want to protect their investment — shouldn\'t you protect yours?',
        'If you couldn\'t work for 6 months, could you still make payments?',
        'This pays off your mortgage AND gives your family a financial cushion',
      ],
      complianceNotes: ['Cannot imply bank requirement', 'Must disclose it\'s life insurance, not bank product'],
    });

    this.addProduct({
      id: 'annuity',
      type: 'annuity',
      name: 'Fixed Index Annuity',
      description: 'Guaranteed income for retirement',
      carriers: [],
      minCoverage: 10000,
      maxCoverage: 5000000,
      minAge: 40,
      maxAge: 85,
      idealCustomerProfile: 'Pre-retirees, retirees, conservative investors, pension replacement',
      keyBenefits: [
        'Guaranteed lifetime income',
        'Principal protection',
        'Tax-deferred growth',
        'No market risk',
      ],
      commonObjections: [],
      talkingPoints: [
        'What if you could never outlive your money?',
        'A pension you create for yourself',
        'Your principal is 100% protected from market downturns',
      ],
      complianceNotes: ['Suitability requirements are strict', 'Must disclose surrender charges', 'Senior-specific regulations apply'],
    });

    // Default Objection Responses
    const defaultObjections: ObjectionResponse[] = [
      {
        objection: "I can't afford it",
        category: 'price',
        response: "I completely understand budget concerns. Let me ask you this — if something happened to you tomorrow, could your family afford to keep their home and lifestyle? We have options starting at less than your daily coffee. Let's find what fits your budget while still protecting what matters most.",
        followUp: "What if I could show you a plan for less than $1 a day?",
        effectiveness: 78,
      },
      {
        objection: "I need to think about it",
        category: 'timing',
        response: "Absolutely, this is an important decision. But here's what I want you to consider — your health today qualifies you for the best rates. Every day that passes, rates go up with age, and health changes are unpredictable. What specific concerns can I address right now to help you feel confident?",
        followUp: "Is there something specific holding you back that I can clarify?",
        effectiveness: 72,
      },
      {
        objection: "I need to talk to my spouse",
        category: 'spouse',
        response: "That's actually great — this is a family decision. In fact, your spouse should absolutely be part of this conversation. Can we set up a quick 15-minute call with both of you? That way I can answer all their questions too.",
        followUp: "What time works best for both of you this week?",
        effectiveness: 81,
      },
      {
        objection: "I already have coverage through work",
        category: 'need',
        response: "That's a great start! But here's something most people don't realize — employer coverage typically ends when you leave that job or retire. It's usually only 1-2x your salary, which isn't enough. And it gets more expensive to get personal coverage as you age. This is about having protection YOU own, that stays with you no matter what.",
        effectiveness: 85,
      },
      {
        objection: "I don't trust insurance companies",
        category: 'trust',
        response: "I hear you, and honestly, the industry hasn't always earned people's trust. That's exactly why I'm here — I'm an independent agent. I don't work for one company. I shop dozens of carriers to find YOU the best deal. My job is to be your advocate, not theirs.",
        effectiveness: 76,
      },
      {
        objection: "I'm young and healthy, I don't need it",
        category: 'need',
        response: "That's actually the BEST reason to get it now. You're in the best health of your life, which means you qualify for the lowest rates you'll ever see. Lock in these rates now, and you're protected for decades. Waiting only costs more — or worse, a health change could make you uninsurable.",
        effectiveness: 82,
      },
    ];
    defaultObjections.forEach((o) => this.addObjection(o));

    // Default Compliance Rules
    const defaultRules: ComplianceRule[] = [
      {
        id: 'disclosure-replacement',
        category: 'replacement',
        rule: 'If the prospect has existing coverage, a replacement form must be completed before issuing new policy',
        severity: 'blocking',
        action: 'Present replacement disclosure form. Document existing coverage details.',
        reference: 'NAIC Model Replacement Regulation',
      },
      {
        id: 'suitability-analysis',
        category: 'suitability',
        rule: 'A suitability analysis must be completed for all annuity sales',
        severity: 'blocking',
        action: 'Complete suitability questionnaire covering financial situation, objectives, and risk tolerance',
        reference: 'NAIC Suitability in Annuity Transactions Model Regulation',
      },
      {
        id: 'do-not-call',
        category: 'privacy',
        rule: 'Must check Do Not Call registry before outbound calls',
        severity: 'blocking',
        action: 'Verify phone number against DNC registry. Existing customer relationships are exempt for 18 months.',
        reference: 'FTC Telemarketing Sales Rule',
      },
      {
        id: 'recording-consent',
        category: 'privacy',
        rule: 'Call recording requires consent in two-party consent states',
        severity: 'critical',
        action: 'Announce recording at start of call. Two-party states: CA, CT, FL, IL, MD, MA, MT, NH, PA, WA',
        reference: 'State wiretapping laws',
      },
      {
        id: 'senior-protection',
        category: 'suitability',
        rule: 'Enhanced suitability standards for clients aged 65+',
        severity: 'critical',
        action: 'Additional review required. Consider trusted contact designation. Extended free-look period may apply.',
        reference: 'NAIC Senior Protection in Annuity Transactions',
      },
      {
        id: 'advertising-approval',
        category: 'advertising',
        rule: 'All marketing materials must be reviewed for compliance before distribution',
        severity: 'warning',
        action: 'Submit materials for compliance review. No unapproved claims about returns or guarantees.',
      },
    ];
    defaultRules.forEach((r) => this.addComplianceRule(r));

    // Default Sales Scripts
    this.addScript({
      id: 'cold-call-mortgage',
      name: 'Mortgage Protection Cold Call',
      type: 'cold_call',
      productType: 'mortgage_protection',
      script: `Hi, is this {{firstName}}? Great! My name is {{agentName}} and I'm calling about the mortgage information you recently submitted. I work with families in {{state}} to make sure their home is protected if something unexpected happens. I'm not trying to sell you anything today — I just want to make sure you have the information you need to make the best decision for your family. Do you have about 2 minutes?`,
      performanceScore: 74,
      lastUpdated: Date.now(),
    });

    this.addScript({
      id: 'cold-call-final-expense',
      name: 'Final Expense Cold Call',
      type: 'cold_call',
      productType: 'final_expense',
      script: `Hi {{firstName}}, my name is {{agentName}}. I'm reaching out because you recently requested information about coverage options. A lot of folks I talk to are looking for a simple, affordable way to make sure their family isn't left with a financial burden. Is that something that's been on your mind?`,
      performanceScore: 71,
      lastUpdated: Date.now(),
    });
  }

  // ─── Stats ─────────────────────────────────────────────────
  getStats(): {
    carriers: number;
    products: number;
    objections: number;
    complianceRules: number;
    scripts: number;
    emailTemplates: number;
  } {
    return {
      carriers: this.carriers.size,
      products: this.products.size,
      objections: this.objections.length,
      complianceRules: this.complianceRules.length,
      scripts: this.scripts.size,
      emailTemplates: this.emailTemplates.size,
    };
  }
}

export const knowledgeBase = KnowledgeBase.getInstance();

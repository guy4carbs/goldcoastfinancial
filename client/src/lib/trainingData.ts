/**
 * GOLD COAST FINANCIAL - INSTITUTIONAL TRAINING & CERTIFICATION SYSTEM
 *
 * This is regulated financial services training infrastructure, NOT sales enablement.
 * Designed to withstand carrier audits, satisfy state regulators, and enforce
 * national behavioral consistency across all licensed advisors.
 *
 * FOUNDATIONAL DOCTRINE:
 * - Advisors are educators, not salespeople
 * - If education and a sale conflict, the sale loses
 * - Long-term trust and persistency outweigh short-term revenue
 * - Compliance enables scale; it does not restrict it
 * - The brand belongs to the institution, not the individual agent
 * - Top producers without integrity do not stay
 */

// ============================================================================
// CERTIFICATION LEVELS & ENFORCEMENT
// ============================================================================

export type CertificationLevel =
  | 'pre_access'           // Level 0: Before any client contact
  | 'core_advisor'         // Level 1: Basic advisor certification
  | 'live_client'          // Level 2: Authorized for client interactions
  | 'state_expansion'      // Level 3: Multi-state authorization
  | 'ongoing_compliance';  // Level 4: Continuous education & recertification

export type CertificationStatus =
  | 'locked'               // Prerequisites not met
  | 'available'            // Can begin certification
  | 'in_progress'          // Currently working through
  | 'pending_review'       // Awaiting manager approval
  | 'certified'            // Successfully completed
  | 'expired'              // Recertification required
  | 'suspended';           // Compliance violation - remediation required

export interface CertificationGate {
  id: string;
  level: CertificationLevel;
  name: string;
  description: string;
  prerequisites: string[];         // IDs of required certifications
  requiredModules: string[];       // Module IDs that must be completed
  requiredAssessments: string[];   // Assessment IDs that must be passed
  passingThreshold: number;        // Minimum score (0-100)
  maxAttempts: number;             // Retries before lockout
  lockoutDuration: number;         // Hours before retry after max attempts
  expirationMonths: number;        // 0 = never expires
  managerApprovalRequired: boolean;
  complianceReviewRequired: boolean;
}

export const CERTIFICATION_GATES: CertificationGate[] = [
  {
    id: 'cert-pre-access',
    level: 'pre_access',
    name: 'Pre-Access Certification',
    description: 'Required before any system access. Covers onboarding, institutional doctrine, compliance fundamentals, and professional standards.',
    prerequisites: [],
    requiredModules: ['mod-welcome', 'mod-business-setup', 'mod-portal', 'mod-role', 'mod-philosophy', 'mod-compliance-intro', 'mod-brand'],
    requiredAssessments: ['assess-doctrine', 'assess-brand', 'assess-compliance-basics'],
    passingThreshold: 85,
    maxAttempts: 3,
    lockoutDuration: 72,
    expirationMonths: 0, // Never expires once earned
    managerApprovalRequired: false,
    complianceReviewRequired: false
  },
  {
    id: 'cert-core-advisor',
    level: 'core_advisor',
    name: 'Core Advisor Certification',
    description: 'Foundational certification covering education-first methodology, advanced compliance verification, suitability analysis, and product knowledge.',
    prerequisites: ['cert-pre-access'],
    requiredModules: ['mod-education-call', 'mod-disclosure', 'mod-handling-no', 'mod-performance', 'mod-compliance-stress', 'mod-suitability-defense', 'mod-product-term', 'mod-product-iul', 'mod-product-fe', 'mod-product-annuity'],
    requiredAssessments: ['assess-call-framework', 'assess-disclosure', 'assess-compliance-stress', 'assess-suitability-defense', 'assess-product-term'],
    passingThreshold: 80,
    maxAttempts: 3,
    lockoutDuration: 48,
    expirationMonths: 12, // Annual recertification
    managerApprovalRequired: true,
    complianceReviewRequired: false
  },
  {
    id: 'cert-live-client',
    level: 'live_client',
    name: 'Live Client Authorization',
    description: 'Authorization to engage with live prospects. Requires client facilitation training, suitability analysis competency, and demonstrated compliance adherence.',
    prerequisites: ['cert-core-advisor'],
    requiredModules: ['mod-sales-needs', 'mod-sales-objections', 'mod-sales-closing'],
    requiredAssessments: ['assess-sales-needs', 'assess-mock-call-2'],
    passingThreshold: 85,
    maxAttempts: 2,
    lockoutDuration: 168, // 1 week
    expirationMonths: 6, // Semi-annual review
    managerApprovalRequired: true,
    complianceReviewRequired: true
  },
  {
    id: 'cert-state-il',
    level: 'state_expansion',
    name: 'Illinois State Authorization',
    description: 'Authorization to sell in Illinois. Covers state-specific regulations and requirements.',
    prerequisites: ['cert-live-client'],
    requiredModules: ['mod-state-il'],
    requiredAssessments: ['assess-state-il'],
    passingThreshold: 90,
    maxAttempts: 2,
    lockoutDuration: 72,
    expirationMonths: 12,
    managerApprovalRequired: false,
    complianceReviewRequired: false
  },
  {
    id: 'cert-annual-compliance',
    level: 'ongoing_compliance',
    name: 'Annual Compliance Recertification',
    description: 'Required annual certification covering regulatory updates, AML, and ethics.',
    prerequisites: ['cert-live-client'],
    requiredModules: ['mod-aml-annual', 'mod-ethics-annual', 'mod-regulatory-update'],
    requiredAssessments: ['assess-annual-compliance'],
    passingThreshold: 90,
    maxAttempts: 2,
    lockoutDuration: 0, // Immediate suspension if failed twice
    expirationMonths: 12,
    managerApprovalRequired: false,
    complianceReviewRequired: true
  }
];

// ============================================================================
// MODULE CONTENT STRUCTURE
// ============================================================================

export type ModuleType =
  | 'video'
  | 'reading'
  | 'interactive'
  | 'assessment'
  | 'mock_call'
  | 'documentation';

export type ModuleCategory =
  | 'onboarding'             // Getting started & orientation
  | 'doctrine'               // Institutional philosophy
  | 'compliance'             // Regulatory requirements
  | 'methodology'            // Education-first approach
  | 'product'                // Product knowledge
  | 'client_facilitation'    // Recommendation & client decision facilitation (formerly "sales")
  | 'state_specific'         // State regulations
  | 'ongoing';               // Continuing education

export interface ModuleSection {
  id: string;
  title: string;
  content: string;
  duration: number;        // Minutes
  videoPlaceholder?: string; // Placeholder for video content
  keyPoints: string[];
  complianceNotes?: string[];
}

export interface TrainingModuleData {
  id: string;
  code: string;           // e.g., "GCF-101"
  title: string;
  subtitle: string;
  description: string;
  category: ModuleCategory;
  type: ModuleType;
  certificationLevel: CertificationLevel;
  duration: number;       // Total minutes
  sections: ModuleSection[];
  learningObjectives: string[];
  requiredForCertification: string[];  // Certification IDs
  prerequisiteModules: string[];
  assessmentRequired: boolean;
  assessmentId?: string;
  version: string;
  lastUpdated: string;
  complianceApprovalDate: string;
  documentationRequirements?: string[];
}

// ============================================================================
// CORE TRAINING MODULES - WORD FOR WORD CONTENT
// ============================================================================

export const INSTITUTIONAL_MODULES: TrainingModuleData[] = [
  // =========================================================================
  // ONBOARDING MODULES (Level 0: Pre-Access)
  // =========================================================================

  // -------------------------------------------------------------------------
  // ONBOARDING 1: WELCOME TO GOLD COAST FINANCIAL
  // -------------------------------------------------------------------------
  {
    id: 'mod-welcome',
    code: 'GCF-001',
    title: 'Welcome to Gold Coast Financial',
    subtitle: 'Your Journey Begins Here',
    description: 'Introduction to Gold Coast Financial, our mission, and what to expect in your first days. This orientation sets the foundation for your career with us.',
    category: 'onboarding',
    type: 'reading',
    certificationLevel: 'pre_access',
    duration: 10,
    sections: [
      {
        id: 'sec-welcome-1',
        title: 'About Gold Coast Financial',
        duration: 4,
        videoPlaceholder: 'VIDEO: CEO Welcome Message',
        content: `Welcome to Gold Coast Financial. We are pleased you have chosen to begin your career with an organization that takes professional standards seriously.

WHAT WE DO:

Gold Coast Financial is a national insurance marketing organization (IMO) specializing in life insurance and annuity products for middle-market American families. We partner with top-rated insurance carriers to provide our clients access to products that protect their financial futures.

OUR MISSION:

To provide education-first financial guidance that helps families make informed decisions about life insurance and retirement protection. We believe every family deserves access to professional advice, not just the wealthy.

OUR HISTORY:

Founded with a commitment to doing things differently, Gold Coast Financial was built on the belief that the insurance industry needed organizations that prioritized client education over sales pressure. We have grown to become one of the most respected IMOs in the nation by adhering to this philosophy.

WHAT MAKES US DIFFERENT:

• Education-First Approach: We educate clients to make informed decisions, not pressure sales
• Institutional Standards: We operate like a regulated financial institution, not a sales floor
• Compliance Culture: We view compliance as enabling, not restricting, our business
• Advisor Development: We invest heavily in training and professional development
• Client-Centric: Our metrics focus on client outcomes, not just production volume`,
        keyPoints: [
          'National IMO specializing in life insurance and annuities',
          'Education-first philosophy distinguishes us from competitors',
          'Institutional standards and compliance culture',
          'Focus on middle-market American families'
        ]
      },
      {
        id: 'sec-welcome-2',
        title: 'Your First Week',
        duration: 3,
        content: `Your first week at Gold Coast Financial is designed to give you a solid foundation before any client contact.

DAY 1-2: ORIENTATION & ACCESS
• Complete HR paperwork and benefits enrollment
• Receive system access credentials
• Complete this Welcome module
• Meet your supervising manager
• Review your training schedule

DAY 3-5: PRE-ACCESS CERTIFICATION
• Complete all Pre-Access training modules
• Take required assessments
• Obtain system access upon certification

WEEK 2 AND BEYOND:
• Begin Core Advisor certification training
• Shadow experienced advisors (listen-only)
• Practice with mock scenarios
• Build product knowledge

IMPORTANT: You will NOT have client contact until you complete Pre-Access Certification. This is not optional—it is a compliance requirement. Attempting to contact clients before certification is grounds for immediate termination.

YOUR SUPPORT SYSTEM:

• Supervising Manager: Your primary point of contact for questions
• Training Coordinator: Manages your training schedule and progress
• Compliance Team: Available for compliance questions
• IT Support: Technical assistance for systems and tools
• Peer Mentors: Experienced advisors assigned to help new advisors`,
        keyPoints: [
          'Pre-Access Certification required before any client contact',
          'Structured training schedule with clear milestones',
          'Multiple support resources available',
          'No shortcuts—certification before client contact is mandatory'
        ]
      },
      {
        id: 'sec-welcome-3',
        title: 'Culture & Expectations',
        duration: 3,
        content: `Understanding our culture will help you succeed at Gold Coast Financial.

WHAT WE VALUE:

Integrity Over Income
We do the right thing even when it costs us money. If a product isn't suitable, we don't sell it—period. Your long-term success depends on building trust, not maximizing short-term commissions.

Education Over Pressure
We teach clients to make informed decisions. We don't use high-pressure tactics, artificial urgency, or emotional manipulation. These approaches may work short-term but destroy trust and generate complaints.

Quality Over Quantity
We measure success through persistency, client comprehension, and clean compliance records—not just production volume. An advisor with moderate volume and excellent quality is more valuable than high volume with complaints.

Teamwork Over Competition
While compensation is individual, we succeed or fail together. Helping colleagues succeed makes everyone better. We share knowledge, provide mentorship, and build each other up.

WHAT WE EXPECT:

• Complete all required training on time
• Follow established processes without shortcuts
• Document everything within required timeframes
• Report concerns through proper channels
• Represent the Gold Coast Financial brand professionally
• Treat clients, colleagues, and carriers with respect

WHAT YOU CAN EXPECT FROM US:

• Clear expectations and honest feedback
• Investment in your professional development
• Support when you face challenges
• Fair treatment based on objective metrics
• A workplace free from harassment and retaliation`,
        keyPoints: [
          'Integrity, education, quality, and teamwork are core values',
          'Clear expectations for advisor conduct',
          'Commitment to your development and fair treatment',
          'Culture of mutual respect and support'
        ]
      }
    ],
    learningObjectives: [
      'Understand Gold Coast Financial mission and values',
      'Know what to expect in your first week',
      'Recognize cultural expectations and values',
      'Identify your support resources'
    ],
    requiredForCertification: ['cert-pre-access'],
    prerequisiteModules: [],
    assessmentRequired: false,
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // ONBOARDING 2: SETTING UP YOUR BUSINESS
  // -------------------------------------------------------------------------
  {
    id: 'mod-business-setup',
    code: 'GCF-002',
    title: 'Setting Up Your Business',
    subtitle: 'Licensing, Appointments, and Administrative Essentials',
    description: 'Everything you need to know about licensing requirements, carrier appointments, and the administrative foundations of your business.',
    category: 'onboarding',
    type: 'reading',
    certificationLevel: 'pre_access',
    duration: 15,
    sections: [
      {
        id: 'sec-setup-1',
        title: 'Licensing Requirements',
        duration: 5,
        content: `Your insurance license is the foundation of your ability to do business. Maintaining it is non-negotiable.

STATE LICENSING BASICS:

Life insurance is regulated at the state level. To sell insurance in any state, you must:
1. Pass that state's licensing exam
2. Complete required pre-licensing education
3. Submit a license application with background check
4. Maintain the license with continuing education

RESIDENT VS. NON-RESIDENT:

• Resident License: Your home state license, required first
• Non-Resident License: Licenses in other states where you wish to sell

Gold Coast Financial primarily operates in [specific states]. You will be licensed in your resident state plus any additional states as business needs dictate.

CONTINUING EDUCATION:

Each state requires ongoing education to maintain your license:
• Typically 24 hours per 2-year cycle
• Must include ethics hours (usually 3 hours)
• Must be completed BEFORE license renewal date
• Failure to complete CE on time results in license lapse

LICENSE LAPSES:

If your license lapses:
• You may NOT contact clients or sell insurance
• You may NOT receive commissions on new business
• You must complete reinstatement requirements
• Extended lapses may require re-examination

Gold Coast Financial tracks your CE requirements and will notify you of upcoming deadlines. However, YOU are ultimately responsible for your license status.`,
        keyPoints: [
          'License required in each state where you sell',
          'Continuing education required to maintain license',
          'License lapse = cannot sell, cannot earn commissions',
          'Your responsibility to maintain license status'
        ]
      },
      {
        id: 'sec-setup-2',
        title: 'Carrier Appointments',
        duration: 5,
        content: `Beyond state licensing, you need carrier appointments to sell specific products.

WHAT IS AN APPOINTMENT:

An appointment is authorization from an insurance carrier to sell their products. You must be both:
1. Licensed in the state (state requirement)
2. Appointed with the carrier (carrier requirement)

APPOINTMENT PROCESS:

1. Complete carrier's contracting paperwork
2. Pass carrier's product training (if required)
3. Background check by carrier
4. Appointment issued (usually 1-2 weeks)

GOLD COAST FINANCIAL CARRIERS:

We partner with top-rated carriers including:
• [Carrier names - for products like Term, Whole Life, IUL, Annuities]

You will begin with appointments at our core carriers. Additional appointments are added as you demonstrate competency.

MAINTAINING APPOINTMENTS:

Carriers can terminate appointments for:
• Compliance violations
• Excessive complaints
• Production requirements not met
• E&O insurance lapse
• License lapse

Losing carrier appointments affects your ability to place business and may result in termination from Gold Coast Financial if the cause was compliance-related.

E&O INSURANCE:

Errors & Omissions insurance protects you from claims of professional negligence:
• Required by most carriers
• Required by Gold Coast Financial
• Must maintain continuous coverage
• Gold Coast Financial provides group E&O coverage`,
        keyPoints: [
          'License + appointment required to sell any product',
          'Appointments require contracting and may require training',
          'Carriers can terminate appointments for cause',
          'E&O insurance is mandatory'
        ]
      },
      {
        id: 'sec-setup-3',
        title: 'Administrative Essentials',
        duration: 5,
        content: `Administrative organization is essential to compliance and efficiency.

REQUIRED SYSTEMS:

1. CRM (Customer Relationship Management)
   • All client information stored here
   • All interactions documented here
   • Do NOT use personal systems for client data

2. Email
   • Use only your Gold Coast Financial email for business
   • Personal email may NOT be used for client communications
   • All emails are retained for compliance

3. Phone
   • Use approved phone systems for client calls
   • Calls may be recorded for quality and compliance
   • Document all calls in CRM

4. Document Storage
   • Client documents stored in approved systems only
   • No local storage of sensitive client data
   • Follow information security protocols

DAILY DISCIPLINES:

• Check CRM for follow-up tasks each morning
• Document all client interactions same-day (within 24 hours max)
• Respond to client inquiries within 24 hours
• Complete assigned training on schedule
• Review email and communications regularly

TIME MANAGEMENT:

Your time is divided between:
• Client consultations (income-producing)
• Training and development (skill-building)
• Administration (documentation, follow-up)
• Personal development (optional learning)

New advisors should expect 50%+ of time in training initially, transitioning to more client-facing time as certifications are completed.

COMPENSATION UNDERSTANDING:

• Commission-based on placed business
• Commission schedules provided in your agreement
• Commissions paid after policy is in-force
• Chargebacks may apply if policies lapse early
• Review your compensation agreement carefully`,
        keyPoints: [
          'Use only approved systems for client data',
          'Document all interactions within 24 hours',
          'New advisors spend significant time in training',
          'Understand your compensation structure'
        ]
      }
    ],
    learningObjectives: [
      'Understand licensing and continuing education requirements',
      'Know how carrier appointments work',
      'Use required administrative systems properly',
      'Manage time between training and client activities'
    ],
    requiredForCertification: ['cert-pre-access'],
    prerequisiteModules: ['mod-welcome'],
    assessmentRequired: false,
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // ONBOARDING 3: USING THE AGENT PORTAL
  // -------------------------------------------------------------------------
  {
    id: 'mod-portal',
    code: 'GCF-003',
    title: 'Using the Agent Portal',
    subtitle: 'Your Digital Workspace',
    description: 'Complete guide to the Gold Coast Financial Agent Portal, including navigation, key features, and daily workflows.',
    category: 'onboarding',
    type: 'interactive',
    certificationLevel: 'pre_access',
    duration: 12,
    sections: [
      {
        id: 'sec-portal-1',
        title: 'Portal Overview',
        duration: 4,
        videoPlaceholder: 'VIDEO: Agent Portal Tour',
        content: `The Agent Portal is your central hub for all Gold Coast Financial activities.

ACCESSING THE PORTAL:

• URL: portal.goldcoastfnl.com
• Login: Your Gold Coast Financial email
• Password: Set during onboarding (change regularly)
• Two-factor authentication required

MAIN NAVIGATION:

Dashboard
Your home screen showing:
• Today's tasks and follow-ups
• Training progress and deadlines
• Performance metrics
• Announcements and updates

Clients
• Client search and profiles
• Needs analysis forms
• Policy information
• Communication history

Training
• Training modules and progress
• Assessments
• Certification status
• Resources and guides

Reports
• Personal performance metrics
• Production reports
• Compliance status
• Commission statements

Support
• Help documentation
• IT support requests
• Compliance questions
• HR resources

MOBILE ACCESS:

The portal is mobile-responsive for on-the-go access. However, sensitive operations (applications, document signing) should be performed on secure desktop connections.`,
        keyPoints: [
          'Portal is your central hub for all activities',
          'Two-factor authentication required for security',
          'Main areas: Dashboard, Clients, Training, Reports, Support',
          'Mobile access available but use desktop for sensitive operations'
        ]
      },
      {
        id: 'sec-portal-2',
        title: 'Client Management',
        duration: 4,
        content: `The Clients section is where you manage all client relationships and documentation.

CLIENT PROFILES:

Each client has a profile containing:
• Contact information
• Family and beneficiary details
• Needs analysis documentation
• Policy information
• Communication history
• Notes and follow-up tasks

CREATING NEW CLIENTS:

1. Click "New Client" button
2. Enter required information (name, contact, state)
3. Complete initial needs analysis fields
4. Save profile before proceeding

Important: Create client profile BEFORE first substantive conversation.

DOCUMENTING INTERACTIONS:

Every client interaction must be documented:
1. Go to client profile
2. Click "Add Interaction"
3. Select type (call, email, meeting)
4. Enter date, time, duration
5. Document key details and outcomes
6. Set follow-up task if needed
7. Save within 24 hours of interaction

NEEDS ANALYSIS:

The Needs Analysis section captures:
• Client's current situation
• Coverage goals and concerns
• Financial information relevant to recommendation
• Health status (general)
• Notes on client priorities

Complete Needs Analysis is REQUIRED before any recommendation.

FOLLOW-UP TASKS:

Set specific follow-up tasks for each client:
• Use the task scheduler
• Set specific dates and times
• Include notes about purpose
• Tasks appear on your Dashboard`,
        keyPoints: [
          'Create client profile before substantive conversation',
          'Document every interaction within 24 hours',
          'Complete Needs Analysis required before recommendations',
          'Use task scheduler for follow-ups'
        ]
      },
      {
        id: 'sec-portal-3',
        title: 'Training & Resources',
        duration: 4,
        content: `The Training section tracks your certification progress and provides learning resources.

TRAINING DASHBOARD:

Your Training Dashboard shows:
• Current certification progress
• Required modules and deadlines
• Assessment status
• Upcoming recertifications

COMPLETING MODULES:

1. Click on assigned module
2. Read/watch all content
3. Complete section checkpoints
4. Take section quizzes (if required)
5. Mark module complete
6. Take assessment (if required)

ASSESSMENTS:

• Required for most certification modules
• Timed (see time limit before starting)
• Minimum passing score required
• Limited attempts (usually 3)
• Lockout period after max failures

Important: Complete modules thoroughly before attempting assessments. Rushing leads to failure.

RESOURCES LIBRARY:

Access supporting materials:
• Product guides
• Scripts and templates
• Compliance references
• Carrier materials
• State-specific information

TRAINING DEADLINES:

• Pre-Access: Must complete before system access
• Core Advisor: Must complete before client contact
• Ongoing: Deadlines shown in Training Dashboard

Missing training deadlines may result in:
• Suspension of client contact privileges
• Manager notification
• Remediation requirements

CERTIFICATES:

Download completion certificates from:
• Training section > Certificates
• Useful for personal records
• Required for some carrier appointments`,
        keyPoints: [
          'Track certification progress in Training Dashboard',
          'Complete modules thoroughly before assessments',
          'Resources library contains supporting materials',
          'Missing deadlines has consequences'
        ]
      }
    ],
    learningObjectives: [
      'Navigate the Agent Portal effectively',
      'Manage client profiles and documentation',
      'Track and complete training requirements',
      'Access resources and support'
    ],
    requiredForCertification: ['cert-pre-access'],
    prerequisiteModules: ['mod-welcome'],
    assessmentRequired: false,
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // =========================================================================
  // DOCTRINE MODULES (Level 0: Pre-Access)
  // =========================================================================

  // -------------------------------------------------------------------------
  // MODULE 1: ROLE OF A GOLD COAST FINANCIAL ADVISOR
  // -------------------------------------------------------------------------
  {
    id: 'mod-role',
    code: 'GCF-101',
    title: 'Role of a Gold Coast Financial Advisor',
    subtitle: 'Understanding Your Institutional Responsibility',
    description: 'Defines the professional identity, ethical obligations, and institutional expectations of a Gold Coast Financial Advisor. This is not a motivational overview—it is a binding professional standard.',
    category: 'doctrine',
    type: 'reading',
    certificationLevel: 'pre_access',
    duration: 45,
    prerequisiteModules: ['mod-welcome', 'mod-business-setup', 'mod-portal'],
    sections: [
      {
        id: 'sec-role-1',
        title: 'Institutional Identity',
        duration: 10,
        content: `As a Gold Coast Financial Advisor, you are not a salesperson. You are not a closer. You are not working for yourself.

You are a licensed fiduciary-in-practice representing a regulated financial institution. Every interaction you have, every recommendation you make, and every document you sign reflects on Gold Coast Financial's license, reputation, and regulatory standing.

This means:
• Your personal sales goals are secondary to client suitability
• Your income is a byproduct of proper client service, not the objective
• Your compliance with institutional standards is non-negotiable
• Your behavior is subject to audit, review, and enforcement at any time

Gold Coast Financial operates under the supervision of state insurance departments in every jurisdiction where we conduct business. A single compliance failure by a single advisor can result in:
• Regulatory investigation of the entire organization
• Carrier contract termination affecting all advisors
• Financial penalties in the millions of dollars
• Loss of license for the offending advisor AND potential liability for supervisors

You are not an independent contractor in spirit—even if your tax status says otherwise. You operate under institutional authority, and that authority comes with institutional accountability.`,
        keyPoints: [
          'You represent the institution, not yourself',
          'Compliance failures affect the entire organization',
          'Personal sales goals are secondary to suitability',
          'All activities are subject to audit and review'
        ],
        complianceNotes: [
          'All advisors must acknowledge this doctrine in writing before system access',
          'Violations may result in immediate suspension pending review'
        ]
      },
      {
        id: 'sec-role-2',
        title: 'Professional Obligations',
        duration: 15,
        content: `Your professional obligations as a Gold Coast Financial Advisor include, but are not limited to:

1. SUITABILITY DETERMINATION
Every recommendation must be demonstrably suitable for the specific client based on documented needs analysis. "They agreed to buy it" is not suitability. You must be able to articulate WHY the product is appropriate for THIS client's situation.

2. FULL DISCLOSURE
Clients must understand what they are buying, what it costs, what it does NOT cover, and what alternatives exist. Omission of material information is treated as seriously as misrepresentation.

3. DOCUMENTATION
If it isn't documented, it didn't happen. Every client interaction, needs analysis, recommendation rationale, and disclosure must be recorded in approved systems within 24 hours.

4. CONTINUING EDUCATION
Your license requires ongoing education. Your employment requires ongoing certification. Letting either lapse results in immediate suspension of client contact privileges.

5. ESCALATION OF CONCERNS
If you observe potential compliance violations—by yourself, peers, or leadership—you are obligated to report. Gold Coast Financial maintains anonymous reporting channels and prohibits retaliation. Failure to report known violations is itself a violation.

6. PROFESSIONAL CONDUCT
• No disparagement of competitors
• No pressure tactics or artificial urgency
• No misrepresentation of credentials or experience
• No unauthorized use of client information
• No side agreements or off-book arrangements`,
        keyPoints: [
          'Suitability must be documented, not assumed',
          'Full disclosure includes what products do NOT cover',
          'Documentation within 24 hours is mandatory',
          'Escalation of concerns is required, not optional'
        ]
      },
      {
        id: 'sec-role-3',
        title: 'What We Are NOT',
        duration: 10,
        content: `To be clear about what Gold Coast Financial is NOT:

WE ARE NOT A SALES ORGANIZATION
We do not have "sales meetings." We have advisor development sessions. We do not celebrate "closes." We recognize proper client service. We do not track "dials." We measure client engagement quality.

WE ARE NOT A LEAD MILL
We do not purchase bulk leads and pressure agents to convert them. Our client acquisition is based on inbound interest, referrals, and educational content marketing. If you came here expecting a lead firehose and commission-only pressure, you are in the wrong organization.

WE ARE NOT COMMISSION-MAXIMIZERS
We do not sell products based on commission rates. If a lower-commission product is more suitable for a client, that is what we recommend—period. Any advisor found to be steering clients toward higher-commission products without documented suitability justification will be terminated.

WE ARE NOT A STARTUP
We operate with the processes, controls, and oversight of a regulated financial institution. We have compliance officers, not "culture managers." We have documentation requirements, not "suggested best practices." We have enforcement mechanisms, not "feedback loops."

WE ARE NOT YOUR PERSONAL PLATFORM
You may not use Gold Coast Financial resources, client lists, or brand recognition to build a personal following, promote side businesses, or establish yourself as an independent "thought leader" in ways that conflict with institutional messaging.`,
        keyPoints: [
          'This is not a sales organization—it is a regulated institution',
          'Commission maximization is grounds for termination',
          'Institutional standards are mandatory, not suggested',
          'Personal brand-building using company resources is prohibited'
        ]
      },
      {
        id: 'sec-role-4',
        title: 'Accountability Structure',
        duration: 10,
        content: `Gold Coast Financial maintains a clear accountability structure:

REPORTING LINES
• All advisors report to a licensed supervising manager
• Supervising managers report to regional compliance officers
• Regional compliance reports to Chief Compliance Officer
• CCO reports to executive leadership and board

AUDIT & REVIEW
• Random call recordings reviewed weekly
• Client file audits conducted monthly
• Complaint tracking reviewed in real-time
• Annual comprehensive compliance audit

ENFORCEMENT MECHANISMS
• Verbal warning (documented)
• Written warning (personnel file)
• Mandatory remediation training
• Suspension pending investigation
• Termination with cause
• Regulatory referral if required by law

THERE IS NO "THREE STRIKES" RULE
Severity of response is proportional to severity of violation. A single serious compliance breach—such as forging a signature, misrepresenting policy terms, or unauthorized replacement—may result in immediate termination and regulatory referral.

REMEDIATION IS NOT PUNISHMENT
If you make a genuine mistake and self-report, remediation is designed to correct the behavior and return you to good standing. Advisors who proactively identify and correct errors are treated very differently from those whose violations are discovered through audits or complaints.`,
        keyPoints: [
          'Clear reporting and accountability structure',
          'Regular audits and reviews at all levels',
          'Enforcement is proportional to violation severity',
          'Self-reporting is treated favorably; concealment is not'
        ]
      }
    ],
    learningObjectives: [
      'Understand institutional identity and professional obligations',
      'Recognize what Gold Coast Financial is NOT',
      'Identify accountability structure and enforcement mechanisms',
      'Acknowledge personal responsibility within institutional framework'
    ],
    requiredForCertification: ['cert-pre-access'],
    assessmentRequired: false,
    version: '2.1',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10',
    documentationRequirements: [
      'Signed acknowledgment of institutional doctrine',
      'Completed pre-access certification quiz (85% minimum)'
    ]
  },

  // -------------------------------------------------------------------------
  // MODULE 2: EDUCATION-FIRST SALES PHILOSOPHY
  // -------------------------------------------------------------------------
  {
    id: 'mod-philosophy',
    code: 'GCF-102',
    title: 'Education-First Advisory Philosophy',
    subtitle: 'The Foundation of Sustainable Client Relationships',
    description: 'Establishes the education-first methodology that distinguishes Gold Coast Financial from transactional sales organizations. This philosophy is not optional—it is the operational standard.',
    category: 'doctrine',
    type: 'reading',
    certificationLevel: 'pre_access',
    duration: 40,
    sections: [
      {
        id: 'sec-phil-1',
        title: 'The Education-First Principle',
        duration: 12,
        content: `The education-first principle is simple:

IF A CLIENT DOES NOT UNDERSTAND WHAT THEY ARE BUYING, THEY SHOULD NOT BUY IT.

This is not a sales technique. It is not a "soft close." It is a compliance requirement and an ethical obligation.

A properly educated client:
• Understands the purpose of the coverage they are purchasing
• Can explain the basic mechanics of the product in their own words
• Knows what the policy does NOT cover
• Understands the premium structure and payment obligations
• Has had the opportunity to ask questions and receive clear answers
• Has been informed of alternatives and why this product was recommended

An improperly educated client:
• Was told what to buy without explanation of why
• Cannot articulate what their policy does
• Does not know the exclusions or limitations
• Was pressured by urgency tactics or emotional manipulation
• Did not have questions invited or adequately answered
• Was not informed of alternative products or approaches

THE COMPLIANCE TEST
If a regulator interviews your client six months after policy issuance and asks "Why did you buy this policy?", the client should be able to give a coherent answer that matches your documented needs analysis. If they cannot, you have failed the education-first standard.

THE PERSISTENCY TEST
Policies sold through education have dramatically higher persistency (staying in force) than policies sold through pressure. High lapse rates trigger carrier audits and suggest suitability problems. Education-first selling produces clients who understand their coverage and maintain it.`,
        keyPoints: [
          'Clients must understand what they are buying',
          'Education is a compliance requirement, not a technique',
          'Client should be able to explain their policy to a regulator',
          'Education-first produces higher persistency rates'
        ]
      },
      {
        id: 'sec-phil-2',
        title: 'Why Education Defeats Objections',
        duration: 10,
        content: `Traditional sales training teaches "objection handling"—techniques to overcome client resistance and close the sale.

Gold Coast Financial teaches education—ensuring clients have the information they need to make informed decisions.

THE DIFFERENCE:

OBJECTION HANDLING (What we do NOT do):
Client: "I need to think about it."
Traditional response: "What specifically do you need to think about? Let me address those concerns right now."
This is a pressure tactic designed to prevent the client from leaving the conversation.

EDUCATION-FIRST (What we DO):
Client: "I need to think about it."
Proper response: "Of course. Before we wrap up, let me make sure you have all the information you need. Do you understand the coverage amount and why we arrived at that figure? Do you have clarity on the premium and how it fits your budget? Is there any part of the policy structure that's unclear?"

The education-first response:
• Respects the client's decision-making process
• Ensures they have complete information
• Creates an opportunity for genuine clarification
• Does NOT pressure them to decide immediately

WHY THIS WORKS BETTER:

1. Clients who feel respected return. Clients who feel pressured do not.
2. Clients who understand their coverage keep their policies. Clients who bought under pressure cancel.
3. Clients who have positive experiences refer others. Clients who feel manipulated warn others.
4. Regulators who interview educated clients find no problems. Regulators who interview pressured clients find complaints.`,
        keyPoints: [
          'We do not use objection handling techniques',
          'Education replaces pressure tactics',
          'Respected clients return and refer; pressured clients cancel and complain',
          'This approach produces better business outcomes AND regulatory outcomes'
        ]
      },
      {
        id: 'sec-phil-3',
        title: 'The Sale That Should Not Happen',
        duration: 8,
        content: `There are sales that should not happen. Recognizing them is a professional obligation.

A SALE SHOULD NOT HAPPEN WHEN:

1. THE PRODUCT IS NOT SUITABLE
If the client's needs would be better served by a different product—even one we don't offer—we tell them. We do not force-fit our products onto unsuitable situations.

2. THE CLIENT CANNOT AFFORD IT
If the premium will cause financial hardship, we do not sell the policy. We either find a more affordable alternative or recommend they revisit coverage when their situation changes.

3. THE CLIENT DOES NOT UNDERSTAND IT
If after reasonable explanation the client still cannot articulate what they're buying and why, we do not proceed. We schedule follow-up education or recommend they consult with family members.

4. THE CLIENT IS BEING PRESSURED BY OTHERS
If someone other than the client (spouse, family member, etc.) is pressuring the purchase and the client seems reluctant, we pause and have a private conversation with the insured.

5. THERE ARE RED FLAGS
Unusual payment methods, inconsistent information, requests to misrepresent health history, or other concerning behaviors require escalation before proceeding.

WHAT HAPPENS WHEN YOU DECLINE A SALE:

You document the reason. You are protected. Gold Coast Financial will never discipline an advisor for declining a sale due to suitability, affordability, comprehension, or compliance concerns.

You WILL be disciplined for proceeding with a sale that should not have happened.`,
        keyPoints: [
          'Some sales should not happen—recognize them',
          'Unsuitable, unaffordable, or misunderstood purchases must be declined',
          'Document declined sales with reasoning',
          'You are protected for declining inappropriate sales; you are liable for proceeding with them'
        ]
      },
      {
        id: 'sec-phil-4',
        title: 'Measuring Success Correctly',
        duration: 10,
        content: `Gold Coast Financial does not measure advisor success by sales volume alone.

WHAT WE TRACK:

1. CLIENT COMPREHENSION SCORES
Post-sale surveys ask clients to rate their understanding of their coverage. Consistently low scores trigger review.

2. PERSISTENCY RATES
What percentage of your policies remain in force at 6 months? 12 months? 24 months? Low persistency indicates education or suitability problems.

3. COMPLAINT RATIO
Complaints per 100 policies issued. Elevated complaint ratios trigger immediate review.

4. DOCUMENTATION QUALITY
Random audits of client files assess completeness and accuracy of needs analysis, disclosures, and recommendations.

5. COMPLIANCE ADHERENCE
Did you complete all required training on time? Are your certifications current? Did you follow all procedural requirements?

WHAT WE DO NOT CELEBRATE:

• "Biggest month ever" (volume without context)
• "Record closes" (transactions without quality metrics)
• "Overcoming tough objections" (pressure tactics)
• "Getting them off the fence" (manufactured urgency)

WHAT WE RECOGNIZE:

• Consistent client satisfaction scores
• High persistency rates
• Clean compliance records
• Professional development achievements
• Referral generation (indicating client satisfaction)
• Mentorship of newer advisors`,
        keyPoints: [
          'Success is measured by quality metrics, not volume alone',
          'Persistency, complaints, and comprehension are tracked',
          'We do not celebrate pressure-based "wins"',
          'Recognition is based on sustainable, compliant performance'
        ]
      }
    ],
    learningObjectives: [
      'Internalize the education-first principle as operational standard',
      'Distinguish education from objection handling',
      'Identify sales that should not happen',
      'Understand how success is measured at Gold Coast Financial'
    ],
    requiredForCertification: ['cert-pre-access'],
    prerequisiteModules: ['mod-role'],
    assessmentRequired: true,
    assessmentId: 'assess-doctrine',
    version: '2.0',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10'
  },

  // -------------------------------------------------------------------------
  // MODULE 3: EDUCATION CALL FRAMEWORK
  // -------------------------------------------------------------------------
  {
    id: 'mod-education-call',
    code: 'GCF-201',
    title: 'Education Call Framework',
    subtitle: 'Structured Methodology for Client Consultations',
    description: 'The standardized framework for conducting client consultations. This is not a script to be read—it is a structure to be followed. Deviation from this framework requires documented justification.',
    category: 'methodology',
    type: 'interactive',
    certificationLevel: 'core_advisor',
    duration: 60,
    sections: [
      {
        id: 'sec-call-1',
        title: 'Phase 1: Opening & Consent',
        duration: 10,
        videoPlaceholder: 'VIDEO: Opening & Consent Demonstration',
        content: `Every client consultation begins with proper opening and consent. This is not optional.

REQUIRED ELEMENTS:

1. IDENTIFICATION
"Good [morning/afternoon], this is [Your Name], a licensed insurance advisor with Gold Coast Financial. Am I speaking with [Client Name]?"

2. PURPOSE STATEMENT
"I'm calling regarding [the information you requested / your recent inquiry / your scheduled consultation]. The purpose of this call is to understand your situation and provide you with educational information about life insurance options."

3. RECORDING DISCLOSURE (if applicable)
"For quality assurance and training purposes, this call may be recorded. Is that acceptable to you?"
[If no, proceed without recording but document that client declined recording]

4. TIME CONFIRMATION
"I expect this conversation will take approximately [15-30] minutes. Does that work with your schedule right now?"
[If not, reschedule rather than rushing]

5. PERMISSION TO PROCEED
"Before we begin, I want to be clear: my role is to educate you on your options. There's no pressure to make any decisions today. Do I have your permission to ask you some questions about your situation so I can provide relevant information?"

DOCUMENTATION REQUIREMENT:
Within 24 hours of the call, document in the CRM:
• Date and time of call
• Recording status (recorded/not recorded/client declined)
• Consent obtained (yes/no)
• If no consent, reason and next steps`,
        keyPoints: [
          'Identification, purpose, and consent are mandatory',
          'Recording disclosure required where applicable',
          'Confirm time availability before proceeding',
          'Document all opening elements within 24 hours'
        ]
      },
      {
        id: 'sec-call-2',
        title: 'Phase 2: Discovery & Needs Analysis',
        duration: 15,
        videoPlaceholder: 'VIDEO: Discovery Questions Demonstration',
        content: `The discovery phase determines whether we can help this client and what type of help is appropriate.

REQUIRED DISCOVERY AREAS:

1. CURRENT SITUATION
• Marital status and dependents
• Employment and income stability
• Current coverage (employer, individual, none)
• Assets and liabilities (mortgage, debts)

2. COVERAGE PURPOSE
"What is prompting you to look into life insurance at this time?"
Listen for: specific life events, general awareness, concern for family, financial planning goals

3. PROTECTION NEEDS
"If something happened to you tomorrow, who would be financially impacted?"
"What financial obligations would they need to cover?"
• Income replacement duration
• Debt payoff (mortgage, loans)
• Education funding
• Final expenses

4. BUDGET REALITY
"Do you have a monthly budget in mind for this coverage?"
Note: We do NOT lead with "how much can you afford?" to avoid selling to budget rather than need. We discover need first, then address affordability.

5. HEALTH STATUS (General)
"To provide accurate information, I need to understand your general health. Do you have any major health conditions I should be aware of?"
Note: This is for suitability assessment, not underwriting. Detailed health questions come during application.

DOCUMENTATION REQUIREMENT:
All discovery information must be recorded in the Needs Analysis section of the client file. Incomplete discovery is a compliance violation.`,
        keyPoints: [
          'Discovery determines if and how we can help',
          'Cover all required areas: situation, purpose, needs, budget, health',
          'Need-first, then affordability—not the reverse',
          'Complete documentation is mandatory'
        ]
      },
      {
        id: 'sec-call-3',
        title: 'Phase 3: Education & Explanation',
        duration: 15,
        videoPlaceholder: 'VIDEO: Product Education Demonstration',
        content: `Based on discovery, you now educate the client on relevant options.

EDUCATION REQUIREMENTS:

1. EXPLAIN THE PRODUCT TYPE
"Based on what you've shared, [term life / whole life / IUL] would address your needs. Let me explain how this type of coverage works..."

Provide:
• What it is (plain language)
• What it covers
• What it does NOT cover
• How the premium works
• Duration of coverage

2. EXPLAIN THE RECOMMENDATION
"For your situation, I'm recommending [$X] in coverage for [term/whole life] because..."

Connect EVERY recommendation element to discovered needs:
• "The coverage amount of [$X] is based on [mortgage payoff + income replacement + education fund]"
• "The term length of [20 years] aligns with [when your youngest will be financially independent]"

3. EXPLAIN ALTERNATIVES
"There are other approaches we could consider..."

You MUST mention alternatives when relevant:
• Lower coverage amounts (more affordable)
• Different term lengths (trade-offs)
• Different product types (when applicable)

4. EXPLAIN WHAT HAPPENS NEXT
"If you decide to move forward, here's the process..."
• Application (what's involved)
• Underwriting (timeline, potential outcomes)
• Policy delivery (what to expect)

PROHIBITED PRACTICES:
• Presenting only one option without alternatives
• Failing to explain what the policy does NOT cover
• Using jargon without explanation
• Rushing through explanations to reach the close`,
        keyPoints: [
          'Education must cover the product, the recommendation, and alternatives',
          'Every recommendation element connects to discovered needs',
          'Alternatives must be presented—not just the preferred option',
          'Rushing through education is a compliance violation'
        ]
      },
      {
        id: 'sec-call-4',
        title: 'Phase 4: Confirmation & Next Steps',
        duration: 10,
        videoPlaceholder: 'VIDEO: Confirmation & Next Steps',
        content: `Before concluding, confirm understanding and establish next steps.

CONFIRMATION REQUIREMENTS:

1. COMPREHENSION CHECK
"Before we continue, I want to make sure everything is clear. Can you tell me in your own words what this coverage would do for your family?"

Listen for:
• Accurate understanding of coverage amount purpose
• Correct understanding of premium and duration
• Awareness of exclusions/limitations

If comprehension is lacking:
• Re-explain the unclear elements
• Use different language or examples
• Do NOT proceed to application until comprehension is confirmed

2. QUESTIONS INVITED
"What questions do you have about anything we've discussed?"
Allow silence. Do not rush. Client questions indicate engagement and areas needing clarification.

3. DECISION RESPECT
"Based on everything we've discussed, would you like to move forward with an application today, or would you prefer time to consider this decision?"

Acceptable responses to "I need time":
• "Of course. What additional information would be helpful for your decision?"
• "I understand. Let's schedule a follow-up call for [specific date/time]."

Unacceptable responses:
• "What's holding you back?"
• "If you don't act now..."
• "What would it take to get you started today?"

4. NEXT STEPS (whatever they are)
• If proceeding: explain application process
• If not proceeding: schedule specific follow-up
• In all cases: provide contact information for questions`,
        keyPoints: [
          'Confirm comprehension before proceeding',
          'Invite and fully address all questions',
          'Respect the decision—whether yes, no, or not yet',
          'Establish specific next steps in all cases'
        ]
      },
      {
        id: 'sec-call-5',
        title: 'Phase 5: Documentation',
        duration: 10,
        content: `Documentation is not optional. It is not "when you have time." It is a mandatory compliance requirement.

DOCUMENTATION TIMELINE:
All client interactions must be documented within 24 hours. Period.

REQUIRED DOCUMENTATION ELEMENTS:

1. CALL LOG
• Date, time, duration
• Recording status
• Participants

2. DISCOVERY SUMMARY
• All needs analysis information collected
• Client's stated purpose for coverage
• Financial situation relevant to recommendation

3. RECOMMENDATION RECORD
• Product recommended
• Coverage amount and rationale
• Term/type and rationale
• Alternatives discussed

4. DISCLOSURES PROVIDED
• What was disclosed
• Client acknowledgment of disclosures
• Any questions asked about disclosures

5. OUTCOME
• Client decision (proceed/defer/decline)
• Next steps scheduled
• Follow-up requirements

6. ADVISOR ATTESTATION
You are attesting that this documentation accurately reflects the conversation. Falsification of client records is grounds for immediate termination and regulatory referral.

DOCUMENTATION QUALITY STANDARDS:
• Clear, factual language
• No editorializing or opinion
• Complete sentences
• Specificity (avoid vague terms like "discussed options")
• Contemporaneous (documented while memory is fresh)`,
        keyPoints: [
          '24-hour documentation requirement is non-negotiable',
          'All required elements must be captured',
          'Documentation is your legal and compliance protection',
          'Falsification results in termination and regulatory referral'
        ]
      }
    ],
    learningObjectives: [
      'Execute the five-phase education call framework',
      'Document client interactions within required timeframes',
      'Confirm client comprehension before proceeding',
      'Properly handle all client decision outcomes'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-role', 'mod-philosophy'],
    assessmentRequired: true,
    assessmentId: 'assess-call-framework',
    version: '3.0',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10'
  },

  // -------------------------------------------------------------------------
  // MODULE 4: COMPLIANCE & DISCLOSURE TRAINING
  // -------------------------------------------------------------------------
  {
    id: 'mod-disclosure',
    code: 'GCF-202',
    title: 'Compliance & Disclosure Requirements',
    subtitle: 'Mandatory Regulatory and Institutional Standards',
    description: 'Comprehensive training on disclosure requirements, prohibited practices, and compliance obligations. Understanding these requirements is not optional—demonstrating them is a condition of employment.',
    category: 'compliance',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 55,
    sections: [
      {
        id: 'sec-disc-1',
        title: 'Required Disclosures',
        duration: 15,
        content: `Every client interaction requires specific disclosures. Failure to provide required disclosures is a compliance violation.

MANDATORY DISCLOSURES:

1. ADVISOR STATUS DISCLOSURE
• Your name and license status
• That you are an insurance agent/advisor
• The name of the company you represent
• That you may receive compensation for sales

"I am [Name], a licensed life insurance advisor with Gold Coast Financial. I'm compensated through commissions on policies I place."

2. PRODUCT TYPE DISCLOSURE
• Whether the product is term, whole life, universal life, etc.
• Key features of the product type
• Key limitations of the product type

3. COST DISCLOSURE
• Premium amount
• Frequency of payment
• How long premiums are due
• Consequences of non-payment

4. BENEFIT DISCLOSURE
• Death benefit amount
• Conditions under which benefit is payable
• Conditions under which benefit is NOT payable (exclusions)
• Any waiting periods or graded benefit provisions

5. REPLACEMENT DISCLOSURE (when applicable)
• If replacing existing coverage, specific replacement disclosure forms required
• Must explain potential disadvantages of replacement
• Client must sign acknowledgment of replacement

6. ILLUSTRATION DISCLOSURE (for cash value products)
• Illustrations are not guarantees
• Actual performance may differ from illustrated values
• Assumptions underlying illustrations

STATE-SPECIFIC DISCLOSURES:
Many states have additional disclosure requirements. Before selling in any state, you must complete state-specific training and know that state's requirements.`,
        keyPoints: [
          'All required disclosures must be provided—no exceptions',
          'Document that disclosures were provided',
          'Replacement transactions have additional requirements',
          'State-specific requirements vary—know them before selling'
        ],
        complianceNotes: [
          'Disclosure failures are audited and tracked',
          'Pattern of disclosure failures results in suspension'
        ]
      },
      {
        id: 'sec-disc-2',
        title: 'Prohibited Practices',
        duration: 15,
        content: `The following practices are prohibited without exception. Engaging in any prohibited practice is grounds for termination and may result in regulatory action.

ABSOLUTELY PROHIBITED:

1. MISREPRESENTATION
• Stating false information about any policy
• Exaggerating benefits
• Minimizing limitations
• Misrepresenting your credentials or experience
• Misrepresenting company financial strength or ratings

2. OMISSION OF MATERIAL INFORMATION
• Failing to disclose exclusions
• Failing to disclose premium increases (if applicable)
• Failing to disclose surrender charges
• Failing to disclose contestability periods
• Failing to disclose waiting periods

3. TWISTING & CHURNING
• Inducing a client to replace existing coverage primarily for commission
• Encouraging policy replacements that do not benefit the client
• Frequent replacement of policies without documented benefit to client

4. UNFAIR DISCRIMINATION
• Refusing coverage based on protected class
• Charging different rates based on protected class (beyond actuarially justified)
• Treating clients differently based on protected characteristics

5. REBATING (in most states)
• Returning portion of commission to client
• Providing valuable gifts as inducement
• Offering unauthorized discounts

6. FORGERY & FRAUD
• Signing on behalf of client without proper authorization
• Altering documents after signing
• Submitting false information to carriers
• Misrepresenting health status on applications

7. PRESSURE TACTICS
• Artificial urgency ("rates go up tomorrow")
• Emotional manipulation
• Refusing to let client end call
• Threatening negative consequences for not buying
• Excessive follow-up bordering on harassment

8. UNAUTHORIZED PRACTICE
• Selling in states where not licensed
• Selling products not appointed for
• Providing legal or tax advice beyond general information`,
        keyPoints: [
          'Prohibited practices result in termination',
          'Many also trigger regulatory action and potential prosecution',
          'Ignorance is not a defense',
          'When in doubt, escalate to compliance before acting'
        ],
        complianceNotes: [
          'Report suspected violations through compliance hotline',
          'Retaliation against reporters is prohibited',
          'Self-reporting of violations is treated more favorably than discovered violations'
        ]
      },
      {
        id: 'sec-disc-3',
        title: 'Suitability Standards',
        duration: 15,
        content: `Every recommendation must be suitable for the specific client. Suitability is not a suggestion—it is a regulatory requirement.

SUITABILITY FACTORS TO DOCUMENT:

1. FINANCIAL SITUATION
• Income and stability of income
• Existing assets and coverage
• Outstanding debts and obligations
• Ability to pay premiums without hardship

2. INSURANCE NEEDS
• Dependents and their needs
• Coverage purpose (income replacement, debt payoff, estate planning, etc.)
• Duration of need
• Existing coverage (to avoid over-insurance)

3. RISK TOLERANCE (for cash value products)
• Understanding of market-linked products
• Comfort with illustrated vs. guaranteed values
• Time horizon for accessing cash values

4. TAX SITUATION (for IUL/estate planning)
• General tax bracket awareness
• Estate planning objectives
• Need for tax-advantaged accumulation

SUITABILITY DOCUMENTATION STANDARD:
You must be able to demonstrate, in writing, why the recommended product is appropriate for this specific client's documented situation.

"The client wanted it" is NOT suitability documentation.
"They could afford the premium" is NOT suitability documentation.

Proper suitability documentation looks like:
"Client has $300,000 mortgage and two children ages 5 and 8. Spouse does not work. Client requested coverage to ensure mortgage payoff and 10 years of income replacement if deceased. Recommended $500,000 20-year term policy based on: $300,000 mortgage + $200,000 (approx. 10 years income replacement at $20K/year living expenses after mortgage). 20-year term aligns with youngest child reaching adulthood. Premium of $XX/month fits stated budget of $XX-$XX."`,
        keyPoints: [
          'Suitability must be documented, not assumed',
          'Documentation must connect recommendation to client needs',
          '"They wanted it" is not suitability',
          'Suitability files are audited—incomplete files are violations'
        ]
      },
      {
        id: 'sec-disc-4',
        title: 'Record Retention Requirements',
        duration: 10,
        content: `All client records must be retained for regulatory and institutional requirements.

RETENTION PERIODS:

1. CLIENT FILES
• Minimum 7 years from policy termination or denial
• Includes all applications, correspondence, needs analysis, disclosures

2. CALL RECORDINGS (where applicable)
• Minimum 3 years from date of call
• Longer if related to open complaint or investigation

3. EMAIL COMMUNICATIONS
• All client-related emails automatically retained
• Do NOT delete client communications
• Do NOT use personal email for client communications

4. COMPLAINT FILES
• Indefinite retention for formal complaints
• Minimum 7 years for informal complaints

WHAT MUST BE RETAINED:
• Initial contact records
• Needs analysis documentation
• Product recommendations and rationale
• All disclosures provided
• Application documents
• Underwriting correspondence
• Policy delivery records
• All subsequent client communications
• Complaint records (if any)

ACCESS TO RECORDS:
Compliance may access any client record at any time without notice. You do not have exclusive ownership of client files—they belong to the institution.

RECORD INTEGRITY:
• Never delete client records
• Never alter records after-the-fact
• Never backdate entries
• Corrections must be made as addenda with dates noted`,
        keyPoints: [
          'Minimum 7-year retention for most records',
          'Never delete or alter client records',
          'All records belong to the institution',
          'Compliance has unrestricted access'
        ]
      }
    ],
    learningObjectives: [
      'Provide all required disclosures in client interactions',
      'Identify and avoid prohibited practices',
      'Document suitability for every recommendation',
      'Maintain proper record retention practices'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-role', 'mod-philosophy'],
    assessmentRequired: true,
    assessmentId: 'assess-disclosure',
    version: '2.5',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10',
    documentationRequirements: [
      'Signed compliance acknowledgment',
      'Disclosure quiz (85% minimum)',
      'Suitability documentation exercise'
    ]
  },

  // -------------------------------------------------------------------------
  // MODULE 5: HANDLING "NO" AND "NOT NOW"
  // -------------------------------------------------------------------------
  {
    id: 'mod-handling-no',
    code: 'GCF-203',
    title: 'Handling "No" and "Not Now"',
    subtitle: 'Professional Response to Client Decisions',
    description: 'How to professionally and compliantly respond when clients decline or defer. This replaces traditional "objection handling" with education-first alternatives.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 35,
    sections: [
      {
        id: 'sec-no-1',
        title: 'Reframing "Objections"',
        duration: 8,
        content: `Traditional sales training treats client hesitation as "objections" to be "overcome." This framing is fundamentally incompatible with Gold Coast Financial's education-first philosophy.

THE TRADITIONAL VIEW (WHAT WE REJECT):
• Client hesitation is an obstacle to the sale
• Objections must be "handled" or "overcome"
• Success is getting to "yes" despite resistance
• Techniques exist to counter every objection

THE EDUCATION-FIRST VIEW (OUR STANDARD):
• Client hesitation often indicates incomplete education
• Questions and concerns are opportunities for clarification
• Success is a fully informed client making a genuine decision
• Our role is to educate, not to overcome

REFRAMING COMMON "OBJECTIONS":

"I need to think about it"
→ Traditional: An obstacle to overcome with urgency tactics
→ Education-first: A reasonable request for processing time, and an opportunity to ensure full understanding

"It's too expensive"
→ Traditional: A pricing objection to counter with value propositions
→ Education-first: Possibly a genuine budget constraint requiring alternative solutions

"I need to talk to my spouse"
→ Traditional: A stall tactic to be circumvented
→ Education-first: A responsible decision-making process to be respected

"I already have coverage"
→ Traditional: A barrier to replacement selling
→ Education-first: Information to incorporate into needs analysis

THE KEY DIFFERENCE:
Education-first responses respect the client's autonomy and decision-making process. We do not view "no" or "not now" as problems to solve—we view them as outcomes to respect while ensuring full client education.`,
        keyPoints: [
          'Client hesitation is not an "obstacle"',
          'We educate—we do not overcome',
          '"No" and "not now" are legitimate outcomes',
          'Respect client autonomy and decision-making'
        ]
      },
      {
        id: 'sec-no-2',
        title: 'Responding to "I Need to Think About It"',
        duration: 8,
        content: `"I need to think about it" is the most common client response when not ready to proceed. Here is the proper handling:

STEP 1: ACKNOWLEDGE AND VALIDATE
"That's completely reasonable. This is an important decision and you should take the time you need."

Note what we do NOT say:
• "What specifically do you need to think about?" (pressure)
• "Rates could increase if you wait." (manufactured urgency)
• "What would it take to move forward today?" (closing attempt)

STEP 2: ENSURE COMPLETE INFORMATION
"Before we wrap up, I want to make sure you have all the information you need for your decision. Do you understand the coverage amount and why we arrived at that figure?"

Walk through key elements:
• Coverage amount rationale
• Premium and duration
• What the policy does and does not cover
• The application process if they decide to proceed

STEP 3: INVITE QUESTIONS
"What questions do you have that I can address before we end our call?"

If they have questions, answer them thoroughly.
If they have no questions, accept that.

STEP 4: SCHEDULE FOLLOW-UP
"When would be a good time for me to check back in with you?"

Get a specific date and time, not "I'll call you." Document the follow-up commitment.

STEP 5: PROVIDE CONTACT INFORMATION
"In the meantime, here's my direct contact information if any questions come up. I'm happy to help whenever you're ready."

DOCUMENTATION:
Document the call outcome as "Client deferred decision - follow-up scheduled for [date]." Note any specific concerns or questions the client mentioned for the follow-up.`,
        keyPoints: [
          'Acknowledge and validate the request for time',
          'Ensure client has complete information',
          'Schedule specific follow-up (not vague "I\'ll call you")',
          'Document everything for continuity'
        ]
      },
      {
        id: 'sec-no-3',
        title: 'Responding to "It\'s Too Expensive"',
        duration: 8,
        content: `When a client expresses price concerns, we do not argue value or use reframing tricks. We address the genuine concern.

STEP 1: ACKNOWLEDGE THE CONCERN
"I understand. Budget matters, and this needs to fit your financial situation."

STEP 2: EXPLORE THE REALITY
"Help me understand—is the premium itself the concern, or is there something else about the overall cost?"

This distinguishes between:
• Genuine affordability issues (premium doesn't fit budget)
• Value perception issues (client doesn't see worth)
• Priority issues (other financial priorities compete)

STEP 3: OFFER ALTERNATIVES
If affordability is genuine:
"Let's look at some alternatives. We could:
• Reduce the coverage amount to [$X], which would bring the premium down to [$Y]
• Consider a shorter term length
• Look at a different product type that might be more affordable

Which of these would you like to explore?"

If value perception is the issue:
"Let me make sure I've explained the purpose clearly. You mentioned your family would need [specific need]. This coverage addresses that by [specific benefit]. Does that connect with what you're trying to accomplish?"

STEP 4: ACCEPT THE OUTCOME
If after alternatives the client still declines:
"I understand. If your situation changes or you'd like to revisit this in the future, I'm here to help."

WHAT WE DO NOT DO:
• "It's just the cost of a cup of coffee per day" (manipulative reframing)
• "Can you really put a price on your family's security?" (emotional manipulation)
• "What if something happened tomorrow?" (fear tactics)
• "Let me see if I can find something cheaper" (implies initial recommendation was overpriced)`,
        keyPoints: [
          'Explore whether concern is affordability, value, or priority',
          'Offer genuine alternatives when affordability is the issue',
          'Do NOT use manipulation tactics (coffee analogy, fear, etc.)',
          'Accept the outcome professionally'
        ]
      },
      {
        id: 'sec-no-4',
        title: 'Responding to "No, I\'m Not Interested"',
        duration: 6,
        content: `When a client gives a clear "no," we respect it. Period.

ACCEPTABLE RESPONSE:
"I understand. Thank you for your time today. If your situation changes or you have questions in the future, please don't hesitate to reach out. May I send you my contact information for reference?"

THEN END THE CALL.

WHAT WE DO NOT DO:
• Continue pitching after a clear no
• Ask "what would change your mind?"
• Express disappointment or frustration
• Call back the next day with a "different approach"
• Add them to aggressive follow-up sequences

DOCUMENTATION:
Document the call outcome as "Client declined - not interested." Do NOT editorialize with phrases like "will try again later" or "seemed unsure."

FOLLOW-UP POLICY:
After a clear "no":
• One follow-up email thanking them for their time (optional)
• Client remains in database but flagged as declined
• No further outreach unless client re-initiates contact
• If lead source was purchased, mark appropriately for future reference

THE BUSINESS CASE FOR ACCEPTING "NO":
• Clients who are harassed after declining file complaints
• Complaints trigger carrier and regulatory review
• Reputation damage affects referral generation
• Professional conduct builds long-term trust in the market

Accepting "no" gracefully is not losing—it is protecting the institution and your professional reputation.`,
        keyPoints: [
          '"No" means no—end the conversation professionally',
          'No continued pitching, no expressions of disappointment',
          'One optional follow-up thank you, then no more outreach',
          'Accepting "no" protects reputation and prevents complaints'
        ]
      },
      {
        id: 'sec-no-5',
        title: 'Inappropriate Responses (What NOT to Do)',
        duration: 5,
        content: `The following responses to client hesitation are PROHIBITED:

PRESSURE TACTICS:
✗ "Rates are going up—you should act now."
✗ "I can only hold this rate until end of day."
✗ "If something happened tomorrow, could you live with your family being unprotected?"
✗ "What's stopping you from protecting your family today?"

MANIPULATION:
✗ "It's just the cost of two lattes per day."
✗ "You spend more than this on [cable/coffee/eating out]."
✗ "What's your family worth to you?"
✗ "Imagine your [spouse/children] having to [negative scenario]."

PERSISTENCE AFTER DECLINE:
✗ Calling back the same day with "one more thought"
✗ Sending multiple follow-up emails after a no
✗ Having a different agent call the same prospect
✗ Adding declined prospects to marketing campaigns

DISMISSING CONCERNS:
✗ "That's not really a problem because..."
✗ "Most people feel that way at first, but..."
✗ "Let me explain why that doesn't matter..."

CONSEQUENCES:
Use of prohibited responses is a compliance violation. Patterns of prohibited behavior result in:
• Mandatory remediation training
• Suspension of client contact privileges
• Termination for repeated violations
• Potential regulatory referral if client complaints result`,
        keyPoints: [
          'Pressure tactics are prohibited',
          'Manipulation techniques are prohibited',
          'Persistence after decline is prohibited',
          'Violations have real consequences'
        ],
        complianceNotes: [
          'Call recordings are reviewed for prohibited language',
          'Client complaints citing pressure result in immediate review'
        ]
      }
    ],
    learningObjectives: [
      'Distinguish education-first responses from traditional objection handling',
      'Properly respond to common client hesitations',
      'Accept "no" professionally and compliantly',
      'Identify and avoid prohibited response patterns'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-education-call'],
    assessmentRequired: true,
    assessmentId: 'assess-call-framework',
    version: '2.0',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10'
  },

  // -------------------------------------------------------------------------
  // MODULE 6: BRAND REPRESENTATION & PROFESSIONALISM
  // -------------------------------------------------------------------------
  {
    id: 'mod-brand',
    code: 'GCF-103',
    title: 'Brand Representation & Professionalism',
    subtitle: 'Institutional Standards for Professional Conduct',
    description: 'Standards for representing Gold Coast Financial in all professional interactions. The brand belongs to the institution, and its protection is non-negotiable.',
    category: 'doctrine',
    type: 'reading',
    certificationLevel: 'pre_access',
    duration: 30,
    sections: [
      {
        id: 'sec-brand-1',
        title: 'Brand Ownership',
        duration: 8,
        content: `The Gold Coast Financial brand belongs to the institution, not to individual advisors.

WHAT THIS MEANS:

1. CONSISTENT REPRESENTATION
Every advisor represents the same Gold Coast Financial. There is not "your" version of the company. Messaging, positioning, and professional conduct must be consistent across all advisors.

2. NO PERSONAL BRANDING CONFLICTS
You may not build a personal brand that conflicts with or supersedes Gold Coast Financial messaging. You are "[Name], Gold Coast Financial Advisor"—not "[Name], Insurance Expert who happens to work at Gold Coast Financial."

3. APPROVED MATERIALS ONLY
All client-facing materials, presentations, and communications must use approved Gold Coast Financial content. You may not create your own marketing materials, social media content representing the company, or client communications templates without approval.

4. NO SIDE BUSINESSES
While associated with Gold Coast Financial, you may not operate competing or conflicting side businesses in financial services. This includes:
• Independent insurance consulting
• Financial advisory services outside GCF
• Lead generation businesses
• Insurance-related content monetization

5. TRANSITION PROTOCOLS
If you leave Gold Coast Financial:
• Client relationships belong to the institution
• You may not solicit Gold Coast Financial clients
• You may not use GCF materials or methodologies
• Non-compete and non-solicitation terms apply per your agreement`,
        keyPoints: [
          'The brand belongs to the institution',
          'Consistent representation is required',
          'Approved materials only',
          'Client relationships belong to the institution'
        ]
      },
      {
        id: 'sec-brand-2',
        title: 'Communication Standards',
        duration: 10,
        content: `All communications representing Gold Coast Financial must meet institutional standards.

VERBAL COMMUNICATION:

1. Professional greeting identifying yourself and the company
2. Clear, accurate information without exaggeration
3. No pressure tactics or manufactured urgency
4. Respectful tone regardless of client response
5. Proper closure with next steps

WRITTEN COMMUNICATION:

1. Use approved email templates and signatures
2. Professional tone—no casual language, emojis, or unprofessional formatting
3. Accurate information only—never promise what cannot be delivered
4. Timely response (within 24 hours for client inquiries)
5. Proper grammar, spelling, and punctuation

SOCIAL MEDIA:

1. Do NOT represent Gold Coast Financial on personal social media without approval
2. Do NOT comment on insurance topics as a "GCF Advisor" without approval
3. Do NOT share client testimonials or case studies without compliance review
4. Do NOT engage in debates about insurance or financial topics that could reflect on GCF

PROHIBITED LANGUAGE:
• Guarantees of outcomes ("guaranteed approval")
• Superlatives ("best rates in the industry")
• Pressure language ("act now," "limited time")
• Disparagement of competitors
• Claims of unique access or special deals
• Unauthorized testimonials or success stories`,
        keyPoints: [
          'All communications must meet institutional standards',
          'Social media representation requires approval',
          'Prohibited language applies to all channels',
          'When in doubt, get approval before communicating'
        ]
      },
      {
        id: 'sec-brand-3',
        title: 'Professional Appearance & Conduct',
        duration: 7,
        content: `Professional appearance and conduct reflect on the institution.

VIDEO CALLS & IN-PERSON MEETINGS:

1. Professional attire appropriate to the setting
2. Professional background (no distracting or inappropriate backgrounds)
3. Quality audio and video equipment
4. Undivided attention (no multitasking during client calls)
5. Professional demeanor regardless of personal circumstances

OFFICE/REMOTE CONDUCT:

1. Maintain professional workspace
2. Protect client confidentiality (no visible client information in backgrounds)
3. Use approved technology and communication tools
4. Follow information security protocols
5. Report any security concerns or breaches immediately

INDUSTRY EVENTS:

1. Represent Gold Coast Financial professionally
2. Do not disparage competitors
3. Do not make commitments on behalf of the company without authority
4. Networking is acceptable; recruiting for personal ventures is not
5. Report any significant industry intelligence to appropriate internal parties

PERSONAL CONDUCT:

Your conduct outside of work can reflect on Gold Coast Financial if you are publicly identified as an advisor. Exercise judgment in:
• Social media activity
• Public statements about industry topics
• Financial dealings that could raise questions
• Legal matters that could affect your licensing`,
        keyPoints: [
          'Professional appearance in all client interactions',
          'Protect confidentiality in workspace setup',
          'Industry events require professional representation',
          'Personal conduct can reflect on the institution'
        ]
      },
      {
        id: 'sec-brand-4',
        title: 'Handling Negative Situations',
        duration: 5,
        content: `Negative situations—complaints, difficult clients, competitive encounters—must be handled professionally.

CLIENT COMPLAINTS:

1. Listen without defensiveness
2. Acknowledge the concern
3. Document the complaint accurately
4. Escalate per protocol
5. Do NOT promise resolutions you cannot deliver
6. Do NOT admit fault on behalf of the company
7. Do NOT engage in arguments

DIFFICULT CLIENTS:

1. Maintain professionalism regardless of client behavior
2. You may end a call if a client becomes abusive
3. Document any concerning interactions
4. Escalate threats or harassment immediately
5. Do NOT retaliate or engage unprofessionally

COMPETITOR QUESTIONS:

Clients may ask about competitors. Proper responses:
✓ "I can't speak to their specific offerings, but I can explain how Gold Coast Financial approaches this..."
✓ "I'd encourage you to ask them directly about their process. Here's how we handle it..."

Improper responses:
✗ "They're not as good as us because..."
✗ "I've heard bad things about them..."
✗ "Their agents don't have the training we do..."

MEDIA/PUBLIC INQUIRIES:

All media inquiries must be directed to the communications department. Do NOT:
• Give interviews without approval
• Comment on social media posts about the company
• Respond to online reviews without approval
• Engage with journalists or bloggers directly`,
        keyPoints: [
          'Handle complaints professionally—listen, acknowledge, escalate',
          'Do not disparage competitors',
          'Direct all media inquiries to communications',
          'Maintain professionalism regardless of circumstances'
        ]
      }
    ],
    learningObjectives: [
      'Understand institutional brand ownership',
      'Apply communication standards consistently',
      'Maintain professional appearance and conduct',
      'Handle negative situations appropriately'
    ],
    requiredForCertification: ['cert-pre-access'],
    prerequisiteModules: ['mod-role'],
    assessmentRequired: true,
    assessmentId: 'assess-brand',
    version: '1.5',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10'
  },

  // -------------------------------------------------------------------------
  // MODULE 7: PERFORMANCE MEASUREMENT
  // -------------------------------------------------------------------------
  {
    id: 'mod-performance',
    code: 'GCF-204',
    title: 'Performance Measurement',
    subtitle: 'What We Actually Track and Why',
    description: 'Understanding how Gold Coast Financial measures advisor performance, and why traditional sales metrics are insufficient.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-perf-1',
        title: 'Quality Over Volume',
        duration: 8,
        content: `Gold Coast Financial does not measure success by sales volume alone.

THE PROBLEM WITH VOLUME-ONLY METRICS:

Volume metrics (total premium, number of policies, etc.) tell you how much was sold, but not:
• Whether the sales were appropriate for the clients
• Whether clients understood what they purchased
• Whether clients will keep their policies
• Whether the advisor followed proper processes
• Whether the activity created compliance risk

An advisor with high volume and high complaints is not a top performer—they are a liability.
An advisor with moderate volume and excellent compliance is building sustainable business.

OUR APPROACH:

We track QUALITY METRICS alongside volume:
• Persistency (policies staying in force)
• Client comprehension scores
• Complaint ratios
• Documentation compliance
• Certification currency

We use COMPOSITE SCORING that weights:
• Activity levels (volume component)
• Quality indicators (persistency, comprehension)
• Compliance adherence (documentation, certifications)
• Professional development (training completion, mentorship)

No single metric determines standing. Advisors with outstanding volume but poor quality metrics are subject to review—not celebration.`,
        keyPoints: [
          'Volume alone does not equal success',
          'Quality metrics are tracked alongside volume',
          'Composite scoring weights multiple factors',
          'High volume with poor quality triggers review, not celebration'
        ]
      },
      {
        id: 'sec-perf-2',
        title: 'Key Performance Indicators',
        duration: 10,
        content: `The following KPIs are tracked for all advisors:

ACTIVITY METRICS (Leading Indicators):
• Client consultations conducted
• Applications submitted
• Follow-up completion rate
• Response time to inquiries

PRODUCTION METRICS (Results):
• Policies placed
• Premium volume
• Average policy size
• Product mix

QUALITY METRICS (Sustainability):
• 6-month persistency rate (policies still in force)
• 12-month persistency rate
• 24-month persistency rate
• Client comprehension survey scores
• Not-taken/cancelled application rate

COMPLIANCE METRICS (Risk):
• Documentation completion rate
• Documentation timeliness (within 24 hours)
• Certification currency
• Training completion rate
• Complaint ratio (complaints per 100 policies)

PROFESSIONAL DEVELOPMENT:
• Required training completion
• Optional training completion
• Certification advancement
• Mentorship participation (giving or receiving)

BENCHMARK STANDARDS:

Minimum Acceptable:
• 6-month persistency: 85%
• Documentation completion: 100%
• Documentation timeliness: 95%
• Certification currency: 100%
• Training completion: 100%

Target Performance:
• 6-month persistency: 90%+
• Client comprehension: 4.5/5.0+
• Zero valid complaints

Falling below minimum acceptable triggers:
• Performance improvement plan
• Additional supervision
• Restricted client contact (severe cases)`,
        keyPoints: [
          'Multiple KPI categories are tracked',
          'Quality and compliance metrics have minimum thresholds',
          'Falling below minimums triggers intervention',
          'Volume alone does not compensate for quality failures'
        ]
      },
      {
        id: 'sec-perf-3',
        title: 'Reviews & Consequences',
        duration: 7,
        content: `Performance is reviewed regularly with defined consequences.

REVIEW FREQUENCY:

• Monthly: Production and activity metrics reviewed by manager
• Quarterly: Full composite score review
• Annually: Comprehensive performance evaluation
• As needed: Triggered reviews based on complaints or red flags

PERFORMANCE TIERS:

Tier 1 - Exemplary:
• Exceeds all quality metrics
• Strong compliance record
• Active professional development
• Eligible for advancement opportunities

Tier 2 - Meeting Expectations:
• Meets minimum standards
• No significant compliance concerns
• Continuing normal operations

Tier 3 - Improvement Needed:
• One or more metrics below minimum
• Performance improvement plan required
• Enhanced supervision
• 90-day remediation period

Tier 4 - Unacceptable:
• Persistent metric failures after remediation
• Significant compliance violations
• Subject to suspension or termination

WHAT DOES NOT OVERRIDE POOR QUALITY:

• High production volume
• Long tenure with the company
• Personal relationships with leadership
• Promises to improve
• External market conditions

If quality metrics are failing, volume success does not protect you. We would rather have lower volume with sustainable quality than high volume with compliance risk and client harm.`,
        keyPoints: [
          'Regular reviews at multiple intervals',
          'Clear performance tiers with defined consequences',
          'Volume does not override quality failures',
          'Remediation opportunity before termination (except severe cases)'
        ]
      }
    ],
    learningObjectives: [
      'Understand quality-over-volume measurement philosophy',
      'Know the key performance indicators and benchmarks',
      'Understand the performance tier system',
      'Recognize that volume does not compensate for quality'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-philosophy'],
    assessmentRequired: false,
    version: '1.5',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10'
  },

  // -------------------------------------------------------------------------
  // COMPLIANCE INTRO MODULE
  // -------------------------------------------------------------------------
  {
    id: 'mod-compliance-intro',
    code: 'GCF-104',
    title: 'Compliance Fundamentals',
    subtitle: 'Introduction to Regulatory Requirements',
    description: 'Foundational compliance training required before any client-facing activity.',
    category: 'compliance',
    type: 'reading',
    certificationLevel: 'pre_access',
    duration: 35,
    sections: [
      {
        id: 'sec-comp-intro-1',
        title: 'Why Compliance Matters',
        duration: 10,
        content: `Compliance is not bureaucratic overhead—it is the foundation that enables our business to exist.

REGULATORY REALITY:

Life insurance is one of the most heavily regulated industries in the United States. Every state has an insurance department with the authority to:
• License and de-license advisors and companies
• Audit business practices
• Investigate complaints
• Impose fines and penalties
• Refer cases for criminal prosecution

Gold Coast Financial holds licenses in every state where we operate. A compliance failure by any advisor can trigger:
• State investigation of the entire organization
• Carrier contract termination
• E&O insurance complications
• Financial penalties
• Reputational damage

CARRIER REQUIREMENTS:

Beyond state regulation, insurance carriers have their own compliance requirements. We are contracted with carriers who trust us to:
• Submit accurate applications
• Follow proper sales practices
• Document suitability appropriately
• Handle client information securely

Carrier contracts can be terminated for compliance failures, affecting all advisors—not just the one who violated.

THE BUSINESS CASE:

Compliance is not the enemy of production. Compliance enables sustainable production by:
• Building trust with clients (fewer complaints)
• Building trust with carriers (better products and support)
• Building trust with regulators (favorable oversight)
• Protecting licenses (the ability to do business at all)

Short-term "wins" through compliance shortcuts create long-term risk that can end careers and damage the institution.`,
        keyPoints: [
          'Insurance is heavily regulated at state and federal levels',
          'Violations affect the entire organization, not just the individual',
          'Carrier relationships depend on compliance',
          'Compliance enables sustainable business, not restricts it'
        ]
      },
      {
        id: 'sec-comp-intro-2',
        title: 'Your Compliance Obligations',
        duration: 15,
        content: `As a Gold Coast Financial Advisor, you have specific compliance obligations:

1. MAINTAIN VALID LICENSING
• Keep your license(s) current in all states where you sell
• Complete required continuing education on time
• Report any changes in status immediately
• Never represent yourself as licensed where you are not

2. FOLLOW APPROVED PRACTICES
• Use only approved scripts, materials, and processes
• Do not deviate from the education call framework
• Do not make unauthorized promises or commitments
• Do not offer products you are not appointed to sell

3. DOCUMENT EVERYTHING
• Complete needs analysis documentation
• Record all disclosures provided
• Document all client interactions
• Maintain accurate client files
• Submit documentation within required timeframes

4. REPORT CONCERNS
• Report suspected compliance violations (yours or others')
• Report client complaints immediately
• Report any regulatory inquiries
• Report any suspicious activity
• Use established reporting channels

5. COMPLETE REQUIRED TRAINING
• Complete all assigned training by deadlines
• Maintain certification currency
• Participate in compliance updates
• Acknowledge policy changes

6. PROTECT CLIENT INFORMATION
• Follow data security protocols
• Do not share client information inappropriately
• Report any data breaches immediately
• Use only approved systems for client data

IGNORANCE IS NOT A DEFENSE:
You are responsible for knowing and following compliance requirements. "I didn't know" is not an acceptable response to violations.`,
        keyPoints: [
          'Maintain licensing and complete CE requirements',
          'Follow approved practices without deviation',
          'Document all client interactions appropriately',
          'Report concerns through proper channels',
          'Ignorance is not a defense'
        ]
      },
      {
        id: 'sec-comp-intro-3',
        title: 'Reporting & Escalation',
        duration: 10,
        content: `Gold Coast Financial maintains clear reporting channels for compliance concerns.

WHAT MUST BE REPORTED:

• Any known or suspected compliance violation
• Any client complaint (formal or informal)
• Any regulatory inquiry or contact
• Any suspicious activity (fraud indicators)
• Any data security incident
• Any threat or harassment
• Any conflict of interest

HOW TO REPORT:

1. Compliance Hotline: [Dedicated phone number]
   Available 24/7 for urgent concerns

2. Compliance Email: compliance@goldcoastfnl.com
   For non-urgent concerns or documentation

3. Your Direct Manager
   For operational questions and guidance

4. Anonymous Reporting Portal
   For concerns where you prefer anonymity

RETALIATION PROHIBITION:

Gold Coast Financial strictly prohibits retaliation against anyone who reports compliance concerns in good faith. If you experience retaliation, report it immediately to:
• Chief Compliance Officer
• Human Resources
• Anonymous reporting portal

Anyone found to have retaliated against a reporter will be terminated.

WHAT HAPPENS AFTER REPORTING:

1. Report is logged and assigned
2. Initial review within 24 hours
3. Investigation if warranted
4. Resolution and documentation
5. Follow-up with reporter (unless anonymous)

You may not be told specific outcomes involving other employees, but you will receive confirmation that your report was addressed.`,
        keyPoints: [
          'Multiple reporting channels are available',
          'Retaliation against reporters is prohibited',
          'Reports are investigated and documented',
          'Anonymous reporting is available when needed'
        ]
      }
    ],
    learningObjectives: [
      'Understand why compliance is essential to the business',
      'Know your specific compliance obligations',
      'Know how to report concerns appropriately',
      'Understand protections against retaliation'
    ],
    requiredForCertification: ['cert-pre-access'],
    prerequisiteModules: ['mod-role'],
    assessmentRequired: true,
    assessmentId: 'assess-compliance-basics',
    version: '2.0',
    lastUpdated: '2026-01-15',
    complianceApprovalDate: '2026-01-10'
  },

  // =========================================================================
  // ADVANCED COMPLIANCE MODULES (Level 1: Core Advisor)
  // Required BEFORE product knowledge access
  // =========================================================================

  // -------------------------------------------------------------------------
  // COMPLIANCE STRESS TEST & AUDIT SIMULATION
  // -------------------------------------------------------------------------
  {
    id: 'mod-compliance-stress',
    code: 'GCF-205',
    title: 'Compliance Stress Test & Audit Simulation',
    subtitle: 'Prove Your Compliance Readiness Under Pressure',
    description: 'Simulated audit scenarios and stress-testing your compliance knowledge. This is not a teaching module—it is a verification gate. You must demonstrate mastery before accessing product training.',
    category: 'compliance',
    type: 'interactive',
    certificationLevel: 'core_advisor',
    duration: 35,
    sections: [
      {
        id: 'sec-stress-1',
        title: 'Why This Module Exists',
        duration: 5,
        content: `This module exists because knowing compliance rules is not the same as applying them under pressure.

THE REALITY OF COMPLIANCE FAILURES:

Most compliance violations do not happen because advisors don't know the rules. They happen because:
• Pressure to close a sale overrides judgment
• Ambiguous situations don't seem clearly prohibited
• Small shortcuts compound into major violations
• Documentation gets deprioritized when busy

THIS MODULE TESTS YOUR ABILITY TO:

1. Recognize compliance issues in realistic scenarios
2. Make correct decisions when facing pressure
3. Document appropriately in complex situations
4. Identify the "gray areas" that require caution

THIS IS A GATE, NOT A LESSON:

You have already completed Compliance Fundamentals (GCF-104). This module assumes you know the rules. Here, we test whether you can apply them when:
• A client wants to proceed quickly
• A premium deadline is approaching
• A situation doesn't fit neatly into guidelines
• Your own income is on the line

PASSING REQUIREMENTS:

• Minimum 90% score on scenario assessments
• No "critical failure" responses (auto-fail questions)
• Completion time under maximum (no looking things up)
• Must pass before accessing ANY product training`,
        keyPoints: [
          'This tests application of compliance knowledge, not memorization',
          'Scenarios simulate real pressure situations',
          'Critical failures result in automatic module failure',
          'Product training access requires passing this module'
        ]
      },
      {
        id: 'sec-stress-2',
        title: 'Audit Simulation Scenarios',
        duration: 15,
        videoPlaceholder: 'INTERACTIVE: Audit Scenario Simulations',
        content: `You will be presented with simulated audit scenarios. Each requires you to identify compliance issues and make decisions.

SCENARIO TYPE 1: DOCUMENTATION REVIEW

An auditor reviews your client file. They identify:
• Client signed application on 3/15
• CRM notes show call on 3/12 with "discussed coverage needs"
• No needs analysis documentation
• No disclosure confirmation checkbox

COMPLIANCE ISSUES:
❌ Needs analysis not documented (required within 24 hours)
❌ Disclosure confirmation not recorded
❌ Gap between discussion and signature unexplained

CORRECT RESPONSE: This file is deficient. Remediation required.

SCENARIO TYPE 2: CALL REVIEW

Recording reviewed of client conversation:
Client: "I need to think about it."
Advisor: "I understand, but rates go up on the 1st. If you sign today, you lock in this rate."

COMPLIANCE ISSUES:
❌ Implied urgency pressure tactic
❌ "Lock in rate" language suggests artificial scarcity
❌ Not respecting client's stated need to think

CORRECT RESPONSE: This language violates education-first standards. Written warning and remedial training required.

SCENARIO TYPE 3: SUITABILITY CHALLENGE

Client profile: 62 years old, $35,000 annual income, no existing life insurance
Recommendation: $500,000 30-year term policy at $450/month

COMPLIANCE ISSUES:
❌ 30-year term ends at age 92 (likely past need period)
❌ Premium represents 15% of gross income (affordability concern)
❌ No documentation of why term vs. final expense
❌ Coverage amount not tied to documented needs

CORRECT RESPONSE: Suitability documentation insufficient. Sale should not proceed without remediation.

SELF-CHECK AFTER EACH SCENARIO:

Did you identify ALL issues?
Did you identify the CORRECT severity?
Did you recommend the APPROPRIATE response?`,
        keyPoints: [
          'Documentation deficiencies are compliance violations',
          'Language patterns reveal systemic issues',
          'Suitability requires complete documentation',
          'Multiple issues compound severity'
        ],
        complianceNotes: [
          'Actual audits are more thorough than these simulations',
          'Real consequences include fines, termination, and license action',
          'Patterns of issues result in escalated responses'
        ]
      },
      {
        id: 'sec-stress-3',
        title: 'Pressure Decision Scenarios',
        duration: 10,
        content: `These scenarios test your judgment when facing real-world pressure.

PRESSURE SCENARIO 1: END OF MONTH

It's the last day of the month. You need one more sale to hit your bonus tier. A client seems ready but says:
"I want to talk to my daughter first. Can I call you Monday?"

CORRECT RESPONSE:
"Of course. Family input on important decisions is always valuable. I'll call you Monday at [time]. Does that work?"

PROHIBITED RESPONSES:
❌ "If we submit today, I can guarantee this rate..."
❌ "The underwriting queue is backed up—starting Monday means delays..."
❌ "I completely understand, but let me just explain one more thing..."

YOUR BONUS IS NOT THE CLIENT'S PROBLEM.

PRESSURE SCENARIO 2: CLIENT DOESN'T UNDERSTAND

After a 45-minute explanation of IUL, the client says:
"So basically it's like investing in the stock market but safer?"

CORRECT RESPONSE:
"Not quite—let me clarify. With IUL, you're not invested in the market at all. Let me walk through exactly how the indexing works again. If after this it still doesn't feel clear, this may not be the right product for you."

PROHIBITED RESPONSES:
❌ "Essentially, yes—it gives you market-type returns with protection."
❌ "That's one way to look at it. The important thing is..."
❌ Proceeding with the sale despite evident confusion

COMPREHENSION IS A COMPLIANCE REQUIREMENT.

PRESSURE SCENARIO 3: UNCOOPERATIVE BENEFICIARY SITUATION

Client wants to name an ex-spouse as irrevocable beneficiary "to protect the kids." Current spouse is unaware.

CORRECT RESPONSE:
"I need to understand this situation better. Beneficiary designation is important. Are there court orders or agreements that require this arrangement? I may need to involve my compliance team."

PROHIBITED RESPONSES:
❌ Proceeding without understanding why
❌ Assuming the client's explanation is sufficient
❌ Avoiding questions to close the sale faster

WHEN SOMETHING FEELS WRONG, INVESTIGATE.`,
        keyPoints: [
          'Personal financial pressure never justifies compliance shortcuts',
          'Client comprehension is non-negotiable before proceeding',
          'Unusual situations require investigation, not avoidance',
          'The discomfort of asking questions is less than the consequence of violations'
        ]
      },
      {
        id: 'sec-stress-4',
        title: 'Documentation Under Time Pressure',
        duration: 5,
        content: `Proper documentation takes time. Skipping it is never acceptable.

THE TIME PRESSURE TRAP:

Common rationalization: "I'll document this later when I have time."

Reality:
• "Later" becomes "tomorrow" becomes "next week" becomes "never"
• Details fade from memory within hours
• Incomplete documentation is a compliance violation
• If it's not documented, it didn't happen (from audit perspective)

DOCUMENTATION REQUIREMENTS ARE NON-NEGOTIABLE:

Same-Day Requirements (within business hours):
• Client contact logged in CRM
• Key discussion points noted
• Any concerns or issues flagged
• Next steps documented

24-Hour Requirements:
• Complete needs analysis documentation
• Disclosure confirmations recorded
• Suitability rationale documented
• Application status updated

THE RIGHT SEQUENCE:

1. End client call
2. Document immediately (while details are fresh)
3. THEN take next call

NOT:
1. End client call
2. Take next call immediately (higher volume!)
3. Promise yourself to document later
4. Forget key details
5. Create compliance exposure

DOCUMENTATION QUALITY STANDARDS:

✓ Specific (not "discussed coverage needs" but "client expressed need for income replacement if death occurred—2 children ages 8 and 12")
✓ Objective (facts, not interpretations)
✓ Complete (all key points covered)
✓ Contemporaneous (created at time of interaction)

YOUR DOCUMENTATION PROTECTS:
• The client (ensures appropriate service)
• You (demonstrates compliance)
• The company (reduces liability)
• The industry (maintains standards)`,
        keyPoints: [
          'Documentation must be same-day for contacts, 24-hour for analysis',
          'Delayed documentation leads to incomplete records',
          'Quality matters—specific, objective, complete, timely',
          'Document before taking the next call'
        ]
      }
    ],
    learningObjectives: [
      'Identify compliance issues in realistic audit scenarios',
      'Make correct decisions under pressure situations',
      'Document appropriately within required timeframes',
      'Recognize situations requiring caution or escalation'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-philosophy', 'mod-education-call'],
    assessmentRequired: true,
    assessmentId: 'assess-compliance-stress',
    version: '1.0',
    lastUpdated: '2026-01-25',
    complianceApprovalDate: '2026-01-20',
    documentationRequirements: [
      'Must complete within single session (no breaks)',
      'Timed assessment simulates audit conditions',
      'Results permanently recorded in training file'
    ]
  },

  // -------------------------------------------------------------------------
  // SUITABILITY ANALYSIS & RECOMMENDATION DEFENSE
  // -------------------------------------------------------------------------
  {
    id: 'mod-suitability-defense',
    code: 'GCF-206',
    title: 'Suitability Analysis & Recommendation Defense',
    subtitle: 'Document Why, Not Just What',
    description: 'Advanced training on documenting suitability rationale that can withstand regulatory scrutiny. Every recommendation must be defensible.',
    category: 'compliance',
    type: 'interactive',
    certificationLevel: 'core_advisor',
    duration: 30,
    sections: [
      {
        id: 'sec-suit-1',
        title: 'The Suitability Standard',
        duration: 7,
        content: `Every product recommendation must be suitable for the specific client. This is both a regulatory requirement and an ethical obligation.

WHAT SUITABILITY MEANS:

A recommendation is suitable when:
1. The product addresses a documented client need
2. The product is appropriate for the client's financial situation
3. The client can afford the product without hardship
4. The client understands what they are purchasing
5. No better alternative exists for the specific situation

SUITABILITY IS NOT:

• "The client wanted it"
• "The client can afford the premium"
• "This is our best product"
• "Most people in this situation buy this"

THE DOCUMENTATION BURDEN:

You must document WHY the recommendation is suitable, including:
• What need is being addressed
• Why this product (vs. alternatives)
• Why this coverage amount
• Why this term/duration
• How affordability was assessed
• How comprehension was verified

IF YOU CANNOT DOCUMENT SUITABILITY, YOU CANNOT MAKE THE RECOMMENDATION.

THE REGULATORY PERSPECTIVE:

Regulators reviewing suitability look for:
• Documented needs assessment before recommendation
• Logical connection between needs and product
• Consideration of alternatives
• Affordability verification
• Comprehension confirmation

What they DO NOT accept:
• "Client requested this specific product"
• "Client has been with us for years"
• "Commission structure is the same either way"
• "Client seemed to understand"`,
        keyPoints: [
          'Suitability connects documented needs to specific recommendations',
          'Client desire alone is not suitability documentation',
          'Documentation must explain WHY, not just WHAT',
          'Inability to document suitability = inability to recommend'
        ]
      },
      {
        id: 'sec-suit-2',
        title: 'Building Defensible Recommendations',
        duration: 8,
        content: `A defensible recommendation can withstand scrutiny from regulators, carriers, or attorneys.

THE DEFENSIBILITY TEST:

For each recommendation, ask yourself:
"If I had to explain this recommendation to a regulator two years from now, with only my documentation to reference, would it be clear why this was appropriate?"

If not, your documentation is insufficient.

THE FIVE-ELEMENT DEFENSE:

1. DOCUMENTED NEED
"Client has mortgage of $380,000 remaining, two children ages 6 and 8, spouse works part-time earning $28,000/year. Expressed concern about family financial security if primary income lost."

Not: "Client needs life insurance."

2. PRODUCT SELECTION RATIONALE
"Recommended 20-year term to align with mortgage payoff timeline and children reaching independence. Client has adequate retirement savings and does not need permanent coverage or cash value accumulation."

Not: "Recommended term life."

3. COVERAGE AMOUNT CALCULATION
"Calculated coverage need: $380,000 (mortgage) + $150,000 (10 years income replacement at $15,000/year gap) + $50,000 (children's education fund) = $580,000. Rounded to $600,000."

Not: "Recommended $600,000."

4. AFFORDABILITY VERIFICATION
"Premium of $62/month represents 0.7% of household gross income ($8,500/month). Client confirmed this does not create financial strain and fits within existing budget."

Not: "Client agreed to premium."

5. COMPREHENSION CONFIRMATION
"Reviewed policy terms including 20-year level period, renewal at higher rates, no cash value, and exclusions. Client correctly explained these terms back and asked clarifying question about conversion option, which was answered."

Not: "Client understood."

WHEN DOCUMENTATION IS TESTED:

• Client complaint ("I didn't know it would expire")
• Regulatory audit (routine or triggered)
• Carrier review (claims, lapses, patterns)
• Legal action (beneficiary disputes, misrep claims)

Your documentation is your defense. Weak documentation = weak defense.`,
        keyPoints: [
          'Every recommendation must be defensible years later',
          'Five elements: need, product rationale, coverage calculation, affordability, comprehension',
          'Vague documentation provides no defense',
          'Document as if a regulator will read it'
        ]
      },
      {
        id: 'sec-suit-3',
        title: 'Common Suitability Failures',
        duration: 8,
        content: `Learn from common suitability failures to avoid them.

FAILURE 1: AFFORDABILITY IGNORED

Scenario: Senior client on fixed income of $2,400/month purchases IUL with $350/month premium.

Issues:
• Premium = 14.6% of gross income
• No documentation of budget review
• No documentation of why IUL vs. lower-cost term
• No documentation of how premiums will be sustained long-term

Result: Complaint filed after missed payments. Regulatory investigation. Advisor terminated.

FAILURE 2: NEED NOT DOCUMENTED

Scenario: 25-year-old single client with no dependents purchases $500,000 whole life policy.

Issues:
• No death benefit need documented (no dependents)
• Cash value need not established (other savings vehicles available)
• No documentation of why permanent vs. term
• Documentation shows only "client wanted whole life"

Result: Carrier suitability review. Sale reversed. Advisor placed on probation.

FAILURE 3: PRODUCT MISMATCH

Scenario: Client explicitly states need for 30-year coverage. Recommended 20-year term.

Issues:
• Documented need contradicts product recommendation
• No explanation of why shorter term was selected
• No documentation of alternatives presented

Result: Client later discovers coverage gap. Complaint filed. E&O claim.

FAILURE 4: COMPREHENSION NOT VERIFIED

Scenario: Complex IUL sold to client who speaks English as second language.

Issues:
• No documentation of how comprehension was verified
• Client later states "I thought it was like a savings account"
• Illustration-only explanation (no plain-language discussion)

Result: Regulatory action for unsuitable sale. Fine and required remediation.

THE PATTERN:

Every suitability failure involves:
• Missing documentation, OR
• Documentation that contradicts the sale, OR
• Documentation that is too vague to support the sale

Solution: Document thoroughly, accurately, and at the time of the interaction.`,
        keyPoints: [
          'Affordability failures disproportionately affect senior clients',
          'Need documentation must exist before product recommendation',
          'Product must match documented need',
          'Comprehension must be verified and documented for complex products'
        ],
        complianceNotes: [
          'These scenarios are based on real industry enforcement actions',
          'Consequences include termination, fines, and license action',
          'Patterns of unsuitable sales result in escalated enforcement'
        ]
      },
      {
        id: 'sec-suit-4',
        title: 'Suitability Documentation Framework',
        duration: 7,
        content: `Use this framework for every recommendation to ensure complete suitability documentation.

THE SUITABILITY DOCUMENTATION CHECKLIST:

Before making any recommendation, document:

□ CLIENT PROFILE COMPLETE
• Age, income, occupation
• Dependents and their ages
• Existing coverage (all sources)
• Major financial obligations
• Health status (as disclosed)
• Risk tolerance (for applicable products)

□ NEEDS ANALYSIS COMPLETE
• Primary protection need identified
• Secondary needs identified (if any)
• Need quantified with calculations
• Timeframe for need established
• Existing resources identified

□ PRODUCT RECOMMENDATION DOCUMENTED
• Specific product recommended
• Why this product type (term/perm/annuity)
• Why this carrier
• Why this coverage amount
• Why this term/duration
• Alternatives considered and why not selected

□ AFFORDABILITY VERIFIED
• Premium as percentage of income calculated
• Monthly budget reviewed
• Long-term sustainability assessed
• Client confirmed affordability verbally

□ COMPREHENSION CONFIRMED
• Key terms explained
• Limitations explained
• Exclusions explained
• Client explained product back in own words
• All questions answered

□ DISCLOSURES PROVIDED
• Compensation disclosure given
• Product-specific disclosures given
• Written materials provided
• Client acknowledged receipt

TIMING:

All documentation must be completed within 24 hours of the interaction. Recommendations should not be finalized until documentation is complete.

STORAGE:

All suitability documentation stored in:
• CRM client record (primary)
• Carrier submission system (where applicable)
• Do NOT store locally or in personal files`,
        keyPoints: [
          'Use checklist for every recommendation',
          'Complete documentation before finalizing recommendation',
          '24-hour documentation deadline is firm',
          'Storage in approved systems only'
        ]
      }
    ],
    learningObjectives: [
      'Apply suitability standards to every recommendation',
      'Build defensible documentation that withstands scrutiny',
      'Identify and avoid common suitability failures',
      'Use the suitability documentation framework consistently'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-disclosure', 'mod-compliance-stress'],
    assessmentRequired: true,
    assessmentId: 'assess-suitability-defense',
    version: '1.0',
    lastUpdated: '2026-01-25',
    complianceApprovalDate: '2026-01-20'
  },

  // =========================================================================
  // PRODUCT KNOWLEDGE MODULES (Level 1: Core Advisor)
  // Note: Product modules require completion of Advanced Compliance modules
  // =========================================================================

  // -------------------------------------------------------------------------
  // PRODUCT 1: TERM LIFE INSURANCE DEEP DIVE
  // -------------------------------------------------------------------------
  {
    id: 'mod-product-term',
    code: 'GCF-301',
    title: 'Term Life Insurance Deep Dive',
    subtitle: 'Understanding Temporary Protection',
    description: 'Comprehensive training on term life insurance products, their purpose, structure, and ideal client applications. This is product education, not sales training.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-term-1',
        title: 'What Is Term Life Insurance?',
        duration: 6,
        videoPlaceholder: 'VIDEO: Term Life Insurance Explained',
        content: `Term life insurance provides a death benefit for a specific period of time—the "term."

FUNDAMENTAL CONCEPT:

Term life is pure insurance protection. There is no savings component, no cash value accumulation, and no investment element. You are paying purely for the death benefit coverage during the specified term.

If you die during the term, your beneficiaries receive the death benefit.
If you outlive the term, the coverage ends and no benefit is paid.

This is not a flaw—it is the design. Term life serves a specific purpose: providing affordable protection during years when your death would cause financial hardship to dependents.

COMMON TERM LENGTHS:

• 10-Year Term: Shortest common term, lowest premiums, ideal for short-term needs
• 15-Year Term: Middle ground for medium-term obligations
• 20-Year Term: Most popular, covers child-rearing years for many families
• 25-Year Term: Extended coverage for longer obligations
• 30-Year Term: Maximum term length from most carriers

LEVEL vs. DECREASING TERM:

Level Term (most common):
• Death benefit stays the same throughout the term
• Premium stays the same throughout the term
• Recommended for most clients

Decreasing Term:
• Death benefit decreases over time
• Often used to match declining mortgage balances
• Lower premiums but less common in modern markets

RENEWABILITY:

Most term policies are renewable—you can continue coverage after the term ends without proving insurability. However:
• Premiums increase significantly at renewal (based on attained age)
• Renewal rates are often prohibitively expensive
• Renewability is a safety net, not a primary strategy`,
        keyPoints: [
          'Term life provides death benefit for a specific period only',
          'No cash value or savings component—pure protection',
          'Common terms: 10, 15, 20, 25, 30 years',
          'Renewable but at much higher premiums'
        ]
      },
      {
        id: 'sec-term-2',
        title: 'When Term Life Is Appropriate',
        duration: 6,
        content: `Term life insurance is appropriate for temporary protection needs. Understanding this is essential for suitability.

IDEAL USE CASES:

1. INCOME REPLACEMENT DURING WORKING YEARS
Client profile: Working parent with young children
Need: Replace income until children are independent
Term selection: 20-year term (aligns with children reaching adulthood)
Coverage amount: 10-12x annual income (rule of thumb)

2. MORTGAGE PROTECTION
Client profile: Homeowner with significant mortgage
Need: Pay off mortgage if death occurs
Term selection: Match to mortgage remaining term
Coverage amount: Mortgage balance

3. DEBT PROTECTION
Client profile: Client with significant debts (student loans, business loans)
Need: Prevent debt burden passing to family
Term selection: Match to expected debt payoff timeline
Coverage amount: Outstanding debt balances

4. BUSINESS OBLIGATIONS
Client profile: Business owner with partners or key employees
Need: Buy-sell agreement funding, key person coverage
Term selection: Match to business obligation period
Coverage amount: Per agreement or key person value

WHEN TERM IS NOT APPROPRIATE:

• Permanent protection needs (estate planning, final expenses)
• Cash value accumulation goals
• Legacy/inheritance planning
• When client cannot afford term premiums (no coverage is worse than no term)

THE TEMPORARY NATURE:

Term life is designed for needs that will eventually go away:
• Children grow up and become independent
• Mortgages get paid off
• Debts are retired
• Working years end

If a client's need will never go away (final expense, legacy), term is typically not the right product.`,
        keyPoints: [
          'Term is for temporary needs that will eventually end',
          'Common uses: income replacement, mortgage, debt protection',
          'Match term length to the duration of the need',
          'Not appropriate for permanent needs like final expenses'
        ],
        complianceNotes: [
          'Document why term length matches client need',
          'Document why term vs. permanent was recommended'
        ]
      },
      {
        id: 'sec-term-3',
        title: 'Underwriting & Pricing Factors',
        duration: 6,
        content: `Understanding underwriting helps you set proper client expectations and identify potential issues early.

FACTORS AFFECTING TERM LIFE PREMIUMS:

1. AGE
• Single biggest factor in pricing
• Premiums increase significantly with age
• Lock in rates while young and healthy

2. HEALTH STATUS
• Medical history reviewed thoroughly
• Current health conditions assessed
• Family health history considered
• May require medical exam or health records

3. TOBACCO USE
• Tobacco users pay 2-3x higher premiums
• Includes cigarettes, cigars, chewing tobacco
• Some carriers distinguish occasional cigar use
• Must be truthful—misrepresentation is fraud

4. COVERAGE AMOUNT
• Higher coverage = higher premium
• But not linear—$500K may not be 2x $250K

5. TERM LENGTH
• Longer terms = higher premiums
• 30-year term costs more than 10-year term

6. GENDER
• Women typically pay less than men (longer life expectancy)

7. OCCUPATION & HOBBIES
• High-risk occupations may increase rates or require exclusions
• Dangerous hobbies (skydiving, racing) may affect pricing

UNDERWRITING CLASSES:

• Preferred Plus/Elite: Best rates, excellent health
• Preferred: Very good rates, good health with minor issues
• Standard: Average rates, typical health
• Substandard/Table Rated: Higher rates due to health issues
• Decline: Cannot be insured due to health or other factors

NO-EXAM VS. FULLY UNDERWRITTEN:

No-Exam (Simplified Issue):
• Faster approval
• No medical exam required
• Higher premiums
• Lower maximum coverage amounts

Fully Underwritten:
• Medical exam required
• Lower premiums
• Higher coverage available
• Longer application process`,
        keyPoints: [
          'Age and health are primary pricing factors',
          'Tobacco use significantly increases premiums',
          'Underwriting class determines rate level',
          'No-exam is faster but more expensive'
        ]
      },
      {
        id: 'sec-term-4',
        title: 'Carriers & Product Comparison',
        duration: 4,
        videoPlaceholder: 'VIDEO: Carrier Comparison Overview',
        content: `Gold Coast Financial works with multiple carriers to provide best-fit options for clients.

OUR TERM LIFE CARRIERS:

[Carrier information would be inserted here with specific details about each carrier's term offerings, strengths, and ideal client profiles]

COMPARING TERM PRODUCTS:

When selecting a carrier, consider:

1. PRICING
• Run quotes across multiple carriers
• Best price varies by age, health, coverage amount
• Don't assume one carrier is always cheapest

2. CONVERSION PRIVILEGES
• Can the policy convert to permanent coverage?
• Until what age?
• To which permanent products?
• Without new underwriting?

3. RIDERS AVAILABLE
• Accelerated death benefit (terminal illness)
• Waiver of premium (disability)
• Child term rider
• Return of premium (rarely recommended)

4. CARRIER STRENGTH
• AM Best rating
• Financial stability
• Claims-paying history
• Customer service reputation

5. UNDERWRITING APPROACH
• Some carriers more favorable for certain conditions
• Know which carriers are best for specific health issues
• Field underwriting helps set expectations

EDUCATION-FIRST PRODUCT SELECTION:

We recommend products based on client needs, not commission rates. Document:
• Why this carrier for this client
• Why this term length
• Why this coverage amount
• Alternatives considered`,
        keyPoints: [
          'Multiple carriers provide options for different client profiles',
          'Compare pricing, conversion options, riders, and carrier strength',
          'Know which carriers favor specific health conditions',
          'Document product selection rationale'
        ]
      },
      {
        id: 'sec-term-5',
        title: 'Client Education Points',
        duration: 3,
        content: `When educating clients about term life, ensure they understand these key points:

WHAT THEY NEED TO KNOW:

1. "This coverage lasts for [X] years."
Make sure they understand the term ends. If they outlive it, coverage stops.

2. "If you die during the term, your beneficiary receives $[X]."
Clear on the benefit and who receives it.

3. "Your premium is $[X] per [month/year] and will not change during the term."
Confirm they understand the cost and that it's level.

4. "At the end of the term, you can renew but at a much higher premium, or you may be able to convert to permanent coverage."
Don't oversell conversion; explain it as an option.

5. "This policy does not build cash value."
Ensure they're not expecting savings or investment returns.

6. "The policy has a [X] day contestability period."
During which claims can be denied for material misrepresentation.

7. "There is typically a [2-year] suicide exclusion."
Standard provision in life insurance.

DISCLOSURES REQUIRED:

• This is term life insurance, not permanent coverage
• Coverage ends at the end of the term if not renewed or converted
• No cash value accumulates
• Premium will increase dramatically at renewal
• Policy may have exclusions (suicide, etc.)

QUESTIONS TO INVITE:

• "What questions do you have about how term life works?"
• "Is anything unclear about what the policy covers or doesn't cover?"
• "Do you understand what happens at the end of the [X]-year term?"

If a client cannot articulate basic understanding of these points, they are not ready to proceed.`,
        keyPoints: [
          'Clients must understand the term is temporary',
          'Clear on premium, benefit amount, and beneficiary',
          'Disclose no cash value and renewal premium increase',
          'Verify understanding before proceeding'
        ],
        complianceNotes: [
          'Document that all required disclosures were provided',
          'Document client comprehension of key terms'
        ]
      }
    ],
    learningObjectives: [
      'Explain term life insurance mechanics accurately',
      'Identify appropriate term life use cases',
      'Understand underwriting factors and pricing',
      'Educate clients on key term life features and limitations'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-philosophy', 'mod-disclosure', 'mod-suitability-defense'],
    assessmentRequired: true,
    assessmentId: 'assess-product-term',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // PRODUCT 2: INDEXED UNIVERSAL LIFE (IUL) FUNDAMENTALS
  // -------------------------------------------------------------------------
  {
    id: 'mod-product-iul',
    code: 'GCF-302',
    title: 'Indexed Universal Life (IUL) Fundamentals',
    subtitle: 'Understanding Cash Value Life Insurance',
    description: 'Comprehensive training on IUL products, their structure, benefits, limitations, and appropriate client applications. Extra disclosure requirements apply.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 30,
    sections: [
      {
        id: 'sec-iul-1',
        title: 'What Is Indexed Universal Life?',
        duration: 8,
        videoPlaceholder: 'VIDEO: IUL Mechanics Explained',
        content: `Indexed Universal Life (IUL) is a type of permanent life insurance with cash value accumulation linked to market index performance.

CORE CONCEPT:

IUL provides:
1. A death benefit (like all life insurance)
2. A cash value component that grows based on index performance
3. Flexibility in premium payments (within limits)
4. Access to cash value through loans and withdrawals

HOW THE INDEXING WORKS:

Your cash value growth is linked to an index (commonly S&P 500) BUT:
• You are NOT invested in the index
• You do NOT own stocks or participate directly in the market
• Your returns are CREDITED based on index performance, subject to caps and floors

KEY TERMS:

Cap Rate: Maximum return credited (e.g., 10% cap means even if index returns 20%, you get 10%)

Floor: Minimum return credited (typically 0%, meaning you don't lose money when market drops)

Participation Rate: Percentage of index gain credited (e.g., 80% participation means if index gains 10%, you're credited 8% before cap)

Spread/Margin: Amount subtracted from index gain before crediting

Segment/Term: Time period for calculating index returns (usually 1 year)

THE TRADEOFF:

In exchange for the floor protection (not losing money in down markets), you give up:
• Full upside participation (caps limit gains)
• Dividends (index gain only, not total return)
• Certainty (caps and participation rates can change)

IMPORTANT DISTINCTION:

IUL is NOT an investment. It is life insurance with a cash accumulation feature. Selling it as an investment alternative is a compliance violation and regulatory issue.`,
        keyPoints: [
          'IUL combines death benefit with index-linked cash value growth',
          'You are not invested in the market—returns are credited based on index',
          'Caps limit upside; floor protects against losses',
          'IUL is insurance, NOT an investment product'
        ],
        complianceNotes: [
          'Never position IUL as an investment or market alternative',
          'Always explain caps, floors, and participation rates',
          'Illustrations must include disclosure that values are not guaranteed'
        ]
      },
      {
        id: 'sec-iul-2',
        title: 'When IUL Is Appropriate',
        duration: 7,
        content: `IUL is a complex product appropriate for specific client situations. Suitability is critical.

APPROPRIATE USE CASES:

1. PERMANENT DEATH BENEFIT NEED + CASH ACCUMULATION INTEREST
Client profile: Higher-income individual who has maximized other retirement vehicles and seeks additional tax-advantaged accumulation
Need: Permanent coverage AND supplemental retirement strategy
Key factor: Can afford premiums for life, understands complexity

2. ESTATE PLANNING
Client profile: High-net-worth individual concerned about estate taxes
Need: Permanent death benefit to cover estate obligations
Key factor: Policy will remain in force at death

3. BUSINESS PLANNING
Client profile: Business owner needing key person coverage or buy-sell funding
Need: Permanent coverage with cash accumulation for business purposes
Key factor: Business can sustain premium payments long-term

WHEN IUL IS NOT APPROPRIATE:

1. TEMPORARY PROTECTION NEEDS
If client only needs coverage for 20-30 years, term is usually more appropriate and affordable.

2. BUDGET CONSTRAINTS
IUL premiums are significantly higher than term. If affording IUL means inadequate coverage amount, term is better.

3. CLIENT CANNOT UNDERSTAND THE PRODUCT
If after explanation the client doesn't grasp how IUL works, they should not purchase it.

4. "INVESTMENT" EXPECTATIONS
If client expects IUL to match stock market returns or replace their 401(k), they misunderstand the product.

5. SHORT TIME HORIZON
Cash value takes years to accumulate meaningfully. Surrender charges apply early years.

SUITABILITY RED FLAGS:

• Client wants maximum premium for "investment" purposes
• Client cannot explain how caps/floors work after explanation
• Client is purchasing primarily for cash value, not death benefit
• Client cannot afford term life at equivalent death benefit
• Client expects guaranteed illustrated values`,
        keyPoints: [
          'IUL is for permanent needs with cash accumulation interest',
          'Not appropriate for temporary needs or budget-constrained clients',
          'Client must understand the product before purchasing',
          'Never position as investment alternative'
        ],
        complianceNotes: [
          'Document suitability factors thoroughly for IUL sales',
          'Document that client understands product complexity',
          'Be cautious of clients focused primarily on cash value'
        ]
      },
      {
        id: 'sec-iul-3',
        title: 'Understanding Illustrations',
        duration: 8,
        content: `IUL illustrations are marketing tools, not guarantees. Understanding and explaining them properly is a compliance requirement.

WHAT AN ILLUSTRATION SHOWS:

• Projected death benefit over time
• Projected cash value accumulation
• Projected premiums (if flexible)
• Assumed interest crediting rate
• Policy charges and costs

WHAT AN ILLUSTRATION IS NOT:

• A guarantee of performance
• A contract
• A prediction of actual results
• A comparison to other investments

ILLUSTRATED VS. GUARANTEED:

Every illustration must show both:

Illustrated Column: What might happen if assumed crediting rate is achieved. This is NOT guaranteed.

Guaranteed Column: What happens at minimum guaranteed crediting rate (typically 0-2%). This IS the contractual minimum.

COMMON ILLUSTRATION ASSUMPTIONS:

• 6-7% illustrated rate (common current assumption)
• This is NOT the market return—it's the crediting rate after caps/floors
• Actual results will differ, potentially significantly

EXPLAINING ILLUSTRATIONS TO CLIENTS:

Required statements:
"This illustration shows what might happen, not what will happen."
"The guaranteed column shows the contractual minimum—actual results will be somewhere between guaranteed and illustrated."
"The interest rates shown are not guaranteed and will fluctuate."
"Caps, floors, and participation rates can change."

ILLUSTRATION COMPLIANCE:

• Use only carrier-approved illustration software
• Do not modify or create custom illustrations
• Provide client with complete illustration, not excerpts
• Obtain client signature on illustration acknowledgment
• Keep illustration in client file`,
        keyPoints: [
          'Illustrations are projections, not guarantees',
          'Always explain guaranteed vs. illustrated columns',
          'Clients must understand values are not guaranteed',
          'Obtain signature on illustration acknowledgment'
        ],
        complianceNotes: [
          'Illustration compliance is heavily regulated',
          'Never promise illustrated results will be achieved',
          'Document client understanding of illustration limitations'
        ]
      },
      {
        id: 'sec-iul-4',
        title: 'Costs, Charges & Risks',
        duration: 4,
        content: `IUL policies have internal costs that affect performance. Clients must understand these.

POLICY COSTS:

1. Cost of Insurance (COI)
• The actual insurance charge for death benefit
• Increases with age
• Deducted from cash value monthly
• Can consume cash value if underfunded

2. Policy Fees
• Flat monthly/annual administrative fee
• Typically $5-15/month

3. Premium Load
• Percentage deducted from premiums before crediting
• Typically 5-10% of premium

4. Surrender Charges
• Penalty for surrendering in early years
• Typically 10+ years duration
• Can be substantial percentage of cash value

5. Rider Costs
• Additional charges for optional riders
• Living benefit riders, etc.

RISKS TO EXPLAIN:

1. Underfunding Risk
If premiums are too low or cash value underperforms, COI charges can drain the policy.

2. Lapse Risk
Policy can lapse if cash value goes to zero—losing all coverage.

3. Cap/Rate Changes
Carriers can adjust caps and participation rates, reducing future crediting potential.

4. Early Surrender Loss
Surrendering in early years means losing to surrender charges.

5. Loan Interest
Policy loans accrue interest, reducing death benefit and cash value if not repaid.

THE FUNDING CONVERSATION:

IUL requires appropriate funding to work as designed. "Minimum" premium often leads to poor outcomes. This must be explained and documented.`,
        keyPoints: [
          'Multiple costs reduce cash value growth',
          'Underfunding risks policy lapse',
          'Surrender charges apply in early years',
          'Proper funding is essential for performance'
        ],
        complianceNotes: [
          'Explain all costs and charges',
          'Document funding strategy discussion',
          'Warn about underfunding risks'
        ]
      },
      {
        id: 'sec-iul-5',
        title: 'Client Education Checklist',
        duration: 3,
        content: `Before completing an IUL sale, ensure the client can demonstrate understanding of these points:

CLIENT MUST UNDERSTAND:

□ "This is life insurance, not an investment"
□ "Cash value growth is linked to an index but I don't own stocks"
□ "There is a cap on how much I can earn when markets go up"
□ "There is a floor that protects me when markets go down"
□ "The illustration shows projections, not guarantees"
□ "The guaranteed column shows the minimum scenario"
□ "I need to pay adequate premiums for the policy to perform"
□ "There are surrender charges if I cancel in early years"
□ "The policy can lapse if underfunded"
□ "Caps and participation rates can change"

QUESTIONS TO ASK:

"Can you explain to me how your cash value will grow in this policy?"
"What is a cap rate and how does it affect you?"
"What happens if the stock market goes down?"
"Why is this policy better for your situation than term life insurance?"
"What could happen if you stop paying premiums?"

IF CLIENT CANNOT ANSWER:

Do not proceed. Provide additional education or recommend they consult with a family member or trusted advisor before deciding.

DOCUMENTATION REQUIRED:

• Signed illustration with required disclosures
• Suitability documentation (why IUL vs. alternatives)
• Documentation of client's stated understanding
• Premium funding commitment
• Beneficiary designation`,
        keyPoints: [
          'Verify client understanding before proceeding',
          'Ask comprehension questions—don\'t assume understanding',
          'Do not proceed if client cannot articulate basics',
          'Thorough documentation is essential'
        ],
        complianceNotes: [
          'IUL sales receive higher compliance scrutiny',
          'Incomplete documentation is a serious violation',
          'When in doubt, do not proceed'
        ]
      }
    ],
    learningObjectives: [
      'Explain IUL mechanics including caps, floors, and indexing',
      'Identify appropriate and inappropriate IUL use cases',
      'Properly explain illustrations and their limitations',
      'Verify client understanding before completing IUL sales'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-product-term', 'mod-disclosure'],
    assessmentRequired: true,
    assessmentId: 'assess-product-iul',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // PRODUCT 3: FINAL EXPENSE INSURANCE MASTERY
  // -------------------------------------------------------------------------
  {
    id: 'mod-product-fe',
    code: 'GCF-303',
    title: 'Final Expense Insurance Mastery',
    subtitle: 'Affordable Protection for End-of-Life Costs',
    description: 'Training on final expense products, their target market, and appropriate positioning as dignity and legacy protection.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 20,
    sections: [
      {
        id: 'sec-fe-1',
        title: 'What Is Final Expense Insurance?',
        duration: 5,
        content: `Final expense insurance is a type of whole life insurance designed to cover end-of-life costs.

CORE CONCEPT:

Final expense (also called burial insurance or funeral insurance) provides:
• Smaller face amounts ($5,000 - $35,000 typical)
• Permanent coverage (lasts entire life if premiums paid)
• Fixed premiums that never increase
• Cash value accumulation (minimal)
• Simplified underwriting (health questions, no exam)

PURPOSE:

Final expense is designed to cover:
• Funeral and burial costs (average $10,000-15,000)
• Outstanding medical bills
• Minor debts
• Other end-of-life expenses

It is NOT designed to replace income or provide major estate liquidity.

TARGET MARKET:

• Seniors (50-85 typical age range)
• Fixed income (Social Security, pension)
• No existing coverage or coverage has lapsed
• Health issues that may preclude traditional underwriting
• Desire to not burden family with funeral costs

PRODUCT VARIATIONS:

Level Benefit (Immediate Coverage):
• Full death benefit from day one
• Requires meeting health requirements
• Lower premiums

Graded/Modified Benefit:
• Limited death benefit in first 2-3 years
• For clients with significant health issues
• Return of premium + interest if death in early years
• Full benefit after waiting period
• Higher premiums for same coverage

Guaranteed Issue:
• No health questions at all
• Everyone accepted
• 2-3 year waiting period for full benefit
• Highest premiums
• Last resort when other options unavailable`,
        keyPoints: [
          'Final expense covers end-of-life costs, not income replacement',
          'Smaller face amounts with simplified underwriting',
          'Permanent coverage with fixed premiums',
          'Level, graded, and guaranteed issue options available'
        ]
      },
      {
        id: 'sec-fe-2',
        title: 'Sensitive Client Conversations',
        duration: 5,
        content: `Final expense sales require sensitivity. You are discussing death and finances with seniors who may be vulnerable.

THE EMOTIONAL CONTEXT:

Clients considering final expense are confronting:
• Their own mortality
• Concern about burdening family
• Limited income and tough choices
• Possible cognitive decline
• Potential pressure from family members
• Past experiences with pushy salespeople

YOUR APPROACH:

DIGNITY AND RESPECT
These clients deserve the same professional treatment as high-net-worth clients. Treat them with respect, patience, and genuine care.

NO PRESSURE
Final expense seniors are particularly vulnerable to pressure tactics. Any hint of urgency, fear tactics, or manipulation is a serious compliance violation.

CLEAR COMMUNICATION
Speak clearly, avoid jargon, and confirm understanding. Many seniors have hearing difficulties or need extra time to process information.

PATIENCE
Allow time for questions. Don't rush. If they need to think about it, respect that completely.

WHAT NOT TO DO:

• Use scare tactics about death or burial costs
• Pressure about "rates going up" or "limited time"
• Confuse them with options they don't need
• Talk over them or interrupt
• Make assumptions about their understanding
• Rush through disclosures or paperwork

COGNITIVE CAPACITY:

If you suspect a client may have cognitive impairment:
• Do not proceed with the sale
• Suggest they involve a family member
• Document your observations
• Consult with compliance if unsure

Selling to cognitively impaired individuals is exploitation, not sales.`,
        keyPoints: [
          'Final expense clients deserve dignity and patience',
          'No pressure tactics—ever',
          'Clear, slow communication is essential',
          'Do not sell to cognitively impaired individuals'
        ],
        complianceNotes: [
          'Senior market complaints receive intensive regulatory scrutiny',
          'Document any concerns about client capacity',
          'When in doubt, do not proceed'
        ]
      },
      {
        id: 'sec-fe-3',
        title: 'Needs-Based Recommendations',
        duration: 5,
        content: `Final expense recommendations must be based on actual needs, not maximum affordable premium.

NEEDS DISCOVERY:

1. CURRENT COVERAGE
"Do you have any life insurance currently in place?"
Many seniors have small policies, employer coverage, or coverage through organizations.

2. FUNERAL PREFERENCES
"Have you thought about your funeral arrangements?"
Preplanned/prepaid? Cremation vs. burial? Religious requirements?

3. FINANCIAL SITUATION
"Would your family be able to cover funeral costs without difficulty?"
Understand actual need—some seniors have savings adequate for this.

4. OUTSTANDING OBLIGATIONS
"Are there any debts or bills you're concerned about leaving behind?"
Medical bills, credit cards, small loans

COVERAGE CALCULATION:

Start with actual estimated need:
• Funeral/burial: $8,000-15,000 typical
• Outstanding bills: Varies
• Small legacy: If desired and appropriate

Then determine affordability:
• What can client actually afford monthly?
• Does affordable premium buy adequate coverage?
• If not, is reduced coverage better than nothing?

WHAT NOT TO DO:

• Sell maximum affordable coverage without needs basis
• Push higher premiums than client can sustain
• Ignore existing coverage when calculating need
• Recommend graded when level is available
• Recommend guaranteed issue when better options exist`,
        keyPoints: [
          'Determine actual need before coverage amount',
          'Account for existing coverage and resources',
          'Affordable premium must be sustainable',
          'Match product type to client health status'
        ]
      },
      {
        id: 'sec-fe-4',
        title: 'Product Selection & Carriers',
        duration: 3,
        content: `Selecting the right final expense product requires matching client needs and health to available options.

CARRIER SELECTION:

Gold Coast Financial works with carriers specializing in final expense including:
[Carrier information would be listed here]

SELECTION CRITERIA:

1. HEALTH STATUS
• Clients in good health: Level benefit products
• Clients with moderate health issues: Graded benefit with favorable conditions
• Clients with serious health issues: Guaranteed issue (last resort)

2. PRICING
• Compare premiums across carriers for specific age/health
• Don't assume one carrier is always best

3. UNDERWRITING QUESTIONS
• Some carriers more lenient on specific conditions
• Know which carriers favor different health histories

4. GRADED BENEFIT TERMS
• Compare waiting periods
• Compare return of premium terms
• Some graded products more favorable than others

5. CARRIER REPUTATION
• Claims-paying history
• Customer service for beneficiaries
• Financial strength

DOCUMENTATION:

For every final expense recommendation, document:
• Needs analysis (what costs are being covered)
• Health status and product type rationale
• Why this carrier was selected
• Alternatives considered
• Client understanding confirmed`,
        keyPoints: [
          'Match product type to health status',
          'Compare carriers for specific client profile',
          'Document needs analysis and selection rationale',
          'Level is preferred when health qualifies'
        ]
      },
      {
        id: 'sec-fe-5',
        title: 'Final Expense Compliance',
        duration: 2,
        content: `Final expense sales carry specific compliance considerations due to the vulnerable population served.

REQUIRED DISCLOSURES:

• This is whole life insurance (not prepaid funeral)
• Benefits are paid to the beneficiary, not the funeral home
• Client can use proceeds for any purpose
• Premiums must be paid for life
• Waiting period details (if graded/guaranteed)
• Policy has cash value but limited in early years

REPLACEMENT RULES:

Replacing existing coverage is heavily scrutinized:
• Document why replacement benefits client
• Consider loss of cash value in existing policy
• Consider contestability period starting over
• Many replacements are NOT in client's best interest

BENEFICIARY CONSIDERATIONS:

• Verify beneficiary designation is clear
• Discuss irrevocable beneficiary carefully
• Ensure client understands proceeds go to beneficiary, not funeral home

RECORDING & DOCUMENTATION:

• Many carriers require recorded phone interviews
• Maintain complete file documentation
• Keep notes from all client interactions

COMPLAINTS:

Final expense complaints often involve:
• Family members who feel parent was exploited
• Confusion about graded benefits
• Misunderstanding about what policy covers
• Alleged pressure tactics

Prevent complaints through clear communication, proper documentation, and refusing to proceed when clients seem confused or pressured.`,
        keyPoints: [
          'Vulnerable population requires extra compliance diligence',
          'Document everything thoroughly',
          'Replacement requires strong justification',
          'Prevent complaints through clear communication'
        ],
        complianceNotes: [
          'Senior exploitation complaints trigger investigation',
          'Regulators scrutinize final expense sales carefully',
          'When in doubt, err on side of not selling'
        ]
      }
    ],
    learningObjectives: [
      'Understand final expense product variations',
      'Conduct sensitive conversations with senior clients',
      'Make needs-based recommendations',
      'Follow compliance requirements for vulnerable populations'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-product-term', 'mod-disclosure'],
    assessmentRequired: true,
    assessmentId: 'assess-product-fe',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // PRODUCT 4: FIXED & FIXED INDEXED ANNUITY ESSENTIALS
  // -------------------------------------------------------------------------
  {
    id: 'mod-product-annuity',
    code: 'GCF-304',
    title: 'Fixed & Fixed Indexed Annuity Essentials',
    subtitle: 'Retirement Income and Accumulation',
    description: 'Comprehensive training on fixed and fixed indexed annuity products, their purpose, structure, and suitability requirements.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 28,
    sections: [
      {
        id: 'sec-annuity-1',
        title: 'What Are Fixed Annuities?',
        duration: 7,
        content: `Annuities are contracts with insurance carriers designed for retirement accumulation and/or income.

CORE CONCEPT:

An annuity is NOT life insurance. It serves opposite purposes:
• Life insurance protects against dying too soon
• Annuities protect against living too long (outliving money)

TYPES WE OFFER:

1. FIXED ANNUITY (Traditional)
• Guaranteed interest rate
• Principal protection
• No market risk
• Predictable growth
• Surrender charges for early withdrawal

2. FIXED INDEXED ANNUITY (FIA)
• Interest credited based on index performance (like IUL concept)
• Principal protection (floor, typically 0%)
• Caps/participation rates limit upside
• More growth potential than traditional fixed
• More complex than traditional fixed

WHAT ANNUITIES ARE NOT:

• NOT investments (they are insurance contracts)
• NOT liquid (surrender charges apply)
• NOT short-term solutions
• NOT FDIC insured (state guaranty association protection varies)

ANNUITY PHASES:

Accumulation Phase:
• Money grows tax-deferred
• No access to funds without penalty (typically)
• Building retirement assets

Distribution Phase:
• Funds converted to income stream
• Can be lifetime income (annuitization)
• Can be systematic withdrawals
• Income is taxable when received`,
        keyPoints: [
          'Annuities are for retirement accumulation and income',
          'Fixed annuities offer guaranteed rates; FIAs are index-linked',
          'Principal is protected from market loss',
          'Annuities are not liquid—surrender charges apply'
        ]
      },
      {
        id: 'sec-annuity-2',
        title: 'When Annuities Are Appropriate',
        duration: 6,
        content: `Annuities are appropriate for specific retirement planning situations. Suitability is heavily regulated.

APPROPRIATE USE CASES:

1. TAX-DEFERRED ACCUMULATION
Client profile: Individual who has maxed other tax-deferred options (401k, IRA) and wants additional tax-deferred growth
Need: Accumulate retirement assets with tax deferral
Key factor: Long time horizon, no need for liquidity

2. GUARANTEED LIFETIME INCOME
Client profile: Retiree concerned about outliving savings
Need: Predictable income they cannot outlive
Key factor: Converting assets to income stream

3. PRINCIPAL PROTECTION WITH GROWTH POTENTIAL
Client profile: Conservative investor worried about market volatility
Need: Growth potential without risk of loss
Key factor: Understands tradeoffs (caps, surrender charges)

4. PENSION REPLACEMENT
Client profile: Worker without pension seeking pension-like income in retirement
Need: Create reliable income stream
Key factor: Long-term commitment to the strategy

WHEN ANNUITIES ARE NOT APPROPRIATE:

1. NEED FOR LIQUIDITY
If client may need the money in next 5-10 years, annuities are wrong.

2. SHORT TIME HORIZON
Annuities need time to overcome surrender charges and accumulate.

3. ALREADY IN TAX-DEFERRED ACCOUNT
Placing IRA money in an annuity provides no additional tax benefit (already tax-deferred).

4. INSUFFICIENT OTHER LIQUID ASSETS
Client should have emergency fund and accessible money outside the annuity.

5. INCOME GOAL WITHOUT INCOME RIDER
Basic annuities don't provide income guarantees—requires rider or annuitization.

SUITABILITY FACTORS:

Regulators require documentation of:
• Client's age and retirement timeline
• Financial situation and liquid assets
• Investment experience and risk tolerance
• Tax situation
• Liquidity needs
• Existing annuity or insurance products`,
        keyPoints: [
          'Annuities are for long-term retirement needs',
          'Not appropriate when liquidity is needed',
          'Suitability documentation is heavily regulated',
          'Client must understand surrender charges and commitment'
        ],
        complianceNotes: [
          'Annuity suitability is subject to state insurance regulations',
          'Thorough suitability documentation required',
          'Unsuitable annuity sales trigger regulatory action'
        ]
      },
      {
        id: 'sec-annuity-3',
        title: 'Fixed Indexed Annuity Mechanics',
        duration: 6,
        content: `Fixed indexed annuities (FIAs) have complex crediting mechanisms that must be explained clearly.

HOW INDEXING WORKS:

Similar to IUL:
• Not invested in market
• Interest credited based on index performance
• Caps limit upside
• Floor protects downside (typically 0%)
• Participation rates affect crediting

CREDITING METHODS:

1. ANNUAL POINT-TO-POINT
• Compare index at start and end of year
• Credit based on difference (subject to cap)
• Most common method

2. MONTHLY AVERAGE
• Average monthly index values over the year
• Tends to smooth volatility
• Often lower caps available

3. MONTHLY SUM
• Sum of monthly index changes
• Cap applies to each month
• Can capture more upside in trending markets

EXAMPLE (Annual Point-to-Point, 10% Cap):

Index starts at 4000, ends at 4500
Gain: 12.5%
Credited: 10% (cap applies)

Index starts at 4000, ends at 3800
Gain: -5%
Credited: 0% (floor applies)

CLIENT EXPECTATIONS:

Clients often expect stock market returns. They need to understand:
• Caps limit gains significantly
• 0% is not a loss, but it's not growth either
• Historical averages may not predict future results
• This is conservative growth, not aggressive growth

INCOME RIDERS:

Many FIAs include or offer income riders:
• Provide guaranteed lifetime income option
• Income benefit base may grow at guaranteed rate
• Income rate depends on age at activation
• Rider has cost (explicit or built into product)
• Different from account value`,
        keyPoints: [
          'Multiple crediting methods—understand client\'s specific method',
          'Caps significantly limit growth in strong markets',
          'Floor provides protection but 0% years do occur',
          'Income riders are optional features with costs'
        ]
      },
      {
        id: 'sec-annuity-4',
        title: 'Costs, Charges & Surrender Periods',
        duration: 5,
        content: `Annuities have costs and restrictions that clients must understand before purchasing.

SURRENDER CHARGES:

• Apply if policy is surrendered in early years
• Typically 7-10 year surrender period
• Start high (8-10%) and decline annually
• Example: 10%, 9%, 8%, 7%, 6%, 5%, 4%, 3%, 2%, 1%, 0%

PENALTY-FREE WITHDRAWALS:

Most annuities allow annual withdrawal without penalty:
• Typically 10% of account value per year
• Accumulated if not used (varies by contract)
• Does not eliminate surrender charge on amounts above this

RIDER COSTS:

Income riders and other optional features have costs:
• May be explicit annual charge (0.5%-1.5%)
• May be built into lower caps/participation rates
• Understand how costs are charged

TAX PENALTIES:

Withdrawals before age 59½:
• 10% IRS penalty on gains (in addition to ordinary income tax)
• Exceptions for death, disability, certain annuitization
• This is tax law, not carrier rule

MVAA (Market Value Adjustment):

Some annuities have MVA:
• Adjustment based on interest rate changes
• Can increase or decrease surrender value
• Complex calculation—explain concept to client

THE LIQUIDITY CONVERSATION:

Document that client:
• Understands the surrender period length
• Has adequate liquid assets outside the annuity
• Does not anticipate needing these funds before surrender period ends
• Understands penalty-free withdrawal provisions`,
        keyPoints: [
          'Surrender charges apply for 7-10+ years typically',
          'Penalty-free withdrawals available but limited',
          'IRS penalty applies before age 59½',
          'Client must have adequate liquidity elsewhere'
        ],
        complianceNotes: [
          'Liquidity suitability is heavily examined',
          'Document client\'s other liquid assets',
          'Never minimize surrender period commitment'
        ]
      },
      {
        id: 'sec-annuity-5',
        title: 'Annuity Suitability Compliance',
        duration: 4,
        content: `Annuity suitability regulations are stringent. Compliance is non-negotiable.

REQUIRED DOCUMENTATION:

Every annuity sale must include:

1. SUITABILITY QUESTIONNAIRE
• Age and retirement date
• Annual income and net worth
• Liquid assets
• Risk tolerance
• Investment objectives
• Existing insurance/annuity products

2. REPLACEMENT ANALYSIS (if applicable)
• Comparison of existing vs. proposed
• Surrender charges paid
• Loss of benefits
• New surrender period starting
• Justification for replacement

3. DISCLOSURE ACKNOWLEDGMENTS
• Buyer's guide received
• Product-specific disclosures signed
• Illustration (for FIA) with signatures
• Free look period explained

4. SOURCE OF FUNDS
• Where is the premium coming from?
• If from existing annuity, replacement rules apply
• If from retirement account, additional considerations

SENIORS (65+):

Enhanced requirements for senior annuity purchases:
• Additional suitability considerations
• Longer surrender periods require stronger justification
• Cognitive capacity concerns must be addressed
• Some states require supervisor review

1035 EXCHANGES:

Tax-free exchange from one annuity to another:
• Does not avoid suitability requirements
• Must demonstrate new product is better
• Consider loss of benefits, new surrender period
• Document why exchange benefits client

SUPERVISION:

All annuity applications are reviewed by compliance:
• Incomplete documentation = rejection
• Suitability concerns = follow-up required
• Senior sales = enhanced review`,
        keyPoints: [
          'Comprehensive suitability documentation required',
          'Replacement sales require additional justification',
          'Senior sales receive enhanced scrutiny',
          'All applications reviewed by compliance'
        ],
        complianceNotes: [
          'Annuity compliance violations are serious regulatory issues',
          'Documentation requirements are not optional',
          'When suitability is questionable, do not proceed'
        ]
      }
    ],
    learningObjectives: [
      'Explain fixed and fixed indexed annuity mechanics',
      'Identify appropriate annuity use cases and suitability factors',
      'Understand costs, charges, and surrender periods',
      'Follow annuity suitability compliance requirements'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-product-iul', 'mod-disclosure'],
    assessmentRequired: true,
    assessmentId: 'assess-product-annuity',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // =========================================================================
  // CLIENT FACILITATION MODULES (Level 2: Live Client Authorization)
  // Formerly "Sales Methodology" - renamed for compliance clarity
  // =========================================================================

  // -------------------------------------------------------------------------
  // CLIENT FACILITATION 1: CLIENT NEEDS ANALYSIS PROCESS
  // -------------------------------------------------------------------------
  {
    id: 'mod-sales-needs',
    code: 'GCF-401',
    title: 'Client Needs Analysis Process',
    subtitle: 'Discovery Before Recommendation',
    description: 'The complete process for understanding client needs before making any product recommendations. Discovery is the foundation of education-first advising.',
    category: 'client_facilitation',
    type: 'interactive',
    certificationLevel: 'live_client',
    duration: 20,
    sections: [
      {
        id: 'sec-needs-1',
        title: 'Why Needs Analysis Matters',
        duration: 5,
        content: `Needs analysis is not a sales technique—it is the foundation of appropriate recommendations.

THE PROBLEM WITH PRODUCT-FIRST SELLING:

Traditional salespeople start with the product:
"I'm calling about our great term life insurance..."
Then try to fit the product to anyone who will listen.

This approach:
• Creates suitability problems
• Generates complaints
• Produces policy lapses
• Violates fiduciary principles

THE EDUCATION-FIRST APPROACH:

We start with the client's situation:
"Tell me about your family and what prompted you to look into life insurance..."
Then determine IF and WHAT product might help.

This approach:
• Ensures suitability
• Reduces complaints
• Improves persistency
• Demonstrates professionalism

NEEDS ANALYSIS OBJECTIVES:

1. Understand the client's current situation
2. Identify protection gaps or opportunities
3. Determine if we can help
4. Establish foundation for appropriate recommendation
5. Create documentation for compliance

IF NO NEED EXISTS:

Sometimes needs analysis reveals no current need for our products:
• Client has adequate coverage already
• Client's situation doesn't warrant additional protection
• Client cannot afford coverage without hardship

In these cases, the correct answer is: "Based on what you've shared, you may not need additional coverage right now. Here's why..."

This is not a failed conversation. This is proper advising.`,
        keyPoints: [
          'Needs analysis comes BEFORE product discussion',
          'Purpose is to understand, not to sell',
          'Sometimes the answer is "you don\'t need this"',
          'Proper discovery prevents suitability problems'
        ]
      },
      {
        id: 'sec-needs-2',
        title: 'The Discovery Framework',
        duration: 6,
        videoPlaceholder: 'VIDEO: Needs Discovery Demonstration',
        content: `Use this framework to ensure comprehensive needs discovery.

THE FAMILY PICTURE:

Start broad and get specific:
"Tell me about your family situation."
• Marital status
• Children (ages, dependents)
• Other dependents (elderly parents, etc.)
• Who depends on your income?

THE FINANCIAL PICTURE:

Understand income and obligations:
• Employment and income stability
• Spouse's employment and income
• Mortgage and housing costs
• Other debts (auto, student loans, credit)
• Monthly expenses
• Savings and investments

THE PROTECTION PICTURE:

Understand existing coverage:
"What life insurance do you currently have?"
• Employer coverage (how much? portable?)
• Individual coverage (amount, type, carrier)
• Spouse's coverage
• Other protection (disability, etc.)

THE GOAL PICTURE:

Understand what prompted the inquiry:
"What's causing you to look at life insurance now?"
• Life event (marriage, baby, new home)
• Awareness moment (friend's experience, etc.)
• General financial planning
• Replacing or supplementing existing coverage

THE CONCERN PICTURE:

Understand worries and priorities:
"What concerns do you have about your family's financial security?"
"What would happen if you weren't here tomorrow?"
• Income replacement
• Mortgage payoff
• Children's education
• Spouse's retirement
• Final expenses

DOCUMENTATION:

All discovery information goes into the needs analysis:
• Current situation summary
• Identified needs and gaps
• Client's stated objectives
• Relevant financial information`,
        keyPoints: [
          'Cover family, financial, protection, goal, and concern areas',
          'Listen more than you talk',
          'Document everything in needs analysis',
          'Don\'t rush—thorough discovery takes time'
        ]
      },
      {
        id: 'sec-needs-3',
        title: 'Calculating Coverage Needs',
        duration: 5,
        content: `Coverage recommendations must be based on quantified needs, not arbitrary numbers.

THE NEEDS CALCULATION:

Income Replacement:
• How many years of income needs replacement?
• What percentage of income is needed by survivors?
• Calculation: Annual income × years × adjustment factor

Debt Payoff:
• Mortgage balance
• Auto loans
• Student loans
• Credit cards
• Other debts

Education Funding:
• Number of children
• Years until college
• Estimated costs (public vs. private)

Final Expenses:
• Funeral and burial costs
• Medical bills not covered by insurance
• Estate settlement costs

Other Needs:
• Emergency fund for survivors
• Spouse retirement gap
• Special needs considerations

THE FORMULA:

Total Need = Income Replacement + Debt Payoff + Education + Final Expenses + Other
Available Resources = Existing Insurance + Savings + Investments
Coverage Gap = Total Need - Available Resources

EXAMPLE:

Income replacement (10 years × $50,000): $500,000
Mortgage payoff: $250,000
Education (2 kids): $100,000
Final expenses: $15,000
Total Need: $865,000

Less: Existing coverage: -$100,000
Less: Savings: -$50,000
Coverage Gap: $715,000

Recommendation: $750,000 (rounded for practical coverage amounts)

DOCUMENTATION:

Show your work in the needs analysis:
• Each component itemized
• Resources deducted
• Final recommendation tied to calculation
• Not arbitrary numbers pulled from thin air`,
        keyPoints: [
          'Calculate coverage based on itemized needs',
          'Subtract existing resources and coverage',
          'Document the calculation clearly',
          'Recommendation must tie back to documented need'
        ]
      },
      {
        id: 'sec-needs-4',
        title: 'Affordability & Budget Reality',
        duration: 4,
        content: `After calculating need, address affordability—not before.

THE SEQUENCE MATTERS:

WRONG: "How much can you afford?" → sell that amount
RIGHT: "Here's what you need" → then "here's what you can afford" → find balance

THE AFFORDABILITY CONVERSATION:

"Based on your situation, you need approximately $750,000 in coverage."
"The premium for that would be approximately $XX per month."
"Does that fit your budget?"

IF AFFORDABLE:

Proceed with recommendation.

IF NOT AFFORDABLE:

"I understand the premium needs to fit your budget. Let's look at options."

Options to discuss:
• Reduced coverage amount (less than ideal, but some is better than none)
• Longer term at same amount (lower premium)
• Shorter term at same amount (even lower premium, but less duration)
• Different product type (if appropriate)

THE UNDERINSURED CONVERSATION:

When client can only afford less than calculated need:
"$400,000 is less than the $750,000 we calculated, but it would still cover [mortgage + X years income]. It's better to have some coverage than none."

Document:
• Client was informed of calculated need
• Client elected reduced coverage due to budget
• Coverage chosen and why

WHAT NOT TO DO:

• Start with budget and skip needs calculation
• Sell maximum affordable without needs basis
• Pressure client into higher premium than comfortable
• Minimize the gap between need and affordable coverage`,
        keyPoints: [
          'Calculate need first, then address affordability',
          'Some coverage is better than none',
          'Document when client chooses less than calculated need',
          'Never pressure into unaffordable premiums'
        ]
      }
    ],
    learningObjectives: [
      'Conduct thorough needs discovery conversations',
      'Calculate coverage needs based on documented factors',
      'Handle affordability conversations appropriately',
      'Document needs analysis completely'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-education-call', 'mod-product-term'],
    assessmentRequired: true,
    assessmentId: 'assess-sales-needs',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // CLIENT FACILITATION 2: CLIENT QUESTIONS & EDUCATIONAL CLARIFICATIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-sales-objections',
    code: 'GCF-402',
    title: 'Client Questions, Hesitations & Educational Clarifications',
    subtitle: 'Professional Responses to Client Concerns',
    description: 'How to respond to client questions and hesitations using education rather than pressure. This replaces traditional "objection handling" with compliant professional dialogue.',
    category: 'client_facilitation',
    type: 'interactive',
    certificationLevel: 'live_client',
    duration: 22,
    sections: [
      {
        id: 'sec-obj-1',
        title: 'Reframing "Objections"',
        duration: 5,
        content: `Traditional sales training treats client concerns as obstacles. We treat them as opportunities for education.

THE TRADITIONAL VIEW:

"Objection" = Something to overcome
"Handling" = Techniques to get past the resistance
Goal = Close the sale despite the objection

THE EDUCATION-FIRST VIEW:

"Concern" = Information about client's thought process
"Addressing" = Providing education and clarity
Goal = Ensure client makes informed decision

WHY THIS MATTERS:

When you view concerns as obstacles:
• You become adversarial with the client
• You focus on closing rather than understanding
• You miss important information about fit
• You create complaints and cancellations

When you view concerns as opportunities:
• You partner with the client
• You focus on education and clarity
• You discover genuine fit issues
• You create satisfied clients

THE MENTAL SHIFT:

INSTEAD OF: "How do I overcome this objection?"
THINK: "What information does this client need?"

INSTEAD OF: "What can I say to change their mind?"
THINK: "What concern is driving this response?"

INSTEAD OF: "This objection is blocking the sale"
THINK: "This feedback helps me understand their needs better"`,
        keyPoints: [
          'Concerns are information, not obstacles',
          'Focus on education, not overcoming',
          'Partner with the client, don\'t battle them',
          'Understand the underlying concern'
        ]
      },
      {
        id: 'sec-obj-2',
        title: 'Common Concerns & Responses',
        duration: 8,
        videoPlaceholder: 'VIDEO: Handling Common Concerns',
        content: `Here are education-first responses to common client concerns.

"I NEED TO THINK ABOUT IT"

Underlying concern: Not ready to decide, needs processing time, or has unanswered questions.

Education-first response:
"Of course—this is an important decision. Before we wrap up, let me make sure you have everything you need. Do you understand the coverage amount and why we arrived at that figure? Is there any part of the recommendation that's unclear?"

Then: Schedule specific follow-up. Respect the need for time.

"IT'S TOO EXPENSIVE"

Underlying concern: Budget constraint, value perception, or priority question.

Education-first response:
"I understand budget matters. Help me understand—is the monthly amount the concern, or is it more about whether this is the right priority right now?"

Then: Explore alternatives if budget is genuine. If value is the concern, ensure education was complete.

"I ALREADY HAVE COVERAGE THROUGH WORK"

Underlying concern: May believe existing coverage is sufficient.

Education-first response:
"That's great that you have some coverage. Do you know how much? And is it portable if you change jobs? Often employer coverage is less than needed and doesn't follow you. Let's look at whether there's a gap."

Then: Calculate actual gap. If no gap, acknowledge it.

"LET ME TALK TO MY SPOUSE"

Underlying concern: Legitimate decision-making process.

Education-first response:
"Absolutely—this should be a joint decision. Would it be helpful to schedule a call when you're both available? I'm happy to go through everything with both of you."

Then: Offer three-way call. Do not try to close without spouse.

"I DON'T TRUST INSURANCE COMPANIES"

Underlying concern: Past negative experience or general skepticism.

Education-first response:
"I appreciate you being honest about that. What experience has shaped that view? I'd like to understand your concerns so I can address them specifically."

Then: Listen. Acknowledge valid concerns. Explain how we do things differently.`,
        keyPoints: [
          'Seek to understand the underlying concern',
          'Provide relevant education to address the concern',
          'Respect the client\'s decision-making process',
          'Never pressure or dismiss concerns'
        ]
      },
      {
        id: 'sec-obj-3',
        title: 'What Never To Do',
        duration: 4,
        content: `These responses are PROHIBITED regardless of the objection.

PRESSURE TACTICS:

❌ "Rates go up every year—you should act now."
❌ "I can only hold this quote until end of day."
❌ "If something happened tomorrow, what would your family do?"
❌ "Don't you love your family enough to protect them?"

DISMISSING CONCERNS:

❌ "That's not really an issue because..."
❌ "Most people feel that way at first, but..."
❌ "You're overthinking this."
❌ "Let me show you why you're wrong about that."

MANIPULATION:

❌ "It's just the cost of a cup of coffee per day."
❌ "You spend more than this on cable TV."
❌ "What's your family's security worth to you?"
❌ "Imagine your children without..."

PERSISTENCE AFTER DECLINE:

❌ Calling back same day with "one more thought"
❌ Sending multiple follow-up emails after clear no
❌ Having someone else call the same prospect
❌ Adding to marketing campaigns after decline

WHY THESE ARE PROHIBITED:

• They are manipulative, not educational
• They damage trust with clients
• They generate complaints
• They violate our institutional standards
• They can trigger regulatory action

CONSEQUENCES:

Use of prohibited responses is a compliance violation. Patterns of prohibited behavior result in remediation, suspension, or termination.`,
        keyPoints: [
          'Pressure tactics are prohibited',
          'Dismissing concerns is prohibited',
          'Manipulation is prohibited',
          'Persistence after decline is prohibited'
        ],
        complianceNotes: [
          'Prohibited language is monitored in call reviews',
          'Client complaints citing pressure are investigated',
          'Violations have real consequences'
        ]
      },
      {
        id: 'sec-obj-4',
        title: 'When to Walk Away',
        duration: 5,
        content: `Sometimes the right answer is not to proceed with the sale. Recognizing this is professional maturity.

WALK AWAY WHEN:

1. CLIENT CLEARLY CANNOT AFFORD IT
If the premium would cause financial hardship, do not sell the policy.
"I appreciate you wanting to protect your family, but I don't think this fits your budget right now. Let's revisit when your situation changes."

2. PRODUCT IS NOT SUITABLE
If the client's needs don't match what we offer.
"Based on what you've shared, I don't think this is the right product for your situation. You might want to explore [alternative]."

3. CLIENT DOESN'T UNDERSTAND
If after repeated explanation the client still can't articulate what they're buying.
"I want to make sure you're fully comfortable before moving forward. Let's schedule another call after you've had time to think about this."

4. SOMETHING FEELS WRONG
If you sense cognitive impairment, duress, or other concerning factors.
Trust your instincts. Document your concerns. Do not proceed.

5. CLIENT SAYS NO
"No" means no. Thank them for their time. End the call professionally.
"I understand. If your situation changes, I'm here to help."

THE BUSINESS CASE FOR WALKING AWAY:

• Unsuitable sales create complaints
• Complaints create investigations
• Investigations create consequences
• Forced sales cancel quickly (chargebacks)
• Reputation damage affects future business

The sale you walk away from today protects the hundred sales you'll make in the future with a clean record.`,
        keyPoints: [
          'Walking away is sometimes the right answer',
          'Affordability, suitability, understanding, and consent matter',
          'Trust your instincts about concerning situations',
          '"No" means no—end professionally'
        ]
      }
    ],
    learningObjectives: [
      'Reframe "objections" as opportunities for education',
      'Respond to common concerns with education-first approaches',
      'Identify and avoid prohibited response patterns',
      'Recognize when to walk away from a sale'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-handling-no', 'mod-sales-needs'],
    assessmentRequired: true,
    assessmentId: 'assess-sales-objections',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },

  // -------------------------------------------------------------------------
  // CLIENT FACILITATION 3: DECISION CONFIRMATION & DOCUMENTATION
  // -------------------------------------------------------------------------
  {
    id: 'mod-sales-closing',
    code: 'GCF-403',
    title: 'Decision Confirmation & Documentation Procedures',
    subtitle: 'Completing the Recommendation Process with Integrity',
    description: 'How to facilitate the client\'s decision without pressure or manipulation. Decision confirmation is the natural conclusion to proper education, not a separate technique.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 18,
    sections: [
      {
        id: 'sec-close-1',
        title: 'The Education-First Close',
        duration: 5,
        content: `In education-first advising, the "close" is simply the natural conclusion of a well-conducted consultation.

THE TRADITIONAL CLOSE:

Traditional sales training treats closing as a separate skill—techniques to "get the yes":
• Assumptive close
• Alternative close
• Urgency close
• Fear close

These are pressure tactics. We do not use them.

THE EDUCATION-FIRST APPROACH:

When you've properly:
1. Discovered client needs
2. Calculated appropriate coverage
3. Explained the recommendation and alternatives
4. Answered all questions
5. Confirmed client understanding

The close is simply:
"Based on everything we've discussed, would you like to move forward with the application?"

That's it. No tricks. No pressure. A straightforward question.

WHY THIS WORKS:

• Educated clients make decisions
• Clients who understand the need see the value
• Removing pressure removes resistance
• The decision becomes about the client's need, not your technique

IF THE ANSWER IS YES:

Proceed with the application process. Explain what happens next.

IF THE ANSWER IS NO OR NOT YET:

Respect it. Follow the "no" handling protocol. Schedule follow-up if appropriate.

THE ONLY "TECHNIQUE":

The only closing technique is ensuring complete education. If the client understands their need and your solution, and the solution is appropriate, many will choose to proceed.

Those who don't weren't ready—and that's okay.`,
        keyPoints: [
          'The close is a question, not a technique',
          'Proper education is the "technique"',
          'Straightforward question after thorough education',
          'Respect the answer, whatever it is'
        ]
      },
      {
        id: 'sec-close-2',
        title: 'Before You Ask',
        duration: 5,
        content: `Before asking the closing question, ensure you've completed these steps.

PRE-CLOSE CHECKLIST:

□ NEEDS DOCUMENTED
Have you captured and documented the client's needs, including:
• Family situation
• Financial picture
• Protection gaps
• Goals and concerns

□ COVERAGE CALCULATED
Have you shown how you arrived at the coverage recommendation:
• Need components itemized
• Existing resources deducted
• Final coverage amount justified

□ PRODUCT EXPLAINED
Have you educated on the recommended product:
• What type of coverage
• How it works
• What it costs
• How long it lasts
• What it doesn't cover

□ ALTERNATIVES PRESENTED
Have you mentioned alternatives:
• Different coverage amounts
• Different term lengths (for term)
• Different product types (if applicable)
• Why recommended product is best fit

□ DISCLOSURES PROVIDED
Have you made required disclosures:
• Advisor compensation disclosure
• Product-specific disclosures
• Limitations and exclusions
• Policy terms

□ QUESTIONS ANSWERED
Have you invited and answered all questions:
• "What questions do you have?"
• Thorough responses
• Checked for understanding

□ COMPREHENSION CONFIRMED
Can the client articulate:
• What they're buying
• Why they're buying it
• What it costs
• What it covers

If any box is unchecked, complete that step before asking the closing question.`,
        keyPoints: [
          'Complete all steps before asking closing question',
          'Documentation, explanation, and comprehension required',
          'Disclosures must be provided',
          'Don\'t skip steps to reach the close faster'
        ]
      },
      {
        id: 'sec-close-3',
        title: 'Asking & Responding',
        duration: 4,
        content: `The closing question and how to respond to various answers.

THE CLOSING QUESTION:

Direct and simple:
"Based on everything we've discussed, would you like to move forward with the application?"

Or:
"Are you ready to proceed, or do you have additional questions?"

Do not use:
• "Can I get you started today?"
• "What would it take to move forward right now?"
• "If I could [X], would you sign today?"

RESPONSE: YES

"Great. Here's what happens next. The application takes about [X] minutes. I'll ask you some questions about your health history, and we'll collect your payment information for the first premium..."

Walk through the process. Make it feel manageable.

RESPONSE: I NEED TO THINK ABOUT IT

"Of course. This is an important decision. What additional information would be helpful? And when would be a good time to follow up?"

Ensure they have what they need. Schedule specific follow-up.

RESPONSE: IT'S TOO EXPENSIVE

"I understand. Would you like to look at some alternatives that might fit your budget better? We could [reduce coverage/adjust term/etc.]"

Explore options. Don't argue.

RESPONSE: NO

"I understand. Thank you for your time today. If your situation changes, please don't hesitate to reach out."

End graciously. No persistence.

WHATEVER THE RESPONSE:

Document it. Move to appropriate next step. Do not pressure.`,
        keyPoints: [
          'Simple, direct closing question',
          'Respond appropriately to each outcome',
          'Document the decision and next steps',
          'Never pressure after any response'
        ]
      },
      {
        id: 'sec-close-4',
        title: 'The Application Process',
        duration: 4,
        content: `When the client says yes, walk them through a smooth application process.

EXPLAINING THE PROCESS:

"Here's what happens next:
1. I'll collect some information from you now (takes about [X] minutes)
2. The application goes to the insurance company
3. They'll review and may request additional information
4. Once approved, I'll call you to deliver the policy
5. Coverage becomes effective when the policy is issued and first premium is paid"

APPLICATION COMPONENTS:

Personal Information:
• Name, address, contact info
• Date of birth
• Social Security number (explain why needed)
• Beneficiary designation

Health History:
• Medical conditions
• Medications
• Tobacco use
• Height/weight
• Doctor information

Warn them: "I'm going to ask some personal health questions. Please answer honestly—inaccurate information can result in claims being denied."

Payment Information:
• Bank account or payment card
• First premium collected
• Ongoing payment method

ACCURACY IS CRITICAL:

Explain clearly:
"It's important that everything we provide is accurate. If there's a claim and the insurance company discovers inaccurate information, they could deny the claim. So please take your time and be truthful."

AFTER APPLICATION:

Explain what happens next:
• Timeline for underwriting
• What to expect (phone interview, medical exam if required)
• When they'll hear from you
• How to reach you with questions

Confirm:
• They have your contact information
• They know what to expect
• They're comfortable with the process`,
        keyPoints: [
          'Walk client through the entire process',
          'Emphasize accuracy in health history',
          'Explain underwriting timeline',
          'Confirm they know what to expect'
        ]
      }
    ],
    learningObjectives: [
      'Apply education-first closing approach',
      'Complete pre-close checklist before asking',
      'Respond appropriately to closing outcomes',
      'Guide clients through the application process'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-sales-needs', 'mod-sales-objections'],
    assessmentRequired: true,
    assessmentId: 'assess-sales-closing',
    version: '1.0',
    lastUpdated: '2026-01-20',
    complianceApprovalDate: '2026-01-15'
  },


  // =========================================================================
  // PRODUCT KNOWLEDGE DEEP DIVES
  // =========================================================================

  // -------------------------------------------------------------------------
  // LIFE INSURANCE FOUNDATIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-life-foundations',
    code: 'GCF-301',
    title: 'Life Insurance Foundations',
    subtitle: 'Term vs Permanent - Understanding the Basics',
    description: 'Comprehensive foundation in life insurance types, their purposes, and when each is appropriate. Essential knowledge for client education.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-life-found-1',
        title: 'Why Life Insurance Exists',
        duration: 5,
        content: `Life insurance exists for one fundamental purpose: to replace income and provide financial security when someone dies.

THE CORE QUESTION:
"If you died tomorrow, who would be financially affected?"

This isn't a sales question—it's the foundation of needs analysis. Life insurance solves the mathematical problem of lost income.

WHAT LIFE INSURANCE ACTUALLY DOES:
• Replaces lost income for dependents
• Pays off debts (mortgage, loans, credit cards)
• Funds children's education
• Covers final expenses
• Provides business continuity
• Creates an inheritance or legacy

WHO NEEDS LIFE INSURANCE:
• Anyone with dependents who rely on their income
• Anyone with debt that would burden survivors
• Business owners with partners or key employees
• Anyone wanting to leave a legacy
• Those with estate planning needs

WHO MIGHT NOT NEED LIFE INSURANCE:
• Single individuals with no dependents
• Those with sufficient assets to self-insure
• Elderly individuals with no financial dependents

IMPORTANT PRINCIPLE:
Life insurance is not an investment. It's risk management. The purpose is protection, not accumulation (though some products offer both).`,
        keyPoints: [
          'Life insurance replaces lost income',
          'The core question: who would be financially affected?',
          'Protection is the primary purpose',
          'Not everyone needs life insurance'
        ]
      },
      {
        id: 'sec-life-found-2',
        title: 'Term Life Insurance',
        duration: 6,
        content: `Term life insurance is temporary coverage for a specific period. Think of it like renting insurance protection.

HOW TERM WORKS:
• You pay premiums for a set period (10, 15, 20, 25, or 30 years)
• If you die during the term, beneficiaries receive the death benefit
• If you outlive the term, coverage ends with no payout
• Premiums are typically level (same) throughout the term

TYPES OF TERM:
1. Level Term - Most common. Same premium, same coverage for entire term
2. Annual Renewable Term (ART) - Renews yearly, premium increases each year
3. Decreasing Term - Death benefit decreases over time (often for mortgages)
4. Return of Premium (ROP) - Returns premiums if you outlive the term (more expensive)

ADVANTAGES OF TERM:
• Lowest cost per dollar of coverage
• Simple to understand
• Perfect for temporary needs
• Easy to compare quotes

DISADVANTAGES OF TERM:
• No cash value accumulation
• Coverage ends when term expires
• Renewing after term is very expensive
• May become uninsurable due to health changes

IDEAL USES FOR TERM:
• Income replacement during working years
• Mortgage protection
• Business loans
• Child-raising years
• Temporary business needs

THE MATH EXAMPLE:
35-year-old healthy male, $500,000 coverage:
• 20-year term: ~$25-35/month
• Whole life: ~$350-450/month

Term provides 10-15x more coverage per dollar spent.`,
        keyPoints: [
          'Term is temporary, affordable coverage',
          'Level term keeps same premium throughout',
          'No cash value - pure protection',
          'Ideal for temporary needs like mortgage or child-raising years',
          'Most cost-effective coverage per dollar'
        ]
      },
      {
        id: 'sec-life-found-3',
        title: 'Permanent Life Insurance',
        duration: 7,
        content: `Permanent life insurance provides lifetime coverage with a cash value component. Think of it like owning your insurance protection.

HOW PERMANENT WORKS:
• Coverage lasts your entire lifetime (if premiums paid)
• Builds cash value that grows tax-deferred
• Cash value can be accessed via loans or withdrawals
• Death benefit passes to beneficiaries tax-free

TYPES OF PERMANENT:
1. Whole Life - Guaranteed premiums, guaranteed death benefit, guaranteed cash value growth
2. Universal Life (UL) - Flexible premiums and death benefits, interest credited based on current rates
3. Indexed Universal Life (IUL) - Cash value linked to market index performance with downside protection
4. Variable Universal Life (VUL) - Cash value invested in sub-accounts (like mutual funds)

WHOLE LIFE CHARACTERISTICS:
• Guarantees: premium, death benefit, cash value growth
• Most predictable, most expensive
• Cash value grows at fixed rate (typically 2-4%)
• Dividends possible from mutual companies
• Best for: those wanting guarantees and forced savings

UNIVERSAL LIFE CHARACTERISTICS:
• Flexible premiums (within limits)
• Cash value earns current interest rate
• Can adjust death benefit
• Risk: low interest rates can cause policy to lapse
• Best for: those wanting flexibility with moderate risk

IUL CHARACTERISTICS (GCF Focus Product):
• Cash value tied to index performance (S&P 500, etc.)
• Floor protection (typically 0%) - can't lose money in down markets
• Cap limits upside (typically 8-12%)
• Tax-advantaged growth and access
• Best for: those wanting growth potential with protection

WHEN PERMANENT MAKES SENSE:
• Lifetime coverage need (estate planning)
• Tax-advantaged wealth accumulation
• Cash value access for retirement supplement
• Business applications (key person, buy-sell)
• Special needs planning`,
        keyPoints: [
          'Permanent insurance lasts lifetime with cash value',
          'Whole life offers guarantees but highest cost',
          'Universal life offers flexibility',
          'IUL provides growth potential with downside protection',
          'Consider permanent for lifetime needs'
        ]
      },
      {
        id: 'sec-life-found-4',
        title: 'Term vs Permanent Decision Framework',
        duration: 4,
        content: `Helping clients choose between term and permanent requires understanding their needs, not pushing products.

THE DECISION FRAMEWORK:

QUESTION 1: Is the need temporary or permanent?
• Temporary (mortgage, kids, business loan) → Term likely best
• Permanent (estate planning, legacy, lifetime coverage) → Permanent likely best

QUESTION 2: What is the budget?
• Limited budget with high coverage need → Term
• Larger budget with additional goals → Consider permanent

QUESTION 3: What are the goals beyond death benefit?
• Pure protection → Term
• Cash accumulation + protection → Permanent
• Tax-advantaged retirement supplement → IUL

QUESTION 4: What is the client's age and health?
• Young and healthy → Both options available, term very affordable
• Older or health issues → Lock in permanent while insurable

THE COMBINATION APPROACH:
Many clients benefit from BOTH:
• Base permanent policy for lifetime needs
• Term rider or separate term policy for temporary higher needs

EXAMPLE:
40-year-old with $500K mortgage and 2 kids:
• $250,000 Whole Life or IUL (permanent need - final expenses, legacy)
• $500,000 20-year Term (temporary need - mortgage and kids)
• Total: $750,000 coverage at manageable premium

NEVER DO THIS:
• Push permanent when client needs maximum term coverage
• Sell term to someone with clear permanent needs
• Recommend based on commission instead of need
• Oversimplify with "term is always better" or "permanent is always better"`,
        keyPoints: [
          'Match product to need duration (temporary vs permanent)',
          'Budget determines how much coverage is feasible',
          'Goals beyond death benefit influence product choice',
          'Combination approach often makes most sense',
          'Never push products - match to client needs'
        ],
        complianceNotes: [
          'Suitability requires matching product to client need',
          'Document the needs analysis that led to recommendation',
          'Never recommend based on commission structure'
        ]
      },
      {
        id: 'sec-life-found-5',
        title: 'Cash Value Mechanics',
        duration: 3,
        content: `Understanding how cash value works is essential for explaining permanent products.

WHAT IS CASH VALUE:
Cash value is the savings component inside permanent life insurance. Part of your premium goes to insurance cost, part goes to cash value.

HOW CASH VALUE GROWS:
• Tax-deferred - no taxes on growth while inside policy
• Interest/returns credited based on policy type
• Whole life: guaranteed rate + potential dividends
• UL: current interest rate declared by carrier
• IUL: based on index performance with floor/cap

ACCESSING CASH VALUE:

1. Policy Loans
• Borrow against cash value
• No credit check or approval needed
• Interest charged on loan balance
• Death benefit reduced by outstanding loan
• Not taxable if policy stays in force

2. Withdrawals
• Take money directly from cash value
• Up to basis (premiums paid) is tax-free
• Gains above basis are taxable
• Reduces cash value and may reduce death benefit

3. Surrender
• Cancel policy and receive cash surrender value
• Gains above basis are taxable
• No longer have life insurance protection
• Surrender charges may apply in early years

KEY CONCEPT - THE "BANK":
IUL and UL policies can function like a personal bank:
• Build cash value over time
• Borrow for any purpose (tax-free if done correctly)
• Pay yourself back (or not - reduces death benefit)
• Access money in retirement without affecting Social Security

IMPORTANT CAUTION:
Over-borrowing can cause policy to lapse, triggering a taxable event. Always monitor policy health with regular reviews.`,
        keyPoints: [
          'Cash value grows tax-deferred',
          'Access via loans, withdrawals, or surrender',
          'Policy loans are not taxable if policy stays in force',
          'Over-borrowing can cause policy lapse',
          'Cash value provides flexibility and options'
        ]
      }
    ],
    learningObjectives: [
      'Explain the fundamental purpose of life insurance',
      'Differentiate between term and permanent life insurance',
      'Identify appropriate uses for each product type',
      'Apply decision framework to client scenarios',
      'Explain cash value mechanics to clients'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-welcome', 'mod-philosophy'],
    assessmentRequired: true,
    assessmentId: 'assess-life-foundations',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // IUL INDEX STRATEGIES
  // -------------------------------------------------------------------------
  {
    id: 'mod-iul-strategies',
    code: 'GCF-302',
    title: 'IUL Index Strategies',
    subtitle: 'Understanding Index Options and Crediting Methods',
    description: 'Deep dive into how IUL products work, including index options, caps, floors, participation rates, and crediting strategies.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 30,
    sections: [
      {
        id: 'sec-iul-strat-1',
        title: 'How IUL Crediting Works',
        duration: 6,
        content: `Indexed Universal Life (IUL) credits interest to your cash value based on the performance of a market index, but with protection and limits.

THE BASIC CONCEPT:
Your money is NOT invested in the stock market. Instead:
1. The carrier invests in bonds and options
2. They track an index (like S&P 500)
3. If the index goes up, you get credited interest (up to a cap)
4. If the index goes down, you get the floor (typically 0%)

WHY THIS MATTERS:
• You participate in market upside
• You're protected from market downside
• It's NOT securities - it's an insurance product
• Returns are more conservative than direct market investment

THE CREDITING PROCESS:
1. Segment Start - Premium or transfer enters an index account
2. Crediting Period - Usually 1 year (annual point-to-point)
3. Index Change Calculated - Starting value vs ending value
4. Crediting Rate Determined - Based on floor, cap, and participation rate
5. Interest Credited - Added to cash value, locked in, can never be lost

EXAMPLE:
S&P 500 goes up 15% during the year
Your policy has 10% cap and 100% participation rate
You get credited: 10% (the cap limits your upside)

S&P 500 goes down 20% during the year
Your policy has 0% floor
You get credited: 0% (floor protects you from loss)

KEY INSIGHT:
IUL is about "avoiding the losses" as much as capturing gains. A 0% year is better than a -20% year. Over time, avoiding major losses can lead to competitive long-term accumulation.`,
        keyPoints: [
          'Money is NOT in the stock market - carrier uses options',
          'Index performance determines crediting rate',
          'Cap limits upside, floor protects downside',
          'Interest is locked in and cannot be lost',
          'Avoiding losses is key to long-term accumulation'
        ]
      },
      {
        id: 'sec-iul-strat-2',
        title: 'Caps, Floors, and Participation Rates',
        duration: 7,
        content: `Understanding these three components is essential for explaining IUL to clients.

FLOOR (Minimum Guaranteed Rate):
• The minimum interest you can receive
• Typically 0% or 1%
• Protects against market downturns
• A 0% floor means you can never lose money due to market performance
• Some policies offer higher floors with lower caps

CAP (Maximum Rate):
• The maximum interest you can receive
• Typically ranges from 8% to 14%
• Varies by carrier, product, and index option
• Can change annually (not guaranteed)
• Higher caps usually mean higher policy costs

PARTICIPATION RATE:
• The percentage of index gain you receive
• 100% participation = you get full gain (up to cap)
• 50% participation = you get half of the gain
• Can be used instead of or in combination with caps

EXAMPLES:

Example 1: Cap Only
Index return: 12%
Cap: 10%
Participation: 100%
Your credit: 10% (capped)

Example 2: Participation Only
Index return: 12%
Cap: None
Participation: 60%
Your credit: 7.2% (60% of 12%)

Example 3: Both Cap and Participation
Index return: 20%
Cap: 12%
Participation: 80%
Your credit: 9.6% (80% of 12% cap)

IMPORTANT NOTES:
• Caps and participation rates can change annually
• They are NOT guaranteed long-term
• Carriers adjust based on options market conditions
• Compare historical cap rates, not just current
• Lower caps in the future could affect projections`,
        keyPoints: [
          'Floor protects against losses (usually 0%)',
          'Cap limits maximum gain (typically 8-14%)',
          'Participation rate determines % of gain credited',
          'These can change annually - not guaranteed',
          'Always compare historical rates across carriers'
        ]
      },
      {
        id: 'sec-iul-strat-3',
        title: 'Common Index Options',
        duration: 6,
        content: `Most IUL policies offer multiple index options. Understanding each helps match to client preferences.

S&P 500 INDEX:
• Most common index option
• Tracks 500 largest US companies
• Well-understood by clients
• Typically has highest caps
• Most historical data available

MULTI-INDEX / BLENDED OPTIONS:
• Combines multiple indices (stocks, bonds, commodities)
• Lower volatility than pure equity indices
• May have uncapped participation with lower rates
• Good for conservative clients
• Examples: Barclays, BlackRock indexes

UNCAPPED OPTIONS:
• No ceiling on returns
• Usually has participation rate instead (50-70%)
• Better in strong bull markets
• May underperform capped options in moderate markets
• Higher potential, but also more variability

FIXED ACCOUNT:
• Guaranteed interest rate (typically 2-4%)
• No index participation
• Good for conservative portion of allocation
• Provides stability in portfolio

VOLATILITY CONTROLLED INDICES:
• Designed to reduce large swings
• Often offered with higher participation rates
• May smooth returns over time
• Newer options - less historical data
• Examples: Credit Suisse, JPMorgan indices

ALLOCATION STRATEGIES:
Clients can typically allocate across multiple options:
• Aggressive: 100% S&P 500 capped
• Moderate: 60% S&P 500, 40% blended index
• Conservative: 50% fixed, 50% S&P 500
• Diversified: Split across 3-4 options

IMPORTANT:
Index allocation can usually be changed annually without tax consequences. This flexibility allows adjustment as client needs or market conditions change.`,
        keyPoints: [
          'S&P 500 is most common and well-understood',
          'Blended indices offer lower volatility',
          'Uncapped options trade cap for participation rate',
          'Fixed account provides guaranteed growth',
          'Allocation can be changed annually'
        ]
      },
      {
        id: 'sec-iul-strat-4',
        title: 'Crediting Methods',
        duration: 5,
        content: `Different carriers use different methods to calculate how much to credit. Understanding these prevents confusion.

ANNUAL POINT-TO-POINT (Most Common):
• Compares index value at start and end of year
• Simple to understand and explain
• One calculation per year
• What happens during the year doesn't matter
• Example: S&P at 4000 on Jan 1, 4400 on Dec 31 = 10% gain

MONTHLY POINT-TO-POINT:
• Compares index at start and end of each month
• Caps each month (typically 1-2%)
• Sums monthly gains (negative months = 0)
• Can capture more gains in volatile markets
• Example: 12 months × 1.5% cap = 18% potential max

MONTHLY AVERAGE:
• Averages the index value across all months
• Compares average to starting value
• Smooths out volatility
• Often results in lower credits than point-to-point
• Can miss large year-end rallies

DAILY AVERAGE:
• Most conservative approach
• Averages daily values
• Smooths volatility significantly
• Typically results in lower returns
• Less common in modern products

TRIGGER / THRESHOLD METHODS:
• Pays a set bonus if index is flat or positive
• Example: 5% bonus if S&P ≥ 0%
• Provides certainty - you know what you'll get
• May underperform in strong markets
• Good for clients wanting predictability

WHICH IS BEST?
No single method is "best" - it depends on:
• Market conditions during the period
• Client's preference for certainty vs potential
• Policy design and available caps
• How actively client wants to manage allocation`,
        keyPoints: [
          'Annual point-to-point is most common',
          'Monthly methods cap each month separately',
          'Averaging methods smooth volatility but may reduce returns',
          'Trigger methods provide certainty',
          'No single method is universally best'
        ]
      },
      {
        id: 'sec-iul-strat-5',
        title: 'Managing Expectations',
        duration: 6,
        content: `Setting proper expectations is critical. Over-promising leads to complaints and compliance issues.

WHAT TO TELL CLIENTS:

"IUL is designed to provide market-linked growth with protection against market losses. You won't get full market returns in up years, but you also won't lose money in down years."

REALISTIC RETURN EXPECTATIONS:
• Long-term average: 5-7% (historical, not guaranteed)
• Best years: 8-14% (hitting the cap)
• Worst years: 0% (hitting the floor)
• Actual returns will vary significantly year to year

WHAT NOT TO PROMISE:
• Specific return percentages
• "You'll never lose money" (policy charges can reduce cash value)
• "It's better than the market"
• "Guaranteed returns"
• Using maximum illustrated rates as expectations

ILLUSTRATION RATES:
State regulations limit illustrated rates:
• Maximum illustrated rate: Currently varies by state (often 5-6%)
• Actual returns may be higher OR lower
• Always show multiple scenarios (current, mid, low)

COMMON CLIENT MISCONCEPTIONS:

1. "So my money is in the market?"
No, it's in the carrier's general account. They use options to provide index-linked returns.

2. "I'll get the full S&P return?"
No, returns are subject to caps, floors, and participation rates.

3. "I can't lose money?"
Your cash value won't decrease due to index performance, but policy charges are deducted regardless of performance.

4. "The cap is guaranteed?"
No, caps can change annually. Current caps are not permanent.

THE HONEST CONVERSATION:
"IUL isn't a get-rich-quick product. It's a long-term planning tool that provides tax-advantaged growth with downside protection. The trade-off for protection is giving up some upside potential."`,
        keyPoints: [
          'Set realistic expectations: 5-7% average, not market returns',
          'Never promise specific returns',
          'Policy charges apply regardless of index performance',
          'Caps can change - not guaranteed',
          'IUL is a long-term planning tool, not a get-rich-quick product'
        ],
        complianceNotes: [
          'Never illustrate using maximum rates as expectation',
          'Always show multiple scenarios',
          'Document that client understands limitations',
          'Compliance violation: promising specific returns'
        ]
      }
    ],
    learningObjectives: [
      'Explain how IUL crediting works to clients',
      'Differentiate between caps, floors, and participation rates',
      'Compare common index options and their characteristics',
      'Explain different crediting methods',
      'Set appropriate client expectations'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-life-foundations'],
    assessmentRequired: true,
    assessmentId: 'assess-iul-strategies',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // ANNUITY TYPES EXPLAINED
  // -------------------------------------------------------------------------
  {
    id: 'mod-annuity-types',
    code: 'GCF-303',
    title: 'Annuity Types Explained',
    subtitle: 'MYGA, FIA, SPIA, RILA - When to Use Each',
    description: 'Comprehensive guide to annuity types, their features, and appropriate uses for different client situations.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 30,
    sections: [
      {
        id: 'sec-ann-types-1',
        title: 'What Annuities Actually Do',
        duration: 5,
        content: `Before diving into types, understand what annuities fundamentally solve.

THE CORE PURPOSE:
Annuities convert a lump sum into guaranteed income—solving the risk of outliving your money.

THE LONGEVITY PROBLEM:
• Average 65-year-old will live 20+ more years
• Half will live longer than average
• Running out of money is a real risk
• Social Security often isn't enough
• Pensions are increasingly rare

WHAT ANNUITIES PROVIDE:
1. Accumulation - Tax-deferred growth during working years
2. Income - Guaranteed payments in retirement
3. Protection - From market losses (in some types)
4. Legacy - Death benefits for beneficiaries

THE TWO PHASES:
Accumulation Phase:
• Money goes into the annuity
• Grows tax-deferred
• No income payments yet

Annuitization/Income Phase:
• Convert accumulated value to income stream
• Can be for life or set period
• Once annuitized, typically can't change

IMPORTANT DISTINCTION:
Not all annuities require annuitization. Many modern products offer:
• Lifetime income without giving up control
• Flexible withdrawal options
• Death benefits for beneficiaries

WHO ANNUITIES ARE FOR:
• People concerned about outliving their money
• Those wanting guaranteed income in retirement
• Savers seeking tax-deferred growth
• Risk-averse investors wanting principal protection

WHO ANNUITIES ARE NOT FOR:
• Those needing full liquidity
• Young investors with long time horizons
• High-net-worth individuals with other options
• Anyone who doesn't understand the product`,
        keyPoints: [
          'Annuities solve longevity risk - outliving your money',
          'Two phases: accumulation and income',
          'Modern annuities offer flexibility without full annuitization',
          'Tax-deferred growth during accumulation',
          'Not appropriate for everyone - must match client needs'
        ]
      },
      {
        id: 'sec-ann-types-2',
        title: 'MYGA - Multi-Year Guaranteed Annuity',
        duration: 5,
        content: `MYGA is the simplest annuity type - think of it as a CD from an insurance company.

HOW MYGA WORKS:
• Deposit a lump sum
• Earn a guaranteed interest rate
• Rate is locked for the guarantee period (3, 5, 7, or 10 years)
• At end of period: withdraw, renew, or transfer

KEY FEATURES:
• Guaranteed rate - no market risk
• Tax-deferred growth
• Principal protection
• Simple, easy to understand
• Lower fees than other annuity types

TYPICAL RATES (as of 2025-2026):
• 3-year MYGA: 4.5-5.5%
• 5-year MYGA: 5.0-6.0%
• 7-year MYGA: 5.0-5.8%
(Rates change with interest rate environment)

ADVANTAGES:
• Higher rates than bank CDs
• Tax deferral (CDs taxed annually)
• Insurance company guarantees
• No annual fees or management costs
• Simple product, easy to explain

DISADVANTAGES:
• Surrender charges during guarantee period
• Interest taxed as ordinary income (not capital gains)
• No inflation protection
• Opportunity cost if rates rise
• Required minimum distributions (RMDs) apply

IDEAL CLIENTS:
• Conservative investors seeking safe growth
• Those with CDs wanting better rates
• People in high tax brackets (deferral benefit)
• Pre-retirees building guaranteed savings
• Part of a diversified retirement portfolio

EXAMPLE:
Client age 58, $100,000 to invest
5-year MYGA at 5.5%
After 5 years: approximately $130,700
Tax-deferred until withdrawal
No risk of market loss`,
        keyPoints: [
          'MYGA = CD-like product with guaranteed rate',
          'Rates locked for guarantee period',
          'Tax-deferred growth advantage over CDs',
          'Surrender charges apply during term',
          'Ideal for conservative savers'
        ]
      },
      {
        id: 'sec-ann-types-3',
        title: 'FIA - Fixed Indexed Annuity',
        duration: 7,
        content: `FIA combines principal protection with market-linked growth potential—similar concept to IUL but for accumulation and income.

HOW FIA WORKS:
• Premium earns interest based on index performance
• Floor protects against losses (typically 0%)
• Cap or participation rate limits gains
• Option to add income rider for guaranteed lifetime income

KEY FEATURES:
• Principal protection - can't lose money due to market
• Growth potential linked to market index
• Tax-deferred accumulation
• Optional lifetime income guarantees
• Death benefit for beneficiaries

CREDITING METHODS (Same as IUL):
• Annual point-to-point
• Monthly point-to-point
• Monthly average
• Performance triggered

INCOME RIDERS:
Most FIAs offer optional income riders:
• GLWB (Guaranteed Lifetime Withdrawal Benefit)
• Guarantees a percentage you can withdraw for life
• Typically 4-6% of income base annually
• Income base may grow at guaranteed rate or step-ups
• Rider has additional annual fee (0.75-1.25%)

ADVANTAGES:
• Upside potential without downside risk
• Lifetime income option
• Tax deferral
• More growth potential than MYGA
• Nursing home/terminal illness waivers available

DISADVANTAGES:
• More complex than MYGA
• Surrender periods typically 7-10 years
• Rider fees reduce overall return
• Caps limit upside in strong markets
• Income riders have specific rules

IDEAL CLIENTS:
• Those wanting growth with protection
• Pre-retirees planning for income
• Risk-averse but want market participation
• People concerned about outliving income
• Those who can lock up funds for 7-10 years

FIA VS IUL:
• FIA: Primarily for accumulation and income
• IUL: Primarily for death benefit and cash access
• FIA: No life insurance component
• IUL: Requires insurability
• Both: Index-linked with protection`,
        keyPoints: [
          'FIA = Index-linked growth with principal protection',
          'Optional income riders provide lifetime income',
          'Similar crediting concepts as IUL',
          'Longer surrender periods than MYGA',
          'Ideal for those wanting growth + protection'
        ]
      },
      {
        id: 'sec-ann-types-4',
        title: 'SPIA - Single Premium Immediate Annuity',
        duration: 6,
        content: `SPIA provides immediate guaranteed income - converting a lump sum into a pension-like payment stream.

HOW SPIA WORKS:
• Deposit lump sum (single premium)
• Payments begin immediately (within 12 months)
• Payments continue for life or set period
• Once started, typically irrevocable

PAYOUT OPTIONS:
1. Life Only - Highest payment, ends at death
2. Life with Period Certain - Pays for life, minimum period guaranteed (10, 20 years)
3. Joint Life - Pays until both spouses die
4. Joint with Survivor Reduction - Reduces after first death
5. Period Certain Only - Pays for set period regardless of death

PAYOUT FACTORS:
Payment amount depends on:
• Amount deposited
• Age at purchase (older = higher payment)
• Gender (women typically get lower payments - longer life expectancy)
• Interest rates at time of purchase
• Payout option selected
• Carrier's pricing

EXAMPLE:
65-year-old male, $200,000 premium
Life only: approximately $1,200/month
Life with 20-year certain: approximately $1,050/month
Joint life (both 65): approximately $950/month

ADVANTAGES:
• Highest guaranteed income per dollar
• Simplicity - no decisions after purchase
• Longevity insurance - can't outlive it
• Portion of payment is return of principal (tax advantage)
• Peace of mind and predictability

DISADVANTAGES:
• Irrevocable - can't change your mind
• No liquidity - money is "gone"
• Inflation erodes purchasing power
• No legacy if life only selected
• Locked in at current interest rates

IDEAL CLIENTS:
• Those with pension shortfall
• People prioritizing guaranteed income over legacy
• Healthy individuals likely to live long
• Those who have already covered other needs
• Part of overall retirement income plan

WHEN TO USE SPIA:
• Client needs immediate income
• Has other assets for liquidity and legacy
• Wants maximum income per dollar
• Concerned about outliving money
• Has Social Security + needs additional guaranteed income`,
        keyPoints: [
          'SPIA = Immediate income from lump sum',
          'Various payout options (life only, period certain, joint)',
          'Irrevocable once started',
          'Highest income per dollar of all annuity types',
          'Best for those prioritizing income over liquidity/legacy'
        ]
      },
      {
        id: 'sec-ann-types-5',
        title: 'RILA - Registered Indexed Linked Annuity',
        duration: 5,
        content: `RILA is the newest annuity type - offering more upside potential in exchange for accepting some downside risk.

HOW RILA WORKS:
• Links to market index like FIA
• BUT: You accept some downside risk (buffer or floor)
• In exchange: Higher caps or uncapped participation
• Classified as a security (registered with SEC)

RISK MANAGEMENT OPTIONS:

Buffer:
• Carrier absorbs first X% of losses
• You absorb losses beyond the buffer
• Example: 10% buffer, market down 15% = you lose 5%
• Example: 10% buffer, market down 8% = you lose 0%

Floor:
• You absorb losses up to the floor
• Carrier absorbs losses beyond floor
• Example: -10% floor, market down 15% = you lose 10%
• Example: -10% floor, market down 8% = you lose 8%

EXAMPLE COMPARISON:
Market up 20%:
• FIA with 10% cap: You earn 10%
• RILA with 20% cap: You earn 20%

Market down 25%:
• FIA: You earn 0%
• RILA with 10% buffer: You lose 15%

ADVANTAGES:
• Higher growth potential than FIA
• More upside capture in strong markets
• Buffer provides meaningful protection
• Can be appropriate for longer time horizons
• Competitive in rising markets

DISADVANTAGES:
• You CAN lose money (unlike FIA)
• More complex to explain
• Requires client to accept risk
• Securities licensed agent required
• May not be suitable for risk-averse clients

IDEAL CLIENTS:
• Those comfortable with some risk
• Longer time horizons (10+ years)
• Clients frustrated by FIA caps
• Those who want annuity benefits with more upside
• Not appropriate for ultra-conservative clients

SUITABILITY CAUTION:
RILA is NOT for clients who:
• Cannot afford any loss
• Need guaranteed protection
• Have short time horizons
• Don't understand they can lose money
• Are seeking "safe" alternatives`,
        keyPoints: [
          'RILA accepts some risk for higher potential',
          'Buffer absorbs first X% of losses',
          'Higher caps or uncapped participation',
          'Classified as security - additional licensing required',
          'Not for risk-averse clients'
        ],
        complianceNotes: [
          'RILA requires securities license (Series 6 or 7)',
          'Must clearly explain client CAN lose money',
          'Document client understanding of risk',
          'Not suitable for all annuity clients'
        ]
      },
      {
        id: 'sec-ann-types-6',
        title: 'Annuity Selection Framework',
        duration: 2,
        content: `Use this framework to match annuity type to client needs.

DECISION TREE:

Does client need income NOW?
• Yes → SPIA
• No → Continue

Is client ultra-conservative (zero loss tolerance)?
• Yes → MYGA or FIA
• No → Consider RILA

Does client want growth potential?
• No → MYGA
• Yes → FIA or RILA

Is client comfortable with some risk?
• No → FIA
• Yes → RILA

How long until client needs the money?
• Under 5 years → MYGA (shorter term)
• 5-10 years → FIA
• 10+ years → FIA or RILA

Does client want lifetime income guarantee?
• Yes → FIA with income rider or SPIA
• No → MYGA, FIA, or RILA

COMBINATION STRATEGIES:
• MYGA ladder: Multiple MYGAs maturing in different years
• FIA + SPIA: Growth portion + immediate income portion
• IUL + FIA: Life insurance + retirement accumulation

KEY PRINCIPLE:
No single annuity type is "best." Match the product to the client's specific needs, timeline, and risk tolerance.`,
        keyPoints: [
          'Use decision tree to match product to need',
          'SPIA for immediate income',
          'MYGA for conservative guaranteed growth',
          'FIA for growth with protection',
          'RILA for higher potential with accepted risk'
        ]
      }
    ],
    learningObjectives: [
      'Explain the fundamental purpose of annuities',
      'Differentiate between MYGA, FIA, SPIA, and RILA',
      'Identify appropriate clients for each annuity type',
      'Apply selection framework to client scenarios',
      'Understand risk/reward tradeoffs of each type'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-life-foundations'],
    assessmentRequired: true,
    assessmentId: 'assess-annuity-types',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // RIDERS & LIVING BENEFITS
  // -------------------------------------------------------------------------
  {
    id: 'mod-riders-benefits',
    code: 'GCF-304',
    title: 'Riders & Living Benefits',
    subtitle: 'LTC Riders, Chronic Illness, and Income Options',
    description: 'Understanding policy riders that provide benefits while the insured is still alive, including accelerated death benefits and long-term care options.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-riders-1',
        title: 'What Are Living Benefits?',
        duration: 4,
        content: `Living benefits allow access to death benefit while the insured is still alive under qualifying circumstances.

THE SHIFT IN LIFE INSURANCE:
Traditional life insurance only paid at death. Modern products recognize that people need protection for events OTHER than death.

TYPES OF LIVING BENEFITS:
1. Accelerated Death Benefits (ADB) - Access death benefit for terminal illness
2. Chronic Illness Riders - Access for inability to perform daily activities
3. Critical Illness Riders - Access for specific illnesses (heart attack, stroke, cancer)
4. Long-Term Care Riders - Access to cover long-term care costs

WHY LIVING BENEFITS MATTER:
• 70% of people over 65 will need some long-term care
• Average nursing home costs $90,000+/year
• Medicare does NOT cover custodial long-term care
• Chronic illness can deplete savings quickly
• Traditional LTC insurance is expensive and hard to qualify for

THE VALUE PROPOSITION:
"This policy doesn't just protect your family when you die—it can also protect YOU if you get seriously ill."

HOW THEY WORK (Generally):
• Policy includes rider (sometimes included, sometimes additional cost)
• Qualifying event triggers access
• Percentage of death benefit becomes available
• Remaining death benefit continues for beneficiaries
• Some reduce death benefit dollar-for-dollar, others use discounted basis

KEY POINT:
Living benefits have transformed life insurance from "die to win" to protection that can help throughout life's challenges.`,
        keyPoints: [
          'Living benefits provide access while insured is alive',
          'Include chronic illness, critical illness, and LTC options',
          '70% of people 65+ will need long-term care',
          'Transforms life insurance into comprehensive protection',
          'Can access death benefit for qualifying health events'
        ]
      },
      {
        id: 'sec-riders-2',
        title: 'Accelerated Death Benefit (ADB)',
        duration: 5,
        content: `ADB is the most basic living benefit—required to be offered in most states for terminal illness.

TERMINAL ILLNESS ADB:
• Triggers when diagnosed with terminal illness
• Terminal typically defined as 12-24 months life expectancy
• Allows access to portion of death benefit (usually up to 75-90%)
• May be discounted based on life expectancy
• Remaining benefit pays to beneficiaries at death

EXAMPLE:
Client has $500,000 policy
Diagnosed with terminal illness (12 month prognosis)
Can access up to $375,000 (75%)
Receives $340,000 (discounted for early payment)
$125,000 remains for beneficiaries

TAX TREATMENT:
• Generally received tax-free under IRC Section 101(g)
• Must be terminally ill as defined by IRS (24 months or less)
• Consult tax professional for specific situations

COST:
• Many policies include basic terminal illness ADB at no additional cost
• It's often a standard policy provision, not an optional rider
• Check policy documents for specific terms

IMPORTANT LIMITATIONS:
• Only for terminal illness (not chronic or critical)
• May reduce death benefit dollar-for-dollar or more
• Specific definition of "terminal" varies by policy
• Some policies have waiting periods
• Administrative fee may apply at time of claim

WHEN TO MENTION:
Always mention terminal illness ADB when presenting life insurance:
"This policy includes protection if you become terminally ill—you can access a portion of the death benefit to cover expenses, spend time with family, or do whatever matters most to you."`,
        keyPoints: [
          'ADB allows access for terminal illness',
          'Typically 12-24 month life expectancy required',
          'Usually included at no additional cost',
          'Generally received tax-free',
          'Remaining benefit passes to beneficiaries'
        ]
      },
      {
        id: 'sec-riders-3',
        title: 'Chronic Illness Riders',
        duration: 6,
        content: `Chronic illness riders provide access when the insured cannot perform activities of daily living—regardless of life expectancy.

QUALIFYING CRITERIA (Typically):
Must be unable to perform 2 of 6 Activities of Daily Living (ADLs):
1. Bathing - Washing oneself
2. Dressing - Putting on/taking off clothes
3. Eating - Feeding oneself
4. Toileting - Using the bathroom
5. Transferring - Moving in/out of bed or chair
6. Continence - Controlling bladder/bowel

OR: Severe cognitive impairment requiring substantial supervision

HOW IT WORKS:
• Doctor certifies inability to perform ADLs
• Policy pays monthly or lump sum benefit
• Typically percentage of death benefit (up to 90-100% over time)
• Benefit may be discounted from death benefit
• Remaining death benefit goes to beneficiaries

BENEFIT CALCULATION METHODS:
1. Dollar-for-Dollar - Death benefit reduces by amount paid
2. Discounted - Pays less than dollar-for-dollar (carrier profit built in)
3. Indemnity - Fixed monthly amount regardless of actual expenses
4. Reimbursement - Pays for actual qualified expenses

EXAMPLE:
$500,000 policy with chronic illness rider
Client unable to perform 2 ADLs
Can access $4,000/month (up to 90% of death benefit over time)
After receiving $150,000, death benefit reduced accordingly

ADVANTAGES OVER TRADITIONAL LTC:
• Included in life insurance (doesn't require separate policy)
• Life insurance underwriting (may be easier than LTC underwriting)
• If never used, death benefit goes to family
• Premium doesn't increase with age
• Guaranteed renewable with life policy

COST:
• Some policies include at no additional premium
• Others charge additional premium (0.5-2% of base premium)
• Cost varies significantly by carrier and product

IMPORTANT CAUTIONS:
• Reduces death benefit—may impact beneficiary planning
• Definition of chronic illness varies by policy
• Elimination period may apply (usually 90 days)
• May require annual recertification
• Not a replacement for comprehensive LTC planning`,
        keyPoints: [
          'Triggers when unable to perform 2 of 6 ADLs',
          'Or severe cognitive impairment',
          'Benefit paid monthly or lump sum',
          'Reduces remaining death benefit',
          'Easier qualification than standalone LTC insurance'
        ]
      },
      {
        id: 'sec-riders-4',
        title: 'Critical Illness Riders',
        duration: 5,
        content: `Critical illness riders pay a benefit upon diagnosis of specified serious illnesses—not based on inability to work or perform ADLs.

COMMONLY COVERED CONDITIONS:
• Heart attack (myocardial infarction)
• Stroke (cerebrovascular accident)
• Cancer (invasive, usually excludes skin cancer)
• Kidney failure (end-stage renal disease)
• Major organ transplant
• Coronary artery bypass surgery

SOME POLICIES ALSO INCLUDE:
• ALS (Lou Gehrig's disease)
• Multiple sclerosis
• Parkinson's disease
• Blindness
• Paralysis
• Severe burns

HOW IT WORKS:
• Diagnosis of covered condition triggers benefit
• Lump sum payment (percentage of death benefit)
• No requirement to be unable to work
• Survival period may apply (must survive 30 days after diagnosis)
• Death benefit reduced by amount paid

EXAMPLE:
$400,000 policy with critical illness rider (50% max benefit)
Client diagnosed with cancer
Receives $200,000 lump sum
Remaining death benefit: $200,000

USE OF FUNDS:
Unlike LTC or chronic illness benefits, critical illness payments can be used for ANYTHING:
• Medical expenses not covered by insurance
• Lost income during treatment
• Travel for treatment
• Pay off debt
• Quality of life improvements
• Take a trip
• Pay the mortgage

ADVANTAGES:
• Lump sum provides maximum flexibility
• No need to prove inability to work
• Can be used for any purpose
• Diagnosis-based trigger is clear
• Peace of mind for families with history of illness

LIMITATIONS:
• Only covers specified conditions
• Definitions of conditions may be strict
• Survival period required (usually 30 days)
• Reduces death benefit
• May have caps on benefit amount

COMPARISON:
Critical Illness vs Chronic Illness:
• Critical = Specific diagnosis (cancer, heart attack)
• Chronic = Functional limitation (can't perform ADLs)
• Critical = Lump sum typically
• Chronic = Monthly payments typically
• Both reduce death benefit`,
        keyPoints: [
          'Pays lump sum upon diagnosis of covered illness',
          'No need to prove inability to work',
          'Funds can be used for any purpose',
          'Survival period typically required',
          'Only covers specified conditions'
        ]
      },
      {
        id: 'sec-riders-5',
        title: 'Long-Term Care Riders',
        duration: 5,
        content: `LTC riders provide more comprehensive coverage than chronic illness riders, often with specific features designed for long-term care needs.

LTC RIDER VS CHRONIC ILLNESS RIDER:
The terms are sometimes used interchangeably, but true LTC riders typically offer:
• Higher monthly benefits
• Longer benefit periods
• Inflation protection options
• Partnership program qualification (in some states)
• More comprehensive coverage

HOW LTC RIDERS WORK:
• Trigger: Unable to perform ADLs or cognitively impaired
• Benefit: Monthly amount based on policy design
• Duration: Until death benefit exhausted or specified period
• Death benefit: Reduced by benefits paid

TYPES OF LTC RIDERS:
1. Extension of Benefits - Continues paying after death benefit exhausted
2. Combination/Hybrid - Life insurance with substantial LTC component
3. Accelerated - Simply accelerates death benefit (more basic)

EXAMPLE - HYBRID POLICY:
$250,000 death benefit
LTC rider provides $5,000/month
50 months of LTC coverage available
If only $100,000 used for LTC, $150,000 death benefit remains
Some policies extend benefits beyond death benefit

INFLATION PROTECTION:
Many LTC riders offer inflation options:
• Simple inflation: Benefit increases by set % annually
• Compound inflation: Benefit increases compound (more valuable)
• Step-ups: Option to increase coverage at intervals
• Cost: Significantly increases premium

PARTNERSHIP PROGRAMS:
Some states offer "Partnership" qualification:
• If your LTC insurance meets state requirements
• Assets are protected from Medicaid spend-down
• Allows qualification for Medicaid while keeping assets
• Complex rules—must verify policy qualifies

COST:
LTC riders add significant cost to life insurance:
• May increase premium 20-50% or more
• More comprehensive coverage = higher cost
• Inflation protection adds more cost
• Still often cheaper than standalone LTC insurance

WHEN TO RECOMMEND:
• Clients concerned about LTC costs
• Those who can't qualify for or afford standalone LTC
• People who want "money back" if they don't need care
• Families with history of conditions requiring long-term care`,
        keyPoints: [
          'More comprehensive than basic chronic illness riders',
          'May include inflation protection and extension benefits',
          'Hybrid policies combine life insurance with LTC',
          'Partnership programs protect assets in some states',
          'Significantly increases premium but often cheaper than standalone LTC'
        ],
        complianceNotes: [
          'Clearly differentiate chronic illness vs LTC riders',
          'Disclose that death benefit is reduced',
          'LTC riders are not standalone LTC insurance',
          'Partnership qualification varies by state'
        ]
      }
    ],
    learningObjectives: [
      'Explain the purpose and value of living benefits',
      'Differentiate between ADB, chronic illness, critical illness, and LTC riders',
      'Identify qualifying triggers for each type of rider',
      'Explain how benefits are calculated and paid',
      'Match living benefit riders to client needs'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-life-foundations'],
    assessmentRequired: true,
    assessmentId: 'assess-riders-benefits',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // TAX ADVANTAGES OF LIFE INSURANCE
  // -------------------------------------------------------------------------
  {
    id: 'mod-tax-advantages',
    code: 'GCF-305',
    title: 'Tax Advantages of Life Insurance',
    subtitle: 'Understanding Tax-Free and Tax-Deferred Benefits',
    description: 'Comprehensive guide to the tax benefits of life insurance including death benefit treatment, cash value growth, and policy loan strategies.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 20,
    sections: [
      {
        id: 'sec-tax-1',
        title: 'Tax-Free Death Benefit',
        duration: 4,
        content: `The death benefit is the primary tax advantage of life insurance—it passes to beneficiaries income tax-free.

THE BASIC RULE:
Under IRC Section 101(a), life insurance death benefits are generally received income tax-free by beneficiaries.

EXAMPLE:
$500,000 death benefit paid to beneficiary
Beneficiary receives: $500,000 (no income tax)
Amount that would be lost to income tax if taxed at 24%: $120,000

WHY THIS MATTERS:
• Creates efficient wealth transfer
• Beneficiaries receive full benefit
• No complex tax planning required for basic cases
• Immediate liquidity without tax consequences

EXCEPTIONS TO TAX-FREE TREATMENT:

1. Transfer for Value Rule
If a policy is sold or transferred for valuable consideration, the death benefit may become taxable. Exceptions exist for transfers to:
• The insured
• A partner of the insured
• A partnership in which the insured is a partner
• A corporation in which the insured is a shareholder or officer

2. Employer-Owned Life Insurance (EOLI)
Special rules apply when employers own policies on employees. Notice and consent requirements must be met, or death benefit may be taxable.

3. Interest on Death Benefit
If death benefit is held by carrier and paid in installments, the interest portion IS taxable.

ESTATE TAX CONSIDERATION:
While income tax-free, death benefits ARE included in the estate for estate tax purposes if:
• Decedent owned the policy (had incidents of ownership)
• Death benefit is payable to the estate

Solution: Irrevocable Life Insurance Trust (ILIT) removes policy from estate.

IMPORTANT NOTE:
We can explain these concepts but should not provide tax advice. Always recommend clients consult their tax professional.`,
        keyPoints: [
          'Death benefits are generally income tax-free',
          'Full benefit passes to beneficiaries',
          'Transfer for value rule can create taxability',
          'Special rules for employer-owned policies',
          'Estate tax may apply if policy in estate'
        ],
        complianceNotes: [
          'Do not provide tax advice',
          'Recommend consultation with tax professional',
          'Explain general rules, not specific client situations'
        ]
      },
      {
        id: 'sec-tax-2',
        title: 'Tax-Deferred Cash Value Growth',
        duration: 5,
        content: `Cash value inside life insurance grows tax-deferred—meaning no taxes until you access it.

HOW TAX DEFERRAL WORKS:
• Cash value grows each year
• No 1099 issued, no taxes due
• Growth compounds without annual tax drag
• Similar benefit to IRA/401(k) but with more flexibility

THE POWER OF TAX DEFERRAL:
Example over 20 years:
• $50,000 in taxable account, 6% return, 24% tax bracket
• After-tax return: approximately 4.56%
• After 20 years: approximately $121,000

• $50,000 in life insurance cash value, 6% return
• Tax-deferred growth
• After 20 years: approximately $160,000

Difference: $39,000 more due to tax deferral

COMPARISON TO OTHER TAX-ADVANTAGED ACCOUNTS:

Life Insurance Cash Value:
• No contribution limits
• No income limits
• Access before 59½ without penalty
• No required minimum distributions
• Tax-free access via loans (if done correctly)

IRA/401(k):
• Contribution limits apply
• May have income limits
• 10% penalty before 59½
• RMDs required at 73
• Taxed as ordinary income on withdrawal

Roth IRA:
• Contribution limits apply
• Income limits apply
• Tax-free growth and withdrawal
• No RMDs
• 5-year waiting period

IMPORTANT CAVEAT:
Life insurance must be a life insurance contract (not a Modified Endowment Contract) to maintain these tax advantages. Over-funding can jeopardize favorable tax treatment.`,
        keyPoints: [
          'Cash value grows tax-deferred',
          'No 1099, no annual taxes on growth',
          'Compounding advantage over taxable accounts',
          'No contribution limits like retirement accounts',
          'Must avoid MEC status to maintain tax benefits'
        ]
      },
      {
        id: 'sec-tax-3',
        title: 'Tax-Free Policy Loans',
        duration: 5,
        content: `Policy loans may allow tax-free access to cash value—one of the most powerful features of permanent life insurance.

HOW POLICY LOANS WORK:
• Borrow against your cash value
• Carrier pays you from their general account
• Your cash value serves as collateral
• Interest is charged on the loan
• No credit check, no application, no questions

TAX TREATMENT OF LOANS:
• Loans are NOT considered taxable income
• You are borrowing, not withdrawing
• As long as policy remains in force, no tax
• Can use funds for any purpose

EXAMPLE:
$200,000 cash value in IUL
Take $50,000 policy loan
No income tax due
Death benefit reduced by $50,000 until repaid
Interest accrues on loan balance

CRITICAL REQUIREMENT:
Policy must remain in force for loans to stay tax-free. If policy lapses with outstanding loans, the gain becomes taxable.

Example of tax disaster:
$200,000 cash value, $100,000 basis (premiums paid)
$150,000 in outstanding loans
Policy lapses
Taxable gain: $100,000 (cash value - basis)
Tax at 24%: $24,000 owed to IRS

BEST PRACTICES FOR POLICY LOANS:
• Monitor policy health regularly
• Ensure sufficient cash value to cover charges
• Consider repaying loans if possible
• Don't over-leverage the policy
• Work with carrier or agent to project sustainability

LOAN VS WITHDRAWAL:
Withdrawals:
• Up to basis (premiums paid) are tax-free
• Gains above basis are taxed
• Reduces cash value directly
• FIFO rules apply (basis out first)

Loans:
• Entire amount is tax-free (if policy stays in force)
• Interest charged
• Cash value remains (as collateral)
• Must monitor policy health

STRATEGY:
Withdraw up to basis first (tax-free), then use loans for amounts above basis to avoid taxation.`,
        keyPoints: [
          'Policy loans are not taxable income',
          'Must keep policy in force to maintain tax-free status',
          'Policy lapse with loans triggers taxable event',
          'Withdraw basis first, then use loans',
          'Monitor policy health when taking loans'
        ]
      },
      {
        id: 'sec-tax-4',
        title: 'MEC Rules - What to Avoid',
        duration: 4,
        content: `Modified Endowment Contract (MEC) status eliminates key tax advantages. Understanding MEC rules is essential.

WHAT IS A MEC?
A life insurance policy that has been over-funded according to IRS rules (the 7-Pay Test). Once a MEC, always a MEC.

THE 7-PAY TEST:
• IRS calculates the maximum premium that could be paid over 7 years to fund a paid-up policy
• If cumulative premiums in any of the first 7 years exceed this limit, policy becomes a MEC
• Test restarts with certain policy changes

WHY MEC STATUS MATTERS:
Loans and withdrawals are taxed differently:

Non-MEC:
• Withdrawals: FIFO (basis out first, tax-free up to basis)
• Loans: Not taxable if policy stays in force

MEC:
• Withdrawals: LIFO (gains out first, taxable)
• Loans: Treated as taxable distributions
• 10% penalty if under age 59½

EXAMPLE:
$100,000 cash value, $60,000 basis, $40,000 gain

Non-MEC withdrawal of $30,000:
• Tax-free (comes from basis first)

MEC withdrawal of $30,000:
• Taxable (gain comes out first)
• Plus 10% penalty if under 59½
• Tax + penalty could be $10,000+

WHAT DOESN'T CHANGE WITH MEC:
• Death benefit still income tax-free
• Cash value still grows tax-deferred
• Policy still functions as life insurance

HOW TO AVOID MEC:
• Follow carrier funding guidelines
• Don't max-fund too quickly
• Use "MEC compliance" premium calculations
• If approaching MEC, adjust funding
• Some carriers offer automatic MEC monitoring

WHEN MEC MIGHT BE ACCEPTABLE:
• Single premium life insurance for estate planning
• Client doesn't need cash access
• Goal is purely death benefit delivery
• Tax-free death benefit is primary concern`,
        keyPoints: [
          '7-Pay Test determines MEC status',
          'MEC changes how loans/withdrawals are taxed',
          'Gains taxed first (LIFO) in a MEC',
          '10% penalty under 59½ for MEC distributions',
          'Death benefit remains tax-free even if MEC'
        ],
        complianceNotes: [
          'Always discuss MEC implications when funding strategies discussed',
          'Document that client understands MEC risk if aggressive funding',
          'Carriers provide MEC testing - use their calculations'
        ]
      },
      {
        id: 'sec-tax-5',
        title: 'Retirement Income Strategy',
        duration: 2,
        content: `Tax-advantaged distributions from life insurance can supplement retirement income without increasing tax bracket or affecting Social Security.

THE STRATEGY:
Use policy loans to create tax-free retirement income:
1. Build cash value during working years
2. Take loans in retirement
3. Loans are not taxable income
4. Don't count toward provisional income (Social Security taxation)
5. Death benefit pays off loans at death

BENEFITS:
• Tax-free income in retirement
• Doesn't affect Social Security taxation
• Doesn't increase Medicare premiums (IRMAA)
• Flexible - take what you need when you need it
• Remaining death benefit to beneficiaries

EXAMPLE:
Retiree with:
• $40,000 Social Security
• $30,000 from IRA (taxable)
• $20,000 from life insurance loan (not taxable)

Only $70,000 counts as taxable income, not $90,000

CAUTIONS:
• Must be planned properly
• Policy must be adequately funded
• Loans must be sustainable
• Not a guarantee - depends on policy performance
• Consult tax professional for specific planning

THIS IS AN ADVANCED CONCEPT:
Don't lead with this when presenting life insurance. The primary purpose should be protection. Tax advantages are secondary benefits that can be optimized with proper planning.`,
        keyPoints: [
          'Policy loans can provide tax-free retirement income',
          'Loans don\'t count for Social Security taxation',
          'Loans don\'t affect Medicare premiums',
          'Must be planned carefully to be sustainable',
          'Protection is primary, tax benefits are secondary'
        ]
      }
    ],
    learningObjectives: [
      'Explain why death benefits are income tax-free',
      'Describe the advantages of tax-deferred cash value growth',
      'Explain how policy loans can provide tax-free access',
      'Identify what causes MEC status and its implications',
      'Understand the retirement income strategy concept'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-life-foundations', 'mod-iul-strategies'],
    assessmentRequired: true,
    assessmentId: 'assess-tax-advantages',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // READING POLICY ILLUSTRATIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-illustrations',
    code: 'GCF-306',
    title: 'Reading Policy Illustrations',
    subtitle: 'How to Explain Projections Without Overpromising',
    description: 'Learn to read, interpret, and explain policy illustrations to clients accurately and compliantly.',
    category: 'product',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-illus-1',
        title: 'What Is an Illustration?',
        duration: 4,
        content: `A policy illustration is a projection showing how a life insurance policy might perform over time. It is NOT a guarantee.

PURPOSE OF ILLUSTRATIONS:
• Show how premiums, cash value, and death benefit might develop
• Compare policy design options
• Help clients understand how the product works
• Provide basis for policy purchase decision

WHAT ILLUSTRATIONS SHOW:
• Year-by-year projections (often to age 100 or beyond)
• Premium payments
• Death benefit
• Cash value (accumulation value)
• Cash surrender value (after surrender charges)
• Policy loans and withdrawals (if any)
• Policy charges and expenses

CRITICAL UNDERSTANDING:
Illustrations are projections based on ASSUMPTIONS:
• Current interest rates or index credits
• Current cost of insurance charges
• Current expense charges
• Policy remaining in force

ASSUMPTIONS CAN CHANGE:
• Interest rates may be higher or lower
• Index performance will vary from projections
• Cost of insurance can increase
• Policy charges may change
• Actual results WILL differ from illustration

COMPLIANCE REQUIREMENTS:
• Must provide illustration at or before application
• Must explain non-guaranteed elements
• Must show both guaranteed and current assumptions
• Must get client signature acknowledging receipt

WHAT TO TELL CLIENTS:
"This illustration shows how the policy might perform based on today's assumptions. Actual results will be different—possibly better, possibly worse. The only guarantees are in the guaranteed column."`,
        keyPoints: [
          'Illustrations are projections, NOT guarantees',
          'Based on current assumptions that can change',
          'Must show both guaranteed and non-guaranteed columns',
          'Actual results WILL differ from illustration',
          'Required for compliance - client must sign'
        ]
      },
      {
        id: 'sec-illus-2',
        title: 'Understanding the Columns',
        duration: 6,
        content: `Illustrations typically show multiple columns with different assumptions. Understanding each is critical.

GUARANTEED COLUMN:
• Shows worst-case scenario the carrier guarantees
• Minimum interest rate credited
• Maximum cost of insurance charged
• Maximum expenses charged
• Policy may lapse if only guaranteed values achieved
• This is the legal "floor" of policy performance

CURRENT/ILLUSTRATED COLUMN:
• Shows projections at current or assumed rates
• Interest rate: current crediting rate
• Costs: current cost of insurance
• Expenses: current charges
• More optimistic than guaranteed
• NOT guaranteed—just an illustration

MID-POINT COLUMN (If shown):
• Halfway between guaranteed and current
• Provides middle scenario
• May be more realistic than current
• Not always included

FOR IUL SPECIFICALLY:
State regulations (AG 49/49A) limit illustrated rates:
• Maximum illustrated rate is capped
• Must use benchmark index performance
• Cannot use best-case historical returns
• Designed to prevent over-promising

TYPICAL COLUMNS IN IUL ILLUSTRATION:
1. Year/Policy Year/Age
2. Premium Outlay (what you pay)
3. Guaranteed Cash Value
4. Guaranteed Death Benefit
5. Non-Guaranteed Cash Value (at illustrated rate)
6. Non-Guaranteed Death Benefit
7. Policy Loan Amount (if applicable)
8. Net Cash Surrender Value
9. Net Death Benefit

KEY QUESTION TO ASK:
"At what illustrated rate is this showing?" If they don't know, the illustration may be using maximum allowable rates.`,
        keyPoints: [
          'Guaranteed column shows worst-case carrier promises',
          'Current column shows projections at assumed rates',
          'IUL illustrations are regulated by AG 49',
          'Multiple columns help show range of outcomes',
          'Always ask what rate the illustration assumes'
        ]
      },
      {
        id: 'sec-illus-3',
        title: 'Reading Between the Lines',
        duration: 6,
        content: `Beyond the basic columns, understanding key metrics helps evaluate illustrations accurately.

INTERNAL RATE OF RETURN (IRR):
What the policy "earns" based on premiums paid vs values received
• Death Benefit IRR: Return if client dies in any given year
• Cash Value IRR: Return on premium based on cash value
• Higher IRR earlier = better for protection
• Higher IRR later = better for accumulation

BREAKEVEN POINT:
When cash value equals total premiums paid
• Typically 10-15 years for IUL
• Shorter for whole life
• Important for understanding long-term commitment

PREMIUM VS MINIMUM PREMIUM:
• Target Premium: Recommended premium for illustrated values
• Minimum Premium: Lowest premium to keep policy in force
• Maximum Premium: Most you can pay without MEC
• Funding at minimum may cause policy to lapse

POLICY CHARGES:
Often shown in separate section:
• Cost of Insurance (COI): Mortality charge
• Premium Load: Percentage deducted from premium
• Administrative Fees: Monthly or annual charges
• Rider Charges: Cost of any added benefits
• Surrender Charges: Penalty for early surrender

WATCH FOR RED FLAGS:

1. Illustration assumes maximum rate forever
2. Policy shows lapse in guaranteed column
3. Minimum premium used but max benefits shown
4. Surrender charges not clearly shown
5. Cash value going down in later years
6. Death benefit decreasing unexpectedly

QUESTIONS TO ASK ABOUT ANY ILLUSTRATION:
• What interest rate is assumed?
• What happens in guaranteed scenario?
• When does the policy break even?
• What are the surrender charges?
• Can the costs of insurance increase?`,
        keyPoints: [
          'IRR shows actual return on premiums',
          'Breakeven point is when cash value equals premiums paid',
          'Understand difference between target and minimum premiums',
          'Watch for red flags in illustrations',
          'Ask key questions before presenting to client'
        ]
      },
      {
        id: 'sec-illus-4',
        title: 'Explaining Illustrations to Clients',
        duration: 5,
        content: `How you explain illustrations determines whether clients understand what they're buying.

THE RIGHT APPROACH:

Start with the Guaranteed Column:
"First, let me show you what the insurance company guarantees. These numbers are the minimum the policy will provide, even in worst-case scenario."

Then Show the Projected Column:
"Now, if current conditions continue, the policy could perform like this. This is not guaranteed—it's what we hope will happen based on today's rates."

Emphasize Variability:
"In reality, your policy will likely fall somewhere between these two columns. Some years will be better, some worse."

SCRIPTS THAT WORK:

For IUL:
"Your cash value will be credited based on how the index performs each year, subject to a cap and a floor. In good years, you might earn up to [cap]%. In down years, you won't earn less than [floor]%. This illustration shows an average assumption of [rate]%."

For Whole Life:
"This column shows what's guaranteed. This column shows what might happen if the company continues paying dividends like they have been. Dividends are never guaranteed, but this company has paid them for [X] years."

For Annuities:
"This shows your guaranteed minimum value and your projected value if current rates continue. The actual result will likely be somewhere in between."

WHAT TO AVOID:
• "You'll earn X%" - Not guaranteed
• "This is what you'll have" - It's a projection
• "It's guaranteed to do this" - Only guaranteed column is guaranteed
• Pointing only to projected column
• Ignoring the guaranteed values
• Using best-case scenarios as expectations

ALWAYS GET ACKNOWLEDGMENT:
"Do you understand that the projected values are not guaranteed and actual results may be higher or lower?"

Document this conversation.`,
        keyPoints: [
          'Start with guaranteed column',
          'Then explain projected/current column',
          'Emphasize actual results will vary',
          'Never present projections as guarantees',
          'Get and document client acknowledgment'
        ],
        complianceNotes: [
          'Never promise specific returns from illustrations',
          'Document client understanding of non-guaranteed elements',
          'Use carrier-provided illustrations only',
          'Client must sign illustration acknowledgment'
        ]
      },
      {
        id: 'sec-illus-5',
        title: 'Common Illustration Mistakes',
        duration: 4,
        content: `Avoiding these mistakes keeps you compliant and builds client trust.

MISTAKE 1: ONLY SHOWING BEST CASE
Problem: Showing only projected column at max rate
Fix: Always show guaranteed and at least one reduced rate scenario

MISTAKE 2: IGNORING THE GUARANTEED COLUMN
Problem: Client doesn't understand worst case
Fix: "If nothing goes right, here's what you're guaranteed"

MISTAKE 3: PROMISING SPECIFIC RETURNS
Problem: "You'll earn 7% in this policy"
Fix: "At an assumed rate of 7%, the policy would perform like this"

MISTAKE 4: USING OLD ILLUSTRATIONS
Problem: Rates may have changed since illustration was run
Fix: Always run fresh illustration close to application

MISTAKE 5: NOT EXPLAINING CHARGES
Problem: Client doesn't understand what they're paying
Fix: Walk through charges section and explain each

MISTAKE 6: OVER-COMPLICATED PRESENTATIONS
Problem: Client is confused by too much information
Fix: Focus on key metrics - premium, death benefit, cash value

MISTAKE 7: NOT GETTING SIGNATURE
Problem: Compliance violation
Fix: Client must sign illustration acknowledgment at application

MISTAKE 8: CHERRY-PICKING YEARS
Problem: "Look at year 20 - you'll have $X"
Fix: Discuss the journey, not just the destination

BEST PRACTICES:
• Run illustration same day or day before presentation
• Show multiple scenarios (current, mid, guaranteed)
• Walk through key years (5, 10, 15, 20)
• Point out when/if policy could lapse in guaranteed scenario
• Keep it simple - don't overwhelm with data
• Get questions and document answers
• Save illustration as part of client file`,
        keyPoints: [
          'Always show guaranteed column',
          'Never promise specific returns',
          'Run fresh illustrations',
          'Explain charges clearly',
          'Get client signature on illustration'
        ]
      }
    ],
    learningObjectives: [
      'Explain the purpose and limitations of policy illustrations',
      'Interpret guaranteed vs non-guaranteed columns',
      'Identify key metrics in illustrations',
      'Present illustrations compliantly to clients',
      'Avoid common illustration mistakes'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-iul-strategies', 'mod-tax-advantages'],
    assessmentRequired: true,
    assessmentId: 'assess-illustrations',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // =========================================================================
  // SALES METHODOLOGY MODULES
  // =========================================================================

  // -------------------------------------------------------------------------
  // DISCOVERY CALL MASTERY
  // -------------------------------------------------------------------------
  {
    id: 'mod-discovery-call',
    code: 'GCF-401',
    title: 'Discovery Call Mastery',
    subtitle: 'Questions, Listening, and Note-Taking',
    description: 'Master the art of the discovery call—asking the right questions, active listening, and capturing critical information for needs analysis.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-disc-1',
        title: 'Purpose of Discovery',
        duration: 5,
        content: `The discovery call has one purpose: understand the client's situation deeply enough to make appropriate recommendations.

WHAT DISCOVERY IS NOT:
• A sales pitch
• An opportunity to push products
• A checkbox exercise
• About you or your company

WHAT DISCOVERY IS:
• Learning the client's situation
• Understanding their goals and fears
• Identifying problems they may not realize they have
• Building rapport and trust
• Gathering facts for suitability

THE GOLDEN RULE OF DISCOVERY:
Talk 20%, Listen 80%

The more the client talks, the more you learn. The more they share, the more trust you build. Silence after questions is powerful—let them fill it.

WHAT YOU'RE TRYING TO LEARN:
1. Family Situation - Who depends on them?
2. Financial Snapshot - Income, debts, assets
3. Existing Coverage - What protection do they have?
4. Goals & Dreams - What do they want to accomplish?
5. Concerns & Fears - What keeps them up at night?
6. Decision Process - How do they make financial decisions?

WHY THIS MATTERS FOR COMPLIANCE:
Suitability requirements DEMAND you understand the client's situation. Inadequate discovery = inadequate suitability documentation = compliance risk.

THE DISCOVERY MINDSET:
Approach every call with genuine curiosity. You're not trying to sell—you're trying to understand if and how you can help.`,
        keyPoints: [
          'Discovery is about learning, not selling',
          'Talk 20%, Listen 80%',
          'Learn family, finances, coverage, goals, fears',
          'Suitability requires thorough discovery',
          'Genuine curiosity builds trust'
        ]
      },
      {
        id: 'sec-disc-2',
        title: 'Opening the Call',
        duration: 4,
        content: `The first 30 seconds determine the tone of the entire call.

THE OPENING FRAMEWORK:
1. Greeting & Introduction (5 seconds)
2. Purpose Statement (10 seconds)
3. Permission to Proceed (5 seconds)
4. Transition to Discovery (10 seconds)

EXAMPLE OPENING:
"Hi [Name], this is [Your Name] calling from Gold Coast Financial. I'm reaching out regarding the life insurance policy information we have on file. This is just a review call—not a new sale. Do you have a couple of minutes?"

[If yes]:
"Great. To make sure I'm looking at the right information, let me just confirm a few things..."

WHY THIS WORKS:
• States who you are clearly
• Gives a reason for the call
• Lowers resistance ("not a new sale")
• Asks permission (shows respect)
• Transitions smoothly

HANDLING COMMON OPENING OBJECTIONS:

"Is this a sales call?"
"No—this is a policy review, not a new sale."

"I don't remember filling anything out."
"No problem—most people don't. This is in reference to the policy you already have in force, not a new application."

"I'm busy."
"I understand—this only takes about two or three minutes."

"How did you get my information?"
"It came directly from the insurance company when your policy was issued."

TONE MATTERS:
• Warm but professional
• Confident but not pushy
• Helpful not salesy
• Slow down—speed kills trust`,
        keyPoints: [
          'First 30 seconds set the tone',
          'State purpose clearly (review, not new sale)',
          'Ask permission to proceed',
          'Handle objections calmly',
          'Slow down—speed kills trust'
        ]
      },
      {
        id: 'sec-disc-3',
        title: 'Key Discovery Questions',
        duration: 8,
        content: `These questions uncover the information needed for proper needs analysis.

FAMILY SITUATION QUESTIONS:
• "Who's in your household?"
• "Do you have any children? What are their ages?"
• "Is anyone depending on your income?"
• "Who would be affected if something happened to you?"

FINANCIAL SITUATION QUESTIONS:
• "What do you do for work?"
• "How long have you been there?"
• "Does your employer offer any life insurance?"
• "Do you have any other insurance coverage?"

GOALS & CONCERNS QUESTIONS:
• "What made you interested in looking at life insurance?"
• "What are you hoping to accomplish with coverage?"
• "What concerns do you have about the future?"
• "Have you thought about what would happen to your family financially if something happened?"

EXISTING COVERAGE QUESTIONS:
• "You mentioned you have some coverage—do you know how much?"
• "When did you get that policy?"
• "Do you know what kind it is—term or permanent?"
• "Does it have any cash value or living benefits?"

TIMING & DECISION QUESTIONS:
• "How soon are you looking to get something in place?"
• "Is there anyone else who would need to be part of this decision?"
• "What would prevent you from moving forward if we find something that makes sense?"

LAYERING TECHNIQUE:
After each answer, dig deeper:
• "Tell me more about that..."
• "Why is that important to you?"
• "How would that affect your family?"
• "What would that mean for your situation?"

THE POWER QUESTION:
"If you died tomorrow, who would be affected and how?"

This single question often opens up the entire conversation.`,
        keyPoints: [
          'Cover family, finances, goals, existing coverage',
          'Use layering technique to dig deeper',
          'Ask about decision process and timeline',
          'The power question opens conversations',
          'Listen for what they DON\'T say too'
        ]
      },
      {
        id: 'sec-disc-4',
        title: 'Active Listening Skills',
        duration: 4,
        content: `Active listening separates top advisors from average ones.

WHAT IS ACTIVE LISTENING?
Fully concentrating on what's being said rather than passively hearing. It involves understanding, responding, and remembering.

ACTIVE LISTENING TECHNIQUES:

1. Verbal Acknowledgment
• "I see..."
• "That makes sense..."
• "I understand..."
• "Go on..."

2. Paraphrasing
"So what you're saying is..." (restate in your own words)
"It sounds like..."
"If I'm understanding correctly..."

3. Clarifying Questions
"What do you mean by...?"
"Can you help me understand...?"
"When you say X, do you mean...?"

4. Reflecting Feelings
"It sounds like that's really important to you..."
"I can hear that this concerns you..."
"That must be frustrating..."

5. Summarizing
"Let me make sure I have this right. You have [family situation], you're concerned about [concern], and your goal is [goal]. Did I miss anything?"

THE POWER OF SILENCE:
After asking a question, WAIT. Don't jump in to fill silence. Let them think and respond. Count to 5 in your head if needed.

AVOID THESE LISTENING KILLERS:
• Interrupting
• Finishing their sentences
• Thinking about what you'll say next
• Jumping to solutions too fast
• Dismissing their concerns
• Relating everything back to you

NOTE: On phone calls, they can't see you nodding. Use verbal acknowledgments so they know you're there.`,
        keyPoints: [
          'Active listening requires full concentration',
          'Use verbal acknowledgments on phone',
          'Paraphrase to confirm understanding',
          'Reflect feelings to build rapport',
          'Silence is powerful—let them fill it'
        ]
      },
      {
        id: 'sec-disc-5',
        title: 'Taking Effective Notes',
        duration: 4,
        content: `Good notes are essential for follow-up, suitability documentation, and handoff to other team members.

WHAT TO CAPTURE:

Client Profile:
• Name, contact info (verify)
• Family members, ages
• Occupation, income range
• Health status (general)

Existing Coverage:
• Type, amount, carrier
• When purchased
• Any riders or benefits
• Satisfaction level

Goals & Concerns:
• Primary goal for the call
• Secondary concerns mentioned
• What's most important to them
• Timeline for decision

Quotes & Key Phrases:
• Exact words they use about concerns
• Emotional statements
• Objections raised
• Questions they asked

Next Steps:
• What was agreed to
• When to follow up
• What they need to do
• What you need to do

NOTE-TAKING TIPS:

During the Call:
• Use abbreviations you'll understand later
• Note emotional tone, not just facts
• Mark important statements with stars
• Write questions to ask later

After the Call:
• Review and expand notes immediately
• Fill in details while fresh
• Note anything you need to research
• Set reminders for follow-up

WHY THIS MATTERS:
"If it's not documented, it didn't happen."
• Suitability defense requires documentation
• Follow-up quality depends on note quality
• Team members may need to reference your notes
• Client will notice if you remember details

USE YOUR CRM:
Enter notes in the CRM same day. Future you (and your compliance officer) will thank you.`,
        keyPoints: [
          'Capture profile, coverage, goals, key quotes',
          'Note emotional tone, not just facts',
          'Review and expand notes immediately after call',
          'If it\'s not documented, it didn\'t happen',
          'Enter notes in CRM same day'
        ],
        complianceNotes: [
          'Notes are compliance documentation',
          'Suitability defense relies on call notes',
          'Keep notes factual and professional'
        ]
      }
    ],
    learningObjectives: [
      'Understand the purpose and importance of discovery',
      'Execute effective call openings',
      'Ask questions that uncover client needs',
      'Apply active listening techniques',
      'Take notes that support suitability and follow-up'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-philosophy', 'mod-education-call'],
    assessmentRequired: true,
    assessmentId: 'assess-discovery-call',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // NEEDS ANALYSIS FRAMEWORK
  // -------------------------------------------------------------------------
  {
    id: 'mod-needs-analysis',
    code: 'GCF-402',
    title: 'Needs Analysis Framework',
    subtitle: 'Financial Snapshot, Gap Analysis, and Prioritization',
    description: 'Learn to conduct thorough needs analysis that forms the foundation for suitable recommendations.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 25,
    sections: [
      {
        id: 'sec-needs-1',
        title: 'The Needs Analysis Process',
        duration: 4,
        content: `Needs analysis transforms discovery information into actionable insights.

THE PROCESS:
1. Gather Information (Discovery)
2. Calculate Needs
3. Assess Current Coverage
4. Identify Gaps
5. Prioritize Solutions
6. Present Recommendations

WHY IT MATTERS:
• Suitability requires needs-based recommendations
• Prevents over-selling or under-selling
• Builds client confidence
• Creates defensible documentation
• Leads to better client outcomes

THE MINDSET:
You're a financial doctor conducting a diagnosis:
• Discover symptoms (concerns, goals)
• Gather data (financial situation)
• Diagnose problems (gaps, exposures)
• Prescribe treatment (appropriate coverage)

NO NEEDS = NO RECOMMENDATION:
If analysis shows no need, say so:
"Based on what you've shared, it looks like your current coverage is adequate. I wouldn't recommend any changes."

This builds trust more than forcing a sale.

TIMING:
Needs analysis doesn't have to happen in one call:
• Initial discovery call
• Follow-up analysis (offline)
• Presentation call with recommendations

Don't rush. Getting it right matters more than getting it fast.`,
        keyPoints: [
          'Needs analysis transforms discovery into action',
          'Six-step process from gathering to recommending',
          'You are a financial doctor diagnosing needs',
          'If no need exists, say so—builds trust',
          'Don\'t rush—getting it right matters'
        ]
      },
      {
        id: 'sec-needs-2',
        title: 'Income Replacement Calculation',
        duration: 5,
        content: `The most fundamental calculation: how much coverage to replace lost income?

THE BASIC FORMULA:
Annual Income × Number of Years = Base Coverage Need

FACTORS TO CONSIDER:

Years of Income Replacement:
• Until youngest child is 18? (+18 years)
• Until spouse reaches retirement? (+20 years)
• Until debts are paid? (varies)
• Rule of thumb: 10-15x annual income

Income to Replace:
• Gross income (before taxes)
• Net take-home (after taxes)
• Consider: surviving spouse may have income
• Consider: expenses may decrease (one car, etc.)

EXAMPLE CALCULATION:
Client: 35-year-old, $75,000 income, 2 kids ages 5 and 8
• Youngest child independent in 18 years
• Income replacement: $75,000 × 15 years = $1,125,000

That's the starting point, not the final number.

ADJUSTMENTS:

Add:
• Outstanding mortgage ($300,000)
• Other debts ($25,000)
• College funding ($100,000)
• Final expenses ($15,000)
• Emergency fund if none exists ($25,000)

Subtract:
• Existing life insurance ($100,000 group)
• Social Security survivor benefits (estimate)
• Spouse's income (if applicable)
• Assets that could be liquidated

REVISED EXAMPLE:
Need: $1,125,000 + $300,000 + $25,000 + $100,000 + $15,000 = $1,565,000
Less: $100,000 existing = $1,465,000 recommended coverage

RULE OF THUMB VS DETAILED ANALYSIS:
• Quick estimate: 10-15x income
• Detailed analysis: Full calculation above
• Use detailed for larger recommendations
• Both approaches have a place depending on client`,
        keyPoints: [
          'Base formula: Annual income × Years = Coverage',
          'Add mortgage, debts, college, final expenses',
          'Subtract existing coverage and assets',
          'Quick estimate: 10-15x income',
          'Detailed analysis for larger recommendations'
        ]
      },
      {
        id: 'sec-needs-3',
        title: 'Identifying Coverage Gaps',
        duration: 5,
        content: `Gap analysis compares current coverage to identified needs.

COMMON GAPS TO LOOK FOR:

1. Coverage Amount Gap
Need: $1,000,000
Have: $250,000 group coverage
Gap: $750,000

2. Coverage Duration Gap
Need: Coverage for 20 years
Have: 10-year term expiring in 3 years
Gap: 17+ years

3. Coverage Type Gap
Need: Permanent coverage for estate planning
Have: Only term coverage
Gap: No permanent coverage

4. Portability Gap
Have: $200,000 employer coverage
Risk: Terminates if they leave job
Gap: No personally-owned coverage

5. Living Benefit Gap
Need: Protection against chronic illness
Have: Policy with no living benefits
Gap: No chronic/LTC protection

QUESTIONS TO SURFACE GAPS:

"What happens to your employer coverage if you quit, retire, or are terminated?"

"Do you know what type of policy you have—is it term or permanent?"

"Does your current policy have any provisions for living benefits if you get seriously ill?"

"When does your term policy expire? What was your health like when you bought it?"

PRESENTING GAPS:
State facts, not fear:
✓ "Your group coverage ends when employment ends—that's a gap you may want to address."
✗ "If you lose your job, your family will have nothing!"

Let them draw conclusions from the facts.`,
        keyPoints: [
          'Compare current coverage to calculated needs',
          'Five common gaps: amount, duration, type, portability, living benefits',
          'Ask questions to help client recognize gaps',
          'Present facts, not fear',
          'Let client draw their own conclusions'
        ]
      },
      {
        id: 'sec-needs-4',
        title: 'Prioritizing Client Needs',
        duration: 5,
        content: `When multiple needs exist, prioritization ensures the most important ones are addressed first.

THE PRIORITIZATION HIERARCHY:

1. CRITICAL (Address First)
• No coverage and dependents exist
• Coverage grossly inadequate for family needs
• Only has employer coverage (portability risk)
• Term expiring soon and health has changed

2. IMPORTANT (Address Next)
• Coverage adequate but could be improved
• No living benefits protection
• All term, no permanent for lifetime needs
• Gap between current and ideal coverage

3. NICE TO HAVE (Address If Budget Allows)
• Optimization of existing coverage
• Additional tax-advantaged accumulation
• Legacy planning beyond family protection
• Premium savings through restructuring

BUDGET REALITIES:
Ideal coverage often exceeds budget. Prioritize:

Example:
Client needs: $1,000,000 coverage
Budget allows: $150/month
Options:
• $1,000,000 20-year term: $75/month ✓ (addresses critical need)
• $500,000 IUL: $250/month ✗ (over budget, half coverage)
• $750,000 term + $100,000 IUL: $125/month ✓ (addresses need with some permanent)

BETTER TO HAVE:
• Adequate term now vs. inadequate permanent
• Something in place vs. analysis paralysis
• Right amount vs. right type (usually)

EXCEPTION:
If client has specific permanent need (estate planning, business, special needs child), permanent takes priority even at lower face amount.

HAVING THE CONVERSATION:
"Based on what you've shared, your most important need is [X]. If budget is a factor, I'd recommend addressing that first, and we can add [Y] later when circumstances allow."`,
        keyPoints: [
          'Critical needs first (coverage for dependents)',
          'Important needs next (optimization)',
          'Nice to have if budget allows',
          'Better to have adequate term than inadequate permanent',
          'Right amount usually beats right type'
        ]
      },
      {
        id: 'sec-needs-5',
        title: 'Documenting Your Analysis',
        duration: 6,
        content: `Documentation protects you, protects the client, and satisfies compliance requirements.

WHAT TO DOCUMENT:

1. Client Information
• Full name, DOB, contact info
• Family members and dependents
• Occupation and income
• Health overview (non-medical notes)

2. Financial Situation
• Annual income
• Major debts (mortgage, loans)
• Existing coverage details
• Assets (general)

3. Goals & Objectives
• Primary reason for seeking coverage
• Specific concerns expressed
• Timeline for decision
• Risk tolerance discussed

4. Needs Analysis
• Coverage calculation and method used
• Gaps identified
• Priorities discussed
• Budget parameters

5. Recommendation Rationale
• Products recommended and why
• How recommendation meets stated needs
• Alternatives considered
• Why alternatives not selected

6. Client Decisions
• What client decided
• Any objections or concerns
• Questions asked
• Next steps agreed

WHERE TO DOCUMENT:
• CRM system (primary)
• Carrier application (required fields)
• Suitability forms (if required by carrier/state)
• Keep copies of all documents

SUITABILITY STATEMENT:
Write a brief narrative:
"Client is a 35-year-old married father of two with $75,000 annual income and $300,000 mortgage. Has $100,000 group coverage only. Primary concern is family protection if something happens. Recommended $500,000 20-year term to address income replacement and mortgage payoff needs. This recommendation is suitable because it addresses stated protection need within budget of $50/month."

WHY THIS MATTERS:
• Required for compliance
• Protects against "unsuitable recommendation" claims
• Helps with policy service questions later
• Required for E&O defense if needed`,
        keyPoints: [
          'Document client info, situation, goals, analysis, recommendation',
          'Write suitability statement explaining rationale',
          'Use CRM system for primary documentation',
          'Keep copies of all documents',
          'Documentation is compliance protection'
        ],
        complianceNotes: [
          'Suitability documentation is REQUIRED',
          'Inadequate documentation = inadequate defense',
          'Complete documentation same day as interaction',
          'Never backdate or alter documentation'
        ]
      }
    ],
    learningObjectives: [
      'Apply the six-step needs analysis process',
      'Calculate income replacement needs',
      'Identify common coverage gaps',
      'Prioritize client needs appropriately',
      'Document analysis to meet compliance requirements'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-discovery-call'],
    assessmentRequired: true,
    assessmentId: 'assess-needs-analysis',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // PRESENTING SOLUTIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-presenting-solutions',
    code: 'GCF-403',
    title: 'Presenting Solutions',
    subtitle: 'Connecting Needs to Products Without Pushing',
    description: 'Learn to present recommendations that connect directly to client needs, building understanding rather than pressure.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 20,
    sections: [
      {
        id: 'sec-present-1',
        title: 'The Education-First Presentation',
        duration: 5,
        content: `Presenting solutions is about helping clients understand, not pressuring them to buy.

THE WRONG WAY:
"I recommend the XYZ Life Platinum Plus plan. It has great features and I think you should get it."

THE RIGHT WAY:
"Based on what you shared, your main concern is making sure your family is protected if something happens. You mentioned you have a $300,000 mortgage and two kids to put through college. Here's what I'm recommending and why..."

THE PRESENTATION FRAMEWORK:
1. Summarize their situation (shows you listened)
2. Recap their goals (confirms understanding)
3. Present the solution (tied to their needs)
4. Explain how it works (education)
5. Address what they're paying (transparency)
6. Ask for questions (engagement)

BEFORE YOU PRESENT:
• Have your recommendation ready
• Know why you're recommending it
• Anticipate likely questions
• Have alternatives prepared
• Review your notes from discovery

THE GOAL:
By the end of your presentation, the client should:
• Understand what they're getting
• Know why it addresses their needs
• Feel confident, not pressured
• Have had their questions answered
• Be able to make an informed decision

NOT YOUR GOAL:
• Overwhelming them with features
• Pushing them to decide immediately
• Glossing over costs or limitations
• Making them feel stupid`,
        keyPoints: [
          'Connect solutions directly to stated needs',
          'Summarize their situation first',
          'Explain why the recommendation fits',
          'Goal is understanding, not pressure',
          'Client should be able to make informed decision'
        ]
      },
      {
        id: 'sec-present-2',
        title: 'Structure of Effective Presentations',
        duration: 5,
        content: `A structured presentation keeps you on track and helps clients follow along.

THE PRESENTATION FLOW:

STEP 1: RECAP (2 minutes)
"Let me make sure I have this right. You're 35, married with two kids ages 5 and 8. You have a $300,000 mortgage and earn about $75,000 a year. Your employer provides $100,000 of coverage, but you're concerned that's not enough—and it would go away if you left your job. Is that accurate?"

STEP 2: RECOMMENDATION (1 minute)
"Based on that, I'm recommending a $500,000 20-year term policy. Here's why..."

STEP 3: CONNECTION TO NEEDS (3 minutes)
"The $500,000 would cover your mortgage and provide about 3 years of income replacement—combined with your group coverage, that's solid protection until your kids are independent.

I'm recommending 20-year term because your youngest will be 25 when it expires—finished with college and on their own.

This is personally-owned, so it stays with you no matter what happens with your job."

STEP 4: HOW IT WORKS (2 minutes)
"Here's how the policy works..."
[Explain the basics—death benefit, premium, how long it lasts]

STEP 5: WHAT IT COSTS (1 minute)
"The premium for this would be approximately $45 per month. That's locked in for the full 20 years—it won't go up."

STEP 6: QUESTIONS (5+ minutes)
"What questions do you have?"
[Don't rush this—let them process]

PRESENTING MULTIPLE OPTIONS:
If appropriate, present 2-3 options:
"Option A addresses your immediate need at the lowest cost. Option B adds some permanent coverage. Option C is the comprehensive approach. Here's the trade-off between them..."

Let them choose rather than telling them what to do.`,
        keyPoints: [
          'Six-step flow: Recap, Recommend, Connect, Explain, Cost, Questions',
          'Always tie recommendation back to their stated needs',
          'Be specific about why you chose this product',
          'Present options when appropriate',
          'Let them choose rather than pushing'
        ]
      },
      {
        id: 'sec-present-3',
        title: 'Handling Questions During Presentation',
        duration: 5,
        content: `Questions during your presentation are GOOD—they show engagement.

WELCOME QUESTIONS:
"Great question—let me address that..."
Never act annoyed or dismissive.

COMMON QUESTIONS AND RESPONSES:

"Why this company?"
"[Carrier] is an A-rated company with strong financials. I recommend them because [specific reason relevant to client's needs—claims process, product features, etc.]"

"What if I need to cancel?"
"You can cancel anytime. If it's during the free look period (usually 10-30 days), you get a full refund. After that, you simply stop paying—there's no penalty with term insurance."

"Is this the cheapest?"
"I've looked at options across multiple carriers. This is competitive for your situation. The rate is one factor, but I also consider carrier ratings, product features, and the application process."

"What happens at the end of 20 years?"
"The policy expires and coverage ends. Many policies offer a conversion option—you could convert to permanent coverage before it expires without proving insurability again."

"Can I get more later?"
"You can apply for additional coverage later, but you'd have to qualify based on your health at that time. If your health changes, it could be more expensive or you might not qualify. That's why we want to make sure we have enough now."

IF YOU DON'T KNOW:
"That's a great question. I want to give you accurate information, so let me verify that and get back to you."

Never guess or make up answers.`,
        keyPoints: [
          'Questions show engagement—welcome them',
          'Never act annoyed or dismissive',
          'Have answers ready for common questions',
          'If you don\'t know, say so and follow up',
          'Never guess or make up answers'
        ]
      },
      {
        id: 'sec-present-4',
        title: 'The Soft Close',
        duration: 5,
        content: `After presenting, guide the client to a decision without high-pressure tactics.

THE SOFT CLOSE:
Instead of "aggressive" closing, use questions that gauge readiness:

"Based on what we've discussed, does this make sense for your situation?"

"Do you feel like this addresses the concerns you had?"

"Is there anything else you need to know to feel comfortable moving forward?"

READING THEIR RESPONSE:

If positive:
"It sounds like you're ready to move forward. Let me walk you through the application—it's straightforward."

If hesitant:
"I'm sensing some hesitation. What's on your mind?"

If negative:
"It sounds like this might not be the right fit. Can you help me understand what's missing?"

NEVER DO:
• "What's it going to take to get you into this policy today?"
• "This rate won't last—you need to decide now."
• "Sign here and we can get started."
• Any high-pressure tactics

WHAT IF THEY NEED TIME?
"That makes sense. This is an important decision. When would be a good time to reconnect?"

Set a specific follow-up—don't leave it open-ended.

THE EDUCATION-FIRST CLOSE:
"My job is to help you make an informed decision—not to pressure you. Based on everything we discussed, I believe this addresses your needs. But only you can decide if it's right for your family. What questions can I answer to help you decide?"`,
        keyPoints: [
          'Use soft questions to gauge readiness',
          'Read their response and adjust',
          'Never use high-pressure tactics',
          'If they need time, set specific follow-up',
          'Help them decide, don\'t pressure them'
        ],
        complianceNotes: [
          'High-pressure tactics are compliance violations',
          'Client must make informed decision',
          'Never misrepresent urgency'
        ]
      }
    ],
    learningObjectives: [
      'Present recommendations connected to client needs',
      'Follow structured presentation framework',
      'Handle questions confidently and accurately',
      'Close softly without high-pressure tactics',
      'Set appropriate follow-up when needed'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-needs-analysis'],
    assessmentRequired: true,
    assessmentId: 'assess-presenting',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // THE FOLLOW-UP SYSTEM
  // -------------------------------------------------------------------------
  {
    id: 'mod-follow-up',
    code: 'GCF-404',
    title: 'The Follow-Up System',
    subtitle: 'Timing, Touchpoints, and Staying Top-of-Mind',
    description: 'Master the art of follow-up—knowing when, how, and how often to reconnect with prospects and clients.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 15,
    sections: [
      {
        id: 'sec-follow-1',
        title: 'Why Follow-Up Matters',
        duration: 3,
        content: `Most sales happen after the initial conversation—follow-up is where deals close.

THE STATISTICS:
• 80% of sales require 5+ follow-ups
• 44% of salespeople give up after 1 follow-up
• Average number of follow-ups by successful advisors: 8+

WHY PEOPLE DON'T BUY IMMEDIATELY:
• They need time to think
• They want to discuss with spouse/family
• They're comparing options
• Life gets busy
• They forgot (not rejection—just busy)

FOLLOW-UP IS NOT:
• Pestering or harassing
• Begging for business
• Being desperate
• Checking if they've decided

FOLLOW-UP IS:
• Providing value
• Staying helpful and available
• Answering questions they think of later
• Being professional and persistent

THE MINDSET SHIFT:
They asked for information about protecting their family. Following up isn't pushy—it's professional service.

"I'm not following up to get a sale. I'm following up because I genuinely want to help them solve a problem they told me about."`,
        keyPoints: [
          '80% of sales require 5+ follow-ups',
          'Most advisors give up too early',
          'Follow-up is service, not pestering',
          'Provide value with each touchpoint',
          'They have a problem you can help solve'
        ]
      },
      {
        id: 'sec-follow-2',
        title: 'The Follow-Up Timeline',
        duration: 4,
        content: `Structured follow-up ensures no one falls through the cracks.

THE 7-TOUCH FOLLOW-UP SYSTEM:

Day 1: After initial call
"Thanks for your time today. As discussed, here's the information I promised. Let me know if you have any questions."

Day 2-3: Check-in
"Wanted to make sure you received everything. Did you have a chance to look it over?"

Day 5-7: Value add
Share a relevant article, insight, or answer a question they had.

Day 10-14: Direct follow-up
"I wanted to check in. Have you had a chance to review with your spouse? Any questions I can answer?"

Day 21: Reconnect
"It's been a few weeks since we talked. I wanted to see if your situation has changed or if you're ready to move forward."

Day 30: Status check
"Just checking in. Is this still something you're considering, or should I check back in a few months?"

Day 45+: Long-term follow-up
Monthly touches until they buy, ask you to stop, or you determine they're not a fit.

ADJUST BASED ON THEIR SIGNALS:
• Hot prospect (ready to buy): More frequent, focused on next steps
• Warm prospect (interested but not urgent): Weekly touches
• Cool prospect (uncertain timeline): Bi-weekly to monthly
• Cold prospect (no clear interest): Monthly value touches or remove

TRACK EVERYTHING:
Use CRM to:
• Schedule follow-up tasks
• Record every interaction
• Note what was discussed
• Track where they are in the process`,
        keyPoints: [
          '7-touch system over 45 days',
          'Adjust frequency based on prospect temperature',
          'Each touch should provide value',
          'Track everything in CRM',
          'Don\'t give up after 1-2 attempts'
        ]
      },
      {
        id: 'sec-follow-3',
        title: 'Effective Follow-Up Messages',
        duration: 5,
        content: `What you say matters as much as when you say it.

FOLLOW-UP PRINCIPLES:
• Keep it brief
• Provide value or reason for contact
• Have a clear call-to-action
• Be professional, not desperate

GOOD FOLLOW-UP EXAMPLES:

Value-Add Email:
"Hi [Name], I came across this article about [relevant topic] and thought of our conversation. It explains [key point] really well. Let me know if you have questions—happy to discuss."

Check-In Call:
"Hi [Name], this is [You] from Gold Coast Financial. I wanted to follow up on our conversation last week. Did you have a chance to discuss the coverage options with your spouse?"

Question-Based:
"Hi [Name], I realized I didn't ask about [something relevant]. That might affect my recommendation. Do you have a quick minute?"

Direct:
"Hi [Name], I wanted to see where you're at with the life insurance decision. Is there anything else you need from me to feel confident moving forward?"

BAD FOLLOW-UP EXAMPLES:

"Just checking in..." (no value, no purpose)
"Have you decided yet?" (pressure, not helpful)
"I really need to know what you're thinking..." (desperate)
"This is my 5th message..." (guilt-trip)

PHONE VS EMAIL VS TEXT:
• Phone: Best for complex discussions, closing
• Email: Good for information, articles, documentation
• Text: Quick confirmations, brief check-ins (if they've opted in)

Match the medium to the message.`,
        keyPoints: [
          'Keep follow-ups brief and value-focused',
          'Have clear call-to-action',
          'Avoid desperate or pushy language',
          'Match medium (phone/email/text) to message',
          'Every touch should have a purpose'
        ]
      },
      {
        id: 'sec-follow-4',
        title: 'When to Stop Following Up',
        duration: 3,
        content: `Knowing when to stop is as important as knowing when to continue.

STOP FOLLOWING UP WHEN:

1. They explicitly ask you to stop
"Please stop calling/emailing."
Response: "I understand. I'll remove you from follow-up. If your situation changes, feel free to reach out."

2. They've clearly said no
Not "I need to think about it" (keep following up)
But "I'm definitely not interested" (stop)

3. Consistent no-response over extended period
After 10+ touches over 90 days with zero response, move to long-term nurture (quarterly) or remove.

4. They've purchased elsewhere
"I went with another company."
Response: "No problem. If you ever need anything or want a second opinion, I'm here."

DON'T STOP WHEN:
• They say "call me later" (schedule it)
• They say "I need to think about it" (follow up)
• They don't respond to one attempt (try again)
• They say "I'm busy right now" (respect but follow up)

THE GRACEFUL EXIT:
If removing from active follow-up:
"Hi [Name], I know you're busy, so I won't keep following up about life insurance. But I'll check in periodically in case your situation changes. Feel free to reach out anytime."

Move to quarterly nurture rather than deleting completely.

LONG-TERM NURTURE:
Some prospects aren't ready now but will be later. Keep them in a long-term drip:
• Quarterly check-ins
• Birthday/holiday messages
• Relevant news or articles
• Policy review reminders for existing coverage`,
        keyPoints: [
          'Stop when they explicitly say stop',
          'Don\'t stop for soft objections like "I need to think"',
          'Exit gracefully—leave door open',
          'Move to long-term nurture, don\'t delete',
          'Some prospects convert months or years later'
        ]
      }
    ],
    learningObjectives: [
      'Understand the importance of systematic follow-up',
      'Apply the 7-touch follow-up timeline',
      'Craft effective follow-up messages',
      'Know when to continue and when to stop',
      'Use CRM to track all follow-up activities'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-presenting-solutions'],
    assessmentRequired: true,
    assessmentId: 'assess-follow-up',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // BUILDING TRUST THROUGH TRANSPARENCY
  // -------------------------------------------------------------------------
  {
    id: 'mod-trust-transparency',
    code: 'GCF-405',
    title: 'Building Trust Through Transparency',
    subtitle: 'Disclosing Fees, Explaining Commissions, and Honesty',
    description: 'Learn how radical transparency builds long-term client relationships and differentiates you from typical salespeople.',
    category: 'methodology',
    type: 'reading',
    certificationLevel: 'core_advisor',
    duration: 15,
    sections: [
      {
        id: 'sec-trust-1',
        title: 'Why Transparency Wins',
        duration: 4,
        content: `Transparency is your competitive advantage in an industry with trust issues.

THE TRUST PROBLEM:
• Insurance salespeople rank low in public trust
• "What are they not telling me?" is always on client's mind
• Hidden agendas create resistance and objections
• Clients often expect manipulation

THE OPPORTUNITY:
When you're transparent, you stand out. Clients relax when they don't feel like they're being "sold."

TRANSPARENCY BUILDS:
• Trust (they believe what you say)
• Comfort (they can make informed decisions)
• Referrals (they tell others about their experience)
• Retention (they stay with you long-term)

THE GCF APPROACH:
We're not afraid to discuss:
• How we get paid
• What things cost
• Pros AND cons of products
• When something isn't right for them
• What competitors might offer

WHY THIS WORKS:
Clients who understand what they're buying and why:
• Have fewer complaints
• Keep policies longer (better persistency)
• Refer more often
• Become clients for life

TRANSPARENCY ≠ OVERSHARING:
Be open about relevant information, but don't overwhelm with unnecessary details. Answer questions honestly. Volunteer information they should know. Don't hide things, but don't create confusion either.`,
        keyPoints: [
          'Insurance industry has trust problems',
          'Transparency makes you stand out',
          'Clients relax when not being "sold"',
          'Open about compensation, costs, pros/cons',
          'Informed clients keep policies longer'
        ]
      },
      {
        id: 'sec-trust-2',
        title: 'Discussing How You Get Paid',
        duration: 4,
        content: `Don't wait for them to ask—address compensation proactively when appropriate.

WHY BRING IT UP:
• Removes the elephant in the room
• Shows you have nothing to hide
• Differentiates you from those who avoid it
• Disarms "Is this commission-based?" objection

HOW TO EXPLAIN IT:
"I want to be upfront with you about how this works. The insurance company pays my firm a commission when you take out a policy. That commission is already built into the premium—you don't pay extra for working with me versus going direct. My job is to help you find the right coverage, and I get paid the same regardless of which carrier or policy you choose."

WHEN THEY ASK:
"Yes, I do earn a commission—it's built into the premium whether you work with an agent or not. What matters is that I'm recommending what's right for your situation, not what pays me more."

COMMISSION MISCONCEPTIONS:
Client thinks: "They're just trying to make money off me"
Truth: Commission is paid by carrier, not added to client's premium
Truth: You earn similar commissions across comparable products
Truth: Recommending wrong product = compliance risk

IF ASKED ABOUT SPECIFIC AMOUNTS:
"I can share that if you'd like to know. On a policy like this, the commission is typically [X%] of the premium. That's paid by the carrier."

You're not required to disclose exact amounts, but being open when asked builds trust.

THE LONG-TERM VIEW:
"I'll be honest—I make more money when you buy more coverage. But I also know that recommending too much or the wrong thing means you'll cancel, and that helps no one. My goal is to get you the right coverage that you keep for a long time."`,
        keyPoints: [
          'Address compensation proactively',
          'Commission is built into premium, not extra',
          'You earn similar amounts across products',
          'Be willing to share specifics if asked',
          'Long-term relationships beat short-term commissions'
        ]
      },
      {
        id: 'sec-trust-3',
        title: 'Being Honest About Limitations',
        duration: 4,
        content: `Honesty about product limitations builds more trust than glossing over them.

WHY DISCUSS LIMITATIONS:
• Clients appreciate honesty
• Sets realistic expectations
• Prevents complaints and chargebacks
• Differentiates you from "salespeople"
• Satisfies compliance requirements

HOW TO DO IT:

For Term Insurance:
"The trade-off with term is that if you outlive the policy—which hopefully you will—you won't get anything back. It's pure protection. That's why it's so affordable."

For IUL:
"IUL has more moving parts than term. The cash value growth depends on index performance, and there are caps that limit your upside. It's more complex and more expensive. The benefit is it can provide lifetime coverage and cash value access."

For Annuities:
"The trade-off for the guarantee is that your money will be tied up for [X] years. If you need it earlier, there are surrender charges. Let's make sure you won't need this money in the short term."

THE SANDWICH TECHNIQUE:
1. Feature (positive)
2. Limitation (honest)
3. Benefit of that trade-off (balanced)

"This policy gives you strong living benefits [feature]. The trade-off is it costs more than a basic policy [limitation]. But for someone with your family history, having that chronic illness protection could be really valuable [benefit of trade-off]."

WHEN A PRODUCT ISN'T RIGHT:
Don't force it. Say so:
"Based on what you've told me, this might not be the best fit. Let me suggest a different approach..."

Walking away from a bad fit builds more trust than pushing through.`,
        keyPoints: [
          'Discuss limitations proactively',
          'Use sandwich technique: feature, limitation, trade-off benefit',
          'Sets realistic expectations',
          'Walk away from bad fits',
          'Honesty prevents complaints and builds trust'
        ],
        complianceNotes: [
          'Full disclosure of material limitations is required',
          'Glossing over limitations can be compliance violation',
          'Document what limitations were discussed'
        ]
      },
      {
        id: 'sec-trust-4',
        title: 'When You Don\'t Know',
        duration: 3,
        content: `Admitting what you don't know is more trustworthy than making things up.

THE TEMPTATION:
Client asks a question you're unsure about. You want to seem knowledgeable. You give an answer that might not be accurate.

THE PROBLEM:
• Incorrect information = compliance issue
• Client makes decision based on wrong info
• You lose credibility when truth emerges
• E&O risk if it causes harm

THE RIGHT RESPONSE:
"That's a great question, and I want to give you accurate information. Let me verify that and get back to you."

THEN:
• Research the answer
• Contact carrier or compliance if needed
• Follow up promptly with correct information
• Document the question and answer

IT'S OKAY TO NOT KNOW:
• Product details change
• State regulations vary
• Carrier procedures differ
• Tax implications are complex
• Nobody knows everything

WHAT CLIENTS REALLY VALUE:
They don't expect you to know everything. They expect you to:
• Be honest about what you don't know
• Find accurate information
• Get back to them quickly
• Not make things up

PHRASES THAT WORK:
• "Let me double-check that and get back to you"
• "I don't want to guess on that—let me find out for sure"
• "That's outside my expertise—I'd recommend asking your [accountant/attorney]"
• "The carrier can answer that definitively—let me get you connected"`,
        keyPoints: [
          'Never make up answers',
          '"Let me verify and get back to you" is professional',
          'Follow up promptly with accurate information',
          'Honesty about not knowing builds trust',
          'Refer to experts when appropriate'
        ]
      }
    ],
    learningObjectives: [
      'Understand how transparency builds competitive advantage',
      'Discuss compensation openly and confidently',
      'Address product limitations honestly',
      'Respond appropriately when you don\'t know an answer',
      'Build long-term client relationships through trust'
    ],
    requiredForCertification: ['cert-core-advisor'],
    prerequisiteModules: ['mod-philosophy', 'mod-disclosure'],
    assessmentRequired: true,
    assessmentId: 'assess-trust-transparency',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // =========================================================================
  // OBJECTION HANDLING MODULES
  // =========================================================================

  // -------------------------------------------------------------------------
  // OPENING OBJECTIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-opening',
    code: 'GCF-501',
    title: 'Handling Opening Objections',
    subtitle: 'First 30 Seconds - Building Trust Fast',
    description: 'Master the objections that arise in the first moments of a call—before you even begin the conversation.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 15,
    sections: [
      {
        id: 'sec-open-obj-1',
        title: 'Why Opening Objections Happen',
        duration: 3,
        content: `Opening objections are defense mechanisms—the client protecting themselves from potential salespeople.

UNDERSTANDING THE MINDSET:
• They don't know who you are yet
• They've been burned by salespeople before
• They're screening calls
• They're busy and evaluating if this is worth their time

OPENING OBJECTIONS ARE DIFFERENT:
These aren't real objections about your product—they're objections to the call itself. The goal is to get past the gate, not to sell.

THE PRINCIPLE:
Lower resistance, not overcome it.

You're not trying to "win" the objection. You're trying to earn 2 more minutes of their attention.

TONE IS EVERYTHING:
• Calm and confident (not defensive)
• Warm and professional (not salesy)
• Slow down (rushing sounds desperate)
• Brief responses (don't over-explain)

THE FLOW:
Objection → Acknowledge → Redirect → Continue

REMEMBER:
Objections are NOT rejection. They're still engaged. If they weren't interested at all, they would have hung up.`,
        keyPoints: [
          'Opening objections are defense mechanisms',
          'Lower resistance, don\'t overcome it',
          'Goal is earning 2 more minutes',
          'Tone matters more than words',
          'Still engaged = still an opportunity'
        ]
      },
      {
        id: 'sec-open-obj-2',
        title: 'Memory & Origin Objections',
        duration: 4,
        content: `These objections question how you got their information or challenge their recall.

"I DON'T REMEMBER FILLING ANYTHING OUT."

Why they say it: Genuinely don't remember, or testing if this is legitimate.

Response:
"No problem—most people don't. This is in reference to the policy you already have in force, not a new application."

Why it works: Normalizes their response, clarifies purpose.

---

"HOW DID YOU GET MY INFORMATION?"

Why they say it: Concerned about privacy, suspicious of legitimacy.

Response:
"It came directly from the insurance company when your policy was issued."

Why it works: Connects to something they know (their policy), implies legitimacy.

---

"THAT'S NOT MY ADDRESS."

Why they say it: Information doesn't match, questioning legitimacy.

Response:
"Okay, my apologies—that's probably why you didn't receive the policy documents we sent out."

Why it works: Explains a potential problem they've experienced, pivots to updating info.

---

"I DON'T HAVE A LIFE INSURANCE POLICY."

Why they say it: May be true, or may have forgotten.

Response:
"That's probably why our system picked up a red flag on your file. It does look like you were interested at some point—is there a reason you never got coverage?"

Why it works: Transitions to understanding their situation.`,
        keyPoints: [
          'Normalize their response',
          'Connect to something legitimate they know',
          'Don\'t argue about details',
          'Pivot to understanding their situation',
          'Brief responses, then move forward'
        ]
      },
      {
        id: 'sec-open-obj-3',
        title: 'Legitimacy & Trust Objections',
        duration: 4,
        content: `These objections question whether the call is legitimate or trustworthy.

"IS THIS A SALES CALL?"

Why they say it: Setting up to reject if you say yes.

Response:
"No—this is a policy review, not a new sale."

Why it works: Removes the "sales" label, implies service.

---

"WHAT COMPANY ARE YOU WITH AGAIN?"

Why they say it: Testing legitimacy, possibly Googling you.

Response:
"I'm calling from the insurance division that services your policy through your carrier."

Why it works: Connects to their existing relationship.

---

"HOW DO I KNOW THIS IS LEGIT?"

Why they say it: Genuinely concerned about scams.

Response:
"You can verify my license through the state, and everything we do is confirmed directly by the insurance company."

Why it works: Offers verification method, involves carrier confirmation.

---

"I'VE BEEN SCAMMED BEFORE."

Why they say it: Real concern based on past experience.

Response:
"I understand—that's exactly why nothing is finalized today and everything is verified through the carrier."

Why it works: Acknowledges their experience, emphasizes no immediate commitment.

---

"SEND ME SOMETHING IN THE MAIL."

Why they say it: Wants to get off the phone, or genuinely prefers written info.

Response:
"I can, but the carrier won't release documents until the review is completed. Once it is, they send everything directly to you."

Why it works: Creates reason to continue, explains process.`,
        keyPoints: [
          'Acknowledge their concern',
          'Offer verification methods',
          'Emphasize nothing is finalized today',
          'Connect to their carrier relationship',
          'Don\'t get defensive'
        ]
      },
      {
        id: 'sec-open-obj-4',
        title: 'Existing Coverage Objections',
        duration: 4,
        content: `These objections claim they already have coverage and don't need to talk.

"I ALREADY HAVE INSURANCE."

Why they say it: Thinks you're selling a new policy.

Response:
"Perfect—that's actually why I'm calling. This is just a review of your existing coverage."

Why it works: Reframes the call as service, not sales.

---

"I HAVE INSURANCE THROUGH MY WORK."

Why they say it: Believes they're fully covered.

Response:
"That's very common. Just keep in mind that employer coverage usually expires about 30 days after you quit, retire, or are terminated, so this makes sure you're covered your entire life."

Why it works: Introduces concept of portability gap without being pushy.

---

"I DON'T HAVE ANY INSURANCE AND DON'T WANT IT."

Why they say it: Rejecting before understanding.

Response:
"I completely understand that, but who would be affected if something randomly happened to you?"

Why it works: Gets them thinking about the actual need.

---

"I'LL GET IT LATER."

Why they say it: Procrastinating, doesn't see urgency.

Response:
"Later usually means more expensive or unavailable."

Why it works: Brief, plants seed of consideration.

IMPORTANT NOTE:
These are openers to continue the conversation. You're not solving the objection—you're earning the right to have the conversation.`,
        keyPoints: [
          'Reframe call as service, not sales',
          'Introduce gaps they may not know about',
          'Plant seeds for consideration',
          'Don\'t try to fully resolve in opening',
          'Goal is continuing the conversation'
        ]
      }
    ],
    learningObjectives: [
      'Understand why opening objections occur',
      'Respond calmly to memory and origin challenges',
      'Address legitimacy and trust concerns',
      'Handle existing coverage objections',
      'Continue conversations past initial resistance'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-discovery-call', 'mod-trust-transparency'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-opening',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // TIME & DELAY OBJECTIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-time',
    code: 'GCF-502',
    title: 'Handling Time & Delay Objections',
    subtitle: 'Busy, Call Later, Need to Think',
    description: 'Master objections related to time—when clients say they\'re busy, want you to call back, or need time to think.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 12,
    sections: [
      {
        id: 'sec-time-obj-1',
        title: 'Understanding Time Objections',
        duration: 3,
        content: `Time objections are often soft rejections—but not always.

TWO TYPES OF TIME OBJECTIONS:

1. Genuine
They really are busy or need time.

2. Polite Rejection
Using "I'm busy" to avoid saying "no."

YOUR JOB:
Determine which it is and respond appropriately.

HOW TO TELL THE DIFFERENCE:

Genuine Busy:
• Specific reason ("I'm in a meeting")
• Offers alternative time ("Call me tomorrow")
• Sounds stressed or distracted
• Usually earlier in conversation

Polite Rejection:
• Vague ("I'm busy")
• Doesn't offer alternative
• Sounds dismissive
• Often after hearing details

THE PRINCIPLE:
Respect their time while creating enough urgency to continue or schedule a specific follow-up.

NEVER:
• Pressure someone who's genuinely busy
• Guilt-trip them about time
• Keep them longer than promised
• Call back without permission`,
        keyPoints: [
          'Time objections are sometimes soft rejections',
          'Determine if genuine or polite rejection',
          'Respect their time',
          'Create appropriate urgency',
          'Always get specific follow-up time'
        ]
      },
      {
        id: 'sec-time-obj-2',
        title: '"I\'m Busy" Objections',
        duration: 4,
        content: `The most common time objection and how to handle it.

"I'M BUSY."

Response:
"I understand—this only takes about two or three minutes."

Why it works: Shows respect, makes small ask.

If they agree: Get what you need quickly, then offer to follow up with details.

If they still decline: "No problem. When would be a better time today or tomorrow?"

---

"I DON'T HAVE TIME FOR THIS."

Response:
"That's why the carrier keeps this very short—they don't want policies sitting unresolved."

Why it works: Aligns with their desire for efficiency.

---

"I'M AT WORK."

Response:
"I understand completely. Is there a better time later today, or would you prefer I call you this evening?"

Why it works: Respects their situation, offers alternatives.

---

"YOU CAUGHT ME AT A BAD TIME."

Response:
"I'm sorry about that. When would be a good time for us to connect?"

Why it works: Apologizes, seeks specific alternative.

KEY TECHNIQUE:
Always offer specific alternatives:
• "Would later today or tomorrow morning work better?"
• "I can call back in an hour—does that work?"
• "What time works best for you?"

Avoid: "I'll just call you back sometime" (no commitment).`,
        keyPoints: [
          '"2-3 minutes" makes the ask small',
          'Always offer specific alternatives',
          'Respect work situations',
          'Get commitment to specific follow-up time',
          'Avoid vague "call back later"'
        ]
      },
      {
        id: 'sec-time-obj-3',
        title: '"Call Me Later" Objections',
        duration: 3,
        content: `When they want you to call back—get a specific commitment.

"CAN YOU CALL ME ANOTHER DAY?"

Response:
"Absolutely. Today we just want to make sure you get approved so the price doesn't change. This will take a couple of moments, then we can follow up another day."

Why it works: Creates mild urgency, asks for short commitment now.

---

"CALL ME NEXT WEEK."

Response:
"I can definitely do that. What day and time work best for you? I want to make sure I reach you."

Why it works: Gets specific commitment.

---

"I'LL CALL YOU BACK."

Response:
"I appreciate that. Just so I have you on my calendar—when do you think you'll have a few minutes? I can also call you if that's easier."

Why it works: Most "I'll call back" don't happen. Offers alternative.

---

THE SCHEDULE TECHNIQUE:
When scheduling callback:
1. Get specific day
2. Get specific time
3. Confirm phone number
4. Set it in your calendar immediately
5. Send confirmation if email available

"Great, I'll call you Thursday at 3pm. Is this the best number to reach you?"`,
        keyPoints: [
          'Get specific day and time',
          'Don\'t accept vague "call me back"',
          'Client saying "I\'ll call you" usually won\'t happen',
          'Schedule it in calendar immediately',
          'Confirm contact information'
        ]
      },
      {
        id: 'sec-time-obj-4',
        title: '"I Need to Think About It"',
        duration: 2,
        content: `The classic delay objection—and how to handle it productively.

"I NEED TO THINK ABOUT IT."

Response:
"That makes sense. This step just allows the carrier to verify everything—you'll still have time to review before any decisions."

Why it works: Validates their need, but separates verification from decision.

Alternative Response:
"Of course. What specifically did you want to think through? I might be able to help clarify."

Why it works: Opens conversation about real concerns.

---

"I WANT TO TALK TO MY SPOUSE."

Response:
"Of course—we can complete the review now and go over the results together once they're available. We'll also send you a paper policy in the mail so you can review it together and call me if you have any questions."

Why it works: Moves process forward while respecting their need.

---

WHAT "I NEED TO THINK" OFTEN MEANS:
• I have a question I haven't asked
• I'm not sure about the cost
• I don't fully understand something
• I'm not sure I trust this
• I need permission from someone

HELPFUL FOLLOW-UP:
"Just so I can help if you have questions—what's the main thing on your mind?"

Sometimes they'll share the real concern.`,
        keyPoints: [
          'Validate their need to think/discuss',
          'Ask what specifically they want to consider',
          'Move process forward where possible',
          '"Need to think" often means unasked question',
          'Schedule specific follow-up'
        ]
      }
    ],
    learningObjectives: [
      'Distinguish genuine busy from polite rejection',
      'Handle "I\'m busy" with brief, respectful responses',
      'Get specific callback commitments',
      'Navigate "need to think" productively',
      'Respect time while creating appropriate urgency'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-objections-opening'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-time',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // TRUST & LEGITIMACY OBJECTIONS (Deep Dive)
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-trust',
    code: 'GCF-503',
    title: 'Handling Trust & Legitimacy Objections',
    subtitle: 'Scam Concerns, Multiple Calls, Verification Requests',
    description: 'Deep dive into handling objections about legitimacy, trust, and verification that arise throughout the call.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 12,
    sections: [
      {
        id: 'sec-trust-obj-1',
        title: 'Building Trust Through Response',
        duration: 3,
        content: `Trust objections are opportunities to differentiate yourself.

THE MINDSET:
Every trust objection is a chance to prove you're different from the scammers they've encountered.

PRINCIPLES FOR TRUST OBJECTIONS:
1. Never get defensive
2. Offer verification willingly
3. Acknowledge their concern is valid
4. Don't take it personally
5. Slow down and be patient

WHAT BUILDS TRUST:
• Calm, confident responses
• Willingness to be verified
• Not rushing or pressuring
• Professional language
• Offering to let them call you back
• Providing your credentials

WHAT DESTROYS TRUST:
• Defensive reactions
• Avoiding questions
• Rushing past their concerns
• Getting frustrated
• Pushy responses

REMEMBER:
If they're asking about trust, they're still on the phone. That's good.`,
        keyPoints: [
          'Trust objections are differentiation opportunities',
          'Never get defensive',
          'Offer verification willingly',
          'Slow down and be patient',
          'Still on phone = still engaged'
        ]
      },
      {
        id: 'sec-trust-obj-2',
        title: 'Scam & Legitimacy Concerns',
        duration: 4,
        content: `These objections express concern about whether you or the call is legitimate.

"I'VE BEEN SCAMMED BEFORE."

Response:
"I understand—that's exactly why nothing is finalized today and everything is verified through the carrier."

Why it works: Acknowledges their valid concern, emphasizes no pressure.

Follow-up if needed:
"I can give you my NPN number to verify my license through your state's insurance department."

---

"HOW DO I KNOW THIS IS LEGIT?"

Response:
"You can verify my license through the state, and everything we do is confirmed directly by the insurance company."

Offer more:
"Would you like my NPN number? You can look me up on the state insurance department website."

---

"THIS SOUNDS TOO GOOD TO BE TRUE."

Response:
"Nothing changes unless the carrier confirms it in writing."

Why it works: Puts control with the carrier, not you.

---

"I DON'T DO ANYTHING OVER THE PHONE."

Response:
"I understand. For security reasons, the carrier only allows these reviews to be completed verbally, and nothing is finalized today."

Alternative:
"That's completely understandable. I can send you written information first, and we can discuss once you've reviewed it."

Why it works: Respects their preference, offers alternative.`,
        keyPoints: [
          'Offer your NPN for verification',
          'Emphasize carrier confirmation of everything',
          'Nothing is finalized today',
          'Offer to send written information',
          'Acknowledge their concern as valid'
        ]
      },
      {
        id: 'sec-trust-obj-3',
        title: 'Repeated Call Concerns',
        duration: 3,
        content: `When clients are frustrated about receiving multiple calls.

"YOU GUYS KEEP CALLING ME."

Response:
"I know—the reason is there's a flag on your policy for review. Until it's resolved, you're going to keep receiving these calls."

Why it works: Explains why, implies resolution stops calls.

---

"I'VE TALKED TO SOMEONE ALREADY."

Response:
"I apologize for the confusion. Let me pull up your file and see where things stand so we don't duplicate efforts."

Why it works: Acknowledges situation, offers to resolve.

---

"I TOLD THE LAST PERSON NO."

Response:
"I understand. I'm not trying to sell you anything new—I'm just calling to make sure your existing policy information is up to date."

Why it works: Differentiates this call, lowers resistance.

---

PREVENTING FRUSTRATION:
• Check CRM before calling
• Note previous conversations
• Know what they've already discussed
• Don't start from scratch if they've already talked to someone`,
        keyPoints: [
          'Explain why calls continue',
          'Acknowledge previous conversations',
          'Check CRM before calling',
          'Don\'t start from scratch',
          'Resolution stops the calls'
        ]
      },
      {
        id: 'sec-trust-obj-4',
        title: 'Verification Techniques',
        duration: 2,
        content: `Proactive verification builds trust before objections arise.

OFFER VERIFICATION PROACTIVELY:
"Before we continue, I want to make sure you feel comfortable. My name is [Name], and my NPN number is [number]. You can verify my license at [state website]."

YOUR NPN:
• National Producer Number
• Issued to every licensed agent
• Verifiable on state insurance department websites
• Memorize yours

OFFER TO CALL BACK:
"If you'd like, I can have the carrier call you directly to verify this conversation."

Or:
"Would you feel more comfortable calling me back? Here's my direct number."

SEND WRITTEN CONFIRMATION:
"I'll send you an email confirming everything we discussed. You'll have my contact information and company details in writing."

REMEMBER:
• Legitimate advisors welcome verification
• Scammers avoid it
• Being open about verification differentiates you
• Small gestures build significant trust`,
        keyPoints: [
          'Offer NPN proactively',
          'Offer to have them call you back',
          'Send written confirmation',
          'Legitimate advisors welcome verification',
          'Small gestures build big trust'
        ]
      }
    ],
    learningObjectives: [
      'Respond to trust objections without defensiveness',
      'Offer verification methods proactively',
      'Handle repeated call frustration',
      'Use NPN and callbacks to build credibility',
      'Differentiate yourself from scammers'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-objections-opening'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-trust',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // SSN & MEDICAL INFORMATION OBJECTIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-ssn',
    code: 'GCF-504',
    title: 'Handling SSN & Medical Objections',
    subtitle: 'The Most Sensitive Part of the Call',
    description: 'Master the most challenging objections—when clients resist providing SSN and medical information.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 15,
    sections: [
      {
        id: 'sec-ssn-obj-1',
        title: 'Why These Objections Are Different',
        duration: 3,
        content: `SSN and medical objections require the most trust—they come at the most sensitive moment.

THE STAKES:
• Without SSN, carriers can't run prescription/MIB checks
• Without medical info, underwriting can't happen
• These are the most common call failures
• Also the most important objections to handle well

CLIENT MINDSET:
• SSN = identity theft risk in their mind
• Medical info = privacy concern
• They've been warned about phone scams
• This is where they're most guarded

YOUR MINDSET:
• You're helping them qualify for protection
• This is standard insurance process
• You're not asking for anything unusual
• Legitimate business needs this information

THE PRINCIPLE:
Normalize the request. Explain the purpose. Offer safeguards.

NEVER:
• Pressure or guilt about SSN
• Say it doesn't matter
• Skip explaining why it's needed
• Get frustrated with hesitation`,
        keyPoints: [
          'Most sensitive part of the call',
          'Without SSN, process can\'t continue',
          'Normalize the request',
          'Explain purpose clearly',
          'Offer safeguards'
        ]
      },
      {
        id: 'sec-ssn-obj-2',
        title: 'SSN Objections',
        duration: 5,
        content: `The most common sensitive objection—and how to handle it with care.

"WHY DO YOU NEED MY SOCIAL SECURITY NUMBER?"

Response:
"That's how the insurance company pulls the correct medical and prescription records."

Why it works: Clear, simple explanation tied to their benefit.

---

"I DON'T GIVE MY SSN OVER THE PHONE."

Response:
"I completely understand. This is a HIPAA-protected process, and I can read it back to you for verification."

Additional option:
"I can also give you my NPN number to verify my license before we continue."

Why it works: Acknowledges concern, offers safeguards.

---

"IS THIS A CREDIT CHECK?"

Response:
"No—this has nothing to do with credit. It's strictly medical and prescription history."

Why it works: Addresses specific concern directly.

---

"IS THIS REQUIRED?"

Response:
"Yes—the carrier requires it to complete the review."

Why it works: States facts simply.

---

"CAN WE SKIP THAT PART?"

Response:
"I wish we could, but that's the only way the carrier can verify eligibility."

Why it works: Shows empathy, explains necessity.

---

"CAN I CALL YOU BACK WITH THAT?"

Response:
"Of course—what time works best today while the file is still open?"

Why it works: Agrees while getting commitment.`,
        keyPoints: [
          'Explain it\'s for medical records, not credit',
          'Offer to verify your credentials',
          'HIPAA-protected process',
          'Can read back for verification',
          'Required by carrier'
        ]
      },
      {
        id: 'sec-ssn-obj-3',
        title: 'Medical Information Objections',
        duration: 4,
        content: `Medical questions can feel intrusive—handle with care.

"WHY DO YOU NEED MEDICAL INFORMATION?"

Response:
"This just allows the carrier to re-check eligibility, the same way they did when the policy was first issued."

Why it works: Connects to existing relationship with carrier.

---

"THAT'S PRIVATE."

Response:
"I completely understand. This information is protected by HIPAA and is only used for underwriting purposes."

Why it works: Acknowledges privacy, explains protection.

---

"I DON'T WANT TO ANSWER THAT."

Response:
"Is there a specific question you're uncomfortable with? I can explain why they're asking."

Why it works: Opens conversation about their concern.

---

"WHAT IF I HAVE [CONDITION]?"

Response:
"Having a health condition doesn't automatically disqualify you. The carrier just needs accurate information to determine the right coverage options."

Why it works: Reassures, explains purpose.

---

HEALTH QUESTION TIPS:
• Explain each section before asking
• "Now I'll ask a few health questions..."
• Normalize: "These are standard questions every carrier asks"
• Don't react negatively to any answers
• Thank them for their honesty

"I appreciate you being thorough—it helps make sure we get you the right coverage."`,
        keyPoints: [
          'HIPAA protects their information',
          'Connect to existing carrier relationship',
          'Health conditions don\'t automatically disqualify',
          'Explain sections before asking',
          'Never react negatively to answers'
        ]
      },
      {
        id: 'sec-ssn-obj-4',
        title: 'Building Comfort with Sensitive Information',
        duration: 3,
        content: `Proactive steps to reduce objections before they happen.

BEFORE ASKING FOR SENSITIVE INFO:

Transition smoothly:
"Now I need to verify a few things to make sure the carrier pulls the correct records. This is all standard and HIPAA-protected."

Explain what you'll ask:
"I'll need your Social Security number, date of birth, and a few health questions. This lets the carrier confirm your eligibility."

Normalize the process:
"Everyone goes through this same verification—it's how insurance companies protect both you and them."

WHEN ASKING:
• Sound confident, not apologetic
• Don't rush through it
• Give them time to retrieve information
• Spell back or confirm for accuracy

AFTER GETTING INFO:
"Thank you for that. Your information is secure and will only be used for this verification process."

IF THEY'RE STILL HESITANT:
"I understand the hesitation. Would it help if I gave you my license number first? Or if you'd prefer, you can call me back at [company number]."

THE FINAL OPTION:
"If you're not comfortable today, I can send you a written application to complete on your own time. Would that work better for you?"

Sometimes stepping back wins more than pushing forward.`,
        keyPoints: [
          'Transition smoothly to sensitive questions',
          'Explain what you\'ll ask before asking',
          'Sound confident, not apologetic',
          'Offer alternatives if they\'re very hesitant',
          'Sometimes stepping back wins more'
        ],
        complianceNotes: [
          'HIPAA regulations protect health information',
          'SSN is required for MIB/prescription checks',
          'Never misrepresent why information is needed',
          'Document that client provided information voluntarily'
        ]
      }
    ],
    learningObjectives: [
      'Understand why SSN/medical objections are most sensitive',
      'Respond to SSN objections with appropriate safeguards',
      'Handle medical information concerns professionally',
      'Proactively reduce resistance to sensitive questions',
      'Know when to offer alternatives'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-objections-trust'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-ssn',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // COST & COMMITMENT OBJECTIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-cost',
    code: 'GCF-505',
    title: 'Handling Cost & Commitment Objections',
    subtitle: 'Price, Affordability, and Payment Concerns',
    description: 'Master objections about cost, affordability, and financial commitment—the final hurdle before closing.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 15,
    sections: [
      {
        id: 'sec-cost-obj-1',
        title: 'Understanding Cost Objections',
        duration: 3,
        content: `Cost objections aren't always about money—they're often about value.

THE REAL MEANING:
"It's too expensive" can mean:
• I don't see the value
• I'm afraid to commit
• I have competing priorities
• I need an easy way to say no
• I actually can't afford it

YOUR JOB:
Determine the real objection and address it appropriately.

NEVER:
• Make someone feel bad about their finances
• Push coverage they can't afford
• Dismiss their concern about cost
• Immediately drop to cheaper option

THE APPROACH:
1. Acknowledge the concern
2. Explore what's behind it
3. Address the real issue
4. Find solutions if appropriate

IMPORTANT PRINCIPLE:
Affordability is real. Some people genuinely can't afford coverage. If that's the case, help them find what they CAN afford—even if it's less than ideal. Something is better than nothing.`,
        keyPoints: [
          'Cost objections are often about value, not money',
          'Determine the real objection',
          'Never make them feel bad about finances',
          'Find coverage they CAN afford',
          'Something is better than nothing'
        ]
      },
      {
        id: 'sec-cost-obj-2',
        title: 'Price Objections',
        duration: 4,
        content: `Handling concerns about the specific price.

"I CAN'T AFFORD ANYTHING ELSE."

Response:
"That's totally fine—this review does not increase your payment, and will most likely decrease your payment."

Why it works: Reframes as potential benefit, not cost.

---

"IS THIS GOING TO COST ME MONEY?"

Response:
"No—this is strictly a review of your existing policy."

Why it works: Direct answer to direct question.

---

"I DON'T WANT MY BILL TO CHANGE."

Response:
"Nothing changes without your approval."

Why it works: Emphasizes their control.

---

"IT'S TOO EXPENSIVE."

Response:
"I understand. Let me see if there are options that fit your budget better while still providing the protection you need."

Then explore:
• Lower face amount
• Shorter term
• Different product type
• Level term vs annual renewable

---

"I DON'T WANT ANOTHER BILL."

Response:
"I completely understand—nobody wants more bills. Let's make sure what you get actually helps your family without stretching your budget."

Why it works: Aligns with their concern, focuses on value.`,
        keyPoints: [
          'Reframe as review, not new cost',
          'Nothing changes without approval',
          'Explore options within budget',
          'Align with their concern',
          'Focus on value, not just price'
        ]
      },
      {
        id: 'sec-cost-obj-3',
        title: 'Value & Commitment Concerns',
        duration: 4,
        content: `When the objection is really about value or fear of commitment.

"WHY WOULD I GET MORE COVERAGE FOR THE SAME PRICE?"

Response:
"Insurance pricing updates over time, and some policies qualify for adjustments based on underwriting or age."

Why it works: Explains the mechanism.

---

"THAT DOESN'T MAKE SENSE."

Response:
"I understand—that's exactly why the carrier flags policies like this for review."

Why it works: Validates their skepticism while explaining process.

---

"SOUNDS TOO GOOD TO BE TRUE."

Response:
"Nothing changes unless the carrier confirms it in writing."

Why it works: Removes risk perception.

---

"I DON'T WANT ANOTHER POLICY / DON'T WANT TO BE BILLED TWICE."

Response:
"You're not getting an additional policy—this just updates your coverage, and if anything replaces the old one, the carrier cancels it so you're never billed twice."

Why it works: Directly addresses the specific concern.

---

"I'M HAPPY WITH WHAT I HAVE."

Response:
"That's great—this just confirms you're not missing anything you already qualify for."

Why it works: Positions as confirmation, not change.`,
        keyPoints: [
          'Explain how pricing adjustments work',
          'Carrier confirms everything in writing',
          'No double billing - old policy cancelled',
          'Position as confirmation, not change',
          'Address specific concerns directly'
        ]
      },
      {
        id: 'sec-cost-obj-4',
        title: 'Finding Affordable Solutions',
        duration: 4,
        content: `When budget is a genuine constraint, help them find something they can afford.

THE QUESTION:
"What CAN you comfortably afford each month for protection?"

This opens conversation about real budget constraints.

ADJUSTING COVERAGE TO FIT BUDGET:

Option 1: Lower Face Amount
"Instead of $500,000, we could look at $250,000 at about half the cost."

Option 2: Shorter Term
"A 10-year term is less expensive than 20-year. We can always look at extending later."

Option 3: Different Product
"There might be a simpler product that addresses your basic need at lower cost."

Option 4: Payment Options
"Would monthly or annual payment work better for you?"

THE DRAFT DATE QUESTION:
"When's a good day of the month for the policy to charge your account? You can choose up to 30 days in advance."

Why it works: Assumes the close while giving them control.

WHEN THEY TRULY CAN'T AFFORD ANYTHING:
"I understand. Financial circumstances change. Let me stay in touch, and when your situation improves, we can revisit this."

Don't push someone into coverage they'll lapse on in 3 months. That helps no one.

THE MINIMUM VIABLE COVERAGE:
If they can afford something:
"Even $50,000 would cover final expenses and give your family some breathing room. That might be as little as $15-20/month."

Something is better than nothing.`,
        keyPoints: [
          'Ask what they CAN afford',
          'Offer lower face amount or shorter term',
          'Don\'t push unaffordable coverage',
          'Draft date question assumes close',
          'Minimum coverage is better than none'
        ],
        complianceNotes: [
          'Suitability includes affordability',
          'Recommending unaffordable coverage is a violation',
          'Document budget discussions',
          'Never pressure beyond their means'
        ]
      }
    ],
    learningObjectives: [
      'Understand the real meaning behind cost objections',
      'Handle price objections without being defensive',
      'Address value and commitment concerns',
      'Find affordable coverage solutions',
      'Know when to adjust recommendations based on budget'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-objections-time'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-cost',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // CLOSING HESITATION OBJECTIONS
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-closing',
    code: 'GCF-506',
    title: 'Handling Closing Hesitation',
    subtitle: 'Final Objections Before the Decision',
    description: 'Master the objections that come at the end—when the client is almost ready but not quite there.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 12,
    sections: [
      {
        id: 'sec-close-obj-1',
        title: 'The Psychology of Closing Hesitation',
        duration: 3,
        content: `Closing hesitation is normal—they're about to make a commitment.

WHAT'S HAPPENING:
The client has gone through the entire process. They understand the product. They see the value. But now they're asked to commit—and they hesitate.

THIS IS NORMAL:
• Buying decisions trigger anxiety
• Commitment feels risky
• They're looking for final reassurance
• They want to make sure they're not making a mistake

CLOSING HESITATION IS NOT:
• A hard no
• Rejection of you or the product
• The same as early objections

IT'S ACTUALLY:
• A sign they're seriously considering
• A request for reassurance
• The final hurdle before yes

YOUR ROLE:
• Provide reassurance
• Address remaining concerns
• Make the decision feel safe
• Don't pressure

REMEMBER:
If they weren't interested, they would have ended the call already. Hesitation at the end is a buying signal.`,
        keyPoints: [
          'Closing hesitation is normal',
          'They\'re looking for reassurance',
          'Different from early objections',
          'Hesitation = buying signal',
          'Make the decision feel safe'
        ]
      },
      {
        id: 'sec-close-obj-2',
        title: 'Common Closing Objections',
        duration: 5,
        content: `The most common last-minute concerns and how to address them.

"I NEED TO THINK ABOUT IT."

Response:
"That makes sense. This step just allows the carrier to verify everything—you'll still have time to review before any decisions."

Or:
"Of course. What specifically did you want to think over? I might be able to address it now."

Why it works: Separates verification from final decision, or surfaces the real concern.

---

"I WANT TO TALK TO MY SPOUSE."

Response:
"Of course—we can complete the review now and go over the results together once they're available. We'll also send you a paper policy in the mail so you can review it together and call me if you have any questions."

Why it works: Process moves forward, they still have conversation with spouse.

---

"I'M NOT READY TO DECIDE."

Response:
"I understand. What would help you feel more ready?"

Then listen. They might tell you exactly what's holding them back.

---

"LET ME SLEEP ON IT."

Response:
"Of course. Why don't we schedule a call for tomorrow at [time] so we can wrap things up while the information is still fresh?"

Why it works: Respects their request while maintaining momentum.

---

"I DON'T WANT TO RUSH INTO ANYTHING."

Response:
"I completely agree—this is an important decision. The good news is you'll have a free-look period after the policy is issued where you can review everything and cancel with a full refund if it's not right."

Why it works: Removes risk from their decision.`,
        keyPoints: [
          'Separate verification from final decision',
          'Ask what would help them feel ready',
          'Schedule specific follow-up',
          'Mention free-look period',
          'Respect their need for time'
        ]
      },
      {
        id: 'sec-close-obj-3',
        title: 'The Soft Path Forward',
        duration: 4,
        content: `Moving toward decision without high-pressure tactics.

THE EDUCATION-FIRST CLOSE:
"My job is to help you make an informed decision—not to pressure you. Based on everything we discussed, I believe this addresses your needs. But only you can decide if it's right for your family. What questions can I answer to help you decide?"

THE ASSUMPTIVE PROGRESSION:
Instead of asking "Do you want to buy?", assume the next step:
"Now I just need to verify a few things to complete the application..."

THE FREE-LOOK SAFETY NET:
"Remember, once the policy is issued, you have [10/20/30] days to review it. If for any reason it's not right, you can cancel and get a full refund. You're not locked in today."

THE SUMMARY CLOSE:
"So let me make sure I have this right: You want to protect your family with $500,000 of coverage, the premium fits your budget at $45/month, and you understand how the policy works. Is there anything else you need before we complete the application?"

THE SILENCE TECHNIQUE:
After asking a closing question, be silent. Let them respond. The first person to speak often loses. Give them time to process and decide.

NEVER:
• "What's it going to take to get you to sign today?"
• "This offer expires if you don't decide now."
• Any high-pressure manipulation`,
        keyPoints: [
          'Use education-first framing',
          'Assume the next step naturally',
          'Free-look period removes risk',
          'Summarize and confirm',
          'Use silence - let them decide'
        ]
      },
      {
        id: 'sec-close-obj-4',
        title: 'When They\'re Truly Not Ready',
        duration: 2,
        content: `Sometimes the answer is no—for now. Handle it professionally.

RECOGNIZING "NOT NOW":
If after addressing concerns they still hesitate, respect it:
"It sounds like you need more time, and I respect that. This is an important decision."

SCHEDULE SPECIFIC FOLLOW-UP:
"When would be a good time for me to check back in? I want to make sure you don't fall through the cracks."

Get a specific date and time.

LEAVE THE DOOR OPEN:
"In the meantime, if any questions come up, don't hesitate to reach out. Here's my direct number."

DOCUMENT EVERYTHING:
• What was discussed
• Why they hesitated
• When to follow up
• Any specific concerns mentioned

DON'T BURN THE BRIDGE:
• Never show frustration
• Thank them for their time
• Keep the relationship positive
• They may come back later

THE LONG VIEW:
Some of your best clients will be people who said "not now" and came back months or years later. Treat everyone well—you never know.`,
        keyPoints: [
          'Respect when they\'re truly not ready',
          'Schedule specific follow-up',
          'Leave door open for future',
          'Document everything',
          'Never burn bridges'
        ]
      }
    ],
    learningObjectives: [
      'Understand closing hesitation psychology',
      'Respond to common closing objections',
      'Use soft closing techniques',
      'Handle "not ready" situations professionally',
      'Maintain relationships for future opportunities'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-objections-cost', 'mod-objections-ssn'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-closing',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // OBJECTION HANDLING MASTERY
  // -------------------------------------------------------------------------
  {
    id: 'mod-objections-mastery',
    code: 'GCF-507',
    title: 'Objection Handling Mastery',
    subtitle: 'Advanced Techniques and Live Call Principles',
    description: 'Synthesis of all objection training with advanced techniques, call flow awareness, and coaching principles.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 15,
    sections: [
      {
        id: 'sec-master-obj-1',
        title: 'The Call Flow Map',
        duration: 4,
        content: `Objections happen in predictable patterns. Knowing the flow helps you anticipate.

CALL STAGES AND TYPICAL OBJECTIONS:

1. OPENING (First 10-20 seconds)
• "I don't remember filling anything out"
• "Is this a sales call?"
• "I already have insurance"
→ Trust hasn't been established yet

2. DISCOVERY (2-5 minutes)
• "Why do you need to know that?"
• "This is taking too long"
• "Just tell me what you're offering"
→ Still evaluating if you're worth their time

3. INFORMATION GATHERING (5-10 minutes)
• "Why do you need my SSN?"
• "I don't want to give medical info"
→ Most sensitive part - maximum resistance

4. PRESENTATION (5-10 minutes)
• "That sounds too good to be true"
• "I don't understand"
• "What's the catch?"
→ Processing what you're offering

5. CLOSING (5+ minutes)
• "I need to think about it"
• "I want to talk to my spouse"
• "It's too expensive"
→ Commitment anxiety

WHY THIS MATTERS:
Match your response to the stage:
• Opening objections: Lower resistance
• Middle objections: Build trust and explain
• Closing objections: Provide reassurance

Don't use closing techniques for opening objections—it's too early.`,
        keyPoints: [
          'Objections follow predictable patterns',
          'Match response to call stage',
          'Opening = lower resistance',
          'Middle = build trust',
          'Closing = provide reassurance'
        ]
      },
      {
        id: 'sec-master-obj-2',
        title: 'The Acknowledge-Reassure-Redirect Method',
        duration: 4,
        content: `A universal framework for handling any objection.

THE A-R-R METHOD:

ACKNOWLEDGE
Show you heard and understand their concern.
• "I understand..."
• "That makes sense..."
• "I hear you..."

REASSURE
Address the underlying concern.
• "Nothing is finalized today..."
• "You're in complete control..."
• "This is standard process..."

REDIRECT
Move the conversation forward.
• "Let me explain how this works..."
• "What I can do is..."
• "The next step would be..."

EXAMPLE APPLICATION:

Objection: "I don't give my SSN over the phone."

Acknowledge: "I completely understand—that's a valid concern."

Reassure: "This is a HIPAA-protected process, and I can read it back to you for verification."

Redirect: "Let's start with the other information, and I can give you my NPN number to verify my credentials before we get to that part."

WHY IT WORKS:
• Validates their concern (they feel heard)
• Addresses the fear (they feel safer)
• Keeps momentum (conversation moves forward)

COMMON MISTAKE:
Going straight to redirect without acknowledge/reassure. This feels dismissive and increases resistance.`,
        keyPoints: [
          'Acknowledge - show you heard them',
          'Reassure - address underlying concern',
          'Redirect - move forward',
          'Skipping steps increases resistance',
          'Method works for any objection'
        ]
      },
      {
        id: 'sec-master-obj-3',
        title: 'Advanced Techniques',
        duration: 4,
        content: `Techniques for experienced advisors to handle difficult situations.

THE FEEL-FELT-FOUND:
"I understand how you feel. Many people have felt that way. What they've found is..."

Example: "I understand how you feel about giving information over the phone. Many people have felt the same way at first. What they've found is that once they verify my credentials, they feel much more comfortable."

THE QUESTION REVERSAL:
Turn their objection into a question back to them.

Them: "Why should I change my policy?"
You: "What would make it worth considering a change?"

THE HYPOTHETICAL:
"If [concern] wasn't an issue, would you move forward?"

This isolates whether it's the real objection.

THE POWER OF "AND":
Instead of "but" (which negates what came before), use "and."

Instead of: "I understand your concern, BUT..."
Say: "I understand your concern, AND here's how we address it..."

THE CALLBACK OFFER:
When resistance is high, offer control:
"Would you feel more comfortable if you called me back at my office number?"

Most won't call back, but offering shifts power to them and often lowers resistance enough to continue.

THE PAUSE:
After making a statement, pause. Silence creates space for them to process. Rushing to fill silence often undoes good rebuttals.`,
        keyPoints: [
          'Feel-Felt-Found validates their experience',
          'Question reversal engages them',
          'Hypothetical isolates real objections',
          '"And" instead of "but"',
          'Silence is powerful—use pauses'
        ]
      },
      {
        id: 'sec-master-obj-4',
        title: 'Final Coaching Notes',
        duration: 3,
        content: `Principles to guide all your objection handling.

SLOW DOWN:
Speed kills trust. When you get an objection, consciously slow your pace. Rushing sounds defensive or desperate.

SILENCE IS POWER:
After your rebuttal, pause. Let them process. Don't rush to fill the silence. Often they'll move forward on their own.

IF THEY'RE TALKING, YOU'RE WINNING:
The call isn't over until they hang up. As long as they're engaging, you have an opportunity.

CONFIDENCE BEATS PERFECT WORDS:
How you say it matters more than exactly what you say. Confident delivery of a good response beats nervous delivery of a perfect script.

DON'T OVER-EXPLAIN:
Answer the objection and stop. Adding more creates more to object to.

DO NOT ARGUE:
You will never win an argument with a client. Even if you're right, they'll resent you.

OBJECTIONS ARE ENGAGEMENT:
If they've objected, they're still on the phone. That's better than hanging up. Every objection is an opportunity.

WHEN IN DOUBT:
"That's a great point. Can you tell me more about what's on your mind?"

Buying time and getting them to talk is always better than a bad response.

PRACTICE:
The only way to get good at objection handling is practice. Role-play with colleagues. Review your calls. Learn from every interaction.`,
        keyPoints: [
          'Slow down - speed kills trust',
          'Silence after rebuttals is powerful',
          'Don\'t over-explain',
          'Never argue with clients',
          'Practice is the only way to improve'
        ],
        complianceNotes: [
          'Never misrepresent to overcome objections',
          'Objection handling is about clarity, not manipulation',
          'If client says no, respect it',
          'Document significant objections and how addressed'
        ]
      }
    ],
    learningObjectives: [
      'Map objections to call flow stages',
      'Apply Acknowledge-Reassure-Redirect method',
      'Use advanced objection handling techniques',
      'Embody coaching principles in all calls',
      'Continuously improve through practice'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-objections-opening', 'mod-objections-time', 'mod-objections-trust', 'mod-objections-ssn', 'mod-objections-cost', 'mod-objections-closing'],
    assessmentRequired: true,
    assessmentId: 'assess-objections-mastery',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // =========================================================================
  // CLIENT SCENARIO MODULES
  // =========================================================================

  // -------------------------------------------------------------------------
  // YOUNG FAMILY PROTECTION SCENARIO
  // -------------------------------------------------------------------------
  {
    id: 'mod-scenario-young-family',
    code: 'GCF-601',
    title: 'Client Scenario: Young Family Protection',
    subtitle: 'Mortgage, Children, and Income Replacement',
    description: 'Apply your training to a comprehensive young family scenario with mortgage, children, and income replacement needs.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 25,
    sections: [
      {
        id: 'sec-yf-1',
        title: 'Meet the Martinez Family',
        duration: 3,
        content: `This scenario walks through a complete client interaction with a typical young family.

CLIENT PROFILE:
• Maria Martinez, 34 years old
• Husband Carlos, 36 years old
• Two children: Sofia (7) and Diego (4)
• Combined household income: $135,000/year
• Maria earns $75,000 (primary earner focus)
• Carlos earns $60,000

FINANCIAL SITUATION:
• Mortgage: $380,000 remaining (25 years left)
• Car loans: $28,000 combined
• Student loans: $22,000 (Maria)
• Emergency fund: $15,000
• Retirement accounts: $45,000 combined
• Current life insurance: Carlos has $50,000 through employer

WHY THEY'RE CALLING:
Maria filled out a form online after a friend's spouse died unexpectedly. She's worried about what would happen to her kids if something happened to her.

THE DISCOVERY OPPORTUNITY:
This is a family with real, documentable needs. Your job is to understand their situation, educate them on options, and make a suitable recommendation.`,
        keyPoints: [
          'Young family with mortgage and children',
          'Combined $135K income, Maria primary earner',
          'Only $50K coverage exists (Carlos employer)',
          'Motivated by friend\'s experience',
          'Real, documentable protection needs'
        ]
      },
      {
        id: 'sec-yf-2',
        title: 'Discovery Conversation',
        duration: 5,
        content: `Let's walk through the discovery phase of this call.

OPENING:
"Hi Maria, this is [Your Name] from Gold Coast Financial. I'm a licensed insurance advisor, and this call may be recorded for quality purposes. You recently requested information about life insurance. Is now a good time to talk for about 15 minutes?"

[Permission granted]

DISCOVERY QUESTIONS:
"Before I can make any recommendations, I need to understand your situation. Tell me about your family."

Maria shares: "I'm married, we have two kids—Sofia is 7 and Diego is 4. Carlos works too, but I make more. I'm really worried about what would happen if something happened to me."

FOLLOW-UP:
"That's a really common concern, especially for parents. What specifically worries you?"

Maria: "My kids are so young. I want to make sure they can stay in our house, finish school, go to college. Carlos could handle things day-to-day, but financially..."

"Let me ask about your current situation. What kind of coverage do you have now?"

Maria: "Carlos has some through his job—I think $50,000? I don't have anything."

"And your mortgage—how much do you owe?"

Maria: "$380,000. We have 25 years left."

WHAT YOU'VE LEARNED:
• Two young children (17-18+ years until independent)
• Maria is uninsured despite being primary earner
• Only $50K coverage on Carlos (employer)
• Significant mortgage ($380,000)
• Primary concern: children's future, staying in home`,
        keyPoints: [
          'Get permission before proceeding',
          'Ask about family, coverage, concerns',
          'Let them express what worries them',
          'Document specific numbers',
          'Note emotional drivers'
        ]
      },
      {
        id: 'sec-yf-3',
        title: 'Needs Analysis',
        duration: 5,
        content: `Now calculate and document the needs.

MARIA'S COVERAGE NEEDS:

Income Replacement:
• Maria earns $75,000/year
• Youngest child independent in ~18 years
• 10-15x income = $750,000 - $1,125,000

Debt Payoff:
• Mortgage: $380,000
• Student loans: $22,000
• Total: $402,000

Future Expenses:
• College for 2 children: ~$100,000 (in-state estimate)

Total Need: ~$1,250,000 - $1,625,000
Less existing coverage: $0 (Maria has none)
Recommended: $1,000,000 - $1,500,000

CARLOS'S COVERAGE GAP:
• Currently has $50,000 employer coverage
• His income: $60,000
• If Maria survives but Carlos doesn't, Maria would need to cover childcare
• Carlos needs coverage too, but Maria is priority

TERM LENGTH:
• 20-year term covers children through independence
• 25-year matches mortgage payoff
• 20-year recommended for Maria (kids independent)

PRODUCT SELECTION RATIONALE:
• Term insurance: Maximum coverage for budget
• Maria needs $1,000,000+ now
• At 34, term rates are affordable
• Can add permanent coverage later if desired`,
        keyPoints: [
          'Calculate income replacement need',
          'Add debts and future expenses',
          'Document the calculation',
          'Match term length to need duration',
          'Term provides maximum coverage for budget'
        ]
      },
      {
        id: 'sec-yf-4',
        title: 'Presenting the Recommendation',
        duration: 6,
        content: `Present the recommendation tied to their stated needs.

THE PRESENTATION:
"Maria, based on what you've shared, here's what I recommend and why.

You mentioned your biggest concern is making sure Sofia and Diego are taken care of—that they can stay in your home and have opportunities for college. Right now, you have no coverage, and your family depends on your $75,000 income.

I'm recommending a $1,000,000 20-year term policy for you.

Here's how I got to that number:
• Your mortgage is $380,000
• Income replacement of $75,000 for about 8 years is $600,000
• Plus some cushion for student loans and future expenses

The 20-year term covers you until Diego is 24—finished with college and on his own. By then, your mortgage will also be largely paid down.

The premium for this coverage would be approximately $65-75 per month. That's locked in for the full 20 years—it won't increase."

EXPLAINING THE PRODUCT:
"This is term life insurance—pure protection for a specific period. If something happens to you during the 20 years, your family receives $1,000,000. If you're still with us at the end—which is the goal—the coverage ends and you don't get anything back.

The trade-off for that is the price. To get this much coverage in a permanent policy would cost 10 times as much. For your situation—maximum protection during your kids' growing years—term makes the most sense."

ASK FOR QUESTIONS:
"What questions do you have about this?"`,
        keyPoints: [
          'Summarize their situation first',
          'Connect recommendation to stated concerns',
          'Explain the calculation (shows work)',
          'Be transparent about how term works',
          'Ask for questions—invite engagement'
        ]
      },
      {
        id: 'sec-yf-5',
        title: 'Handling Objections & Closing',
        duration: 6,
        content: `Maria has questions. Handle them professionally.

"WHAT ABOUT CARLOS?"
"Great question. Carlos does need coverage too—right now he only has $50,000 through his employer, which isn't enough. We can add him today, or we can get you covered first and address Carlos next. What would you prefer?"

Most families do both at once. Recommend $500,000-$750,000 on Carlos given his income.

"CAN I AFFORD THIS?"
"At $65-75 per month for you, plus about $50-60 for Carlos, you're looking at around $125-135 total. I know that's not nothing, but consider: if something happened and you had no coverage, what would that cost your family?"

Don't pressure—let the math speak.

"I NEED TO TALK TO CARLOS."
"Of course—this is a decision you should make together. Would it help if I called back when you're both available? Or I can send you a summary to review together, and we can reconnect tomorrow."

Schedule specific follow-up.

"WHAT IF WE JUST GET A SMALLER POLICY?"
"We can absolutely do that. A $500,000 policy would be about $35-40/month for you. The trade-off is it covers your mortgage but doesn't leave much for income replacement. What's most important to you—covering the house or replacing income?"

Let them prioritize.

SOFT CLOSE:
"Based on everything we've discussed, it sounds like this addresses your main concerns—protecting your kids and keeping them in your home. Is there anything else you need to know before we proceed?"

If yes: Move to application
If no: "What would help you feel ready?"`,
        keyPoints: [
          'Address spouse coverage—both need protection',
          'Budget concerns: let the math speak',
          'Respect need to discuss with spouse',
          'Offer alternatives if budget is real concern',
          'Soft close: "Is there anything else you need?"'
        ],
        complianceNotes: [
          'Never pressure on budget objections',
          'Document spouse discussion if they want to talk first',
          'Smaller coverage is better than no coverage'
        ]
      }
    ],
    learningObjectives: [
      'Apply discovery techniques to young family scenario',
      'Calculate coverage needs with mortgage and children',
      'Present term insurance recommendation with clear rationale',
      'Handle common objections professionally',
      'Close appropriately without pressure'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-needs-analysis', 'mod-presenting-solutions', 'mod-objections-mastery'],
    assessmentRequired: true,
    assessmentId: 'assess-scenario-young-family',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // PRE-RETIREE INCOME PLANNING SCENARIO
  // -------------------------------------------------------------------------
  {
    id: 'mod-scenario-pre-retiree',
    code: 'GCF-602',
    title: 'Client Scenario: Pre-Retiree Income Planning',
    subtitle: 'Retirement Gap, Spouse Protection, and Living Benefits',
    description: 'Apply your training to a pre-retiree scenario focused on retirement income gaps, spouse protection, and living benefit needs.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 25,
    sections: [
      {
        id: 'sec-pr-1',
        title: 'Meet Robert and Linda Thompson',
        duration: 3,
        content: `This scenario walks through a pre-retiree client interaction.

CLIENT PROFILE:
• Robert Thompson, 58 years old
• Wife Linda, 56 years old
• Adult children (independent)
• Both still working

FINANCIAL SITUATION:
• Combined income: $180,000/year
• Robert: $110,000 (primary earner)
• Linda: $70,000
• Mortgage: $120,000 remaining (8 years left)
• No other significant debt
• 401(k) combined: $620,000
• Savings: $85,000
• Current life insurance: Robert has $200,000 group term (employer)
• Linda: No coverage

RETIREMENT PLANS:
• Want to retire at 65 (Robert in 7 years, Linda in 9)
• Plan to travel
• Concerned about healthcare costs before Medicare
• Social Security strategy not yet determined

WHY THEY'RE CALLING:
Robert saw a commercial about life insurance with living benefits. His father had a stroke and needed long-term care. Robert is worried about what would happen if he got sick and couldn't work—especially before they hit retirement.`,
        keyPoints: [
          'Pre-retirees 7-9 years from retirement',
          'Solid retirement savings but gaps exist',
          'Concern about illness before retirement',
          'Motivated by father\'s health experience',
          'Living benefits are key interest'
        ]
      },
      {
        id: 'sec-pr-2',
        title: 'Discovery: Understanding Their Concerns',
        duration: 5,
        content: `The discovery conversation for pre-retirees focuses on retirement transition risks.

OPENING:
Standard GCF opening with consent obtained.

DISCOVERY QUESTIONS:
"Tell me about what prompted you to look into this."

Robert: "My dad had a stroke two years ago. He's in a nursing home now. It's wiped out my parents' savings. I'm 58—what happens if that's me in five years? We're so close to retirement, but if I got sick..."

FOLLOW-UP:
"That's a really valid concern. A lot of people in your situation worry about the same thing. Tell me about your current coverage."

Robert: "I have $200,000 through my employer. Linda doesn't have anything. But that coverage goes away when I retire, right?"

"That's usually how employer coverage works, yes. And you said you're planning to retire at 65?"

Robert: "That's the plan. We have about $620,000 in our 401(k)s, plus some savings. We think we'll be okay, but if something happens between now and then..."

"What would happen if you couldn't work for an extended period?"

Robert: "That's exactly what keeps me up at night. We'd burn through savings. We might have to delay retirement. We might lose the house."

WHAT YOU'VE LEARNED:
• 7 years until Robert's planned retirement
• Group coverage ($200K) ends at retirement
• Linda has zero coverage
• Primary fear: illness that derails retirement
• Interested in living benefits
• Father's stroke experience is emotional driver`,
        keyPoints: [
          'Understand their retirement timeline',
          'Identify coverage that ends at retirement',
          'Explore what happens if they can\'t work',
          'Living benefits interest is genuine',
          'Emotional driver: parent\'s experience'
        ]
      },
      {
        id: 'sec-pr-3',
        title: 'Needs Analysis: Pre-Retirement Risks',
        duration: 5,
        content: `Analyze the gaps between now and retirement.

ROBERT'S SITUATION:

Current Coverage:
• $200,000 employer term (ends at retirement)
• No personal coverage
• No living benefits protection

Risk Period:
• 7 years until planned retirement
• If disabled/chronic illness before 65: devastating
• Mortgage still has $120,000 remaining

Coverage Needs:
• Income replacement if can't work: $110,000/year
• 7 years of income = $770,000 (worst case)
• Mortgage payoff: $120,000
• Bridge to Medicare (healthcare costs): Variable

PRODUCT CONSIDERATIONS:

Option A: 10-Year Term with Living Benefits
• $500,000 coverage
• Living benefits for chronic/terminal illness
• Covers the "danger zone" before retirement
• Lower premium, time-limited protection

Option B: Permanent Coverage (IUL)
• Lifetime coverage
• Living benefits included
• Cash value accumulation
• Can supplement retirement income
• Higher premium

RECOMMENDATION RATIONALE:
Given Robert's specific concern (illness before retirement), a combination may make sense:
• 10-year term for gap coverage ($300,000)
• Small IUL for lifetime protection with living benefits ($100,000-$200,000)

This covers the high-risk period affordably while providing some permanent protection.

LINDA'S NEEDS:
Also needs coverage—if Linda passes, Robert loses $70,000 income and may need to hire help. Recommend $300,000-$500,000 term for Linda.`,
        keyPoints: [
          'Identify the "danger zone" before retirement',
          'Group coverage ending is significant gap',
          'Living benefits address their core concern',
          'Consider term for gap + permanent for lifetime',
          'Don\'t forget spouse coverage'
        ]
      },
      {
        id: 'sec-pr-4',
        title: 'Presenting Living Benefits',
        duration: 6,
        content: `Explain living benefits clearly—this is their primary concern.

THE PRESENTATION:
"Robert, based on what you've shared, your biggest concern is: what happens if you get seriously ill before you reach retirement? You've seen this with your dad—you know how quickly savings can disappear.

Let me explain what living benefits can do.

WHAT LIVING BENEFITS ARE:
"Living benefits let you access part of your death benefit while you're still alive if you have a qualifying condition—typically terminal illness, chronic illness, or critical illness depending on the policy.

So instead of your family only getting the money after you pass, you could access $200,000 or $300,000 while you're still here to pay for care, replace income, or keep your retirement on track."

HOW IT WORKS:
"If you were diagnosed with a chronic illness—meaning you can't do 2 of 6 daily living activities, or you have severe cognitive impairment—you could access a portion of the death benefit each year. The amount varies by policy, but it might be $5,000-$10,000 per month.

This isn't additional coverage—it's early access to your death benefit. What you take as a living benefit reduces what your beneficiary receives. But for many people, having that option is more valuable than a larger death benefit they can only use after they're gone."

THE RECOMMENDATION:
"For your situation, I recommend a combination:

1. A 10-year term policy with living benefits ($300,000)
   • This covers your 'danger zone' before retirement
   • If something happens, you have access to funds
   • Premium: approximately $120-140/month

2. A smaller permanent policy ($150,000) with living benefits
   • This stays with you for life
   • Can supplement retirement income via loans later
   • Premium: approximately $200-250/month

Combined, you'd have $450,000 of coverage with living benefits for about $320-400/month."`,
        keyPoints: [
          'Explain living benefits clearly',
          'This is early access, not additional money',
          'Chronic illness = can\'t do 2 of 6 daily activities',
          'Addresses their core fear directly',
          'Combination of term + permanent may make sense'
        ]
      },
      {
        id: 'sec-pr-5',
        title: 'Handling Pre-Retiree Objections',
        duration: 6,
        content: `Pre-retirees have specific concerns. Address them directly.

"THAT'S A LOT OF MONEY PER MONTH."
"I understand—$320-400 is significant. Let me ask: if you were diagnosed with something tomorrow and couldn't work, what would that cost your family?"

Pause. Let them think.

"The coverage I'm recommending could provide $10,000 per month if you had a qualifying chronic illness. That's the gap between struggling through and maintaining your life."

"WHAT IF I NEVER USE IT?"
"That's actually the hope—that you never need it. The term policy protects you through retirement. If you make it to 65 healthy and with your savings intact, the term has done its job.

The permanent piece stays with you regardless. If you never use the living benefits, your wife receives the death benefit. Either way, the coverage provides value."

"CAN'T I JUST SELF-INSURE WITH SAVINGS?"
"You have $620,000 in retirement accounts and $85,000 in savings. If you had a stroke tomorrow and needed care for 3-5 years at $8,000/month, that's $288,000-$480,000. What happens to retirement after that?"

Living benefits supplement savings, not replace them.

"WE SHOULD WAIT UNTIL WE'RE CLOSER TO RETIREMENT."
"The challenge is that every year you wait, two things happen: you get older (premiums increase) and your health can change (you might not qualify). At 58 with good health, you can still get favorable rates. In 3 years, that may not be true.

The coverage I'm recommending is designed for exactly this period—protecting the years between now and retirement."

SOFT CLOSE:
"Based on your concern about what happened to your dad, does having access to living benefits address what you were looking for?"`,
        keyPoints: [
          'Cost objection: compare to cost of not having it',
          '"Never use it" is the goal for term',
          'Self-insure math often doesn\'t work',
          'Waiting increases cost and risk',
          'Tie close back to their stated concern (father)'
        ],
        complianceNotes: [
          'Never guarantee living benefit payout amounts',
          'Explain that living benefit reduces death benefit',
          'Chronic illness qualification varies by policy'
        ]
      }
    ],
    learningObjectives: [
      'Identify pre-retiree coverage gaps',
      'Explain living benefits clearly and accurately',
      'Recommend appropriate combination of term and permanent',
      'Handle cost and timing objections',
      'Connect recommendations to client\'s emotional drivers'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-needs-analysis', 'mod-product-iul', 'mod-riders-benefits'],
    assessmentRequired: true,
    assessmentId: 'assess-scenario-pre-retiree',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // ESTATE PLANNING BASICS SCENARIO
  // -------------------------------------------------------------------------
  {
    id: 'mod-scenario-estate',
    code: 'GCF-603',
    title: 'Client Scenario: Estate Planning Basics',
    subtitle: 'Legacy, Inheritance Equalization, and Charitable Giving',
    description: 'Apply your training to an estate planning scenario involving legacy wishes, inheritance equalization, and charitable intentions.',
    category: 'client_facilitation',
    type: 'reading',
    certificationLevel: 'live_client',
    duration: 25,
    sections: [
      {
        id: 'sec-est-1',
        title: 'Meet Eleanor Williams',
        duration: 3,
        content: `This scenario involves estate planning considerations.

CLIENT PROFILE:
• Eleanor Williams, 68 years old
• Widowed (husband passed 3 years ago)
• Three adult children:
  - Sarah (45) - financially successful attorney
  - Michael (42) - teacher, modest income
  - David (38) - disabled, receives SSDI

FINANCIAL SITUATION:
• Home: $650,000 (paid off)
• Investment accounts: $1.2 million
• Pension from husband: $3,500/month
• Social Security: $2,800/month
• No debt
• Current life insurance: $100,000 whole life (from decades ago)

ESTATE PLANNING CONCERNS:
• Wants to leave equal inheritance but situation is unequal
• David (disabled son) needs special considerations
• Wants to give to her church ($50,000)
• Doesn't want Sarah (wealthy) to pay unnecessary taxes
• Michael could use the money now, not later

WHY SHE'S CALLING:
Her attorney suggested she look into life insurance as part of estate planning. She's not sure why she'd need more insurance at her age.`,
        keyPoints: [
          'Widow with three adult children',
          'One child disabled, one wealthy, one modest',
          'Wants "equal" but situations differ',
          'Charitable intentions',
          'Attorney referral for estate planning'
        ]
      },
      {
        id: 'sec-est-2',
        title: 'Discovery: Understanding Legacy Goals',
        duration: 5,
        content: `Estate planning discovery requires sensitivity and patience.

OPENING:
Standard GCF opening with consent obtained.

DISCOVERY QUESTIONS:
"Eleanor, you mentioned your attorney suggested looking into life insurance. What did they have in mind?"

Eleanor: "He said something about using insurance to equalize what I leave my children. Right now, if I died, everything would be split three ways. But Sarah doesn't need the money, Michael could really use it, and David... his situation is complicated because of his disability benefits."

FOLLOW-UP:
"Tell me more about David's situation."

Eleanor: "He's been on disability since he was 25. He lives in a group home. He gets SSDI and Medicaid. My attorney said if I leave him money directly, he could lose his benefits. We need something called a special needs trust."

"And your other children?"

Eleanor: "Sarah is a partner at a law firm. She and her husband make probably $500,000 a year. She doesn't need my money—I'd rather it go somewhere it makes a difference.

Michael teaches high school. He's doing fine, but his wife just had their third child. They're stretched. I wish I could help them now, not just when I'm gone."

"You also mentioned wanting to give to your church?"

Eleanor: "Yes, I've been a member for 40 years. I'd love to leave them $50,000 to support their youth programs."

WHAT YOU'VE LEARNED:
• Standard 3-way split doesn't match her wishes
• David needs special needs trust protection
• Sarah doesn't need inheritance (tax concern)
• Michael could use help now
• $50,000 charitable goal
• Total estate: ~$1.95 million plus $100K existing insurance`,
        keyPoints: [
          'Listen for specific wishes per beneficiary',
          'Special needs trust required for David',
          'Inheritance can harm disability benefits',
          'Different children have different needs',
          'Charitable giving is priority'
        ]
      },
      {
        id: 'sec-est-3',
        title: 'Life Insurance in Estate Planning',
        duration: 6,
        content: `Explain how life insurance can solve estate planning challenges.

EDUCATION SEGMENT:
"Eleanor, let me explain how life insurance can help with the goals you've described.

PROBLEM 1: Unequal Situations
Your assets are about $1.95 million. If split three ways, each child gets $650,000. But Sarah doesn't need it, Michael needs it sooner, and David can't receive it directly.

SOLUTION: Life insurance can provide targeted inheritance. Instead of splitting assets, you could:
• Leave the house to Michael (he has kids, needs space)
• Fund David's special needs trust from investments
• Use life insurance to equalize Sarah's share (she receives insurance, not taxable estate)

PROBLEM 2: David's Benefits
If David inherits more than $2,000 in assets, he could lose SSDI and Medicaid. A special needs trust is essential—and life insurance can fund it efficiently.

SOLUTION: A policy with David's special needs trust as beneficiary provides:
• Funds for his care beyond what benefits provide
• No impact on his government benefits
• Immediate liquidity (no probate delay)

PROBLEM 3: Charitable Giving
You want to leave $50,000 to your church. If that comes from your estate, your children receive $50,000 less.

SOLUTION: A separate small life insurance policy with the church as beneficiary achieves your charitable goal without reducing your children's inheritance.

PROBLEM 4: Michael's Current Need
Michael could use help now, not in 10-20 years.

SOLUTION: This is beyond life insurance—but you could consider:
• Annual gifting ($18,000/year tax-free)
• A present-use gift for grandchildren's education

Life insurance ensures your legacy wishes are fulfilled even if you give to Michael now."`,
        keyPoints: [
          'Life insurance creates targeted inheritance',
          'Special needs trust protects David\'s benefits',
          'Separate policy for charitable giving preserves estate',
          'Insurance provides immediate liquidity',
          'Current gifting is separate from insurance planning'
        ]
      },
      {
        id: 'sec-est-4',
        title: 'Presenting the Recommendation',
        duration: 5,
        content: `Present a comprehensive estate planning solution.

THE RECOMMENDATION:
"Eleanor, based on what you've shared, here's what I recommend:

COVERAGE 1: Special Needs Trust Funding
• $300,000 permanent life insurance
• Beneficiary: David's Special Needs Trust
• This ensures David has resources for care without losing benefits
• Premium: approximately $350-400/month at your age

WHY PERMANENT:
David will need this protection for his lifetime. Term insurance would expire before he does. Permanent ensures the trust is funded whenever you pass.

COVERAGE 2: Charitable Gift
• $50,000 permanent life insurance
• Beneficiary: [Her Church]
• This achieves your charitable goal without reducing children's inheritance
• Premium: approximately $75-100/month

You could also name the church as beneficiary on your existing $100,000 policy instead, if you'd like to redirect that coverage.

TOTAL COVERAGE: $350,000 additional
TOTAL PREMIUM: approximately $425-500/month

YOUR EXISTING ASSETS:
• Home ($650,000): Consider leaving to Michael
• Investments ($1.2M): Divide between Sarah and David's trust
• Existing $100K policy: Could redirect to charity or keep as-is

This structure:
• Protects David's benefits
• Achieves your charitable goal
• Gives Michael something tangible (the home)
• Doesn't overburden Sarah with inheritance she doesn't need"

IMPORTANT DISCLAIMER:
"Eleanor, I want to be clear: I'm not an attorney or tax advisor. This recommendation addresses the insurance component. You should work with your attorney to finalize the special needs trust and estate plan structure."`,
        keyPoints: [
          'Permanent insurance for lifetime needs',
          'Special needs trust as beneficiary protects David',
          'Separate policy for charity preserves estate',
          'Disclaim—you\'re not an attorney',
          'Recommend working with her attorney'
        ],
        complianceNotes: [
          'Never provide legal or tax advice',
          'Recommend client consult attorney',
          'Special needs planning requires specialized legal help',
          'Document that you disclaimed legal advice'
        ]
      },
      {
        id: 'sec-est-5',
        title: 'Estate Planning Objections',
        duration: 6,
        content: `Handle objections specific to estate planning situations.

"I'M 68—ISN'T INSURANCE TOO EXPENSIVE AT MY AGE?"
"At 68, premiums are higher than they would have been at 48. But let's look at the math:

$300,000 policy at $400/month = $4,800/year
If you live 15 more years, you'll pay $72,000 in premiums
David receives $300,000 for his trust

That's nearly a 4x return, guaranteed—delivered exactly when it's needed. And if something happens sooner, the return is even better."

"CAN'T I JUST SET ASIDE MONEY IN A SAVINGS ACCOUNT?"
"You could—but there are challenges:
• You'd need to set aside the full $300,000 now
• That money is part of your estate (probate, potential taxes)
• If you live a long time and spend it, David gets nothing
• Insurance guarantees the amount regardless of what happens"

"MY ATTORNEY SAID SOMETHING ABOUT AN IRREVOCABLE TRUST?"
"Yes—an Irrevocable Life Insurance Trust (ILIT) can own the policy. This removes it from your estate entirely for tax purposes. Your attorney can advise if this makes sense for your situation. The insurance recommendation stays the same; the ownership structure is what changes."

"I WANT TO THINK ABOUT THIS."
"Of course—this is a significant decision that involves your entire estate plan. I'd suggest bringing these recommendations to your attorney and having them review how insurance fits with the overall structure.

Would it be helpful if I prepared a summary document you could share with your attorney?"

Most estate planning clients need time. Schedule follow-up after they've consulted their attorney.`,
        keyPoints: [
          'Show the math on premium vs benefit',
          'Insurance guarantees what savings can\'t',
          'Acknowledge ILIT without giving legal advice',
          'Provide materials for their attorney',
          'This client needs time—that\'s normal'
        ]
      }
    ],
    learningObjectives: [
      'Identify estate planning uses for life insurance',
      'Explain special needs trust funding',
      'Present charitable giving through insurance',
      'Disclaim appropriately regarding legal/tax advice',
      'Work collaboratively with client\'s attorney'
    ],
    requiredForCertification: ['cert-live-client'],
    prerequisiteModules: ['mod-needs-analysis', 'mod-product-iul', 'mod-tax-advantages'],
    assessmentRequired: true,
    assessmentId: 'assess-scenario-estate',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // =========================================================================
  // STATE COMPLIANCE MODULES
  // =========================================================================

  // -------------------------------------------------------------------------
  // ILLINOIS STATE AUTHORIZATION
  // -------------------------------------------------------------------------
  {
    id: 'mod-state-il',
    code: 'GCF-STATE-IL',
    title: 'Illinois State Authorization',
    subtitle: 'State-specific regulations and requirements for Illinois',
    description: 'Complete training on Illinois Department of Insurance regulations, state-specific suitability requirements, and compliance obligations for conducting insurance business in Illinois.',
    category: 'state_specific',
    type: 'reading',
    certificationLevel: 'state_expansion',
    duration: 45,
    sections: [
      {
        id: 'state-il-intro',
        title: 'Illinois Insurance Regulatory Overview',
        duration: 10,
        content: `ILLINOIS DEPARTMENT OF INSURANCE (IDOI)

The Illinois Department of Insurance (IDOI) regulates all insurance activities within the state. As a Gold Coast Financial Advisor operating in Illinois, you must understand and comply with state-specific requirements that may exceed or differ from general compliance standards.

REGULATORY AUTHORITY:

The IDOI has jurisdiction over:
• Producer licensing and continuing education
• Policy forms and rates
• Market conduct examinations
• Consumer complaints and enforcement
• Suitability and replacement requirements

LICENSING REQUIREMENTS:

To conduct insurance business in Illinois, you must:
• Hold a valid Illinois producer license
• Complete required continuing education (24 hours every 2 years)
• Include 3 hours of ethics training in CE requirements
• Maintain E&O coverage as specified by your contracts
• Report any disciplinary actions within 30 days

ILLINOIS-SPECIFIC DEFINITIONS:

Illinois defines certain terms specifically for regulatory purposes:
• "Senior Consumer" - Any individual aged 65 or older
• "Replacement" - Any transaction where new coverage will be purchased and existing coverage will be reduced or terminated
• "Suitable" - Meeting the insurer's suitability standards AND the producer's reasonable belief that the recommendation is appropriate`,
        keyPoints: [
          'IDOI regulates all insurance activities in Illinois',
          '24 CE hours required every 2 years including 3 hours ethics',
          'Senior Consumer defined as 65+',
          'Report disciplinary actions within 30 days'
        ],
        complianceNotes: [
          'Illinois CE requirements are tracked separately from other states',
          'License must be active before ANY client contact in IL'
        ]
      },
      {
        id: 'state-il-suitability',
        title: 'Illinois Suitability Requirements',
        duration: 12,
        content: `ILLINOIS SUITABILITY STANDARDS

Illinois has adopted enhanced suitability requirements that align with NAIC model regulations but include state-specific provisions.

SUITABILITY INFORMATION REQUIRED:

Before making any recommendation in Illinois, you must obtain and document:
• Age and nearest birthday
• Annual income and income sources
• Financial situation and needs (existing assets, liabilities)
• Financial experience and sophistication
• Financial objectives (protection, accumulation, income)
• Intended use of the policy
• Financial time horizon
• Existing insurance coverage and financial products
• Liquidity needs
• Risk tolerance
• Tax status

SENIOR-SPECIFIC REQUIREMENTS:

For clients aged 65 and older, Illinois requires ADDITIONAL documentation:
• Cognitive assessment awareness (note any concerns)
• Verification of understanding through teach-back
• Extended free-look period awareness (minimum 30 days for seniors)
• Documentation that surrender charges and liquidity needs were discussed

SUITABILITY DETERMINATION:

Your recommendation must be suitable based on:
• The consumer's suitability information
• The product being recommended
• Reasonable alternatives available
• No material misrepresentation in the presentation

REPLACEMENT CONSIDERATIONS:

Illinois requires heightened scrutiny for replacement transactions:
• Complete replacement form BEFORE application
• Compare existing vs. proposed coverage in writing
• Document consumer acknowledgment of potential disadvantages
• Provide existing insurer notification within required timeframe`,
        keyPoints: [
          'Comprehensive suitability information required before recommendation',
          'Seniors (65+) require additional documentation',
          '30-day free-look minimum for senior clients',
          'Replacement form required BEFORE application'
        ],
        complianceNotes: [
          'Use GCF Senior Client Checklist for clients 65+',
          'All suitability documentation must be retained for audit'
        ]
      },
      {
        id: 'state-il-annuity',
        title: 'Illinois Annuity Regulations',
        duration: 10,
        content: `ILLINOIS ANNUITY SUITABILITY (215 ILCS 5/242)

Illinois has specific regulations governing the sale of annuity products that supplement federal requirements.

TRAINING REQUIREMENTS:

Before selling annuities in Illinois, you must complete:
• 4-hour annuity suitability training (initial)
• Annual refresher training through GCF
• Product-specific training for each annuity product offered

DISCLOSURE REQUIREMENTS:

For ALL annuity sales in Illinois, you must provide:
• Buyer's Guide to Annuities (NAIC or approved equivalent)
• Policy summary/illustration with guaranteed and non-guaranteed values
• Free-look period notification (minimum 10 days, 30 for seniors)
• Surrender charge schedule in clear terms
• Disclosure of all fees and charges

PROHIBITED PRACTICES:

Illinois specifically prohibits:
• Using senior-specific designations without proper credentials (CSSCS, etc.)
• High-pressure sales tactics, especially with seniors
• Recommending products with surrender periods exceeding client's time horizon
• Misrepresenting annuity products as alternatives to bank products

BEST INTEREST STANDARD:

Illinois requires annuity recommendations to meet a "best interest" standard:
• Recommendation must be in the consumer's best interest at time of transaction
• Care obligation: Exercise reasonable diligence, care, and skill
• Disclosure obligation: Full disclosure of material conflicts
• Documentation obligation: Maintain records demonstrating compliance`,
        keyPoints: [
          '4-hour initial annuity training required',
          'Buyer\'s Guide mandatory for all annuity sales',
          'Best interest standard applies to all annuity recommendations',
          'Senior designations require proper credentials'
        ],
        complianceNotes: [
          'Track annuity training completion separately',
          'Use GCF-approved Buyer\'s Guide only'
        ]
      },
      {
        id: 'state-il-enforcement',
        title: 'Illinois Enforcement & Penalties',
        duration: 8,
        content: `ENFORCEMENT ACTIONS & PENALTIES

The Illinois Department of Insurance actively enforces compliance through examinations, complaint investigations, and disciplinary actions.

COMMON VIOLATIONS IN ILLINOIS:

Based on IDOI enforcement data, common violations include:
• Failure to complete suitability documentation (most common)
• Replacement form violations
• CE compliance failures
• Unauthorized transactions (acting before license confirmed)
• Misleading advertising or communications

PENALTY STRUCTURE:

Illinois can impose the following penalties for violations:
• Administrative fines up to $10,000 per violation
• License suspension or revocation
• Restitution orders
• Cease and desist orders
• Required corrective advertising
• Referral to Attorney General for prosecution

COMPLAINT PROCESS:

When a consumer complaint is filed with IDOI:
1. IDOI notifies the producer and company
2. Written response required within 30 days
3. Documentation must be provided as requested
4. Investigation findings may result in formal proceedings

PROTECTING YOURSELF:

To maintain good standing in Illinois:
• Complete all documentation thoroughly and contemporaneously
• Respond promptly to any IDOI inquiries
• Maintain organized records for minimum retention period
• Report any errors or omissions immediately
• Complete CE requirements before deadlines

Remember: Prevention through compliance is always better than defense after the fact.`,
        keyPoints: [
          'Fines up to $10,000 per violation',
          'Respond to complaints within 30 days',
          'Documentation failures are most common violation',
          'Complete records are your best protection'
        ],
        complianceNotes: [
          'All IDOI communications must be forwarded to GCF Compliance immediately',
          'Do not respond to regulatory inquiries without compliance approval'
        ]
      },
      {
        id: 'state-il-resources',
        title: 'Illinois Resources & Contacts',
        duration: 5,
        content: `ILLINOIS REGULATORY RESOURCES

IDOI CONTACT INFORMATION:

Illinois Department of Insurance
320 W. Washington Street
Springfield, IL 62767
Phone: (217) 782-4515
Consumer Hotline: (866) 445-5364
Website: insurance.illinois.gov

LICENSE VERIFICATION:

Verify Illinois license status at:
https://insurance.illinois.gov/Applications/AgentSearch/

CONTINUING EDUCATION:

Track Illinois CE credits through:
• IDOI online portal
• Your CE provider transcripts
• GCF Agent Portal (Illinois tab)

GCF ILLINOIS RESOURCES:

Available in the Agent Portal under "State Resources > Illinois":
• Illinois-specific suitability forms
• Senior client checklist (IL version)
• Replacement comparison worksheet
• Illinois product approval list
• IDOI complaint response template

REPORTING REQUIREMENTS:

Report to GCF Compliance within 24 hours:
• Any IDOI inquiry or complaint
• Any administrative action or notice
• Any client dispute or threatened litigation
• Any error or omission discovered

Complete the assessment to verify your understanding of Illinois-specific requirements.`,
        keyPoints: [
          'IDOI Consumer Hotline: (866) 445-5364',
          'Illinois resources available in Agent Portal',
          'Report IDOI inquiries to GCF within 24 hours',
          'Verify license status before ANY IL client contact'
        ]
      }
    ],
    learningObjectives: [
      'Understand Illinois Department of Insurance regulatory authority',
      'Apply Illinois-specific suitability requirements',
      'Comply with Illinois annuity regulations and best interest standard',
      'Recognize common violations and enforcement actions',
      'Access Illinois-specific resources and support'
    ],
    requiredForCertification: ['cert-state-il'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-suitability-defense'],
    assessmentRequired: true,
    assessmentId: 'assess-state-il',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },
  // -------------------------------------------------------------------------
  // CALIFORNIA STATE COMPLIANCE
  // -------------------------------------------------------------------------
  {
    id: 'mod-state-california',
    code: 'GCF-701',
    title: 'California State Compliance',
    subtitle: 'CDI Requirements, Senior Protections, and CA-Specific Rules',
    description: 'State-specific compliance training for selling life insurance and annuities in California.',
    category: 'state_specific',
    type: 'reading',
    certificationLevel: 'state_expansion',
    duration: 20,
    sections: [
      {
        id: 'sec-ca-1',
        title: 'California Department of Insurance Overview',
        duration: 4,
        content: `California has one of the most stringent insurance regulatory environments in the country.

REGULATORY AUTHORITY:
• California Department of Insurance (CDI)
• Insurance Commissioner (elected position)
• Consumer-focused regulatory philosophy
• Heavy enforcement activity

LICENSE REQUIREMENTS:
• California Life-Only or Life, Accident & Health License
• Must complete pre-licensing education (52 hours for Life-Only)
• Pass state examination
• Background check required
• Fingerprinting required
• Continuing Education: 24 hours every 2 years (including ethics)

APPOINTMENT REQUIREMENTS:
• Must be appointed by each carrier you represent
• Appointment fee: Currently $56 per company
• Appointments must be renewed and maintained

KEY CALIFORNIA REGULATIONS:
• Insurance Code Section 10509.4: Suitability in annuity sales
• Regulation 2695.8: Unfair practices in claims
• California Insurance Code 785-789.10: Replacement regulations
• California CCPA: Consumer privacy requirements

PENALTIES:
California actively enforces regulations. Violations can result in:
• Fines up to $5,000 per violation
• License suspension or revocation
• Criminal prosecution for fraud
• Restitution to consumers`,
        keyPoints: [
          'CDI is aggressive regulator',
          'License requires 52 hours pre-licensing',
          'Fingerprinting required',
          '24 hours CE every 2 years',
          'Heavy penalties for violations'
        ]
      },
      {
        id: 'sec-ca-2',
        title: 'California Suitability Requirements',
        duration: 5,
        content: `California has enhanced suitability requirements beyond federal standards.

ANNUITY SUITABILITY (Insurance Code 10509.4):
Before recommending an annuity, you MUST obtain and document:
• Financial status (income, assets, debts)
• Tax status
• Investment objectives
• Intended use of the annuity
• Financial experience and risk tolerance
• Existing annuities and life insurance
• Liquidity needs

SUITABILITY DETERMINATION REQUIRED:
The agent must have reasonable grounds to believe:
• The client has been informed of the product's features
• The product is suitable for their needs
• The client would benefit from product features
• Liquidity needs will not be impacted

DOCUMENTATION:
• Suitability worksheet MUST be completed
• Client must sign acknowledging information was provided
• Copies must be kept for 5 years minimum
• CDI can audit files at any time

PROHIBITED RECOMMENDATIONS:
Do NOT recommend an annuity to someone who:
• Would suffer substantial harm from surrender charges
• Has insufficient liquid assets
• Does not understand the product
• Would not benefit from its features

California requires you to determine suitability—not just document that you collected information.`,
        keyPoints: [
          'Must obtain extensive financial information',
          'Suitability worksheet required',
          'Must determine product is actually suitable',
          'Client acknowledgment required',
          'Keep documentation 5 years minimum'
        ]
      },
      {
        id: 'sec-ca-3',
        title: 'California Senior Protections',
        duration: 5,
        content: `California has specific protections for senior consumers.

SENIOR CONSUMER DEFINITION:
California defines "senior" as anyone 65 years of age or older for purposes of insurance protections.

ENHANCED PROTECTIONS:
• Extended free-look period: 30 days (vs. standard 10-20)
• Right to have a third party (family member, advisor) present
• Enhanced disclosure requirements
• Prohibited high-pressure tactics
• Must provide written summary of coverage

SENIOR SUITABILITY:
Additional considerations for seniors:
• Is the surrender period appropriate for their age?
• Will they have access to funds for medical needs?
• Do they understand the product fully?
• Are they making the decision freely (no undue influence)?

ELDER FINANCIAL ABUSE:
California has strong elder abuse laws. Watch for:
• Signs of cognitive impairment
• Family members controlling the conversation
• Pressure to buy quickly
• Unusual requests for policy changes

IF YOU SUSPECT ABUSE:
• Do not proceed with the transaction
• Document your concerns
• Report to your compliance department
• CDI has an elder abuse reporting program

PENALTIES FOR SENIOR ABUSE:
Selling an unsuitable product to a senior can result in:
• Enhanced fines (up to $10,000 per violation)
• Automatic license review
• Criminal referral for elder abuse
• Civil liability to consumer`,
        keyPoints: [
          'Senior = 65+ in California',
          '30-day free look for seniors',
          'Right to have third party present',
          'Watch for signs of cognitive impairment',
          'Report suspected elder abuse'
        ],
        complianceNotes: [
          'NEVER proceed if senior seems confused',
          'Document any cognitive concerns',
          'Offer to include family member',
          'Report suspected abuse immediately'
        ]
      },
      {
        id: 'sec-ca-4',
        title: 'California Replacement Regulations',
        duration: 3,
        content: `California has specific requirements for policy replacements.

WHAT IS A REPLACEMENT:
A replacement occurs when an existing life insurance or annuity policy is:
• Lapsed, forfeited, surrendered, or terminated
• Converted to paid-up or extended term
• Amended to reduce benefits or coverage
• Reissued with a reduction in cash value
• Used to fund a new policy through loans or withdrawals

REPLACEMENT NOTICE REQUIREMENTS:
If a replacement is involved, you MUST:
1. Provide the client with a Replacement Notice
2. Obtain the client's signature acknowledging replacement
3. List all policies being replaced
4. Provide comparative information (old vs. new)
5. Allow client to rescind for 30 days

CONSERVATION RIGHTS:
The existing insurer has the right to "conserve" the policy:
• They receive notice of the replacement
• They have 20 days to contact the policyholder
• They may offer to match or improve the existing coverage

SUITABILITY IN REPLACEMENTS:
Replacing an existing policy requires ADDITIONAL suitability analysis:
• Why is the replacement better for the client?
• What are the costs of replacement?
• What is lost by replacing (cash value, guarantees)?
• Is this in the client's best interest?

REPLACEMENT RED FLAGS:
CDI scrutinizes replacements that:
• Benefit the agent more than the client
• Involve surrender charges on existing policy
• Reset surrender periods
• Reduce guaranteed benefits`,
        keyPoints: [
          'Replacement notice required',
          'Client can rescind for 30 days',
          'Existing insurer has conservation rights',
          'Additional suitability analysis required',
          'CDI scrutinizes replacements heavily'
        ]
      },
      {
        id: 'sec-ca-5',
        title: 'California-Specific Disclosures',
        duration: 3,
        content: `California requires specific disclosures beyond federal requirements.

REQUIRED DISCLOSURES:

1. Licensed Status
Must disclose that you are a licensed insurance agent at the outset of the conversation.

2. Compensation Disclosure
Must disclose that you receive compensation for sales. California doesn't require specific amounts, but transparency is expected.

3. Product Type
Must clearly identify whether you're selling insurance or an investment product.

4. Guarantees
Must clearly distinguish guaranteed vs. non-guaranteed elements.

5. Fees and Charges
Must disclose all fees, surrender charges, and costs.

6. CCPA Privacy Notice
If collecting personal information, must provide California Consumer Privacy Act notice.

ILLUSTRATION REQUIREMENTS:
Life insurance illustrations in California must:
• Include guaranteed vs. non-guaranteed columns
• Show annual as well as cumulative values
• Include the statement: "These illustrations are not guarantees"
• Be provided before the application is signed

ADVERTISING RESTRICTIONS:
California prohibits:
• Describing insurance as "investment" or "savings plan"
• Implying guarantees that don't exist
• Using "free" to describe coverage with costs
• Misleading comparison to bank products

RECORDKEEPING:
All disclosures must be documented and retained for 5 years.`,
        keyPoints: [
          'Disclose licensed status upfront',
          'Compensation disclosure required',
          'Distinguish guaranteed vs non-guaranteed',
          'CCPA privacy notice may be required',
          'Keep records 5 years'
        ]
      }
    ],
    learningObjectives: [
      'Understand California regulatory environment',
      'Apply CA suitability requirements',
      'Implement senior protections',
      'Follow replacement regulations',
      'Make required California disclosures'
    ],
    requiredForCertification: ['cert-state-california'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-suitability-defense'],
    assessmentRequired: true,
    assessmentId: 'assess-state-california',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // TEXAS STATE COMPLIANCE
  // -------------------------------------------------------------------------
  {
    id: 'mod-state-texas',
    code: 'GCF-702',
    title: 'Texas State Compliance',
    subtitle: 'TDI Requirements and TX-Specific Rules',
    description: 'State-specific compliance training for selling life insurance and annuities in Texas.',
    category: 'state_specific',
    type: 'reading',
    certificationLevel: 'state_expansion',
    duration: 18,
    sections: [
      {
        id: 'sec-tx-1',
        title: 'Texas Department of Insurance Overview',
        duration: 4,
        content: `Texas is one of the largest insurance markets in the United States.

REGULATORY AUTHORITY:
• Texas Department of Insurance (TDI)
• Commissioner appointed by Governor
• Business-friendly regulatory approach
• Focus on consumer protection balanced with market access

LICENSE REQUIREMENTS:
• Texas Life, Accident, and Health License
• Pre-licensing education: 40 hours
• Pass state examination
• Background check (no fingerprinting required for basic license)
• Continuing Education: 24 hours every 2 years (including 2 hours ethics)

APPOINTMENT REQUIREMENTS:
• Must be appointed by each carrier
• Appointment effective upon filing with TDI
• No appointment fee (paid by carrier)

KEY TEXAS REGULATIONS:
• Texas Insurance Code Chapter 1115: Suitability requirements
• 28 TAC Chapter 3: Unfair practices
• Texas Insurance Code 542: Prompt payment requirements
• Texas Administrative Code Title 28

REGULATORY PHILOSOPHY:
Texas tends toward:
• Less prescriptive regulation
• Market-based solutions
• Strong fraud enforcement
• Business-friendly environment`,
        keyPoints: [
          'TDI is primary regulator',
          '40 hours pre-licensing required',
          'No fingerprinting for basic license',
          '24 hours CE every 2 years',
          'Business-friendly regulatory approach'
        ]
      },
      {
        id: 'sec-tx-2',
        title: 'Texas Suitability Standards',
        duration: 4,
        content: `Texas adopted NAIC model suitability requirements.

ANNUITY SUITABILITY (Chapter 1115):
Before recommending an annuity, you MUST make reasonable efforts to obtain:
• Age
• Annual income
• Financial situation and needs
• Tax status
• Investment objectives
• Intended use of the annuity
• Financial experience
• Existing insurance and annuities
• Liquidity needs
• Risk tolerance
• Other relevant information

SUITABILITY DETERMINATION:
An agent must have reasonable grounds to believe:
• The consumer has been reasonably informed
• The recommendation is suitable based on the consumer's suitability information
• There is a reasonable basis for the recommendation

DOCUMENTATION:
• Must document suitability information gathered
• Must document basis for recommendation
• Records retained for 5 years
• Insurer must supervise and review

SAFE HARBOR:
If consumer refuses to provide information:
• Document the refusal
• If purchase proceeds, no suitability violation
• However, recommendation must still not be inappropriate

Texas follows "reasonable basis" standard—similar to NAIC model.`,
        keyPoints: [
          'Follows NAIC model requirements',
          'Must make reasonable efforts to obtain information',
          'Reasonable basis standard',
          'Document everything',
          'Safe harbor if consumer refuses to provide info'
        ]
      },
      {
        id: 'sec-tx-3',
        title: 'Texas Replacement Requirements',
        duration: 4,
        content: `Texas has specific rules for replacing existing coverage.

REPLACEMENT DEFINITION:
A replacement occurs when new coverage is purchased and existing coverage is:
• Lapsed, surrendered, or terminated
• Converted to paid-up or extended term
• Reduced in value
• Amended to reduce benefits
• Subject to borrowing (in some cases)

NOTICE REQUIREMENTS:
If replacement is involved:
1. Complete the Texas Replacement Notice (specific form)
2. Provide to client before application is signed
3. Client must sign acknowledging receipt
4. Send copy to existing insurer within 3 business days

REPLACEMENT NOTICE CONTENT:
The notice must explain:
• What replacement means
• Potential disadvantages of replacement
• Comparison of policies (old vs. new)
• The consumer's right to review

CONSERVATION:
• Existing insurer receives notice and has opportunity to conserve
• Common practice: existing insurer may offer better terms
• Client can always proceed with replacement

SPECIAL CONSIDERATIONS:
Texas scrutinizes "twisting"—inducing a policyholder to replace through misrepresentation. This is a violation that can result in:
• License revocation
• Fines up to $10,000
• Criminal charges in serious cases

INTERNAL REPLACEMENT:
Replacing a policy with the same company still requires replacement procedures.`,
        keyPoints: [
          'Texas-specific replacement form required',
          'Notify existing insurer within 3 business days',
          'Twisting is serious violation',
          'Same-company replacements still require notice',
          'Conservation opportunity for existing insurer'
        ]
      },
      {
        id: 'sec-tx-4',
        title: 'Texas-Specific Requirements',
        duration: 3,
        content: `Additional Texas requirements to be aware of.

FREE LOOK PERIOD:
• Life Insurance: 10 days minimum (some policies have longer)
• Annuities: 10-30 days depending on product type
• Senior (60+): May have extended free look depending on product

ILLUSTRATION REQUIREMENTS:
Texas follows NAIC illustration model regulation:
• Must include guaranteed vs. projected values
• Must explain assumptions used
• Must provide illustration before application
• Signed illustration acknowledgment required

ADVERTISING REQUIREMENTS:
Texas Insurance Code requires:
• Clear identification of advertiser
• No misleading statements
• Clear statement that product is insurance
• No false comparisons to bank products

PROHIBITED PRACTICES:
Texas prohibits:
• Rebating (sharing commission with client)
• Twisting (misrepresenting to induce replacement)
• Churning (excessive replacements for commission)
• Defamation (false statements about competitors)
• Unfair discrimination in pricing

SENIOR CONSIDERATIONS:
While Texas doesn't have specific senior protections like California, best practices include:
• Extra care with consumers 65+
• Ensure understanding and consent
• Document thoroughly
• Watch for signs of diminished capacity`,
        keyPoints: [
          '10-day minimum free look',
          'Illustration acknowledgment required',
          'Rebating is prohibited',
          'Twisting and churning are serious violations',
          'Use extra care with seniors'
        ]
      },
      {
        id: 'sec-tx-5',
        title: 'Texas Continuing Education',
        duration: 3,
        content: `Texas has specific continuing education requirements.

CE REQUIREMENTS:
• 24 hours every 2-year license period
• Must include 2 hours of ethics
• Up to 6 hours can be self-study
• Remaining hours must be classroom or equivalent

ACCEPTABLE TOPICS:
• Product knowledge
• Regulatory compliance
• Ethics and professional standards
• Customer service
• State law updates

TRACKING AND REPORTING:
• TDI tracks CE through licensed providers
• Verify completion before license renewal
• Can check status on TDI website

LICENSE RENEWAL:
• License renews every 2 years
• CE must be completed before renewal
• Late renewals may require additional fees
• Lapsed license requires reinstatement process

NON-RESIDENT LICENSES:
If you hold a non-resident Texas license:
• Home state CE typically satisfies Texas requirements
• Must maintain home state license in good standing
• TDI reciprocity with most states

FAILURE TO COMPLETE CE:
• Cannot renew license without CE
• Operating without valid license is illegal
• Penalties include fines and license revocation`,
        keyPoints: [
          '24 hours every 2 years',
          '2 hours must be ethics',
          'Max 6 hours self-study',
          'Complete before license renewal',
          'Non-residents: home state CE usually qualifies'
        ]
      }
    ],
    learningObjectives: [
      'Understand Texas regulatory environment',
      'Apply TX suitability standards',
      'Follow Texas replacement procedures',
      'Meet continuing education requirements',
      'Avoid prohibited practices'
    ],
    requiredForCertification: ['cert-state-texas'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-suitability-defense'],
    assessmentRequired: true,
    assessmentId: 'assess-state-texas',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // FLORIDA STATE COMPLIANCE
  // -------------------------------------------------------------------------
  {
    id: 'mod-state-florida',
    code: 'GCF-703',
    title: 'Florida State Compliance',
    subtitle: 'OIR Requirements and FL-Specific Rules',
    description: 'State-specific compliance training for selling life insurance and annuities in Florida.',
    category: 'state_specific',
    type: 'reading',
    certificationLevel: 'state_expansion',
    duration: 18,
    sections: [
      {
        id: 'sec-fl-1',
        title: 'Florida Office of Insurance Regulation',
        duration: 4,
        content: `Florida has unique insurance regulatory considerations due to its large senior population.

REGULATORY AUTHORITY:
• Florida Office of Insurance Regulation (OIR)
• Part of Department of Financial Services
• Focus on both market conduct and consumer protection

LICENSE REQUIREMENTS:
• Florida Life Insurance License (including Variable Annuities)
• Pre-licensing education: 40 hours
• Pass state examination
• Background check and fingerprinting
• Continuing Education: 24 hours every 2 years (5 hours must be in specified topics)

APPOINTMENT REQUIREMENTS:
• Must be appointed by each carrier
• Appointment fee: $60 per company
• Must maintain appointments actively

KEY FLORIDA REGULATIONS:
• Florida Statutes Chapter 626: Insurance agent licensing
• Florida Statutes Chapter 627: Insurance rates and contracts
• Rule 69B-215: Annuity suitability
• Florida Statutes 626.99: Annuity Disclosure

FLORIDA'S UNIQUE POSITION:
• Large retiree population (high senior market)
• Hurricane exposure creates specific concerns
• Strong consumer protection focus
• Active enforcement environment`,
        keyPoints: [
          'OIR is primary regulator',
          '40 hours pre-licensing, 24 hours CE',
          'Fingerprinting required',
          'Large senior population drives focus',
          'Active enforcement environment'
        ]
      },
      {
        id: 'sec-fl-2',
        title: 'Florida Suitability Requirements',
        duration: 4,
        content: `Florida has robust suitability requirements, especially for annuities.

ANNUITY SUITABILITY (Rule 69B-215):
Before recommending an annuity, you MUST gather:
• Age and retirement status
• Annual income
• Intended use of the annuity
• Financial situation and needs
• Tax status
• Financial objectives
• Existing annuities and life insurance
• Liquidity needs
• Risk tolerance

SUITABILITY DOCUMENTATION:
• Complete a suitability questionnaire
• Document the recommendation rationale
• Explain why the product meets their needs
• Retain for insurer supervision
• 5-year minimum retention

INSURER OBLIGATIONS:
Florida requires insurers to:
• Establish suitability supervision procedures
• Review recommendations for appropriateness
• Take corrective action when suitability issues found
• Report persistent problems to OIR

BEST INTEREST STANDARD:
Florida has moved toward a "best interest" standard for annuities:
• Recommendation must be in client's best interest
• Not just "suitable" but "best" among reasonably available options
• Must consider client's values and goals

ENHANCED REQUIREMENTS FOR SENIORS:
When selling to Florida seniors (60+):
• Additional scrutiny on suitability
• Ensure understanding is verified
• Document cognitive awareness
• Consider shorter surrender periods`,
        keyPoints: [
          'Comprehensive suitability gathering required',
          'Best interest standard for annuities',
          'Insurer supervision required',
          '5-year record retention',
          'Enhanced requirements for 60+'
        ]
      },
      {
        id: 'sec-fl-3',
        title: 'Florida Senior Protections',
        duration: 5,
        content: `Florida has extensive senior consumer protections given its demographic.

SENIOR CONSUMER DEFINITION:
Florida defines "senior" differently across regulations, but generally 60-65+ for enhanced protections.

ANNUITY SALES TO SENIORS:
When recommending annuities to seniors, consider:
• Is surrender period appropriate for their age and health?
• Will they have liquidity for emergencies?
• Do they understand the product fully?
• Is anyone unduly influencing their decision?

FREE LOOK PERIOD:
• Standard: 14 days
• Annuities (new): 21 days
• Replacement annuities: 21 days
• Free look runs from delivery of policy

PROHIBITED PRACTICES WITH SENIORS:
• Recommending products with surrender periods beyond life expectancy
• High-pressure sales tactics
• Selling products designed for accumulation to those needing income
• Ignoring signs of diminished capacity

ELDER FINANCIAL EXPLOITATION:
Florida Statute 825.103 addresses financial exploitation of seniors. Watch for:
• Family members pushing decisions
• Confusion about the product
• Reluctance to involve other family
• Unusual policy ownership or beneficiary arrangements

REPORTING OBLIGATIONS:
If you suspect elder financial abuse:
• Do NOT proceed with transaction
• Document your concerns
• Report to compliance immediately
• Florida has mandatory reporting in some circumstances`,
        keyPoints: [
          'Senior = generally 60-65+ in Florida',
          '21-day free look on annuities',
          'Match surrender period to life expectancy',
          'Watch for exploitation signs',
          'Reporting may be mandatory'
        ],
        complianceNotes: [
          'Never proceed if senior seems confused',
          'Document understanding verification',
          'Report suspected abuse immediately',
          'Consider surrender period vs age'
        ]
      },
      {
        id: 'sec-fl-4',
        title: 'Florida Replacement Regulations',
        duration: 3,
        content: `Florida has specific replacement notification requirements.

REPLACEMENT DEFINITION:
A replacement occurs when a new policy is purchased and an existing policy is:
• Lapsed, surrendered, or forfeited
• Converted to paid-up or extended term
• Reduced in value or coverage
• Amended to reduce benefits
• Subject to loans or withdrawals used for new purchase

FLORIDA REPLACEMENT FORM:
When replacement is involved:
1. Complete the Florida replacement form
2. Provide to client before application completion
3. Obtain client signature
4. Send to existing insurer within 5 business days
5. Retain copy for 5 years

COMPARISON REQUIREMENT:
Must provide comparison showing:
• Current policy values and features
• Proposed policy values and features
• Costs of replacement
• Benefits potentially lost

INTERNAL VS EXTERNAL REPLACEMENT:
• Internal (same company): Still requires replacement procedures
• External (different company): Full replacement requirements
• Both require suitability justification

CHURNING AND TWISTING:
Florida aggressively prosecutes:
• Churning: Excessive replacements for commission
• Twisting: Inducing replacement through misrepresentation

These are grounds for license revocation and criminal charges.`,
        keyPoints: [
          'Replacement form required',
          'Notify existing insurer within 5 days',
          'Comparison of policies required',
          'Same-company replacements still covered',
          'Churning and twisting aggressively prosecuted'
        ]
      },
      {
        id: 'sec-fl-5',
        title: 'Florida Disclosure Requirements',
        duration: 2,
        content: `Florida has specific disclosure requirements.

REQUIRED DISCLOSURES:

1. Agent Status
Must disclose you are a licensed insurance agent.

2. Company Representation
Must identify which company(ies) you represent.

3. Compensation
Must disclose that you receive commission. Florida doesn't require specific amounts but transparency is expected.

4. Annuity Buyer's Guide
For annuity sales, must provide the NAIC Buyer's Guide before application.

5. Illustration Requirements
• Must provide policy illustration
• Must explain guaranteed vs. non-guaranteed values
• Client must sign acknowledgment

6. Product Disclosures
Must explain:
• Surrender charges and duration
• Fees and expenses
• Tax implications (without providing tax advice)
• Beneficiary information

FLORIDA DECEPTIVE AND UNFAIR TRADE PRACTICES:
Florida Statute 626.9541 prohibits:
• False advertising
• Defamation of competitors
• Boycott, coercion, or intimidation
• Misleading policy comparisons
• Unfair discrimination

Violations can result in fines up to $5,000 per offense.`,
        keyPoints: [
          'Disclose agent status and company',
          'NAIC Buyer\'s Guide required for annuities',
          'Illustration acknowledgment required',
          'Explain surrender charges and fees',
          'Deceptive practices heavily penalized'
        ]
      }
    ],
    learningObjectives: [
      'Understand Florida regulatory environment',
      'Apply FL suitability requirements',
      'Implement senior protections',
      'Follow replacement procedures',
      'Make required Florida disclosures'
    ],
    requiredForCertification: ['cert-state-florida'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-suitability-defense'],
    assessmentRequired: true,
    assessmentId: 'assess-state-florida',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // NEW YORK STATE COMPLIANCE
  // -------------------------------------------------------------------------
  {
    id: 'mod-state-newyork',
    code: 'GCF-704',
    title: 'New York State Compliance',
    subtitle: 'DFS Requirements and NY-Specific Rules',
    description: 'State-specific compliance training for selling life insurance and annuities in New York.',
    category: 'state_specific',
    type: 'reading',
    certificationLevel: 'state_expansion',
    duration: 22,
    sections: [
      {
        id: 'sec-ny-1',
        title: 'New York Department of Financial Services',
        duration: 4,
        content: `New York is known for having the strictest insurance regulations in the United States.

REGULATORY AUTHORITY:
• New York Department of Financial Services (DFS)
• Superintendent appointed by Governor
• Historically sets standard for other states
• Extremely consumer-protective approach

LICENSE REQUIREMENTS:
• New York Life Insurance Agent License
• Pre-licensing education: 40 hours
• Pass state examination (considered difficult)
• Background check required
• Continuing Education: 15 hours every 2 years (NOT required for Life-only)

IMPORTANT: New York does NOT require continuing education for Life-only licensed agents. However, GCF requires CE regardless.

APPOINTMENT REQUIREMENTS:
• Must be appointed by each carrier
• New York-specific product approval required
• Many products sold in other states are NOT approved in NY

KEY NEW YORK REGULATIONS:
• NY Insurance Law Article 24: Suitability
• Regulation 60: Illustrations
• Regulation 187: Best Interest Standard (strongest in nation)
• NY Insurance Law §4228: Replacement regulations

NEW YORK'S REPUTATION:
• Strictest standards in the nation
• Many carriers create "NY versions" of products
• DFS enforcement is aggressive
• Sets precedent for national regulations`,
        keyPoints: [
          'DFS is strictest regulator',
          'No CE required for Life-only (but GCF requires it)',
          'Many products not approved in NY',
          'Regulation 187 is strongest best interest standard',
          'NY often sets national precedent'
        ]
      },
      {
        id: 'sec-ny-2',
        title: 'Regulation 187: Best Interest Standard',
        duration: 6,
        content: `Regulation 187 is the strictest suitability standard in the nation.

EFFECTIVE:
• Life insurance: August 2019
• Annuities: February 2020

THE BEST INTEREST STANDARD:
Regulation 187 requires that recommendations must be in the "best interest" of the consumer. This means:

1. Care Obligation
Exercise reasonable diligence, care, and skill when making recommendations.

2. Disclosure Obligation
Disclose all material facts relating to:
• The scope of the relationship
• The recommendation
• Any material conflicts of interest

3. Conflict of Interest Obligation
Identify and avoid or reasonably manage material conflicts of interest.

4. Documentation Obligation
Document the basis for each recommendation and maintain for the insurer.

WHAT "BEST INTEREST" MEANS:
The recommendation must reflect:
• Consumer's suitability information
• Not subject producer's compensation above consumer's interest
• Not subject insurance producer's interests above consumer's

THIS IS HIGHER THAN SUITABILITY:
• Suitability: "Is this product appropriate?"
• Best Interest: "Is this the BEST option for this consumer?"

PRACTICAL IMPLICATIONS:
• Must consider alternatives
• Must explain why this product vs. others
• Cannot prioritize higher-commission products
• Must document your reasoning

PENALTIES:
Violations can result in:
• Fines
• License revocation
• Personal liability
• Carrier sanctions`,
        keyPoints: [
          'Best interest is higher than suitability',
          'Must prove this is the BEST option',
          'Cannot prioritize compensation',
          'Must document reasoning thoroughly',
          'Strictest standard in the nation'
        ]
      },
      {
        id: 'sec-ny-3',
        title: 'New York Illustration Requirements',
        duration: 4,
        content: `New York Regulation 60 governs policy illustrations.

ILLUSTRATION REQUIREMENTS:
• Must provide illustration before application
• Must include guaranteed and non-guaranteed values
• Must use DFS-approved illustration formats
• Client must sign illustration acknowledgment

SPECIFIC REQUIREMENTS:
Illustrations must show:
• Annual premiums
• Death benefits by year
• Cash values (guaranteed and projected)
• Surrender values
• Loan interest assumptions
• All fees and charges

ACTUARIAL STANDARDS:
• Illustrations must follow Actuarial Standards of Practice
• Projections must be reasonable
• Cannot illustrate rates higher than historically supportable

WHAT YOU MUST EXPLAIN:
• Difference between guaranteed and non-guaranteed values
• Assumptions underlying projections
• That projections are not guarantees
• How fees and charges affect values

IUL-SPECIFIC REQUIREMENTS:
For IUL in New York:
• Must show impact of caps and participation rates changing
• Must illustrate zero-return years
• Must explain index crediting method clearly

DOCUMENTATION:
• Signed illustration must be retained
• Part of the application package
• Subject to DFS audit`,
        keyPoints: [
          'Regulation 60 governs illustrations',
          'Guaranteed and non-guaranteed must be shown',
          'Client must sign acknowledgment',
          'IUL has additional requirements',
          'All illustrations subject to audit'
        ]
      },
      {
        id: 'sec-ny-4',
        title: 'New York Replacement Regulations',
        duration: 4,
        content: `New York has the most comprehensive replacement regulations.

REPLACEMENT DEFINITION:
New York's definition is broad—essentially any transaction that could reduce existing coverage qualifies.

REPLACEMENT REQUIREMENTS:

1. Important Notice Regarding Replacement
Must provide before application is signed.

2. Disclosure Statement
Must detail:
• All existing policies that may be affected
• Comparison of old vs. new coverage
• Potential disadvantages of replacement
• Consumer's right to review with existing insurer

3. Comparison Forms
Must complete comparison showing:
• Current death benefit vs. proposed
• Current cash value vs. projected
• Current premium vs. new premium
• Surrender charges on existing policy

4. Notification to Existing Insurer
Must notify within 10 days of application.

SPECIAL NEW YORK REQUIREMENTS:
• Must retain replacement documentation for at least 6 years
• Insurer must review all replacements
• Pattern of replacements triggers investigation
• Internal replacements are scrutinized as heavily as external

FINRA COORDINATION:
For variable products, must also comply with FINRA replacement rules (including 1035 exchange requirements).

REPLACEMENT RED FLAGS (NY specific):
DFS watches for:
• High replacement ratios by agent
• Replacements that reset surrender charges
• Replacements of policies less than 2 years old
• Replacements that reduce guaranteed benefits`,
        keyPoints: [
          'Broadest replacement definition',
          'Multiple forms required',
          '10-day notification to existing insurer',
          '6-year minimum retention',
          'DFS monitors replacement patterns'
        ]
      },
      {
        id: 'sec-ny-5',
        title: 'New York Product Restrictions',
        duration: 4,
        content: `New York has unique product approval requirements that affect what can be sold.

PRODUCT APPROVAL:
• All products must be approved by DFS before sale in NY
• Many products sold elsewhere are NOT approved
• "NY versions" often have different features

COMMON NY RESTRICTIONS:

Life Insurance:
• Certain commission structures not allowed
• Some riders not approved
• Illustration rates may be lower than other states

Annuities:
• Bonus annuities heavily restricted
• Surrender periods may be limited
• Some indexed crediting methods not approved

IUL:
• Cap and participation rate illustrations restricted
• Loan provisions may differ
• Some index options not available

WHAT THIS MEANS FOR YOU:
• Always verify product is approved for NY
• Check if NY version differs from standard version
• Don't assume features available elsewhere work in NY
• Work with carrier to understand NY-specific provisions

PENALTIES FOR UNAPPROVED PRODUCTS:
Selling a product not approved for New York is a serious violation:
• Automatic license suspension
• Fines per transaction
• Potential policy rescission
• Carrier may face market conduct investigation

VERIFICATION:
Before any NY sale:
• Confirm product is NY-approved
• Review NY-specific product features
• Use NY-specific illustrations and forms
• Document NY compliance steps`,
        keyPoints: [
          'Products must be DFS-approved',
          'NY versions often differ from standard',
          'Verify NY approval before every sale',
          'Selling unapproved products = license suspension',
          'Document NY compliance verification'
        ],
        complianceNotes: [
          'ALWAYS verify NY product approval',
          'Use NY-specific illustrations',
          'Complete NY-specific forms',
          'Selling unapproved products is serious violation'
        ]
      }
    ],
    learningObjectives: [
      'Understand New York\'s regulatory environment',
      'Apply Regulation 187 best interest standard',
      'Follow NY illustration requirements',
      'Complete NY replacement procedures',
      'Verify NY product approval before sale'
    ],
    requiredForCertification: ['cert-state-newyork'],
    prerequisiteModules: ['mod-compliance-intro', 'mod-suitability-defense'],
    assessmentRequired: true,
    assessmentId: 'assess-state-newyork',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },
  // =========================================================================
  // ONGOING COMPLIANCE MODULES (Level 4: Annual Recertification)
  // =========================================================================

  // -------------------------------------------------------------------------
  // AML/KYC ANNUAL TRAINING
  // -------------------------------------------------------------------------
  {
    id: 'mod-aml-annual',
    code: 'GCF-501',
    title: 'Anti-Money Laundering & Know Your Customer',
    subtitle: 'Annual AML/KYC Compliance Training',
    description: 'Mandatory annual training on anti-money laundering regulations, suspicious activity identification, and know-your-customer requirements. Required for continued authorization.',
    category: 'compliance',
    type: 'interactive',
    certificationLevel: 'ongoing_compliance',
    duration: 45,
    sections: [
      {
        id: 'sec-aml-1',
        title: 'Why This Matters',
        duration: 5,
        content: `Anti-money laundering compliance is not optional—it is a federal requirement that protects you, Gold Coast Financial, and the integrity of the financial system.

WHY AML MATTERS FOR INSURANCE:

Life insurance products can be used to launder money through:
• Large single-premium payments
• Frequent policy loans and surrenders
• Third-party premium payments
• Policies purchased for others without clear insurable interest

YOUR RESPONSIBILITY:

As a licensed advisor, you are on the front line of AML compliance. You must:
• Know your customer—verify identity and understand their situation
• Recognize red flags that may indicate suspicious activity
• Report concerns through proper channels
• Document your observations

CONSEQUENCES OF FAILURE:

AML violations can result in:
• Personal criminal liability (fines up to $500,000, imprisonment up to 10 years)
• Loss of insurance license
• Termination of employment
• Institutional penalties for Gold Coast Financial

This is serious. This training ensures you know what to look for and what to do.`,
        keyPoints: [
          'AML compliance is a federal requirement',
          'Insurance products can be used for money laundering',
          'You are personally responsible for compliance',
          'Violations carry severe penalties'
        ]
      },
      {
        id: 'sec-aml-2',
        title: 'Know Your Customer (KYC) Requirements',
        duration: 10,
        content: `KYC is the foundation of AML compliance. You must verify and document customer identity before any transaction.

CUSTOMER IDENTIFICATION PROGRAM (CIP):

Before completing any application, you must:

1. Obtain Identifying Information:
   • Full legal name
   • Date of birth
   • Address (physical, not P.O. Box for primary residence)
   • Government-issued ID number (SSN, driver's license, passport)

2. Verify Identity:
   • Review government-issued photo ID
   • Confirm information matches application
   • Document the ID reviewed (type, number, expiration)

3. Screen Against OFAC Lists:
   • Office of Foreign Assets Control maintains lists of prohibited persons
   • All customers must be screened before policy issuance
   • This is automated but you must ensure accurate information is submitted

BENEFICIAL OWNERSHIP:

For policies involving trusts, businesses, or third-party arrangements:
• Identify all beneficial owners (25%+ ownership)
• Understand the purpose of the arrangement
• Document the legitimate business reason

COMMON MISTAKE:
Accepting verbal information without verification. Always see the ID. Always document what you saw.`,
        keyPoints: [
          'Verify identity with government-issued photo ID',
          'Document all identifying information',
          'Screen against OFAC prohibited persons lists',
          'Identify beneficial owners for complex arrangements'
        ]
      },
      {
        id: 'sec-aml-3',
        title: 'Red Flags & Suspicious Activity',
        duration: 15,
        content: `Recognizing suspicious activity is critical. These red flags do not automatically mean illegal activity, but they require additional scrutiny and documentation.

PAYMENT RED FLAGS:

• Large single-premium payments (especially $10,000+ in cash)
• Third-party payments from unknown sources
• Multiple payments just under reporting thresholds ($9,999)
• Requests to pay with money orders, cashier's checks, or cryptocurrency
• Difficulty explaining source of funds

CUSTOMER BEHAVIOR RED FLAGS:

• Reluctance to provide identification or documentation
• Providing false or inconsistent information
• Unusual interest in early surrender or loan provisions
• Questions about how quickly funds can be accessed
• Pressure to complete transaction quickly without proper documentation
• Using intermediaries without clear reason

POLICY STRUCTURE RED FLAGS:

• No clear insurable interest
• Beneficiary in different country or jurisdiction
• Multiple policies purchased in short timeframe
• Policies sized inconsistently with stated income
• Requests to change ownership or beneficiary shortly after purchase

GEOGRAPHIC RED FLAGS:

• Customer from high-risk jurisdiction
• Funds originating from countries with weak AML controls
• Complex international ownership structures

WHAT TO DO:

If you observe red flags:
1. Do NOT confront the customer or accuse them
2. Do NOT proceed with the transaction if concerns are serious
3. Document your observations factually
4. Report through the compliance hotline immediately
5. Do NOT discuss the report with the customer or colleagues`,
        keyPoints: [
          'Large cash payments are a red flag',
          'Reluctance to provide ID requires scrutiny',
          'Do not confront suspicious customers',
          'Report concerns through compliance channels'
        ]
      },
      {
        id: 'sec-aml-4',
        title: 'Reporting Requirements',
        duration: 10,
        content: `Understanding reporting requirements protects you and ensures compliance.

SUSPICIOUS ACTIVITY REPORTS (SARs):

When Gold Coast Financial files a SAR:
• Transactions involving $5,000+ where money laundering is suspected
• Any transaction where the advisor suspects illegal activity
• Patterns of activity suggesting structuring or layering

YOUR ROLE:

You do not file SARs directly. Your responsibility is to:
1. Recognize potential suspicious activity
2. Document your observations factually
3. Report to compliance through the designated channel
4. Continue serving the customer normally (do not tip off)

CURRENCY TRANSACTION REPORTS (CTRs):

Required for cash transactions over $10,000:
• Automatically filed based on payment information
• You must accurately record payment method and amount
• Structuring (breaking up transactions to avoid reporting) is illegal

WHAT "TIPPING OFF" MEANS:

It is a federal crime to inform a customer that:
• A SAR has been or will be filed
• They are under investigation
• Their transaction was flagged

Even seemingly innocent comments like "compliance is looking at this" can constitute tipping off.

PROTECTION FOR REPORTERS:

• Safe harbor protection for good-faith reports
• Retaliation for reporting is prohibited
• Your identity is protected in SAR filings`,
        keyPoints: [
          'Report suspicious activity to compliance immediately',
          'Never tip off customers about investigations',
          'CTRs required for cash over $10,000',
          'Safe harbor protects good-faith reporters'
        ]
      },
      {
        id: 'sec-aml-5',
        title: 'Annual Certification',
        duration: 5,
        content: `This training requires annual completion and certification.

YOUR CERTIFICATION CONFIRMS:

• You have completed AML/KYC training for this calendar year
• You understand your responsibilities under the Bank Secrecy Act
• You know how to identify and report suspicious activity
• You will comply with all KYC requirements
• You understand the consequences of non-compliance

ONGOING OBLIGATIONS:

Between annual trainings, you must:
• Stay alert for red flags in every transaction
• Report any suspicious activity immediately
• Maintain accurate customer documentation
• Complete any supplemental training as required

RESOURCES:

• Compliance Hotline: [Internal number]
• AML Quick Reference Card (available in Resources)
• Suspicious Activity Reporting Form (available in Agent Portal)

Complete the assessment to certify your AML/KYC compliance for this year.`,
        keyPoints: [
          'Annual certification is mandatory',
          'Report suspicious activity between trainings',
          'Resources available in Agent Portal',
          'Complete assessment to certify'
        ]
      }
    ],
    learningObjectives: [
      'Understand AML regulatory requirements',
      'Apply KYC procedures to verify customer identity',
      'Recognize red flags indicating potential suspicious activity',
      'Follow proper reporting procedures'
    ],
    requiredForCertification: ['cert-annual-compliance'],
    prerequisiteModules: [],
    assessmentRequired: true,
    assessmentId: 'assess-aml-annual',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // ETHICS ANNUAL TRAINING
  // -------------------------------------------------------------------------
  {
    id: 'mod-ethics-annual',
    code: 'GCF-502',
    title: 'Professional Ethics & Standards',
    subtitle: 'Annual Ethics Compliance Training',
    description: 'Annual refresher on professional ethics, fiduciary responsibilities, and Gold Coast Financial standards of conduct. Required for continued authorization.',
    category: 'compliance',
    type: 'reading',
    certificationLevel: 'ongoing_compliance',
    duration: 30,
    sections: [
      {
        id: 'sec-ethics-1',
        title: 'Why This Matters',
        duration: 5,
        content: `Ethics training is not a formality—it is the foundation of everything we do at Gold Coast Financial.

THE COST OF ETHICAL FAILURES:

Recent industry statistics show:
• 73% of E&O claims involve allegations of misrepresentation
• Average settlement for ethics violations exceeds $150,000
• Advisors who face ethics complaints have 40% shorter careers
• One viral social media post can destroy years of reputation

WHY ANNUAL REFRESHERS:

Even experienced professionals benefit from ethics review because:
• Pressure to perform can erode judgment over time
• Industry regulations evolve
• New ethical challenges emerge (social media, AI, etc.)
• Complacency is the enemy of compliance

THIS TRAINING WILL COVER:

• Fiduciary duties and client-first obligations
• Common ethical dilemmas and how to navigate them
• Social media and communication standards
• Conflict of interest management
• Reporting obligations

Your continued authorization depends on completing this training and demonstrating ethical commitment.`,
        keyPoints: [
          'Ethics violations have severe career consequences',
          'Annual refresher combats complacency',
          'Fiduciary duty is non-negotiable',
          'Social media creates new ethical challenges'
        ]
      },
      {
        id: 'sec-ethics-2',
        title: 'Fiduciary Duties Refresher',
        duration: 8,
        content: `As a Gold Coast Financial Advisor, you operate as a fiduciary-in-practice. This is the highest standard of care.

CORE FIDUCIARY DUTIES:

1. Duty of Loyalty
   • Put client interests ahead of your own
   • Never recommend products for commission reasons
   • Disclose all conflicts of interest

2. Duty of Care
   • Provide competent, informed advice
   • Stay current on products and regulations
   • Document your analysis and reasoning

3. Duty of Disclosure
   • Be transparent about all material facts
   • Explain risks as clearly as benefits
   • Never omit information that would affect client decisions

4. Duty of Good Faith
   • Act honestly in all dealings
   • Honor commitments
   • Treat clients as you would want to be treated

COMMON MISTAKE:
Believing that client satisfaction equals fiduciary compliance. A client can be happy with a recommendation that was not in their best interest. Document WHY your recommendation was suitable, not just that they agreed to it.`,
        keyPoints: [
          'Fiduciary standard is the highest duty',
          'Loyalty means client interests first',
          'Disclosure must be complete and transparent',
          'Client satisfaction does not equal compliance'
        ]
      },
      {
        id: 'sec-ethics-3',
        title: 'Ethical Dilemmas & Decision Framework',
        duration: 10,
        content: `Real ethical challenges are rarely black and white. Use this framework when facing difficult decisions.

THE GCF ETHICAL DECISION FRAMEWORK:

1. IDENTIFY the ethical issue
   • Who could be harmed?
   • What rules or standards apply?
   • Is there a conflict of interest?

2. CONSIDER your options
   • What are all possible actions?
   • What would each option mean for the client?
   • What would each option mean for you?

3. EVALUATE against standards
   • Would this violate any law or regulation?
   • Would this violate GCF policy?
   • Would I be comfortable if this appeared in the news?
   • Would I be comfortable explaining this to my family?

4. DECIDE and document
   • Choose the option that best serves the client
   • Document your reasoning
   • If still uncertain, consult compliance

REAL SCENARIOS:

Scenario 1: A longtime client asks you to "just sign here" without going through the full disclosure process because "we've done this before."
Answer: Full disclosure is required every time. Familiarity does not exempt you from compliance.

Scenario 2: You realize you made an error on a submitted application that benefits the client (lower premium).
Answer: Disclose and correct the error. Beneficial errors are still errors.

Scenario 3: A client's adult child asks for information about their parent's policy.
Answer: Do not disclose without written authorization from the policy owner.`,
        keyPoints: [
          'Use the GCF decision framework for ethical dilemmas',
          'When in doubt, choose client protection',
          'Document your ethical reasoning',
          'Consult compliance when uncertain'
        ]
      },
      {
        id: 'sec-ethics-4',
        title: 'Communication & Social Media Standards',
        duration: 7,
        content: `Modern communication creates new ethical obligations. Everything you say publicly reflects on Gold Coast Financial.

SOCIAL MEDIA RULES:

PROHIBITED:
• Making specific product recommendations publicly
• Sharing client information (even anonymized "success stories" without consent)
• Guaranteeing returns or outcomes
• Disparaging competitors
• Political commentary tied to your professional identity

PERMITTED (with care):
• Educational content about insurance concepts
• Sharing official GCF content
• Professional networking
• Personal content clearly separate from professional role

EMAIL AND TEXT STANDARDS:

• All client communications must be through approved channels
• Retain copies of all substantive communications
• Never promise anything in writing you cannot deliver
• Be professional—assume every message could be read in court

COMMON MISTAKE:
Casual text messages to clients. "Hey, that policy we talked about is ready" seems harmless but creates documentation gaps. Use proper channels for substantive communications.`,
        keyPoints: [
          'Social media reflects on GCF',
          'No product recommendations publicly',
          'Use approved communication channels',
          'Assume all messages could be read in court'
        ]
      }
    ],
    learningObjectives: [
      'Reaffirm fiduciary duties and obligations',
      'Apply ethical decision framework to dilemmas',
      'Follow communication and social media standards',
      'Recognize and manage conflicts of interest'
    ],
    requiredForCertification: ['cert-annual-compliance'],
    prerequisiteModules: [],
    assessmentRequired: true,
    assessmentId: 'assess-ethics-annual',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  },

  // -------------------------------------------------------------------------
  // REGULATORY UPDATE TRAINING
  // -------------------------------------------------------------------------
  {
    id: 'mod-regulatory-update',
    code: 'GCF-503',
    title: 'Regulatory Updates & Changes',
    subtitle: 'Annual Regulatory Environment Review',
    description: 'Annual review of regulatory changes affecting insurance sales, including new rules, enforcement trends, and updated GCF policies. Required for continued authorization.',
    category: 'compliance',
    type: 'reading',
    certificationLevel: 'ongoing_compliance',
    duration: 25,
    sections: [
      {
        id: 'sec-reg-1',
        title: 'Why This Matters',
        duration: 5,
        content: `The regulatory environment for insurance is constantly evolving. What was compliant last year may not be compliant today.

2025-2026 REGULATORY LANDSCAPE:

Key changes affecting your practice:
• Enhanced suitability documentation requirements
• Expanded senior protection rules in multiple states
• New annuity best interest standards
• Increased enforcement activity and penalties

WHY STAYING CURRENT MATTERS:

• "I didn't know" is not a defense
• Regulators expect professionals to stay informed
• Penalties have increased significantly
• Client expectations have evolved

THIS MODULE COVERS:

• Major regulatory changes from the past year
• Updated GCF policies in response to regulations
• Enforcement trends and common violations
• What to watch for in the coming year

Completing this training demonstrates your commitment to compliance and protects your license.`,
        keyPoints: [
          'Regulations change annually',
          'Ignorance is not a defense',
          'Penalties have increased',
          'GCF policies reflect current regulations'
        ]
      },
      {
        id: 'sec-reg-2',
        title: 'Suitability & Best Interest Updates',
        duration: 8,
        content: `Suitability standards continue to tighten. Several states have adopted or strengthened best interest requirements.

CURRENT BEST INTEREST STANDARD:

The NAIC Suitability in Annuity Transactions Model Regulation now requires:
• Reasonable basis to believe recommendation is in customer's best interest
• Documentation of WHY the product is suitable, not just THAT it is
• Consideration of reasonably available alternatives
• No consideration of producer compensation in recommendations

DOCUMENTATION REQUIREMENTS:

You must now document:
• Customer's financial situation, needs, and objectives
• Basis for determining the recommendation addresses those needs
• Why this product over alternatives
• Customer's understanding of key features and limitations

ENHANCED REQUIREMENTS FOR SENIORS:

Many states now require additional protections for customers 65+:
• Mandatory suitability confirmation calls
• Extended free-look periods
• Additional disclosure requirements
• Prohibition on certain high-surrender-charge products

GCF POLICY UPDATES:

In response to these regulations, GCF has:
• Updated suitability documentation templates
• Implemented mandatory compliance review for senior sales
• Enhanced CRM documentation requirements
• Added suitability checklist to application workflow`,
        keyPoints: [
          'Best interest is now the standard in many states',
          'Document WHY your recommendation is suitable',
          'Senior protections have expanded',
          'GCF templates reflect current requirements'
        ]
      },
      {
        id: 'sec-reg-3',
        title: 'Enforcement Trends',
        duration: 7,
        content: `Understanding enforcement trends helps you avoid common pitfalls.

TOP ENFORCEMENT ACTIONS (Past 12 Months):

1. Unsuitable Annuity Sales to Seniors
   • Average penalty: $75,000 + restitution
   • Common issue: High surrender charges for clients 70+
   • GCF requirement: Compliance review for all senior annuity sales

2. Misleading Product Comparisons
   • Average penalty: $25,000 + license suspension
   • Common issue: Comparing IUL to market investments
   • GCF requirement: Use only approved comparison materials

3. Replacement Without Documentation
   • Average penalty: $15,000 + supervision requirements
   • Common issue: Failing to document why replacement benefits client
   • GCF requirement: Replacement checklist for all policy changes

4. Failure to Disclose Compensation
   • Average penalty: $10,000 + enhanced disclosure requirements
   • Common issue: Not explaining how advisor is compensated
   • GCF requirement: Compensation disclosure in every sale

WARNING SIGNS REGULATORS LOOK FOR:

• High replacement ratios
• Concentration in highest-commission products
• Senior client complaints
• Social media violations
• Documentation gaps`,
        keyPoints: [
          'Senior sales face highest scrutiny',
          'Product comparisons must be accurate',
          'Replacements require documentation',
          'Compensation disclosure is mandatory'
        ]
      },
      {
        id: 'sec-reg-4',
        title: 'Updated GCF Policies',
        duration: 5,
        content: `GCF has implemented several policy updates in response to regulatory changes.

NEW OR UPDATED POLICIES:

1. Senior Client Sales (effective 2025-07-01)
   • Mandatory 48-hour cooling-off period for clients 70+
   • Compliance review required before application submission
   • Enhanced documentation of client comprehension

2. Suitability Documentation (effective 2025-09-01)
   • New suitability template with "WHY" sections
   • Mandatory comparison to alternatives considered
   • Client acknowledgment of key limitations

3. Communication Standards (effective 2025-10-01)
   • All client texts must be through approved platform
   • Social media disclosure requirements
   • Retention requirements for all communications

4. Replacement Procedures (effective 2025-11-01)
   • Replacement checklist now mandatory
   • Side-by-side comparison required
   • Manager review for all replacements

ACCESS UPDATED MATERIALS:

All updated forms and templates are available in the Agent Portal under "Compliance Resources." Using outdated forms is a compliance violation.

Complete the assessment to certify your understanding of current regulatory requirements.`,
        keyPoints: [
          'Senior sales require compliance review',
          'New suitability template is mandatory',
          'Text communications must use approved platform',
          'Updated forms available in Agent Portal'
        ]
      }
    ],
    learningObjectives: [
      'Understand current suitability and best interest requirements',
      'Recognize enforcement trends and common violations',
      'Apply updated GCF policies to daily practice',
      'Access current compliance resources'
    ],
    requiredForCertification: ['cert-annual-compliance'],
    prerequisiteModules: [],
    assessmentRequired: true,
    assessmentId: 'assess-regulatory-update',
    version: '1.0',
    lastUpdated: '2026-01-26',
    complianceApprovalDate: '2026-01-20'
  }
];

// ============================================================================
// ASSESSMENT STRUCTURE
// ============================================================================

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'scenario'
  | 'select_all';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  category: string;
  question: string;
  scenario?: string;           // For scenario-based questions
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;      // Shown after answer
  }[];
  correctFeedback: string;
  incorrectFeedback: string;
  complianceReference?: string; // Reference to relevant compliance requirement
  difficultyLevel: 1 | 2 | 3;
  autoFailOnIncorrect?: boolean; // Critical questions that auto-fail the assessment
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  certificationLevel: CertificationLevel;
  questions: AssessmentQuestion[];
  passingScore: number;          // Percentage (0-100)
  timeLimit: number;             // Minutes (0 = no limit)
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;   // After completion
  requiresProctoring: boolean;
  autoFailQuestions: string[];   // Question IDs that auto-fail if wrong
}

// ============================================================================
// SAMPLE ASSESSMENTS
// ============================================================================

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'assess-doctrine',
    title: 'Institutional Doctrine Assessment',
    description: 'Assessment covering Gold Coast Financial institutional philosophy, professional obligations, and foundational standards.',
    moduleId: 'mod-philosophy',
    certificationLevel: 'pre_access',
    passingScore: 85,
    timeLimit: 45,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-doctrine-1', 'q-doctrine-5'],
    questions: [
      {
        id: 'q-doctrine-1',
        type: 'multiple_choice',
        category: 'Institutional Identity',
        question: 'As a Gold Coast Financial Advisor, which of the following best describes your professional identity?',
        options: [
          { id: 'a', text: 'An independent sales professional who works with Gold Coast Financial', isCorrect: false, explanation: 'You are not independent—you operate under institutional authority.' },
          { id: 'b', text: 'A licensed fiduciary-in-practice representing a regulated financial institution', isCorrect: true, explanation: 'Correct. You represent the institution and operate under its authority and compliance requirements.' },
          { id: 'c', text: 'A commission-based closer focused on maximizing personal income', isCorrect: false, explanation: 'Gold Coast Financial is not a sales organization focused on commission maximization.' },
          { id: 'd', text: 'A self-employed contractor with flexibility in methods and messaging', isCorrect: false, explanation: 'While tax status may vary, you operate under institutional standards, not your own.' }
        ],
        correctFeedback: 'Correct. You represent a regulated financial institution and operate under its authority.',
        incorrectFeedback: 'Review Module 1, Section 1: Institutional Identity.',
        difficultyLevel: 1,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-doctrine-2',
        type: 'true_false',
        category: 'Professional Obligations',
        question: 'If a client agrees to purchase a policy, that agreement alone constitutes proper suitability documentation.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: '"They agreed to buy it" is NOT suitability. You must document WHY the product is appropriate.' },
          { id: 'false', text: 'False', isCorrect: true, explanation: 'Correct. Suitability requires documented justification connecting the recommendation to client needs.' }
        ],
        correctFeedback: 'Correct. Suitability requires documented justification, not just client agreement.',
        incorrectFeedback: 'Review Module 1, Section 2: Professional Obligations - Suitability Determination.',
        difficultyLevel: 2
      },
      {
        id: 'q-doctrine-3',
        type: 'scenario',
        category: 'Compliance',
        question: 'What is the appropriate response in this scenario?',
        scenario: 'You observe a colleague telling a client that rates will increase tomorrow to pressure an immediate decision. You know this is not true.',
        options: [
          { id: 'a', text: 'Say nothing—it is not your business', isCorrect: false, explanation: 'Failure to report known violations is itself a violation.' },
          { id: 'b', text: 'Confront your colleague privately after the call', isCorrect: false, explanation: 'While you may discuss with the colleague, you are still obligated to report.' },
          { id: 'c', text: 'Report the incident through proper compliance channels', isCorrect: true, explanation: 'Correct. You are obligated to report known compliance violations.' },
          { id: 'd', text: 'Wait to see if the client complains before taking action', isCorrect: false, explanation: 'Reporting obligations exist regardless of whether clients complain.' }
        ],
        correctFeedback: 'Correct. You are obligated to report observed compliance violations.',
        incorrectFeedback: 'Review Module 1, Section 2: Escalation of Concerns.',
        complianceReference: 'Professional Obligation #5: Escalation of Concerns',
        difficultyLevel: 2
      },
      {
        id: 'q-doctrine-4',
        type: 'select_all',
        category: 'What We Are NOT',
        question: 'Select ALL statements that accurately describe what Gold Coast Financial is NOT:',
        options: [
          { id: 'a', text: 'A sales organization that celebrates closes', isCorrect: true },
          { id: 'b', text: 'A regulated financial institution', isCorrect: false, explanation: 'Gold Coast Financial IS a regulated institution.' },
          { id: 'c', text: 'A commission-maximizing organization', isCorrect: true },
          { id: 'd', text: 'A platform for building personal brands that conflict with institutional messaging', isCorrect: true },
          { id: 'e', text: 'An education-first advisory firm', isCorrect: false, explanation: 'Gold Coast Financial IS education-first.' }
        ],
        correctFeedback: 'Correct. Gold Coast Financial is not sales-focused, commission-maximizing, or a personal branding platform.',
        incorrectFeedback: 'Review Module 1, Section 3: What We Are NOT.',
        difficultyLevel: 2
      },
      {
        id: 'q-doctrine-5',
        type: 'multiple_choice',
        category: 'Accountability',
        question: 'A single serious compliance breach such as forging a signature results in:',
        options: [
          { id: 'a', text: 'Verbal warning for first offense', isCorrect: false },
          { id: 'b', text: 'Written warning and monitoring', isCorrect: false },
          { id: 'c', text: 'Mandatory remediation training', isCorrect: false },
          { id: 'd', text: 'Immediate termination and potential regulatory referral', isCorrect: true, explanation: 'There is no "three strikes" for serious violations.' }
        ],
        correctFeedback: 'Correct. Serious violations like forgery can result in immediate termination.',
        incorrectFeedback: 'Review Module 1, Section 4: Enforcement Mechanisms.',
        complianceReference: 'Accountability Structure: No Three Strikes Rule',
        difficultyLevel: 1,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-doctrine-6',
        type: 'multiple_choice',
        category: 'Education-First',
        question: 'According to Gold Coast Financial philosophy, what happens if education and a sale conflict?',
        options: [
          { id: 'a', text: 'Find a way to accomplish both', isCorrect: false },
          { id: 'b', text: 'The sale wins because it benefits the client', isCorrect: false },
          { id: 'c', text: 'The sale loses', isCorrect: true, explanation: 'Education always takes priority over sales.' },
          { id: 'd', text: 'Escalate to management for decision', isCorrect: false }
        ],
        correctFeedback: 'Correct. If education and a sale conflict, the sale loses.',
        incorrectFeedback: 'Review Module 2, Section 1: The Education-First Principle.',
        difficultyLevel: 1
      },
      {
        id: 'q-doctrine-7',
        type: 'scenario',
        category: 'Sales That Should Not Happen',
        question: 'What is the appropriate action in this scenario?',
        scenario: 'After explaining a policy thoroughly, the client still cannot articulate what they are buying or why. They say they will just trust your judgment and want to proceed.',
        options: [
          { id: 'a', text: 'Proceed since they consented', isCorrect: false, explanation: 'Client comprehension is required, not just consent.' },
          { id: 'b', text: 'Do not proceed—schedule follow-up education or recommend they consult with family', isCorrect: true },
          { id: 'c', text: 'Simplify the explanation and try once more, then proceed if they agree', isCorrect: false, explanation: 'Comprehension, not just agreement, is required.' },
          { id: 'd', text: 'Proceed but document their lack of understanding', isCorrect: false, explanation: 'Documentation does not cure the problem—comprehension is required.' }
        ],
        correctFeedback: 'Correct. Do not proceed until the client demonstrates understanding.',
        incorrectFeedback: 'Review Module 2, Section 3: The Sale That Should Not Happen.',
        difficultyLevel: 2
      },
      {
        id: 'q-doctrine-8',
        type: 'true_false',
        category: 'Success Measurement',
        question: 'At Gold Coast Financial, an advisor with the highest sales volume is automatically considered the top performer.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Volume alone does not determine success—quality metrics are equally important.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Success is measured by quality metrics alongside volume.',
        incorrectFeedback: 'Review Module 2, Section 4: Measuring Success Correctly.',
        difficultyLevel: 1
      },
      {
        id: 'q-doctrine-9',
        type: 'multiple_choice',
        category: 'Documentation',
        question: 'What is the maximum timeframe for documenting a client interaction?',
        options: [
          { id: 'a', text: '48 hours', isCorrect: false },
          { id: 'b', text: '24 hours', isCorrect: true },
          { id: 'c', text: 'End of business week', isCorrect: false },
          { id: 'd', text: 'Before the next client interaction', isCorrect: false }
        ],
        correctFeedback: 'Correct. All client interactions must be documented within 24 hours.',
        incorrectFeedback: 'Review Module 3, Section 5: Documentation.',
        difficultyLevel: 1
      },
      {
        id: 'q-doctrine-10',
        type: 'multiple_choice',
        category: 'Brand',
        question: 'Client relationships and the Gold Coast Financial brand belong to:',
        options: [
          { id: 'a', text: 'The individual advisor who developed them', isCorrect: false },
          { id: 'b', text: 'The institution', isCorrect: true },
          { id: 'c', text: 'Jointly to the advisor and institution', isCorrect: false },
          { id: 'd', text: 'The client', isCorrect: false }
        ],
        correctFeedback: 'Correct. Client relationships and the brand belong to the institution.',
        incorrectFeedback: 'Review Module 6, Section 1: Brand Ownership.',
        difficultyLevel: 1
      }
    ]
  },
  {
    id: 'assess-brand',
    title: 'Brand Representation & Professionalism Assessment',
    description: 'Assessment covering institutional brand ownership, communication standards, professional appearance, and conduct expectations.',
    moduleId: 'mod-brand',
    certificationLevel: 'pre_access',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: 'q-brand-1',
        type: 'multiple_choice',
        category: 'Brand Ownership',
        question: 'Who owns the Gold Coast Financial brand and client relationships developed through your advisory role?',
        options: [
          { id: 'a', text: 'The individual advisor', isCorrect: false, explanation: 'Client relationships and branding belong to the institution, not the individual.' },
          { id: 'b', text: 'The institution', isCorrect: true, explanation: 'Correct. All brand assets and client relationships belong to Gold Coast Financial.' },
          { id: 'c', text: 'Shared between advisor and institution', isCorrect: false, explanation: 'There is no shared ownership—the institution owns the brand entirely.' },
          { id: 'd', text: 'The client', isCorrect: false, explanation: 'Clients do not own the institutional brand or advisory relationships.' }
        ],
        correctFeedback: 'Correct. The institution owns all brand assets and client relationships.',
        incorrectFeedback: 'Review Module 6, Section 1: Brand Ownership.',
        difficultyLevel: 1
      },
      {
        id: 'q-brand-2',
        type: 'true_false',
        category: 'Communication Standards',
        question: 'You may use your personal social media to promote Gold Coast Financial products as long as the information is accurate.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'All communications must go through approved institutional channels and be pre-approved.' },
          { id: 'false', text: 'False', isCorrect: true, explanation: 'Correct. All marketing and communications must be approved through institutional channels.' }
        ],
        correctFeedback: 'Correct. All communications must be pre-approved through institutional channels.',
        incorrectFeedback: 'Review Module 6, Section 2: Communication Standards.',
        difficultyLevel: 1
      },
      {
        id: 'q-brand-3',
        type: 'multiple_choice',
        category: 'Professional Conduct',
        question: 'A client becomes verbally abusive during a call. What is the appropriate response?',
        options: [
          { id: 'a', text: 'Match their tone to show strength', isCorrect: false, explanation: 'Retaliation or escalation is never appropriate.' },
          { id: 'b', text: 'Maintain professionalism, end the call if needed, and document the interaction', isCorrect: true, explanation: 'Correct. Maintain professionalism, end abusive calls, and document.' },
          { id: 'c', text: 'Ignore the behavior and continue the presentation', isCorrect: false, explanation: 'You should not tolerate abuse—you may end the call professionally.' },
          { id: 'd', text: 'Transfer the client to a manager immediately', isCorrect: false, explanation: 'While escalation may be appropriate, the first step is to maintain professionalism and document.' }
        ],
        correctFeedback: 'Correct. Maintain professionalism, end abusive calls if needed, and always document.',
        incorrectFeedback: 'Review Module 6, Section 4: Handling Difficult Situations.',
        difficultyLevel: 2
      },
      {
        id: 'q-brand-4',
        type: 'select_all',
        category: 'Professional Standards',
        question: 'Select ALL that are requirements for Gold Coast Financial advisors regarding brand representation:',
        options: [
          { id: 'a', text: 'Use only approved marketing materials', isCorrect: true },
          { id: 'b', text: 'Maintain professional appearance on video calls', isCorrect: true },
          { id: 'c', text: 'Create personal branding that highlights your individual approach', isCorrect: false, explanation: 'Personal branding that conflicts with institutional messaging is not permitted.' },
          { id: 'd', text: 'Report negative situations through proper channels', isCorrect: true }
        ],
        correctFeedback: 'Correct. Approved materials, professional appearance, and proper reporting are all required.',
        incorrectFeedback: 'Review Module 6: Brand Representation & Professionalism.',
        difficultyLevel: 1
      }
    ]
  },
  {
    id: 'assess-compliance-basics',
    title: 'Compliance Fundamentals Assessment',
    description: 'Assessment covering basic compliance requirements, reporting obligations, and regulatory framework.',
    moduleId: 'mod-compliance-intro',
    certificationLevel: 'pre_access',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: 'q-comp-1',
        type: 'multiple_choice',
        category: 'Regulatory Framework',
        question: 'A compliance failure by a single advisor can result in:',
        options: [
          { id: 'a', text: 'Consequences only for that individual advisor', isCorrect: false },
          { id: 'b', text: 'Investigation and potential penalties affecting the entire organization', isCorrect: true },
          { id: 'c', text: 'A simple fine that is paid and forgotten', isCorrect: false },
          { id: 'd', text: 'Nothing significant if the client does not complain', isCorrect: false }
        ],
        correctFeedback: 'Correct. Individual violations can trigger organization-wide consequences.',
        incorrectFeedback: 'Review Compliance Fundamentals, Section 1: Regulatory Reality.',
        difficultyLevel: 1
      },
      {
        id: 'q-comp-2',
        type: 'select_all',
        category: 'Obligations',
        question: 'Select ALL that are compliance obligations of a Gold Coast Financial Advisor:',
        options: [
          { id: 'a', text: 'Maintain valid licensing in all states where you sell', isCorrect: true },
          { id: 'b', text: 'Use only approved scripts, materials, and processes', isCorrect: true },
          { id: 'c', text: 'Maximize sales volume above all other considerations', isCorrect: false },
          { id: 'd', text: 'Report suspected compliance violations', isCorrect: true },
          { id: 'e', text: 'Complete all assigned training by deadlines', isCorrect: true }
        ],
        correctFeedback: 'Correct. These are all compliance obligations except maximizing volume.',
        incorrectFeedback: 'Review Compliance Fundamentals, Section 2: Your Compliance Obligations.',
        difficultyLevel: 2
      },
      {
        id: 'q-comp-3',
        type: 'true_false',
        category: 'Reporting',
        question: 'If you are unsure whether something is a compliance violation, you should wait until you are certain before reporting.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'When in doubt, report. Let compliance determine if action is needed.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. When in doubt, report. Compliance will determine appropriate action.',
        incorrectFeedback: 'Review Compliance Fundamentals, Section 3: Reporting & Escalation.',
        difficultyLevel: 2
      },
      {
        id: 'q-comp-4',
        type: 'multiple_choice',
        category: 'Retaliation',
        question: 'What happens to someone who retaliates against an employee for reporting a compliance concern?',
        options: [
          { id: 'a', text: 'Verbal warning', isCorrect: false },
          { id: 'b', text: 'Written warning', isCorrect: false },
          { id: 'c', text: 'Termination', isCorrect: true },
          { id: 'd', text: 'Nothing, if the original report was unfounded', isCorrect: false }
        ],
        correctFeedback: 'Correct. Retaliation against reporters results in termination.',
        incorrectFeedback: 'Review Compliance Fundamentals, Section 3: Retaliation Prohibition.',
        difficultyLevel: 1
      },
      {
        id: 'q-comp-5',
        type: 'multiple_choice',
        category: 'Knowledge',
        question: 'If you violate a compliance requirement that you were not aware of, what is the outcome?',
        options: [
          { id: 'a', text: 'No consequence since you did not know', isCorrect: false },
          { id: 'b', text: 'Reduced consequence because of lack of intent', isCorrect: false },
          { id: 'c', text: 'You are still responsible—ignorance is not a defense', isCorrect: true },
          { id: 'd', text: 'Your manager is responsible instead of you', isCorrect: false }
        ],
        correctFeedback: 'Correct. You are responsible for knowing compliance requirements. Ignorance is not a defense.',
        incorrectFeedback: 'Review Compliance Fundamentals, Section 2: Your Compliance Obligations.',
        difficultyLevel: 1
      }
    ]
  },
  {
    id: 'assess-compliance-stress',
    title: 'Compliance Stress Test Assessment',
    description: 'Timed assessment testing ability to identify compliance issues and make correct decisions under pressure. This is a gate for product training access.',
    moduleId: 'mod-compliance-stress',
    certificationLevel: 'core_advisor',
    passingScore: 90,
    timeLimit: 35,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: false,
    showCorrectAnswers: false,
    requiresProctoring: true,
    autoFailQuestions: ['q-stress-1', 'q-stress-4'],
    questions: [
      {
        id: 'q-stress-1',
        type: 'scenario',
        category: 'Pressure Decision',
        question: 'What is the correct response?',
        scenario: 'It is the last day of the month. You need one more sale to hit your bonus tier. A client says: "I want to talk to my daughter first. Can I call you Monday?"',
        options: [
          { id: 'a', text: '"Of course. I\'ll call you Monday at a time that works for you."', isCorrect: true, explanation: 'Correct. Respect the client\'s decision-making process.' },
          { id: 'b', text: '"I understand, but if we submit today, I can guarantee this rate..."', isCorrect: false, explanation: 'This is an implied urgency tactic and is prohibited.' },
          { id: 'c', text: '"The underwriting queue is backed up—starting Monday means delays..."', isCorrect: false, explanation: 'Creating artificial urgency is a compliance violation.' },
          { id: 'd', text: '"Let me just explain one more thing that might help with the decision..."', isCorrect: false, explanation: 'Not respecting the stated need for time is pressure.' }
        ],
        correctFeedback: 'Correct. Your bonus is not the client\'s problem. Respect their timeline.',
        incorrectFeedback: 'Review GCF-205 Section 3: Pressure Decision Scenarios.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-stress-2',
        type: 'scenario',
        category: 'Audit Simulation',
        question: 'How many compliance issues are present in this file?',
        scenario: 'Auditor reviews a client file: Application signed 3/15. CRM shows call on 3/12 with notes "discussed coverage needs." No needs analysis documentation. No disclosure confirmation recorded.',
        options: [
          { id: 'a', text: 'One issue—the documentation gap', isCorrect: false },
          { id: 'b', text: 'Two issues—needs analysis and disclosure', isCorrect: true },
          { id: 'c', text: 'Three issues—needs, disclosure, and timeline', isCorrect: false },
          { id: 'd', text: 'No issues—the application is signed', isCorrect: false }
        ],
        correctFeedback: 'Correct. Two issues: needs analysis not documented and disclosure not confirmed.',
        incorrectFeedback: 'Review GCF-205 Section 2: Audit Simulation Scenarios.',
        difficultyLevel: 2
      },
      {
        id: 'q-stress-3',
        type: 'scenario',
        category: 'Comprehension',
        question: 'What is the correct response?',
        scenario: 'After a 45-minute IUL explanation, the client says: "So basically it\'s like investing in the stock market but safer?"',
        options: [
          { id: 'a', text: '"Essentially yes—you get market-type returns with downside protection."', isCorrect: false, explanation: 'This mischaracterizes the product and is prohibited.' },
          { id: 'b', text: '"That\'s one way to look at it. The important thing is the protection floor."', isCorrect: false, explanation: 'This fails to correct the misconception.' },
          { id: 'c', text: '"Not quite—let me clarify exactly how the indexing works. If it\'s still unclear, this may not be the right product."', isCorrect: true, explanation: 'Correct. Address the misconception and acknowledge complexity concerns.' },
          { id: 'd', text: 'Proceed with the sale since the client has heard the explanation', isCorrect: false, explanation: 'Comprehension is a compliance requirement.' }
        ],
        correctFeedback: 'Correct. Client comprehension is non-negotiable before proceeding.',
        incorrectFeedback: 'Review GCF-205 Section 3: Pressure Decision Scenarios.',
        difficultyLevel: 3
      },
      {
        id: 'q-stress-4',
        type: 'scenario',
        category: 'Suitability',
        question: 'Should this sale proceed as documented?',
        scenario: 'Client: 62 years old, $35,000/year income. Recommendation: $500,000 30-year term at $450/month. No documentation of why term vs. final expense. Coverage amount not tied to documented needs.',
        options: [
          { id: 'a', text: 'Yes—the client agreed to the premium', isCorrect: false, explanation: 'Client agreement alone is not suitability documentation.' },
          { id: 'b', text: 'Yes—term is appropriate for most clients', isCorrect: false, explanation: 'Product appropriateness must be client-specific.' },
          { id: 'c', text: 'No—suitability documentation is insufficient', isCorrect: true, explanation: 'Correct. Multiple suitability concerns require remediation.' },
          { id: 'd', text: 'Maybe—need more information about the client', isCorrect: false, explanation: 'With this documentation, the sale should not proceed.' }
        ],
        correctFeedback: 'Correct. This sale should not proceed without remediation of suitability documentation.',
        incorrectFeedback: 'Review GCF-205 Section 2: Suitability Challenge Scenarios.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-stress-5',
        type: 'multiple_choice',
        category: 'Documentation',
        question: 'What is the correct sequence after ending a client call?',
        options: [
          { id: 'a', text: 'Take the next call immediately, document all calls at end of day', isCorrect: false },
          { id: 'b', text: 'Document immediately while details are fresh, then take the next call', isCorrect: true },
          { id: 'c', text: 'Document within 24 hours as long as key points are captured', isCorrect: false },
          { id: 'd', text: 'Send a follow-up email to the client, then document', isCorrect: false }
        ],
        correctFeedback: 'Correct. Document immediately before taking the next call.',
        incorrectFeedback: 'Review GCF-205 Section 4: Documentation Under Time Pressure.',
        difficultyLevel: 1
      }
    ]
  },
  {
    id: 'assess-suitability-defense',
    title: 'Suitability Analysis Assessment',
    description: 'Assessment on building defensible suitability documentation. Tests ability to document why, not just what.',
    moduleId: 'mod-suitability-defense',
    certificationLevel: 'core_advisor',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-suit-3'],
    questions: [
      {
        id: 'q-suit-1',
        type: 'multiple_choice',
        category: 'Suitability Standard',
        question: 'Which of the following is sufficient suitability documentation?',
        options: [
          { id: 'a', text: '"Client wanted this specific product."', isCorrect: false, explanation: 'Client desire alone is not suitability documentation.' },
          { id: 'b', text: '"Client can afford the premium."', isCorrect: false, explanation: 'Affordability is one factor but not complete suitability.' },
          { id: 'c', text: '"Coverage of $600K calculated from documented mortgage, income replacement, and education needs."', isCorrect: true, explanation: 'Correct. Connects recommendation to documented client needs.' },
          { id: 'd', text: '"This is our best product for clients in this age range."', isCorrect: false, explanation: 'Generic product recommendations are not client-specific suitability.' }
        ],
        correctFeedback: 'Correct. Suitability documentation must connect product to documented client needs.',
        incorrectFeedback: 'Review GCF-206 Section 1: The Suitability Standard.',
        difficultyLevel: 1
      },
      {
        id: 'q-suit-2',
        type: 'multiple_choice',
        category: 'Defensibility',
        question: 'The "defensibility test" asks whether your documentation could:',
        options: [
          { id: 'a', text: 'Satisfy your manager during a routine check-in', isCorrect: false },
          { id: 'b', text: 'Explain the recommendation to a regulator two years later using only the documentation', isCorrect: true },
          { id: 'c', text: 'Show you tried to help the client', isCorrect: false },
          { id: 'd', text: 'Prove the client signed the application', isCorrect: false }
        ],
        correctFeedback: 'Correct. Documentation must withstand regulatory scrutiny years later.',
        incorrectFeedback: 'Review GCF-206 Section 2: Building Defensible Recommendations.',
        difficultyLevel: 2
      },
      {
        id: 'q-suit-3',
        type: 'scenario',
        category: 'Suitability Failure',
        question: 'What is the primary suitability issue?',
        scenario: 'A 25-year-old single client with no dependents purchases a $500,000 whole life policy. Documentation shows only "client wanted whole life."',
        options: [
          { id: 'a', text: 'The premium amount', isCorrect: false },
          { id: 'b', text: 'The death benefit amount', isCorrect: false },
          { id: 'c', text: 'No death benefit need documented for a client without dependents', isCorrect: true },
          { id: 'd', text: 'Whole life is never appropriate for young clients', isCorrect: false }
        ],
        correctFeedback: 'Correct. Need must be documented before product recommendation.',
        incorrectFeedback: 'Review GCF-206 Section 3: Common Suitability Failures.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-suit-4',
        type: 'select_all',
        category: 'Five-Element Defense',
        question: 'Select ALL elements required for a defensible recommendation:',
        options: [
          { id: 'a', text: 'Documented need', isCorrect: true },
          { id: 'b', text: 'Product selection rationale', isCorrect: true },
          { id: 'c', text: 'Coverage amount calculation', isCorrect: true },
          { id: 'd', text: 'Client signed application', isCorrect: false },
          { id: 'e', text: 'Affordability verification', isCorrect: true },
          { id: 'f', text: 'Comprehension confirmation', isCorrect: true }
        ],
        correctFeedback: 'Correct. All five elements must be documented.',
        incorrectFeedback: 'Review GCF-206 Section 2: The Five-Element Defense.',
        difficultyLevel: 2
      },
      {
        id: 'q-suit-5',
        type: 'multiple_choice',
        category: 'Documentation Framework',
        question: 'When must suitability documentation be completed?',
        options: [
          { id: 'a', text: 'Within one week of the sale', isCorrect: false },
          { id: 'b', text: 'Before finalizing the recommendation, within 24 hours of interaction', isCorrect: true },
          { id: 'c', text: 'Before the policy is delivered', isCorrect: false },
          { id: 'd', text: 'Within 30 days as required by regulation', isCorrect: false }
        ],
        correctFeedback: 'Correct. Documentation must be completed within 24 hours and before finalizing recommendations.',
        incorrectFeedback: 'Review GCF-206 Section 4: Suitability Documentation Framework.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // CALL FRAMEWORK ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-call-framework',
    title: 'Education Call Framework Assessment',
    description: 'Assessment covering the 5-phase education call framework, proper consent procedures, and needs-based conversation structure.',
    moduleId: 'mod-call-framework',
    certificationLevel: 'core_advisor',
    passingScore: 85,
    timeLimit: 35,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-call-2', 'q-call-7'],
    questions: [
      {
        id: 'q-call-1',
        type: 'multiple_choice',
        category: 'Opening Phase',
        question: 'Which elements are REQUIRED in every call opening?',
        options: [
          { id: 'a', text: 'Name, company, and "what\'s a good time to call back?"', isCorrect: false },
          { id: 'b', text: 'Name, company, licensed status, purpose, and recording disclosure', isCorrect: true },
          { id: 'c', text: 'Name, company, and immediate pitch of product benefits', isCorrect: false },
          { id: 'd', text: 'Company name and request for the decision maker', isCorrect: false }
        ],
        correctFeedback: 'Correct. All five elements are required for a proper opening.',
        incorrectFeedback: 'Review Call Framework, Phase 1: Opening & Consent.',
        difficultyLevel: 1
      },
      {
        id: 'q-call-2',
        type: 'scenario',
        category: 'Consent',
        question: 'What is the compliance issue in this opening?',
        scenario: 'Advisor: "Hi, this is Jennifer with Gold Coast Financial. I\'m calling about the life insurance quote you requested. Let me start by asking about your family situation..."',
        options: [
          { id: 'a', text: 'Did not ask if it\'s a good time', isCorrect: false },
          { id: 'b', text: 'Did not disclose licensed status or recording, and did not obtain explicit consent to proceed', isCorrect: true, explanation: 'Consent must be obtained before proceeding to discovery.' },
          { id: 'c', text: 'Should have started with product information', isCorrect: false },
          { id: 'd', text: 'No compliance issue—the greeting is fine', isCorrect: false }
        ],
        correctFeedback: 'Correct. Consent must be obtained before proceeding to questions.',
        incorrectFeedback: 'Review Call Framework, Phase 1: The Consent Element.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-call-3',
        type: 'select_all',
        category: 'Discovery',
        question: 'Select ALL questions that should be asked during the Discovery phase:',
        options: [
          { id: 'a', text: '"What\'s your current family situation?"', isCorrect: true },
          { id: 'b', text: '"What would you like to happen if you pass away?"', isCorrect: true },
          { id: 'c', text: '"Our most popular product is the 20-year term—interested?"', isCorrect: false },
          { id: 'd', text: '"What existing coverage do you have?"', isCorrect: true },
          { id: 'e', text: '"What prompted you to look into coverage now?"', isCorrect: true }
        ],
        correctFeedback: 'Correct. Discovery focuses on situation, needs, and existing coverage—not products.',
        incorrectFeedback: 'Review Call Framework, Phase 2: Discovery & Needs Analysis.',
        difficultyLevel: 2
      },
      {
        id: 'q-call-4',
        type: 'multiple_choice',
        category: 'Education Phase',
        question: 'Before presenting a specific product recommendation, what MUST happen first?',
        options: [
          { id: 'a', text: 'Determine the client\'s budget', isCorrect: false },
          { id: 'b', text: 'Document the client\'s needs and explain how they were used to arrive at the recommendation', isCorrect: true },
          { id: 'c', text: 'Get the client to agree they need coverage', isCorrect: false },
          { id: 'd', text: 'Overcome any objections the client has expressed', isCorrect: false }
        ],
        correctFeedback: 'Correct. Needs must be documented first, and recommendations must connect to those needs.',
        incorrectFeedback: 'Review Call Framework, Phase 3: Education & Explanation.',
        difficultyLevel: 2
      },
      {
        id: 'q-call-5',
        type: 'true_false',
        category: 'Alternatives',
        question: 'If the advisor recommends term life insurance, they are NOT required to mention that permanent insurance exists.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Alternatives must always be presented so the client can make an informed decision.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Alternatives must be mentioned so the client understands their options.',
        incorrectFeedback: 'Review Call Framework, Phase 3: Presenting Alternatives.',
        difficultyLevel: 2
      },
      {
        id: 'q-call-6',
        type: 'multiple_choice',
        category: 'Confirmation',
        question: 'What is the purpose of asking the client to "explain back" their understanding?',
        options: [
          { id: 'a', text: 'To test their intelligence', isCorrect: false },
          { id: 'b', text: 'To confirm comprehension before proceeding—a compliance requirement', isCorrect: true },
          { id: 'c', text: 'To create an awkward pause that pressures them to buy', isCorrect: false },
          { id: 'd', text: 'To catch them in a mistake so you can re-educate', isCorrect: false }
        ],
        correctFeedback: 'Correct. Comprehension confirmation is a compliance requirement before proceeding.',
        incorrectFeedback: 'Review Call Framework, Phase 4: Confirmation & Close.',
        difficultyLevel: 1
      },
      {
        id: 'q-call-7',
        type: 'scenario',
        category: 'Pressure Tactics',
        question: 'What is wrong with this close?',
        scenario: 'Client: "I need to talk to my spouse first." Advisor: "I understand, but I should mention that rates are going up next week. If we complete the application now, I can lock in today\'s rate for you."',
        options: [
          { id: 'a', text: 'Nothing—this is helpful information for the client', isCorrect: false },
          { id: 'b', text: 'The advisor should have offered to call the spouse directly', isCorrect: false },
          { id: 'c', text: 'This is an artificial urgency tactic that violates compliance standards', isCorrect: true, explanation: 'Creating urgency to override the client\'s decision process is prohibited.' },
          { id: 'd', text: 'The advisor should have pushed harder to close', isCorrect: false }
        ],
        correctFeedback: 'Correct. Artificial urgency tactics are prohibited.',
        incorrectFeedback: 'Review Call Framework, Phase 4: Respecting the Decision.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-call-8',
        type: 'multiple_choice',
        category: 'Documentation',
        question: 'Call documentation must include all of the following EXCEPT:',
        options: [
          { id: 'a', text: 'Discovery findings and identified needs', isCorrect: false },
          { id: 'b', text: 'Product recommended and rationale', isCorrect: false },
          { id: 'c', text: 'The advisor\'s personal opinion of the client\'s decision', isCorrect: true },
          { id: 'd', text: 'Client decision and next steps', isCorrect: false }
        ],
        correctFeedback: 'Correct. Personal opinions are not part of required documentation.',
        incorrectFeedback: 'Review Call Framework, Phase 5: Documentation.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // DISCLOSURE REQUIREMENTS ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-disclosure',
    title: 'Disclosure Requirements Assessment',
    description: 'Assessment covering required disclosures, timing, documentation, and state-specific requirements.',
    moduleId: 'mod-disclosure',
    certificationLevel: 'core_advisor',
    passingScore: 90,
    timeLimit: 25,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-disc-3', 'q-disc-6'],
    questions: [
      {
        id: 'q-disc-1',
        type: 'select_all',
        category: 'Required Disclosures',
        question: 'Select ALL disclosures that are required BEFORE product recommendation:',
        options: [
          { id: 'a', text: 'Company representation and advisor status', isCorrect: true },
          { id: 'b', text: 'That the advisor earns commission if a sale occurs', isCorrect: true },
          { id: 'c', text: 'The exact commission amount the advisor will earn', isCorrect: false },
          { id: 'd', text: 'Recording notification (if call is recorded)', isCorrect: true },
          { id: 'e', text: 'That coverage is subject to underwriting approval', isCorrect: true }
        ],
        correctFeedback: 'Correct. These are all required pre-recommendation disclosures.',
        incorrectFeedback: 'Review Disclosure Requirements, Section 1: Required Disclosures.',
        difficultyLevel: 2
      },
      {
        id: 'q-disc-2',
        type: 'multiple_choice',
        category: 'Timing',
        question: 'When must compensation disclosure be provided?',
        options: [
          { id: 'a', text: 'Only if the client asks about it', isCorrect: false },
          { id: 'b', text: 'At the end of the call, before signing', isCorrect: false },
          { id: 'c', text: 'Before making any product recommendation', isCorrect: true },
          { id: 'd', text: 'It\'s optional but recommended', isCorrect: false }
        ],
        correctFeedback: 'Correct. Compensation disclosure must come before recommendation.',
        incorrectFeedback: 'Review Disclosure Requirements, Section 2: Disclosure Timing.',
        difficultyLevel: 1
      },
      {
        id: 'q-disc-3',
        type: 'scenario',
        category: 'Disclosure Failure',
        question: 'What is the primary disclosure violation?',
        scenario: 'After explaining a term insurance product, the client agrees to proceed. Advisor begins the application without ever mentioning that they earn commission from the sale.',
        options: [
          { id: 'a', text: 'No violation—commission disclosure is optional', isCorrect: false },
          { id: 'b', text: 'Failure to disclose compensation before recommendation', isCorrect: true, explanation: 'Compensation disclosure is required before product recommendation.' },
          { id: 'c', text: 'The application should have been discussed first', isCorrect: false },
          { id: 'd', text: 'The disclosure should come after the application', isCorrect: false }
        ],
        correctFeedback: 'Correct. Compensation must be disclosed before product recommendation.',
        incorrectFeedback: 'Review Disclosure Requirements, Section 2: Disclosure Timing.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-disc-4',
        type: 'multiple_choice',
        category: 'Free Look',
        question: 'What is the "free look" period?',
        options: [
          { id: 'a', text: 'Time to review the policy before first premium is due', isCorrect: false },
          { id: 'b', text: 'Period after policy delivery when client can cancel for full refund', isCorrect: true },
          { id: 'c', text: 'Time for the advisor to review the application', isCorrect: false },
          { id: 'd', text: 'Optional feature that must be purchased', isCorrect: false }
        ],
        correctFeedback: 'Correct. Free look allows cancellation with full refund after policy delivery.',
        incorrectFeedback: 'Review Disclosure Requirements, Section 3: Rights Disclosures.',
        difficultyLevel: 1
      },
      {
        id: 'q-disc-5',
        type: 'true_false',
        category: 'Documentation',
        question: 'Disclosures only need to be documented if the client specifically acknowledges them.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Disclosures must be documented as provided, regardless of acknowledgment.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. All disclosures must be documented as having been provided.',
        incorrectFeedback: 'Review Disclosure Requirements, Section 4: Documentation Requirements.',
        difficultyLevel: 2
      },
      {
        id: 'q-disc-6',
        type: 'multiple_choice',
        category: 'Product Limitations',
        question: 'Which statement about product limitation disclosures is correct?',
        options: [
          { id: 'a', text: 'Only mention limitations if the client asks', isCorrect: false },
          { id: 'b', text: 'Limitations must be proactively disclosed before proceeding', isCorrect: true, explanation: 'Proactive disclosure of limitations is required.' },
          { id: 'c', text: 'Mentioning limitations might kill the sale, so minimize them', isCorrect: false },
          { id: 'd', text: 'Limitations are covered in the policy documents, so verbal disclosure is optional', isCorrect: false }
        ],
        correctFeedback: 'Correct. Product limitations must be proactively disclosed.',
        incorrectFeedback: 'Review Disclosure Requirements, Section 1: Product Disclosures.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // TERM LIFE PRODUCT ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-product-term',
    title: 'Term Life Insurance Assessment',
    description: 'Assessment covering term life product knowledge, suitability, client communication, and compliant selling practices.',
    moduleId: 'mod-product-term',
    certificationLevel: 'core_advisor',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-term-5'],
    questions: [
      {
        id: 'q-term-1',
        type: 'multiple_choice',
        category: 'Product Basics',
        question: 'What happens when a level term life insurance policy reaches the end of its term?',
        options: [
          { id: 'a', text: 'The policy automatically converts to whole life', isCorrect: false },
          { id: 'b', text: 'Coverage ends unless renewed at a significantly higher premium', isCorrect: true },
          { id: 'c', text: 'The client receives their premiums back', isCorrect: false },
          { id: 'd', text: 'Coverage continues at the same premium indefinitely', isCorrect: false }
        ],
        correctFeedback: 'Correct. Term coverage expires at term end; renewal is possible but expensive.',
        incorrectFeedback: 'Review Term Life Product Training, Section 1: Product Mechanics.',
        difficultyLevel: 1
      },
      {
        id: 'q-term-2',
        type: 'select_all',
        category: 'Ideal Clients',
        question: 'Select ALL client profiles for whom term life is typically suitable:',
        options: [
          { id: 'a', text: 'Young family with mortgage and dependent children', isCorrect: true },
          { id: 'b', text: 'Business owner needing key person coverage for 15 years', isCorrect: true },
          { id: 'c', text: 'Wealthy individual seeking estate planning tool', isCorrect: false },
          { id: 'd', text: 'Single person with no dependents but wants to build cash value', isCorrect: false },
          { id: 'e', text: 'Couple wanting coverage until retirement when assets will be sufficient', isCorrect: true }
        ],
        correctFeedback: 'Correct. Term is suitable for temporary needs with defined time horizons.',
        incorrectFeedback: 'Review Term Life Product Training, Section 2: Client Profiles.',
        difficultyLevel: 2
      },
      {
        id: 'q-term-3',
        type: 'multiple_choice',
        category: 'Limitations',
        question: 'Which is NOT a limitation of term life insurance that must be disclosed?',
        options: [
          { id: 'a', text: 'Coverage expires at term end', isCorrect: false },
          { id: 'b', text: 'No cash value accumulation', isCorrect: false },
          { id: 'c', text: 'Premiums are higher than whole life', isCorrect: true, explanation: 'Term premiums are typically lower than whole life, not higher.' },
          { id: 'd', text: 'Most policyholders outlive their term', isCorrect: false }
        ],
        correctFeedback: 'Correct. Term premiums are typically lower, not higher, than permanent insurance.',
        incorrectFeedback: 'Review Term Life Product Training, Section 3: Limitations & Disclosures.',
        difficultyLevel: 2
      },
      {
        id: 'q-term-4',
        type: 'multiple_choice',
        category: 'Coverage Calculation',
        question: 'What is the recommended approach for calculating term coverage amount?',
        options: [
          { id: 'a', text: 'Multiply income by 10—this is the industry standard', isCorrect: false },
          { id: 'b', text: 'Start with documented needs: debts, income replacement, future expenses', isCorrect: true },
          { id: 'c', text: 'Match whatever the client\'s employer policy provides', isCorrect: false },
          { id: 'd', text: 'Ask the client what they can afford and work backward', isCorrect: false }
        ],
        correctFeedback: 'Correct. Coverage should be calculated from documented specific needs.',
        incorrectFeedback: 'Review Term Life Product Training, Section 4: Coverage Needs Analysis.',
        difficultyLevel: 2
      },
      {
        id: 'q-term-5',
        type: 'scenario',
        category: 'Suitability',
        question: 'Is this recommendation appropriate?',
        scenario: 'Client is 62 years old with adult children, no mortgage, $1.2M in retirement assets. Advisor recommends a new 30-year term policy for "peace of mind."',
        options: [
          { id: 'a', text: 'Yes—everyone needs life insurance for peace of mind', isCorrect: false },
          { id: 'b', text: 'Yes—the client can afford the premium', isCorrect: false },
          { id: 'c', text: 'No—no documented protection need; term may expire at age 92', isCorrect: true, explanation: 'Without documented need and appropriate product match, this is a suitability concern.' },
          { id: 'd', text: 'Need more information before deciding', isCorrect: false }
        ],
        correctFeedback: 'Correct. This recommendation lacks documented need and appropriate product fit.',
        incorrectFeedback: 'Review Term Life Product Training, Section 2: Client Profiles.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-term-6',
        type: 'true_false',
        category: 'Conversion',
        question: 'All term life policies include a conversion option that allows converting to permanent insurance without new underwriting.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Conversion is a common feature but not universal; terms and deadlines vary by policy.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Conversion terms vary by policy and must be verified.',
        incorrectFeedback: 'Review Term Life Product Training, Section 1: Conversion Options.',
        difficultyLevel: 2
      },
      {
        id: 'q-term-7',
        type: 'multiple_choice',
        category: 'Living Benefits',
        question: 'What are "living benefits" in term life insurance?',
        options: [
          { id: 'a', text: 'Benefits that accumulate cash value while the insured is alive', isCorrect: false },
          { id: 'b', text: 'Ability to access a portion of death benefit upon terminal/chronic illness diagnosis', isCorrect: true },
          { id: 'c', text: 'The option to live off the policy like an annuity', isCorrect: false },
          { id: 'd', text: 'Premium waiver if the insured becomes disabled', isCorrect: false }
        ],
        correctFeedback: 'Correct. Living benefits allow early death benefit access for qualifying conditions.',
        incorrectFeedback: 'Review Term Life Product Training, Section 1: Living Benefits.',
        difficultyLevel: 1
      },
      {
        id: 'q-term-8',
        type: 'multiple_choice',
        category: 'Client Education',
        question: 'When explaining term life to a client, which statement is compliant?',
        options: [
          { id: 'a', text: '"You\'re basically renting protection—use it or lose it."', isCorrect: false },
          { id: 'b', text: '"Term is for people who can\'t afford real insurance."', isCorrect: false },
          { id: 'c', text: '"Term provides maximum coverage during your highest-need years at the lowest cost."', isCorrect: true },
          { id: 'd', text: '"Everyone should buy term—it\'s the smart choice."', isCorrect: false }
        ],
        correctFeedback: 'Correct. This accurately describes term\'s value proposition without disparaging alternatives.',
        incorrectFeedback: 'Review Term Life Product Training, Section 5: Client Communication.',
        difficultyLevel: 2
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // IUL PRODUCT ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-product-iul',
    title: 'Indexed Universal Life Assessment',
    description: 'Assessment covering IUL mechanics, appropriate use cases, required disclosures, and compliant communication.',
    moduleId: 'mod-product-iul',
    certificationLevel: 'core_advisor',
    passingScore: 85,
    timeLimit: 40,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-iul-3', 'q-iul-6'],
    questions: [
      {
        id: 'q-iul-1',
        type: 'multiple_choice',
        category: 'Product Mechanics',
        question: 'How does an IUL policy participate in index performance?',
        options: [
          { id: 'a', text: 'Cash value is directly invested in the index like an ETF', isCorrect: false },
          { id: 'b', text: 'The insurer uses index performance to calculate interest credits, but money is not in the market', isCorrect: true },
          { id: 'c', text: 'The policyholder chooses individual stocks to invest in', isCorrect: false },
          { id: 'd', text: 'Returns are fixed regardless of index performance', isCorrect: false }
        ],
        correctFeedback: 'Correct. IUL uses index performance for interest calculations, but funds are not market-invested.',
        incorrectFeedback: 'Review IUL Product Training, Section 1: How IUL Works.',
        difficultyLevel: 1
      },
      {
        id: 'q-iul-2',
        type: 'select_all',
        category: 'Limitations',
        question: 'Select ALL limitations that MUST be disclosed when presenting IUL:',
        options: [
          { id: 'a', text: 'Caps, participation rates, and spreads limit upside potential', isCorrect: true },
          { id: 'b', text: 'Internal costs reduce cash value accumulation', isCorrect: true },
          { id: 'c', text: 'Illustrated values are not guaranteed', isCorrect: true },
          { id: 'd', text: 'IUL is always better than term insurance', isCorrect: false },
          { id: 'e', text: 'Policy may require increased premiums if performance underperforms', isCorrect: true }
        ],
        correctFeedback: 'Correct. All of these limitations must be clearly disclosed.',
        incorrectFeedback: 'Review IUL Product Training, Section 3: Required Disclosures.',
        difficultyLevel: 2
      },
      {
        id: 'q-iul-3',
        type: 'scenario',
        category: 'Misrepresentation',
        question: 'What is wrong with this IUL explanation?',
        scenario: 'Advisor: "With IUL, you get stock market returns with no downside risk. It\'s basically a better 401(k) because there are no contribution limits and the money grows tax-free."',
        options: [
          { id: 'a', text: 'Nothing—this is accurate', isCorrect: false },
          { id: 'b', text: 'Multiple misrepresentations: not actual market returns, comparison to 401(k) is misleading', isCorrect: true, explanation: 'This contains several prohibited misrepresentations about IUL.' },
          { id: 'c', text: 'Should have mentioned the death benefit first', isCorrect: false },
          { id: 'd', text: 'Too much information for the client to process', isCorrect: false }
        ],
        correctFeedback: 'Correct. This contains prohibited misrepresentations about IUL.',
        incorrectFeedback: 'Review IUL Product Training, Section 4: Compliant Language.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-iul-4',
        type: 'multiple_choice',
        category: 'Illustration Requirements',
        question: 'When showing an IUL illustration to a client, you MUST:',
        options: [
          { id: 'a', text: 'Focus only on the projected column since that\'s most likely', isCorrect: false },
          { id: 'b', text: 'Show and explain both guaranteed and non-guaranteed columns', isCorrect: true },
          { id: 'c', text: 'Only show the guaranteed column to be conservative', isCorrect: false },
          { id: 'd', text: 'Tell them to ignore the numbers and focus on the concept', isCorrect: false }
        ],
        correctFeedback: 'Correct. Both guaranteed and non-guaranteed values must be shown and explained.',
        incorrectFeedback: 'Review IUL Product Training, Section 3: Illustration Requirements.',
        difficultyLevel: 2
      },
      {
        id: 'q-iul-5',
        type: 'multiple_choice',
        category: 'Suitability',
        question: 'IUL is most suitable for clients who:',
        options: [
          { id: 'a', text: 'Want maximum short-term returns on their money', isCorrect: false },
          { id: 'b', text: 'Have maxed retirement accounts, have long time horizon, and want permanent death benefit with cash value potential', isCorrect: true },
          { id: 'c', text: 'Are looking for the cheapest life insurance option', isCorrect: false },
          { id: 'd', text: 'Need coverage for just 10-20 years', isCorrect: false }
        ],
        correctFeedback: 'Correct. IUL requires specific suitability criteria to be appropriate.',
        incorrectFeedback: 'Review IUL Product Training, Section 2: Appropriate Use Cases.',
        difficultyLevel: 2
      },
      {
        id: 'q-iul-6',
        type: 'scenario',
        category: 'Suitability Failure',
        question: 'Is this IUL sale suitable?',
        scenario: 'Client: 28 years old, $55,000 income, $15,000 in savings, no retirement accounts, renting apartment. Advisor recommends $300,000 IUL with $350/month premium for "tax-free retirement income."',
        options: [
          { id: 'a', text: 'Yes—starting young maximizes cash value growth', isCorrect: false },
          { id: 'b', text: 'Yes—the client agreed to the premium', isCorrect: false },
          { id: 'c', text: 'No—client should prioritize retirement accounts first; premium may be unaffordable', isCorrect: true, explanation: 'Multiple suitability concerns: no retirement accounts, high premium relative to income, IUL not appropriate as first investment vehicle.' },
          { id: 'd', text: 'Need more information about health status', isCorrect: false }
        ],
        correctFeedback: 'Correct. Multiple suitability concerns make this recommendation inappropriate.',
        incorrectFeedback: 'Review IUL Product Training, Section 2: Appropriate Use Cases.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-iul-7',
        type: 'multiple_choice',
        category: 'Policy Loans',
        question: 'When explaining IUL policy loans to clients, you must disclose that:',
        options: [
          { id: 'a', text: 'Loans are tax-free and have no consequences', isCorrect: false },
          { id: 'b', text: 'Loans reduce death benefit and can cause policy lapse with tax consequences', isCorrect: true },
          { id: 'c', text: 'Loans should be taken as early and often as possible', isCorrect: false },
          { id: 'd', text: 'Loan interest is always lower than bank rates', isCorrect: false }
        ],
        correctFeedback: 'Correct. Loan risks and consequences must be fully disclosed.',
        incorrectFeedback: 'Review IUL Product Training, Section 5: Policy Loans & Withdrawals.',
        difficultyLevel: 2
      },
      {
        id: 'q-iul-8',
        type: 'true_false',
        category: 'Caps & Rates',
        question: 'IUL cap rates and participation rates are guaranteed to remain constant for the life of the policy.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Caps and rates can change and are not guaranteed; only the floor is guaranteed.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Only the floor is guaranteed; caps and rates can change.',
        incorrectFeedback: 'Review IUL Product Training, Section 1: Index Crediting Methods.',
        difficultyLevel: 2
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // FINAL EXPENSE PRODUCT ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-product-fe',
    title: 'Final Expense Insurance Assessment',
    description: 'Assessment covering final expense product knowledge, senior client protections, and compliant sales practices.',
    moduleId: 'mod-product-fe',
    certificationLevel: 'core_advisor',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-fe-4', 'q-fe-7'],
    questions: [
      {
        id: 'q-fe-1',
        type: 'multiple_choice',
        category: 'Product Purpose',
        question: 'Final expense insurance is primarily designed to cover:',
        options: [
          { id: 'a', text: 'Long-term income replacement for beneficiaries', isCorrect: false },
          { id: 'b', text: 'Funeral costs, burial expenses, and minor outstanding debts', isCorrect: true },
          { id: 'c', text: 'Estate taxes for wealthy individuals', isCorrect: false },
          { id: 'd', text: 'Investment and cash accumulation', isCorrect: false }
        ],
        correctFeedback: 'Correct. Final expense is designed for end-of-life costs.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 1: Product Purpose.',
        difficultyLevel: 1
      },
      {
        id: 'q-fe-2',
        type: 'select_all',
        category: 'Underwriting Types',
        question: 'Select ALL underwriting types commonly available for final expense:',
        options: [
          { id: 'a', text: 'Simplified issue (health questions, no exam)', isCorrect: true },
          { id: 'b', text: 'Guaranteed issue (no health questions)', isCorrect: true },
          { id: 'c', text: 'Full medical underwriting with blood work', isCorrect: false },
          { id: 'd', text: 'Graded benefit (reduced benefit in early years)', isCorrect: true }
        ],
        correctFeedback: 'Correct. Final expense typically offers simplified, guaranteed, and graded options.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 2: Underwriting Approaches.',
        difficultyLevel: 2
      },
      {
        id: 'q-fe-3',
        type: 'multiple_choice',
        category: 'Graded Benefits',
        question: 'A "graded benefit" policy typically means:',
        options: [
          { id: 'a', text: 'The death benefit increases each year', isCorrect: false },
          { id: 'b', text: 'Full death benefit is paid only after a waiting period (usually 2-3 years)', isCorrect: true },
          { id: 'c', text: 'The premium decreases as the insured ages', isCorrect: false },
          { id: 'd', text: 'Coverage is graded by health class', isCorrect: false }
        ],
        correctFeedback: 'Correct. Graded benefit policies have waiting periods before full benefit payout.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 2: Graded Benefit Policies.',
        difficultyLevel: 2
      },
      {
        id: 'q-fe-4',
        type: 'scenario',
        category: 'Senior Protection',
        question: 'What is the primary compliance concern in this scenario?',
        scenario: 'Advisor calls a 78-year-old widow. She seems confused about the purpose of the call. Advisor proceeds to recommend a $15,000 final expense policy and asks for her bank account information to "lock in the rate today."',
        options: [
          { id: 'a', text: 'The coverage amount may be too low', isCorrect: false },
          { id: 'b', text: 'Proceeding without clarity of understanding and using urgency tactics with a senior', isCorrect: true, explanation: 'Multiple senior protection violations: confusion not addressed, urgency pressure, immediate payment request.' },
          { id: 'c', text: 'Should have started with a lower premium', isCorrect: false },
          { id: 'd', text: 'No concern—the advisor is helping her plan', isCorrect: false }
        ],
        correctFeedback: 'Correct. Multiple senior protection violations occurred in this scenario.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 4: Senior Client Protections.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-fe-5',
        type: 'multiple_choice',
        category: 'Suitability',
        question: 'Final expense insurance is typically suitable for clients who:',
        options: [
          { id: 'a', text: 'Are young with growing families and mortgages', isCorrect: false },
          { id: 'b', text: 'Are seniors who want to cover funeral costs without burdening family', isCorrect: true },
          { id: 'c', text: 'Have large estates requiring tax planning', isCorrect: false },
          { id: 'd', text: 'Want maximum coverage at lowest cost', isCorrect: false }
        ],
        correctFeedback: 'Correct. Final expense is designed for seniors with specific end-of-life coverage needs.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 3: Suitability Considerations.',
        difficultyLevel: 1
      },
      {
        id: 'q-fe-6',
        type: 'true_false',
        category: 'Family Involvement',
        question: 'When speaking with senior clients about final expense, you should discourage family involvement to avoid external influence on the decision.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Family involvement should be encouraged, not discouraged, with senior clients.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Family involvement should be proactively encouraged with senior clients.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 4: Senior Client Protections.',
        difficultyLevel: 1
      },
      {
        id: 'q-fe-7',
        type: 'scenario',
        category: 'Replacement',
        question: 'What is the primary concern in this situation?',
        scenario: 'Client has a 5-year-old $10,000 final expense policy. Advisor recommends canceling it to purchase a new $12,000 policy with a different carrier "for better coverage."',
        options: [
          { id: 'a', text: 'The coverage increase is too small', isCorrect: false },
          { id: 'b', text: 'Potential replacement violation—existing policy may have no waiting period while new policy will have one', isCorrect: true, explanation: 'Replacing existing coverage can restart waiting periods and is a regulated activity.' },
          { id: 'c', text: 'The client should have been offered $15,000', isCorrect: false },
          { id: 'd', text: 'No concern—more coverage is always better', isCorrect: false }
        ],
        correctFeedback: 'Correct. Replacement can harm clients by restarting waiting periods.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 5: Replacement Considerations.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-fe-8',
        type: 'multiple_choice',
        category: 'Communication',
        question: 'Which is an appropriate way to discuss final expense with a senior client?',
        options: [
          { id: 'a', text: '"You need to act now—funeral costs are rising every day."', isCorrect: false },
          { id: 'b', text: '"At your age, this is the only insurance you can qualify for."', isCorrect: false },
          { id: 'c', text: '"This coverage ensures your family won\'t face unexpected expenses. Would you like time to review this with them?"', isCorrect: true },
          { id: 'd', text: '"Your children will thank you for not being a burden."', isCorrect: false }
        ],
        correctFeedback: 'Correct. This is respectful, accurate, and encourages family involvement.',
        incorrectFeedback: 'Review Final Expense Product Training, Section 6: Compliant Communication.',
        difficultyLevel: 2
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // ANNUITY PRODUCT ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-product-annuity',
    title: 'Fixed Indexed Annuity Assessment',
    description: 'Assessment covering FIA mechanics, suitability standards, required disclosures, and compliant practices.',
    moduleId: 'mod-product-annuity',
    certificationLevel: 'core_advisor',
    passingScore: 85,
    timeLimit: 40,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-ann-4', 'q-ann-7'],
    questions: [
      {
        id: 'q-ann-1',
        type: 'multiple_choice',
        category: 'Product Mechanics',
        question: 'In a fixed indexed annuity, the "benefit base" for an income rider is:',
        options: [
          { id: 'a', text: 'The amount you can withdraw as a lump sum at any time', isCorrect: false },
          { id: 'b', text: 'A calculation value used to determine lifetime income payments—not actual cash value', isCorrect: true },
          { id: 'c', text: 'The death benefit paid to beneficiaries', isCorrect: false },
          { id: 'd', text: 'The same as the accumulation value', isCorrect: false }
        ],
        correctFeedback: 'Correct. Benefit base is a calculation number, not actual accessible cash.',
        incorrectFeedback: 'Review Annuity Product Training, Section 1: Income Rider Mechanics.',
        difficultyLevel: 2
      },
      {
        id: 'q-ann-2',
        type: 'select_all',
        category: 'Disclosures',
        question: 'Select ALL that must be disclosed when presenting a fixed indexed annuity:',
        options: [
          { id: 'a', text: 'Surrender charge schedule and period length', isCorrect: true },
          { id: 'b', text: 'The difference between benefit base and accumulation value', isCorrect: true },
          { id: 'c', text: 'That caps and participation rates can change', isCorrect: true },
          { id: 'd', text: 'That the annuity is FDIC insured', isCorrect: false },
          { id: 'e', text: 'Income rider fees and their impact on accumulation value', isCorrect: true }
        ],
        correctFeedback: 'Correct. All of these disclosures are required (annuities are not FDIC insured).',
        incorrectFeedback: 'Review Annuity Product Training, Section 3: Required Disclosures.',
        difficultyLevel: 2
      },
      {
        id: 'q-ann-3',
        type: 'multiple_choice',
        category: 'Surrender Period',
        question: 'A typical FIA surrender period is:',
        options: [
          { id: 'a', text: '1-2 years with minimal charges', isCorrect: false },
          { id: 'b', text: '7-10 years with declining charges', isCorrect: true },
          { id: 'c', text: '20-30 years with level charges', isCorrect: false },
          { id: 'd', text: 'There is no surrender period—funds are always accessible', isCorrect: false }
        ],
        correctFeedback: 'Correct. Most FIAs have 7-10 year surrender periods with declining charges.',
        incorrectFeedback: 'Review Annuity Product Training, Section 2: Surrender Charges.',
        difficultyLevel: 1
      },
      {
        id: 'q-ann-4',
        type: 'scenario',
        category: 'Suitability',
        question: 'Is this annuity sale suitable?',
        scenario: 'Client: 72 years old, needs money for potential nursing home in 2-3 years. All liquid savings: $180,000. Advisor recommends putting $150,000 into a 10-year FIA.',
        options: [
          { id: 'a', text: 'Yes—the guaranteed income will help with nursing home costs', isCorrect: false },
          { id: 'b', text: 'Yes—the client can use the 10% free withdrawal', isCorrect: false },
          { id: 'c', text: 'No—committing 83% of liquid assets to a 10-year product with imminent care needs is unsuitable', isCorrect: true, explanation: 'This violates suitability: too much of assets in illiquid product with known near-term liquidity needs.' },
          { id: 'd', text: 'Need more information about health status', isCorrect: false }
        ],
        correctFeedback: 'Correct. This recommendation is unsuitable given liquidity needs and asset concentration.',
        incorrectFeedback: 'Review Annuity Product Training, Section 4: Suitability Standards.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-ann-5',
        type: 'multiple_choice',
        category: 'Appropriate Use',
        question: 'Fixed indexed annuities are most appropriate for clients who:',
        options: [
          { id: 'a', text: 'Need maximum short-term liquidity and returns', isCorrect: false },
          { id: 'b', text: 'Want guaranteed lifetime income and have adequate liquid assets elsewhere', isCorrect: true },
          { id: 'c', text: 'Are looking for the highest possible market returns', isCorrect: false },
          { id: 'd', text: 'Want to actively trade and manage investments', isCorrect: false }
        ],
        correctFeedback: 'Correct. FIAs suit those seeking income guarantees with adequate liquidity elsewhere.',
        incorrectFeedback: 'Review Annuity Product Training, Section 4: Suitability Standards.',
        difficultyLevel: 2
      },
      {
        id: 'q-ann-6',
        type: 'true_false',
        category: 'Returns',
        question: 'Because FIAs are linked to market indices, clients can expect to receive the full market return of the index.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Returns are limited by caps, spreads, and participation rates—not full index returns.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Caps, spreads, and participation rates limit the credited return.',
        incorrectFeedback: 'Review Annuity Product Training, Section 1: Index Crediting.',
        difficultyLevel: 2
      },
      {
        id: 'q-ann-7',
        type: 'scenario',
        category: 'Misrepresentation',
        question: 'What is wrong with this annuity explanation?',
        scenario: 'Advisor: "The benefit base grows at 7% guaranteed every year. In 10 years, your $100,000 will be worth $197,000 guaranteed."',
        options: [
          { id: 'a', text: 'The math is wrong', isCorrect: false },
          { id: 'b', text: 'This conflates benefit base growth with actual cash value—the $197,000 cannot be withdrawn as a lump sum', isCorrect: true, explanation: 'Confusing benefit base with accumulation value is a common and serious misrepresentation.' },
          { id: 'c', text: 'Should have quoted a higher growth rate', isCorrect: false },
          { id: 'd', text: 'No issue—this is how annuities work', isCorrect: false }
        ],
        correctFeedback: 'Correct. The benefit base is not the same as accessible cash value.',
        incorrectFeedback: 'Review Annuity Product Training, Section 1: Benefit Base vs Accumulation Value.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-ann-8',
        type: 'multiple_choice',
        category: 'Documentation',
        question: 'Annuity suitability documentation must include all EXCEPT:',
        options: [
          { id: 'a', text: 'Client\'s liquidity needs and existing liquid assets', isCorrect: false },
          { id: 'b', text: 'Time horizon and income needs', isCorrect: false },
          { id: 'c', text: 'The advisor\'s commission from the sale', isCorrect: true },
          { id: 'd', text: 'Understanding of surrender charges and limitations', isCorrect: false }
        ],
        correctFeedback: 'Correct. Commission amount is not part of required suitability documentation.',
        incorrectFeedback: 'Review Annuity Product Training, Section 5: Documentation Requirements.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // NEEDS ANALYSIS ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-sales-needs',
    title: 'Client Needs Analysis Assessment',
    description: 'Assessment covering the needs analysis process, documentation requirements, and connecting needs to recommendations.',
    moduleId: 'mod-sales-needs',
    certificationLevel: 'live_client',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-needs-4'],
    questions: [
      {
        id: 'q-needs-1',
        type: 'multiple_choice',
        category: 'Discovery Sequence',
        question: 'What is the correct sequence for needs discovery?',
        options: [
          { id: 'a', text: 'Budget → Products → Needs', isCorrect: false },
          { id: 'b', text: 'Products → Needs → Budget', isCorrect: false },
          { id: 'c', text: 'Situation → Needs → Protection Goals → Budget', isCorrect: true },
          { id: 'd', text: 'Budget → Needs → Situation', isCorrect: false }
        ],
        correctFeedback: 'Correct. Always discover situation and needs before discussing budget.',
        incorrectFeedback: 'Review Needs Analysis, Section 1: Discovery Sequence.',
        difficultyLevel: 1
      },
      {
        id: 'q-needs-2',
        type: 'select_all',
        category: 'Needs Categories',
        question: 'Select ALL categories that should be explored during needs discovery:',
        options: [
          { id: 'a', text: 'Income replacement needs', isCorrect: true },
          { id: 'b', text: 'Debt payoff requirements', isCorrect: true },
          { id: 'c', text: 'Client\'s opinion of different carriers', isCorrect: false },
          { id: 'd', text: 'Future expense obligations (education, care)', isCorrect: true },
          { id: 'e', text: 'Existing coverage and gaps', isCorrect: true }
        ],
        correctFeedback: 'Correct. These are core needs categories to explore.',
        incorrectFeedback: 'Review Needs Analysis, Section 2: Needs Categories.',
        difficultyLevel: 2
      },
      {
        id: 'q-needs-3',
        type: 'multiple_choice',
        category: 'Documentation',
        question: 'When must needs analysis documentation be completed?',
        options: [
          { id: 'a', text: 'Before the policy is issued', isCorrect: false },
          { id: 'b', text: 'Within 24 hours of the discovery conversation and BEFORE any recommendation', isCorrect: true },
          { id: 'c', text: 'Within one week of the sale', isCorrect: false },
          { id: 'd', text: 'Only if the client asks for it', isCorrect: false }
        ],
        correctFeedback: 'Correct. Needs must be documented before making recommendations.',
        incorrectFeedback: 'Review Needs Analysis, Section 3: Documentation Requirements.',
        difficultyLevel: 2
      },
      {
        id: 'q-needs-4',
        type: 'scenario',
        category: 'Needs-Based Selling',
        question: 'What is wrong with this approach?',
        scenario: 'Advisor opens call: "I\'m calling to tell you about our great 20-year term product. It\'s our most popular and very affordable. What questions do you have?"',
        options: [
          { id: 'a', text: 'Should have offered multiple products', isCorrect: false },
          { id: 'b', text: 'Product-first approach without needs discovery—this is prohibited', isCorrect: true, explanation: 'Products must never be presented before understanding client needs.' },
          { id: 'c', text: 'The product description was too brief', isCorrect: false },
          { id: 'd', text: 'No issue—this is efficient communication', isCorrect: false }
        ],
        correctFeedback: 'Correct. Product-first approaches are prohibited.',
        incorrectFeedback: 'Review Needs Analysis, Section 1: Education-First Principle.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-needs-5',
        type: 'multiple_choice',
        category: 'Coverage Calculation',
        question: 'Coverage amount recommendations should be based on:',
        options: [
          { id: 'a', text: 'Industry rules of thumb (10x income)', isCorrect: false },
          { id: 'b', text: 'Client\'s documented specific needs: debts, income replacement, future expenses', isCorrect: true },
          { id: 'c', text: 'What the client says they can afford', isCorrect: false },
          { id: 'd', text: 'Whatever provides adequate commission', isCorrect: false }
        ],
        correctFeedback: 'Correct. Coverage must be calculated from documented specific needs.',
        incorrectFeedback: 'Review Needs Analysis, Section 4: Coverage Calculation.',
        difficultyLevel: 2
      },
      {
        id: 'q-needs-6',
        type: 'true_false',
        category: 'Budget Discovery',
        question: 'Budget should be discussed early in the call to avoid wasting time on unaffordable options.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Budget comes AFTER needs discovery—never lead with budget.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Needs first, then appropriate coverage, then budget discussion.',
        incorrectFeedback: 'Review Needs Analysis, Section 1: Discovery Sequence.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // OBJECTION RESPONSE ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-sales-objections',
    title: 'Client Questions & Hesitations Assessment',
    description: 'Assessment covering compliant responses to client questions and hesitations using education rather than pressure.',
    moduleId: 'mod-sales-objections',
    certificationLevel: 'live_client',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-obj-3', 'q-obj-6'],
    questions: [
      {
        id: 'q-obj-1',
        type: 'multiple_choice',
        category: 'Framework',
        question: 'When a client expresses hesitation, the compliant response is to:',
        options: [
          { id: 'a', text: 'Overcome the objection with persuasion techniques', isCorrect: false },
          { id: 'b', text: 'Acknowledge, explore the underlying concern, and educate without pressure', isCorrect: true },
          { id: 'c', text: 'Restate the benefits more emphatically', isCorrect: false },
          { id: 'd', text: 'Offer a discount or special deal to close now', isCorrect: false }
        ],
        correctFeedback: 'Correct. Education-first approach: acknowledge, explore, educate.',
        incorrectFeedback: 'Review Objection Handling, Section 1: Education-First Framework.',
        difficultyLevel: 1
      },
      {
        id: 'q-obj-2',
        type: 'scenario',
        category: 'Cost Concerns',
        question: 'What is the appropriate response?',
        scenario: 'Client: "This is more expensive than I expected."',
        options: [
          { id: 'a', text: '"It\'s actually very affordable compared to what could happen without coverage."', isCorrect: false },
          { id: 'b', text: '"Help me understand—what were you expecting? Let\'s see if we can adjust the coverage to fit your budget while still meeting your core needs."', isCorrect: true },
          { id: 'c', text: '"You can\'t afford NOT to have this coverage."', isCorrect: false },
          { id: 'd', text: '"Let me show you how much you\'d save by signing up today."', isCorrect: false }
        ],
        correctFeedback: 'Correct. Explore the concern and work together to find appropriate coverage.',
        incorrectFeedback: 'Review Objection Handling, Section 2: Cost Concerns.',
        difficultyLevel: 2
      },
      {
        id: 'q-obj-3',
        type: 'scenario',
        category: 'Need to Think',
        question: 'What is wrong with this response?',
        scenario: 'Client: "I need to think about it." Advisor: "I understand, but if we wait, your premium could increase. Let\'s at least start the application to lock in today\'s rate."',
        options: [
          { id: 'a', text: 'Nothing—this is helpful information', isCorrect: false },
          { id: 'b', text: 'Should have offered a bigger discount', isCorrect: false },
          { id: 'c', text: 'Creating artificial urgency to override client\'s decision process—this is prohibited', isCorrect: true, explanation: 'Urgency tactics to pressure decisions are compliance violations.' },
          { id: 'd', text: 'Should have asked for the spouse\'s number instead', isCorrect: false }
        ],
        correctFeedback: 'Correct. Urgency tactics are prohibited.',
        incorrectFeedback: 'Review Objection Handling, Section 3: "Need to Think" Response.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-obj-4',
        type: 'multiple_choice',
        category: 'Trust Concerns',
        question: 'When a client says "I don\'t trust insurance companies," the appropriate response is:',
        options: [
          { id: 'a', text: '"That\'s an unfair stereotype—insurance companies pay claims."', isCorrect: false },
          { id: 'b', text: '"I understand that concern. Can you tell me more about what specifically worries you? I\'d like to address any questions with facts."', isCorrect: true },
          { id: 'c', text: '"Our company is different from those other companies."', isCorrect: false },
          { id: 'd', text: '"If you don\'t trust insurance, you probably shouldn\'t buy any."', isCorrect: false }
        ],
        correctFeedback: 'Correct. Explore the specific concern and address with facts.',
        incorrectFeedback: 'Review Objection Handling, Section 4: Trust & Skepticism.',
        difficultyLevel: 2
      },
      {
        id: 'q-obj-5',
        type: 'true_false',
        category: 'Spouse Involvement',
        question: 'If a client says they need to discuss with their spouse, you should offer to call the spouse directly to "help explain" the product.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Respect the client\'s process; offer to include spouse on next call if helpful, but don\'t circumvent.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Respect the client\'s decision-making process.',
        incorrectFeedback: 'Review Objection Handling, Section 5: Involving Others.',
        difficultyLevel: 2
      },
      {
        id: 'q-obj-6',
        type: 'scenario',
        category: 'Clear No',
        question: 'What is the appropriate response?',
        scenario: 'Client: "I\'ve decided this isn\'t for me. Please don\'t call me again."',
        options: [
          { id: 'a', text: '"Can I ask why? Maybe I can address your concerns."', isCorrect: false },
          { id: 'b', text: '"I\'ll call back in a few months when you\'ve had time to think."', isCorrect: false },
          { id: 'c', text: '"I understand. Thank you for your time. I\'ll remove you from our contact list. Have a good day."', isCorrect: true, explanation: 'A clear no must be respected immediately.' },
          { id: 'd', text: '"Let me transfer you to my manager who can offer you a better deal."', isCorrect: false }
        ],
        correctFeedback: 'Correct. A clear no must be respected immediately.',
        incorrectFeedback: 'Review Objection Handling, Section 6: Accepting No.',
        difficultyLevel: 1,
        autoFailOnIncorrect: true
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // ETHICAL CLOSING ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-sales-closing',
    title: 'Ethical Closing Techniques Assessment',
    description: 'Assessment covering compliant closing practices, application process, and post-sale requirements.',
    moduleId: 'mod-sales-closing',
    certificationLevel: 'live_client',
    passingScore: 85,
    timeLimit: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-close-3', 'q-close-6'],
    questions: [
      {
        id: 'q-close-1',
        type: 'multiple_choice',
        category: 'Natural Close',
        question: 'The "natural close" occurs when:',
        options: [
          { id: 'a', text: 'The advisor uses closing techniques to secure agreement', isCorrect: false },
          { id: 'b', text: 'Education is complete, understanding is verified, and the client decides to proceed', isCorrect: true },
          { id: 'c', text: 'The advisor asks multiple closing questions until one works', isCorrect: false },
          { id: 'd', text: 'Urgency creates a need for immediate decision', isCorrect: false }
        ],
        correctFeedback: 'Correct. Natural close follows complete education and verified understanding.',
        incorrectFeedback: 'Review Ethical Closing, Section 1: The Natural Close.',
        difficultyLevel: 1
      },
      {
        id: 'q-close-2',
        type: 'select_all',
        category: 'Pre-Close Checklist',
        question: 'Select ALL items that must be completed BEFORE asking if the client wants to proceed:',
        options: [
          { id: 'a', text: 'Needs documented', isCorrect: true },
          { id: 'b', text: 'Product explained and alternatives mentioned', isCorrect: true },
          { id: 'c', text: 'Commission amount disclosed', isCorrect: false },
          { id: 'd', text: 'Limitations disclosed', isCorrect: true },
          { id: 'e', text: 'Client comprehension verified', isCorrect: true }
        ],
        correctFeedback: 'Correct. All these must be completed before closing.',
        incorrectFeedback: 'Review Ethical Closing, Section 2: Pre-Close Checklist.',
        difficultyLevel: 2
      },
      {
        id: 'q-close-3',
        type: 'scenario',
        category: 'Prohibited Techniques',
        question: 'Which closing approach is prohibited?',
        scenario: 'Four advisors describe their closing technique.',
        options: [
          { id: 'a', text: '"I summarize what we discussed and ask if they\'d like to proceed."', isCorrect: false },
          { id: 'b', text: '"I verify they understand the product, then ask if they have questions before we proceed."', isCorrect: false },
          { id: 'c', text: '"I ask would you prefer the 20-year or 30-year term—either way, let\'s get started today."', isCorrect: true, explanation: 'Assumptive close is a pressure technique and is prohibited.' },
          { id: 'd', text: '"I make sure all their questions are answered, then offer to start the application if they\'re ready."', isCorrect: false }
        ],
        correctFeedback: 'Correct. Assumptive closes are prohibited pressure techniques.',
        incorrectFeedback: 'Review Ethical Closing, Section 3: Prohibited Techniques.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-close-4',
        type: 'multiple_choice',
        category: 'Application Process',
        question: 'Before starting the application, the advisor must:',
        options: [
          { id: 'a', text: 'Get verbal agreement to proceed', isCorrect: false },
          { id: 'b', text: 'Explain the application process and what to expect next', isCorrect: true },
          { id: 'c', text: 'Collect the first premium payment', isCorrect: false },
          { id: 'd', text: 'Send the policy documents for review', isCorrect: false }
        ],
        correctFeedback: 'Correct. Process explanation sets proper expectations.',
        incorrectFeedback: 'Review Ethical Closing, Section 4: Application Process.',
        difficultyLevel: 1
      },
      {
        id: 'q-close-5',
        type: 'true_false',
        category: 'Health Questions',
        question: 'If a client seems to be omitting health information on the application, the advisor should help them "phrase it better" to avoid underwriting issues.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Advisors must never coach clients on application answers—this is material misrepresentation.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. Never coach application answers—record honest responses.',
        incorrectFeedback: 'Review Ethical Closing, Section 5: Application Integrity.',
        difficultyLevel: 2
      },
      {
        id: 'q-close-6',
        type: 'scenario',
        category: 'Post-Decision',
        question: 'What is wrong with this post-decision behavior?',
        scenario: 'After the client decides to think about it and the call ends, the advisor calls back the same day "just to check if they had any more questions" and brings up new benefits.',
        options: [
          { id: 'a', text: 'Nothing—good follow-up shows dedication', isCorrect: false },
          { id: 'b', text: 'Should have called the next day instead', isCorrect: false },
          { id: 'c', text: 'Same-day callback to "check in" after deferred decision is pressure; respect the stated timeline', isCorrect: true, explanation: 'Respecting the client\'s stated decision timeline is required.' },
          { id: 'd', text: 'Should have asked the spouse instead', isCorrect: false }
        ],
        correctFeedback: 'Correct. Respect the client\'s stated timeline for decisions.',
        incorrectFeedback: 'Review Ethical Closing, Section 6: Post-Decision Protocol.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-close-7',
        type: 'multiple_choice',
        category: 'Next Steps',
        question: 'After completing an application, what must the advisor communicate to the client?',
        options: [
          { id: 'a', text: '"I\'ll be in touch when commission is paid."', isCorrect: false },
          { id: 'b', text: 'Timeline for underwriting, what to expect, how to reach advisor with questions, and free look period', isCorrect: true },
          { id: 'c', text: '"Coverage starts immediately."', isCorrect: false },
          { id: 'd', text: '"The policy will arrive in the mail eventually."', isCorrect: false }
        ],
        correctFeedback: 'Correct. Clear next steps and expectations must be communicated.',
        incorrectFeedback: 'Review Ethical Closing, Section 7: Setting Expectations.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // AML/KYC ANNUAL ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-aml-annual',
    title: 'AML/KYC Annual Certification',
    description: 'Annual certification assessment covering anti-money laundering requirements and know-your-customer procedures.',
    moduleId: 'mod-aml-annual',
    certificationLevel: 'ongoing_compliance',
    passingScore: 90,
    timeLimit: 30,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: false,
    requiresProctoring: false,
    autoFailQuestions: ['q-aml-3', 'q-aml-5'],
    questions: [
      {
        id: 'q-aml-1',
        type: 'multiple_choice',
        category: 'KYC Requirements',
        question: 'Before completing any insurance application, you must:',
        options: [
          { id: 'a', text: 'Accept verbal identity confirmation from the client', isCorrect: false },
          { id: 'b', text: 'Review government-issued photo ID and document the verification', isCorrect: true },
          { id: 'c', text: 'Trust the information provided on the application', isCorrect: false },
          { id: 'd', text: 'Verify identity only for applications over $50,000', isCorrect: false }
        ],
        correctFeedback: 'Correct. Government-issued photo ID must be reviewed and documented.',
        incorrectFeedback: 'Review AML Training, Section 2: KYC Requirements.',
        difficultyLevel: 1
      },
      {
        id: 'q-aml-2',
        type: 'select_all',
        category: 'Red Flags',
        question: 'Select ALL that are red flags for potential money laundering:',
        options: [
          { id: 'a', text: 'Large single-premium payments in cash', isCorrect: true },
          { id: 'b', text: 'Client reluctant to provide identification', isCorrect: true },
          { id: 'c', text: 'Client asks about monthly premium options', isCorrect: false },
          { id: 'd', text: 'Multiple payments just under $10,000', isCorrect: true },
          { id: 'e', text: 'Client wants to name spouse as beneficiary', isCorrect: false }
        ],
        correctFeedback: 'Correct. These are documented money laundering red flags.',
        incorrectFeedback: 'Review AML Training, Section 3: Red Flags.',
        difficultyLevel: 2
      },
      {
        id: 'q-aml-3',
        type: 'scenario',
        category: 'Tipping Off',
        question: 'What is wrong with this advisor\'s response?',
        scenario: 'After submitting a SAR, the advisor tells the client: "Just so you know, compliance is reviewing your file. It\'s probably nothing, but they had some questions about your payment."',
        options: [
          { id: 'a', text: 'Should have said "definitely nothing" to reassure client', isCorrect: false },
          { id: 'b', text: 'Telling the client about the compliance review is tipping off—a federal crime', isCorrect: true, explanation: 'Informing clients about SAR filings or investigations is illegal.' },
          { id: 'c', text: 'Should have waited until investigation was complete', isCorrect: false },
          { id: 'd', text: 'Nothing wrong—transparency is good', isCorrect: false }
        ],
        correctFeedback: 'Correct. Tipping off is a federal crime.',
        incorrectFeedback: 'Review AML Training, Section 4: Reporting Requirements.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-aml-4',
        type: 'multiple_choice',
        category: 'Reporting',
        question: 'When you observe potential suspicious activity, you should:',
        options: [
          { id: 'a', text: 'Confront the customer to clarify their intentions', isCorrect: false },
          { id: 'b', text: 'Document observations factually and report through compliance channels immediately', isCorrect: true },
          { id: 'c', text: 'Wait to see if a pattern develops before reporting', isCorrect: false },
          { id: 'd', text: 'Report directly to law enforcement', isCorrect: false }
        ],
        correctFeedback: 'Correct. Document and report through proper compliance channels.',
        incorrectFeedback: 'Review AML Training, Section 4: Reporting Requirements.',
        difficultyLevel: 2
      },
      {
        id: 'q-aml-5',
        type: 'scenario',
        category: 'Compliance',
        question: 'What should the advisor do?',
        scenario: 'A new client wants to purchase a $100,000 single-premium whole life policy. He pays with a cashier\'s check and seems nervous when asked about the source of funds, saying "it\'s from various savings."',
        options: [
          { id: 'a', text: 'Proceed—cashier\'s check is acceptable payment', isCorrect: false },
          { id: 'b', text: 'Ask more questions about the source and document; if still unclear, report to compliance before proceeding', isCorrect: true, explanation: 'Multiple red flags require documentation and compliance consultation.' },
          { id: 'c', text: 'Refuse the sale entirely', isCorrect: false },
          { id: 'd', text: 'Accept the sale but note the nervousness in CRM', isCorrect: false }
        ],
        correctFeedback: 'Correct. Document concerns and consult compliance before proceeding.',
        incorrectFeedback: 'Review AML Training, Section 3: Red Flags.',
        difficultyLevel: 3,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-aml-6',
        type: 'multiple_choice',
        category: 'CTR',
        question: 'Currency Transaction Reports are required for cash transactions over:',
        options: [
          { id: 'a', text: '$5,000', isCorrect: false },
          { id: 'b', text: '$10,000', isCorrect: true },
          { id: 'c', text: '$25,000', isCorrect: false },
          { id: 'd', text: 'Any amount in cash', isCorrect: false }
        ],
        correctFeedback: 'Correct. CTRs are required for cash transactions over $10,000.',
        incorrectFeedback: 'Review AML Training, Section 4: Reporting Requirements.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // ETHICS ANNUAL ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-ethics-annual',
    title: 'Professional Ethics Annual Certification',
    description: 'Annual certification assessment covering fiduciary duties, ethical decision-making, and professional standards.',
    moduleId: 'mod-ethics-annual',
    certificationLevel: 'ongoing_compliance',
    passingScore: 85,
    timeLimit: 25,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-eth-3'],
    questions: [
      {
        id: 'q-eth-1',
        type: 'multiple_choice',
        category: 'Fiduciary Duty',
        question: 'The duty of loyalty requires advisors to:',
        options: [
          { id: 'a', text: 'Be loyal to Gold Coast Financial above all else', isCorrect: false },
          { id: 'b', text: 'Put client interests ahead of personal interests', isCorrect: true },
          { id: 'c', text: 'Remain loyal to existing clients over new prospects', isCorrect: false },
          { id: 'd', text: 'Recommend the same carrier for all clients for consistency', isCorrect: false }
        ],
        correctFeedback: 'Correct. Client interests must come first.',
        incorrectFeedback: 'Review Ethics Training, Section 2: Fiduciary Duties.',
        difficultyLevel: 1
      },
      {
        id: 'q-eth-2',
        type: 'scenario',
        category: 'Ethical Dilemma',
        question: 'What is the correct course of action?',
        scenario: 'You realize you made an error on a submitted application that results in a lower premium for the client than they should be paying.',
        options: [
          { id: 'a', text: 'Leave it—the client benefits from lower premiums', isCorrect: false },
          { id: 'b', text: 'Disclose and correct the error', isCorrect: true },
          { id: 'c', text: 'Wait to see if underwriting catches it', isCorrect: false },
          { id: 'd', text: 'Adjust future recommendations to compensate', isCorrect: false }
        ],
        correctFeedback: 'Correct. All errors must be disclosed and corrected.',
        incorrectFeedback: 'Review Ethics Training, Section 3: Ethical Dilemmas.',
        difficultyLevel: 2
      },
      {
        id: 'q-eth-3',
        type: 'scenario',
        category: 'Privacy',
        question: 'What should you tell the caller?',
        scenario: 'An adult child calls asking about their elderly parent\'s policy. They say they are the power of attorney and need information to "help manage things."',
        options: [
          { id: 'a', text: 'Provide the information—they\'re family', isCorrect: false },
          { id: 'b', text: 'Provide basic information but not financial details', isCorrect: false },
          { id: 'c', text: 'Request written POA documentation before disclosing any policy information', isCorrect: true, explanation: 'POA claims must be verified with documentation.' },
          { id: 'd', text: 'Transfer them to the policy owner without disclosure', isCorrect: false }
        ],
        correctFeedback: 'Correct. Verify POA with documentation before any disclosure.',
        incorrectFeedback: 'Review Ethics Training, Section 3: Privacy Obligations.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-eth-4',
        type: 'select_all',
        category: 'Social Media',
        question: 'Select ALL that are prohibited on social media:',
        options: [
          { id: 'a', text: 'Making specific product recommendations', isCorrect: true },
          { id: 'b', text: 'Sharing client success stories without written consent', isCorrect: true },
          { id: 'c', text: 'Sharing educational content about insurance concepts', isCorrect: false },
          { id: 'd', text: 'Guaranteeing returns or outcomes', isCorrect: true },
          { id: 'e', text: 'Professional networking', isCorrect: false }
        ],
        correctFeedback: 'Correct. Product recommendations, unconsented stories, and guarantees are prohibited.',
        incorrectFeedback: 'Review Ethics Training, Section 4: Social Media Standards.',
        difficultyLevel: 2
      },
      {
        id: 'q-eth-5',
        type: 'multiple_choice',
        category: 'Documentation',
        question: 'A longtime client says "just sign here, we\'ve done this before" without going through the disclosure process. You should:',
        options: [
          { id: 'a', text: 'Accommodate the request for a trusted client', isCorrect: false },
          { id: 'b', text: 'Complete full disclosure—familiarity does not exempt compliance', isCorrect: true },
          { id: 'c', text: 'Do abbreviated disclosure to save time', isCorrect: false },
          { id: 'd', text: 'Have them sign a waiver of disclosure', isCorrect: false }
        ],
        correctFeedback: 'Correct. Full disclosure is required every time.',
        incorrectFeedback: 'Review Ethics Training, Section 2: Duty of Disclosure.',
        difficultyLevel: 2
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // REGULATORY UPDATE ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-regulatory-update',
    title: 'Regulatory Updates Certification',
    description: 'Annual certification on current regulatory requirements and updated GCF policies.',
    moduleId: 'mod-regulatory-update',
    certificationLevel: 'ongoing_compliance',
    passingScore: 85,
    timeLimit: 20,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-reg-4'],
    questions: [
      {
        id: 'q-reg-1',
        type: 'multiple_choice',
        category: 'Best Interest',
        question: 'Under current best interest standards, advisors must document:',
        options: [
          { id: 'a', text: 'That the client agreed to the recommendation', isCorrect: false },
          { id: 'b', text: 'WHY the recommendation is in the client\'s best interest', isCorrect: true },
          { id: 'c', text: 'Only the product name and premium', isCorrect: false },
          { id: 'd', text: 'Commission amount received', isCorrect: false }
        ],
        correctFeedback: 'Correct. Documentation must explain WHY, not just WHAT.',
        incorrectFeedback: 'Review Regulatory Updates, Section 2: Best Interest Standards.',
        difficultyLevel: 2
      },
      {
        id: 'q-reg-2',
        type: 'multiple_choice',
        category: 'Senior Protections',
        question: 'For clients age 65+, many states now require:',
        options: [
          { id: 'a', text: 'Higher premiums due to age risk', isCorrect: false },
          { id: 'b', text: 'Extended free-look periods and additional disclosures', isCorrect: true },
          { id: 'c', text: 'Family member co-signature on all applications', isCorrect: false },
          { id: 'd', text: 'Medical exam for any coverage amount', isCorrect: false }
        ],
        correctFeedback: 'Correct. Enhanced protections for seniors include extended free-look and additional disclosures.',
        incorrectFeedback: 'Review Regulatory Updates, Section 2: Senior Protections.',
        difficultyLevel: 2
      },
      {
        id: 'q-reg-3',
        type: 'select_all',
        category: 'Enforcement',
        question: 'Select ALL that are top enforcement focus areas currently:',
        options: [
          { id: 'a', text: 'Unsuitable annuity sales to seniors', isCorrect: true },
          { id: 'b', text: 'Misleading IUL product comparisons', isCorrect: true },
          { id: 'c', text: 'Policy delivery timing', isCorrect: false },
          { id: 'd', text: 'Replacement without documentation', isCorrect: true },
          { id: 'e', text: 'Agent office location', isCorrect: false }
        ],
        correctFeedback: 'Correct. These are current high-priority enforcement areas.',
        incorrectFeedback: 'Review Regulatory Updates, Section 3: Enforcement Trends.',
        difficultyLevel: 2
      },
      {
        id: 'q-reg-4',
        type: 'scenario',
        category: 'Policy Compliance',
        question: 'What is the compliance issue?',
        scenario: 'Advisor texts a client about their policy status using their personal phone. The client responds with health questions about their application.',
        options: [
          { id: 'a', text: 'Personal phone is fine for quick updates', isCorrect: false },
          { id: 'b', text: 'All client communications must use approved channels; personal text is non-compliant', isCorrect: true, explanation: 'GCF policy requires approved communication platforms for all client communications.' },
          { id: 'c', text: 'Only a problem if discussing premiums', isCorrect: false },
          { id: 'd', text: 'Acceptable if advisor saves the texts', isCorrect: false }
        ],
        correctFeedback: 'Correct. Personal devices are not approved communication channels.',
        incorrectFeedback: 'Review Regulatory Updates, Section 4: GCF Policy Updates.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-reg-5',
        type: 'multiple_choice',
        category: 'Resources',
        question: 'Updated compliance forms and templates are available in:',
        options: [
          { id: 'a', text: 'Your personal email from last year', isCorrect: false },
          { id: 'b', text: 'Agent Portal under Compliance Resources', isCorrect: true },
          { id: 'c', text: 'The original training materials', isCorrect: false },
          { id: 'd', text: 'Third-party websites', isCorrect: false }
        ],
        correctFeedback: 'Correct. Always use current forms from the Agent Portal.',
        incorrectFeedback: 'Review Regulatory Updates, Section 4: GCF Policy Updates.',
        difficultyLevel: 1
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // ANNUAL COMPLIANCE COMBINED ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    id: 'assess-annual-compliance',
    title: 'Annual Compliance Certification',
    description: 'Combined annual certification covering AML, ethics, and regulatory compliance. Required for continued authorization.',
    moduleId: 'mod-aml-annual',
    certificationLevel: 'ongoing_compliance',
    passingScore: 90,
    timeLimit: 45,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: false,
    requiresProctoring: true,
    autoFailQuestions: ['q-annual-2', 'q-annual-5', 'q-annual-8'],
    questions: [
      {
        id: 'q-annual-1',
        type: 'multiple_choice',
        category: 'AML',
        question: 'Structuring transactions to avoid reporting thresholds is:',
        options: [
          { id: 'a', text: 'A smart way to reduce paperwork', isCorrect: false },
          { id: 'b', text: 'A federal crime', isCorrect: true },
          { id: 'c', text: 'Acceptable if the client requests it', isCorrect: false },
          { id: 'd', text: 'Only illegal for amounts over $50,000', isCorrect: false }
        ],
        correctFeedback: 'Correct. Structuring is a federal crime regardless of client request.',
        incorrectFeedback: 'Review AML Training, Section 4.',
        difficultyLevel: 2
      },
      {
        id: 'q-annual-2',
        type: 'scenario',
        category: 'Ethics',
        question: 'What should you do?',
        scenario: 'Your manager pressures you to close a sale by end of month. The client has said they want to think about it and talk to their spouse. Manager says "just get them to sign today and they can cancel during free-look if they change their mind."',
        options: [
          { id: 'a', text: 'Follow manager\'s advice—free-look protects the client', isCorrect: false },
          { id: 'b', text: 'Respect client\'s stated decision timeline; document the manager pressure and report to compliance if it continues', isCorrect: true, explanation: 'Manager pressure does not override client autonomy.' },
          { id: 'c', text: 'Ask for the manager to close the sale instead', isCorrect: false },
          { id: 'd', text: 'Offer a discount to close today', isCorrect: false }
        ],
        correctFeedback: 'Correct. Client decision timeline must be respected.',
        incorrectFeedback: 'Review Ethics Training, Section 3.',
        difficultyLevel: 3,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-annual-3',
        type: 'multiple_choice',
        category: 'Regulatory',
        question: 'Current suitability standards require documentation of:',
        options: [
          { id: 'a', text: 'Client signature on the application', isCorrect: false },
          { id: 'b', text: 'Why the recommendation meets the client\'s specific needs and why alternatives were not recommended', isCorrect: true },
          { id: 'c', text: 'Only the product selected and premium amount', isCorrect: false },
          { id: 'd', text: 'Advisor commission structure', isCorrect: false }
        ],
        correctFeedback: 'Correct. Document why this product and why not alternatives.',
        incorrectFeedback: 'Review Regulatory Updates, Section 2.',
        difficultyLevel: 2
      },
      {
        id: 'q-annual-4',
        type: 'select_all',
        category: 'AML',
        question: 'Select ALL that require additional scrutiny:',
        options: [
          { id: 'a', text: 'Third-party premium payments from unknown sources', isCorrect: true },
          { id: 'b', text: 'Client paying monthly by bank draft', isCorrect: false },
          { id: 'c', text: 'Unusual interest in policy loan and surrender provisions', isCorrect: true },
          { id: 'd', text: 'Client asking about beneficiary options', isCorrect: false },
          { id: 'e', text: 'Policies purchased for others without clear insurable interest', isCorrect: true }
        ],
        correctFeedback: 'Correct. These are AML red flags requiring scrutiny.',
        incorrectFeedback: 'Review AML Training, Section 3.',
        difficultyLevel: 2
      },
      {
        id: 'q-annual-5',
        type: 'scenario',
        category: 'Ethics',
        question: 'What is the compliance issue?',
        scenario: 'Advisor posts on LinkedIn: "Just helped another client secure their family\'s future with a great IUL policy! Returns have been amazing—DM me if you want the same results!"',
        options: [
          { id: 'a', text: 'Should have mentioned the carrier name', isCorrect: false },
          { id: 'b', text: 'Multiple violations: product recommendation, implied guarantees, and client disclosure without consent', isCorrect: true, explanation: 'Social media must not include recommendations, guarantees, or client information.' },
          { id: 'c', text: 'Should have used the company LinkedIn instead', isCorrect: false },
          { id: 'd', text: 'No issue—this is good marketing', isCorrect: false }
        ],
        correctFeedback: 'Correct. Multiple social media violations are present.',
        incorrectFeedback: 'Review Ethics Training, Section 4.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-annual-6',
        type: 'multiple_choice',
        category: 'Regulatory',
        question: 'GCF policy requires compliance review before submission for annuity sales to clients age:',
        options: [
          { id: 'a', text: '55+', isCorrect: false },
          { id: 'b', text: '65+', isCorrect: false },
          { id: 'c', text: '70+', isCorrect: true },
          { id: 'd', text: 'Any age', isCorrect: false }
        ],
        correctFeedback: 'Correct. Senior sales to 70+ require compliance review.',
        incorrectFeedback: 'Review Regulatory Updates, Section 4.',
        difficultyLevel: 1
      },
      {
        id: 'q-annual-7',
        type: 'true_false',
        category: 'AML',
        question: 'If a client asks you to accept cash payments in amounts of $9,500 on consecutive days "to avoid the paperwork," you should accommodate this request.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'This is structuring—a federal crime. Report to compliance.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. This is structuring and must be refused and reported.',
        incorrectFeedback: 'Review AML Training, Section 4.',
        difficultyLevel: 2
      },
      {
        id: 'q-annual-8',
        type: 'scenario',
        category: 'Fiduciary',
        question: 'What is the primary concern?',
        scenario: 'An advisor consistently recommends Carrier X products because Carrier X offers the highest commission. When asked, the advisor says "Carrier X is a good company—clients are happy."',
        options: [
          { id: 'a', text: 'No concern—clients are satisfied', isCorrect: false },
          { id: 'b', text: 'Should recommend more carriers for variety', isCorrect: false },
          { id: 'c', text: 'Recommendations based on commission rather than client needs violate fiduciary duty', isCorrect: true, explanation: 'Fiduciary duty requires recommendations based on client needs, not compensation.' },
          { id: 'd', text: 'Should disclose the commission amount to clients', isCorrect: false }
        ],
        correctFeedback: 'Correct. Commission-driven recommendations violate fiduciary duty.',
        incorrectFeedback: 'Review Ethics Training, Section 2.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      }
    ]
  },
  // Illinois State Assessment
  {
    id: 'assess-state-il',
    title: 'Illinois State Authorization Assessment',
    description: 'Assessment covering Illinois-specific insurance regulations, suitability requirements, and compliance obligations.',
    moduleId: 'mod-state-il',
    certificationLevel: 'state_expansion',
    passingScore: 90,
    timeLimit: 30,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ['q-il-3', 'q-il-7'],
    questions: [
      {
        id: 'q-il-1',
        type: 'multiple_choice',
        category: 'Licensing',
        question: 'How many hours of continuing education are required in Illinois every 2 years?',
        options: [
          { id: 'a', text: '20 hours', isCorrect: false },
          { id: 'b', text: '24 hours', isCorrect: true },
          { id: 'c', text: '30 hours', isCorrect: false },
          { id: 'd', text: '36 hours', isCorrect: false }
        ],
        correctFeedback: 'Correct. Illinois requires 24 CE hours every 2 years, including 3 hours of ethics.',
        incorrectFeedback: 'Review Illinois State Authorization, Section 1.',
        difficultyLevel: 1
      },
      {
        id: 'q-il-2',
        type: 'multiple_choice',
        category: 'Suitability',
        question: 'At what age does Illinois define a "Senior Consumer" requiring enhanced documentation?',
        options: [
          { id: 'a', text: '60', isCorrect: false },
          { id: 'b', text: '65', isCorrect: true },
          { id: 'c', text: '70', isCorrect: false },
          { id: 'd', text: '75', isCorrect: false }
        ],
        correctFeedback: 'Correct. Illinois defines Senior Consumer as age 65 or older.',
        incorrectFeedback: 'Review Illinois State Authorization, Section 2.',
        difficultyLevel: 1
      },
      {
        id: 'q-il-3',
        type: 'true_false',
        category: 'Compliance',
        question: 'In Illinois, you can complete the replacement form after the application is submitted as long as it is done within 5 business days.',
        options: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Illinois requires replacement form BEFORE application submission.' },
          { id: 'false', text: 'False', isCorrect: true }
        ],
        correctFeedback: 'Correct. The replacement form must be completed BEFORE the application.',
        incorrectFeedback: 'This is a critical requirement. Review Illinois State Authorization, Section 2.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-il-4',
        type: 'multiple_choice',
        category: 'Annuities',
        question: 'What is the minimum free-look period for annuity sales to seniors in Illinois?',
        options: [
          { id: 'a', text: '10 days', isCorrect: false },
          { id: 'b', text: '20 days', isCorrect: false },
          { id: 'c', text: '30 days', isCorrect: true },
          { id: 'd', text: '45 days', isCorrect: false }
        ],
        correctFeedback: 'Correct. Illinois requires a minimum 30-day free-look period for senior clients.',
        incorrectFeedback: 'Review Illinois State Authorization, Section 3.',
        difficultyLevel: 2
      },
      {
        id: 'q-il-5',
        type: 'multiple_choice',
        category: 'Training',
        question: 'How many hours of initial annuity suitability training are required before selling annuities in Illinois?',
        options: [
          { id: 'a', text: '2 hours', isCorrect: false },
          { id: 'b', text: '4 hours', isCorrect: true },
          { id: 'c', text: '6 hours', isCorrect: false },
          { id: 'd', text: '8 hours', isCorrect: false }
        ],
        correctFeedback: 'Correct. Illinois requires 4 hours of initial annuity suitability training.',
        incorrectFeedback: 'Review Illinois State Authorization, Section 3.',
        difficultyLevel: 1
      },
      {
        id: 'q-il-6',
        type: 'multiple_choice',
        category: 'Enforcement',
        question: 'What is the maximum administrative fine per violation that IDOI can impose?',
        options: [
          { id: 'a', text: '$1,000', isCorrect: false },
          { id: 'b', text: '$5,000', isCorrect: false },
          { id: 'c', text: '$10,000', isCorrect: true },
          { id: 'd', text: '$25,000', isCorrect: false }
        ],
        correctFeedback: 'Correct. Illinois can impose fines up to $10,000 per violation.',
        incorrectFeedback: 'Review Illinois State Authorization, Section 4.',
        difficultyLevel: 2
      },
      {
        id: 'q-il-7',
        type: 'scenario',
        category: 'Compliance',
        question: 'What is the MOST important action to take?',
        scenario: 'You receive a letter from IDOI regarding a consumer complaint about an annuity sale you made 6 months ago.',
        options: [
          { id: 'a', text: 'Respond directly to IDOI with your explanation within 30 days', isCorrect: false },
          { id: 'b', text: 'Contact the client to resolve the complaint before responding', isCorrect: false },
          { id: 'c', text: 'Forward to GCF Compliance immediately and do not respond without approval', isCorrect: true, explanation: 'All regulatory communications must go through GCF Compliance first.' },
          { id: 'd', text: 'Wait to see if IDOI sends a follow-up before taking action', isCorrect: false }
        ],
        correctFeedback: 'Correct. All IDOI communications must be forwarded to GCF Compliance immediately.',
        incorrectFeedback: 'This is critical. Review Illinois State Authorization, Section 5.',
        difficultyLevel: 2,
        autoFailOnIncorrect: true
      },
      {
        id: 'q-il-8',
        type: 'multiple_choice',
        category: 'Reporting',
        question: 'Within how many days must you report disciplinary actions to IDOI?',
        options: [
          { id: 'a', text: '10 days', isCorrect: false },
          { id: 'b', text: '30 days', isCorrect: true },
          { id: 'c', text: '60 days', isCorrect: false },
          { id: 'd', text: '90 days', isCorrect: false }
        ],
        correctFeedback: 'Correct. Disciplinary actions must be reported within 30 days.',
        incorrectFeedback: 'Review Illinois State Authorization, Section 1.',
        difficultyLevel: 1
      }
    ]
  }
];

// ============================================================================
// MOCK CALL RUBRICS
// ============================================================================

export interface MockCallRubric {
  id: string;
  title: string;
  description: string;
  certificationLevel: CertificationLevel;
  passingScore: number;
  categories: {
    name: string;
    weight: number;    // Percentage (should sum to 100)
    criteria: {
      description: string;
      points: number;  // Max points for this criterion
      autoFail?: boolean;
    }[];
  }[];
}

export const MOCK_CALL_RUBRICS: MockCallRubric[] = [
  {
    id: 'rubric-education-call',
    title: 'Education Call Framework Rubric',
    description: 'Evaluation criteria for mock education calls demonstrating the Gold Coast Financial call framework.',
    certificationLevel: 'core_advisor',
    passingScore: 80,
    categories: [
      {
        name: 'Opening & Consent',
        weight: 15,
        criteria: [
          { description: 'Proper identification (name, company, licensed status)', points: 3 },
          { description: 'Clear purpose statement', points: 3 },
          { description: 'Recording disclosure (if applicable)', points: 2 },
          { description: 'Time confirmation', points: 2 },
          { description: 'Permission to proceed obtained', points: 5, autoFail: true }
        ]
      },
      {
        name: 'Discovery & Needs Analysis',
        weight: 25,
        criteria: [
          { description: 'Current situation explored (marital, employment, coverage)', points: 5 },
          { description: 'Coverage purpose identified', points: 5 },
          { description: 'Protection needs quantified', points: 5 },
          { description: 'Budget addressed (after needs, not before)', points: 5 },
          { description: 'General health status confirmed', points: 5 }
        ]
      },
      {
        name: 'Education & Explanation',
        weight: 25,
        criteria: [
          { description: 'Product type explained clearly', points: 5 },
          { description: 'Recommendation connected to discovered needs', points: 7 },
          { description: 'Alternatives mentioned', points: 5, autoFail: true },
          { description: 'Limitations/exclusions disclosed', points: 5, autoFail: true },
          { description: 'Next steps explained', points: 3 }
        ]
      },
      {
        name: 'Confirmation & Close',
        weight: 20,
        criteria: [
          { description: 'Comprehension check performed', points: 7, autoFail: true },
          { description: 'Questions invited and addressed', points: 5 },
          { description: 'Decision respected (no pressure tactics)', points: 8, autoFail: true }
        ]
      },
      {
        name: 'Professionalism',
        weight: 15,
        criteria: [
          { description: 'Professional tone throughout', points: 5 },
          { description: 'No prohibited language used', points: 5, autoFail: true },
          { description: 'Clear and understandable communication', points: 5 }
        ]
      }
    ]
  }
];

// ============================================================================
// CERTIFICATION TRACKING
// ============================================================================

export interface AdvisorCertification {
  advisorId: string;
  certificationId: string;
  status: CertificationStatus;
  earnedDate?: string;
  expirationDate?: string;
  attemptsMade: number;
  lastAttemptDate?: string;
  lockedUntil?: string;
  managerApproval?: {
    approved: boolean;
    approvedBy: string;
    approvedDate: string;
    notes?: string;
  };
  complianceReview?: {
    approved: boolean;
    reviewedBy: string;
    reviewedDate: string;
    notes?: string;
  };
}

export interface ModuleProgress {
  advisorId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedDate?: string;
  completedDate?: string;
  timeSpent: number;        // Minutes
  sectionProgress: {
    sectionId: string;
    completed: boolean;
    completedDate?: string;
  }[];
  assessmentResults?: {
    assessmentId: string;
    attemptNumber: number;
    score: number;
    passed: boolean;
    completedDate: string;
    answers: {
      questionId: string;
      selectedOptions: string[];
      correct: boolean;
    }[];
  }[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getModuleById(moduleId: string): TrainingModuleData | undefined {
  return INSTITUTIONAL_MODULES.find(m => m.id === moduleId);
}

export function getAssessmentById(assessmentId: string): Assessment | undefined {
  return ASSESSMENTS.find(a => a.id === assessmentId);
}

export function getCertificationById(certId: string): CertificationGate | undefined {
  return CERTIFICATION_GATES.find(c => c.id === certId);
}

export function getModulesForCertification(certId: string): TrainingModuleData[] {
  const cert = getCertificationById(certId);
  if (!cert) return [];
  return cert.requiredModules
    .map(id => getModuleById(id))
    .filter((m): m is TrainingModuleData => m !== undefined);
}

export function canAccessModule(
  moduleId: string,
  completedModules: string[]
): boolean {
  const module = getModuleById(moduleId);
  if (!module) return false;
  return module.prerequisiteModules.every(prereq => completedModules.includes(prereq));
}

export function calculateCertificationProgress(
  certId: string,
  completedModules: string[],
  passedAssessments: string[]
): number {
  const cert = getCertificationById(certId);
  if (!cert) return 0;

  const totalRequirements = cert.requiredModules.length + cert.requiredAssessments.length;
  const completedRequirements =
    cert.requiredModules.filter(m => completedModules.includes(m)).length +
    cert.requiredAssessments.filter(a => passedAssessments.includes(a)).length;

  return Math.round((completedRequirements / totalRequirements) * 100);
}

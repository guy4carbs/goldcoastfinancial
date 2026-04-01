/**
 * ONBOARDING TASK CONTENT - Days 3-7
 *
 * Complete content definitions for all 35 interactive tasks.
 * Follows Heritage brand guidelines and design system.
 */

import type { TrainingVideo } from "@/components/training/VideoPlayer";
import type { Assessment, AssessmentQuestion } from "@/lib/trainingData";
import type { SimulationScenario, SimulationNode, ClientProfile } from "@/lib/trainingInfrastructure";

// ============================================================================
// VIDEO CONTENT
// ============================================================================

export const ONBOARDING_VIDEOS: Record<string, TrainingVideo> = {
  // Day 1 - Welcome & Setup
  "welcome-video": {
    id: "welcome-video",
    title: "Welcome to Heritage Life",
    description: "Meet our leadership team and learn about Heritage Life's mission and values",
    duration: 300, // 5 minutes
    thumbnailUrl: "/training/thumbnails/welcome.jpg",
    videoUrl: "/training/videos/welcome.mp4",
    tags: ["welcome", "culture", "day1"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Heritage Life Insurance!" },
      { timestamp: 15, text: "I'm Sarah Chen, CEO, and I'm thrilled to have you join our team." },
      { timestamp: 45, text: "At Heritage, we believe in protecting families and building legacies." },
      { timestamp: 90, text: "Our mission is simple: Help every American family achieve financial security." },
      { timestamp: 150, text: "You'll have access to industry-leading training, AI tools, and mentorship." },
      { timestamp: 210, text: "Let's build something great together. Welcome to the Heritage family!" },
    ]
  },

  "tour-portal": {
    id: "tour-portal",
    title: "Agent Portal Tour",
    description: "Interactive walkthrough of all portal features and tools",
    duration: 600, // 10 minutes
    thumbnailUrl: "/training/thumbnails/portal-tour.jpg",
    videoUrl: "/training/videos/portal-tour.mp4",
    tags: ["portal", "tools", "day1"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Let's explore your Agent Portal - your daily command center." },
      { timestamp: 30, text: "The Dashboard shows your pipeline, tasks, and performance metrics." },
      { timestamp: 90, text: "The CRM helps you manage all your leads and client relationships." },
      { timestamp: 150, text: "Quick Quote lets you generate policy quotes in seconds." },
      { timestamp: 240, text: "The Training Hub is where you'll access all learning resources." },
      { timestamp: 330, text: "And the AI Council provides 24/7 coaching from multiple expert personas." },
      { timestamp: 420, text: "Take time to explore each section - familiarity breeds confidence!" },
    ]
  },

  "intro-ai": {
    id: "intro-ai",
    title: "Introduction to AI Avatars",
    description: "Learn how to use the AI Council for sales coaching and role-play",
    duration: 480, // 8 minutes
    thumbnailUrl: "/training/thumbnails/ai-intro.jpg",
    videoUrl: "/training/videos/ai-intro.mp4",
    tags: ["AI", "coaching", "day1"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "The AI Council is your secret weapon for success." },
      { timestamp: 30, text: "You have access to multiple AI coaches, each with unique expertise." },
      { timestamp: 90, text: "Use them for objection handling practice, sales scripts, and product knowledge." },
      { timestamp: 150, text: "Practice role-play scenarios anytime - the AI adapts to your skill level." },
      { timestamp: 240, text: "Ask questions naturally, just like you would with a human mentor." },
      { timestamp: 330, text: "The more you practice, the more confident you'll become in real conversations." },
    ]
  },

  // Day 2 - First Steps
  "heritage-products": {
    id: "heritage-products",
    title: "Heritage Product Portfolio",
    description: "Overview of all Heritage Life product offerings and their target markets",
    duration: 900, // 15 minutes
    thumbnailUrl: "/training/thumbnails/heritage-products.jpg",
    videoUrl: "/training/videos/heritage-products.mp4",
    tags: ["products", "overview", "day2"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Heritage Life's product portfolio overview." },
      { timestamp: 30, text: "We offer three main product categories: Term, Whole Life, and IUL." },
      { timestamp: 90, text: "Term life is our most affordable option - perfect for families with temporary needs." },
      { timestamp: 180, text: "Whole life provides permanent protection with guaranteed cash value growth." },
      { timestamp: 300, text: "IUL offers flexibility with potential for higher cash value accumulation." },
      { timestamp: 450, text: "We also offer annuities for retirement income needs." },
      { timestamp: 600, text: "Understanding each product's ideal client helps you make better recommendations." },
    ]
  },

  "sales-intro": {
    id: "sales-intro",
    title: "Introduction to Sales Process",
    description: "Learn the Heritage Life education-first sales methodology",
    duration: 1200, // 20 minutes
    thumbnailUrl: "/training/thumbnails/sales-intro.jpg",
    videoUrl: "/training/videos/sales-intro.mp4",
    tags: ["sales", "methodology", "day2"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Heritage Life's sales methodology training." },
      { timestamp: 30, text: "At Heritage, we believe in education-first selling." },
      { timestamp: 90, text: "Our process focuses on understanding before recommending." },
      { timestamp: 180, text: "Step 1: Discovery - Learn about your client's situation and goals." },
      { timestamp: 300, text: "Step 2: Education - Help them understand their options." },
      { timestamp: 450, text: "Step 3: Recommendation - Match products to their specific needs." },
      { timestamp: 600, text: "Step 4: Support - Be there for questions and ongoing service." },
      { timestamp: 750, text: "This approach builds trust and leads to long-term relationships." },
    ]
  },

  // Day 3 - Product Knowledge
  "iul-training": {
    id: "iul-training",
    title: "Indexed Universal Life (IUL) Training",
    description: "Learn how IUL works, caps, floors, and participation rates",
    duration: 2100, // 35 minutes
    thumbnailUrl: "/training/thumbnails/iul-training.jpg",
    videoUrl: "/training/videos/iul-training.mp4",
    tags: ["IUL", "products", "day3"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to our comprehensive IUL training module." },
      { timestamp: 15, text: "Today we'll cover how Indexed Universal Life insurance works." },
      { timestamp: 45, text: "IUL combines life insurance protection with cash value accumulation." },
      { timestamp: 90, text: "The cash value growth is tied to a market index, typically the S&P 500." },
      { timestamp: 150, text: "Let's discuss caps, floors, and participation rates." },
      { timestamp: 210, text: "A cap is the maximum interest rate credited to your policy." },
      { timestamp: 270, text: "A floor protects you from negative returns - typically 0%." },
      { timestamp: 330, text: "Participation rates determine what percentage of index gains you receive." },
    ]
  },

  // Day 4 - Sales
  "discovery-questions": {
    id: "discovery-questions",
    title: "Mastering Discovery Questions",
    description: "Learn the art of asking questions that uncover client needs",
    duration: 1800, // 30 minutes
    thumbnailUrl: "/training/thumbnails/discovery-questions.jpg",
    videoUrl: "/training/videos/discovery-questions.mp4",
    tags: ["sales", "discovery", "day4"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Mastering Discovery Questions." },
      { timestamp: 20, text: "The best advisors ask more than they tell." },
      { timestamp: 60, text: "Discovery is about understanding your client's complete picture." },
      { timestamp: 120, text: "Start with open-ended questions about their family and goals." },
      { timestamp: 180, text: "Listen actively and follow up on what they share." },
    ]
  },

  "closing-techniques": {
    id: "closing-techniques",
    title: "Ethical Closing Techniques",
    description: "Learn to close confidently without being pushy",
    duration: 1500, // 25 minutes
    thumbnailUrl: "/training/thumbnails/closing-techniques.jpg",
    videoUrl: "/training/videos/closing-techniques.mp4",
    tags: ["sales", "closing", "day4"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Ethical Closing Techniques." },
      { timestamp: 30, text: "Closing is not about pressure - it's about guidance." },
      { timestamp: 90, text: "When you've educated properly, closing becomes natural." },
    ]
  },

  // Day 5 - Compliance
  "anti-fraud": {
    id: "anti-fraud",
    title: "Anti-Fraud & Anti-Money Laundering",
    description: "Recognize and report suspicious activities and fraud indicators",
    duration: 1800, // 30 minutes
    thumbnailUrl: "/training/thumbnails/anti-fraud.jpg",
    videoUrl: "/training/videos/anti-fraud.mp4",
    tags: ["compliance", "AML", "fraud", "day5"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Anti-Fraud and Anti-Money Laundering training." },
      { timestamp: 30, text: "As insurance professionals, we play a critical role in preventing fraud." },
      { timestamp: 90, text: "Red flags include requests for cash payments or unusual urgency." },
    ]
  },

  // Day 6 - Communication
  "phone-skills": {
    id: "phone-skills",
    title: "Professional Phone Etiquette",
    description: "Master the art of phone conversations and cold calling",
    duration: 1500, // 25 minutes
    thumbnailUrl: "/training/thumbnails/phone-skills.jpg",
    videoUrl: "/training/videos/phone-skills.mp4",
    tags: ["communication", "phone", "day6"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Professional Phone Etiquette." },
      { timestamp: 20, text: "Your voice is your first impression on the phone." },
      { timestamp: 60, text: "Always identify yourself and your company clearly." },
    ]
  },

  "presentation-basics": {
    id: "presentation-basics",
    title: "Presentation Fundamentals",
    description: "Structure and deliver impactful client presentations",
    duration: 2400, // 40 minutes
    thumbnailUrl: "/training/thumbnails/presentation-basics.jpg",
    videoUrl: "/training/videos/presentation-basics.mp4",
    tags: ["communication", "presentation", "day6"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to Presentation Fundamentals." },
      { timestamp: 30, text: "Great presentations tell a story and solve a problem." },
      { timestamp: 90, text: "Structure your presentation around client needs, not product features." },
    ]
  },

  // ============================================================================
  // DAYS 8-30: WEEK 2-4 VIDEOS
  // ============================================================================

  // Week 2 - Client Engagement Basics
  "phone-scripts": {
    id: "phone-scripts",
    title: "Phone Script Workshop",
    description: "Master effective phone scripts for prospecting and follow-up",
    duration: 1800, // 30 minutes
    thumbnailUrl: "/training/thumbnails/phone-scripts.jpg",
    videoUrl: "/training/videos/phone-scripts.mp4",
    tags: ["sales", "phone", "week2"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to the Phone Script Workshop." },
      { timestamp: 30, text: "Effective scripts sound natural, not robotic." },
      { timestamp: 90, text: "The goal is conversation, not recitation." },
      { timestamp: 150, text: "Let's practice the perfect opening..." },
      { timestamp: 300, text: "Now let's handle common responses..." },
      { timestamp: 600, text: "Remember: scripts are guidelines, not straitjackets." },
    ]
  },

  // Week 3 - Sales Mastery
  "closing-deep-dive": {
    id: "closing-deep-dive",
    title: "Closing Techniques Deep Dive",
    description: "Master advanced closing strategies for higher conversion rates",
    duration: 2700, // 45 minutes
    thumbnailUrl: "/training/thumbnails/closing-deep-dive.jpg",
    videoUrl: "/training/videos/closing-deep-dive.mp4",
    tags: ["sales", "closing", "week3"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to our deep dive on closing techniques." },
      { timestamp: 45, text: "Closing isn't about tricks - it's about helping clients decide." },
      { timestamp: 120, text: "The assumptive close: 'Let's get the paperwork started...'" },
      { timestamp: 300, text: "The choice close: 'Would you prefer the 20 or 30-year term?'" },
      { timestamp: 500, text: "The summary close: 'Based on everything we discussed...'" },
      { timestamp: 800, text: "Practice makes these feel natural." },
    ]
  },

  // Day 1 - CRM & Scripts Videos
  "crm-tour": {
    id: "crm-tour",
    title: "CRM System Tour",
    description: "Complete walkthrough of your Heritage CRM system and key features",
    duration: 720, // 12 minutes
    thumbnailUrl: "/training/thumbnails/crm-tour.jpg",
    videoUrl: "/training/videos/crm-tour.mp4",
    tags: ["CRM", "tools", "day1"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to your Heritage CRM tour." },
      { timestamp: 30, text: "The CRM is your command center for managing all client relationships." },
      { timestamp: 90, text: "Let's start with the dashboard - here you see your pipeline at a glance." },
      { timestamp: 180, text: "The Leads section shows all your prospects organized by status." },
      { timestamp: 300, text: "Click any lead to see their full profile and interaction history." },
      { timestamp: 420, text: "The Tasks tab keeps you on track with follow-ups and appointments." },
      { timestamp: 540, text: "Use Quick Actions to log calls, send emails, or schedule meetings instantly." },
      { timestamp: 660, text: "Master this tool and you'll never miss an opportunity." },
    ]
  },

  "script-philosophy": {
    id: "script-philosophy",
    title: "The Heritage Script Philosophy",
    description: "Understand our education-first approach to client conversations",
    duration: 600, // 10 minutes
    thumbnailUrl: "/training/thumbnails/script-philosophy.jpg",
    videoUrl: "/training/videos/script-philosophy.mp4",
    tags: ["scripts", "sales", "day1"],
    isPlaceholder: true,
    transcript: [
      { timestamp: 0, text: "Welcome to the Heritage Script Philosophy." },
      { timestamp: 30, text: "At Heritage, we don't sell - we educate and guide." },
      { timestamp: 90, text: "Our scripts are conversation frameworks, not word-for-word recitations." },
      { timestamp: 150, text: "The goal is to understand your client's needs deeply." },
      { timestamp: 240, text: "Then educate them on their options so they can make informed decisions." },
      { timestamp: 330, text: "Great agents adapt the script to each unique conversation." },
      { timestamp: 420, text: "Practice until the structure becomes second nature." },
      { timestamp: 540, text: "Then you can focus on truly listening to your client." },
    ]
  },
};

// ============================================================================
// MODULE CONTENT (for module, read, review task types)
// ============================================================================

export interface ModuleContent {
  id: string;
  title: string;
  description: string;
  sections: {
    id: string;
    title: string;
    content: string;
    duration: number;
    keyPoints: string[];
  }[];
  learningObjectives: string[];
}

export const ONBOARDING_MODULES: Record<string, ModuleContent> = {
  // Day 1 - Welcome & Setup
  "read-handbook": {
    id: "read-handbook",
    title: "Heritage Life Agent Handbook",
    description: "Essential policies, procedures, and guidelines for Heritage agents",
    learningObjectives: [
      "Understand Heritage Life's core values and culture",
      "Know the agent code of conduct and compliance requirements",
      "Learn about compensation structure and benefits",
    ],
    sections: [
      {
        id: "welcome-section",
        title: "Welcome to Heritage Life",
        duration: 5,
        content: `Welcome to Heritage Life Insurance!

You've joined a team of dedicated professionals committed to protecting American families. As a Heritage agent, you represent our brand and values in every interaction.

OUR MISSION:
Help every American family achieve financial security through education-first insurance guidance.

OUR VALUES:
• Integrity - We do what's right, even when no one is watching
• Education - We teach, not sell
• Family - We treat clients like our own family
• Excellence - We strive to be the best version of ourselves`,
        keyPoints: [
          "Heritage is an education-first company",
          "Integrity is our foundation",
          "Client relationships come before commissions",
        ]
      },
      {
        id: "code-of-conduct",
        title: "Agent Code of Conduct",
        duration: 8,
        content: `As a Heritage agent, you agree to:

PROFESSIONAL STANDARDS:
• Maintain current state licensing
• Complete all required continuing education
• Represent products accurately and honestly
• Never make guarantees about policy performance

COMPLIANCE REQUIREMENTS:
• Document all client interactions
• Submit applications within 48 hours
• Report any compliance concerns immediately
• Follow suitability guidelines for all recommendations

PROHIBITED ACTIVITIES:
• Twisting or churning policies
• Making misleading comparisons
• Sharing client information inappropriately
• Engaging in unauthorized marketing`,
        keyPoints: [
          "Maintain proper licensing at all times",
          "Document everything thoroughly",
          "When in doubt, ask compliance",
        ]
      },
      {
        id: "compensation",
        title: "Compensation & Benefits",
        duration: 7,
        content: `COMMISSION STRUCTURE:
Heritage offers competitive commissions with residual income potential.

FIRST YEAR COMMISSIONS:
• Term Life: 50-70% of annual premium
• Whole Life: 50-90% of first year premium
• IUL: 80-100% of target premium
• Annuities: 4-7% of premium

RENEWAL COMMISSIONS:
• Start in year 2 and continue as long as policies remain in force
• Build your passive income stream over time

BONUSES:
• Production bonuses starting at $5,000/month
• Annual performance bonuses
• Conference qualifications

BENEFITS:
• E&O insurance provided
• Marketing materials and tools
• Ongoing training and development`,
        keyPoints: [
          "Commission varies by product type",
          "Renewals build long-term income",
          "Bonuses reward consistent production",
        ]
      }
    ]
  },

  "meet-team": {
    id: "meet-team",
    title: "Meet Your Support Team",
    description: "Learn about the people who will help you succeed at Heritage",
    learningObjectives: [
      "Know who to contact for different types of support",
      "Understand the role of your mentor",
      "Learn about available resources and support channels",
    ],
    sections: [
      {
        id: "support-structure",
        title: "Your Support Network",
        duration: 3,
        content: `At Heritage, you're never alone. You have a full team supporting your success.

YOUR FIELD MANAGER:
Your direct point of contact for production questions, sales support, and career development. They conduct weekly check-ins and help you set and achieve goals.

YOUR MENTOR:
An experienced agent paired with you for your first 90 days. They've been where you are and will share practical wisdom.

SUPPORT CHANNELS:
• Agent Helpdesk: Questions about policies, commissions, tech issues
• Compliance Team: Questions about regulations and approved practices
• Training Team: Course recommendations and skill development
• AI Council: 24/7 coaching and role-play practice`,
        keyPoints: [
          "Your manager is your primary contact",
          "Mentors provide peer-level guidance",
          "Multiple support channels available",
        ]
      },
      {
        id: "getting-help",
        title: "Getting Help When You Need It",
        duration: 2,
        content: `WHEN TO REACH OUT:

Contact your Manager for:
• Sales strategy and pipeline questions
• Career advancement discussions
• Performance reviews

Contact your Mentor for:
• Day-to-day questions
• Best practices and tips
• "How would you handle this?" scenarios

Contact Support for:
• Technical issues
• Commission questions
• Application status

Use the AI Council for:
• Practice conversations
• Objection handling
• Product knowledge refresh`,
        keyPoints: [
          "Don't hesitate to ask for help",
          "Different contacts for different needs",
          "AI Council is available 24/7",
        ]
      }
    ]
  },

  // Day 1 - Setup & Administrative Tasks
  "complete-profile": {
    id: "complete-profile",
    title: "Complete Your Agent Profile",
    description: "Set up your professional profile to make a great first impression",
    learningObjectives: [
      "Upload a professional headshot",
      "Add your contact information",
      "Write a compelling bio",
    ],
    sections: [
      {
        id: "profile-importance",
        title: "Why Your Profile Matters",
        duration: 2,
        content: `Your agent profile is often the first impression clients and colleagues will have of you.

A COMPLETE PROFILE HELPS YOU:
• Build trust with potential clients
• Stand out as a professional
• Make it easy for people to contact you
• Establish your personal brand

PROFILE CHECKLIST:
✓ Professional headshot (business casual attire)
✓ Current contact information
✓ Brief bio highlighting your background
✓ Your "why" - why you chose insurance`,
        keyPoints: [
          "First impressions matter - your profile builds trust",
          "Professional photos increase engagement",
          "Your bio tells your story",
        ]
      },
      {
        id: "profile-steps",
        title: "Complete Your Profile Now",
        duration: 3,
        content: `STEP 1: UPLOAD YOUR PHOTO
• Use a recent, high-quality headshot
• Dress in business casual attire
• Use a neutral or professional background
• Smile naturally and make eye contact

STEP 2: ADD CONTACT INFO
• Verify your email address
• Add your phone number
• Set your preferred contact method

STEP 3: WRITE YOUR BIO
• Keep it 2-3 sentences
• Mention your background briefly
• Share why you're passionate about helping families
• Be authentic and personable

Navigate to Settings > Profile to complete these steps now.`,
        keyPoints: [
          "Upload a professional headshot",
          "Verify all contact information",
          "Write a brief, authentic bio",
        ]
      }
    ]
  },

  "setup-2fa": {
    id: "setup-2fa",
    title: "Two-Factor Authentication Setup",
    description: "Secure your account with an extra layer of protection",
    learningObjectives: [
      "Understand why 2FA is required",
      "Set up 2FA on your account",
      "Know how to use authentication apps",
    ],
    sections: [
      {
        id: "2fa-importance",
        title: "Why 2FA is Required",
        duration: 2,
        content: `Two-Factor Authentication (2FA) adds an extra layer of security to your account.

WHY IT'S MANDATORY:
• Protects sensitive client information
• Meets compliance requirements
• Prevents unauthorized access
• Industry best practice

HOW 2FA WORKS:
1. You enter your password (something you know)
2. You confirm with your phone (something you have)
3. Access is granted only when both are verified

This means even if someone guesses your password, they can't access your account without your phone.`,
        keyPoints: [
          "2FA protects client data",
          "Required for compliance",
          "Uses something you know + something you have",
        ]
      },
      {
        id: "2fa-setup",
        title: "Set Up 2FA Now",
        duration: 3,
        content: `STEP 1: DOWNLOAD AN AUTHENTICATOR APP
Recommended apps:
• Google Authenticator (iOS/Android)
• Microsoft Authenticator (iOS/Android)
• Authy (iOS/Android)

STEP 2: LINK YOUR ACCOUNT
• Go to Settings > Security > Two-Factor Authentication
• Click "Enable 2FA"
• Scan the QR code with your authenticator app
• Enter the 6-digit code to verify

STEP 3: SAVE BACKUP CODES
• Download and securely store your backup codes
• These help you access your account if you lose your phone

Navigate to Settings > Security to complete 2FA setup now.`,
        keyPoints: [
          "Download an authenticator app",
          "Scan QR code to link accounts",
          "Save backup codes securely",
        ]
      }
    ]
  },

  "setup-notifications": {
    id: "setup-notifications",
    title: "Notification Preferences",
    description: "Configure how you receive important updates and alerts",
    learningObjectives: [
      "Understand notification types",
      "Set up email preferences",
      "Configure push notifications",
    ],
    sections: [
      {
        id: "notification-types",
        title: "Types of Notifications",
        duration: 2,
        content: `Stay informed without being overwhelmed by setting up the right notifications.

NOTIFICATION CATEGORIES:

📋 LEAD ALERTS (Recommended: On)
• New lead assignments
• Lead status updates
• Hot lead notifications

📧 COMMISSION & PAYMENTS
• Commission statements
• Bonus notifications
• Payment confirmations

📅 TRAINING & DEADLINES
• Course reminders
• Compliance deadlines
• Certification expiration

📢 COMPANY UPDATES
• Product announcements
• Policy changes
• Team communications`,
        keyPoints: [
          "Lead alerts help you respond quickly",
          "Commission notifications track your earnings",
          "Training reminders keep you on track",
        ]
      },
      {
        id: "notification-setup",
        title: "Configure Your Preferences",
        duration: 2,
        content: `STEP 1: EMAIL NOTIFICATIONS
• Go to Settings > Notifications > Email
• Enable notifications for critical alerts (leads, commissions)
• Choose daily digest for less urgent items

STEP 2: PUSH NOTIFICATIONS
• Enable push notifications for time-sensitive alerts
• Set quiet hours if needed (e.g., 9 PM - 7 AM)
• Prioritize lead alerts for immediate delivery

STEP 3: IN-APP NOTIFICATIONS
• These appear in your notification center
• Review them daily as part of your routine

RECOMMENDED SETTINGS:
✓ Lead alerts: Email + Push
✓ Commission updates: Email only
✓ Training reminders: Email + Push
✓ Company news: Daily digest`,
        keyPoints: [
          "Enable push for time-sensitive alerts",
          "Use daily digest for non-urgent items",
          "Set quiet hours to maintain work-life balance",
        ]
      }
    ]
  },

  "sign-nda": {
    id: "sign-nda",
    title: "NDA Agreement",
    description: "Review and sign the Non-Disclosure Agreement",
    learningObjectives: [
      "Understand the purpose of the NDA",
      "Know what information is confidential",
      "Complete the digital signing process",
    ],
    sections: [
      {
        id: "nda-overview",
        title: "Understanding the NDA",
        duration: 3,
        content: `The Non-Disclosure Agreement (NDA) protects sensitive company and client information.

WHY NDAs ARE NECESSARY:
• Protect proprietary company information
• Safeguard client data and privacy
• Maintain competitive advantage
• Meet regulatory requirements

WHAT'S COVERED:
• Client personal and financial information
• Company pricing and commission structures
• Sales strategies and scripts
• Internal systems and processes
• Training materials and content

YOUR OBLIGATIONS:
• Keep confidential information private
• Only use it for authorized business purposes
• Report any suspected breaches immediately
• Return or destroy information when you leave`,
        keyPoints: [
          "NDAs protect both clients and the company",
          "Client information must remain confidential",
          "Breaches can have serious consequences",
        ]
      },
      {
        id: "nda-signing",
        title: "Sign Your NDA",
        duration: 2,
        content: `BEFORE SIGNING:
• Read the full NDA document carefully
• Understand your obligations
• Ask questions if anything is unclear

SIGNING PROCESS:
1. Click "View NDA Document" below
2. Read through all sections
3. Scroll to the signature area
4. Type your full legal name
5. Click "Sign Electronically"
6. You'll receive a confirmation email

IMPORTANT NOTES:
• This is a legally binding agreement
• Keep a copy for your records
• Your signed NDA will be stored in your Documents

The NDA remains in effect during and after your time with Heritage.`,
        keyPoints: [
          "Read the full document before signing",
          "Signature is legally binding",
          "Obligations continue after employment",
        ]
      }
    ]
  },

  "contracts-verification": {
    id: "contracts-verification",
    title: "Contract Verification",
    description: "Verify your agent contract has been submitted for processing",
    learningObjectives: [
      "Confirm contract receipt",
      "Understand the processing timeline",
      "Know what to expect next",
    ],
    sections: [
      {
        id: "contract-process",
        title: "Contract Processing Overview",
        duration: 2,
        content: `Your agent contract is being processed. Here's what you need to know.

CONTRACT TIMELINE:
• Submission: Day 1 (Complete)
• Initial Review: 1-2 business days
• Background Check: 3-5 business days
• Carrier Appointments: 5-10 business days
• Ready to Sell: ~2 weeks from submission

WHAT'S BEING VERIFIED:
✓ Personal information accuracy
✓ State licensing verification
✓ Background check clearance
✓ E&O insurance confirmation
✓ Carrier appointment processing

You'll receive email updates at each milestone.`,
        keyPoints: [
          "Processing takes approximately 2 weeks",
          "You'll receive status updates via email",
          "Continue training while contracts process",
        ]
      },
      {
        id: "verification-steps",
        title: "Confirm Your Contract Status",
        duration: 2,
        content: `ACTION REQUIRED:
Please verify that your contract documents have been received.

CHECK YOUR STATUS:
1. Go to Documents > Contracts
2. Verify "Agent Contract" shows as "Submitted"
3. Check that all required documents are listed

IF ANYTHING IS MISSING:
• Contact HR immediately at hr@heritagels.org
• Provide any missing documentation
• Don't wait - delays affect your start date

WHILE YOU WAIT:
• Continue with all training modules
• You can practice everything before going live
• Use this time to prepare for your first clients

Your contracts team contact: contracts@heritagels.org`,
        keyPoints: [
          "Verify contract shows as submitted",
          "Contact HR if documents are missing",
          "Continue training while processing",
        ]
      }
    ]
  },

  "toolkit-setup": {
    id: "toolkit-setup",
    title: "Insurance Toolkits Setup",
    description: "Set up credentials for carrier toolkit access",
    learningObjectives: [
      "Understand what toolkits are available",
      "Set up your toolkit login credentials",
      "Know how to access carrier resources",
    ],
    sections: [
      {
        id: "toolkit-overview",
        title: "Carrier Toolkits Overview",
        duration: 3,
        content: `Insurance toolkits give you direct access to carrier resources and quoting systems.

WHAT TOOLKITS PROVIDE:
• Real-time product information
• Quoting and illustration tools
• Application submission portals
• Training and certification materials
• Marketing resources

HERITAGE PARTNER CARRIERS:
• American National
• Mutual of Omaha
• Transamerica
• Protective Life
• And more...

Each carrier has their own portal and credentials. Heritage provides a unified toolkit that connects to all carriers.`,
        keyPoints: [
          "Toolkits connect you to carrier systems",
          "Heritage provides unified access",
          "Credentials are provided after contracting",
        ]
      },
      {
        id: "toolkit-credentials",
        title: "Setting Up Your Credentials",
        duration: 2,
        content: `STEP 1: ACCESS TOOLKIT PORTAL
• Navigate to Tools > Insurance Toolkits
• Click "Set Up Credentials"

STEP 2: CREATE YOUR LOGIN
• Use your Heritage email address
• Create a strong password (12+ characters)
• Enable 2FA for toolkit access

STEP 3: VERIFY ACCESS
• Test login to the toolkit portal
• Explore the available carriers
• Bookmark frequently used tools

NOTE: Full carrier access requires:
• Completed contracting (processing now)
• State appointments (5-10 business days)
• Product certifications (after training)

You can explore the toolkit interface now while appointments process.`,
        keyPoints: [
          "Use your Heritage email for setup",
          "Full access requires completed contracting",
          "Explore the interface while you wait",
        ]
      }
    ]
  },

  "contract-status": {
    id: "contract-status",
    title: "Track Contract Status",
    description: "Learn how to monitor your contracting progress",
    learningObjectives: [
      "Find your contract status dashboard",
      "Understand status indicators",
      "Know who to contact with questions",
    ],
    sections: [
      {
        id: "status-dashboard",
        title: "Your Status Dashboard",
        duration: 2,
        content: `Track your contracting progress in real-time from your dashboard.

FINDING YOUR STATUS:
• Go to Dashboard > My Contracting
• Or navigate to Documents > Contract Status

STATUS INDICATORS:

🟡 PENDING - Document submitted, awaiting review
🔵 IN PROGRESS - Currently being processed
🟢 COMPLETE - Step finished successfully
🔴 ACTION NEEDED - Your attention required

TYPICAL MILESTONES:
1. Application Received ✓
2. Documents Verified
3. Background Check
4. State Verification
5. Carrier Appointments
6. Ready to Sell!`,
        keyPoints: [
          "Check dashboard for real-time status",
          "Yellow means pending, green means complete",
          "Red requires your immediate action",
        ]
      },
      {
        id: "status-support",
        title: "Getting Help with Contracts",
        duration: 2,
        content: `COMMON QUESTIONS:

Q: How long does processing take?
A: Typically 2-3 weeks for full appointments

Q: What if my background check is delayed?
A: Contact HR - they can check on status

Q: Can I start selling before all carriers?
A: Yes! You can sell with appointed carriers while others process

SUPPORT CONTACTS:

Contracting Questions:
• Email: contracts@heritagels.org
• Phone: (630) 478-1835, Option 2

Background Check Issues:
• Email: hr@heritagels.org

Carrier Appointment Status:
• Check toolkit portal
• Contact carrier relations team

Set a calendar reminder to check status every 2-3 days.`,
        keyPoints: [
          "Processing takes 2-3 weeks typically",
          "Contact contracts team with questions",
          "Check status every few days",
        ]
      }
    ]
  },

  "crm-activation": {
    id: "crm-activation",
    title: "CRM Account Activation",
    description: "Activate and set up your CRM system",
    learningObjectives: [
      "Activate your CRM account",
      "Set up your login credentials",
      "Complete initial configuration",
    ],
    sections: [
      {
        id: "crm-importance",
        title: "Why CRM is Essential",
        duration: 2,
        content: `Your CRM (Customer Relationship Management) system is the backbone of your sales operation.

WHAT CRM DOES FOR YOU:
• Stores all client information securely
• Tracks your sales pipeline
• Manages follow-up reminders
• Records all communications
• Generates reports and insights

TOP PERFORMERS USE CRM TO:
• Never miss a follow-up
• Track every lead's status
• Identify their best opportunities
• Build long-term relationships
• Hit their sales goals consistently

Heritage agents who master CRM close 40% more deals!`,
        keyPoints: [
          "CRM is your sales command center",
          "Top performers rely on CRM daily",
          "Consistent use leads to better results",
        ]
      },
      {
        id: "crm-setup",
        title: "Activate Your CRM Now",
        duration: 3,
        content: `STEP 1: ACCESS CRM
• Go to Tools > CRM in the main navigation
• Click "Activate My Account"

STEP 2: SET UP CREDENTIALS
• Your username is your Heritage email
• Create a secure password
• Save credentials securely

STEP 3: INITIAL CONFIGURATION
• Add your photo (same as profile)
• Set your timezone
• Configure working hours
• Enable email sync (recommended)

STEP 4: VERIFY ACCESS
• Log in to confirm activation
• Explore the dashboard
• Check the mobile app (download from app store)

You'll learn CRM features in depth during CRM Training modules.`,
        keyPoints: [
          "Use Heritage email as username",
          "Configure timezone and working hours",
          "Download mobile app for on-the-go access",
        ]
      }
    ]
  },

  "script-library": {
    id: "script-library",
    title: "Script Library Overview",
    description: "Tour the Heritage script library and resources",
    learningObjectives: [
      "Find the script library",
      "Understand script categories",
      "Know how to use scripts effectively",
    ],
    sections: [
      {
        id: "library-tour",
        title: "Exploring the Script Library",
        duration: 3,
        content: `The Heritage Script Library contains proven conversation frameworks for every situation.

FINDING THE LIBRARY:
• Navigate to Training > Script Library
• Or use Quick Access from your dashboard

SCRIPT CATEGORIES:

📞 PROSPECTING SCRIPTS
• Cold calling openers
• Referral request scripts
• Social media outreach

🤝 DISCOVERY SCRIPTS
• Needs analysis questions
• Fact-finding frameworks
• Building rapport

💼 PRESENTATION SCRIPTS
• Product explanations
• Feature-benefit connections
• Story frameworks

🎯 CLOSING SCRIPTS
• Assumptive closes
• Objection responses
• Follow-up sequences`,
        keyPoints: [
          "Scripts are organized by sales stage",
          "Multiple options for each situation",
          "Practice makes scripts sound natural",
        ]
      },
      {
        id: "using-scripts",
        title: "How to Use Scripts Effectively",
        duration: 2,
        content: `Scripts are guides, not robot instructions. Here's how to use them well.

THE RIGHT WAY:
✓ Learn the structure and flow
✓ Understand the psychology behind each part
✓ Practice until it feels natural
✓ Adapt language to your personality
✓ Listen and respond authentically

THE WRONG WAY:
✗ Reading word-for-word
✗ Ignoring client responses
✗ Sounding mechanical
✗ Skipping the practice step

PRACTICE TIPS:
• Use AI Council for roleplay
• Record yourself and listen back
• Practice with your mentor
• Start with one script, master it

You'll deep-dive into script structure and techniques on Day 2!`,
        keyPoints: [
          "Scripts guide, not dictate",
          "Practice until it sounds natural",
          "Adapt to your personality",
        ]
      }
    ]
  },

  // Day 1 - CRM Functions Module
  "crm-functions": {
    id: "crm-functions",
    title: "CRM Core Functions",
    description: "Master the essential CRM features you'll use daily",
    learningObjectives: [
      "Add and manage leads effectively",
      "Log activities and track interactions",
      "Set up automated follow-ups",
    ],
    sections: [
      {
        id: "managing-leads",
        title: "Managing Your Leads",
        duration: 5,
        content: `Your CRM is the heart of your business. Master these core functions.

ADDING NEW LEADS:
• Click "Add Lead" or use the quick-add button
• Enter: Name, phone, email, source
• Add notes about their situation
• Set initial status (New, Contacted, Qualified)

LEAD STATUSES:
🆕 New - Fresh lead, not yet contacted
📞 Contacted - Initial conversation made
✅ Qualified - Good fit, moving forward
📅 Appointment Set - Meeting scheduled
💼 In Progress - Application started
🎉 Won - Policy issued
❌ Lost - Not moving forward

ORGANIZING YOUR PIPELINE:
• Use tags to categorize leads (Referral, Facebook, etc.)
• Set priority levels for hot prospects
• Filter by status to focus your daily work`,
        keyPoints: [
          "Keep lead information complete and current",
          "Update status after every interaction",
          "Use tags for easy filtering",
        ]
      },
      {
        id: "activity-logging",
        title: "Logging Activities",
        duration: 4,
        content: `Every interaction should be logged. This builds your client history and protects you.

TYPES OF ACTIVITIES:
📞 Calls - Log outcomes, duration, next steps
📧 Emails - Auto-logged when sent from CRM
📝 Notes - Meeting notes, client preferences
📅 Appointments - Scheduled meetings and calls

HOW TO LOG A CALL:
1. Click the lead name
2. Select "Log Activity"
3. Choose activity type
4. Add detailed notes
5. Set follow-up if needed

BEST PRACTICES:
• Log immediately after each interaction
• Include specific details (names mentioned, concerns)
• Note the next action and when
• Be factual and professional in your notes`,
        keyPoints: [
          "Log every interaction immediately",
          "Include specific details",
          "Always set next action",
        ]
      },
      {
        id: "follow-ups",
        title: "Setting Up Follow-Ups",
        duration: 3,
        content: `Consistent follow-up is what separates top producers from the rest.

FOLLOW-UP FEATURES:
• One-click scheduling after calls
• Automated reminder emails
• Task lists organized by due date
• Calendar integration

SETTING A FOLLOW-UP:
1. Choose follow-up date and time
2. Add a note about what to discuss
3. Select reminder type (email, notification)
4. Save and move to next lead

FOLLOW-UP CADENCE TIPS:
• Hot leads: Follow up within 24 hours
• Warm leads: 2-3 day intervals
• Nurture: Weekly touchpoints
• Application in progress: Daily check-ins

Never let a lead go cold - your CRM keeps you on track!`,
        keyPoints: [
          "Set follow-ups immediately",
          "Match frequency to lead temperature",
          "Review your task list daily",
        ]
      }
    ]
  },

  // Day 1 - Product Basics Modules
  "whole-life-basics": {
    id: "whole-life-basics",
    title: "Whole Life Insurance Basics",
    description: "Introduction to permanent life insurance and cash value",
    learningObjectives: [
      "Understand how whole life differs from term",
      "Explain cash value basics",
      "Identify ideal whole life candidates",
    ],
    sections: [
      {
        id: "whole-life-overview",
        title: "What is Whole Life Insurance?",
        duration: 4,
        content: `Whole life insurance provides lifelong protection with a guaranteed savings component.

KEY FEATURES:
• Coverage lasts your entire life (not just a term)
• Premiums stay level forever
• Builds guaranteed cash value
• May pay dividends (participating policies)

HOW IT WORKS:
Part of each premium goes toward:
1. Insurance coverage (death benefit)
2. Cash value accumulation
3. Company expenses

Over time, your cash value grows tax-deferred, creating an asset you can access.

WHOLE LIFE vs TERM:
Term = Renting coverage (temporary)
Whole Life = Owning coverage (permanent)

Think of it like renting an apartment vs buying a home - both provide shelter, but one builds equity.`,
        keyPoints: [
          "Coverage lasts your entire life",
          "Builds guaranteed cash value",
          "Premiums never increase",
        ]
      },
      {
        id: "ideal-candidates",
        title: "Who Needs Whole Life?",
        duration: 3,
        content: `Whole life isn't for everyone. Here's who benefits most.

IDEAL CANDIDATES:
✓ Permanent needs (special needs dependents, estate planning)
✓ Those who want guaranteed cash value
✓ Higher income individuals seeking tax advantages
✓ Business owners for key person insurance
✓ People who've maxed other retirement accounts

NOT IDEAL FOR:
✗ Those who only need coverage for a specific period
✗ Budget-conscious families needing maximum coverage
✗ Young families with temporary high expenses

QUESTIONS TO ASK:
• Is your protection need permanent or temporary?
• Are you looking to build tax-advantaged savings?
• What's your monthly budget for insurance?

Match the product to the need - that's the Heritage way.`,
        keyPoints: [
          "Best for permanent protection needs",
          "Appeals to higher-income clients",
          "Always determine need duration first",
        ]
      }
    ]
  },

  "term-life-basics": {
    id: "term-life-basics",
    title: "Term Life Insurance Basics",
    description: "Introduction to affordable temporary coverage",
    learningObjectives: [
      "Understand term life structure",
      "Know common term lengths",
      "Identify ideal term life candidates",
    ],
    sections: [
      {
        id: "term-overview",
        title: "What is Term Life Insurance?",
        duration: 4,
        content: `Term life insurance provides pure protection for a specific period at the lowest cost.

KEY FEATURES:
• Coverage for a set term (10, 15, 20, 30 years)
• Level premiums during the term
• No cash value accumulation
• Most affordable type of life insurance

HOW IT WORKS:
1. You choose a coverage amount (death benefit)
2. You select a term length
3. You pay level premiums during the term
4. If you die during the term, beneficiaries receive the death benefit
5. If you outlive the term, coverage ends (or renews at higher rates)

WHY TERM IS POPULAR:
• Maximum coverage for minimum cost
• Simple to understand
• Perfect for temporary needs
• Can often convert to permanent coverage`,
        keyPoints: [
          "Pure protection, no cash value",
          "Most affordable option",
          "Coverage ends when term expires",
        ]
      },
      {
        id: "term-candidates",
        title: "Who Needs Term Life?",
        duration: 3,
        content: `Term life is the right choice for most families with temporary protection needs.

IDEAL CANDIDATES:
✓ Young families with children at home
✓ Homeowners with mortgages
✓ Couples with dual income dependency
✓ Those with student loans or debts
✓ Budget-conscious clients needing coverage

COMMON USE CASES:
• Cover mortgage balance (match term to mortgage)
• Income replacement until kids graduate
• Pay off debts if something happens
• Supplement employer-provided coverage

RULE OF THUMB:
Most families need 10-12x annual income in coverage.
A 35-year-old earning $75,000 might need $750,000-$900,000.

Term lets them get proper coverage affordably.`,
        keyPoints: [
          "Best for temporary protection needs",
          "Ideal for young families",
          "Match term length to need duration",
        ]
      }
    ]
  },

  "iul-basics": {
    id: "iul-basics",
    title: "IUL Insurance Basics",
    description: "Introduction to Indexed Universal Life insurance",
    learningObjectives: [
      "Understand IUL structure",
      "Explain index crediting basics",
      "Know IUL pros and cons",
    ],
    sections: [
      {
        id: "iul-overview",
        title: "What is IUL?",
        duration: 5,
        content: `Indexed Universal Life (IUL) is permanent life insurance with cash value linked to market indexes.

KEY FEATURES:
• Permanent coverage (like whole life)
• Flexible premiums and death benefits
• Cash value grows based on index performance
• Downside protection with 0% floor
• Upside limited by caps or participation rates

HOW INDEX CREDITING WORKS:
Your cash value growth is tied to a market index (like S&P 500), but with limits:

FLOOR: The minimum you'll earn (typically 0%)
• Even if the market drops 30%, you lose nothing

CAP: The maximum you can earn (typically 8-12%)
• If the market gains 20%, you earn up to the cap

PARTICIPATION RATE: % of index gain you receive
• If rate is 80% and index gains 10%, you get 8%

This creates upside potential with downside protection.`,
        keyPoints: [
          "Permanent coverage with flexible premiums",
          "Growth linked to market index",
          "Protected from market losses (0% floor)",
        ]
      },
      {
        id: "iul-candidates",
        title: "Who Benefits from IUL?",
        duration: 4,
        content: `IUL is a sophisticated product for specific client profiles.

IDEAL CANDIDATES:
✓ Higher income earners ($150k+)
✓ Those who've maxed 401k/IRA contributions
✓ Business owners seeking tax-advantaged growth
✓ People wanting permanent coverage with growth potential
✓ Those with longer time horizons (10+ years)

IUL BENEFITS:
• Tax-deferred growth
• Tax-free policy loans
• Death benefit for beneficiaries
• Flexibility in premiums
• No direct market loss exposure

IUL CONSIDERATIONS:
• Higher costs than term insurance
• Caps limit upside potential
• Complex product - requires explanation
• Best with proper funding over time

IUL is powerful but not for everyone. Match carefully to client needs and sophistication.`,
        keyPoints: [
          "Best for higher-income clients",
          "Requires proper funding strategy",
          "Explain caps and floors clearly",
        ]
      }
    ]
  },

  "annuities-basics": {
    id: "annuities-basics",
    title: "Annuities Basics",
    description: "Introduction to retirement income products",
    learningObjectives: [
      "Understand what annuities are",
      "Know the main annuity types",
      "Identify ideal annuity candidates",
    ],
    sections: [
      {
        id: "annuity-overview",
        title: "What is an Annuity?",
        duration: 4,
        content: `An annuity is a contract that provides guaranteed income, typically for retirement.

BASIC CONCEPT:
You give an insurance company money (premium), and they guarantee to pay you back over time (annuitization), often for life.

TWO PHASES:
1. ACCUMULATION: Your money grows tax-deferred
2. DISTRIBUTION: You receive regular income payments

MAIN TYPES:

FIXED ANNUITIES:
• Guaranteed interest rate
• Safe, predictable growth
• Good for conservative investors

INDEXED ANNUITIES:
• Growth linked to market index
• Principal protection
• Balance of safety and growth potential

VARIABLE ANNUITIES:
• Invested in market subaccounts
• Higher risk and potential reward
• No principal guarantee

Each type serves different client needs and risk tolerances.`,
        keyPoints: [
          "Annuities provide guaranteed income",
          "Tax-deferred growth during accumulation",
          "Different types for different risk profiles",
        ]
      },
      {
        id: "annuity-candidates",
        title: "Who Needs Annuities?",
        duration: 3,
        content: `Annuities solve specific retirement planning challenges.

IDEAL CANDIDATES:
✓ Pre-retirees (50-65) accumulating for retirement
✓ Retirees seeking guaranteed lifetime income
✓ Those worried about outliving their money
✓ Conservative investors wanting principal protection
✓ People who've maxed other retirement accounts

KEY BENEFITS:
• Guaranteed income for life (can't outlive it)
• Tax-deferred growth
• Principal protection (fixed/indexed)
• Death benefit for beneficiaries

CONSIDERATIONS:
• Surrender charges if withdrawn early
• Less liquid than other investments
• Complex products requiring explanation
• Fees vary significantly by product

Annuities are powerful retirement tools when matched to the right client situation.`,
        keyPoints: [
          "Best for retirement income planning",
          "Guaranteed income you can't outlive",
          "Explain surrender charges clearly",
        ]
      }
    ]
  },

  "script-structure": {
    id: "script-structure",
    title: "Understanding Script Structure",
    description: "Learn the framework behind every effective sales script",
    learningObjectives: [
      "Understand the flow of a good script",
      "Know the purpose of each section",
      "Apply structure to any conversation",
    ],
    sections: [
      {
        id: "script-framework",
        title: "The Script Framework",
        duration: 4,
        content: `Every effective script follows a proven structure. Master the framework, and you can handle any conversation.

THE 5-PART STRUCTURE:

1. OPENER (30 seconds)
• Introduce yourself warmly
• State your purpose clearly
• Ask permission to continue
• Build initial rapport

2. DISCOVERY (5-10 minutes)
• Ask open-ended questions
• Listen actively
• Understand their situation
• Identify needs and concerns

3. PRESENTATION (5-8 minutes)
• Connect features to their needs
• Use stories and examples
• Address concerns proactively
• Check for understanding

4. HANDLING OBJECTIONS (varies)
• Acknowledge the concern
• Clarify if needed
• Address with empathy
• Confirm resolution

5. CLOSE (2-3 minutes)
• Summarize key points
• Ask for the decision
• Handle final questions
• Next steps clear`,
        keyPoints: [
          "Every script has 5 key parts",
          "Discovery is the most important",
          "Always close with clear next steps",
        ]
      },
      {
        id: "adapting-scripts",
        title: "Adapting to Each Client",
        duration: 3,
        content: `The best agents use scripts as a framework, not a prison.

READING YOUR CLIENT:

FAST-PACED CLIENTS:
• Get to the point quickly
• Skip small talk
• Present options efficiently
• Respect their time

DETAIL-ORIENTED CLIENTS:
• Provide thorough explanations
• Show the numbers
• Answer all questions fully
• Give time to process

RELATIONSHIP-FOCUSED CLIENTS:
• Build rapport first
• Share relevant stories
• Show genuine interest
• Don't rush

ADAPTING THE SCRIPT:
• Keep the structure
• Adjust the pace
• Change your examples
• Match their communication style

The script is your guide. Your authentic connection is what closes.`,
        keyPoints: [
          "Adapt style to client personality",
          "Keep structure, change delivery",
          "Authenticity beats perfection",
        ]
      }
    ]
  },

  // Day 2 - Script Mastery Curriculum
  "script-credibility": {
    id: "script-credibility",
    title: "Building Credibility & Trust",
    description: "Master the opening techniques that establish instant credibility",
    learningObjectives: [
      "Open conversations with confidence",
      "Establish professional credibility quickly",
      "Create trust from the first moment",
    ],
    sections: [
      {
        id: "credibility-foundation",
        title: "The Foundation of Trust",
        duration: 5,
        content: `Trust is earned in the first 30 seconds of a conversation.

WHY CREDIBILITY MATTERS:
• People buy from people they trust
• First impressions are lasting impressions
• Credibility opens doors to deeper conversations

THE 4 PILLARS OF CREDIBILITY:
1. Professional Introduction - State your name, company, and purpose clearly
2. Social Proof - Reference your experience and client successes
3. Industry Knowledge - Demonstrate expertise without lecturing
4. Authentic Interest - Show genuine care for their situation

OPENING FRAMEWORK:
"Hi [Name], this is [Your Name] with Heritage Life Insurance. I specialize in helping [target audience] protect their families and build financial security. [Mutual connection/referral source] suggested we connect..."`,
        keyPoints: [
          "Trust is built in the first 30 seconds",
          "Use the 4 pillars of credibility",
          "Always lead with genuine interest",
        ]
      },
      {
        id: "credibility-scripts",
        title: "Credibility Scripts",
        duration: 5,
        content: `SCRIPT 1: THE PROFESSIONAL OPENER
"Good [morning/afternoon], this is [Name] with Heritage Life. I help families like yours ensure their loved ones are protected no matter what life brings. Do you have a moment to talk about your family's financial security?"

SCRIPT 2: THE REFERRAL OPENER
"Hi [Name], [Referrer] mentioned you might be open to a conversation. They shared how much peace of mind they gained from our work together. I'd love to offer you the same experience."

SCRIPT 3: THE EXPERT OPENER
"[Name], I've been helping families in [area/industry] for [X] years, and I noticed many people aren't aware of how changes in [relevant topic] might affect their coverage needs. Can I share some insights?"

PRACTICE TIPS:
• Stand up when you speak - it improves energy
• Smile while talking - it comes through in your voice
• Practice until these feel like second nature`,
        keyPoints: [
          "Have 2-3 openers memorized",
          "Adapt based on context",
          "Confidence comes from practice",
        ]
      }
    ]
  },

  "script-rapport": {
    id: "script-rapport",
    title: "Building Rapport",
    description: "Learn conversation techniques that create genuine connection",
    learningObjectives: [
      "Build authentic rapport quickly",
      "Use active listening techniques",
      "Create meaningful connections",
    ],
    sections: [
      {
        id: "rapport-principles",
        title: "The Psychology of Rapport",
        duration: 5,
        content: `Rapport is the foundation of every successful client relationship.

WHAT IS RAPPORT?
A state of mutual understanding where people feel comfortable and connected.

WHY RAPPORT MATTERS IN INSURANCE:
• Insurance discussions involve personal topics
• People share sensitive financial information
• Trust enables honest needs assessment
• Strong rapport leads to referrals

THE RAPPORT EQUATION:
Rapport = Similarity + Empathy + Genuine Interest

KEY TECHNIQUES:
• Mirror their communication style
• Match their pace and energy
• Find common ground
• Use their name naturally
• Listen more than you talk (80/20 rule)`,
        keyPoints: [
          "Rapport = Similarity + Empathy + Interest",
          "Listen 80%, talk 20%",
          "Find genuine common ground",
        ]
      },
      {
        id: "rapport-scripts",
        title: "Rapport-Building Scripts",
        duration: 5,
        content: `SCRIPT 1: THE COMMON GROUND FINDER
"Before we dive into the details, I'd love to know a bit about you. What do you enjoy doing outside of work?"
[Listen actively, find connection points]
"That's great! I [share relevant personal connection]. It's always nice to work with someone who values [shared interest]."

SCRIPT 2: THE FAMILY CONNECTOR
"Tell me about your family. Who are the special people you want to make sure are always taken care of?"
[Let them share, show genuine interest]
"It sounds like [family member] means the world to you. That's exactly why we're having this conversation."

SCRIPT 3: THE EMPATHY BRIDGE
"I understand this topic isn't always easy to discuss. Many of my clients felt the same way before we talked. What made you decide to explore this now?"

ACTIVE LISTENING PHRASES:
• "That makes total sense..."
• "Tell me more about that..."
• "It sounds like [paraphrase]..."
• "What I'm hearing is..."`,
        keyPoints: [
          "Use open-ended questions",
          "Paraphrase to show understanding",
          "Share genuine connections",
        ]
      }
    ]
  },

  "script-coverage-questions": {
    id: "script-coverage-questions",
    title: "Coverage Discovery Questions",
    description: "Master the questions that uncover true insurance needs",
    learningObjectives: [
      "Ask effective discovery questions",
      "Uncover hidden insurance needs",
      "Guide clients to their own realizations",
    ],
    sections: [
      {
        id: "discovery-framework",
        title: "The Discovery Framework",
        duration: 5,
        content: `Great discovery is about helping clients see their own needs.

THE DISCOVERY MINDSET:
• You're a doctor diagnosing needs, not a salesperson pushing products
• Questions should guide clients to their own conclusions
• Listen for emotions, not just facts

THE HERITAGE DISCOVERY SEQUENCE:
1. SITUATION - Current coverage and life circumstances
2. IMPACT - What happens if something changes
3. PRIORITY - What matters most to protect
4. TIMELINE - When do they want protection in place

QUESTION TYPES:
• Open-ended: Encourage detailed responses
• Clarifying: Dig deeper into specifics
• Emotional: Connect to feelings and values
• Hypothetical: Help visualize scenarios`,
        keyPoints: [
          "Be a doctor, not a salesperson",
          "Use the SIPT sequence",
          "Listen for emotions, not just facts",
        ]
      },
      {
        id: "discovery-scripts",
        title: "Discovery Question Scripts",
        duration: 5,
        content: `SITUATION QUESTIONS:
• "Tell me about your current coverage. What do you have in place today?"
• "Walk me through what would happen financially if something happened to you tomorrow."
• "Who depends on your income right now?"

IMPACT QUESTIONS:
• "If you weren't here, how long could your family maintain their lifestyle?"
• "What would happen to your mortgage? Your children's education plans?"
• "How would your spouse manage both emotionally and financially?"

PRIORITY QUESTIONS:
• "Of everything we've discussed, what keeps you up at night?"
• "If you could only protect one thing, what would it be?"
• "What's the most important financial goal for your family?"

TIMELINE QUESTIONS:
• "When would you ideally want this protection in place?"
• "Is there anything happening soon that makes this more urgent?"
• "What would need to happen for you to feel comfortable moving forward?"`,
        keyPoints: [
          "Follow the natural sequence",
          "Let silence work for you",
          "Take notes and refer back",
        ]
      }
    ]
  },

  "script-premium-framework": {
    id: "script-premium-framework",
    title: "Premium Discussion Framework",
    description: "Learn to present pricing in a value-focused way",
    learningObjectives: [
      "Present premiums without sticker shock",
      "Anchor value before price",
      "Handle budget objections confidently",
    ],
    sections: [
      {
        id: "value-before-price",
        title: "Value Before Price",
        duration: 5,
        content: `Never discuss price without first establishing value.

THE PREMIUM PSYCHOLOGY:
• Price objections are really value objections
• People pay for things they value
• Context determines perception of cost

THE VALUE ANCHOR SEQUENCE:
1. RECAP needs and priorities they shared
2. QUANTIFY the protection amount needed
3. COMPARE to alternatives (risk of not having coverage)
4. PRESENT as an investment in family security
5. BREAK DOWN to daily/weekly cost

FRAMING EXAMPLES:
• "$2 per day" sounds different than "$60 per month"
• "Less than your Netflix subscription" creates context
• "For the price of a cup of coffee" makes it tangible`,
        keyPoints: [
          "Always establish value first",
          "Use relatable cost comparisons",
          "Break down to daily/weekly amounts",
        ]
      },
      {
        id: "premium-scripts",
        title: "Premium Presentation Scripts",
        duration: 5,
        content: `SCRIPT 1: THE VALUE RECAP
"Based on everything you've shared, you want to make sure [spouse] and [children] can stay in your home, maintain their lifestyle, and have money for [priorities]. We're looking at protecting [coverage amount]. Does that feel right?"
[Wait for confirmation]
"The investment to make that happen is [monthly amount], which works out to about [daily amount] per day."

SCRIPT 2: THE COMPARISON FRAME
"Think about what you spend on [relatable expense] each month. For about the same amount, you're giving your family complete peace of mind. Which would you rather have if something unexpected happened?"

SCRIPT 3: THE BUDGET BRIDGE
"I understand budget is a consideration. Let me ask - if we could find a way to fit this into your budget, would you want to move forward with protecting your family today?"
[If yes, explore options like adjusting coverage, term length, or payment frequency]

HANDLING "IT'S TOO EXPENSIVE":
"I hear you. Let's make sure we're comparing apples to apples. What would it cost your family if you had NO coverage? What's the real price of not having this protection?"`,
        keyPoints: [
          "Recap value before stating price",
          "Use relatable comparisons",
          "Always bridge to solutions",
        ]
      }
    ]
  },

  "script-medical-underwriting": {
    id: "script-medical-underwriting",
    title: "Medical & Underwriting Questions",
    description: "Navigate sensitive health questions professionally",
    learningObjectives: [
      "Ask health questions sensitively",
      "Explain the underwriting process",
      "Handle health-related concerns",
    ],
    sections: [
      {
        id: "health-questions-approach",
        title: "Approaching Health Questions",
        duration: 5,
        content: `Health questions require sensitivity and professionalism.

WHY HEALTH QUESTIONS MATTER:
• Underwriting determines eligibility and rates
• Honest answers prevent future claim issues
• Better information leads to better recommendations

SETTING THE STAGE:
"[Name], I need to ask you some health questions. These help us find the best coverage options for your situation. Everything you share is confidential and helps me serve you better. Is that okay?"

KEY PRINCIPLES:
• Normalize the questions - everyone answers them
• Explain WHY you're asking
• Never judge or react negatively
• Take detailed notes for accuracy
• Offer to skip and return if needed`,
        keyPoints: [
          "Set expectations before asking",
          "Explain the purpose of questions",
          "Maintain confidentiality",
        ]
      },
      {
        id: "medical-scripts",
        title: "Medical Question Scripts",
        duration: 5,
        content: `SCRIPT 1: THE TRANSITION
"Now I'm going to ask about your health. This is standard for everyone and helps us match you with the right coverage. Ready?"

SCRIPT 2: CURRENT HEALTH
"How would you describe your overall health today? Any conditions you're currently managing or medications you take regularly?"

SCRIPT 3: MEDICAL HISTORY
"In the past 10 years, have you been hospitalized, had surgery, or been treated for any major health conditions?"

SCRIPT 4: FAMILY HISTORY
"What about your immediate family - parents and siblings? Any history of heart disease, cancer, or diabetes before age 60?"

SCRIPT 5: LIFESTYLE
"Do you use any tobacco products? How about alcohol - would you say you drink socially, regularly, or not at all?"

HANDLING CONCERNS:
"I understand you're worried this might affect your options. Let me assure you - many people with [condition] qualify for excellent coverage. Let's get all the information and see what's available."`,
        keyPoints: [
          "Use standardized question flow",
          "Reassure when concerns arise",
          "Be thorough and accurate",
        ]
      }
    ]
  },

  "script-application-walkthrough": {
    id: "script-application-walkthrough",
    title: "Application Walkthrough",
    description: "Guide clients smoothly through the application process",
    learningObjectives: [
      "Explain the application process clearly",
      "Make paperwork feel simple",
      "Handle common application questions",
    ],
    sections: [
      {
        id: "application-overview",
        title: "Making Applications Easy",
        duration: 5,
        content: `The application is where many sales stall - make it seamless.

APPLICATION PSYCHOLOGY:
• Paperwork creates friction
• Uncertainty causes hesitation
• Guided process feels easier

BEFORE STARTING THE APPLICATION:
1. Confirm their decision to move forward
2. Set expectations for time needed
3. Explain what information they'll need
4. Assure them you'll guide every step

WHAT THEY'LL NEED:
• Valid ID (driver's license)
• Beneficiary information
• Bank account for payments
• Basic health history
• Employment information`,
        keyPoints: [
          "Set clear expectations",
          "Have checklist ready",
          "Guide every step",
        ]
      },
      {
        id: "application-scripts",
        title: "Application Scripts",
        duration: 5,
        content: `SCRIPT 1: TRANSITION TO APPLICATION
"Excellent! Let's get your family protected. The application takes about [time]. I'll walk you through each section. Do you have your ID and bank information handy?"

SCRIPT 2: SECTION TRANSITIONS
"Great, we've completed the personal information section. Now we'll move to beneficiary details. Who would you like to receive the benefit?"

SCRIPT 3: EXPLAINING REQUIREMENTS
"The carrier requires [requirement] to process your application. This is standard procedure and protects everyone involved."

SCRIPT 4: ADDRESSING HESITATION
"I notice you paused there. What questions do you have about this section? I want to make sure you're completely comfortable before we continue."

SCRIPT 5: COMPLETION CELEBRATION
"Congratulations! Your application is submitted. Here's what happens next: [explain timeline]. You should receive [confirmation] within [timeframe]. How do you feel?"

HANDLING "I NEED TO THINK ABOUT IT":
"Of course. What specific part would you like to think about? Maybe I can address it right now so you can make the best decision for your family."`,
        keyPoints: [
          "Celebrate completion",
          "Explain next steps clearly",
          "Address hesitation immediately",
        ]
      }
    ]
  },

  "script-sensitive-info": {
    id: "script-sensitive-info",
    title: "Handling Sensitive Information",
    description: "Navigate delicate topics with care and professionalism",
    learningObjectives: [
      "Handle sensitive topics professionally",
      "Build trust with confidential information",
      "Navigate difficult conversations",
    ],
    sections: [
      {
        id: "sensitivity-principles",
        title: "Principles of Sensitivity",
        duration: 5,
        content: `Insurance discussions involve deeply personal topics.

SENSITIVE AREAS IN INSURANCE:
• Death and mortality
• Health conditions and diagnoses
• Financial difficulties
• Family relationships and dynamics
• Past mistakes or issues

PRINCIPLES FOR SENSITIVITY:
1. Normalize - "Many people feel this way..."
2. Validate - "That makes complete sense..."
3. Assure - "Everything stays confidential..."
4. Guide - "Let me help you through this..."
5. Support - "I'm here to help, not judge..."

BODY LANGUAGE (for in-person):
• Maintain comfortable eye contact
• Open, relaxed posture
• Nod to show understanding
• Pause to allow processing`,
        keyPoints: [
          "Normalize their feelings",
          "Validate their concerns",
          "Maintain strict confidentiality",
        ]
      },
      {
        id: "sensitive-scripts",
        title: "Scripts for Sensitive Situations",
        duration: 5,
        content: `SCRIPT 1: DISCUSSING DEATH
"I know talking about 'what if' scenarios isn't easy. But having this conversation now means your family never has to worry about finances during the hardest time of their lives."

SCRIPT 2: HEALTH CONDITIONS
"I appreciate you sharing that with me. Having [condition] doesn't mean you can't get coverage - it just helps us find the right fit. Let's explore your options together."

SCRIPT 3: FINANCIAL DIFFICULTIES
"I understand finances can be tight. That's actually why this matters even more - we need to find protection that fits your budget while covering what's most important."

SCRIPT 4: FAMILY DYNAMICS
"Family situations can be complex. Whatever your situation, we can structure this to work exactly how you want. What's most important to you?"

SCRIPT 5: PAST ISSUES
"Thank you for being honest with me. That transparency helps me serve you better. Let's focus on finding the best path forward from where you are today."

WHEN EMOTIONS ARISE:
"Take your time. These are important topics, and it's completely normal to have feelings about them. I'm here whenever you're ready to continue."`,
        keyPoints: [
          "Lead with empathy",
          "Offer space for emotions",
          "Focus on moving forward",
        ]
      }
    ]
  },

  "script-security-compliance": {
    id: "script-security-compliance",
    title: "Security & Compliance Scripts",
    description: "Handle security verifications and compliance requirements smoothly",
    learningObjectives: [
      "Explain security measures clearly",
      "Handle compliance requirements professionally",
      "Build trust through transparency",
    ],
    sections: [
      {
        id: "security-framework",
        title: "Security & Compliance Overview",
        duration: 5,
        content: `Security protocols protect both clients and agents.

WHY SECURITY MATTERS:
• Protects client personal information
• Prevents identity theft and fraud
• Meets regulatory requirements
• Builds client confidence

COMMON COMPLIANCE REQUIREMENTS:
• Identity verification
• Recording disclosures
• Suitability documentation
• Privacy acknowledgments
• Electronic signature consent

HOW TO PRESENT SECURITY:
• Frame as protection, not inconvenience
• Explain the benefit to them
• Be confident and matter-of-fact
• Never skip required steps`,
        keyPoints: [
          "Frame security as protection",
          "Be confident and clear",
          "Never skip compliance steps",
        ]
      },
      {
        id: "security-scripts",
        title: "Security & Compliance Scripts",
        duration: 5,
        content: `SCRIPT 1: IDENTITY VERIFICATION
"Before we continue, I need to verify your identity - this protects your information and ensures no one else can access your policy. Can you confirm your [date of birth/last 4 SSN]?"

SCRIPT 2: RECORDING DISCLOSURE
"I want to let you know this call may be recorded for quality and training purposes. This helps us serve you better. Is that okay with you?"

SCRIPT 3: PRIVACY ACKNOWLEDGMENT
"Heritage Life takes your privacy seriously. Your information is encrypted and only used for your policy. Here's our privacy policy - any questions before we proceed?"

SCRIPT 4: E-SIGNATURE CONSENT
"We use electronic signatures for convenience and security. You'll receive a secure link to sign your documents. This is just as legally valid as a physical signature and keeps your records safe."

SCRIPT 5: ADDRESSING CONCERNS
"I understand the concern about sharing personal information. Here's how we protect it: [explain encryption, limited access, compliance standards]. Your security is our priority."

IF THEY REFUSE REQUIRED STEPS:
"I completely understand your hesitation. Unfortunately, [requirement] is mandatory to proceed - it's for your protection. Would it help if I explained exactly why this is needed?"`,
        keyPoints: [
          "Explain benefits of each requirement",
          "Be matter-of-fact about requirements",
          "Address concerns transparently",
        ]
      }
    ]
  },

  "script-closing-techniques": {
    id: "script-closing-techniques",
    title: "Closing Techniques",
    description: "Master ethical closing techniques that guide decisions",
    learningObjectives: [
      "Close confidently and ethically",
      "Recognize buying signals",
      "Guide clients to decisions",
    ],
    sections: [
      {
        id: "closing-philosophy",
        title: "The Heritage Closing Philosophy",
        duration: 5,
        content: `Closing is helping clients make the decision they already want to make.

THE TRUTH ABOUT CLOSING:
• Closing isn't manipulation - it's guidance
• If you've done discovery well, closing is natural
• People want help making important decisions
• Not closing can leave families unprotected

BUYING SIGNALS TO WATCH FOR:
• Asking detailed questions about coverage
• Discussing specific scenarios
• Bringing up family members by name
• Asking about next steps
• Leaning forward, nodding (in person)

THE CLOSING MINDSET:
You're not asking them to buy - you're confirming they want to protect their family. Every day without coverage is a risk.`,
        keyPoints: [
          "Closing is guidance, not pressure",
          "Watch for buying signals",
          "Uncovered families are at risk",
        ]
      },
      {
        id: "closing-scripts",
        title: "Closing Scripts",
        duration: 5,
        content: `SCRIPT 1: THE ASSUMPTIVE CLOSE
"Based on everything we discussed, the [plan name] is the perfect fit for your family. Let's get the paperwork started so you're protected by [date]. I'll just need your ID to begin."

SCRIPT 2: THE CHOICE CLOSE
"We've identified two great options for you - the $500,000 term or the $750,000 term. Which one feels right for your family's needs?"

SCRIPT 3: THE SUMMARY CLOSE
"Let me make sure I have this right. You want to protect [spouse/children], cover [mortgage/debt], and ensure [specific goal]. The [plan] does all of that for [price]. Ready to make it official?"

SCRIPT 4: THE URGENCY CLOSE
"I want to mention - your health and rates are locked in when we submit. Since health can change unexpectedly, there's real value in getting this done today. Shall we proceed?"

SCRIPT 5: THE DIRECT CLOSE
"[Name], I've enjoyed our conversation and I believe this coverage is exactly what your family needs. Can we move forward with the application today?"

AFTER THE CLOSE:
Always confirm the decision, explain next steps, and express genuine appreciation.`,
        keyPoints: [
          "Use the close that fits naturally",
          "Be direct and confident",
          "Confirm and appreciate",
        ]
      }
    ]
  },

  "script-closing-old-policies": {
    id: "script-closing-old-policies",
    title: "Addressing Existing Coverage",
    description: "Ethically navigate conversations about existing policies",
    learningObjectives: [
      "Evaluate existing coverage fairly",
      "Present upgrades ethically",
      "Avoid improper replacement practices",
    ],
    sections: [
      {
        id: "existing-coverage-approach",
        title: "Approaching Existing Coverage",
        duration: 5,
        content: `Handling existing coverage requires ethics and care.

COMPLIANCE WARNING:
• Never encourage replacement without valid reason
• "Twisting" (replacing for commission) is illegal
• Document all replacement justifications
• Some states require replacement forms

VALID REASONS TO CONSIDER REPLACEMENT:
• Significantly better rates for same coverage
• Better coverage at same or lower cost
• Coverage gaps in existing policy
• Policy no longer matches client needs
• Better financial strength rating

INVALID REASONS:
• Simply to earn commission
• The policy is "old" (age alone isn't reason)
• To meet sales quotas
• Because you don't like the other company`,
        keyPoints: [
          "Never replace just for commission",
          "Document valid reasons",
          "Always act in client's best interest",
        ]
      },
      {
        id: "existing-coverage-scripts",
        title: "Existing Coverage Scripts",
        duration: 5,
        content: `SCRIPT 1: REVIEWING EXISTING COVERAGE
"Tell me about your current coverage. What do you have in place? Let's make sure it still fits your needs before we discuss anything else."

SCRIPT 2: IDENTIFYING GAPS
"Your current policy covers [amount] which was great when you got it. But with [life changes], you may have gaps. Let's look at what's missing."

SCRIPT 3: SUPPLEMENT VS. REPLACE
"Rather than replacing your existing policy, which does have value, let's look at supplementing it to fill the gaps. This gives you the best of both."

SCRIPT 4: BETTER RATES AVAILABLE
"Based on your current health status, you may qualify for better rates now than when you originally purchased. Would you like me to run some numbers to compare?"

SCRIPT 5: ETHICAL REPLACEMENT
"After reviewing everything, I believe a new policy would serve you better because [specific reasons]. However, I want to be clear - keep your current policy in force until the new one is approved and delivered."

CRITICAL REMINDERS:
• Never tell them to cancel existing coverage immediately
• Always compare policies side by side
• Document why replacement is in their interest
• Some replacements require cooling-off periods`,
        keyPoints: [
          "Review existing coverage thoroughly",
          "Consider supplementing vs. replacing",
          "Keep old policy until new one is active",
        ]
      }
    ]
  },

  "script-client-checkin": {
    id: "script-client-checkin",
    title: "Client Check-In Scripts",
    description: "Build lasting relationships through regular check-ins",
    learningObjectives: [
      "Schedule regular client check-ins",
      "Uncover new opportunities",
      "Generate referrals naturally",
    ],
    sections: [
      {
        id: "checkin-importance",
        title: "The Power of Check-Ins",
        duration: 5,
        content: `Client check-ins are the secret weapon of top producers.

WHY CHECK-INS MATTER:
• Clients have evolving needs
• Life changes create coverage gaps
• Satisfied clients provide referrals
• Retention is easier than acquisition

WHEN TO CHECK IN:
• 30 days post-purchase
• Policy anniversary
• Major life events
• Annually at minimum
• After industry changes

THE CHECK-IN MINDSET:
This isn't a sales call - it's a service call. You're making sure they're still protected properly.`,
        keyPoints: [
          "Check-ins are service, not sales",
          "Life changes create opportunities",
          "Happy clients refer others",
        ]
      },
      {
        id: "checkin-scripts",
        title: "Check-In Scripts",
        duration: 5,
        content: `SCRIPT 1: THE 30-DAY CHECK-IN
"Hi [Name], it's [You] from Heritage Life. I wanted to check in and see how you're feeling about your new coverage. Any questions that have come up since we spoke?"

SCRIPT 2: THE ANNUAL REVIEW
"[Name], it's been a year since we set up your coverage. I like to do an annual review to make sure everything still fits your needs. Have there been any changes in your life I should know about?"

SCRIPT 3: THE LIFE EVENT CHECK-IN
"I saw [congratulations on new baby/home purchase/etc]! That's wonderful news. These milestones often mean your coverage needs have changed. Would you like to do a quick review?"

SCRIPT 4: THE VALUE-ADD CHECK-IN
"Hi [Name], I came across some information about [relevant topic] and thought of you. Do you have a few minutes to discuss how this might affect your coverage?"

SCRIPT 5: THE REFERRAL REQUEST
"I'm so glad your coverage has given you peace of mind. I'm looking to help more families like yours. Who do you know that might benefit from a conversation like the one we had?"

FOLLOW-UP FRAMEWORK:
Always schedule the next check-in before ending the call. Block time weekly for client reviews.`,
        keyPoints: [
          "Schedule next check-in before hanging up",
          "Lead with value, not selling",
          "Ask for referrals naturally",
        ]
      }
    ]
  },

  "objections-overview": {
    id: "objections-overview",
    title: "Objection Handling Overview",
    description: "Understand the psychology behind objections and how to address them",
    learningObjectives: [
      "Understand why objections occur",
      "Identify common objection types",
      "Learn the objection handling framework",
    ],
    sections: [
      {
        id: "objection-psychology",
        title: "The Psychology of Objections",
        duration: 5,
        content: `Objections are not rejections - they're requests for more information.

WHAT OBJECTIONS REALLY MEAN:
• "I need to think about it" = "I need more information"
• "It's too expensive" = "I don't see the value yet"
• "I need to talk to my spouse" = "I'm not ready to decide alone"
• "I have coverage" = "I don't know if I need more"

THE OBJECTION OPPORTUNITY:
Every objection is a chance to:
• Understand their real concern
• Provide valuable information
• Build trust through patience
• Demonstrate your expertise

TYPES OF OBJECTIONS:
1. Price objections - concern about cost
2. Trust objections - concern about you/company
3. Need objections - don't see the need
4. Timing objections - not the right time
5. Authority objections - need someone else's input`,
        keyPoints: [
          "Objections are not rejections",
          "Each type requires different approach",
          "View objections as opportunities",
        ]
      },
      {
        id: "objection-framework",
        title: "The LAER Framework",
        duration: 5,
        content: `Use the LAER framework for any objection.

L - LISTEN
• Let them fully express their concern
• Don't interrupt or argue
• Show you're hearing them

A - ACKNOWLEDGE
• Validate their concern
• Show empathy and understanding
• "I completely understand..."

E - EXPLORE
• Ask clarifying questions
• Understand the real issue
• "Help me understand..."

R - RESPOND
• Address the specific concern
• Provide relevant information
• Guide toward resolution

EXAMPLE IN ACTION:
Objection: "I need to think about it."

LISTEN: "Of course, this is an important decision."
ACKNOWLEDGE: "I completely understand wanting to be thoughtful."
EXPLORE: "What specifically would you like to think about?"
RESPOND: [Address their specific concern]

This framework works for ANY objection you'll encounter.`,
        keyPoints: [
          "LAER: Listen, Acknowledge, Explore, Respond",
          "Never skip to responding",
          "Explore to find the real concern",
        ]
      }
    ]
  },

  "objections-practice": {
    id: "objections-practice",
    title: "Objection Handling Practice",
    description: "Practice responses to the most common insurance objections",
    learningObjectives: [
      "Respond to price objections",
      "Handle timing objections",
      "Overcome trust concerns",
    ],
    sections: [
      {
        id: "common-objections",
        title: "Top 5 Objections and Responses",
        duration: 5,
        content: `Master these five and you'll handle 90% of objections.

OBJECTION 1: "IT'S TOO EXPENSIVE"
Response: "I hear you. Let me ask - what would be affordable for you? Also, let's look at what NOT having coverage could cost your family. What's the real price of being unprotected?"

OBJECTION 2: "I NEED TO THINK ABOUT IT"
Response: "Absolutely. What specifically would you like to think about? Maybe I can address it right now so you can make the best decision for your family."

OBJECTION 3: "I NEED TO TALK TO MY SPOUSE"
Response: "That's great that you make decisions together. Can we schedule a time when both of you can be on the call? I'd love to answer their questions too."

OBJECTION 4: "I ALREADY HAVE COVERAGE"
Response: "That's smart that you have something in place. When was the last time you reviewed it? Let's make sure it still matches your current needs."

OBJECTION 5: "NOW'S NOT A GOOD TIME"
Response: "I understand things are busy. Here's the thing - your family needs protection regardless of timing. What would need to change for it to be a good time?"`,
        keyPoints: [
          "Memorize these five responses",
          "Customize to your style",
          "Always redirect to value",
        ]
      },
      {
        id: "advanced-objections",
        title: "Advanced Objection Strategies",
        duration: 5,
        content: `For tougher objections, use these advanced techniques.

THE FEEL-FELT-FOUND TECHNIQUE:
"I understand how you feel. Many clients felt the same way. What they found was..."

THE ISOLATION TECHNIQUE:
"If we could solve [objection], would you be ready to move forward today?"
This identifies if it's the real concern or a smokescreen.

THE REVERSAL TECHNIQUE:
"That's exactly why you need this. Because [reframe objection as reason to buy]."

THE THIRD-PARTY STORY:
"I had a client in a similar situation. Here's what happened..."
Stories are more powerful than statistics.

THE TAKEAWAY:
"You know what, maybe this isn't the right fit for you right now. But let me ask - what would happen to your family if something happened tonight?"
Use sparingly - it's powerful.

OBJECTION YOU CAN'T OVERCOME:
If they truly can't afford it, don't push. Offer to stay in touch and revisit when their situation changes. Integrity matters more than any sale.`,
        keyPoints: [
          "Use advanced techniques sparingly",
          "Stories beat statistics",
          "Know when to walk away",
        ]
      }
    ]
  },

  "roleplay-feedback": {
    id: "roleplay-feedback",
    title: "Roleplay Self-Assessment",
    description: "Learn how to evaluate and improve your roleplay performance",
    learningObjectives: [
      "Self-assess roleplay performance",
      "Identify areas for improvement",
      "Create an improvement plan",
    ],
    sections: [
      {
        id: "self-assessment-framework",
        title: "Self-Assessment Framework",
        duration: 3,
        content: `After each roleplay, evaluate yourself honestly.

ASSESSMENT CATEGORIES:

OPENING (1-5):
• Did I establish credibility quickly?
• Was my introduction confident?
• Did I capture their attention?

RAPPORT (1-5):
• Did I build genuine connection?
• Was I listening more than talking?
• Did I find common ground?

DISCOVERY (1-5):
• Did I ask good questions?
• Did I uncover real needs?
• Did I let them do most of the talking?

PRESENTATION (1-5):
• Did I connect features to their needs?
• Was my value explanation clear?
• Did I handle objections well?

CLOSE (1-5):
• Did I recognize buying signals?
• Was my close confident?
• Did I ask for the business?`,
        keyPoints: [
          "Be honest in self-assessment",
          "Score each category 1-5",
          "Focus on weakest areas",
        ]
      },
      {
        id: "improvement-plan",
        title: "Creating Your Improvement Plan",
        duration: 3,
        content: `Turn assessments into action.

AFTER EACH ROLEPLAY:
1. Score yourself in each category
2. Identify your lowest score area
3. Practice that specific skill
4. Roleplay again focusing on improvement

WEEKLY IMPROVEMENT RHYTHM:
• Monday: Set focus skill for the week
• Daily: 15 min roleplay practice
• Friday: Assess week's progress
• Weekend: Review and plan next week

RESOURCES FOR IMPROVEMENT:
• AI Council - Unlimited practice
• Script Library - Reference materials
• Mentor - Real-world feedback
• Recording yourself - Self-observation

TRACK YOUR PROGRESS:
Keep a simple log of scores over time. You should see improvement week over week in your focus areas.

CELEBRATE WINS:
When you nail a category, acknowledge it! Then move to the next area for improvement.`,
        keyPoints: [
          "Focus on one area at a time",
          "Practice daily, assess weekly",
          "Track and celebrate progress",
        ]
      }
    ]
  },

  // Day 2 - First Steps
  "insurance-basics": {
    id: "insurance-basics",
    title: "Life Insurance Fundamentals",
    description: "Master the core concepts of life insurance",
    learningObjectives: [
      "Understand why people need life insurance",
      "Learn key terminology and concepts",
      "Know the main types of life insurance",
    ],
    sections: [
      {
        id: "why-insurance",
        title: "Why Life Insurance Matters",
        duration: 10,
        content: `Life insurance provides financial protection for loved ones when they need it most.

KEY PURPOSES:
• Income Replacement: Replace lost earnings for dependents
• Debt Protection: Pay off mortgage, loans, and other debts
• Final Expenses: Cover funeral costs and medical bills
• Legacy Building: Leave something for children or charities
• Business Continuation: Fund buy-sell agreements

THE PROTECTION GAP:
Many Americans are underinsured or have no coverage at all. The average household needs 10-12x annual income in coverage.

YOUR ROLE:
As an agent, you help families understand and address their protection needs before it's too late.`,
        keyPoints: [
          "Life insurance replaces income and pays debts",
          "Most families are underinsured",
          "You provide peace of mind to families",
        ]
      },
      {
        id: "key-terms",
        title: "Essential Terminology",
        duration: 10,
        content: `PARTIES TO A POLICY:
• Insured: Person whose life is covered
• Owner: Person who owns and controls the policy
• Beneficiary: Person who receives the death benefit

KEY TERMS:
• Premium: Payment to keep policy active
• Face Amount: Death benefit amount
• Cash Value: Savings component in permanent policies
• Rider: Additional feature added to base policy
• Underwriting: Process of evaluating risk

POLICY PHASES:
• Application: Gathering information
• Underwriting: Evaluating the risk
• Issue: Policy approved and delivered
• In-Force: Active coverage
• Claim: Death benefit requested`,
        keyPoints: [
          "Know the difference between insured, owner, beneficiary",
          "Cash value only exists in permanent policies",
          "Underwriting determines premium pricing",
        ]
      },
      {
        id: "policy-types",
        title: "Types of Life Insurance",
        duration: 10,
        content: `TERM LIFE:
• Coverage for specific period (10, 20, 30 years)
• Most affordable option
• No cash value
• Best for: Temporary needs (mortgage, kids' education)

WHOLE LIFE:
• Permanent coverage
• Guaranteed cash value growth
• Fixed premiums
• Best for: Lifetime protection, legacy planning

INDEXED UNIVERSAL LIFE (IUL):
• Permanent coverage
• Cash value tied to market index
• Flexible premiums
• Best for: Growth potential with protection

ANNUITIES:
• Not insurance, but related product
• Provides retirement income
• Can be immediate or deferred`,
        keyPoints: [
          "Term is affordable but temporary",
          "Whole life is permanent with guarantees",
          "IUL offers growth potential with flexibility",
        ]
      }
    ]
  },

  "compliance-intro": {
    id: "compliance-intro",
    title: "Compliance Fundamentals",
    description: "Understanding insurance regulations and your responsibilities",
    learningObjectives: [
      "Know why compliance matters",
      "Understand key regulatory requirements",
      "Learn best practices for staying compliant",
    ],
    sections: [
      {
        id: "why-compliance",
        title: "Why Compliance Matters",
        duration: 8,
        content: `Insurance is heavily regulated to protect consumers.

REGULATORY LANDSCAPE:
• State Insurance Departments regulate insurance
• Each state has its own laws and requirements
• Federal regulations also apply (AML, privacy)

CONSEQUENCES OF NON-COMPLIANCE:
• License suspension or revocation
• Fines and penalties
• Legal liability
• Damage to reputation
• Career-ending consequences

YOUR COMMITMENT:
As a licensed professional, you have ethical and legal obligations to clients and regulators.`,
        keyPoints: [
          "Insurance is regulated at the state level",
          "Non-compliance can end your career",
          "Protect yourself by following the rules",
        ]
      },
      {
        id: "key-requirements",
        title: "Key Compliance Requirements",
        duration: 12,
        content: `LICENSING:
• Maintain current state license(s)
• Complete continuing education requirements
• Report address changes and legal issues

SALES PRACTICES:
• Suitability: Recommend appropriate products
• Disclosure: Provide required information
• Documentation: Keep accurate records
• Representations: Be truthful in all communications

PROHIBITED PRACTICES:
• Twisting: Replacing policies for commission only
• Churning: Excessive policy replacements
• Misrepresentation: False or misleading statements
• Rebating: Giving illegal inducements

DOCUMENTATION:
• Document all client interactions
• Maintain signed forms and disclosures
• Keep records for required retention period`,
        keyPoints: [
          "Always maintain proper licensing",
          "Suitability is critical - right product for right client",
          "Document everything thoroughly",
        ]
      }
    ]
  },

  // Day 3 - Product Knowledge
  "term-life-deep": {
    id: "term-life-deep",
    title: "Term Life Insurance Deep Dive",
    description: "Comprehensive training on term life products, riders, and underwriting",
    learningObjectives: [
      "Understand term life insurance structure and benefits",
      "Learn about available riders and their use cases",
      "Master underwriting considerations for term products",
    ],
    sections: [
      {
        id: "term-basics",
        title: "Term Life Fundamentals",
        duration: 15,
        content: `Term life insurance provides death benefit protection for a specific period. It's the most affordable form of life insurance and ideal for temporary needs like mortgage protection or income replacement during working years.

KEY CONCEPTS:
• Level Term: Premium and death benefit stay constant
• Decreasing Term: Death benefit decreases over time
• Renewable Term: Can be renewed without new underwriting
• Convertible Term: Can be converted to permanent insurance`,
        keyPoints: [
          "Term provides affordable temporary protection",
          "Level term is most common for families",
          "Conversion options add valuable flexibility",
        ]
      },
      {
        id: "term-riders",
        title: "Term Life Riders",
        duration: 15,
        content: `Riders customize term policies to meet specific client needs.

COMMON RIDERS:
• Accelerated Death Benefit: Access funds if terminally ill
• Waiver of Premium: Premiums waived if disabled
• Child Term Rider: Covers children at low cost
• Return of Premium: Get premiums back if you outlive term
• Accidental Death Benefit: Extra benefit for accidental death`,
        keyPoints: [
          "ADB rider provides living benefits",
          "Waiver of premium protects against disability",
          "ROP adds savings component but increases cost",
        ]
      },
      {
        id: "term-underwriting",
        title: "Underwriting Considerations",
        duration: 15,
        content: `Understanding underwriting helps you set proper client expectations.

RISK CLASSES:
• Preferred Best: Excellent health, no tobacco, ideal build
• Preferred: Very good health, minor issues acceptable
• Standard: Average health, some conditions managed
• Substandard: Health issues requiring table ratings

FACTORS CONSIDERED:
• Age and gender
• Health history and current conditions
• Family medical history
• Lifestyle factors (tobacco, occupation, hobbies)
• Driving record and criminal history`,
        keyPoints: [
          "Risk class significantly impacts premium",
          "Full disclosure prevents future claim issues",
          "Medical exams typically required for larger amounts",
        ]
      }
    ]
  },

  "whole-life-deep": {
    id: "whole-life-deep",
    title: "Whole Life Insurance Mastery",
    description: "Understanding cash value, dividends, and policy loans",
    learningObjectives: [
      "Explain whole life insurance mechanics",
      "Understand cash value accumulation",
      "Master dividend options and policy loans",
    ],
    sections: [
      {
        id: "whole-basics",
        title: "Whole Life Fundamentals",
        duration: 20,
        content: `Whole life insurance provides permanent protection with guaranteed premiums, death benefit, and cash value growth.

GUARANTEES:
• Level Premium: Stays the same for life
• Death Benefit: Guaranteed minimum amount
• Cash Value: Guaranteed minimum growth rate

Unlike term, whole life builds equity that the policyholder can access during their lifetime.`,
        keyPoints: [
          "Whole life provides permanent, lifelong coverage",
          "Three guarantees: premium, death benefit, cash value",
          "More expensive than term but builds equity",
        ]
      },
      {
        id: "whole-dividends",
        title: "Dividends & Options",
        duration: 15,
        content: `Participating whole life policies may pay dividends based on company performance.

DIVIDEND OPTIONS:
• Cash Payment: Receive dividend as check
• Premium Reduction: Apply to reduce premiums
• Accumulate at Interest: Leave with company to earn interest
• Paid-Up Additions: Buy additional coverage
• One-Year Term: Purchase additional term coverage

Note: Dividends are not guaranteed.`,
        keyPoints: [
          "Dividends reflect company's favorable experience",
          "Paid-up additions are most growth-focused option",
          "Premium reduction helps if cash flow is tight",
        ]
      },
      {
        id: "whole-loans",
        title: "Policy Loans & Withdrawals",
        duration: 15,
        content: `Whole life cash value provides living benefits through loans and withdrawals.

POLICY LOANS:
• Borrow against cash value at guaranteed rates
• No credit check or application required
• Interest charged but no required repayment schedule
• Outstanding loans reduce death benefit

WITHDRAWALS:
• Partial surrender of cash value
• May have tax implications
• Permanently reduces cash value and death benefit`,
        keyPoints: [
          "Loans don't require credit approval",
          "Unpaid loans reduce death benefit",
          "Withdrawals may have tax consequences",
        ]
      }
    ]
  },

  "annuities-intro": {
    id: "annuities-intro",
    title: "Introduction to Annuities",
    description: "Fixed, variable, and indexed annuity fundamentals",
    learningObjectives: [
      "Understand annuity types and their purposes",
      "Explain accumulation vs. income phases",
      "Identify suitable clients for each annuity type",
    ],
    sections: [
      {
        id: "annuity-basics",
        title: "Annuity Fundamentals",
        duration: 15,
        content: `Annuities are contracts with insurance companies designed for retirement savings and income.

PHASES:
• Accumulation Phase: Money grows tax-deferred
• Annuitization Phase: Converts to income stream (optional)

KEY FEATURES:
• Tax-deferred growth
• No contribution limits (unlike 401k/IRA)
• Death benefit protection
• Optional guaranteed income riders`,
        keyPoints: [
          "Annuities provide tax-deferred retirement savings",
          "Suitable for clients who've maxed other options",
          "Death benefit protects beneficiaries",
        ]
      },
      {
        id: "annuity-types",
        title: "Types of Annuities",
        duration: 25,
        content: `FIXED ANNUITIES:
• Guaranteed interest rate for set period
• Principal protection
• Best for conservative investors

VARIABLE ANNUITIES:
• Invested in subaccounts (like mutual funds)
• Market risk and potential
• Securities licensed required to sell

FIXED INDEXED ANNUITIES (FIA):
• Interest linked to market index
• Principal protection (floor of 0%)
• Caps and participation rates limit upside
• Best for moderate risk tolerance`,
        keyPoints: [
          "Fixed = safety and guarantees",
          "Variable = growth potential with risk",
          "FIA = hybrid of protection and growth potential",
        ]
      }
    ]
  },

  // Day 4 - Sales
  "sales-methodology": {
    id: "sales-methodology",
    title: "Heritage Sales Methodology",
    description: "Learn our proven 5-step sales process",
    learningObjectives: [
      "Master the 5-step Heritage sales process",
      "Apply education-first principles",
      "Build trust through consultative selling",
    ],
    sections: [
      {
        id: "step-1-connect",
        title: "Step 1: Connect",
        duration: 10,
        content: `Build rapport and establish trust before discussing products.

TECHNIQUES:
• Find common ground
• Show genuine interest in their situation
• Listen more than you talk
• Match their communication style`,
        keyPoints: [
          "First impressions set the tone",
          "People buy from those they trust",
          "Authenticity matters more than techniques",
        ]
      },
      {
        id: "step-2-discover",
        title: "Step 2: Discover",
        duration: 10,
        content: `Ask questions to understand their complete financial picture.

KEY AREAS:
• Family situation and dependents
• Current financial obligations
• Existing coverage and gaps
• Goals and concerns
• Budget considerations`,
        keyPoints: [
          "Never assume - always ask",
          "Open-ended questions reveal more",
          "Take notes and confirm understanding",
        ]
      },
      {
        id: "step-3-educate",
        title: "Step 3: Educate",
        duration: 10,
        content: `Teach them about options - don't sell products.

APPROACH:
• Explain concepts in simple terms
• Use analogies and examples
• Show how options address their needs
• Let them draw conclusions`,
        keyPoints: [
          "Education builds trust and credibility",
          "Informed clients make better decisions",
          "Avoid jargon and technical terms",
        ]
      },
      {
        id: "step-4-recommend",
        title: "Step 4: Recommend",
        duration: 8,
        content: `Make a clear recommendation based on their needs.

FRAMEWORK:
• Summarize what you learned
• Connect recommendation to their goals
• Explain why this solution fits
• Be confident but not pushy`,
        keyPoints: [
          "Recommendation shows you listened",
          "Tie everything back to their stated needs",
          "Confidence inspires confidence",
        ]
      },
      {
        id: "step-5-guide",
        title: "Step 5: Guide to Decision",
        duration: 7,
        content: `Help them take the next step without pressure.

TECHNIQUES:
• Ask for their thoughts
• Address any remaining concerns
• Present clear next steps
• Make it easy to say yes`,
        keyPoints: [
          "Guide, don't push",
          "Address objections with empathy",
          "Clear next steps reduce friction",
        ]
      }
    ]
  },

  "objection-handling": {
    id: "objection-handling",
    title: "Objection Handling Framework",
    description: "Turn objections into opportunities with our LAER method",
    learningObjectives: [
      "Master the LAER objection handling framework",
      "Turn objections into opportunities",
      "Handle common objections confidently",
    ],
    sections: [
      {
        id: "laer-intro",
        title: "The LAER Method",
        duration: 15,
        content: `LAER is our proven framework for handling objections:

L - LISTEN: Hear them out completely without interrupting
A - ACKNOWLEDGE: Validate their concern sincerely
E - EXPLORE: Ask questions to understand the real issue
R - RESPOND: Address the concern directly and honestly

The goal is understanding, not overcoming.`,
        keyPoints: [
          "Listen fully before responding",
          "Acknowledgment builds trust",
          "Explore to find the real objection",
        ]
      },
      {
        id: "common-objections",
        title: "Common Objections",
        duration: 25,
        content: `"I need to think about it"
→ Explore what specifically needs consideration

"It's too expensive"
→ Explore their budget and priority level

"I have coverage through work"
→ Educate on portability and coverage gaps

"I don't believe in life insurance"
→ Understand their perspective and concerns

"My spouse needs to be involved"
→ Offer to schedule a joint conversation`,
        keyPoints: [
          "Every objection is a request for more information",
          "Price objections are often priority objections",
          "Never argue - seek to understand",
        ]
      }
    ]
  },

  // Day 5 - Compliance
  "compliance-fundamentals": {
    id: "compliance-fundamentals",
    title: "Insurance Compliance Fundamentals",
    description: "Understanding state and federal regulations",
    learningObjectives: [
      "Understand regulatory framework for insurance",
      "Know key compliance requirements",
      "Recognize compliance violations",
    ],
    sections: [
      {
        id: "regulatory-overview",
        title: "Regulatory Framework",
        duration: 20,
        content: `Insurance is primarily regulated at the state level.

KEY REGULATORS:
• State Insurance Departments
• NAIC (National Association of Insurance Commissioners)
• Federal oversight for specific areas (AML, securities)

LICENSING REQUIREMENTS:
• State-specific licensing required
• Continuing education mandated
• Appointment with carriers needed`,
        keyPoints: [
          "Each state has its own insurance department",
          "Must be licensed in client's state",
          "Continuing education maintains license",
        ]
      },
      {
        id: "compliance-requirements",
        title: "Key Compliance Requirements",
        duration: 25,
        content: `SUITABILITY:
• Recommendations must be suitable for client
• Document needs analysis
• Consider financial situation and goals

DISCLOSURE:
• Explain product features honestly
• Disclose compensation if required
• Provide required documentation

PROHIBITED PRACTICES:
• Twisting (inducing replacement for commission)
• Churning (excessive policy changes)
• Misrepresentation of products or carriers
• Rebating (sharing commission with client)`,
        keyPoints: [
          "Suitability is not optional",
          "When in doubt, disclose",
          "Violations can end your career",
        ]
      }
    ]
  },

  "ethics-training": {
    id: "ethics-training",
    title: "Ethics in Insurance Sales",
    description: "Learn the ethical standards and fiduciary responsibilities",
    learningObjectives: [
      "Understand ethical obligations",
      "Apply ethical decision-making",
      "Maintain professional integrity",
    ],
    sections: [
      {
        id: "ethical-foundations",
        title: "Ethical Foundations",
        duration: 20,
        content: `Our ethical standards exceed regulatory minimums.

CORE PRINCIPLES:
• Client's interest comes first
• Honesty in all representations
• Competence in our recommendations
• Confidentiality of client information
• Fair treatment of all parties`,
        keyPoints: [
          "Ethics go beyond compliance",
          "Short-term gains never justify ethical lapses",
          "Reputation is your most valuable asset",
        ]
      },
      {
        id: "ethical-dilemmas",
        title: "Handling Ethical Dilemmas",
        duration: 20,
        content: `DECISION FRAMEWORK:
1. Is it legal?
2. Is it compliant with regulations?
3. Is it consistent with company policy?
4. Would I be comfortable if it were public?
5. Is it in the client's best interest?

If any answer is "no" or "unsure" - STOP and seek guidance.`,
        keyPoints: [
          "Use the decision framework consistently",
          "When uncertain, escalate to compliance",
          "Document your decision-making process",
        ]
      }
    ]
  },

  "privacy-hipaa": {
    id: "privacy-hipaa",
    title: "Privacy & HIPAA Compliance",
    description: "Protecting client information and health data",
    learningObjectives: [
      "Understand privacy obligations",
      "Comply with HIPAA requirements",
      "Protect sensitive client data",
    ],
    sections: [
      {
        id: "privacy-basics",
        title: "Privacy Fundamentals",
        duration: 15,
        content: `Client information is confidential and protected by law.

PROTECTED INFORMATION:
• Personal identifiers (SSN, DOB, address)
• Financial information
• Health information (PHI)
• Family details

PROTECTION REQUIREMENTS:
• Secure storage and transmission
• Access only for business purpose
• Proper disposal of documents
• No unauthorized sharing`,
        keyPoints: [
          "All client info is confidential",
          "Secure handling is required by law",
          "Breaches have serious consequences",
        ]
      },
      {
        id: "hipaa-requirements",
        title: "HIPAA Compliance",
        duration: 20,
        content: `HIPAA protects health information in insurance transactions.

KEY REQUIREMENTS:
• Minimum necessary standard - only access what's needed
• Secure transmission of health data
• Proper authorization for disclosures
• Individual rights to access their information

COMMON VIOLATIONS:
• Discussing client health in public
• Unsecured email or fax transmission
• Improper disposal of medical records
• Sharing information without authorization`,
        keyPoints: [
          "Health information has extra protections",
          "Use secure methods for transmission",
          "Get proper authorization for disclosures",
        ]
      }
    ]
  },

  "suitability": {
    id: "suitability",
    title: "Suitability & Best Interest Standards",
    description: "Ensuring recommendations meet client needs",
    learningObjectives: [
      "Apply suitability standards",
      "Document suitability analysis",
      "Meet best interest requirements",
    ],
    sections: [
      {
        id: "suitability-standards",
        title: "Suitability Standards",
        duration: 25,
        content: `Every recommendation must be suitable for the client.

SUITABILITY FACTORS:
• Financial situation and needs
• Investment objectives
• Time horizon
• Risk tolerance
• Existing coverage
• Tax situation

DOCUMENTATION:
• Complete needs analysis
• Rationale for recommendation
• Client acknowledgment
• Alternative options considered`,
        keyPoints: [
          "Document the basis for recommendations",
          "Consider the whole financial picture",
          "Unsuitable sales can be reversed",
        ]
      }
    ]
  },

  "documentation": {
    id: "documentation",
    title: "Documentation Requirements",
    description: "Proper record-keeping practices",
    learningObjectives: [
      "Understand documentation requirements",
      "Maintain proper records",
      "Follow retention policies",
    ],
    sections: [
      {
        id: "doc-requirements",
        title: "What to Document",
        duration: 30,
        content: `Proper documentation protects you and the client.

REQUIRED DOCUMENTATION:
• Client fact-finding and needs analysis
• Recommendations made and rationale
• Products discussed and selected
• Disclosures provided
• Client questions and your responses
• Signatures and acknowledgments

RETENTION REQUIREMENTS:
• Typically 5-7 years minimum
• Some records kept permanently
• Secure storage required
• Proper destruction methods`,
        keyPoints: [
          "If it's not documented, it didn't happen",
          "Document at time of interaction",
          "Follow company retention policies",
        ]
      }
    ]
  },

  // Day 6 - Communication
  "communication-styles": {
    id: "communication-styles",
    title: "Understanding Communication Styles",
    description: "Adapt your communication to different personalities",
    learningObjectives: [
      "Identify communication style preferences",
      "Adapt your approach accordingly",
      "Build rapport with any personality type",
    ],
    sections: [
      {
        id: "disc-overview",
        title: "The Four Styles",
        duration: 20,
        content: `Understanding personality styles improves communication.

DOMINANT (D): Direct, results-oriented
• Get to the point quickly
• Focus on outcomes
• Be confident and decisive

INFLUENTIAL (I): Enthusiastic, relationship-focused
• Be friendly and warm
• Share stories and examples
• Allow time for discussion

STEADY (S): Patient, supportive
• Be calm and sincere
• Provide reassurance
• Don't rush the process

CONSCIENTIOUS (C): Analytical, detail-oriented
• Provide facts and data
• Be thorough and accurate
• Allow time for analysis`,
        keyPoints: [
          "No style is better than another",
          "Adapt your approach to their preference",
          "Watch for cues in their communication",
        ]
      },
      {
        id: "adapting-styles",
        title: "Adapting Your Approach",
        duration: 15,
        content: `IDENTIFYING STYLE:
• Listen to how they speak
• Notice their pace and energy
• Observe decision-making approach

ADAPTING:
• Match their pace initially
• Provide information in their preferred format
• Respect their decision process
• Build trust through understanding`,
        keyPoints: [
          "Listen before adapting",
          "Flexibility shows respect",
          "Everyone appreciates being understood",
        ]
      }
    ]
  },

  "email-writing": {
    id: "email-writing",
    title: "Effective Email Communication",
    description: "Write compelling emails that get responses",
    learningObjectives: [
      "Write clear, professional emails",
      "Increase response rates",
      "Maintain compliance in written communication",
    ],
    sections: [
      {
        id: "email-basics",
        title: "Email Best Practices",
        duration: 15,
        content: `Professional emails build credibility.

SUBJECT LINES:
• Clear and specific
• Include relevant details
• Avoid spam triggers

BODY:
• Get to the point quickly
• Use short paragraphs
• Include clear call to action
• Professional signature

COMPLIANCE:
• Include required disclosures
• No misleading statements
• Proper archiving`,
        keyPoints: [
          "Subject line determines if it's opened",
          "Clarity beats creativity",
          "Every email is a compliance record",
        ]
      },
      {
        id: "email-templates",
        title: "Email Templates",
        duration: 15,
        content: `Use approved templates as starting points.

FOLLOW-UP EMAIL:
Subject: Following up on our conversation
Body: Reference the conversation, summarize key points, provide next steps.

APPOINTMENT CONFIRMATION:
Subject: Confirmed: [Date/Time] - Life Insurance Review
Body: Confirm details, set expectations, provide prep if needed.

THANK YOU:
Subject: Thank you for your time today
Body: Express appreciation, summarize outcomes, outline next steps.`,
        keyPoints: [
          "Templates save time and ensure compliance",
          "Personalize for each recipient",
          "Always proofread before sending",
        ]
      }
    ]
  },

  "storytelling": {
    id: "storytelling",
    title: "Storytelling for Sales",
    description: "Use stories to connect emotionally with clients",
    learningObjectives: [
      "Understand the power of stories",
      "Structure effective stories",
      "Use stories ethically",
    ],
    sections: [
      {
        id: "story-power",
        title: "Why Stories Work",
        duration: 15,
        content: `Stories bypass resistance and create connection.

STORIES:
• Make concepts memorable
• Create emotional engagement
• Build trust through relatability
• Simplify complex ideas

TYPES OF STORIES:
• Client success stories (anonymized)
• Your own experiences
• Industry examples
• Analogies and metaphors`,
        keyPoints: [
          "Facts tell, stories sell",
          "Emotion drives decisions",
          "Authentic stories resonate most",
        ]
      },
      {
        id: "story-structure",
        title: "Story Structure",
        duration: 15,
        content: `EFFECTIVE STORY STRUCTURE:
1. Situation: Set the scene
2. Challenge: Introduce the problem
3. Action: What was done
4. Result: The outcome
5. Relevance: Connect to client

KEEP IT:
• Brief (60-90 seconds)
• Relevant to their situation
• Authentic and truthful
• Compliant (no specific guarantees)`,
        keyPoints: [
          "Keep stories concise",
          "Always tie back to the client",
          "Never make up stories",
        ]
      }
    ]
  },

  // Day 7 - Review
  "week-review": {
    id: "week-review",
    title: "Week 1 Knowledge Review",
    description: "Quick review of all concepts from Days 1-6",
    learningObjectives: [
      "Reinforce key concepts from Week 1",
      "Identify areas needing more study",
      "Prepare for final assessments",
    ],
    sections: [
      {
        id: "products-review",
        title: "Product Knowledge Review",
        duration: 10,
        content: `KEY PRODUCT CONCEPTS:
• Term Life: Temporary, affordable protection
• Whole Life: Permanent with cash value and guarantees
• IUL: Flexible with index-linked growth
• Annuities: Tax-deferred retirement savings

REMEMBER:
• Match products to client needs
• Understand pros and cons of each
• Know when each is appropriate`,
        keyPoints: [
          "Products solve specific needs",
          "No product is right for everyone",
          "Suitability is paramount",
        ]
      },
      {
        id: "sales-review",
        title: "Sales Process Review",
        duration: 10,
        content: `THE 5-STEP PROCESS:
1. Connect - Build rapport
2. Discover - Understand needs
3. Educate - Teach, don't sell
4. Recommend - Make clear suggestions
5. Guide - Help them decide

OBJECTION HANDLING (LAER):
• Listen fully
• Acknowledge concerns
• Explore the real issue
• Respond appropriately`,
        keyPoints: [
          "Process creates consistency",
          "Education builds trust",
          "Objections are opportunities",
        ]
      },
      {
        id: "compliance-review",
        title: "Compliance Review",
        duration: 10,
        content: `KEY COMPLIANCE AREAS:
• Suitability - Match solutions to needs
• Disclosure - Be honest and complete
• Privacy - Protect all client information
• Documentation - Record everything

ETHICAL STANDARDS:
• Client interest first
• Honesty in all dealings
• When in doubt, ask`,
        keyPoints: [
          "Compliance protects everyone",
          "Ethics exceed minimums",
          "Documentation is essential",
        ]
      }
    ]
  },

  // ============================================================================
  // DAYS 8-30: WEEK 2-4 MODULES
  // ============================================================================

  // Week 2 - Client Engagement Basics
  "lead-qualification": {
    id: "lead-qualification",
    title: "Lead Qualification Mastery",
    description: "Learn to identify and prioritize high-quality leads",
    sections: [
      {
        id: "lead-basics",
        title: "Understanding Lead Quality",
        duration: 15,
        content: `LEAD QUALITY FACTORS:
• Need - Do they need life insurance?
• Timing - Are they ready to act now?
• Authority - Can they make the decision?
• Budget - Can they afford coverage?

LEAD SCORING:
• Hot leads: All 4 factors present
• Warm leads: 2-3 factors present
• Cold leads: 1 or fewer factors`,
        keyPoints: [
          "Focus on quality over quantity",
          "Time is your most valuable resource",
          "Qualification saves everyone time",
        ]
      },
      {
        id: "qualification-questions",
        title: "Qualification Questions",
        duration: 15,
        content: `ESSENTIAL QUESTIONS:
1. "What prompted your interest in life insurance?"
2. "Do you currently have any coverage?"
3. "What's your timeline for making a decision?"
4. "Who else is involved in this decision?"
5. "What budget range are you considering?"

LISTENING FOR SIGNALS:
• Urgency indicators
• Life changes (marriage, baby, new job)
• Financial concerns`,
        keyPoints: [
          "Ask open-ended questions",
          "Listen more than you talk",
          "Take notes on key responses",
        ]
      },
      {
        id: "prioritization",
        title: "Lead Prioritization",
        duration: 15,
        content: `PRIORITY MATRIX:
• A-Leads: Contact within 5 minutes
• B-Leads: Contact within 24 hours
• C-Leads: Add to nurture sequence

DAILY WORKFLOW:
1. Review new leads first thing
2. Score and prioritize
3. Schedule follow-ups
4. Track in CRM`,
        keyPoints: [
          "Speed to lead matters",
          "Consistent follow-up wins",
          "Use your CRM religiously",
        ]
      }
    ],
    learningObjectives: [
      "Identify high-quality leads quickly",
      "Ask effective qualification questions",
      "Prioritize your pipeline effectively",
    ]
  },

  "crm-mastery": {
    id: "crm-mastery",
    title: "CRM Mastery Course",
    description: "Master the Heritage CRM for pipeline management",
    sections: [
      {
        id: "crm-overview",
        title: "CRM Overview",
        duration: 20,
        content: `YOUR CRM IS YOUR BUSINESS:
• Centralized client information
• Pipeline visibility
• Activity tracking
• Automated reminders

KEY FEATURES:
• Lead management
• Contact history
• Task scheduling
• Reporting dashboard`,
        keyPoints: [
          "If it's not in the CRM, it didn't happen",
          "Update after every interaction",
          "Set reminders for follow-ups",
        ]
      },
      {
        id: "pipeline-management",
        title: "Pipeline Management",
        duration: 20,
        content: `PIPELINE STAGES:
1. New Lead
2. Contacted
3. Qualified
4. Presentation Scheduled
5. Proposal Sent
6. Pending Decision
7. Closed Won / Closed Lost

BEST PRACTICES:
• Move leads through stages promptly
• Note reasons for stage changes
• Review pipeline daily`,
        keyPoints: [
          "Keep your pipeline current",
          "Track conversion rates",
          "Learn from lost opportunities",
        ]
      },
      {
        id: "automation",
        title: "CRM Automation",
        duration: 20,
        content: `AUTOMATION OPPORTUNITIES:
• Welcome email sequences
• Follow-up reminders
• Birthday/anniversary messages
• Policy renewal alerts

SETTING UP AUTOMATION:
1. Identify repetitive tasks
2. Create templates
3. Set triggers
4. Monitor and adjust`,
        keyPoints: [
          "Automation saves time",
          "Keep it personal",
          "Review automation regularly",
        ]
      }
    ],
    learningObjectives: [
      "Navigate the CRM efficiently",
      "Manage your pipeline effectively",
      "Set up time-saving automations",
    ]
  },

  "prospecting-strategies": {
    id: "prospecting-strategies",
    title: "Prospecting Strategies",
    description: "Build a consistent pipeline of new opportunities",
    sections: [
      {
        id: "prospecting-methods",
        title: "Prospecting Methods",
        duration: 20,
        content: `PROSPECTING CHANNELS:
• Referrals from existing clients
• Online lead sources
• Networking events
• Social media outreach
• Community involvement

DAILY PROSPECTING GOALS:
• 20 dials minimum
• 5 meaningful conversations
• 2 appointments scheduled`,
        keyPoints: [
          "Diversify your lead sources",
          "Consistency beats intensity",
          "Track what works for you",
        ]
      },
      {
        id: "building-pipeline",
        title: "Building Your Pipeline",
        duration: 20,
        content: `PIPELINE HEALTH:
• Always have 3x your monthly goal in pipeline
• Balance lead stages
• Quality over quantity

WEEKLY RHYTHM:
• Monday: Pipeline review
• Daily: Prospecting block
• Friday: Next week planning`,
        keyPoints: [
          "Never stop prospecting",
          "Full pipeline = less stress",
          "Plan your prospecting time",
        ]
      }
    ],
    learningObjectives: [
      "Implement multiple prospecting strategies",
      "Build a healthy, consistent pipeline",
      "Develop daily prospecting habits",
    ]
  },

  // Week 3 - Sales Mastery
  "presentation-excellence": {
    id: "presentation-excellence",
    title: "Presentation Excellence",
    description: "Deliver compelling presentations that close deals",
    sections: [
      {
        id: "presentation-structure",
        title: "Presentation Structure",
        duration: 20,
        content: `THE PERFECT PRESENTATION:
1. Opening - Build rapport (2 min)
2. Discovery recap - Confirm understanding (3 min)
3. Education - Explain options (10 min)
4. Recommendation - Make your case (5 min)
5. Close - Ask for the business (5 min)

TOTAL TIME: 25-30 minutes`,
        keyPoints: [
          "Structure creates confidence",
          "Customize for each client",
          "Practice makes perfect",
        ]
      },
      {
        id: "visual-aids",
        title: "Using Visual Aids",
        duration: 20,
        content: `EFFECTIVE VISUALS:
• Simple comparison charts
• Policy illustrations
• Benefit summaries
• Premium breakdowns

PRESENTATION TOOLS:
• Heritage presentation deck
• Quick Quote calculator
• Digital brochures`,
        keyPoints: [
          "Visuals reinforce your message",
          "Keep slides simple",
          "Let the client see the numbers",
        ]
      },
      {
        id: "storytelling",
        title: "Storytelling in Sales",
        duration: 20,
        content: `STORY FRAMEWORK:
• Situation - Paint the picture
• Problem - What's at risk
• Solution - How insurance helps
• Success - Happy outcome

POWERFUL STORIES:
• Share client success stories (anonymized)
• Use relatable scenarios
• Connect emotionally`,
        keyPoints: [
          "Facts tell, stories sell",
          "Make it relevant to them",
          "Practice your stories",
        ]
      }
    ],
    learningObjectives: [
      "Structure effective presentations",
      "Use visual aids professionally",
      "Tell compelling stories",
    ]
  },

  "advanced-objections": {
    id: "advanced-objections",
    title: "Advanced Objection Handling",
    description: "Master complex objections with confidence",
    sections: [
      {
        id: "advanced-techniques",
        title: "Advanced Techniques",
        duration: 25,
        content: `ADVANCED OBJECTION RESPONSES:

"I need to think about it":
"I understand. What specifically would you like to think about?
Let's address that together now so you can make a confident decision."

"It's too expensive":
"I hear you. Can I ask - too expensive compared to what?
Let's look at what you get for this investment."

"I need to talk to my spouse":
"That's wise. Would it help if we scheduled a call together?
I'd be happy to answer any questions they might have."`,
        keyPoints: [
          "Dig deeper into objections",
          "Reframe the concern",
          "Offer to help solve the problem",
        ]
      },
      {
        id: "preventing-objections",
        title: "Preventing Objections",
        duration: 25,
        content: `PROACTIVE APPROACH:
• Address concerns before they're raised
• Set expectations early
• Build value throughout

COMMON PREVENTION TACTICS:
• "Many clients initially wonder about..."
• "You might be thinking..."
• "Let me address something important..."`,
        keyPoints: [
          "Prevention beats reaction",
          "Know common objections",
          "Build value before price",
        ]
      }
    ],
    learningObjectives: [
      "Handle complex objections confidently",
      "Prevent objections proactively",
      "Turn objections into opportunities",
    ]
  },

  "referral-system": {
    id: "referral-system",
    title: "Referral System Setup",
    description: "Build a referral engine for consistent leads",
    sections: [
      {
        id: "asking-for-referrals",
        title: "Asking for Referrals",
        duration: 20,
        content: `WHEN TO ASK:
• After policy delivery
• After positive reviews
• At annual reviews
• When they mention others

HOW TO ASK:
"Who else do you know who might benefit from
the same peace of mind you now have?"

"I built my business on referrals from happy clients
like you. Who comes to mind?"`,
        keyPoints: [
          "Ask early and often",
          "Make it easy to refer",
          "Follow up promptly",
        ]
      },
      {
        id: "referral-tracking",
        title: "Tracking & Rewarding",
        duration: 15,
        content: `TRACKING REFERRALS:
• Log in CRM immediately
• Note referring client
• Track conversion rate

SHOWING APPRECIATION:
• Thank you calls
• Handwritten notes
• Small gifts (within compliance)`,
        keyPoints: [
          "Track every referral",
          "Always say thank you",
          "Referrals breed referrals",
        ]
      }
    ],
    learningObjectives: [
      "Ask for referrals confidently",
      "Build a systematic referral process",
      "Show appreciation to referral sources",
    ]
  },

  // Week 4 - First Client Interactions
  "shadow-session-guide": {
    id: "shadow-session-guide",
    title: "Shadow Session Guide",
    description: "Make the most of your shadow sessions",
    sections: [
      {
        id: "before-session",
        title: "Before Your Session",
        duration: 10,
        content: `PREPARATION:
• Review the client file
• Understand the products being discussed
• Prepare questions for the mentor
• Have note-taking materials ready

MINDSET:
• Be observant, not distracting
• Focus on techniques, not just content
• Notice body language and tone`,
        keyPoints: [
          "Preparation shows professionalism",
          "Come with specific learning goals",
          "Be invisible but attentive",
        ]
      },
      {
        id: "during-session",
        title: "During Your Session",
        duration: 10,
        content: `WHAT TO OBSERVE:
• How they build rapport
• Discovery questions used
• Objection handling techniques
• Closing strategies
• Use of visual aids

TAKE NOTES ON:
• Specific phrases that work
• Timing and pacing
• Client reactions`,
        keyPoints: [
          "Watch for the subtle things",
          "Note what works best",
          "Observe client reactions",
        ]
      },
      {
        id: "after-session",
        title: "After Your Session",
        duration: 10,
        content: `DEBRIEF QUESTIONS:
• "What could have gone better?"
• "Why did you use that approach?"
• "How do you handle X differently?"

APPLY LEARNING:
• Practice new techniques
• Add to your script
• Schedule next shadow`,
        keyPoints: [
          "Always debrief",
          "Apply what you learned",
          "Schedule more shadows",
        ]
      }
    ],
    learningObjectives: [
      "Prepare effectively for shadow sessions",
      "Observe and learn from experienced agents",
      "Apply insights to your own practice",
    ]
  },

  "month1-review": {
    id: "month1-review",
    title: "Month 1 Comprehensive Review",
    description: "Review everything you've learned in your first month",
    sections: [
      {
        id: "product-review",
        title: "Product Knowledge Review",
        duration: 15,
        content: `KEY PRODUCTS:
• Term Life - Affordable, temporary coverage
• Whole Life - Permanent with cash value
• IUL - Flexible with growth potential
• Final Expense - Simplified issue

MATCHING PRODUCTS TO NEEDS:
• Young families → Term
• Estate planning → Whole/IUL
• Seniors → Final Expense`,
        keyPoints: [
          "Know your products inside out",
          "Match products to needs",
          "Understand the differences",
        ]
      },
      {
        id: "sales-review",
        title: "Sales Process Review",
        duration: 15,
        content: `THE 5-STEP PROCESS:
1. Connect - Build rapport
2. Discover - Understand needs
3. Educate - Teach, don't sell
4. Recommend - Make clear suggestions
5. Guide - Help them decide

OBJECTION HANDLING:
• Listen fully
• Acknowledge concerns
• Explore the real issue
• Respond appropriately`,
        keyPoints: [
          "Process creates consistency",
          "Education builds trust",
          "Objections are opportunities",
        ]
      },
      {
        id: "next-steps",
        title: "Your Path Forward",
        duration: 15,
        content: `MONTH 2 GOALS:
• 50+ client contacts
• 10+ presentations
• 3-5 applications

FOCUS AREAS:
• Consistent prospecting
• Pipeline management
• Continuous learning`,
        keyPoints: [
          "Keep momentum going",
          "Track your activities",
          "Celebrate your progress",
        ]
      }
    ],
    learningObjectives: [
      "Consolidate Month 1 learning",
      "Identify areas for improvement",
      "Set clear Month 2 goals",
    ]
  },

  // Days 8-30 Additional Modules
  "30-day-plan-creation": {
    id: "30-day-plan-creation",
    title: "30-Day Success Plan",
    description: "Create your personalized 30-day action plan with your upline",
    learningObjectives: [
      "Set clear 30-day goals",
      "Create an action plan",
      "Establish accountability",
    ],
    sections: [
      {
        id: "plan-framework",
        title: "The 30-Day Framework",
        duration: 5,
        content: `Your first 30 days set the foundation for your entire career.

THE 30-DAY SUCCESS FORMULA:
• Week 1: Complete training, set up systems
• Week 2: Begin prospecting, schedule first meetings
• Week 3: Conduct presentations, handle objections
• Week 4: Close first sales, build momentum

DAILY MINIMUMS:
• 20 prospecting activities
• 3 new conversations
• 1 presentation (week 2+)

WEEKLY GOALS:
• 100 prospecting activities
• 15 meaningful conversations
• 5 presentations scheduled
• 2-3 applications`,
        keyPoints: [
          "Activity creates results",
          "Track everything daily",
          "Review with upline weekly",
        ]
      },
      {
        id: "plan-creation",
        title: "Building Your Plan",
        duration: 5,
        content: `STEP 1: SET YOUR INCOME GOAL
• What do you want to earn this month?
• Work backwards to required activities

STEP 2: IDENTIFY YOUR MARKET
• Who will you contact first?
• Natural market vs cold market

STEP 3: SCHEDULE YOUR TIME
• Block prospecting hours
• Schedule training time
• Plan for presentations

STEP 4: CREATE ACCOUNTABILITY
• Daily check-ins with upline
• Weekly progress reviews
• Adjust as needed

DISCUSS WITH YOUR UPLINE:
• Your specific goals
• Your target market
• Your biggest concerns
• Your commitment level`,
        keyPoints: [
          "Goals drive activity levels",
          "Time blocking is essential",
          "Accountability accelerates success",
        ]
      }
    ]
  },

  "daily-metrics-tracking": {
    id: "daily-metrics-tracking",
    title: "Daily Metrics Tracking",
    description: "Set up your daily activity tracking system",
    learningObjectives: [
      "Understand key metrics",
      "Set up tracking systems",
      "Build tracking habits",
    ],
    sections: [
      {
        id: "metrics-overview",
        title: "Metrics That Matter",
        duration: 5,
        content: `What gets measured gets improved.

KEY DAILY METRICS:
• Dials made
• Conversations (decision makers reached)
• Appointments set
• Presentations given
• Applications taken

CONVERSION BENCHMARKS:
• 20 dials → 5 conversations → 1 appointment
• 3 appointments → 1 presentation
• 3 presentations → 1 application

TRACK THESE DAILY:
□ Number of dials
□ Number of conversations
□ Appointments set
□ Presentations completed
□ Applications submitted`,
        keyPoints: [
          "Activity predicts results",
          "Track leading indicators",
          "Review metrics daily",
        ]
      },
      {
        id: "tracking-setup",
        title: "Setting Up Your Tracker",
        duration: 5,
        content: `TRACKING OPTIONS:

1. CRM DASHBOARD
• Built into your Heritage CRM
• Real-time activity logging
• Automatic reports

2. DAILY SCORECARD
• Simple spreadsheet
• Track by hour blocks
• End-of-day totals

3. PHYSICAL TRACKER
• Notebook or whiteboard
• Visual accountability
• Satisfying to mark off

DAILY ROUTINE:
• Morning: Review goals
• Throughout day: Log activities
• End of day: Tally and assess
• Weekly: Review with upline

Set up your preferred tracking method now in your CRM.`,
        keyPoints: [
          "Choose one tracking method",
          "Log activities in real-time",
          "Review daily and weekly",
        ]
      }
    ]
  },

  "weekly-metrics-review": {
    id: "weekly-metrics-review",
    title: "Weekly Metrics Review",
    description: "How to conduct effective weekly reviews with your upline",
    learningObjectives: [
      "Prepare for weekly reviews",
      "Analyze your metrics",
      "Create improvement plans",
    ],
    sections: [
      {
        id: "review-preparation",
        title: "Preparing for Your Review",
        duration: 5,
        content: `Weekly reviews keep you on track and accelerate growth.

BEFORE YOUR REVIEW:
1. Compile your weekly metrics
2. Identify wins and challenges
3. List specific questions
4. Know your next week goals

METRICS TO BRING:
• Total activities by type
• Conversion rates
• Pipeline status
• Revenue/commissions

QUESTIONS TO ANSWER:
• What worked well?
• What didn't work?
• What will you do differently?
• What support do you need?`,
        keyPoints: [
          "Come prepared with data",
          "Be honest about challenges",
          "Have specific questions ready",
        ]
      },
      {
        id: "review-meeting",
        title: "The Review Meeting",
        duration: 5,
        content: `REVIEW MEETING STRUCTURE:

1. WINS (5 min)
• What went well?
• Celebrate successes

2. METRICS (10 min)
• Review the numbers
• Compare to goals
• Identify patterns

3. CHALLENGES (10 min)
• What's not working?
• Discuss obstacles
• Brainstorm solutions

4. ACTION ITEMS (5 min)
• What will you do next week?
• What support do you need?
• Set next meeting

TAKE NOTES:
Document action items and insights from every review.`,
        keyPoints: [
          "Follow the meeting structure",
          "Be coachable and open",
          "Document everything",
        ]
      }
    ]
  },

  "annual-production-planning": {
    id: "annual-production-planning",
    title: "Annual Production Planning",
    description: "Plan your production goals for the year ahead",
    learningObjectives: [
      "Set annual income goals",
      "Break down quarterly targets",
      "Create action plans",
    ],
    sections: [
      {
        id: "annual-goals",
        title: "Setting Annual Goals",
        duration: 5,
        content: `Annual planning sets the trajectory for your career.

GOAL SETTING FRAMEWORK:
1. Define your income goal
2. Calculate required production
3. Break into quarterly targets
4. Create monthly milestones

PRODUCTION CALCULATIONS:
• Average premium per policy
• Commission percentage
• Policies needed for goal
• Activities needed per policy

EXAMPLE:
Goal: $100,000 income
Avg commission: $500/policy
Policies needed: 200/year
Monthly target: 17 policies
Weekly target: 4-5 policies`,
        keyPoints: [
          "Start with income goal",
          "Work backwards to activities",
          "Track progress quarterly",
        ]
      },
      {
        id: "quarterly-planning",
        title: "Quarterly Execution",
        duration: 5,
        content: `QUARTERLY PLANNING:

Q1: Build Foundation
• Expand network
• Establish referral sources
• Build consistent habits

Q2: Accelerate Growth
• Leverage referrals
• Improve close rate
• Add product knowledge

Q3: Maximize Production
• Peak activity season
• Cross-sell existing clients
• Review annual progress

Q4: Finish Strong
• Sprint to annual goal
• Plan for next year
• Build retention systems

MONTHLY CHECK-INS:
Review progress against quarterly goals monthly. Adjust activities as needed to stay on track.`,
        keyPoints: [
          "Each quarter has a focus",
          "Review monthly, adjust quarterly",
          "Celebrate milestone achievements",
        ]
      }
    ]
  },

  "niche-development": {
    id: "niche-development",
    title: "Developing Your Niche",
    description: "Find and develop your specialization area",
    learningObjectives: [
      "Identify potential niches",
      "Develop niche expertise",
      "Market to your niche",
    ],
    sections: [
      {
        id: "choosing-niche",
        title: "Choosing Your Niche",
        duration: 5,
        content: `Specialization accelerates success.

WHY NICHE DOWN?
• Become the go-to expert
• Higher trust and credibility
• More referrals within niche
• Higher close rates

POTENTIAL NICHES:
• Business owners
• Medical professionals
• Real estate agents
• Teachers/educators
• First responders
• Young families
• Retirees/pre-retirees

NICHE SELECTION CRITERIA:
1. Do you have access to this group?
2. Do they need insurance?
3. Can they afford it?
4. Do you enjoy working with them?`,
        keyPoints: [
          "Specialization beats generalization",
          "Choose based on access and interest",
          "Become the expert",
        ]
      },
      {
        id: "niche-expertise",
        title: "Building Niche Expertise",
        duration: 5,
        content: `BECOMING THE EXPERT:

1. LEARN THEIR WORLD
• Industry terminology
• Common challenges
• Unique insurance needs

2. GET VISIBLE
• Join industry associations
• Speak at events
• Write educational content

3. BUILD CREDIBILITY
• Get testimonials
• Case studies
• Professional designations

4. DEVELOP RESOURCES
• Niche-specific scripts
• Customized materials
• Tailored presentations

REFERRAL MULTIPLIER:
One successful client in a tight-knit niche can lead to dozens of referrals.`,
        keyPoints: [
          "Learn their language",
          "Become visible in their community",
          "Leverage referrals within the niche",
        ]
      }
    ]
  },

  "mentoring-guide": {
    id: "mentoring-guide",
    title: "Becoming a Mentor",
    description: "Learn how to effectively mentor new agents",
    learningObjectives: [
      "Understand mentor responsibilities",
      "Learn mentoring techniques",
      "Build a mentoring relationship",
    ],
    sections: [
      {
        id: "mentor-role",
        title: "The Mentor Role",
        duration: 5,
        content: `Mentoring is leadership development.

WHY MENTOR?
• Develops your leadership skills
• Helps you understand fundamentals better
• Builds your team and agency
• Creates passive income potential

MENTOR RESPONSIBILITIES:
• Regular check-ins (daily first week)
• Answer questions promptly
• Share real experiences
• Provide encouragement
• Hold accountable

WHAT YOU'RE NOT:
• Their manager
• Their babysitter
• Responsible for their success`,
        keyPoints: [
          "Mentoring develops leaders",
          "Guide, don't do it for them",
          "Set clear expectations",
        ]
      },
      {
        id: "mentoring-techniques",
        title: "Effective Mentoring Techniques",
        duration: 5,
        content: `MENTORING BEST PRACTICES:

1. ASK, DON'T TELL
• "What do you think you should do?"
• "What did you learn from that?"
• Guide them to discover answers

2. SHARE STORIES
• Your early struggles
• How you overcame challenges
• Real client situations

3. MODEL BEHAVIOR
• Let them shadow you
• Demonstrate calls
• Show your work habits

4. CELEBRATE WINS
• Acknowledge progress
• Recognize effort
• Build confidence

WEEKLY MENTORING:
• 15-30 minute check-ins
• Review their metrics
• Role-play challenges
• Set next week focus`,
        keyPoints: [
          "Guide through questions",
          "Share your journey",
          "Celebrate their progress",
        ]
      }
    ]
  },

  "year-two-vision": {
    id: "year-two-vision",
    title: "Year Two Vision Planning",
    description: "Plan your growth trajectory for year two and beyond",
    learningObjectives: [
      "Reflect on year one",
      "Set year two goals",
      "Plan career advancement",
    ],
    sections: [
      {
        id: "year-one-reflection",
        title: "Year One Reflection",
        duration: 5,
        content: `Reflection drives growth.

YEAR ONE ASSESSMENT:
• Did you hit your income goal?
• What were your biggest wins?
• What were your biggest challenges?
• What would you do differently?

KEY METRICS TO REVIEW:
• Total production
• Number of clients
• Referral rate
• Close ratio
• Average premium

LESSONS LEARNED:
• What activities worked best?
• What didn't work?
• What skills did you develop?
• What skills need improvement?`,
        keyPoints: [
          "Honest reflection enables growth",
          "Celebrate progress made",
          "Learn from challenges",
        ]
      },
      {
        id: "year-two-goals",
        title: "Planning Year Two",
        duration: 5,
        content: `YEAR TWO OPPORTUNITIES:

• Leadership roles
• Building a team
• Higher production tiers
• Advanced certifications
• Specialized markets

GOAL SETTING:
• 50-100% production increase
• Add team members
• Develop referral engine
• Build passive income

CAREER PATH OPTIONS:
1. Top Producer Track
   - Focus on personal production
   - Achieve top tier bonuses

2. Agency Building Track
   - Recruit and develop agents
   - Build leadership skills

3. Specialist Track
   - Deep expertise in one area
   - Become the regional expert

COMMIT TO YOUR PATH:
Choose one primary focus for year two and align all activities to support it.`,
        keyPoints: [
          "Year two is acceleration time",
          "Choose your career path",
          "Set aggressive but achievable goals",
        ]
      }
    ]
  },

  // Shadow & Supervised Training Modules
  "pre-shadow-briefing": {
    id: "pre-shadow-briefing",
    title: "Pre-Shadow Session Briefing",
    description: "What to expect during shadow sessions and how to maximize your observation time",
    sections: [
      {
        id: "shadow-overview",
        title: "What Is a Shadow Session?",
        duration: 5,
        content: `A shadow session is your chance to observe an experienced agent in action before you take the lead yourself.

WHY SHADOWING MATTERS:
• See real client interactions, not just theory
• Learn how top producers handle objections naturally
• Understand pacing, tone, and rapport-building in practice
• Build confidence before your first solo call

YOUR ROLE DURING SHADOWING:
• Listen actively — do not speak unless invited
• Take detailed notes on what you observe
• Pay attention to transitions between conversation phases
• Note the agent's body language and tone shifts`,
        keyPoints: [
          "Shadowing bridges the gap between training and real calls",
          "Your job is to observe, not participate",
          "Every session is a learning opportunity",
        ]
      },
      {
        id: "observation-checklist",
        title: "Observation Checklist",
        duration: 5,
        content: `Use this checklist during every shadow session:

INTRODUCTION PHASE:
□ How does the agent introduce themselves?
□ What tone do they set in the first 30 seconds?
□ How do they establish credibility?

DISCOVERY PHASE:
□ What questions do they ask first?
□ How do they listen and respond to answers?
□ When do they transition from discovery to presentation?

PRESENTATION PHASE:
□ How do they explain products without jargon?
□ Do they use stories or analogies?
□ How do they check for understanding?

CLOSING PHASE:
□ How do they handle objections?
□ What closing language do they use?
□ How do they confirm next steps?

GENERAL OBSERVATIONS:
□ Overall pacing of the call
□ Moments where the client seemed most engaged
□ Anything you would do differently`,
        keyPoints: [
          "Print this checklist and use it on every shadow call",
          "Focus on one phase per session if it helps",
          "Debrief with your upline after every session",
        ]
      },
      {
        id: "note-taking-tips",
        title: "How to Take Effective Notes",
        duration: 5,
        content: `BEST PRACTICES FOR SHADOW NOTES:

FORMAT:
• Use a dedicated notebook or digital doc for all shadow sessions
• Date and label each session
• Note the client type (age, family situation, product interest)

WHAT TO CAPTURE:
• Exact phrases that worked well (write them down verbatim)
• Objections raised and how they were handled
• Transitions that felt natural vs. awkward
• Questions the client asked that surprised you

AFTER THE SESSION:
• Review your notes within 1 hour
• Highlight your top 3 takeaways
• Write down 1 thing you want to try on your own calls
• Discuss observations with your upline during debrief`,
        keyPoints: [
          "Write down exact phrases that resonate",
          "Review notes soon after the session",
          "Convert observations into personal action items",
        ]
      }
    ],
    learningObjectives: [
      "Understand the purpose and structure of shadow sessions",
      "Use an observation checklist to capture key insights",
      "Take effective notes that translate into your own selling approach",
    ]
  },

  "shadow-call-1": {
    id: "shadow-call-1",
    title: "Shadow Call 1 — Introduction & Rapport",
    description: "First shadow observation focusing on your upline's introduction, rapport building, and fact-finding approach",
    sections: [
      {
        id: "call-1-focus",
        title: "Focus Areas for Call 1",
        duration: 5,
        content: `Your first shadow call is all about the OPENING of the conversation.

WHAT TO WATCH FOR:

INTRODUCTION:
• How does your upline introduce themselves and Heritage Life?
• Do they mention credentials, experience, or shared connections?
• How quickly do they get the client talking?

RAPPORT BUILDING:
• What small talk topics work best?
• How does the agent find common ground?
• When do they transition from rapport to business?

FACT-FINDING:
• What are the first 3-5 questions they ask?
• How do they listen and acknowledge responses?
• Do they take notes visibly (building trust) or silently?
• How do they handle it when a client gives a vague answer?

TONE & ENERGY:
• Is the agent conversational or formal?
• How do they match the client's energy level?
• What makes the client open up?`,
        keyPoints: [
          "The first 2 minutes set the tone for the entire call",
          "Rapport is not wasted time — it is the foundation",
          "Great fact-finding starts with great listening",
        ]
      },
      {
        id: "call-1-debrief",
        title: "Debrief Questions",
        duration: 5,
        content: `After Call 1, discuss these questions with your upline:

REFLECTION QUESTIONS:
1. What did the client respond to most positively?
2. Was there a moment where the conversation shifted — what caused it?
3. How did the agent adjust when something did not go as planned?
4. What would the agent do differently next time?
5. What surprised you about the interaction?

SELF-ASSESSMENT:
• Could you replicate the introduction? If not, what would you need to practice?
• Did you understand all the products mentioned?
• Were there any compliance considerations you noticed?

ACTION ITEMS:
• Write down the opening script the agent used
• Practice the introduction out loud 3 times
• Identify 2-3 rapport-building techniques to try`,
        keyPoints: [
          "Debrief immediately while the call is fresh",
          "Be honest about what confused you",
          "Practice the opening until it feels natural",
        ]
      }
    ],
    learningObjectives: [
      "Observe effective introduction and rapport-building techniques",
      "Understand how experienced agents approach fact-finding",
      "Identify specific techniques to incorporate into your own approach",
    ]
  },

  "shadow-call-2": {
    id: "shadow-call-2",
    title: "Shadow Call 2 — Objection Handling & Close",
    description: "Second shadow observation focusing on objection handling and closing techniques",
    sections: [
      {
        id: "call-2-focus",
        title: "Focus Areas for Call 2",
        duration: 5,
        content: `Your second shadow call shifts focus to the MIDDLE and END of the conversation.

OBJECTION HANDLING:
• What objections come up? (Price, timing, need to think about it, spouse)
• How does the agent acknowledge the objection before responding?
• Do they use stories, statistics, or logic to address concerns?
• How many times do they circle back before accepting a "no"?

PRODUCT PRESENTATION:
• How do they explain coverage amounts and options?
• Do they use comparison or simplification techniques?
• How do they handle medical history discussions?

CLOSING APPROACH:
• What language signals the transition to closing?
• Is the close assumptive, direct, or consultative?
• How do they handle hesitation at the close?
• What urgency or motivation do they create?

COMPARE TO CALL 1:
• How does this agent's style differ from Call 1 (if different agent)?
• What techniques are consistent across both calls?
• Which approach felt more natural to you?`,
        keyPoints: [
          "Objections are buying signals — they mean the client is engaged",
          "The close should feel like a natural next step, not pressure",
          "Compare approaches to find what fits your personality",
        ]
      },
      {
        id: "call-2-debrief",
        title: "Debrief Questions",
        duration: 5,
        content: `After Call 2, discuss these questions with your upline:

OBJECTION ANALYSIS:
1. List every objection you heard — how was each one handled?
2. Which response was most effective and why?
3. Were there objections the agent could have handled better?

CLOSING ANALYSIS:
4. At what point did you know the call would close (or not)?
5. What specific words or phrases triggered the client's decision?
6. How did the agent confirm the sale and set expectations?

PATTERN RECOGNITION:
• What patterns do you see across both shadow calls?
• What do successful calls have in common?
• What separates a close from a "think about it"?

YOUR PREPARATION:
• Write out responses to the top 3 objections you heard
• Practice the closing language until it is comfortable
• Rate your readiness to handle a similar call (1-10)`,
        keyPoints: [
          "Document objections and responses for your own reference",
          "Closing confidence comes from preparation",
          "Rate your readiness honestly — it guides your next steps",
        ]
      }
    ],
    learningObjectives: [
      "Observe real-world objection handling techniques",
      "Understand different closing approaches and when to use them",
      "Compare multiple agent styles to develop your own approach",
    ]
  },

  "shadow-debrief-1": {
    id: "shadow-debrief-1",
    title: "Post-Shadow Debrief Framework",
    description: "Structured framework for debriefing after shadow sessions with your upline",
    sections: [
      {
        id: "debrief-structure",
        title: "Debrief Structure",
        duration: 5,
        content: `Use this framework after EVERY shadow session:

STEP 1 — WHAT WENT WELL (5 minutes):
• What were the strongest moments of the call?
• What techniques would you want to replicate?
• What felt smooth and natural?

STEP 2 — WHAT COULD IMPROVE (5 minutes):
• Were there awkward transitions or missed opportunities?
• Did the client seem confused or disengaged at any point?
• What would you do differently in the same situation?

STEP 3 — KEY TAKEAWAYS (3 minutes):
• What is the single most important thing you learned?
• What concept or technique was new to you?
• What confirmed something you already knew?

STEP 4 — ACTION ITEMS (2 minutes):
• List 2-3 specific things to practice before the next session
• Set a timeline for when you will practice them
• Schedule your next shadow or supervised call`,
        keyPoints: [
          "Structure your debrief — do not just wing it",
          "Balance positives and improvements",
          "Always leave with concrete action items",
        ]
      },
      {
        id: "debrief-journal",
        title: "Maintaining Your Debrief Journal",
        duration: 5,
        content: `KEEP A RUNNING DEBRIEF JOURNAL:

Each entry should include:
• Date and session type (shadow, supervised, solo)
• Client profile summary (age, family, product interest)
• Top 3 things that went well
• Top 3 areas for improvement
• Action items and follow-up

WHY THIS MATTERS:
• Track your progress over time
• Identify recurring patterns (good and bad)
• Show your upline you are serious about improvement
• Build a personal playbook of what works

REVIEW SCHEDULE:
• After each session: Write your entry
• Weekly: Review the week's entries, look for patterns
• Monthly: Assess overall progress, update goals
• Share highlights with your upline at check-ins`,
        keyPoints: [
          "Consistent journaling accelerates your growth",
          "Patterns in your notes reveal your strengths and gaps",
          "Your journal becomes your personal sales playbook",
        ]
      }
    ],
    learningObjectives: [
      "Use a structured debrief process after every observation",
      "Maintain a debrief journal to track progress over time",
      "Convert observations into actionable improvement steps",
    ]
  },

  "shadow-application": {
    id: "shadow-application",
    title: "Observing the Application Process",
    description: "How your upline walks through medical questions, collects sensitive information, and ensures application accuracy",
    sections: [
      {
        id: "application-walkthrough",
        title: "The Application Walkthrough",
        duration: 10,
        content: `The application is where the sale becomes real. Observe how your upline handles it.

SETTING THE STAGE:
• How does the agent transition from closing to application?
• Do they explain the process before starting?
• How do they set expectations about timing and questions?

MEDICAL QUESTIONS:
• How do they ask about health history without making it feel like an interrogation?
• What tone do they use for sensitive health topics?
• How do they handle it when a client is unsure about dates or details?
• Do they explain WHY certain questions are asked (underwriting context)?

ACCURACY IS EVERYTHING:
• How do they verify spelling of names and addresses?
• Do they read information back to the client?
• How do they handle discrepancies between what the client says and what they wrote?

COMMON PITFALLS TO WATCH:
• Rushing through questions
• Assuming information from earlier in the call
• Not explaining what happens next after submission`,
        keyPoints: [
          "The application sets the tone for the client relationship",
          "Accuracy prevents delays, cancellations, and compliance issues",
          "A calm, patient approach builds client confidence",
        ]
      },
      {
        id: "sensitive-info-handling",
        title: "Handling Sensitive Information (SSN & Banking)",
        duration: 10,
        content: `Collecting Social Security numbers and banking information requires special care.

BUILDING TRUST FOR SENSITIVE DATA:
• Explain WHY you need it (identity verification, premium payments)
• Reassure about security measures and encryption
• Never rush this part — let the client feel in control

SSN COLLECTION:
• "For the application to be processed, we'll need your Social Security number. This is used solely for identity verification by the carrier."
• Read it back digit by digit for accuracy
• Confirm the client is comfortable before proceeding

BANKING INFORMATION:
• Explain the draft process clearly — date, amount, frequency
• Offer multiple payment options if available
• Confirm routing and account numbers by reading them back
• Explain the free-look period and cancellation rights

COMPLIANCE REMINDERS:
• Never store SSN or banking info in personal notes, texts, or emails
• All sensitive data must go directly into the carrier's secure application
• Follow Heritage's data handling protocols at all times
• If a client is on speaker phone, suggest switching to private mode`,
        keyPoints: [
          "Trust is earned through transparency and professionalism",
          "Always explain WHY sensitive info is needed",
          "Never store sensitive data outside secure systems",
        ]
      }
    ],
    learningObjectives: [
      "Observe how experienced agents walk through the application process",
      "Understand best practices for collecting sensitive information",
      "Recognize compliance requirements during the application phase",
    ]
  },

  "shadow-close": {
    id: "shadow-close",
    title: "Observing the Close",
    description: "How your upline handles final objections, confirms coverage, secures payment, and sets delivery expectations",
    sections: [
      {
        id: "closing-observation",
        title: "The Close in Action",
        duration: 10,
        content: `The close is the moment everything comes together. Watch carefully.

FINAL OBJECTIONS:
• Expect last-minute hesitation — it is normal
• How does the agent address "I want to think about it" at this stage?
• Do they revisit the client's original motivation (why they called)?
• How do they differentiate between a genuine concern and cold feet?

CONFIRMING COVERAGE DETAILS:
• The agent should summarize the policy: type, coverage amount, premium, riders
• Does the client confirm understanding of what they are buying?
• Are exclusions or limitations mentioned clearly?
• How does the agent handle requests to change coverage at the last minute?

SECURING PAYMENT:
• How is the first premium collected?
• Does the agent explain the billing cycle and draft dates?
• What happens if the payment method does not work?
• How do they handle a client who wants to delay payment?

SETTING EXPECTATIONS:
• What does the agent tell the client about next steps?
• Do they explain the underwriting timeline?
• How do they describe the free-look period?
• Do they schedule a follow-up call to check in?`,
        keyPoints: [
          "Last-minute objections are normal — stay calm and confident",
          "Confirm everything clearly — no surprises for the client",
          "Setting expectations prevents post-sale cancellations",
        ]
      },
      {
        id: "post-close-process",
        title: "After the Close",
        duration: 5,
        content: `What happens after the client says yes:

IMMEDIATE NEXT STEPS:
1. Submit the application through the carrier portal
2. Send a confirmation email or text with a summary
3. Log the interaction in the Heritage CRM
4. Set a follow-up reminder for underwriting updates

CLIENT COMMUNICATION:
• Thank them for their trust in Heritage Life
• Provide your direct contact information
• Explain who to call if they have questions before the policy is issued
• Mention the welcome kit they will receive

UPLINE NOTIFICATION:
• Let your upline know about the close
• Discuss any issues that came up during the process
• Celebrate the win — positive reinforcement matters

COMPLIANCE DOCUMENTATION:
• Ensure all required disclosures were provided
• Confirm the suitability questionnaire was completed
• File any state-specific documents as required`,
        keyPoints: [
          "Prompt application submission reduces errors and delays",
          "Post-close communication builds long-term retention",
          "Documentation protects you and the client",
        ]
      }
    ],
    learningObjectives: [
      "Observe how experienced agents handle the closing process",
      "Understand post-close procedures and compliance requirements",
      "Learn how to set proper expectations for policy delivery",
    ]
  },

  "agent-practice-upline": {
    id: "agent-practice-upline",
    title: "Practice Presentation with Upline",
    description: "Run through your full presentation script with your upline and receive real-time coaching",
    sections: [
      {
        id: "practice-setup",
        title: "Setting Up Your Practice Session",
        duration: 5,
        content: `This is your first time running the full presentation. Your upline will play the client.

PREPARATION:
• Review your script one more time before starting
• Have your product materials and rate sheets ready
• Set up your screen share or presentation tools
• Clear your environment of distractions

SESSION FORMAT:
1. You deliver your full presentation (15-20 minutes)
2. Your upline plays a realistic client — they will ask questions and raise objections
3. After the run-through, you get immediate feedback
4. You practice specific sections that need work

MINDSET:
• This is practice, not a test — mistakes are expected and valuable
• Focus on flow and confidence, not perfection
• Your upline wants you to succeed — take their feedback seriously
• Record the session (with permission) for self-review later`,
        keyPoints: [
          "Preparation reduces anxiety and improves performance",
          "Treat the practice like a real call — it builds muscle memory",
          "Embrace feedback — it is the fastest path to improvement",
        ]
      },
      {
        id: "practice-evaluation",
        title: "Evaluation Areas",
        duration: 5,
        content: `Your upline will evaluate you on these areas:

INTRODUCTION & RAPPORT (1-5):
• Did you set a professional, warm tone?
• Did you establish credibility early?
• Did the opening feel natural or scripted?

DISCOVERY & FACT-FINDING (1-5):
• Did you ask enough open-ended questions?
• Did you listen actively and respond thoughtfully?
• Did you uncover the client's real needs?

PRODUCT PRESENTATION (1-5):
• Were your product explanations clear and jargon-free?
• Did you connect features to the client's specific needs?
• Did you offer appropriate options without overwhelming?

OBJECTION HANDLING (1-5):
• Did you acknowledge objections before responding?
• Were your responses empathetic and logical?
• Did you know when to push and when to pivot?

CLOSE (1-5):
• Was the transition to close smooth?
• Did you ask for the sale confidently?
• Did you handle last-minute hesitation well?

OVERALL IMPRESSION:
• Would this client buy from you? Why or why not?
• What is the one change that would make the biggest difference?`,
        keyPoints: [
          "Focus on the area with the lowest score first",
          "Ask your upline to model the sections you struggled with",
          "Schedule another practice before your first real call",
        ]
      }
    ],
    learningObjectives: [
      "Deliver a complete sales presentation from open to close",
      "Receive structured feedback from an experienced agent",
      "Identify specific areas to improve before client calls",
    ]
  },

  "upline-feedback-session": {
    id: "upline-feedback-session",
    title: "Structured Upline Feedback Session",
    description: "Review practice calls with your upline, discuss strengths and weaknesses, and set goals for the next day",
    sections: [
      {
        id: "feedback-framework",
        title: "Feedback Session Framework",
        duration: 10,
        content: `This session reviews everything from your practice and shadow calls.

PART 1 — SELF-ASSESSMENT (5 minutes):
Before your upline gives feedback, assess yourself first:
• What did you do well today?
• Where did you struggle?
• What would you do differently?
• Rate your confidence (1-10) for handling a real call tomorrow

PART 2 — UPLINE FEEDBACK (10 minutes):
Your upline will share:
• Specific moments that were strong (with examples)
• Areas that need improvement (with specific suggestions)
• Comparison to other new agents at this stage
• Realistic expectations for your first calls

PART 3 — GOAL SETTING (5 minutes):
Set 3 goals for the next day:
1. One skill to focus on improving
2. One technique to try for the first time
3. One area where you already feel confident

PART 4 — NEXT STEPS:
• Schedule tomorrow's calls or sessions
• Identify any materials to review tonight
• Confirm your upline's availability for support`,
        keyPoints: [
          "Self-assessment builds self-awareness",
          "Specific feedback is more useful than general praise",
          "Three focused goals are better than ten vague ones",
        ]
      },
      {
        id: "growth-mindset",
        title: "Maintaining a Growth Mindset",
        duration: 5,
        content: `REMEMBER — Every great agent started where you are.

COMMON FEELINGS AT THIS STAGE:
• Overwhelmed — there is a lot to learn, and that is normal
• Nervous — you care about doing well, which is a good sign
• Uncertain — you have not done this before, but you will get there
• Motivated — you chose this career for a reason

WHAT TO FOCUS ON:
• Progress, not perfection — are you better than yesterday?
• Patterns, not individual mistakes — one bad moment does not define you
• Effort, not outcomes — the results will follow consistent effort
• Support, not isolation — lean on your team

HERITAGE PROMISE:
We do not expect you to be perfect on day one. We expect you to show up, stay coachable, and improve every day. Your upline, your manager, and the AI Council are all here to help you succeed.

YOUR COMMITMENT:
• Stay open to feedback
• Practice daily
• Ask questions without hesitation
• Trust the process`,
        keyPoints: [
          "Progress over perfection is the Heritage way",
          "Feeling nervous means you care — channel it into preparation",
          "You have a full team behind you",
        ]
      }
    ],
    learningObjectives: [
      "Conduct an honest self-assessment of your performance",
      "Receive and apply structured feedback from your upline",
      "Set specific, actionable goals for continuous improvement",
    ]
  },

  "agent-call-1": {
    id: "agent-call-1",
    title: "First Supervised Call — You Lead",
    description: "Your first client call where you lead the conversation while your upline listens and can jump in if needed",
    sections: [
      {
        id: "call-1-preparation",
        title: "Preparing for Your First Call",
        duration: 5,
        content: `This is it — your first real conversation with a client. You lead; your upline listens.

PRE-CALL CHECKLIST:
□ Review the client's information in the CRM
□ Have your script nearby (but do not read from it)
□ Open your rate tools and product materials
□ Test your audio and connection
□ Take 3 deep breaths

CALL STRUCTURE REMINDER:
1. Introduction — who you are, why you are calling, what to expect
2. Rapport — find common ground, build trust
3. Discovery — ask questions, listen, take notes
4. Presentation — match products to their needs
5. Close — ask for the commitment

YOUR UPLINE'S ROLE:
• They are on mute, listening
• They can unmute to help if you get stuck
• They may send you messages or notes during the call
• They will NOT take over unless absolutely necessary
• After the call, you will debrief together

STAY CALM:
• It is okay to pause and think
• If you do not know an answer, say "Great question — let me get you the exact information"
• Silence is not awkward if you are listening
• Your first call does not need to result in a sale — it needs to result in learning`,
        keyPoints: [
          "Preparation is the antidote to nervousness",
          "Follow the structure — it is your safety net",
          "Your upline is there for backup, not judgment",
        ]
      },
      {
        id: "call-1-focus-areas",
        title: "Focus Areas for Call 1",
        duration: 5,
        content: `For your first call, focus on these three things:

1. RAPPORT — Make the client feel comfortable
• Use their name naturally
• Find something you have in common
• Let them talk more than you
• Smile while you speak — they can hear it

2. DISCOVERY — Ask the right questions
• "What prompted your interest in life insurance today?"
• "Tell me about your family — who would you want protected?"
• "Do you have any existing coverage?"
• "What is most important to you in a policy?"

3. STAYING PRESENT — Do not rush
• Listen to answers completely before speaking
• Take brief notes
• If your mind goes blank, ask another question
• It is better to be thorough than fast

WHAT NOT TO WORRY ABOUT:
• Perfect product knowledge — basics are enough for now
• Closing the sale — focus on the conversation
• Sounding like a veteran — authenticity beats polish
• Making mistakes — your upline will help

REMEMBER: The client does not know this is your first call. To them, you are a Heritage Life professional. Own that.`,
        keyPoints: [
          "Focus on rapport, discovery, and presence",
          "Do not try to be perfect — be genuine",
          "The client sees you as a professional — act like one",
        ]
      }
    ],
    learningObjectives: [
      "Lead a real client conversation with upline support",
      "Apply rapport-building and discovery techniques in practice",
      "Build confidence through real-world experience",
    ]
  },

  "agent-call-2": {
    id: "agent-call-2",
    title: "Second Supervised Call — Apply Feedback",
    description: "Apply feedback from your first call with smoother transitions and better discovery questions",
    sections: [
      {
        id: "call-2-improvements",
        title: "Building on Call 1",
        duration: 5,
        content: `Your second call is about applying what you learned from the first.

BEFORE THE CALL — REVIEW:
• What feedback did your upline give after Call 1?
• What is the ONE thing you want to improve most?
• Did you practice the specific areas that needed work?

FOCUS AREAS FOR CALL 2:

SMOOTHER TRANSITIONS:
• Introduction → Rapport: "Before we dive in, tell me a little about yourself..."
• Rapport → Discovery: "I appreciate you sharing that. Let me ask a few questions so I can find the right fit for you..."
• Discovery → Presentation: "Based on what you have told me, I think there are a couple of options that would work really well..."
• Presentation → Close: "Does this sound like something that would give you the peace of mind you are looking for?"

BETTER DISCOVERY QUESTIONS:
• Follow up on answers: "You mentioned your daughter — how old is she?"
• Dig deeper: "When you say you want to protect your family, what does that look like for you?"
• Qualify budget: "If the right coverage was available, what monthly investment would feel comfortable?"

HANDLING THE UNEXPECTED:
• If the client goes off-topic, gently redirect: "That is a great point. Let me make a note of that. Now, regarding your coverage needs..."
• If they ask a question you cannot answer: "I want to make sure I give you accurate information. Can I look that up and get back to you today?"`,
        keyPoints: [
          "Apply specific feedback from Call 1",
          "Focus on smooth transitions between phases",
          "Better discovery questions lead to better recommendations",
        ]
      },
      {
        id: "call-2-self-evaluation",
        title: "Self-Evaluation After Call 2",
        duration: 5,
        content: `After your second call, evaluate yourself before debriefing:

RATE YOURSELF (1-5):
• Introduction and first impression: ___
• Rapport building: ___
• Quality of discovery questions: ___
• Product presentation clarity: ___
• Objection handling: ___
• Transitions between phases: ___
• Overall confidence: ___

COMPARE TO CALL 1:
• What improved from your first call?
• What still needs work?
• Were there new challenges you did not face in Call 1?

CLIENT ENGAGEMENT:
• Did the client seem interested and engaged?
• Were there moments where you lost them?
• Did they ask questions (a good sign of engagement)?

NEXT STEPS:
• Based on these two calls, what are your top 3 priorities?
• Are you ready for more calls, or do you need more practice first?
• Schedule your next session with your upline
• Update your personal playbook with new learnings`,
        keyPoints: [
          "Self-evaluation builds professional self-awareness",
          "Compare performance across calls to track progress",
          "Honest assessment leads to focused improvement",
        ]
      }
    ],
    learningObjectives: [
      "Apply specific feedback from the first supervised call",
      "Demonstrate smoother transitions and deeper discovery skills",
      "Self-evaluate performance to guide continued development",
    ]
  },

  "midday-debrief": {
    id: "midday-debrief",
    title: "Midday Check-In & Debrief",
    description: "Review morning calls, adjust your approach for the afternoon, and address any compliance questions",
    sections: [
      {
        id: "morning-review",
        title: "Morning Call Review",
        duration: 5,
        content: `Take 15 minutes at midday to reset and refocus.

REVIEW YOUR MORNING:
• How many calls did you make or observe?
• What went well in each call?
• Were there any moments you want to discuss with your upline?
• Did any compliance questions come up?

ENERGY CHECK:
• How is your energy level? (Energized, steady, tired, drained)
• What is affecting your energy? (Positive calls boost you, difficult calls drain you)
• Do you need a break, a snack, or a walk before the afternoon?

QUICK WINS:
• What is one small thing you can improve immediately for your afternoon calls?
• Is there a phrase or technique from the morning you want to try again?
• Did you learn anything from a colleague that you can apply?

COMPLIANCE CHECKPOINT:
• Did you document all morning interactions in the CRM?
• Were there any client requests you need to follow up on?
• Did anything happen that should be reported to compliance?`,
        keyPoints: [
          "Midday check-ins prevent bad habits from compounding",
          "Energy management is as important as skill development",
          "Document everything — your future self will thank you",
        ]
      },
      {
        id: "afternoon-plan",
        title: "Setting Up the Afternoon",
        duration: 5,
        content: `Use the second half of the day intentionally.

AFTERNOON PRIORITIES:
1. Follow up on any morning commitments (callbacks, information requests)
2. Apply one improvement from your morning review
3. Focus on quality over quantity — fewer great calls beat many rushed ones

ADJUSTMENTS TO MAKE:
• If mornings were heavy on calls, use the afternoon for practice or admin
• If you struggled with a specific part of the script, practice it now
• If energy is low, start with warmer leads or easier tasks

UPLINE SYNC:
• Brief your upline on the morning (2-3 minute summary)
• Ask for specific advice on one challenge
• Confirm the afternoon schedule

END OF DAY PREP:
• Plan to wrap calls 30 minutes before end of day
• Use the last 30 minutes for CRM updates, notes, and planning tomorrow
• Set your top 3 priorities for the next morning`,
        keyPoints: [
          "Follow up on morning commitments first",
          "Adjust your approach based on what you learned",
          "End the day with preparation, not scrambling",
        ]
      }
    ],
    learningObjectives: [
      "Review morning performance and identify quick improvements",
      "Manage energy and focus throughout the full work day",
      "Develop the habit of midday self-assessment and planning",
    ]
  },

  "agent-close-upline-1": {
    id: "agent-close-upline-1",
    title: "Closing with Upline Support",
    description: "Attempt your first close with your upline available for backup, using the Heritage closing framework",
    sections: [
      {
        id: "heritage-closing-framework",
        title: "The Heritage Closing Framework",
        duration: 10,
        content: `Heritage uses an education-first closing approach. You are not selling — you are helping.

THE HERITAGE CLOSE — 5 STEPS:

STEP 1 — SUMMARIZE:
Restate what you learned during discovery.
"Based on what you have shared, your primary concern is making sure your family is protected if something happens to you. You want $500,000 in coverage, and a monthly payment around $50 is comfortable."

STEP 2 — RECOMMEND:
Present your recommendation with conviction.
"Based on your needs, I recommend a 20-year term policy with $500,000 in coverage. Your monthly premium would be $47, and your family would be fully protected."

STEP 3 — CONNECT TO WHY:
Remind them of their motivation.
"You mentioned your daughter just started kindergarten. This policy ensures she will have everything she needs, no matter what."

STEP 4 — ASK:
Ask for the commitment directly but warmly.
"Shall we get this coverage in place for your family today?"

STEP 5 — HANDLE OR CONFIRM:
If yes → move to the application with enthusiasm.
If objection → acknowledge, address, and ask again.
"I completely understand wanting to think about it. Many of my clients felt the same way. What specific concern can I help address right now?"`,
        keyPoints: [
          "Summarize before recommending — show you listened",
          "Connect the product to their personal motivation",
          "Ask confidently — hesitation signals uncertainty",
        ]
      },
      {
        id: "close-with-backup",
        title: "Using Upline Support During the Close",
        duration: 5,
        content: `Your upline is available as backup, but this is YOUR close.

WHEN TO USE YOUR UPLINE:
• If the client raises an objection you cannot handle
• If technical product questions are beyond your current knowledge
• If the client asks about policy features you are not sure about
• If you freeze and need a moment to regroup

HOW TO BRING IN YOUR UPLINE:
"That is an excellent question. I actually have my senior advisor on the line — they have 15 years of experience and can give you an expert perspective on that."

This does NOT undermine you. It shows:
• You have a team behind you
• You prioritize accuracy over ego
• You are connected to experienced professionals

WHAT TO DO AFTER THE UPLINE HELPS:
• Thank them and take back control of the conversation
• Summarize what the upline said in your own words
• Continue with your close

AFTER THE CALL:
• Debrief with your upline on what triggered the handoff
• Practice that specific scenario until you can handle it solo
• Note it in your development journal`,
        keyPoints: [
          "Using your upline is a strength, not a weakness",
          "Always take back control after the upline assists",
          "Practice the scenarios that required help",
        ]
      }
    ],
    learningObjectives: [
      "Apply the Heritage 5-step closing framework in a real scenario",
      "Know when and how to bring in upline support during a close",
      "Build closing confidence through supported practice",
    ]
  },

  "agent-close-until-confident": {
    id: "agent-close-until-confident",
    title: "Repeated Closing Practice",
    description: "Keep practicing closes with upline support until you can handle common objections independently",
    sections: [
      {
        id: "practice-methodology",
        title: "The Practice Loop",
        duration: 10,
        content: `Confidence comes from repetition. This module is about doing the close AGAIN AND AGAIN.

THE PRACTICE LOOP:
1. Attempt the close on a real or practice call
2. Note where you struggled
3. Practice that specific area with your upline
4. Attempt the close again
5. Repeat until you feel confident

COMMON OBJECTIONS TO MASTER:

"I need to think about it."
→ "Absolutely — this is an important decision. What specifically would you like to think about? Maybe I can help clarify right now."

"I need to talk to my spouse."
→ "Of course — your spouse should be part of this decision. Would it be helpful if we scheduled a quick call together so I can answer their questions directly?"

"It is too expensive."
→ "I understand budget is important. Let me show you a couple of options that might fit better. The key is getting some coverage in place — we can always adjust later."

"I already have coverage through work."
→ "That is great that your employer offers that. One thing to consider — employer coverage typically ends if you leave or change jobs. This policy stays with you no matter what."

"I am healthy, I do not need it right now."
→ "That is actually the best time to get coverage — when you are healthy, you qualify for the lowest rates. If something changes, it could cost significantly more or you might not qualify at all."`,
        keyPoints: [
          "Master the top 5 objections and you can handle 90% of calls",
          "Practice the response until it feels conversational, not scripted",
          "Confidence comes from knowing you have an answer for anything",
        ]
      },
      {
        id: "confidence-benchmarks",
        title: "Confidence Benchmarks",
        duration: 5,
        content: `Use these benchmarks to gauge your readiness for independent calls:

LEVEL 1 — NEEDS SUPPORT (Current stage):
• You can deliver the presentation with a script nearby
• You need upline help for most objections
• You feel anxious before calls
• Goal: Get through the full process without major stumbles

LEVEL 2 — DEVELOPING:
• You can handle 2-3 common objections independently
• You only need upline help for complex scenarios
• You feel nervous but prepared
• Goal: Close 1 in 5 qualified conversations

LEVEL 3 — CONFIDENT:
• You can handle most objections without help
• Your upline is there for backup but rarely needed
• You feel focused and prepared before calls
• Goal: Close 1 in 3 qualified conversations

LEVEL 4 — INDEPENDENT:
• You handle objections naturally and confidently
• You no longer need upline on calls
• You feel energized by the challenge
• Goal: Consistent daily production

WHERE ARE YOU NOW?
Be honest with your upline about your current level. There is no shame in needing more practice — there IS a problem with pretending you are ready when you are not.`,
        keyPoints: [
          "Know your current level and work toward the next",
          "Quality practice accelerates your progress",
          "Independence is the goal — take it one level at a time",
        ]
      }
    ],
    learningObjectives: [
      "Master responses to the five most common closing objections",
      "Use the practice loop to continuously improve closing skills",
      "Self-assess readiness for independent client calls",
    ]
  },
};

// ============================================================================
// ASSESSMENT/QUIZ CONTENT
// ============================================================================

export const ONBOARDING_ASSESSMENTS: Record<string, Assessment> = {
  // Day 1 - Products Quiz
  "products-quiz": {
    id: "products-quiz",
    title: "Day 1 Products Knowledge Check",
    description: "Test your understanding of Heritage Life's product portfolio",
    moduleId: "day1-products",
    certificationLevel: "pre_access",
    passingScore: 70,
    timeLimit: 8,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "pq1",
        type: "multiple_choice",
        category: "Products",
        question: "Which type of life insurance provides coverage for a specific period with no cash value?",
        options: [
          { id: "a", text: "Whole Life", isCorrect: false, explanation: "Whole life has cash value and lasts a lifetime." },
          { id: "b", text: "Term Life", isCorrect: true, explanation: "Correct! Term life is pure protection for a specific period." },
          { id: "c", text: "IUL", isCorrect: false, explanation: "IUL is permanent insurance with cash value." },
          { id: "d", text: "Annuity", isCorrect: false, explanation: "Annuities are retirement products, not life insurance." },
        ],
        correctFeedback: "Right! Term life is the most affordable option for temporary needs.",
        incorrectFeedback: "Term life provides coverage for a specific period without cash value.",
        difficultyLevel: 1,
      },
      {
        id: "pq2",
        type: "multiple_choice",
        category: "Products",
        question: "What is the key benefit of whole life insurance's cash value?",
        options: [
          { id: "a", text: "It decreases over time", isCorrect: false, explanation: "Cash value grows, not decreases." },
          { id: "b", text: "It provides guaranteed growth and can be accessed", isCorrect: true, explanation: "Correct! Cash value grows guaranteed and can be borrowed against." },
          { id: "c", text: "It replaces the death benefit", isCorrect: false, explanation: "Cash value is separate from the death benefit." },
          { id: "d", text: "It expires after 10 years", isCorrect: false, explanation: "Cash value continues growing throughout the policy." },
        ],
        correctFeedback: "Excellent! Cash value is a key differentiator for whole life.",
        incorrectFeedback: "Whole life cash value provides guaranteed growth you can access.",
        difficultyLevel: 1,
      },
      {
        id: "pq3",
        type: "multiple_choice",
        category: "Products",
        question: "In IUL insurance, what does the '0% floor' protect against?",
        options: [
          { id: "a", text: "Rising interest rates", isCorrect: false, explanation: "The floor protects against market losses." },
          { id: "b", text: "Losing money when the market index drops", isCorrect: true, explanation: "Correct! Even if the index loses 30%, your cash value doesn't go negative." },
          { id: "c", text: "Premium increases", isCorrect: false, explanation: "The floor relates to cash value crediting, not premiums." },
          { id: "d", text: "Death benefit reduction", isCorrect: false, explanation: "The floor protects cash value, not death benefit." },
        ],
        correctFeedback: "Right! The floor provides downside protection in IUL policies.",
        incorrectFeedback: "The 0% floor means you won't lose cash value when the market drops.",
        difficultyLevel: 2,
      },
      {
        id: "pq4",
        type: "multiple_choice",
        category: "Products",
        question: "What is the primary purpose of an annuity?",
        options: [
          { id: "a", text: "Death benefit protection", isCorrect: false, explanation: "That's life insurance's primary purpose." },
          { id: "b", text: "Guaranteed retirement income", isCorrect: true, explanation: "Correct! Annuities provide income you can't outlive." },
          { id: "c", text: "Short-term savings", isCorrect: false, explanation: "Annuities have surrender charges and are long-term." },
          { id: "d", text: "Medical expense coverage", isCorrect: false, explanation: "That's health insurance." },
        ],
        correctFeedback: "Excellent! Annuities solve the retirement income problem.",
        incorrectFeedback: "Annuities are designed to provide guaranteed retirement income.",
        difficultyLevel: 1,
      },
      {
        id: "pq5",
        type: "true_false",
        category: "Products",
        question: "Term life insurance premiums stay level for the entire term period.",
        options: [
          { id: "true", text: "True", isCorrect: true, explanation: "Correct! Level term means premiums don't change during the term." },
          { id: "false", text: "False", isCorrect: false, explanation: "Level term policies have premiums that stay the same." },
        ],
        correctFeedback: "Right! Level term is the most common type.",
        incorrectFeedback: "Level term insurance has premiums that stay the same throughout the term.",
        difficultyLevel: 1,
      },
    ],
  },

  // Day 2 - First Steps
  "basics-quiz": {
    id: "basics-quiz",
    title: "Day 2 Knowledge Check",
    description: "Test your understanding of insurance basics and Heritage products",
    moduleId: "day2-basics",
    certificationLevel: "pre_access",
    passingScore: 70,
    timeLimit: 10,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        category: "Basics",
        question: "What is the primary purpose of life insurance?",
        options: [
          { id: "a", text: "To provide income replacement and financial protection for dependents", isCorrect: true, explanation: "Correct! Life insurance replaces lost income and protects loved ones financially." },
          { id: "b", text: "To save money for retirement", isCorrect: false, explanation: "While some policies have cash value, the primary purpose is protection." },
          { id: "c", text: "To pay for medical expenses", isCorrect: false, explanation: "That's health insurance, not life insurance." },
          { id: "d", text: "To reduce taxes", isCorrect: false, explanation: "Tax benefits exist but aren't the primary purpose." },
        ],
        correctFeedback: "Excellent! Understanding the core purpose helps you communicate value to clients.",
        incorrectFeedback: "Life insurance primarily provides financial protection for beneficiaries.",
        difficultyLevel: 1,
      },
      {
        id: "q2",
        type: "multiple_choice",
        category: "Terminology",
        question: "Who is the 'beneficiary' on a life insurance policy?",
        options: [
          { id: "a", text: "The person who pays the premium", isCorrect: false, explanation: "That's typically the owner." },
          { id: "b", text: "The person whose life is insured", isCorrect: false, explanation: "That's the insured." },
          { id: "c", text: "The person who receives the death benefit", isCorrect: true, explanation: "Correct! The beneficiary receives the death benefit when the insured dies." },
          { id: "d", text: "The insurance agent", isCorrect: false, explanation: "Agents facilitate sales, they're not beneficiaries." },
        ],
        correctFeedback: "Great! The beneficiary is the person designated to receive the death benefit.",
        incorrectFeedback: "The beneficiary is the person designated to receive the death benefit.",
        difficultyLevel: 1,
      },
      {
        id: "q3",
        type: "multiple_choice",
        category: "Products",
        question: "Which type of life insurance provides coverage for a specific period of time?",
        options: [
          { id: "a", text: "Whole Life", isCorrect: false, explanation: "Whole life provides permanent, lifetime coverage." },
          { id: "b", text: "Term Life", isCorrect: true, explanation: "Correct! Term life covers a specific period like 10, 20, or 30 years." },
          { id: "c", text: "Universal Life", isCorrect: false, explanation: "Universal life is a type of permanent insurance." },
          { id: "d", text: "Annuity", isCorrect: false, explanation: "Annuities are for retirement income, not death benefit protection." },
        ],
        correctFeedback: "Correct! Term life provides affordable temporary protection.",
        incorrectFeedback: "Term life is the type that provides coverage for a specific period.",
        difficultyLevel: 1,
      },
      {
        id: "q4",
        type: "true_false",
        category: "Heritage",
        question: "Heritage Life's sales methodology is called 'education-first selling'.",
        options: [
          { id: "true", text: "True", isCorrect: true, explanation: "Correct! We focus on educating clients before making recommendations." },
          { id: "false", text: "False", isCorrect: false, explanation: "We do use education-first selling at Heritage." },
        ],
        correctFeedback: "Right! Education-first selling is core to the Heritage approach.",
        incorrectFeedback: "Heritage uses education-first selling - teaching before recommending.",
        difficultyLevel: 1,
      },
      {
        id: "q5",
        type: "multiple_choice",
        category: "Compliance",
        question: "What is 'suitability' in insurance sales?",
        options: [
          { id: "a", text: "Selling the most expensive policy", isCorrect: false, explanation: "Suitability isn't about price, it's about fit." },
          { id: "b", text: "Recommending products that are appropriate for the client's needs", isCorrect: true, explanation: "Correct! Suitability means matching products to client needs and circumstances." },
          { id: "c", text: "Getting the application approved quickly", isCorrect: false, explanation: "Speed isn't related to suitability." },
          { id: "d", text: "Meeting your sales quota", isCorrect: false, explanation: "Quotas have nothing to do with suitability." },
        ],
        correctFeedback: "Excellent! Suitability is critical - recommending what's right for each client.",
        incorrectFeedback: "Suitability means recommending appropriate products for each client's situation.",
        difficultyLevel: 1,
      },
    ],
  },

  // Day 2 - Script Mastery Assessment
  "script-quiz": {
    id: "script-quiz",
    title: "Script Mastery Check",
    description: "Test your understanding of Heritage scripts and conversation techniques",
    moduleId: "day2-scripts",
    certificationLevel: "pre_access",
    passingScore: 70,
    timeLimit: 10,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "sq1",
        type: "multiple_choice",
        category: "Credibility",
        question: "According to the training, trust is typically established within what timeframe?",
        options: [
          { id: "a", text: "The first 30 seconds", isCorrect: true, explanation: "Correct! First impressions are formed very quickly." },
          { id: "b", text: "The first 5 minutes", isCorrect: false, explanation: "Trust building starts much earlier than this." },
          { id: "c", text: "After the first meeting", isCorrect: false, explanation: "Trust must be established early, not after." },
          { id: "d", text: "When the sale closes", isCorrect: false, explanation: "If trust isn't established early, you won't get to the close." },
        ],
        correctFeedback: "Right! Make those first 30 seconds count.",
        incorrectFeedback: "Trust is built in the first 30 seconds - make them count!",
        difficultyLevel: 1,
      },
      {
        id: "sq2",
        type: "multiple_choice",
        category: "Rapport",
        question: "What is the recommended listening-to-talking ratio when building rapport?",
        options: [
          { id: "a", text: "50/50 - equal talking and listening", isCorrect: false, explanation: "You should listen more than you talk." },
          { id: "b", text: "80/20 - listen 80%, talk 20%", isCorrect: true, explanation: "Correct! Let the client do most of the talking." },
          { id: "c", text: "70/30 - talk 70%, listen 30%", isCorrect: false, explanation: "This is backwards - listen more, talk less." },
          { id: "d", text: "90/10 - talk 90%, listen 10%", isCorrect: false, explanation: "This would leave no room for client input." },
        ],
        correctFeedback: "Excellent! Great advisors listen far more than they talk.",
        incorrectFeedback: "The 80/20 rule: Listen 80%, talk 20%.",
        difficultyLevel: 1,
      },
      {
        id: "sq3",
        type: "multiple_choice",
        category: "Discovery",
        question: "What does SIPT stand for in the Heritage Discovery Sequence?",
        options: [
          { id: "a", text: "Sales, Information, Presentation, Transition", isCorrect: false, explanation: "This isn't the correct sequence." },
          { id: "b", text: "Situation, Impact, Priority, Timeline", isCorrect: true, explanation: "Correct! SIPT guides you through effective discovery." },
          { id: "c", text: "Start, Identify, Propose, Track", isCorrect: false, explanation: "This isn't the Heritage discovery sequence." },
          { id: "d", text: "Screen, Interview, Present, Thank", isCorrect: false, explanation: "This isn't the correct framework." },
        ],
        correctFeedback: "Right! SIPT: Situation, Impact, Priority, Timeline.",
        incorrectFeedback: "SIPT stands for Situation, Impact, Priority, Timeline.",
        difficultyLevel: 2,
      },
      {
        id: "sq4",
        type: "multiple_choice",
        category: "Objections",
        question: "What does LAER stand for in objection handling?",
        options: [
          { id: "a", text: "Listen, Acknowledge, Explore, Respond", isCorrect: true, explanation: "Correct! LAER is your objection handling framework." },
          { id: "b", text: "Look, Ask, Explain, Resolve", isCorrect: false, explanation: "This isn't the correct framework." },
          { id: "c", text: "Lead, Affirm, Engage, Review", isCorrect: false, explanation: "This isn't the LAER framework." },
          { id: "d", text: "Learn, Accept, Execute, Retain", isCorrect: false, explanation: "This isn't the correct sequence." },
        ],
        correctFeedback: "Excellent! LAER helps you handle any objection professionally.",
        incorrectFeedback: "LAER: Listen, Acknowledge, Explore, Respond.",
        difficultyLevel: 2,
      },
      {
        id: "sq5",
        type: "true_false",
        category: "Closing",
        question: "According to Heritage's philosophy, closing is about helping clients make the decision they already want to make.",
        options: [
          { id: "true", text: "True", isCorrect: true, explanation: "Correct! Closing is guidance, not manipulation." },
          { id: "false", text: "False", isCorrect: false, explanation: "We believe closing is helpful guidance, not pressure." },
        ],
        correctFeedback: "Right! Closing is about guiding, not pressuring.",
        incorrectFeedback: "Heritage views closing as helpful guidance for the client's decision.",
        difficultyLevel: 1,
      },
    ],
  },

  "day2-assessment": {
    id: "day2-assessment",
    title: "Day 2 Comprehensive Assessment",
    description: "Complete assessment covering all Day 2 training material",
    moduleId: "day2-complete",
    certificationLevel: "pre_access",
    passingScore: 75,
    timeLimit: 15,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "d2a1",
        type: "multiple_choice",
        category: "Scripts",
        question: "When presenting premiums, what should you always do FIRST?",
        options: [
          { id: "a", text: "State the monthly cost", isCorrect: false, explanation: "Price without context causes sticker shock." },
          { id: "b", text: "Establish value", isCorrect: true, explanation: "Correct! Value must come before price." },
          { id: "c", text: "Compare to competitors", isCorrect: false, explanation: "Comparison isn't the first step." },
          { id: "d", text: "Offer a discount", isCorrect: false, explanation: "Discounts shouldn't be your first move." },
        ],
        correctFeedback: "Excellent! Always establish value before discussing price.",
        incorrectFeedback: "Always establish value before presenting the premium.",
        difficultyLevel: 2,
      },
      {
        id: "d2a2",
        type: "multiple_choice",
        category: "Compliance",
        question: "What is 'twisting' in insurance sales?",
        options: [
          { id: "a", text: "Replacing a policy just to earn commission", isCorrect: true, explanation: "Correct! Twisting is illegal and unethical." },
          { id: "b", text: "Explaining policy features in detail", isCorrect: false, explanation: "Detailed explanations are good practice." },
          { id: "c", text: "Offering multiple policy options", isCorrect: false, explanation: "Offering options is normal sales practice." },
          { id: "d", text: "Following up with clients", isCorrect: false, explanation: "Follow-up is essential and encouraged." },
        ],
        correctFeedback: "Right! Never replace policies just for commission - that's illegal.",
        incorrectFeedback: "Twisting is replacing policies just for commission - it's illegal.",
        difficultyLevel: 2,
      },
      {
        id: "d2a3",
        type: "multiple_choice",
        category: "Health Questions",
        question: "Before asking health questions, what should you do?",
        options: [
          { id: "a", text: "Apologize for having to ask", isCorrect: false, explanation: "Don't apologize - these questions are standard." },
          { id: "b", text: "Set expectations and explain why", isCorrect: true, explanation: "Correct! Let them know what to expect and why." },
          { id: "c", text: "Skip them if the client seems healthy", isCorrect: false, explanation: "Never skip required questions." },
          { id: "d", text: "Rush through them quickly", isCorrect: false, explanation: "Take time to be thorough and accurate." },
        ],
        correctFeedback: "Excellent! Setting expectations makes sensitive questions easier.",
        incorrectFeedback: "Always set expectations before asking health questions.",
        difficultyLevel: 2,
      },
      {
        id: "d2a4",
        type: "true_false",
        category: "Objections",
        question: "An objection like 'I need to think about it' usually means the client needs more information.",
        options: [
          { id: "true", text: "True", isCorrect: true, explanation: "Correct! Objections are often requests for more info." },
          { id: "false", text: "False", isCorrect: false, explanation: "Objections usually indicate a need for more information." },
        ],
        correctFeedback: "Right! Explore to find what information they still need.",
        incorrectFeedback: "Objections are typically requests for more information.",
        difficultyLevel: 1,
      },
      {
        id: "d2a5",
        type: "multiple_choice",
        category: "Client Service",
        question: "How often should you check in with clients at minimum?",
        options: [
          { id: "a", text: "Only when they call you", isCorrect: false, explanation: "Proactive check-ins are essential." },
          { id: "b", text: "Annually", isCorrect: true, explanation: "Correct! Annual reviews at minimum." },
          { id: "c", text: "Every 5 years", isCorrect: false, explanation: "That's too infrequent - needs change faster." },
          { id: "d", text: "Never - the sale is complete", isCorrect: false, explanation: "Ongoing service builds relationships and referrals." },
        ],
        correctFeedback: "Right! Annual reviews keep coverage aligned with changing needs.",
        incorrectFeedback: "Check in with clients at least annually.",
        difficultyLevel: 1,
      },
      {
        id: "d2a6",
        type: "multiple_choice",
        category: "Replacement",
        question: "When should a client cancel their existing coverage?",
        options: [
          { id: "a", text: "As soon as they sign the new application", isCorrect: false, explanation: "Never cancel before new coverage is active." },
          { id: "b", text: "When you tell them to", isCorrect: false, explanation: "This could leave them unprotected." },
          { id: "c", text: "After the new policy is approved and delivered", isCorrect: true, explanation: "Correct! Keep old coverage until new is active." },
          { id: "d", text: "Before meeting with you", isCorrect: false, explanation: "This would leave them unprotected." },
        ],
        correctFeedback: "Excellent! Never let a client be without coverage.",
        incorrectFeedback: "Keep existing coverage until new policy is approved and delivered.",
        difficultyLevel: 2,
      },
    ],
  },

  // Day 3 - Product Knowledge
  "day3-quiz": {
    id: "day3-quiz",
    title: "Product Knowledge Assessment",
    description: "Test your understanding of Heritage Life products",
    moduleId: "day3-products",
    certificationLevel: "pre_access",
    passingScore: 70,
    timeLimit: 20,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        category: "Term Life",
        question: "What is the primary benefit of term life insurance?",
        options: [
          { id: "a", text: "Cash value accumulation", isCorrect: false, explanation: "Term life does not build cash value." },
          { id: "b", text: "Affordable temporary protection", isCorrect: true, explanation: "Correct! Term life provides affordable coverage for a specific period." },
          { id: "c", text: "Dividend payments", isCorrect: false, explanation: "Term life does not pay dividends." },
          { id: "d", text: "Guaranteed lifetime coverage", isCorrect: false, explanation: "Term life covers a specific period, not lifetime." },
        ],
        correctFeedback: "Excellent! Term life is valued for its affordability and temporary protection.",
        incorrectFeedback: "Term life's primary benefit is affordable temporary protection, not cash value or dividends.",
        difficultyLevel: 1,
      },
      {
        id: "q2",
        type: "multiple_choice",
        category: "Whole Life",
        question: "What are the three guarantees of whole life insurance?",
        options: [
          { id: "a", text: "Premium, death benefit, and cash value", isCorrect: true, explanation: "Correct! These are the three core guarantees of whole life." },
          { id: "b", text: "Premium, dividends, and cash value", isCorrect: false, explanation: "Dividends are not guaranteed in whole life." },
          { id: "c", text: "Death benefit, dividends, and term length", isCorrect: false, explanation: "This is not correct - dividends aren't guaranteed and whole life doesn't have a term." },
          { id: "d", text: "Cash value, interest rate, and premium", isCorrect: false, explanation: "Interest rate is not a specific guarantee." },
        ],
        correctFeedback: "Great job! Premium, death benefit, and cash value are all guaranteed.",
        incorrectFeedback: "Whole life guarantees: level premium, minimum death benefit, and minimum cash value growth.",
        difficultyLevel: 2,
      },
      {
        id: "q3",
        type: "multiple_choice",
        category: "IUL",
        question: "In an Indexed Universal Life (IUL) policy, what does a 'floor' refer to?",
        options: [
          { id: "a", text: "The maximum interest rate credited", isCorrect: false, explanation: "That's the cap, not the floor." },
          { id: "b", text: "The minimum interest rate credited (protects from losses)", isCorrect: true, explanation: "Correct! The floor protects against negative returns." },
          { id: "c", text: "The initial premium amount", isCorrect: false, explanation: "The floor relates to interest crediting, not premiums." },
          { id: "d", text: "The death benefit minimum", isCorrect: false, explanation: "The floor is about interest crediting protection." },
        ],
        correctFeedback: "Correct! The floor (typically 0%) protects the cash value from market losses.",
        incorrectFeedback: "The floor is the minimum interest rate credited, protecting against negative returns.",
        difficultyLevel: 2,
      },
      {
        id: "q4",
        type: "multiple_choice",
        category: "Annuities",
        question: "Which type of annuity offers principal protection with interest linked to a market index?",
        options: [
          { id: "a", text: "Fixed annuity", isCorrect: false, explanation: "Fixed annuities have guaranteed rates, not index-linked." },
          { id: "b", text: "Variable annuity", isCorrect: false, explanation: "Variable annuities have market risk without principal protection." },
          { id: "c", text: "Fixed indexed annuity (FIA)", isCorrect: true, explanation: "Correct! FIAs combine principal protection with index-linked growth potential." },
          { id: "d", text: "Immediate annuity", isCorrect: false, explanation: "Immediate annuities convert a lump sum to income, different purpose." },
        ],
        correctFeedback: "Excellent! FIAs offer the best of both worlds - protection and growth potential.",
        incorrectFeedback: "Fixed indexed annuities combine principal protection with index-linked interest.",
        difficultyLevel: 2,
      },
      {
        id: "q5",
        type: "true_false",
        category: "Term Life",
        question: "Convertible term insurance allows the policyholder to convert to permanent insurance without new underwriting.",
        options: [
          { id: "true", text: "True", isCorrect: true, explanation: "Correct! This is a valuable feature of convertible term." },
          { id: "false", text: "False", isCorrect: false, explanation: "Convertible term does allow conversion without new underwriting." },
        ],
        correctFeedback: "Correct! Conversion without underwriting is a key benefit.",
        incorrectFeedback: "Convertible term allows conversion to permanent coverage without new medical underwriting.",
        difficultyLevel: 1,
      },
    ],
  },

  "day4-assessment": {
    id: "day4-assessment",
    title: "Sales Skills Assessment",
    description: "Demonstrate your sales knowledge and technique",
    moduleId: "day4-sales",
    certificationLevel: "pre_access",
    passingScore: 70,
    timeLimit: 20,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "s1",
        type: "multiple_choice",
        category: "Sales Process",
        question: "What is the correct order of the Heritage 5-step sales process?",
        options: [
          { id: "a", text: "Discover, Connect, Educate, Recommend, Guide", isCorrect: false },
          { id: "b", text: "Connect, Discover, Educate, Recommend, Guide", isCorrect: true, explanation: "Correct order!" },
          { id: "c", text: "Educate, Connect, Discover, Guide, Recommend", isCorrect: false },
          { id: "d", text: "Connect, Educate, Discover, Recommend, Guide", isCorrect: false },
        ],
        correctFeedback: "Perfect! Connect first, then discover needs, educate, recommend, and guide to decision.",
        incorrectFeedback: "The correct order: Connect, Discover, Educate, Recommend, Guide.",
        difficultyLevel: 1,
      },
      {
        id: "s2",
        type: "multiple_choice",
        category: "Objection Handling",
        question: "In the LAER objection handling method, what does the 'E' stand for?",
        options: [
          { id: "a", text: "Explain", isCorrect: false },
          { id: "b", text: "Empathize", isCorrect: false },
          { id: "c", text: "Explore", isCorrect: true, explanation: "Correct! Explore to understand the real objection." },
          { id: "d", text: "Educate", isCorrect: false },
        ],
        correctFeedback: "Correct! Explore helps you understand the real concern behind the objection.",
        incorrectFeedback: "LAER = Listen, Acknowledge, Explore, Respond.",
        difficultyLevel: 1,
      },
      {
        id: "s3",
        type: "advisor_prompt",
        category: "Discovery",
        question: "A client says 'I already have life insurance through work.' What is the best response?",
        scenario: "You're meeting with a 35-year-old professional who dismisses your offer by mentioning employer coverage.",
        options: [
          { id: "a", text: "Explain why work insurance isn't enough", isCorrect: false, explanation: "This is telling, not discovering." },
          { id: "b", text: "Ask about the coverage amount and portability", isCorrect: true, explanation: "Correct! Explore their current situation first." },
          { id: "c", text: "Move on to another topic", isCorrect: false, explanation: "This abandons the opportunity to help." },
          { id: "d", text: "Offer a cheaper alternative", isCorrect: false, explanation: "You haven't discovered their needs yet." },
        ],
        correctFeedback: "Excellent! Asking questions helps them discover potential gaps themselves.",
        incorrectFeedback: "The best approach is to ask questions that help them evaluate their current coverage.",
        difficultyLevel: 2,
      },
      {
        id: "s4",
        type: "multiple_choice",
        category: "Closing",
        question: "What is the education-first approach to closing?",
        options: [
          { id: "a", text: "Use urgency and scarcity to motivate action", isCorrect: false, explanation: "This is pressure selling, not education-first." },
          { id: "b", text: "Educate fully so clients can make informed decisions", isCorrect: true, explanation: "Correct! Informed clients make confident decisions." },
          { id: "c", text: "Provide as much information as possible to overwhelm objections", isCorrect: false, explanation: "Information overload isn't effective." },
          { id: "d", text: "Let the client educate themselves online", isCorrect: false, explanation: "We guide the education process." },
        ],
        correctFeedback: "Perfect! When clients are educated, closing becomes a natural next step.",
        incorrectFeedback: "Education-first means helping clients understand so they can decide confidently.",
        difficultyLevel: 2,
      },
    ],
  },

  "compliance-cert": {
    id: "compliance-cert",
    title: "Compliance Certification Exam",
    description: "Complete certification to demonstrate compliance knowledge",
    moduleId: "day5-compliance",
    certificationLevel: "pre_access",
    passingScore: 80,
    timeLimit: 30,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ["c3", "c5"],
    questions: [
      {
        id: "c1",
        type: "multiple_choice",
        category: "Regulatory",
        question: "Insurance is primarily regulated at which level?",
        options: [
          { id: "a", text: "Federal level only", isCorrect: false },
          { id: "b", text: "State level primarily", isCorrect: true, explanation: "Correct! Each state has its own insurance department." },
          { id: "c", text: "Local/municipal level", isCorrect: false },
          { id: "d", text: "International level", isCorrect: false },
        ],
        correctFeedback: "Correct! Insurance is regulated state-by-state.",
        incorrectFeedback: "Insurance regulation is primarily at the state level.",
        difficultyLevel: 1,
      },
      {
        id: "c2",
        type: "multiple_choice",
        category: "Suitability",
        question: "What factors must be considered in a suitability analysis?",
        options: [
          { id: "a", text: "Only the client's budget", isCorrect: false },
          { id: "b", text: "Only the product features", isCorrect: false },
          { id: "c", text: "Client's financial situation, needs, objectives, and risk tolerance", isCorrect: true },
          { id: "d", text: "Only the commission amount", isCorrect: false },
        ],
        correctFeedback: "Excellent! Suitability considers the whole financial picture.",
        incorrectFeedback: "Suitability requires analyzing the client's complete financial situation and needs.",
        difficultyLevel: 2,
      },
      {
        id: "c3",
        type: "multiple_choice",
        category: "Ethics",
        question: "A client asks you to backdate their application to get a lower premium. What should you do?",
        options: [
          { id: "a", text: "Agree if the date difference is small", isCorrect: false, explanation: "This is fraud regardless of the time period." },
          { id: "b", text: "Refuse and explain this would be fraudulent", isCorrect: true, explanation: "Correct! Backdating is fraud." },
          { id: "c", text: "Check with your manager first", isCorrect: false, explanation: "The answer is clear - backdating is always wrong." },
          { id: "d", text: "Agree to help maintain the relationship", isCorrect: false, explanation: "Never commit fraud for any reason." },
        ],
        correctFeedback: "Correct! Always refuse fraudulent requests.",
        incorrectFeedback: "Backdating is fraud. You must refuse and explain why.",
        difficultyLevel: 2,
        autoFailOnIncorrect: true,
      },
      {
        id: "c4",
        type: "multiple_choice",
        category: "Privacy",
        question: "Under HIPAA, what is the 'minimum necessary' standard?",
        options: [
          { id: "a", text: "Use the minimum amount of health information needed for the purpose", isCorrect: true },
          { id: "b", text: "Only collect minimal client information", isCorrect: false },
          { id: "c", text: "Require minimum documentation", isCorrect: false },
          { id: "d", text: "Keep communications brief", isCorrect: false },
        ],
        correctFeedback: "Correct! Only access and use the health information necessary for the task.",
        incorrectFeedback: "Minimum necessary means only accessing/using PHI needed for the specific purpose.",
        difficultyLevel: 2,
      },
      {
        id: "c5",
        type: "true_false",
        category: "Prohibited Practices",
        question: "It is acceptable to offer clients a rebate (share of commission) to close a sale.",
        options: [
          { id: "true", text: "True", isCorrect: false, explanation: "Rebating is prohibited in most states." },
          { id: "false", text: "False", isCorrect: true, explanation: "Correct! Rebating is illegal in most jurisdictions." },
        ],
        correctFeedback: "Correct! Rebating is prohibited and can result in license revocation.",
        incorrectFeedback: "Rebating is illegal in most states and grounds for license revocation.",
        difficultyLevel: 2,
        autoFailOnIncorrect: true,
      },
    ],
  },

  "day6-assessment": {
    id: "day6-assessment",
    title: "Communication Skills Assessment",
    description: "Demonstrate your client communication abilities",
    moduleId: "day6-communication",
    certificationLevel: "pre_access",
    passingScore: 70,
    timeLimit: 20,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "comm1",
        type: "multiple_choice",
        category: "Communication Styles",
        question: "A client speaks quickly, focuses on results, and seems impatient. Which communication style are they likely?",
        options: [
          { id: "a", text: "Dominant (D)", isCorrect: true, explanation: "Correct! D-styles are direct and results-focused." },
          { id: "b", text: "Influential (I)", isCorrect: false },
          { id: "c", text: "Steady (S)", isCorrect: false },
          { id: "d", text: "Conscientious (C)", isCorrect: false },
        ],
        correctFeedback: "Correct! Dominant personalities are direct and want quick, clear answers.",
        incorrectFeedback: "Quick, results-oriented, impatient = Dominant (D) style.",
        difficultyLevel: 1,
      },
      {
        id: "comm2",
        type: "advisor_prompt",
        category: "Adaptation",
        question: "How should you adapt your approach for a Conscientious (C) style client?",
        scenario: "Your client is an engineer who asks detailed questions and takes notes during your presentation.",
        options: [
          { id: "a", text: "Speed up and focus on emotional benefits", isCorrect: false },
          { id: "b", text: "Provide detailed data, facts, and allow time for analysis", isCorrect: true },
          { id: "c", text: "Use lots of stories and personal anecdotes", isCorrect: false },
          { id: "d", text: "Focus on building a personal relationship first", isCorrect: false },
        ],
        correctFeedback: "Excellent! C-styles want facts, details, and time to analyze.",
        incorrectFeedback: "Conscientious types appreciate detailed information and time to analyze it.",
        difficultyLevel: 2,
      },
      {
        id: "comm3",
        type: "multiple_choice",
        category: "Phone Skills",
        question: "What should you always do at the beginning of a phone call?",
        options: [
          { id: "a", text: "Launch directly into your pitch", isCorrect: false },
          { id: "b", text: "Clearly identify yourself and your company", isCorrect: true },
          { id: "c", text: "Ask personal questions to build rapport", isCorrect: false },
          { id: "d", text: "Confirm they have unlimited time to talk", isCorrect: false },
        ],
        correctFeedback: "Correct! Clear identification is professional and required.",
        incorrectFeedback: "Always clearly identify yourself and your company first.",
        difficultyLevel: 1,
      },
      {
        id: "comm4",
        type: "multiple_choice",
        category: "Storytelling",
        question: "What is the recommended length for a sales story?",
        options: [
          { id: "a", text: "3-5 minutes", isCorrect: false },
          { id: "b", text: "60-90 seconds", isCorrect: true, explanation: "Correct! Brief stories maintain attention." },
          { id: "c", text: "As long as needed", isCorrect: false },
          { id: "d", text: "Under 30 seconds", isCorrect: false },
        ],
        correctFeedback: "Perfect! Keep stories concise to maintain engagement.",
        incorrectFeedback: "60-90 seconds is ideal - long enough to be meaningful, short enough to maintain interest.",
        difficultyLevel: 1,
      },
    ],
  },

  // Day 7 Final Assessments
  "product-assessment": {
    id: "product-assessment",
    title: "Product Knowledge Assessment",
    description: "Comprehensive test on all Heritage Life products",
    moduleId: "week1-products",
    certificationLevel: "pre_access",
    passingScore: 75,
    timeLimit: 30,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "p1",
        type: "multiple_choice",
        category: "Term Life",
        question: "A 35-year-old with young children needs affordable protection for 20 years. Which product is most suitable?",
        options: [
          { id: "a", text: "Whole life insurance", isCorrect: false },
          { id: "b", text: "20-year level term life", isCorrect: true, explanation: "Correct! Matches their timeframe and budget needs." },
          { id: "c", text: "Fixed indexed annuity", isCorrect: false },
          { id: "d", text: "Variable universal life", isCorrect: false },
        ],
        correctFeedback: "Excellent! 20-year term matches their protection needs and budget.",
        incorrectFeedback: "20-year level term provides affordable protection matching their timeline.",
        difficultyLevel: 2,
      },
      {
        id: "p2",
        type: "multiple_choice",
        category: "Whole Life",
        question: "A client wants permanent protection with guaranteed growth and the ability to borrow against the policy. What's best?",
        options: [
          { id: "a", text: "Term life with return of premium", isCorrect: false },
          { id: "b", text: "Whole life insurance", isCorrect: true, explanation: "Correct! Whole life provides all these features." },
          { id: "c", text: "Fixed annuity", isCorrect: false },
          { id: "d", text: "Decreasing term", isCorrect: false },
        ],
        correctFeedback: "Perfect! Whole life provides permanent coverage, guaranteed cash value, and loan access.",
        incorrectFeedback: "Whole life meets all these requirements: permanent, guaranteed growth, loan access.",
        difficultyLevel: 2,
      },
      {
        id: "p3",
        type: "multiple_choice",
        category: "IUL",
        question: "What happens to IUL cash value when the linked index has a negative year?",
        options: [
          { id: "a", text: "Cash value decreases by the index loss", isCorrect: false },
          { id: "b", text: "Cash value is credited the floor rate (typically 0%)", isCorrect: true, explanation: "Correct! The floor protects from losses." },
          { id: "c", text: "The policy lapses", isCorrect: false },
          { id: "d", text: "Premium increases to compensate", isCorrect: false },
        ],
        correctFeedback: "Excellent! The floor (typically 0%) protects cash value from market losses.",
        incorrectFeedback: "IUL has a floor (usually 0%) that protects cash value when the index is negative.",
        difficultyLevel: 2,
      },
      {
        id: "p4",
        type: "advisor_prompt",
        category: "Annuities",
        question: "A 58-year-old client has maxed out their 401k and IRA. They want additional tax-deferred retirement savings with some growth potential but protection from market losses. What do you recommend?",
        scenario: "Client is 7 years from retirement with moderate risk tolerance.",
        options: [
          { id: "a", text: "Variable annuity", isCorrect: false, explanation: "Variable annuities have market risk." },
          { id: "b", text: "Fixed indexed annuity", isCorrect: true, explanation: "Correct! FIA offers tax-deferred growth with downside protection." },
          { id: "c", text: "Term life insurance", isCorrect: false },
          { id: "d", text: "Whole life insurance", isCorrect: false },
        ],
        correctFeedback: "Perfect! FIA provides tax-deferred growth, index-linked potential, and principal protection.",
        incorrectFeedback: "Fixed indexed annuity matches their needs: tax-deferral, growth potential, protection.",
        difficultyLevel: 3,
      },
    ],
  },

  "sales-assessment": {
    id: "sales-assessment",
    title: "Sales Skills Assessment",
    description: "Demonstrate your sales process and objection handling",
    moduleId: "week1-sales",
    certificationLevel: "pre_access",
    passingScore: 75,
    timeLimit: 25,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: [],
    questions: [
      {
        id: "sa1",
        type: "advisor_prompt",
        category: "Discovery",
        question: "Which opening question best starts the discovery phase?",
        scenario: "You're beginning a first meeting with a new prospect.",
        options: [
          { id: "a", text: "Have you thought about how much insurance you need?", isCorrect: false },
          { id: "b", text: "Tell me about your family and what's most important to you.", isCorrect: true },
          { id: "c", text: "Do you know our term rates are very competitive?", isCorrect: false },
          { id: "d", text: "When would you like to start your coverage?", isCorrect: false },
        ],
        correctFeedback: "Excellent! Open-ended questions about them yield the best discovery.",
        incorrectFeedback: "Start with open-ended questions about their family and priorities.",
        difficultyLevel: 2,
      },
      {
        id: "sa2",
        type: "advisor_prompt",
        category: "Objection Handling",
        question: "A client says 'I can't afford it right now.' Using LAER, what's your best next step after listening and acknowledging?",
        scenario: "Client seems interested but raises a budget concern.",
        options: [
          { id: "a", text: "Offer a smaller policy immediately", isCorrect: false },
          { id: "b", text: "Explore what 'afford' means - is it priority or actual budget?", isCorrect: true },
          { id: "c", text: "End the conversation and follow up later", isCorrect: false },
          { id: "d", text: "Explain how insurance saves money long-term", isCorrect: false },
        ],
        correctFeedback: "Perfect! Explore to understand if it's truly budget or priority.",
        incorrectFeedback: "In LAER, Explore comes next - understand if it's budget or priority.",
        difficultyLevel: 2,
      },
      {
        id: "sa3",
        type: "multiple_choice",
        category: "Closing",
        question: "What is the education-first approach's primary closing technique?",
        options: [
          { id: "a", text: "Create urgency with limited-time offers", isCorrect: false },
          { id: "b", text: "Let the client's understanding guide them to decide", isCorrect: true },
          { id: "c", text: "Use assumptive closes", isCorrect: false },
          { id: "d", text: "Apply social proof pressure", isCorrect: false },
        ],
        correctFeedback: "Correct! Education builds confidence for natural decision-making.",
        incorrectFeedback: "Education-first relies on understanding, not pressure techniques.",
        difficultyLevel: 2,
      },
    ],
  },

  "compliance-assessment": {
    id: "compliance-assessment",
    title: "Compliance & Ethics Assessment",
    description: "Final compliance certification exam",
    moduleId: "week1-compliance",
    certificationLevel: "pre_access",
    passingScore: 80,
    timeLimit: 20,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    showCorrectAnswers: true,
    requiresProctoring: false,
    autoFailQuestions: ["ca3"],
    questions: [
      {
        id: "ca1",
        type: "advisor_prompt",
        category: "Suitability",
        question: "A 72-year-old on fixed income asks about a 15-year deferred annuity. What's your primary concern?",
        scenario: "Client wants growth but may need funds sooner.",
        options: [
          { id: "a", text: "The surrender charges", isCorrect: false },
          { id: "b", text: "Suitability - the surrender period may exceed their liquidity needs", isCorrect: true },
          { id: "c", text: "The interest rate offered", isCorrect: false },
          { id: "d", text: "The commission amount", isCorrect: false },
        ],
        correctFeedback: "Excellent! Suitability for seniors requires careful liquidity consideration.",
        incorrectFeedback: "Primary concern is suitability - a 15-year surrender period may not suit a 72-year-old's needs.",
        difficultyLevel: 3,
      },
      {
        id: "ca2",
        type: "multiple_choice",
        category: "Documentation",
        question: "How long should client records typically be retained?",
        options: [
          { id: "a", text: "1-2 years", isCorrect: false },
          { id: "b", text: "5-7 years or as required by state", isCorrect: true },
          { id: "c", text: "Until the policy ends", isCorrect: false },
          { id: "d", text: "6 months", isCorrect: false },
        ],
        correctFeedback: "Correct! Standard retention is 5-7 years, but check state requirements.",
        incorrectFeedback: "Records should be retained 5-7 years minimum, or as required by state.",
        difficultyLevel: 2,
      },
      {
        id: "ca3",
        type: "advisor_prompt",
        category: "Ethics",
        question: "A top-producing colleague suggests you report projected earnings higher than realistic. What do you do?",
        scenario: "They say 'everyone does it' to hit quotas.",
        options: [
          { id: "a", text: "Do it since it's common practice", isCorrect: false },
          { id: "b", text: "Refuse and report the suggestion to compliance", isCorrect: true },
          { id: "c", text: "Do it just this once", isCorrect: false },
          { id: "d", text: "Ask your manager if it's okay", isCorrect: false },
        ],
        correctFeedback: "Correct! Refuse and report - falsifying reports is fraud.",
        incorrectFeedback: "Falsifying reports is fraud. You must refuse and report to compliance.",
        difficultyLevel: 3,
        autoFailOnIncorrect: true,
      },
    ],
  },

  // ============================================================================
  // DAYS 8-30: WEEK 2-4 ASSESSMENTS
  // ============================================================================

  "week2-assessment": {
    id: "week2-assessment",
    title: "Week 2 Assessment: Client Engagement",
    description: "Test your knowledge of lead qualification and CRM management",
    passingScore: 80,
    timeLimit: 30,
    questions: [
      {
        id: "w2q1",
        type: "multiple_choice",
        category: "Lead Qualification",
        question: "What are the four key factors to assess when qualifying a lead?",
        options: [
          { id: "a", text: "Name, Address, Phone, Email", isCorrect: false },
          { id: "b", text: "Need, Timing, Authority, Budget", isCorrect: true },
          { id: "c", text: "Age, Income, Health, Location", isCorrect: false },
          { id: "d", text: "Interest, Urgency, Price, Features", isCorrect: false },
        ],
        correctFeedback: "Correct! NTAB - Need, Timing, Authority, Budget are the four qualification factors.",
        incorrectFeedback: "The four factors are: Need, Timing, Authority, and Budget (NTAB).",
        difficultyLevel: 1,
      },
      {
        id: "w2q2",
        type: "multiple_choice",
        category: "CRM",
        question: "How often should you update your CRM?",
        options: [
          { id: "a", text: "Weekly summary", isCorrect: false },
          { id: "b", text: "After every client interaction", isCorrect: true },
          { id: "c", text: "When you remember", isCorrect: false },
          { id: "d", text: "Monthly review", isCorrect: false },
        ],
        correctFeedback: "Correct! Update after every interaction to keep your pipeline accurate.",
        incorrectFeedback: "You should update after every client interaction - if it's not in the CRM, it didn't happen.",
        difficultyLevel: 1,
      },
      {
        id: "w2q3",
        type: "advisor_prompt",
        category: "Prospecting",
        question: "A lead says they're 'just looking' and not ready to buy. What's the best response?",
        options: [
          { id: "a", text: "Thank them and move on to the next lead", isCorrect: false },
          { id: "b", text: "Ask what prompted their interest and add to nurture sequence", isCorrect: true },
          { id: "c", text: "Push harder to get an appointment", isCorrect: false },
          { id: "d", text: "Offer a discount to create urgency", isCorrect: false },
        ],
        correctFeedback: "Correct! Understanding their motivation helps you serve them when they're ready.",
        incorrectFeedback: "Ask what prompted their interest - they may be closer to buying than they think.",
        difficultyLevel: 2,
      },
    ],
  },

  "week3-assessment": {
    id: "week3-assessment",
    title: "Week 3 Assessment: Sales Mastery",
    description: "Test your presentation and closing skills",
    passingScore: 80,
    timeLimit: 40,
    questions: [
      {
        id: "w3q1",
        type: "multiple_choice",
        category: "Presentations",
        question: "What's the recommended structure for a sales presentation?",
        options: [
          { id: "a", text: "Jump straight to price and close fast", isCorrect: false },
          { id: "b", text: "Opening, Discovery Recap, Education, Recommendation, Close", isCorrect: true },
          { id: "c", text: "List all product features, then ask for the sale", isCorrect: false },
          { id: "d", text: "Let the client lead the entire conversation", isCorrect: false },
        ],
        correctFeedback: "Correct! This structure ensures you address client needs before recommending solutions.",
        incorrectFeedback: "The proper structure is: Opening, Discovery Recap, Education, Recommendation, Close.",
        difficultyLevel: 2,
      },
      {
        id: "w3q2",
        type: "advisor_prompt",
        category: "Objection Handling",
        question: "A client says 'I need to think about it.' What's your best response?",
        options: [
          { id: "a", text: "Okay, call me when you decide", isCorrect: false },
          { id: "b", text: "Ask what specifically they'd like to think about", isCorrect: true },
          { id: "c", text: "Apply pressure to decide now", isCorrect: false },
          { id: "d", text: "Offer a lower price immediately", isCorrect: false },
        ],
        correctFeedback: "Correct! Understanding their concern lets you address it and help them decide.",
        incorrectFeedback: "Ask what they'd like to think about - often you can address the real concern right away.",
        difficultyLevel: 2,
      },
      {
        id: "w3q3",
        type: "multiple_choice",
        category: "Referrals",
        question: "When is the best time to ask for referrals?",
        options: [
          { id: "a", text: "Before they've decided to buy", isCorrect: false },
          { id: "b", text: "After policy delivery and positive experience", isCorrect: true },
          { id: "c", text: "Only after one year as a client", isCorrect: false },
          { id: "d", text: "Never - referrals come naturally", isCorrect: false },
        ],
        correctFeedback: "Correct! After a positive experience, clients are most likely to give quality referrals.",
        incorrectFeedback: "Ask after policy delivery when they're happy - this is when they're most likely to refer.",
        difficultyLevel: 1,
      },
    ],
  },

  "month1-certification": {
    id: "month1-certification",
    title: "Month 1 Certification Exam",
    description: "Comprehensive exam covering all Month 1 training",
    passingScore: 80,
    timeLimit: 60,
    questions: [
      {
        id: "m1q1",
        type: "multiple_choice",
        category: "Products",
        question: "Which product type offers permanent coverage with cash value?",
        options: [
          { id: "a", text: "Term Life", isCorrect: false },
          { id: "b", text: "Whole Life", isCorrect: true },
          { id: "c", text: "Final Expense", isCorrect: false },
          { id: "d", text: "Accidental Death", isCorrect: false },
        ],
        correctFeedback: "Correct! Whole Life provides permanent coverage with guaranteed cash value.",
        incorrectFeedback: "Whole Life is the product with permanent coverage and cash value accumulation.",
        difficultyLevel: 1,
      },
      {
        id: "m1q2",
        type: "advisor_prompt",
        category: "Sales Process",
        question: "A young couple with a new baby asks about life insurance. What's your first step?",
        options: [
          { id: "a", text: "Show them your most popular policy", isCorrect: false },
          { id: "b", text: "Ask discovery questions to understand their situation and goals", isCorrect: true },
          { id: "c", text: "Quote them the lowest price option", isCorrect: false },
          { id: "d", text: "Tell them about your commission structure", isCorrect: false },
        ],
        correctFeedback: "Correct! Discovery first ensures you recommend the right solution.",
        incorrectFeedback: "Always start with discovery - understanding before recommending is the Heritage way.",
        difficultyLevel: 2,
      },
      {
        id: "m1q3",
        type: "multiple_choice",
        category: "Compliance",
        question: "What's the primary purpose of suitability requirements?",
        options: [
          { id: "a", text: "To increase paperwork", isCorrect: false },
          { id: "b", text: "To ensure products match client needs and situation", isCorrect: true },
          { id: "c", text: "To limit what agents can sell", isCorrect: false },
          { id: "d", text: "To satisfy regulators", isCorrect: false },
        ],
        correctFeedback: "Correct! Suitability ensures clients get products appropriate for their needs.",
        incorrectFeedback: "Suitability exists to ensure products match client needs - protecting both client and agent.",
        difficultyLevel: 1,
      },
      {
        id: "m1q4",
        type: "advisor_prompt",
        category: "Objection Handling",
        question: "A prospect says 'Insurance is a waste of money.' How do you respond?",
        options: [
          { id: "a", text: "Agree and end the call", isCorrect: false },
          { id: "b", text: "Acknowledge, then ask about their family's financial security", isCorrect: true },
          { id: "c", text: "Argue that they're wrong", isCorrect: false },
          { id: "d", text: "Offer them a free policy", isCorrect: false },
        ],
        correctFeedback: "Correct! Acknowledge, then redirect to what matters - protecting their family.",
        incorrectFeedback: "Acknowledge their concern, then help them see the value through their own priorities.",
        difficultyLevel: 2,
      },
      {
        id: "m1q5",
        type: "multiple_choice",
        category: "CRM",
        question: "What's the ideal size of your sales pipeline relative to your monthly goal?",
        options: [
          { id: "a", text: "Equal to your monthly goal", isCorrect: false },
          { id: "b", text: "3x your monthly goal", isCorrect: true },
          { id: "c", text: "10x your monthly goal", isCorrect: false },
          { id: "d", text: "Whatever you can manage", isCorrect: false },
        ],
        correctFeedback: "Correct! 3x pipeline ensures consistent results even with normal conversion rates.",
        incorrectFeedback: "Maintain a pipeline 3x your monthly goal for consistent production.",
        difficultyLevel: 2,
      },
    ],
  },
};

// ============================================================================
// SIMULATION SCENARIOS (for simulation and practice tasks)
// ============================================================================

const termLifeClient: ClientProfile = {
  name: "Michael Thompson",
  age: 38,
  occupation: "Software Engineer",
  maritalStatus: "Married",
  dependents: "2 children (ages 5 and 8)",
  income: "$120,000/year",
  primaryConcern: "Protecting family if something happens to me",
  personality: "analytical",
};

export const ONBOARDING_SIMULATIONS: Record<string, SimulationScenario> = {
  "full-simulation": {
    id: "full-simulation",
    title: "Full Client Simulation",
    description: "Complete a full client interaction from introduction to close",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    clientProfile: termLifeClient,
    productType: "term_life",
    certificationLevel: "pre_access",
    startNodeId: "start",
    scoringRubric: {
      categories: [
        { name: "Opening & Rapport", maxPoints: 15 },
        { name: "Discovery Questions", maxPoints: 25 },
        { name: "Education & Explanation", maxPoints: 20 },
        { name: "Handling Objections", maxPoints: 20 },
        { name: "Closing & Next Steps", maxPoints: 20 },
      ],
      passingScore: 70,
      autoFailConditions: ["Misleading statement about product", "Pressure tactics"],
    },
    nodes: [
      {
        id: "start",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Hi, I got your name from my colleague at work. He said you helped his family with life insurance. I've been putting this off but figured it's time to look into it.",
        nextNodeId: "opening-choice",
      },
      {
        id: "opening-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "How do you begin the conversation?",
        choices: [
          {
            id: "open-rapport",
            text: "Thank you for reaching out, Michael. Before we dive in, tell me a bit about yourself and your family.",
            nextNodeId: "rapport-response",
            scoreImpact: { category: "Opening & Rapport", points: 15 },
            feedback: "Great opening - builds rapport before business.",
            isCompliant: true,
          },
          {
            id: "open-pitch",
            text: "Great! Let me tell you about our excellent term life rates.",
            nextNodeId: "pitch-response",
            scoreImpact: { category: "Opening & Rapport", points: 5 },
            feedback: "Too fast - you haven't learned about his needs yet.",
            isCompliant: true,
          },
          {
            id: "open-qualified",
            text: "Before we go further, how much coverage are you looking for?",
            nextNodeId: "qualified-response",
            scoreImpact: { category: "Opening & Rapport", points: 8 },
            feedback: "Qualifying is good, but rapport comes first.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "rapport-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Sure. I'm a software engineer, married for 10 years to Sarah. We have two kids - Emma is 8 and Jake is 5. Sarah works part-time as a teacher. We recently bought a house and I realized if something happened to me, they'd be in trouble.",
        nextNodeId: "discovery-choice",
      },
      {
        id: "pitch-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Um, okay... I don't really know what I need yet. I was hoping we could talk about my situation first.",
        nextNodeId: "discovery-choice",
      },
      {
        id: "qualified-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "I'm not sure, honestly. I know I need something, but I don't know what's typical or what makes sense.",
        nextNodeId: "discovery-choice",
      },
      {
        id: "discovery-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "What discovery question do you ask next?",
        choices: [
          {
            id: "discover-concerns",
            text: "What concerns you most when you think about protecting your family?",
            nextNodeId: "concerns-response",
            scoreImpact: { category: "Discovery Questions", points: 12 },
            feedback: "Excellent - this opens up their emotional drivers.",
            isCompliant: true,
          },
          {
            id: "discover-budget",
            text: "What's your budget for insurance premiums?",
            nextNodeId: "budget-response",
            scoreImpact: { category: "Discovery Questions", points: 6 },
            feedback: "Budget matters, but understanding needs should come first.",
            isCompliant: true,
          },
          {
            id: "discover-coverage",
            text: "Do you have any existing life insurance coverage?",
            nextNodeId: "coverage-response",
            scoreImpact: { category: "Discovery Questions", points: 10 },
            feedback: "Good question - helps understand current situation.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "concerns-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Honestly, I worry about Sarah and the kids. The mortgage is $350,000. I want to make sure they could stay in the house, the kids could go to college, and Sarah wouldn't have to go back to work full-time immediately. She only makes about $30,000 part-time.",
        nextNodeId: "education-choice",
      },
      {
        id: "budget-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "I'm not sure. Maybe $100-200 a month? I haven't really thought about it. What's typical for someone like me?",
        nextNodeId: "education-choice",
      },
      {
        id: "coverage-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "I have a small policy through work - I think it's one times my salary, so about $120,000. But I know that's not nearly enough if something happened.",
        nextNodeId: "education-choice",
      },
      {
        id: "education-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "How do you begin educating Michael about his options?",
        choices: [
          {
            id: "edu-needs",
            text: "Based on what you've shared, let me walk you through how to think about coverage needs. Most financial planners suggest 10-12x income for families with young children and a mortgage.",
            nextNodeId: "education-response",
            scoreImpact: { category: "Education & Explanation", points: 20 },
            feedback: "Excellent! You're educating, not selling.",
            isCompliant: true,
          },
          {
            id: "edu-product",
            text: "Our 20-year term policy is perfect for your situation. Let me explain the features.",
            nextNodeId: "product-response",
            scoreImpact: { category: "Education & Explanation", points: 10 },
            feedback: "Product focus is premature - explain the 'why' first.",
            isCompliant: true,
          },
          {
            id: "edu-quote",
            text: "I can get you a great rate on $1 million of coverage for about $75/month.",
            nextNodeId: "quote-response",
            scoreImpact: { category: "Education & Explanation", points: 5 },
            feedback: "Jumping to quote without proper education isn't education-first.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "education-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "That makes sense. So for me, that would be around $1.2 million to $1.4 million? That seems like a lot. Is that really what most families get?",
        nextNodeId: "objection-choice",
      },
      {
        id: "product-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Okay, but how do I know if a 20-year term is right? And how much should I get?",
        nextNodeId: "objection-choice",
      },
      {
        id: "quote-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Wait, how did you come up with a million dollars? I don't even know if that's the right amount for me.",
        nextNodeId: "objection-choice",
      },
      {
        id: "objection-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "Michael expresses concern about the coverage amount seeming high. How do you respond?",
        choices: [
          {
            id: "obj-explore",
            text: "I understand that seems like a large number. Let's break it down together - what would Sarah need to cover the mortgage, replace your income for a few years, and fund college?",
            nextNodeId: "explore-response",
            scoreImpact: { category: "Handling Objections", points: 20 },
            feedback: "Perfect LAER application - exploring to help them see the need.",
            isCompliant: true,
          },
          {
            id: "obj-trust",
            text: "Trust me, that's what families like yours need. I've been doing this for years.",
            nextNodeId: "trust-response",
            scoreImpact: { category: "Handling Objections", points: 5 },
            feedback: "Authority appeals don't build understanding.",
            isCompliant: true,
          },
          {
            id: "obj-less",
            text: "We could do less if you prefer. How about $500,000?",
            nextNodeId: "less-response",
            scoreImpact: { category: "Handling Objections", points: 10 },
            feedback: "Accommodating, but didn't help him understand his actual needs.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "explore-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Okay, the mortgage is $350,000. If Sarah needed to replace my income for 5 years, that's another $600,000. And college for two kids... maybe $200,000? So actually, $1.1-1.2 million makes sense when I think about it that way.",
        nextNodeId: "closing-choice",
      },
      {
        id: "trust-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "I appreciate that, but I'd really like to understand the math myself. This is a big decision.",
        nextNodeId: "closing-choice",
      },
      {
        id: "less-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Maybe? I don't know. I don't want to be underinsured either. How do I figure out the right amount?",
        nextNodeId: "closing-choice",
      },
      {
        id: "closing-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "It's time to guide Michael toward a decision. What do you say?",
        choices: [
          {
            id: "close-guide",
            text: "Based on our conversation, $1.2 million of 20-year term would cover the mortgage, give Sarah income replacement, and fund college. The next step would be a quick application. How does that sound?",
            nextNodeId: "close-success",
            scoreImpact: { category: "Closing & Next Steps", points: 20 },
            feedback: "Excellent! Clear recommendation tied to their stated needs.",
            isCompliant: true,
          },
          {
            id: "close-pressure",
            text: "I should mention rates are going up next month, so if we can get your application in today, you'll lock in this rate.",
            nextNodeId: "close-pressure-response",
            scoreImpact: { category: "Closing & Next Steps", points: 5 },
            feedback: "Urgency tactics undermine trust.",
            isCompliant: true,
          },
          {
            id: "close-passive",
            text: "Well, let me know if you have any other questions or want to move forward sometime.",
            nextNodeId: "close-passive-response",
            scoreImpact: { category: "Closing & Next Steps", points: 8 },
            feedback: "Too passive - provide clearer guidance and next steps.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "close-success",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "That sounds right. I feel good about this - you've really helped me understand what we need. Let's do it.",
        nextNodeId: "end-success",
      },
      {
        id: "close-pressure-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "I don't like being pressured. I need to think about this and talk to Sarah.",
        nextNodeId: "end-mixed",
      },
      {
        id: "close-passive-response",
        type: "client_response",
        speaker: "client",
        speakerName: "Michael",
        content: "Okay... I guess I'll think about it. I'm not sure what the next step would be.",
        nextNodeId: "end-passive",
      },
      {
        id: "end-success",
        type: "end",
        speaker: "narrator",
        content: "Excellent work! You built rapport, discovered needs, educated effectively, handled objections with empathy, and guided Michael to a confident decision. This is the education-first approach in action.",
        outcome: "application_submitted",
        finalRating: "excellent",
      },
      {
        id: "end-mixed",
        type: "end",
        speaker: "narrator",
        content: "The pressure tactic at the end undermined the trust you built. Michael will likely not return. Remember: guide, don't push.",
        outcome: "follow_up_scheduled",
        finalRating: "needs_improvement",
      },
      {
        id: "end-passive",
        type: "end",
        speaker: "narrator",
        content: "You educated well but didn't provide clear next steps. Clients need guidance - being too passive leaves them uncertain. Offer a clear recommendation and action step.",
        outcome: "needs_time",
        finalRating: "acceptable",
      },
    ],
  },

  "product-comparison": {
    id: "product-comparison",
    title: "Product Comparison Workshop",
    description: "Practice recommending the right product for different scenarios",
    difficulty: "beginner",
    estimatedMinutes: 30,
    clientProfile: {
      name: "Practice Scenarios",
      age: 35,
      occupation: "Various",
      maritalStatus: "Various",
      primaryConcern: "Product matching",
      personality: "analytical",
    },
    productType: "term_life",
    certificationLevel: "pre_access",
    startNodeId: "scenario-1",
    scoringRubric: {
      categories: [
        { name: "Product Knowledge", maxPoints: 50 },
        { name: "Suitability Analysis", maxPoints: 50 },
      ],
      passingScore: 70,
      autoFailConditions: [],
    },
    nodes: [
      {
        id: "scenario-1",
        type: "decision_point",
        speaker: "narrator",
        content: "Scenario 1: A 28-year-old single professional with no dependents wants to start building cash value for retirement. What do you recommend?",
        choices: [
          {
            id: "s1-whole",
            text: "Whole life insurance - starts building guaranteed cash value",
            nextNodeId: "s1-correct",
            scoreImpact: { category: "Product Knowledge", points: 25 },
            feedback: "Good choice! Whole life builds guaranteed cash value.",
            isCompliant: true,
          },
          {
            id: "s1-term",
            text: "20-year term - affordable protection now",
            nextNodeId: "s1-term-feedback",
            scoreImpact: { category: "Product Knowledge", points: 10 },
            feedback: "Term doesn't build cash value, which was their goal.",
            isCompliant: true,
          },
          {
            id: "s1-iul",
            text: "IUL - growth potential with flexibility",
            nextNodeId: "s1-iul-feedback",
            scoreImpact: { category: "Product Knowledge", points: 20 },
            feedback: "IUL works, but whole life's guarantees may be more appropriate for starting out.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "s1-correct",
        type: "feedback",
        speaker: "narrator",
        content: "Correct! Whole life provides guaranteed cash value growth, perfect for someone young starting to build assets. The earlier they start, the more time for cash value to grow.",
        nextNodeId: "scenario-2",
      },
      {
        id: "s1-term-feedback",
        type: "feedback",
        speaker: "narrator",
        content: "Term provides protection only - no cash value accumulation. Since the client wants to build cash value, term doesn't meet their stated goal.",
        nextNodeId: "scenario-2",
      },
      {
        id: "s1-iul-feedback",
        type: "feedback",
        speaker: "narrator",
        content: "IUL can build cash value with upside potential, but it's more complex and doesn't have the same guarantees as whole life. For someone just starting out, whole life's simplicity and guarantees may be more appropriate.",
        nextNodeId: "scenario-2",
      },
      {
        id: "scenario-2",
        type: "decision_point",
        speaker: "narrator",
        content: "Scenario 2: A 45-year-old couple with a $400k mortgage and two kids in high school needs affordable protection for the next 15 years. What do you recommend?",
        choices: [
          {
            id: "s2-term",
            text: "15 or 20-year level term - affordable, matches their timeline",
            nextNodeId: "s2-correct",
            scoreImpact: { category: "Suitability Analysis", points: 25 },
            feedback: "Perfect! Term matches their temporary protection need.",
            isCompliant: true,
          },
          {
            id: "s2-whole",
            text: "Whole life - permanent protection",
            nextNodeId: "s2-whole-feedback",
            scoreImpact: { category: "Suitability Analysis", points: 10 },
            feedback: "Whole life would be significantly more expensive for their specific need.",
            isCompliant: true,
          },
          {
            id: "s2-annuity",
            text: "Fixed annuity - retirement savings",
            nextNodeId: "s2-annuity-feedback",
            scoreImpact: { category: "Suitability Analysis", points: 5 },
            feedback: "Annuities don't provide death benefit protection.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "s2-correct",
        type: "feedback",
        speaker: "narrator",
        content: "Excellent! Term life perfectly matches their situation: temporary need (mortgage will be paid off, kids will be independent), affordable premiums for maximum coverage.",
        nextNodeId: "end",
      },
      {
        id: "s2-whole-feedback",
        type: "feedback",
        speaker: "narrator",
        content: "While whole life provides permanent protection, it's not the most suitable here. Their need is temporary (15 years until mortgage paid and kids independent). Term would provide more coverage for less money.",
        nextNodeId: "end",
      },
      {
        id: "s2-annuity-feedback",
        type: "feedback",
        speaker: "narrator",
        content: "Annuities are for retirement savings, not protection. This family's primary concern is death benefit protection for their mortgage and children.",
        nextNodeId: "end",
      },
      {
        id: "end",
        type: "end",
        speaker: "narrator",
        content: "Workshop complete! Remember: matching products to client needs is the foundation of suitability.",
        outcome: "application_submitted",
        finalRating: "excellent",
      },
    ],
  },

  "common-objections": {
    id: "common-objections",
    title: "Top 10 Common Objections Practice",
    description: "Practice responding to the most frequent client objections",
    difficulty: "beginner",
    estimatedMinutes: 35,
    clientProfile: {
      name: "Various Prospects",
      age: 40,
      occupation: "Various",
      maritalStatus: "Various",
      primaryConcern: "Objection scenarios",
      personality: "skeptical",
    },
    productType: "term_life",
    certificationLevel: "pre_access",
    startNodeId: "obj-1",
    scoringRubric: {
      categories: [
        { name: "LAER Application", maxPoints: 60 },
        { name: "Empathy & Understanding", maxPoints: 40 },
      ],
      passingScore: 70,
      autoFailConditions: ["Argumentative response"],
    },
    nodes: [
      {
        id: "obj-1",
        type: "client_response",
        speaker: "client",
        speakerName: "Prospect",
        content: "I need to think about it.",
        nextNodeId: "obj-1-choice",
      },
      {
        id: "obj-1-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "How do you respond to 'I need to think about it'?",
        choices: [
          {
            id: "obj1-explore",
            text: "I completely understand. What specifically would you like to think through? I'm happy to provide more information on any areas.",
            nextNodeId: "obj-1-success",
            scoreImpact: { category: "LAER Application", points: 20 },
            feedback: "Excellent! You acknowledged and explored the real concern.",
            isCompliant: true,
          },
          {
            id: "obj1-push",
            text: "What's there to think about? This is a great rate and you need protection.",
            nextNodeId: "obj-1-fail",
            scoreImpact: { category: "LAER Application", points: 0 },
            feedback: "This is pushy and dismissive of their concerns.",
            isCompliant: true,
          },
          {
            id: "obj1-accept",
            text: "Okay, I'll follow up with you next week.",
            nextNodeId: "obj-1-passive",
            scoreImpact: { category: "LAER Application", points: 10 },
            feedback: "You accepted the objection without exploring the real issue.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "obj-1-success",
        type: "client_response",
        speaker: "client",
        speakerName: "Prospect",
        content: "Actually, I want to run the numbers by my spouse. We make these decisions together.",
        nextNodeId: "obj-2",
      },
      {
        id: "obj-1-fail",
        type: "feedback",
        speaker: "narrator",
        content: "The prospect felt pressured and ended the conversation. Remember: acknowledge first, then explore.",
        nextNodeId: "obj-2",
      },
      {
        id: "obj-1-passive",
        type: "feedback",
        speaker: "narrator",
        content: "Following up is fine, but you missed an opportunity to understand their hesitation. Exploring might have addressed it immediately.",
        nextNodeId: "obj-2",
      },
      {
        id: "obj-2",
        type: "client_response",
        speaker: "client",
        speakerName: "Prospect",
        content: "It's too expensive. I can't afford $150 a month.",
        nextNodeId: "obj-2-choice",
      },
      {
        id: "obj-2-choice",
        type: "decision_point",
        speaker: "narrator",
        content: "How do you handle the 'too expensive' objection?",
        choices: [
          {
            id: "obj2-explore",
            text: "I hear you - budget is important. Help me understand: is $150 outside what you can afford, or is it more about whether this is the right priority right now?",
            nextNodeId: "obj-2-success",
            scoreImpact: { category: "LAER Application", points: 20 },
            feedback: "Perfect! You're distinguishing between budget and priority objections.",
            isCompliant: true,
          },
          {
            id: "obj2-reduce",
            text: "We can reduce the coverage to bring the premium down to $80.",
            nextNodeId: "obj-2-reduce",
            scoreImpact: { category: "LAER Application", points: 10 },
            feedback: "Quick to accommodate, but you didn't explore if it's actually a budget issue.",
            isCompliant: true,
          },
          {
            id: "obj2-value",
            text: "Think about what it would cost your family if something happened to you.",
            nextNodeId: "obj-2-fear",
            scoreImpact: { category: "Empathy & Understanding", points: 5 },
            feedback: "Using fear isn't the education-first approach.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "obj-2-success",
        type: "feedback",
        speaker: "narrator",
        content: "Great exploration! Often 'too expensive' really means 'I'm not convinced it's worth it.' Understanding the real objection helps you address it effectively.",
        nextNodeId: "end",
      },
      {
        id: "obj-2-reduce",
        type: "feedback",
        speaker: "narrator",
        content: "Offering alternatives is helpful, but first explore whether it's truly budget or a priority question. They might actually be able to afford it but don't see the value yet.",
        nextNodeId: "end",
      },
      {
        id: "obj-2-fear",
        type: "feedback",
        speaker: "narrator",
        content: "Fear-based selling isn't education-first. Instead, explore their concern and help them understand the value for their specific situation.",
        nextNodeId: "end",
      },
      {
        id: "end",
        type: "end",
        speaker: "narrator",
        content: "Practice complete! Remember the LAER method: Listen, Acknowledge, Explore, Respond. Exploring often reveals the real objection.",
        outcome: "application_submitted",
        finalRating: "excellent",
      },
    ],
  },

  // ============================================================================
  // DAYS 8-30: WEEK 4 SIMULATIONS
  // ============================================================================

  "supervised-call": {
    id: "supervised-call",
    title: "First Supervised Call",
    description: "Conduct your first supervised client call with guidance",
    difficulty: "intermediate",
    estimatedTime: 60,
    category: "real_client",
    clientProfile: {
      name: "Sarah Johnson",
      age: 33,
      occupation: "Account Manager",
      maritalStatus: "Married",
      dependents: "1 child (age 2), expecting second",
      income: "$85,000/year",
      primaryConcern: "Making sure family is protected as it grows",
      personality: "agreeable",
    },
    objectives: [
      "Build genuine rapport",
      "Conduct thorough discovery",
      "Present appropriate options",
      "Handle objections professionally",
    ],
    nodes: [
      {
        id: "start",
        type: "advisor_prompt",
        speaker: "narrator",
        content: "You're about to call Sarah Johnson, who filled out an online quote request. Your supervisor is listening and will provide feedback after. Take a deep breath and remember your training.",
        nextNodeId: "opening",
      },
      {
        id: "opening",
        type: "decision_point",
        speaker: "client",
        content: "Hello?",
        options: [
          {
            id: "opening-professional",
            text: "Hi Sarah, this is [Your Name] from Heritage Life. I'm following up on your quote request. Is this still a good time?",
            nextNodeId: "opening-success",
            scoreImpact: { category: "Rapport Building", points: 20 },
            feedback: "Great! Professional, respectful of their time, and identifies purpose.",
            isCompliant: true,
          },
          {
            id: "opening-casual",
            text: "Hey Sarah! Got your quote request - let me tell you about our amazing products!",
            nextNodeId: "opening-casual-response",
            scoreImpact: { category: "Rapport Building", points: 5 },
            feedback: "Too casual and product-focused. Let the client guide the pace.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "opening-success",
        type: "decision_point",
        speaker: "client",
        content: "Yes, this is fine. We're expecting our second child and realized we should probably have more coverage.",
        options: [
          {
            id: "discovery-start",
            text: "Congratulations! That's exciting. Tell me a bit about your current situation - do you have any coverage now?",
            nextNodeId: "discovery-response",
            scoreImpact: { category: "Discovery Skills", points: 25 },
            feedback: "Perfect! You acknowledged their news and started discovery naturally.",
            isCompliant: true,
          },
          {
            id: "jump-to-quote",
            text: "Great, I can get you a quote right now. What coverage amount were you thinking?",
            nextNodeId: "discovery-response",
            scoreImpact: { category: "Discovery Skills", points: 10 },
            feedback: "Slow down - you're jumping to solutions before understanding their situation.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "opening-casual-response",
        type: "client_response",
        speaker: "client",
        content: "Um, okay... I guess you can tell me what you have.",
        nextNodeId: "discovery-response",
      },
      {
        id: "discovery-response",
        type: "decision_point",
        speaker: "client",
        content: "I have a small policy through work - maybe $50,000. My husband has something similar. We've never really looked at additional coverage.",
        options: [
          {
            id: "discovery-deep",
            text: "That's a good start. If something happened to either of you, how long would you want your family to maintain their current lifestyle?",
            nextNodeId: "recommendation-setup",
            scoreImpact: { category: "Discovery Skills", points: 20 },
            feedback: "Excellent question - helps them visualize the real need.",
            isCompliant: true,
          },
          {
            id: "discovery-basic",
            text: "You probably need about 10x your income. Let me run some numbers.",
            nextNodeId: "recommendation-setup",
            scoreImpact: { category: "Discovery Skills", points: 10 },
            feedback: "The formula is fine, but let them tell you their needs.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "recommendation-setup",
        type: "decision_point",
        speaker: "client",
        content: "I'd want them to be okay for at least 10-15 years - until the kids are grown. What would that cost?",
        options: [
          {
            id: "recommendation-good",
            text: "Based on what you've shared, a 20-year term policy around $500,000 would give you that security. For someone your age, that's typically $30-40 per month. Would that fit your budget?",
            nextNodeId: "close-response",
            scoreImpact: { category: "Closing", points: 25 },
            feedback: "Clear recommendation tied to their stated needs, with budget check.",
            isCompliant: true,
          },
          {
            id: "recommendation-vague",
            text: "It depends on a lot of factors. Let me explain all our different products...",
            nextNodeId: "close-response",
            scoreImpact: { category: "Closing", points: 5 },
            feedback: "They asked a direct question - give them a direct answer.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "close-response",
        type: "decision_point",
        speaker: "client",
        content: "That sounds reasonable. What would the next step be?",
        options: [
          {
            id: "close-strong",
            text: "I can start the application right now - it takes about 15 minutes. We'll get your exact rate and you can decide if it's right for you. Sound good?",
            nextNodeId: "end",
            scoreImpact: { category: "Closing", points: 25 },
            feedback: "Perfect close - clear next step, low pressure, gave them an out.",
            isCompliant: true,
          },
          {
            id: "close-weak",
            text: "I can send you some information and you can think about it.",
            nextNodeId: "end",
            scoreImpact: { category: "Closing", points: 5 },
            feedback: "They asked what's next - guide them to the application.",
            isCompliant: true,
          },
        ],
      },
      {
        id: "end",
        type: "end",
        speaker: "narrator",
        content: "Call complete! Your supervisor will now provide feedback on your performance. Remember: every call is a learning opportunity.",
        outcome: "application_submitted",
        finalRating: "excellent",
      },
    ],
  },
};

// ============================================================================
// ROLEPLAY CONFIGURATIONS (for AI avatar roleplay tasks)
// ============================================================================

export interface RoleplayConfig {
  id: string;
  title: string;
  description: string;
  clientPersona: {
    name: string;
    age: number;
    occupation: string;
    situation: string;
    personality: string;
    concerns: string[];
    objections: string[];
  };
  objectives: string[];
  evaluationCriteria: string[];
  duration: number;
}

export const ONBOARDING_ROLEPLAYS: Record<string, RoleplayConfig> = {
  // Day 2 - First Steps
  "ai-practice-intro": {
    id: "ai-practice-intro",
    title: "Your First AI Practice Session",
    description: "Have a simple introductory conversation with the AI coach",
    clientPersona: {
      name: "Practice Coach",
      age: 45,
      occupation: "AI Training Assistant",
      situation: "This is a friendly practice session to help you get comfortable",
      personality: "Patient, encouraging, supportive - designed to build confidence",
      concerns: ["This is just practice - no pressure!"],
      objections: [],
    },
    objectives: [
      "Get comfortable talking with the AI",
      "Practice introducing yourself as a Heritage agent",
      "Ask a few basic questions",
      "Receive encouraging feedback",
    ],
    evaluationCriteria: [
      "Participated in the conversation",
      "Introduced yourself professionally",
      "Asked at least one question",
      "Maintained a positive tone",
    ],
    duration: 15,
  },

  // Day 2 - Script Practice Roleplays
  "roleplay-call-1": {
    id: "roleplay-call-1",
    title: "Script Practice Call #1 - Opening & Rapport",
    description: "Practice your opening and rapport-building techniques",
    clientPersona: {
      name: "David Thompson",
      age: 38,
      occupation: "Accountant",
      situation: "Responded to a Heritage ad, curious but cautious about sales pitches",
      personality: "Analytical, wants facts before emotions, appreciates professionalism",
      concerns: [
        "Worried this will be a high-pressure sales call",
        "Wants to understand before committing to anything",
        "Values his time and directness",
      ],
      objections: [
        "I'm just looking for information right now",
        "Can you just send me some materials to review?",
      ],
    },
    objectives: [
      "Deliver a professional, credibility-building opening",
      "Build rapport by finding common ground",
      "Transition smoothly into discovery questions",
      "Keep David engaged and comfortable",
    ],
    evaluationCriteria: [
      "Opening was confident and professional",
      "Built genuine rapport within first 2 minutes",
      "Listened more than talked (80/20 rule)",
      "Successfully transitioned to discovery",
    ],
    duration: 15,
  },

  "roleplay-call-2": {
    id: "roleplay-call-2",
    title: "Script Practice Call #2 - Discovery & Objections",
    description: "Practice discovery questions and objection handling",
    clientPersona: {
      name: "Sarah Chen",
      age: 44,
      occupation: "Small Business Owner",
      situation: "Has a successful bakery, husband works part-time in the business, two kids in high school",
      personality: "Busy, practical, cares deeply about family but doesn't like to talk about 'what if' scenarios",
      concerns: [
        "The business takes most of her time and money",
        "Not sure what would happen to the bakery if something happened to her",
        "Feels like insurance is just another expense",
      ],
      objections: [
        "I already have a small policy from years ago",
        "Business cash flow is tight right now",
        "I need to talk to my husband first",
        "Can we do this another time? It's a busy season",
      ],
    },
    objectives: [
      "Use SIPT discovery framework effectively",
      "Uncover her true coverage needs",
      "Handle at least 2 objections using LAER",
      "Create urgency without being pushy",
    ],
    evaluationCriteria: [
      "Asked situation, impact, priority, and timeline questions",
      "Uncovered family and business protection needs",
      "Handled objections with empathy",
      "Moved conversation toward a next step",
    ],
    duration: 20,
  },

  // Day 4 - Sales
  "ai-roleplay-intro": {
    id: "ai-roleplay-intro",
    title: "AI Avatar Roleplay Session",
    description: "Practice your pitch with an AI-powered client simulation",
    clientPersona: {
      name: "Jennifer Martinez",
      age: 42,
      occupation: "Marketing Manager",
      situation: "Married with one teenager, recently promoted, thinking about financial planning",
      personality: "Friendly but busy, wants efficient conversations, values expertise",
      concerns: [
        "Not sure how much coverage is needed",
        "Worried about premiums impacting monthly budget",
        "Wants to understand the process",
      ],
      objections: [
        "I have some coverage through work",
        "Can we do this quickly? I have a meeting soon",
        "That sounds complicated",
      ],
    },
    objectives: [
      "Build rapport quickly given time constraints",
      "Conduct efficient needs discovery",
      "Address work coverage gap",
      "Explain term vs permanent simply",
    ],
    evaluationCriteria: [
      "Respected client's time while being thorough",
      "Asked good discovery questions",
      "Explained concepts clearly without jargon",
      "Handled objections with empathy",
    ],
    duration: 20,
  },

  "pitch-practice": {
    id: "pitch-practice",
    title: "Elevator Pitch Practice",
    description: "Record and refine your 60-second Heritage pitch",
    clientPersona: {
      name: "Networking Contact",
      age: 35,
      occupation: "Various",
      situation: "Meeting at a professional networking event",
      personality: "Curious but not actively looking for insurance",
      concerns: ["Why should I care about life insurance?"],
      objections: ["I'm pretty young, do I really need this?"],
    },
    objectives: [
      "Deliver a compelling 60-second pitch",
      "Explain what Heritage does clearly",
      "Create interest without being salesy",
      "Secure a follow-up conversation",
    ],
    evaluationCriteria: [
      "Pitch was under 90 seconds",
      "Clear value proposition",
      "Professional and confident delivery",
      "Ended with clear next step",
    ],
    duration: 20,
  },

  "final-roleplay": {
    id: "final-roleplay",
    title: "Final AI Roleplay Challenge",
    description: "Face a challenging client scenario with our AI avatars",
    clientPersona: {
      name: "Robert Chen",
      age: 55,
      occupation: "Small Business Owner",
      situation: "Owns a restaurant, has some old whole life policies, wife handles finances, skeptical of salespeople",
      personality: "Direct, skeptical, busy, values straight talk",
      concerns: [
        "Had a bad experience with an insurance agent before",
        "Not sure if current policies are right",
        "Business is his main focus",
      ],
      objections: [
        "Last guy who called just wanted to sell me something",
        "I already have insurance, why do I need more?",
        "I don't have time for a long meeting",
        "My wife handles all this stuff",
      ],
    },
    objectives: [
      "Overcome initial skepticism",
      "Position yourself as an educator, not salesperson",
      "Identify gaps in current coverage",
      "Include spouse in the conversation appropriately",
    ],
    evaluationCriteria: [
      "Built trust despite initial skepticism",
      "Differentiated education-first approach",
      "Asked about existing coverage professionally",
      "Offered to include spouse appropriately",
      "Didn't push for immediate decision",
    ],
    duration: 25,
  },

  // ============================================================================
  // DAYS 8-30: WEEK 2-4 ROLEPLAYS
  // ============================================================================

  // Week 2 - Practice Calls
  "practice-calls": {
    id: "practice-calls",
    title: "Practice Calls with AI",
    description: "Practice prospecting calls with AI coaching",
    scenario: "prospecting",
    difficulty: "beginner",
    aiAvatar: "wolf-closer",
    systemPrompt: `You are a potential client receiving a cold call about life insurance.
    Be polite but busy. You're mildly interested but have concerns about cost and timing.
    Give the agent a chance to qualify you and build rapport.
    Common responses:
    - "I only have a few minutes"
    - "What's this about?"
    - "I'm not sure I need more insurance"
    - "How much does it cost?"
    If they ask good questions and listen well, become more engaged.`,
    clientPersona: {
      name: "Jennifer Martinez",
      age: 35,
      occupation: "Marketing Manager",
      situation: "Working from home, just got promoted, husband is self-employed",
      personality: "Busy, efficient, wants quick answers",
      concerns: [
        "Time is limited",
        "Not sure about need",
        "Budget conscious",
      ],
      objections: [
        "I'm really busy right now",
        "We have some coverage through my work",
        "Can you just email me information?",
      ],
    },
    objectives: [
      "Get past the initial brush-off",
      "Qualify the lead quickly",
      "Schedule a follow-up appointment",
      "Leave a positive impression",
    ],
    evaluationCriteria: [
      "Professional, confident opening",
      "Asked qualifying questions",
      "Handled objections smoothly",
      "Secured next step",
    ],
    duration: 15,
  },

  // Week 3 - Role Play Sessions
  "week3-roleplay": {
    id: "week3-roleplay",
    title: "Advanced Role Play Sessions",
    description: "Practice presentations and closing with AI",
    scenario: "presentation",
    difficulty: "intermediate",
    aiAvatar: "intensity-coach",
    systemPrompt: `You are a qualified prospect who's ready to see a presentation.
    You have genuine interest but will raise common objections:
    - "That seems expensive"
    - "I want to think about it"
    - "What if I need to cancel?"
    Be realistic but give the agent opportunities to use closing techniques.
    Respond positively to good presentations and genuine care.`,
    clientPersona: {
      name: "David and Lisa Thompson",
      age: 42,
      occupation: "Teacher and Nurse",
      situation: "Two kids, mortgage, some savings, concerned about future",
      personality: "Thoughtful, want to understand options",
      concerns: [
        "Getting the right coverage amount",
        "Budget fitting their lifestyle",
        "Understanding the policy details",
      ],
      objections: [
        "We need to discuss this privately",
        "The monthly cost is more than we expected",
        "Can we start smaller and add more later?",
      ],
    },
    objectives: [
      "Deliver a structured presentation",
      "Handle price objection effectively",
      "Use appropriate closing techniques",
      "Get a decision or clear next step",
    ],
    evaluationCriteria: [
      "Clear, structured presentation",
      "Connected features to their needs",
      "Handled objections professionally",
      "Used effective closing technique",
    ],
    duration: 25,
  },

  // Week 4 - Client Contact Practice
  "client-contact-practice": {
    id: "client-contact-practice",
    title: "Client Contact Practice",
    description: "Practice real-world client interactions",
    scenario: "full_interaction",
    difficulty: "intermediate",
    aiAvatar: "insurance-expert",
    systemPrompt: `You are a new client who just filled out an online quote request.
    You're genuinely interested but want to feel comfortable with the agent.
    Start cautiously but warm up as the agent demonstrates competence and care.
    Ask questions about:
    - The agent's experience
    - How the process works
    - What happens after you apply
    Be ready to move forward if the agent is helpful and professional.`,
    clientPersona: {
      name: "Michelle Williams",
      age: 29,
      occupation: "Physical Therapist",
      situation: "Recently married, planning for kids, first time buying life insurance",
      personality: "Curious, asks questions, wants to understand",
      concerns: [
        "Never bought insurance before",
        "Wants to make sure they understand",
        "Budget-conscious but values quality",
      ],
      objections: [
        "I'm not sure how much coverage I need",
        "This is all new to me",
        "I want to compare a few options",
      ],
    },
    objectives: [
      "Build rapport and trust",
      "Educate on insurance basics",
      "Make a clear recommendation",
      "Guide to application",
    ],
    evaluationCriteria: [
      "Created comfortable atmosphere",
      "Educated without overwhelming",
      "Made appropriate recommendation",
      "Smoothly transitioned to application",
    ],
    duration: 20,
  },
};

// ============================================================================
// TASK CONTENT MAPPING - Maps task IDs to their content
// ============================================================================

export type TaskContentType = "video" | "module" | "quiz" | "simulation" | "roleplay" | "celebration";

export interface TaskContentMapping {
  type: TaskContentType;
  contentId: string;
}

export const TASK_CONTENT_MAP: Record<string, TaskContentMapping> = {
  // Day 1 - Welcome & Setup
  "welcome-video": { type: "video", contentId: "welcome-video" },
  "tour-portal": { type: "video", contentId: "tour-portal" },
  "intro-ai": { type: "video", contentId: "intro-ai" },
  "read-handbook": { type: "module", contentId: "read-handbook" },
  "meet-team": { type: "module", contentId: "meet-team" },
  // Day 1 - Setup & Administrative Tasks
  "complete-profile": { type: "module", contentId: "complete-profile" },
  "setup-2fa": { type: "module", contentId: "setup-2fa" },
  "setup-notifications": { type: "module", contentId: "setup-notifications" },
  "sign-nda": { type: "module", contentId: "sign-nda" },
  "contracts-verification": { type: "module", contentId: "contracts-verification" },
  "toolkit-setup": { type: "module", contentId: "toolkit-setup" },
  "contract-status": { type: "module", contentId: "contract-status" },
  "crm-activation": { type: "module", contentId: "crm-activation" },
  "script-library": { type: "module", contentId: "script-library" },
  // Day 1 - CRM & Products
  "crm-tour": { type: "video", contentId: "crm-tour" },
  "crm-functions": { type: "module", contentId: "crm-functions" },
  "whole-life-basics": { type: "module", contentId: "whole-life-basics" },
  "term-life-basics": { type: "module", contentId: "term-life-basics" },
  "iul-basics": { type: "module", contentId: "iul-basics" },
  "annuities-basics": { type: "module", contentId: "annuities-basics" },
  "products-quiz": { type: "quiz", contentId: "products-quiz" },
  // Day 1 - Scripts
  "script-philosophy": { type: "video", contentId: "script-philosophy" },
  "script-structure": { type: "module", contentId: "script-structure" },

  // Day 2 - First Steps
  "insurance-basics": { type: "module", contentId: "insurance-basics" },
  "heritage-products": { type: "video", contentId: "heritage-products" },
  "compliance-intro": { type: "module", contentId: "compliance-intro" },
  "basics-quiz": { type: "quiz", contentId: "basics-quiz" },
  "sales-intro": { type: "video", contentId: "sales-intro" },
  "ai-practice": { type: "roleplay", contentId: "ai-practice-intro" },
  // Day 2 - Script Mastery Curriculum
  "script-credibility": { type: "module", contentId: "script-credibility" },
  "script-rapport": { type: "module", contentId: "script-rapport" },
  "script-coverage-questions": { type: "module", contentId: "script-coverage-questions" },
  "script-premium-framework": { type: "module", contentId: "script-premium-framework" },
  "script-medical-underwriting": { type: "module", contentId: "script-medical-underwriting" },
  "script-application-walkthrough": { type: "module", contentId: "script-application-walkthrough" },
  "script-sensitive-info": { type: "module", contentId: "script-sensitive-info" },
  "script-security-compliance": { type: "module", contentId: "script-security-compliance" },
  "script-closing-techniques": { type: "module", contentId: "script-closing-techniques" },
  "script-closing-old-policies": { type: "module", contentId: "script-closing-old-policies" },
  "script-client-checkin": { type: "module", contentId: "script-client-checkin" },
  "objections-overview": { type: "module", contentId: "objections-overview" },
  "objections-practice": { type: "module", contentId: "objections-practice" },
  "roleplay-call-1": { type: "roleplay", contentId: "roleplay-call-1" },
  "roleplay-call-2": { type: "roleplay", contentId: "roleplay-call-2" },
  "roleplay-feedback": { type: "module", contentId: "roleplay-feedback" },
  "script-quiz": { type: "quiz", contentId: "script-quiz" },
  "day2-assessment": { type: "quiz", contentId: "day2-assessment" },

  // Day 3 - Product Knowledge
  "term-life-deep": { type: "module", contentId: "term-life-deep" },
  "whole-life-deep": { type: "module", contentId: "whole-life-deep" },
  "iul-training": { type: "video", contentId: "iul-training" },
  "annuities-intro": { type: "module", contentId: "annuities-intro" },
  "product-comparison": { type: "simulation", contentId: "product-comparison" },
  "underwriting-basics": { type: "module", contentId: "term-life-deep" }, // Uses term module's underwriting section
  "day3-quiz": { type: "quiz", contentId: "day3-quiz" },

  // Day 4 - Sales
  "sales-methodology": { type: "module", contentId: "sales-methodology" },
  "discovery-questions": { type: "video", contentId: "discovery-questions" },
  "objection-handling": { type: "module", contentId: "objection-handling" },
  "common-objections": { type: "simulation", contentId: "common-objections" },
  "ai-roleplay-intro": { type: "roleplay", contentId: "ai-roleplay-intro" },
  "closing-techniques": { type: "video", contentId: "closing-techniques" },
  "day4-assessment": { type: "quiz", contentId: "day4-assessment" },

  // Day 5 - Compliance
  "compliance-fundamentals": { type: "module", contentId: "compliance-fundamentals" },
  "ethics-training": { type: "module", contentId: "ethics-training" },
  "anti-fraud": { type: "video", contentId: "anti-fraud" },
  "privacy-hipaa": { type: "module", contentId: "privacy-hipaa" },
  "suitability": { type: "module", contentId: "suitability" },
  "documentation": { type: "module", contentId: "documentation" },
  "compliance-cert": { type: "quiz", contentId: "compliance-cert" },

  // Day 6 - Communication
  "communication-styles": { type: "module", contentId: "communication-styles" },
  "phone-skills": { type: "video", contentId: "phone-skills" },
  "email-writing": { type: "module", contentId: "email-writing" },
  "presentation-basics": { type: "video", contentId: "presentation-basics" },
  "storytelling": { type: "module", contentId: "storytelling" },
  "pitch-practice": { type: "roleplay", contentId: "pitch-practice" },
  "day6-assessment": { type: "quiz", contentId: "day6-assessment" },

  // Day 7 - Week 1 Finale
  "week-review": { type: "module", contentId: "week-review" },
  "full-simulation": { type: "simulation", contentId: "full-simulation" },
  "product-assessment": { type: "quiz", contentId: "product-assessment" },
  "sales-assessment": { type: "quiz", contentId: "sales-assessment" },
  "compliance-assessment": { type: "quiz", contentId: "compliance-assessment" },
  "final-roleplay": { type: "roleplay", contentId: "final-roleplay" },
  "week1-complete": { type: "celebration", contentId: "week1-complete" },

  // ============================================================================
  // DAYS 8-30: WEEKS 2-4
  // ============================================================================

  // Week 2 - Client Engagement Basics
  "week2-lead-qualification-module": { type: "module", contentId: "lead-qualification" },
  "week2-phone-script-workshop": { type: "video", contentId: "phone-scripts" },
  "week2-crm-mastery-course": { type: "module", contentId: "crm-mastery" },
  "week2-practice-calls-with-ai": { type: "roleplay", contentId: "practice-calls" },
  "week2-prospecting-strategies": { type: "module", contentId: "prospecting-strategies" },
  "week2-week-2-assessment": { type: "quiz", contentId: "week2-assessment" },
  "week2-30-day-plan-creation-with-upline": { type: "module", contentId: "30-day-plan-creation" },
  "week2-daily-metrics-tracking-setup": { type: "module", contentId: "daily-metrics-tracking" },

  // Week 3 - Sales Mastery
  "week3-presentation-excellence": { type: "module", contentId: "presentation-excellence" },
  "week3-closing-techniques-deep-dive": { type: "video", contentId: "closing-deep-dive" },
  "week3-advanced-objection-handling": { type: "module", contentId: "advanced-objections" },
  "week3-referral-system-setup": { type: "module", contentId: "referral-system" },
  "week3-role-play-sessions": { type: "roleplay", contentId: "week3-roleplay" },
  "week3-week-3-assessment": { type: "quiz", contentId: "week3-assessment" },
  "week3-weekly-metrics-review-with-upline": { type: "module", contentId: "weekly-metrics-review" },
  "week3-complex-objection-scenarios": { type: "module", contentId: "advanced-objections" },

  // Week 4 - First Client Interactions
  "week4-shadow-session-1": { type: "module", contentId: "shadow-session-guide" },
  "week4-shadow-session-2": { type: "module", contentId: "shadow-session-guide" },
  "week4-first-supervised-call": { type: "simulation", contentId: "supervised-call" },
  "week4-client-contact-practice": { type: "roleplay", contentId: "client-contact-practice" },
  "week4-month-1-comprehensive-review": { type: "module", contentId: "month1-review" },
  "week4-month-1-certification-exam": { type: "quiz", contentId: "month1-certification" },
  "week4-shadow-top-producer---call-1": { type: "module", contentId: "shadow-session-guide" },
  "week4-shadow-top-producer---call-2": { type: "module", contentId: "shadow-session-guide" },
  "week4-your-first-real-client-call": { type: "simulation", contentId: "supervised-call" },
  "week4-30-day-plan-review-with-upline": { type: "module", contentId: "month1-review" },

  // ============================================================================
  // DAYS 31-90: Skills & Focus Areas
  // ============================================================================
  "pipeline-management": { type: "module", contentId: "prospecting-strategies" },
  "time-blocking": { type: "module", contentId: "crm-mastery" },
  "follow-up-sequences": { type: "module", contentId: "crm-mastery" },
  "referral-requests": { type: "module", contentId: "referral-system" },
  "advanced-closing": { type: "module", contentId: "advanced-objections" },
  "multi-policy-sales": { type: "module", contentId: "presentation-excellence" },
  "center-of-influence": { type: "module", contentId: "referral-system" },
  "team-collaboration": { type: "module", contentId: "shadow-session-guide" },
  "daily-prospecting-routine": { type: "module", contentId: "prospecting-strategies" },
  "weekly-goal-tracking": { type: "module", contentId: "crm-mastery" },
  "time-blocking-mastery": { type: "module", contentId: "crm-mastery" },
  "consistent-follow-up": { type: "module", contentId: "crm-mastery" },
  "referral-generation": { type: "module", contentId: "referral-system" },
  "multi-policy-opportunities": { type: "module", contentId: "presentation-excellence" },
  "objection-mastery": { type: "module", contentId: "advanced-objections" },

  // ============================================================================
  // DAYS 91-180: Milestones
  // ============================================================================
  "first-large-case-($250k+)": { type: "simulation", contentId: "supervised-call" },
  "team-lead-qualification": { type: "module", contentId: "shadow-session-guide" },
  "iul-certification": { type: "quiz", contentId: "month1-certification" },
  "6-month-achievement-badge": { type: "celebration", contentId: "celebration" },
  "leadership-certification": { type: "quiz", contentId: "month1-certification" },
  "first-mentee-onboarded": { type: "module", contentId: "shadow-session-guide" },
  "10-client-referrals": { type: "module", contentId: "referral-system" },
  "advanced-product-certification": { type: "quiz", contentId: "month1-certification" },
  "first-$10k-month": { type: "celebration", contentId: "celebration" },

  // ============================================================================
  // DAYS 181-365: Quarter Goals
  // ============================================================================
  "consistent-monthly-production": { type: "module", contentId: "prospecting-strategies" },
  "mentor-1-2-new-agents": { type: "module", contentId: "shadow-session-guide" },
  "advanced-product-mastery": { type: "module", contentId: "presentation-excellence" },
  "build-personal-brand": { type: "module", contentId: "referral-system" },
  "leadership-role-preparation": { type: "module", contentId: "shadow-session-guide" },
  "top-producer-status": { type: "celebration", contentId: "celebration" },
  "team-building-focus": { type: "module", contentId: "shadow-session-guide" },
  "agency-growth-planning": { type: "module", contentId: "prospecting-strategies" },
  // Additional Quarter Goals
  "achieve-annual-production-goals": { type: "module", contentId: "annual-production-planning" },
  "build-referral-engine": { type: "module", contentId: "referral-system" },
  "complete-all-certifications": { type: "quiz", contentId: "month1-certification" },
  "consistent-weekly-production-targets": { type: "module", contentId: "prospecting-strategies" },
  "develop-specialization-niche": { type: "module", contentId: "niche-development" },
  "expand-product-portfolio-expertise": { type: "module", contentId: "presentation-excellence" },
  "mentor-new-agents": { type: "module", contentId: "mentoring-guide" },
  "set-year-two-vision": { type: "module", contentId: "year-two-vision" },

  // ============================================================================
  // SHADOW & SUPERVISED TRAINING (Days 8-30)
  // ============================================================================
  "iul-deep-dive": { type: "module", contentId: "iul-training" },
  "final-product-assessment": { type: "quiz", contentId: "product-assessment" },
  "final-sales-assessment": { type: "quiz", contentId: "sales-assessment" },
  "lead-qualification": { type: "module", contentId: "lead-qualification" },
  "pre-shadow-briefing": { type: "module", contentId: "pre-shadow-briefing" },
  "shadow-call-1": { type: "module", contentId: "shadow-call-1" },
  "shadow-call-2": { type: "module", contentId: "shadow-call-2" },
  "shadow-debrief-1": { type: "module", contentId: "shadow-debrief-1" },
  "shadow-application": { type: "module", contentId: "shadow-application" },
  "shadow-close": { type: "module", contentId: "shadow-close" },
  "agent-practice-upline": { type: "module", contentId: "agent-practice-upline" },
  "upline-feedback-session": { type: "module", contentId: "upline-feedback-session" },
  "agent-call-1": { type: "module", contentId: "agent-call-1" },
  "agent-call-2": { type: "module", contentId: "agent-call-2" },
  "midday-debrief": { type: "module", contentId: "midday-debrief" },
  "agent-close-upline-1": { type: "module", contentId: "agent-close-upline-1" },
  "agent-close-until-confident": { type: "module", contentId: "agent-close-until-confident" },
};

// Helper function to get content for a task
export function getTaskContent(taskId: string) {
  const mapping = TASK_CONTENT_MAP[taskId];
  if (!mapping) return null;

  switch (mapping.type) {
    case "video":
      return { type: "video" as const, content: ONBOARDING_VIDEOS[mapping.contentId] };
    case "module":
      return { type: "module" as const, content: ONBOARDING_MODULES[mapping.contentId] };
    case "quiz":
      return { type: "quiz" as const, content: ONBOARDING_ASSESSMENTS[mapping.contentId] };
    case "simulation":
      return { type: "simulation" as const, content: ONBOARDING_SIMULATIONS[mapping.contentId] };
    case "roleplay":
      return { type: "roleplay" as const, content: ONBOARDING_ROLEPLAYS[mapping.contentId] };
    case "celebration":
      return { type: "celebration" as const, content: { id: taskId, title: "Week 1 Complete!" } };
    default:
      return null;
  }
}

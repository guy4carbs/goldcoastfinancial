import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, MapPin, Clock, Users, Heart, TrendingUp, Shield, Building2 } from "lucide-react";
import { Link } from "wouter";
import { InstitutionalSEO } from "@/components/seo/InstitutionalSEO";

const cultureValues = [
  {
    icon: Shield,
    title: "Integrity First",
    description: "We operate with the highest ethical standards, prioritizing compliance and transparency in everything we do."
  },
  {
    icon: TrendingUp,
    title: "Long-Term Thinking",
    description: "We make decisions based on sustainable value creation, not short-term gains or quarterly pressures."
  },
  {
    icon: Users,
    title: "Collaborative Excellence",
    description: "We believe the best results come from diverse perspectives working together toward shared goals."
  },
  {
    icon: Heart,
    title: "People-Centered",
    description: "Our people are our greatest asset. We invest in growth, well-being, and professional development."
  }
];

const benefits = [
  "Competitive compensation packages",
  "Comprehensive health, dental, and vision insurance",
  "401(k) with company matching",
  "Professional development budget",
  "Flexible work arrangements",
  "Paid time off and holidays",
  "Life and disability insurance",
  "Employee assistance program"
];

const openPositions = [
  {
    title: "Corporate Development Analyst",
    department: "Corporate Development",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Join our corporate development team to identify, evaluate, and execute strategic acquisitions and partnerships in the insurance and financial services sectors. You'll work directly with senior leadership on deal sourcing, financial modeling, due diligence, and post-acquisition integration planning.",
    requirements: [
      "Bachelor's degree in Finance, Economics, Accounting, or related field",
      "2-4 years of experience in investment banking, private equity, corporate development, or M&A advisory",
      "Strong financial modeling and valuation skills (DCF, LBO, comparable analysis)",
      "Experience with due diligence processes and deal execution",
      "Advanced proficiency in Excel and PowerPoint",
      "Insurance or financial services industry experience preferred",
      "CFA progress or MBA a plus"
    ]
  },
  {
    title: "Compliance Manager",
    department: "Legal & Compliance",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Lead our compliance function to ensure regulatory adherence across all portfolio companies. You'll develop and maintain compliance programs, manage state insurance licensing, oversee regulatory filings, and serve as the primary liaison with regulatory bodies. This role is critical to maintaining our reputation for integrity and operational excellence.",
    requirements: [
      "Bachelor's degree required; JD or compliance certification (CPCU, FLMI) preferred",
      "5+ years of compliance experience in insurance or financial services",
      "Deep knowledge of state insurance regulations and NAIC requirements",
      "Experience managing multi-state insurance licensing and producer appointments",
      "Strong understanding of anti-money laundering (AML) and privacy regulations",
      "Excellent written and verbal communication skills",
      "Ability to translate complex regulatory requirements into actionable policies"
    ]
  },
  {
    title: "Financial Analyst",
    department: "Finance",
    location: "Naperville, IL / Remote",
    type: "Full-time",
    description: "Support the CFO and finance team with comprehensive financial analysis, reporting, and strategic planning across the holding company and portfolio businesses. You'll prepare monthly financial reports, develop budgets and forecasts, analyze portfolio company performance, and provide insights that drive strategic decision-making.",
    requirements: [
      "Bachelor's degree in Finance, Accounting, or related field; CPA or CFA a plus",
      "3-5 years of experience in financial analysis, FP&A, or public accounting",
      "Strong understanding of GAAP and financial statement analysis",
      "Experience with financial consolidation and multi-entity reporting",
      "Advanced Excel skills; experience with ERP systems and BI tools",
      "Insurance industry experience strongly preferred",
      "Strong attention to detail and ability to meet deadlines in a fast-paced environment"
    ]
  },
  {
    title: "General Counsel",
    department: "Legal & Compliance",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Serve as the chief legal advisor to Gold Coast Financial, providing strategic legal guidance on corporate governance, M&A transactions, regulatory matters, and commercial contracts. You'll manage outside counsel relationships, oversee legal risk management, and ensure the company's legal interests are protected across all business activities.",
    requirements: [
      "Juris Doctor (JD) from an accredited law school",
      "Active bar membership in Illinois (or ability to obtain)",
      "10+ years of legal experience, with 5+ years in insurance or financial services",
      "Experience with M&A transactions, corporate governance, and securities law",
      "Strong background in regulatory compliance and contract negotiation",
      "Previous in-house counsel experience preferred",
      "Excellent judgment and ability to balance legal risk with business objectives"
    ]
  },
  {
    title: "Director of Operations",
    department: "Operations",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Lead operational excellence initiatives across the holding company and portfolio businesses. You'll develop and implement operational strategies, drive process improvements, manage vendor relationships, and ensure seamless coordination between corporate functions and operating companies. This role is key to scaling our platform efficiently.",
    requirements: [
      "Bachelor's degree required; MBA or relevant advanced degree preferred",
      "7+ years of operations management experience in financial services or insurance",
      "Proven track record of implementing operational improvements and driving efficiency",
      "Experience managing cross-functional teams and complex projects",
      "Strong analytical skills with a data-driven approach to decision-making",
      "Excellent communication and stakeholder management abilities",
      "Knowledge of insurance operations and technology platforms a plus"
    ]
  },
  {
    title: "Executive Assistant to CEO",
    department: "Executive Office",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Provide high-level administrative and strategic support to the Chief Executive Officer. You'll manage the CEO's calendar, coordinate board meetings and investor communications, handle confidential correspondence, and serve as a key liaison between the executive office and internal/external stakeholders.",
    requirements: [
      "Bachelor's degree preferred",
      "5+ years of executive assistant experience, preferably in financial services",
      "Exceptional organizational skills and attention to detail",
      "Advanced proficiency in Microsoft Office Suite and calendar management",
      "Excellent written and verbal communication skills",
      "Ability to handle confidential information with discretion",
      "Proactive problem-solver with strong interpersonal skills"
    ]
  },
  {
    title: "IT Security Manager",
    department: "Technology",
    location: "Naperville, IL / Hybrid",
    type: "Full-time",
    description: "Lead our cybersecurity program to protect sensitive financial and customer data across the organization. You'll develop security policies, manage threat detection and incident response, ensure compliance with industry regulations (SOC 2, NIST), and build a security-aware culture throughout the company.",
    requirements: [
      "Bachelor's degree in Computer Science, Cybersecurity, or related field",
      "5+ years of information security experience, with 2+ years in a leadership role",
      "Industry certifications such as CISSP, CISM, or CISA required",
      "Experience with security frameworks (NIST, ISO 27001, SOC 2)",
      "Knowledge of cloud security (AWS, Azure) and network security architecture",
      "Understanding of insurance and financial services regulatory requirements",
      "Strong communication skills to convey security concepts to non-technical stakeholders"
    ]
  },
  {
    title: "Investor Relations Manager",
    department: "Corporate Communications",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Manage relationships with existing and prospective investors, capital partners, and key stakeholders. You'll prepare investor presentations and reports, coordinate quarterly communications, support capital raising initiatives, and serve as the primary point of contact for investor inquiries.",
    requirements: [
      "Bachelor's degree in Finance, Communications, or related field; MBA a plus",
      "5+ years of experience in investor relations, private equity, or investment banking",
      "Strong financial acumen and ability to translate complex data into compelling narratives",
      "Excellent presentation and communication skills",
      "Experience with CRM systems and investor management platforms",
      "Understanding of private capital markets and institutional investor expectations",
      "Ability to manage multiple priorities in a fast-paced environment"
    ]
  }
];

export default function InstitutionalCareers() {
  return (
    <InstitutionalLayout>
      <InstitutionalSEO />

      {/* Hero */}
      <section className="hero-gradient py-24 md:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
              Careers
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-6">
              Build Your Career With Us
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Join a team committed to long-term value creation, operational excellence, and the highest standards of integrity in financial services.
            </p>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Culture & Values */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Our Culture
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              We're building something meaningful—a company where talented people can do their best work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cultureValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-b from-white to-gray-50/50 border border-border/60 p-6 rounded-sm"
              >
                <div className="w-12 h-12 bg-[hsl(348,65%,20%)]/5 rounded-sm flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-[hsl(348,65%,25%)]" />
                </div>
                <h3 className="text-base font-medium text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Benefits & Perks
              </h2>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
                Comprehensive benefits that support your well-being.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We offer competitive compensation and a comprehensive benefits package designed to support our team members and their families. Our benefits reflect our commitment to long-term thinking—investing in the health, growth, and security of our people.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-white border border-border/60 p-8 rounded-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[hsl(348,65%,25%)]" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Open Positions */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary">
              Current opportunities at Gold Coast Financial.
            </p>
          </motion.div>

          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-border/60 p-6 md:p-8 rounded-sm hover:shadow-lg transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-[hsl(348,65%,25%)]" />
                      <h3 className="text-lg font-medium text-primary">{position.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/goldcoastfinancial2/contact"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(348,65%,20%)] text-white rounded-sm text-sm font-medium hover:bg-[hsl(348,65%,25%)] transition-colors shrink-0"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{position.description}</p>

                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-medium text-primary mb-3">Requirements</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {position.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(348,65%,25%)] mt-2 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Positions Message - uncomment if needed */}
          {/* <div className="text-center py-12 bg-muted/30 rounded-sm">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No Open Positions</h3>
            <p className="text-muted-foreground mb-4">
              We don't have any open positions at this time, but we're always interested in talented people.
            </p>
            <Link
              href="/goldcoastfinancial2/contact"
              className="inline-flex items-center gap-2 text-[hsl(348,65%,25%)] font-medium hover:underline"
            >
              Send us your resume
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div> */}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* General Applications CTA */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary mb-4">
                General Applications
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <p className="text-lg leading-relaxed mb-6">
                Don't see a position that fits your background? We're always interested in hearing from talented professionals who share our values and want to contribute to our mission.
              </p>
              <p className="text-white/70 leading-relaxed mb-8">
                Send your resume and a brief note about your background and interests to our team. We review all applications and will reach out if there's a potential fit.
              </p>
              <a
                href="mailto:applications@goldcoastfnl.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                applications@goldcoastfnl.com
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}

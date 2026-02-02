import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, MapPin, Clock, Users, Heart, TrendingUp, Shield, Building2, DollarSign, GraduationCap, Home, Calendar, Umbrella, HeartPulse, CheckCircle, Quote, Scale, Code, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { InstitutionalSEO } from "@/components/seo/InstitutionalSEO";
import { VideoSection } from "@/components/institutional/VideoSection";
import { AnimatedStats } from "@/components/institutional/AnimatedStats";
import { useAnalytics } from "@/hooks/useAnalytics";

// Department configurations with colors and icons
const departmentConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  "Corporate Development": { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: TrendingUp },
  "Legal & Compliance": { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200", icon: Scale },
  "Finance": { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200", icon: DollarSign },
  "Operations": { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", icon: Building2 },
  "Executive Office": { color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", icon: Briefcase },
  "Technology": { color: "text-cyan-700", bgColor: "bg-cyan-50", borderColor: "border-cyan-200", icon: Code },
  "Corporate Communications": { color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", icon: MessageSquare },
};

// Employee testimonials
const employeeTestimonials = [
  {
    quote: "Working here means being part of something built to last. The long-term thinking is refreshing after years at firms focused on quarterly results.",
    name: "Team Member",
    role: "Corporate Development",
    initials: "CD"
  },
  {
    quote: "Leadership truly cares about doing things the right way. Compliance isn't a burden here—it's a competitive advantage we all take pride in.",
    name: "Team Member",
    role: "Legal & Compliance",
    initials: "LC"
  },
  {
    quote: "I appreciate the autonomy and trust given to each team member. We're empowered to make decisions and drive meaningful impact.",
    name: "Team Member",
    role: "Operations",
    initials: "OP"
  }
];

// Team stats
const teamStats = [
  { value: 15, suffix: "+", label: "Team Members" },
  { value: 4, label: "Leadership Team" },
  { value: 50, label: "States Licensed" },
  { value: 100, suffix: "%", label: "Remote Friendly" },
];

const cultureValues = [
  {
    icon: Shield,
    title: "Integrity First",
    description: "Ethical standards in everything we do."
  },
  {
    icon: TrendingUp,
    title: "Long-Term Thinking",
    description: "Decisions focused on sustainable value creation."
  },
  {
    icon: Users,
    title: "Collaborative Excellence",
    description: "Diverse perspectives toward shared goals."
  },
  {
    icon: Heart,
    title: "People-Centered",
    description: "Investment in growth and development."
  }
];

const benefits = [
  { icon: DollarSign, text: "Competitive compensation" },
  { icon: HeartPulse, text: "Health, dental, vision" },
  { icon: TrendingUp, text: "401(k) with matching" },
  { icon: GraduationCap, text: "Professional development" },
  { icon: Home, text: "Flexible work options" },
  { icon: Calendar, text: "Generous paid time off" },
  { icon: Umbrella, text: "Life and disability coverage" },
  { icon: Heart, text: "Employee assistance program" },
];

const openPositions = [
  {
    title: "Corporate Development Analyst",
    department: "Corporate Development",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Join our corporate development team to identify, evaluate, and execute strategic acquisitions and partnerships in the insurance and financial services sectors.",
    requirements: [
      "2-4 years in investment banking, PE, or M&A advisory",
      "Strong financial modeling skills (DCF, LBO)",
      "Bachelor's in Finance or related field",
      "Insurance/financial services experience preferred"
    ]
  },
  {
    title: "Compliance Manager",
    department: "Legal & Compliance",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Lead our compliance function ensuring regulatory adherence across all portfolio companies with responsibility for licensing, filings, and regulatory relationships.",
    requirements: [
      "5+ years compliance experience in insurance/financial services",
      "Deep knowledge of state insurance regulations",
      "Experience with multi-state licensing",
      "JD or compliance certification preferred"
    ]
  },
  {
    title: "Financial Analyst",
    department: "Finance",
    location: "Naperville, IL / Remote",
    type: "Full-time",
    description: "Support the CFO with financial analysis, reporting, and strategic planning across the holding company and portfolio businesses.",
    requirements: [
      "3-5 years in financial analysis or FP&A",
      "Strong GAAP knowledge and Excel skills",
      "Experience with multi-entity reporting",
      "Insurance industry experience preferred"
    ]
  },
  {
    title: "General Counsel",
    department: "Legal & Compliance",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Chief legal advisor providing strategic guidance on governance, M&A, regulatory matters, and commercial contracts.",
    requirements: [
      "JD with Illinois bar membership",
      "10+ years legal experience, 5+ in insurance/financial services",
      "M&A and corporate governance experience",
      "In-house counsel experience preferred"
    ]
  },
  {
    title: "Director of Operations",
    department: "Operations",
    location: "Naperville, IL",
    type: "Full-time",
    description: "Lead operational excellence initiatives across the holding company and portfolio businesses, driving efficiency and coordinating corporate functions.",
    requirements: [
      "7+ years operations management in financial services",
      "Proven track record in process improvement",
      "Experience managing cross-functional teams",
      "MBA or advanced degree preferred"
    ]
  }
];

export default function InstitutionalCareers() {
  const { trackCTAClicked, trackVideoPlayed } = useAnalytics();

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
              Join a team committed to long-term value creation and operational excellence.
            </p>
            <div className="accent-line-animated" />
          </motion.div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16 md:py-20 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <AnimatedStats stats={teamStats} columns={4} />
        </div>
      </section>

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

      {/* Employee Testimonials */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
              From Our Team
            </h2>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl mx-auto">
              Hear what it's like to work at Gold Coast Financial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {employeeTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg border border-border/60 hover:shadow-lg transition-all relative"
              >
                {/* Quote icon */}
                <div className="absolute -top-3 left-6">
                  <div className="w-8 h-8 rounded-full bg-[hsl(348,65%,20%)] flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed italic mt-4 mb-6">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
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
                Competitive compensation and comprehensive benefits designed to support our team members and their families.
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
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{benefit.text}</span>
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
            {openPositions.map((position, index) => {
              const deptConfig = departmentConfig[position.department] || departmentConfig["Operations"];
              const DeptIcon = deptConfig.icon;

              return (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white border-2 ${deptConfig.borderColor} p-6 md:p-8 rounded-lg hover:shadow-lg transition-all duration-300 group`}
                >
                  {/* Header with Department Badge */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      {/* Department Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${deptConfig.bgColor} ${deptConfig.color}`}>
                          <DeptIcon className="w-3.5 h-3.5" />
                          {position.department}
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-primary mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(348,65%,20%)] text-white rounded-lg text-sm font-medium hover:bg-[hsl(348,65%,25%)] transition-colors shrink-0 shadow-sm hover:shadow-md"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{position.description}</p>

                  {/* Requirements */}
                  <div className="bg-muted/30 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Requirements
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {position.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className={`w-1.5 h-1.5 rounded-full ${deptConfig.bgColor.replace('bg-', 'bg-').replace('-50', '-500')} mt-2 shrink-0`} style={{ backgroundColor: deptConfig.color.includes('blue') ? '#3b82f6' : deptConfig.color.includes('purple') ? '#8b5cf6' : deptConfig.color.includes('green') ? '#22c55e' : deptConfig.color.includes('amber') ? '#f59e0b' : deptConfig.color.includes('rose') ? '#f43f5e' : deptConfig.color.includes('cyan') ? '#06b6d4' : '#6366f1' }} />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* No Positions Message - uncomment if needed */}
          {/* <div className="text-center py-12 bg-muted/30 rounded-sm">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No Open Positions</h3>
            <p className="text-muted-foreground mb-4">
              We don't have any open positions at this time, but we're always interested in talented people.
            </p>
            <Link
              href="/contact"
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
                Don't see a position that fits? We're always interested in talented professionals who share our values.
              </p>
              <p className="text-white/70 leading-relaxed mb-8">
                Send your resume to our team—we review all applications.
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

import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { Link } from "wouter";
import {
  ArrowRight, Shield, Scale, TrendingUp, Building2, Calendar, MapPin, Users, Briefcase,
  CheckCircle, XCircle, Play, Award, Target, Handshake, HelpCircle, Leaf
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Gold Coast Financial - Institutional Homepage
 *
 * Enhanced with:
 * - Better animated stats with icons and hover effects
 * - Why Partner With Us section
 * - Before/After comparison
 * - Video content section
 * - Enhanced FAQ styling
 * - Gradient backgrounds and card effects
 * - Staggered reveal animations
 */

// Enhanced animated number component
function AnimatedNumber({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      setCount(Math.floor(easeOutQuint * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Partner endorsements data
const partnerEndorsements = [
  { name: "Mutual of Omaha", rating: "A+" },
  { name: "Nationwide", rating: "A+" },
  { name: "Prudential", rating: "A+" },
  { name: "Lincoln Financial", rating: "A+" },
  { name: "Pacific Life", rating: "A+" },
  { name: "Transamerica", rating: "A" },
  { name: "Protective Life", rating: "A+" },
  { name: "American National", rating: "A" },
  { name: "Foresters", rating: "A" },
  { name: "North American", rating: "A+" },
];

// Enhanced FAQs with more questions
const institutionalFaqs = [
  {
    question: "What is Gold Coast Financial?",
    answer: "Gold Coast Financial is a diversified financial services holding company headquartered in Naperville, Illinois. We provide governance, capital allocation, and strategic oversight to regulated insurance and advisory businesses across the United States."
  },
  {
    question: "How do I contact Gold Coast Financial for a corporate matter?",
    answer: "For corporate development, partnership opportunities, or institutional inquiries, please submit an inquiry through our contact form or email corporate@goldcoastfnl.com. Our corporate team reviews all inquiries and responds within 2-3 business days."
  },
  {
    question: "Does Gold Coast Financial sell insurance directly to consumers?",
    answer: "No. Gold Coast Financial operates as a holding company providing governance and oversight to our operating companies. Consumer insurance inquiries should be directed to Heritage Life Solutions, our life insurance brokerage."
  },
  {
    question: "What types of partnerships does Gold Coast Financial consider?",
    answer: "We evaluate potential partnerships with financial services businesses that demonstrate strong regulatory standing, experienced management teams, sustainable competitive positions, and alignment with our long-term orientation. We are particularly interested in insurance distribution, advisory services, and related technology platforms."
  },
  {
    question: "Is Gold Coast Financial a private equity firm?",
    answer: "No. Unlike private equity firms that typically seek exits within a defined timeframe, Gold Coast Financial acquires and develops financial services businesses with the intent to hold them indefinitely. We focus on building permanent institutions rather than transactions."
  },
  {
    question: "What makes Gold Coast Financial different from other holding companies?",
    answer: "Our approach emphasizes permanent capital commitment, operational independence for portfolio companies, and a multi-decade investment horizon. We prioritize regulatory excellence and sustainable growth over aggressive scaling or short-term returns."
  },
  {
    question: "How can I apply for a position at Gold Coast Financial?",
    answer: "Executive and corporate-level positions within the holding company can be inquired about by contacting applications@goldcoastfnl.com. For positions within our operating companies, please visit their respective career pages."
  },
];

// Why Partner benefits
const partnerBenefits = [
  {
    icon: Shield,
    title: "Permanent Capital",
    description: "Long-term commitment without exit pressure or forced timelines"
  },
  {
    icon: Target,
    title: "Operational Independence",
    description: "Maintain autonomy while benefiting from institutional support"
  },
  {
    icon: Scale,
    title: "Compliance Infrastructure",
    description: "Robust regulatory framework and governance oversight"
  },
  {
    icon: Handshake,
    title: "Strategic Partnership",
    description: "Collaborative approach focused on mutual long-term success"
  },
];

export default function InstitutionalHome() {
  return (
    <InstitutionalLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-28 md:py-36 lg:py-44 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />

        <div className="container mx-auto px-6 lg:px-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-1 bg-secondary mb-8"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif display-text text-white mb-10 leading-[1.15]">
              A diversified financial services holding company providing governance and strategic oversight to regulated businesses across the United States.
            </h1>
            <div className="accent-line-animated mb-10" />
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Gold Coast Financial maintains long-term capital commitments to insurance and advisory operations, emphasizing compliance, risk management, and sustainable growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Key Metrics - Enhanced with icons and hover */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-muted/40 to-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: 2025, label: "Founded", icon: Calendar, suffix: "", isYear: true },
              { value: 50, label: "States Licensed", icon: MapPin, suffix: "" },
              { value: 30, label: "Carrier Partners", icon: Briefcase, suffix: "+" },
              { value: 1000, label: "Families Protected", icon: Users, suffix: "+" },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
                className="group text-center p-8 rounded-lg bg-gradient-to-b from-white to-gray-50/50 border border-border/40 hover:border-primary/20 transition-all duration-300 cursor-default"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                  <metric.icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
                <p className="text-3xl md:text-4xl font-serif font-medium text-primary mb-2">
                  {metric.isYear ? (
                    metric.value
                  ) : (
                    <AnimatedNumber end={metric.value} suffix={metric.suffix} duration={2000} />
                  )}
                </p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Who We Are */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Who We Are
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-primary leading-relaxed">
                Gold Coast Financial serves as the parent holding company for a portfolio of regulated financial services businesses.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <p className="text-muted-foreground leading-relaxed">
                Headquartered in Naperville, Illinois, we provide centralized governance, capital allocation, and strategic direction to our operating companies. Each subsidiary maintains independent management while benefiting from shared infrastructure and institutional oversight.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our approach prioritizes regulatory compliance, conservative risk management, and the long-term interests of policyholders and stakeholders. We do not pursue short-term growth at the expense of stability.
              </p>
              <Link
                href="/goldcoastfinancial2/about"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Learn more about our company
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Why Partner With Us - NEW SECTION */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Why Partner With Us
              </h2>
              <div className="h-px w-8 bg-secondary" />
            </div>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl mx-auto">
              A different kind of holding company built for permanent partnerships.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}
                className="group p-8 rounded-lg bg-white border border-border/40 hover:border-secondary/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-primary mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Before/After Comparison - NEW SECTION */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Partnership Impact
              </h2>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              The difference institutional partnership makes for financial services businesses.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without Partnership */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-lg bg-gradient-to-br from-red-50/50 to-white border border-red-100/60"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-primary">Without Institutional Partner</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Limited access to capital for growth",
                  "Compliance burden falls entirely on operations",
                  "Vulnerable to market volatility",
                  "Succession planning uncertainty",
                  "Isolated decision-making",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* With Partnership */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-100/60"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-primary">With Gold Coast Financial</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Permanent capital with patient growth orientation",
                  "Centralized compliance and governance support",
                  "Stability through institutional backing",
                  "Clear succession and continuity planning",
                  "Strategic counsel and peer network",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Video/CEO Message Section - NEW SECTION */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  From Our Leadership
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6 leading-relaxed">
                "We build institutions meant to endure for generations, not transactions designed for exits."
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Gold Coast Financial was founded on the belief that financial services require patient capital, principled leadership, and an unwavering commitment to doing what is right for policyholders and partners alike.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-medium">
                  JC
                </div>
                <div>
                  <p className="font-medium text-primary">Jack Cook</p>
                  <p className="text-sm text-muted-foreground">Founder & Chief Executive Officer</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg overflow-hidden border border-border/40 relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm font-medium text-primary">Company Overview</p>
                    <p className="text-xs text-muted-foreground">Learn about our approach to financial services</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Our Philosophy - Enhanced */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Our Philosophy
              </h2>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              We believe financial services require patience, discipline, and an unwavering commitment to doing what is right.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Compliance First",
                description: "Regulatory adherence is not a constraint but a foundation. We exceed requirements rather than merely meeting them."
              },
              {
                icon: Scale,
                title: "Risk Management",
                description: "Conservative underwriting and capital reserves protect policyholders and ensure long-term viability."
              },
              {
                icon: TrendingUp,
                title: "Sustainable Growth",
                description: "We prioritize measured expansion over aggressive scaling, building enterprises meant to endure."
              },
              {
                icon: Building2,
                title: "Long-Term Orientation",
                description: "Decisions are made with a multi-decade horizon, not quarterly pressures."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group p-8 rounded-lg bg-gradient-to-b from-white to-gray-50/50 border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-primary mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Portfolio Companies - Enhanced */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Portfolio Companies
              </h2>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-primary max-w-3xl">
              Our operating companies serve distinct markets while sharing a commitment to excellence and integrity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Heritage Life Solutions - Active */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="p-8 md:p-10 rounded-lg bg-gradient-to-br from-white to-gray-50/80 border-2 border-secondary/20 hover:border-secondary/40 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4f5a3f] p-2 rounded-sm">
                    <Leaf className="w-4 h-4 text-[#d4a05b]" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary">
                    Life Insurance
                  </span>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Active</span>
              </div>
              <h3 className="text-xl font-serif text-primary mb-4">
                Heritage Life Solutions
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                An independent life insurance brokerage providing personalized coverage solutions to individuals and families nationwide. Operates under Gold Coast Financial governance with full regulatory compliance across all 50 states.
              </p>
              <a
                href="/heritage"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
              >
                Visit Heritage Life Solutions
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Future Expansion Cards */}
            {[
              { sector: "Property & Casualty", desc: "Evaluating opportunities in property and casualty insurance distribution" },
              { sector: "Advisory Services", desc: "Strategic advisory services for insurance and financial planning" },
              { sector: "Technology & Data", desc: "Insurance technology and data analytics capabilities" },
            ].map((item, index) => (
              <motion.div
                key={item.sector}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                className="p-8 md:p-10 rounded-lg border border-border/60 bg-muted/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.sector}
                  </span>
                  <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full">Planned</span>
                </div>
                <h3 className="text-xl font-serif text-muted-foreground mb-4">
                  Future Expansion
                </h3>
                <p className="text-muted-foreground/70 text-sm leading-relaxed">
                  {item.desc}, maintaining disciplined criteria for market entry and partnership selection.
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Link
              href="/goldcoastfinancial2/portfolio"
              className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              View all portfolio information
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Carrier Partners - Enhanced */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Carrier Relationships
              </h2>
              <div className="h-px w-8 bg-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Our portfolio companies partner with leading A-rated insurance carriers
            </p>
          </motion.div>
        </div>

        <div className="partner-scroll-container">
          <div className="partner-scroll-track">
            {[...partnerEndorsements, ...partnerEndorsements].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 shrink-0 px-6 py-3 bg-gradient-to-r from-transparent via-muted/30 to-transparent rounded-lg"
              >
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {partner.name}
                </span>
                <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded font-medium">
                  {partner.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Leadership Preview */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/5 to-transparent" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Leadership
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif leading-relaxed">
                Experienced leadership with a commitment to integrity, regulatory excellence, and long-term value creation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <p className="text-primary-foreground/80 leading-relaxed">
                Gold Coast Financial's governance structure ensures accountability, transparency, and alignment with the interests of all stakeholders. Our leadership team brings decades of combined experience in insurance, finance, and regulatory affairs.
              </p>
              <Link
                href="/goldcoastfinancial2/about"
                className="arrow-link text-sm font-medium text-secondary hover:text-secondary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Meet our leadership
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* FAQ Section - Enhanced */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Common Questions
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
                Frequently asked questions about Gold Coast Financial.
              </p>
              <Link
                href="/goldcoastfinancial2/contact"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Contact us with questions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Accordion type="single" collapsible className="space-y-3">
                {institutionalFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white border border-border/40 rounded-lg px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 text-sm font-medium text-primary [&[data-state=open]>svg]:text-secondary">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pl-7 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Contact Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-secondary" />
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                Contact
              </h2>
            </div>
            <p className="text-2xl md:text-3xl font-serif text-primary mb-6">
              Corporate & Partnership Inquiries
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              For corporate development, partnership opportunities, or institutional inquiries, please contact our corporate office. Consumer insurance inquiries should be directed to our operating companies.
            </p>
            <Link
              href="/goldcoastfinancial2/contact"
              className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              Contact information
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}

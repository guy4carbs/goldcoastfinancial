import { InstitutionalLayout } from "@/components/layout/InstitutionalLayout";
import { Link } from "wouter";
import {
  ArrowRight, Shield, Scale, TrendingUp, Building2, Calendar, MapPin, Users, Briefcase,
  CheckCircle, XCircle, Target, Handshake, HelpCircle, Leaf, Quote
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TrustIndicators } from "@/components/institutional/TrustIndicators";
import { VideoSection } from "@/components/institutional/VideoSection";
import { useAnalytics } from "@/hooks/useAnalytics";

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

// Carrier logos for carousel - links to Heritage (consumer site)
const carrierLinks = [
  {
    name: "Mutual of Omaha",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277474666-Mutual-of-Omaha-logo.png?alt=media&token=0382cf9c-c262-4931-8155-688210c1c173",
    size: "large" as const,
  },
  {
    name: "Lincoln Financial Group",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b",
    size: "normal" as const,
  },
  {
    name: "Transamerica",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d",
    size: "large" as const,
  },
  {
    name: "Corebridge Financial",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
    size: "normal" as const,
  },
  {
    name: "Athene",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277359214-logo.png?alt=media&token=6770c112-2236-4b92-b80e-2811635f6643",
    size: "normal" as const,
  },
  {
    name: "Americo",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba",
    size: "normal" as const,
  },
  {
    name: "Ladder Life",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733",
    size: "normal" as const,
  },
  {
    name: "Ethos",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277532663-6341f9fa-fd59-42aa-b238-d23e46658048.png?alt=media&token=ea3d4914-d65e-4817-9a81-1ea709064e52",
    size: "normal" as const,
  },
  {
    name: "Baltimore Life",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277409363-logo%402x.png?alt=media&token=cdd3c6d0-e497-4a4c-a357-6e3b548dd95c",
    size: "normal" as const,
  },
  {
    name: "American Home Life",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b",
    size: "large" as const,
  },
  {
    name: "Royal Neighbors",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56",
    size: "normal" as const,
  },
  {
    name: "Polish Falcons",
    logo: "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238",
    size: "normal" as const,
  },
];

// Enhanced FAQs with more questions
const institutionalFaqs = [
  {
    question: "What is Gold Coast Financial?",
    answer: "A financial services holding company headquartered in Naperville, Illinois, providing governance and oversight to regulated insurance businesses."
  },
  {
    question: "Does Gold Coast Financial sell insurance directly?",
    answer: "No. Consumer insurance inquiries should be directed to Heritage Life Solutions, our operating company."
  },
  {
    question: "What types of partnerships do you consider?",
    answer: "Financial services businesses with strong regulatory standing, experienced management, and alignment with our long-term orientation."
  },
  {
    question: "Is Gold Coast Financial a private equity firm?",
    answer: "No. We acquire businesses with the intent to hold them indefinitely, focusing on permanent institutions rather than exits."
  },
];

// Partner/Carrier testimonials
const partnerTestimonials = [
  {
    quote: "Their commitment to compliance and long-term relationships aligns perfectly with our distribution partner standards.",
    source: "Regional Director",
    company: "A+ Rated National Carrier",
    initials: "NC"
  },
  {
    quote: "Working with Heritage Life Solutions has been seamless. Their focus on doing things right makes them trusted.",
    source: "Relationship Manager",
    company: "Leading Life Insurance Provider",
    initials: "LP"
  },
  {
    quote: "The institutional approach Gold Coast Financial brings sets them apart from typical insurance distributors.",
    source: "VP of Business Development",
    company: "Fortune 500 Insurance Company",
    initials: "IC"
  }
];

export default function InstitutionalHome() {
  const { trackCTAClicked, trackVideoPlayed } = useAnalytics();

  return (
    <InstitutionalLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-20 lg:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent" />

        <div className="container mx-auto px-6 lg:px-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "3rem" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-1 bg-secondary mb-6"
              />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif display-text text-white mb-6 leading-[1.2]">
                Permanent capital for regulated financial services.
              </h1>
              <p className="text-base md:text-lg text-white/70 leading-relaxed">
                Long-term governance, compliance infrastructure, and strategic oversight for insurance and advisory businesses nationwide.
              </p>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                    alt="Modern office building representing institutional strength"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(348,65%,15%)]/60 to-transparent" />
                </div>
                {/* Accent corner */}
                <div className="absolute -bottom-3 -left-3 w-20 h-20 border-l-2 border-b-2 border-secondary/40" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-6 lg:px-12">
          <TrustIndicators variant="light" />
        </div>
      </section>

      {/* Key Metrics - Enhanced with icons and hover */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-white to-muted/20">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"
                  alt="Business professionals in meeting"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-secondary/10" />
              </div>
              {/* Accent elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary/20 rounded-lg -z-10" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-lg -z-10" />
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 order-1 lg:order-2"
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
              <p className="text-muted-foreground leading-relaxed">
                Headquartered in Naperville, Illinois, we provide governance, capital allocation, and strategic direction. Each subsidiary maintains independent management while benefiting from shared infrastructure.
              </p>
              <Link
                href="/about"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Learn more about our company
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Overview Video */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Our Vision
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6 leading-relaxed">
                Building permanent institutions through disciplined capital allocation.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Hear from our leadership on our approach to long-term value creation.
              </p>
              <Link
                href="/about"
                onClick={() => trackCTAClicked("Meet Leadership", "video_section", "/about")}
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Meet our leadership team
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <VideoSection
                title="Company Overview"
                subtitle="Leadership Message"
                onPlay={() => trackVideoPlayed("company_overview")}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Our Approach - Combined Philosophy & Partner Benefits */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-muted/20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Philosophy Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-24"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Our Approach
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif text-primary mb-6 leading-relaxed">
                Patient capital. Permanent partnerships. Principled growth.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We believe financial services require discipline and an unwavering commitment to doing what is right—for partners, policyholders, and the communities we serve.
              </p>

              {/* Key differentiators */}
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Compliance-first culture" },
                  { icon: TrendingUp, text: "Multi-decade investment horizon" },
                  { icon: Handshake, text: "Operational independence for partners" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-primary">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Before/After Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Without Partnership */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-red-50/50 to-white border border-red-100/60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="text-sm font-medium text-primary">Without Institutional Partner</h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Limited growth capital",
                    "Full compliance burden",
                    "Market vulnerability",
                    "Succession uncertainty",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* With Partnership */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-50/50 to-white border border-green-100/60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-primary">With Gold Coast Financial</h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Permanent capital",
                    "Compliance infrastructure",
                    "Institutional stability",
                    "Succession planning",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Heritage Life Solutions - Active (spans 3 columns) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="lg:col-span-3 p-8 md:p-10 rounded-lg bg-gradient-to-br from-white to-gray-50/80 border-2 border-secondary/20 hover:border-secondary/40 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-sm" style={{ backgroundColor: "#6B5B95" }}>
                    <Leaf className="w-4 h-4" style={{ color: "#C4B7D5" }} />
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
                href="https://heritagels.org"
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-link text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Visit Heritage Life Solutions
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Future Expansion - Single Card (spans 2 columns) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 p-8 md:p-10 rounded-lg border border-border/60 bg-muted/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Growth Strategy
                </span>
              </div>
              <h3 className="text-lg font-serif text-primary mb-4">
                Disciplined Expansion
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                We evaluate opportunities in adjacent sectors—property & casualty, advisory services, and insurance technology—with rigorous criteria for partnership selection.
              </p>
              <Link
                href="/investors"
                className="arrow-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Learn about partnership criteria
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Link
              href="/portfolio"
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
            {[...carrierLinks, ...carrierLinks].map((carrier, index) => (
              <a
                key={`${carrier.name}-${index}`}
                href="https://heritagels.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] mx-2 sm:mx-4 lg:mx-6 h-16 sm:h-20 lg:h-24 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
              >
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className={`object-contain ${carrier.size === 'large' ? 'h-12 sm:h-16 lg:h-20 max-w-[120px] sm:max-w-[150px] lg:max-w-[180px]' : 'h-10 sm:h-12 lg:h-16 max-w-[100px] sm:max-w-[130px] lg:max-w-[160px]'}`}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Leadership & Partner Trust */}
      <section className="py-20 md:py-28 dark-gradient text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/5 to-transparent" />
        <div className="container mx-auto px-6 lg:px-12 relative">
          {/* Leadership Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-secondary" />
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                  Leadership & Trust
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-serif leading-relaxed">
                Experienced leadership. Trusted by industry partners.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <p className="text-primary-foreground/70 leading-relaxed mb-4">
                Our leadership team brings decades of combined experience in insurance, finance, and regulatory affairs.
              </p>
              <Link
                href="/about"
                className="arrow-link text-sm font-medium text-secondary hover:text-secondary/80 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Meet our leadership
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Partner Testimonials - Integrated */}
          <div className="grid md:grid-cols-3 gap-6">
            {partnerTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10"
              >
                <Quote className="w-6 h-6 text-secondary/60 mb-4" />
                <p className="text-sm text-primary-foreground/80 leading-relaxed italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-secondary">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-foreground">{testimonial.source}</p>
                    <p className="text-xs text-primary-foreground/50">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
                href="/contact"
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
              For partnership opportunities or institutional inquiries, contact our corporate office.
            </p>
            <Link
              href="/contact"
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

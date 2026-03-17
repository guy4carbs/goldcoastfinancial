import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RecruitApplicationForm } from "./RecruitApplicationForm";
import {
  DollarSign, GraduationCap, Clock, Shield, Star,
  CheckCircle, ChevronDown, ArrowRight,
} from "lucide-react";
import {
  RADIUS, SHADOW, GRID, TYPE, COLORS, GLASS, fadeInUp, staggerCards,
} from "@/lib/heritageDesignSystem";

interface LandingPagePreviewProps {
  referralCode: string;
  agentName?: string;
}

// ===== DATA CONSTANTS =====

const benefits = [
  {
    icon: DollarSign,
    title: "Unlimited Earning Potential",
    description: "Top agents earn $150K+ annually with competitive commissions and override bonuses.",
    metric: "$127K",
    metricLabel: "Avg First-Year Income",
  },
  {
    icon: GraduationCap,
    title: "Full Training & Licensing",
    description: "We cover licensing costs and provide a 12-week mentorship with proven scripts and systems.",
    metric: "12 Weeks",
    metricLabel: "Paid Training Program",
  },
  {
    icon: Clock,
    title: "Work On Your Terms",
    description: "Set your own schedule. Work from anywhere. No cold calling — we provide warm leads.",
    metric: "100%",
    metricLabel: "Remote Flexibility",
  },
  {
    icon: Shield,
    title: "Vested from Day One",
    description: "Your book of business is yours. Full ownership of renewals and residual income immediately.",
    metric: "Day 1",
    metricLabel: "Full Vesting",
  },
] as const;

const commissionRows = [
  { product: "Term Life", rate: "80-110%", unit: "FYC" },
  { product: "Whole Life", rate: "90-120%", unit: "FYC" },
  { product: "IUL", rate: "90-115%", unit: "FYC" },
  { product: "Annuities", rate: "5-7%", unit: "of Premium" },
  { product: "Final Expense", rate: "100-130%", unit: "FYC" },
] as const;

const testimonials = [
  {
    name: "Marcus J.",
    role: "Former Teacher",
    location: "Chicago, IL",
    quote: "I left teaching after 8 years. In my first year with Heritage I earned more than double my old salary. The training made the transition seamless.",
    income: "$142K",
    period: "First Year",
  },
  {
    name: "Priya S.",
    role: "Former Nurse",
    location: "Dallas, TX",
    quote: "The flexibility is everything. I work around my kids' schedules and still hit top producer every quarter. Heritage gave me my life back.",
    income: "$98K",
    period: "Part-Time",
  },
  {
    name: "David L.",
    role: "Career Changer",
    location: "Phoenix, AZ",
    quote: "Zero insurance experience. Heritage walked me through licensing, gave me a mentor, and I closed my first policy in week three. Best decision I ever made.",
    income: "$167K",
    period: "Second Year",
  },
] as const;

const steps = [
  { number: "1", title: "Apply Online", description: "Fill out this quick form. We'll review your application and reach out within 24 hours." },
  { number: "2", title: "Get Licensed & Trained", description: "We cover licensing costs and pair you with a mentor for our 12-week training program." },
  { number: "3", title: "Start Earning", description: "Begin helping families while building your own book of business with full ownership from day one." },
] as const;

const faqs = [
  { question: "Do I need an insurance license?", answer: "No! We help you get licensed. Heritage covers the cost of pre-licensing courses and exam fees. Most agents are fully licensed within 2-3 weeks." },
  { question: "Is there a cost to join?", answer: "There is zero cost to join Heritage. We invest in you — licensing, training, technology, and lead generation are all provided at no charge." },
  { question: "What does the training look like?", answer: "Our 12-week mentorship pairs you with a top producer. You'll learn proven sales scripts, product knowledge, and client management systems through hands-on practice." },
  { question: "Can I do this part-time?", answer: "Absolutely. Many of our top agents started part-time while keeping their day job. You set your own schedule — mornings, evenings, weekends — whatever works for you." },
  { question: "How quickly can I start earning?", answer: "Most agents close their first policy within the first 2-3 weeks of completing training. Commissions are paid within 48 hours of policy issue." },
] as const;

const keyStats = [
  { value: "500+", label: "Active Agents" },
  { value: "$127K", label: "Avg First Year" },
  { value: "40+", label: "A-Rated Carriers" },
  { value: "98%", label: "Retention Rate" },
] as const;

const deeperProofStats = [
  { value: "48hrs", label: "Commission Payout" },
  { value: "$0", label: "Cost to Join" },
  { value: "4.9/5", label: "Agent Satisfaction" },
  { value: "12 Wks", label: "Full Training" },
] as const;

// ===== ACCENT COLOR MAPS =====

const benefitAccents = [
  { bg: "rgba(245,158,11,0.12)", color: "#d97706" },
  { bg: "rgba(6,182,212,0.12)", color: "#0891b2" },
  { bg: "rgba(34,197,94,0.12)", color: "#059669" },
  { bg: "rgba(139,92,246,0.12)", color: COLORS.primary.violet[600] },
] as const;

const testimonialBadgeColors = [
  { color: "#059669", bg: "rgba(16,185,129,0.1)" },
  { color: "#0891b2", bg: "rgba(6,182,212,0.1)" },
  { color: "#d97706", bg: "rgba(245,158,11,0.1)" },
] as const;

const stepColors = [
  { gradient: COLORS.gradients.hero, glow: SHADOW.glow.violet },
  { gradient: COLORS.gradients.amber, glow: SHADOW.glow.amber },
  { gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", glow: SHADOW.glow.emerald },
] as const;

// ===== ANIMATION VARIANTS =====

const sectionReveal: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cardItem: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const faqContent: import("framer-motion").Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.25, ease: "easeOut" }, opacity: { duration: 0.2, delay: 0.05 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.2, ease: "easeIn" }, opacity: { duration: 0.1 } },
  },
};

const SERIF = "'Playfair Display', serif";

// ===== COMPONENT =====

export function LandingPagePreview({ referralCode, agentName }: LandingPagePreviewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const agentSlug = agentName
    ? agentName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    : referralCode;
  const displayName = agentName || 'your mentor';

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: GRID.spacing.md }}
    >
      {/* Browser Chrome Frame */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid",
          borderColor: COLORS.gray[100],
          borderRadius: RADIUS.hero,
          boxShadow: SHADOW.level3,
          overflow: "hidden",
        }}
      >
        {/* Browser Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: GRID.spacing.sm,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
            background: COLORS.gray[50],
            borderBottom: `1px solid ${COLORS.gray[200]}`,
          }}
        >
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, borderRadius: RADIUS.pill, background: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: RADIUS.pill, background: "#eab308" }} />
            <div style={{ width: 12, height: 12, borderRadius: RADIUS.pill, background: "#22c55e" }} />
          </div>
          <div
            style={{
              flex: 1,
              background: "white",
              borderRadius: RADIUS.input,
              padding: `${GRID.spacing.xs / 2}px ${GRID.spacing.sm}px`,
              fontSize: TYPE.caption,
              color: COLORS.gray[500],
              border: `1px solid ${COLORS.gray[200]}`,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            heritagels.org/recruit/agent-{agentSlug}
          </div>
        </div>

        {/* ===== LANDING PAGE CONTENT ===== */}
        <div style={{ background: "white" }}>

          {/* SECTION 1: HERO */}
          <div
            style={{
              background: COLORS.gradients.hero,
              padding: `${GRID.spacing.xxxl}px ${GRID.spacing.lg}px`,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Dot pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.1,
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            {/* Floating circles */}
            <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "rgba(255,255,255,0.08)", borderRadius: RADIUS.pill, transform: "translate(30%, -40%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 80, height: 80, background: "rgba(245,158,11,0.12)", borderRadius: RADIUS.pill, transform: "translate(-30%, 40%)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Eyebrow */}
              <span
                style={{
                  display: "inline-block",
                  fontSize: TYPE.micro,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.15)",
                  padding: "4px 14px",
                  borderRadius: RADIUS.pill,
                  marginBottom: GRID.spacing.sm,
                }}
              >
                Now Recruiting in All 50 States
              </span>

              <h2
                style={{
                  fontSize: TYPE.display,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: SERIF,
                  lineHeight: 1.15,
                  marginBottom: GRID.spacing.sm,
                  margin: `0 auto ${GRID.spacing.sm}px`,
                  maxWidth: 460,
                }}
              >
                Build a Six-Figure Career Helping Families
              </h2>

              <p
                style={{
                  fontSize: TYPE.meta,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.6,
                  maxWidth: 420,
                  margin: `0 auto ${GRID.spacing.md}px`,
                }}
              >
                Join 500+ Heritage agents earning $127K+ in their first year. No experience needed. Full training provided.
              </p>

              <button
                className="group"
                onClick={() => setShowApplication(true)}
                style={{
                  background: COLORS.gradients.amber,
                  color: "white",
                  fontWeight: 700,
                  fontSize: TYPE.meta,
                  padding: `${GRID.spacing.sm}px ${GRID.spacing.lg}px`,
                  borderRadius: RADIUS.pill,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: SHADOW.glow.amber,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                Apply Now — It's Free
                <span style={{ display: "inline-flex", transition: "transform 0.3s ease" }} className="group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>

          {showApplication ? (
            <RecruitApplicationForm
              agentName={displayName}
              agentSlug={agentSlug}
              onBack={() => setShowApplication(false)}
              embedded={true}
            />
          ) : (
          <>
          {/* SECTION 2: TRUST BAR */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={staggerCards}
            style={{
              background: COLORS.gray[50],
              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
              borderBottom: `1px solid ${COLORS.gray[100]}`,
              borderTop: "3px solid transparent",
              borderImage: `${COLORS.gradients.heroWithAccent} 1`,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: GRID.spacing.xs }}>
              {keyStats.map((stat) => (
                <motion.div key={stat.label} variants={cardItem} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: TYPE.body, fontWeight: 900, color: COLORS.gray[900], margin: 0, letterSpacing: "-0.01em" }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 10, color: COLORS.gray[500], fontWeight: 500, margin: 0 }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 3: PAIN → SOLUTION */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionReveal}
            style={{ background: "white", padding: `${GRID.spacing.xl}px ${GRID.spacing.md}px`, textAlign: "center" }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: TYPE.micro,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#059669",
                background: "rgba(16,185,129,0.08)",
                padding: "3px 12px",
                borderRadius: RADIUS.pill,
                marginBottom: GRID.spacing.sm,
              }}
            >
              Why Heritage?
            </span>

            <h3
              style={{
                fontSize: TYPE.section,
                fontWeight: 700,
                color: COLORS.gray[900],
                fontFamily: SERIF,
                marginBottom: GRID.spacing.sm,
              }}
            >
              Stop Trading Time for a Paycheck
            </h3>

            <p
              style={{
                fontSize: TYPE.caption,
                color: COLORS.gray[600],
                lineHeight: 1.6,
                maxWidth: 420,
                margin: `0 auto ${GRID.spacing.md}px`,
              }}
            >
              Most people work 40+ years building someone else's dream. Heritage agents build their own — with unlimited income, true flexibility, and a business they actually own.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: GRID.spacing.xs, alignItems: "center" }}>
              {[
                "No income ceiling — earn what you're worth",
                "No boss micromanaging your schedule",
                "No starting from scratch — we give you the playbook",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: RADIUS.pill,
                      background: "rgba(16, 185, 129, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={11} style={{ color: "#10b981" }} />
                  </div>
                  <span style={{ fontSize: TYPE.caption, color: COLORS.gray[700], fontWeight: 500 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 4: BENEFIT CARDS (Glassmorphism) */}
          <div
            style={{
              background: COLORS.gradients.subtle,
              padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px`,
            }}
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerCards}
              style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: GRID.spacing.sm }}
            >
              {benefits.map((b, index) => {
                const accent = benefitAccents[index];
                return (
                  <motion.div
                    key={b.title}
                    variants={cardItem}
                    whileHover={{ y: -3, boxShadow: SHADOW.level3 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      ...GLASS.css.standard,
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: RADIUS.card,
                      padding: GRID.spacing.sm,
                      boxShadow: SHADOW.card,
                      cursor: "default",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: RADIUS.pill,
                        background: accent.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: GRID.spacing.xs,
                      }}
                    >
                      <b.icon size={16} style={{ color: accent.color }} />
                    </div>
                    <h4 style={{ fontSize: TYPE.caption, fontWeight: 700, color: COLORS.gray[900], lineHeight: 1.3, marginBottom: 4 }}>
                      {b.title}
                    </h4>
                    <p style={{ fontSize: 11, color: COLORS.gray[500], lineHeight: 1.4, margin: 0, marginBottom: GRID.spacing.xs }}>
                      {b.description}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: TYPE.micro,
                        fontWeight: 800,
                        color: accent.color,
                        background: accent.bg,
                        padding: "2px 8px",
                        borderRadius: RADIUS.pill,
                      }}
                    >
                      {b.metric} {b.metricLabel}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* SECTION 5: TESTIMONIALS */}
          <div style={{ background: "white", padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px` }}>
            <div style={{ textAlign: "center", marginBottom: GRID.spacing.md }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: TYPE.micro,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: COLORS.accent.amber[700],
                  background: COLORS.accent.amber[50],
                  padding: "3px 12px",
                  borderRadius: RADIUS.pill,
                }}
              >
                Agent Success Stories
              </span>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerCards}
              style={{ display: "flex", flexDirection: "column", gap: GRID.spacing.sm }}
            >
              {testimonials.map((t, index) => {
                const badge = testimonialBadgeColors[index];
                return (
                  <motion.div
                    key={t.name}
                    variants={cardItem}
                    whileHover={{ y: -2, boxShadow: SHADOW.level2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "white",
                      borderRadius: RADIUS.card,
                      padding: GRID.spacing.md,
                      border: `1px solid ${COLORS.gray[200]}`,
                      boxShadow: SHADOW.level1,
                      cursor: "default",
                    }}
                  >
                    {/* Decorative quote */}
                    <span style={{
                      fontSize: 32,
                      fontFamily: SERIF,
                      fontWeight: 700,
                      color: COLORS.primary.violet[200],
                      lineHeight: 1,
                      display: "block",
                      marginBottom: 2,
                    }}>
                      &ldquo;
                    </span>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={COLORS.accent.amber[400]} style={{ color: COLORS.accent.amber[400] }} />
                      ))}
                    </div>
                    {/* Quote */}
                    <p
                      style={{
                        fontSize: TYPE.caption,
                        color: COLORS.gray[700],
                        lineHeight: 1.5,
                        fontStyle: "italic",
                        margin: 0,
                        marginBottom: GRID.spacing.xs,
                      }}
                    >
                      {t.quote}
                    </p>
                    {/* Author + Income */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: TYPE.caption, fontWeight: 600, color: COLORS.gray[800], margin: 0 }}>
                          {t.name}
                        </p>
                        <p style={{ fontSize: 10, color: COLORS.gray[400], margin: 0 }}>
                          {t.role} · {t.location}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: TYPE.micro,
                          fontWeight: 800,
                          color: badge.color,
                          background: badge.bg,
                          padding: "3px 10px",
                          borderRadius: RADIUS.pill,
                        }}
                      >
                        {t.income} {t.period}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* SECTION 6: HOW IT WORKS */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionReveal}
            style={{ background: COLORS.primary.violet[50], padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px` }}
          >
            <div style={{ textAlign: "center", marginBottom: GRID.spacing.md }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: TYPE.micro,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: COLORS.primary.violet[600],
                  background: "white",
                  padding: "3px 12px",
                  borderRadius: RADIUS.pill,
                  marginBottom: GRID.spacing.xs,
                }}
              >
                How to Join
              </span>
              <h3
                style={{
                  fontSize: TYPE.body,
                  fontWeight: 700,
                  color: COLORS.gray[900],
                  fontFamily: SERIF,
                  margin: 0,
                }}
              >
                Start Earning in 3 Simple Steps
              </h3>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerCards}
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: GRID.spacing.sm }}
            >
              {steps.map((s, index) => {
                const sc = stepColors[index];
                return (
                  <motion.div key={s.number} variants={cardItem} style={{ textAlign: "center", position: "relative" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: RADIUS.pill,
                        background: sc.gradient,
                        color: "white",
                        fontSize: TYPE.caption,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        marginBottom: GRID.spacing.xs,
                        boxShadow: sc.glow,
                      }}
                    >
                      {s.number}
                    </div>
                    {/* Dashed connector */}
                    {index < steps.length - 1 && (
                      <div style={{
                        position: "absolute",
                        top: 13,
                        left: "calc(50% + 18px)",
                        width: `calc(100% - 36px + ${GRID.spacing.sm}px)`,
                        height: 0,
                        borderTop: `2px dashed ${COLORS.primary.violet[300]}`,
                      }} />
                    )}
                    <h4 style={{ fontSize: TYPE.caption, fontWeight: 700, color: COLORS.gray[900], marginBottom: 4 }}>
                      {s.title}
                    </h4>
                    <p style={{ fontSize: 11, color: COLORS.gray[500], lineHeight: 1.4, margin: 0 }}>
                      {s.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* SECTION 7: COMMISSION TABLE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionReveal}
            style={{ background: "white", padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px` }}
          >
            <div style={{ textAlign: "center", marginBottom: GRID.spacing.md }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: TYPE.micro,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: COLORS.accent.amber[700],
                  background: COLORS.accent.amber[50],
                  padding: "3px 12px",
                  borderRadius: RADIUS.pill,
                  marginBottom: GRID.spacing.xs,
                }}
              >
                Compensation
              </span>
              <h3
                style={{
                  fontSize: TYPE.body,
                  fontWeight: 700,
                  color: COLORS.gray[900],
                  fontFamily: SERIF,
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                Industry-Leading Commission Rates
              </h3>
              <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], margin: 0 }}>
                Paid within 48 hours of policy issue. No caps. No chargebacks on clean business.
              </p>
            </div>

            <div
              style={{
                borderRadius: RADIUS.card,
                overflow: "hidden",
                boxShadow: SHADOW.level1,
                border: `1px solid ${COLORS.gray[100]}`,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: TYPE.caption }}>
                <thead>
                  <tr style={{ background: COLORS.gradients.heroWithAccent }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                        fontWeight: 700,
                        color: "white",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                        fontWeight: 700,
                        color: "white",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissionRows.map((row, i) => (
                    <tr
                      key={row.product}
                      style={{
                        background: i % 2 === 0 ? "white" : COLORS.gray[50],
                        borderBottom: i < commissionRows.length - 1 ? `1px solid ${COLORS.gray[100]}` : undefined,
                      }}
                    >
                      <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`, color: COLORS.gray[800] }}>
                        {row.product}
                      </td>
                      <td
                        style={{
                          padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                          textAlign: "right",
                          color: COLORS.accent.amber[600],
                          fontWeight: 700,
                        }}
                      >
                        {row.rate} {row.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* SECTION 8: DEEPER PROOF (Dark Gradient Strip) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerCards}
            style={{
              background: COLORS.gradients.heroWithAccent,
              padding: `${GRID.spacing.md}px`,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: GRID.spacing.xs }}>
              {deeperProofStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={cardItem}
                  style={{
                    textAlign: "center",
                    borderLeft: index > 0 ? "1px solid rgba(255,255,255,0.2)" : undefined,
                    paddingLeft: index > 0 ? GRID.spacing.xs : undefined,
                  }}
                >
                  <p style={{ fontSize: TYPE.section, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.02em" }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 500, margin: 0 }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 9: FAQ (Interactive Accordion) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionReveal}
            style={{ background: COLORS.gray[50], padding: `${GRID.spacing.lg}px ${GRID.spacing.md}px` }}
          >
            <div style={{ textAlign: "center", marginBottom: GRID.spacing.md }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: TYPE.micro,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#0891b2",
                  background: "rgba(6,182,212,0.08)",
                  padding: "3px 12px",
                  borderRadius: RADIUS.pill,
                  marginBottom: GRID.spacing.xs,
                }}
              >
                Common Questions
              </span>
              <h3
                style={{
                  fontSize: TYPE.body,
                  fontWeight: 700,
                  color: COLORS.gray[900],
                  fontFamily: SERIF,
                  margin: 0,
                }}
              >
                Everything You Need to Know
              </h3>
            </div>

            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: i < faqs.length - 1 ? `1px solid ${COLORS.gray[200]}` : undefined,
                    padding: `${GRID.spacing.sm}px 0`,
                  }}
                >
                  <div
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      gap: GRID.spacing.xs,
                    }}
                  >
                    <span style={{ fontSize: TYPE.caption, fontWeight: 600, color: COLORS.gray[800] }}>
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{ flexShrink: 0, display: "flex" }}
                    >
                      <ChevronDown size={14} style={{ color: COLORS.gray[400] }} />
                    </motion.div>
                  </div>

                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key={`faq-${i}`}
                        variants={faqContent}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ overflow: "hidden" }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            color: COLORS.gray[500],
                            lineHeight: 1.5,
                            margin: 0,
                            paddingTop: GRID.spacing.xs,
                          }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 10: FINAL CTA */}
          <div
            style={{
              background: COLORS.gradients.hero,
              padding: `${GRID.spacing.xxl}px ${GRID.spacing.md}px`,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100, background: "rgba(255,255,255,0.06)", borderRadius: RADIUS.pill, transform: "translate(-30%, -40%)" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 60, height: 60, background: "rgba(245,158,11,0.1)", borderRadius: RADIUS.pill, transform: "translate(30%, 40%)" }} />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionReveal}
              style={{ position: "relative", zIndex: 1 }}
            >
              <h3
                style={{
                  fontSize: TYPE.hero,
                  fontWeight: 700,
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  color: "white",
                  marginBottom: GRID.spacing.xs,
                }}
              >
                Your Future Starts Here
              </h3>
              <p
                style={{
                  fontSize: TYPE.meta,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.5,
                  marginBottom: GRID.spacing.md,
                  maxWidth: 380,
                  margin: `0 auto ${GRID.spacing.md}px`,
                }}
              >
                Apply now and {displayName} will personally guide you through every step.
              </p>
              <ShimmerButton
                shimmerColor="rgba(255,255,255,0.5)"
                shimmerSize="0.05em"
                shimmerDuration="3s"
                borderRadius={`${RADIUS.button}px`}
                background={COLORS.gradients.amber}
                className="cursor-pointer mx-auto"
                onClick={() => setShowApplication(true)}
                style={{
                  fontWeight: 700,
                  fontSize: TYPE.meta,
                  padding: `${GRID.spacing.sm}px ${GRID.spacing.lg}px`,
                  boxShadow: SHADOW.glow.amber,
                }}
              >
                Start Your Application
              </ShimmerButton>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: GRID.spacing.sm }}>
                Free to join. No experience required. No obligation.
              </p>
            </motion.div>
          </div>

          {/* SECTION 11: FOOTER */}
          <div
            style={{
              borderTop: `1px solid ${COLORS.gray[100]}`,
              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: TYPE.caption, fontWeight: 700, color: COLORS.gray[800], margin: 0, marginBottom: 4, fontFamily: SERIF }}>
              Heritage Life Solutions
            </p>
            <p style={{ fontSize: 11, color: COLORS.primary.violet[500], margin: 0, marginBottom: 4 }}>
              heritagels.org
            </p>
            {agentName && (
              <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.accent.amber[600], margin: 0, marginBottom: 6 }}>
                Invited by {agentName}
              </p>
            )}
            {/* Decorative dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
              <div style={{ width: 3, height: 3, borderRadius: RADIUS.pill, background: COLORS.gray[300] }} />
              <div style={{ width: 3, height: 3, borderRadius: RADIUS.pill, background: COLORS.primary.violet[300] }} />
              <div style={{ width: 3, height: 3, borderRadius: RADIUS.pill, background: COLORS.gray[300] }} />
            </div>
            <p style={{ fontSize: 10, color: COLORS.gray[400], margin: 0, lineHeight: 1.4 }}>
              Results may vary. Heritage Life Solutions is an equal opportunity employer. All trademarks are property of their respective owners.
            </p>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Customize Landing Page Button (below browser frame) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: GRID.spacing.xs,
        }}
      >
        <Button
          disabled
          style={{
            opacity: 0.5,
            borderRadius: RADIUS.button,
            fontSize: TYPE.meta,
            cursor: "default",
          }}
          variant="outline"
        >
          Customize Landing Page
        </Button>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.primary.violet[500],
            background: COLORS.primary.violet[50],
            padding: `2px ${GRID.spacing.xs}px`,
            borderRadius: RADIUS.pill,
          }}
        >
          Coming Soon
        </span>
      </div>
    </motion.div>
  );
}

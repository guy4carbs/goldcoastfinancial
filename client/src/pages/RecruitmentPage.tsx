import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, GraduationCap, Clock, Shield, Star,
  CheckCircle, ChevronDown, ArrowRight, Users, Award,
  Zap, FileCheck, Briefcase,
} from "lucide-react";
import { parseAgentSlug } from "@/lib/agentSlugUtils";
import { RecruitApplicationForm } from "@/components/agent/recruiting/RecruitApplicationForm";
import { RADIUS, SHADOW } from "@/lib/heritageDesignSystem";

// ─── Constants ──────────────────────────────────────────────────────────────

const SERIF = "'Playfair Display', serif";
const logoUrl = "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b";

const BENEFITS = [
  { icon: DollarSign, title: "Unlimited Earning Potential", desc: "Top agents earn $150K+ annually with competitive commissions and override bonuses. No income ceiling." },
  { icon: GraduationCap, title: "Full Training & Licensing", desc: "We cover licensing costs and provide a 12-week mentorship with proven scripts and systems." },
  { icon: Clock, title: "Work On Your Terms", desc: "Set your own schedule. Work from anywhere. No cold calling — we provide warm leads." },
  { icon: Shield, title: "Vested from Day One", desc: "Your book of business is yours. Full ownership of renewals and residual income immediately." },
];

const VALUE_PROPS = [
  { icon: DollarSign, title: "No Income Ceiling", desc: "Earn what you're worth. Our top agents clear six figures in their first year." },
  { icon: GraduationCap, title: "Full Training Provided", desc: "12-week mentorship, licensing support, and proven systems from day one." },
  { icon: Shield, title: "Day 1 Vesting", desc: "Your book of business is yours immediately. Full ownership of renewals." },
  { icon: FileCheck, title: "No Cost to Join", desc: "Zero startup costs. We invest in you — licensing, training, and technology." },
  { icon: Briefcase, title: "Warm Leads Provided", desc: "No cold calling. We supply qualified leads so you can focus on helping families." },
  { icon: Zap, title: "Work From Anywhere", desc: "Set your schedule, choose your hours. Total flexibility for your lifestyle." },
];

const commissionRows = [
  { product: "Term Life", rate: "80-110%", unit: "FYC" },
  { product: "Whole Life", rate: "90-120%", unit: "FYC" },
  { product: "IUL", rate: "90-115%", unit: "FYC" },
  { product: "Annuities", rate: "5-7%", unit: "of Premium" },
  { product: "Final Expense", rate: "100-130%", unit: "FYC" },
];

const testimonials = [
  { name: "Marcus J.", role: "Former Teacher", location: "Chicago, IL", quote: "I left teaching after 8 years. In my first year with Heritage I earned more than double my old salary. The training made the transition seamless.", income: "$142K", period: "First Year", rating: 5 },
  { name: "Priya S.", role: "Former Nurse", location: "Dallas, TX", quote: "The flexibility is everything. I work around my kids' schedules and still hit top producer every quarter. Heritage gave me my life back.", income: "$98K", period: "Part-Time", rating: 5 },
  { name: "David L.", role: "Career Changer", location: "Phoenix, AZ", quote: "Zero insurance experience. Heritage walked me through licensing, gave me a mentor, and I closed my first policy in week three. Best decision I ever made.", income: "$167K", period: "Second Year", rating: 5 },
];

const steps = [
  { number: "1", title: "Apply Online", description: "Fill out this quick form. We'll review your application and reach out within 24 hours." },
  { number: "2", title: "Get Licensed & Trained", description: "We cover licensing costs and pair you with a mentor for our 12-week training program." },
  { number: "3", title: "Start Earning", description: "Begin helping families while building your own book of business with full ownership from day one." },
];

const faqs = [
  { q: "Do I need an insurance license?", a: "No! We help you get licensed. Heritage covers the cost of pre-licensing courses and exam fees. Most agents are fully licensed within 2-3 weeks." },
  { q: "Is there a cost to join?", a: "There is zero cost to join Heritage. We invest in you — licensing, training, technology, and lead generation are all provided at no charge." },
  { q: "What does the training look like?", a: "Our 12-week mentorship pairs you with a top producer. You'll learn proven sales scripts, product knowledge, and client management systems through hands-on practice." },
  { q: "Can I do this part-time?", a: "Absolutely. Many of our top agents started part-time while keeping their day job. You set your own schedule — mornings, evenings, weekends — whatever works for you." },
  { q: "How quickly can I start earning?", a: "Most agents close their first policy within the first 2-3 weeks of completing training. Commissions are paid within 48 hours of policy issue." },
];

// ─── Animation variants ─────────────────────────────────────────────────────

const faqVariants: import("framer-motion").Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { height: { duration: 0.25, ease: "easeOut" }, opacity: { duration: 0.2, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.2, ease: "easeIn" }, opacity: { duration: 0.1 } } },
};

// ─── Settings type ───────────────────────────────────────────────────────────

interface RecruitingPageSettings {
  headline: string | null;
  subheadline: string | null;
  showTestimonials: boolean;
  showFaq: boolean;
  showCommissionTable: boolean;
  showSteps: boolean;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function RecruitmentPage() {
  const params = useParams<{ agentSlug: string }>();
  const slug = params.agentSlug || "";
  const { name: agentName, firstName: agentFirstName, initials } = parseAgentSlug(slug);

  const formRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [settings, setSettings] = useState<RecruitingPageSettings | null>(null);

  // Fetch settings + track page view on mount
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/recruiting-settings/${slug}`)
      .then(r => r.json())
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: `/recruit/${slug}`, title: `Join ${agentName} - Heritage Life Solutions` }),
    }).catch(() => {});
  }, [slug]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fffaf3" }}>
      {/* Mobile-responsive overrides */}
      <style>{`
        @media (max-width: 640px) {
          .recruit-hero-container { padding: 36px 20px !important; border-radius: 20px !important; }
          .recruit-hero-title { font-size: 32px !important; }
          .recruit-hero-subtitle { font-size: 15px !important; }
          .recruit-hero-cta { padding: 14px 28px !important; font-size: 15px !important; }
          .recruit-section-title { font-size: 28px !important; }
          .recruit-cta-title { font-size: 30px !important; }
          .recruit-section { padding: 56px 16px !important; }
        }
      `}</style>

      {/* ═══ S1: STICKY HEADER ═══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fffaf3",
        borderBottom: "1px solid rgba(232,224,213,0.5)",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", maxWidth: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#292966", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={logoUrl} alt="Heritage" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
          </div>
          <div>
            <span style={{ fontWeight: 700, color: "#292966", fontSize: 14 }}>Heritage Life Solutions</span>
            <span style={{ color: "#9ca3af", fontSize: 12, display: "block", marginTop: -2 }}>x {agentName}</span>
          </div>
        </div>
        <button
          onClick={scrollToForm}
          style={{
            background: "#8b5cf6", color: "white", border: "none",
            padding: "10px 24px", borderRadius: RADIUS.pill, fontWeight: 600, fontSize: 14,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
          }}
        >
          Apply Now
        </button>
      </header>

      {/* ═══ S2: HERO ═══ */}
      <section style={{ background: "#f5f0e8", padding: "48px 16px 56px" }}>
        <div className="recruit-hero-container" style={{
          maxWidth: 1200, margin: "0 auto", background: "#292966", borderRadius: 32,
          padding: "64px 48px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: 260, height: 260, background: "rgba(255,255,255,0.04)", borderRadius: RADIUS.pill, transform: "translate(30%, -40%)" }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr", gap: 40, alignItems: "center" }}
            className="lg:!grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <span style={{
                display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.12)",
                padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 20,
              }}>
                Now Recruiting in All 50 States
              </span>

              <h1 className="recruit-hero-title" style={{ fontSize: 48, fontWeight: 700, color: "white", fontFamily: SERIF, lineHeight: 1.08, marginBottom: 18 }}>
                {settings?.headline || "Build a Six-Figure Career Helping Families"}
              </h1>

              <p className="recruit-hero-subtitle" style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 500, marginBottom: 32 }}>
                {settings?.subheadline || `Join 500+ Heritage agents earning $127K+ in their first year. No experience needed. Full training provided.`}
              </p>

              <button
                onClick={scrollToForm}
                className="group recruit-hero-cta"
                style={{
                  background: "#8b5cf6", color: "white", border: "none",
                  padding: "16px 36px", borderRadius: RADIUS.button, fontWeight: 700, fontSize: 17,
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)", display: "inline-flex", alignItems: "center", gap: 10,
                }}
              >
                Apply Now &mdash; It's Free <ArrowRight size={18} />
              </button>

              {agentName && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
                  <div style={{ display: "flex" }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#facc15" color="#facc15" />)}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Invited by {agentName}</span>
                </div>
              )}
            </div>

            <div className="hidden lg:block" style={{ position: "relative" }}>
              <div style={{
                width: 260, height: 260, borderRadius: RADIUS.pill,
                background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}>
                <div style={{
                  width: 200, height: 200, borderRadius: RADIUS.pill,
                  background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "white", fontSize: 72, fontWeight: 700, fontFamily: SERIF }}>{initials}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ S3: TRUST BAR ═══ */}
      <section style={{ background: "white", padding: "28px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}
          className="!grid-cols-2 sm:!grid-cols-4"
        >
          {[
            { value: "500+", label: "Active Agents", icon: Users },
            { value: "$127K", label: "Avg First Year", icon: DollarSign },
            { value: "40+", label: "A-Rated Carriers", icon: Award },
            { value: "98%", label: "Retention Rate", icon: Shield },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              style={{ padding: "8px 0" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(41,41,102,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <s.icon size={18} color="#292966" />
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, color: "#292966", fontFamily: SERIF }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ S4: BENEFITS GRID ═══ */}
      <section className="recruit-section" style={{ background: "#f5f0e8", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Why Join Heritage
            </span>
            <h2 className="recruit-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Everything You Need to Succeed
            </h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
                style={{
                  background: "white", borderRadius: 20, padding: 28,
                  border: "1px solid #e8e0d5", cursor: "default",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s, transform 0.2s",
                  width: 340, maxWidth: "100%", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(41,41,102,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <b.icon size={24} color="#292966" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#292966", marginBottom: 8 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ S5: WHY HERITAGE ═══ */}
      <section className="recruit-section" style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              The Heritage Advantage
            </span>
            <h2 className="recruit-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Stop Trading Time for a Paycheck
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}
            className="!grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3"
          >
            {VALUE_PROPS.map((vp, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <div style={{
                  minWidth: 48, height: 48, borderRadius: 14,
                  background: "rgba(41,41,102,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <vp.icon size={22} color="#292966" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#292966", marginBottom: 4 }}>{vp.title}</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.55 }}>{vp.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ S6: APPLICATION FORM ═══ */}
      <section ref={formRef} className="recruit-section" style={{ background: "#292966", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div style={{ maxWidth: 620, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.15)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Start Your Career
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", fontFamily: SERIF, lineHeight: 1.15 }}>
              Apply Now &mdash; It's Free
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 8 }}>
              No cost. No obligation. {agentFirstName} will personally guide you through every step.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{
              background: "white", borderRadius: RADIUS.card, padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <RecruitApplicationForm
              agentName={agentName}
              agentSlug={slug}
              embedded={true}
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ S7: TESTIMONIALS ═══ */}
      {(settings?.showTestimonials !== false) && (
      <section className="recruit-section" style={{ background: "#fffaf3", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Agent Success Stories
            </span>
            <h2 className="recruit-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Real Results from Real Agents
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
            className="!grid-cols-1 md:!grid-cols-3"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  background: "#f5f0e8", borderRadius: 20, padding: 28,
                  border: "1px solid #e8e0d5",
                }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#facc15" color="#facc15" />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.65, fontStyle: "italic", marginBottom: 20 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#292966" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.role} &middot; {t.location}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: "#292966",
                    background: "rgba(41,41,102,0.08)", padding: "4px 12px", borderRadius: RADIUS.pill,
                  }}>
                    {t.income} {t.period}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ S8: COMMISSION TABLE ═══ */}
      {(settings?.showCommissionTable !== false) && (
      <section className="recruit-section" style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Compensation
            </span>
            <h2 className="recruit-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15, marginBottom: 8 }}>
              Industry-Leading Commissions
            </h2>
            <p style={{ fontSize: 15, color: "#6b7280" }}>Paid within 48 hours of policy issue. No caps. No chargebacks on clean business.</p>
          </div>

          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #e8e0d5" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
              <thead>
                <tr style={{ background: "#292966" }}>
                  <th style={{ textAlign: "left", padding: "14px 24px", fontWeight: 700, color: "white", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</th>
                  <th style={{ textAlign: "right", padding: "14px 24px", fontWeight: 700, color: "white", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>Commission</th>
                </tr>
              </thead>
              <tbody>
                {commissionRows.map((row, i) => (
                  <tr key={row.product} style={{ background: i % 2 === 0 ? "white" : "#faf9f7", borderBottom: i < commissionRows.length - 1 ? "1px solid #e8e0d5" : undefined }}>
                    <td style={{ padding: "14px 24px", color: "#292966", fontWeight: 500 }}>{row.product}</td>
                    <td style={{ padding: "14px 24px", textAlign: "right", color: "#8b5cf6", fontWeight: 700 }}>{row.rate} {row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {/* ═══ S9: HOW IT WORKS ═══ */}
      {(settings?.showSteps !== false) && (
      <section className="recruit-section" style={{ background: "#f5f0e8", padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              How to Join
            </span>
            <h2 className="recruit-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Start Earning in 3 Simple Steps
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
            className="!grid-cols-1 sm:!grid-cols-3"
          >
            {steps.map((s, i) => (
              <motion.div key={s.number}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: "center", position: "relative" }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: RADIUS.pill,
                  background: "#292966", color: "white", fontSize: 17, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", boxShadow: "0 4px 14px rgba(41,41,102,0.25)",
                }}>
                  {s.number}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block" style={{ position: "absolute", top: 19, left: "calc(50% + 24px)", width: "calc(100% - 48px + 20px)", borderTop: "2px dashed #c4beb4" }} />
                )}
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#292966", marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.55 }}>{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ S10: FAQ ACCORDION ═══ */}
      {(settings?.showFaq !== false) && (
      <section className="recruit-section" style={{ background: "#fffaf3", padding: "80px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Common Questions
            </span>
            <h2 className="recruit-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Everything You Need to Know
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: "white",
                border: "1px solid #e8e0d5", borderRadius: 16, overflow: "hidden",
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", padding: "18px 20px", display: "flex", alignItems: "center",
                    justifyContent: "space-between", border: "none", background: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#292966" }}>{faq.q}</span>
                  <ChevronDown size={18} color="#9ca3af"
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div variants={faqVariants} initial="hidden" animate="visible" exit="exit" style={{ overflow: "hidden" }}>
                      <p style={{ padding: "0 20px 18px", fontSize: 14, color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ S11: FINAL CTA ═══ */}
      <section className="recruit-section" style={{
        background: "#292966", padding: "80px 24px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}
        >
          <h2 className="recruit-cta-title" style={{ fontSize: 40, fontWeight: 700, color: "white", fontFamily: SERIF, lineHeight: 1.1, marginBottom: 16 }}>
            Your Future Starts Here
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginBottom: 32, lineHeight: 1.6 }}>
            Apply now and {agentFirstName} will personally guide you through every step.
          </p>
          <button
            onClick={scrollToForm}
            style={{
              background: "#8b5cf6", color: "white", border: "none",
              padding: "18px 42px", borderRadius: RADIUS.pill, fontWeight: 700, fontSize: 18,
              cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)", display: "inline-flex", alignItems: "center", gap: 10,
            }}
          >
            Start Your Application <ArrowRight size={20} />
          </button>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 14 }}>Free to join. No experience required. No obligation.</p>
        </motion.div>
      </section>

      {/* ═══ S12: FOOTER ═══ */}
      <footer style={{ background: "#fffaf3", borderTop: "1px solid #e8e0d5", padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#292966", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={logoUrl} alt="Heritage" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
            </div>
            <span style={{ fontWeight: 700, color: "#292966", fontSize: 16 }}>Heritage Life Solutions</span>
          </div>

          {agentName && (
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8b5cf6", marginBottom: 16 }}>
              Invited by {agentName}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Privacy Policy", href: "/legal/privacy" },
              { label: "Terms of Use", href: "/legal/terms" },
              { label: "Contact", href: "/contact" },
            ].map(link => (
              <a key={link.label} href={link.href}
                style={{ color: "#6b7280", fontSize: 13, textDecoration: "none" }}
                onMouseOver={e => (e.currentTarget.style.color = "#292966")}
                onMouseOut={e => (e.currentTarget.style.color = "#6b7280")}
              >
                {link.label}
              </a>
            ))}
          </div>

          <p style={{ color: "#9ca3af", fontSize: 11, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 12px" }}>
            Results may vary. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. All trademarks are property of their respective owners. Heritage Life Solutions is an equal opportunity employer.
          </p>

          <p style={{ color: "#9ca3af", fontSize: 11 }}>
            &copy; 2024-2026 Gold Coast Financial Partners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

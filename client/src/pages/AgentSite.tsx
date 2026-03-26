import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Lock, TrendingUp, Heart, DollarSign, CheckCircle,
  ChevronDown, ArrowRight, Phone, Mail, Star, Clock,
  Users, Award, Zap, FileCheck, HandHeart,
  MessageCircle, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { parseAgentSlug } from "@/lib/agentSlugUtils";
import { RADIUS, SHADOW } from "@/lib/heritageDesignSystem";
import { CARRIER_BRANDING } from "@shared/carrierBranding";

// ─── Constants ──────────────────────────────────────────────────────────────

const SERIF = "'Playfair Display', serif";
const logoUrl = "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769280405865-C37E9C6F-C99B-40BE-80BB-6157A4006C2F.jpg?alt=media&token=916e40fc-b30a-423d-993d-9cd9085abc6b";

const PRODUCTS = [
  { id: "term_life", name: "Term Life Insurance", icon: Shield, color: "#3b82f6", desc: "Affordable coverage for a specific period. Ideal for families with mortgages, debts, or income replacement needs." },
  { id: "whole_life", name: "Whole Life Insurance", icon: Lock, color: "#10b981", desc: "Lifetime coverage that builds cash value. A stable foundation for estate planning and legacy protection." },
  { id: "iul", name: "Indexed Universal Life", icon: TrendingUp, color: "#7c3aed", desc: "Flexible coverage with market-linked growth potential. Combine protection with tax-advantaged savings." },
  { id: "final_expense", name: "Final Expense", icon: Heart, color: "#f43f5e", desc: "Simplified coverage for end-of-life costs. No medical exams with affordable premiums for ages 50-85." },
  { id: "annuities", name: "Annuities", icon: DollarSign, color: "#f59e0b", desc: "Guaranteed income for retirement. Protect your savings with competitive, tax-deferred growth." },
];

const VALUE_PROPS = [
  { icon: FileCheck, title: "No Medical Exam Required", desc: "Most of our products require no physical exam — just a few simple health questions.", color: "#3b82f6" },
  { icon: Shield, title: "Coverage Up to $2,000,000", desc: "Flexible coverage options to protect your family's lifestyle, debts, and future goals.", color: "#7c3aed" },
  { icon: Clock, title: "30-Day Free Look Period", desc: "Every policy includes a 30-day review period. Cancel for a full refund if you change your mind.", color: "#10b981" },
  { icon: Users, title: "90%+ Acceptance Rate", desc: "We work with A-rated carriers to find coverage for applicants ages 20-85, averaged across all products.", color: "#f59e0b" },
  { icon: HandHeart, title: "Dedicated Agent Support", desc: "Work directly with a licensed professional who knows you — not a call center.", color: "#f43f5e" },
  { icon: Zap, title: "Fast & Simple Process", desc: "Get a quote in minutes, apply online in 15 minutes, and receive coverage as soon as the same day.", color: "#06b6d4" },
];

const TESTIMONIALS = [
  { name: "Maria R.", location: "Chicago, IL", text: "The process was so easy! I had coverage within days, and my agent walked me through every option. I feel so much more secure knowing my family is protected.", rating: 5 },
  { name: "James T.", location: "Dallas, TX", text: "I was surprised how affordable term life insurance was. My agent found me a plan that fit my budget perfectly. No exam required either!", rating: 5 },
  { name: "Linda K.", location: "Tampa, FL", text: "After my husband passed, Heritage was there every step of the way. The claim process was smooth and compassionate. I can't thank them enough.", rating: 5 },
];

const FAQS = [
  { q: "How much life insurance do I need?", a: "A common rule of thumb is 10-12x your annual income, but the right amount depends on your debts, dependents, and financial goals. Your agent will help you calculate the perfect coverage amount." },
  { q: "Do I need a medical exam?", a: "Most of our products don't require a medical exam. You'll answer a few simple health questions, and many applicants are approved the same day." },
  { q: "How quickly can I get covered?", a: "Many of our products offer same-day or next-day approval. Once approved, your coverage is effective immediately." },
  { q: "What types of coverage do you offer?", a: "We offer Term Life, Whole Life, Indexed Universal Life (IUL), Final Expense, and Annuities — all from A-rated carriers. Your agent will help you find the best fit." },
  { q: "Can I change my coverage later?", a: "Yes! Many policies allow you to increase coverage, add riders, or convert term policies to permanent coverage as your needs change." },
  { q: "What happens if I miss a payment?", a: "Most policies include a 30-day grace period. If you miss a payment, your coverage continues during this period. Contact your agent to set up automatic payments." },
];

const PRODUCT_PILLS = [
  { id: "term_life", label: "Term Life" },
  { id: "whole_life", label: "Whole Life" },
  { id: "iul", label: "IUL" },
  { id: "final_expense", label: "Final Expense" },
  { id: "not_sure", label: "Not Sure Yet" },
];

const faqVariants: import("framer-motion").Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { height: { duration: 0.25, ease: "easeOut" }, opacity: { duration: 0.2, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.2, ease: "easeIn" }, opacity: { duration: 0.1 } } },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AgentSite() {
  const params = useParams<{ agentSlug: string }>();
  const slug = params.agentSlug || "";
  const { name: agentName, firstName: agentFirstName, initials } = parseAgentSlug(slug);

  const quoteFormRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Lead form state
  const [formFirst, setFormFirst] = useState("");
  const [formLast, setFormLast] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formZip, setFormZip] = useState("");
  const [formProduct, setFormProduct] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Schedule form state
  const [schedName, setSchedName] = useState("");
  const [schedEmail, setSchedEmail] = useState("");
  const [schedPhone, setSchedPhone] = useState("");
  const [schedMessage, setSchedMessage] = useState("");
  const [schedProduct, setSchedProduct] = useState("");
  const [isSchedSubmitting, setIsSchedSubmitting] = useState(false);
  const [isSchedSubmitted, setIsSchedSubmitted] = useState(false);

  // Website settings from server
  const [settings, setSettings] = useState<{
    headline: string | null;
    tagline: string | null;
    bio: string | null;
    featuredProducts: string[];
    showTestimonials: boolean;
    showFaq: boolean;
    showCarriers: boolean;
    showScheduleCall: boolean;
  } | null>(null);

  // Fetch settings + track page view on mount
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/website-settings/${slug}`)
      .then(r => r.json())
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
    // Track page view (skip if loaded inside iframe preview)
    if (window.self === window.top) {
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: `/a/${slug}`, title: `${agentName} - Heritage Life Solutions` }),
      }).catch(() => {});
    }
  }, [slug]);

  // Filter products based on settings
  const visibleProducts = settings?.featuredProducts
    ? PRODUCTS.filter(p => settings.featuredProducts.includes(p.id))
    : PRODUCTS;

  const scrollToQuote = () => {
    quoteFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirst || !formLast || !formEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agent-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formFirst, lastName: formLast, email: formEmail,
          phone: formPhone, zipCode: formZip, productInterest: formProduct,
          agentSlug: slug, agentName,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setIsSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedName || !schedEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSchedSubmitting(true);
    try {
      const [first, ...rest] = schedName.trim().split(" ");
      const res = await fetch("/api/agent-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: first, lastName: rest.join(" ") || "—",
          email: schedEmail, phone: schedPhone,
          productInterest: schedProduct, message: schedMessage,
          agentSlug: slug, agentName,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setIsSchedSubmitted(true);
      toast.success("Request submitted! We'll be in touch soon.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSchedSubmitting(false);
    }
  };

  const carrierLogos = Object.values(CARRIER_BRANDING).filter(c => c.logoUrl).slice(0, 12);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: RADIUS.input,
    border: "1px solid #e8e0d5", fontSize: 15, outline: "none",
    transition: "border-color 0.2s",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle, appearance: "none", WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", backgroundSize: "16px",
    paddingRight: 40, cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fffaf3" }}>
      {/* Mobile-responsive overrides */}
      <style>{`
        @media (max-width: 640px) {
          .agent-hero-container { padding: 36px 20px !important; border-radius: 20px !important; }
          .agent-hero-title { font-size: 32px !important; }
          .agent-hero-subtitle { font-size: 15px !important; }
          .agent-hero-cta { padding: 14px 28px !important; font-size: 15px !important; }
          .agent-section-title { font-size: 28px !important; }
          .agent-cta-title { font-size: 30px !important; }
          .agent-section { padding: 56px 16px !important; }
          .agent-form-grid { grid-template-columns: 1fr !important; }
          .agent-product-pills { grid-template-columns: repeat(3, 1fr) !important; }
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
          onClick={scrollToQuote}
          style={{
            background: "#8b5cf6", color: "white", border: "none",
            padding: "10px 24px", borderRadius: RADIUS.pill, fontWeight: 600, fontSize: 14,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
          }}
        >
          Get a Free Quote
        </button>
      </header>

      {/* ═══ S2: HERO ═══ */}
      <section style={{ background: "#f5f0e8", padding: "48px 16px 56px" }}>
        <div className="agent-hero-container" style={{
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
                {settings?.tagline || "Licensed Insurance Professional"}
              </span>

              <h1 className="agent-hero-title" style={{ fontSize: 48, fontWeight: 700, color: "white", fontFamily: SERIF, lineHeight: 1.08, marginBottom: 18 }}>
                {settings?.headline || `Protect your family's future with ${agentName}`}
              </h1>

              <p className="agent-hero-subtitle" style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: 500, marginBottom: 32 }}>
                {settings?.bio || "Get a free, personalized life insurance quote in minutes. No medical exams. No obligations. Just honest guidance from someone who cares."}
              </p>

              <button
                onClick={scrollToQuote}
                className="group agent-hero-cta"
                style={{
                  background: "#8b5cf6", color: "white", border: "none",
                  padding: "16px 36px", borderRadius: RADIUS.button, fontWeight: 700, fontSize: 17,
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)", display: "inline-flex", alignItems: "center", gap: 10,
                }}
              >
                Get My Free Quote <ArrowRight size={18} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
                <div style={{ display: "flex" }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#facc15" color="#facc15" />)}
                </div>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>4.9/5 from 1,000+ families</span>
              </div>
            </div>

            <div className="hidden lg:block" style={{ position: "relative" }}>
              <div style={{
                borderRadius: 24, overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img
                  src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=600&h=450&fit=crop&crop=faces"
                  alt="Happy family"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ S3: TRUST BAR ═══ */}
      <section style={{
        background: "white",
        padding: "28px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}
          className="!grid-cols-2 sm:!grid-cols-4"
        >
          {[
            { value: "4.9/5", label: "Client Rating", icon: Star },
            { value: "1,000+", label: "Families Protected", icon: Users },
            { value: "A+", label: "Rated Carriers", icon: Award },
            { value: "15 min", label: "Average Application", icon: Clock },
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

      {/* ═══ S4: PRODUCTS GRID ═══ */}
      <section className="agent-section" style={{ background: "#f5f0e8", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              What We Offer
            </span>
            <h2 className="agent-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Coverage for Every Stage of Life
            </h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
            {visibleProducts.map((p, i) => (
              <motion.div key={p.id}
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
                  <p.icon size={24} color="#292966" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#292966", marginBottom: 8 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ S5: WHY HERITAGE ═══ */}
      <section className="agent-section" style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Why Heritage
            </span>
            <h2 className="agent-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              The Heritage Difference
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

      {/* ═══ S6: LEAD CAPTURE FORM ═══ */}
      <section ref={quoteFormRef} className="agent-section" style={{ background: "#292966", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        <div style={{ maxWidth: 620, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.15)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Get Your Free Quote
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "white", fontFamily: SERIF, lineHeight: 1.15 }}>
              Find Your Perfect Coverage
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 8 }}>
              No obligations. No pressure. Just honest answers.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{
              background: "white", borderRadius: RADIUS.card, padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {isSubmitted ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: "center", padding: "32px 0" }}
              >
                <div style={{ width: 64, height: 64, borderRadius: RADIUS.pill, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle size={32} color="#10b981" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#292966", fontFamily: SERIF, marginBottom: 8 }}>
                  Thank You!
                </h3>
                <p style={{ color: "#6b7280", fontSize: 15 }}>
                  {agentFirstName} will contact you within 24 hours with your personalized quote.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <div className="agent-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>First Name *</label>
                    <input value={formFirst} onChange={e => setFormFirst(e.target.value)} placeholder="John" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Last Name *</label>
                    <input value={formLast} onChange={e => setFormLast(e.target.value)} placeholder="Smith" required style={inputStyle} />
                  </div>
                </div>

                <div className="agent-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email *</label>
                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="john@example.com" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone</label>
                    <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="(555) 555-5555" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Zip Code</label>
                  <input value={formZip} onChange={e => setFormZip(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))} placeholder="60601" maxLength={5} style={inputStyle} />
                </div>

                <div style={{ marginTop: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>What are you interested in?</label>
                  <div className="agent-product-pills" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {PRODUCT_PILLS.map(pp => {
                      const active = formProduct === pp.id;
                      return (
                        <button key={pp.id} type="button"
                          onClick={() => setFormProduct(active ? "" : pp.id)}
                          style={{
                            padding: "10px 6px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                            border: active ? "2px solid #292966" : "1px solid #e8e0d5",
                            background: active ? "rgba(41,41,102,0.06)" : "#fafaf8",
                            color: active ? "#292966" : "#6b7280",
                            cursor: "pointer", transition: "all 0.15s",
                            textAlign: "center", whiteSpace: "nowrap",
                          }}
                        >
                          {pp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting}
                  style={{
                    width: "100%", marginTop: 24, padding: "16px",
                    background: "#8b5cf6", color: "white", border: "none",
                    borderRadius: RADIUS.button, fontWeight: 700, fontSize: 16,
                    cursor: isSubmitting ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                    opacity: isSubmitting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {isSubmitting ? "Submitting..." : <>Get My Free Quote <ArrowRight size={18} /></>}
                </button>

                <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 12 }}>
                  By submitting, you agree to be contacted by {agentName} regarding your insurance needs.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ S7: TESTIMONIALS ═══ */}
      {(settings?.showTestimonials !== false) && (
      <section className="agent-section" style={{ background: "#fffaf3", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              What Our Clients Say
            </span>
            <h2 className="agent-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Trusted by Families Nationwide
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
            className="!grid-cols-1 md:!grid-cols-3"
          >
            {TESTIMONIALS.map((t, i) => (
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
                  "{t.text}"
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#292966" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ S8: CARRIER PARTNERS ═══ */}
      {(settings?.showCarriers !== false) && (
      <section className="agent-section" style={{ background: "white", padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
            Backed by A-Rated Carriers
          </span>
          <h2 className="agent-section-title" style={{ fontSize: 28, fontWeight: 700, color: "#292966", fontFamily: SERIF, marginBottom: 32 }}>
            We Work With the Best
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, alignItems: "center" }}>
            {carrierLogos.map((c) => (
              <motion.div key={c.id}
                whileHover={{ scale: 1.05 }}
                style={{
                  background: "white", borderRadius: 16, padding: "12px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #e8e0d5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 56, minWidth: 120,
                }}
              >
                <img
                  src={c.logoUrl} alt={c.shortName}
                  style={{ maxHeight: 32, maxWidth: 100, objectFit: "contain", filter: "grayscale(30%)" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-weight:700;font-size:12px;color:#6b7280">${c.shortName}</span>`;
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ S9: FAQ ACCORDION ═══ */}
      {(settings?.showFaq !== false) && (
      <section className="agent-section" style={{ background: "#f5f0e8", padding: "80px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Common Questions
            </span>
            <h2 className="agent-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
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

      {/* ═══ S10: SCHEDULE A CALL ═══ */}
      {(settings?.showScheduleCall !== false) && (
      <section className="agent-section" style={{ background: "#fffaf3", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#292966", background: "rgba(41,41,102,0.08)", padding: "6px 18px", borderRadius: RADIUS.pill, marginBottom: 12 }}>
              Let's Talk
            </span>
            <h2 className="agent-section-title" style={{ fontSize: 36, fontWeight: 700, color: "#292966", fontFamily: SERIF, lineHeight: 1.15 }}>
              Schedule a Call with {agentFirstName}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
            className="!grid-cols-1 md:!grid-cols-2"
          >
            {/* Agent Card */}
            <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8e0d5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: RADIUS.pill,
                  background: "#292966", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 22, fontFamily: SERIF,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#292966" }}>{agentName}</div>
                  <div style={{ fontSize: 13, color: "#292966", fontWeight: 600, opacity: 0.7 }}>Licensed Insurance Professional</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
                  <Mail size={16} color="#292966" />
                  <span>Available by email</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
                  <Phone size={16} color="#292966" />
                  <span>Available by phone</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
                  <CalendarDays size={16} color="#292966" />
                  <span>Flexible scheduling</span>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #e8e0d5" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>What to expect:</div>
                {["Free, no-obligation consultation", "Personalized coverage recommendations", "Clear answers to all your questions"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e8e0d5" }}>
              {isSchedSubmitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 12px", display: "block" }} />
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#292966", fontFamily: SERIF }}>Request Received!</h3>
                  <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>{agentFirstName} will reach out shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name *</label>
                    <input value={schedName} onChange={e => setSchedName(e.target.value)} placeholder="John Smith" required style={inputStyle} />
                  </div>
                  <div className="agent-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email *</label>
                      <input type="email" value={schedEmail} onChange={e => setSchedEmail(e.target.value)} placeholder="john@example.com" required style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone</label>
                      <input type="tel" value={schedPhone} onChange={e => setSchedPhone(e.target.value)} placeholder="(555) 555-5555" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>What are you interested in?</label>
                    <select value={schedProduct} onChange={e => setSchedProduct(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select a product</option>
                      <option value="term_life">Term Life Insurance</option>
                      <option value="whole_life">Whole Life Insurance</option>
                      <option value="iul">Indexed Universal Life</option>
                      <option value="final_expense">Final Expense</option>
                      <option value="annuities">Annuities</option>
                      <option value="not_sure">Not sure yet</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Message</label>
                    <textarea value={schedMessage} onChange={e => setSchedMessage(e.target.value)}
                      placeholder="Tell us about your insurance needs..."
                      rows={3} style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                  <button type="submit" disabled={isSchedSubmitting}
                    style={{
                      width: "100%", padding: "14px",
                      background: "#292966", color: "white", border: "none",
                      borderRadius: RADIUS.button, fontWeight: 700, fontSize: 15,
                      cursor: isSchedSubmitting ? "wait" : "pointer", boxShadow: "0 4px 14px rgba(41,41,102,0.25)",
                      opacity: isSchedSubmitting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {isSchedSubmitting ? "Sending..." : <>Schedule My Call <MessageCircle size={16} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ═══ S11: FINAL CTA ═══ */}
      <section className="agent-section" style={{
        background: "#292966", padding: "80px 24px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}
        >
          <h2 className="agent-cta-title" style={{ fontSize: 40, fontWeight: 700, color: "white", fontFamily: SERIF, lineHeight: 1.1, marginBottom: 16 }}>
            Ready to protect what matters most?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginBottom: 32, lineHeight: 1.6 }}>
            Get a free, no-obligation quote in under 5 minutes. {agentFirstName} is here to help every step of the way.
          </p>
          <button
            onClick={scrollToQuote}
            style={{
              background: "#8b5cf6", color: "white", border: "none",
              padding: "18px 42px", borderRadius: RADIUS.pill, fontWeight: 700, fontSize: 18,
              cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)", display: "inline-flex", alignItems: "center", gap: 10,
            }}
          >
            Get My Free Quote <ArrowRight size={20} />
          </button>
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
            Insurance products are offered through Heritage Life Solutions, a DBA of Gold Coast Financial Partners. All quotes are subject to underwriting approval by the respective carrier. Heritage Life Solutions is not the issuing carrier. Products and their features may not be available in all states.
          </p>

          <p style={{ color: "#9ca3af", fontSize: 11 }}>
            &copy; 2024-2026 Gold Coast Financial Partners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

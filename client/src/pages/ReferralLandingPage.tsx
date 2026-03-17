/**
 * Public Referral Landing Page — /refer/:clientId
 * Heritage Life Solutions — Matches heritagels.org live design
 *
 * Design: bg-primary (#292966 rich purple), violet-500 CTAs, cream/beige backgrounds,
 * Header + Footer components, rounded cards, green checkmarks
 *
 * Governance: Nova (UI) + Axiom (UX) + Lumen (flow) + Sentinel (security) + Helix (compliance)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, ArrowDown, CheckCircle, ChevronDown, Star, Shield, Heart,
  TrendingUp, Users, Home, HelpCircle, Loader2, Check,
  Phone, Mail, Clock, Quote, Leaf,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ═══════════════════════════════════════════════
// ANIMATION VARIANTS (matches Home.tsx / About.tsx)
// ═══════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ═══════════════════════════════════════════════
// COUNT-UP HOOK
// ═══════════════════════════════════════════════

function useCountUp(target: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOut(progress) * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { ref, display: `${count}${suffix}` };
}

// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════

const coverageOptions = [
  { icon: Shield, title: "Term Life", desc: "Affordable protection for a specific period. Perfect for mortgages, income replacement, and growing families." },
  { icon: Heart, title: "Whole Life", desc: "Lifetime coverage that builds cash value. A foundation for your family's financial security." },
  { icon: TrendingUp, title: "IUL", desc: "Growth potential with downside protection. Flexible premiums and tax-advantaged retirement income." },
  { icon: Users, title: "Final Expense", desc: "Guaranteed acceptance coverage to protect loved ones from end-of-life costs." },
  { icon: Home, title: "Mortgage Protection", desc: "Keep your family in their home if something unexpected happens." },
  { icon: HelpCircle, title: "Not Sure", desc: "That's okay — your advisor will help you find exactly the right fit. No pressure, just clarity." },
] as const;

const testimonials = [
  { quote: "The team at Heritage made the process so easy. I had coverage within a week and I'm paying less than my streaming subscriptions. I wish I'd done this years ago — my family finally has peace of mind.", name: "Maria G.", location: "Dallas, TX" },
  { quote: "I'd been putting this off for years because I thought it would be complicated. Heritage took all the stress out of it. My family is finally protected and I sleep better at night knowing they're covered.", name: "James W.", location: "Chicago, IL" },
  { quote: "No medical exam needed! I got approved in 48 hours and the whole application took maybe five minutes. Honestly wish I'd done this years ago — the process was that simple.", name: "Priya S.", location: "Orlando, FL" },
] as const;

const coverageSelectOptions = [
  { value: "", label: "What are you most interested in?" },
  { value: "Term Life", label: "Term Life Insurance" },
  { value: "Whole Life", label: "Whole Life Insurance" },
  { value: "IUL", label: "IUL (Indexed Universal Life)" },
  { value: "Final Expense", label: "Final Expense" },
  { value: "Mortgage Protection", label: "Mortgage Protection" },
  { value: "Annuity", label: "Annuity" },
  { value: "Not Sure", label: "I'm not sure yet — help me decide" },
] as const;

const relationshipOptions = [
  { value: "", label: "Select relationship" },
  { value: "Family", label: "Family" },
  { value: "Friend", label: "Friend" },
  { value: "Coworker", label: "Coworker" },
  { value: "Neighbor", label: "Neighbor" },
  { value: "Other", label: "Other" },
] as const;

// ═══════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════

function StatCard({ target, suffix, label, icon: Icon, index }: {
  target: number; suffix: string; label: string; icon: typeof Clock; index: number;
}) {
  const counter = useCountUp(target, 1800, suffix);
  return (
    <motion.div
      ref={counter.ref}
      variants={fadeInUp}
      className="text-center"
    >
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
        {counter.display}
      </p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function ReferralLandingPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [referrerFirstName, setReferrerFirstName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentAvatarUrl, setAgentAvatarUrl] = useState<string | null>(null);
  const [referralMessage, setReferralMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverageType, setCoverageType] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for scroll-aware floating CTA
  const formRef = useRef<HTMLDivElement>(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Show/hide floating CTA based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const formEl = formRef.current;
      if (!formEl) {
        setShowFloatingCTA(y > 600);
        return;
      }
      const formTop = formEl.getBoundingClientRect().top;
      setShowFloatingCTA(y > 600 && formTop > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch referrer (Sentinel: use generic fallbacks, no test data leakage)
  useEffect(() => {
    if (!clientId) {
      setReferrerFirstName("Your friend");
      setAgentName("a Heritage advisor");
      setLoading(false);
      return;
    }
    fetch(`/api/referrals/referrer/${clientId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        setReferrerFirstName(d.referrerFirstName || "Your friend");
        setAgentName(d.agentName || "a Heritage advisor");
        setAgentAvatarUrl(d.agentAvatarUrl || null);
        setReferralMessage(d.referralMessage || null);
      })
      .catch(() => {
        setReferrerFirstName("Your friend");
        setAgentName("a Heritage advisor");
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "A valid email is required";
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) e.phone = "A valid 10-digit phone number is required";
    if (!coverageType) e.coverageType = "Please select a coverage type";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/referrals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ clientId, firstName, lastName, email, phone, coverageType, relationship, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "Something went wrong. Please try again." });
        return;
      }
      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("referral-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const selectCoverage = (title: string) => {
    setCoverageType(title);
    clearError("coverageType");
    scrollToForm();
  };

  const clearError = (field: string) => setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  // Phone input handler (Sentinel: strip non-digits, cap at 10)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) setPhone(digits);
    else if (digits.length <= 6) setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
    else setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
  };

  // ───────── LOADING ─────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf3] flex flex-col items-center justify-center">
        <div className="p-3 rounded-md bg-primary mb-4">
          <Leaf className="w-8 h-8 text-violet-500 animate-pulse" />
        </div>
        <p className="text-sm text-gray-500">Loading your invitation...</p>
      </div>
    );
  }

  // ───────── THANK YOU ─────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fffaf3]">
        <Header />
        <div className="py-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg w-full mx-4 text-center"
          >
            <div className="bg-white rounded-2xl p-12 border border-[#e8e0d5] shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                You're in, {firstName}!
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                {agentName} — {referrerFirstName}'s advisor — will personally reach out within 24 hours to set up your free consultation.
              </p>
              <p className="text-gray-500 mb-8">
                {referrerFirstName} will be glad to know you took this step. In the meantime:
              </p>

              <a
                href="/products"
                className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-8 py-3.5 rounded-xl font-semibold text-lg shadow-lg shadow-violet-500/30 transition-all"
              >
                Explore coverage options <ArrowRight size={18} />
              </a>

              <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{referrerFirstName.charAt(0).toUpperCase()}</span>
                </div>
                Invited by {referrerFirstName}
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // MAIN PAGE
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      {/* ═══════════ HERO — Personal Invitation ═══════════ */}
      <section className="bg-[#f5f0e8] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-primary rounded-3xl overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {/* Left Content */}
              <div className="p-6 md:p-8 lg:px-16 lg:py-20">
                {/* Personal invitation badge with referrer initial */}
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {referrerFirstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Heart size={14} className="text-pink-400" fill="currentColor" />
                    <span className="text-white/90 text-sm font-medium">
                      A personal invitation from {referrerFirstName}
                    </span>
                  </div>
                </div>

                {/* Headline — deeply personal */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
                  {referrerFirstName} wants your family{" "}
                  <span className="text-violet-400">protected.</span>
                </h1>

                {/* Subtext — personal connection */}
                <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-10 leading-relaxed text-pretty">
                  Someone who cares about you shared their trusted advisor, {agentName}, with you.
                  This is a free, personal invitation — no strings attached.
                </p>

                {/* Checkmarks */}
                <div className="flex flex-col gap-2 mb-6 md:mb-10">
                  {[
                    `Hand-picked by ${referrerFirstName} — not a random ad`,
                    "No medical exams required for most plans",
                    "Approved in as little as 24–48 hours",
                    "100% free — no cost, no obligation, ever",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-white">
                      <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-sm md:text-base">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={scrollToForm}
                    className="bg-violet-500 hover:bg-violet-400 text-white px-8 py-3.5 md:py-4 rounded-xl font-semibold text-lg text-center shadow-lg shadow-violet-500/30 transition-all cursor-pointer"
                  >
                    Accept {referrerFirstName}'s invitation
                  </button>
                  <button
                    onClick={() => document.getElementById("coverage-options")?.scrollIntoView({ behavior: "smooth" })}
                    className="border-2 border-white/80 hover:bg-white/10 text-white px-8 py-3.5 md:py-4 rounded-xl font-semibold text-lg text-center transition-all cursor-pointer"
                  >
                    Learn more first
                  </button>
                </div>
              </div>

              {/* Right Image — desktop */}
              <div className="relative hidden lg:block">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769118677833-cozy-family-moment-stockcake.webp?alt=media&token=0ab78a73-d3ed-44d3-ad5c-1f80e78695a3"
                  alt="Family moment together"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Mobile Image */}
              <div className="lg:hidden px-4 pb-4">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/images%2F1769118677833-cozy-family-moment-stockcake.webp?alt=media&token=0ab78a73-d3ed-44d3-ad5c-1f80e78695a3"
                  alt="Family moment together"
                  className="w-full h-48 sm:h-64 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PERSONAL NOTE FROM REFERRER ═══════════ */}
      <section className="py-10 md:py-14 bg-[#fffaf3]">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative bg-white rounded-2xl border border-[#e8e0d5] p-6 md:p-10 shadow-sm"
          >
            {/* Decorative quote mark */}
            <div className="absolute -top-4 left-8 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
              <Quote className="w-4 h-4 text-white" />
            </div>

            <div className="flex items-start gap-4 md:gap-6">
              {/* Referrer avatar */}
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {referrerFirstName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed italic mb-4">
                  "{referralMessage
                    ? referralMessage
                    : `I'm sharing this with you because I care about you and your family. Working with ${agentName} gave me real peace of mind — and I want the same for you. No pressure, just a conversation.`
                  }"
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">— {referrerFirstName}</span>
                  <span className="text-sm text-gray-400">Heritage Life Solutions client</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ WHY {REFERRER} TRUSTS HERITAGE ═══════════ */}
      <section className="py-12 md:py-16 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-violet-500 font-semibold mb-3 tracking-wide uppercase text-sm">Why {referrerFirstName} chose Heritage</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">
              The same team {referrerFirstName} trusts is ready to help you
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <StatCard target={1000} suffix="+" label="Families Protected" icon={Users} index={0} />
            <StatCard target={40} suffix="+" label="A-Rated Carriers" icon={Shield} index={1} />
            <StatCard target={98} suffix="%" label="Client Satisfaction" icon={Heart} index={2} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ COVERAGE OPTIONS (clickable → pre-fill form) ═══════════ */}
      <section id="coverage-options" className="py-12 md:py-20 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-violet-500 font-semibold mb-4 tracking-wide uppercase text-sm">Find Your Coverage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              What kind of protection are you looking for?
            </h2>
            <p className="text-lg text-gray-600 text-pretty">
              Pick the one that fits — or choose "Not Sure" and {agentName} will help you figure it out.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {coverageOptions.map((opt) => {
              const isSelected = coverageType === opt.title;
              return (
                <motion.div
                  key={opt.title}
                  variants={fadeInUp}
                  onClick={() => selectCoverage(opt.title)}
                  className={`bg-white rounded-2xl p-6 border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                    isSelected ? "border-violet-500 shadow-lg shadow-violet-500/10" : "border-[#e8e0d5]"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? "bg-violet-500 text-white" : "bg-primary/10"
                  }`}>
                    <opt.icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-primary"}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {opt.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {opt.title === "Not Sure" ? `That's okay — ${agentName} will help you find exactly the right fit. No pressure, just clarity.` : opt.desc}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 mt-3"
                    >
                      <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-violet-500">Selected</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-12 md:py-20 bg-[#fffaf3]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-violet-500 font-semibold mb-4 tracking-wide uppercase text-sm">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              {referrerFirstName} did this too — here's how easy it is
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              { num: "1", title: "Accept the invitation", desc: `Fill out the quick form below — ${referrerFirstName} already told ${agentName} about you, so it takes less than 60 seconds.` },
              { num: "2", title: `Meet ${agentName}`, desc: `${agentName} — the same advisor ${referrerFirstName} works with — will reach out within 24 hours for a friendly, no-pressure chat.` },
              { num: "3", title: "Get covered", desc: `Choose the plan that fits your family and budget. ${referrerFirstName} will be glad to know you're protected too.` },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 md:p-8 border border-[#e8e0d5] text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-12 md:py-20 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <p className="text-violet-500 font-semibold mb-4 tracking-wide uppercase text-sm">From People Like You</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Others were referred too — here's what they say
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 border border-[#e8e0d5] hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <Quote className="w-6 h-6 text-primary/20 mb-2" />

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  "{t.quote}"
                </p>

                <div className="border-t border-[#e8e0d5] pt-4">
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Helix: Testimonial disclosure */}
          <p className="text-xs text-center mt-6 text-gray-400">
            Testimonials reflect individual experiences and are not guarantees of similar results.
          </p>
        </div>
      </section>

      {/* ═══════════ REFERRAL FORM ═══════════ */}
      <section id="referral-form" ref={formRef} className="py-12 md:py-20 bg-[#fffaf3]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
            {/* Left: Personalized context */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="text-violet-500 font-semibold mb-4 tracking-wide uppercase text-sm">Accept {referrerFirstName}'s Invitation</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-balance">
                {referrerFirstName} shared something personal with you.
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed text-pretty">
                They trust {agentName} with their family's protection — and they want you to have that same peace of mind. Fill out this quick form and {agentName} will personally reach out within 24 hours.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  `Same advisor ${referrerFirstName} works with — not a random call center`,
                  "100% free — no cost, no obligation, ever",
                  "Compare rates from 40+ top-rated carriers",
                  "Personalized advice tailored to your family",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Agent trust badge — personal */}
              <div className="flex items-center gap-4 bg-[#f5f0e8] rounded-xl p-4">
                {agentAvatarUrl ? (
                  <img
                    src={agentAvatarUrl}
                    alt={agentName}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {agentName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{agentName}</p>
                  <p className="text-xs text-gray-500">{referrerFirstName}'s advisor at Heritage Life Solutions</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Form card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-lg overflow-hidden">
                <div className="bg-primary px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Connect with {agentName}</h3>
                  <p className="text-white/70 text-sm">Referred by {referrerFirstName} · Takes less than 60 seconds</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ref-firstName" className="text-sm font-semibold text-gray-700 mb-1 block">First name *</label>
                      <input
                        id="ref-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                        placeholder="First name"
                        aria-label="First name"
                        aria-describedby={errors.firstName ? "err-firstName" : undefined}
                        aria-invalid={!!errors.firstName}
                        className={`w-full h-12 rounded-xl border px-4 text-base outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                          errors.firstName ? "border-red-400" : "border-[#e8e0d5]"
                        }`}
                      />
                      {errors.firstName && <p id="err-firstName" role="alert" className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="ref-lastName" className="text-sm font-semibold text-gray-700 mb-1 block">Last name *</label>
                      <input
                        id="ref-lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }}
                        placeholder="Last name"
                        aria-label="Last name"
                        aria-describedby={errors.lastName ? "err-lastName" : undefined}
                        aria-invalid={!!errors.lastName}
                        className={`w-full h-12 rounded-xl border px-4 text-base outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                          errors.lastName ? "border-red-400" : "border-[#e8e0d5]"
                        }`}
                      />
                      {errors.lastName && <p id="err-lastName" role="alert" className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="ref-email" className="text-sm font-semibold text-gray-700 mb-1 block">Email *</label>
                    <input
                      id="ref-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                      placeholder="you@example.com"
                      aria-label="Email address"
                      aria-describedby={errors.email ? "err-email" : undefined}
                      aria-invalid={!!errors.email}
                      className={`w-full h-12 rounded-xl border px-4 text-base outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                        errors.email ? "border-red-400" : "border-[#e8e0d5]"
                      }`}
                    />
                    {errors.email && <p id="err-email" role="alert" className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="ref-phone" className="text-sm font-semibold text-gray-700 mb-1 block">
                      Phone *
                    </label>
                    <input
                      id="ref-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => { handlePhoneChange(e); clearError("phone"); }}
                      placeholder="(555) 123-4567"
                      aria-label="Phone number"
                      aria-describedby={errors.phone ? "err-phone" : undefined}
                      aria-invalid={!!errors.phone}
                      className={`w-full h-12 rounded-xl border px-4 text-base outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                        errors.phone ? "border-red-400" : "border-[#e8e0d5]"
                      }`}
                    />
                    {errors.phone && <p id="err-phone" role="alert" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      By submitting, you consent to contact via phone and SMS at the number provided.
                    </p>
                  </div>

                  {/* Coverage Type */}
                  <div>
                    <label htmlFor="ref-coverage" className="text-sm font-semibold text-gray-700 mb-1 block">Coverage type *</label>
                    <div className="relative">
                      <select
                        id="ref-coverage"
                        value={coverageType}
                        onChange={(e) => { setCoverageType(e.target.value); clearError("coverageType"); }}
                        aria-label="Coverage type"
                        aria-describedby={errors.coverageType ? "err-coverageType" : undefined}
                        aria-invalid={!!errors.coverageType}
                        className={`w-full h-12 rounded-xl border px-4 pr-10 text-base outline-none appearance-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                          errors.coverageType ? "border-red-400" : "border-[#e8e0d5]"
                        } ${coverageType ? "text-gray-900" : "text-gray-400"}`}
                      >
                        {coverageSelectOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.coverageType && <p id="err-coverageType" role="alert" className="text-xs text-red-500 mt-1">{errors.coverageType}</p>}
                  </div>

                  {/* Relationship */}
                  <div>
                    <label htmlFor="ref-relationship" className="text-sm font-semibold text-gray-700 mb-1 block">
                      Relationship to {referrerFirstName} <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="ref-relationship"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        aria-label={`Relationship to ${referrerFirstName}`}
                        className={`w-full h-12 rounded-xl border border-[#e8e0d5] px-4 pr-10 text-base outline-none appearance-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 ${
                          relationship ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {relationshipOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="ref-message" className="text-sm font-semibold text-gray-700 mb-1 block">
                      Message <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      id="ref-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1000}
                      placeholder="Anything you'd like us to know..."
                      aria-label="Message"
                      rows={3}
                      className="w-full rounded-xl border border-[#e8e0d5] px-4 py-3 text-base outline-none resize-y min-h-[80px] transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                    {message.length > 0 && (
                      <p className={`text-xs text-right mt-1 ${message.length > 900 ? "text-red-500" : "text-gray-400"}`}>
                        {message.length}/1,000
                      </p>
                    )}
                  </div>

                  {/* Form-level error */}
                  {errors.form && (
                    <p role="alert" className="text-sm text-center p-3 rounded-lg bg-red-50 text-red-600">
                      {errors.form}
                    </p>
                  )}

                  {/* Submit button — violet-500, matches site CTAs */}
                  <button
                    type="submit"
                    disabled={submitting || submitted}
                    className="w-full bg-violet-500 hover:bg-violet-400 disabled:bg-violet-300 text-white h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : (
                      <>Accept {referrerFirstName}'s invitation <ArrowRight size={18} /></>
                    )}
                  </button>

                  {/* Helix: Privacy + TCPA disclosure */}
                  <p className="text-xs text-center text-gray-400 leading-relaxed">
                    By submitting, you agree to be contacted by {agentName}, a licensed Heritage Life Solutions advisor.
                    Your information will only be shared with our insurance carrier partners for underwriting purposes and will not be sold.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Compliance footer text */}
          <div className="text-center mt-12 space-y-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              &copy; {new Date().getFullYear()} Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners.
              We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              *Based on client satisfaction survey data. Premiums vary based on health, age, and coverage amount.
            </p>
            <p className="text-xs text-gray-300">
              Referred by {referrerFirstName}
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* ═══════════ FLOATING CTA ═══════════ */}
      <AnimatePresence>
        {showFloatingCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
          >
            <button
              onClick={scrollToForm}
              className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-violet-500/30 transition-all cursor-pointer"
            >
              Accept invitation <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ClientHelp — Help & Support Page
 * Heritage Design System — Violet-to-amber theme
 *
 * FAQ accordion, contact support, emergency info, and advisor card.
 *
 * Governance: Nova (UI) + Lumen (user flow) + Axiom (UX simplicity)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { CLIENT_GRADIENT_CSS, glassCard } from './clientConstants';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  HelpCircle, Search, ChevronDown, MessageSquare, Phone, Mail,
  Shield, FileText, CreditCard, Users, Clock, AlertTriangle,
  BookOpen, ExternalLink, Send, Loader2, CheckCircle,
} from 'lucide-react';

// ─── FAQ DATA ───
interface FAQ {
  question: string;
  answer: string;
  category: string;
  icon: typeof Shield;
}

const FAQS: FAQ[] = [
  {
    category: 'Policies',
    icon: Shield,
    question: 'How do I view my policy details?',
    answer: 'Navigate to "My Policies" from the sidebar or dashboard. Click on any policy card to see full details including coverage amount, premium schedule, beneficiaries, and policy documents.',
  },
  {
    category: 'Policies',
    icon: Shield,
    question: 'What should I do if my policy is about to lapse?',
    answer: 'If a payment is missed, your policy enters a grace period (typically 30 days). Contact your advisor immediately to arrange payment and prevent a lapse. You can also set up automatic payments under Billing to avoid this.',
  },
  {
    category: 'Policies',
    icon: Shield,
    question: 'How do I update my beneficiaries?',
    answer: 'Go to "Beneficiaries" from the sidebar. You can view, add, or request changes to your beneficiary designations. Changes require a signed form which your advisor will help you complete.',
  },
  {
    category: 'Billing',
    icon: CreditCard,
    question: 'How do I set up automatic payments?',
    answer: 'Visit the "Billing" page and look for the payment method section. You can set up ACH direct debit from your bank account for automatic monthly premium payments.',
  },
  {
    category: 'Billing',
    icon: CreditCard,
    question: 'Where can I find my payment history?',
    answer: 'Your complete payment history is available under "Billing". You can view all past transactions, download receipts, and see upcoming payment dates.',
  },
  {
    category: 'Billing',
    icon: CreditCard,
    question: 'What happens if a payment fails?',
    answer: 'If a payment fails, you\'ll receive an email and SMS notification. Your policy has a grace period during which you can make the payment without any lapse. Contact your advisor or update your payment method under Billing.',
  },
  {
    category: 'Claims',
    icon: FileText,
    question: 'How do I file a claim?',
    answer: 'Go to "Claims" from the sidebar and click "File a Claim". You\'ll need your policy number, the type of claim, and supporting documentation. Your advisor will guide you through the entire process.',
  },
  {
    category: 'Claims',
    icon: FileText,
    question: 'How long does claim processing take?',
    answer: 'Most claims are processed within 30-45 business days after all required documentation is received. Living benefit claims may be expedited. You can track the status of your claim in real-time on the Claims page.',
  },
  {
    category: 'Account',
    icon: Users,
    question: 'How do I update my contact information?',
    answer: 'Go to "Profile & Settings" from the sidebar. Click "Edit" to update your name, email, or phone number. Changes sync across your entire account immediately.',
  },
  {
    category: 'Account',
    icon: Users,
    question: 'How do I enable two-factor authentication?',
    answer: 'Visit "Profile & Settings" and scroll to the Security section. Toggle on Two-Factor Authentication and follow the setup instructions to link your authenticator app.',
  },
  {
    category: 'Referrals',
    icon: Users,
    question: 'How does the referral program work?',
    answer: 'Share your unique referral link with friends and family. When they connect with a Heritage advisor, you earn 100 points per referral. Points can be redeemed for rewards. Visit "Refer a Friend" to get started.',
  },
];

const FAQ_CATEGORIES = ['All', 'Policies', 'Billing', 'Claims', 'Account', 'Referrals'];

// ─── QUICK LINKS ───
const QUICK_LINKS = [
  { icon: Shield, label: 'My Policies', href: '/client/policies', color: 'text-violet-600', bg: 'bg-violet-100' },
  { icon: CreditCard, label: 'Billing', href: '/client/billing', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { icon: FileText, label: 'Documents', href: '/client/documents', color: 'text-blue-600', bg: 'bg-blue-100' },
  { icon: Users, label: 'Beneficiaries', href: '/client/beneficiaries', color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function ClientHelp() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Contact form
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  // Filter FAQs
  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }
    setContactSending(true);
    // Simulate sending — in production this would hit an API
    await new Promise((r) => setTimeout(r, 1000));
    setContactSending(false);
    setContactSent(true);
    setContactSubject('');
    setContactMessage('');
    toast.success('Support request submitted. Your advisor will respond shortly.');
    setTimeout(() => setContactSent(false), 5000);
  };

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─── */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden"
          style={{
            background: CLIENT_GRADIENT_CSS,
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero,
            padding: GRID.spacing.lg,
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm pointer-events-none" style={{ width: 356, height: 356, borderRadius: RADIUS.pill }} />
          <div className="absolute top-1/2 right-1/4 bg-amber-400/15 blur-sm pointer-events-none" style={{ width: 136, height: 136, borderRadius: RADIUS.pill }} />

          <div className="relative z-10 flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: GRID.spacing.xxxxl,
                height: GRID.spacing.xxxxl,
                borderRadius: RADIUS.card,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <HelpCircle className="text-amber-200 drop-shadow-sm" style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} aria-hidden="true" />
            </motion.div>

            <div className="flex-1">
              <h1 className="font-bold tracking-tight text-white font-serif" style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}>
                Help & Support
              </h1>
              <p className="text-white/90 max-w-xl" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                Find answers, get help, or contact your advisor
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── QUICK LINKS ─── */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: GRID.spacing.sm }}>
          {QUICK_LINKS.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card className="border-0 overflow-hidden h-full cursor-pointer" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="flex flex-col items-center text-center" style={{ padding: GRID.spacing.md }}>
                  <div className={cn('flex items-center justify-center mb-2', link.bg)} style={{ width: 44, height: 44, borderRadius: RADIUS.pill }}>
                    <link.icon className={link.color} size={22} />
                  </div>
                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{link.label}</p>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </motion.div>

        {/* ─── FAQ SECTION ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                <div className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <BookOpen className="text-amber-200" size={20} />
                </div>
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full bg-white border border-gray-200 text-gray-900 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                />
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                      activeCategory === cat
                        ? 'bg-violet-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100',
                    )}
                    style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {filteredFaqs.map((faq, i) => {
                  const isExpanded = expandedFaq === i;
                  return (
                    <div
                      key={i}
                      className={cn('border transition-colors', isExpanded ? 'border-violet-200 bg-violet-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/50')}
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : i)}
                        className="w-full flex items-center gap-3 text-left p-4"
                      >
                        <div className={cn('flex items-center justify-center flex-shrink-0', isExpanded ? 'bg-violet-100' : 'bg-gray-100')} style={{ width: 32, height: 32, borderRadius: RADIUS.input }}>
                          <faq.icon className={isExpanded ? 'text-violet-600' : 'text-gray-500'} size={16} />
                        </div>
                        <span className={cn('flex-1 font-medium', isExpanded ? 'text-violet-900' : 'text-gray-800')} style={{ fontSize: TYPE.meta }}>
                          {faq.question}
                        </span>
                        <ChevronDown
                          size={18}
                          className={cn('text-gray-400 transition-transform flex-shrink-0', isExpanded && 'rotate-180 text-violet-500')}
                        />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 pl-[60px] text-gray-600 leading-relaxed" style={{ fontSize: TYPE.caption }}>
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>No matching questions</p>
                    <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Try a different search or browse all categories</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── CONTACT SUPPORT + EMERGENCY ─── */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]" style={{ gap: GRID.spacing.sm }}>
          {/* Contact Form */}
          <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                <div className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <MessageSquare className="text-amber-200" size={20} />
                </div>
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {contactSent ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center bg-emerald-100 mx-auto mb-3" style={{ width: 56, height: 56, borderRadius: RADIUS.pill }}>
                    <CheckCircle className="text-emerald-600" size={28} />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1" style={{ fontSize: TYPE.body }}>Request Submitted</p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Your advisor will respond within 1 business day.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: TYPE.meta }}>Subject</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="What do you need help with?"
                      className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: TYPE.meta }}>Message</label>
                    <Textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Describe your question or issue in detail..."
                      rows={5}
                      className="resize-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={contactSending || !contactSubject.trim() || !contactMessage.trim()}
                    className="font-semibold text-white hover:opacity-90 gap-2"
                    style={{
                      borderRadius: RADIUS.button,
                      background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #7c3aed 100%)',
                    }}
                  >
                    {contactSending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Submit Request</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Emergency + Quick Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
            {/* Emergency Info */}
            <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.md }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex items-center justify-center bg-red-100 flex-shrink-0" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>Need Urgent Help?</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>For time-sensitive policy or claim issues</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  <a href="tel:+18005551234" className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors" style={{ borderRadius: RADIUS.button, backgroundColor: '#f9fafb' }}>
                    <Phone size={16} className="text-violet-600" />
                    <div>
                      <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>Call Support</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>Mon-Fri, 8am-6pm CST</p>
                    </div>
                  </a>
                  <a href="mailto:support@heritagels.org" className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors" style={{ borderRadius: RADIUS.button, backgroundColor: '#f9fafb' }}>
                    <Mail size={16} className="text-violet-600" />
                    <div>
                      <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>Email Support</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.micro }}>support@heritagels.org</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.md }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center bg-amber-100 flex-shrink-0" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                    <Clock className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>Office Hours</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Heritage Life Solutions</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {[
                    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM CST' },
                    { day: 'Saturday', hours: '9:00 AM - 1:00 PM CST' },
                    { day: 'Sunday', hours: 'Closed' },
                  ].map((schedule) => (
                    <div key={schedule.day} className="flex items-center justify-between p-2">
                      <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>{schedule.day}</span>
                      <span className={cn('font-medium', schedule.hours === 'Closed' ? 'text-gray-400' : 'text-gray-900')} style={{ fontSize: TYPE.caption }}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ─── HELPFUL RESOURCES ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                <div className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <BookOpen className="text-amber-200" size={20} />
                </div>
                Understanding Your Coverage
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                {[
                  { title: 'Term Life Insurance', desc: 'Coverage for a specific period — affordable protection when you need it most.', icon: Shield, color: 'text-violet-600', bg: 'bg-violet-100' },
                  { title: 'Whole Life Insurance', desc: 'Permanent coverage with cash value growth — protection that lasts a lifetime.', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                  { title: 'IUL (Indexed Universal Life)', desc: 'Flexible premiums with market-linked growth potential and downside protection.', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100' },
                  { title: 'Final Expense', desc: 'Affordable whole life coverage designed to cover end-of-life costs and expenses.', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100' },
                  { title: 'Living Benefits', desc: 'Access a portion of your death benefit if diagnosed with a qualifying condition.', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-100' },
                  { title: 'Annuities', desc: 'Guaranteed income for retirement — protect your savings and plan for the future.', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((resource) => (
                  <motion.div
                    key={resource.title}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                    className="p-4 border border-gray-100 hover:border-violet-200 transition-colors"
                    style={{ borderRadius: RADIUS.button, backgroundColor: '#fafafa' }}
                  >
                    <div className={cn('flex items-center justify-center mb-3', resource.bg)} style={{ width: 36, height: 36, borderRadius: RADIUS.input }}>
                      <resource.icon className={resource.color} size={18} />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1" style={{ fontSize: TYPE.meta }}>{resource.title}</p>
                    <p className="text-gray-500 leading-relaxed" style={{ fontSize: TYPE.caption }}>{resource.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}

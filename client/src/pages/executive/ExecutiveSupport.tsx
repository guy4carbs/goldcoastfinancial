/**
 * Executive Support — Help Resources, FAQ, Contact, System Status, Shortcuts
 * Heritage Design System — Orange/Amber theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from './executiveConstants';
import { toast } from 'sonner';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  Mail,
  Phone,
  CheckCircle,
  Keyboard,
} from 'lucide-react';

// ─── SECTION HEADER ─────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: RADIUS.input,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: '#ea580c' }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ─── QUICK START STEPS ──────────────────────────
const QUICK_START_STEPS = [
  { num: 1, title: 'Navigate Your Dashboard', description: 'Use the sidebar or Cmd+K to quickly access any page' },
  { num: 2, title: 'Review Team Performance', description: 'Monitor team KPIs and individual agent metrics' },
  { num: 3, title: 'Track Commissions', description: 'View override structure, payouts, and earning history' },
  { num: 4, title: 'Generate Reports', description: 'Create custom reports for board meetings and investors' },
  { num: 5, title: 'Manage Your Agency', description: 'Oversee licensing, compliance, and carrier contracts' },
];

// ─── FAQ DATA ───────────────────────────────────
const FAQ_ITEMS = [
  {
    question: 'How are override commissions calculated?',
    answer: 'Overrides follow a waterfall structure. Each level earns the spread between their contract level and the level directly below them.',
  },
  {
    question: 'How do I export data?',
    answer: 'Use the Export button available on most pages, or visit Custom Reports to generate formatted exports.',
  },
  {
    question: 'Can I customize my dashboard?',
    answer: 'Yes, visit Settings > Dashboard Widgets to toggle which widgets appear on your dashboard.',
  },
  {
    question: 'How do I add new team members?',
    answer: 'Navigate to Recruiting Dashboard to manage the hiring pipeline, or Agent Management for existing agent administration.',
  },
  {
    question: 'What do the team status indicators mean?',
    answer: 'On Track (green) = meeting targets, At Risk (amber) = within 10% of target, Behind (red) = more than 10% below target.',
  },
];

// ─── SYSTEM STATUS ──────────────────────────────
const SYSTEM_SERVICES = [
  { name: 'API', status: 'Operational' },
  { name: 'Database', status: 'Operational' },
  { name: 'Auth Service', status: 'Operational' },
  { name: 'File Storage', status: 'Operational' },
];

// ─── KEYBOARD SHORTCUTS ─────────────────────────
const SHORTCUTS = [
  { keys: ['Cmd', 'K'], description: 'Command Palette' },
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
  { keys: ['G', 'K'], description: 'Key Metrics' },
  { keys: ['G', 'R'], description: 'Revenue' },
  { keys: ['G', 'S'], description: 'Sales' },
  { keys: ['G', 'T'], description: 'Team Performance' },
  { keys: ['E', 'R'], description: 'Export Report' },
  { keys: ['Esc'], description: 'Close' },
];

// ─── RELEASE NOTES ──────────────────────────────
const RELEASE_NOTES = [
  { version: 'v3.2.0', date: 'March 2026', description: 'New Executive Lounge with 17 pages, enhanced analytics' },
  { version: 'v3.1.0', date: 'February 2026', description: 'Commission waterfall visualization, team comparisons' },
  { version: 'v3.0.0', date: 'January 2026', description: 'Heritage Design System refresh, glass morphism UI' },
];

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveSupport() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <ExecutiveLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Hero */}
        <ExecutivePageHero
          icon={HelpCircle}
          title="Help & Support"
          subtitle="Resources, guides, and support channels"
        />

        {/* Golden ratio grid: 1.618fr : 1fr */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: '1.618fr 1fr' }}
        >
          {/* ─── LEFT COLUMN ─── */}
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.lg }}>
                  <SectionHeader icon={BookOpen} title="Quick Start Guide" subtitle="Get up and running in 5 steps" />

                  <div className="space-y-3">
                    {QUICK_START_STEPS.map((step) => (
                      <div
                        key={step.num}
                        className="flex items-start gap-3"
                        style={{
                          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(0,0,0,0.02)',
                        }}
                      >
                        {/* Number badge */}
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9999,
                            background: EXECUTIVE_GRADIENT_CSS,
                            color: 'white',
                            fontSize: TYPE.caption,
                            fontWeight: 700,
                          }}
                        >
                          {step.num}
                        </div>
                        <div>
                          <p style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>{step.title}</p>
                          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 2 }}>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ Section */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.lg }}>
                  <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" subtitle="Common questions and answers" />

                  <div className="space-y-2">
                    {FAQ_ITEMS.map((faq, idx) => (
                      <motion.div
                        key={idx}
                        className="cursor-pointer"
                        style={{
                          borderRadius: RADIUS.button,
                          backgroundColor: openFAQ === idx ? 'rgba(255,247,237,0.6)' : 'rgba(0,0,0,0.02)',
                          border: openFAQ === idx ? '1px solid rgba(234,88,12,0.2)' : '1px solid transparent',
                          overflow: 'hidden',
                        }}
                        onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                      >
                        <div
                          className="flex items-center justify-between"
                          style={{
                            padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                          }}
                        >
                          <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{faq.question}</p>
                          <motion.div
                            animate={{ rotate: openFAQ === idx ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown style={{ width: 16, height: 16, color: COLORS.gray[400], flexShrink: 0 }} />
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {openFAQ === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p
                                style={{
                                  fontSize: TYPE.caption,
                                  color: COLORS.gray[600],
                                  lineHeight: 1.5,
                                  padding: `0 ${GRID.spacing.md}px ${GRID.spacing.sm}px`,
                                }}
                              >
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="space-y-6">
            {/* Contact Support */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.lg }}>
                  <h3 style={{ fontSize: TYPE.title, fontWeight: 700, marginBottom: GRID.spacing.xs }}>Need Help?</h3>
                  <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: GRID.spacing.md, lineHeight: 1.5 }}>
                    Our support team is available Monday-Friday, 9am-6pm EST
                  </p>

                  <div className="space-y-3" style={{ marginBottom: GRID.spacing.md }}>
                    <div className="flex items-center gap-3">
                      <Mail style={{ width: 16, height: 16, color: '#ea580c' }} />
                      <span style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>support@heritagels.org</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone style={{ width: 16, height: 16, color: '#ea580c' }} />
                      <span style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>(555) 100-2000</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => toast('Opening support channel...')}
                    className="w-full"
                    style={{
                      borderRadius: RADIUS.button,
                      background: EXECUTIVE_GRADIENT_CSS,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: TYPE.meta,
                    }}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.lg }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.md }}>
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>System Status</h3>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 9999,
                          backgroundColor: '#22c55e',
                        }}
                      />
                      <span style={{ fontSize: TYPE.caption, color: '#059669', fontWeight: 600 }}>All Systems Operational</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {SYSTEM_SERVICES.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between"
                        style={{
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <span style={{ fontSize: TYPE.meta, color: COLORS.gray[700] }}>{service.name}</span>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle style={{ width: 14, height: 14, color: '#22c55e' }} />
                          <span style={{ fontSize: TYPE.caption, color: '#059669', fontWeight: 500 }}>{service.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between"
                    style={{
                      marginTop: GRID.spacing.sm,
                      paddingTop: GRID.spacing.sm,
                      borderTop: `1px solid ${GLASS.border}`,
                    }}
                  >
                    <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>Uptime</span>
                    <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: '#059669' }}>99.98% (last 30 days)</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Keyboard Shortcuts */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.lg }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: GRID.spacing.md }}>
                    <Keyboard style={{ width: 18, height: 18, color: '#ea580c' }} />
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>Keyboard Shortcuts</h3>
                  </div>

                  <div className="space-y-2">
                    {SHORTCUTS.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                        style={{
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, kidx) => (
                            <kbd
                              key={kidx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: TYPE.micro,
                                fontWeight: 600,
                                fontFamily: 'inherit',
                                backgroundColor: 'white',
                                border: `1px solid ${GLASS.border}`,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                color: COLORS.gray[700],
                                minWidth: 24,
                              }}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                        <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Release Notes */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.lg }}>
                  <h3 style={{ fontSize: TYPE.title, fontWeight: 700, marginBottom: GRID.spacing.md }}>Recent Updates</h3>

                  <div className="space-y-3">
                    {RELEASE_NOTES.map((note, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderLeft: '3px solid #ea580c',
                        }}
                      >
                        <p style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>
                          {note.version} — {note.date}
                        </p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 2 }}>
                          {note.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveSupport;

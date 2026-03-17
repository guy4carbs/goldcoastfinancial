/**
 * Client Dashboard
 * Main dashboard for the Client Lounge
 * Heritage Design System — Violet-to-Amber theme
 *
 * Flow: Hero → Quick Actions → Stats → Golden Ratio Content Grid → Activity Timeline
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import {
  RADIUS,
  SHADOW,
  MOTION,
  TYPE,
  COLORS,
  fadeInUp,
  staggerContainer,
  staggerCards,
  GRID,
  LAYOUT,
  GLASS,
} from '@/lib/heritageDesignSystem';
import {
  CLIENT_GRADIENT_CSS,
  glassCard,
  POLICY_STATUS_COLORS,
  fmtCurrency,
} from './clientConstants';
import { usePortalPolicies, usePortalBilling, usePortalNotifications } from '@/hooks/usePortalData';
import { useAuth } from '@/hooks/use-auth';
import {
  Shield,
  FileText,
  Gift,
  Landmark,
  Calendar,
  ClipboardList,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Heart,
  Activity,
  CheckCircle,
  Bell,
  DollarSign,
  Clock,
  Phone,
  type LucideIcon,
} from 'lucide-react';

// ─── Quick Actions ──────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Shield, label: 'View Policies', description: 'Manage your coverage', href: '/client/policies', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: ClipboardList, label: 'File a Claim', description: 'Start a new claim', href: '/client/claims', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Calendar, label: 'Schedule Call', description: 'Book an appointment', href: '/client/appointments', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Gift, label: 'Refer a Friend', description: 'Share the gift of protection', href: '/client/referral', color: 'text-pink-600', bg: 'bg-pink-50' },
];

// ─── Stat Cards Data (computed from live policies) ──────

// ─── Policy Type Icon Map ───────────────────────────────

const POLICY_TYPE_ICONS: Record<string, LucideIcon> = {
  'Term Life': Shield,
  'Whole Life': Heart,
  'IUL': TrendingUp,
  'Final Expense': Shield,
};

// ─── Activity Type Colors ───────────────────────────────

const ACTIVITY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  payment: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  document: { bg: 'bg-blue-100', text: 'text-blue-600' },
  claim: { bg: 'bg-amber-100', text: 'text-amber-600' },
  appointment: { bg: 'bg-violet-100', text: 'text-violet-600' },
  message: { bg: 'bg-violet-100', text: 'text-violet-600' },
  policy: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
};

const ACTIVITY_TYPE_ICONS: Record<string, LucideIcon> = {
  payment: Landmark,
  document: FileText,
  claim: ClipboardList,
  appointment: Calendar,
  message: MessageSquare,
  policy: Shield,
};

// ─── Component ──────────────────────────────────────────

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data: policies = [] } = usePortalPolicies();
  const { data: billing = [] } = usePortalBilling();
  const { data: notifications = [] } = usePortalNotifications();

  // Upcoming payments: filter for pending status
  const upcomingPayments = billing.filter((b) => b.status === 'pending').slice(0, 3);

  // First 3 policies for summary
  const summaryPolicies = policies.slice(0, 3);

  // Compute stats from live data
  const activePolicies = policies.filter((p) => p.status === 'active');
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
  const totalPremium = activePolicies.reduce((sum, p) => sum + p.monthlyPremium, 0);

  const STAT_CARDS: { icon: LucideIcon; value: string; label: string }[] = [
    { icon: Shield, value: fmtCurrency(totalCoverage), label: 'Total Coverage' },
    { icon: DollarSign, value: `$${totalPremium}/mo`, label: 'Monthly Premium' },
    { icon: FileText, value: String(activePolicies.length), label: 'Active Policies' },
    { icon: ClipboardList, value: String(policies.filter((p) => p.status === 'pending').length), label: 'Pending Policies' },
  ];

  // Build activity from notifications (replaces DEMO_CLIENT_ACTIVITY)
  const recentActivity = notifications.slice(0, 8).map((n) => ({
    id: n.id,
    type: n.type,
    description: n.message,
    date: n.date,
  }));

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GRID.spacing.md,
        }}
      >
        {/* ─── 1. HERO SECTION ─── */}
        <motion.div variants={fadeInUp}>
          <div
            className="relative overflow-hidden"
            style={{
              background: CLIENT_GRADIENT_CSS,
              borderRadius: RADIUS.hero,
              boxShadow: SHADOW.hero,
              padding: GRID.spacing.lg,
            }}
          >
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Decorative floating circles */}
            <div
              className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm pointer-events-none"
              style={{ width: 356, height: 356, borderRadius: RADIUS.pill }}
            />
            <div
              className="absolute top-1/2 right-1/4 blur-sm pointer-events-none"
              style={{ width: 136, height: 136, borderRadius: RADIUS.pill, backgroundColor: 'rgba(251,191,36,0.15)' }}
            />

            <div className="relative z-10 flex items-start gap-4">
              {/* 80px Liquid Glass Icon Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 200,
                  delay: 0.2,
                }}
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
                <Shield
                  className="text-amber-200 drop-shadow-sm"
                  style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Title and subtitle */}
              <div className="flex-1">
                <h1
                  className="font-bold tracking-tight text-white font-serif"
                  style={{
                    fontSize: TYPE.display,
                    marginBottom: GRID.spacing.xs,
                    lineHeight: 1.1,
                  }}
                >
                  Welcome back, {user?.firstName ?? 'there'}!
                </h1>
                <p
                  className="text-white/90 max-w-xl"
                  style={{ fontSize: TYPE.body, lineHeight: 1.5 }}
                >
                  Your policies are active and in good standing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── 2. QUICK ACTIONS GRID ─── */}
        <motion.div
          variants={staggerCards}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ gap: GRID.spacing.sm }}
        >
          {QUICK_ACTIONS.map((action) => (
            <motion.div key={action.href} variants={fadeInUp}>
              <Link href={action.href}>
                <motion.div
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  className="cursor-pointer h-full"
                  style={{
                    ...glassCard,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.card,
                    padding: GRID.spacing.md,
                  }}
                >
                  {/* 48px icon circle */}
                  <div
                    className={cn('flex items-center justify-center', action.bg)}
                    style={{
                      width: GRID.spacing.xxl,
                      height: GRID.spacing.xxl,
                      borderRadius: RADIUS.pill,
                      marginBottom: GRID.spacing.sm,
                    }}
                  >
                    <action.icon className={action.color} size={LAYOUT.icon.lg} />
                  </div>
                  <p className="font-bold text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {action.label}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {action.description}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── 3. STAT CARDS GRID ─── */}
        <motion.div
          variants={staggerCards}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ gap: GRID.spacing.sm }}
        >
          {STAT_CARDS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} variants={fadeInUp}>
                <Card
                  className="border-0 overflow-hidden relative"
                  style={{ borderRadius: RADIUS.card, boxShadow: '0 16px 24px rgba(0,0,0,0.08)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500" />
                  <div
                    className="absolute top-0 right-0 bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/3"
                    style={{ width: 80, height: 80, borderRadius: 9999 }}
                  />
                  <CardContent className="px-5 py-5 relative z-10">
                    <div className="flex items-center gap-3">
                      {/* 40px liquid glass icon badge */}
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: RADIUS.input,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
                        }}
                      >
                        <Icon className="text-amber-200 drop-shadow-sm" size={20} />
                      </div>
                      <p className="font-bold text-white" style={{ fontSize: TYPE.section }}>
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-white/70 mt-1.5" style={{ fontSize: TYPE.caption }}>
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── 4. GOLDEN RATIO CONTENT GRID — 1.618fr / 1fr ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.md }}
        >
          {/* ─── LEFT COLUMN (2/3) — My Policies ─── */}
          <Card
            className="overflow-hidden border-0"
            style={{
              ...glassCard,
              border: 'none',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="font-semibold flex items-center gap-3 text-gray-900"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                    style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                  >
                    <Shield className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  My Policies
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/client/policies">
                    View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {summaryPolicies.map((policy) => {
                  const PolicyIcon = POLICY_TYPE_ICONS[policy.type] || Shield;
                  const statusColors = POLICY_STATUS_COLORS[policy.status];
                  return (
                    <div
                      key={policy.id}
                      className="flex items-center transition-colors duration-200 hover:bg-gray-200/60"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                      }}
                    >
                      {/* Policy type icon badge */}
                      <div
                        className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          flexShrink: 0,
                        }}
                      >
                        <PolicyIcon className="text-amber-200" size={LAYOUT.icon.md} />
                      </div>

                      {/* Policy details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                            {policy.type}
                          </p>
                          <span
                            className={cn('inline-flex items-center gap-1 px-2 py-0.5 font-medium', statusColors.bg, statusColors.text)}
                            style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', statusColors.dot)} />
                            {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>
                          {policy.policyNumber} &middot; {policy.carrier}
                        </p>
                      </div>

                      {/* Coverage & premium */}
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {fmtCurrency(policy.coverageAmount)}
                        </p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          ${policy.monthlyPremium}/mo
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ─── RIGHT COLUMN (1/3) — Your Advisor ─── */}
          <Card
            className="overflow-hidden border-0 relative"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
            }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0" style={{ background: CLIENT_GRADIENT_CSS }} />
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Decorative circles */}
            <div
              className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm pointer-events-none"
              style={{ width: 180, height: 180, borderRadius: RADIUS.pill }}
            />
            <div
              className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 blur-sm pointer-events-none"
              style={{ width: 120, height: 120, borderRadius: RADIUS.pill, backgroundColor: 'rgba(251,191,36,0.15)' }}
            />

            <CardHeader className="pb-3 relative z-10">
              <CardTitle
                className="font-semibold text-white"
                style={{ fontSize: TYPE.title }}
              >
                Your Advisor
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }} className="relative z-10">
              <div className="flex flex-col items-center text-center" style={{ gap: GRID.spacing.sm }}>
                {/* Avatar circle */}
                <div
                  className="flex items-center justify-center font-bold"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: RADIUS.pill,
                    fontSize: TYPE.section,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                    color: '#fde68a',
                  }}
                >
                  YA
                </div>

                {/* Agent info */}
                <div>
                  <p className="font-bold text-white" style={{ fontSize: TYPE.body }}>
                    Your Advisor
                  </p>
                  <p className="text-white/60" style={{ fontSize: TYPE.caption }}>
                    Contact your agent for assistance
                  </p>
                </div>

                {/* Contact details */}
                <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  <div
                    className="flex items-center gap-2 text-white/85"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: RADIUS.input,
                      fontSize: TYPE.caption,
                    }}
                  >
                    <MessageSquare size={14} className="text-amber-300 flex-shrink-0" />
                    <span className="truncate">Send a message</span>
                  </div>
                  <div
                    className="flex items-center gap-2 text-white/85"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: RADIUS.input,
                      fontSize: TYPE.caption,
                    }}
                  >
                    <Phone size={14} className="text-amber-300 flex-shrink-0" />
                    <span>Schedule a call</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex w-full" style={{ gap: GRID.spacing.xs }}>
                  <Button
                    variant="outline"
                    className="flex-1 font-semibold hover:opacity-90"
                    style={{
                      borderRadius: RADIUS.button,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: 'white',
                    }}
                    asChild
                  >
                    <Link href="/client/messages">
                      <MessageSquare size={LAYOUT.icon.sm} className="mr-1.5" />
                      Message
                    </Link>
                  </Button>
                  <Button
                    className="flex-1 font-semibold hover:opacity-90"
                    style={{
                      borderRadius: RADIUS.button,
                      background: 'white',
                      color: '#7c3aed',
                    }}
                    asChild
                  >
                    <Link href="/client/appointments">
                      <Calendar size={LAYOUT.icon.sm} className="mr-1.5" />
                      Schedule Call
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 5. UPCOMING PAYMENTS + RECENT ACTIVITY — Side by Side ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID.spacing.md }}
        >
          {/* LEFT — Upcoming Payments (compact, gradient) */}
          <Card
            className="overflow-hidden border-0 relative self-start"
            style={{
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.hero,
            }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0" style={{ background: CLIENT_GRADIENT_CSS }} />
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div
              className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm pointer-events-none"
              style={{ width: 160, height: 160, borderRadius: RADIUS.pill }}
            />

            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="font-semibold flex items-center gap-3 text-white"
                  style={{ fontSize: TYPE.title }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: LAYOUT.icon.xxl,
                      height: LAYOUT.icon.xxl,
                      borderRadius: RADIUS.button,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Landmark className="text-amber-200" size={LAYOUT.icon.md} />
                  </div>
                  Upcoming Payments
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/client/billing">
                    View All <ChevronRight className="ml-1" size={LAYOUT.icon.sm} />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }} className="relative z-10">
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {upcomingPayments.length > 0 ? (
                  upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>
                          {payment.policyType}
                        </p>
                        <p className="text-white/60" style={{ fontSize: TYPE.caption }}>
                          Due {payment.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="font-bold text-white" style={{ fontSize: TYPE.meta }}>
                          ${payment.amount}
                        </p>
                        {payment.paymentMethod.includes('Auto-pay') && (
                          <span
                            className="font-medium px-2 py-0.5"
                            style={{
                              borderRadius: RADIUS.pill,
                              fontSize: TYPE.micro,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: '#fde68a',
                            }}
                          >
                            Auto-pay
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto text-amber-200 mb-2" size={LAYOUT.icon.xl} />
                    <p className="text-white/70" style={{ fontSize: TYPE.meta }}>
                      All payments are up to date
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT — Recent Activity */}
          <Card
            className="overflow-hidden border-0"
            style={{
              ...glassCard,
              border: 'none',
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.card,
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="font-semibold flex items-center gap-3 text-gray-900"
                style={{ fontSize: TYPE.title }}
              >
                <div
                  className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20"
                  style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                >
                  <Activity className="text-amber-200" size={LAYOUT.icon.md} />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {recentActivity.map((item) => {
                  const typeColors = ACTIVITY_TYPE_COLORS[item.type] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                  const ActivityIcon = ACTIVITY_TYPE_ICONS[item.type] || Activity;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center"
                      style={{
                        gap: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                      }}
                    >
                      <div
                        className={cn('flex items-center justify-center flex-shrink-0', typeColors.bg)}
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.pill,
                        }}
                      >
                        <ActivityIcon className={typeColors.text} size={LAYOUT.icon.md} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {item.description}
                        </p>
                      </div>
                      <p className="text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.caption }}>
                        {item.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}

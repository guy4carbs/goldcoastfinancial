/**
 * Executive Settings — Profile, Notifications, Dashboard Widgets, Security, Data & Export
 * Heritage Design System — Orange/Amber theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Settings,
  User,
  Bell,
  Shield,
  Download,
  LayoutDashboard,
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

// ─── NOTIFICATION PREFERENCES ───────────────────
const NOTIFICATION_PREFS = [
  { id: 'revenue', label: 'Revenue milestone alerts', description: 'Get notified when revenue milestones are reached', on: true },
  { id: 'performance', label: 'Team performance drops', description: 'Alert when a team falls below target thresholds', on: true },
  { id: 'onboarding', label: 'New agent onboarding', description: 'Notifications for new agent onboarding events', on: true },
  { id: 'commission', label: 'Commission payout notifications', description: 'Updates on commission processing and payouts', on: true },
  { id: 'pipeline', label: 'Pipeline stale deal alerts', description: 'Alerts for deals that have been idle too long', on: false },
  { id: 'weekly', label: 'Weekly executive summary email', description: 'Receive a weekly digest of key metrics', on: true },
  { id: 'compliance', label: 'Compliance expiration warnings', description: 'Warnings for upcoming license and E&O expirations', on: true },
];

// ─── DASHBOARD WIDGETS ──────────────────────────
const DASHBOARD_WIDGETS = [
  { id: 'revenue', label: 'Revenue Overview', on: true },
  { id: 'pipeline', label: 'Pipeline Health', on: true },
  { id: 'rankings', label: 'Team Rankings', on: true },
  { id: 'activity', label: 'Activity Feed', on: true },
  { id: 'product', label: 'Product Mix', on: false },
  { id: 'goals', label: 'Quarterly Goals', on: true },
  { id: 'performers', label: 'Top Performers', on: true },
  { id: 'recruiting', label: 'Recruiting Funnel', on: false },
];

// ─── SECURITY ITEMS ─────────────────────────────
const SECURITY_ITEMS = [
  { label: 'Two-Factor Authentication', value: 'Enabled', badge: { bg: '#ecfdf5', text: '#059669' }, button: 'Manage', toastMsg: 'Opening 2FA settings...' },
  { label: 'Active Sessions', value: '3 devices', badge: null, button: 'View Sessions', toastMsg: 'Loading active sessions...' },
  { label: 'Password', value: 'Last changed 45 days ago', badge: null, button: 'Change Password', toastMsg: 'Opening password change dialog...' },
  { label: 'Login History', value: 'View recent login activity', badge: null, button: 'View', toastMsg: 'Loading login history...' },
];

// ─── MAIN COMPONENT ─────────────────────────────
export function ExecutiveSettings() {
  const [notifPrefs, setNotifPrefs] = useState(
    NOTIFICATION_PREFS.map((p) => ({ ...p }))
  );
  const [widgets, setWidgets] = useState(
    DASHBOARD_WIDGETS.map((w) => ({ ...w }))
  );

  const toggleNotif = (id: string) => {
    setNotifPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, on: !p.on } : p))
    );
    toast.success('Preference updated');
  };

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, on: !w.on } : w))
    );
    toast.success('Widget preference updated');
  };

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
          icon={Settings}
          title="Executive Settings"
          subtitle="Manage your profile, notifications, and dashboard preferences"
        />

        {/* Centered container */}
        <div style={{ maxWidth: 800, margin: '0 auto' }} className="space-y-6">
          {/* ─── Section 1: Profile ─── */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.lg }}>
                <SectionHeader icon={User} title="Profile" subtitle="Your account information" />

                <div className="space-y-4">
                  {/* Avatar + Name row */}
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 9999,
                        background: EXECUTIVE_GRADIENT_CSS,
                        fontSize: TYPE.title,
                      }}
                    >
                      JH
                    </div>
                    <div className="flex-1 space-y-3">
                      {/* Name */}
                      <div>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: 4 }}>Name</p>
                        <div
                          style={{
                            padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                            borderRadius: RADIUS.button,
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            fontSize: TYPE.body,
                            fontWeight: 500,
                          }}
                        >
                          Jonathan Heritage
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: 4 }}>Email</p>
                    <div
                      style={{
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                        borderRadius: RADIUS.button,
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        fontSize: TYPE.body,
                      }}
                    >
                      jonathan@heritagels.org
                    </div>
                  </div>

                  {/* Role + Phone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: 4 }}>Role</p>
                      <div
                        style={{
                          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          fontSize: TYPE.body,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '2px 10px',
                            borderRadius: RADIUS.pill,
                            backgroundColor: '#fff7ed',
                            color: '#ea580c',
                            fontSize: TYPE.caption,
                            fontWeight: 600,
                          }}
                        >
                          Owner
                        </span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: 4 }}>Phone</p>
                      <div
                        style={{
                          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                          borderRadius: RADIUS.button,
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          fontSize: TYPE.body,
                        }}
                      >
                        (555) 123-4567
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile button */}
                  <div style={{ paddingTop: GRID.spacing.xs }}>
                    <Button
                      onClick={() => toast('Opening profile editor...')}
                      style={{
                        borderRadius: RADIUS.button,
                        background: EXECUTIVE_GRADIENT_CSS,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: TYPE.meta,
                      }}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Section 2: Notifications ─── */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.lg }}>
                <SectionHeader icon={Bell} title="Notifications" subtitle="Control what alerts you receive" />

                <div className="space-y-1">
                  {notifPrefs.map((pref) => (
                    <motion.div
                      key={pref.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      onClick={() => toggleNotif(pref.id)}
                      className="flex items-center justify-between cursor-pointer"
                      style={{
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                        borderRadius: RADIUS.button,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{pref.label}</p>
                        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{pref.description}</p>
                      </div>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 9999,
                          backgroundColor: pref.on ? '#ea580c' : COLORS.gray[300],
                          flexShrink: 0,
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Section 3: Dashboard Widgets ─── */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.lg }}>
                <SectionHeader icon={LayoutDashboard} title="Dashboard Widgets" subtitle="Choose which widgets appear on your dashboard" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {widgets.map((widget) => (
                    <motion.div
                      key={widget.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleWidget(widget.id)}
                      className="cursor-pointer"
                      style={{
                        ...GLASS.css.light,
                        borderRadius: RADIUS.button,
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                        border: widget.on ? '1px solid rgba(234,88,12,0.3)' : '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: widget.on ? 'rgba(255,247,237,0.6)' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ gap: 8 }}>
                        <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[800] }}>
                          {widget.label}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '2px 8px',
                            borderRadius: RADIUS.pill,
                            fontSize: TYPE.micro,
                            fontWeight: 600,
                            backgroundColor: widget.on ? '#ecfdf5' : 'rgba(0,0,0,0.05)',
                            color: widget.on ? '#059669' : COLORS.gray[500],
                          }}
                        >
                          {widget.on ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Section 4: Security ─── */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.lg }}>
                <SectionHeader icon={Shield} title="Security" subtitle="Protect your account" />

                <div className="space-y-3">
                  {SECURITY_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                      style={{
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                        borderRadius: RADIUS.button,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{item.label}</p>
                          <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                            {item.badge ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  padding: '2px 8px',
                                  borderRadius: RADIUS.pill,
                                  fontSize: TYPE.micro,
                                  fontWeight: 600,
                                  backgroundColor: item.badge.bg,
                                  color: item.badge.text,
                                }}
                              >
                                {item.value}
                              </span>
                            ) : (
                              <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{item.value}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast(item.toastMsg)}
                        style={{
                          borderRadius: RADIUS.button,
                          fontSize: TYPE.caption,
                          fontWeight: 500,
                        }}
                      >
                        {item.button}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Section 5: Data & Export ─── */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent style={{ padding: GRID.spacing.lg }}>
                <SectionHeader icon={Download} title="Data & Export" subtitle="Export preferences and data management" />

                <div className="space-y-3">
                  {/* Default export format */}
                  <div
                    className="flex items-center justify-between"
                    style={{
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>Default export format</p>
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '2px 10px',
                        borderRadius: RADIUS.pill,
                        fontSize: TYPE.caption,
                        fontWeight: 600,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                      }}
                    >
                      PDF
                    </span>
                  </div>

                  {/* Data retention */}
                  <div
                    className="flex items-center justify-between"
                    style={{
                      padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                      borderRadius: RADIUS.button,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>Data retention</p>
                    <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>12 months</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3" style={{ paddingTop: GRID.spacing.xs }}>
                    <Button
                      onClick={() => toast('Preparing data export...')}
                      style={{
                        borderRadius: RADIUS.button,
                        background: EXECUTIVE_GRADIENT_CSS,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: TYPE.meta,
                      }}
                    >
                      <Download style={{ width: 16, height: 16, marginRight: 8 }} />
                      Export All Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast('Generating audit log...')}
                      style={{
                        borderRadius: RADIUS.button,
                        fontWeight: 600,
                        fontSize: TYPE.meta,
                      }}
                    >
                      Download Audit Log
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

export default ExecutiveSettings;

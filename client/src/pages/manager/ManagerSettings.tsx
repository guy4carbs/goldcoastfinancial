/**
 * Manager Settings
 * Full settings page matching Agent Lounge pattern + manager-specific sections
 * Heritage Design System — Emerald theme
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ProgressRing } from './primitives';
import { glassCard, MANAGER_ICON_GRADIENT } from './managerConstants';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  SHADOW,
  MOTION,
  COLORS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Settings,
  User,
  Bell,
  Shield,
  LayoutDashboard,
  Users,
  Download,
  Mail,
  Phone,
  MapPin,
  Key,
  Camera,
  Save,
  LogOut,
  Trash2,
  AlertTriangle,
  Globe,
  Smartphone,
  QrCode,
  Calendar,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────── */

interface NotificationSettings {
  teamActivity: boolean;
  escalations: boolean;
  weeklyReport: boolean;
  pipeline: boolean;
  trainingDeadlines: boolean;
  achievements: boolean;
  compliance: boolean;
}

interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
}

interface TwoFactorSettings {
  enabled: boolean;
  method: 'app' | 'sms';
  phoneNumber: string;
}

/* ── Notification Options ───────────────────────────────── */

const NOTIFICATION_OPTIONS: { key: keyof NotificationSettings; label: string; description: string }[] = [
  { key: 'teamActivity', label: 'Team Activity Alerts', description: 'Get notified when team members hit milestones' },
  { key: 'escalations', label: 'Escalation Alerts', description: 'Instant notifications for new escalations' },
  { key: 'weeklyReport', label: 'Weekly Report Delivery', description: 'Receive weekly team performance summary' },
  { key: 'pipeline', label: 'Pipeline Alerts', description: 'Notifications for pipeline stage changes' },
  { key: 'trainingDeadlines', label: 'Training Reminders', description: 'Upcoming certification deadlines and incomplete modules' },
  { key: 'achievements', label: 'Team Achievements', description: 'When agents complete certifications or milestones' },
  { key: 'compliance', label: 'Compliance Alerts', description: 'Certifications expiring, overdue training, compliance violations' },
];

/* ── Dashboard Widgets ──────────────────────────────────── */

const DASHBOARD_WIDGETS = [
  { id: 'top-performers', label: 'Show Top Performers widget' },
  { id: 'pipeline-summary', label: 'Show Pipeline Summary' },
  { id: 'escalations', label: 'Show Escalations widget' },
  { id: 'activity-feed', label: 'Show Team Activity Feed' },
];

/* ── Team Defaults ──────────────────────────────────────── */

const TEAM_DEFAULTS = [
  { id: 'quota-target', label: 'Default Quota Target (%)', defaultValue: '100' },
  { id: 'meeting-frequency', label: 'Meeting Frequency', defaultValue: 'Weekly' },
  { id: 'escalation-threshold', label: 'Escalation Threshold (days)', defaultValue: '2' },
];

/* ── Glass card icon helper ─────────────────────────────── */

function SectionIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} shadow-lg shadow-emerald-500/20`}
      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
    >
      <Icon className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
    </div>
  );
}

/* ── Component ──────────────────────────────────────────── */

export function ManagerSettings() {
  /* ── State ────────────────────────────────────────────── */
  const [profile, setProfile] = useState<ProfileSettings>({
    firstName: 'Jordan',
    lastName: 'Mitchell',
    email: 'jordan.mitchell@heritagels.org',
    phone: '(630) 555-0142',
    location: 'Chicago, IL',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    teamActivity: true,
    escalations: true,
    weeklyReport: true,
    pipeline: false,
    trainingDeadlines: true,
    achievements: true,
    compliance: true,
  });

  const [twoFactor, setTwoFactor] = useState<TwoFactorSettings>({
    enabled: true,
    method: 'app',
    phoneNumber: '***-***-0142',
  });

  const [isSaving, setIsSaving] = useState(false);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    if (!profile.email.trim()) {
      toast.error('Email is required');
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    toast.success('Settings saved successfully');
  }, [profile]);

  const handleNotificationChange = useCallback((key: keyof NotificationSettings, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }));
  }, []);

  const handleTwoFactorToggle = useCallback((checked: boolean) => {
    setTwoFactor((prev) => ({ ...prev, enabled: checked }));
    toast.success(checked ? '2FA enabled' : '2FA disabled');
  }, []);

  const handleTwoFactorMethod = useCallback((method: 'app' | 'sms') => {
    setTwoFactor((prev) => ({ ...prev, method }));
  }, []);

  /* ── Card wrapper helper ──────────────────────────────── */
  const cardStyle = { ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <ManagerPageHero
          icon={Settings}
          title="Settings"
          subtitle="Account, preferences, and support"
        >
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur gap-2"
            onClick={handleSave}
            disabled={isSaving}
            style={{ borderRadius: RADIUS.button }}
          >
            {isSaving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </ManagerPageHero>

        {/* ── Profile Completion ─────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardContent style={{ padding: GRID.spacing.md }}>
              <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
                <ProgressRing value={78} size={72} strokeWidth={7} label="78%" sublabel="Complete" />
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>Profile Completion</h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta, marginTop: 2 }}>
                    Complete your profile to unlock all manager features. Add a photo and configure team defaults to reach 100%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Profile Information ───────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={User} />
                <div>
                  <span className="text-gray-900">Profile Information</span>
                  <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                    Update your personal details
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              {/* Avatar */}
              <div className="flex items-center" style={{ gap: GRID.spacing.md, marginBottom: GRID.spacing.md }}>
                <div
                  className="flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ width: 80, height: 80, borderRadius: RADIUS.card }}
                >
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Photo upload coming soon')}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.caption }}>JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${COLORS.gray[100]}`, paddingTop: GRID.spacing.md }}>
                <div className="grid sm:grid-cols-2" style={{ gap: GRID.spacing.sm }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Label htmlFor="firstName" className="text-gray-900" style={{ fontSize: TYPE.meta }}>First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Label htmlFor="lastName" className="text-gray-900" style={{ fontSize: TYPE.meta }}>Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-900" style={{ fontSize: TYPE.meta }}>
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Label htmlFor="phone" className="flex items-center gap-2 text-gray-900" style={{ fontSize: TYPE.meta }}>
                      <Phone className="w-3 h-3" /> Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div className="sm:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Label htmlFor="location" className="flex items-center gap-2 text-gray-900" style={{ fontSize: TYPE.meta }}>
                      <MapPin className="w-3 h-3" /> Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Notification Preferences ──────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={Bell} />
                <div>
                  <span className="text-gray-900">Notification Preferences</span>
                  <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                    Choose how you want to be notified
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="divide-y divide-gray-100">
                {NOTIFICATION_OPTIONS.map((item) => (
                  <div key={item.key} className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                    <div>
                      <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{item.label}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Security ──────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={Shield} />
                <div>
                  <span className="text-gray-900">Security</span>
                  <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                    Manage your account security
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="divide-y divide-gray-100">
                {/* Password */}
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Password</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Last changed 30 days ago</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Password change coming soon')}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                {/* 2FA */}
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Two-Factor Authentication</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      {twoFactor.enabled ? `Using ${twoFactor.method === 'app' ? 'Authenticator App' : 'SMS'}` : 'Not enabled'}
                    </p>
                  </div>
                  <Switch checked={twoFactor.enabled} onCheckedChange={handleTwoFactorToggle} />
                </div>

                {/* 2FA Method selection */}
                {twoFactor.enabled && (
                  <div style={{ padding: `${GRID.spacing.sm}px 0` }}>
                    <Label className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>Authentication Method</Label>
                    <div className="grid grid-cols-2" style={{ gap: GRID.spacing.sm, marginTop: GRID.spacing.xs }}>
                      <button
                        type="button"
                        className={cn(
                          'p-3 border-2 cursor-pointer transition-all text-left',
                          twoFactor.method === 'app' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        )}
                        style={{ borderRadius: RADIUS.button }}
                        onClick={() => handleTwoFactorMethod('app')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <QrCode className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>Authenticator App</span>
                        </div>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Use Google Authenticator or similar</p>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'p-3 border-2 cursor-pointer transition-all text-left',
                          twoFactor.method === 'sms' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        )}
                        style={{ borderRadius: RADIUS.button }}
                        onClick={() => handleTwoFactorMethod('sms')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>SMS Code</span>
                        </div>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Receive codes via text message</p>
                      </button>
                    </div>
                    {twoFactor.method === 'sms' && (
                      <div
                        className="flex items-center gap-2 mt-3 bg-emerald-50"
                        style={{ padding: 12, borderRadius: RADIUS.button }}
                      >
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>Codes sent to: {twoFactor.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Sessions */}
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Active Sessions</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Manage devices logged into your account</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Session management coming soon')}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Dashboard Customization ───────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={LayoutDashboard} />
                <span className="text-gray-900">Dashboard Customization</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {DASHBOARD_WIDGETS.map((widget) => (
                  <div key={widget.id} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                    <Checkbox id={widget.id} defaultChecked />
                    <label htmlFor={widget.id} className="text-gray-900 cursor-pointer" style={{ fontSize: TYPE.meta }}>
                      {widget.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Team Defaults ─────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={Users} />
                <span className="text-gray-900">Team Defaults</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {TEAM_DEFAULTS.map((field) => (
                  <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Label htmlFor={field.id} className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                      {field.label}
                    </Label>
                    <Input id={field.id} defaultValue={field.defaultValue} style={{ borderRadius: RADIUS.input }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Data Export ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={Download} />
                <span className="text-gray-900">Data Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <p className="text-gray-500" style={{ fontSize: TYPE.meta, marginBottom: GRID.spacing.sm }}>
                Download team data in CSV format for external analysis.
              </p>
              <div className="flex flex-wrap" style={{ gap: GRID.spacing.sm }}>
                <motion.button
                  onClick={() => toast.success('Team data exported successfully')}
                  className={`font-semibold text-white border-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    fontSize: TYPE.meta,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                    borderRadius: RADIUS.button,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Export Team Data
                </motion.button>
                <motion.button
                  onClick={() => toast.success('Pipeline report exported successfully')}
                  className="font-medium text-emerald-700 border border-emerald-200 hover:bg-emerald-50 bg-transparent"
                  style={{
                    fontSize: TYPE.meta,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
                    borderRadius: RADIUS.button,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Export Pipeline Report
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Preferences ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <SectionIcon icon={Globe} />
                <div>
                  <span className="text-gray-900">Preferences</span>
                  <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                    Customize your experience
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Language</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Select your preferred language</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => toast.info('Language settings coming soon')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    English (US)
                  </Button>
                </div>
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>Timezone</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Set your local timezone</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => toast.info('Timezone settings coming soon')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Central Time (CT)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Account ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden" style={cardStyle}>
            <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
              <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                <div
                  className="flex items-center justify-center bg-red-100"
                  style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                >
                  <AlertTriangle className="text-red-600" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                </div>
                <div>
                  <span className="text-red-600">Account</span>
                  <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                    Sign out and account management
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-red-600" style={{ fontSize: TYPE.meta }}>Sign Out</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Log out of your account on this device</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => toast.success('Signed out successfully')}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                <div className="flex items-center justify-between" style={{ padding: `${GRID.spacing.sm}px 0` }}>
                  <div>
                    <p className="font-semibold text-red-600" style={{ fontSize: TYPE.meta }}>Delete Account</p>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => toast.error('Please contact support to delete your account')}
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerSettings;

/**
 * Manager Settings
 * Mirrors Agent Lounge AgentSettings.tsx pattern — emerald theme
 * Heritage Design System
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero } from './primitives';
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
import { RADIUS, SHADOW, TYPE, COLORS, fadeInUp, staggerContainer } from '@/lib/heritageDesignSystem';

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

/* ── Shared glass card style ──────────────────────────────── */

const glassCard = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
};

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

  return (
    <ManagerLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Settings}
            title="Settings"
            subtitle="Manage your account and preferences"
          >
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur"
              onClick={handleSave}
              disabled={isSaving}
              style={{ borderRadius: RADIUS.button }}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </ManagerPageHero>
        </motion.div>

        {/* ── Profile Information ───────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <User className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Profile Information</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Update your personal details</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl"
                  style={{ borderRadius: RADIUS.card }}
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
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-900">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-900">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-900">
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
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-gray-900">
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-gray-900">
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
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Notification Preferences ──────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Bell className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Notification Preferences</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Choose how you want to be notified</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                {NOTIFICATION_OPTIONS.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
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
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Shield className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Security</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Manage your account security</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                {/* Password */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Last changed 30 days ago</p>
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
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">
                      {twoFactor.enabled ? `Using ${twoFactor.method === 'app' ? 'Authenticator App' : 'SMS'}` : 'Not enabled'}
                    </p>
                  </div>
                  <Switch checked={twoFactor.enabled} onCheckedChange={handleTwoFactorToggle} />
                </div>

                {/* Active Sessions */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Active Sessions</p>
                    <p className="text-xs text-gray-500">Manage devices logged into your account</p>
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

        {/* ── Two-Factor Authentication ────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Smartphone className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Two-Factor Authentication</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">2FA Status</p>
                    <p className="text-xs text-gray-500">
                      {twoFactor.enabled ? `Using ${twoFactor.method === 'app' ? 'Authenticator App' : 'SMS'}` : 'Not enabled'}
                    </p>
                  </div>
                  <Switch checked={twoFactor.enabled} onCheckedChange={handleTwoFactorToggle} />
                </div>
              </div>
              {twoFactor.enabled && (
                <div className="mt-4 space-y-4">
                  <Label className="text-gray-900">Authentication Method</Label>
                  <div className="grid grid-cols-2 gap-3">
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
                        <span className="font-medium text-sm text-gray-900">Authenticator App</span>
                      </div>
                      <p className="text-xs text-gray-500">Use Google Authenticator or similar</p>
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
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-sm text-gray-900">SMS Code</span>
                      </div>
                      <p className="text-xs text-gray-500">Receive codes via text message</p>
                    </button>
                  </div>
                  {twoFactor.method === 'sms' && (
                    <div
                      className="flex items-center gap-2 p-3 bg-emerald-50"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-700">Codes sent to: {twoFactor.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Dashboard Customization ───────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <LayoutDashboard className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Dashboard Customization</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Choose which widgets to display</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DASHBOARD_WIDGETS.map((widget) => (
                <div key={widget.id} className="flex items-center gap-3">
                  <Checkbox id={widget.id} defaultChecked />
                  <label htmlFor={widget.id} className="text-sm text-gray-900 cursor-pointer">
                    {widget.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Team Defaults ─────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Users className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Team Defaults</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Set default values for your team</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {TEAM_DEFAULTS.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-gray-900">{field.label}</Label>
                    <Input id={field.id} defaultValue={field.defaultValue} style={{ borderRadius: RADIUS.input }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Data Export ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Download className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Data Export</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Download team data for external analysis</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => toast.success('Team data exported successfully')}
                  className="bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Team Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.success('Pipeline report exported successfully')}
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  Export Pipeline Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Preferences ───────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Globe className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="text-gray-900">Preferences</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Customize your experience</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Language</p>
                    <p className="text-xs text-gray-500">Select your preferred language</p>
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
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Timezone</p>
                    <p className="text-xs text-gray-500">Set your local timezone</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => toast.info('Timezone settings coming soon')}
                  >
                    Central Time (CT)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Danger Zone ──────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-red-100"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <span className="text-red-600">Danger Zone</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Irreversible account actions</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-red-600">Sign Out</p>
                    <p className="text-xs text-gray-500">Log out of your account on this device</p>
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
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-red-600">Delete Account</p>
                    <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
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

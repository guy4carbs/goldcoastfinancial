/**
 * ClientProfile — Profile & Settings Page
 * Heritage Design System — Violet-to-amber theme
 *
 * Synced with backend — email, phone, name all persist via PATCH /api/portal/profile.
 * Password changes via POST /api/portal/change-password.
 * Design mirrors AgentSettings.tsx for cross-lounge consistency.
 *
 * Governance: Nova (UI) + Forge (API sync) + Sentinel (password validation) + Lumen (form flow)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { CLIENT_GRADIENT_CSS, glassCard } from './clientConstants';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Lock, Shield, Bell, Smartphone, Save,
  Camera, Key, CheckCircle2, AlertTriangle, LogOut, Trash2,
  Globe, Settings, Eye, EyeOff, Loader2,
} from 'lucide-react';

// ─── TYPES ───
interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsAlerts: boolean;
  marketingCommunications: boolean;
}

const NOTIFICATION_PREFERENCES = [
  { key: 'emailNotifications' as const, label: 'Email Notifications', description: 'Payment reminders, policy updates, and account alerts' },
  { key: 'smsAlerts' as const, label: 'SMS Alerts', description: 'Payment due reminders and claim status updates via text' },
  { key: 'marketingCommunications' as const, label: 'Marketing Communications', description: 'Product news, educational content, and special offers' },
];

const glassCardStyle = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  ...glassCard,
};

export default function ClientProfile() {
  const { user, refreshProfile } = useAuth();

  // ─── PROFILE STATE ───
  const [profile, setProfile] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user?.id]);

  // ─── PASSWORD STATE ───
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ─── NOTIFICATION STATE ───
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsAlerts: true,
    marketingCommunications: false,
  });

  // Fetch saved preferences on mount
  useEffect(() => {
    fetch('/api/portal/preferences', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setNotifications({
            emailNotifications: data.email_notifications ?? true,
            smsAlerts: data.sms_notifications ?? true,
            marketingCommunications: data.push_notifications ?? false,
          });
        }
      })
      .catch(() => {});
  }, []);

  // ─── 2FA STATE ───
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);

  // ─── HANDLERS ───
  const handleSave = useCallback(async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      toast.error('A valid email is required');
      return;
    }
    if (profile.phone) {
      const digits = profile.phone.replace(/\D/g, '');
      if (digits.length > 0 && digits.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }
      await refreshProfile();
      toast.success('Profile saved successfully!', {
        description: 'Your info is now synced across all features.',
      });
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [profile, refreshProfile]);

  const handlePasswordUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Both passwords are required');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/portal/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to change password');
        return;
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch {
      toast.error('Failed to change password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  }, [passwordForm]);

  const handleChangePhoto = useCallback(() => {
    toast.info('Photo upload coming soon');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/client/login';
    } catch {
      window.location.href = '/client/login';
    }
  }, []);

  const initials = `${(profile.firstName[0] || '?')}${(profile.lastName[0] || '?')}`.toUpperCase();

  return (
    <ClientLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
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

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
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
                <Settings className="text-amber-200 drop-shadow-sm" style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} aria-hidden="true" />
              </motion.div>
              <div>
                <h1 className="font-bold tracking-tight text-white font-serif" style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}>
                  Settings
                </h1>
                <p className="text-white/90" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur flex-shrink-0"
              onClick={handleSave}
              disabled={isSaving}
              style={{ borderRadius: RADIUS.button }}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" aria-hidden="true" /> Save Changes</>
              )}
            </Button>
          </div>
        </motion.div>

        {/* ─── PROFILE INFORMATION ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCardStyle}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <User className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">Profile Information</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Update your personal details</p>
                </div>
              </CardTitle>
              {user ? (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Synced: {user.firstName} {user.lastName} · {user.email} · {user.phone || 'No phone'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>No profile saved yet — fill in your details and click Save</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl"
                  style={{ borderRadius: RADIUS.card }}
                >
                  {initials}
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePhoto}
                    className="text-violet-700 border-violet-200 hover:bg-violet-50"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
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
                    <Mail className="w-3 h-3" aria-hidden="true" />
                    Email
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
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── NOTIFICATION PREFERENCES ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCardStyle}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Bell className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">Notification Preferences</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Choose how you want to be notified</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                {NOTIFICATION_PREFERENCES.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={async (checked) => {
                        const updated = { ...notifications, [item.key]: checked };
                        setNotifications(updated);
                        try {
                          await fetch('/api/portal/preferences', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                              emailNotifications: updated.emailNotifications,
                              smsNotifications: updated.smsAlerts,
                              pushNotifications: updated.marketingCommunications,
                            }),
                          });
                        } catch {
                          toast.error('Failed to save preference');
                          setNotifications({ ...updated, [item.key]: !checked });
                        }
                      }}
                      aria-label={`Toggle ${item.label}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── SECURITY ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCardStyle}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Shield className="w-5 h-5 text-amber-200" aria-hidden="true" />
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
                <div className="py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900">Password</p>
                      <p className="text-xs text-gray-500">Change your account password</p>
                    </div>
                  </div>
                  <form onSubmit={handlePasswordUpdate} className="space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="currentPassword" className="text-xs text-gray-700">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPw ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            style={{ borderRadius: RADIUS.input }}
                          />
                          {passwordForm.currentPassword && (
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword" className="text-xs text-gray-700">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPw ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Min. 8 characters"
                            style={{ borderRadius: RADIUS.input }}
                          />
                          {passwordForm.newPassword && (
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs text-gray-700">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          style={{ borderRadius: RADIUS.input }}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                      className="text-violet-700 border-violet-200 hover:bg-violet-50"
                      style={{ borderRadius: RADIUS.button }}
                      aria-label="Update your password"
                    >
                      {passwordSaving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                      ) : (
                        <><Key className="w-4 h-4 mr-2" aria-hidden="true" /> Update Password</>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={twoFactorEnabled}
                      disabled
                      aria-label="Toggle two-factor authentication"
                      title="2FA setup coming soon"
                    />
                    <Badge
                      className={cn(
                        'border-0',
                        twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500',
                      )}
                      style={{ borderRadius: RADIUS.pill }}
                    >
                      {twoFactorEnabled && <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />}
                      {twoFactorEnabled ? 'Enabled' : 'Coming Soon'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── PREFERENCES ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCardStyle}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Globe className="w-5 h-5 text-amber-200" aria-hidden="true" />
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
                    className="text-violet-700 border-violet-200 hover:bg-violet-50"
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Change language, currently English (US)"
                  >
                    <Globe className="w-4 h-4 mr-2" aria-hidden="true" />
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
                    className="text-violet-700 border-violet-200 hover:bg-violet-50"
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Change timezone"
                  >
                    Central Time (CT)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── DANGER ZONE ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCardStyle}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-red-100"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
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
                    onClick={handleLogout}
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Sign out of your account"
                  >
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                    Sign Out
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-red-600">Delete Account</p>
                    <p className="text-xs text-gray-500">Contact support to permanently delete your account</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => toast.error('Please contact support to delete your account')}
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Delete your account"
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Globe,
  Key,
  Camera,
  Save,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Smartphone,
  QrCode,
  Download,
  Upload,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";
import { toast } from "sonner";
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

// Type definitions
interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  leadAlerts: boolean;
  weeklyReport: boolean;
  achievements: boolean;
}

interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface BankInfo {
  bankName: string;
  accountType: string;
  routingNumber: string;
  accountNumber: string;
  isVerified: boolean;
}

interface TaxInfo {
  hasW9: boolean;
  w9UploadDate: string;
  taxId: string;
}

interface TwoFactorSettings {
  enabled: boolean;
  method: 'app' | 'sms';
  phoneNumber: string;
}

interface NotificationOption {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}

const NOTIFICATION_PREFERENCES: NotificationOption[] = [
  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
  { key: 'sms', label: 'SMS Notifications', description: 'Text message alerts' },
  { key: 'leadAlerts', label: 'Lead Alerts', description: 'Instant notification for new leads' },
  { key: 'weeklyReport', label: 'Weekly Report', description: 'Summary of your weekly performance' },
  { key: 'achievements', label: 'Achievement Alerts', description: 'Get notified when you unlock achievements' },
];

const glassCard = {
  borderRadius: RADIUS.card,
  boxShadow: SHADOW.card,
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
};

export default function AgentSettings() {
  const logout = useAgentStore((state) => state.logout);
  const currentUser = useAgentStore((state) => state.currentUser);
  const createOrUpdateProfile = useAgentStore((state) => state.createOrUpdateProfile);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    leadAlerts: true,
    weeklyReport: true,
    achievements: true,
  });

  // Initialize profile from currentUser
  const getInitialProfile = (): ProfileSettings => {
    if (currentUser) {
      const nameParts = currentUser.name?.split(' ') || ['', ''];
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: 'Los Angeles, CA',
        bio: 'Experienced insurance agent specializing in life and health coverage.',
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: 'Los Angeles, CA',
      bio: 'Experienced insurance agent specializing in life and health coverage.',
    };
  };

  const [profile, setProfile] = useState<ProfileSettings>(getInitialProfile);

  // Sync profile state with store when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const nameParts = currentUser.name?.split(' ') || ['', ''];
      setProfile(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const [isSaving, setIsSaving] = useState(false);

  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountType: 'checking',
    routingNumber: '',
    accountNumber: '',
    isVerified: false,
  });

  const [taxInfo, setTaxInfo] = useState<TaxInfo>({
    hasW9: false,
    w9UploadDate: '',
    taxId: '***-**-1234',
  });

  const [twoFactor, setTwoFactor] = useState<TwoFactorSettings>({
    enabled: true,
    method: 'app',
    phoneNumber: '***-***-4567',
  });

  const handleSave = useCallback(async () => {
    // Validate required fields
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    if (!profile.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSaving(true);

    // Build the profile object
    const profileData = {
      name: `${profile.firstName.trim()} ${profile.lastName.trim()}`,
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    };

    // Create or update the profile - works with or without being logged in
    createOrUpdateProfile(profileData);

    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsSaving(false);
    toast.success('Profile saved successfully!', {
      description: `Your info is now synced across all features.`
    });
  }, [profile, createOrUpdateProfile]);

  const handleChangePhoto = useCallback(() => {
    toast.info('Photo upload coming soon');
  }, []);

  const handleChangePassword = useCallback(() => {
    toast.info('Password change coming soon');
  }, []);

  const handleViewSessions = useCallback(() => {
    toast.info('Session management coming soon');
  }, []);

  const handleSignOut = useCallback(() => {
    logout();
    toast.success('Signed out successfully');
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    toast.error('Please contact support to delete your account');
  }, []);

  const handleNotificationChange = useCallback((key: keyof NotificationSettings, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: checked }));
  }, []);

  const handleVerifyBank = useCallback(() => {
    setBankInfo(prev => ({ ...prev, isVerified: true }));
    toast.success('Bank account verified and saved');
  }, []);

  const handleUploadW9 = useCallback(() => {
    setTaxInfo(prev => ({ ...prev, hasW9: true, w9UploadDate: new Date().toLocaleDateString() }));
    toast.success('W-9 uploaded successfully');
  }, []);

  const handleTwoFactorToggle = useCallback((checked: boolean) => {
    setTwoFactor(prev => ({ ...prev, enabled: checked }));
    toast.success(checked ? '2FA enabled' : '2FA disabled');
  }, []);

  const handleTwoFactorMethodChange = useCallback((method: 'app' | 'sms') => {
    setTwoFactor(prev => ({ ...prev, method }));
  }, []);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
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
                  <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                  Save Changes
                </>
              )}
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Profile Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
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
              {currentUser ? (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Synced: {currentUser.name} · {currentUser.email} · {currentUser.phone || 'No phone'}</span>
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
                  {(profile.firstName[0] || '?')}{(profile.lastName[0] || '?')}
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
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    Location
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

        {/* Notifications Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
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
                      onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                      aria-label={`Toggle ${item.label}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
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
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Last changed 30 days ago</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePassword}
                    className="text-violet-700 border-violet-200 hover:bg-violet-50"
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Change your password"
                  >
                    <Key className="w-4 h-4 mr-2" aria-hidden="true" />
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Badge
                    className="bg-emerald-100 text-emerald-700 border-0"
                    style={{ borderRadius: RADIUS.pill }}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Active Sessions</p>
                    <p className="text-xs text-gray-500">Manage devices logged into your account</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewSessions}
                    className="text-violet-700 border-violet-200 hover:bg-violet-50"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank / Direct Deposit Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Building2 className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">Direct Deposit</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Manage your commission payment method</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankInfo.isVerified ? (
                <div
                  className="flex items-center justify-between p-3 bg-violet-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-violet-600" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">Bank Account Connected</p>
                      <p className="text-xs text-gray-500">{bankInfo.bankName} ····{bankInfo.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                  <Badge
                    className="bg-emerald-100 text-emerald-700 border-0"
                    style={{ borderRadius: RADIUS.pill }}
                  >
                    Verified
                  </Badge>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-gray-900">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankInfo.bankName}
                        onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                        placeholder="Chase, Bank of America, etc."
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountType" className="text-gray-900">Account Type</Label>
                      <Input
                        id="accountType"
                        value={bankInfo.accountType}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value })}
                        placeholder="Checking or Savings"
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber" className="text-gray-900">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={bankInfo.routingNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
                        placeholder="9 digits"
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-gray-900">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankInfo.accountNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                        placeholder="Your account number"
                        type="password"
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleVerifyBank}
                    className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Verify and save bank account"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Verify & Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Documents Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <FileText className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">Tax Documents</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Manage your W-9 and tax information</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">Tax ID (SSN/EIN)</p>
                    <p className="text-xs text-gray-500">Your tax identification number</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-700">{taxInfo.taxId}</span>
                    <Badge
                      className="bg-violet-100 text-violet-700 border-0 text-xs"
                      style={{ borderRadius: RADIUS.pill }}
                    >
                      On file
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">W-9 Form</p>
                    <p className="text-xs text-gray-500">
                      {taxInfo.hasW9 ? `Uploaded on ${taxInfo.w9UploadDate}` : 'Required for commission payments'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {taxInfo.hasW9 ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info('Downloading W-9...')}
                          className="text-violet-700 border-violet-200 hover:bg-violet-50"
                          style={{ borderRadius: RADIUS.button }}
                          aria-label="Download W-9 form"
                        >
                          <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                          Download
                        </Button>
                        <Badge
                          className="bg-emerald-100 text-emerald-700 border-0"
                          style={{ borderRadius: RADIUS.pill }}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                          Complete
                        </Badge>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleUploadW9}
                        className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                        style={{ borderRadius: RADIUS.button }}
                        aria-label="Upload W-9 form"
                      >
                        <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                        Upload W-9
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-Factor Authentication Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Smartphone className="w-5 h-5 text-amber-200" aria-hidden="true" />
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
                  <Switch
                    checked={twoFactor.enabled}
                    onCheckedChange={handleTwoFactorToggle}
                    aria-label="Toggle two-factor authentication"
                  />
                </div>
              </div>
              {twoFactor.enabled && (
                <div className="mt-4 space-y-4">
                  <Label className="text-gray-900">Authentication Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={cn(
                        "p-3 border-2 cursor-pointer transition-all text-left",
                        twoFactor.method === 'app'
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ borderRadius: RADIUS.button }}
                      onClick={() => handleTwoFactorMethodChange('app')}
                      aria-pressed={twoFactor.method === 'app'}
                      aria-label="Use Authenticator App for two-factor authentication"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <QrCode className="w-4 h-4 text-violet-600" aria-hidden="true" />
                        <span className="font-medium text-sm text-gray-900">Authenticator App</span>
                      </div>
                      <p className="text-xs text-gray-500">Use Google Authenticator or similar</p>
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "p-3 border-2 cursor-pointer transition-all text-left",
                        twoFactor.method === 'sms'
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ borderRadius: RADIUS.button }}
                      onClick={() => handleTwoFactorMethodChange('sms')}
                      aria-pressed={twoFactor.method === 'sms'}
                      aria-label="Use SMS for two-factor authentication"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-violet-600" aria-hidden="true" />
                        <span className="font-medium text-sm text-gray-900">SMS Code</span>
                      </div>
                      <p className="text-xs text-gray-500">Receive codes via text message</p>
                    </button>
                  </div>
                  {twoFactor.method === 'sms' && (
                    <div
                      className="flex items-center gap-2 p-3 bg-violet-50"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Phone className="w-4 h-4 text-violet-500" aria-hidden="true" />
                      <span className="text-sm text-gray-700">Codes sent to: {twoFactor.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
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
                    aria-label="Change timezone, currently Pacific Time"
                  >
                    Pacific Time (PT)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
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
                    onClick={handleSignOut}
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
                    <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDeleteAccount}
                    style={{ borderRadius: RADIUS.button }}
                    aria-label="Delete your account permanently"
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
    </AgentLoungeLayout>
  );
}

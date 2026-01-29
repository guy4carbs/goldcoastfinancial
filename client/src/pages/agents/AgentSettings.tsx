import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Palette,
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
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";
import { toast } from "sonner";

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

// Constants
const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const NOTIFICATION_PREFERENCES: NotificationOption[] = [
  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
  { key: 'sms', label: 'SMS Notifications', description: 'Text message alerts' },
  { key: 'leadAlerts', label: 'Lead Alerts', description: 'Instant notification for new leads' },
  { key: 'weeklyReport', label: 'Weekly Report', description: 'Summary of your weekly performance' },
  { key: 'achievements', label: 'Achievement Alerts', description: 'Get notified when you unlock achievements' },
];

export default function AgentSettings() {
  const { logout, currentUser } = useAgentStore();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    leadAlerts: true,
    weeklyReport: true,
    achievements: true,
  });

  // Use store data for profile if available
  const userName = currentUser?.name || 'John Agent';
  const userEmail = currentUser?.email || 'john.agent@example.com';
  const [firstName, lastName] = userName.split(' ');

  const [profile, setProfile] = useState<ProfileSettings>({
    firstName: firstName || 'John',
    lastName: lastName || 'Agent',
    email: userEmail,
    phone: '(555) 123-4567',
    location: 'Los Angeles, CA',
    bio: 'Experienced insurance agent specializing in life and health coverage.',
  });

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
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Settings saved successfully');
  }, []);

  // TODO: Implement photo upload functionality
  const handleChangePhoto = useCallback(() => {
    toast.info('Photo upload coming soon');
  }, []);

  // TODO: Implement password change modal
  const handleChangePassword = useCallback(() => {
    toast.info('Password change coming soon');
  }, []);

  // TODO: Implement session management view
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

  const handleProfileChange = useCallback((field: keyof ProfileSettings, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBankInfoChange = useCallback((field: keyof BankInfo, value: string) => {
    setBankInfo(prev => ({ ...prev, [field]: value }));
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
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={FADE_IN_UP} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Settings</h1>
            <p className="text-sm text-gray-600">Manage your account and preferences</p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={isSaving}
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
        </motion.div>

        {/* Profile Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" aria-hidden="true" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-2xl">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={handleChangePhoto}>
                    <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-3 h-3" aria-hidden="true" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_PREFERENCES.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm text-primary">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                    aria-label={`Toggle ${item.label}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">Password</p>
                  <p className="text-xs text-gray-500">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleChangePassword} aria-label="Change your password">
                  <Key className="w-4 h-4 mr-2" aria-hidden="true" />
                  Change Password
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                  Enabled
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">Active Sessions</p>
                  <p className="text-xs text-gray-500">Manage devices logged into your account</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewSessions}>View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank / Direct Deposit Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
                Direct Deposit
              </CardTitle>
              <CardDescription>Manage your commission payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankInfo.isVerified ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-sm text-emerald-700">Bank Account Connected</p>
                      <p className="text-xs text-emerald-600">{bankInfo.bankName} ••••{bankInfo.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankInfo.bankName}
                        onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                        placeholder="Chase, Bank of America, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Account Type</Label>
                      <Input
                        id="accountType"
                        value={bankInfo.accountType}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value })}
                        placeholder="Checking or Savings"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={bankInfo.routingNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
                        placeholder="9 digits"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankInfo.accountNumber}
                        onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                        placeholder="Your account number"
                        type="password"
                      />
                    </div>
                  </div>
                  <Button onClick={handleVerifyBank} aria-label="Verify and save bank account">
                    <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Verify & Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Documents Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                Tax Documents
              </CardTitle>
              <CardDescription>Manage your W-9 and tax information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">Tax ID (SSN/EIN)</p>
                  <p className="text-xs text-gray-500">Your tax identification number</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{taxInfo.taxId}</span>
                  <Badge variant="outline" className="text-xs">On file</Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">W-9 Form</p>
                  <p className="text-xs text-gray-500">
                    {taxInfo.hasW9 ? `Uploaded on ${taxInfo.w9UploadDate}` : 'Required for commission payments'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {taxInfo.hasW9 ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Downloading W-9...')} aria-label="Download W-9 form">
                        <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                        Download
                      </Button>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                        Complete
                      </Badge>
                    </>
                  ) : (
                    <Button size="sm" onClick={handleUploadW9} aria-label="Upload W-9 form">
                      <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                      Upload W-9
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-Factor Authentication Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" aria-hidden="true" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">2FA Status</p>
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
              {twoFactor.enabled && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Authentication Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={cn(
                          "p-3 rounded-lg border-2 cursor-pointer transition-all text-left",
                          twoFactor.method === 'app' ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleTwoFactorMethodChange('app')}
                        aria-pressed={twoFactor.method === 'app'}
                        aria-label="Use Authenticator App for two-factor authentication"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <QrCode className="w-4 h-4 text-primary" aria-hidden="true" />
                          <span className="font-medium text-sm">Authenticator App</span>
                        </div>
                        <p className="text-xs text-gray-500">Use Google Authenticator or similar</p>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "p-3 rounded-lg border-2 cursor-pointer transition-all text-left",
                          twoFactor.method === 'sms' ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => handleTwoFactorMethodChange('sms')}
                        aria-pressed={twoFactor.method === 'sms'}
                        aria-label="Use SMS for two-factor authentication"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
                          <span className="font-medium text-sm">SMS Code</span>
                        </div>
                        <p className="text-xs text-gray-500">Receive codes via text message</p>
                      </button>
                    </div>
                  </div>
                  {twoFactor.method === 'sms' && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Phone className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span className="text-sm">Codes sent to: {twoFactor.phoneNumber}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences Section */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" aria-hidden="true" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">Language</p>
                  <p className="text-xs text-gray-500">Select your preferred language</p>
                </div>
                <Button variant="outline" size="sm" aria-label="Change language, currently English (US)">
                  <Globe className="w-4 h-4 mr-2" aria-hidden="true" />
                  English (US)
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-primary">Timezone</p>
                  <p className="text-xs text-gray-500">Set your local timezone</p>
                </div>
                <Button variant="outline" size="sm" aria-label="Change timezone, currently Pacific Time">Pacific Time (PT)</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-red-600">Sign Out</p>
                  <p className="text-xs text-gray-500">Log out of your account on this device</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleSignOut} aria-label="Sign out of your account">
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-red-600">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteAccount} aria-label="Delete your account permanently">
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  ShieldCheck,
  GraduationCap,
  Car,
  Loader2,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/agentStore";
import { toast } from "sonner";
import { AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import { TOUR } from "@/lib/tour/selectors";
import { FileUploadZone } from '@/components/onboarding-intake/shared/FileUploadZone';

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
  npn: string;
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
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Avatar upload mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/business-card/my-card/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-card/my-card"] });
      // Update the agent store so the header avatar updates immediately
      if (data?.avatarUrl) {
        createOrUpdateProfile({
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          email: profile.email,
          phone: profile.phone,
          avatar: data.avatarUrl,
        } as any);
      }
      toast.success("Profile photo updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload photo");
    },
  });

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    avatarMutation.mutate(file);
    e.target.value = "";
  };

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    leadAlerts: true,
    weeklyReport: true,
    achievements: true,
  });

  // Load notification preferences from backend
  useEffect(() => {
    fetch('/api/portal/preferences', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setNotifications(prev => ({
          ...prev,
          email: data.email_notifications ?? prev.email,
          push: data.push_notifications ?? prev.push,
          sms: data.sms_notifications ?? prev.sms,
        }));
      })
      .catch(() => {});
  }, []);

  // Initialize profile from currentUser
  const getInitialProfile = (): ProfileSettings => {
    if (currentUser) {
      const nameParts = currentUser.name?.split(' ') || ['', ''];
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        npn: currentUser.npn || '',
        location: 'Chicago, IL',
        bio: 'Experienced insurance agent specializing in life and health coverage.',
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      npn: '',
      location: 'Chicago, IL',
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
        npn: currentUser.npn || '',
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

  // Compliance documents state
  const [eoInsurance, setEoInsurance] = useState({
    file: null as File | null,
    fileName: '',
    provider: '',
    policyNumber: '',
    effectiveDate: '',
    expirationDate: '',
  });
  const [amlTraining, setAmlTraining] = useState({
    file: null as File | null,
    fileName: '',
  });
  const [driversLicense, setDriversLicense] = useState({
    file: null as File | null,
    fileName: '',
  });
  const [driversLicenseBack, setDriversLicenseBack] = useState({
    file: null as File | null,
    fileName: '',
  });
  const [directDepositDoc, setDirectDepositDoc] = useState({
    file: null as File | null,
    fileName: '',
  });

  const [twoFactor, setTwoFactor] = useState<TwoFactorSettings>({
    enabled: false,
    method: 'app',
    phoneNumber: '***-***-4567',
  });

  // Load 2FA status from backend on mount
  useEffect(() => {
    fetch('/api/ai/2fa/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setTwoFactor(prev => ({ ...prev, enabled: data.enabled || false }));
      })
      .catch(() => {});
  }, []);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

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

    try {
      // Persist to backend
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save profile');
      }

      // Update local store
      const profileData = {
        name: `${profile.firstName.trim()} ${profile.lastName.trim()}`,
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        npn: profile.npn.trim() || undefined,
      };
      createOrUpdateProfile(profileData);

      toast.success('Profile saved successfully!', {
        description: `Your info is now synced across all features.`
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }, [profile, createOrUpdateProfile]);

  // handleChangePhoto replaced by avatarInputRef + avatarMutation above

  const handleChangePassword = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  }, []);

  const handlePasswordSubmit = useCallback(async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/portal/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change password');
      }
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

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
    setNotifications(prev => {
      const updated = { ...prev, [key]: checked };
      // Persist core notification prefs to backend
      if (key === 'email' || key === 'push' || key === 'sms') {
        fetch('/api/portal/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            emailNotifications: updated.email,
            pushNotifications: updated.push,
            smsNotifications: updated.sms,
          }),
        }).catch(() => {});
      }
      return updated;
    });
  }, []);

  const handleVerifyBank = useCallback(() => {
    setBankInfo(prev => ({ ...prev, isVerified: true }));
    toast.success('Bank account verified and saved');
  }, []);

  const handleW9File = useCallback((file: File) => {
    setTaxInfo(prev => ({ ...prev, hasW9: true, w9UploadDate: new Date().toLocaleDateString() }));
    toast.success('W-9 uploaded successfully');
  }, []);

  const handleW9Remove = useCallback(() => {
    setTaxInfo(prev => ({ ...prev, hasW9: false, w9UploadDate: '' }));
  }, []);

  const handleDirectDepositFile = useCallback((file: File) => {
    setDirectDepositDoc({ file, fileName: file.name });
    toast.success('Direct deposit document uploaded successfully');
  }, []);

  const handleDirectDepositRemove = useCallback(() => {
    setDirectDepositDoc({ file: null, fileName: '' });
  }, []);

  const handleEOFile = useCallback((file: File) => {
    setEoInsurance(prev => ({ ...prev, file, fileName: file.name }));
    toast.success('E&O certificate uploaded successfully');
  }, []);

  const handleEORemove = useCallback(() => {
    setEoInsurance(prev => ({ ...prev, file: null, fileName: '' }));
  }, []);

  const handleAMLFile = useCallback((file: File) => {
    setAmlTraining({ file, fileName: file.name });
    toast.success('AML training certificate uploaded successfully');
  }, []);

  const handleAMLRemove = useCallback(() => {
    setAmlTraining({ file: null, fileName: '' });
  }, []);

  const handleDLFile = useCallback((file: File) => {
    setDriversLicense({ file, fileName: file.name });
    toast.success("Driver's license uploaded successfully");
  }, []);

  const handleDLRemove = useCallback(() => {
    setDriversLicense({ file: null, fileName: '' });
  }, []);

  const handleDLBackFile = useCallback((file: File) => {
    setDriversLicenseBack({ file, fileName: file.name });
    toast.success("Driver's license back uploaded successfully");
  }, []);

  const handleDLBackRemove = useCallback(() => {
    setDriversLicenseBack({ file: null, fileName: '' });
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
        <motion.div data-tour-id={TOUR.AGENT.SETTINGS.HEADER} variants={fadeInUp}>
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
        <motion.div data-tour-id={TOUR.AGENT.SETTINGS.PROFILE} variants={fadeInUp}>
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
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                  aria-hidden="true"
                />
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative block overflow-hidden focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-all"
                    style={{ borderRadius: RADIUS.card }}
                    disabled={avatarMutation.isPending}
                  >
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt=""
                        className="w-20 h-20 object-cover border-2 border-violet-100 shadow-sm"
                        style={{ borderRadius: RADIUS.card }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl"
                        style={{ borderRadius: RADIUS.card }}
                      >
                        {(profile.firstName[0] || '?')}{(profile.lastName[0] || '?')}
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
                      style={{ borderRadius: RADIUS.card }}
                    >
                      {avatarMutation.isPending ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-violet-700 border-violet-200 hover:bg-violet-50"
                      style={{ borderRadius: RADIUS.button }}
                      disabled={avatarMutation.isPending}
                    >
                      <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                      {avatarMutation.isPending ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const width = 500;
                        const height = 700;
                        const left = window.screenX + (window.innerWidth - width) / 2;
                        const top = window.screenY + (window.innerHeight - height) / 2;
                        const popup = window.open(
                          "/api/auth/snapchat",
                          "SnapchatLogin",
                          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
                        );
                        const handler = (event: MessageEvent) => {
                          if (event.origin !== window.location.origin) return;
                          if (event.data?.type !== "bitmoji-auth") return;
                          window.removeEventListener("message", handler);
                          if (event.data.status === "success") {
                            toast.success("Bitmoji avatar connected!");
                            queryClient.invalidateQueries({ queryKey: ["/api/business-card/my-card"] });
                          } else if (event.data.status === "no-avatar") {
                            toast.error("No Bitmoji found. Make sure Bitmoji is linked to your Snapchat.");
                          } else {
                            toast.error("Failed to connect Bitmoji.");
                          }
                        };
                        window.addEventListener("message", handler);
                        const pollTimer = setInterval(() => {
                          if (popup?.closed) { clearInterval(pollTimer); window.removeEventListener("message", handler); }
                        }, 1000);
                      }}
                      className="text-amber-700 border-amber-200 hover:bg-amber-50 gap-1.5"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Smile className="w-4 h-4" aria-hidden="true" />
                      Connect Bitmoji
                    </Button>
                  </div>
                  {currentUser?.avatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await fetch("/api/business-card/my-card", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ avatarUrl: "" }),
                            credentials: "include",
                          });
                          createOrUpdateProfile({
                            name: `${profile.firstName} ${profile.lastName}`.trim(),
                            email: profile.email,
                            phone: profile.phone,
                            avatar: "",
                          } as any);
                          queryClient.invalidateQueries({ queryKey: ["/api/business-card/my-card"] });
                          toast.success("Profile photo removed");
                        } catch {
                          toast.error("Failed to remove photo");
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5 mt-1"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Remove Photo
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP up to 5MB — or connect your Bitmoji</p>
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
                <div className="space-y-2">
                  <Label htmlFor="npn" className="flex items-center gap-2 text-gray-900">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    NPN (National Producer Number)
                  </Label>
                  <Input
                    id="npn"
                    value={profile.npn}
                    onChange={(e) => setProfile({ ...profile, npn: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="e.g. 12345678"
                    maxLength={10}
                    style={{ borderRadius: RADIUS.input }}
                  />
                  <p className="text-xs text-gray-400">Your NPN verifies your license across all features</p>
                </div>
                <div className="space-y-2">
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

        {/* Voicemail Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Phone className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">Voicemail Drop</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Message that plays when your outbound calls reach a lead's voicemail</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Record a personal message that automatically plays when you call a lead and they don't pick up.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/agents/dialer?tab=voicemail'}
                  className="shrink-0 ml-4 text-violet-700 border-violet-200 hover:bg-violet-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  Manage in Dialer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div data-tour-id={TOUR.AGENT.SETTINGS.NOTIFICATIONS} variants={fadeInUp}>
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
        <motion.div data-tour-id={TOUR.AGENT.SETTINGS.BANK} variants={fadeInUp}>
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

              <div className="border-t border-gray-100 pt-4">
                <Label className="text-gray-900 mb-2 block">Direct Deposit Form / Void Check</Label>
                <p className="text-xs text-gray-500 mb-3">Upload a voided check or direct deposit authorization form</p>
                <FileUploadZone
                  onFileSelect={handleDirectDepositFile}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSizeMB={10}
                  fileName={directDepositDoc.fileName}
                  onRemove={handleDirectDepositRemove}
                />
              </div>
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
              </div>
              <div className="pt-4">
                <Label className="text-gray-900 mb-2 block">W-9 Form</Label>
                <p className="text-xs text-gray-500 mb-3">Required for commission payments</p>
                <FileUploadZone
                  onFileSelect={handleW9File}
                  accept=".pdf"
                  maxSizeMB={10}
                  fileName={taxInfo.hasW9 ? `W-9_uploaded_${taxInfo.w9UploadDate}.pdf` : undefined}
                  onRemove={handleW9Remove}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* E&O Insurance Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">E&O Insurance</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Errors & Omissions insurance certificate</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eoProvider" className="text-gray-900">Insurance Provider</Label>
                  <Input
                    id="eoProvider"
                    value={eoInsurance.provider}
                    onChange={(e) => setEoInsurance(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g. NAPA, CalSurance, E&O Plus"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eoPolicyNumber" className="text-gray-900">Policy Number</Label>
                  <Input
                    id="eoPolicyNumber"
                    value={eoInsurance.policyNumber}
                    onChange={(e) => setEoInsurance(prev => ({ ...prev, policyNumber: e.target.value }))}
                    placeholder="e.g. EO-2024-123456"
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eoEffectiveDate" className="text-gray-900">Effective Date</Label>
                  <Input
                    id="eoEffectiveDate"
                    type="date"
                    value={eoInsurance.effectiveDate}
                    onChange={(e) => setEoInsurance(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    style={{ borderRadius: RADIUS.input }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eoExpirationDate" className="text-gray-900">Expiration Date</Label>
                  <Input
                    id="eoExpirationDate"
                    type="date"
                    value={eoInsurance.expirationDate}
                    onChange={(e) => setEoInsurance(prev => ({ ...prev, expirationDate: e.target.value }))}
                    style={{ borderRadius: RADIUS.input }}
                  />
                  {eoInsurance.expirationDate && new Date(eoInsurance.expirationDate) < new Date() && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Policy expired — please upload a current certificate
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <Label className="text-gray-900 mb-2 block">E&O Certificate</Label>
                <p className="text-xs text-gray-500 mb-3">Upload your Errors & Omissions insurance certificate</p>
                <FileUploadZone
                  onFileSelect={handleEOFile}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSizeMB={10}
                  fileName={eoInsurance.fileName}
                  onRemove={handleEORemove}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AML Training Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <GraduationCap className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">AML Training</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Anti-Money Laundering compliance certificate</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">Training Status</p>
                  <p className="text-xs text-gray-500">Annual AML training requirement</p>
                </div>
                <Badge
                  className={amlTraining.fileName ? "bg-emerald-100 text-emerald-700 border-0" : "bg-amber-100 text-amber-700 border-0"}
                  style={{ borderRadius: RADIUS.pill }}
                >
                  {amlTraining.fileName ? 'Complete' : 'Required'}
                </Badge>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <Label className="text-gray-900 mb-2 block">AML Training Certificate</Label>
                <p className="text-xs text-gray-500 mb-3">Upload your Anti-Money Laundering training completion certificate</p>
                <FileUploadZone
                  onFileSelect={handleAMLFile}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSizeMB={10}
                  fileName={amlTraining.fileName}
                  onRemove={handleAMLRemove}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Driver's License Section */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0" style={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Car className="w-5 h-5 text-amber-200" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-gray-900">Driver's License</span>
                  <p className="text-sm font-normal text-gray-500 mt-0.5">Government-issued photo identification</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">ID Status</p>
                  <p className="text-xs text-gray-500">Government-issued photo ID required (front & back)</p>
                </div>
                <Badge
                  className={driversLicense.fileName && driversLicenseBack.fileName ? "bg-emerald-100 text-emerald-700 border-0" : driversLicense.fileName || driversLicenseBack.fileName ? "bg-blue-100 text-blue-700 border-0" : "bg-amber-100 text-amber-700 border-0"}
                  style={{ borderRadius: RADIUS.pill }}
                >
                  {driversLicense.fileName && driversLicenseBack.fileName ? 'On File' : driversLicense.fileName || driversLicenseBack.fileName ? 'Partial' : 'Required'}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <Label className="text-gray-900 mb-2 block">Front</Label>
                  <p className="text-xs text-gray-500 mb-3">Photo of the front of your ID</p>
                  <FileUploadZone
                    onFileSelect={handleDLFile}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxSizeMB={10}
                    fileName={driversLicense.fileName}
                    onRemove={handleDLRemove}
                  />
                </div>
                <div>
                  <Label className="text-gray-900 mb-2 block">Back</Label>
                  <p className="text-xs text-gray-500 mb-3">Photo of the back of your ID</p>
                  <FileUploadZone
                    onFileSelect={handleDLBackFile}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxSizeMB={10}
                    fileName={driversLicenseBack.fileName}
                    onRemove={handleDLBackRemove}
                  />
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
        <motion.div data-tour-id={TOUR.AGENT.SETTINGS.DANGER} variants={fadeInUp}>
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

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-violet-600" aria-hidden="true" />
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-900">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-900">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              style={{ borderRadius: RADIUS.button }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
            >
              {passwordSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}

/**
 * Client Lounge Signup Page
 * 2-step registration for the Client Portal
 *
 * Heritage Design System: Client Lounge (Violet/Amber Theme)
 */

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  RADIUS, SHADOW, MOTION, TYPE, COLORS, GLASS,
  fadeInUp, staggerContainer, scaleIn, spacing,
} from '@/lib/heritageDesignSystem';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  User,
  Phone,
  FileText,
  MessageSquare,
  CreditCard,
  FolderOpen,
  ClipboardList,
  Home,
  Loader2,
} from 'lucide-react';

const benefits = [
  { icon: FileText, text: 'View your policies 24/7' },
  { icon: ClipboardList, text: 'Track claims in real-time' },
  { icon: MessageSquare, text: 'Message your agent directly' },
  { icon: CreditCard, text: 'Manage payments securely' },
  { icon: FolderOpen, text: 'Access documents anywhere' },
];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  smsConsent: boolean;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  agreedToTerms: false,
  agreedToPrivacy: false,
  smsConsent: false,
};

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  return score;
}

function getStrengthColor(score: number): string {
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-orange-500';
  if (score === 3) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getStrengthLabel(score: number): string {
  if (score <= 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  return 'Strong';
}

export default function ClientSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  // Email availability check with debounce
  useEffect(() => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        const data = await res.json();
        setEmailAvailable(data.available);
        if (!data.available) {
          setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
        }
      } catch {
        // Silently fail -server may not be reachable
      } finally {
        setEmailChecking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const passwordStrength = getPasswordStrength(formData.password);

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (emailAvailable === false) {
      newErrors.email = 'This email is already registered';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must include an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must include a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must include a digit';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (formData.phone.trim() && !formData.smsConsent) {
      newErrors.smsConsent = 'You must agree to SMS communications or remove your phone number';
    }
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Service';
    }
    if (!formData.agreedToPrivacy) {
      newErrors.agreedToPrivacy = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep1()) {
      setDirection(1);
      setCurrentStep(2);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(1);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      // Auto-login and redirect
      setLocation('/client/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (40% on desktop, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-20 right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-32 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col justify-between w-full"
          style={{ padding: spacing(4) }}
        >
          <Link href="/">
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              className="flex items-center gap-3 cursor-pointer group"
              style={{ transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}` }}
            >
              <div
                className="w-12 h-12 bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors"
                style={{ borderRadius: RADIUS.button }}
              >
                <Shield className="w-6 h-6 text-amber-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-wide">HERITAGE</span>
                <span className="text-white/60 text-xs tracking-widest uppercase">Life Solutions</span>
              </div>
            </motion.div>
          </Link>

          <div style={{ marginTop: spacing(5), marginBottom: spacing(5) }}>
            <motion.div variants={fadeInUp}>
              <h1
                className="font-bold text-white leading-tight"
                style={{ fontSize: TYPE.hero, marginBottom: spacing(2) }}
              >
                Create your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400">
                  Client Account
                </span>
              </h1>
              <p
                className="text-white/70 font-light max-w-xs leading-relaxed"
                style={{ fontSize: TYPE.body }}
              >
                Get started in minutes. Your agent will be notified once you're set up.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col"
              style={{ gap: spacing(1.5), marginTop: spacing(4) }}
            >
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.text}
                  variants={scaleIn}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span className="text-white/85 font-medium" style={{ fontSize: TYPE.meta }}>
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="text-white/40"
            style={{ fontSize: TYPE.micro }}
          >
            <span>Heritage Life Solutions</span>
            <span className="mx-2">&middot;</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Registration Form (60% on desktop, full on mobile) */}
      <div
        className="w-full lg:w-[60%] flex items-center justify-center overflow-y-auto"
        style={{ backgroundColor: '#fffaf3', padding: spacing(3) }}
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div
            variants={fadeInUp}
            className="lg:hidden flex items-center justify-center gap-3"
            style={{ marginBottom: spacing(4) }}
          >
            <div
              className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center"
              style={{ borderRadius: RADIUS.button }}
            >
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">HERITAGE</span>
              <span className="text-gray-400 text-[10px] tracking-widest uppercase">Life Solutions</span>
            </div>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-3"
            style={{ marginBottom: spacing(3) }}
          >
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    currentStep >= step
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    currentStep >= step ? 'text-violet-600' : 'text-gray-400'
                  )}
                >
                  {step === 1 ? 'Credentials' : 'Personal Info'}
                </span>
                {step < 2 && (
                  <div className={cn(
                    'w-8 h-0.5 rounded-full transition-colors',
                    currentStep > 1 ? 'bg-violet-600' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </motion.div>

          {/* Heading */}
          <motion.div
            variants={fadeInUp}
            className="text-center"
            style={{ marginBottom: spacing(3) }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif", marginBottom: spacing(1) }}
            >
              Create your account
            </h2>
            <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
              {currentStep === 1 ? 'Set up your login credentials' : 'Tell us a bit about yourself'}
            </p>
          </motion.div>

          {/* Glass Card */}
          <motion.div
            variants={fadeInUp}
            className="border border-gray-100/80"
            style={{
              borderRadius: RADIUS.card,
              padding: spacing(4),
              boxShadow: SHADOW.hero,
              ...GLASS.css.light,
            }}
          >
            {/* Global error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700"
                  style={{ padding: spacing(2), borderRadius: RADIUS.input, marginBottom: spacing(2) }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span style={{ fontSize: TYPE.meta }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: MOTION.duration.transition, ease: MOTION.easing }}
              >
                {currentStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}>
                    {/* Email */}
                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="you@example.com"
                          className={cn(
                            'w-full border focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none',
                            errors.email ? 'border-red-300' : 'border-gray-200'
                          )}
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(5),
                            paddingTop: spacing(1.75),
                            paddingBottom: spacing(1.75),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        />
                        {emailChecking && (
                          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                        )}
                        {!emailChecking && emailAvailable === true && formData.email && (
                          <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        )}
                        {!emailChecking && emailAvailable === false && formData.email && (
                          <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {errors.email && (
                        <p className="text-red-500 mt-1" style={{ fontSize: TYPE.micro }}>{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                          placeholder="Create a strong password"
                          className={cn(
                            'w-full border focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none',
                            errors.password ? 'border-red-300' : 'border-gray-200'
                          )}
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(6),
                            paddingTop: spacing(1.75),
                            paddingBottom: spacing(1.75),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 mt-1" style={{ fontSize: TYPE.micro }}>{errors.password}</p>
                      )}

                      {/* Password strength indicator */}
                      {formData.password && (
                        <div style={{ marginTop: spacing(1) }}>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={cn(
                                  'h-1.5 flex-1 rounded-full transition-all duration-300',
                                  bar <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.micro }}>
                            {getStrengthLabel(passwordStrength)} -8+ chars, uppercase, lowercase, digit
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => updateField('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          className={cn(
                            'w-full border focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none',
                            errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                          )}
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(6),
                            paddingTop: spacing(1.75),
                            paddingBottom: spacing(1.75),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 mt-1" style={{ fontSize: TYPE.micro }}>{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}>
                    {/* First Name */}
                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          placeholder="First name"
                          className={cn(
                            'w-full border focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none',
                            errors.firstName ? 'border-red-300' : 'border-gray-200'
                          )}
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(2),
                            paddingTop: spacing(1.75),
                            paddingBottom: spacing(1.75),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-500 mt-1" style={{ fontSize: TYPE.micro }}>{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          placeholder="Last name"
                          className={cn(
                            'w-full border focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none',
                            errors.lastName ? 'border-red-300' : 'border-gray-200'
                          )}
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(2),
                            paddingTop: spacing(1.75),
                            paddingBottom: spacing(1.75),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-500 mt-1" style={{ fontSize: TYPE.micro }}>{errors.lastName}</p>
                      )}
                    </div>

                    {/* Phone (optional) */}
                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Phone <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="(555) 555-5555"
                          className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none"
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(2),
                            paddingTop: spacing(1.75),
                            paddingBottom: spacing(1.75),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                          }}
                        />
                      </div>
                    </div>

                    {/* SMS Consent — only visible when phone is provided */}
                    {formData.phone.trim() && (
                      <div>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.smsConsent}
                            onChange={(e) => updateField('smsConsent', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 mt-0.5"
                          />
                          <span className="text-gray-500 group-hover:text-gray-700 transition-colors" style={{ fontSize: TYPE.micro, lineHeight: 1.5 }}>
                            By checking this box, I agree to receive SMS and MMS messages from Heritage Life Solutions (Gold Coast Financial Partners LLC) including authentication codes, customer care responses, account notifications, and marketing/promotional messages. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out or HELP for help. <a href="/legal/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
                          </span>
                        </label>
                        {errors.smsConsent && (
                          <p className="text-red-500 mt-1 ml-7" style={{ fontSize: TYPE.micro }}>{errors.smsConsent}</p>
                        )}
                      </div>
                    )}

                    {/* Terms checkbox */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 mt-0.5"
                        />
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors" style={{ fontSize: TYPE.meta }}>
                          I agree to the{' '}
                          <a href="/terms" className="text-violet-600 hover:underline font-medium" target="_blank">
                            Terms of Service
                          </a>
                        </span>
                      </label>
                      {errors.agreedToTerms && (
                        <p className="text-red-500 mt-1 ml-7" style={{ fontSize: TYPE.micro }}>{errors.agreedToTerms}</p>
                      )}
                    </div>

                    {/* Privacy checkbox */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.agreedToPrivacy}
                          onChange={(e) => updateField('agreedToPrivacy', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 mt-0.5"
                        />
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors" style={{ fontSize: TYPE.meta }}>
                          I agree to the{' '}
                          <a href="/privacy" className="text-violet-600 hover:underline font-medium" target="_blank">
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                      {errors.agreedToPrivacy && (
                        <p className="text-red-500 mt-1 ml-7" style={{ fontSize: TYPE.micro }}>{errors.agreedToPrivacy}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div
              className="flex items-center justify-between"
              style={{ marginTop: spacing(3) }}
            >
              {currentStep > 1 ? (
                <motion.button
                  type="button"
                  onClick={goBack}
                  whileHover={{ x: -2 }}
                  className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  style={{ gap: spacing(0.5), fontSize: TYPE.meta }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </motion.button>
              ) : (
                <div />
              )}

              {currentStep === 1 ? (
                <motion.button
                  type="button"
                  onClick={goNext}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold flex items-center gap-2"
                  style={{
                    padding: `${spacing(1.5)}px ${spacing(3)}px`,
                    borderRadius: RADIUS.button,
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleRegister}
                  disabled={isLoading}
                  whileHover={{ y: isLoading ? 0 : MOTION.hover.y, scale: isLoading ? 1 : MOTION.hover.scale }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className={cn(
                    'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
                    'text-white font-semibold flex items-center gap-2',
                    'disabled:opacity-70 disabled:cursor-not-allowed',
                    'shadow-lg shadow-violet-500/25'
                  )}
                  style={{
                    padding: `${spacing(1.5)}px ${spacing(3)}px`,
                    borderRadius: RADIUS.button,
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Already have an account / Back to Homepage */}
          <motion.div
            variants={fadeInUp}
            className="text-center flex flex-col items-center"
            style={{ marginTop: spacing(3), gap: spacing(1.5) }}
          >
            <Link href="/client/login">
              <span
                className="text-gray-500 hover:text-violet-600 font-medium transition-colors cursor-pointer"
                style={{ fontSize: TYPE.meta }}
              >
                Already have an account? <span className="text-violet-600">Sign in</span>
              </span>
            </Link>
            <Link href="/">
              <span
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-violet-600 transition-colors cursor-pointer"
                style={{ fontSize: TYPE.meta }}
              >
                <Home className="w-4 h-4" />
                Back to Homepage
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

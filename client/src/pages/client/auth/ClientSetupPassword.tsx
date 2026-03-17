/**
 * Client Setup Password Page
 * Shown when a new client clicks the invite link from their welcome email
 * after their lead was converted to a client account.
 *
 * Route: /client/setup-password?token=XXX (public, no auth required)
 *
 * Heritage Design System: Client Lounge (Violet/Amber Theme)
 */

import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  RADIUS, SHADOW, MOTION, TYPE, GLASS,
  fadeInUp, staggerContainer, spacing,
} from '@/lib/heritageDesignSystem';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  Home,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
];

export default function ClientSetupPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isExpiredLink, setIsExpiredLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Extract token from URL
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  }, []);

  // Password validation state
  const requirementResults = useMemo(
    () => PASSWORD_REQUIREMENTS.map((req) => ({ ...req, met: req.test(password) })),
    [password],
  );

  const allRequirementsMet = requirementResults.every((r) => r.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsExpiredLink(false);

    // Client-side validation
    if (!token) {
      setError('Missing invite token. Please use the link from your welcome email.');
      return;
    }
    if (!allRequirementsMet) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || 'Failed to set up password';
        if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
          setIsExpiredLink(true);
        }
        throw new Error(msg);
      }

      // Success -- session created server-side, redirect to dashboard
      setLocation('/client/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 40%, #a855f7 70%, #f59e0b 100%)',
        padding: spacing(3),
      }}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-20 right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo / Brand */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-3"
          style={{ marginBottom: spacing(3) }}
        >
          <Link href="/">
            <span className="flex items-center gap-3 cursor-pointer group">
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
            </span>
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div
          variants={fadeInUp}
          className="text-center"
          style={{ marginBottom: spacing(3) }}
        >
          <h1
            className="font-bold text-white leading-tight"
            style={{ fontSize: TYPE.section, fontFamily: "'Playfair Display', serif", marginBottom: spacing(1) }}
          >
            Set Your Password
          </h1>
          <p className="text-white/70 font-light" style={{ fontSize: TYPE.body }}>
            Welcome! Set a secure password to access your client portal.
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          variants={fadeInUp}
          className="border border-white/10"
          style={{
            borderRadius: RADIUS.card,
            padding: spacing(4),
            boxShadow: SHADOW.hero,
            ...GLASS.css.light,
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}>
            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700"
                  style={{ padding: spacing(2), borderRadius: RADIUS.input }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div style={{ fontSize: TYPE.meta }}>
                    <span>{error}</span>
                    {isExpiredLink && (
                      <div className="mt-2 flex items-center gap-1.5 text-red-600">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">Contact your agent to resend the invite.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password field */}
            <div>
              <label
                className="block font-medium text-gray-700"
                style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white/80 hover:bg-white outline-none"
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
            </div>

            {/* Password requirements */}
            <div
              className="grid grid-cols-2 gap-x-3 gap-y-1.5"
              style={{ padding: `0 ${spacing(0.5)}px` }}
            >
              {requirementResults.map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  {password.length === 0 ? (
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    </div>
                  ) : req.met ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                      <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      password.length === 0
                        ? 'text-gray-400'
                        : req.met
                        ? 'text-emerald-600'
                        : 'text-red-500',
                    )}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm password field */}
            <div>
              <label
                className="block font-medium text-gray-700"
                style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={cn(
                    'w-full border focus:ring-2 focus:ring-violet-500/20 bg-white/80 hover:bg-white outline-none',
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400'
                      : confirmPassword.length > 0 && passwordsMatch
                      ? 'border-emerald-300 focus:border-emerald-400'
                      : 'border-gray-200 focus:border-violet-500',
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
              {/* Match indicator */}
              <AnimatePresence>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-500 mt-1"
                    style={{ fontSize: TYPE.caption }}
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              whileHover={{
                y: isLoading || !allRequirementsMet || !passwordsMatch ? 0 : MOTION.hover.y,
                scale: isLoading || !allRequirementsMet || !passwordsMatch ? 1 : MOTION.hover.scale,
              }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className={cn(
                'w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
                'text-white font-semibold flex items-center justify-center gap-2',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'shadow-lg shadow-violet-500/25',
              )}
              style={{
                height: 48,
                borderRadius: 16,
                marginTop: spacing(0.5),
                transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Create My Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative" style={{ marginTop: spacing(3), marginBottom: spacing(2) }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center" style={{ fontSize: TYPE.meta }}>
              <span className="px-4 text-gray-500" style={{ backgroundColor: GLASS.backgroundLight }}>
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link href="/client/login">
            <motion.button
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'w-full border-2 border-violet-600 text-violet-600',
                'hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white hover:border-transparent',
                'font-semibold flex items-center justify-center gap-2',
              )}
              style={{
                padding: `${spacing(1.75)}px ${spacing(3)}px`,
                borderRadius: RADIUS.button,
                transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
              }}
            >
              Sign In Instead
            </motion.button>
          </Link>
        </motion.div>

        {/* Back to Homepage */}
        <motion.div
          variants={fadeInUp}
          className="text-center"
          style={{ marginTop: spacing(3) }}
        >
          <Link href="/">
            <span
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white font-medium transition-colors cursor-pointer"
              style={{ fontSize: TYPE.meta }}
            >
              <Home className="w-4 h-4" />
              Back to Homepage
            </span>
          </Link>
        </motion.div>

        {/* Footer */}
        <div
          className="text-center text-white/40"
          style={{ fontSize: TYPE.micro, marginTop: spacing(3) }}
        >
          <span>Heritage Life Solutions</span>
          <span className="mx-2">&middot;</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved</span>
        </div>
      </motion.div>
    </div>
  );
}

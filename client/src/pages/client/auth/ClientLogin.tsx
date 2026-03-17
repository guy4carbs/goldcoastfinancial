/**
 * Client Lounge Login Page
 * Premium split-screen login for the Client Portal
 *
 * Heritage Design System: Client Lounge (Violet/Amber Theme)
 */

import { useState, FormEvent } from 'react';
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
  Check,
  AlertCircle,
  FileText,
  MessageSquare,
  CreditCard,
  FolderOpen,
  ClipboardList,
  Home,
} from 'lucide-react';

const benefits = [
  { icon: FileText, text: 'View your policies 24/7' },
  { icon: ClipboardList, text: 'Track claims in real-time' },
  { icon: MessageSquare, text: 'Message your agent directly' },
  { icon: CreditCard, text: 'Manage payments securely' },
  { icon: FolderOpen, text: 'Access documents anywhere' },
];

export default function ClientLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.user.role !== 'client') {
        throw new Error('This portal is for clients only. Please use the appropriate login.');
      }
      if (data.user.twoFactorEnabled) {
        setLocation('/client/2fa-verify');
      } else {
        setLocation('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (40% on desktop, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Floating decorative circles */}
          <div className="absolute top-20 right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-32 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col justify-center items-start w-full h-full"
          style={{ padding: spacing(5) }}
        >
          {/* Logo & Brand */}
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

          {/* Main Content */}
          <div style={{ marginTop: spacing(3) }}>
            <motion.div variants={fadeInUp}>
              <h1
                className="font-bold text-white leading-tight"
                style={{ fontSize: TYPE.hero, marginBottom: spacing(2) }}
              >
                Welcome to your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400">
                  Client Portal
                </span>
              </h1>
              <p
                className="text-white/70 font-light max-w-xs leading-relaxed"
                style={{ fontSize: TYPE.body }}
              >
                Manage your insurance policies, claims, and communications -all in one place.
              </p>
            </motion.div>

            {/* Benefits list */}
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

        </motion.div>

        {/* Footer -pinned to bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 text-white/40"
          style={{ fontSize: TYPE.micro, padding: spacing(4) }}
        >
          <span>Heritage Life Solutions</span>
          <span className="mx-2">&middot;</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved</span>
        </div>
      </div>

      {/* Right Panel - Login Form (60% on desktop, full on mobile) */}
      <div
        className="w-full lg:w-[60%] flex items-center justify-center"
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

          {/* Heading */}
          <motion.div
            variants={fadeInUp}
            className="text-center"
            style={{ marginBottom: spacing(4) }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif", marginBottom: spacing(1) }}
            >
              Sign in to your account
            </h2>
            <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
              Access your policies, claims, and more
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
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}>
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700"
                    style={{ padding: spacing(2), borderRadius: RADIUS.input }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span style={{ fontSize: TYPE.meta }}>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                  style={{ fontSize: TYPE.meta }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ y: isLoading ? 0 : MOTION.hover.y, scale: isLoading ? 1 : MOTION.hover.scale }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                className={cn(
                  'w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
                  'text-white font-semibold flex items-center justify-center gap-2',
                  'disabled:opacity-70 disabled:cursor-not-allowed',
                  'shadow-lg shadow-violet-500/25'
                )}
                style={{
                  height: 48,
                  borderRadius: 16,
                  transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative" style={{ marginTop: spacing(3.5), marginBottom: spacing(3.5) }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center" style={{ fontSize: TYPE.meta }}>
                <span className="px-4 text-gray-500" style={{ backgroundColor: GLASS.backgroundLight }}>
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Create Account link */}
            <Link href="/client/signup">
              <motion.button
                whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'w-full border-2 border-violet-600 text-violet-600',
                  'hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white hover:border-transparent',
                  'font-semibold flex items-center justify-center gap-2'
                )}
                style={{
                  padding: `${spacing(1.75)}px ${spacing(3)}px`,
                  borderRadius: RADIUS.button,
                  transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                }}
              >
                Create Account
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
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-violet-600 font-medium transition-colors cursor-pointer"
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

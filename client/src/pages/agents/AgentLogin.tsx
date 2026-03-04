import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Shield,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const benefits = [
  { icon: TrendingUp, text: "Industry-best payouts" },
  { icon: Users, text: "Premium leads delivered" },
  { icon: Zap, text: "Top-tier infrastructure" },
  { icon: Shield, text: "Compliance made easy" },
];

export default function AgentLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, logout, resetPassword } = useAuth();
  const [, setLocation] = useLocation();
  const { trackAgentLogin } = useAnalytics();

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetError, setResetError] = useState("");

  const handleSignOut = async () => {
    await logout();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      trackAgentLogin(email);
      // Check for stored redirect path, otherwise go to CRM
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/crm';
      sessionStorage.removeItem('redirectAfterLogin');
      setLocation(redirectPath);
    } catch (err: any) {
      // If Firebase says user not found, check if they have a pending registration
      if (err?.code === "auth/user-not-found") {
        try {
          const checkRes = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
          const checkData = await checkRes.json();
          if (!checkData.available) {
            setError("Your application is still under review. We'll email you once you're approved.");
          } else {
            setError("No account found with this email address.");
          }
        } catch {
          setError("Invalid email or password. Please try again.");
        }
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus("loading");
    setResetError("");

    try {
      await resetPassword(resetEmail);
      setResetStatus("success");
    } catch (err: any) {
      setResetStatus("error");
      if (err.code === "auth/user-not-found") {
        setResetError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setResetError("Please enter a valid email address.");
      } else {
        setResetError("Failed to send reset email. Please try again.");
      }
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetStatus("idle");
    setResetError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-purple-600/90 to-indigo-600/90" />

          {/* Floating orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col justify-between w-full"
          style={{ padding: spacing(4) }}
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
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </motion.div>
          </Link>

          {/* Main Content */}
          <div style={{ marginTop: spacing(5), marginBottom: spacing(5) }}>
            <motion.div variants={fadeInUp}>
              <h1
                className="font-black tracking-tight"
                style={{ fontSize: TYPE.display, marginBottom: spacing(3) }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-lg text-6xl xl:text-7xl">
                  Heritage
                </span>
              </h1>
              <p
                className="text-white/80 font-light max-w-sm leading-relaxed"
                style={{ fontSize: TYPE.section }}
              >
                Build your legacy with the tools to succeed.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap"
              style={{ gap: spacing(1.5), marginTop: spacing(5) }}
            >
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.text}
                  variants={scaleIn}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
                  style={{
                    padding: `${spacing(1.25)}px ${spacing(2)}px`,
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                  }}
                >
                  <benefit.icon className="w-4 h-4 text-amber-400" />
                  <span className="text-white/90 font-medium" style={{ fontSize: TYPE.meta }}>{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center text-white/40"
            style={{ gap: spacing(3), fontSize: TYPE.meta }}
          >
            <span>&copy; 2025 Heritage Life Solutions</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-gray-50" style={{ padding: spacing(3) }}>
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
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">Heritage</span>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="text-center"
            style={{ marginBottom: spacing(4) }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ marginBottom: spacing(1) }}>
              Welcome back
            </h2>
            <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
              Sign in to access your Heritage CRM
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            className="bg-white border border-gray-100"
            style={{
              borderRadius: RADIUS.card,
              padding: spacing(3),
              boxShadow: SHADOW.hero,
              transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
            }}
          >
            {user ? (
              <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                <div
                  className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto"
                  style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.level3 }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title, marginBottom: spacing(1) }}>You're signed in</h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>{user.email}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1.5) }}>
                  <motion.button
                    onClick={() => setLocation("/crm")}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                    style={{
                      padding: `${spacing(1.75)}px ${spacing(2)}px`,
                      borderRadius: RADIUS.button,
                      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                    }}
                  >
                    Go to CRM <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={handleSignOut}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold"
                    style={{
                      padding: `${spacing(1.75)}px ${spacing(2)}px`,
                      borderRadius: RADIUS.button,
                      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                    }}
                  >
                    Sign Out
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2.5) }}>
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
                        className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
                        style={{
                          paddingLeft: spacing(6),
                          paddingRight: spacing(2),
                          paddingTop: spacing(1.75),
                          paddingBottom: spacing(1.75),
                          borderRadius: RADIUS.input,
                          transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
                        style={{
                          paddingLeft: spacing(6),
                          paddingRight: spacing(6),
                          paddingTop: spacing(1.75),
                          paddingBottom: spacing(1.75),
                          borderRadius: RADIUS.input,
                          transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors" style={{ fontSize: TYPE.meta }}>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                      style={{ fontSize: TYPE.meta }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ y: isLoading ? 0 : MOTION.hover.y, scale: isLoading ? 1 : MOTION.hover.scale }}
                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                    className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                    style={{
                      padding: `${spacing(2)}px ${spacing(3)}px`,
                      borderRadius: RADIUS.button,
                      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
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
                <div className="relative" style={{ marginTop: spacing(4), marginBottom: spacing(4) }}>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center" style={{ fontSize: TYPE.meta }}>
                    <span className="px-4 bg-white text-gray-500">New to Heritage?</span>
                  </div>
                </div>

                {/* Create Account */}
                <Link href="/agents/register">
                  <motion.button
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full border-2 border-violet-600 text-violet-600 hover:bg-gradient-to-r hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 hover:text-white hover:border-transparent font-semibold flex items-center justify-center gap-2"
                    style={{
                      padding: `${spacing(1.75)}px ${spacing(3)}px`,
                      borderRadius: RADIUS.button,
                      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Create an Account
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Help text */}
          <motion.p
            variants={fadeInUp}
            className="text-center text-gray-500"
            style={{ fontSize: TYPE.meta, marginTop: spacing(3) }}
          >
            Need help?{" "}
            <a href="tel:6307780800" className="text-violet-600 hover:underline font-medium">
              (630) 778-0800
            </a>
            {" "}or{" "}
            <a href="mailto:support@heritagels.org" className="text-violet-600 hover:underline font-medium">
              support@heritagels.org
            </a>
          </motion.p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: spacing(2) }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeForgotPasswordModal}
              style={{ transition: `opacity ${MOTION.duration.normal}s ${MOTION.easingCSS}` }}
            />

            {/* Modal */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="relative bg-white max-w-md w-full"
              style={{
                borderRadius: RADIUS.card,
                padding: spacing(4),
                boxShadow: SHADOW.hero
              }}
            >
              {resetStatus === "success" ? (
                <div className="text-center">
                  <div
                    className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto"
                    style={{ borderRadius: RADIUS.hero, boxShadow: SHADOW.level3, marginBottom: spacing(3) }}
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(1) }}>Check your email</h3>
                  <p className="text-gray-600" style={{ fontSize: TYPE.body, marginBottom: spacing(3) }}>
                    We've sent a password reset link to <span className="font-medium">{resetEmail}</span>
                  </p>
                  <motion.button
                    onClick={closeForgotPasswordModal}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold"
                    style={{
                      padding: `${spacing(1.5)}px ${spacing(2)}px`,
                      borderRadius: RADIUS.button,
                      transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                    }}
                  >
                    Back to Login
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="text-center" style={{ marginBottom: spacing(3) }}>
                    <div
                      className="w-16 h-16 bg-violet-100 flex items-center justify-center mx-auto"
                      style={{ borderRadius: RADIUS.hero, marginBottom: spacing(2) }}
                    >
                      <Lock className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(1) }}>Reset your password</h3>
                    <p className="text-gray-600" style={{ fontSize: TYPE.body }}>
                      Enter your email and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                    <AnimatePresence>
                      {resetError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700"
                          style={{ padding: spacing(2), borderRadius: RADIUS.input }}
                        >
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <span style={{ fontSize: TYPE.meta }}>{resetError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          style={{
                            paddingLeft: spacing(6),
                            paddingRight: spacing(2),
                            paddingTop: spacing(1.5),
                            paddingBottom: spacing(1.5),
                            borderRadius: RADIUS.input,
                            transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                          }}
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={resetStatus === "loading"}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        padding: `${spacing(1.5)}px ${spacing(2)}px`,
                        borderRadius: RADIUS.button,
                        transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                      }}
                    >
                      {resetStatus === "loading" ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="w-full text-gray-600 hover:text-gray-900 font-medium"
                      style={{
                        padding: `${spacing(1.5)}px ${spacing(2)}px`,
                        transition: `color ${MOTION.duration.hover}s ${MOTION.easingCSS}`
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

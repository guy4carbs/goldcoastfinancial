import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
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
    } catch (err) {
      setError("Invalid email or password. Please try again.");
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
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-[#292966] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#292966] via-[#3d3d8f] to-[#292966]" />

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
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo & Brand */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </motion.div>
          </Link>

          {/* Main Content */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-6xl xl:text-7xl font-black tracking-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-lg">
                  Heritage
                </span>
              </h1>
              <p className="text-2xl text-white/80 font-light max-w-sm leading-relaxed">
                Build your legacy with the tools to succeed.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <benefit.icon className="w-4 h-4 text-amber-400" />
                  <span className="text-white/90 text-sm font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-6 text-white/40 text-sm"
          >
            <span>&copy; 2025 Heritage Life Solutions</span>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-10 h-10 bg-[#292966] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">Heritage</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500">
              Sign in to access your Heritage CRM
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-100"
          >
            {user ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">You're signed in</h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setLocation("/crm")}
                    className="w-full bg-[#292966] hover:bg-[#3d3d8f] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    Go to CRM <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-semibold transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#292966]/20 focus:border-[#292966] transition-all bg-gray-50/50 hover:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#292966]/20 focus:border-[#292966] transition-all bg-gray-50/50 hover:bg-white"
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
                        className="w-4 h-4 rounded border-gray-300 text-[#292966] focus:ring-[#292966]"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-[#292966] hover:text-[#3d3d8f] font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.99 }}
                    className="w-full bg-[#292966] hover:bg-[#3d3d8f] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#292966]/25"
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
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to Heritage?</span>
                  </div>
                </div>

                {/* Create Account */}
                <Link href="/become-agent">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full border-2 border-[#292966] text-[#292966] hover:bg-[#292966] hover:text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            Need help?{" "}
            <a href="tel:6307780800" className="text-[#292966] hover:underline font-medium">
              (630) 778-0800
            </a>
            {" "}or{" "}
            <a href="mailto:support@heritagels.org" className="text-[#292966] hover:underline font-medium">
              support@heritagels.org
            </a>
          </motion.p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeForgotPasswordModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
            >
              {resetStatus === "success" ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <span className="font-medium">{resetEmail}</span>
                  </p>
                  <button
                    onClick={closeForgotPasswordModal}
                    className="w-full bg-[#292966] hover:bg-[#3d3d8f] text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#292966]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-[#292966]" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h3>
                    <p className="text-gray-600">
                      Enter your email and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <AnimatePresence>
                      {resetError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700"
                        >
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{resetError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#292966]/20 focus:border-[#292966] transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resetStatus === "loading"}
                      className="w-full bg-[#292966] hover:bg-[#3d3d8f] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                      {resetStatus === "loading" ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="w-full text-gray-600 hover:text-gray-900 py-3 font-medium transition-colors"
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

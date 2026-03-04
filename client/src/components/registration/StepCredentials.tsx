import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { RADIUS, MOTION, TYPE, COLORS, spacing } from "@/lib/heritageDesignSystem";
import type { RegistrationFormData, StepErrors } from "./useRegistrationForm";

interface Props {
  formData: RegistrationFormData;
  updateField: <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => void;
  errors: StepErrors;
}

export function StepCredentials({ formData, updateField, errors }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Debounced email availability check
  useEffect(() => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailAvailable(null);
      return;
    }
    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        const data = await res.json();
        setEmailAvailable(data.available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const passwordChecks = [
    { label: "8+ characters", met: formData.password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Number", met: /[0-9]/.test(formData.password) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing(2.5) }}>
      <div>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(0.5) }}>
          Create your account
        </h3>
        <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
          Set up your login credentials
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
            style={{
              paddingLeft: spacing(6),
              paddingRight: spacing(5),
              paddingTop: spacing(1.75),
              paddingBottom: spacing(1.75),
              borderRadius: RADIUS.input,
              transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
            }}
          />
          {formData.email && !checkingEmail && emailAvailable !== null && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {emailAvailable ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {emailAvailable === false && (
          <p className="text-red-600 mt-1" style={{ fontSize: TYPE.caption }}>
            An account with this email already exists
          </p>
        )}
        <FieldError error={errors.email} />
      </div>

      {/* Password */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Create a strong password"
            className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
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
        <FieldError error={errors.password} />
        {formData.password && (
          <div className="flex flex-wrap mt-2" style={{ gap: spacing(1) }}>
            {passwordChecks.map((check) => (
              <span
                key={check.label}
                className="flex items-center"
                style={{
                  gap: 4,
                  fontSize: TYPE.micro,
                  color: check.met ? COLORS.semantic.success : "#9ca3af",
                }}
              >
                {check.met ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                {check.label}
              </span>
            ))}
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
            type={showConfirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            placeholder="Re-enter your password"
            className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
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
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <FieldError error={errors.confirmPassword} />
      </div>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1 text-red-600 mt-1"
          style={{ fontSize: TYPE.caption }}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  RADIUS, SHADOW, MOTION, TYPE, COLORS,
  fadeInUp, staggerContainer, scaleIn, spacing,
} from "@/lib/heritageDesignSystem";
import {
  Shield, TrendingUp, Users, Zap, ArrowRight, ArrowLeft, Loader2,
} from "lucide-react";

import { ProgressIndicator } from "@/components/registration/ProgressIndicator";
import { StepCredentials } from "@/components/registration/StepCredentials";
import { StepPersonalInfo } from "@/components/registration/StepPersonalInfo";
import { StepAddress } from "@/components/registration/StepAddress";
import { StepProfessional } from "@/components/registration/StepProfessional";
import { StepMotivation } from "@/components/registration/StepMotivation";
import { StepReview } from "@/components/registration/StepReview";
import { RegistrationSuccess } from "@/components/registration/RegistrationSuccess";
import { useRegistrationForm, clearRegistrationSession } from "@/components/registration/useRegistrationForm";

const benefits = [
  { icon: TrendingUp, text: "Industry-best payouts" },
  { icon: Users, text: "Premium leads delivered" },
  { icon: Zap, text: "Top-tier infrastructure" },
  { icon: Shield, text: "Compliance made easy" },
];

export default function AgentRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { formData, updateField, validateStep, errors, setErrors } = useRegistrationForm();

  const goNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((s) => Math.min(s + 1, 6));
    }
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/auth/register-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone.replace(/\D/g, ""),
          dateOfBirth: formData.dateOfBirth,
          streetAddress: formData.streetAddress,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          isLicensed: formData.isLicensed,
          licenseNumber: formData.licenseNumber || undefined,
          licensedStates: formData.licensedStates.length > 0 ? formData.licensedStates : undefined,
          yearsExperience: formData.yearsExperience,
          previousAgency: formData.previousAgency || undefined,
          npn: formData.npn || undefined,
          interestedProducts: [],
          whyJoinHeritage: formData.whyJoinHeritage,
          referralSource: formData.referralSource,
          referringAgentName: formData.referringAgentName || undefined,
          agreedToTerms: formData.agreedToTerms,
          agreedToPrivacy: formData.agreedToPrivacy,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setSubmitError("Server error. Please try again later.");
        return;
      }

      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }

      clearRegistrationSession();
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (matches AgentLogin.tsx) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-purple-600/90 to-indigo-600/90" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

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
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </motion.div>
          </Link>

          <div style={{ marginTop: spacing(5), marginBottom: spacing(5) }}>
            <motion.div variants={fadeInUp}>
              <h1 className="font-black tracking-tight" style={{ fontSize: TYPE.display, marginBottom: spacing(3) }}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-lg text-6xl xl:text-7xl">
                  Heritage
                </span>
              </h1>
              <p className="text-white/80 font-light max-w-sm leading-relaxed" style={{ fontSize: TYPE.section }}>
                Join the team that's building the future of insurance.
              </p>
            </motion.div>

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
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                  }}
                >
                  <benefit.icon className="w-4 h-4 text-amber-400" />
                  <span className="text-white/90 font-medium" style={{ fontSize: TYPE.meta }}>
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="flex items-center text-white/40"
            style={{ gap: spacing(3), fontSize: TYPE.meta }}
          >
            <span>&copy; 2025 Heritage Life Solutions</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Registration Form */}
      <div
        className="w-full lg:w-1/2 xl:w-[45%] flex items-start justify-center bg-gray-50 overflow-y-auto"
        style={{ padding: spacing(3), paddingTop: spacing(4) }}
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
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">
              Heritage
            </span>
          </motion.div>

          {!submitted && (
            <motion.div variants={fadeInUp}>
              <ProgressIndicator currentStep={currentStep} />
            </motion.div>
          )}

          <motion.div
            variants={fadeInUp}
            className="bg-white border border-gray-100"
            style={{
              borderRadius: RADIUS.card,
              padding: spacing(3),
              boxShadow: SHADOW.hero,
            }}
          >
            {submitted ? (
              <RegistrationSuccess email={formData.email} />
            ) : (
              <>
                {/* Step content */}
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
                    {currentStep === 1 && <StepPersonalInfo formData={formData} updateField={updateField} errors={errors} />}
                    {currentStep === 2 && <StepCredentials formData={formData} updateField={updateField} errors={errors} />}
                    {currentStep === 3 && <StepAddress formData={formData} updateField={updateField} errors={errors} />}
                    {currentStep === 4 && <StepProfessional formData={formData} updateField={updateField} errors={errors} />}
                    {currentStep === 5 && <StepMotivation formData={formData} updateField={updateField} errors={errors} />}
                    {currentStep === 6 && <StepReview formData={formData} updateField={updateField} errors={errors} onGoToStep={goToStep} />}
                  </motion.div>
                </AnimatePresence>

                {/* Submit error */}
                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-red-50 border border-red-100 text-red-700"
                      style={{
                        padding: spacing(2),
                        borderRadius: RADIUS.input,
                        fontSize: TYPE.meta,
                        marginTop: spacing(2),
                      }}
                    >
                      {submitError}
                    </motion.div>
                  )}
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
                    <Link href="/agents/login">
                      <span className="text-gray-500 hover:text-gray-700 transition-colors" style={{ fontSize: TYPE.meta }}>
                        Already have an account?
                      </span>
                    </Link>
                  )}

                  {currentStep < 6 ? (
                    <motion.button
                      type="button"
                      onClick={goNext}
                      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center gap-2"
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
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      whileHover={{ y: isSubmitting ? 0 : MOTION.hover.y, scale: isSubmitting ? 1 : MOTION.hover.scale }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                      className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                      style={{
                        padding: `${spacing(1.5)}px ${spacing(3)}px`,
                        borderRadius: RADIUS.button,
                        transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* Help text */}
          {!submitted && (
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
          )}
        </motion.div>
      </div>
    </div>
  );
}

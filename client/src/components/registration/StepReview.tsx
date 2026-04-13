import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Edit3, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { RADIUS, MOTION, TYPE, COLORS, SHADOW, spacing } from "@/lib/heritageDesignSystem";
import type { RegistrationFormData, StepErrors } from "./useRegistrationForm";

interface Props {
  formData: RegistrationFormData;
  updateField: <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => void;
  errors: StepErrors;
  onGoToStep: (step: number) => void;
}

const benefits = [
  { icon: TrendingUp, text: "Industry-best payouts" },
  { icon: Users, text: "Premium leads delivered" },
  { icon: Zap, text: "Top-tier infrastructure" },
  { icon: Shield, text: "Compliance made easy" },
];

function SectionCard({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border border-gray-100"
      style={{
        borderRadius: RADIUS.input,
        padding: spacing(2),
        backgroundColor: "rgba(0,0,0,0.01)",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: spacing(1) }}>
        <h4 className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{title}</h4>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center text-violet-600 hover:text-violet-700 transition-colors"
          style={{ gap: 4, fontSize: TYPE.micro }}
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing(0.5) }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex" style={{ gap: spacing(1) }}>
      <span className="text-gray-500 flex-shrink-0" style={{ fontSize: TYPE.caption, minWidth: 100 }}>{label}:</span>
      <span className="text-gray-900 font-medium" style={{ fontSize: TYPE.caption }}>{value}</span>
    </div>
  );
}

export function StepReview({ formData, updateField, errors, onGoToStep }: Props) {
  const licenseLabel =
    formData.isLicensed === "yes" ? "Yes" :
    formData.isLicensed === "no" ? "No" :
    formData.isLicensed === "in_progress" ? "In Progress" : "";

  const experienceLabels: Record<string, string> = {
    none: "No experience",
    less_than_1: "Less than 1 year",
    "1_3": "1-3 years",
    "3_5": "3-5 years",
    "5_10": "5-10 years",
    "10_plus": "10+ years",
  };

  const sourceLabels: Record<string, string> = {
    google: "Google Search",
    social_media: "Social Media",
    referral: "Agent Referral",
    job_board: "Job Board",
    industry_event: "Industry Event",
    other: "Other",
  };

  // Parse DOB for display
  const formatDob = (dob: string) => {
    if (!dob) return "";
    const [y, m, d] = dob.split("-").map(Number);
    if (!y || !m || !d) return dob;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[m - 1]} ${d}, ${y}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing(2) }}>
      {/* Heritage benefits banner */}
      <div
        className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
        style={{ borderRadius: RADIUS.input, padding: spacing(2) }}
      >
        <p className="text-white font-bold" style={{ fontSize: TYPE.body, marginBottom: spacing(1) }}>
          You're joining Heritage
        </p>
        <div className="flex flex-wrap" style={{ gap: spacing(1) }}>
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full" style={{ padding: `4px ${spacing(1.25)}px` }}>
              <b.icon className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/90 font-medium" style={{ fontSize: TYPE.micro }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(0.5) }}>
          Review your application
        </h3>
        <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
          Please verify everything looks correct before submitting
        </p>
      </div>

      {/* Personal - now step 1 */}
      <SectionCard title="Personal" step={1} onEdit={onGoToStep}>
        <Field label="Name" value={`${formData.firstName} ${formData.lastName}`} />
        <Field label="Phone" value={formData.phone} />
        <Field label="Date of Birth" value={formatDob(formData.dateOfBirth)} />
      </SectionCard>

      {/* Account - now step 2 */}
      <SectionCard title="Account" step={2} onEdit={onGoToStep}>
        <Field label="Email" value={formData.email} />
      </SectionCard>

      {/* Address */}
      <SectionCard title="Address" step={3} onEdit={onGoToStep}>
        <Field
          label="Address"
          value={[
            formData.streetAddress,
            formData.addressLine2,
            `${formData.city}, ${formData.state} ${formData.zipCode}`,
          ].filter(Boolean).join(", ")}
        />
      </SectionCard>

      {/* Professional */}
      <SectionCard title="Professional" step={4} onEdit={onGoToStep}>
        <Field label="Licensed" value={licenseLabel} />
        {formData.licenseNumber && <Field label="License #" value={formData.licenseNumber} />}
        {formData.npn && <Field label="NPN" value={formData.npn} />}
        {formData.licensedStates && formData.licensedStates.length > 0 && (
          <Field label="States" value={formData.licensedStates.join(", ")} />
        )}
        <Field label="Experience" value={experienceLabels[formData.yearsExperience] || formData.yearsExperience} />
        {formData.previousAgency && <Field label="Previous" value={formData.previousAgency} />}
      </SectionCard>

      {/* Motivation */}
      <SectionCard title="Motivation" step={5} onEdit={onGoToStep}>
        <Field label="Source" value={sourceLabels[formData.referralSource] || formData.referralSource} />
        {formData.referringAgentName && <Field label="Referrer" value={formData.referringAgentName} />}
        {formData.whyJoinHeritage && (
          <div
            className="border border-violet-100 bg-violet-50/50"
            style={{ borderRadius: RADIUS.input, padding: spacing(1.5), marginTop: spacing(0.5) }}
          >
            <p className="text-violet-700 font-medium" style={{ fontSize: TYPE.micro, marginBottom: 4 }}>Why Heritage</p>
            <p className="text-gray-800 leading-relaxed" style={{ fontSize: TYPE.caption }}>
              {formData.whyJoinHeritage}
            </p>
          </div>
        )}
      </SectionCard>

      {/* Consent checkboxes */}
      <div
        className="border border-gray-200"
        style={{
          borderRadius: RADIUS.input,
          padding: spacing(2),
          display: "flex",
          flexDirection: "column",
          gap: spacing(1.5),
        }}
      >
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => updateField("agreedToTerms", e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-gray-700 group-hover:text-gray-900 transition-colors" style={{ fontSize: TYPE.meta }}>
            I agree to the <a href="/terms" target="_blank" className="text-violet-600 hover:underline font-medium">Terms of Service</a>
          </span>
        </label>
        <FieldError error={errors.agreedToTerms} />

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.agreedToPrivacy}
            onChange={(e) => updateField("agreedToPrivacy", e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-gray-700 group-hover:text-gray-900 transition-colors" style={{ fontSize: TYPE.meta }}>
            I agree to the <a href="/privacy" target="_blank" className="text-violet-600 hover:underline font-medium">Privacy Policy</a>
          </span>
        </label>
        <FieldError error={errors.agreedToPrivacy} />

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.agreedToSms || false}
            onChange={(e) => updateField("agreedToSms", e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-gray-700 group-hover:text-gray-900 transition-colors" style={{ fontSize: TYPE.meta }}>
            By checking this box, I agree to receive SMS and MMS messages from Heritage Life Solutions (Gold Coast Financial Partners LLC) including authentication codes, customer care responses, account notifications, and marketing/promotional messages. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out or HELP for help. <a href="/legal/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
          </span>
        </label>
        <FieldError error={errors.agreedToSms} />
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

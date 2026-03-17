import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase, Shield, Clock,
  Heart, Calendar, ArrowLeft, ArrowRight, CheckCircle, CalendarDays,
} from "lucide-react";
import { RADIUS, SHADOW, GRID, TYPE, COLORS } from "@/lib/heritageDesignSystem";

// ===== TYPES =====

interface RecruitApplicationFormProps {
  agentName: string;
  agentSlug: string;
  onBack?: () => void;
  embedded?: boolean;
}

type LicenseStatus = "" | "yes" | "no" | "in_progress";
type Availability = "" | "full_time" | "part_time";

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  occupation: string;
  hasLicense: LicenseStatus;
  experience: string;
  interest: string;
  availability: Availability;
  startDate: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

// ===== CONSTANTS =====

const SERIF = "'Playfair Display', serif";
const TOTAL_STEPS = 4;

const experienceOptions = [
  { value: "0-2", label: "0–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+", label: "10+ years" },
];

const interestOptions = [
  { value: "income", label: "Unlimited income potential" },
  { value: "flexibility", label: "Schedule flexibility" },
  { value: "families", label: "Helping families" },
  { value: "team", label: "Building a team" },
  { value: "all", label: "All of the above" },
];

const startOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "2_weeks", label: "Within 2 weeks" },
  { value: "1_month", label: "Within 1 month" },
  { value: "not_sure", label: "Not sure yet" },
];

const licenseOptions: { value: LicenseStatus; label: string; description: string }[] = [
  { value: "yes", label: "Yes", description: "Currently licensed" },
  { value: "no", label: "No", description: "Not yet licensed" },
  { value: "in_progress", label: "In Progress", description: "Working on it" },
];

const availabilityOptions: { value: Availability; label: string; description: string }[] = [
  { value: "full_time", label: "Full-Time", description: "Ready to go all in" },
  { value: "part_time", label: "Part-Time", description: "Keeping my current job" },
];

// ===== ANIMATION =====

const stepVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const confirmVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ===== COMPONENT =====

export function RecruitApplicationForm({ agentName, agentSlug, onBack, embedded = false }: RecruitApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", phone: "", city: "", state: "",
    occupation: "", hasLicense: "", experience: "",
    interest: "", availability: "", startDate: "", notes: "",
  });

  const pad = embedded ? GRID.spacing.md : GRID.spacing.lg;
  const titleSize = embedded ? TYPE.title : TYPE.section;
  const subtitleSize = embedded ? TYPE.caption : TYPE.meta;
  const labelSize = embedded ? TYPE.caption : TYPE.meta;
  const inputPad = embedded ? "8px 12px" : "10px 14px";

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (): boolean => {
    const e: FormErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) e.name = "Name is required";
      if (!formData.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
      if (!formData.phone.trim()) e.phone = "Phone is required";
      if (!formData.city.trim()) e.city = "City is required";
      if (!formData.state.trim()) e.state = "State is required";
    }
    if (step === 2) {
      if (!formData.occupation.trim()) e.occupation = "Occupation is required";
      if (!formData.hasLicense) e.hasLicense = "Please select one";
      if (!formData.experience) e.experience = "Please select one";
    }
    if (step === 3) {
      if (!formData.interest) e.interest = "Please select one";
      if (!formData.availability) e.availability = "Please select one";
      if (!formData.startDate) e.startDate = "Please select one";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    if (step === 1 && onBack) onBack();
    else setStep((s) => Math.max(s - 1, 1));
  };

  // ===== SHARED STYLES =====

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: inputPad,
    fontSize: subtitleSize,
    borderRadius: RADIUS.input,
    border: `1px solid ${COLORS.gray[200]}`,
    outline: "none",
    background: "white",
    color: COLORS.gray[800],
    transition: "border-color 0.15s ease",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: embedded ? 10 : 12,
    color: "#ef4444",
    marginTop: 2,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 8px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px 16px",
    paddingRight: 28,
  };

  // ===== RENDER HELPERS =====

  const renderField = (label: string, field: keyof FormData, type = "text", placeholder = "", icon?: React.ReactNode) => (
    <div style={{ marginBottom: embedded ? GRID.spacing.xs : GRID.spacing.sm }}>
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: labelSize, fontWeight: 600, color: COLORS.gray[700], marginBottom: 4 }}>
        {icon}
        {label} <span style={{ color: "#ef4444" }}>*</span>
      </label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          borderColor: errors[field] ? "#ef4444" : COLORS.gray[200],
        }}
        onFocus={(e) => { e.target.style.borderColor = COLORS.primary.violet[400]; }}
        onBlur={(e) => { e.target.style.borderColor = errors[field] ? "#ef4444" : COLORS.gray[200]; }}
      />
      {errors[field] && <p style={errorStyle}>{errors[field]}</p>}
    </div>
  );

  const renderSelect = (label: string, field: keyof FormData, options: { value: string; label: string }[], icon?: React.ReactNode) => (
    <div style={{ marginBottom: embedded ? GRID.spacing.xs : GRID.spacing.sm }}>
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: labelSize, fontWeight: 600, color: COLORS.gray[700], marginBottom: 4 }}>
        {icon}
        {label} <span style={{ color: "#ef4444" }}>*</span>
      </label>
      <select
        value={formData[field]}
        onChange={(e) => update(field, e.target.value)}
        style={{
          ...selectStyle,
          borderColor: errors[field] ? "#ef4444" : COLORS.gray[200],
          color: formData[field] ? COLORS.gray[800] : COLORS.gray[400],
        }}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {errors[field] && <p style={errorStyle}>{errors[field]}</p>}
    </div>
  );

  const renderRadioCards = <T extends string>(
    label: string,
    field: keyof FormData,
    options: { value: T; label: string; description: string }[],
  ) => (
    <div style={{ marginBottom: embedded ? GRID.spacing.xs : GRID.spacing.sm }}>
      <label style={{ display: "block", fontSize: labelSize, fontWeight: 600, color: COLORS.gray[700], marginBottom: 6 }}>
        {label} <span style={{ color: "#ef4444" }}>*</span>
      </label>
      <div style={{ display: "flex", gap: GRID.spacing.xs }}>
        {options.map((o) => {
          const selected = formData[field] === o.value;
          return (
            <div
              key={o.value}
              onClick={() => update(field, o.value)}
              style={{
                flex: 1,
                padding: embedded ? "8px 10px" : "12px 14px",
                borderRadius: RADIUS.input,
                border: `2px solid ${selected ? COLORS.primary.violet[500] : COLORS.gray[200]}`,
                background: selected ? COLORS.primary.violet[50] : "white",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s ease",
              }}
            >
              <p style={{ fontSize: subtitleSize, fontWeight: 700, color: selected ? COLORS.primary.violet[700] : COLORS.gray[800], margin: 0 }}>
                {o.label}
              </p>
              <p style={{ fontSize: embedded ? 9 : 11, color: COLORS.gray[500], margin: 0, marginTop: 2 }}>
                {o.description}
              </p>
            </div>
          );
        })}
      </div>
      {errors[field] && <p style={errorStyle}>{errors[field]}</p>}
    </div>
  );

  // ===== PROGRESS BAR =====

  const renderProgress = () => (
    <div style={{ marginBottom: embedded ? GRID.spacing.sm : GRID.spacing.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: embedded ? 20 : 24,
              height: embedded ? 20 : 24,
              borderRadius: RADIUS.pill,
              background: s <= step ? COLORS.gradients.hero : COLORS.gray[200],
              color: s <= step ? "white" : COLORS.gray[500],
              fontSize: embedded ? 10 : 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {s < step ? <CheckCircle size={embedded ? 12 : 14} /> : s}
            </div>
            <span style={{
              fontSize: embedded ? 9 : 11,
              fontWeight: s === step ? 700 : 500,
              color: s === step ? COLORS.primary.violet[700] : COLORS.gray[400],
              display: embedded && s > 2 ? "none" : undefined,
            }}>
              {s === 1 ? "Info" : s === 2 ? "Background" : s === 3 ? "Goals" : "Done"}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: 3, background: COLORS.gray[100], borderRadius: RADIUS.pill, overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", background: COLORS.gradients.amber, borderRadius: RADIUS.pill }}
        />
      </div>
    </div>
  );

  // ===== STEP RENDERS =====

  const renderStep1 = () => (
    <div>
      <h3 style={{ fontSize: titleSize, fontWeight: 700, fontFamily: SERIF, color: COLORS.gray[900], marginBottom: 4 }}>
        Personal Information
      </h3>
      <p style={{ fontSize: subtitleSize, color: COLORS.gray[500], marginBottom: GRID.spacing.sm }}>
        Tell us a bit about yourself
      </p>
      {renderField("Full Name", "name", "text", "John Smith", <User size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
      {renderField("Email", "email", "email", "john@email.com", <Mail size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
      {renderField("Phone", "phone", "tel", "(555) 123-4567", <Phone size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: GRID.spacing.xs }}>
        {renderField("City", "city", "text", "Chicago", <MapPin size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
        {renderField("State", "state", "text", "IL")}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 style={{ fontSize: titleSize, fontWeight: 700, fontFamily: SERIF, color: COLORS.gray[900], marginBottom: 4 }}>
        Your Background
      </h3>
      <p style={{ fontSize: subtitleSize, color: COLORS.gray[500], marginBottom: GRID.spacing.sm }}>
        No experience required — we just want to know you better
      </p>
      {renderField("Current / Most Recent Occupation", "occupation", "text", "e.g. Teacher, Nurse, Sales Rep", <Briefcase size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
      {renderRadioCards("Do you have an insurance license?", "hasLicense", licenseOptions)}
      {renderSelect("Years of Professional Experience", "experience", experienceOptions, <Clock size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 style={{ fontSize: titleSize, fontWeight: 700, fontFamily: SERIF, color: COLORS.gray[900], marginBottom: 4 }}>
        Goals & Availability
      </h3>
      <p style={{ fontSize: subtitleSize, color: COLORS.gray[500], marginBottom: GRID.spacing.sm }}>
        Help us match you with the right opportunity
      </p>
      {renderSelect("What interests you most about Heritage?", "interest", interestOptions, <Heart size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
      {renderRadioCards("Are you looking for full-time or part-time?", "availability", availabilityOptions)}
      {renderSelect("When can you start?", "startDate", startOptions, <Calendar size={embedded ? 12 : 14} style={{ color: COLORS.gray[400] }} />)}
      <div style={{ marginBottom: GRID.spacing.xs }}>
        <label style={{ display: "block", fontSize: labelSize, fontWeight: 600, color: COLORS.gray[700], marginBottom: 4 }}>
          Anything else you'd like us to know?
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Optional — tell us about your goals, questions, etc."
          rows={embedded ? 2 : 3}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>
    </div>
  );

  const renderStep4 = () => {
    const firstName = formData.name.split(" ")[0] || "there";
    return (
      <motion.div variants={confirmVariants} initial="hidden" animate="visible" style={{ textAlign: "center", padding: `${GRID.spacing.sm}px 0` }}>
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
          style={{
            width: embedded ? 48 : 64,
            height: embedded ? 48 : 64,
            borderRadius: RADIUS.pill,
            background: "rgba(16,185,129,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: GRID.spacing.sm,
          }}
        >
          <CheckCircle size={embedded ? 24 : 32} style={{ color: "#10b981" }} />
        </motion.div>

        <h3 style={{ fontSize: titleSize, fontWeight: 700, fontFamily: SERIF, color: COLORS.gray[900], marginBottom: 4 }}>
          Application Submitted!
        </h3>
        <p style={{ fontSize: subtitleSize, color: COLORS.gray[600], marginBottom: GRID.spacing.md, lineHeight: 1.5 }}>
          Thank you, {firstName}! {agentName} will reach out to you within 24 hours to discuss the next steps.
        </p>

        {/* Summary */}
        <div style={{
          background: COLORS.gray[50],
          borderRadius: RADIUS.input,
          padding: GRID.spacing.sm,
          textAlign: "left",
          marginBottom: GRID.spacing.md,
          border: `1px solid ${COLORS.gray[100]}`,
        }}>
          <p style={{ fontSize: embedded ? 10 : 12, fontWeight: 700, color: COLORS.gray[700], marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Application Summary
          </p>
          {[
            { label: "Name", value: formData.name },
            { label: "Email", value: formData.email },
            { label: "Phone", value: formData.phone },
            { label: "Location", value: `${formData.city}, ${formData.state}` },
            { label: "Occupation", value: formData.occupation },
            { label: "License", value: formData.hasLicense === "yes" ? "Licensed" : formData.hasLicense === "in_progress" ? "In Progress" : "Not Yet" },
            { label: "Availability", value: formData.availability === "full_time" ? "Full-Time" : "Part-Time" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid ${COLORS.gray[100]}` }}>
              <span style={{ fontSize: embedded ? 10 : 12, color: COLORS.gray[500] }}>{row.label}</span>
              <span style={{ fontSize: embedded ? 10 : 12, fontWeight: 600, color: COLORS.gray[800] }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Schedule a call */}
        <a
          href={`/book/agent-${agentSlug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: COLORS.gradients.hero,
            color: "white",
            fontWeight: 700,
            fontSize: subtitleSize,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
            borderRadius: RADIUS.pill,
            textDecoration: "none",
            boxShadow: SHADOW.glow.violet,
            cursor: embedded ? "default" : "pointer",
          }}
        >
          <CalendarDays size={embedded ? 14 : 16} />
          Schedule a Call with {agentName}
        </a>
      </motion.div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div style={{ padding: pad, background: "white" }}>
      {/* Back to landing page link */}
      {onBack && step <= 3 && (
        <div
          onClick={step === 1 ? onBack : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: embedded ? 11 : TYPE.caption,
            color: COLORS.primary.violet[500],
            cursor: step === 1 ? "pointer" : "default",
            marginBottom: GRID.spacing.sm,
            opacity: step === 1 ? 1 : 0,
            pointerEvents: step === 1 ? "auto" : "none",
          }}
        >
          <ArrowLeft size={12} />
          Back to landing page
        </div>
      )}

      {/* Progress */}
      {step < TOTAL_STEPS && renderProgress()}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} variants={stepVariants} initial="hidden" animate="visible" exit="exit">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < TOTAL_STEPS && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: GRID.spacing.md }}>
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
              fontSize: subtitleSize,
              fontWeight: 600,
              color: COLORS.gray[600],
              background: "transparent",
              border: `1px solid ${COLORS.gray[200]}`,
              borderRadius: RADIUS.button,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeft size={14} />
            {step === 1 ? "Back" : "Previous"}
          </button>

          <button
            onClick={handleNext}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
              fontSize: subtitleSize,
              fontWeight: 700,
              color: "white",
              background: COLORS.gradients.hero,
              border: "none",
              borderRadius: RADIUS.button,
              cursor: "pointer",
              boxShadow: SHADOW.glow.violet,
              transition: "all 0.15s ease",
            }}
          >
            {step === 3 ? "Submit Application" : "Next"}
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Back to landing (confirmation step) */}
      {step === TOTAL_STEPS && onBack && (
        <div style={{ textAlign: "center", marginTop: GRID.spacing.sm }}>
          <button
            onClick={onBack}
            style={{
              fontSize: embedded ? 11 : TYPE.caption,
              color: COLORS.gray[500],
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Back to landing page
          </button>
        </div>
      )}
    </div>
  );
}

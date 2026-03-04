import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, AlertCircle } from "lucide-react";
import { RADIUS, MOTION, TYPE, COLORS, spacing } from "@/lib/heritageDesignSystem";
import type { RegistrationFormData, StepErrors } from "./useRegistrationForm";

interface Props {
  formData: RegistrationFormData;
  updateField: <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => void;
  errors: StepErrors;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);

function getDaysInMonth(month: number, year: number) {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

const inputStyle = {
  paddingLeft: spacing(2),
  paddingRight: spacing(2),
  paddingTop: spacing(1.75),
  paddingBottom: spacing(1.75),
  borderRadius: RADIUS.input,
  transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
};

const selectClass = "w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white appearance-none";

export function StepPersonalInfo({ formData, updateField, errors }: Props) {
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // Parse existing dateOfBirth into parts
  const [dobYear, dobMonth, dobDay] = formData.dateOfBirth
    ? formData.dateOfBirth.split("-").map(Number)
    : [0, 0, 0];

  const updateDob = (part: "month" | "day" | "year", val: number) => {
    const m = part === "month" ? val : dobMonth;
    const d = part === "day" ? val : dobDay;
    const y = part === "year" ? val : dobYear;
    if (m && d && y) {
      const mm = String(m).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      updateField("dateOfBirth", `${y}-${mm}-${dd}`);
    } else if (m || d || y) {
      // Store partial so we can rebuild
      const mm = m ? String(m).padStart(2, "0") : "00";
      const dd = d ? String(d).padStart(2, "0") : "00";
      const yy = y || 0;
      updateField("dateOfBirth", `${yy}-${mm}-${dd}`);
    }
  };

  const maxDays = getDaysInMonth(dobMonth, dobYear || currentYear);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing(2.5) }}>
      <div>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(0.5) }}>
          Personal information
        </h3>
        <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
          Tell us a bit about yourself
        </p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2" style={{ gap: spacing(2) }}>
        <div>
          <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
            First Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="First name"
              className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
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
          <FieldError error={errors.firstName} />
        </div>
        <div>
          <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Last name"
            className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
            style={{
              paddingLeft: spacing(2),
              paddingRight: spacing(2),
              paddingTop: spacing(1.75),
              paddingBottom: spacing(1.75),
              borderRadius: RADIUS.input,
              transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
            }}
          />
          <FieldError error={errors.lastName} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", formatPhone(e.target.value))}
            placeholder="(555) 123-4567"
            className="w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white"
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
        <FieldError error={errors.phone} />
      </div>

      {/* Date of Birth - Dropdowns */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Date of Birth
        </label>
        <div className="grid grid-cols-3" style={{ gap: spacing(1) }}>
          <select
            value={dobMonth || ""}
            onChange={(e) => updateDob("month", Number(e.target.value))}
            className={selectClass}
            style={inputStyle}
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={dobDay || ""}
            onChange={(e) => updateDob("day", Number(e.target.value))}
            className={selectClass}
            style={inputStyle}
          >
            <option value="">Day</option>
            {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={dobYear || ""}
            onChange={(e) => updateDob("year", Number(e.target.value))}
            className={selectClass}
            style={inputStyle}
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <FieldError error={errors.dateOfBirth} />
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

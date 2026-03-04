import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertCircle } from "lucide-react";
import { RADIUS, MOTION, TYPE, COLORS, spacing } from "@/lib/heritageDesignSystem";
import { US_STATES } from "@/data/usStates";
import type { RegistrationFormData, StepErrors } from "./useRegistrationForm";

interface Props {
  formData: RegistrationFormData;
  updateField: <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => void;
  errors: StepErrors;
}

const inputStyle = {
  paddingLeft: spacing(2),
  paddingRight: spacing(2),
  paddingTop: spacing(1.75),
  paddingBottom: spacing(1.75),
  borderRadius: RADIUS.input,
  transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
};

const inputClass = "w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white";

const EXPERIENCE_OPTIONS = [
  { value: "none", label: "No experience" },
  { value: "less_than_1", label: "Less than 1 year" },
  { value: "1_3", label: "1-3 years" },
  { value: "3_5", label: "3-5 years" },
  { value: "5_10", label: "5-10 years" },
  { value: "10_plus", label: "10+ years" },
];

export function StepProfessional({ formData, updateField, errors }: Props) {
  const toggleLicensedState = (code: string) => {
    const current = formData.licensedStates || [];
    if (current.includes(code)) {
      updateField("licensedStates", current.filter((s) => s !== code));
    } else {
      updateField("licensedStates", [...current, code]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing(2.5) }}>
      <div>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(0.5) }}>
          Professional background
        </h3>
        <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
          Tell us about your insurance experience
        </p>
      </div>

      {/* Licensed status */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Are you currently licensed to sell insurance?
        </label>
        <div className="flex flex-col" style={{ gap: spacing(1) }}>
          {[
            { value: "yes", label: "Yes, I'm licensed" },
            { value: "no", label: "No, not yet" },
            { value: "in_progress", label: "In the process" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center cursor-pointer border hover:border-violet-300 transition-colors"
              style={{
                gap: spacing(1.5),
                padding: `${spacing(1.5)}px ${spacing(2)}px`,
                borderRadius: RADIUS.input,
                borderColor: formData.isLicensed === opt.value ? COLORS.primary.violet[500] : "#e5e7eb",
                backgroundColor: formData.isLicensed === opt.value ? "rgba(124, 58, 237, 0.04)" : "transparent",
              }}
            >
              <input
                type="radio"
                name="isLicensed"
                value={opt.value}
                checked={formData.isLicensed === opt.value}
                onChange={(e) => updateField("isLicensed", e.target.value)}
                className="w-4 h-4 text-violet-600 focus:ring-violet-500"
              />
              <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>{opt.label}</span>
            </label>
          ))}
        </div>
        <FieldError error={errors.isLicensed} />
      </div>

      {/* Conditional license fields */}
      <AnimatePresence>
        {formData.isLicensed === "yes" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: spacing(2), overflow: "hidden" }}
          >
            <div className="grid grid-cols-2" style={{ gap: spacing(2) }}>
              <div>
                <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                  License Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => updateField("licenseNumber", e.target.value)}
                  placeholder="License #"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                  NPN <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.npn}
                  onChange={(e) => updateField("npn", e.target.value)}
                  placeholder="National Producer #"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
                States licensed in
              </label>
              <div
                className="flex flex-wrap border"
                style={{
                  gap: spacing(0.5),
                  padding: spacing(1.5),
                  borderRadius: RADIUS.input,
                  borderColor: "#e5e7eb",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                {US_STATES.map((s) => {
                  const selected = (formData.licensedStates || []).includes(s.code);
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => toggleLicensedState(s.code)}
                      className="transition-colors font-medium"
                      style={{
                        padding: `4px ${spacing(1)}px`,
                        borderRadius: RADIUS.pill,
                        fontSize: TYPE.micro,
                        backgroundColor: selected ? COLORS.primary.violet[100] : "rgba(0,0,0,0.04)",
                        color: selected ? COLORS.primary.violet[700] : "#6b7280",
                        border: selected ? `1px solid ${COLORS.primary.violet[300]}` : "1px solid transparent",
                      }}
                    >
                      {s.code}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Years of experience - selectable cards */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Years of Insurance Experience
        </label>
        <div className="grid grid-cols-3" style={{ gap: spacing(1) }}>
          {EXPERIENCE_OPTIONS.map((opt) => {
            const selected = formData.yearsExperience === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField("yearsExperience", opt.value)}
                className="border text-center transition-colors font-medium"
                style={{
                  padding: `${spacing(1.5)}px ${spacing(1)}px`,
                  borderRadius: RADIUS.input,
                  borderColor: selected ? COLORS.primary.violet[500] : "#e5e7eb",
                  backgroundColor: selected ? "rgba(124, 58, 237, 0.04)" : "transparent",
                  color: selected ? COLORS.primary.violet[700] : "#374151",
                  fontSize: TYPE.meta,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <FieldError error={errors.yearsExperience} />
      </div>

      {/* Previous agency */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Previous Agency / Company <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.previousAgency}
          onChange={(e) => updateField("previousAgency", e.target.value)}
          placeholder="e.g. State Farm, Independent"
          className={inputClass}
          style={inputStyle}
        />
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

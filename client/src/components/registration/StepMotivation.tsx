import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Search, Users, Briefcase, Globe, Megaphone, Calendar, HelpCircle, ChevronDown } from "lucide-react";
import { RADIUS, MOTION, TYPE, COLORS, spacing } from "@/lib/heritageDesignSystem";
import { useQuery } from "@tanstack/react-query";
import type { RegistrationFormData, StepErrors } from "./useRegistrationForm";

interface Props {
  formData: RegistrationFormData;
  updateField: <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => void;
  errors: StepErrors;
}

const REFERRAL_SOURCES = [
  { value: "google", label: "Google Search", icon: Search },
  { value: "social_media", label: "Social Media", icon: Globe },
  { value: "referral", label: "Agent Referral", icon: Users },
  { value: "job_board", label: "Job Board", icon: Briefcase },
  { value: "industry_event", label: "Industry Event", icon: Calendar },
  { value: "other", label: "Other", icon: HelpCircle },
];

const inputStyle = {
  paddingLeft: spacing(2),
  paddingRight: spacing(2),
  paddingTop: spacing(1.75),
  paddingBottom: spacing(1.75),
  borderRadius: RADIUS.input,
  transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
};

const inputClass = "w-full border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50/50 hover:bg-white";

export function StepMotivation({ formData, updateField, errors }: Props) {
  const { data: uplineData } = useQuery<{ agents: { id: string; firstName: string; lastName: string; title: string }[] }>({
    queryKey: ["/api/agents/available-uplines"],
    staleTime: 1000 * 60 * 10,
  });

  const availableUplines = uplineData?.agents || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing(2.5) }}>
      <div>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(0.5) }}>
          Motivation & goals
        </h3>
        <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
          Help us understand what drives you
        </p>
      </div>

      {/* Why join Heritage */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Why do you want to join Heritage?
        </label>
        <textarea
          value={formData.whyJoinHeritage}
          onChange={(e) => updateField("whyJoinHeritage", e.target.value)}
          placeholder="Tell us about your goals, what motivates you, and what you're looking for in an agency..."
          rows={4}
          className={inputClass + " resize-none"}
          style={inputStyle}
        />
        <div className="flex justify-between mt-1">
          <FieldError error={errors.whyJoinHeritage} />
          <span
            style={{
              fontSize: TYPE.micro,
              color: formData.whyJoinHeritage.length >= 50 ? COLORS.semantic.success : "#9ca3af",
            }}
          >
            {formData.whyJoinHeritage.length}/50 min
          </span>
        </div>
      </div>

      {/* How did you hear about us - card grid */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          How did you hear about Heritage?
        </label>
        <div className="grid grid-cols-3" style={{ gap: spacing(1) }}>
          {REFERRAL_SOURCES.map((src) => {
            const selected = formData.referralSource === src.value;
            const Icon = src.icon;
            return (
              <button
                key={src.value}
                type="button"
                onClick={() => updateField("referralSource", src.value)}
                className="flex flex-col items-center border transition-colors"
                style={{
                  gap: spacing(0.75),
                  padding: `${spacing(1.5)}px ${spacing(1)}px`,
                  borderRadius: RADIUS.input,
                  borderColor: selected ? COLORS.primary.violet[500] : "#e5e7eb",
                  backgroundColor: selected ? "rgba(124, 58, 237, 0.04)" : "transparent",
                }}
              >
                <Icon
                  className="flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    color: selected ? COLORS.primary.violet[600] : "#9ca3af",
                  }}
                />
                <span
                  className="font-medium text-center leading-tight"
                  style={{
                    fontSize: TYPE.micro,
                    color: selected ? COLORS.primary.violet[700] : "#374151",
                  }}
                >
                  {src.label}
                </span>
              </button>
            );
          })}
        </div>
        <FieldError error={errors.referralSource} />
      </div>

      {/* Referring agent name (conditional) */}
      <AnimatePresence>
        {formData.referralSource === "referral" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
              Referring agent's name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.referringAgentName}
              onChange={(e) => updateField("referringAgentName", e.target.value)}
              placeholder="Who referred you?"
              className={inputClass}
              style={inputStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upline selector — visible when uplines exist in hierarchy */}
      {availableUplines.length > 0 && (
        <div>
          <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
            Select your upline <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <p className="text-gray-400 mb-2" style={{ fontSize: TYPE.caption }}>
            If you know who recruited you or who your manager will be, select them below.
          </p>
          <div className="relative">
            <select
              value={formData.preferredUplineId}
              onChange={(e) => updateField("preferredUplineId", e.target.value)}
              className={inputClass + " appearance-none pr-10"}
              style={inputStyle}
            >
              <option value="">I don't know / Skip</option>
              {availableUplines.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName} — {agent.title || "Agent"}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              style={{ width: 16, height: 16 }}
            />
          </div>
        </div>
      )}
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

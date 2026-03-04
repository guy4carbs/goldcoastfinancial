import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, AlertCircle, ChevronDown, Search } from "lucide-react";
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

function StateSelector({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = US_STATES.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedState = US_STATES.find((s) => s.code === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={inputClass + " flex items-center justify-between text-left"}
        style={inputStyle}
      >
        <span className={selectedState ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedState ? `${selectedState.code} — ${selectedState.name}` : "Select state"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full bg-white border border-gray-200 overflow-hidden"
            style={{ borderRadius: RADIUS.input, marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          >
            <div className="relative" style={{ padding: spacing(1) }}>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search states..."
                className="w-full border border-gray-100 bg-gray-50 focus:outline-none focus:border-violet-300"
                style={{ ...inputStyle, paddingLeft: spacing(4.5), paddingTop: spacing(1.25), paddingBottom: spacing(1.25), fontSize: TYPE.meta }}
              />
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {filtered.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => { onChange(s.code); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center text-left hover:bg-violet-50 transition-colors"
                  style={{ padding: `${spacing(1)}px ${spacing(1.5)}px`, gap: spacing(1.5) }}
                >
                  <span
                    className="flex-shrink-0 font-bold text-center"
                    style={{
                      width: 36,
                      fontSize: TYPE.meta,
                      color: value === s.code ? COLORS.primary.violet[600] : "#6b7280",
                    }}
                  >
                    {s.code}
                  </span>
                  <span
                    style={{
                      fontSize: TYPE.meta,
                      color: value === s.code ? COLORS.primary.violet[700] : "#374151",
                      fontWeight: value === s.code ? 600 : 400,
                    }}
                  >
                    {s.name}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-gray-400 text-center" style={{ padding: spacing(2), fontSize: TYPE.meta }}>No results</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FieldError error={error} />
    </div>
  );
}

export function StepAddress({ formData, updateField, errors }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing(2.5) }}>
      <div>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(0.5) }}>
          Your address
        </h3>
        <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
          Where are you located?
        </p>
      </div>

      {/* Street Address */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Street Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.streetAddress}
            onChange={(e) => updateField("streetAddress", e.target.value)}
            placeholder="123 Main Street"
            className={inputClass}
            style={{ ...inputStyle, paddingLeft: spacing(6) }}
          />
        </div>
        <FieldError error={errors.streetAddress} />
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          Apt, Suite, Unit <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => updateField("addressLine2", e.target.value)}
          placeholder="Apt 4B"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* City */}
      <div>
        <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
          City
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="Chicago"
          className={inputClass}
          style={inputStyle}
        />
        <FieldError error={errors.city} />
      </div>

      {/* State + ZIP row */}
      <div className="grid grid-cols-2" style={{ gap: spacing(2) }}>
        <div>
          <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
            State
          </label>
          <StateSelector value={formData.state} onChange={(v) => updateField("state", v)} error={errors.state} />
        </div>
        <div>
          <label className="block font-medium text-gray-700" style={{ fontSize: TYPE.meta, marginBottom: spacing(1) }}>
            ZIP Code
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => updateField("zipCode", e.target.value.replace(/[^\d-]/g, "").slice(0, 10))}
            placeholder="60601"
            className={inputClass}
            style={inputStyle}
          />
          <FieldError error={errors.zipCode} />
        </div>
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

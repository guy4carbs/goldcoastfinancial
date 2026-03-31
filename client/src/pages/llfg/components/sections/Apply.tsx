import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const SERIF = "'Playfair Display', serif";
const SANS = "'DM Sans', sans-serif";

function FloatingInput({
  label,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative mb-6">
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-[#B8963C]/40 text-white pt-6 pb-2 text-base outline-none peer focus:border-[#E8C96B] transition-colors"
        style={{ fontFamily: SANS }}
        placeholder=" "
      />
      <label
        className="absolute left-0 top-6 text-white/40 text-base transition-all duration-200 pointer-events-none peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-[#B8963C] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#B8963C]"
        style={{ fontFamily: SANS }}
      >
        {label}
      </label>
    </div>
  );
}

function FloatingSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative mb-6">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-[#B8963C]/40 text-white pt-6 pb-2 text-base outline-none peer focus:border-[#E8C96B] transition-colors appearance-none cursor-pointer"
        style={{ fontFamily: SANS }}
      >
        <option value="" disabled className="bg-[#1A1A1A]">
          {label}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#1A1A1A]">
            {opt}
          </option>
        ))}
      </select>
      <label
        className={`absolute left-0 text-white/40 transition-all duration-200 pointer-events-none ${
          value ? "top-1 text-xs text-[#B8963C]" : "top-6 text-base"
        }`}
        style={{ fontFamily: SANS }}
      >
        {label}
      </label>
    </div>
  );
}

function FloatingTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative mb-6">
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-[#B8963C]/40 text-white pt-6 pb-2 text-base outline-none peer focus:border-[#E8C96B] transition-colors resize-none"
        style={{ fontFamily: SANS }}
        placeholder=" "
      />
      <label
        className="absolute left-0 top-6 text-white/40 text-base transition-all duration-200 pointer-events-none peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-[#B8963C] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#B8963C]"
        style={{ fontFamily: SANS }}
      >
        {label}
      </label>
    </div>
  );
}

export default function Apply() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"agent" | "agency">("agent");
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Agent form state
  const [agentForm, setAgentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    experience: "",
    licensed: "",
    incomeGoal: "",
    referredBy: "",
    message: "",
  });

  // Agency form state
  const [agencyForm, setAgencyForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agencyName: "",
    statesLicensed: "",
    numAgents: "",
    monthlyAP: "",
    currentCarriers: "",
    referredBy: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const agentField = (key: keyof typeof agentForm) => ({
    value: agentForm[key],
    onChange: (v: string) => setAgentForm((f) => ({ ...f, [key]: v })),
  });

  const agencyField = (key: keyof typeof agencyForm) => ({
    value: agencyForm[key],
    onChange: (v: string) => setAgencyForm((f) => ({ ...f, [key]: v })),
  });

  return (
    <section id="apply" ref={ref} className="py-20 md:py-28 bg-[#111111]" style={{ fontFamily: SANS }}>
      <div className="max-w-xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2
            className="text-3xl md:text-4xl text-white font-bold text-center mb-10"
            style={{ fontFamily: SERIF }}
          >
            Start Your <em className="italic text-[#E8C96B]">Journey</em>
          </h2>

          {/* Tab bar */}
          <div className="flex gap-8 border-b border-white/10 mb-8">
            {(["agent", "agency"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSubmitted(false);
                }}
                className={`text-base pb-3 font-medium transition-colors ${
                  activeTab === tab
                    ? "text-[#E8C96B] border-b-2 border-[#E8C96B] -mb-px"
                    : "text-white/40 hover:text-white/70"
                }`}
                style={{ fontFamily: SANS }}
              >
                {tab === "agent" ? "Agent Application" : "Agency Partnership"}
              </button>
            ))}
          </div>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#E8C96B] font-medium mt-4 text-center"
            >
              &#10003; Application received. We&rsquo;ll be in touch within one
              business day.
            </motion.p>
          ) : activeTab === "agent" ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <FloatingInput label="First Name" required {...agentField("firstName")} />
                <FloatingInput label="Last Name" required {...agentField("lastName")} />
              </div>
              <FloatingInput label="Email" type="email" required {...agentField("email")} />
              <FloatingInput label="Phone" type="tel" {...agentField("phone")} />
              <FloatingInput label="State" {...agentField("state")} />

              {/* Expandable section */}
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-[#B8963C] text-sm font-medium mb-6 hover:text-[#E8C96B] transition-colors"
              >
                {expanded ? "Less details \u25B4" : "More details \u25BE"}
              </button>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <FloatingSelect
                    label="Experience Level"
                    options={["New to Insurance", "1-2 Years", "3-5 Years", "5-10 Years", "10+ Years"]}
                    {...agentField("experience")}
                  />
                  <FloatingSelect
                    label="Currently Licensed?"
                    options={["Yes", "No", "In Progress"]}
                    {...agentField("licensed")}
                  />
                  <FloatingSelect
                    label="Income Goal (Monthly)"
                    options={["$5K-$10K", "$10K-$20K", "$20K-$50K", "$50K+"]}
                    {...agentField("incomeGoal")}
                  />
                  <FloatingInput label="Referred By" {...agentField("referredBy")} />
                  <FloatingTextarea label="Message" {...agentField("message")} />
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full mt-8 bg-[#B8963C] hover:bg-[#E8C96B] hover:text-[#0A0A0A] text-white font-medium text-lg py-4 rounded-lg transition-all duration-200 border-none cursor-pointer"
                style={{ fontFamily: SANS }}
              >
                Submit Application &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <FloatingInput label="First Name" required {...agencyField("firstName")} />
                <FloatingInput label="Last Name" required {...agencyField("lastName")} />
              </div>
              <FloatingInput label="Business Email" type="email" required {...agencyField("email")} />
              <FloatingInput label="Phone" type="tel" {...agencyField("phone")} />
              <FloatingInput label="Agency Name" {...agencyField("agencyName")} />
              <FloatingInput label="States Licensed" {...agencyField("statesLicensed")} />
              <FloatingSelect
                label="Number of Agents"
                options={["1-5", "6-15", "16-39", "40-99", "100+"]}
                {...agencyField("numAgents")}
              />
              <FloatingSelect
                label="Monthly AP Volume"
                options={["Under $50K", "$50K-$100K", "$100K-$250K", "$250K-$500K", "$500K+"]}
                {...agencyField("monthlyAP")}
              />
              <FloatingInput label="Current Carriers" {...agencyField("currentCarriers")} />
              <FloatingInput label="Referred By" {...agencyField("referredBy")} />
              <FloatingTextarea label="Message" {...agencyField("message")} />

              <button
                type="submit"
                className="w-full mt-8 bg-[#B8963C] hover:bg-[#E8C96B] hover:text-[#0A0A0A] text-white font-medium text-lg py-4 rounded-lg transition-all duration-200 border-none cursor-pointer"
                style={{ fontFamily: SANS }}
              >
                Submit Application &rarr;
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

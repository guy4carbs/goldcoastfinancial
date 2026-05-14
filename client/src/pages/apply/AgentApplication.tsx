import { useMemo } from "react";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { useApplicationForm } from "./useApplicationForm";
import { ApplicationHeader } from "./components/ApplicationHeader";
import { ApplicationNav } from "./components/ApplicationNav";
import { StepWelcome } from "./steps/StepWelcome";
import { StepAccountSetup } from "./steps/StepAccountSetup";
import { StepPersonalInfo } from "./steps/StepPersonalInfo";
import { StepAddress } from "./steps/StepAddress";
import { StepDBAType } from "./steps/StepDBAType";
import { StepBusinessEntity } from "./steps/StepBusinessEntity";
import { StepDRLP } from "./steps/StepDRLP";
import { StepBusinessContact } from "./steps/StepBusinessContact";
import { StepBeneficiary } from "./steps/StepBeneficiary";
import { StepProfessional } from "./steps/StepProfessional";
import { StepBackgroundQuestions } from "./steps/StepBackgroundQuestions";
import { StepBanking } from "./steps/StepBanking";
import { StepEOInsurance } from "./steps/StepEOInsurance";
import { StepTrainings } from "./steps/StepTrainings";
import { StepDocumentSigning } from "./steps/StepDocumentSigning";
import { StepReview } from "./steps/StepReview";

// Step IDs — the sequence changes based on individual vs business entity
type StepId = "welcome" | "account" | "personal" | "address" | "dba_type" | "business_entity" | "drlp" | "business_contact" | "beneficiary" | "professional" | "questions" | "banking" | "eo" | "trainings" | "signing" | "review";

const INDIVIDUAL_STEPS: StepId[] = [
  "welcome", "account", "personal", "address", "dba_type",
  "professional", "questions", "banking", "eo", "trainings", "signing", "review",
];

const BUSINESS_STEPS: StepId[] = [
  "welcome", "account", "personal", "address", "dba_type", "business_entity", "drlp", "business_contact", "beneficiary",
  "questions", "banking", "eo", "trainings", "signing", "review",
];

const STEP_LABELS: Record<StepId, string> = {
  welcome: "Welcome", account: "Account", personal: "Personal", address: "Address",
  dba_type: "Contracting Type", business_entity: "Entity Details", drlp: "DRLP Verification", business_contact: "Business Contact", beneficiary: "Beneficiary",
  professional: "Professional", questions: "Background", banking: "Banking", eo: "E&O Insurance",
  trainings: "Trainings", signing: "Signing", review: "Review",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)",
  backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)",
  fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-md)", outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase", color: "var(--gc-text-muted)",
  display: "block", marginBottom: "var(--gc-space-1)", fontWeight: 500,
};

export default function AgentApplication() {
  const {
    form, set, step, setStep, errors,
    token, isInvite, loading, submitted, submitting,
    backgroundAnswers, setBackgroundAnswers,
    signing, handleSigned,
    uploads, handleUploaded,
    next, prev, submit,
  } = useApplicationForm();

  // Dynamic step sequence based on DBA type
  const steps = useMemo(() => {
    return form.dbaType === "business_entity" ? BUSINESS_STEPS : INDIVIDUAL_STEPS;
  }, [form.dbaType]);

  const currentStepId = steps[step] || "welcome";
  const totalSteps = steps.length;
  const isLastStep = step === totalSteps - 1;
  const showNav = step > 0 && step < totalSteps;
  const headerLabels = steps.map(s => STEP_LABELS[s]);

  if (loading) {
    return (
      <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gc-bg)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gc-gold)" }} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div data-theme="gc-dark" className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--gc-bg)" }}>
        <div className="text-center p-8" style={{ maxWidth: 560 }}>
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--gc-status-active)" }} />
          <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-4xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Application Submitted</h1>
          <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>
            Thank you for applying to Gold Coast Financial Partners. Our team is reviewing your application now.
          </p>
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "var(--gc-space-3)",
            padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)",
            backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)", textAlign: "left",
          }}>
            <Mail className="w-6 h-6 flex-shrink-0" style={{ color: "var(--gc-gold)" }} />
            <div>
              <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", color: "var(--gc-text-primary)", fontWeight: 600, marginBottom: "var(--gc-space-1)" }}>
                Check your email
              </div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", lineHeight: 1.55 }}>
                You'll receive a message about your approval status as soon as our team finishes reviewing — typically within 48 hours.
              </div>
            </div>
          </div>
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
            You can safely close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="gc-dark" className="min-h-screen" style={{ backgroundColor: "var(--gc-bg)", fontFamily: "var(--gc-font-body)" }}>
      <ApplicationHeader step={step} totalSteps={totalSteps} labels={headerLabels} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {currentStepId === "welcome" && <StepWelcome firstName={isInvite ? form.firstName : undefined} onBegin={next} />}
        {currentStepId === "account" && <StepAccountSetup form={form} set={set} errors={errors} isInvite={isInvite} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "personal" && <StepPersonalInfo form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "address" && <StepAddress form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "dba_type" && <StepDBAType form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "business_entity" && <StepBusinessEntity form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} token={token || ""} />}
        {currentStepId === "drlp" && <StepDRLP form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "business_contact" && <StepBusinessContact form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "beneficiary" && <StepBeneficiary form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "professional" && <StepProfessional form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "questions" && <StepBackgroundQuestions answers={backgroundAnswers} setAnswers={setBackgroundAnswers} />}
        {currentStepId === "banking" && <StepBanking form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "eo" && <StepEOInsurance form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} token={token || ""} />}
        {currentStepId === "trainings" && <StepTrainings form={form} set={set} errors={errors} inputStyle={inputStyle} labelStyle={labelStyle} />}
        {currentStepId === "signing" && <StepDocumentSigning token={token || ""} signing={signing} onSigned={handleSigned} />}
        {currentStepId === "review" && (
          <>
            <StepReview form={form} signing={signing} backgroundAnswers={backgroundAnswers} onEdit={setStep} steps={steps} />
            <div style={{ marginTop: "var(--gc-space-4)", padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
              <label className="flex items-start gap-3 cursor-pointer mb-3">
                <input type="checkbox" checked={form.agreedToTerms} onChange={e => set("agreedToTerms", e.target.checked)} style={{ marginTop: 3 }} />
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>I agree to the Gold Coast Financial Partners LLC Terms of Service</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreedToPrivacy} onChange={e => set("agreedToPrivacy", e.target.checked)} style={{ marginTop: 3 }} />
                <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>I agree to the Privacy Policy and consent to the processing of my personal data</span>
              </label>
            </div>
            {errors._ && <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{errors._}</div>}
          </>
        )}

        {/* Global step error */}
        {errors._ && currentStepId !== "review" && (
          <div style={{ marginTop: "var(--gc-space-2)", fontSize: "var(--gc-text-sm)", color: "var(--gc-status-terminated)" }}>{errors._}</div>
        )}

        {/* Navigation */}
        {showNav && (
          <ApplicationNav
            step={step}
            totalSteps={totalSteps}
            onBack={prev}
            onNext={isLastStep ? submit : next}
            nextLabel={isLastStep ? "Submit Application" : undefined}
            nextDisabled={isLastStep ? (!form.agreedToTerms || !form.agreedToPrivacy) : false}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
}

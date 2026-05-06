import { CheckCircle, Clock, Edit2 } from "lucide-react";
import type { BackgroundAnswer } from "../backgroundQuestions";

interface Props {
  form: Record<string, any>;
  signing: { nda_status: string; debt_rollup_status: string; compliance_status: string };
  backgroundAnswers: BackgroundAnswer[];
  onEdit: (step: number) => void;
  steps: string[];
}

function formatPhone(raw: string): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw;
}

function maskSSN(raw: string): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 4) return `***-**-${digits.slice(-4)}`;
  return "***";
}

function Section({ title, stepId, steps, onEdit, children }: { title: string; stepId: string; steps: string[]; onEdit: (s: number) => void; children: React.ReactNode }) {
  const idx = steps.indexOf(stepId);
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-3)" }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-text-muted)", fontWeight: 600 }}>{title}</span>
        {idx >= 0 && (
          <button onClick={() => onEdit(idx)} className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", background: "none", border: "none", cursor: "pointer" }}>
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{label}</span>
      <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );
}

function StatusIcon({ done }: { done: boolean }) {
  return done
    ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} />
    : <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />;
}

export function StepReview({ form, signing, backgroundAnswers, onEdit, steps }: Props) {
  const flaggedCount = backgroundAnswers.filter(a => a.answer === "Yes").length;
  const isBusiness = form.dbaType === "business_entity";

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Review & Submit</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Please review your information before submitting.</p>

      <Section title="Account" stepId="account" steps={steps} onEdit={onEdit}>
        <Row label="Email" value={form.email} />
      </Section>

      <Section title="Personal Information" stepId="personal" steps={steps} onEdit={onEdit}>
        <Row label="Name" value={`${form.firstName} ${form.lastName}`} />
        <Row label="Date of Birth" value={form.dateOfBirth} />
        <Row label="Phone" value={formatPhone(form.phone)} />
        <Row label="SSN" value={maskSSN(form.ssn)} />
      </Section>

      <Section title="Address" stepId="address" steps={steps} onEdit={onEdit}>
        <Row label="Address" value={[form.streetAddress, form.addressLine2].filter(Boolean).join(", ")} />
        <Row label="City, State ZIP" value={`${form.city}, ${form.state} ${form.zipCode}`} />
      </Section>

      <Section title="Contracting Type" stepId="dba_type" steps={steps} onEdit={onEdit}>
        <Row label="Type" value={isBusiness ? "Business Entity" : "Individual"} />
        {isBusiness && <Row label="Company" value={form.companyName} />}
        {isBusiness && <Row label="Title" value={form.title} />}
        {isBusiness && <Row label="EIN" value={form.ein ? `${form.ein.slice(0, 2)}-${form.ein.slice(2)}` : "—"} />}
      </Section>

      {/* Business-only sections */}
      {isBusiness && (
        <>
          <Section title="Entity Details" stepId="business_entity" steps={steps} onEdit={onEdit}>
            <Row label="Company Type" value={form.companyType} />
            <Row label="State of Inc." value={form.stateOfInc} />
            <Row label="License Type" value={form.licenseType === "life_health" ? "Life & Health" : form.licenseType === "life" ? "Life" : "—"} />
            <Row label="Formation Date" value={form.formationDate} />
            <Row label="Owners" value={`${(form.owners || []).length} owner(s)`} />
            <Row label="Articles" value={form.articlesUploaded ? "Uploaded" : "Missing"} />
          </Section>

          <Section title="DRLP Verification" stepId="drlp" steps={steps} onEdit={onEdit}>
            <Row label="Name" value={[form.drlpFirstName, form.drlpMiddleName, form.drlpLastName].filter(Boolean).join(" ")} />
            <Row label="NPN" value={form.drlpNpn} />
            <Row label="Email" value={form.drlpEmail} />
            <Row label="Phone" value={formatPhone(form.drlpPhone)} />
            <Row label="Birthplace" value={[form.drlpBirthCity, form.drlpBirthState].filter(Boolean).join(", ")} />
          </Section>

          <Section title="Business Contact" stepId="business_contact" steps={steps} onEdit={onEdit}>
            <Row label="Email" value={form.businessEmail} />
            <Row label="Phone" value={formatPhone(form.businessPhone)} />
            <Row label="Address" value={[form.businessStreet, form.businessUnit].filter(Boolean).join(", ")} />
            <Row label="City, State ZIP" value={`${form.businessCity || ""}, ${form.businessState || ""} ${form.businessZip || ""}`} />
          </Section>

          <Section title="Beneficiary" stepId="beneficiary" steps={steps} onEdit={onEdit}>
            <Row label="Name" value={`${form.beneficiaryFirstName || ""} ${form.beneficiaryLastName || ""}`} />
            <Row label="Relationship" value={form.beneficiaryRelationship} />
            <Row label="Email" value={form.beneficiaryEmail} />
            <Row label="Phone" value={formatPhone(form.beneficiaryPhone)} />
          </Section>
        </>
      )}

      {/* Individual-only: Professional */}
      {!isBusiness && (
        <Section title="Professional" stepId="professional" steps={steps} onEdit={onEdit}>
          <Row label="NPN" value={form.npn} />
          <Row label="Licensed" value={form.isLicensed} />
          <Row label="Experience" value={form.yearsExperience} />
        </Section>
      )}

      <Section title="Background Questions" stepId="questions" steps={steps} onEdit={onEdit}>
        <Row label="Questions Answered" value={`${backgroundAnswers.length}/19`} />
        <Row label="Flagged (Yes)" value={flaggedCount > 0 ? `${flaggedCount} question${flaggedCount > 1 ? "s" : ""}` : "None"} />
      </Section>

      <Section title="Banking" stepId="banking" steps={steps} onEdit={onEdit}>
        <Row label="Bank" value={form.bankName} />
        <Row label="Account Type" value={form.bankAccountType} />
        <Row label="Routing" value={form.routingNumber ? `***${form.routingNumber.slice(-4)}` : "—"} />
        <Row label="Direct Deposit Form" value={form.ddFormUploaded ? "Uploaded" : "Missing"} />
      </Section>

      <Section title="E&O Insurance" stepId="eo" steps={steps} onEdit={onEdit}>
        <Row label="Provider" value={form.eoProvider} />
        <Row label="Policy #" value={form.eoPolicyNumber} />
        <Row label="Coverage" value={form.eoCoverageAmount ? `$${Number(form.eoCoverageAmount).toLocaleString()}` : "—"} />
        <Row label="Expires" value={form.eoExpirationDate} />
        <Row label="E&O Certificate" value={form.eoCertUploaded ? "Uploaded" : "Missing"} />
      </Section>

      <Section title="Trainings" stepId="trainings" steps={steps} onEdit={onEdit}>
        <Row label="AML Certificate" value={form.amlCertUploaded ? "Uploaded" : "Missing"} />
        <Row label="Government ID" value={form.govIdUploaded ? "Uploaded" : "Missing"} />
        <Row label="CE Expiration" value={form.ceExpirationDate || "—"} />
      </Section>

      <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-3)" }}>
        <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-text-muted)", fontWeight: 600, display: "block", marginBottom: "var(--gc-space-2)" }}>Signed Documents</span>
        <div className="flex flex-col gap-2">
          {[
            { label: "NDA", done: signing.nda_status === "signed" },
            { label: "Debt Roll-Up", done: signing.debt_rollup_status === "signed" },
            { label: "Compliance", done: signing.compliance_status === "signed" },
          ].map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <StatusIcon done={d.done} />
              <span style={{ fontSize: "var(--gc-text-sm)", color: d.done ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

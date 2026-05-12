import { useState, useEffect, useCallback, useMemo } from "react";
import { accountSchema, personalSchema, addressSchema, professionalSchema, bankingSchema, eoSchema } from "./applicationSchema";
import type { BackgroundAnswer } from "./backgroundQuestions";
import { SURELC_QUESTIONS } from "./backgroundQuestions";

type StepId = "welcome" | "account" | "personal" | "address" | "dba_type" | "business_entity" | "drlp" | "business_contact" | "beneficiary" | "professional" | "questions" | "banking" | "eo" | "trainings" | "signing" | "review";

const INDIVIDUAL_STEPS: StepId[] = [
  "welcome", "account", "personal", "address", "dba_type",
  "professional", "questions", "banking", "eo", "trainings", "signing", "review",
];

const BUSINESS_STEPS: StepId[] = [
  "welcome", "account", "personal", "address", "dba_type", "business_entity", "drlp", "business_contact", "beneficiary",
  "questions", "banking", "eo", "trainings", "signing", "review",
];

export interface ApplicationFormState {
  // Step 1 - Account
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 - Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  phone: string;
  // Step 3 - Address
  streetAddress: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  // Step 4 - Professional
  npn: string;
  isLicensed: string;
  licenseNumber: string;
  licensedStates: string[];
  yearsExperience: string;
  previousAgency: string;
  dbaType: string;
  companyName: string;
  title: string;
  ein: string;
  // Business entity details
  companyType: string;
  stateOfInc: string;
  dbaName: string;
  businessEmail: string;
  businessPhone: string;
  businessFax: string;
  businessWebsite: string;
  businessStreet: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  mailingSameAsBusiness: boolean;
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  // Business entity extended
  licenseType: string;
  formationDate: string;
  articlesUploaded: boolean;
  articlesFileName: string;
  owners: any[];
  // DRLP
  drlpFirstName: string;
  drlpMiddleName: string;
  drlpLastName: string;
  drlpDob: string;
  drlpNpn: string;
  drlpSsn: string;
  drlpEmail: string;
  drlpPhone: string;
  drlpBirthCity: string;
  drlpBirthState: string;
  // Beneficiary
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  beneficiaryRelationship: string;
  beneficiaryDob: string;
  beneficiarySsn: string;
  beneficiaryEmail: string;
  beneficiaryPhone: string;
  beneficiaryStreet: string;
  beneficiaryUnit: string;
  beneficiaryCity: string;
  beneficiaryState: string;
  beneficiaryZip: string;
  // Upload tracking
  ddFormUploaded: boolean;
  ddFormFileName: string;
  eoCertUploaded: boolean;
  eoCertFileName: string;
  amlCertUploaded: boolean;
  amlCertFileName: string;
  govIdUploaded: boolean;
  govIdFileName: string;
  ceExpirationDate: string;
  // Banking
  bankName: string;
  bankAccountType: string;
  routingNumber: string;
  accountNumber: string;
  // Step 7 - E&O
  eoProvider: string;
  eoPolicyNumber: string;
  eoEffectiveDate: string;
  eoExpirationDate: string;
  eoCoverageAmount: string;
  // Consent
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

const INITIAL_FORM: ApplicationFormState = {
  email: "", password: "", confirmPassword: "",
  firstName: "", lastName: "", dateOfBirth: "", ssn: "", phone: "",
  streetAddress: "", addressLine2: "", city: "", state: "", zipCode: "",
  npn: "", isLicensed: "no", licenseNumber: "", licensedStates: [],
  yearsExperience: "", previousAgency: "", dbaType: "", companyName: "", title: "", ein: "",
  companyType: "", stateOfInc: "", dbaName: "", businessEmail: "", businessPhone: "",
  businessFax: "", businessWebsite: "", businessStreet: "", businessCity: "", businessState: "", businessZip: "",
  mailingSameAsBusiness: false, mailingStreet: "", mailingCity: "", mailingState: "", mailingZip: "",
  licenseType: "", formationDate: "", articlesUploaded: false, articlesFileName: "", owners: [],
  drlpFirstName: "", drlpMiddleName: "", drlpLastName: "", drlpDob: "", drlpNpn: "", drlpSsn: "", drlpEmail: "", drlpPhone: "", drlpBirthCity: "", drlpBirthState: "",
  beneficiaryFirstName: "", beneficiaryLastName: "", beneficiaryRelationship: "", beneficiaryDob: "", beneficiarySsn: "", beneficiaryEmail: "", beneficiaryPhone: "", beneficiaryStreet: "", beneficiaryUnit: "", beneficiaryCity: "", beneficiaryState: "", beneficiaryZip: "",
  ddFormUploaded: false, ddFormFileName: "", eoCertUploaded: false, eoCertFileName: "", amlCertUploaded: false, amlCertFileName: "", govIdUploaded: false, govIdFileName: "", ceExpirationDate: "",
  bankName: "", bankAccountType: "", routingNumber: "", accountNumber: "",
  eoProvider: "", eoPolicyNumber: "", eoEffectiveDate: "", eoExpirationDate: "", eoCoverageAmount: "",
  agreedToTerms: false, agreedToPrivacy: false,
};

interface SigningStatus { nda_status: string; debt_rollup_status: string; compliance_status: string; }
interface UploadStatus { eoCert: boolean; govId: boolean; amlCert: boolean; directDeposit: boolean; }

export function useApplicationForm() {
  const [form, setForm] = useState<ApplicationFormState>(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);
  const [isInvite, setIsInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [backgroundAnswers, setBackgroundAnswers] = useState<BackgroundAnswer[]>([]);
  const [signing, setSigning] = useState<SigningStatus>({ nda_status: "pending", debt_rollup_status: "pending", compliance_status: "pending" });
  const [uploads, setUploads] = useState<UploadStatus>({ eoCert: false, govId: false, amlCert: false, directDeposit: false });
  const [userId, setUserId] = useState<string | null>(null);

  // Read token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setIsInvite(true);
      // Fetch prefill data
      fetch(`/api/apply/prefill?token=${t}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            // Unpack DRLP JSON into individual fields
            const drlp = data.drlp || {};
            const bene = data.beneficiary || {};

            setForm(prev => ({
              ...prev,
              // Personal
              email: data.email || prev.email,
              firstName: data.firstName || prev.firstName,
              lastName: data.lastName || prev.lastName,
              phone: data.phone || prev.phone,
              npn: data.npn || prev.npn,
              dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
              // Address
              streetAddress: data.streetAddress || prev.streetAddress,
              city: data.city || prev.city,
              state: data.state || prev.state,
              zipCode: data.zipCode || prev.zipCode,
              // Professional
              yearsExperience: data.yearsExperience || prev.yearsExperience,
              previousAgency: data.previousAgency || prev.previousAgency,
              isLicensed: data.isLicensed || prev.isLicensed,
              licenseNumber: data.licenseNumber || prev.licenseNumber,
              licensedStates: data.licensedStates ? data.licensedStates.split(",").filter(Boolean) : prev.licensedStates,
              // DBA
              dbaType: data.dbaType || prev.dbaType,
              companyName: data.companyName || prev.companyName,
              title: data.title || prev.title,
              ein: data.ein || prev.ein,
              companyType: data.companyType || prev.companyType,
              stateOfInc: data.stateOfInc || prev.stateOfInc,
              dbaName: data.dbaName || prev.dbaName,
              licenseType: data.licenseType || prev.licenseType,
              formationDate: data.formationDate || prev.formationDate,
              articlesUploaded: !!data.articlesKey || prev.articlesUploaded,
              owners: data.owners?.length ? data.owners : prev.owners,
              // Business contact
              businessEmail: data.businessEmail || prev.businessEmail,
              businessPhone: data.businessPhone || prev.businessPhone,
              businessFax: data.businessFax || prev.businessFax,
              businessWebsite: data.businessWebsite || prev.businessWebsite,
              businessStreet: data.businessStreet || prev.businessStreet,
              businessCity: data.businessCity || prev.businessCity,
              businessState: data.businessState || prev.businessState,
              businessZip: data.businessZip || prev.businessZip,
              // Mailing
              mailingSameAsBusiness: data.mailingSameAsBusiness || prev.mailingSameAsBusiness,
              mailingStreet: data.mailingStreet || prev.mailingStreet,
              mailingCity: data.mailingCity || prev.mailingCity,
              mailingState: data.mailingState || prev.mailingState,
              mailingZip: data.mailingZip || prev.mailingZip,
              // DRLP (unpacked from JSON)
              drlpFirstName: drlp.firstName || prev.drlpFirstName,
              drlpMiddleName: drlp.middleName || prev.drlpMiddleName,
              drlpLastName: drlp.lastName || prev.drlpLastName,
              drlpDob: drlp.dob || prev.drlpDob,
              drlpNpn: drlp.npn || prev.drlpNpn,
              drlpSsn: drlp.ssn || prev.drlpSsn,
              drlpEmail: drlp.email || prev.drlpEmail,
              drlpPhone: drlp.phone || prev.drlpPhone,
              drlpBirthCity: drlp.birthCity || prev.drlpBirthCity,
              drlpBirthState: drlp.birthState || prev.drlpBirthState,
              // Beneficiary (unpacked from JSON)
              beneficiaryFirstName: bene.firstName || prev.beneficiaryFirstName,
              beneficiaryLastName: bene.lastName || prev.beneficiaryLastName,
              beneficiaryRelationship: bene.relationship || prev.beneficiaryRelationship,
              beneficiaryDob: bene.dob || prev.beneficiaryDob,
              beneficiarySsn: bene.ssn || prev.beneficiarySsn,
              beneficiaryEmail: bene.email || prev.beneficiaryEmail,
              beneficiaryPhone: bene.phone || prev.beneficiaryPhone,
              beneficiaryStreet: bene.street || prev.beneficiaryStreet,
              beneficiaryUnit: bene.unit || prev.beneficiaryUnit,
              beneficiaryCity: bene.city || prev.beneficiaryCity,
              beneficiaryState: bene.state || prev.beneficiaryState,
              beneficiaryZip: bene.zip || prev.beneficiaryZip,
              // Banking + E&O
              bankName: data.bankName || prev.bankName,
              bankAccountType: data.bankAccountType || prev.bankAccountType,
              eoProvider: data.eoProvider || prev.eoProvider,
              eoPolicyNumber: data.eoPolicyNumber || prev.eoPolicyNumber,
              eoEffectiveDate: data.eoEffectiveDate || prev.eoEffectiveDate,
              eoExpirationDate: data.eoExpirationDate || prev.eoExpirationDate,
              eoCoverageAmount: data.eoCoverageAmount || prev.eoCoverageAmount,
              ceExpirationDate: data.ceExpirationDate || prev.ceExpirationDate,
              // Upload tracking
              eoCertUploaded: !!data.eoCertificateKey || prev.eoCertUploaded,
              govIdUploaded: !!data.driversLicenseKey || prev.govIdUploaded,
              amlCertUploaded: !!data.amlCertificateKey || prev.amlCertUploaded,
              ddFormUploaded: !!data.directDepositFormKey || prev.ddFormUploaded,
            }));
            if (data.backgroundAnswers) {
              const parsed = typeof data.backgroundAnswers === "string" ? JSON.parse(data.backgroundAnswers) : data.backgroundAnswers;
              if (parsed?.length) setBackgroundAnswers(parsed);
            }
            if (data.signing) setSigning(data.signing);
            if (data.uploads) setUploads(data.uploads);
            if (data.userId) setUserId(data.userId);
            if (data.onboardingStep > 0) setStep(data.onboardingStep);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const set = useCallback((key: string, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  // Dynamic step sequence
  const steps = useMemo(() => {
    return form.dbaType === "business_entity" ? BUSINESS_STEPS : INDIVIDUAL_STEPS;
  }, [form.dbaType]);

  const currentStepId = steps[step] || "welcome";

  // Validate current step by step ID
  const validateStep = useCallback((): boolean => {
    setErrors({});
    let schema: any = null;
    const sid = steps[step] || "welcome";

    switch (sid) {
      case "account": schema = accountSchema; break;
      case "personal": schema = personalSchema; break;
      case "address": schema = addressSchema; break;
      case "dba_type":
        if (!form.dbaType) { setErrors({ _: "Please select Individual or Business Entity" }); return false; }
        if (form.dbaType === "business_entity") {
          const errs: Record<string, string> = {};
          if (!form.companyName?.trim()) errs.companyName = "Required";
          if (!form.title?.trim()) errs.title = "Required";
          if (!form.ein?.trim() || form.ein.replace(/\D/g, "").length !== 9) errs.ein = "Valid 9-digit EIN required";
          if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
        }
        return true;
      case "business_entity": {
        const errs: Record<string, string> = {};
        if (!form.companyType) errs.companyType = "Required";
        if (!form.stateOfInc) errs.stateOfInc = "Required";
        if (!form.licenseType) errs.licenseType = "Required";
        if (!form.formationDate) errs.formationDate = "Required";
        if (!form.articlesUploaded) errs.articlesUploaded = "Articles of Incorporation required";
        const owners = form.owners || [];
        if (owners.length === 0) { errs.owners = "At least one owner required"; }
        else {
          const total = owners.reduce((s: number, o: any) => s + (o.ownershipPercent || 0), 0);
          if (total !== 100) errs.owners = `Ownership must total 100% (currently ${total}%)`;
          for (const o of owners) {
            if (!o.firstName?.trim() || !o.lastName?.trim() || !o.dateOfBirth || !o.ssn || !o.streetAddress?.trim()) {
              errs.owners = "All owner fields are required (name, DOB, SSN, address)";
              break;
            }
          }
        }
        if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
        return true;
      }
      case "drlp": {
        const errs: Record<string, string> = {};
        if (!form.drlpFirstName?.trim()) errs.drlpFirstName = "Required";
        if (!form.drlpLastName?.trim()) errs.drlpLastName = "Required";
        if (!form.drlpDob) errs.drlpDob = "Required";
        if (!form.drlpNpn?.trim()) errs.drlpNpn = "Required";
        if (!form.drlpSsn?.trim() || form.drlpSsn.replace(/\D/g, "").length !== 9) errs.drlpSsn = "Valid SSN required";
        if (!form.drlpEmail?.trim()) errs.drlpEmail = "Required";
        if (!form.drlpPhone?.trim()) errs.drlpPhone = "Required";
        if (!form.drlpBirthCity?.trim()) errs.drlpBirthCity = "Required";
        if (!form.drlpBirthState) errs.drlpBirthState = "Required";
        if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
        return true;
      }
      case "beneficiary": {
        const errs: Record<string, string> = {};
        if (!form.beneficiaryFirstName?.trim()) errs.beneficiaryFirstName = "Required";
        if (!form.beneficiaryLastName?.trim()) errs.beneficiaryLastName = "Required";
        if (!form.beneficiaryRelationship) errs.beneficiaryRelationship = "Required";
        if (!form.beneficiaryDob) errs.beneficiaryDob = "Required";
        if (!form.beneficiarySsn?.trim() || form.beneficiarySsn.replace(/\D/g, "").length !== 9) errs.beneficiarySsn = "Valid SSN required";
        if (!form.beneficiaryEmail?.trim()) errs.beneficiaryEmail = "Required";
        if (!form.beneficiaryPhone?.trim()) errs.beneficiaryPhone = "Required";
        if (!form.beneficiaryStreet?.trim()) errs.beneficiaryStreet = "Required";
        if (!form.beneficiaryCity?.trim()) errs.beneficiaryCity = "Required";
        if (!form.beneficiaryState) errs.beneficiaryState = "Required";
        if (!form.beneficiaryZip?.trim()) errs.beneficiaryZip = "Required";
        if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
        return true;
      }
      case "business_contact": {
        const errs: Record<string, string> = {};
        if (!form.businessEmail?.trim()) errs.businessEmail = "Required";
        if (!form.businessPhone?.trim()) errs.businessPhone = "Required";
        if (!form.businessStreet?.trim()) errs.businessStreet = "Required";
        if (!form.businessCity?.trim()) errs.businessCity = "Required";
        if (!form.businessState) errs.businessState = "Required";
        if (!form.businessZip?.trim()) errs.businessZip = "Required";
        if (!form.mailingSameAsBusiness) {
          if (!form.mailingStreet?.trim()) errs.mailingStreet = "Required";
          if (!form.mailingCity?.trim()) errs.mailingCity = "Required";
          if (!form.mailingState) errs.mailingState = "Required";
          if (!form.mailingZip?.trim()) errs.mailingZip = "Required";
        }
        if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
        return true;
      }
      case "professional": schema = professionalSchema; break;
      case "questions":
        if (backgroundAnswers.length < SURELC_QUESTIONS.length) {
          setErrors({ _: "Please answer all 19 questions" });
          return false;
        }
        return true;
      case "banking": {
        const bankResult = bankingSchema.safeParse(form);
        if (!bankResult.success) {
          const errs: Record<string, string> = {};
          bankResult.error.issues.forEach((issue: any) => { errs[issue.path[0] as string] = issue.message; });
          if (!form.ddFormUploaded) errs.ddFormUploaded = "Direct Deposit form required";
          setErrors(errs); return false;
        }
        if (!form.ddFormUploaded) { setErrors({ ddFormUploaded: "Direct Deposit form required" }); return false; }
        return true;
      }
      case "eo": {
        const eoResult = eoSchema.safeParse(form);
        if (!eoResult.success) {
          const errs: Record<string, string> = {};
          eoResult.error.issues.forEach((issue: any) => { errs[issue.path[0] as string] = issue.message; });
          if (!form.eoCertUploaded) errs.eoCertUploaded = "E&O Certificate required";
          setErrors(errs); return false;
        }
        if (!form.eoCertUploaded) { setErrors({ eoCertUploaded: "E&O Certificate required" }); return false; }
        return true;
      }
      case "trainings": {
        const errs: Record<string, string> = {};
        if (!form.amlCertUploaded) errs.amlCertUploaded = "AML Certificate required";
        if (!form.govIdUploaded) errs.govIdUploaded = "Government Photo ID required";
        if (!form.ceExpirationDate) errs.ceExpirationDate = "Required";
        if (Object.keys(errs).length > 0) { setErrors(errs); return false; }
        return true;
      }
      case "signing":
        if (signing.nda_status !== "signed" || signing.debt_rollup_status !== "signed" || signing.compliance_status !== "signed") {
          setErrors({ _: "Please sign all three documents" });
          return false;
        }
        return true;
      case "review":
        if (!form.agreedToTerms || !form.agreedToPrivacy) {
          setErrors({ _: "You must agree to the Terms of Service and Privacy Policy" });
          return false;
        }
        return true;
      default: return true;
    }

    if (schema) {
      const result = schema.safeParse(form);
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.issues.forEach((issue: any) => {
          const key = issue.path[0] as string;
          errs[key] = issue.message;
        });
        setErrors(errs);
        return false;
      }
    }
    return true;
  }, [step, steps, form, backgroundAnswers, signing, uploads]);

  // Save progress.
  // P0-DP-4 (audit 2026-05-12): previously this fire-and-forgot the response
  // and the caller advanced the step BEFORE the save settled. If the server
  // returned 4xx/5xx, the user moved to the next step locally but the data
  // never persisted. Now we return success/failure and the caller awaits +
  // checks before advancing.
  const saveProgress = useCallback(async (nextStep: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const resp = await fetch("/api/apply/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, step: nextStep,
          data: { ...form, backgroundAnswers, licensedStates: form.licensedStates },
        }),
      });
      if (!resp.ok) {
        console.error("Save progress failed: HTTP", resp.status);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Save progress failed:", e);
      return false;
    }
  }, [token, form, backgroundAnswers]);

  // For organic users: create skeleton account after Step 1 to get a token
  const registerOrganic = useCallback(async (): Promise<boolean> => {
    try {
      const resp = await fetch("/api/apply/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone }),
      });
      const data = await resp.json();
      if (resp.ok && data.token) {
        setToken(data.token);
        setIsInvite(false);
        setUserId(data.userId);
        return true;
      } else {
        setErrors({ email: data.error || "Registration failed" });
        return false;
      }
    } catch {
      setErrors({ email: "Network error" });
      return false;
    }
  }, [form.email, form.password, form.firstName, form.lastName, form.phone]);

  const next = useCallback(async () => {
    if (!validateStep()) return;

    // On account step completion for organic users — create skeleton to get token
    if (currentStepId === "account" && !token) {
      const ok = await registerOrganic();
      if (!ok) return;
    }

    const nextStep = step + 1;
    // P0-DP-4 (audit 2026-05-12): save FIRST, then advance — previously the
    // order was reversed so a failed save still moved the UI forward and
    // the user lost in-progress data on refresh.
    const saved = await saveProgress(nextStep);
    if (!saved && token) {
      setErrors({ _form: "Couldn't save your progress. Please refresh and try again." });
      return;
    }
    setStep(nextStep);
  }, [step, currentStepId, validateStep, saveProgress, token, registerOrganic]);

  const prev = useCallback(() => setStep(s => Math.max(0, s - 1)), []);
  const goTo = useCallback((s: number) => setStep(s), []);

  const handleSigned = useCallback((docType: string) => {
    setSigning(prev => ({
      ...prev,
      [`${docType}_status`]: "signed",
    }));
  }, []);

  const handleUploaded = useCallback((docType: string) => {
    const fieldMap: Record<string, keyof UploadStatus> = {
      eo_cert: "eoCert", gov_id: "govId", aml_cert: "amlCert", direct_deposit: "directDeposit",
    };
    const field = fieldMap[docType];
    if (field) setUploads(prev => ({ ...prev, [field]: true }));
  }, []);

  const submit = useCallback(async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const body = token
        ? { token, password: form.password, agreedToTerms: true, agreedToPrivacy: true }
        : { ...form, agreedToTerms: true, agreedToPrivacy: true };
      const resp = await fetch("/api/apply/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (resp.ok) setSubmitted(true);
    } catch (e) { console.error("Submit failed:", e); }
    setSubmitting(false);
  }, [token, form, validateStep]);

  return {
    form, set, step, setStep: goTo, errors,
    token, isInvite, loading, submitted, submitting,
    backgroundAnswers, setBackgroundAnswers,
    signing, handleSigned,
    uploads, handleUploaded,
    next, prev, submit, userId,
  };
}

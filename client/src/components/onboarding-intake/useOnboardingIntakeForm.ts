/**
 * Onboarding Intake Form Store
 * Zustand store for all onboarding form state management
 */
import { create } from 'zustand';
import type {
  TokenPayload,
  LicensedFormData,
  NewAgentFormData,
} from './onboardingIntakeTypes';

interface OnboardingIntakeState {
  // Meta
  token: string;
  tokenValid: boolean;
  tokenData: TokenPayload | null;
  path: 'licensed' | 'new_agent' | null;
  currentStep: number;
  direction: number; // 1=forward, -1=back
  isSubmitting: boolean;
  isComplete: boolean;
  isSaving: boolean;

  // Form data
  licensed: LicensedFormData;
  newAgent: NewAgentFormData;

  // Actions
  setToken(token: string): void;
  setTokenValid(valid: boolean): void;
  setTokenData(data: TokenPayload): void;
  setPath(path: 'licensed' | 'new_agent'): void;
  setStep(step: number): void;
  goNext(): void;
  goBack(): void;
  setIsSubmitting(v: boolean): void;
  setIsSaving(v: boolean): void;
  setIsComplete(v: boolean): void;
  updateLicensedField<K extends keyof LicensedFormData>(field: K, value: LicensedFormData[K]): void;
  updateNewAgentField<K extends keyof NewAgentFormData>(field: K, value: NewAgentFormData[K]): void;
  reset(): void;
}

const defaultLicensedData: LicensedFormData = {
  // Step 1 — Personal
  dateOfBirth: '',
  ssn: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactDob: '',
  emergencyContactSsn: '',

  // Step 2 — Direct Deposit
  bankName: '',
  accountType: '',
  routingNumber: '',
  accountNumber: '',
  confirmAccountNumber: '',
  directDepositFormFile: null,
  directDepositFormUrl: '',

  // Step 3 — License & E&O
  npn: '',
  licenseState: '',
  licenseExpiration: '',
  eoProvider: '',
  eoPolicyNumber: '',
  eoEffectiveDate: '',
  eoExpirationDate: '',
  eoCertificateFile: null,
  eoCertificateUrl: '',

  // Step 4 — AML & Compliance
  amlCertificateFile: null,
  amlCertificateUrl: '',
  hasFelony: null,
  felonyDetails: '',
  hasBankruptcy: null,
  bankruptcyDetails: '',
  hasMisdemeanor: null,
  misdemeanorDetails: '',

  // Step 5 — Driver's License
  driversLicenseFile: null,
  driversLicenseUrl: '',
  driversLicenseBackFile: null,
  driversLicenseBackUrl: '',

  // Step 6 — DocuSign
  docusignNda: 'pending',
  docusignDebtRollup: 'pending',
  docusignCompliance: 'pending',
};

const defaultNewAgentData: NewAgentFormData = {
  // Step 1 — Background
  educationLevel: '',
  salesExperience: '',
  previousIndustry: '',

  // Step 2 — Study Preferences
  learningStyle: '',
  weeklyStudyHours: 0,
  targetExamDate: '',

  // Step 3 — Mentorship
  selectedMentorId: '',

  // Step 4 — Training Schedule
  canCommitInPerson: null,
  inPersonDetails: '',
  canCommitOnline: null,
  preferredOnlineTimes: '',

  // Step 5 — Compliance & DocuSign
  hasFelony: null,
  felonyDetails: '',
  hasBankruptcy: null,
  bankruptcyDetails: '',
  hasMisdemeanor: null,
  misdemeanorDetails: '',
  driversLicenseFile: null,
  driversLicenseUrl: '',
  driversLicenseBackFile: null,
  driversLicenseBackUrl: '',
  docusignNda: 'pending',
  docusignDebtRollup: 'pending',
  docusignCompliance: 'pending',
};

export const useOnboardingIntakeForm = create<OnboardingIntakeState>((set) => ({
  // Meta defaults
  token: '',
  tokenValid: false,
  tokenData: null,
  path: null,
  currentStep: 0,
  direction: 1,
  isSubmitting: false,
  isComplete: false,
  isSaving: false,

  // Form data defaults
  licensed: { ...defaultLicensedData },
  newAgent: { ...defaultNewAgentData },

  // Actions
  setToken: (token) => set({ token }),

  setTokenValid: (valid) => set({ tokenValid: valid }),

  setTokenData: (data) => set({ tokenData: data }),

  setPath: (path) => set({ path }),

  setStep: (step) => set({ currentStep: step }),

  goNext: () =>
    set((state) => ({
      direction: 1,
      currentStep: state.currentStep + 1,
    })),

  goBack: () =>
    set((state) => ({
      direction: -1,
      currentStep: Math.max(0, state.currentStep - 1),
    })),

  setIsSubmitting: (v) => set({ isSubmitting: v }),

  setIsSaving: (v) => set({ isSaving: v }),

  setIsComplete: (v) => set({ isComplete: v }),

  updateLicensedField: (field, value) =>
    set((state) => ({
      licensed: { ...state.licensed, [field]: value },
    })),

  updateNewAgentField: (field, value) =>
    set((state) => ({
      newAgent: { ...state.newAgent, [field]: value },
    })),

  reset: () =>
    set({
      token: '',
      tokenValid: false,
      tokenData: null,
      path: null,
      currentStep: 0,
      direction: 1,
      isSubmitting: false,
      isComplete: false,
      isSaving: false,
      licensed: { ...defaultLicensedData },
      newAgent: { ...defaultNewAgentData },
    }),
}));

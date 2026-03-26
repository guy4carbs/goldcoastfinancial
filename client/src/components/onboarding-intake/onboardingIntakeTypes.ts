/**
 * Onboarding Intake Types
 * TypeScript interfaces for the agent onboarding form
 */

export interface TokenPayload {
  profileId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isLicensed: string | null;
  npn: string | null;
  dateOfBirth: string | null;
  onboardingType: 'licensed' | 'new_agent' | null;
  currentStep: number;
}

export interface LicensedFormData {
  // Step 1 — Personal
  dateOfBirth: string;
  ssn: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactDob: string;
  emergencyContactSsn: string;

  // Step 2 — Direct Deposit
  bankName: string;
  accountType: 'checking' | 'savings' | '';
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  directDepositFormFile: File | null;
  directDepositFormUrl: string;

  // Step 3 — License & E&O
  npn: string;
  licenseState: string;
  licenseExpiration: string;
  eoProvider: string;
  eoPolicyNumber: string;
  eoEffectiveDate: string;
  eoExpirationDate: string;
  eoCertificateFile: File | null;
  eoCertificateUrl: string;

  // Step 4 — AML & Compliance
  amlCertificateFile: File | null;
  amlCertificateUrl: string;
  hasFelony: boolean | null;
  felonyDetails: string;
  hasBankruptcy: boolean | null;
  bankruptcyDetails: string;
  hasMisdemeanor: boolean | null;
  misdemeanorDetails: string;

  // Step 5 — Driver's License
  driversLicenseFile: File | null;
  driversLicenseUrl: string;
  driversLicenseBackFile: File | null;
  driversLicenseBackUrl: string;

  // Step 6 — DocuSign
  docusignNda: 'pending' | 'signed';
  docusignDebtRollup: 'pending' | 'signed';
  docusignCompliance: 'pending' | 'signed';
  smsConsent: boolean;
}

export interface NewAgentFormData {
  // Step 1 — Background
  educationLevel: string;
  salesExperience: string;
  previousIndustry: string;

  // Step 2 — Study Preferences
  learningStyle: 'self_paced' | 'live_classes' | 'in_person' | 'hybrid' | '';
  weeklyStudyHours: number;
  targetExamDate: string;

  // Step 3 — Mentorship
  selectedMentorId: string;

  // Step 4 — Training Schedule
  canCommitInPerson: boolean | null;
  inPersonDetails: string;
  canCommitOnline: boolean | null;
  preferredOnlineTimes: string;

  // Step 5 — Compliance & DocuSign
  hasFelony: boolean | null;
  felonyDetails: string;
  hasBankruptcy: boolean | null;
  bankruptcyDetails: string;
  hasMisdemeanor: boolean | null;
  misdemeanorDetails: string;
  driversLicenseFile: File | null;
  driversLicenseUrl: string;
  driversLicenseBackFile: File | null;
  driversLicenseBackUrl: string;
  docusignNda: 'pending' | 'signed';
  docusignDebtRollup: 'pending' | 'signed';
  docusignCompliance: 'pending' | 'signed';
  smsConsent: boolean;
}

export interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

export type OnboardingPath = 'licensed' | 'new_agent';

export interface StepDefinition {
  id: string;
  title: string;
  shortTitle: string;
}

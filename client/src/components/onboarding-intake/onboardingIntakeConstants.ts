/**
 * Onboarding Intake Constants
 * Step definitions, education levels, and shared configuration
 */

import type { StepDefinition } from './onboardingIntakeTypes';

export const LICENSED_STEPS: StepDefinition[] = [
  { id: 'personal', title: 'Personal Information', shortTitle: 'Personal' },
  { id: 'banking', title: 'Direct Deposit', shortTitle: 'Banking' },
  { id: 'license', title: 'License & E&O', shortTitle: 'License' },
  { id: 'compliance', title: 'AML & Compliance', shortTitle: 'Compliance' },
  { id: 'drivers-license', title: 'Driver\'s License', shortTitle: 'DL Upload' },
  { id: 'esign', title: 'E-Sign Documents', shortTitle: 'E-Sign' },
  { id: 'review', title: 'Review & Submit', shortTitle: 'Review' },
];

export const NEW_AGENT_STEPS: StepDefinition[] = [
  { id: 'background', title: 'Background & Education', shortTitle: 'Background' },
  { id: 'study', title: 'Study Preferences', shortTitle: 'Study' },
  { id: 'mentorship', title: 'Mentorship', shortTitle: 'Mentor' },
  { id: 'training', title: 'Training Schedule', shortTitle: 'Training' },
  { id: 'compliance', title: 'Compliance & Documents', shortTitle: 'Compliance' },
  { id: 'esign', title: 'E-Sign Documents', shortTitle: 'E-Sign' },
  { id: 'review', title: 'Review & Submit', shortTitle: 'Review' },
];

export const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School Diploma / GED' },
  { value: 'some_college', label: 'Some College' },
  { value: 'associates', label: 'Associate\'s Degree' },
  { value: 'bachelors', label: 'Bachelor\'s Degree' },
  { value: 'masters', label: 'Master\'s Degree' },
  { value: 'doctorate', label: 'Doctorate / Professional Degree' },
];

export const LEARNING_STYLES = [
  { value: 'self_paced', label: 'Self-Paced', description: 'Study on your own schedule with online materials' },
  { value: 'live_classes', label: 'Live Classes', description: 'Attend scheduled virtual instructor-led sessions' },
  { value: 'in_person', label: 'In-Person', description: 'Hands-on classroom training at our office' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of online self-paced and live sessions' },
];

export const STUDY_HOUR_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
];

export const TRAINING_INCLUDES = [
  { title: 'Pre-Licensing Education', description: 'State-approved courses covering all exam topics' },
  { title: 'Study Materials', description: 'Textbooks, practice exams, and online resources' },
  { title: 'Exam Preparation', description: 'Practice tests and exam-taking strategies' },
  { title: 'One-on-One Mentorship', description: 'Weekly sessions with your assigned mentor' },
  { title: 'Sales Training', description: 'Proven sales techniques and best practices' },
  { title: 'Ongoing Support', description: 'Resources available even after licensing' },
];

export const DOCUSIGN_DOCUMENTS = [
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Confidentiality agreement protecting Heritage Life Solutions proprietary information and client data.',
  },
  {
    id: 'debt_rollup',
    name: 'Debt Roll-Up Authorization',
    description: 'Authorization for commission advance structure and debt reconciliation terms.',
  },
  {
    id: 'compliance',
    name: 'Compliance Acknowledgment',
    description: 'Acknowledgment of insurance industry regulations, ethical standards, and Heritage compliance policies.',
  },
];

export const LICENSED_CHECKLIST = [
  'Personal & contracting details',
  'Direct deposit setup (SSN, banking)',
  'E&O insurance verification',
  'NPN & license validation',
  'E-sign NDA, Debt Roll-up & Compliance',
  'Upload driver\'s license',
];

export const NEW_AGENT_CHECKLIST = [
  'Background & education profile',
  'Pre-licensing education setup',
  'Study materials & resources',
  'Exam preparation guidance',
  'Mentorship assignment',
  'Training schedule setup',
];

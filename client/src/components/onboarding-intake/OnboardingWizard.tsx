/**
 * Onboarding Wizard
 * Full-page wizard shell for licensed and new agent onboarding flows.
 * Renders step components with animated transitions, progress tracking,
 * and per-step validation — users cannot advance without completing required fields.
 */
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  GRID,
  MOTION,
  RADIUS,
  TYPE,
  COLORS,
} from '@/lib/heritageDesignSystem';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { useOnboardingIntakeForm } from './useOnboardingIntakeForm';
import { LICENSED_STEPS, NEW_AGENT_STEPS } from './onboardingIntakeConstants';
import type { OnboardingPath, LicensedFormData, NewAgentFormData } from './onboardingIntakeTypes';

// Step components — Licensed
import { LicensedStep1Personal } from './steps/LicensedStep1Personal';
import { LicensedStep2DirectDeposit } from './steps/LicensedStep2DirectDeposit';
import { LicensedStep3LicenseEO } from './steps/LicensedStep3LicenseEO';
import { LicensedStep4AMLCompliance } from './steps/LicensedStep4AMLCompliance';
import { LicensedStep5DriverLicense } from './steps/LicensedStep5DriverLicense';
import { LicensedStep6ESign } from './steps/LicensedStep6ESign';
import { LicensedStep7Review } from './steps/LicensedStep7Review';

// Step components — New Agent
import { NewAgentStep1Background } from './steps/NewAgentStep1Background';
import { NewAgentStep2StudyPrefs } from './steps/NewAgentStep2StudyPrefs';
import { NewAgentStep3Mentorship } from './steps/NewAgentStep3Mentorship';
import { NewAgentStep4Training } from './steps/NewAgentStep4Training';
import { NewAgentStep5ComplianceESign } from './steps/NewAgentStep5ComplianceESign';
import { NewAgentStep6ESign } from './steps/NewAgentStep6ESign';
import { NewAgentStep6Review } from './steps/NewAgentStep6Review';

// ---------------------------------------------------------------------------
// Slide animation variants (directional)
// ---------------------------------------------------------------------------
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Step resolver — maps path + step index to the real component
// ---------------------------------------------------------------------------
const LICENSED_COMPONENTS = [
  () => <LicensedStep1Personal />,
  () => <LicensedStep2DirectDeposit />,
  () => <LicensedStep3LicenseEO />,
  () => <LicensedStep4AMLCompliance />,
  () => <LicensedStep5DriverLicense />,
  () => <LicensedStep6ESign />,
];

const NEW_AGENT_COMPONENTS = [
  () => <NewAgentStep1Background />,
  () => <NewAgentStep2StudyPrefs />,
  () => <NewAgentStep3Mentorship />,
  () => <NewAgentStep4Training />,
  () => <NewAgentStep5ComplianceESign />,
  () => <NewAgentStep6ESign />,
];

// ---------------------------------------------------------------------------
// Validation — returns list of missing field labels, empty = valid
// ---------------------------------------------------------------------------
function validateLicensedStep(step: number, data: LicensedFormData): string[] {
  const missing: string[] = [];
  switch (step) {
    case 0: // Personal
      if (!data.dateOfBirth || data.dateOfBirth.includes('_')) missing.push('Date of Birth');
      if (data.ssn.replace(/\D/g, '').length !== 9) missing.push('Social Security Number (9 digits)');
      if (!data.emergencyContactName.trim()) missing.push('Emergency Contact Name');
      if (data.emergencyContactPhone.replace(/\D/g, '').length < 10) missing.push('Emergency Contact Phone');
      if (!data.emergencyContactDob || data.emergencyContactDob.includes('_')) missing.push('Emergency Contact Date of Birth');
      break;
    case 1: // Direct Deposit
      if (!data.bankName.trim()) missing.push('Bank Name');
      if (!data.accountType) missing.push('Account Type');
      if (data.routingNumber.length !== 9) missing.push('Routing Number (9 digits)');
      if (!data.accountNumber.trim()) missing.push('Account Number');
      if (data.accountNumber !== data.confirmAccountNumber) missing.push('Account Numbers must match');
      if (!data.directDepositFormFile && !data.directDepositFormUrl) missing.push('Direct Deposit Form upload');
      break;
    case 2: // License & E&O
      if (!data.npn.trim()) missing.push('NPN');
      if (!data.licenseState) missing.push('License State');
      if (!data.licenseExpiration || data.licenseExpiration.includes('_')) missing.push('License Expiration');
      if (!data.eoProvider.trim()) missing.push('E&O Provider');
      if (!data.eoPolicyNumber.trim()) missing.push('E&O Policy Number');
      if (!data.eoEffectiveDate || data.eoEffectiveDate.includes('_')) missing.push('E&O Effective Date');
      if (!data.eoExpirationDate || data.eoExpirationDate.includes('_')) missing.push('E&O Expiration Date');
      break;
    case 3: // AML & Compliance
      if (!data.amlCertificateFile && !data.amlCertificateUrl) missing.push('AML Certificate upload');
      if (data.hasFelony === null) missing.push('Felony disclosure');
      if (data.hasFelony && !data.felonyDetails.trim()) missing.push('Felony details');
      if (data.hasBankruptcy === null) missing.push('Bankruptcy disclosure');
      if (data.hasBankruptcy && !data.bankruptcyDetails.trim()) missing.push('Bankruptcy details');
      if (data.hasMisdemeanor === null) missing.push('Misdemeanor disclosure');
      if (data.hasMisdemeanor && !data.misdemeanorDetails.trim()) missing.push('Misdemeanor details');
      break;
    case 4: // Driver's License
      if (!data.driversLicenseFile && !data.driversLicenseUrl) missing.push('Driver\'s License front');
      if (!data.driversLicenseBackFile && !data.driversLicenseBackUrl) missing.push('Driver\'s License back');
      break;
    case 5: // E-Sign
      if (data.docusignNda !== 'signed') missing.push('NDA signature');
      if (data.docusignDebtRollup !== 'signed') missing.push('Debt Roll-Up signature');
      if (data.docusignCompliance !== 'signed') missing.push('Compliance signature');
      break;
    case 6: // Review — no validation, just submit
      break;
  }
  return missing;
}

function validateNewAgentStep(step: number, data: NewAgentFormData): string[] {
  const missing: string[] = [];
  switch (step) {
    case 0: // Background
      if (!data.educationLevel) missing.push('Education Level');
      break;
    case 1: // Study Preferences
      if (!data.learningStyle) missing.push('Learning Style');
      if (!data.weeklyStudyHours) missing.push('Weekly Study Hours');
      if (!data.targetExamDate || data.targetExamDate.includes('_')) missing.push('Target Exam Date');
      break;
    case 2: // Mentorship
      if (!data.selectedMentorId) missing.push('Mentor selection');
      break;
    case 3: // Training
      if (data.canCommitInPerson === null) missing.push('In-person training commitment');
      if (data.canCommitOnline === null) missing.push('Online training commitment');
      break;
    case 4: // Compliance & Documents
      if (!data.driversLicenseFile && !data.driversLicenseUrl) missing.push('Driver\'s License front');
      if (!data.driversLicenseBackFile && !data.driversLicenseBackUrl) missing.push('Driver\'s License back');
      if (data.hasFelony === null) missing.push('Felony disclosure');
      if (data.hasFelony && !data.felonyDetails.trim()) missing.push('Felony details');
      if (data.hasBankruptcy === null) missing.push('Bankruptcy disclosure');
      if (data.hasBankruptcy && !data.bankruptcyDetails.trim()) missing.push('Bankruptcy details');
      if (data.hasMisdemeanor === null) missing.push('Misdemeanor disclosure');
      if (data.hasMisdemeanor && !data.misdemeanorDetails.trim()) missing.push('Misdemeanor details');
      break;
    case 5: // E-Sign
      if (data.docusignNda !== 'signed') missing.push('NDA signature');
      if (data.docusignDebtRollup !== 'signed') missing.push('Debt Roll-Up signature');
      if (data.docusignCompliance !== 'signed') missing.push('Compliance signature');
      break;
    case 6: // Review — no validation
      break;
  }
  return missing;
}

// ---------------------------------------------------------------------------
// OnboardingWizard
// ---------------------------------------------------------------------------
interface OnboardingWizardProps {
  path: OnboardingPath;
}

export function OnboardingWizard({ path }: OnboardingWizardProps) {
  const {
    currentStep,
    direction,
    isSaving,
    isSubmitting,
    goNext,
    goBack,
    setStep,
    setIsSaving,
    setIsSubmitting,
    setIsComplete,
  } = useOnboardingIntakeForm();

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const steps = path === 'licensed' ? LICENSED_STEPS : NEW_AGENT_STEPS;
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // ------------------------------------------------------------------
  // Validate current step, save, then advance
  // ------------------------------------------------------------------
  const handleNext = useCallback(async () => {
    // Validate current step
    const state = useOnboardingIntakeForm.getState();
    const missing = path === 'licensed'
      ? validateLicensedStep(currentStep, state.licensed)
      : validateNewAgentStep(currentStep, state.newAgent);

    if (missing.length > 0) {
      setValidationErrors(missing);
      toast.error('Please complete all required fields', {
        description: missing.slice(0, 3).join(', ') + (missing.length > 3 ? ` and ${missing.length - 3} more` : ''),
      });
      return;
    }

    setValidationErrors([]);

    try {
      setIsSaving(true);

      // Persist the current step data
      await fetch('/api/onboarding/save-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: state.token,
          path,
          step: currentStep,
          data: path === 'licensed' ? state.licensed : state.newAgent,
        }),
      });

      if (isLastStep) {
        setIsSubmitting(true);
        await fetch('/api/onboarding/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: state.token,
            path,
            data: path === 'licensed' ? state.licensed : state.newAgent,
          }),
        });
        setIsComplete(true);
      } else {
        goNext();
      }
    } catch (err) {
      console.error('Failed to save step', err);
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  }, [currentStep, isLastStep, path, goNext, setIsSaving, setIsSubmitting, setIsComplete]);

  // ------------------------------------------------------------------
  // Handle progress-bar step click (only completed steps)
  // ------------------------------------------------------------------
  const handleStepClick = useCallback(
    (step: number) => {
      if (step < currentStep) {
        setValidationErrors([]);
        setStep(step);
      }
    },
    [currentStep, setStep],
  );

  const handleBack = useCallback(() => {
    setValidationErrors([]);
    goBack();
  }, [goBack]);

  return (
    <div
      className="max-w-2xl mx-auto w-full"
      style={{ padding: GRID.spacing.lg }}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <OnboardingProgressBar
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${path}-${currentStep}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: MOTION.duration.fast },
            }}
          >
            {path === 'licensed'
              ? currentStep < LICENSED_COMPONENTS.length
                ? LICENSED_COMPONENTS[currentStep]()
                : <LicensedStep7Review />
              : currentStep < NEW_AGENT_COMPONENTS.length
                ? NEW_AGENT_COMPONENTS[currentStep]()
                : <NewAgentStep6Review onNavigateToStep={setStep} />
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div
          style={{
            marginTop: GRID.spacing.md,
            padding: GRID.spacing.sm,
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: RADIUS.button,
          }}
        >
          <p style={{ fontSize: TYPE.caption, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>
            Please complete the following:
          </p>
          <ul style={{ fontSize: TYPE.micro, color: '#b91c1c', paddingLeft: 16 }}>
            {validationErrors.map((err) => (
              <li key={err} style={{ marginBottom: 2 }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        {/* Back */}
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isFirstStep || isSaving}
          className={isFirstStep ? 'invisible' : ''}
          style={{ borderRadius: RADIUS.button }}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Next / Submit */}
        <Button
          onClick={handleNext}
          disabled={isSaving || isSubmitting}
          className="text-white font-semibold"
          style={{
            borderRadius: RADIUS.button,
            background:
              'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
            minWidth: 160,
          }}
        >
          {isSaving || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isLastStep ? (
            <>
              Submit Application
              <Send className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

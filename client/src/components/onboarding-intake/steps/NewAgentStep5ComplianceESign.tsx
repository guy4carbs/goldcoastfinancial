/**
 * NewAgentStep5Compliance — Compliance & Driver's License
 * Driver's license upload and compliance disclosure questions.
 * E-Sign is now a separate step.
 */

import { CreditCard, ShieldCheck } from 'lucide-react';
import { GRID, TYPE, COLORS } from '@/lib/heritageDesignSystem';
import { FileUploadZone } from '../shared/FileUploadZone';
import { ComplianceQuestions } from '../shared/ComplianceQuestions';
import { StepCard } from '../shared/StepCard';
import { FormField } from '../shared/FormField';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import type { NewAgentFormData } from '../onboardingIntakeTypes';

export function NewAgentStep5ComplianceESign() {
  const { newAgent, updateNewAgentField } = useOnboardingIntakeForm();

  const handleComplianceChange = (field: string, value: boolean | string) => {
    updateNewAgentField(field as keyof NewAgentFormData, value as never);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      {/* Driver's License */}
      <StepCard
        icon={CreditCard}
        title="Driver's License"
        subtitle="Upload clear photos of both sides of your license"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Front of Card" required>
            <FileUploadZone
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={10}
              fileName={newAgent.driversLicenseFile?.name}
              onFileSelect={(file) => updateNewAgentField('driversLicenseFile', file)}
              onRemove={() => {
                updateNewAgentField('driversLicenseFile', null);
                updateNewAgentField('driversLicenseUrl', '');
              }}
            />
          </FormField>

          <FormField label="Back of Card" required>
            <FileUploadZone
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={10}
              fileName={newAgent.driversLicenseBackFile?.name}
              onFileSelect={(file) => updateNewAgentField('driversLicenseBackFile', file)}
              onRemove={() => {
                updateNewAgentField('driversLicenseBackFile', null);
                updateNewAgentField('driversLicenseBackUrl', '');
              }}
            />
          </FormField>
        </div>

        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], lineHeight: TYPE.lineHeight }}>
          Accepted formats: JPG, PNG, PDF. Maximum 10MB per file.
        </p>
      </StepCard>

      {/* Compliance Disclosure */}
      <StepCard
        icon={ShieldCheck}
        title="Compliance Disclosure"
        subtitle="Please answer the following background questions honestly"
      >
        <ComplianceQuestions
          hasFelony={newAgent.hasFelony}
          felonyDetails={newAgent.felonyDetails}
          hasBankruptcy={newAgent.hasBankruptcy}
          bankruptcyDetails={newAgent.bankruptcyDetails}
          hasMisdemeanor={newAgent.hasMisdemeanor}
          misdemeanorDetails={newAgent.misdemeanorDetails}
          onChange={handleComplianceChange}
        />
      </StepCard>
    </div>
  );
}

/**
 * LicensedStep4AMLCompliance — AML & Compliance Step
 * Collects AML training certificate and compliance disclosure answers
 * Split into two StepCards for visual separation
 */

import { Upload, ShieldCheck } from 'lucide-react';
import { GRID } from '@/lib/heritageDesignSystem';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import { FileUploadZone } from '../shared/FileUploadZone';
import { ComplianceQuestions } from '../shared/ComplianceQuestions';
import { StepCard } from '../shared/StepCard';

export function LicensedStep4AMLCompliance() {
  const { licensed, updateLicensedField } = useOnboardingIntakeForm();

  const handleComplianceChange = (field: string, value: boolean | string) => {
    updateLicensedField(
      field as keyof typeof licensed,
      value as never,
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      {/* AML Training Certificate Card */}
      <StepCard icon={Upload} title="AML Training Certificate" subtitle="Upload your Anti-Money Laundering training certificate">
        <FileUploadZone
          accept=".pdf,.jpg,.jpeg,.png"
          maxSizeMB={10}
          fileName={licensed.amlCertificateFile?.name}
          onFileSelect={(file) => updateLicensedField('amlCertificateFile', file)}
          onRemove={() => {
            updateLicensedField('amlCertificateFile', null);
            updateLicensedField('amlCertificateUrl', '');
          }}
        />
      </StepCard>

      {/* Compliance Disclosure Card */}
      <StepCard icon={ShieldCheck} title="Compliance Disclosure" subtitle="Required background disclosure questions">
        <ComplianceQuestions
          hasFelony={licensed.hasFelony}
          felonyDetails={licensed.felonyDetails}
          hasBankruptcy={licensed.hasBankruptcy}
          bankruptcyDetails={licensed.bankruptcyDetails}
          hasMisdemeanor={licensed.hasMisdemeanor}
          misdemeanorDetails={licensed.misdemeanorDetails}
          onChange={handleComplianceChange}
        />
      </StepCard>
    </div>
  );
}

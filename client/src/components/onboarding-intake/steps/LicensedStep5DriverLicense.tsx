/**
 * LicensedStep5DriverLicense — Driver's License Upload Step
 * Side-by-side uploads for front and back of the card
 */

import { CreditCard } from 'lucide-react';
import { GRID, TYPE, COLORS } from '@/lib/heritageDesignSystem';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import { FileUploadZone } from '../shared/FileUploadZone';
import { StepCard } from '../shared/StepCard';
import { FormField } from '../shared/FormField';

export function LicensedStep5DriverLicense() {
  const { licensed, updateLicensedField } = useOnboardingIntakeForm();

  return (
    <StepCard
      icon={CreditCard}
      title="Driver's License"
      subtitle="Upload clear photos of both sides of your license"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Front */}
        <FormField label="Front of Card" required>
          <FileUploadZone
            accept=".jpg,.jpeg,.png,.pdf"
            maxSizeMB={10}
            fileName={licensed.driversLicenseFile?.name}
            onFileSelect={(file) => updateLicensedField('driversLicenseFile', file)}
            onRemove={() => {
              updateLicensedField('driversLicenseFile', null);
              updateLicensedField('driversLicenseUrl', '');
            }}
          />
        </FormField>

        {/* Back */}
        <FormField label="Back of Card" required>
          <FileUploadZone
            accept=".jpg,.jpeg,.png,.pdf"
            maxSizeMB={10}
            fileName={licensed.driversLicenseBackFile?.name}
            onFileSelect={(file) => updateLicensedField('driversLicenseBackFile', file)}
            onRemove={() => {
              updateLicensedField('driversLicenseBackFile', null);
              updateLicensedField('driversLicenseBackUrl', '');
            }}
          />
        </FormField>
      </div>

      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], lineHeight: TYPE.lineHeight }}>
        Accepted formats: JPG, PNG, PDF. Maximum 10MB per file.
      </p>
    </StepCard>
  );
}

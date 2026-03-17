/**
 * LicensedStep3LicenseEO — License & E&O Insurance Step
 * Collects NPN, license info, and E&O insurance details
 * Split into two StepCards for visual separation
 */

import { Award, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import { US_STATES } from '../onboardingIntakeConstants';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import { FormField } from '../shared/FormField';
import { FileUploadZone } from '../shared/FileUploadZone';
import { StepCard } from '../shared/StepCard';
import { DateOfBirthSelect } from '../shared/DateOfBirthSelect';

export function LicensedStep3LicenseEO() {
  const { licensed, tokenData, updateLicensedField } = useOnboardingIntakeForm();

  // Pre-fill NPN from token data if available and field is empty
  const npnValue = licensed.npn || tokenData?.npn || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      {/* License Information Card */}
      <StepCard icon={Award} title="License Information" subtitle="Your state insurance license details">
        {/* NPN */}
        <FormField label="National Producer Number (NPN)" required>
          <Input
            type="text"
            value={npnValue}
            onChange={(e) => updateLicensedField('npn', e.target.value)}
            placeholder="e.g. 12345678"
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* License State */}
        <FormField label="License State" required>
          <Select
            value={licensed.licenseState}
            onValueChange={(value) => updateLicensedField('licenseState', value)}
          >
            <SelectTrigger
              style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* License Expiration */}
        <FormField label="License Expiration Date" required>
          <DateOfBirthSelect
            value={licensed.licenseExpiration}
            onChange={(value) => updateLicensedField('licenseExpiration', value)}
            mode="future"
          />
        </FormField>
      </StepCard>

      {/* E&O Insurance Card */}
      <StepCard icon={Shield} title="Errors & Omissions Insurance" subtitle="Your E&O coverage details">
        {/* E&O Provider */}
        <FormField label="E&O Provider" required>
          <Input
            type="text"
            value={licensed.eoProvider}
            onChange={(e) => updateLicensedField('eoProvider', e.target.value)}
            placeholder="Insurance provider name"
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* E&O Policy Number */}
        <FormField label="E&O Policy Number" required>
          <Input
            type="text"
            value={licensed.eoPolicyNumber}
            onChange={(e) => updateLicensedField('eoPolicyNumber', e.target.value)}
            placeholder="Policy number"
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* E&O Effective Date */}
        <FormField label="E&O Effective Date" required>
          <DateOfBirthSelect
            value={licensed.eoEffectiveDate}
            onChange={(value) => updateLicensedField('eoEffectiveDate', value)}
            mode="future"
          />
        </FormField>

        {/* E&O Expiration Date */}
        <FormField label="E&O Expiration Date" required>
          <DateOfBirthSelect
            value={licensed.eoExpirationDate}
            onChange={(value) => updateLicensedField('eoExpirationDate', value)}
            mode="future"
          />
        </FormField>

        {/* E&O Certificate Upload */}
        <FormField label="E&O Certificate">
          <FileUploadZone
            accept=".pdf,.jpg,.jpeg,.png"
            maxSizeMB={10}
            fileName={licensed.eoCertificateFile?.name}
            onFileSelect={(file) => updateLicensedField('eoCertificateFile', file)}
            onRemove={() => {
              updateLicensedField('eoCertificateFile', null);
              updateLicensedField('eoCertificateUrl', '');
            }}
          />
        </FormField>
      </StepCard>
    </div>
  );
}

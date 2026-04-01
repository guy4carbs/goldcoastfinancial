/**
 * LicensedStep1Personal — Personal Information Step
 * Collects DOB, SSN, and emergency contact details
 * Wrapped in StepCards for professional presentation
 */

import { User, UserPlus, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import { FormField } from '../shared/FormField';
import { MaskedSSNInput } from '../shared/MaskedSSNInput';
import { StepCard } from '../shared/StepCard';
import { DateOfBirthSelect } from '../shared/DateOfBirthSelect';

export function LicensedStep1Personal() {
  const { licensed, updateLicensedField } = useOnboardingIntakeForm();

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateLicensedField('emergencyContactPhone', digits);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      {/* Personal Information Card */}
      <StepCard icon={User} title="Personal Information" subtitle="Your identity details for licensing records">
        {/* Security Notice */}
        <div
          className="flex items-center gap-3"
          style={{
            backgroundColor: COLORS.primary.violet[50],
            border: `1px solid ${COLORS.primary.violet[200]}`,
            borderRadius: RADIUS.button,
            padding: GRID.spacing.sm,
          }}
        >
          <Lock size={16} style={{ color: COLORS.primary.violet[600], flexShrink: 0 }} />
          <p style={{ fontSize: TYPE.micro, color: COLORS.primary.violet[700], lineHeight: TYPE.lineHeight }}>
            Your personal information is encrypted and transmitted securely.
          </p>
        </div>

        {/* Date of Birth */}
        <FormField label="Date of Birth" required>
          <DateOfBirthSelect
            value={licensed.dateOfBirth}
            onChange={(value) => updateLicensedField('dateOfBirth', value)}
          />
        </FormField>

        {/* SSN */}
        <FormField label="Social Security Number" required>
          <MaskedSSNInput
            value={licensed.ssn}
            onChange={(value) => updateLicensedField('ssn', value)}
          />
        </FormField>
      </StepCard>

      {/* Emergency Contact Card */}
      <StepCard icon={UserPlus} title="Emergency Contact" subtitle="Someone we can reach in case of an emergency">
        {/* Emergency Contact Name */}
        <FormField label="Full Name" required>
          <Input
            type="text"
            value={licensed.emergencyContactName}
            onChange={(e) => updateLicensedField('emergencyContactName', e.target.value)}
            placeholder="Full name"
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* Emergency Contact Phone */}
        <FormField label="Phone Number" required>
          <Input
            type="text"
            inputMode="tel"
            value={formatPhone(licensed.emergencyContactPhone)}
            onChange={handlePhoneChange}
            placeholder="(630) 478-1835"
            maxLength={14}
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* Emergency Contact Date of Birth */}
        <FormField label="Date of Birth">
          <DateOfBirthSelect
            value={licensed.emergencyContactDob}
            onChange={(value) => updateLicensedField('emergencyContactDob', value)}
          />
        </FormField>

        {/* Emergency Contact SSN (optional) */}
        <FormField label="Social Security Number (optional)">
          <MaskedSSNInput
            value={licensed.emergencyContactSsn}
            onChange={(value) => updateLicensedField('emergencyContactSsn', value)}
          />
        </FormField>
      </StepCard>
    </div>
  );
}

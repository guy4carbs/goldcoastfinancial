/**
 * LicensedStep2DirectDeposit — Direct Deposit Setup Step
 * Collects banking information for commission payouts
 * Wrapped in StepCard for professional presentation
 */

import { Building2, ShieldCheck, FileUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import { FormField } from '../shared/FormField';
import { RadioCardGroup } from '../shared/RadioCardGroup';
import { FileUploadZone } from '../shared/FileUploadZone';
import { StepCard } from '../shared/StepCard';

export function LicensedStep2DirectDeposit() {
  const { licensed, updateLicensedField } = useOnboardingIntakeForm();

  const accountMismatch =
    licensed.confirmAccountNumber.length > 0 &&
    licensed.accountNumber !== licensed.confirmAccountNumber;

  const handleRoutingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    updateLicensedField('routingNumber', digits);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      <StepCard
        icon={Building2}
        title="Direct Deposit Setup"
        subtitle="Your banking information for commission payouts"
      >
        {/* Security Banner */}
        <div
          className="flex items-center gap-3"
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: RADIUS.button,
            padding: GRID.spacing.sm,
          }}
        >
          <ShieldCheck size={16} style={{ color: '#047857', flexShrink: 0 }} />
          <p style={{ fontSize: TYPE.micro, color: '#047857', lineHeight: TYPE.lineHeight }}>
            Your banking information is encrypted with AES-256 and never shared.
          </p>
        </div>

        {/* Bank Name */}
        <FormField label="Bank Name" required>
          <Input
            type="text"
            value={licensed.bankName}
            onChange={(e) => updateLicensedField('bankName', e.target.value)}
            placeholder="e.g. Chase, Bank of America"
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* Account Type */}
        <FormField label="Account Type" required>
          <RadioCardGroup
            options={[
              { value: 'checking', label: 'Checking' },
              { value: 'savings', label: 'Savings' },
            ]}
            selected={licensed.accountType}
            onChange={(value) => updateLicensedField('accountType', value as 'checking' | 'savings')}
            columns={2}
          />
        </FormField>

        {/* Routing Number */}
        <FormField label="Routing Number" required>
          <Input
            type="text"
            inputMode="numeric"
            value={licensed.routingNumber}
            onChange={handleRoutingChange}
            placeholder="9-digit routing number"
            maxLength={9}
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* Account Number */}
        <FormField label="Account Number" required>
          <Input
            type="text"
            value={licensed.accountNumber}
            onChange={(e) => updateLicensedField('accountNumber', e.target.value)}
            placeholder="Account number"
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>

        {/* Confirm Account Number */}
        <FormField
          label="Confirm Account Number"
          required
          error={accountMismatch ? 'Account numbers do not match.' : undefined}
        >
          <Input
            type="text"
            value={licensed.confirmAccountNumber}
            onChange={(e) => updateLicensedField('confirmAccountNumber', e.target.value)}
            placeholder="Re-enter account number"
            className={accountMismatch ? 'border-red-500 focus-visible:ring-red-500' : ''}
            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
          />
        </FormField>
      </StepCard>

      {/* Direct Deposit Form Upload */}
      <StepCard
        icon={FileUp}
        title="Direct Deposit Form"
        subtitle="Upload a voided check or bank letter for verification"
      >
        <p style={{ fontSize: TYPE.meta, color: COLORS.gray[600], lineHeight: TYPE.lineHeight }}>
          Please upload a voided check, direct deposit authorization form, or a bank letter confirming your account details. This helps us verify your banking information.
        </p>

        <FileUploadZone
          accept=".pdf,.jpg,.jpeg,.png"
          maxSizeMB={10}
          fileName={licensed.directDepositFormFile?.name}
          onFileSelect={(file) => updateLicensedField('directDepositFormFile', file)}
          onRemove={() => {
            updateLicensedField('directDepositFormFile', null);
            updateLicensedField('directDepositFormUrl', '');
          }}
        />

        <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], lineHeight: TYPE.lineHeight }}>
          Accepted formats: PDF, JPG, PNG. Maximum 10MB.
        </p>
      </StepCard>
    </div>
  );
}

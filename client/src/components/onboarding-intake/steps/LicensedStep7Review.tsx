/**
 * LicensedStep7Review — Review & Submit Step
 * Displays all collected information for final review before submission
 */

import {
  ClipboardCheck,
  User,
  Building2,
  Award,
  ShieldCheck,
  CreditCard,
  FileSignature,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { TYPE, COLORS } from '@/lib/heritageDesignSystem';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import { ReviewSection } from '../shared/ReviewSection';
import { StepCard } from '../shared/StepCard';

/** Mask a string showing only last N characters */
function maskValue(value: string, visibleCount: number = 4): string {
  if (!value || value.length <= visibleCount) return value || '--';
  const masked = '\u2022'.repeat(value.length - visibleCount);
  return masked + value.slice(-visibleCount);
}

/** Format SSN display as masked: bullet-bullet-bullet-bullet-bullet-XXXX */
function maskSSN(ssn: string): string {
  if (!ssn) return '--';
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) return '\u2022'.repeat(digits.length);
  const last4 = digits.slice(-4);
  return `\u2022\u2022\u2022-\u2022\u2022-${last4}`;
}

/** Format a boolean compliance answer */
function formatYesNo(value: boolean | null): string {
  if (value === null) return '--';
  return value ? 'Yes' : 'No';
}

/** Single review row */
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between" style={{ paddingTop: 6, paddingBottom: 6 }}>
      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500], lineHeight: TYPE.lineHeight }}>
        {label}
      </span>
      <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[800], lineHeight: TYPE.lineHeight, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

/** DocuSign status row */
function DocStatusRow({ label, status }: { label: string; status: 'pending' | 'signed' }) {
  const isSigned = status === 'signed';
  return (
    <div className="flex items-center justify-between" style={{ paddingTop: 6, paddingBottom: 6 }}>
      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500], lineHeight: TYPE.lineHeight }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        {isSigned ? (
          <CheckCircle size={14} style={{ color: '#047857' }} />
        ) : (
          <Clock size={14} style={{ color: '#b45309' }} />
        )}
        <span
          style={{
            fontSize: TYPE.micro,
            fontWeight: 600,
            color: isSigned ? '#047857' : '#b45309',
            lineHeight: TYPE.lineHeight,
          }}
        >
          {isSigned ? 'Signed' : 'Pending'}
        </span>
      </div>
    </div>
  );
}

export function LicensedStep7Review() {
  const { licensed, setStep } = useOnboardingIntakeForm();

  return (
    <StepCard
      icon={ClipboardCheck}
      title="Review & Submit"
      subtitle="Please review all information before submitting"
    >
      {/* 1. Personal Information */}
      <ReviewSection title="Personal Information" icon={User} onEdit={() => setStep(0)}>
        <ReviewRow label="Date of Birth" value={licensed.dateOfBirth || '--'} />
        <ReviewRow label="SSN" value={maskSSN(licensed.ssn)} />
        <ReviewRow label="Emergency Contact" value={licensed.emergencyContactName || '--'} />
        <ReviewRow label="Emergency Phone" value={licensed.emergencyContactPhone || '--'} />
        <ReviewRow label="Emergency Contact DOB" value={licensed.emergencyContactDob || '--'} />
      </ReviewSection>

      {/* 2. Direct Deposit */}
      <ReviewSection title="Direct Deposit" icon={Building2} onEdit={() => setStep(1)}>
        <ReviewRow label="Bank Name" value={licensed.bankName || '--'} />
        <ReviewRow label="Account Type" value={licensed.accountType ? licensed.accountType.charAt(0).toUpperCase() + licensed.accountType.slice(1) : '--'} />
        <ReviewRow label="Routing Number" value={maskValue(licensed.routingNumber)} />
        <ReviewRow label="Account Number" value={maskValue(licensed.accountNumber)} />
        <ReviewRow label="Direct Deposit Form" value={licensed.directDepositFormFile?.name || '--'} />
      </ReviewSection>

      {/* 3. License & E&O */}
      <ReviewSection title="License & E&O" icon={Award} onEdit={() => setStep(2)}>
        <ReviewRow label="NPN" value={licensed.npn || '--'} />
        <ReviewRow label="License State" value={licensed.licenseState || '--'} />
        <ReviewRow label="License Expiration" value={licensed.licenseExpiration || '--'} />
        <ReviewRow label="E&O Provider" value={licensed.eoProvider || '--'} />
        <ReviewRow label="E&O Policy Number" value={licensed.eoPolicyNumber || '--'} />
        <ReviewRow label="E&O Effective" value={licensed.eoEffectiveDate || '--'} />
        <ReviewRow label="E&O Expiration" value={licensed.eoExpirationDate || '--'} />
        <ReviewRow label="E&O Certificate" value={licensed.eoCertificateFile?.name || '--'} />
      </ReviewSection>

      {/* 4. AML & Compliance */}
      <ReviewSection title="AML & Compliance" icon={ShieldCheck} onEdit={() => setStep(3)}>
        <ReviewRow label="AML Certificate" value={licensed.amlCertificateFile?.name || '--'} />
        <ReviewRow label="Felony Conviction" value={formatYesNo(licensed.hasFelony)} />
        <ReviewRow label="Bankruptcy" value={formatYesNo(licensed.hasBankruptcy)} />
        <ReviewRow label="Misdemeanor" value={formatYesNo(licensed.hasMisdemeanor)} />
      </ReviewSection>

      {/* 5. Driver's License */}
      <ReviewSection title="Driver's License" icon={CreditCard} onEdit={() => setStep(4)}>
        <ReviewRow label="Front" value={licensed.driversLicenseFile?.name || '--'} />
        <ReviewRow label="Back" value={licensed.driversLicenseBackFile?.name || '--'} />
      </ReviewSection>

      {/* 6. Documents */}
      <ReviewSection title="Documents" icon={FileSignature} onEdit={() => setStep(5)}>
        <DocStatusRow label="Non-Disclosure Agreement" status={licensed.docusignNda} />
        <DocStatusRow label="Debt Roll-Up Authorization" status={licensed.docusignDebtRollup} />
        <DocStatusRow label="Compliance Acknowledgment" status={licensed.docusignCompliance} />
      </ReviewSection>
    </StepCard>
  );
}

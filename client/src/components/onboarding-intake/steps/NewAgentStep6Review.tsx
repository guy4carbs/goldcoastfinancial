/**
 * NewAgentStep6Review — Review & Submit
 * Displays all collected information in ReviewSection cards with edit navigation
 */

import {
  ClipboardCheck,
  GraduationCap,
  BookOpen,
  UserPlus,
  CalendarDays,
  ShieldCheck,
  FileSignature,
} from 'lucide-react';
import { GRID, TYPE, COLORS } from '@/lib/heritageDesignSystem';
import { EDUCATION_LEVELS, LEARNING_STYLES } from '../onboardingIntakeConstants';
import { ReviewSection } from '../shared/ReviewSection';
import { StepCard } from '../shared/StepCard';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';

interface NewAgentStep6ReviewProps {
  onNavigateToStep: (step: number) => void;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between items-start"
      style={{ marginBottom: GRID.spacing.xs }}
    >
      <span
        style={{
          fontSize: TYPE.micro,
          fontWeight: 600,
          color: COLORS.gray[500],
          lineHeight: TYPE.lineHeight,
          flexShrink: 0,
          marginRight: GRID.spacing.sm,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: TYPE.meta,
          color: COLORS.gray[800],
          lineHeight: TYPE.lineHeight,
          textAlign: 'right',
        }}
      >
        {value || '--'}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'signed' }) {
  const isSigned = status === 'signed';
  return (
    <span
      style={{
        fontSize: TYPE.micro,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 9999,
        backgroundColor: isSigned ? '#ecfdf5' : '#fffbeb',
        color: isSigned ? '#047857' : '#b45309',
      }}
    >
      {isSigned ? 'Signed' : 'Pending'}
    </span>
  );
}

export function NewAgentStep6Review({ onNavigateToStep }: NewAgentStep6ReviewProps) {
  const { newAgent } = useOnboardingIntakeForm();

  // Resolve display labels
  const educationLabel =
    EDUCATION_LEVELS.find((e) => e.value === newAgent.educationLevel)?.label ||
    newAgent.educationLevel;

  const learningStyleLabel =
    LEARNING_STYLES.find((s) => s.value === newAgent.learningStyle)?.label ||
    newAgent.learningStyle;

  const mentorDisplay =
    newAgent.selectedMentorId === 'auto_assign'
      ? 'Auto Assign'
      : newAgent.selectedMentorId || '--';

  return (
    <StepCard
      icon={ClipboardCheck}
      title="Review & Submit"
    >
      {/* 1. Background & Education */}
      <ReviewSection
        title="Background & Education"
        icon={GraduationCap}
        onEdit={() => onNavigateToStep(0)}
      >
        <ReviewRow label="Education Level" value={educationLabel} />
        <ReviewRow label="Sales Experience" value={newAgent.salesExperience} />
        <ReviewRow label="Previous Industry" value={newAgent.previousIndustry} />
      </ReviewSection>

      {/* 2. Study Preferences */}
      <ReviewSection
        title="Study Preferences"
        icon={BookOpen}
        onEdit={() => onNavigateToStep(1)}
      >
        <ReviewRow label="Learning Style" value={learningStyleLabel} />
        <ReviewRow
          label="Weekly Hours"
          value={
            newAgent.weeklyStudyHours
              ? `${newAgent.weeklyStudyHours} hours/week`
              : ''
          }
        />
        <ReviewRow label="Target Exam Date" value={newAgent.targetExamDate} />
      </ReviewSection>

      {/* 3. Mentorship */}
      <ReviewSection
        title="Mentorship"
        icon={UserPlus}
        onEdit={() => onNavigateToStep(2)}
      >
        <ReviewRow label="Selected Mentor" value={mentorDisplay} />
      </ReviewSection>

      {/* 4. Training Schedule */}
      <ReviewSection
        title="Training Schedule"
        icon={CalendarDays}
        onEdit={() => onNavigateToStep(3)}
      >
        <ReviewRow
          label="In-Person Commitment"
          value={
            newAgent.canCommitInPerson === null
              ? '--'
              : newAgent.canCommitInPerson
                ? 'Yes'
                : 'No'
          }
        />
        {newAgent.canCommitInPerson && newAgent.inPersonDetails && (
          <ReviewRow label="In-Person Details" value={newAgent.inPersonDetails} />
        )}
        <ReviewRow
          label="Online Commitment"
          value={
            newAgent.canCommitOnline === null
              ? '--'
              : newAgent.canCommitOnline
                ? 'Yes'
                : 'No'
          }
        />
        {newAgent.canCommitOnline && newAgent.preferredOnlineTimes && (
          <ReviewRow
            label="Online Details"
            value={newAgent.preferredOnlineTimes}
          />
        )}
      </ReviewSection>

      {/* 5. Compliance */}
      <ReviewSection
        title="Compliance"
        icon={ShieldCheck}
        onEdit={() => onNavigateToStep(4)}
      >
        <ReviewRow
          label="Driver's License (Front)"
          value={newAgent.driversLicenseFile?.name || newAgent.driversLicenseUrl || 'Not uploaded'}
        />
        <ReviewRow
          label="Driver's License (Back)"
          value={newAgent.driversLicenseBackFile?.name || newAgent.driversLicenseBackUrl || 'Not uploaded'}
        />
        <ReviewRow
          label="Felony"
          value={
            newAgent.hasFelony === null
              ? '--'
              : newAgent.hasFelony
                ? `Yes - ${newAgent.felonyDetails || 'Details pending'}`
                : 'No'
          }
        />
        <ReviewRow
          label="Bankruptcy"
          value={
            newAgent.hasBankruptcy === null
              ? '--'
              : newAgent.hasBankruptcy
                ? `Yes - ${newAgent.bankruptcyDetails || 'Details pending'}`
                : 'No'
          }
        />
        <ReviewRow
          label="Misdemeanor"
          value={
            newAgent.hasMisdemeanor === null
              ? '--'
              : newAgent.hasMisdemeanor
                ? `Yes - ${newAgent.misdemeanorDetails || 'Details pending'}`
                : 'No'
          }
        />
      </ReviewSection>

      {/* 6. E-Sign Documents */}
      <ReviewSection
        title="E-Sign Documents"
        icon={FileSignature}
        onEdit={() => onNavigateToStep(5)}
      >
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: GRID.spacing.xs }}
        >
          <span
            style={{
              fontSize: TYPE.micro,
              fontWeight: 600,
              color: COLORS.gray[500],
            }}
          >
            NDA
          </span>
          <StatusBadge status={newAgent.docusignNda} />
        </div>
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: GRID.spacing.xs }}
        >
          <span
            style={{
              fontSize: TYPE.micro,
              fontWeight: 600,
              color: COLORS.gray[500],
            }}
          >
            Debt Roll-Up
          </span>
          <StatusBadge status={newAgent.docusignDebtRollup} />
        </div>
        <div className="flex justify-between items-center">
          <span
            style={{
              fontSize: TYPE.micro,
              fontWeight: 600,
              color: COLORS.gray[500],
            }}
          >
            Compliance
          </span>
          <StatusBadge status={newAgent.docusignCompliance} />
        </div>
      </ReviewSection>
    </StepCard>
  );
}

/**
 * NewAgentStep2StudyPrefs — Study Preferences
 * Collects learning style, weekly study hours, and target exam date
 */

import { BookOpen, Video, Users, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { RADIUS, TYPE } from '@/lib/heritageDesignSystem';
import { LEARNING_STYLES, STUDY_HOUR_OPTIONS } from '../onboardingIntakeConstants';
import { FormField } from '../shared/FormField';
import { RadioCardGroup } from '../shared/RadioCardGroup';
import { StepCard } from '../shared/StepCard';
import { DateOfBirthSelect } from '../shared/DateOfBirthSelect';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import type { LucideIcon } from 'lucide-react';

const LEARNING_STYLE_ICONS: Record<string, LucideIcon> = {
  self_paced: BookOpen,
  live_classes: Video,
  in_person: Users,
  hybrid: LayoutGrid,
};

export function NewAgentStep2StudyPrefs() {
  const { newAgent, updateNewAgentField } = useOnboardingIntakeForm();

  const learningStyleOptions = LEARNING_STYLES.map((style) => ({
    value: style.value,
    label: style.label,
    description: style.description,
    icon: LEARNING_STYLE_ICONS[style.value],
  }));

  return (
    <StepCard
      icon={BookOpen}
      title="Study Preferences"
      subtitle="Tell us how you'd like to learn"
    >
      {/* Learning Style */}
      <FormField label="Learning Style" required>
        <RadioCardGroup
          options={learningStyleOptions}
          selected={newAgent.learningStyle}
          onChange={(value) =>
            updateNewAgentField(
              'learningStyle',
              value as 'self_paced' | 'live_classes' | 'in_person' | 'hybrid',
            )
          }
          columns={2}
        />
      </FormField>

      {/* Weekly Study Hours */}
      <FormField label="Weekly Study Hours" required>
        <Select
          value={newAgent.weeklyStudyHours ? String(newAgent.weeklyStudyHours) : ''}
          onValueChange={(value) => updateNewAgentField('weeklyStudyHours', Number(value))}
        >
          <SelectTrigger
            style={{
              borderRadius: RADIUS.input,
              fontSize: TYPE.meta,
            }}
          >
            <SelectValue placeholder="Select weekly hours" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_HOUR_OPTIONS.map((hours) => (
              <SelectItem key={hours} value={String(hours)}>
                {hours} hours/week
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {/* Target Exam Date */}
      <FormField label="Target Exam Date" required>
        <DateOfBirthSelect
          value={newAgent.targetExamDate}
          onChange={(isoDate) => updateNewAgentField('targetExamDate', isoDate)}
          mode="exam"
        />
      </FormField>
    </StepCard>
  );
}

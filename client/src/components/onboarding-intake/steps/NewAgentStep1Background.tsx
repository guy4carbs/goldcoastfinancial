/**
 * NewAgentStep1Background — Background & Education
 * Collects education level, sales experience, and previous industry
 */

import { GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { RADIUS, TYPE } from '@/lib/heritageDesignSystem';
import { EDUCATION_LEVELS } from '../onboardingIntakeConstants';
import { FormField } from '../shared/FormField';
import { StepCard } from '../shared/StepCard';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';

export function NewAgentStep1Background() {
  const { newAgent, updateNewAgentField } = useOnboardingIntakeForm();

  return (
    <StepCard
      icon={GraduationCap}
      title="Background & Education"
    >
      {/* Highest Education Level */}
      <FormField label="Highest Education Level" required>
        <Select
          value={newAgent.educationLevel}
          onValueChange={(value) => updateNewAgentField('educationLevel', value)}
        >
          <SelectTrigger
            style={{
              borderRadius: RADIUS.input,
              fontSize: TYPE.meta,
            }}
          >
            <SelectValue placeholder="Select your education level" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {/* Previous Sales Experience */}
      <FormField label="Previous Sales Experience">
        <Textarea
          value={newAgent.salesExperience}
          onChange={(e) => updateNewAgentField('salesExperience', e.target.value)}
          placeholder="Describe any relevant sales or customer service experience..."
          rows={4}
          style={{
            borderRadius: RADIUS.input,
            fontSize: TYPE.meta,
          }}
        />
      </FormField>

      {/* Previous Industry */}
      <FormField label="Previous Industry">
        <Input
          value={newAgent.previousIndustry}
          onChange={(e) => updateNewAgentField('previousIndustry', e.target.value)}
          placeholder="e.g., Retail, Healthcare, Finance"
          style={{
            borderRadius: RADIUS.input,
            fontSize: TYPE.meta,
          }}
        />
      </FormField>
    </StepCard>
  );
}

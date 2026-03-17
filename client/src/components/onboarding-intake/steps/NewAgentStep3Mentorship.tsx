/**
 * NewAgentStep3Mentorship — Choose Your Mentor
 * Fetches mentor list and displays selectable mentor cards + auto-assign option
 * Includes "What's Included in Your Training" section
 */

import { useQuery } from '@tanstack/react-query';
import { UserPlus, BookOpen, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { GRID, TYPE, RADIUS, COLORS, MOTION } from '@/lib/heritageDesignSystem';
import { TRAINING_INCLUDES } from '../onboardingIntakeConstants';
import { StepCard } from '../shared/StepCard';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import type { Mentor } from '../onboardingIntakeTypes';

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function NewAgentStep3Mentorship() {
  const { newAgent, updateNewAgentField } = useOnboardingIntakeForm();

  const { data: mentors = [], isLoading } = useQuery<Mentor[]>({
    queryKey: ['onboarding-mentors'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding/mentors');
      if (!res.ok) return [];
      const json = await res.json();
      return json.mentors || [];
    },
  });

  const selectedId = newAgent.selectedMentorId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      {/* Choose Your Mentor */}
      <StepCard
        icon={UserPlus}
        title="Choose Your Mentor"
        subtitle="Select a mentor to guide you through your licensing journey, or let us find the best match for you."
      >
        {/* Mentor Cards Grid */}
        {isLoading ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: GRID.spacing.xl }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: COLORS.primary.violet[500] }}
            />
            <span
              style={{
                fontSize: TYPE.meta,
                color: COLORS.gray[500],
                marginLeft: GRID.spacing.xs,
              }}
            >
              Loading mentors...
            </span>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: GRID.spacing.sm,
            }}
          >
            {/* Auto Assign Card */}
            <button
              type="button"
              onClick={() => updateNewAgentField('selectedMentorId', 'auto_assign')}
              className="text-left transition-all"
              style={{
                borderRadius: RADIUS.button,
                border: `2px solid ${
                  selectedId === 'auto_assign'
                    ? '#6366f1'
                    : COLORS.gray[200]
                }`,
                backgroundColor:
                  selectedId === 'auto_assign'
                    ? 'rgba(99, 102, 241, 0.05)'
                    : 'white',
                padding: GRID.spacing.md,
                cursor: 'pointer',
                outline: 'none',
                transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Sparkles Icon Circle */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 9999,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  <Sparkles size={22} style={{ color: 'white' }} />
                </div>

                <p
                  style={{
                    fontSize: TYPE.meta,
                    fontWeight: 700,
                    color:
                      selectedId === 'auto_assign'
                        ? '#4f46e5'
                        : COLORS.gray[800],
                    lineHeight: TYPE.lineHeight,
                    textAlign: 'center',
                  }}
                >
                  Auto Assign
                </p>
                <p
                  style={{
                    fontSize: TYPE.micro,
                    color: COLORS.gray[500],
                    lineHeight: TYPE.lineHeight,
                    textAlign: 'center',
                  }}
                >
                  Let Heritage find the best mentor for you
                </p>
              </div>
            </button>

            {/* Mentor Cards */}
            {mentors.map((mentor) => {
              const isSelected = selectedId === mentor.id;
              const initials = getInitials(mentor.firstName, mentor.lastName);

              return (
                <button
                  key={mentor.id}
                  type="button"
                  onClick={() => updateNewAgentField('selectedMentorId', mentor.id)}
                  className="text-left transition-all"
                  style={{
                    borderRadius: RADIUS.button,
                    border: `2px solid ${
                      isSelected ? '#6366f1' : COLORS.gray[200]
                    }`,
                    backgroundColor: isSelected
                      ? 'rgba(99, 102, 241, 0.05)'
                      : 'white',
                    padding: GRID.spacing.md,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Initials Avatar */}
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 9999,
                        background:
                          'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        fontSize: TYPE.body,
                        fontWeight: 700,
                      }}
                    >
                      {initials}
                    </div>

                    <p
                      style={{
                        fontSize: TYPE.meta,
                        fontWeight: 700,
                        color: isSelected
                          ? '#4f46e5'
                          : COLORS.gray[800],
                        lineHeight: TYPE.lineHeight,
                        textAlign: 'center',
                      }}
                    >
                      {mentor.firstName} {mentor.lastName}
                    </p>
                    <p
                      style={{
                        fontSize: TYPE.micro,
                        color: COLORS.gray[500],
                        lineHeight: TYPE.lineHeight,
                        textAlign: 'center',
                      }}
                    >
                      {mentor.email}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </StepCard>

      {/* What's Included in Your Training */}
      <StepCard
        icon={BookOpen}
        title="What's Included in Your Training"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: GRID.spacing.sm }}
        >
          {TRAINING_INCLUDES.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3"
              style={{ padding: GRID.spacing.xs }}
            >
              <CheckCircle
                size={18}
                className="flex-shrink-0"
                style={{
                  color: '#10b981',
                  marginTop: 2,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: TYPE.meta,
                    fontWeight: 700,
                    color: COLORS.gray[800],
                    lineHeight: TYPE.lineHeight,
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontSize: TYPE.micro,
                    color: COLORS.gray[500],
                    lineHeight: TYPE.lineHeight,
                    marginTop: 2,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </StepCard>
    </div>
  );
}

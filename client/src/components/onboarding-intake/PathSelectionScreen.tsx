/**
 * Path Selection Screen
 * Two-card layout for choosing Licensed Agent vs New Agent onboarding path
 */
import { motion } from 'framer-motion';
import { Shield, GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { LICENSED_CHECKLIST, NEW_AGENT_CHECKLIST } from './onboardingIntakeConstants';

interface PathSelectionScreenProps {
  firstName: string;
  onSelectPath: (path: 'licensed' | 'new_agent') => void;
}

export function PathSelectionScreen({ firstName, onSelectPath }: PathSelectionScreenProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
      style={{ padding: GRID.spacing.xl }}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center mb-12">
        <h1
          className="font-bold text-gray-900 mb-3"
          style={{ fontSize: TYPE.display, lineHeight: 1.2 }}
        >
          Welcome, {firstName}!
        </h1>
        <p
          className="text-gray-500 max-w-xl mx-auto"
          style={{ fontSize: TYPE.body, lineHeight: TYPE.lineHeight }}
        >
          Choose your onboarding path below to get started with Heritage Life Solutions.
          Select the option that best describes your current situation.
        </p>
      </motion.div>

      {/* Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Licensed Agent Card */}
        <motion.div
          variants={fadeInUp}
          whileHover={{
            y: MOTION.hover.y,
            transition: { duration: MOTION.duration.hover },
          }}
          className="bg-white border-2 border-gray-200 border-t-4 border-t-emerald-500 cursor-pointer transition-shadow"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.level2,
            padding: GRID.spacing.lg,
          }}
          onClick={() => onSelectPath('licensed')}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="flex items-center justify-center bg-emerald-50 rounded-full"
              style={{ width: 72, height: 72 }}
            >
              <Shield className="text-emerald-500" style={{ width: 36, height: 36 }} />
            </div>
          </div>

          {/* Title & Subtitle */}
          <h2
            className="font-semibold text-gray-900 text-center mb-2"
            style={{ fontSize: TYPE.title }}
          >
            Licensed Agent
          </h2>
          <p
            className="text-gray-500 text-center mb-6"
            style={{ fontSize: TYPE.meta, lineHeight: TYPE.lineHeight }}
          >
            For agents with an active insurance license ready to start producing.
          </p>

          {/* Checklist */}
          <ul className="space-y-3 mb-8">
            {LICENSED_CHECKLIST.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle
                  className="text-emerald-500 shrink-0 mt-0.5"
                  style={{ width: 18, height: 18 }}
                />
                <span
                  className="text-gray-600"
                  style={{ fontSize: TYPE.meta, lineHeight: TYPE.lineHeight }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            className="w-full text-white font-semibold"
            style={{
              borderRadius: RADIUS.button,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              height: 48,
              fontSize: TYPE.body,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPath('licensed');
            }}
          >
            Start Licensed Onboarding &rarr;
          </Button>

          {/* Footer */}
          <p
            className="text-gray-400 text-center mt-4"
            style={{ fontSize: TYPE.micro }}
          >
            Estimated time: 15-20 minutes
          </p>
        </motion.div>

        {/* New Agent Card */}
        <motion.div
          variants={fadeInUp}
          whileHover={{
            y: MOTION.hover.y,
            transition: { duration: MOTION.duration.hover },
          }}
          className="bg-white border-2 border-gray-200 border-t-4 border-t-indigo-500 cursor-pointer transition-shadow"
          style={{
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.level2,
            padding: GRID.spacing.lg,
          }}
          onClick={() => onSelectPath('new_agent')}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="flex items-center justify-center bg-indigo-50 rounded-full"
              style={{ width: 72, height: 72 }}
            >
              <GraduationCap className="text-indigo-500" style={{ width: 36, height: 36 }} />
            </div>
          </div>

          {/* Title & Subtitle */}
          <h2
            className="font-semibold text-gray-900 text-center mb-2"
            style={{ fontSize: TYPE.title }}
          >
            New Agent (Unlicensed)
          </h2>
          <p
            className="text-gray-500 text-center mb-6"
            style={{ fontSize: TYPE.meta, lineHeight: TYPE.lineHeight }}
          >
            For newcomers ready to start their insurance career journey.
          </p>

          {/* Checklist */}
          <ul className="space-y-3 mb-8">
            {NEW_AGENT_CHECKLIST.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle
                  className="text-indigo-500 shrink-0 mt-0.5"
                  style={{ width: 18, height: 18 }}
                />
                <span
                  className="text-gray-600"
                  style={{ fontSize: TYPE.meta, lineHeight: TYPE.lineHeight }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            variant="outline"
            className="w-full font-semibold border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            style={{
              borderRadius: RADIUS.button,
              height: 48,
              fontSize: TYPE.body,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPath('new_agent');
            }}
          >
            Start New Agent Onboarding &rarr;
          </Button>

          {/* Footer */}
          <p
            className="text-gray-400 text-center mt-4"
            style={{ fontSize: TYPE.micro }}
          >
            Estimated time: 10-15 minutes
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

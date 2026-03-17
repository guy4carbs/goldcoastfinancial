/**
 * Congratulations Page
 * Post-submission success page with timeline of next steps
 */
import { motion } from 'framer-motion';
import {
  Mail,
  FileCheck,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Timeline items
// ---------------------------------------------------------------------------
const TIMELINE_ITEMS = [
  {
    icon: Mail,
    color: 'bg-teal-500',
    title: 'Email Confirmation',
    description:
      "You'll receive a confirmation email within the next hour with your application reference number.",
  },
  {
    icon: FileCheck,
    color: 'bg-violet-500',
    title: 'Document Verification',
    description:
      'Our compliance team will review and verify all documents. Typically 24-48 hours.',
  },
  {
    icon: Phone,
    color: 'bg-amber-500',
    title: 'Onboarding Call',
    description:
      'A team member will schedule your orientation call to answer any questions.',
  },
  {
    icon: Calendar,
    color: 'bg-emerald-500',
    title: 'Get Started',
    description:
      'Once approved, gain access to our systems, training, and begin your journey!',
  },
];

const IMPORTANT_BULLETS = [
  'Keep an eye on your inbox for the confirmation email. Check spam/junk if you don\'t see it.',
  'Have your government-issued ID readily available in case additional verification is needed.',
  'If you have questions, contact our onboarding team at onboarding@heritagels.org.',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CongratulationsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {/* Green Gradient Header */}
      <motion.div
        variants={fadeInUp}
        className="text-center py-16 px-6"
        style={{
          background:
            'linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            damping: MOTION.spring.damping,
            stiffness: MOTION.spring.stiffness,
            delay: 0.2,
          }}
          className="inline-flex items-center justify-center bg-white/20 rounded-full mb-6"
          style={{ width: 80, height: 80 }}
        >
          <CheckCircle2 className="text-white" style={{ width: 44, height: 44 }} />
        </motion.div>

        <h1
          className="font-bold text-white mb-3"
          style={{
            fontSize: TYPE.display,
            lineHeight: 1.2,
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          Congratulations!
        </h1>
        <p
          className="text-white/90 max-w-md mx-auto"
          style={{ fontSize: TYPE.body, lineHeight: TYPE.lineHeight }}
        >
          Your application has been submitted successfully.
        </p>
      </motion.div>

      {/* Main Content Card */}
      <div className="max-w-2xl mx-auto -mt-8 px-4 pb-16">
        <motion.div
          variants={fadeInUp}
          className="bg-white"
          style={{
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero,
            padding: GRID.spacing.xl,
          }}
        >
          {/* Welcome Message */}
          <motion.p
            variants={fadeInUp}
            className="text-gray-700 mb-8"
            style={{ fontSize: TYPE.body, lineHeight: 1.7 }}
          >
            Welcome to the Heritage Life Solutions family! We're thrilled to have you.
            Here's what happens next:
          </motion.p>

          {/* Timeline */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="relative ml-4 mb-10"
          >
            {/* Vertical connecting line */}
            <div
              className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-200"
              aria-hidden="true"
            />

            {TIMELINE_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  className="relative flex items-start gap-5 mb-8 last:mb-0"
                >
                  {/* Icon circle */}
                  <div
                    className={`${item.color} flex items-center justify-center rounded-full shrink-0 z-10`}
                    style={{ width: 40, height: 40 }}
                  >
                    <Icon className="text-white" style={{ width: 20, height: 20 }} />
                  </div>

                  {/* Text */}
                  <div className="pt-1">
                    <h3
                      className="font-semibold text-gray-900 mb-1"
                      style={{ fontSize: TYPE.title - 2 }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-gray-500"
                      style={{ fontSize: TYPE.meta, lineHeight: TYPE.lineHeight }}
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Important Information Box */}
          <motion.div
            variants={fadeInUp}
            className="bg-gray-50 p-6 mb-8"
            style={{ borderRadius: RADIUS.card - 8 }}
          >
            <h4
              className="font-semibold text-gray-900 mb-3"
              style={{ fontSize: TYPE.body }}
            >
              Important Information
            </h4>
            <ul className="space-y-2">
              {IMPORTANT_BULLETS.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1.5 shrink-0" style={{ fontSize: 6 }}>
                    &#9679;
                  </span>
                  <span
                    className="text-gray-600"
                    style={{ fontSize: TYPE.meta, lineHeight: TYPE.lineHeight }}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Return Home Button */}
          <motion.div variants={fadeInUp}>
            <Button
              className="w-full text-white font-semibold"
              style={{
                borderRadius: RADIUS.button,
                background:
                  'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                height: 48,
                fontSize: TYPE.body,
              }}
              onClick={() => {
                window.location.href = '/agents/login';
              }}
            >
              Log In to Your Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, ArrowRight, Mail, Clock } from "lucide-react";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from "@/lib/heritageDesignSystem";

interface Props {
  email: string;
}

export function RegistrationSuccess({ email }: Props) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="text-center"
      style={{ padding: `${spacing(4)}px 0` }}
    >
      <motion.div variants={scaleIn}>
        <div
          className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto"
          style={{ borderRadius: RADIUS.pill, boxShadow: SHADOW.level3, marginBottom: spacing(3) }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.section, marginBottom: spacing(1) }}>
          Application submitted
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto" style={{ fontSize: TYPE.body, marginBottom: spacing(3) }}>
          Thank you for applying to join Heritage. Our team will review your application and get back to you soon.
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="border border-gray-100 mx-auto max-w-sm"
        style={{
          borderRadius: RADIUS.card,
          padding: spacing(2.5),
          backgroundColor: "rgba(124, 58, 237, 0.03)",
          marginBottom: spacing(3),
        }}
      >
        <div className="flex flex-col" style={{ gap: spacing(2) }}>
          <div className="flex items-center" style={{ gap: spacing(1.5) }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.button,
                backgroundColor: COLORS.primary.violet[100],
              }}
            >
              <Mail className="w-4 h-4" style={{ color: COLORS.primary.violet[600] }} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>Confirmation sent</p>
              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{email}</p>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: spacing(1.5) }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.button,
                backgroundColor: COLORS.accent.amber[100],
              }}
            >
              <Clock className="w-4 h-4" style={{ color: COLORS.accent.amber[600] }} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>Under review</p>
              <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>Typically within 24-48 hours</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Link href="/agents/login">
          <motion.button
            whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
            whileTap={{ scale: 0.99 }}
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center justify-center gap-2 mx-auto"
            style={{
              padding: `${spacing(1.75)}px ${spacing(4)}px`,
              borderRadius: RADIUS.button,
              transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
            }}
          >
            Back to Login <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>

        <p className="text-gray-500 mt-4" style={{ fontSize: TYPE.meta }}>
          Questions? Call{" "}
          <a href="tel:6307780800" className="text-violet-600 hover:underline font-medium">(630) 778-0800</a>
        </p>
      </motion.div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Sparkles, Clock, Users, MessageSquare, Brain, Zap } from "lucide-react";
import { RADIUS, SHADOW, MOTION, fadeInUp, staggerContainer, scaleIn, spacing } from "@/lib/heritageDesignSystem";

export default function AgentAvatarCouncil() {
  const featureCards = [
    {
      icon: MessageSquare,
      title: "AI Debates",
      description: "Watch legendary minds debate sales strategies in real-time",
    },
    {
      icon: Brain,
      title: "Expert Councils",
      description: "Consult with multiple advisors for comprehensive insights",
    },
    {
      icon: Zap,
      title: "Strategy Sessions",
      description: "Get personalized guidance for your unique challenges",
    },
  ];

  return (
    <AgentLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6"
        style={{ gap: spacing(4) }}
      >
        {/* Hero Card */}
        <motion.div
          variants={fadeInUp}
          className="w-full max-w-3xl text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 40%, #f59e0b 100%)",
            borderRadius: RADIUS.hero,
            padding: spacing(5),
            boxShadow: SHADOW.hero,
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-400/15 rounded-full blur-xl" />

          {/* Icon */}
          <motion.div
            variants={scaleIn}
            className="w-24 h-24 mx-auto mb-6 flex items-center justify-center relative z-10"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              borderRadius: RADIUS.card,
            }}
          >
            <Users className="w-12 h-12 text-amber-200" />
          </motion.div>

          {/* Title with Gradient Text Effect */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #e9d5ff 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Avatar Council
          </motion.h1>

          {/* Coming Soon Badge */}
          <motion.div
            variants={scaleIn}
            whileHover={{
              scale: 1.05,
              transition: { duration: MOTION.duration.hover }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-6"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: RADIUS.pill,
              boxShadow: SHADOW.level2,
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Clock className="w-4 h-4 text-violet-600" />
            </motion.div>
            <span
              className="font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Coming Soon
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-white/90 text-lg leading-relaxed max-w-xl mx-auto"
          >
            Summon legendary sales minds for live debates and strategic advice.
            Warren Buffett, Patrick Bet-David, Ben Feldman, and more will be ready
            to guide your insurance career.
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl"
        >
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{
                y: MOTION.hover.y,
                scale: MOTION.hover.scale,
                transition: { duration: MOTION.duration.hover }
              }}
              className="text-center p-6 cursor-pointer"
              style={{
                background: "white",
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ duration: MOTION.duration.hover }}
                className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600"
                style={{
                  borderRadius: RADIUS.button,
                }}
              >
                <feature.icon className="w-6 h-6 text-amber-200" />
              </motion.div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Sparkles Indicator */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-3 text-gray-500"
        >
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </motion.div>
          <span className="text-sm font-medium text-gray-500">Powered by Heritage AI</span>
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </motion.div>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}

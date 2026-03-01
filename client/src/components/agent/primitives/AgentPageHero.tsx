/**
 * AgentPageHero - Premium hero section for Agent Lounge pages
 *
 * Matches the Onboarding Lounge premium design with:
 * - Serif italic title (Playfair Display)
 * - Large glass morphism icon badge
 * - Multiple decorative floating circles
 * - Rich gradient with amber accent
 */

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  MOTION,
  fadeInUp,
} from "@/lib/heritageDesignSystem";

export interface AgentPageHeroProps {
  /** The icon to display in the hero badge */
  icon: LucideIcon;
  /** The main title of the page */
  title: string;
  /** Subtitle/description text */
  subtitle: string;
  /** Optional action buttons or additional content */
  children?: React.ReactNode;
  /** Optional badge component (e.g., DemoBadge) */
  badge?: React.ReactNode;
  /** Optional custom gradient - defaults to heroWithAccent */
  gradient?: string;
  /** Optional custom className for the container */
  className?: string;
}

/**
 * AgentPageHero provides a premium hero section for all Agent Lounge pages.
 *
 * Features:
 * - Premium serif italic title typography (Playfair Display)
 * - Large 80px glass morphism icon badge with inset glow
 * - Three decorative floating circles (white, amber, purple)
 * - Dot pattern overlay for texture
 * - Consistent violet-purple-amber gradient
 * - Framer Motion animations
 * - Responsive design
 *
 * @example
 * ```tsx
 * <AgentPageHero
 *   icon={FileText}
 *   title="Sales Scripts"
 *   subtitle="Proven scripts to help you close more deals"
 * >
 *   <Button>Add Script</Button>
 * </AgentPageHero>
 * ```
 */
export function AgentPageHero({
  icon: Icon,
  title,
  subtitle,
  children,
  badge,
  gradient,
  className,
}: AgentPageHeroProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn("relative overflow-hidden", className)}
      style={{
        background: gradient || COLORS.gradients.heroWithAccent,
        borderRadius: RADIUS.hero,
        boxShadow: SHADOW.hero,
        padding: GRID.spacing.lg,
      }}
    >
      {/* Decorative dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative floating circles - matching onboarding premium style */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-md" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-sm" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Premium Icon Badge - 80px with glass effect and inset glow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200,
              delay: 0.2
            }}
            className="bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0"
            style={{
              width: GRID.spacing.xxxxl,
              height: GRID.spacing.xxxxl,
              borderRadius: RADIUS.card,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Icon
              className="text-amber-200"
              style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }}
              aria-hidden="true"
            />
          </motion.div>

          {/* Title and subtitle */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {badge}
            </div>
            <h1
              className="font-bold tracking-tight text-white font-serif"
              style={{
                fontSize: TYPE.display,
                marginBottom: GRID.spacing.xs,
                lineHeight: 1.1
              }}
            >
              {title}
            </h1>
            <p
              className="text-white/90 max-w-xl"
              style={{ fontSize: TYPE.body, lineHeight: 1.5 }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Optional action buttons */}
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AgentPageHero;

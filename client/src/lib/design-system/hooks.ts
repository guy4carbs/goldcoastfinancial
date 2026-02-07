/**
 * HERITAGE COMMAND CENTER - Design System Hooks
 *
 * React hooks for using the design system in components.
 * These hooks enforce consistency and provide common patterns.
 */

import { useMemo, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { colors, motion as motionTokens, motionPresets, typography } from "./tokens";

// =============================================================================
// COLOR HOOKS
// =============================================================================

export type SignatureColor = "cyan" | "amber" | "violet" | "emerald" | "red" | "orange";

/**
 * Get signature color values for an advisor
 */
export function useSignatureColor(signature: SignatureColor) {
  return useMemo(() => {
    const sig = colors.signatures[signature];
    return {
      primary: sig.primary,
      muted: sig.muted,
      subtle: sig.subtle,
      glow: sig.glow,
      // Tailwind-compatible classes
      classes: {
        text: `text-${signature}-400`,
        bg: `bg-${signature}-500/10`,
        border: `border-${signature}-500/30`,
        ring: `ring-${signature}-500/50`,
        shadow: `shadow-${signature}-500/30`,
      },
      // CSS custom property values
      cssVars: {
        "--sig-primary": sig.primary,
        "--sig-muted": sig.muted,
        "--sig-subtle": sig.subtle,
        "--sig-glow": sig.glow,
      },
    };
  }, [signature]);
}

/**
 * Map advisor slug to signature color
 */
export function useAdvisorSignature(slug: string): SignatureColor {
  return useMemo(() => {
    const mapping: Record<string, SignatureColor> = {
      "insurance-expert": "cyan",
      "sales-closer": "amber",
      "mindset-coach": "violet",
      "compliance-specialist": "emerald",
      "wolf-closer": "red",
      "objection-handler": "orange",
      // Legacy mappings
      "warren-buffett": "amber",
      "patrick-bet-david": "cyan",
      "ben-feldman": "violet",
      "elizur-wright": "emerald",
      "jordan-belfort": "red",
      "andy-elliott": "orange",
    };
    return mapping[slug] || "cyan";
  }, [slug]);
}

// =============================================================================
// MOTION HOOKS
// =============================================================================

/**
 * Get motion configuration that respects user preferences
 */
export function useMotionConfig() {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(() => ({
    // Whether to use animations
    shouldAnimate: !prefersReducedMotion,

    // Duration multiplier (0 for reduced motion)
    durationMultiplier: prefersReducedMotion ? 0 : 1,

    // Get duration value
    getDuration: (key: keyof typeof motionTokens.duration) =>
      prefersReducedMotion ? "0ms" : motionTokens.duration[key],

    // Get spring config
    getSpring: (key: keyof typeof motionTokens.spring) =>
      prefersReducedMotion
        ? { type: "tween", duration: 0 }
        : motionTokens.spring[key],

    // Get preset with reduced motion support
    getPreset: <T extends keyof typeof motionPresets>(key: T) => {
      if (prefersReducedMotion) {
        return {
          initial: {},
          animate: {},
          exit: {},
          transition: { duration: 0 },
        };
      }
      return motionPresets[key];
    },
  }), [prefersReducedMotion]);
}

/**
 * Create staggered animation for children
 */
export function useStaggerAnimation(itemCount: number, options?: {
  staggerDelay?: number;
  initialDelay?: number;
}) {
  const { shouldAnimate, getDuration } = useMotionConfig();
  const { staggerDelay = 0.05, initialDelay = 0 } = options || {};

  return useMemo(() => {
    if (!shouldAnimate) {
      return {
        container: {},
        item: () => ({}),
      };
    }

    return {
      container: {
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        variants: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delayChildren: initialDelay,
              staggerChildren: staggerDelay,
            },
          },
        },
      },
      item: (index: number) => ({
        variants: {
          hidden: { opacity: 0, y: 10 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: parseFloat(getDuration("moderate")) / 1000,
              delay: index * staggerDelay,
            },
          },
        },
      }),
    };
  }, [shouldAnimate, getDuration, staggerDelay, initialDelay, itemCount]);
}

/**
 * Create ambient animation (breathing, pulsing, etc.)
 */
export function useAmbientAnimation(
  type: "breathe" | "pulse" | "float" | "glow",
  options?: {
    duration?: number;
    enabled?: boolean;
  }
) {
  const { shouldAnimate } = useMotionConfig();
  const { duration, enabled = true } = options || {};

  return useMemo(() => {
    if (!shouldAnimate || !enabled) {
      return {};
    }

    const configs = {
      breathe: {
        animate: { opacity: [0.5, 1, 0.5] },
        transition: {
          duration: duration || 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      pulse: {
        animate: { scale: [1, 1.05, 1] },
        transition: {
          duration: duration || 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      float: {
        animate: { y: [0, -4, 0] },
        transition: {
          duration: duration || 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
      glow: {
        animate: {
          boxShadow: [
            "0 0 8px var(--sig-glow, rgba(255,255,255,0.2))",
            "0 0 20px var(--sig-glow, rgba(255,255,255,0.3))",
            "0 0 8px var(--sig-glow, rgba(255,255,255,0.2))",
          ],
        },
        transition: {
          duration: duration || 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    };

    return configs[type];
  }, [shouldAnimate, enabled, type, duration]);
}

// =============================================================================
// TYPOGRAPHY HOOKS
// =============================================================================

type TypePreset =
  | "heading-hero"
  | "heading-section"
  | "heading-card"
  | "body-large"
  | "body-default"
  | "body-small"
  | "label-default"
  | "label-mono"
  | "data-value"
  | "status-badge";

/**
 * Get typography styles for a preset
 */
export function useTypography(preset: TypePreset) {
  return useMemo(() => {
    const presets: Record<TypePreset, React.CSSProperties> = {
      "heading-hero": {
        fontSize: typography.sizes["3xl"],
        fontWeight: 600,
        lineHeight: typography.leading.tight,
        letterSpacing: typography.tracking.tight,
        fontFamily: typography.fonts.sans,
      },
      "heading-section": {
        fontSize: typography.sizes["2xl"],
        fontWeight: 600,
        lineHeight: typography.leading.tight,
        fontFamily: typography.fonts.sans,
      },
      "heading-card": {
        fontSize: typography.sizes.lg,
        fontWeight: 500,
        lineHeight: typography.leading.snug,
        fontFamily: typography.fonts.sans,
      },
      "body-large": {
        fontSize: typography.sizes.lg,
        fontWeight: 400,
        lineHeight: typography.leading.relaxed,
        fontFamily: typography.fonts.sans,
      },
      "body-default": {
        fontSize: typography.sizes.base,
        fontWeight: 400,
        lineHeight: typography.leading.normal,
        fontFamily: typography.fonts.sans,
      },
      "body-small": {
        fontSize: typography.sizes.sm,
        fontWeight: 400,
        lineHeight: typography.leading.normal,
        fontFamily: typography.fonts.sans,
      },
      "label-default": {
        fontSize: typography.sizes.sm,
        fontWeight: 500,
        lineHeight: typography.leading.none,
        letterSpacing: typography.tracking.wide,
        fontFamily: typography.fonts.sans,
      },
      "label-mono": {
        fontSize: typography.sizes.xs,
        fontWeight: 500,
        lineHeight: typography.leading.none,
        letterSpacing: typography.tracking.widest,
        fontFamily: typography.fonts.mono,
        textTransform: "uppercase" as const,
      },
      "data-value": {
        fontSize: typography.sizes.base,
        fontWeight: 500,
        lineHeight: typography.leading.none,
        fontFamily: typography.fonts.mono,
      },
      "status-badge": {
        fontSize: typography.sizes.xs,
        fontWeight: 500,
        lineHeight: typography.leading.none,
        letterSpacing: typography.tracking.widest,
        fontFamily: typography.fonts.mono,
        textTransform: "uppercase" as const,
      },
    };

    return presets[preset];
  }, [preset]);
}

// =============================================================================
// STATUS HOOKS
// =============================================================================

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

/**
 * Get status color configuration
 */
export function useStatusColor(status: StatusType) {
  return useMemo(() => {
    const configs: Record<StatusType, {
      color: string;
      bg: string;
      border: string;
      dot: string;
    }> = {
      success: {
        color: colors.status.success,
        bg: `${colors.status.success}15`,
        border: `${colors.status.success}30`,
        dot: "bg-emerald-400",
      },
      warning: {
        color: colors.status.warning,
        bg: `${colors.status.warning}15`,
        border: `${colors.status.warning}30`,
        dot: "bg-amber-400",
      },
      error: {
        color: colors.status.error,
        bg: `${colors.status.error}15`,
        border: `${colors.status.error}30`,
        dot: "bg-red-400",
      },
      info: {
        color: colors.status.info,
        bg: `${colors.status.info}15`,
        border: `${colors.status.info}30`,
        dot: "bg-cyan-400",
      },
      neutral: {
        color: colors.text.muted,
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.10)",
        dot: "bg-gray-500",
      },
    };

    return configs[status];
  }, [status]);
}

// =============================================================================
// COMPONENT HOOKS
// =============================================================================

/**
 * Create consistent card styles
 */
export function useCardStyles(options?: {
  elevated?: boolean;
  interactive?: boolean;
  signature?: SignatureColor;
}) {
  const { elevated = true, interactive = false, signature } = options || {};
  const sig = signature ? useSignatureColor(signature) : null;

  return useMemo(() => ({
    container: {
      backgroundColor: elevated ? colors.background.elevated : colors.background.base,
      border: `1px solid ${colors.border.subtle}`,
      borderRadius: "0.75rem", // radius-lg
      transition: interactive ? "border-color 200ms ease, box-shadow 200ms ease" : undefined,
    },
    containerHover: interactive ? {
      borderColor: colors.border.default,
      boxShadow: sig ? `0 0 20px ${sig.glow}` : undefined,
    } : undefined,
    accentLine: sig ? {
      height: "2px",
      backgroundColor: sig.primary,
    } : undefined,
  }), [elevated, interactive, sig]);
}

/**
 * Create consistent button styles
 */
export function useButtonStyles(
  variant: "primary" | "secondary" | "ghost" | "destructive" = "secondary"
) {
  return useMemo(() => {
    const base = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      borderRadius: "0.5rem", // radius-md
      fontWeight: 500,
      fontSize: typography.sizes.base,
      transition: "all 200ms ease",
      cursor: "pointer",
    };

    const variants = {
      primary: {
        ...base,
        background: "linear-gradient(to right, #FFFFFF, #E5E5E5)",
        color: colors.background.base,
        border: "none",
      },
      secondary: {
        ...base,
        backgroundColor: colors.background.surface,
        color: colors.text.secondary,
        border: `1px solid ${colors.border.default}`,
      },
      ghost: {
        ...base,
        backgroundColor: "transparent",
        color: colors.text.tertiary,
        border: "none",
      },
      destructive: {
        ...base,
        backgroundColor: `${colors.status.error}15`,
        color: colors.status.error,
        border: `1px solid ${colors.status.error}30`,
      },
    };

    return variants[variant];
  }, [variant]);
}

// =============================================================================
// EXPORTS
// =============================================================================

export const designHooks = {
  useSignatureColor,
  useAdvisorSignature,
  useMotionConfig,
  useStaggerAnimation,
  useAmbientAnimation,
  useTypography,
  useStatusColor,
  useCardStyles,
  useButtonStyles,
};

export default designHooks;

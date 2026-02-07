/**
 * HERITAGE COMMAND CENTER - Design System
 *
 * A comprehensive design system for building futuristic, elite interfaces.
 *
 * USAGE:
 * ```tsx
 * import { colors, typography, motion } from '@/lib/design-system';
 * import { useSignatureColor, useMotionConfig } from '@/lib/design-system';
 * ```
 *
 * Also import the CSS variables in your global styles:
 * ```css
 * @import '@/lib/design-system/variables.css';
 * ```
 */

// Tokens
export {
  colors,
  typography,
  typePresets,
  spacing,
  elevation,
  motion,
  motionPresets,
  borders,
  components,
  designTokens,
} from "./tokens";

// Guidelines (for documentation/reference)
export {
  principles,
  typographyGuidelines,
  colorGuidelines,
  motionGuidelines,
  elevationGuidelines,
  componentPatterns,
  antiPatterns,
  designGuidelines,
} from "./guidelines";

// Hooks
export {
  useSignatureColor,
  useAdvisorSignature,
  useMotionConfig,
  useStaggerAnimation,
  useAmbientAnimation,
  useTypography,
  useStatusColor,
  useCardStyles,
  useButtonStyles,
  designHooks,
} from "./hooks";

// Types
export type { SignatureColor, StatusType } from "./hooks";

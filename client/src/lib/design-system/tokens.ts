/**
 * HERITAGE COMMAND CENTER - Design System Tokens
 *
 * This design system enforces a futuristic, elite aesthetic.
 * All values are intentionally constrained to maintain visual authority.
 *
 * CORE PRINCIPLES:
 * 1. Darkness as luxury - Light is earned, not given
 * 2. Motion as intelligence - Movement signals computation
 * 3. Color as rank - Signature colors denote expertise
 * 4. Space as confidence - Generous spacing signals authority
 */

// =============================================================================
// COLOR SYSTEM
// =============================================================================

/**
 * BASE PALETTE
 *
 * The foundation is near-black. We don't use pure black (#000) as it feels
 * lifeless. Instead, we use slightly warm or cool blacks that feel alive.
 */
export const colors = {
  // Backgrounds - Layered darkness
  background: {
    void: "#05050a",      // Deepest layer - modal backdrops, overlays
    base: "#08080c",      // Primary background - main surfaces
    elevated: "#0d0d12",  // Cards, panels - one step up
    surface: "#12121a",   // Interactive surfaces - buttons, inputs
    raised: "#1a1a24",    // Hover states, active elements
  },

  // Borders - Subtle definition
  border: {
    subtle: "rgba(255, 255, 255, 0.05)",   // Barely visible structure
    default: "rgba(255, 255, 255, 0.10)",  // Standard borders
    emphasis: "rgba(255, 255, 255, 0.20)", // Hover/focus states
    strong: "rgba(255, 255, 255, 0.30)",   // Selected/active states
  },

  // Text - Hierarchical clarity
  text: {
    primary: "#FFFFFF",                     // Headlines, critical info
    secondary: "#E5E5E5",                   // Body text, descriptions
    tertiary: "#A3A3A3",                    // Labels, captions
    muted: "#737373",                       // Disabled, hints
    ghost: "#525252",                       // Decorative, background text
  },

  // Status - Functional colors
  status: {
    success: "#10B981",     // Emerald - Connected, approved
    warning: "#F59E0B",     // Amber - Caution, processing
    error: "#EF4444",       // Red - Disconnected, failed
    info: "#06B6D4",        // Cyan - Neutral info
  },

  // Advisor Signatures - Each advisor has a unique color identity
  signatures: {
    cyan: {
      primary: "#06B6D4",
      muted: "#0891B2",
      subtle: "rgba(6, 182, 212, 0.10)",
      glow: "rgba(6, 182, 212, 0.30)",
    },
    amber: {
      primary: "#F59E0B",
      muted: "#D97706",
      subtle: "rgba(245, 158, 11, 0.10)",
      glow: "rgba(245, 158, 11, 0.30)",
    },
    violet: {
      primary: "#8B5CF6",
      muted: "#7C3AED",
      subtle: "rgba(139, 92, 246, 0.10)",
      glow: "rgba(139, 92, 246, 0.30)",
    },
    emerald: {
      primary: "#10B981",
      muted: "#059669",
      subtle: "rgba(16, 185, 129, 0.10)",
      glow: "rgba(16, 185, 129, 0.30)",
    },
    red: {
      primary: "#EF4444",
      muted: "#DC2626",
      subtle: "rgba(239, 68, 68, 0.10)",
      glow: "rgba(239, 68, 68, 0.30)",
    },
    orange: {
      primary: "#F97316",
      muted: "#EA580C",
      subtle: "rgba(249, 115, 22, 0.10)",
      glow: "rgba(249, 115, 22, 0.30)",
    },
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * TYPOGRAPHY SCALE
 *
 * We use a constrained type scale that maintains hierarchy.
 * Monospace is used for data, status, and technical elements.
 * Sans-serif is used for prose and UI elements.
 */
export const typography = {
  // Font families
  fonts: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    mono: "JetBrains Mono, SF Mono, Consolas, monospace",
  },

  // Font sizes - Constrained scale
  sizes: {
    xs: "0.625rem",     // 10px - Micro labels, badges
    sm: "0.75rem",      // 12px - Captions, secondary text
    base: "0.875rem",   // 14px - Body text, UI elements
    lg: "1rem",         // 16px - Emphasized body
    xl: "1.125rem",     // 18px - Subheadings
    "2xl": "1.25rem",   // 20px - Section headers
    "3xl": "1.5rem",    // 24px - Page titles
    "4xl": "2rem",      // 32px - Hero text (rare)
  },

  // Line heights
  leading: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "1.75",
  },

  // Letter spacing
  tracking: {
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0",
    wide: "0.02em",
    wider: "0.05em",
    widest: "0.1em",    // For mono labels, status text
    ultrawide: "0.2em", // For section dividers
  },

  // Font weights
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

/**
 * TYPOGRAPHY PRESETS
 *
 * Pre-defined combinations for common use cases.
 * Use these instead of composing from primitives.
 */
export const typePresets = {
  // Headlines
  "heading-hero": {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.leading.tight,
    letterSpacing: typography.tracking.tight,
    fontFamily: typography.fonts.sans,
  },
  "heading-section": {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.leading.tight,
    letterSpacing: typography.tracking.normal,
    fontFamily: typography.fonts.sans,
  },
  "heading-card": {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.leading.snug,
    letterSpacing: typography.tracking.normal,
    fontFamily: typography.fonts.sans,
  },

  // Body text
  "body-large": {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    lineHeight: typography.leading.relaxed,
    letterSpacing: typography.tracking.normal,
    fontFamily: typography.fonts.sans,
  },
  "body-default": {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.leading.normal,
    letterSpacing: typography.tracking.normal,
    fontFamily: typography.fonts.sans,
  },
  "body-small": {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.leading.normal,
    letterSpacing: typography.tracking.normal,
    fontFamily: typography.fonts.sans,
  },

  // Labels and UI
  "label-default": {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.leading.none,
    letterSpacing: typography.tracking.wide,
    fontFamily: typography.fonts.sans,
  },
  "label-mono": {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: typography.leading.none,
    letterSpacing: typography.tracking.widest,
    fontFamily: typography.fonts.mono,
    textTransform: "uppercase" as const,
  },

  // Data and status
  "data-value": {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    lineHeight: typography.leading.none,
    letterSpacing: typography.tracking.normal,
    fontFamily: typography.fonts.mono,
  },
  "status-badge": {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: typography.leading.none,
    letterSpacing: typography.tracking.widest,
    fontFamily: typography.fonts.mono,
    textTransform: "uppercase" as const,
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

/**
 * SPACING SCALE
 *
 * Generous spacing signals confidence and clarity.
 * Use the scale - don't invent arbitrary values.
 */
export const spacing = {
  px: "1px",
  0.5: "0.125rem",  // 2px
  1: "0.25rem",     // 4px
  1.5: "0.375rem",  // 6px
  2: "0.5rem",      // 8px
  2.5: "0.625rem",  // 10px
  3: "0.75rem",     // 12px
  4: "1rem",        // 16px
  5: "1.25rem",     // 20px
  6: "1.5rem",      // 24px
  8: "2rem",        // 32px
  10: "2.5rem",     // 40px
  12: "3rem",       // 48px
  16: "4rem",       // 64px
  20: "5rem",       // 80px
  24: "6rem",       // 96px
} as const;

// =============================================================================
// ELEVATION & DEPTH
// =============================================================================

/**
 * ELEVATION SYSTEM
 *
 * Depth is created through layering, not shadows.
 * Shadows are reserved for glows and emphasis.
 */
export const elevation = {
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
    toast: 70,
  },

  // Box shadows - Used sparingly
  shadow: {
    none: "none",
    // Subtle depth
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    // Standard elevation
    md: "0 4px 12px rgba(0, 0, 0, 0.4)",
    // Prominent elements
    lg: "0 8px 24px rgba(0, 0, 0, 0.5)",
    // Floating elements
    xl: "0 16px 48px rgba(0, 0, 0, 0.6)",
  },

  // Glow effects - For signature colors
  glow: {
    sm: (color: string) => `0 0 8px ${color}`,
    md: (color: string) => `0 0 16px ${color}`,
    lg: (color: string) => `0 0 32px ${color}`,
    ring: (color: string) => `0 0 0 2px ${color}`,
  },
} as const;

// =============================================================================
// MOTION
// =============================================================================

/**
 * MOTION SYSTEM
 *
 * Motion signals intelligence and responsiveness.
 * All animations should feel purposeful, not decorative.
 *
 * RULES:
 * 1. Fast for direct manipulation (< 200ms)
 * 2. Medium for state changes (200-400ms)
 * 3. Slow for entrances/exits (400-600ms)
 * 4. Never use linear easing for UI
 */
export const motion = {
  // Duration scale
  duration: {
    instant: "0ms",
    fast: "100ms",       // Micro-interactions, hover states
    normal: "200ms",     // State changes, toggles
    moderate: "300ms",   // Transitions between views
    slow: "400ms",       // Complex animations
    slower: "600ms",     // Entrances, reveals
    deliberate: "1000ms", // Emphasis, dramatic reveals
  },

  // Easing curves
  easing: {
    // Standard easings
    linear: "linear",                                    // Only for progress bars
    ease: "ease",                                        // Generic, avoid
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",               // Exits
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",              // Entrances
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",          // Symmetrical

    // Custom curves
    snap: "cubic-bezier(0.2, 0, 0, 1)",                 // Quick snap, satisfying
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",             // Smooth, natural
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",       // Playful (rare)

    // Dramatic curves
    dramatic: "cubic-bezier(0.16, 1, 0.3, 1)",         // Slow start, fast finish
    anticipate: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Wind up, overshoot
  },

  // Spring configurations (for Framer Motion)
  spring: {
    // Snappy, responsive
    snappy: { type: "spring", stiffness: 400, damping: 25 },
    // Gentle, smooth
    gentle: { type: "spring", stiffness: 200, damping: 20 },
    // Bouncy, playful
    bouncy: { type: "spring", stiffness: 300, damping: 15 },
    // Heavy, deliberate
    heavy: { type: "spring", stiffness: 150, damping: 30 },
  },
} as const;

/**
 * MOTION PRESETS
 *
 * Pre-defined animation configurations for common patterns.
 */
export const motionPresets = {
  // Fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },

  // Slide variations
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },

  // Reveal (for dramatic entrances)
  reveal: {
    initial: { opacity: 0, y: 20, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },

  // Ambient animations (looping)
  breathe: {
    animate: { opacity: [0.5, 1, 0.5] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  pulse: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  float: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
} as const;

// =============================================================================
// BORDERS & RADIUS
// =============================================================================

export const borders = {
  // Border radius scale
  radius: {
    none: "0",
    sm: "0.25rem",    // 4px - Tight elements
    md: "0.5rem",     // 8px - Buttons, inputs
    lg: "0.75rem",    // 12px - Cards
    xl: "1rem",       // 16px - Panels
    "2xl": "1.5rem",  // 24px - Large cards
    full: "9999px",   // Pills, avatars
  },

  // Border widths
  width: {
    none: "0",
    thin: "1px",
    default: "2px",
    thick: "3px",
  },
} as const;

// =============================================================================
// COMPONENT TOKENS
// =============================================================================

/**
 * COMPONENT-SPECIFIC TOKENS
 *
 * Pre-defined configurations for common components.
 */
export const components = {
  // Button variants
  button: {
    sizes: {
      sm: { height: "32px", padding: "0 12px", fontSize: typography.sizes.sm },
      md: { height: "40px", padding: "0 16px", fontSize: typography.sizes.base },
      lg: { height: "48px", padding: "0 24px", fontSize: typography.sizes.lg },
    },
    variants: {
      primary: {
        background: "linear-gradient(to right, #FFFFFF, #E5E5E5)",
        color: colors.background.base,
        hoverBrightness: 0.9,
      },
      secondary: {
        background: colors.background.surface,
        color: colors.text.secondary,
        border: colors.border.default,
      },
      ghost: {
        background: "transparent",
        color: colors.text.tertiary,
        hoverBackground: colors.background.raised,
      },
    },
  },

  // Card configurations
  card: {
    padding: {
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
    },
    radius: borders.radius.lg,
    border: colors.border.subtle,
    background: colors.background.elevated,
  },

  // Input configurations
  input: {
    height: "44px",
    padding: spacing[3],
    radius: borders.radius.md,
    border: colors.border.default,
    focusBorder: colors.border.emphasis,
    background: colors.background.surface,
  },

  // Badge configurations
  badge: {
    padding: `${spacing[1]} ${spacing[2]}`,
    radius: borders.radius.sm,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.mono,
    letterSpacing: typography.tracking.widest,
  },
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export const designTokens = {
  colors,
  typography,
  typePresets,
  spacing,
  elevation,
  motion,
  motionPresets,
  borders,
  components,
} as const;

export default designTokens;

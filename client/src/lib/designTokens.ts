/**
 * Agent Lounge Design Tokens
 *
 * This file defines the complete design system for the Agent Lounge.
 * All colors, typography, spacing, and effects should reference these tokens.
 *
 * IMPORTANT: Do not use arbitrary colors in components. Always use these tokens.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Heritage Brand Colors
  heritage: {
    primary: '#292966',      // Deep navy - main brand color
    accent: '#7C7CFF',       // Bright purple - interactive elements
    light: '#B8B8FF',        // Light purple - backgrounds, hover states
    gold: '#E1B138',         // Rich gold - success, achievements, earnings
    burgundy: '#541221',     // Deep burgundy - leads, pipeline
    cream: '#fffaf3',        // Warm cream - page backgrounds
  },

  // Pipeline Status Colors (burgundy to gold progression)
  status: {
    new: {
      bg: '#541221',
      bgLight: 'rgba(84, 18, 33, 0.1)',
      text: '#ffffff',
      border: '#6b2c3d',
    },
    contacted: {
      bg: '#6b2c3d',
      bgLight: 'rgba(107, 44, 61, 0.1)',
      text: '#ffffff',
      border: '#8b4a5c',
    },
    qualified: {
      bg: '#7C7CFF',
      bgLight: 'rgba(124, 124, 255, 0.1)',
      text: '#ffffff',
      border: '#9999FF',
    },
    proposal: {
      bg: '#E1B138',
      bgLight: 'rgba(225, 177, 56, 0.1)',
      text: '#292966',
      border: '#c49a2f',
    },
    closed: {
      bg: '#c49a2f',
      bgLight: 'rgba(196, 154, 47, 0.15)',
      text: '#292966',
      border: '#a88426',
    },
    lost: {
      bg: '#6b7280',
      bgLight: 'rgba(107, 114, 128, 0.1)',
      text: '#ffffff',
      border: '#9ca3af',
    },
  },

  // Feedback Colors
  feedback: {
    success: {
      main: '#10b981',
      light: 'rgba(16, 185, 129, 0.1)',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: 'rgba(245, 158, 11, 0.1)',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: 'rgba(239, 68, 68, 0.1)',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: 'rgba(59, 130, 246, 0.1)',
      dark: '#2563eb',
    },
  },

  // Gamification Colors
  gamification: {
    xp: {
      main: '#7C7CFF',
      glow: 'rgba(124, 124, 255, 0.4)',
      gradient: 'linear-gradient(135deg, #7C7CFF 0%, #B8B8FF 100%)',
    },
    streak: {
      main: '#f97316',
      glow: 'rgba(249, 115, 22, 0.4)',
      gradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    },
    level: {
      main: '#E1B138',
      glow: 'rgba(225, 177, 56, 0.4)',
      gradient: 'linear-gradient(135deg, #E1B138 0%, #fbbf24 100%)',
    },
    achievement: {
      main: '#7C7CFF',
      glow: 'rgba(124, 124, 255, 0.5)',
      gradient: 'linear-gradient(135deg, #7C7CFF 0%, #E1B138 100%)',
    },
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    black: '#000000',
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    display: '"Playfair Display", Georgia, serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  // Colored shadows for gamification
  glow: {
    purple: '0 0 20px rgba(124, 124, 255, 0.4)',
    gold: '0 0 20px rgba(225, 177, 56, 0.4)',
    orange: '0 0 20px rgba(249, 115, 22, 0.4)',
  },

  // Card hover effect
  card: '0 4px 12px rgba(41, 41, 102, 0.08)',
  cardHover: '0 8px 24px rgba(41, 41, 102, 0.12)',
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px
  base: '0.375rem',  // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

// =============================================================================
// ANIMATIONS
// =============================================================================

export const animations = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Framer Motion variants
  variants: {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    },
    slideInRight: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      },
    },
  },
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  maximum: 9999,
} as const;

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

export const components = {
  // Sidebar
  sidebar: {
    width: {
      expanded: '256px',
      collapsed: '72px',
    },
    background: colors.neutral.white,
    border: colors.neutral.gray200,
  },

  // Cards
  card: {
    background: colors.neutral.white,
    border: colors.neutral.gray100,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    shadow: shadows.card,
    shadowHover: shadows.cardHover,
  },

  // Buttons
  button: {
    primary: {
      background: colors.heritage.primary,
      backgroundHover: '#1e1e4d',
      text: colors.neutral.white,
    },
    secondary: {
      background: colors.heritage.gold,
      backgroundHover: '#c49a2f',
      text: colors.heritage.primary,
    },
    accent: {
      background: colors.heritage.accent,
      backgroundHover: '#6a6aee',
      text: colors.neutral.white,
    },
    ghost: {
      background: 'transparent',
      backgroundHover: colors.neutral.gray100,
      text: colors.neutral.gray600,
    },
  },

  // Inputs
  input: {
    background: colors.neutral.white,
    border: colors.neutral.gray300,
    borderFocus: colors.heritage.accent,
    borderError: colors.feedback.error.main,
    borderRadius: borderRadius.lg,
    padding: `${spacing[2.5]} ${spacing[3]}`,
  },

  // Badges
  badge: {
    borderRadius: borderRadius.full,
    padding: `${spacing[0.5]} ${spacing[2]}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  // Progress bars
  progress: {
    height: '8px',
    background: colors.neutral.gray200,
    borderRadius: borderRadius.full,
    fill: colors.heritage.accent,
  },

  // Avatar
  avatar: {
    sizes: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '64px',
    },
    background: `linear-gradient(135deg, ${colors.heritage.primary} 0%, ${colors.heritage.accent} 100%)`,
    text: colors.neutral.white,
    borderRadius: borderRadius.full,
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get status color configuration
 */
export const getStatusColors = (status: keyof typeof colors.status) => {
  return colors.status[status] || colors.status.new;
};

/**
 * Get feedback color configuration
 */
export const getFeedbackColors = (type: keyof typeof colors.feedback) => {
  return colors.feedback[type];
};

/**
 * Get gamification color configuration
 */
export const getGamificationColors = (type: keyof typeof colors.gamification) => {
  return colors.gamification[type];
};

// =============================================================================
// TAILWIND CLASS MAPPINGS
// =============================================================================

/**
 * Status to Tailwind class mapping
 * Use these in className props for consistent styling
 */
export const statusClasses = {
  new: {
    badge: 'bg-[#541221] text-white',
    badgeLight: 'bg-[#541221]/10 text-[#541221]',
    border: 'border-[#6b2c3d]',
    dot: 'bg-[#541221]',
  },
  contacted: {
    badge: 'bg-[#6b2c3d] text-white',
    badgeLight: 'bg-[#6b2c3d]/10 text-[#6b2c3d]',
    border: 'border-[#8b4a5c]',
    dot: 'bg-[#6b2c3d]',
  },
  qualified: {
    badge: 'bg-heritage-accent text-white',
    badgeLight: 'bg-heritage-accent/10 text-heritage-accent',
    border: 'border-heritage-accent',
    dot: 'bg-heritage-accent',
  },
  proposal: {
    badge: 'bg-[#E1B138] text-heritage-primary',
    badgeLight: 'bg-[#E1B138]/10 text-[#c49a2f]',
    border: 'border-[#E1B138]',
    dot: 'bg-[#E1B138]',
  },
  closed: {
    badge: 'bg-[#c49a2f] text-heritage-primary',
    badgeLight: 'bg-[#c49a2f]/15 text-[#a88426]',
    border: 'border-[#c49a2f]',
    dot: 'bg-[#c49a2f]',
  },
  lost: {
    badge: 'bg-gray-500 text-white',
    badgeLight: 'bg-gray-500/10 text-gray-600',
    border: 'border-gray-400',
    dot: 'bg-gray-500',
  },
} as const;

/**
 * Activity type to icon color mapping
 */
export const activityTypeClasses = {
  deal: 'text-[#E1B138]',
  call: 'text-heritage-primary',
  lead: 'text-heritage-accent',
  achievement: 'text-[#E1B138]',
  streak: 'text-orange-500',
  training: 'text-heritage-accent',
  earning: 'text-[#E1B138]',
} as const;

/**
 * Priority classes for tasks
 */
export const priorityClasses = {
  high: {
    badge: 'bg-red-500/10 text-red-600',
    icon: 'text-red-500',
    border: 'border-red-200',
  },
  medium: {
    badge: 'bg-[#E1B138]/10 text-[#c49a2f]',
    icon: 'text-[#E1B138]',
    border: 'border-[#E1B138]/30',
  },
  low: {
    badge: 'bg-gray-100 text-gray-600',
    icon: 'text-gray-400',
    border: 'border-gray-200',
  },
} as const;

// Export everything as a unified theme object
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  breakpoints,
  zIndex,
  components,
  statusClasses,
  activityTypeClasses,
  priorityClasses,
} as const;

export default theme;

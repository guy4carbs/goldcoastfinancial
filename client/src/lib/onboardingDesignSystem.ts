/**
 * HERITAGE COMMAND LOUNGE DESIGN SYSTEM
 * Apple-Aligned CRM + Dashboard Architecture
 *
 * This file contains all design tokens and utilities for the onboarding system.
 * All values follow the 8-point modular grid and golden ratio principles.
 */

// ============================================
// 8-POINT MODULAR GRID (U = 8px)
// ============================================
export const GRID = {
  unit: 8,
  spacing: {
    xs: 8,     // 1U
    sm: 16,    // 2U
    md: 24,    // 3U
    lg: 32,    // 4U
    xl: 40,    // 5U
    xxl: 48,   // 6U
    xxxl: 64,  // 8U
    xxxxl: 80, // 10U
    section: 96, // 12U
  },
} as const;

// ============================================
// GOLDEN RATIO (φ ≈ 1.618)
// ============================================
export const PHI = 1.618;

// Apply golden ratio to a value
export const golden = (base: number) => Math.round(base * PHI);
export const goldenInverse = (base: number) => Math.round(base / PHI);

// ============================================
// TYPOGRAPHY SCALE (per spec)
// ============================================
export const TYPE = {
  display: 40,    // Hero headlines
  hero: 34,       // Section heroes
  section: 24,    // Section titles
  title: 20,      // Card titles
  body: 17,       // Body text
  meta: 14,       // Metadata
  caption: 13,    // Captions
  micro: 11,      // Tiny labels
  // Line height multiplier
  lineHeight: 1.4,
} as const;

// ============================================
// CORNER RADIUS (per spec)
// ============================================
export const RADIUS = {
  button: 16,
  card: 24,
  hero: 32,
  pill: 9999,
  // Dynamic radius: R = min(width, height) × 0.06
  dynamic: (width: number, height: number) => Math.round(Math.min(width, height) * 0.06),
} as const;

// ============================================
// SHADOW SYSTEM - Elevation Based
// ShadowBlur = Elevation × 6px
// ShadowY = Elevation × 4px
// Opacity = 0.02 × Elevation
// ============================================
export const SHADOW = {
  level0: 'none',
  level1: '0 4px 6px rgba(0,0,0,0.02)',
  level2: '0 8px 12px rgba(0,0,0,0.04)',
  level3: '0 12px 18px rgba(0,0,0,0.06)',
  level4: '0 16px 24px rgba(0,0,0,0.08)',
  // Elevated with subtle inner glow
  elevated: (level: 1 | 2 | 3 | 4) => {
    const blur = level * 6;
    const y = level * 4;
    const opacity = level * 0.02;
    return `0 ${y}px ${blur}px rgba(0,0,0,${opacity})`;
  },
  // Card with specular edge
  card: '0 8px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.1) inset',
  // Hero with depth
  hero: '0 12px 18px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.15) inset',
} as const;

// ============================================
// GLASS MATERIAL SYSTEM
// Gaussian blur with translucency
// ============================================
export const GLASS = {
  blur: 20,
  blurLight: 12,
  background: 'rgba(255,255,255,0.72)',
  backgroundSubtle: 'rgba(255,255,255,0.08)',
  backgroundDark: 'rgba(0,0,0,0.04)',
  border: 'rgba(255,255,255,0.18)',
  borderSubtle: 'rgba(0,0,0,0.06)',
  // CSS properties
  css: {
    standard: {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(0,0,0,0.06)',
    },
    subtle: {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  },
} as const;

// ============================================
// MOTION SYSTEM - Spring-based, critically damped
// Web easing: cubic-bezier(0.22, 1, 0.36, 1)
// ============================================
export const MOTION = {
  easing: [0.22, 1, 0.36, 1] as const,
  easingCSS: 'cubic-bezier(0.22, 1, 0.36, 1)',
  duration: {
    instant: 0.08,
    hover: 0.12,
    fast: 0.15,
    normal: 0.22,
    expand: 0.22,
    transition: 0.35,
    modal: 0.4,
    slow: 0.5,
  },
  // Hover lift effect per spec
  hover: {
    y: -4,
    scale: 1.01,
  },
  // Spring configuration for Framer Motion
  spring: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 300,
  },
} as const;

// ============================================
// LAYOUT DIMENSIONS
// ============================================
export const LAYOUT = {
  // Navigation
  sidebar: {
    expanded: 280,
    collapsed: 88,
  },
  // Row and button heights (6U = 48px)
  rowHeight: 48,
  buttonHeight: 48,
  // Icon sizes
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  // Card dimensions
  card: {
    minHeight: 200,
    heroHeight: 324, // 200 × φ ≈ 324
    padding: 24,
    gap: 16,
  },
  // Hero command center
  hero: {
    minRatio: 0.25, // HeroArea / ViewportArea ≥ 0.25
    padding: 32,
    progressHeight: 8,
    progressRadius: 4,
  },
  // Maximum readable width
  maxReadableWidth: 75, // characters
} as const;

// ============================================
// COLOR PALETTE (HSB-based, perceptual)
// ============================================
export const COLORS = {
  // Primary gradient (violet to purple to amber)
  primary: {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(147,51,234,0.08) 100%)',
    violet: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
  },
  // Accent (amber/gold for XP, achievements)
  accent: {
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// ============================================
// CARD VARIANTS
// ============================================
export const CARD_STYLES = {
  // Standard elevated card
  standard: {
    background: 'white',
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    boxShadow: SHADOW.level2,
    border: `1px solid ${COLORS.gray[200]}`,
  },
  // Glass card with blur
  glass: {
    background: GLASS.background,
    backdropFilter: `blur(${GLASS.blur}px)`,
    WebkitBackdropFilter: `blur(${GLASS.blur}px)`,
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    boxShadow: SHADOW.card,
    border: `1px solid ${GLASS.borderSubtle}`,
  },
  // Hero card with gradient
  hero: {
    background: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.purple[600]} 50%, ${COLORS.primary.violet[700]} 100%)`,
    borderRadius: RADIUS.hero,
    padding: GRID.spacing.lg,
    boxShadow: SHADOW.hero,
    color: 'white',
  },
  // Accent card (amber)
  accent: {
    background: `linear-gradient(135deg, ${COLORS.accent.amber[500]} 0%, ${COLORS.accent.amber[600]} 100%)`,
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    boxShadow: SHADOW.level2,
    color: 'white',
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate consistent spacing value
export const spacing = (multiplier: number) => GRID.unit * multiplier;

// Check if spacing value is valid (multiple of 8)
export const isValidSpacing = (value: number) => value % GRID.unit === 0;

// Get typography styles
export const getTypography = (variant: keyof typeof TYPE) => ({
  fontSize: TYPE[variant],
  lineHeight: typeof TYPE[variant] === 'number' ? TYPE[variant] * TYPE.lineHeight : undefined,
});

// Get shadow for elevation level
export const getShadow = (level: 0 | 1 | 2 | 3 | 4) => {
  const shadows = [SHADOW.level0, SHADOW.level1, SHADOW.level2, SHADOW.level3, SHADOW.level4];
  return shadows[level];
};

// Animation variants for Framer Motion
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.duration.normal,
      ease: MOTION.easing,
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION.duration.normal,
      ease: MOTION.easing,
    },
  },
};

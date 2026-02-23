/**
 * HERITAGE COMMAND LOUNGE DESIGN SYSTEM
 * Apple-Aligned CRM + Dashboard Architecture
 *
 * This file contains ALL design tokens for the Heritage platform.
 * All values follow the 8-point modular grid and golden ratio principles.
 *
 * Philosophy: Precision × Warmth
 * - Engineered, Layered, Intelligent, Spacious, Alive but restrained
 * - Never: Startup playful, Sterile enterprise, Over-ornamental
 */

// ============================================
// I. 8-POINT MODULAR GRID (U = 8px)
// S = n × U, n ∈ ℕ
// Valid: 8, 16, 24, 32, 40, 48, 64, 80, 96
// ============================================
export const GRID = {
  unit: 8,
  spacing: {
    xs: 8,      // 1U - Tight spacing
    sm: 16,     // 2U - Default gap
    md: 24,     // 3U - Card padding
    lg: 32,     // 4U - Section gap
    xl: 40,     // 5U - Hero padding
    xxl: 48,    // 6U - Button/row height
    xxxl: 64,   // 8U - Large spacing
    xxxxl: 80,  // 10U - Hero sections
    section: 96, // 12U - Section dividers
  },
} as const;

// ============================================
// II. GOLDEN RATIO (φ = (1 + √5) / 2 ≈ 1.618)
// ============================================
export const PHI = 1.618;
export const golden = (base: number) => Math.round(base * PHI);
export const goldenInverse = (base: number) => Math.round(base / PHI);

// ============================================
// III. TYPOGRAPHY SCALE
// 34 / 21 ≈ 1.619 (Golden proportion maintained)
// LineHeight = FontSize × 1.4
// ============================================
export const TYPE = {
  display: 40,    // Display headlines
  hero: 34,       // Hero headlines (34/21 ≈ φ)
  section: 24,    // Section titles
  title: 20,      // Card titles
  body: 17,       // Body text (16-17)
  meta: 14,       // Metadata, labels
  caption: 13,    // Captions
  micro: 11,      // Tiny labels
  lineHeight: 1.4,
} as const;

// ============================================
// IV. CORNER RADIUS SYSTEM
// R = min(width, height) × 0.06
// ============================================
export const RADIUS = {
  button: 16,     // Interactive elements
  card: 24,       // Standard cards (20-24)
  hero: 32,       // Hero containers (28-32)
  pill: 9999,     // Pills, badges
  input: 12,      // Form inputs
  dynamic: (w: number, h: number) => Math.round(Math.min(w, h) * 0.06),
} as const;

// ============================================
// V. ELEVATION-BASED SHADOW SYSTEM
// ShadowBlur = Elevation × 6px
// ShadowY = Elevation × 4px
// Opacity = 0.02 × Elevation
// No harsh shadows, no hard black
// ============================================
export const SHADOW = {
  level0: 'none',
  level1: '0 4px 6px rgba(0, 0, 0, 0.02)',
  level2: '0 8px 12px rgba(0, 0, 0, 0.04)',
  level3: '0 12px 18px rgba(0, 0, 0, 0.06)',
  level4: '0 16px 24px rgba(0, 0, 0, 0.08)',
  // Card with specular edge (1px white border at 15-18% opacity)
  card: '0 8px 12px rgba(0, 0, 0, 0.04)',
  // Hero with depth
  hero: '0 16px 24px rgba(0, 0, 0, 0.08)',
  // Elevated function
  elevated: (level: 1 | 2 | 3 | 4) => {
    const blur = level * 6;
    const y = level * 4;
    const opacity = level * 0.02;
    return `0 ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`;
  },
} as const;

// ============================================
// VI. GLASS MATERIAL SYSTEM
// Gaussian blur: G(x) = (1 / (σ√2π)) e^(-(x² / 2σ²))
// σ for cards: 20-30
// Specular edge: 1px white border at 15-18% opacity
// ============================================
export const GLASS = {
  blur: 20,
  blurLight: 12,
  background: 'rgba(255, 255, 255, 0.72)',
  backgroundLight: 'rgba(255, 255, 255, 0.85)',
  backgroundSubtle: 'rgba(255, 255, 255, 0.08)',
  backgroundDark: 'rgba(0, 0, 0, 0.04)',
  border: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.18)',
  borderSubtle: 'rgba(255, 255, 255, 0.1)',
  // CSS properties for glass effect
  css: {
    standard: {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
    },
    light: {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
    },
    subtle: {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
} as const;

// ============================================
// VII. MOTION SYSTEM (Physics-Driven)
// Spring: m d²x/dt² + c dx/dt + kx = 0
// Critical damping: c² = 4mk
// Web easing: cubic-bezier(0.22, 1, 0.36, 1)
// Target: 60fps, only animate transform/opacity
// ============================================
export const MOTION = {
  easing: [0.22, 1, 0.36, 1] as const,
  easingCSS: 'cubic-bezier(0.22, 1, 0.36, 1)',
  duration: {
    instant: 0.08,
    hover: 0.12,      // Hover lift
    fast: 0.15,
    normal: 0.22,
    expand: 0.22,     // Card expand
    transition: 0.35, // Page transition
    modal: 0.4,       // Modal
    slow: 0.5,
  },
  // Hover transform: translateY(-4px), scale(1.01)
  hover: {
    y: -4,
    scale: 1.01,
  },
  // Spring config for Framer Motion
  spring: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 300,
  },
} as const;

// ============================================
// VIII. LAYOUT DIMENSIONS
// ============================================
export const LAYOUT = {
  // Sidebar navigation
  sidebar: {
    expanded: 280,
    collapsed: 88,
    iconSize: 24,
    itemSpacing: 24,
    rowHeight: 48,  // 6U
  },
  // Header
  header: {
    height: 64,     // 8U
  },
  // Row and button heights (6U = 48px)
  rowHeight: 48,
  buttonHeight: 48,
  // Icon sizes
  icon: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  // Card dimensions
  card: {
    minHeight: 200,
    heroHeight: 324,   // 200 × φ ≈ 324
    padding: 24,       // 3U
    gap: 16,           // 2U
    internalSpacing: 16, // 2U min
  },
  // Hero command center
  hero: {
    minRatio: 0.25,    // HeroArea / ViewportArea ≥ 0.25
    padding: 32,       // 4U (32-40)
    progressHeight: 8,
    progressRadius: 4,
  },
  // Grid
  grid: {
    columns: 12,
    gutter: 16,        // 2U
    maxWidth: 1440,
    densityWidth: 1200,
  },
  // Maximum readable width
  maxReadableChars: 75,
} as const;

// ============================================
// IX. COLOR SYSTEM (HSB-based, Perceptual)
// Contrast: (L1 + 0.05) / (L2 + 0.05) ≥ 4.5
// White text requires background luminance < 0.18
// ============================================
export const COLORS = {
  // Primary Heritage colors (violet/purple)
  primary: {
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
  // Accent (amber/gold for XP, achievements, CTAs)
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
  // Lounge-specific colors
  lounges: {
    agent: { light: '#f5f3ff', main: '#7c3aed', dark: '#5b21b6' },
    crm: { light: '#eef2ff', main: '#6366f1', dark: '#4338ca' },
    ai: { light: '#ecfeff', main: '#06b6d4', dark: '#0e7490' },
    manager: { light: '#ecfdf5', main: '#10b981', dark: '#047857' },
    executive: { light: '#fffbeb', main: '#f59e0b', dark: '#b45309' },
    marketing: { light: '#fff1f2', main: '#f43f5e', dark: '#be123c' },
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
  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #6d28d9 100%)',
    heroWithAccent: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #f59e0b 100%)',
    subtle: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
} as const;

// ============================================
// X. DATA TABLE SYSTEM
// Row height: 48px (6U)
// Column spacing: 16px minimum
// Hover: Background opacity increase 3-5%
// ============================================
export const TABLE = {
  rowHeight: 48,
  headerHeight: 48,
  cellPadding: 16,
  borderColor: COLORS.gray[200],
  hoverBg: 'rgba(0, 0, 0, 0.03)',
  stripedBg: 'rgba(0, 0, 0, 0.02)',
} as const;

// ============================================
// XI. RESPONSIVE BREAKPOINTS
// Mobile: < 768px, Tablet: 768-1024px
// Desktop: 1024-1440px, Wide: > 1440px
// Sidebar collapses under 1024px
// ============================================
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
} as const;

// ============================================
// XII. FRAMER MOTION VARIANTS
// ============================================
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

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION.duration.normal,
      ease: MOTION.easing,
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

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION.duration.normal,
      ease: MOTION.easing,
    },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
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

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// ============================================
// XIII. UTILITY FUNCTIONS
// ============================================

// Generate consistent spacing value
export const spacing = (multiplier: number) => GRID.unit * multiplier;

// Check if spacing value is valid (multiple of 8)
export const isValidSpacing = (value: number) => value % GRID.unit === 0;

// Get typography styles
export const getTypography = (variant: keyof typeof TYPE) => {
  const size = TYPE[variant];
  if (typeof size === 'number') {
    return {
      fontSize: size,
      lineHeight: size * TYPE.lineHeight,
    };
  }
  return { fontSize: 17, lineHeight: 17 * 1.4 };
};

// Get shadow for elevation level
export const getShadow = (level: 0 | 1 | 2 | 3 | 4) => {
  const shadows = [SHADOW.level0, SHADOW.level1, SHADOW.level2, SHADOW.level3, SHADOW.level4];
  return shadows[level];
};

// Card width calculator per spec
// W = (ContainerWidth − (gaps × (n − 1))) / n
export const getCardWidth = (containerWidth: number, columns: number, gap: number = GRID.spacing.sm) => {
  return (containerWidth - (gap * (columns - 1))) / columns;
};

// Card height from width (golden ratio)
// H = W × 0.618
export const getCardHeight = (width: number) => Math.round(width * 0.618);

// Hero height from base (golden ratio)
// H_hero = base × φ ≈ base × 1.618
export const getHeroHeight = (baseHeight: number = 200) => Math.round(baseHeight * PHI);

// Column count based on container width
// Columns = floor(ContainerWidth / 320px)
export const getColumnCount = (containerWidth: number) => Math.floor(containerWidth / 320);

// Lounge color helper
export const getLoungeColors = (lounge: keyof typeof COLORS.lounges) => COLORS.lounges[lounge];

// Hover background helper
export const getHoverBg = (color: string, opacity: number = 0.08) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ============================================
// XIV. COMPONENT STYLE PRESETS
// ============================================
export const CARD_STYLES = {
  standard: {
    background: 'white',
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    boxShadow: SHADOW.level2,
    border: `1px solid ${COLORS.gray[200]}`,
  },
  glass: {
    ...GLASS.css.standard,
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    boxShadow: SHADOW.card,
  },
  hero: {
    background: COLORS.gradients.hero,
    borderRadius: RADIUS.hero,
    padding: GRID.spacing.lg,
    boxShadow: SHADOW.hero,
    color: 'white',
  },
  heroAccent: {
    background: COLORS.gradients.heroWithAccent,
    borderRadius: RADIUS.hero,
    padding: GRID.spacing.lg,
    boxShadow: SHADOW.hero,
    color: 'white',
  },
  subtle: {
    background: COLORS.gray[50],
    borderRadius: RADIUS.card,
    padding: GRID.spacing.md,
    border: `1px solid ${COLORS.gray[200]}`,
  },
} as const;

export const BUTTON_STYLES = {
  primary: {
    background: COLORS.gradients.hero,
    color: 'white',
    borderRadius: RADIUS.button,
    height: LAYOUT.buttonHeight,
    padding: `0 ${GRID.spacing.md}px`,
    boxShadow: SHADOW.level2,
  },
  secondary: {
    background: 'white',
    color: COLORS.primary.violet[600],
    borderRadius: RADIUS.button,
    height: LAYOUT.buttonHeight,
    padding: `0 ${GRID.spacing.md}px`,
    border: `1px solid ${COLORS.primary.violet[200]}`,
  },
  ghost: {
    background: 'transparent',
    color: COLORS.gray[600],
    borderRadius: RADIUS.button,
    height: LAYOUT.buttonHeight,
    padding: `0 ${GRID.spacing.sm}px`,
  },
} as const;

// ============================================
// XV. EXPORT ALL
// ============================================
export default {
  GRID,
  PHI,
  golden,
  goldenInverse,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  MOTION,
  LAYOUT,
  COLORS,
  TABLE,
  BREAKPOINTS,
  CARD_STYLES,
  BUTTON_STYLES,
  // Animation variants
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerFast,
  // Utilities
  spacing,
  isValidSpacing,
  getTypography,
  getShadow,
  getCardWidth,
  getCardHeight,
  getHeroHeight,
  getColumnCount,
  getLoungeColors,
  getHoverBg,
};

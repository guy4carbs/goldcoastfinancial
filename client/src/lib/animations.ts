/**
 * Animation Utilities & Framer Motion Variants
 *
 * Centralized animation system for consistent, performant animations
 * across the Agent Lounge.
 */

import { Variants, Transition } from "framer-motion";

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,

  springBouncy: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  } as Transition,

  springGentle: {
    type: "spring",
    stiffness: 200,
    damping: 20,
  } as Transition,

  easeOut: {
    type: "tween",
    ease: "easeOut",
    duration: 0.3,
  } as Transition,

  easeInOut: {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4,
  } as Transition,
} as const;

// =============================================================================
// PAGE & CONTAINER VARIANTS
// =============================================================================

export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// =============================================================================
// ITEM VARIANTS
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.easeOut,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springBouncy,
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// =============================================================================
// MODAL & OVERLAY VARIANTS
// =============================================================================

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2 },
  },
};

export const slideUpVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    y: "100%",
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// LIST & CARD VARIANTS
// =============================================================================

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.15 },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(41, 41, 102, 0.12)",
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// =============================================================================
// GAMIFICATION VARIANTS
// =============================================================================

export const xpPopVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: -30,
    transition: { duration: 0.3 },
  },
};

export const celebrationVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.2,
    transition: { duration: 0.3 },
  },
};

export const pulseVariants: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

export const glowVariants: Variants = {
  idle: {
    boxShadow: "0 0 0 rgba(124, 124, 255, 0)"
  },
  glow: {
    boxShadow: [
      "0 0 0 rgba(124, 124, 255, 0)",
      "0 0 20px rgba(124, 124, 255, 0.6)",
      "0 0 0 rgba(124, 124, 255, 0)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

export const streakFlameVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  burning: {
    scale: [1, 1.1, 1],
    rotate: [-5, 5, -5],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "mirror",
    },
  },
};

export const progressFillVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (custom: number) => ({
    scaleX: custom / 100,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay: 0.2,
    },
  }),
};

export const countUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// =============================================================================
// NOTIFICATION VARIANTS
// =============================================================================

export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.springBouncy,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// DRAG & DROP VARIANTS
// =============================================================================

export const draggableVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  dragging: {
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(41, 41, 102, 0.2)",
    cursor: "grabbing",
  },
};

export const dropZoneVariants: Variants = {
  idle: {
    backgroundColor: "transparent",
    borderColor: "rgba(209, 213, 219, 1)",
  },
  active: {
    backgroundColor: "rgba(124, 124, 255, 0.05)",
    borderColor: "rgba(124, 124, 255, 0.5)",
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates a staggered delay for list items
 */
export const getStaggerDelay = (index: number, baseDelay = 0.05): number => {
  return index * baseDelay;
};

/**
 * Creates custom transition with delay
 */
export const withDelay = (transition: Transition, delay: number): Transition => {
  return { ...transition, delay };
};

/**
 * Number counter animation hook helper
 */
export const getCounterConfig = (duration = 1) => ({
  duration,
  ease: "easeOut" as const,
});

// =============================================================================
// CSS KEYFRAME ANIMATIONS (for index.css)
// =============================================================================

export const cssAnimations = {
  shimmer: `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `,

  pulse: `
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,

  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,

  confetti: `
    @keyframes confetti-fall {
      0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `,

  sparkle: `
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
  `,
};

export default {
  transitions,
  pageVariants,
  staggerContainer,
  fastStaggerContainer,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  overlayVariants,
  modalVariants,
  drawerVariants,
  slideUpVariants,
  listItemVariants,
  cardVariants,
  xpPopVariants,
  celebrationVariants,
  pulseVariants,
  glowVariants,
  streakFlameVariants,
  progressFillVariants,
  countUpVariants,
  notificationVariants,
  toastVariants,
  draggableVariants,
  dropZoneVariants,
};

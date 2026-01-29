/**
 * Agent Lounge Design System
 *
 * This file contains all design tokens for the Agent Lounge.
 * Use these constants instead of hardcoding values to ensure consistency.
 *
 * Design Philosophy:
 * - Calm, warm aesthetic matching the main Heritage website
 * - Minimal visual noise, lots of breathing room
 * - Muted colors, subtle shadows
 * - Clear typography hierarchy
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Backgrounds
  bg: {
    page: 'bg-[#fffaf3]',           // Main page background (warm cream)
    card: 'bg-white',                // Card backgrounds
    muted: 'bg-[#f5f0e8]',          // Muted sections, hover states
    hover: 'bg-[#f5f0e8]',          // Hover state for interactive elements
    active: 'bg-[#f5f0e8]',         // Active/selected state
    overlay: 'bg-black/30',          // Modal overlays
  },

  // Borders
  border: {
    default: 'border-[#e8e0d5]',    // Standard card/section borders
    subtle: 'border-gray-100',       // Very subtle dividers
    focus: 'border-gray-400',        // Focus states
  },

  // Text
  text: {
    primary: 'text-gray-900',        // Headlines, important text
    secondary: 'text-gray-600',      // Body text, descriptions
    muted: 'text-gray-500',          // Labels, captions
    subtle: 'text-gray-400',         // Timestamps, less important
    inverse: 'text-white',           // Text on dark backgrounds
  },

  // Icons
  icon: {
    default: 'text-gray-600',        // Standard icon color
    muted: 'text-gray-400',          // Less prominent icons
    active: 'text-gray-900',         // Active/selected icons
  },

  // Status colors (muted versions)
  status: {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    neutral: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    },
  },

  // Lead/Pipeline status (specific to agent workflow)
  leadStatus: {
    new: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    contacted: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    qualified: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
    },
    proposal: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    closed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      dot: 'bg-green-500',
    },
    lost: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      dot: 'bg-gray-400',
    },
  },

  // Accent (use sparingly - CTAs only)
  accent: {
    primary: 'bg-gray-900',          // Primary buttons
    primaryHover: 'hover:bg-gray-800',
    primaryText: 'text-white',
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Page titles
  pageTitle: 'text-3xl font-bold text-gray-900',

  // Section headers
  sectionTitle: 'text-xl font-semibold text-gray-900',

  // Card titles
  cardTitle: 'text-lg font-semibold text-gray-900',

  // Subsection headers
  subsectionTitle: 'text-base font-medium text-gray-900',

  // Labels
  label: 'text-sm font-medium text-gray-700',

  // Body text
  body: 'text-sm text-gray-600',

  // Small text (captions, timestamps)
  caption: 'text-xs text-gray-500',

  // Stats/Numbers
  statValue: 'text-3xl font-bold text-gray-900',
  statLabel: 'text-sm text-gray-500',

  // Links
  link: 'text-gray-900 hover:text-gray-700 font-medium',
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  // Page layout
  pageWrapper: 'space-y-8 pb-20 lg:pb-0',

  // Section spacing
  sectionGap: 'space-y-6',

  // Card internals
  cardPadding: 'p-6',
  cardPaddingCompact: 'p-4',

  // Grid gaps
  gridGap: 'gap-6',
  gridGapCompact: 'gap-4',

  // Between items in a list
  listGap: 'space-y-3',
  listGapCompact: 'space-y-2',
} as const;

// =============================================================================
// COMPONENTS
// =============================================================================

export const components = {
  // Cards
  card: `bg-white border border-[#e8e0d5] rounded-xl`,
  cardHover: `hover:shadow-sm transition-shadow`,
  cardInteractive: `bg-white border border-[#e8e0d5] rounded-xl hover:shadow-sm transition-shadow cursor-pointer`,

  // Icon containers (the circle/rounded square behind icons)
  iconContainer: 'w-10 h-10 bg-[#f5f0e8] rounded-xl flex items-center justify-center',
  iconContainerSmall: 'w-8 h-8 bg-[#f5f0e8] rounded-lg flex items-center justify-center',

  // Badges
  badge: 'text-xs px-2 py-1 rounded-full',
  badgeOutline: 'text-xs px-2 py-1 rounded-full border bg-transparent',

  // Buttons
  buttonPrimary: 'bg-gray-900 hover:bg-gray-800 text-white',
  buttonSecondary: 'bg-[#f5f0e8] hover:bg-[#e8e0d5] text-gray-900',
  buttonOutline: 'border border-[#e8e0d5] hover:bg-[#f5f0e8] text-gray-700',
  buttonGhost: 'hover:bg-[#f5f0e8] text-gray-600 hover:text-gray-900',

  // Inputs
  input: 'border-[#e8e0d5] focus:border-gray-400 focus:ring-0',

  // Avatar
  avatar: 'bg-gray-900 text-white font-medium',
  avatarMuted: 'bg-gray-200 text-gray-700 font-medium',

  // Dividers
  divider: 'border-[#e8e0d5]',

  // Navigation
  navItem: 'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
  navItemActive: 'bg-[#f5f0e8] text-gray-900',
  navItemInactive: 'text-gray-600 hover:bg-[#f5f0e8] hover:text-gray-900',
} as const;

// =============================================================================
// ANIMATIONS
// =============================================================================

export const animations = {
  // Fade in up (for page content)
  fadeIn: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },

  // Stagger children
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  },

  // Slide in from side (for drawers/modals)
  slideIn: {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  },

  // Scale (for modals)
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get lead status styling
 */
export function getLeadStatusStyle(status: keyof typeof colors.leadStatus) {
  return colors.leadStatus[status] || colors.leadStatus.new;
}

/**
 * Combine multiple class strings
 */
export function cx(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// LEAD STATUS CONFIG (for use in components)
// =============================================================================

export const leadStatusConfig = {
  new: {
    label: 'New',
    ...colors.leadStatus.new,
  },
  contacted: {
    label: 'Contacted',
    ...colors.leadStatus.contacted,
  },
  qualified: {
    label: 'Qualified',
    ...colors.leadStatus.qualified,
  },
  proposal: {
    label: 'Proposal',
    ...colors.leadStatus.proposal,
  },
  closed: {
    label: 'Closed',
    ...colors.leadStatus.closed,
  },
  lost: {
    label: 'Lost',
    ...colors.leadStatus.lost,
  },
} as const;

// =============================================================================
// SIDEBAR NAV ITEMS (simplified structure)
// =============================================================================

export const sidebarNavItems = [
  { icon: 'Home', label: 'Dashboard', href: '/agents/lounge' },
  { icon: 'Users', label: 'Leads', href: '/agents/leads' },
  { icon: 'BarChart3', label: 'Pipeline', href: '/agents/pipeline' },
  { icon: 'DollarSign', label: 'Earnings', href: '/agents/earnings' },
  { icon: 'GraduationCap', label: 'Training', href: '/agents/training' },
  { icon: 'MessageSquare', label: 'Chat', href: '/agents/chat' },
] as const;

export const sidebarBottomItems = [
  { icon: 'Settings', label: 'Settings', href: '/agents/settings' },
] as const;

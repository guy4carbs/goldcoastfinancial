/**
 * HERITAGE COMMAND CENTER - Design Guidelines
 *
 * These guidelines ensure visual consistency and quality.
 * Follow them strictly - deviations weaken the product.
 */

// =============================================================================
// CORE PRINCIPLES
// =============================================================================

export const principles = {
  /**
   * DARKNESS AS LUXURY
   *
   * Light is earned, not given. Dark backgrounds signal sophistication.
   * Use brightness strategically to draw attention.
   *
   * DO:
   * - Start with the darkest reasonable background
   * - Use elevation (lighter surfaces) to show hierarchy
   * - Reserve white for primary text and critical actions
   *
   * DON'T:
   * - Use pure white backgrounds
   * - Make everything equally bright
   * - Use light mode
   */
  darknessAsLuxury: true,

  /**
   * MOTION AS INTELLIGENCE
   *
   * Animation signals computation and responsiveness.
   * Still = dead. Subtle motion = alive.
   *
   * DO:
   * - Use ambient animations to show system is active
   * - Animate state changes meaningfully
   * - Use spring physics for interactive elements
   *
   * DON'T:
   * - Use linear easing (except progress bars)
   * - Animate gratuitously
   * - Use bouncy animations for serious UI
   */
  motionAsIntelligence: true,

  /**
   * COLOR AS RANK
   *
   * Each advisor has a signature color. This creates identity.
   * Functional colors (success, error) are universal.
   *
   * DO:
   * - Use signature colors consistently per advisor
   * - Use functional colors for status only
   * - Desaturate inactive elements
   *
   * DON'T:
   * - Mix signature colors arbitrarily
   * - Use bright colors for decoration
   * - Use color without purpose
   */
  colorAsRank: true,

  /**
   * SPACE AS CONFIDENCE
   *
   * Generous spacing signals authority and clarity.
   * Cramped layouts feel cheap.
   *
   * DO:
   * - Use spacing scale consistently
   * - Give elements room to breathe
   * - Use whitespace to create hierarchy
   *
   * DON'T:
   * - Cram content together
   * - Use arbitrary spacing values
   * - Fill every pixel
   */
  spaceAsConfidence: true,
} as const;

// =============================================================================
// TYPOGRAPHY GUIDELINES
// =============================================================================

export const typographyGuidelines = {
  /**
   * FONT USAGE
   */
  fonts: {
    sans: {
      use: [
        "Headlines and titles",
        "Body text and descriptions",
        "Button labels",
        "Navigation items",
      ],
      avoid: [
        "Technical data",
        "Status indicators",
        "Timestamps",
        "Metrics",
      ],
    },
    mono: {
      use: [
        "Status badges (CONNECTED, STREAMING)",
        "Data values (tokens, duration)",
        "Technical labels",
        "Keyboard shortcuts",
        "Section dividers",
      ],
      avoid: [
        "Body paragraphs",
        "Headlines",
        "Conversational text",
      ],
    },
  },

  /**
   * HIERARCHY RULES
   *
   * Maximum 3 levels of visual hierarchy per view.
   * More than 3 creates confusion.
   */
  hierarchy: {
    primary: {
      description: "Most important element - usually 1 per view",
      style: "Large, white, sans-serif",
      examples: ["Page title", "Key question", "Primary action"],
    },
    secondary: {
      description: "Supporting information",
      style: "Medium, gray-200, sans-serif",
      examples: ["Section headers", "Card titles", "Advisor names"],
    },
    tertiary: {
      description: "Details and metadata",
      style: "Small, gray-400/500, often mono",
      examples: ["Timestamps", "Status text", "Captions"],
    },
  },

  /**
   * CAPITALIZATION
   */
  capitalization: {
    // Always uppercase
    uppercase: [
      "Status badges (CONNECTED, STANDBY)",
      "Section labels (YOUR QUERY, COUNSEL)",
      "Mono labels",
      "Button micro-text",
    ],
    // Sentence case
    sentenceCase: [
      "Headlines",
      "Body text",
      "Descriptions",
      "Error messages",
    ],
    // Title case
    titleCase: [
      "Advisor names",
      "Navigation items",
      "Feature names",
    ],
  },

  /**
   * LETTER SPACING
   */
  letterSpacing: {
    tight: "Headlines (large text)",
    normal: "Body text, UI labels",
    wide: "Button text",
    widest: "Mono labels, status badges",
  },
} as const;

// =============================================================================
// COLOR GUIDELINES
// =============================================================================

export const colorGuidelines = {
  /**
   * BACKGROUND USAGE
   */
  backgrounds: {
    void: {
      use: "Modal backdrops, deepest overlays",
      zIndex: "Highest (40+)",
    },
    base: {
      use: "Primary page background",
      zIndex: "Base (0)",
    },
    elevated: {
      use: "Cards, panels, secondary surfaces",
      zIndex: "Above base",
    },
    surface: {
      use: "Interactive elements - inputs, buttons",
      zIndex: "Interactive layer",
    },
    raised: {
      use: "Hover states, selected items",
      zIndex: "Temporary states",
    },
  },

  /**
   * TEXT COLOR USAGE
   */
  text: {
    primary: {
      use: ["Headlines", "Active states", "Critical info"],
      contrast: "Maximum - use sparingly",
    },
    secondary: {
      use: ["Body text", "Descriptions", "Most content"],
      contrast: "High - primary reading color",
    },
    tertiary: {
      use: ["Labels", "Captions", "Secondary info"],
      contrast: "Medium",
    },
    muted: {
      use: ["Placeholders", "Disabled states", "Hints"],
      contrast: "Low",
    },
    ghost: {
      use: ["Decorative text", "Background labels"],
      contrast: "Minimal - barely visible",
    },
  },

  /**
   * SIGNATURE COLOR RULES
   */
  signatures: {
    // Each advisor gets ONE signature color
    assignment: `
      Each advisor is assigned a signature color at creation.
      This color follows them everywhere:
      - Portrait border/glow
      - Response accent line
      - Status indicators
      - Selection highlights
    `,

    // Usage intensity
    intensity: {
      primary: "Accent lines, active indicators, glows",
      muted: "Borders, secondary accents",
      subtle: "Backgrounds (10% opacity)",
      glow: "Box shadows, halos",
    },

    // Never do
    forbidden: [
      "Mix multiple signature colors in one element",
      "Use signature colors for non-advisor elements",
      "Create gradients between different signatures",
      "Use signature colors for status (use status colors)",
    ],
  },

  /**
   * STATUS COLOR RULES
   */
  status: {
    success: {
      meaning: "Connected, complete, approved",
      color: "emerald",
    },
    warning: {
      meaning: "Processing, caution, attention needed",
      color: "amber",
    },
    error: {
      meaning: "Disconnected, failed, blocked",
      color: "red",
    },
    info: {
      meaning: "Neutral information, hints",
      color: "cyan",
    },
  },
} as const;

// =============================================================================
// MOTION GUIDELINES
// =============================================================================

export const motionGuidelines = {
  /**
   * DURATION RULES
   */
  duration: {
    fast: {
      use: ["Hover states", "Button press", "Toggles"],
      ms: "100-150ms",
      feel: "Instant, responsive",
    },
    normal: {
      use: ["State changes", "Transitions", "Fades"],
      ms: "200-300ms",
      feel: "Smooth, natural",
    },
    slow: {
      use: ["Page transitions", "Complex reveals"],
      ms: "400-600ms",
      feel: "Deliberate, dramatic",
    },
    deliberate: {
      use: ["Arrival sequences", "Cinematic reveals"],
      ms: "800-1200ms",
      feel: "Theatrical, weighted",
    },
  },

  /**
   * EASING RULES
   */
  easing: {
    entrances: "ease-out (fast start, slow end)",
    exits: "ease-in (slow start, fast end)",
    stateChanges: "ease-in-out (symmetrical)",
    interactive: "snap (quick, satisfying)",
    dramatic: "dramatic curve (slow start, fast middle)",
  },

  /**
   * AMBIENT ANIMATION RULES
   */
  ambient: {
    purpose: "Show the system is alive and responsive",
    types: {
      breathe: {
        property: "opacity",
        range: "0.5 - 1",
        duration: "3s",
        use: "Status indicators, active elements",
      },
      pulse: {
        property: "scale",
        range: "1 - 1.05",
        duration: "2s",
        use: "Speaking indicators, highlights",
      },
      float: {
        property: "translateY",
        range: "0 - -4px",
        duration: "4s",
        use: "Idle elements, decorative",
      },
      glow: {
        property: "box-shadow",
        range: "8px - 20px blur",
        duration: "3s",
        use: "Active advisors, selected items",
      },
    },
    rules: [
      "Never animate more than 2-3 elements simultaneously",
      "Use staggered delays to create rhythm",
      "Ensure animations are subtle, not distracting",
      "Always respect prefers-reduced-motion",
    ],
  },

  /**
   * FORBIDDEN MOTIONS
   */
  forbidden: [
    "Linear easing for UI (except progress bars)",
    "Bouncy animations in serious contexts",
    "Animations longer than 1.5s for common actions",
    "Simultaneous animations on 5+ elements",
    "Animations that block user interaction",
  ],
} as const;

// =============================================================================
// ELEVATION GUIDELINES
// =============================================================================

export const elevationGuidelines = {
  /**
   * DEPTH CREATION
   *
   * Depth is created through:
   * 1. Background color (darker = lower, lighter = higher)
   * 2. Borders (subtle borders add perceived depth)
   * 3. Shadows (used sparingly for floating elements)
   * 4. Z-index (for overlapping elements)
   */
  layers: {
    1: {
      name: "Base",
      background: "bg-base (#08080c)",
      use: "Page backgrounds",
    },
    2: {
      name: "Elevated",
      background: "bg-elevated (#0d0d12)",
      use: "Cards, panels",
    },
    3: {
      name: "Surface",
      background: "bg-surface (#12121a)",
      use: "Interactive elements",
    },
    4: {
      name: "Raised",
      background: "bg-raised (#1a1a24)",
      use: "Hover states, dropdowns",
    },
    5: {
      name: "Floating",
      background: "bg-surface + shadow-lg",
      use: "Modals, popovers",
    },
  },

  /**
   * SHADOW USAGE
   */
  shadows: {
    none: "Default for most elements",
    sm: "Subtle depth for cards",
    md: "Dropdowns, tooltips",
    lg: "Modals, overlays",
    xl: "Hero elements, dramatic",
  },

  /**
   * GLOW USAGE
   */
  glows: {
    purpose: "Highlight active/selected elements with signature color",
    sizes: {
      sm: "Subtle highlight (8px blur)",
      md: "Moderate emphasis (16px blur)",
      lg: "Strong emphasis (32px blur)",
    },
    rules: [
      "Only use with signature colors",
      "Reserve for active/selected states",
      "Animate glow for speaking/streaming states",
      "Don't use multiple glows on one element",
    ],
  },
} as const;

// =============================================================================
// COMPONENT PATTERNS
// =============================================================================

export const componentPatterns = {
  /**
   * CARDS
   */
  card: {
    structure: `
      <div class="card">
        <div class="card-accent-line" /> <!-- 2px colored line at top -->
        <div class="card-header" />
        <div class="card-content" />
        <div class="card-footer" /> <!-- optional -->
      </div>
    `,
    rules: [
      "Always include accent line for advisor cards",
      "Use consistent padding (space-4 default)",
      "Border-radius: radius-lg (12px)",
      "Border: subtle by default, default on hover",
    ],
  },

  /**
   * BUTTONS
   */
  button: {
    variants: {
      primary: {
        use: "Single primary action per view",
        style: "White bg, dark text, prominent",
      },
      secondary: {
        use: "Secondary actions",
        style: "Surface bg, subtle border",
      },
      ghost: {
        use: "Tertiary actions, icon buttons",
        style: "Transparent, visible on hover",
      },
      destructive: {
        use: "Dangerous actions (delete, disconnect)",
        style: "Red tinted, requires confirmation",
      },
    },
    rules: [
      "Only ONE primary button per view",
      "Always include hover/active states",
      "Use icons sparingly, only when they add meaning",
      "Disabled state: 30% opacity, no cursor",
    ],
  },

  /**
   * INPUTS
   */
  input: {
    structure: `
      <div class="input-wrapper">
        <label class="input-label" /> <!-- mono, uppercase, small -->
        <div class="input-container">
          <input class="input" />
          <button class="input-action" /> <!-- optional, e.g. send button -->
        </div>
        <span class="input-hint" /> <!-- optional -->
      </div>
    `,
    rules: [
      "Always use dark backgrounds (bg-surface)",
      "Border transitions on focus",
      "Placeholder text: muted color",
      "Error state: red border + message below",
    ],
  },

  /**
   * STATUS INDICATORS
   */
  status: {
    structure: `
      <div class="status-badge">
        <span class="status-dot" /> <!-- animated for active states -->
        <span class="status-label" /> <!-- mono, uppercase -->
      </div>
    `,
    states: {
      connected: { dot: "emerald", animation: "breathe" },
      streaming: { dot: "emerald", animation: "pulse" },
      processing: { dot: "amber", animation: "pulse" },
      standby: { dot: "gray", animation: "none" },
      disconnected: { dot: "red", animation: "none" },
    },
  },

  /**
   * ADVISOR PRESENCE
   */
  advisor: {
    structure: `
      <div class="advisor-figure">
        <div class="advisor-portrait">
          <img /> or <icon-placeholder />
          <div class="advisor-accent-line" />
        </div>
        <div class="advisor-info">
          <span class="advisor-name" />
          <div class="advisor-status" />
        </div>
      </div>
    `,
    rules: [
      "Portrait aspect ratio: roughly 3:4 (vertical)",
      "Always show status indicator",
      "Desaturate inactive advisors",
      "Signature color on accent line and glow",
    ],
  },
} as const;

// =============================================================================
// ANTI-PATTERNS
// =============================================================================

export const antiPatterns = {
  /**
   * THINGS THAT WEAKEN THE PRODUCT
   *
   * If you find yourself doing any of these, stop and reconsider.
   */
  visual: [
    "Using pure white (#FFFFFF) backgrounds",
    "Using bright colors without purpose",
    "Mixing multiple signature colors",
    "Cluttered layouts with no breathing room",
    "Inconsistent border radii",
    "Drop shadows on everything",
    "Gradients for decoration",
  ],

  typography: [
    "More than 3 font sizes per view",
    "Using sans-serif for status text",
    "Using mono for body paragraphs",
    "Inconsistent capitalization",
    "Text smaller than 10px",
    "Centered body text",
  ],

  motion: [
    "Linear easing on UI elements",
    "Bouncy animations in serious contexts",
    "Animations blocking interaction",
    "Too many simultaneous animations",
    "Ignoring prefers-reduced-motion",
    "Animations longer than 2s for common actions",
  ],

  interaction: [
    "Actions without feedback",
    "No loading states",
    "Missing error states",
    "Unclear disabled states",
    "No keyboard navigation",
    "Tiny click targets",
  ],

  content: [
    "Casual language where formal is expected",
    "Emoji in serious contexts",
    "Exclamation marks in UI copy",
    "Unnecessary words",
    "Inconsistent terminology",
  ],
} as const;

// =============================================================================
// EXPORT
// =============================================================================

export const designGuidelines = {
  principles,
  typographyGuidelines,
  colorGuidelines,
  motionGuidelines,
  elevationGuidelines,
  componentPatterns,
  antiPatterns,
} as const;

export default designGuidelines;

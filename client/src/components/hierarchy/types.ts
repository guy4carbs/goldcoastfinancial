/**
 * Shared Hierarchy Types
 * Used across Agent, Manager, and Executive hierarchy pages
 */

export interface HierarchyMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  level: number;
  title: string;
  contractLevel: number | null;
  ytdCommission: number;
  policiesSold: number;
  teamSize: number;
  conversionRate: number;
  avatarUrl: string | null;
  depth?: number;
  directUplineId?: string;
}

export interface HierarchyTheme {
  name: 'violet' | 'emerald' | 'orange';
  colors: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
  };
  strokeColor: string;
  youGlow: string;
  youBadgeGradient: string;
  youBadgeShadow: string;
  /** Color token for the secondary stats column (e.g., policies) */
  statAccent50: string;
  statAccentIcon: string;
}

export interface HierarchyNodeData extends Record<string, unknown> {
  member: HierarchyMember;
  isYou: boolean;
  theme: HierarchyTheme;
  parentContractLevel: number | null;
}

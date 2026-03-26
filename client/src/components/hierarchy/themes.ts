/**
 * Theme configs for each hierarchy page
 */
import { COLORS, SHADOW } from '@/lib/heritageDesignSystem';
import type { HierarchyTheme } from './types';

const EMERALD = {
  50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
  400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
};

const ORANGE = {
  50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
  400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
};

export const VIOLET_THEME: HierarchyTheme = {
  name: 'violet',
  colors: COLORS.primary.violet as unknown as HierarchyTheme['colors'],
  strokeColor: COLORS.primary.violet[300],
  youGlow: `0 0 40px ${COLORS.primary.violet[500]}30, 0 0 20px ${COLORS.primary.violet[500]}15`,
  youBadgeGradient: `linear-gradient(135deg, ${COLORS.primary.violet[600]} 0%, ${COLORS.primary.violet[500]} 50%, ${COLORS.accent.amber[500]} 100%)`,
  youBadgeShadow: `0 4px 16px ${COLORS.accent.amber[500]}40, 0 2px 8px ${COLORS.primary.violet[500]}30`,
  statAccent50: COLORS.primary.violet[50],
  statAccentIcon: COLORS.primary.violet[500],
};

export const EMERALD_THEME: HierarchyTheme = {
  name: 'emerald',
  colors: EMERALD,
  strokeColor: EMERALD[300],
  youGlow: `0 0 40px ${EMERALD[500]}30, 0 0 20px ${EMERALD[500]}15`,
  youBadgeGradient: `linear-gradient(135deg, ${EMERALD[600]} 0%, ${EMERALD[500]} 50%, ${COLORS.accent.amber[500]} 100%)`,
  youBadgeShadow: `0 4px 16px ${COLORS.accent.amber[500]}40, 0 2px 8px ${EMERALD[500]}30`,
  statAccent50: EMERALD[50],
  statAccentIcon: EMERALD[500],
};

export const ORANGE_THEME: HierarchyTheme = {
  name: 'orange',
  colors: ORANGE,
  strokeColor: ORANGE[300],
  youGlow: `0 0 40px ${ORANGE[500]}30, 0 0 20px ${ORANGE[500]}15`,
  youBadgeGradient: `linear-gradient(135deg, ${ORANGE[600]} 0%, ${ORANGE[500]} 50%, ${COLORS.accent.amber[500]} 100%)`,
  youBadgeShadow: `0 4px 16px ${COLORS.accent.amber[500]}40, 0 2px 8px ${ORANGE[500]}30`,
  statAccent50: ORANGE[50],
  statAccentIcon: ORANGE[500],
};

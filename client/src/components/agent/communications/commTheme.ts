/**
 * Communication Components — Color Scheme Configuration
 * Supports violet (Agent Lounge) and emerald (Manager Lounge) themes.
 *
 * All class names are static strings so Tailwind can detect them at build time.
 */

export type CommColorScheme = 'violet' | 'emerald';

export interface CommTheme {
  // Compose / action buttons
  composeBtnBg: string;
  composeBtnIcon: string;

  // Folder / sidebar active state
  activeBg: string;
  activeIcon: string;

  // Unread / notification badges
  unreadBadge: string;

  // Selected email / room gradient
  selectedGradient: string;

  // Unread item background
  unreadBg: string;
  unreadHover: string;

  // Heading accent
  heading: string;

  // Send button gradient
  sendBtn: string;

  // Avatar gradients
  avatarOnline: string;
  avatarOffline: string;

  // Icon / text accent
  accent500: string;
  accent600: string;
  accent700: string;

  // Hover backgrounds
  hoverBg50: string;
  hoverBg200: string;

  // Background fills
  bg50: string;
  bg100: string;
  bg200: string;

  // Focus rings
  focusRing100: string;
  focusRing200: string;

  // Ring accent (selection indicators)
  ring500: string;

  // Border accent
  border200: string;
  borderAccent: string;

  // Selected message gradient (chat)
  selectedMsgGradient: string;

  // Online dot border when selected
  onlineDotBorder: string;

  // Accent background fill (bars, active pills)
  accentBg: string;
}

const VIOLET_THEME: CommTheme = {
  composeBtnBg: 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-700 hover:text-violet-800',
  composeBtnIcon: 'text-amber-500',
  activeBg: 'bg-violet-100 text-violet-700',
  activeIcon: 'text-violet-600',
  unreadBadge: 'bg-violet-600 text-white',
  selectedGradient: 'bg-gradient-to-b from-violet-500 via-purple-500 to-amber-400 text-white shadow-lg [&_*]:text-white [&_.text-gray-500]:text-white/70 [&_.text-gray-400]:text-white/60 [&_.text-gray-300]:text-white/50',
  unreadBg: 'bg-violet-50/50',
  unreadHover: 'hover:bg-violet-50',
  heading: 'text-violet-700',
  sendBtn: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90',
  avatarOnline: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white',
  avatarOffline: 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600',
  accent500: 'text-violet-500',
  accent600: 'text-violet-600',
  accent700: 'text-violet-700',
  hoverBg50: 'hover:bg-violet-50',
  hoverBg200: 'hover:bg-violet-200',
  bg50: 'bg-violet-50',
  bg100: 'bg-violet-100',
  bg200: 'bg-violet-200',
  focusRing100: 'focus:ring-violet-100',
  focusRing200: 'focus:ring-violet-200',
  ring500: 'ring-violet-500',
  border200: 'border-violet-200',
  borderAccent: 'border-purple-500',
  selectedMsgGradient: 'bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600 text-white',
  onlineDotBorder: 'border-purple-500',
  accentBg: 'bg-violet-500',
};

const EMERALD_THEME: CommTheme = {
  composeBtnBg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800',
  composeBtnIcon: 'text-amber-500',
  activeBg: 'bg-emerald-100 text-emerald-700',
  activeIcon: 'text-emerald-600',
  unreadBadge: 'bg-emerald-600 text-white',
  selectedGradient: 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-lg [&_*]:text-white [&_.text-gray-500]:text-white/70 [&_.text-gray-400]:text-white/60 [&_.text-gray-300]:text-white/50',
  unreadBg: 'bg-emerald-50/50',
  unreadHover: 'hover:bg-emerald-50',
  heading: 'text-emerald-700',
  sendBtn: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90',
  avatarOnline: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
  avatarOffline: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600',
  accent500: 'text-emerald-500',
  accent600: 'text-emerald-600',
  accent700: 'text-emerald-700',
  hoverBg50: 'hover:bg-emerald-50',
  hoverBg200: 'hover:bg-emerald-200',
  bg50: 'bg-emerald-50',
  bg100: 'bg-emerald-100',
  bg200: 'bg-emerald-200',
  focusRing100: 'focus:ring-emerald-100',
  focusRing200: 'focus:ring-emerald-200',
  ring500: 'ring-emerald-500',
  border200: 'border-emerald-200',
  borderAccent: 'border-emerald-500',
  selectedMsgGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white',
  onlineDotBorder: 'border-emerald-500',
  accentBg: 'bg-emerald-500',
};

export function getCommTheme(scheme: CommColorScheme = 'violet'): CommTheme {
  return scheme === 'emerald' ? EMERALD_THEME : VIOLET_THEME;
}

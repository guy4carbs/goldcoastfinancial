/**
 * Canonical lounge key mapping — single source of truth
 * DB keys ↔ frontend IDs ↔ display names ↔ paths
 */

export const LOUNGE_MAP = {
  agent_portal:      { id: 'agent',      name: 'Agent Lounge',     path: '/agents/dashboard' },
  crm_lounge:        { id: 'crm',        name: 'Lobby',            path: '/crm' },
  ai_lounge:         { id: 'ai',         name: 'AI Lounge',        path: '/ai/dashboard' },
  finance_lounge:    { id: 'finance',    name: 'Finance Lounge',   path: '/finance/dashboard' },
  marketing_lounge:  { id: 'marketing',  name: 'Marketing Lounge', path: '/marketing/dashboard' },
  support_lounge:    { id: 'support',    name: 'Support Lounge',   path: '/support/dashboard' },
  manager_lounge:    { id: 'manager',    name: 'Manager Lounge',   path: '/manager/dashboard' },
  executive_lounge:  { id: 'executive',  name: 'Executive Lounge', path: '/executive/dashboard' },
  admin_panel:       { id: 'admin',      name: 'Admin Lounge',     path: '/admin' },
  investor_lounge:   { id: 'investor',   name: 'Investor Lounge',  path: '/investor/dashboard' },
  client_lounge:     { id: 'client',     name: 'Client Lounge',    path: '/client/dashboard' },
  onboarding_lounge: { id: 'onboarding', name: 'Onboarding',       path: '/onboarding' },
} as const;

export type LoungeDbKey = keyof typeof LOUNGE_MAP;
export type LoungeFrontendId = typeof LOUNGE_MAP[LoungeDbKey]['id'];

/** Reverse lookup: frontend ID → DB key */
export const ID_TO_LOUNGE_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(LOUNGE_MAP).map(([dbKey, v]) => [v.id, dbKey])
);

/** Forward lookup: DB key → display name */
export const LOUNGE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(LOUNGE_MAP).map(([dbKey, v]) => [dbKey, v.name])
);

/** Forward lookup: DB key → frontend path */
export const LOUNGE_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(LOUNGE_MAP).map(([dbKey, v]) => [dbKey, v.path])
);

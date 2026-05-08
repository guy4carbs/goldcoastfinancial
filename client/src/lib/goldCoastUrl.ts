/**
 * Gold Coast cross-app jump URL.
 *
 * Heritage is a sibling product to the Gold Coast platform. Founders go to
 * the Founders Lounge; everyone else (agent, manager, director, owner,
 * system_admin) lands in the HCMS, which Gold Coast then role-routes
 * internally.
 *
 * Override the host at build time via VITE_GOLDCOAST_URL.
 */

export const GOLD_COAST_BASE_URL =
  import.meta.env.VITE_GOLDCOAST_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://goldcoastfinancial.co');

export function goldCoastUrlForRole(role: string | undefined | null): string {
  if (role === 'founder') return `${GOLD_COAST_BASE_URL}/founders`;
  // owner, system_admin, director, agency_manager (manager), sales_agent →
  // /hcms; Gold Coast handles per-role routing inside HCMS (sales_agent gets
  // redirected to /hcms/my/dashboard, admins see the admin view, etc.).
  return `${GOLD_COAST_BASE_URL}/hcms`;
}

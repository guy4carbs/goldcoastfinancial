/**
 * Role tier groupings for lounge access in Heritage.
 *
 * Mirrors the server-side pattern in `server/middleware/auth.ts` on Gold
 * Coast (FOUNDERS_ONLY / ADMIN_PLUS / DIRECTOR_PLUS / MANAGER_PLUS) so the
 * two apps think about access in the same shape. Each lounge in
 * LobbyLanding / LobbyLayout / LoungeSwitcher uses one of these arrays as
 * its `requiredRoles` value instead of restating the role list inline —
 * fewer places to drift, one canonical definition.
 *
 * Tier semantics:
 *   - FOUNDERS_ONLY:     strictly the founder role. Gold Coast Founders
 *                        Lounge is the only thing gated this tight; matches
 *                        the gcf server-side FOUNDERS_ONLY = [FOUNDER].
 *   - ADMIN_PLUS:        founder + owner + system_admin. The "top tier" who
 *                        can see admin tooling, KPI dashboards, AI controls,
 *                        anything that exposes the whole agency's state.
 *   - DIRECTOR_PLUS:     ADMIN_PLUS + director. Multi-team oversight.
 *   - MANAGER_PLUS:      DIRECTOR_PLUS + agency_manager + manager (legacy).
 *                        Team-level visibility, manager workflows.
 *   - ALL_AUTHENTICATED: any signed-in role including sales_agent, client,
 *                        investor, marketing_staff. Used for the lobby
 *                        itself and the universal Agent Lounge.
 *
 * Some lounges add a domain-specific role on top of a tier (e.g., Finance
 * is ADMIN_PLUS + investor because investors need to see commissions). Build
 * those by spreading the tier:
 *
 *   requiredRoles: [...ADMIN_PLUS, "investor"]
 */

export const FOUNDERS_ONLY = ["founder"] as const;

export const ADMIN_PLUS = ["founder", "owner", "system_admin"] as const;

export const DIRECTOR_PLUS = [...ADMIN_PLUS, "director"] as const;

export const MANAGER_PLUS = [...DIRECTOR_PLUS, "agency_manager", "manager"] as const;

export const ALL_AUTHENTICATED = [
  ...MANAGER_PLUS,
  "sales_agent",
  "client",
  "investor",
  "marketing_staff",
] as const;

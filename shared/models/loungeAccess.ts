/**
 * Lounge access model — single source of truth for which lounges each role
 * unlocks. Mirrors heritage-app's `RoleGroups` + the static map in
 * heritage-app's `storage.reinitializeLoungeAccess()` so when a role mutation
 * fires on goldcoast, it propagates the SAME grants heritage-app would have
 * created had the mutation happened there.
 *
 * Lounges align with heritage-app's `user_lounge_access.lounge_key` enum.
 * Adding a new lounge or role here is the only edit required.
 *
 * Wave Z10 locked role × lounge matrix (heritage = 11 lounges; marketing +
 * investor moved to goldcoast-only):
 *   founder/owner          → all 11 heritage lounges
 *   system_admin           → admin + ai + support + crm + onboarding (Z5: admin bundle)
 *   director               → agent + manager + director + crm + onboarding
 *   agency_manager/manager → agent + manager + crm + onboarding
 *   sales_agent            → agent + crm + onboarding
 *   marketing_staff        → none on heritage (marketing surface = goldcoast only)
 *   investor               → none on heritage (investor surface = goldcoast only)
 *   client                 → client_lounge
 *
 * Wave Z auto-bundle: any role with at least one heritage lounge
 * automatically includes AUTO_LOUNGES (crm_lounge + onboarding_lounge). The
 * per-user toggle UI hides these columns; they're operational glue, not
 * meaningful per-user override targets.
 */

// Wave Z10: marketing_lounge + investor_lounge dropped from heritage. Those
// surfaces now live exclusively on goldcoast (GC_SURFACES.marketing,
// GC_SURFACES.investor_portal — gated by role at the Express layer).
export const LOUNGE_KEYS = [
  "agent_portal",
  "manager_lounge",
  "director_lounge",
  "executive_lounge",
  "crm_lounge",
  "ai_lounge",
  "admin_panel",
  "client_lounge",
  "onboarding_lounge",
  "finance_lounge",
  "support_lounge",
] as const;

export type LoungeKey = (typeof LOUNGE_KEYS)[number];

const ALL_LOUNGES: LoungeKey[] = [...LOUNGE_KEYS];

export const ROLE_TO_LOUNGES: Record<string, LoungeKey[]> = {
  founder: ALL_LOUNGES,
  owner: ALL_LOUNGES,
  system_admin: ["admin_panel", "ai_lounge", "support_lounge", "crm_lounge", "onboarding_lounge"], // Wave Z5: admin bundle includes AI + Support
  director: ["agent_portal", "manager_lounge", "director_lounge", "crm_lounge", "onboarding_lounge"],
  agency_manager: ["agent_portal", "manager_lounge", "crm_lounge", "onboarding_lounge"],
  manager: ["agent_portal", "manager_lounge", "crm_lounge", "onboarding_lounge"], // legacy alias
  sales_agent: ["agent_portal", "crm_lounge", "onboarding_lounge"],
  marketing_staff: [],
  investor: [],
  client: ["client_lounge"],
};

export function loungesForRole(role: string): LoungeKey[] {
  return ROLE_TO_LOUNGES[role] || [];
}

// =============================================================================
// AUTO-BUNDLED LOUNGES (Wave Z)
// =============================================================================
// These lounges are operational infrastructure — granted automatically to
// every user who has ANY other heritage lounge. They never appear as toggles
// in the founders Access matrix because they're not a meaningful per-user
// override target.
//
// Founder directive 2026-05-06: "everyone with heritage automatically has CRM"
// + onboarding-state visibility for any active heritage user.
export const AUTO_LOUNGES: LoungeKey[] = ["crm_lounge", "onboarding_lounge"];

// =============================================================================
// TIER CASCADE LADDER (Wave Z)
// =============================================================================
// Operational tiers nest: Manager implies Agent, Director implies Manager+Agent,
// Executive implies the whole ladder. Order: low → high.
//
// Used by the per-user toggle matrix's cascade logic:
//   - Granting tier N also grants tiers 0..N-1
//   - Revoking tier N also revokes tiers N+1..end (since higher tiers depend
//     on lower ones — a Manager-without-Agent is incoherent)
//
// Specialty lounges (marketing_lounge, finance_lounge, investor_lounge) are
// NOT in the ladder — they remain independent toggles because their use cases
// don't nest.
export const LOUNGE_TIER_LADDER: LoungeKey[] = [
  "agent_portal",
  "manager_lounge",
  "director_lounge",
  "executive_lounge",
];

// =============================================================================
// LOUNGE BUNDLES (Wave Z5)
// =============================================================================
// Map a "lead" lounge to sibling lounges that get auto-included whenever the
// lead is granted. Differs from the tier ladder: bundle members are SIBLINGS
// (not nested tiers), and granting a member doesn't imply the lead.
//
// Founder directive 2026-05-06: "put the AI and support toggles under the
// admin toggle. when admin is turned on so does AI and support". The matrix
// hides bundle-member columns; granting Admin grants the whole bundle.
export const LOUNGE_BUNDLES: Partial<Record<LoungeKey, LoungeKey[]>> = {
  admin_panel: ["ai_lounge", "support_lounge"],
};

// Set of every lounge that's a member of some bundle (used by the per-user
// toggle UI to hide the bundle members from the visible columns — they're
// only granted via their bundle lead).
export const BUNDLE_MEMBER_LOUNGES: Set<LoungeKey> = new Set(
  Object.values(LOUNGE_BUNDLES).flat() as LoungeKey[],
);

/**
 * Given a lounge being granted, return the set of lounges that should also
 * be granted. Combines:
 *   - Tier cascade (Manager grants Agent; Director grants Manager+Agent; etc.)
 *   - Bundle expansion (Admin grants AI+Support)
 *   - Auto-bundled lounges (CRM + Onboarding for any heritage grant except client)
 */
export function loungesIncludedByGrant(loungeKey: LoungeKey): LoungeKey[] {
  const result = new Set<LoungeKey>([loungeKey]);

  // Tier cascade: granting tier N → grants tiers 0..N
  const tierIdx = LOUNGE_TIER_LADDER.indexOf(loungeKey);
  if (tierIdx >= 0) {
    for (const lk of LOUNGE_TIER_LADDER.slice(0, tierIdx + 1)) result.add(lk);
  }

  // Bundle expansion: granting a bundle lead → grants its sibling members
  const bundleMembers = LOUNGE_BUNDLES[loungeKey];
  if (bundleMembers) {
    for (const lk of bundleMembers) result.add(lk);
  }

  // Auto-bundle CRM + Onboarding with any heritage grant (except client_lounge,
  // which is its own self-service surface)
  if (loungeKey !== "client_lounge") {
    for (const lk of AUTO_LOUNGES) result.add(lk);
  }

  return Array.from(result);
}

/**
 * Given a lounge being revoked, return the set of lounges that should also
 * be revoked. Combines:
 *   - Tier cascade-up (revoking Agent → revokes Manager+Director+Executive)
 *   - Bundle revocation (revoking Admin → revokes AI+Support)
 */
export function loungesRevokedByRevoke(loungeKey: LoungeKey): LoungeKey[] {
  const result = new Set<LoungeKey>([loungeKey]);

  // Tier cascade-up
  const tierIdx = LOUNGE_TIER_LADDER.indexOf(loungeKey);
  if (tierIdx >= 0) {
    for (const lk of LOUNGE_TIER_LADDER.slice(tierIdx)) result.add(lk);
  }

  // Bundle revocation
  const bundleMembers = LOUNGE_BUNDLES[loungeKey];
  if (bundleMembers) {
    for (const lk of bundleMembers) result.add(lk);
  }

  return Array.from(result);
}

// =============================================================================
// GOLD COAST SURFACES
// =============================================================================
// Goldcoast surfaces are gated by ROLE in Express middleware (requireRole(...)),
// not by lounge_key in user_lounge_access. This map is a read-only reference
// for the Role Defaults UI so founders can see the COMPLETE access matrix
// across both deployments, not just the heritage half.

export const GC_SURFACES = [
  "agent_hcms",       // Agent-facing HCMS (sales agents, managers, directors)
  "admin_hcms",       // Admin-facing HCMS (system admins)
  "ops_hub",          // Operational hub (system admins)
  "founders_lounge",  // /founders/* — gated by FOUNDERS_ONLY (Wave Y)
  "marketing",        // Marketing surface (marketing_staff role)
  "investor_portal",  // Investor surface (investor role)
  "client_dashboard", // Client self-service (client role)
] as const;

export type GcSurface = (typeof GC_SURFACES)[number];

const ALL_GC: GcSurface[] = [...GC_SURFACES];

export const ROLE_TO_GC_SURFACES: Record<string, GcSurface[]> = {
  founder: ALL_GC,
  owner: ["agent_hcms", "admin_hcms", "ops_hub", "marketing", "investor_portal", "client_dashboard"], // owner gets everything EXCEPT founders_lounge
  system_admin: ["admin_hcms", "ops_hub"],
  director: ["agent_hcms"],
  agency_manager: ["agent_hcms"],
  manager: ["agent_hcms"],
  sales_agent: ["agent_hcms"],
  marketing_staff: ["marketing"],
  investor: ["investor_portal"],
  client: ["client_dashboard"],
};

export function gcSurfacesForRole(role: string): GcSurface[] {
  return ROLE_TO_GC_SURFACES[role] || [];
}

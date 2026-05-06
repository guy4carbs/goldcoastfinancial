import { HIERARCHY_LEVELS } from "../../shared/models/enterprise";

export type RoleId = "founder" | "owner" | "system_admin" | "director" | "agency_manager" | "sales_agent" | "client";

/**
 * Canonical mapping from hierarchy_title (HIERARCHY_LEVELS values) to users.role.
 * Used by the PATCH /api/hcms/hierarchy/agents/:id handler so promotions
 * actually unlock features (not just change a label).
 */
export function titleToRole(title: string | null | undefined): RoleId {
  switch (title) {
    case "Founder": return "founder";
    case "Diamond Director":
    case "Platinum Director":
      return "director";
    case "Regional Manager":
    case "Team Lead":
      return "agency_manager";
    case "Senior Agent":
    case "Agent":
    case "Associate Agent":
    default:
      return "sales_agent";
  }
}

/**
 * Privilege rank for self-demotion guard. Higher = more privileged.
 * Founder/owner share the highest rank because both can do everything.
 */
export const ROLE_PRIVILEGE_RANK: Record<RoleId, number> = {
  founder: 5,
  owner: 5,
  system_admin: 4,
  director: 3,
  agency_manager: 2,
  sales_agent: 1,
  client: 0,
};

// Touch HIERARCHY_LEVELS so the import is not flagged as unused; this also
// documents the intentional coupling to the canonical title vocabulary.
void HIERARCHY_LEVELS;

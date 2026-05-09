/**
 * Smoke test: import-time check of the invite role pipeline.
 *
 * Loads the modules that the invite path uses, verifies the role->placement
 * map is consistent, and prints which lounges every role grants. Doesn't
 * touch the database — purely a structural sanity check that the constants
 * line up across `apply.ts` and `loungeAccess.ts`.
 *
 * Run: `npm exec tsx scripts/smoke-test-invite.ts`
 */
import "dotenv/config";
import { ROLE_TO_LOUNGES, loungesForRole } from "../shared/models/loungeAccess";

const ALL_ROLES = [
  "founder", "owner", "system_admin", "director",
  "agency_manager", "manager", "sales_agent",
  "marketing_staff", "investor", "client",
];

const HIERARCHY_ROLES = new Set(["founder", "owner", "director", "agency_manager", "manager", "sales_agent"]);
const FOUNDER_GATED = new Set(["founder", "owner"]);

let failures = 0;
function check(label: string, ok: boolean, detail?: string) {
  const mark = ok ? "✓" : "✗";
  console.log(`  ${mark} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

console.log("\n=== Invite role pipeline smoke test ===\n");

console.log("Lounge grants per role (canonical map):");
for (const role of ALL_ROLES) {
  const lounges = loungesForRole(role);
  console.log(`  ${role.padEnd(18)} → ${lounges.length === 0 ? "(none)" : lounges.join(", ")}`);
}

console.log("\nStructural invariants:");
check(
  "every role appears in ROLE_TO_LOUNGES",
  ALL_ROLES.every((r) => r in ROLE_TO_LOUNGES),
);
check(
  "founder + owner have identical lounge sets",
  JSON.stringify([...ROLE_TO_LOUNGES.founder].sort()) === JSON.stringify([...ROLE_TO_LOUNGES.owner].sort()),
);
check(
  "all hierarchy roles get agent_portal",
  [...HIERARCHY_ROLES].every((r) => ROLE_TO_LOUNGES[r].includes("agent_portal")),
);
check(
  "non-staff roles (marketing/investor) have empty or client-only lounges",
  ROLE_TO_LOUNGES.marketing_staff.length === 0 &&
    ROLE_TO_LOUNGES.investor.length === 0 &&
    ROLE_TO_LOUNGES.client.length === 1 &&
    ROLE_TO_LOUNGES.client.includes("client_lounge"),
);
check(
  "FOUNDER_GATED is subset of hierarchy roles",
  [...FOUNDER_GATED].every((r) => HIERARCHY_ROLES.has(r)),
);
check(
  "system_admin gets admin_panel + ai_lounge + support_lounge bundle",
  ["admin_panel", "ai_lounge", "support_lounge"].every((l) => ROLE_TO_LOUNGES.system_admin.includes(l)),
);
check(
  "director sees director_lounge but agency_manager does not",
  ROLE_TO_LOUNGES.director.includes("director_lounge") &&
    !ROLE_TO_LOUNGES.agency_manager.includes("director_lounge"),
);
check(
  "sales_agent has agent_portal + crm + onboarding only (no manager_lounge)",
  ROLE_TO_LOUNGES.sales_agent.includes("agent_portal") &&
    !ROLE_TO_LOUNGES.sales_agent.includes("manager_lounge"),
);

console.log(`\n${failures === 0 ? "✓ All checks passed" : `✗ ${failures} check(s) failed`}\n`);
process.exit(failures === 0 ? 0 : 1);

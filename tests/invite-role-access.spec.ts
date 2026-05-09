/**
 * Invite Role Access — end-to-end coverage of the new role-aware invite
 * flow at POST /api/apply/invite.
 *
 * Validates three things end-to-end against the live dev server:
 *
 *   1. **Stamping & hierarchy participation** — every invitable role lands
 *      in the database with the correct `users.role`, the right
 *      `agent_hierarchy` row (or none, for non-hierarchy roles), and
 *      override_eligible per the corrected business rule (sales agents
 *      ARE override-eligible).
 *
 *   2. **Lounge access propagation** — `user_lounge_access` rows match
 *      the canonical `ROLE_TO_LOUNGES` map in
 *      `shared/models/loungeAccess.ts`. Without this, a role would be
 *      stamped but Heritage cross-deployment access would be empty.
 *
 *   3. **Authority gates** — the founder gate (only founders can invite
 *      founder/owner) and the seniority gate (`isRoleAtLeast`) reject
 *      forbidden invites with HTTP 403.
 *
 * Cleanup: the spec records every userId it creates and deletes them
 * (cascade-deletes the dependent profile/checklist/hierarchy/access
 * rows) in `test.afterAll` so the suite is idempotent.
 */
// Load DATABASE_URL etc. from .env (server/index.ts does this implicitly at
// boot, but tests run in their own process so we have to opt in).
import "dotenv/config";
import { test, expect, FOUNDER_A, TEST_OWNER, TEST_MANAGER, loginAs, type SessionHandle } from "./fixtures/foundersAuth";
import { pool } from "../server/db";

const TEST_EMAIL_PREFIX = "invite-role-test+";
const TEST_EMAIL_DOMAIN = "@invitespec.local";

interface RoleExpectation {
  role: string;
  hierarchy: { level: number; title: string; overrideEligible: boolean } | null;
  expectedLounges: string[];
}

// Mirror of `ROLE_TO_LOUNGES` in `shared/models/loungeAccess.ts:49-60`. If the
// canonical map changes, this MUST change too — that's the test invariant.
const EXPECTED_LOUNGES: Record<string, string[]> = {
  founder:        ["agent_portal","manager_lounge","director_lounge","executive_lounge","crm_lounge","ai_lounge","admin_panel","client_lounge","onboarding_lounge","finance_lounge","support_lounge"],
  owner:          ["agent_portal","manager_lounge","director_lounge","executive_lounge","crm_lounge","ai_lounge","admin_panel","client_lounge","onboarding_lounge","finance_lounge","support_lounge"],
  system_admin:   ["admin_panel","ai_lounge","support_lounge","crm_lounge","onboarding_lounge"],
  director:       ["agent_portal","manager_lounge","director_lounge","crm_lounge","onboarding_lounge"],
  agency_manager: ["agent_portal","manager_lounge","crm_lounge","onboarding_lounge"],
  manager:        ["agent_portal","manager_lounge","crm_lounge","onboarding_lounge"],
  sales_agent:    ["agent_portal","crm_lounge","onboarding_lounge"],
  marketing_staff: [],
  investor:        [],
  client:         ["client_lounge"],
};

const ROLE_EXPECTATIONS: RoleExpectation[] = [
  { role: "founder",         hierarchy: { level: 0, title: "Founder",        overrideEligible: true }, expectedLounges: EXPECTED_LOUNGES.founder },
  { role: "owner",           hierarchy: { level: 0, title: "Owner",          overrideEligible: true }, expectedLounges: EXPECTED_LOUNGES.owner },
  { role: "director",        hierarchy: { level: 1, title: "Director",       overrideEligible: true }, expectedLounges: EXPECTED_LOUNGES.director },
  { role: "agency_manager",  hierarchy: { level: 3, title: "Agency Manager", overrideEligible: true }, expectedLounges: EXPECTED_LOUNGES.agency_manager },
  { role: "manager",         hierarchy: { level: 4, title: "Manager",        overrideEligible: true }, expectedLounges: EXPECTED_LOUNGES.manager },
  { role: "sales_agent",     hierarchy: { level: 6, title: "Agent",          overrideEligible: true }, expectedLounges: EXPECTED_LOUNGES.sales_agent },
  { role: "system_admin",    hierarchy: null, expectedLounges: EXPECTED_LOUNGES.system_admin },
  { role: "marketing_staff", hierarchy: null, expectedLounges: EXPECTED_LOUNGES.marketing_staff },
  { role: "investor",        hierarchy: null, expectedLounges: EXPECTED_LOUNGES.investor },
  { role: "client",          hierarchy: null, expectedLounges: EXPECTED_LOUNGES.client },
];

const createdUserIds: string[] = [];

async function fetchUplineId(): Promise<{ id: string; contractLevel: number }> {
  // Pick the highest-contract upline from /api/hcms/hierarchy/uplines so we
  // can place invitees up to (upline-5)% — covers founder at 120% spread.
  const founderSession = await loginAs(FOUNDER_A.email, FOUNDER_A.password);
  const resp = await founderSession.api.get("/api/hcms/hierarchy/uplines");
  expect(resp.ok()).toBe(true);
  const list = await resp.json();
  await founderSession.api.dispose();
  expect(Array.isArray(list)).toBe(true);
  expect(list.length).toBeGreaterThan(0);
  const top = list.reduce((a: any, b: any) => (a.contractLevel >= b.contractLevel ? a : b));
  return { id: top.id, contractLevel: Number(top.contractLevel) };
}

async function inviteAs(session: SessionHandle, body: Record<string, unknown>) {
  return session.api.post("/api/apply/invite", { data: body });
}

test.describe.configure({ mode: "serial" });

test.describe("Invite role-access end-to-end", () => {
  let founderSession: SessionHandle;
  let upline: { id: string; contractLevel: number };

  test.beforeAll(async () => {
    founderSession = await loginAs(FOUNDER_A.email, FOUNDER_A.password);
    upline = await fetchUplineId();
  });

  test.afterAll(async () => {
    await founderSession.api.dispose().catch(() => {});
    if (createdUserIds.length > 0) {
      // Hard-delete in dependency order. Most schemas have ON DELETE CASCADE,
      // but be explicit so the test is robust to schema variations.
      await pool.query("DELETE FROM agent_hierarchy WHERE agent_user_id = ANY($1::uuid[])", [createdUserIds]);
      await pool.query("DELETE FROM contracting_checklists WHERE agent_user_id = ANY($1::uuid[])", [createdUserIds]);
      await pool.query("DELETE FROM agent_profiles WHERE user_id = ANY($1::uuid[])", [createdUserIds]);
      await pool.query("DELETE FROM user_lounge_access WHERE user_id = ANY($1::uuid[])", [createdUserIds]);
      await pool.query("DELETE FROM access_change_log WHERE user_id = ANY($1::uuid[])", [createdUserIds]);
      await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [createdUserIds]);
    }
    await pool.end().catch(() => {});
  });

  for (const exp of ROLE_EXPECTATIONS) {
    test(`invite as ${exp.role}: stamps role + ${exp.hierarchy ? "creates" : "skips"} hierarchy + grants ${exp.expectedLounges.length} lounges`, async () => {
      const email = `${TEST_EMAIL_PREFIX}${exp.role}-${Date.now()}${TEST_EMAIL_DOMAIN}`;
      const body: Record<string, unknown> = {
        firstName: "Test",
        lastName: `Invite_${exp.role}`,
        email,
        role: exp.role,
      };
      if (exp.hierarchy) {
        body.uplineId = upline.id;
        // Place at upline-5%, snapped to multiple of 5.
        const target = upline.contractLevel - 5;
        body.contractLevel = target - (target % 5);
      }

      const resp = await inviteAs(founderSession, body);
      expect(resp.ok(), `invite ${exp.role} returned ${resp.status()}: ${await resp.text()}`).toBe(true);
      const data = await resp.json();
      expect(data.success).toBe(true);
      expect(data.userId).toBeTruthy();
      createdUserIds.push(data.userId);

      // 1. users.role stamp
      const userRow = await pool.query("SELECT role FROM users WHERE id = $1", [data.userId]);
      expect(userRow.rows[0]?.role).toBe(exp.role);

      // 2. agent_hierarchy presence + override_eligible
      const ahRow = await pool.query(
        "SELECT hierarchy_level, hierarchy_title, override_eligible FROM agent_hierarchy WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())",
        [data.userId],
      );
      if (exp.hierarchy) {
        expect(ahRow.rows.length, `${exp.role} should have hierarchy row`).toBe(1);
        expect(Number(ahRow.rows[0].hierarchy_level)).toBe(exp.hierarchy.level);
        expect(ahRow.rows[0].hierarchy_title).toBe(exp.hierarchy.title);
        expect(ahRow.rows[0].override_eligible).toBe(exp.hierarchy.overrideEligible);
      } else {
        expect(ahRow.rows.length, `${exp.role} should NOT have hierarchy row`).toBe(0);
      }

      // 3. user_lounge_access matches canonical ROLE_TO_LOUNGES
      const lounges = await pool.query(
        "SELECT lounge_key FROM user_lounge_access WHERE user_id = $1 ORDER BY lounge_key",
        [data.userId],
      );
      const granted = lounges.rows.map((r) => r.lounge_key).sort();
      const expected = [...exp.expectedLounges].sort();
      expect(granted, `lounges for ${exp.role} should match canonical map`).toEqual(expected);
    });
  }

  test("founder gate: owner cannot invite founder/owner", async () => {
    let owner: SessionHandle | null = null;
    try {
      owner = await loginAs(TEST_OWNER.email, TEST_OWNER.password);
    } catch {
      test.skip(true, "TEST_OWNER not seeded; skipping founder-gate check");
      return;
    }
    const email = `${TEST_EMAIL_PREFIX}gate-founder-${Date.now()}${TEST_EMAIL_DOMAIN}`;
    const resp = await inviteAs(owner, { firstName: "Test", lastName: "Gate", email, role: "founder", uplineId: upline.id, contractLevel: upline.contractLevel - 5 });
    expect(resp.status()).toBe(403);
    await owner.api.dispose().catch(() => {});
  });

  test("seniority gate: manager cannot invite director", async () => {
    let mgr: SessionHandle | null = null;
    try {
      mgr = await loginAs(TEST_MANAGER.email, TEST_MANAGER.password);
    } catch {
      test.skip(true, "TEST_MANAGER not seeded; skipping seniority-gate check");
      return;
    }
    const email = `${TEST_EMAIL_PREFIX}gate-director-${Date.now()}${TEST_EMAIL_DOMAIN}`;
    const resp = await inviteAs(mgr, { firstName: "Test", lastName: "Gate", email, role: "director", uplineId: upline.id, contractLevel: upline.contractLevel - 5 });
    expect(resp.status()).toBe(403);
    await mgr.api.dispose().catch(() => {});
  });
});

// Seeds a test Team Lead agent under the founder so the Founders Book of
// Business "/teams" view (which derives teams from agent_hierarchy where
// hierarchy_level IN (3, 4)) has at least one row to render.
//
// Idempotent: re-running with the same email no-ops (looks up the existing
// user, then upserts the hierarchy row by ending the old active one and
// inserting a fresh one only when title/contract differ).
//
// Run: `npx tsx scripts/seed-test-team-lead.ts`
//      `npx tsx scripts/seed-test-team-lead.ts --email custom@example.com --first First --last Last`

import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pkg from "pg";
import { logFounderAction } from "../server/services/founderAudit";

const { Pool } = pkg;

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const EMAIL = arg("email", "team-lead-demo@heritagels.org");
const FIRST = arg("first", "Maya");
const LAST = arg("last", "Reyes");
const TITLE = "Team Lead";
const HIERARCHY_LEVEL = 3; // Team Lead per shared/models/enterprise HIERARCHY_TITLES
const CONTRACT_LEVEL = 90; // founder is 120 → 30% spread (well above 5% min)

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    // 1. Resolve founder (we'll use them as direct upline + the audit actor).
    const founderRes = await client.query(
      `SELECT id FROM users WHERE role = 'founder' LIMIT 1`,
    );
    if (founderRes.rowCount === 0) {
      throw new Error("No founder user — seed the founder first");
    }
    const founderId: string = founderRes.rows[0].id;

    await client.query("BEGIN");

    // 2. Upsert the user (lookup by email; create if missing).
    let userId: string;
    const existingUser = await client.query(`SELECT id FROM users WHERE email = $1`, [EMAIL]);
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      userId = existingUser.rows[0].id;
      await client.query(
        `UPDATE users SET role = 'agency_manager', first_name = $1, last_name = $2, is_active = true, updated_at = NOW() WHERE id = $3`,
        [FIRST, LAST, userId],
      );
      console.log(`[seed-team-lead] reusing user ${userId}`);
    } else {
      const password = crypto.randomUUID();
      const hashed = await bcrypt.hash(password, 10);
      const insertRes = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active, assigned_agent_id)
         VALUES ($1, $2, $3, $4, 'agency_manager', true, $5)
         RETURNING id`,
        [EMAIL, hashed, FIRST, LAST, founderId],
      );
      userId = insertRes.rows[0].id;
      console.log(`[seed-team-lead] created user ${userId} (one-time password: ${password})`);
    }

    // 3. Soft-end any existing active hierarchy row, then insert a fresh one.
    const oldRow = await client.query(
      `SELECT id, direct_upline_id, hierarchy_level, hierarchy_title, contract_level
         FROM agent_hierarchy
         WHERE agent_user_id = $1 AND (effective_to IS NULL OR effective_to > NOW())
         ORDER BY effective_from DESC
         LIMIT 1`,
      [userId],
    );

    const before = oldRow.rows[0] ?? null;
    if (
      before &&
      before.hierarchy_title === TITLE &&
      Number(before.contract_level) === CONTRACT_LEVEL &&
      before.direct_upline_id === founderId
    ) {
      console.log(`[seed-team-lead] hierarchy row already correct, no change`);
      await client.query("COMMIT");
      return;
    }

    if (before) {
      await client.query(
        `UPDATE agent_hierarchy SET effective_to = NOW(), updated_at = NOW() WHERE id = $1`,
        [before.id],
      );
    }

    // upline_chain for an agent under the founder = [founderId]
    const insertRes = await client.query(
      `INSERT INTO agent_hierarchy
         (agent_user_id, direct_upline_id, hierarchy_level, hierarchy_title,
          upline_chain, contract_level, override_eligible, override_percentage,
          effective_from, effective_to, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, true, 0, NOW(), NULL, NOW(), NOW())
       RETURNING id, effective_from`,
      [
        userId,
        founderId,
        HIERARCHY_LEVEL,
        TITLE,
        JSON.stringify([founderId]),
        CONTRACT_LEVEL,
      ],
    );
    const newRow = insertRes.rows[0];

    await logFounderAction({
      actorUserId: founderId,
      action: "hierarchy.update",
      entityType: "agent_hierarchy",
      entityId: userId,
      payload: {
        before,
        after: {
          id: newRow.id,
          agent_user_id: userId,
          direct_upline_id: founderId,
          hierarchy_level: HIERARCHY_LEVEL,
          hierarchy_title: TITLE,
          upline_chain: [founderId],
          contract_level: CONTRACT_LEVEL,
          effective_from: newRow.effective_from,
        },
        changes: {
          hierarchyTitle: { from: before?.hierarchy_title ?? null, to: TITLE },
          contractLevel: { from: before ? Number(before.contract_level) : null, to: CONTRACT_LEVEL },
          directUplineId: { from: before?.direct_upline_id ?? null, to: founderId },
        },
        roleBefore: null,
        roleAfter: "agency_manager",
        seededVia: "scripts/seed-test-team-lead.ts",
      },
      client,
    });

    await client.query("COMMIT");
    console.log(`[seed-team-lead] done — ${FIRST} ${LAST} is now ${TITLE} @ ${CONTRACT_LEVEL}% under founder`);
    console.log(`[seed-team-lead] user_id=${userId}  hierarchy_id=${newRow.id}`);
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[seed-team-lead] FAILED:", err?.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed-team-lead] FATAL:", err);
  process.exit(1);
});

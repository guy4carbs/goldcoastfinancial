import { sql } from "drizzle-orm";
import { db } from "../../db";
import {
  emailSuppressions,
  isTransactionalCategory,
  type EmailCategory,
} from "@shared/models/email";

// =============================================================================
// Suppression store — shared gate for every outbound *system* email.
// =============================================================================
//
// Dependency-light by design (only db + the shared model). Rows are never
// hard-deleted for bounce/complaint reasons (audit/consent record); unsuppress
// only removes voluntary 'unsubscribed'/'manual' rows.

type SuppressionReason = "unsubscribed" | "bounced" | "complained" | "manual";

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * True if this email must NOT receive a send of the given category.
 *
 * Blocks when:
 *  - a global row (scope IS NULL) exists with any reason, OR
 *  - a row scoped to exactly this category exists, OR
 *  - any 'bounced'/'complained' row exists regardless of scope.
 *
 * EXCEPTION (CAN-SPAM): for transactional categories, 'unsubscribed' rows are
 * ignored — but 'bounced'/'complained' ALWAYS block (don't keep mailing dead
 * or complaining addresses, transactional or not).
 */
export async function isSuppressed(email: string, category: EmailCategory): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const transactional = isTransactionalCategory(category);

  try {
    // Bounce/complaint at ANY scope always blocks.
    const hardBlock = await db.execute(sql`
      SELECT 1 FROM ${emailSuppressions}
      WHERE lower(${emailSuppressions.email}) = ${normalized}
        AND ${emailSuppressions.reason} IN ('bounced', 'complained')
      LIMIT 1
    `);
    if ((hardBlock.rows?.length ?? 0) > 0) return true;

    // Voluntary suppression (unsubscribed/manual) at global or this category.
    // Transactional categories ignore these (CAN-SPAM exempt).
    if (transactional) return false;

    const softBlock = await db.execute(sql`
      SELECT 1 FROM ${emailSuppressions}
      WHERE lower(${emailSuppressions.email}) = ${normalized}
        AND ${emailSuppressions.reason} IN ('unsubscribed', 'manual')
        AND (${emailSuppressions.scope} IS NULL OR ${emailSuppressions.scope} = ${category})
      LIMIT 1
    `);
    return (softBlock.rows?.length ?? 0) > 0;
  } catch (err: any) {
    // Fail-open on lookup errors: a transient DB hiccup should not silently
    // drop legitimate transactional mail (password resets, 2FA). The webhook +
    // hard-block path remains the authoritative compliance record.
    console.warn("[suppression] isSuppressed lookup failed, treating as not suppressed:", err?.message);
    return false;
  }
}

/**
 * Record (or refresh) a suppression. Upserts on the unique
 * (lower(email), coalesce(scope,'')) index.
 */
export async function suppress(
  email: string,
  reason: SuppressionReason,
  opts?: { scope?: EmailCategory | null; source?: string; metadata?: any },
): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  const scope = opts?.scope ?? null;
  const source = opts?.source ?? null;
  const metadataJson = opts?.metadata != null ? JSON.stringify(opts.metadata) : null;

  // The unique index is on expressions (lower(email), coalesce(scope,'')), which
  // Drizzle's typed onConflictDoUpdate target cannot express — so we upsert via
  // raw SQL with an ON CONFLICT on the matching index expressions.
  await db.execute(sql`
    INSERT INTO ${emailSuppressions} (email, reason, scope, source, metadata)
    VALUES (
      ${normalized},
      ${reason},
      ${scope},
      ${source},
      ${metadataJson}::jsonb
    )
    ON CONFLICT (lower(email), coalesce(scope, '')) DO UPDATE SET
      reason = EXCLUDED.reason,
      source = EXCLUDED.source,
      metadata = EXCLUDED.metadata
  `);
}

/**
 * Resubscribe: removes ONLY voluntary 'unsubscribed'/'manual' rows for this
 * email + scope. Never deletes bounce/complaint records (permanent consent /
 * deliverability evidence).
 */
export async function unsuppress(email: string, scope?: EmailCategory | null): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  const scopeVal = scope ?? null;

  await db.execute(sql`
    DELETE FROM ${emailSuppressions}
    WHERE lower(${emailSuppressions.email}) = ${normalized}
      AND ${emailSuppressions.reason} IN ('unsubscribed', 'manual')
      AND coalesce(${emailSuppressions.scope}, '') = coalesce(${scopeVal}::text, '')
  `);
}

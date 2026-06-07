import { pgTable, text, varchar, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ============================================================
// Email category taxonomy (shared client/server)
// Transactional categories are CAN-SPAM exempt: they ignore
// `unsubscribed` suppressions but always honor bounced/complained.
// Marketing/relationship categories require a working unsubscribe.
// ============================================================

export const TRANSACTIONAL_CATEGORIES = [
  "password_reset",
  "two_factor",
  "policy_document",
  "account_security",
  "payment_receipt",
  "secure_form",
  "claim_status",
  "system_notification",
] as const;

export const MARKETING_CATEGORIES = [
  "newsletter",
  "drip_sequence",
  "follow_up",
  "birthday_greeting",
  "recruit_invite",
  "product_guide",
  "payment_reminder",
  "policy_update",
  "marketing_general",
] as const;

export const EMAIL_CATEGORIES = [...TRANSACTIONAL_CATEGORIES, ...MARKETING_CATEGORIES] as const;

export type TransactionalCategory = (typeof TRANSACTIONAL_CATEGORIES)[number];
export type MarketingCategory = (typeof MARKETING_CATEGORIES)[number];
export type EmailCategory = (typeof EMAIL_CATEGORIES)[number];

export function isTransactionalCategory(category: EmailCategory): boolean {
  return (TRANSACTIONAL_CATEGORIES as readonly string[]).includes(category);
}

export function isMarketingCategory(category: EmailCategory): boolean {
  return (MARKETING_CATEGORIES as readonly string[]).includes(category);
}

// ============================================================
// Email Suppressions — the shared suppression store.
// Written by: Resend webhook (bounce/complaint), unsubscribe
// links, the preferences drawer, and admins.
// Read by: every outbound system email send (transport layer).
// Rows are never hard-deleted (audit/consent record) — a
// resubscribe is recorded by unsuppress logic, history preserved
// in metadata.
// ============================================================

export const emailSuppressions = pgTable(
  "email_suppressions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    // Always stored lowercased + trimmed
    email: text("email").notNull(),
    reason: text("reason").notNull().$type<"unsubscribed" | "bounced" | "complained" | "manual">(),
    // null = global suppression; otherwise a specific EmailCategory
    scope: text("scope"),
    source: text("source").$type<
      "webhook_resend" | "unsubscribe_link" | "preferences_drawer" | "admin" | "system"
    >(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uniq_email_suppressions_email_scope").on(
      sql`lower(${table.email})`,
      sql`coalesce(${table.scope}, '')`
    ),
    index("idx_email_suppressions_email").on(sql`lower(${table.email})`),
  ]
);

export const insertEmailSuppressionSchema = createInsertSchema(emailSuppressions).omit({
  id: true,
  createdAt: true,
});

export type EmailSuppression = typeof emailSuppressions.$inferSelect;
export type InsertEmailSuppression = z.infer<typeof insertEmailSuppressionSchema>;

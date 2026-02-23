import { pgTable, text, timestamp, varchar, integer, decimal, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// =============================================================================
// MEMBER CARDS - Digital Insurance Cards for Heritage Life Solutions
// =============================================================================

/**
 * Policy type options
 */
export const policyTypeEnum = ["term_life", "whole_life", "iul", "final_expense", "annuity"] as const;
export type PolicyType = typeof policyTypeEnum[number];

/**
 * Card status
 */
export const cardStatusEnum = ["active", "pending", "revoked", "expired"] as const;
export type CardStatus = typeof cardStatusEnum[number];

/**
 * Coverage type
 */
export const coverageTypeEnum = ["individual", "family", "group"] as const;
export type CoverageType = typeof coverageTypeEnum[number];

/**
 * Insurance carriers commonly used
 */
export const insuranceCarrierEnum = [
  "mutual_of_omaha",
  "americo",
  "north_american",
  "national_life_group",
  "foresters",
  "transamerica",
  "aig",
  "protective_life",
  "lincoln_financial",
  "prudential",
  "other"
] as const;
export type InsuranceCarrier = typeof insuranceCarrierEnum[number];

/**
 * Member cards table - tracks digital insurance cards issued to members
 */
export const memberCards = pgTable("member_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Card Display Info
  memberCardNumber: varchar("member_card_number", { length: 20 }).unique().notNull(),

  // Relationships
  memberId: varchar("member_id").notNull(), // References users table
  agentId: varchar("agent_id").notNull(), // Agent who issued the card
  leadId: varchar("lead_id"), // Optional reference to original lead

  // Member Info (denormalized for card display)
  memberFullName: text("member_full_name").notNull(),
  memberEmail: text("member_email").notNull(),
  memberPhone: text("member_phone"),

  // Policy Details
  insuranceCarrier: varchar("insurance_carrier", { length: 50 }).notNull(),
  insuranceCarrierOther: text("insurance_carrier_other"), // If carrier is "other"
  policyNumber: varchar("policy_number", { length: 50 }).notNull(),
  policyType: varchar("policy_type", { length: 30 }).notNull(), // term_life, whole_life, iul, etc.
  coverageAmount: decimal("coverage_amount", { precision: 12, scale: 2 }).notNull(),
  monthlyPremium: decimal("monthly_premium", { precision: 10, scale: 2 }).notNull(),
  effectiveDate: date("effective_date").notNull(),
  termLength: varchar("term_length", { length: 20 }), // "10 Year", "20 Year", etc. (nullable for whole life)
  expirationDate: date("expiration_date"), // (nullable for whole life)
  coverageType: varchar("coverage_type", { length: 20 }).notNull().default("individual"),

  // Beneficiary Info
  beneficiaryName: text("beneficiary_name").notNull(),
  beneficiaryRelationship: varchar("beneficiary_relationship", { length: 30 }),

  // Status & Group
  status: varchar("status", { length: 20 }).notNull().default("active"),
  groupNumber: varchar("group_number", { length: 20 }).notNull(),

  // Timestamps
  issuedAt: timestamp("issued_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  memberIdIdx: index("idx_member_cards_member").on(table.memberId),
  agentIdIdx: index("idx_member_cards_agent").on(table.agentId),
  statusIdx: index("idx_member_cards_status").on(table.status),
  cardNumberIdx: index("idx_member_cards_number").on(table.memberCardNumber),
}));

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Insert schema for creating new member cards
 */
export const insertMemberCardSchema = createInsertSchema(memberCards).omit({
  id: true,
  memberCardNumber: true, // Auto-generated
  issuedAt: true,
  revokedAt: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Update schema for modifying member cards
 */
export const updateMemberCardSchema = insertMemberCardSchema.partial();

/**
 * API request schema for issuing a new card
 */
export const issueMemberCardSchema = z.object({
  // Member info (can be from lead or manual entry)
  memberId: z.string().optional(), // If existing user
  leadId: z.string().optional(), // If converting from lead
  memberFullName: z.string().min(2, "Name must be at least 2 characters"),
  memberEmail: z.string().email("Valid email required"),
  memberPhone: z.string().optional(),

  // Policy details
  insuranceCarrier: z.enum(insuranceCarrierEnum),
  insuranceCarrierOther: z.string().optional(),
  policyNumber: z.string().min(3, "Policy number required"),
  policyType: z.enum(policyTypeEnum),
  coverageAmount: z.number().min(1000, "Minimum coverage is $1,000"),
  monthlyPremium: z.number().min(1, "Premium required"),
  effectiveDate: z.string(), // ISO date string
  termLength: z.string().optional(),
  expirationDate: z.string().optional(),
  coverageType: z.enum(coverageTypeEnum).default("individual"),

  // Beneficiary
  beneficiaryName: z.string().min(2, "Beneficiary name required"),
  beneficiaryRelationship: z.string().optional(),

  // Group (auto-assigned based on agent)
  groupNumber: z.string().optional(),
});

// =============================================================================
// TYPES
// =============================================================================

export type MemberCard = typeof memberCards.$inferSelect;
export type InsertMemberCard = z.infer<typeof insertMemberCardSchema>;
export type UpdateMemberCard = z.infer<typeof updateMemberCardSchema>;
export type IssueMemberCardRequest = z.infer<typeof issueMemberCardSchema>;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate a unique member card number
 * Format: HLS-YYYY-XXXXXX
 */
export function generateMemberCardNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `HLS-${year}-${random}`;
}

/**
 * Format carrier name for display
 */
export function formatCarrierName(carrier: InsuranceCarrier, otherName?: string): string {
  if (carrier === "other" && otherName) return otherName;

  const names: Record<InsuranceCarrier, string> = {
    mutual_of_omaha: "Mutual of Omaha",
    americo: "Americo",
    north_american: "North American",
    national_life_group: "National Life Group",
    foresters: "Foresters",
    transamerica: "Transamerica",
    aig: "AIG",
    protective_life: "Protective Life",
    lincoln_financial: "Lincoln Financial",
    prudential: "Prudential",
    other: "Other",
  };

  return names[carrier];
}

/**
 * Format policy type for display
 */
export function formatPolicyType(type: PolicyType): string {
  const names: Record<PolicyType, string> = {
    term_life: "Term Life",
    whole_life: "Whole Life",
    iul: "Indexed Universal Life",
    final_expense: "Final Expense",
    annuity: "Annuity",
  };
  return names[type];
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

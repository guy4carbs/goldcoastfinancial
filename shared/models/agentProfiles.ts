import { pgTable, text, varchar, boolean, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const agentProfiles = pgTable("agent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),

  // Personal
  dateOfBirth: date("date_of_birth"),

  // Address
  streetAddress: text("street_address"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),

  // Professional Background
  isLicensed: varchar("is_licensed", { length: 20 }),
  licenseNumber: text("license_number"),
  licensedStates: text("licensed_states").array(),
  yearsExperience: varchar("years_experience", { length: 20 }),
  previousAgency: text("previous_agency"),
  npn: varchar("npn", { length: 20 }),

  // Motivation & Goals
  interestedProducts: text("interested_products").array(),
  whyJoinHeritage: text("why_join_heritage"),
  referralSource: varchar("referral_source", { length: 50 }),
  referringAgentName: text("referring_agent_name"),

  // Approval Workflow
  approvalStatus: varchar("approval_status", { length: 20 }).notNull().default("pending_review"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),

  // Consent
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  agreedToPrivacy: boolean("agreed_to_privacy").notNull().default(false),
  consentedAt: timestamp("consented_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_profiles_user_id").on(table.userId),
  index("idx_agent_profiles_approval_status").on(table.approvalStatus),
]);

export const insertAgentProfileSchema = createInsertSchema(agentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
});

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = z.infer<typeof insertAgentProfileSchema>;

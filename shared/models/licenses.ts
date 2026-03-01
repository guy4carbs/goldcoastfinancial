import { pgTable, text, varchar, boolean, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// License status enum
export const licenseStatusEnum = ["active", "pending", "expired", "suspended"] as const;
export type LicenseStatus = (typeof licenseStatusEnum)[number];

// Agent Licenses table
export const agentLicenses = pgTable("agent_licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  licenseNumber: text("license_number"),
  licenseType: text("license_type").default("life_health"),
  status: text("status").notNull().default("active"),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_licenses_user_id").on(table.userId),
  index("idx_agent_licenses_state").on(table.stateCode),
  index("idx_agent_licenses_status").on(table.status),
]);

// Agent Territories table
export const agentTerritories = pgTable("agent_territories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  isPrimary: boolean("is_primary").default(false),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: text("assigned_by"),
  notes: text("notes"),
}, (table) => [
  index("idx_agent_territories_user_id").on(table.userId),
  index("idx_agent_territories_state").on(table.stateCode),
]);

// Insert schemas
export const insertAgentLicenseSchema = createInsertSchema(agentLicenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentTerritorySchema = createInsertSchema(agentTerritories).omit({
  id: true,
  assignedAt: true,
});

// Types
export type AgentLicense = typeof agentLicenses.$inferSelect;
export type InsertAgentLicense = z.infer<typeof insertAgentLicenseSchema>;
export type AgentTerritory = typeof agentTerritories.$inferSelect;
export type InsertAgentTerritory = z.infer<typeof insertAgentTerritorySchema>;

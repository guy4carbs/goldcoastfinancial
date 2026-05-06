import { pgTable, varchar, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const agentLicenses = pgTable("agent_licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }),
  licenseType: varchar("license_type", { length: 30 }).default("life_health"),
  status: varchar("status", { length: 20 }).default("active"),
  effectiveDate: timestamp("effective_date"),
  expirationDate: timestamp("expiration_date"),
  isResident: boolean("is_resident").default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  syncSource: varchar("sync_source", { length: 20 }).default("manual"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

import { text } from "drizzle-orm/pg-core";

export const agentTerritories = pgTable("agent_territories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  stateCode: varchar("state_code", { length: 2 }).notNull(),
  isPrimary: boolean("is_primary").default(false),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: uuid("assigned_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLicenseSchema = createInsertSchema(agentLicenses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTerritorySchema = createInsertSchema(agentTerritories).omit({ id: true, createdAt: true });
export type AgentLicense = typeof agentLicenses.$inferSelect;
export type AgentTerritory = typeof agentTerritories.$inferSelect;

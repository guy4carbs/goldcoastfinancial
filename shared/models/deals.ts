import { pgTable, varchar, uuid, timestamp, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentUserId: uuid("agent_user_id").notNull(),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  carrier: varchar("carrier", { length: 100 }),
  productType: varchar("product_type", { length: 50 }),
  stateCode: varchar("state_code", { length: 2 }),
  monthlyPremium: numeric("monthly_premium", { precision: 10, scale: 2 }),
  annualPremium: numeric("annual_premium", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("submitted"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: uuid("verified_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true });
export type Deal = typeof deals.$inferSelect;

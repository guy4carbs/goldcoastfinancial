import { pgTable, uuid, varchar, decimal, timestamp, text, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./auth";

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),
  clientName: varchar("client_name", { length: 255 }),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  monthlyPremium: decimal("monthly_premium", { precision: 10, scale: 2 }).notNull(),
  annualPremium: decimal("annual_premium", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("submitted"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDealSchema = createInsertSchema(deals);
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

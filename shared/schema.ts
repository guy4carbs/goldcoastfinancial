import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";
export * from "./models/portal";
export * from "./models/chat";

export const guideRequests = pgTable("guide_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guideId: text("guide_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export const insertGuideRequestSchema = createInsertSchema(guideRequests).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  status: true,
});

export type GuideRequest = typeof guideRequests.$inferSelect;
export type InsertGuideRequest = z.infer<typeof insertGuideRequestSchema>;

export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  coverageType: text("coverage_type").notNull(),
  coverageAmount: text("coverage_amount").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  streetAddress: text("street_address").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  height: text("height").notNull(),
  weight: text("weight").notNull(),
  birthDate: text("birth_date").notNull(),
  medicalBackground: text("medical_background").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  position: text("position").notNull(),
  linkedIn: text("linkedin"),
  experience: text("experience").notNull(),
  whyJoinUs: text("why_join_us").notNull(),
  hasLicense: text("has_license"),
  resumeFileName: text("resume_file_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
});

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

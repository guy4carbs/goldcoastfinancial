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

// Institutional Contact Messages
export const institutionalContacts = pgTable("institutional_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  organization: text("organization"),
  email: text("email").notNull(),
  phone: text("phone"),
  inquiryType: text("inquiry_type").notNull(),
  message: text("message").notNull(),
  source: text("source").default("contact_form"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInstitutionalContactSchema = createInsertSchema(institutionalContacts).omit({
  id: true,
  createdAt: true,
});

export type InstitutionalContact = typeof institutionalContacts.$inferSelect;
export type InsertInstitutionalContact = z.infer<typeof insertInstitutionalContactSchema>;

// Newsletter Subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscriptionType: text("subscription_type").default("institutional"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
  unsubscribedAt: true,
  status: true,
});

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;

// Partnership Quiz Submissions
export const partnershipQuizSubmissions = pgTable("partnership_quiz_submissions", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyType: text("company_type").notNull(),
  annualRevenue: text("annual_revenue"),
  employeeCount: text("employee_count"),
  partnershipInterest: text("partnership_interest").notNull(),
  timeline: text("timeline"),
  additionalInfo: text("additional_info"),
  score: text("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPartnershipQuizSchema = createInsertSchema(partnershipQuizSubmissions).omit({
  id: true,
  createdAt: true,
  score: true,
});

export type PartnershipQuizSubmission = typeof partnershipQuizSubmissions.$inferSelect;
export type InsertPartnershipQuiz = z.infer<typeof insertPartnershipQuizSchema>;

// Institutional Meeting Requests
export const institutionalMeetings = pgTable("institutional_meetings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  organization: text("organization"),
  email: text("email").notNull(),
  phone: text("phone"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  meetingType: text("meeting_type").notNull(),
  topic: text("topic"),
  message: text("message"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInstitutionalMeetingSchema = createInsertSchema(institutionalMeetings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InstitutionalMeeting = typeof institutionalMeetings.$inferSelect;
export type InsertInstitutionalMeeting = z.infer<typeof insertInstitutionalMeetingSchema>;

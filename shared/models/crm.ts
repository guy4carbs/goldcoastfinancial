import { pgTable, text, serial, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// =============================================================================
// LEADS / PIPELINE
// =============================================================================

/**
 * Lead status stages for the sales pipeline
 * new -> contacted -> quoted -> follow_up -> won/lost
 */
export const leadStatusEnum = ["new", "contacted", "quoted", "follow_up", "won", "lost"] as const;
export type LeadStatus = typeof leadStatusEnum[number];

/**
 * Lead source - where the lead came from
 */
export const leadSourceEnum = ["quote_form", "contact_form", "phone", "referral", "website", "social_media", "other"] as const;
export type LeadSource = typeof leadSourceEnum[number];

/**
 * Lead priority levels
 */
export const leadPriorityEnum = ["low", "medium", "high", "urgent"] as const;
export type LeadPriority = typeof leadPriorityEnum[number];

/**
 * Main leads table - tracks potential customers through the sales pipeline
 */
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Contact Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),

  // Address (optional)
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),

  // Lead Details
  source: text("source").notNull().default("website"), // quote_form, contact_form, phone, referral, etc.
  sourceId: text("source_id"), // Reference to original quote_request or contact_message id
  status: text("status").notNull().default("new"), // new, contacted, quoted, follow_up, won, lost
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent

  // Insurance Interest
  coverageType: text("coverage_type"), // term, whole, iul, final_expense, etc.
  coverageAmount: text("coverage_amount"),
  estimatedValue: integer("estimated_value"), // Estimated policy value in dollars

  // Assignment
  assignedTo: text("assigned_to"), // Admin user or agent assigned to this lead

  // Follow-up
  nextFollowUp: timestamp("next_follow_up"),
  lastContactedAt: timestamp("last_contacted_at"),

  // Outcome (for won/lost)
  lostReason: text("lost_reason"),
  wonAmount: integer("won_amount"), // Actual policy value if won
  wonDate: timestamp("won_date"),

  // Notes
  notes: text("notes"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Lead activities - tracks all interactions and status changes for a lead
 */
export const leadActivities = pgTable("lead_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),

  // Activity type: note, call, email, meeting, status_change, assignment, follow_up_set
  type: text("type").notNull(),

  // Activity details
  title: text("title").notNull(),
  description: text("description"),

  // For status changes
  oldStatus: text("old_status"),
  newStatus: text("new_status"),

  // Who performed the activity
  performedBy: text("performed_by"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;

// =============================================================================
// SITE SETTINGS
// =============================================================================

/**
 * Site settings - key-value store for all configurable settings
 */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  type: text("type").notNull().default("string"), // string, number, boolean, json
  category: text("category").notNull().default("general"), // general, contact, social, seo, email, branding
  label: text("label"), // Human-readable label
  description: text("description"), // Help text
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

// =============================================================================
// TESTIMONIALS
// =============================================================================

/**
 * Testimonials - customer reviews and success stories
 */
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Customer info
  name: text("name").notNull(),
  title: text("title"), // e.g., "Small Business Owner"
  company: text("company"),
  location: text("location"), // e.g., "Chicago, IL"
  photoUrl: text("photo_url"),

  // Testimonial content
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5), // 1-5 stars

  // Categorization
  category: text("category"), // term, whole, iul, general, etc.
  productType: text("product_type"), // Specific product they purchased

  // Status and display
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),

  // Display options
  showOnHomepage: boolean("show_on_homepage").notNull().default(false),
  showOnProductPages: boolean("show_on_product_pages").notNull().default(true),

  // Metadata
  dateReceived: timestamp("date_received").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// =============================================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================================

/**
 * Newsletter subscribers - email list management
 */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  status: text("status").notNull().default("active"), // active, unsubscribed, bounced
  source: text("source").default("blog"), // blog, footer, popup, etc.
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

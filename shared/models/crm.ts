import { pgTable, text, serial, timestamp, varchar, integer, boolean, jsonb, date, index } from "drizzle-orm/pg-core";
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
 * Pipeline stage enum for leads
 */
export const pipelineStageEnum = ["new", "contacted", "qualified", "appointment_set", "quoted", "application", "underwriting", "issued", "placed", "lost"] as const;
export type PipelineStage = typeof pipelineStageEnum[number];

/**
 * Score tier based on lead score
 */
export const scoreTierEnum = ["cold", "warm", "hot", "on_fire"] as const;
export type ScoreTier = typeof scoreTierEnum[number];

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

  // Conversion tracking (populated when lead is converted to client)
  convertedUserId: varchar("converted_user_id"),
  convertedAt: timestamp("converted_at"),

  // Notes
  notes: text("notes"),

  // ===== NEW PIPELINE COLUMNS =====
  // Scoring
  leadScore: integer("lead_score").default(0), // 0-100 AI-calculated score
  scoreTier: varchar("score_tier", { length: 20 }), // cold, warm, hot, on_fire
  closeProbability: integer("close_probability").default(0), // 0-100 percent

  // Pipeline
  pipelineStage: varchar("pipeline_stage", { length: 50 }).default("new"),
  expectedCloseDate: date("expected_close_date"),

  // Enrichment (from DataEnrichmentAgent)
  enrichmentData: jsonb("enrichment_data"), // Social profiles, employment, household info

  // Tags for filtering/segmentation
  tags: text("tags").array(),

  // Contact tracking
  contactCount: integer("contact_count").default(0),

  // Distribution tracking
  distributedTo: text("distributed_to"),          // user ID of who this lead was distributed to
  distributedAt: timestamp("distributed_at"),      // when distribution happened
  distributedByUser: text("distributed_by_user"),  // user ID of who performed the distribution
  distributionLevel: text("distribution_level"),   // 'executive_to_manager' | 'manager_to_agent'

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_leads_assigned_to").on(table.assignedTo),
  index("idx_leads_status").on(table.status),
  index("idx_leads_pipeline_stage").on(table.pipelineStage),
  index("idx_leads_lead_score").on(table.leadScore),
  index("idx_leads_next_follow_up").on(table.nextFollowUp),
  index("idx_leads_distributed_to").on(table.distributedTo),
]);

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
// IMPORT HISTORY
// =============================================================================

/**
 * Import history - tracks bulk import operations
 */
export const importHistory = pgTable("import_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  fileName: text("file_name"),
  totalRows: integer("total_rows").default(0),
  importedRows: integer("imported_rows").default(0),
  skippedRows: integer("skipped_rows").default(0),
  errorRows: integer("error_rows").default(0),
  source: text("source").default("import"),
  errorDetails: text("error_details"), // JSON array of error messages
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ImportHistory = typeof importHistory.$inferSelect;

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

// =============================================================================
// DISTRIBUTION RECORDS
// =============================================================================

/**
 * Distribution assignment shape stored in JSONB
 */
export interface DistributionAssignment {
  recipientId: string;
  recipientName: string;
  leadCount: number;
  leadIds: string[];
}

/**
 * Distribution records - audit trail for lead distribution events
 */
export const distributionRecords = pgTable("distribution_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Who initiated the distribution
  distributedBy: text("distributed_by").notNull(),
  distributedByRole: text("distributed_by_role").notNull(), // 'executive' | 'manager'

  // Distribution details
  totalLeads: integer("total_leads").notNull(),
  recipientCount: integer("recipient_count").notNull(),
  leadsPerRecipient: integer("leads_per_recipient").notNull(),
  remainderLeads: integer("remainder_leads").default(0),

  // Target level
  distributionLevel: text("distribution_level").notNull(), // 'executive_to_manager' | 'manager_to_agent'

  // Full assignment breakdown
  assignments: jsonb("assignments").$type<DistributionAssignment[]>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_distribution_records_distributed_by").on(table.distributedBy),
  index("idx_distribution_records_created_at").on(table.createdAt),
]);

export const insertDistributionRecordSchema = createInsertSchema(distributionRecords).omit({
  id: true,
  createdAt: true,
});

export type DistributionRecord = typeof distributionRecords.$inferSelect;
export type InsertDistributionRecord = z.infer<typeof insertDistributionRecordSchema>;

// =============================================================================
// ACTIVE CALLS — Ephemeral tracking of live agent calls
// =============================================================================

export const activeCalls = pgTable("active_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentUserId: text("agent_user_id").notNull(),
  callControlId: text("call_control_id").notNull(),
  callLegId: text("call_leg_id"),
  conferenceId: text("conference_id"),
  conferenceName: text("conference_name"),
  direction: text("direction").notNull(), // 'outbound' | 'inbound'
  callerNumber: text("caller_number"),
  destinationNumber: text("destination_number"),
  contactName: text("contact_name"),
  status: text("status").notNull().default("initiated"), // 'initiated' | 'ringing' | 'active' | 'ended'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  answeredAt: timestamp("answered_at"),
  endedAt: timestamp("ended_at"),
}, (table) => [
  index("idx_active_calls_agent").on(table.agentUserId),
  index("idx_active_calls_status").on(table.status),
  index("idx_active_calls_call_control_id").on(table.callControlId),
]);

export const insertActiveCallSchema = createInsertSchema(activeCalls).omit({
  id: true,
  startedAt: true,
});

export type ActiveCall = typeof activeCalls.$inferSelect;
export type InsertActiveCall = z.infer<typeof insertActiveCallSchema>;

// =============================================================================
// CALL MONITOR SESSIONS — Audit trail for supervisor monitoring
// =============================================================================

export const callMonitorSessions = pgTable("call_monitor_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supervisorUserId: text("supervisor_user_id").notNull(),
  activeCallId: text("active_call_id").notNull(),
  agentUserId: text("agent_user_id").notNull(),
  supervisorCallControlId: text("supervisor_call_control_id"),
  conferenceId: text("conference_id"),
  role: text("role").notNull().default("monitor"), // 'monitor' | 'whisper' | 'barge'
  status: text("status").notNull().default("connecting"), // 'connecting' | 'active' | 'ended'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
}, (table) => [
  index("idx_monitor_sessions_supervisor").on(table.supervisorUserId),
  index("idx_monitor_sessions_active_call").on(table.activeCallId),
  index("idx_monitor_sessions_status").on(table.status),
]);

export const insertCallMonitorSessionSchema = createInsertSchema(callMonitorSessions).omit({
  id: true,
  startedAt: true,
});

export type CallMonitorSession = typeof callMonitorSessions.$inferSelect;
export type InsertCallMonitorSession = z.infer<typeof insertCallMonitorSessionSchema>;

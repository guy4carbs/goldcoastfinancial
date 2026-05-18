/**
 * ENTERPRISE TABLES
 * All new tables for the full GCF platform.
 * Includes: appointments, commissions, quotes, email sequences, automation,
 * support, claims, referrals, social, campaigns, escalations, coaching,
 * calls, revenue forecasts, agent system tables, and more.
 */

import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, decimal, uuid, serial, index, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { users } from "./auth";
import { leads } from "./crm";
import { policies } from "./portal";

// =============================================================================
// APPOINTMENTS
// =============================================================================

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  agentUserId: uuid("agent_user_id").references(() => users.id),
  clientUserId: uuid("client_user_id").references(() => users.id),

  // Scheduling
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull().default(30), // minutes
  timezone: varchar("timezone", { length: 100 }).default("America/Chicago"),

  // Details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  meetingType: varchar("meeting_type", { length: 50 }).default("discovery"), // discovery, presentation, follow_up, close
  location: varchar("location", { length: 500 }), // Physical address or "Virtual"
  meetingLink: varchar("meeting_link", { length: 500 }), // Zoom/Google Meet link

  // Status
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, confirmed, completed, cancelled, no_show
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),

  // Reminders
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),

  // Google Calendar sync
  googleEventId: varchar("google_event_id", { length: 255 }),

  // CalDAV sync (Apple Calendar, iCloud, etc.)
  caldavEventUid: varchar("caldav_event_uid", { length: 255 }),
  caldavEventUrl: text("caldav_event_url"),
  caldavProvider: varchar("caldav_provider", { length: 20 }),

  // Outlook Graph API sync (Phase 4)
  outlookEventId: varchar("outlook_event_id", { length: 255 }),

  // Outcome
  outcome: text("outcome"),
  nextSteps: text("next_steps"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_appointments_lead_id").on(table.leadId),
  index("idx_appointments_agent_user_id").on(table.agentUserId),
  index("idx_appointments_scheduled_at").on(table.scheduledAt),
  index("idx_appointments_status").on(table.status),
]);

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// =============================================================================
// QUOTES
// =============================================================================

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  agentUserId: uuid("agent_user_id").references(() => users.id),

  // Quote Details
  quoteNumber: varchar("quote_number", { length: 50 }).unique(),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  productType: varchar("product_type", { length: 100 }).notNull(),
  coverageAmount: integer("coverage_amount").notNull(),
  monthlyPremium: decimal("monthly_premium", { precision: 10, scale: 2 }).notNull(),
  annualPremium: decimal("annual_premium", { precision: 10, scale: 2 }),
  term: integer("term"), // years for term products

  // Health/Underwriting Info
  riskClass: varchar("risk_class", { length: 50 }),
  healthCategory: varchar("health_category", { length: 50 }),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, sent, viewed, accepted, declined, expired
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  expiresAt: timestamp("expires_at"),

  // Client / Delivery Info
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email", { length: 255 }),
  clientPhone: varchar("client_phone", { length: 50 }),
  sendMethod: varchar("send_method", { length: 20 }),
  premiumFrequency: varchar("premium_frequency", { length: 20 }).default("monthly"),
  openedAt: timestamp("opened_at"),

  // Quote document fields
  carrierId: varchar("carrier_id", { length: 100 }),
  quoteType: varchar("quote_type", { length: 100 }),
  quoteTypeName: varchar("quote_type_name", { length: 255 }),
  benefits: text("benefits"),
  additionalNotes: text("additional_notes"),

  // Agent info snapshot
  agentName: varchar("agent_name", { length: 255 }),
  agentEmail: varchar("agent_email", { length: 255 }),
  agentPhone: varchar("agent_phone", { length: 50 }),
  agentNpn: varchar("agent_npn", { length: 50 }),
  smsSent: boolean("sms_sent").default(false),

  // Presentation
  presentationNotes: text("presentation_notes"),
  competitorQuotes: jsonb("competitor_quotes"), // Array of competitor comparisons

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_quotes_lead_id").on(table.leadId),
  index("idx_quotes_agent_user_id").on(table.agentUserId),
]);

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

// =============================================================================
// COMMISSIONS
// =============================================================================

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),
  policyId: uuid("policy_id").references(() => policies.id),
  leadId: varchar("lead_id").references(() => leads.id),

  // Commission Details
  commissionType: varchar("commission_type", { length: 50 }).notNull(), // first_year, renewal, override, bonus
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }), // Commission rate

  // Premium Reference
  premiumAmount: decimal("premium_amount", { precision: 10, scale: 2 }),
  policyYear: integer("policy_year").default(1),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, paid, clawed_back
  earnedAt: timestamp("earned_at"),
  paidAt: timestamp("paid_at"),
  paymentReference: varchar("payment_reference", { length: 100 }),

  // Chargeback tracking
  chargebackAt: timestamp("chargeback_at"),
  chargebackReason: text("chargeback_reason"),

  // Hierarchy (for overrides)
  uplineAgentId: uuid("upline_agent_id").references(() => users.id),
  overrideLevel: integer("override_level"), // 1 = direct upline, 2 = second level, etc.

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_commissions_agent_user_id").on(table.agentUserId),
  index("idx_commissions_policy_id").on(table.policyId),
  index("idx_commissions_status").on(table.status),
]);

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;

// =============================================================================
// EMAIL TEMPLATES
// =============================================================================

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text"),
  category: varchar("category", { length: 100 }), // follow_up, nurture, announcement, etc.
  variables: jsonb("variables").$type<string[]>().default([]), // {{firstName}}, {{agentName}}, etc.
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

// =============================================================================
// EMAIL SEQUENCES (Drip Campaigns)
// =============================================================================

export const emailSequences = pgTable("email_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerEvent: varchar("trigger_event", { length: 100 }), // lead_created, quote_sent, appointment_missed, etc.
  steps: jsonb("steps").$type<Array<{
    templateId: string;
    delayDays: number;
    delayHours: number;
    condition?: string;
  }>>().default([]),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailSequenceSchema = createInsertSchema(emailSequences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = z.infer<typeof insertEmailSequenceSchema>;

// =============================================================================
// EMAIL SEQUENCE ENROLLMENTS
// =============================================================================

export const emailSequenceEnrollments = pgTable("email_sequence_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceId: uuid("sequence_id").references(() => emailSequences.id).notNull(),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  currentStep: integer("current_step").default(0),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, paused, completed, unsubscribed
  nextSendAt: timestamp("next_send_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
}, (table) => [
  index("idx_enrollments_next_send").on(table.nextSendAt),
  index("idx_enrollments_status").on(table.status),
]);

export const insertEmailSequenceEnrollmentSchema = createInsertSchema(emailSequenceEnrollments).omit({
  id: true,
  enrolledAt: true,
});

export type EmailSequenceEnrollment = typeof emailSequenceEnrollments.$inferSelect;
export type InsertEmailSequenceEnrollment = z.infer<typeof insertEmailSequenceEnrollmentSchema>;

// =============================================================================
// EMAILS SENT (Log with tracking)
// =============================================================================

export const emailsSent = pgTable("emails_sent", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  fromAgentId: uuid("from_agent_id").references(() => users.id),
  templateId: uuid("template_id").references(() => emailTemplates.id),
  sequenceId: uuid("sequence_id").references(() => emailSequences.id),
  enrollmentId: uuid("enrollment_id").references(() => emailSequenceEnrollments.id),

  // Email content
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html"),

  // Tracking
  messageId: varchar("message_id", { length: 255 }), // From email provider
  status: varchar("status", { length: 50 }).notNull().default("sent"), // sent, delivered, opened, clicked, bounced, failed
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  bouncedAt: timestamp("bounced_at"),
  bounceReason: text("bounce_reason"),

  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
}, (table) => [
  index("idx_emails_sent_lead_id").on(table.leadId),
  index("idx_emails_sent_from_agent_id").on(table.fromAgentId),
]);

export const insertEmailSentSchema = createInsertSchema(emailsSent).omit({
  id: true,
  sentAt: true,
});

export type EmailSent = typeof emailsSent.$inferSelect;
export type InsertEmailSent = z.infer<typeof insertEmailSentSchema>;

// =============================================================================
// AUTOMATION RULES (If/Then Triggers)
// =============================================================================

export const automationRules = pgTable("automation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Trigger
  triggerType: varchar("trigger_type", { length: 100 }).notNull(), // lead_created, status_changed, score_reached, etc.
  triggerConditions: jsonb("trigger_conditions"), // { field: "leadScore", operator: ">=", value: 80 }

  // Actions
  actions: jsonb("actions").$type<Array<{
    type: string;
    params: Record<string, unknown>;
  }>>().default([]),

  // Settings
  isActive: boolean("is_active").default(true),
  runCount: integer("run_count").default(0),
  lastRunAt: timestamp("last_run_at"),

  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAutomationRuleSchema = createInsertSchema(automationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;

// =============================================================================
// CLAIMS
// =============================================================================

export const claims = pgTable("claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  policyId: uuid("policy_id").references(() => policies.id).notNull(),
  claimantUserId: uuid("claimant_user_id").references(() => users.id),

  // Claim Details
  claimNumber: varchar("claim_number", { length: 50 }).unique(),
  claimType: varchar("claim_type", { length: 100 }).notNull(), // death_benefit, living_benefit, etc.
  claimAmount: decimal("claim_amount", { precision: 12, scale: 2 }),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("submitted"), // submitted, under_review, approved, denied, paid
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  deniedAt: timestamp("denied_at"),
  denialReason: text("denial_reason"),

  // Documentation
  documentsRequired: jsonb("documents_required").$type<string[]>().default([]),
  documentsReceived: jsonb("documents_received").$type<string[]>().default([]),

  // Notes
  internalNotes: text("internal_notes"),

  // Agent Assignment & Carrier Tracking
  agentUserId: uuid("agent_user_id").references(() => users.id),
  carrierClaimNumber: varchar("carrier_claim_number", { length: 100 }),
  estimatedResolutionDate: timestamp("estimated_resolution_date"),
  priority: varchar("priority", { length: 20 }).default("normal"), // normal, high, critical
  carrier: varchar("carrier", { length: 200 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_claims_policy_id").on(table.policyId),
  index("idx_claims_claimant_user_id").on(table.claimantUserId),
  index("idx_claims_agent_user_id").on(table.agentUserId),
]);

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;

// =============================================================================
// CLAIM NOTES (Internal notes + audit trail)
// =============================================================================

export const claimNotes = pgTable("claim_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: uuid("claim_id").references(() => claims.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  authorName: varchar("author_name", { length: 200 }),
  content: text("content").notNull(),
  noteType: varchar("note_type", { length: 50 }).notNull().default("internal"), // internal, status_change, document_request, client_visible
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_claim_notes_claim_id").on(table.claimId),
]);

export const insertClaimNoteSchema = createInsertSchema(claimNotes).omit({
  id: true,
  createdAt: true,
});

export type ClaimNote = typeof claimNotes.$inferSelect;
export type InsertClaimNote = z.infer<typeof insertClaimNoteSchema>;

// =============================================================================
// SUPPORT TICKETS
// =============================================================================

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id),

  // Ticket Details
  ticketNumber: varchar("ticket_number", { length: 50 }).unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }), // billing, policy, claims, general
  priority: varchar("priority", { length: 50 }).default("normal"), // low, normal, high, urgent

  // Status
  status: varchar("status", { length: 50 }).notNull().default("open"), // open, in_progress, waiting_customer, resolved, closed

  // Timing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),

  // Satisfaction
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  satisfactionComment: text("satisfaction_comment"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

// =============================================================================
// SUPPORT TICKET MESSAGES
// =============================================================================

export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").references(() => supportTickets.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // Internal notes vs customer-visible
  attachments: jsonb("attachments").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;

// =============================================================================
// REFERRALS
// =============================================================================

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerUserId: uuid("referrer_user_id").references(() => users.id).notNull(),
  referredLeadId: varchar("referred_lead_id").references(() => leads.id),
  referredPolicyId: uuid("referred_policy_id").references(() => policies.id),

  // Referral Details
  referredName: varchar("referred_name", { length: 255 }),
  referredEmail: varchar("referred_email", { length: 255 }),
  referredPhone: varchar("referred_phone", { length: 50 }),
  relationship: varchar("relationship", { length: 100 }), // family, friend, coworker, neighbor

  // Status
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, contacted, converted, declined

  // Reward
  rewardType: varchar("reward_type", { length: 100 }),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  rewardPaidAt: timestamp("reward_paid_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  convertedAt: timestamp("converted_at"),
}, (table) => [
  index("idx_referrals_referrer_user_id").on(table.referrerUserId),
]);

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// =============================================================================
// REFERRAL POINTS LEDGER
// =============================================================================

export const referralPoints = pgTable("referral_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }), // referral_submitted | consultation_completed | milestone | redemption
  sourceId: varchar("source_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_referral_points_user_id").on(table.userId),
]);

export const insertReferralPointSchema = createInsertSchema(referralPoints).omit({
  id: true,
  createdAt: true,
});

export type ReferralPoint = typeof referralPoints.$inferSelect;
export type InsertReferralPoint = z.infer<typeof insertReferralPointSchema>;

// =============================================================================
// SOCIAL POSTS
// =============================================================================

export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").references(() => users.id),

  // Content
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]),

  // Platform
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, instagram, linkedin, twitter
  platformPostId: varchar("platform_post_id", { length: 255 }),

  // Scheduling
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, scheduled, published, failed
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  failedAt: timestamp("failed_at"),
  failureReason: text("failure_reason"),

  // Engagement
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  reach: integer("reach").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;

// =============================================================================
// SOCIAL MESSAGES (DMs)
// =============================================================================

export const socialMessages = pgTable("social_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  agentUserId: uuid("agent_user_id").references(() => users.id),

  // Platform
  platform: varchar("platform", { length: 50 }).notNull(),
  platformMessageId: varchar("platform_message_id", { length: 255 }),
  platformUserId: varchar("platform_user_id", { length: 255 }),

  // Message
  direction: varchar("direction", { length: 10 }).notNull(), // inbound, outbound
  content: text("content").notNull(),

  // Status
  isRead: boolean("is_read").default(false),
  respondedAt: timestamp("responded_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialMessageSchema = createInsertSchema(socialMessages).omit({
  id: true,
  createdAt: true,
});

export type SocialMessage = typeof socialMessages.$inferSelect;
export type InsertSocialMessage = z.infer<typeof insertSocialMessageSchema>;

// =============================================================================
// REVIEWS
// =============================================================================

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientUserId: uuid("client_user_id").references(() => users.id),

  // Platform
  platform: varchar("platform", { length: 50 }).notNull(), // google, yelp, facebook, etc.
  platformReviewId: varchar("platform_review_id", { length: 255 }),
  platformUrl: varchar("platform_url", { length: 500 }),

  // Content
  rating: integer("rating").notNull(), // 1-5
  reviewText: text("review_text"),
  reviewerName: varchar("reviewer_name", { length: 255 }),

  // Response
  responseText: text("response_text"),
  respondedAt: timestamp("responded_at"),
  respondedBy: uuid("responded_by").references(() => users.id),

  // Status
  isVerified: boolean("is_verified").default(false),
  isDisplayed: boolean("is_displayed").default(true),

  reviewedAt: timestamp("reviewed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// =============================================================================
// CAMPAIGNS
// =============================================================================

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).notNull(), // email, social, paid_ads, seo, event

  // Timing
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, active, paused, completed

  // Goals
  targetLeads: integer("target_leads"),
  targetConversions: integer("target_conversions"),
  budget: decimal("budget", { precision: 10, scale: 2 }),

  // Results
  actualLeads: integer("actual_leads").default(0),
  actualConversions: integer("actual_conversions").default(0),
  actualSpend: decimal("actual_spend", { precision: 10, scale: 2 }).default("0"),

  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

// =============================================================================
// MARKETING SPEND
// =============================================================================

export const marketingSpend = pgTable("marketing_spend", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  category: varchar("category", { length: 100 }).notNull(), // ads, content, tools, events
  vendor: varchar("vendor", { length: 255 }),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  spentAt: date("spent_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketingSpendSchema = createInsertSchema(marketingSpend).omit({
  id: true,
  createdAt: true,
});

export type MarketingSpend = typeof marketingSpend.$inferSelect;
export type InsertMarketingSpend = z.infer<typeof insertMarketingSpendSchema>;

// =============================================================================
// ESCALATIONS
// =============================================================================

export const escalations = pgTable("escalations", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  ticketId: uuid("ticket_id").references(() => supportTickets.id),
  policyId: uuid("policy_id").references(() => policies.id),

  // Escalation Details
  reason: text("reason").notNull(),
  sourceAgent: varchar("source_agent", { length: 100 }), // AI agent that triggered escalation
  urgency: varchar("urgency", { length: 50 }).notNull().default("normal"), // low, normal, high, critical

  // Assignment
  assignedTo: uuid("assigned_to").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("open"), // open, in_progress, resolved, dismissed

  // Resolution
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: uuid("resolved_by").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_escalations_status_urgency").on(table.status, table.urgency),
]);

export const insertEscalationSchema = createInsertSchema(escalations).omit({
  id: true,
  createdAt: true,
});

export type Escalation = typeof escalations.$inferSelect;
export type InsertEscalation = z.infer<typeof insertEscalationSchema>;

// =============================================================================
// COACHING NOTES
// =============================================================================

export const coachingNotes = pgTable("coaching_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),
  coachUserId: uuid("coach_user_id").references(() => users.id).notNull(),

  // Context
  callRecordingId: uuid("call_recording_id"),
  sessionDate: date("session_date"),

  // Content
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  actionItems: jsonb("action_items").$type<string[]>().default([]),
  notes: text("notes"),

  // Follow-up
  nextSessionDate: date("next_session_date"),
  goalsMet: boolean("goals_met"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCoachingNoteSchema = createInsertSchema(coachingNotes).omit({
  id: true,
  createdAt: true,
});

export type CoachingNote = typeof coachingNotes.$inferSelect;
export type InsertCoachingNote = z.infer<typeof insertCoachingNoteSchema>;

// =============================================================================
// CALL RECORDINGS
// =============================================================================

export const callRecordings = pgTable("call_recordings", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: varchar("lead_id").references(() => leads.id),
  agentUserId: uuid("agent_user_id").references(() => users.id),

  // Call Details
  direction: varchar("direction", { length: 10 }).notNull(), // inbound, outbound
  phoneNumber: varchar("phone_number", { length: 50 }),
  duration: integer("duration"), // seconds
  status: varchar("status", { length: 50 }).notNull(), // connected, voicemail, no_answer, busy, failed

  // Recording
  providerRecordingSid: varchar("provider_recording_sid", { length: 100 }),
  providerCallSid: varchar("provider_call_sid", { length: 100 }),
  recordingUrl: varchar("recording_url", { length: 500 }),
  s3Key: varchar("s3_key", { length: 500 }),
  transcription: text("transcription"),

  // Disposition & Notes
  disposition: varchar("disposition", { length: 50 }),
  notes: text("notes"),

  // Analysis
  sentiment: varchar("sentiment", { length: 50 }),
  isAnalyzed: boolean("is_analyzed").default(false),

  calledAt: timestamp("called_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallRecordingSchema = createInsertSchema(callRecordings).omit({
  id: true,
  createdAt: true,
});

export type CallRecording = typeof callRecordings.$inferSelect;
export type InsertCallRecording = z.infer<typeof insertCallRecordingSchema>;

// =============================================================================
// DO NOT CALL (DNC) LIST
// =============================================================================

export const dncNumbers = pgTable("dnc_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull().unique(),
  reason: varchar("reason", { length: 255 }),
  addedByUserId: uuid("added_by_user_id").references(() => users.id),
  source: varchar("source", { length: 50 }).notNull(), // "manual", "sms_opt_out", "compliance"
  isActive: boolean("is_active").default(true).notNull(),
  removedAt: timestamp("removed_at"),
  removedByUserId: uuid("removed_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDncNumberSchema = createInsertSchema(dncNumbers).omit({
  id: true,
  createdAt: true,
});

export type DncNumber = typeof dncNumbers.$inferSelect;
export type InsertDncNumber = z.infer<typeof insertDncNumberSchema>;

// =============================================================================
// CALL ANALYSIS
// =============================================================================

export const callAnalysis = pgTable("call_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  callRecordingId: uuid("call_recording_id").references(() => callRecordings.id).notNull(),

  // AI Analysis
  summary: text("summary"),
  keyMoments: jsonb("key_moments").$type<Array<{
    timestamp: number;
    type: string;
    description: string;
  }>>().default([]),
  objectionsMentioned: jsonb("objections_mentioned").$type<string[]>().default([]),
  competitorsMentioned: jsonb("competitors_mentioned").$type<string[]>().default([]),

  // Scoring
  overallScore: integer("overall_score"), // 1-100
  rapportScore: integer("rapport_score"),
  discoveryScore: integer("discovery_score"),
  presentationScore: integer("presentation_score"),
  closingScore: integer("closing_score"),

  // Coaching Suggestions
  suggestions: jsonb("suggestions").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallAnalysisSchema = createInsertSchema(callAnalysis).omit({
  id: true,
  createdAt: true,
});

export type CallAnalysis = typeof callAnalysis.$inferSelect;
export type InsertCallAnalysis = z.infer<typeof insertCallAnalysisSchema>;

// =============================================================================
// REVENUE FORECASTS
// =============================================================================

export const revenueForecasts = pgTable("revenue_forecasts", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Period
  forecastDate: date("forecast_date").notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // daily, weekly, monthly, quarterly

  // Predictions
  predictedPremium: decimal("predicted_premium", { precision: 12, scale: 2 }),
  predictedCommissions: decimal("predicted_commissions", { precision: 12, scale: 2 }),
  predictedPolicies: integer("predicted_policies"),

  // Confidence
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }), // 0-100

  // Actuals (filled in later)
  actualPremium: decimal("actual_premium", { precision: 12, scale: 2 }),
  actualCommissions: decimal("actual_commissions", { precision: 12, scale: 2 }),
  actualPolicies: integer("actual_policies"),

  // Model info
  modelVersion: varchar("model_version", { length: 50 }),
  factors: jsonb("factors"), // What factors influenced the prediction

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRevenueForecastSchema = createInsertSchema(revenueForecasts).omit({
  id: true,
  createdAt: true,
});

export type RevenueForecast = typeof revenueForecasts.$inferSelect;
export type InsertRevenueForecast = z.infer<typeof insertRevenueForecastSchema>;

// =============================================================================
// AGENT PERFORMANCE SNAPSHOTS
// =============================================================================

export const agentPerformanceSnapshots = pgTable("agent_performance_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),

  // Period
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // daily, weekly, monthly

  // Activity Metrics
  callsMade: integer("calls_made").default(0),
  callsConnected: integer("calls_connected").default(0),
  emailsSent: integer("emails_sent").default(0),
  appointmentsSet: integer("appointments_set").default(0),
  appointmentsKept: integer("appointments_kept").default(0),

  // Conversion Metrics
  leadsAssigned: integer("leads_assigned").default(0),
  leadsContacted: integer("leads_contacted").default(0),
  quotesSent: integer("quotes_sent").default(0),
  applicationSubmitted: integer("applications_submitted").default(0),
  policiesSold: integer("policies_sold").default(0),

  // Revenue
  premiumSold: decimal("premium_sold", { precision: 12, scale: 2 }).default("0"),
  commissionsEarned: decimal("commissions_earned", { precision: 12, scale: 2 }).default("0"),

  // Scores
  performanceScore: integer("performance_score"), // 1-100
  rank: integer("rank"), // Rank among all agents

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAgentPerformanceSnapshotSchema = createInsertSchema(agentPerformanceSnapshots).omit({
  id: true,
  createdAt: true,
});

export type AgentPerformanceSnapshot = typeof agentPerformanceSnapshots.$inferSelect;
export type InsertAgentPerformanceSnapshot = z.infer<typeof insertAgentPerformanceSnapshotSchema>;

// =============================================================================
// AGENT GOALS
// =============================================================================

export const agentGoals = pgTable("agent_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),

  // Period
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),

  // Goals
  targetCalls: integer("target_calls"),
  targetAppointments: integer("target_appointments"),
  targetPolicies: integer("target_policies"),
  targetPremium: decimal("target_premium", { precision: 12, scale: 2 }),

  // Progress
  currentCalls: integer("current_calls").default(0),
  currentAppointments: integer("current_appointments").default(0),
  currentPolicies: integer("current_policies").default(0),
  currentPremium: decimal("current_premium", { precision: 12, scale: 2 }).default("0"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgentGoalSchema = createInsertSchema(agentGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AgentGoal = typeof agentGoals.$inferSelect;
export type InsertAgentGoal = z.infer<typeof insertAgentGoalSchema>;

// =============================================================================
// AI AGENT SYSTEM TABLES
// =============================================================================

// Event Bus Audit Log
export const eventBusAuditLog = pgTable("event_bus_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: varchar("event_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  sourceAgent: varchar("source_agent", { length: 100 }).notNull(),
  payload: jsonb("payload"),
  tier: integer("tier"),
  priority: varchar("priority", { length: 20 }),
  correlationId: varchar("correlation_id", { length: 100 }),
  causationId: varchar("causation_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_event_bus_event_type").on(table.eventType),
  index("idx_event_bus_source_agent").on(table.sourceAgent),
  index("idx_event_bus_created_at").on(table.createdAt),
]);

export type EventBusAuditLogEntry = typeof eventBusAuditLog.$inferSelect;

// Agent Configurations
export const agentConfigurations = pgTable("agent_configurations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentName: varchar("agent_name", { length: 100 }).notNull().unique(),
  tier: integer("tier").notNull(),
  config: jsonb("config").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AgentConfiguration = typeof agentConfigurations.$inferSelect;

// Agent Errors
export const agentErrors = pgTable("agent_errors", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentName: varchar("agent_name", { length: 100 }).notNull(),
  errorType: varchar("error_type", { length: 100 }),
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  eventId: varchar("event_id", { length: 100 }),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_errors_agent_name").on(table.agentName),
  index("idx_agent_errors_resolved").on(table.resolved),
  index("idx_agent_errors_created_at").on(table.createdAt),
]);

export type AgentError = typeof agentErrors.$inferSelect;

// Dead Letter Queue
export const deadLetterQueue = pgTable("dead_letter_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: varchar("event_id", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  sourceAgent: varchar("source_agent", { length: 100 }),
  payload: jsonb("payload"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  status: varchar("status", { length: 50 }).default("pending"), // pending, retrying, dismissed, resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastRetryAt: timestamp("last_retry_at"),
});

export type DeadLetterEntry = typeof deadLetterQueue.$inferSelect;

// Security Audit Log
export const securityAuditLog = pgTable("security_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  result: varchar("result", { length: 20 }).notNull(), // allowed, denied, error
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SecurityAuditLogEntry = typeof securityAuditLog.$inferSelect;

// Analytics Snapshots
export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  snapshotDate: date("snapshot_date").notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(), // hourly, daily, weekly

  // Funnel Metrics
  leadsCreated: integer("leads_created").default(0),
  leadsContacted: integer("leads_contacted").default(0),
  appointmentsSet: integer("appointments_set").default(0),
  policiesSold: integer("policies_sold").default(0),

  // Revenue
  totalPremium: decimal("total_premium", { precision: 12, scale: 2 }).default("0"),
  totalCommissions: decimal("total_commissions", { precision: 12, scale: 2 }).default("0"),

  // Outreach
  callsMade: integer("calls_made").default(0),
  emailsSent: integer("emails_sent").default(0),
  smsSent: integer("sms_sent").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;

// =============================================================================
// SYSTEM & INFRASTRUCTURE TABLES
// =============================================================================

// System Logs
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 20 }).notNull(), // debug, info, warn, error, fatal
  source: varchar("source", { length: 100 }),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_system_logs_level").on(table.level),
  index("idx_system_logs_created_at").on(table.createdAt),
]);

export type SystemLog = typeof systemLogs.$inferSelect;

// Integration Configs
export const integrationConfigs = pgTable("integration_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  provider: varchar("provider", { length: 100 }).notNull(), // telnyx, sendgrid, google, etc.
  credentials: jsonb("credentials"), // Encrypted credentials
  settings: jsonb("settings"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type IntegrationConfig = typeof integrationConfigs.$inferSelect;

// Scheduled Reports
export const scheduledReports = pgTable("scheduled_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  schedule: varchar("schedule", { length: 50 }).notNull(), // daily, weekly, monthly
  recipients: jsonb("recipients").$type<string[]>().default([]),
  filters: jsonb("filters"),
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ScheduledReport = typeof scheduledReports.$inferSelect;

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  pushNotifications: boolean("push_notifications").default(true),
  digestFrequency: varchar("digest_frequency", { length: 20 }).default("daily"),
  theme: varchar("theme", { length: 20 }).default("light"),
  language: varchar("language", { length: 10 }).default("en"),
  customSettings: jsonb("custom_settings"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;

// Payment Methods
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 100 }),
  type: varchar("type", { length: 50 }).notNull(), // card, bank_account
  last4: varchar("last4", { length: 4 }),
  brand: varchar("brand", { length: 50 }),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Contact Relationships
export const contactRelationships = pgTable("contact_relationships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId1: uuid("user_id_1").references(() => users.id).notNull(),
  userId2: uuid("user_id_2").references(() => users.id).notNull(),
  relationshipType: varchar("relationship_type", { length: 50 }).notNull(), // spouse, parent, child, sibling, referrer
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContactRelationship = typeof contactRelationships.$inferSelect;

// Import History — duplicate definition removed. The canonical
// `importHistory` table is in ./crm.ts; the schema duplicated the export
// here for historical reasons but nothing actually imported this version
// (verified via grep on 1.0.59), so it just produced a TS2308 "already
// exported" error on every build. Kept commented for paper-trail.
// export const importHistory = pgTable("import_history", { ... });
// export type ImportHistoryEntry = typeof importHistory.$inferSelect;

// Executive Snapshots
export const executiveSnapshots = pgTable("executive_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  snapshotDate: date("snapshot_date").notNull(),

  // Revenue
  mtdRevenue: decimal("mtd_revenue", { precision: 12, scale: 2 }).default("0"),
  ytdRevenue: decimal("ytd_revenue", { precision: 12, scale: 2 }).default("0"),
  previousMonthRevenue: decimal("previous_month_revenue", { precision: 12, scale: 2 }),

  // Policies
  mtdPolicies: integer("mtd_policies").default(0),
  ytdPolicies: integer("ytd_policies").default(0),

  // Agents
  activeAgents: integer("active_agents").default(0),
  topPerformerId: uuid("top_performer_id").references(() => users.id),

  // Pipeline
  pipelineValue: decimal("pipeline_value", { precision: 12, scale: 2 }).default("0"),
  qualifiedLeads: integer("qualified_leads").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ExecutiveSnapshot = typeof executiveSnapshots.$inferSelect;

// Scripts (Sales scripts with branching logic)
export const scripts = pgTable("scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // opening, discovery, presentation, objection, closing
  productType: varchar("product_type", { length: 100 }),
  content: text("content").notNull(),
  branches: jsonb("branches").$type<Array<{
    trigger: string;
    nextScriptId?: string;
    response: string;
  }>>(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Script = typeof scripts.$inferSelect;

// =============================================================================
// AGENT HIERARCHY
// =============================================================================

export const agentHierarchy = pgTable("agent_hierarchy", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),
  directUplineId: uuid("direct_upline_id").references(() => users.id),

  // Position in hierarchy
  hierarchyLevel: integer("hierarchy_level").notNull().default(5), // 0=owner, 5=agent, 6=new agent
  hierarchyTitle: varchar("hierarchy_title", { length: 100 }), // Custom title like "Senior Agent"

  // Full upline chain for quick lookups (array of user IDs from direct upline to owner)
  uplineChain: jsonb("upline_chain").$type<string[]>().default([]),

  // Commission contract level (e.g., 120%, 90%, 80%)
  contractLevel: decimal("contract_level", { precision: 5, scale: 2 }),

  // Override commission settings
  overrideEligible: boolean("override_eligible").default(false),
  overridePercentage: decimal("override_percentage", { precision: 5, scale: 2 }),

  // Effective dates (for historical tracking)
  effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  effectiveTo: timestamp("effective_to"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_hierarchy_agent_user_id").on(table.agentUserId),
  index("idx_hierarchy_direct_upline_id").on(table.directUplineId),
  index("idx_hierarchy_level").on(table.hierarchyLevel),
]);

export const insertAgentHierarchySchema = createInsertSchema(agentHierarchy).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AgentHierarchy = typeof agentHierarchy.$inferSelect;
export type InsertAgentHierarchy = z.infer<typeof insertAgentHierarchySchema>;

// Hierarchy level constants for reference
export const HIERARCHY_LEVELS = {
  AGENCY_OWNER: 0,
  EXECUTIVE: 1,
  REGIONAL_DIRECTOR: 2,
  TEAM_LEAD: 3,
  SENIOR_AGENT: 4,
  AGENT: 5,
  NEW_AGENT: 6,
} as const;

export const HIERARCHY_TITLES: Record<number, string> = {
  0: 'Agency Owner',
  1: 'Executive',
  2: 'Regional Director',
  3: 'Team Lead',
  4: 'Senior Agent',
  5: 'Agent',
  6: 'New Agent',
};

// ─── HIERARCHY REQUESTS (Approval Workflow) ──────────────────────────────────────

export const hierarchyRequests = pgTable("hierarchy_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestType: varchar("request_type", { length: 30 }).notNull(), // 'placement' | 'commission_change'

  // Requester
  requesterId: uuid("requester_id").references(() => users.id).notNull(),

  // Placement fields (used when requestType = 'placement')
  requestedUplineId: uuid("requested_upline_id").references(() => users.id),

  // Commission change fields (used when requestType = 'commission_change')
  currentContractLevel: decimal("current_contract_level", { precision: 5, scale: 2 }),
  requestedContractLevel: decimal("requested_contract_level", { precision: 5, scale: 2 }),
  proofDocumentUrl: varchar("proof_document_url", { length: 500 }),
  proofDescription: text("proof_description"),
  monthlyApAmount: decimal("monthly_ap_amount", { precision: 12, scale: 2 }),

  // Manager review
  managerReviewerId: uuid("manager_reviewer_id").references(() => users.id),
  managerStatus: varchar("manager_status", { length: 20 }).default("pending").notNull(),
  managerNotes: text("manager_notes"),
  managerRecommendedLevel: decimal("manager_recommended_level", { precision: 5, scale: 2 }),
  managerReviewedAt: timestamp("manager_reviewed_at"),

  // Executive review
  executiveReviewerId: uuid("executive_reviewer_id").references(() => users.id),
  executiveStatus: varchar("executive_status", { length: 20 }).default("pending").notNull(),
  executiveNotes: text("executive_notes"),
  executiveFinalLevel: decimal("executive_final_level", { precision: 5, scale: 2 }),
  executiveFinalUplineId: uuid("executive_final_upline_id").references(() => users.id),
  executiveReviewedAt: timestamp("executive_reviewed_at"),

  // Carrier update tracking
  carrierUpdated: boolean("carrier_updated").default(false).notNull(),
  carrierUpdateNotes: text("carrier_update_notes"),
  carrierReminderSentAt: timestamp("carrier_reminder_sent_at"),

  // Overall status: pending_manager → pending_executive → approved/rejected/cancelled
  status: varchar("status", { length: 20 }).default("pending_manager").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_hierarchy_requests_requester").on(table.requesterId),
  index("idx_hierarchy_requests_status").on(table.status),
  index("idx_hierarchy_requests_type").on(table.requestType),
  index("idx_hierarchy_requests_manager").on(table.managerReviewerId),
]);

export const insertHierarchyRequestSchema = createInsertSchema(hierarchyRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HierarchyRequest = typeof hierarchyRequests.$inferSelect;
export type InsertHierarchyRequest = z.infer<typeof insertHierarchyRequestSchema>;

// ─── COMMISSION TARGETS ──────────────────────────────────────────────────────────

export const commissionTargets = pgTable("commission_targets", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Scope: 'agency_default' (per hierarchy level) or 'agent_specific' (per agent)
  scope: varchar("scope", { length: 20 }).notNull(),
  agentUserId: uuid("agent_user_id").references(() => users.id), // NULL for agency defaults

  hierarchyLevel: integer("hierarchy_level"), // Which level (0-6), NULL for per-agent
  minContractLevel: decimal("min_contract_level", { precision: 5, scale: 2 }).notNull(),
  maxContractLevel: decimal("max_contract_level", { precision: 5, scale: 2 }).notNull(),
  defaultContractLevel: decimal("default_contract_level", { precision: 5, scale: 2 }).notNull(),

  // AP thresholds for level increases: [{monthlyAp: 10000, contractLevel: 75}, ...]
  levelProgression: jsonb("level_progression").$type<Array<{ monthlyAp: number; contractLevel: number }>>().default([]),

  setBy: uuid("set_by").references(() => users.id).notNull(),

  effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  effectiveTo: timestamp("effective_to"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_commission_targets_scope").on(table.scope),
  index("idx_commission_targets_agent").on(table.agentUserId),
  index("idx_commission_targets_level").on(table.hierarchyLevel),
]);

export const insertCommissionTargetSchema = createInsertSchema(commissionTargets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CommissionTarget = typeof commissionTargets.$inferSelect;
export type InsertCommissionTarget = z.infer<typeof insertCommissionTargetSchema>;

// ─── COMMISSION AUDIT LOG ────────────────────────────────────────────────────────

export const commissionAuditLog = pgTable("commission_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // contract_level_changed, placement_completed, etc.
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  requestId: uuid("request_id"), // links to hierarchy_requests.id
  performedBy: uuid("performed_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_commission_audit_agent").on(table.agentUserId),
  index("idx_commission_audit_action").on(table.action),
]);

export type CommissionAuditLog = typeof commissionAuditLog.$inferSelect;
export type InsertCommissionAuditLog = typeof commissionAuditLog.$inferInsert;

// ─── ACCESS CHANGE LOG ─────────────────────────────────────────────────────────
export const accessChangeLog = pgTable("access_change_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetUserId: uuid("target_user_id").references(() => users.id).notNull(),
  performedBy: uuid("performed_by").references(() => users.id).notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  reason: text("reason"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_access_log_target").on(table.targetUserId),
  index("idx_access_log_performer").on(table.performedBy),
  index("idx_access_log_type").on(table.actionType),
]);

export type AccessChangeLog = typeof accessChangeLog.$inferSelect;
export type InsertAccessChangeLog = typeof accessChangeLog.$inferInsert;

// =============================================================================
// TELNYX NUMBER POOL (Local Presence Dialing)
// =============================================================================

export const telnyxNumberPool = pgTable("telnyx_number_pool", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  areaCode: varchar("area_code", { length: 10 }).notNull(),
  state: varchar("state", { length: 2 }),
  connectionId: varchar("connection_id", { length: 100 }).notNull(),
  telnyxPhoneNumberId: varchar("telnyx_phone_number_id", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TelnyxPoolNumber = typeof telnyxNumberPool.$inferSelect;
export type InsertTelnyxPoolNumber = typeof telnyxNumberPool.$inferInsert;

// =============================================================================
// AGENT TELEPHONY CREDENTIALS (Per-Agent WebRTC Auth)
// =============================================================================

export const agentTelephonyCredentials = pgTable("agent_telephony_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentUserId: uuid("agent_user_id").references(() => users.id).notNull(),
  telnyxCredentialId: varchar("telnyx_credential_id", { length: 100 }).notNull(),
  sipUsername: varchar("sip_username", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AgentTelephonyCredential = typeof agentTelephonyCredentials.$inferSelect;
export type InsertAgentTelephonyCredential = typeof agentTelephonyCredentials.$inferInsert;

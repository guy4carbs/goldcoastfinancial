import { pgTable, text, varchar, boolean, timestamp, date, integer, index } from "drizzle-orm/pg-core";
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

  // Business Card / Public Profile
  title: varchar("title", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  websiteUrl: varchar("website_url", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  instagramUrl: varchar("instagram_url", { length: 255 }),
  facebookUrl: varchar("facebook_url", { length: 255 }),
  twitterUrl: varchar("twitter_url", { length: 255 }),

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
  preferredUplineId: varchar("preferred_upline_id", { length: 100 }),

  // Approval Workflow
  approvalStatus: varchar("approval_status", { length: 20 }).notNull().default("pending_review"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),

  // Consent
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  agreedToPrivacy: boolean("agreed_to_privacy").notNull().default(false),
  consentedAt: timestamp("consented_at"),

  // ── Onboarding Metadata ──
  onboardingType: varchar("onboarding_type", { length: 20 }),
  onboardingStep: integer("onboarding_step").default(0),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  onboardingToken: varchar("onboarding_token", { length: 255 }),
  onboardingTokenExpiresAt: timestamp("onboarding_token_expires_at"),

  // ── Personal / Sensitive (AES-256-GCM encrypted) ──
  ssnEncrypted: text("ssn_encrypted"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactSsnEncrypted: text("emergency_contact_ssn_encrypted"),

  // ── Direct Deposit / Banking (encrypted) ──
  bankName: text("bank_name"),
  bankAccountType: varchar("bank_account_type", { length: 20 }),
  routingNumberEncrypted: text("routing_number_encrypted"),
  accountNumberEncrypted: text("account_number_encrypted"),

  // ── License & E&O ──
  licenseExpirationDate: date("license_expiration_date"),
  eoProvider: text("eo_provider"),
  eoPolicyNumber: text("eo_policy_number"),
  eoEffectiveDate: date("eo_effective_date"),
  eoExpirationDate: date("eo_expiration_date"),

  // ── Document S3 Keys ──
  eoCertificateS3Key: text("eo_certificate_s3_key"),
  amlCertificateS3Key: text("aml_certificate_s3_key"),
  driversLicenseS3Key: text("drivers_license_s3_key"),
  driversLicenseBackS3Key: text("drivers_license_back_s3_key"),
  directDepositFormS3Key: text("direct_deposit_form_s3_key"),

  // ── Compliance / Background ──
  hasFelony: boolean("has_felony").default(false),
  felonyDetails: text("felony_details"),
  hasBankruptcy: boolean("has_bankruptcy").default(false),
  bankruptcyDetails: text("bankruptcy_details"),
  hasMisdemeanor: boolean("has_misdemeanor").default(false),
  misdemeanorDetails: text("misdemeanor_details"),

  // ── DocuSign ──
  docusignNdaEnvelopeId: varchar("docusign_nda_envelope_id", { length: 100 }),
  docusignNdaSigned: boolean("docusign_nda_signed").default(false),
  docusignNdaS3Key: text("docusign_nda_s3_key"),
  docusignNdaSignedAt: timestamp("docusign_nda_signed_at"),
  docusignDebtRollupEnvelopeId: varchar("docusign_debt_rollup_envelope_id", { length: 100 }),
  docusignDebtRollupSigned: boolean("docusign_debt_rollup_signed").default(false),
  docusignDebtRollupS3Key: text("docusign_debt_rollup_s3_key"),
  docusignDebtRollupSignedAt: timestamp("docusign_debt_rollup_signed_at"),
  docusignComplianceEnvelopeId: varchar("docusign_compliance_envelope_id", { length: 100 }),
  docusignComplianceSigned: boolean("docusign_compliance_signed").default(false),
  docusignComplianceS3Key: text("docusign_compliance_s3_key"),
  docusignComplianceSignedAt: timestamp("docusign_compliance_signed_at"),
  docusignNdaDocumentHash: text("docusign_nda_document_hash"),
  docusignDebtRollupDocumentHash: text("docusign_debt_rollup_document_hash"),
  docusignComplianceDocumentHash: text("docusign_compliance_document_hash"),

  // ── New Agent (Unlicensed) Specific ──
  highestEducation: varchar("highest_education", { length: 50 }),
  previousSalesExperience: text("previous_sales_experience"),
  previousIndustry: varchar("previous_industry", { length: 100 }),
  learningStyle: varchar("learning_style", { length: 30 }),
  weeklyStudyHours: integer("weekly_study_hours"),
  targetExamDate: date("target_exam_date"),
  mentorId: varchar("mentor_id", { length: 100 }),
  canCommitInPerson: boolean("can_commit_in_person").default(false),
  canCommitScheduledOnline: boolean("can_commit_scheduled_online").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_profiles_user_id").on(table.userId),
  index("idx_agent_profiles_approval_status").on(table.approvalStatus),
  index("idx_agent_profiles_onboarding_token").on(table.onboardingToken),
  index("idx_agent_profiles_onboarding_type").on(table.onboardingType),
]);

// ── User Lounge Access ──
export const userLoungeAccess = pgTable("user_lounge_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  loungeKey: varchar("lounge_key", { length: 50 }).notNull(),
  granted: boolean("granted").notNull().default(true),
  grantedBy: varchar("granted_by"),
  grantedAt: timestamp("granted_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
}, (table) => [
  index("idx_user_lounge_access_user_id").on(table.userId),
  index("idx_user_lounge_access_lounge_key").on(table.loungeKey),
]);

export const insertAgentProfileSchema = createInsertSchema(agentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  onboardingToken: true,
  onboardingTokenExpiresAt: true,
  onboardingCompletedAt: true,
  ssnEncrypted: true,
  emergencyContactSsnEncrypted: true,
  routingNumberEncrypted: true,
  accountNumberEncrypted: true,
  eoCertificateS3Key: true,
  amlCertificateS3Key: true,
  driversLicenseS3Key: true,
  docusignNdaEnvelopeId: true,
  docusignNdaSigned: true,
  docusignNdaS3Key: true,
  docusignNdaSignedAt: true,
  docusignDebtRollupEnvelopeId: true,
  docusignDebtRollupSigned: true,
  docusignDebtRollupS3Key: true,
  docusignDebtRollupSignedAt: true,
  docusignComplianceEnvelopeId: true,
  docusignComplianceSigned: true,
  docusignComplianceS3Key: true,
  docusignComplianceSignedAt: true,
  docusignNdaDocumentHash: true,
  docusignDebtRollupDocumentHash: true,
  docusignComplianceDocumentHash: true,
});

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = z.infer<typeof insertAgentProfileSchema>;
export type UserLoungeAccess = typeof userLoungeAccess.$inferSelect;

CREATE TABLE "institutional_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"organization" text,
	"email" text NOT NULL,
	"phone" text,
	"inquiry_type" text NOT NULL,
	"message" text NOT NULL,
	"source" text DEFAULT 'contact_form',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutional_meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"organization" text,
	"email" text NOT NULL,
	"phone" text,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"meeting_type" text NOT NULL,
	"topic" text,
	"message" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"subscription_type" text DEFAULT 'institutional',
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "partnership_quiz_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company_type" text NOT NULL,
	"annual_revenue" text,
	"employee_count" text,
	"partnership_interest" text NOT NULL,
	"timeline" text,
	"additional_info" text,
	"score" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" varchar(255),
	"total_rows" integer DEFAULT 0,
	"imported_rows" integer DEFAULT 0,
	"skipped_rows" integer DEFAULT 0,
	"error_rows" integer DEFAULT 0,
	"source" varchar(30),
	"error_details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"title" varchar(255),
	"description" text,
	"old_status" varchar(30),
	"new_status" varchar(30),
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"street_address" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"source" varchar(30) DEFAULT 'web_form',
	"status" varchar(20) DEFAULT 'new',
	"priority" varchar(10) DEFAULT 'medium',
	"pipeline_stage" varchar(30) DEFAULT 'new',
	"lead_score" integer DEFAULT 0,
	"score_tier" varchar(20) DEFAULT 'cold',
	"close_probability" integer DEFAULT 0,
	"estimated_value" numeric(12, 2),
	"coverage_type" varchar(50),
	"coverage_amount" numeric(12, 2),
	"assigned_to" uuid,
	"enrichment_data" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"contact_count" integer DEFAULT 0,
	"last_contacted_at" timestamp,
	"next_follow_up" timestamp,
	"distributed_to" uuid,
	"distributed_at" timestamp,
	"converted_user_id" uuid,
	"converted_at" timestamp,
	"lost_reason" text,
	"won_amount" numeric(12, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"state_code" varchar(2) NOT NULL,
	"license_number" varchar(50),
	"license_type" varchar(30) DEFAULT 'life_health',
	"status" varchar(20) DEFAULT 'active',
	"effective_date" timestamp,
	"expiration_date" timestamp,
	"is_resident" boolean DEFAULT false,
	"last_synced_at" timestamp,
	"sync_source" varchar(20) DEFAULT 'manual',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_territories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"state_code" varchar(2) NOT NULL,
	"is_primary" boolean DEFAULT false,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"date_of_birth" varchar(20),
	"phone" varchar(20),
	"email" varchar(255),
	"street_address" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"title" varchar(100),
	"company_name" varchar(200),
	"years_experience" varchar(20),
	"previous_agency" varchar(200),
	"npn" varchar(20),
	"is_licensed" boolean DEFAULT false,
	"license_number" varchar(50),
	"licensed_states" text,
	"eo_provider" varchar(200),
	"eo_policy_number" varchar(50),
	"eo_effective_date" varchar(20),
	"eo_expiration_date" varchar(20),
	"eo_coverage_amount" varchar(50),
	"website_url" varchar(500),
	"linkedin_url" varchar(500),
	"ssn_encrypted" text,
	"bank_name" varchar(200),
	"bank_account_type" varchar(20),
	"routing_number_encrypted" text,
	"account_number_encrypted" text,
	"onboarding_type" varchar(30) DEFAULT 'standard',
	"onboarding_step" integer DEFAULT 0,
	"onboarding_completed_at" timestamp,
	"onboarding_token" varchar(255),
	"onboarding_token_expires_at" timestamp,
	"approval_status" varchar(30) DEFAULT 'pending_review',
	"approved_by" uuid,
	"approved_at" timestamp,
	"rejection_reason" text,
	"has_felony" boolean DEFAULT false,
	"felony_details" text,
	"has_bankruptcy" boolean DEFAULT false,
	"bankruptcy_details" text,
	"docusign_nda_envelope_id" varchar(100),
	"docusign_nda_signed" boolean DEFAULT false,
	"docusign_nda_signed_at" timestamp,
	"docusign_nda_s3_key" text,
	"docusign_debt_rollup_envelope_id" varchar(100),
	"docusign_debt_rollup_signed" boolean DEFAULT false,
	"docusign_debt_rollup_signed_at" timestamp,
	"docusign_debt_rollup_s3_key" text,
	"docusign_compliance_envelope_id" varchar(100),
	"docusign_compliance_signed" boolean DEFAULT false,
	"docusign_compliance_signed_at" timestamp,
	"docusign_compliance_s3_key" text,
	"eo_certificate_s3_key" text,
	"drivers_license_s3_key" text,
	"direct_deposit_form_s3_key" text,
	"aml_certificate_s3_key" text,
	"articles_s3_key" text,
	"background_answers" text,
	"dba_type" varchar(30),
	"ein" varchar(20),
	"company_type" varchar(50),
	"state_of_inc" varchar(2),
	"dba_name" varchar(200),
	"license_type" varchar(30),
	"formation_date" varchar(20),
	"business_email" varchar(255),
	"business_phone" varchar(20),
	"business_fax" varchar(20),
	"business_website" varchar(255),
	"business_street" varchar(255),
	"business_unit" varchar(100),
	"business_city" varchar(100),
	"business_state" varchar(2),
	"business_zip" varchar(10),
	"mailing_street" varchar(255),
	"mailing_unit" varchar(100),
	"mailing_city" varchar(100),
	"mailing_state" varchar(2),
	"mailing_zip" varchar(10),
	"mailing_same_as_business" boolean DEFAULT false,
	"owners_json" text,
	"drlp_json" text,
	"beneficiary_json" text,
	"ce_expiration_date" varchar(20),
	"agreed_to_terms" boolean DEFAULT false,
	"agreed_to_privacy" boolean DEFAULT false,
	"consented_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_lounge_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" varchar(50) NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"client_name" varchar(200) NOT NULL,
	"carrier" varchar(100),
	"product_type" varchar(50),
	"state_code" varchar(2),
	"monthly_premium" numeric(10, 2),
	"annual_premium" numeric(10, 2),
	"status" varchar(20) DEFAULT 'submitted',
	"submitted_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"verified_by" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(50) NOT NULL,
	"client_user_id" uuid,
	"agent_user_id" uuid,
	"policy_id" uuid,
	"status" varchar(20) DEFAULT 'generating',
	"personal_note" text,
	"generated_pdf_key" text,
	"generated_pdf_url" text,
	"document_id" uuid,
	"delivery_results" jsonb,
	"error_message" text,
	"scheduled_for" timestamp,
	"approved_at" timestamp,
	"approved_by" uuid,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(30),
	"lifecycle_phase" varchar(30),
	"is_automated" boolean DEFAULT false,
	"requires_approval" boolean DEFAULT false,
	"allows_personal_note" boolean DEFAULT true,
	"trigger_event" varchar(50),
	"document_type_for_portal" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "document_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
CREATE TABLE "access_change_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"change_type" varchar(30) NOT NULL,
	"previous_value" text,
	"new_value" text,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "app_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" varchar(100),
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"successful" boolean DEFAULT false,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_token" text NOT NULL,
	"platform" varchar(20),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"goal_type" varchar(30) NOT NULL,
	"target_value" numeric(12, 2) NOT NULL,
	"current_value" numeric(12, 2) DEFAULT '0',
	"period_start" timestamp,
	"period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_hierarchy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"direct_upline_id" uuid,
	"hierarchy_level" integer DEFAULT 6 NOT NULL,
	"hierarchy_title" varchar(100),
	"upline_chain" jsonb DEFAULT '[]'::jsonb,
	"contract_level" numeric(5, 2) DEFAULT '80',
	"override_eligible" boolean DEFAULT false,
	"override_percentage" numeric(5, 2) DEFAULT '0',
	"effective_from" timestamp DEFAULT now(),
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_performance_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"period_type" varchar(20) DEFAULT 'monthly',
	"period_start" timestamp,
	"period_end" timestamp,
	"total_deals" integer DEFAULT 0,
	"total_premium" numeric(12, 2) DEFAULT '0',
	"total_commissions" numeric(12, 2) DEFAULT '0',
	"policies_issued" integer DEFAULT 0,
	"closing_rate" numeric(5, 2),
	"ranking" integer,
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100),
	"action" varchar(50) NOT NULL,
	"previous_value" jsonb,
	"new_value" jsonb,
	"performed_by" uuid,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" varchar(20) DEFAULT 'agency_default' NOT NULL,
	"agent_user_id" uuid,
	"hierarchy_level" integer,
	"min_contract_level" numeric(5, 2),
	"max_contract_level" numeric(5, 2),
	"default_contract_level" numeric(5, 2),
	"level_progression" jsonb DEFAULT '[]'::jsonb,
	"effective_from" timestamp DEFAULT now(),
	"effective_to" timestamp,
	"set_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"policy_id" uuid,
	"deal_id" uuid,
	"commission_type" varchar(30) DEFAULT 'first_year' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"percentage" numeric(5, 2),
	"premium_amount" numeric(12, 2),
	"policy_year" integer DEFAULT 1,
	"status" varchar(20) DEFAULT 'pending',
	"chargeback_of" uuid,
	"upline_agent_id" uuid,
	"override_level" integer,
	"period_year" integer,
	"period_month" integer,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hierarchy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"request_type" varchar(30) NOT NULL,
	"current_value" text,
	"requested_value" text,
	"justification" text,
	"status" varchar(30) DEFAULT 'pending_manager',
	"reviewed_by" uuid,
	"review_notes" text,
	"reviewed_at" timestamp,
	"executive_reviewed_by" uuid,
	"executive_review_notes" text,
	"executive_reviewed_at" timestamp,
	"requested_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracting_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"nda_status" varchar(20) DEFAULT 'pending',
	"nda_signed_at" timestamp,
	"nda_document_key" text,
	"debt_rollup_status" varchar(20) DEFAULT 'pending',
	"debt_rollup_signed_at" timestamp,
	"debt_rollup_document_key" text,
	"compliance_status" varchar(20) DEFAULT 'pending',
	"compliance_signed_at" timestamp,
	"compliance_document_key" text,
	"all_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carrier_sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrier_id" uuid,
	"sync_type" varchar(20),
	"status" varchar(20),
	"records_processed" integer DEFAULT 0,
	"records_created" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"records_skipped" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "production_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrier_id" uuid,
	"carrier_code" varchar(20),
	"agent_user_id" uuid NOT NULL,
	"writing_number" varchar(50),
	"policy_number" varchar(50),
	"insured_name" varchar(200),
	"insured_state" varchar(2),
	"product_type" varchar(50),
	"product_name" varchar(200),
	"face_amount" numeric(12, 2),
	"annual_premium" numeric(12, 2),
	"modal_premium" numeric(12, 2),
	"premium_mode" varchar(20),
	"application_date" timestamp,
	"issue_date" timestamp,
	"paid_date" timestamp,
	"effective_date" timestamp,
	"status" varchar(20) DEFAULT 'submitted',
	"commission_amount" numeric(10, 2),
	"commission_type" varchar(20),
	"raw_payload" jsonb,
	"synced_at" timestamp,
	"source_type" varchar(20) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid,
	"flag_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"related_table" varchar(50),
	"related_id" varchar(100),
	"due_date" timestamp,
	"status" varchar(20) DEFAULT 'open',
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"resolved_notes" text,
	"auto_generated" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "board_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"proposed_by" uuid NOT NULL,
	"approved_by" uuid,
	"status" varchar(30) DEFAULT 'proposed' NOT NULL,
	"emergency" boolean DEFAULT false NOT NULL,
	"note" text,
	"emergency_note" text,
	"proposed_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"executed_at" timestamp,
	"reversed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "board_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"voter_user_id" uuid NOT NULL,
	"vote" varchar(20) NOT NULL,
	"note" text,
	"voted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cap_table_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"holder_name" varchar(255) NOT NULL,
	"holder_user_id" uuid,
	"share_class" varchar(30) NOT NULL,
	"shares" integer NOT NULL,
	"grant_date" date,
	"vesting_start" date,
	"vesting_months" integer,
	"cliff_months" integer,
	"accelerated_on_change" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "capital_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period" varchar(20) NOT NULL,
	"category" varchar(40) NOT NULL,
	"approved_cents" bigint DEFAULT 0 NOT NULL,
	"committed_cents" bigint DEFAULT 0 NOT NULL,
	"spent_cents" bigint DEFAULT 0 NOT NULL,
	"proposed_by" uuid NOT NULL,
	"approved_by" uuid,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"note" text,
	"approved_at" timestamp,
	"reversed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "founder_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" uuid,
	"brand" varchar(20) DEFAULT 'both' NOT NULL,
	"payload" jsonb,
	"viewing_as" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ma_pipeline_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_name" varchar(255) NOT NULL,
	"kind" varchar(30) NOT NULL,
	"stage" varchar(30) DEFAULT 'prospect' NOT NULL,
	"deal_value_cents" bigint,
	"health_score" integer DEFAULT 0,
	"owner_user_id" uuid NOT NULL,
	"next_action" varchar(255),
	"next_action_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "view_as_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"founder_user_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"reason" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'sales_agent' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "apple_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_message" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar(100) DEFAULT 'America/Chicago';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "assigned_agent_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "converted_from_lead_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_status" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "board_votes" ADD CONSTRAINT "board_votes_decision_id_board_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."board_decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_leads_stage" ON "leads" USING btree ("pipeline_stage");--> statement-breakpoint
CREATE INDEX "idx_leads_assigned" ON "leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_leads_source" ON "leads" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_hierarchy_agent" ON "agent_hierarchy" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "idx_hierarchy_upline" ON "agent_hierarchy" USING btree ("direct_upline_id");--> statement-breakpoint
CREATE INDEX "idx_flags_agent" ON "compliance_flags" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "idx_flags_severity" ON "compliance_flags" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_flags_status" ON "compliance_flags" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_board_decisions_status" ON "board_decisions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_board_decisions_proposed_by" ON "board_decisions" USING btree ("proposed_by");--> statement-breakpoint
CREATE INDEX "idx_board_votes_decision" ON "board_votes" USING btree ("decision_id");--> statement-breakpoint
CREATE INDEX "idx_board_votes_voter" ON "board_votes" USING btree ("voter_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "board_votes_unique_voter_decision" ON "board_votes" USING btree ("decision_id","voter_user_id");--> statement-breakpoint
CREATE INDEX "idx_cap_table_holder_user" ON "cap_table_entries" USING btree ("holder_user_id");--> statement-breakpoint
CREATE INDEX "idx_cap_table_class" ON "cap_table_entries" USING btree ("share_class");--> statement-breakpoint
CREATE INDEX "idx_capital_allocations_period" ON "capital_allocations" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_capital_allocations_category" ON "capital_allocations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_capital_allocations_status" ON "capital_allocations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_founder_audit_created" ON "founder_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_founder_audit_actor" ON "founder_audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "idx_founder_audit_entity" ON "founder_audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_ma_pipeline_stage" ON "ma_pipeline_items" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "idx_ma_pipeline_owner" ON "ma_pipeline_items" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_ma_pipeline_kind" ON "ma_pipeline_items" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "idx_view_as_founder" ON "view_as_sessions" USING btree ("founder_user_id");--> statement-breakpoint
CREATE INDEX "idx_view_as_target" ON "view_as_sessions" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "idx_view_as_started" ON "view_as_sessions" USING btree ("started_at");
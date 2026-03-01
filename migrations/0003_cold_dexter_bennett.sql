CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"author" varchar(255) DEFAULT 'Heritage Team' NOT NULL,
	"featured_image" text,
	"read_time_minutes" integer DEFAULT 5,
	"is_featured" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"scheduled_at" timestamp,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"meta_keywords" text,
	"og_image" text,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"title" varchar(500),
	"content" text NOT NULL,
	"metadata" text,
	"change_description" text,
	"changed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"slug" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "faqs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"page_type" varchar(100) NOT NULL,
	"parent_page" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "import_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"file_name" text,
	"total_rows" integer DEFAULT 0,
	"imported_rows" integer DEFAULT 0,
	"skipped_rows" integer DEFAULT 0,
	"error_rows" integer DEFAULT 0,
	"source" text DEFAULT 'import',
	"error_details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"old_status" text,
	"new_status" text,
	"performed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"street_address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"source" text DEFAULT 'website' NOT NULL,
	"source_id" text,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"coverage_type" text,
	"coverage_amount" text,
	"estimated_value" integer,
	"assigned_to" text,
	"next_follow_up" timestamp,
	"last_contacted_at" timestamp,
	"lost_reason" text,
	"won_amount" integer,
	"won_date" timestamp,
	"notes" text,
	"lead_score" integer DEFAULT 0,
	"score_tier" varchar(20),
	"close_probability" integer DEFAULT 0,
	"pipeline_stage" varchar(50) DEFAULT 'new',
	"expected_close_date" date,
	"enrichment_data" jsonb,
	"tags" text[],
	"contact_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"source" text DEFAULT 'blog',
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"type" text DEFAULT 'string' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"label" text,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"company" text,
	"location" text,
	"photo_url" text,
	"quote" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"category" text,
	"product_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"show_on_homepage" boolean DEFAULT false NOT NULL,
	"show_on_product_pages" boolean DEFAULT true NOT NULL,
	"date_received" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_avatars" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"domain_expertise" json DEFAULT '[]'::json NOT NULL,
	"speaking_style" text NOT NULL,
	"debate_style" text DEFAULT 'analytical' NOT NULL,
	"response_priority" integer DEFAULT 5 NOT NULL,
	"system_prompt" text NOT NULL,
	"avatar_image_url" text,
	"voice_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_avatars_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "avatar_knowledge_bases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatar_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"intent_classification" json,
	"avatar_selection_reasoning" text,
	"tokens_in" integer,
	"tokens_out" integer,
	"latency_ms" integer,
	"error_message" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatar_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"role" text NOT NULL,
	"avatar_id" varchar,
	"content" text NOT NULL,
	"tokens_used" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatar_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mode" text DEFAULT 'single' NOT NULL,
	"avatars_used" json DEFAULT '[]'::json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "debate_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"topic" text NOT NULL,
	"avatar1_id" varchar NOT NULL,
	"avatar2_id" varchar NOT NULL,
	"participant_ids" json,
	"current_turn" integer DEFAULT 1 NOT NULL,
	"max_turns" integer DEFAULT 6 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"executive_summary" text,
	"key_consensus" json,
	"unresolved_points" json,
	"avatar1_key_points" json,
	"avatar2_key_points" json
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar NOT NULL,
	"content" text NOT NULL,
	"embedding" json,
	"chunk_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_base_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"file_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" varchar(100) NOT NULL,
	"tier" integer NOT NULL,
	"config" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_configurations_agent_name_unique" UNIQUE("agent_name")
);
--> statement-breakpoint
CREATE TABLE "agent_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" varchar(100) NOT NULL,
	"error_type" varchar(100),
	"error_message" text NOT NULL,
	"stack_trace" text,
	"event_id" varchar(100),
	"resolved" boolean DEFAULT false,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"target_calls" integer,
	"target_appointments" integer,
	"target_policies" integer,
	"target_premium" numeric(12, 2),
	"current_calls" integer DEFAULT 0,
	"current_appointments" integer DEFAULT 0,
	"current_policies" integer DEFAULT 0,
	"current_premium" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_hierarchy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"direct_upline_id" uuid,
	"hierarchy_level" integer DEFAULT 5 NOT NULL,
	"hierarchy_title" varchar(100),
	"upline_chain" jsonb DEFAULT '[]'::jsonb,
	"override_eligible" boolean DEFAULT false,
	"override_percentage" numeric(5, 2),
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_hierarchy_agent_user_id_unique" UNIQUE("agent_user_id")
);
--> statement-breakpoint
CREATE TABLE "agent_performance_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"calls_made" integer DEFAULT 0,
	"calls_connected" integer DEFAULT 0,
	"emails_sent" integer DEFAULT 0,
	"appointments_set" integer DEFAULT 0,
	"appointments_kept" integer DEFAULT 0,
	"leads_assigned" integer DEFAULT 0,
	"leads_contacted" integer DEFAULT 0,
	"quotes_sent" integer DEFAULT 0,
	"applications_submitted" integer DEFAULT 0,
	"policies_sold" integer DEFAULT 0,
	"premium_sold" numeric(12, 2) DEFAULT '0',
	"commissions_earned" numeric(12, 2) DEFAULT '0',
	"performance_score" integer,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"leads_created" integer DEFAULT 0,
	"leads_contacted" integer DEFAULT 0,
	"appointments_set" integer DEFAULT 0,
	"policies_sold" integer DEFAULT 0,
	"total_premium" numeric(12, 2) DEFAULT '0',
	"total_commissions" numeric(12, 2) DEFAULT '0',
	"calls_made" integer DEFAULT 0,
	"emails_sent" integer DEFAULT 0,
	"sms_sent" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar,
	"agent_user_id" uuid,
	"client_user_id" uuid,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"timezone" varchar(100) DEFAULT 'America/Chicago',
	"title" varchar(255) NOT NULL,
	"description" text,
	"meeting_type" varchar(50) DEFAULT 'discovery',
	"location" varchar(500),
	"meeting_link" varchar(500),
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"confirmed_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp,
	"google_event_id" varchar(255),
	"outcome" text,
	"next_steps" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"trigger_type" varchar(100) NOT NULL,
	"trigger_conditions" jsonb,
	"actions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"run_count" integer DEFAULT 0,
	"last_run_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_recording_id" uuid NOT NULL,
	"summary" text,
	"key_moments" jsonb DEFAULT '[]'::jsonb,
	"objections_mentioned" jsonb DEFAULT '[]'::jsonb,
	"competitors_mentioned" jsonb DEFAULT '[]'::jsonb,
	"overall_score" integer,
	"rapport_score" integer,
	"discovery_score" integer,
	"presentation_score" integer,
	"closing_score" integer,
	"suggestions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar,
	"agent_user_id" uuid,
	"direction" varchar(10) NOT NULL,
	"phone_number" varchar(50),
	"duration" integer,
	"status" varchar(50) NOT NULL,
	"twilio_sid" varchar(100),
	"recording_url" varchar(500),
	"transcription" text,
	"sentiment" varchar(50),
	"is_analyzed" boolean DEFAULT false,
	"called_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(100) NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"target_leads" integer,
	"target_conversions" integer,
	"budget" numeric(10, 2),
	"actual_leads" integer DEFAULT 0,
	"actual_conversions" integer DEFAULT 0,
	"actual_spend" numeric(10, 2) DEFAULT '0',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid NOT NULL,
	"claimant_user_id" uuid,
	"claim_number" varchar(50),
	"claim_type" varchar(100) NOT NULL,
	"claim_amount" numeric(12, 2),
	"status" varchar(50) DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"approved_at" timestamp,
	"paid_at" timestamp,
	"denied_at" timestamp,
	"denial_reason" text,
	"documents_required" jsonb DEFAULT '[]'::jsonb,
	"documents_received" jsonb DEFAULT '[]'::jsonb,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
CREATE TABLE "coaching_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"coach_user_id" uuid NOT NULL,
	"call_recording_id" uuid,
	"session_date" date,
	"strengths" text,
	"areas_for_improvement" text,
	"action_items" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"next_session_date" date,
	"goals_met" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_user_id" uuid NOT NULL,
	"policy_id" uuid,
	"lead_id" varchar,
	"commission_type" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"percentage" numeric(5, 2),
	"premium_amount" numeric(10, 2),
	"policy_year" integer DEFAULT 1,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"earned_at" timestamp,
	"paid_at" timestamp,
	"payment_reference" varchar(100),
	"chargeback_at" timestamp,
	"chargeback_reason" text,
	"upline_agent_id" uuid,
	"override_level" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id_1" uuid NOT NULL,
	"user_id_2" uuid NOT NULL,
	"relationship_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dead_letter_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(100) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"source_agent" varchar(100),
	"payload" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_retry_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_sequence_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"lead_id" varchar NOT NULL,
	"current_step" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"next_send_at" timestamp,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"unsubscribed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"trigger_event" varchar(100),
	"steps" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"body_html" text NOT NULL,
	"body_text" text,
	"category" varchar(100),
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails_sent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar,
	"from_agent_id" uuid,
	"template_id" uuid,
	"sequence_id" uuid,
	"enrollment_id" uuid,
	"to_email" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"body_html" text,
	"message_id" varchar(255),
	"status" varchar(50) DEFAULT 'sent' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"bounced_at" timestamp,
	"bounce_reason" text,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar,
	"ticket_id" uuid,
	"policy_id" uuid,
	"reason" text NOT NULL,
	"source_agent" varchar(100),
	"urgency" varchar(50) DEFAULT 'normal' NOT NULL,
	"assigned_to" uuid,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"resolution" text,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_bus_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" varchar(100) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"source_agent" varchar(100) NOT NULL,
	"payload" jsonb,
	"tier" integer,
	"priority" varchar(20),
	"correlation_id" varchar(100),
	"causation_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executive_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"mtd_revenue" numeric(12, 2) DEFAULT '0',
	"ytd_revenue" numeric(12, 2) DEFAULT '0',
	"previous_month_revenue" numeric(12, 2),
	"mtd_policies" integer DEFAULT 0,
	"ytd_policies" integer DEFAULT 0,
	"active_agents" integer DEFAULT 0,
	"top_performer_id" uuid,
	"pipeline_value" numeric(12, 2) DEFAULT '0',
	"qualified_leads" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"provider" varchar(100) NOT NULL,
	"credentials" jsonb,
	"settings" jsonb,
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "integration_configs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "marketing_spend" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"category" varchar(100) NOT NULL,
	"vendor" varchar(255),
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"spent_at" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_payment_method_id" varchar(100),
	"type" varchar(50) NOT NULL,
	"last4" varchar(4),
	"brand" varchar(50),
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar,
	"agent_user_id" uuid,
	"quote_number" varchar(50),
	"carrier" varchar(100) NOT NULL,
	"product_type" varchar(100) NOT NULL,
	"coverage_amount" integer NOT NULL,
	"monthly_premium" numeric(10, 2) NOT NULL,
	"annual_premium" numeric(10, 2),
	"term" integer,
	"risk_class" varchar(50),
	"health_category" varchar(50),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"expires_at" timestamp,
	"presentation_notes" text,
	"competitor_quotes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_quote_number_unique" UNIQUE("quote_number")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_user_id" uuid NOT NULL,
	"referred_lead_id" varchar,
	"referred_policy_id" uuid,
	"referred_name" varchar(255),
	"referred_email" varchar(255),
	"referred_phone" varchar(50),
	"relationship" varchar(100),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"reward_type" varchar(100),
	"reward_amount" numeric(10, 2),
	"reward_paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"converted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "revenue_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"forecast_date" date NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"predicted_premium" numeric(12, 2),
	"predicted_commissions" numeric(12, 2),
	"predicted_policies" integer,
	"confidence_level" numeric(5, 2),
	"actual_premium" numeric(12, 2),
	"actual_commissions" numeric(12, 2),
	"actual_policies" integer,
	"model_version" varchar(50),
	"factors" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_user_id" uuid,
	"platform" varchar(50) NOT NULL,
	"platform_review_id" varchar(255),
	"platform_url" varchar(500),
	"rating" integer NOT NULL,
	"review_text" text,
	"reviewer_name" varchar(255),
	"response_text" text,
	"responded_at" timestamp,
	"responded_by" uuid,
	"is_verified" boolean DEFAULT false,
	"is_displayed" boolean DEFAULT true,
	"reviewed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"schedule" varchar(50) NOT NULL,
	"recipients" jsonb DEFAULT '[]'::jsonb,
	"filters" jsonb,
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"product_type" varchar(100),
	"content" text NOT NULL,
	"branches" jsonb,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"success_rate" numeric(5, 2),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource" varchar(255) NOT NULL,
	"entity_id" varchar(100),
	"result" varchar(20) NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar,
	"agent_user_id" uuid,
	"platform" varchar(50) NOT NULL,
	"platform_message_id" varchar(255),
	"platform_user_id" varchar(255),
	"direction" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid,
	"content" text NOT NULL,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"platform" varchar(50) NOT NULL,
	"platform_post_id" varchar(255),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"published_at" timestamp,
	"failed_at" timestamp,
	"failure_reason" text,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"reach" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_to" uuid,
	"ticket_number" varchar(50),
	"subject" varchar(500) NOT NULL,
	"category" varchar(100),
	"priority" varchar(50) DEFAULT 'normal',
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"first_response_at" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"satisfaction_rating" integer,
	"satisfaction_comment" text,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(20) NOT NULL,
	"source" varchar(100),
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"push_notifications" boolean DEFAULT true,
	"digest_frequency" varchar(20) DEFAULT 'daily',
	"theme" varchar(20) DEFAULT 'light',
	"language" varchar(10) DEFAULT 'en',
	"custom_settings" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "app_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100) NOT NULL,
	"resource_id" varchar(100),
	"status" varchar(20) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"success" boolean NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_token" varchar(255) NOT NULL,
	"platform" varchar(10) NOT NULL,
	"device_name" varchar(100),
	"app_version" varchar(20),
	"os_version" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_executions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"automation_id" varchar NOT NULL,
	"status" varchar(20) NOT NULL,
	"triggered_by" jsonb,
	"condition_results" jsonb,
	"action_results" jsonb,
	"error_message" text,
	"error_details" jsonb,
	"duration" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "automations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"trigger_type" varchar(50) NOT NULL,
	"trigger_config" jsonb NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"executed_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"last_executed_at" timestamp,
	"next_execution_at" timestamp,
	"template_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'sales_agent' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "apple_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar(100) DEFAULT 'America/Chicago';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_knowledge_bases" ADD CONSTRAINT "avatar_knowledge_bases_avatar_id_ai_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."ai_avatars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_logs" ADD CONSTRAINT "avatar_logs_session_id_avatar_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."avatar_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_messages" ADD CONSTRAINT "avatar_messages_session_id_avatar_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."avatar_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_messages" ADD CONSTRAINT "avatar_messages_avatar_id_ai_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."ai_avatars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatar_sessions" ADD CONSTRAINT "avatar_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_sessions" ADD CONSTRAINT "debate_sessions_session_id_avatar_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."avatar_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_sessions" ADD CONSTRAINT "debate_sessions_avatar1_id_ai_avatars_id_fk" FOREIGN KEY ("avatar1_id") REFERENCES "public"."ai_avatars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_sessions" ADD CONSTRAINT "debate_sessions_avatar2_id_ai_avatars_id_fk" FOREIGN KEY ("avatar2_id") REFERENCES "public"."ai_avatars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_document_id_knowledge_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."knowledge_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_knowledge_base_id_avatar_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."avatar_knowledge_bases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_errors" ADD CONSTRAINT "agent_errors_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_goals" ADD CONSTRAINT "agent_goals_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_hierarchy" ADD CONSTRAINT "agent_hierarchy_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_hierarchy" ADD CONSTRAINT "agent_hierarchy_direct_upline_id_users_id_fk" FOREIGN KEY ("direct_upline_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_performance_snapshots" ADD CONSTRAINT "agent_performance_snapshots_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_analysis" ADD CONSTRAINT "call_analysis_call_recording_id_call_recordings_id_fk" FOREIGN KEY ("call_recording_id") REFERENCES "public"."call_recordings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_claimant_user_id_users_id_fk" FOREIGN KEY ("claimant_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_notes" ADD CONSTRAINT "coaching_notes_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_notes" ADD CONSTRAINT "coaching_notes_coach_user_id_users_id_fk" FOREIGN KEY ("coach_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_upline_agent_id_users_id_fk" FOREIGN KEY ("upline_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_relationships" ADD CONSTRAINT "contact_relationships_user_id_1_users_id_fk" FOREIGN KEY ("user_id_1") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_relationships" ADD CONSTRAINT "contact_relationships_user_id_2_users_id_fk" FOREIGN KEY ("user_id_2") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_sequence_id_email_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."email_sequences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequence_enrollments" ADD CONSTRAINT "email_sequence_enrollments_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_sequences" ADD CONSTRAINT "email_sequences_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_from_agent_id_users_id_fk" FOREIGN KEY ("from_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_sequence_id_email_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."email_sequences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails_sent" ADD CONSTRAINT "emails_sent_enrollment_id_email_sequence_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."email_sequence_enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executive_snapshots" ADD CONSTRAINT "executive_snapshots_top_performer_id_users_id_fk" FOREIGN KEY ("top_performer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_spend" ADD CONSTRAINT "marketing_spend_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_lead_id_leads_id_fk" FOREIGN KEY ("referred_lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_policy_id_policies_id_fk" FOREIGN KEY ("referred_policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_messages" ADD CONSTRAINT "social_messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_messages" ADD CONSTRAINT "social_messages_agent_user_id_users_id_fk" FOREIGN KEY ("agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_blog_posts_status" ON "blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_blog_posts_category" ON "blog_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_blog_posts_published_at" ON "blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_revisions_content" ON "content_revisions" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "idx_revisions_created" ON "content_revisions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_faqs_category" ON "faqs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_faqs_status" ON "faqs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_faqs_sort_order" ON "faqs" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_pages_slug" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_pages_parent" ON "pages" USING btree ("parent_page");--> statement-breakpoint
CREATE INDEX "idx_pages_status" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_leads_assigned_to" ON "leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_leads_pipeline_stage" ON "leads" USING btree ("pipeline_stage");--> statement-breakpoint
CREATE INDEX "idx_leads_lead_score" ON "leads" USING btree ("lead_score");--> statement-breakpoint
CREATE INDEX "idx_leads_next_follow_up" ON "leads" USING btree ("next_follow_up");--> statement-breakpoint
CREATE INDEX "idx_agent_errors_agent_name" ON "agent_errors" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "idx_agent_errors_resolved" ON "agent_errors" USING btree ("resolved");--> statement-breakpoint
CREATE INDEX "idx_agent_errors_created_at" ON "agent_errors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_hierarchy_agent_user_id" ON "agent_hierarchy" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "idx_hierarchy_direct_upline_id" ON "agent_hierarchy" USING btree ("direct_upline_id");--> statement-breakpoint
CREATE INDEX "idx_hierarchy_level" ON "agent_hierarchy" USING btree ("hierarchy_level");--> statement-breakpoint
CREATE INDEX "idx_appointments_lead_id" ON "appointments" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_agent_user_id" ON "appointments" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_scheduled_at" ON "appointments" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_appointments_status" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_claims_policy_id" ON "claims" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "idx_claims_claimant_user_id" ON "claims" USING btree ("claimant_user_id");--> statement-breakpoint
CREATE INDEX "idx_commissions_agent_user_id" ON "commissions" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "idx_commissions_policy_id" ON "commissions" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "idx_commissions_status" ON "commissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_enrollments_next_send" ON "email_sequence_enrollments" USING btree ("next_send_at");--> statement-breakpoint
CREATE INDEX "idx_enrollments_status" ON "email_sequence_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_emails_sent_lead_id" ON "emails_sent" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_emails_sent_from_agent_id" ON "emails_sent" USING btree ("from_agent_id");--> statement-breakpoint
CREATE INDEX "idx_escalations_status_urgency" ON "escalations" USING btree ("status","urgency");--> statement-breakpoint
CREATE INDEX "idx_event_bus_event_type" ON "event_bus_audit_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_event_bus_source_agent" ON "event_bus_audit_log" USING btree ("source_agent");--> statement-breakpoint
CREATE INDEX "idx_event_bus_created_at" ON "event_bus_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quotes_lead_id" ON "quotes" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_quotes_agent_user_id" ON "quotes" USING btree ("agent_user_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_referrer_user_id" ON "referrals" USING btree ("referrer_user_id");--> statement-breakpoint
CREATE INDEX "idx_system_logs_level" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_system_logs_created_at" ON "system_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_resource" ON "audit_logs" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_email" ON "login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_ip" ON "login_attempts" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_login_attempts_created" ON "login_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_password_reset_user" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_token" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_user_devices_user" ON "user_devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_devices_token" ON "user_devices" USING btree ("device_token");--> statement-breakpoint
CREATE INDEX "idx_executions_automation_id" ON "automation_executions" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "idx_executions_status" ON "automation_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_executions_started_at" ON "automation_executions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_automations_agent_id" ON "automations" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_automations_enabled" ON "automations" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "idx_automations_trigger_type" ON "automations" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "idx_automations_next_execution" ON "automations" USING btree ("next_execution_at");
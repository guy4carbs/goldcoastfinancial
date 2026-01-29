CREATE TABLE "agent_assessment_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assessment_id" varchar NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"auto_failed" boolean DEFAULT false,
	"auto_fail_reason" varchar,
	"time_spent_minutes" integer,
	"attempt_number" integer DEFAULT 1,
	"answers" jsonb,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"certification_id" varchar NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"certificate_number" varchar,
	"pdf_url" varchar,
	CONSTRAINT "agent_certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "agent_simulation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scenario_id" varchar NOT NULL,
	"score_breakdown" jsonb,
	"total_score" integer,
	"passed" boolean,
	"path_taken" jsonb,
	"feedback" jsonb,
	"audio_url" varchar,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_training_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"module_id" varchar NOT NULL,
	"status" varchar DEFAULT 'not_started' NOT NULL,
	"progress_percent" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_position" jsonb,
	"time_spent_minutes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" varchar NOT NULL,
	"source_type" varchar,
	"source_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_assessment_results" ADD CONSTRAINT "agent_assessment_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_certificates" ADD CONSTRAINT "agent_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_simulation_results" ADD CONSTRAINT "agent_simulation_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_training_progress" ADD CONSTRAINT "agent_training_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_xp_transactions" ADD CONSTRAINT "agent_xp_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
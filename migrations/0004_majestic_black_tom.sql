CREATE TABLE "agent_licenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"state_code" varchar(2) NOT NULL,
	"license_number" text,
	"license_type" text DEFAULT 'life_health',
	"status" text DEFAULT 'active' NOT NULL,
	"effective_date" date,
	"expiration_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_territories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"state_code" varchar(2) NOT NULL,
	"is_primary" boolean DEFAULT false,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "member_cards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_card_number" varchar(20) NOT NULL,
	"member_id" varchar NOT NULL,
	"agent_id" varchar NOT NULL,
	"lead_id" varchar,
	"member_full_name" text NOT NULL,
	"member_email" text NOT NULL,
	"member_phone" text,
	"insurance_carrier" varchar(50) NOT NULL,
	"insurance_carrier_other" text,
	"policy_number" varchar(50) NOT NULL,
	"policy_type" varchar(30) NOT NULL,
	"coverage_amount" numeric(12, 2) NOT NULL,
	"monthly_premium" numeric(10, 2) NOT NULL,
	"effective_date" date NOT NULL,
	"term_length" varchar(20),
	"expiration_date" date,
	"coverage_type" varchar(20) DEFAULT 'individual' NOT NULL,
	"beneficiary_name" text NOT NULL,
	"beneficiary_relationship" varchar(30),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"group_number" varchar(20) NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "member_cards_member_card_number_unique" UNIQUE("member_card_number")
);
--> statement-breakpoint
CREATE INDEX "idx_agent_licenses_user_id" ON "agent_licenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_licenses_state" ON "agent_licenses" USING btree ("state_code");--> statement-breakpoint
CREATE INDEX "idx_agent_licenses_status" ON "agent_licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_agent_territories_user_id" ON "agent_territories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_agent_territories_state" ON "agent_territories" USING btree ("state_code");--> statement-breakpoint
CREATE INDEX "idx_member_cards_member" ON "member_cards" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "idx_member_cards_agent" ON "member_cards" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_member_cards_status" ON "member_cards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_member_cards_number" ON "member_cards" USING btree ("member_card_number");
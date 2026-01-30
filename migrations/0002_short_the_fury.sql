CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"event_params" text,
	"page" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"title" text,
	"referrer" text,
	"user_agent" text,
	"screen_width" text,
	"screen_height" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

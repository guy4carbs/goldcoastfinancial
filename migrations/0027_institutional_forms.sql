-- Institutional + newsletter public lead-capture tables.
-- These were defined in shared/schema.ts (institutionalContacts,
-- institutionalMeetings, partnershipQuizSubmissions, newsletterSubscriptions)
-- but no migration ever created them, so every public form submission 500'd
-- with `relation "..." does not exist`. Idempotent (IF NOT EXISTS); columns
-- mirror the Drizzle definitions exactly.

CREATE TABLE IF NOT EXISTS institutional_contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'contact_form',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutional_meetings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partnership_quiz_submissions (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_type TEXT NOT NULL,
  annual_revenue TEXT,
  employee_count TEXT,
  partnership_interest TEXT NOT NULL,
  timeline TEXT,
  additional_info TEXT,
  score TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscription_type TEXT DEFAULT 'institutional',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

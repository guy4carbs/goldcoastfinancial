/**
 * Enterprise Migration Script
 * Safely applies enterprise tables without failing on existing tables
 */

import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tables to create (only enterprise tables from enterprise.ts)
const enterpriseTables = [
  // Appointments
  `CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id varchar,
    agent_user_id uuid,
    client_user_id uuid,
    scheduled_at timestamp NOT NULL,
    duration integer DEFAULT 30 NOT NULL,
    timezone varchar(100) DEFAULT 'America/Chicago',
    title varchar(255) NOT NULL,
    description text,
    meeting_type varchar(50) DEFAULT 'discovery',
    location varchar(500),
    meeting_link varchar(500),
    status varchar(50) DEFAULT 'scheduled' NOT NULL,
    confirmed_at timestamp,
    completed_at timestamp,
    cancelled_at timestamp,
    cancellation_reason text,
    reminder_sent boolean DEFAULT false,
    reminder_sent_at timestamp,
    google_event_id varchar(255),
    outcome text,
    next_steps text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Quotes
  `CREATE TABLE IF NOT EXISTS quotes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id varchar,
    agent_user_id uuid,
    quote_number varchar(50) UNIQUE,
    carrier varchar(100) NOT NULL,
    product_type varchar(100) NOT NULL,
    coverage_amount integer NOT NULL,
    monthly_premium numeric(10, 2) NOT NULL,
    annual_premium numeric(10, 2),
    term integer,
    risk_class varchar(50),
    health_category varchar(50),
    status varchar(50) DEFAULT 'draft' NOT NULL,
    sent_at timestamp,
    viewed_at timestamp,
    expires_at timestamp,
    presentation_notes text,
    competitor_quotes jsonb,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Commissions
  `CREATE TABLE IF NOT EXISTS commissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_user_id uuid NOT NULL,
    policy_id uuid,
    lead_id varchar,
    commission_type varchar(50) NOT NULL,
    amount numeric(10, 2) NOT NULL,
    percentage numeric(5, 2),
    premium_amount numeric(10, 2),
    policy_year integer DEFAULT 1,
    status varchar(50) DEFAULT 'pending' NOT NULL,
    earned_at timestamp,
    paid_at timestamp,
    payment_reference varchar(100),
    chargeback_at timestamp,
    chargeback_reason text,
    upline_agent_id uuid,
    override_level integer,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Email Templates
  `CREATE TABLE IF NOT EXISTS email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    subject varchar(500) NOT NULL,
    body_html text NOT NULL,
    body_text text,
    category varchar(100),
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Email Sequences
  `CREATE TABLE IF NOT EXISTS email_sequences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    trigger_event varchar(100),
    steps jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Email Sequence Enrollments
  `CREATE TABLE IF NOT EXISTS email_sequence_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id uuid NOT NULL,
    lead_id varchar NOT NULL,
    current_step integer DEFAULT 0,
    status varchar(50) DEFAULT 'active' NOT NULL,
    next_send_at timestamp,
    enrolled_at timestamp DEFAULT now() NOT NULL,
    completed_at timestamp,
    unsubscribed_at timestamp
  )`,

  // Emails Sent
  `CREATE TABLE IF NOT EXISTS emails_sent (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id varchar,
    from_agent_id uuid,
    template_id uuid,
    sequence_id uuid,
    enrollment_id uuid,
    to_email varchar(255) NOT NULL,
    subject varchar(500) NOT NULL,
    body_html text,
    message_id varchar(255),
    status varchar(50) DEFAULT 'sent' NOT NULL,
    sent_at timestamp DEFAULT now() NOT NULL,
    delivered_at timestamp,
    opened_at timestamp,
    clicked_at timestamp,
    bounced_at timestamp,
    bounce_reason text,
    open_count integer DEFAULT 0,
    click_count integer DEFAULT 0
  )`,

  // Automation Rules
  `CREATE TABLE IF NOT EXISTS automation_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    trigger_type varchar(100) NOT NULL,
    trigger_conditions jsonb,
    actions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    run_count integer DEFAULT 0,
    last_run_at timestamp,
    created_by uuid,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Claims
  `CREATE TABLE IF NOT EXISTS claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id uuid NOT NULL,
    claimant_user_id uuid,
    claim_number varchar(50) UNIQUE,
    claim_type varchar(100) NOT NULL,
    claim_amount numeric(12, 2),
    status varchar(50) DEFAULT 'submitted' NOT NULL,
    submitted_at timestamp DEFAULT now() NOT NULL,
    reviewed_at timestamp,
    approved_at timestamp,
    paid_at timestamp,
    denied_at timestamp,
    denial_reason text,
    documents_required jsonb DEFAULT '[]'::jsonb,
    documents_received jsonb DEFAULT '[]'::jsonb,
    internal_notes text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Support Tickets
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    assigned_to uuid,
    ticket_number varchar(50) UNIQUE,
    subject varchar(500) NOT NULL,
    category varchar(100),
    priority varchar(50) DEFAULT 'normal',
    status varchar(50) DEFAULT 'open' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    first_response_at timestamp,
    resolved_at timestamp,
    closed_at timestamp,
    satisfaction_rating integer,
    satisfaction_comment text
  )`,

  // Support Ticket Messages
  `CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    is_internal boolean DEFAULT false,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Referrals
  `CREATE TABLE IF NOT EXISTS referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id uuid NOT NULL,
    referred_lead_id varchar,
    referred_policy_id uuid,
    referred_name varchar(255),
    referred_email varchar(255),
    referred_phone varchar(50),
    relationship varchar(100),
    status varchar(50) DEFAULT 'pending' NOT NULL,
    reward_type varchar(100),
    reward_amount numeric(10, 2),
    reward_paid_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL,
    converted_at timestamp
  )`,

  // Social Posts
  `CREATE TABLE IF NOT EXISTS social_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid,
    content text NOT NULL,
    media_urls jsonb DEFAULT '[]'::jsonb,
    platform varchar(50) NOT NULL,
    platform_post_id varchar(255),
    status varchar(50) DEFAULT 'draft' NOT NULL,
    scheduled_for timestamp,
    published_at timestamp,
    failed_at timestamp,
    failure_reason text,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    reach integer DEFAULT 0,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Social Messages
  `CREATE TABLE IF NOT EXISTS social_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id varchar,
    agent_user_id uuid,
    platform varchar(50) NOT NULL,
    platform_message_id varchar(255),
    platform_user_id varchar(255),
    direction varchar(10) NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    responded_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Reviews
  `CREATE TABLE IF NOT EXISTS reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id uuid,
    platform varchar(50) NOT NULL,
    platform_review_id varchar(255),
    platform_url varchar(500),
    rating integer NOT NULL,
    review_text text,
    reviewer_name varchar(255),
    response_text text,
    responded_at timestamp,
    responded_by uuid,
    is_verified boolean DEFAULT false,
    is_displayed boolean DEFAULT true,
    reviewed_at timestamp NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Campaigns
  `CREATE TABLE IF NOT EXISTS campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    type varchar(100) NOT NULL,
    start_date date,
    end_date date,
    status varchar(50) DEFAULT 'draft' NOT NULL,
    target_leads integer,
    target_conversions integer,
    budget numeric(10, 2),
    actual_leads integer DEFAULT 0,
    actual_conversions integer DEFAULT 0,
    actual_spend numeric(10, 2) DEFAULT '0',
    created_by uuid,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Marketing Spend
  `CREATE TABLE IF NOT EXISTS marketing_spend (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid,
    category varchar(100) NOT NULL,
    vendor varchar(255),
    description text,
    amount numeric(10, 2) NOT NULL,
    spent_at date NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Escalations
  `CREATE TABLE IF NOT EXISTS escalations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id varchar,
    ticket_id uuid,
    policy_id uuid,
    reason text NOT NULL,
    source_agent varchar(100),
    urgency varchar(50) DEFAULT 'normal' NOT NULL,
    assigned_to uuid,
    status varchar(50) DEFAULT 'open' NOT NULL,
    resolution text,
    resolved_at timestamp,
    resolved_by uuid,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Coaching Notes
  `CREATE TABLE IF NOT EXISTS coaching_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_user_id uuid NOT NULL,
    coach_user_id uuid NOT NULL,
    call_recording_id uuid,
    session_date date,
    strengths text,
    areas_for_improvement text,
    action_items jsonb DEFAULT '[]'::jsonb,
    notes text,
    next_session_date date,
    goals_met boolean,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Call Recordings
  `CREATE TABLE IF NOT EXISTS call_recordings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id varchar,
    agent_user_id uuid,
    direction varchar(10) NOT NULL,
    phone_number varchar(50),
    duration integer,
    status varchar(50) NOT NULL,
    twilio_sid varchar(100),
    recording_url varchar(500),
    transcription text,
    sentiment varchar(50),
    is_analyzed boolean DEFAULT false,
    called_at timestamp NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Call Analysis
  `CREATE TABLE IF NOT EXISTS call_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    call_recording_id uuid NOT NULL,
    summary text,
    key_moments jsonb DEFAULT '[]'::jsonb,
    objections_mentioned jsonb DEFAULT '[]'::jsonb,
    competitors_mentioned jsonb DEFAULT '[]'::jsonb,
    overall_score integer,
    rapport_score integer,
    discovery_score integer,
    presentation_score integer,
    closing_score integer,
    suggestions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Revenue Forecasts
  `CREATE TABLE IF NOT EXISTS revenue_forecasts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date date NOT NULL,
    period_type varchar(20) NOT NULL,
    predicted_premium numeric(12, 2),
    predicted_commissions numeric(12, 2),
    predicted_policies integer,
    confidence_level numeric(5, 2),
    actual_premium numeric(12, 2),
    actual_commissions numeric(12, 2),
    actual_policies integer,
    model_version varchar(50),
    factors jsonb,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Agent Performance Snapshots
  `CREATE TABLE IF NOT EXISTS agent_performance_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_user_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    period_type varchar(20) NOT NULL,
    calls_made integer DEFAULT 0,
    calls_connected integer DEFAULT 0,
    emails_sent integer DEFAULT 0,
    appointments_set integer DEFAULT 0,
    appointments_kept integer DEFAULT 0,
    leads_assigned integer DEFAULT 0,
    leads_contacted integer DEFAULT 0,
    quotes_sent integer DEFAULT 0,
    applications_submitted integer DEFAULT 0,
    policies_sold integer DEFAULT 0,
    premium_sold numeric(12, 2) DEFAULT '0',
    commissions_earned numeric(12, 2) DEFAULT '0',
    performance_score integer,
    rank integer,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Agent Goals
  `CREATE TABLE IF NOT EXISTS agent_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_user_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    target_calls integer,
    target_appointments integer,
    target_policies integer,
    target_premium numeric(12, 2),
    current_calls integer DEFAULT 0,
    current_appointments integer DEFAULT 0,
    current_policies integer DEFAULT 0,
    current_premium numeric(12, 2) DEFAULT '0',
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Event Bus Audit Log
  `CREATE TABLE IF NOT EXISTS event_bus_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id varchar(100) NOT NULL,
    event_type varchar(100) NOT NULL,
    source_agent varchar(100) NOT NULL,
    payload jsonb,
    tier integer,
    priority varchar(20),
    correlation_id varchar(100),
    causation_id varchar(100),
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Agent Configurations
  `CREATE TABLE IF NOT EXISTS agent_configurations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name varchar(100) UNIQUE NOT NULL,
    tier integer NOT NULL,
    config jsonb NOT NULL,
    is_enabled boolean DEFAULT true,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Agent Errors
  `CREATE TABLE IF NOT EXISTS agent_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name varchar(100) NOT NULL,
    error_type varchar(100),
    error_message text NOT NULL,
    stack_trace text,
    event_id varchar(100),
    resolved boolean DEFAULT false,
    resolved_at timestamp,
    resolved_by uuid,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Dead Letter Queue
  `CREATE TABLE IF NOT EXISTS dead_letter_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id varchar(100) NOT NULL,
    event_type varchar(100) NOT NULL,
    source_agent varchar(100),
    payload jsonb,
    error_message text,
    retry_count integer DEFAULT 0,
    status varchar(50) DEFAULT 'pending',
    created_at timestamp DEFAULT now() NOT NULL,
    last_retry_at timestamp
  )`,

  // Security Audit Log
  `CREATE TABLE IF NOT EXISTS security_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id varchar(100) NOT NULL,
    action varchar(100) NOT NULL,
    resource varchar(255) NOT NULL,
    entity_id varchar(100),
    result varchar(20) NOT NULL,
    reason text,
    metadata jsonb,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Analytics Snapshots
  `CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date date NOT NULL,
    period_type varchar(20) NOT NULL,
    leads_created integer DEFAULT 0,
    leads_contacted integer DEFAULT 0,
    appointments_set integer DEFAULT 0,
    policies_sold integer DEFAULT 0,
    total_premium numeric(12, 2) DEFAULT '0',
    total_commissions numeric(12, 2) DEFAULT '0',
    calls_made integer DEFAULT 0,
    emails_sent integer DEFAULT 0,
    sms_sent integer DEFAULT 0,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // System Logs
  `CREATE TABLE IF NOT EXISTS system_logs (
    id serial PRIMARY KEY,
    level varchar(20) NOT NULL,
    source varchar(100),
    message text NOT NULL,
    metadata jsonb,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Integration Configs
  `CREATE TABLE IF NOT EXISTS integration_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    provider varchar(100) NOT NULL,
    credentials jsonb,
    settings jsonb,
    is_active boolean DEFAULT true,
    last_sync_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Scheduled Reports
  `CREATE TABLE IF NOT EXISTS scheduled_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    report_type varchar(100) NOT NULL,
    schedule varchar(50) NOT NULL,
    recipients jsonb DEFAULT '[]'::jsonb,
    filters jsonb,
    is_active boolean DEFAULT true,
    last_run_at timestamp,
    next_run_at timestamp,
    created_by uuid,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // User Preferences
  `CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    push_notifications boolean DEFAULT true,
    digest_frequency varchar(20) DEFAULT 'daily',
    theme varchar(20) DEFAULT 'light',
    language varchar(10) DEFAULT 'en',
    custom_settings jsonb,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,

  // Payment Methods
  `CREATE TABLE IF NOT EXISTS payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    stripe_payment_method_id varchar(100),
    type varchar(50) NOT NULL,
    last4 varchar(4),
    brand varchar(50),
    expiry_month integer,
    expiry_year integer,
    is_default boolean DEFAULT false,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Contact Relationships
  `CREATE TABLE IF NOT EXISTS contact_relationships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 uuid NOT NULL,
    user_id_2 uuid NOT NULL,
    relationship_type varchar(50) NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Import History
  `CREATE TABLE IF NOT EXISTS import_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    import_type varchar(50) NOT NULL,
    file_name varchar(255),
    status varchar(50) NOT NULL,
    total_rows integer,
    successful_rows integer,
    failed_rows integer,
    errors jsonb,
    imported_by uuid,
    started_at timestamp,
    completed_at timestamp,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Executive Snapshots
  `CREATE TABLE IF NOT EXISTS executive_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date date NOT NULL,
    mtd_revenue numeric(12, 2) DEFAULT '0',
    ytd_revenue numeric(12, 2) DEFAULT '0',
    previous_month_revenue numeric(12, 2),
    mtd_policies integer DEFAULT 0,
    ytd_policies integer DEFAULT 0,
    active_agents integer DEFAULT 0,
    top_performer_id uuid,
    pipeline_value numeric(12, 2) DEFAULT '0',
    qualified_leads integer DEFAULT 0,
    created_at timestamp DEFAULT now() NOT NULL
  )`,

  // Scripts
  `CREATE TABLE IF NOT EXISTS scripts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    category varchar(100),
    product_type varchar(100),
    content text NOT NULL,
    branches jsonb,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    success_rate numeric(5, 2),
    created_by uuid,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
  )`,
];

// User column additions (with safety checks)
const userColumnAdditions = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(50) DEFAULT 'sales_agent' NOT NULL`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret varchar(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false NOT NULL`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url varchar(500)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone varchar(100) DEFAULT 'America/Chicago'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp`,
];

// Lead column additions (with safety checks)
const leadColumnAdditions = [
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_tier varchar(20)`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS close_probability integer DEFAULT 0`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage varchar(50) DEFAULT 'new'`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date date`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_data jsonb`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags text[]`,
  `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_count integer DEFAULT 0`,
];

// Critical indexes
const indexes = [
  `CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON appointments(lead_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_agent_user_id ON appointments(agent_user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at)`,
  `CREATE INDEX IF NOT EXISTS idx_commissions_agent_user_id ON commissions(agent_user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status)`,
  `CREATE INDEX IF NOT EXISTS idx_event_bus_event_type ON event_bus_audit_log(event_type)`,
  `CREATE INDEX IF NOT EXISTS idx_event_bus_created_at ON event_bus_audit_log(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level)`,
  `CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at)`,
];

async function runMigration() {
  console.log('🚀 Starting Enterprise Migration...\n');

  try {
    // Create enterprise tables
    console.log('📦 Creating enterprise tables...');
    let tablesCreated = 0;
    for (const sql of enterpriseTables) {
      try {
        await pool.query(sql);
        tablesCreated++;
      } catch (err: any) {
        if (err.code === '42P07') {
          // Table already exists - that's fine
          console.log(`  ⏭️  Table already exists, skipping`);
        } else {
          console.error(`  ❌ Error: ${err.message}`);
        }
      }
    }
    console.log(`  ✅ Tables processed: ${tablesCreated}/${enterpriseTables.length}\n`);

    // Add user columns
    console.log('👤 Adding user table columns...');
    for (const sql of userColumnAdditions) {
      try {
        await pool.query(sql);
        console.log('  ✅ Column added or exists');
      } catch (err: any) {
        if (err.code === '42701') {
          console.log('  ⏭️  Column already exists');
        } else {
          console.error(`  ❌ Error: ${err.message}`);
        }
      }
    }

    // Add lead columns
    console.log('\n📋 Adding lead table columns...');
    for (const sql of leadColumnAdditions) {
      try {
        await pool.query(sql);
        console.log('  ✅ Column added or exists');
      } catch (err: any) {
        if (err.code === '42701') {
          console.log('  ⏭️  Column already exists');
        } else {
          console.error(`  ❌ Error: ${err.message}`);
        }
      }
    }

    // Create indexes
    console.log('\n📊 Creating indexes...');
    for (const sql of indexes) {
      try {
        await pool.query(sql);
        console.log('  ✅ Index created or exists');
      } catch (err: any) {
        console.error(`  ❌ Error: ${err.message}`);
      }
    }

    // Count tables
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(`\n✅ Migration complete! Total tables: ${result.rows[0].count}`);

    // List all tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in database:');
    tables.rows.forEach((r: any) => console.log(`  - ${r.table_name}`));

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

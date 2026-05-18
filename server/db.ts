import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Shared connection pool. PgSession (express-session store) reads from this
// too — see server/routes.ts:setupSession. Previously routes.ts maintained
// its own separate `new Pool({...})` which gave us TWO pools sharing the
// same Neon DB and competing for the same connection budget; under load
// either pool could exhaust, leaving session lookups (and downstream
// attachUser DB calls) hanging indefinitely → Cloudflare returned its own
// HTML 502 → client saw `code=UNKNOWN`. Single pool, 20-connection budget,
// 5s timeout on individual connection acquisition so we fail fast instead
// of hanging the request.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: true,
});

// Prevent idle connection timeouts from crashing the process (Neon serverless)
pool.on('error', (err) => {
  if (err.message?.includes('terminating connection') || err.message?.includes('Connection terminated') || err.message?.includes('ECONNRESET') || (err as any).code === 'ECONNRESET') {
    console.warn('[DB] Connection recycled (Neon idle timeout) — pool will reconnect automatically');
  } else {
    console.error('[DB] Unexpected pool error:', err.message);
  }
});

export const db = drizzle(pool);

export async function initializeDatabase() {
  let client;
  let retries = 3;
  
  while (retries > 0) {
    try {
      client = await pool.connect();
      break;
    } catch (error) {
      retries--;
      console.log(`Database connection attempt failed, ${retries} retries left...`);
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!client) {
    throw new Error("Failed to connect to database after retries");
  }
  
  try {
    console.log("Initializing database tables...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        coverage_type TEXT NOT NULL,
        coverage_amount TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        street_address TEXT NOT NULL DEFAULT '',
        address_line2 TEXT,
        city TEXT NOT NULL DEFAULT '',
        state TEXT NOT NULL DEFAULT '',
        zip_code TEXT NOT NULL,
        height TEXT NOT NULL DEFAULT '',
        weight TEXT NOT NULL DEFAULT '',
        birth_date TEXT NOT NULL DEFAULT '',
        medical_background TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        policy_number VARCHAR NOT NULL UNIQUE,
        type VARCHAR NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'active',
        coverage_amount INTEGER NOT NULL,
        monthly_premium DECIMAL(10, 2) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        next_payment_date TIMESTAMP,
        beneficiary_name VARCHAR,
        beneficiary_relationship VARCHAR,
        beneficiaries JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS beneficiaries JSONB DEFAULT '[]';`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS agent_id UUID;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS lead_id VARCHAR;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS carrier VARCHAR;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS annual_premium DECIMAL(12,2);`);

    // Book of Business tracking columns
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS client_status VARCHAR(20) DEFAULT 'pending';`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS chargeback_at TIMESTAMP;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS chargeback_reason TEXT;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP;`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS draft_date VARCHAR(10);`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS notes TEXT;`);

    // Ensure agent_hierarchy has contract_level column
    await client.query(`ALTER TABLE agent_hierarchy ADD COLUMN IF NOT EXISTS contract_level DECIMAL(5,2) DEFAULT 65;`);

    // Commission records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS commission_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        policy_id UUID REFERENCES policies(id),
        deal_id UUID,
        agent_id UUID NOT NULL REFERENCES users(id),
        upline_agent_id UUID REFERENCES users(id),
        commission_type VARCHAR(30) NOT NULL DEFAULT 'personal',
        premium_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        contract_level DECIMAL(5,2) NOT NULL DEFAULT 0,
        override_spread DECIMAL(5,2) DEFAULT 0,
        commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        period_month INTEGER,
        period_year INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE commission_records ADD COLUMN IF NOT EXISTS deal_id UUID;`);
    await client.query(`ALTER TABLE deals ADD COLUMN IF NOT EXISTS product_type VARCHAR;`);
    await client.query(`ALTER TABLE deals ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);`);
    await client.query(`ALTER TABLE policies ADD COLUMN IF NOT EXISTS client_details JSONB DEFAULT '{}';`);

    // Agent policies — state-level policy tracking for the map widget
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_policies (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        state_code VARCHAR(2),
        policy_number TEXT,
        carrier TEXT,
        coverage_type TEXT DEFAULT 'term_life',
        status TEXT DEFAULT 'pending',
        client_name TEXT,
        premium_amount INTEGER DEFAULT 0,
        coverage_amount INTEGER DEFAULT 0,
        effective_date DATE,
        expiration_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_policies_user ON agent_policies (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_policies_state ON agent_policies (state_code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_policies_status ON agent_policies (status);`);

    // Pending deal profiles — deals submitted without BoB client
    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_deal_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_id UUID NOT NULL,
        agent_user_id UUID NOT NULL REFERENCES users(id),
        client_name VARCHAR(255),
        carrier VARCHAR(100),
        product_type VARCHAR(100),
        state_code VARCHAR(2),
        monthly_premium DECIMAL(10,2),
        annual_premium DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pending_profiles_agent ON pending_deal_profiles (agent_user_id, status);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        policy_id UUID REFERENCES policies(id),
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        file_size VARCHAR,
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        from_name VARCHAR NOT NULL,
        from_email VARCHAR,
        subject VARCHAR NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        is_from_client BOOLEAN DEFAULT FALSE,
        priority VARCHAR DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        title VARCHAR NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS billing_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        policy_id UUID REFERENCES policies(id),
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        payment_method VARCHAR,
        transaction_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_type VARCHAR NOT NULL,
        persona_name VARCHAR NOT NULL,
        persona_ethnicity VARCHAR NOT NULL,
        age_range_min INTEGER NOT NULL,
        age_range_max INTEGER NOT NULL,
        income_min INTEGER NOT NULL,
        income_max INTEGER NOT NULL,
        family_status VARCHAR NOT NULL,
        core_pain TEXT NOT NULL,
        primary_trigger TEXT NOT NULL,
        description TEXT,
        features JSONB DEFAULT '[]',
        coverage_amounts JSONB DEFAULT '[]',
        term_lengths JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quote_estimates (
        id SERIAL PRIMARY KEY,
        product_type VARCHAR NOT NULL,
        age_min INTEGER NOT NULL,
        age_max INTEGER NOT NULL,
        coverage_amount INTEGER NOT NULL,
        term_length VARCHAR,
        gender VARCHAR,
        smoker BOOLEAN DEFAULT FALSE,
        health_rating VARCHAR NOT NULL,
        monthly_rate DECIMAL(10, 2) NOT NULL,
        annual_rate DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ============================================
    // CMS TABLES
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        author VARCHAR(255) NOT NULL DEFAULT 'Heritage Team',
        featured_image TEXT,
        read_time_minutes INTEGER DEFAULT 5,
        is_featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        published_at TIMESTAMP,
        scheduled_at TIMESTAMP,
        meta_title VARCHAR(70),
        meta_description VARCHAR(160),
        meta_keywords TEXT,
        og_image TEXT,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_by UUID,
        updated_by UUID
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        slug VARCHAR(255) UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_by UUID,
        updated_by UUID
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs (category);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs (sort_order);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        page_type VARCHAR(100) NOT NULL,
        parent_page VARCHAR(100),
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        published_at TIMESTAMP,
        meta_title VARCHAR(70),
        meta_description VARCHAR(160),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_by UUID,
        updated_by UUID
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages (slug);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages (parent_page);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pages_status ON pages (status);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS content_revisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_type VARCHAR(50) NOT NULL,
        content_id UUID NOT NULL,
        revision_number INTEGER NOT NULL,
        title VARCHAR(500),
        content TEXT NOT NULL,
        metadata TEXT,
        change_description TEXT,
        changed_by UUID,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_revisions_content ON content_revisions (content_type, content_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_revisions_created ON content_revisions (created_at);
    `);

    // ============================================
    // CRM / LEAD PIPELINE TABLES
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        street_address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        source TEXT NOT NULL DEFAULT 'website',
        source_id TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        priority TEXT NOT NULL DEFAULT 'medium',
        coverage_type TEXT,
        coverage_amount TEXT,
        estimated_value INTEGER,
        assigned_to TEXT,
        next_follow_up TIMESTAMP,
        last_contacted_at TIMESTAMP,
        lost_reason TEXT,
        won_amount INTEGER,
        won_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads (priority);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads (next_follow_up);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        old_status TEXT,
        new_status TEXT,
        performed_by TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities (lead_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities (created_at);
    `);

    // ============================================
    // SITE SETTINGS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        type TEXT NOT NULL DEFAULT 'string',
        category TEXT NOT NULL DEFAULT 'general',
        label TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings (key);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings (category);
    `);

    // Insert default settings if they don't exist
    await client.query(`
      INSERT INTO site_settings (key, value, type, category, label, description) VALUES
        -- General Settings
        ('company_name', 'HERITAGE', 'string', 'general', 'Company Name', 'Your company name displayed across the site'),
        ('company_tagline', 'Life Solutions', 'string', 'general', 'Tagline', 'Short tagline for the company'),
        ('company_description', 'Independent life insurance agency protecting families nationwide with the right coverage at competitive rates.', 'string', 'general', 'Description', 'Brief company description'),

        -- Contact Settings
        ('company_email', 'contact@heritagels.org', 'string', 'contact', 'Contact Email', 'Primary contact email address'),
        ('company_phone', '(630) 778-0800', 'string', 'contact', 'Phone Number', 'Primary contact phone number'),
        ('company_address', '1240 Iroquois Ave', 'string', 'contact', 'Street Address', 'Street address line 1'),
        ('company_address_line2', 'Suite 506', 'string', 'contact', 'Address Line 2', 'Street address line 2 (suite, unit, etc.)'),
        ('company_city', 'Naperville', 'string', 'contact', 'City', 'City'),
        ('company_state', 'IL', 'string', 'contact', 'State', 'State abbreviation'),
        ('company_zip', '60563', 'string', 'contact', 'ZIP Code', 'ZIP/Postal code'),
        ('business_hours', 'Monday - Friday, 9:00 AM - 5:00 PM CT', 'string', 'contact', 'Business Hours', 'Operating hours'),
        ('business_hours_weekday', '9:00 AM - 5:00 PM CT', 'string', 'contact', 'Weekday Hours', 'Weekday operating hours'),
        ('business_hours_weekend', 'Closed', 'string', 'contact', 'Weekend Hours', 'Weekend operating hours'),

        -- Social Media Settings
        ('social_facebook', 'https://facebook.com', 'string', 'social', 'Facebook URL', 'Facebook page URL'),
        ('social_twitter', 'https://twitter.com', 'string', 'social', 'Twitter URL', 'Twitter profile URL'),
        ('social_linkedin', 'https://linkedin.com', 'string', 'social', 'LinkedIn URL', 'LinkedIn company page URL'),
        ('social_instagram', 'https://instagram.com', 'string', 'social', 'Instagram URL', 'Instagram profile URL'),
        ('social_youtube', 'https://youtube.com', 'string', 'social', 'YouTube URL', 'YouTube channel URL'),

        -- SEO Settings
        ('seo_site_title', 'Heritage Life Solutions | Life Insurance Experts', 'string', 'seo', 'Site Title', 'Default page title for SEO'),
        ('seo_meta_description', 'Get affordable life insurance from Heritage Life Solutions. Term, whole life, IUL, and final expense coverage. Free quotes and expert guidance.', 'string', 'seo', 'Meta Description', 'Default meta description for SEO'),

        -- Email Settings
        ('email_notification_recipients', '', 'string', 'email', 'Notification Recipients', 'Comma-separated list of email addresses to receive notifications'),
        ('email_quote_notification', 'true', 'boolean', 'email', 'Quote Notifications', 'Send email when new quote request is received'),
        ('email_contact_notification', 'true', 'boolean', 'email', 'Contact Notifications', 'Send email when new contact message is received'),

        -- Branding Settings
        ('branding_primary_color', '#1e3a5f', 'string', 'branding', 'Primary Color', 'Primary brand color (hex code)'),
        ('branding_accent_color', '#7c3aed', 'string', 'branding', 'Accent Color', 'Accent/secondary color (hex code)')
      ON CONFLICT (key) DO NOTHING;
    `);

    // ============================================
    // TESTIMONIALS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        title TEXT,
        company TEXT,
        location TEXT,
        photo_url TEXT,
        quote TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        category TEXT,
        product_type TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
        show_on_product_pages BOOLEAN NOT NULL DEFAULT TRUE,
        date_received TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials (status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials (is_featured);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials (sort_order);
    `);

    // Insert default testimonials if they don't exist
    await client.query(`
      INSERT INTO testimonials (name, location, quote, rating, product_type, status, is_featured, show_on_homepage, sort_order) VALUES
        ('Michael R.', 'Chicago, IL', 'I was skeptical about online life insurance, but Heritage made it incredibly easy. Got approved in 10 minutes with no medical exam. The rate was better than quotes I got from local agents.', 5, 'term', 'approved', true, true, 1),
        ('Sarah K.', 'Austin, TX', 'As a mom of three, I needed coverage fast. Heritage''s process was simple and straightforward. I appreciated being able to compare different term lengths and see the prices change in real-time.', 5, 'term', 'approved', false, true, 2),
        ('David M.', 'Denver, CO', 'The whole process took less than 15 minutes from start to finish. I was able to get $750,000 in coverage for less than my monthly streaming subscriptions. Highly recommend.', 5, 'term', 'approved', false, true, 3),
        ('Jennifer L.', 'Phoenix, AZ', 'I''d been putting off getting life insurance for years because I thought it would be complicated. Heritage made it so easy. No pushy salespeople, just straightforward information and great rates.', 5, 'term', 'approved', false, true, 4),
        ('Robert T.', 'Seattle, WA', 'After comparing prices from multiple companies, Heritage had the best rates by far. The application was quick and I had my policy documents in my email the same day.', 5, 'term', 'approved', false, true, 5),
        ('Amanda H.', 'Miami, FL', 'Great experience overall. The quote comparison tool helped me understand the difference between term lengths. Customer service was helpful when I had questions about coverage.', 4, 'term', 'approved', false, true, 6)
      ON CONFLICT DO NOTHING;
    `);

    // ============================================
    // NEWSLETTER SUBSCRIBERS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        source TEXT DEFAULT 'blog',
        subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
        unsubscribed_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers (status);
    `);

    // Add new columns to newsletter_subscribers (if not exist)
    await client.query(`
      ALTER TABLE newsletter_subscribers
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS ip_address TEXT,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS referrer_url TEXT,
      ADD COLUMN IF NOT EXISTS landing_page TEXT,
      ADD COLUMN IF NOT EXISTS confirm_token TEXT,
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    // Additional indexes for newsletter_subscribers
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_source ON newsletter_subscribers (source);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers (subscribed_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_engagement ON newsletter_subscribers (engagement_score DESC);
    `);

    // ============================================
    // SUBSCRIBER TAGS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriber_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#6366f1',
        description TEXT,
        subscriber_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ============================================
    // SUBSCRIBER TAG ASSIGNMENTS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriber_tag_assignments (
        subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES subscriber_tags(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT NOW(),
        assigned_by TEXT,
        PRIMARY KEY (subscriber_id, tag_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tag_assignments_subscriber ON subscriber_tag_assignments (subscriber_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tag_assignments_tag ON subscriber_tag_assignments (tag_id);
    `);

    // ============================================
    // SUBSCRIBER ACTIVITY TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriber_activity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        description TEXT,
        metadata JSONB DEFAULT '{}',
        performed_by TEXT DEFAULT 'system',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriber_activity_subscriber ON subscriber_activity (subscriber_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriber_activity_type ON subscriber_activity (activity_type);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriber_activity_created ON subscriber_activity (created_at DESC);
    `);

    // ============================================
    // SUBSCRIBER IMPORTS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriber_imports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        total_rows INTEGER,
        imported_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        errors JSONB DEFAULT '[]',
        imported_by TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert default tags if they don't exist
    await client.query(`
      INSERT INTO subscriber_tags (name, color, description) VALUES
        ('VIP', '#8b5cf6', 'High-value subscribers'),
        ('Lead', '#3b82f6', 'Potential customers'),
        ('Customer', '#10b981', 'Existing policyholders'),
        ('Engaged', '#f59e0b', 'Highly engaged subscribers')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Generate unsubscribe tokens for existing subscribers who don't have one
    await client.query(`
      UPDATE newsletter_subscribers
      SET confirm_token = gen_random_uuid()
      WHERE confirm_token IS NULL;
    `);

    // ============================================
    // CLIENT CHAT TABLES (Agent-Client Messaging)
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS client_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL,
        agent_id UUID NOT NULL,
        client_name TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        last_message_at TIMESTAMP,
        last_message_preview TEXT,
        unread_count_agent INTEGER NOT NULL DEFAULT 0,
        unread_count_client INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(client_id, agent_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_conversations_agent ON client_conversations (agent_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_conversations_client ON client_conversations (client_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_conversations_last_message ON client_conversations (last_message_at DESC);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS client_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES client_conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL,
        sender_type TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT NOT NULL DEFAULT 'text',
        attachments JSONB,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_messages_conversation ON client_messages (conversation_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages (created_at);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_messages_sender ON client_messages (sender_id);
    `);

    // Agent Licenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_licenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        state_code VARCHAR(2) NOT NULL,
        license_number TEXT,
        license_type TEXT DEFAULT 'life_health',
        status TEXT NOT NULL DEFAULT 'active',
        effective_date DATE,
        expiration_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_licenses_user_id ON agent_licenses (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_licenses_state ON agent_licenses (state_code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_licenses_status ON agent_licenses (status);`);

    // Agent Territories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_territories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        state_code VARCHAR(2) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
        assigned_by TEXT,
        notes TEXT
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_territories_user_id ON agent_territories (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_territories_state ON agent_territories (state_code);`);

    // ── Agent Onboarding columns ──
    await client.query(`
      ALTER TABLE agent_profiles
      ADD COLUMN IF NOT EXISTS onboarding_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS onboarding_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS onboarding_token_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS ssn_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS emergency_contact_ssn_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS bank_name TEXT,
      ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS routing_number_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS account_number_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS license_expiration_date DATE,
      ADD COLUMN IF NOT EXISTS eo_provider TEXT,
      ADD COLUMN IF NOT EXISTS eo_policy_number TEXT,
      ADD COLUMN IF NOT EXISTS eo_effective_date DATE,
      ADD COLUMN IF NOT EXISTS eo_expiration_date DATE,
      ADD COLUMN IF NOT EXISTS eo_certificate_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS aml_certificate_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS drivers_license_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS drivers_license_back_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS direct_deposit_form_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS has_felony BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS felony_details TEXT,
      ADD COLUMN IF NOT EXISTS has_bankruptcy BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS bankruptcy_details TEXT,
      ADD COLUMN IF NOT EXISTS has_misdemeanor BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS misdemeanor_details TEXT,
      ADD COLUMN IF NOT EXISTS docusign_nda_envelope_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS docusign_nda_signed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS docusign_nda_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS docusign_nda_signed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS docusign_debt_rollup_envelope_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS docusign_debt_rollup_signed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS docusign_debt_rollup_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS docusign_debt_rollup_signed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS docusign_compliance_envelope_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS docusign_compliance_signed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS docusign_compliance_s3_key TEXT,
      ADD COLUMN IF NOT EXISTS docusign_compliance_signed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS docusign_nda_document_hash TEXT,
      ADD COLUMN IF NOT EXISTS docusign_debt_rollup_document_hash TEXT,
      ADD COLUMN IF NOT EXISTS docusign_compliance_document_hash TEXT,
      ADD COLUMN IF NOT EXISTS highest_education VARCHAR(50),
      ADD COLUMN IF NOT EXISTS previous_sales_experience TEXT,
      ADD COLUMN IF NOT EXISTS previous_industry VARCHAR(100),
      ADD COLUMN IF NOT EXISTS learning_style VARCHAR(30),
      ADD COLUMN IF NOT EXISTS weekly_study_hours INTEGER,
      ADD COLUMN IF NOT EXISTS target_exam_date DATE,
      ADD COLUMN IF NOT EXISTS mentor_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS can_commit_in_person BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS can_commit_scheduled_online BOOLEAN DEFAULT FALSE;
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_profiles_onboarding_token ON agent_profiles (onboarding_token);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_profiles_onboarding_type ON agent_profiles (onboarding_type);`);
    // Business card social links + title
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS title VARCHAR(100);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS website_url VARCHAR(255);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS voicemail_audio_url VARCHAR(500);`);
    await client.query(`ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS voicemail_audio_s3_key TEXT;`);

    // ── Training Sessions table (1:1 coaching/training with upline) ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        requestor_id UUID NOT NULL REFERENCES users(id),
        trainer_id UUID NOT NULL REFERENCES users(id),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        scheduled_at TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL DEFAULT 30,
        timezone VARCHAR(50) DEFAULT 'America/Chicago',
        meeting_type VARCHAR(30) NOT NULL DEFAULT 'phone',
        topic VARCHAR(255),
        notes TEXT,
        meeting_link VARCHAR(500),
        location VARCHAR(255),
        decline_reason TEXT,
        accepted_at TIMESTAMP,
        declined_at TIMESTAMP,
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason TEXT,
        outcome TEXT,
        next_steps TEXT,
        reminder_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_sessions_requestor ON training_sessions(requestor_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_sessions_trainer ON training_sessions(trainer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_training_sessions_scheduled ON training_sessions(scheduled_at);`);

    // ── User Lounge Access table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_lounge_access (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR NOT NULL,
        lounge_key VARCHAR(50) NOT NULL,
        granted BOOLEAN NOT NULL DEFAULT TRUE,
        granted_by VARCHAR,
        granted_at TIMESTAMP DEFAULT NOW(),
        revoked_at TIMESTAMP,
        UNIQUE(user_id, lounge_key)
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_lounge_access_user_id ON user_lounge_access (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_lounge_access_lounge_key ON user_lounge_access (lounge_key);`);

    // Post-close workflows — tracks post-close process per converted lead
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_close_workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id VARCHAR NOT NULL,
        agent_user_id VARCHAR NOT NULL,
        client_user_id VARCHAR,
        policy_id VARCHAR,
        workflow_started_at TIMESTAMP,
        welcome_email_sent_at TIMESTAMP,
        welcome_sms_sent_at TIMESTAMP,
        ai_call_completed_at TIMESTAMP,
        ai_call_scheduled_at TIMESTAMP,
        ai_call_job_id VARCHAR(255),
        nps_scheduled_at TIMESTAMP,
        nps_score INTEGER,
        nps_received_at TIMESTAMP,
        referral_asked_at TIMESTAMP,
        book_of_business_updated_at TIMESTAMP,
        details_verified_at TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        completed_at TIMESTAMP,
        verification_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_workflows_lead_id ON post_close_workflows (lead_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_workflows_agent ON post_close_workflows (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_workflows_status ON post_close_workflows (status);`);

    // Add new columns to existing post_close_workflows tables (safe for existing databases)
    await client.query(`ALTER TABLE post_close_workflows ADD COLUMN IF NOT EXISTS ai_call_scheduled_at TIMESTAMP;`);
    await client.query(`ALTER TABLE post_close_workflows ADD COLUMN IF NOT EXISTS ai_call_job_id VARCHAR(255);`);
    await client.query(`ALTER TABLE post_close_workflows ADD COLUMN IF NOT EXISTS nps_scheduled_at TIMESTAMP;`);
    await client.query(`ALTER TABLE post_close_workflows ADD COLUMN IF NOT EXISTS nps_score INTEGER;`);
    await client.query(`ALTER TABLE post_close_workflows ADD COLUMN IF NOT EXISTS nps_received_at TIMESTAMP;`);
    await client.query(`ALTER TABLE post_close_workflows ADD COLUMN IF NOT EXISTS referral_asked_at TIMESTAMP;`);

    // Post-close follow-ups — tracks 30/60/90 day scheduled check-ins
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_close_follow_ups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID,
        lead_id VARCHAR NOT NULL,
        agent_user_id UUID NOT NULL,
        client_user_id VARCHAR,
        follow_up_type VARCHAR(20) NOT NULL,
        scheduled_for TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        completed_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_follow_ups_workflow ON post_close_follow_ups (workflow_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_follow_ups_lead ON post_close_follow_ups (lead_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_follow_ups_agent ON post_close_follow_ups (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_post_close_follow_ups_status ON post_close_follow_ups (status);`);
    await client.query(`ALTER TABLE post_close_follow_ups ADD COLUMN IF NOT EXISTS auto_send_enabled BOOLEAN DEFAULT false;`);
    await client.query(`ALTER TABLE post_close_follow_ups ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;`);
    await client.query(`ALTER TABLE post_close_follow_ups ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP;`);

    // ─── HIERARCHY REQUESTS (Approval Workflow) ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS hierarchy_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_type VARCHAR(30) NOT NULL,
        requester_id UUID NOT NULL REFERENCES users(id),
        requested_upline_id UUID REFERENCES users(id),
        current_contract_level DECIMAL(5,2),
        requested_contract_level DECIMAL(5,2),
        proof_document_url VARCHAR(500),
        proof_description TEXT,
        monthly_ap_amount DECIMAL(12,2),
        manager_reviewer_id UUID REFERENCES users(id),
        manager_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        manager_notes TEXT,
        manager_recommended_level DECIMAL(5,2),
        manager_reviewed_at TIMESTAMP,
        executive_reviewer_id UUID REFERENCES users(id),
        executive_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        executive_notes TEXT,
        executive_final_level DECIMAL(5,2),
        executive_final_upline_id UUID REFERENCES users(id),
        executive_reviewed_at TIMESTAMP,
        carrier_updated BOOLEAN NOT NULL DEFAULT false,
        carrier_update_notes TEXT,
        carrier_reminder_sent_at TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'pending_manager',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_requests_requester ON hierarchy_requests (requester_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_requests_status ON hierarchy_requests (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_requests_type ON hierarchy_requests (request_type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_requests_manager ON hierarchy_requests (manager_reviewer_id);`);

    // ─── COMMISSION TARGETS ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS commission_targets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scope VARCHAR(20) NOT NULL,
        agent_user_id UUID REFERENCES users(id),
        hierarchy_level INTEGER,
        min_contract_level DECIMAL(5,2) NOT NULL,
        max_contract_level DECIMAL(5,2) NOT NULL,
        default_contract_level DECIMAL(5,2) NOT NULL,
        level_progression JSONB DEFAULT '[]',
        set_by UUID NOT NULL REFERENCES users(id),
        effective_from TIMESTAMP DEFAULT NOW() NOT NULL,
        effective_to TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commission_targets_scope ON commission_targets (scope);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commission_targets_agent ON commission_targets (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commission_targets_level ON commission_targets (hierarchy_level);`);

    // ─── COMMISSION AUDIT LOG ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS commission_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        previous_value JSONB,
        new_value JSONB,
        request_id UUID,
        performed_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commission_audit_agent ON commission_audit_log (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commission_audit_action ON commission_audit_log (action);`);

    // Agency Deals — tracks submitted deals for leaderboard
    await client.query(`
      CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        client_name VARCHAR(255),
        carrier VARCHAR(100) NOT NULL,
        monthly_premium DECIMAL(10, 2) NOT NULL,
        annual_premium DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT NOW() NOT NULL,
        verified_at TIMESTAMP,
        verified_by UUID REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_agent ON deals (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_submitted ON deals (submitted_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals (status);`);

    // Lead Purchases — tracks lead marketplace orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        lead_type VARCHAR(100) NOT NULL,
        price_cents INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        stripe_payment_intent_id VARCHAR(255),
        stripe_status VARCHAR(50) DEFAULT 'pending',
        status VARCHAR(20) DEFAULT 'pending',
        purchased_at TIMESTAMP DEFAULT NOW(),
        delivered_at TIMESTAMP,
        states JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`ALTER TABLE lead_purchases ADD COLUMN IF NOT EXISTS states JSONB;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lead_purchases_agent ON lead_purchases (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lead_purchases_status ON lead_purchases (status);`);

    // Agent email connections — per-agent OAuth/IMAP credentials
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_email_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        provider VARCHAR(20) NOT NULL, -- gmail, outlook, imap
        email_address VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        -- OAuth tokens (Gmail, Outlook)
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        -- IMAP credentials (encrypted app passwords)
        imap_host VARCHAR(255),
        imap_port INTEGER DEFAULT 993,
        imap_password TEXT,
        smtp_host VARCHAR(255),
        smtp_port INTEGER DEFAULT 587,
        -- Status
        status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, expired, disconnected
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(agent_user_id, provider)
      );
    `);

    // Agent calendar connections — per-agent CalDAV credentials
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_calendar_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        provider VARCHAR(20) NOT NULL, -- google, apple, outlook
        caldav_url VARCHAR(500) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password TEXT NOT NULL,
        display_name VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, disconnected
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(agent_user_id)
      );
    `);

    // Add OAuth columns for Google Calendar per-agent OAuth
    await client.query(`ALTER TABLE agent_calendar_connections ADD COLUMN IF NOT EXISTS access_token TEXT`);
    await client.query(`ALTER TABLE agent_calendar_connections ADD COLUMN IF NOT EXISTS refresh_token TEXT`);
    await client.query(`ALTER TABLE agent_calendar_connections ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP`);
    // Allow multiple calendar providers per agent (drop old single-agent constraint)
    await client.query(`ALTER TABLE agent_calendar_connections DROP CONSTRAINT IF EXISTS agent_calendar_connections_agent_user_id_key`);
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_calendar_connections_agent_provider_key') THEN
          ALTER TABLE agent_calendar_connections ADD CONSTRAINT agent_calendar_connections_agent_provider_key UNIQUE (agent_user_id, provider);
        END IF;
      END $$;
    `);

    // CalDAV tracking columns for appointments (Apple Calendar / iCloud sync)
    await client.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS caldav_event_uid VARCHAR(255)`);
    await client.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS caldav_event_url TEXT`);
    await client.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS caldav_provider VARCHAR(20)`);

    // Outlook Graph API tracking column for appointments (Phase 4)
    await client.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS outlook_event_id VARCHAR(255)`);

    // Secure forms table (migrated from in-memory secureFormStore)
    await client.query(`
      CREATE TABLE IF NOT EXISTS secure_forms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        link_id VARCHAR(255) NOT NULL UNIQUE,
        form_type VARCHAR(50) NOT NULL,
        carrier_id VARCHAR(255),
        carrier_name VARCHAR(255),
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        agent_name VARCHAR(255),
        agent_email VARCHAR(255),
        agent_phone VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        expires_at TIMESTAMP,
        submitted_data JSONB,
        submitted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ============================================
    // AGENT WEBSITE SETTINGS TABLE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_website_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        agent_slug VARCHAR(255) NOT NULL,
        headline TEXT,
        tagline TEXT,
        bio TEXT,
        featured_products JSONB DEFAULT '["term_life","whole_life","iul","final_expense","annuities"]',
        show_testimonials BOOLEAN DEFAULT true,
        show_faq BOOLEAN DEFAULT true,
        show_carriers BOOLEAN DEFAULT true,
        show_schedule_call BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(agent_user_id),
        UNIQUE(agent_slug)
      );
    `);

    // ============================================
    // SCRIPTS TABLES
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS scripts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        product_type VARCHAR(100),
        content TEXT NOT NULL,
        branches JSONB,
        is_active BOOLEAN DEFAULT true,
        usage_count INTEGER DEFAULT 0,
        success_rate DECIMAL(5,2),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS script_favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        script_id UUID NOT NULL REFERENCES scripts(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(agent_user_id, script_id)
      );
    `);

    // ============================================
    // RECRUITING TABLES
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS recruit_prospects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recruiter_id UUID NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(50),
        approach VARCHAR(50),
        stage VARCHAR(50) NOT NULL DEFAULT 'prospect',
        notes TEXT,
        next_step_date TIMESTAMP,
        invite_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ============================================
    // QUOTES TABLE (agent-sent policy quotes)
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id VARCHAR,
        agent_user_id UUID REFERENCES users(id),
        quote_number VARCHAR(50) UNIQUE,
        carrier VARCHAR(100) NOT NULL,
        product_type VARCHAR(100) NOT NULL,
        coverage_amount INTEGER NOT NULL,
        monthly_premium DECIMAL(10, 2) NOT NULL,
        annual_premium DECIMAL(10, 2),
        term INTEGER,
        risk_class VARCHAR(50),
        health_category VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        sent_at TIMESTAMP,
        viewed_at TIMESTAMP,
        expires_at TIMESTAMP,
        presentation_notes TEXT,
        competitor_quotes JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quotes_lead_id ON quotes (lead_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quotes_agent_user_id ON quotes (agent_user_id);`);

    // Additional columns for sent quote documents
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS send_method VARCHAR(20);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS premium_frequency VARCHAR(20) DEFAULT 'monthly';`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP;`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS carrier_id VARCHAR(100);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_type VARCHAR(100);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_type_name VARCHAR(255);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS benefits TEXT;`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS additional_notes TEXT;`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS agent_name VARCHAR(255);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS agent_email VARCHAR(255);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS agent_phone VARCHAR(50);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS agent_npn VARCHAR(50);`);
    await client.query(`ALTER TABLE quotes ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT false;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recruit_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
        agent_slug VARCHAR(255) NOT NULL,
        headline TEXT,
        subheadline TEXT,
        show_testimonials BOOLEAN DEFAULT true,
        show_faq BOOLEAN DEFAULT true,
        show_commission_table BOOLEAN DEFAULT true,
        show_steps BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS product_guide_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        link_id VARCHAR(255) UNIQUE NOT NULL,
        guide_id VARCHAR(50) NOT NULL,
        guide_title VARCHAR(255) NOT NULL,
        guide_description TEXT DEFAULT '',
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        agent_user_id UUID REFERENCES users(id),
        agent_name VARCHAR(255),
        agent_email VARCHAR(255),
        agent_phone VARCHAR(50) DEFAULT '',
        agent_npn VARCHAR(50) DEFAULT '',
        custom_message TEXT,
        status VARCHAR(20) DEFAULT 'sent',
        opened_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Deduplicate scripts: keep only one per name (cleans up any existing dupes)
    await client.query(`
      DELETE FROM scripts WHERE id NOT IN (
        SELECT MIN(id::text)::uuid FROM scripts GROUP BY name
      );
    `);

    // Add unique constraint on scripts.name (idempotent)
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scripts_name_unique') THEN
          ALTER TABLE scripts ADD CONSTRAINT scripts_name_unique UNIQUE (name);
        END IF;
      END $$;
    `);

    // Seed default scripts (ON CONFLICT on name prevents duplicates)
    await client.query(`
      INSERT INTO scripts (name, category, content, product_type, is_active) VALUES
        ('Cold Call — Initial Contact', 'phone', 'Opening script for first-time cold calls to new leads. Establishes rapport and qualifies interest.', 'general', true),
        ('Warm Follow-Up Call', 'phone', 'Script for following up with leads who previously showed interest or requested information.', 'general', true),
        ('Appointment Setting', 'phone', 'Script to convert an interested lead into a scheduled appointment for a needs analysis.', 'general', true),
        ('Needs Analysis & Fact-Finding', 'phone', 'Guided questions to uncover the prospect''s financial situation, family needs, and coverage gaps.', 'general', true),
        ('Product Presentation — Life Insurance', 'phone', 'Structured presentation for term life, whole life, IUL, and final expense products.', 'general', true),
        ('Objection Handling', 'phone', 'Responses to common objections: "I need to think about it," "I can''t afford it," "I already have coverage."', 'general', true),
        ('Closing & Application', 'phone', 'Trial closes, assumptive closes, and transition into the application process.', 'general', true),
        ('Referral Request', 'phone', 'Post-sale script to ask for warm referrals from satisfied clients.', 'general', true),
        ('Annual Policy Review Call', 'phone', 'Script for reaching out to existing clients for their annual policy review and cross-sell opportunities.', 'general', true),
        ('Recruiting — Agent Opportunity Call', 'phone', 'Script for recruiting potential agents into your downline. Covers the Heritage opportunity and compensation.', 'general', true)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Agent XP Transactions — tracks all XP awards
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_xp_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        reason VARCHAR(255),
        source_type VARCHAR(50),
        source_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_xp_user ON agent_xp_transactions (user_id);`);

    // Agent Milestones — tracks earned achievements
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        milestone_id VARCHAR(100) NOT NULL,
        milestone_name VARCHAR(255) NOT NULL,
        milestone_tier VARCHAR(20) DEFAULT 'bronze',
        points_awarded INTEGER DEFAULT 0,
        earned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, milestone_id)
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_milestones_user ON agent_milestones (user_id);`);

    // Agent Streaks — tracks activity streaks per agent
    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_streaks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ============================================
    // IDEAS & FEEDBACK TABLES
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_ideas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'submitted',
        submitted_by UUID NOT NULL REFERENCES users(id),
        submitted_by_name VARCHAR(255),
        admin_response TEXT,
        admin_responded_by UUID REFERENCES users(id),
        admin_responded_at TIMESTAMP,
        upvote_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_ideas_submitted_by ON agent_ideas (submitted_by);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_ideas_status ON agent_ideas (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_ideas_category ON agent_ideas (category);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS idea_upvotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        idea_id UUID NOT NULL REFERENCES agent_ideas(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(idea_id, user_id)
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_idea_upvotes_idea ON idea_upvotes (idea_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_idea_upvotes_user ON idea_upvotes (user_id);`);

    // User preferences (notification settings, theme, language)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        digest_frequency VARCHAR(20) DEFAULT 'daily',
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(10) DEFAULT 'en',
        custom_settings JSONB,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Team activity feed (real-time dashboard feed)
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_activity_feed (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID REFERENCES users(id),
        agent_name VARCHAR(255),
        activity_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_team_activity_created ON team_activity_feed (created_at DESC);`);

    // Billing history — bank info and metadata columns
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);`);
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS routing_number TEXT;`);
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS account_number TEXT;`);
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS description TEXT;`);
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS billing_type VARCHAR(50);`);
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;`);
    await client.query(`ALTER TABLE billing_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();`);

    // Document Templates — template definitions for automated document generation
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        template_key VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        lifecycle_phase VARCHAR(50) NOT NULL,
        is_automated BOOLEAN DEFAULT false,
        requires_approval BOOLEAN DEFAULT false,
        allows_personal_note BOOLEAN DEFAULT false,
        trigger_event VARCHAR(100),
        document_type_for_portal VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Document Queue — tracks generated documents through lifecycle
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_queue (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        template_key VARCHAR(100) NOT NULL,
        client_user_id UUID NOT NULL REFERENCES users(id),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        policy_id UUID REFERENCES policies(id),
        claim_id VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'generating',
        personal_note TEXT,
        generated_pdf_key VARCHAR(500),
        generated_pdf_url VARCHAR(1000),
        document_id UUID,
        delivery_results JSONB,
        error_message TEXT,
        scheduled_for TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by UUID,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_doc_queue_client ON document_queue(client_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_doc_queue_agent ON document_queue(agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_doc_queue_status ON document_queue(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_doc_queue_scheduled ON document_queue(scheduled_for);`);

    // Seed document templates (17 templates)
    await client.query(`
      INSERT INTO document_templates (template_key, name, description, category, lifecycle_phase, is_automated, requires_approval, allows_personal_note, trigger_event, document_type_for_portal) VALUES
        ('welcome_letter', 'Welcome Letter', 'Congratulations letter with agent intro, portal access, and what to expect', 'onboarding', 'onboarding', true, false, false, 'POLICY_SOLD', 'correspondence'),
        ('policy_summary', 'Policy Summary', 'Coverage amount, premium, beneficiaries, policy number, carrier, key dates', 'onboarding', 'onboarding', true, false, false, 'POLICY_SOLD', 'policy'),
        ('claims_guide', 'Claims Guide', 'How to file a claim, required documents, timeline expectations', 'onboarding', 'onboarding', true, false, false, 'POLICY_SOLD', 'claims'),
        ('beneficiary_designation_confirmation', 'Beneficiary Designation Confirmation', 'Current beneficiaries on record for the policy', 'onboarding', 'onboarding', true, false, false, 'POLICY_SOLD', 'beneficiary'),
        ('portal_access_instructions', 'Portal Access Instructions', 'Login URL, password setup, features overview', 'onboarding', 'onboarding', true, false, false, 'POLICY_SOLD', 'correspondence'),
        ('annual_policy_statement', 'Annual Policy Statement', 'Current status, premium paid YTD, cash value, beneficiaries', 'annual', 'annual_ongoing', true, false, false, NULL, 'statements'),
        ('premium_payment_reminder', 'Premium Payment Reminder', 'Upcoming due date, amount, payment method on file', 'billing', 'annual_ongoing', true, false, false, NULL, 'billing'),
        ('policy_anniversary_letter', 'Policy Anniversary Letter', 'Personal letter from agent on policy anniversary with review invitation', 'annual', 'annual_ongoing', false, false, true, NULL, 'correspondence'),
        ('annual_review_invitation', 'Annual Review Invitation', 'Invitation to schedule an annual coverage review meeting', 'annual', 'annual_ongoing', false, false, true, NULL, 'correspondence'),
        ('claims_packet', 'Claims Filing Packet', 'Required documents checklist, filing process, timeline', 'claims', 'claims', true, false, false, 'CLAIM_FILED', 'claims'),
        ('claim_acknowledgment', 'Claim Acknowledgment Letter', 'Confirms receipt of claim with claim number and next steps', 'claims', 'claims', true, false, false, 'CLAIM_FILED', 'claims'),
        ('claim_status_update', 'Claim Status Update', 'Progress notification with current status and next steps', 'claims', 'claims', false, false, true, 'CLAIM_STATUS_UPDATED', 'claims'),
        ('claim_approval_letter', 'Claim Approval Letter', 'Approved amount, payout method, timeline', 'claims', 'claims', false, true, true, 'CLAIM_STATUS_UPDATED', 'claims'),
        ('claim_denial_letter', 'Claim Denial Letter', 'Denial reason and appeal process', 'claims', 'claims', false, true, true, 'CLAIM_STATUS_UPDATED', 'claims'),
        ('beneficiary_change_confirmation', 'Beneficiary Change Confirmation', 'Updated beneficiaries on record after agent processes change', 'beneficiary', 'beneficiary_service', true, false, false, 'BENEFICIARY_REQUESTED', 'beneficiary'),
        ('contact_update_confirmation', 'Contact Update Confirmation', 'Confirms address, phone, or email change', 'correspondence', 'beneficiary_service', true, false, false, NULL, 'correspondence'),
        ('payment_method_update_confirmation', 'Payment Method Update Confirmation', 'Confirms new payment method on file', 'billing', 'beneficiary_service', true, false, false, NULL, 'billing')
      ON CONFLICT (template_key) DO NOTHING;
    `);

    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

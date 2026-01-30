import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
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
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

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

    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

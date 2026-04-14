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
        role VARCHAR(50) NOT NULL DEFAULT 'sales_agent',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        two_factor_secret VARCHAR(255),
        two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        apple_id VARCHAR(255),
        google_id VARCHAR(255),
        avatar_url VARCHAR(500),
        referral_message VARCHAR(500),
        timezone VARCHAR(100) DEFAULT 'America/Chicago',
        last_login_at TIMESTAMP,
        assigned_agent_id UUID,
        converted_from_lead_id VARCHAR,
        onboarding_status VARCHAR(50) DEFAULT 'pending',
        invite_token VARCHAR(255),
        invite_token_expires_at TIMESTAMP,
        password_reset_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Add new columns to existing users table (safe for existing databases)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'sales_agent';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_message VARCHAR(500);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'America/Chicago';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_agent_id UUID;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS converted_from_lead_id VARCHAR;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'pending';`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expires_at TIMESTAMP;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE;`);

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

    // ============================================
    // LEADS / PIPELINE
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
        converted_user_id VARCHAR,
        converted_at TIMESTAMP,
        notes TEXT,
        lead_score INTEGER DEFAULT 0,
        score_tier VARCHAR(20),
        close_probability INTEGER DEFAULT 0,
        pipeline_stage VARCHAR(50) DEFAULT 'new',
        expected_close_date DATE,
        enrichment_data JSONB,
        tags TEXT[],
        contact_count INTEGER DEFAULT 0,
        distributed_to TEXT,
        distributed_at TIMESTAMP,
        distributed_by_user TEXT,
        distribution_level TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads (pipeline_stage);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads (lead_score);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads (next_follow_up);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_distributed_to ON leads (distributed_to);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id VARCHAR NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        old_status TEXT,
        new_status TEXT,
        performed_by TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities (lead_id);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS import_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        file_name TEXT,
        total_rows INTEGER DEFAULT 0,
        imported_rows INTEGER DEFAULT 0,
        skipped_rows INTEGER DEFAULT 0,
        error_rows INTEGER DEFAULT 0,
        source TEXT DEFAULT 'import',
        error_details TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // ============================================
    // AGENT LICENSES & TERRITORIES
    // ============================================

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

    // ============================================
    // AGENT PROFILES
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE,
        date_of_birth DATE,
        street_address TEXT,
        address_line2 TEXT,
        city TEXT,
        state VARCHAR(2),
        zip_code VARCHAR(10),
        title VARCHAR(255),
        company_name VARCHAR(255),
        website_url VARCHAR(255),
        linkedin_url VARCHAR(255),
        instagram_url VARCHAR(255),
        facebook_url VARCHAR(255),
        twitter_url VARCHAR(255),
        is_licensed VARCHAR(20),
        license_number TEXT,
        licensed_states TEXT[],
        years_experience VARCHAR(20),
        previous_agency TEXT,
        npn VARCHAR(20),
        interested_products TEXT[],
        why_join_heritage TEXT,
        referral_source VARCHAR(50),
        referring_agent_name TEXT,
        preferred_upline_id VARCHAR(100),
        approval_status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
        approved_by TEXT,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
        agreed_to_privacy BOOLEAN NOT NULL DEFAULT FALSE,
        consented_at TIMESTAMP,
        onboarding_type VARCHAR(20),
        onboarding_step INTEGER DEFAULT 0,
        onboarding_completed_at TIMESTAMP,
        onboarding_token VARCHAR(255),
        onboarding_token_expires_at TIMESTAMP,
        ssn_encrypted TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone VARCHAR(20),
        emergency_contact_ssn_encrypted TEXT,
        bank_name TEXT,
        bank_account_type VARCHAR(20),
        routing_number_encrypted TEXT,
        account_number_encrypted TEXT,
        license_expiration_date DATE,
        eo_provider TEXT,
        eo_policy_number TEXT,
        eo_effective_date DATE,
        eo_expiration_date DATE,
        eo_certificate_s3_key TEXT,
        aml_certificate_s3_key TEXT,
        drivers_license_s3_key TEXT,
        drivers_license_back_s3_key TEXT,
        direct_deposit_form_s3_key TEXT,
        has_felony BOOLEAN DEFAULT FALSE,
        felony_details TEXT,
        has_bankruptcy BOOLEAN DEFAULT FALSE,
        bankruptcy_details TEXT,
        has_misdemeanor BOOLEAN DEFAULT FALSE,
        misdemeanor_details TEXT,
        docusign_nda_envelope_id VARCHAR(100),
        docusign_nda_signed BOOLEAN DEFAULT FALSE,
        docusign_nda_s3_key TEXT,
        docusign_nda_signed_at TIMESTAMP,
        docusign_debt_rollup_envelope_id VARCHAR(100),
        docusign_debt_rollup_signed BOOLEAN DEFAULT FALSE,
        docusign_debt_rollup_s3_key TEXT,
        docusign_debt_rollup_signed_at TIMESTAMP,
        docusign_compliance_envelope_id VARCHAR(100),
        docusign_compliance_signed BOOLEAN DEFAULT FALSE,
        docusign_compliance_s3_key TEXT,
        docusign_compliance_signed_at TIMESTAMP,
        docusign_nda_document_hash TEXT,
        docusign_debt_rollup_document_hash TEXT,
        docusign_compliance_document_hash TEXT,
        highest_education VARCHAR(50),
        previous_sales_experience TEXT,
        previous_industry VARCHAR(100),
        learning_style VARCHAR(30),
        weekly_study_hours INTEGER,
        target_exam_date DATE,
        mentor_id VARCHAR(100),
        can_commit_in_person BOOLEAN DEFAULT FALSE,
        can_commit_scheduled_online BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_profiles_user_id ON agent_profiles (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_profiles_approval_status ON agent_profiles (approval_status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_profiles_onboarding_token ON agent_profiles (onboarding_token);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_profiles_onboarding_type ON agent_profiles (onboarding_type);`);

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

    // ============================================
    // DEALS
    // ============================================

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
        product_type VARCHAR(100),
        state_code VARCHAR(2),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_agent ON deals (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_submitted ON deals (submitted_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_deals_status ON deals (status);`);

    // ============================================
    // DOCUMENT TEMPLATES & QUEUE
    // ============================================

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

    // ============================================
    // SECURITY: LOGIN ATTEMPTS, AUDIT LOGS, ACCESS CHANGE LOG
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        success BOOLEAN NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts (email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip_address);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts (created_at);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens (token_hash);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_token VARCHAR(255) NOT NULL,
        platform VARCHAR(10) NOT NULL,
        device_name VARCHAR(100),
        app_version VARCHAR(20),
        os_version VARCHAR(20),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_devices_token ON user_devices (device_token);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        resource_id VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS access_change_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        target_user_id UUID NOT NULL REFERENCES users(id),
        performed_by UUID NOT NULL REFERENCES users(id),
        action_type VARCHAR(50) NOT NULL,
        previous_value JSONB,
        new_value JSONB,
        reason TEXT,
        email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_access_log_target ON access_change_log (target_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_access_log_performer ON access_change_log (performed_by);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_access_log_type ON access_change_log (action_type);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) NOT NULL UNIQUE,
        value JSONB NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // ============================================
    // ENTERPRISE: COMMISSIONS, HIERARCHY, PERFORMANCE
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        policy_id UUID REFERENCES policies(id),
        commission_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        percentage DECIMAL(5, 2),
        premium_amount DECIMAL(10, 2),
        policy_year INTEGER DEFAULT 1,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        earned_at TIMESTAMP,
        paid_at TIMESTAMP,
        payment_reference VARCHAR(100),
        chargeback_at TIMESTAMP,
        chargeback_reason TEXT,
        upline_agent_id UUID REFERENCES users(id),
        override_level INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commissions_agent_user_id ON commissions (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commissions_policy_id ON commissions (policy_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions (status);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_hierarchy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        direct_upline_id UUID REFERENCES users(id),
        hierarchy_level INTEGER NOT NULL DEFAULT 5,
        hierarchy_title VARCHAR(100),
        upline_chain JSONB DEFAULT '[]',
        contract_level DECIMAL(5, 2),
        override_eligible BOOLEAN DEFAULT FALSE,
        override_percentage DECIMAL(5, 2),
        effective_from TIMESTAMP DEFAULT NOW() NOT NULL,
        effective_to TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_agent_user_id ON agent_hierarchy (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_direct_upline_id ON agent_hierarchy (direct_upline_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hierarchy_level ON agent_hierarchy (hierarchy_level);`);

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_performance_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        period_type VARCHAR(20) NOT NULL,
        calls_made INTEGER DEFAULT 0,
        calls_connected INTEGER DEFAULT 0,
        emails_sent INTEGER DEFAULT 0,
        appointments_set INTEGER DEFAULT 0,
        appointments_kept INTEGER DEFAULT 0,
        leads_assigned INTEGER DEFAULT 0,
        leads_contacted INTEGER DEFAULT 0,
        quotes_sent INTEGER DEFAULT 0,
        applications_submitted INTEGER DEFAULT 0,
        policies_sold INTEGER DEFAULT 0,
        premium_sold DECIMAL(12, 2) DEFAULT 0,
        commissions_earned DECIMAL(12, 2) DEFAULT 0,
        performance_score INTEGER,
        rank INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        target_calls INTEGER,
        target_appointments INTEGER,
        target_policies INTEGER,
        target_premium DECIMAL(12, 2),
        current_calls INTEGER DEFAULT 0,
        current_appointments INTEGER DEFAULT 0,
        current_policies INTEGER DEFAULT 0,
        current_premium DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // ============================================
    // COMPLIANCE FLAGS
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID REFERENCES users(id),
        flag_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        related_table VARCHAR(50),
        related_id VARCHAR(100),
        due_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'open',
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        resolved_notes TEXT,
        auto_generated BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_compliance_flags_agent ON compliance_flags (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_compliance_flags_type ON compliance_flags (flag_type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_compliance_flags_severity ON compliance_flags (severity);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_compliance_flags_status ON compliance_flags (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_compliance_flags_due_date ON compliance_flags (due_date);`);

    // ============================================
    // CARRIER DIRECTORY & APPOINTMENTS
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS carrier_directory (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        carrier_branding_id VARCHAR(100),
        naic VARCHAR(20),
        am_best_rating VARCHAR(10),
        contracting_url TEXT,
        training_url TEXT,
        appointment_phone VARCHAR(20),
        appointment_email VARCHAR(255),
        product_types JSONB DEFAULT '[]'::jsonb,
        states_available JSONB DEFAULT '[]'::jsonb,
        commission_advance_months INTEGER DEFAULT 9,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_directory_code ON carrier_directory (code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_directory_is_active ON carrier_directory (is_active);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS carrier_appointments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        carrier_id VARCHAR NOT NULL,
        state_code VARCHAR(2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        appointment_date DATE,
        termination_date DATE,
        termination_reason TEXT,
        commission_level DECIMAL(5, 2),
        product_types JSONB DEFAULT '[]'::jsonb,
        contracting_completed_at TIMESTAMP,
        training_completed_at TIMESTAMP,
        writing_number VARCHAR(100),
        nipr_verified BOOLEAN DEFAULT false,
        nipr_last_checked TIMESTAMP,
        nipr_appointment_id VARCHAR(100),
        notes TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_appointments_agent_user_id ON carrier_appointments (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_appointments_carrier_id ON carrier_appointments (carrier_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_appointments_state_code ON carrier_appointments (state_code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_appointments_status ON carrier_appointments (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_appointments_agent_carrier ON carrier_appointments (agent_user_id, carrier_id);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_eo_policies (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        provider VARCHAR(255) NOT NULL,
        policy_number VARCHAR(100),
        coverage_amount DECIMAL(12, 2),
        deductible DECIMAL(10, 2),
        effective_date DATE NOT NULL,
        expiration_date DATE NOT NULL,
        status VARCHAR(30) DEFAULT 'active',
        document_s3_key VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_eo_policies_agent_user_id ON agent_eo_policies (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_eo_policies_expiration_date ON agent_eo_policies (expiration_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_eo_policies_status ON agent_eo_policies (status);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointment_alerts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'yellow',
        related_table VARCHAR(50),
        related_id VARCHAR,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        due_date DATE,
        is_read BOOLEAN DEFAULT false,
        is_resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointment_alerts_agent_user_id ON appointment_alerts (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointment_alerts_alert_type ON appointment_alerts (alert_type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointment_alerts_severity ON appointment_alerts (severity);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointment_alerts_is_resolved ON appointment_alerts (is_resolved);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointment_alerts_due_date ON appointment_alerts (due_date);`);

    // ============================================
    // AGENT DOCUMENT VAULT
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'other',
        file_key VARCHAR(500),
        file_size VARCHAR(50),
        mime_type VARCHAR(100),
        expiration_date DATE,
        notes TEXT,
        is_deleted BOOLEAN DEFAULT false,
        uploaded_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_documents_agent ON agent_documents (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_documents_category ON agent_documents (category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_documents_expiration ON agent_documents (expiration_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_documents_deleted ON agent_documents (is_deleted);`);

    // ============================================
    // CONTRACTING CHECKLISTS
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS contracting_checklists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_user_id UUID NOT NULL,
        nda_status VARCHAR(20) DEFAULT 'pending',
        nda_signed_at TIMESTAMP,
        nda_document_key TEXT,
        debt_rollup_status VARCHAR(20) DEFAULT 'pending',
        debt_rollup_signed_at TIMESTAMP,
        debt_rollup_document_key TEXT,
        compliance_status VARCHAR(20) DEFAULT 'pending',
        compliance_signed_at TIMESTAMP,
        compliance_document_key TEXT,
        all_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contracting_checklists_agent ON contracting_checklists (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contracting_checklists_completed ON contracting_checklists (all_completed);`);

    // ============================================
    // PRODUCTION RECORDS & CARRIER SYNC
    // ============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS production_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        carrier_id UUID,
        carrier_code VARCHAR(20),
        agent_user_id UUID NOT NULL REFERENCES users(id),
        writing_number VARCHAR(50),
        policy_number VARCHAR(50),
        insured_name VARCHAR(200),
        insured_state VARCHAR(2),
        product_type VARCHAR(50),
        product_name VARCHAR(200),
        face_amount NUMERIC(12, 2),
        annual_premium NUMERIC(12, 2),
        modal_premium NUMERIC(12, 2),
        premium_mode VARCHAR(20),
        application_date TIMESTAMP,
        issue_date TIMESTAMP,
        paid_date TIMESTAMP,
        effective_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'submitted',
        commission_amount NUMERIC(10, 2),
        commission_type VARCHAR(20),
        raw_payload JSONB,
        synced_at TIMESTAMP,
        source_type VARCHAR(20) DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_production_agent ON production_records (agent_user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_production_carrier ON production_records (carrier_code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_production_status ON production_records (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_production_issue_date ON production_records (issue_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_production_paid_date ON production_records (paid_date);`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS carrier_sync_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        carrier_id UUID,
        sync_type VARCHAR(20),
        status VARCHAR(20),
        records_processed INTEGER DEFAULT 0,
        records_created INTEGER DEFAULT 0,
        records_updated INTEGER DEFAULT 0,
        records_skipped INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_sync_carrier ON carrier_sync_log (carrier_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_carrier_sync_status ON carrier_sync_log (status);`);

    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

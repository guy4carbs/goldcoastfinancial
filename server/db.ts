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

    console.log("Database tables initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

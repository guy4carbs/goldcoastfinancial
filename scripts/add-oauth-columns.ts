import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addColumns() {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255)');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)');
    console.log('✓ OAuth columns added successfully');
  } catch (error) {
    console.error('Error adding columns:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();

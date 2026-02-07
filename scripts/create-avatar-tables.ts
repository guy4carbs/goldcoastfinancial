import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  const client = await pool.connect();
  try {
    console.log("Creating ai_avatars table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_avatars (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        domain_expertise JSONB NOT NULL DEFAULT '[]',
        speaking_style TEXT NOT NULL,
        debate_style TEXT NOT NULL DEFAULT 'analytical',
        response_priority INTEGER NOT NULL DEFAULT 5,
        system_prompt TEXT NOT NULL,
        avatar_image_url TEXT,
        voice_id TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ ai_avatars table created");

    console.log("Creating avatar_sessions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS avatar_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        mode TEXT NOT NULL DEFAULT 'single',
        avatars_used JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        ended_at TIMESTAMP
      );
    `);
    console.log("✓ avatar_sessions table created");

    console.log("Creating avatar_messages table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS avatar_messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL,
        role TEXT NOT NULL,
        avatar_id VARCHAR,
        content TEXT NOT NULL,
        tokens_used INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ avatar_messages table created");

    console.log("Creating debate_sessions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS debate_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL,
        topic TEXT NOT NULL,
        avatar1_id VARCHAR NOT NULL,
        avatar2_id VARCHAR NOT NULL,
        current_turn INTEGER NOT NULL DEFAULT 1,
        max_turns INTEGER NOT NULL DEFAULT 6,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP
      );
    `);
    console.log("✓ debate_sessions table created");

    console.log("Creating avatar_logs table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS avatar_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL,
        event_type TEXT NOT NULL,
        intent_classification JSONB,
        avatar_selection_reasoning TEXT,
        tokens_in INTEGER,
        tokens_out INTEGER,
        latency_ms INTEGER,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✓ avatar_logs table created");

    // Insert seed data
    console.log("\nInserting seed avatars...");

    const avatars = [
      {
        name: "Insurance Expert",
        slug: "insurance-expert",
        domain_expertise: ["insurance", "underwriting", "policies", "compliance", "claims"],
        speaking_style: "Professional, thorough, and educational.",
        debate_style: "analytical",
        response_priority: 9,
        system_prompt: "You are the Insurance Expert AI for Heritage Life Solutions. Help agents understand insurance products deeply.",
      },
      {
        name: "Sales Closer",
        slug: "sales-closer",
        domain_expertise: ["sales", "closing", "objections", "presentations", "prospecting"],
        speaking_style: "High-energy, confident, and action-oriented.",
        debate_style: "aggressive",
        response_priority: 8,
        system_prompt: "You are the Sales Closer AI. Help agents close more deals with proven techniques.",
      },
      {
        name: "Mindset Coach",
        slug: "mindset-coach",
        domain_expertise: ["motivation", "mindset", "confidence", "goal-setting", "resilience"],
        speaking_style: "Warm, encouraging, and insightful.",
        debate_style: "empathetic",
        response_priority: 7,
        system_prompt: "You are the Mindset Coach AI. Help agents overcome mental barriers and build confidence.",
      },
      {
        name: "Compliance Specialist",
        slug: "compliance-specialist",
        domain_expertise: ["compliance", "regulations", "documentation", "ethics", "licensing"],
        speaking_style: "Precise, thorough, and cautious.",
        debate_style: "analytical",
        response_priority: 9,
        system_prompt: "You are the Compliance Specialist AI. Keep agents compliant and protect them from risk.",
      },
      {
        name: "Objection Handler",
        slug: "objection-handler",
        domain_expertise: ["objections", "rebuttals", "scripts", "responses", "concerns"],
        speaking_style: "Calm, prepared, and strategic.",
        debate_style: "analytical",
        response_priority: 8,
        system_prompt: "You are the Objection Handler AI. Help agents overcome any objection with battle-tested responses.",
      },
      {
        name: "Wolf Closer",
        slug: "wolf-closer",
        domain_expertise: ["persuasion", "influence", "tonality", "rapport", "psychology"],
        speaking_style: "Intense, strategic, and psychologically sophisticated.",
        debate_style: "aggressive",
        response_priority: 6,
        system_prompt: "You are the Wolf Closer AI. Teach ethical high-conviction persuasion techniques.",
      },
    ];

    for (const avatar of avatars) {
      await client.query(
        `INSERT INTO ai_avatars (name, slug, domain_expertise, speaking_style, debate_style, response_priority, system_prompt)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO NOTHING`,
        [
          avatar.name,
          avatar.slug,
          JSON.stringify(avatar.domain_expertise),
          avatar.speaking_style,
          avatar.debate_style,
          avatar.response_priority,
          avatar.system_prompt,
        ]
      );
      console.log(`✓ Inserted: ${avatar.name}`);
    }

    console.log("\n✅ All tables created and seeded successfully!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();

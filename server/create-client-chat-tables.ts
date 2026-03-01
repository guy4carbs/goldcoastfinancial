/**
 * Create Client Chat Tables
 * Run with: npx tsx server/create-client-chat-tables.ts
 */

import { pool } from "./db";

async function createClientChatTables() {
  const client = await pool.connect();
  try {
    console.log("Creating client chat tables...");

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

    console.log("✅ Client chat tables created successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createClientChatTables();

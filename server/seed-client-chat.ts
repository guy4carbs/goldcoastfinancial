/**
 * Seed Client Chat Data
 * Sets up test data for client-agent chat functionality
 *
 * Run with: npx tsx server/seed-client-chat.ts
 */

import { pool } from "./db";
import bcrypt from "bcryptjs";

async function seedClientChat() {
  const client = await pool.connect();

  try {
    console.log("🌱 Seeding client chat data...\n");

    // 1. Create or find the test member user (client)
    const memberEmail = "member@heritagels.com";
    const memberPassword = "Heritage123!";
    const hashedPassword = await bcrypt.hash(memberPassword, 10);

    // Check if member exists
    let memberResult = await client.query(
      `SELECT id, first_name, last_name FROM users WHERE email = $1`,
      [memberEmail]
    );

    let memberId: string;
    let memberName: string;

    if (memberResult.rows.length === 0) {
      // Create the member user
      const insertResult = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, first_name, last_name`,
        [memberEmail, hashedPassword, "Test", "Member", "(555) 123-4567", "client"]
      );
      memberId = insertResult.rows[0].id;
      memberName = `${insertResult.rows[0].first_name} ${insertResult.rows[0].last_name}`;
      console.log(`✅ Created member user: ${memberEmail} (ID: ${memberId})`);
    } else {
      memberId = memberResult.rows[0].id;
      memberName = `${memberResult.rows[0].first_name} ${memberResult.rows[0].last_name}`;
      // Update password in case it changed
      await client.query(
        `UPDATE users SET password = $1, role = 'client' WHERE id = $2`,
        [hashedPassword, memberId]
      );
      console.log(`✅ Found existing member: ${memberEmail} (ID: ${memberId})`);
    }

    // 2. Find or create an agent user to link
    let agentResult = await client.query(
      `SELECT id, first_name, last_name FROM users WHERE role IN ('agent', 'sales_agent', 'admin', 'owner') LIMIT 1`
    );

    let agentId: string;
    let agentName: string;

    if (agentResult.rows.length === 0) {
      // Create a demo agent
      const agentPassword = await bcrypt.hash("Agent123!", 10);
      const insertAgent = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, first_name, last_name`,
        ["agent@heritagels.com", agentPassword, "Robert", "Williams", "(555) 987-6543", "agent"]
      );
      agentId = insertAgent.rows[0].id;
      agentName = `${insertAgent.rows[0].first_name} ${insertAgent.rows[0].last_name}`;
      console.log(`✅ Created agent user: agent@heritagels.com (ID: ${agentId})`);
    } else {
      agentId = agentResult.rows[0].id;
      agentName = `${agentResult.rows[0].first_name} ${agentResult.rows[0].last_name}`;
      console.log(`✅ Found existing agent: ${agentName} (ID: ${agentId})`);
    }

    // 3. Create or find client conversation
    let convResult = await client.query(
      `SELECT id FROM client_conversations WHERE client_id = $1 AND agent_id = $2`,
      [memberId, agentId]
    );

    let conversationId: string;

    if (convResult.rows.length === 0) {
      const insertConv = await client.query(
        `INSERT INTO client_conversations (client_id, agent_id, client_name, agent_name, is_active, last_message_at, last_message_preview, unread_count_agent, unread_count_client)
         VALUES ($1, $2, $3, $4, true, NOW(), 'Welcome to Heritage! I''m your dedicated agent.', 1, 0)
         RETURNING id`,
        [memberId, agentId, memberName, agentName]
      );
      conversationId = insertConv.rows[0].id;
      console.log(`✅ Created conversation (ID: ${conversationId})`);
    } else {
      conversationId = convResult.rows[0].id;
      console.log(`✅ Found existing conversation (ID: ${conversationId})`);
    }

    // 4. Add some test messages
    const existingMessages = await client.query(
      `SELECT COUNT(*) as count FROM client_messages WHERE conversation_id = $1`,
      [conversationId]
    );

    if (parseInt(existingMessages.rows[0].count) === 0) {
      const messages = [
        {
          senderId: agentId,
          senderType: "agent",
          senderName: agentName,
          content: "Hi there! Welcome to Heritage Life Services. I'm your dedicated insurance agent and I'm here to help with all your insurance needs.",
          minutesAgo: 120,
        },
        {
          senderId: agentId,
          senderType: "agent",
          senderName: agentName,
          content: "Feel free to reach out anytime through this chat. I'll respond as quickly as possible!",
          minutesAgo: 119,
        },
        {
          senderId: memberId,
          senderType: "client",
          senderName: memberName,
          content: "Thank you! I had a question about my policy coverage.",
          minutesAgo: 60,
        },
        {
          senderId: agentId,
          senderType: "agent",
          senderName: agentName,
          content: "Of course! I'd be happy to help. What would you like to know about your coverage?",
          minutesAgo: 55,
        },
        {
          senderId: memberId,
          senderType: "client",
          senderName: memberName,
          content: "I was wondering if I could increase my coverage amount. Is that possible?",
          minutesAgo: 30,
        },
        {
          senderId: agentId,
          senderType: "agent",
          senderName: agentName,
          content: "Absolutely! We can definitely look at increasing your coverage. Based on your current policy, I'd recommend reviewing a few options. Would you like to schedule a quick call to discuss the details?",
          minutesAgo: 25,
        },
        {
          senderId: memberId,
          senderType: "client",
          senderName: memberName,
          content: "That sounds great! What times work for you this week?",
          minutesAgo: 5,
          isRead: false,
        },
      ];

      for (const msg of messages) {
        await client.query(
          `INSERT INTO client_messages (conversation_id, sender_id, sender_type, sender_name, content, message_type, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, 'text', $6, NOW() - INTERVAL '${msg.minutesAgo} minutes')`,
          [conversationId, msg.senderId, msg.senderType, msg.senderName, msg.content, msg.isRead !== false]
        );
      }

      // Update conversation last message
      await client.query(
        `UPDATE client_conversations
         SET last_message_at = NOW() - INTERVAL '5 minutes',
             last_message_preview = 'That sounds great! What times work for you this week?',
             unread_count_agent = 1
         WHERE id = $1`,
        [conversationId]
      );

      console.log(`✅ Added ${messages.length} test messages`);
    } else {
      console.log(`✅ Messages already exist (${existingMessages.rows[0].count} found)`);
    }

    console.log("\n🎉 Client chat seeding complete!");
    console.log("\n📱 Test Login Credentials:");
    console.log("   Member (iOS App): member@heritagels.com / Heritage123!");
    console.log(`   Agent (Web App):  Use any existing agent account`);
    console.log(`\n   Agent assigned: ${agentName}`);

  } catch (error) {
    console.error("❌ Error seeding client chat:", error);
    throw error;
  } finally {
    client.release();
  }
}

seedClientChat()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

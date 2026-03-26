/**
 * Lead-to-Client Conversion Service
 *
 * Called when a lead's pipeline stage moves to "placed" (status = "won").
 * Automates creating a client user account + policy stub, sets up
 * the agent-client conversation, and sends notifications.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { storage } from '../storage';
import { sendPortalMessage } from '../gmail';

export interface ConversionResult {
  success: boolean;
  clientUserId?: string;
  policyId?: string;
  error?: string;
  alreadyConverted?: boolean;
}

export async function convertLeadToClient(
  leadId: string,
  agentUserId: string
): Promise<ConversionResult> {
  try {
    // 1. Fetch the lead by ID
    const lead = await storage.getLeadById(leadId);
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // 2. Idempotency: if already converted, return early
    if (lead.convertedUserId) {
      return {
        success: true,
        alreadyConverted: true,
        clientUserId: lead.convertedUserId,
      };
    }

    // 3. Check if lead has an email address
    if (!lead.email) {
      return { success: false, error: 'Lead has no email address' };
    }

    let clientUserId: string;
    let isNewUser = false;

    // 4. Check for existing user by email
    const existingUser = await storage.getUserByEmail(lead.email);

    if (existingUser) {
      clientUserId = existingUser.id;

      if (existingUser.role === 'client') {
        // Existing client user: update their agent assignment and conversion reference
        await storage.updateUser(existingUser.id, {
          assignedAgentId: agentUserId,
          convertedFromLeadId: leadId,
        } as any);
      }
      // If non-client role: create policy under their ID (handled in step 6)
    } else {
      // 5. Create new client user
      isNewUser = true;

      // Generate random unusable password
      const randomPassword = await bcrypt.hash(
        crypto.randomBytes(16).toString('hex'),
        10
      );

      // Generate invite token — store HASHED version in DB
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const hashedInviteToken = await bcrypt.hash(inviteToken, 10);

      // Token expires in 7 days
      const inviteTokenExpiresAt = new Date();
      inviteTokenExpiresAt.setDate(inviteTokenExpiresAt.getDate() + 7);

      const newUser = await storage.createUser({
        email: lead.email,
        password: randomPassword,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone || undefined,
        role: 'client',
        assignedAgentId: agentUserId,
        convertedFromLeadId: leadId,
        onboardingStatus: 'pending',
        inviteToken: hashedInviteToken,
        inviteTokenExpiresAt: inviteTokenExpiresAt,
        passwordResetRequired: true,
      } as any);

      clientUserId = newUser.id;
    }

    // 6. Create policy stub
    const policyNumber = `HLS-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;

    const coverageAmount = lead.coverageAmount
      ? parseInt(lead.coverageAmount, 10) || 0
      : (lead.estimatedValue || 0);

    const newPolicy = await storage.createPolicy({
      userId: clientUserId,
      policyNumber,
      type: lead.coverageType || 'Pending',
      status: 'pending_setup',
      coverageAmount,
      monthlyPremium: '0.00',
      startDate: new Date(),
      agentId: agentUserId,
      leadId: leadId,
    } as any);

    // 7. Update lead with conversion tracking
    await pool.query(
      `UPDATE leads SET converted_user_id = $1, converted_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [clientUserId, leadId]
    );

    // 8. Create client-agent conversation
    const clientFullName = `${lead.firstName} ${lead.lastName}`.trim();

    // Get agent name
    const agentUser = await storage.getUserById(agentUserId);
    const agentFullName = agentUser
      ? `${agentUser.firstName} ${agentUser.lastName}`.trim()
      : 'Your Agent';

    const conversation = await storage.getOrCreateClientConversation(
      clientUserId,
      agentUserId,
      clientFullName,
      agentFullName
    );

    // 9. Send welcome message in chat
    await storage.createClientMessage({
      conversationId: conversation.id,
      senderId: agentUserId,
      senderType: 'agent',
      senderName: agentFullName,
      content: `Welcome to Heritage Life Solutions, ${lead.firstName}! I'm ${agentFullName}, your assigned agent. I'll be helping you get your policy set up. Feel free to message me here with any questions.`,
      messageType: 'text',
      isRead: false,
    } as any);

    // 10. Create notification for client
    await storage.createNotification({
      userId: clientUserId,
      title: 'Welcome to Heritage Life Solutions',
      message: `Your account has been created and ${agentFullName} has been assigned as your agent. Check your messages to get started.`,
      type: 'welcome',
      actionUrl: '/portal/messages',
    });

    // 11. Create notification for agent
    await storage.createNotification({
      userId: agentUserId,
      title: 'Lead Converted to Client',
      message: `${clientFullName} has been converted to a client. A policy stub (${policyNumber}) has been created and a conversation has been opened.`,
      type: 'conversion',
      actionUrl: `/crm/leads/${leadId}`,
    });

    // 12. Log lead activity with type "conversion"
    await storage.createLeadActivity({
      leadId,
      type: 'conversion',
      title: 'Lead Converted to Client',
      description: `Lead converted to client account (User ID: ${clientUserId}). Policy ${policyNumber} created. ${isNewUser ? 'New user account created.' : 'Linked to existing user account.'}`,
      performedBy: agentUserId,
    });

    // 13. Try to send welcome email (don't let failure break conversion)
    try {
      await sendPortalMessage({
        senderName: agentFullName,
        senderEmail: 'noreply@heritagels.org',
        recipientEmail: lead.email,
        recipientName: clientFullName,
        subject: `Welcome to Heritage Life Solutions - Your Account is Ready`,
        message: `Hi ${lead.firstName},\n\nWelcome to Heritage Life Solutions! Your account has been created and I've been assigned as your dedicated agent.\n\nYou can log into your client portal at https://heritagels.org/portal to view your policy details, send me messages, and manage your account.\n\nI'll be in touch soon to finalize your coverage details.\n\nBest regards,\n${agentFullName}\nHeritage Life Solutions`,
      });
    } catch (emailError) {
      console.error('[LeadConversion] Welcome email failed (non-blocking):', emailError);
    }

    // 14. Create post-close workflow record (non-blocking)
    try {
      await pool.query(
        `INSERT INTO post_close_workflows (lead_id, agent_user_id, client_user_id, policy_id, status)
         VALUES ($1, $2, $3, $4, 'pending')
         ON CONFLICT DO NOTHING`,
        [leadId, agentUserId, clientUserId, newPolicy.id]
      );
    } catch (pcErr) {
      console.error('[LeadConversion] Post-close workflow creation failed (non-blocking):', pcErr);
    }

    console.log(`[LeadConversion] Successfully converted lead ${leadId} to client ${clientUserId}, policy ${newPolicy.id}`);

    return {
      success: true,
      clientUserId,
      policyId: newPolicy.id,
    };
  } catch (error) {
    console.error('[LeadConversion] Conversion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    };
  }
}

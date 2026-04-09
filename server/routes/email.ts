/**
 * Email API Routes — Per-agent email connection + inbox/send system
 * Supports Gmail OAuth, Outlook (stub), and IMAP (stub) providers.
 * Each agent connects their own email account and can read/send from it.
 */
import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// =============================================================================
// HELPERS
// =============================================================================

/** Build a per-user Gmail client from stored connection tokens */
function getAgentGmailClient(connection: any) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL || "http://localhost:4500"}/api/email/callback/gmail`
  );
  oauth2.setCredentials({
    access_token: connection.access_token,
    refresh_token: connection.refresh_token,
  });

  // Auto-refresh: when tokens are refreshed, persist them
  oauth2.on("tokens", async (tokens) => {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIdx = 1;

      if (tokens.access_token) {
        updates.push(`access_token = $${paramIdx++}`);
        values.push(tokens.access_token);
      }
      if (tokens.refresh_token) {
        updates.push(`refresh_token = $${paramIdx++}`);
        values.push(tokens.refresh_token);
      }
      if (tokens.expiry_date) {
        updates.push(`token_expires_at = $${paramIdx++}`);
        values.push(new Date(tokens.expiry_date));
      }
      updates.push(`updated_at = NOW()`);

      if (updates.length > 1) {
        values.push(connection.id);
        await pool.query(
          `UPDATE agent_email_connections SET ${updates.join(", ")} WHERE id = $${paramIdx}`,
          values
        );
      }
    } catch (err) {
      console.error("[Email] Failed to persist refreshed tokens:", err);
    }
  });

  return google.gmail({ version: "v1", auth: oauth2 });
}

/** Get current user's email connection (any provider) */
async function getConnection(userId: string) {
  const result = await pool.query(
    `SELECT * FROM agent_email_connections WHERE agent_user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
}

/** Map folder names to Gmail search queries */
const GMAIL_FOLDER_QUERIES: Record<string, string> = {
  inbox: "in:inbox",
  sent: "in:sent",
  starred: "is:starred",
  trash: "in:trash",
  drafts: "in:drafts",
  archive: "-in:inbox -in:sent -in:trash -in:drafts",
};

/** Parse Gmail message headers into a clean object */
function parseGmailHeaders(headers: any[]) {
  const get = (name: string) =>
    headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
  return {
    subject: get("Subject"),
    from: get("From"),
    to: get("To"),
    date: get("Date"),
    cc: get("Cc"),
  };
}

/** Parse "Name <email>" format */
function parseEmailAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), email: match[2].trim() };
  }
  return { name: raw.split("@")[0], email: raw.trim() };
}

/** Parse multiple email addresses */
function parseEmailAddresses(raw: string): { name: string; email: string }[] {
  if (!raw) return [];
  return raw.split(",").map((addr) => parseEmailAddress(addr.trim()));
}

/** Decode Gmail message body (base64url) */
function decodeBody(data: string | undefined | null): string {
  if (!data) return "";
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/** Extract body from Gmail message parts */
function extractBody(payload: any): { html: string; text: string } {
  let html = "";
  let text = "";

  if (!payload) return { html, text };

  // Simple body
  if (payload.body?.data) {
    const decoded = decodeBody(payload.body.data);
    if (payload.mimeType === "text/html") {
      html = decoded;
    } else {
      text = decoded;
    }
  }

  // Multipart
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        html = decodeBody(part.body.data);
      } else if (part.mimeType === "text/plain" && part.body?.data) {
        text = decodeBody(part.body.data);
      } else if (part.mimeType?.startsWith("multipart/") && part.parts) {
        const nested = extractBody(part);
        if (nested.html) html = nested.html;
        if (nested.text) text = nested.text;
      }
    }
  }

  return { html, text };
}

/** Check if message has attachments */
function hasAttachments(payload: any): boolean {
  if (!payload?.parts) return false;
  return payload.parts.some(
    (p: any) =>
      p.filename && p.filename.length > 0 && p.body?.attachmentId
  );
}

// =============================================================================
// IMAP / SMTP HELPERS
// =============================================================================

/** Create IMAP connection from stored credentials */
async function createImapConnection(connection: any): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: connection.imap_host,
    port: connection.imap_port || 993,
    secure: true,
    auth: {
      user: connection.email_address,
      pass: connection.imap_password,
    },
    logger: false,
  });
  await client.connect();
  return client;
}

/** Create SMTP transport from stored credentials */
function createSmtpTransport(connection: any) {
  return nodemailer.createTransport({
    host: connection.smtp_host || connection.imap_host?.replace('imap', 'smtp'),
    port: connection.smtp_port || 587,
    secure: false, // STARTTLS
    auth: {
      user: connection.email_address,
      pass: connection.imap_password,
    },
  });
}

/** Map folder name to IMAP mailbox path */
function getImapMailbox(folder: string): string {
  const map: Record<string, string> = {
    inbox: 'INBOX',
    sent: 'Sent',
    trash: 'Trash',
    drafts: 'Drafts',
    starred: 'INBOX', // We'll filter by flagged
    archive: 'Archive',
  };
  return map[folder] || 'INBOX';
}

// =============================================================================
// CONNECTION MANAGEMENT
// =============================================================================

/**
 * GET /connection — Return the agent's current email connection or null
 */
router.get("/connection", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const conn = await getConnection(userId);

    if (!conn) {
      return res.json({ connection: null });
    }

    res.json({
      connection: {
        id: conn.id,
        provider: conn.provider,
        email: conn.email_address,
        displayName: conn.display_name,
        status: conn.status,
        lastSyncAt: conn.last_sync_at,
        createdAt: conn.created_at,
      },
    });
  } catch (error: any) {
    console.error("[Email] Error fetching connection:", error?.message);
    res.status(500).json({ error: "Failed to fetch email connection" });
  }
});

/**
 * GET /connect/gmail — Initiate Google OAuth for Gmail
 * Redirects the user to Google consent screen with per-user scopes
 */
router.get("/connect/gmail", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL || "http://localhost:4500"}/api/email/callback/gmail`
    );

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state: userId, // Pass userId through OAuth state parameter
    });

    res.redirect(authUrl);
  } catch (error: any) {
    console.error("[Email] Error initiating Gmail OAuth:", error?.message);
    res.status(500).json({ error: "Failed to initiate Gmail connection" });
  }
});

/**
 * GET /callback/gmail — Handle Google OAuth callback
 * Exchanges code for tokens, gets user email, stores connection
 */
router.get("/callback/gmail", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const appUrl = process.env.APP_URL || "http://localhost:4500";
    // Use authenticated session user — state param is for verification only
    const sessionUser = (req as any).user;
    const agentUserId = sessionUser?.id;

    if (!code || !agentUserId) {
      return res.redirect(`${appUrl}/agents/communications?email_error=missing_params`);
    }

    // Validate state matches session user to prevent CSRF
    if (state && state !== agentUserId) {
      console.warn(`[Email] OAuth state mismatch: state=${state}, session=${agentUserId}`);
      return res.redirect(`${appUrl}/agents/communications?email_error=invalid_state`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/email/callback/gmail`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get the user's email address from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const emailAddress = userInfo.email;
    const displayName = userInfo.name || emailAddress;

    if (!emailAddress) {
      return res.redirect(`${appUrl}/agents/communications?email_error=no_email`);
    }

    // Upsert connection — one per (user, provider)
    await pool.query(
      `INSERT INTO agent_email_connections
        (agent_user_id, provider, email_address, display_name, access_token, refresh_token, token_expires_at, status)
       VALUES ($1, 'gmail', $2, $3, $4, $5, $6, 'active')
       ON CONFLICT (agent_user_id, provider) DO UPDATE SET
        email_address = EXCLUDED.email_address,
        display_name = EXCLUDED.display_name,
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, agent_email_connections.refresh_token),
        token_expires_at = EXCLUDED.token_expires_at,
        status = 'active',
        updated_at = NOW()`,
      [
        agentUserId,
        emailAddress,
        displayName,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      ]
    );

    console.log(`[Email] Gmail connected for agent ${agentUserId}: ${emailAddress}`);
    res.redirect(`${appUrl}/agents/communications?email_connected=gmail`);
  } catch (error: any) {
    console.error("[Email] Gmail OAuth callback error:", error?.message);
    const appUrl = process.env.APP_URL || "http://localhost:4500";
    res.redirect(`${appUrl}/agents/communications?email_error=oauth_failed`);
  }
});

/**
 * POST /connect/imap — Store IMAP credentials
 * Saves email/password/hosts for later IMAP reading (packages not yet installed)
 */
router.post("/connect/imap", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { email, password, imapHost, imapPort, smtpHost, smtpPort, displayName } = req.body;

    if (!email || !password || !imapHost) {
      return res.status(400).json({ error: "email, password, and imapHost are required" });
    }

    // Test IMAP connection before saving
    try {
      const testClient = new ImapFlow({
        host: imapHost,
        port: imapPort || 993,
        secure: true,
        auth: { user: email, pass: password },
        logger: false,
      });
      await testClient.connect();
      await testClient.logout();
    } catch (testError: any) {
      return res.status(400).json({
        error: "Connection failed: " + (testError?.message || 'Invalid credentials. Make sure you are using an App Password.')
      });
    }

    await pool.query(
      `INSERT INTO agent_email_connections
        (agent_user_id, provider, email_address, display_name, imap_host, imap_port, imap_password, smtp_host, smtp_port, status)
       VALUES ($1, 'imap', $2, $3, $4, $5, $6, $7, $8, 'active')
       ON CONFLICT (agent_user_id, provider) DO UPDATE SET
        email_address = EXCLUDED.email_address,
        display_name = EXCLUDED.display_name,
        imap_host = EXCLUDED.imap_host,
        imap_port = EXCLUDED.imap_port,
        imap_password = EXCLUDED.imap_password,
        smtp_host = EXCLUDED.smtp_host,
        smtp_port = EXCLUDED.smtp_port,
        status = 'active',
        updated_at = NOW()`,
      [
        userId,
        email,
        displayName || email,
        imapHost,
        imapPort || 993,
        password,
        smtpHost || imapHost,
        smtpPort || 587,
      ]
    );

    // Auto-connect calendar using the same credentials
    const calendarMap: Record<string, { provider: string; caldavUrl: string }> = {
      'imap.gmail.com': { provider: 'google', caldavUrl: 'https://apidata.googleusercontent.com/caldav/v2/' },
      'imap.mail.me.com': { provider: 'apple', caldavUrl: 'https://caldav.icloud.com/' },
      'outlook.office365.com': { provider: 'outlook', caldavUrl: 'https://outlook.office365.com/caldav/' },
    };
    const calInfo = calendarMap[imapHost];
    if (calInfo) {
      try {
        await pool.query(`
          INSERT INTO agent_calendar_connections
            (agent_user_id, provider, caldav_url, username, password, display_name, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'active')
          ON CONFLICT (agent_user_id, provider) DO UPDATE SET
            caldav_url = $3, username = $4, password = $5,
            display_name = $6, status = 'active', updated_at = NOW()
        `, [userId, calInfo.provider, calInfo.caldavUrl, email, password, displayName || email]);
        console.log(`[Email] Auto-connected ${calInfo.provider} calendar for agent ${userId}`);
      } catch (calErr: any) {
        console.warn(`[Email] Auto-calendar-connect failed (non-blocking):`, calErr?.message);
      }
    }

    console.log(`[Email] IMAP connected for agent ${userId}: ${email}`);
    res.json({ success: true, provider: "imap", email, calendarSynced: !!calInfo });
  } catch (error: any) {
    console.error("[Email] Error connecting IMAP:", error?.message);
    res.status(500).json({ error: "Failed to connect IMAP account" });
  }
});

/**
 * DELETE /disconnect — Remove the agent's email connection
 */
router.delete("/disconnect", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await pool.query(
      `UPDATE agent_email_connections SET status = 'disconnected', access_token = NULL, refresh_token = NULL, imap_password = NULL, updated_at = NOW() WHERE agent_user_id = $1 AND status = 'active'`,
      [userId]
    );

    // Email and calendar are now independent — don't auto-disconnect calendar

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Email] Error disconnecting:", error?.message);
    res.status(500).json({ error: "Failed to disconnect email" });
  }
});

// =============================================================================
// EMAIL OPERATIONS
// =============================================================================

/**
 * GET /messages — Fetch emails from the connected provider
 * Query params: folder (inbox|sent|starred|trash|drafts|archive), limit (default 50)
 */
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const connection = await getConnection(userId);

    if (!connection) {
      return res.status(400).json({ error: "No email account connected", code: "NOT_CONNECTED" });
    }

    const folder = (req.query.folder as string) || "inbox";
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    if (connection.provider === "gmail") {
      return await fetchGmailMessages(connection, folder, limit, res);
    }

    // IMAP provider — fetch via imapflow
    if (connection.provider === 'imap' || connection.provider === 'outlook') {
      let client: ImapFlow | null = null;
      try {
        client = await createImapConnection(connection);
        const mailbox = getImapMailbox(folder);
        const lock = await client.getMailboxLock(mailbox);

        try {
          const messages: any[] = [];
          // Fetch latest messages (newest first)
          const mailboxInfo = client.mailbox;
          const total = (mailboxInfo && typeof mailboxInfo === 'object' && 'exists' in mailboxInfo) ? (mailboxInfo as any).exists as number : 0;
          if (total === 0) {
            return res.json({ messages: [], total: 0 });
          }

          const startSeq = Math.max(1, total - limit + 1);
          const range = `${startSeq}:*`;

          for await (const msg of client.fetch(range, {
            envelope: true,
            flags: true,
            bodyStructure: true,
            uid: true,
          })) {
            const env = msg.envelope as any;
            if (!env) continue;
            const from = env.from?.[0] || { name: '', address: '' };
            const to = (env.to || []).map((a: any) => ({ name: a.name || '', email: a.address || '' }));

            messages.push({
              id: String(msg.uid),
              from: { name: from.name || from.address?.split('@')[0] || '', email: from.address || '' },
              to,
              subject: env.subject || '(no subject)',
              snippet: '', // IMAP doesn't provide snippets in FETCH
              date: env.date ? new Date(env.date).toISOString() : '',
              read: msg.flags?.has('\\Seen') || false,
              starred: msg.flags?.has('\\Flagged') || false,
              hasAttachment: false, // Would need bodyStructure parsing
              folder,
              labels: [],
            });
          }

          // Reverse so newest first
          messages.reverse();

          // Update last_sync_at
          await pool.query(
            `UPDATE agent_email_connections SET last_sync_at = NOW() WHERE id = $1`,
            [connection.id]
          );

          res.json({ messages: messages.slice(0, limit), total });
        } finally {
          lock.release();
        }
      } catch (error: any) {
        console.error("[Email] IMAP fetch error:", error?.message);
        if (error?.message?.includes('auth') || error?.message?.includes('credentials') || error?.message?.includes('LOGIN')) {
          // Mark connection as expired
          await pool.query(`UPDATE agent_email_connections SET status = 'expired' WHERE id = $1`, [connection.id]);
          return res.status(401).json({ error: "Email credentials expired. Please reconnect." });
        }
        res.status(500).json({ error: "Failed to fetch emails: " + (error?.message || 'Unknown error') });
      } finally {
        if (client) try { await client.logout(); } catch {}
      }
      return;
    }

    res.json({ messages: [] });
  } catch (error: any) {
    console.error("[Email] Error fetching messages:", error?.message);

    // Handle token expiry / revocation
    if (error?.code === 401 || error?.message?.includes("invalid_grant")) {
      const userId = req.user!.id;
      await pool.query(
        `UPDATE agent_email_connections SET status = 'expired', updated_at = NOW() WHERE agent_user_id = $1 AND status = 'active'`,
        [userId]
      );
      return res.status(401).json({ error: "Email connection expired. Please reconnect.", code: "TOKEN_EXPIRED" });
    }

    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

/** Fetch messages from Gmail API */
async function fetchGmailMessages(connection: any, folder: string, limit: number, res: Response) {
  const gmail = getAgentGmailClient(connection);
  const query = GMAIL_FOLDER_QUERIES[folder] || GMAIL_FOLDER_QUERIES.inbox;

  // Step 1: List message IDs
  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults: limit,
    q: query,
  });

  const messageIds = listResponse.data.messages || [];

  if (messageIds.length === 0) {
    return res.json({ messages: [], total: 0 });
  }

  // Step 2: Batch-get each message with metadata format (fast)
  const messages = await Promise.all(
    messageIds.map(async (msg: any) => {
      try {
        const { data } = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });

        const headers = parseGmailHeaders(data.payload?.headers || []);
        const from = parseEmailAddress(headers.from);
        const to = parseEmailAddresses(headers.to);
        const labelIds = data.labelIds || [];

        return {
          id: data.id,
          threadId: data.threadId,
          from,
          to,
          subject: headers.subject || "(no subject)",
          snippet: data.snippet || "",
          date: headers.date,
          read: !labelIds.includes("UNREAD"),
          starred: labelIds.includes("STARRED"),
          hasAttachment: data.sizeEstimate ? data.sizeEstimate > 50000 : false,
          folder: labelIds.includes("SENT")
            ? "sent"
            : labelIds.includes("TRASH")
            ? "trash"
            : labelIds.includes("DRAFT")
            ? "drafts"
            : "inbox",
          labels: labelIds,
        };
      } catch (err) {
        console.error(`[Email] Failed to fetch message ${msg.id}:`, err);
        return null;
      }
    })
  );

  const validMessages = messages.filter(Boolean);

  // Update last_sync_at
  await pool.query(
    `UPDATE agent_email_connections SET last_sync_at = NOW() WHERE id = $1`,
    [connection.id]
  );

  res.json({
    messages: validMessages,
    total: listResponse.data.resultSizeEstimate || validMessages.length,
  });
}

/**
 * GET /messages/:id — Fetch a single email with full body
 */
router.get("/messages/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const messageId = req.params.id;
    const connection = await getConnection(userId);

    if (!connection) {
      return res.status(400).json({ error: "No email account connected", code: "NOT_CONNECTED" });
    }

    if (connection.provider === "gmail") {
      const gmail = getAgentGmailClient(connection);

      const { data } = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const headers = parseGmailHeaders(data.payload?.headers || []);
      const from = parseEmailAddress(headers.from);
      const to = parseEmailAddresses(headers.to);
      const cc = parseEmailAddresses(headers.cc);
      const body = extractBody(data.payload);
      const labelIds = data.labelIds || [];

      return res.json({
        message: {
          id: data.id,
          threadId: data.threadId,
          from,
          to,
          cc,
          subject: headers.subject || "(no subject)",
          snippet: data.snippet || "",
          body: body.html || body.text,
          bodyHtml: body.html,
          bodyText: body.text,
          date: headers.date,
          read: !labelIds.includes("UNREAD"),
          starred: labelIds.includes("STARRED"),
          hasAttachment: hasAttachments(data.payload),
          folder: labelIds.includes("SENT")
            ? "sent"
            : labelIds.includes("TRASH")
            ? "trash"
            : labelIds.includes("DRAFT")
            ? "drafts"
            : "inbox",
          labels: labelIds,
        },
      });
    }

    if (connection.provider === 'imap' || connection.provider === 'outlook') {
      let client: ImapFlow | null = null;
      try {
        client = await createImapConnection(connection);
        const lock = await client.getMailboxLock('INBOX');

        try {
          const uid = parseInt(messageId);
          const source = await client.download(uid.toString(), undefined, { uid: true });

          if (!source?.content) {
            return res.status(404).json({ error: "Message not found" });
          }

          const parsed = await simpleParser(source.content);

          const from = parsed.from?.value?.[0] || { name: '', address: '' };
          const to = (parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : []).flatMap((addr: any) => addr.value || []).map((a: any) => ({ name: a.name || '', email: a.address || '' }));
          const cc = (parsed.cc ? (Array.isArray(parsed.cc) ? parsed.cc : [parsed.cc]) : []).flatMap((addr: any) => addr.value || []).map((a: any) => ({ name: a.name || '', email: a.address || '' }));

          // Mark as read
          await client.messageFlagsAdd(uid.toString(), ['\\Seen'], { uid: true });

          res.json({
            message: {
              id: messageId,
              from: { name: (from as any).name || (from as any).address?.split('@')[0] || '', email: (from as any).address || '' },
              to,
              cc,
              subject: parsed.subject || '(no subject)',
              body: parsed.html || parsed.textAsHtml || parsed.text || '',
              bodyHtml: parsed.html || '',
              bodyText: parsed.text || '',
              date: parsed.date ? parsed.date.toISOString() : '',
              read: true,
              starred: false,
              hasAttachment: (parsed.attachments?.length || 0) > 0,
              attachments: (parsed.attachments || []).map((att: any) => ({
                filename: att.filename,
                size: att.size,
                contentType: att.contentType,
              })),
              folder: 'inbox',
              labels: [],
            },
          });
        } finally {
          lock.release();
        }
      } catch (error: any) {
        console.error("[Email] IMAP message detail error:", error?.message);
        res.status(500).json({ error: "Failed to fetch email" });
      } finally {
        if (client) try { await client.logout(); } catch {}
      }
      return;
    }

    res.json({ error: "Provider not yet configured for message detail" });
  } catch (error: any) {
    console.error("[Email] Error fetching message:", error?.message);
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

/**
 * POST /send — Send email through the agent's connected account
 */
router.post("/send", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const connection = await getConnection(userId);

    if (!connection) {
      return res.status(400).json({ error: "No email account connected", code: "NOT_CONNECTED" });
    }

    const { to, subject, body, cc, bcc } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: "to and subject are required" });
    }

    if (connection.provider === "gmail") {
      const gmail = getAgentGmailClient(connection);

      const messageParts = [
        'Content-Type: text/html; charset="UTF-8"',
        "MIME-Version: 1.0",
        "Content-Transfer-Encoding: 8bit",
        `From: ${connection.display_name} <${connection.email_address}>`,
        `To: ${to}`,
      ];

      if (cc) messageParts.push(`Cc: ${cc}`);
      if (bcc) messageParts.push(`Bcc: ${bcc}`);
      messageParts.push(`Subject: ${subject}`, "", body || "");

      const raw = Buffer.from(messageParts.join("\n"))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const sendResult = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      return res.json({ success: true, messageId: sendResult.data.id });
    }

    if (connection.provider === 'imap' || connection.provider === 'outlook') {
      try {
        const transport = createSmtpTransport(connection);
        const result = await transport.sendMail({
          from: `"${connection.display_name || connection.email_address.split('@')[0]}" <${connection.email_address}>`,
          to,
          cc: cc || undefined,
          subject,
          html: body,
        });

        // Track in emails_sent table
        try {
          await pool.query(`
            INSERT INTO emails_sent (from_agent_id, to_email, subject, body_html, message_id, status)
            VALUES ($1, $2, $3, $4, $5, 'sent')
          `, [userId, to, subject, body, result.messageId || null]);
        } catch (trackErr) {
          // Don't fail the send if tracking fails
          console.error("[Email] Failed to track sent email:", trackErr);
        }

        res.json({ success: true, messageId: result.messageId });
      } catch (error: any) {
        console.error("[Email] SMTP send error:", error?.message);
        res.status(500).json({ error: "Failed to send email: " + (error?.message || 'Unknown error') });
      }
      return;
    }

    res.status(501).json({ error: "Provider not supported" });
  } catch (error: any) {
    console.error("[Email] Error sending email:", error?.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

/**
 * POST /messages/:id/star — Toggle star on a message
 */
router.post("/messages/:id/star", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const messageId = req.params.id;
    const connection = await getConnection(userId);

    if (!connection) {
      return res.status(400).json({ error: "No email account connected" });
    }

    if (connection.provider === 'imap' || connection.provider === 'outlook') {
      let client: ImapFlow | null = null;
      try {
        client = await createImapConnection(connection);
        const lock = await client.getMailboxLock('INBOX');
        try {
          const uid = parseInt(messageId);
          await client.messageFlagsAdd(uid.toString(), ['\\Flagged'], { uid: true });
          res.json({ success: true, starred: true });
        } finally { lock.release(); }
      } catch (error: any) {
        res.status(500).json({ error: "Failed to star email" });
      } finally { if (client) try { await client.logout(); } catch {} }
      return;
    }

    if (connection.provider !== "gmail") {
      return res.status(400).json({ error: "Provider not supported for this operation" });
    }

    const gmail = getAgentGmailClient(connection);

    // Get current labels to determine toggle direction
    const { data } = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "minimal",
    });

    const isStarred = data.labelIds?.includes("STARRED");

    if (isStarred) {
      await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: { removeLabelIds: ["STARRED"] },
      });
    } else {
      await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: { addLabelIds: ["STARRED"] },
      });
    }

    res.json({ success: true, starred: !isStarred });
  } catch (error: any) {
    console.error("[Email] Error toggling star:", error?.message);
    res.status(500).json({ error: "Failed to toggle star" });
  }
});

/**
 * POST /messages/:id/read — Mark message as read
 */
router.post("/messages/:id/read", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const messageId = req.params.id;
    const connection = await getConnection(userId);

    if (!connection) {
      return res.status(400).json({ error: "No email account connected" });
    }

    if (connection.provider === 'imap' || connection.provider === 'outlook') {
      let client: ImapFlow | null = null;
      try {
        client = await createImapConnection(connection);
        const lock = await client.getMailboxLock('INBOX');
        try {
          await client.messageFlagsAdd(parseInt(messageId).toString(), ['\\Seen'], { uid: true });
          res.json({ success: true });
        } finally { lock.release(); }
      } catch (error: any) {
        res.status(500).json({ error: "Failed to mark as read" });
      } finally { if (client) try { await client.logout(); } catch {} }
      return;
    }

    if (connection.provider !== "gmail") {
      return res.status(400).json({ error: "Provider not supported for this operation" });
    }

    const gmail = getAgentGmailClient(connection);
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { removeLabelIds: ["UNREAD"] },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Email] Error marking as read:", error?.message);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/**
 * DELETE /messages/:id — Trash a message
 */
router.delete("/messages/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const messageId = req.params.id;
    const connection = await getConnection(userId);

    if (!connection) {
      return res.status(400).json({ error: "No email account connected" });
    }

    if (connection.provider === 'imap' || connection.provider === 'outlook') {
      let client: ImapFlow | null = null;
      try {
        client = await createImapConnection(connection);
        const lock = await client.getMailboxLock('INBOX');
        try {
          await client.messageMove(parseInt(messageId).toString(), 'Trash', { uid: true });
          res.json({ success: true });
        } finally { lock.release(); }
      } catch (error: any) {
        res.status(500).json({ error: "Failed to delete email" });
      } finally { if (client) try { await client.logout(); } catch {} }
      return;
    }

    if (connection.provider !== "gmail") {
      return res.status(400).json({ error: "Provider not supported for this operation" });
    }

    const gmail = getAgentGmailClient(connection);
    await gmail.users.messages.trash({
      userId: "me",
      id: messageId,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Email] Error trashing message:", error?.message);
    res.status(500).json({ error: "Failed to trash email" });
  }
});

// =============================================================================
// LEGACY ENDPOINTS (preserved for backward compatibility)
// =============================================================================

/**
 * GET /sent — List sent emails from emails_sent tracking table
 */
router.get("/sent", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT id, to_email, subject, body_html, status, sent_at,
              delivered_at, opened_at, open_count, click_count, lead_id
       FROM emails_sent
       WHERE from_agent_id = $1
       ORDER BY sent_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int as total FROM emails_sent WHERE from_agent_id = $1`,
      [userId]
    );

    const emails = result.rows.map((r: any) => ({
      id: r.id,
      to: r.to_email,
      subject: r.subject,
      bodyHtml: r.body_html,
      status: r.status,
      sentAt: r.sent_at,
      deliveredAt: r.delivered_at,
      openedAt: r.opened_at,
      openCount: r.open_count,
      clickCount: r.click_count,
      leadId: r.lead_id,
    }));

    res.json({ emails, total: countResult.rows[0]?.total || 0 });
  } catch (error: any) {
    console.error("[Email] Error fetching sent emails:", error?.message);
    res.status(500).json({ error: "Failed to fetch sent emails" });
  }
});

/**
 * GET /stats — Email stats for current agent
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT
        COUNT(*)::int as total_sent,
        COUNT(*) FILTER (WHERE status = 'delivered')::int as delivered,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int as opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::int as clicked,
        COUNT(*) FILTER (WHERE status = 'bounced')::int as bounced
       FROM emails_sent
       WHERE from_agent_id = $1`,
      [userId]
    );

    res.json(result.rows[0] || { total_sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 });
  } catch (error: any) {
    console.error("[Email] Error fetching stats:", error?.message);
    res.status(500).json({ error: "Failed to fetch email stats" });
  }
});

export default router;

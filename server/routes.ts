import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertQuoteRequestSchema, insertContactMessageSchema, insertJobApplicationSchema, loginSchema, registerSchema, agentRegisterSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendContactNotification, sendQuoteNotification, sendQuoteConfirmationToApplicant, sendPortalMessage, sendMeetingNotification, sendJobApplicationNotification, sendPrivacyRequestNotification, sendSecureFormEmail, sendBookingLinkEmail, sendRecruitInviteEmail, sendPolicyQuoteEmail, sendAgentLeadNotification, sendWebsiteLinkEmail, sendPasswordResetEmail, sendProductGuideEmail } from "./gmail";
import { requestEmailOtp, verifyEmailOtp } from "./services/emailOtp";
import {
  buildRegistrationOptions as webauthnBuildRegistrationOptions,
  consumeRegistration as webauthnConsumeRegistration,
  buildAuthenticationOptions as webauthnBuildAuthenticationOptions,
  consumeAuthentication as webauthnConsumeAuthentication,
  listCredentials as webauthnListCredentials,
  deleteCredential as webauthnDeleteCredential,
} from "./services/webauthn";
import { sendSecureFormLink, sendBookingLink, sendSms, isSmsAvailable } from "./services/smsService";
import { encryptField, decryptField } from "./services/encryptionService";
import * as s3Service from "./services/s3Service";
import multer from "multer";
// Google Calendar routes now handled by server/routes/calendar.ts
import { addLeadToSheet } from "./sheets";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import agentNotificationsRouter from "./routes/agent-notifications";
import adminProductsRouter from "./routes/admin-products";
import adminContentRouter from "./routes/admin-content";
import adminCrmRouter from "./routes/admin-crm";
import adminImagesRouter from "./routes/admin-images";
import adminEmailTestRouter from "./routes/admin-email-test";
import contentRouter from "./routes/content";
import quotesRouter from "./routes/quotes";
import avatarCouncilRouter from "./routes/avatar-council";
import crmRouter from "./routes/crm";
import devicesRouter from "./routes/devices";
import appRouter from "./routes/app";
import memberCardsRouter from "./routes/member-cards";
import walletRouter from "./routes/wallet";
import verifyRouter from "./routes/verify";
import hierarchyRouter from "./routes/hierarchy";
import hierarchyRequestsRouter from "./routes/hierarchy-requests";
import commissionTargetsRouter from "./routes/commission-targets";
import clientChatRouter from "./routes/client-chat";
import automationsRouter from "./routes/automations";
import workflowAutomationsRouter from "./routes/workflow-automations";
import licensesRouter from "./routes/licenses";
import policiesRouter from "./routes/policies";
import smsRouter from "./routes/sms";
import loungeAccessRouter from "./routes/lounge-access";
import onboardingRouter from "./routes/onboarding";
import clientPortalRouter from "./routes/client-portal";
import claimsRouter from "./routes/claims";
import referralsRouter from "./routes/referrals";
import agentClientsRouter from "./routes/agent-clients";
import leadDistributionRouter from "./routes/lead-distribution";
import callsRouter, { telnyxTokenHandler, voiceTokenTimeoutMiddleware } from "./routes/calls";
import monitorRouter from "./routes/monitor";
import dncRouter from "./routes/dnc";
import executiveRouter from "./routes/executive";
import postCloseRouter, { postCloseWebhookRouter } from "./routes/post-close";
import dealsRouter from "./routes/deals";
import leadPurchasesRouter, { leadPurchasesWebhookRouter } from "./routes/lead-purchases";
import businessCardRouter, { publicBusinessCardRouter } from "./routes/business-card";
import snapchatAuthRouter from "./routes/snapchat-auth";
import commissionsRouter from "./routes/commissions";
import emailRouter from "./routes/email";
import trainingSessionsRouter from "./routes/training-sessions";
import calendarRouter from "./routes/calendar";
import bookOfBusinessRouter from "./routes/book-of-business";
import recruitingRouter from "./routes/recruiting";
import scriptsRouter from "./routes/scripts";
import achievementsRouter from "./routes/achievements";
import ideasRouter from "./routes/ideas";
import documentTemplatesRouter from "./routes/document-templates";
import { bootstrapAgentSystem } from "./agents";
import { createAgentRoutes } from "./agents/api-routes";

// Rate limiting middleware
import {
  loginLimiter,
  registrationLimiter,
  quoteLimiter,
  passwordResetLimiter,
  twoFactorLimiter,
  contactFormLimiter,
  websiteEmailLimiter,
} from "./middleware/rateLimiter";

// Security services
import { handleLoginAttempt } from "./services/accountLockoutService";
import { logLogin, logLogout, logLoginFailed, logPasswordChange, log2FAEnabled, log2FADisabled, log2FAVerified, getAuditContext } from "./services/auditService";
import { createPasswordResetToken, resetPassword, verifyPasswordResetToken } from "./services/passwordResetService";

// RBAC Middleware
import {
  attachUser,
  requireAuth as rbacRequireAuth,
  requireRole,
  requireAdmin,
  requirePermission,
  require2FA,
  requireAILounge,
} from "./middleware/auth";
import { Permission, Roles } from "./types/permissions";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Share the single connection pool with the Drizzle ORM (server/db.ts).
// Was previously a separate `new Pool({...})` with default settings — that
// gave us two independent pools both pointing at the same Neon DB,
// competing for the connection budget. Under any load, either pool could
// exhaust and middleware would hang. See server/db.ts header comment.
import { pool } from "./db";

const PgSession = connectPgSimple(session);

// Session middleware is built once and reused by both Express (every REST
// route) AND the WebSocket upgrade handlers in server/websocket{,-avatars}.ts
// + server/websocket/GCFWebSocketServer.ts. Reusing the same function means
// the upgrade request goes through the exact same session lookup as a
// regular HTTP request — same PG store, same cookie name (`connect.sid`),
// same expiry. Without this, WS endpoints had to invent their own auth
// (the old `?userId=<id>` query-string pattern) and were trivially
// impersonatable + flaky on race conditions.
let _sessionMiddleware: ReturnType<typeof session> | null = null;

export function getSessionMiddleware(): ReturnType<typeof session> {
  if (_sessionMiddleware) return _sessionMiddleware;

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  _sessionMiddleware = session({
    store: new PgSession({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax", // SECURITY: Changed from 'none' to 'lax' for better security
    },
  });

  return _sessionMiddleware;
}

export function setupSession(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSessionMiddleware());
}

// Legacy requireAuth - now uses RBAC middleware internally
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Export RBAC utilities for use in route files
export { requireRole, requireAdmin, requirePermission, require2FA, requireAILounge, Permission, Roles };

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Multer config for client portal file uploads
  const portalUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  // Health check endpoint (doesn't require database)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  setupSession(app);

  // Attach user to all requests (populates req.user if authenticated)
  app.use(attachUser);

  // Auth: Register new user (rate limited)
  app.post("/api/auth/register", registrationLimiter, async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });
  
  // Auth: Check email availability (for registration form)
  app.get("/api/auth/check-email", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) return res.status(400).json({ error: "Email required" });
      const existing = await storage.getUserByEmail(email);
      res.json({ available: !existing });
    } catch (error) {
      res.status(500).json({ error: "Failed to check email" });
    }
  });

  // Public: Available uplines for registration dropdown (no auth required)
  app.get("/api/agents/available-uplines", async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName",
               h.hierarchy_title AS "title"
        FROM users u
        JOIN agent_hierarchy h ON u.id = h.agent_user_id AND h.effective_to IS NULL
        WHERE u.is_active = true
          AND u.role IN ('owner', 'system_admin', 'manager', 'sales_agent')
        ORDER BY h.hierarchy_level ASC, u.last_name ASC
      `);
      res.json({ agents: result.rows });
    } catch (error) {
      console.error("Error fetching available uplines:", error);
      res.json({ agents: [] });
    }
  });

  // Auth: Register new agent (multi-step, rate limited)
  app.post("/api/auth/register-agent", registrationLimiter, async (req, res) => {
    try {
      const validatedData = agentRegisterSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user with isActive = false (pending approval)
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        role: "sales_agent",
        isActive: false,
      });

      // Create agent profile
      await storage.createAgentProfile({
        userId: user.id,
        dateOfBirth: validatedData.dateOfBirth,
        streetAddress: validatedData.streetAddress,
        addressLine2: validatedData.addressLine2 || null,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        isLicensed: validatedData.isLicensed,
        licenseNumber: validatedData.licenseNumber || null,
        licensedStates: validatedData.licensedStates || null,
        yearsExperience: validatedData.yearsExperience,
        previousAgency: validatedData.previousAgency || null,
        npn: validatedData.npn || null,
        interestedProducts: validatedData.interestedProducts,
        whyJoinHeritage: validatedData.whyJoinHeritage,
        referralSource: validatedData.referralSource,
        referringAgentName: validatedData.referringAgentName || null,
        preferredUplineId: validatedData.preferredUplineId || null,
        approvalStatus: "pending_review",
        agreedToTerms: validatedData.agreedToTerms,
        agreedToPrivacy: validatedData.agreedToPrivacy,
        consentedAt: new Date(),
      });

      // M-4 (audit 2026-05-12): don't log raw email — it's PII and ends up
      // in centralized log aggregators. The user_id is enough for forensics.
      console.log(`[Registration] New agent application user_id=${user.id}`);

      res.status(201).json({
        success: true,
        status: "pending_review",
        message: "Your application has been submitted. We'll review it and get back to you soon.",
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error registering agent:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Auth: Register new client (simplified, rate limited)
  app.post("/api/auth/register-client", registrationLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, first name, and last name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      // Validate password
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with client role (immediately active, no approval needed)
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: "client",
      });

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (error: any) {
      console.error("Error registering client:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Auth: Setup password from invite link (client onboarding)
  app.post("/api/auth/setup-password", async (req, res) => {
    try {
      const { token, password, confirmPassword } = req.body;

      if (!token || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
      }
      if (!/[a-z]/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one number" });
      }

      // Find users with pending invite tokens that haven't expired
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE invite_token IS NOT NULL AND invite_token_expires_at > NOW()`
      );

      let matchedUser = null;
      for (const row of rows) {
        const match = await bcrypt.compare(token, row.invite_token);
        if (match) {
          matchedUser = row;
          break;
        }
      }

      if (!matchedUser) {
        return res.status(400).json({ error: "Invalid or expired invite link" });
      }

      // Hash the new password and update user
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET
          password = $1,
          invite_token = NULL,
          invite_token_expires_at = NULL,
          password_reset_required = false,
          onboarding_status = 'welcome_sent',
          updated_at = NOW()
        WHERE id = $2`,
        [hashedPassword, matchedUser.id]
      );

      // Create session
      req.session.userId = matchedUser.id;

      res.json({
        success: true,
        user: {
          id: matchedUser.id,
          email: matchedUser.email,
          firstName: matchedUser.first_name,
          lastName: matchedUser.last_name,
          role: matchedUser.role,
        },
      });
    } catch (error) {
      console.error("[SetupPassword] Error:", error);
      res.status(500).json({ error: "Failed to set up password" });
    }
  });

  // Auth: Login (rate limited with account lockout)
  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Record failed attempt even if user doesn't exist (prevents user enumeration timing attacks)
        await handleLoginAttempt(validatedData.email, false, req);
        await logLoginFailed(validatedData.email, getAuditContext(req));
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const isValid = await bcrypt.compare(validatedData.password, user.password);

      // Handle login attempt (checks lockout and records attempt)
      const attemptResult = await handleLoginAttempt(validatedData.email, isValid, req);

      if (!attemptResult.allowed) {
        return res.status(429).json({
          error: attemptResult.message || "Account temporarily locked",
          locked: true
        });
      }

      if (!isValid) {
        await logLoginFailed(validatedData.email, getAuditContext(req));
        return res.status(401).json({
          error: "Invalid email or password",
          warning: attemptResult.message // Shows remaining attempts if low
        });
      }

      // Check if account is active (pending approval)
      if (!user.isActive) {
        return res.status(403).json({
          error: "Your account is pending approval. We'll email you when it's been reviewed.",
          pendingApproval: true,
        });
      }

      // Set session
      req.session.userId = user.id;

      // Log successful login for audit
      await logLogin(user.id, getAuditContext(req));

      // Update lastLoginAt and notify agent on first client login
      try {
        const isFirstLogin = !user.lastLoginAt;
        await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        // If first login AND client role, notify their assigned agent
        if (isFirstLogin && user.role === 'client' && user.assignedAgentId) {
          await storage.createNotification({
            userId: user.assignedAgentId,
            title: 'Client First Login',
            message: `${user.firstName} ${user.lastName} just logged into their client portal for the first time!`,
            type: 'alert',
            isRead: false,
            actionUrl: `/agents/clients/${user.id}`,
          });
        }
      } catch {}

      // Return user without password
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });
  
  // Auth: Logout
  app.post("/api/auth/logout", async (req, res) => {
    const userId = req.session.userId;
    const auditContext = getAuditContext(req);

    req.session.destroy(async (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }

      // Log logout for audit
      if (userId) {
        await logLogout(userId, auditContext);
      }

      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth: Sign in with Apple
  app.post("/api/auth/apple", loginLimiter, async (req, res) => {
    try {
      const { identityToken, authorizationCode, firstName, lastName, email } = req.body;

      if (!identityToken || !authorizationCode) {
        return res.status(400).json({ error: "Missing Apple authentication data" });
      }

      // Decode the identity token to get user info
      // The identity token is a JWT from Apple containing the user's Apple ID
      const tokenParts = identityToken.split('.');
      if (tokenParts.length !== 3) {
        return res.status(400).json({ error: "Invalid identity token format" });
      }

      let appleUserId: string;
      let appleEmail: string | null = null;

      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        appleUserId = payload.sub; // Apple user ID
        appleEmail = payload.email || email; // Email from token or request

        // Verify token issuer and audience
        if (payload.iss !== 'https://appleid.apple.com') {
          return res.status(401).json({ error: "Invalid token issuer" });
        }

        // Check token expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return res.status(401).json({ error: "Token expired" });
        }
      } catch (parseError) {
        return res.status(400).json({ error: "Failed to parse identity token" });
      }

      if (!appleUserId) {
        return res.status(400).json({ error: "Could not extract user ID from token" });
      }

      // Look for existing user with this Apple ID
      let user = await storage.getUserByAppleId(appleUserId);

      if (!user && appleEmail) {
        // Check if user exists with this email
        user = await storage.getUserByEmail(appleEmail);

        if (user) {
          // Link Apple ID to existing account
          await storage.updateUser(user.id, { appleId: appleUserId });
        }
      }

      if (!user) {
        // Create new user with Apple credentials
        if (!appleEmail) {
          return res.status(400).json({ error: "Email is required for new accounts" });
        }

        // Generate a secure random password (user won't need it for Apple login)
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await storage.createUser({
          email: appleEmail,
          password: hashedPassword,
          firstName: firstName || 'Apple',
          lastName: lastName || 'User',
          phone: null,
          appleId: appleUserId,
        });
      }

      // Set session
      req.session.userId = user.id;

      // Log successful login for audit
      await logLogin(user.id, getAuditContext(req));

      // Return user without password
      const { password, twoFactorSecret, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      console.error("Error with Apple sign in:", error);
      res.status(500).json({ error: "Failed to sign in with Apple" });
    }
  });

  // Auth: Get current user
  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }

      const { password, twoFactorSecret, ...safeUser } = user;
      // Merge in the session-scoped 2FA flag. Without this the response
      // only carries `twoFactorEnabled` (DB-persistent) and the client sees
      // `twoFactorVerified: undefined` → Force2FAGate bounces to /auth/2fa
      // forever, even after a successful verify (see also auth middleware
      // line ~79 which does the same merge on every gated request).
      res.json({
        user: {
          ...safeUser,
          twoFactorVerified: req.session.twoFactorVerified ?? false,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // =============================================================================
  // PASSWORD RESET ROUTES
  // =============================================================================

  // Request password reset (rate limited)
  app.post("/api/auth/forgot-password", passwordResetLimiter, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      const auditContext = getAuditContext(req);
      const result = await createPasswordResetToken(
        email,
        auditContext.ipAddress,
        auditContext.userAgent
      );

      // Always return success to prevent email enumeration
      // In production, send the email with the reset link
      if (result) {
        const appUrl = process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://heritagels.org" : "http://localhost:4500");
        const resetLink = `${appUrl}/reset-password?token=${result.token}`;
        try {
          await sendPasswordResetEmail({ recipientEmail: email, resetLink });
        } catch (emailErr) {
          console.error("[PasswordReset] Failed to send email:", emailErr);
        }
      }

      res.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link shortly.",
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Verify reset token (for client-side validation)
  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ valid: false, error: "Token is required" });
      }

      const result = await verifyPasswordResetToken(token);
      res.json(result);
    } catch (error) {
      console.error("Error verifying reset token:", error);
      res.status(500).json({ valid: false, error: "Failed to verify token" });
    }
  });

  // Reset password with token (rate limited)
  app.post("/api/auth/reset-password", passwordResetLimiter, async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Reset token is required" });
      }

      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const auditContext = getAuditContext(req);
      const result = await resetPassword(
        token,
        newPassword,
        auditContext.ipAddress,
        auditContext.userAgent
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // =============================================================================
  // TWO-FACTOR AUTHENTICATION ROUTES
  // =============================================================================

  // Setup 2FA - returns QR code
  app.post("/api/ai/2fa/setup", requireAuth, async (req, res) => {
    try {
      const { setup2FA } = await import("./services/twoFactorService");
      const result = await setup2FA(req.session.userId!);

      if (!result) {
        return res.status(500).json({ error: "Failed to set up 2FA" });
      }

      res.json({
        qrCodeDataUrl: result.qrCodeDataUrl,
        manualEntryKey: result.manualEntryKey,
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ error: "Failed to set up 2FA" });
    }
  });

  // Verify 2FA token (for both setup and session verification) - rate limited
  app.post("/api/ai/2fa/verify", requireAuth, twoFactorLimiter, async (req, res) => {
    try {
      const { token } = req.body;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token is required" });
      }

      const { verify2FA } = await import("./services/twoFactorService");
      const result = await verify2FA(req.session.userId!, token, true);

      if (!result.success) {
        await log2FAVerified(req.session.userId!, false, getAuditContext(req));
        return res.status(400).json({ error: result.message });
      }

      // Mark session as 2FA verified
      req.session.twoFactorVerified = true;

      // Log 2FA verification (also counts as enabling if first time)
      await log2FAVerified(req.session.userId!, true, getAuditContext(req));
      if (result.message?.includes('enabled')) {
        await log2FAEnabled(req.session.userId!, getAuditContext(req));
      }

      res.json({
        success: true,
        message: result.message,
        twoFactorVerified: true,
      });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ error: "Failed to verify 2FA" });
    }
  });

  // Disable 2FA
  app.delete("/api/ai/2fa", requireAuth, async (req, res) => {
    try {
      const { token } = req.body;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Current 2FA token is required" });
      }

      const { disable2FA } = await import("./services/twoFactorService");
      const result = await disable2FA(req.session.userId!, token);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      // Clear 2FA session flag
      req.session.twoFactorVerified = false;

      // Log 2FA disabled
      await log2FADisabled(req.session.userId!, getAuditContext(req));

      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  // Check 2FA status
  app.get("/api/ai/2fa/status", requireAuth, async (req, res) => {
    try {
      const { is2FAEnabled } = await import("./services/twoFactorService");
      const enabled = await is2FAEnabled(req.session.userId!);

      res.json({
        enabled,
        verified: req.session.twoFactorVerified ?? false,
      });
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      res.status(500).json({ error: "Failed to check 2FA status" });
    }
  });

  // ─── Email-code 2FA (gcf-style) ─────────────────────────────────────────
  // First-time enrollment: send a 6-digit code → verify → flip
  // users.twoFactorEnabled=true and mark session verified. Returning user:
  // request/verify to mark current session as 2FA-verified.
  app.post("/api/auth/2fa/email/enroll/begin", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (req.user.twoFactorEnabled) {
      return res.status(409).json({ error: "2FA is already enabled" });
    }
    try {
      const result = await requestEmailOtp({
        userId: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
      });
      res.json({ ok: true, rateLimited: !!result.rateLimited, email: req.user.email });
    } catch (e: any) {
      console.error("[2fa/email/enroll/begin]:", e?.message);
      res.status(500).json({ error: "Failed to send code" });
    }
  });

  app.post("/api/auth/2fa/email/enroll/verify", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const code = String((req.body as any)?.code || "").trim();
    if (!code) return res.status(400).json({ error: "Code required" });
    try {
      const result = await verifyEmailOtp({ userId: req.user.id, code });
      if (!result.ok) {
        const status = result.reason === "too-many-attempts" || result.reason === "expired" ? 410 : 401;
        return res.status(status).json({
          error:
            result.reason === "expired" ? "Code expired — request a new one"
            : result.reason === "too-many-attempts" ? "Too many wrong tries — request a new code"
            : result.reason === "no-active-code" ? "No active code — request a new one"
            : "Invalid code",
          code: result.reason,
        });
      }
      await pool.query(`UPDATE users SET two_factor_enabled = true, updated_at = NOW() WHERE id = $1`, [req.user.id]);
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("[2fa/email/enroll/verify]:", e?.message);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.post("/api/auth/2fa/email/request", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      const result = await requestEmailOtp({
        userId: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
      });
      res.json({ ok: true, rateLimited: !!result.rateLimited });
    } catch (e: any) {
      console.error("[2fa/email/request]:", e?.message);
      res.status(500).json({ error: "Failed to send code" });
    }
  });

  app.post("/api/auth/2fa/email/verify", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const code = String((req.body as any)?.code || "").trim();
    if (!code) return res.status(400).json({ error: "Code required" });
    try {
      const result = await verifyEmailOtp({ userId: req.user.id, code });
      if (!result.ok) {
        const status = result.reason === "too-many-attempts" || result.reason === "expired" ? 410 : 401;
        return res.status(status).json({
          error:
            result.reason === "expired" ? "Code expired — request a new one"
            : result.reason === "too-many-attempts" ? "Too many wrong tries — request a new code"
            : result.reason === "no-active-code" ? "No active code — request a new one"
            : "Invalid code",
          code: result.reason,
        });
      }
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("[2fa/email/verify]:", e?.message);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // ─── WebAuthn / passkeys (Touch ID / Face ID) ────────────────────────
  app.post("/api/auth/webauthn/register/begin", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      const existing = await webauthnListCredentials(req.user.id);
      if (existing.length > 0) {
        if (!req.user.twoFactorEnabled) {
          await pool.query(`UPDATE users SET two_factor_enabled = true, updated_at = NOW() WHERE id = $1`, [req.user.id]);
        }
        (req.session as any).twoFactorVerified = true;
        return res.status(200).json({
          ok: true,
          alreadyEnrolled: true,
          message: "Passkey already enrolled — using existing credential.",
        });
      }
      const options = await webauthnBuildRegistrationOptions({
        userId: req.user.id,
        userEmail: req.user.email,
        userName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim(),
        req,
      });
      (req.session as any).webauthnChallenge = options.challenge;
      res.json(options);
    } catch (e: any) {
      console.error("[webauthn/register/begin]:", e?.message);
      res.status(500).json({ error: "Failed to start passkey registration" });
    }
  });

  app.post("/api/auth/webauthn/register/finish", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const expectedChallenge = (req.session as any).webauthnChallenge as string | undefined;
    if (!expectedChallenge) return res.status(400).json({ error: "No registration in progress" });
    try {
      const result = await webauthnConsumeRegistration({
        userId: req.user.id,
        expectedChallenge,
        body: (req.body as any)?.attestation || req.body,
        nickname: (req.body as any)?.nickname,
        req,
      });
      delete (req.session as any).webauthnChallenge;
      if (!result.ok) return res.status(400).json({ error: result.reason });
      await pool.query(`UPDATE users SET two_factor_enabled = true, updated_at = NOW() WHERE id = $1`, [req.user.id]);
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("[webauthn/register/finish]:", e?.message);
      res.status(500).json({ error: "Failed to register passkey" });
    }
  });

  app.post("/api/auth/webauthn/auth/begin", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      const options = await webauthnBuildAuthenticationOptions({ userId: req.user.id, req });
      if (!options) return res.status(404).json({ error: "No passkey enrolled" });
      (req.session as any).webauthnChallenge = options.challenge;
      res.json(options);
    } catch (e: any) {
      console.error("[webauthn/auth/begin]:", e?.message);
      res.status(500).json({ error: "Failed to start passkey authentication" });
    }
  });

  app.post("/api/auth/webauthn/auth/finish", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const expectedChallenge = (req.session as any).webauthnChallenge as string | undefined;
    if (!expectedChallenge) return res.status(400).json({ error: "No authentication in progress" });
    try {
      const result = await webauthnConsumeAuthentication({
        userId: req.user.id,
        expectedChallenge,
        body: (req.body as any)?.assertion || req.body,
        req,
      });
      delete (req.session as any).webauthnChallenge;
      if (!result.ok) return res.status(401).json({ error: result.reason });
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("[webauthn/auth/finish]:", e?.message);
      res.status(500).json({ error: "Failed to verify passkey" });
    }
  });

  app.get("/api/auth/webauthn/credentials", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      res.json(await webauthnListCredentials(req.user.id));
    } catch (e: any) {
      console.error("[webauthn/credentials list]:", e?.message);
      res.status(500).json({ error: "Failed to list passkeys" });
    }
  });

  app.delete("/api/auth/webauthn/credentials/:id", requireAuth, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const id = req.params.id;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid id" });
    try {
      const ok = await webauthnDeleteCredential(req.user.id, id);
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (e: any) {
      console.error("[webauthn/credentials delete]:", e?.message);
      res.status(500).json({ error: "Failed to delete passkey" });
    }
  });

  // Quote request submission (rate limited)
  app.post("/api/quote-requests", quoteLimiter, async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);

      // Compute the auto-score / priority once — used by both the leads-table
      // mirror below AND the in-memory WebSocket broadcast further down.
      const coverageNum = parseInt(String(validatedData.coverageAmount).replace(/[^0-9]/g, '')) || 0;
      const birthYear = validatedData.birthDate ? new Date(validatedData.birthDate).getFullYear() : null;
      const age = birthYear ? new Date().getFullYear() - birthYear : null;
      const baseScore = Math.min(90, Math.max(30, Math.round(coverageNum / 10000) * 5 + 40));
      const leadScore = age && age >= 30 && age <= 55 ? Math.min(95, baseScore + 10) : baseScore;
      const priority = coverageNum >= 500000 ? 'urgent' : coverageNum >= 250000 ? 'high' : coverageNum >= 100000 ? 'medium' : 'low';
      const scoreTier: 'cold' | 'warm' | 'hot' | 'on_fire' =
        leadScore >= 80 ? 'on_fire' : leadScore >= 60 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold';

      // Mirror into the shared `leads` table so the cross-deployment Founders
      // Lead Distribution surface (goldcoastfinancial.co) sees website quote
      // submissions in its Website tab. source='web_form' matches the
      // founders pool filter; sourceId links back to quote_requests.id for
      // traceability. Underwriting context (DOB, age, height, weight,
      // addressLine2, full medical background) lands in the
      // `enrichment_data` JSONB column so the founders LeadDetailDrawer can
      // render a full "Underwriting Info" card without re-querying
      // quote_requests. Best-effort: a leads-insert failure must NOT block
      // the quote_request response — the visitor's submission still confirmed.
      try {
        await storage.createLead({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone || null,
          streetAddress: validatedData.streetAddress || null,
          city: validatedData.city || null,
          state: validatedData.state || null,
          zipCode: validatedData.zipCode || null,
          source: 'web_form',
          sourceId: String(quoteRequest.id),
          status: 'new',
          priority,
          coverageType: validatedData.coverageType || null,
          coverageAmount: validatedData.coverageAmount ? String(validatedData.coverageAmount) : null,
          estimatedValue: coverageNum || null,
          leadScore,
          scoreTier,
          pipelineStage: 'new',
          notes: validatedData.medicalBackground || null,
          enrichmentData: {
            addressLine2: validatedData.addressLine2 || null,
            birthDate: validatedData.birthDate || null,
            age,
            height: validatedData.height || null,
            weight: validatedData.weight || null,
            // gender + tobacco are captured by the QuickQuoteWidget but not
            // currently in insertQuoteRequestSchema. If they're added there
            // later, surface them here too.
            medicalBackground: validatedData.medicalBackground || null,
            quoteRequestId: quoteRequest.id,
            submittedAt: new Date().toISOString(),
          },
        } as any);
      } catch (leadErr: any) {
        console.error("[QuoteRequests] Failed to mirror into leads table:", leadErr?.message);
      }

      // Broadcast new website lead to Executive Lead Distribution via WebSocket
      try {
        const wsServer = app.get('wsServer');
        if (wsServer) {
          const websiteLead = {
            type: 'new_website_lead',
            lead: {
              id: `quote-${quoteRequest.id}`,
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              email: validatedData.email,
              phone: validatedData.phone,
              streetAddress: validatedData.streetAddress,
              city: validatedData.city,
              state: validatedData.state,
              zipCode: validatedData.zipCode,
              source: 'website',
              priority,
              product: validatedData.coverageType,
              coverageType: validatedData.coverageType,
              estimatedValue: coverageNum,
              coverageAmountDisplay: validatedData.coverageAmount,
              leadScore,
              scoreTier,
              status: 'pool',
              distributedTo: null,
              assignedTo: null,
              distributedAt: null,
              assignedAt: null,
              pipelineStage: 'new',
              lastActivity: new Date().toISOString().slice(0, 10),
              nextFollowUp: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
              notes: '',
              importBatch: 'Website Quoter',
              importedAt: new Date().toISOString().slice(0, 10),
              birthDate: validatedData.birthDate,
              age,
              heightDisplay: validatedData.height,
              weightDisplay: validatedData.weight,
              medicalBackground: validatedData.medicalBackground,
              quoteRequestId: quoteRequest.id,
            },
            timestamp: Date.now(),
          };

          wsServer.broadcast('leads', websiteLead);
          console.log(`[LeadDistribution] Website lead broadcast: ${validatedData.firstName} ${validatedData.lastName} (${validatedData.coverageType})`);
        }
      } catch (wsError) {
        console.error("Error broadcasting website lead:", wsError);
      }

      res.status(201).json(quoteRequest);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: fromZodError(error).toString() 
        });
      }
      console.error("Error creating quote request:", error);
      res.status(500).json({ error: "Failed to submit quote request" });
    }
  });

  // Get all quote requests (admin endpoint)
  app.get("/api/quote-requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getQuoteRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      res.status(500).json({ error: "Failed to fetch quote requests" });
    }
  });

  // Contact message submission (rate limited)
  app.post("/api/contact-messages", contactFormLimiter, async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.createContactMessage(validatedData);
      
      // Send email notification
      try {
        console.log("Attempting to send contact notification email...");
        await sendContactNotification(validatedData);
        console.log("Contact notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending contact notification email:", emailError?.message || emailError);
      }
      
      res.status(201).json(contactMessage);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: fromZodError(error).toString() 
        });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Failed to submit contact message" });
    }
  });

  // Get all contact messages (admin endpoint)
  app.get("/api/contact-messages", requireAuth, requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  // Agent website lead submission (rate limited)
  app.post("/api/agent-leads", contactFormLimiter, async (req, res) => {
    try {
      const { firstName, lastName, email, phone, zipCode, productInterest, agentSlug, agentName, agentEmail, message } = req.body;

      if (!firstName || !lastName || !email || !agentSlug) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Store in lead inbox
      const leadId = `lead-web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      leadInboxStore.set(leadId, {
        leadId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        zipCode: zipCode || null,
        productInterest: productInterest || null,
        agentSlug,
        agentName: agentName || null,
        message: message || null,
        source: message ? 'schedule_call' : 'website',
        status: 'new',
        createdAt: new Date().toISOString(),
        readAt: null,
      });
      console.log(`[AgentLead] Stored lead ${leadId} for agent ${agentSlug}`);

      // Create in-app notification for the agent
      try {
        const allUsers = await storage.getAllAgentUsers();
        const agentUser = allUsers.find(u => {
          const slug = 'agent-' + `${u.firstName}${u.lastName}`.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          return slug === agentSlug;
        });
        if (agentUser) {
          const leadName = `${firstName} ${lastName}`;
          await storage.createNotification({
            userId: agentUser.id,
            title: 'New Lead from Your Website',
            message: `${leadName}${productInterest ? ` is interested in ${productInterest}` : ' submitted a contact request'}.`,
            type: 'new_lead',
            isRead: false,
            actionUrl: '/agents/inbox',
          });
          console.log(`[AgentLead] Notification created for agent ${agentUser.id}`);
        }
      } catch (notifErr) {
        console.error("[AgentLead] Failed to create notification:", notifErr);
        // Don't fail the lead submission if notification fails
      }

      res.status(201).json({ success: true, leadId });
    } catch (error: any) {
      console.error("[AgentLead] Error:", error);
      res.status(500).json({ error: "Failed to submit lead" });
    }
  });

  // Get website leads for a specific agent
  app.get("/api/agent-leads/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      if (!agentSlug) {
        return res.status(400).json({ error: "Agent slug is required" });
      }
      const leads = Array.from(leadInboxStore.values())
        .filter(lead => lead.agentSlug === agentSlug)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ leads });
    } catch (error: any) {
      console.error("[AgentLead] Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Mark a website lead as read
  app.patch("/api/agent-leads/:leadId/read", async (req, res) => {
    try {
      const { leadId } = req.params;
      const lead = leadInboxStore.get(leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      lead.readAt = new Date().toISOString();
      lead.status = 'read';
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Get all job applications
  app.get("/api/job-applications", requireAuth, requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ error: "Failed to fetch job applications" });
    }
  });

  // Meeting request submission
  app.post("/api/meeting-requests", async (req, res) => {
    try {
      const { name, email, phone, date, time, meetingType, topic, message } = req.body;
      
      if (!name || !email || !phone || !date || !time || !meetingType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Send email notification
      try {
        console.log("Attempting to send meeting notification email...");
        await sendMeetingNotification({
          name,
          email,
          phone,
          date,
          time,
          meetingType,
          topic: topic || 'Not specified',
          message: message || undefined
        });
        console.log("Meeting notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending meeting notification email:", emailError?.message || emailError);
        return res.status(500).json({ error: "Failed to send meeting request. Please try again." });
      }
      
      res.status(201).json({ success: true, message: "Meeting request sent successfully" });
    } catch (error: any) {
      console.error("Error processing meeting request:", error);
      res.status(500).json({ error: "Failed to submit meeting request" });
    }
  });

  // Secure data collection - Send encrypted form link via email
  app.post("/api/secure-forms/send", requireAuth, async (req, res) => {
    try {
      const {
        clientName,
        clientEmail,
        formType,
        carrier,
        carrierId,
        customMessage,
        sendMethod,
      } = req.body;

      // Validate required fields
      if (!clientName || !clientEmail || !formType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!carrierId) {
        return res.status(400).json({ error: "Carrier selection is required" });
      }

      // Sender identity comes from the session, NOT the request body. Trusting
      // body-supplied agent fields would let any authenticated user spoof
      // another agent's email and write rows under their identity, defeating
      // the per-user filter on GET /api/secure-forms.
      const senderId = req.user?.id;
      const senderEmail = req.user?.email;
      if (!senderId || !senderEmail) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const senderName =
        `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || senderEmail;
      const senderPhone = (req.user as any)?.phone || '';
      const agent = { name: senderName, email: senderEmail, phone: senderPhone };

      // Generate a unique secure link
      const linkId = crypto.randomBytes(16).toString('hex');
      // Use the app's base URL (in production, this would be the production domain)
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://heritagels.org'
        : `http://localhost:${process.env.PORT || 5000}`;
      const secureLink = `${baseUrl}/secure/form/${linkId}`;

      // Set expiration to 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Store form metadata in database. agent_id is the authoritative
      // owner reference (FK to users.id); agent_name/email/phone are kept
      // as denormalized display copy for carrier emails and SMS rendering.
      await pool.query(
        `INSERT INTO secure_forms (link_id, form_type, carrier_id, carrier_name, client_name, client_email, agent_id, agent_name, agent_email, agent_phone, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (link_id) DO UPDATE SET status = $11, expires_at = $12`,
        [linkId, formType, carrierId, carrier, clientName, clientEmail, senderId, agent.name, agent.email, agent.phone || '', 'pending', expiresAt]
      );

      console.log(`[SecureForm] Form created: ${linkId} for ${carrierId} - ${formType}`);

      // Only send email if sendMethod includes email
      if (sendMethod === 'email' || sendMethod === 'both') {
        try {
          await sendSecureFormEmail({
            clientName,
            clientEmail,
            formType,
            secureLink,
            expiresAt,
            carrier,
            carrierId,
            customMessage,
            agent: {
              name: agent.name,
              email: agent.email,
              phone: agent.phone || ''
            }
          });
          console.log(`[SecureForm] Email sent successfully to ${clientEmail}`);
        } catch (emailError: any) {
          console.error("[SecureForm] Error sending email:", emailError?.message || emailError);
          return res.status(500).json({
            error: "Failed to send email. Please check your Gmail configuration.",
            details: emailError?.message
          });
        }
      }

      // Send SMS with secure form link
      let smsSent = false;
      if ((sendMethod === 'sms' || sendMethod === 'both') && req.body.clientPhone && isSmsAvailable()) {
        try {
          await sendSecureFormLink(
            req.body.clientPhone,
            clientName,
            formType,
            secureLink,
            agent.name
          );
          smsSent = true;
          console.log(`[SecureForm] SMS sent successfully to ${req.body.clientPhone}`);
        } catch (smsError: any) {
          console.error("[SecureForm] Error sending SMS:", smsError?.message || smsError);
          // Don't fail the whole request if SMS fails but email succeeded
          if (sendMethod === 'sms') {
            return res.status(500).json({
              error: "Failed to send SMS.",
              details: smsError?.message
            });
          }
        }
      }

      res.status(201).json({
        success: true,
        message: "Secure form link sent successfully",
        linkId,
        secureLink,
        expiresAt: expiresAt.toISOString(),
        emailSent: sendMethod === 'email' || sendMethod === 'both',
        smsSent,
      });
    } catch (error: any) {
      console.error("[SecureForm] Error:", error);
      res.status(500).json({ error: "Failed to send secure form link" });
    }
  });

  // List secure forms for the requesting agent only — was previously
  // company-wide because the route had no auth gate and no WHERE clause.
  // Filters by agent_id (FK to users.id), the authoritative owner column
  // introduced in migration 0005. MUST be declared before the :linkId routes.
  app.get("/api/secure-forms", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const result = await pool.query(
        `SELECT link_id, form_type, carrier_id, carrier_name, client_name, client_email,
                agent_name, agent_email, status, created_at, expires_at, submitted_data
           FROM secure_forms
          WHERE agent_id = $1
          ORDER BY created_at DESC`,
        [userId]
      );

      const forms = result.rows.map((row: any) => ({
        linkId: row.link_id,
        formType: row.form_type,
        carrierId: row.carrier_id,
        carrierName: row.carrier_name,
        clientName: row.client_name,
        clientEmail: row.client_email,
        agentName: row.agent_name,
        agentEmail: row.agent_email,
        status: row.status,
        createdAt: row.created_at || row.expires_at,
        expiresAt: row.expires_at,
        hasSubmittedData: !!row.submitted_data
      }));

      res.json({ forms });
    } catch (error: any) {
      console.error("[SecureForm] Error listing forms:", error);
      res.status(500).json({ error: "Failed to list forms" });
    }
  });

  // Get secure form metadata by linkId
  app.get("/api/secure-forms/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      const result = await pool.query(`SELECT * FROM secure_forms WHERE link_id = $1`, [linkId]);
      const formData = result.rows[0];

      if (!formData) {
        return res.status(404).json({ error: "Form not found or has expired" });
      }

      // Check if expired
      if (new Date() > new Date(formData.expires_at)) {
        await pool.query(`UPDATE secure_forms SET status = $1 WHERE link_id = $2`, ['expired', linkId]);
        return res.status(410).json({ error: "This form link has expired", expired: true });
      }

      // Mark as opened if first access
      if (formData.status === 'pending') {
        await pool.query(`UPDATE secure_forms SET status = $1 WHERE link_id = $2`, ['opened', linkId]);
        formData.status = 'opened';
      }

      res.json({
        formType: formData.form_type,
        carrierId: formData.carrier_id,
        carrierName: formData.carrier_name,
        clientName: formData.client_name,
        agentName: formData.agent_name,
        expiresAt: new Date(formData.expires_at).toISOString(),
        status: formData.status
      });
    } catch (error: any) {
      console.error("[SecureForm] Error fetching form:", error);
      res.status(500).json({ error: "Failed to load form" });
    }
  });

  // Get submitted form data (for agents to view)
  app.get("/api/secure-forms/:linkId/data", async (req, res) => {
    try {
      const { linkId } = req.params;
      const result = await pool.query(`SELECT * FROM secure_forms WHERE link_id = $1`, [linkId]);
      const formData = result.rows[0];

      if (!formData) {
        return res.status(404).json({ error: "Form not found" });
      }

      if (formData.status !== 'completed') {
        return res.status(400).json({ error: "Form has not been submitted yet" });
      }

      // Decrypt sensitive PII fields before returning to agent (Sentinel — AES-256-GCM)
      let decryptedData = formData.submitted_data;
      if (decryptedData && typeof decryptedData === 'object') {
        const sensitiveFields = ['ssn', 'confirmSsn', 'routingNumber', 'accountNumber', 'accountConfirm', 'licenseNumber', 'idNumber'];
        for (const field of sensitiveFields) {
          if (decryptedData[field]) {
            try {
              decryptedData[field] = decryptField(decryptedData[field]);
            } catch {
              // Legacy unencrypted data — return as-is
            }
          }
        }
      }

      res.json({
        linkId,
        formType: formData.form_type,
        carrierId: formData.carrier_id,
        carrierName: formData.carrier_name,
        clientName: formData.client_name,
        agentName: formData.agent_name,
        status: formData.status,
        submittedData: decryptedData,
        submittedAt: formData.submitted_at || new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[SecureForm] Error getting form data:", error);
      res.status(500).json({ error: "Failed to get form data" });
    }
  });

  // Submit secure form data
  app.post("/api/secure-forms/:linkId/submit", async (req, res) => {
    try {
      const { linkId } = req.params;
      const result = await pool.query(`SELECT * FROM secure_forms WHERE link_id = $1`, [linkId]);
      const formData = result.rows[0];

      if (!formData) {
        return res.status(404).json({ error: "Form not found" });
      }

      if (new Date() > new Date(formData.expires_at)) {
        return res.status(410).json({ error: "This form link has expired" });
      }

      if (formData.status === 'completed') {
        return res.status(400).json({ error: "This form has already been submitted" });
      }

      // Encrypt sensitive PII fields before storing (Sentinel — AES-256-GCM)
      const submittedData = req.body.formData || req.body;
      const sensitiveFields = ['ssn', 'confirmSsn', 'routingNumber', 'accountNumber', 'accountConfirm', 'licenseNumber', 'idNumber'];
      const encryptedData = { ...submittedData };
      try {
        for (const field of sensitiveFields) {
          if (encryptedData[field]) {
            encryptedData[field] = encryptField(encryptedData[field]);
          }
        }
      } catch (encErr: any) {
        // If FIELD_ENCRYPTION_KEY is not set, log warning but still store plaintext
        console.warn('[SecureForm] PII encryption unavailable, storing plaintext:', encErr?.message);
      }

      await pool.query(
        `UPDATE secure_forms SET status = $1, submitted_data = $2, submitted_at = $3 WHERE link_id = $4`,
        ['completed', JSON.stringify(encryptedData), new Date(), linkId]
      );

      console.log(`[SecureForm] Form submitted (encrypted): ${linkId}`);

      // Notify the agent that the client submitted the form
      try {
        const formRecord = await pool.query(
          'SELECT agent_name, agent_email, client_name, form_type, carrier_name FROM secure_forms WHERE link_id = $1',
          [linkId]
        );
        const form = formRecord.rows[0];
        if (form?.agent_email) {
          const formTypeLabels: Record<string, string> = {
            ssn: 'Social Security Number',
            banking: 'Banking Information',
            drivers_license: "Driver's License / State ID",
            full_application: 'Full Application',
          };
          const formLabel = formTypeLabels[form.form_type] || form.form_type;
          await sendPortalMessage({
            senderName: form.client_name || 'Client',
            senderEmail: 'noreply@goldcoastfnl.com',
            recipientEmail: form.agent_email,
            recipientName: form.agent_name || 'Agent',
            subject: `Secure Form Completed - ${form.client_name}`,
            message: `${form.client_name} has completed their ${formLabel} form${form.carrier_name ? ` for ${form.carrier_name}` : ''}. You can view the submitted data in your Agent Portal under Data Encryption.`,
            priority: 'high',
          });
          console.log(`[SecureForm] Agent notification sent to ${form.agent_email}`);
        }
      } catch (notifyErr: any) {
        console.warn('[SecureForm] Agent notification failed:', notifyErr?.message);
      }

      res.json({
        success: true,
        message: "Your information has been securely submitted",
        submittedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[SecureForm] Error submitting form:", error);
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  // Resend secure form link — extend expiry and re-send email to client
  app.put("/api/secure-forms/:linkId/resend", requireAuth, async (req, res) => {
    try {
      const { linkId } = req.params;

      const result = await pool.query('SELECT * FROM secure_forms WHERE link_id = $1', [linkId]);
      if (!result.rows[0]) {
        return res.status(404).json({ error: "Form not found" });
      }

      const form = result.rows[0];

      // Don't resend completed forms
      if (form.status === 'completed') {
        return res.status(400).json({ error: "Form already completed" });
      }

      // Extend expiry by 24 hours from now
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await pool.query(
        'UPDATE secure_forms SET expires_at = $1, status = $2 WHERE link_id = $3',
        [newExpiry, 'pending', linkId]
      );

      // Re-send email to client
      try {
        const secureLink = `${process.env.APP_URL || 'https://heritagels.org'}/secure/form/${linkId}`;
        await sendSecureFormEmail({
          clientName: form.client_name,
          clientEmail: form.client_email,
          formType: form.form_type,
          secureLink,
          expiresAt: newExpiry,
          carrier: form.carrier_name || undefined,
          carrierId: form.carrier_id || undefined,
          customMessage: null as any,
          agent: {
            name: form.agent_name || '',
            email: form.agent_email || '',
            phone: form.agent_phone || '',
          },
        });
        console.log(`[SecureForm] Resent link for ${linkId} to ${form.client_email}`);
      } catch (emailErr: any) {
        console.error('[SecureForm] Resend email failed:', emailErr?.message);
      }

      res.json({ success: true, expiresAt: newExpiry.toISOString() });
    } catch (error: any) {
      console.error("[SecureForm] Error resending form:", error);
      res.status(500).json({ error: "Failed to resend form" });
    }
  });

  // Send booking link email to customer
  app.post("/api/booking-links/send", async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        meetingDuration,
        meetingType,
        customMessage,
        agent
      } = req.body;

      // Validate required fields
      if (!customerName || !customerEmail || !agent) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!agent.name || !agent.email) {
        return res.status(400).json({ error: "Agent information is required" });
      }

      // Generate the booking link based on agent name
      const agentSlug = agent.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://heritagels.org'
        : `http://localhost:${process.env.PORT || 5000}`;
      const bookingLink = `${baseUrl}/book/agent-${agentSlug}`;

      // Send email
      try {
        await sendBookingLinkEmail({
          customerName,
          customerEmail,
          bookingLink,
          meetingDuration: meetingDuration || '30',
          meetingType: meetingType || 'video',
          customMessage,
          agent: {
            name: agent.name,
            email: agent.email,
            phone: agent.phone || ''
          }
        });
        console.log(`[BookingLink] Email sent successfully to ${customerEmail}`);
      } catch (emailError: any) {
        console.error("[BookingLink] Error sending email:", emailError?.message || emailError);
        return res.status(500).json({
          error: "Failed to send email. Please check your Gmail configuration.",
          details: emailError?.message
        });
      }

      // Send SMS with booking link
      let smsSent = false;
      if (customerPhone && isSmsAvailable()) {
        try {
          await sendBookingLink(
            customerPhone,
            customerName,
            bookingLink,
            agent.name
          );
          smsSent = true;
          console.log(`[BookingLink] SMS sent successfully to ${customerPhone}`);
        } catch (smsError: any) {
          console.error("[BookingLink] Error sending SMS:", smsError?.message || smsError);
        }
      }

      res.status(201).json({
        success: true,
        smsSent,
        message: "Booking link sent successfully",
        bookingLink,
        emailSent: true,
      });
    } catch (error: any) {
      console.error("[BookingLink] Error:", error);
      res.status(500).json({ error: "Failed to send booking link" });
    }
  });

  // Send recruiting invite email to prospect
  app.post("/api/recruiting/send-invite", async (req, res) => {
    try {
      const {
        prospectName,
        prospectEmail,
        prospectPhone,
        customMessage,
        approach,
        agent
      } = req.body;

      if (!prospectName || !prospectEmail || !agent) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!agent.name || !agent.email) {
        return res.status(400).json({ error: "Agent information is required" });
      }

      // Generate the recruit landing page URL from agent slug
      const agentSlug = agent.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://heritagels.org'
        : `http://localhost:${process.env.PORT || 5000}`;
      const recruitLink = `${baseUrl}/recruit/agent-${agentSlug}`;

      // Send email
      try {
        await sendRecruitInviteEmail({
          prospectName,
          prospectEmail,
          recruitLink,
          customMessage,
          approach: approach || 'cold_outreach',
          agent: {
            name: agent.name,
            email: agent.email,
            phone: agent.phone || ''
          }
        });
        console.log(`[RecruitInvite] Email sent successfully to ${prospectEmail}`);
      } catch (emailError: any) {
        console.error("[RecruitInvite] Error sending email:", emailError?.message || emailError);
        return res.status(500).json({
          error: "Failed to send recruiting invite email. Please check your Gmail configuration.",
          details: emailError?.message
        });
      }

      // Send SMS if phone provided and SMS available
      let smsSent = false;
      if (prospectPhone && isSmsAvailable()) {
        try {
          const smsMessage = `Hi ${prospectName.split(' ')[0]}! ${agent.name} from Heritage Life Solutions invited you to explore a career opportunity. Learn more: ${recruitLink}`;
          await sendSms(prospectPhone, smsMessage);
          smsSent = true;
          console.log(`[RecruitInvite] SMS sent successfully to ${prospectPhone}`);
        } catch (smsError: any) {
          console.error("[RecruitInvite] Error sending SMS:", smsError?.message || smsError);
        }
      }

      res.status(201).json({
        success: true,
        message: "Recruiting invite sent successfully",
        recruitLink,
        emailSent: true,
        smsSent
      });
    } catch (error: any) {
      console.error("[RecruitInvite] Error:", error);
      res.status(500).json({ error: "Failed to send recruiting invite" });
    }
  });

  // ─── POLICY QUOTE ROUTES ────────────────────────────────────────────────────
  // Quote storage is now persisted in the PostgreSQL `quotes` table

  // In-memory lead inbox store (website leads)
  const leadInboxStore = new Map<string, {
    leadId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    zipCode: string | null;
    productInterest: string | null;
    agentSlug: string;
    agentName: string | null;
    message: string | null;
    source: 'website' | 'schedule_call';
    status: 'new' | 'read';
    createdAt: string;
    readAt: string | null;
  }>();

  // Get website settings for an agent (persisted in PostgreSQL)
  app.get("/api/website-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const result = await pool.query(
        'SELECT * FROM agent_website_settings WHERE agent_slug = $1',
        [agentSlug]
      );
      const settings = result.rows[0] || null;

      if (settings) {
        res.json({
          agentSlug: settings.agent_slug,
          headline: settings.headline,
          tagline: settings.tagline,
          bio: settings.bio,
          featuredProducts: settings.featured_products || ['term_life', 'whole_life', 'iul', 'final_expense', 'annuities'],
          showTestimonials: settings.show_testimonials ?? true,
          showFaq: settings.show_faq ?? true,
          showCarriers: settings.show_carriers ?? true,
          showScheduleCall: settings.show_schedule_call ?? true,
          updatedAt: settings.updated_at,
        });
      } else {
        // Return defaults
        res.json({
          agentSlug,
          headline: null,
          tagline: null,
          bio: null,
          featuredProducts: ['term_life', 'whole_life', 'iul', 'final_expense', 'annuities'],
          showTestimonials: true,
          showFaq: true,
          showCarriers: true,
          showScheduleCall: true,
          updatedAt: null,
        });
      }
    } catch (error: any) {
      console.error("[WebsiteSettings] Error fetching:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Save website settings for an agent (persisted in PostgreSQL)
  app.post("/api/website-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const { headline, tagline, bio, featuredProducts, showTestimonials, showFaq, showCarriers, showScheduleCall } = req.body;

      // Get the agent's user ID from their slug
      const agentResult = await pool.query(
        "SELECT id FROM users WHERE LOWER(CONCAT(first_name, '-', last_name)) = LOWER($1) OR id::text = $1 LIMIT 1",
        [agentSlug]
      );
      const agentUserId = agentResult.rows[0]?.id || (req as any).user?.id;

      if (!agentUserId) {
        res.status(400).json({ error: "Could not determine agent user ID" });
        return;
      }

      const safeHeadline = headline || null;
      const safeTagline = tagline || null;
      const safeBio = bio || null;
      const safeFeaturedProducts = featuredProducts || ['term_life', 'whole_life', 'iul', 'final_expense', 'annuities'];
      const safeShowTestimonials = showTestimonials !== false;
      const safeShowFaq = showFaq !== false;
      const safeShowCarriers = showCarriers !== false;
      const safeShowScheduleCall = showScheduleCall !== false;

      await pool.query(`
        INSERT INTO agent_website_settings (agent_user_id, agent_slug, headline, tagline, bio, featured_products, show_testimonials, show_faq, show_carriers, show_schedule_call, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (agent_slug) DO UPDATE SET
          headline = $3, tagline = $4, bio = $5, featured_products = $6,
          show_testimonials = $7, show_faq = $8, show_carriers = $9, show_schedule_call = $10,
          updated_at = NOW()
      `, [agentUserId, agentSlug, safeHeadline, safeTagline, safeBio, JSON.stringify(safeFeaturedProducts), safeShowTestimonials, safeShowFaq, safeShowCarriers, safeShowScheduleCall]);

      console.log(`[WebsiteSettings] Saved settings for ${agentSlug}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[WebsiteSettings] Error saving:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Get website stats for an agent
  app.get("/api/agent-stats/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;

      // Count leads from leadInboxStore
      const leadsGenerated = Array.from(leadInboxStore.values())
        .filter(lead => lead.agentSlug === agentSlug).length;

      // Get page view counts for agent's page (direct DB query, no top-N limit)
      let views = { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };
      try {
        views = await storage.getPageViewCountByPath(`/a/${agentSlug}`);
      } catch {
        // Page view stats may not be available
      }

      const conversionRate = views.total > 0
        ? Math.round((leadsGenerated / views.total) * 1000) / 10
        : 0;

      res.json({
        pageViews: views.total,
        pageViewsToday: views.today,
        pageViewsThisWeek: views.thisWeek,
        pageViewsThisMonth: views.thisMonth,
        leadsGenerated,
        conversionRate,
      });
    } catch (error: any) {
      console.error("[AgentStats] Error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get recruiting page settings for an agent (DB-persisted)
  app.get("/api/recruiting-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const result = await pool.query(
        "SELECT * FROM recruit_settings WHERE agent_slug = $1",
        [agentSlug],
      );

      if (result.rows.length > 0) {
        const r = result.rows[0];
        res.json({
          agentSlug: r.agent_slug,
          headline: r.headline,
          subheadline: r.subheadline,
          showTestimonials: r.show_testimonials,
          showFaq: r.show_faq,
          showCommissionTable: r.show_commission_table,
          showSteps: r.show_steps,
          updatedAt: r.updated_at,
        });
      } else {
        res.json({
          agentSlug,
          headline: null,
          subheadline: null,
          showTestimonials: true,
          showFaq: true,
          showCommissionTable: true,
          showSteps: true,
          updatedAt: null,
        });
      }
    } catch (error: any) {
      console.error("[RecruitingSettings] Error fetching:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Save recruiting page settings for an agent (DB-persisted)
  app.post("/api/recruiting-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const { headline, subheadline, showTestimonials, showFaq, showCommissionTable, showSteps } = req.body;

      // Resolve the agent user id from the slug
      // The slug format is the agent name lowercased with non-alphanumeric removed
      // We need the authenticated user or look up from the slug
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      await pool.query(
        `INSERT INTO recruit_settings (agent_user_id, agent_slug, headline, subheadline, show_testimonials, show_faq, show_commission_table, show_steps)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (agent_user_id) DO UPDATE SET
           agent_slug = $2,
           headline = $3,
           subheadline = $4,
           show_testimonials = $5,
           show_faq = $6,
           show_commission_table = $7,
           show_steps = $8,
           updated_at = NOW()`,
        [
          user.id,
          agentSlug,
          headline || null,
          subheadline || null,
          showTestimonials !== false,
          showFaq !== false,
          showCommissionTable !== false,
          showSteps !== false,
        ],
      );

      console.log(`[RecruitingSettings] Saved settings for ${agentSlug}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[RecruitingSettings] Error saving:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Get recruiting page stats for an agent (uses real prospect count)
  app.get("/api/recruiting-stats/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;

      let pageViews = 0;
      try {
        const pageStats = await storage.getPageViewStats();
        const recruitPageStats = pageStats.filter((s: any) =>
          s.page?.startsWith(`/recruit/agent-${agentSlug}`)
        );
        pageViews = recruitPageStats.reduce((sum: number, s: any) => sum + (Number(s.count) || 0), 0);
      } catch {
        // Page view stats may not be available
      }

      // Count real applications from recruit_prospects table
      let applications = 0;
      try {
        // Find the agent user by slug match (slug is derived from name)
        const agentResult = await pool.query(
          `SELECT u.id FROM users u
           INNER JOIN recruit_settings rs ON rs.agent_user_id = u.id
           WHERE rs.agent_slug = $1
           LIMIT 1`,
          [agentSlug],
        );

        if (agentResult.rows.length > 0) {
          const agentUserId = agentResult.rows[0].id;
          const appCount = await pool.query(
            `SELECT COUNT(*) as count FROM recruit_prospects WHERE recruiter_id = $1 AND stage != 'prospect'`,
            [agentUserId],
          );
          applications = parseInt(appCount.rows[0]?.count || "0");
        } else {
          // Fallback: try to find by matching the user directly (before any settings are saved)
          const user = (req as any).user;
          if (user?.id) {
            const appCount = await pool.query(
              `SELECT COUNT(*) as count FROM recruit_prospects WHERE recruiter_id = $1 AND stage != 'prospect'`,
              [user.id],
            );
            applications = parseInt(appCount.rows[0]?.count || "0");
          }
        }
      } catch (err) {
        console.warn("[RecruitingStats] Error counting applications:", err);
      }

      const conversionRate = pageViews > 0
        ? Math.round((applications / pageViews) * 1000) / 10
        : 0;

      res.json({ pageViews, applications, conversionRate });
    } catch (error: any) {
      console.error("[RecruitingStats] Error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ─── PRODUCT GUIDE SENDING ───────────────────────────────────────────────────

  // Send product guide email to a client
  app.post("/api/product-guides/send", requireAuth, async (req, res) => {
    try {
      const { clientName, clientEmail, guideId, guideTitle, guideDescription, personalMessage, carrierId, carrierName, agent } = req.body;

      if (!clientName || !clientEmail || !guideId || !guideTitle) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (!agent?.name || !agent?.email) {
        return res.status(400).json({ error: "Agent information is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail)) {
        return res.status(400).json({ error: "Invalid email address format" });
      }

      const linkId = crypto.randomBytes(16).toString('hex');
      const appUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://heritagels.org' : `http://localhost:${process.env.PORT || 4500}`);
      const guideUrl = `${appUrl}/guides/view/${linkId}`;

      // Fetch NPN from agent profile if not provided
      let agentNpn = agent.npn || '';
      if (!agentNpn && req.user?.id) {
        try {
          const profile = await storage.getAgentProfileByUserId(req.user.id);
          if (profile?.npn) agentNpn = profile.npn;
        } catch (e) { /* NPN is optional */ }
      }

      await pool.query(`
        INSERT INTO product_guide_links (link_id, guide_id, guide_title, guide_description, client_name, client_email, agent_user_id, agent_name, agent_email, agent_phone, agent_npn, custom_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [linkId, guideId, guideTitle, guideDescription || '', clientName, clientEmail, req.user?.id || null, agent.name, agent.email, agent.phone || '', agentNpn, personalMessage || null]);

      await sendProductGuideEmail({
        recipientName: clientName,
        recipientEmail: clientEmail,
        guideUrl,
        guideTitle,
        guideDescription: guideDescription || '',
        personalMessage: personalMessage || undefined,
        carrierId: carrierId || undefined,
        carrierName: carrierName || undefined,
        agent: {
          name: agent.name,
          email: agent.email,
          phone: agent.phone || '',
          npn: agentNpn,
        },
      });

      res.status(201).json({
        success: true,
        message: "Product guide sent successfully",
        linkId,
        guideUrl,
      });
    } catch (error: any) {
      console.error("[ProductGuide] Error:", error);
      res.status(500).json({ error: "Failed to send product guide" });
    }
  });

  // List product guides sent by the authenticated agent
  app.get("/api/product-guides", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const result = await pool.query(
        'SELECT * FROM product_guide_links WHERE agent_user_id = $1 ORDER BY created_at DESC',
        [user.id]
      );

      const guides = result.rows.map((row: any) => ({
        linkId: row.link_id,
        guideId: row.guide_id,
        guideTitle: row.guide_title,
        guideDescription: row.guide_description,
        clientName: row.client_name,
        clientEmail: row.client_email,
        agentName: row.agent_name,
        agentEmail: row.agent_email,
        agentPhone: row.agent_phone,
        agentNpn: row.agent_npn,
        personalMessage: row.custom_message,
        status: row.status,
        openedAt: row.opened_at,
        createdAt: row.created_at,
      }));

      res.json(guides);
    } catch (error: any) {
      console.error("[ProductGuide] Error listing guides:", error);
      res.status(500).json({ error: "Failed to fetch product guides" });
    }
  });

  // Fetch product guide metadata (public — accessed via email link)
  app.get("/api/product-guides/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      const result = await pool.query('SELECT * FROM product_guide_links WHERE link_id = $1', [linkId]);
      const guideData = result.rows[0];

      if (!guideData) {
        return res.status(404).json({ error: "Guide link not found" });
      }

      // Mark as opened on first view
      if (guideData.status === 'sent') {
        await pool.query('UPDATE product_guide_links SET status = $1, opened_at = NOW() WHERE link_id = $2', ['opened', linkId]);
      }

      res.json({
        guideId: guideData.guide_id,
        guideTitle: guideData.guide_title,
        guideDescription: guideData.guide_description,
        clientName: guideData.client_name,
        agentName: guideData.agent_name,
        agentEmail: guideData.agent_email,
        agentPhone: guideData.agent_phone,
        agentNpn: guideData.agent_npn,
      });
    } catch (error: any) {
      console.error("[ProductGuide] Error fetching guide:", error);
      res.status(500).json({ error: "Failed to load guide" });
    }
  });

  // Send website link via email to a client
  app.post("/api/share-website-email", requireAuth, websiteEmailLimiter, async (req, res) => {
    try {
      const { recipientName, recipientEmail, personalMessage, websiteUrl, agentName } = req.body;
      if (!recipientEmail || !websiteUrl || !agentName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({ error: "Invalid email address format" });
      }

      // Fetch agent data from authenticated session
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      await sendWebsiteLinkEmail({
        recipientName: recipientName || 'there',
        recipientEmail,
        websiteUrl,
        personalMessage: personalMessage || undefined,
        agent: {
          name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : agentName,
          email: user.email,
          phone: user.phone || '',
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("[ShareWebsite] Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/quotes/send", requireAuth, async (req, res) => {
    try {
      const {
        clientName, clientEmail, clientPhone,
        quoteType, quoteTypeName, carrierId, carrierName,
        coverageAmount, premium, premiumFrequency,
        termLength, healthClass, benefits, additionalNotes,
        sendMethod,
      } = req.body;

      if (!clientName || !clientEmail || !carrierId || !quoteType || !coverageAmount || !premium) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Sender identity comes from the session, NOT the request body. A
      // body-supplied agent.email could be any value the client wants — we'd
      // be re-introducing the same spoofing window we closed on secure_forms.
      const senderId = req.user?.id;
      const senderEmail = req.user?.email;
      if (!senderId || !senderEmail) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const senderName =
        `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || senderEmail;
      const senderPhone = (req.user as any)?.phone || '';
      const senderNpn = (req.user as any)?.npn || null;
      const agent = { name: senderName, email: senderEmail, phone: senderPhone, npn: senderNpn };

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const quoteRef = `HLS-${dateStr}-${rand}`;

      // Parse numeric values for DB columns
      const coverageNum = parseInt(String(coverageAmount).replace(/[^0-9]/g, '')) || 0;
      const premiumNum = parseFloat(String(premium).replace(/[^0-9.]/g, '')) || 0;

      // Insert into PostgreSQL quotes table. agent_user_id is the
      // authoritative owner FK (matches the read-side filter); the
      // agent_name/email/phone/npn columns stay as denormalized display
      // copy used by sendPolicyQuoteEmail() and the SMS rendering.
      const insertResult = await pool.query(
        `INSERT INTO quotes (
          quote_number, carrier, product_type, coverage_amount, monthly_premium,
          status, sent_at, client_name, client_email, client_phone,
          send_method, premium_frequency, carrier_id, quote_type, quote_type_name,
          benefits, additional_notes, agent_user_id, agent_name, agent_email, agent_phone, agent_npn,
          risk_class
        ) VALUES (
          $1, $2, $3, $4, $5,
          'sent', NOW(), $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20,
          $21
        ) RETURNING id`,
        [
          quoteRef, carrierName, quoteType, coverageNum, premiumNum,
          clientName, clientEmail, clientPhone || null,
          sendMethod || 'email', premiumFrequency || 'monthly',
          carrierId, quoteType, quoteTypeName || quoteType,
          benefits || '', additionalNotes || null,
          senderId, agent.name, agent.email, agent.phone || '', agent.npn || null,
          healthClass || null
        ]
      );
      const quoteId = insertResult.rows[0].id;

      try {
        await sendPolicyQuoteEmail({
          clientName, clientEmail, quoteType,
          quoteTypeName: quoteTypeName || quoteType,
          coverageAmount, premium,
          premiumFrequency: premiumFrequency || 'monthly',
          termLength, healthClass,
          benefits: benefits || '', additionalNotes,
          carrierId, carrierName, quoteRef, quoteId,
          agent: { name: agent.name, email: agent.email, phone: agent.phone || '', npn: agent.npn }
        });
        console.log(`[PolicyQuote] Email sent successfully to ${clientEmail}`);
      } catch (emailError: any) {
        console.error("[PolicyQuote] Error sending email:", emailError?.message || emailError);
        return res.status(500).json({
          error: "Failed to send policy quote email.",
          details: emailError?.message
        });
      }

      let smsSent = false;
      if (clientPhone && (sendMethod === 'sms' || sendMethod === 'both') && isSmsAvailable()) {
        try {
          const smsMessage = `Hi ${clientName.split(' ')[0]}! Your ${quoteTypeName || quoteType} quote from ${carrierName} is ready. Check your email for details. — ${agent.name}, Heritage Life Solutions`;
          await sendSms(clientPhone, smsMessage);
          smsSent = true;
        } catch (smsError: any) {
          console.error("[PolicyQuote] SMS error:", smsError?.message);
        }
      }

      // Update sms_sent flag in DB
      if (smsSent) {
        await pool.query(`UPDATE quotes SET sms_sent = true WHERE id = $1`, [quoteId]);
      }

      res.status(201).json({ success: true, quoteId, quoteRef, emailSent: true, smsSent });
    } catch (error: any) {
      console.error("[PolicyQuote] Error:", error);
      res.status(500).json({ error: "Failed to send policy quote" });
    }
  });

  // List quotes for the requesting agent only. Filters by agent_user_id
  // (the FK to users.id) — was previously company-wide because the route
  // had no auth gate and no WHERE clause. agent_email is kept as
  // denormalized display copy but no longer authoritative for ownership.
  app.get("/api/quotes", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const result = await pool.query(
        `SELECT id, quote_number, carrier, product_type, coverage_amount, monthly_premium,
                status, sent_at, client_name, client_email, client_phone,
                send_method, premium_frequency, carrier_id, quote_type, quote_type_name,
                benefits, additional_notes, agent_name, agent_email, agent_phone, agent_npn,
                risk_class, opened_at, expires_at, sms_sent, created_at, updated_at
         FROM quotes
         WHERE agent_user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
      const quotes = result.rows.map((row: any) => ({
        quoteId: row.id,
        quoteRef: row.quote_number,
        clientName: row.client_name,
        clientEmail: row.client_email,
        clientPhone: row.client_phone,
        quoteType: row.quote_type || row.product_type,
        quoteTypeName: row.quote_type_name || row.product_type,
        carrierId: row.carrier_id,
        carrierName: row.carrier,
        coverageAmount: String(row.coverage_amount),
        premium: String(row.monthly_premium),
        premiumFrequency: row.premium_frequency || 'monthly',
        termLength: null,
        healthClass: row.risk_class,
        benefits: row.benefits || '',
        additionalNotes: row.additional_notes,
        agentName: row.agent_name,
        agentEmail: row.agent_email,
        agentPhone: row.agent_phone,
        agentNpn: row.agent_npn,
        status: row.status,
        createdAt: row.created_at?.toISOString() || row.sent_at?.toISOString(),
        openedAt: row.opened_at?.toISOString() || null,
        expiresAt: row.expires_at?.toISOString() || null,
        smsSent: row.sms_sent || false,
      }));
      res.json({ quotes });
    } catch (error: any) {
      console.error("[PolicyQuote] Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:quoteId", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const result = await pool.query(
        `SELECT id, quote_number, carrier, product_type, coverage_amount, monthly_premium,
                status, sent_at, client_name, client_email, client_phone,
                send_method, premium_frequency, carrier_id, quote_type, quote_type_name,
                benefits, additional_notes, agent_name, agent_email, agent_phone, agent_npn,
                risk_class, opened_at, expires_at, sms_sent, created_at, updated_at
         FROM quotes WHERE id::text = $1 OR quote_number = $1
         LIMIT 1`,
        [quoteId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const row = result.rows[0];

      // Check if expired
      if (row.status === 'expired' || (row.expires_at && new Date(row.expires_at) < new Date())) {
        if (row.status !== 'expired') {
          await pool.query(`UPDATE quotes SET status = 'expired', updated_at = NOW() WHERE id = $1`, [row.id]);
        }
        return res.status(410).json({ error: "This quote has expired", expired: true });
      }

      // Mark as opened on first view and set 14-day expiration
      if (row.status === 'sent') {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        await pool.query(
          `UPDATE quotes SET status = 'opened', opened_at = $1, expires_at = $2, updated_at = NOW() WHERE id = $3`,
          [now, expiresAt, row.id]
        );
        row.status = 'opened';
        row.opened_at = now;
        row.expires_at = expiresAt;
      }

      const quote = {
        quoteId: row.id,
        quoteRef: row.quote_number,
        clientName: row.client_name,
        clientEmail: row.client_email,
        clientPhone: row.client_phone,
        quoteType: row.quote_type || row.product_type,
        quoteTypeName: row.quote_type_name || row.product_type,
        carrierId: row.carrier_id,
        carrierName: row.carrier,
        coverageAmount: String(row.coverage_amount),
        premium: String(row.monthly_premium),
        premiumFrequency: row.premium_frequency || 'monthly',
        termLength: null,
        healthClass: row.risk_class,
        benefits: row.benefits || '',
        additionalNotes: row.additional_notes,
        agentName: row.agent_name,
        agentEmail: row.agent_email,
        agentPhone: row.agent_phone,
        agentNpn: row.agent_npn,
        status: row.status,
        createdAt: row.created_at?.toISOString() || row.sent_at?.toISOString(),
        openedAt: row.opened_at?.toISOString() || null,
        expiresAt: row.expires_at?.toISOString() || null,
        smsSent: row.sms_sent || false,
      };

      res.json({ quote });
    } catch (error: any) {
      console.error("[PolicyQuote] Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // Resend a previously sent quote. Auth-gated AND ownership-checked: the
  // requesting agent must own the quote (agent_user_id = req.user.id),
  // otherwise we 404 — same response shape as a missing quote so we don't
  // leak existence to a probing client.
  app.post("/api/quotes/:quoteId/resend", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { quoteId } = req.params;
      const result = await pool.query(
        `SELECT id, quote_number, carrier, product_type, coverage_amount, monthly_premium,
                client_name, client_email, client_phone, send_method, premium_frequency,
                carrier_id, quote_type, quote_type_name, benefits, additional_notes,
                agent_user_id, agent_name, agent_email, agent_phone, agent_npn, risk_class
         FROM quotes
         WHERE (id::text = $1 OR quote_number = $1)
           AND agent_user_id = $2
         LIMIT 1`,
        [quoteId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Quote not found" });
      }

      const row = result.rows[0];

      // Re-send the email
      try {
        await sendPolicyQuoteEmail({
          clientName: row.client_name,
          clientEmail: row.client_email,
          quoteType: row.quote_type || row.product_type,
          quoteTypeName: row.quote_type_name || row.product_type,
          coverageAmount: String(row.coverage_amount),
          premium: String(row.monthly_premium),
          premiumFrequency: row.premium_frequency || 'monthly',
          termLength: undefined,
          healthClass: row.risk_class || undefined,
          benefits: row.benefits || '',
          additionalNotes: row.additional_notes || undefined,
          carrierId: row.carrier_id,
          carrierName: row.carrier,
          quoteRef: row.quote_number,
          quoteId: row.id,
          agent: {
            name: row.agent_name,
            email: row.agent_email,
            phone: row.agent_phone || '',
            npn: row.agent_npn
          }
        });
        console.log(`[PolicyQuote] Resend email sent to ${row.client_email}`);
      } catch (emailError: any) {
        console.error("[PolicyQuote] Resend email error:", emailError?.message || emailError);
        return res.status(500).json({ error: "Failed to resend quote email", details: emailError?.message });
      }

      // Re-send SMS if applicable
      let smsSent = false;
      const sendMethod = row.send_method || 'email';
      if (row.client_phone && (sendMethod === 'sms' || sendMethod === 'both') && isSmsAvailable()) {
        try {
          const smsMessage = `Hi ${row.client_name.split(' ')[0]}! Your ${row.quote_type_name || row.product_type} quote from ${row.carrier} is ready. Check your email for details. — ${row.agent_name}, Heritage Life Solutions`;
          await sendSms(row.client_phone, smsMessage);
          smsSent = true;
        } catch (smsError: any) {
          console.error("[PolicyQuote] Resend SMS error:", smsError?.message);
        }
      }

      // Update sent_at timestamp and reset status
      await pool.query(
        `UPDATE quotes SET sent_at = NOW(), status = 'sent', opened_at = NULL, expires_at = NULL, updated_at = NOW() WHERE id = $1`,
        [row.id]
      );

      res.json({ success: true, emailSent: true, smsSent });
    } catch (error: any) {
      console.error("[PolicyQuote] Resend error:", error);
      res.status(500).json({ error: "Failed to resend quote" });
    }
  });

  // Book an appointment from the public booking page (persisted to DB)
  app.post("/api/appointments/book", async (req, res) => {
    try {
      const {
        agentSlug,
        customerName,
        customerEmail,
        customerPhone,
        date,
        time,
        duration,
        meetingType,
        notes
      } = req.body;

      // Validate required fields
      if (!agentSlug || !customerName || !customerEmail || !date || !time) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Resolve agent slug to user ID
      // Slug format: "agent-johndoe" → strip "agent-" prefix, then match against
      // lower(concat(first_name, last_name)) or lower(replace(concat(first_name, ' ', last_name), ' ', ''))
      const cleanSlug = agentSlug.replace(/^agent-/, "");
      const agentResult = await pool.query(
        `SELECT id FROM users WHERE LOWER(REPLACE(CONCAT(first_name, last_name), ' ', '')) = $1
         AND role IN ('sales_agent', 'manager', 'owner', 'system_admin')
         LIMIT 1`,
        [cleanSlug]
      );

      const agentUserId = agentResult.rows.length > 0 ? agentResult.rows[0].id : null;

      // Parse time (e.g., "14:30") to build scheduledAt
      const [hourStr, minuteStr] = time.split(":");
      const scheduledAt = new Date(`${date}T00:00:00`);
      scheduledAt.setHours(parseInt(hourStr) || 0, parseInt(minuteStr) || 0, 0, 0);

      const durationMinutes = parseInt(duration) || 30;

      // Create appointment in DB
      const appointment = await storage.createAppointment({
        agentUserId,
        title: `${meetingType || "Booking"} with ${customerName}`,
        scheduledAt,
        duration: durationMinutes,
        meetingType: meetingType || "discovery",
        description: notes || null,
        status: "scheduled",
      });

      console.log(`[Appointment] Booked in DB: ${customerName} with ${agentSlug} on ${date} at ${time} (id: ${appointment.id})`);

      // Return in the same shape the frontend expects
      res.status(201).json({
        success: true,
        appointment: {
          id: appointment.id,
          agentSlug,
          customerName,
          customerEmail,
          customerPhone: customerPhone || "",
          date,
          time,
          duration: String(durationMinutes),
          meetingType: meetingType || "video",
          notes: notes || "",
          createdAt: appointment.createdAt?.toISOString?.() || new Date().toISOString(),
        },
        message: "Appointment booked successfully"
      });
    } catch (error: any) {
      console.error("[Appointment] Error booking:", error);
      res.status(500).json({ error: "Failed to book appointment" });
    }
  });

  // Get appointments for an agent (DB-backed)
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const { agentSlug } = req.query;
      const userId = req.session.userId;

      // If agentSlug is provided, look up by slug; otherwise use session user
      let agentUserId = userId;
      if (agentSlug) {
        const cleanSlug = (agentSlug as string).replace(/^agent-/, "");
        const agentResult = await pool.query(
          `SELECT id FROM users WHERE LOWER(REPLACE(CONCAT(first_name, last_name), ' ', '')) = $1 LIMIT 1`,
          [cleanSlug]
        );
        if (agentResult.rows.length > 0) {
          agentUserId = agentResult.rows[0].id;
        }
      }

      const dbAppointments = agentUserId
        ? await storage.getAppointmentsByAgentId(agentUserId)
        : [];

      // Map to the format the frontend expects
      const appointments = dbAppointments.map((apt: any) => {
        const scheduledAt = new Date(apt.scheduledAt);
        const dateStr = scheduledAt.toISOString().split("T")[0];
        const hours = scheduledAt.getHours();
        const mins = scheduledAt.getMinutes();
        const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

        return {
          id: apt.id,
          agentSlug: agentSlug || "",
          customerName: apt.title?.replace(/^(Booking|discovery|presentation|follow_up|close|video|call|meeting) with /i, "") || "Client",
          customerEmail: "",
          customerPhone: "",
          date: dateStr,
          time: timeStr,
          duration: String(apt.duration || 30),
          meetingType: apt.meetingType || "video",
          notes: apt.description || "",
          createdAt: apt.createdAt?.toISOString?.() || "",
        };
      });

      res.json({ appointments });
    } catch (error: any) {
      console.error("[Appointment] Error fetching:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Job application submission
  app.post("/api/job-applications", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, position, linkedIn, experience, whyJoinUs, hasLicense, resumeFileName } = req.body;
      
      if (!firstName || !lastName || !email || !phone || !position || !experience || !whyJoinUs) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const applicationData = {
        firstName,
        lastName,
        email,
        phone,
        position,
        linkedIn: linkedIn || null,
        experience,
        whyJoinUs,
        hasLicense: hasLicense ? 'yes' : 'no',
        resumeFileName: resumeFileName || null,
      };
      
      const application = await storage.createJobApplication(applicationData);
      
      try {
        console.log("Attempting to send job application notification email...");
        await sendJobApplicationNotification({
          ...applicationData,
          linkedIn: linkedIn || undefined,
          hasLicense: hasLicense ? 'yes' : 'no',
          resumeFileName: resumeFileName || undefined,
        });
        console.log("Job application notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending job application notification email:", emailError?.message || emailError);
      }
      
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating job application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Privacy request submission
  app.post("/api/privacy-requests", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, requestType, message } = req.body;

      if (!firstName || !lastName || !email || !requestType || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Send email notification
      try {
        console.log("Attempting to send privacy request notification email...");
        await sendPrivacyRequestNotification({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          requestType,
          message
        });
        console.log("Privacy request notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending privacy request notification email:", emailError?.message || emailError);
      }

      res.status(201).json({ success: true, message: "Privacy request submitted" });
    } catch (error: any) {
      console.error("Error submitting privacy request:", error);
      res.status(500).json({ error: "Failed to submit privacy request" });
    }
  });

  // Portal: Send message to advisor (requires auth)
  app.post("/api/portal/messages/send", requireAuth, async (req, res) => {
    try {
      const { recipientEmail, recipientName, subject, message, priority } = req.body;
      
      if (!recipientEmail || !recipientName || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      await storage.createMessage({
        userId: user.id,
        fromName: `${user.firstName} ${user.lastName}`,
        fromEmail: user.email,
        subject,
        content: message,
        isFromClient: true,
        priority: priority || 'normal',
      });
      
      try {
        await sendPortalMessage({
          senderName: `${user.firstName} ${user.lastName}`,
          senderEmail: user.email,
          recipientEmail,
          recipientName,
          subject,
          message,
          priority: priority || 'normal'
        });
      } catch (emailError: any) {
        console.error("Email notification failed:", emailError?.message);
      }
      
      res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Error sending portal message:", error);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

  // Backfill lounge access for all existing users (admin-only, one-time use)
  app.post("/api/admin/backfill-lounge-access", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user || (user.role !== 'owner' && user.role !== 'system_admin')) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const allUsers = await pool.query(`SELECT id, role FROM users WHERE is_active = true`);
      let count = 0;
      for (const u of allUsers.rows) {
        await storage.initializeDefaultLoungeAccess(u.id, u.role);
        count++;
      }
      res.json({ success: true, usersProcessed: count });
    } catch (error) {
      console.error("Error backfilling lounge access:", error);
      res.status(500).json({ error: "Failed to backfill lounge access" });
    }
  });

  // My Lounge Access — returns current user's lounge access map (for sidebar filtering)
  app.get("/api/my-lounge-access", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const role = req.user?.role;

      // Founders and owners always have full lounge access regardless of
      // user_lounge_access seed rows. The goldcoast deployment treats founder
      // role as the canonical top tier; without this short-circuit a fresh
      // founder logging in to heritage sees zero lounges in the lobby.
      if (role === Roles.FOUNDER || role === Roles.OWNER) {
        const { LOUNGE_MAP } = await import("@shared/loungeKeys");
        const accessMap: Record<string, boolean> = {};
        for (const dbKey of Object.keys(LOUNGE_MAP)) {
          accessMap[dbKey] = true;
        }
        return res.json({ access: accessMap });
      }

      // Role-based defaults. Users created via the gcf `/apply` flow (or any
      // path that doesn't run `initializeDefaultLoungeAccess`) have zero rows
      // in `user_lounge_access`. Without role defaults, the endpoint returns
      // `{access: {}}` and every lounge filters out client-side — "no access
      // to anything" for users who DO have legitimate role-based access.
      //
      // Source of truth lives in storage.initializeDefaultLoungeAccess; this
      // table mirrors that exact matrix. Update both together when the
      // role→lounge mapping changes.
      const ALL_LOUNGES = ['agent_portal', 'manager_lounge', 'director_lounge', 'executive_lounge', 'crm_lounge', 'ai_lounge', 'admin_panel', 'client_lounge', 'onboarding_lounge', 'finance_lounge', 'support_lounge'];
      const MANAGER_LOUNGES = ['agent_portal', 'manager_lounge', 'crm_lounge', 'onboarding_lounge'];
      const roleDefaults: Record<string, string[]> = {
        founder: ALL_LOUNGES,
        owner: ALL_LOUNGES,
        system_admin: ['admin_panel', 'ai_lounge', 'support_lounge', 'crm_lounge', 'onboarding_lounge'],
        director: ['agent_portal', 'manager_lounge', 'director_lounge', 'crm_lounge', 'onboarding_lounge'],
        agency_manager: MANAGER_LOUNGES,
        manager: MANAGER_LOUNGES,
        sales_agent: ['agent_portal', 'crm_lounge', 'onboarding_lounge'],
        marketing_staff: [],
        investor: [],
        client: ['client_lounge'],
      };

      // Start with the role's default access map. Explicit DB rows overlay
      // on top — admin grants can EXPAND beyond role defaults, admin
      // revocations (granted=false rows) can CONTRACT below defaults.
      const accessMap: Record<string, boolean> = {};
      const defaults = roleDefaults[role || ''] || [];
      for (const dbKey of defaults) {
        accessMap[dbKey] = true;
      }
      const access = await storage.getUserLoungeAccess(userId);
      for (const row of access) {
        accessMap[row.lounge_key] = row.granted;
      }
      res.json({ access: accessMap });
    } catch (error) {
      console.error("Error fetching my lounge access:", error);
      res.status(500).json({ error: "Failed to fetch lounge access" });
    }
  });

  // Portal: Get user's policies
  app.get("/api/portal/policies", requireAuth, async (req, res) => {
    try {
      const policies = await storage.getPoliciesByUserId(req.session.userId!);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  // Portal: Get policy details
  app.get("/api/portal/policies/:id", requireAuth, async (req, res) => {
    try {
      const policy = await storage.getPolicyById(req.params.id);
      if (!policy || policy.userId !== req.session.userId) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      res.status(500).json({ error: "Failed to fetch policy" });
    }
  });

  // Portal: Get user's documents
  app.get("/api/portal/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.session.userId!);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Portal: Upload a document (client self-upload)
  app.post("/api/portal/documents/upload", requireAuth, portalUpload.single("file"), async (req, res) => {
    try {
      const userId = req.session.userId!;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { name, category } = req.body;
      if (!name || !category) {
        return res.status(400).json({ error: "Missing required fields: name, category" });
      }

      // Validate file type and size
      const validation = s3Service.validateFile(file.originalname, file.mimetype, file.size);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Upload to Firebase Storage
      const uploadResult = await s3Service.uploadFile(
        userId,
        file.originalname,
        file.buffer,
        { contentType: file.mimetype, metadata: { uploadedBy: userId, category } },
        "client-uploads"
      );

      if (!uploadResult.success) {
        return res.status(500).json({ error: uploadResult.error || "Failed to upload file to storage" });
      }

      // Create document record in DB
      const document = await storage.createDocument({
        userId,
        name,
        type: file.mimetype,
        category,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        s3Key: uploadResult.key || null,
        uploadedBy: userId,
      });

      console.log(`[Portal] Document uploaded: ${document.id} by client ${userId}`);
      res.status(201).json(document);
    } catch (error) {
      console.error("[Portal] Failed to upload document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Portal: Download a document (Firebase signed URL redirect)
  app.get("/api/portal/documents/:id/download", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.session.userId!);
      const document = documents.find((d: any) => d.id === req.params.id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (!document.s3Key) {
        return res.status(404).json({ error: "No file available for this document" });
      }

      const signedUrl = await s3Service.getSignedDownloadUrl(document.s3Key);
      if (!signedUrl.success || !signedUrl.url) {
        return res.status(500).json({ error: signedUrl.error || "Failed to generate download URL" });
      }

      res.redirect(signedUrl.url);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  // Portal: Get user's messages
  app.get("/api/portal/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUserId(req.session.userId!);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Portal: Mark message as read
  app.patch("/api/portal/messages/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Portal: Get unread message count
  app.get("/api/portal/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // Portal: Get user's notifications
  app.get("/api/portal/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.session.userId!);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Portal: Mark notification as read
  app.patch("/api/portal/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Portal: Mark all notifications as read
  app.patch("/api/portal/notifications/read-all", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Portal: Get unread notification count
  app.get("/api/portal/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // Portal: Get billing history (enriched with policy info)
  app.get("/api/portal/billing", requireAuth, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT
          bh.id,
          bh.policy_id AS "policyId",
          p.policy_number AS "policyNumber",
          p.type AS "policyType",
          bh.amount::float AS amount,
          TO_CHAR(bh.payment_date, 'Mon DD, YYYY') AS date,
          bh.status,
          bh.payment_method AS "paymentMethod",
          bh.bank_name AS "bankName",
          bh.billing_type AS "billingType",
          bh.description,
          bh.due_date AS "dueDate"
        FROM billing_history bh
        LEFT JOIN policies p ON bh.policy_id = p.id
        WHERE bh.user_id = $1
        ORDER BY bh.payment_date DESC`,
        [req.session.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching billing history:", error);
      res.status(500).json({ error: "Failed to fetch billing history" });
    }
  });

  // Portal: Update user profile
  app.patch("/api/portal/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, phone, email, timezone } = req.body;
      const updates: Record<string, any> = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (phone !== undefined) updates.phone = phone;
      if (timezone !== undefined) updates.timezone = timezone;
      if (email !== undefined) {
        // Check email uniqueness if changing
        const existing = await storage.getUserByEmail(email);
        if (existing && existing.id !== req.session.userId) {
          return res.status(400).json({ error: "Email is already in use" });
        }
        updates.email = email;
      }
      const updatedUser = await storage.updateUser(req.session.userId!, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Portal: Change password
  app.post("/api/portal/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }

      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.session.userId!, { password: hashedPassword });

      // Log password change for audit
      await logPasswordChange(req.session.userId!, getAuditContext(req));

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Portal: Get notification preferences
  app.get("/api/portal/preferences", requireAuth, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.session.userId]);
      if (result.rows[0]) {
        res.json(result.rows[0]);
      } else {
        res.json({ email_notifications: true, push_notifications: true, sms_notifications: false });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  // Portal: Update notification preferences
  app.patch("/api/portal/preferences", requireAuth, async (req, res) => {
    try {
      const { emailNotifications, pushNotifications, smsNotifications } = req.body;
      await pool.query(`
        INSERT INTO user_preferences (user_id, email_notifications, push_notifications, sms_notifications, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          email_notifications = $2, push_notifications = $3, sms_notifications = $4, updated_at = NOW()
      `, [req.session.userId, emailNotifications ?? true, pushNotifications ?? true, smsNotifications ?? false]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Chat: Get user's conversations
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getChatConversationsByUserId(req.session.userId!);
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const participants = await storage.getChatParticipants(conv.id);
          const messages = await storage.getChatMessages(conv.id, 1);
          const lastMessage = messages[messages.length - 1] || null;
          return {
            ...conv,
            participantCount: participants.length,
            lastMessage,
          };
        })
      );
      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Chat: Get or create main team chat
  app.get("/api/chat/main", requireAuth, async (req, res) => {
    try {
      let mainChat = await storage.getMainTeamChat();
      
      if (!mainChat) {
        mainChat = await storage.createChatConversation({
          name: "Team Chat",
          type: "channel",
          createdById: req.session.userId!,
        });
      }
      
      const isParticipant = await storage.isUserInConversation(req.session.userId!, mainChat.id);
      if (!isParticipant) {
        await storage.addChatParticipant({
          conversationId: mainChat.id,
          userId: req.session.userId!,
          role: "member",
        });
      }
      
      res.json(mainChat);
    } catch (error) {
      console.error("Error fetching main chat:", error);
      res.status(500).json({ error: "Failed to fetch main chat" });
    }
  });

  // Chat: Get conversation messages
  app.get("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const isParticipant = await storage.isUserInConversation(req.session.userId!, req.params.id);
      if (!isParticipant) {
        return res.status(403).json({ error: "Not a participant in this conversation" });
      }
      
      const messages = await storage.getChatMessages(req.params.id);
      await storage.updateLastReadAt(req.session.userId!, req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Chat: Send message
  app.post("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }
      
      const isParticipant = await storage.isUserInConversation(req.session.userId!, req.params.id);
      if (!isParticipant) {
        return res.status(403).json({ error: "Not a participant in this conversation" });
      }
      
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const message = await storage.createChatMessage({
        conversationId: req.params.id,
        senderId: req.session.userId!,
        senderName: `${user.firstName} ${user.lastName}`,
        content: content.trim(),
        type: "text",
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Chat: Create new conversation (DM or group)
  app.post("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const { name, type, participantIds } = req.body;
      
      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ error: "At least one participant is required" });
      }
      
      const conversation = await storage.createChatConversation({
        name: name || null,
        type: type || (participantIds.length > 1 ? "group" : "direct"),
        createdById: req.session.userId!,
      });
      
      await storage.addChatParticipant({
        conversationId: conversation.id,
        userId: req.session.userId!,
        role: "admin",
      });
      
      for (const oderId of participantIds) {
        if (oderId !== req.session.userId) {
          await storage.addChatParticipant({
            conversationId: conversation.id,
            userId: oderId,
            role: "member",
          });
        }
      }
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Chat: Get all users for starting new chats
  app.get("/api/chat/users", requireAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllAgentUsers();
      const safeUsers = allUsers
        .filter(u => u.id !== req.session.userId)
        .map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Chat: Get conversation participants
  app.get("/api/chat/conversations/:id/participants", requireAuth, async (req, res) => {
    try {
      const participants = await storage.getChatParticipants(req.params.id);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  // Google Calendar routes moved to server/routes/calendar.ts (mounted as /api/calendar)

  // Portal: Dashboard summary
  app.get("/api/portal/dashboard", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const [policies, unreadMessages, unreadNotifications, billing] = await Promise.all([
        storage.getPoliciesByUserId(userId),
        storage.getUnreadMessageCount(userId),
        storage.getUnreadNotificationCount(userId),
        storage.getBillingHistoryByUserId(userId),
      ]);

      const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);
      const monthlyPremium = policies.reduce((sum, p) => sum + parseFloat(p.monthlyPremium || "0"), 0);
      const activePolicies = policies.filter(p => p.status === "active").length;

      const nextPayment = policies
        .filter(p => p.nextPaymentDate)
        .sort((a, b) => new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime())[0];

      res.json({
        totalCoverage,
        monthlyPremium: monthlyPremium.toFixed(2),
        activePolicies,
        nextPaymentDate: nextPayment?.nextPaymentDate,
        unreadMessages,
        unreadNotifications,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Portal: Onboarding status
  app.get("/api/portal/onboarding-status", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const [policies, documents] = await Promise.all([
        storage.getPoliciesByUserId(userId),
        storage.getDocumentsByUserId(userId),
      ]);

      const pendingPolicies = policies.filter(p => p.status === "pending_setup" || p.status === "pending").length;
      const activePolicies = policies.filter(p => p.status === "active").length;

      // Get assigned agent info if available
      let agentName: string | null = null;
      let agentEmail: string | null = null;
      let agentPhone: string | null = null;

      if (user.assignedAgentId) {
        const agent = await storage.getUserById(user.assignedAgentId);
        if (agent) {
          agentName = `${agent.firstName} ${agent.lastName}`;
          agentEmail = agent.email;
          agentPhone = agent.phone || null;
        }
      }

      res.json({
        onboardingStatus: user.onboardingStatus || "pending",
        hasPolicies: policies.length > 0,
        policyCount: policies.length,
        pendingPolicies,
        activePolicies,
        hasDocuments: documents.length > 0,
        agentName,
        agentEmail,
        agentPhone,
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      res.status(500).json({ error: "Failed to fetch onboarding status" });
    }
  });

  // Agent portal notifications — auto-seeds welcome + computes virtual E&O/license
  // expiration warnings. Mirrors /Users/guy4carbs/gcf/server/routes/agent-notifications.ts
  // so both apps share notification UX over the same notifications table.
  app.use("/api/agent-portal/notifications", agentNotificationsRouter);

  // Admin: Products management (requires admin role)
  app.use("/api/admin/products", requireAuth, requireAdmin, adminProductsRouter);

  // Admin: Content management (CMS, requires admin role)
  app.use("/api/admin/content", requireAuth, requireAdmin, adminContentRouter);

  // Admin: Image CDN (upload/list/delete). Auth gate is owner/system_admin/founder
  // only and is enforced inside the router itself — mounted BEFORE the broader
  // /api/admin catch-all so the stricter ADMINS gate runs first.
  app.use("/api/admin/images", adminImagesRouter);

  // Admin: Carrier-branded email QA test sender. Auth gate is owner/system_admin/founder
  // only and is enforced inside the router itself — mounted BEFORE the broader
  // /api/admin catch-all so the stricter ADMINS gate runs first.
  app.use("/api/admin/email", adminEmailTestRouter);

  // Admin: CRM (leads, settings, testimonials - requires admin role)
  app.use("/api/admin", requireAuth, requireAdmin, adminCrmRouter);

  // Public content (blog, FAQs, pages)
  app.use("/api/content", contentRouter);

  // Quotes and estimates
  app.use("/api/quotes", quotesRouter);

  // Avatar Council (AI avatars, debates, sessions)
  app.use("/api/avatar-council", avatarCouncilRouter);

  // CRM Lounge (dashboard, pipeline, analytics)
  app.use("/api/crm", crmRouter);

  // Device management (push notifications)
  app.use("/api/devices", devicesRouter);

  // App version and configuration (for iOS/Android apps)
  app.use("/api/app", appRouter);

  // lifeOS — system update + release notes (read-only on Heritage; authoring lives on Gold Coast)
  const { default: lifeosRouter } = await import("./routes/lifeos");
  app.use("/api/lifeos", lifeosRouter);

  // Member Cards (Heritage Life Solutions digital insurance cards)
  app.use("/api/member-cards", memberCardsRouter);

  // Apple Wallet Pass Generation
  app.use("/api/wallet", walletRouter);

  // Policy Verification (public - for QR code scanning)
  app.use("/verify", verifyRouter);

  // Agent Hierarchy
  app.use("/api/hierarchy", hierarchyRouter);

  // Hierarchy Requests (Approval Workflow)
  app.use("/api/hierarchy-requests", hierarchyRequestsRouter);

  // Commission Targets
  app.use("/api/commission-targets", commissionTargetsRouter);

  // Client Chat (Agent-Client Messaging)
  app.use("/api/client-chat", clientChatRouter);
  app.use("/api/app/chat", clientChatRouter);

  // Client Portal (Client Lounge API)
  app.use("/api/client-portal", clientPortalRouter);

  // Claims (Agent-side claims management)
  app.use("/api/claims", claimsRouter);

  // Agent-Side Client Management
  app.use("/api/agent-clients", agentClientsRouter);

  // Referrals (Public referral landing page)
  app.use("/api/referrals", referralsRouter);

  // Automations
  app.use("/api/automations", automationsRouter);

  // Workflow Automations (Visual Builder)
  app.use("/api/workflow-automations", workflowAutomationsRouter);

  // License & Territory management
  app.use("/api/licenses", licensesRouter);

  // Policy management
  app.use("/api/policies", policiesRouter);

  // SMS / Telnyx
  app.use("/api/sms", smsRouter);

  // Lounge Access Control (admin only — auth built into router)
  app.use("/api/admin", loungeAccessRouter);

  // Agent Onboarding (public token validation + auth for step saves)
  app.use("/api/onboarding", onboardingRouter);

  // Lead Distribution Pipeline (auth built into router)
  app.use("/api/lead-distribution", leadDistributionRouter);

  // Telnyx Voice Calls (auth built into router)
  app.use("/api/calls", callsRouter);

  // 1.0.62 confirmed (via server="cloudflare" + cf-ray headers) that
  // /api/calls/token's 502 was Cloudflare returning its own HTML page.
  // 1.0.63 tried /api/voice/token — direct browser navigation ALSO returned
  // CF's HTML 502 with no `[REQ]` log on our origin, meaning Cloudflare is
  // dropping the request at the edge BEFORE Railway sees it. The CF rule
  // appears to match URL patterns containing words like "voice", "calls",
  // or "token" (common WAF heuristic against credential-leak endpoints).
  //
  // 1.0.64 moves the endpoint to a generic-API path with NONE of those
  // words. Same handler, same auth + timeout chain. If THIS still 502s at
  // CF, the rule is broader (e.g. blocking all auth-bearing XHRs) and the
  // fix is in the CF dashboard, not in code.
  // 1.0.65 — 1.0.64 confirmed CF still blocks even the rename-only URL.
  // So the rule isn't matching the path, it's matching the request SHAPE
  // (GET XHR with credentials + Bearer-like cookie). POST has a different
  // security profile in many CF managed rulesets (less-aggressive default
  // matching against credential-leak heuristics). Mount the same handler
  // under POST as well — client switches to POST in 1.0.65+; GET stays
  // alive for in-flight bundles still on the older client.
  const wrtcAuthChain = [voiceTokenTimeoutMiddleware, requireAuth, telnyxTokenHandler] as const;
  app.get("/api/realtime/wrtc-auth", ...wrtcAuthChain);
  app.post("/api/realtime/wrtc-auth", ...wrtcAuthChain);

  // 1.0.67 — auth-only diagnostic. Same session + requireAuth chain as the
  // real token endpoint but with a trivial handler that returns the user's
  // ID. If this returns 200 cleanly but /api/realtime/wrtc-auth still 502s,
  // the failure is unambiguously inside telnyxTokenHandler (Telnyx SDK,
  // DB call for telephony credential, etc.) rather than in the session/
  // auth/timeout middleware chain.
  app.get(
    "/api/realtime/auth-only-test",
    voiceTokenTimeoutMiddleware,
    requireAuth,
    (req: any, res: any) => {
      res.setHeader("Cache-Control", "no-store, no-cache, private, must-revalidate");
      res.status(200).json({
        ok: true,
        userId: req.user?.id,
        email: req.user?.email,
        ts: new Date().toISOString(),
        label: "auth-only-test",
      });
    },
  );

  // Call Monitoring (listen in / whisper / barge)
  app.use("/api/monitor", monitorRouter);

  // DNC (Do Not Call) list
  app.use("/api/dnc", dncRouter);

  // Executive Dashboard (auth built into router)
  app.use("/api/executive", executiveRouter);

  // Post-Close Workflow (auth built into router)
  app.use("/api/post-close", postCloseRouter);
  app.use("/api/webhooks/post-close", postCloseWebhookRouter);
  app.use("/api/deals", dealsRouter);
  app.use("/api/lead-purchases", leadPurchasesRouter);
  app.use("/api/webhooks/lead-purchases", leadPurchasesWebhookRouter);
  app.use("/api/business-card", businessCardRouter);
  app.use("/api/card", publicBusinessCardRouter);
  app.use("/api/auth/snapchat", snapchatAuthRouter);
  app.use("/api/commissions", commissionsRouter);
  app.use("/api/book-of-business", bookOfBusinessRouter);
  app.use("/api/recruiting", recruitingRouter);
  app.use("/api/email", emailRouter);
  app.use("/api/training-sessions", trainingSessionsRouter);
  app.use("/api/calendar", calendarRouter);

  // Scripts (Agent Sales Scripts)
  app.use("/api/scripts", scriptsRouter);

  // Achievements (self-checking milestone system)
  app.use("/api/achievements", achievementsRouter);

  // Ideas & Feedback (agent idea submissions + upvoting)
  app.use("/api/ideas", ideasRouter);

  // Document Templates (PDF generation, delivery, approval queue)
  app.use("/api/document-templates", documentTemplatesRouter);

  // GET /api/team-activity — Fetch recent team activity for dashboard feed
  app.get("/api/team-activity", rbacRequireAuth, async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const result = await pool.query(
        'SELECT * FROM team_activity_feed ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      res.json({ activities: result.rows });
    } catch (error: any) {
      console.error("[TeamActivity] Error:", error?.message);
      res.status(500).json({ error: "Failed to fetch team activity" });
    }
  });

  // ===== Public Newsletter Subscribe =====
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, firstName, lastName, phone, source, landingPage, referrerUrl } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      // Check if already subscribed
      const existing = await pool.query(
        "SELECT * FROM newsletter_subscribers WHERE email = $1",
        [email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        const existingRecord = existing.rows[0];

        // Update info if new details provided (fill in missing fields)
        const updatedFirstName = firstName || existingRecord.first_name;
        const updatedLastName = lastName || existingRecord.last_name;
        const updatedPhone = phone || existingRecord.phone;

        if (existingRecord.status === "unsubscribed") {
          await pool.query(
            `UPDATE newsletter_subscribers SET
              status = 'active',
              first_name = COALESCE($2, first_name),
              last_name = COALESCE($3, last_name),
              phone = COALESCE($4, phone),
              unsubscribed_at = NULL,
              updated_at = NOW()
            WHERE email = $1`,
            [email.toLowerCase(), firstName, lastName, phone]
          );

          await pool.query(
            `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
             VALUES ($1, 'resubscribed', 'User resubscribed', 'user')`,
            [existingRecord.id]
          );

          return res.json({ success: true, message: "Welcome back! You've been resubscribed." });
        }

        // Update any missing info for existing active subscribers
        if (firstName || lastName || phone) {
          await pool.query(
            `UPDATE newsletter_subscribers SET
              first_name = COALESCE($2, first_name),
              last_name = COALESCE($3, last_name),
              phone = COALESCE($4, phone),
              updated_at = NOW()
            WHERE email = $1`,
            [email.toLowerCase(), firstName, lastName, phone]
          );
        }

        return res.json({ success: true, message: "You're already subscribed!" });
      }

      // Generate a unique unsubscribe token
      const unsubscribeToken = crypto.randomUUID();

      const result = await pool.query(
        `INSERT INTO newsletter_subscribers
          (email, first_name, last_name, phone, source, landing_page, referrer_url, ip_address, user_agent, created_by, confirm_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'user', $10)
         RETURNING id`,
        [
          email.toLowerCase(),
          firstName || null,
          lastName || null,
          phone || null,
          source || "website",
          landingPage || null,
          referrerUrl || null,
          ipAddress,
          userAgent,
          unsubscribeToken,
        ]
      );

      await pool.query(
        `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, metadata, performed_by)
         VALUES ($1, 'subscribed', 'Subscribed via website', $2, 'user')`,
        [result.rows[0].id, JSON.stringify({ source: source || "website", landingPage })]
      );

      res.status(201).json({ success: true, message: "Thanks for subscribing!" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // ===== Public Newsletter Unsubscribe =====

  // GET unsubscribe page data (lookup by token)
  app.get("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const result = await pool.query(
        `SELECT id, email, first_name, status FROM newsletter_subscribers WHERE confirm_token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invalid or expired unsubscribe link" });
      }

      const subscriber = result.rows[0];

      // Mask email for privacy (show first 2 chars and domain)
      const [localPart, domain] = subscriber.email.split("@");
      const maskedEmail = localPart.slice(0, 2) + "***@" + domain;

      res.json({
        email: maskedEmail,
        firstName: subscriber.first_name,
        status: subscriber.status,
        alreadyUnsubscribed: subscriber.status === "unsubscribed"
      });
    } catch (error) {
      console.error("Error fetching unsubscribe info:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // POST to confirm unsubscribe
  app.post("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;

      const result = await pool.query(
        `SELECT id, email, status FROM newsletter_subscribers WHERE confirm_token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invalid or expired unsubscribe link" });
      }

      const subscriber = result.rows[0];

      if (subscriber.status === "unsubscribed") {
        return res.json({ success: true, message: "You were already unsubscribed" });
      }

      // Update status to unsubscribed
      await pool.query(
        `UPDATE newsletter_subscribers
         SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [subscriber.id]
      );

      // Log activity
      await pool.query(
        `INSERT INTO subscriber_activity (subscriber_id, activity_type, description, performed_by)
         VALUES ($1, 'unsubscribed', 'User unsubscribed via email link', 'user')`,
        [subscriber.id]
      );

      res.json({ success: true, message: "You have been successfully unsubscribed" });
    } catch (error) {
      console.error("Error processing unsubscribe:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // ===== Training API Routes =====

  // Training Progress: Get all progress for current user
  app.get("/api/training/progress", requireAuth, async (req, res) => {
    try {
      const progress = await storage.getTrainingProgress(req.session.userId!);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching training progress:", error);
      res.status(500).json({ error: "Failed to fetch training progress" });
    }
  });

  // Training Progress: Get specific module progress
  app.get("/api/training/progress/:moduleId", requireAuth, async (req, res) => {
    try {
      const progress = await storage.getModuleProgress(req.session.userId!, req.params.moduleId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ error: "Failed to fetch module progress" });
    }
  });

  // Training Progress: Save/update module progress
  app.post("/api/training/progress", requireAuth, async (req, res) => {
    try {
      const { moduleId, status, progressPercent, lastPosition, timeSpentMinutes } = req.body;

      if (!moduleId) {
        return res.status(400).json({ error: "moduleId is required" });
      }

      const progressData: any = {
        userId: req.session.userId!,
        moduleId,
      };

      if (status) progressData.status = status;
      if (progressPercent !== undefined) progressData.progressPercent = progressPercent;
      if (lastPosition) progressData.lastPosition = lastPosition;
      if (timeSpentMinutes !== undefined) progressData.timeSpentMinutes = timeSpentMinutes;

      // Set timestamps based on status
      if (status === "in_progress" && !progressData.startedAt) {
        progressData.startedAt = new Date();
      }
      if (status === "completed") {
        progressData.completedAt = new Date();
        progressData.progressPercent = 100;
      }

      const progress = await storage.upsertTrainingProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error saving training progress:", error);
      res.status(500).json({ error: "Failed to save training progress" });
    }
  });

  // Assessments: Get assessment history
  app.get("/api/training/assessments/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getAssessmentHistory(req.session.userId!);
      res.json(history);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      res.status(500).json({ error: "Failed to fetch assessment history" });
    }
  });

  // Assessments: Get attempts for specific assessment
  app.get("/api/training/assessments/:assessmentId/attempts", requireAuth, async (req, res) => {
    try {
      const attempts = await storage.getAssessmentAttempts(req.session.userId!, req.params.assessmentId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching assessment attempts:", error);
      res.status(500).json({ error: "Failed to fetch assessment attempts" });
    }
  });

  // Assessments: Submit assessment result
  app.post("/api/training/assessments/submit", requireAuth, async (req, res) => {
    try {
      const { assessmentId, score, passed, autoFailed, autoFailReason, timeSpentMinutes, answers } = req.body;

      if (!assessmentId || score === undefined || passed === undefined) {
        return res.status(400).json({ error: "assessmentId, score, and passed are required" });
      }

      const result = await storage.createAssessmentResult({
        userId: req.session.userId!,
        assessmentId,
        score,
        passed,
        autoFailed: autoFailed || false,
        autoFailReason: autoFailReason || null,
        timeSpentMinutes: timeSpentMinutes || null,
        answers: answers || null,
      });

      // Award XP for passed assessments
      if (passed && !autoFailed) {
        const xpAmount = score >= 90 ? 100 : score >= 80 ? 75 : 50;
        await storage.createXpTransaction({
          userId: req.session.userId!,
          amount: xpAmount,
          reason: `Passed assessment: ${assessmentId}`,
          sourceType: "assessment",
          sourceId: assessmentId,
        });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      res.status(500).json({ error: "Failed to submit assessment" });
    }
  });

  // Simulations: Get simulation history
  app.get("/api/training/simulations/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getSimulationHistory(req.session.userId!);
      res.json(history);
    } catch (error) {
      console.error("Error fetching simulation history:", error);
      res.status(500).json({ error: "Failed to fetch simulation history" });
    }
  });

  // Simulations: Submit simulation result
  app.post("/api/training/simulations/submit", requireAuth, async (req, res) => {
    try {
      const { scenarioId, scoreBreakdown, totalScore, passed, pathTaken, feedback, audioUrl } = req.body;

      if (!scenarioId) {
        return res.status(400).json({ error: "scenarioId is required" });
      }

      const result = await storage.createSimulationResult({
        userId: req.session.userId!,
        scenarioId,
        scoreBreakdown: scoreBreakdown || null,
        totalScore: totalScore || null,
        passed: passed || null,
        pathTaken: pathTaken || null,
        feedback: feedback || null,
        audioUrl: audioUrl || null,
      });

      // Award XP for simulations
      if (passed && totalScore) {
        const xpAmount = totalScore >= 90 ? 150 : totalScore >= 70 ? 100 : 50;
        await storage.createXpTransaction({
          userId: req.session.userId!,
          amount: xpAmount,
          reason: `Completed simulation: ${scenarioId}`,
          sourceType: "simulation",
          sourceId: scenarioId,
        });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Error submitting simulation:", error);
      res.status(500).json({ error: "Failed to submit simulation" });
    }
  });

  // Certificates: Get user's certificates
  app.get("/api/training/certificates", requireAuth, async (req, res) => {
    try {
      const certificates = await storage.getCertificates(req.session.userId!);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Certificates: Verify certificate by number (public endpoint)
  app.get("/api/training/certificates/verify/:certificateNumber", async (req, res) => {
    try {
      const certificate = await storage.getCertificateByNumber(req.params.certificateNumber);
      if (!certificate) {
        return res.status(404).json({ valid: false, error: "Certificate not found" });
      }

      const user = await storage.getUserById(certificate.userId);
      res.json({
        valid: true,
        certificate: {
          certificationId: certificate.certificationId,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
          holderName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        },
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ error: "Failed to verify certificate" });
    }
  });

  // Certificates: Generate certificate (after completing certification requirements)
  app.post("/api/training/certificates/generate", requireAuth, async (req, res) => {
    try {
      const { certificationId, expiresAt } = req.body;

      if (!certificationId) {
        return res.status(400).json({ error: "certificationId is required" });
      }

      // Check if user already has this certificate
      const existingCerts = await storage.getCertificates(req.session.userId!);
      const existing = existingCerts.find(c => c.certificationId === certificationId);
      if (existing) {
        return res.status(400).json({ error: "Certificate already issued for this certification" });
      }

      const certificate = await storage.createCertificate({
        userId: req.session.userId!,
        certificationId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      // Award XP for earning a certificate
      await storage.createXpTransaction({
        userId: req.session.userId!,
        amount: 250,
        reason: `Earned certificate: ${certificationId}`,
        sourceType: "achievement",
        sourceId: certificationId,
      });

      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });

  // XP: Get user's XP history
  app.get("/api/training/xp/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getXpHistory(req.session.userId!);
      res.json(history);
    } catch (error) {
      console.error("Error fetching XP history:", error);
      res.status(500).json({ error: "Failed to fetch XP history" });
    }
  });

  // XP: Get user's total XP
  app.get("/api/training/xp/total", requireAuth, async (req, res) => {
    try {
      const totalXp = await storage.getTotalXp(req.session.userId!);
      res.json({ totalXp });
    } catch (error) {
      console.error("Error fetching total XP:", error);
      res.status(500).json({ error: "Failed to fetch total XP" });
    }
  });

  // Leaderboard: Get top agents by XP
  app.get("/api/training/leaderboard", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);

      // Find current user's rank
      const allRankings = await storage.getLeaderboard(1000);
      const userRank = allRankings.findIndex(r => r.userId === req.session.userId!) + 1;
      const userEntry = allRankings.find(r => r.userId === req.session.userId!);

      res.json({
        leaderboard: leaderboard.map((entry, idx) => ({
          rank: idx + 1,
          userId: entry.userId,
          firstName: entry.user.firstName,
          lastName: entry.user.lastName,
          totalXp: entry.totalXp,
          isCurrentUser: entry.userId === req.session.userId!,
        })),
        currentUser: {
          rank: userRank || null,
          totalXp: userEntry?.totalXp || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Training Summary: Get comprehensive training stats
  app.get("/api/training/summary", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const [progress, assessments, simulations, certificates, totalXp] = await Promise.all([
        storage.getTrainingProgress(userId),
        storage.getAssessmentHistory(userId),
        storage.getSimulationHistory(userId),
        storage.getCertificates(userId),
        storage.getTotalXp(userId),
      ]);

      const completedModules = progress.filter(p => p.status === "completed").length;
      const inProgressModules = progress.filter(p => p.status === "in_progress").length;
      const passedAssessments = assessments.filter(a => a.passed && !a.autoFailed).length;
      const passedSimulations = simulations.filter(s => s.passed).length;

      res.json({
        modules: {
          completed: completedModules,
          inProgress: inProgressModules,
          total: progress.length,
        },
        assessments: {
          passed: passedAssessments,
          total: assessments.length,
          averageScore: assessments.length > 0
            ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
            : 0,
        },
        simulations: {
          passed: passedSimulations,
          total: simulations.length,
        },
        certificates: certificates.length,
        totalXp,
      });
    } catch (error) {
      console.error("Error fetching training summary:", error);
      res.status(500).json({ error: "Failed to fetch training summary" });
    }
  });

  // ===== Analytics API Routes =====

  // Track page view (called from client)
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { page, title, referrer, userAgent, screenWidth, screenHeight } = req.body;

      await storage.createPageView({
        page: page || "/",
        title: title || null,
        referrer: referrer || null,
        userAgent: userAgent || null,
        screenWidth: screenWidth?.toString() || null,
        screenHeight: screenHeight?.toString() || null,
        sessionId: req.sessionID || null,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      // Silent fail - don't break the app if analytics fails
      res.status(201).json({ success: true });
    }
  });

  // Track custom event (called from client)
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const { event, params, page, timestamp } = req.body;

      await storage.createAnalyticsEvent({
        eventName: event,
        eventParams: params ? JSON.stringify(params) : null,
        page: page || null,
        sessionId: req.sessionID || null,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      // Silent fail
      res.status(201).json({ success: true });
    }
  });

  // Get analytics overview for admin dashboard
  // Uses SQL COUNT queries for scalability with high traffic (1000s+ views daily)
  app.get("/api/analytics/overview", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Use efficient SQL COUNT queries instead of loading all records
      const [
        pageViewCounts,
        quoteCounts,
        contactCounts,
        applications,
        quotes,
        contacts,
        pageStats,
        eventStats,
        trends,
      ] = await Promise.all([
        storage.getPageViewCounts(),
        storage.getQuoteCounts(),
        storage.getContactCounts(),
        storage.getJobApplications(),
        storage.getQuoteRequests(),  // Only for recent list and breakdowns
        storage.getContactMessages(), // Only for recent list
        storage.getPageViewStats(),
        storage.getEventStats(),
        storage.getDailyTrends(30),
      ]);

      // Coverage type breakdown (from loaded quotes)
      const coverageTypes = quotes.reduce((acc, q) => {
        const type = q.coverageType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // State breakdown (from loaded quotes)
      const stateBreakdown = quotes.reduce((acc, q) => {
        const state = q.state || 'unknown';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        summary: {
          quotes: quoteCounts,
          contacts: contactCounts,
          applications: {
            total: applications.length,
          },
          pageViews: pageViewCounts,
        },
        coverageTypes,
        stateBreakdown,
        topPages: pageStats.slice(0, 10),
        eventStats: eventStats.slice(0, 10),
        trends,
        recentQuotes: quotes.slice(0, 10).map(q => ({
          id: q.id,
          name: `${q.firstName} ${q.lastName}`,
          coverageType: q.coverageType,
          coverageAmount: q.coverageAmount,
          state: q.state,
          createdAt: q.createdAt,
        })),
        recentContacts: contacts.slice(0, 10).map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ─── Universal Search API ───────────────────────────────────────
  app.get("/api/search", requireAuth, async (req, res) => {
    try {
      const query = (req.query.q as string || '').trim().toLowerCase();
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const scope = (req.query.scope as string) || 'all';

      if (query.length < 2) {
        return res.json({ results: [], total: 0, query });
      }

      const results: Array<{
        id: string;
        type: string;
        title: string;
        subtitle?: string;
        url: string;
        metadata?: Record<string, unknown>;
      }> = [];

      // Get user for role-based filtering
      const user = await storage.getUserById(req.session.userId!);
      const userRole = user?.role || 'client';

      // Search quotes (leads) - available to agents and admins
      if ((scope === 'all' || scope === 'leads') &&
          ['owner', 'system_admin', 'manager', 'sales_agent'].includes(userRole)) {
        const quotes = await storage.getQuoteRequests();
        const matchingQuotes = quotes
          .filter((q: any) =>
            q.firstName?.toLowerCase().includes(query) ||
            q.lastName?.toLowerCase().includes(query) ||
            q.email?.toLowerCase().includes(query) ||
            q.phone?.includes(query)
          )
          .slice(0, limit);

        for (const q of matchingQuotes) {
          results.push({
            id: String(q.id),
            type: 'lead',
            title: `${q.firstName} ${q.lastName}`,
            subtitle: `${q.coverageType || 'Lead'} - ${q.email}`,
            url: `/agents/inbox?lead=${q.id}`,
            metadata: { coverageAmount: q.coverageAmount, state: q.state }
          });
        }
      }

      // Search contact messages
      if ((scope === 'all' || scope === 'contacts') &&
          ['owner', 'system_admin', 'manager'].includes(userRole)) {
        const contacts = await storage.getContactMessages();
        const matchingContacts = contacts
          .filter((c: any) =>
            c.firstName?.toLowerCase().includes(query) ||
            c.lastName?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.message?.toLowerCase().includes(query)
          )
          .slice(0, limit);

        for (const c of matchingContacts) {
          results.push({
            id: String(c.id),
            type: 'ticket',
            title: `${c.firstName} ${c.lastName}`,
            subtitle: c.message?.substring(0, 50) || '',
            url: `/admin/submissions?contact=${c.id}`,
          });
        }
      }

      res.json({
        results: results.slice(0, limit),
        total: results.length,
        query
      });
    } catch (error) {
      console.error("[Search] Error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ─── 37-Agent Enterprise OS ───────────────────────────────────
  try {
    const agentRegistry = await bootstrapAgentSystem();
    const agentRoutes = createAgentRoutes(agentRegistry);
    app.use('/api', agentRoutes);
    console.log('🤖 Agent Enterprise OS: 37 agents online');
  } catch (error) {
    console.error('⚠️ Agent system failed to bootstrap:', error);
  }

  return httpServer;
}

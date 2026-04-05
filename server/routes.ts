import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertQuoteRequestSchema, insertContactMessageSchema, insertJobApplicationSchema, loginSchema, registerSchema, agentRegisterSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendContactNotification, sendQuoteNotification, sendQuoteConfirmationToApplicant, sendPortalMessage, sendMeetingNotification, sendJobApplicationNotification, sendPrivacyRequestNotification, sendSecureFormEmail, sendBookingLinkEmail, sendRecruitInviteEmail, sendPolicyQuoteEmail, sendAgentLeadNotification, sendWebsiteLinkEmail, sendPasswordResetEmail, sendProductGuideEmail } from "./gmail";
import { sendSecureFormLink, sendBookingLink, sendSms, isSmsAvailable } from "./services/smsService";
// Google Calendar routes now handled by server/routes/calendar.ts
import { addLeadToSheet } from "./sheets";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import adminProductsRouter from "./routes/admin-products";
import adminContentRouter from "./routes/admin-content";
import adminCrmRouter from "./routes/admin-crm";
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
import callsRouter from "./routes/calls";
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgSession = connectPgSimple(session);

export function setupSession(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";

  // SECURITY: Session secret must be set in environment
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  app.set("trust proxy", 1);
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax", // SECURITY: Changed from 'none' to 'lax' for better security
      },
    })
  );
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

      console.log(`[Registration] New agent application from ${validatedData.email}`);

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
      res.json({ user: safeUser });
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

  // Quote request submission (rate limited)
  app.post("/api/quote-requests", quoteLimiter, async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      
      // Broadcast new website lead to Executive Lead Distribution via WebSocket
      try {
        const wsServer = app.get('wsServer');
        if (wsServer) {
          // Parse coverage amount to numeric
          const coverageNum = parseInt(String(validatedData.coverageAmount).replace(/[^0-9]/g, '')) || 0;
          // Calculate age from birthDate
          const birthYear = validatedData.birthDate ? new Date(validatedData.birthDate).getFullYear() : null;
          const age = birthYear ? new Date().getFullYear() - birthYear : null;
          // Auto-score: higher coverage = higher score, adjusted by age
          const baseScore = Math.min(90, Math.max(30, Math.round(coverageNum / 10000) * 5 + 40));
          const leadScore = age && age >= 30 && age <= 55 ? Math.min(95, baseScore + 10) : baseScore;
          // Priority based on coverage amount
          const priority = coverageNum >= 500000 ? 'urgent' : coverageNum >= 250000 ? 'high' : coverageNum >= 100000 ? 'medium' : 'low';

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
              scoreTier: leadScore >= 80 ? 'on_fire' : leadScore >= 60 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold',
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
  app.post("/api/secure-forms/send", async (req, res) => {
    try {
      const {
        clientName,
        clientEmail,
        formType,
        carrier,
        carrierId,
        customMessage,
        sendMethod,
        agent
      } = req.body;

      // Validate required fields
      if (!clientName || !clientEmail || !formType || !agent) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!agent.name || !agent.email) {
        return res.status(400).json({ error: "Agent information is required" });
      }

      if (!carrierId) {
        return res.status(400).json({ error: "Carrier selection is required" });
      }

      // Generate a unique secure link
      const linkId = crypto.randomBytes(16).toString('hex');
      // Use the app's base URL (in production, this would be the production domain)
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://heritagels.org'
        : `http://localhost:${process.env.PORT || 5000}`;
      const secureLink = `${baseUrl}/secure/form/${linkId}`;

      // Set expiration to 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Store form metadata in database
      await pool.query(
        `INSERT INTO secure_forms (link_id, form_type, carrier_id, carrier_name, client_name, client_email, agent_name, agent_email, agent_phone, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (link_id) DO UPDATE SET status = $10, expires_at = $11`,
        [linkId, formType, carrierId, carrier, clientName, clientEmail, agent.name, agent.email, agent.phone || '', 'pending', expiresAt]
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

  // List all secure forms (for agent dashboard) - MUST be before :linkId routes
  app.get("/api/secure-forms", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT link_id, form_type, carrier_id, carrier_name, client_name, client_email,
                agent_name, agent_email, status, created_at, expires_at, submitted_data
         FROM secure_forms ORDER BY created_at DESC`
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

      res.json({
        linkId,
        formType: formData.form_type,
        carrierId: formData.carrier_id,
        carrierName: formData.carrier_name,
        clientName: formData.client_name,
        agentName: formData.agent_name,
        status: formData.status,
        submittedData: formData.submitted_data,
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

      // Store the submitted data
      const submittedData = req.body.formData || req.body;
      await pool.query(
        `UPDATE secure_forms SET status = $1, submitted_data = $2, submitted_at = $3 WHERE link_id = $4`,
        ['completed', JSON.stringify(submittedData), new Date(), linkId]
      );

      console.log(`[SecureForm] Form submitted: ${linkId}`);

      // In production, you would:
      // 1. Encrypt and store the data securely
      // 2. Send notification to the agent
      // 3. Trigger any carrier-specific workflows

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
        smsSent: false
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

  const quoteStore = new Map<string, {
    quoteId: string;
    quoteRef: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string | null;
    quoteType: string;
    quoteTypeName: string;
    carrierId: string;
    carrierName: string;
    coverageAmount: string;
    premium: string;
    premiumFrequency: string;
    termLength: string | null;
    healthClass: string | null;
    benefits: string;
    additionalNotes: string | null;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
    agentNpn: string | null;
    status: 'sent' | 'opened' | 'expired';
    createdAt: string;
    openedAt: string | null;
    expiresAt: string | null;
  }>();

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

  // In-memory website settings store (agent customizations)
  const websiteSettingsStore = new Map<string, {
    agentSlug: string;
    headline: string | null;
    tagline: string | null;
    bio: string | null;
    featuredProducts: string[];
    showTestimonials: boolean;
    showFaq: boolean;
    showCarriers: boolean;
    showScheduleCall: boolean;
    updatedAt: string;
  }>();

  // Get website settings for an agent
  app.get("/api/website-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const settings = websiteSettingsStore.get(agentSlug);
      if (settings) {
        res.json(settings);
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

  // Save website settings for an agent
  app.post("/api/website-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const { headline, tagline, bio, featuredProducts, showTestimonials, showFaq, showCarriers, showScheduleCall } = req.body;

      websiteSettingsStore.set(agentSlug, {
        agentSlug,
        headline: headline || null,
        tagline: tagline || null,
        bio: bio || null,
        featuredProducts: featuredProducts || ['term_life', 'whole_life', 'iul', 'final_expense', 'annuities'],
        showTestimonials: showTestimonials !== false,
        showFaq: showFaq !== false,
        showCarriers: showCarriers !== false,
        showScheduleCall: showScheduleCall !== false,
        updatedAt: new Date().toISOString(),
      });

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

  // In-memory recruiting settings store (agent customizations for recruiting page)
  const recruitingSettingsStore = new Map<string, {
    agentSlug: string;
    headline: string | null;
    subheadline: string | null;
    showTestimonials: boolean;
    showFaq: boolean;
    showCommissionTable: boolean;
    showSteps: boolean;
    updatedAt: string;
  }>();

  // Get recruiting page settings for an agent
  app.get("/api/recruiting-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const settings = recruitingSettingsStore.get(agentSlug);
      if (settings) {
        res.json(settings);
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

  // Save recruiting page settings for an agent
  app.post("/api/recruiting-settings/:agentSlug", async (req, res) => {
    try {
      const { agentSlug } = req.params;
      const { headline, subheadline, showTestimonials, showFaq, showCommissionTable, showSteps } = req.body;

      recruitingSettingsStore.set(agentSlug, {
        agentSlug,
        headline: headline || null,
        subheadline: subheadline || null,
        showTestimonials: showTestimonials !== false,
        showFaq: showFaq !== false,
        showCommissionTable: showCommissionTable !== false,
        showSteps: showSteps !== false,
        updatedAt: new Date().toISOString(),
      });

      console.log(`[RecruitingSettings] Saved settings for ${agentSlug}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[RecruitingSettings] Error saving:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Get recruiting page stats for an agent
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

      const applications = 0; // TODO: count from recruit applications store
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

  const productGuideStore = new Map<string, {
    linkId: string;
    guideId: string;
    guideTitle: string;
    guideDescription: string;
    clientName: string;
    clientEmail: string;
    agentName: string;
    agentEmail: string;
    agentPhone: string;
    agentNpn: string;
    personalMessage?: string;
    createdAt: Date;
    status: 'sent' | 'opened';
  }>();

  // Send product guide email to a client
  app.post("/api/product-guides/send", requireAuth, async (req, res) => {
    try {
      const { clientName, clientEmail, guideId, guideTitle, guideDescription, personalMessage, agent } = req.body;

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

      productGuideStore.set(linkId, {
        linkId,
        guideId,
        guideTitle,
        guideDescription: guideDescription || '',
        clientName,
        clientEmail,
        agentName: agent.name,
        agentEmail: agent.email,
        agentPhone: agent.phone || '',
        agentNpn,
        personalMessage: personalMessage || undefined,
        createdAt: new Date(),
        status: 'sent',
      });

      await sendProductGuideEmail({
        recipientName: clientName,
        recipientEmail: clientEmail,
        guideUrl,
        guideTitle,
        guideDescription: guideDescription || '',
        personalMessage: personalMessage || undefined,
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

  // Fetch product guide metadata (public — accessed via email link)
  app.get("/api/product-guides/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      const guideData = productGuideStore.get(linkId);

      if (!guideData) {
        return res.status(404).json({ error: "Guide link not found" });
      }

      if (guideData.status === 'sent') {
        guideData.status = 'opened';
      }

      res.json({
        guideId: guideData.guideId,
        guideTitle: guideData.guideTitle,
        guideDescription: guideData.guideDescription,
        clientName: guideData.clientName,
        agentName: guideData.agentName,
        agentEmail: guideData.agentEmail,
        agentPhone: guideData.agentPhone,
        agentNpn: guideData.agentNpn,
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

  app.post("/api/quotes/send", async (req, res) => {
    try {
      const {
        clientName, clientEmail, clientPhone,
        quoteType, quoteTypeName, carrierId, carrierName,
        coverageAmount, premium, premiumFrequency,
        termLength, healthClass, benefits, additionalNotes,
        sendMethod, agent
      } = req.body;

      if (!clientName || !clientEmail || !carrierId || !quoteType || !coverageAmount || !premium) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (!agent?.name || !agent?.email) {
        return res.status(400).json({ error: "Agent information is required" });
      }

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const quoteRef = `HLS-${dateStr}-${rand}`;
      const quoteId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      quoteStore.set(quoteId, {
        quoteId, quoteRef, clientName, clientEmail,
        clientPhone: clientPhone || null,
        quoteType, quoteTypeName: quoteTypeName || quoteType,
        carrierId, carrierName, coverageAmount, premium,
        premiumFrequency: premiumFrequency || 'monthly',
        termLength: termLength || null, healthClass: healthClass || null,
        benefits: benefits || '', additionalNotes: additionalNotes || null,
        agentName: agent.name, agentEmail: agent.email,
        agentPhone: agent.phone || '', agentNpn: agent.npn || null,
        status: 'sent', createdAt: now.toISOString(),
        openedAt: null, expiresAt: null,
      });

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

      res.status(201).json({ success: true, quoteId, quoteRef, emailSent: true, smsSent });
    } catch (error: any) {
      console.error("[PolicyQuote] Error:", error);
      res.status(500).json({ error: "Failed to send policy quote" });
    }
  });

  app.get("/api/quotes", async (_req, res) => {
    try {
      const quotes = Array.from(quoteStore.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ quotes });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:quoteId", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const quote = quoteStore.get(quoteId);

      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Check if expired
      if (quote.status === 'expired' || (quote.expiresAt && new Date(quote.expiresAt) < new Date())) {
        quote.status = 'expired';
        return res.status(410).json({ error: "This quote has expired", expired: true });
      }

      // Mark as opened on first view and set 14-day expiration
      if (quote.status === 'sent') {
        const now = new Date();
        quote.status = 'opened';
        quote.openedAt = now.toISOString();
        quote.expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      }

      res.json({ quote });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch quote" });
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
      const access = await storage.getUserLoungeAccess(userId);
      const accessMap: Record<string, boolean> = {};
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

  // Portal: Get billing history
  app.get("/api/portal/billing", requireAuth, async (req, res) => {
    try {
      const billing = await storage.getBillingHistoryByUserId(req.session.userId!);
      res.json(billing);
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

  // Admin: Products management (requires admin role)
  app.use("/api/admin/products", requireAuth, requireAdmin, adminProductsRouter);

  // Admin: Content management (CMS, requires admin role)
  app.use("/api/admin/content", requireAuth, requireAdmin, adminContentRouter);

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
  app.use("/api/email", emailRouter);
  app.use("/api/training-sessions", trainingSessionsRouter);
  app.use("/api/calendar", calendarRouter);

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

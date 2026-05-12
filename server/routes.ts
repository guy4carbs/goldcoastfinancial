import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema, insertContactMessageSchema, insertJobApplicationSchema, loginSchema, registerSchema, insertInstitutionalContactSchema, insertNewsletterSchema, insertPartnershipQuizSchema, insertInstitutionalMeetingSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendContactNotification, sendQuoteNotification, sendPortalMessage, sendMeetingNotification, sendJobApplicationNotification, sendPartnershipQuizNotification, sendNewsletterNotification, sendNewsletterWelcome } from "./gmail";
import { checkCalendarConnection, getCalendarEvents, getTodaysEvents, getUpcomingEvents, getConnectedEmail } from "./googleCalendar";
import { addLeadToSheet } from "./sheets";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// HCMS Route Imports
import { attachUser, blockWritesDuringViewAs, requireAuth as requireAuthMw, requireRole, FOUNDERS_ONLY } from "./middleware/auth";
import { onRoleChanged } from "./services/foundersEventBus";
import { logFounderAction } from "./services/founderAudit";
import { ROLES_REQUIRING_2FA_SET } from "./types/permissions";
import { csrfProtection, csrfTokenHandler } from "./middleware/csrf";
import { setRlsContext } from "./middleware/rlsContext";
import {
  startEnrolment,
  verifyTotpCode,
  decryptStoredSecret,
  encryptSecretForStorage,
  persistRecoveryCodes,
  consumeRecoveryCode,
} from "./services/totp";
import { requestEmailOtp, verifyEmailOtp } from "./services/emailOtp";
import {
  buildRegistrationOptions,
  consumeRegistration,
  buildAuthenticationOptions,
  consumeAuthentication,
  listCredentials,
  deleteCredential,
} from "./services/webauthn";
import hcmsAgentsRouter from "./routes/hcms-agents";
import hcmsContractingRouter from "./routes/hcms-contracting";
import hcmsSigningRouter from "./routes/hcms-signing";
import hcmsLicensingRouter from "./routes/hcms-licensing";
import hcmsCarriersRouter from "./routes/hcms-carriers";
import hcmsDocumentsRouter from "./routes/hcms-documents";
import applyRouter from "./routes/apply";
import accountRouter from "./routes/account";
import agentPortalRouter from "./routes/agent-portal";
import agentNotificationsRouter from "./routes/agent-notifications";
import agentLicensesRouter from "./routes/agent-licenses";
import opsProductionRouter from "./routes/ops-production";
import opsDealsRouter from "./routes/ops-deals";
import opsCrmRouter from "./routes/ops-crm";
import opsCommissionsRouter from "./routes/ops-commissions";
import opsComplianceRouter from "./routes/ops-compliance";
import opsAnalyticsRouter from "./routes/ops-analytics";
import hcmsHierarchyRouter from "./routes/hcms-hierarchy";
import hcmsCompensationRouter from "./routes/hcms-compensation";
import hcmsHierarchyRequestsRouter from "./routes/hcms-hierarchy-requests";
import opsMarketingRouter from "./routes/ops-marketing";
import opsInvestorsRouter from "./routes/ops-investors";
import opsSettingsRouter from "./routes/ops-settings";

// Finance Lounge
import financeDashboardRouter from "./routes/finance-dashboard";
import financeRevenueRouter from "./routes/finance-revenue";
import financeOverridesRouter from "./routes/finance-overrides";
import financeTransactionsRouter from "./routes/finance-transactions";
import financeCashflowRouter from "./routes/finance-cashflow";
import financeChargebacksRouter from "./routes/finance-chargebacks";
import financeStatementsRouter from "./routes/finance-statements";
import financeReconciliationRouter from "./routes/finance-reconciliation";
import financeReportsRouter from "./routes/finance-reports";

// Founders Lounge
import { startViewAsSweeper } from "./services/viewAsSweeper";
import { startLifeOSReminderSweeper } from "./services/lifeosNotifications";
import foundersRouter from "./routes/founders";
import foundersProfitRouter from "./routes/founders-profit";
import foundersPlaidRouter from "./routes/founders-plaid";
import foundersViewasRouter from "./routes/founders-viewas";
import foundersOversightRouter from "./routes/founders-oversight";
import foundersDashboardConfigRouter from "./routes/founders-dashboard-config";
import foundersBookRouter from "./routes/founders-book";

// lifeOS — system update + release notes (cross-app, shared DB)
import lifeosRouter from "./routes/lifeos";
import bookOfBusinessRouter from "./routes/book-of-business";
import foundersTeamsRouter from "./routes/founders-teams";
import foundersLeadsRouter from "./routes/founders-leads";
import foundersMembersRouter from "./routes/founders-members";
import foundersAgenciesRouter from "./routes/founders-agencies";
import {
  leadRevenueFoundersRouter,
  leadRevenueAgentRouter,
} from "./routes/lead-revenue";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgSession = connectPgSimple(session);

// P0 (audit 2026-05-12): in production, refuse to boot without a session
// secret. The previous hardcoded fallback ("gold-coast-financial-secret-key")
// meant a misconfigured deploy with SESSION_SECRET unset would silently use a
// public-source string for cookie signing, enabling trivial session forgery.
function requireSecret(name: string): string {
  const v = process.env[name];
  if (v && v.length >= 16) return v;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[security] ${name} is required in production and must be ≥16 chars. Refusing to boot with a fallback.`,
    );
  }
  return v || "gc-dev-fallback-DO-NOT-USE-IN-PRODUCTION-only-for-localhost";
}

const SESSION_SECRET = requireSecret("SESSION_SECRET");

export function setupSession(app: Express) {
  app.set("trust proxy", 1);
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        // HIGH (audit 2026-05-12): sameSite=none requires an explicit
        // cross-site cookie use case. We don't have one — heritagels.org
        // and the SPA share an origin. Use 'lax' in both prod and dev so
        // cross-site CSRF is mitigated at the cookie layer (defense in
        // depth on top of the double-submit CSRF token).
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
      },
    })
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check endpoint (doesn't require database)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // Mount cookie-parser BEFORE setupSession so the CSRF middleware (which is
  // mounted shortly after the session) can read its own cookie via req.cookies.
  // Sign cookies with the same secret as sessions so signature checks succeed.
  app.use(cookieParser(SESSION_SECRET));

  setupSession(app);

  // Sentinel H4: CSP frame-ancestors + basic hardening. The Founders Lounge
  // embeds an iframe of the impersonated user's landing page; restrict framers
  // to the same origin so no third party can iframe heritagels.org.
  //
  // In DEV we must disable the strict script-src CSP entirely because Vite
  // serves inline bootstrap scripts + HMR websockets that a default helmet CSP
  // would refuse. We still set X-Frame-Options + frame-ancestors via a tiny
  // hand-rolled middleware so dev-mode clickjacking surface stays covered.
  if (process.env.NODE_ENV === "production") {
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "frame-ancestors": ["'self'"],
            // Plaid Link requires its own iframe + scripts when launched.
            "frame-src": ["'self'", "https://cdn.plaid.com"],
            "script-src": ["'self'", "https://cdn.plaid.com"],
            "connect-src": ["'self'", "https://*.plaid.com"],
          },
        },
        // Lock framing/embedding tighter than the default. COEP stays off
        // because Plaid Link iframe doesn't ship CORP headers.
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "same-origin" },
        // 2-year HSTS with preload — when the project is on the preload list,
        // browsers will refuse plaintext entirely.
        strictTransportSecurity: {
          maxAge: 63072000,
          includeSubDomains: true,
          preload: true,
        },
        // Lock down high-impact browser features that this app never needs.
        permittedCrossDomainPolicies: { permittedPolicies: "none" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      }),
    );
    // Permissions-Policy — block sensors and dangerous APIs we don't use.
    app.use((_req, res, next) => {
      res.setHeader(
        "Permissions-Policy",
        [
          "accelerometer=()",
          "camera=()",
          "geolocation=()",
          "gyroscope=()",
          "magnetometer=()",
          "microphone=()",
          "payment=()",
          "usb=()",
          "interest-cohort=()",
        ].join(", "),
      );
      next();
    });
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
      })
    );
    app.use((_req, res, next) => {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      next();
    });
  }

  // GLOBAL view-as write block (Sentinel C1). Mounted AFTER session is attached
  // so req.session.viewingAs is populated, but BEFORE any write-capable route
  // (auth, HCMS, Finance, Ops, Founders). Non-write methods and a small
  // allowlist (view-as session end, logout) are permitted; see the middleware
  // for full details.
  app.use("/api", blockWritesDuringViewAs);

  // CSRF protection on every state-changing API call. Path-level exemptions
  // are baked into the middleware (webhooks, anonymous auth). The SPA fetches
  // /api/csrf-token on boot and echoes the token in the X-CSRF-Token header
  // for every POST/PATCH/DELETE.
  app.get("/api/csrf-token", csrfTokenHandler);
  app.use("/api", csrfProtection);

  // Attach req.user globally on /api so 2FA, plaid, and any other handler can
  // use the role-aware middleware (requireAuthMw, requireRole, etc.) without
  // each router having to mount attachUser separately.
  app.use("/api", attachUser);

  // Section 2.3 — open an RLS-scoped pg client per authenticated request and
  // set `app.user_id` + `app.role` session vars so the RLS policies in
  // migrations/0006_row_level_security.sql have what they need.
  app.use("/api", setRlsContext);

  // Sentinel H1: rate limit the write-heavy / abuse-prone Founders endpoints.
  // Keeps the unique-user-per-IP semantics simple via default IP keying. GET
  // routes are exempted because the review gates insist founders must be able
  // to pull the activity feed freely.
  const foundersWriteLimiter = rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
    message: { error: "Too many requests", code: "RATE_LIMITED" },
  });
  const foundersViewAsLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
    message: { error: "Too many view-as operations", code: "RATE_LIMITED" },
  });

  // lifeOS — /me/status polls every 60s from every authenticated tab; this
  // limiter is generous on GETs but caps abusive write-bursts on /me/ack
  // and the admin write paths.
  const lifeosLimiter = rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many lifeOS requests", code: "RATE_LIMITED" },
  });
  app.use("/api/founders", foundersWriteLimiter);
  app.use("/api/founders/viewas", foundersViewAsLimiter);

  // Sentinel H7: login rate limit. 5 fails / 15min per IP+email is enough to
  // block credential stuffing without locking out forgetful real humans. The
  // DB-side lockout below catches longer-horizon attacks across IPs.
  const loginRateLimiter = rateLimit({
    windowMs: 15 * 60_000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only failures count toward the cap
    keyGenerator: (req) => {
      const ip = req.ip || "unknown";
      const email = String((req.body as any)?.email || "").toLowerCase();
      return `${ip}|${email}`;
    },
    // Skip outside production: dev iteration + Playwright suites must not get
    // locked out of localhost. Production keeps the full 5-attempt cap.
    skip: () => process.env.NODE_ENV !== "production",
    message: {
      error: "Too many login attempts. Please try again in 15 minutes.",
      code: "RATE_LIMITED",
    },
  });
  app.use("/api/auth/login", loginRateLimiter);
  app.use("/api/auth/2fa/verify", loginRateLimiter);

  // HIGH (audit 2026-05-12): account creation needs its own throttle to
  // stop registration spam + email-enumeration brute force. 3 attempts per
  // 15 minutes per IP — generous enough for the bumbling real user, low
  // enough that a single attacker IP can't churn accounts.
  const registerRateLimiter = rateLimit({
    windowMs: 15 * 60_000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || "unknown",
    skip: () => process.env.NODE_ENV !== "production",
    message: { error: "Too many registration attempts. Please try again in 15 minutes.", code: "RATE_LIMITED" },
  });
  app.use("/api/auth/register", registerRateLimiter);

  // Auth: Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user with default role
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        role: "client",
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
  
  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const ip = req.ip || "unknown";
    const userAgent = (req.headers["user-agent"] || "").toString().slice(0, 500);
    let validatedEmail = "";
    try {
      const validatedData = loginSchema.parse(req.body);
      validatedEmail = validatedData.email.toLowerCase();

      // DB-side lockout: 10+ failed attempts for this email in the last 30
      // minutes locks the account until the window passes. Survives across
      // server processes (express-rate-limit is in-memory per process).
      // Skipped outside production so dev iteration + Playwright suites are
      // not blocked by stale failure counts in the local DB.
      if (process.env.NODE_ENV === "production") {
        const lockCheck = await pool.query(
          `SELECT COUNT(*)::int AS fails, MAX(created_at) AS last_at
           FROM login_attempts
           WHERE email = $1 AND success = false
             AND created_at > NOW() - INTERVAL '30 minutes'`,
          [validatedEmail],
        );
        if ((lockCheck.rows[0]?.fails ?? 0) >= 10) {
          return res.status(429).json({
            error: "Account temporarily locked. Try again in 30 minutes.",
            code: "ACCOUNT_LOCKED",
          });
        }
      }

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        await pool
          .query(
            `INSERT INTO login_attempts (email, ip_address, success, user_agent) VALUES ($1, $2, false, $3)`,
            [validatedEmail, ip, userAgent],
          )
          .catch(() => {});
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password
      const isValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isValid) {
        await pool
          .query(
            `INSERT INTO login_attempts (email, ip_address, success, user_agent) VALUES ($1, $2, false, $3)`,
            [validatedEmail, ip, userAgent],
          )
          .catch(() => {});
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Successful login — record + set session
      await pool
        .query(
          `INSERT INTO login_attempts (email, ip_address, success, user_agent) VALUES ($1, $2, true, $3)`,
          [validatedEmail, ip, userAgent],
        )
        .catch(() => {});
      req.session.userId = user.id;
      // SECURITY: every fresh password login must re-prove possession of the
      // second factor. Clear any leftover 2FA-verified flag from a prior
      // session so Touch ID / Face ID / TOTP is forced on the very next call.
      (req.session as any).twoFactorVerified = false;

      // 2FA gate hints — let the SPA decide the next route. The list of
      // forced-2FA roles is the single source of truth in
      // server/types/permissions.ts → ROLES_REQUIRING_2FA. Adding a role
      // there is the only change needed to make 2FA mandatory for it.
      const requires_2fa_enrollment =
        ROLES_REQUIRING_2FA_SET.has(user.role) && !user.twoFactorEnabled;
      const requires_2fa_verification = !!user.twoFactorEnabled;

      // Return user without password
      const { password, ...safeUser } = user;
      res.json({ user: safeUser, requires_2fa_enrollment, requires_2fa_verification });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error logging in:", error?.message || "login_failed");
      res.status(500).json({ error: "Failed to log in" });
    }
  });
  
  // ─── 2FA (TOTP) routes ─────────────────────────────────────────────
  // Mandatory for FOUNDER/OWNER/SYSTEM_ADMIN. Other roles can opt-in.
  // Flow:
  //   1. POST /api/auth/2fa/enroll/begin      → returns secret + QR + recovery codes
  //   2. POST /api/auth/2fa/enroll/verify     → confirms a TOTP code, persists secret
  //   3. POST /api/auth/2fa/verify            → login challenge (sets twoFactorVerified)
  //   4. POST /api/auth/2fa/recovery          → consume a single-use recovery code
  //   5. POST /api/auth/2fa/disable           → reset for a user (admin path)
  app.post("/api/auth/2fa/enroll/begin", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (req.user.twoFactorEnabled) {
      return res.status(409).json({ error: "2FA is already enabled. Disable first to re-enroll." });
    }
    try {
      const artifact = await startEnrolment({ userEmail: req.user.email });
      // Stash the candidate secret in the session until verify completes.
      // We never write to users.two_factor_secret until the user proves they
      // can produce a valid TOTP code from this secret.
      (req.session as any).pending2faSecret = artifact.secret;
      (req.session as any).pending2faRecoveryCodes = artifact.recoveryCodes;
      res.json({
        secret: artifact.secret,
        otpauthUrl: artifact.otpauthUrl,
        qrDataUrl: artifact.qrDataUrl,
        recoveryCodes: artifact.recoveryCodes,
      });
    } catch (e: any) {
      console.error("2FA enroll/begin error:", e?.message || "enroll_begin_failed");
      res.status(500).json({ error: "Failed to start 2FA enrolment" });
    }
  });

  app.post("/api/auth/2fa/enroll/verify", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const code = String((req.body as any)?.code || "").trim();
    const session = req.session as any;
    const secret: string | undefined = session.pending2faSecret;
    const recoveryCodes: string[] | undefined = session.pending2faRecoveryCodes;
    if (!secret) return res.status(400).json({ error: "No enrolment in progress" });
    if (!verifyTotpCode(secret, code)) {
      return res.status(401).json({ error: "Invalid code" });
    }
    try {
      const encrypted = encryptSecretForStorage(secret);
      await pool.query(
        `UPDATE users SET two_factor_secret = $1, two_factor_enabled = true WHERE id = $2`,
        [encrypted, req.user.id],
      );
      if (recoveryCodes?.length) {
        await persistRecoveryCodes(req.user.id, recoveryCodes);
      }
      delete session.pending2faSecret;
      delete session.pending2faRecoveryCodes;
      session.twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("2FA enroll/verify error:", e?.message || "enroll_verify_failed");
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  });

  app.post("/api/auth/2fa/verify", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!req.user.twoFactorEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }
    const code = String((req.body as any)?.code || "").trim();
    try {
      const result = await pool.query(`SELECT two_factor_secret FROM users WHERE id = $1`, [req.user.id]);
      const ciphertext = result.rows[0]?.two_factor_secret;
      if (!ciphertext) return res.status(400).json({ error: "2FA not enrolled" });
      const secret = decryptStoredSecret(ciphertext);
      if (!verifyTotpCode(secret, code)) {
        return res.status(401).json({ error: "Invalid code" });
      }
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("2FA verify error:", e?.message || "verify_failed");
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.post("/api/auth/2fa/recovery", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const code = String((req.body as any)?.code || "").trim();
    if (!code) return res.status(400).json({ error: "Code required" });
    try {
      const ok = await consumeRecoveryCode(req.user.id, code);
      if (!ok) return res.status(401).json({ error: "Invalid recovery code" });
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("2FA recovery error:", e?.message || "recovery_failed");
      res.status(500).json({ error: "Recovery failed" });
    }
  });

  // ─── Email OTP (Wave AH) — Touch ID fallback ────────────────────────
  // POST /api/auth/2fa/email/request — generate + send a fresh 6-digit code
  //   to the authenticated user's email. Rate-limited (1/60s, 5/hour).
  // POST /api/auth/2fa/email/verify  — verify the code; sets
  //   req.session.twoFactorVerified=true on success. 5 wrong tries lock the
  //   code and the user must request a new one.
  app.post("/api/auth/2fa/email/request", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      const result = await requestEmailOtp({
        userId: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
      });
      // Always 200 to avoid enumeration; client treats rateLimited specially.
      res.json({ ok: true, rateLimited: !!result.rateLimited });
    } catch (e: any) {
      console.error("Email OTP request error:", e?.message || "request_failed");
      res.status(500).json({ error: "Failed to send code" });
    }
  });

  app.post("/api/auth/2fa/email/verify", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const code = String((req.body as any)?.code || "").trim();
    if (!code) return res.status(400).json({ error: "Code required" });
    try {
      const result = await verifyEmailOtp({ userId: req.user.id, code });
      if (!result.ok) {
        // Map service reason to a stable client-facing code.
        const status =
          result.reason === "too-many-attempts" || result.reason === "expired"
            ? 410
            : 401;
        return res.status(status).json({
          error:
            result.reason === "expired"
              ? "Code expired — request a new one"
              : result.reason === "too-many-attempts"
                ? "Too many wrong tries — request a new code"
                : result.reason === "no-active-code"
                  ? "No active code — request a new one"
                  : "Invalid code",
          code: result.reason,
        });
      }
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("Email OTP verify error:", e?.message || "verify_failed");
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // ─── WebAuthn / passkeys (Section 2.1) ─────────────────────────────
  // Coexists with TOTP. A user with EITHER a verified TOTP session OR a
  // verified passkey session passes the requireAuth 2FA gate.
  app.post("/api/auth/webauthn/register/begin", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      // Self-heal: if the user already has at least one passkey credential
      // recorded, but twoFactorEnabled is still false, flip the flag and
      // redirect the SPA to the auth (verify) flow instead of forcing a
      // duplicate registration.
      const existing = await listCredentials(req.user.id);
      if (existing.length > 0) {
        if (!req.user.twoFactorEnabled) {
          await storage.updateUser(req.user.id, { twoFactorEnabled: true } as any);
        }
        (req.session as any).twoFactorVerified = true;
        return res.status(200).json({
          ok: true,
          alreadyEnrolled: true,
          message: "Passkey already enrolled — using existing credential.",
        });
      }
      const options = await buildRegistrationOptions({
        userId: req.user.id,
        userEmail: req.user.email,
        userName: `${req.user.firstName} ${req.user.lastName}`.trim(),
        req,
      });
      (req.session as any).webauthnChallenge = options.challenge;
      res.json(options);
    } catch (e: any) {
      console.error("WebAuthn register/begin error:", e?.message || "register_begin_failed");
      res.status(500).json({ error: "Failed to start passkey registration" });
    }
  });

  app.post("/api/auth/webauthn/register/finish", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const expectedChallenge = (req.session as any).webauthnChallenge as string | undefined;
    if (!expectedChallenge) return res.status(400).json({ error: "No registration in progress" });
    try {
      const result = await consumeRegistration({
        userId: req.user.id,
        expectedChallenge,
        body: (req.body as any)?.attestation || req.body,
        nickname: (req.body as any)?.nickname,
        req,
      });
      delete (req.session as any).webauthnChallenge;
      if (!result.ok) return res.status(400).json({ error: result.reason });
      // Persist the enrollment + mark this session as 2FA-verified.
      // Registering a passkey proves possession of an authenticator the same
      // way TOTP enrol does.
      await storage.updateUser(req.user.id, { twoFactorEnabled: true } as any);
      (req.session as any).twoFactorVerified = true;
      res.json({ ok: true });
    } catch (e: any) {
      console.error("WebAuthn register/finish error:", e?.message || "register_finish_failed");
      res.status(500).json({ error: "Failed to register passkey" });
    }
  });

  app.post("/api/auth/webauthn/auth/begin", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      const options = await buildAuthenticationOptions({ userId: req.user.id, req });
      if (!options) return res.status(404).json({ error: "No passkey enrolled" });
      (req.session as any).webauthnChallenge = options.challenge;
      res.json(options);
    } catch (e: any) {
      console.error("WebAuthn auth/begin error:", e?.message || "auth_begin_failed");
      res.status(500).json({ error: "Failed to start passkey authentication" });
    }
  });

  app.post("/api/auth/webauthn/auth/finish", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const expectedChallenge = (req.session as any).webauthnChallenge as string | undefined;
    if (!expectedChallenge) return res.status(400).json({ error: "No authentication in progress" });
    try {
      const result = await consumeAuthentication({
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
      console.error("WebAuthn auth/finish error:", e?.message || "auth_finish_failed");
      res.status(500).json({ error: "Failed to verify passkey" });
    }
  });

  app.get("/api/auth/webauthn/credentials", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    try {
      res.json(await listCredentials(req.user.id));
    } catch (e: any) {
      console.error("WebAuthn list error:", e?.message);
      res.status(500).json({ error: "Failed to list passkeys" });
    }
  });

  app.delete("/api/auth/webauthn/credentials/:id", requireAuthMw, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const id = req.params.id;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: "Invalid id" });
    try {
      const ok = await deleteCredential(req.user.id, id);
      if (!ok) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (e: any) {
      console.error("WebAuthn delete error:", e?.message);
      res.status(500).json({ error: "Failed to delete passkey" });
    }
  });

  // Auth: Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth: Log out OTHER device sessions (Wave AF3) — keeps the current session
  // intact so the founder doesn't bounce themselves out. Targets connect-pg-
  // simple's `sessions` table, scoping by sess->>'userId' = current user.
  // P0 (audit 2026-05-12): requireAuth middleware added — previously the
  // route only inline-checked req.session.userId and skipped the 2FA gate.
  app.post("/api/auth/sessions/logout-others", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const currentSid = req.sessionID;
    if (!currentSid) {
      return res.status(400).json({ error: "No current session id" });
    }
    try {
      const result = await pool.query(
        `DELETE FROM sessions
          WHERE sid != $1
            AND sess->>'userId' = $2`,
        [currentSid, userId],
      );
      res.json({ ok: true, destroyed: result.rowCount ?? 0 });
    } catch (e: any) {
      console.error("[/api/auth/sessions/logout-others] error:", e?.message);
      res.status(500).json({ error: "Failed to log out other sessions" });
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

      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      console.error("Error fetching user:", error?.message, error?.stack);
      res.status(500).json({
        error: "Failed to fetch user",
        detail: error?.message,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /api/me/events — per-user SSE channel
  // ---------------------------------------------------------------------------
  // Phase D Wave 1 (Conduit). Every authenticated user can subscribe to THEIR
  // own role-change events. Subscription is bound to `req.user.id` server-side
  // — `onRoleChanged` filters by userId internally so this connection can
  // never receive another user's events even if both are listening on the
  // same process. The client-supplied user id, if any, is ignored.
  //
  // Mirrors the SSE pattern in `server/routes/founders-leads.ts:664-715`:
  // text/event-stream headers, 25s keepalive comments, and a triple-cleanup
  // (`req.on("close")` / `req.on("aborted")` / `res.on("close")`).
  app.get("/api/me/events", requireAuthMw, async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    let closed = false;
    const write = (data: any) => {
      if (closed) return;
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch {
        closed = true;
      }
    };

    write({ type: "ready", at: new Date().toISOString() });

    // SECURITY: bind the subscription to `req.user.id`. Never trust any
    // client-supplied user id — `onRoleChanged` filters server-side so a
    // stranger's event can never reach this stream.
    const userId = req.user!.id;
    const unsubscribe = onRoleChanged(userId, (ev) => write(ev));

    const keepalive = setInterval(() => {
      if (closed) return;
      try {
        res.write(": keepalive\n\n");
      } catch {
        closed = true;
      }
    }, 25000);

    const cleanup = () => {
      if (closed) return;
      closed = true;
      clearInterval(keepalive);
      try {
        unsubscribe();
      } catch {
        /* noop */
      }
      try {
        res.end();
      } catch {
        /* noop */
      }
    };

    req.on("close", cleanup);
    req.on("aborted", cleanup);
    res.on("close", cleanup);
  });
  
  // Quote request submission
  app.post("/api/quote-requests", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      
      // Prepare data with null converted to undefined for optional fields
      const dataWithOptionalFields = {
        ...validatedData,
        addressLine2: validatedData.addressLine2 ?? undefined,
      };
      
      // Send email notification
      try {
        console.log("Attempting to send quote notification email...");
        await sendQuoteNotification(dataWithOptionalFields);
        console.log("Quote notification email sent successfully");
      } catch (emailError: any) {
        console.error("Error sending quote notification email:", emailError?.message || emailError);
      }
      
      // Add lead to Google Sheet
      try {
        await addLeadToSheet(dataWithOptionalFields);
      } catch (sheetError) {
        console.error("Error adding lead to Google Sheet:", sheetError);
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
  app.get("/api/quote-requests", async (req, res) => {
    try {
      const requests = await storage.getQuoteRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      res.status(500).json({ error: "Failed to fetch quote requests" });
    }
  });

  // Contact message submission
  app.post("/api/contact-messages", async (req, res) => {
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
  app.get("/api/contact-messages", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
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
      const { firstName, lastName, phone } = req.body;
      const updatedUser = await storage.updateUser(req.session.userId!, {
        firstName,
        lastName,
        phone,
      });
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

      // HIGH (audit 2026-05-12): password changes had no audit trail. Without
      // this, an account-takeover via stolen session token leaves no forensic
      // record of who/when changed the password.
      try {
        await logFounderAction({
          actorUserId: req.session.userId!,
          action: "password_changed",
          entityType: "user",
          entityId: req.session.userId!,
          payload: {
            ip: req.ip,
            userAgent: req.get("user-agent") || null,
            method: "self_service",
          },
        });
      } catch (auditErr) {
        // Audit failure should not block the user; the storage.updateUser
        // already committed. Just log loudly.
        console.error("[Password change] audit log failed:", auditErr);
      }

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

  // Google Calendar: Check connection status
  app.get("/api/calendar/status", async (req, res) => {
    try {
      const connected = await checkCalendarConnection();
      const email = connected ? await getConnectedEmail() : null;
      res.json({ connected, email });
    } catch (error) {
      res.json({ connected: false, email: null });
    }
  });

  // Google Calendar: Get events
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const { start, end, days } = req.query;
      
      let events;
      if (start && end) {
        events = await getCalendarEvents(new Date(start as string), new Date(end as string));
      } else if (days) {
        events = await getUpcomingEvents(parseInt(days as string));
      } else {
        events = await getCalendarEvents();
      }
      
      res.json({ events });
    } catch (error: any) {
      console.error("Error fetching calendar events:", error);
      if (error.message?.includes('not connected')) {
        res.status(401).json({ error: "Calendar not connected", needsConnection: true });
      } else {
        res.status(500).json({ error: "Failed to fetch calendar events" });
      }
    }
  });

  // Google Calendar: Get today's events
  app.get("/api/calendar/today", async (req, res) => {
    try {
      const events = await getTodaysEvents();
      res.json({ events });
    } catch (error: any) {
      if (error.message?.includes('not connected')) {
        res.status(401).json({ error: "Calendar not connected", needsConnection: true });
      } else {
        console.error("Error fetching today's events:", error);
        res.status(500).json({ error: "Failed to fetch today's events" });
      }
    }
  });

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

  // ============================================
  // INSTITUTIONAL API ENDPOINTS
  // ============================================

  // Institutional Contact Form Submission
  app.post("/api/institutional/contact", async (req, res) => {
    try {
      const validatedData = insertInstitutionalContactSchema.parse(req.body);
      const contact = await storage.createInstitutionalContact(validatedData);

      // Send email notification
      try {
        await sendContactNotification({
          firstName: validatedData.name.split(' ')[0] || validatedData.name,
          lastName: validatedData.name.split(' ').slice(1).join(' ') || '',
          email: validatedData.email,
          phone: validatedData.phone || 'Not provided',
          message: `[INSTITUTIONAL INQUIRY - ${validatedData.inquiryType}]\n\nOrganization: ${validatedData.organization || 'Not provided'}\nTitle: ${validatedData.title || 'Not provided'}\n\n${validatedData.message}`,
        });
      } catch (emailError: any) {
        console.error("Error sending institutional contact email:", emailError?.message);
      }

      res.status(201).json({ success: true, id: contact.id });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating institutional contact:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Institutional Meeting Request
  app.post("/api/institutional/meetings", async (req, res) => {
    try {
      const validatedData = insertInstitutionalMeetingSchema.parse(req.body);
      const meeting = await storage.createInstitutionalMeeting(validatedData);

      // Send email notification
      try {
        await sendMeetingNotification({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || 'Not provided',
          date: validatedData.date,
          time: validatedData.time,
          meetingType: validatedData.meetingType,
          topic: validatedData.topic || 'General Discussion',
          message: `[INSTITUTIONAL MEETING REQUEST]\n\nOrganization: ${validatedData.organization || 'Not provided'}\nTitle: ${validatedData.title || 'Not provided'}\n\n${validatedData.message || 'No additional message'}`,
        });
      } catch (emailError: any) {
        console.error("Error sending institutional meeting email:", emailError?.message);
      }

      res.status(201).json({ success: true, id: meeting.id });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating institutional meeting:", error);
      res.status(500).json({ error: "Failed to submit meeting request" });
    }
  });

  // Newsletter Subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);

      // Check if already subscribed
      const existing = await storage.getNewsletterByEmail(validatedData.email);
      if (existing) {
        if (existing.status === 'active') {
          return res.status(200).json({ success: true, message: "Already subscribed" });
        }
        // Reactivate subscription
        await storage.updateNewsletterStatus(existing.id, 'active');
        return res.status(200).json({ success: true, message: "Subscription reactivated" });
      }

      const subscription = await storage.createNewsletterSubscription(validatedData);

      // Send notification email to insights@goldcoastfnl.com
      try {
        await sendNewsletterNotification({
          email: validatedData.email,
          name: validatedData.name ?? undefined,
          subscriptionType: validatedData.subscriptionType || 'general',
        });
      } catch (emailError) {
        console.error("Error sending newsletter notification:", emailError);
      }

      // Send welcome email to subscriber
      try {
        await sendNewsletterWelcome({
          email: validatedData.email,
          name: validatedData.name ?? undefined,
          subscriptionType: validatedData.subscriptionType || 'general',
        });
      } catch (emailError) {
        console.error("Error sending newsletter welcome:", emailError);
      }

      res.status(201).json({ success: true, id: subscription.id });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating newsletter subscription:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  // Newsletter Unsubscribe
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const existing = await storage.getNewsletterByEmail(email);
      if (!existing) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      await storage.updateNewsletterStatus(existing.id, 'unsubscribed');
      res.json({ success: true, message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // Partnership Quiz Submission
  app.post("/api/institutional/partnership-quiz", async (req, res) => {
    try {
      const validatedData = insertPartnershipQuizSchema.parse(req.body);

      // Calculate partnership score
      let score = 0;
      if (validatedData.companyType === 'insurance_agency') score += 30;
      else if (validatedData.companyType === 'financial_services') score += 25;
      else if (validatedData.companyType === 'technology') score += 20;
      else score += 10;

      if (validatedData.annualRevenue === '10m_plus') score += 30;
      else if (validatedData.annualRevenue === '5m_10m') score += 25;
      else if (validatedData.annualRevenue === '1m_5m') score += 20;
      else score += 10;

      if (validatedData.partnershipInterest === 'acquisition') score += 20;
      else if (validatedData.partnershipInterest === 'strategic_partnership') score += 15;
      else score += 10;

      if (validatedData.timeline === 'immediate') score += 20;
      else if (validatedData.timeline === '3_6_months') score += 15;
      else score += 10;

      const submission = await storage.createPartnershipQuiz({ ...validatedData, score: score.toString() });

      // Send notification to partnership@goldcoastfnl.com
      const qualification = score >= 70 ? 'highly_qualified' : score >= 50 ? 'qualified' : 'potential';
      try {
        await sendPartnershipQuizNotification({
          companyName: validatedData.companyName,
          contactName: validatedData.contactName,
          email: validatedData.email,
          phone: validatedData.phone || undefined,
          companyType: validatedData.companyType,
          annualRevenue: validatedData.annualRevenue || undefined,
          employeeCount: validatedData.employeeCount || undefined,
          partnershipInterest: validatedData.partnershipInterest,
          timeline: validatedData.timeline || undefined,
          additionalInfo: validatedData.additionalInfo || undefined,
          score,
          qualification,
        });
      } catch (emailError: any) {
        console.error("Error sending partnership quiz notification:", emailError?.message);
      }

      res.status(201).json({
        success: true,
        id: submission.id,
        score,
        qualification: score >= 70 ? 'highly_qualified' : score >= 50 ? 'qualified' : 'potential'
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating partnership quiz submission:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // ============================================
  // HCMS PLATFORM ROUTES
  // ============================================

  // Attach user to request for RBAC middleware (non-blocking — populates req.user if session exists)
  app.use("/api/hcms", attachUser);

  // H-18 (audit 2026-05-12): GDPR/CCPA data-subject rights.
  // Mounted under /api/account; requires auth (user authorizes to themselves).
  app.use("/api/account", attachUser);
  app.use("/api/account", accountRouter);

  app.use("/api/hcms/agents", hcmsAgentsRouter);
  app.use("/api/hcms/contracting", hcmsContractingRouter);
  app.use("/api/hcms/signing", hcmsSigningRouter);
  app.use("/api/hcms/licensing", hcmsLicensingRouter);
  app.use("/api/hcms/carriers", hcmsCarriersRouter);
  app.use("/api/hcms/documents", hcmsDocumentsRouter);
  app.use("/api/hcms/hierarchy", hcmsHierarchyRouter);
  app.use("/api/hcms/compensation", hcmsCompensationRouter);
  app.use("/api/hcms/hierarchy-requests", hcmsHierarchyRequestsRouter);

  // ============================================
  // OPS HUB ROUTES (Production, Deals, CRM)
  // ============================================

  app.use("/api/ops", attachUser);
  app.use("/api/ops/production", opsProductionRouter);
  app.use("/api/ops/deals", opsDealsRouter);
  app.use("/api/ops/crm", opsCrmRouter);
  app.use("/api/ops/commissions", opsCommissionsRouter);
  app.use("/api/ops/compliance", opsComplianceRouter);
  app.use("/api/ops/analytics", opsAnalyticsRouter);
  app.use("/api/ops/marketing", opsMarketingRouter);
  app.use("/api/ops/investors", opsInvestorsRouter);
  app.use("/api/ops/settings", opsSettingsRouter);

  // ============================================
  // FINANCE LOUNGE ROUTES
  // ============================================

  app.use("/api/finance", attachUser);
  app.use("/api/finance/dashboard", financeDashboardRouter);
  app.use("/api/finance/revenue", financeRevenueRouter);
  app.use("/api/finance/overrides", financeOverridesRouter);
  app.use("/api/finance/transactions", financeTransactionsRouter);
  app.use("/api/finance/cashflow", financeCashflowRouter);
  app.use("/api/finance/chargebacks", financeChargebacksRouter);
  app.use("/api/finance/statements", financeStatementsRouter);
  app.use("/api/finance/reconciliation", financeReconciliationRouter);
  app.use("/api/finance/reports", financeReportsRouter);

  // ============================================
  // FOUNDERS LOUNGE ROUTES
  // ============================================

  app.use("/api/founders", attachUser);
  // Mount specific sub-paths before the generic aggregator so Express resolves them first.
  app.use("/api/founders/profit", foundersProfitRouter);
  app.use("/api/founders/plaid", foundersPlaidRouter);

  // Section 3.3 — audit-chain verifier endpoint. Founders can spot-check
  // the integrity of the audit log. Cron job will hit this on a schedule.
  app.get(
    "/api/founders/audit-chain/verify",
    requireAuthMw,
    requireRole(...FOUNDERS_ONLY),
    async (_req, res) => {
      try {
        const { verifyAuditChain } = await import("./services/auditChainVerifier");
        const result = await verifyAuditChain();
        res.json(result);
      } catch (e: any) {
        console.error("Audit chain verify error:", e?.message || "verify_failed");
        res.status(500).json({ error: "verify_failed" });
      }
    },
  );

  // SOC 2 evidence bundle — read-only snapshot of the live control state.
  // Auditor / Drata / Vanta consumes this as a deterministic JSON document.
  app.get(
    "/api/founders/soc2/evidence",
    requireAuthMw,
    requireRole(...FOUNDERS_ONLY),
    async (_req, res) => {
      try {
        const { buildEvidenceBundle } = await import("./services/soc2Evidence");
        const bundle = await buildEvidenceBundle();
        res.json(bundle);
      } catch (e: any) {
        console.error("SOC2 evidence error:", e?.message || "evidence_failed");
        res.status(500).json({ error: "evidence_failed" });
      }
    },
  );

  // Quarterly access review — see server/services/accessReview.ts.
  app.get(
    "/api/founders/soc2/access-review",
    requireAuthMw,
    requireRole(...FOUNDERS_ONLY),
    async (req, res) => {
      try {
        const days = Math.min(365, Math.max(1, Number(req.query.days) || 90));
        const { buildAccessReview } = await import("./services/accessReview");
        const report = await buildAccessReview({ daysBack: days });
        res.json(report);
      } catch (e: any) {
        console.error("Access review error:", e?.message || "access_review_failed");
        res.status(500).json({ error: "access_review_failed" });
      }
    },
  );
  app.use("/api/founders/viewas", foundersViewasRouter);
  // Heritage-port additions: book of business, team performance, lead
  // distribution, lead revenue, and key metrics. Mounted BEFORE the generic
  // /api/founders aggregator so specific paths win.
  app.use("/api/founders/book", foundersBookRouter);
  app.use("/api/founders/teams", foundersTeamsRouter);
  app.use("/api/founders/leads", foundersLeadsRouter);
  // Members router — backs the Founders Lounge Access page. Mounted at
  // /api/members (not /api/founders/members) to match heritage-app's URL
  // semantics so cross-deployment audits stay consistent.
  app.use("/api/members", attachUser, foundersMembersRouter);
  // Agency Management — sub-agencies, carrier contracts, entity formation.
  // The router uses NESTED paths shaped /agencies/... and /carriers/..., so
  // mounting at /api/founders gives final URLs like
  // /api/founders/agencies/kpis and /api/founders/carriers/:id/compliance.
  // Mounted BEFORE the generic foundersRouter aggregator below so the
  // more-specific routes win.
  app.use("/api/founders", foundersAgenciesRouter);
  // Lead Marketplace — revenue dashboards (Wave 2 / Forge).
  app.use("/api/founders/lead-revenue", leadRevenueFoundersRouter);
  // Oversight stubs for Founders Revenue / Growth pages. Hierarchy uses the
  // existing /api/hcms/hierarchy/* endpoints directly.
  app.use("/api/founders", foundersOversightRouter);
  // Dashboard config mutations (PUT /goals/:metricKey, POST /cash-balance).
  // Mounted BEFORE the generic foundersRouter aggregator so the more specific
  // /api/founders/dashboard/* paths win over any catch-alls below.
  app.use("/api/founders/dashboard", foundersDashboardConfigRouter);
  app.use("/api/founders", foundersRouter);

  // ============================================
  // lifeOS ROUTES — system update + release notes
  // Cross-app, shared DB. Both Gold Coast and Heritage hit the same surface.
  // ============================================
  app.use("/api/lifeos", attachUser);
  app.use("/api/lifeos", lifeosLimiter);
  app.use("/api/lifeos", lifeosRouter);

  // Sentinel H3: start the view-as sweeper (auto-ends sessions older than 4h).
  startViewAsSweeper();
  // lifeOS reminder sweeper — every hour, drop a softer bell row for any
  // user who dismissed an update more than 24h ago but hasn't installed it.
  startLifeOSReminderSweeper();

  // Apply route — attachUser needed so /invite can use requireAuth
  app.use("/api/apply", attachUser);
  app.use("/api/apply", applyRouter);

  // Agent portal — authenticated agents
  app.use("/api/agent-portal", attachUser);
  app.use("/api/agent-portal/notifications", agentNotificationsRouter);
  app.use("/api/agent-portal", agentPortalRouter);

  // Book of Business — authenticated agents manage their own client roster.
  // attachUser is already mounted globally on /api (line ~237) so req.user is
  // populated; the router applies requireAuth per-route.
  app.use("/api/book-of-business", bookOfBusinessRouter);

  // License management
  app.use("/api/licenses", attachUser);
  app.use("/api/licenses", agentLicensesRouter);

  // Lead Marketplace — agent-facing catalog + checkout (Wave 2 / Forge).
  // attachUser is required so requireAuth has req.user; vendor-cost columns
  // are stripped at the SELECT layer inside the router itself.
  app.use("/api/leads", attachUser);
  app.use("/api/leads", leadRevenueAgentRouter);

  return httpServer;
}

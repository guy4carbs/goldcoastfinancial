import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { ensureLifeOSReleaseSeed } from "./routes/lifeos";
import { LIFEOS_VERSION } from "../shared/lifeos";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { initializeDatabase } from "./db";
import { setupWebSocket } from "./websocket";
import { setupAvatarWebSocket, initializeAvatarNetwork } from "./websocket-avatars";
import { avatarRegistry } from "./services/avatarRegistry";

// Security middleware
import { generalApiLimiter } from "./middleware/rateLimiter";

// Error tracking
import { initializeSentry, sentryUserMiddleware, sentryErrorMiddleware, close as closeSentry } from "./services/errorTracking";

// Agent System imports
import { bootstrapAgentSystem, AgentRegistry } from "./agents";
import { createAgentRoutes } from "./agents/api-routes";
import { startAllBridges, stopAllBridges } from "./agents/integrations";

// Real-time WebSocket Server (GCF channels with RBAC)
import { GCFWebSocketServer, bridgeEventBus } from "./websocket/index";

// Automation Engine
import { automationEngine } from "./services/automation-engine";

// Workflow Engine (Visual Workflow Builder execution)
import { workflowEngine } from "./services/workflow-engine";

// Background job queue (BullMQ) + drip sequence workers
import { shutdown as shutdownJobQueue } from "./services/jobQueue";
import { registerSequenceWorkers, scheduleDispatcher } from "./services/sequenceQueue";

// Global agent registry for graceful shutdown
let agentRegistry: AgentRegistry | null = null;
let gcfWebSocketServer: GCFWebSocketServer | null = null;
let eventBridgeCleanup: (() => void) | null = null;

const app = express();
const httpServer = createServer(app);

// ============================================================================
// PROCESS-LEVEL CRASH HANDLERS (1.0.64+)
// ============================================================================
// If anything ever throws synchronously off the event loop or rejects an
// async without a catch, Node's default behavior is to print a stack and
// exit. Railway restarts the container, but the in-flight request gets cut
// without a response → Cloudflare returns its own HTML 502 page → user sees
// `code=GATEWAY_HTML_502_FROM_CLOUDFLARE`. These handlers log loudly and
// keep the process alive so any in-flight Express response can complete.
process.on("uncaughtException", (err: Error) => {
  console.error("[FATAL] uncaughtException — process stays alive:", err.stack || err);
});
process.on("unhandledRejection", (reason: unknown) => {
  console.error("[FATAL] unhandledRejection — process stays alive:", reason);
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

const isProduction = process.env.NODE_ENV === "production";

// Initialize Sentry for error tracking (before other middleware)
initializeSentry(app);

// ===========================================================================
// FIRST-MIDDLEWARE DIAGNOSTIC LOGGER (1.0.63+)
// ===========================================================================
//
// Logs the entry of every Telnyx-related request BEFORE any other middleware
// runs (before CORS, helmet, rate limiter, body parser, session, etc.). If
// Railway logs show `[REQ]` lines for these paths, the request DID reach our
// origin — meaning the 502 we're seeing in the browser is happening because
// the response can't get back to Cloudflare (Node crash mid-response, etc.).
// If Railway logs DON'T show `[REQ]` lines, the request never reached us —
// CF or Railway is dropping it before our app sees it.
//
// Scoped to specific diagnostic paths so we don't fill logs with noise.
app.use((req, _res, next) => {
  const p = req.path;
  if (
    p === "/api/_ping" ||
    p === "/api/realtime/healthcheck" ||
    p === "/api/wrtc-healthcheck" ||
    p === "/api/dialer-ping" ||
    p === "/api/calls/token" ||
    p === "/api/voice/token" ||
    p === "/api/realtime/wrtc-auth" ||
    p === "/api/realtime/auth-only-test"
  ) {
    console.log(
      `[REQ] ${req.method} ${p} ip=${req.ip ?? "?"} cf-ray=${
        req.headers["cf-ray"] ?? "none"
      } ua="${(req.headers["user-agent"] ?? "").toString().slice(0, 50)}"`,
    );
  }
  next();
});

// CORS configuration
const corsOptions = {
  origin: isProduction
    ? ['https://heritagels.org', 'https://www.heritagels.org']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};
app.use(cors(corsOptions));

// Security headers with Helmet
//
// CSP allow-list reference (Wave 2 of the agent-lounge debug sweep):
//   - Stripe.js + Elements (lead marketplace payment flow):
//       script-src   js.stripe.com
//       frame-src    js.stripe.com, hooks.stripe.com (3D Secure)
//       connect-src  *.stripe.com (api.stripe.com, m.stripe.com, etc.)
//   - Cloudflare Insights (heritagels.org is CF-proxied — beacon auto-injected):
//       script-src   static.cloudflareinsights.com
//       connect-src  cloudflareinsights.com
//   - Google Tag Manager / Analytics (allow-listed defensively even if not
//     currently wired up — original Wave 2 plan, may be live via CF Apps):
//       script-src   www.googletagmanager.com, apis.google.com
//       connect-src  www.google-analytics.com, *.google-analytics.com
//   - Firebase Auth (client SDK at lib/firebase.ts — was blocked by the
//     prior `connect-src 'self'` and only worked because session auth at
//     /api/auth/login is primary; this closes the latent Firebase fallback
//     hole):
//       connect-src  identitytoolkit.googleapis.com,
//                    securetoken.googleapis.com,
//                    www.googleapis.com
//       frame-src    *.firebaseapp.com (OAuth handler iframe)
//   - WebSocket (wss: wildcard already covers heritagels.org/ws/gcf etc.;
//     Wave 3 covers the upgrade-handshake bug separately, not a CSP issue).
//   - imgSrc stays `https:` wildcard so Stripe + CF + Firebase + any
//     carrier-logo CDN keeps working.
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://static.cloudflareinsights.com",
        "https://www.googletagmanager.com",
        "https://apis.google.com",
      ],
      connectSrc: [
        "'self'",
        "wss:",
        "https://api.openai.com",
        "wss://*.telnyx.com",
        "https://*.telnyx.com",
        "https://api.telnyx.com",
        "https://*.stripe.com",
        "https://cloudflareinsights.com",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://www.googleapis.com",
      ],
      mediaSrc: ["'self'", "https://*.telnyx.com", "https://firebasestorage.googleapis.com"],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://hooks.stripe.com",
        "https://*.firebaseapp.com",
      ],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  } : false, // Disable CSP in development for easier debugging
  crossOriginEmbedderPolicy: false, // Required for some external resources
  hsts: isProduction ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false,
}));

// General API rate limiting
app.use('/api', generalApiLimiter);

// =============================================================================
// REQUEST PARSING
// =============================================================================

// M-15 (audit 2026-05-12): explicit body limit. Express default is 100KB
// which is too small for some legitimate uploads (CRM imports etc.) but
// 50MB on raw JSON is a compression-bomb risk. 10MB is the sweet spot —
// multipart/file uploads go through multer with their own per-route caps.
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// =============================================================================
// APP-LEVEL DIAGNOSTIC + REQUEST TIMEOUT
// =============================================================================
//
// Trivial liveness ping. No auth, no DB, no session. Always returns 200.
// If a user is seeing CF/Railway 502s, hitting this URL tells us whether the
// problem is platform-level (502 from /api/_ping too) or application-level
// (200 here, 502 only on real routes). Mounted at the very top of the
// middleware chain so even a broken session middleware can't shadow it.
// Diagnostic factory — mounted at multiple paths to triangulate which path
// patterns reach our origin. If /api/_ping returns 200 but
// /api/realtime/healthcheck returns 502, the /api/realtime/* pattern is
// broken at Railway's routing layer. If all three healthchecks return 200
// but /api/realtime/wrtc-auth still 502s, the issue is in our middleware
// chain (session, auth, attachUser, handler).
const _diagHandler = (label: string) => (_req: any, res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, private, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    lifeOSVersion: LIFEOS_VERSION,
    label,
  });
};
app.get("/api/_ping", _diagHandler("ping"));
app.get("/api/realtime/healthcheck", _diagHandler("realtime-healthcheck"));
app.get("/api/wrtc-healthcheck", _diagHandler("wrtc-healthcheck"));
app.get("/api/dialer-ping", _diagHandler("dialer-ping"));

// App-level request-timeout safety net.
//
// Earlier waves added a wall-clock setTimeout INSIDE specific route handlers
// (e.g. /api/calls/token), and 1.0.61 added a route-level withTimeout
// middleware. Both still ran AFTER the session middleware (added inside
// registerRoutes via setupSession). If the session middleware or any
// upstream middleware hangs (PG pool exhaustion, network blip, etc.), our
// route-level timer never arms — Cloudflare/Railway returns an HTML 502
// and the client falls through to `code=UNKNOWN`.
//
// This middleware sits BEFORE registerRoutes runs, so the timer arms on
// the bare Express request, before any session/auth/router-specific logic.
// 27s is below typical gateway windows (CF ~100s, Railway ~30s on some
// paths) so we always beat the gateway to a structured JSON response.
const APP_REQUEST_TIMEOUT_MS = 27_000;
app.use("/api", (req, res, next) => {
  const timer = setTimeout(() => {
    if (res.headersSent) return;
    console.warn(
      `[AppTimeout] ${req.method} ${req.path} exceeded ${APP_REQUEST_TIMEOUT_MS}ms — responding with REQUEST_TIMEOUT`,
    );
    res.status(504).json({
      error: "Request timed out before reaching the handler",
      code: "REQUEST_TIMEOUT",
      retryable: true,
      path: req.path,
    });
  }, APP_REQUEST_TIMEOUT_MS);
  const clear = () => clearTimeout(timer);
  res.on("finish", clear);
  res.on("close", clear);
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Sentry user context middleware (attaches user to error reports)
app.use(sentryUserMiddleware);

(async () => {
  // Initialize database tables first
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  await registerRoutes(httpServer, app);
  
  // Setup WebSocket for real-time chat
  setupWebSocket(httpServer);

  // Setup WebSocket for Avatar Council
  setupAvatarWebSocket(httpServer);

  // Setup GCF WebSocket Server (real-time events with RBAC)
  gcfWebSocketServer = new GCFWebSocketServer(httpServer, '/ws/gcf');
  app.set('wsServer', gcfWebSocketServer);
  console.log('[SERVER] GCF WebSocket server initialized');

  // Initialize demo user for client portal
  try {
    await storage.initializeDemoUser();
  } catch (error) {
    console.error("Failed to initialize demo user:", error);
  }

  // Initialize CRM test data (admin user + sample leads)
  try {
    await storage.initializeCRMTestData();
  } catch (error) {
    console.error("Failed to initialize CRM test data:", error);
  }

  // Seed initial avatars for Avatar Council
  try {
    await avatarRegistry.seedInitialAvatars();
    // Initialize avatar network after seeding
    await initializeAvatarNetwork();
  } catch (error) {
    console.error("Failed to seed avatars:", error);
  }

  // Initialize the 37-Agent System
  if (process.env.AGENT_SYSTEM_ENABLED !== 'false') {
    try {
      console.log('\n[SERVER] Initializing Agent System...');

      // 1. Bootstrap all 37 agents
      agentRegistry = await bootstrapAgentSystem();

      // 2. Mount agent API routes
      app.use('/api', createAgentRoutes(agentRegistry));

      // 3. Start integration bridges (DB, Gmail, Calendar)
      await startAllBridges();

      // 4. Connect EventBus to WebSocket for real-time updates
      if (gcfWebSocketServer) {
        eventBridgeCleanup = bridgeEventBus(gcfWebSocketServer);
        console.log('[SERVER] EventBus connected to WebSocket channels');
      }

      console.log('[SERVER] ✅ Agent System fully initialized\n');
    } catch (error) {
      console.error('[SERVER] ❌ Failed to initialize Agent System:', error);
      // Continue running - agent system is optional
    }
  } else {
    console.log('[SERVER] Agent System disabled via AGENT_SYSTEM_ENABLED=false');
  }

  // Initialize Automation Engine (listens to EventBus for triggers)
  try {
    await automationEngine.initialize();
    console.log('[SERVER] ✅ Automation Engine initialized');
  } catch (error) {
    console.error('[SERVER] ❌ Failed to initialize Automation Engine:', error);
    // Continue running - automation engine is optional
  }

  // Initialize Workflow Engine (Visual Workflow Builder execution)
  try {
    await workflowEngine.initialize();
    console.log('[SERVER] ✅ Workflow Engine initialized');
  } catch (error) {
    console.error('[SERVER] ❌ Failed to initialize Workflow Engine:', error);
    // Continue running - workflow engine is optional
  }

  // Initialize BullMQ sequence workers + repeating dispatcher (no-op without REDIS_URL)
  try {
    registerSequenceWorkers();
    await scheduleDispatcher();
    console.log('[SERVER] ✅ Sequence workers registered');
  } catch (error) {
    console.error('[SERVER] ❌ Failed to initialize sequence workers:', error);
    // Continue running - drip sequences are optional
  }

  // Sentry error middleware (must be before custom error handler)
  app.use(sentryErrorMiddleware);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // P0 (audit 2026-05-12): previously `throw err` here re-raised the error
    // as an uncaughtException, crashing the process on every handled error.
    // Sentry middleware above already captured it; just respond and return.
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 4500 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Start document scheduler (hourly timezone-aware checks)
  try {
    import("./services/documentScheduler").then(({ startDocumentScheduler }) => {
      startDocumentScheduler();
    }).catch(err => console.error("[SERVER] Document scheduler failed to start:", err));
  } catch (err) {
    console.error("[SERVER] Document scheduler init failed:", err);
  }

  // Idempotent boot-time seed: guarantee a `lifeos_releases` row exists for
  // the current LIFEOS_VERSION so the update + whats-new popups always have
  // notes to render. No-op if Gold Coast has already inserted the row for
  // this version (shared Neon DB). Wrapped in try/catch so a seed failure
  // never blocks the listen.
  try {
    await ensureLifeOSReleaseSeed();
  } catch (e: any) {
    console.error("[boot] ensureLifeOSReleaseSeed failed:", e?.message);
  }

  const port = parseInt(process.env.PORT || "4500", 10);
  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
    log(`[boot] lifeOS bundle version ${LIFEOS_VERSION} active`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);

    // Disconnect EventBus bridge
    if (eventBridgeCleanup) {
      eventBridgeCleanup();
    }

    // Close WebSocket server
    if (gcfWebSocketServer) {
      gcfWebSocketServer.close();
    }

    // Stop agent system
    if (agentRegistry) {
      try {
        await agentRegistry.stopAll();
        await stopAllBridges();
      } catch (error) {
        console.error('[SERVER] Error stopping agents:', error);
      }
    }

    // Stop automation engine
    try {
      automationEngine.shutdown();
    } catch (error) {
      console.error('[SERVER] Error stopping automation engine:', error);
    }

    // Stop workflow engine
    try {
      workflowEngine.shutdown();
    } catch (error) {
      console.error('[SERVER] Error stopping workflow engine:', error);
    }

    // Stop BullMQ workers + queues (drains in-flight sequence sends)
    try {
      await shutdownJobQueue();
    } catch (error) {
      console.error('[SERVER] Error stopping job queue:', error);
    }

    // Close Sentry (flush pending events)
    await closeSentry(2000);

    httpServer.close(() => {
      console.log('[SERVER] HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.log('[SERVER] Forcing exit...');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
})();

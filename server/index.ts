import "dotenv/config";
import { installLogScrubber } from "./middleware/logScrubber";
import { loadCredentialsIntoEnv } from "./services/credentialLoader";

// Install BEFORE the rest of the server wires up. Wraps console.log/error/warn
// so any sensitive token (access_token, password, ssn, etc.) accidentally
// passed to a logger gets redacted before stdout/stderr.
installLogScrubber();

// In production, pull secrets from AWS Secrets Manager into process.env so
// the rest of the boot sequence can read them as if they came from .env.
// Failure in production aborts the boot (fail-closed); local dev no-ops.
// Loader runs inside the existing async-IIFE main flow below — see the
// `(async () => { ... })()` block.

// Survive transient Neon DNS / read-timeout blips. Without these handlers,
// an idle pg connection that times out (ETIMEDOUT) bubbles up as an
// unhandledRejection and crashes the entire dev server.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { initializeDatabase } from "./db";
import { setupWebSocket } from "./websocket";
import { stripeWebhookHandler } from "./routes/stripe-webhook";
import { ensureLifeOSReleaseSeed } from "./routes/lifeos";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ─── Stripe webhook (raw body) ──────────────────────────────────────────────
// MUST be mounted BEFORE the global express.json() parser. Stripe signs the
// exact byte stream it sent us; any JSON re-serialization corrupts the
// signature. This route uses express.raw() so req.body is a Buffer, which is
// what stripe.webhooks.constructEvent expects.
//
// CSRF is bypassed by the path-prefix exemption in middleware/csrf.ts (see
// EXEMPT_PATH_PREFIXES). The webhook authenticates via Stripe-Signature, not
// session cookie + CSRF token.
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json", limit: "1mb" }),
  stripeWebhookHandler,
);

// HIGH (audit 2026-05-12): JSON limit was 50MB which is a compression-bomb
// risk (10MB gzip → 500MB decompressed → OOM). 10MB is plenty for the
// largest legitimate API JSON payloads in this app; file uploads go through
// multer (multipart) which has its own per-route limits.
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Paths whose response bodies are NEVER logged — they return short-lived URLs,
// raw S3 keys, or otherwise leak bearer-equivalent material.
// - /documents/:id/(url|stream)        — BoB + founders-book proxy endpoints
// - /document/:type, /signed/:type     — agent-portal + hcms-agents URL-issuance
//                                         (response body includes the raw S3 key)
// Sentinel veto 2026-04-30, extended after re-audit 2026-05-01.
const SENSITIVE_BODY_PATHS =
  /\/(documents\/[^/]+\/(url|stream)|document\/[^/]+|signed\/[^/]+)$/;
const MAX_BODY_LOG_CHARS = 200;

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
      if (capturedJsonResponse && !SENSITIVE_BODY_PATHS.test(path)) {
        const serialized = JSON.stringify(capturedJsonResponse);
        logLine +=
          serialized.length > MAX_BODY_LOG_CHARS
            ? ` :: ${serialized.slice(0, MAX_BODY_LOG_CHARS)}…[truncated ${serialized.length - MAX_BODY_LOG_CHARS} chars]`
            : ` :: ${serialized}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Pull production credentials from Secrets Manager BEFORE any module that
  // reads process.env at boot (db pool, KMS region, Plaid client, etc.).
  await loadCredentialsIntoEnv();

  // Initialize database tables first
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  // One-shot backfill: normalize every users.email to lowercase so the new
  // case-insensitive lookup in storage.getUserByEmail can match rows that
  // were inserted before normalization landed (e.g. invites that stored
  // "Gaetanocarbs@iCloud.com" verbatim). Idempotent — the WHERE filters out
  // already-lowercased rows so subsequent boots are zero-row no-ops.
  try {
    const { pool: dbPool } = await import("./db");
    const collision = await dbPool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n
         FROM (
           SELECT LOWER(email) AS le, COUNT(*) AS c
             FROM users
            GROUP BY LOWER(email)
           HAVING COUNT(*) > 1
         ) g`,
    );
    if ((collision.rows[0]?.n ?? 0) > 0) {
      console.warn(
        `[boot] email-case backfill skipped: ${collision.rows[0]?.n} distinct lowercase collisions; reconcile manually`,
      );
    } else {
      const r = await dbPool.query(
        `UPDATE users SET email = LOWER(email), updated_at = NOW() WHERE email != LOWER(email)`,
      );
      if ((r.rowCount ?? 0) > 0) {
        console.log(`[boot] lowercased ${r.rowCount} user emails`);
      }
    }
  } catch (e: any) {
    console.error("[boot] email lowercase backfill failed:", e?.message);
  }

  await registerRoutes(httpServer, app);
  
  // Setup WebSocket for real-time chat
  setupWebSocket(httpServer);
  
  // Initialize owner account (Gold Coast Financial Partners LLC — root of hierarchy)
  try {
    await storage.initializeOwnerAccount();
  } catch (error) {
    console.error("Failed to initialize owner account:", error);
  }

  // Promote the seeded root agency to Gold Coast Financial Partners LLC and
  // persist the canonical 3 carrier contracts so Carriers tab + drawer work
  // off real DB rows (not the demo fallback).
  try {
    await storage.initializeRootAgencyAndCarriers();
  } catch (error) {
    console.error("Failed to initialize root agency:", error);
  }

  // Demo user disabled — production mode
  // try {
  //   await storage.initializeDemoUser();
  // } catch (error) {
  //   console.error("Failed to initialize demo user:", error);
  // }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Don't try to re-send if headers were already flushed (logging endpoints
    // can finalize the response before the error reaches us).
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    // Log instead of `throw err`. Re-throwing inside an Express error handler
    // surfaces a noisy [uncaughtException] for every 4xx/5xx the app produces
    // and previously created the illusion of process-level crashes in logs.
    console.error("[express:errorHandler]", err?.stack || err?.message || err);
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
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);

  // Idempotent boot-time seed: guarantee a `lifeos_releases` row exists for the
  // current LIFEOS_VERSION so the update + whats-new popups always have notes
  // to render. No-op if a founder has already published richer notes. Static
  // import — the dynamic-import variant didn't survive the esbuild bundle.
  try {
    await ensureLifeOSReleaseSeed();
  } catch (e: any) {
    console.error("[boot] ensureLifeOSReleaseSeed failed:", e?.message);
  }

  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
  });

  // HIGH (audit 2026-05-12): graceful shutdown. Railway sends SIGTERM on
  // redeploys; without these handlers, in-flight requests are cut mid-flight
  // (clients see ECONNRESET) and the connection pool drops connections
  // without committing pending transactions. Drain the HTTP server, then
  // end the pool — Railway gives us 10s before SIGKILL.
  const shutdown = async (signal: string) => {
    log(`received ${signal}, shutting down gracefully`);
    httpServer.close((err) => {
      if (err) console.error("[shutdown] httpServer.close error:", err);
      else log("[shutdown] http server closed");
    });
    try {
      // Best-effort pool drain. The pool is private inside ./routes/* so we
      // don't have a direct handle here — `setTimeout` gives in-flight queries
      // a moment to finish naturally.
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error("[shutdown] pool drain warning:", e);
    }
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
})();

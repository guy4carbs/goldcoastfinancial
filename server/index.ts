import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { initializeDatabase } from "./db";
import { setupWebSocket } from "./websocket";
import { setupAvatarWebSocket, initializeAvatarNetwork } from "./websocket-avatars";
import { avatarRegistry } from "./services/avatarRegistry";

// Agent System imports
import { bootstrapAgentSystem, AgentRegistry } from "./agents";
import { createAgentRoutes } from "./agents/api-routes";
import { startAllBridges, stopAllBridges } from "./agents/integrations";

// Real-time WebSocket Server (GCF channels with RBAC)
import { GCFWebSocketServer, bridgeEventBus } from "./websocket/index";

// Global agent registry for graceful shutdown
let agentRegistry: AgentRegistry | null = null;
let gcfWebSocketServer: GCFWebSocketServer | null = null;
let eventBridgeCleanup: (() => void) | null = null;

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
  const port = parseInt(process.env.PORT || "4500", 10);
  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
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

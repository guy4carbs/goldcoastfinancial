import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Serve Covenant Risk static site BEFORE Vite middleware (prevents Vite HTML transform)
  app.get(["/covenant-risk", "/covenant-risk/"], (_req, res) => {
    const filePath = path.resolve(
      import.meta.dirname,
      "..",
      "client",
      "public",
      "covenant-risk",
      "index.html",
    );
    res.status(200).set({ "Content-Type": "text/html" }).sendFile(filePath);
  });

  // Serve Covenant for Veterans vanity landing page (Frank's outreach URL)
  app.get(["/covenant/veterans", "/covenant/veterans/"], (_req, res) => {
    const filePath = path.resolve(
      import.meta.dirname,
      "..",
      "client",
      "public",
      "covenant",
      "veterans",
      "index.html",
    );
    res.status(200).set({ "Content-Type": "text/html" }).sendFile(filePath);
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes - they should be handled by express routes
    if (url.startsWith("/api")) {
      return next();
    }

    // Skip WebSocket routes
    if (url.startsWith("/ws/")) {
      return next();
    }

    // Skip Covenant Risk + Covenant for Veterans routes — served as static vanilla sites
    if (url.startsWith("/covenant-risk") || url.startsWith("/covenant/veterans")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

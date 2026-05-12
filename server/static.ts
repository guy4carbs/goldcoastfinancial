import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// HTML + SW script MUST NOT be cached. Vite outputs hashed asset names
// (index-<hash>.js, chunk-<hash>.js) so those can cache aggressively, but
// the entry HTML is fixed-name and references the current build's hashes.
// If a CDN (Cloudflare etc.) caches index.html, returning users get OLD
// asset URLs that no longer exist in `dist/public/` → 404s + broken update.
//
// The service worker script must also bypass cache so each deploy's new SW
// (registered with `?v=<LIFEOS_VERSION>`) actually loads instead of being
// served from a stale CDN edge cache.
function setNoCacheHeaders(res: express.Response): void {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        const base = path.basename(filePath);
        if (base === "index.html" || base === "lifeos-sw.js" || base === "lifeos-sw-kill.js") {
          setNoCacheHeaders(res);
        }
      },
    }),
  );

  // SPA fallback — every non-asset URL serves index.html. MUST also send
  // no-cache so CDN doesn't pin a stale shell to that route.
  app.use("*", (_req, res) => {
    setNoCacheHeaders(res);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

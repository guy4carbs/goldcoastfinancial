import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Serve Covenant for Veterans vanity landing page (no trailing-slash auto-resolve)
  app.get(["/covenant/veterans", "/covenant/veterans/"], (_req, res) => {
    res.sendFile(path.resolve(distPath, "covenant", "veterans", "index.html"));
  });

  // Serve Covenant Risk static site (mirrors dev-mode handler)
  app.get(["/covenant-risk", "/covenant-risk/"], (_req, res) => {
    res.sendFile(path.resolve(distPath, "covenant-risk", "index.html"));
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

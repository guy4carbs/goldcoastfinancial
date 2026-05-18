import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";
import { LIFEOS_VERSION } from "./shared/lifeos";

export default defineConfig({
  // Inject the deployed bundle's lifeOS version so the client can detect
  // stale-bundle mismatches without an extra network call.
  define: {
    __LIFEOS_VERSION__: JSON.stringify(LIFEOS_VERSION),
  },
  plugins: [
    react(),
    ...(process.env.REPL_ID ? [runtimeErrorOverlay()] : []),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  envDir: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Ship source maps in prod so user-reported stack traces resolve back to
    // .tsx file:line. Adds ~30% to dist size (the .map files) but makes prod
    // bugs debuggable from a screenshot of the console alone.
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 4500,
    allowedHosts: true,
    strictPort: false,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

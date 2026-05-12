import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";
import { LIFEOS_VERSION } from "./shared/lifeos";

export default defineConfig({
  // Inject the deployed bundle's lifeOS version as a global so the client
  // can detect stale-bundle mismatches without an extra network call.
  define: {
    __LIFEOS_VERSION__: JSON.stringify(LIFEOS_VERSION),
  },
  plugins: [
    react(),
    // Replit's runtime-error-plugin opens a full-screen overlay on every
    // client throw, which blocks the whole app. Dev-only; disabled here so
    // component errors stay contained to their own render tree.
    // runtimeErrorOverlay(),
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
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
          ],
          'vendor-motion': ['framer-motion'],
          'vendor-dnd': ['@hello-pangea/dnd'],
          // M-14 (audit 2026-05-12): lucide-react and date-fns ship 800+
          // icons / utility tree-shaken modules. Split into their own
          // chunks so the main index.js stays cacheable across releases
          // that don't touch icons.
          'vendor-icons': ['lucide-react'],
          'vendor-date': ['date-fns'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: {
      path: "/vite-hmr",
      overlay: false,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

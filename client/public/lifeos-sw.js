/**
 * lifeOS Service Worker — strict bundle lock.
 *
 * What it does:
 *   1. On install: takes control immediately (no waiting for tab close).
 *   2. On fetch for static assets (JS/CSS/HTML/fonts/images):
 *        - If we have a cached response, ALWAYS serve it. Never re-fetch.
 *          This is the lock: a manual reload re-reads from cache, so the
 *          user stays on the bundle they had until they explicitly Update.
 *        - If we don't have it cached, fetch from network and cache the
 *          result. Used on first visit + when navigating to new chunks
 *          that exist in the same bundle generation.
 *   3. On fetch for /api/* requests: passthrough to network, never cache.
 *   4. On message { type: 'LIFEOS_UPDATE' }:
 *        - Clear the entire cache.
 *        - Reply with confirmation; the page then performs a hard reload
 *          and the new bundle is fetched + cached fresh.
 *
 * Why strict cache-first (not stale-while-revalidate)?
 *   We want manual browser refresh to keep the user on their bundle until
 *   they tap Update Now. SWR would silently swap in the new bundle behind
 *   the user's back — opposite of what the user asked for.
 */

// Cache name is versioned so each deploy gets its own namespace and old
// caches are reaped on activate. The version comes from a query param
// on the SW script URL — registration passes `?v=<LIFEOS_VERSION>`. When
// the version bumps, the SW URL changes, the browser fetches a new SW,
// the new SW gets a new CACHE_NAME, and the activate handler deletes
// every namespace that doesn't match.
const SW_URL = new URL(self.location.href);
const CACHE_VERSION = SW_URL.searchParams.get("v") || "fallback";
const CACHE_PREFIX = "lifeos-bundle-";
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const APP_SHELL = ["/", "/index.html"];

// URL prefixes that should NEVER be cached (always hit the network).
const NETWORK_ONLY = [
  "/api/",
  "/ws/",
  "/vite-hmr",
  "/@vite/",
  "/@react-refresh",
  "/@fs/",
  "/__open-in-editor",
  "/__inspect/",
];

function isNetworkOnly(url) {
  const path = new URL(url).pathname;
  return NETWORK_ONLY.some((p) => path.startsWith(p));
}

function isCacheable(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  // Only cache same-origin requests
  if (url.origin !== self.location.origin) return false;
  if (isNetworkOnly(request.url)) return false;
  return true;
}

self.addEventListener("install", (event) => {
  // Skip the waiting state so we take over immediately on first install.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch((err) => {
        // Don't crash install — but DO log so failures are visible.
        console.warn("[lifeOS SW] APP_SHELL precache failed:", err);
      }),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Take control of any open clients right now.
      await self.clients.claim();
      // Reap any cache namespaces from OLDER lifeOS versions. New version
      // = new CACHE_NAME, so anything else under CACHE_PREFIX is stale.
      try {
        const names = await caches.keys();
        await Promise.all(
          names
            .filter((n) => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME)
            .map(async (n) => {
              try {
                await caches.delete(n);
              } catch (err) {
                console.warn("[lifeOS SW] failed to delete stale cache", n, err);
              }
            }),
        );
      } catch (err) {
        console.warn("[lifeOS SW] cache enumeration failed on activate:", err);
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!isCacheable(req)) {
    // Network-only paths (API, websockets, HMR): bypass cache entirely.
    return;
  }
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) {
        // STRICT LOCK: serve cached, never revalidate.
        return cached;
      }
      // Not yet cached (first visit, or a new chunk loaded during the same
      // session). Fetch and cache for future serves.
      try {
        const fresh = await fetch(req);
        // Only cache successful responses. 4xx/5xx pass through but aren't
        // cached, so the next attempt can retry the network.
        if (fresh.ok && fresh.type !== "opaqueredirect") {
          cache.put(req, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (err) {
        // Network failure — fall back to the app shell so the user gets
        // *something* instead of a browser error page. Triggers the offline
        // error boundary in the React app.
        if (req.mode === "navigate") {
          const shell = await cache.match("/index.html");
          if (shell) return shell;
        }
        throw err;
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "LIFEOS_UPDATE") {
    event.waitUntil(
      (async () => {
        // Wipe every cache key sequentially so partial-failure doesn't leave
        // a half-populated namespace. Errors are logged but don't block.
        try {
          const names = await caches.keys();
          for (const n of names) {
            try {
              await caches.delete(n);
            } catch (err) {
              console.warn("[lifeOS SW] LIFEOS_UPDATE failed to delete cache", n, err);
            }
          }
        } catch (err) {
          console.warn("[lifeOS SW] LIFEOS_UPDATE cache enumeration failed:", err);
        }
        // Acknowledge so the page can perform the hard reload.
        if (event.source && "postMessage" in event.source) {
          event.source.postMessage({ type: "LIFEOS_UPDATE_READY" });
        }
      })(),
    );
  }
  if (data.type === "LIFEOS_PING") {
    if (event.source && "postMessage" in event.source) {
      event.source.postMessage({ type: "LIFEOS_PONG", cacheName: CACHE_NAME });
    }
  }
});

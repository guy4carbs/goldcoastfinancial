/**
 * lifeOS Service Worker — KILL SWITCH (disaster recovery)
 *
 * If a future version of `lifeos-sw.js` ships with a bug that bricks
 * cached users (e.g., never resolves LIFEOS_UPDATE_READY, or serves
 * broken bundles from a corrupt cache), rename this file to
 * `lifeos-sw.js` in the repo and deploy. Cached clients will fetch the
 * new SW (URL+version change forces it), this script:
 *
 *   1. Deletes every cache namespace owned by lifeOS.
 *   2. Unregisters itself.
 *
 * Result: the user's next page load hits the network normally (no SW,
 * no cache). They get the fresh bundle from Railway directly.
 *
 * After recovery, ship the real `lifeos-sw.js` again — clients will
 * install it fresh.
 *
 * Important: keep this file's path stable (`/lifeos-sw.js`) when used
 * as a kill switch. Don't change the registration URL or you'll have
 * orphan SWs at the old path.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const names = await caches.keys();
        for (const n of names) {
          try {
            await caches.delete(n);
          } catch (err) {
            console.warn("[lifeOS SW kill] failed to delete cache", n, err);
          }
        }
      } catch (err) {
        console.warn("[lifeOS SW kill] cache enumeration failed:", err);
      }
      try {
        await self.registration.unregister();
      } catch (err) {
        console.warn("[lifeOS SW kill] unregister failed:", err);
      }
      // Reload all clients so they detect the missing SW and proceed normally.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const c of clients) {
        try {
          c.navigate(c.url);
        } catch {
          // Fallback: postMessage so the page can self-reload
          try { c.postMessage({ type: "LIFEOS_KILL_RELOAD" }); } catch { /* ignore */ }
        }
      }
    })(),
  );
});

self.addEventListener("fetch", () => {
  // Pure passthrough — no caching, no interception. The browser handles
  // everything as if there's no SW. We unregister on activate so this
  // handler is short-lived; it's here for the brief window before
  // unregister completes.
});

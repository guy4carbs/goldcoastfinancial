/**
 * lifeOS Service Worker registration + Update Now trigger.
 *
 * The SW lives at /lifeos-sw.js and locks the user's bundle so manual
 * browser refresh keeps them on the version they had. The ONLY way to
 * get the new bundle is via `triggerLifeOSUpdate()` (Update Now button).
 *
 * Dev mode (Vite HMR) — the SW is intentionally NOT registered, because:
 *   - HMR requires fresh fetches for every change
 *   - The cache would defeat the entire HMR experience
 * Production-only registration keeps DX clean while still locking prod.
 */

const SW_PATH = "/lifeos-sw.js";
const SW_SCOPE = "/";

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

function isDev(): boolean {
  // Vite injects import.meta.env.DEV at build time. If it's true → dev mode.
  // Fallback: localhost detection.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((import.meta as any).env?.DEV) return true;
  } catch {
    // ignore
  }
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

/**
 * Register the lifeOS SW. Call once at app boot. Idempotent.
 */
export function registerLifeOSServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  if (isDev()) {
    // In dev, proactively UNregister any leftover SW so HMR works cleanly.
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const r of regs) {
        if (r.active && r.active.scriptURL.includes("lifeos-sw.js")) {
          r.unregister().catch(() => {});
        }
      }
    });
    return Promise.resolve(null);
  }
  if (registrationPromise) return registrationPromise;
  registrationPromise = navigator.serviceWorker
    .register(SW_PATH, { scope: SW_SCOPE })
    .catch((err) => {
      console.warn("[lifeOS] SW register failed:", err?.message);
      return null;
    });
  return registrationPromise;
}

/**
 * Trigger the bundle update: wipe SW cache, then hard-reload so the
 * new bundle is fetched fresh.
 */
export async function triggerLifeOSUpdate(): Promise<void> {
  // If no SW is registered (dev mode or first-ever load), just hard-reload.
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    window.location.href = window.location.pathname + "?lifeos=" + Date.now();
    return;
  }

  const reg = await navigator.serviceWorker.getRegistration();
  const sw = reg?.active;
  if (!sw) {
    window.location.href = window.location.pathname + "?lifeos=" + Date.now();
    return;
  }

  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    let resolved = false;
    const settle = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };
    channel.port1.onmessage = (e) => {
      if (e.data?.type === "LIFEOS_UPDATE_READY") settle();
    };
    // Belt-and-suspenders: never block on a missing SW reply forever.
    setTimeout(settle, 2500);
    try {
      sw.postMessage({ type: "LIFEOS_UPDATE" }, [channel.port2]);
    } catch {
      settle();
    }
  });

  // Also tell the SW it can take over the new bundle on next nav.
  try {
    if (reg && reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
  } catch {
    // ignore
  }

  window.location.href = window.location.pathname + "?lifeos=" + Date.now();
}

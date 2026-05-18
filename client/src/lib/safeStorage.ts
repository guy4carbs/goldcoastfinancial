/**
 * Safe Web Storage wrappers.
 *
 * Direct `localStorage.getItem` / `setItem` calls throw a SecurityError in
 * Safari private browsing mode, in some in-app browsers (LinkedIn, Instagram,
 * WeChat), and when the user has explicitly disabled site data. Any
 * unhandled throw on app boot or sidebar-render hangs the whole tree.
 *
 * These helpers catch every failure mode and degrade gracefully (return null
 * on get, return false on set/remove). They also serialize JSON values
 * automatically so call sites don't have to `try { JSON.parse }` themselves.
 *
 * Use these in place of direct `window.localStorage.*` / `sessionStorage.*`
 * access in any code path that runs unconditionally on app boot.
 */

type Storage = "local" | "session";

function getBackend(kind: Storage): globalThis.Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function safeGet(key: string, kind: Storage = "local"): string | null {
  const store = getBackend(kind);
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string, kind: Storage = "local"): boolean {
  const store = getBackend(kind);
  if (!store) return false;
  try {
    store.setItem(key, value);
    return true;
  } catch {
    // QuotaExceededError, private-mode SecurityError, etc.
    return false;
  }
}

export function safeRemove(key: string, kind: Storage = "local"): boolean {
  const store = getBackend(kind);
  if (!store) return false;
  try {
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * JSON-aware variants. `safeGetJSON` returns `null` on miss / parse error;
 * `safeSetJSON` returns `false` if either serialization or write fails.
 */
export function safeGetJSON<T = unknown>(key: string, kind: Storage = "local"): T | null {
  const raw = safeGet(key, kind);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeSetJSON(key: string, value: unknown, kind: Storage = "local"): boolean {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }
  return safeSet(key, serialized, kind);
}

/**
 * Iterate localStorage keys without throwing on locked storage. Returns an
 * empty array if storage is unavailable. Used by admin-side cleanup paths.
 */
export function safeKeys(kind: Storage = "local"): string[] {
  const store = getBackend(kind);
  if (!store) return [];
  try {
    const out: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k != null) out.push(k);
    }
    return out;
  } catch {
    return [];
  }
}

import { QueryClient, QueryFunction } from "@tanstack/react-query";

// ─── Global 2FA gate fetch interceptor ─────────────────────────────────────
// Some places in the app use raw fetch() instead of apiRequest/getQueryFn.
// Without an interceptor, those calls would receive a 403
// REQUIRES_2FA_ENROLLMENT and never route the SPA to the enroll page —
// users would just see broken dashboards. We wrap window.fetch ONCE on
// module load to catch any 403 with the 2FA codes and redirect.
if (typeof window !== "undefined" && !(window as any).__gc2faFetchHooked) {
  (window as any).__gc2faFetchHooked = true;
  const origFetch = window.fetch.bind(window);
  let redirecting = false;
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const res = await origFetch(...args);
    if (res.status === 403 && !redirecting) {
      const path = window.location.pathname;
      const onAuthPage = path.startsWith("/auth/") || path === "/login";
      if (!onAuthPage) {
        try {
          const clone = res.clone();
          const text = await clone.text();
          if (text) {
            const data = JSON.parse(text);
            if (data?.code === "REQUIRES_2FA_ENROLLMENT") {
              redirecting = true;
              window.location.assign("/auth/2fa/enroll");
            } else if (data?.code === "REQUIRES_2FA") {
              redirecting = true;
              window.location.assign("/auth/2fa");
            }
          }
        } catch {
          /* not JSON — ignore */
        }
      }
    }
    return res;
  };
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // 2FA gate redirect — when the server tells us the session requires 2FA
    // enrolment or verification, route the SPA there. Skip if we're already
    // on the 2FA pages themselves to avoid a redirect loop.
    if (res.status === 403 && typeof window !== "undefined") {
      try {
        const data = JSON.parse(text);
        const path = window.location.pathname;
        const onAuthPage = path.startsWith("/auth/") || path === "/login";
        if (!onAuthPage) {
          if (data?.code === "REQUIRES_2FA_ENROLLMENT") {
            window.location.assign("/auth/2fa/enroll");
          } else if (data?.code === "REQUIRES_2FA") {
            window.location.assign("/auth/2fa");
          }
        }
      } catch {
        // not JSON; fall through
      }
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

// ─── CSRF token ────────────────────────────────────────────────────────────
// Cached after first fetch. The server issues a token bound to the session id
// and expects it in the X-CSRF-Token header on every state-changing request.
let csrfToken: string | null = null;
let csrfHeaderName = "x-csrf-token";
let csrfFetchInFlight: Promise<void> | null = null;

async function ensureCsrfToken(): Promise<void> {
  if (csrfToken) return;
  if (csrfFetchInFlight) return csrfFetchInFlight;
  csrfFetchInFlight = (async () => {
    try {
      const res = await fetch("/api/csrf-token", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { csrfToken?: string; headerName?: string };
      if (data.csrfToken) csrfToken = data.csrfToken;
      if (data.headerName) csrfHeaderName = data.headerName.toLowerCase();
    } finally {
      csrfFetchInFlight = null;
    }
  })();
  return csrfFetchInFlight;
}

function clearCsrfToken() {
  csrfToken = null;
}

/**
 * Async helper that returns CSRF headers ready to spread into a `fetch` call.
 * Use this for inline mutations that don't go through `apiRequest`.
 *
 *   const res = await fetch("/api/...", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
 *     ...
 *   });
 */
export async function csrfHeaders(): Promise<Record<string, string>> {
  await ensureCsrfToken();
  return csrfToken ? { [csrfHeaderName]: csrfToken } : {};
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
  if (isStateChanging) {
    await ensureCsrfToken();
  }
  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  if (isStateChanging && csrfToken) headers[csrfHeaderName] = csrfToken;

  const doFetch = () =>
    fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

  let res = await doFetch();
  // Server rotated/expired the token — fetch a fresh one and retry once.
  if (res.status === 403 && isStateChanging) {
    const text = await res.clone().text().catch(() => "");
    if (/csrf|invalid token/i.test(text)) {
      clearCsrfToken();
      await ensureCsrfToken();
      if (csrfToken) headers[csrfHeaderName] = csrfToken;
      res = await doFetch();
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
/**
 * Default fetcher. Convention:
 *   queryKey[0] is the URL path (e.g. "/api/founders/growth/kpis").
 *   Additional queryKey entries are cache-discriminators ONLY — they are NEVER
 *   appended to the URL, because TanStack Query has no knowledge of the
 *   caller's intent (path-segment vs query-param vs ignore). Callers that need
 *   query params should supply their own queryFn that builds the URL.
 *
 * Previously this fetcher joined queryKey with "/", which silently produced
 * bogus paths like "/api/founders/growth/kpis/ytd/both" and manifested as
 * "The string did not match the expected pattern" 500s across the Founders
 * Lounge (and anywhere else a queryKey had more than one entry).
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = String(queryKey[0] ?? "");
    if (!url.startsWith("/")) {
      throw new Error(
        `queryKey[0] must be a URL path (got: ${JSON.stringify(queryKey)})`,
      );
    }
    const res = await fetch(url, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

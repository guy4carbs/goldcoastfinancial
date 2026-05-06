import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, StopCircle, ExternalLink } from "lucide-react";
import { csrfHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

/**
 * GlobalViewAsBanner — sticky, always-on indicator that follows the founder
 * across every page during an active View-As (impersonation) session.
 *
 * - Polls /api/founders/viewas/session every 30s.
 * - When { active: true }: renders a fixed top bar with role/name, live
 *   elapsed timer, "End Session" and "Open View-As Page" controls.
 * - When { active: false } or query errors: renders nothing.
 *
 * Mounted at the App root so it appears on EVERY route, including the HCMS
 * lounge a founder might land on while impersonating another role.
 */

interface ViewAsSessionResponse {
  active: boolean;
  startedAt?: string | null;
  target?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  } | null;
  session?: {
    id?: string;
    started_at?: string;
    reason?: string;
  } | null;
}

const ROLE_LABEL: Record<string, string> = {
  founder: "Founder",
  owner: "Owner",
  system_admin: "Admin",
  manager: "Manager",
  sales_agent: "Agent",
  client: "Client",
  investor: "Investor",
  executive: "Executive",
};

const BANNER_HEIGHT_PX = 44;
const BANNER_CSS_VAR = "--gc-global-viewas-banner-height";

function formatElapsed(startedAtMs: number, nowMs: number): string {
  const totalSeconds = Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

async function fetchSession(): Promise<ViewAsSessionResponse> {
  const res = await fetch("/api/founders/viewas/session", { credentials: "include" });
  if (!res.ok) return { active: false };
  try {
    const data = (await res.json()) as ViewAsSessionResponse | Record<string, unknown> | null;
    if (!data || typeof data !== "object") return { active: false };
    if ((data as ViewAsSessionResponse).active === true) return data as ViewAsSessionResponse;
    return { active: false };
  } catch {
    return { active: false };
  }
}

export function GlobalViewAsBanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  const [ending, setEnding] = useState(false);

  // Owner / system_admin / founder can all start view-as sessions on this
  // installation, so all three should see the global banner. Excludes lower
  // roles to avoid every agent/client polling the founders endpoint every
  // 30s for nothing. Sentinel finding 2026-05-01 (broadened 2026-05-01).
  const ROLES_WITH_VIEW_AS = new Set(["founder", "owner", "system_admin"]);
  const canViewAs = !!user?.role && ROLES_WITH_VIEW_AS.has(String(user.role));

  const { data } = useQuery<ViewAsSessionResponse>({
    queryKey: ["/api/founders/viewas/session"],
    queryFn: fetchSession,
    refetchInterval: 30_000,
    staleTime: 0,
    retry: false,
    enabled: canViewAs,
  });

  const isActive = !!data?.active && !!data.target;

  // Live-counting elapsed timer (ticks every second only while active).
  useEffect(() => {
    if (!isActive) return;
    const handle = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(handle);
  }, [isActive]);

  // Publish a CSS variable so layouts can offset their content (sidebar etc.).
  useEffect(() => {
    const root = document.documentElement;
    if (isActive) {
      root.style.setProperty(BANNER_CSS_VAR, `${BANNER_HEIGHT_PX}px`);
    } else {
      root.style.setProperty(BANNER_CSS_VAR, "0px");
    }
    return () => {
      root.style.setProperty(BANNER_CSS_VAR, "0px");
    };
  }, [isActive]);

  if (!isActive || !data?.target) return null;

  const target = data.target;
  const startedAtIso = data.startedAt || data.session?.started_at || null;
  const startedAtMs = startedAtIso ? new Date(startedAtIso).getTime() : Date.now();
  const elapsed = Number.isFinite(startedAtMs) ? formatElapsed(startedAtMs, now) : "00:00";
  const targetName = `${target.first_name ?? ""} ${target.last_name ?? ""}`.trim() || target.email;
  const targetRoleLabel = ROLE_LABEL[target.role] || target.role;

  const handleEnd = async () => {
    if (ending) return;
    setEnding(true);
    try {
      const res = await fetch("/api/founders/viewas/session/end", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to end session" }));
        throw new Error((err as { error?: string }).error || "Failed to end session");
      }
      toast({ title: "Session ended", description: "View-As closed" });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/viewas/session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Brief delay so the toast actually paints before the hard reload
      // (Axiom finding — assign() interrupts in-flight render). Force a
      // clean reload after so any impersonated UI state is reset.
      setTimeout(() => window.location.assign("/"), 250);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to end session";
      toast({ title: "Failed to end session", description: msg, variant: "destructive" });
      setEnding(false);
    }
  };

  const handleOpenViewAs = () => {
    window.location.assign("/founders/view-as");
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      data-tour-id="global-viewas-banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: BANNER_HEIGHT_PX,
        backgroundColor: "var(--gc-status-terminated, #E07060)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "0 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        fontFamily: "var(--gc-font-body)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#FFFFFF" }} />
        <span
          style={{
            fontSize: "var(--gc-text-sm, 13px)",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Viewing as {targetName} ({targetRoleLabel})
        </span>
        <span
          aria-label="Elapsed session time"
          style={{
            fontSize: "var(--gc-text-xs, 12px)",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 999,
            backgroundColor: "rgba(0,0,0,0.25)",
            color: "#FFFFFF",
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
          }}
        >
          {elapsed}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleOpenViewAs}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 4,
            backgroundColor: "transparent",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.55)",
            fontSize: "var(--gc-text-xs, 12px)",
            fontWeight: 500,
            cursor: "pointer",
            lineHeight: 1.2,
          }}
          aria-label="Open the View-As page"
          title="Open View-As Page"
        >
          <span className="hidden sm:inline">Open View-As Page</span>
          <ExternalLink className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleEnd}
          disabled={ending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            color: "var(--gc-status-terminated, #E07060)",
            border: "1px solid #FFFFFF",
            fontSize: "var(--gc-text-xs, 12px)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: ending ? "not-allowed" : "pointer",
            opacity: ending ? 0.7 : 1,
            lineHeight: 1.2,
          }}
        >
          <StopCircle className="w-4 h-4" />
          {ending ? "Ending…" : "End Session"}
        </button>
      </div>
    </div>
  );
}

export default GlobalViewAsBanner;

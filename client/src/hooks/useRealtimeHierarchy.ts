import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const ADMIN_ROLES = new Set(["founder", "owner", "system_admin"]);

/**
 * Phase D Wave 2 (Nova) — realtime hierarchy + role bridge.
 *
 * Subscribes the current authenticated user to two SSE channels so hierarchy
 * mutations propagate without page reloads:
 *
 *   - /api/me/events            → fires `role:changed` when THIS user's role
 *                                 flips. Invalidates useAuth so sidebar/routes
 *                                 re-render with the new permissions.
 *   - /api/hcms/hierarchy/stream → admin-only; fires `hierarchy:changed` for
 *                                 any agent. Invalidates the hierarchy tree
 *                                 cache so other admins viewing the page see
 *                                 the update.
 *
 * Mounts inside the QueryClientProvider tree. Connections close cleanly on
 * unmount and on user logout (when user becomes null) — the effect's cleanup
 * runs whenever the dependency array changes (id/role) or the component
 * unmounts, so no leaked EventSource handles.
 *
 * SSE wire-format note: server-side (`server/routes.ts:682` and
 * `server/routes/hcms-hierarchy.ts:411`) writes events as
 *   `data: ${JSON.stringify(payload)}\n\n`
 * with NO explicit `event:` field. That means everything arrives on the
 * default `message` channel and the event type lives inside `payload.type`.
 * We therefore use `onmessage` and discriminate on `payload.type`, NOT
 * `addEventListener("role:changed", ...)`.
 */
export function useRealtimeHierarchy() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    const userId = user.id;
    const isAdmin = !!user.role && ADMIN_ROLES.has(String(user.role));

    // ---- Per-user role:changed channel (every authed user) -----------------
    const meStream = new EventSource("/api/me/events", {
      withCredentials: true,
    } as EventSourceInit);

    meStream.onmessage = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (!payload || typeof payload !== "object") return;

        // Server emits `{ type: "ready", at }` on connect and
        // `{ type: "role:changed", userId, oldRole, newRole, ts }` on change.
        if (payload.type !== "role:changed") return;

        // Defensive: server already filters by userId in `onRoleChanged`,
        // but verify here too so a future bus refactor can't leak across users.
        if (payload.userId !== userId) return;

        // Re-fetch /api/auth/user so role/permissions update everywhere
        // (sidebar gating, route guards, etc).
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

        const newLabel = String(payload.newRole ?? "your role");
        toast({
          title: "Your access has been updated",
          description: `You're now: ${newLabel.replace(/_/g, " ")}. Refreshing your access...`,
        });
      } catch {
        // Malformed event — ignore. The server log captures the real source.
      }
    };

    // EventSource auto-reconnects on transport errors. A 401 (e.g. logged out
    // mid-stream) closes the connection silently; the next navigation will
    // re-prompt login via the standard auth flow.
    meStream.onerror = () => {
      // No-op: rely on browser's built-in reconnect + cleanup on unmount.
    };

    // ---- Admin-only hierarchy:changed channel ------------------------------
    let adminStream: EventSource | null = null;
    if (isAdmin) {
      adminStream = new EventSource("/api/hcms/hierarchy/stream", {
        withCredentials: true,
      } as EventSourceInit);

      adminStream.onmessage = (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (!payload || typeof payload !== "object") return;
          if (payload.type !== "hierarchy:changed") return;

          // Refresh the admin hierarchy tree view for any open admin sessions.
          queryClient.invalidateQueries({ queryKey: ["/api/hcms/hierarchy/tree"] });
        } catch {
          // Ignore malformed payloads.
        }
      };

      adminStream.onerror = () => {
        // No-op: rely on browser auto-reconnect; a 401 quietly closes.
      };
    }

    // ---- Tear-down ---------------------------------------------------------
    // Runs on unmount AND whenever user.id / user.role changes (e.g. logout
    // sets user to null → effect re-runs, previous EventSources are closed
    // before the new effect bails out at the `if (!user?.id) return` guard).
    return () => {
      meStream.close();
      if (adminStream) adminStream.close();
    };
  }, [user?.id, user?.role, queryClient, toast]);
}

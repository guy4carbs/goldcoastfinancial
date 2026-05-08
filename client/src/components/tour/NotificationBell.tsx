import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle, Clock, ShieldAlert, FileText, Megaphone, X, Inbox } from "lucide-react";
import { useLocation } from "wouter";

interface AgentNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
  virtual?: boolean;
}

function iconForType(type: string) {
  switch (type) {
    case "doc_signed":
    case "doc_uploaded":
      return FileText;
    case "milestone":
    case "welcome":
      return CheckCircle;
    case "expiration":
      return ShieldAlert;
    case "admin_message":
      return Megaphone;
    case "carrier_update":
      return Clock;
    default:
      return Bell;
  }
}

function colorForType(type: string): string {
  switch (type) {
    case "expiration":
      return "#dc2626"; // red-600 — warning / expiring
    case "milestone":
      return "#10b981"; // emerald-500 — success
    case "admin_message":
      return "#7c3aed"; // violet-600 — Heritage primary
    default:
      return "#f59e0b"; // amber-500 — Heritage accent
  }
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AgentNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/agent-portal/notifications", { credentials: "include" });
      if (!r.ok) {
        setItems([]);
        return;
      }
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial + interval poll + refetch on open
  useEffect(() => {
    fetchItems();
    const t = window.setInterval(fetchItems, 60_000);
    const onFocus = () => fetchItems();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (open) fetchItems();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const effectiveUnread = items.filter((n) => !n.isRead && !locallyRead.has(n.id)).length;

  const markRead = async (id: string) => {
    setLocallyRead((prev) => new Set(prev).add(id));
    // Virtual notifications (id starts with virt-) don't persist server-side,
    // but the endpoint accepts and no-ops — we still call it for consistency.
    try {
      await fetch(`/api/agent-portal/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {
      // soft-fail — the local set keeps the UI correct until next refetch
    }
  };

  const markAllRead = async () => {
    // Optimistically mark all local
    setLocallyRead(new Set(items.map((n) => n.id)));
    try {
      await fetch("/api/agent-portal/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      fetchItems();
    } catch {
      // soft-fail
    }
  };

  const handleClick = (n: AgentNotification) => {
    markRead(n.id);
    if (n.actionUrl) {
      setLocation(n.actionUrl);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} data-tour-id="heritage-shell-notifications" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-sm relative"
        style={{
          color: open ? "#7c3aed" : "#4b5563",
          background: open ? "rgba(124, 58, 237, 0.08)" : "transparent",
          border: open ? "1px solid #7c3aed" : "1px solid transparent",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
        title="Notifications"
        aria-label={effectiveUnread > 0 ? `Notifications (${effectiveUnread} unread)` : "Notifications"}
      >
        <Bell className="w-4 h-4" />
        {effectiveUnread > 0 && (
          <span
            className="absolute"
            style={{
              top: 2,
              right: 2,
              minWidth: 14,
              height: 14,
              padding: "0 4px",
              borderRadius: 999,
              background: "#f59e0b",
              color: "#1f2937",
              fontSize: 9,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px #ffffff",
            }}
          >
            {effectiveUnread > 9 ? "9+" : effectiveUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 380,
            maxHeight: 480,
            backgroundColor: "#ffffff",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: "8px",
            boxShadow: "0 18px 44px rgba(91, 33, 182, 0.18)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "heritage-notif-in 180ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <style>{`
            @keyframes heritage-notif-in {
              from { opacity: 0; transform: translateY(-6px) scale(0.98); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderBottom: "1px solid rgba(124, 58, 237, 0.1)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", letterSpacing: 0.1 }}>
              Notifications
              {effectiveUnread > 0 && (
                <span style={{ marginLeft: 8, color: "#7c3aed", fontWeight: 500 }}>
                  · {effectiveUnread} unread
                </span>
              )}
            </div>
            {effectiveUnread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#7c3aed",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124, 58, 237, 0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1, minHeight: 120 }}>
            {loading && items.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: 36, textAlign: "center", color: "#9ca3af" }}>
                <Inbox className="w-6 h-6 mx-auto mb-2" style={{ opacity: 0.4 }} />
                <div style={{ fontSize: 12 }}>No notifications yet</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                  We'll let you know when something needs your attention.
                </div>
              </div>
            ) : (
              items.map((n) => {
                const Icon = iconForType(n.type);
                const accent = colorForType(n.type);
                const isUnread = !n.isRead && !locallyRead.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      width: "100%",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "12px 14px",
                      background: isUnread ? "rgba(245, 158, 11, 0.08)" : "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(124, 58, 237, 0.08)",
                      cursor: n.actionUrl ? "pointer" : "default",
                      textAlign: "left",
                      color: "inherit",
                      transition: "background 120ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124, 58, 237, 0.06)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isUnread
                        ? "rgba(245, 158, 11, 0.08)"
                        : "transparent")
                    }
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: `color-mix(in srgb, ${accent} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: accent,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: isUnread ? 600 : 500,
                            color: "#1f2937",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {n.title}
                        </div>
                        <div style={{ fontSize: 10.5, color: "#9ca3af", flexShrink: 0 }}>
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#4b5563",
                          lineHeight: 1.45,
                          marginTop: 2,
                          wordBreak: "break-word",
                        }}
                      >
                        {n.message}
                      </div>
                    </div>
                    {isUnread && (
                      <span
                        aria-hidden
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: accent,
                          flexShrink: 0,
                          marginTop: 8,
                        }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

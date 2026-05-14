import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Palette, Bell, User, UserCircle, LayoutGrid, Lock, Shield, BarChart3, Building2, ArrowLeftRight, Wallet, Landmark, Megaphone, Crown } from "lucide-react";
import { Link } from "wouter";
import { useGCTheme, type GCThemeId } from "./GCThemeProvider";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/tour/NotificationBell";
import { LifeOSVersionBadge } from "@/components/lifeos/LifeOSVersionBadge";
import { csrfHeaders } from "@/lib/queryClient";
import type { ReactNode } from "react";

const themeIcons: Record<GCThemeId, typeof Moon> = { "gc-dark": Moon, "gc-light": Sun, "gc-maroon": Palette };

// 3x3 app grid. HCMS, Founders, Heritage are the lounges that ship today.
// Ops Hub / Finance / Investors / Marketing are scaffolded but not ready for
// founders to send agents into — locked with "coming soon" until they're
// production-ready. Training + AI Council are always-locked future-state.
// CRM was removed entirely (it duplicated the Heritage CRM affordance).
const GC_APPS = [
  { id: "hcms", name: "HCMS", desc: "Agent Contracting", href: "/hcms", icon: Shield, available: true },
  { id: "ops", name: "Ops Hub", desc: "Back-office Command", href: "#", icon: Lock, available: false },
  { id: "finance", name: "Finance", desc: "Financial Operations", href: "#", icon: Lock, available: false },
  { id: "investors", name: "Investors", desc: "Investor Relations", href: "#", icon: Lock, available: false },
  { id: "marketing", name: "Marketing", desc: "Growth Engine", href: "#", icon: Lock, available: false },
  { id: "founders", name: "Founders", desc: "Ownership Oversight", href: "/founders", icon: Crown, available: true },
  { id: "heritage", name: "Heritage", desc: "Agent CRM Login", href: "https://heritagels.org/agents/login", icon: Building2, available: true },
  { id: "training", name: "Training", desc: "Agent Academy", href: "#", icon: Lock, available: false },
  { id: "ai", name: "AI Council", desc: "Avatar Debate", href: "#", icon: Lock, available: false },
];

// Roles permitted to flip the HCMS admin/agent view toggle (audit 2026-05-12).
// Founders + owners + directors only — managers and below stay in their lane.
const VIEW_MODE_TOGGLE_ROLES = new Set<string>(["founder", "owner", "director"]);

function ViewModeToggle() {
  const { user } = useAuth();
  if (!user?.role || !VIEW_MODE_TOGGLE_ROLES.has(user.role)) return null;

  const isAgentView = typeof window !== "undefined" && window.location.pathname.startsWith("/hcms/my");

  return (
    <button
      onClick={() => { window.location.href = isAgentView ? "/hcms" : "/hcms/my/dashboard"; }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm"
      style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
        color: "var(--gc-gold)",
        backgroundColor: "color-mix(in srgb, var(--gc-gold) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--gc-gold) 25%, transparent)",
        borderRadius: "var(--gc-radius-sm)",
        cursor: "pointer", transition: "all 0.2s",
      }}
      title={isAgentView ? "Switch to Admin View" : "Switch to Agent View"}
    >
      <ArrowLeftRight className="w-3.5 h-3.5" />
      {isAgentView ? "ADMIN" : "AGENT"}
    </button>
  );
}

function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: await csrfHeaders(),
    });
    window.location.href = "/login";
  };

  const profileHref = user?.role === "sales_agent" || user?.role === "owner" ? "/hcms/my/profile" : null;

  return (
    <div ref={ref} data-tour-id="hcms-shell-user-menu" style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)", border: "none", cursor: "pointer" }}>
        <User className="w-4 h-4" />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220, backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", boxShadow: "var(--gc-shadow-lg)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "var(--gc-space-3)", borderBottom: "1px solid var(--gc-border-subtle)" }}>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{user?.email}</div>
          </div>
          {profileHref && (
            <Link href={profileHref}>
              <span
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2"
                style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-text-primary)", fontSize: "var(--gc-text-sm)", textAlign: "left", display: "flex" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <UserCircle className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
                View my profile
              </span>
            </Link>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-2" style={{ padding: "var(--gc-space-2) var(--gc-space-3)", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)", textAlign: "left", borderTop: profileHref ? "1px solid var(--gc-border-subtle)" : "none" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export interface GCTopbarProps { title?: string; subtitle?: string; actions?: ReactNode; }

export function GCTopbar({ title, subtitle, actions }: GCTopbarProps) {
  const { theme, setTheme, themes } = useGCTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cycle = () => { const i = themes.findIndex(t => t.id === theme); setTheme(themes[(i + 1) % themes.length].id); };
  const Icon = themeIcons[theme];

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header className="sticky top-[2px] z-40 flex items-center justify-between h-16 px-6 gap-4"
      style={{ backgroundColor: "var(--gc-surface)", borderBottom: "1px solid var(--gc-border)" }}>
      <div className="flex flex-col min-w-0">
        {title && <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", lineHeight: "var(--gc-leading-tight)", letterSpacing: "var(--gc-tracking-tight)" }}>{title}</h1>}
        {subtitle && <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}

        {/* App Switcher */}
        <div className="relative" ref={menuRef} data-tour-id="hcms-shell-app-switcher">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-sm"
            style={{
              color: menuOpen ? "var(--gc-gold)" : "var(--gc-text-secondary)",
              backgroundColor: menuOpen ? `color-mix(in srgb, var(--gc-gold) 12%, transparent)` : "transparent",
              transition: "all var(--gc-transition-fast)",
              border: menuOpen ? "1px solid var(--gc-gold)" : "1px solid transparent",
              borderRadius: "var(--gc-radius-sm)",
            }}
            title="Apps"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 340,
                backgroundColor: "var(--gc-surface)",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-lg)",
                boxShadow: "var(--gc-shadow-lg)",
                padding: "var(--gc-space-4)",
                zIndex: 100,
              }}
            >
              {/* Header */}
              <div style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-xs)",
                fontWeight: 500,
                letterSpacing: "var(--gc-tracking-wider)",
                textTransform: "uppercase" as const,
                color: "var(--gc-gold)",
                marginBottom: "var(--gc-space-4)",
                paddingBottom: "var(--gc-space-2)",
                borderBottom: "1px solid var(--gc-border-subtle)",
              }}>
                Gold Coast Apps
              </div>

              {/* App Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gc-space-2)" }}>
                {GC_APPS.map(app => (
                  <a
                    key={app.id}
                    href={app.available ? app.href : undefined}
                    onClick={e => {
                      if (!app.available) { e.preventDefault(); return; }
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "var(--gc-space-2)",
                      padding: "var(--gc-space-3)",
                      borderRadius: "var(--gc-radius-md)",
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                      cursor: app.available ? "pointer" : "default",
                      opacity: app.available ? 1 : 0.35,
                      textDecoration: "none",
                      transition: "all var(--gc-transition-fast)",
                    }}
                    onMouseEnter={e => {
                      if (app.available) {
                        e.currentTarget.style.backgroundColor = "var(--gc-surface-2)";
                        e.currentTarget.style.borderColor = "var(--gc-border)";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--gc-radius-md)",
                        backgroundColor: app.available
                          ? `color-mix(in srgb, var(--gc-gold) 15%, transparent)`
                          : "var(--gc-surface-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: app.available ? "1px solid var(--gc-gold)" : "1px solid var(--gc-border-subtle)",
                      }}
                    >
                      <app.icon
                        className="w-4 h-4"
                        style={{ color: app.available ? "var(--gc-gold)" : "var(--gc-text-muted)" }}
                      />
                    </div>
                    <span style={{
                      fontFamily: "var(--gc-font-body)",
                      fontSize: "var(--gc-text-xs)",
                      fontWeight: 500,
                      color: app.available ? "var(--gc-text-primary)" : "var(--gc-text-muted)",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}>
                      {app.name}
                    </span>
                    {!app.available && (
                      <span style={{
                        fontFamily: "var(--gc-font-body)",
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--gc-text-muted)",
                        textAlign: "center",
                        lineHeight: 1,
                        marginTop: -2,
                      }}>
                        Coming soon
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle (owner only) */}
        <ViewModeToggle />

        {/* lifeOS version badge — proof of which bundle is loaded */}
        <LifeOSVersionBadge />

        {/* Theme Toggle */}
        <button data-tour-id="hcms-shell-theme-toggle" onClick={cycle} className="p-2 rounded-sm" style={{ color: "var(--gc-text-secondary)", transition: "color var(--gc-transition-fast)" }}
          title={`Theme: ${themes.find(t => t.id === theme)?.label}`}><Icon className="w-4 h-4" /></button>

        {/* Notifications — full dropdown functionality wired by NotificationBell */}
        <NotificationBell />
        {/* User Avatar + Logout */}
        <UserMenu />
      </div>
    </header>
  );
}

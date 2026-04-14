import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Palette, Bell, User, LayoutGrid, Lock, Shield, BarChart3, Building2 } from "lucide-react";
import { useGCTheme, type GCThemeId } from "./GCThemeProvider";
import type { ReactNode } from "react";

const themeIcons: Record<GCThemeId, typeof Moon> = { "gc-dark": Moon, "gc-light": Sun, "gc-maroon": Palette };

const GC_APPS = [
  { id: "hcms", name: "HCMS", desc: "Hierarchy & Compensation", href: "/hcms", icon: Shield, available: true },
  { id: "ops", name: "Ops Hub", desc: "Back-office Command", href: "/ops", icon: BarChart3, available: true },
  { id: "heritage", name: "Heritage", desc: "Agent Login Portal", href: "https://heritagels.org/login", icon: Building2, available: true },
  { id: "crm", name: "CRM", desc: "Customer Relations", href: "#", icon: Lock, available: false },
  { id: "analytics", name: "Analytics", desc: "Business Intelligence", href: "#", icon: Lock, available: false },
  { id: "mobile", name: "Mobile", desc: "iOS & Android", href: "#", icon: Lock, available: false },
  { id: "training", name: "Training", desc: "Agent Academy", href: "#", icon: Lock, available: false },
  { id: "marketing", name: "Marketing", desc: "Growth Engine", href: "#", icon: Lock, available: false },
  { id: "ai", name: "AI Council", desc: "Avatar Debate", href: "#", icon: Lock, available: false },
];

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
        <div className="relative" ref={menuRef}>
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
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={cycle} className="p-2 rounded-sm" style={{ color: "var(--gc-text-secondary)", transition: "color var(--gc-transition-fast)" }}
          title={`Theme: ${themes.find(t => t.id === theme)?.label}`}><Icon className="w-4 h-4" /></button>

        {/* Notifications */}
        <button className="p-2 rounded-sm relative" style={{ color: "var(--gc-text-secondary)" }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--gc-gold)" }} />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)" }}>
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem { label: string; href: string; badge?: number; }
export interface NavSection { title: string; items: NavItem[]; }

const hcmsNav: NavSection[] = [
  { title: "PIPELINE", items: [{ label: "Overview", href: "/hcms" }, { label: "Contracting", href: "/hcms/contracting" }, { label: "Pipeline", href: "/hcms/pipeline" }] },
  { title: "AGENTS", items: [{ label: "Agent Directory", href: "/hcms/agents" }, { label: "Licensing", href: "/hcms/licensing" }, { label: "Carriers", href: "/hcms/carriers" }] },
  { title: "MANAGEMENT", items: [{ label: "Hierarchy", href: "/hcms/hierarchy" }, { label: "Compensation", href: "/hcms/compensation" }, { label: "Documents", href: "/hcms/documents" }] },
  { title: "COMPLIANCE", items: [{ label: "Compliance", href: "/hcms/compliance" }, { label: "Alerts", href: "/hcms/alerts" }] },
];

const opsNav: NavSection[] = [
  { title: "OVERVIEW", items: [{ label: "Dashboard", href: "/ops" }] },
  { title: "OPERATIONS", items: [{ label: "Production", href: "/ops/production" }, { label: "Deals", href: "/ops/deals" }, { label: "Pipeline", href: "/ops/pipeline" }, { label: "Finance", href: "/ops/finance" }] },
  { title: "INTELLIGENCE", items: [{ label: "Commissions", href: "/ops/commissions" }, { label: "Analytics", href: "/ops/analytics" }, { label: "Reporting", href: "/ops/reporting" }, { label: "Marketing", href: "/ops/marketing" }] },
  { title: "ADMIN", items: [{ label: "Investors", href: "/ops/investors" }, { label: "Compliance", href: "/ops/compliance" }, { label: "Settings", href: "/ops/settings" }] },
];

export interface GCSidebarProps { variant?: "hcms" | "ops"; activePath?: string; }

export function GCSidebar({ variant = "hcms", activePath = "" }: GCSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = variant === "hcms" ? hcmsNav : opsNav;

  const sidebar = (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--gc-sidebar)", borderRight: "1px solid var(--gc-border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="p-2" style={{ backgroundColor: "var(--gc-gold)", borderRadius: "0px" }}>
          <Shield className="w-4 h-4" style={{ color: "var(--gc-btn-primary-text)" }} />
        </div>
        <div className="flex flex-col">
          <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", fontWeight: 600, color: "var(--gc-text-primary)", letterSpacing: "var(--gc-tracking-tight)", lineHeight: 1 }}>GOLD COAST FINANCIAL</span>
          <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, marginTop: 2 }}>Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {nav.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="px-3 mb-2" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)" }}>
              {section.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = activePath === item.href || (item.href !== "/hcms" && item.href !== "/ops" && activePath.startsWith(item.href));
                return (
                  <a key={item.href} href={item.href}
                    className={cn("flex items-center gap-2 px-3 py-1.5 rounded-none", "no-underline")}
                    style={{
                      fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: active ? 500 : 400,
                      color: active ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
                      backgroundColor: active ? "var(--gc-nav-active-bg)" : "transparent",
                      transition: "background-color var(--gc-transition-fast), color var(--gc-transition-fast)",
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: active ? "var(--gc-gold)" : "var(--gc-text-muted)", opacity: active ? 1 : 0.4 }} />
                    <span className="truncate">{item.label}</span>
                    {item.badge != null && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-none" style={{ backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)", fontSize: "var(--gc-text-xs)", fontWeight: 600 }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 600 }}>G</div>
          <div className="flex flex-col min-w-0">
            <span className="truncate" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Administrator</span>
            <span className="truncate" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>admin@goldcoastfnl.com</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed top-[2px] left-0 bottom-0 w-[240px] z-40">{sidebar}</aside>
      {/* Mobile toggle */}
      <button className="lg:hidden fixed top-3 left-3 z-50 p-2" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "0px" }} onClick={() => setMobileOpen(true)}>
        <Menu className="w-5 h-5" style={{ color: "var(--gc-text-primary)" }} />
      </button>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[240px] h-full">{sidebar}</div>
          <button className="absolute top-3 right-3 p-2" style={{ color: "var(--gc-text-primary)" }} onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { Shield, Menu, X, LayoutDashboard, FileSignature, Kanban, Users, Award, Building2, GitBranch, DollarSign, FolderOpen, ShieldCheck, AlertTriangle, BarChart3, Handshake, GitPullRequest, TrendingUp, PieChart, FileText, Megaphone, Landmark, Settings, ChevronDown, ChevronRight, CreditCard, GraduationCap, Briefcase, HelpCircle, ScrollText, ShieldAlert, UserPlus, ArrowLeftRight, Banknote, RotateCcw, Receipt, FileCheck, Crown, Network, Rocket, Eye, Send, Coins, Sparkles, Mail } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface NavItem { label: string; href: string; icon: typeof Shield; badge?: number; }
export interface NavSection { title: string; items: NavItem[]; collapsible?: boolean; }

const hcmsNav: NavSection[] = [
  { title: "OVERVIEW", items: [
    { label: "Command Center", href: "/hcms", icon: LayoutDashboard },
  ]},
  { title: "CONTRACTING", collapsible: true, items: [
    { label: "Overview", href: "/hcms/contracting", icon: FileSignature },
    { label: "Requests", href: "/hcms/contracting/requests", icon: ScrollText },
    { label: "Bank Details", href: "/hcms/contracting/bank", icon: CreditCard },
    { label: "Licenses", href: "/hcms/contracting/licenses", icon: Award },
    { label: "E&O Insurance", href: "/hcms/contracting/eo", icon: ShieldAlert },
    { label: "Trainings", href: "/hcms/contracting/trainings", icon: GraduationCap },
    { label: "Employment", href: "/hcms/contracting/employment", icon: Briefcase },
    { label: "Doing Business As", href: "/hcms/contracting/dba", icon: Building2 },
    { label: "Questions", href: "/hcms/contracting/questions", icon: HelpCircle },
  ]},
  { title: "AGENTS", items: [
    { label: "Agent Directory", href: "/hcms/agents", icon: Users },
    { label: "Carriers", href: "/hcms/carriers", icon: Building2 },
  ]},
  { title: "ORGANIZATION", items: [
    { label: "Hierarchy", href: "/hcms/hierarchy", icon: GitBranch },
  ]},
];

const opsNav: NavSection[] = [
  { title: "OVERVIEW", items: [
    { label: "Dashboard", href: "/ops", icon: LayoutDashboard },
  ]},
  { title: "OPERATIONS", items: [
    { label: "Production", href: "/ops/production", icon: BarChart3 },
    { label: "Deals", href: "/ops/deals", icon: Handshake },
    { label: "Pipeline", href: "/ops/pipeline", icon: GitPullRequest },
  ]},
  { title: "INTELLIGENCE", items: [
    { label: "Commissions", href: "/ops/commissions", icon: DollarSign },
    { label: "Analytics", href: "/ops/analytics", icon: TrendingUp },
    { label: "Reporting", href: "/ops/reporting", icon: FileText },
  ]},
  { title: "ADMIN", items: [
    { label: "Compliance", href: "/ops/compliance", icon: ShieldCheck },
    { label: "Settings", href: "/ops/settings", icon: Settings },
  ]},
];

const financeNav: NavSection[] = [
  { title: "OVERVIEW", items: [
    { label: "Dashboard", href: "/finance", icon: LayoutDashboard },
  ]},
  { title: "FINANCIAL OPS", items: [
    { label: "Revenue", href: "/finance/revenue", icon: TrendingUp },
    { label: "Overrides", href: "/finance/overrides", icon: ArrowLeftRight },
    { label: "Transactions", href: "/finance/transactions", icon: CreditCard },
    { label: "Cash Flow", href: "/finance/cashflow", icon: Banknote },
  ]},
  { title: "COMPLIANCE", items: [
    { label: "Chargebacks", href: "/finance/chargebacks", icon: RotateCcw },
    { label: "Reconciliation", href: "/finance/reconciliation", icon: FileCheck },
    { label: "Statements", href: "/finance/statements", icon: Receipt },
  ]},
  { title: "REPORTING", items: [
    { label: "Reports", href: "/finance/reports", icon: FileText },
  ]},
];

const investorsNav: NavSection[] = [
  { title: "OVERVIEW", items: [
    { label: "Dashboard", href: "/investors/dashboard", icon: LayoutDashboard },
  ]},
  { title: "PORTFOLIO", items: [
    { label: "Portfolio", href: "/investors/portfolio", icon: Briefcase },
    { label: "Carrier Mix", href: "/investors/carriers", icon: PieChart },
  ]},
  { title: "PERFORMANCE", items: [
    { label: "Performance", href: "/investors/performance", icon: TrendingUp },
    { label: "Reports", href: "/investors/reports", icon: FileText },
  ]},
];

const marketingNav: NavSection[] = [
  { title: "OVERVIEW", items: [
    { label: "Dashboard", href: "/marketing", icon: LayoutDashboard },
  ]},
  { title: "CAMPAIGNS", items: [
    { label: "Campaigns", href: "/marketing/campaigns", icon: Megaphone },
    { label: "Leads", href: "/marketing/leads", icon: Users },
  ]},
  { title: "GROWTH", items: [
    { label: "Recruitment", href: "/marketing/recruitment", icon: UserPlus },
    { label: "Analytics", href: "/marketing/analytics", icon: TrendingUp },
  ]},
];

const agentNav: NavSection[] = [
  { title: "OVERVIEW", items: [
    { label: "My Dashboard", href: "/hcms/my/dashboard", icon: LayoutDashboard },
  ]},
  { title: "CONTRACTING", collapsible: true, items: [
    { label: "Overview", href: "/hcms/my/profile", icon: FileSignature },
    { label: "Documents", href: "/hcms/my/documents", icon: FolderOpen },
    { label: "Requests", href: "/hcms/my/requests", icon: ScrollText },
    { label: "Bank Details", href: "/hcms/my/bank", icon: CreditCard },
    { label: "Licenses", href: "/hcms/my/licenses", icon: Award },
    { label: "E&O Insurance", href: "/hcms/my/eo", icon: ShieldAlert },
    { label: "Trainings", href: "/hcms/my/trainings", icon: GraduationCap },
    { label: "Employment", href: "/hcms/my/employment", icon: Briefcase },
    { label: "Doing Business As", href: "/hcms/my/dba", icon: Building2 },
    { label: "Questions", href: "/hcms/my/questions", icon: HelpCircle },
  ]},
  { title: "AGENTS", items: [
    { label: "Carriers", href: "/hcms/my/carriers", icon: Building2 },
    { label: "Hierarchy", href: "/hcms/my/hierarchy", icon: GitBranch },
  ]},
];

const foundersNav: NavSection[] = [
  { title: "OVERSIGHT", items: [
    { label: "Dashboard", href: "/founders", icon: LayoutDashboard },
    { label: "Revenue", href: "/founders/revenue", icon: TrendingUp },
    { label: "Hierarchy", href: "/founders/hierarchy", icon: Network },
    { label: "Growth", href: "/founders/growth", icon: Rocket },
  ]},
  { title: "ORGANIZATION", items: [
    { label: "Book of Business", href: "/founders/book", icon: FolderOpen },
    { label: "Team Performance", href: "/founders/team-performance", icon: Users },
    { label: "Lead Distribution", href: "/founders/lead-distribution", icon: Send },
    { label: "Email Sequences", href: "/founders/sequences", icon: Mail },
    { label: "Agency Management", href: "/founders/agency-management", icon: Building2 },
  ]},
  { title: "OWNERSHIP", items: [
    { label: "Profit Split", href: "/founders/profit-split", icon: Coins },
  ]},
  { title: "ADMIN", items: [
    { label: "Access", href: "/founders/access", icon: Shield },
    { label: "View As", href: "/founders/view-as", icon: Eye },
    { label: "Settings", href: "/founders/settings", icon: Settings },
  ]},
  { title: "SYSTEM", items: [
    { label: "lifeOS Releases", href: "/founders/lifeos", icon: Sparkles },
  ]},
];

export type SidebarVariant = "hcms" | "ops" | "agent" | "finance" | "investors" | "marketing" | "founders";

const NAV_MAP: Record<SidebarVariant, NavSection[]> = {
  hcms: hcmsNav, ops: opsNav, agent: agentNav,
  finance: financeNav, investors: investorsNav, marketing: marketingNav,
  founders: foundersNav,
};

const SUBTITLE_MAP: Record<SidebarVariant, string> = {
  hcms: "HCMS Platform", ops: "Operations Hub", agent: "Agent HCMS",
  finance: "Finance", investors: "Investor Relations", marketing: "Marketing & Growth",
  founders: "Founders Lounge",
};

export interface GCSidebarProps { variant?: SidebarVariant; activePath?: string; userName?: string; userEmail?: string; }

export function GCSidebar({ variant = "hcms", activePath = "", userName, userEmail }: GCSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const nav = NAV_MAP[variant] || opsNav;

  const toggleSection = (title: string) => setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));

  const sidebar = (
    <div className="flex flex-col h-full" style={{
      backgroundColor: "var(--gc-sidebar)",
      borderRight: "1px solid var(--gc-border)",
    }}>
      {/* Logo Area */}
      <div style={{ height: 64, padding: "0 20px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--gc-border)" }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: "var(--gc-radius-md)",
            background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px color-mix(in srgb, var(--gc-gold) 30%, transparent)",
          }}>
            <Shield className="w-4.5 h-4.5" style={{ color: "var(--gc-btn-primary-text)" }} />
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5" style={{
              fontFamily: "var(--gc-font-display)", fontSize: "13px", fontWeight: 600,
              color: "var(--gc-text-primary)", letterSpacing: "var(--gc-tracking-tight)", lineHeight: 1.1,
            }}>
              GOLD COAST
              {variant === "founders" && (
                <Crown
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: "var(--gc-platinum, #D9D6D0)", opacity: 0.85 }}
                />
              )}
            </span>
            <span style={{
              fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500,
              color: "var(--gc-gold)", letterSpacing: "var(--gc-tracking-wider)",
              textTransform: "uppercase" as const, marginTop: 1,
            }}>{SUBTITLE_MAP[variant]}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ scrollbarWidth: "thin" }}>
        {nav.map((section, si) => {
          const isCollapsed = collapsed[section.title];
          return (
            <div key={section.title} style={{ marginBottom: si < nav.length - 1 ? "var(--gc-space-1)" : 0 }}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between"
                style={{
                  padding: "8px 20px 6px",
                  fontFamily: "var(--gc-font-body)", fontSize: "10px", fontWeight: 600,
                  letterSpacing: "0.12em", textTransform: "uppercase" as const,
                  color: "var(--gc-text-muted)", background: "none", border: "none",
                  cursor: "pointer", transition: "color var(--gc-transition-fast)",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--gc-text-secondary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--gc-text-muted)"}
              >
                <span>{section.title}</span>
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" style={{ opacity: 0.5 }} />}
              </button>

              {/* Section Items */}
              {!isCollapsed && (
                <div className="flex flex-col" style={{ padding: "2px 8px 0" }}>
                  {section.items.map((item) => {
                    const active = activePath === item.href;
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="no-underline flex items-center gap-3"
                        style={{
                          padding: "9px 12px",
                          borderRadius: "var(--gc-radius-md)",
                          fontFamily: "var(--gc-font-body)",
                          fontSize: "var(--gc-text-base)",
                          fontWeight: active ? 500 : 400,
                          color: active ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
                          backgroundColor: active ? "var(--gc-nav-active-bg)" : "transparent",
                          transition: "background-color var(--gc-transition-fast), color var(--gc-transition-fast)",
                          position: "relative" as const,
                          borderLeftWidth: 2,
                          borderLeftStyle: "solid" as const,
                          borderLeftColor: active ? "var(--gc-gold)" : "transparent",
                          borderTopWidth: 0,
                          borderRightWidth: 0,
                          borderBottomWidth: 0,
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)";
                            e.currentTarget.style.color = "var(--gc-text-primary)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--gc-text-secondary)";
                          }
                        }}
                      >
                        <ItemIcon className="w-4 h-4 flex-shrink-0" style={{
                          color: active ? "var(--gc-gold)" : "var(--gc-text-muted)",
                          opacity: active ? 1 : 0.6,
                          transition: "all var(--gc-transition-fast)",
                        }} />
                        <span className="truncate">{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                          <span className="ml-auto flex-shrink-0" style={{
                            minWidth: 20, height: 20, borderRadius: "var(--gc-radius-full)",
                            backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)",
                            fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 600,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "0 6px",
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Section Divider */}
              {si < nav.length - 1 && !isCollapsed && (
                <div style={{
                  margin: "8px 20px 4px",
                  height: 1,
                  background: "linear-gradient(90deg, var(--gc-border-subtle), transparent)",
                }} />
              )}
            </div>
          );
        })}
      </nav>

      {/* User Card */}
      <div style={{
        padding: "16px 16px",
        borderTop: "1px solid var(--gc-border)",
        background: "linear-gradient(180deg, transparent, color-mix(in srgb, var(--gc-gold) 3%, transparent))",
      }}>
        <div className="flex items-center gap-3" style={{
          padding: "10px 12px", borderRadius: "var(--gc-radius-md)",
          backgroundColor: "var(--gc-hover-overlay)",
          border: "1px solid var(--gc-border-subtle)",
          cursor: "pointer", transition: "border-color var(--gc-transition-fast)",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gc-border)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--gc-border-subtle)"}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
            background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
            color: "var(--gc-btn-primary-text)",
            fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-sm)", fontWeight: 600,
            boxShadow: "0 1px 4px color-mix(in srgb, var(--gc-gold) 25%, transparent)",
          }}>{(userName || "A").charAt(0).toUpperCase()}</div>
          <div className="flex flex-col min-w-0">
            <span className="truncate" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)", lineHeight: 1.2 }}>{userName || "Administrator"}</span>
            <span className="truncate" style={{ fontFamily: "var(--gc-font-body)", fontSize: "10px", color: "var(--gc-text-muted)", lineHeight: 1.2 }}>{userEmail || "admin@goldcoastfnl.com"}</span>
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
      <button className="lg:hidden fixed top-3 left-3 z-50 p-2" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }} onClick={() => setMobileOpen(true)}>
        <Menu className="w-5 h-5" style={{ color: "var(--gc-text-primary)" }} />
      </button>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[240px] h-full shadow-2xl">{sidebar}</div>
          <button className="absolute top-4 right-4 p-2" style={{ color: "var(--gc-text-primary)", backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-md)", border: "1px solid var(--gc-border)" }} onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
        </div>
      )}
    </>
  );
}

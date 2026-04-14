import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface Breadcrumb { label: string; href?: string; }
export interface GCPageHeaderProps { title: string; subtitle?: string; breadcrumbs?: Breadcrumb[]; actions?: ReactNode; accentUnderline?: boolean; }

export function GCPageHeader({ title, subtitle, breadcrumbs, actions, accentUnderline }: GCPageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-4" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              {b.href ? <a href={b.href} className="no-underline" style={{ color: "var(--gc-gold)", transition: "opacity var(--gc-transition-fast)" }}>{b.label}</a> : <span>{b.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", fontWeight: 600, color: "var(--gc-text-primary)", lineHeight: "var(--gc-leading-tight)", letterSpacing: "var(--gc-tracking-tight)", margin: 0 }}>{title}</h1>
          {subtitle && <p className="mt-1" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", margin: 0 }}>{subtitle}</p>}
          {accentUnderline && <div className="mt-3 h-[2px] w-16" style={{ background: "linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))" }} />}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

import { Moon, Sun, Palette, Bell, User } from "lucide-react";
import { useGCTheme, type GCThemeId } from "./GCThemeProvider";
import type { ReactNode } from "react";

const themeIcons: Record<GCThemeId, typeof Moon> = { "gc-dark": Moon, "gc-light": Sun, "gc-maroon": Palette };

export interface GCTopbarProps { title?: string; subtitle?: string; actions?: ReactNode; }

export function GCTopbar({ title, subtitle, actions }: GCTopbarProps) {
  const { theme, setTheme, themes } = useGCTheme();
  const cycle = () => { const i = themes.findIndex(t => t.id === theme); setTheme(themes[(i + 1) % themes.length].id); };
  const Icon = themeIcons[theme];

  return (
    <header className="sticky top-[2px] z-40 flex items-center justify-between h-16 px-6 gap-4"
      style={{ backgroundColor: "var(--gc-surface)", borderBottom: "1px solid var(--gc-border)" }}>
      <div className="flex flex-col min-w-0">
        {title && <h1 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", lineHeight: "var(--gc-leading-tight)", letterSpacing: "var(--gc-tracking-tight)" }}>{title}</h1>}
        {subtitle && <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button onClick={cycle} className="p-2 rounded-none" style={{ color: "var(--gc-text-secondary)", transition: "color var(--gc-transition-fast)" }}
          title={`Theme: ${themes.find(t => t.id === theme)?.label}`}><Icon className="w-4 h-4" /></button>
        <button className="p-2 rounded-none relative" style={{ color: "var(--gc-text-secondary)" }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--gc-gold)" }} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--gc-gold)", color: "var(--gc-btn-primary-text)" }}>
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

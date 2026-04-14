import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type GCThemeId = "gc-dark" | "gc-light" | "gc-maroon";

export interface GCThemeOption { id: GCThemeId; label: string; }
export interface GCThemeContextValue { theme: GCThemeId; setTheme: (t: GCThemeId) => void; themes: GCThemeOption[]; }

const KEY = "gc-theme";
const themes: GCThemeOption[] = [
  { id: "gc-dark", label: "Dark" },
  { id: "gc-light", label: "Light" },
  { id: "gc-maroon", label: "Maroon" },
];

const GCThemeContext = createContext<GCThemeContextValue | null>(null);

function isValid(v: unknown): v is GCThemeId { return v === "gc-dark" || v === "gc-light" || v === "gc-maroon"; }

function getInitial(): GCThemeId {
  try { const s = localStorage.getItem(KEY); if (isValid(s)) return s; } catch {}
  return "gc-dark";
}

export function GCThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setS] = useState<GCThemeId>(getInitial);
  const setTheme = useCallback((t: GCThemeId) => { setS(t); try { localStorage.setItem(KEY, t); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(KEY, theme); } catch {} }, [theme]);
  return <GCThemeContext.Provider value={{ theme, setTheme, themes }}>{children}</GCThemeContext.Provider>;
}

export function useGCTheme(): GCThemeContextValue {
  const ctx = useContext(GCThemeContext);
  if (!ctx) throw new Error("useGCTheme must be used within GCThemeProvider");
  return ctx;
}

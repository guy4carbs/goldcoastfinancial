import { useState, useCallback } from "react";

// Simple global state for view mode toggle (admin vs agent)
let globalMode: "admin" | "agent" = "admin";
const listeners = new Set<() => void>();

function notify() { listeners.forEach(fn => fn()); }

export function useViewMode() {
  const [, forceUpdate] = useState(0);

  // Subscribe to changes
  useState(() => {
    const update = () => forceUpdate(n => n + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  });

  const toggle = useCallback(() => {
    globalMode = globalMode === "admin" ? "agent" : "admin";
    // Navigate to the appropriate base path
    if (globalMode === "agent") {
      window.location.href = "/hcms/my/profile";
    } else {
      window.location.href = "/hcms";
    }
    notify();
  }, []);

  const setMode = useCallback((mode: "admin" | "agent") => {
    if (globalMode === mode) return;
    globalMode = mode;
    notify();
  }, []);

  return { mode: globalMode, toggle, setMode, isAgent: globalMode === "agent" };
}

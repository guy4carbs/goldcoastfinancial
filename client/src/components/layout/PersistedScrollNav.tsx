import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * Sidebar nav that survives layout remounts.
 *
 * Heritage's lounge layouts re-mount on every route change (each page wraps
 * itself in its own layout). In-memory refs/state therefore can't preserve
 * sidebar scroll position across navigation. This component persists scrollTop
 * to sessionStorage and restores it before paint via useLayoutEffect, so the
 * user lands back exactly where they scrolled — no flicker, no jump-to-top.
 */
const SIDEBAR_SCROLL_KEY = 'heritage-sidebar-scroll-y';

interface PersistedScrollNavProps {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  ariaLabel?: string;
}

export function PersistedScrollNav({
  className,
  style,
  children,
  ariaLabel,
}: PersistedScrollNavProps) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0);
    if (saved > 0) el.scrollTop = saved;
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (el) sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
  }, []);

  return (
    <nav
      ref={ref}
      className={className}
      style={style}
      onScroll={onScroll}
      aria-label={ariaLabel}
    >
      {children}
    </nav>
  );
}

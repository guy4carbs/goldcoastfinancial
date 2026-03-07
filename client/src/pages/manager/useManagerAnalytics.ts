import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface PageView {
  path: string;
  timestamp: number;
  duration: number; // seconds spent on previous page
}

const SESSION_KEY = 'manager-lounge-analytics';

function getSession(): PageView[] {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSession(views: PageView[]) {
  try {
    // Keep last 100 entries
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(views.slice(-100)));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function useManagerAnalytics() {
  const [location] = useLocation();
  const lastPathRef = useRef(location);
  const lastTimestampRef = useRef(Date.now());

  useEffect(() => {
    // Only track /manager/* routes
    if (!location.startsWith('/manager')) return;

    const now = Date.now();
    const duration = Math.round((now - lastTimestampRef.current) / 1000);

    // Record the previous page's duration
    if (lastPathRef.current !== location) {
      const views = getSession();
      views.push({
        path: location,
        timestamp: now,
        duration,
      });
      saveSession(views);
    }

    lastPathRef.current = location;
    lastTimestampRef.current = now;
  }, [location]);

  // Return analytics helpers
  return {
    getPageViews: getSession,
    getRecentlyVisited: (limit = 5): string[] => {
      const views = getSession();
      const seen = new Set<string>();
      const recent: string[] = [];
      for (let i = views.length - 1; i >= 0 && recent.length < limit; i--) {
        const path = views[i].path;
        if (!seen.has(path) && path !== location) {
          seen.add(path);
          recent.push(path);
        }
      }
      return recent;
    },
    getMostVisited: () => {
      const views = getSession();
      const counts: Record<string, number> = {};
      views.forEach(v => { counts[v.path] = (counts[v.path] || 0) + 1; });
      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([path, count]) => ({ path, count }));
    },
    getTotalViews: () => getSession().length,
    getAvgDuration: () => {
      const views = getSession();
      if (views.length === 0) return 0;
      const total = views.reduce((sum, v) => sum + v.duration, 0);
      return Math.round(total / views.length);
    },
  };
}

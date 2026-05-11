import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LIFEOS_VERSION, getRuntimeLifeOSVersion } from "@shared/lifeos";
import { triggerLifeOSUpdate } from "@/lib/lifeos-sw-register";
import { UpdateAvailableModal } from "./UpdateAvailableModal";
import { WhatsNewModal } from "./WhatsNewModal";

/**
 * Heritage's LifeOSUpdateProvider — same logic as Gold Coast's, just
 * using Heritage's auth context. Polls /api/lifeos/me/status every 60s,
 * decides whether to show UpdateAvailableModal vs WhatsNewModal, and
 * exposes useLifeOS() for the badge.
 */

const POLL_MS = 60_000;
const FIRST_POPUP_DELAY_MS = 5_000;
const WHATS_NEW_IDLE_MS = 800;
const SESSION_DISMISS_KEY = "lifeos.session_dismissed_releases";

interface LatestRelease {
  id: string;
  version: string;
  release_type: "major" | "minor" | "patch";
  title: string;
  summary: string;
  highlight_label: string | null;
  published_at: string | null;
  notes_viewed: boolean;
  dismissed_recently: boolean;
}

interface StatusResponse {
  deployed_version: string;
  your_version: string | null;
  update_available: boolean;
  latest_release: LatestRelease | null;
}

interface LifeOSContextValue {
  yourVersion: string;
  deployedVersion: string;
  updateAvailable: boolean;
  latestRelease: LatestRelease | null;
  openWhatsNew: () => void;
  applyUpdate: () => Promise<void>;
}

const LifeOSContext = createContext<LifeOSContextValue | null>(null);

export function useLifeOS(): LifeOSContextValue {
  const ctx = useContext(LifeOSContext);
  if (!ctx) {
    return {
      yourVersion: getRuntimeLifeOSVersion(),
      deployedVersion: getRuntimeLifeOSVersion(),
      updateAvailable: false,
      latestRelease: null,
      openWhatsNew: () => {},
      applyUpdate: async () => {},
    };
  }
  return ctx;
}

function getSessionDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_DISMISS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function addSessionDismissed(releaseId: string) {
  try {
    const cur = getSessionDismissed();
    cur.add(releaseId);
    sessionStorage.setItem(SESSION_DISMISS_KEY, JSON.stringify(Array.from(cur)));
  } catch {
    // ignore
  }
}

export function LifeOSUpdateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const yourVersion = getRuntimeLifeOSVersion();

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const firstPaintRef = useRef<number>(Date.now());
  const initialPopupShownRef = useRef<boolean>(false);
  const whatsNewShownRef = useRef<boolean>(false);

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(
        `/api/lifeos/me/status?client_version=${encodeURIComponent(yourVersion)}`,
        { credentials: "include" },
      );
      if (!r.ok) return;
      const data: StatusResponse = await r.json();
      setStatus(data);
    } catch {
      // ignore
    }
  }, [user, yourVersion]);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    fetchStatus();
    const id = window.setInterval(fetchStatus, POLL_MS);
    return () => window.clearInterval(id);
  }, [user, fetchStatus]);

  useEffect(() => {
    if (!status || !status.update_available || !status.latest_release) return;
    const dismissedThisSession = getSessionDismissed().has(status.latest_release.id);
    if (dismissedThisSession || status.latest_release.dismissed_recently) return;

    const elapsed = Date.now() - firstPaintRef.current;
    const delay = initialPopupShownRef.current ? 0 : Math.max(0, FIRST_POPUP_DELAY_MS - elapsed);
    const t = window.setTimeout(() => {
      setUpdateModalOpen(true);
      initialPopupShownRef.current = true;
      void fetch("/api/lifeos/me/ack", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: status.latest_release!.id, state: "update_available_seen" }),
      });
    }, delay);
    return () => window.clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (!status || status.update_available) return;
    if (whatsNewShownRef.current) return;
    const r = status.latest_release;
    if (!r || r.notes_viewed) return;
    const t = window.setTimeout(() => {
      setWhatsNewOpen(true);
      whatsNewShownRef.current = true;
    }, WHATS_NEW_IDLE_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  const openWhatsNew = useCallback(() => setWhatsNewOpen(true), []);

  const applyUpdate = useCallback(async () => {
    if (!status?.latest_release) {
      await triggerLifeOSUpdate();
      return;
    }
    try {
      await fetch("/api/lifeos/me/ack", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: status.latest_release.id, state: "updated" }),
      });
    } catch { /* ignore */ }
    // Strict bundle lock: wipe SW cache + reload onto the new bundle.
    await triggerLifeOSUpdate();
  }, [status]);

  const dismissUpdate = useCallback(async () => {
    if (!status?.latest_release) return;
    addSessionDismissed(status.latest_release.id);
    setUpdateModalOpen(false);
    try {
      await fetch("/api/lifeos/me/ack", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: status.latest_release.id, state: "dismissed" }),
      });
    } catch { /* ignore */ }
  }, [status]);

  const closeWhatsNew = useCallback(async () => {
    if (!status?.latest_release) {
      setWhatsNewOpen(false);
      return;
    }
    setWhatsNewOpen(false);
    try {
      await fetch("/api/lifeos/me/ack", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: status.latest_release.id, state: "notes_viewed" }),
      });
      setStatus((s) =>
        s && s.latest_release ? { ...s, latest_release: { ...s.latest_release, notes_viewed: true } } : s,
      );
    } catch { /* ignore */ }
  }, [status]);

  const value: LifeOSContextValue = useMemo(() => ({
    yourVersion,
    deployedVersion: status?.deployed_version ?? LIFEOS_VERSION,
    updateAvailable: !!status?.update_available,
    latestRelease: status?.latest_release ?? null,
    openWhatsNew,
    applyUpdate,
  }), [yourVersion, status, openWhatsNew, applyUpdate]);

  return (
    <LifeOSContext.Provider value={value}>
      {children}
      {updateModalOpen && status?.latest_release && (
        <UpdateAvailableModal
          release={status.latest_release}
          onUpdate={applyUpdate}
          onDismiss={dismissUpdate}
        />
      )}
      {whatsNewOpen && status?.latest_release && (
        <WhatsNewModal
          versionString={status.latest_release.version}
          onClose={closeWhatsNew}
        />
      )}
    </LifeOSContext.Provider>
  );
}

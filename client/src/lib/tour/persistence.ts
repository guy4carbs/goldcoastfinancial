import type { ResumePointer, TourPersistedState, TourRole } from "./types";
export type { ResumePointer };

const STORAGE_KEY = "hcms.tour.state.v1";

const defaultState: TourPersistedState = {
  completedTourIds: [],
  resume: null,
  firstLoginDismissed: { agent: false, admin: false, finance: false },
  lastSeenAt: 0,
};

function safeParse(raw: string | null): TourPersistedState {
  if (!raw) return { ...defaultState, firstLoginDismissed: { agent: false, admin: false, finance: false } };
  try {
    const parsed = JSON.parse(raw);
    return {
      completedTourIds: Array.isArray(parsed.completedTourIds) ? parsed.completedTourIds : [],
      resume:
        parsed.resume && typeof parsed.resume.tourId === "string"
          ? {
              tourId: parsed.resume.tourId,
              stepIndex: typeof parsed.resume.stepIndex === "number" ? parsed.resume.stepIndex : 0,
              savedAt: typeof parsed.resume.savedAt === "number" ? parsed.resume.savedAt : Date.now(),
              autoStart: Boolean(parsed.resume.autoStart),
            }
          : null,
      // Migration:
      //  - Legacy boolean → treat as all-roles dismissed (don't re-nag).
      //  - Pre-finance object → preserve agent/admin, default finance to false
      //    so existing users see the finance tour on their next /finance visit.
      firstLoginDismissed: (() => {
        const fld = parsed.firstLoginDismissed;
        if (fld && typeof fld === "object") {
          return {
            agent: Boolean(fld.agent),
            admin: Boolean(fld.admin),
            finance: Boolean(fld.finance),
          };
        }
        const legacy = Boolean(fld);
        return { agent: legacy, admin: legacy, finance: legacy };
      })(),
      lastSeenAt: typeof parsed.lastSeenAt === "number" ? parsed.lastSeenAt : 0,
    };
  } catch {
    return { ...defaultState, firstLoginDismissed: { agent: false, admin: false, finance: false } };
  }
}

/** Read the resume pointer but mark `autoStart` as consumed (set to false).
 *  Use this in the auto-start code path so a chain handoff only fires once. */
export function consumeAutoStart(): ResumePointer | null {
  const state = read();
  const r = state.resume;
  if (!r || !r.autoStart) return r;
  const consumed: ResumePointer = { ...r, autoStart: false };
  state.resume = consumed;
  write(state);
  return r; // return the ORIGINAL (with autoStart still true) so caller knows to fire
}

export function read(): TourPersistedState {
  if (typeof window === "undefined") return { ...defaultState };
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function write(next: TourPersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, lastSeenAt: Date.now() }));
  } catch {
    // storage full / private mode — fail silently; tour still functions per-session
  }
}

export function isComplete(tourId: string): boolean {
  return read().completedTourIds.includes(tourId);
}

export function markComplete(tourId: string): void {
  const state = read();
  if (!state.completedTourIds.includes(tourId)) {
    state.completedTourIds.push(tourId);
  }
  // Clear resume pointer if it matches this tour
  if (state.resume?.tourId === tourId) state.resume = null;
  write(state);
}

export function setResume(resume: ResumePointer | null): void {
  const state = read();
  state.resume = resume;
  write(state);
}

export function getResume(): ResumePointer | null {
  return read().resume;
}

export function clearResume(): void {
  setResume(null);
}

export function setFirstLoginDismissed(role: TourRole): void {
  const state = read();
  state.firstLoginDismissed = { ...state.firstLoginDismissed, [role]: true };
  write(state);
}

export function hasSeenFirstLogin(role: TourRole): boolean {
  return Boolean(read().firstLoginDismissed?.[role]);
}

export function resetAll(): void {
  write({ ...defaultState });
}

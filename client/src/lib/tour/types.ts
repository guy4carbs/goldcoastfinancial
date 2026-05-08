import type { DriveStep } from "driver.js";

export type TourRole = "agent" | "crm";

export interface TourStep extends DriveStep {
  section?: string;
}

export interface TourConfig {
  id: string;
  role: TourRole;
  page: string;
  label: string;
  steps: TourStep[];
  nextTourId?: string;
  nextCtaLabel?: string;
  /** When true, clicking the final "Done" button opens the completion
   *  celebration modal instead of just destroying the tour. Used for the
   *  last tour in a chain (e.g. hierarchy) to congratulate the agent. */
  celebrateOnFinish?: boolean;
}

export interface ResumePointer {
  tourId: string;
  stepIndex: number;
  savedAt: number;
  /** True only when a cross-page chain CTA set this pointer and expects the next
   *  page to auto-start the tour. User-progress saves (from onHighlightStarted)
   *  leave this false — the banner still shows, but resumeIfAny() won't auto-fire.
   *  Consumed (reset to false) by resumeIfAny the first time it auto-starts. */
  autoStart: boolean;
}

export interface TourPersistedState {
  completedTourIds: string[];
  resume: ResumePointer | null;
  /** Per-role first-login dismissal — independent auto-start for each
   *  lounge so a user who views both the agent lounge and the CRM gets
   *  one auto-start per role. */
  firstLoginDismissed: { agent: boolean; crm: boolean };
  lastSeenAt: number;
}

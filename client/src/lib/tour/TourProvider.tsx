import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { driver, type Driver, type Config as DriverConfig } from "driver.js";
import "driver.js/dist/driver.css";
import { useLocation } from "wouter";
import { getTour, getTourForRoute } from "./registry";
import * as persistence from "./persistence";
import type { TourConfig, TourRole } from "./types";

interface StartOptions {
  stepIndex?: number;
  section?: string;
}

interface TourContextValue {
  startTour: (tourId: string, opts?: StartOptions) => void;
  startTourForRoute: (role: TourRole) => void;
  stopTour: () => void;
  isComplete: (tourId: string) => boolean;
  markComplete: (tourId: string) => void;
  getResume: () => ReturnType<typeof persistence.getResume>;
  resumeIfAny: () => boolean;
  isActive: () => boolean;
  /** React state that flips to `config.id` when a tour is running and `null` when
   *  it's torn down. Components reading this value re-render on transitions —
   *  use this instead of `isActive()` when you need reactivity. */
  activeTourId: string | null;
  /** Bumps each time a tour is destroyed — lets downstream components re-read
   *  localStorage (e.g. to surface the resume banner the instant a user closes). */
  tourStoppedTick: number;
  /** The tour config whose completion celebration is currently open (null if none). */
  celebratingTour: TourConfig | null;
  /** Dismiss the celebration modal. */
  dismissCelebration: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

function getActiveHeritageTheme(): string {
  // Single Heritage theme for now — stub returns the canonical name so the
  // popover wrapper data-theme attribute is consistent if we later branch.
  return "heritage-light";
}

const BASE_CONFIG: Partial<DriverConfig> = {
  animate: true,
  smoothScroll: true,
  allowClose: true,
  overlayColor: "#000",
  overlayOpacity: 0.55,
  stagePadding: 10,
  stageRadius: 10,
  popoverOffset: 14,
  showProgress: true,
  progressText: "Step {{current}} of {{total}}",
  showButtons: ["next", "previous", "close"],
  // Let backdrop clicks advance — feels more like a presentation than a modal
  overlayClickBehavior: "nextStep",
  allowKeyboardControl: true,
  // Users can click highlighted CTAs during the tour (they remain interactive)
  disableActiveInteraction: false,
  popoverClass: "heritage-tour-popover",
  // driver.js appends popover to <body> — tag it with the active Heritage theme
  // so any future themed CSS rules can cascade to the popover wrapper.
  onPopoverRender: (popover) => {
    popover.wrapper.setAttribute("data-theme", getActiveHeritageTheme());
  },
  // Keep highlighted targets well within the viewport (not pinned to the top)
  onHighlighted: (el) => {
    if (!el || typeof (el as Element).scrollIntoView !== "function") return;
    try {
      (el as Element).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    } catch {
      // ignore — older browsers / detached nodes
    }
  },
};

export function TourProvider({ children }: { children: ReactNode }) {
  const driverRef = useRef<Driver | null>(null);
  const activeTourRef = useRef<TourConfig | null>(null);
  const [location, setLocation] = useLocation();
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [tourStoppedTick, setTourStoppedTick] = useState(0);
  const [celebratingTour, setCelebratingTour] = useState<TourConfig | null>(null);

  const destroyCurrent = useCallback(() => {
    const wasActive = driverRef.current !== null;
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch {
        // swallow — driver.js sometimes throws on double destroy
      }
      driverRef.current = null;
    }
    activeTourRef.current = null;
    if (wasActive) {
      setActiveTourId(null);
      setTourStoppedTick((n) => n + 1);
    }
  }, []);

  const buildSteps = useCallback(
    (config: TourConfig, section?: string) => {
      const steps = section
        ? config.steps.filter((s) => s.section === section)
        : config.steps;
      return steps.map((step, idx, arr) => {
        const isLast = idx === arr.length - 1;
        const hasChain = isLast && !!config.nextTourId;
        const shouldCelebrate = isLast && !!config.celebrateOnFinish && !hasChain;
        const popover = step.popover || {};

        const doneText = hasChain
          ? config.nextCtaLabel || "Continue →"
          : shouldCelebrate
          ? config.nextCtaLabel || "Finish"
          : popover.doneBtnText || "Done";

        // Build the last-step onNextClick handler for chain OR celebrate paths.
        let onNextClick: ((el: Element | undefined, s: unknown, ctx: { driver: Driver }) => void) | undefined;

        if (isLast && hasChain) {
          // If the step provides its own onNextClick (e.g. to pick a dynamic
          // route param), honor it and just do the bookkeeping. Otherwise fall
          // back to a default that navigates to nextConfig.page.
          const stepOverride = (popover as any).onNextClick as
            | ((el: Element | undefined, s: unknown, ctx: { driver: Driver }) => string | void | Promise<string | void>)
            | undefined;

          onNextClick = (el, step, ctx) => {
            const nextTourId = config.nextTourId!;
            persistence.markComplete(config.id);
            persistence.setResume({
              tourId: nextTourId,
              stepIndex: 0,
              savedAt: Date.now(),
              autoStart: true,
            });
            try {
              ctx.driver.destroy();
            } catch {
              // ignore
            }
            const nextConfig = getTour(nextTourId);

            // Step can return an override path to navigate to (e.g. a concrete
            // /agents/:id when nextConfig.page is a dynamic prefix).
            let overridePath: string | void | Promise<string | void> | undefined;
            if (stepOverride) {
              try {
                overridePath = stepOverride(el, step, ctx);
              } catch {
                // swallow — fall through to default nav
              }
            }

            const go = (path: string) => setTimeout(() => setLocation(path), 50);

            if (overridePath instanceof Promise) {
              overridePath.then((p) => go(typeof p === "string" && p.length > 0 ? p : nextConfig?.page || "/"));
            } else if (typeof overridePath === "string" && overridePath.length > 0) {
              go(overridePath);
            } else if (nextConfig) {
              go(nextConfig.page);
            }
          };
        } else if (isLast && shouldCelebrate) {
          onNextClick = (_el, _step, ctx) => {
            persistence.markComplete(config.id);
            persistence.clearResume();
            try {
              ctx.driver.destroy();
            } catch {
              // ignore
            }
            // Slight delay so the driver backdrop finishes fading before the
            // celebration overlay scales in — avoids a jarring double-fade.
            setTimeout(() => setCelebratingTour(config), 120);
          };
        }

        return {
          ...step,
          popover: {
            ...popover,
            doneBtnText: doneText,
            ...(onNextClick ? { onNextClick } : {}),
          },
        };
      });
    },
    [setLocation]
  );

  const startTour = useCallback(
    (tourId: string, opts: StartOptions = {}) => {
      const config = getTour(tourId);
      if (!config) {
        console.warn(`[tour] No tour registered for id: ${tourId}`);
        return;
      }

      destroyCurrent();

      const steps = buildSteps(config, opts.section);
      if (steps.length === 0) return;

      const instance = driver({
        ...BASE_CONFIG,
        steps,
        onHighlightStarted: (el, step, ctx) => {
          // Save progress for the resume banner — autoStart: false so closing
          // the tour doesn't immediately auto-restart it. The user has to click
          // the Resume button explicitly.
          persistence.setResume({
            tourId: config.id,
            stepIndex: ctx.state.activeIndex ?? 0,
            savedAt: Date.now(),
            autoStart: false,
          });
        },
        onCloseClick: () => {
          instance.destroy();
        },
        onDestroyed: () => {
          // Chain navigation is handled by the last step's onNextClick.
          // This just frees the refs + signals listeners (FAB, ResumeBanner) to re-render.
          activeTourRef.current = null;
          driverRef.current = null;
          setActiveTourId(null);
          setTourStoppedTick((n) => n + 1);
        },
      });

      driverRef.current = instance;
      activeTourRef.current = config;
      setActiveTourId(config.id);
      instance.drive(opts.stepIndex ?? 0);
    },
    [buildSteps, destroyCurrent, setLocation]
  );

  const startTourForRoute = useCallback(
    (role: TourRole) => {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
      const config = getTourForRoute(pathname, role);
      if (config) startTour(config.id);
    },
    [startTour]
  );

  const stopTour = useCallback(() => {
    destroyCurrent();
  }, [destroyCurrent]);

  const resumeIfAny = useCallback(() => {
    // consumeAutoStart atomically reads the pointer AND resets its autoStart flag,
    // so a chain handoff only auto-fires once — even if this effect re-runs.
    const resume = persistence.consumeAutoStart();
    if (!resume) return false;
    if (!resume.autoStart) return false; // user-progress pointer — banner only
    const config = getTour(resume.tourId);
    if (!config) {
      persistence.clearResume();
      return false;
    }
    // Only auto-resume if we're actually on the right page
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    if (!pathname.startsWith(config.page)) return false;
    startTour(resume.tourId, { stepIndex: resume.stepIndex });
    return true;
  }, [startTour]);

  useEffect(() => {
    return () => destroyCurrent();
  }, [destroyCurrent]);

  // If the user navigates away from the active tour's page mid-flight (back button,
  // sidebar click, etc.), tear down the driver so the FAB can reappear.
  useEffect(() => {
    const active = activeTourRef.current;
    if (!active) return;
    if (!location.startsWith(active.page)) {
      destroyCurrent();
    }
  }, [location, destroyCurrent]);

  const dismissCelebration = useCallback(() => setCelebratingTour(null), []);

  const value = useMemo<TourContextValue>(
    () => ({
      startTour,
      startTourForRoute,
      stopTour,
      isComplete: persistence.isComplete,
      markComplete: persistence.markComplete,
      getResume: persistence.getResume,
      resumeIfAny,
      isActive: () => driverRef.current !== null,
      activeTourId,
      tourStoppedTick,
      celebratingTour,
      dismissCelebration,
    }),
    [
      startTour,
      startTourForRoute,
      stopTour,
      resumeIfAny,
      activeTourId,
      tourStoppedTick,
      celebratingTour,
      dismissCelebration,
    ]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";

// Analytics event types
type AnalyticsEvent = {
  event: string;
  page?: string;
  element?: string;
  value?: string | number;
  timestamp: number;
};

// Simple in-memory analytics store (can be replaced with real analytics service)
const analyticsQueue: AnalyticsEvent[] = [];

function trackEvent(event: string, data?: Partial<Omit<AnalyticsEvent, "event" | "timestamp">>) {
  const analyticsEvent: AnalyticsEvent = {
    event,
    timestamp: Date.now(),
    ...data,
  };

  analyticsQueue.push(analyticsEvent);

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", analyticsEvent);
  }

  // In production, you would send to your analytics service here
  // Example: sendToAnalyticsService(analyticsEvent);
}

// Hook for tracking page views
export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    trackEvent("page_view", { page: location });
  }, [location]);
}

// Hook for tracking scroll depth
export function useScrollTracking() {
  const scrollDepthTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      // Track at 25%, 50%, 75%, 100% thresholds
      const thresholds = [25, 50, 75, 100];

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !scrollDepthTracked.current.has(threshold)) {
          scrollDepthTracked.current.add(threshold);
          trackEvent("scroll_depth", {
            page: window.location.pathname,
            value: threshold,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

// Hook for tracking user engagement time
export function useEngagementTracking() {
  const startTime = useRef(Date.now());
  const [location] = useLocation();

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const engagementTime = Math.round((Date.now() - startTime.current) / 1000);
      if (engagementTime > 5) {
        // Only track if user spent more than 5 seconds
        trackEvent("engagement_time", {
          page: location,
          value: engagementTime,
        });
      }
    };
  }, [location]);
}

// Main analytics hook with tracking functions
export function useAnalytics() {
  const [location] = useLocation();

  const trackCTAClicked = useCallback(
    (ctaName: string, section: string, destination?: string) => {
      trackEvent("cta_clicked", {
        page: location,
        element: ctaName,
        value: `${section}${destination ? ` -> ${destination}` : ""}`,
      });
    },
    [location]
  );

  const trackVideoPlayed = useCallback(
    (videoName: string, videoSrc?: string) => {
      trackEvent("video_played", {
        page: location,
        element: videoName,
        value: videoSrc,
      });
    },
    [location]
  );

  const trackFormSubmission = useCallback(
    (formName: string, success: boolean) => {
      trackEvent("form_submission", {
        page: location,
        element: formName,
        value: success ? "success" : "failed",
      });
    },
    [location]
  );

  const trackOutboundLink = useCallback(
    (url: string, linkText?: string) => {
      trackEvent("outbound_link", {
        page: location,
        element: linkText,
        value: url,
      });
    },
    [location]
  );

  const trackSectionView = useCallback(
    (sectionName: string) => {
      trackEvent("section_view", {
        page: location,
        element: sectionName,
      });
    },
    [location]
  );

  return {
    trackCTAClicked,
    trackVideoPlayed,
    trackFormSubmission,
    trackOutboundLink,
    trackSectionView,
  };
}

// Combined analytics provider hook
export function useFullAnalytics() {
  usePageTracking();
  useScrollTracking();
  useEngagementTracking();
  return useAnalytics();
}

// Export queue for debugging/testing
export function getAnalyticsQueue() {
  return [...analyticsQueue];
}

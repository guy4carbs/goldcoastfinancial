import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackEvent } from '@/lib/firebase';

// Analytics event types for type safety
export type AnalyticsEvent =
  // Page events
  | 'page_view'
  | 'scroll_depth'
  // Quote events
  | 'quote_page_viewed'
  | 'quote_form_started'
  | 'quote_form_step_completed'
  | 'quote_form_submitted'
  | 'quote_form_abandoned'
  // Contact events
  | 'contact_page_viewed'
  | 'contact_form_started'
  | 'contact_form_submitted'
  | 'contact_form_abandoned'
  // Product events
  | 'product_viewed'
  | 'product_cta_clicked'
  // Career events
  | 'careers_page_viewed'
  | 'job_application_started'
  | 'job_application_submitted'
  | 'job_application_abandoned'
  // CTA & engagement
  | 'cta_clicked'
  | 'phone_number_clicked'
  | 'email_clicked'
  | 'social_link_clicked'
  | 'external_link_clicked'
  | 'directions_clicked'
  // Content engagement
  | 'faq_expanded'
  | 'video_played'
  | 'video_completed'
  | 'calculator_used'
  | 'calculator_result_viewed'
  // Navigation
  | 'menu_opened'
  | 'menu_closed'
  | 'search_performed'
  // Agent portal
  | 'agent_login'
  | 'agent_logout'
  | 'agent_lead_viewed'
  | 'agent_lead_status_changed'
  | 'agent_pipeline_updated'
  | 'agent_quote_created'
  | 'agent_training_started'
  | 'agent_training_completed';

interface AnalyticsParams {
  [key: string]: string | number | boolean | undefined;
}

// Custom hook for analytics tracking
export function useAnalytics() {
  const [location] = useLocation();
  const scrollDepthsTracked = useRef<Set<number>>(new Set());

  // Track page views automatically on route change
  useEffect(() => {
    trackEvent('page_view', {
      page_path: location,
      page_title: document.title,
      timestamp: new Date().toISOString()
    });

    // Also send to our backend for internal tracking
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: location,
        title: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      })
    }).catch(() => {}); // Silent fail - don't break the app if analytics fails

    // Reset scroll depth tracking on page change
    scrollDepthsTracked.current = new Set();
  }, [location]);

  // Track custom events
  const track = useCallback((event: AnalyticsEvent, params?: AnalyticsParams) => {
    // Send to Firebase Analytics
    trackEvent(event, {
      ...params,
      timestamp: new Date().toISOString(),
      page_path: location
    });

    // Also send to our backend
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        params,
        page: location,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  }, [location]);

  // ============================================
  // QUOTE FORM TRACKING
  // ============================================
  const trackQuoteStarted = useCallback((coverageType?: string) => {
    track('quote_form_started', { coverage_type: coverageType });
  }, [track]);

  const trackQuoteStepCompleted = useCallback((step: number, stepName: string) => {
    track('quote_form_step_completed', { step, step_name: stepName });
  }, [track]);

  const trackQuoteSubmitted = useCallback((coverageType: string, coverageAmount: string, state: string) => {
    track('quote_form_submitted', {
      coverage_type: coverageType,
      coverage_amount: coverageAmount,
      state
    });
  }, [track]);

  const trackQuoteAbandoned = useCallback((step: number, coverageType?: string) => {
    track('quote_form_abandoned', { step, coverage_type: coverageType });
  }, [track]);

  // ============================================
  // CONTACT FORM TRACKING
  // ============================================
  const trackContactStarted = useCallback(() => {
    track('contact_form_started');
  }, [track]);

  const trackContactSubmitted = useCallback((subject?: string) => {
    track('contact_form_submitted', { subject });
  }, [track]);

  const trackContactAbandoned = useCallback((fieldsCompleted: number) => {
    track('contact_form_abandoned', { fields_completed: fieldsCompleted });
  }, [track]);

  // ============================================
  // PRODUCT PAGE TRACKING
  // ============================================
  const trackProductViewed = useCallback((productType: string, productName?: string) => {
    track('product_viewed', { product_type: productType, product_name: productName });
  }, [track]);

  const trackProductCTAClicked = useCallback((productType: string, ctaText: string) => {
    track('product_cta_clicked', { product_type: productType, cta_text: ctaText });
  }, [track]);

  // ============================================
  // CTA & BUTTON TRACKING
  // ============================================
  const trackCTAClicked = useCallback((ctaName: string, ctaLocation: string, destination?: string) => {
    track('cta_clicked', { cta_name: ctaName, cta_location: ctaLocation, destination });
  }, [track]);

  const trackPhoneClicked = useCallback((phoneNumber: string, location?: string) => {
    track('phone_number_clicked', { phone_number: phoneNumber, location });
  }, [track]);

  const trackEmailClicked = useCallback((email: string, location?: string) => {
    track('email_clicked', { email, location });
  }, [track]);

  const trackSocialClicked = useCallback((platform: string, profileUrl?: string) => {
    track('social_link_clicked', { platform, profile_url: profileUrl });
  }, [track]);

  const trackExternalLinkClicked = useCallback((linkType: string, url: string, location?: string) => {
    track('external_link_clicked', { link_type: linkType, url, location });
  }, [track]);

  const trackDirectionsClicked = useCallback((address: string) => {
    track('directions_clicked', { address });
  }, [track]);

  // ============================================
  // CONTENT ENGAGEMENT TRACKING
  // ============================================
  const trackVideoPlayed = useCallback((videoName: string, videoUrl?: string) => {
    track('video_played', { video_name: videoName, video_url: videoUrl });
  }, [track]);

  const trackVideoCompleted = useCallback((videoName: string, watchTime?: number) => {
    track('video_completed', { video_name: videoName, watch_time: watchTime });
  }, [track]);

  const trackFAQExpanded = useCallback((question: string, category?: string) => {
    track('faq_expanded', { question, category });
  }, [track]);

  const trackCalculatorUsed = useCallback((calculatorType: string, inputs?: Record<string, any>) => {
    track('calculator_used', { calculator_type: calculatorType, ...inputs });
  }, [track]);

  const trackCalculatorResultViewed = useCallback((calculatorType: string, result: string) => {
    track('calculator_result_viewed', { calculator_type: calculatorType, result });
  }, [track]);

  // ============================================
  // SCROLL DEPTH TRACKING
  // ============================================
  const trackScrollDepth = useCallback((depth: number) => {
    // Only track 25%, 50%, 75%, 100% milestones once per page
    const milestone = Math.floor(depth / 25) * 25;
    if (milestone > 0 && !scrollDepthsTracked.current.has(milestone)) {
      scrollDepthsTracked.current.add(milestone);
      track('scroll_depth', { depth: milestone });
    }
  }, [track]);

  // ============================================
  // CAREER/JOB APPLICATION TRACKING
  // ============================================
  const trackJobApplicationStarted = useCallback((position: string) => {
    track('job_application_started', { position });
  }, [track]);

  const trackJobApplicationSubmitted = useCallback((position: string) => {
    track('job_application_submitted', { position });
  }, [track]);

  const trackJobApplicationAbandoned = useCallback((position: string, fieldsCompleted: number) => {
    track('job_application_abandoned', { position, fields_completed: fieldsCompleted });
  }, [track]);

  // ============================================
  // NAVIGATION TRACKING
  // ============================================
  const trackMenuOpened = useCallback(() => {
    track('menu_opened');
  }, [track]);

  const trackMenuClosed = useCallback(() => {
    track('menu_closed');
  }, [track]);

  // ============================================
  // AGENT PORTAL TRACKING
  // ============================================
  const trackAgentLogin = useCallback((agentId?: string) => {
    track('agent_login', { agent_id: agentId });
  }, [track]);

  const trackAgentLogout = useCallback((agentId?: string) => {
    track('agent_logout', { agent_id: agentId });
  }, [track]);

  const trackAgentLeadViewed = useCallback((leadId: string, leadName?: string) => {
    track('agent_lead_viewed', { lead_id: leadId, lead_name: leadName });
  }, [track]);

  const trackAgentLeadStatusChanged = useCallback((leadId: string, oldStatus: string, newStatus: string) => {
    track('agent_lead_status_changed', { lead_id: leadId, old_status: oldStatus, new_status: newStatus });
  }, [track]);

  const trackAgentPipelineUpdated = useCallback((action: string, leadId?: string) => {
    track('agent_pipeline_updated', { action, lead_id: leadId });
  }, [track]);

  const trackAgentQuoteCreated = useCallback((coverageType: string, coverageAmount: string) => {
    track('agent_quote_created', { coverage_type: coverageType, coverage_amount: coverageAmount });
  }, [track]);

  const trackAgentTrainingStarted = useCallback((moduleName: string) => {
    track('agent_training_started', { module_name: moduleName });
  }, [track]);

  const trackAgentTrainingCompleted = useCallback((moduleName: string, score?: number) => {
    track('agent_training_completed', { module_name: moduleName, score });
  }, [track]);

  return {
    track,
    // Quote tracking
    trackQuoteStarted,
    trackQuoteStepCompleted,
    trackQuoteSubmitted,
    trackQuoteAbandoned,
    // Contact tracking
    trackContactStarted,
    trackContactSubmitted,
    trackContactAbandoned,
    // Product tracking
    trackProductViewed,
    trackProductCTAClicked,
    // CTA & button tracking
    trackCTAClicked,
    trackPhoneClicked,
    trackEmailClicked,
    trackSocialClicked,
    trackExternalLinkClicked,
    trackDirectionsClicked,
    // Content engagement
    trackVideoPlayed,
    trackVideoCompleted,
    trackFAQExpanded,
    trackCalculatorUsed,
    trackCalculatorResultViewed,
    // Scroll tracking
    trackScrollDepth,
    // Career tracking
    trackJobApplicationStarted,
    trackJobApplicationSubmitted,
    trackJobApplicationAbandoned,
    // Navigation
    trackMenuOpened,
    trackMenuClosed,
    // Agent portal
    trackAgentLogin,
    trackAgentLogout,
    trackAgentLeadViewed,
    trackAgentLeadStatusChanged,
    trackAgentPipelineUpdated,
    trackAgentQuoteCreated,
    trackAgentTrainingStarted,
    trackAgentTrainingCompleted,
  };
}

// Provider component that initializes analytics on app load
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics(); // Initialize tracking
  return <>{children}</>;
}

// ============================================
// TRACKING UTILITY COMPONENTS
// ============================================

// Tracked link component for CTAs
interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  ctaName: string;
  ctaLocation: string;
  children: React.ReactNode;
}

export function TrackedCTA({ ctaName, ctaLocation, children, onClick, ...props }: TrackedLinkProps) {
  const { trackCTAClicked } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackCTAClicked(ctaName, ctaLocation, props.href);
    onClick?.(e);
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}

// Tracked phone link
interface TrackedPhoneProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  phoneNumber: string;
  location?: string;
  children: React.ReactNode;
}

export function TrackedPhone({ phoneNumber, location: loc, children, onClick, ...props }: TrackedPhoneProps) {
  const { trackPhoneClicked } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackPhoneClicked(phoneNumber, loc);
    onClick?.(e);
  };

  return (
    <a href={`tel:${phoneNumber.replace(/\D/g, '')}`} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}

// Tracked video component hook
export function useVideoTracking(videoName: string, videoUrl?: string) {
  const { trackVideoPlayed, trackVideoCompleted } = useAnalytics();
  const startTime = useRef<number | null>(null);

  const onPlay = useCallback(() => {
    startTime.current = Date.now();
    trackVideoPlayed(videoName, videoUrl);
  }, [trackVideoPlayed, videoName, videoUrl]);

  const onEnded = useCallback(() => {
    const watchTime = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : undefined;
    trackVideoCompleted(videoName, watchTime);
  }, [trackVideoCompleted, videoName]);

  return { onPlay, onEnded };
}

// Scroll depth tracking hook
export function useScrollTracking() {
  const { trackScrollDepth } = useAnalytics();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        trackScrollDepth(scrollPercent);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);
}

// Form abandonment tracking hook
export function useFormAbandonmentTracking(
  formName: string,
  getFieldsCompleted: () => number,
  isSubmitted: React.MutableRefObject<boolean>
) {
  const { track } = useAnalytics();
  const hasStarted = useRef(false);

  const trackFormStarted = useCallback(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      track(`${formName}_started` as AnalyticsEvent);
    }
  }, [track, formName]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasStarted.current && !isSubmitted.current) {
        // Use sendBeacon for reliable tracking on page exit
        const data = JSON.stringify({
          event: `${formName}_abandoned`,
          params: { fields_completed: getFieldsCompleted() },
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        });
        navigator.sendBeacon('/api/analytics/event', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formName, getFieldsCompleted, isSubmitted]);

  return { trackFormStarted };
}

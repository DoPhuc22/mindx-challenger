// Google Analytics 4 helper functions

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

// Track user login
export const trackLogin = (method: string = "OpenID") => {
  trackEvent("login", { method });
};

// Track user logout
export const trackLogout = () => {
  trackEvent("logout");
};

// Track button clicks
export const trackButtonClick = (buttonName: string, section?: string) => {
  trackEvent("button_click", {
    button_name: buttonName,
    section: section || "general",
  });
};

// Track API calls
export const trackApiCall = (
  endpoint: string,
  success: boolean,
  duration?: number
) => {
  trackEvent("api_call", {
    endpoint,
    success,
    duration_ms: duration,
  });
};

// Track errors
export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent("error", {
    error_type: errorType,
    error_message: errorMessage,
  });
};

// Set user ID for tracking (after login)
export const setUserId = (userId: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-W0JQ0W6X0W", {
      user_id: userId,
    });
  }
};

// Track timing (for performance)
export const trackTiming = (
  category: string,
  variable: string,
  value: number
) => {
  trackEvent("timing_complete", {
    name: variable,
    value: value,
    event_category: category,
  });
};

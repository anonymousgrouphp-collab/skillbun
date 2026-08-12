/**
 * SkillBun Unified Analytics & Telemetry Engine
 * 
 * Safe, performance-focused telemetry layer. Dispatches events to configured
 * analytics providers (GA4, PostHog, Vercel Analytics) while providing zero-overhead
 * safe fallbacks when offline or ad-blockers are active.
 */

import posthog from 'posthog-js';

// Check if running on client
const isClient = typeof window !== 'undefined';

/**
 * Track custom product events
 * @param {string} eventName - e.g. 'quiz_completed', 'cert_earned'
 * @param {Object} [properties={}] - Event payload context
 */
export function trackEvent(eventName, properties = {}) {
  if (!isClient) return;

  const payload = {
    ...properties,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  // 1. Development Mode Logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SkillBun Analytics] 📊 ${eventName}`, payload);
  }

  try {
    // 2. Google Analytics (GA4)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }

    // 3. PostHog
    posthog.capture(eventName, payload);
  } catch (err) {
    // Fail silently so analytics never break core application flows
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SkillBun Analytics] Event dispatch error:', err);
    }
  }
}

/**
 * Track page view transitions
 * @param {string} url - Current page path
 */
export function trackPageView(url) {
  if (!isClient) return;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[SkillBun Analytics] 🌐 PageView: ${url}`);
  }

  try {
    // GA4 Page View — use 'event' for SPA transitions (initial config handled by GoogleAnalytics component)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
      });
    }

    // PostHog Page View
    posthog.capture('$pageview', { $current_url: window.location.origin + url });
  } catch (err) {
    // Silent catch
  }
}

/**
 * Identify authenticated user session
 * @param {string} userId - Firebase Auth UID
 * @param {Object} [traits={}] - User metadata (e.g. role, degree)
 */
export function identifyUser(userId, traits = {}) {
  if (!isClient || !userId) return;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[SkillBun Analytics] 👤 Identified User: ${userId}`, traits);
  }

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', { user_id: userId, ...traits });
    }
    posthog.identify(userId, traits);
  } catch (err) {
    // Silent catch
  }
}

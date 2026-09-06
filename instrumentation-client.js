import posthog from 'posthog-js'

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem('sb_consent_choice') === 'accepted'
  } catch {
    return false
  }
}

if (!projectToken) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is missing. PostHog events will not be captured.')
  }
} else if (!host) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_HOST is missing. PostHog events will not be captured.')
  }
} else {
  const consentGranted = hasAnalyticsConsent()

  posthog.init(projectToken, {
    api_host: host,
    defaults: '2026-01-30',
    capture_pageview: false, // Disabled — manual pageview tracking via AnalyticsTracker handles SPA route changes
    capture_exceptions: consentGranted,
    opt_out_capturing_by_default: !consentGranted,
    debug: process.env.NODE_ENV === 'development',
  })
}



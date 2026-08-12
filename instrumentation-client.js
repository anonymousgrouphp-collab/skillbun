import posthog from 'posthog-js'

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (!projectToken) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is missing. PostHog events will not be captured.')
  }
} else if (!host) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_HOST is missing. PostHog events will not be captured.')
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: '2026-01-30',
    capture_pageview: false, // Disabled — manual pageview tracking via AnalyticsTracker handles SPA route changes
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  })
}


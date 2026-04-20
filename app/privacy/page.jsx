export const metadata = {
  title: 'Privacy Policy – SkillBun',
  description: 'SkillBun privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="static-page">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: February 26, 2026</em></p>

      <h2>1. Information You Provide</h2>
      <p>
        During onboarding, SkillBun collects your name, email (via Google Sign-In), degree/program, and current year.
        This profile is used to personalize quiz and counsellor interactions.
      </p>

      <h2>2. Authentication</h2>
      <p>
        SkillBun uses Google OAuth via Supabase for secure authentication. We receive your name, email, and profile
        picture from Google. Your Google password is never shared with us.
      </p>

      <h2>3. Server-Side Profile Storage</h2>
      <p>
        Your profile is stored in a Supabase database with Row-Level Security (RLS) enabled — meaning only you can
        access your own data. Stored fields include name, email, degree, year, browser info, and device type for analytics.
      </p>

      <h2>4. AI Processing</h2>
      <p>
        Quiz responses and counsellor chat prompts are sent to the SkillBun backend, which forwards requests to the
        Google Gemini API to generate responses. Please avoid submitting sensitive personal data in free-text prompts.
      </p>

      <h2>5. Bot and Abuse Protection</h2>
      <p>
        We use human-verification controls, including Cloudflare Turnstile when enabled, and signed short-lived
        human-proof tokens to protect APIs from abuse.
      </p>

      <h2>6. Cookies and Tracking</h2>
      <p>
        SkillBun uses HTTP-only cookies for session management (Supabase auth). We do not run ad tracking pixels
        or third-party analytics trackers.
      </p>

      <h2>7. Data Retention and Deletion</h2>
      <p>
        You can log out anytime using the user menu. To request full data deletion from our database,
        contact us at the email below.
      </p>

      <h2>8. Security</h2>
      <p>
        We apply technical safeguards including request size limits, input validation, rate limiting, and security
        headers. All data is transmitted over HTTPS.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        This policy may be updated as features evolve. We will publish the latest version on this page with a revised date.
      </p>

      <h2>10. Contact</h2>
      <p>
        Privacy questions or deletion requests: <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
      </p>
    </div>
  );
}

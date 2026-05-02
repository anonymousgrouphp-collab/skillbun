export const metadata = {
  title: 'Privacy Policy – SkillBun',
  description: 'SkillBun privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="static-page">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: May 3, 2026</em></p>

      <h2>1. Information You Provide & Collection Purpose</h2>
      <p>
        SkillBun collects structured profile data during your onboarding process to maximize the relevancy of career recommendations. Utilizing Google Sign-In, we receive your name, email address, and profile picture. Direct inputs collect your current academic degree/program and year of study. We do not collect extraneous data that does not serve a direct platform purpose.
      </p>

      <h2>2. Infrastructure & Authentication</h2>
      <p>
        SkillBun leverages Google OAuth integrated via Supabase for entirely seamless and robust authentication. At no point do we intercept, store, or process your Google password. Your authentication state is handled entirely via secure, HTTP-only tokens.
      </p>

      <h2>3. Server-Side Persistence and RLS</h2>
      <p>
        All user profile information is stored on a designated PostgreSQL database managed by Supabase. We utilize strict Row-Level Security (RLS) meaning that database read/write policies strictly restrict access such that solely your authenticated user entity can read or modify your profile row. In addition to primary profile data, we log browser metadata and device type purely for operational analytics and platform stability.
      </p>

      <h2>4. Third-Party AI Data Processing</h2>
      <p>
        SkillBun's AI features—specifically the Adaptive Quiz and the Bun-Bot Counsellor—are powered by server-side connections to the Google Gemini API. Your quiz contexts and conversational inputs are transmitted securely to Google Cloud endpoints. We utilize Google's enterprise API layers which, as per standard enterprise agreements, do not utilize submitted payloads to essentially train their foundational models. However, users are strongly advised never to submit highly sensitive PII in the free-text fields.
      </p>

      <h2>5. Bot Mitigation and Abuse Controls</h2>
      <p>
        To preserve network integrity, SkillBun actively filters out automated scraping or malicious bot behaviors. We implement Cloudflare Turnstile, an invisible challenge framework, to ascertain legitimate human sessions. You may occasionally be subjected to Turnstile verifications or CAPTCHA loops when unusual traffic variations from your IP address are detected.
      </p>

      <h2>6. Ad-Free Tracking Protocol</h2>
      <p>
        SkillBun utilizes strictly necessary cookies utilized exclusively to anchor session management securely (facilitated by Supabase authentication frameworks). SkillBun completely rejects integrating ad tracking pixels, cross-site marketing cookies, and unconsented data telemetry trackers. Your data is not sold to advertising platforms or external brokers.
      </p>

      <h2>7. Data Retention and Account Deletion</h2>
      <p>
        We retain your data conditionally based on your continued platform usage. Should you decide to cease utilization of SkillBun's services, you may simply log out. To invoke full cessation of your data—requesting the hard deletion of your Supabase profile row and associated records from our architecture—please initiate an email to the address supplied below. We pledge to honor deletion requests promptly without unnecessary hindrance.
      </p>

      <h2>8. Technical Security</h2>
      <p>
        Protecting your data in transit is handled uniformly using modern TLS/HTTPS encryptions. On the server side, your account interacts through resilient application controls which include algorithmic request size limitations, stringent input sanitization, API rate-limiting thresholds, and mandatory security framing headers (e.g., CSP, HSTS).
      </p>

      <h2>9. Revisions to the Privacy Policy</h2>
      <p>
        As SkillBun evolves its capability stacks, our data-handling mechanics could potentially modulate. Any functional paradigm shifts pertaining to data storage or utilization will be formally documented here. Routine checks of this unified policy page are encouraged.
      </p>

      <h2>10. Contact Protocol</h2>
      <p>
        For inquiries connected to data sovereignty, structural clarification of this policy, or specific data-deletion operations, direct your correspondences to: <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
      </p>
    </div>
  );
}

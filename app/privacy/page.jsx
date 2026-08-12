export const metadata = {
  title: 'Privacy Policy – SkillBun',
  description: 'SkillBun privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="static-page">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: June 12, 2026</em></p>

      <p>
        At SkillBun, accessible from <a href="https://skillbun.tech" target="_blank" rel="noopener noreferrer">skillbun.tech</a> (and its subdomains), one of our main priorities is the privacy of our visitors and users. This Privacy Policy document outlines the types of information collected and recorded by SkillBun, how we use it, and the security measures we employ to keep your personal data safe.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information to provide better services and personalized career guidance to our users. The categories of information we collect include:
      </p>
      <ul>
        <li><strong>Account Information:</strong> When you register using Google Sign-In or email/password authentication, we receive your email address, display name, and profile picture URL via Firebase Authentication.</li>
        <li><strong>User Profile Data:</strong> During onboarding, you provide your academic degree/program, year of study, learning interests, and target tech roles.</li>
        <li><strong>Progress &amp; Quiz Responses:</strong> We store your answers to the adaptive career quiz, assessment scores, certification progress, and completed roadmap nodes.</li>
        <li><strong>System &amp; Interaction Logs:</strong> We log queries submitted to BunBot AI, session duration, and standard traffic data for security and performance optimization.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>
        SkillBun utilizes the collected data for the following essential purposes:
      </p>
      <ul>
        <li>To personalize your career recommendation outputs and build adaptive learning roadmaps.</li>
        <li>To power BunBot, providing contextually relevant study suggestions and curriculum breakdowns.</li>
        <li>To issue, verify, and display public certifications and academic achievements.</li>
        <li>To detect, prevent, and mitigate fraudulent activity, bot abuse, and scraping attempts.</li>
        <li>To send transactional emails (e.g., password reset requests) through our secure Zoho SMTP integration.</li>
      </ul>

      <h2>3. Data Processing &amp; Infrastructure</h2>
      <p>
        We leverage industry-leading cloud infrastructure to run our platform securely:
      </p>
      <ul>
        <li><strong>Authentication:</strong> Handled by Firebase Authentication. Your passwords are encrypted and managed directly by Google/Firebase; they are never accessible to SkillBun developers or servers.</li>
        <li><strong>Database Storage:</strong> Profile and learning progress data is persisted in Cloud Firestore. Security is enforced through granular Firestore Rules, ensuring that only you (the authenticated account holder) can read or modify your personal data.</li>
        <li><strong>AI Capabilities:</strong> The Adaptive Quiz and BunBot chat utilize server-side calls to the Google Gemini API. While we transmit prompt contexts securely, we use enterprise API layers which, under Google's data privacy policies, do not use submitted payloads to train their base models. However, you are advised not to submit highly sensitive PII in free-text fields.</li>
      </ul>

      <h2>4. Data Protection &amp; Encryption</h2>
      <p>
        We implement robust technical controls to protect your data. All communication is encrypted in transit using standard TLS/HTTPS protocols. For content security and anti-scraping enforcement, study guides are encrypted using the proprietary SkillBun Vault (SBV1) framework, which features multi-layered cryptographic checks (including HKDF key derivation, XOR scrambling, and AES-256-GCM authenticated encryption).
      </p>

      <h2>5. Bot Mitigation &amp; Cloudflare Turnstile</h2>
      <p>
        To defend against denial-of-service (DDoS) attacks, spam, and malicious bot activity, SkillBun integrates Cloudflare Turnstile. Turnstile is an invisible captcha/challenge mechanism that gathers browser environment indicators to verify human sessions. Interaction data collected during Turnstile checks is governed by Cloudflare’s privacy policy.
      </p>

      <h2>6. Cookies &amp; Tracking Protocols</h2>
      <p>
        SkillBun is committed to an ad-free user experience. We strictly enforce the following rules:
      </p>
      <ul>
        <li>We do not sell, rent, or trade your data to third-party ad brokers or marketing networks.</li>
        <li>We do not integrate tracking pixels or cross-site marketing cookies.</li>
        <li>We only use necessary cookies or local browser storage to persist your active session, Firebase auth token, theme preferences (light/dark mode via <code>sb_theme</code>), and temporary quiz state.</li>
      </ul>

      <h2>7. Data Sovereignty &amp; Deletion Rights</h2>
      <p>
        You have complete control over your personal data:
      </p>
      <ul>
        <li><strong>Self-Service Deletion:</strong> You can delete your account instantly through your Profile Settings page. This action permanently deletes your Firebase account authentication record, your Firestore profile document, and all associated roadmap progress details.</li>
        <li><strong>Manual Requests:</strong> If you wish to request manual deletion, verify what data we hold, or ask any privacy-related questions, you may email us at <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>.</li>
      </ul>

      <h2>8. Children's Privacy</h2>
      <p>
        SkillBun is designed for university and college technology students. We do not knowingly collect personal identifiable information from children under the age of 13. If you believe your child has provided us with personal information, please contact us immediately so we can take steps to remove it.
      </p>

      <h2>9. Revisions to this Privacy Policy</h2>
      <p>
        We may update this Privacy Policy periodically to reflect changes in our service offerings, security protocols, or legal requirements. The "Last updated" date at the top of this page will indicate when the latest revisions were made. Your continued use of the platform constitutes agreement to the updated policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have any questions, concerns, or legal inquiries regarding this Privacy Policy, please contact our data protection team at: <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
      </p>
    </div>
  );
}

export const metadata = {
  title: 'Terms of Use – SkillBun',
  description: 'SkillBun terms of use — rules for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="static-page">
      <h1>Terms of Use</h1>
      <p><em>Effective date: June 12, 2026</em></p>

      <h2>1. Acceptance of the Terms</h2>
      <p>
        By accessing, browsing, registering for, or using the services provided by SkillBun (collectively, the "Platform"), you agree to be bound by these Terms of Use ("Terms") and all applicable local, national, and international laws and regulations. If you do not agree to all of these Terms, you are prohibited from using or accessing the Platform.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        SkillBun is an AI-assisted career discovery and interactive educational ecosystem designed to guide tech students. The Platform provides users with tools such as adaptive career quizzes, custom technology roadmaps, progress tracking, peer-sharing assets, a verifiable certification system, and an AI career advisor ("BunBot").
      </p>

      <h2>3. Intellectual Property Rights &amp; License</h2>
      <p>
        Unless otherwise stated, all material on the Platform, including but not limited to the SkillBun wordmark, logos, "bunny" branding motifs, source code, UI/UX designs, algorithms, and aggregated roadmap schemas, is the exclusive intellectual property of Team SkillBun.
      </p>
      <ul>
        <li><strong>Creative Commons License:</strong> All learning content, including the 3,335 study guide documents available on the Platform, is protected under the <strong>Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0)</strong>. This means you may access the resources for personal, non-commercial education, but you may not alter, transform, or build upon the content, nor distribute or sell it for commercial gain.</li>
        <li><strong>Encrypted Vault Protection:</strong> Our study guides are protected by a proprietary multi-layer encryption standard called SkillBun Vault (SBV1). Any attempts to bypass, decrypt, extract, or redistribute this vaulted content without authorization will result in an immediate permanent ban and potential legal action.</li>
      </ul>

      <h2>4. User Accounts &amp; Registration</h2>
      <p>
        To access key features (like saving roadmap milestones, chatting with BunBot, and taking the certification exams), you must create an account. You can register using Google Sign-In or your email address, powered by Firebase Authentication.
      </p>
      <ul>
        <li>You agree to provide accurate, current, and complete profile information during the onboarding flow.</li>
        <li>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
        <li>SkillBun reserves the right to terminate accounts that are inactive, fraudulent, or involved in malicious activity.</li>
      </ul>

      <h2>5. Academic Integrity &amp; Certification Proctoring</h2>
      <p>
        SkillBun offers digital certificates to verify roadmap completion and knowledge mastery. To maintain the credibility and academic value of our certifications, the certification exam incorporates strict anti-cheating mechanisms:
      </p>
      <ul>
        <li>The proctored exam blocks text selection, right-click context menus, and window focus switching.</li>
        <li>The certification workspace features user-identifying watermarks (email, IP, timestamp) and LLM-refusal text overlays to deter external assistance.</li>
        <li><strong>Exam Attempt Rules:</strong> Users are restricted to 2 continuous exam attempts. Failing both triggers a mandatory 1-hour study cooldown. A maximum of 3 attempts is permitted per 24-hour window per roadmap.</li>
        <li>Any attempt to bypass the timer, spoof results, use automated scripts, or leverage external AI tools to solve the assessment constitutes a breach of these Terms and will result in the forfeiture of your certificates.</li>
      </ul>

      <h2>6. Acceptable Use Policy</h2>
      <p>
        When using SkillBun, you agree <strong>not</strong> to:
      </p>
      <ul>
        <li>Systematically scrape, crawl, download, or mine data, schemas, or study guide markdown files from the Platform.</li>
        <li>Circumvent or attempt to bypass security measures, Cloudflare Turnstile human-verification challenges, or rate limiters on AI services.</li>
        <li>Submit, upload, or transmit any offensive, defamatory, or unlawful material, or input highly sensitive personally identifiable information (PII) in AI prompt fields.</li>
        <li>DDoS, overload, or otherwise compromise the performance or availability of our servers.</li>
      </ul>

      <h2>7. Disclaimers &amp; Limitations of Liability</h2>
      <p>
        The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive to provide highly accurate roadmap structures and verified learning resources, Team SkillBun makes no warranties, expressed or implied, regarding:
      </p>
      <ul>
        <li>The absolute correctness, completion, or up-to-date nature of study guides, video playlists, or AI-generated recommendations.</li>
        <li>Guaranteed job placements, college admissions, internships, or financial outcomes.</li>
        <li>The accuracy of LLM outputs. Language models (like Gemini API) are subject to hallucinations, and responses from BunBot should be validated independently.</li>
      </ul>
      <p>
        To the maximum extent permitted by applicable law, Team SkillBun and its members shall not be liable for any indirect, incidental, special, or consequential damages (including, without limitation, loss of data, career opportunities, or tuition fees) arising out of your use of or inability to use the Platform.
      </p>

      <h2>8. Governing Law &amp; Jurisdiction</h2>
      <p>
        These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding relating to your access to, or use of, the Platform shall be instituted in a state or federal court located in New Delhi, Delhi, India, and you hereby consent to the personal jurisdiction of such courts.
      </p>

      <h2>9. Modifications to the Platform &amp; Terms</h2>
      <p>
        SkillBun is a dynamic project and will iterate over time. We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without notice. We may also revise these Terms from time to time. The date of the latest update will always be indicated in the "Effective date" section. Your continued use of the Platform after changes are posted constitutes acceptance of the new Terms.
      </p>

      <h2>10. Contact Information</h2>
      <p>
        For any questions regarding these Terms of Use, intellectual property permissions, or feedback, please contact us at: <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
      </p>
    </div>
  );
}

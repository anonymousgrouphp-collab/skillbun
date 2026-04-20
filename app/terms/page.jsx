export const metadata = {
  title: 'Terms of Use – SkillBun',
  description: 'SkillBun terms of use — rules for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="static-page">
      <h1>Terms of Use</h1>
      <p><em>Effective date: February 26, 2026</em></p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using SkillBun, you agree to these Terms of Use. If you do not agree, please do not use the platform.
      </p>

      <h2>2. Service Description</h2>
      <p>
        SkillBun provides AI-assisted career guidance tools, including profile onboarding, adaptive quiz
        recommendations, an AI counsellor chat (Bun-Bot), and interactive learning roadmaps.
      </p>

      <h2>3. Educational Use and No Guarantee</h2>
      <p>
        Outputs are for educational and informational use only. AI responses can be incomplete or incorrect. SkillBun
        does not guarantee admissions, placements, internship offers, or salary outcomes.
      </p>

      <h2>4. User Responsibilities</h2>
      <p>
        You agree to provide accurate profile information and to use the platform lawfully. You must not abuse,
        reverse-engineer, disrupt, overload, or attempt unauthorized access to SkillBun services.
      </p>

      <h2>5. Security and Abuse Controls</h2>
      <p>
        We use controls such as rate limits, content validation, and human-verification checks (including CAPTCHA
        when enabled). Repeated misuse may result in temporary or permanent access restrictions.
      </p>

      <h2>6. Third-Party Services</h2>
      <p>
        SkillBun relies on third-party providers such as Google Gemini (AI processing), Google OAuth (authentication),
        Cloudflare Turnstile (bot checks), and Supabase (database). Their availability and policies are outside
        SkillBun's control.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The platform code, branding, and content are owned by SkillBun or respective licensors. You may use the
        platform for personal educational use but may not copy, resell, or redistribute substantial parts without
        permission.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        SkillBun is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, express or implied.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, SkillBun is not liable for indirect, incidental, special,
        consequential, or reliance damages resulting from your use of the platform.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use after updates means you accept the revised terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        For terms-related questions, contact: <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
      </p>
    </div>
  );
}

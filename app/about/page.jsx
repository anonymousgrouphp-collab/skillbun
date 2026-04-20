export const metadata = {
  title: 'About Us – SkillBun',
  description: 'Learn about SkillBun, our mission, and the team behind the platform.',
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <h1>About SkillBun</h1>
      <p><em>Last updated: February 26, 2026</em></p>

      <p>
        SkillBun helps BCA, BSc, BS/BS-MS (AICS/CSDA), and B.Tech students discover practical tech career paths.
        We built it to reduce career confusion and convert guidance into concrete next steps.
      </p>

      <h2>What We Built</h2>
      <p>
        The platform includes profile onboarding, an adaptive AI quiz, an AI counsellor chat (Bun-Bot), and
        career recommendations with interactive roadmaps. Students can explore possible roles, compare paths, and continue
        learning through suggested next actions.
      </p>

      <h2>How We Operate</h2>
      <p>
        We use AI to generate personalized guidance while applying technical safeguards such as request validation,
        rate limiting, and human-verification controls. Profile data is securely stored in a Supabase-backed database
        with row-level security to ensure privacy.
      </p>

      <h2>Our Mission</h2>
      <p>
        Our mission is simple: make career direction clearer, faster, and more actionable for Indian tech students —
        without paywalls or unnecessary complexity.
      </p>

      <h2>Team</h2>
      <p>
        Developed by Team SkillBun (5 IITians) as a capstone project: <strong>Harsh, Rainee, Ravi, Harshit, and Aiman</strong>.
      </p>
      <p>
        Contact us at <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
      </p>
    </div>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'About Us – SkillBun',
  description: 'Learn about SkillBun, our mission, and the team behind the platform.',
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <h1>About SkillBun</h1>
      <p><em>Last updated: May 3, 2026</em></p>

      <p>
        SkillBun is an AI-powered career discovery platform exclusively designed for Indian tech students pursuing BCA, BSc, BS/BS-MS (AICS/CSDA), and B.Tech degrees.
        We built this platform to bridge the gap between academic curricula and industry demands, reducing career confusion and converting abstract guidance into concrete, executable next steps.
      </p>

      <h2>The Problem We're Solving</h2>
      <p>
        The technology landscape evolves faster than university syllabi. Students often find themselves overwhelmed by the sheer volume of choices—from Data Science and Full-Stack Development to Cloud Architecture and Cybersecurity.
        Without personalized mentorship, it is easy to invest time in outdated tech stacks or misaligned career paths. SkillBun provides that missing personalized, data-driven mentorship layer at scale.
      </p>

      <h2>What We Built</h2>
      <p>
        Our ecosystem revolves around four core capabilities designed to provide a continuous, adaptive learning journey:
      </p>
      <ul>
        <li><strong>Holistic Profile Onboarding:</strong> We capture your academic background, current year, and foundational interests to baseline your guidance.</li>
        <li><strong>Adaptive AI Quiz Engine:</strong> A dynamic assessment that adjusts to your responses in real-time, pinpointing your theoretical strengths, practical gaps, and latent affinities.</li>
        <li><strong>Interactive Roadmaps:</strong> High-fidelity, granular career trees (e.g., AI/ML Engineer, DevOps, Frontend) that visually demonstrate exactly what skills to learn, and in what order.</li>
        <li><strong>Bun-Bot (AI Counsellor):</strong> An integrated, context-aware AI chatbot that remembers your profile and quiz results to answer specific career queries and unstuck you during your roadmap journey.</li>
      </ul>

      <h2>Our Technology & Ethics</h2>
      <p>
        We believe in transparent, secure infrastructure. SkillBun leverages advanced LLMs (Google Gemini) strictly for personalized guidance, orchestrated through robust validation pipelines.
        We enforce rigorous technical safeguards including rate limiting, human-verification controls (Cloudflare Turnstile), and secure data isolation. Profile and roadmap-progress data are stored in Cloud Firestore with Firebase security rules that restrict each user to their own documents.
      </p>

      <h2>Our Mission</h2>
      <p>
        Our core mission is straightforward: to make career direction clearer, faster, and more actionable for the next generation of Indian technologists—without hiding essential guidance behind paywalls, intrusive advertisements, or unnecessary complexity.
      </p>

      <h2>Team</h2>
      <p>
        Reish manages this project with the active guidance and contribution of multiple IITians.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/contact" className="cta-button" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: 'var(--brand-color, #22c55e)', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Contact Us
        </Link>
      </div>
    </div>
  );
}

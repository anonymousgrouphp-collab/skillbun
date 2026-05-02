import './contact.css';

export const metadata = {
  title: 'Contact Us – SkillBun',
  description: 'Get in touch with the SkillBun team for support, feedback, or inquiries.',
};

export default function ContactPage() {
  return (
    <div className="contact-wrapper">
      <div className="bg-grid-overlay"></div>

      {/* Floating Tech Elements */}
      <div className="floater-contact float-1" aria-hidden="true">{'<Connect />'}</div>
      <div className="floater-contact float-2" aria-hidden="true">{'{ status: 200 }'}</div>
      <div className="floater-contact float-3" aria-hidden="true">{'await response'}</div>

      <div className="contact-container">
        <div className="contact-hero">
          <span className="glow-badge">SYSTEM.ONLINE</span>
          <h1>Let's stay connected</h1>
          <p>
            Have a question, feedback, or need help with your career roadmap? We're here to support you.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card glass-panel">
            <div className="contact-card-icon">💬</div>
            <h3>General Support</h3>
            <p>Questions about the platform, feedback, or feature requests.</p>
            <a href="mailto:rainee@skillbun.tech" className="contact-button">Email Rainee</a>
          </div>

          <div className="contact-card glass-panel">
            <div className="contact-card-icon">🚀</div>
            <h3>Partnerships</h3>
            <p>For collaborations, escalations, or business inquiries.</p>
            <a href="mailto:harsh@skillbun.tech" className="contact-button">Email Harsh</a>
          </div>
        </div>

        <div className="social-section glass-panel">
          <h2>Follow Our Journey</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Connect with us on our official channels to stay updated on the latest AI career tools.
          </p>
          <div className="social-links">
            <a href="https://www.instagram.com/skillbun.tech/" target="_blank" rel="noopener noreferrer" className="social-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.2" />
              </svg>
              Instagram
            </a>
            <a href="https://www.linkedin.com/company/skillbun-tech/" target="_blank" rel="noopener noreferrer" className="social-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
            <a href="https://www.youtube.com/@TeamCosmic-d4e" target="_blank" rel="noopener noreferrer" className="social-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
              </svg>
              YouTube
            </a>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>

          <details className="faq-item glass-panel">
            <summary>How does the AI career quiz work?</summary>
            <p>
              Our quiz engine adapts to your responses in real-time to analyze your interests, skills, and strengths, providing personalized career recommendations.
            </p>
          </details>

          <details className="faq-item glass-panel">
            <summary>Are the career roadmaps free?</summary>
            <p>
              Yes, our interactive career roadmaps and profiling tools are designed for students and are completely free to use.
            </p>
          </details>

          <details className="faq-item glass-panel">
            <summary>How do I talk to the Bun-Bot counsellor?</summary>
            <p>
              Once you complete the quiz and select a career roadmap, Bun-Bot will be available directly on your roadmap page to answer specific questions and guide your next steps.
            </p>
          </details>

          <details className="faq-item glass-panel">
            <summary>How can I track my progress?</summary>
            <p>
              Your progress is automatically saved to your profile. You can view your completed roadmap nodes and revisit your quiz recommendations at any time by logging into your account.
            </p>
          </details>

          <details className="faq-item glass-panel">
            <summary>Can I retake the career quiz?</summary>
            <p>
              Absolutely! You can always retake the quiz if your interests have shifted or if you want to explore different career paths.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

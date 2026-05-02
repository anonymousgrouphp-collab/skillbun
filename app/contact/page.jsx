export const metadata = {
  title: 'Contact Us – SkillBun',
  description: 'Get in touch with the SkillBun team for support, feedback, or inquiries.',
};

export default function ContactPage() {
  return (
    <div className="static-page">
      <h1>Contact Us</h1>
      
      <p>
        Have a question, feedback, or need help with your career roadmap? We're here to support you.
      </p>

      <h2>Get in Touch</h2>
      <p>
        The best way to reach us is via email. We aim to respond to all student inquiries within 24-48 hours.
      </p>
      <ul>
        <li>
          📧 <strong>General Inquiries & Support:</strong> <a href="mailto:rainee@skillbun.tech">rainee@skillbun.tech</a>
        </li>
        <li>
          ⚠️ <strong>Escalations & Partnerships:</strong> <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>
        </li>
      </ul>

      <h2>Social Media</h2>
      <p>
        You can also follow us or send us a message on our official social channels:
      </p>
      <ul>
        <li><a href="https://www.instagram.com/skillbun.tech/" target="_blank" rel="noopener noreferrer">Instagram (@skillbun.tech)</a></li>
        <li><a href="https://www.linkedin.com/company/skillbun-tech/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a href="https://www.youtube.com/@TeamCosmic-d4e" target="_blank" rel="noopener noreferrer">YouTube</a></li>
      </ul>

      <h2>Support & Feedback</h2>
      <p>
        If you encounter any bugs, have feature requests, or want to share your success story, please don't hesitate to reach out. SkillBun is built for students, and your feedback helps us improve the platform.
      </p>
    </div>
  );
}

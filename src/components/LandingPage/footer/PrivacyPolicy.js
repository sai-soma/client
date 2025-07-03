import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import './PrivacyPolicy.css';

const sectionsData = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <>
        <p>
          At <strong>Refer & Earn</strong>, your privacy is our top priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    content: (
      <>
        <p>We collect information that you voluntarily provide to us and data automatically collected when you use our services, including:</p>
        <table className="PP-table" aria-label="Data types collected">
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Purpose</th>
              <th>Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Personal Identifiers (name, email)</td>
              <td>Account creation, communication</td>
              <td>Until account deletion</td>
            </tr>
            <tr>
              <td>Usage Data (IP address, device info)</td>
              <td>Improve platform performance</td>
              <td>6 months</td>
            </tr>
            <tr>
              <td>Referral Data</td>
              <td>Track referrals and rewards</td>
              <td>Until referral is resolved</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    content: (
      <ul>
        <li>To provide, operate, and maintain our services.</li>
        <li>To personalize your experience and improve our platform.</li>
        <li>To communicate with you, including service updates and promotions.</li>
        <li>To comply with legal obligations and prevent fraud.</li>
      </ul>
    ),
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing and Disclosure',
    content: (
      <p>
        We do not sell or rent your personal information. We may share your information with trusted third-party service providers who assist us in operating our platform, provided they agree to keep your data confidential.
        We may also disclose information if required by law or to protect our rights.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security of Your Information',
    content: (
      <p>
        We use industry-standard encryption and security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
        However, no online transmission is 100% secure, so please use caution.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    content: (
      <ul>
        <li>You have the right to access, update, or delete your personal data.</li>
        <li>You may opt-out of marketing communications at any time.</li>
        <li>You can request data portability and restriction of processing.</li>
        <li>To exercise these rights, please contact us at <a href="mailto:privacy@referandearn.com">privacy@referandearn.com</a>.</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking Technologies',
    content: (
      <p>
        We use cookies and similar tracking technologies to enhance your experience. You can manage cookie preferences through your browser settings.
        For more information, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">All About Cookies</a>.
      </p>
    ),
  },
  {
    id: 'changes-to-policy',
    title: 'Changes to This Privacy Policy',
    content: (
      <p>
        We may update this Privacy Policy periodically. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date below.
        We encourage you to review this policy regularly.
      </p>
    ),
  },
  {
    id: 'contact-us',
    title: 'Contact Us',
    content: (
      <p>
        If you have any questions or concerns about this Privacy Policy, please contact us at:<br />
        <a href="mailto:privacy@referandearn.com">privacy@referandearn.com</a><br />
        or<br />
        Refer & Earn Support Team<br />
        Contact us: <a href="mailto:privacy@referandearn.com">supportteam@referandearn.com</a><br />
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="PP-container" role="main" aria-label="Privacy Policy">
      <button className="privacy-home-btn" onClick={() => navigate('/')}>
        <Home size={20} />
        Home
      </button>
      <div className="PP-content">
        <h1 className="PP-title">Privacy Policy</h1>
        {sectionsData.map(({ id, title, content }) => (
          <section key={id} className="PP-section">
            <button
              className="PP-section-toggle"
              aria-expanded={!!expandedSections[id]}
              aria-controls={`${id}-content`}
              id={`${id}-header`}
              onClick={() => toggleSection(id)}
            >
              {title}
              <span className={`PP-arrow ${expandedSections[id] ? 'expanded' : ''}`} aria-hidden="true">▸</span>
            </button>
            <div
              id={`${id}-content`}
              className={`PP-section-content ${expandedSections[id] ? 'expanded' : 'collapsed'}`}
              role="region"
              aria-labelledby={`${id}-header`}
            >
              {content}
            </div>
          </section>
        ))}

        <div className="PP-footer">
          <p>By using our platform, you agree to this Privacy Policy.</p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;

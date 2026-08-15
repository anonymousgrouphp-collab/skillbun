'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Cinzel, Pixelify_Sans } from 'next/font/google';
import styles from './certificate.module.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

function LinkedInIcon() {
  return (
    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export default function CertificatePage() {
  const params = useParams();
  const id = params.id;

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [customPostText, setCustomPostText] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-dismiss toast notification after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!id) return;

    const fetchCertificate = async () => {
      const services = getFirebaseServices();
      if (!services.configured) {
        setError('Database connection is not configured.');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(services.db, 'certificates', id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          let date = new Date();
          if (data.createdAt?.toDate) {
            date = data.createdAt.toDate();
          } else if (data.createdAt) {
            date = new Date(data.createdAt);
          }
          const loadedCert = {
            id: snapshot.id,
            ...data,
            createdAtDate: date,
          };
          setCert(loadedCert);

          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skillbun.tech';
          const certUrl = `${baseUrl}/certificate/${snapshot.id}`;
          const certType = (data.cert_type || 'ROADMAP').toUpperCase();
          const title = data.stream_or_track || data.roadmapTitle || 'Professional Track';

          if (certType === 'INTERNSHIP') {
            setCustomPostText(`I'm excited to share that I have earned the Verified Certificate of Internship in ${title} at @SkillBun! 🚀\n\nVerify my credential here: ${certUrl}`);
          } else if (certType === 'TRAINING') {
            setCustomPostText(`I'm excited to share that I have completed the Professional Training in ${title} on @SkillBun! 🚀\n\nVerify my credential here: ${certUrl}`);
          } else if (certType === 'LOR') {
            setCustomPostText(`I am honoured to share my Official Letter of Recommendation from @SkillBun! 🌟\n\nVerify here: ${certUrl}`);
          } else {
            setCustomPostText(`I'm excited to share that I have completed the ${data.roadmapTitle || 'Roadmap'} Certification on @SkillBun! 🚀\n\nVerify my credential here: ${certUrl}`);
          }
        } else {
          setError('Certificate not found. Verify the ID is correct.');
        }
      } catch (err) {
        console.error('Failed to load certificate:', err);
        setError('Error loading certificate details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getCertUrl = () => {
    if (!cert) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skillbun.tech';
    return `${baseUrl}/certificate/${cert.id}`;
  };

  const certType = (cert?.cert_type || 'ROADMAP').toUpperCase();

  const getBadgeMeta = () => {
    switch (certType) {
      case 'INTERNSHIP':
        return { icon: '📋', label: 'Verified Certificate of Internship' };
      case 'TRAINING':
        return { icon: '🏅', label: 'Verified Certificate of Training' };
      case 'LOR':
        return { icon: '✉️', label: 'Official Letter of Recommendation' };
      case 'ROADMAP':
      default:
        return { icon: '🎓', label: 'Career Roadmap Certification' };
    }
  };

  const getLinkedInAddProfileUrl = () => {
    if (!cert) return '#';

    const certUrl = getCertUrl();
    const orgId = process.env.NEXT_PUBLIC_LINKEDIN_ORGANIZATION_ID;
    let name = `${cert.roadmapTitle || 'Career Roadmap'} Certification`;
    if (certType === 'INTERNSHIP') {
      name = `Internship Certificate - ${cert.stream_or_track || cert.department || 'Engineering'}`;
    } else if (certType === 'TRAINING') {
      name = `Training Certificate - ${cert.stream_or_track || 'Technical Track'}`;
    }

    const params = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: name,
      issueYear: cert.createdAtDate.getFullYear().toString(),
      issueMonth: (cert.createdAtDate.getMonth() + 1).toString(),
      certUrl: certUrl,
      certId: cert.id,
    });

    if (orgId) {
      params.append('organizationId', orgId);
    } else {
      params.append('organizationName', 'SkillBun');
    }

    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  const handleShareOnFeed = (e) => {
    e.preventDefault();
    setShowShareModal(true);
    setCopied(false);
  };

  const handleCopyText = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(customPostText)
        .then(() => {
          setCopied(true);
          setToast('📋 Post template copied! Paste it on LinkedIn.');
        })
        .catch((err) => {
          console.error('Failed to copy text:', err);
        });
    }
  };

  const handleOpenLinkedIn = () => {
    const certUrl = getCertUrl();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <p>Verifying credentials...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Invalid Certificate</h2>
        <p>{error || 'The certificate identifier is incorrect or does not exist.'}</p>
        <Link href="/" className={styles.primaryButton}>
          Back to Home
        </Link>
      </div>
    );
  }

  const badge = getBadgeMeta();

  return (
    <main className={styles.page}>
      <div className={styles.bgGridOverlay} aria-hidden="true" />

      <div className={styles.container}>
        {toast && (
          <div className={styles.toast} role="alert">
            {toast}
          </div>
        )}

        {/* Certificate Type Badge */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className={`${styles.typeBadge} ${styles['typeBadge' + certType] || ''}`}>
            <span>{badge.icon}</span> {badge.label}
          </div>
        </div>

        {/* Revocation Banner */}
        {cert.is_revoked && (
          <div className={styles.revokedBanner} role="alert">
            ⚠️ This credential has been revoked by the issuing authority.
          </div>
        )}

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <button onClick={handlePrint} className={styles.actionBtn}>
            <PrintIcon /> Print / Save PDF
          </button>
          {!cert.is_revoked && certType !== 'LOR' && (
            <>
              <a
                href={getLinkedInAddProfileUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionBtn} ${styles.shareBtn}`}
              >
                <LinkedInIcon /> Add to Profile
              </a>
              <button
                onClick={handleShareOnFeed}
                className={`${styles.actionBtn} ${styles.shareOutlineBtn}`}
              >
                <LinkedInIcon /> Share on Feed
              </button>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CERTIFICATE DISPLAY BRANCHING                                             */}
        {/* ========================================================================= */}

        {/* BRANCH 1: Letter of Recommendation (LOR) - Corporate Vertical Letterhead */}
        {certType === 'LOR' ? (
          <section className={styles.lorLetterhead}>
            <header className={styles.lorHeader}>
              <div className={styles.lorBrandLogo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="SkillBun Logo" />
                <div>
                  <h2>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</h2>
                  <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 'bold', letterSpacing: '0.05em' }}>OFFICIAL VERIFIED CREDENTIAL</span>
                </div>
              </div>
              <div className={styles.lorMetaRight}>
                <div>Ref ID: <strong>{cert.id}</strong></div>
                <div>Date: <strong>{cert.createdAtDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
              </div>
            </header>

            <h1 className={`${styles.lorTitle} ${cinzel.className}`}>Letter of Recommendation</h1>

            <p className={styles.lorSalutation}>TO WHOMSOEVER IT MAY CONCERN</p>

            <div className={styles.lorCandidateStrip}>
              <div><strong>Candidate:</strong> {cert.name}</div>
              <div><strong>Designation:</strong> {cert.designation || 'Intern'} — {cert.department || 'Engineering'}</div>
              {cert.start_date && cert.end_date && (
                <div><strong>Tenure:</strong> {cert.start_date} to {cert.end_date}</div>
              )}
            </div>

            <div className={styles.lorBody}>
              {cert.recommendation_text || 'This is to certify that the candidate demonstrated exceptional dedication, high technical excellence, and proactive collaboration during their engagement at SkillBun.'}
            </div>

            <footer className={styles.lorSignOff}>
              <div className={styles.lorSignDetails}>
                <strong>{cert.issued_by || 'Harsh Patel'}</strong>
                <span>Lead & Managing Director</span>
                <span>SkillBun</span>
              </div>
              <div className={styles.lorSealBlock}>
                <span className={styles.lorSealBadge}>🔒 Verified Official Credential</span>
              </div>
            </footer>

            <div className={styles.lorFooterRef}>
              SkillBun Credential Verification: {typeof window !== 'undefined' ? window.location.href : `https://skillbun.tech/certificate/${cert.id}`}
            </div>
          </section>
        ) : certType === 'INTERNSHIP' ? (
          /* BRANCH 2: Internship Certificate - Canva Overlay */
          <section className={styles.certificateFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/internship-cert-template.png"
              alt={`Certificate of Internship — ${cert.name}`}
              className={styles.templateImg}
              draggable={false}
            />
            <div className={styles.skillbunOverlay} aria-hidden="true">
              <span className={styles.skillbunText}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
            </div>
            <h1 className={`${styles.recipientName} ${cinzel.className}`}>{cert.name}</h1>
            <h2
              className={`${styles.roadmapTitle} ${pixelify.className}`}
              style={{ '--char-count': (cert.stream_or_track || cert.department || 'INTERNSHIP').length }}
            >
              {cert.stream_or_track || `${cert.department} INTERNSHIP`}
            </h2>
            {cert.start_date && cert.end_date && (
              <div className={styles.tenureOverlay}>
                TENURE: {cert.start_date} TO {cert.end_date}
              </div>
            )}
            <div className={styles.qrMeta}>
              <span className={styles.qrMetaId}>{cert.id}</span>
            </div>
          </section>
        ) : certType === 'TRAINING' ? (
          /* BRANCH 3: Training Certificate - Canva Overlay */
          <section className={styles.certificateFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/training-cert-template.png"
              alt={`Certificate of Training — ${cert.name}`}
              className={styles.templateImg}
              draggable={false}
            />
            <div className={styles.skillbunOverlay} aria-hidden="true">
              <span className={styles.skillbunText}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
            </div>
            <h1 className={`${styles.recipientName} ${cinzel.className}`}>{cert.name}</h1>
            <h2
              className={`${styles.roadmapTitle} ${pixelify.className}`}
              style={{ '--char-count': (cert.stream_or_track || 'TRAINING PROGRAM').length }}
            >
              {cert.stream_or_track || 'TRAINING PROGRAM'}
            </h2>
            <div className={styles.qrMeta}>
              <span className={styles.qrMetaId}>{cert.id}</span>
            </div>
          </section>
        ) : (
          /* BRANCH 4: Roadmap Certificate - Existing Canva Template (Zero Regression) */
          <section className={styles.certificateFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/certificate-template.png"
              alt={`SkillBun Certificate of Completion — ${cert.name}`}
              className={styles.templateImg}
              draggable={false}
            />
            <div className={styles.skillbunOverlay} aria-hidden="true">
              <span className={styles.skillbunText}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
            </div>
            <h1 className={`${styles.recipientName} ${cinzel.className}`}>{cert.name}</h1>
            <h2
              className={`${styles.roadmapTitle} ${pixelify.className}`}
              style={{ '--char-count': (cert.roadmapTitle || '').length }}
            >
              {cert.roadmapTitle}
            </h2>
            <div className={styles.qrMeta}>
              <span className={styles.qrMetaId}>{cert.id}</span>
            </div>
          </section>
        )}

        <p className={styles.verificationNote}>
          SkillBun credentials are fully secure and backed by cryptographic record IDs in our database. View verification details anytime at: <code>{typeof window !== 'undefined' ? window.location.href : `/certificate/${cert.id}`}</code>.
        </p>

        {showShareModal && (
          <div className={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Share Certificate on LinkedIn</h3>
                <button className={styles.closeBtn} onClick={() => setShowShareModal(false)}>&times;</button>
              </div>
              <div className={styles.modalBody}>
                <label htmlFor="post-text-area">Customize your post text:</label>
                <textarea
                  id="post-text-area"
                  className={styles.postTextarea}
                  value={customPostText}
                  onChange={(e) => setCustomPostText(e.target.value)}
                />
                
                <button className={styles.copyBtn} onClick={handleCopyText}>
                  {copied ? 'Copied! ✓' : 'Copy Post Text 📋'}
                </button>

                <ul className={styles.instructionsList}>
                  <li>
                    <span className={styles.stepNumber}>1</span>
                    <span>Click <strong>"Copy Post Text"</strong> to copy the customized template text above.</span>
                  </li>
                  <li>
                    <span className={styles.stepNumber}>2</span>
                    <span>Click <strong>"Open LinkedIn Share"</strong> below to open the sharing popup.</span>
                  </li>
                  <li>
                    <span className={styles.stepNumber}>3</span>
                    <span><strong>Paste (Ctrl+V)</strong> the copied text in the LinkedIn share feed box and hit post!</span>
                  </li>
                </ul>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', margin: '0.2rem 0 0' }}>
                  💡 Tip: Make sure to select or type <span style={{ textDecoration: 'underline' }}>@SkillBun</span> in the tag popup on LinkedIn so we get notified of your success!
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={() => setShowShareModal(false)}>Cancel</button>
                <button className={styles.primaryBtn} onClick={handleOpenLinkedIn}>
                  Open LinkedIn Share &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

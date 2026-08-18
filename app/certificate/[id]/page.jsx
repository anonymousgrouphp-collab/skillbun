'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Cinzel, Pixelify_Sans } from 'next/font/google';
import QRCodeSvg from '@/app/components/QRCodeSvg';
import OfficialSeal from '@/app/components/OfficialSeal';
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

function OrnateCorner({ position = 'TL' }) {
  const transforms = {
    TL: '',
    TR: 'scaleX(-1)',
    BL: 'scaleY(-1)',
    BR: 'scale(-1, -1)',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.certCorner} ${styles[`certCorner${position}`]}`}
      style={{ transform: transforms[position] }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 3 H100 M3 0 V100" stroke="#8C6D23" strokeWidth="3" />
      <path d="M0 7 H100 M7 0 V100" stroke="#F5E8C7" strokeWidth="1.5" />
      <path d="M0 11 H100 M11 0 V100" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M0 15 H100 M15 0 V100" stroke="#8C6D23" strokeWidth="1.5" />
      <path
        d="M15 15 C28 15 40 20 46 30 C52 39 48 50 38 55 C29 59 19 54 17 45 C15 35 23 26 33 26 C40 26 45 31 43 37 C41 42 36 44 33 40 C30 37 31 33 35 33"
        stroke="#9D782F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 15 C15 28 20 40 30 46 C39 52 50 48 55 38 C59 29 54 19 45 17 C35 15 26 23 26 33 C26 40 31 45 37 43 C42 41 44 36 40 33 C37 30 33 31 33 35"
        stroke="#9D782F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="26" cy="26" r="4.5" fill="#8C6D23" />
      <circle cx="26" cy="26" r="2.5" fill="#FDF6D8" />
      <circle cx="15" cy="15" r="2.5" fill="#8C6D23" />
      <path d="M26 26 Q44 18 62 19 Q50 24 44 32" fill="#C5A059" opacity="0.85" />
      <path d="M26 26 Q18 44 19 62 Q24 50 32 44" fill="#C5A059" opacity="0.85" />
    </svg>
  );
}

function formatRecommendationText(rawText, candidateName) {
  const firstName = candidateName ? candidateName.trim().split(' ')[0] : 'The candidate';
  if (!rawText || !rawText.trim()) {
    return `${firstName} demonstrated exceptional dedication, professional excellence, and proactive collaboration during their engagement at SkillBun. They contributed to key project and organizational milestones with distinguished commitment and high standards of execution. We wish them continued success in all future endeavors.`;
  }
  return rawText
    .replace(/^This is to certify that\s+[A-Za-z\s]+(has\s+)?(demonstrated|completed|shown|contributed)/i, `${firstName} $2`)
    .replace(/^This is to certify that\s+/i, '')
    .replace(/\bcore engineering milestones\b/gi, 'key organizational milestones')
    .replace(/\bengineering milestones\b/gi, 'project milestones')
    .replace(/\bhigh technical excellence\b/gi, 'professional excellence')
    .replace(/\btechnical excellence\b/gi, 'professional excellence')
    .replace(/\btechnical dedication\b/gi, 'professional dedication');
}

function getDisplayIssueDate(cert) {
  if (cert.issue_date) return cert.issue_date;
  
  const createdDate = cert.createdAtDate || new Date();
  
  if (cert.end_date) {
    const parts = cert.end_date.split(/[-/]/);
    let endDateObj = null;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        endDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else if (parts[2].length === 4) {
        endDateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
    if (endDateObj && !isNaN(endDateObj.getTime())) {
      if (createdDate < endDateObj) {
        return cert.end_date;
      }
    }
  }

  return createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
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
        const rawId = Array.isArray(id) ? id.join('/') : String(id || '');
        const decodedId = decodeURIComponent(rawId).trim();
        const normalizedId = decodedId.replace(/\//g, '-');

        let snapshot = await getDoc(doc(services.db, 'certificates', normalizedId));
        if (!snapshot.exists() && normalizedId !== decodedId) {
          try {
            snapshot = await getDoc(doc(services.db, 'certificates', decodedId));
          } catch {}
        }

        if (snapshot && snapshot.exists()) {
          const data = snapshot.data();
          let date = new Date();
          if (data.createdAt?.toDate) {
            date = data.createdAt.toDate();
          } else if (data.createdAt) {
            date = new Date(data.createdAt);
          }
          const loadedCert = {
            id: snapshot.id,
            display_id: data.display_id || (snapshot.id.startsWith('SKB-') && snapshot.id.includes('-HR-') ? snapshot.id.replace(/-/g, '/') : snapshot.id),
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
    const rawId = cert.id || cert.display_id || '';
    const cleanId = rawId.replace(/\//g, '-');
    return `https://skillbun.vercel.app/certificate/${cleanId}`;
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
                <div>Ref ID: <strong>{cert.display_id || cert.id}</strong></div>
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
          /* BRANCH 2: Landscape Certificate of Internship — Classic Academic Prestige */
          <section className={styles.internshipCertFrame}>
            {/* Vintage Ornate Corner Accents */}
            <OrnateCorner position="TL" />
            <OrnateCorner position="TR" />
            <OrnateCorner position="BL" />
            <OrnateCorner position="BR" />

            {/* Inner Gold Frame */}
            <div className={styles.internshipInnerContainer}>
              {/* Top Institutional Header */}
              <header className={styles.internshipHeader}>
                <div className={styles.internshipBrandLockup}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="SkillBun Logo" className={styles.internshipBrandLogo} />
                  <div className={styles.internshipBrandDetails}>
                    <div className={styles.internshipBrandWordmark}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
                    <div className={styles.internshipBrandSubtitle}>
                      CAREER &amp; SKILLS
                    </div>
                  </div>
                </div>

                <div className={styles.internshipGovtAttribution}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/reish-mark.png" alt="Reish Mark" className={styles.internshipReishLogo} />
                  <div className={styles.internshipReishDetails}>
                    <span className={styles.internshipGovtTag}>MANAGED &amp; ISSUED BY</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/reish-wordmark.png" alt="REISH" className={styles.internshipReishWordmarkImg} />
                  </div>
                </div>
              </header>

              {/* Title Section */}
              <div className={styles.internshipTitleBlock}>
                <div className={styles.titleFlourishDivider}>
                  <span className={styles.flourishSymbol}>❖</span>
                  <div className={styles.flourishLine} />
                  <span className={styles.flourishStar}>★</span>
                  <div className={styles.flourishLine} />
                  <span className={styles.flourishSymbol}>❖</span>
                </div>
                <h1 className={`${styles.internshipMainTitle} ${cinzel.className}`}>
                  Certificate of Completion
                </h1>
                <div className={styles.internshipSubTitleBadge}>
                  PROFESSIONAL INTERNSHIP MERIT CREDENTIAL
                </div>
              </div>

              {/* Recipient Statement */}
              <div className={styles.internshipRecipientSection}>
                <p className={styles.internshipCertifyText}>This is to certify that</p>
                <h2 className={`${styles.internshipCandidateName} ${cinzel.className}`}>
                  {cert.name}
                </h2>
                <div className={styles.internshipNameUnderline}>
                  <div className={styles.nameUnderlineDiamond} />
                </div>
              </div>

              {/* Role & Track Description */}
              <div className={styles.internshipAchievementBlock}>
                <p className={styles.internshipRoleStatement}>
                  has successfully completed the professional internship as{' '}
                  <strong className={styles.highlightRole}>
                    {cert.designation || cert.role || 'Software Engineering Intern'}
                  </strong>
                  {' '}in{' '}
                  <strong className={styles.highlightStream}>
                    {cert.stream_or_track || cert.department || 'Software Development'}
                  </strong>
                </p>
                <p className={styles.internshipOrgStatement}>
                  conducted under the professional direction of <strong>SkillBun</strong> (operated by <strong>Reish</strong>).
                </p>
              </div>

              {/* Key Meta Badges: Duration, Grade, Mode */}
              <div className={styles.internshipMetricsGrid}>
                <div className={styles.internshipMetricPill}>
                  <span className={styles.metricPillLabel}>Internship Duration</span>
                  <span className={styles.metricPillVal}>
                    {cert.start_date && cert.end_date
                      ? `${cert.start_date} to ${cert.end_date}`
                      : 'Milestone Tenure'}
                  </span>
                </div>

                <div className={styles.internshipMetricPill}>
                  <span className={styles.metricPillLabel}>Performance Rating</span>
                  <span className={styles.metricPillVal}>
                    {cert.grade || (cert.score ? `Grade A (${cert.score}%)` : 'Grade A (Excellent)')}
                  </span>
                </div>

                <div className={styles.internshipMetricPill}>
                  <span className={styles.metricPillLabel}>Mode of Engagement</span>
                  <span className={styles.metricPillVal}>
                    {cert.mode || cert.venue || 'Virtual / Remote Operations'}
                  </span>
                </div>
              </div>

              {/* Formal Performance Statement */}
              <div className={styles.internshipConductStatement}>
                <p>
                  {formatRecommendationText(cert.recommendation_text || cert.performance_remarks, cert.name)}
                </p>
              </div>

              {/* Signatures, Official Seal & QR Code Block */}
              <div className={styles.internshipAuthFooter}>
                {/* Left: Credential ID, Date & Signature */}
                <div className={styles.internshipSigBlock}>
                  <div className={styles.internshipIdDate}>
                    <div>Certificate ID: <strong>{cert.display_id || cert.id}</strong></div>
                    <div>Date of Issue: <strong>{getDisplayIssueDate(cert)}</strong></div>
                  </div>

                  <div className={styles.signatureCanvas}>
                    <div className={styles.signatoryName}>Signing Authority</div>
                    <div className={styles.signatoryRole}>Managing Director, SkillBun</div>
                  </div>
                </div>

                {/* Center: Gold Embossed Dual Brand Seal Stamp */}
                <div className={styles.internshipSealArea}>
                  <OfficialSeal />
                </div>

                {/* Right: Live Vector Scannable QR Code */}
                <div className={styles.internshipQrArea}>
                  <div className={styles.qrCodeWrapper}>
                    <QRCodeSvg value={getCertUrl()} size={88} />
                  </div>
                </div>
              </div>

              {/* Bottom Trust & Verification Footnote Strip */}
              <div className={styles.internshipVerificationFootnote}>
                <div className={styles.msmeSealBadge}>
                  <span>🇮🇳</span>
                  <span>Govt. of India MSME Registered Entity</span>
                </div>
                <div className={styles.footnoteUrl}>
                  Scan the above QR to verify online
                </div>
              </div>
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
              <span className={styles.qrMetaId}>{cert.display_id || cert.id}</span>
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
              <span className={styles.qrMetaId}>{cert.display_id || cert.id}</span>
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

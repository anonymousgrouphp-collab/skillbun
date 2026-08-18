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
            <div className={`${styles.certCorner} ${styles.certCornerTL}`} aria-hidden="true">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M0 0 L100 0 L100 8 L18 8 L18 18 L100 18 L100 24 L24 24 L24 100 L18 100 L18 24 L8 24 L8 100 L0 100 Z M28 28 L90 28 L90 32 L34 32 L34 90 L28 90 Z M40 40 L80 40 L80 44 L44 44 L44 80 L40 80 Z" />
              </svg>
            </div>
            <div className={`${styles.certCorner} ${styles.certCornerTR}`} aria-hidden="true">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M0 0 L100 0 L100 100 L92 100 L92 24 L82 24 L82 100 L76 100 L76 24 L0 24 L0 18 L82 18 L82 8 L0 8 Z M10 28 L72 28 L72 90 L66 90 L66 32 L10 32 Z M20 40 L60 40 L60 80 L56 80 L56 44 L20 44 Z" />
              </svg>
            </div>
            <div className={`${styles.certCorner} ${styles.certCornerBL}`} aria-hidden="true">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M0 0 L8 0 L8 76 L18 76 L18 0 L24 0 L24 76 L100 76 L100 82 L18 82 L18 92 L100 92 L100 100 L0 100 Z M28 10 L34 10 L34 68 L90 68 L90 72 L28 72 Z M40 20 L44 20 L44 56 L80 56 L80 60 L40 60 Z" />
              </svg>
            </div>
            <div className={`${styles.certCorner} ${styles.certCornerBR}`} aria-hidden="true">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M92 0 L100 0 L100 100 L0 100 L0 92 L82 92 L82 82 L0 82 L0 76 L76 76 L76 0 L82 0 L82 76 L92 76 Z M66 10 L72 10 L72 72 L10 72 L10 68 L66 68 Z M56 20 L60 20 L60 60 L20 60 L20 56 L56 56 Z" />
              </svg>
            </div>

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
                      CAREER &amp; WORKFORCE SYSTEMS
                    </div>
                  </div>
                </div>

                <div className={styles.internshipGovtAttribution}>
                  <span className={styles.internshipGovtTag}>MANAGED &amp; ISSUED BY</span>
                  <div className={styles.internshipReishIdentity}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/reish-logo.png" alt="Reish Logo" className={styles.internshipReishLogo} />
                    <span className={styles.internshipReishText}>REISH</span>
                  </div>
                  <span className={styles.internshipMsmeNote}>Govt. of India MSME Registered Startup</span>
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
                  conducted under the engineering direction of <strong>SkillBun</strong> (operated by <strong>Reish</strong>).
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
                  {cert.recommendation_text || cert.performance_remarks ||
                    `During this internship, their performance and conduct were found to be Exemplary. They contributed to core engineering milestones with distinguished commitment, technical acumen, and professionalism. We wish them continued excellence in all future endeavors.`}
                </p>
              </div>

              {/* Signatures, Official Seal & QR Code Block */}
              <div className={styles.internshipAuthFooter}>
                {/* Left: Credential ID, Date & Signature */}
                <div className={styles.internshipSigBlock}>
                  <div className={styles.internshipIdDate}>
                    <div>Certificate ID: <strong>{cert.display_id || cert.id}</strong></div>
                    <div>Date of Issue: <strong>{cert.createdAtDate ? cert.createdAtDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-GB')}</strong></div>
                  </div>

                  <div className={styles.signatureCanvas}>
                    <div className={styles.signatureScript}>Harsh Patel</div>
                    <div className={styles.signatureLine} />
                    <div className={styles.signatoryName}>{cert.issued_by || 'Harsh Patel'}</div>
                    <div className={styles.signatoryRole}>{cert.signatory_title || 'Lead & Managing Director, SkillBun'}</div>
                  </div>
                </div>

                {/* Center: Gold Embossed Dual Brand Seal Stamp */}
                <div className={styles.internshipSealArea}>
                  <div className={styles.vintageSealRing}>
                    <div className={styles.sealInnerPattern}>
                      <div className={styles.sealLogoCenter}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/reish-logo.png" alt="Reish Seal" className={styles.sealReishIcon} />
                      </div>
                      <div className={styles.sealStarBanner}>★ REISH ★</div>
                      <div className={styles.sealOfficialText}>OFFICIAL SEAL</div>
                    </div>
                  </div>
                </div>

                {/* Right: Live Scannable QR Code */}
                <div className={styles.internshipQrArea}>
                  <div className={styles.qrCodeWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getCertUrl())}&margin=4`}
                      alt="Verification QR Code"
                      className={styles.qrCodeImage}
                    />
                  </div>
                  <div className={styles.qrCaption}>Scan to verify online</div>
                </div>
              </div>

              {/* Bottom Trust & Verification URL Strip */}
              <div className={styles.internshipVerificationFootnote}>
                <div className={styles.msmeSealBadge}>
                  <span>🇮🇳</span>
                  <span>Govt. of India MSME Registered Entity</span>
                </div>
                <div className={styles.footnoteUrl}>
                  Verify online: <code>{typeof window !== 'undefined' ? window.location.href : `https://skillbun.tech/certificate/${cert.id}`}</code>
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

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { cinzel, pixelify } from '@/app/fonts';
import { triggerDocumentPrint } from '@/utils/client/printAndDownload';
import { normalizeDocumentCategory, resolveTemplateVersion } from '@/utils/common/docTemplateRegistry';
import { getCertificateRenderer } from './templates/certificateRegistry';
import CertificateRendererV1 from './templates/CertificateRendererV1';
import styles from './certificate.module.css';

function CertificateVersionRenderer({ version, cert, baseUrl, cinzel, pixelify, styles }) {
  if (version === 'v1') {
    return (
      <CertificateRendererV1
        cert={cert}
        baseUrl={baseUrl}
        cinzel={cinzel}
        pixelify={pixelify}
        styles={styles}
      />
    );
  }
  return null;
}


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
  const [versionError, setVersionError] = useState(null);
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
    const candidateName = cert?.name?.trim() || 'Candidate';
    const roleOrTrack = (cert?.designation || cert?.stream_or_track || cert?.roadmapTitle || 'Certificate').trim();
    const isLor = (cert?.cert_type || '').toUpperCase() === 'LOR';
    triggerDocumentPrint({
      title: isLor
        ? `${candidateName} - Letter of Recommendation - SkillBun`
        : `${candidateName} - ${roleOrTrack} Certificate - SkillBun`,
      orientation: isLor ? 'portrait' : 'landscape',
    });
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
      name,
      organizationId: orgId || '',
      issueYear: cert.createdAtDate?.getFullYear?.() ? String(cert.createdAtDate.getFullYear()) : '2026',
      issueMonth: cert.createdAtDate?.getMonth ? String(cert.createdAtDate.getMonth() + 1) : '1',
      certUrl,
      certId: cert.display_id || cert.id,
    });

    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  const handleShareOnFeed = () => {
    if (!cert) return;
    setShowShareModal(true);
  };

  const handleCopyPostText = async () => {
    try {
      await navigator.clipboard.writeText(customPostText);
      setToast('Post text copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast('Failed to copy text.');
    }
  };

  const handleProceedToLinkedIn = () => {
    const certUrl = getCertUrl();
    const encodedUrl = encodeURIComponent(certUrl);
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Verifying and retrieving secure certificate...</p>
        </div>
      </main>
    );
  }

  if (error || !cert) {
    return (
      <main className={styles.page}>
        <div className={styles.errorWrapper}>
          <h2>Certificate Verification</h2>
          <p>{error || 'No certificate record found.'}</p>
          <Link href="/certificate" className={styles.actionBtn}>
            Back to Verification
          </Link>
        </div>
      </main>
    );
  }

  // Resolve template version strictly from stored document record
  const category = normalizeDocumentCategory(cert.cert_type || 'ROADMAP');
  let resolvedVersion = null;
  let resolvedVersionError = null;

  try {
    resolvedVersion = resolveTemplateVersion(category, cert.template_version);
  } catch (err) {
    resolvedVersionError = {
      category,
      requestedVersion: cert.template_version,
      message: err.message,
    };
  }

  if (resolvedVersionError) {
    return (
      <main className={styles.page}>
        <div className={styles.errorWrapper}>
          <h2>Unsupported Document Template</h2>
          <p>
            This credential was issued under template specification <code>{String(resolvedVersionError.requestedVersion)}</code>, which is not supported by this verification node.
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #888)', marginTop: '0.5rem' }}>
            To protect legal validity and historical authenticity, previously issued documents cannot be rendered using a mismatched template.
          </p>
          <Link href="/certificate" className={styles.actionBtn} style={{ marginTop: '1rem' }}>
            Back to Verification
          </Link>
        </div>
      </main>
    );
  }

  const hasRenderer = Boolean(resolvedVersion && getCertificateRenderer(resolvedVersion));

  if (!hasRenderer) {
    return (
      <main className={styles.page}>
        <div className={styles.errorWrapper}>
          <h2>Template Renderer Unavailable</h2>
          <p>Renderer for template specification <code>{resolvedVersion}</code> could not be loaded.</p>
          <Link href="/certificate" className={styles.actionBtn} style={{ marginTop: '1rem' }}>
            Back to Verification
          </Link>
        </div>
      </main>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skillbun.tech';

  return (
    <main className={`${styles.page} ${certType === 'LOR' ? styles.pageLor : ''}`}>
      {/* Background Decorative Overlay */}
      <div className={styles.bgGridOverlay} aria-hidden="true" />

      {/* Toast Notification */}
      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className={styles.container}>
        {/* Top Type Indicator Badge */}
        <div className={styles.typeBadgeWrapper}>
          <div className={styles.typeBadge}>
            <span className={styles.typeBadgeIcon}>{getBadgeMeta().icon}</span>
            <span>{getBadgeMeta().label}</span>
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
        {/* VERSIONED IMMUTABLE CERTIFICATE RENDERER                                  */}
        {/* ========================================================================= */}
        <CertificateVersionRenderer
          version={resolvedVersion}
          cert={cert}
          baseUrl={baseUrl}
          cinzel={cinzel}
          pixelify={pixelify}
          styles={styles}
        />

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
                
                <button className={styles.copyBtn} onClick={handleCopyPostText}>
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
                <button className={styles.primaryBtn} onClick={handleProceedToLinkedIn}>
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

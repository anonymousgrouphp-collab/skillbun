'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import styles from './certificate.module.css';

function SealIcon() {
  return (
    <svg className={styles.sealIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
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
  const router = useRouter();
  const id = params.id;

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setCert({
            id: snapshot.id,
            ...data,
            createdAtDate: date,
          });
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

  const getLinkedInShareUrl = () => {
    if (!cert) return '#';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skillbun.tech';
    const certUrl = `${baseUrl}/certificate/${cert.id}`;
    const title = encodeURIComponent(`I got certified in ${cert.roadmapTitle} on SkillBun!`);
    const summary = encodeURIComponent(`SkillBun verified certificate for completing the ${cert.roadmapTitle} curriculum.`);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;
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

  return (
    <main className={styles.page}>
      <div className={styles.bgGridOverlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.actionsBar}>
          <button onClick={handlePrint} className={styles.actionBtn}>
            <PrintIcon /> Print / Save PDF
          </button>
          <a href={getLinkedInShareUrl()} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.shareBtn}`}>
            <LinkedInIcon /> Share on LinkedIn
          </a>
        </div>

        {/* Certificate Outer Frame */}
        <section className={styles.certificateFrame}>
          <div className={styles.certificateBorder}>
            <div className={styles.certificateCard}>
              {/* Inner Decorative Corner Lines */}
              <div className={`${styles.corner} ${styles.topLeft}`}></div>
              <div className={`${styles.corner} ${styles.topRight}`}></div>
              <div className={`${styles.corner} ${styles.bottomLeft}`}></div>
              <div className={`${styles.corner} ${styles.bottomRight}`}></div>

              {/* Header */}
              <header className={styles.certHeader}>
                <div className={styles.logoBlock}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="SkillBun Logo" className={styles.logo} />
                  <span className={styles.brandWordmark}>SKILLBUN</span>
                </div>
                <div className={styles.certBadge}>VERIFIED CREDENTIAL</div>
              </header>

              {/* Title & Body */}
              <div className={styles.certBody}>
                <span className={styles.certSub}>CERTIFICATE OF COMPLETION</span>
                <p className={styles.certLead}>This is proudly presented to</p>
                <h1 className={styles.recipientName}>{cert.name}</h1>
                <div className={styles.certDivider}></div>
                <p className={styles.certDescription}>
                  for successfully mastering all modules, stages, and practical portfolio projects in the
                  <strong> {cert.roadmapTitle} </strong> curriculum, validating advanced proficiency in this professional discipline.
                </p>
              </div>

              {/* Footer Stamp & Signature */}
              <footer className={styles.certFooter}>
                <div className={styles.footerCol}>
                  <p className={styles.metaLabel}>VERIFICATION ID</p>
                  <p className={styles.metaValue}><code>{cert.id}</code></p>
                </div>

                <div className={styles.footerColCenter}>
                  <div className={styles.sealContainer}>
                    <SealIcon />
                    <span className={styles.sealText}>SKILLBUN SECURITY SEAL</span>
                  </div>
                </div>

                <div className={styles.footerColRight}>
                  <div className={styles.signatureBlock}>
                    <span className={styles.sigLine}>Bun-Bot & Team</span>
                    <p className={styles.metaLabel}>AUTHORIZED ISSUER</p>
                  </div>
                </div>
              </footer>

              {/* Extra Meta Grid */}
              <div className={styles.metaRow}>
                <span>Grade Score: <strong>{cert.score}%</strong></span>
                <span>Issue Date: <strong>{cert.createdAtDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
              </div>
            </div>
          </div>
        </section>

        <p className={styles.verificationNote}>
          SkillBun credentials are fully secure and backed by cryptographic record IDs in our database. View verification details anytime at: <code>{typeof window !== 'undefined' ? window.location.href : `/certificate/${cert.id}`}</code>.
        </p>
      </div>
    </main>
  );
}

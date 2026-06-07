'use client';

import { useState } from 'react';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import styles from './verify.module.css';

export default function VerifyRegistryPage() {
  const [searchId, setSearchId] = useState('');
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setCert(null);
    setSearched(true);

    const services = getFirebaseServices();
    if (!services.configured) {
      setError('Database services are not configured.');
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(services.db, 'certificates', searchId.trim());
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
        setError('No certificate found matching this verification ID. Please double-check the characters.');
      }
    } catch (err) {
      console.error('Failed to verify certificate ID:', err);
      setError('An error occurred during verification query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgGridOverlay} aria-hidden="true" />

      <div className={styles.container}>
        <section className={`${styles.panel} ${styles.glassPanel}`}>
          <div className={styles.header}>
            <span className={styles.kicker}>SKILLBUN CREDENTIAL REGISTRY</span>
            <h1>Verify Certificate</h1>
            <p>Verify the authenticity and details of any SkillBun career certification.</p>
          </div>

          <form onSubmit={handleVerify} className={styles.searchForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="verify-id">Enter Unique Certificate ID:</label>
              <div className={styles.searchRow}>
                <input
                  type="text"
                  id="verify-id"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. 7vP4bxWeGiPL7gdU1ste"
                  className={styles.searchInput}
                  disabled={loading}
                />
                <button type="submit" className={styles.primaryButton} disabled={loading || !searchId.trim()}>
                  {loading ? 'Verifying...' : 'Verify ID'}
                </button>
              </div>
            </div>
          </form>

          {searched && (
            <div className={styles.resultSection}>
              {loading && (
                <div className={styles.loadingBlock}>
                  <div className={styles.spinner}></div>
                  <p>Searching the secure registry...</p>
                </div>
              )}

              {!loading && error && (
                <div className={styles.errorCard}>
                  <span className={styles.statusBadgeFail}>❌ INVALID ID</span>
                  <h3>Verification Failed</h3>
                  <p>{error}</p>
                </div>
              )}

              {!loading && cert && (
                <div className={styles.successCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.statusBadgePass}>✅ AUTHENTIC CREDENTIAL</span>
                    <h3>Certificate Successfully Verified</h3>
                  </div>

                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Recipient Name:</span>
                      <span className={styles.detailValue}>{cert.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Certified Subject:</span>
                      <span className={styles.detailValue}>{cert.roadmapTitle} Roadmap</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Grade Achieved:</span>
                      <span className={styles.detailValue}>{cert.score}% Score</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Issue Date:</span>
                      <span className={styles.detailValue}>
                        {cert.createdAtDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Registry ID:</span>
                      <span className={styles.detailValue}><code>{cert.id}</code></span>
                    </div>
                  </div>

                  <div className={styles.securityNote}>
                    🔒 <strong>Security Registry Notice:</strong> This public verification page confirms the legitimacy of this credential in the SkillBun database. For security and privacy reasons, full certificate rendering and high-resolution PDF downloads are restricted to the owner's dashboard.
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

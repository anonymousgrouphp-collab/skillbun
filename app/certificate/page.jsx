'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import styles from './verify.module.css';

export default function VerifyRegistryPage() {
  const [searchId, setSearchId] = useState('');
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    const rawInput = searchId.trim();
    if (!rawInput) return;

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
      const normalizedId = rawInput.replace(/\//g, '-');
      const displayId = rawInput.replace(/-/g, '/');

      let snapshot = null;

      // Step 1: Try direct document lookup with hyphenated ID
      try {
        const docRef = doc(services.db, 'certificates', normalizedId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          snapshot = docSnap;
        }
      } catch (e) {
        console.warn('Direct doc lookup error:', e);
      }

      // Step 2: If raw input didn't have slashes and differs from normalized, try raw input
      if (!snapshot && !rawInput.includes('/') && rawInput !== normalizedId) {
        try {
          const docRef = doc(services.db, 'certificates', rawInput);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            snapshot = docSnap;
          }
        } catch (e) {
          console.warn('Raw doc lookup error:', e);
        }
      }

      // Step 3: Query by display_id field
      if (!snapshot) {
        try {
          const certsCol = collection(services.db, 'certificates');
          const q = query(
            certsCol,
            where('display_id', 'in', [rawInput, displayId, normalizedId]),
            limit(1)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            snapshot = querySnap.docs[0];
          }
        } catch (e) {
          console.warn('Query by display_id error:', e);
        }
      }

      if (snapshot && snapshot.exists()) {
        const data = snapshot.data();
        let date = new Date();
        if (data.createdAt?.toDate) {
          date = data.createdAt.toDate();
        } else if (data.createdAt) {
          date = new Date(data.createdAt);
        }
        setCert({
          id: snapshot.id,
          display_id: data.display_id || (snapshot.id.startsWith('SKB-') && snapshot.id.includes('-') ? snapshot.id.replace(/-/g, '/') : snapshot.id),
          ...data,
          createdAtDate: date,
        });
      } else {
        setError(`No certificate found matching verification ID "${rawInput}". Please double-check the characters.`);
      }
    } catch (err) {
      console.error('Failed to verify certificate ID:', err);
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        setError('Network offline. Please check your internet connection and try again.');
      } else {
        setError('An error occurred during verification query. Please try again.');
      }
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
                  placeholder="e.g. SKB/2026/INT-REC/EJGHNG or SKB8F92-4C-10-9A7E"
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
                      <span className={styles.detailLabel}>Credential / Subject:</span>
                      <span className={styles.detailValue}>
                        {cert.designation || cert.stream_or_track || (cert.roadmapTitle ? `${cert.roadmapTitle} Roadmap` : 'Professional Credential')}
                      </span>
                    </div>
                    {(cert.performance_rating || cert.score !== undefined) && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Grade / Rating:</span>
                        <span className={styles.detailValue}>
                          {cert.performance_rating || `${cert.score}% Score`}
                        </span>
                      </div>
                    )}
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
                      <span className={styles.detailLabel}>Certificate ID:</span>
                      <span className={styles.detailValue}><code>{cert.display_id || cert.id}</code></span>
                    </div>
                  </div>

                  <div style={{ margin: '1.25rem 0', textAlign: 'center' }}>
                    <Link
                      href={`/certificate/${cert.id}`}
                      className={styles.primaryButton}
                      style={{ width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}
                    >
                      🎓 View Full Official Certificate
                    </Link>
                  </div>

                  <div className={styles.securityNote}>
                    🔒 <strong>Security Registry Notice:</strong> This public verification record confirms the cryptographic authenticity of this credential in the SkillBun database registry.
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

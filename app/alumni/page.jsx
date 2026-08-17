'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import styles from './alumni.module.css';

export default function AlumniPortalPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [, startTransition] = useTransition();

  const searchDocuments = useCallback(async (searchKey) => {
    const key = (searchKey || '').trim();
    if (!key) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    setSearchedQuery(key);

    try {
      let token = '';
      if (user) {
        token = await user.getIdToken();
      }

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/alumni/documents?query=${encodeURIComponent(key)}`, {
        headers,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Unable to retrieve document records.');
      }

      startTransition(() => {
        setDocuments(data.documents || []);
      });
    } catch (err) {
      setError(err.message || 'Network error occurred while fetching records.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-search if user is logged in
  useEffect(() => {
    let active = true;
    if (user?.email && !hasSearched) {
      queueMicrotask(() => {
        if (active) {
          setQuery(user.email);
          searchDocuments(user.email);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [user, hasSearched, searchDocuments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchDocuments(query);
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'INTERNSHIP':
      case 'ROADMAP':
        return '🎓';
      case 'TRAINING':
        return '📘';
      case 'LOR':
        return '🌟';
      case 'EXTENSION_LETTER':
      case 'EXTENSION':
        return '🚀';
      case 'OFFER_LETTER':
        return '📄';
      case 'TERMINATION_NOTICE':
        return '📜';
      default:
        return '📑';
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.badge}>
          <span>Official Verification Hub</span>
        </div>
        <h1 className={styles.title}>
          SkillBun <span className={styles.titleHighlight}>Alumni</span> Document Vault
        </h1>
        <p className={styles.subtitle}>
          Securely verify, view, and retrieve your official SkillBun internship certificates, offer letters, extension addendums, training credentials, and letters of recommendation.
        </p>
      </header>

      <div className={styles.searchWrap}>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Enter your personal email or Document Ref ID (e.g. SKB/2026/INT-REC/...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit" className={styles.searchButton} disabled={loading}>
            {loading ? 'Searching...' : '🔍 Verify Records'}
          </button>
        </form>
        <p className={styles.helperText}>
          Search with your registered email or official Reference Code (e.g. <code>SKB/2026/INT-REC/XXXXXX</code> or <code>SKBXXXX-XX-XX-XXXX</code>)
        </p>
      </div>

      {error && (
        <div className={styles.emptyState} style={{ borderColor: 'var(--danger)', marginBottom: '2rem' }}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyTitle}>Lookup Issue</div>
          <div className={styles.emptyText}>{error}</div>
        </div>
      )}

      {hasSearched && !loading && documents.length === 0 && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📂</div>
          <div className={styles.emptyTitle}>No Records Found</div>
          <div className={styles.emptyText}>
            No verified certificates or workforce letters found for <strong>{query}</strong>. Ensure the query is exact.
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Found {documents.length} Verified Document{documents.length === 1 ? '' : 's'}
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              Verified via SkillBun Trust Registry
            </span>
          </div>

          <div className={styles.grid}>
            {documents.map((doc) => (
              <div key={doc.id} className={styles.card}>
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardType}>
                      {getBadgeIcon(doc.type)} {doc.type.replace(/_/g, ' ')}
                    </span>
                    <span className={styles.cardRef}>{doc.display_id || doc.id}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{doc.title}</h3>

                  <div className={styles.cardMeta}>
                    {doc.recipient_name && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Issued To:</span>
                        <span className={styles.metaValue}>{doc.recipient_name}</span>
                      </div>
                    )}
                    {doc.department && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Department:</span>
                        <span className={styles.metaValue}>{doc.department}</span>
                      </div>
                    )}
                    {doc.designation && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Role:</span>
                        <span className={styles.metaValue}>{doc.designation}</span>
                      </div>
                    )}
                    {(doc.start_date || doc.end_date) && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Tenure:</span>
                        <span className={styles.metaValue}>
                          {doc.start_date || 'N/A'} to {doc.end_date || 'Present'}
                        </span>
                      </div>
                    )}
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Status:</span>
                      <span className={`${styles.statusPill} ${doc.is_revoked ? styles.statusRevoked : styles.statusValid}`}>
                        {doc.is_revoked ? '❌ Revoked / Expired' : '✅ Active & Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  {doc.verification_url ? (
                    <Link
                      href={doc.verification_url}
                      target="_blank"
                      className={styles.verifyButton}
                    >
                      🛡️ View Official Credential
                    </Link>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', width: '100%', padding: '0.4rem 0' }}>
                      🔒 Formal Workforce Archival Record
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

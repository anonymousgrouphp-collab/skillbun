'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import styles from './certificates.module.css';

const TEMPLATE_DESIGNS = [
  {
    id: 'ROADMAP',
    name: '🎓 Academic Roadmap Assessment Certificate',
    bgImage: '/certificate-template.png',
    badge: 'Roadmap Track',
    codeFormat: 'SKBXXXX-XX-XX-XXXX',
    description: 'Official assessment certificate awarded upon scoring 70%+ on 10 randomized adaptive questions.',
  },
  {
    id: 'INTERNSHIP',
    name: '🏢 Certificate of Internship Completion',
    bgImage: '/internship-cert-template.png',
    badge: 'Workforce Tenure',
    codeFormat: 'SKB/2026/INT-REC/XXXXXX',
    description: 'Awarded to interns upon successful completion of milestone tenure and deliverables.',
  },
  {
    id: 'TRAINING',
    name: '🛠️ Practical Industry Training Certificate',
    bgImage: '/training-cert-template.png',
    badge: 'Industry Training',
    codeFormat: 'SKB/2026/TRN-PRC/XXXXXX',
    description: 'Issued for advanced practical software engineering and systems design training.',
  },
  {
    id: 'LOR',
    name: '📜 Official Letter of Recommendation (LOR)',
    bgImage: null,
    badge: 'Executive LOR',
    codeFormat: 'SKB/2026/LOR-REC/XXXXXX',
    description: 'Signed leadership endorsement highlighting exceptional agile engineering ownership.',
  },
];

export default function AdminCertificatesPage() {
  const { user, authLoading } = useAuth();
  const { isAdmin, checking } = useAdminAccess(user, authLoading);

  // Studio Mode: 'registry' | 'studio' | 'mint'
  const [activeTab, setActiveTab] = useState('registry');

  // Registry state
  const [certs, setCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCount: 0,
    roadmapCount: 0,
    workforceCount: 0,
    activeCount: 0,
    revokedCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Live Canvas Studio state
  const [selectedDesignId, setSelectedDesignId] = useState('ROADMAP');
  const [simName, setSimName] = useState('Alex Sharma');
  const [simTrack, setSimTrack] = useState('Full Stack Web Development');
  const [simScore, setSimScore] = useState(94);
  const [simCertId, setSimCertId] = useState('SKB8F92-4C-10-9A7E');
  const [simDate, setSimDate] = useState(new Date().toISOString().slice(0, 10));

  // Minting Form state
  const [mintType, setMintType] = useState('ROADMAP');
  const [mintName, setMintName] = useState('');
  const [mintEmail, setMintEmail] = useState('');
  const [mintTrack, setMintTrack] = useState('Full Stack Web Development');
  const [mintScore, setMintScore] = useState(90);
  const [mintDepartment, setMintDepartment] = useState('Development & Engineering');
  const [mintDesignation, setMintDesignation] = useState('Engineering Intern');
  const [mintStartDate, setMintStartDate] = useState('');
  const [mintEndDate, setMintEndDate] = useState('');
  const [mintLorText, setMintLorText] = useState('');
  const [mintSubmitting, setMintSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  // Fetch certificates from admin API
  const fetchCertificates = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoadingCerts(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/certificates?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setCerts(data.certificates || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoadingCerts(false);
    }
  }, [user, isAdmin, typeFilter, statusFilter, searchTerm]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    if (user && isAdmin) {
      const initLoad = async () => {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/admin/certificates', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (isMounted && data.success) {
            setCerts(data.certificates || []);
            if (data.metrics) setMetrics(data.metrics);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (isMounted) setLoadingCerts(false);
        }
      };
      initLoad();
    }
    return () => {
      isMounted = false;
    };
  }, [user, isAdmin]);

  // Re-fetch when filters change in registry mode
  useEffect(() => {
    if (activeTab === 'registry') {
      const timer = setTimeout(() => {
        fetchCertificates();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchCertificates]);

  // Revoke / Reinstate Certificate action
  const handleToggleRevoke = async (cert) => {
    const nextState = !cert.is_revoked;
    const confirmText = nextState
      ? `Are you sure you want to REVOKE certificate (${cert.display_id || cert.id}) for ${cert.name}?`
      : `Re-instate certificate (${cert.display_id || cert.id}) for ${cert.name}?`;

    if (!window.confirm(confirmText)) return;

    setActionLoadingId(cert.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/certificates/${encodeURIComponent(cert.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_revoked: nextState }),
      });

      const data = await res.json();
      if (data.success) {
        setCerts((prev) =>
          prev.map((c) => (c.id === cert.id ? { ...c, is_revoked: nextState } : c))
        );
        fetchCertificates();
      } else {
        alert(data.error || 'Failed to update certificate status.');
      }
    } catch (err) {
      alert('Error updating certificate.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Certificate action
  const handleDeleteCert = async (cert) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING: Are you sure you want to permanently delete certificate (${cert.display_id || cert.id}) for ${cert.name}? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(cert.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/certificates/${encodeURIComponent(cert.id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setCerts((prev) => prev.filter((c) => c.id !== cert.id));
        fetchCertificates();
      } else {
        alert(data.error || 'Failed to delete certificate.');
      }
    } catch (err) {
      alert('Error deleting certificate.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Minting Form
  const handleMintSubmit = async (e) => {
    e.preventDefault();
    if (!mintName.trim() || !mintTrack.trim()) {
      setFeedback({ type: 'error', text: 'Candidate name and track title are required.' });
      return;
    }

    setMintSubmitting(true);
    setFeedback(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cert_type: mintType,
          name: mintName.trim(),
          email: mintEmail.trim(),
          stream_or_track: mintTrack.trim(),
          roadmapTitle: mintTrack.trim(),
          score: Number(mintScore) || 100,
          department: mintDepartment,
          designation: mintDesignation,
          start_date: mintStartDate || null,
          end_date: mintEndDate || null,
          recommendation_text: mintLorText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: `🎉 Certificate (${data.displayId || data.certId}) minted successfully for ${mintName}!`,
        });
        // Reset form
        setMintName('');
        setMintEmail('');
        fetchCertificates();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Minting failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error issuing certificate.' });
    } finally {
      setMintSubmitting(false);
    }
  };

  const currentDesign = TEMPLATE_DESIGNS.find((t) => t.id === selectedDesignId) || TEMPLATE_DESIGNS[0];

  if (authLoading || checking) {
    return (
      <div className={styles.certContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: '600' }}>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className={styles.certContainer}>
        <div className={styles.authGateCard}>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: '#ef4444', marginBottom: '0.75rem' }}>
            403 — Admin Privileges Required
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            This operations studio is restricted to authorized platform administrators.
          </p>
          <Link href="/dashboard" className={styles.btnPrimary}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.certContainer}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <h1 className={styles.titleText}>Certificate & Credential Studio</h1>
            <span className={styles.securityPill}>
              🛡️ Base32 Cryptographic Trust Engine
            </span>
          </div>
          <p className={styles.subtitle}>
            Unified operations console to search, live-preview, issue, revoke, and verify all 4 platform certificate types across academic and workforce tracks.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard/console/admin" className={styles.actionBtnSecondary}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Command Center
          </Link>
          <Link href="/dashboard/console/admin/emails" className={styles.actionBtnSecondary}>
            Mail Studio
          </Link>
          <Link href="/dashboard/console/admin/workforce" className={styles.actionBtnSecondary}>
            Workforce Hub
          </Link>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBox} ${styles.iconGreen}`}>📜</div>
          <div>
            <div className={styles.metricVal}>{metrics.totalCount}</div>
            <div className={styles.metricLabel}>Total Credentials</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBox} ${styles.iconBlue}`}>🎓</div>
          <div>
            <div className={styles.metricVal}>{metrics.roadmapCount}</div>
            <div className={styles.metricLabel}>Roadmap Certs</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBox} ${styles.iconPurple}`}>🏢</div>
          <div>
            <div className={styles.metricVal}>{metrics.workforceCount}</div>
            <div className={styles.metricLabel}>Workforce Credentials</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconBox} ${styles.iconAmber}`}>✅</div>
          <div>
            <div className={styles.metricVal}>{metrics.activeCount}</div>
            <div className={styles.metricLabel}>Active Verified</div>
          </div>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className={styles.studioTabs}>
        <button
          type="button"
          onClick={() => setActiveTab('registry')}
          className={`${styles.tabBtn} ${activeTab === 'registry' ? styles.tabBtnActive : ''}`}
        >
          <span>📜</span> Certificates Registry ({certs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`${styles.tabBtn} ${activeTab === 'studio' ? styles.tabBtnActive : ''}`}
        >
          <span>🎨</span> Live Design & Canvas Overlay Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mint')}
          className={`${styles.tabBtn} ${activeTab === 'mint' ? styles.tabBtnActive : ''}`}
        >
          <span>⚡</span> Issue / Mint Certificate
        </button>
      </div>

      {/* TAB 1: ALL CERTIFICATES REGISTRY */}
      {activeTab === 'registry' && (
        <div>
          {/* Filter & Search Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, email, cert ID, track..."
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.filterControls}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="ALL">All Types ({metrics.totalCount})</option>
                <option value="ROADMAP">Roadmap Assessment ({metrics.roadmapCount})</option>
                <option value="INTERNSHIP">Internship Completion</option>
                <option value="TRAINING">Industry Training</option>
                <option value="LOR">Letter of Recommendation (LOR)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Verified ({metrics.activeCount})</option>
                <option value="REVOKED">Revoked ({metrics.revokedCount})</option>
              </select>

              <button
                type="button"
                onClick={fetchCertificates}
                className={styles.actionBtnSecondary}
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                title="Refresh from Firestore"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className={styles.tableCard}>
            {loadingCerts ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                <p>⏳ Loading real certificate records from Firestore...</p>
              </div>
            ) : certs.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
                <p style={{ margin: 0 }}>No certificates match your query filters.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.certTable}>
                  <thead>
                    <tr>
                      <th>Recipient / Candidate</th>
                      <th>Type & Stream</th>
                      <th>Score / Grade</th>
                      <th>Unique Credential ID</th>
                      <th>Issued Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certs.map((cert) => {
                      const isRevoking = actionLoadingId === cert.id;
                      const badgeClass =
                        cert.cert_type === 'INTERNSHIP'
                          ? styles.badgeInternship
                          : cert.cert_type === 'TRAINING'
                          ? styles.badgeTraining
                          : cert.cert_type === 'LOR'
                          ? styles.badgeLor
                          : styles.badgeRoadmap;

                      return (
                        <tr key={cert.id}>
                          <td>
                            <div style={{ fontWeight: '750', color: 'var(--text)' }}>{cert.name}</div>
                            {cert.email && (
                              <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{cert.email}</div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <span className={`${styles.certTypeBadge} ${badgeClass}`}>
                                {cert.cert_type || 'ROADMAP'}
                              </span>
                              <span style={{ fontWeight: '600' }}>
                                {cert.stream_or_track || cert.roadmapTitle || 'General Track'}
                              </span>
                            </div>
                            {cert.department && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                                {cert.department}
                              </div>
                            )}
                          </td>
                          <td>
                            {cert.score !== undefined ? (
                              <span style={{ fontWeight: '800', color: 'var(--green)' }}>{cert.score}%</span>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>N/A</span>
                            )}
                          </td>
                          <td>
                            <code style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--accent)' }}>
                              {cert.display_id || cert.id}
                            </code>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                          <td>
                            {cert.is_revoked ? (
                              <span className={styles.statusPillRevoked}>REVOKED</span>
                            ) : (
                              <span className={styles.statusPillActive}>ACTIVE</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem' }}>
                              {/* Verify Link */}
                              <Link
                                href={`/certificate/${encodeURIComponent(cert.id)}`}
                                target="_blank"
                                className={styles.tableActionBtn}
                                title="Open Public Verification Page"
                              >
                                <span>Verify ↗</span>
                              </Link>

                              {/* Toggle Revoke */}
                              <button
                                type="button"
                                onClick={() => handleToggleRevoke(cert)}
                                disabled={isRevoking}
                                className={`${styles.tableActionBtn} ${cert.is_revoked ? '' : styles.tableActionBtnDanger}`}
                                title={cert.is_revoked ? 'Re-instate Credential' : 'Revoke Credential'}
                              >
                                {cert.is_revoked ? '✅ Restore' : '🚫 Revoke'}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteCert(cert)}
                                disabled={isRevoking}
                                className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`}
                                title="Delete Certificate Record"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DESIGN & CANVAS OVERLAY STUDIO */}
      {activeTab === 'studio' && (
        <div className={styles.studioLayout}>
          {/* Controls Left Column */}
          <div className={styles.studioControlsCard}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                🎨 Certificate Design Switcher
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                Simulate Canva / SVG dynamic template overlay placement.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Certificate Design Template</label>
              <select
                value={selectedDesignId}
                onChange={(e) => setSelectedDesignId(e.target.value)}
                className={styles.inputField}
              >
                {TEMPLATE_DESIGNS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                {currentDesign.description}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.65rem' }}>
                Dynamic Overlay Data:
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Student Full Name</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Roadmap / Stream Title</label>
                <input
                  type="text"
                  value={simTrack}
                  onChange={(e) => setSimTrack(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Score / Grade (%)</label>
                  <input
                    type="number"
                    value={simScore}
                    onChange={(e) => setSimScore(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Issued Date</label>
                  <input
                    type="date"
                    value={simDate}
                    onChange={(e) => setSimDate(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Unique Certificate Fingerprint</label>
                <input
                  type="text"
                  value={simCertId}
                  onChange={(e) => setSimCertId(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>

          {/* Canvas Viewport Right Column */}
          <div className={styles.canvasViewport}>
            <div className={styles.canvasTopBar}>
              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text)' }}>
                Preview: {currentDesign.name}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={styles.actionBtnSecondary}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                >
                  🖨️ Print / PDF
                </button>
                <Link
                  href={`/certificate/${encodeURIComponent(simCertId)}`}
                  target="_blank"
                  className={styles.actionBtnSecondary}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--green)' }}
                >
                  🔗 Public Verification Page ↗
                </Link>
              </div>
            </div>

            {/* Visual Template Overlay Mock */}
            <div className={styles.certMockContainer}>
              {currentDesign.bgImage ? (
                <Image
                  src={currentDesign.bgImage}
                  alt={currentDesign.name}
                  width={1120}
                  height={792}
                  className={styles.certTemplateBg}
                  priority
                />
              ) : (
                /* LOR Letterhead Layout */
                <div style={{ padding: '2.5rem 3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0f172a', background: '#ffffff' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #00b87a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '24px', fontWeight: '900', color: '#008751' }}>
                        ꌗꀘꀤ꒒꒒ꌃꀎꈤ
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                        Official Letter of Recommendation
                      </div>
                    </div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', color: '#0f172a' }}>
                      TO WHOMSOEVER IT MAY CONCERN
                    </h3>
                    <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155' }}>
                      This is to certify that <strong>{simName}</strong> has demonstrated exceptional technical competence, engineering agility, and proactive problem solving while contributing to <strong>{simTrack}</strong> at SkillBun.
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '11px', color: '#64748b' }}>
                    <div>
                      <strong>Harsh Patel</strong><br />
                      Lead, SkillBun Platform
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      Ref: <code>{simCertId}</code><br />
                      Verified on skillbun.tech
                    </div>
                  </div>
                </div>
              )}

              {/* Positioned Overlays for Image Templates */}
              {currentDesign.bgImage && (
                <>
                  <div className={styles.overlayStudentName}>
                    {simName}
                  </div>

                  <div className={styles.overlayTrackTitle}>
                    {selectedDesignId === 'ROADMAP' ? `${simTrack} (${simScore}% Score)` : simTrack}
                  </div>

                  <div className={styles.overlayMetaBar}>
                    <div style={{ textAlign: 'left' }}>
                      <div>ISSUED: {simDate}</div>
                      <div className={styles.overlayIdCode}>ID: {simCertId}</div>
                    </div>

                    <div className={styles.overlayQrBlock}>
                      <div className={styles.overlayQrBox}>
                        🏁
                      </div>
                      <span style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>SKILLBUN.TECH</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div>VERIFIED CREDENTIAL</div>
                      <div style={{ color: '#008751', fontWeight: '700' }}>100% AUTHENTIC</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ISSUE / MINT CERTIFICATE */}
      {activeTab === 'mint' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className={styles.studioControlsCard}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                ⚡ Manual Certificate Minting Studio
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
                Directly issue verified Academic or Workforce credentials to students and interns. Generates unambiguous Base32 IDs and registers records into Firestore `/certificates`.
              </p>
            </div>

            <form onSubmit={handleMintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Type Selector */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Certificate Category & Type</label>
                <select
                  value={mintType}
                  onChange={(e) => setMintType(e.target.value)}
                  className={styles.inputField}
                >
                  <option value="ROADMAP">🎓 Academic Roadmap Assessment Certificate</option>
                  <option value="INTERNSHIP">🏢 Certificate of Internship Completion</option>
                  <option value="TRAINING">🛠️ Practical Industry Training Certificate</option>
                  <option value="LOR">📜 Official Letter of Recommendation (LOR)</option>
                </select>
              </div>

              {/* Candidate Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={mintName}
                    onChange={(e) => setMintName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Candidate Email Address</label>
                  <input
                    type="email"
                    value={mintEmail}
                    onChange={(e) => setMintEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@example.com"
                    className={styles.inputField}
                  />
                </div>
              </div>

              {/* Stream / Track Title */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Roadmap / Specialization Track Title *</label>
                <input
                  type="text"
                  required
                  value={mintTrack}
                  onChange={(e) => setMintTrack(e.target.value)}
                  placeholder="e.g. Full Stack Web Development or Advanced AI/ML Engineering"
                  className={styles.inputField}
                />
              </div>

              {/* Conditional Fields based on Type */}
              {mintType === 'ROADMAP' ? (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Assessment Exam Score (%)</label>
                  <input
                    type="number"
                    min={70}
                    max={100}
                    value={mintScore}
                    onChange={(e) => setMintScore(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Department</label>
                      <input
                        type="text"
                        value={mintDepartment}
                        onChange={(e) => setMintDepartment(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Role / Designation</label>
                      <input
                        type="text"
                        value={mintDesignation}
                        onChange={(e) => setMintDesignation(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tenure Start Date</label>
                      <input
                        type="date"
                        value={mintStartDate}
                        onChange={(e) => setMintStartDate(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tenure End Date</label>
                      <input
                        type="date"
                        value={mintEndDate}
                        onChange={(e) => setMintEndDate(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  {mintType === 'LOR' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Custom Letter of Recommendation Body</label>
                      <textarea
                        value={mintLorText}
                        onChange={(e) => setMintLorText(e.target.value)}
                        placeholder="Enter specific performance observations and endorsement text..."
                        className={styles.textareaField}
                        rows={4}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={mintSubmitting}
                className={styles.btnPrimary}
                style={{ marginTop: '0.5rem' }}
              >
                {mintSubmitting ? '⏳ Generating Cryptographic Certificate...' : '⚡ Mint & Register Verified Certificate'}
              </button>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`${styles.statusMessage} ${
                    feedback.type === 'success' ? styles.statusSuccess : styles.statusError
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import styles from './portal.module.css';

export default function InternPortalPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [employee, setEmployee] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [remaskCountdown, setRemaskCountdown] = useState(0);
  const countdownTimerRef = useRef(null);

  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [milestoneFilter, setMilestoneFilter] = useState('ALL');
  const [deliverableInputs, setDeliverableInputs] = useState({});
  const [savingMilestoneId, setSavingMilestoneId] = useState(null);

  const [issuedCerts, setIssuedCerts] = useState([]);

  // Fetch milestones
  const fetchMilestones = async (empId, token) => {
    setLoadingMilestones(true);
    try {
      const res = await fetch(`/api/admin/workforce/milestones?employeeId=${empId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.milestones)) {
        setMilestones(data.milestones);
        const inputs = {};
        data.milestones.forEach((m) => {
          inputs[m.id] = m.deliverable_url || '';
        });
        setDeliverableInputs(inputs);
      }
    } catch (err) {
      console.error('[PORTAL] Failed to fetch milestones:', err);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Initial load
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth?next=/dashboard/console/portal');
      return;
    }

    const loadPortalData = async () => {
      setLoading(true);
      setError('');

      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/portal/credentials', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            router.replace('/dashboard?notice=intern-workspace-access');
            return;
          } else {
            setError(data.error || 'Failed to load workspace data.');
          }
          setLoading(false);
          return;
        }

        setEmployee(data.employee);
        setCredentials(data.credentials);
        setIssuedCerts(Array.isArray(data.certificates) ? data.certificates : []);

        // The milestone route scopes non-admin callers to their own employee email.
        if (data.employee?.id) {
          fetchMilestones(data.employee.id, token);
        }
      } catch (err) {
        console.error('[PORTAL] Error fetching credentials:', err);
        setError('Network error loading workspace.');
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, [user, authLoading, router]);

  // Password reveal & 30s auto-remask
  const togglePasswordReveal = async () => {
    if (passwordRevealed) {
      setPasswordRevealed(false);
      setRemaskCountdown(0);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCredentials((current) => current ? { ...current, password: '' } : current);
    } else {
      try {
        const token = await user?.getIdToken();
        const response = await fetch('/api/portal/credentials?reveal=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setToast(`Unable to reveal password: ${data.error || 'request failed'}`);
          return;
        }
        setCredentials((current) => ({ ...current, ...data.credentials }));
      } catch (err) {
        console.error('[PORTAL] Failed to reveal credentials:', err);
        setToast('Unable to reveal password. Please try again.');
        return;
      }

      setPasswordRevealed(true);
      setRemaskCountdown(30);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      countdownTimerRef.current = setInterval(() => {
        setRemaskCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setPasswordRevealed(false);
            setCredentials((current) => current ? { ...current, password: '' } : current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setToast(`📋 Copied ${label} to clipboard!`);
    });
  };

  // Update milestone status or deliverable URL
  const saveMilestoneProgress = async (milestoneId, newStatus) => {
    if (!user) return;
    setSavingMilestoneId(milestoneId);

    try {
      const token = await user.getIdToken();
      const payload = {
        deliverable_url: deliverableInputs[milestoneId] || '',
      };
      if (newStatus) {
        payload.status = newStatus;
      }

      const res = await fetch(`/api/admin/workforce/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMilestones((prev) =>
          prev.map((m) => (m.id === milestoneId ? { ...m, ...data.milestone } : m))
        );
        setToast('✅ Sprint milestone deliverable updated!');
      } else {
        setToast(`❌ Failed: ${data.error || 'Could not update milestone'}`);
      }
    } catch (err) {
      console.error('[PORTAL] Error updating milestone:', err);
      setToast('❌ Network error updating milestone');
    } finally {
      setSavingMilestoneId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading your Intern Workspace...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className={styles.errorScreen}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2>Intern Workspace Access</h2>
        <p style={{ maxWidth: '500px', color: 'var(--muted)', lineHeight: '1.6' }}>{error}</p>
        <Link href="/dashboard" className={styles.saveBtn} style={{ textDecoration: 'none', display: 'inline-flex', marginTop: '1rem' }}>
          Go to Student Dashboard &rarr;
        </Link>
      </div>
    );
  }

  const filteredMilestones = milestones.filter((m) => {
    if (milestoneFilter === 'ALL') return true;
    return m.status === milestoneFilter;
  });

  return (
    <main className={styles.portalPage}>
      <div className={styles.portalContainer}>
        {toast && (
          <div className={styles.toast} role="alert">
            {toast}
          </div>
        )}

        {/* ── HERO BANNER ── */}
        <section className={styles.portalHero}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>Team Cosmic / SkillBun Intern Workspace</p>
            <h1 className={styles.heroTitle}>Welcome, {employee.full_name}</h1>
            <div className={styles.heroMeta}>
              <span><strong>Designation:</strong> {employee.designation}</span>
              <span>•</span>
              <span><strong>Department:</strong> {employee.department}</span>
              <span>•</span>
              <span><strong>Contract:</strong> {employee.joining_date} to {employee.contract_end_date}</span>
            </div>
          </div>
          <div className={styles.heroRight}>
            <span className={`${styles.statusBadge} ${styles[`status${employee.status}`] || ''}`}>
              ● {employee.status.replace('_', ' ')}
            </span>
            <span className={styles.tenureCountdown}>
              ID: {employee.id}
            </span>
          </div>
        </section>

        {/* ── MAIN CONTENT GRID ── */}
        <div className={styles.portalGridTwoCol}>
          {/* SECTION A: WORKSPACE CREDENTIALS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>🔑 Workspace Credentials</h3>
                <p className={styles.cardSubtitle}>Your authorized Zoho Workspace and enterprise accounts</p>
              </div>
            </div>

            <div className={styles.credentialGroup}>
              <div className={styles.credentialField}>
                <span className={styles.fieldLabel}>Zoho Work Email</span>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldValue}>
                    {credentials?.work_email || employee.personal_email || 'Not configured'}
                  </div>
                  <button
                    type="button"
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(credentials?.work_email || employee.personal_email, 'Work Email')}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className={styles.credentialField}>
                <span className={styles.fieldLabel}>Temporary Access Password</span>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldValue} style={{ letterSpacing: passwordRevealed ? 'normal' : '0.2em' }}>
                    {passwordRevealed ? (credentials?.password || 'No password assigned') : '••••••••••••••••'}
                  </div>
                  <button
                    type="button"
                    className={styles.revealButton}
                    onClick={togglePasswordReveal}
                  >
                    {passwordRevealed ? 'Hide' : 'Reveal 👁️'}
                  </button>
                  {passwordRevealed && (
                    <button
                      type="button"
                      className={styles.copyButton}
                      onClick={() => copyToClipboard(credentials?.password, 'Password')}
                    >
                      Copy
                    </button>
                  )}
                </div>
                {passwordRevealed && (
                  <div className={styles.remaskTimer}>
                    ⏱️ Auto-hiding in {remaskCountdown} seconds
                  </div>
                )}
              </div>

              {credentials?.access_notes && (
                <div className={styles.credentialField}>
                  <span className={styles.fieldLabel}>Access & Onboarding Notes</span>
                  <div className={styles.fieldValue} style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                    {credentials.access_notes}
                  </div>
                </div>
              )}

              <div className={styles.securityNote}>
                <span>🔒</span>
                <span>Credentials are encrypted with AES-256-GCM. Never share these credentials with unauthorized parties.</span>
              </div>
            </div>
          </section>

          {/* SECTION C: OFFICIAL DOCUMENTS & ISSUED CREDENTIALS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>📜 Official Documents & Certificates</h3>
                <p className={styles.cardSubtitle}>Verified credentials and contracts minted for you</p>
              </div>
            </div>

            {issuedCerts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontWeight: '700' }}>No completion certificates issued yet.</p>
                <span style={{ fontSize: '0.84rem' }}>Your Certificate of Internship and LOR will appear here upon completion of your tenure.</span>
              </div>
            ) : (
              <div className={styles.docGrid}>
                {issuedCerts.map((cert) => (
                  <div key={cert.id} className={styles.docItem}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span className={styles.docBadge}>
                          {cert.cert_type === 'INTERNSHIP' ? '🎓' : cert.cert_type === 'TRAINING' ? '📜' : cert.cert_type === 'LOR' ? '✍️' : '🏅'} {cert.cert_type}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {cert.created_at ? new Date(cert.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.2rem' }}>{cert.stream_or_track || 'Verified Track'}</strong>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--muted)' }}>{cert.id}</span>
                    </div>
                    <a
                      href={`/certificate/${cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.docLinkBtn}
                    >
                      View & Share Credential ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SECTION B: MILESTONE SPRINT BOARD */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>🚀 Sprint Milestones & Deliverables</h3>
              <p className={styles.cardSubtitle}>Track tasks, update progress, and submit deliverable pull requests / links</p>
            </div>
            <div className={styles.milestoneFilterBar}>
              {['ALL', 'TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`${styles.filterBtn} ${milestoneFilter === status ? styles.filterBtnActive : ''}`}
                  onClick={() => setMilestoneFilter(status)}
                >
                  {status === 'ALL' ? 'All Tasks' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {loadingMilestones ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading sprint tasks...</div>
          ) : filteredMilestones.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', borderRadius: '12px' }}>
              <strong style={{ display: 'block', marginBottom: '0.35rem' }}>No sprint milestones found in this column.</strong>
              <span style={{ fontSize: '0.85rem' }}>Check other filters or wait for your mentor to assign new sprint tasks.</span>
            </div>
          ) : (
            <div className={styles.milestoneList}>
              {filteredMilestones.map((m) => {
                const isOverdue = m.due_date && new Date(`${m.due_date}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0)) && m.status !== 'COMPLETED';
                const isSaving = savingMilestoneId === m.id;

                return (
                  <div key={m.id} className={`${styles.milestoneItem} ${isOverdue ? styles.milestoneItemOverdue : ''}`}>
                    <div className={styles.milestoneTop}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className={`${styles.priorityBadge} ${styles[`priority${m.priority}`] || ''}`}>
                            {m.priority === 'URGENT' ? '🔴' : m.priority === 'HIGH' ? '🟠' : m.priority === 'MEDIUM' ? '🔵' : '⚪'} {m.priority}
                          </span>
                          <strong style={{ fontSize: '0.98rem' }}>{m.title}</strong>
                        </div>
                        {m.description && (
                          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                            {m.description}
                          </p>
                        )}
                        <span style={{ fontSize: '0.8rem', color: isOverdue ? 'var(--danger)' : 'var(--muted)', fontWeight: isOverdue ? '800' : 'normal' }}>
                          📅 Due Date: {m.due_date || 'No due date'} {isOverdue ? '(Overdue)' : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select
                          value={m.status}
                          onChange={(e) => saveMilestoneProgress(m.id, e.target.value)}
                          disabled={isSaving}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface-raised)',
                            color: 'var(--text)',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="UNDER_REVIEW">Submit for Review</option>
                          <option value="COMPLETED" disabled>Completed (Admin Verified)</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.deliverableRow}>
                      <input
                        type="url"
                        placeholder="Paste deliverable URL (e.g. GitHub PR, Figma link, Notion doc)..."
                        className={styles.deliverableInput}
                        value={deliverableInputs[m.id] !== undefined ? deliverableInputs[m.id] : (m.deliverable_url || '')}
                        onChange={(e) =>
                          setDeliverableInputs({
                            ...deliverableInputs,
                            [m.id]: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={() => saveMilestoneProgress(m.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Submit Deliverable'}
                      </button>
                    </div>

                    {m.review_notes && (
                      <div className={styles.reviewNotesCallout}>
                        <strong>Mentor Review Feedback:</strong> {m.review_notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

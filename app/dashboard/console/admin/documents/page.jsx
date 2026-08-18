'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import styles from './documents.module.css';

const DOC_TYPE_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'OFFER_PACK', label: 'Offer Pack' },
  { key: 'EXTENSION_LETTER', label: 'Extension' },
  { key: 'TERMINATION_NOTICE', label: 'Termination' },
  { key: 'ACTIVATION_WELCOME', label: 'Activation' },
];

const DOC_TYPE_LABELS = {
  OFFER_PACK: 'Offer Pack',
  EXTENSION_LETTER: 'Extension Letter',
  TERMINATION_NOTICE: 'Termination Notice',
  ACTIVATION_WELCOME: 'Activation Welcome',
  UNKNOWN: 'Unknown',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A→Z' },
  { value: 'name_desc', label: 'Name Z→A' },
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function getRecipientName(doc) {
  return doc.metadata_snapshot?.full_name || doc.employee_name || '';
}

/* ── SVG Icons ── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);


export default function DocumentManagerPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { isAdmin, checking } = useAdminAccess(user, authLoading);

  // Core state
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [pagination, setPagination] = useState({ has_more: false, nextPageToken: null });

  // Modal state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // Toast
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);

  // Auth redirect
  const redirectDenied = useCallback(() => {
    router.replace('/dashboard/console/admin');
  }, [router]);

  // Authenticated fetch helper
  const request = useCallback(async (url, options = {}) => {
    const token = await user.getIdToken();
    const response = await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      redirectDenied();
      throw new Error('Admin access is required.');
    }
    if (!response.ok) throw new Error(data?.error?.message || data?.message || 'Request failed.');
    return data;
  }, [user, redirectDenied]);

  // Load documents
  const loadDocuments = useCallback(async ({ append = false, pageToken = null } = {}) => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (activeTab !== 'ALL') params.set('doc_type', activeTab);
      if (pageToken) params.set('pageToken', pageToken);
      const data = await request(`/api/admin/workforce/documents?${params.toString()}`);
      setDocuments(current => append ? [...current, ...(data.documents || [])] : (data.documents || []));
      setPagination({ has_more: data.has_more || false, nextPageToken: data.nextPageToken || null });
    } catch (loadError) {
      if (!/Admin access/.test(loadError.message)) setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, request]);

  // Reload on tab change
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const deniedTimer = window.setTimeout(redirectDenied, 0);
      return () => window.clearTimeout(deniedTimer);
    }
    const loadTimer = window.setTimeout(() => {
      if (isAdmin) loadDocuments();
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [authLoading, user, isAdmin, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Open document detail
  const openDetail = async (doc) => {
    setDetailLoading(true);
    setSelectedDoc(doc);
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    try {
      const data = await request(`/api/admin/workforce/documents/${encodeURIComponent(doc.id)}`);
      const fullDoc = data.document;
      setSelectedDoc(fullDoc);

      // Generate PDF blob URL if available
      if (fullDoc.pdf_base64) {
        const binary = atob(fullDoc.pdf_base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setPdfBlobUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      showToast(`Failed to load document details: ${err.message}`);
      setSelectedDoc(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedDoc(null);
    setDetailLoading(false);
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  };

  // Download PDF
  const downloadPdf = () => {
    if (!pdfBlobUrl || !selectedDoc) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `${selectedDoc.display_id || selectedDoc.id}.pdf`.replace(/\//g, '-');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Revoke / Restore
  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const newState = !revokeTarget.is_revoked;
      await request('/api/admin/workforce/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: revokeTarget.id, is_revoked: newState }),
      });
      showToast(newState ? `Document ${revokeTarget.display_id || revokeTarget.id} revoked.` : `Document ${revokeTarget.display_id || revokeTarget.id} restored.`);

      // Update local state
      setDocuments(prev => prev.map(d => d.id === revokeTarget.id ? { ...d, is_revoked: newState } : d));
      if (selectedDoc?.id === revokeTarget.id) {
        setSelectedDoc(prev => prev ? { ...prev, is_revoked: newState } : prev);
      }
      setRevokeTarget(null);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setRevoking(false);
    }
  };

  // Filter & sort
  const filteredDocs = React.useMemo(() => {
    let result = [...documents];

    // Client-side search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(d => {
        const name = getRecipientName(d).toLowerCase();
        const email = (d.dispatched_to || '').toLowerCase();
        const ref = (d.display_id || d.id || '').toLowerCase();
        const title = (d.title || '').toLowerCase();
        return name.includes(q) || email.includes(q) || ref.includes(q) || title.includes(q);
      });
    }

    // Sort
    if (sortBy === 'oldest') {
      result.sort((a, b) => (a.issued_at || '').localeCompare(b.issued_at || ''));
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => getRecipientName(a).localeCompare(getRecipientName(b)));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => getRecipientName(b).localeCompare(getRecipientName(a)));
    }
    // 'newest' is default from API

    return result;
  }, [documents, search, sortBy]);

  // Counts per tab
  const tabCounts = React.useMemo(() => {
    const counts = { ALL: documents.length };
    for (const doc of documents) {
      counts[doc.doc_type] = (counts[doc.doc_type] || 0) + 1;
    }
    return counts;
  }, [documents]);

  /* ── Auth gates ── */
  if (authLoading || checking) {
    return (
      <div className={styles.page}>
        <div className={styles.grid} />
        <div className={styles.container}>
          <div className={styles.loading}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <p style={{ fontWeight: 600 }}>Verifying admin authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    if (typeof window !== 'undefined') router.replace('/dashboard/console/admin');
    return null;
  }

  /* ── Metadata detail renderer ── */
  const renderMeta = () => {
    if (!selectedDoc) return null;
    const meta = selectedDoc.metadata_snapshot || {};
    const docType = selectedDoc.doc_type;

    return (
      <div className={styles.metaGrid}>
        {/* Common fields */}
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Reference ID</span>
          <span className={styles.metaValue}>{selectedDoc.display_id || selectedDoc.id}</span>
        </div>
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Document Type</span>
          <span className={styles.metaValue}>
            <span className={`${styles.docTypeBadge} ${styles[`type${docType}`] || styles.typeUNKNOWN}`}>
              {DOC_TYPE_LABELS[docType] || docType}
            </span>
          </span>
        </div>
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Status</span>
          <span className={styles.metaValue}>
            <span className={`${styles.statusBadge} ${selectedDoc.is_revoked ? styles.statusRevoked : styles.statusDispatched}`}>
              {selectedDoc.is_revoked ? 'REVOKED' : selectedDoc.status || 'DISPATCHED'}
            </span>
          </span>
        </div>
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Issued Date</span>
          <span className={styles.metaValue}>{formatDateTime(selectedDoc.issued_at)}</span>
        </div>

        <div className={styles.sectionDivider} />
        <div className={styles.sectionLabel}>Recipient Details</div>

        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Full Name</span>
          <span className={styles.metaValue}>{meta.full_name || selectedDoc.employee_name || '—'}</span>
        </div>
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Email</span>
          <span className={styles.metaValue}>{selectedDoc.dispatched_to || meta.personal_email || '—'}</span>
        </div>
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Department</span>
          <span className={styles.metaValue}>{meta.department || '—'}</span>
        </div>
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Designation</span>
          <span className={styles.metaValue}>{meta.designation || '—'}</span>
        </div>

        {/* Offer-specific fields */}
        {(docType === 'OFFER_PACK' || docType === 'EXTENSION_LETTER') && (
          <>
            <div className={styles.sectionDivider} />
            <div className={styles.sectionLabel}>Engagement Details</div>

            {meta.course_degree && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Course / Degree</span>
                <span className={styles.metaValue}>{meta.course_degree}</span>
              </div>
            )}
            {meta.college_name && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>College</span>
                <span className={styles.metaValue}>{meta.college_name}</span>
              </div>
            )}
            {meta.joining_date && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Joining Date</span>
                <span className={styles.metaValue}>{formatDate(meta.joining_date)}</span>
              </div>
            )}
            {meta.contract_end_date && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>{docType === 'EXTENSION_LETTER' ? 'Original End Date' : 'Contract End Date'}</span>
                <span className={styles.metaValue}>{formatDate(meta.contract_end_date)}</span>
              </div>
            )}
            {meta.extended_contract_end_date && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Extended End Date</span>
                <span className={styles.metaValue} style={{ color: 'var(--green)', fontWeight: 900 }}>{formatDate(meta.extended_contract_end_date)}</span>
              </div>
            )}
            {(meta.stipend_amount || meta.stipend_currency) && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Stipend</span>
                <span className={styles.metaValue}>{meta.stipend_currency || '₹'} {meta.stipend_amount || '—'}</span>
              </div>
            )}
          </>
        )}

        {/* Termination-specific fields */}
        {docType === 'TERMINATION_NOTICE' && (
          <>
            <div className={styles.sectionDivider} />
            <div className={styles.sectionLabel}>Termination Details</div>

            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Reason Code</span>
              <span className={styles.metaValue}>{meta.reason_code || '—'}</span>
            </div>
            {meta.reason && (
              <div className={`${styles.metaField} ${styles.metaFullWidth}`}>
                <span className={styles.metaLabel}>Reason</span>
                <span className={styles.metaValue}>{meta.reason}</span>
              </div>
            )}
            {meta.effective_date && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Effective Date</span>
                <span className={styles.metaValue}>{formatDate(meta.effective_date)}</span>
              </div>
            )}
            {meta.granted_credentials?.length > 0 && (
              <div className={`${styles.metaField} ${styles.metaFullWidth}`}>
                <span className={styles.metaLabel}>Granted Credentials</span>
                <div className={styles.credentialsList}>
                  {meta.granted_credentials.map((c, i) => (
                    <span key={i} className={styles.credentialTag}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Activation-specific fields */}
        {docType === 'ACTIVATION_WELCOME' && (
          <>
            <div className={styles.sectionDivider} />
            <div className={styles.sectionLabel}>Activation Details</div>

            {selectedDoc.work_email && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Work Email</span>
                <span className={styles.metaValue}>{selectedDoc.work_email}</span>
              </div>
            )}
            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Credentials Provided</span>
              <span className={styles.metaValue}>{selectedDoc.has_credentials ? 'Yes' : 'No'}</span>
            </div>
            {selectedDoc.subject && (
              <div className={`${styles.metaField} ${styles.metaFullWidth}`}>
                <span className={styles.metaLabel}>Email Subject</span>
                <span className={styles.metaValue}>{selectedDoc.subject}</span>
              </div>
            )}
          </>
        )}

        {/* Issued by */}
        <div className={styles.sectionDivider} />
        <div className={styles.metaField}>
          <span className={styles.metaLabel}>Issued By</span>
          <span className={styles.metaValue}>{selectedDoc.issued_by || '—'}</span>
        </div>
        {selectedDoc.employee_id && (
          <div className={styles.metaField}>
            <span className={styles.metaLabel}>Employee Record ID</span>
            <span className={styles.metaValue} style={{ fontSize: '.78rem', fontFamily: 'monospace' }}>{selectedDoc.employee_id}</span>
          </div>
        )}

        {/* Revocation info */}
        {selectedDoc.is_revoked && (
          <>
            <div className={styles.sectionDivider} />
            <div className={styles.sectionLabel} style={{ color: 'var(--danger)' }}>Revocation Info</div>
            {selectedDoc.revoked_by && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Revoked By</span>
                <span className={styles.metaValue}>{selectedDoc.revoked_by}</span>
              </div>
            )}
            {selectedDoc.revoked_at && (
              <div className={styles.metaField}>
                <span className={styles.metaLabel}>Revoked At</span>
                <span className={styles.metaValue}>{formatDateTime(selectedDoc.revoked_at)}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* ── Main render ── */
  return (
    <div className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.eyebrow}>
              SkillBun Operations •{' '}
              <Link href="/dashboard/console/admin">← Admin Hub</Link> •{' '}
              <Link href="/dashboard/console/admin/workforce">Workforce Hub</Link>
            </p>
            <h1>Document Registry</h1>
            <p className={styles.subtitle}>
              Browse, search, and manage all workforce documents — offer letters, extension letters, termination notices, and activation records.
            </p>
          </div>
        </div>

        {/* Stats row */}
        {!loading && documents.length > 0 && (
          <div className={styles.statRow}>
            <div className={styles.statPill}>
              <FileIcon />
              <strong>{documents.length}</strong> documents loaded
            </div>
            {documents.filter(d => d.is_revoked).length > 0 && (
              <div className={styles.statPill} style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--border))' }}>
                <ShieldIcon />
                <strong style={{ color: 'var(--danger)' }}>{documents.filter(d => d.is_revoked).length}</strong> revoked
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.loading} style={{ minHeight: 'auto', padding: '0.85rem 1rem', marginBottom: '1rem', border: '1px solid color-mix(in srgb, var(--danger) 38%, var(--border))', borderRadius: '12px', background: 'var(--danger-soft)', display: 'flex', gap: '0.65rem' }}>
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            {DOC_TYPE_TABS.map(t => (
              <button
                key={t.key}
                className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                {activeTab === 'ALL' && tabCounts[t.key] != null && (
                  <span>{tabCounts[t.key]}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '.65rem', alignItems: 'center' }}>
            <div className={styles.searchField}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search name, email, ref..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search documents"
              />
            </div>
            <div className={styles.sortField}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort documents">
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button className={styles.refreshButton} onClick={() => loadDocuments()} title="Refresh" aria-label="Refresh documents">
              <RefreshIcon />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading && documents.length === 0 ? (
          <div className={styles.loading}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <p style={{ fontWeight: 600 }}>Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className={styles.empty}>
            <FileIcon />
            <strong>{search ? 'No matching documents' : 'No documents found'}</strong>
            <span>{search ? 'Try adjusting your search query.' : 'Workforce documents will appear here after issuance.'}</span>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Recipient</th>
                    <th>Type</th>
                    <th>Issued</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className={styles.docRow} onClick={() => openDetail(doc)}>
                      <td data-label="Reference">
                        <strong style={{ fontSize: '.82rem', fontFamily: 'monospace' }}>{doc.display_id || doc.id}</strong>
                        <small>{doc.title}</small>
                      </td>
                      <td data-label="Recipient">
                        <strong>{getRecipientName(doc) || '—'}</strong>
                        <small>{doc.dispatched_to}</small>
                      </td>
                      <td data-label="Type">
                        <span className={`${styles.docTypeBadge} ${styles[`type${doc.doc_type}`] || styles.typeUNKNOWN}`}>
                          {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                        </span>
                      </td>
                      <td data-label="Issued">
                        {formatDate(doc.issued_at)}
                        <small>{doc.issued_by}</small>
                      </td>
                      <td data-label="Status">
                        <span className={`${styles.statusBadge} ${doc.is_revoked ? styles.statusRevoked : styles.statusDispatched}`}>
                          {doc.is_revoked ? 'REVOKED' : 'DISPATCHED'}
                        </span>
                      </td>
                      <td data-label="Actions" onClick={e => e.stopPropagation()}>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => openDetail(doc)}
                            title="View Details"
                            aria-label={`View details for ${doc.display_id || doc.id}`}
                          >
                            <EyeIcon /> View
                          </button>
                          <button
                            className={`${styles.actionButton} ${doc.is_revoked ? '' : styles.revokeButton}`}
                            onClick={() => setRevokeTarget(doc)}
                            title={doc.is_revoked ? 'Restore Document' : 'Revoke Document'}
                            aria-label={doc.is_revoked ? `Restore ${doc.display_id}` : `Revoke ${doc.display_id}`}
                          >
                            <ShieldIcon /> {doc.is_revoked ? 'Restore' : 'Revoke'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {pagination.has_more && (
              <div className={styles.loadMoreWrap}>
                <button
                  className={styles.loadMoreButton}
                  onClick={() => loadDocuments({ append: true, pageToken: pagination.nextPageToken })}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Documents'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Detail Modal ── */}
        {selectedDoc && (
          <div className={styles.backdrop} onClick={closeDetail}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{detailLoading ? 'Loading...' : (selectedDoc.display_id || selectedDoc.id)}</h2>
                <button className={styles.refreshButton} onClick={closeDetail} aria-label="Close" style={{ border: 0, background: 'transparent' }}>
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.modalBody}>
                {detailLoading ? (
                  <div className={styles.loading} style={{ minHeight: '200px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <p>Loading document details...</p>
                  </div>
                ) : (
                  <>
                    {renderMeta()}

                    {/* PDF Preview */}
                    {pdfBlobUrl ? (
                      <div className={styles.pdfPreviewWrap}>
                        <div className={styles.pdfPreviewHeader}>
                          <span>PDF Document Preview</span>
                          <button className={styles.actionButton} onClick={downloadPdf}>
                            <DownloadIcon /> Download PDF
                          </button>
                        </div>
                        <iframe
                          className={styles.pdfIframe}
                          src={pdfBlobUrl}
                          title="PDF Preview"
                        />
                      </div>
                    ) : selectedDoc.has_pdf === false ? (
                      <div className={styles.noPdfNotice}>
                        <FileIcon />
                        No PDF stored for this document type.
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {!detailLoading && (
                <div className={styles.modalActions}>
                  {pdfBlobUrl && (
                    <button className={styles.primaryButton} onClick={downloadPdf}>
                      <DownloadIcon /> Download PDF
                    </button>
                  )}
                  <button
                    className={selectedDoc.is_revoked ? styles.primaryButton : styles.dangerButton}
                    onClick={() => setRevokeTarget(selectedDoc)}
                  >
                    <ShieldIcon /> {selectedDoc.is_revoked ? 'Restore Document' : 'Revoke Document'}
                  </button>
                  <button className={styles.secondaryButton} onClick={closeDetail}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Revoke Confirmation Modal ── */}
        {revokeTarget && (
          <div className={styles.backdrop} onClick={() => !revoking && setRevokeTarget(null)}>
            <div className={`${styles.modal} ${styles.confirmModal}`} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 style={{ fontSize: '1.15rem' }}>
                  {revokeTarget.is_revoked ? 'Restore Document' : 'Revoke Document'}
                </h2>
                <button className={styles.refreshButton} onClick={() => setRevokeTarget(null)} disabled={revoking} aria-label="Close" style={{ border: 0, background: 'transparent' }}>
                  <CloseIcon />
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.confirmText}>
                  {revokeTarget.is_revoked ? (
                    <>
                      Are you sure you want to <strong>restore</strong> document{' '}
                      <strong>{revokeTarget.display_id || revokeTarget.id}</strong>?
                      This will mark the document as valid again.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <strong>revoke</strong> document{' '}
                      <strong>{revokeTarget.display_id || revokeTarget.id}</strong>?
                      This will mark the document as invalid. The action can be reversed later.
                    </>
                  )}
                </p>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.secondaryButton} onClick={() => setRevokeTarget(null)} disabled={revoking}>
                  Cancel
                </button>
                <button
                  className={revokeTarget.is_revoked ? styles.primaryButton : styles.dangerButton}
                  onClick={handleRevoke}
                  disabled={revoking}
                >
                  {revoking ? 'Processing...' : (revokeTarget.is_revoked ? 'Restore' : 'Revoke')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={styles.toast} role="status" aria-live="polite">{toast}</div>
        )}
      </div>
    </div>
  );
}

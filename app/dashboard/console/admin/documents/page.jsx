'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import styles from './documents.module.css';

// 4 Official SkillBun Workforce Documents
const PRODUCTION_DOCUMENTS = [
  {
    id: 'workforce_offer',
    category: 'Offer Letter',
    docType: 'OFFER_PACK',
    name: '🏢 4-Page Internship Offer Letter & Engagement Terms',
    prefix: 'HR-OFF',
    defaultHeading: 'INTERNSHIP OFFER LETTER & TERMS OF ENGAGEMENT',
    description: '4-Page formal legal agreement with annexures, code of conduct, IP assignment, and stipend terms.',
    sampleClauses: [
      {
        title: '1. BACKGROUND & ORGANIZATIONAL OVERVIEW',
        text: 'SkillBun operates with a dedicated mission to empower students and early-career software developers with structured roadmap navigation, practical technical skill mastery, and direct production engineering exposure. Through our collaborative internship programs, we bring emerging talent into high-impact environments to build, deploy, and scale world-class developer tools and career discovery platforms.',
      },
      {
        title: '2. SELECTION AS INTERN',
        text: 'Following our structured 4-round technical screening process, SkillBun is pleased to extend this formal offer for the position of {{designation}} within the {{department}}.',
      },
      {
        title: '3. INTERNSHIP STATUS & PURPOSE',
        text: 'This engagement is designed as an intensive experiential learning program aimed at bridging academic coursework with production-grade engineering, agile sprint workflows, and real-world system architecture. This engagement is strictly an internship and does not constitute an employer-employee relationship.',
      },
      {
        title: '4. TENURE & DELIVERABLES',
        text: 'The tenure of this internship shall commence on {{joining_date}} and conclude on {{contract_end_date}}, unless extended by mutual written agreement or terminated earlier pursuant to the provisions herein. The intern shall actively participate in sprint planning, technical standups, and milestone reviews.',
      },
      {
        title: '5. STIPEND & EXPENSES',
        text: 'The candidate shall be entitled to receive a monthly stipend of {{stipend_amount}}, subject to regular milestone progress and sprint deliverable sign-offs.',
      },
      {
        title: '6. CONFIDENTIALITY, IP & CODE OF CONDUCT',
        text: 'The intern agrees not to disclose proprietary source code, system architectures, or confidential platform data. All software source code, algorithms, and technical artifacts created in connection with this internship belong solely to SkillBun Technologies.',
      },
    ],
  },
  {
    id: 'workforce_extension',
    category: 'Extension',
    docType: 'EXTENSION_LETTER',
    name: '📈 Extension of Internship Tenure Addendum',
    prefix: 'HR-EXT',
    defaultHeading: 'EXTENSION OF INTERNSHIP TENURE',
    description: '1-Page legal addendum extending completion date, sprint roadmap, and milestone deliverables.',
    sampleClauses: [
      {
        title: '1. PERFORMANCE APPRECIATION & TENURE EXTENSION',
        text: 'On behalf of SkillBun, we commend your outstanding technical contributions, dedication, and proactive engineering ownership demonstrated throughout your tenure as {{designation}} within the {{department}}.',
      },
      {
        title: '2. REVISED INTERNSHIP PERIOD',
        text: 'In recognition of your performance and ongoing project roadmaps, we are pleased to formally extend your internship engagement effective from {{joining_date}} through {{extended_date}}.',
      },
      {
        title: '3. CONTINUING VALIDITY OF TERMS',
        text: 'All other terms, conditions, confidentiality obligations (NDA), intellectual property assignments, and codes of conduct specified in your original Offer Letter (Ref: {{reference_id}}) shall remain in full force and effect.',
      },
    ],
  },
  {
    id: 'workforce_termination',
    category: 'Termination',
    docType: 'TERMINATION_NOTICE',
    name: '🚪 Notice of Engagement Conclusion & Offboarding Record',
    prefix: 'HR-TERM',
    defaultHeading: 'NOTICE OF ENGAGEMENT CONCLUSION & OFFBOARDING RECORD',
    description: 'Formal separation notice, credential conclusion & alumni document registry archive record.',
    sampleClauses: [
      {
        title: '1. OFFICIAL NOTICE OF ENGAGEMENT CONCLUSION',
        text: 'This document serves as official acknowledgement regarding the formal conclusion of the internship engagement of {{candidate_name}} as {{designation}} in the {{department}}, effective {{contract_end_date}}.',
      },
      {
        title: '2. OFFBOARDING & CREDENTIAL ACCESS',
        text: 'The engagement has concluded under status code COMPLETED upon fulfillment of assigned sprint deliverables. Internal workspace credentials and corporate accounts have been systematically concluded.',
      },
      {
        title: '3. ALUMNI DOCUMENT VAULT ACCESS',
        text: 'All granted completion certificates and tenure records remain permanently archived and publicly verifiable on the SkillBun Alumni Document Vault at https://skillbun.tech/alumni using Reference ID {{reference_id}}.',
      },
    ],
  },
  {
    id: 'workforce_activation',
    category: 'Activation',
    docType: 'ACTIVATION_WELCOME',
    name: '🔑 Day-1 Workspace & Credentials Activation Notice',
    prefix: 'HR-ACT',
    defaultHeading: 'DAY-1 WORKSPACE ACTIVATION & CREDENTIALS ONBOARDING',
    description: 'Corporate Zoho Mail credentials provisioning, team tools onboarding & Day-1 checklist.',
    sampleClauses: [
      {
        title: '1. WELCOME TO SKILLBUN ENGINEERING',
        text: 'We are delighted to confirm that your onboarding documentation has been processed and your status is officially ACTIVE as {{designation}} within the {{department}}, effective from {{joining_date}}.',
      },
      {
        title: '2. PROVISIONED ENTERPRISE WORKSPACE CREDENTIALS',
        text: 'Your official SkillBun enterprise workspace account has been provisioned:\n• Corporate Work Email: {{work_email}}\n• Mail Login Portal: https://mail.zoho.in\n• Security: 2FA Authentication Required on First Login',
      },
      {
        title: '3. GETTING STARTED ON DAY 1',
        text: 'Review the platform developer guidelines and architectural standards. For operational or technical queries, connect directly with founder Harsh Patel at harsh@skillbun.tech.',
      },
    ],
  },
];

export default function DocumentManagerPage() {
  const { user, authLoading } = useAuth();
  const { isAdmin, checking } = useAdminAccess(user, authLoading);

  // Studio Mode: 'registry' | 'studio' | 'issue'
  const [activeTab, setActiveTab] = useState('registry');

  // Registry State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDocForModal, setSelectedDocForModal] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Live PDF & Letterhead Studio Simulator State
  const [selectedDocId, setSelectedDocId] = useState('workforce_offer');
  const [salutation, setSalutation] = useState('Mr.');
  const [candidateName, setCandidateName] = useState('Alex Sharma');
  const [parentName, setParentName] = useState('R. K. Sharma');
  const [personalEmail, setPersonalEmail] = useState('alex.sharma@example.com');
  const [currentAddress, setCurrentAddress] = useState('42 Tech Park Avenue, Bengaluru, Karnataka, 560001');
  const [courseDegree, setCourseDegree] = useState('B.Tech in Computer Science');
  const [collegeName, setCollegeName] = useState('National Institute of Technology');
  const [department, setDepartment] = useState('Core Platform Engineering');
  const [designation, setDesignation] = useState('Software Engineering Intern');
  const [joiningDate, setJoiningDate] = useState('01 September 2026');
  const [contractEndDate, setContractEndDate] = useState('30 November 2026');
  const [stipendAmount, setStipendAmount] = useState('INR 10,000 / month');
  const [signatoryName, setSignatoryName] = useState('Harsh Patel');
  const [signatoryTitle, setSignatoryTitle] = useState('Founder & Lead, SkillBun');
  const [customRefId, setCustomRefId] = useState('SKB/2026/HR-OFF/8K29DF');

  // PDF Preview Engine State
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'html'

  // Issue Form State
  const [issueType, setIssueType] = useState('OFFER_PACK');
  const [issueName, setIssueName] = useState('');
  const [issueEmail, setIssueEmail] = useState('');
  const [issueDegree, setIssueDegree] = useState('B.Tech Computer Science');
  const [issueCollege, setIssueCollege] = useState('University of Technology');
  const [issueDept, setIssueDept] = useState('Core Engineering');
  const [issueDesignation, setIssueDesignation] = useState('Engineering Intern');
  const [issueJoiningDate, setIssueJoiningDate] = useState('');
  const [issueEndDate, setIssueEndDate] = useState('');
  const [issueStipend, setIssueStipend] = useState(10000);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Current selected template
  const currentTemplate = useMemo(() => {
    return PRODUCTION_DOCUMENTS.find((d) => d.id === selectedDocId) || PRODUCTION_DOCUMENTS[0];
  }, [selectedDocId]);

  // Fetch real PDF preview from backend
  const generateLivePdfPreview = useCallback(async () => {
    if (!user || !isAdmin) return;
    setPdfLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/workforce/pdf/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          docType: currentTemplate.docType,
          referenceId: customRefId,
          newContractEndDate: contractEndDate,
          employee: {
            salutation,
            full_name: candidateName,
            parent_name: parentName,
            personal_email: personalEmail,
            current_address: currentAddress,
            course_degree: courseDegree,
            college_name: collegeName,
            department,
            designation,
            joining_date: joiningDate,
            contract_end_date: contractEndDate,
            stipend_amount: parseInt(stipendAmount.replace(/[^0-9]/g, ''), 10) || 10000,
            stipend_currency: 'INR',
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.pdfBase64) {
        setPdfBase64(data.pdfBase64);
      }
    } catch (err) {
      console.error('Failed to generate PDF preview:', err);
    } finally {
      setPdfLoading(false);
    }
  }, [
    user,
    isAdmin,
    currentTemplate.docType,
    customRefId,
    salutation,
    candidateName,
    parentName,
    personalEmail,
    currentAddress,
    courseDegree,
    collegeName,
    department,
    designation,
    joiningDate,
    contractEndDate,
    stipendAmount,
  ]);

  // Debounced auto-refresh of live PDF preview when simulator inputs change
  useEffect(() => {
    if (activeTab === 'studio') {
      const timer = setTimeout(() => {
        generateLivePdfPreview();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeTab, generateLivePdfPreview]);

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoadingDocs(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('doc_type', typeFilter);

      const res = await fetch(`/api/admin/workforce/documents?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  }, [user, isAdmin, typeFilter]);

  // Initial Load
  useEffect(() => {
    let isMounted = true;
    if (user && isAdmin) {
      const init = async () => {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/admin/workforce/documents', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (isMounted && data.success) {
            setDocuments(data.documents || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (isMounted) setLoadingDocs(false);
        }
      };
      init();
    }
    return () => {
      isMounted = false;
    };
  }, [user, isAdmin]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches =
          (doc.display_id || '').toLowerCase().includes(q) ||
          (doc.id || '').toLowerCase().includes(q) ||
          (doc.title || '').toLowerCase().includes(q) ||
          (doc.dispatched_to || '').toLowerCase().includes(q) ||
          (doc.metadata_snapshot?.full_name || '').toLowerCase().includes(q) ||
          (doc.metadata_snapshot?.designation || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter === 'ACTIVE' && doc.is_revoked) return false;
      if (statusFilter === 'REVOKED' && !doc.is_revoked) return false;
      return true;
    });
  }, [documents, searchTerm, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: documents.length,
      offers: documents.filter((d) => d.doc_type === 'OFFER_PACK').length,
      extensions: documents.filter((d) => d.doc_type === 'EXTENSION_LETTER').length,
      active: documents.filter((d) => !d.is_revoked).length,
      revoked: documents.filter((d) => d.is_revoked).length,
    };
  }, [documents]);

  // Toggle Revoke
  const handleToggleRevoke = async (docItem) => {
    const nextState = !docItem.is_revoked;
    const promptMsg = nextState
      ? `Revoke workforce document (${docItem.display_id || docItem.id})?`
      : `Re-instate document (${docItem.display_id || docItem.id})?`;

    if (!window.confirm(promptMsg)) return;

    setActionLoadingId(docItem.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/workforce/documents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ docId: docItem.id, is_revoked: nextState }),
      });

      const data = await res.json();
      if (data.success) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docItem.id ? { ...d, is_revoked: nextState } : d))
        );
      } else {
        alert(data.error || 'Failed to update document status.');
      }
    } catch (err) {
      alert('Error updating status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Download real PDF
  const handleDownloadPdf = async (docItem) => {
    setActionLoadingId(docItem.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/workforce/documents/${encodeURIComponent(docItem.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.document?.pdf_base64) {
        const linkSource = `data:application/pdf;base64,${data.document.pdf_base64}`;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = `${docItem.display_id || docItem.id}.pdf`;
        downloadLink.click();
      } else {
        alert('Binary PDF not cached in storage. Opening printable view.');
        setSelectedDocForModal(docItem);
      }
    } catch (e) {
      alert('Error downloading PDF.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Download Simulated PDF from Studio
  const handleDownloadSimulatedPdf = () => {
    if (!pdfBase64) {
      generateLivePdfPreview();
      return;
    }
    const linkSource = `data:application/pdf;base64,${pdfBase64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = `${customRefId.replace(/[\/\\]/g, '_')}_Official.pdf`;
    downloadLink.click();
  };

  // Issue Form Submit
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueName.trim() || !issueEmail.trim()) {
      setFeedback({ type: 'error', text: 'Candidate name and email are required.' });
      return;
    }

    setIssueSubmitting(true);
    setFeedback(null);

    try {
      const token = await user.getIdToken();
      let endpoint = '/api/admin/workforce/offer';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salutation: 'Mr./Ms.',
          full_name: issueName.trim(),
          personal_email: issueEmail.trim().toLowerCase(),
          course_degree: issueDegree,
          college_name: issueCollege,
          department: issueDept,
          designation: issueDesignation,
          joining_date: issueJoiningDate || new Date().toISOString().slice(0, 10),
          contract_end_date: issueEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          stipend_amount: Number(issueStipend) || 10000,
          generate_pdf: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: `🎉 Document (${data.referenceId || 'Issued'}) created and registered in Document Vault!`,
        });
        setIssueName('');
        setIssueEmail('');
        fetchDocuments();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to issue document.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error generating document.' });
    } finally {
      setIssueSubmitting(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className={styles.docContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', fontWeight: '600' }}>Verifying admin access...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className={styles.docContainer}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '10vh auto' }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: '#ef4444', marginBottom: '0.75rem' }}>
            403 — Unauthorized
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Document Vault is restricted to platform administrators.
          </p>
          <Link href="/dashboard" style={{ background: 'var(--green)', color: '#000', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 800 }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.docContainer}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <h1 className={styles.titleText}>Workforce Document Vault & Studio</h1>
            <span className={styles.securityPill}>🛡️ Legal PDF & Archive Engine</span>
          </div>
          <p className={styles.subtitle}>
            Inspect, live-preview, download, and manage official SkillBun workforce legal agreements, 4-page offer packs, tenure extension addendums, and Day-1 activation records.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard/console/admin" className={styles.actionBtnSecondary}>
            Command Center
          </Link>
          <Link href="/dashboard/console/admin/certificates" className={styles.actionBtnSecondary}>
            Certificate Studio
          </Link>
          <Link href="/dashboard/console/admin/emails" className={styles.actionBtnSecondary}>
            Mail Studio
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--font-fredoka)' }}>{metrics.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Issued Docs</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', fontFamily: 'var(--font-fredoka)' }}>{metrics.offers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>4-Page Offer Packs</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#a855f7', fontFamily: 'var(--font-fredoka)' }}>{metrics.extensions}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Tenure Extensions</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--green)', fontFamily: 'var(--font-fredoka)' }}>{metrics.active}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase' }}>Active Legal Records</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('registry')}
          className={`${styles.mainModeBtn} ${activeTab === 'registry' ? styles.mainModeBtnActive : ''}`}
        >
          <span>📜</span> Issued Documents Vault ({filteredDocuments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`${styles.mainModeBtn} ${activeTab === 'studio' ? styles.mainModeBtnActive : ''}`}
        >
          <span>📄</span> Live PDF & Letterhead Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('issue')}
          className={`${styles.mainModeBtn} ${activeTab === 'issue' ? styles.mainModeBtnActive : ''}`}
        >
          <span>⚡</span> Issue & Register New Document
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: ISSUED DOCUMENTS VAULT                                 */}
      {/* ============================================================ */}
      {activeTab === 'registry' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 0.85rem', flex: 1, minWidth: '260px', maxWidth: '480px' }}>
              <span style={{ color: 'var(--muted)' }}>🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by candidate name, reference ID, designation..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '0.85rem' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 0.75rem', color: 'var(--text)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL">All Document Types</option>
                <option value="OFFER_PACK">Offer Pack (4 Pages)</option>
                <option value="EXTENSION_LETTER">Tenure Extension</option>
                <option value="TERMINATION_NOTICE">Termination Notice</option>
                <option value="ACTIVATION_WELCOME">Activation Welcome</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 0.75rem', color: 'var(--text)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Valid</option>
                <option value="REVOKED">Revoked</option>
              </select>

              <button
                type="button"
                onClick={fetchDocuments}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 0.85rem', color: 'var(--text)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: '600' }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            {loadingDocs ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                <p>⏳ Loading workforce documents from Firestore `/workforce_docs`...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                <p style={{ margin: 0 }}>No workforce documents found matching your filter criteria.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.9rem 1rem' }}>Candidate</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Document Type</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Reference ID</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Issued Date</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((docItem) => {
                      const meta = docItem.metadata_snapshot || {};
                      const isAction = actionLoadingId === docItem.id;

                      return (
                        <tr key={docItem.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ fontWeight: '750', color: 'var(--text)' }}>
                              {meta.full_name || docItem.employee_name || 'Candidate Name'}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                              {docItem.dispatched_to || meta.personal_email || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: docItem.doc_type === 'OFFER_PACK' ? 'rgba(59, 130, 246, 0.15)' :
                                          docItem.doc_type === 'EXTENSION_LETTER' ? 'rgba(168, 85, 247, 0.15)' :
                                          docItem.doc_type === 'TERMINATION_NOTICE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: docItem.doc_type === 'OFFER_PACK' ? '#3b82f6' :
                                     docItem.doc_type === 'EXTENSION_LETTER' ? '#a855f7' :
                                     docItem.doc_type === 'TERMINATION_NOTICE' ? '#ef4444' : 'var(--green)',
                            }}>
                              {docItem.doc_type}
                            </span>
                            <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                              {meta.designation || docItem.title}
                            </div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <code style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--accent)' }}>
                              {docItem.display_id || docItem.id}
                            </code>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {docItem.issued_at ? new Date(docItem.issued_at).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            {docItem.is_revoked ? (
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.74rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                REVOKED
                              </span>
                            ) : (
                              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', fontSize: '0.74rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                VALID
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedDocForModal(docItem)}
                                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                👁️ View
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(docItem)}
                                disabled={isAction}
                                style={{ background: 'var(--green)', border: 'none', color: '#000', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                📥 PDF
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleRevoke(docItem)}
                                disabled={isAction}
                                style={{
                                  background: 'var(--surface-raised)',
                                  border: '1px solid var(--border)',
                                  color: docItem.is_revoked ? 'var(--green)' : '#ef4444',
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                {docItem.is_revoked ? 'Restore' : 'Revoke'}
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

      {/* ============================================================ */}
      {/* TAB 2: LIVE PDF & LETTERHEAD STUDIO                           */}
      {/* ============================================================ */}
      {activeTab === 'studio' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Controls Left */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                📄 Document Template Switcher
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                Live simulator matching the exact SkillBun legal PDF layout helper.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)' }}>Document Type</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
              >
                {PRODUCTION_DOCUMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                {currentTemplate.description}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.65rem' }}>
                Candidate & Contract Variables:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Salutation</label>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Candidate Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Joining Date</label>
                  <input
                    type="text"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Contract End Date</label>
                  <input
                    type="text"
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Monthly Stipend</label>
                <input
                  type="text"
                  value={stipendAmount}
                  onChange={(e) => setStipendAmount(e.target.value)}
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '700' }}>Reference ID</label>
                <input
                  type="text"
                  value={customRefId}
                  onChange={(e) => setCustomRefId(e.target.value)}
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', color: 'var(--text)', fontSize: '0.82rem', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Live Preview (Right): REAL PDF Engine Viewer & HTML Toggle */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text)' }}>
                Exact Output: {currentTemplate.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'var(--surface-raised)', padding: '0.2rem', borderRadius: '8px', display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('pdf')}
                    style={{
                      background: viewMode === 'pdf' ? 'var(--green)' : 'transparent',
                      color: viewMode === 'pdf' ? '#000' : 'var(--muted)',
                      border: 'none',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    📄 Real PDF View (Multi-Page)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('html')}
                    style={{
                      background: viewMode === 'html' ? 'var(--green)' : 'transparent',
                      color: viewMode === 'html' ? '#000' : 'var(--muted)',
                      border: 'none',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    📝 Clean A4 Letterhead
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSimulatedPdf}
                  style={{ background: 'var(--green)', color: '#000', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  📥 Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* REAL PDF IFRAME PREVIEW */}
            {viewMode === 'pdf' ? (
              <div style={{ width: '100%', minHeight: '840px', background: '#525659', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {pdfLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: '#ffffff', fontWeight: '700', fontSize: '1rem' }}>
                    ⏳ Compiling Real PDF with pdf-lib...
                  </div>
                )}
                {pdfBase64 ? (
                  <iframe
                    src={`data:application/pdf;base64,${pdfBase64}#toolbar=1&navpanes=1`}
                    title="Real PDF Preview"
                    style={{ width: '100%', height: '840px', border: 'none' }}
                  />
                ) : (
                  <div style={{ padding: '4rem', textAlign: 'center', color: '#ffffff' }}>
                    <p>Generating PDF preview...</p>
                  </div>
                )}
              </div>
            ) : (
              /* CLEAN HTML A4 LETTERHEAD VIEW */
              <div className={styles.a4DocumentCanvas} style={{ maxWidth: '820px', margin: '0 auto', background: '#ffffff', color: '#0f172a', padding: '3rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 12px 36px rgba(0,0,0,0.15)', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '13.5px', lineHeight: '1.65' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #008751', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Image src="/logo.png" alt="SkillBun" width={40} height={40} style={{ borderRadius: '8px' }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '22px', fontWeight: '900', color: '#008751' }}>
                        ꌗꀘꀤ꒒꒒ꌃꀎꈤ
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        SkillBun Technologies • Engineering Workforce Division
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#64748b' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{customRefId}</div>
                    <div>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1.15rem', marginBottom: '1.5rem', fontSize: '12.5px' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>TO: {salutation} {candidateName}</strong>
                  {parentName && <span> (S/o or D/o {parentName})</span>}<br />
                  <span>Address: {currentAddress}</span><br />
                  <span>Academic Record: {courseDegree} • {collegeName}</span><br />
                  <strong style={{ color: '#008751' }}>Designation: {designation} — {department}</strong>
                </div>

                <div style={{ textAlign: 'center', background: '#f1f5f9', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: '900', letterSpacing: '0.04em', color: '#0f172a', fontSize: '14px', marginBottom: '1.5rem' }}>
                  {currentTemplate.defaultHeading}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#334155' }}>
                  {currentTemplate.sampleClauses.map((clause, idx) => {
                    let text = clause.text
                      .replace(/{{designation}}/g, designation)
                      .replace(/{{department}}/g, department)
                      .replace(/{{joining_date}}/g, joiningDate)
                      .replace(/{{contract_end_date}}/g, contractEndDate)
                      .replace(/{{extended_date}}/g, contractEndDate)
                      .replace(/{{stipend_amount}}/g, stipendAmount)
                      .replace(/{{candidate_name}}/g, candidateName)
                      .replace(/{{reference_id}}/g, customRefId)
                      .replace(/{{work_email}}/g, `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '')}@skillbun.tech`);

                    return (
                      <div key={idx}>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '12.5px', marginBottom: '0.2rem' }}>
                          {clause.title}
                        </div>
                        <div style={{ whiteSpace: 'pre-line' }}>{text}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2rem' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px' }}>{signatoryName}</strong>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>{signatoryTitle}</span><br />
                    <span style={{ fontSize: '11px', color: '#008751', fontWeight: '800' }}>SkillBun Technologies</span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#64748b' }}>
                    <div style={{ border: '1px solid #008751', color: '#008751', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: '800', marginBottom: '0.25rem' }}>
                      OFFICIALLY ISSUED • SKILLBUN HR
                    </div>
                    <div>Verify at https://skillbun.tech/alumni</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ISSUE & REGISTER NEW DOCUMENT                          */}
      {/* ============================================================ */}
      {activeTab === 'issue' && (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                ⚡ Manual Workforce Document Issuance
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
                Issue an official legal agreement, offer letter pack, or extension letter. Generates cryptographic reference ID, registers record in Firestore `/workforce_docs`, and pre-compiles PDF.
              </p>
            </div>

            <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Document Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                >
                  <option value="OFFER_PACK">🏢 4-Page Internship Offer Letter & Terms</option>
                  <option value="EXTENSION_LETTER">📈 Tenure Extension Addendum</option>
                  <option value="TERMINATION_NOTICE">🚪 Notice of Conclusion / Offboarding</option>
                  <option value="ACTIVATION_WELCOME">🔑 Day-1 Workspace Activation</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={issueName}
                    onChange={(e) => setIssueName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Candidate Email *</label>
                  <input
                    type="email"
                    required
                    value={issueEmail}
                    onChange={(e) => setIssueEmail(e.target.value)}
                    placeholder="e.g. alex.sharma@example.com"
                    style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Department</label>
                  <input
                    type="text"
                    value={issueDept}
                    onChange={(e) => setIssueDept(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Designation</label>
                  <input
                    type="text"
                    value={issueDesignation}
                    onChange={(e) => setIssueDesignation(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Joining Date</label>
                  <input
                    type="date"
                    value={issueJoiningDate}
                    onChange={(e) => setIssueJoiningDate(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Contract End Date</label>
                  <input
                    type="date"
                    value={issueEndDate}
                    onChange={(e) => setIssueEndDate(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>Monthly Stipend (INR)</label>
                <input
                  type="number"
                  value={issueStipend}
                  onChange={(e) => setIssueStipend(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text)', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={issueSubmitting}
                style={{ background: 'var(--green)', color: '#000', border: 'none', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                {issueSubmitting ? '⏳ Generating PDF & Storing in Vault...' : '⚡ Issue Document & Save to Vault'}
              </button>

              {feedback && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.84rem', background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: feedback.type === 'success' ? 'var(--green)' : '#ef4444', border: '1px solid currentColor' }}>
                  {feedback.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDocForModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedDocForModal(null)}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem', color: 'var(--text)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-fredoka)', fontSize: '1.25rem' }}>
                Document Details: {selectedDocForModal.display_id || selectedDocForModal.id}
              </h3>
              <button onClick={() => setSelectedDocForModal(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div><strong>Document Type:</strong> {selectedDocForModal.doc_type}</div>
              <div><strong>Candidate Name:</strong> {selectedDocForModal.metadata_snapshot?.full_name || selectedDocForModal.employee_name || 'N/A'}</div>
              <div><strong>Email:</strong> {selectedDocForModal.dispatched_to || selectedDocForModal.metadata_snapshot?.personal_email || 'N/A'}</div>
              <div><strong>Designation & Dept:</strong> {selectedDocForModal.metadata_snapshot?.designation} ({selectedDocForModal.metadata_snapshot?.department})</div>
              <div><strong>Issued Date:</strong> {selectedDocForModal.issued_at ? new Date(selectedDocForModal.issued_at).toLocaleString('en-IN') : 'N/A'}</div>
              <div><strong>Status:</strong> {selectedDocForModal.is_revoked ? 'REVOKED' : 'ACTIVE VALID'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedDocForModal(null)} style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                Close
              </button>
              <button onClick={() => handleDownloadPdf(selectedDocForModal)} style={{ background: 'var(--green)', color: '#000', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}>
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

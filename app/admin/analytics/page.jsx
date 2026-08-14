'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { RETENTION_TEMPLATES } from '@/utils/server/retentionEmails';
import StudentRowDetails from './components/StudentRowDetails';
import CertificatesRegistry from './components/CertificatesRegistry';

function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return 'N/A';
  }
}

const ALL_15_MARKETING_TEMPLATES = [
  'welcome_v1', 'welcome_v2', 'welcome_v3',
  'reengagement_v1', 'reengagement_v2', 'reengagement_v3',
  'exam_nudge_v1', 'exam_nudge_v2', 'exam_nudge_v3',
  'exam_failed_v1', 'exam_failed_v2', 'exam_failed_v3',
  'cert_congrats_v1', 'cert_congrats_v2', 'cert_congrats_v3',
];

// Smart Non-Repeating & Auto-Shuffling Retention Template Recommender
function getRecommendedTemplate(u) {
  const sentLogs = Array.isArray(u.sentEmailHistory) ? u.sentEmailHistory : [];
  const sentTemplateIds = sentLogs.map((item) => (typeof item === 'string' ? item : item.templateId));

  const certCount = u.certificates?.length || 0;
  const hasAttempts = u.quizAttempts?.length > 0;
  const maxNodes = u.progress?.reduce((max, p) => Math.max(max, p.completedNodeIds?.length || 0), 0) || 0;
  const daysInactive = u.lastSignInTime
    ? (Date.now() - new Date(u.lastSignInTime).getTime()) / (1000 * 60 * 60 * 24)
    : 0;

  // Determine priority variations based on student telemetry
  let priorityList = [];

  if (certCount > 0) {
    priorityList = ['cert_congrats_v1', 'cert_congrats_v2', 'cert_congrats_v3', 'reengagement_v1', 'welcome_v2'];
  } else if (hasAttempts) {
    priorityList = ['exam_failed_v1', 'exam_failed_v2', 'exam_failed_v3', 'reengagement_v1', 'welcome_v1'];
  } else if (maxNodes >= 15) {
    priorityList = ['exam_nudge_v1', 'exam_nudge_v2', 'exam_nudge_v3', 'reengagement_v1', 'welcome_v1'];
  } else if (daysInactive >= 1.5 && maxNodes > 0) {
    priorityList = ['reengagement_v1', 'reengagement_v2', 'reengagement_v3', 'welcome_v1', 'exam_nudge_v1'];
  } else {
    priorityList = ['welcome_v1', 'welcome_v2', 'welcome_v3', 'reengagement_v1', 'exam_nudge_v1'];
  }

  // Filter out templates already sent to this user
  let unsentCandidate = priorityList.find((id) => !sentTemplateIds.includes(id));

  // If all priority ones sent, pick any unsent from the full 15 library
  if (!unsentCandidate) {
    unsentCandidate = ALL_15_MARKETING_TEMPLATES.find((id) => !sentTemplateIds.includes(id));
  }

  // If everything has been sent at least once, rotate back to the least-recently sent
  if (!unsentCandidate) {
    unsentCandidate = priorityList[0];
  }

  const templateDef = RETENTION_TEMPLATES[unsentCandidate] || { name: unsentCandidate };

  let reason = 'General Onboarding';
  if (certCount > 0) reason = 'Certified Graduate';
  else if (hasAttempts) reason = 'Exam Retake Motivation';
  else if (maxNodes >= 15) reason = 'Roadmap Milestone Nudge';
  else if (daysInactive >= 1.5) reason = 'Inactivity Recovery';

  return {
    id: unsentCandidate,
    name: templateDef.name || unsentCandidate,
    reason,
  };
}

export default function AdminAnalyticsPage() {
  const { user, profile, authLoading } = useAuth();
  const [usersData, setUsersData] = useState([]);
  const [certificatesData, setCertificatesData] = useState([]);
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'certs'
  const [loading, setLoading] = useState(true);
  const [certsLoading, setCertsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [certSearchTerm, setCertSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedUserUid, setExpandedUserUid] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [sendingEmailKey, setSendingEmailKey] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [deletingUid, setDeletingUid] = useState(null);
  const [previewModalContent, setPreviewModalContent] = useState(null);

  const { isAdmin, isFounder, role, checking } = useAdminAccess(user, authLoading);
  const userEmail = (user?.email || '').toLowerCase().trim();

  useEffect(() => {
    let isMounted = true;

    async function fetchAdminData() {
      if (authLoading || checking) return;
      if (!user || !isAdmin) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user data via admin API
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/analytics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.users && Array.isArray(data.users)) {
            setUsersData(data.users);
            if (data.certificates && Array.isArray(data.certificates)) {
              setCertificatesData(data.certificates);
            }
            setLoading(false);
            return;
          }
        }

        // Client-side fallback with parallel fetching
        const { db } = getFirebaseServices();
        if (!db) {
          throw new Error('Firestore client is not initialized.');
        }

        // Fetch certificates
        try {
          const certsSnap = await getDocs(collection(db, 'certificates'));
          const certsList = certsSnap.docs.map((d) => {
            const cData = d.data();
            return {
              id: d.id,
              ...cData,
              createdAt: cData.createdAt ? (cData.createdAt.toDate ? cData.createdAt.toDate().toISOString() : cData.createdAt) : null,
            };
          });
          certsList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          if (isMounted) setCertificatesData(certsList);
        } catch (cErr) {
          console.warn('[Certificates Client Fetch Warning]', cErr);
        }

        // Fetch users in parallel
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = await Promise.all(
          usersSnapshot.docs.map(async (userDoc) => {
            const uData = userDoc.data();
            const uid = userDoc.id;

            let progress = [];
            let quizAttempts = [];

            try {
              const progressSnap = await getDocs(collection(db, `users/${uid}/roadmapProgress`));
              progress = progressSnap.docs.map((d) => d.data());
            } catch {}

            try {
              const attemptsSnap = await getDocs(collection(db, `users/${uid}/quizAttempts`));
              quizAttempts = attemptsSnap.docs.map((d) => d.data());
            } catch {}

            return {
              uid,
              name: uData.fullName || uData.name || uData.displayName || 'Anonymous',
              email: uData.email || 'No email',
              degree: uData.degree || 'Not specified',
              year: uData.current_year || uData.year || 'Not specified',
              interest: uData.interest_area || uData.interest || 'Not specified',
              providers: uData.providers || [],
              createdAt: uData.createdAt ? (uData.createdAt.toDate ? uData.createdAt.toDate().toISOString() : uData.createdAt) : null,
              lastSignInTime: uData.updatedAt ? (uData.updatedAt.toDate ? uData.updatedAt.toDate().toISOString() : uData.updatedAt) : null,
              sentEmailHistory: uData.sentEmailHistory || [],
              isUnsubscribed: uData.isUnsubscribed || false,
              unsubscribedAt: uData.unsubscribedAt || null,
              progress,
              quizAttempts,
              certificates: [],
            };
          })
        );

        if (isMounted) {
          setUsersData(usersList);
        }
      } catch (err) {
        console.error('[Admin Analytics Fetch]', err);
        if (isMounted) setError(err.message || 'Failed to load telemetry database.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAdminData();

    return () => {
      isMounted = false;
    };
  }, [user, isAdmin, authLoading, checking]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteUser = async (targetUser) => {
    const confirmDelete = window.confirm(
      `⚠️ PERMANENT PURGE WARNING\n\nAre you absolutely sure you want to delete user "${targetUser.name}" (${targetUser.email})?\n\nThis will purge their Firestore profile, learning progress, quiz attempts, and certificates permanently.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingUid(targetUser.uid);
      const token = await user.getIdToken();
      await fetch(`/api/admin/users/${targetUser.uid}?adminEmail=${encodeURIComponent(userEmail)}&email=${encodeURIComponent(targetUser.email || '')}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Also clean up client Firestore if accessible
      const { db } = getFirebaseServices();
      if (db) {
        await deleteDoc(doc(db, 'users', targetUser.uid));
      }

      setUsersData((prev) => prev.filter((u) => u.uid !== targetUser.uid));
      showToast(`✅ Successfully deleted user ${targetUser.email}`);
    } catch (err) {
      console.error('[Delete User]', err);
      showToast(`❌ Failed to delete user: ${err.message}`);
    } finally {
      setDeletingUid(null);
    }
  };

  const handleSendRetentionEmail = async (targetUser, templateId, forceOverride = false, isPreview = false) => {
    const actionKey = isPreview ? `${targetUser.uid}-preview` : forceOverride ? `${targetUser.uid}-force` : `${targetUser.uid}-send`;
    setSendingEmailKey(actionKey);

    try {
      if (!isPreview && !forceOverride) {
        const confirmSend = window.confirm(
          `Send email "${templateId}" to ${targetUser.name} (${targetUser.email}) via Zoho SMTP?`
        );
        if (!confirmSend) {
          setSendingEmailKey(null);
          return;
        }
      }

      const token = await user.getIdToken();
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUser: {
            uid: targetUser.uid,
            email: targetUser.email,
            name: targetUser.name,
            interest: targetUser.interest,
            degree: targetUser.degree,
            year: targetUser.year,
            completedNodesCount: targetUser.progress?.reduce((acc, p) => acc + (p.completedNodeIds?.length || 0), 0) || 0,
            roadmapTitle: targetUser.progress?.[0]?.slug || 'Software Engineering',
          },
          templateId,
          forceOverride,
          isPreview,
          adminEmail: userEmail,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!data) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      if (isPreview && data.success && data.preview) {
        setPreviewModalContent(data.preview);
        return;
      }

      if (data.success) {
        showToast(data.message || `✅ Email "${templateId}" dispatched successfully to ${targetUser.email}`);
        setUsersData((prev) =>
          prev.map((u) => {
            if (u.uid === targetUser.uid) {
              const currentHistory = Array.isArray(u.sentEmailHistory) ? u.sentEmailHistory : [];
              const updatedHistory = [...currentHistory, { templateId, sentAt: new Date().toISOString(), adminEmail: userEmail, forceOverride }];
              return { ...u, sentEmailHistory: updatedHistory };
            }
            return u;
          })
        );
      } else {
        showToast(`⚠️ ${data.error || 'Failed to dispatch email.'}`);
      }
    } catch (err) {
      console.error('[Send Retention Email]', err);
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setSendingEmailKey(null);
    }
  };

  const filteredUsers = usersData.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.interest && u.interest.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'unsubscribed') return u.isUnsubscribed;
    if (filterType === 'has_certs') return u.certificates && u.certificates.length > 0;
    if (filterType === 'active_progress') {
      const maxNodes = u.progress?.reduce((max, p) => Math.max(max, p.completedNodeIds?.length || 0), 0) || 0;
      return maxNodes > 0;
    }
    return true;
  });

  const filteredCerts = certificatesData.filter((c) => {
    return (
      (c.name && c.name.toLowerCase().includes(certSearchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(certSearchTerm.toLowerCase())) ||
      (c.roadmapTitle && c.roadmapTitle.toLowerCase().includes(certSearchTerm.toLowerCase())) ||
      (c.stream_or_track && c.stream_or_track.toLowerCase().includes(certSearchTerm.toLowerCase())) ||
      (c.id && c.id.toLowerCase().includes(certSearchTerm.toLowerCase()))
    );
  });

  if (authLoading || checking || (loading && !usersData.length)) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2.5rem' }}>🐰</div>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>⏳ Verifying admin privileges...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--text)', marginBottom: '0.75rem' }}>
            Admin Authentication Required
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            This section is restricted to authorized platform administrators. Please sign in to continue.
          </p>
          <Link href="/auth?next=/admin/analytics" style={{ background: 'var(--green)', color: '#000', padding: '0.85rem 1.75rem', borderRadius: '10px', fontWeight: '700', textDecoration: 'none' }}>
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid #ef4444', borderRadius: '16px', padding: '3rem', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: '#ef4444', marginBottom: '0.75rem' }}>
            403 — Unauthorized Access
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Signed in as <strong>{userEmail}</strong>. This account does not possess administrator permissions for SkillBun.
          </p>
          <Link href="/dashboard" style={{ background: 'var(--surface-raised)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
            ← Back to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '90vh' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#000', color: '#fff', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid var(--green)', zIndex: 9999, fontWeight: '600', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      {/* Preview Modal */}
      {previewModalContent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>Subject: {previewModalContent.subject}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>To: {previewModalContent.to}</div>
              </div>
              <button onClick={() => setPreviewModalContent(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#fff', color: '#000' }} dangerouslySetInnerHTML={{ __html: previewModalContent.html }} />
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button onClick={() => setPreviewModalContent(null)} style={{ background: 'var(--green)', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Unified Navigation Rail */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.65rem', color: 'var(--text)' }}>
              SkillBun Admin Database & Analytics
            </h1>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
              PROD TELEMETRY
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Live student activity, roadmap progress, certification registry & targeted Zoho SMTP retention engine.
          </p>
        </div>

        {/* Unified Admin Nav Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-raised)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
            🏠 Admin Hub
          </Link>
          <Link href="/admin/workforce" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-raised)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
            👥 Workforce Hub
          </Link>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-raised)', color: 'var(--muted)', border: '1px solid var(--border)', padding: '0.45rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
            ← Student Dashboard
          </Link>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)', marginTop: '0.3rem' }}>{usersData.length}</div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Active Learners</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--green)', marginTop: '0.3rem' }}>
            {usersData.filter((u) => u.progress?.length > 0).length}
          </div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Exam Attempted</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#3b82f6', marginTop: '0.3rem' }}>
            {usersData.filter((u) => u.quizAttempts?.length > 0).length}
          </div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Certificates Issued</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#a855f7', marginTop: '0.3rem' }}>
            {certificatesData.length || usersData.reduce((acc, u) => acc + (u.certificates?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('telemetry')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'telemetry' ? 'var(--green)' : 'transparent',
            color: activeTab === 'telemetry' ? '#000' : 'var(--text)',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          👤 Student Profiles & Email CRM ({filteredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'certs' ? 'var(--green)' : 'transparent',
            color: activeTab === 'certs' ? '#000' : 'var(--text)',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          📜 Certificate Registry ({certificatesData.length})
        </button>
      </div>

      {activeTab === 'telemetry' && (
        <>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              placeholder="Search by student name, email, interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'var(--card-bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                fontSize: '0.9rem',
                width: '100%',
                maxWidth: '400px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'active_progress', 'has_certs', 'unsubscribed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: filterType === f ? '1px solid var(--green)' : '1px solid var(--border)',
                    background: filterType === f ? 'rgba(16, 185, 129, 0.15)' : 'var(--card-bg)',
                    color: filterType === f ? 'var(--green)' : 'var(--muted)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Student Table */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Student</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Degree / Year</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Interest</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Progress</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Certificates</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                        No students match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isExpanded = expandedUserUid === u.uid;
                      const completedNodes = u.progress?.reduce((acc, p) => acc + (p.completedNodeIds?.length || 0), 0) || 0;
                      return (
                        <React.Fragment key={u.uid}>
                          <tr
                            style={{
                              borderBottom: '1px solid var(--border)',
                              background: isExpanded ? 'var(--surface-raised)' : 'transparent',
                              transition: 'background 0.2s',
                            }}
                          >
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: '700', color: 'var(--text)' }}>{u.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{u.email}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--text)' }}>
                              <div>{u.degree}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{u.year}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--text)' }}>{u.interest}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ color: completedNodes > 0 ? 'var(--green)' : 'var(--muted)', fontWeight: '700' }}>
                                {completedNodes} nodes
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {u.certificates?.length > 0 ? (
                                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.75rem' }}>
                                  🎓 {u.certificates.length} cert(s)
                                </span>
                              ) : (
                                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>0</span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {u.isUnsubscribed ? (
                                <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.75rem' }}>🔕 Unsubscribed</span>
                              ) : (
                                <span style={{ color: 'var(--green)', fontWeight: '700', fontSize: '0.75rem' }}>🔔 Active</span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <button
                                onClick={() => setExpandedUserUid(isExpanded ? null : u.uid)}
                                style={{
                                  background: isExpanded ? 'var(--text)' : 'var(--surface-raised)',
                                  color: isExpanded ? 'var(--bg)' : 'var(--text)',
                                  border: '1px solid var(--border)',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                {isExpanded ? '▲ Hide' : '▼ Manage'}
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <StudentRowDetails
                              u={u}
                              formatDateTime={formatDateTime}
                              selectedTemplates={selectedTemplates}
                              setSelectedTemplates={setSelectedTemplates}
                              sendingEmailKey={sendingEmailKey}
                              handleSendRetentionEmail={handleSendRetentionEmail}
                              handleDeleteUser={handleDeleteUser}
                              isDeleting={deletingUid === u.uid}
                              setExpandedUserUid={setExpandedUserUid}
                              getRecommendedTemplate={getRecommendedTemplate}
                            />
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'certs' && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by student name, cert ID, roadmap track..."
              value={certSearchTerm}
              onChange={(e) => setCertSearchTerm(e.target.value)}
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                fontSize: '0.9rem',
                width: '100%',
                maxWidth: '400px',
                outline: 'none',
              }}
            />
          </div>
          <CertificatesRegistry
            loading={certsLoading}
            filteredCerts={filteredCerts}
            searchTerm={certSearchTerm}
          />
        </div>
      )}
    </div>
  );
}

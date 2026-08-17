'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { RETENTION_TEMPLATES, generateRetentionEmailHtml } from '@/utils/server/retentionEmails';

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
  } catch {
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
    priorityList = ['welcome_v1', 'welcome_v2', 'welcome_v3', 'reengagement_v1', 'reengagement_v2'];
  }

  let unsentTemplateId = priorityList.find((tId) => !sentTemplateIds.includes(tId));
  if (!unsentTemplateId) {
    unsentTemplateId = ALL_15_MARKETING_TEMPLATES.find((tId) => !sentTemplateIds.includes(tId));
  }
  if (!unsentTemplateId) {
    unsentTemplateId = priorityList[0];
  }

  const templateConfig = RETENTION_TEMPLATES[unsentTemplateId] || RETENTION_TEMPLATES.welcome_v1;
  const alreadySentCount = sentTemplateIds.length;

  return {
    id: unsentTemplateId,
    label: templateConfig.name,
    isRotated: alreadySentCount > 0,
    alreadySentCount,
  };
}

export default function AnalyticsDashboardPage() {
  const { user, authLoading } = useAuth();
  const { isAdmin, isFounder, role, checking } = useAdminAccess(user, authLoading);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'certs' || tabParam === 'certificates') {
        return 'certificates';
      }
    }
    return 'users';
  });
  const [expandedUserUid, setExpandedUserUid] = useState(null);
  const [deletingUid, setDeletingUid] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [previewModalContent, setPreviewModalContent] = useState(null);

  // Retention email template selection state per user
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [sendingEmailKey, setSendingEmailKey] = useState(null);

  const userEmail = (user?.email || '').trim().toLowerCase();

  useEffect(() => {
    if (authLoading || checking) return;
    if (!user || !isAdmin) return;

    let active = true;

    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        let token = '';
        if (user?.getIdToken) {
          try {
            token = await user.getIdToken();
          } catch {}
        }

        const res = await fetch('/api/admin/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const resData = await res.json().catch(() => ({}));

        if (!active) return;

        let users = Array.isArray(resData.users) ? resData.users : [];
        let certificates = Array.isArray(resData.certificates) ? resData.certificates : [];

        // Client-side fallback if server Admin API returned empty or credential missing
        if ((!users || users.length === 0) && (!certificates || certificates.length === 0)) {
          try {
            const { db } = getFirebaseServices();
            if (db) {
              const certsSnap = await getDocs(collection(db, 'certificates'));
              certificates = certsSnap.docs.map((d) => {
                const cData = d.data();
                return {
                  id: d.id,
                  certId: d.id,
                  uid: cData.uid || '',
                  name: cData.name || cData.studentName || cData.userName || 'Student',
                  email: cData.email || cData.userEmail || '',
                  roadmapTitle: cData.roadmapTitle || cData.roadmapSlug || 'Roadmap',
                  roadmapSlug: cData.roadmapSlug || '',
                  score: typeof cData.score === 'number' ? cData.score : 0,
                  createdAt: cData.createdAt ? new Date(cData.createdAt.toDate?.() || cData.createdAt).toISOString() : new Date().toISOString(),
                };
              });

              const usersSnap = await getDocs(collection(db, 'users'));
              users = await Promise.all(
                usersSnap.docs.map(async (d) => {
                  const uData = d.data();
                  const uid = d.id;
                  const uCerts = certificates.filter(
                    (c) => c.uid === uid || (c.email && uData.email && c.email.toLowerCase() === uData.email.toLowerCase())
                  );

                  let progress = [];
                  let quizAttempts = [];

                  try {
                    const progSnap = await getDocs(collection(db, `users/${uid}/roadmapProgress`));
                    progress = progSnap.docs.map((p) => p.data());
                  } catch {}

                  try {
                    const quizSnap = await getDocs(collection(db, `users/${uid}/quizAttempts`));
                    quizAttempts = quizSnap.docs.map((q) => q.data());
                  } catch {}

                  return {
                    uid,
                    name: uData.name || uData.displayName || uData.fullName || 'Registered Student',
                    email: uData.email || 'N/A',
                    degree: uData.degree || 'N/A',
                    year: uData.year || uData.current_year || 'N/A',
                    interest: uData.interest || uData.interest_area || 'N/A',
                    providers: Array.isArray(uData.providers) ? uData.providers : [],
                    createdAt: uData.createdAt ? new Date(uData.createdAt.toDate?.() || uData.createdAt).toISOString() : null,
                    lastSignInTime: uData.updatedAt ? new Date(uData.updatedAt.toDate?.() || uData.updatedAt).toISOString() : (uData.createdAt ? new Date(uData.createdAt.toDate?.() || uData.createdAt).toISOString() : null),
                    isUnsubscribed: Boolean(uData.isUnsubscribed),
                    unsubscribedAt: uData.unsubscribedAt || null,
                    progress,
                    quizAttempts,
                    sentEmailHistory: Array.isArray(uData.sentEmailHistory) ? uData.sentEmailHistory : [],
                    certificates: uCerts,
                  };
                })
              );
            }
          } catch (clientErr) {
            console.warn('[Analytics Client Fallback Error]:', clientErr);
          }
        }

        if (active) {
          setData({
            stats: {
              totalStudents: users.length,
              totalCertificates: certificates.length,
              totalRoadmaps: resData.stats?.totalRoadmaps || 100,
              quizQuestionBank: resData.stats?.quizQuestionBank || 3335,
            },
            users,
            certificates,
          });
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAnalyticsData();

    return () => {
      active = false;
    };
  }, [user, isAdmin, authLoading, checking]);

  // CSV Export functionality
  const handleExportCSV = () => {
    const usersList = data?.users || [];
    if (usersList.length === 0) {
      alert('No user data available to export.');
      return;
    }

    const headers = ['UID', 'Name', 'Email', 'Subscribed Status', 'Unsubscribed Date', 'Degree', 'Year', 'Target Interest', 'Roadmaps Count', 'Exam Attempts Count', 'Certificates Count', 'Emails Sent Count', 'Joined Date', 'Last Login Time'];
    const rows = usersList.map((u) => [
      `"${u.uid}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${u.isUnsubscribed ? 'Unsubscribed' : 'Subscribed'}"`,
      `"${formatDateTime(u.unsubscribedAt)}"`,
      `"${(u.degree || '').replace(/"/g, '""')}"`,
      `"${(u.year || '').replace(/"/g, '""')}"`,
      `"${(u.interest || '').replace(/"/g, '""')}"`,
      u.progress?.length || 0,
      u.quizAttempts?.length || 0,
      u.certificates?.length || 0,
      u.sentEmailHistory?.length || 0,
      `"${formatDateTime(u.createdAt)}"`,
      `"${formatDateTime(u.lastSignInTime)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SkillBun_Student_Database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete User Handler
  const handleDeleteUser = async (targetUser) => {
    const confirmMsg = `⚠️ DELETE USER CONFIRMATION ⚠️\n\nAre you sure you want to permanently delete student "${targetUser.name}" (${targetUser.email})?\n\nThis will permanently delete their profile, active roadmap progress, and Auth account. The email "${targetUser.email}" will be freed up for a brand new account signup.\n\nProceed with deletion?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingUid(targetUser.uid);
    setStatusMessage(null);

    try {
      let idToken = '';
      if (user?.getIdToken) {
        try {
          idToken = await user.getIdToken();
        } catch {}
      }

      await fetch(`/api/admin/users/${targetUser.uid}?adminEmail=${encodeURIComponent(userEmail)}&email=${encodeURIComponent(targetUser.email || '')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      });

      try {
        const { db } = getFirebaseServices();
        if (db) {
          await deleteDoc(doc(db, 'users', targetUser.uid));
        }
      } catch (clientDelErr) {
        console.warn('[Client Delete Fallback Warning]:', clientDelErr);
      }

      setData((prev) => {
        if (!prev) return prev;
        const updatedUsers = (prev.users || []).filter((u) => u.uid !== targetUser.uid);
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalStudents: updatedUsers.length,
          },
          users: updatedUsers,
        };
      });

      if (expandedUserUid === targetUser.uid) {
        setExpandedUserUid(null);
      }

      setStatusMessage({
        type: 'success',
        text: `✅ Student account "${targetUser.name}" (${targetUser.email}) successfully deleted! Email is now freed up for new registration.`,
      });
    } catch (err) {
      console.error('User deletion error:', err);
      setStatusMessage({ type: 'error', text: `❌ Failed to delete user: ${err.message}` });
    } finally {
      setDeletingUid(null);
    }
  };

  // Instant HTML Preview Modal Handler (Synchronous Client Rendering with 0ms Latency)
  const handlePreviewEmail = (targetUser) => {
    try {
      if (!targetUser) return;
      const recommended = getRecommendedTemplate(targetUser);
      const templateId = selectedTemplates[targetUser.uid] || recommended?.id || 'welcome_v1';

      const roadmapTitle =
        targetUser.progress?.[0]?.slug
          ? String(targetUser.progress[0].slug).replace(/_/g, ' ').toUpperCase()
          : targetUser.interest && targetUser.interest !== 'N/A'
          ? String(targetUser.interest)
          : 'Full Stack Web Development';

      const progressCount = Number(targetUser.progress?.[0]?.completedNodeIds?.length) || 12;

      const { subject, html } = generateRetentionEmailHtml(templateId, {
        name: targetUser.name || 'Student',
        email: targetUser.email || 'harsh@skillbun.tech',
        roadmapTitle,
        progressCount,
        degree: targetUser.degree || 'B.Tech - Computer Science',
      });

      setPreviewModalContent({
        templateId,
        subject: subject || 'SkillBun Update',
        html: html || '<p>Email Preview</p>',
        to: targetUser.email || 'harsh@skillbun.tech',
        studentName: targetUser.name || 'Student',
      });
    } catch (previewErr) {
      console.error('Preview error:', previewErr);
      setStatusMessage({ type: 'error', text: `❌ Preview Error: ${previewErr.message}` });
    }
  };

  // Retention Email Dispatcher Handler (Sample Send to Admin or Live Send to Student)
  const handleSendRetentionEmail = async (targetUser, isSampleTest = false, forceOverride = false) => {
    const recommended = getRecommendedTemplate(targetUser);
    const templateId = selectedTemplates[targetUser.uid] || recommended.id;
    const actionKey = `${targetUser.uid}-${isSampleTest ? 'sample' : forceOverride ? 'force' : 'send'}`;

    let confirmPrompt = '';
    if (isSampleTest) {
      confirmPrompt = `🧪 SEND SAMPLE TEST CONFIRMATION 🧪\n\nSend a real test email copy of "${templateId.toUpperCase()}" to harsh@skillbun.tech via Zoho SMTP for inbox inspection?`;
    } else if (forceOverride) {
      confirmPrompt = `⚠️ FORCE SEND (OVERRIDE UNSUBSCRIBE) CONFIRMATION ⚠️\n\nCandidate "${targetUser.name}" (${targetUser.email}) has UNSUBSCRIBED from marketing updates.\n\nAre you sure you want to FORCE DISPATCH template "${templateId.toUpperCase()}" anyway?`;
    } else {
      confirmPrompt = `🚀 LIVE CANDIDATE DISPATCH CONFIRMATION 🚀\n\nSend live retention email to candidate "${targetUser.name}" (${targetUser.email}) using template "${templateId.toUpperCase()}"?\n\nCandidate Auto-Filled Data:\n• Name: ${targetUser.name}\n• Email: ${targetUser.email}\n• Degree: ${targetUser.degree}`;
    }

    if (!window.confirm(confirmPrompt)) return;

    setSendingEmailKey(actionKey);
    setStatusMessage(null);

    try {
      let idToken = '';
      if (user?.getIdToken) {
        try {
          idToken = await user.getIdToken();
        } catch {}
      }

      const roadmapTitle =
        targetUser.progress?.[0]?.slug
          ? targetUser.progress[0].slug.replace(/_/g, ' ').toUpperCase()
          : targetUser.interest && targetUser.interest !== 'N/A'
          ? targetUser.interest
          : 'Full Stack Web Development';

      const progressCount = targetUser.progress?.[0]?.completedNodeIds?.length || 12;

      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          recipientEmail: isSampleTest ? 'harsh@skillbun.tech' : targetUser.email,
          studentName: targetUser.name,
          templateId,
          roadmapTitle,
          progressCount,
          degree: targetUser.degree,
          isPreview: false,
          forceOverride,
          adminEmail: userEmail,
        }),
      });

      let resData = null;
      let rawText = '';
      try {
        rawText = await res.text();
        resData = JSON.parse(rawText);
      } catch {
        resData = null;
      }

      if (!res.ok || !resData?.success) {
        let extractedError = resData?.error || resData?.message;
        let diagnosticDetails = resData?.stack || resData?.details || (resData ? JSON.stringify(resData, null, 2) : rawText);
        if (!extractedError) {
          if (rawText) {
            extractedError = `HTTP ${res.status}: ${rawText.slice(0, 300)}`;
          } else {
            extractedError = `HTTP ${res.status} (${res.statusText || 'Server Error'})`;
          }
        }
        const err = new Error(extractedError);
        err.diagnosticDetails = diagnosticDetails;
        throw err;
      }

      if (!isSampleTest) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedUsers = (prev.users || []).map((u) => {
            if (u.uid === targetUser.uid) {
              const currentHistory = Array.isArray(u.sentEmailHistory) ? u.sentEmailHistory : [];
              const updatedHistory = [...currentHistory, { templateId, sentAt: new Date().toISOString(), adminEmail: userEmail, forceOverride }];
              return { ...u, sentEmailHistory: updatedHistory };
            }
            return u;
          });
          return { ...prev, users: updatedUsers };
        });

        setSelectedTemplates((prev) => {
          const copy = { ...prev };
          delete copy[targetUser.uid];
          return copy;
        });
      }

      setStatusMessage({
        type: 'success',
        text: resData.message || (isSampleTest ? '✅ Sample test email sent to harsh@skillbun.tech!' : `✅ Retention email sent to ${targetUser.email}!`),
      });
    } catch (emailErr) {
      console.error('Retention email send error:', emailErr);
      setStatusMessage({
        type: 'error',
        text: `❌ Failed to send retention email: ${emailErr.message}`,
        details: emailErr.diagnosticDetails || emailErr.stack || String(emailErr),
      });
    } finally {
      setSendingEmailKey(null);
    }
  };

  if (authLoading || checking) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', color: 'var(--text)' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>⏳ Verifying admin privileges...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--card-shadow)', color: 'var(--text)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.8rem', marginTop: 0 }}>
          Admin Authentication Required
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          This section is restricted to authorized platform administrators. Please sign in with your admin account.
        </p>
        <Link href="/auth?next=/dashboard/console/admin/analytics" className="btn-primary" style={{ display: 'inline-block', padding: '0.8rem 1.6rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700' }}>
          🌐 Sign in with Google
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid #ef4444', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--card-shadow)', color: 'var(--text)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
        <h1 style={{ fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.8rem', marginTop: 0, color: '#ef4444' }}>
          403 — Access Denied
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Signed in as <strong>{userEmail}</strong>. This account does not possess administrator permissions for SkillBun.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-block', padding: '0.8rem 1.6rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700' }}>
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const usersList = data?.users || [];
  const certsList = data?.certificates || [];

  const stats = data?.stats || {
    totalStudents: usersList.length,
    totalCertificates: certsList.length,
    totalRoadmaps: 100,
    quizQuestionBank: 3335,
  };

  const searchLower = searchTerm.trim().toLowerCase();

  const filteredUsers = usersList.filter((u) => {
    if (!searchLower) return true;
    return (
      (u.name || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.degree || '').toLowerCase().includes(searchLower) ||
      (u.interest || '').toLowerCase().includes(searchLower) ||
      (u.uid || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredCerts = certsList.filter((c) => {
    if (!searchLower) return true;
    return (
      (c.name || '').toLowerCase().includes(searchLower) ||
      (c.email || '').toLowerCase().includes(searchLower) ||
      (c.roadmapTitle || '').toLowerCase().includes(searchLower) ||
      (c.id || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '85vh', color: 'var(--text)' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--green-subtle)', color: 'var(--green)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }}></span>
            {isFounder ? '👑 Founder Master Admin • Real Platform Telemetry' : `🛡️ ${role?.toUpperCase() || 'ADMIN'} • Real Platform Telemetry`}
          </div>
          <h1 style={{ fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '2.2rem', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            SkillBun Admin Database & Analytics
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Real-time access to registered student profiles, last login timestamps, exam attempts, and certificates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            style={{
              cursor: 'pointer',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--green)',
              color: 'var(--green)',
              fontWeight: '700',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            📥 Export Database (CSV)
          </button>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard/console/admin" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: '600', fontSize: '0.88rem' }}>
              ← Admin Hub
            </Link>
            <Link href="/dashboard/console/admin/workforce" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: '600', fontSize: '0.88rem' }}>
              👥 Workforce Hub
            </Link>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--muted)', fontWeight: '600', fontSize: '0.88rem' }}>
            ← Student Dashboard
          </Link>
        </div>
      </div>

      {/* Notification Toast with Diagnostic Console */}
      {statusMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          background: statusMessage.type === 'success' ? 'var(--green-subtle)' : 'rgba(239, 68, 68, 0.15)',
          color: statusMessage.type === 'success' ? 'var(--green)' : '#ef4444',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--green)' : '#ef4444'}`,
          fontWeight: '700',
          fontSize: '0.9rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginLeft: '1rem' }}
            >
              ✕
            </button>
          </div>
          {statusMessage.details && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔍 Full Diagnostic Server Payload:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(statusMessage.details);
                    alert('📋 Diagnostic payload copied to clipboard!');
                  }}
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid currentColor',
                    color: 'inherit',
                    borderRadius: '4px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  📋 Copy Diagnostic Error
                </button>
              </div>
              <pre style={{
                margin: 0,
                padding: '0.75rem',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)',
                color: 'var(--text)',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '220px',
                overflowY: 'auto',
                fontWeight: '400',
              }}>
                {statusMessage.details}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Instant Email HTML Preview Modal */}
      {previewModalContent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1.25rem' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--green)', letterSpacing: '0.5px' }}>
                  Live Email Template Preview ({previewModalContent.templateId})
                </span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', color: 'var(--text)' }}>
                  Subject: {previewModalContent.subject}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                  Candidate: <strong>{previewModalContent.studentName || 'Student'}</strong> ({previewModalContent.to})
                </div>
              </div>
              <button
                onClick={() => setPreviewModalContent(null)}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text)' }}
              >
                ✕
              </button>
            </div>
            <div
              style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#05070a' }}
              dangerouslySetInnerHTML={{ __html: previewModalContent.html }}
            />
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setPreviewModalContent(null)}
                style={{ background: 'var(--green)', color: '#000', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }}
              >
                Done Previewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Students</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--green)', marginTop: '0.2rem' }}>
            {loading ? '...' : stats.totalStudents}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Issued Certificates</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'var(--font-fredoka), sans-serif', color: '#a855f7', marginTop: '0.2rem' }}>
            {loading ? '...' : stats.totalCertificates}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tech Roadmaps</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--text)', marginTop: '0.2rem' }}>
            {stats.totalRoadmaps}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question Bank</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--text)', marginTop: '0.2rem' }}>
            {stats.quizQuestionBank}+
          </div>
        </div>
      </div>

      {/* Main Database & Registry Section */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', boxShadow: 'var(--card-shadow)' }}>
        {/* Navigation Tabs & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                cursor: 'pointer',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'users' ? 'var(--green)' : 'transparent',
                color: activeTab === 'users' ? '#000' : 'var(--muted)',
                fontWeight: '700',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              👥 Registered Students ({usersList.length})
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              style={{
                cursor: 'pointer',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'certificates' ? 'var(--green)' : 'transparent',
                color: activeTab === 'certificates' ? '#000' : 'var(--muted)',
                fontWeight: '700',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              📜 Issued Certificates ({certsList.length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="🔍 Search name, email, degree, interest, cert ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '280px',
              }}
            />
            <Link
              href="/certificate"
              style={{
                textDecoration: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                background: 'var(--green-subtle)',
                border: '1px solid var(--green)',
                color: 'var(--green)',
                fontWeight: '700',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              🌐 Public Cert Verification
            </Link>
          </div>
        </div>

        {/* TAB 1: Registered Students Table */}
        {activeTab === 'users' && (
          <div>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <p>⏳ Loading real student records from Firestore...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                {searchTerm ? (
                  <p style={{ margin: 0 }}>No student records match "{searchTerm}".</p>
                ) : (
                  <p style={{ margin: 0 }}>No student accounts registered in Firestore database yet. New signups will automatically appear here in real-time.</p>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Student / Email</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Email Status</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Degree & Year</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Target Interest</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Last Active / Login</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Roadmaps / Exams</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Sent Emails</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', minWidth: '200px' }}>Actions & Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isExpanded = expandedUserUid === u.uid;
                      const isDeleting = deletingUid === u.uid;

                      const recommended = getRecommendedTemplate(u);
                      const currentTemplate = selectedTemplates[u.uid] || recommended.id;
                      const isPreviewModalLoading = sendingEmailKey === `${u.uid}-preview-modal`;
                      const isSampleLoading = sendingEmailKey === `${u.uid}-sample`;
                      const isSendLoading = sendingEmailKey === `${u.uid}-send`;
                      const isForceLoading = sendingEmailKey === `${u.uid}-force`;
                      const sentLogs = Array.isArray(u.sentEmailHistory) ? u.sentEmailHistory : [];

                      return (
                        <React.Fragment key={u.uid}>
                          {/* Standard User Row */}
                          <tr
                            style={{
                              borderBottom: isExpanded ? 'none' : '1px solid var(--border)',
                              background: isExpanded ? 'var(--surface-raised)' : 'transparent',
                              transition: 'background 0.2s ease',
                            }}
                          >
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontWeight: '700', color: 'var(--text)' }}>{u.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', wordBreak: 'break-word' }}>{u.email}</div>
                            </td>

                            {/* Email Subscription Status Badge */}
                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              {u.isUnsubscribed ? (
                                <span
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    border: '1px solid #ef4444',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '0.78rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1.2',
                                  }}
                                  title={u.unsubscribedAt ? `Unsubscribed on ${formatDateTime(u.unsubscribedAt)}` : 'Unsubscribed'}
                                >
                                  🔕 Unsubscribed
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: 'var(--green-subtle)',
                                    color: 'var(--green)',
                                    border: '1px solid var(--green)',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '0.78rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1.2',
                                  }}
                                >
                                  🔔 Subscribed
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text)' }}>
                              <span style={{ fontWeight: '600' }}>{u.degree}</span>
                              {u.year && u.year !== 'N/A' && <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Year {u.year}</span>}
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text)' }}>
                              <span style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-block' }}>
                                {u.interest}
                              </span>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--green)' }}>
                                🕒 {formatDateTime(u.lastSignInTime)}
                              </div>
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                                {u.progress?.length || 0} roadmaps
                              </div>
                              {u.quizAttempts?.length > 0 && (
                                <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                                  📝 {u.quizAttempts.length} Exam Attempts
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '0.85rem 0.5rem' }}>
                              <span
                                style={{
                                  background: sentLogs.length > 0 ? 'var(--green-subtle)' : 'var(--surface-raised)',
                                  color: sentLogs.length > 0 ? 'var(--green)' : 'var(--muted)',
                                  border: `1px solid ${sentLogs.length > 0 ? 'var(--green)' : 'var(--border)'}`,
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '12px',
                                  fontWeight: '800',
                                  fontSize: '0.78rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  whiteSpace: 'nowrap',
                                  lineHeight: '1.2',
                                }}
                              >
                                📬 {sentLogs.length} Sent
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedUserUid(isExpanded ? null : u.uid)}
                                  style={{
                                    cursor: 'pointer',
                                    background: isExpanded ? 'var(--green)' : 'var(--surface-raised)',
                                    color: isExpanded ? '#000' : 'var(--text)',
                                    border: '1px solid var(--border)',
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {isExpanded ? 'Hide Details ▲' : 'View Data ▾'}
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteUser(u)}
                                  style={{
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '8px',
                                    fontWeight: '800',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                    opacity: isDeleting ? 0.6 : 1,
                                  }}
                                  title="Delete User & Free Email Address"
                                >
                                  {isDeleting ? '⏳ Deleting...' : '🗑️ Delete User'}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Dropdown Accordion Row DIRECTLY UNDER THIS USER */}
                          {isExpanded && (
                            <tr style={{ background: 'var(--surface-raised)', borderBottom: '2px solid var(--green)' }}>
                              <td colSpan={8} style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                  <h4 style={{ margin: 0, fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.05rem', color: 'var(--green)' }}>
                                    👤 Linked Profile & Activity Breakdown: {u.name} ({u.email})
                                  </h4>
                                  <button
                                    onClick={() => setExpandedUserUid(null)}
                                    style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 'bold', fontSize: '1rem' }}
                                  >
                                    ✕ Close
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                  {/* Profile Details */}
                                  <div>
                                    <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                                      👤 Account & Activity Timestamps
                                    </h4>
                                    <div style={{ fontSize: '0.82rem', lineHeight: '1.8', color: 'var(--text)' }}>
                                      <div><strong>UID:</strong> <code style={{ fontSize: '0.78rem' }}>{u.uid}</code></div>
                                      <div><strong>Full Name:</strong> {u.name}</div>
                                      <div><strong>Email:</strong> {u.email}</div>
                                      <div>
                                        <strong>Subscription Status:</strong>{' '}
                                        {u.isUnsubscribed ? (
                                          <span style={{ color: '#ef4444', fontWeight: '800' }}>🔕 UNSUBSCRIBED {u.unsubscribedAt ? `(${formatDateTime(u.unsubscribedAt)})` : ''}</span>
                                        ) : (
                                          <span style={{ color: 'var(--green)', fontWeight: '800' }}>🔔 Active Subscriber</span>
                                        )}
                                      </div>
                                      <div><strong>Degree Program:</strong> {u.degree}</div>
                                      <div><strong>Academic Year:</strong> {u.year}</div>
                                      <div><strong>Primary Interest:</strong> {u.interest}</div>
                                      <div><strong>Auth Providers:</strong> {u.providers?.join(', ') || 'Password'}</div>
                                      <div style={{ marginTop: '0.4rem', color: 'var(--green)', fontWeight: '700' }}>
                                        <strong>🕒 Last Login / Active:</strong> {formatDateTime(u.lastSignInTime)}
                                      </div>
                                      <div><strong>📅 Account Joined Date:</strong> {formatDateTime(u.createdAt)}</div>
                                    </div>
                                  </div>

                                  {/* Active Roadmap Progress */}
                                  <div>
                                    <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                                      🗺️ Roadmap Activity ({u.progress?.length || 0})
                                    </h4>
                                    {u.progress?.length > 0 ? (
                                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text)' }}>
                                        {u.progress.map((p, idx) => (
                                          <li key={idx} style={{ marginBottom: '0.3rem' }}>
                                            <strong>{p.slug}</strong> — {p.completedNodeIds?.length || 0} nodes finished
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>No active roadmap progress logged yet.</p>
                                    )}
                                  </div>

                                  {/* Exam Appearances & Quiz Attempts */}
                                  <div>
                                    <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.5px' }}>
                                      📝 Cert Exam Appearances ({u.quizAttempts?.length || 0})
                                    </h4>
                                    {u.quizAttempts?.length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {u.quizAttempts.map((q, idx) => (
                                          <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text)' }}>{q.slug}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                              Appeared: <strong>{q.attemptsCount || 1} time(s)</strong>
                                            </div>
                                            {q.lastAttemptAt && (
                                              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                                                Last Attempt: {formatDateTime(q.lastAttemptAt)}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
                                        No cert exam attempts logged yet. (Exams unlock at 60% roadmap progress).
                                      </p>
                                    )}
                                  </div>

                                  {/* Sent Email History Box */}
                                  <div>
                                    <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--green)', letterSpacing: '0.5px' }}>
                                      📬 Sent Email History ({sentLogs.length})
                                    </h4>
                                    {sentLogs.length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
                                        {sentLogs.map((log, idx) => (
                                          <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--green)' }}>
                                              ✔ {log.templateId} {log.forceOverride ? '(FORCE OVERRIDDEN)' : ''}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                                              Sent: {formatDateTime(log.sentAt)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>No retention emails sent to this candidate yet.</p>
                                    )}
                                  </div>
                                </div>

                                {/* ONE-CLICK RETENTION EMAIL DISPATCHER WITH PREVIEW, SAMPLE TEST & FORCE SEND CONTROLS */}
                                <div
                                  style={{
                                    background: u.isUnsubscribed ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 229, 153, 0.08)',
                                    border: `1.5px solid ${u.isUnsubscribed ? '#ef4444' : 'var(--green)'}`,
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    marginTop: '1.5rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                      <strong style={{ color: u.isUnsubscribed ? '#ef4444' : 'var(--green)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        📧 SkillBun Retention Email Engine & Subscription Control
                                      </strong>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                        Status:{' '}
                                        {u.isUnsubscribed ? (
                                          <strong style={{ color: '#ef4444' }}>🔕 UNSUBSCRIBED {u.unsubscribedAt ? `(${formatDateTime(u.unsubscribedAt)})` : ''}</strong>
                                        ) : (
                                          <strong style={{ color: 'var(--green)' }}>🔔 ACTIVE SUBSCRIBER</strong>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Smart Non-Repeating Auto-Recommendation Banner */}
                                  <div
                                    style={{
                                      background: 'var(--surface-raised)',
                                      border: `1px solid ${u.isUnsubscribed ? '#ef4444' : 'var(--green)'}`,
                                      padding: '0.6rem 0.85rem',
                                      borderRadius: '8px',
                                      marginBottom: '0.9rem',
                                      fontSize: '0.82rem',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                      gap: '0.5rem',
                                    }}
                                  >
                                    <div>
                                      ✨ <strong>Smart Recommendation (Next Unsent):</strong>{' '}
                                      <span style={{ color: u.isUnsubscribed ? '#ef4444' : 'var(--green)', fontWeight: '800' }}>{recommended.label}</span>
                                      {recommended.isRotated && (
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--green-subtle)', color: 'var(--green)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>
                                          🔄 Auto-Rotated ({recommended.alreadySentCount} sent)
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedTemplates((prev) => ({ ...prev, [u.uid]: recommended.id }))}
                                      style={{
                                        cursor: 'pointer',
                                        padding: '0.25rem 0.7rem',
                                        borderRadius: '6px',
                                        background: u.isUnsubscribed ? '#ef4444' : 'var(--green)',
                                        color: '#ffffff',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      🎯 Apply Next Unsent
                                    </button>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* 18 Variations Grouped Email Template Selector */}
                                    <select
                                      value={currentTemplate}
                                      onChange={(e) => setSelectedTemplates((prev) => ({ ...prev, [u.uid]: e.target.value }))}
                                      style={{
                                        padding: '0.65rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-raised)',
                                        color: 'var(--text)',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        flex: '1',
                                        minWidth: '280px',
                                      }}
                                    >
                                      <optgroup label="1. ONBOARDING & ACTIVATION (NEW SIGNUP)">
                                        <option value="welcome_v1">🚀 V1: ₹35,000 Course Value Unlocked Free (Greed Angle)</option>
                                        <option value="welcome_v2">🚀 V2: 2026 Tech Salary Benchmark (Competitive Angle)</option>
                                        <option value="welcome_v3">🚀 V3: $500 Encrypted SBV1 Vault Access (Privilege Angle)</option>
                                      </optgroup>

                                      <optgroup label="2. RE-ENGAGEMENT STREAK NUDGE (INACTIVE USER)">
                                        <option value="reengagement_v1">🐰 V1: Rank & Streak Decaying Alert (Loss Aversion)</option>
                                        <option value="reengagement_v2">🐰 V2: 3-Minute Quick Win to Exam Ticket (Quick Progress)</option>
                                        <option value="reengagement_v3">🐰 V3: Recruiter Queue Visibility Alert (Placement Angle)</option>
                                      </optgroup>

                                      <optgroup label="3. CERTIFICATION EXAM READY NUDGE (60%+ PROGRESS)">
                                        <option value="exam_nudge_v1">🎓 V1: Top 7% Elite Candidate Invitation (Status Angle)</option>
                                        <option value="exam_nudge_v2">🎓 V2: Free ₹15,000 Proctored Exam Ticket (High Value Gift)</option>
                                        <option value="exam_nudge_v3">🎓 V3: Recruiters Verifying SkillBun QR Links (Job Proof)</option>
                                      </optgroup>

                                      <optgroup label="4. EXAM COOLDOWN ENCOURAGEMENT (FAILED ATTEMPT)">
                                        <option value="exam_failed_v1">📚 V1: 100% Free Unlimited Retake Ticket (Zero Risk)</option>
                                        <option value="exam_failed_v2">📚 V2: Review SBV1 Encrypted Study Vault (Pass Guarantee)</option>
                                        <option value="exam_failed_v3">📚 V3: Missed Passing by Just 2 Questions (High Confidence)</option>
                                      </optgroup>

                                      <optgroup label="5. CERTIFICATE ACHIEVED (ALUMNI UPSELL)">
                                        <option value="cert_congrats_v1">🏆 V1: Verified Specialist Status & QR Badge (Credential)</option>
                                        <option value="cert_congrats_v2">🏆 V2: Next High-Salary Track Combo (Multi-Skill Upsell)</option>
                                        <option value="cert_congrats_v3">🏆 V3: Priority Recruiter Directory Unlocked (VIP Access)</option>
                                      </optgroup>

                                      <optgroup label="6. SECURITY & TRANSACTIONAL (NO UNSUBSCRIBE)">
                                        <option value="transactional_alert_v1">🔒 V1: Account Security & Authentication Alert</option>
                                        <option value="transactional_alert_v2">🔒 V2: Password & Login Session Guard Notice</option>
                                        <option value="transactional_alert_v3">🔒 V3: Critical Account Credential Status Alert</option>
                                      </optgroup>
                                    </select>

                                    {/* Action 1: Instant In-Browser Preview Modal */}
                                    <button
                                      type="button"
                                      disabled={isPreviewModalLoading || isSampleLoading || isSendLoading || isForceLoading}
                                      onClick={() => handlePreviewEmail(u)}
                                      style={{
                                        cursor: isPreviewModalLoading ? 'not-allowed' : 'pointer',
                                        padding: '0.65rem 1.1rem',
                                        borderRadius: '10px',
                                        background: 'var(--surface-raised)',
                                        border: '1px solid var(--green)',
                                        color: 'var(--green)',
                                        fontWeight: '700',
                                        fontSize: '0.83rem',
                                        whiteSpace: 'nowrap',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        opacity: isPreviewModalLoading ? 0.6 : 1,
                                      }}
                                      title="Instantly opens rendered HTML email preview in a modal"
                                    >
                                      {isPreviewModalLoading ? '⏳ Previewing...' : '👁️ Preview Body'}
                                    </button>

                                    {/* Action 2: Send Sample Test Email to Admin */}
                                    <button
                                      type="button"
                                      disabled={isPreviewModalLoading || isSampleLoading || isSendLoading || isForceLoading}
                                      onClick={() => handleSendRetentionEmail(u, true, false)}
                                      style={{
                                        cursor: isSampleLoading ? 'not-allowed' : 'pointer',
                                        padding: '0.65rem 1.1rem',
                                        borderRadius: '10px',
                                        background: 'var(--surface-raised)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)',
                                        fontWeight: '700',
                                        fontSize: '0.83rem',
                                        whiteSpace: 'nowrap',
                                        opacity: isSampleLoading ? 0.6 : 1,
                                      }}
                                      title="Sends a real test copy to harsh@skillbun.tech via Zoho SMTP"
                                    >
                                      {isSampleLoading ? '⏳ Sending Sample...' : '🧪 Send Test Email to Me'}
                                    </button>

                                    {/* Action 3: Standard Send to Student (Respects Unsubscribe) */}
                                    {!u.isUnsubscribed && (
                                      <button
                                        type="button"
                                        disabled={isPreviewModalLoading || isSampleLoading || isSendLoading || isForceLoading}
                                        onClick={() => handleSendRetentionEmail(u, false, false)}
                                        style={{
                                          cursor: isSendLoading ? 'not-allowed' : 'pointer',
                                          padding: '0.65rem 1.3rem',
                                          borderRadius: '10px',
                                          background: 'var(--green)',
                                          color: '#000000',
                                          border: 'none',
                                          fontWeight: '800',
                                          fontSize: '0.85rem',
                                          whiteSpace: 'nowrap',
                                          boxShadow: '0 4px 12px rgba(0, 229, 153, 0.4)',
                                          opacity: isSendLoading ? 0.6 : 1,
                                        }}
                                      >
                                        {isSendLoading ? '⏳ Sending Email...' : `🚀 Send to ${u.name}`}
                                      </button>
                                    )}

                                    {/* Action 4: Force Send Button (Overrides Unsubscribe Opt-Out!) */}
                                    {u.isUnsubscribed && (
                                      <button
                                        type="button"
                                        disabled={isPreviewModalLoading || isSampleLoading || isSendLoading || isForceLoading}
                                        onClick={() => handleSendRetentionEmail(u, false, true)}
                                        style={{
                                          cursor: isForceLoading ? 'not-allowed' : 'pointer',
                                          padding: '0.65rem 1.3rem',
                                          borderRadius: '10px',
                                          background: '#ef4444',
                                          color: '#ffffff',
                                          border: 'none',
                                          fontWeight: '800',
                                          fontSize: '0.85rem',
                                          whiteSpace: 'nowrap',
                                          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                                          opacity: isForceLoading ? 0.6 : 1,
                                        }}
                                        title="Overrides candidate's unsubscribe preference and dispatches the email anyway"
                                      >
                                        {isForceLoading ? '⚡ Force Sending...' : '⚡ Force Send (Override Unsubscribe)'}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Prominent Danger Zone Box for Deleting User Account & Freeing Email */}
                                <div
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    border: '2px dashed #ef4444',
                                    borderRadius: '12px',
                                    padding: '1rem 1.25rem',
                                    marginTop: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                  }}
                                >
                                  <div>
                                    <strong style={{ color: '#ef4444', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                                      🗑️ Admin Action: Permanently Delete Student Account
                                    </strong>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                                      Erases Firestore user profile, progress data, exam attempts, and Firebase Auth account ({u.email}). <strong>Frees email so student can create a brand new account.</strong>
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={isDeleting}
                                    style={{
                                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                                      padding: '0.65rem 1.3rem',
                                      borderRadius: '10px',
                                      background: '#ef4444',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontWeight: '800',
                                      fontSize: '0.9rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                                      opacity: isDeleting ? 0.6 : 1,
                                    }}
                                  >
                                    {isDeleting ? '⏳ Deleting Account...' : '🗑️ Delete User & Free Email'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Issued Certificates Registry */}
        {activeTab === 'certificates' && (
          <div>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <p>⏳ Loading real certificate records from Firestore...</p>
              </div>
            ) : filteredCerts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
                {searchTerm ? (
                  <p style={{ margin: 0 }}>No certificates match "{searchTerm}".</p>
                ) : (
                  <p style={{ margin: 0 }}>No certificates issued in Firestore database yet. Earned student certificates will automatically appear here.</p>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Student / Recipient</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Roadmap Track</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Exam Score</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Certificate ID</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.map((cert) => (
                      <tr key={cert.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text)' }}>{cert.name}</div>
                          {cert.email && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{cert.email}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text)' }}>{cert.roadmapTitle}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--green)', fontWeight: '800' }}>{cert.score}%</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <code style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                            {cert.id}
                          </code>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <Link
                            href={`/certificate/${cert.id}`}
                            target="_blank"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: 'var(--green)',
                              fontWeight: '700',
                              textDecoration: 'none',
                              background: 'var(--green-subtle)',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                            }}
                          >
                            View Certificate ↗
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

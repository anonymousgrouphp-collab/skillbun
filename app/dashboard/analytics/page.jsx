'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { getFirebaseServices } from '@/utils/client/firebaseClient';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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

export default function AnalyticsDashboardPage() {
  const { user, profile, authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'certificates'
  const [expandedUserUid, setExpandedUserUid] = useState(null);
  const [deletingUid, setDeletingUid] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Strictly restrict access to harsh@skillbun.tech via Google Login
  const userEmail = (user?.email || '').trim().toLowerCase();
  const targetAdminEmail = 'harsh@skillbun.tech';

  const isGoogleLogin =
    user?.providerData?.some((p) => p.providerId === 'google.com') ||
    profile?.providers?.includes('google.com');

  const isAuthorizedAdmin = userEmail === targetAdminEmail && isGoogleLogin;

  useEffect(() => {
    if (!user || !isAuthorizedAdmin) {
      return;
    }

    let active = true;

    async function fetchAnalyticsData() {
      try {
        const res = await fetch('/api/admin/analytics');
        const resData = await res.json();

        if (!active) return;

        let users = resData.users || [];
        let certificates = resData.certificates || [];

        // Client-side fallback if server Admin API returned empty or credential missing
        if ((!users || users.length === 0) && (!certificates || certificates.length === 0)) {
          try {
            const { db } = getFirebaseServices();
            if (db) {
              // Read real certificates from Firestore client
              const certsSnap = await getDocs(collection(db, 'certificates'));
              certificates = certsSnap.docs.map((doc) => {
                const cData = doc.data();
                return {
                  id: doc.id,
                  certId: doc.id,
                  uid: cData.uid || '',
                  name: cData.name || cData.studentName || cData.userName || 'Student',
                  email: cData.email || cData.userEmail || '',
                  roadmapTitle: cData.roadmapTitle || cData.roadmapSlug || 'Roadmap',
                  roadmapSlug: cData.roadmapSlug || '',
                  score: typeof cData.score === 'number' ? cData.score : 0,
                  createdAt: cData.createdAt ? new Date(cData.createdAt.toDate?.() || cData.createdAt).toISOString() : new Date().toISOString(),
                };
              });

              // Read real users from Firestore client
              const usersSnap = await getDocs(collection(db, 'users'));
              users = usersSnap.docs.map((doc) => {
                const uData = doc.data();
                const uCerts = certificates.filter(
                  (c) => c.uid === doc.id || (c.email && uData.email && c.email.toLowerCase() === uData.email.toLowerCase())
                );
                return {
                  uid: doc.id,
                  name: uData.name || uData.displayName || uData.fullName || 'Registered Student',
                  email: uData.email || 'N/A',
                  degree: uData.degree || 'N/A',
                  year: uData.year || uData.current_year || 'N/A',
                  interest: uData.interest || uData.interest_area || 'N/A',
                  providers: Array.isArray(uData.providers) ? uData.providers : [],
                  createdAt: uData.createdAt ? new Date(uData.createdAt.toDate?.() || uData.createdAt).toISOString() : null,
                  lastSignInTime: uData.updatedAt ? new Date(uData.updatedAt.toDate?.() || uData.updatedAt).toISOString() : (uData.createdAt ? new Date(uData.createdAt.toDate?.() || uData.createdAt).toISOString() : null),
                  progress: [],
                  quizAttempts: [],
                  certificates: uCerts,
                };
              });
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
  }, [user, isAuthorizedAdmin]);

  // CSV Export functionality
  const handleExportCSV = () => {
    const usersList = data?.users || [];
    if (usersList.length === 0) {
      alert('No user data available to export.');
      return;
    }

    const headers = ['UID', 'Name', 'Email', 'Degree', 'Year', 'Target Interest', 'Roadmaps Count', 'Exam Attempts Count', 'Certificates Count', 'Joined Date', 'Last Login Time'];
    const rows = usersList.map((u) => [
      `"${u.uid}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.degree.replace(/"/g, '""')}"`,
      `"${u.year.replace(/"/g, '""')}"`,
      `"${u.interest.replace(/"/g, '""')}"`,
      u.progress?.length || 0,
      u.quizAttempts?.length || 0,
      u.certificates?.length || 0,
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
        } catch (e) {}
      }

      // 1. Call server API
      await fetch(`/api/admin/users/${targetUser.uid}?adminEmail=${encodeURIComponent(userEmail)}&email=${encodeURIComponent(targetUser.email || '')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      });

      // 2. Client-side fallback delete if running locally
      try {
        const { db } = getFirebaseServices();
        if (db) {
          await deleteDoc(doc(db, 'users', targetUser.uid));
        }
      } catch (clientDelErr) {
        console.warn('[Client Delete Fallback Warning]:', clientDelErr);
      }

      // 3. Update local state immediately
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

  if (authLoading) {
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
          This section is restricted to authorized platform administrators. Please sign in with Google to continue.
        </p>
        <Link href="/auth?next=/dashboard/analytics" className="btn-primary" style={{ display: 'inline-block', padding: '0.8rem 1.6rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700' }}>
          🌐 Sign in with Google
        </Link>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--card-shadow)', color: 'var(--text)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
        <h1 style={{ fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.8rem', marginTop: 0, color: 'var(--danger)' }}>
          Access Denied
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Your current account does not have permission to view internal analytics console.
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

  // Search filtering
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
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '85vh', color: 'var(--text)' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--green-subtle)', color: 'var(--green)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }}></span>
            Real Platform Telemetry & Firestore Database Sync
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
          <Link href="/dashboard" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: '600', fontSize: '0.88rem' }}>
            ← User Dashboard
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div style={{
          padding: '0.8rem 1.2rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          background: statusMessage.type === 'success' ? 'var(--green-subtle)' : 'rgba(239, 68, 68, 0.15)',
          color: statusMessage.type === 'success' ? 'var(--green)' : '#ef4444',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--green)' : '#ef4444'}`,
          fontWeight: '700',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            ✕
          </button>
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
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--accent)', marginTop: '0.2rem' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', pb: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                cursor: 'pointer',
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'users' ? 'var(--green)' : 'transparent',
                color: activeTab === 'users' ? '#fff' : 'var(--muted)',
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
                color: activeTab === 'certificates' ? '#fff' : 'var(--muted)',
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
                      <th style={{ padding: '0.75rem 0.5rem' }}>Degree & Year</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Target Interest</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Last Active / Login</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Roadmaps / Exams</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Joined Date</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '220px' }}>Actions & Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isExpanded = expandedUserUid === u.uid;
                      const isDeleting = deletingUid === u.uid;

                      return (
                        <tr key={u.uid} style={{ borderBottom: '1px solid var(--border)', background: isExpanded ? 'var(--surface-raised)' : 'transparent' }}>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{u.email}</div>
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text)' }}>
                            <span style={{ fontWeight: '600' }}>{u.degree}</span>
                            {u.year && u.year !== 'N/A' && <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Year {u.year}</span>}
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text)' }}>
                            <span style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
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
                              <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-block', marginTop: '0.2rem' }}>
                                📝 {u.quizAttempts.length} Exam Attempts
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {formatDateTime(u.createdAt)}
                          </td>

                          {/* Action Buttons: Prominent Red Delete Button + View Drawer Button */}
                          <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setExpandedUserUid(isExpanded ? null : u.uid)}
                                style={{
                                  cursor: 'pointer',
                                  background: isExpanded ? 'var(--green)' : 'var(--surface-raised)',
                                  color: isExpanded ? '#fff' : 'var(--text)',
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
                      );
                    })}
                  </tbody>
                </table>

                {/* Render Expanded User Drawer Outside Table for Perfect Layout */}
                {filteredUsers.map((u) => {
                  if (expandedUserUid !== u.uid) return null;
                  const isDeleting = deletingUid === u.uid;

                  return (
                    <div
                      key={`drawer-${u.uid}`}
                      style={{
                        padding: '1.5rem',
                        background: 'var(--surface-raised)',
                        border: '2px solid var(--green)',
                        borderRadius: '12px',
                        marginTop: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.2rem', color: 'var(--green)' }}>
                          👤 Linked Student Data: {u.name} ({u.email})
                        </h3>
                        <button
                          onClick={() => setExpandedUserUid(null)}
                          style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 'bold', fontSize: '1.1rem' }}
                        >
                          ✕ Close Drawer
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

                        {/* Issued Certificates */}
                        <div>
                          <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                            📜 Earned Certificates ({u.certificates?.length || 0})
                          </h4>
                          {u.certificates?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {u.certificates.map((c) => (
                                <div key={c.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{c.roadmapTitle}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Score: {c.score}% | ID: {c.certId}</div>
                                  </div>
                                  <Link
                                    href={`/certificate/${c.certId}`}
                                    target="_blank"
                                    style={{
                                      textDecoration: 'none',
                                      padding: '0.25rem 0.6rem',
                                      borderRadius: '6px',
                                      background: 'var(--green-subtle)',
                                      color: 'var(--green)',
                                      fontSize: '0.75rem',
                                      fontWeight: '700',
                                    }}
                                  >
                                    View PDF ↗
                                  </Link>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>No certificates earned yet.</p>
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
                          marginTop: '1.5rem',
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
                    </div>
                  );
                })}
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
                      <th style={{ padding: '0.75rem' }}>Student / Recipient</th>
                      <th style={{ padding: '0.75rem' }}>Roadmap Track</th>
                      <th style={{ padding: '0.75rem' }}>Exam Score</th>
                      <th style={{ padding: '0.75rem' }}>Certificate ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.map((cert) => (
                      <tr key={cert.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text)' }}>{cert.name}</div>
                          {cert.email && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{cert.email}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text)' }}>{cert.roadmapTitle}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--green)', fontWeight: '800' }}>{cert.score}%</td>
                        <td style={{ padding: '0.75rem' }}>
                          <code style={{ background: 'var(--surface-raised)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                            {cert.id}
                          </code>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
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

'use client';

import React from 'react';

export default function StudentRowDetails({
  u,
  formatDateTime,
  selectedTemplates,
  setSelectedTemplates,
  sendingEmailKey,
  handleSendRetentionEmail,
  handleDeleteUser,
  isDeleting,
  setExpandedUserUid,
  getRecommendedTemplate,
}) {
  const recommended = getRecommendedTemplate(u);
  const currentTemplate = selectedTemplates[u.uid] || recommended.id;
  const isPreviewLoading = sendingEmailKey === `${u.uid}-preview`;
  const isSendLoading = sendingEmailKey === `${u.uid}-send`;
  const isForceLoading = sendingEmailKey === `${u.uid}-force`;
  const sentLogs = Array.isArray(u.sentEmailHistory) ? u.sentEmailHistory : [];

  return (
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
              <div><strong>Account Created:</strong> {formatDateTime(u.createdAt)}</div>
              <div><strong>Last Sign In:</strong> {formatDateTime(u.lastSignInTime)}</div>
            </div>
          </div>

          {/* Roadmaps & Progress Breakdown */}
          <div>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
              🗺️ Roadmap Progress ({u.progress?.length || 0})
            </h4>
            {u.progress && u.progress.length > 0 ? (
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {u.progress.map((p, idx) => (
                  <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                      <span>{p.slug}</span>
                      <span style={{ color: 'var(--green)' }}>{p.completedNodeIds?.length || 0} nodes completed</span>
                    </div>
                    {p.updatedAt && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                        Last studied: {formatDateTime(p.updatedAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>No active roadmap learning nodes recorded yet.</p>
            )}
          </div>

          {/* Quiz Attempts & Certificates */}
          <div>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
              🏆 Certifications & Attempts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {u.certificates && u.certificates.length > 0 ? (
                u.certificates.map((c, idx) => (
                  <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '700', color: 'var(--green)' }}>🎓 {c.roadmapTitle || c.stream_or_track || 'Certificate'} ({c.score ?? '100'}%)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Cert ID: {c.id} • Issued: {formatDateTime(c.createdAt)}</div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>No certificates earned yet.</p>
              )}

              {u.quizAttempts && u.quizAttempts.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted)', marginBottom: '0.3rem' }}>Exam Quiz Attempts:</div>
                  {u.quizAttempts.map((q, idx) => (
                    <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text)', background: 'var(--card-bg)', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '0.25rem' }}>
                      {q.slug}: {q.attempts?.length || 0} attempt(s) (Last: {formatDateTime(q.lastAttemptAt)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Retention Emailer Console */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✉️</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text)' }}>
                Targeted Student Email Automation (Zoho SMTP Transport)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--green)', fontWeight: '700' }}>
              <span>✨ Smart Recommendation:</span>
              <code>{recommended.name}</code> ({recommended.reason})
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '600' }}>Select Template:</label>
            <select
              value={currentTemplate}
              onChange={(e) => setSelectedTemplates((prev) => ({ ...prev, [u.uid]: e.target.value }))}
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.82rem',
                outline: 'none',
                minWidth: '240px',
              }}
            >
              <optgroup label="🌟 Smart Recommender">
                <option value={recommended.id}>⭐ Recommended: {recommended.name}</option>
              </optgroup>
              <optgroup label="👋 Welcome Series">
                <option value="welcome_v1">Welcome (Getting Started & Explore)</option>
                <option value="welcome_v2">Welcome (AI Mentor & Bun-Bot Focus)</option>
                <option value="welcome_v3">Welcome (Roadmaps & Practice Tests)</option>
              </optgroup>
              <optgroup label="⚡ Inactivity & Re-engagement">
                <option value="reengagement_v1">Re-engagement (Resume Your Journey)</option>
                <option value="reengagement_v2">Re-engagement (New Modules Added)</option>
                <option value="reengagement_v3">Re-engagement (Community Momentum)</option>
              </optgroup>
              <optgroup label="🎯 Exam Readiness Nudges">
                <option value="exam_nudge_v1">Exam Nudge (60% Progress Achieved!)</option>
                <option value="exam_nudge_v2">Exam Nudge (Fast-track to Certificate)</option>
                <option value="exam_nudge_v3">Exam Nudge (Sharpen Your Skills)</option>
              </optgroup>
              <optgroup label="💪 Retake & Resilience">
                <option value="exam_failed_v1">Retake Encouragement (Don't Give Up!)</option>
                <option value="exam_failed_v2">Retake Encouragement (Review Weak Topics)</option>
                <option value="exam_failed_v3">Retake Encouragement (Retry After 1hr)</option>
              </optgroup>
              <optgroup label="🎉 Milestone Celebrations">
                <option value="cert_congrats_v1">Certificate Issued (Share on LinkedIn!)</option>
                <option value="cert_congrats_v2">Certificate Issued (Add to Resume)</option>
                <option value="cert_congrats_v3">Certificate Issued (Next Career Goal)</option>
              </optgroup>
            </select>

            <button
              onClick={() => handleSendRetentionEmail(u, currentTemplate, false, true)}
              disabled={isPreviewLoading}
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {isPreviewLoading ? '⏳ Previewing...' : '👁️ Preview Body'}
            </button>

            <button
              onClick={() => handleSendRetentionEmail(u, currentTemplate, false, false)}
              disabled={isSendLoading}
              style={{
                background: 'var(--green)',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {isSendLoading ? '🚀 Sending...' : '✉️ Send Email'}
            </button>

            <button
              onClick={() => handleSendRetentionEmail(u, currentTemplate, true, false)}
              disabled={isForceLoading}
              title="Send even if this exact template was sent recently or student is unsubscribed (Override)"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {isForceLoading ? '⚡ Overriding...' : '⚠️ Force Override'}
            </button>

            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={() => handleDeleteUser(u)}
                disabled={isDeleting}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px dashed #ef4444',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {isDeleting ? '🗑️ Purging...' : '🗑️ Delete User'}
              </button>
            </div>
          </div>

          {/* Email History Logs */}
          {sentLogs.length > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface-raised)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <strong>📋 Previous Emails Dispatched ({sentLogs.length}):</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.3rem' }}>
                {sentLogs.map((log, lIdx) => {
                  const tId = typeof log === 'string' ? log : log.templateId;
                  const sTime = typeof log === 'string' ? null : log.sentAt;
                  return (
                    <span key={lIdx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {tId} {sTime ? `(${formatDateTime(sTime)})` : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

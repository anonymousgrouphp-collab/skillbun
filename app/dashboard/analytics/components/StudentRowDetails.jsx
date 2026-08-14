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
                Student hasn't taken any 60%+ certification quizzes yet.
              </p>
            )}
          </div>

          {/* Earned Certificates */}
          <div>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.5px' }}>
              📜 Earned Certificates ({u.certificates?.length || 0})
            </h4>
            {u.certificates?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {u.certificates.map((c, idx) => (
                  <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text)' }}>{c.roadmapTitle || c.slug}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: '700' }}>Score: {c.score}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>ID: {c.id || c.certId}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>No certificates earned yet.</p>
            )}
          </div>
        </div>

        {/* Email Campaign & Retention Email Dispatch Section */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.05rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ✉️ Retention Marketing Campaign & Email Dispatch Center
            </h4>

            {/* Smart Non-Repeating Recommendation Pill Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-subtle)', color: 'var(--green)', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
              <span>🎯 Auto-Recommended:</span>
              <strong style={{ textDecoration: 'underline' }}>{recommended.label}</strong>
              {recommended.isRotated && (
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>(Auto-Shuffled • {recommended.alreadySentCount} previously sent)</span>
              )}
            </div>
          </div>

          {/* Sent Emails History Timeline */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
              📬 Sent Emails History for this Student ({sentLogs.length})
            </div>
            {sentLogs.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {sentLogs.map((log, lIdx) => {
                  const tId = typeof log === 'string' ? log : log.templateId;
                  const dateStr = log.sentAt ? formatDateTime(log.sentAt) : 'Logged';
                  const wasForced = Boolean(log.forceOverride);
                  return (
                    <span
                      key={lIdx}
                      style={{
                        background: wasForced ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-raised)',
                        color: wasForced ? '#ef4444' : 'var(--text)',
                        border: `1px solid ${wasForced ? '#ef4444' : 'var(--border)'}`,
                        padding: '0.3rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title={log.sentAt ? `Dispatched on ${formatDateTime(log.sentAt)} by ${log.adminEmail || 'Admin'}${wasForced ? ' (FORCED OVERRIDE)' : ''}` : tId}
                    >
                      <span>{wasForced ? '⚡' : '✉️'}</span>
                      <code>{tId}</code>
                      <span style={{ color: 'var(--muted)', fontSize: '0.72rem', fontWeight: 'normal' }}>• {dateStr}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                No retention emails have been sent to this student yet. Ready for first touchpoint.
              </p>
            )}
          </div>

          {/* Email Template Picker & Action Buttons Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={currentTemplate}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTemplates((prev) => ({ ...prev, [u.uid]: val }));
              }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                color: 'var(--text)',
                fontSize: '0.85rem',
                fontWeight: '700',
                outline: 'none',
                minWidth: '320px',
                cursor: 'pointer',
              }}
            >
              <optgroup label="✨ 1. Welcome & Getting Started Series (3 Variations)">
                <option value="welcome_v1">🚀 V1: Welcome to SkillBun! Your Engineering Journey Begins</option>
                <option value="welcome_v2">💡 V2: Welcome to SkillBun! 3 Quick Wins for Your Tech Career</option>
                <option value="welcome_v3">🎯 V3: Welcome! Here is Your High-Yield Learning Strategy</option>
              </optgroup>

              <optgroup label="🔥 2. Re-engagement & Momentum Series (3 Variations)">
                <option value="reengagement_v1">⚡ V1: We Miss You! Jump Back In & Keep Your Momentum</option>
                <option value="reengagement_v2">🔥 V2: Your Career Roadmap Is Waiting — 15 Mins Today</option>
                <option value="reengagement_v3">🌟 V3: Reclaim Your Daily Learning Streak on SkillBun</option>
              </optgroup>

              <optgroup label="📝 3. Exam Nudge Series (60%+ Progress Ready) (3 Variations)">
                <option value="exam_nudge_v1">🏆 V1: You Are Eligible! Take Your Industry Cert Exam</option>
                <option value="exam_nudge_v2">🎓 V2: Claim Your Verified Skill Certificate Today</option>
                <option value="exam_nudge_v3">🎖️ V3: Stand Out to Recruiters — Certify on SkillBun</option>
              </optgroup>

              <optgroup label="💪 4. Exam Encouragement & Cooldown Lifted (3 Variations)">
                <option value="exam_failed_v1">💪 V1: Review Your Study Guide & Retake Your Exam</option>
                <option value="exam_failed_v2">📈 V2: You are Almost There! Retake with Confidence</option>
                <option value="exam_failed_v3">🚀 V3: Turn Your Practice Into Mastery — Retake Available</option>
              </optgroup>

              <optgroup label="🎉 5. Certificate Congratulations & Portfolio (3 Variations)">
                <option value="cert_congrats_v1">🎉 V1: Congratulations! Add Your Certificate to LinkedIn</option>
                <option value="cert_congrats_v2">🌟 V2: Showcase Your Achievement to Recruiters</option>
                <option value="cert_congrats_v3">🚀 V3: What is Next? Explore Advanced Engineering Paths</option>
              </optgroup>

              <optgroup label="🔒 6. Security & Transactional Notifications (3 Variations)">
                <option value="transactional_alert_v1">🔔 V1: Security Notice — New Device Login Detected</option>
                <option value="transactional_alert_v2">🛡️ V2: Account Security Verification Alert</option>
                <option value="transactional_alert_v3">🔒 V3: Critical Account Credential Status Alert</option>
              </optgroup>
            </select>

            {/* Action 1: Send Sample Test Email to Admin */}
            <button
              type="button"
              disabled={isPreviewLoading || isSendLoading || isForceLoading}
              onClick={() => handleSendRetentionEmail(u, true, false)}
              style={{
                cursor: isPreviewLoading || isSendLoading || isForceLoading ? 'not-allowed' : 'pointer',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--green)',
                color: 'var(--green)',
                fontWeight: '700',
                fontSize: '0.83rem',
                whiteSpace: 'nowrap',
                opacity: isPreviewLoading ? 0.6 : 1,
              }}
              title="Sends a test copy to harsh@skillbun.tech so you can preview in your inbox first"
            >
              {isPreviewLoading ? '⏳ Sending Sample...' : '🧪 Send Sample Preview to Me'}
            </button>

            {/* Action 2: Standard Send to Student (Respects Unsubscribe) */}
            {!u.isUnsubscribed && (
              <button
                type="button"
                disabled={isPreviewLoading || isSendLoading || isForceLoading}
                onClick={() => handleSendRetentionEmail(u, false, false)}
                style={{
                  cursor: isPreviewLoading || isSendLoading || isForceLoading ? 'not-allowed' : 'pointer',
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
                {isSendLoading ? '⏳ Sending Email...' : `🚀 Send Auto-Filled Email to ${u.name}`}
              </button>
            )}

            {/* Action 3: Special Force Send Button (Overrides Unsubscribe Opt-Out!) */}
            {u.isUnsubscribed && (
              <button
                type="button"
                disabled={isPreviewLoading || isSendLoading || isForceLoading}
                onClick={() => handleSendRetentionEmail(u, false, true)}
                style={{
                  cursor: isPreviewLoading || isSendLoading || isForceLoading ? 'not-allowed' : 'pointer',
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
  );
}

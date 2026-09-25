'use client';

import React from 'react';

function Icon({ name, size = 16, className = '', style = {} }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style },
  };

  switch (name) {
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'bell-off':
      return (
        <svg {...common}>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
          <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
          <path d="M18 8a6 6 0 0 0-9.33-5" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    case 'map':
      return (
        <svg {...common}>
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      );
    case 'award':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...common}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'flask':
      return (
        <svg {...common}>
          <path d="M10 2v7.31L4.1 20.3a2 2 0 0 0 1.7 2.7h12.4a2 2 0 0 0 1.7-2.7L14 9.31V2" />
          <line x1="8" y1="2" x2="16" y2="2" />
          <line x1="8.5" y1="14" x2="15.5" y2="14" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...common}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg {...common}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      );
    default:
      return null;
  }
}


export default function StudentRowDetails({
  u,
  formatDateTime,
  selectedTemplates,
  setSelectedTemplates,
  sendingEmailKey,
  handleSendRetentionEmail,
  handlePreviewEmail,
  handleDeleteUser,
  isDeleting,
  setExpandedUserUid,
  getRecommendedTemplate,
}) {
  const recommended = getRecommendedTemplate(u);
  const currentTemplate = selectedTemplates[u.uid] || recommended.id;
  const isPreviewLoading = sendingEmailKey === `${u.uid}-preview`;
  const isSampleLoading = sendingEmailKey === `${u.uid}-sample`;
  const isSendLoading = sendingEmailKey === `${u.uid}-send`;
  const isForceLoading = sendingEmailKey === `${u.uid}-force`;
  const sentLogs = Array.isArray(u.sentEmailHistory) ? u.sentEmailHistory : [];

  return (
    <tr style={{ background: 'var(--surface-raised)', borderBottom: '2px solid var(--green)' }}>
      <td colSpan={8} style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, fontFamily: 'var(--font-fredoka), sans-serif', fontSize: '1.05rem', color: 'var(--green)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Icon name="user" size={16} /> Linked Profile & Activity Breakdown: {u.name} ({u.email})</span>
          </h4>
          <button
            type="button"
            onClick={() => setExpandedUserUid(null)}
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 'bold', fontSize: '1rem' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Icon name="close" size={13} /> Close</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* Profile Details */}
          <div>
            <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Icon name="user" size={14} /> Account & Activity Timestamps</span>
            </h4>
            <div style={{ fontSize: '0.82rem', lineHeight: '1.8', color: 'var(--text)' }}>
              <div><strong>UID:</strong> <code style={{ fontSize: '0.78rem' }}>{u.uid}</code></div>
              <div><strong>Full Name:</strong> {u.name}</div>
              <div><strong>Email:</strong> {u.email}</div>
              <div>
                <strong>Subscription Status:</strong>{' '}
                {u.isUnsubscribed ? (
                  <span style={{ color: '#ef4444', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="bell-off" size={13} /> UNSUBSCRIBED {u.unsubscribedAt ? `(${formatDateTime(u.unsubscribedAt)})` : ''}</span>
                ) : (
                  <span style={{ color: 'var(--green)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="bell" size={13} /> Active Subscriber</span>
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Icon name="map" size={14} /> Roadmap Progress ({u.progress?.length || 0})</span>
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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Icon name="award" size={14} /> Certifications & Attempts</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {u.certificates && u.certificates.length > 0 ? (
                u.certificates.map((c, idx) => (
                  <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: '700', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="award" size={13} /> {c.roadmapTitle || c.stream_or_track || 'Certificate'} ({c.score ?? '100'}%)</div>
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
              <Icon name="mail" size={18} />
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text)' }}>
                Targeted Student Email Automation (Zoho SMTP Transport)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--green)', fontWeight: '700' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Icon name="zap" size={12} /> Smart Recommendation:</span>
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
              <optgroup label="Smart Recommender">
                <option value={recommended.id}>Recommended: {recommended.name}</option>
              </optgroup>
              <optgroup label="Welcome Series">
                <option value="welcome_v1">Welcome (Getting Started & Explore)</option>
                <option value="welcome_v2">Welcome (AI Mentor & Bun-Bot Focus)</option>
                <option value="welcome_v3">Welcome (Roadmaps & Practice Tests)</option>
              </optgroup>
              <optgroup label="Inactivity & Re-engagement">
                <option value="reengagement_v1">Re-engagement (Resume Your Journey)</option>
                <option value="reengagement_v2">Re-engagement (New Modules Added)</option>
                <option value="reengagement_v3">Re-engagement (Community Momentum)</option>
              </optgroup>
              <optgroup label="Exam Readiness Nudges">
                <option value="exam_nudge_v1">Exam Nudge (60% Progress Achieved!)</option>
                <option value="exam_nudge_v2">Exam Nudge (Fast-track to Certificate)</option>
                <option value="exam_nudge_v3">Exam Nudge (Sharpen Your Skills)</option>
              </optgroup>
              <optgroup label="Retake & Resilience">
                <option value="exam_failed_v1">Retake Encouragement (Don't Give Up!)</option>
                <option value="exam_failed_v2">Retake Encouragement (Review Weak Topics)</option>
                <option value="exam_failed_v3">Retake Encouragement (Retry After 1hr)</option>
              </optgroup>
              <optgroup label="Milestone Celebrations">
                <option value="cert_congrats_v1">Certificate Issued (Share on LinkedIn!)</option>
                <option value="cert_congrats_v2">Certificate Issued (Add to Resume)</option>
                <option value="cert_congrats_v3">Certificate Issued (Next Career Goal)</option>
              </optgroup>
            </select>

            <button
              type="button"
              onClick={() => handlePreviewEmail ? handlePreviewEmail(u) : null}
              disabled={isPreviewLoading || isSampleLoading || isSendLoading || isForceLoading}
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: isPreviewLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isPreviewLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="clock" size={13} /> Previewing...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="eye" size={13} /> Preview Body</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSendRetentionEmail(u, true, false)}
              disabled={isPreviewLoading || isSampleLoading || isSendLoading || isForceLoading}
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: isSampleLoading ? 'not-allowed' : 'pointer',
              }}
              title="Sends a test copy to harsh@skillbun.tech via Zoho SMTP"
            >
              {isSampleLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="clock" size={13} /> Sending Sample...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="flask" size={13} /> Send Test Email to Me</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSendRetentionEmail(u, false, false)}
              disabled={isPreviewLoading || isSampleLoading || isSendLoading || isForceLoading}
              style={{
                background: 'var(--green)',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: isSendLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isSendLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="clock" size={13} /> Sending...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="mail" size={13} /> Send to {u.name || 'Student'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSendRetentionEmail(u, false, true)}
              disabled={isPreviewLoading || isSampleLoading || isSendLoading || isForceLoading}
              title="Send even if this exact template was sent recently or student is unsubscribed (Override)"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: isForceLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isForceLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="zap" size={13} /> Overriding...</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="alert" size={13} /> Force Override</span>
              )}
            </button>

            <div style={{ marginLeft: 'auto' }}>
              <button
                type="button"
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
                {isDeleting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="clock" size={13} /> Purging...</span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="trash" size={13} /> Delete User</span>
                )}
              </button>
            </div>
          </div>

          {/* Email History Logs */}
          {sentLogs.length > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface-raised)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="clipboard" size={13} /> Previous Emails Dispatched ({sentLogs.length}):</strong>
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

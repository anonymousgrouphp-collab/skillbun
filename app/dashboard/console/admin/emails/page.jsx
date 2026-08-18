'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import styles from './emails.module.css';

// Extended Template Catalog combining Retention & Workforce templates
const ALL_TEMPLATES = [
  // Category 1: Onboarding
  {
    id: 'welcome_v1',
    category: 'Onboarding',
    name: '🚀 Onboarding V1: ₹35,000 Course Value Unlocked',
    categoryLabel: '🚀 Onboarding',
    description: 'Emphasizes ₹35,000 worth of free interactive tech roadmaps & encrypted study vault.',
  },
  {
    id: 'welcome_v2',
    category: 'Onboarding',
    name: '🚀 Onboarding V2: 2026 Tech Salary Benchmark',
    categoryLabel: '🚀 Onboarding',
    description: 'Triggers competitive urgency against other student applicants.',
  },
  {
    id: 'welcome_v3',
    category: 'Onboarding',
    name: '🚀 Onboarding V3: $500 Encrypted SBV1 Study Vault',
    categoryLabel: '🚀 Onboarding',
    description: 'Focuses on exclusive privilege access to SkillBun Vault study guides.',
  },

  // Category 2: Re-engagement
  {
    id: 'reengagement_v1',
    category: 'Re-engagement',
    name: '🐰 Re-engage V1: Rank & Streak Decaying Alert',
    categoryLabel: '🐰 Re-engagement',
    description: 'Warns student about active streak loss and ranking decay.',
  },
  {
    id: 'reengagement_v2',
    category: 'Re-engagement',
    name: '🐰 Re-engage V2: 3-Minute Quick Win to Exam Ticket',
    categoryLabel: '🐰 Re-engagement',
    description: 'Encourages completing just 1 quick topic node to reach certification.',
  },
  {
    id: 'reengagement_v3',
    category: 'Re-engagement',
    name: '🐰 Re-engage V3: Recruiter Queue Visibility Alert',
    categoryLabel: '🐰 Re-engagement',
    description: 'Highlights priority recruiter discovery for candidates with 60%+ progress.',
  },

  // Category 3: Exam Ready
  {
    id: 'exam_nudge_v1',
    category: 'Exam Ready',
    name: '🎓 Exam Ready V1: Top 7% Elite Candidate Invitation',
    categoryLabel: '🎓 Exam Ready',
    description: 'Celebrates 60%+ completion and invites student to certify.',
  },
  {
    id: 'exam_nudge_v2',
    category: 'Exam Ready',
    name: '🎓 Exam Ready V2: Free ₹15,000 Proctored Exam Ticket',
    categoryLabel: '🎓 Exam Ready',
    description: 'Positions proctored exam as a ₹15,000 waived fee gift.',
  },
  {
    id: 'exam_nudge_v3',
    category: 'Exam Ready',
    name: '🎓 Exam Ready V3: Recruiters Verifying SkillBun QR Links',
    categoryLabel: '🎓 Exam Ready',
    description: 'Emphasizes tamper-proof verification on LinkedIn & resume.',
  },

  // Category 4: Exam Retake
  {
    id: 'exam_failed_v1',
    category: 'Exam Retake',
    name: '📚 Retake V1: 100% Free Unlimited Retake Ticket',
    categoryLabel: '📚 Exam Retake',
    description: 'Reassures student that retakes are free and unlimited.',
  },
  {
    id: 'exam_failed_v2',
    category: 'Exam Retake',
    name: '📚 Retake V2: Review SBV1 Encrypted Study Vault',
    categoryLabel: '📚 Exam Retake',
    description: 'Advises reading encrypted study guides during 1-hour cooldown.',
  },
  {
    id: 'exam_failed_v3',
    category: 'Exam Retake',
    name: '📚 Retake V3: Missed Passing by Just 2 Questions',
    categoryLabel: '📚 Exam Retake',
    description: 'Boosts confidence for near-pass candidates after 1-hour cooldown.',
  },

  // Category 5: Alumni & Certs
  {
    id: 'cert_congrats_v1',
    category: 'Alumni Certs',
    name: '🏆 Alumni V1: Verified Specialist Status & QR Badge',
    categoryLabel: '🏆 Alumni Certs',
    description: 'Promotes LinkedIn QR badge sharing and resume addition.',
  },
  {
    id: 'cert_congrats_v2',
    category: 'Alumni Certs',
    name: '🏆 Alumni V2: Next High-Salary Track Combo',
    categoryLabel: '🏆 Alumni Certs',
    description: 'Recommends complementary high-paying tech tracks.',
  },
  {
    id: 'cert_congrats_v3',
    category: 'Alumni Certs',
    name: '🏆 Alumni V3: Priority Recruiter Directory Unlocked',
    categoryLabel: '🏆 Alumni Certs',
    description: 'Informs certified alumnus about public recruiter verification indexing.',
  },

  // Category 6: Transactional & Security
  {
    id: 'transactional_alert_v1',
    category: 'Security Alerts',
    name: '🔒 Security V1: Account Security & Authentication Alert',
    categoryLabel: '🔒 Security Alerts',
    description: 'Security notice. Omits marketing unsubscribe per compliance rules.',
  },
  {
    id: 'transactional_alert_v2',
    category: 'Security Alerts',
    name: '🛡️ Security V2: Password & Login Session Guard Notice',
    categoryLabel: '🔒 Security Alerts',
    description: 'Session guard notice. Omits marketing unsubscribe per compliance rules.',
  },
  {
    id: 'transactional_alert_v3',
    category: 'Security Alerts',
    name: '🔑 Security V3: Critical Account Credential Status Alert',
    categoryLabel: '🔒 Security Alerts',
    description: 'Credential alert. Omits marketing unsubscribe per compliance rules.',
  },

  // Category 7: Workforce & Operations
  {
    id: 'workforce_offer',
    category: 'Workforce',
    name: '🏢 Workforce: Internship Offer of Engagement & Terms',
    categoryLabel: '🏢 Workforce',
    description: 'Includes terms of engagement, 4-page PDF attachment notice & Zoho credentials.',
  },
  {
    id: 'workforce_activation',
    category: 'Workforce',
    name: '🏢 Workforce: Onboarding Complete & Workspace Access',
    categoryLabel: '🏢 Workforce',
    description: 'Delivers active Zoho Mail credentials and Day 1 onboarding instructions.',
  },
  {
    id: 'workforce_extension',
    category: 'Workforce',
    name: '🏢 Workforce: Extension of Internship Tenure Addendum',
    categoryLabel: '🏢 Workforce',
    description: 'Formal tenure extension notice with revised end date and signing instructions.',
  },
  {
    id: 'workforce_termination',
    category: 'Workforce',
    name: '🏢 Workforce: Tenure Conclusion & Alumni Credentials',
    categoryLabel: '🏢 Workforce',
    description: 'Offboarding record, granted certificates registry, and Alumni Document Vault link.',
  },

  // Category 8: Custom Blank
  {
    id: 'custom_blank',
    category: 'Custom Studio',
    name: '✍️ Custom HTML: Write & Design from Scratch',
    categoryLabel: '✍️ Custom Studio',
    description: 'Create an arbitrary custom branded email with custom subject and HTML.',
  },
];

const CATEGORIES = [
  'All',
  'Onboarding',
  'Re-engagement',
  'Exam Ready',
  'Exam Retake',
  'Alumni Certs',
  'Security Alerts',
  'Workforce',
  'Custom Studio',
];

export default function AdminEmailsPage() {
  const { user, authLoading } = useAuth();
  const { isAdmin, checking } = useAdminAccess(user, authLoading);

  // Template & Category state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState('welcome_v1');

  // Simulation variables
  const [simName, setSimName] = useState('Alex Sharma');
  const [simEmail, setSimEmail] = useState('alex.sharma@example.com');
  const [simRoadmap, setSimRoadmap] = useState('Full Stack Web Development');
  const [simProgress, setSimProgress] = useState(18);
  const [simDegree, setSimDegree] = useState('B.Tech - Computer Science');

  // Editable Subject & HTML state
  const [editedSubject, setEditedSubject] = useState('');
  const [editedHtml, setEditedHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Viewport & theme simulator
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [previewBg, setPreviewBg] = useState('dark'); // 'dark' | 'light'

  // Dispatch state
  const [targetRecipient, setTargetRecipient] = useState('');
  const [forceOverride, setForceOverride] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingTarget, setIsSendingTarget] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const textareaRef = useRef(null);

  // Filter templates by category
  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  // Fetch / Generate preview when template or variables change
  const loadTemplateContent = useCallback(async (templateId, isReset = false) => {
    setLoadingPreview(true);
    setStatusMessage(null);
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          templateId,
          isPreview: true,
          studentName: simName,
          recipientEmail: simEmail,
          roadmapTitle: simRoadmap,
          progressCount: Number(simProgress) || 12,
          degree: simDegree,
        }),
      });

      const data = await res.json();
      if (data.success && data.preview) {
        if (isReset || !editedSubject) {
          setEditedSubject(data.preview.subject || '');
        }
        setEditedHtml(data.preview.html || '');
      }
    } catch (err) {
      console.error('Failed to load email preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  }, [user, simName, simEmail, simRoadmap, simProgress, simDegree, editedSubject]);

  // Switch template
  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    if (template.id === 'custom_blank') {
      setEditedSubject(`Important Notification for ${simName}`);
      setEditedHtml(`
<div style="text-align: center; margin-bottom: 24px;">
  <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
    ⚡ Announcement
  </div>
  <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
    Hello ${simName}!
  </h1>
</div>

<p>Write your custom announcements or updates here. You can use standard HTML markup and inline CSS.</p>

<div style="text-align: center; margin: 32px 0 16px 0;">
  <a href="https://skillbun.tech" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none;">
    Explore Roadmaps →
  </a>
</div>
      `.trim());
    } else {
      loadTemplateContent(template.id, true);
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    if (user && isAdmin) {
      const fetchInitial = async () => {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/admin/emails/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
              templateId: selectedTemplateId,
              isPreview: true,
              studentName: simName,
              recipientEmail: simEmail,
              roadmapTitle: simRoadmap,
              progressCount: Number(simProgress) || 12,
              degree: simDegree,
            }),
          });
          const data = await res.json();
          if (isMounted && data.success && data.preview) {
            setEditedSubject(data.preview.subject || '');
            setEditedHtml(data.preview.html || '');
          }
        } catch (err) {
          console.error('Failed to load initial email preview:', err);
        }
      };
      fetchInitial();
    }
    return () => {
      isMounted = false;
    };
  }, [user, isAdmin, selectedTemplateId, simName, simEmail, simRoadmap, simProgress, simDegree]);

  // Insert variable tag at cursor
  const handleInsertVariable = (variableTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = editedHtml;
    const newVal = currentVal.substring(0, start) + variableTag + currentVal.substring(end);

    setEditedHtml(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
    }, 50);
  };

  // Copy HTML to clipboard
  const handleCopyHtml = () => {
    if (!editedHtml) return;
    navigator.clipboard.writeText(editedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dispatch Test Email to founder/self
  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setStatusMessage(null);
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          customSubject: editedSubject,
          customHtml: editedHtml,
          studentName: simName,
          recipientEmail: 'harsh@skillbun.tech',
          roadmapTitle: simRoadmap,
          progressCount: Number(simProgress) || 10,
          degree: simDegree,
          forceOverride: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `✅ Test email successfully dispatched to harsh@skillbun.tech (Message ID: ${data.messageId || 'Generated'})`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to dispatch test email via Zoho SMTP.',
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error dispatching test email.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Dispatch to targeted recipient
  const handleSendTargetRecipient = async () => {
    const recipient = targetRecipient.trim().toLowerCase();
    if (!recipient || !recipient.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }

    setIsSendingTarget(true);
    setStatusMessage(null);
    try {
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          customSubject: editedSubject,
          customHtml: editedHtml,
          studentName: simName,
          recipientEmail: recipient,
          roadmapTitle: simRoadmap,
          progressCount: Number(simProgress) || 10,
          degree: simDegree,
          forceOverride: Boolean(forceOverride),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `✅ Email dispatched to ${recipient}!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Delivery failed.',
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error dispatching email.' });
    } finally {
      setIsSendingTarget(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className={styles.emailContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: '600' }}>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className={styles.emailContainer}>
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
    <div className={styles.emailContainer}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <h1 className={styles.titleText}>SkillBun Email & Campaign Studio</h1>
            <span className={styles.securityPill}>
              ⚡ Zoho SMTP Pro
            </span>
          </div>
          <p className={styles.subtitle}>
            Manage, customize, live-preview, test, and dispatch all 23 platform retention templates, security notices, and workforce offer letters.
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
          <Link href="/dashboard/console/admin/analytics" className={styles.actionBtnSecondary}>
            Student CRM
          </Link>
          <Link href="/dashboard/console/admin/workforce" className={styles.actionBtnSecondary}>
            Workforce Hub
          </Link>
        </div>
      </div>

      {/* Category Pills */}
      <div className={styles.categoryTabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`${styles.categoryTab} ${selectedCategory === cat ? styles.categoryTabActive : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Main Studio */}
      <div className={styles.studioLayout}>
        {/* Left Column: Template Catalog & In-Browser Editor */}
        <div className={styles.editorPanel}>
          {/* Template Catalog */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <span>📋</span> Template Catalog ({filteredTemplates.length})
              </h3>
            </div>
            <div className={styles.templateList}>
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`${styles.templateItem} ${selectedTemplateId === t.id ? styles.templateItemActive : ''}`}
                >
                  <div className={styles.templateItemName}>
                    <span>{t.name}</span>
                    {selectedTemplateId === t.id && (
                      <span style={{ color: 'var(--green)', fontSize: '0.72rem', fontWeight: '800' }}>ACTIVE</span>
                    )}
                  </div>
                  <div className={styles.templateItemDesc}>{t.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Candidate Simulation Variables */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <span>👤</span> Dynamic Candidate Data Auto-Fill
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Candidate Name ({'{name}'})</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Candidate Email ({'{email}'})</label>
                <input
                  type="text"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Roadmap Track ({'{roadmapTitle}'})</label>
                <input
                  type="text"
                  value={simRoadmap}
                  onChange={(e) => setSimRoadmap(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Degree ({'{degree}'})</label>
                <input
                  type="text"
                  value={simDegree}
                  onChange={(e) => setSimDegree(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>

          {/* Subject & HTML Editor */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <span>✏️</span> Subject & Content Editor
              </h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => loadTemplateContent(selectedTemplateId, true)}
                  className={styles.actionBtnSecondary}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  title="Reset to official template default"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            {/* Subject Field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span>Subject Line</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{editedSubject.length} chars</span>
              </label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className={styles.inputField}
                placeholder="Enter email subject line..."
              />
            </div>

            {/* Variable Tag Inserter */}
            <div style={{ marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                Quick Insert Dynamic Tags:
              </div>
              <div className={styles.variableBar}>
                <button type="button" onClick={() => handleInsertVariable('{name}')} className={styles.variableChip}>
                  + {'{name}'}
                </button>
                <button type="button" onClick={() => handleInsertVariable('{email}')} className={styles.variableChip}>
                  + {'{email}'}
                </button>
                <button type="button" onClick={() => handleInsertVariable('{roadmapTitle}')} className={styles.variableChip}>
                  + {'{roadmapTitle}'}
                </button>
                <button type="button" onClick={() => handleInsertVariable('{degree}')} className={styles.variableChip}>
                  + {'{degree}'}
                </button>
                <button type="button" onClick={() => handleInsertVariable('{progressCount}')} className={styles.variableChip}>
                  + {'{progressCount}'}
                </button>
              </div>
            </div>

            {/* HTML Body Editor */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span>HTML / Body Content</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Live rendered on the right</span>
              </label>
              <textarea
                ref={textareaRef}
                value={editedHtml}
                onChange={(e) => setEditedHtml(e.target.value)}
                className={styles.textareaField}
                placeholder="Enter HTML markup here..."
                rows={12}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Device Preview & Dispatch Panel */}
        <div className={styles.previewPanel}>
          {/* Toolbar */}
          <div className={styles.previewToolbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className={styles.deviceControls}>
                <button
                  type="button"
                  onClick={() => setViewport('desktop')}
                  className={`${styles.deviceBtn} ${viewport === 'desktop' ? styles.deviceBtnActive : ''}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Desktop (640px)
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={`${styles.deviceBtn} ${viewport === 'mobile' ? styles.deviceBtnActive : ''}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                  Mobile (375px)
                </button>
              </div>

              <div className={styles.deviceControls}>
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  className={`${styles.deviceBtn} ${previewBg === 'dark' ? styles.deviceBtnActive : ''}`}
                  title="Simulate Dark Background"
                >
                  🌙 Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  className={`${styles.deviceBtn} ${previewBg === 'light' ? styles.deviceBtnActive : ''}`}
                  title="Simulate Light Background"
                >
                  ☀️ Light
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyHtml}
              className={styles.actionBtnSecondary}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              {copied ? '✅ Copied!' : '📋 Copy HTML'}
            </button>
          </div>

          {/* Preview Viewport Frame */}
          <div
            className={`${styles.previewFrameContainer} ${
              previewBg === 'dark' ? styles.previewFrameContainerDark : styles.previewFrameContainerLight
            }`}
          >
            {loadingPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--muted)' }}>
                <p>Generating email preview...</p>
              </div>
            ) : (
              <iframe
                title="Email Preview"
                srcDoc={editedHtml}
                className={`${styles.previewFrame} ${viewport === 'mobile' ? styles.previewFrameMobile : ''}`}
                sandbox="allow-same-origin"
              />
            )}
          </div>

          {/* Dispatch Box */}
          <div className={styles.dispatchBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text)' }}>
                🚀 Email Dispatch & Zoho SMTP Testing
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                From: <code>noreply@skillbun.tech</code>
              </span>
            </div>

            {/* Test Action */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest || isSendingTarget}
                className={styles.btnTest}
              >
                {isSendingTest ? '⏳ Sending Test...' : '🧪 Send Test Email to Me (harsh@skillbun.tech)'}
              </button>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '0.3rem 0' }}></div>

            {/* Targeted Candidate Dispatch */}
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.formLabel}>Send Directly to Specific Candidate:</label>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  value={targetRecipient}
                  onChange={(e) => setTargetRecipient(e.target.value)}
                  placeholder="student@example.com"
                  className={styles.inputField}
                  style={{ flex: '1', minWidth: '220px' }}
                />
                <button
                  type="button"
                  onClick={handleSendTargetRecipient}
                  disabled={isSendingTest || isSendingTarget || !targetRecipient}
                  className={styles.btnPrimary}
                >
                  {isSendingTarget ? '🚀 Dispatching...' : '✉️ Dispatch Email'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <input
                type="checkbox"
                id="forceOverrideCheck"
                checked={forceOverride}
                onChange={(e) => setForceOverride(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="forceOverrideCheck" style={{ fontSize: '0.78rem', color: 'var(--muted)', cursor: 'pointer' }}>
                ⚡ Force Send (Override unsubscribe filter for critical transactional / operational notices)
              </label>
            </div>

            {/* Status Feedback Banner */}
            {statusMessage && (
              <div
                className={`${styles.statusMessage} ${
                  statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError
                }`}
              >
                {statusMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

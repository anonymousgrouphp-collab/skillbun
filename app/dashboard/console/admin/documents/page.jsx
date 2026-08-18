'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import styles from './documents.module.css';

// Strictly the 4 Production Documents Currently in Active Use
const PRODUCTION_DOCUMENTS = [
  {
    id: 'workforce_offer',
    category: 'Offer Letter',
    docType: 'OFFER_PACK',
    name: '🏢 Internship Offer Letter & Terms of Engagement',
    prefix: 'HR-OFF',
    defaultHeading: 'INTERNSHIP OFFER LETTER & TERMS OF ENGAGEMENT',
    description: '4-Page formal legal agreement & Zoho email dispatch issued upon candidate selection.',
    defaultClauses: `<h3>1. BACKGROUND & ORGANIZATIONAL OVERVIEW</h3>
<p>SkillBun operates with a dedicated mission to empower students and early-career software developers with structured roadmap navigation, practical technical skill mastery, and direct production engineering exposure. Through our collaborative internship programs, we bring emerging talent into high-impact environments to build, deploy, and scale world-class developer tools and career discovery platforms.</p>

<h3>2. SELECTION AS INTERN</h3>
<p>Following our structured 4-round technical screening process (comprising Resume & Portfolio Screening, Preliminary Introductory Evaluation, Technical Domain Q&A, and Leadership Review), SkillBun is pleased to extend this formal offer for the position of <strong>{{designation}}</strong> within the <strong>{{department}}</strong>.</p>

<h3>3. INTERNSHIP STATUS AND PURPOSE</h3>
<p><strong>3.1 Educational & Practical Learning Experience:</strong> This engagement is designed as an intensive experiential learning program aimed at bridging academic coursework with production-grade engineering, agile sprint workflows, and real-world system architecture.</p>
<p><strong>3.2 Internship Not Employment:</strong> The candidate acknowledges and agrees that this engagement is strictly an internship and does not constitute an employer-employee relationship, civil service post, or entitlement to permanent tenure at SkillBun.</p>
<p><strong>3.3 Collaborative Toolchains:</strong> The intern will collaborate closely with engineering leads, product architects, and peer team members using industry-standard communication and version-control toolchains (Zoho Workspace, GitHub, Figma, and Next.js).</p>

<h3>4. INTERNSHIP PARTICIPATION AND RESPONSIBILITIES</h3>
<p><strong>4.1 Internship Period:</strong> The tenure of this internship shall commence on <strong>{{joining_date}}</strong> and conclude on <strong>{{contract_end_date}}</strong> (the "Internship Period"), unless extended by mutual written agreement or terminated earlier pursuant to the provisions herein.</p>
<p><strong>4.2 Sprints & Deliverables:</strong> The intern shall actively participate in sprint planning, technical standups, milestone reviews, and feature implementations as assigned by their designated engineering mentor.</p>
<p><strong>4.3 Professional Standards:</strong> The intern agrees to uphold the highest standards of professional conduct, academic integrity, collaborative communication, and engineering discipline throughout the tenure.</p>

<h3>5. STIPEND, EXPENSES & EQUIPMENT</h3>
<p><strong>5.1 Stipend Structure:</strong> The candidate shall be entitled to receive a monthly stipend of <strong>INR {{stipend_amount}} / month</strong>, subject to regular milestone progress and sprint deliverable sign-offs.</p>
<p><strong>5.2 Remote Infrastructure:</strong> As a remote-first collaborative engagement, the intern shall utilize their personal computing workstation and secure high-speed internet connectivity.</p>

<h3>6. CONFIDENTIALITY & NON-DISCLOSURE (NDA)</h3>
<p><strong>6.1 Proprietary Information:</strong> The intern acknowledges that during the tenure, they will have access to confidential and proprietary information belonging to SkillBun, including but not limited to source code repositories, system architectures, API keys, student telemetry, curriculum roadmaps, and business strategies.</p>
<p><strong>6.2 Strict Non-Disclosure:</strong> The intern agrees not to disclose, publish, duplicate, or transfer any proprietary assets or confidential materials to any third party without explicit prior written authorization from SkillBun.</p>

<h3>7. INTELLECTUAL PROPERTY (IP) ASSIGNMENT</h3>
<p>All software source code, algorithms, documentation, UI/UX designs, system workflows, and technical artifacts created, authored, or contributed by the intern in connection with this internship belong solely, exclusively, and perpetually to SkillBun Technologies.</p>

<h3>8. CODE OF CONDUCT & NON-DISPARAGEMENT</h3>
<p>The intern agrees to maintain professional decorum across all public and internal communications. The intern shall not make, publish, or disseminate any false, misleading, or disparaging statements regarding SkillBun, its founders, mentors, or platform operations.</p>

<h3>9. TERMINATION & SEPARATION</h3>
<p>Either party may terminate this internship engagement with a <strong>7-day written notice</strong>. SkillBun reserves the right to conclude the engagement immediately in the event of material breach of confidentiality, willful misconduct, or non-delivery of milestone commitments.</p>

<h3>10. GOVERNING LAW & JURISDICTION</h3>
<p>This engagement letter and all accompanying terms shall be governed by and construed in accordance with the applicable laws of India, with jurisdiction vested in the competent courts of Gujarat, India.</p>`,
  },
  {
    id: 'workforce_extension',
    category: 'Extension',
    docType: 'EXTENSION_LETTER',
    name: '🏢 Extension of Internship Tenure Addendum',
    prefix: 'HR-EXT',
    defaultHeading: 'EXTENSION OF INTERNSHIP TENURE',
    description: '1-Page legal addendum & Zoho email dispatch extending completion date and sprint roadmap.',
    defaultClauses: `<h3>1. PERFORMANCE APPRECIATION & TENURE EXTENSION</h3>
<p>On behalf of SkillBun, we commend your outstanding technical contributions, dedication, and proactive engineering ownership demonstrated throughout your ongoing tenure as <strong>{{designation}}</strong> within the <strong>{{department}}</strong>. Your consistent execution across sprint milestones has been highly valued.</p>

<h3>2. REVISED INTERNSHIP PERIOD</h3>
<p>In recognition of your performance and ongoing project roadmaps, we are pleased to formally extend your internship engagement. The revised tenure of your internship is now effective from <strong>{{joining_date}}</strong> through <strong>{{extended_date}}</strong> (the "Extended Period").</p>

<h3>3. SCOPE OF CONTINUING WORK</h3>
<p>During the Extended Period, you will continue to lead feature deliverables, system optimizations, and agile sprints under the direction of your engineering mentor in alignment with SkillBun platform milestones.</p>

<h3>4. CONTINUING VALIDITY OF TERMS</h3>
<p>All other terms, conditions, confidentiality obligations (NDA), intellectual property assignments, and codes of conduct specified in your original Offer Letter (Ref: <strong>{{reference_id}}</strong>) shall remain in full force and effect without alteration.</p>`,
  },
  {
    id: 'workforce_termination',
    category: 'Termination',
    docType: 'TERMINATION_NOTICE',
    name: '🏢 Notice of Engagement Conclusion & Offboarding Record',
    prefix: 'HR-TERM',
    defaultHeading: 'NOTICE OF ENGAGEMENT CONCLUSION & OFFBOARDING RECORD',
    description: 'Formal separation notice, credential conclusion & alumni document registry archive record.',
    defaultClauses: `<h3>1. OFFICIAL NOTICE OF ENGAGEMENT CONCLUSION</h3>
<p>This document serves as official acknowledgement and notification regarding the formal conclusion of the internship engagement of <strong>{{candidate_name}}</strong> as <strong>{{designation}}</strong> in the <strong>{{department}}</strong>, effective <strong>{{contract_end_date}}</strong>.</p>

<h3>2. OFFBOARDING SUMMARY & REASON</h3>
<p>The engagement has concluded under status code <strong>COMPLETED / TENURE_CONCLUDED</strong> upon the fulfillment of assigned internship sprint milestones and academic term requirements.</p>

<h3>3. SYSTEM ACCESS & WORKSPACE OFFBOARDING</h3>
<p>In accordance with standard SkillBun security and IT governance protocols, all internal workspace credentials, corporate Zoho accounts, repository access, and developer keys have been systematically concluded.</p>

<h3>4. POST-ENGAGEMENT CONFIDENTIALITY</h3>
<p>The candidate is formally reminded of their continuing legal obligations regarding non-disclosure of proprietary source code, system architectures, and confidential platform data as agreed in their original terms of engagement.</p>

<h3>5. ALUMNI DOCUMENT VAULT ACCESS</h3>
<p>All granted completion documents, verified credentials, and tenure records remain permanently archived and publicly verifiable on the SkillBun Alumni Document Vault at <a href="https://skillbun.tech/alumni" target="_blank" rel="noopener noreferrer">https://skillbun.tech/alumni</a> using Reference ID <strong>{{reference_id}}</strong>.</p>`,
  },
  {
    id: 'workforce_activation',
    category: 'Activation',
    docType: 'ACTIVATION_WELCOME',
    name: '🏢 Day-1 Workspace & Credentials Activation Notice',
    prefix: 'HR-ACT',
    defaultHeading: 'DAY-1 WORKSPACE ACTIVATION & CREDENTIALS ONBOARDING',
    description: 'Corporate Zoho Mail credentials provisioning, team tools onboarding & Day-1 checklist.',
    defaultClauses: `<h3>1. WELCOME TO SKILLBUN ENGINEERING</h3>
<p>We are delighted to confirm that your onboarding documentation has been processed and your status is officially <strong>ACTIVE</strong> as <strong>{{designation}}</strong> within the <strong>{{department}}</strong>, effective from <strong>{{joining_date}}</strong>.</p>

<h3>2. PROVISIONED ENTERPRISE WORKSPACE CREDENTIALS</h3>
<p>Your official SkillBun enterprise workspace account has been provisioned. Please use these credentials to access your corporate work mailbox and collaborative toolchains:</p>
<ul>
  <li><strong>Corporate Work Email:</strong> {{work_email}}</li>
  <li><strong>Temporary Access Password:</strong> Provided in your secure onboarding transmission</li>
  <li><strong>Mail Login Portal:</strong> <a href="https://mail.zoho.in" target="_blank" rel="noopener noreferrer">https://mail.zoho.in</a></li>
</ul>

<h3>3. DAY-1 GETTING STARTED CHECKLIST</h3>
<ol>
  <li>Log in to your official Zoho work mailbox (<a href="https://mail.zoho.in" target="_blank" rel="noopener noreferrer">mail.zoho.in</a>) and configure your primary 2FA security credentials.</li>
  <li>Check your work inbox for GitHub organization invitations and team sprint schedules.</li>
  <li>Review the platform developer guidelines and architectural standards at <a href="https://skillbun.tech" target="_blank" rel="noopener noreferrer">skillbun.tech</a>.</li>
  <li>For any operational or technical support, connect directly with founder Harsh Patel at <a href="mailto:harsh@skillbun.tech">harsh@skillbun.tech</a>.</li>
</ol>`,
  },
];

const CATEGORIES = [
  'All',
  'Offer Letter',
  'Extension',
  'Termination',
  'Activation',
];

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

function formatDate(d) {
  if (!d) return '—';
  try {
    const dt = typeof d === 'string' ? new Date(d.includes('T') ? d : `${d}T00:00:00.000Z`) : new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  } catch { return String(d); }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return String(d); }
}

export default function DocumentManagerPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { isAdmin, checking } = useAdminAccess(user, authLoading);

  // Top Mode: 'studio' | 'registry'
  const [mainMode, setMainMode] = useState('studio');

  // ==========================================
  // STUDIO STATE (Strictly 4 Production Documents)
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState('workforce_offer');

  // Form Inputs / Parameters matching Firestore employee schema
  const [salutation, setSalutation] = useState('Mr./Ms.');
  const [candidateName, setCandidateName] = useState('Alex Sharma');
  const [parentName, setParentName] = useState('Rajesh Sharma');
  const [personalEmail, setPersonalEmail] = useState('alex.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [currentAddress, setCurrentAddress] = useState('Flat 402, Green Valley Apartments, Mumbai');
  const [permanentAddress, setPermanentAddress] = useState('Flat 402, Green Valley Apartments, Mumbai');
  const [department, setDepartment] = useState('Tech Team (Development & Engineering)');
  const [designation, setDesignation] = useState('Engineering Intern');
  const [courseDegree, setCourseDegree] = useState('B.Tech in Computer Science');
  const [collegeName, setCollegeName] = useState('National Institute of Technology');
  const [joiningDate, setJoiningDate] = useState('2026-09-01');
  const [contractEndDate, setContractEndDate] = useState('2026-11-30');
  const [extendedDate, setExtendedDate] = useState('2027-01-31');
  const [stipendAmount, setStipendAmount] = useState('15,000');
  const [workEmail, setWorkEmail] = useState('alex.sharma@skillbun.tech');
  const [signatoryName, setSignatoryName] = useState('Harsh Patel');
  const [signatoryTitle, setSignatoryTitle] = useState('Founder & Director');

  // Editable Document Content
  const [docHeading, setDocHeading] = useState(PRODUCTION_DOCUMENTS[0].defaultHeading);
  const [docClauses, setDocClauses] = useState(PRODUCTION_DOCUMENTS[0].defaultClauses);

  // Studio View Controls
  const [canvasViewMode, setCanvasViewMode] = useState('document'); // 'document' | 'email'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const [previewBg, setPreviewBg] = useState('dark'); // 'dark' | 'light'

  // Dispatch / Action State
  const [targetRecipient, setTargetRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingTarget, setIsSendingTarget] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const textareaRef = useRef(null);

  // ==========================================
  // REGISTRY (DATABASE ARCHIVE) STATE
  // ==========================================
  const [registryDocs, setRegistryDocs] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState('');
  const [registryTab, setRegistryTab] = useState('ALL');
  const [registrySearch, setRegistrySearch] = useState('');
  const [registrySort, setRegistrySort] = useState('newest');
  const [registryPagination, setRegistryPagination] = useState({ has_more: false, nextPageToken: null });

  // Detail Modal & Revocation
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
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

  const redirectDenied = useCallback(() => {
    router.replace('/dashboard/console/admin');
  }, [router]);

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

  // Current active template definition
  const currentTemplate = useMemo(() => {
    return PRODUCTION_DOCUMENTS.find(t => t.id === selectedTemplateId) || PRODUCTION_DOCUMENTS[0];
  }, [selectedTemplateId]);

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return PRODUCTION_DOCUMENTS;
    return PRODUCTION_DOCUMENTS.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  // Select a template
  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplateId(template.id);
    setDocHeading(template.defaultHeading);
    setDocClauses(template.defaultClauses);
    setStatusMessage(null);
  }, []);

  // Dynamic Reference ID matching SkillBun standard
  const currentRefId = useMemo(() => {
    const year = new Date().getFullYear();
    return `SKB/${year}/${currentTemplate.prefix}/8K29DF`;
  }, [currentTemplate.prefix]);

  // Interpolate Variables
  const renderedContent = useMemo(() => {
    let content = docClauses || '';
    const replacements = {
      '{{salutation}}': salutation || 'Mr./Ms.',
      '{{candidate_name}}': candidateName || 'Candidate Name',
      '{{parent_name}}': parentName || 'Parent / Guardian',
      '{{personal_email}}': personalEmail || 'candidate@example.com',
      '{{work_email}}': workEmail || 'candidate@skillbun.tech',
      '{{phone}}': phone || '—',
      '{{current_address}}': currentAddress || 'Address on record',
      '{{permanent_address}}': permanentAddress || currentAddress || 'Address on record',
      '{{department}}': department || 'Engineering Department',
      '{{designation}}': designation || 'Engineering Intern',
      '{{course_degree}}': courseDegree || 'B.Tech / Degree',
      '{{college_name}}': collegeName || 'University / College',
      '{{joining_date}}': formatDate(joiningDate),
      '{{contract_end_date}}': formatDate(contractEndDate),
      '{{extended_date}}': formatDate(extendedDate),
      '{{stipend_amount}}': stipendAmount || '0',
      '{{reference_id}}': currentRefId,
      '{{issue_date}}': formatDate(new Date()),
      '{{signatory_name}}': signatoryName || 'Harsh Patel',
      '{{signatory_title}}': signatoryTitle || 'Founder & Director',
      '{{company_name}}': 'SkillBun Technologies',
    };

    for (const [key, val] of Object.entries(replacements)) {
      content = content.replaceAll(key, val);
    }
    return content;
  }, [
    docClauses, salutation, candidateName, parentName, personalEmail, workEmail, phone,
    currentAddress, permanentAddress, department, designation, courseDegree, collegeName,
    joiningDate, contractEndDate, extendedDate, stipendAmount,
    currentRefId, signatoryName, signatoryTitle,
  ]);

  // Insert variable chip into clause textarea
  const handleInsertVariable = (varKey) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = docClauses;
    const nextVal = current.substring(0, start) + varKey + current.substring(end);
    setDocClauses(nextVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varKey.length, start + varKey.length);
    }, 50);
  };

  // Copy Clean Content / HTML
  const handleCopy = () => {
    if (!renderedContent) return;
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Download standalone HTML
  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docHeading || currentTemplate.defaultHeading} - ${candidateName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; padding: 40px; max-width: 800px; margin: 0 auto; }
    .brand-bar { border-bottom: 2.5px solid #008751; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .title { color: #008751; font-weight: 800; font-size: 22px; font-family: 'Fredoka', cursive, sans-serif; }
    .ref-badge { background: #f3f4f6; border: 1px solid #d1d5db; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 800; }
    .heading { text-align: center; font-size: 15px; font-weight: 800; text-transform: uppercase; background: #f9fafb; padding: 8px; border-left: 4px solid #008751; border-right: 4px solid #008751; margin: 20px 0; }
    .recipient-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 13.5px; }
    .signatory { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="brand-bar">
    <div>
      <div class="title">ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
      <div style="font-size: 11px; color: #4b5563;">SkillBun Technologies • Engineering Workforce Division</div>
    </div>
    <div style="text-align: right;">
      <span class="ref-badge">${currentRefId}</span>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Date: ${formatDate(new Date())}</div>
    </div>
  </div>

  <div class="recipient-box">
    <strong>TO: ${salutation} ${candidateName}</strong> (${parentName ? `S/o / D/o ${parentName}` : ''})<br>
    Current Address: ${currentAddress}<br>
    Academic Qualification: ${courseDegree} • ${collegeName}<br>
    Designation & Stream: ${designation} — ${department}
  </div>

  <div class="heading">${docHeading || currentTemplate.defaultHeading}</div>

  <div class="content">
    ${renderedContent}
  </div>

  <div class="signatory">
    <div>
      <strong>${signatoryName}</strong><br>
      <span style="font-size: 13px; color: #4b5563;">${signatoryTitle}</span><br>
      <span style="font-size: 12px; color: #008751; font-weight: 700;">SkillBun Technologies</span>
    </div>
    <div style="border: 1.5px dashed #008751; color: #008751; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800;">
      OFFICIALLY ISSUED • SKILLBUN HR
    </div>
  </div>

  <div class="footer">
    CONFIDENTIAL & PROPRIETARY • SKILLBUN TECHNOLOGIES • VERIFY RECORD AT HTTPS://SKILLBUN.TECH/ALUMNI
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRefId.replace(/\//g, '-')}-${candidateName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dispatch Test Email via Zoho SMTP
  const handleSendTestDispatch = async (isTarget = false) => {
    if (isTarget) setIsSendingTarget(true);
    else setIsSendingTest(true);
    setStatusMessage(null);

    try {
      const recipient = isTarget ? targetRecipient : 'harsh@skillbun.tech';
      if (isTarget && (!targetRecipient || !targetRecipient.includes('@'))) {
        throw new Error('Please enter a valid target email address.');
      }

      const subject = `[SkillBun] ${docHeading || currentTemplate.defaultHeading} - ${candidateName} (Ref: ${currentRefId})`;
      const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
  <div style="border-bottom: 2.5px solid #008751; padding-bottom: 12px; margin-bottom: 20px;">
    <div style="font-size: 20px; font-weight: 800; color: #008751; font-family: cursive, sans-serif;">ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
    <div style="font-size: 12px; color: #4b5563;">Official Workforce & Legal Document Transmission</div>
  </div>

  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px;">
    <strong>Reference ID:</strong> ${currentRefId}<br>
    <strong>Candidate Name:</strong> ${salutation} ${candidateName} (${personalEmail})<br>
    <strong>Role & Department:</strong> ${designation} (${department})
  </div>

  <h2 style="font-size: 15px; color: #111827; text-transform: uppercase; margin-bottom: 16px; border-left: 3px solid #008751; padding-left: 8px;">${docHeading || currentTemplate.defaultHeading}</h2>

  <div style="font-size: 13.5px; color: #374151; line-height: 1.65;">
    ${renderedContent}
  </div>

  <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
    SkillBun Technologies • Official HR & Workforce Registry • Verify at https://skillbun.tech/alumni
  </div>
</div>`;

      await request('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          recipientEmail: recipient,
          customSubject: subject,
          customHtml: htmlBody,
          forceOverride: true,
        }),
      });

      setStatusMessage({
        type: 'success',
        text: `Document successfully dispatched via Zoho SMTP to ${recipient}!`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to dispatch document transmission.',
      });
    } finally {
      setIsSendingTest(false);
      setIsSendingTarget(false);
    }
  };

  // ==========================================
  // REGISTRY (DATABASE ARCHIVE) HANDLERS
  // ==========================================
  const loadRegistryDocs = useCallback(async ({ append = false, pageToken = null } = {}) => {
    if (!user) return;
    setRegistryLoading(true);
    setRegistryError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (registryTab !== 'ALL') params.set('doc_type', registryTab);
      if (pageToken) params.set('pageToken', pageToken);
      const data = await request(`/api/admin/workforce/documents?${params.toString()}`);
      setRegistryDocs(cur => append ? [...cur, ...(data.documents || [])] : (data.documents || []));
      setRegistryPagination({ has_more: data.has_more || false, nextPageToken: data.nextPageToken || null });
    } catch (err) {
      if (!/Admin access/.test(err.message)) setRegistryError(err.message);
    } finally {
      setRegistryLoading(false);
    }
  }, [user, registryTab, request]);

  useEffect(() => {
    if (mainMode === 'registry' && user && isAdmin) {
      const timer = window.setTimeout(() => loadRegistryDocs(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [mainMode, registryTab, user, isAdmin, loadRegistryDocs]);

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
      setRegistryDocs(prev => prev.map(d => d.id === revokeTarget.id ? { ...d, is_revoked: newState } : d));
      if (selectedDoc?.id === revokeTarget.id) setSelectedDoc(prev => prev ? { ...prev, is_revoked: newState } : prev);
      setRevokeTarget(null);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setRevoking(false);
    }
  };

  const filteredRegistryDocs = useMemo(() => {
    let list = [...registryDocs];
    if (registrySearch.trim()) {
      const q = registrySearch.trim().toLowerCase();
      list = list.filter(d => {
        const name = (d.metadata_snapshot?.full_name || d.employee_name || '').toLowerCase();
        const email = (d.dispatched_to || '').toLowerCase();
        const ref = (d.display_id || d.id || '').toLowerCase();
        const title = (d.title || '').toLowerCase();
        return name.includes(q) || email.includes(q) || ref.includes(q) || title.includes(q);
      });
    }
    if (registrySort === 'oldest') {
      list.sort((a, b) => (a.issued_at || '').localeCompare(b.issued_at || ''));
    } else if (registrySort === 'name_asc') {
      list.sort((a, b) => (a.metadata_snapshot?.full_name || '').localeCompare(b.metadata_snapshot?.full_name || ''));
    } else if (registrySort === 'name_desc') {
      list.sort((a, b) => (b.metadata_snapshot?.full_name || '').localeCompare(a.metadata_snapshot?.full_name || ''));
    }
    return list;
  }, [registryDocs, registrySearch, registrySort]);

  /* ── Auth Guard ── */
  if (authLoading || checking) {
    return (
      <div className={styles.docContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ width: 44, height: 44, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: '600' }}>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    if (typeof window !== 'undefined') router.replace('/dashboard/console/admin');
    return null;
  }

  return (
    <div className={styles.docContainer}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <p className={styles.eyebrow}>
            SkillBun Operations • <Link href="/dashboard/console/admin">← Admin Hub</Link> • <Link href="/dashboard/console/admin/workforce">Workforce Hub</Link>
          </p>
          <div className={styles.titleBadge}>
            <h1 className={styles.titleText}>Document Studio & Manager</h1>
            <span className={styles.securityPill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Workforce Legal Console
            </span>
          </div>
          <p className={styles.subtitle}>
            Live interactive management for SkillBun's official workforce documents — Offer Letters, Tenure Extensions, Termination Notices, and Day-1 Activation Dispatches.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard/console/admin/emails" className={styles.actionBtnSecondary}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
            </svg>
            Mail Studio
          </Link>
          <Link href="/dashboard/console/admin/workforce" className={styles.actionBtnSecondary}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            Workforce CRM
          </Link>
        </div>
      </div>

      {/* Main Mode Switcher: Studio vs Archive Registry */}
      <div className={styles.mainModeTabs}>
        <button
          className={`${styles.mainModeBtn} ${mainMode === 'studio' ? styles.mainModeBtnActive : ''}`}
          onClick={() => setMainMode('studio')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Document Studio & Live Editor
        </button>
        <button
          className={`${styles.mainModeBtn} ${mainMode === 'registry' ? styles.mainModeBtnActive : ''}`}
          onClick={() => setMainMode('registry')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          Issued Documents Archive ({registryDocs.length})
        </button>
      </div>

      {/* ============================================================
          MODE 1: DOCUMENT STUDIO & LIVE EDITOR (4 PRODUCTION DOCUMENTS)
         ============================================================ */}
      {mainMode === 'studio' && (
        <div>
          {/* Category Tabs */}
          <div className={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${selectedCategory === cat ? styles.categoryTabActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 2-Column Studio Layout */}
          <div className={styles.studioLayout}>
            {/* Left Column: Document Selector, Parameters & Clause Editor */}
            <div className={styles.editorPanel}>
              {/* Document Selector */}
              <div className={styles.cardSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    Production Workforce Documents ({filteredTemplates.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 800 }}>
                    Active Templates
                  </span>
                </div>

                <div className={styles.templateList}>
                  {filteredTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className={`${styles.templateItem} ${selectedTemplateId === tpl.id ? styles.templateItemActive : ''}`}
                      onClick={() => handleSelectTemplate(tpl)}
                    >
                      <div className={styles.templateItemName}>
                        <span>{tpl.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--green)', fontFamily: 'monospace', fontWeight: 800 }}>
                          [{tpl.prefix}]
                        </span>
                      </div>
                      <div className={styles.templateItemDesc}>{tpl.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Variables Form matching Firestore Employee Schema */}
              <div className={styles.cardSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                    </svg>
                    Candidate & Engagement Data
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Live interpolation</span>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Salutation</label>
                    <select className={styles.inputField} value={salutation} onChange={e => setSalutation(e.target.value)}>
                      <option value="Mr./Ms.">Mr./Ms.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Candidate Full Name</label>
                    <input className={styles.inputField} value={candidateName} onChange={e => setCandidateName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Parent / Guardian Name</label>
                    <input className={styles.inputField} value={parentName} onChange={e => setParentName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Personal Email</label>
                    <input className={styles.inputField} value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input className={styles.inputField} value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Corporate Work Email</label>
                    <input className={styles.inputField} value={workEmail} onChange={e => setWorkEmail(e.target.value)} />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Address on Record</label>
                    <input className={styles.inputField} value={currentAddress} onChange={e => setCurrentAddress(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Department / Team</label>
                    <input className={styles.inputField} value={department} onChange={e => setDepartment(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Designation / Role</label>
                    <input className={styles.inputField} value={designation} onChange={e => setDesignation(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Course & Degree</label>
                    <input className={styles.inputField} value={courseDegree} onChange={e => setCourseDegree(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>College / Institution</label>
                    <input className={styles.inputField} value={collegeName} onChange={e => setCollegeName(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Joining Date</label>
                    <input type="date" className={styles.inputField} value={joiningDate} onChange={e => setJoiningDate(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contract End Date</label>
                    <input type="date" className={styles.inputField} value={contractEndDate} onChange={e => setContractEndDate(e.target.value)} />
                  </div>
                  {selectedTemplateId === 'workforce_extension' && (
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel} style={{ color: 'var(--green)' }}>Extended Contract End Date</label>
                      <input type="date" className={styles.inputField} value={extendedDate} onChange={e => setExtendedDate(e.target.value)} />
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Monthly Stipend (INR)</label>
                    <input className={styles.inputField} value={stipendAmount} onChange={e => setStipendAmount(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Authorized Signatory</label>
                    <input className={styles.inputField} value={signatoryName} onChange={e => setSignatoryName(e.target.value)} />
                  </div>
                </div>

                {/* Variable Chips */}
                <div style={{ marginTop: '0.85rem' }}>
                  <label className={styles.formLabel}>Insert dynamic variable tags:</label>
                  <div className={styles.variableBar}>
                    {[
                      '{{candidate_name}}', '{{designation}}', '{{department}}',
                      '{{joining_date}}', '{{contract_end_date}}', '{{stipend_amount}}',
                      '{{college_name}}', '{{work_email}}', '{{reference_id}}',
                    ].map(chip => (
                      <span key={chip} className={styles.variableChip} onClick={() => handleInsertVariable(chip)}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clause & Document Body Editor */}
              <div className={styles.cardSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                    </svg>
                    Legal Clauses & Body Editor
                  </h3>
                  <button
                    className={styles.actionBtnSecondary}
                    onClick={() => {
                      setDocHeading(currentTemplate.defaultHeading);
                      setDocClauses(currentTemplate.defaultClauses);
                    }}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Reset Clauses
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Document Header Banner</label>
                  <input
                    className={styles.inputField}
                    value={docHeading}
                    onChange={e => setDocHeading(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Document Clauses & Terms (HTML Format)</span>
                    <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}>
                      {copied ? '✓ Copied' : 'Copy HTML'}
                    </button>
                  </label>
                  <textarea
                    ref={textareaRef}
                    className={styles.textareaField}
                    value={docClauses}
                    onChange={e => setDocClauses(e.target.value)}
                    rows={12}
                    aria-label="Document clauses editor"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live A4 Canvas & Action Console */}
            <div className={styles.previewPanel}>
              {/* Preview Toolbar */}
              <div className={styles.previewToolbar}>
                {/* View Mode Switcher */}
                <div className={styles.deviceControls}>
                  <button
                    className={`${styles.deviceBtn} ${canvasViewMode === 'document' ? styles.deviceBtnActive : ''}`}
                    onClick={() => setCanvasViewMode('document')}
                  >
                    📄 Official Document View
                  </button>
                  <button
                    className={`${styles.deviceBtn} ${canvasViewMode === 'email' ? styles.deviceBtnActive : ''}`}
                    onClick={() => setCanvasViewMode('email')}
                  >
                    ✉️ Zoho Email Dispatch
                  </button>
                </div>

                {/* Viewport Width & Theme Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div className={styles.deviceControls}>
                    <button
                      className={`${styles.deviceBtn} ${viewport === 'desktop' ? styles.deviceBtnActive : ''}`}
                      onClick={() => setViewport('desktop')}
                      title="Desktop Width"
                    >
                      💻 Desktop
                    </button>
                    <button
                      className={`${styles.deviceBtn} ${viewport === 'mobile' ? styles.deviceBtnActive : ''}`}
                      onClick={() => setViewport('mobile')}
                      title="Mobile Width"
                    >
                      📱 Mobile
                    </button>
                  </div>

                  <div className={styles.deviceControls}>
                    <button
                      className={`${styles.deviceBtn} ${previewBg === 'dark' ? styles.deviceBtnActive : ''}`}
                      onClick={() => setPreviewBg('dark')}
                    >
                      🌙
                    </button>
                    <button
                      className={`${styles.deviceBtn} ${previewBg === 'light' ? styles.deviceBtnActive : ''}`}
                      onClick={() => setPreviewBg('light')}
                    >
                      ☀️
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Rendered Canvas Container */}
              <div className={`${styles.previewFrameContainer} ${previewBg === 'light' ? styles.previewFrameContainerLight : styles.previewFrameContainerDark}`}>
                {/* View 1: A4 Paper Document Canvas (matches pdf-lib layout) */}
                {canvasViewMode === 'document' && (
                  <div className={`${styles.a4DocumentCanvas} ${viewport === 'mobile' ? styles.a4CanvasMobile : ''}`}>
                    {/* Top Letterhead Bar */}
                    <div className={styles.docTopBrandBar}>
                      <div className={styles.docBrandLeft}>
                        <Image src="/logo.png" alt="SkillBun Logo" width={34} height={34} style={{ borderRadius: '8px' }} />
                        <div>
                          <div className={styles.docBrandWordmark}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
                          <div className={styles.docOrgTagline}>SkillBun Technologies • Engineering Workforce Division</div>
                        </div>
                      </div>
                      <div className={styles.docRefMeta}>
                        <span className={styles.docRefBadge}>{currentRefId}</span>
                        <span className={styles.docIssueDate}>Date: {formatDate(new Date())}</span>
                      </div>
                    </div>

                    {/* Candidate Details Box matching offerLetterGenerator.js */}
                    <div className={styles.docRecipientBlock}>
                      <strong>TO: {salutation} {candidateName || 'Candidate Name'}</strong>
                      {parentName ? ` (S/o / D/o ${parentName})` : ''}<br />
                      <span>Current Address: {currentAddress || 'Address on record'}</span><br />
                      <span>Academic Qualification: {courseDegree || 'Degree'} • {collegeName || 'Institution'}</span><br />
                      <span style={{ color: '#008751', fontWeight: 700 }}>Designation & Stream: {designation} — {department}</span>
                    </div>

                    {/* Document Header Banner */}
                    <div className={styles.docHeading}>
                      {docHeading || currentTemplate.defaultHeading}
                    </div>

                    {/* Rendered Dynamic Clauses */}
                    <div
                      className={styles.docBodyContent}
                      dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />

                    {/* Official Signatory Block */}
                    <div className={styles.docSignatoryBlock}>
                      <div className={styles.docSignatoryInfo}>
                        <strong>{signatoryName}</strong>
                        <span>{signatoryTitle}</span><br />
                        <span style={{ color: '#008751', fontWeight: 800, fontSize: '0.8rem' }}>SkillBun Technologies</span>
                      </div>
                      <div className={styles.docStampBadge}>
                        OFFICIALLY ISSUED • SKILLBUN HR
                      </div>
                    </div>

                    {/* Tamper-Proof Verification Notice */}
                    <div className={styles.docVerificationFooter}>
                      CONFIDENTIAL & OFFICIAL WORKFORCE DOCUMENT • SKILLBUN TECHNOLOGIES • VERIFY RECORD AT HTTPS://SKILLBUN.TECH/ALUMNI
                    </div>
                  </div>
                )}

                {/* View 2: Responsive Zoho Email Dispatch View */}
                {canvasViewMode === 'email' && (
                  <div style={{ width: '100%', maxWidth: viewport === 'mobile' ? '375px' : '620px', background: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', fontSize: '13.5px', lineHeight: 1.6 }}>
                    <div style={{ borderBottom: '2.5px solid #008751', paddingBottom: '12px', marginBottom: '16px' }}>
                      <div style={{ fontFamily: 'var(--font-fredoka), cursive', fontSize: '20px', fontWeight: 800, color: '#008751' }}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>SkillBun Hiring Team &bull; &lt;noreply@skillbun.tech&gt;</div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '13px' }}>
                      <strong>Subject:</strong> [SkillBun] {docHeading || currentTemplate.defaultHeading} - {candidateName} (Ref: {currentRefId})<br />
                      <strong>Recipient:</strong> {personalEmail} | <strong>CC:</strong> harsh@skillbun.tech
                    </div>

                    <p>Dear {salutation} {candidateName},</p>

                    <div dangerouslySetInnerHTML={{ __html: renderedContent }} />

                    <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                      Warm regards,<br />
                      <strong>SkillBun Hiring Team</strong><br />
                      Talent Acquisition & People Operations &bull; <a href="https://skillbun.tech" style={{ color: '#008751', fontWeight: 700, textDecoration: 'none' }}>skillbun.tech</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Console: Print, Download, & Zoho SMTP Dispatch */}
              <div className={styles.dispatchBox}>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button className={styles.btnPrimary} onClick={handlePrint}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print / Save PDF
                  </button>

                  <button className={styles.btnTest} onClick={handleDownloadHtml}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download HTML
                  </button>

                  <button className={styles.btnTest} onClick={handleCopy}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {copied ? 'Copied' : 'Copy Content'}
                  </button>

                  <button
                    className={styles.btnTest}
                    onClick={() => handleSendTestDispatch(false)}
                    disabled={isSendingTest || isSendingTarget}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    {isSendingTest ? 'Sending...' : 'Test to Founder (harsh@skillbun.tech)'}
                  </button>
                </div>

                {/* Send to Target Candidate Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="email"
                    className={styles.inputField}
                    placeholder="Dispatch directly to candidate email..."
                    value={targetRecipient}
                    onChange={e => setTargetRecipient(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    className={styles.btnPrimary}
                    onClick={() => handleSendTestDispatch(true)}
                    disabled={isSendingTest || isSendingTarget || !targetRecipient}
                    style={{ whiteSpace: 'nowrap', padding: '0.55rem 1rem' }}
                  >
                    {isSendingTarget ? 'Dispatching...' : 'Dispatch Document'}
                  </button>
                </div>

                {/* Status Message */}
                {statusMessage && (
                  <div className={`${styles.statusMessage} ${statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
                    {statusMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODE 2: ISSUED DOCUMENTS REGISTRY & ARCHIVE (DATABASE VIEW)
         ============================================================ */}
      {mainMode === 'registry' && (
        <div>
          {/* Stats row */}
          {!registryLoading && registryDocs.length > 0 && (
            <div className={styles.statRow}>
              <div className={styles.statPill}>
                <strong>{registryDocs.length}</strong> workforce documents archived
              </div>
              {registryDocs.filter(d => d.is_revoked).length > 0 && (
                <div className={styles.statPill} style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--border))' }}>
                  <strong style={{ color: 'var(--danger)' }}>{registryDocs.filter(d => d.is_revoked).length}</strong> revoked
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {registryError && (
            <div className={styles.statusMessage} style={{ background: 'var(--danger-soft)', color: 'var(--danger)', marginBottom: '1rem' }}>
              {registryError}
            </div>
          )}

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.categoryTabs} style={{ margin: 0 }}>
              {DOC_TYPE_TABS.map(t => (
                <button
                  key={t.key}
                  className={`${styles.categoryTab} ${registryTab === t.key ? styles.categoryTabActive : ''}`}
                  onClick={() => setRegistryTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '.65rem', alignItems: 'center' }}>
              <div className={styles.searchField}>
                <input
                  type="text"
                  placeholder="Search name, email, ref..."
                  value={registrySearch}
                  onChange={e => setRegistrySearch(e.target.value)}
                  aria-label="Search archived documents"
                />
              </div>
              <div className={styles.sortField}>
                <select value={registrySort} onChange={e => setRegistrySort(e.target.value)} aria-label="Sort documents">
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <button className={styles.refreshButton} onClick={() => loadRegistryDocs()} title="Refresh">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          {registryLoading && registryDocs.length === 0 ? (
            <div className={styles.loading}>
              <p>Loading document records...</p>
            </div>
          ) : filteredRegistryDocs.length === 0 ? (
            <div className={styles.empty}>
              <strong>{registrySearch ? 'No matching documents found' : 'No documents in archive'}</strong>
              <span>Issued workforce documents will appear here automatically.</span>
            </div>
          ) : (
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
                  {filteredRegistryDocs.map(doc => (
                    <tr key={doc.id} className={styles.docRow} onClick={() => openDetail(doc)}>
                      <td data-label="Reference">
                        <strong style={{ fontSize: '.82rem', fontFamily: 'monospace' }}>{doc.display_id || doc.id}</strong>
                        <small>{doc.title}</small>
                      </td>
                      <td data-label="Recipient">
                        <strong>{doc.metadata_snapshot?.full_name || doc.employee_name || '—'}</strong>
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
                          <button className={styles.actionButton} onClick={() => openDetail(doc)}>
                            View
                          </button>
                          <button
                            className={`${styles.actionButton} ${doc.is_revoked ? '' : styles.revokeButton}`}
                            onClick={() => setRevokeTarget(doc)}
                          >
                            {doc.is_revoked ? 'Restore' : 'Revoke'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Load more */}
          {registryPagination.has_more && (
            <div className={styles.loadMoreWrap}>
              <button
                className={styles.loadMoreButton}
                onClick={() => loadRegistryDocs({ append: true, pageToken: registryPagination.nextPageToken })}
                disabled={registryLoading}
              >
                {registryLoading ? 'Loading...' : 'Load More Records'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedDoc && (
        <div className={styles.backdrop} onClick={closeDetail}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{detailLoading ? 'Loading...' : (selectedDoc.display_id || selectedDoc.id)}</h2>
              <button className={styles.refreshButton} onClick={closeDetail} aria-label="Close" style={{ border: 0, background: 'transparent' }}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {detailLoading ? (
                <div className={styles.loading}>Loading details...</div>
              ) : (
                <>
                  <div className={styles.metaGrid}>
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Reference ID</span>
                      <span className={styles.metaValue}>{selectedDoc.display_id || selectedDoc.id}</span>
                    </div>
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Document Type</span>
                      <span className={styles.metaValue}>
                        <span className={`${styles.docTypeBadge} ${styles[`type${selectedDoc.doc_type}`] || styles.typeUNKNOWN}`}>
                          {DOC_TYPE_LABELS[selectedDoc.doc_type] || selectedDoc.doc_type}
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
                    <div className={styles.sectionLabel}>Recipient Information</div>

                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Full Name</span>
                      <span className={styles.metaValue}>{selectedDoc.metadata_snapshot?.full_name || selectedDoc.employee_name || '—'}</span>
                    </div>
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Email</span>
                      <span className={styles.metaValue}>{selectedDoc.dispatched_to || selectedDoc.metadata_snapshot?.personal_email || '—'}</span>
                    </div>
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Department</span>
                      <span className={styles.metaValue}>{selectedDoc.metadata_snapshot?.department || '—'}</span>
                    </div>
                    <div className={styles.metaField}>
                      <span className={styles.metaLabel}>Designation</span>
                      <span className={styles.metaValue}>{selectedDoc.metadata_snapshot?.designation || '—'}</span>
                    </div>

                    {selectedDoc.metadata_snapshot?.joining_date && (
                      <div className={styles.metaField}>
                        <span className={styles.metaLabel}>Joining Date</span>
                        <span className={styles.metaValue}>{formatDate(selectedDoc.metadata_snapshot.joining_date)}</span>
                      </div>
                    )}
                    {selectedDoc.metadata_snapshot?.contract_end_date && (
                      <div className={styles.metaField}>
                        <span className={styles.metaLabel}>Contract End Date</span>
                        <span className={styles.metaValue}>{formatDate(selectedDoc.metadata_snapshot.contract_end_date)}</span>
                      </div>
                    )}
                    {selectedDoc.metadata_snapshot?.extended_contract_end_date && (
                      <div className={styles.metaField}>
                        <span className={styles.metaLabel}>Extended End Date</span>
                        <span className={styles.metaValue} style={{ color: 'var(--green)', fontWeight: 800 }}>
                          {formatDate(selectedDoc.metadata_snapshot.extended_contract_end_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  {pdfBlobUrl ? (
                    <div className={styles.pdfPreviewWrap}>
                      <div className={styles.pdfPreviewHeader}>
                        <span>Stored PDF Preview</span>
                        <a href={pdfBlobUrl} download={`${selectedDoc.display_id || selectedDoc.id}.pdf`} className={styles.actionButton}>
                          Download Stored PDF
                        </a>
                      </div>
                      <iframe className={styles.pdfIframe} src={pdfBlobUrl} title="PDF Preview" />
                    </div>
                  ) : selectedDoc.has_pdf === false ? (
                    <div className={styles.noPdfNotice}>
                      No PDF stored for this document record.
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {!detailLoading && (
              <div className={styles.modalActions}>
                <button
                  className={selectedDoc.is_revoked ? styles.primaryButton : styles.dangerButton}
                  onClick={() => setRevokeTarget(selectedDoc)}
                >
                  {selectedDoc.is_revoked ? 'Restore Document' : 'Revoke Document'}
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
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                {revokeTarget.is_revoked ? (
                  <>Are you sure you want to <strong>restore</strong> document <strong>{revokeTarget.display_id || revokeTarget.id}</strong>?</>
                ) : (
                  <>Are you sure you want to <strong>revoke</strong> document <strong>{revokeTarget.display_id || revokeTarget.id}</strong>?</>
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
        <div className={styles.toast} role="status">{toast}</div>
      )}
    </div>
  );
}

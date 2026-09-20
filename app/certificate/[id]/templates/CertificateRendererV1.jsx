'use client';

import React from 'react';
import QRCodeSvg from '@/app/components/QRCodeSvg';
import OfficialSeal from '@/app/components/OfficialSeal';

function OrnateCorner({ position = 'TL', styles }) {
  const transforms = {
    TL: '',
    TR: 'scaleX(-1)',
    BL: 'scaleY(-1)',
    BR: 'scale(-1, -1)',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.certCorner} ${styles[`certCorner${position}`]}`}
      style={{ transform: transforms[position] }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 3 H100 M3 0 V100" stroke="#8C6D23" strokeWidth="3" />
      <path d="M0 7 H100 M7 0 V100" stroke="#F5E8C7" strokeWidth="1.5" />
      <path d="M0 11 H100 M11 0 V100" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M0 15 H100 M15 0 V100" stroke="#8C6D23" strokeWidth="1.5" />
      <path
        d="M15 15 C28 15 40 20 46 30 C52 39 48 50 38 55 C29 59 19 54 17 45 C15 35 23 26 33 26 C40 26 45 31 43 37 C41 42 36 44 33 40 C30 37 31 33 35 33"
        stroke="#9D782F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 15 C15 28 20 40 30 46 C39 52 50 48 55 38 C59 29 54 19 45 17 C35 15 26 23 26 33 C26 40 31 45 37 43 C42 41 44 36 40 33 C37 30 33 31 33 35"
        stroke="#9D782F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="26" cy="26" r="4.5" fill="#8C6D23" />
      <circle cx="26" cy="26" r="2.5" fill="#FDF6D8" />
      <circle cx="15" cy="15" r="2.5" fill="#8C6D23" />
      <path d="M26 26 Q44 18 62 19 Q50 24 44 32" fill="#C5A059" opacity="0.85" />
      <path d="M26 26 Q18 44 19 62 Q24 50 32 44" fill="#C5A059" opacity="0.85" />
    </svg>
  );
}

function IndiaFlagIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 2) / 3)}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: '2px',
        overflow: 'hidden',
        boxShadow: '0 0 1px rgba(0,0,0,0.4)',
        flexShrink: 0,
      }}
      aria-label="Flag of India"
    >
      <rect width="36" height="8" fill="#FF9933" />
      <rect y="8" width="36" height="8" fill="#FFFFFF" />
      <rect y="16" width="36" height="8" fill="#138808" />
      <circle cx="18" cy="12" r="3.2" stroke="#000080" strokeWidth="0.7" fill="none" />
      <circle cx="18" cy="12" r="0.7" fill="#000080" />
      {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle, i) => (
        <line
          key={i}
          x1="18"
          y1="12"
          x2={18 + 3 * Math.cos((angle * Math.PI) / 180)}
          y2={12 + 3 * Math.sin((angle * Math.PI) / 180)}
          stroke="#000080"
          strokeWidth="0.35"
        />
      ))}
    </svg>
  );
}

function formatRecommendationText(rawText, candidateName) {
  const firstName = candidateName ? candidateName.trim().split(' ')[0] : 'The candidate';
  if (!rawText || !rawText.trim()) {
    return `${firstName} demonstrated exceptional dedication, professional excellence, and proactive collaboration during their engagement at SkillBun. They contributed to key project and organizational milestones with distinguished commitment and high standards of execution. We wish them continued success in all future endeavors.`;
  }
  return rawText
    .replace(/^This is to certify that\s+[A-Za-z\s]+(has\s+)?(demonstrated|completed|shown|contributed)/i, `${firstName} $2`)
    .replace(/^This is to certify that\s+/i, '')
    .replace(/\bcore engineering milestones\b/gi, 'key organizational milestones')
    .replace(/\bengineering milestones\b/gi, 'project milestones')
    .replace(/\bhigh technical excellence\b/gi, 'professional excellence')
    .replace(/\btechnical excellence\b/gi, 'professional excellence')
    .replace(/\btechnical dedication\b/gi, 'professional dedication');
}

function getDisplayIssueDate(cert) {
  if (cert.issue_date) return cert.issue_date;

  const createdDate = cert.createdAtDate || new Date();

  if (cert.end_date) {
    const parts = cert.end_date.split(/[-/]/);
    let endDateObj = null;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        endDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else if (parts[2].length === 4) {
        endDateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
    if (endDateObj && !isNaN(endDateObj.getTime())) {
      if (createdDate < endDateObj) {
        return cert.end_date;
      }
    }
  }

  return createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
}

/**
 * Immutable V1 Certificate & Document Template Renderer.
 * Contains the exact, pixel-for-pixel visual layouts for:
 * 1. LOR (Letter of Recommendation - Corporate Letterhead)
 * 2. INTERNSHIP (Certificate of Completion - Vintage Landscape Frame)
 * 3. TRAINING (Practical Industry Training Certificate)
 * 4. ROADMAP (Academic Canva Template Overlay)
 */
export default function CertificateRendererV1({ cert, baseUrl, cinzel, pixelify, styles }) {
  const certType = (cert.cert_type || 'ROADMAP').toUpperCase();
  const certUrl = `${baseUrl}/certificate/${cert.id}`;

  if (certType === 'LOR') {
    return (
      <section className={styles.lorLetterhead}>
        {/* Top Institutional Header */}
        <div className={styles.lorHeader}>
          <div className={styles.lorBrandLockup}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-tight.png" alt="SkillBun Logo" className={styles.lorBrandLogo} />
            <div className={styles.lorBrandDetails}>
              <div className={styles.lorBrandWordmark}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
              <div className={styles.lorBrandSubtitle}>CAREER &amp; SKILLS</div>
            </div>
          </div>

          <div className={styles.lorGovtAttribution}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/reish-mark.png" alt="Reish Mark" className={styles.lorReishLogo} />
            <div className={styles.lorReishDetails}>
              <span className={styles.lorGovtTag}>MANAGED &amp; ISSUED BY</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/reish-wordmark.png" alt="REISH" className={styles.lorReishWordmarkImg} />
            </div>
          </div>
        </div>

        {/* Reference Meta Strip */}
        <div className={styles.lorMetaStrip}>
          <div className={styles.lorMetaItem}>
            <span className={styles.lorMetaLabel}>Reference ID:</span>
            <strong className={styles.lorMetaValue}>{cert.display_id || cert.id}</strong>
          </div>
          <div className={styles.lorMetaItem}>
            <span className={styles.lorMetaLabel}>Date of Issuance:</span>
            <strong className={styles.lorMetaValue}>{getDisplayIssueDate(cert)}</strong>
          </div>
        </div>

        {/* Title Section */}
        <div className={styles.lorTitleBlock}>
          <div className={styles.titleFlourishDivider}>
            <span className={styles.flourishSymbol}>❖</span>
            <div className={styles.flourishLine} />
            <span className={styles.flourishStar}>★</span>
            <div className={styles.flourishLine} />
            <span className={styles.flourishSymbol}>❖</span>
          </div>
          <h1 className={`${styles.lorMainTitle} ${cinzel.className}`}>
            Letter of Recommendation
          </h1>
          <div className={styles.lorSubTitleBadge}>
            OFFICIAL EXECUTIVE APPRAISAL &amp; ENDORSEMENT
          </div>
        </div>

        {/* Formal Salutation */}
        <div className={styles.lorSalutationBlock}>
          TO WHOMSOEVER IT MAY CONCERN
        </div>

        {/* Candidate Engagement Summary Grid */}
        <div className={styles.lorCandidateGrid}>
          <div className={styles.lorCandidatePill}>
            <span className={styles.lorPillLabel}>Candidate Name</span>
            <span className={styles.lorPillVal}>{cert.name}</span>
          </div>
          <div className={styles.lorCandidatePill}>
            <span className={styles.lorPillLabel}>Department</span>
            <span className={styles.lorPillVal}>{cert.department || cert.stream_or_track || 'Engineering'}</span>
          </div>
          <div className={styles.lorCandidatePill}>
            <span className={styles.lorPillLabel}>Designation</span>
            <span className={styles.lorPillVal}>{cert.designation || cert.role || 'Software Intern'}</span>
          </div>
          <div className={styles.lorCandidatePill}>
            <span className={styles.lorPillLabel}>Tenure Period</span>
            <span className={styles.lorPillVal}>
              {cert.start_date && cert.end_date
                ? `${cert.start_date} to ${cert.end_date}`
                : 'Project Milestone Engagement'}
            </span>
          </div>
        </div>

        {/* Structured Recommendation Body */}
        <div className={styles.lorBodyContent}>
          <p>
            It is with high professional regard and absolute confidence that I write this official Letter of Recommendation on behalf of <strong>{cert.name}</strong>, who completed their tenure at <strong>SkillBun</strong> (operated by <strong>Reish</strong>) serving in the capacity of <strong>{cert.designation || cert.role || 'Intern'}</strong> within the <strong>{cert.department || cert.stream_or_track || 'Operations'}</strong> department.
          </p>

          <p>
            {formatRecommendationText(
              cert.recommendation_text ||
              cert.performance_remarks ||
              `Throughout their engagement, ${cert.name} consistently demonstrated outstanding analytical capability, diligent execution, and disciplined adherence to organizational milestones. They proactively tackled complex challenges with initiative and creativity, collaborating seamlessly across multi-disciplinary teams while maintaining uncompromising standards of professionalism and integrity.`,
              cert.name
            )}
          </p>

          <p>
            Their positive attitude, strategic problem-solving aptitude, and fast-learning agility make them an invaluable asset to any high-performance team or advanced academic institution. I give <strong>{cert.name}</strong> my highest endorsement for all forthcoming career, postgraduate, and professional opportunities.
          </p>
        </div>

        {/* Executive Sign-off & Live Scannable Vector QR Code Block */}
        <div className={styles.lorAuthFooter}>
          {/* Left: Signatory */}
          <div className={styles.lorSigBlock}>
            <div className={styles.lorSignOffSalutation}>Sincerely,</div>
            <div className={styles.lorSignatureCanvas}>
              <div className={styles.lorSignatoryName}>
                {(cert.issued_by || 'Harsh Patel').replace(/\s*\(.*?\)/g, '').replace(/,\s*Lead.*/i, '').trim() || 'Harsh Patel'}
              </div>
              <div className={styles.lorSignatoryRole}>Founder &amp; Managing Director, SkillBun</div>
              <div className={styles.lorSignatoryOrg}>Operated by Reish</div>
              <div className={styles.lorSignatoryContact}>harsh@skillbun.tech</div>
            </div>
          </div>

          {/* Right: Live Vector Scannable QR Code */}
          <div className={styles.lorQrArea}>
            <div className={styles.qrCodeWrapper}>
              <QRCodeSvg value={certUrl} size={84} />
            </div>
            <span className={styles.lorQrLabel}>Scan to Verify Online</span>
          </div>
        </div>

        {/* Bottom Institutional Trust & Footnote Strip */}
        <div className={styles.lorVerificationFootnote}>
          <div className={styles.msmeSealBadge}>
            <IndiaFlagIcon size={18} />
            <span>Govt. of India MSME Registered Entity</span>
          </div>
          <div className={styles.footnoteUrl}>
            Ref: {cert.display_id || cert.id}
          </div>
        </div>
      </section>
    );
  }

  if (certType === 'INTERNSHIP') {
    return (
      <section className={styles.internshipCertFrame}>
        {/* Vintage Ornate Corner Accents */}
        <OrnateCorner position="TL" styles={styles} />
        <OrnateCorner position="TR" styles={styles} />
        <OrnateCorner position="BL" styles={styles} />
        <OrnateCorner position="BR" styles={styles} />

        {/* Inner Gold Frame */}
        <div className={styles.internshipInnerContainer}>
          {/* Top Institutional Header */}
          <div className={styles.internshipHeader}>
            <div className={styles.internshipBrandLockup}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-tight.png" alt="SkillBun Logo" className={styles.internshipBrandLogo} />
              <div className={styles.internshipBrandDetails}>
                <div className={styles.internshipBrandWordmark}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
                <div className={styles.internshipBrandSubtitle}>CAREER &amp; SKILLS</div>
              </div>
            </div>

            <div className={styles.internshipGovtAttribution}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/reish-mark.png" alt="Reish Mark" className={styles.internshipReishLogo} />
              <div className={styles.internshipReishDetails}>
                <span className={styles.internshipGovtTag}>MANAGED &amp; ISSUED BY</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reish-wordmark.png" alt="REISH" className={styles.internshipReishWordmarkImg} />
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className={styles.internshipTitleBlock}>
            <div className={styles.titleFlourishDivider}>
              <span className={styles.flourishSymbol}>❖</span>
              <div className={styles.flourishLine} />
              <span className={styles.flourishStar}>★</span>
              <div className={styles.flourishLine} />
              <span className={styles.flourishSymbol}>❖</span>
            </div>
            <h1 className={`${styles.internshipMainTitle} ${cinzel.className}`}>
              Certificate of Completion
            </h1>
            <div className={styles.internshipSubTitleBadge}>
              PROFESSIONAL INTERNSHIP MERIT CREDENTIAL
            </div>
          </div>

          {/* Recipient Statement */}
          <div className={styles.internshipRecipientSection}>
            <p className={styles.internshipCertifyText}>This is to certify that</p>
            <h2 className={`${styles.internshipCandidateName} ${cinzel.className}`}>
              {cert.name}
            </h2>
            <div className={styles.internshipNameUnderline}>
              <div className={styles.nameUnderlineDiamond} />
            </div>
          </div>

          {/* Role & Track Description */}
          <div className={styles.internshipAchievementBlock}>
            <p className={styles.internshipRoleStatement}>
              has successfully completed the professional internship as{' '}
              <strong className={styles.highlightRole}>
                {cert.designation || cert.role || 'Software Engineering Intern'}
              </strong>
              {' '}in{' '}
              <strong className={styles.highlightStream}>
                {cert.stream_or_track || cert.department || 'Software Development'}
              </strong>
            </p>
            <p className={styles.internshipOrgStatement}>
              conducted under the professional direction of <strong>SkillBun</strong> (operated by <strong>Reish</strong>).
            </p>
          </div>

          {/* Key Meta Badges: Duration, Grade, Mode */}
          <div className={styles.internshipMetricsGrid}>
            <div className={styles.internshipMetricPill}>
              <span className={styles.metricPillLabel}>Internship Duration</span>
              <span className={styles.metricPillVal}>
                {cert.start_date && cert.end_date
                  ? `${cert.start_date} to ${cert.end_date}`
                  : 'Milestone Tenure'}
              </span>
            </div>

            <div className={styles.internshipMetricPill}>
              <span className={styles.metricPillLabel}>Performance Rating</span>
              <span className={styles.metricPillVal}>
                {cert.grade || (cert.score ? `Grade A (${cert.score}%)` : 'Grade A (Excellent)')}
              </span>
            </div>

            <div className={styles.internshipMetricPill}>
              <span className={styles.metricPillLabel}>Mode &amp; Location</span>
              <span className={styles.metricPillVal}>
                {cert.mode || cert.venue || 'Virtual / Distributed Project Labs'}
              </span>
            </div>
          </div>

          {/* Formal Performance Statement */}
          <div className={styles.internshipConductStatement}>
            <p>
              {formatRecommendationText(
                cert.recommendation_text ||
                cert.performance_remarks ||
                'During the tenure, the intern demonstrated exceptional diligence, professional dedication, and strong problem-solving skills, contributing actively to organizational objectives and project deliverables.',
                cert.name
              )}
            </p>
          </div>

          {/* Signatures, Official Seal & QR Code Block */}
          <div className={styles.internshipAuthFooter}>
            {/* Left: Credential ID, Date & Signature */}
            <div className={styles.internshipSigBlock}>
              <div className={styles.internshipIdDate}>
                <div>Certificate ID: <strong>{cert.display_id || cert.id}</strong></div>
                <div>Date of Issue: <strong>{getDisplayIssueDate(cert)}</strong></div>
              </div>

              <div className={styles.signatureCanvas}>
                <div className={styles.signatoryName}>Harsh Patel</div>
                <div className={styles.signatoryRole}>Founder &amp; Managing Director, SkillBun</div>
              </div>
            </div>

            {/* Center: Gold Embossed Dual Brand Seal Stamp */}
            <div className={styles.internshipSealArea}>
              <OfficialSeal />
            </div>

            {/* Right: Live Vector Scannable QR Code */}
            <div className={styles.internshipQrArea}>
              <div className={styles.qrCodeWrapper}>
                <QRCodeSvg value={certUrl} size={88} />
              </div>
            </div>
          </div>

          {/* Bottom Trust & Verification Footnote Strip */}
          <div className={styles.internshipVerificationFootnote}>
            <div className={styles.msmeSealBadge}>
              <IndiaFlagIcon size={18} />
              <span>Govt. of India MSME Registered Entity</span>
            </div>
            <div className={styles.footnoteUrl}>
              Scan the above QR to verify online
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (certType === 'TRAINING') {
    return (
      <section className={styles.internshipCertFrame}>
        {/* Vintage Ornate Corner Accents */}
        <OrnateCorner position="TL" styles={styles} />
        <OrnateCorner position="TR" styles={styles} />
        <OrnateCorner position="BL" styles={styles} />
        <OrnateCorner position="BR" styles={styles} />

        {/* Inner Gold Frame */}
        <div className={styles.internshipInnerContainer}>
          {/* Top Institutional Header */}
          <div className={styles.internshipHeader}>
            <div className={styles.internshipBrandLockup}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-tight.png" alt="SkillBun Logo" className={styles.internshipBrandLogo} />
              <div className={styles.internshipBrandDetails}>
                <div className={styles.internshipBrandWordmark}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
                <div className={styles.internshipBrandSubtitle}>CAREER &amp; SKILLS</div>
              </div>
            </div>

            <div className={styles.internshipGovtAttribution}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/reish-mark.png" alt="Reish Mark" className={styles.internshipReishLogo} />
              <div className={styles.internshipReishDetails}>
                <span className={styles.internshipGovtTag}>MANAGED &amp; ISSUED BY</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reish-wordmark.png" alt="REISH" className={styles.internshipReishWordmarkImg} />
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className={styles.internshipTitleBlock}>
            <div className={styles.titleFlourishDivider}>
              <span className={styles.flourishSymbol}>❖</span>
              <div className={styles.flourishLine} />
              <span className={styles.flourishStar}>★</span>
              <div className={styles.flourishLine} />
              <span className={styles.flourishSymbol}>❖</span>
            </div>
            <h1 className={`${styles.internshipMainTitle} ${cinzel.className}`}>
              Certificate of Training
            </h1>
            <div className={styles.internshipSubTitleBadge}>
              PRACTICAL INDUSTRY TRAINING &amp; MERIT CREDENTIAL
            </div>
          </div>

          {/* Recipient Statement */}
          <div className={styles.internshipRecipientSection}>
            <p className={styles.internshipCertifyText}>This is to certify that</p>
            <h2 className={`${styles.internshipCandidateName} ${cinzel.className}`}>
              {cert.name}
            </h2>
            <div className={styles.internshipNameUnderline}>
              <div className={styles.nameUnderlineDiamond} />
            </div>
          </div>

          {/* Training Track Description */}
          <div className={styles.internshipAchievementBlock}>
            <p className={styles.internshipRoleStatement}>
              has successfully undergone and completed the intensive practical industry training in{' '}
              <strong className={styles.highlightRole}>
                {cert.stream_or_track || cert.department || cert.role || 'Full-Stack Web Engineering & Distributed Cloud Systems'}
              </strong>
            </p>
            <p className={styles.internshipOrgStatement}>
              conducted under the professional mentorship of <strong>SkillBun</strong> (operated by <strong>Reish</strong>).
            </p>
          </div>

          {/* Key Meta Badges: Duration, Grade, Mode */}
          <div className={styles.internshipMetricsGrid}>
            <div className={styles.internshipMetricPill}>
              <span className={styles.metricPillLabel}>Training Tenure</span>
              <span className={styles.metricPillVal}>
                {cert.start_date && cert.end_date
                  ? `${cert.start_date} to ${cert.end_date}`
                  : 'Practical Labs & Sprints'}
              </span>
            </div>

            <div className={styles.internshipMetricPill}>
              <span className={styles.metricPillLabel}>Performance Rating</span>
              <span className={styles.metricPillVal}>
                {cert.grade || (cert.score ? `Grade A (${cert.score}%)` : 'Grade A (Distinction)')}
              </span>
            </div>

            <div className={styles.internshipMetricPill}>
              <span className={styles.metricPillLabel}>Mode of Training</span>
              <span className={styles.metricPillVal}>
                {cert.mode || cert.venue || 'Virtual / Project-Based Labs'}
              </span>
            </div>
          </div>

          {/* Formal Performance Statement */}
          <div className={styles.internshipConductStatement}>
            <p>
              {formatRecommendationText(
                cert.recommendation_text ||
                cert.performance_remarks ||
                'During the training curriculum, the candidate demonstrated exceptional analytical capability, disciplined execution, and outstanding proficiency across all practical laboratory assignments and technical sprints.',
                cert.name
              )}
            </p>
          </div>

          {/* Signatures, Official Seal & QR Code Block */}
          <div className={styles.internshipAuthFooter}>
            {/* Left: Credential ID, Date & Signature */}
            <div className={styles.internshipSigBlock}>
              <div className={styles.internshipIdDate}>
                <div>Certificate ID: <strong>{cert.display_id || cert.id}</strong></div>
                <div>Date of Issue: <strong>{getDisplayIssueDate(cert)}</strong></div>
              </div>

              <div className={styles.signatureCanvas}>
                <div className={styles.signatoryName}>Signing Authority</div>
                <div className={styles.signatoryRole}>Managing Director, SkillBun</div>
              </div>
            </div>

            {/* Center: Gold Embossed Dual Brand Seal Stamp */}
            <div className={styles.internshipSealArea}>
              <OfficialSeal />
            </div>

            {/* Right: Live Vector Scannable QR Code */}
            <div className={styles.internshipQrArea}>
              <div className={styles.qrCodeWrapper}>
                <QRCodeSvg value={certUrl} size={88} />
              </div>
            </div>
          </div>

          {/* Bottom Trust & Verification Footnote Strip */}
          <div className={styles.internshipVerificationFootnote}>
            <div className={styles.msmeSealBadge}>
              <IndiaFlagIcon size={18} />
              <span>Govt. of India MSME Registered Entity</span>
            </div>
            <div className={styles.footnoteUrl}>
              Scan the above QR to verify online
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default / Academic Roadmap Certificate (BRANCH 4 - Existing Canva Template Overlay)
  return (
    <section className={styles.certificateFrame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/certificate-template.png"
        alt={`SkillBun Certificate of Completion — ${cert.name}`}
        className={styles.templateImg}
        draggable={false}
      />
      <div className={styles.skillbunOverlay} aria-hidden="true">
        <span className={styles.skillbunText}>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
      </div>
      <h1 className={`${styles.recipientName} ${cinzel.className}`}>{cert.name}</h1>
      <h2
        className={`${styles.roadmapTitle} ${pixelify.className}`}
        style={{ '--char-count': (cert.roadmapTitle || '').length }}
      >
        {cert.roadmapTitle}
      </h2>
      <div className={styles.qrMeta}>
        <span className={styles.qrMetaId}>{cert.display_id || cert.id}</span>
      </div>
    </section>
  );
}

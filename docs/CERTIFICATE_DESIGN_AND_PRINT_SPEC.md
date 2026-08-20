# SkillBun Certificate Design, Print & Architecture Specification

> **Mandatory Standard & Knowledge Base for SkillBun Credential Systems**  
> *This document codifies the design rules, print engine architecture, database resolution patterns, and critical pitfalls learned to prevent regression.*

---

## 1. The Visual Master Standard ("Bhara-Bhara" Principle)

The on-screen desktop certificate view is the **absolute golden master standard** for all rendered certificates (Internship, Training, and Merit credentials).

- **Rich & Filled Layout**: Certificates must fill the parchment frame with generous proportions, majestic typography, and balanced spacing. 
- **No Sparse / Shrunken Voids**: Content must never appear stranded in huge empty white margins or with undersized micro-fonts.
- **24K Gold Official Seal**: Prominently featured in the center (`88px × 88px` on screen and print).
- **Scannable Live Vector QR Code**: Centered in a gold-bordered container (`84px × 84px` on screen and print).
- **Institutional Frame**: Double border framing (`#8C6D23` outer, `#C5A059` inner) with 4 ornate vintage corner flourishes.

---

## 2. Print System & PDF Rendering Architecture

### ❌ The Pitfall: Micro-Millimeter Font Overrides
In previous iterations, applying micro-millimeter font sizes (`font-size: 2.2mm`, `padding: 1.2mm`, `width: 24mm`) inside `@media print` caused the browser print engine to shrink elements down by ~45%, creating sparse, hollow PDFs with enormous white voids.

### ✅ The Rule: Desktop-Proportional Tokens in Print
In `@media print`, maintain full desktop-scale font sizes, padding, and layout units:
```css
@media print {
  @page {
    size: landscape;
    margin: 0;
  }

  .page {
    height: 100vh !important;
    width: 100vw !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .internshipCertFrame {
    width: 95vw !important;
    max-width: 1040px !important;
    margin: auto !important;
    padding: 10px 14px !important;
    border: 3.5px solid #8C6D23 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .internshipInnerContainer {
    padding: 1rem 2rem !important;
    border: 1.5px solid #C5A059 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Typography Scale */
  .internshipMainTitle { font-size: 1.85rem !important; }
  .internshipCandidateName { font-size: 2.05rem !important; }
  .internshipRoleStatement { font-size: 0.92rem !important; }

  /* Auth Footer Assets */
  .internshipSealArea img, .internshipSealArea svg { width: 88px !important; height: 88px !important; }
  .qrCodeWrapper { width: 84px !important; height: 84px !important; padding: 5px !important; }
}
```

---

## 3. CSS Modules & Turbopack Safety (Next.js)

### ❌ The Pitfall: Impure Bare Tag Selectors
Bare HTML tag selectors (e.g. `nav`, `footer`, `header`, `button`) placed at the root of `*.module.css` files cause **Next.js Turbopack compiler crashes** during production builds (`npm run build` / Vercel deployments).

### ✅ The Rule: Scoped Module Classes or `:global(...)`
1. Never write bare tags in `*.module.css`.
2. Convert all semantic containers to styled CSS module classes:
   - `<header>` ➔ `<div className={styles.internshipHeader}>`
   - `<footer>` ➔ `<div className={styles.internshipAuthFooter}>`
3. If targeting global elements inside print, wrap in `:global(...)`:
   ```css
   :global(nav), :global(footer) { display: none !important; }
   ```

---

## 4. Screen Breakpoint Isolation

### ❌ The Pitfall: Unscoped Media Queries Triggering in Print
Queries like `@media (max-width: 768px)` trigger inside browser print engines if the print canvas width is evaluated under 768px, causing printouts to collapse into a vertical mobile layout.

### ✅ The Rule: Explicit Screen Scoping
Always prefix mobile and responsive queries with `screen and`:
```css
/* ✅ Correct */
@media screen and (max-width: 768px) { ... }
@media screen and (max-width: 480px) { ... }
```

---

## 5. Header Lockup & Typography Tracking Alignment

Both headers must be visually balanced and symmetrical:
1. **Left (SkillBun Brand Lockup)**:
   - Wordmark: `ꌗꀘꀤ꒒꒒ꌃꀎꈤ` (Fredoka font, Brand Green `#00b87a`)
   - Subtitle: `CAREER & SKILLS` with `letter-spacing: 0.20em;`
2. **Right (REISH Entity Lockup)**:
   - Top Tag: `MANAGED & ISSUED BY` with `letter-spacing: 0.11em;` (strictly no `text-align: justify`).
   - Wordmark: Official `reish-wordmark.png` image asset.

---

## 6. Database ID Normalization & Slashes in Firestore

### ❌ The Pitfall: Passing Slashes to `doc(db, 'collection', id)`
Firestore interprets `/` in document paths as subcollection delimiters. Passing `SKB/2026/INT-REC/EJGHNG` causes an `Invalid collection reference` crash.

### ✅ The Rule: Dual-Format Architecture
1. **Database Storage Key (Document ID)**: Stored with hyphens: `SKB-2026-INT-REC-EJGHNG`.
2. **Human Display ID (`display_id`)**: Stored with slashes: `SKB/2026/INT-REC/EJGHNG`.
3. **Lookup Normalization Pattern**:
   ```javascript
   const normalizedId = rawInput.replace(/\//g, '-');
   const displayId = rawInput.replace(/-/g, '/');

   // 1. Direct document lookup by hyphenated ID
   let snapshot = await getDoc(doc(db, 'certificates', normalizedId));

   // 2. Fallback query by display_id field
   if (!snapshot.exists()) {
     const q = query(collection(db, 'certificates'), where('display_id', 'in', [rawInput, displayId, normalizedId]));
     const querySnap = await getDocs(q);
     if (!querySnap.empty) snapshot = querySnap.docs[0];
   }
   ```

---

## 7. Dynamic PDF File Naming Standard

When the user clicks **"Print / Save PDF"**, the browser automatically names the PDF using `document.title`.

- **Certificates Pattern**: `${candidateName} - ${roleOrTrack} Certificate - SkillBun.pdf`
- **LOR Pattern**: `${candidateName} - Letter of Recommendation - SkillBun.pdf`
- **Implementation**:
  ```javascript
  const handlePrint = () => {
    const candidateName = cert?.name?.trim() || 'Candidate';
    const isLor = certType === 'LOR';
    const roleOrTrack = (cert?.designation || cert?.stream_or_track || cert?.roadmapTitle || 'Certificate').trim();
    const docTitle = isLor
      ? `${candidateName} - Letter of Recommendation - SkillBun`
      : `${candidateName} - ${roleOrTrack} Certificate - SkillBun`;
    triggerDocumentPrint({
      title: docTitle,
    });
  };
  ```

---

## 8. Cross-Platform Vector Icons (Never Raw System Flag Emojis)

### ❌ The Pitfall: Windows Flag Emoji Collapse
Windows fonts (*Segoe UI Emoji*) do not provide color flag bitmaps for `🇮🇳` (*Flag of India*), causing Windows browsers to render the raw 2-letter country code text `"IN"`.

### ✅ The Rule: Pure Inline Vector SVGs
Always render flags and trust seals with crisp, cross-platform inline SVG components (`<IndiaFlagIcon size={18} />`) featuring:
- Official Saffron, White, and Green tricolor bands.
- 24-spoke Navy Blue Ashoka Chakra.
- Guaranteed 100% pixel-perfect rendering across Windows, macOS, Linux, Android, iOS, and in all PDF exports.

---

## 9. Live Vector QR Code Specification

- **Rendering**: Pure SVG vector output via `qrcode.react` (`QRCodeSvg`).
- **Error Correction**: Level `'H'` (High — 30% redundancy).
- **Center Badge**: 24px circular white shield with SkillBun bunny mark (`/logo.png`).
- **Canonical Destination URL**: `https://skillbun.vercel.app/certificate/${cleanId}` (hyphenated).

---

## 10. Template Classification & Branching

| Certificate Type | Template Style | Frame Type |
|---|---|---|
| **INTERNSHIP** (`INT-REC`) | Academic Parchment Frame | 4 Corner Flourishes, Symmetrical Headers, 3 Metric Badges, Conduct Statement, 24K Gold Seal, Vector QR, IndiaFlagIcon |
| **TRAINING** (`INT-PRAC`) | Practical Industry Engineering Parchment Frame | 4 Corner Flourishes, Symmetrical Headers, Training Tenure/Rating/Mode Badges, Lab Evaluation Remarks, 24K Gold Seal, Vector QR, IndiaFlagIcon |
| **LOR** (`HR-REL` / `LOR`) | Corporate Executive Letterhead | Executive Letterhead, Ref ID Strip, Salutation, 4-Pill Candidate Grid, Structured 3-Paragraph Appraisal, Clean Founder/Director Sign-off, Scannable Vector QR, IndiaFlagIcon (No Academic Seal) |
| **ROADMAP** (Academic) | Historical Canva Template Overlay | High-Res Background Overlay, Recipient Name & Roadmap Title Overlays |

---

## 11. Checklist to Prevent Regressions

Before pushing changes to certificate or print code:
- [x] Run `npm test` (verify 11/11 tests pass).
- [x] Run `npx eslint` on touched paths.
- [x] Run `npm run build` (confirm Turbopack compiles with 0 errors).
- [x] Increment `package.json` version by `0.0.1`.
- [x] Push to both `origin main` and `v2 main`.
- [x] Verify Print / Save PDF preview fills portrait/landscape canvas with rich proportions.

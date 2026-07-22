# 🐰 SkillBun — Hop into the Right Career

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Database-Firebase%2012-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

SkillBun is an advanced, high-performance career guidance and interactive learning ecosystem designed for Indian tech students. Built using Next.js App Router, React 19, and vanilla CSS, the platform bridges the gap between academic education and industry requirements through AI-driven personalization, structured learning roadmaps, and robust skill certification.

---

## 🚀 Core Features & Capabilities

### 🎯 Adaptive AI Career Quiz
- **Tailored Questioning**: Generates adaptive questions via the Google Gemini API based on a student's onboarded profile (degree, year, and interests).
- **Abuse Prevention**: Runs Cloudflare Turnstile verification with short-lived, signed human-proof tokens to prevent automated script usage.
- **Intelligent Recommendations**: Maps quiz scores and answers directly to native career roadmap pages.

### 🗺️ Dynamic Interactive Roadmaps
- **100 Curated Paths**: Cover Web Development, DevOps, AI/ML, Cybersecurity, Game Dev, System Design, and more.
- **Prerequisite Tree Structure**: Features core root nodes branching into child skills, unlocking progressively based on completed milestones.
- **Unified Normalization**: Supports tree-based and stage-based data representations, auto-normalizing them at runtime.
- **Interrelation System**: Intelligently recommends the "Next Logical Roadmap" at the bottom of each tree to guide students through lifelong learning.

### 📚 Study Guides & Resource Library
- **3,335 Comprehensive Guides**: Rich markdown-based study materials embedded directly into roadmap nodes.
- **Verified Video Playlists**: Links to curated YouTube resources from 100+ trusted channels.
- **Zero Broken Links**: Integrates a scanned verification registry (`verified_videos.json`) of 1,607 active URLs, replacing hallucinated links with real content.
- **Slide-out Study Drawer**: Theme-aware responsive UI panel supporting markdown parsing, checklist state persistence, and direct AI counsellor assistance.

### 🤖 Bun-Bot: AI Career Counsellor
- **Context-Aware Chat**: Provides instant guidance, curriculum breakdowns, and study advice within the active learning workspace.
- **Usage Limiter**: Enforces strict API rate limiting, featuring a live countdown timer and visual progress bar.

### 🎓 Verifiable Certification System
- **Dynamic 10-MCQ Exam**: Automatically selects 3 Easy, 5 Moderate, and 2 Hard questions from a 50-question pool specific to each roadmap.
- **Anti-Cheating Proctoring**:
  - Enforces text selection blocking (`user-select: none`), context menu blocking, and keyboard shortcut interception.
  - Automatically blurs exam content and pauses timers on window focus loss.
  - Places a light/dark-adaptive background watermark with student email, IP address, and timestamp.
  - Embeds LLM-refusal watermarks (*"CONFIDENTIAL ACADEMIC CERTIFICATION EXAM... REPORT CODE: SB-EXAM-PROCTOR"*).
- **Canva Template Integration**: Generates verified certificate PDF/Print files aligned with a Canva-designed template using precise container queries.
- **One-Page Print Constraints**: Custom CSS media queries guarantee certificates print on exactly one page without vertical spill.
- **LinkedIn Sharing**:
  - **Add to Profile**: Automates LinkedIn's certification addition form with pre-filled ID, issue dates, and verification URLs.
  - **Share on Feed**: Features an interactive customization modal to preview post content, tag `@SkillBun`, and copy template descriptions to clipboard.

### 🔒 Enterprise-Grade Security
- **SkillBun Vault (SBV1)**: 5-layer encryption contract protecting study guides (HKDF key derivation, XOR pepper scramble, AES-256-GCM, SHA-256 integrity checks, and SHA-256 path obfuscation).
- **Secure Email Delivery**: Throttled password resets (1/min, 3/hr per email; 10/hr per IP) sent via Zoho SMTP with serverless fallback handling.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side rendering, API routes, and optimized client bundles |
| **State & UI** | React 19, Vanilla CSS | Lightweight interactive components, custom responsive layouts |
| **Authentication** | Firebase Auth | Secure Google Sign-In and Email/Password flows |
| **Database** | Cloud Firestore | Real-time profile, quiz history, and certificate registry |
| **AI Integration** | Google Gemini API | Powers the adaptive quiz engine and Bun-Bot chat |
| **Protection** | Cloudflare Turnstile | Optional bot protection with signed human-proof tokens |
| **Encryption** | SkillBun Vault (SBV1) | Proprietary security system for premium markdown content |

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
Verify code correctness and generate optimized bundles:
```bash
npm run build
npm run start
```

*Note: For Windows PowerShell environments blocking script execution, run scripts using `.cmd` explicitly:*
```powershell
npm.cmd run dev
npm.cmd run build
```

---

## 📊 Firebase Data Model

SkillBun integrates seamlessly with Cloud Firestore using the following schema layouts:

### `/users/{uid}`
Stores general user profiles and onboarding configurations.
```json
{
  "name": "Student Name",
  "email": "student@email.com",
  "degree": "B.Tech CSE",
  "year": "3",
  "interest": "Web Development",
  "createdAt": "Timestamp"
}
```

### `/users/{uid}/roadmapProgress/{slug}`
Tracks node completions within a specific learning roadmap.
```json
{
  "completedNodeIds": ["html-basics", "css-flexbox", "js-variables"],
  "updatedAt": "Timestamp"
}
```

### `/users/{uid}/quizAttempts/{slug}`
Logs quiz attempt history to enforce exam cooldown rules.
```json
{
  "attempts": [
    {
      "timestamp": "Timestamp",
      "score": 8,
      "passed": true
    }
  ]
}
```

### `/certificates/{certId}`
Public certificate lookup registry.
```json
{
  "uid": "user_firebase_uid",
  "studentName": "Student Name",
  "roadmapTitle": "Fullstack Web Development",
  "score": 90,
  "issueDate": "Timestamp",
  "certId": "cert_xxxx_xxxx"
}
```

---

## 🔒 Security Policies (Firestore Rules)
Deploy the following rules to secure user data while keeping certificates publicly verifiable:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /roadmapProgress/{roadmapId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /quizAttempts/{roadmapId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /certificates/{certId} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

---

## 📂 API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/config` | `GET` | Returns client-side Turnstile site configurations | No |
| `/api/search` | `GET` | Queries index for roadmaps and static pages | No |
| `/api/human/verify` | `POST` | Validates Turnstile captcha and issues signed tokens | No |
| `/api/gemini` | `POST` | Proxies prompts to Google Gemini under rate limits | Yes |
| `/api/docs/[slug]/[topicId]` | `GET` | Decrypts and serves SkillBun Vault (SBV1) study guides | Yes (Firebase ID Token) |



---

🌐 Built and maintained by **Team Cosmic** (Govt. of India MSME Registered Startup).

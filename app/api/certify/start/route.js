import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { validateSchema } from '@/utils/server/inputValidator';
import { checkServerRateLimit } from '@/utils/server/rateLimitStore';
import { getClientAddress } from '@/utils/server/requestUtils';
import {
  loadRoadmapData,
  loadQuizBank,
  verifyExamEligibility,
  selectAndPrepareExamQuestions,
  generateAttemptId,
} from '@/utils/server/certifyEngine';

export const runtime = 'nodejs';

const START_RATE_LIMITS = [
  { name: 'startMinute', windowMs: 60 * 1000, maxRequests: 5, getSubject: ({ uid }) => `user:${uid}` },
  { name: 'startIpHour', windowMs: 60 * 60 * 1000, maxRequests: 25, getSubject: ({ address }) => `ip:${address}` },
];

export async function POST(request) {
  try {
    // 1. Verify User Authentication
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Authentication required to start certification exam.' }, { status: 401 });
    }

    let decodedToken;
    try {
      const adminAuth = getFirebaseAdminAuth();
      if (!adminAuth) {
        return NextResponse.json({ error: 'Server authentication configuration error.' }, { status: 500 });
      }
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired authentication token. Please log in again.' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const email = (decodedToken.email || '').toLowerCase();
    const address = getClientAddress(request);

    // 2. Rate Limiting Protection
    const rateLimit = await checkServerRateLimit({
      namespace: 'certStart',
      subject: { uid, address },
      limits: START_RATE_LIMITS,
      increment: true,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many exam start requests. Please wait a moment.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))) },
        }
      );
    }

    // 3. Parse and Validate Request Payload
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 });
    }

    const schemaCheck = validateSchema(
      rawBody,
      {
        roadmapSlug: {
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 80,
          pattern: /^[a-z0-9_]+$/,
          label: 'Roadmap Slug',
        },
        certName: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 100,
          label: 'Candidate Name',
        },
      },
      {
        fieldName: 'Exam start payload',
        allowUnknown: false,
        maxKeys: 3,
      }
    );

    if (!schemaCheck.isValid) {
      return NextResponse.json({ error: schemaCheck.error }, { status: 400 });
    }

    const { roadmapSlug, certName } = schemaCheck.value;

    // 4. Load Roadmap Data
    const roadmapData = await loadRoadmapData(roadmapSlug);
    if (!roadmapData) {
      return NextResponse.json({ error: 'Roadmap curriculum not found.' }, { status: 404 });
    }

    // 5. Verify Eligibility (Already Certified, Cooldowns, 60% Progress)
    const eligibility = await verifyExamEligibility({ uid, slug: roadmapSlug, roadmapData });
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.error,
          reason: eligibility.reason,
          cooldownRemaining: eligibility.cooldownRemaining || 0,
          certId: eligibility.certId || null,
        },
        { status: 403 }
      );
    }

    // 6. Load Question Bank
    const questionBank = await loadQuizBank(roadmapSlug);
    if (!questionBank) {
      return NextResponse.json({ error: 'Certification quiz is not available for this roadmap yet.' }, { status: 404 });
    }

    // 7. Select & Prepare Questions (Authoritative Server State vs Sanitized Client State)
    const { serverQuestions, clientQuestions } = selectAndPrepareExamQuestions(questionBank);

    // 8. Generate and Record Attempt in Firestore
    const attemptId = generateAttemptId();
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: 'Database service unavailable.' }, { status: 500 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 510 * 1000); // 8.5 minutes (10 * 45s + 60s network buffer)

    const attemptRecord = {
      attemptId,
      uid,
      userEmail: email,
      roadmapSlug,
      roadmapTitle: roadmapData.title || roadmapSlug,
      certName: certName.trim(),
      serverQuestions,
      clientQuestions,
      status: 'ACTIVE',
      startedAt: now,
      expiresAt,
      submitted: false,
      minted: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('examAttempts').doc(attemptId).set(attemptRecord);

    // Update historical attempts subcollection for cooldown tracking
    try {
      const attemptsDocRef = db.collection('users').doc(uid).collection('quizAttempts').doc(roadmapSlug);
      const docSnap = await attemptsDocRef.get();
      const existingAttempts = docSnap.exists && Array.isArray(docSnap.data().attempts)
        ? docSnap.data().attempts
        : [];

      await attemptsDocRef.set(
        {
          slug: roadmapSlug,
          attempts: [...existingAttempts, Date.now()],
          lastAttemptAt: Date.now(),
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (attemptLogErr) {
      console.warn('[Quiz Attempt Log Warning]:', attemptLogErr.message);
    }

    // 9. Return Sanitized Questions to Client (STRICTLY NO ANSWERS OR EXPLANATIONS)
    return NextResponse.json({
      success: true,
      attemptId,
      roadmapTitle: roadmapData.title || roadmapSlug,
      questions: clientQuestions,
      totalQuestions: clientQuestions.length,
      timeLimitPerQuestion: 45,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[Certify Start API Error]:', error);
    return NextResponse.json({ error: 'Failed to initiate certification exam. Please try again.' }, { status: 500 });
  }
}

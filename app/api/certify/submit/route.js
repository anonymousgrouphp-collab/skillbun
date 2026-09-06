import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { checkServerRateLimit } from '@/utils/server/rateLimitStore';
import { getClientAddress } from '@/utils/server/requestUtils';
import { gradeExamAttempt } from '@/utils/server/certifyEngine';

export const runtime = 'nodejs';

const SUBMIT_RATE_LIMITS = [
  { name: 'submitMinute', windowMs: 60 * 1000, maxRequests: 10, getSubject: ({ uid }) => `user:${uid}` },
  { name: 'submitIpHour', windowMs: 60 * 60 * 1000, maxRequests: 40, getSubject: ({ address }) => `ip:${address}` },
];

export async function POST(request) {
  try {
    // 1. Verify User Authentication
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Authentication required to submit exam.' }, { status: 401 });
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
    const address = getClientAddress(request);

    // 2. Rate Limiting Protection
    const rateLimit = await checkServerRateLimit({
      namespace: 'certSubmit',
      subject: { uid, address },
      limits: SUBMIT_RATE_LIMITS,
      increment: true,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many exam submission requests. Please wait a moment.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))) },
        }
      );
    }

    // 3. Parse Request Payload
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 });
    }

    const attemptId = String(rawBody.attemptId || '').trim();
    const answers = typeof rawBody.answers === 'object' && rawBody.answers !== null ? rawBody.answers : {};
    const isDevBypass = Boolean(rawBody.isDevBypass);

    if (!attemptId || !attemptId.startsWith('att_')) {
      return NextResponse.json({ error: 'Valid attemptId is required.' }, { status: 400 });
    }

    // 4. Retrieve and Validate Attempt from Firestore
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: 'Database service unavailable.' }, { status: 500 });
    }

    const attemptRef = db.collection('examAttempts').doc(attemptId);
    const attemptSnap = await attemptRef.get();

    if (!attemptSnap.exists) {
      return NextResponse.json({ error: 'Exam attempt not found.' }, { status: 404 });
    }

    const attemptData = attemptSnap.data();

    // Verify ownership
    if (attemptData.uid !== uid) {
      return NextResponse.json({ error: 'Unauthorized attempt access.' }, { status: 403 });
    }

    // Verify status
    if (attemptData.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: `Exam attempt has already been ${attemptData.status.toLowerCase()}.`,
          status: attemptData.status,
          score: attemptData.score ?? null,
          passed: attemptData.passed ?? false,
        },
        { status: 400 }
      );
    }

    // Verify time limit (allowing 15-second network latency grace)
    const now = Date.now();
    const expiresAtMs = attemptData.expiresAt ? attemptData.expiresAt.toDate().getTime() : 0;
    if (expiresAtMs > 0 && now > expiresAtMs + 15000) {
      await attemptRef.update({
        status: 'EXPIRED',
        submittedAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json(
        { error: 'Exam attempt expired. Maximum allowable time limit exceeded.' },
        { status: 400 }
      );
    }

    // 5. Authoritative Grading
    let score;
    let passed;
    let correctCount;
    let review;

    if (process.env.NODE_ENV === 'development' && isDevBypass) {
      // Developer bypass for rapid testing
      correctCount = 10;
      score = 100;
      passed = true;
      review = (attemptData.serverQuestions || []).map((sq, idx) => ({
        index: idx,
        question: sq.question,
        options: sq.options,
        userChoice: sq.correctIndex,
        correctIndex: sq.correctIndex,
        isCorrect: true,
        explanation: sq.explanation || 'Developer testing bypass enabled.',
      }));
    } else {
      const grading = gradeExamAttempt(attemptData.serverQuestions || [], answers);
      score = grading.score;
      passed = grading.passed;
      correctCount = grading.correctCount;
      review = grading.review;
    }

    // 6. Update Attempt Document in Firestore
    const submissionDate = new Date();
    await attemptRef.update({
      status: 'COMPLETED',
      submittedAt: submissionDate,
      submittedAnswers: answers,
      correctCount,
      score,
      passed,
      updatedAt: submissionDate,
    });

    return NextResponse.json({
      success: true,
      attemptId,
      score,
      passed,
      correctCount,
      total: 10,
      review,
    });
  } catch (error) {
    console.error('[Certify Submit API Error]:', error);
    return NextResponse.json({ error: 'Failed to evaluate exam answers. Please try again.' }, { status: 500 });
  }
}

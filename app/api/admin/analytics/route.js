import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const roadmapsDir = path.join(process.cwd(), 'public', 'data', 'roadmaps');
    const quizzesDir = path.join(process.cwd(), 'public', 'data', 'quizzes');

    // Count available roadmap JSON files
    let roadmapsCount = 0;
    if (fs.existsSync(roadmapsDir)) {
      roadmapsCount = fs.readdirSync(roadmapsDir).filter((f) => f.endsWith('.json')).length;
    }

    // Count static quizzes & total question bank
    let quizFilesCount = 0;
    let totalQuestionsCount = 0;
    if (fs.existsSync(quizzesDir)) {
      const files = fs.readdirSync(quizzesDir).filter((f) => f.endsWith('.json'));
      quizFilesCount = files.length;
      files.forEach((file) => {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(quizzesDir, file), 'utf8'));
          if (Array.isArray(content)) {
            totalQuestionsCount += content.length;
          }
        } catch (e) {}
      });
    }

    let usersList = [];
    let certsList = [];
    let authUsersMap = {};
    let unsubscribedEmailsMap = {};

    // 1. Fetch Firebase Auth Users metadata (lastSignInTime, creationTime)
    try {
      const adminAuth = getFirebaseAdminAuth();
      if (adminAuth) {
        const listUsersResult = await adminAuth.listUsers(1000);
        listUsersResult.users.forEach((userRecord) => {
          authUsersMap[userRecord.uid] = {
            lastSignInTime: userRecord.metadata?.lastSignInTime
              ? new Date(userRecord.metadata.lastSignInTime).toISOString()
              : null,
            creationTime: userRecord.metadata?.creationTime
              ? new Date(userRecord.metadata.creationTime).toISOString()
              : null,
            email: userRecord.email || '',
            displayName: userRecord.displayName || '',
            providers: userRecord.providerData?.map((p) => p.providerId) || [],
          };
        });
      }
    } catch (authErr) {
      console.warn('[Admin Analytics API] Firebase Auth listUsers warning:', authErr.message);
    }

    // 2. Fetch Firestore Users, Unsubscribes, Roadmap Progress, Quiz Attempts, and Certificates
    try {
      const db = getFirebaseAdminFirestore();
      if (db) {
        // Fetch unsubscribed emails map
        try {
          const unsubSnap = await db.collection('unsubscribes').get();
          unsubSnap.docs.forEach((uDoc) => {
            const uData = uDoc.data();
            unsubscribedEmailsMap[uDoc.id.toLowerCase()] = {
              unsubscribedAt: uData.unsubscribedAt || null,
            };
          });
        } catch (unsubErr) {
          console.warn('[Admin Analytics API] Unsubscribes fetch warning:', unsubErr.message);
        }

        // Fetch all real certificates
        const certsSnap = await db.collection('certificates').orderBy('createdAt', 'desc').get();
        certsList = certsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            certId: doc.id,
            uid: data.uid || '',
            name: data.name || data.studentName || data.userName || 'Anonymous Student',
            email: data.email || data.userEmail || '',
            roadmapTitle: data.roadmapTitle || data.roadmapSlug || 'Roadmap',
            roadmapSlug: data.roadmapSlug || '',
            score: typeof data.score === 'number' ? data.score : 0,
            createdAt: data.createdAt ? new Date(data.createdAt.toDate?.() || data.createdAt).toISOString() : new Date().toISOString(),
          };
        });

        // Fetch all real user documents from Firestore
        const usersSnap = await db.collection('users').get();
        const processedUids = new Set();

        for (const userDoc of usersSnap.docs) {
          const uData = userDoc.data();
          const uid = userDoc.id;
          processedUids.add(uid);

          const authMeta = authUsersMap[uid] || {};
          const userEmailLower = (uData.email || authMeta.email || '').toLowerCase();
          const unsubMeta = unsubscribedEmailsMap[userEmailLower];
          const isUnsubscribed = Boolean(unsubMeta);
          const unsubscribedAt = isUnsubscribed ? unsubMeta.unsubscribedAt : null;

          // Fetch user's roadmap progress subcollection
          let progressList = [];
          try {
            const progSnap = await db.collection('users').doc(uid).collection('roadmapProgress').get();
            progressList = progSnap.docs.map((pDoc) => {
              const pData = pDoc.data();
              return {
                slug: pDoc.id,
                completedNodeIds: Array.isArray(pData.completedNodeIds) ? pData.completedNodeIds : [],
                updatedAt: pData.updatedAt ? new Date(pData.updatedAt.toDate?.() || pData.updatedAt).toISOString() : null,
              };
            });
          } catch (e) {}

          // Fetch user's quiz attempts subcollection
          let quizAttemptsList = [];
          try {
            const quizSnap = await db.collection('users').doc(uid).collection('quizAttempts').get();
            quizAttemptsList = quizSnap.docs.map((qDoc) => {
              const qData = qDoc.data();
              return {
                slug: qDoc.id,
                attemptsCount: Array.isArray(qData.attempts) ? qData.attempts.length : 0,
                lastAttemptAt: qData.lastAttemptAt ? new Date(qData.lastAttemptAt).toISOString() : null,
                updatedAt: qData.updatedAt ? new Date(qData.updatedAt.toDate?.() || qData.updatedAt).toISOString() : null,
              };
            });
          } catch (e) {}

          // Link certificates belonging to this user
          const userCerts = certsList.filter(
            (c) => c.uid === uid || (c.email && uData.email && c.email.toLowerCase() === uData.email.toLowerCase())
          );

          usersList.push({
            uid,
            name: uData.name || uData.displayName || uData.fullName || authMeta.displayName || 'Registered Student',
            email: uData.email || authMeta.email || 'N/A',
            degree: uData.degree || 'N/A',
            year: uData.year || uData.current_year || 'N/A',
            interest: uData.interest || uData.interest_area || 'N/A',
            providers: Array.isArray(uData.providers) && uData.providers.length > 0 ? uData.providers : (authMeta.providers || []),
            createdAt: uData.createdAt ? new Date(uData.createdAt.toDate?.() || uData.createdAt).toISOString() : (authMeta.creationTime || null),
            lastSignInTime: uData.updatedAt ? new Date(uData.updatedAt.toDate?.() || uData.updatedAt).toISOString() : (authMeta.lastSignInTime || uData.createdAt || null),
            isUnsubscribed,
            unsubscribedAt,
            progress: progressList,
            quizAttempts: quizAttemptsList,
            sentEmailHistory: Array.isArray(uData.sentEmailHistory) ? uData.sentEmailHistory : [],
            certificates: userCerts,
          });
        }

        // Include any Auth users who haven't created a Firestore profile document yet
        Object.keys(authUsersMap).forEach((authUid) => {
          if (!processedUids.has(authUid)) {
            const authMeta = authUsersMap[authUid];
            const userEmailLower = (authMeta.email || '').toLowerCase();
            const unsubMeta = unsubscribedEmailsMap[userEmailLower];
            const isUnsubscribed = Boolean(unsubMeta);
            const unsubscribedAt = isUnsubscribed ? unsubMeta.unsubscribedAt : null;

            const userCerts = certsList.filter(
              (c) => c.uid === authUid || (c.email && authMeta.email && c.email.toLowerCase() === authMeta.email.toLowerCase())
            );

            usersList.push({
              uid: authUid,
              name: authMeta.displayName || 'Auth User',
              email: authMeta.email || 'N/A',
              degree: 'N/A',
              year: 'N/A',
              interest: 'N/A',
              providers: authMeta.providers || [],
              createdAt: authMeta.creationTime || null,
              lastSignInTime: authMeta.lastSignInTime || authMeta.creationTime || null,
              isUnsubscribed,
              unsubscribedAt,
              progress: [],
              quizAttempts: [],
              sentEmailHistory: [],
              certificates: userCerts,
            });
          }
        });
      }
    } catch (err) {
      console.warn('[Admin Analytics API] Firestore server fetch:', err.message);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalStudents: usersList.length,
        totalCertificates: certsList.length,
        totalRoadmaps: roadmapsCount,
        quizQuestionBank: totalQuestionsCount,
        quizCategoriesCount: quizFilesCount,
      },
      users: usersList,
      certificates: certsList,
    });
  } catch (error) {
    console.error('[Admin Analytics API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}

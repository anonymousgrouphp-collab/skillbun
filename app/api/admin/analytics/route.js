import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
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

    try {
      const db = getFirebaseAdminFirestore();
      if (db) {
        // Fetch all real certificates from Firestore
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

        // Fetch all real users from Firestore
        const usersSnap = await db.collection('users').get();
        
        for (const userDoc of usersSnap.docs) {
          const uData = userDoc.data();
          const uid = userDoc.id;

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

          // Link certificates belonging to this user
          const userCerts = certsList.filter(
            (c) => c.uid === uid || (c.email && uData.email && c.email.toLowerCase() === uData.email.toLowerCase())
          );

          usersList.push({
            uid,
            name: uData.name || uData.displayName || uData.fullName || 'Registered Student',
            email: uData.email || 'N/A',
            degree: uData.degree || 'N/A',
            year: uData.year || uData.current_year || 'N/A',
            interest: uData.interest || uData.interest_area || 'N/A',
            providers: Array.isArray(uData.providers) ? uData.providers : [],
            createdAt: uData.createdAt ? new Date(uData.createdAt.toDate?.() || uData.createdAt).toISOString() : null,
            progress: progressList,
            certificates: userCerts,
          });
        }
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

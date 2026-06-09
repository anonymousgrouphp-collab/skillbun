import { NextResponse } from 'next/server'
import { getFirebaseAdminAuth, getFirebaseAdminStorage } from '@/utils/server/firebaseAdmin'

/**
 * GET /api/docs/[slug]/[topicId]
 * Serves study guide markdown from Firebase Storage.
 * Requires Firebase Auth — returns 401 for unauthenticated requests.
 */
export async function GET(request, { params }) {
  const { slug, topicId } = await params

  // Validate path params
  if (!slug || !topicId || /[^a-zA-Z0-9_-]/.test(slug) || /[^a-zA-Z0-9_-]/.test(topicId)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // Auth check — extract Firebase ID token
  const authHeader = request.headers.get('authorization') || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!idToken) {
    return NextResponse.json(
      { error: 'Authentication required. Please log in to access study guides.' },
      { status: 401 }
    )
  }

  try {
    await getFirebaseAdminAuth().verifyIdToken(idToken)
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid or expired authentication token. Please log in again.' },
      { status: 401 }
    )
  }

  // Fetch from Firebase Storage
  try {
    const storage = getFirebaseAdminStorage()
    const bucket = storage.bucket()
    const filePath = `docs/${slug}/${topicId}.md`
    const file = bucket.file(filePath)

    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json({ error: 'Study guide not found' }, { status: 404 })
    }

    const [content] = await file.download()
    const markdown = content.toString('utf-8')

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('Error fetching study guide:', err)
    return NextResponse.json(
      { error: 'Failed to load study guide. Please try again.' },
      { status: 500 }
    )
  }
}

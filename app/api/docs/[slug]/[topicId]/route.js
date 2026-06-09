import { NextResponse } from 'next/server'
import { getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createDecipheriv, createHmac, createHash } from 'crypto'

/**
 * GET /api/docs/[slug]/[topicId]
 * 
 * Decrypts and serves study guides from SkillBun Vault (SBV1) encrypted files.
 * Requires Firebase Auth — returns 401 for unauthenticated requests.
 * 
 * SBV1 Format: Magic(4) + Version(1) + Salt(16) + IV(12) + AuthTag(16) + ContentHash(32) + Ciphertext
 */

// SkillBun secret pepper — must match encrypt-docs.js
const SB_PEPPER = Buffer.from('SkillBunVault2026!HopIntoSecurity@SBV1#Pepper$Key%Guard', 'utf8')

function deriveFileKey(masterKeyHex, salt, fileIdentity) {
  const masterKey = Buffer.from(masterKeyHex, 'hex')
  const prk = createHmac('sha256', salt).update(masterKey).digest()
  const info = Buffer.from(`sbv1:studyguide:${fileIdentity}`, 'utf8')
  return createHmac('sha256', prk)
    .update(Buffer.concat([info, Buffer.from([0x01])]))
    .digest()
}

function xorScramble(data) {
  const result = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ SB_PEPPER[i % SB_PEPPER.length] ^ ((i * 7 + 13) & 0xFF)
  }
  return result
}

function obfuscateFilename(slug, topicId) {
  return createHash('sha256')
    .update(`sbv1:${slug}/${topicId}`)
    .digest('hex')
    .slice(0, 24)
}

function decryptSBV1(filePath, encryptionKey, fileIdentity) {
  const data = readFileSync(filePath)

  // Validate magic header
  const magic = data.subarray(0, 4).toString('ascii')
  if (magic !== 'SBV1') {
    throw new Error('Invalid SBV1 file format')
  }

  // Parse format
  const version = data[4]
  if (version !== 0x01) {
    throw new Error(`Unsupported SBV1 version: ${version}`)
  }

  const salt = data.subarray(5, 21)         // 16 bytes
  const iv = data.subarray(21, 33)          // 12 bytes
  const authTag = data.subarray(33, 49)     // 16 bytes
  const contentHash = data.subarray(49, 81) // 32 bytes
  const cipherText = data.subarray(81)      // rest

  // Derive per-file key
  const fileKey = deriveFileKey(encryptionKey, salt, fileIdentity)

  // AES-256-GCM decryption
  const decipher = createDecipheriv('aes-256-gcm', fileKey, iv)
  decipher.setAuthTag(authTag)
  const scrambled = Buffer.concat([decipher.update(cipherText), decipher.final()])

  // Reverse XOR scramble
  const plaintext = xorScramble(scrambled)

  // Verify content integrity
  const actualHash = createHash('sha256').update(plaintext).digest()
  if (!actualHash.equals(contentHash)) {
    throw new Error('Content integrity check failed — file may be corrupted')
  }

  return plaintext.toString('utf-8')
}

export async function GET(request, { params }) {
  const { slug, topicId } = await params

  // Validate path params — prevent path traversal
  if (!slug || !topicId || /[^a-zA-Z0-9_-]/.test(slug) || /[^a-zA-Z0-9_-]/.test(topicId)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // Auth check
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

  // Decrypt and serve
  const encryptionKey = process.env.DOCS_ENCRYPTION_KEY
  if (!encryptionKey || encryptionKey.length !== 64) {
    console.error('DOCS_ENCRYPTION_KEY is not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const fileIdentity = `${slug}/${topicId}`
    const obfuscatedName = obfuscateFilename(slug, topicId)
    const shard = obfuscatedName.slice(0, 2) // first 2 chars as directory shard
    const filePath = join(process.cwd(), 'content', 'docs', shard, `${obfuscatedName}.sbv`)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Study guide not found' }, { status: 404 })
    }

    const markdown = decryptSBV1(filePath, encryptionKey, fileIdentity)

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('Error decrypting study guide:', err)
    return NextResponse.json(
      { error: 'Failed to load study guide. Please try again.' },
      { status: 500 }
    )
  }
}

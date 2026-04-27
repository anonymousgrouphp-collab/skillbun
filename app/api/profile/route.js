import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/server/env'

const MAX_TEXT_LENGTH = 240
const VALID_YEARS = new Set(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated / Working'])

function cleanText(value, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function cleanOptionalText(value, maxLength = MAX_TEXT_LENGTH) {
  const cleaned = cleanText(value, maxLength)
  return cleaned || null
}

function isMissingColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`
  return error?.code === 'PGRST204' || /column|schema cache/i.test(message)
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 })
    }

    const degree = cleanText(body.degree)
    const currentYear = cleanText(body.year || body.current_year, 80)

    if (!degree) {
      return NextResponse.json({ error: 'Degree is required.' }, { status: 400 })
    }

    if (!VALID_YEARS.has(currentYear)) {
      return NextResponse.json({ error: 'Current year is invalid.' }, { status: 400 })
    }

    const requiredProfileData = {
      user_id: user.id,
      full_name: cleanText(body.name || user.user_metadata?.full_name || ''),
      email: cleanText(user.email || '', 320),
      degree,
      current_year: currentYear,
    }

    const coreProfileData = {
      ...requiredProfileData,
      interest_area: cleanOptionalText(body.interest_area),
    }

    const profileData = {
      ...coreProfileData,
      browser: cleanOptionalText(body.browser, 80),
      os: cleanOptionalText(body.os, 80),
      device_type: cleanOptionalText(body.device_type, 40),
      screen_resolution: cleanOptionalText(body.screen_resolution, 40),
      referral_source: cleanOptionalText(body.referral_source, 500),
    }

    let { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (isMissingColumnError(error)) {
      const retry = await supabase
        .from('user_profiles')
        .upsert(coreProfileData, { onConflict: 'user_id' })
      error = retry.error
    }

    if (isMissingColumnError(error)) {
      const retry = await supabase
        .from('user_profiles')
        .upsert(requiredProfileData, { onConflict: 'user_id' })
      error = retry.error
    }

    if (error) {
      console.error('Profile upsert error:', error)
      return NextResponse.json({ error: 'Could not save profile.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: coreProfileData })
  } catch (err) {
    console.error('Profile route error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

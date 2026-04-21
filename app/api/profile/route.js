import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/server/env'

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

    const body = await request.json()

    const profileData = {
      user_id: user.id,
      full_name: body.name || user.user_metadata?.full_name || '',
      email: body.email || user.email || '',
      degree: body.degree || '',
      current_year: body.year || body.current_year || '',
      interest_area: body.interest_area || null,
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (error) {
      console.error('Profile upsert error:', error)
      return NextResponse.json({ error: 'Could not save profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

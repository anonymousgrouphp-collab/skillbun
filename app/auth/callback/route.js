import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/server/env'
import { normalizeInternalPath } from '@/utils/shared/routes'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = normalizeInternalPath(searchParams.get('next'), '/quiz')

  if (code) {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()

    let redirectTo = `${origin}${next}`
    let pendingCookies = []

    const buildRedirectResponse = () => {
      const response = NextResponse.redirect(redirectTo)
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(newCookies) {
            newCookies.forEach(({ name, value }) => request.cookies.set(name, value))
            pendingCookies = newCookies
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('degree, current_year')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!profile || !profile.degree || !profile.current_year) {
          redirectTo = `${origin}/onboarding?next=${encodeURIComponent(next)}`
        }
      }

      return buildRedirectResponse()
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=true`)
}

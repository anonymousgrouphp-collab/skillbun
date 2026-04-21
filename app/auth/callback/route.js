import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/server/env'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Where the user originally wanted to go (default: quiz)
  const next = searchParams.get('next') ?? '/quiz'

  if (code) {
    const supabaseUrl = getSupabaseUrl()
    const supabaseKey = getSupabaseAnonKey()
    
    // Default redirect (will be overridden below)
    let redirectTo = `${origin}${next}`
    let supabaseResponse = NextResponse.redirect(redirectTo)
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.redirect(redirectTo)
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has a complete profile in user_profiles table
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('degree, current_year')
          .eq('user_id', user.id)
          .single()
        
        if (!profile || !profile.degree || !profile.current_year) {
          // First-time user → send to onboarding with original destination preserved
          redirectTo = `${origin}/onboarding?next=${encodeURIComponent(next)}`
        }
        // else: returning user → redirectTo stays as the original `next` destination
      }

      // Rebuild the response with the final redirectTo
      supabaseResponse = NextResponse.redirect(redirectTo)
      // Re-apply cookies from the session exchange
      request.cookies.getAll().forEach(({ name, value }) => {
        supabaseResponse.cookies.set(name, value)
      })
      
      return supabaseResponse
    }
  }

  // Auth failed → return to homepage with error
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from '@/utils/server/env'
import { normalizeInternalPath } from '@/utils/shared/routes'

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!isSupabaseConfigured()) {
    return supabaseResponse
  }

  const protectedRoutes = ['/quiz', '/counsellor', '/roadmap', '/onboarding']
  const isProtected = protectedRoutes.some((path) => request.nextUrl.pathname.startsWith(path))

  if (!isProtected) {
    return supabaseResponse
  }

  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabaseAnonKey()

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    const destination = normalizeInternalPath(`${url.pathname}${url.search}`, '/quiz')
    url.pathname = '/'
    url.search = ''
    url.searchParams.set('authRequired', 'true')
    url.searchParams.set('dest', destination)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // To secure against failing when env vars are missing during local build/test
  const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder'

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

  // Skip auth check if environment variables aren't strictly connected yet
  if (process.env.SUPABASE_URL) {
      const { data: { user } } = await supabase.auth.getUser();

      const protectedRoutes = ['/quiz', '/counsellor', '/roadmap', '/onboarding']
      const isProtected = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path))

      if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('authRequired', 'true')
        return NextResponse.redirect(url)
      }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

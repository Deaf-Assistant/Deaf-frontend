// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname

  // ONLY check auth for /admin routes - everything else passes through
  if (!pathname.startsWith('/admin')) {
    return response // Guest can access everything else
  }

  // From here, only /admin routes are checked
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login (only for /admin)
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const adminRoles = ['ADMIN', 'INTERPRETER', 'LECTURER']

  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  // IMPORTANT: Only match /admin routes
  matcher: ['/admin/:path*'],
}
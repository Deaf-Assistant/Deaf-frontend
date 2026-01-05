import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

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

  // ถ้าจะเข้าหน้า Admin แล้วยังไม่ได้ Login
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // เพิ่มเติม: ตรงนี้ควรเช็ค Role ด้วย (ต้อง query database เพิ่ม)
  // แต่ใน middleware ทำ query DB หนักๆ อาจจะช้า แนะนำให้เช็คเบื้องต้นแค่ user มีไหม
  // แล้วไปเช็ค Role อีกทีใน Layout ของ Admin หรือ Page

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/vocabulary/:path*'], // ระบุ path ที่จะให้ middleware ทำงาน
}
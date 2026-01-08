// src/middleware.ts
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

  
  // 1. ตรวจสอบว่ามี User ที่ Login อยู่จริงไหม (จาก Auth)
  const { data: { user } } = await supabase.auth.getUser()

  // 2. ถ้าพยายามเข้าหน้า Admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ถ้าไม่ Login ให้ส่งไปหน้า Login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. ดึงข้อมูล Role จากตาราง users ใน Database โดยตรง
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const adminRoles = ['ADMIN', 'INTERPRETER', 'LECTURER']

    // 4. เช็คสิทธิ์: ถ้าไม่มีโปรไฟล์ หรือ Role ไม่ได้อยู่ในกลุ่มที่อนุญาต
    if (!profile || !adminRoles.includes(profile.role)) {
      // ส่งกลับหน้าแรก (Unauthorized)
      return NextResponse.redirect(new URL('/', request.url))
    }
 
  }

  return response
}

export const config = {
  // ระบุ Path ที่ต้องการให้ Middleware ตรวจสอบ
  matcher: ['/admin/:path*', '/vocabulary/:path*'], 
}
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

  // 1. ตรวจสอบ User จาก Auth
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname;

  // 2. ดึง Role ของผู้ใช้ (ดึงครั้งเดียวใช้ได้ทั้งหน้า Admin, Courses, Vocab)
  let userRole = 'GUEST';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role?.toUpperCase() || 'MEMBER';
  }

  const adminRoles = ['ADMIN', 'INTERPRETER', 'LECTURER'];

  // ==========================================
  // 🛡️ ด่านที่ 1: ดักหน้า Admin
  // ==========================================
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (!adminRoles.includes(userRole)) return NextResponse.redirect(new URL('/', request.url))
  }

  // ==========================================
  // 🛡️ ด่านที่ 2: ดักหน้า "รายละเอียดคำศัพท์" (/vocabulary/[id])
  // ==========================================
  const vocabMatch = path.match(/^\/vocabulary\/([^/]+)$/);
  if (vocabMatch) {
    const vocabId = vocabMatch[1];
    
    // ยิงไปดึงสิทธิ์ของคำศัพท์นี้ พร้อมกับ "สิทธิ์ของวิชาที่มันสังกัดอยู่"
    const { data: vocab } = await supabase
      .from('vocabularies')
      .select('visibility, courses(visibility)')
      .eq('id', vocabId)
      .single();

    if (vocab) {
      // อ่านค่าสิทธิ์ของวิชา (Course)
      const courseData = Array.isArray(vocab.courses) ? vocab.courses[0] : vocab.courses;
      const courseVis = (courseData?.visibility || 'everyone').toLowerCase();
      // อ่านค่าสิทธิ์ของคำศัพท์เอง (เผื่อตั้งล็อกไว้ที่ตัวคำศัพท์)
      const vocabVis = (vocab.visibility || 'everyone').toLowerCase();

      // ถ้าวิชาถูกล็อก หรือ คำศัพท์ถูกล็อกไว้ (ไม่ได้เป็น everyone)
      if (courseVis !== 'everyone' || vocabVis !== 'everyone') {
        
        // 1. ถ้าไม่ได้ล็อกอิน -> เตะไปหน้าล็อกอิน
        if (!user) {
          return NextResponse.redirect(new URL('/login', request.url));
        }

        // 2. ถ้าไม่ใช่ทีมงาน ให้เริ่มเช็ค Role อย่างละเอียด
        if (!adminRoles.includes(userRole)) {
          
          // - ถ้านักศึกษา (STUDENT) พยายามเข้า -> อนุญาตแค่ everyone และ login
          if (userRole === 'STUDENT') {
            const canSeeCourse = courseVis === 'everyone' || courseVis === 'login';
            const canSeeVocab = vocabVis === 'everyone' || vocabVis === 'login';
            
            if (!canSeeCourse || !canSeeVocab) {
               return NextResponse.redirect(new URL('/vocabulary', request.url));
            }
          } 
          // - ถ้าคนนอก (MEMBER) พยายามแอบเข้าด้วยลิงก์ตรง -> เตะกลับหน้าคำศัพท์
          else {
            return NextResponse.redirect(new URL('/vocabulary', request.url));
          }
        }
      }
    }
  }

  // ==========================================
  // 🛡️ ด่านที่ 3: ดักหน้า "รายละเอียดวิชา" (/courses/[id])
  // ==========================================
  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    const courseId = courseMatch[1];
    const { data: course } = await supabase.from('courses').select('visibility').eq('id', courseId).single();
    
    if (course) {
      const courseVis = (course.visibility || 'everyone').toLowerCase();
      
      if (courseVis !== 'everyone') {
        if (!user) return NextResponse.redirect(new URL('/login', request.url));
        
        if (!adminRoles.includes(userRole)) {
          if (userRole === 'STUDENT' && courseVis === 'login') {
            // ให้ผ่าน
          } else {
            // MEMBER โดนเตะ
            return NextResponse.redirect(new URL('/courses', request.url));
          }
        }
      }
    }
  }

  return response
}

export const config = {
 
  matcher: ['/admin/:path*', '/vocabulary/:path*', '/courses/:path*'], 
}
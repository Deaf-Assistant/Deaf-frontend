import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'

/**
 * Next.js Edge Middleware for route-level access control.
 *
 * Runs before every request matching the configured `matcher` paths and enforces
 * three layers of authorization:
 *
 * 1. **Admin Guard** (`/admin/*`): Requires the user to be logged in AND have an
 *    admin-level role (ADMIN, INTERPRETER, or LECTURER).
 *
 * 2. **Vocabulary Detail Guard** (`/vocabulary/[id]`): Checks the visibility of
 *    both the vocabulary entry and its parent course. Unauthenticated users are
 *    redirected to login; MEMBER users are blocked entirely; STUDENT users can
 *    only access entries visible to 'everyone' or 'login'.
 *
 * 3. **Course Detail Guard** (`/courses/[id]`): Checks the course visibility.
 *    Unauthenticated users are redirected to login; MEMBER users are blocked;
 *    STUDENT users may access courses with 'login' visibility.
 *
 * @param {NextRequest} request - The incoming Next.js edge request object.
 * @returns {Promise<NextResponse>} Either a redirect response or the original
 *   response (with refreshed session cookies) if access is granted.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Initialize a server-side Supabase client that reads/writes cookies from the request
const supabase = createServerClient(
    process.env.SUPABASE_URL_INTERNAL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'deaf-auth', 
      },
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

  // 1. Resolve the currently authenticated user from the session
 const { data: { user }, error: authError } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname;

  // 2. Fetch the user's role from the `users` table (single query reused for all guards)
  let userRole = 'GUEST';
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('--- Middleware Debug ---');
    console.log('Profile Data:', profile);
    userRole = profile?.role?.toUpperCase() || 'MEMBER';
  }

    
  const adminRoles = ['ADMIN', 'INTERPRETER', 'LECTURER'];

  // ==========================================
  // Guard 1: Admin pages (/admin/*)
  // Only users with an admin-level role may access admin routes.
  // ==========================================
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (!adminRoles.includes(userRole)) return NextResponse.redirect(new URL('/', request.url))
  }

  // ==========================================
  // Guard 2: Vocabulary detail page (/vocabulary/[id])
  // Access depends on the combined visibility of the vocabulary and its parent course.
  // ==========================================
  const vocabMatch = path.match(/^\/vocabulary\/([^/]+)$/);
  if (vocabMatch) {
    const vocabId = vocabMatch[1];

    // Fetch both the vocabulary's visibility and its parent course's visibility
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

      // If either the course or the vocabulary is not publicly visible, enforce auth
      if (courseVis !== 'everyone' || vocabVis !== 'everyone') {

        // Unauthenticated users must log in first
        if (!user) {
          return NextResponse.redirect(new URL('/login', request.url));
        }

        // Non-admin users are subject to further role-based checks
        if (!adminRoles.includes(userRole)) {

          // - ถ้านักศึกษา (STUDENT) พยายามเข้า -> อนุญาตแค่ everyone และ login
          if (userRole === 'STUDENT') {
            // STUDENTs can only see content visible to 'everyone' or 'login'
            const canSeeCourse = courseVis === 'everyone' || courseVis === 'login';
            const canSeeVocab = vocabVis === 'everyone' || vocabVis === 'login';

            if (!canSeeCourse || !canSeeVocab) {
              return NextResponse.redirect(new URL('/vocabulary', request.url));
            }
          } else {
            // MEMBERs are blocked from restricted content entirely
            return NextResponse.redirect(new URL('/vocabulary', request.url));
          }
        }
      }
    }
  }

  // ==========================================
  // Guard 3: Course detail page (/courses/[id])
  // Access depends on the course's visibility setting.
  // ==========================================
  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    const courseId = courseMatch[1];
    const { data: course } = await supabase.from('courses').select('visibility').eq('id', courseId).single();

    if (course) {
      const courseVis = (course.visibility || 'everyone').toLowerCase();

      if (courseVis !== 'everyone') {
        // Unauthenticated users must log in first
        if (!user) return NextResponse.redirect(new URL('/login', request.url));

        if (!adminRoles.includes(userRole)) {
          if (userRole === 'STUDENT' && courseVis === 'login') {
            // Allow STUDENT to pass through if visibility is 'login'
          } else {
            // Block MEMBER users from restricted courses
            return NextResponse.redirect(new URL('/courses', request.url));
          }
        }
      }
    }
  }

  return response
}

/**
 * Middleware route matcher configuration.
 * Restricts middleware execution to admin, vocabulary detail, and course detail paths.
 */
export const config = {
  matcher: ['/admin/:path*', '/vocabulary/:path*', '/courses/:path*'],
}
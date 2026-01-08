'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // สร้างฟังก์ชันกลางสำหรับโหลดข้อมูล
  const loadUser = () => {
    setUser(auth.getUser());
  };

  useEffect(() => {
    loadUser(); // โหลดตอนเปลี่ยนหน้า

    // เพิ่มการดักฟัง Event 'auth-change' ที่เราเขียนไว้ใน lib/auth.ts
    window.addEventListener('auth-change', loadUser);
    window.addEventListener('storage', loadUser); // กรณีเปิดหลาย Tab

    return () => {
      window.removeEventListener('auth-change', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, [pathname]);

  const handleLogout = () => {
    auth.logout();
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Deaf Assistant</h1>
              <p className="text-sm text-gray-600">ผู้ช่วยการเรียนรู้</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href={ROUTES.HOME}
              className={`px-4 py-2 rounded-lg text-base font-medium transition ${
                isActive(ROUTES.HOME)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              หน้าแรก
            </Link>

            <Link
              href={ROUTES.COURSES}
              className={`px-4 py-2 rounded-lg text-base font-medium transition ${
                isActive(ROUTES.COURSES) || pathname.startsWith('/courses')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              รายวิชา
            </Link>

            <Link
              href={ROUTES.VOCABULARY}
              className={`px-4 py-2 rounded-lg text-base font-medium transition ${
                isActive(ROUTES.VOCABULARY) || pathname.startsWith('/vocabulary')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              คำศัพท์
            </Link>

            {user && (
              <Link
                href={ROUTES.REPORT}
                className={`px-4 py-2 rounded-lg text-base font-medium transition ${
                  isActive(ROUTES.REPORT)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                รายงานปัญหา
              </Link>
            )}

            {user && auth.isAdmin() && (
              <Link
                href={ROUTES.ADMIN_DASHBOARD}
                className={`px-4 py-2 rounded-lg text-base font-medium transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                จัดการระบบ
              </Link>
            )}
          </nav>

{/* Desktop User section */}
<div className="hidden md:flex items-center space-x-3">
  {user ? (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        {/* ใช้ ? หลัง user และ user_metadata เสมอ */}
        <p className="text-base font-medium text-gray-900 leading-none">
          {user?.user_metadata?.name || user?.name || 'User'}
        </p>
        <p className="text-xs text-gray-500 font-semibold uppercase mt-1">
          {user?.user_metadata?.role || user?.role || 'authenticated'}
        </p>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        ออกจากระบบ
      </Button>
    </div>
  ) : (
    <>
      <Link href={ROUTES.LOGIN}>
        <Button variant="secondary">เข้าสู่ระบบ</Button>
      </Link>
      <Link href={ROUTES.REGISTER}>
        <Button>ลงทะเบียน</Button>
      </Link>
    </>
  )}
</div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                href={ROUTES.HOME}
                className={`px-4 py-3 rounded-lg text-base font-medium ${
                  isActive(ROUTES.HOME) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                หน้าแรก
              </Link>

              <Link
                href={ROUTES.COURSES}
                className={`px-4 py-3 rounded-lg text-base font-medium ${
                  pathname.startsWith('/courses') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                รายวิชา
              </Link>

              <Link
                href={ROUTES.VOCABULARY}
                className={`px-4 py-3 rounded-lg text-base font-medium ${
                  pathname.startsWith('/vocabulary') ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                คำศัพท์
              </Link>

              {user && (
                <Link
                  href={ROUTES.REPORT}
                  className={`px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(ROUTES.REPORT) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  รายงานปัญหา
                </Link>
              )}

              {user && auth.isAdmin() && (
                <Link
                  href={ROUTES.ADMIN_DASHBOARD}
                  className={`px-4 py-3 rounded-lg text-base font-medium ${
                    pathname.startsWith('/admin') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  จัดการระบบ
                </Link>
              )}

              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="px-4 py-2 mb-3">
                      <p className="text-base font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg text-base font-medium"
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href={ROUTES.LOGIN}
                      className="block px-4 py-3 bg-gray-200 text-gray-800 rounded-lg text-base font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      className="block px-4 py-3 bg-blue-600 text-white rounded-lg text-base font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ลงทะเบียน
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
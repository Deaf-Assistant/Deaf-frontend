'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BookOpen, AlertCircle, Settings, LogOut, LogIn, UserPlus, Menu, X, Heart } from 'lucide-react';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loadUser = () => {
    setUser(auth.getUser());
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('auth-change', loadUser);
    window.addEventListener('storage', loadUser);

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
    <header className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-3 group shrink-0 whitespace-nowrap">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🦆</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-700 drop-shadow-sm">DDCMU</h1>
              <p className="text-sm text-purple-600 font-medium">ผู้ช่วยการเรียนรู้ 📚</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-2 mx-12">
            <Link
              href={ROUTES.HOME}
              className={`flex items-center whitespace-nowrap space-x-2 px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-200 ${
                isActive(ROUTES.HOME)
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-purple-700 hover:bg-white/50 hover:scale-105'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>หน้าแรก</span>
            </Link>

            <Link
              href={ROUTES.COURSES}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                isActive(ROUTES.COURSES) || pathname.startsWith('/courses')
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-purple-700 hover:bg-white/50 hover:scale-105'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>รายวิชา</span>
            </Link>

            <Link
              href={ROUTES.VOCABULARY}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold whitespace-nowrap transition-all duration-200 ${
                isActive(ROUTES.VOCABULARY) || pathname.startsWith('/vocabulary')
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-purple-700 hover:bg-white/50 hover:scale-105'
              }`}
            >
              <span className="font-black text-sm shrink-0">ABC</span>
              <span className="whitespace-nowrap">คำศัพท์</span>
            </Link>

            {user && (
              <Link
                href={ROUTES.FAVORITES}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive(ROUTES.FAVORITES)
                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                    : 'text-purple-700 hover:bg-white/50 hover:scale-105'
                }`}
              >
                <Heart className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">รายการโปรด</span>
              </Link>
            )}

            {user && (
              <Link
                href={ROUTES.REPORT}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                  isActive(ROUTES.REPORT)
                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                    : 'text-purple-700 hover:bg-white/50 hover:scale-105'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">รายงานปัญหา</span>
              </Link>
            )}

            {user && auth.isAdmin() && (
              <Link
                href={ROUTES.ADMIN_DASHBOARD}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                  pathname.startsWith('/admin')
                    ? 'bg-amber-200 text-amber-800 shadow-lg scale-105'
                    : 'text-purple-700 hover:bg-white/50 hover:scale-105'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">จัดการระบบ</span>
              </Link>
            )}
          </nav>

          {/* Desktop User section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-base font-bold text-purple-700 leading-none drop-shadow-sm">
                    {user?.user_metadata?.name || user?.name || 'User'}
                  </p>
                  <p className="text-xs text-purple-600 font-semibold uppercase mt-1">
                    {user?.user_metadata?.role || user?.role || 'authenticated'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="
                    flex items-center gap-2
                    px-6 py-3
                    bg-rose-300 hover:bg-rose-400
                    text-rose-800 rounded-xl font-bold
                    whitespace-nowrap
                    shadow-lg
                    transition-all duration-200 hover:scale-105
                  "
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={ROUTES.LOGIN}>
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <LogIn className="w-5 h-5" />
                    <span>เข้าสู่ระบบ</span>
                  </button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-amber-200 text-amber-800 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <UserPlus className="w-5 h-5" />
                    <span>ลงทะเบียน</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-purple-700 hover:bg-white/30 transition-all"
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-300">
            <nav className="flex flex-col space-y-2">
              <Link
                href={ROUTES.HOME}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
                  isActive(ROUTES.HOME) 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-purple-700 hover:bg-white/30'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>หน้าแรก</span>
              </Link>

              <Link
                href={ROUTES.COURSES}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
                  pathname.startsWith('/courses') 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-purple-700 hover:bg-white/30'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                <span>รายวิชา</span>
              </Link>

              <Link
                href={ROUTES.VOCABULARY}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
                  pathname.startsWith('/vocabulary') 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-purple-700 hover:bg-white/30'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-black text-sm">ABC</span>
                <span>คำศัพท์</span>
              </Link>

              {user && (
                <Link
                  href={ROUTES.FAVORITES}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
                    isActive(ROUTES.FAVORITES)
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-purple-700 hover:bg-white/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>รายการโปรด</span>
                </Link>
              )}

              {user && (
                <Link
                  href={ROUTES.REPORT}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
                    isActive(ROUTES.REPORT) 
                      ? 'bg-white text-purple-600 shadow-md' 
                      : 'text-purple-700 hover:bg-white/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>รายงานปัญหา</span>
                </Link>
              )}

              {user && auth.isAdmin() && (
                <Link
                  href={ROUTES.ADMIN_DASHBOARD}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
                    pathname.startsWith('/admin') 
                      ? 'bg-amber-200 text-amber-800 shadow-md' 
                      : 'text-purple-700 hover:bg-white/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>จัดการระบบ</span>
                </Link>
              )}

              <div className="pt-4 border-t border-purple-300">
                {user ? (
                  <>
                    <div className="px-4 py-2 mb-3">
                      <p className="text-base font-bold text-purple-700">{user.name}</p>
                      <p className="text-sm text-purple-600">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-rose-300 text-rose-800 rounded-xl text-base font-bold shadow-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href={ROUTES.LOGIN}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-white text-purple-600 rounded-xl text-base font-bold shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>เข้าสู่ระบบ</span>
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-amber-200 text-amber-800 rounded-xl text-base font-bold shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>ลงทะเบียน</span>
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
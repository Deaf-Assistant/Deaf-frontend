"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BookOpen, AlertCircle, Settings, LogOut, LogIn, UserPlus, Menu, X, Heart } from 'lucide-react';
import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import { ROUTES } from '@/lib/constants';

const supabase = createClient();

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ เพิ่ม Loading State ป้องกันหน้ากระตุก
  const [isLoading, setIsLoading] = useState(true);

  // Helper เช็ค path อย่างเดียว (ไม่เกี่ยวกับ Style)
  const isActive = (path: string) => {
    if (path === ROUTES.HOME) return pathname === ROUTES.HOME;
    return pathname === path || pathname.startsWith(path + '/');
  };

const loadUser = async () => {
    try {
      // 1. โหลดข้อมูลจาก Local Storage มาแสดงก่อน เพื่อไม่ให้หน้าจอกระตุก
      const localUser = auth.getUser();
      if (localUser) {
        setUser(localUser);
      }

      // 2. แอบไปดึงข้อมูลใหม่ล่าสุดจาก Database (Supabase) มาเช็คสิทธิ์ซ้ำ
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        const fullUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.user_metadata?.name || 'User',
            role: profile?.role || session.user.user_metadata?.role || 'STUDENT',
            ...profile
        };

        // 3. ถ้าข้อมูลใหม่ไม่ตรงกับของเดิม ให้อัปเดต Local Storage และหน้าจอทันที
        auth.setToken(session.access_token);
        // @ts-ignore
        auth.setUser(fullUser);
        setUser(fullUser);
      } else if (!localUser) {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    
    const handleAuthChange = () => loadUser();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
       if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
         loadUser();
       } else if (event === 'SIGNED_OUT') {
         setUser(null);
         setIsLoading(false);
       }
    });

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    auth.logout();
    setUser(null);
    window.location.href = ROUTES.LOGIN; 
  };

  // Skeleton Loader (แสดงตอนกำลังโหลด)
  const AuthLoadingSkeleton = () => (
    <div className="flex items-center space-x-3 animate-pulse">
      <div className="h-10 w-24 bg-white/30 rounded-xl"></div>
      <div className="h-10 w-24 bg-white/30 rounded-xl"></div>
    </div>
  );

  return (
    <header className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center space-x-3 group shrink-0 whitespace-nowrap"
            onClick={() => setIsMenuOpen(false)}
          >
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
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
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
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
                isActive(ROUTES.COURSES)
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-purple-700 hover:bg-white/50 hover:scale-105'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>รายวิชา</span>
            </Link>

            <Link
              href={ROUTES.VOCABULARY}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
                isActive(ROUTES.VOCABULARY)
                  ? 'bg-white text-purple-600 shadow-lg scale-105'
                  : 'text-purple-700 hover:bg-white/50 hover:scale-105'
              }`}
            >
              <span className="font-black text-sm shrink-0">ABC</span>
              <span>คำศัพท์</span>
            </Link>

            {!isLoading && user && (
              <Link
                href={ROUTES.FAVORITES}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive(ROUTES.FAVORITES)
                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                    : 'text-purple-700 hover:bg-white/50 hover:scale-105'
                }`}
              >
                <Heart className="w-5 h-5 shrink-0" />
                <span>รายการโปรด</span>
              </Link>
            )}

            {!isLoading && user && (
              <Link
                href={ROUTES.REPORT}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
                  isActive(ROUTES.REPORT)
                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                    : 'text-purple-700 hover:bg-white/50 hover:scale-105'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>รายงานปัญหา</span>
              </Link>
            )}

            {!isLoading && user && auth.isAdmin() && (
              <Link
                href={ROUTES.ADMIN_DASHBOARD}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
                  pathname.startsWith('/admin')
                    ? 'bg-amber-200 text-amber-800 shadow-lg scale-105'
                    : 'text-purple-700 hover:bg-white/50 hover:scale-105'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span>จัดการระบบ</span>
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoading ? (
               <AuthLoadingSkeleton />
            ) : user ? (
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
                  className="flex items-center gap-2 px-6 py-3 bg-rose-300 hover:bg-rose-400 text-rose-800 rounded-xl font-bold whitespace-nowrap shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href={ROUTES.LOGIN}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white text-purple-600 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                    <LogIn className="w-5 h-5" />
                    <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-400 text-purple-700 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>ลงทะเบียน</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-purple-700 hover:bg-white/30 transition-all"
          >
            {isMenuOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-300">
            <nav className="flex flex-col space-y-2">
              <Link
                href={ROUTES.HOME}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive(ROUTES.COURSES)
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive(ROUTES.VOCABULARY)
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-purple-700 hover:bg-white/30'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-black text-sm">ABC</span>
                <span>คำศัพท์</span>
              </Link>

              {!isLoading && user && (
                <Link
                  href={ROUTES.FAVORITES}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
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

              {!isLoading && user && (
                <Link
                  href={ROUTES.REPORT}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
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

              {!isLoading && user && auth.isAdmin() && (
                <Link
                  href={ROUTES.ADMIN_DASHBOARD}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
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
                {isLoading ? (
                   <div className="flex justify-center py-2">
                      <div className="h-10 w-full bg-white/30 rounded-xl animate-pulse"></div>
                   </div>
                ) : user ? (
                  <>
                    <div className="px-4 py-2 mb-3">
                      <p className="text-base font-bold text-purple-700">{user.name}</p>
                      <p className="text-sm text-purple-600">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
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
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-white text-purple-600 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>เข้าสู่ระบบ</span>
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-400 text-purple-700 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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

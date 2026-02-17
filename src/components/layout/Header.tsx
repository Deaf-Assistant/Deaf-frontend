'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BookOpen, Book, AlertCircle, Settings, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import { ROUTES } from '@/lib/constants';

const supabase = createClient();

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✅ ฟังก์ชันเช็คสถานะเมนู (Active Link) - แก้ไขให้หน้า Home ไม่ค้าง
  const getActiveStatus = (path: string) => {
    if (path === ROUTES.HOME) {
      return pathname === ROUTES.HOME;
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navLinkStyle = (path: string) => {
    const isActive = getActiveStatus(path);
    return `flex items-center space-x-2 px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-white text-purple-600 shadow-lg scale-105'
        : 'text-white hover:bg-white/20 hover:scale-105'
    }`;
  };

  const mobileLinkStyle = (path: string) => {
    const isActive = getActiveStatus(path);
    return `flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold ${
      isActive
        ? 'bg-white text-purple-600 shadow-md' 
        : 'text-white hover:bg-white/20'
    }`;
  };

  const btnLoginStyle = "flex items-center justify-center space-x-2 px-4 py-3 bg-white text-purple-600 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105";
  const btnRegisterStyle = "flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-400 text-purple-700 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105";

  const loadUser = async () => {
    const localUser = auth.getUser();
    if (localUser) {
      setUser(localUser);
    } else {
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
            name: profile?.name || session.user.user_metadata.name || 'User',
            role: profile?.role || session.user.user_metadata.role || 'STUDENT',
            ...profile
        };

        auth.setToken(session.access_token);
        // @ts-ignore
        auth.setUser(fullUser);
        setUser(fullUser);
      }
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('auth-change', loadUser);
    window.addEventListener('storage', loadUser);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
       if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') loadUser();
       else if (event === 'SIGNED_OUT') setUser(null);
    });

    return () => {
      window.removeEventListener('auth-change', loadUser);
      window.removeEventListener('storage', loadUser);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    auth.logout();
    setUser(null);
    window.location.href = ROUTES.LOGIN; 
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          <Link href={ROUTES.HOME} className="flex items-center space-x-3 group shrink-0 whitespace-nowrap">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🦆</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">DDCMU</h1>
              <p className="text-sm text-white/90 font-medium">ผู้ช่วยการเรียนรู้ 📚</p>
            </div>
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center space-x-2">
            <Link href={ROUTES.HOME} className={navLinkStyle(ROUTES.HOME)}>
              <Home className="w-5 h-5" />
              <span>หน้าแรก</span>
            </Link>

            <Link href={ROUTES.COURSES} className={navLinkStyle(ROUTES.COURSES)}>
              <BookOpen className="w-5 h-5" />
              <span>รายวิชา</span>
            </Link>

            <Link href={ROUTES.VOCABULARY} className={navLinkStyle(ROUTES.VOCABULARY)}>
              <Book className="w-5 h-5 shrink-0" />
              <span>คำศัพท์</span>
            </Link>

            {user && (
              <Link href={ROUTES.FAVORITES} className={navLinkStyle(ROUTES.FAVORITES)}>
                <span>รายการโปรด</span>
              </Link>
            )}

            {user && (
              <Link href={ROUTES.REPORT} className={navLinkStyle(ROUTES.REPORT)}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>รายงานปัญหา</span>
              </Link>
            )}

            {user && user.role === 'ADMIN' && (
              <Link href={ROUTES.ADMIN_DASHBOARD} className={navLinkStyle(ROUTES.ADMIN_DASHBOARD)}>
                <Settings className="w-5 h-5 shrink-0" />
                <span>จัดการระบบ</span>
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-base font-bold text-white leading-none drop-shadow">
                    {user.name || user.email || 'User'}
                  </p>
                  <p className="text-xs text-white/90 font-semibold uppercase mt-1">
                    {user.role || 'MEMBER'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold whitespace-nowrap shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={ROUTES.LOGIN} className={btnLoginStyle}>
                    <LogIn className="w-5 h-5" />
                    <span>เข้าสู่ระบบ</span>
                </Link>
                <Link href={ROUTES.REGISTER} className={btnRegisterStyle}>
                    <UserPlus className="w-5 h-5" />
                    <span>ลงทะเบียน</span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white hover:bg-white/20 transition-all"
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/30">
            <nav className="flex flex-col space-y-2">
              <Link href={ROUTES.HOME} className={mobileLinkStyle(ROUTES.HOME)} onClick={() => setIsMenuOpen(false)}>
                <Home className="w-5 h-5" />
                <span>หน้าแรก</span>
              </Link>
              <Link href={ROUTES.COURSES} className={mobileLinkStyle(ROUTES.COURSES)} onClick={() => setIsMenuOpen(false)}>
                <BookOpen className="w-5 h-5" />
                <span>รายวิชา</span>
              </Link>
              <Link href={ROUTES.VOCABULARY} className={mobileLinkStyle(ROUTES.VOCABULARY)} onClick={() => setIsMenuOpen(false)}>
                <Book className="w-5 h-5" />
                <span>คำศัพท์</span>
              </Link>

              {user && (
                <Link href={ROUTES.FAVORITES} className={mobileLinkStyle(ROUTES.FAVORITES)} onClick={() => setIsMenuOpen(false)}>
                  <span>รายการโปรด</span>
                </Link>
              )}

              {user && (
                <Link href={ROUTES.REPORT} className={mobileLinkStyle(ROUTES.REPORT)} onClick={() => setIsMenuOpen(false)}>
                  <AlertCircle className="w-5 h-5" />
                  <span>รายงานปัญหา</span>
                </Link>
              )}

              {user && user.role === 'ADMIN' && (
                <Link href={ROUTES.ADMIN_DASHBOARD} className={mobileLinkStyle(ROUTES.ADMIN_DASHBOARD)} onClick={() => setIsMenuOpen(false)}>
                  <Settings className="w-5 h-5" />
                  <span>จัดการระบบ</span>
                </Link>
              )}
              
              <div className="pt-4 border-t border-white/30">
                {user ? (
                  <>
                    <div className="px-4 py-2 mb-3">
                      <p className="text-base font-bold text-white">{user.name}</p>
                      <p className="text-sm text-white/80">{user.role}</p>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500 text-white rounded-xl text-base font-bold shadow-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link href={ROUTES.LOGIN} className={btnLoginStyle} onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="w-5 h-5" />
                      <span>เข้าสู่ระบบ</span>
                    </Link>
                    <Link href={ROUTES.REGISTER} className={btnRegisterStyle} onClick={() => setIsMenuOpen(false)}>
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
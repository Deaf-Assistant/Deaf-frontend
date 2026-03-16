"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  AlertCircle,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { ROUTES } from "@/lib/constants";
import path from "path/win32";
import { GraduationCap } from 'lucide-react';

const supabase = createClient();

export default function Header() {
  const pathname = usePathname();
  const [currentUser, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isActive = (path: string) => {
    if (path === ROUTES.HOME) return pathname === ROUTES.HOME;
    return pathname === path || pathname.startsWith(path + '/');
  };

const loadUser = async () => {
    try {
   
      const localUser = auth.getUser();
      if (localUser) {
        setUser(localUser);
      }

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
    const loadUser = async () => {
      try {
        const localUser = auth.getUser();
        if (localUser) {
          setUser(localUser);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const fullUser = {
              id: session.user.id,
              email: session.user.email,
              name: profile?.name || session.user.user_metadata.name || "User",
              role: profile?.role || "STUDENT",
            };

            auth.setUser(fullUser as any);
            setUser(fullUser);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);


  const handleLogout = async () => {
try{
    const currentUser = auth.getUser();
    const cmuLogoutUrl = process.env.NEXT_PUBLIC_CMU_ENTRAID_LOGOUT_URL;
    const isCmuAccount = currentUser?.email?.endsWith('@cmu.ac.th');

    await supabase.auth.signOut();
    auth.logout();
  
    if (cmuLogoutUrl && isCmuAccount) {
        window.location.href = cmuLogoutUrl;
      } else {
        window.location.href = ROUTES.LOGIN;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }

  };


  return (
    <header className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 sticky top-0 z-40 shadow-lg">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center space-x-3 shrink-0"
          >
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
        <img src="/icon.png" className="w-8 h-8" />
      </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-purple-700">DSSSign</h1>
              <p className="text-sm text-purple-600">ผู้ช่วยการเรียนรู้ 📚</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex flex-1 min-w-0 justify-center gap-1">
            <NavItem href={ROUTES.HOME} active={isActive(ROUTES.HOME)}>
              <Home className="w-5 h-5" /> หน้าแรก
            </NavItem>
            <NavItem href={ROUTES.COURSES} active={isActive(ROUTES.COURSES)}>
              <BookOpen className="w-5 h-5" /> รายวิชา
            </NavItem>
            <NavItem
              href={ROUTES.VOCABULARY}
              active={isActive(ROUTES.VOCABULARY)}
            >
              <span className="font-black text-sm">ABC</span> คำศัพท์
            </NavItem>

            {!isLoading && currentUser && (
              <NavItem
                href={ROUTES.FAVORITES}
                active={isActive(ROUTES.FAVORITES)}
              >
                <Heart className="w-5 h-5" /> รายการโปรด
              </NavItem>
            )}

            {!isLoading && currentUser && (
              <NavItem href={ROUTES.REPORT} active={isActive(ROUTES.REPORT)}>
                <AlertCircle className="w-5 h-5" /> รายงานปัญหา
              </NavItem>
            )}

            {!isLoading && currentUser && auth.isAdmin() && (
              <NavItem
                href={ROUTES.ADMIN_DASHBOARD}
                active={pathname.startsWith("/admin")}
                admin
              >
                <Settings className="w-5 h-5" /> จัดการระบบ
              </NavItem>
            )}
          </nav>

          {/* User menu */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">
            {isLoading ? null : currentUser ? (
              <>
                <div className="text-right max-w-[140px]">
                  <p className="font-bold text-purple-700 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-purple-600 uppercase truncate">
                    {currentUser.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-3 bg-rose-300 hover:bg-rose-400 text-rose-800 rounded-xl font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  ออก
                </button>
              </>
            ) : (
              <>
                <Link href={ROUTES.LOGIN} className="btn-white">
                  <LogIn className="w-5 h-5" /> เข้าสู่ระบบ
                </Link>
                <Link href={ROUTES.REGISTER} className="btn-yellow">
                  <UserPlus className="w-5 h-5" /> ลงทะเบียน
                </Link>
              </>
            )}
          </div>

          {/* Mobile button */}
          <button
            className="xl:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur border-t border-purple-200">
          <nav className="flex flex-col px-4 py-4 gap-2">
            <MobileItem href={ROUTES.HOME}>หน้าแรก</MobileItem>
            <MobileItem href={ROUTES.COURSES}>รายวิชา</MobileItem>
            <MobileItem href={ROUTES.VOCABULARY}>คำศัพท์</MobileItem>

            {currentUser && (
              <>
                <MobileItem href={ROUTES.FAVORITES}>รายการโปรด</MobileItem>
                <MobileItem href={ROUTES.REPORT}>รายงานปัญหา</MobileItem>
              </>
            )}

            {currentUser && auth.isAdmin() && (
              <MobileItem href={ROUTES.ADMIN_DASHBOARD}>จัดการระบบ</MobileItem>
            )}

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-rose-300 text-rose-800 rounded-xl font-bold"
              >
                <LogOut className="w-5 h-5" />
                ออก
              </button>
            ) : (
              <>
                <Link href={ROUTES.LOGIN} className="btn-white">
                  เข้าสู่ระบบ
                </Link>
                <Link href={ROUTES.REGISTER} className="btn-yellow">
                  ลงทะเบียน
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/* Helper */
function NavItem({
  href,
  active,
  children,
  admin,
}: {
  href: string;
  active: boolean;
  children: any;
  admin?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition
        ${
          active
            ? admin
              ? "bg-amber-200 text-amber-800"
              : "bg-white text-purple-600"
            : "text-purple-700 hover:bg-white/40"
        }`}
    >
      {children}
    </Link>
  );
}

function MobileItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-3 rounded-xl font-bold text-purple-700 hover:bg-purple-100"
    >
      {children}
    </Link>
  );
}

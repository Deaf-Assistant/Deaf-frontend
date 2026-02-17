'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants'; 

const supabase = createClient();

export default function AuthSync() {
  const router = useRouter();
  const pathname = usePathname();
  // ใช้ Ref ป้องกันการทำงานซ้ำ (แก้ปัญหา AbortError)
  const isSyncing = useRef(false);

  useEffect(() => {
    if (isSyncing.current) return;

    const handleAuthSync = async () => {
      // 1. ตรวจจับ Token ใน URL (Hash) ทันทีที่เข้าเว็บ
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        isSyncing.current = true;
        // console.log("⚡ พบ Token ใน URL! เริ่มบังคับ Login...");

        try {
          // แกะค่าจาก URL เอง (Manual Parsing)
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            // A. บันทึกลง LocalStorage ของเราก่อนเลย (เพื่อให้ Header เปลี่ยนทันที)
            auth.setToken(accessToken);

            // B. บอก Supabase ว่า Login แล้วนะ (Set Session)
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (!error && data.session) {
               // C. ดึงข้อมูล Profile จาก DB มาเติมให้ครบ
               const { data: profile } = await supabase
                 .from('users')
                 .select('*')
                 .eq('id', data.session.user.id)
                 .single();

               const fullUser = {
                 id: data.session.user.id,
                 email: data.session.user.email || '',
                 name: profile?.name || data.session.user.user_metadata.name || 'User',
                 role: profile?.role || data.session.user.user_metadata.role || 'STUDENT',
                 ...profile
               };

               // D. บันทึก User เต็มๆ ลง LocalStorage
               // @ts-ignore
               auth.setUser(fullUser);

               // E. สั่ง Header ให้รีเฟรช
               window.dispatchEvent(new Event('auth-change'));
               window.dispatchEvent(new Event('storage'));

               // F. ล้าง URL ให้สะอาด (ลบ Hash ทิ้ง)
               window.history.replaceState(null, '', window.location.pathname);
               
               // console.log("✅ Login สำเร็จ:", fullUser.name);
            }
          }
        } catch (err) {
          console.error("AuthSync Error:", err);
        } finally {
          isSyncing.current = false;
        }
      } else {
        // 2. ถ้าไม่มี Hash ให้เช็ค Session ปกติ (กรณี Login ค้างไว้)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !auth.isAuthenticated()) {
            // ทำ Logic เดียวกันเพื่อดึงข้อมูลลง LocalStorage...
            auth.setToken(session.access_token);
            // (คุณอาจจะก๊อป Logic ดึง Profile ข้างบนมาใส่ตรงนี้ด้วยก็ได้เพื่อความสมบูรณ์)
            window.dispatchEvent(new Event('auth-change'));
        }
      }
    };

    handleAuthSync();

    // Listener ปกติ
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
         window.dispatchEvent(new Event('auth-change'));
      } else if (event === 'SIGNED_OUT') {
         auth.logout();
         window.dispatchEvent(new Event('auth-change'));
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  return null;
}
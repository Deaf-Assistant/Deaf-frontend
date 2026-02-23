'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { createClient } from '@/lib/supabase'; 
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

const supabase = createClient(); 

export default function CMUCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const [status, setStatus] = useState('กำลังยืนยันตัวตนกับ CMU...');

  // 1. ส่ง Code ไปให้ API
  useEffect(() => {
    if (!code) return;
    if (auth.isAuthenticated()) {
        router.push(ROUTES.COURSES);
        return;
    }

    setStatus('กำลังแลกเปลี่ยนข้อมูลกับ CMU...');

    axios.post('/api/auth/cmu-signin', { authorizationCode: code })
      .then(res => {
        if (res.data.ok && res.data.redirectUrl) {
           setStatus('ยืนยันตัวตนสำเร็จ กำลังเข้าสู่ระบบ...');
           window.location.href = res.data.redirectUrl; // Redirect ไป Magic Link
        } else {
           setStatus('เข้าสู่ระบบไม่สำเร็จ: ' + res.data.message);
           setTimeout(() => router.push(ROUTES.LOGIN), 3000);
        }
      })
      .catch((err) => {
          setStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ');
          setTimeout(() => router.push(ROUTES.LOGIN), 3000);
      });
  }, [code, router]);

  // 2. ฟังผลการ Login จาก Supabase (หลัง Magic Link ทำงาน)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setStatus('เข้าสู่ระบบสำเร็จ! กำลังไปที่หน้าหลัก...');

        auth.setToken(session.access_token);
        
        // ดึง Role ล่าสุดจาก DB
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        const fullUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.user_metadata.name || '',
            role: profile?.role || session.user.user_metadata.role || 'STUDENT',
            created_at: profile?.created_at,
        };

        // @ts-ignore
        auth.setUser(fullUser);

        if (fullUser.role === 'ADMIN') {
            router.push(ROUTES.ADMIN_DASHBOARD);
        } else {
            router.push(ROUTES.COURSES);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold text-blue-600 mb-4">{status}</h2>
        <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
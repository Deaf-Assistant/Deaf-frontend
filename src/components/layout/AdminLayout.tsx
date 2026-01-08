'use client'

import { useEffect, useState } from 'react'; // 1. เพิ่ม useState
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // 2. เพิ่ม state เช็คว่า mount หรือยัง

  useEffect(() => {
    setIsMounted(true); // 3. set state เมื่อ component mount แล้ว

    if (!auth.isAuthenticated()) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (!auth.isAdmin()) {
      router.push(ROUTES.HOME);
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    }
  }, [router]);

  // 4. ถ้ายังไม่ mount (หรือ render บน Server) ให้ return null ไปก่อน
  // เพื่อให้ Server กับ Client (ตอนแรก) ได้ผลลัพธ์เหมือนกันคือ "ไม่แสดงอะไร"
  if (!isMounted) {
    return null; 
  }

  // 5. หลังจาก mount แล้ว ค่อยเช็ค auth เพื่อแสดงผล
  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
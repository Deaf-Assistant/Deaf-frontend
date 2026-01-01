'use client'

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (!auth.isAdmin()) {
      router.push(ROUTES.HOME);
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    }
  }, [router]);

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
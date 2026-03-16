import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthSync from '@/components/AuthSync'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DSSSign - ระบบช่วยสนับสนุนการเรียนรู้',
  description: 'ระบบช่วยสนับสนุนการเรียนการสอนสำหรับนักศึกษาผู้บกพร่องทางการได้ยิน',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AuthSync /> 
        {children}
      </body>
    </html>
  );
}
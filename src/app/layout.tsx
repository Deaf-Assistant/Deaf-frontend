import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deaf Assistant - ระบบช่วยสนับสนุนการเรียนรู้',
  description: 'ระบบช่วยสนับสนุนการเรียนการสอนสำหรับนักศึกษาผู้บกพร่องทางการได้ยิน',
  keywords: 'deaf, sign language, education, CMU, คำศัพท์, ภาษามือ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="mx-auto px-4 py-12 flex flex-col items-center text-center max-w-3xl">

        {/* About */}
        <h3 className="text-2xl font-bold mb-4">DSSSign for Chiang Mai University</h3>
        <p className="text-gray-400 text-base leading-relaxed mb-8">
          ระบบช่วยสนับสนุนการเรียนการสอนสำหรับนักศึกษาผู้บกพร่องทางการได้ยิน
        </p>

        {/* Contact */}
        <div className="space-y-3 text-gray-400 mb-6">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>thanatip.ch@cmu.ac.th</span>
          </div>

          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>มหาวิทยาลัยเชียงใหม่</span>
          </div>
        </div>

        {/* Social */}
        <div className="flex space-x-6 mb-8">
          <a
            href="https://www.facebook.com/DSSCMU/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.505 0-1.797.716-1.797 1.764v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
            </svg>
          </a>

          <a
            href="https://www.tiktok.com/@dsscmu"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512">
              <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
            </svg>
          </a>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 w-full">
          <p className="text-gray-400 text-sm">
            © {currentYear} DSSSIGN. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            พัฒนาโดย T4: Inew - Software Engineering Project
          </p>
        </div>

      </div>
    </footer>
  );
}

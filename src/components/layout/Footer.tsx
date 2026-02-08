import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="mx-auto px-4 py-12 flex flex-col items-center text-center max-w-3xl">

        {/* About */}
        <h3 className="text-2xl font-bold mb-4">Deaf Assistant</h3>
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
            <span>natapon_p@cmu.ac.th</span>
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
            href="https://www.facebook.com/deafassistant"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.505 0-1.797.716-1.797 1.764v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/deafassistant"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5C22 19.55 19.55 22 16.25 22h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5C5.27 3.5 3.5 5.27 3.5 7.75v8.5c0 2.48 1.77 4.25 4.25 4.25h8.5c2.48 0 4.25-1.77 4.25-4.25v-8.5c0-2.48-1.77-4.25-4.25-4.25h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-.75a1 1 0 110 2 1 1 0 010-2z" />
            </svg>
          </a>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 w-full">
          <p className="text-gray-400 text-sm">
            © {currentYear} DDCMU. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            พัฒนาโดย T4: Inew - Software Engineering Project
          </p>
        </div>

      </div>
    </footer>
  );
}

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Deaf Assistant</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              ระบบช่วยสนับสนุนการเรียนการสอนสำหรับนักศึกษาผู้บกพร่องทางการได้ยิน
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">เมนูหลัก</h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.HOME} className="text-gray-400 hover:text-white transition text-base">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href={ROUTES.COURSES} className="text-gray-400 hover:text-white transition text-base">
                  รายวิชา
                </Link>
              </li>
              <li>
                <Link href={ROUTES.VOCABULARY} className="text-gray-400 hover:text-white transition text-base">
                  คำศัพท์
                </Link>
              </li>
              <li>
                <Link href={ROUTES.REPORT} className="text-gray-400 hover:text-white transition text-base">
                  รายงานปัญหา
                </Link>
              </li>
            </ul>
          </div>

          {/* For Admins */}
          <div>
            <h4 className="text-lg font-semibold mb-4">สำหรับผู้ดูแลระบบ</h4>
            <ul className="space-y-2">
              <li>
                <Link href={ROUTES.LOGIN} className="text-gray-400 hover:text-white transition text-base">
                  เข้าสู่ระบบ
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ADMIN_DASHBOARD} className="text-gray-400 hover:text-white transition text-base">
                  แดชบอร์ด
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ADMIN_VOCABULARY} className="text-gray-400 hover:text-white transition text-base">
                  จัดการคำศัพท์
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ADMIN_COURSES} className="text-gray-400 hover:text-white transition text-base">
                  จัดการรายวิชา
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-base">support@deafassistant.cmu.ac.th</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-base">มหาวิทยาลัยเชียงใหม่</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-base">
            © {currentYear} Deaf Assistant - CMU. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            พัฒนาโดย T4: Inew - Software Engineering Project
          </p>
        </div>
      </div>
    </footer>
  );
}
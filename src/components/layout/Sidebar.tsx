"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { auth } from "@/lib/auth";

const menuItems = [
  {
    title: "แดชบอร์ด",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
    href: ROUTES.ADMIN_DASHBOARD,
  },
  {
    title: "จัดการรายวิชา",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
    href: ROUTES.ADMIN_COURSES,
  },
  {
    title: "จัดการคำศัพท์",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
    href: ROUTES.ADMIN_VOCABULARY,
  },
  {
    title: "จัดการหมวดหมู่",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    href: ROUTES.ADMIN_LABEL,
  },
  {
    title: "รายงานทั้งหมด",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    href: ROUTES.ADMIN_REPORTS,
  },
];

import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const user = auth.getUser();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === ROUTES.ADMIN_DASHBOARD) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`bg-white shadow-lg min-h-screen sticky top-20 transition-all duration-300 z-30 ${isOpen ? "w-64" : "w-20"
        }`}
    >
      <div className={`py-6 flex flex-col h-full ${isOpen ? "px-6" : "px-3"}`}>
        <div className={`flex items-center mb-6 ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">เมนูจัดการ</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={!isOpen ? item.title : undefined}
              className={`
                flex items-center py-3 rounded-lg text-base font-medium transition-all
                ${isOpen ? "px-4" : "justify-center"}
                ${isActive(item.href)
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <span className={isOpen ? "mr-3" : ""}>{item.icon}</span>
              {isOpen && <span className="whitespace-nowrap">{item.title}</span>}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/users"
              title={!isOpen ? "จัดการผู้ใช้" : undefined}
              className={`
                  flex items-center py-3 rounded-lg text-base font-medium transition-all
                  ${isOpen ? "px-4" : "justify-center"}
                  ${pathname.startsWith("/admin/users")
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }
                `}
            >
              <span className={isOpen ? "mr-3" : ""}>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 14a4 4 0 018 0v1H4v-1zM14 14a4 4 0 014 0v1h-4v-1z" />
                </svg>
              </span>
              {isOpen && <span className="whitespace-nowrap">จัดการผู้ใช้</span>}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/media"
              title={!isOpen ? "จัดการสื่อ" : undefined}
              className={`
                  flex items-center py-3 rounded-lg text-base font-medium transition-all
                  ${isOpen ? "px-4" : "justify-center"}
                  ${pathname.startsWith("/admin/media")
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }
                `}
            >
              <span className={isOpen ? "mr-3" : ""}>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {isOpen && <span className="whitespace-nowrap">จัดการสื่อ</span>}
            </Link>
          )}
          {["ADMIN", "INTERPRETER", "LECTURER"].includes(user?.role ?? "") && (
            <Link
              href="/admin/stats"
              title={!isOpen ? "สถิติรายวิชา" : undefined}
              className={`
                  flex items-center py-3 rounded-lg text-base font-medium transition-all
                  ${isOpen ? "px-4" : "justify-center"}
                  ${pathname.startsWith("/admin/stats")
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }
                `}
            >
              <span className={isOpen ? "mr-3" : ""}>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </span>
              {isOpen && <span className="whitespace-nowrap">สถิติรายวิชา</span>}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/audit-log"
              title={!isOpen ? "Audit Log" : undefined}
              className={`
                  flex items-center py-3 rounded-lg text-base font-medium transition-all
                  ${isOpen ? "px-4" : "justify-center"}
                  ${pathname.startsWith("/admin/audit-log")
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }
                `}
            >
              <span className={isOpen ? "mr-3" : ""}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </span>
              {isOpen && <span className="whitespace-nowrap">Audit Log</span>}
            </Link>
          )}
        </nav>

        {/* Quick Actions */}
        {isOpen ? (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              การดำเนินการด่วน
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/vocabulary/add"
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                เพิ่มคำศัพท์
              </Link>

              <Link
                href="/admin/courses/add"
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                เพิ่มรายวิชา
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center space-y-4">
            <Link
              href="/admin/vocabulary/add"
              title="เพิ่มคำศัพท์"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex justify-center"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/admin/courses/add"
              title="เพิ่มรายวิชา"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex justify-center"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}

        {/* Back to site */}
        <div className="mt-8 pt-6 pb-6 border-t border-gray-200">
          <Link
            href={ROUTES.HOME}
            title={!isOpen ? "กลับสู่หน้าหลัก" : undefined}
            className={`flex items-center py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg transition ${isOpen ? "px-4" : "justify-center"}`}
          >
            <svg
              className={`w-5 h-5 ${isOpen ? "mr-3" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {isOpen && <span className="whitespace-nowrap">กลับสู่หน้าหลัก</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

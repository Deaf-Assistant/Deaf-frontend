'use client'

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { auth } from '@/lib/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: Course;
  vocabularyCount?: number;
  onToggleVisibility?: (course: Course) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export default function CourseCard({ course, vocabularyCount, onToggleVisibility, isPinned, onTogglePin }: CourseCardProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(auth.getUser());

    // Listen for auth changes
    const handleAuthChange = () => {
      setUser(auth.getUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <div
      onClick={() => router.push(`/courses/${course.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group relative"
    >
      {/* Pin Button - Top Left */}
      {user && onTogglePin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`absolute top-3 left-3 z-20 p-1.5 rounded-full transition-colors duration-200 shadow-sm border ${isPinned
            ? 'bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200'
            : 'bg-white/90 text-gray-400 border-transparent hover:bg-white hover:text-yellow-500'
            }`}
          title={isPinned ? "เลิกปักหมุด" : "ปักหมุดรายวิชา"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
      )}

      {/* Admin Visibility Toggle - Top Right (Below Badge) */}
      {onToggleVisibility && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(course);
          }}
          className={`absolute top-12 right-3 z-20 px-2 py-1 rounded text-xs font-bold shadow-md transition-colors ${(course.visibility || 'everyone') === 'everyone' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              course.visibility === 'login' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
        >
          {(course.visibility || 'everyone') === 'everyone' ? 'สาธารณะ' :
            course.visibility === 'login' ? 'สมาชิก' : 'ผู้ดูแล'}
        </button>
      )}

      {/* Course image */}
      <div className="relative h-40 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 overflow-hidden">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Course code badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-mono z-10">
          {course.code}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.name}
        </h3>

        {course.description && (
          <p className="text-base text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-base">
              {vocabularyCount !== undefined ? `${vocabularyCount} คำศัพท์` : 'กำลังโหลด...'}
            </span>
          </div>

          <div className="text-blue-600 font-medium flex items-center group-hover:gap-2 transition-all">
            <span className="text-base">ดูรายละเอียด</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

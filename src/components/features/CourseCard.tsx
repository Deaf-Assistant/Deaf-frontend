'use client'

import { Course } from '@/types';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: Course;
  vocabularyCount?: number;
}

export default function CourseCard({ course, vocabularyCount }: CourseCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/courses/${course.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group"
    >
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
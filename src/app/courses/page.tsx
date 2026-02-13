"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/features/CourseCard';
import SearchBox from '@/components/features/SearchBox';
import Loading from '@/components/ui/Loading';
import { coursesApi, vocabularyApi, authApi } from '@/lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { pinCoursesApi } from '@/lib/pin_api';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [vocabularyCounts, setVocabularyCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'default' | 'student' | 'guest'>('default');
  const [pinnedCourseIds, setPinnedCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  // Compute filtered courses based on search, viewMode, and currentUser
  useEffect(() => {
    let result = courses;

    // 1. Filter by Visibility & View Mode
    result = result.filter(course => {
      const visibility = course.visibility || 'everyone';

      // Guest View: Only 'everyone'
      if (viewMode === 'guest') {
        return visibility === 'everyone';
      }

      // Student View: 'everyone' + 'login'
      if (viewMode === 'student') {
        return visibility === 'everyone' || visibility === 'login';
      }

      // Default View (Privileged): All for admins/lecturers, otherwise standard logic
      if (currentUser?.role === 'ADMIN' || currentUser?.role === 'LECTURER' || currentUser?.role === 'INTERPRETER') {
        return true;
      }

      // Fallback for normal users (should behave like student mostly)
      if (currentUser) {
        return visibility === 'everyone' || visibility === 'login';
      }

      // Fallback for guests
      return visibility === 'everyone';
    });

    // 2. Filter by Search Keyword
    if (searchKeyword.trim()) {
      result = result.filter(course =>
        course.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        course.code.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    setFilteredCourses(result);
  }, [courses, viewMode, currentUser, searchKeyword]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const [allCourses, user] = await Promise.all([
        coursesApi.getAll(),
        authApi.getCurrentUser()
      ]);

      setCurrentUser(user);
      setCourses(allCourses); // Store ALL courses originally
      const [coursesData, pinnedIds] = await Promise.all([
        coursesApi.getAll(),
        pinCoursesApi.getMyPinnedCourseIds().catch(() => []) // Handle error gracefully (e.g. not logged in)
      ]);

      const pinnedSet = new Set(pinnedIds);
      setPinnedCourseIds(pinnedSet);

      // Sort courses: pinned first, then by name (handled by API or default sort)
      const sortedCourses = sortCourses(coursesData, pinnedSet);

      setCourses(sortedCourses);
      setFilteredCourses(sortedCourses);

      // Load counts
      const counts: Record<string, number> = {};
      // We can load counts for all courses to avoid re-fetching when toggling
      for (const course of allCourses) {
        try {
          const vocabs = await vocabularyApi.getAll(course.id);
          counts[course.id] = vocabs.length;
        } catch (err) {
          counts[course.id] = 0;
        }
      }
      setVocabularyCounts(counts);

    } catch (error) {
      console.error('Failed to load courses:', error);
      // alert('ไม่สามารถโหลดรายวิชาได้'); // Commented out to prevent annoying alerts if just auth error
    } finally {
      setLoading(false);
    }
  };

  const sortCourses = (coursesList: any[], pinnedSet: Set<string>) => {
    return [...coursesList].sort((a, b) => {
      const isAPinned = pinnedSet.has(a.id);
      const isBPinned = pinnedSet.has(b.id);
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;
      return 0; // Keep original order (presumably by name)
    });
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleToggleVisibility = async (course: any) => {
    try {
      const currentVisibility = course.visibility || 'everyone';
      let nextVisibility = 'everyone';
      if (currentVisibility === 'everyone') nextVisibility = 'login';
      else if (currentVisibility === 'login') nextVisibility = 'admin';

      await coursesApi.update(course.id, { visibility: nextVisibility });

      // Update local state
      setCourses(prev => prev.map(c =>
        c.id === course.id ? { ...c, visibility: nextVisibility } : c
      ));

      toast.success(`เปลี่ยนการมองเห็นเป็น: ${nextVisibility === 'everyone' ? 'สาธารณะ' :
          nextVisibility === 'login' ? 'เฉพาะสมาชิก' : 'ผู้ดูแลเท่านั้น'
        }`);
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleTogglePin = async (courseId: string) => {
    try {
      const isPinned = pinnedCourseIds.has(courseId);
      let success = false;

      if (isPinned) {
        success = await pinCoursesApi.unpin(courseId);
        if (success) {
          const newSet = new Set(pinnedCourseIds);
          newSet.delete(courseId);
          setPinnedCourseIds(newSet);
          // Re-sort
          setCourses(prev => sortCourses(prev, newSet));
        }
      } else {
        await pinCoursesApi.pin(courseId); // pin returns data, but we just need success
        const newSet = new Set(pinnedCourseIds);
        newSet.add(courseId);
        setPinnedCourseIds(newSet);
        // Re-sort
        setCourses(prev => sortCourses(prev, newSet));
      }

    } catch (error: any) {
      console.error('Failed to toggle pin:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการปักหมุด');
    }
  };


  if (loading) {
    return <Loading />;
  }

  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'LECTURER' || currentUser?.role === 'INTERPRETER';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer position="top-center" autoClose={2000} style={{ top: '80px' }} />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">รายวิชาทั้งหมด</h1>
              <p className="text-lg text-gray-600">เลือกรายวิชาที่ต้องการเรียนรู้คำศัพท์</p>
            </div>

            {isPrivileged && (
              <div className="flex flex-col gap-2 items-end">
                <div className="flex bg-white rounded-lg shadow-sm border p-1">
                  <button
                    onClick={() => setViewMode('default')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'default' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    มุมมองผู้ดูแล
                  </button>
                  <button
                    onClick={() => setViewMode('student')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'student' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    มุมมองนักเรียน
                  </button>
                  <button
                    onClick={() => setViewMode('guest')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'guest' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    มุมมองบุคคลทั่วไป
                  </button>
                </div>

                <button
                  onClick={() => router.push('/admin/courses/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มรายวิชาใหม่
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="mb-8 max-w-2xl">
            <SearchBox
              onSearch={handleSearch}
              placeholder="ค้นหารายวิชา (ชื่อหรือรหัสวิชา)..."
            />
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-base text-gray-600">
              แสดง {filteredCourses.length} จาก {courses.length} รายวิชา
              {viewMode !== 'default' && <span className="text-orange-600 ml-2">(กำลังแสดงในมุมมอง: {viewMode === 'student' ? 'นักเรียน' : 'บุคคลทั่วไป'})</span>}
            </p>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  vocabularyCount={vocabularyCounts[course.id]}
                  // Allow toggling only in default view and if user is authorized
                  onToggleVisibility={(viewMode === 'default' && isPrivileged) ? handleToggleVisibility : undefined}
                  isPinned={pinnedCourseIds.has(course.id)}
                  onTogglePin={() => handleTogglePin(course.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">ไม่พบรายวิชา</h3>
              <p className="text-lg text-gray-600">
                {viewMode !== 'default' ? 'ไม่พบรายวิชาที่แสดงผลในมุมมองนี้' : 'ลองค้นหาด้วยคำอื่น หรือกลับมาดูใหม่ภายหลัง'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


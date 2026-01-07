'use client'

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/features/CourseCard';
import SearchBox from '@/components/features/SearchBox';
import Loading from '@/components/ui/Loading';
import { coursesApi, vocabularyApi } from '@/lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [vocabularyCounts, setVocabularyCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim()) {
      const filtered = courses.filter(course =>
        course.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        course.code.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchKeyword, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAll();
      setCourses(data);
      setFilteredCourses(data);

      // Load vocabulary counts for each course
      const counts: Record<string, number> = {};
      for (const course of data) {
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
      alert('ไม่สามารถโหลดรายวิชาได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">รายวิชาทั้งหมด</h1>
            <p className="text-lg text-gray-600">เลือกรายวิชาที่ต้องการเรียนรู้คำศัพท์</p>
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">ไม่พบรายวิชา</h3>
              <p className="text-lg text-gray-600">ลองค้นหาด้วยคำอื่น หรือกลับมาดูใหม่ภายหลัง</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
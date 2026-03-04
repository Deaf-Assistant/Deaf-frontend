// src/app/vocabulary/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VocabularyCard from '@/components/features/VocabularyCard';
import SearchBox from '@/components/features/SearchBox';
import Loading from '@/components/ui/Loading';
import { vocabularyApi, coursesApi, authApi } from '@/lib/api';
import { exportToExcel, exportToCSV } from '@/lib/exportUtils';
import { auth } from '@/lib/auth';
import { labelTagsApi } from '@/lib/label_api';
import { LabelTag } from '@/types/label';

function VocabularyContent() {
  const searchParams = useSearchParams();
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<LabelTag[]>([]);
  const [vocabCategories, setVocabCategories] = useState<Record<string, string[]>>({});
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVocabularies();
  }, [searchKeyword, selectedCourse, selectedCategory, vocabularies, vocabCategories, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vocabData, coursesData, categoriesData, allVocabLabels, user] = await Promise.all([
        vocabularyApi.getAll(),
        coursesApi.getAll(),
        labelTagsApi.getAll(),
        labelTagsApi.getAllVocabLabels(),
        authApi.getCurrentUser(), 
      ]);

      setCurrentUser(user);
      const userRole = user?.role?.toUpperCase() || '';

      // 🌟 1. กรอง "ปุ่มแถบรายวิชา" ไม่ให้แสดงวิชาที่โดนล็อก
      const visibleCourses = coursesData.filter((course: any) => {
        const visibility = (course.visibility || 'everyone').toLowerCase();
        if (['ADMIN', 'LECTURER', 'INTERPRETER'].includes(userRole)) return true;
        if (userRole === 'STUDENT') return visibility === 'everyone' || visibility === 'login';
        return visibility === 'everyone';
      });

      setCourses(visibleCourses); 
      setVocabularies(vocabData);
      setFilteredVocabs(vocabData);
      setCategories(categoriesData);

      const vocabCatMap: Record<string, string[]> = {};
      allVocabLabels.forEach((vl: any) => {
        if (!vocabCatMap[vl.vocab_id]) vocabCatMap[vl.vocab_id] = [];
        vocabCatMap[vl.vocab_id].push(vl.label_tag_id);
      });
      setVocabCategories(vocabCatMap);

      const tagParam = searchParams.get('tag');
      if (tagParam) {
        const matchingCategory = categoriesData.find((c: LabelTag) => c.name === tagParam);
        if (matchingCategory) setSelectedCategory(matchingCategory.id);
      }

      const q = searchParams.get('q');
      if (q) performSearch(q, vocabData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (keyword: string, vocabList = vocabularies) => {
    if (!keyword.trim()) {
      setFilteredVocabs(vocabList);
      return;
    }

    try {
      const results = await vocabularyApi.search(keyword);
      setFilteredVocabs(results);
    } catch (error) {
      console.error('API search failed, falling back to client-side:', error);
      const filtered = vocabList.filter(v =>
        v.term_thai?.toLowerCase().includes(keyword.toLowerCase()) ||
        v.term_english?.toLowerCase().includes(keyword.toLowerCase()) ||
        v.definition?.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredVocabs(filtered);
    }
  };

  const filterVocabularies = () => {
    let filtered = [...vocabularies];
    const userRole = currentUser?.role?.toUpperCase() || '';

    // 🌟 2. ระบบกรองซ่อนคำศัพท์ (ดักสิทธิ์จากวิชาที่สังกัด)
    filtered = filtered.filter(v => {
      const courseVis = (v.courses?.visibility || 'everyone').toLowerCase();

      if (['ADMIN', 'LECTURER', 'INTERPRETER'].includes(userRole)) return true;
      if (userRole === 'STUDENT') return courseVis === 'everyone' || courseVis === 'login';
      return courseVis === 'everyone';
    });

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(v => v.course_id === selectedCourse);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => {
        const vocabCats = vocabCategories[v.id] || [];
        return vocabCats.includes(selectedCategory);
      });
    }

    if (searchKeyword.trim()) {
      filtered = filtered.filter(v =>
        v.term_thai?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        v.term_english?.toLowerCase().includes(searchKeyword.toLowerCase()) 
      );
    }

    setFilteredVocabs(filtered);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleExport = (format: 'excel' | 'csv') => {
    const rows = filteredVocabs.map((v) => ({
      คำศัพท์ภาษาไทย: v.term_thai ?? '',
      คำศัพท์ภาษาอังกฤษ: v.term_english ?? '',
      รายวิชา: v.courses?.name ?? '',
      บทเรียน: v.chapters?.name ?? '',
      คำอธิบาย: v.definition ?? '',
      URL_วิดีโอ: v.video_url ?? '',
      URL_รูปภาพ: v.image_url ?? '',
    }));
    const filename = `vocabulary_${new Date().toISOString().slice(0, 10)}`;
    if (format === 'excel') exportToExcel(rows, filename, 'คำศัพท์');
    else exportToCSV(rows, filename);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-5xl font-extrabold text-gray-600 mb-2">
              📚 คำศัพท์ทั้งหมด
            </h1>
            <p className="text-xl text-gray-600">
              เลือกคำศัพท์ แล้วเรียนรู้ไปพร้อมกัน 🎉
            </p>
          </div>

          <div className="mb-8 max-w-2xl">
            <SearchBox
              onSearch={handleSearch}
              placeholder="ค้นหาคำศัพท์..."
              autoFocus={!!searchParams.get('q')}
            />
          </div>

          {courses.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-base font-bold text-gray-700 whitespace-nowrap">
                  🎓 เลือกรายวิชา:
                </span>
                <button
                  onClick={() => setSelectedCourse('all')}
                  className={`px-6 py-2 rounded-full text-base font-bold transition whitespace-nowrap ${
                    selectedCourse === 'all'
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border'
                  }`}
                >
                  🌈 ทั้งหมด
                </button>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`px-6 py-2 rounded-full text-base font-bold transition whitespace-nowrap ${
                      selectedCourse === course.id
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-green-50 border'
                    }`}
                  >
                    📘 {course.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-base font-medium text-gray-700 whitespace-nowrap">
                  หมวดหมู่:
                </span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${selectedCategory === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  ทั้งหมด
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${selectedCategory === cat.id
                      ? 'ring-2 ring-offset-1'
                      : 'opacity-70 hover:opacity-100'
                      }`}
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                      ...(selectedCategory === cat.id && { ringColor: cat.color })
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-base text-gray-600">
              {searchKeyword
                ? `พบ ${filteredVocabs.length} คำศัพท์จากการค้นหา "${searchKeyword}"`
                : `แสดง ${filteredVocabs.length} คำศัพท์`}
            </p>
            {filteredVocabs.length > 0 && (() => {
              const role = auth.getUser()?.role;
              const canExport = role === 'INTERPRETER' || role === 'LECTURER' || role === 'ADMIN';
              return canExport ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ดาวน์โหลด Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition shadow-sm border"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ดาวน์โหลด CSV
                  </button>
                </div>
              ) : null;
            })()}
          </div>

          {filteredVocabs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVocabs.map((vocabulary) => (
                <VocabularyCard key={vocabulary.id} vocabulary={vocabulary} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">ไม่พบคำศัพท์</h3>
              <p className="text-lg text-gray-600 mb-4">
                {searchKeyword
                  ? 'ลองค้นหาด้วยคำอื่น หรือเปลี่ยนรายวิชา'
                  : 'ยังไม่มีคำศัพท์ในระบบ'}
              </p>
              {searchKeyword && (
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    setSelectedCourse('all');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-base"
                >
                  แสดงคำศัพท์ทั้งหมด
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function VocabularyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VocabularyContent />
    </Suspense>
  );
}
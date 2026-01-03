'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VocabularyCard from '@/components/features/VocabularyCard';
import SearchBox from '@/components/features/SearchBox';
import Loading from '@/components/ui/Loading';
import { vocabularyApi, coursesApi } from '@/lib/api';

export default function VocabularyPage() {
  const searchParams = useSearchParams();
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVocabularies();
  }, [searchKeyword, selectedCourse, vocabularies]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vocabData, coursesData] = await Promise.all([
        vocabularyApi.getAll(),
        coursesApi.getAll(),
      ]);

      setVocabularies(vocabData);
      setFilteredVocabs(vocabData);
      setCourses(coursesData);

      // If there's a search query, perform search
      const q = searchParams.get('q');
      if (q) {
        performSearch(q, vocabData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
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
      // Fallback to client-side filtering
      const filtered = vocabList.filter(v =>
        v.termThai.toLowerCase().includes(keyword.toLowerCase()) ||
        v.termEnglish?.toLowerCase().includes(keyword.toLowerCase()) ||
        v.definition.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredVocabs(filtered);
    }
  };

  const filterVocabularies = () => {
    let filtered = [...vocabularies];

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(v => v.courseId === selectedCourse);
    }

    // Filter by search keyword
    if (searchKeyword.trim()) {
      performSearch(searchKeyword, filtered);
      return;
    }

    setFilteredVocabs(filtered);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">คำศัพท์ทั้งหมด</h1>
            <p className="text-lg text-gray-600">ค้นหาและเรียนรู้คำศัพท์เฉพาะทางจากทุกรายวิชา</p>
          </div>

          {/* Search */}
          <div className="mb-8 max-w-2xl">
            <SearchBox
              onSearch={handleSearch}
              placeholder="ค้นหาคำศัพท์... (รองรับการสะกดผิด)"
              autoFocus={!!searchParams.get('q')}
            />
          </div>

          {/* Course Filter */}
          {courses.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-base font-medium text-gray-700 whitespace-nowrap">
                  รายวิชา:
                </span>
                <button
                  onClick={() => setSelectedCourse('all')}
                  className={`px-5 py-2 rounded-full text-base font-medium transition whitespace-nowrap ${
                    selectedCourse === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ทั้งหมด
                </button>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`px-5 py-2 rounded-full text-base font-medium transition whitespace-nowrap ${
                      selectedCourse === course.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {course.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mb-6">
            <p className="text-base text-gray-600">
              {searchKeyword
                ? `พบ ${filteredVocabs.length} คำศัพท์จากการค้นหา "${searchKeyword}"`
                : `แสดง ${filteredVocabs.length} คำศัพท์`}
            </p>
          </div>

          {/* Vocabularies Grid */}
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
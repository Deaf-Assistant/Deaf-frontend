'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VocabularyCard from '@/components/features/VocabularyCard';
import SearchBox from '@/components/features/SearchBox';
import Loading from '@/components/ui/Loading';
import { coursesApi, vocabularyApi } from '@/lib/api';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    filterVocabularies();
  }, [searchKeyword, selectedChapter, vocabularies]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, vocabData] = await Promise.all([
        coursesApi.getById(courseId),
        vocabularyApi.getAll(courseId),
      ]);

      setCourse(courseData);
      setVocabularies(vocabData);
      setFilteredVocabs(vocabData);
      setChapters(courseData.chapters || []);
    } catch (error) {
      console.error('Failed to load course data:', error);
      alert('ไม่สามารถโหลดข้อมูลรายวิชาได้');
    } finally {
      setLoading(false);
    }
  };

  const filterVocabularies = () => {
    let filtered = [...vocabularies];

    // Filter by chapter
    if (selectedChapter !== 'all') {
      filtered = filtered.filter(v => v.chapterId === selectedChapter);
    }

    // Filter by search keyword
    if (searchKeyword.trim()) {
      filtered = filtered.filter(v =>
        v.termThai.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        v.termEnglish?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        v.definition.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    setFilteredVocabs(filtered);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ไม่พบรายวิชา</h2>
            <p className="text-lg text-gray-600">รายวิชาที่คุณค้นหาไม่มีอยู่ในระบบ</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-block bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm font-medium mb-3">
                  {course.code}
                </div>
                <h1 className="text-4xl font-bold mb-3">{course.name}</h1>
                {course.description && (
                  <p className="text-xl text-blue-100">{course.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{vocabularies.length}</div>
                <div className="text-blue-100">คำศัพท์</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <SearchBox
              onSearch={handleSearch}
              placeholder="ค้นหาคำศัพท์ในรายวิชานี้..."
            />

            {/* Chapter filter */}
            {chapters.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-base font-medium text-gray-700 whitespace-nowrap">
                  บทเรียน:
                </span>
                <button
                  onClick={() => setSelectedChapter('all')}
                  className={`px-5 py-2 rounded-full text-base font-medium transition whitespace-nowrap ${
                    selectedChapter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ทั้งหมด ({vocabularies.length})
                </button>
                {chapters.map((chapter) => {
                  const count = vocabularies.filter(v => v.chapterId === chapter.id).length;
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className={`px-5 py-2 rounded-full text-base font-medium transition whitespace-nowrap ${
                        selectedChapter === chapter.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {chapter.name} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-base text-gray-600">
              แสดง {filteredVocabs.length} จาก {vocabularies.length} คำศัพท์
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
              <p className="text-lg text-gray-600">
                {searchKeyword
                  ? 'ลองค้นหาด้วยคำอื่น หรือเปลี่ยนบทเรียน'
                  : 'ยังไม่มีคำศัพท์ในบทเรียนนี้'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
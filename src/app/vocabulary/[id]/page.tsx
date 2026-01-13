'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoPlayer from '@/components/ui/VideoPlayer';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { vocabularyApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

export default function VocabularyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vocabularyId = params.id as string;

  const [vocabulary, setVocabulary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<'main' | 'fingerspelling'>('main');

  useEffect(() => {
    loadVocabulary();
  }, [vocabularyId]);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const data = await vocabularyApi.getById(vocabularyId);
      setVocabulary(data);
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!vocabulary) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ไม่พบคำศัพท์</h2>
            <Button onClick={() => router.back()}>กลับ</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const termThai = vocabulary.term_thai;
  const termEnglish = vocabulary.term_english;
  const definition = vocabulary.definition;
  const videoUrl = vocabulary.video_url;
  const fingerspellingVideoUrl = vocabulary.fingerspelling_video_url;
  const imageUrl = vocabulary.image_url;
  const courseName = vocabulary.courses?.name;
  const courseCode = vocabulary.courses?.code;
  const chapterName = vocabulary.chapters?.name;

  // เลือกว่าจะแสดงวิดีโออะไร
  const currentVideoUrl = activeVideo === 'main' ? videoUrl : fingerspellingVideoUrl;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-base text-gray-600">
            <ol className="flex items-center space-x-2">
              <li><Link href={ROUTES.VOCABULARY} className="hover:text-blue-600">คำศัพท์</Link></li>
              <li>/</li>
              {courseName && (
                <>
                  <li><Link href={`/courses/${vocabulary.course_id}`} className="hover:text-blue-600">{courseName}</Link></li>
                  <li>/</li>
                </>
              )}
              <li className="text-gray-900 font-medium">{termThai}</li>
            </ol>
          </nav>

          {/* Grid Layout: ซ้าย = วิดีโอ + ปุ่ม, ขวา = ข้อมูล */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* ฝั่งซ้าย: วิดีโอ + ปุ่มสลับ */}
            <div className="space-y-4">
              {/* แสดงวิดีโอ */}
              {currentVideoUrl ? (
                <div className="bg-black rounded-2xl shadow-lg overflow-hidden">
                  <VideoPlayer 
                    videoUrl={currentVideoUrl} 
                    title={activeVideo === 'main' ? 'วิดีโอภาษามือ' : 'วิดีโอสะกดคำ'} 
                    autoLoop={true} 
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl shadow-lg flex items-center justify-center aspect-video">
                  <p className="text-gray-500">ไม่มีวิดีโอ</p>
                </div>
              )}

              {/*  ปุ่มสลับวิดีโอ - แยกเป็นแถวละปุ่ม */}
              <div className="space-y-3">
                {videoUrl && (
                  <button
                    onClick={() => setActiveVideo('main')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                      activeVideo === 'main'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    📹 วิดีโอภาษามือ
                  </button>
                )}
                {fingerspellingVideoUrl && (
                  <button
                    onClick={() => setActiveVideo('fingerspelling')}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                      activeVideo === 'fingerspelling'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    ✋ สะกดคำภาษามือ
                  </button>
                )}
              </div>
            </div>

            {/* ฝั่งขวา: ข้อมูลคำศัพท์ */}
            <div className="space-y-6">
              
              {/* แสดงคำอธิบาย */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{termThai}</h1>
                {termEnglish && <p className="text-2xl text-gray-500 mb-4">{termEnglish}</p>}
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">คำอธิบาย</h3>
                  <p className="text-base text-gray-700 leading-relaxed">{definition}</p>
                </div>
              </div>

              {/* ภาพประกอบ */}
              {imageUrl && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">รูปภาพประกอบ</h3>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image src={imageUrl} alt={termThai} fill className="object-contain" />
                  </div>
                </div>
              )}

              {/* ข้อมูลรายวิชา */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">ข้อมูลรายวิชา</h3>
                <div className="space-y-4">
                  {courseName && (
                    <div>
                      <div className="text-sm text-gray-500">รายวิชา</div>
                      <Link 
                        href={`/courses/${vocabulary.course_id}`} 
                        className="text-base font-medium text-blue-600 hover:underline"
                      >
                        {courseCode ? `${courseCode} - ${courseName}` : courseName}
                      </Link>
                    </div>
                  )}
                  {chapterName && (
                    <div>
                      <div className="text-sm text-gray-500">บทเรียน</div>
                      <div className="text-base font-medium">{chapterName}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* ⭐ ปุ่มด้านล่าง - เพิ่มระยะห่าง */}
              <div className="space-y-4">
                <Link 
                  href={`${ROUTES.REPORT}?vocabularyId=${vocabulary.id}&term=${encodeURIComponent(termThai)}`}
                  className="block"
                >
                  <Button fullWidth variant="secondary" size="lg">
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      รายงานปัญหา
                    </span>
                  </Button>
                </Link>
                
                <Button
                  fullWidth
                  variant="secondary"
                  size="lg"
                  onClick={() => router.back()}
                >
                  ← กลับ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
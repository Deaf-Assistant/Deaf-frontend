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

  // แมปตัวแปรจาก Database (snake_case) มาเป็นชื่อเรียกง่ายๆ
  const termThai = vocabulary.term_thai;
  const termEnglish = vocabulary.term_english;
  const definition = vocabulary.definition;
  const videoUrl = vocabulary.video_url;
  const imageUrl = vocabulary.image_url;
  const courseName = vocabulary.courses?.name;
  const chapterName = vocabulary.chapters?.name;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* สื่อประกอบ */}
            <div className="lg:col-span-2 space-y-8">
              {videoUrl && (
                <div className="bg-black rounded-2xl shadow-lg overflow-hidden">
                  <VideoPlayer videoUrl={videoUrl} title={termThai} autoLoop={true} />
                </div>
              )}
              {imageUrl && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border">
                  <h3 className="text-xl font-bold mb-4">รูปภาพประกอบ</h3>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image src={imageUrl} alt={termThai} fill className="object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* รายละเอียด */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{termThai}</h1>
                {termEnglish && <p className="text-2xl text-gray-500">{termEnglish}</p>}
                <div className="border-t mt-4 pt-4">
                  <h3 className="text-lg font-semibold mb-2">คำอธิบาย</h3>
                  <p className="text-base text-gray-700 leading-relaxed">{definition}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">ข้อมูลรายวิชา</h3>
                <div className="space-y-4">
                  {courseName && (
                    <div>
                      <div className="text-sm text-gray-500">รายวิชา</div>
                      <Link href={`/courses/${vocabulary.course_id}`} className="text-base font-medium text-blue-600">{courseName}</Link>
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

              {/* เว้นระยะห่างด้านบนปุ่ม */}
              <div className="mt-10 space-y-4"> 
                <Link href={`${ROUTES.REPORT}?vocabularyId=${vocabulary.id}&term=${encodeURIComponent(termThai)}`}>
                <Button fullWidth variant="secondary" size="lg">
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    รายงานปัญหา
                  </span>
                </Button>
                </Link>
        <div className="mt-5 space-y-4">          
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
        </div>
      </main>
      <Footer />
    </div>
  );
}




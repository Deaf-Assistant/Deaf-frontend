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
      alert('ไม่สามารถโหลดข้อมูลคำศัพท์ได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!vocabulary) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ไม่พบคำศัพท์</h2>
            <p className="text-lg text-gray-600 mb-6">คำศัพท์ที่คุณค้นหาไม่มีอยู่ในระบบ</p>
            <Button onClick={() => router.back()}>กลับ</Button>
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
          {/* Breadcrumb */}
          <nav className="mb-6 text-base">
            <ol className="flex items-center space-x-2 text-gray-600">
              <li>
                <Link href={ROUTES.VOCABULARY} className="hover:text-blue-600">
                  คำศัพท์
                </Link>
              </li>
              <li>/</li>
              {vocabulary.courseName && (
                <>
                  <li>
                    <Link href={`/courses/${vocabulary.courseId}`} className="hover:text-blue-600">
                      {vocabulary.courseName}
                    </Link>
                  </li>
                  <li>/</li>
                </>
              )}
              <li className="text-gray-900 font-medium">{vocabulary.termThai}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Media */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              {vocabulary.videoUrl && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <VideoPlayer
                    videoUrl={vocabulary.videoUrl}
                    title={vocabulary.termThai}
                    autoLoop={true}
                  />
                </div>
              )}

              {/* Image */}
              {vocabulary.imageUrl && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">รูปภาพประกอบ</h3>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={vocabulary.imageUrl}
                      alt={vocabulary.termThai}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Term Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-4">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    {vocabulary.termThai}
                  </h1>
                  {vocabulary.termEnglish && (
                    <p className="text-2xl text-gray-600">{vocabulary.termEnglish}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">คำอธิบาย</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {vocabulary.definition}
                  </p>
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลรายวิชา</h3>
                
                {vocabulary.courseName && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">รายวิชา</div>
                    <Link
                      href={`/courses/${vocabulary.courseId}`}
                      className="text-base font-medium text-blue-600 hover:text-blue-700"
                    >
                      {vocabulary.courseName}
                    </Link>
                  </div>
                )}

                {vocabulary.chapterName && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">บทเรียน</div>
                    <div className="text-base font-medium text-gray-900">
                      {vocabulary.chapterName}
                    </div>
                  </div>
                )}

                {vocabulary.updatedAt && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">อัปเดตล่าสุด</div>
                    <div className="text-base text-gray-900">
                      {new Date(vocabulary.updatedAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )}

                {vocabulary.updatedBy && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">แก้ไขโดย</div>
                    <div className="text-base text-gray-900">{vocabulary.updatedBy}</div>
                  </div>
                )}
              </div>

              {/* Report Button */}
              <Link href={`${ROUTES.REPORT}?vocabularyId=${vocabulary.id}`}>
                <Button fullWidth variant="secondary" size="lg">
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    รายงานปัญหา
                  </span>
                </Button>
              </Link>

              {/* Back Button */}
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
      </main>

      <Footer />
    </div>
  );
}
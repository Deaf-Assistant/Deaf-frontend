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
import { favoritesApi } from '@/lib/fav_api';
import { labelTagsApi } from '@/lib/label_api';
import { LabelTag } from '@/types/label';
import { ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase';

export default function VocabularyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vocabularyId = params.id as string;

  const [vocabulary, setVocabulary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<'main' | 'fingerspelling'>('main');

  // Favorites state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Label tags state
  const [labelTags, setLabelTags] = useState<LabelTag[]>([]);

  // Auth state - use Supabase directly
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    // Check Supabase auth
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        checkFavoriteStatus();
      }
    };

    checkAuth();
    loadVocabulary();
    loadLabelTags();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
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

  const loadLabelTags = async () => {
    try {
      const tags = await labelTagsApi.getByVocabularyId(vocabularyId);
      setLabelTags(tags);
    } catch (error) {
      console.error('Failed to load label tags:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoritesApi.isFavorited(vocabularyId);
      setIsFavorited(status);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด');
      router.push('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      const newStatus = await favoritesApi.toggleFavorite(vocabularyId);
      setIsFavorited(newStatus);
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      alert(error.message || 'เกิดข้อผิดพลาด');
    } finally {
      setFavoriteLoading(false);
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
  const imageUrl2 = vocabulary.image_url2;
  const imageUrl3 = vocabulary.image_url3;
  const courseName = vocabulary.courses?.name;
  const courseCode = vocabulary.courses?.code;
  const chapterName = vocabulary.chapters?.name;

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

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left: Video */}
            <div className="space-y-4">
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

              {/* Video toggle buttons */}
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

            {/* Right: Info */}
            <div className="space-y-6">

              {/* Title + Favorite Button */}
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">{termThai}</h1>
                    {termEnglish && <p className="text-2xl text-gray-500 mt-1">{termEnglish}</p>}
                  </div>

                  {/* ⭐ Favorite Button */}
                  {user && (
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className={`p-3 rounded-full transition-all duration-200 ${isFavorited
                      ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorited ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                  >
                    {favoriteLoading ? (
                      <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>   
                  )}
                </div>


                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">คำอธิบาย</h3>
                  <p className="text-base text-gray-700 leading-relaxed">{definition}</p>
                </div>
              </div>

              {/* Image Gallery */}
              {[imageUrl, imageUrl2, imageUrl3].filter(Boolean).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">รูปภาพประกอบ</h3>
                  <div className="space-y-4">
                    {[imageUrl, imageUrl2, imageUrl3]
                      .filter(Boolean)
                      .map((img, index) => (
                        <div key={index} className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <Image src={img} alt={`${termThai} ${index + 1}`} fill className="object-contain" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 🏷️ Label Tags / หมวดหมู่ */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">หมวดหมู่</h3>
                <div className="flex flex-wrap gap-2">
                  {labelTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/vocabulary?tag=${encodeURIComponent(tag.name)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition hover:opacity-80"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>


              {/* Course Info */}
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

              {/* Action Buttons */}
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
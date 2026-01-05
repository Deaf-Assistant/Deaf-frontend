// // 'use client'

// // import { useState, useEffect } from 'react';
// // import { useParams } from 'next/navigation';
// // import Header from '@/components/layout/Header';
// // import Footer from '@/components/layout/Footer';
// // import VocabularyCard from '@/components/features/VocabularyCard';
// // import SearchBox from '@/components/features/SearchBox';
// // import Loading from '@/components/ui/Loading';
// // import { coursesApi, vocabularyApi } from '@/lib/api';

// // export default function CourseDetailPage() {
// //   const params = useParams();
// //   const courseId = params.id as string;

// //   const [course, setCourse] = useState<any>(null);
// //   const [vocabularies, setVocabularies] = useState<any[]>([]);
// //   const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);
// //   const [chapters, setChapters] = useState<any[]>([]);
// //   const [selectedChapter, setSelectedChapter] = useState<string>('all');
// //   const [loading, setLoading] = useState(true);
// //   const [searchKeyword, setSearchKeyword] = useState('');

// //   useEffect(() => {
// //     loadCourseData();
// //   }, [courseId]);

// //   useEffect(() => {
// //     filterVocabularies();
// //   }, [searchKeyword, selectedChapter, vocabularies]);

// //   const loadCourseData = async () => {
// //     try {
// //       setLoading(true);
// //       const [courseData, vocabData] = await Promise.all([
// //         coursesApi.getById(courseId),
// //         vocabularyApi.getAll(courseId),
// //       ]);

// //       setCourse(courseData);
// //       setVocabularies(vocabData);
// //       setFilteredVocabs(vocabData);
// //       setChapters(courseData.chapters || []);
// //     } catch (error) {
// //       console.error('Failed to load course data:', error);
// //       alert('ไม่สามารถโหลดข้อมูลรายวิชาได้');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const filterVocabularies = () => {
// //     let filtered = [...vocabularies];

// //     // Filter by chapter
// //     if (selectedChapter !== 'all') {
// //       filtered = filtered.filter(v => v.chapterId === selectedChapter);
// //     }

// //     // Filter by search keyword
// //     if (searchKeyword.trim()) {
// //       filtered = filtered.filter(v =>
// //         v.termThai.toLowerCase().includes(searchKeyword.toLowerCase()) ||
// //         v.termEnglish?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
// //         v.definition.toLowerCase().includes(searchKeyword.toLowerCase())
// //       );
// //     }

// //     setFilteredVocabs(filtered);
// //   };

// //   const handleSearch = (keyword: string) => {
// //     setSearchKeyword(keyword);
// //   };

// //   if (loading) {
// //     return <Loading />;
// //   }

// //   if (!course) {
// //     return (
// //       <div className="min-h-screen flex flex-col">
// //         <Header />
// //         <main className="flex-1 flex items-center justify-center">
// //           <div className="text-center">
// //             <h2 className="text-3xl font-bold text-gray-900 mb-4">ไม่พบรายวิชา</h2>
// //             <p className="text-lg text-gray-600">รายวิชาที่คุณค้นหาไม่มีอยู่ในระบบ</p>
// //           </div>
// //         </main>
// //         <Footer />
// //       </div>
// //     );
// //   }
// //   //bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600

// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       <Header />

// //       <main className="flex-1 bg-gray-50 py-8">
// //         <div className="container mx-auto px-4">
// //           {/* Course Header */}
// //           <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
// //             <div className="flex items-start justify-between">
// //               <div>
// //                 <div className="inline-block bg-gray-800 bg-opacity-20 px-4 py-1 rounded-full text-sm font-medium mb-3">
// //                   {course.code}
// //                 </div>
// //                 <h1 className="text-4xl font-bold mb-3">{course.name}</h1>
// //                 {course.description && (
// //                   <p className="text-xl text-blue-100">{course.description}</p>
// //                 )}
// //               </div>
// //               <div className="text-right">
// //                 <div className="text-4xl font-bold">{vocabularies.length}</div>
// //                 <div className="text-blue-100">คำศัพท์</div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Search and Filters */}
// //           <div className="mb-8 space-y-4">
// //             <SearchBox
// //               onSearch={handleSearch}
// //               placeholder="ค้นหาคำศัพท์ในรายวิชานี้..."
// //             />

// //             {/* Chapter filter */}
// //             {chapters.length > 0 && (
// //               <div className="flex items-center gap-3 overflow-x-auto pb-2">
// //                 <span className="text-base font-medium text-gray-700 whitespace-nowrap">
// //                   บทเรียน:
// //                 </span>
// //                 <button
// //                   onClick={() => setSelectedChapter('all')}
// //                   className={`px-5 py-2 rounded-full text-base font-medium transition whitespace-nowrap ${
// //                     selectedChapter === 'all'
// //                       ? 'bg-blue-600 text-white'
// //                       : 'bg-white text-gray-700 hover:bg-gray-100'
// //                   }`}
// //                 >
// //                   ทั้งหมด ({vocabularies.length})
// //                 </button>
// //                 {chapters.map((chapter) => {
// //                   const count = vocabularies.filter(v => v.chapterId === chapter.id).length;
// //                   return (
// //                     <button
// //                       key={chapter.id}
// //                       onClick={() => setSelectedChapter(chapter.id)}
// //                       className={`px-5 py-2 rounded-full text-base font-medium transition whitespace-nowrap ${
// //                         selectedChapter === chapter.id
// //                           ? 'bg-blue-600 text-white'
// //                           : 'bg-white text-gray-700 hover:bg-gray-100'
// //                       }`}
// //                     >
// //                       {chapter.name} ({count})
// //                     </button>
// //                   );
// //                 })}
// //               </div>
// //             )}
// //           </div>

// //           {/* Results count */}
// //           <div className="mb-6">
// //             <p className="text-base text-gray-600">
// //               แสดง {filteredVocabs.length} จาก {vocabularies.length} คำศัพท์
// //             </p>
// //           </div>

// //           {/* Vocabularies Grid */}
// //           {filteredVocabs.length > 0 ? (
// //             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {filteredVocabs.map((vocabulary) => (
// //                 <VocabularyCard key={vocabulary.id} vocabulary={vocabulary} />
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="text-center py-16">
// //               <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
// //               </svg>
// //               <h3 className="text-2xl font-semibold text-gray-900 mb-2">ไม่พบคำศัพท์</h3>
// //               <p className="text-lg text-gray-600">
// //                 {searchKeyword
// //                   ? 'ลองค้นหาด้วยคำอื่น หรือเปลี่ยนบทเรียน'
// //                   : 'ยังไม่มีคำศัพท์ในบทเรียนนี้'}
// //               </p>
// //             </div>
// //           )}
// //         </div>
// //       </main>

// //       <Footer />
// //     </div>
// //   );
// // }

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
      // Supabase ส่ง chapters มาใน courseData เลย (ถ้า join แล้ว)
      setChapters(courseData.chapters || []);
    } catch (error) {
      console.error('Failed to load course data:', error);
      // ไม่ต้อง alert ก็ได้ เพื่อ UX ที่ดีกว่า ถ้า error เล็กน้อย
    } finally {
      setLoading(false);
    }
  };

  const filterVocabularies = () => {
    let filtered = [...vocabularies];

    // Filter by chapter (แก้เป็น chapter_id)
    if (selectedChapter !== 'all') {
      filtered = filtered.filter(v => v.chapter_id === selectedChapter);
    }

    // Filter by search keyword (แก้เป็น term_thai, term_english)
    if (searchKeyword.trim()) {
      filtered = filtered.filter(v =>
        v.term_thai?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        v.term_english?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        v.definition?.toLowerCase().includes(searchKeyword.toLowerCase())
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
                <div className="inline-block bg-gray-800 bg-opacity-20 px-4 py-1 rounded-full text-sm font-medium mb-3">
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
                  // แก้เป็น chapter_id ให้ตรงกับ DB
                  const count = vocabularies.filter(v => v.chapter_id === chapter.id).length;
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
                // ส่ง vocabulary prop ไปให้ VocabularyCard (ต้องไปแก้ใน VocabularyCard ด้วยถ้ายังใช้ camelCase)
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




// 'use client'

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// import VideoPlayer from '@/components/ui/VideoPlayer';
// import Button from '@/components/ui/Button';
// import Loading from '@/components/ui/Loading';
// import { vocabularyApi } from '@/lib/api';
// import { ROUTES } from '@/lib/constants';

// export default function VocabularyDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const vocabularyId = params.id as string;

//   const [vocabulary, setVocabulary] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadVocabulary();
//   }, [vocabularyId]);

//   const loadVocabulary = async () => {
//     try {
//       setLoading(true);
//       const data = await vocabularyApi.getById(vocabularyId);
//       setVocabulary(data);
//     } catch (error) {
//       console.error('Failed to load vocabulary:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading />;

//   if (!vocabulary) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">ไม่พบคำศัพท์</h2>
//             <Button onClick={() => router.back()}>กลับ</Button>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   const termThai = vocabulary.term_thai;
//   const termEnglish = vocabulary.term_english;
//   const definition = vocabulary.definition;
//   const videoUrl = vocabulary.video_url;
//   const imageUrl = vocabulary.image_url;
//   const courseName = vocabulary.courses?.name;
//   const courseCode = vocabulary.courses?.code;
//   const courseId = vocabulary.course_id;
//   const chapterName = vocabulary.chapters?.name;
//   const updatedAt = vocabulary.updated_at || vocabulary.created_at;

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 bg-gray-50 py-8">
//         <div className="container mx-auto px-4">
//           {/* Breadcrumb Navigation */}
//           <nav className="mb-6 text-base text-gray-600">
//             <ol className="flex items-center space-x-2 flex-wrap">
//               <li>
//                 <Link href={ROUTES.VOCABULARY} className="hover:text-blue-600">
//                   คำศัพท์
//                 </Link>
//               </li>
//               <li>/</li>
//               {courseName && (
//                 <>
//                   <li>
//                     <Link href={`/courses/${courseId}`} className="hover:text-blue-600">
//                       {courseCode ? `${courseCode} ${courseName}` : courseName}
//                     </Link>
//                   </li>
//                   <li>/</li>
//                 </>
//               )}
//               <li className="text-gray-900 font-medium">{termThai}</li>
//             </ol>
//           </nav>

//           <div className="grid lg:grid-cols-3 gap-8">
//             {/* Left Column: Media */}
//             <div className="lg:col-span-2 space-y-8">
//               {videoUrl ? (
//                 <div className="bg-black rounded-2xl shadow-lg overflow-hidden border border-gray-800">
//                   <VideoPlayer videoUrl={videoUrl} title={termThai} autoLoop={true} />
//                 </div>
//               ) : (
//                  !imageUrl && (
//                   <div className="bg-gray-100 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
//                     <p>ไม่มีวิดีโอประกอบ</p>
//                   </div>
//                 )
//               )}

//               {imageUrl && (
//                 <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                   <h3 className="text-lg font-bold text-gray-900 mb-4">รูปภาพประกอบ</h3>
//                   <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
//                     <Image src={imageUrl} alt={termThai} fill className="object-contain" />
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Right Column: Details */}
//             <div className="space-y-6">
//               {/* Definition Card */}
//               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{termThai}</h1>
//                 {termEnglish && <p className="text-xl text-gray-500 font-medium">{termEnglish}</p>}
//                 <div className="border-t border-gray-100 pt-4 mt-4">
//                   <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">คำอธิบาย</h3>
//                   <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
//                     {definition || "ไม่มีคำอธิบาย"}
//                   </p>
//                 </div>
//               </div>

//               {/* Course Information Card */}
//               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
//                 <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">ข้อมูลรายวิชา</h3>
//                 <div className="space-y-4">
//                   {courseName && (
//                     <div>
//                       <div className="text-xs text-gray-500 uppercase mb-1">รายวิชา</div>
//                       <Link href={`/courses/${courseId}`} className="text-base font-medium text-blue-600 hover:text-blue-800">
//                         {courseCode} {courseName}
//                       </Link>
//                     </div>
//                   )}
//                   {chapterName && (
//                     <div>
//                       <div className="text-xs text-gray-500 uppercase mb-1">บทเรียน</div>
//                       <div className="text-base font-medium text-gray-900">{chapterName}</div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* ส่วนที่ปรับเว้นระยะห่าง (Margin Top) */}
//               <div className="pt-4 space-y-4"> 
//                 <Link href={`${ROUTES.REPORT}?vocabularyId=${vocabulary.id}&term=${encodeURIComponent(termThai)}`}>
//                   <Button fullWidth variant="secondary" size="lg" className="border-red-200 text-red-700 hover:bg-red-50">
//                     <span className="flex items-center justify-center gap-2">
//                       รายงานปัญหา / คำผิด
//                     </span>
//                   </Button>
//                 </Link>
//               </div> 

//                 <div className="pt-4 space-y-100"> 
//                 <Button fullWidth variant="outline" size="lg" onClick={() => router.back()}>
//                   ย้อนกลับ
//                 </Button>
//               </div>

//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }
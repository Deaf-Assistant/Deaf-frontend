'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/ui/Loading';
import { coursesApi, chaptersApi } from '@/lib/api';
import { Course } from '@/types';

// Helper type for Chapter since it might not be exported
interface Chapter {
    id: string;
    course_id: string;
    name: string;
    order: number;
}

export default function QuizSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);

    // Selection State
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState<number>(10);

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch chapters when course selection changes
    useEffect(() => {
        if (selectedCourses.length > 0) {
            fetchChapters(selectedCourses);
        } else {
            setChapters([]);
            setSelectedChapters([]);
        }
    }, [selectedCourses]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const coursesData = await coursesApi.getAll();
            setCourses(coursesData);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChapters = async (courseIds: string[]) => {
        try {
            // Fetch chapters for all selected courses
            // Note: chaptersApi.getAll accepts a single courseId, so we might need to fetch multiple times or update API
            // For now, let's fetch for each selected course
            const chaptersPromises = courseIds.map(id => chaptersApi.getAll(id));
            const results = await Promise.all(chaptersPromises);
            const allChapters = results.flat();
            setChapters(allChapters);
        } catch (error) {
            console.error('Failed to load chapters:', error);
        }
    };

    const handleCourseToggle = (courseId: string) => {
        setSelectedCourses(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            } else {
                return [...prev, courseId];
            }
        });
    };

    const handleChapterToggle = (chapterId: string) => {
        setSelectedChapters(prev => {
            if (prev.includes(chapterId)) {
                return prev.filter(id => id !== chapterId);
            } else {
                return [...prev, chapterId];
            }
        });
    };

    const handleSelectAllChapters = () => {
        if (selectedChapters.length === chapters.length) {
            setSelectedChapters([]);
        } else {
            setSelectedChapters(chapters.map(c => c.id));
        }
    };

    const handleStartQuiz = () => {
        if (selectedCourses.length === 0) {
            alert('กรุณาเลือกอย่างน้อย 1 รายวิชา');
            return;
        }

        const queryParams = new URLSearchParams();
        queryParams.set('courses', selectedCourses.join(','));
        if (selectedChapters.length > 0) {
            queryParams.set('chapters', selectedChapters.join(','));
        }
        queryParams.set('count', questionCount.toString());

        router.push(`/quiz/play?${queryParams.toString()}`);
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">โหมดทดสอบ (Quiz Mode)</h1>
                <p className="text-gray-600 mb-8">เลือกรายวิชาและบทเรียนที่ต้องการทดสอบความรู้</p>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    {/* 1. Select Courses */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                            เลือกรายวิชา (Courses)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {courses.map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => handleCourseToggle(course.id)}
                                    className={`
                    cursor-pointer p-4 rounded-lg border transition-all
                    ${selectedCourses.includes(course.id)
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                      w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                      ${selectedCourses.includes(course.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
                    `}>
                                            {selectedCourses.includes(course.id) && (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{course.code}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{course.name}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Select Chapters (Optional) */}
                    {courses.length > 0 && selectedCourses.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                                    เลือกบทเรียน (Chapters)
                                    <span className="text-sm font-normal text-gray-500 ml-2">(ไม่เลือก = สุ่มทั้งหมด)</span>
                                </h2>
                                {chapters.length > 0 && (
                                    <button
                                        onClick={handleSelectAllChapters}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {selectedChapters.length === chapters.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                                    </button>
                                )}
                            </div>

                            {chapters.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {chapters.map(chapter => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => handleChapterToggle(chapter.id)}
                                            className={`
                        cursor-pointer p-3 rounded-lg border transition-all
                        ${selectedChapters.includes(chapter.id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                          w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                          ${selectedChapters.includes(chapter.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
                        `}>
                                                    {selectedChapters.includes(chapter.id) && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-700">{chapter.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm italic ml-11">กำลังโหลดบทเรียน หรือไม่มีบทเรียนในรายวิชาที่เลือก...</div>
                            )}
                        </div>
                    )}

                    {/* 3. Number of Questions */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                            จำนวนข้อ (Number of Questions)
                        </h2>
                        <div className="flex gap-4 flex-wrap">
                            {[5, 10, 15, 20].map(count => (
                                <button
                                    key={count}
                                    onClick={() => setQuestionCount(count)}
                                    className={`
                    px-6 py-3 rounded-lg border font-medium text-lg transition-all
                    ${questionCount === count
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    {count} ข้อ
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleStartQuiz}
                        disabled={selectedCourses.length === 0}
                        className={`
              px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex items-center gap-2
              ${selectedCourses.length > 0
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
            `}
                    >
                        <span>เริ่มทำแบบทดสอบ</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}

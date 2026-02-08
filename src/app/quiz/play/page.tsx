'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Loading from '@/components/ui/Loading';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { vocabularyApi } from '@/lib/api';
import { Vocabulary } from '@/types';

function QuizGame() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Quiz Configuration State
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Game State
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState<any[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        initializeQuiz();
    }, []);

    const initializeQuiz = async () => {
        try {
            setLoading(true);
            const courses = searchParams.get('courses')?.split(',') || [];
            const chapters = searchParams.get('chapters')?.split(',') || [];
            const count = parseInt(searchParams.get('count') || '10', 10);

            // 1. Fetch available vocabularies
            // We might need to fetch all and filter client side if API doesn't support multiple filters nicely yet
            // Or improve API. for now, let's fetch all and filter.
            const allVocabs = await vocabularyApi.getAll();

            // 2. Filter Logic
            let filtered = allVocabs.filter((v: any) => v.video_url); // Must have video

            if (courses.length > 0) {
                filtered = filtered.filter((v: any) => courses.includes(v.course_id));
            }

            if (chapters.length > 0) {
                filtered = filtered.filter((v: any) => chapters.includes(v.chapter_id));
            }

            if (filtered.length === 0) {
                alert('ไม่พบคำศัพท์ที่มีวิดีโอตามเงื่อนไขที่เลือก');
                router.push('/quiz');
                return;
            }

            // 3. Randomize and Select
            const shuffled = filtered.sort(() => 0.5 - Math.random());
            const selectedVocabs = shuffled.slice(0, Math.min(count, shuffled.length));

            // 4. Generate Choices for each question
            const quizQuestions = selectedVocabs.map((correctVocab: any) => {
                // Generate distractors (wrong answers)
                // Filter out the correct answer
                const otherVocabs = allVocabs.filter((v: any) => v.id !== correctVocab.id && v.term_thai);
                const distractors = otherVocabs.sort(() => 0.5 - Math.random()).slice(0, 3);

                // Combine and shuffle choices
                const choices = [correctVocab, ...distractors].sort(() => 0.5 - Math.random());

                return {
                    correct: correctVocab,
                    choices: choices
                };
            });

            setQuestions(quizQuestions);
            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize quiz:', error);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            router.push('/quiz');
        }
    };

    const handleAnswerSelect = (vocabId: string) => {
        if (isAnswered) return;

        setSelectedAnswer(vocabId);
        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = vocabId === currentQuestion.correct.id;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Record User Answer
        setUserAnswers(prev => [...prev, {
            questionIndex: currentQuestionIndex,
            correctId: currentQuestion.correct.id,
            selectedId: vocabId,
            isCorrect: isCorrect,
            correctTerm: currentQuestion.correct.term_thai,
            selectedTerm: currentQuestion.choices.find((c: any) => c.id === vocabId)?.term_thai
        }]);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const handlePlayAgain = () => {
        // Reset State
        setCurrentQuestionIndex(0);
        setScore(0);
        setUserAnswers([]);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
        initializeQuiz(); // Re-fetch/Re-shuffle
    };

    const handleNewQuiz = () => {
        router.push('/quiz');
    };

    if (loading) return <Loading />;

    if (showResult) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">สรุปผลคะแนน</h2>
                    <div className="text-6xl font-black text-blue-600 mb-2">
                        {score} / {questions.length}
                    </div>
                    <p className="text-xl text-gray-500 mb-8">
                        คิดเป็น {Math.round((score / questions.length) * 100)}%
                    </p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handlePlayAgain}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                        >
                            เล่นอีกครั้ง
                        </button>
                        <button
                            onClick={handleNewQuiz}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            เลือกวิชาใหม่
                        </button>
                    </div>
                </div>

                {/* เฉลยคำตอบ */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">เฉลยคำตอบ</h3>
                    {userAnswers.map((answer, index) => {
                        const question = questions[index];
                        return (
                            <div key={index} className={`bg-white rounded-xl shadow p-4 border-l-8 ${answer.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                                <div className="flex gap-4">
                                    <div className="w-1/3 max-w-[200px]">
                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                                            {/* We don't verify video availability here again, assume it works */}
                                            <video src={question.correct.video_url} className="w-full h-full object-cover" controls={false} muted />

                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-500 mb-1">ข้อที่ {index + 1}</div>
                                        <div className="font-bold text-lg mb-2">{question.correct.term_thai}</div>

                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-700">คำตอบของคุณ:</span>
                                            <span className={`ml-2 ${answer.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}`}>
                                                {answer.selectedTerm}
                                            </span>
                                        </div>
                                        {!answer.isCorrect && (
                                            <div className="text-sm mt-1">
                                                <span className="font-semibold text-gray-700">คำตอบที่ถูก:</span>
                                                <span className="ml-2 text-green-600 font-bold">{question.correct.term_thai}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>ข้อที่ {currentQuestionIndex + 1} / {questions.length}</span>
                    <span>คะแนน: {score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Video Section */}
                <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <VideoPlayer
                        videoUrl={currentQuestion.correct.video_url}
                        poster={currentQuestion.correct.image_url}
                        autoLoop={true}
                    />
                </div>

                {/* Choices Section */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center md:text-left">
                        วิดีโอนี้คือคำศัพท์คำว่าอะไร?
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.choices.map((choice: any) => {
                            let buttonStyle = "bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";

                            if (isAnswered) {
                                if (choice.id === currentQuestion.correct.id) {
                                    buttonStyle = "bg-green-100 border-green-500 text-green-700 font-bold";
                                } else if (choice.id === selectedAnswer) {
                                    buttonStyle = "bg-red-100 border-red-500 text-red-700";
                                } else {
                                    buttonStyle = "bg-gray-100 border-gray-200 text-gray-400";
                                }
                            } else if (selectedAnswer === choice.id) {
                                buttonStyle = "bg-blue-600 text-white border-blue-600";
                            }

                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => handleAnswerSelect(choice.id)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-xl text-lg transition-all text-left flex items-center justify-between ${buttonStyle}`}
                                >
                                    <span>{choice.term_thai}</span>
                                    {isAnswered && choice.id === currentQuestion.correct.id && (
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {isAnswered && choice.id === selectedAnswer && choice.id !== currentQuestion.correct.id && (
                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation & Next */}
                    {isAnswered && (
                        <div className={`mt-6 p-4 rounded-xl animate-fade-in ${selectedAnswer === currentQuestion.correct.id ? 'bg-green-50 text-green-800' : 'bg-red-50/50'}`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h3 className="font-bold mb-1">
                                        {selectedAnswer === currentQuestion.correct.id ? 'ถูกต้อง! 🎉' : 'ผิดครับ 😅'}
                                    </h3>
                                    <p className="text-sm">
                                        <span className="font-semibold">คำตอบที่ถูกคือ:</span> {currentQuestion.correct.term_thai}
                                    </p>
                                    {currentQuestion.correct.definition && (
                                        <p className="text-sm mt-1 text-gray-600">{currentQuestion.correct.definition}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'ข้อถัดไป' : 'ดูสรุปผล'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function QuizPlayPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 flex flex-col">
                <Suspense fallback={<Loading />}>
                    <QuizGame />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}

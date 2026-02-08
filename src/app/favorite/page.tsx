'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { favoritesApi } from '@/lib/fav_api';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

export default function FavoritesPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    // โหลด favorites เมื่อ login แล้ว
    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                loadFavorites();
            } else {
                setLoading(false);
            }
        }
    }, [isAuthenticated, authLoading]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const data = await favoritesApi.getMyFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (vocabularyId: string) => {
        try {
            setRemovingId(vocabularyId);
            await favoritesApi.removeFavorite(vocabularyId);
            setFavorites(prev => prev.filter(f => f.vocabularies.id !== vocabularyId));
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            alert('ไม่สามารถลบรายการโปรดได้');
        } finally {
            setRemovingId(null);
        }
    };

    if (authLoading || loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            รายการโปรด
                        </h1>
                        <p className="text-lg text-gray-600">
                            คำศัพท์ที่คุณบันทึกไว้เพื่อดูภายหลัง
                        </p>
                    </div>

                    {/* Not Logged In */}
                    {!isAuthenticated ? (
                        <div className="text-center py-16">
                            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                กรุณาเข้าสู่ระบบ
                            </h3>
                            <p className="text-lg text-gray-600 mb-6">
                                คุณต้องเข้าสู่ระบบเพื่อดูรายการโปรดของคุณ
                            </p>
                            <Link href="/login?redirect=/favorite">
                                <Button size="lg">
                                    เข้าสู่ระบบ
                                </Button>
                            </Link>
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((favorite) => {
                                const vocab = favorite.vocabularies;
                                if (!vocab) return null;

                                return (
                                    <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <Link
                                                href={`/vocabulary/${vocab.id}`}
                                                className="flex-1 hover:text-blue-600"
                                            >
                                                <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                                                    {vocab.term_thai}
                                                </h3>
                                                {vocab.term_english && (
                                                    <p className="text-base text-gray-500">{vocab.term_english}</p>
                                                )}
                                            </Link>

                                            <button
                                                onClick={() => handleRemoveFavorite(vocab.id)}
                                                disabled={removingId === vocab.id}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                                title="นำออกจากรายการโปรด"
                                            >
                                                {removingId === vocab.id ? (
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                        {vocab.definition && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                                {vocab.definition}
                                            </p>
                                        )}

                                        {vocab.courses && (
                                            <div className="text-xs text-gray-500 border-t pt-3">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {vocab.courses.code || vocab.courses.name}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <Link href={`/vocabulary/${vocab.id}`}>
                                                <Button fullWidth size="sm">
                                                    ดูรายละเอียด
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="text-center py-16">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                ยังไม่มีรายการโปรด
                            </h2>
                            <p className="text-gray-600 mb-6">
                                เริ่มเพิ่มคำศัพท์ในรายการโปรดเพื่อเข้าถึงได้ง่ายขึ้น
                            </p>
                            <Link href={ROUTES.VOCABULARY}>
                                <Button>
                                    ค้นหาคำศัพท์
                                </Button>
                            </Link>
                        </Card>
                    )}
                </div>
            </main >

            <Footer />
        </div >
    );
}
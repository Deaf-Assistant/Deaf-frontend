"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

// ── Types ────────────────────────────────────────────────────────
type VocabStat = {
    id: string;
    term_thai: string;
    term_english: string | null;
    favoritesCount: number;
    viewCount: number;
};

type ChapterStat = {
    id: string;
    name: string;
    order: number;
    vocabCount: number;
    totalFavorites: number;
    totalViews: number;
    vocabs: VocabStat[];
};

type CourseStat = {
    id: string;
    code: string;
    name: string;
    visibility: string;
    createdAt: string;
    pinnedCount: number;
    vocabCount: number;
    chapterCount: number;
    totalFavorites: number;
    viewCount: number;
    totalVocabViews: number;
    chapters: ChapterStat[];
};

// ── Helpers ──────────────────────────────────────────────────────
const VISIBILITY_BADGE: Record<string, string> = {
    everyone: "bg-green-100 text-green-700",
    login: "bg-blue-100 text-blue-700",
    admin: "bg-red-100 text-red-700",
};

const VISIBILITY_LABEL: Record<string, string> = {
    everyone: "สาธารณะ",
    login: "นักศึกษา",
    admin: "ผู้ดูแลระบบ",
};

// ── Component ────────────────────────────────────────────────────
export default function AdminStatsPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Which course row is expanded (curtain level 1)
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    // Which chapter row is expanded (curtain level 2), keyed by chapterId
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

    useEffect(() => {
        const user = auth.getUser();
        if (!user || !["ADMIN", "INTERPRETER", "LECTURER"].includes(user.role)) { router.replace("/"); return; }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/admin/course-stats", {
                headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
            });
            const data = await res.json();
            if (data.ok) setCourses(data.courses);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const toggleCourse = (id: string) => {
        setExpandedCourse((prev) => (prev === id ? null : id));
        setExpandedChapter(null); // collapse chapter when course changes
    };

    const toggleChapter = (id: string) => {
        setExpandedChapter((prev) => (prev === id ? null : id));
    };

    const filtered = courses.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    // ── Summary totals ───────────────────────────────────────────
    const totalCourses = courses.length;
    const totalVocab = courses.reduce((s, c) => s + c.vocabCount, 0);
    const totalPins = courses.reduce((s, c) => s + c.pinnedCount, 0);
    const totalFavs = courses.reduce((s, c) => s + c.totalFavorites, 0);
    const totalViews = courses.reduce((s, c) => s + c.viewCount + c.totalVocabViews, 0);

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">สถิติวิชาและเนื้อหา</h1>
                <p className="text-sm text-gray-500">
                    ข้อมูลยอดปักหมุด, คำโปรด, บทเรียน และคำศัพท์ ใน {totalCourses} วิชา
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                    { label: "วิชาทั้งหมด", value: totalCourses, color: "bg-indigo-50 border-indigo-200 text-indigo-700", icon: "📚" },
                    { label: "คำศัพท์ทั้งหมด", value: totalVocab, color: "bg-blue-50 border-blue-200 text-blue-700", icon: "🔤" },
                    { label: "รวมยอดเข้าชม", value: totalViews, color: "bg-sky-50 border-sky-200 text-sky-700", icon: "👁" },
                    { label: "รวมปักหมุด", value: totalPins, color: "bg-purple-50 border-purple-200 text-purple-700", icon: "📌" },
                    { label: "รวมคำโปรด", value: totalFavs, color: "bg-amber-50 border-amber-200 text-amber-700", icon: "⭐" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                        <p className="text-xs opacity-70 mb-1">{s.icon} {s.label}</p>
                        <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-4 flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="ค้นหาวิชาหรือรหัสวิชา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full max-w-sm"
                />
                <span className="text-sm text-gray-400">{filtered.length} วิชา</span>
            </div>

            {/* Course Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">กำลังโหลดสถิติ...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">ไม่พบวิชา</div>
            ) : (
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-0 bg-gray-50 border-b text-xs text-gray-500 uppercase font-semibold">
                        <div className="p-3 pl-4">วิชา</div>
                        <div className="p-3 text-center w-20">บทเรียน</div>
                        <div className="p-3 text-center w-20">คำศัพท์</div>
                        <div className="p-3 text-center w-24">👁 การเข้าชม</div>
                        <div className="p-3 text-center w-20">📌 ปักหมุด</div>
                        <div className="p-3 text-center w-20">⭐ โปรด</div>
                        <div className="p-3 text-center w-28">สิทธิ์เข้าถึง</div>
                    </div>

                    {filtered.map((course) => {
                        const isOpen = expandedCourse === course.id;
                        return (
                            <div key={course.id} className="border-t">
                                {/* ── Course Row ─────────────────────────────── */}
                                <button
                                    onClick={() => toggleCourse(course.id)}
                                    className={`w-full grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-0 text-left transition-colors
                                        ${isOpen ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                                >
                                    <div className="p-3 pl-4 flex items-center gap-2 min-w-0">
                                        <span
                                            className={`text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`}
                                        >
                                            ▶
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{course.name}</p>
                                            {course.code && (
                                                <p className="text-xs text-gray-400">{course.code}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 text-center w-20 text-sm font-medium text-gray-700">{course.chapterCount}</div>
                                    <div className="p-3 text-center w-20 text-sm font-medium text-blue-600">{course.vocabCount}</div>
                                    <div className={`p-3 text-center w-24 text-sm font-bold ${(course.viewCount + course.totalVocabViews) > 0 ? "text-sky-600" : "text-gray-300"}`}>
                                        {(course.viewCount + course.totalVocabViews).toLocaleString()}
                                    </div>
                                    <div className={`p-3 text-center w-20 text-sm font-bold ${course.pinnedCount > 0 ? "text-purple-600" : "text-gray-300"}`}>
                                        {course.pinnedCount}
                                    </div>
                                    <div className={`p-3 text-center w-20 text-sm font-bold ${course.totalFavorites > 0 ? "text-amber-600" : "text-gray-300"}`}>
                                        {course.totalFavorites}
                                    </div>
                                    <div className="p-3 text-center w-28">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${VISIBILITY_BADGE[course.visibility] ?? "bg-gray-100 text-gray-600"}`}>
                                            {VISIBILITY_LABEL[course.visibility] ?? course.visibility}
                                        </span>
                                    </div>
                                </button>

                                {/* ── Curtain: Chapters ──────────────────────── */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="bg-indigo-50/60 border-t border-indigo-100">
                                        {course.chapters.length === 0 ? (
                                            <p className="px-10 py-4 text-sm text-gray-400 italic">ยังไม่มีบทเรียนในวิชานี้</p>
                                        ) : (
                                            <>
                                                {/* Chapter sub-header */}
                                                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] px-6 py-1.5 text-[11px] font-semibold uppercase text-indigo-400 border-b border-indigo-100 bg-indigo-100/40">
                                                    <div>บทเรียน</div>
                                                    <div className="text-center w-24">คำศัพท์</div>
                                                    <div className="text-center w-24">👁 เข้าชม</div>
                                                    <div className="text-center w-24">⭐ โปรดรวม</div>
                                                    <div className="w-10" />
                                                </div>
                                                {course.chapters.map((chapter) => {
                                                    const chOpen = expandedChapter === chapter.id;
                                                    return (
                                                        <div key={chapter.id}>
                                                            {/* Chapter Row */}
                                                            <button
                                                                onClick={() => toggleChapter(chapter.id)}
                                                                className={`w-full grid grid-cols-[1fr_auto_auto_auto_auto] px-6 py-2.5 text-left border-t border-indigo-100/60 transition-colors
                                                                    ${chOpen ? "bg-indigo-100/60" : "hover:bg-indigo-100/40"}`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className={`text-indigo-300 text-xs transition-transform duration-200 shrink-0 ${chOpen ? "rotate-90" : ""}`}>
                                                                        ▶
                                                                    </span>
                                                                    <span className="text-sm font-medium text-gray-800 truncate">
                                                                        {chapter.order}. {chapter.name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-center w-24 text-sm text-blue-600 font-medium">{chapter.vocabCount}</div>
                                                                <div className={`text-center w-24 text-sm font-bold ${chapter.totalViews > 0 ? "text-sky-600" : "text-gray-300"}`}>
                                                                    {chapter.totalViews > 0 ? chapter.totalViews.toLocaleString() : "—"}
                                                                </div>
                                                                <div className={`text-center w-24 text-sm font-bold ${chapter.totalFavorites > 0 ? "text-amber-600" : "text-gray-300"}`}>
                                                                    {chapter.totalFavorites}
                                                                </div>
                                                                <div className="w-10" />
                                                            </button>

                                                            {/* ── Curtain: Vocabularies ─────────── */}
                                                            <div
                                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${chOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
                                                            >
                                                                <div className="bg-white border-t border-indigo-100/60">
                                                                    {chapter.vocabs.length === 0 ? (
                                                                        <p className="px-14 py-3 text-xs text-gray-400 italic">ยังไม่มีคำศัพท์ในบทเรียนนี้</p>
                                                                    ) : (
                                                                        <>
                                                                            {/* Vocab sub-header */}
                                                                            <div className="grid grid-cols-[1fr_auto_auto] px-14 py-1 text-[11px] font-semibold uppercase text-gray-400 bg-gray-50 border-b">
                                                                                <div>คำศัพท์</div>
                                                                                <div className="text-center w-24">👁 เข้าชม</div>
                                                                                <div className="text-center w-24">⭐ โปรด</div>
                                                                            </div>
                                                                            {chapter.vocabs.map((vocab) => (
                                                                                <div
                                                                                    key={vocab.id}
                                                                                    className="grid grid-cols-[1fr_auto_auto] px-14 py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                                                                >
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-sm font-medium text-gray-800 truncate">{vocab.term_thai}</p>
                                                                                        {vocab.term_english && (
                                                                                            <p className="text-xs text-gray-400 truncate">{vocab.term_english}</p>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="w-24 text-center">
                                                                                        {vocab.viewCount > 0 ? (
                                                                                            <span className="text-sm font-bold text-sky-600">
                                                                                                👁 {vocab.viewCount.toLocaleString()}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-gray-300 text-sm">—</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="w-24 text-center">
                                                                                        {vocab.favoritesCount > 0 ? (
                                                                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                                                                                                ⭐ {vocab.favoritesCount}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-gray-300 text-sm">—</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="text-x text-gray-400 mt-4 text-center">
                👁 การเข้าชม = ยอดเข้าชมรวมจากวิชาและคำศัพท์ · 📌 ปักหมุด = จำนวนผู้ใช้ที่ปักหมุดวิชา · ⭐ โปรด = รวมคำศัพท์โปรดทั้งหมด
            </p>
        </div>
    );
}

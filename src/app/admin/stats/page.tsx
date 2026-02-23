"use client";

import { useEffect, useState, useMemo } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import * as XLSX from "xlsx";

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

type SortKey = "name" | "vocabCount" | "views" | "pinnedCount" | "totalFavorites";
type SortDir = "asc" | "desc";

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

    // Filter & sort state
    const [visFilter, setVisFilter] = useState<string>("all");
    const [minVocab, setMinVocab] = useState<string>("");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    // Curtain expansion
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
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
        setExpandedChapter(null);
    };

    const toggleChapter = (id: string) => {
        setExpandedChapter((prev) => (prev === id ? null : id));
    };

    // ── Apply filters + sort ──────────────────────────────────────
    const filtered = useMemo(() => {
        let list = courses.filter((c) => {
            const matchSearch =
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.code.toLowerCase().includes(search.toLowerCase());
            const matchVis = visFilter === "all" || c.visibility === visFilter;
            const matchVocab = minVocab === "" || c.vocabCount >= Number(minVocab);
            return matchSearch && matchVis && matchVocab;
        });

        list = [...list].sort((a, b) => {
            let valA: number | string, valB: number | string;
            switch (sortKey) {
                case "vocabCount": valA = a.vocabCount; valB = b.vocabCount; break;
                case "views": valA = a.viewCount + a.totalVocabViews; valB = b.viewCount + b.totalVocabViews; break;
                case "pinnedCount": valA = a.pinnedCount; valB = b.pinnedCount; break;
                case "totalFavorites": valA = a.totalFavorites; valB = b.totalFavorites; break;
                default: valA = a.name; valB = b.name;
            }
            if (typeof valA === "string") return sortDir === "asc" ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
            return sortDir === "asc" ? valA - (valB as number) : (valB as number) - valA;
        });

        return list;
    }, [courses, search, visFilter, minVocab, sortKey, sortDir]);

    // ── Summary totals ────────────────────────────────────────────
    const totalCourses = courses.length;
    const totalVocab = courses.reduce((s, c) => s + c.vocabCount, 0);
    const totalPins = courses.reduce((s, c) => s + c.pinnedCount, 0);
    const totalFavs = courses.reduce((s, c) => s + c.totalFavorites, 0);
    const totalViews = courses.reduce((s, c) => s + c.viewCount + c.totalVocabViews, 0);

    // ── Sort toggle helper ────────────────────────────────────────
    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };
    const sortIcon = (key: SortKey) =>
        sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

    // ── Excel Export ──────────────────────────────────────────────
    const handleExport = () => {
        // Sheet 1: Courses summary
        const courseRows = filtered.map((c) => ({
            "รหัสวิชา": c.code,
            "ชื่อวิชา": c.name,
            "สิทธิ์เข้าถึง": VISIBILITY_LABEL[c.visibility] ?? c.visibility,
            "บทเรียน": c.chapterCount,
            "คำศัพท์": c.vocabCount,
            "การเข้าชมรวม": c.viewCount + c.totalVocabViews,
            "ปักหมุด": c.pinnedCount,
            "โปรดรวม": c.totalFavorites,
        }));

        // Sheet 2: Chapters
        const chapterRows: object[] = [];
        filtered.forEach((c) => {
            c.chapters.forEach((ch) => {
                chapterRows.push({
                    "ชื่อวิชา": c.name,
                    "รหัสวิชา": c.code,
                    "บทเรียน": `${ch.order}. ${ch.name}`,
                    "คำศัพท์": ch.vocabCount,
                    "การเข้าชม": ch.totalViews,
                    "โปรดรวม": ch.totalFavorites,
                });
            });
        });

        // Sheet 3: Vocabularies
        const vocabRows: object[] = [];
        filtered.forEach((c) => {
            c.chapters.forEach((ch) => {
                ch.vocabs.forEach((v) => {
                    vocabRows.push({
                        "ชื่อวิชา": c.name,
                        "บทเรียน": ch.name,
                        "คำศัพท์ (ไทย)": v.term_thai,
                        "คำศัพท์ (อังกฤษ)": v.term_english ?? "",
                        "การเข้าชม": v.viewCount,
                        "โปรด": v.favoritesCount,
                    });
                });
            });
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(courseRows), "วิชา");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(chapterRows.length ? chapterRows : [{}]), "บทเรียน");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vocabRows.length ? vocabRows : [{}]), "คำศัพท์");

        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `stats-${today}.xlsx`);
    };

    return (
        <div className="p-6 w-full">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold mb-1">สถิติวิชาและเนื้อหา</h1>
                    <p className="text-base text-gray-500">
                        ข้อมูลยอดปักหมุด, คำโปรด, บทเรียน และคำศัพท์ ใน {totalCourses} วิชา
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={loading || filtered.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow transition-colors shrink-0"
                >
                    <span>📥</span> ส่งออก Excel
                </button>
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
                        <p className="text-sm opacity-70 mb-1">{s.icon} {s.label}</p>
                        <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter Bar ───────────────────────────────────────────── */}
            <div className="mb-4 flex flex-wrap gap-3 items-center bg-gray-50 border rounded-xl px-4 py-3">
                {/* Search */}
                <input
                    type="text"
                    placeholder="🔍 ค้นหาวิชาหรือรหัสวิชา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full max-w-xs bg-white"
                />

                {/* Visibility filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-500 whitespace-nowrap">สิทธิ์:</span>
                    <select
                        value={visFilter}
                        onChange={(e) => setVisFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="everyone">สาธารณะ</option>
                        <option value="login">นักศึกษา</option>
                        <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                </div>

                {/* Min vocab filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-500 whitespace-nowrap">คำศัพท์ ≥</span>
                    <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={minVocab}
                        onChange={(e) => setMinVocab(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    />
                </div>

                {/* Reset */}
                {(visFilter !== "all" || minVocab !== "" || search !== "") && (
                    <button
                        onClick={() => { setSearch(""); setVisFilter("all"); setMinVocab(""); }}
                        className="text-sm text-red-500 hover:text-red-700 underline"
                    >
                        ล้างตัวกรอง
                    </button>
                )}

                <span className="text-base text-gray-400 ml-auto">แสดง {filtered.length} / {totalCourses} วิชา</span>
            </div>

            {/* Course Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">กำลังโหลดสถิติ...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">ไม่พบวิชาที่ตรงกับเงื่อนไข</div>
            ) : (
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-0 bg-gray-50 border-b text-sm text-gray-500 uppercase font-semibold">
                        <button onClick={() => handleSort("name")} className="p-3 pl-4 text-left hover:text-gray-800 transition-colors">
                            วิชา{sortIcon("name")}
                        </button>
                        <div className="p-3 text-center w-24">บทเรียน</div>
                        <button onClick={() => handleSort("vocabCount")} className="p-3 text-center w-24 hover:text-gray-800 transition-colors">
                            คำศัพท์{sortIcon("vocabCount")}
                        </button>
                        <button onClick={() => handleSort("views")} className="p-3 text-center w-28 hover:text-gray-800 transition-colors">
                            👁 การเข้าชม{sortIcon("views")}
                        </button>
                        <button onClick={() => handleSort("pinnedCount")} className="p-3 text-center w-24 hover:text-gray-800 transition-colors">
                            📌 ปักหมุด{sortIcon("pinnedCount")}
                        </button>
                        <button onClick={() => handleSort("totalFavorites")} className="p-3 text-center w-24 hover:text-gray-800 transition-colors">
                            ⭐ โปรด{sortIcon("totalFavorites")}
                        </button>
                        <div className="p-3 text-center w-32">สิทธิ์เข้าถึง</div>
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
                                            <p className="font-semibold text-base text-gray-900 truncate">{course.name}</p>
                                            {course.code && (
                                                <p className="text-sm text-gray-400">{course.code}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 text-center w-24 text-base font-medium text-gray-700">{course.chapterCount}</div>
                                    <div className="p-3 text-center w-24 text-base font-medium text-blue-600">{course.vocabCount}</div>
                                    <div className={`p-3 text-center w-28 text-base font-bold ${(course.viewCount + course.totalVocabViews) > 0 ? "text-sky-600" : "text-gray-300"}`}>
                                        {(course.viewCount + course.totalVocabViews).toLocaleString()}
                                    </div>
                                    <div className={`p-3 text-center w-24 text-base font-bold ${course.pinnedCount > 0 ? "text-purple-600" : "text-gray-300"}`}>
                                        {course.pinnedCount}
                                    </div>
                                    <div className={`p-3 text-center w-24 text-base font-bold ${course.totalFavorites > 0 ? "text-amber-600" : "text-gray-300"}`}>
                                        {course.totalFavorites}
                                    </div>
                                    <div className="p-3 text-center w-32">
                                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${VISIBILITY_BADGE[course.visibility] ?? "bg-gray-100 text-gray-600"}`}>
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
                                                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] px-6 py-2 text-xs font-semibold uppercase text-indigo-400 border-b border-indigo-100 bg-indigo-100/40">
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
                                                                    <span className="text-base font-medium text-gray-800 truncate">
                                                                        {chapter.order}. {chapter.name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-center w-24 text-base text-blue-600 font-medium">{chapter.vocabCount}</div>
                                                                <div className={`text-center w-24 text-base font-bold ${chapter.totalViews > 0 ? "text-sky-600" : "text-gray-300"}`}>
                                                                    {chapter.totalViews > 0 ? chapter.totalViews.toLocaleString() : "—"}
                                                                </div>
                                                                <div className={`text-center w-24 text-base font-bold ${chapter.totalFavorites > 0 ? "text-amber-600" : "text-gray-300"}`}>
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
                                                                            <div className="grid grid-cols-[1fr_auto_auto] px-14 py-1.5 text-xs font-semibold uppercase text-gray-400 bg-gray-50 border-b">
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
                                                                                        <p className="text-base font-medium text-gray-800 truncate">{vocab.term_thai}</p>
                                                                                        {vocab.term_english && (
                                                                                            <p className="text-sm text-gray-400 truncate">{vocab.term_english}</p>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="w-24 text-center">
                                                                                        {vocab.viewCount > 0 ? (
                                                                                            <span className="text-base font-bold text-sky-600">
                                                                                                👁 {vocab.viewCount.toLocaleString()}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-gray-300 text-base">—</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="w-24 text-center">
                                                                                        {vocab.favoritesCount > 0 ? (
                                                                                            <span className="inline-flex items-center gap-1 text-base font-bold text-amber-600">
                                                                                                ⭐ {vocab.favoritesCount}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-gray-300 text-base">—</span>
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

            <p className="text-sm text-gray-400 mt-4 text-center">
                👁 การเข้าชม = ยอดเข้าชมรวมจากวิชาและคำศัพท์ · 📌 ปักหมุด = จำนวนผู้ใช้ที่ปักหมุดวิชา · ⭐ โปรด = รวมคำศัพท์โปรดทั้งหมด
            </p>
        </div>
    );
}

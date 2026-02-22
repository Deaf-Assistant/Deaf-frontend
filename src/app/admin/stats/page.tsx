"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import Link from "next/link";
import type { UserRole } from "@/types";

const supabase = createClient();

type UserStat = {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    joinedAt: string;
    favoritesCount: number;
    coursesEngaged: number;
    pinnedCourses: number;
    reportsFiled: number;
    pendingReports: number;
    lastActive: string | null;
};

const ROLE_COLORS: Record<UserRole, string> = {
    ADMIN: "bg-red-100 text-red-700",
    LECTURER: "bg-blue-100 text-blue-700",
    INTERPRETER: "bg-purple-100 text-purple-700",
    STUDENT: "bg-green-100 text-green-700",
    MEMBER: "bg-orange-100 text-orange-700",
};

type SortKey = keyof UserStat;
type SortDir = "asc" | "desc";

function fmt(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", year: "2-digit",
    });
}

export default function AdminStatsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<UserStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("favoritesCount");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    useEffect(() => {
        const user = auth.getUser();
        if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/admin/user-stats", {
                headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
            });
            const data = await res.json();
            if (data.ok) setStats(data.stats);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    const filtered = stats
        .filter((u) => {
            const kw = search.toLowerCase();
            const matchSearch = (u.name ?? "").toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw);
            const matchRole = roleFilter === "ALL" || u.role === roleFilter;
            return matchSearch && matchRole;
        })
        .sort((a, b) => {
            const av = a[sortKey] ?? "";
            const bv = b[sortKey] ?? "";
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

    const handleExport = (format: "excel" | "csv") => {
        const rows = filtered.map((u) => ({
            ชื่อ: u.name ?? "-",
            Email: u.email,
            Role: u.role,
            คำศัพท์โปรด: u.favoritesCount,
            วิชาที่มีส่วนร่วม: u.coursesEngaged,
            วิชาที่ปักหมุด: u.pinnedCourses,
            รายงานที่ส่ง: u.reportsFiled,
            วันที่สมัคร: fmt(u.joinedAt),
            ใช้งานล่าสุด: fmt(u.lastActive),
        }));
        const fn = `user_stats_${new Date().toISOString().slice(0, 10)}`;
        if (format === "excel") exportToExcel(rows, fn, "สถิติผู้ใช้");
        else exportToCSV(rows, fn);
    };

    // Summary totals
    const total = stats.length;
    const totalFavs = stats.reduce((s, u) => s + u.favoritesCount, 0);
    const totalPins = stats.reduce((s, u) => s + u.pinnedCourses, 0);
    const activeUsers = stats.filter((u) => u.favoritesCount > 0 || u.pinnedCourses > 0).length;

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className="ml-1 text-gray-400">
            {sortKey === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">สถิติการเรียนรู้ของผู้ใช้</h1>
                    <p className="text-sm text-gray-500">
                        ข้อมูลการมีส่วนร่วมของผู้ใช้ {total} คน จากคำศัพท์โปรดและวิชาที่ปักหมุด
                    </p>
                </div>
                {filtered.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport("excel")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Excel
                        </button>
                        <button
                            onClick={() => handleExport("csv")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition border"
                        >
                            CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "ผู้ใช้ทั้งหมด", value: total, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
                    { label: "ผู้ใช้ที่ active", value: activeUsers, color: "bg-green-50 border-green-200 text-green-700" },
                    { label: "รวมคำศัพท์โปรด", value: totalFavs, color: "bg-amber-50 border-amber-200 text-amber-700" },
                    { label: "รวมวิชาที่ปักหมุด", value: totalPins, color: "bg-purple-50 border-purple-200 text-purple-700" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                        <p className="text-xs opacity-70 mb-1">{s.label}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Role breakdown */}
            <div className="flex flex-wrap gap-2 mb-5">
                {(["ALL", "ADMIN", "LECTURER", "INTERPRETER", "STUDENT", "MEMBER"] as const).map((r) => {
                    const count = r === "ALL" ? stats.length : stats.filter((u) => u.role === r).length;
                    return (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${roleFilter === r ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                                }`}
                        >
                            {r} ({count})
                        </button>
                    );
                })}
                <input
                    type="text"
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ml-auto border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[200px]"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">กำลังโหลดสถิติ...</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="p-3 text-left">ผู้ใช้</th>
                                <th className="p-3 text-left">Role</th>
                                <th
                                    className="p-3 text-center cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("favoritesCount")}
                                >
                                    ⭐ โปรด <SortIcon col="favoritesCount" />
                                </th>
                                <th
                                    className="p-3 text-center cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("coursesEngaged")}
                                >
                                    📚 วิชาที่มีส่วนร่วม <SortIcon col="coursesEngaged" />
                                </th>
                                <th
                                    className="p-3 text-center cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("pinnedCourses")}
                                >
                                    📌 ปักหมุด <SortIcon col="pinnedCourses" />
                                </th>
                                <th
                                    className="p-3 text-center cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("reportsFiled")}
                                >
                                    🚩 รายงาน <SortIcon col="reportsFiled" />
                                </th>
                                <th
                                    className="p-3 text-center cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("lastActive")}
                                >
                                    ⏱ ล่าสุด <SortIcon col="lastActive" />
                                </th>
                                <th className="p-3 text-center">การมีส่วนร่วม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-400">ไม่พบข้อมูล</td>
                                </tr>
                            ) : (
                                filtered.map((u) => {
                                    // Engagement score: simple weighted sum
                                    const score = u.favoritesCount * 2 + u.pinnedCourses * 3 + u.coursesEngaged * 1;
                                    const maxScore = Math.max(...filtered.map((x) => x.favoritesCount * 2 + x.pinnedCourses * 3 + x.coursesEngaged));
                                    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                                    return (
                                        <tr key={u.id} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">{u.name || "—"}</div>
                                                <div className="text-xs text-gray-400">{u.email}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">สมัคร {fmt(u.joinedAt)}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold ${u.favoritesCount > 0 ? "text-amber-600" : "text-gray-300"}`}>
                                                    {u.favoritesCount}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold ${u.coursesEngaged > 0 ? "text-blue-600" : "text-gray-300"}`}>
                                                    {u.coursesEngaged}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold ${u.pinnedCourses > 0 ? "text-purple-600" : "text-gray-300"}`}>
                                                    {u.pinnedCourses}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {u.reportsFiled > 0 ? (
                                                    <span className="font-bold text-red-500">{u.reportsFiled}</span>
                                                ) : (
                                                    <span className="text-gray-300">0</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center text-xs text-gray-500">{fmt(u.lastActive)}</td>
                                            <td className="p-3 min-w-[120px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${pct >= 66 ? "bg-green-500" : pct >= 33 ? "bg-amber-400" : "bg-gray-300"
                                                                }`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer note */}
            <p className="text-xs text-gray-400 mt-4 text-center">
                การมีส่วนร่วม = คำนวณจากคำศัพท์โปรด (×2) + วิชาที่ปักหมุด (×3) + วิชาที่มีส่วนร่วม (×1) เทียบกับผู้ใช้อื่น
            </p>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";

const supabase = createClient();

type AuditLog = {
    id: string;
    actor_name: string | null;
    actor_role: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    entity_name: string | null;
    details: Record<string, any> | null;
    created_at: string;
};

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
    DELETE_USER: { label: "ลบผู้ใช้", color: "bg-red-100 text-red-700", icon: "🗑️" },
    CHANGE_ROLE: { label: "เปลี่ยน Role", color: "bg-amber-100 text-amber-700", icon: "🔄" },
    DELETE_MEDIA: { label: "ลบไฟล์", color: "bg-orange-100 text-orange-700", icon: "📁" },
    DELETE_VOCAB: { label: "ลบคำศัพท์", color: "bg-rose-100 text-rose-700", icon: "📝" },
    ADD_VOCAB: { label: "เพิ่มคำศัพท์", color: "bg-green-100 text-green-700", icon: "✅" },
    EDIT_VOCAB: { label: "แก้ไขคำศัพท์", color: "bg-blue-100 text-blue-700", icon: "✏️" },
};

const ALL_ACTIONS = Object.keys(ACTION_META);

function fmt(date: string) {
    return new Date(date).toLocaleString("th-TH", {
        day: "numeric", month: "short", year: "2-digit",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function AuditLogPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        const user = auth.getUser();
        if (!user || user.role !== "ADMIN") { router.replace("/"); return; }
        fetchLogs();
    }, []);

    const fetchLogs = async (params?: Record<string, string>) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const qs = new URLSearchParams({
                ...(actionFilter && { action: actionFilter }),
                ...(search && { search }),
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
                ...params,
            }).toString();
            const res = await fetch(`/api/admin/audit-logs${qs ? "?" + qs : ""}`, {
                headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
            });
            const data = await res.json();
            if (data.ok) setLogs(data.logs);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleFilter = () => fetchLogs();

    const handleExport = (format: "excel" | "csv") => {
        const rows = logs.map((l) => ({
            เวลา: fmt(l.created_at),
            ผู้ดำเนินการ: l.actor_name ?? "—",
            Role: l.actor_role ?? "—",
            การกระทำ: ACTION_META[l.action]?.label ?? l.action,
            ประเภท: l.entity_type,
            ชื่อรายการ: l.entity_name ?? "—",
            รายละเอียด: l.details ? JSON.stringify(l.details) : "—",
        }));
        const fn = `audit_log_${new Date().toISOString().slice(0, 10)}`;
        if (format === "excel") exportToExcel(rows, fn, "Audit Log");
        else exportToCSV(rows, fn);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">📝 Audit Log</h1>
                    <p className="text-sm text-gray-500">บันทึกการดำเนินการของ Admin ทุกครั้ง</p>
                </div>
                {logs.length > 0 && (
                    <div className="flex gap-2">
                        <button onClick={() => handleExport("excel")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Excel
                        </button>
                        <button onClick={() => handleExport("csv")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition border">
                            CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border shadow-sm p-4 mb-5">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Action filter */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">การกระทำ</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">ทั้งหมด</option>
                            {ALL_ACTIONS.map((a) => (
                                <option key={a} value={a}>{ACTION_META[a].icon} {ACTION_META[a].label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="text-xs text-gray-500 mb-1 block">ค้นหาชื่อ</label>
                        <input
                            type="text"
                            placeholder="ชื่อผู้ใช้ หรือรายการที่ถูกดำเนินการ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    {/* Date range */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">ตั้งแต่</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">ถึง</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>

                    <button
                        onClick={handleFilter}
                        className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                    >
                        ค้นหา
                    </button>
                    <button
                        onClick={() => { setActionFilter(""); setSearch(""); setDateFrom(""); setDateTo(""); fetchLogs({ action: "", search: "", dateFrom: "", dateTo: "" }); }}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                        รีเซ็ต
                    </button>
                </div>
            </div>

            {/* Stats ribbon */}
            {!loading && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {ALL_ACTIONS.map((a) => {
                        const count = logs.filter((l) => l.action === a).length;
                        if (count === 0) return null;
                        const meta = ACTION_META[a];
                        return (
                            <span key={a} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${meta.color}`}>
                                {meta.icon} {meta.label}: {count}
                            </span>
                        );
                    })}
                    <span className="ml-auto text-xs text-gray-400 self-center">แสดง {logs.length} รายการ</span>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-5xl mb-4">📋</p>
                    <p>ยังไม่มีบันทึกใดๆ</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="p-3 text-left">เวลา</th>
                                <th className="p-3 text-left">ผู้ดำเนินการ</th>
                                <th className="p-3 text-left">การกระทำ</th>
                                <th className="p-3 text-left">รายการ</th>
                                <th className="p-3 text-left">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => {
                                const meta = ACTION_META[log.action] ?? { label: log.action, color: "bg-gray-100 text-gray-600", icon: "❓" };
                                return (
                                    <tr key={log.id} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="p-3 whitespace-nowrap text-gray-500 text-xs">{fmt(log.created_at)}</td>
                                        <td className="p-3">
                                            <p className="font-medium text-gray-900">{log.actor_name ?? "—"}</p>
                                            {log.actor_role && (
                                                <span className="text-xs text-gray-400">{log.actor_role}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                                                {meta.icon} {meta.label}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <p className="font-medium text-gray-800">{log.entity_name ?? "—"}</p>
                                            <p className="text-xs text-gray-400">{log.entity_type}</p>
                                        </td>
                                        <td className="p-3 text-xs text-gray-500 max-w-[240px]">
                                            {log.details ? (
                                                log.action === "CHANGE_ROLE" ? (
                                                    <span>
                                                        <span className="font-medium text-gray-700">{log.details.from}</span>
                                                        {" → "}
                                                        <span className="font-medium text-indigo-700">{log.details.to}</span>
                                                    </span>
                                                ) : (
                                                    <span className="font-mono break-all">{JSON.stringify(log.details)}</span>
                                                )
                                            ) : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

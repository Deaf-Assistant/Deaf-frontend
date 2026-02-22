"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const supabase = createClient();

type MediaFile = {
    name: string;
    bucket: string;
    publicUrl: string;
    size: number;
    createdAt: string;
    isOrphaned: boolean;
    usedBy: { id: string; term_thai: string } | null;
};

type Tab = "all" | "images" | "videos" | "orphaned";

function formatBytes(bytes: number) {
    if (!bytes) return "?";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
    const router = useRouter();
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>("all");
    const [search, setSearch] = useState("");

    // Single delete
    const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Replace state
    const [replaceTarget, setReplaceTarget] = useState<MediaFile | null>(null);
    const [replaceFile, setReplaceFile] = useState<File | null>(null);
    const [replacing, setReplacing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Multi-select ──────────────────────────────────────────────
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    const currentUser = auth.getUser();

    useEffect(() => {
        if (!currentUser || currentUser.role !== "ADMIN") {
            router.replace("/");
            return;
        }
        fetchMedia();
    }, []);

    // Clear selection when tab/search changes
    useEffect(() => { setSelected(new Set()); }, [tab, search]);

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? "";
    };

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch("/api/admin/media", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.ok) setFiles(data.files);
            else alert(data.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── Derived data ──────────────────────────────────────────────
    const filtered = files.filter((f) => {
        const matchSearch =
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            (f.usedBy?.term_thai ?? "").toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (tab === "images") return f.bucket === "images";
        if (tab === "videos") return f.bucket === "videos";
        if (tab === "orphaned") return f.isOrphaned;
        return true;
    });

    const stats = {
        total: files.length,
        images: files.filter((f) => f.bucket === "images").length,
        videos: files.filter((f) => f.bucket === "videos").length,
        orphaned: files.filter((f) => f.isOrphaned).length,
        totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
    };

    const TABS: { key: Tab; label: string; count: number }[] = [
        { key: "all", label: "ทั้งหมด", count: stats.total },
        { key: "images", label: "🖼 รูปภาพ", count: stats.images },
        { key: "videos", label: "🎬 วิดีโอ", count: stats.videos },
        { key: "orphaned", label: "⚠️ ไม่มีการใช้งาน", count: stats.orphaned },
    ];

    // ── Selection helpers ─────────────────────────────────────────
    const allSelected = filtered.length > 0 && filtered.every((f) => selected.has(f.publicUrl));
    const someSelected = selected.size > 0;

    const toggleSelect = (url: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(url) ? next.delete(url) : next.add(url);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map((f) => f.publicUrl)));
        }
    };

    // ── Single delete ─────────────────────────────────────────────
    const deleteFile = async (file: MediaFile): Promise<boolean> => {
        const token = await getToken();
        const res = await fetch("/api/admin/media", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ bucket: file.bucket, name: file.name }),
        });
        const data = await res.json();
        return data.ok;
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteFile(deleteTarget);
            setFiles((prev) => prev.filter((f) => f.publicUrl !== deleteTarget.publicUrl));
            setDeleteTarget(null);
        } catch (err: any) {
            alert(err.message ?? "ลบไม่สำเร็จ");
        } finally {
            setDeleting(false);
        }
    };

    // ── Bulk delete ───────────────────────────────────────────────
    const handleBulkDelete = async () => {
        setBulkDeleting(true);
        const toDelete = files.filter((f) => selected.has(f.publicUrl));
        const results = await Promise.allSettled(toDelete.map(deleteFile));
        const failed = results.filter((r) => r.status === "rejected").length;

        // Remove successfully deleted from state
        const deletedUrls = new Set(
            toDelete
                .filter((_, i) => results[i].status === "fulfilled")
                .map((f) => f.publicUrl)
        );
        setFiles((prev) => prev.filter((f) => !deletedUrls.has(f.publicUrl)));
        setSelected(new Set());
        setShowBulkConfirm(false);
        setBulkDeleting(false);

        if (failed > 0) alert(`ลบสำเร็จ ${toDelete.length - failed} ไฟล์ · ล้มเหลว ${failed} ไฟล์`);
    };

    // ── Replace ───────────────────────────────────────────────────
    const handleReplace = async () => {
        if (!replaceTarget || !replaceFile) return;
        setReplacing(true);
        try {
            const token = await getToken();
            await fetch("/api/admin/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bucket: replaceTarget.bucket, name: replaceTarget.name }),
            });
            const { error } = await supabase.storage
                .from(replaceTarget.bucket)
                .upload(replaceTarget.name, replaceFile, { upsert: true });
            if (error) throw error;
            await fetchMedia();
            setReplaceTarget(null);
            setReplaceFile(null);
        } catch (err: any) {
            alert(err.message ?? "แทนที่ไม่สำเร็จ");
        } finally {
            setReplacing(false);
        }
    };

    // ── Selected file info ────────────────────────────────────────
    const selectedFiles = files.filter((f) => selected.has(f.publicUrl));
    const selectedOrphanCount = selectedFiles.filter((f) => f.isOrphaned).length;
    const selectedLinkedCount = selectedFiles.filter((f) => !f.isOrphaned).length;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">จัดการสื่อ (Media)</h1>
                <p className="text-gray-500 text-sm">
                    ไฟล์ทั้งหมด {stats.total} ไฟล์ · รวม {formatBytes(stats.totalSize)} ·
                    <span className={stats.orphaned > 0 ? " text-red-500 font-semibold" : " text-green-600"}>
                        {" "}ไม่มีการใช้งาน {stats.orphaned} ไฟล์
                    </span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    { label: "รูปภาพทั้งหมด", value: stats.images, color: "bg-blue-50 border-blue-200 text-blue-700" },
                    { label: "วิดีโอทั้งหมด", value: stats.videos, color: "bg-purple-50 border-purple-200 text-purple-700" },
                    { label: "ขนาดรวม", value: formatBytes(stats.totalSize), color: "bg-gray-50 border-gray-200 text-gray-700" },
                    { label: "ไม่มีการใช้งาน", value: stats.orphaned, color: stats.orphaned > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                        <p className="text-xs mb-1 opacity-70">{s.label}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs + Search + Select-All */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t.label}
                            <span className="ml-1 text-xs opacity-60">({t.count})</span>
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="ค้นหาชื่อไฟล์หรือคำศัพท์..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                    onClick={fetchMedia}
                    className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50 text-gray-600 transition"
                >
                    🔄 รีเฟรช
                </button>
            </div>

            {/* Select-all row */}
            {filtered.length > 0 && (
                <div className="flex items-center gap-3 mb-3 px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">
                            {allSelected ? "ยกเลิกเลือกทั้งหมด" : `เลือกทั้งหมด (${filtered.length})`}
                        </span>
                    </label>
                    {someSelected && (
                        <span className="text-sm font-medium text-indigo-600">
                            เลือกแล้ว {selected.size} ไฟล์
                        </span>
                    )}
                </div>
            )}

            {/* Orphan warning banner */}
            {stats.orphaned > 0 && tab !== "orphaned" && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
                    <span>⚠️ มี {stats.orphaned} ไฟล์ที่ไม่มีการใช้งาน คลิก "ไม่มีการใช้งาน" เพื่อจัดการ</span>
                    <button onClick={() => setTab("orphaned")} className="ml-2 underline text-amber-700 font-medium">ดูทั้งหมด</button>
                </div>
            )}

            {/* File Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">กำลังโหลดไฟล์...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">ไม่พบไฟล์</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map((file) => {
                        const isSelected = selected.has(file.publicUrl);
                        return (
                            <div
                                key={file.publicUrl}
                                className={`relative rounded-xl border overflow-hidden bg-white shadow-sm group transition-all ${isSelected
                                        ? "border-indigo-500 ring-2 ring-indigo-400"
                                        : file.isOrphaned
                                            ? "border-red-300 ring-1 ring-red-200"
                                            : "border-gray-200"
                                    }`}
                            >
                                {/* Checkbox overlay */}
                                <div
                                    className="absolute top-2 left-2 z-20 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.publicUrl); }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelect(file.publicUrl)}
                                        className="w-4 h-4 rounded border-gray-300 accent-indigo-600 shadow cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {/* Orphan badge */}
                                {file.isOrphaned && (
                                    <div className="absolute top-2 left-8 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        ORPHAN
                                    </div>
                                )}

                                {/* Bucket badge */}
                                <div className="absolute top-2 right-2 z-10 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    {file.bucket === "images" ? "IMG" : "VID"}
                                </div>

                                {/* Preview — clicking on it toggles selection */}
                                <div
                                    className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                                    onClick={() => toggleSelect(file.publicUrl)}
                                >
                                    {/* Selected highlight overlay */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none z-10" />
                                    )}
                                    {file.bucket === "images" ? (
                                        <img
                                            src={file.publicUrl}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "";
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <video
                                            src={file.publicUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            playsInline
                                            onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                            onMouseLeave={(e) => {
                                                const v = e.currentTarget as HTMLVideoElement;
                                                v.pause();
                                                v.currentTime = 0;
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-2">
                                    <p className="text-xs font-medium text-gray-800 truncate" title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400">{formatBytes(file.size)}</p>
                                    {file.usedBy && (
                                        <Link
                                            href={`/admin/vocabulary/${file.usedBy.id}/edit`}
                                            className="text-[11px] text-indigo-600 hover:underline truncate block"
                                            title={file.usedBy.term_thai}
                                        >
                                            📝 {file.usedBy.term_thai}
                                        </Link>
                                    )}
                                </div>

                                {/* Per-card Actions */}
                                <div className="flex border-t">
                                    <button
                                        onClick={() => { setReplaceTarget(file); setReplaceFile(null); }}
                                        className="flex-1 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 transition"
                                    >
                                        แทนที่
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(file)}
                                        className="flex-1 py-1.5 text-xs text-red-500 hover:bg-red-50 border-l transition"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Floating Bulk Action Bar ── */}
            {someSelected && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
                    <span className="text-sm font-medium">
                        เลือก <span className="text-indigo-300 font-bold">{selected.size}</span> ไฟล์
                        {selectedLinkedCount > 0 && (
                            <span className="ml-2 text-amber-300 text-xs">(⚠️ {selectedLinkedCount} ลิงก์กับคำศัพท์)</span>
                        )}
                    </span>
                    <button
                        onClick={() => setSelected(new Set())}
                        className="text-sm text-gray-400 hover:text-white transition"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => setShowBulkConfirm(true)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
                    >
                        🗑️ ลบ {selected.size} ไฟล์
                    </button>
                </div>
            )}

            {/* ── Bulk Delete Confirm Modal ── */}
            {showBulkConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
                        <h2 className="text-lg font-bold text-red-600 mb-2">🗑️ ลบ {selected.size} ไฟล์?</h2>
                        {selectedLinkedCount > 0 && (
                            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                ⚠️ <strong>{selectedLinkedCount} ไฟล์</strong>ที่เลือกยังถูกใช้งานโดยคำศัพท์ อยู่
                                การลบจะทำให้สื่อหายจากคำศัพท์นั้น
                            </div>
                        )}
                        <p className="text-sm text-gray-600 mb-4">
                            ไฟล์ที่ลบแล้วไม่สามารถกู้คืนได้ ยืนยันการลบ <strong>{selected.size}</strong> ไฟล์ใช่หรือไม่?
                        </p>

                        {/* Preview strip */}
                        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                            {selectedFiles.slice(0, 8).map((f) => (
                                <div key={f.publicUrl} className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                                    {f.bucket === "images" ? (
                                        <img src={f.publicUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                                    )}
                                </div>
                            ))}
                            {selected.size > 8 && (
                                <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                    +{selected.size - 8}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkConfirm(false)}
                                disabled={bulkDeleting}
                                className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition font-semibold"
                            >
                                {bulkDeleting ? "กำลังลบ..." : "ยืนยันลบทั้งหมด"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
                        <h2 className="text-lg font-bold text-red-600 mb-3">⚠️ ยืนยันการลบไฟล์</h2>
                        {!deleteTarget.isOrphaned && (
                            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                ⚠️ ไฟล์นี้ยังถูกใช้งานโดย <strong>{deleteTarget.usedBy?.term_thai}</strong> การลบจะทำให้สื่อหายไปจากคำศัพท์
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                            {deleteTarget.bucket === "images" ? (
                                <img src={deleteTarget.publicUrl} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center text-2xl">🎬</div>
                            )}
                            <div>
                                <p className="font-medium text-sm">{deleteTarget.name}</p>
                                <p className="text-xs text-gray-400">{formatBytes(deleteTarget.size)}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {deleting ? "กำลังลบ..." : "ยืนยันลบ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Replace Modal */}
            {replaceTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
                        <h2 className="text-lg font-bold mb-3">🔄 แทนที่ไฟล์</h2>
                        <p className="text-sm text-gray-500 mb-1">ไฟล์เดิม:</p>
                        <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded mb-4 truncate">{replaceTarget.name}</p>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition mb-4"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {replaceFile ? (
                                <div>
                                    <p className="text-sm font-medium text-green-600">✅ {replaceFile.name}</p>
                                    <p className="text-xs text-gray-400">{formatBytes(replaceFile.size)}</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-2xl mb-1">📁</p>
                                    <p className="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์ใหม่</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={replaceTarget.bucket === "images" ? "image/*" : "video/*"}
                            onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setReplaceTarget(null); setReplaceFile(null); }}
                                disabled={replacing}
                                className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleReplace}
                                disabled={replacing || !replaceFile}
                                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {replacing ? "กำลังแทนที่..." : "ยืนยันแทนที่"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

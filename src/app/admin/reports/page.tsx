"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import { reportsApi } from "@/lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminReportPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // ── Confirmation modal state ───────────────────────────────────
  const [confirmModal, setConfirmModal] = useState<{ message: string } | null>(null);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  /** Replaces window.confirm() with a styled in-page modal */
  const showConfirm = (message: string): Promise<boolean> =>
    new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfirmModal({ message });
    });

  const handleConfirmOk = () => { setConfirmModal(null); resolveRef.current?.(true); };
  const handleConfirmCancel = () => { setConfirmModal(null); resolveRef.current?.(false); };

  const toggleExpand = (id: string) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getAll();
      const sorted = data.sort((a: any, b: any) =>
        new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
      );
      setReports(sorted);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const ok = await showConfirm("ยืนยันการเปลี่ยนสถานะ?");
    if (!ok) return;
    try {
      await reportsApi.updateStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success("อัปเดตสถานะสำเร็จ");
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const deleteReport = async (id: string) => {
    const ok = await showConfirm("ยืนยันการลบรายการแจ้ปัญหานี้อย่างถาวร?");
    if (!ok) return;
    try {
      if (reportsApi.delete) {
        await reportsApi.delete(id);
      } else if ((reportsApi as any).remove) {
        await (reportsApi as any).remove(id);
      } else {
        toast.error("ยังไม่ได้สร้างฟังก์ชันลบใน reportsApi");
        return;
      }
      setReports(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success("ลบคำร้องเรียนสำเร็จ");
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบ: " + error.message);
    }
  };

  const deleteSelectedReports = async () => {
    if (selectedIds.length === 0) return;
    const ok = await showConfirm(`ยืนยันการลบรายการแจ้ปัญหาจำนวน ${selectedIds.length} รายการอย่างถาวร?`);
    if (!ok) return;
    try {
      const deleteFn = reportsApi.delete || (reportsApi as any).remove;
      if (!deleteFn) {
        toast.error("ยังไม่ได้สร้างฟังก์ชันลบใน reportsApi");
        return;
      }
      await Promise.all(selectedIds.map(id => deleteFn(id)));
      setReports(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success(`ลบ ${selectedIds.length} รายการสำเร็จ`);
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการลบ: " + error.message);
    }
  };

  // กรองเอารายการที่สามารถลบได้ (ที่ไม่ใช่ PENDING)
  const deletableReports = reports.filter(r => r.status !== 'PENDING');
  const isAllSelected = deletableReports.length > 0 && selectedIds.length === deletableReports.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // เลือกเฉพาะรายการที่จัดการแล้ว
      setSelectedIds(deletableReports.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Toast container — sits below the sticky header */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        style={{ top: "4.5rem" }}
      />

      {/* ── Confirmation Modal ──────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-gray-800 font-semibold mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmOk}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">รายการแจ้งปัญหา</h1>

        {selectedIds.length > 0 && (
          <button
            onClick={deleteSelectedReports}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition-colors flex items-center gap-2"
          >
            <span>🗑️ ลบรายการที่เลือก ({selectedIds.length})</span>
          </button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">วันที่</th>
                <th className="px-4 py-3 font-medium text-gray-700">คำศัพท์</th>
                <th className="px-4 py-3 font-medium text-gray-700">ปัญหา</th>
                <th className="px-4 py-3 font-medium text-gray-700">รายละเอียด</th>
                <th className="px-4 py-3 font-medium text-gray-700">สถานะ</th>
                <th className="px-4 py-3 font-medium text-gray-700 w-44">
                  <div className="flex items-center gap-2">
                    <span>จัดการ</span>
                    {/* ย้าย Checkbox เลือกทั้งหมด มาไว้ด้านขวา */}
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                      onChange={handleSelectAll}
                      checked={isAllSelected}
                      disabled={deletableReports.length === 0}
                      title="เลือกทั้งหมด"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className={`hover:bg-gray-50 ${selectedIds.includes(report.id) ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(report.reported_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        href={`/admin/vocabulary/${report.vocabularies?.id}/edit`}
                        className="hover:underline cursor-pointer"
                      >
                        {report.vocabularies?.term_thai || '-'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.problem_type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {report.description ? (
                        <div>
                          <p className={`text-sm leading-relaxed transition-all duration-300 ${expandedIds.has(report.id) ? "" : "line-clamp-2"
                            }`}>
                            {report.description}
                          </p>
                          {report.description.length > 80 && (
                            <button
                              onClick={() => toggleExpand(report.id)}
                              className="text-x text-indigo-500 hover:text-indigo-700 font-medium mt-1 select-none"
                            >
                              {expandedIds.has(report.id) ? "ย่อ ▲" : "ดูทั้งหมด ▼"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {report.status === 'PENDING' ? 'รอตรวจสอบ' :
                          report.status === 'RESOLVED' ? 'แก้ไขแล้ว' : 'ปฏิเสธ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {report.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => updateStatus(report.id, 'RESOLVED')}
                              className="text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                            >
                              เสร็จสิ้น
                            </button>
                            <button
                              onClick={() => updateStatus(report.id, 'REJECTED')}
                              className="text-orange-600 hover:text-orange-800 text-xs font-medium border border-orange-200 px-2 py-1 rounded hover:bg-orange-50"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        ) : (
                          <>
                            {/* ย้ายปุ่มลบมาไว้ด้านซ้าย และ Checkbox ไปด้านขวา */}
                            <button
                              onClick={() => deleteReport(report.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 bg-white"
                            >
                              🗑️ ลบคำร้องเรียน
                            </button>
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                              checked={selectedIds.includes(report.id)}
                              onChange={() => handleSelectOne(report.id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ไม่มีรายการแจ้งปัญหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
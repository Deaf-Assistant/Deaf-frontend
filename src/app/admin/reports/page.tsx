"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import { reportsApi } from "@/lib/api";

export default function AdminReportPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getAll();
      // เรียงจากใหม่ไปเก่า
      const sorted = data.sort((a: any, b: any) => 
        // new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
      );
      setReports(sorted);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!confirm("ยืนยันการเปลี่ยนสถานะ?")) return;
    try {
      await reportsApi.updateStatus(id, status);
      // อัปเดตหน้าจอโดยไม่ต้องโหลดใหม่
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">รายการแจ้งปัญหา</h1>
      
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
                <th className="px-4 py-3 font-medium text-gray-700">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {/* {new Date(report.created_at).toLocaleDateString('th-TH')} */}
                      {new Date(report.reported_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {report.vocabularies?.term_thai || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {report.problem_type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {report.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status === 'PENDING' ? 'รอตรวจสอบ' :
                         report.status === 'RESOLVED' ? 'แก้ไขแล้ว' : 'ปฏิเสธ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {report.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => updateStatus(report.id, 'RESOLVED')}
                            className="text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                          >
                            เสร็จสิ้น
                          </button>
                          <button 
                            onClick={() => updateStatus(report.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      )}
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
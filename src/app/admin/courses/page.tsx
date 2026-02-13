"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import { ROUTES } from "@/lib/constants";
import { coursesApi } from "@/lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; code: string } | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAll();
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("ไม่สามารถโหลดข้อมูลรายวิชาได้");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((c) =>
      `${c.code} ${c.name}`.toLowerCase().includes(query)
    );
  }, [q, courses]);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await coursesApi.delete(deleteConfirm.id);
      setCourses((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      toast.success("ลบรายวิชาสำเร็จ");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} style={{ top: '10%' }} />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">ยืนยันการลบ</h2>
              <p className="text-gray-600 mb-2">
                ต้องการลบรายวิชานี้หรือไม่?
              </p>
              <p className="text-gray-800 font-semibold mb-1">
                {deleteConfirm.code} - {deleteConfirm.name}
              </p>
              <p className="text-red-500 text-sm mb-6">
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  fullWidth
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteConfirm}
                  fullWidth
                  className="!bg-red-500 hover:!bg-red-600"
                >
                  ลบรายวิชา
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการรายวิชา</h1>
            <p className="text-gray-600 mt-1">เพิ่ม/แก้ไข/ลบรายวิชาในระบบ</p>
          </div>

          <div className="flex gap-2">
            <Link href={ROUTES.ADMIN_DASHBOARD}>
              <Button variant="secondary">กลับ Dashboard</Button>
            </Link>
            <Link href="/admin/courses/add">
              <Button>+ เพิ่มรายวิชา</Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="md:w-96">
              <Input
                placeholder="ค้นหารายวิชา (รหัส/ชื่อ)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600">
              แสดง {filtered.length} / {courses.length} รายวิชา
            </p>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    รหัส
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    ชื่อรายวิชา
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                    สร้างเมื่อ
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-8 text-center text-gray-500"
                      colSpan={4}
                    >
                      ไม่พบรายวิชา
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/admin/courses/${c.id}/edit`)
                      }
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{c.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(c.created_at).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentVisibility = c.visibility || 'everyone';
                            let nextVisibility = 'everyone';
                            if (currentVisibility === 'everyone') nextVisibility = 'login';
                            else if (currentVisibility === 'login') nextVisibility = 'admin';

                            coursesApi.update(c.id, { visibility: nextVisibility }).then(() => {
                              setCourses(courses.map(course =>
                                course.id === c.id ? { ...course, visibility: nextVisibility } : course
                              ));
                              toast.success(`เปลี่ยนการมองเห็นเป็น: ${nextVisibility === 'everyone' ? 'สาธารณะ' :
                                  nextVisibility === 'login' ? 'เฉพาะสมาชิก' : 'ผู้ดูแลเท่านั้น'
                                }`);
                            });
                          }}
                          className={`${(c.visibility || 'everyone') === 'everyone' ? '!bg-green-100 !text-green-800 hover:!bg-green-200' :
                              c.visibility === 'login' ? '!bg-yellow-100 !text-yellow-800 hover:!bg-yellow-200' :
                                '!bg-red-100 !text-red-800 hover:!bg-red-200'
                            }`}
                        >
                          {(c.visibility || 'everyone') === 'everyone' ? 'สาธารณะ' :
                            c.visibility === 'login' ? 'เฉพาะสมาชิก' : 'ผู้ดูแล'}
                        </Button>
                        <Link href={`/admin/courses/${c.id}/edit`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" size="sm">
                            แก้ไข
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: c.id, name: c.name, code: c.code });
                          }}
                        >
                          ลบ
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

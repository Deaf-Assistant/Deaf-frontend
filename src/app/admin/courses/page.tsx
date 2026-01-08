"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import { ROUTES } from "@/lib/constants";
import { coursesApi } from "@/lib/api";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]); // เปลี่ยน type เป็น any[] หรือสร้าง interface
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // โหลดข้อมูลเมื่อเข้าหน้าเว็บ
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
      alert("ไม่สามารถโหลดข้อมูลรายวิชาได้");
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

  const onDelete = async (id: string) => {
    if (!confirm("ต้องการลบรายวิชานี้ใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    
    try {
      await coursesApi.delete(id);
      // อัปเดต State โดยเอาตัวที่ลบออกไป
      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("ลบรายวิชาสำเร็จ");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการรายวิชา</h1>
          <p className="text-gray-600 mt-1">
            เพิ่ม/แก้ไข/ลบรายวิชาในระบบ
          </p>
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
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">รหัส</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">ชื่อรายวิชา</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">สร้างเมื่อ</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>
                    ไม่พบรายวิชา
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.code}</td>
                    <td className="px-6 py-4 text-gray-700">{c.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(c.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/courses/${c.id}/edit`}>
                        <Button variant="secondary" size="sm">แก้ไข</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => onDelete(c.id)}>
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
  );
}
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants";

type AdminCourse = {
  id: string;
  code: string;
  name: string;
  termCount: number; // จำนวนคำศัพท์ในวิชานั้น
  updatedAt: string;
};

export default function AdminCoursesPage() {
  // ✅ mock data (แทน backend)
  const [courses, setCourses] = useState<AdminCourse[]>([
    { id: "c1", code: "FA101", name: "ประวัติศาสตร์ศิลป์", termCount: 24, updatedAt: "2025-12-27" },
    { id: "c2", code: "FA202", name: "ศิลปะร่วมสมัย", termCount: 12, updatedAt: "2025-12-20" },
  ]);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((c) =>
      `${c.code} ${c.name}`.toLowerCase().includes(query)
    );
  }, [q, courses]);

  const onDelete = (id: string) => {
    const ok = confirm("ต้องการลบรายวิชานี้ใช่ไหม?");
    if (!ok) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการรายวิชา</h1>
          <p className="text-gray-600 mt-1">
            เพิ่ม/แก้ไข/ลบรายวิชา (ตอนนี้ใช้ mock data ได้ก่อน)
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={ROUTES.ADMIN_DASHBOARD}>
            <Button variant="secondary">กลับ Dashboard</Button>
          </Link>

          {/* ปุ่มนี้จะพาไปหน้า add ถ้าคุณสร้าง route ต่อในอนาคต */}
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
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">รหัส</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">ชื่อรายวิชา</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">คำศัพท์</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">อัปเดตล่าสุด</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={5}>
                    ไม่พบรายวิชาที่ค้นหา
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{c.code}</td>
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.termCount}</td>
                    <td className="px-4 py-3">{c.updatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {/* ปุ่ม edit: ถ้าคุณสร้าง route /admin/courses/[id]/edit ในอนาคต */}
                        <Link href={`/admin/courses/${c.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            แก้ไข
                          </Button>
                        </Link>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(c.id)}
                        >
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border border-yellow-100 bg-yellow-50">
        <p className="text-yellow-900 font-medium">หมายเหตุ</p>
        <p className="text-yellow-800 text-sm mt-1">
          ตอนนี้หน้า Add/Edit ยังอาจยังไม่ได้สร้าง route หากกดแล้ว 404 ให้สร้างต่อ:
          <span className="font-mono"> /admin/courses/add </span> และ
          <span className="font-mono"> /admin/courses/[id]/edit </span>
        </p>
      </Card>
    </div>
  );
}

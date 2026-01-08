"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import { vocabularyApi, coursesApi, chaptersApi } from "@/lib/api";

export default function AdminVocabularyPage() {
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [vocabularies, setVocabularies] = useState<any[]>([]); // ข้อมูลดิบทั้งหมด
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]); // ข้อมูลที่ผ่านการกรองแล้ว

  // ตัวเลือกสำหรับ Filter
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // ค่าที่เลือกปัจจุบัน
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. โหลดข้อมูลเริ่มต้น (คำศัพท์ทั้งหมด + รายวิชา) ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [vocabData, coursesData] = await Promise.all([
          vocabularyApi.getAll(), // ดึงมาทั้งหมด
          coursesApi.getAll(),    // ดึงวิชามาใส่ Dropdown
        ]);
        
        setVocabularies(vocabData || []);
        setFilteredVocabs(vocabData || []); // เริ่มต้นให้แสดงทั้งหมด
        setCourses(coursesData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- 2. โหลดบทเรียน เมื่อเลือกวิชา ---
  useEffect(() => {
    if (!selectedCourse) {
      setChapters([]);
      setSelectedChapter("");
      return;
    }

    const loadChapters = async () => {
      try {
        const data = await chaptersApi.getAll(selectedCourse);
        setChapters(data || []);
        setSelectedChapter(""); // รีเซ็ตบทเรียนเมื่อเปลี่ยนวิชา
      } catch (error) {
        console.error("Failed to load chapters:", error);
      }
    };
    loadChapters();
  }, [selectedCourse]);

  // --- 3. ฟังก์ชันกรองข้อมูล (ทำงานเมื่อค่า Filter เปลี่ยน) ---
  useEffect(() => {
    let result = [...vocabularies];

    // กรองตามวิชา
    if (selectedCourse) {
      result = result.filter((v) => v.course_id === selectedCourse);
    }

    // กรองตามบทเรียน
    if (selectedChapter) {
      result = result.filter((v) => v.chapter_id === selectedChapter);
    }

    // กรองตามคำค้นหา (ไทย/อังกฤษ)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.term_thai?.toLowerCase().includes(q) ||
          v.term_english?.toLowerCase().includes(q)
      );
    }

    setFilteredVocabs(result);
  }, [selectedCourse, selectedChapter, searchQuery, vocabularies]);

  // --- ฟังก์ชันลบ ---
  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบคำศัพท์นี้ใช่ไหม?")) return;
    try {
      await vocabularyApi.delete(id);
      // ลบออกจาก State ทันที ไม่ต้องโหลดใหม่
      setVocabularies((prev) => prev.filter((v) => v.id !== id));
    } catch (error: any) {
      alert("ลบไม่สำเร็จ: " + error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการคำศัพท์ ({filteredVocabs.length})</h1>
        <Link href="/admin/vocabulary/add">
          <Button>+ เพิ่มคำศัพท์</Button>
        </Link>
      </div>

      {/* --- Filter Section --- */}
      <Card className="p-4 bg-gray-50 border border-gray-200">
        <div className="grid md:grid-cols-4 gap-4">
            
            {/* 1. ค้นหา */}
            <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">ค้นหา</label>
                <Input
                    placeholder="พิมพ์คำศัพท์..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* 2. เลือกวิชา */}
            <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">รายวิชา</label>
                <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    <option value="">ทั้งหมด</option>
                    {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.code} - {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 3. เลือกบทเรียน */}
            <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">บทเรียน</label>
                <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedCourse} // ปิดถ้ายังไม่เลือกวิชา
                >
                    <option value="">ทั้งหมด</option>
                    {chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                            {ch.name}
                        </option>
                    ))}
                </select>
            </div>

             {/* ปุ่มรีเซ็ต (Optional) */}
             <div className="md:col-span-1 flex items-end">
                <button 
                    onClick={() => {
                        setSelectedCourse("");
                        setSelectedChapter("");
                        setSearchQuery("");
                    }}
                    className="text-sm text-gray-500 hover:text-blue-600 underline pb-3"
                >
                    ล้างค่าการค้นหา
                </button>
             </div>

        </div>
      </Card>

      {/* --- Table Section --- */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">คำศัพท์ (ไทย)</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">คำศัพท์ (อังกฤษ)</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">รายวิชา</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">บทเรียน</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVocabs.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                    ไม่พบคำศัพท์ที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredVocabs.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{vocab.term_thai}</td>
                    <td className="px-6 py-4 text-gray-700">{vocab.term_english || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vocab.courses?.name || <span className="text-gray-400 italic">ไม่ระบุ</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vocab.chapters?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/vocabulary/${vocab.id}/edit`}>
                        <Button variant="secondary" size="sm">แก้ไข</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(vocab.id)}
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
  );
}
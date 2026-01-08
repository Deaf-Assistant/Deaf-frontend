"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import { coursesApi, chaptersApi } from "@/lib/api"; // อย่าลืม import chaptersApi

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const courseId = id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State ข้อมูลรายวิชา
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: ""
  });

  // State ข้อมูลบทเรียน
  const [chapters, setChapters] = useState<any[]>([]);
  const [newChapterName, setNewChapterName] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterName, setEditChapterName] = useState("");

  // โหลดข้อมูล
  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      // getById ของเราดึง chapters มาด้วยแล้ว (จากที่แก้ api.ts ไป)
      const data = await coursesApi.getById(courseId);
      
      setFormData({
        code: data.code || "",
        name: data.name || "",
        description: data.description || ""
      });

      if (data.chapters) {
        // เรียงตามชื่อ (หรือจะเรียงตาม order ก็ได้ถ้าทำระบบ order)
        const sorted = data.chapters.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setChapters(sorted);
      }

    } catch (error) {
      console.error(error);
      alert("หาข้อมูลรายวิชาไม่เจอ");
      router.push("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  // --- ส่วนบันทึกข้อมูลรายวิชา ---
  const onSaveCourse = async () => {
    if (!formData.code || !formData.name) {
      alert("กรุณากรอกรหัสและชื่อรายวิชา");
      return;
    }

    setSaving(true);
    try {
      await coursesApi.update(courseId, formData);
      alert("บันทึกข้อมูลรายวิชาสำเร็จ");
      // ไม่ต้อง redirect เพื่อให้จัดการบทเรียนต่อได้
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถบันทึกได้"));
    } finally {
      setSaving(false);
    }
  };

  // --- ส่วนจัดการบทเรียน (CRUD) ---
  
  // 1. เพิ่มบทเรียน
  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;
    try {
      const newChapter = await chaptersApi.create({
        name: newChapterName,
        course_id: courseId
      });
      setChapters([...chapters, newChapter]);
      setNewChapterName("");
      alert("เพิ่มบทเรียนสำเร็จ");
    } catch (error: any) {
      console.error(error);
      alert("เพิ่มไม่สำเร็จ: " + error.message);
    }
  };

  // 2. เริ่มแก้ไข
  const startEditing = (chapter: any) => {
    setEditingChapterId(chapter.id);
    setEditChapterName(chapter.name);
  };

  // 3. บันทึกการแก้ไข
  const handleUpdateChapter = async (chapterId: string) => {
    if (!editChapterName.trim()) return;
    try {
      await chaptersApi.update(chapterId, { name: editChapterName });
      
      // อัปเดตใน state
      setChapters(chapters.map(c => c.id === chapterId ? { ...c, name: editChapterName } : c));
      setEditingChapterId(null);
      setEditChapterName("");
    } catch (error: any) {
      console.error(error);
      alert("แก้ไขไม่สำเร็จ: " + error.message);
    }
  };

  // 4. ลบบทเรียน
  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("ต้องการลบบทเรียนนี้? (หากมีคำศัพท์อยู่จะลบไม่ได้ หรือคำศัพท์จะหายไปตามการตั้งค่า DB)")) return;
    try {
      await chaptersApi.delete(chapterId);
      setChapters(chapters.filter(c => c.id !== chapterId));
    } catch (error: any) {
      console.error(error);
      alert("ลบไม่สำเร็จ: " + error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* --- Card 1: ข้อมูลรายวิชา --- */}
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">แก้ไขข้อมูลรายวิชา</h1>
            <Button variant="secondary" onClick={() => router.push("/admin/courses")} size="sm">
                ย้อนกลับ
            </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="รหัสรายวิชา"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
            <Input
              label="ชื่อรายวิชา"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
             <textarea 
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               rows={3}
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
             />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSaveCourse} loading={saving} disabled={saving}>
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </div>
      </Card>

      {/* --- Card 2: จัดการบทเรียน --- */}
      <Card>
        <h2 className="text-xl font-bold mb-4 border-b pb-2">จัดการบทเรียน ({chapters.length})</h2>
        
        {/* ฟอร์มเพิ่มบทเรียน */}
        <div className="flex gap-2 mb-6 bg-gray-50 p-4 rounded-lg">
            <Input 
                placeholder="ชื่อบทเรียนใหม่..." 
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                className="bg-white"
            />
            <Button onClick={handleAddChapter} disabled={!newChapterName.trim()}>
                + เพิ่ม
            </Button>
        </div>

        {/* รายการบทเรียน */}
        <div className="space-y-2">
            {chapters.length === 0 ? (
                <p className="text-center text-gray-500 py-4">ยังไม่มีบทเรียน</p>
            ) : (
                chapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                        {editingChapterId === chapter.id ? (
                            // โหมดแก้ไข
                            <div className="flex items-center gap-2 flex-1 mr-2">
                                <input 
                                    className="flex-1 border rounded px-2 py-1"
                                    value={editChapterName}
                                    onChange={(e) => setEditChapterName(e.target.value)}
                                    autoFocus
                                />
                                <Button size="sm" onClick={() => handleUpdateChapter(chapter.id)} className="bg-green-600 hover:bg-green-700">
                                    บันทึก
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setEditingChapterId(null)}>
                                    ยกเลิก
                                </Button>
                            </div>
                        ) : (
                            // โหมดแสดงผลปกติ
                            <>
                                <span className="font-medium text-gray-800">{chapter.name}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => startEditing(chapter)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                                    >
                                        แก้ไข
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteChapter(chapter.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
      </Card>

    </div>
  );
}
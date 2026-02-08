"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import { coursesApi, chaptersApi } from "@/lib/api";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const courseId = id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [chapters, setChapters] = useState<any[]>([]);
  const [newChapterName, setNewChapterName] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterName, setEditChapterName] = useState("");

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const data = await coursesApi.getById(courseId);

      setFormData({
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",
      });

      if (data.chapters) {
        setChapters(
          [...data.chapters].sort((a: any, b: any) =>
            a.name.localeCompare(b.name),
          ),
        );
      }
    } catch (e) {
      alert("หาข้อมูลรายวิชาไม่เจอ");
      router.push("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  const onSaveCourse = async () => {
    if (!formData.code || !formData.name) {
      alert("กรุณากรอกรหัสและชื่อรายวิชา");
      return;
    }

    setSaving(true);
    try {
      await coursesApi.update(courseId, formData);
      alert("บันทึกข้อมูลรายวิชาสำเร็จ");
    } catch (e: any) {
      alert(e.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleChapterClick = (chapterId: string) => {
    if (editingChapterId) return; // ⛔ กันเผลอกดตอนกำลังแก้
    router.push(
      `/admin/vocabulary?courseId=${courseId}&chapterId=${chapterId}`,
    );
  };

  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;
    const newChapter = await chaptersApi.create({
      name: newChapterName,
      course_id: courseId,
    });
    setChapters([...chapters, newChapter]);
    setNewChapterName("");
  };

  const startEditing = (chapter: any) => {
    setEditingChapterId(chapter.id);
    setEditChapterName(chapter.name);
  };

  const handleUpdateChapter = async (chapterId: string) => {
    if (!editChapterName.trim()) return;
    await chaptersApi.update(chapterId, { name: editChapterName });
    setChapters(
      chapters.map((c) =>
        c.id === chapterId ? { ...c, name: editChapterName } : c,
      ),
    );
    setEditingChapterId(null);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("ยืนยันการลบบทเรียน?")) return;
    await chaptersApi.delete(chapterId);
    setChapters(chapters.filter((c) => c.id !== chapterId));
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <Card>
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">แก้ไขข้อมูลรายวิชา</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/courses")}
          >
            ย้อนกลับ
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="รหัสรายวิชา"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
            <Input
              label="ชื่อรายวิชา"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="flex justify-end">
            <Button onClick={onSaveCourse} loading={saving}>
              บันทึก
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">
          จัดการบทเรียน ({chapters.length})
        </h2>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="ชื่อบทเรียนใหม่"
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
          />
          <Button onClick={handleAddChapter}>เพิ่ม</Button>
        </div>

        <div className="space-y-2">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              {editingChapterId === chapter.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    value={editChapterName}
                    onChange={(e) => setEditChapterName(e.target.value)}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateChapter(chapter.id);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    บันทึก
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChapterId(null);
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              ) : (
                <>
                  {/* ✅ คลิกได้เฉพาะชื่อ */}
                  <span
                    className="font-medium text-gray-800 hover:underline cursor-pointer"
                    onClick={() => handleChapterClick(chapter.id)}
                  >
                    {chapter.name}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chapter);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                      ลบ
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

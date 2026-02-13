"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import VocabularyForm from "@/components/features/VocabularyForm";
import { vocabularyApi } from "@/lib/api";
import { labelTagsApi } from "@/lib/label_api";

// นำเข้า react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // อย่าลืมเพิ่ม CSS

export default function AddVocabularyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [lastCourseChapter, setLastCourseChapter] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);

  // รับค่าจาก URL
  useEffect(() => {
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");

    if (courseId) {
      setLastCourseChapter({
        courseId: courseId,
        chapterId: chapterId || null,
      });
    }
  }, [searchParams]);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const payload = {
        term_thai: formData.termThai,
        term_english: formData.termEnglish,
        definition: formData.definition,
        course_id: formData.courseId,
        chapter_id: formData.chapterId,
        image_url: formData.imageUrl || null,
        image_url2: formData.imageUrl2 || null,
        image_url3: formData.imageUrl3 || null,
        video_url: formData.videoUrl || null,
        fingerspelling_video_url: formData.fingerspellingVideoUrl || null, // ⭐ เพิ่ม
      };

      const newVocab = await vocabularyApi.create(payload);

      // บันทึกหมวดหมู่ที่เลือก
      if (formData.categoryIds && formData.categoryIds.length > 0 && newVocab?.id) {
        for (const categoryId of formData.categoryIds) {
          await labelTagsApi.addToVocabulary(newVocab.id, categoryId);
        }
      }

      // เก็บค่า course และ chapter
      setLastCourseChapter({
        courseId: formData.courseId,
        chapterId: formData.chapterId,
      });

      // Reset ฟอร์ม
      setFormKey((prev) => prev + 1);

      // Refresh cache
      router.refresh();

      // แสดง Snackbar เมื่อเพิ่มคำศัพท์สำเร็จ
      toast.success("เพิ่มคำศัพท์เรียบร้อยแล้ว", {
        position: "top-center", // ตำแหน่งของ Snackbar
        autoClose: 2000, // หายไปหลังจาก 3 วินาที
        hideProgressBar: true, // ซ่อนแถบแสดงความคืบหน้า
        closeOnClick: true, // ให้สามารถคลิกปิดได้
        style: {
          top: "80px", // ปรับตำแหน่งลงมาจากขอบบน 80px
        },
      });
    } catch (error: any) {
      console.error("Create Error:", error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถบันทึกได้"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="max-w-2xl">
        <h1 className="text-xl font-bold mb-4">เพิ่มคำศัพท์ใหม่</h1>
        <VocabularyForm
          key={formKey}
          mode="add"
          onSubmit={onSubmit}
          isSubmitting={loading}
          vocabulary={lastCourseChapter}
        />
      </Card>

      {/* ใส่ ToastContainer ที่นี่เพื่อแสดง Snackbar */}
      <ToastContainer />
    </div>
  );
}

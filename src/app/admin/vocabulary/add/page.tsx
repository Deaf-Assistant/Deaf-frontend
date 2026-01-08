"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import VocabularyForm from "@/components/features/VocabularyForm";
import { vocabularyApi } from "@/lib/api";

export default function AddVocabularyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // รับ data (formData) ที่มาจาก VocabularyForm
const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      // 1. แปลงข้อมูลจาก Form (camelCase) ให้เป็น Database format (snake_case)
      const payload = {
        term_thai: formData.termThai,
        term_english: formData.termEnglish, 
        definition: formData.description,
        course_id: formData.courseId,
        
        // *** จุดสำคัญที่ทำให้เกิด Error ***
        chapter_id: formData.chapterId, // แก้จาก chapterId เป็น chapter_id
        
        video_url: formData.videoUrl || null,
      };

      // 2. ส่ง payload ที่ถูกต้องไป
      await vocabularyApi.create(payload);
      
      alert("เพิ่มคำศัพท์สำเร็จ");
      router.push("/admin/vocabulary"); // หรือ path ที่ต้องการกลับไป
    } catch (error: any) {
      console.error("Create Error:", error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถบันทึกได้"));
    } finally {
      setLoading(false);
    }
};

  return (
    <Card className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">เพิ่มคำศัพท์ใหม่</h1>
      <VocabularyForm mode="add" onSubmit={onSubmit} isSubmitting={loading} />
    </Card>
  );
}
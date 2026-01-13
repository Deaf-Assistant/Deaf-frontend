"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import VocabularyForm from "@/components/features/VocabularyForm";
import { vocabularyApi } from "@/lib/api";

export default function AddVocabularyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [lastCourseChapter, setLastCourseChapter] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);

  // รับค่าจาก URL
  useEffect(() => {
    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');
    
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
        video_url: formData.videoUrl || null,
        fingerspelling_video_url: formData.fingerspellingVideoUrl || null, // ⭐ เพิ่ม
      };

      await vocabularyApi.create(payload);
      
      // เก็บค่า course และ chapter
      setLastCourseChapter({
        courseId: formData.courseId,
        chapterId: formData.chapterId,
      });
      
      // Reset ฟอร์ม
      setFormKey(prev => prev + 1);
      
      // Refresh cache
      router.refresh();
      
      alert("เพิ่มคำศัพท์สำเร็จ");
      
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
      <VocabularyForm 
        key={formKey}
        mode="add" 
        onSubmit={onSubmit} 
        isSubmitting={loading}
        vocabulary={lastCourseChapter}
      />
    </Card>
  );
}
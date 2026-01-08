"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import VocabularyForm from "@/components/features/VocabularyForm";
import { vocabularyApi } from "@/lib/api";

export default function EditVocabularyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vocabulary, setVocabulary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await vocabularyApi.getById(id as string);
      setVocabulary(data);
    } catch (err) {
      alert('ไม่พบข้อมูล');
      router.push('/admin/vocabulary');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันนี้ต้องรับ formData แล้วแปลงเป็น Snake Case (เหมือนหน้า Add)
  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const payload = {
        term_thai: formData.termThai,
        term_english: formData.termEnglish,
        definition: formData.definition,
        course_id: formData.courseId,
        
        // 🔥 จุดสำคัญ: แปลง chapterId -> chapter_id
        chapter_id: formData.chapterId, 
        
        image_url: formData.imageUrl,
        video_url: formData.videoUrl
      };

      await vocabularyApi.update(id as string, payload);
      alert("แก้ไขข้อมูลสำเร็จ");
      router.push("/admin/vocabulary");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Card className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">แก้ไขคำศัพท์</h1>
      <VocabularyForm 
        vocabulary={vocabulary} 
        mode="edit" 
        onSubmit={onSubmit} 
        isSubmitting={saving} 
      />
    </Card>
  );
}
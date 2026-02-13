"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import VocabularyForm from "@/components/features/VocabularyForm";
import { vocabularyApi } from "@/lib/api";
import { labelTagsApi } from "@/lib/label_api";

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

        image_url: formData.imageUrl || null,
        image_url2: formData.imageUrl2 || null,
        image_url3: formData.imageUrl3 || null,
        video_url: formData.videoUrl || null,
        fingerspelling_video_url: formData.fingerspellingVideoUrl || null,
      };

      await vocabularyApi.update(id as string, payload);

      // อัพเดทหมวดหมู่: ลบของเก่าและเพิ่มใหม่
      if (formData.categoryIds) {
        // ดึง categories เดิมที่ผูกกับ vocab นี้
        const existingTags = await labelTagsApi.getByVocabularyId(id as string);

        // ลบอันที่ไม่ได้เลือกแล้ว
        for (const tag of existingTags) {
          if (!formData.categoryIds.includes(tag.id)) {
            await labelTagsApi.removeFromVocabulary(id as string, tag.id);
          }
        }

        // เพิ่มอันที่เลือกใหม่
        for (const categoryId of formData.categoryIds) {
          const alreadyExists = existingTags.some(tag => tag.id === categoryId);
          if (!alreadyExists) {
            await labelTagsApi.addToVocabulary(id as string, categoryId);
          }
        }
      }

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
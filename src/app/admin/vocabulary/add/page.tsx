"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import VocabularyForm from "@/components/features/VocabularyForm";
import { vocabularyApi } from "@/lib/api";

export default function AddVocabularyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await vocabularyApi.create(data);
      alert("เพิ่มคำศัพท์สำเร็จ");
      router.push("/admin/vocabulary");
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">เพิ่มคำศัพท์ใหม่</h1>
      {/* ส่ง isSubmitting ไปเพื่อให้ปุ่มขึ้น loading (ถ้า Form รองรับ) */}
      <VocabularyForm mode="add" onSubmit={onSubmit} isSubmitting={loading} />
    </Card>
  );
}
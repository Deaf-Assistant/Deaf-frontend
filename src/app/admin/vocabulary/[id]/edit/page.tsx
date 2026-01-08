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
  const [vocabulary, setVocabulary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await vocabularyApi.getById(id as string);
      setVocabulary(data);
    } catch (err) {
      console.error(err);
      alert('ไม่พบคำศัพท์หรือเกิดข้อผิดพลาด');
      router.push('/admin/vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await vocabularyApi.update(id as string, data);
      alert(`แก้ไขข้อมูลสำเร็จ`);
      router.push("/admin/vocabulary");
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <div className="flex justify-center py-8">
          <Loading />
        </div>
      </Card>
    );
  }

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
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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    vocabularyApi.getById(id as string)
      .then((data) => setVocabulary(data))
      .catch((err) => {
        console.error(err);
        alert('ไม่พบคำศัพท์หรือเกิดข้อผิดพลาด');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = () => {
    alert(`แก้ไขคำศัพท์ ${id} สำเร็จ (mock)`);
    router.push("/admin/vocabulary");
  };

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <Loading />
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">แก้ไขคำศัพท์</h1>
      <VocabularyForm vocabulary={vocabulary} mode="edit" onSubmit={onSubmit} />
    </Card>
  );
}

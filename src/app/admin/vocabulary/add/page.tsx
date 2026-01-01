"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VocabularyForm from "@/components/features/VocabularyForm";

export default function AddVocabularyPage() {
  const router = useRouter();

  const onSubmit = () => {
    alert("เพิ่มคำศัพท์สำเร็จ (mock)");
    router.push("/admin/vocabulary");
  };

  return (
    <Card className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">เพิ่มคำศัพท์ใหม่</h1>
      <VocabularyForm mode="add" onSubmit={onSubmit} />
    </Card>
  );
}

"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();

  // mock data
  const [code, setCode] = useState("FA101");
  const [name, setName] = useState("ประวัติศาสตร์ศิลป์");

  const onSubmit = () => {
    alert(`แก้ไขรายวิชา ${id} สำเร็จ (mock)`);
    router.push("/admin/courses");
  };

  return (
    <Card className="max-w-xl">
      <h1 className="text-xl font-bold mb-4">แก้ไขรายวิชา</h1>

      <div className="space-y-4">
        <Input
          label="รหัสรายวิชา"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Input
          label="ชื่อรายวิชา"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit}>บันทึกการแก้ไข</Button>
        </div>
      </div>
    </Card>
  );
}

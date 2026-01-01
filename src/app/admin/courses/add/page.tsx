"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AddCoursePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const onSubmit = () => {
    if (!code || !name) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // mock success
    alert("เพิ่มรายวิชาสำเร็จ (mock)");
    router.push("/admin/courses");
  };

  return (
    <Card className="max-w-xl">
      <h1 className="text-xl font-bold mb-4">เพิ่มรายวิชาใหม่</h1>

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
          <Button onClick={onSubmit}>บันทึก</Button>
        </div>
      </div>
    </Card>
  );
}

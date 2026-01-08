"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { coursesApi } from "@/lib/api";

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: ""
  });

  const onSubmit = async () => {
    if (!formData.code || !formData.name) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      await coursesApi.create(formData);
      
      alert("เพิ่มรายวิชาสำเร็จ");
      router.push("/admin/courses");
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถบันทึกได้"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <h1 className="text-xl font-bold mb-4">เพิ่มรายวิชาใหม่</h1>

      <div className="space-y-4">
        <Input
          label="รหัสรายวิชา *"
          value={formData.code}
          onChange={(e) => setFormData({...formData, code: e.target.value})}
          placeholder="เช่น CS101"
        />
        <Input
          label="ชื่อรายวิชา *"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="เช่น Computer Programming"
        />
        
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
           <textarea 
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
             rows={3}
             value={formData.description}
             onChange={(e) => setFormData({...formData, description: e.target.value})}
             placeholder="รายละเอียดวิชาสังเขป..."
           />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => router.back()} disabled={loading}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit} loading={loading} disabled={loading}>
            บันทึก
          </Button>
        </div>
      </div>
    </Card>
  );
}
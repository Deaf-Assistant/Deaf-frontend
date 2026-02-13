"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FileUpload from "@/components/features/FileUpload";
import { coursesApi, uploadApi } from "@/lib/api";
import { FILE_LIMITS } from "@/lib/constants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    image_url: "",
    visibility: "everyone"
  });

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.warning("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image_url;

      // Upload image if selected
      if (imageFile) {
        const { url } = await uploadApi.uploadFile(imageFile, 'image');
        imageUrl = url;
      }

      await coursesApi.create({
        ...formData,
        image_url: imageUrl || null
      });

      toast.success("เพิ่มรายวิชาสำเร็จ");
      setTimeout(() => router.push("/admin/courses"), 1000);
    } catch (error: any) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถบันทึกได้"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} style={{ top: '10%' }} />
      <Card className="max-w-xl">
        <h1 className="text-xl font-bold mb-4">เพิ่มรายวิชาใหม่</h1>

        <div className="space-y-4">
          <Input
            label="รหัสรายวิชา *"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="เช่น CS101"
          />
          <Input
            label="ชื่อรายวิชา *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น Computer Programming"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="รายละเอียดวิชาสังเขป..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">การมองเห็น</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            >
              <option value="everyone">สาธารณะ (เห็นได้ทุกคน)</option>
              <option value="login">เฉพาะสมาชิก (ต้องเข้าสู่ระบบ)</option>
              <option value="admin">เฉพาะผู้ดูแล (admin เท่านั้น)</option>
            </select>
          </div>

          {/* Image Upload */}
          <FileUpload
            label="รูปภาพปกรายวิชา"
            type="image"
            accept={FILE_LIMITS.IMAGE.ACCEPTED.join(',')}
            maxSize={FILE_LIMITS.IMAGE.MAX_SIZE}
            onFileSelect={handleImageSelect}
            preview={imagePreview}
          />

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
    </>
  );
}
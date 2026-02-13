"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/features/FileUpload";
import { coursesApi, uploadApi } from "@/lib/api";
import { FILE_LIMITS } from "@/lib/constants";
import { labelTagsApi } from "@/lib/label_api";
import { LabelTag } from "@/types/label";
import { vocabularyApi } from "@/lib/api";
import Link from "next/link";

async function urlToFile(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

interface VocabularyFormProps {
  vocabulary?: any;
  mode?: "add" | "edit";
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export default function VocabularyForm({
  vocabulary,
  mode = "add",
  onSubmit,
  isSubmitting = false,
}: VocabularyFormProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [categories, setCategories] = useState<LabelTag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // 🔍 autocomplete vocab
  const [allVocabularies, setAllVocabularies] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. กำหนดค่าเริ่มต้น
  const [formData, setFormData] = useState({
    courseId: vocabulary?.course_id || vocabulary?.courseId || "",
    chapterId: vocabulary?.chapter_id || vocabulary?.chapterId || "",
    termThai: vocabulary?.term_thai || vocabulary?.termThai || "",
    termEnglish: vocabulary?.term_english || vocabulary?.termEnglish || "",
    definition: vocabulary?.definition || vocabulary?.description || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imageFile3, setImageFile3] = useState<File | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fingerspellingVideoFile, setFingerspellingVideoFile] =
    useState<File | null>(null); // ⭐ เพิ่ม

  const [imagePreview, setImagePreview] = useState(
    vocabulary?.image_url || vocabulary?.imageUrl || "",
  );
  const [imagePreview2, setImagePreview2] = useState(
    vocabulary?.image_url2 || vocabulary?.imageUrl2 || "",
  );
  const [imagePreview3, setImagePreview3] = useState(
    vocabulary?.image_url3 || vocabulary?.imageUrl3 || "",
  );
  const [videoPreview, setVideoPreview] = useState(
    vocabulary?.video_url || vocabulary?.videoUrl || "",
  );
  const [fingerspellingVideoPreview, setFingerspellingVideoPreview] = useState(
    vocabulary?.fingerspelling_video_url ||
    vocabulary?.fingerspellingVideoUrl ||
    "",
  );

  // Sync กับ vocabulary prop
  useEffect(() => {
    if (vocabulary) {
      console.log("🔄 Vocabulary prop changed:", vocabulary);
      setFormData({
        courseId: vocabulary?.course_id || vocabulary?.courseId || "",
        chapterId: vocabulary?.chapter_id || vocabulary?.chapterId || "",
        termThai: vocabulary?.term_thai || vocabulary?.termThai || "",
        termEnglish: vocabulary?.term_english || vocabulary?.termEnglish || "",
        definition: vocabulary?.definition || vocabulary?.description || "",
      });

      setImagePreview(vocabulary?.image_url || vocabulary?.imageUrl || "");
      setImagePreview2(vocabulary?.image_url2 || vocabulary?.imageUrl2 || "");
      setImagePreview3(vocabulary?.image_url3 || vocabulary?.imageUrl3 || "");
      setVideoPreview(vocabulary?.video_url || vocabulary?.videoUrl || "");
      setFingerspellingVideoPreview(vocabulary?.fingerspelling_video_url || vocabulary?.fingerspellingVideoUrl || "");
    }
  }, [vocabulary]);

  useEffect(() => {
    vocabularyApi.getAll().then(setAllVocabularies).catch(console.error);
  }, []);

  // Load courses and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, categoriesData] = await Promise.all([
          coursesApi.getAll(),
          labelTagsApi.getAll(),
        ]);
        setCourses(coursesData);
        setCategories(categoriesData);

        // If editing, load existing category assignments
        if (mode === "edit" && vocabulary?.id) {
          const existingTags = await labelTagsApi.getByVocabularyId(
            vocabulary.id,
          );
          setSelectedCategories(existingTags.map((tag) => tag.id));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [mode, vocabulary?.id]);

  // Load chapters
  useEffect(() => {
    const loadChapters = async () => {
      if (formData.courseId) {
        try {
          const course = await coursesApi.getById(formData.courseId);
          setChapters(course.chapters || []);
        } catch (error) {
          console.error("Failed to load chapters:", error);
        }
      } else {
        setChapters([]);
      }
    };
    loadChapters();
  }, [formData.courseId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = imagePreview;
      let imageUrl2 = imagePreview2;
      let imageUrl3 = imagePreview3;
      let videoUrl = videoPreview;
      let fingerspellingVideoUrl = fingerspellingVideoPreview; // ⭐ เพิ่ม

      // Upload image 1
      if (imageFile) {
        const uploadResult = await uploadApi.uploadFile(imageFile, "image");
        imageUrl = uploadResult.url;
      }

      // Upload image 2
      if (imageFile2) {
        const uploadResult = await uploadApi.uploadFile(imageFile2, "image");
        imageUrl2 = uploadResult.url;
      }

      // Upload image 3
      if (imageFile3) {
        const uploadResult = await uploadApi.uploadFile(imageFile3, "image");
        imageUrl3 = uploadResult.url;
      }

      // Upload video ภาษามือ
      if (videoFile) {
        const uploadResult = await uploadApi.uploadFile(videoFile, "video");
        videoUrl = uploadResult.url;
      }

      // ⭐ Upload video สะกดคำภาษามือ
      if (fingerspellingVideoFile) {
        const uploadResult = await uploadApi.uploadFile(
          fingerspellingVideoFile,
          "video",
        );
        fingerspellingVideoUrl = uploadResult.url;
      }

      const submitData = {
        ...formData,
        imageUrl,
        imageUrl2,
        imageUrl3,
        videoUrl,
        fingerspellingVideoUrl,
        categoryIds: selectedCategories,
      };

      console.log("Form sending data:", submitData);
      onSubmit(submitData);
    } catch (error: any) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Selection */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          รายวิชา <span className="text-red-500">*</span>
        </label>
        <select
          name="courseId"
          value={formData.courseId}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- เลือกรายวิชา --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter Selection */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          บทเรียน <span className="text-red-500">*</span>
        </label>
        <select
          name="chapterId"
          value={formData.chapterId}
          onChange={handleChange}
          required
          disabled={!formData.courseId}
          className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- เลือกบทเรียน --</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Input
          name="termThai"
          label="คำศัพท์ภาษาไทย"
          value={formData.termThai}
          required
          placeholder="เช่น วิศวกรรมซอฟต์แวร์"
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            const value = e.target.value;

            setFormData((prev) => ({ ...prev, termThai: value }));

            if (!value.trim()) {
              setSuggestions([]);
              return;
            }

            const q = value.toLowerCase();

            const matched = allVocabularies.filter(
              (v) =>
                v.term_thai?.toLowerCase().includes(q) ||
                v.term_english?.toLowerCase().includes(q) ||
                v.labels?.some((l: any) => l.name.toLowerCase().includes(q)),
            );

            setSuggestions(matched.slice(0, 6));
          }}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-white border rounded-lg shadow">
            {suggestions.map((v) => (
              <button
                key={v.id}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={async () => {
                  // 1️⃣ text
                  setFormData({
                    ...formData,
                    termThai: v.term_thai,
                    termEnglish: v.term_english || "",
                    definition: v.definition || "",
                  });

                  // 2️⃣ โหลดหมวดหมู่จาก backend (สำคัญ!)
                  const tags = await labelTagsApi.getByVocabularyId(v.id);
                  setSelectedCategories(tags.map((t) => t.id));

                  // 3️⃣ รูปภาพ
                  if (v.image_url) {
                    const file = await urlToFile(v.image_url, "image.jpg");
                    setImageFile(file);
                    setImagePreview(v.image_url);
                  }
                  if (v.image_url_2) {
                    const file = await urlToFile(v.image_url2, "image2.jpg");
                    setImageFile2(file);
                    setImagePreview2(v.image_url_2);
                  }
                  if (v.image_url_3) {
                    const file = await urlToFile(v.image_url3, "image3.jpg");
                    setImageFile3(file);
                    setImagePreview3(v.image_url_3);
                  }
                  if (v.image_url_2) {
                    const file = await urlToFile(v.image_url2, "image2.jpg");
                    setImageFile2(file);
                    setImagePreview2(v.image_url_2);
                  }
                  if (v.image_url_3) {
                    const file = await urlToFile(v.image_url3, "image3.jpg");
                    setImageFile3(file);
                    setImagePreview3(v.image_url_3);
                  }

                  // 4️⃣ วิดีโอภาษามือ
                  if (v.video_url) {
                    setVideoPreview(v.video_url);
                    setVideoFile(null);
                  }

                  // 5️⃣ วิดีโอสะกดคำ
                  if (v.fingerspelling_video_url) {
                    setFingerspellingVideoPreview(v.fingerspelling_video_url);
                    setFingerspellingVideoFile(null);
                  }

                  setShowSuggestions(false);
                }}
              >
                <div className="font-medium">{v.term_thai}</div>
                {v.term_english && (
                  <div className="text-xs text-gray-500">{v.term_english}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        name="termEnglish"
        label="คำศัพท์ภาษาอังกฤษ"
        value={formData.termEnglish}
        onChange={handleChange}
        placeholder="เช่น Software Engineering"
      />

      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          คำอธิบาย <span className="text-red-500">*</span>
        </label>
        <textarea
          name="definition"
          value={formData.definition}
          onChange={handleChange}
          required
          rows={4}
          placeholder="คำอธิบายสั้นๆ ที่เข้าใจง่าย..."
          className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* หมวดหมู่ (Categories) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-base font-medium text-gray-700">
            หมวดหมู่
          </label>
          <Link
            href="/admin/label"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            เพิ่มหมวดหมู่ใหม่
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[48px]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(cat.id)
                      ? prev.filter((id) => id !== cat.id)
                      : [...prev, cat.id],
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategories.includes(cat.id)
                  ? "ring-2 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
                  }`}
                style={{
                  backgroundColor: `${cat.color}20`,
                  color: cat.color,
                  borderColor: cat.color,
                  ...(selectedCategories.includes(cat.id) && {
                    ringColor: cat.color,
                  }),
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
                {selectedCategories.includes(cat.id) && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            <p>ยังไม่มีหมวดหมู่</p>
            <Link
              href="/admin/label"
              className="text-blue-600 hover:underline text-sm"
            >
              คลิกเพื่อสร้างหมวดหมู่ใหม่
            </Link>
          </div>
        )}
      </div>

      {/* รูปภาพประกอบ 1 */}
      <FileUpload
        type="image"
        accept={FILE_LIMITS.IMAGE.ACCEPTED.join(",")}
        maxSize={FILE_LIMITS.IMAGE.MAX_SIZE}
        label="รูปภาพประกอบ 1 (หลัก)"
        preview={imagePreview}
        onFileSelect={(file) => setImageFile(file)}
      />

      {/* รูปภาพประกอบ 2 */}
      <FileUpload
        type="image"
        accept={FILE_LIMITS.IMAGE.ACCEPTED.join(",")}
        maxSize={FILE_LIMITS.IMAGE.MAX_SIZE}
        label="รูปภาพประกอบ 2 (ถ้ามี)"
        preview={imagePreview2}
        onFileSelect={(file) => setImageFile2(file)}
      />

      {/* รูปภาพประกอบ 3 */}
      <FileUpload
        type="image"
        accept={FILE_LIMITS.IMAGE.ACCEPTED.join(",")}
        maxSize={FILE_LIMITS.IMAGE.MAX_SIZE}
        label="รูปภาพประกอบ 3 (ถ้ามี)"
        preview={imagePreview3}
        onFileSelect={(file) => setImageFile3(file)}
      />

      {/* วิดีโอภาษามือ */}
      <FileUpload
        type="video"
        accept={FILE_LIMITS.VIDEO.ACCEPTED.join(",")}
        maxSize={FILE_LIMITS.VIDEO.MAX_SIZE}
        label="วิดีโอภาษามือ"
        preview={videoPreview}
        onFileSelect={(file) => setVideoFile(file)}
      />

      {/*  วิดีโอสะกดคำภาษามือ  */}
      <FileUpload
        type="video"
        accept={FILE_LIMITS.VIDEO.ACCEPTED.join(",")}
        maxSize={FILE_LIMITS.VIDEO.MAX_SIZE}
        label="วิดีโอสะกดคำภาษามือ"
        preview={fingerspellingVideoPreview}
        onFileSelect={(file) => setFingerspellingVideoFile(file)}
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
        >
          {mode === "add" ? "เพิ่มคำศัพท์" : "อัปเดตคำศัพท์"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
        >
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}

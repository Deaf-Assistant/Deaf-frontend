'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/features/FileUpload';
import { coursesApi, uploadApi } from '@/lib/api';
import { FILE_LIMITS } from '@/lib/constants';

interface VocabularyFormProps {
  vocabulary?: any;
  mode?: 'add' | 'edit';
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export default function VocabularyForm({ 
  vocabulary, 
  mode = 'add', 
  onSubmit,
  isSubmitting = false 
}: VocabularyFormProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // 1. กำหนดค่าเริ่มต้น
  const [formData, setFormData] = useState({
    courseId: vocabulary?.course_id || vocabulary?.courseId || '',
    chapterId: vocabulary?.chapter_id || vocabulary?.chapterId || '',
    termThai: vocabulary?.term_thai || vocabulary?.termThai || '',
    termEnglish: vocabulary?.term_english || vocabulary?.termEnglish || '',
    definition: vocabulary?.definition || vocabulary?.description || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fingerspellingVideoFile, setFingerspellingVideoFile] = useState<File | null>(null); // ⭐ เพิ่ม
  
  const [imagePreview, setImagePreview] = useState(vocabulary?.image_url || vocabulary?.imageUrl || '');
  const [videoPreview, setVideoPreview] = useState(vocabulary?.video_url || vocabulary?.videoUrl || '');
  const [fingerspellingVideoPreview, setFingerspellingVideoPreview] = useState(
    vocabulary?.fingerspelling_video_url || vocabulary?.fingerspellingVideoUrl || ''
  ); 

  // Sync กับ vocabulary prop
  useEffect(() => {
    if (vocabulary) {
      console.log('🔄 Vocabulary prop changed:', vocabulary);
      setFormData({
        courseId: vocabulary?.course_id || vocabulary?.courseId || '',
        chapterId: vocabulary?.chapter_id || vocabulary?.chapterId || '',
        termThai: vocabulary?.term_thai || vocabulary?.termThai || '',
        termEnglish: vocabulary?.term_english || vocabulary?.termEnglish || '',
        definition: vocabulary?.definition || vocabulary?.description || '',
      });
    }
  }, [vocabulary]);

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await coursesApi.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };
    loadCourses();
  }, []);

  // Load chapters
  useEffect(() => {
    const loadChapters = async () => {
      if (formData.courseId) {
        try {
          const course = await coursesApi.getById(formData.courseId);
          setChapters(course.chapters || []);
        } catch (error) {
          console.error('Failed to load chapters:', error);
        }
      } else {
        setChapters([]);
      }
    };
    loadChapters();
  }, [formData.courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = imagePreview;
      let videoUrl = videoPreview;
      let fingerspellingVideoUrl = fingerspellingVideoPreview; // ⭐ เพิ่ม

      // Upload image
      if (imageFile) {
        const uploadResult = await uploadApi.uploadFile(imageFile, 'image');
        imageUrl = uploadResult.url;
      }

      // Upload video ภาษามือ
      if (videoFile) {
        const uploadResult = await uploadApi.uploadFile(videoFile, 'video');
        videoUrl = uploadResult.url;
      }

      // ⭐ Upload video สะกดคำภาษามือ
      if (fingerspellingVideoFile) {
        const uploadResult = await uploadApi.uploadFile(fingerspellingVideoFile, 'video');
        fingerspellingVideoUrl = uploadResult.url;
      }

      const submitData = {
        ...formData,
        imageUrl,
        videoUrl,
        fingerspellingVideoUrl, // ⭐ เพิ่ม
      };

      console.log('Form sending data:', submitData);
      onSubmit(submitData);

    } catch (error: any) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + error.message);
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

      <Input
        name="termThai"
        label="คำศัพท์ภาษาไทย"
        value={formData.termThai}
        onChange={handleChange}
        required
        placeholder="เช่น วิศวกรรมซอฟต์แวร์"
      />

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

      {/* รูปภาพประกอบ */}
      <FileUpload
        type="image"
        accept={FILE_LIMITS.IMAGE.ACCEPTED.join(',')}
        maxSize={FILE_LIMITS.IMAGE.MAX_SIZE}
        label="รูปภาพประกอบ"
        preview={imagePreview}
        onFileSelect={(file) => setImageFile(file)}
      />

      {/* วิดีโอภาษามือ */}
      <FileUpload
        type="video"
        accept={FILE_LIMITS.VIDEO.ACCEPTED.join(',')}
        maxSize={FILE_LIMITS.VIDEO.MAX_SIZE}
        label="วิดีโอภาษามือ"
        preview={videoPreview}
        onFileSelect={(file) => setVideoFile(file)}
      />

      {/*  วิดีโอสะกดคำภาษามือ  */}
      <FileUpload
        type="video"
        accept={FILE_LIMITS.VIDEO.ACCEPTED.join(',')}
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
          {mode === 'add' ? 'เพิ่มคำศัพท์' : 'อัปเดตคำศัพท์'}
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
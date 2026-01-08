'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/features/FileUpload';
import { coursesApi, vocabularyApi, uploadApi } from '@/lib/api';
import { FILE_LIMITS } from '@/lib/constants';
import { Vocabulary } from '@/types';

interface VocabularyFormProps {
  vocabulary?: Vocabulary;
  mode?: 'add' | 'edit';
  onSubmit?: () => void;
}

export default function VocabularyForm({ vocabulary, mode = 'add', onSubmit }: VocabularyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    courseId: vocabulary?.course_id || '',
    chapterId: vocabulary?.chapter_id || '',
    termThai: vocabulary?.term_thai || '',
    termEnglish: vocabulary?.term_english || '',
    definition: vocabulary?.definition || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(vocabulary?.image_url || '');
  const [videoPreview, setVideoPreview] = useState(vocabulary?.video_url || '');

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

  // Load chapters when course changes
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
    setLoading(true);

    try {
      // Upload files if new ones selected
      let imageUrl = imagePreview;
      let videoUrl = videoPreview;

      if (imageFile) {
        const uploadResult = await uploadApi.uploadFile(imageFile, 'image');
        imageUrl = uploadResult.url;
      }

      if (videoFile) {
        const uploadResult = await uploadApi.uploadFile(videoFile, 'video');
        videoUrl = uploadResult.url;
      }

      const data = {
        ...formData,
        imageUrl,
        videoUrl,
      };

      if (mode === 'add') {
        await vocabularyApi.create(data);
        if (onSubmit) {
          onSubmit();
        } else {
          alert('เพิ่มคำศัพท์สำเร็จ');
          router.push('/admin/vocabulary');
          router.refresh();
        }
      } else {
        await vocabularyApi.update(vocabulary!.id, data);
        if (onSubmit) {
          onSubmit();
        } else {
          alert('อัปเดตคำศัพท์สำเร็จ');
          router.push('/admin/vocabulary');
          router.refresh();
        }
      }
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course selection */}
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

      {/* Chapter selection */}
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

      {/* Term Thai */}
      <Input
        name="termThai"
        label="คำศัพท์ภาษาไทย"
        value={formData.termThai}
        onChange={handleChange}
        required
        placeholder="เช่น วิศวกรรมซอฟต์แวร์"
      />

      {/* Term English */}
      <Input
        name="termEnglish"
        label="คำศัพท์ภาษาอังกฤษ"
        value={formData.termEnglish}
        onChange={handleChange}
        placeholder="เช่น Software Engineering"
      />

      {/* Definition */}
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

      {/* Image upload */}
      <FileUpload
        type="image"
        accept={FILE_LIMITS.IMAGE.ACCEPTED.join(',')}
        maxSize={FILE_LIMITS.IMAGE.MAX_SIZE}
        label="รูปภาพประกอบ"
        preview={imagePreview}
        onFileSelect={(file) => setImageFile(file)}
      />

      {/* Video upload */}
      <FileUpload
        type="video"
        accept={FILE_LIMITS.VIDEO.ACCEPTED.join(',')}
        maxSize={FILE_LIMITS.VIDEO.MAX_SIZE}
        label="วิดีโอภาษามือ"
        preview={videoPreview}
        onFileSelect={(file) => setVideoFile(file)}
      />

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
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
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { reportsApi, vocabularyApi, coursesApi, chaptersApi } from "@/lib/api";
import { PROBLEM_TYPES, ROUTES } from "@/lib/constants";
import { auth } from "@/lib/auth";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. เพิ่ม state isMounted ---
  const [isMounted, setIsMounted] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const [formData, setFormData] = useState({
    vocabularyId: searchParams.get("vocabularyId") || "",
    problemType: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // --- 2. set mounted เป็น true เมื่อโหลดเสร็จ ---
    setIsMounted(true);

    if (!auth.isAuthenticated()) {
      // ไม่ต้อง alert ก็ได้ หรือจะ alert ก็แล้วแต่ design
      // alert('กรุณาเข้าสู่ระบบก่อนรายงานปัญหา');
      router.push(ROUTES.LOGIN);
      return;
    }
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [coursesData, vocabData] = await Promise.all([
        coursesApi.getAll(),
        vocabularyApi.getAll(),
      ]);
      setCourses(coursesData || []);
      setVocabularies(vocabData || []);

      const vocabId = searchParams.get("vocabularyId");
      if (vocabId && vocabData) {
        const currentVocab = vocabData.find((v: any) => v.id === vocabId);
        if (currentVocab) {
          setSelectedCourse(currentVocab.course_id || "");
          if (currentVocab.chapter_id) {
            setSelectedChapter(currentVocab.chapter_id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      const fetchChapters = async () => {
        try {
          console.log("Fetching chapters for course:", selectedCourse); // 1. เช็ค ID วิชา
          const data = await chaptersApi.getAll(selectedCourse);
          console.log("Chapters data received:", data); // 2. เช็คข้อมูลที่ได้
          setChapters(data || []);
        } catch (error) {
          console.error("Failed to load chapters:", error);
        }
      };
      fetchChapters();
    } else {
      setChapters([]);
      setSelectedChapter("");
    }
  }, [selectedCourse]);

  useEffect(() => {
    let filtered = vocabularies;
    if (selectedCourse) {
      filtered = filtered.filter((v: any) => v.course_id === selectedCourse);
    }
    if (selectedChapter) {
      filtered = filtered.filter((v: any) => v.chapter_id === selectedChapter);
    }
    setFilteredVocabs(filtered);

    const isStillInList = filtered.some(
      (v: any) => v.id === formData.vocabularyId
    );
    if (
      !isStillInList &&
      !searchParams.get("vocabularyId") &&
      formData.vocabularyId
    ) {
      if (vocabularies.length > 0) {
        setFormData((prev) => ({ ...prev, vocabularyId: "" }));
      }
    }
  }, [selectedCourse, selectedChapter, vocabularies]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vocabularyId) newErrors.vocabularyId = "กรุณาเลือกคำศัพท์";
    if (!formData.problemType) newErrors.problemType = "กรุณาเลือกประเภทปัญหา";
    if (!formData.description.trim()) {
      newErrors.description = "กรุณากรอกรายละเอียดปัญหา";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = auth.getUser();
      await reportsApi.create({
        vocabulary_id: formData.vocabularyId,
        problem_type: formData.problemType,
        description: formData.description,
        reported_by: user?.id || null,
      });

      alert("ส่งรายงานสำเร็จ!");
      router.push(ROUTES.VOCABULARY);
    } catch (error: any) {
      console.error("Report Error Details:", JSON.stringify(error, null, 2));
      setErrors({
        form:
          "ส่งรายงานไม่สำเร็จ: " +
          (error.message || error.details || "โปรดลองใหม่อีกครั้ง"),
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. แก้ไขจุดที่ Return null ---
  // ถ้ายังไม่ Mount (Server side หรือเพิ่งเริ่มโหลด) ให้ return null ไปเลย
  if (!isMounted) return null;

  // หลังจาก Mount แล้วค่อยเช็ค Auth
  if (!auth.isAuthenticated()) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              รายงานปัญหา
            </h1>
            <p className="text-lg text-gray-600">
              พบข้อผิดพลาดเกี่ยวกับคำศัพท์? แจ้งให้เราทราบได้ที่นี่
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <span className="text-base">{errors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* เลือกรายวิชา */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    เลือกรายวิชา
                  </label>
                  <select
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setSelectedChapter("");
                    }}
                  >
                    <option value="">-- ทุกวิชา --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* เลือกบทเรียน */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    เลือกบทเรียน
                  </label>
                  <select
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedCourse || chapters.length === 0}
                  >
                    <option value="">-- ทุกบทเรียน --</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* เลือกคำศัพท์ */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  คำศัพท์ที่พบปัญหา <span className="text-red-500">*</span>
                </label>
                <select
                  name="vocabularyId"
                  value={formData.vocabularyId}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-base border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vocabularyId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- เลือกคำศัพท์ --</option>
                  {filteredVocabs.map((vocab) => (
                    <option key={vocab.id} value={vocab.id}>
                      {vocab.term_thai}{" "}
                      {vocab.term_english ? `(${vocab.term_english})` : ""}
                    </option>
                  ))}
                  {filteredVocabs.length === 0 && (
                    <option value="" disabled>
                      ไม่พบคำศัพท์ในเงื่อนไขที่เลือก
                    </option>
                  )}
                </select>
                {errors.vocabularyId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vocabularyId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  ประเภทปัญหา <span className="text-red-500">*</span>
                </label>
                <select
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-base border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.problemType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- เลือกประเภทปัญหา --</option>
                  {PROBLEM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  รายละเอียดปัญหา <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="อธิบายปัญหาที่พบ..."
                  className={`w-full px-4 py-2.5 text-base border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  ส่งรายงาน
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}

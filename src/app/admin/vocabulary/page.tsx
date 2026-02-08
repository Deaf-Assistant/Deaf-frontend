// "use client";
// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Card from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
// import Loading from "@/components/ui/Loading";
// import { vocabularyApi, coursesApi, chaptersApi } from "@/lib/api";

// export default function AdminVocabularyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams(); // ใช้ useSearchParams เพื่อดึงค่าจาก URL

//   // --- States ---
//   const [loading, setLoading] = useState(true);
//   const [vocabularies, setVocabularies] = useState<any[]>([]);
//   const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);

//   // ตัวเลือกสำหรับ Filter
//   const [courses, setCourses] = useState<any[]>([]);
//   const [chapters, setChapters] = useState<any[]>([]);

//   // ค่าที่เลือกปัจจุบัน
//   const [selectedCourse, setSelectedCourse] = useState<string>("");
//   const [selectedChapter, setSelectedChapter] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState("");

//   // ✨ ฟังก์ชัน reload ข้อมูล
//   const loadVocabularies = async () => {
//     try {
//       const vocabData = await vocabularyApi.getAll();
//       setVocabularies(vocabData || []);
//       setFilteredVocabs(vocabData || []);
//     } catch (error) {
//       console.error("Failed to load vocabularies:", error);
//     }
//   };

//   // --- 1. โหลดข้อมูลเริ่มต้น ---
//   useEffect(() => {
//     const initData = async () => {
//       try {
//         setLoading(true);
//         const [vocabData, coursesData] = await Promise.all([
//           vocabularyApi.getAll(),
//           coursesApi.getAll(),
//         ]);
//         setVocabularies(vocabData || []);
//         setFilteredVocabs(vocabData || []);
//         setCourses(coursesData || []);
//       } catch (error) {
//         console.error("Failed to load data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     initData();
//   }, []);

//   // --- ตรวจสอบพารามิเตอร์ใน URL และโหลด chapters ---
// useEffect(() => {
//   const courseId = searchParams.get("courseId");
//   const chapterId = searchParams.get("chapterId");

//   if (courseId && courseId !== selectedCourse) {
//     setSelectedCourse(courseId);
    
//     // โหลด chapters และเซ็ต chapter ที่เลือก
//     const loadData = async () => {
//       try {
//         const data = await chaptersApi.getAll(courseId);
//         setChapters(data || []);
        
//         // เซ็ต chapter หลังจากโหลดเสร็จ
//         if (chapterId) {
//           setSelectedChapter(chapterId);
//         } else {
//           setSelectedChapter("");
//         }
//       } catch (error) {
//         console.error("Failed to load chapters:", error);
//       }
//     };
//     loadData();
//   }
// }, [searchParams]);

// // --- โหลดบทเรียนเมื่อเลือกวิชาแบบปกติ (ไม่ใช่จาก URL) ---
// useEffect(() => {
//   // ถ้ามาจาก URL ให้ข้าม
//   if (searchParams.get("courseId")) return;

//   if (!selectedCourse) {
//     setChapters([]);
//     setSelectedChapter("");
//     return;
//   }

//   const loadChapters = async () => {
//     try {
//       const data = await chaptersApi.getAll(selectedCourse);
//       setChapters(data || []);
//       setSelectedChapter("");
//     } catch (error) {
//       console.error("Failed to load chapters:", error);
//     }
//   };
//   loadChapters();
// }, [selectedCourse]);

//   // --- 3. ฟังก์ชันกรองข้อมูล ---
//   useEffect(() => {
//     let result = [...vocabularies];

//     if (selectedCourse) {
//       result = result.filter((v) => v.course_id === selectedCourse);
//     }

//     if (selectedChapter) {
//       result = result.filter((v) => v.chapter_id === selectedChapter);
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       result = result.filter(
//         (v) =>
//           v.term_thai?.toLowerCase().includes(q) ||
//           v.term_english?.toLowerCase().includes(q)
//       );
//     }

//     setFilteredVocabs(result);
//   }, [selectedCourse, selectedChapter, searchQuery, vocabularies]);

//   // --- ฟังก์ชันลบ + Refresh ---
//   const handleDelete = async (id: string) => {
//     if (!confirm("ต้องการลบคำศัพท์นี้ใช่ไหม?")) return;

//     try {
//       await vocabularyApi.delete(id);
      
//       // ✨ ลบออกจาก State ทันที
//       setVocabularies((prev) => prev.filter((v) => v.id !== id));
      
//       // ✨ Refresh cache
//       router.refresh();
      
//     } catch (error: any) {
//       alert("ลบไม่สำเร็จ: " + error.message);
//     }
//   };

//   if (loading) return <Loading />;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">จัดการคำศัพท์ ({filteredVocabs.length})</h1>
//         <Link
//           href={
//             selectedCourse
//               ? `/admin/vocabulary/add?courseId=${selectedCourse}${selectedChapter ? `&chapterId=${selectedChapter}` : ""}`
//               : "/admin/vocabulary/add"
//           }
//         >
//           <Button>+ เพิ่มคำศัพท์</Button>
//         </Link>
//       </div>

//       {/* --- Filter Section --- */}
//       <Card className="p-4 bg-gray-50 border border-gray-200">
//         <div className="grid md:grid-cols-4 gap-4">
//           {/* 1. ค้นหา */}
//           <div className="md:col-span-1">
//             <label className="text-sm font-medium text-gray-700 block mb-1">ค้นหา</label>
//             <Input
//               placeholder="พิมพ์คำศัพท์..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {/* 2. เลือกวิชา */}
//           <div className="md:col-span-1">
//             <label className="text-sm font-medium text-gray-700 block mb-1">รายวิชา</label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
//               value={selectedCourse}
//               onChange={(e) => setSelectedCourse(e.target.value)}
//             >
//               <option value="">ทั้งหมด</option>
//               {courses.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {c.code} - {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 3. เลือกบทเรียน */}
//           <div className="md:col-span-1">
//             <label className="text-sm font-medium text-gray-700 block mb-1">บทเรียน</label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
//               value={selectedChapter}
//               onChange={(e) => setSelectedChapter(e.target.value)}
//               disabled={!selectedCourse}
//             >
//               <option value="">ทั้งหมด</option>
//               {chapters.map((ch) => (
//                 <option key={ch.id} value={ch.id}>
//                   {ch.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* ปุ่มรีเซ็ต */}
//           <div className="md:col-span-1 flex items-end">
//             <button
//               onClick={() => {
//                 setSelectedCourse("");
//                 setSelectedChapter("");
//                 setSearchQuery("");
//               }}
//               className="text-sm text-gray-500 hover:text-blue-600 underline pb-3"
//             >
//               ล้างค่าการค้นหา
//             </button>
//           </div>
//         </div>
//       </Card>

//       {/* --- Table Section --- */}
//       <Card className="p-0 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-gray-100 border-b">
//               <tr>
//                 <th className="px-6 py-3 text-sm font-semibold text-gray-700">คำศัพท์ (ไทย)</th>
//                 <th className="px-6 py-3 text-sm font-semibold text-gray-700">คำศัพท์ (อังกฤษ)</th>
//                 <th className="px-6 py-3 text-sm font-semibold text-gray-700">รายวิชา</th>
//                 <th className="px-6 py-3 text-sm font-semibold text-gray-700">บทเรียน</th>
//                 <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">จัดการ</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filteredVocabs.length === 0 ? (
//                 <tr>
//                   <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
//                     ไม่พบคำศัพท์ที่ค้นหา
//                   </td>
//                 </tr>
//               ) : (
//                 filteredVocabs.map((vocab) => (
//                   <tr key={vocab.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4 font-medium text-gray-900">{vocab.term_thai}</td>
//                     <td className="px-6 py-4 text-gray-700">{vocab.term_english || "-"}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {vocab.courses?.name || <span className="text-gray-400 italic">ไม่ระบุ</span>}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {vocab.chapters?.name || "-"}
//                     </td>
//                     <td className="px-6 py-4 text-right space-x-2">
//                       <Link href={`/admin/vocabulary/${vocab.id}/edit`}>
//                         <Button variant="secondary" size="sm">แก้ไข</Button>
//                       </Link>
//                       <Button 
//                         variant="danger" 
//                         size="sm" 
//                         onClick={() => handleDelete(vocab.id)}
//                       >
//                         ลบ
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </Card>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import { vocabularyApi, coursesApi, chaptersApi } from "@/lib/api";

export default function AdminVocabularyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);

  // State สำหรับเก็บ ID ที่ถูกเลือก
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // ตัวเลือกสำหรับ Filter
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // ค่าที่เลือกปัจจุบัน
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. โหลดข้อมูลเริ่มต้น ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [vocabData, coursesData] = await Promise.all([
          vocabularyApi.getAll(),
          coursesApi.getAll(),
        ]);
        setVocabularies(vocabData || []);
        setFilteredVocabs(vocabData || []);
        setCourses(coursesData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- โหลด chapters ตาม URL หรือ State ---
  useEffect(() => {
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");

    if (courseId && courseId !== selectedCourse) {
      setSelectedCourse(courseId);
      const loadData = async () => {
        try {
          const data = await chaptersApi.getAll(courseId);
          setChapters(data || []);
          if (chapterId) setSelectedChapter(chapterId);
          else setSelectedChapter("");
        } catch (error) {
          console.error("Failed to load chapters:", error);
        }
      };
      loadData();
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("courseId")) return;
    if (!selectedCourse) {
      setChapters([]);
      setSelectedChapter("");
      return;
    }
    const loadChapters = async () => {
      try {
        const data = await chaptersApi.getAll(selectedCourse);
        setChapters(data || []);
        setSelectedChapter("");
      } catch (error) {
        console.error("Failed to load chapters:", error);
      }
    };
    loadChapters();
  }, [selectedCourse]);

  // --- 3. ฟังก์ชันกรองข้อมูล ---
  useEffect(() => {
    let result = [...vocabularies];

    if (selectedCourse) {
      result = result.filter((v) => v.course_id === selectedCourse);
    }

    if (selectedChapter) {
      result = result.filter((v) => v.chapter_id === selectedChapter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.term_thai?.toLowerCase().includes(q) ||
          v.term_english?.toLowerCase().includes(q)
      );
    }

    setFilteredVocabs(result);
    // Reset selection เมื่อมีการ filter เปลี่ยน
    setSelectedIds([]);
  }, [selectedCourse, selectedChapter, searchQuery, vocabularies]);

  // --- Logic การเลือก Checkbox ---

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredVocabs.map((v) => v.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // --- ฟังก์ชันลบหลายรายการ ---
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `คุณต้องการลบคำศัพท์ที่เลือกจำนวน ${selectedIds.length} รายการใช่หรือไม่?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await Promise.all(selectedIds.map((id) => vocabularyApi.delete(id)));

      setVocabularies((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
      setSelectedIds([]);
      router.refresh();
      alert("ลบข้อมูลสำเร็จเรียบร้อยแล้ว");
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบคำศัพท์นี้ใช่ไหม?")) return;
    try {
      await vocabularyApi.delete(id);
      setVocabularies((prev) => prev.filter((v) => v.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      router.refresh();
    } catch (error: any) {
      alert("ลบไม่สำเร็จ: " + error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          จัดการคำศัพท์ ({filteredVocabs.length})
        </h1>
        
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button 
              variant="danger" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "กำลังลบ..." : `ลบที่เลือก (${selectedIds.length})`}
            </Button>
          )}

          <Link
            href={
              selectedCourse
                ? `/admin/vocabulary/add?courseId=${selectedCourse}${
                    selectedChapter ? `&chapterId=${selectedChapter}` : ""
                  }`
                : "/admin/vocabulary/add"
            }
          >
            <Button>+ เพิ่มคำศัพท์</Button>
          </Link>
        </div>
      </div>

      {/* --- Filter Section --- */}
      <Card className="p-4 bg-gray-50 border border-gray-200">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">ค้นหา</label>
            <Input
              placeholder="พิมพ์คำศัพท์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">รายวิชา</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 block mb-1">บทเรียน</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">ทั้งหมด</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              onClick={() => {
                setSelectedCourse("");
                setSelectedChapter("");
                setSearchQuery("");
                setSelectedIds([]);
              }}
              className="text-sm text-gray-500 hover:text-blue-600 underline pb-3"
            >
              ล้างค่าการค้นหา
            </button>
          </div>
        </div>
      </Card>

      {/* --- Table Section --- */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                {/* เอา Column Checkbox ด้านซ้ายออกไปแล้ว */}
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  คำศัพท์ (ไทย)
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  คำศัพท์ (อังกฤษ)
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  รายวิชา
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">
                  บทเรียน
                </th>
                {/* ✨ ย้าย Checkbox Select All มาไว้ Header ขวาสุด */}
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 text-right min-w-[160px]">
                   <div className="flex items-center justify-end gap-2">
                     <span className="text-xs text-gray-500 font-normal">เลือกทั้งหมด</span>
                     <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={
                        filteredVocabs.length > 0 &&
                        selectedIds.length === filteredVocabs.length
                      }
                    />
                   </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVocabs.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                    ไม่พบคำศัพท์ที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredVocabs.map((vocab) => {
                  const isSelected = selectedIds.includes(vocab.id);
                  return (
                    <tr
                      key={vocab.id}
                      className={`hover:bg-gray-50 transition ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {vocab.term_thai}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {vocab.term_english || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {vocab.courses?.name || (
                          <span className="text-gray-400 italic">ไม่ระบุ</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {vocab.chapters?.name || "-"}
                      </td>
                      
                      {/* ✨ Column จัดการ: รวมปุ่ม Checkbox ไว้ที่นี่ */}
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-3">
                           {/* ✨ Logic: ถ้าไม่ได้เลือก (isSelected = false) ให้โชว์ปุ่ม */}
                           {/* แต่ถ้าเลือกอยู่ (isSelected = true) ให้ซ่อนปุ่ม เพื่อลดรกตา */}
                           {!isSelected && (
                             <>
                                <Link href={`/admin/vocabulary/${vocab.id}/edit`}>
                                  <Button variant="secondary" size="sm">
                                    แก้ไข
                                  </Button>
                                </Link>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(vocab.id)}
                                >
                                  ลบ
                                </Button>
                             </>
                           )}

                           {/* Checkbox ประจำแถว */}
                           <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              checked={isSelected}
                              onChange={() => handleSelectOne(vocab.id)}
                            />
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
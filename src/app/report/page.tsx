// 'use client'

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// import Button from '@/components/ui/Button';
// import { reportsApi, vocabularyApi } from '@/lib/api';
// import { PROBLEM_TYPES, ROUTES } from '@/lib/constants';
// import { auth } from '@/lib/auth';

// export default function ReportPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [vocabularies, setVocabularies] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     vocabularyId: searchParams.get('vocabularyId') || '',
//     problemType: '',
//     description: '',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (!auth.isAuthenticated()) {
//       alert('กรุณาเข้าสู่ระบบก่อนรายงานปัญหา');
//       router.push(ROUTES.LOGIN);
//       return;
//     }
//     loadVocabularies();
//   }, []);

//   const loadVocabularies = async () => {
//     try {
//       const data = await vocabularyApi.getAll();
//       setVocabularies(data);
//     } catch (error) {
//       console.error('Failed to load vocabularies:', error);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     if (errors[e.target.name]) {
//       setErrors({ ...errors, [e.target.name]: '' });
//     }
//   };

//   const validate = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.vocabularyId) {
//       newErrors.vocabularyId = 'กรุณาเลือกคำศัพท์';
//     }

//     if (!formData.problemType) {
//       newErrors.problemType = 'กรุณาเลือกประเภทปัญหา';
//     }

//     if (!formData.description.trim()) {
//       newErrors.description = 'กรุณากรอกรายละเอียดปัญหา';
//     } else if (formData.description.trim().length < 10) {
//       newErrors.description = 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       await reportsApi.create(formData);
//       alert('ส่งรายงานสำเร็จ! ขอบคุณที่แจ้งปัญหา');
      
//       // Reset form
//       setFormData({
//         vocabularyId: '',
//         problemType: '',
//         description: '',
//       });
      
//       router.push(ROUTES.VOCABULARY);
//     } catch (error: any) {
//       setErrors({ form: error.message || 'ส่งรายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!auth.isAuthenticated()) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 bg-gray-50 py-8">
//         <div className="container mx-auto px-4 max-w-2xl">
//           {/* Header */}
//           <div className="mb-8 text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
//               <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">รายงานปัญหา</h1>
//             <p className="text-lg text-gray-600">
//               พบข้อผิดพลาดหรือปัญหาเกี่ยวกับคำศัพท์? แจ้งให้เราทราบได้ที่นี่
//             </p>
//           </div>

//           {/* Form */}
//           <div className="bg-white rounded-2xl shadow-lg p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {errors.form && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//                   <div className="flex items-center">
//                     <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                     <span className="text-base">{errors.form}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Vocabulary Selection */}
//               <div>
//                 <label className="block text-base font-medium text-gray-700 mb-2">
//                   คำศัพท์ที่พบปัญหา <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="vocabularyId"
//                   value={formData.vocabularyId}
//                   onChange={handleChange}
//                   required
//                   className={`w-full px-4 py-2.5 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     errors.vocabularyId ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">-- เลือกคำศัพท์ --</option>
//                   {vocabularies.map((vocab) => (
//                     <option key={vocab.id} value={vocab.id}>
//                       {vocab.termThai} {vocab.termEnglish ? `(${vocab.termEnglish})` : ''} - {vocab.courseName || 'ไม่ระบุวิชา'}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.vocabularyId && (
//                   <p className="mt-1 text-sm text-red-600">{errors.vocabularyId}</p>
//                 )}
//               </div>

//               {/* Problem Type */}
//               <div>
//                 <label className="block text-base font-medium text-gray-700 mb-2">
//                   ประเภทปัญหา <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="problemType"
//                   value={formData.problemType}
//                   onChange={handleChange}
//                   required
//                   className={`w-full px-4 py-2.5 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                     errors.problemType ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 >
//                   <option value="">-- เลือกประเภทปัญหา --</option>
//                   {PROBLEM_TYPES.map((type) => (
//                     <option key={type} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.problemType && (
//                   <p className="mt-1 text-sm text-red-600">{errors.problemType}</p>
//                 )}
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-base font-medium text-gray-700 mb-2">
//                   รายละเอียดปัญหา <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                   rows={6}
//                   placeholder="โปรดอธิบายปัญหาที่พบอย่างละเอียด เช่น&#10;- คำศัพท์สะกดผิด&#10;- วิดีโอไม่ชัด ไม่สามารถเห็นท่าทางได้&#10;- คำอธิบายไม่ตรงกับคำศัพท์&#10;- ภาษามือไม่ถูกต้อง&#10;- อื่นๆ (โปรดระบุ)"
//                   className={`w-full px-4 py-2.5 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
//                     errors.description ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.description && (
//                   <p className="mt-1 text-sm text-red-600">{errors.description}</p>
//                 )}
//                 <p className="mt-1 text-sm text-gray-500">
//                   อย่างน้อย 10 ตัวอักษร ({formData.description.length} ตัวอักษร)
//                 </p>
//               </div>

//               {/* Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-4">
//                 <Button
//                   type="submit"
//                   size="lg"
//                   loading={loading}
//                   disabled={loading}
//                   className="flex-1"
//                 >
//                   <span className="flex items-center justify-center">
//                     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                     </svg>
//                     ส่งรายงาน
//                   </span>
//                 </Button>

//                 <Button
//                   type="button"
//                   variant="secondary"
//                   size="lg"
//                   onClick={() => router.back()}
//                   className="flex-1"
//                 >
//                   ยกเลิก
//                 </Button>
//               </div>
//             </form>
//           </div>

//           {/* Info Card */}
//           <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
//             <div className="flex items-start">
//               <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//               </svg>
//               <div className="text-base text-blue-800">
//                 <p className="font-semibold mb-2">หมายเหตุ</p>
//                 <ul className="space-y-1 list-disc list-inside">
//                   <li>รายงานของคุณจะถูกส่งไปยังทีมงานเพื่อตรวจสอบและแก้ไข</li>
//                   <li>เราจะดำเนินการแก้ไขโดยเร็วที่สุด</li>
//                   <li>ข้อมูลที่คุณส่งจะช่วยพัฒนาระบบให้ดีขึ้น</li>
//                   <li>หากมีคำถามเพิ่มเติม กรุณาติดต่อทีมงาน</li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* Guidelines */}
//           <div className="mt-6 bg-white rounded-xl shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">แนวทางการรายงานปัญหาที่ดี</h3>
//             <div className="space-y-3 text-base text-gray-700">
//               <div className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//                 <span>ระบุปัญหาอย่างชัดเจนและละเอียด</span>
//               </div>
//               <div className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//                 <span>ให้ตัวอย่างหรือสถานการณ์ที่พบปัญหา</span>
//               </div>
//               <div className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//                 <span>เลือกประเภทปัญหาให้ตรงกับสิ่งที่พบ</span>
//               </div>
//               <div className="flex items-start">
//                 <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//                 <span>ใช้ภาษาที่สุภาพและเข้าใจง่าย</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }
'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { reportsApi, vocabularyApi, coursesApi } from '@/lib/api';
import { PROBLEM_TYPES, ROUTES } from '@/lib/constants';
import { auth } from '@/lib/auth';

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  const [formData, setFormData] = useState({
    vocabularyId: searchParams.get('vocabularyId') || '',
    problemType: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      alert('กรุณาเข้าสู่ระบบก่อนรายงานปัญหา');
      router.push(ROUTES.LOGIN);
      return;
    }
    loadInitialData();
  }, []);

  // โหลดข้อมูลวิชาและคำศัพท์ทั้งหมด
  const loadInitialData = async () => {
    try {
      const [coursesData, vocabData] = await Promise.all([
        coursesApi.getAll(),
        vocabularyApi.getAll()
      ]);
      setCourses(coursesData);
      setVocabularies(vocabData);
      setFilteredVocabs(vocabData);

      // ถ้ามี vocabularyId ส่งมาจากหน้าอื่น ให้เลือกวิชาให้ivอัตโนมัติ
      const vocabId = searchParams.get('vocabularyId');
      if (vocabId && vocabData.length > 0) {
        const currentVocab = vocabData.find((v: any) => v.id === vocabId);
        if (currentVocab) {
          setSelectedCourse(currentVocab.course_id || '');
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // กรองคำศัพท์เมื่อเลือกวิชาเปลี่ยนไป
  useEffect(() => {
    if (selectedCourse) {
      const filtered = vocabularies.filter((v: any) => v.course_id === selectedCourse);
      setFilteredVocabs(filtered);
      
      // ถ้าคำศัพท์ที่เลือกอยู่ไม่ได้อยู่ในวิชานี้ ให้ล้างค่าที่เลือกไว้
      const isStillInList = filtered.some((v: any) => v.id === formData.vocabularyId);
      if (!isStillInList && !searchParams.get('vocabularyId')) {
        setFormData(prev => ({ ...prev, vocabularyId: '' }));
      }
    } else {
      setFilteredVocabs(vocabularies);
    }
  }, [selectedCourse, vocabularies]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vocabularyId) newErrors.vocabularyId = 'กรุณาเลือกคำศัพท์';
    if (!formData.problemType) newErrors.problemType = 'กรุณาเลือกประเภทปัญหา';
    if (!formData.description.trim()) {
      newErrors.description = 'กรุณากรอกรายละเอียดปัญหา';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  try {
    const user = auth.getUser(); // ถ้าไม่ได้ login ค่าจะเป็น null
    await reportsApi.create({
      vocabulary_id: formData.vocabularyId,
      problem_type: formData.problemType,
      description: formData.description,
      reported_by: user?.id || null, // ถ้าไม่มี user ให้ส่งเป็น null
    });

    alert('ส่งรายงานสำเร็จ!');
    router.push(ROUTES.VOCABULARY);
  } catch (error: any) {
    setErrors({ form: 'ส่งรายงานไม่สำเร็จ' });
  } finally {
    setLoading(false);
  }
};

  if (!auth.isAuthenticated()) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">รายงานปัญหา</h1>
            <p className="text-lg text-gray-600">พบข้อผิดพลาดเกี่ยวกับคำศัพท์? แจ้งให้เราทราบได้ที่นี่</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                  <span className="text-base">{errors.form}</span>
                </div>
              )}

              {/* 1. เลือกรายวิชา (เพิ่มใหม่) */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">เลือกรายวิชา (เพื่อกรองคำศัพท์)</label>
                <select
                  className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">-- แสดงคำศัพท์จากทุกวิชา --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. เลือกคำศัพท์ (แก้ตัวแปรเป็น snake_case) */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">คำศัพท์ที่พบปัญหา <span className="text-red-500">*</span></label>
                <select
                  name="vocabularyId"
                  value={formData.vocabularyId}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-base border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.vocabularyId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">-- เลือกคำศัพท์ --</option>
                  {filteredVocabs.map((vocab) => (
                    <option key={vocab.id} value={vocab.id}>
                      {vocab.term_thai} {vocab.term_english ? `(${vocab.term_english})` : ''}
                    </option>
                  ))}
                </select>
                {errors.vocabularyId && <p className="mt-1 text-sm text-red-600">{errors.vocabularyId}</p>}
              </div>

              {/* 3. ประเภทปัญหา */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">ประเภทปัญหา <span className="text-red-500">*</span></label>
                <select
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-base border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${errors.problemType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">-- เลือกประเภทปัญหา --</option>
                  {PROBLEM_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* 4. รายละเอียด */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">รายละเอียดปัญหา <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="อธิบายปัญหาที่พบ..."
                  className={`w-full px-4 py-2.5 text-base border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" size="lg" loading={loading} disabled={loading} className="flex-1">ส่งรายงาน</Button>
                <Button type="button" variant="secondary" size="lg" onClick={() => router.back()} className="flex-1">ยกเลิก</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
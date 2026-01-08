// 'use client'

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import AdminLayout from '@/components/layout/AdminLayout';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';
// import Loading from '@/components/ui/Loading';
// import { coursesApi, vocabularyApi, reportsApi } from '@/lib/api';
// import { ROUTES } from '@/lib/constants';

// export default function AdminDashboardPage() {
//   const [stats, setStats] = useState({
//     totalCourses: 0,
//     totalVocabularies: 0,
//     totalReports: 0,
//     pendingReports: 0,
//   });
//   const [courses, setCourses] = useState<any[]>([]);
//   const [recentReports, setRecentReports] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       const [coursesData, vocabulariesData, reportsData] = await Promise.all([
//         coursesApi.getAll(),
//         vocabularyApi.getAll(),
//         reportsApi.getAll(),
//       ]);

//       setStats({
//         totalCourses: coursesData.length,
//         totalVocabularies: vocabulariesData.length,
//         totalReports: reportsData.length,
//         pendingReports: reportsData.filter((r: any) => r.status === 'PENDING').length,
//       });

//       setCourses(coursesData.slice(0, 6));
//       setRecentReports(reportsData.slice(0, 5));
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//       alert('ไม่สามารถโหลดข้อมูลได้');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <Loading />;
//   }

//   return (
//     <>
//       <div className="space-y-8">
//         {/* Header */}
//         <div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">แดชบอร์ด</h1>
//           <p className="text-lg text-gray-600">ภาพรวมของระบบ Deaf Assistant</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* Total Courses */}
//           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-blue-100 text-base mb-1">รายวิชาทั้งหมด</p>
//                 <p className="text-4xl font-bold">{stats.totalCourses}</p>
//               </div>
//               <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
//                 </svg>
//               </div>
//             </div>
//             <Link href={ROUTES.ADMIN_COURSES} className="mt-4 inline-block text-blue-100 hover:text-white text-base">
//               ดูทั้งหมด →
//             </Link>
//           </Card>

//           {/* Total Vocabularies */}
//           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-purple-100 text-base mb-1">คำศัพท์ทั้งหมด</p>
//                 <p className="text-4xl font-bold">{stats.totalVocabularies}</p>
//               </div>
//               <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
//                 </svg>
//               </div>
//             </div>
//             <Link href={ROUTES.ADMIN_VOCABULARY} className="mt-4 inline-block text-purple-100 hover:text-white text-base">
//               ดูทั้งหมด →
//             </Link>
//           </Card>

//           {/* Pending Reports */}
//           <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-orange-100 text-base mb-1">รายงานรอตรวจ</p>
//                 <p className="text-4xl font-bold">{stats.pendingReports}</p>
//               </div>
//               <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               </div>
//             </div>
//             <Link href="/admin/reports" className="mt-4 inline-block text-orange-100 hover:text-white text-base">
//               ตรวจสอบ →
//             </Link>
//           </Card>

//           {/* Total Reports */}
//           <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-pink-100 text-base mb-1">รายงานทั้งหมด</p>
//                 <p className="text-4xl font-bold">{stats.totalReports}</p>
//               </div>
//               <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
//                   <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
//                 </svg>
//               </div>
//             </div>
//             <Link href="/admin/reports" className="mt-4 inline-block text-pink-100 hover:text-white text-base">
//               ดูทั้งหมด →
//             </Link>
//           </Card>
//         </div>

//         {/* Quick Actions */}
//         <Card>
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">การดำเนินการด่วน</h2>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Link href="/admin/vocabulary/add">
//               <Button fullWidth size="lg" className="h-full">
//                 <span className="flex flex-col items-center py-2">
//                   <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-base">เพิ่มคำศัพท์</span>
//                 </span>
//               </Button>
//             </Link>

//             <Link href="/admin/courses/add">
//               <Button fullWidth size="lg" variant="secondary" className="h-full">
//                 <span className="flex flex-col items-center py-2">
//                   <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-base">เพิ่มรายวิชา</span>
//                 </span>
//               </Button>
//             </Link>

//             <Link href={ROUTES.ADMIN_VOCABULARY}>
//               <Button fullWidth size="lg" variant="secondary" className="h-full">
//                 <span className="flex flex-col items-center py-2">
//                   <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
//                     <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-base">จัดการคำศัพท์</span>
//                 </span>
//               </Button>
//             </Link>

//             <Link href="/admin/reports">
//               <Button fullWidth size="lg" variant="secondary" className="h-full">
//                 <span className="flex flex-col items-center py-2">
//                   <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
//                     <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
//                   </svg>
//                   <span className="text-base">รายงานทั้งหมด</span>
//                 </span>
//               </Button>
//             </Link>
//           </div>
//         </Card>

//         {/* Recent Courses */}
//         <Card>
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">รายวิชาล่าสุด</h2>
//             <Link href={ROUTES.ADMIN_COURSES} className="text-blue-600 hover:text-blue-700 text-base font-medium">
//               ดูทั้งหมด →
//             </Link>
//           </div>

//           {courses.length > 0 ? (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {courses.map((course) => (
//                 <Link
//                   key={course.id}
//                   href={`/admin/courses/${course.id}/edit`}
//                   className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
//                 >
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
//                         {course.name}
//                       </h3>
//                       <p className="text-sm text-gray-600">{course.code}</p>
//                     </div>
//                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </div>
//                   {course.description && (
//                     <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
//                   )}
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               <p className="text-base">ยังไม่มีรายวิชา</p>
//             </div>
//           )}
//         </Card>

//         {/* Recent Reports */}
//         <Card>
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">รายงานล่าสุด</h2>
//             <Link href="/admin/reports" className="text-blue-600 hover:text-blue-700 text-base font-medium">
//               ดูทั้งหมด →
//             </Link>
//           </div>

//           {recentReports.length > 0 ? (
//             <div className="space-y-3">
//               {recentReports.map((report) => (
//                 <div
//                   key={report.id}
//                   className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           report.status === 'PENDING'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : report.status === 'RESOLVED'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {report.status === 'PENDING' ? 'รอตรวจสอบ' :
//                            report.status === 'RESOLVED' ? 'แก้ไขแล้ว' : 'ปฏิเสธ'}
//                         </span>
//                         <span className="text-sm text-gray-600">{report.problemType}</span>
//                       </div>
//                       <p className="text-base text-gray-900 font-medium mb-1">
//                         {report.vocabularyTerm || 'คำศัพท์'}
//                       </p>
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {report.description}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-2">
//                         {new Date(report.reportedAt).toLocaleDateString('th-TH')}
//                       </p>
//                     </div>
//                     <Link
//                       href={`/admin/reports/${report.id}`}
//                       className="ml-4 text-blue-600 hover:text-blue-700"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </Link>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               <p className="text-base">ยังไม่มีรายงาน</p>
//             </div>
//           )}
//         </Card>
//       </div>
//     </>
//   );
// }

'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { coursesApi, vocabularyApi, reportsApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalVocabularies: 0,
    totalReports: 0,
    pendingReports: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [coursesData, vocabulariesData, reportsData] = await Promise.all([
        coursesApi.getAll(),
        vocabularyApi.getAll(),
        reportsApi.getAll(),
      ]);

      setStats({
        totalCourses: coursesData.length,
        totalVocabularies: vocabulariesData.length,
        totalReports: reportsData.length,
        pendingReports: reportsData.filter((r: any) => r.status === 'PENDING').length,
      });

      setCourses(coursesData.slice(0, 6));
      
      // เรียงลำดับรายงานจากใหม่ไปเก่า และเอามาแค่ 5 อันล่าสุด
      const sortedReports = reportsData.sort((a: any, b: any) => 
        new Date(b.reported_at || b.created_at).getTime() - new Date(a.reported_at || a.created_at).getTime()
      );
      setRecentReports(sortedReports.slice(0, 5));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">แดชบอร์ด</h1>
          <p className="text-lg text-gray-600">ภาพรวมของระบบ Deaf Assistant</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Courses */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-base mb-1">รายวิชาทั้งหมด</p>
                <p className="text-4xl font-bold">{stats.totalCourses}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <Link href={ROUTES.ADMIN_COURSES || "/admin/courses"} className="mt-4 inline-block text-blue-100 hover:text-white text-base">
              ดูทั้งหมด →
            </Link>
          </Card>

          {/* Total Vocabularies */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-base mb-1">คำศัพท์ทั้งหมด</p>
                <p className="text-4xl font-bold">{stats.totalVocabularies}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
            </div>
            <Link href={ROUTES.ADMIN_VOCABULARY || "/admin/vocabulary"} className="mt-4 inline-block text-purple-100 hover:text-white text-base">
              ดูทั้งหมด →
            </Link>
          </Card>

          {/* Pending Reports */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-base mb-1">รายงานรอตรวจ</p>
                <p className="text-4xl font-bold">{stats.pendingReports}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <Link href="/admin/reports" className="mt-4 inline-block text-orange-100 hover:text-white text-base">
              ตรวจสอบ →
            </Link>
          </Card>

          {/* Total Reports */}
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-base mb-1">รายงานทั้งหมด</p>
                <p className="text-4xl font-bold">{stats.totalReports}</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <Link href="/admin/reports" className="mt-4 inline-block text-pink-100 hover:text-white text-base">
              ดูทั้งหมด →
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">การดำเนินการด่วน</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/vocabulary/add">
              <Button fullWidth size="lg" className="h-full">
                <span className="flex flex-col items-center py-2">
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">เพิ่มคำศัพท์</span>
                </span>
              </Button>
            </Link>

            <Link href="/admin/courses/add">
              <Button fullWidth size="lg" variant="secondary" className="h-full">
                <span className="flex flex-col items-center py-2">
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">เพิ่มรายวิชา</span>
                </span>
              </Button>
            </Link>

            <Link href={ROUTES.ADMIN_VOCABULARY || "/admin/vocabulary"}>
              <Button fullWidth size="lg" variant="secondary" className="h-full">
                <span className="flex flex-col items-center py-2">
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">จัดการคำศัพท์</span>
                </span>
              </Button>
            </Link>

            <Link href="/admin/reports">
              <Button fullWidth size="lg" variant="secondary" className="h-full">
                <span className="flex flex-col items-center py-2">
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">รายงานทั้งหมด</span>
                </span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Courses */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">รายวิชาล่าสุด</h2>
            <Link href={ROUTES.ADMIN_COURSES || "/admin/courses"} className="text-blue-600 hover:text-blue-700 text-base font-medium">
              ดูทั้งหมด →
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/admin/courses/${course.id}/edit`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-base">ยังไม่มีรายวิชา</p>
            </div>
          )}
        </Card>

        {/* Recent Reports (แก้ไขแล้ว) */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">รายงานล่าสุด</h2>
            <Link href="/admin/reports" className="text-blue-600 hover:text-blue-700 text-base font-medium">
              ดูทั้งหมด →
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'RESOLVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status === 'PENDING' ? 'รอตรวจสอบ' :
                           report.status === 'RESOLVED' ? 'แก้ไขแล้ว' : 'ปฏิเสธ'}
                        </span>
                        
                        {/* ✅ Fix 1: แก้ problemType -> problem_type */}
                        <span className="text-sm text-gray-600">{report.problem_type}</span>
                      </div>
                      
                      <p className="text-base text-gray-900 font-medium mb-1">
                        {/* ✅ Fix 2: แก้ vocabularyTerm -> vocabularies.term_thai */}
                        {report.vocabularies?.term_thai || 'คำศัพท์ (ถูกลบ)'}
                      </p>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {/* ✅ Fix 3: แก้ reportedAt -> reported_at */}
                        {new Date(report.reported_at || report.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    
                    <Link
                      href={`/admin/reports`}
                      className="ml-4 text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-base">ยังไม่มีรายงาน</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
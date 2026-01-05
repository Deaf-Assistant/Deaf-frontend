// 'use client'

// import { Vocabulary } from '@/types';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

// interface VocabularyCardProps {
//   vocabulary: Vocabulary;
// }

// export default function VocabularyCard({ vocabulary }: VocabularyCardProps) {
//   const router = useRouter();

//   return (
//     <div
//       onClick={() => router.push(`/vocabulary/${vocabulary.id}`)}
//       className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group"
//     >
//       {/* Image/Video thumbnail */}
//       <div className="relative h-48 bg-gray-200 overflow-hidden">
//         {vocabulary.imageUrl ? (
//           <Image
//             src={vocabulary.imageUrl}
//             alt={vocabulary.termThai}
//             fill
//             className="object-cover group-hover:scale-105 transition-transform duration-200"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
//             <svg className="w-20 h-20 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//             </svg>
//           </div>
//         )}
        
//         {/* Video indicator */}
//         {vocabulary.videoUrl && (
//           <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
//             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
//             </svg>
//             <span>วิดีโอ</span>
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-5">
//         <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
//           {vocabulary.termThai}
//         </h3>
        
//         {vocabulary.termEnglish && (
//           <p className="text-base text-gray-600 mb-3 line-clamp-1">
//             {vocabulary.termEnglish}
//           </p>
//         )}

//         <p className="text-base text-gray-700 line-clamp-2 mb-3">
//           {vocabulary.definition}
//         </p>

//         {/* Course badge */}
//         {vocabulary.courseName && (
//           <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
//             <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
//             </svg>
//             {vocabulary.courseName}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface VocabularyCardProps {
  vocabulary: any;
}

export default function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const router = useRouter();

  // Helper ดึงค่า (รองรับทั้ง snake_case จาก DB และ camelCase)
  const getProp = (snake: string, camel: string) => vocabulary[snake] || vocabulary[camel];

  const id = vocabulary.id;
  const termThai = getProp('term_thai', 'termThai');
  const termEnglish = getProp('term_english', 'termEnglish');
  const definition = vocabulary.definition;
  const imageUrl = getProp('image_url', 'imageUrl');
  const videoUrl = getProp('video_url', 'videoUrl');
  const courseName = vocabulary.courses?.name || vocabulary.courseName;

  return (
    <div
      onClick={() => router.push(`/vocabulary/${id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group border border-gray-100 h-full flex flex-col"
    >
      {/* Image/Video thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={termThai}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <svg className="w-12 h-12 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
        )}
        
        {/* Video indicator */}
        {videoUrl && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-0.5 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span>วิดีโอ</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
          {termThai}
        </h3>
        
        {termEnglish && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">
            {termEnglish}
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
          {definition}
        </p>

        {/* Course badge */}
        {courseName && (
          <div className="pt-3 border-t border-gray-50 mt-auto">
            <div className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              {courseName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
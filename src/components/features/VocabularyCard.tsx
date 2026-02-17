'use client'

import { Vocabulary } from '@/types';
import { useRouter } from 'next/navigation';
import { incrementView } from '@/lib/actions'; // 👈 1. import เข้ามา

interface VocabularyCardProps {
  vocabulary: Vocabulary;
}

export default function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // 👈 2. นับยอดวิวทันทีที่กด
    incrementView('vocabularies', vocabulary.id);
    router.push(`/vocabulary/${vocabulary.id}`);
  };

  return (
    <div
      onClick={handleClick} // 👈 3. ใช้ฟังก์ชัน handleClick แทน
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
            {vocabulary.term_thai}
          </h3>
          
          {/* 👈 4. ส่วนแสดงยอดวิว (ถ้ามีข้อมูล) */}
          {(vocabulary.view_count !== undefined) && (
            <div className="flex items-center text-gray-400 text-xs shrink-0 ml-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {vocabulary.view_count}
            </div>
          )}
        </div>
        
        {vocabulary.term_english && (
          <p className="text-base text-gray-600 mb-3 line-clamp-1">
            {vocabulary.term_english}
          </p>
        )}

      </div>
    </div>
  );
}
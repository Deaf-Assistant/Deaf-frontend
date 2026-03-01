"use client";

import { Vocabulary } from "@/types";
import { useRouter } from "next/navigation";
import { incrementView } from "@/lib/actions";

interface VocabularyCardProps {
  vocabulary: Vocabulary;
}

export default function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const router = useRouter();

  const handleClick = async () => {
    await incrementView('vocabularies', vocabulary.id); 
    router.push(`/vocabulary/${vocabulary.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-white rounded-lg shadow-md
                 hover:shadow-xl transition-all duration-200
                 cursor-pointer overflow-hidden group"
    >
      {/* Content */}
      <div className="p-5 pb-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
            {vocabulary.term_thai}
          </h3>

          {/* 👁️ View count */}
          {vocabulary.view_count !== undefined && (
            <div className="flex items-center text-gray-400 text-xs shrink-0 ml-2">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5
                     c4.478 0 8.268 2.943 9.542 7
                     -1.274 4.057-5.064 7-9.542 7
                     -4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {vocabulary.view_count}
            </div>
          )}
        </div>

        {vocabulary.term_english && (
          <p className="text-base text-gray-600 line-clamp-1">
            {vocabulary.term_english}
          </p>
        )}
      </div>

      {/* 🔵 Course Badge (มุมล่างขวา) */}
      {vocabulary.courses && (
        <span
          className="absolute bottom-3 right-3
                     px-3 py-1 rounded-full
                     text-xs font-bold
                     bg-blue-100 text-blue-700
                     shadow"
        >
          {vocabulary.courses.code || vocabulary.courses.name}
        </span>
      )}
    </div>
  );
}
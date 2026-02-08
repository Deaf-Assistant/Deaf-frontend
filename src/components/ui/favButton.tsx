'use client'

import { useState } from 'react';
import { useFavorite } from '@/hooks/useFavorite';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  vocabularyId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({
  vocabularyId,
  size = 'md',
  showText = false,
  className = '',
  onToggle,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { 
    isFavorited, 
    loading, 
    initialLoading,
    toggleFavorite,
    isAuthenticated,
  } = useFavorite(vocabularyId, {
    onToggle,
    onError: (error) => {
      if (error.message === 'กรุณาเข้าสู่ระบบก่อน') {
        if (confirm('กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด')) {
          router.push('/login');
        }
      } else {
        alert(error.message);
      }
    },
  });

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  if (initialLoading) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-full bg-gray-100 text-gray-300 ${className}`}
      >
        <svg className={`${iconSizes[size]} animate-pulse`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          transition-all 
          duration-200 
          ${isFavorited 
            ? 'bg-yellow-100 text-yellow-500 hover:bg-yellow-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        aria-label={isFavorited ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
      >
        {loading ? (
          <svg className={`${iconSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg 
            className={iconSizes[size]} 
            fill={isFavorited ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
            />
          </svg>
        )}
      </button>

      {showText && (
        <span className={`ml-2 text-sm ${isFavorited ? 'text-yellow-600' : 'text-gray-600'}`}>
          {isFavorited ? 'รายการโปรด' : 'เพิ่มรายการโปรด'}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && !showText && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
          {isFavorited ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
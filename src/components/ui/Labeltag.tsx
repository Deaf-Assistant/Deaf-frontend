'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { labelTagsApi } from '@/lib/label_api';
import { LabelTag } from '@/types/label';

interface LabelTagsProps {
    vocabularyId: string;
    linkToSearch?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// Predefined colors for different tag names
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'คน': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'สถานที่': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    'สิ่งของ': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'การกระทำ': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    'เวลา': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    'ศิลปะ': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
};

const DEFAULT_COLOR = { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' };

function getTagColor(tagName: string) {
    return TAG_COLORS[tagName] || DEFAULT_COLOR;
}

export default function LabelTags({
    vocabularyId,
    linkToSearch = true,
    size = 'md',
    className = '',
}: LabelTagsProps) {
    const [tags, setTags] = useState<LabelTag[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTags = async () => {
            try {
                const data = await labelTagsApi.getByVocabularyId(vocabularyId);
                setTags(data);
            } catch (error) {
                console.error('Failed to load label tags:', error);
            } finally {
                setLoading(false);
            }
        };

        if (vocabularyId) {
            loadTags();
        }
    }, [vocabularyId]);

    if (loading) {
        return (
            <div className={`flex gap-2 ${className}`}>
                <div className="animate-pulse h-6 w-16 bg-gray-200 rounded-full" />
                <div className="animate-pulse h-6 w-20 bg-gray-200 rounded-full" />
            </div>
        );
    }

    if (tags.length === 0) {
        return null;
    }

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tags.map((tag) => {
                const colors = getTagColor(tag.name);
                const tagContent = (
                    <span
                        className={`
              inline-flex items-center rounded-full font-medium transition
              ${sizeClasses[size]}
              ${colors.bg} ${colors.text} border ${colors.border}
              ${linkToSearch ? 'hover:opacity-80 cursor-pointer' : ''}
            `}
                    >
                        <svg
                            className={`${iconSizes[size]} mr-1`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {tag.name}
                    </span>
                );

                if (linkToSearch) {
                    return (
                        <Link
                            key={tag.id}
                            href={`/vocabulary?tag=${encodeURIComponent(tag.name)}`}
                        >
                            {tagContent}
                        </Link>
                    );
                }

                return <span key={tag.id}>{tagContent}</span>;
            })}
        </div>
    );
}

// Static version for when you already have the tags data
export function LabelTagsStatic({
    tags,
    linkToSearch = true,
    size = 'md',
    className = '',
}: {
    tags: LabelTag[];
    linkToSearch?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    if (tags.length === 0) {
        return null;
    }

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tags.map((tag) => {
                const colors = getTagColor(tag.name);
                const tagContent = (
                    <span
                        className={`
              inline-flex items-center rounded-full font-medium transition
              ${sizeClasses[size]}
              ${colors.bg} ${colors.text} border ${colors.border}
              ${linkToSearch ? 'hover:opacity-80 cursor-pointer' : ''}
            `}
                    >
                        <svg
                            className={`${iconSizes[size]} mr-1`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {tag.name}
                    </span>
                );

                if (linkToSearch) {
                    return (
                        <Link
                            key={tag.id}
                            href={`/vocabulary?tag=${encodeURIComponent(tag.name)}`}
                        >
                            {tagContent}
                        </Link>
                    );
                }

                return <span key={tag.id}>{tagContent}</span>;
            })}
        </div>
    );
}
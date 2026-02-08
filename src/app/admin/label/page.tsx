'use client'

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { labelTagsApi } from '@/lib/label_api';
import { LabelTag } from '@/types/label';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLabelTagsPage() {
    const [labelTags, setLabelTags] = useState<LabelTag[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState('#6366f1');
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const tagsData = await labelTagsApi.getAll();
            setLabelTags(tagsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagName.trim()) {
            toast.warning('กรุณากรอกชื่อ หมวดหมู่');
            return;
        }

        try {
            setSubmitting(true);
            await labelTagsApi.create(tagName.trim(), tagColor);
            await loadData();
            setShowAddForm(false);
            setTagName('');
            setTagColor('#6366f1');
            toast.success('เพิ่ม หมวดหมู่ สำเร็จ');
        } catch (error: any) {
            console.error('Failed to add tag:', error);
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTag = async () => {
        if (!deleteConfirm) return;

        try {
            await labelTagsApi.delete(deleteConfirm.id);
            setLabelTags(prev => prev.filter(t => t.id !== deleteConfirm.id));
            toast.success('ลบ หมวดหมู่ สำเร็จ');
        } catch (error) {
            console.error('Failed to delete tag:', error);
            toast.error('ไม่สามารถลบได้');
        } finally {
            setDeleteConfirm(null);
        }
    };

    // Filter label tags
    const filteredTags = labelTags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loading />;

    return (
        <>
            <ToastContainer position="top-center" autoClose={3000} style={{ top: '20%' }} />
            <div className="space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">จัดการหมวดหมู่</h1>
                        <p className="text-lg text-gray-600">สร้างหมวดหมู่เพื่อใช้จัดหมวดหมู่คำศัพท์</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => setShowAddForm(true)}>
                            + เพิ่ม หมวดหมู่
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <p className="text-indigo-100 text-base mb-1">หมวดหมู่ทั้งหมด</p>
                        <p className="text-4xl font-bold">{labelTags.length}</p>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <p className="text-blue-100 text-base mb-1">ผลการค้นหา</p>
                        <p className="text-4xl font-bold">{filteredTags.length}</p>
                    </Card>
                </div>

                {/* Add Tag Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <Card className="w-full max-w-lg mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6">เพิ่ม หมวดหมู่</h2>
                            <form onSubmit={handleAddTag} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ชื่อ หมวดหมู่ *
                                    </label>
                                    <input
                                        type="text"
                                        value={tagName}
                                        onChange={(e) => setTagName(e.target.value)}
                                        placeholder="เช่น คน, สถานที่, สิ่งของ"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        สี หมวดหมู่
                                    </label>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="color"
                                            value={tagColor}
                                            onChange={(e) => setTagColor(e.target.value)}
                                            className="w-10 h-10 border-0 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-500">{tagColor}</span>
                                        <span
                                            className="px-3 py-1 rounded-full text-sm font-medium"
                                            style={{ backgroundColor: `${tagColor}20`, color: tagColor }}
                                        >
                                            {tagName || 'ตัวอย่าง'}
                                        </span>
                                    </div>
                                    {/* Preset colors */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6b7280'].map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setTagColor(color)}
                                                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${tagColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setTagName('');
                                            setTagColor('#6366f1');
                                        }}
                                        fullWidth
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" fullWidth disabled={submitting}>
                                        {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">ยืนยันการลบ</h2>
                                <p className="text-gray-600 mb-6">
                                    ต้องการลบ หมวดหมู่ "<span className="font-semibold" style={{ color: deleteConfirm.name }}>{deleteConfirm.name}</span>" หรือไม่?
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setDeleteConfirm(null)}
                                        fullWidth
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleDeleteTag}
                                        fullWidth
                                        className="!bg-red-500 hover:!bg-red-600"
                                    >
                                        ลบ
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Label Tags List */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">หมวดหมู่ ทั้งหมด</h2>

                        {/* Search */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="ค้นหา..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {filteredTags.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {filteredTags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg group"
                                    style={{
                                        backgroundColor: `${tag.color}15`,
                                        border: `1px solid ${tag.color}30`
                                    }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span style={{ color: tag.color }} className="font-medium">
                                        {tag.name}
                                    </span>
                                    <button
                                        onClick={() => setDeleteConfirm({ id: tag.id, name: tag.name })}
                                        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="ลบ หมวดหมู่"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <p className="text-lg">ยังไม่มีหมวดหมู่</p>
                            <p className="text-sm mt-1">คลิกปุ่ม "+ เพิ่มหมวดหมู่" เพื่อเริ่มต้น</p>
                        </div>
                    )}
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900">วิธีใช้งาน</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                สร้างหมวดหมู่ที่นี่ แล้วไปเพิ่มให้กับคำศัพท์ในหน้าจัดการคำศัพท์<br />
                                หมวดหมู่หนึ่งอันสามารถใช้กับคำศัพท์หลายคำได้
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
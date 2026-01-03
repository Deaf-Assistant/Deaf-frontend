'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authApi.register(registerData);

      auth.setToken(response.token);
      auth.setUser(response.user);

      alert('ลงทะเบียนสำเร็จ!');
      
      if (auth.isAdmin()) {
        router.push(ROUTES.ADMIN_DASHBOARD);
      } else {
        router.push(ROUTES.COURSES);
      }
      router.refresh();
    } catch (err: any) {
      setErrors({ form: err.message || 'ลงทะเบียนไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Deaf Assistant</h1>
          <p className="text-purple-100 text-lg">ลงทะเบียนใช้งาน</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">{errors.form}</span>
                </div>
              </div>
            )}

            <Input
              type="text"
              name="name"
              label="ชื่อ-นามสกุล"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="สมชาย ใจดี"
              autoComplete="name"
            />

            <Input
              type="email"
              name="email"
              label="อีเมล"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="your.email@cmu.ac.th"
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              label="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="••••••••"
              helperText="อย่างน้อย 6 ตัวอักษร"
              autoComplete="new-password"
            />

            <Input
              type="password"
              name="confirmPassword"
              label="ยืนยันรหัสผ่าน"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                ประเภทผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="STUDENT">นักศึกษา</option>
                <option value="INTERPRETER">ล่ามภาษามือ</option>
                <option value="LECTURER">อาจารย์ผู้สอน</option>
                <option value="ADMIN">ผู้ดูแลระบบ</option>
              </select>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
            >
              ลงทะเบียน
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-base text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href={ROUTES.LOGIN} className="text-purple-600 hover:text-purple-700 font-medium">
                เข้าสู่ระบบ
              </Link>
            </p>

            <Link
              href={ROUTES.HOME}
              className="block text-base text-gray-500 hover:text-gray-700"
            >
              ← กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-purple-100 text-sm">
            สำหรับนักศึกษาและบุคลากร มหาวิทยาลัยเชียงใหม่
          </p>
        </div>
      </div>
    </div>
  );
}
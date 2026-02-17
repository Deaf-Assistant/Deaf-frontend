'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import Image from 'next/image';

// 1. Import รูปเข้ามาเพื่อให้ Next.js จัดการ (สังเกต .jpg ตามชื่อไฟล์จริง)
import cmuLogo from '@/img/logocmu.jpg';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData.email, formData.password);

      auth.setToken(response.token);
      auth.setUser(response.user);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (auth.isAdmin()) {
        router.push(ROUTES.ADMIN_DASHBOARD);
      } else {
        router.push(ROUTES.COURSES);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  const handleCMULogin = () => {
    const clientId = process.env.NEXT_PUBLIC_CMU_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/cmuEntraIDCallback`;
    const scope = 'api://cmu/Mis.Account.Read.Me.Basicinfo offline_access';

    if (!clientId) {
      alert("ไม่พบ CMU Client ID! กรุณาตรวจสอบไฟล์ .env.local");
      return;
    }

    const authUrl = `https://login.microsoftonline.com/cf81f1df-de59-4c29-91da-a2dfd04aa751/oauth2/v2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=xyz`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Deaf Assistant</h1>
          <p className="text-blue-100 text-lg">เข้าสู่ระบบ</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base">{error}</span>
                </div>
              </div>
            )}

            <Input
              type="email"
              name="email"
              label="อีเมล"
              value={formData.email}
              onChange={handleChange}
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
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          {/* CMU Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">หรือเข้าสู่ระบบด้วย</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCMULogin}
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              {/* Image Logo */}
              <div className="mr-3 relative w-6 h-6">
                <Image 
                  src={cmuLogo} 
                  alt="CMU Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              CMU Account
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-base text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link href={ROUTES.REGISTER} className="text-blue-600 hover:text-blue-700 font-medium">
                ลงทะเบียนที่นี่
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

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-blue-100 text-sm">
            สำหรับนักศึกษาและบุคลากร มหาวิทยาลัยเชียงใหม่
          </p>
        </div>
      </div>
    </div>
  );
}
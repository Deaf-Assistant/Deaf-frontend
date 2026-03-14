import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
    	protocol: 'https',
    	hostname: 'dsssign.se.cpe.eng.cmu.ac.th', // เพิ่มโดเมนตัวเอง
    	pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ymcrtlumjdvjpyyofmwq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  async rewrites() {
    return [
      {
        source: '/auth/v1/:path*',
        destination: 'http://10.10.184.128:8000/auth/v1/:path*', // ส่ง Auth ไปที่ Supabase
      },
      {
        source: '/rest/v1/:path*',
        destination: 'http://10.10.184.128:8000/rest/v1/:path*', // ส่ง API ไปที่ Supabase
      },
      {
  	source: '/storage/v1/:path*',
  	destination: 'http://10.10.184.128:8000/storage/v1/:path*',
      },
    ];
  },
};

export default nextConfig;

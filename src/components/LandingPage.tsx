'use client';

import Link from 'next/link';
import { Rocket, Search, GraduationCap, Video, BookMarked, UserPlus, LogIn } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/lib/constants';

// ─── Floating orb component for background ambiance ───────────────────────────
function Orb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`} />;
}

// ─── Feature card ──────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;       // tailwind bg class for icon bubble
  border: string;       // tailwind border class
  delay: string;        // CSS animation-delay value
}

function FeatureCard({ icon, title, description, accent, border, delay }: FeatureCardProps) {
  return (
    <div
      className={`feature-card relative bg-white/70 backdrop-blur-md rounded-[2rem] p-8 shadow-lg hover:shadow-2xl border-2 ${border} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
      style={{ animationDelay: delay }}
    >
      {/* decorative circle */}
      <div className={`absolute -top-6 -right-6 w-28 h-28 ${accent} rounded-full opacity-20`} />
      <div className={`w-16 h-16 ${accent} rounded-2xl flex items-center justify-center mb-5 shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-[0.95rem]">{description}</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700;800&display=swap');

        :root {
          --indigo:  #4F46E5;
          --violet:  #7C3AED;
          --rose:    #F43F5E;
          --amber:   #F59E0B;
          --sky:     #0EA5E9;
        }

        body { font-family: 'Sora', 'Noto Sans Thai', sans-serif; }

        /* Hero entrance */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }

        .hero-title {
          animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-sub {
          animation: fadeUp 0.8s 0.15s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-btns {
          animation: fadeUp 0.8s 0.28s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-emoji {
          animation: floatY 3s ease-in-out infinite;
        }
        .feature-card {
          animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        /* CTA wave clip */
        .wave-clip {
          clip-path: ellipse(110% 60% at 50% 100%);
        }
        .wave-clip-top {
          clip-path: ellipse(110% 60% at 50% 0%);
        }

        /* Noise overlay */
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .btn-primary:hover::after { background: rgba(255,255,255,0.12); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(79,70,229,0.35); }
      `}</style>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />

        {/* ── HERO ─────────────────────────────────────────────────────────────── */}
        <section className="relative noise overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-500 pt-24 pb-32">
          {/* Ambient orbs */}
          <Orb className="w-[500px] h-[500px] bg-indigo-400 -top-32 -left-40" />
          <Orb className="w-[400px] h-[400px] bg-violet-400 top-10 right-0" />
          <Orb className="w-[300px] h-[300px] bg-rose-300 bottom-0 left-1/3" />

          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">


              {/* Headline */}
              <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-[1.08] whitespace-nowrap">
                <span className="text-white">DDCMU ผู้ช่วยการเรียนรู้</span>
                <span className="hero-emoji inline-block ml-3">🌟</span>
              </h1>

              <p className="hero-sub text-lg md:text-xl text-white mb-10 leading-relaxed max-w-xl mx-auto">
                ระบบช่วยสนับสนุนการเรียนการสอน
                <br />
                สำหรับนักศึกษาผู้บกพร่องทางการได้ยิน 💙
              </p>

              {/* CTA buttons */}
              <div className="hero-btns flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                <Link href={ROUTES.COURSES}>
                  <button className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-xl">
                    <Rocket className="w-6 h-6" />
                    เริ่มใช้งาน
                  </button>
                </Link>
                <Link href={ROUTES.VOCABULARY}>
                  <button className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-xl">
                    <Search className="w-6 h-6" />
                    ค้นหาคำศัพท์
                  </button>
                </Link>
                <Link href={ROUTES.QUIZ}>
                  <button className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-200 text-amber-800 rounded-2xl font-bold text-lg shadow-xl">
                    <GraduationCap className="w-6 h-6" />
                    ทดสอบความรู้
                  </button>
                </Link>
              </div>

            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 wave-clip bg-slate-50 z-10" />
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
        <section className="py-10 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                คุณสมบัติของระบบ
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
              <FeatureCard
                icon={<Video className="w-8 h-8 text-indigo-600" />}
                title="วิดีโอภาษามือ 🎥"
                description="วิดีโอคุณภาพสูง พร้อมควบคุมความเร็วและเล่นซ้ำได้"
                accent="bg-indigo-100"
                border="border-indigo-100"
                delay="0.1s"
              />
              <FeatureCard
                icon={<BookMarked className="w-8 h-8 text-violet-600" />}
                title="คำศัพท์เฉพาะทาง 📚"
                description="รวบรวมคำศัพท์จากทุกรายวิชา พร้อมคำอธิบายที่เข้าใจง่าย"
                accent="bg-violet-100"
                border="border-violet-100"
                delay="0.2s"
              />
              <FeatureCard
                icon={<Search className="w-8 h-8 text-rose-500" />}
                title="ค้นหาอัจฉริยะ 🔍"
                description="ระบบค้นหาอัจฉริยะ แม้สะกดผิดก็ยังหาเจอ กรองตามรายวิชาได้"
                accent="bg-rose-100"
                border="border-rose-100"
                delay="0.3s"
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">เริ่มต้นง่ายมาก</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">ใช้งานได้ใน 3 ขั้นตอน</h2>
            </div>

            <div className="relative grid md:grid-cols-3 gap-8">
              {/* connector line */}
              <div className="hidden md:block absolute top-8 left-[22%] right-[22%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-rose-200" />

              {[
                { step: '01', icon: <UserPlus className="w-6 h-6 text-indigo-600" />, title: 'สร้างบัญชี', desc: 'ลงทะเบียนฟรี', color: 'bg-indigo-50 border-indigo-200' },
                { step: '02', icon: <BookMarked className="w-6 h-6 text-violet-600" />, title: 'เลือกรายวิชา', desc: 'เข้าถึงคำศัพท์และวิดีโอที่ต้องการ', color: 'bg-violet-50 border-violet-200' },
                { step: '03', icon: <GraduationCap className="w-6 h-6 text-rose-500" />, title: 'ฝึกและทดสอบ', desc: 'ทำแบบทดสอบเพื่อวัดความเข้าใจ', color: 'bg-rose-50 border-rose-200' },
              ].map(({ step, icon, title, desc, color }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl border-2 ${color} flex items-center justify-center mb-4 shadow-sm relative z-10`}>
                    {icon}
                  </div>
                  <span className="text-xs font-black text-gray-300 tracking-widest mb-1">{step}</span>
                  <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <section className="relative noise overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-rose-500 py-24">
          <Orb className="w-[450px] h-[450px] bg-white -top-32 -left-32" />
          <Orb className="w-[350px] h-[350px] bg-violet-300 bottom-0 right-0" />

          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center gap-5 mb-6">
                <span className="text-5xl" style={{ animation: 'floatY 2.8s ease-in-out infinite' }}>🎉</span>
                <span className="text-5xl" style={{ animation: 'floatY 2.8s 0.2s ease-in-out infinite' }}>✨</span>
                <span className="text-5xl" style={{ animation: 'floatY 2.8s 0.4s ease-in-out infinite' }}>🚀</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                พร้อมเริ่มต้นแล้วหรือยัง?
              </h2>
              <p className="text-white/80 text-lg mb-10">
                เข้าถึงคำศัพท์และวิดีโอภาษามือได้ทันทีโดยไม่มีค่าใช้จ่าย 📖💙
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={ROUTES.REGISTER}>
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
                    <UserPlus className="w-5 h-5" />
                    ลงทะเบียนฟรี
                  </button>
                </Link>
                <Link href={ROUTES.LOGIN}>
                  <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm border-2 border-white/40 text-white rounded-2xl font-bold text-base hover:bg-white/25 transition-all duration-200">
                    <LogIn className="w-5 h-5" />
                    เข้าสู่ระบบ
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
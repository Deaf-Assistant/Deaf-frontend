import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';


export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Deaf Assistant
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              ระบบช่วยสนับสนุนการเรียนการสอน
              <br />
              สำหรับนักศึกษาผู้บกพร่องทางการได้ยิน
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.COURSES}>
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  <span className="flex items-center text-lg">
                    เริ่มใช้งาน
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
              <Link href={ROUTES.VOCABULARY}>
                <Button size="lg" variant="secondary" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                  <span className="text-lg">ค้นหาคำศัพท์</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            คุณสมบัติของระบบ
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">วิดีโอภาษามือ</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                วิดีโอภาษามือคุณภาพสูง พร้อมควบคุมความเร็วและเล่นซ้ำได้
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">คำศัพท์เฉพาะทาง</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                รวบรวมคำศัพท์เฉพาะทางจากทุกรายวิชา พร้อมคำอธิบายที่เข้าใจง่าย
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ค้นหาง่าย รวดเร็ว</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                ระบบค้นหาอัจฉริยะ แม้สะกดผิดก็ยังหาเจอ กรองตามรายวิชาได้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-xl text-gray-300">คำศัพท์</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-400 mb-2">20+</div>
              <div className="text-xl text-gray-300">รายวิชา</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-pink-400 mb-2">100+</div>
              <div className="text-xl text-gray-300">นักศึกษาใช้งาน</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 ">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-xl mb-8 text-blue-100">
            เข้าถึงคำศัพท์และวิดีโอภาษามือได้ทันที
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                <span className="text-lg">ลงทะเบียนฟรี</span>
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN}>
              <Button size="lg" variant="secondary" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                <span className="text-lg">เข้าสู่ระบบ</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
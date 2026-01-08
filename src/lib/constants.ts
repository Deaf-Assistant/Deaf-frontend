export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COURSES: '/courses',
  VOCABULARY: '/vocabulary',
  REPORT: '/report',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_VOCABULARY: '/admin/vocabulary',
};

export const VIDEO_SPEEDS = [0.5, 0.75, 1.0];

export const FILE_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    // ✅ เพิ่ม '.gif' และ 'image/gif' เข้าไปครับ
    ACCEPTED: ['.jpg', '.jpeg', '.png', '.webp', '.gif', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  VIDEO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ACCEPTED: ['.mp4', '.mov', '.webm', 'video/mp4', 'video/quicktime', 'video/webm', 'image/gif']
  }
};

export const PROBLEM_TYPES = [
  'คำศัพท์ผิด',
  'วิดีโอไม่ชัด',
  'คำอธิบายไม่ถูกต้อง',
  'ภาษามือผิด',
  'อื่นๆ',
];


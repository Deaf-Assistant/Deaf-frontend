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
    ACCEPTED: ['image/png', 'image/jpeg', 'image/jpg'],
  },
  VIDEO: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ACCEPTED: ['video/mp4', 'image/gif'],
  },
};

export const PROBLEM_TYPES = [
  'คำศัพท์ผิด',
  'วิดีโอไม่ชัด',
  'คำอธิบายไม่ถูกต้อง',
  'ภาษามือผิด',
  'อื่นๆ',
];
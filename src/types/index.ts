// src/types/index.ts

export type UserRole = 'STUDENT' | 'ADMIN' | 'INTERPRETER' | 'LECTURER';

export interface User {
  id: string;
  email: string;
  name: string; // ใน DB มี column name ใช่ไหม? หรือต้องดึงจาก metadata
  role: UserRole;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  image_url?: string; // แก้เป็น snake_case ตาม DB
  created_at: string;
  updated_at: string;
}

export interface Vocabulary {
  id: string;
  term_thai: string;    // แก้เป็น snake_case
  term_english?: string; // แก้เป็น snake_case
  definition?: string;
  image_url?: string;   // แก้เป็น snake_case
  video_url?: string;   // แก้เป็น snake_case
  course_id?: string;   // แก้เป็น snake_case
  chapter_id?: string;  // แก้เป็น snake_case
  created_by?: string;
  created_at: string;
  updated_at: string;
  // field ที่ join มา (optional)
  courses?: Course;
  chapters?: any;
}

export interface Report {
  id: string;
  vocabulary_id: string; // แก้เป็น snake_case
  problem_type: string;  // แก้เป็น snake_case
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  reported_by?: string;  // แก้เป็น snake_case
  created_at: string;    // ใน DB คือ created_at (ไม่มี reported_at ใน schema ล่าสุด หรือใช้ created_at แทน)
}
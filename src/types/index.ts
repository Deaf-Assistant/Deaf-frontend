export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'INTERPRETER' | 'LECTURER';
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  name: string;
  courseId: string;
  order: number;
}

export interface Vocabulary {
  id: string;
  termThai: string;
  termEnglish: string;
  definition: string;
  imageUrl?: string;
  videoUrl?: string;
  courseId: string;
  courseName?: string;
  chapterId: string;
  chapterName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  vocabularyId: string;
  vocabularyTerm?: string;
  problemType: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  reportedBy: string;
  reportedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
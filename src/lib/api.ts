
// // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
// // const USE_MOCK = !API_BASE_URL;

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// // Helper function for API calls
// async function fetchAPI<T>(
//   endpoint: string,
//   options?: RequestInit
// ): Promise<T> {
//   const token = localStorage.getItem('token');
  
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//     ...(token && { Authorization: `Bearer ${token}` }),
//     ...options?.headers,
//   };

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ message: 'Network error' }));
//     throw new Error(error.message || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// }

// // Auth API
// export const authApi = {
//   async login(email: string, password: string) {
//     return fetchAPI<{ token: string; user: any }>('/auth/login', {
//       method: 'POST',
//       body: JSON.stringify({ email, password }),
//     });
//   },

//   async register(data: { name: string; email: string; password: string; role: string }) {
//     return fetchAPI<{ token: string; user: any }>('/auth/register', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   async logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   },
// };

// // Courses API
// export const coursesApi = {
//   async getAll() {
//     return fetchAPI<any[]>('/courses');
//   },

//   async getById(id: string) {
//     return fetchAPI<any>(`/courses/${id}`);
//   },

//   async create(data: any) {
//     return fetchAPI<any>('/courses', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   async update(id: string, data: any) {
//     return fetchAPI<any>(`/courses/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   async delete(id: string) {
//     return fetchAPI<void>(`/courses/${id}`, {
//       method: 'DELETE',
//     });
//   },
// };

// // Vocabulary API
// export const vocabularyApi = {
//   async getAll(courseId?: string) {
//     const url = courseId ? `/vocabularies?courseId=${courseId}` : '/vocabularies';
//     return fetchAPI<any[]>(url);
//   },

//   async getById(id: string) {
//     return fetchAPI<any>(`/vocabularies/${id}`);
//   },

//   async search(keyword: string, courseId?: string) {
//     const params = new URLSearchParams({ q: keyword });
//     if (courseId) params.append('courseId', courseId);
//     return fetchAPI<any[]>(`/vocabularies/search?${params}`);
//   },

//   async create(data: any) {
//     return fetchAPI<any>('/vocabularies', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   async update(id: string, data: any) {
//     return fetchAPI<any>(`/vocabularies/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   async delete(id: string) {
//     return fetchAPI<void>(`/vocabularies/${id}`, {
//       method: 'DELETE',
//     });
//   },
// };

// // Reports API
// export const reportsApi = {
//   async getAll() {
//     return fetchAPI<any[]>('/reports');
//   },

//   async create(data: any) {
//     return fetchAPI<any>('/reports', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   async updateStatus(id: string, status: string) {
//     return fetchAPI<any>(`/reports/${id}`, {
//       method: 'PATCH',
//       body: JSON.stringify({ status }),
//     });
//   },
// };

// // File Upload API
// export const uploadApi = {
//   async uploadFile(file: File, type: 'image' | 'video') {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('type', type);

//     const token = localStorage.getItem('token');
//     const response = await fetch(`${API_BASE_URL}/upload`, {
//       method: 'POST',
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error('Upload failed');
//     }

//     return response.json();
//   },
// };

// import { createClient } from './supabase';

// const supabase = createClient();

// // --- Auth API ---
// export const authApi = {
//   async login(email: string, password: string) {
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//     return data;
//   },

//   async register(email: string, password: string, name: string, role: string = 'STUDENT') {
//     // 1. สมัครสมาชิกใน Auth
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//       options: { data: { name, role } } // เก็บชื่อและ role ไว้ใน metadata ชั่วคราว
//     });
//     if (authError) throw authError;

//     // 2. บันทึกลงตาราง users (ถ้าไม่ใช้ trigger)
//     if (authData.user) {
//         const { error: profileError } = await supabase.from('users').insert({
//             id: authData.user.id,
//             email: email,
//             name: name,
//             role: role
//         });
//         if (profileError) console.error('Error creating profile:', profileError);
//     }
//     return authData;
//   },

//   async logout() {
//     return await supabase.auth.signOut();
//   },

//   async getCurrentUser() {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return null;
    
//     // ดึง role จากตาราง users
//     const { data: profile } = await supabase
//       .from('users')
//       .select('*')
//       .eq('id', user.id)
//       .single();
      
//     return { ...user, ...profile };
//   }
// };

// // --- Vocabulary API (มี Fuzzy Search) ---
// export const vocabularyApi = {
//   async getAll(courseId?: string) {
//     let query = supabase.from('vocabularies').select('*, courses(name), chapters(name)');
//     if (courseId) {
//       query = query.eq('course_id', courseId);
//     }
//     const { data, error } = await query;
//     if (error) throw error;
//     return data;
//   },

//   async getById(id: string) {
//     const { data, error } = await supabase
//       .from('vocabularies')
//       .select('*, courses(*), chapters(*)')
//       .eq('id', id)
//       .single();
//     if (error) throw error;
//     return data;
//   },

//   // *** ระบบ Fuzzy Search ***
//   async search(keyword: string) {
//     const { data, error } = await supabase
//       .from('vocabularies')
//       .select('*, courses(name)')
//       // ilike คือ case-insensitive search (พิมพ์เล็กใหญ่ก็ได้)
//       // %keyword% คือหาคำที่มี keyword นี้อยู่ตรงไหนก็ได้
//       .ilike('term_thai', `%${keyword}%`); 
      
//     if (error) throw error;
//     return data;
//   },

//   async create(data: any) {
//     const { data: result, error } = await supabase.from('vocabularies').insert(data).select().single();
//     if (error) throw error;
//     return result;
//   },

//   async update(id: string, data: any) {
//     const { data: result, error } = await supabase.from('vocabularies').update(data).eq('id', id).select().single();
//     if (error) throw error;
//     return result;
//   },

//   async delete(id: string) {
//     const { error } = await supabase.from('vocabularies').delete().eq('id', id);
//     if (error) throw error;
//   }
// };

// // --- Upload API (ใช้ Supabase Storage) ---
// export const uploadApi = {
//   async uploadFile(file: File, bucket: 'images' | 'videos' = 'images') {
//     const fileExt = file.name.split('.').pop();
//     const fileName = `${Date.now()}.${fileExt}`;
//     const filePath = `${fileName}`;

//     // ต้องไปสร้าง Bucket ชื่อ 'images' และ 'videos' ใน Supabase Storage ก่อนนะ
//     const { error: uploadError } = await supabase.storage
//       .from(bucket)
//       .upload(filePath, file);

//     if (uploadError) throw uploadError;

//     // ขอ Public URL เพื่อเอามาแสดงผล
//     const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
//     return { url: data.publicUrl };
//   }
// };

// // --- Reports API ---
// export const reportsApi = {
//     async create(data: any) {
//         const { data: result, error } = await supabase.from('reports').insert(data).select();
//         if (error) throw error;
//         return result;
//     },
//     async getAll() {
//         const { data, error } = await supabase.from('reports').select('*, vocabularies(term_thai), users(name)');
//         if (error) throw error;
//         return data;
//     }
// }

// src/lib/api.ts
import { createClient } from './supabase';

const supabase = createClient();

// --- Auth API ---
export const authApi = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async register(email: string, password: string, name: string, role: string = 'STUDENT') {
    // 1. สมัครสมาชิก
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    if (authError) throw authError;

    // 2. บันทึกลงตาราง users
    if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            email: email,
            name: name,
            role: role
        });
        if (profileError) console.error('Error creating profile:', profileError);
    }
    return authData;
  },

  async logout() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return { ...user, ...profile };
  }
};

// --- Courses API (ที่หายไป เติมให้แล้วครับ) ---
export const coursesApi = {
  async getAll() {
    // เรียงตามชื่อวิชา หรือจะเปลี่ยนเป็น created_at ก็ได้
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name'); 
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(data: any) {
    const { data: result, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('courses')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// --- Vocabulary API ---
export const vocabularyApi = {
  async getAll(courseId?: string) {
    let query = supabase.from('vocabularies').select('*, courses(name), chapters(name)');
    
    // ถ้ามีการส่ง courseId มาให้กรองด้วย (ใช้ในหน้า CoursesPage ที่นายพยายามแก้)
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*, courses(*), chapters(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async search(keyword: string, courseId?: string) {
    let query = supabase
      .from('vocabularies')
      .select('*, courses(name)')
      .ilike('term_thai', `%${keyword}%`);
      
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(data: any) {
    const { data: result, error } = await supabase.from('vocabularies').insert(data).select().single();
    if (error) throw error;
    return result;
  },

  async update(id: string, data: any) {
    const { data: result, error } = await supabase.from('vocabularies').update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
  },

  async delete(id: string) {
    const { error } = await supabase.from('vocabularies').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- Upload API ---
export const uploadApi = {
  async uploadFile(file: File, bucket: 'images' | 'videos' = 'images') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl };
  }
};

// --- Reports API ---
export const reportsApi = {
    async create(data: any) {
        const { data: result, error } = await supabase.from('reports').insert(data).select();
        if (error) throw error;
        return result;
    },
    async getAll() {
        const { data, error } = await supabase.from('reports').select('*, vocabularies(term_thai), users(name)');
        if (error) throw error;
        return data;
    },
     async updateStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    }
}
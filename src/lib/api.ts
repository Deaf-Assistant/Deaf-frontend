
import { createClient } from './supabase';
import type { UserRole } from '@/types';



const supabase = createClient();

// --- Auth API (แก้ไขให้ตรงกับ Frontend) ---
export const authApi = {

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // --- เพิ่มส่วนนี้: ดึงข้อมูล Role จากตาราง users ---
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // ผนวกข้อมูล Auth user เข้ากับ Profile (เพื่อให้ได้ role ที่ถูกต้องจาก DB)
    const fullUser = {
      ...data.user,
      ...profile
    };
    // ---------------------------------------------

    return {
      user: fullUser, // ส่งกลับเป็น fullUser แทน data.user
      token: data.session?.access_token
    };
  },

  // รับค่าเป็น Object ตามที่ RegisterPage ส่งมา
async register(data: { email: string; password: string; name: string; role: string }) {
    // เปลี่ยนจาก const เป็น let เพื่อให้แก้ไขค่า role ได้
    let { email, password, name, role } = data; 
    
    // 👇 --- เพิ่ม Logic กำหนด Default Role สำหรับคนนอกตรงนี้ --- 👇
    const isCmuMail = email.toLowerCase().endsWith('@cmu.ac.th');
    
    // ถ้าไม่มีการส่ง Role มา หรือส่งมาเป็น STUDENT แต่ใช้อีเมลนอก ให้บังคับเป็น MEMBER
    if (!role || (role === 'STUDENT' && !isCmuMail)) {
      role = isCmuMail ? 'STUDENT' : 'MEMBER';
    }
    // 👆 ------------------------------------------------ 👆

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

   
    return {
      user: authData.user,
      token: authData.session?.access_token
    };
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
  },

  loginWithCMU() {
    const clientId = process.env.NEXT_PUBLIC_CMU_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/cmu/callback`;
    const authUrl = `https://oauth.cmu.ac.th/v1/Authorize.aspx?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=cmuitaccount.basicinfo`;

    window.location.href = authUrl;
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
      // แก้ไขตรงนี้: เพิ่ม chapters(*) เพื่อดึงข้อมูลบทเรียนมาด้วย
      .select(`
        *,
        chapters (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // (เสริม) เรียงลำดับบทเรียนตามชื่อ (ถ้าต้องการ)
    if (data.chapters) {
      data.chapters.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

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
    // 🔴 แก้แล้ว: เติม , visibility ลงไป
    let query = supabase.from('vocabularies').select('*, courses(name, visibility), chapters(name)');
    
    // ถ้ามีการส่ง courseId มาให้กรองด้วย
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
      .select(`
        *,
        courses (name, visibility), 
        chapters (name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async search(keyword: string, courseId?: string) {
   
    let query = supabase
      .from('vocabularies')
      .select('*, courses(name, visibility)')
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

// --- Reports API ---
export const reportsApi = {
  async create(data: any) {
    const { data: result, error } = await supabase.from('reports').insert(data).select();
    if (error) throw error;
    return result;
  },
  async getAll() {
    const { data, error } = await supabase.from('reports').select('*, vocabularies(term_thai,id), users(name)');
    if (error) throw error;
    return data;
  },

  // ✅ ใหม่: ดึง report ของ user คนเดียว
  async getMine(userId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        vocabularies (
          id,
          term_thai,
          term_english
        )
      `)
      .eq('reported_by', userId)
      .order('reported_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('reports')       // ชื่อตารางต้องตรงเป๊ะ
      .update({ status })    // สั่งอัปเดตคอลัมน์ status
      .eq('id', id)          // เงื่อนไข: id ต้องตรงกับที่ส่งมา
      .select();             // (Optional) ขอข้อมูลที่อัปเดตแล้วคืนมา

    if (error) {
      console.error("Update Status Error:", error);
      throw error;
    }

    return data;
  },

  async delete(id: string) {
        const { error } = await supabase
            .from('reports')       
            .delete()            
            .eq('id', id);        

        if (error) {
            console.error("Delete Report Error:", error);
            throw error;
        }
        return true;
    }
};


// --- Users API (เพิ่มใหม่สำหรับ Admin) ---
export const usersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteUser(userId: string) {
    // ดึง session token เพื่อส่งไปยัง server route (ใช้ service role key ลบออกจาก Auth)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const result = await res.json();
    if (!result.ok) throw new Error(result.message ?? "ลบผู้ใช้ไม่สำเร็จ");
  },

  // ✅ เพิ่มอันนี้
  async updateRole(userId: string, role: UserRole) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch("/api/admin/change-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, newRole: role }),
    });

    const result = await res.json();
    if (!result.ok) throw new Error(result.message ?? "เปลี่ยน Role ไม่สำเร็จ");
  }
};


// --- Dashboard Helper (Optional: ช่วยรวมข้อมูลให้ง่ายขึ้น) ---
export const dashboardApi = {
  async getStats() {
    const [courses, vocabs, reports, users] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('vocabularies').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id, status, created_at'), // ดึง status มานับด้วย
      supabase.from('users').select('id', { count: 'exact', head: true })
    ]);

    return {
      coursesCount: courses.count || 0,
      vocabCount: vocabs.count || 0,
      usersCount: users.count || 0,
      totalReports: reports.data?.length || 0,
      pendingReports: reports.data?.filter(r => r.status === 'PENDING').length || 0,
      resolvedReports: reports.data?.filter(r => r.status === 'RESOLVED').length || 0,
      rejectedReports: reports.data?.filter(r => r.status === 'REJECTED').length || 0,
      recentReports: reports.data?.slice(0, 5) || [] // เอาแค่ 5 อันล่าสุด (ถ้าเรียงจาก DB แล้ว)
    };
  }
};

// --- Chapters API (เพิ่มใหม่) ---
export const chaptersApi = {
  async getAll(courseId?: string) {
    let query = supabase.from('chapters').select('*').order('name');

    // กรองตามวิชาที่เลือก
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  update: async (id: string, data: any) => {
    const { data: chapter, error } = await supabase
      .from('chapters')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return chapter;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async create(data: { name: string; course_id: string }) {
    // 1. หาค่า order สูงสุดที่มีอยู่ในคอร์สนี้ก่อน
    const { data: maxRecord, error: fetchError } = await supabase
      .from('chapters')
      .select('order')                // ดึงเฉพาะ field order
      .eq('course_id', data.course_id) // กรองเฉพาะวิชานี้
      .order('order', { ascending: false }) // เรียงจากมากไปน้อย
      .limit(1)                       // เอามาแค่ตัวแรก (ตัวที่ค่าเยอะสุด)
      .maybeSingle(); // ใช้ maybeSingle เพราะถ้ายังไม่มีบทเรียนเลย มันจะ return null (ไม่ error)

    if (fetchError) throw fetchError;

    // 2. คำนวณ order ใหม่ 
    // ถ้ามีข้อมูลเก่า (maxRecord.order) ให้เอามา +1
    // ถ้าไม่มีข้อมูลเก่า (เป็น null) ให้เริ่มที่ 1
    const nextOrder = (maxRecord?.order ?? 0) + 1;

    // 3. บันทึกข้อมูลใหม่พร้อม order ที่คำนวณได้
    const { data: result, error } = await supabase
      .from('chapters')
      .insert({
        ...data,
        order: nextOrder // ✅ ส่งค่า order ไปด้วยแล้ว!
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

};

// --- Upload API ---
// --- Upload API (ใช้เวอร์ชันนี้อันเดียวครับ) ---
export const uploadApi = {
  async uploadFile(file: File, type: 'image' | 'video') {
    // 1. เลือก Bucket
    const bucketName = type === 'image' ? 'images' : 'videos';

    // 2. ตั้งชื่อไฟล์ใหม่ (กันซ้ำ)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. อัปโหลด
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 4. ขอ URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  }
};




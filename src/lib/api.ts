
import { createClient } from './supabase';
import type { UserRole } from '@/types';



const supabase = createClient();

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// Handles user authentication: login, registration, logout, and session retrieval.
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {

  /**
   * Authenticates a user with email and password.
   * After signing in via Supabase Auth, the user's profile (including role) is
   * fetched from the `users` table and merged into the returned user object.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<{ user: object; token: string | undefined }>} The merged user profile and access token.
   * @throws {AuthError} If Supabase authentication fails.
   */
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Fetch the user's role and profile from the `users` table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Merge auth user data with profile data so the role is correct from the DB
    const fullUser = {
      ...data.user,
      ...profile
    };

    return {
      user: fullUser,
      token: data.session?.access_token
    };
  },

  /**
   * Registers a new user with email, password, name, and role.
   * Applies role enforcement: non-CMU email addresses are automatically assigned the MEMBER role.
   * After creating the auth account, the user's profile is inserted into the `users` table.
   *
   * @param {{ email: string; password: string; name: string; role: string }} data - Registration data.
   * @param {string} data.email - The user's email address.
   * @param {string} data.password - The user's chosen password.
   * @param {string} data.name - The user's display name.
   * @param {string} data.role - The requested role (may be overridden based on email domain).
   * @returns {Promise<{ user: object | null; token: string | undefined }>} The newly created user and session token.
   * @throws {AuthError} If sign-up fails.
   */
  async register(data: { email: string; password: string; name: string; role: string }) {
    let { email, password, name, role } = data;

    // Enforce role: non-CMU emails cannot register as STUDENT
    const isCmuMail = email.toLowerCase().endsWith('@cmu.ac.th');
    
    // ถ้าไม่มีการส่ง Role มา หรือส่งมาเป็น STUDENT แต่ใช้อีเมลนอก ให้บังคับเป็น MEMBER
    if (!role || (role === 'STUDENT' && !isCmuMail)) {
      role = isCmuMail ? 'STUDENT' : 'MEMBER';
    }

    // 1. Create the auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    if (authError) throw authError;

    // 2. Insert the user profile into the `users` table
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

  /**
   * Signs the current user out of their Supabase session.
   *
   * @returns {Promise<{ error: AuthError | null }>} The Supabase sign-out result.
   */
  async logout() {
    return await supabase.auth.signOut();
  },

  /**
   * Retrieves the currently authenticated user and merges their profile from the `users` table.
   *
   * @returns {Promise<object | null>} The merged user profile, or null if not authenticated.
   */
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

  /**
   * Redirects the browser to the CMU OAuth 2.0 authorization endpoint.
   * Uses environment variables for the client ID and redirect URI.
   */
  loginWithCMU() {
    const clientId = process.env.NEXT_PUBLIC_CMU_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/cmu/callback`;
    const authUrl = `https://oauth.cmu.ac.th/v1/Authorize.aspx?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=cmuitaccount.basicinfo`;

    window.location.href = authUrl;
  }

};


// ─────────────────────────────────────────────────────────────────────────────
// Courses API
// CRUD operations for the `courses` table.
// ─────────────────────────────────────────────────────────────────────────────
export const coursesApi = {
  /**
   * Retrieves all courses, ordered by name.
   *
   * @returns {Promise<object[]>} An array of all course records.
   * @throws {PostgrestError} If the query fails.
   */
  async getAll() {
    // เรียงตามชื่อวิชา หรือจะเปลี่ยนเป็น created_at ก็ได้
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  /**
   * Retrieves a single course by its ID, including all associated chapters (sorted by name).
   *
   * @param {string} id - The UUID of the course.
   * @returns {Promise<object>} The course record with an array of sorted chapters.
   * @throws {PostgrestError} If the course is not found or the query fails.
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        chapters (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Sort chapters alphabetically by name
    if (data.chapters) {
      data.chapters.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    return data;
  },

  /**
   * Creates a new course record.
   *
   * @param {object} data - The course data to insert.
   * @returns {Promise<object>} The newly created course record.
   * @throws {PostgrestError} If the insert fails.
   */
  async create(data: any) {
    const { data: result, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  /**
   * Updates an existing course record by its ID.
   *
   * @param {string} id - The UUID of the course to update.
   * @param {object} data - The partial course data to update.
   * @returns {Promise<object>} The updated course record.
   * @throws {PostgrestError} If the update fails.
   */
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

  /**
   * Deletes a course record by its ID.
   *
   * @param {string} id - The UUID of the course to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete fails.
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary API
// CRUD and search operations for the `vocabularies` table.
// ─────────────────────────────────────────────────────────────────────────────
export const vocabularyApi = {
  /**
   * Retrieves all vocabulary entries, optionally filtered by course.
   * Includes related course name/visibility and chapter name.
   *
   * @param {string} [courseId] - Optional course UUID to filter vocabularies by.
   * @returns {Promise<object[]>} An array of vocabulary records with related data.
   * @throws {PostgrestError} If the query fails.
   */
  async getAll(courseId?: string) {
    let query = supabase.from('vocabularies').select('*, courses(name, visibility), chapters(name)');

    // ถ้ามีการส่ง courseId มาให้กรองด้วย
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Retrieves a single vocabulary entry by its ID, including related course and chapter.
   *
   * @param {string} id - The UUID of the vocabulary entry.
   * @returns {Promise<object>} The vocabulary record with course and chapter data.
   * @throws {PostgrestError} If the entry is not found or the query fails.
   */
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

  /**
   * Searches vocabulary entries by Thai term using a case-insensitive partial match.
   * Optionally filtered by course.
   *
   * @param {string} keyword - The search term to match against the `term_thai` field.
   * @param {string} [courseId] - Optional course UUID to restrict the search scope.
   * @returns {Promise<object[]>} An array of matching vocabulary records.
   * @throws {PostgrestError} If the query fails.
   */
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

  /**
   * Creates a new vocabulary entry.
   *
   * @param {object} data - The vocabulary data to insert.
   * @returns {Promise<object>} The newly created vocabulary record.
   * @throws {PostgrestError} If the insert fails.
   */
  async create(data: any) {
    const { data: result, error } = await supabase.from('vocabularies').insert(data).select().single();
    if (error) throw error;
    return result;
  },

  /**
   * Updates an existing vocabulary entry by its ID.
   *
   * @param {string} id - The UUID of the vocabulary entry to update.
   * @param {object} data - The partial vocabulary data to update.
   * @returns {Promise<object>} The updated vocabulary record.
   * @throws {PostgrestError} If the update fails.
   */
  async update(id: string, data: any) {
    const { data: result, error } = await supabase.from('vocabularies').update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
  },

  /**
   * Deletes a vocabulary entry by its ID.
   *
   * @param {string} id - The UUID of the vocabulary entry to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete fails.
   */
  async delete(id: string) {
    const { error } = await supabase.from('vocabularies').delete().eq('id', id);
    if (error) throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Reports API
// CRUD and status management for content reports submitted by users.
// ─────────────────────────────────────────────────────────────────────────────
export const reportsApi = {
  /**
   * Creates a new content report entry.
   *
   * @param {object} data - The report data to insert.
   * @returns {Promise<object[]>} The newly created report record(s).
   * @throws {PostgrestError} If the insert fails.
   */
  async create(data: any) {
    const { data: result, error } = await supabase.from('reports').insert(data).select();
    if (error) throw error;
    return result;
  },

  /**
   * Retrieves all reports, including the related vocabulary term and the reporter's name.
   *
   * @returns {Promise<object[]>} An array of all report records with vocabulary and user data.
   * @throws {PostgrestError} If the query fails.
   */
  async getAll() {
    const { data, error } = await supabase.from('reports').select('*, vocabularies(term_thai,id), users(name)');
    if (error) throw error;
    return data;
  },

  /**
   * Retrieves all reports submitted by a specific user, ordered by most recent first.
   *
   * @param {string} userId - The UUID of the user whose reports to fetch.
   * @returns {Promise<object[]>} An array of report records with vocabulary details.
   * @throws {PostgrestError} If the query fails.
   */
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

  /**
   * Updates the status of a specific report (e.g., PENDING → RESOLVED or REJECTED).
   *
   * @param {string} id - The UUID of the report to update.
   * @param {string} status - The new status value (e.g., 'PENDING', 'RESOLVED', 'REJECTED').
   * @returns {Promise<object[]>} The updated report record(s).
   * @throws {PostgrestError} If the update fails.
   */
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Update Status Error:", error);
      throw error;
    }

    return data;
  },

  /**
   * Deletes a report by its ID.
   *
   * @param {string} id - The UUID of the report to delete.
   * @returns {Promise<true>} Returns true if deletion was successful.
   * @throws {PostgrestError} If the delete fails.
   */
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



export type UserRole = "ADMIN" | "LECTURER" | "INTERPRETER" | "STUDENT" | "MEMBER";

// ─────────────────────────────────────────────────────────────────────────────
// Users API
// Administrative operations for managing user accounts and roles.
// ─────────────────────────────────────────────────────────────────────────────
export const usersApi = {
  /**
   * Retrieves all users, ordered by creation date (most recent first).
   * Returns id, name, email, role, and created_at for each user.
   *
   * @returns {Promise<object[]>} An array of user records.
   * @throws {PostgrestError} If the query fails.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a user from Supabase Auth via the server-side admin route (`/api/admin/delete-user`).
   * Requires the caller to have an active session.
   *
   * @param {string} userId - The UUID of the user to delete.
   * @returns {Promise<void>}
   * @throws {Error} If the caller is not authenticated or the API call fails.
   */
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

  /**
   * Updates a user's role via the server-side admin route (`/api/admin/change-role`).
   * Requires the caller to have an active session.
   *
   * @param {string} userId - The UUID of the user whose role is being changed.
   * @param {UserRole} role - The new role to assign (e.g., 'ADMIN', 'LECTURER', 'STUDENT').
   * @returns {Promise<void>}
   * @throws {Error} If the caller is not authenticated or the API call fails.
   */
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


// ─────────────────────────────────────────────────────────────────────────────
// Dashboard API
// Aggregates statistics for the admin dashboard.
// ─────────────────────────────────────────────────────────────────────────────
export const dashboardApi = {
  /**
   * Fetches aggregate statistics for the admin dashboard in parallel.
   * Includes total counts for courses, vocabularies, and users,
   * as well as report counts grouped by status.
   *
   * @returns {Promise<{
   *   coursesCount: number;
   *   vocabCount: number;
   *   usersCount: number;
   *   totalReports: number;
   *   pendingReports: number;
   *   resolvedReports: number;
   *   rejectedReports: number;
   *   recentReports: object[];
   * }>} An object containing all aggregated statistics.
   * @throws {PostgrestError} If any of the parallel queries fail.
   */
  async getStats() {
    const [courses, vocabs, reports, users] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('vocabularies').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id, status, created_at'),
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
      recentReports: reports.data?.slice(0, 5) || []
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Chapters API
// CRUD operations for the `chapters` table (lessons within a course).
// ─────────────────────────────────────────────────────────────────────────────
export const chaptersApi = {
  /**
   * Retrieves all chapters, optionally filtered by course, ordered by name.
   *
   * @param {string} [courseId] - Optional course UUID to filter chapters by.
   * @returns {Promise<object[]>} An array of chapter records.
   * @throws {PostgrestError} If the query fails.
   */
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

  /**
   * Updates an existing chapter by its ID.
   *
   * @param {string} id - The UUID of the chapter to update.
   * @param {object} data - The partial chapter data to update.
   * @returns {Promise<object>} The updated chapter record.
   * @throws {PostgrestError} If the update fails.
   */
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

  /**
   * Deletes a chapter by its ID.
   *
   * @param {string} id - The UUID of the chapter to delete.
   * @returns {Promise<true>} Returns true if deletion was successful.
   * @throws {PostgrestError} If the delete fails.
   */
  delete: async (id: string) => {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Creates a new chapter within a course.
   * Automatically assigns the next sequential `order` value based on existing chapters.
   *
   * @param {{ name: string; course_id: string }} data - The chapter data.
   * @param {string} data.name - The display name of the chapter.
   * @param {string} data.course_id - The UUID of the parent course.
   * @returns {Promise<object>} The newly created chapter record with its assigned order.
   * @throws {PostgrestError} If the insert or order query fails.
   */
  async create(data: { name: string; course_id: string }) {
    // 1. Find the highest current order value for this course
    const { data: maxRecord, error: fetchError } = await supabase
      .from('chapters')
      .select('order')
      .eq('course_id', data.course_id)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 2. Compute next order: start at 1 if no chapters exist yet
    const nextOrder = (maxRecord?.order ?? 0) + 1;

    // 3. Insert the new chapter with the computed order
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

// ─────────────────────────────────────────────────────────────────────────────
// Upload API
// Handles file uploads (images and videos) to Supabase Storage.
// ─────────────────────────────────────────────────────────────────────────────
export const uploadApi = {
  /**
   * Uploads a file (image or video) to the appropriate Supabase Storage bucket
   * and returns its publicly accessible URL.
   * A timestamp-based filename is generated to prevent collisions.
   *
   * @param {File} file - The file object to upload.
   * @param {'image' | 'video'} type - The type of media being uploaded, determines the target bucket.
   * @returns {Promise<{ url: string }>} An object containing the public URL of the uploaded file.
   * @throws {StorageError} If the upload fails.
   */
  async uploadFile(file: File, type: 'image' | 'video') {
    // 1. Select the target bucket based on file type
    const bucketName = type === 'image' ? 'images' : 'videos';

    // 2. Generate a unique filename using timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload the file
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 4. Retrieve and return the public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  }
};




import { createClient } from './supabase';

const supabase = createClient();

/**
 * Client-side API for managing a user's pinned courses.
 * All methods automatically resolve the current authenticated user via Supabase Auth.
 * Most operations return empty results (rather than throwing) when the user is unauthenticated,
 * except for write operations which require authentication.
 */
export const pinCoursesApi = {
    /**
     * Retrieves the UUIDs of all courses pinned by the current user.
     * Returns an empty array if the user is not authenticated.
     *
     * @returns {Promise<string[]>} An array of course UUIDs that the user has pinned.
     * @throws {PostgrestError} If the query fails.
     */
    async getMyPinnedCourseIds(): Promise<string[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_pinned_courses')
            .select('course_id')
            .eq('user_id', user.id);

        if (error) throw error;
        return (data || []).map((item: any) => item.course_id);
    },

    /**
     * Retrieves all pinned courses with full course details for the current user,
     * ordered by most recently pinned.
     * Returns an empty array if the user is not authenticated.
     *
     * @returns {Promise<object[]>} An array of pin records with nested course data (id, name, code, description, image_url).
     * @throws {PostgrestError} If the query fails.
     */
    async getMyPinnedCourses() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_pinned_courses')
            .select(`
        id,
        created_at,
        courses (
          id,
          name,
          code,
          description,
          image_url
        )
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Checks whether a specific course is pinned by the current user.
     * Returns false if the user is not authenticated.
     *
     * @param {string} courseId - The UUID of the course to check.
     * @returns {Promise<boolean>} True if the course is pinned by the current user, false otherwise.
     * @throws {PostgrestError} If the query fails for a reason other than "not found" (PGRST116).
     */
    async isPinned(courseId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('user_pinned_courses')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    },

    /**
     * Pins a course for the current user.
     *
     * @param {string} courseId - The UUID of the course to pin.
     * @returns {Promise<object>} The newly created pin record.
     * @throws {Error} If the user is not authenticated, or if the course is already pinned (code 23505).
     * @throws {PostgrestError} If the insert fails.
     */
    async pin(courseId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน');

        const { data, error } = await supabase
            .from('user_pinned_courses')
            .insert({
                user_id: user.id,
                course_id: courseId,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new Error('รายวิชานี้ถูกปักหมุดไว้แล้ว');
            }
            throw error;
        }
        return data;
    },

    /**
     * Unpins a course for the current user.
     *
     * @param {string} courseId - The UUID of the course to unpin.
     * @returns {Promise<true>} Returns true if the removal was successful.
     * @throws {Error} If the user is not authenticated.
     * @throws {PostgrestError} If the delete fails.
     */
    async unpin(courseId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน');

        const { error } = await supabase
            .from('user_pinned_courses')
            .delete()
            .eq('user_id', user.id)
            .eq('course_id', courseId);

        if (error) throw error;
        return true;
    },

    /**
     * Toggles the pin status of a course for the current user.
     * If the course is already pinned, it will be unpinned; otherwise it will be pinned.
     *
     * @param {string} courseId - The UUID of the course to toggle.
     * @returns {Promise<boolean>} True if the course is now pinned, false if it was unpinned.
     */
    async togglePin(courseId: string): Promise<boolean> {
        const isPinned = await this.isPinned(courseId);
        if (isPinned) {
            await this.unpin(courseId);
            return false;
        } else {
            await this.pin(courseId);
            return true;
        }
    },
};

export default pinCoursesApi;

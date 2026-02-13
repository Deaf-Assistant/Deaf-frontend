import { createClient } from './supabase';

const supabase = createClient();

export const pinCoursesApi = {
    // Get all pinned course IDs for current user
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

    // Get all pinned courses with details
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

    // Check if a course is pinned
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

    // Pin a course
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

    // Unpin a course
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

    // Toggle pin status
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

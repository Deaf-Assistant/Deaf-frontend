import { createClient } from './supabase';

const supabase = createClient();

export const favoritesApi = {
  // Get all favorites for current user
  async getMyFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน');

    const { data, error } = await supabase
      .from('favoriteWord')
      .select(`
        id,
        created_at,
        vocabularies (
          id,
          term_thai,
          term_english,
          definition,
          image_url,
          video_url,
          course_id,
          courses (id, name, code)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Check if a vocabulary is favorited by current user
  async isFavorited(vocabularyId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favoriteWord')
      .select('id')
      .eq('user_id', user.id)
      .eq('vocabulary_id', vocabularyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Add vocabulary to favorites
  async addFavorite(vocabularyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน');

    const { data, error } = await supabase
      .from('favoriteWord')
      .insert({
        user_id: user.id,
        vocabulary_id: vocabularyId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('คำศัพท์นี้อยู่ในรายการโปรดแล้ว');
      }
      throw error;
    }
    return data;
  },

  // Remove vocabulary from favorites
  async removeFavorite(vocabularyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ต้องเข้าสู่ระบบก่อน');

    const { error } = await supabase
      .from('favoriteWord')
      .delete()
      .eq('user_id', user.id)
      .eq('vocabulary_id', vocabularyId);

    if (error) throw error;
    return true;
  },

  // Toggle favorite status
  async toggleFavorite(vocabularyId: string): Promise<boolean> {
    const isFav = await this.isFavorited(vocabularyId);
    if (isFav) {
      await this.removeFavorite(vocabularyId);
      return false;
    } else {
      await this.addFavorite(vocabularyId);
      return true;
    }
  },
};

export default favoritesApi;
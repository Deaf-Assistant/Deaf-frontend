import { createClient } from './supabase';

const supabase = createClient();

/**
 * Client-side API for managing a user's favorite vocabulary entries.
 * All methods automatically resolve the current authenticated user via Supabase Auth.
 * Operations require the user to be authenticated.
 */
export const favoritesApi = {
  /**
   * Retrieves all vocabulary entries marked as favorites by the current user,
   * ordered by most recently added. Includes full vocabulary details and course info.
   *
   * @returns {Promise<object[]>} An array of favorite records with nested vocabulary and course data.
   * @throws {Error} If the user is not authenticated.
   * @throws {PostgrestError} If the query fails.
   */
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

    console.log('[favoritesApi] raw data:', JSON.stringify(data?.[0]));
    console.log('[favoritesApi] error:', error);
    if (error) throw error;
    return data || [];
  },

  /**
   * Checks whether a specific vocabulary entry has been favorited by the current user.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry to check.
   * @returns {Promise<boolean>} True if the entry is in the user's favorites, false otherwise.
   * @throws {PostgrestError} If the query fails for a reason other than "not found" (PGRST116).
   */
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

  /**
   * Adds a vocabulary entry to the current user's favorites.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry to favorite.
   * @returns {Promise<object>} The newly created favorite record.
   * @throws {Error} If the user is not authenticated, or if the entry is already favorited (code 23505).
   * @throws {PostgrestError} If the insert fails.
   */
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

  /**
   * Removes a vocabulary entry from the current user's favorites.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry to remove.
   * @returns {Promise<true>} Returns true if the removal was successful.
   * @throws {Error} If the user is not authenticated.
   * @throws {PostgrestError} If the delete fails.
   */
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

  /**
   * Toggles the favorite status of a vocabulary entry for the current user.
   * If the entry is already favorited, it will be removed; otherwise it will be added.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry to toggle.
   * @returns {Promise<boolean>} True if the entry is now favorited, false if it was removed.
   */
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
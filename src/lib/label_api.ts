import { LabelTag, LabelCategory, VocabLabelTag } from '@/types/label';
import { createClient } from './supabase';

const supabase = createClient();

/**
 * Client-side API for managing label tags and their associations with vocabulary entries.
 * Provides CRUD operations for standalone label tags, vocabulary-label relationships,
 * and legacy label categories.
 */
export const labelTagsApi = {
  // ==================== Standalone Label Tags ====================

  /**
   * Retrieves all standalone label tags, ordered alphabetically by name.
   *
   * @returns {Promise<LabelTag[]>} An array of all label tag records.
   * @throws {PostgrestError} If the query fails.
   */
  async getAll(): Promise<LabelTag[]> {
    const { data, error } = await supabase
      .from('label_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Creates a new standalone label tag.
   *
   * @param {string} name - The display name for the label (will be trimmed).
   * @param {string} [color='#6366f1'] - The hex color code for the label badge.
   * @returns {Promise<LabelTag>} The newly created label tag record.
   * @throws {Error} If a label with the same name already exists (code 23505).
   * @throws {PostgrestError} If the insert fails.
   */
  async create(name: string, color: string = '#6366f1'): Promise<LabelTag> {
    const { data, error } = await supabase
      .from('label_tags')
      .insert({
        name: name.trim(),
        color: color,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Label นี้มีอยู่แล้ว');
      }
      throw error;
    }
    return data;
  },

  /**
   * Updates the name and/or color of an existing label tag.
   *
   * @param {string} labelId - The UUID of the label tag to update.
   * @param {{ name?: string; color?: string }} updates - The fields to update.
   * @param {string} [updates.name] - New display name (will be trimmed if provided).
   * @param {string} [updates.color] - New hex color code.
   * @returns {Promise<LabelTag>} The updated label tag record.
   * @throws {PostgrestError} If the update fails.
   */
  async update(labelId: string, updates: { name?: string; color?: string }): Promise<LabelTag> {
    const { data, error } = await supabase
      .from('label_tags')
      .update({
        name: updates.name?.trim(),
        color: updates.color,
      })
      .eq('id', labelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a standalone label tag by its ID.
   * Note: This will also cascade-delete any `vocab_label_tags` relationships using this tag.
   *
   * @param {string} labelId - The UUID of the label tag to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete fails.
   */
  async delete(labelId: string): Promise<void> {
    const { error } = await supabase
      .from('label_tags')
      .delete()
      .eq('id', labelId);

    if (error) throw error;
  },

  /**
   * Retrieves a sorted list of all unique label tag names.
   * Primarily used to populate autocomplete suggestions in the UI.
   *
   * @returns {Promise<string[]>} An array of label names ordered alphabetically.
   * @throws {PostgrestError} If the query fails.
   */
  async getUniqueNames(): Promise<string[]> {
    const { data, error } = await supabase
      .from('label_tags')
      .select('name')
      .order('name');

    if (error) throw error;
    return data?.map(t => t.name) || [];
  },

  // ==================== Vocab-Label Relationships ====================

  /**
   * Retrieves all label tags associated with a specific vocabulary entry.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry.
   * @returns {Promise<LabelTag[]>} An array of label tags linked to the vocabulary.
   * @throws {PostgrestError} If the query fails.
   */
  async getByVocabularyId(vocabularyId: string): Promise<LabelTag[]> {
    const { data, error } = await supabase
      .from('vocab_label_tags')
      .select(`
        id,
        label_tags (*)
      `)
      .eq('vocab_id', vocabularyId);

    if (error) throw error;
    if (!data) return [];
    return data.map(item => item.label_tags as unknown as LabelTag).filter(Boolean);
  },

  /**
   * Associates a label tag with a vocabulary entry.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry to tag.
   * @param {string} labelTagId - The UUID of the label tag to apply.
   * @returns {Promise<VocabLabelTag>} The newly created vocab-label relationship record.
   * @throws {Error} If the label is already applied to this vocabulary (code 23505).
   * @throws {PostgrestError} If the insert fails.
   */
  async addToVocabulary(vocabularyId: string, labelTagId: string): Promise<VocabLabelTag> {
    const { data, error } = await supabase
      .from('vocab_label_tags')
      .insert({
        vocab_id: vocabularyId,
        label_tag_id: labelTagId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Label นี้ถูกเพิ่มให้คำศัพท์นี้แล้ว');
      }
      throw error;
    }
    return data;
  },

  /**
   * Removes a label tag from a vocabulary entry.
   *
   * @param {string} vocabularyId - The UUID of the vocabulary entry.
   * @param {string} labelTagId - The UUID of the label tag to remove.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete fails.
   */
  async removeFromVocabulary(vocabularyId: string, labelTagId: string): Promise<void> {
    const { error } = await supabase
      .from('vocab_label_tags')
      .delete()
      .eq('vocab_id', vocabularyId)
      .eq('label_tag_id', labelTagId);

    if (error) throw error;
  },

  /**
   * Retrieves all vocab-label relationships with full label tag and vocabulary details,
   * ordered by most recently created.
   *
   * @returns {Promise<VocabLabelTag[]>} An array of all vocab-label relationship records with joined data.
   * @throws {PostgrestError} If the query fails.
   */
  async getAllVocabLabels(): Promise<VocabLabelTag[]> {
    const { data, error } = await supabase
      .from('vocab_label_tags')
      .select(`
        *,
        label_tags (*),
        vocabularies (id, term_thai, term_english)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ==================== Legacy - Label Categories ====================

  /**
   * @deprecated Use label tags instead.
   * Retrieves all legacy label categories, ordered alphabetically by name.
   *
   * @returns {Promise<LabelCategory[]>} An array of label category records.
   * @throws {PostgrestError} If the query fails.
   */
  async getCategories(): Promise<LabelCategory[]> {
    const { data, error } = await supabase
      .from('label_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * @deprecated Use label tags instead.
   * Creates a new legacy label category.
   *
   * @param {string} name - The display name for the category (will be trimmed).
   * @param {string} [color] - Optional hex color code (defaults to '#6366f1').
   * @param {string} [description] - Optional description for the category.
   * @returns {Promise<LabelCategory>} The newly created category record.
   * @throws {Error} If a category with the same name already exists (code 23505).
   * @throws {PostgrestError} If the insert fails.
   */
  async createCategory(name: string, color?: string, description?: string): Promise<LabelCategory> {
    const { data, error } = await supabase
      .from('label_categories')
      .insert({
        name: name.trim(),
        color: color || '#6366f1',
        description: description?.trim(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('หมวดหมู่นี้มีอยู่แล้ว');
      }
      throw error;
    }
    return data;
  },

  /**
   * @deprecated Use label tags instead.
   * Deletes a legacy label category by its ID.
   *
   * @param {string} categoryId - The UUID of the category to delete.
   * @returns {Promise<void>}
   * @throws {PostgrestError} If the delete fails.
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('label_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },
};

export default labelTagsApi;
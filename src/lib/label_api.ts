import { LabelTag, LabelCategory, VocabLabelTag } from '@/types/label';
import { createClient } from './supabase';

const supabase = createClient();

export const labelTagsApi = {
  // ==================== Standalone Label Tags ====================

  // Get all standalone label tags
  async getAll(): Promise<LabelTag[]> {
    const { data, error } = await supabase
      .from('label_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Create a new standalone label tag
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

  // Update a label tag
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

  // Delete a standalone label tag
  async delete(labelId: string): Promise<void> {
    const { error } = await supabase
      .from('label_tags')
      .delete()
      .eq('id', labelId);

    if (error) throw error;
  },

  // Get unique label names (for autocomplete)
  async getUniqueNames(): Promise<string[]> {
    const { data, error } = await supabase
      .from('label_tags')
      .select('name')
      .order('name');

    if (error) throw error;
    return data?.map(t => t.name) || [];
  },

  // ==================== Vocab-Label Relationships ====================

  // Get all labels for a vocabulary
  async getByVocabularyId(vocabularyId: string): Promise<LabelTag[]> {
    const { data, error } = await supabase
      .from('vocab_label_tags')
      .select(`
        id,
        label_tags (*)
      `)
      .eq('vocab_id', vocabularyId);

    if (error) throw error;
    // Extract the label_tags from the joined data
    if (!data) return [];
    return data.map(item => item.label_tags as unknown as LabelTag).filter(Boolean);
  },

  // Add a label to a vocabulary
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

  // Remove a label from a vocabulary
  async removeFromVocabulary(vocabularyId: string, labelTagId: string): Promise<void> {
    const { error } = await supabase
      .from('vocab_label_tags')
      .delete()
      .eq('vocab_id', vocabularyId)
      .eq('label_tag_id', labelTagId);

    if (error) throw error;
  },

  // Get all vocab-label relationships with full data
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

  async getCategories(): Promise<LabelCategory[]> {
    const { data, error } = await supabase
      .from('label_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

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

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('label_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },
};

export default labelTagsApi;
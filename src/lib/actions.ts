import { createClient } from '@/lib/supabase';

const supabase = createClient();


type ViewType = 'courses' | 'chapters' | 'vocabularies';

export const incrementView = async (type: ViewType, id: string) => {
  try {
 
    const { error } = await supabase.rpc('increment_view', {
      table_name: type,
      row_id: id
    });

    if (error) console.error(`Error counting view for ${type}:`, error.message);
  } catch (err) {
    console.error("View count error:", err);
  }
};
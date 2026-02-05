// Standalone Label Tag (many-to-many with vocabularies)
export interface LabelTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// Junction table for vocab-label relationship
export interface VocabLabelTag {
  id: string;
  vocab_id: string;
  label_tag_id: string;
  created_at: string;
  // Joined data
  label_tags?: LabelTag;
  vocabularies?: {
    id: string;
    term_thai: string;
    term_english?: string;
  };
}

// Legacy - can be removed later
export interface LabelCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}
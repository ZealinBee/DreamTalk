export interface Category {
  id: string;
  name: string;
  user_id: string | null; // null for default categories
  created_at: string;
  updated_at: string;
}

export interface Recording {
  id: string;
  user_id: string;
  category_id: string | null;
  filename: string;
  audio_url: string;
  raw_text: string;
  summarized_text: string;
  created_at: string;
  updated_at: string;
}

// Type for creating a new recording (without auto-generated fields)
export type CreateRecording = Omit<Recording, 'id' | 'created_at' | 'updated_at'>;

// Type for creating a new category (without auto-generated fields)
export type CreateCategory = Omit<Category, 'id' | 'created_at' | 'updated_at'>;

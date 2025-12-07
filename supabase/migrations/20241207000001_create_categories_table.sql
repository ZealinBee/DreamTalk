-- Create categories table
-- Categories can be default (global) or user-specific
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure category names are unique per user (or globally for default categories)
  UNIQUE(name, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Insert default categories (user_id is NULL for default categories)
INSERT INTO categories (name, user_id) VALUES
  ('sleep', NULL),
  ('shower', NULL);

-- Add RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can see default categories (user_id IS NULL) and their own categories
CREATE POLICY "Users can view default and own categories"
  ON categories
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Users can insert their own categories
CREATE POLICY "Users can create own categories"
  ON categories
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own categories (not default ones)
CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own categories (not default ones)
CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  USING (user_id = auth.uid());

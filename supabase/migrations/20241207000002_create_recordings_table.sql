-- Create recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  summarized_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_category_id ON recordings(category_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

-- Add RLS policies
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recordings
CREATE POLICY "Users can view own recordings"
  ON recordings
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own recordings
CREATE POLICY "Users can create own recordings"
  ON recordings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own recordings
CREATE POLICY "Users can update own recordings"
  ON recordings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own recordings
CREATE POLICY "Users can delete own recordings"
  ON recordings
  FOR DELETE
  USING (user_id = auth.uid());

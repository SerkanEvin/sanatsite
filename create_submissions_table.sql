-- Create table for artist artwork submissions
CREATE TABLE artwork_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Policy to allow artists to insert their own submissions (if RLS is enabled, but for now we rely on app logic)
-- Note: You might need to enable RLS and add policies if you haven't already.

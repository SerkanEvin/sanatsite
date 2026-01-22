-- 1. Create artwork_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.artwork_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add orientation column to artworks table (safe to run even if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artworks' AND column_name = 'orientation') THEN
        ALTER TABLE public.artworks ADD COLUMN orientation text DEFAULT 'horizontal';
    END IF;
END $$;

-- 3. Add orientation column to artwork_submissions table (safe to run even if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artwork_submissions' AND column_name = 'orientation') THEN
        ALTER TABLE public.artwork_submissions ADD COLUMN orientation text DEFAULT 'horizontal';
    END IF;
END $$;

-- Add orientation column to artworks table
ALTER TABLE public.artworks
ADD COLUMN IF NOT EXISTS orientation text DEFAULT 'horizontal';

-- Add orientation column to artwork_submissions table
ALTER TABLE public.artwork_submissions
ADD COLUMN IF NOT EXISTS orientation text DEFAULT 'horizontal';

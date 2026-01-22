-- Add missing phone column to artist_applications table
-- Run this in your Supabase SQL Editor

ALTER TABLE artist_applications 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artist_applications'
ORDER BY ordinal_position;

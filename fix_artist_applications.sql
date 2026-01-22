-- Fix artist_applications table to allow NULL user_id
-- Run this in Supabase SQL Editor

-- First, drop the foreign key constraint
ALTER TABLE artist_applications 
DROP CONSTRAINT IF EXISTS artist_applications_user_id_fkey;

-- Make user_id nullable if it isn't already
ALTER TABLE artist_applications 
ALTER COLUMN user_id DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'artist_applications' 
AND column_name = 'user_id';

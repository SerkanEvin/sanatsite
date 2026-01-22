-- Fix profimages bucket storage policies
-- Run this in Supabase SQL Editor

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Create policy for public read access
CREATE POLICY "Public read access for profimages"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profimages' );

-- Create policy for authenticated users to upload
CREATE POLICY "Authenticated upload to profimages"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profimages' 
  AND auth.role() = 'authenticated'
);

-- Create policy for authenticated users to update their uploads
CREATE POLICY "Authenticated update in profimages"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'profimages' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'profimages' AND auth.role() = 'authenticated' );

-- Create policy for authenticated users to delete their uploads
CREATE POLICY "Authenticated delete in profimages"
ON storage.objects FOR DELETE
USING ( bucket_id = 'profimages' AND auth.role() = 'authenticated' );

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profimages%';

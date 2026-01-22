-- SQL for Image Migration to Supabase Storage
-- Run this in the Supabase SQL Editor

-- 1. Update Artist Profile Photos (Bucket: profimages)
UPDATE artists SET avatar_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/profimages/artist_1.png' WHERE name = 'Elena Martinez';
UPDATE artists SET avatar_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/profimages/artist_2.png' WHERE name = 'James Chen';
UPDATE artists SET avatar_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/profimages/artist_3.png' WHERE name = 'Sophie Andersson';
UPDATE artists SET avatar_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/profimages/artist_4.png' WHERE name = 'Marcus Williams';
UPDATE artists SET avatar_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/profimages/artist_5.png' WHERE name = 'Isabella Rodriguez';

-- 2. Update Artworks (Bucket: images)
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/eternal_sunset.png' WHERE title = 'Eternal Sunset';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/urban_solitude.png' WHERE title = 'Urban Solitude';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/neon_dreamscape.png' WHERE title = 'Neon Dreamscape';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/cybernetic_forest.png' WHERE title = 'Cybernetic Forest';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/floral_whimsy.png' WHERE title = 'Floral Whimsy';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/abstract_flow.png' WHERE title = 'Abstract Flow';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/golden_hour_peak.png' WHERE title = 'Golden Hour Peak';
UPDATE artworks SET image_url = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/geometric_harmony.png' WHERE title = 'Geometric Harmony';

-- Delete artist and all related data
-- Replace 'ARTIST_ID_HERE' with the actual artist ID

-- First, delete all artworks by this artist
DELETE FROM artworks 
WHERE artist_id = 'ARTIST_ID_HERE';

-- Delete all artwork submissions by this artist
DELETE FROM artwork_submissions 
WHERE artist_id = 'ARTIST_ID_HERE';

-- Finally, delete the artist
DELETE FROM artists 
WHERE id = 'ARTIST_ID_HERE';

-- Verify deletion
SELECT * FROM artists WHERE id = 'ARTIST_ID_HERE';
-- Should return no results

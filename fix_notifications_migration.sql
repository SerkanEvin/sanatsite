-- 1. Rename customer_artist_follows to artist_follows if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_artist_follows') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_follows') THEN
        ALTER TABLE customer_artist_follows RENAME TO artist_follows;
    END IF;
END $$;

-- 2. Ensure artist_follows has user_id instead of customer_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_follows' AND column_name = 'customer_id') THEN
        ALTER TABLE artist_follows RENAME COLUMN customer_id TO user_id;
    END IF;
END $$;

-- 3. Rename customer_notifications to notifications if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_notifications') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE customer_notifications RENAME TO notifications;
    END IF;
END $$;

-- 4. Ensure notifications has user_id instead of customer_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'customer_id') THEN
        ALTER TABLE notifications RENAME COLUMN customer_id TO user_id;
    END IF;
END $$;

-- 5. Update the notification trigger function
CREATE OR REPLACE FUNCTION notify_followers_on_new_artwork()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notifications for all followers of the artist
    -- Using the corrected table and column names
    INSERT INTO notifications (user_id, notification_type, title, message, related_artwork_id, related_artist_id)
    SELECT 
        af.user_id,
        'new_artwork',
        'New Artwork Available',
        'An artist you follow has added a new artwork: ' || NEW.title,
        NEW.id,
        NEW.artist_id
    FROM artist_follows af
    WHERE af.artist_id = NEW.artist_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Re-create the trigger to ensure it uses the new function
DROP TRIGGER IF EXISTS trigger_notify_followers_on_new_artwork ON artworks;
CREATE TRIGGER trigger_notify_followers_on_new_artwork
    AFTER INSERT ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION notify_followers_on_new_artwork();

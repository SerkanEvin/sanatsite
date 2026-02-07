-- ============================================
-- CLEANUP SCRIPT FOR DUPLICATE DELIVERY SETTINGS
-- Run this in Supabase SQL Editor to fix the duplicate rows issue
-- ============================================

-- First, let's see what we have
SELECT * FROM delivery_settings;

-- Delete all rows from delivery_settings
DELETE FROM delivery_settings;

-- Insert only ONE row with the correct settings
INSERT INTO delivery_settings (standard_delivery_days, busy_day_penalty_days)
VALUES (3, 1);

-- Verify we now have only 1 row
SELECT * FROM delivery_settings;

-- ============================================
-- DELIVERY SYSTEM DATABASE MIGRATION
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Create delivery settings table
CREATE TABLE IF NOT EXISTS delivery_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_delivery_days INTEGER NOT NULL DEFAULT 3,
    busy_day_penalty_days INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings (3 days standard, 1 day penalty per busy day)
INSERT INTO delivery_settings (standard_delivery_days, busy_day_penalty_days)
VALUES (3, 1)
ON CONFLICT DO NOTHING;

-- 2. Create busy days table
CREATE TABLE IF NOT EXISTS busy_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    busy_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_busy_days_date ON busy_days(busy_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on delivery_settings
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read delivery settings
CREATE POLICY "Allow public read access to delivery settings"
ON delivery_settings FOR SELECT
TO authenticated, anon
USING (true);

-- Allow authenticated users to update delivery settings
CREATE POLICY "Allow authenticated users to update delivery settings"
ON delivery_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert delivery settings
CREATE POLICY "Allow authenticated users to insert delivery settings"
ON delivery_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable RLS on busy_days
ALTER TABLE busy_days ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read busy days
CREATE POLICY "Allow public read access to busy days"
ON busy_days FOR SELECT
TO authenticated, anon
USING (true);

-- Allow authenticated users to insert busy days
CREATE POLICY "Allow authenticated users to insert busy days"
ON busy_days FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete busy days
CREATE POLICY "Allow authenticated users to delete busy days"
ON busy_days FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify the tables were created
-- ============================================

-- Check delivery settings
SELECT * FROM delivery_settings;

-- Check busy days table (will be empty initially)
SELECT * FROM busy_days;


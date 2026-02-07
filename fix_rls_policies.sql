-- ============================================
-- VERIFY AND FIX RLS POLICIES
-- Run this to check and fix Row Level Security policies
-- ============================================

-- First, let's drop any existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access to busy days" ON busy_days;
DROP POLICY IF EXISTS "Allow authenticated users to insert busy days" ON busy_days;
DROP POLICY IF EXISTS "Allow authenticated users to delete busy days" ON busy_days;
DROP POLICY IF EXISTS "Allow public read access to delivery settings" ON delivery_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update delivery settings" ON delivery_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert delivery settings" ON delivery_settings;

-- Enable RLS on both tables
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE busy_days ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_settings
CREATE POLICY "Allow public read access to delivery settings"
ON delivery_settings FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to update delivery settings"
ON delivery_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert delivery settings"
ON delivery_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policies for busy_days
CREATE POLICY "Allow public read access to busy days"
ON busy_days FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert busy days"
ON busy_days FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete busy days"
ON busy_days FOR DELETE
TO authenticated
USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('delivery_settings', 'busy_days')
ORDER BY tablename, policyname;

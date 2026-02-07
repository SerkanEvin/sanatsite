-- Create busy days table
CREATE TABLE IF NOT EXISTS busy_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    busy_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_busy_days_date ON busy_days(busy_date);

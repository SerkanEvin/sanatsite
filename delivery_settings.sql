-- Create delivery settings table
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

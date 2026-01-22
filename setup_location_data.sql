-- Create Countries Table
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
);

-- Create Cities (Provinces) Table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- Create Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Create Policies (Read-only for everyone)
CREATE POLICY "Enable read access for all users" ON countries FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON cities FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON districts FOR SELECT USING (true);

-- Seed Data: Turkey (Sample)
-- Insert Turkey
INSERT INTO countries (name, code) VALUES ('Turkey', 'TR') ON CONFLICT (code) DO NOTHING;

-- Get Turkey ID
DO $$
DECLARE
    tr_id INTEGER;
    ist_id INTEGER;
    ank_id INTEGER;
    iz_id INTEGER;
BEGIN
    SELECT id INTO tr_id FROM countries WHERE code = 'TR';

    -- Insert Major Cities
    INSERT INTO cities (country_id, name) VALUES (tr_id, 'Istanbul') RETURNING id INTO ist_id;
    INSERT INTO cities (country_id, name) VALUES (tr_id, 'Ankara') RETURNING id INTO ank_id;
    INSERT INTO cities (country_id, name) VALUES (tr_id, 'Izmir') RETURNING id INTO iz_id;

    -- Insert Districts for Istanbul
    INSERT INTO districts (city_id, name) VALUES 
    (ist_id, 'Kadikoy'),
    (ist_id, 'Besiktas'),
    (ist_id, 'Sisli'),
    (ist_id, 'Uskudar'),
    (ist_id, 'Beyoglu'),
    (ist_id, 'Fatih'),
    (ist_id, 'Maltepe');

    -- Insert Districts for Ankara
    INSERT INTO districts (city_id, name) VALUES 
    (ank_id, 'Cankaya'),
    (ank_id, 'Keçiören'),
    (ank_id, 'Mamak'),
    (ank_id, 'Etimesgut');

    -- Insert Districts for Izmir
    INSERT INTO districts (city_id, name) VALUES 
    (iz_id, 'Konak'),
    (iz_id, 'Karsiyaka'),
    (iz_id, 'Bornova'),
    (iz_id, 'Buca');
END $$;

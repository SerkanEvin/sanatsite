
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
    const { data: artists } = await supabase.from('artists').select('id, name');
    const { data: artworks } = await supabase.from('artworks').select('id, title');

    fs.writeFileSync('diagnostic_data.json', JSON.stringify({ artists, artworks }, null, 2));
}

run();

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const initialInfluencers = require('../models/influencerData');

const LOCAL_DB_PATH = path.join(__dirname, '..', 'localDb.json');

let supabase = null;
let useSupabase = false;

// Check env variables and initialize Supabase if possible
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Supabase credentials detected. Testing connection...');
  } catch (error) {
    console.error('[DB] Failed to initialize Supabase client:', error.message);
  }
}

/**
 * Initialize Database (seeds mock data if database is empty)
 */
async function initializeDb() {
  if (supabase) {
    try {
      // Test querying influencers table
      const { data, error } = await supabase.from('influencers').select('count', { count: 'exact', head: true });
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('[DB] Connected to Supabase successfully.');
      useSupabase = true;

      // If database is empty, seed it
      const { count } = await supabase.from('influencers').select('*', { count: 'exact', head: true });
      if (count === 0) {
        console.log('[DB] Supabase tables are empty. Seeding initial influencers...');
        const { error: seedError } = await supabase.from('influencers').insert(
          initialInfluencers.map(inf => ({
            ...inf,
            // Convert arrays and objects to JSON strings/arrays if required, but Supabase handles them automatically if columns are text[] / jsonb
          }))
        );
        if (seedError) {
          console.error('[DB] Error seeding Supabase:', seedError.message);
        } else {
          console.log('[DB] Seeding completed.');
        }
      }
      return;
    } catch (err) {
      console.warn(`[DB] Supabase connection failed or tables not configured: "${err.message}". Falling back to local JSON DB.`);
      console.warn('[DB] Please execute the SQL schema in your Supabase dashboard to enable database operations.');
    }
  }

  // Fallback Local JSON DB
  console.log('[DB] Operating in local file-backed JSON mode.');
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    console.log('[DB] Seeding local file database...');
    writeLocalDb({ influencers: initialInfluencers, brands: [] });
  }
}

// Local Helper: Read JSON database
function readLocalDb() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      return { influencers: initialInfluencers, brands: [] };
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading local file database, resetting:', err.message);
    return { influencers: initialInfluencers, brands: [] };
  }
}

// Local Helper: Write JSON database
function writeLocalDb(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing local file database:', err.message);
  }
}

/**
 * Fetch all influencers
 */
async function getInfluencers(filters = {}) {
  if (useSupabase) {
    let query = supabase.from('influencers').select('*');

    if (filters.platform) {
      query = query.ilike('platform', filters.platform);
    }
    if (filters.niche) {
      // Assuming niche is text[] in Supabase, using overlapping/contained check
      // For simple queries, we can check if the niche string is present
      query = query.filter('niche', 'cs', `{${filters.niche}}`);
    }
    if (filters.minFollowers) {
      query = query.gte('followers', parseInt(filters.minFollowers));
    }
    if (filters.maxFollowers) {
      query = query.lte('followers', parseInt(filters.maxFollowers));
    }
    if (filters.minEngagement) {
      query = query.gte('engagement_rate', parseFloat(filters.minEngagement));
    }

    const { data, error } = await query;
    if (!error) return data;
    console.error('[DB] Supabase error fetching influencers:', error.message);
  }

  // Fallback to local db
  const db = readLocalDb();
  let results = [...db.influencers];

  if (filters.platform) {
    results = results.filter(i => i.platform.toLowerCase() === filters.platform.toLowerCase());
  }
  if (filters.niche) {
    results = results.filter(i => i.niche.some(n => n.toLowerCase().includes(filters.niche.toLowerCase())));
  }
  if (filters.minFollowers) {
    results = results.filter(i => i.followers >= parseInt(filters.minFollowers));
  }
  if (filters.maxFollowers) {
    results = results.filter(i => i.followers <= parseInt(filters.maxFollowers));
  }
  if (filters.minEngagement) {
    results = results.filter(i => i.engagement_rate >= parseFloat(filters.minEngagement));
  }

  return results;
}

/**
 * Fetch single influencer by ID
 */
async function getInfluencerById(id) {
  if (useSupabase) {
    const { data, error } = await supabase.from('influencers').select('*').eq('id', id).single();
    if (!error) return data;
    console.error('[DB] Supabase error fetching influencer by ID:', error.message);
  }

  const db = readLocalDb();
  return db.influencers.find(i => i.id === id) || null;
}

/**
 * Save / Insert new influencer
 */
async function saveInfluencer(influencer) {
  if (useSupabase) {
    const { data, error } = await supabase.from('influencers').insert([influencer]).select().single();
    if (!error) return data;
    console.error('[DB] Supabase error saving influencer:', error.message);
  }

  const db = readLocalDb();
  db.influencers.push(influencer);
  writeLocalDb(db);
  return influencer;
}

/**
 * Update existing influencer
 */
async function updateInfluencer(id, updates) {
  if (useSupabase) {
    const { data, error } = await supabase.from('influencers').update(updates).eq('id', id).select().single();
    if (!error) return data;
    console.error('[DB] Supabase error updating influencer:', error.message);
  }

  const db = readLocalDb();
  const idx = db.influencers.findIndex(i => i.id === id);
  if (idx !== -1) {
    db.influencers[idx] = { ...db.influencers[idx], ...updates };
    writeLocalDb(db);
    return db.influencers[idx];
  }
  return null;
}

/**
 * Save brand profile
 */
async function saveBrand(brandProfile) {
  const brandWithId = {
    id: `brand_${Date.now()}`,
    ...brandProfile,
    created_at: new Date().toISOString()
  };

  if (useSupabase) {
    const { data, error } = await supabase.from('brands').insert([brandWithId]).select().single();
    if (!error) return data;
    console.error('[DB] Supabase error saving brand:', error.message);
  }

  const db = readLocalDb();
  db.brands = db.brands || [];
  db.brands.push(brandWithId);
  writeLocalDb(db);
  return brandWithId;
}

/**
 * Get all brand profiles
 */
async function getBrands() {
  if (useSupabase) {
    const { data, error } = await supabase.from('brands').select('*').order('created_at', { ascending: false });
    if (!error) return data;
    console.error('[DB] Supabase error fetching brands:', error.message);
  }

  const db = readLocalDb();
  return db.brands || [];
}

module.exports = {
  initializeDb,
  getInfluencers,
  getInfluencerById,
  saveInfluencer,
  updateInfluencer,
  saveBrand,
  getBrands
};

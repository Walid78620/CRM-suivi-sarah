import { Pool } from '@neondatabase/serverless';

// Check several common environment variable names used by Neon/Netlify
const ENV_CANDIDATES = [
  'NEON_DATABASE_URL',
  'NETLIFY_DATABASE_URL',
  'NETLIFY_DATABASE_URL_UNPOOLED',
  'DATABASE_URL'
];

let foundEnv = null;
let connectionString = null;
for (const name of ENV_CANDIDATES) {
  if (process.env[name]) {
    foundEnv = name;
    connectionString = process.env[name];
    break;
  }
}

let pool;
if (!connectionString) {
  console.error('DB connection string not found. Checked:', ENV_CANDIDATES.join(', '));
  pool = {
    query: async () => {
      throw new Error(
        'Database connection string not set. Please add one of: ' + ENV_CANDIDATES.join(', ') +
        " in Netlify Site settings → Build & deploy → Environment variables."
      );
    }
  };
} else {
  // Log which env var was used without printing the secret itself
  console.log('DB connection env var found:', foundEnv);
  try {
    pool = new Pool({ connectionString });
  } catch (e) {
    console.error('Failed to create DB pool:', e && e.message ? e.message : e);
    // Fallback stub that surfaces a clear error if used
    pool = { query: async () => { throw new Error('Failed to initialize DB pool: ' + (e && e.message ? e.message : String(e))); } };
  }
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
};

// Ensure responses explicitly declare JSON content type so browsers/fetch can parse reliably
export const defaultHeaders = Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, cors);

export function ok(body, code = 200) {
  return { statusCode: code, headers: defaultHeaders, body: body !== undefined ? JSON.stringify(body) : '' };
}
export function bad(msg, code = 400) { return ok({ error: String(msg) }, code); }
export function error(e) { console.error(e); return ok({ error: e.message || 'Server error' }, 500); }
export function preflight() { return { statusCode: 200, headers: cors, body: '' }; }

export function buildInsert(table, obj) {
  const keys = Object.keys(obj);
  if (!keys.length) throw new Error('Empty payload');
  // Convert keys to lowercase to match DB columns created without quotes
  const cols = keys.map(k => `"${k.toLowerCase()}"`).join(',');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
  const values = keys.map(k => obj[k]);
  return { text: `insert into ${table} (${cols}) values (${placeholders}) returning *`, values };
}
export function buildUpdate(table, id, patch) {
  const keys = Object.keys(patch).filter(k => k !== 'id');
  if (!keys.length) throw new Error('Nothing to update');
  // Convert column names to lowercase to match DB columns
  const sets = keys.map((k, i) => `"${k.toLowerCase()}" = $${i + 2}`).join(', ');
  const values = [id, ...keys.map(k => patch[k])];
  return { text: `update ${table} set ${sets} where id = $1 returning *`, values };
}

export { pool, foundEnv };

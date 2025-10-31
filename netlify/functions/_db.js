import { Pool } from '@neondatabase/serverless';

// Accept multiple env var names (Neon / Netlify DB integration)
const connectionString = process.env.NEON_DATABASE_URL
  || process.env.NETLIFY_DATABASE_URL
  || process.env.NETLIFY_DATABASE_URL_UNPOOLED
  || process.env.DATABASE_URL
  || null;

let pool;
if (!connectionString) {
  console.error('DB connection string not found in env. Checked: NEON_DATABASE_URL, NETLIFY_DATABASE_URL, NETLIFY_DATABASE_URL_UNPOOLED, DATABASE_URL');
  pool = {
    query: async () => {
      throw new Error('Database connection string (NEON_DATABASE_URL / NETLIFY_DATABASE_URL / NETLIFY_DATABASE_URL_UNPOOLED / DATABASE_URL) is not set. Configure it in Netlify Site settings → Build & deploy → Environment variables.');
    }
  };
} else {
  console.log('Using DB connection from environment variable (length):', connectionString.length);
  pool = new Pool({ connectionString });
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
};

export function ok(body, code = 200) {
  return { statusCode: code, headers: cors, body: body !== undefined ? JSON.stringify(body) : '' };
}
export function bad(msg, code = 400) { return ok({ error: String(msg) }, code); }
export function error(e) { console.error(e); return ok({ error: e.message || 'Server error' }, 500); }
export function preflight() { return { statusCode: 200, headers: cors, body: '' }; }

export function buildInsert(table, obj) {
  const keys = Object.keys(obj);
  if (!keys.length) throw new Error('Empty payload');
  const cols = keys.map(k => `"${k}"`).join(',');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
  const values = keys.map(k => obj[k]);
  return { text: `insert into ${table} (${cols}) values (${placeholders}) returning *`, values };
}
export function buildUpdate(table, id, patch) {
  const keys = Object.keys(patch).filter(k => k !== 'id');
  if (!keys.length) throw new Error('Nothing to update');
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
  const values = [id, ...keys.map(k => patch[k])];
  return { text: `update ${table} set ${sets} where id = $1 returning *`, values };
}

export { pool };
import { Pool } from '@neondatabase/serverless';

// Prefer NEON_DATABASE_URL (explicit). Accept NETLIFY_DATABASE_URL or DATABASE_URL as fallback.
const connectionString = process.env.NEON_DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || null;

let pool;
if(!connectionString){
  console.error('NEON_DATABASE_URL / NETLIFY_DATABASE_URL / DATABASE_URL not set in environment. DB calls will fail.');
  // Provide a stub that throws a clear error when used by handlers
  pool = {
    query: async ()=>{
      throw new Error('NEON_DATABASE_URL (or NETLIFY_DATABASE_URL / DATABASE_URL) is not set. Set it in Netlify site settings → Build & deploy → Environment variables.');
    }
  };
} else {
  pool = new Pool({ connectionString });
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
};

export function ok(body, code = 200) {
  return { statusCode: code, headers: cors, body: body !== undefined ? JSON.stringify(body) : '' };
}
export function bad(msg, code = 400) { return ok({ error: String(msg) }, code); }
export function error(e) { console.error(e); return ok({ error: e.message || 'Server error' }, 500); }
export function preflight() { return { statusCode: 200, headers: cors, body: '' }; }

export function buildInsert(table, obj) {
  const keys = Object.keys(obj);
  if (!keys.length) throw new Error('Empty payload');
  const cols = keys.map(k => `"${k}"`).join(',');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
  const values = keys.map(k => obj[k]);
  return { text: `insert into ${table} (${cols}) values (${placeholders}) returning *`, values };
}
export function buildUpdate(table, id, patch) {
  const keys = Object.keys(patch).filter(k => k !== 'id');
  if (!keys.length) throw new Error('Nothing to update');
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
  const values = [id, ...keys.map(k => patch[k])];
  return { text: `update ${table} set ${sets} where id = $1 returning *`, values };
}

export { pool };
import { neon } from '@netlify/neon';
const sql = neon(); 
const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;

export const sql = new neon({ connectionString: process.env.NETLIFY_DATABASE_URL });
export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
};

export function ok(body, code = 200) {
  return { statusCode: code, headers: cors, body: body !== undefined ? JSON.stringify(body) : '' };
}
export function bad(msg, code = 400) { return ok({ error: String(msg) }, code); }
export function error(e) { console.error(e); return ok({ error: e.message || 'Server error' }, 500); }
export function preflight() { return { statusCode: 200, headers: cors, body: '' }; }

export function buildInsert(table, obj) {
  const keys = Object.keys(obj);
  if (!keys.length) throw new Error('Empty payload');
  const cols = keys.map(k => `"${k}"`).join(',');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
  const values = keys.map(k => obj[k]);
  return { text: `insert into ${table} (${cols}) values (${placeholders}) returning *`, values };
}
export function buildUpdate(table, id, patch) {
  const keys = Object.keys(patch).filter(k => k !== 'id');
  if (!keys.length) throw new Error('Nothing to update');
  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
  const values = [id, ...keys.map(k => patch[k])];
  return { text: `update ${table} set ${sets} where id = $1 returning *`, values };
}

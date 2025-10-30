import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

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

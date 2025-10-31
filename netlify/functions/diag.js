import { pool, cors, foundEnv } from '../_db.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  const result = { envCandidates: {}, foundEnv: foundEnv || null, tables: {}, errors: [] };
  try {
    // Check presence of common env vars
    ['NEON_DATABASE_URL','NETLIFY_DATABASE_URL','NETLIFY_DATABASE_URL_UNPOOLED','DATABASE_URL'].forEach(n=>{ result.envCandidates[n] = !!process.env[n]; });
    // Quick counts on a few tables
    const tables = ['students','companies','offers','deals','interactions','tasks','placements'];
    for(const t of tables){
      try{
        const { rows } = await pool.query(`select count(*)::int as c from ${t}`);
        result.tables[t] = rows && rows[0] ? rows[0].c : null;
      }catch(e){
        result.tables[t] = null;
        result.errors.push({ table: t, message: e.message || String(e) });
      }
    }
    return { statusCode: 200, headers: cors, body: JSON.stringify(result) };
  } catch (e) {
    console.error('diag failed', e);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}

import { pool, cors, foundEnv } from '../_db.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  const { rows } = await pool.query('select now() as now');
  // Return the current time plus which env var name was detected (non-secret).
  return { statusCode: 200, headers: cors, body: JSON.stringify({ now: rows[0], dbEnv: foundEnv || null }) };
}

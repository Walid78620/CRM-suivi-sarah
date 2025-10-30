import { pool, cors } from './_db.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  const { rows } = await pool.query('select now() as now');
  return { statusCode: 200, headers: cors, body: JSON.stringify(rows[0]) };
}

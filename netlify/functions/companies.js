import { pool, ok, bad, error, preflight, buildInsert, buildUpdate } from '../_db.js';
const TABLE = 'companies';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return preflight();
  try {
    if (event.httpMethod === 'GET') {
      const q = (event.queryStringParameters && event.queryStringParameters.q) ? String(event.queryStringParameters.q).toLowerCase() : null;
      const limit = event.queryStringParameters && event.queryStringParameters.limit ? parseInt(event.queryStringParameters.limit,10) : null;
      if(q){
        const { rows } = await pool.query(`select * from companies where lower(name) like '%' || $1 || '%' or lower(sector) like '%' || $1 || '%' or lower(address) like '%' || $1 || '%' order by created_at asc`, [q]);
        return ok(rows);
      }
      if(limit){
        const { rows } = await pool.query(`select * from companies order by created_at asc limit $1`, [limit]);
        return ok(rows);
      }
      const { rows } = await pool.query(`select * from companies order by created_at asc`);
      return ok(rows);
    }
    if (event.httpMethod === 'POST') {
      const p = JSON.parse(event.body || '{}');
      if (!p.name) return bad('name is required');
      const q = buildInsert(TABLE, p);
  const { rows } = await pool.query(q.text, q.values);
  try{ console.log('companies: inserted id=', rows[0] && rows[0].id); }catch(e){}
  return ok(rows[0], 201);
    }
    if (event.httpMethod === 'PATCH') {
      const p = JSON.parse(event.body || '{}');
      if (!p.id) return bad('id is required');
      const q = buildUpdate(TABLE, p.id, p);
      const { rows } = await pool.query(q.text, q.values);
      return ok(rows[0]);
    }
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body || '{}');
      if (!id) return bad('id is required');
      await pool.query(`delete from ${TABLE} where id = $1`, [id]);
      return ok('', 204);
    }
    return bad('Method not allowed', 405);
  } catch (e) { return error(e); }
}

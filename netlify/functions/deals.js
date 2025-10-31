import { pool, ok, bad, error, preflight, buildInsert, buildUpdate } from './_db.js';
const TABLE = 'deals';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return preflight();
  try {
    if (event.httpMethod === 'GET') {
      const { rows } = await pool.query(`select d.*, c.name as company_name
        from deals d
        left join companies c on c.id = d.companyid
        order by d.created_at desc`);
      return ok(rows);
    }
    if (event.httpMethod === 'POST') {
      const p = JSON.parse(event.body || '{}');
      
      const q = buildInsert(TABLE, p);
      const { rows } = await pool.query(q.text, q.values);
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

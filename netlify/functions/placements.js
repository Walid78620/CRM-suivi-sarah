import { pool, ok, bad, error, preflight, buildInsert, buildUpdate } from '../_db.js';
const TABLE = 'placements';

export async function handler(event){
  if(event.httpMethod === 'OPTIONS') return preflight();
  try{
    if(event.httpMethod === 'GET'){
      const q = event.queryStringParameters && event.queryStringParameters.q ? String(event.queryStringParameters.q).toLowerCase() : null;
      if(q){
        const { rows } = await pool.query(`select * from ${TABLE} where lower(position) like '%' || $1 || '%' order by created_at asc`, [q]);
        return ok(rows);
      }
      const { rows } = await pool.query(`select * from ${TABLE} order by created_at asc`);
      return ok(rows);
    }

    if(event.httpMethod === 'POST'){
      const p = JSON.parse(event.body || '{}');
      // minimal validation
      if(!p.studentId) return bad('studentId is required');
      if(!p.companyId) return bad('companyId is required');
      const q = buildInsert(TABLE, p);
      const { rows } = await pool.query(q.text, q.values);
      try{ console.log('placements: inserted id=', rows[0] && rows[0].id); }catch(e){}
      return ok(rows[0], 201);
    }

    if(event.httpMethod === 'PATCH'){
      const p = JSON.parse(event.body || '{}');
      if(!p.id) return bad('id is required');
      const q = buildUpdate(TABLE, p.id, p);
      const { rows } = await pool.query(q.text, q.values);
      return ok(rows[0]);
    }

    if(event.httpMethod === 'DELETE'){
      const { id } = JSON.parse(event.body || '{}');
      if(!id) return bad('id is required');
      await pool.query(`delete from ${TABLE} where id = $1`, [id]);
      return ok('', 204);
    }

    return bad('Method not allowed', 405);
  }catch(e){ return error(e); }
}

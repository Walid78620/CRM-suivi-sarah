// API wrapper module — attaches `API` to window. Uses window.db, window.saveDB, window.uid
function localSim(method, path, body){
  try{
    const collection = path.split('/')[0];
    if(!(collection in window.db)) return null;
    if(method === 'GET'){
      return JSON.parse(JSON.stringify(window.db[collection] || []));
    }
    if(method === 'POST'){
      const obj = Object.assign({ id: window.uid(), createdAt: new Date().toISOString(), _local:true }, (body||{}));
      window.db[collection] = window.db[collection] || [];
      window.db[collection].push(obj);
      window.saveDB();
      return obj;
    }
    if(method === 'PATCH'){
      const id = (body && body.id) || null;
      if(!id) return null;
      const idx = (window.db[collection]||[]).findIndex(x=>x.id===id);
      if(idx === -1) return null;
      Object.assign(window.db[collection][idx], body);
      window.saveDB();
      return window.db[collection][idx];
    }
    if(method === 'DELETE'){
      const id = (body && body.id) || null;
      if(!id) return null;
      window.db[collection] = (window.db[collection]||[]).filter(x=>x.id!==id);
      window.saveDB();
      return { id };
    }
    return null;
  }catch(e){ console.warn('localSim error', e); return null; }
}

async function request(method, path, body){
  const url = `/api/${path}`;
  const opts = { method, headers: {'Content-Type':'application/json'} };
  if(body) opts.body = JSON.stringify(body);
  try{
    const res = await fetch(url, opts);
    const ct = (res.headers.get('content-type')||'').toLowerCase();
    if(!res.ok){
      if(ct.includes('application/json')){
        const j = await res.json();
        throw new Error(j?.message || `API ${res.status}`);
      } else {
        throw new Error(`API ${res.status} ${res.statusText}`);
      }
    }
    if(ct.includes('application/json')) return await res.json();
    return null;
  }catch(err){
    if(!window.__api_simulator_logged){
      console.warn(`${method} ${url} failed, using local simulator:`, err);
      window.__api_simulator_logged = true;
    }
    try{ if(window.showSimulatorBadge) window.showSimulatorBadge(); }catch(e){}
    return localSim(method, path, body);
  }
}

export const API = {
  get:  (path)       => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch:(path, body) => request('PATCH', path, body),
  del:  (path, body) => request('DELETE', path, body)
};

// attach for legacy inline code
window.API = API;

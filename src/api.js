// API wrapper module — attaches `API` to window.
async function request(method, path, body){
  const url = `/api/${path}`;
  const opts = { method, headers: {'Content-Type':'application/json'} };
  if(body) opts.body = JSON.stringify(body);
  try{
    const res = await fetch(url, opts);
    const ct = (res.headers.get('content-type')||'').toLowerCase();
    if(!res.ok){
      // Try to extract a useful error message from JSON or text bodies
      if(ct.includes('application/json')){
        const j = await res.json();
        const msg = j?.message || j?.error || j?.detail || j?.error_description || `API ${res.status}`;
        throw new Error(msg);
      } else {
        const txt = await res.text().catch(()=>res.statusText||`API ${res.status}`);
        throw new Error(txt || `API ${res.status} ${res.statusText}`);
      }
    }
    if(ct.includes('application/json')) return await res.json();
    return null;
  }catch(err){
    // Propagate the error to the caller. No local simulator fallback.
    console.error(`${method} ${url} failed:`, err);
    throw err;
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

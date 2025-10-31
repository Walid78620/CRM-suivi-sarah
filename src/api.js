// API wrapper module — attaches `API` to window.
async function request(method, path, body){
  const url = `/api/${path}`;
  const opts = { method, headers: {'Content-Type':'application/json'} };
  if(body) opts.body = JSON.stringify(body);
  try{
    const res = await fetch(url, opts);
    const ct = (res.headers.get('content-type')||'').toLowerCase();
    // If there's no content (204 No Content), return null early
    if (res.status === 204) return null;
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
    // Be tolerant: prefer text -> JSON.parse to avoid res.json() throwing on
    // empty/invalid bodies. Some runtimes return application/json with an
    // empty body which causes res.json() to throw.
    try {
      const txt = await res.text();
      const trimmed = (txt || '').trim();
      if(!trimmed) return null;
      if(ct.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')){
        try { return JSON.parse(trimmed); } catch(e){
          // fallback: return raw text if JSON.parse fails
          return trimmed;
        }
      }
      return null;
    } catch(e){
      console.warn('Failed to read response body', e);
      return null;
    }
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

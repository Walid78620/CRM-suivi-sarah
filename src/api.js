// API wrapper module — attaches `API` to window.
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

export function showSimulatorBadge(){
  try{
    if(window.__api_sim_shown) return;
    window.__api_sim_shown = true;
    const el = document.createElement('div');
    el.id = 'simBadge';
    el.style.cssText = 'position:fixed; right:12px; bottom:12px; padding:8px 12px; background:rgba(255,165,0,0.10); color:var(--text); border:1px solid rgba(255,165,0,0.18); border-radius:12px; z-index:9999; font-weight:700; backdrop-filter: blur(4px);';
    el.innerText = 'Mode simulateur (offline)';
    document.body.appendChild(el);
  }catch(e){ /* silent */ }
}

// attach for older code
window.showSimulatorBadge = showSimulatorBadge;

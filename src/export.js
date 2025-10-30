// Simple CSV export utility for the CRM
// - Exports top-level keys of objects as CSV headers
// - For nested objects/arrays, JSON.stringify is used in the cell
// - Adds BOM (\uFEFF) so Excel opens UTF-8 CSV correctly

function valueToCell(v){
  if(v === null || v === undefined) return '';
  if(typeof v === 'object') return JSON.stringify(v);
  // Replace CR/LF by space to keep CSV tidy
  return String(v).replace(/\r?\n/g, ' ');
}

export function toCSV(records){
  if(!Array.isArray(records)) throw new Error('toCSV expects an array');
  if(records.length === 0) return '';
  // Collect union of top-level keys in stable order
  const headers = Array.from(records.reduce((set, r)=>{ Object.keys(r||{}).forEach(k=>set.add(k)); return set }, new Set()));
  const lines = [];
  lines.push(headers.map(h => '"' + (h.replace(/"/g,'""')) + '"').join(','));
  for(const r of records){
    const row = headers.map(h => {
      const cell = valueToCell(r && Object.prototype.hasOwnProperty.call(r,h) ? r[h] : '');
      // Escape double quotes
      return '"' + String(cell).replace(/"/g,'""') + '"';
    }).join(',');
    lines.push(row);
  }
  return lines.join('\n');
}

export function exportEntityCSV(entityName, filename){
  try{
    const db = window.db || {};
    const records = Array.isArray(db[entityName]) ? db[entityName] : [];
    if(records.length === 0){
      // still allow export of empty columns by prompting user
      if(!confirm('Aucun enregistrement trouvé pour "' + entityName + '". Créer un fichier vide ?')) return;
    }
    const csv = records.length ? toCSV(records) : '';
    const content = '\uFEFF' + csv; // BOM for Excel
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || (entityName + '.csv');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(err){
    console.error('exportEntityCSV error', err);
    alert('Erreur d\'export CSV: ' + (err && err.message));
  }
}

// Convenience: export a JSON file containing the entire DB
export function exportAllJSON(filename){
  try{
    const data = JSON.stringify(window.db || {}, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename || 'crm-suivi-export.json'; a.click(); URL.revokeObjectURL(url);
  }catch(err){ console.error(err); alert('Erreur export JSON: '+err.message) }
}

// Expose for compatibility when bootstrap imports this module
window.exportEntityCSV = exportEntityCSV;
window.exportAllJSON = exportAllJSON;

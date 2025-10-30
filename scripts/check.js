const fs = require('fs');
const path = require('path');
function fail(msg){ console.error('ERROR:', msg); process.exitCode = 2; }
let ok = true;
if(!fs.existsSync(path.join(__dirname, '..', 'index.html'))){ fail('index.html missing'); ok=false; }
if(!fs.existsSync(path.join(__dirname, '..', 'netlify.toml'))){ fail('netlify.toml missing'); ok=false; }
const funcsDir = path.join(__dirname, '..', 'netlify', 'functions');
if(!fs.existsSync(funcsDir)){
  console.warn('WARN: netlify/functions not present — functions may not be deployed');
} else {
  const files = fs.readdirSync(funcsDir).filter(f=>f.endsWith('.js'));
  if(files.length===0) console.warn('WARN: no JS functions found in netlify/functions');
}
if(!ok) process.exit(2);
console.log('Basic repo checks passed.');

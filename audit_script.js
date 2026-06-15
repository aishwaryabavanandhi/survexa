const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist')) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const allFiles = walk(path.join(process.cwd(), 'SurveyForge'));
const fileNames = {};
const duplicates = [];

for (const f of allFiles) {
  const base = path.basename(f);
  if (!fileNames[base]) fileNames[base] = [];
  fileNames[base].push(f);
}

for (const [name, paths] of Object.entries(fileNames)) {
  if (paths.length > 1 && !['index.js', 'package.json', 'package-lock.json', '.env', '.env.example', '.gitignore', 'README.md'].includes(name)) {
    duplicates.push({ name, count: paths.length });
  }
}

console.log('--- Duplicate Files (excluding generic names) ---');
console.log(duplicates.slice(0, 10));

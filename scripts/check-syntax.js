const { spawnSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join, extname } = require('path');

const TARGETS = ['app/api', 'lib', 'middleware.js'];
const EXTENSIONS = new Set(['.js', '.jsx']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build']);

function collectFiles(dir, files = []) {
  if (!statSync(dir).isDirectory()) {
    if (EXTENSIONS.has(extname(dir))) files.push(dir);
    return files;
  }
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) collectFiles(fullPath, files);
      continue;
    }
    if (EXTENSIONS.has(extname(entry))) files.push(fullPath);
  }
  return files;
}

const files = TARGETS.flatMap((target) => collectFiles(target));
let failures = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['-c', file], { stdio: 'inherit' });
  if (result.status !== 0) failures += 1;
}

if (failures > 0) {
  console.error(`Syntax check failed for ${failures} file(s).`);
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} server files.`);

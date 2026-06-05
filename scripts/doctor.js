const { existsSync, readFileSync } = require('fs');

const checks = [
  ['package.json', existsSync('package.json'), 'Web package manifest is present'],
  ['blockchain/package.json', existsSync('blockchain/package.json'), 'Blockchain package manifest is present'],
  ['ml/requirements.txt', existsSync('ml/requirements.txt'), 'ML requirements file is present'],
  ['.env.example', existsSync('.env.example'), 'Environment template is present'],
  ['.github/workflows/ci.yml', existsSync('.github/workflows/ci.yml'), 'CI workflow is present'],
  ['.github/BRANCH_PROTECTION.md', existsSync('.github/BRANCH_PROTECTION.md'), 'Branch protection guide is present'],
];

let warnings = 0;
for (const [name, ok, message] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${message} (${name})`);
  if (!ok) warnings += 1;
}

if (existsSync('.env.local')) {
  const env = readFileSync('.env.local', 'utf8');
  if (!/JWT_SECRET=.{24,}/.test(env)) {
    console.warn('! .env.local exists but JWT_SECRET is missing or too short.');
    warnings += 1;
  }
} else {
  console.warn('! .env.local not found. Copy .env.example before running with real data.');
  warnings += 1;
}

if (warnings > 0) {
  console.warn(`Doctor completed with ${warnings} warning(s).`);
} else {
  console.log('Doctor completed without warnings.');
}

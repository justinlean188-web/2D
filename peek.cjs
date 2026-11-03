const fs = require('fs');
const file = process.argv[2];
const needle = process.argv[3];
const before = Number(process.argv[4] ?? 300);
const after = Number(process.argv[5] ?? 1200);
const s = fs.readFileSync(file, 'utf8');
const i = s.indexOf(needle);
if (i < 0) {
  console.log('NOT FOUND:', needle);
  process.exit(1);
}
console.log(s.slice(Math.max(0, i - before), i + after));

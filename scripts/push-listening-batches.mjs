import { execSync } from 'child_process';
import { statSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

/**
 * Pushes remaining heavy listening files in tiny (~18 MB) batches.
 * One batch per invocation — write a plan file first, then consume it
 * one commit+push at a time so a run never outlives the command timeout.
 * Usage:
 *   node scripts/push-listening-batches.mjs plan   -> writes /tmp/batches.json
 *   node scripts/push-listening-batches.mjs step   -> commits + pushes one batch
 */

const PLAN = new URL('../.batches-plan.json', import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:');
const sh = (c) => execSync(c, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const mode = process.argv[2] || 'step';

if (mode === 'plan') {
  const modified = sh('git status --porcelain -uno')
    .split('\n')
    .filter((l) => l.startsWith(' M') || l.startsWith('M'))
    .map((l) => l.slice(3).replace(/^"|"$/g, ''))
    .filter((f) => f.startsWith('public/listening'));
  const untracked = sh('git ls-files -o --exclude-standard public/listening').split('\n').filter(Boolean);
  const files = [...modified, ...untracked];
  const LIMIT = 18 * 1024 * 1024;
  const batches = [];
  let cur = [], curSize = 0;
  for (const f of files) {
    let size = 0;
    try { size = statSync(f).size; } catch { continue; }
    if (cur.length && curSize + size > LIMIT) { batches.push(cur); cur = []; curSize = 0; }
    cur.push(f); curSize += size;
  }
  if (cur.length) batches.push(cur);
  writeFileSync(PLAN, JSON.stringify(batches));
  console.log(`${files.length} fayl -> ${batches.length} paket (18MB limit)`);
} else {
  if (!existsSync(PLAN)) { console.error('Plan yoq: avval "plan" rejimida ishga tushiring.'); process.exit(1); }
  const batches = JSON.parse(readFileSync(PLAN, 'utf8'));
  if (!batches.length) { console.log('Barcha paketlar push boIdi.'); unlinkSync(PLAN); process.exit(0); }
  const batch = batches[0];
  const mb = batch.reduce((s, f) => s + statSync(f).size, 0) / 1048576;
  console.log(`Paket: ${batch.length} fayl, ${mb.toFixed(1)} MB`);
  sh(`git add ${batch.map((f) => JSON.stringify(f)).join(' ')}`);
  sh(`git commit -q -m "chore: add listening test files (batch ${batches.length} left) - Generated with Codebuff"`);
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      execSync('git push origin main', { stdio: 'inherit', timeout: 560000 });
      ok = true;
    } catch {
      console.log(`push urinish ${attempt} muvaffaqiyatsiz`);
      if (attempt < 3) execSync('sleep 6');
    }
  }
  if (!ok) { console.error('Push otmadi — keyingi urinishda davom etiladi.'); process.exit(1); }
  batches.shift();
  writeFileSync(PLAN, JSON.stringify(batches));
  console.log(`Qoldi: ${batches.length} paket`);
}

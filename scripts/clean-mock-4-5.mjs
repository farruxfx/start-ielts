import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:\\Users\\user\\Downloads';
const DEST = 'public/mock-exams';

mkdirSync(DEST, { recursive: true });

const files = [
  { src: 'listening mock 4.html', dest: 'full-mock-test-4.html', title: 'IELTS Full Mock Test 4' },
  { src: 'listening full mock 5.html', dest: 'full-mock-test-5.html', title: 'IELTS Full Mock Test 5' },
];

for (const f of files) {
  let html = readFileSync(join(SRC, f.src), 'utf8');
  html = html.replace(/<a[^>]*class="brand"[^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<a[^>]*href="https?:\/\/t\.me\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<button[^>]*class="vip-pack-btn"[^>]*>[\s\S]*?<\/button>/gi, '');
  html = html.replace(/<a[^>]*class="channel-link"[^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<title>@reading_cdi\s*[—–-]\s*/gi, '<title>');
  html = html.replace(/<title>@reading_cdi<\/title>/gi, `<title>${f.title}</title>`);
  html = html.replace(/<button[^>]*onclick="shareToTelegram[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');
  html = html.replace(/<div[^>]*id="premiumModal"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
  html = html.replace(/(>[\s]*)@reading_cdi([\s]*<)/g, '$1IELTS PRO$2');
  writeFileSync(join(DEST, f.dest), html);
  const refs = (html.match(/@reading_cdi/g) || []).length;
  const tme = (html.match(/t\.me\//g) || []).length;
  console.log(`✓ ${f.src} → ${f.dest} (${Math.round(html.length / 1024 / 1024)}MB) @reading_cdi=${refs}, t.me=${tme}`);
}

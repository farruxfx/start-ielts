import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const SRC = 'C:\\Users\\user\\Downloads';
const DEST = 'public/mock-exams';

mkdirSync(DEST, { recursive: true });

// Only the Full Mock tests (not listening-only)
const files = [
  { src: 'FULL MOCK 6.html', dest: 'full-mock-test-6.html', title: 'IELTS Full Mock Test 6' },
  { src: 'FULL MOCK 7.html', dest: 'full-mock-test-7.html', title: 'IELTS Full Mock Test 7' },
  { src: 'Mock 8.html', dest: 'full-mock-test-8.html', title: 'IELTS Full Mock Test 8' },
  { src: 'FULL MOCK 9.html', dest: 'full-mock-test-9.html', title: 'IELTS Full Mock Test 9' },
  { src: 'FULL MOCK 10_1.html', dest: 'full-mock-test-10.html', title: 'IELTS Full Mock Test 10' },
];

for (const f of files) {
  try {
    let html = readFileSync(join(SRC, f.src), 'utf8');
    
    // Remove brand links
    html = html.replace(/<a[^>]*class="brand"[^>]*>[\s\S]*?<\/a>/gi, '');
    // Remove t.me links
    html = html.replace(/<a[^>]*href="https?:\/\/t\.me\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
    // Remove VIP pack buttons
    html = html.replace(/<button[^>]*class="vip-pack-btn"[^>]*>[\s\S]*?<\/button>/gi, '');
    // Remove channel links  
    html = html.replace(/<a[^>]*class="channel-link"[^>]*>[\s\S]*?<\/a>/gi, '');
    // Clean up title
    html = html.replace(/<title>@reading_cdi\s*[—–-]\s*/gi, '<title>');
    html = html.replace(/<title>@reading_cdi<\/title>/gi, `<title>${f.title}</title>`);
    // Remove telegram/share buttons
    html = html.replace(/<button[^>]*onclick="shareToTelegram[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');
    // Remove premium modal
    html = html.replace(/<div[^>]*id="premiumModal"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
    // Replace remaining @reading_cdi in visible text
    html = html.replace(/(>[\s]*)@reading_cdi([\s]*<)/g, '$1IELTS PRO$2');
    
    writeFileSync(join(DEST, f.dest), html);
    console.log(`✓ ${f.src} → ${f.dest} (${Math.round(html.length / 1024 / 1024)}MB)`);
  } catch (err) {
    console.error(`✗ ${f.src}: ${err.message}`);
  }
}

// Verify no @reading_cdi remains
for (const f of files) {
  try {
    const html = readFileSync(join(DEST, f.dest), 'utf8');
    const refs = (html.match(/@reading_cdi/g) || []).length;
    const tme = (html.match(/t\.me\//g) || []).length;
    console.log(`Check ${f.dest}: @reading_cdi=${refs}, t.me=${tme}`);
  } catch {}
}

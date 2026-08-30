import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:\\Users\\user\\Downloads';
const DEST = 'public/mock-exams';

mkdirSync(DEST, { recursive: true });

const files = [
  { src: 'Full mock_2.html', dest: 'full-mock-test-2.html', title: 'IELTS Full Mock Test 2 — Listening, Reading & Writing' },
  { src: 'Full mock 3.html', dest: 'full-mock-test-3.html', title: 'IELTS Full Mock Test 3 — Listening, Reading, Writing & Speaking' },
];

for (const f of files) {
  try {
    let html = readFileSync(join(SRC, f.src), 'utf8');
    
    // Remove brand links
    html = html.replace(/<a[^>]*class="brand"[^>]*>[\s\S]*?<\/a>/gi, '');
    
    // Remove any remaining t.me links
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
    console.log(`✓ ${f.src} → ${f.dest} (${Math.round(html.length / 1024)}KB)`);
  } catch (err) {
    console.error(`✗ ${f.src}: ${err.message}`);
  }
}

// Verify
for (const f of files) {
  try {
    const html = readFileSync(join(DEST, f.dest), 'utf8');
    const refs = (html.match(/@reading_cdi/g) || []).length;
    const tme = (html.match(/t\.me\//g) || []).length;
    console.log(`Check ${f.dest}: @reading_cdi=${refs}, t.me=${tme}`);
  } catch {}
}

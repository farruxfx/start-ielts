import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

const sourceDir = 'C:\\Users\\user\\Documents\\apps\\ielts platform\\exam files for platform\\listening';
const outDir = 'public/listening';

const files = [
  { src: `${sourceDir}\\Cambridge 21 Test 3 Listening @shohrukhposts.html`, out: 'cambridge-21-test-3.html', title: 'Cambridge 21 - Test 3' },
  { src: `${sourceDir}\\Cambridge 21 Test 4 @shohrukhposts.html`, out: 'cambridge-21-test-4.html', title: 'Cambridge 21 - Test 4' },
];

for (const file of files) {
  let html = readFileSync(file.src, 'utf-8');

  // 1. Remove premium modal (from <!-- Premium Modal --> to its closing </div>)
  html = html.replace(/<!-- Premium Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m, '');

  // 2. Remove telegram channel link in header-icons
  html = html.replace(/<a\s+href="https:\/\/t\.me\/shohrukhposts"[\s\S]*?<\/a>/g, '');

  // 3. Remove VIP Pack button
  html = html.replace(/<button[\s\S]*?id="premium-btn"[\s\S]*?<\/button>/g, '');

  // 4. Remove telegram support button
  html = html.replace(/<a[\s\S]*?class="telegram-button"[\s\S]*?<\/a>/g, '');

  // 5. Remove any remaining shohrukh/shohrukhposts references in text
  html = html.replace(/@shohrukhposts/g, '');
  html = html.replace(/shohrukh/gi, '');
  html = html.replace(/Shohrukh/gi, '');

  // 6. Clean title
  html = html.replace(/<title>.*?<\/title>/, `<title>${file.title} - IELTS Listening Test</title>`);

  // 7. Remove html2canvas script (not needed)
  html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas[\s\S]*?<\/script>/, '');

  // 8. Remove any remaining telegram links
  html = html.replace(/https?:\/\/t\.me\/[^\s"')]+/g, '#');

  // 9. Clean the audio source URL - remove the @posts part from display but keep functional URL
  // The actual audio files still have the old URL, so we keep the src attribute as-is
  // but remove any visible text mentions

  writeFileSync(`${outDir}/${file.out}`, html);
  console.log(`Created ${outDir}/${file.out}`);
}

console.log('Done!');

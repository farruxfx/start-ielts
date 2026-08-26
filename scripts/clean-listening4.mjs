import { readFileSync, writeFileSync } from 'fs';

const sourceDir = 'C:\\Users\\user\\Documents\\apps\\ielts platform\\exam files for platform\\listening';
const outDir = 'public/listening';

const files = [
  { src: `${sourceDir}\\Cambridge 21 Test 3 Listening @shohrukhposts.html`, out: 'cambridge-21-test-3.html', title: 'Cambridge 21 - Test 3' },
  { src: `${sourceDir}\\Cambridge 21 Test 4 @shohrukhposts.html`, out: 'cambridge-21-test-4.html', title: 'Cambridge 21 - Test 4' },
];

for (const file of files) {
  let html = readFileSync(file.src, 'utf-8');

  // 1. Remove the entire premium modal (from comment to end)
  html = html.replace(/<!-- Premium Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\n/, '\n');

  // 2. Remove the channel-link anchor in header-icons (telegram link)
  html = html.replace(/<a\s+href="https:\/\/t\.me\/shohrukhposts"[\s\S]*?<\/a>\s*\n/g, '');

  // 3. Remove VIP Pack button - use specific id match without wildcards before it
  html = html.replace(/<button\s+id="premium-btn"[\s\S]*?<\/button>/g, '');

  // 4. Remove the telegram support button  
  html = html.replace(/<a\s+href="[^"]*"\s+class="telegram-button"[\s\S]*?<\/a>\s*\n/g, '');

  // 5. Clean title
  html = html.replace(/<title>.*?<\/title>/, `<title>${file.title} - IELTS Listening Test</title>`);

  // 6. Remove html2canvas script
  html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas[\s\S]*?<\/script>\s*\n?/, '');

  // 7. Text cleanup - remove all @shohrukhposts
  html = html.replace(/@shohrukhposts/g, '');

  // 8. Remove any remaining telegram links
  html = html.replace(/https?:\/\/t\.me\/[^\s"')]+/g, '#');

  // 9. Remove "shohrukh" case-insensitive
  html = html.replace(/shohrukh/gi, '');

  // 10. Clean VIP pack CSS block
  html = html.replace(/\.vip-pack-btn\s*\{[^}]*\}\s*/g, '');
  html = html.replace(/\.vip-pack-btn:hover\s*\{[^}]*\}\s*/g, '');
  html = html.replace(/\.vip-pack-btn svg\s*\{[^}]*\}\s*/g, '');

  // 11. Clean telegram CSS
  html = html.replace(/\/\*\s*Telegram Support Button\s*\*\/[\s\S]*?\.telegram-icon\s*\{[^}]*\}\s*/g, '');

  // 12. Remove premium button JS
  html = html.replace(/const premiumBtn = document\.getElementById\('premium-btn'\);[\s\S]*?\n/g, '');

  // 13. Remove shareToTelegram function  
  html = html.replace(/\/\/ Share to Telegram functionality[\s\S]*?async function shareToTelegram\(\)\s*\{[\s\S]*?\n\s*\}/g, '');

  // 14. Remove telegram URL and open references
  html = html.replace(/const telegramUrl[\s\S]*?};/g, '');
  html = html.replace(/\/\/ Open Telegram[\s\S]*?window\.open\(telegramUrl[\s\S]*?\);/g, '');

  // 15. Clean telegram in alerts
  html = html.replace(/alert\(`[^`]*Telegram[^`]*`\);/g, '');

  // 16. Fix comment
  html = html.replace(/required for Telegram\/Safari on iPhone/g, 'required for iOS Safari on iPhone');

  // 17. Clean remaining Share to Telegram references
  html = html.replace(/Share them to the Telegram group\./g, 'Share your results!');

  writeFileSync(`${outDir}/${file.out}`, html);
  console.log(`Created ${outDir}/${file.out}`);

  // Verify
  const checks = ['shohrukh', 'telegram', 't.me', 'vip-pack', 'premium-btn'];
  for (const c of checks) {
    const count = (html.toLowerCase().match(new RegExp(c.toLowerCase(), 'g')) || []).length;
    if (count > 0) console.log(`  WARNING: ${count} remaining "${c}" references`);
  }
}

console.log('Done!');

import { readFileSync, writeFileSync } from 'fs';

const outDir = 'public/listening';

const files = [
  'cambridge-21-test-3.html',
  'cambridge-21-test-4.html',
];

for (const file of files) {
  let html = readFileSync(`${outDir}/${file}`, 'utf-8');

  // Remove vip-pack-btn CSS
  html = html.replace(/\.vip-pack-btn\s*\{[\s\S]*?\}/g, '');
  html = html.replace(/\.vip-pack-btn:hover\s*\{[\s\S]*?\}/g, '');
  html = html.replace(/\.vip-pack-btn svg\s*\{[\s\S]*?\}/g, '');

  // Remove telegram-button CSS
  html = html.replace(/\/\*\s*Telegram Support Button\s*\*\/[\s\S]*?\.telegram-icon\s*\{[\s\S]*?\}/g, '');

  // Remove premium-btn JS reference
  html = html.replace(/const premiumBtn[\s\S]*?getElementById\('premium-btn'\)[^;]*;/g, '');

  // Remove shareToTelegram function
  html = html.replace(/\/\/ Share to Telegram functionality[\s\S]*?async function shareToTelegram\(\)\s*\{[\s\S]*?\}/g, '');

  // Remove telegram URL references
  html = html.replace(/const telegramUrl[\s\S]*?};/g, '');
  html = html.replace(/\/\/ Open Telegram[\s\S]*?window\.open\(telegramUrl[\s\S]*?\);/g, '');

  // Remove telegram alert messages
  html = html.replace(/alert\(`.*?Telegram.*?`\);/g, '');

  // Remove any remaining telegram text in alerts
  html = html.replace(/Share them to the Telegram group\./g, 'Share your results!');

  // Clean any remaining t.me references
  html = html.replace(/https?:\/\/t\.me\/[^\s"'`]+/g, '#');

  // Remove "shohrukh" case-insensitive anywhere
  html = html.replace(/shohrukh/gi, '');

  writeFileSync(`${outDir}/${file}`, html);
  console.log(`Cleaned ${file}`);
}

console.log('Done!');

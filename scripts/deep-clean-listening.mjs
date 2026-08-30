import { readFileSync, writeFileSync, readdirSync } from 'fs';

const dir = 'public/listening';
const files = readdirSync(dir).filter(f => f.endsWith('.html'));

let cleaned = 0;
let cdifixed = 0;
let loginfixed = 0;

for (const file of files) {
  const path = `${dir}/${file}`;
  let content = readFileSync(path, 'utf8');
  const original = content;

  // 1. Remove ALL READING_CDI references
  if (content.includes('READING_CDI') || content.includes('reading_cdi') || content.includes('Reading_CDI')) {
    content = content.replace(/READING_CDI/gi, '');
    content = content.replace(/reading_cdi/gi, '');
    content = content.replace(/Reading_CDI/gi, '');
    // Remove any leftover spaces/commas from removal
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/\s{2,}/g, ' ');
    cdifixed++;
  }

  // 2. Force hide login screens
  // Hide login div
  content = content.replace(
    /(<div[^>]*id="login"[^>]*>)/g,
    '$1<!--AUTO-HIDDEN-->'
  );
  // Add display:none to login via style injection
  if (content.includes('id="login"') && !content.includes('id="login" style="display:none')) {
    content = content.replace(
      /(id="login"[^>]*style=")([^"]*)"/g,
      '$1$2;display:none!important"'
    );
    // If no style attribute, add one
    content = content.replace(
      /(id="login")(?! style)/g,
      '$1 style="display:none!important"'
    );
    loginfixed++;
  }

  // 3. Override doLogin to skip directly
  content = content.replace(
    /function doLogin\(\)\s*\{[\s\S]*?\}/g,
    'function doLogin() { var l=document.getElementById("login");if(l)l.style.display="none";var i=document.getElementById("intro");if(i)i.style.display="block"; }'
  );

  // 4. Remove any login-related CSS that shows login screen
  content = content.replace(
    /#login\s*\{[^}]*display\s*:\s*flex[^}]*\}/g,
    '#login{display:none!important}'
  );

  // 5. Remove telegram/VIP/channel references
  content = content.replace(/<a[^>]*t\.me[^>]*>[\s\S]*?<\/a>/gi, '');
  content = content.replace(/<button[^>]*class="[^"]*vip[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');
  content = content.replace(/<button[^>]*class="[^"]*channel[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');
  content = content.replace(/class="channel-link"[\s\S]*?<\/a>/gi, '');
  content = content.replace(/class="telegram-button"[\s\S]*?<\/a>/gi, '');

  // 6. Remove premium modal
  content = content.replace(/<div[^>]*id="premium-modal-bg"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');

  // 7. Replace IELTS branding in header with generic
  content = content.replace(
    /<img[^>]*ielts\.svg[^>]*>/gi,
    '<span style="font-weight:800;font-size:18px;color:#1a73e8;">IELTS</span>'
  );

  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    cleaned++;
  }
}

console.log(`Cleaned ${cleaned}/${files.length} files`);
console.log(`  READING_CDI removed: ${cdifixed}`);
console.log(`  Login screens hidden: ${loginfixed}`);

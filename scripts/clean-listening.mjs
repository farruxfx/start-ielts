import { readFileSync, writeFileSync, readdirSync } from 'fs';

const dir = 'public/listening';
const files = readdirSync(dir).filter(f => f.endsWith('.html'));

function cleanHtml(content, filename) {
  // Remove telegram links/buttons
  content = content.replace(/<a[^>]*t\.me[^>]*>.*?<\/a>/gis, '');
  content = content.replace(/<a[^>]*telegram[^>]*>.*?<\/a>/gis, '');
  content = content.replace(/<button[^>]*telegram[^>]*>.*?<\/button>/gis, '');
  
  // Remove VIP buttons and modals
  content = content.replace(/<button[^>]*vip[^>]*>.*?<\/button>/gis, '');
  content = content.replace(/<div[^>]*premium-modal[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  
  // Remove channel-link references
  content = content.replace(/<a[^>]*channel-link[^>]*>.*?<\/a>/gis, '');
  
  // Remove @shohrukhposts text from visible content (not in scripts)
  content = content.replace(/@shohrukhposts/gi, '');
  content = content.replace(/shohrukh/gi, '');
  
  // Remove telegram button class
  content = content.replace(/\.telegram-button[^}]*\}/g, '');
  
  // Remove VIP button class
  content = content.replace(/\.vip-pack-btn[^}]*\}/g, '');
  content = content.replace(/\.premium-btn[^}]*\}/g, '');
  
  // Remove login screens
  content = content.replace(/function doLogin\(\)\s*\{[^}]*\}/g, 
    'function doLogin() { const l=document.getElementById("login");if(l)l.style.display="none";const i=document.getElementById("intro");if(i)i.style.display="block"; }');
  
  // Force hide login
  content = content.replace(/id="login"[^>]*style="([^"]*)"/g, 'id="login" style="$1;display:none!important"');
  content = content.replace(/id="login"/g, 'id="login" style="display:none!important"');
  
  // Remove footer links to external sites
  content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  
  // Remove any remaining external links (t.me, telegram, vip)
  content = content.replace(/href="https?:\/\/t\.me[^"]*"/gi, 'href="#"');
  content = content.replace(/href="https?:\/\/[^"]*telegram[^"]*"/gi, 'href="#"');
  
  // Remove premium modal overlay if exists
  content = content.replace(/<div[^>]*id="premium-modal-bg"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
  
  return content;
}

let cleaned = 0;
for (const file of files) {
  try {
    const path = `${dir}/${file}`;
    let content = readFileSync(path, 'utf8');
    const original = content;
    content = cleanHtml(content, file);
    if (content !== original) {
      writeFileSync(path, content, 'utf8');
      cleaned++;
    }
  } catch (e) {
    console.error(`Error cleaning ${file}: ${e.message}`);
  }
}

console.log(`Cleaned ${cleaned}/${files.length} files`);

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'listening');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let fixed = 0;
let already = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Check if file has login elements
  const hasLogin = content.includes('Xush kelibsiz') || 
                   content.includes('doLogin') || 
                   content.includes('id="login"') ||
                   content.includes('ISM FAMILIYA');
  
  if (!hasLogin) {
    already++;
    continue;
  }
  
  let changed = false;
  
  // 1. Inject CSS to hide login screen and show test content
  const loginCSS = `
<style>
/* AUTO-FIX: Hide login, show test content */
#login-screen, #loginScreen, .login-screen, .loginOverlay, .login-overlay,
#loginModal, .modal-overlay { 
  display: none !important; 
  visibility: hidden !important;
  height: 0 !important;
  overflow: hidden !important;
}
.scHub, .scListening, .sc-reading, .scWriting, .scSpeaking,
.screen, .intro { display: none !important; }
.scHub.active, .scListening.active, .intro.active, .scHub.show, .scListening.show {
  display: block !important;
}
/* Force main content visible */
#part1, #part2, #part3, #part4,
.part-content, .main-content, .test-content,
.content-area, .test-area, .questions-section,
[id*="part"], [class*="question"], .answers,
.inspera-form-table, .choice-options,
.answer-input, .highlight { 
  display: revert !important; 
  visibility: visible !important;
}
body { overflow: auto !important; }
/* Hide VIP/Telegram/Channel links */
.channel-link, .vip-pack-btn, .telegram-link,
a[href*="telegram"], a[href*="t.me"] { 
  display: none !important; 
}
</style>`;
  
  // 2. Remove login overlay HTML entirely
  const loginPatterns = [
    // Match login screen divs (various patterns)
    /<div[^>]*id="login-screen"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    /<div[^>]*class="[^"]*login[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
    // Match the intro/hub screens that wrap login
    /<div[^>]*id="intro"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
  ];
  
  // 3. Fix JavaScript that redirects to login
  const jsFixes = [
    // Replace doLogin function calls
    [/doLogin\(\)/g, '/* login bypassed */'],
    [/function\s+doLogin/g, 'function doLogin_bypassed'],
    // Replace showScreen calls that navigate to login
    [/showScreen\s*\(\s*['"]login['"]\s*\)/g, '/* showScreen login bypassed */'],
    [/showScreen\s*\(\s*['"]intro['"]\s*\)/g, '/* showScreen intro bypassed */'],
    // Replace hub-related redirects
    [/showHub\s*\(\)/g, '/* showHub bypassed */'],
    [/showHub\s*\(/g, 'showHub_bypassed('],
    [/renderHub\s*\(/g, 'renderHub_bypassed('],
    // Replace login check functions
    [/function\s+checkLogin/g, 'function checkLogin_bypassed'],
    [/function\s+requireLogin/g, 'function requireLogin_bypassed'],
    [/function\s+validateLogin/g, 'function validateLogin_bypassed'],
  ];
  
  // 4. Add auto-execute script to bypass login
  const bypassScript = `
<script>
/* MASTER BYPASS - auto-execute */
(function() {
  // Hide all login/modal overlays
  document.querySelectorAll('[id*="login"], [class*="login"], [id*="modal"], [class*="modal"], .channel-link, .vip-pack-btn').forEach(el => {
    el.style.display = 'none';
    el.style.visibility = 'hidden';
  });
  // Show all test content
  document.querySelectorAll('[id*="part"], .questions-section, .content-area, .answer-input, .choice-options, .inspera-form-table').forEach(el => {
    el.style.display = '';
    el.style.visibility = 'visible';
  });
  // Auto-show active screens
  document.querySelectorAll('.screen').forEach(el => {
    if (el.id && (el.id.includes('part') || el.id.includes('content') || el.id.includes('test'))) {
      el.style.display = 'block';
    }
  });
  // Remove body overflow hidden
  document.body.style.overflow = 'auto';
})();
</script>`;
  
  // Apply CSS fix
  if (!content.includes('AUTO-FIX: Hide login')) {
    content = content.replace('</head>', loginCSS + '\n</head>');
    changed = true;
  }
  
  // Apply JS bypass
  if (!content.includes('MASTER BYPASS')) {
    content = content.replace('</body>', bypassScript + '\n</body>');
    changed = true;
  }
  
  // Apply JS fixes
  for (const [pattern, replacement] of jsFixes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }
  
  // Remove @shohrukhposts from filenames (should already be done)
  if (content.includes('shohrukh') || content.includes('SHOHRUKH')) {
    content = content.replace(/@shohrukhposts?/gi, '');
    content = content.replace(/shohrukh/gi, '');
    changed = true;
  }
  
  // Remove Telegram/VIP references
  content = content.replace(/telegram\.me\/[^\s"']+/gi, '#');
  content = content.replace(/t\.me\/[^\s"']+/gi, '#');
  
  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    fixed++;
    console.log('FIXED: ' + file);
  } else {
    already++;
  }
}

console.log('\nResult: ' + fixed + ' fixed, ' + already + ' already clean');

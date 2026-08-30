const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'listening');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let fixed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  const hasScreens = content.includes('.screen') && (content.includes('login-screen') || content.includes('home-screen') || content.includes('exam-screen'));
  if (!hasScreens) continue;
  
  let changed = false;
  
  // Replace the bad CSS that hides ALL .screen elements
  // Remove the bad auto-fix CSS first
  content = content.replace(/\/\* AUTO-FIX: Hide login, show test content \*\/[\s\S]*?<\/style>/g, '<style>/* FIXED CSS */</style>');
  
  // Remove the bad MASTER BYPASS that hides all screens
  content = content.replace(/\/\* MASTER BYPASS - auto-execute \*\/[\s\S]*?<\/script>/g, '<script>/* FIXED BYPASS */</script>');
  
  // Add proper CSS that hides login but shows exam content
  const properCSS = `
<style>
/* PROPER FIX: Only hide login, show exam content */
#login-screen { 
  display: none !important; 
  visibility: hidden !important;
}
#home-screen, #exam-screen, .exam-content, .test-content { 
  display: block !important; 
  visibility: visible !important;
}
.screen:not(#login-screen) { 
  display: block !important; 
  visibility: visible !important;
}
body { overflow: auto !important; }
.channel-link, .vip-pack-btn, .telegram-link,
a[href*="telegram"], a[href*="t.me"],
button.vip-pack-btn, div.channel-link {
  display: none !important; 
}
</style>`;
  
  if (!content.includes('PROPER FIX: Only hide login')) {
    content = content.replace('</head>', properCSS + '\n</head>');
    changed = true;
  }
  
  // Add auto-execute script to force show exam screen
  const properBypass = `
<script>
/* PROPER BYPASS - force show exam screen */
(function() {
  // Wait for DOM to load
  function fixScreens() {
    // Hide login
    var ls = document.getElementById('login-screen');
    if (ls) { ls.style.display = 'none'; ls.style.visibility = 'hidden'; }
    
    // Show all non-login screens
    document.querySelectorAll('.screen').forEach(function(el) {
      if (el.id !== 'login-screen') {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      }
    });
    
    // Try to auto-navigate to exam
    if (typeof showScreen === 'function') {
      showScreen('exam-screen');
      showScreen('home-screen');
    }
    if (typeof beginExam === 'function') {
      beginExam();
    }
    if (typeof startTest === 'function') {
      startTest();
    }
    if (typeof renderHub === 'function') {
      renderHub();
    }
    if (typeof showHub === 'function') {
      showHub();
    }
    
    // Force body overflow
    document.body.style.overflow = 'auto';
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixScreens);
  } else {
    fixScreens();
  }
  // Run again after a delay for dynamic content
  setTimeout(fixScreens, 500);
  setTimeout(fixScreens, 1500);
})();
</script>`;
  
  if (!content.includes('PROPER BYPASS')) {
    content = content.replace('</body>', properBypass + '\n</body>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    fixed++;
    console.log('FIXED: ' + file);
  }
}

console.log('\nFixed ' + fixed + ' screen-based files');

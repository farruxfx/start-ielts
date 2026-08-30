const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'listening');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let fixed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  const hasScreens = content.includes('login-screen') || content.includes('home-screen') || content.includes('exam-screen');
  if (!hasScreens) continue;
  
  let changed = false;
  
  // Replace the old PROPER BYPASS with a better one
  if (content.includes('PROPER BYPASS')) {
    content = content.replace(/\/\* PROPER BYPASS[\s\S]*?<\/script>/g, '');
  }
  
  // Also remove old PROPER FIX CSS
  if (content.includes('PROPER FIX')) {
    content = content.replace(/\/\* PROPER FIX[\s\S]*?<\/style>/g, '');
  }
  
  // Add clean CSS
  const cleanCSS = `
<style>
/* CLEAN FIX: Hide login & home, show exam only */
#login-screen, #home-screen { 
  display: none !important; 
  visibility: hidden !important;
  position: absolute !important;
  pointer-events: none !important;
}
#exam-screen { 
  display: block !important; 
  visibility: visible !important;
  opacity: 1 !important;
}
body { overflow: auto !important; }
body > .screen { 
  display: block !important; 
  visibility: visible !important;
}
body > .screen:first-child:not(#exam-screen) { 
  display: none !important; 
}
.channel-link, .vip-pack-btn, .telegram-link,
a[href*="telegram"], a[href*="t.me"],
button.vip-pack-btn, div.channel-link,
.header-icons .channel-link {
  display: none !important; 
}
</style>`;
  
  if (!content.includes('CLEAN FIX: Hide login')) {
    content = content.replace('</head>', cleanCSS + '\n</head>');
    changed = true;
  }
  
  // Add auto-execute script
  const autoScript = `
<script>
/* AUTO START - skip login, skip home, go straight to exam */
(function() {
  function autoStart() {
    // Hide login
    var ls = document.getElementById('login-screen');
    if (ls) ls.style.display = 'none';
    
    // Hide home  
    var hs = document.getElementById('home-screen');
    if (hs) hs.style.display = 'none';
    
    // Show exam
    var es = document.getElementById('exam-screen');
    if (es) {
      es.style.display = 'block';
      es.style.visibility = 'visible';
    }
    
    // Hide ALL screens except exam
    document.querySelectorAll('.screen').forEach(function(el) {
      if (el.id === 'exam-screen') {
        el.style.display = 'block';
        el.style.visibility = 'visible';
      } else {
        el.style.display = 'none';
      }
    });
    
    // Try calling functions to start exam
    try { if (typeof beginExam === 'function') beginExam(); } catch(e) {}
    try { if (typeof startExam === 'function') startExam(); } catch(e) {}
    try { if (typeof startTest === 'function') startTest(); } catch(e) {}
    
    document.body.style.overflow = 'auto';
  }
  
  // Run immediately, on DOMContentLoaded, and after delays
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoStart);
  } else {
    autoStart();
  }
  setTimeout(autoStart, 300);
  setTimeout(autoStart, 800);
  setTimeout(autoStart, 2000);
})();
</script>`;
  
  // Remove old bypass scripts
  content = content.replace(/<script>\/\* FIXED BYPASS \*\/[\s\S]*?<\/script>/g, '');
  
  if (!content.includes('AUTO START - skip login')) {
    content = content.replace('</body>', autoScript + '\n</body>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    fixed++;
  }
}

console.log('Updated ' + fixed + ' files with auto-exam bypass');

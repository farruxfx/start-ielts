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
  
  // Remove old bypass scripts (AUTO START and PROPER BYPASS)
  content = content.replace(/<script>\s*\/\*(?: AUTO START| PROPER BYPASS)[\s\S]*?<\/script>/g, '');
  
  // Remove old CSS fixes
  content = content.replace(/<style>\s*\/\*(?: CLEAN FIX| PROPER FIX| FIXED CSS)[\s\S]*?<\/style>/g, '');
  
  // Add a simple, robust inline script that uses setAttribute to force styles
  const inlineScript = `
<script>
(function(){
  function hideLoginShowExam(){
    var screens=document.querySelectorAll('.screen');
    screens.forEach(function(s){
      if(s.id==='exam-screen'){
        s.setAttribute('style','display:block!important;visibility:visible!important;opacity:1!important;');
      }else{
        s.setAttribute('style','display:none!important;visibility:hidden!important;position:absolute!important;');
      }
    });
    var ls=document.getElementById('login-screen');
    if(ls) ls.setAttribute('style','display:none!important;');
    var hs=document.getElementById('home-screen');
    if(hs) hs.setAttribute('style','display:none!important;');
    document.body.setAttribute('style','overflow:auto!important;');
    try{if(typeof beginExam==='function') beginExam();}catch(e){}
    try{if(typeof startExam==='function') startExam();}catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hideLoginShowExam);
  else hideLoginShowExam();
  setTimeout(hideLoginShowExam,200);
  setTimeout(hideLoginShowExam,600);
  setTimeout(hideLoginShowExam,1500);
})();
</script>`;
  
  if (!content.includes('hideLoginShowExam')) {
    content = content.replace('</body>', inlineScript + '\n</body>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    fixed++;
  }
}

console.log('Updated ' + fixed + ' files with inline style bypass');

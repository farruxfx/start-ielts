const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'listening');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let fixed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Count occurrences of hideLoginShowExam
  const count = (content.match(/hideLoginShowExam/g) || []).length;
  if (count <= 1) continue;
  
  // Remove ALL existing bypass scripts
  content = content.replace(/<script>\s*\(function\(\)\{[\s\S]*?hideLoginShowExam[\s\S]*?\}\)\(\);\s*<\/script>/g, '');
  
  // Remove ALL old CSS fixes
  content = content.replace(/<style>\s*\/\*[\s\S]*?(CLEAN FIX|PROPER FIX|FIXED CSS|AUTO-FIX)[\s\S]*?<\/style>/g, '');
  
  // Remove old MASTER BYPASS / FIXED BYPASS scripts
  content = content.replace(/<script>\s*\/\*\s*(MASTER BYPASS|FIXED BYPASS|PROPER BYPASS|AUTO START)[\s\S]*?<\/script>/g, '');
  
  // Count again
  const newCount = (content.match(/hideLoginShowExam/g) || []).length;
  if (newCount > 0) continue;
  
  // Add exactly ONE clean bypass script
  const cleanScript = `
<script>
(function(){
  function fix(){
    document.querySelectorAll('.screen').forEach(function(s){
      s.setAttribute('style',s.id==='exam-screen'?'display:block!important;visibility:visible!important;opacity:1!important;':'display:none!important;visibility:hidden!important;');
    });
    document.body.setAttribute('style','overflow:auto!important;');
    try{if(typeof beginExam==='function')beginExam();}catch(e){}
    try{if(typeof startExam==='function')startExam();}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);
  else fix();
  setTimeout(fix,200);setTimeout(fix,800);
})();
</script>`;
  
  content = content.replace('</body>', cleanScript + '\n</body>');
  fs.writeFileSync(fp, content, 'utf8');
  fixed++;
  console.log('CLEANED: ' + file + ' (' + count + ' -> 1)');
}

console.log('\nCleaned ' + fixed + ' files');

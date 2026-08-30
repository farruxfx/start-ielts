const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'listening');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let fixed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  let changed = false;
  
  // 1. Remove ALL our injected scripts (autoSkipLogin, autoSkipLogin2, autoSkip3, hideLoginShowExam, etc.)
  const scriptPatterns = [
    /<script id="autoSkipLogin">[\s\S]*?<\/script>/g,
    /<script id="autoSkipLogin2">[\s\S]*?<\/script>/g,
    /<script id="autoSkip3">[\s\S]*?<\/script>/g,
    // Remove the bypass scripts that have nested <script>
    /<script>\s*<\/script>\s*<script>\s*<\/script>\s*<script>\s*<\/script>\s*<script>\s*\(function\(\)\{[\s\S]*?<\/script>/g,
    // Remove simpler bypass patterns
    /<script>\s*\(function\(\)\{\s*function\s+(?:fix|hideLoginShowExam|autoStart)[\s\S]*?<\/script>/g,
    // Remove old MASTER BYPASS / FIXED BYPASS / PROPER BYPASS / AUTO START
    /<script>\s*\/\*\s*(MASTER BYPASS|FIXED BYPASS|PROPER BYPASS|AUTO START)[\s\S]*?<\/script>/g,
    // Remove FIXED CSS style blocks
    /<style>\s*\/\*\s*FIXED CSS[\s\S]*?<\/style>/g,
  ];
  
  for (const pattern of scriptPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      changed = true;
    }
  }
  
  // 2. Fix mismatched script tags (extra <script> without </script>)
  // Find the last </body> and work backwards
  const bodyCloseIdx = content.lastIndexOf('</body>');
  if (bodyCloseIdx > 0) {
    const beforeBody = content.substring(0, bodyCloseIdx);
    // Count script open/close in the entire document
    const opens = (beforeBody.match(/<script[\s>]/g) || []).length;
    const closes = (beforeBody.match(/<\/script>/g) || []).length;
    if (opens !== closes) {
      console.log('MISMATCH in ' + file + ': ' + opens + ' opens, ' + closes + ' closes');
      changed = true;
    }
  }
  
  // 3. Add exactly ONE clean bypass script before </body>
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
  
  // Remove any existing fix scripts first
  content = content.replace(/<script>\s*\(function\(\)\{[\s\S]*?function\s+fix\(\)[\s\S]*?\}\)\(\);\s*<\/script>/g, '');
  
  if (!content.includes('function fix(){')) {
    content = content.replace('</body>', cleanScript + '\n</body>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    fixed++;
  }
  
  // Verify script tag balance
  const finalOpens = (content.match(/<script[\s>]/g) || []).length;
  const finalCloses = (content.match(/<\/script>/g) || []).length;
  if (finalOpens !== finalCloses) {
    console.log('STILL MISMATCHED: ' + file + ': ' + finalOpens + ' opens, ' + finalCloses + ' closes');
  }
}

console.log('\nCleaned ' + fixed + ' files');

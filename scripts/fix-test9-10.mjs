import { readFileSync, writeFileSync } from 'fs';

const files = [
  'public/mock-exams/full-mock-test-9.html',
  'public/mock-exams/full-mock-test-10.html',
];

for (const file of files) {
  let html = readFileSync(file, 'utf-8');
  
  // Step 1: Remove ALL previous bypass scripts we added
  html = html.replace(/<script>\s*\/\* MASTER BYPASS[\s\S]*?<\/script>/g, '');
  html = html.replace(/<script>\s*\/\/ Override playGate[\s\S]*?<\/script>/g, '');
  html = html.replace(/<!-- bypass removed -->/g, '');
  
  // Step 2: Remove the two inline scripts that show intro and call startModule
  // Script 1: hides login, shows intro
  html = html.replace(/<script>\s*\(function\(\)\s*\{\s*var loginEl = document\.getElementById\('login'\);\s*var introEl = document\.getElementById\('intro'\);\s*if\(loginEl\) loginEl\.style\.display='none';\s*if\(introEl\) introEl\.classList\.remove\('hidden'\);\s*\}\)\(\);\s*<\/script>/gs, '');
  
  // Script 2: hides login/scLogin/scHub, shows intro, calls startModule('L')
  html = html.replace(/<script>\s*\(function\(\)\s*\{\s*var loginEl = document\.getElementById\('login'\);\s*var scLogin = document\.getElementById\('scLogin'\);\s*var scHub = document\.getElementById\('scHub'\);\s*var introEl = document\.getElementById\('intro'\);\s*if\(loginEl\)\{loginEl\.style\.display='none';loginEl\.classList\.add\('hidden'\);\}\s*if\(scLogin\) scLogin\.style\.display='none';\s*if\(scHub\) scHub\.classList\.add\('hidden'\);\s*if\(introEl\)\{introEl\.classList\.remove\('hidden'\);introEl\.style\.display='flex';\}\s*setTimeout\(function\(\)\{\s*if\(typeof startModule === 'function'\) startModule\('L'\);\s*\},\s*\d+\);\s*\}\)\(\);\s*<\/script>/gs, '');
  
  // Step 3: Also patch the doLogin function to go straight to listening
  html = html.replace(
    /function doLogin\(\)\{[\s\S]*?introEl\.style\.display='flex';[\s\S]*?\}/,
    `function doLogin(){
      document.getElementById('login').style.display='none';
      document.getElementById('login').classList.add('hidden');
      var scLogin = document.getElementById('scLogin');
      var scHub = document.getElementById('scHub');
      if(scLogin) scLogin.style.display='none';
      if(scHub) scHub.classList.add('hidden');
    }`
  );
  
  // Step 4: Override playGate to skip video
  html = html.replace(
    /function playGate\(kind, label, onEnd\)\{/,
    `function playGate(kind, label, onEnd){ /* BYPASS - skip video */ if(typeof onEnd==='function') setTimeout(onEnd,50); return;`
  );
  
  // Step 5: Add master bypass script before </body>
  const bypassScript = `
<script>
/* MASTER BYPASS — skip login, intro, hub, and video gate */
(function(){
  // Hide ALL overlay screens immediately
  ['login','intro','scLogin','scHub','videoGate'].forEach(function(id){
    var el = document.getElementById(id);
    if(el){ el.style.display='none'; el.classList.add('hidden'); }
  });
  // Hide any fullscreen video overlays
  document.querySelectorAll('.video-gate, .gate-overlay').forEach(function(el){
    el.style.display='none';
  });
  // Start Listening directly
  setTimeout(function(){
    if(typeof beginListening === 'function') beginListening();
  }, 100);
})();
</script>`;
  
  // Insert before </body>
  html = html.replace('</body>', bypassScript + '\n</body>');
  
  writeFileSync(file, html, 'utf-8');
  console.log(`Fixed ${file}`);
  
  // Verify
  const check = readFileSync(file, 'utf-8');
  const introCount = (check.match(/introEl.*remove.*hidden/g) || []).length;
  const bypassCount = (check.match(/MASTER BYPASS/g) || []).length;
  const readingCdi = (check.match(/READING_CDI|reading_cdi/g) || []).length;
  console.log(`  - introEl show references: ${introCount}`);
  console.log(`  - MASTER BYPASS scripts: ${bypassCount}`);
  console.log(`  - READING_CDI references: ${readingCdi}`);
}

console.log('All done!');

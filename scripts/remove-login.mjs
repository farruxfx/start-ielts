import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DEST = 'public/mock-exams';

const files = [
  'full-mock-test-2.html',
  'full-mock-test-3.html',
  'full-mock-test-4.html',
  'full-mock-test-5.html',
  'full-mock-test-6.html',
  'full-mock-test-7.html',
  'full-mock-test-8.html',
  'full-mock-test-9.html',
  'full-mock-test-10.html',
];

for (const file of files) {
  const path = join(DEST, file);
  let html = readFileSync(path, 'utf8');

  // 1. Replace READING_CDI with IELTS PRO (case variations)
  html = html.replace(/READING_CDI/gi, 'IELTS PRO');
  html = html.replace(/reading_cdi/gi, 'IELTS PRO');
  html = html.replace(/readingcdi/gi, 'IELTS PRO');

  // 2. Bypass login — make ACCESS_CODE accept any input
  html = html.replace(
    /const ACCESS_CODE\s*=\s*['"][^'"]*['"]/g,
    "const ACCESS_CODE = ''"
  );

  // 3. Auto-skip login in doLogin — always proceed
  html = html.replace(
    /function doLogin\(\)\{[\s\S]*?\}/g,
    `function doLogin(){ document.getElementById('login').classList.add('hidden'); document.getElementById('intro').classList.remove('hidden'); }`
  );

  // 4. Remove password input validation (incorrect password error)
  html = html.replace(
    /if\(code !== ACCESS_CODE\)\{[^}]*\}/g,
    ''
  );

  // 5. Remove the login screen entirely — hide it, show intro instead
  // Add a script at the end of body to auto-skip login
  html = html.replace(
    /<\/body>/gi,
    `<script>
    (function(){
      var loginEl = document.getElementById('login');
      var introEl = document.getElementById('intro');
      if(loginEl) loginEl.style.display='none';
      if(introEl) introEl.classList.remove('hidden');
    })();
    </script></body>`
  );

  // 6. Remove Candidate name and Password labels/inputs from intro cards
  html = html.replace(/<div class="form-row">[\s\S]*?<\/div>/g, '');

  // 7. Remove any "Sign in" buttons
  html = html.replace(/<button[^>]*>Sign in[^<]*<\/button>/gi, '');

  // 8. Remove password-related input fields
  html = html.replace(/<input[^>]*id="accessCode"[^>]*>/gi, '<input id="accessCode" type="hidden" value="ok">');
  html = html.replace(/<input[^>]*id="candId"[^>]*>/gi, '<input id="candId" type="hidden" value="Student">');

  // 9. Replace all IELTS PRO in visible titles/branding  
  // Already done in step 1

  writeFileSync(path, html);
  
  const remaining = (html.match(/READING_CDI|reading_cdi|READINGCDI/gi) || []).length;
  const passRefs = (html.match(/password|Password|ACCESS_CODE/gi) || []).length;
  console.log(`✓ ${file}: READING_CDI=${remaining}, password refs=${passRefs}`);
}

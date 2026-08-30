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

  // 1. Remove all labels for candId and accessCode
  html = html.replace(/<label[^>]*for="candId"[^>]*>[\s\S]*?<\/label>/gi, '');
  html = html.replace(/<label[^>]*for="accessCode"[^>]*>[\s\S]*?<\/label>/gi, '');
  html = html.replace(/<label[^>]*>Candidate name<\/label>/gi, '');
  html = html.replace(/<label[^>]*>Password<\/label>/gi, '');

  // 2. Remove form-row divs containing candidate/password fields
  html = html.replace(/<div[^>]*class="form-row"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 3. Remove Candidate name and Password text
  html = html.replace(/Candidate name/gi, '');
  html = html.replace(/>Password</gi, '><');

  // 4. Remove login error div
  html = html.replace(/<div[^>]*id="loginErr"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 5. Remove "Sign in" buttons
  html = html.replace(/<button[^>]*>[^<]*Sign in[^<]*<\/button>/gi, '');

  // 6. Make the login div completely invisible with CSS injection
  html = html.replace(
    /<\/head>/gi,
    `<style>#login{display:none!important}#login>*{display:none!important}</style></head>`
  );

  // 7. Also add a strong JavaScript override at the end of body
  html = html.replace(
    /<\/body>/gi,
    `<script>
    (function(){
      var loginEl = document.getElementById('login');
      var introEl = document.getElementById('intro');
      if(loginEl){loginEl.style.display='none';loginEl.style.visibility='hidden';loginEl.style.height='0';loginEl.style.overflow='hidden';}
      if(introEl){introEl.classList.remove('hidden');introEl.style.display='flex';}
    })();
    </script></body>`
  );

  // 8. Remove "How this test runs" instruction boxes that mention passwords
  html = html.replace(/<div[^>]*style="[^"]*background:\s*#fef2f2[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 9. Replace any remaining IELTS PRO in title
  html = html.replace(/<title>IELTS PRO\s*[—–-]\s*/gi, '<title>');

  writeFileSync(path, html);
  
  const loginRefs = (html.match(/Candidate name|type="password"|Sign in/gi) || []).length;
  console.log(`✓ ${file}: login UI refs=${loginRefs}`);
}

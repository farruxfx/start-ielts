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
  const originalLength = html.length;

  // Find and replace the entire doLogin function by tracking brace depth
  const doLoginIdx = html.indexOf('function doLogin');
  if (doLoginIdx === -1) {
    console.log(`⏭ ${file}: no doLogin found`);
    continue;
  }

  // Find the opening brace
  const openBrace = html.indexOf('{', doLoginIdx);
  if (openBrace === -1) {
    console.log(`⏭ ${file}: no opening brace for doLogin`);
    continue;
  }

  // Track brace depth to find the matching closing brace
  let depth = 0;
  let endIdx = -1;
  for (let i = openBrace; i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}') depth--;
    if (depth === 0) {
      endIdx = i + 1;
      break;
    }
  }

  if (endIdx === -1) {
    console.log(`⏭ ${file}: couldn't find end of doLogin function`);
    continue;
  }

  const oldFunc = html.substring(doLoginIdx, endIdx);
  const newFunc = `function doLogin(){
    document.getElementById('login').style.display='none';
    document.getElementById('login').classList.add('hidden');
    var introEl = document.getElementById('intro');
    if(introEl){introEl.classList.remove('hidden');introEl.style.display='flex';}
  }`;

  html = html.substring(0, doLoginIdx) + newFunc + html.substring(endIdx);
  writeFileSync(path, html);
  console.log(`✓ ${file}: replaced doLogin (${oldFunc.length} → ${newFunc.length} chars)`);
}

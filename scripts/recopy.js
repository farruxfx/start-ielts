const fs = require('fs');
const path = require('path');
const srcDir = path.join('C:', 'Users', 'user', 'Documents', 'apps', 'ielts platform', 'exam files for platform', 'listening');
const dstDir = path.join(__dirname, '..', 'public', 'listening');

try {
  const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));
  let copied = 0;
  srcFiles.forEach(f => {
    const src = path.join(srcDir, f);
    let cleanName = f.replace(/@shohrukhposts?/gi, '').replace(/\s+/g, ' ').trim();
    if (!cleanName.endsWith('.html')) cleanName += '.html';
    const dst = path.join(dstDir, cleanName);
    fs.copyFileSync(src, dst);
    copied++;
  });
  console.log('Copied ' + copied + ' fresh files');
} catch(e) {
  console.log('Error: ' + e.message);
  // Try alternative path
  const srcDir2 = 'C:/Users/user/Documents/apps/ielts platform/exam files for platform/listening';
  try {
    const srcFiles = fs.readdirSync(srcDir2).filter(f => f.endsWith('.html'));
    console.log('Found ' + srcFiles.length + ' files with alternative path');
  } catch(e2) {
    console.log('Alt also failed: ' + e2.message);
  }
}

// Verify script tag balance
let balanced = 0, unbalanced = 0;
fs.readdirSync(dstDir).filter(f => f.endsWith('.html')).forEach(f => {
  const c = fs.readFileSync(path.join(dstDir, f), 'utf8');
  const opens = (c.match(/<script[\s>]/g) || []).length;
  const closes = (c.match(/<\/script>/g) || []).length;
  if (opens === closes) balanced++;
  else { unbalanced++; }
});
console.log('Balanced: ' + balanced + ', Unbalanced: ' + unbalanced);

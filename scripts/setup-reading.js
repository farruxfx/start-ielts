const fs = require('fs');
const path = require('path');

const srcDir = path.join('C:', 'Users', 'user', 'Documents', 'apps', 'ielts platform', 'exam files for platform', 'reading');
const dstDir = path.join(__dirname, '..', 'public', 'reading');

// Create directory
if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });

// Get all HTML files
const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

// Exclude listening files and non-test files
const excludePatterns = [/listening/i, /reading report/i, /reading_mock/i];

let copied = 0;
const tests = [];

for (const f of srcFiles) {
  if (excludePatterns.some(p => p.test(f))) continue;
  
  const src = path.join(srcDir, f);
  
  // Clean filename
  let cleanName = f
    .replace(/@shohrukhposts?/gi, '')
    .replace(/@reading_cdi/gi, '')
    .replace(/\(reading_cdi\)/gi, '')
    .replace(/reading_cdi/gi, '')
    .replace(/_reading_cdi/gi, '')
    .replace(/_cdi/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleanName.endsWith('.html')) cleanName += '.html';
  
  const dst = path.join(dstDir, cleanName);
  fs.copyFileSync(src, dst);
  copied++;
  
  // Generate metadata
  const slug = cleanName.replace(/\.html$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const name = cleanName.replace(/\.html$/i, '').trim();
  
  let category = 'Academic';
  if (name.toLowerCase().includes('mock')) category = 'Mock';
  else if (name.toLowerCase().includes('cambridge')) category = 'Cambridge';
  else if (name.toLowerCase().includes('authentic')) category = 'Authentic';
  else if (name.toLowerCase().includes('passage 1')) category = 'Passage 1';
  else if (name.toLowerCase().includes('passage 2')) category = 'Passage 2';
  else if (name.toLowerCase().includes('passage 3')) category = 'Passage 3';
  else if (name.toLowerCase().includes('volume')) category = 'Volume 9';
  
  tests.push({
    id: String(tests.length + 1),
    name,
    title: name,
    slug,
    filename: cleanName,
    category,
    difficulty: 'Medium',
    duration: 20,
    questionCount: 13
  });
}

console.log('Copied ' + copied + ' reading HTML files');

// Check for balanced script tags
let balanced = 0, unbalanced = 0;
const htmlFiles = fs.readdirSync(dstDir).filter(f => f.endsWith('.html'));
for (const f of htmlFiles) {
  const c = fs.readFileSync(path.join(dstDir, f), 'utf8');
  const opens = (c.match(/<script[\s>]/g) || []).length;
  const closes = (c.match(/<\/script>/g) || []).length;
  if (opens === closes) balanced++;
  else { unbalanced++; console.log('UNBALANCED: ' + f + ' ' + opens + '/' + closes); }
}
console.log('Balanced: ' + balanced + ', Unbalanced: ' + unbalanced);

// Count categories
const cats = {};
tests.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
console.log('Categories:', JSON.stringify(cats));

// Write registry
const catList = [...new Set(tests.map(t => t.category))].sort();
const registry = `export interface ReadingTest {
  id: string;
  name: string;
  title: string;
  slug: string;
  filename: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  questionCount: number;
}

export const READING_CATEGORIES = ${JSON.stringify(catList)};

export const READING_TESTS: ReadingTest[] = ${JSON.stringify(tests, null, 2)};

export function getReadingTest(slug: string): ReadingTest | undefined {
  return READING_TESTS.find(t => t.slug === slug);
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'reading-tests.ts'), registry);
console.log('Registry written with ' + tests.length + ' reading tests');

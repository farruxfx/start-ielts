import { readFileSync, writeFileSync, readdirSync } from 'fs';

/**
 * Unifies the visual design of every test HTML file (listening + reading):
 *  1. Repairs broken headers (missing <!DOCTYPE html><html><head>, stray BOM).
 *  2. Rebrands every hardcoded accent color to the app blue (#2563eb).
 *  3. Injects one shared stylesheet (font stack, accent vars, inputs, options,
 *     buttons, radios, scrollbars, focus rings) before </head>.
 *
 * Audio is never touched: replacements only match strings that contain '#'
 * (impossible inside base64 payloads) and the injected sheet is pure CSS.
 */

const BRAND = '#2563eb';
const BRAND_DARK = '#1d4ed8';
const MARKER = 'startielts-unified-design';

// Accent hexes used by the three generator families (always written with '#',
// which cannot occur inside base64 audio data).
const COLOR_MAP = [
  [/#e31837/gi, BRAND],
  [/#d6001c/gi, BRAND],
  [/#e4002b/gi, BRAND],
  [/#c11530/gi, BRAND_DARK],
  [/#1a73e8/gi, BRAND],
  [/rgb\(227,\s*24,\s*55\)/gi, 'rgb(37,99,235)'],
  [/rgba\(227,\s*24,\s*55/gi, 'rgba(37,99,235'],
  [/rgb\(26,\s*115,\s*232\)/gi, 'rgb(37,99,235)'],
];

const SHARED_CSS = `
<style id="${MARKER}">
/* ===== StartIELTS unified design (auto-injected) ===== */
:root{
  --brand:#2563eb; --brand-dark:#1d4ed8; --brand-light:rgba(37,99,235,.10);
  --sui-border:#cbd5e1; --sui-text:#0f172a; --sui-muted:#64748b; --sui-bg:#f8fafc;
}
html{ -webkit-text-size-adjust:100%; }
body{
  font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif !important;
  color:var(--sui-text);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
h1,h2,h3,h4{ font-family:inherit; letter-spacing:-0.01em; }
::selection{ background:rgba(37,99,235,.22); }
::placeholder{ color:#94a3b8; }
:focus-visible{ outline:2px solid var(--brand); outline-offset:2px; }
/* form controls */
input[type="radio"], input[type="checkbox"]{ accent-color:var(--brand) !important; }
input[type="text"], input[type="number"], input[type="email"], input[type="password"],
.answer-input, .inline-input, textarea, select{
  font:inherit; color:var(--sui-text);
  border:1.5px solid var(--sui-border); border-radius:8px;
  background:#fff; transition:border-color .15s, box-shadow .15s;
}
input[type="text"]:focus, input[type="number"]:focus, .answer-input:focus,
.inline-input:focus, textarea:focus, select:focus{
  outline:none; border-color:var(--brand); box-shadow:0 0 0 3px rgba(37,99,235,.15);
}
/* option rows (multiple choice / T-F / matching) */
.choice-option, .radio-option, .opt, .opt-btn, .tf-option, .answer-radio{
  border-radius:10px;
}
.choice-option:hover, .radio-option:hover, .opt:hover, .opt-btn:hover{ filter:brightness(.985); }
/* buttons */
button{ font-family:inherit; border-radius:10px; }
button:disabled{ opacity:.55; cursor:not-allowed; }
/* scrollbars */
::-webkit-scrollbar{ width:10px; height:10px; }
::-webkit-scrollbar-track{ background:transparent; }
::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:8px; border:2px solid transparent; background-clip:content-box; }
::-webkit-scrollbar-thumb:hover{ background:#94a3b8; background-clip:content-box; }
/* media & iframe canvas never overflow */
img, svg, video{ max-width:100%; height:auto; }
/* accent vars used by the different generator families */
:root{ --accent:var(--brand); --accent-dark:var(--brand-dark); --accent-light:var(--brand-light); --logo:var(--brand); --blue:var(--brand); }
/* ===== end StartIELTS unified design ===== */
</style>
`;

function repairAndInject(content) {
  // 1. Strip UTF-8 BOM.
  content = content.replace(/^\uFEFF/, '');

  // 2. Repair files saved without a document header (they start with <title>).
  if (!/^<!DOCTYPE/i.test(content) && /^<title>/i.test(content)) {
    content = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' + content;
  }

  // 3. Rebrand hardcoded accent colors.
  for (const [re, to] of COLOR_MAP) content = content.replace(re, to);

  // 3b. Neutralize localStorage.clear(): these test files run inside the app's
  // origin, so a blind clear() also wipes the app's ieltspro_* keys and
  // silently signs the user out. Keep only non-app keys.
  content = content.replace(
    /localStorage\.clear\(\)/g,
    "(()=>{try{Object.keys(localStorage).forEach(k=>{if(k.indexOf('ieltspro_')!==0)localStorage.removeItem(k)})}catch(e){}})()"
  );

  // 4. Inject (or refresh) the shared stylesheet before </head>.
  const hasMarker = content.includes(`id="${MARKER}"`);
  if (hasMarker) {
    const re = new RegExp(`<style id="${MARKER}">[\\s\\S]*?</style>`);
    content = content.replace(re, SHARED_CSS.trim());
  } else if (/<\/head>/i.test(content)) {
    content = content.replace(/<\/head>/i, SHARED_CSS + '</head>');
  } else {
    return { content, ok: false, reason: 'no </head>' };
  }
  return { content, ok: true };
}

let updated = 0, skipped = [], unchanged = 0;
for (const dir of ['public/listening', 'public/reading']) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.html'));
  for (const file of files) {
    const path = `${dir}/${file}`;
    let raw;
    try {
      raw = readFileSync(path);
    } catch (e) {
      skipped.push(`${file} | read: ${e.message}`);
      continue;
    }

    // Skip fully corrupted files (NUL padding — data lost at the filesystem level).
    if (raw[0] === 0) {
      skipped.push(`${file} | corrupted (NUL bytes)`);
      continue;
    }

    let content = raw.toString('utf8');
    const before = content;
    const res = repairAndInject(content);
    if (!res.ok) {
      skipped.push(`${file} | ${res.reason}`);
      continue;
    }
    if (res.content !== before) {
      writeFileSync(path, res.content, 'utf8');
      updated++;
    } else {
      unchanged++;
    }
  }
}

console.log(`Yangilandi: ${updated}, ozgarmagan: ${unchanged}`);
if (skipped.length) {
  console.log(`Skip (${skipped.length}):`);
  skipped.forEach((s) => console.log('  ' + s));
}

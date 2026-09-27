import { readFileSync, writeFileSync, readdirSync } from 'fs';

/**
 * Unifies the visual design of every test HTML file (listening + reading):
 *  1. Repairs broken headers (missing <!DOCTYPE html><html><head>, stray BOM).
 *  2. Rebrands every hardcoded accent color to the mock-runner violet (#7c3aed).
 *  3. Injects one shared stylesheet (font stack, accent vars, inputs, options,
 *     buttons, radios, scrollbars, focus rings) before </head>.
 *
 * Audio is never touched: replacements only match strings that contain '#'
 * (impossible inside base64 payloads) and the injected sheet is pure CSS.
 */

const BRAND = '#7c3aed';
const BRAND_DARK = '#6d28d9';
const PRIMARY_BLUE = '#2563eb';
const MARKER = 'startielts-unified-design';

// Accent hexes used by the three generator families (always written with '#',
// which cannot occur inside base64 audio data).
const COLOR_MAP = [
  [/#e31837/gi, BRAND],
  [/#d6001c/gi, BRAND],
  [/#e4002b/gi, BRAND],
  [/#c11530/gi, BRAND_DARK],
  [/#1a73e8/gi, PRIMARY_BLUE],
  [/#2563eb/gi, PRIMARY_BLUE],
  [/#1d4ed8/gi, PRIMARY_BLUE],
  [/#007acc/gi, BRAND],
  [/rgb\(227,\s*24,\s*55\)/gi, 'rgb(124,58,237)'],
  [/rgba\(227,\s*24,\s*55/gi, 'rgba(124,58,237'],
  [/rgb\(26,\s*115,\s*232\)/gi, 'rgb(37,99,235)'],
  [/rgb\(37,\s*99,\s*235\)/gi, 'rgb(37,99,235)'],
  [/rgba\(37,\s*99,\s*235/gi, 'rgba(37,99,235'],
  [/rgb\(0,\s*122,\s*204\)/gi, 'rgb(124,58,237)'],
  [/rgba\(0,\s*122,\s*204/gi, 'rgba(124,58,237'],
];

const SHARED_CSS = `
<style id="${MARKER}">
/* ===== StartIELTS unified design (auto-injected) ===== */
:root{
  --brand:${BRAND}; --brand-dark:${BRAND_DARK}; --brand-light:rgba(124,58,237,.08);
  --sui-border:#e5e7eb; --sui-text:#1f2937; --sui-muted:#6b7280; --sui-bg:#f9fafb;
}
html{ -webkit-text-size-adjust:100%; }
body{
  font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif !important;
  color:var(--sui-text);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
h1,h2,h3,h4{ font-family:inherit; letter-spacing:-0.01em; }
::selection{ background:rgba(124,58,237,.18); }
::placeholder{ color:#9ca3af; }
:focus-visible{ outline:2px solid ${BRAND}; outline-offset:2px; }
/* form controls */
input[type="radio"], input[type="checkbox"]{ accent-color:var(--brand) !important; }
input[type="text"], input[type="number"], input[type="email"], input[type="password"],
.answer-input, .inline-input, textarea, select{
  font:inherit; color:var(--sui-text);
  border:1.5px solid var(--sui-border); border-radius:12px;
  background:#fff; padding:10px 14px;
  transition:border-color .15s, box-shadow .15s;
}
input[type="text"]:focus, input[type="number"]:focus, .answer-input:focus,
.inline-input:focus, textarea:focus, select:focus{
  outline:none; border-color:${BRAND}; box-shadow:0 0 0 3px rgba(124,58,237,.15);
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
:root{ --accent:${BRAND}; --accent-dark:${BRAND_DARK}; --accent-light:var(--brand-light); --logo:${PRIMARY_BLUE}; --blue:${PRIMARY_BLUE}; }

/* ===== mock-runner skin — matches the app's Full Mock Exam look ===== */
/* selected / checked option rows: pale violet fill, rounded */
.choice-option.selected,
.radio-option.selected,
.opt.selected,
.opt-btn.selected,
.tf-option.selected,
label:has(> input[type="radio"]:checked),
label:has(> input[type="checkbox"]:checked){
  background:rgba(124,58,237,.08) !important;
}
.choice-option, .radio-option, .opt, .opt-btn, .tf-option{
  border-radius:12px !important;
}
.choice-option:hover, .radio-option:hover, .opt:hover, .opt-btn:hover{ background:#f5f3ff; }
/* question-number navigation chips: rounded, violet when active */
.question-number-btn, .q-num, .page-btn{
  border-radius:10px !important;
}
.question-number-btn.active, .q-num.active{
  background:${BRAND} !important; color:#fff !important; border-color:${BRAND} !important;
}
.question-number-btn.answered{ background:#ede9fe !important; border-color:#8b5cf6 !important; }
/* primary submit button: solid blue pill like the mock runner's Next button */
.submit-btn, .check-btn, .finish-btn{
  background:${PRIMARY_BLUE} !important; color:#fff !important;
  border-radius:10px !important; font-weight:700 !important;
}
.submit-btn:hover, .check-btn:hover, .finish-btn:hover{ background:#1d4ed8 !important; }
/* radios/checkboxes: violet accent */
input[type="radio"], input[type="checkbox"]{ accent-color:${BRAND} !important; }
/* question blocks breathe — card-like rhythm like the mock runner */
.mc-question, [data-question], .question-block, .tf-question, .q-card{
  margin-bottom:14px;
}
/* question groups become mock-runner cards: white, rounded, soft border */
.mc-question, .tf-question, .question-block, .qgroup, .q-item{
  background:#fff; border:1px solid var(--sui-border); border-radius:16px;
  padding:16px 18px; box-shadow:0 1px 2px rgba(16,24,40,.04);
  margin-bottom:14px;
}
.q-item{ padding:12px 14px; }
/* part intro / instructions: light violet banner like the mock runner */
.part-banner, .part-intro, .part-instructions, .part-header p{
  background:#f5f3ff; border-radius:12px; padding:10px 16px; color:#5b21b6;
}
.mc-question p, .question-text{ font-weight:600; color:var(--sui-text); }
/* inline checkbox/radio labels get clickable pill spacing */
.mc-question label, .choice-options label{
  display:inline-flex; align-items:center; gap:7px;
  padding:5px 12px; margin:3px 6px 3px 0;
  border:1px solid var(--sui-border); border-radius:999px;
  background:#fff; cursor:pointer;
  transition:background .12s, border-color .12s;
}
.mc-question label:hover, .choice-options label:hover{ background:#f5f3ff; border-color:#ddd6fe; }
.mc-question label:has(input:checked){ background:rgba(124,58,237,.08); border-color:#c4b5fd; }
/* section headings inside tests: semibold, slate */
.part-content h2, .part-content h3{ color:var(--sui-text); }
/* ===== end mock-runner skin ===== */
/* ===== force the light exam theme — the mock runner is always light ===== */
html{ color-scheme:light; }
html[data-theme="dark"]{
  --bg:#eef0f4; --bg-blob-1:#f5f3ff; --bg-blob-2:#eef2ff; --bg-blob-3:#f0fdf4;
  --panel:rgba(255,255,255,.62); --panel-solid:#ffffff;
  --text:#1c1c1e; --text2:#6e6e73; --text3:#98989d;
  --border:rgba(60,60,67,.13); --hairline:rgba(60,60,67,.08);
  --accent:#7c3aed; --accent-dark:#6d28d9; --accent-light:rgba(124,58,237,.10);
  --green:#22a559; --green-bg:rgba(34,165,89,.14);
  --redx:#ff3b30; --red-bg:rgba(255,59,48,.12);
  --yellow:#ff9500; --yellow-bg:rgba(255,149,0,.15);
  --glass-hi:rgba(255,255,255,.85); --glass-lo:rgba(255,255,255,.18);
  --shadow:0 10px 40px rgba(31,38,55,.10),0 1px 2px rgba(31,38,55,.06);
}
/* dark-mode toggles are locked to light — hide the now-useless switches */
.theme-btn, [id^="theme-toggle"], [id^="theme-knob"], [id^="themeBtn"], .knob,
.iconbtn[title*="Dark"], .iconbtn[title*="dark"], button[title*="Dark / light"],
button[title*="dark mode" i], [title*="dark mode" i]{ display:none !important; }
/* ===== mobile responsiveness (320–430px) — split panels stack, grids collapse ===== */
@media (max-width:640px){
  body{ overflow-y:auto !important; }
  .screen{ height:auto !important; min-height:100vh; }
  /* any 50/50 split becomes a stacked column; resizer is meaningless on touch */
  .body-area{ flex-direction:column !important; overflow-y:auto !important; -webkit-overflow-scrolling:touch; }
  .pane{ overflow:visible !important; padding:14px 12px 32px !important; }
  .pane.left, .pane.right{ flex:0 0 auto !important; }
  .resizer{ display:none !important; }
  /* multi-column grids collapse to a single column */
  .res-row, .navrow, .modal-score-row{ grid-template-columns:1fr !important; }
  /* text inputs stay usable above the mobile keyboard */
  input[type="text"], input[type="number"], .answer-input, .inline-input, textarea, select{ font-size:16px !important; }
  /* touch-friendly option rows and nav chips */
  .mc-question label, .choice-options label{ padding:9px 14px; margin:4px 6px 4px 0; }
  .question-number-btn, .q-num, .page-btn{ min-width:34px; min-height:34px; }
  /* header bars wrap instead of clipping */
  .bar-right{ gap:2px; }
  .iconbtn{ width:30px; height:30px; }
  /* wide tables and pre blocks scroll inside their own container */
  table{ display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; }
  pre{ overflow-x:auto; }
  /* footer nav rows stay reachable */
  .navscroll, .navgroup{ overflow-x:auto; max-width:100%; }
}
/* ===== end StartIELTS unified design ===== */
</style>
`;

/**
 * Keeps every test in the light mock-runner theme: pins html[data-theme]
 * to "light" (re-asserting it whenever a test's own toggle flips it back).
 */
const SKIN_JS = `<script id="${MARKER}-js">
(function(){try{
  var el=document.documentElement;
  var lock=function(){ if(el.getAttribute('data-theme')!=='light') el.setAttribute('data-theme','light'); };
  lock();
  new MutationObserver(lock).observe(el,{attributes:true,attributeFilter:['data-theme']});
}catch(e){}})();
</script>
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

  // 3c. Neutralize prefers-dark auto-theming: the mock-runner look is always
  // light, so a test must not flip itself to dark on dark-mode OS settings.
  content = content.replace(
    /window\.matchMedia\(\s*(['"])\(?prefers-color-scheme:\s*dark\)?\1\s*\)\.matches\s*\?\s*(['"])dark\2\s*:\s*(['"])light\3/g,
    "'light'"
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
  // Inject (or refresh) the theme-lock script right after the stylesheet.
  const scriptRe = new RegExp(`<script id="${MARKER}-js">[\\s\\S]*?</script>`);
  if (scriptRe.test(content)) {
    content = content.replace(scriptRe, SKIN_JS.trim());
  } else if (/<\/head>/i.test(content)) {
    content = content.replace(/<\/head>/i, SKIN_JS + '</head>');
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

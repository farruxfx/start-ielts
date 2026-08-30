/**
 * IELTS Writing Analyser — evaluates text on 4 official criteria:
 *   1. Task Achievement / Response
 *   2. Coherence & Cohesion
 *   3. Lexical Resource
 *   4. Grammatical Range & Accuracy
 *
 * Returns band scores 0-9 (half-band steps) and detailed feedback.
 */

export interface CriterionResult {
  band: number;           // 0-9 (half-band: 5.0, 5.5, 6.0 …)
  label: string;
  description: string;    // one-line Uzbek summary
  details: string[];      // bullet-point feedback
}

export interface WritingAnalysis {
  taskAchievement: CriterionResult;
  coherenceCohesion: CriterionResult;
  lexicalResource: CriterionResult;
  grammar: CriterionResult;
  overallBand: number;
  wordCount: number;
  estimatedBand: string;
}

// ── helpers ──────────────────────────────────────────────────────
function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
}

function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
}

function avgWordLength(text: string): number {
  const w = words(text);
  if (w.length === 0) return 0;
  return w.reduce((sum, word) => sum + word.replace(/[^a-zA-Z]/g, '').length, 0) / w.length;
}

function typeTokenRatio(text: string): number {
  const w = words(text).map((w) => w.toLowerCase().replace(/[^a-z]/g, ''));
  if (w.length === 0) return 0;
  return new Set(w).size / w.length;
}

// Common IELTS linking words / discourse markers
const LINKING_WORDS = new Set([
  'however','furthermore','moreover','additionally','consequently','therefore',
  'nevertheless','nonetheless','in addition','on the other hand','for example',
  'for instance','in contrast','similarly','likewise','as a result','in conclusion',
  'to begin with','firstly','secondly','thirdly','finally','meanwhile','hence',
  'thus','accordingly','conversely','not only','but also','whereas','although',
  'despite','in spite of','on the one hand','in particular','specifically',
  'notwithstanding','in summary','overall','by and large','put simply',
  'in other words','that is to say','besides','what is more','equally',
]);

// Transition / cohesion devices inside text
const COHESION_PATTERNS = [
  /\bhowever\b/i, /\bfurthermore\b/i, /\bmoreover\b/i, /\bin addition\b/i,
  /\bfor example\b/i, /\bfor instance\b/i, /\bin contrast\b/i, /\bsimilarly\b/i,
  /\btherefore\b/i, /\bconsequently\b/i, /\bon the other hand\b/i,
  /\bin conclusion\b/i, /\bto begin with\b/i, /\bfirstly\b/i, /\bsecondly\b/i,
  /\bfinally\b/i, /\bmeanwhile\b/i, /\bnevertheless\b/i, /\bthus\b/i,
  /\bhence\b/i, /\bwhereas\b/i, /\balthough\b/i, /\bdespite\b/i,
  /\bon the one hand\b/i, /\bin particular\b/i, /\bbesides\b/i,
  /\bwhat is more\b/i, /\bequally\b/i, /\bthat is to say\b/i,
  /\bin other words\b/i, /\bput simply\b/i, /\bby and large\b/i,
  /\bin summary\b/i, /\boverall\b/i, /\bnot only.*but also\b/i,
];

// Sophisticated / less common vocabulary markers
const ADVANCED_VOCAB = new Set([
  'exacerbate','ameliorate','ubiquitous','paradigm','dichotomy','juxtapose',
  'corroborate','hypothesis','methodology','substantiate','mitigate','deteriorate',
  'proliferate','detrimental','inherent','prevalent','contemporary','empirical',
  'analogous','predominantly','simultaneously','indispensable','unprecedented',
  'socioeconomic','demographic','phenomenon','sustainable','advocate','stipulate',
  'conducive','undermine','eradicate','alleviate','compelling','invariably',
  'pragmatic','aesthetic','trajectory','disparity','discernible','paramount',
  'surmount','perpetuate','plethora','facilitate','deterioration','sporadic',
  'coherent','exemplify','nuanced','concomitant','indigenous','proponent',
  'fiscal','bureaucracy','jurisdiction','demographic','acquisition','ameliorate',
  'notwithstanding','heterogeneous','homogeneous','macro','micro','vicarious',
  'encompass','endeavour','fluctuate','formidable','imperative','impartial',
  'imperative','indispensable','inherent','integral','invoke','irrevocable',
  'juxtapose','kaleidoscope','mitigate','negligible','nonetheless','notwithstanding',
  'omnipresent','paradigm','paradox','penchant','peripheral','permeate',
  'pertinent','plausible','pivotal','predominant','prerequisite','prevalent',
  'profound','proliferate','proponent','prospective','provincial','provisional',
  'rampant','redundant','relinquish','repercussion','resilient','retrospect',
  'societal','solicit','sophisticated','speculative','stagnant','substantial',
  'substantiate','succinct','superficial','supplemental','surmount','susceptible',
  'tentative','tenacious','transcend','tremendous','unprecedented','utilitarian',
  'viable','volatile','vulnerable','whereas','wholesome','zealous',
]);

// Grammatical error indicators
const GRAMMAR_PATTERNS = {
  subjectVerbAgree: [
    /\b(he|she|it)\s+(have|are|were|were|do|does)\b/gi,
    /\b(they|we|you)\s+(has|is|was|does)\b/gi,
    /\bI\s+(is|are|was|has)\b/gi,
  ],
  runOnSentences: [/[^.!?;:]{200,}/g],
  sentenceFragments: /^(the |a |an |this |that |it |he |she |we |they )[^.!?]*$/gim,
  repetition: /\b(\w+)\s+\1\b/gi,
  missingArticle: /\b(government|society|education|technology|environment|people)\b/gi,
  commonErrors: [
    /\bmore better\b/gi, /\bmore worse\b/gi, /\bmost best\b/gi,
    /\bvery unique\b/gi, /\bmore superior\b/gi, /\bmost perfect\b/gi,
    /\bin the other hand\b/gi, /\bfor the例\b/gi,
    /\bdespite of\b/gi, /\black of\b/gi,
    /\bdo not have no\b/gi, /\bis not no\b/gi,
  ],
};

// ── Criterion scorers ──────────────────────────────────────────
function scoreTaskAchievement(text: string, taskType: 'task1' | 'task2'): CriterionResult {
  const w = words(text);
  const wc = w.length;
  const sents = sentences(text);
  const paras = paragraphs(text);
  const minWords = taskType === 'task1' ? 150 : 250;

  const details: string[] = [];
  let band = 5.0;

  // Word count
  if (wc >= minWords * 1.5) {
    band += 0.5;
    details.push(`✅ So'z soni yetarli: ${wc} (min: ${minWords})`);
  } else if (wc >= minWords) {
    details.push(`✅ So'z soni yetarli: ${wc} (min: ${minWords})`);
  } else if (wc >= minWords * 0.75) {
    band -= 0.5;
    details.push(`⚠️ So'z soni kam: ${wc} (min: ${minWords}) — kamida ${minWords} so'z kerak`);
  } else {
    band -= 1.5;
    details.push(`❌ So'z soni juda kam: ${wc} (min: ${minWords}) — bu bahoni keskin tushiradi`);
  }

  // Address the prompt
  const promptWords = taskType === 'task1'
    ? ['describe','summarise','report','chart','graph','data','trend','overview','comparison']
    : ['discuss','opinion','view','agree','disagree','both','advantage','disadvantage','essay'];
  const textLower = text.toLowerCase();
  const promptHits = promptWords.filter((pw) => textLower.includes(pw)).length;
  if (promptHits >= 3) {
    band += 0.5;
    details.push('✅ Mavzuga oid kalit so\'zlar ishlatilgan');
  } else if (promptHits >= 1) {
    details.push('⚡ Mavzuga oid ba\'zi kalit so\'zlar bor');
  } else {
    band -= 0.5;
    details.push('❌ Mavzuga oid yetarli kalit so\'z yo\'q');
  }

  // Structure / paragraphs
  if (taskType === 'task1') {
    if (paras.length >= 3) {
      band += 0.5;
      details.push(`✅ Tuzilma yaxshi: ${paras.length} ta abzas (overview + body + conclusion)`);
    } else if (paras.length >= 2) {
      details.push(`⚡ ${paras.length} ta abzas — 3+ abzas afzal`);
    } else {
      band -= 0.5;
      details.push(`❌ Faqat 1 ta abzas — tuzilma yomon`);
    }
  } else {
    if (paras.length >= 4) {
      band += 0.5;
      details.push(`✅ Essay tuzilmasi to'g'ri: ${paras.length} ta abzas (intro + body + conclusion)`);
    } else if (paras.length >= 3) {
      details.push(`⚡ ${paras.length} ta abzas — yaxshi, lekin yaxshiroq bo'lishi mumkin`);
    } else {
      band -= 0.5;
      details.push(`❌ ${paras.length} ta abzas — essay uchun yetarli emas`);
    }
  }

  // Position (clear overview / thesis)
  const overviewMarkers = /\b(in (summary|conclusion|overview|this essay|my opinion)|overall|to sum up|it is (clear|evident|my belief))\b/i;
  if (overviewMarkers.test(text)) {
    band += 0.5;
    details.push('✅ Aniq boshlanish/oxirat mavjud');
  }

  // Extent (detail level)
  if (sents.length >= 8) {
    band += 0.5;
    details.push(`✅ Yetarli tafsilot: ${sents.length} ta jumlada`);
  } else if (sents.length >= 5) {
    details.push(`⚡ ${sents.length} ta jumlada — ko'proq tafsilot kerak`);
  } else {
    band -= 0.5;
    details.push(`❌ Faqat ${sents.length} ta jumlada — juda kam tafsilot`);
  }

  band = Math.max(1, Math.min(9, Math.round(band * 2) / 2));

  return {
    band,
    label: 'Task Achievement / Response',
    description: taskType === 'task1'
      ? 'Savolga to\'liq javob berdingizmi? Asosiy xususiyatlarni berasizmi?'
      : 'Savolga to\'liq javob berdingizmi? Fikringiz aniqmi?',
    details,
  };
}

function scoreCoherenceCohesion(text: string): CriterionResult {
  const w = words(text);
  const sents = sentences(text);
  const paras = paragraphs(text);
  const details: string[] = [];
  let band = 5.0;

  // Linking words count
  const textLower = text.toLowerCase();
  const linkingFound = Array.from(LINKING_WORDS).filter((lw) => textLower.includes(lw));
  if (linkingFound.length >= 6) {
    band += 1.0;
    details.push(`✅ Bog'lovchi so'zlar yetarli: ${linkingFound.length} xil`);
  } else if (linkingFound.length >= 3) {
    band += 0.5;
    details.push(`⚡ Bog'lovchi so'zlar: ${linkingFound.length} xil — ko'proq ishlatsangiz yaxshi`);
  } else {
    details.push(`❌ Bog'lovchi so'zlar kam: ${linkingFound.length} — matnni bog'lash kerak`);
  }

  // Cohesion devices (repeated conjunctions vs varied)
  let cohesionHits = 0;
  COHESION_PATTERNS.forEach((p) => {
    const m = text.match(p);
    if (m) cohesionHits += m.length;
  });
  if (cohesionHits >= 8) {
    band += 0.5;
    details.push(`✅ Matn bog'langan: ${cohesionHits} ta bog'lovchi qurilma`);
  } else if (cohesionHits >= 4) {
    details.push(`⚡ ${cohesionHits} ta bog'lovchi qurilma — yaxshi`);
  } else {
    band -= 0.5;
    details.push(`❌ Bog'lovchi qurilmalar juda kam (${cohesionHits})`);
  }

  // Paragraphing
  if (paras.length >= 4) {
    band += 0.5;
    details.push(`✅ To'g'ri abzas ajratilgan (${paras.length} ta abzas)`);
  } else if (paras.length >= 2) {
    details.push(`⚡ ${paras.length} ta abzas — yaxshi`);
  } else {
    band -= 0.5;
    details.push(`❌ Abzas ajratilmagan (faqat ${paras.length} ta)`);
  }

  // Referencing / substitution (check for pronoun variety)
  const pronouns = text.match(/\b(this|that|these|those|it|they|which|who)\b/gi) || [];
  if (pronouns.length >= 5) {
    band += 0.5;
    details.push(`✅ Referensiya qilish yaxshi (${pronouns.length} ta olmosh)`);
  } else {
    details.push(`⚡ Referensiya kam (${pronouns.length} ta olmosh)`);
  }

  // Over-use of one connector
  if (linkingFound.length > 0) {
    const maxUse = Math.max(...linkingFound.map((lw: string) => {
      const regex = new RegExp(`\\b${lw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      return (text.match(regex) || []).length;
    }));
    if (maxUse > 3) {
      band -= 0.5;
      details.push('⚠️ Ba\'zi bog\'lovchi so\'zlar ko\'p takrorlangan — xilma-xillik kerak');
    }
  }

  band = Math.max(1, Math.min(9, Math.round(band * 2) / 2));

  return {
    band,
    label: 'Coherence & Cohesion',
    description: 'Matn mantiqiy va bog\'langanmi?',
    details,
  };
}

function scoreLexicalResource(text: string): CriterionResult {
  const w = words(text);
  const wc = w.length;
  const details: string[] = [];
  let band = 5.0;

  // Type-token ratio (vocabulary diversity)
  const ttr = typeTokenRatio(text);
  if (ttr >= 0.7) {
    band += 1.0;
    details.push(`✅ Lug'at boyligi ajoyib: ${Math.round(ttr * 100)}% noyob so'zlar`);
  } else if (ttr >= 0.6) {
    band += 0.5;
    details.push(`✅ Lug'at boyligi yaxshi: ${Math.round(ttr * 100)}% noyob so'zlar`);
  } else if (ttr >= 0.5) {
    details.push(`⚡ Lug'at boyligi o'rtacha: ${Math.round(ttr * 100)}% — ko'proq xilma-xillik kerak`);
  } else {
    band -= 0.5;
    details.push(`❌ Lug'at boyligi past: ${Math.round(ttr * 100)}% — juda ko'p takrorlash`);
  }

  // Average word length (indicator of sophistication)
  const awl = avgWordLength(text);
  if (awl >= 5.5) {
    band += 0.5;
    details.push(`✅ Murakkab leksika: o'rtacha so'z uzunligi ${awl.toFixed(1)} harf`);
  } else if (awl >= 4.5) {
    details.push(`⚡ O'rtacha leksika: so'z uzunligi ${awl.toFixed(1)} harf`);
  } else {
    band -= 0.5;
    details.push(`❌ Oddiy leksika: so'z uzunligi ${awl.toFixed(1)} harf — murakkabroq so'zlar kerak`);
  }

  // Advanced vocabulary usage
  const advWords = w.filter((w) => ADVANCED_VOCAB.has(w.toLowerCase().replace(/[^a-z]/g, '')));
  if (advWords.length >= 5) {
    band += 1.0;
    details.push(`✅ Darajali lug'at: ${advWords.length} ta murakkab so'z (${advWords.slice(0, 5).join(', ')})`);
  } else if (advWords.length >= 2) {
    band += 0.5;
    details.push(`⚡ Ba'zi murakkab so'zlar: ${advWords.join(', ')}`);
  } else {
    details.push('❌ Darajali lug\'at yetarli emas — IELTS darajasidagi so\'zlar ishlating');
  }

  // Collocations (common IELTS collocations)
  const collocations = [
    /\b(make|do)\s+(a? ?(difference|decision|mistake|progress|contribution|effort))/gi,
    /\b(rise|increase|decrease|fall|remain)\s+(sharply|steadily|dramatically|slightly|significantly)/gi,
    /\b(serious|major|significant|grave)\s+(problem|issue|concern|challenge)/gi,
    /\b(solve|address|tackle|overcome)\s+(the )?(problem|issue|challenge)/gi,
    /(gain|acquire|obtain)\s+(knowledge|experience|skills|understanding)/gi,
  ];
  let collocationsFound = 0;
  collocations.forEach((p) => {
    const m = text.match(p);
    if (m) collocationsFound += m.length;
  });
  if (collocationsFound >= 3) {
    band += 0.5;
    details.push(`✅ To'g'ri kollokatsiyalar: ${collocationsFound} ta`);
  } else if (collocationsFound >= 1) {
    details.push(`⚡ ${collocationsFound} ta kollokatsiya — ko'proq ishlatsangiz yaxshi`);
  }

  band = Math.max(1, Math.min(9, Math.round(band * 2) / 2));

  return {
    band,
    label: 'Lexical Resource',
    description: 'Lug\'at boyligingiz qanday?',
    details,
  };
}

function scoreGrammar(text: string): CriterionResult {
  const w = words(text);
  const wc = w.length;
  const sents = sentences(text);
  const details: string[] = [];
  let band = 5.0;

  // Sentence length variety
  const sentLengths = sents.map((s) => words(s).length);
  const avgSentLen = sentLengths.length > 0 ? sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length : 0;
  const shortSents = sentLengths.filter((l) => l < 8).length;
  const longSents = sentLengths.filter((l) => l > 20).length;

  if (shortSents > 0 && longSents > 0) {
    band += 1.0;
    details.push(`✅ Jumlalar xilma-xil: qisqa (${shortSents}) va uzun (${longSents}) jumlalar bor`);
  } else if (sentLengths.length > 3) {
    band += 0.5;
    details.push(`⚡ Jumlalar o'rtacha: o'rtacha ${Math.round(avgSentLen)} so'z`);
  } else {
    details.push(`❌ Jumlalar yetarli xilma-xil emas`);
  }

  // Complex structures (subordinate clauses)
  const complexPatterns = [
    /\b(although|though|even though|while|whereas|if|unless|until|before|after|since|because|as)\b[^.!?]*\b,?\s*\b/i,
    /\b(which|who|whom|that|where|when)\s+\w+/gi,
    /\b(not only|but also|both|either|neither)\b/gi,
    /\b(it is|there are|there is|it was)\b[^.!?]*(that|which|who)\b/gi,
  ];
  let complexCount = 0;
  complexPatterns.forEach((p) => {
    const m = text.match(p);
    if (m) complexCount += m.length;
  });
  if (complexCount >= 5) {
    band += 0.5;
    details.push(`✅ Murakkab grammatik qurilmalar: ${complexCount} ta`);
  } else if (complexCount >= 2) {
    details.push(`⚡ ${complexCount} ta murakkab qurilma — ko'proq kerak`);
  } else {
    band -= 0.5;
    details.push(`❌ Murakkab grammatik qurilmalar juda kam (${complexCount})`);
  }

  // Error detection
  let errorCount = 0;

  // Subject-verb agreement
  GRAMMAR_PATTERNS.subjectVerbAgree.forEach((p) => {
    const m = text.match(p);
    if (m) errorCount += m.length;
  });

  // Run-on sentences
  GRAMMAR_PATTERNS.runOnSentences.forEach((p) => {
    const m = text.match(p);
    if (m) errorCount += m.length;
  });

  // Common errors
  GRAMMAR_PATTERNS.commonErrors.forEach((p) => {
    const m = text.match(p);
    if (m) errorCount += m.length;
  });

  // Repetition
  const reps = text.match(GRAMMAR_PATTERNS.repetition);
  if (reps) errorCount += reps.length;

  const errorRate = wc > 0 ? errorCount / wc : 0;
  if (errorCount === 0) {
    band += 1.0;
    details.push('✅ Grammatik xatolar topilmadi — ajoyib!');
  } else if (errorRate < 0.02) {
    band += 0.5;
    details.push(`✅ Kam grammatik xatolar: ${errorCount} ta (jami ${wc} so'z)`);
  } else if (errorRate < 0.05) {
    details.push(`⚡ Ba'zi xatolar: ${errorCount} ta — tuzatilsa yaxshi bo'ladi`);
  } else {
    band -= 0.5;
    details.push(`❌ Ko'p grammatik xatolar: ${errorCount} ta — grammatikani tekshiring`);
  }

  // Punctuation check
  const commas = (text.match(/,/g) || []).length;
  const periods = (text.match(/[.!?]/g) || []).length;
  if (periods > 0 && commas / periods >= 0.5 && commas / periods <= 2) {
    band += 0.5;
    details.push('✅ Punctuatsiya yaxshi');
  } else if (periods > 0) {
    details.push('⚡ Punctuatsiya o\'rtacha — vergul va nuqtalarni tekshiring');
  }

  band = Math.max(1, Math.min(9, Math.round(band * 2) / 2));

  return {
    band,
    label: 'Grammatical Range & Accuracy',
    description: 'Grammatikangiz qanchalik to\'g\'ri va xilma-xil?',
    details,
  };
}

// ── main analyser ───────────────────────────────────────────────
export function analyseWriting(
  task1Text: string,
  task2Text: string,
): WritingAnalysis {
  const t1 = scoreTaskAchievement(task1Text, 'task1');
  const t2 = scoreTaskAchievement(task2Text, 'task2');
  const cc1 = scoreCoherenceCohesion(task1Text);
  const cc2 = scoreCoherenceCohesion(task2Text);
  const lr1 = scoreLexicalResource(task1Text);
  const lr2 = scoreLexicalResource(task2Text);
  const gr1 = scoreGrammar(task1Text);
  const gr2 = scoreGrammar(task2Text);

  // Task 2 weights double
  const taskAchievement: CriterionResult = {
    band: Math.round(((t1.band * 1 + t2.band * 2) / 3) * 2) / 2,
    label: 'Task Achievement / Response',
    description: 'Savolga to\'liq javob berdingizmi?',
    details: [
      `Task 1: ${t1.band} — ${t1.description}`,
      ...t1.details.map((d) => `[T1] ${d}`),
      `Task 2: ${t2.band} — ${t2.description}`,
      ...t2.details.map((d) => `[T2] ${d}`),
    ],
  };

  const coherenceCohesion: CriterionResult = {
    band: Math.round(((cc1.band * 1 + cc2.band * 2) / 3) * 2) / 2,
    label: 'Coherence & Cohesion',
    description: 'Matn mantiqiy va bog\'langanmi?',
    details: [
      `Task 1: ${cc1.band}`,
      ...cc1.details.map((d) => `[T1] ${d}`),
      `Task 2: ${cc2.band}`,
      ...cc2.details.map((d) => `[T2] ${d}`),
    ],
  };

  const lexicalResource: CriterionResult = {
    band: Math.round(((lr1.band * 1 + lr2.band * 2) / 3) * 2) / 2,
    label: 'Lexical Resource',
    description: 'Lug\'at boyligingiz qanday?',
    details: [
      `Task 1: ${lr1.band}`,
      ...lr1.details.map((d) => `[T1] ${d}`),
      `Task 2: ${lr2.band}`,
      ...lr2.details.map((d) => `[T2] ${d}`),
    ],
  };

  const grammar: CriterionResult = {
    band: Math.round(((gr1.band * 1 + gr2.band * 2) / 3) * 2) / 2,
    label: 'Grammatical Range & Accuracy',
    description: 'Grammatikangiz qanchalik to\'g\'ri va xilma-xil?',
    details: [
      `Task 1: ${gr1.band}`,
      ...gr1.details.map((d) => `[T1] ${d}`),
      `Task 2: ${gr2.band}`,
      ...gr2.details.map((d) => `[T2] ${d}`),
    ],
  };

  const overallBand = Math.round(
    ((taskAchievement.band + coherenceCohesion.band + lexicalResource.band + grammar.band) / 4) * 2
  ) / 2;

  const wordCount = words(task1Text).length + words(task2Text).length;

  let estimatedBand = '';
  if (overallBand >= 8.5) estimatedBand = 'Expert User';
  else if (overallBand >= 7.5) estimatedBand = 'Very Good User';
  else if (overallBand >= 6.5) estimatedBand = 'Good User';
  else if (overallBand >= 5.5) estimatedBand = 'Modest User';
  else if (overallBand >= 4.5) estimatedBand = 'Limited User';
  else if (overallBand >= 3.5) estimatedBand = 'Extremely Limited';
  else estimatedBand = 'Intermittent User';

  return {
    taskAchievement,
    coherenceCohesion,
    lexicalResource,
    grammar,
    overallBand,
    wordCount,
    estimatedBand,
  };
}

import type {
  ImportedTest,
  ImportedQuestion,
  ImportedPassage,
  ImportedSection,
  ImportedTask,
  ImportedSpeakingPart,
  ImportSkill,
  ImportTestType,
  ConfidenceLevel,
} from './import-types';

// ===== Content Hash =====
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ===== Sanitize HTML =====
function sanitizeHtml(html: string): string {
  // Remove dangerous tags
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/<link\b[^>]*\/?>/gi, '')
    .replace(/<meta\b[^>]*\/?>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
  return sanitized;
}

// ===== Extract Text =====
function getText(el: Element | null): string {
  if (!el) return '';
  return (el.textContent || '').trim();
}

function getHtml(el: Element | null): string {
  if (!el) return '';
  return (el.innerHTML || '').trim();
}

// ===== Question Type Detection =====
function detectQuestionType(text: string, options: string[]): string {
  const lower = text.toLowerCase();

  if (options.length > 0) {
    if (options.some(o => /^(a|b|c|d|e|f)/i.test(o.trim()))) {
      return 'multiple_choice';
    }
  }

  if (/true\s*\/?\s*false\s*\/?\s*not\s*given/i.test(text) || /TRUE.*FALSE.*NOT GIVEN/i.test(text)) {
    return 'true_false_not_given';
  }
  if (/yes\s*\/?\s*no\s*\/?\s*not\s*given/i.test(text)) {
    return 'yes_no_not_given';
  }
  if (/matching\s*headings?/i.test(text)) {
    return 'matching_headings';
  }
  if (/matching\s*information/i.test(text)) {
    return 'matching_information';
  }
  if (/matching\s*features?/i.test(text)) {
    return 'matching_features';
  }
  if (/matching\s*endings?/i.test(text)) {
    return 'matching_endings';
  }
  if (/sentence\s*completion/i.test(text)) {
    return 'sentence_completion';
  }
  if (/summary\s*completion/i.test(text)) {
    return 'summary_completion';
  }
  if (/note\s*completion/i.test(text)) {
    return 'note_completion';
  }
  if (/table\s*completion/i.test(text)) {
    return 'table_completion';
  }
  if (/flow[\s-]*chart/i.test(text)) {
    return 'flowchart_completion';
  }
  if (/diagram/i.test(text)) {
    return 'diagram_label_completion';
  }
  if (/map/i.test(text)) {
    return 'diagram_label_completion';
  }
  if (/short\s*answer/i.test(text)) {
    return 'short_answer';
  }

  // Detect from input patterns
  if (options.length >= 4 && options.length <= 6) {
    return 'multiple_choice';
  }

  return 'multiple_choice';
}

// ===== Skill Detection =====
function detectSkill(doc: Document, html: string): ImportSkill {
  const text = doc.body?.textContent || '';
  const lower = text.toLowerCase();
  const htmlLower = html.toLowerCase();

  let readingScore = 0;
  let listeningScore = 0;
  let writingScore = 0;
  let speakingScore = 0;

  // Reading indicators
  if (/passage\s*\d/i.test(html)) readingScore += 3;
  if (/reading\s*passage/i.test(htmlLower)) readingScore += 3;
  if (/questions?\s*1[\s–-]+40/i.test(html)) readingScore += 2;
  if (/true\s*\/?\s*false\s*\/?\s*not\s*given/i.test(htmlLower)) readingScore += 2;
  if (/yes\s*\/?\s*no\s*\/?\s*not\s*given/i.test(htmlLower)) readingScore += 2;
  if (/matching\s*headings/i.test(htmlLower)) readingScore += 2;
  if (/<article|<section|passage/i.test(html)) readingScore += 1;

  // Listening indicators
  if (/<audio/i.test(html)) listeningScore += 3;
  if (/listening\s*(section|test|practice)/i.test(htmlLower)) listeningScore += 3;
  if (/recording/i.test(lower)) listeningScore += 2;
  if (/section\s*[1-4]/i.test(html)) listeningScore += 1;
  if (/audio.*url|src.*\.mp3|src.*\.wav/i.test(htmlLower)) listeningScore += 2;
  if (/no\s*recording\s*loaded/i.test(htmlLower)) listeningScore += 1;

  // Writing indicators
  if (/writing\s*task\s*[12]/i.test(htmlLower)) writingScore += 3;
  if (/task\s*1|task\s*2/i.test(htmlLower)) writingScore += 1;
  if (/word\s*count/i.test(htmlLower)) writingScore += 2;
  if (/essay/i.test(lower)) writingScore += 1;

  // Speaking indicators
  if (/speaking\s*(part|section)/i.test(htmlLower)) speakingScore += 3;
  if (/cue\s*card/i.test(htmlLower)) speakingScore += 2;
  if (/part\s*[123]/i.test(htmlLower)) speakingScore += 1;
  if (/interview/i.test(lower)) speakingScore += 1;

  const max = Math.max(readingScore, listeningScore, writingScore, speakingScore);
  if (max === 0) return 'unknown';
  if (max === readingScore) return 'reading';
  if (max === listeningScore) return 'listening';
  if (max === writingScore) return 'writing';
  return 'speaking';
}

// ===== Test Type Detection =====
function detectTestType(html: string): ImportTestType {
  const lower = html.toLowerCase();
  if (/academic/i.test(lower)) return 'academic';
  if (/general\s*training/i.test(lower)) return 'general';
  return 'unknown';
}

// ===== Title Detection =====
function detectTitle(doc: Document, filename: string): string {
  // Try h1, h2, title tag
  const h1 = doc.querySelector('h1');
  if (h1) return getText(h1);

  const h2 = doc.querySelector('h2');
  if (h2) return getText(h2);

  const title = doc.querySelector('title');
  if (title) {
    const t = getText(title);
    if (t && !/untitled|document/i.test(t)) return t;
  }

  // Fallback to filename
  return filename.replace(/\.html?$/i, '').replace(/[-_]/g, ' ');
}

// ===== Extract Questions =====
function extractQuestions(doc: Document, html: string): ImportedQuestion[] {
  const questions: ImportedQuestion[] = [];
  const seen = new Set<number>();

  // Method 1: Look for numbered questions in text
  const allText = doc.body?.textContent || '';

  // Pattern: "1. Question text" or "Question 1" etc
  const qPatterns = [
    /(?:^|\n)\s*(\d{1,3})\s*[.)]\s*(.+?)(?=\n\s*\d{1,3}\s*[.)]|\n\n|$)/gs,
    /question\s*(\d{1,3})\s*[:\.]?\s*(.+?)(?=question\s*\d|options|answer|$)/gis,
  ];

  // Method 2: Look for input elements with data-question
  const inputs = doc.querySelectorAll('input[data-question], input[name*="q"], .answer-input');
  inputs.forEach(input => {
    const qNum = parseInt(
      input.getAttribute('data-question') ||
      input.getAttribute('name')?.replace(/[^0-9]/g, '') ||
      '0'
    );
    if (qNum > 0 && !seen.has(qNum)) {
      seen.add(qNum);
      // Find the parent context
      let context = '';
      let parent = input.parentElement;
      for (let i = 0; i < 5 && parent; i++) {
        const text = getText(parent);
        if (text.length > 20) {
          context = text;
          break;
        }
        parent = parent.parentElement;
      }

      questions.push({
        number: qNum,
        type: 'multiple_choice',
        question: context || `Question ${qNum}`,
        options: [],
        correctAnswer: null,
        explanation: null,
        needsReview: true,
      });
    }
  });

  // Method 3: Look for radio/checkbox groups
  const radioGroups = new Map<string, string[]>();
  doc.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    const name = input.getAttribute('name') || 'unknown';
    if (!radioGroups.has(name)) radioGroups.set(name, []);
    const label = input.closest('label');
    if (label) {
      radioGroups.get(name)!.push(getText(label));
    }
  });

  // Method 4: Look for choice-option elements
  const choiceOptions = doc.querySelectorAll('.choice-option, [class*="option"]');
  if (choiceOptions.length > 0) {
    let currentQ = questions.length > 0 ? questions[questions.length - 1] : null;
    choiceOptions.forEach(opt => {
      const text = getText(opt);
      if (text) {
        if (!currentQ) {
          const qNum = questions.length + 1;
          currentQ = {
            number: qNum,
            type: 'multiple_choice',
            question: `Question ${qNum}`,
            options: [],
            correctAnswer: null,
            explanation: null,
            needsReview: true,
          };
          questions.push(currentQ);
        }
        currentQ.options.push(text);
      }
    });
  }

  // Method 5: Parse from HTML text patterns
  if (questions.length === 0) {
    for (const pattern of qPatterns) {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const num = parseInt(match[1]);
        if (num > 0 && num <= 100 && !seen.has(num)) {
          seen.add(num);
          questions.push({
            number: num,
            type: 'multiple_choice',
            question: match[2].trim(),
            options: [],
            correctAnswer: null,
            explanation: null,
            needsReview: true,
          });
        }
      }
    }
  }

  // Method 6: Look for answer keys
  const answerPatterns = [
    /(?:answer|key|answers)\s*(?:[:=]|key)\s*\n?((?:\d+\s*[.:]\s*\S+\s*\n?)+)/gi,
    /(\d+)\s*[.:]\s*([A-Da-d]|\w{2,20})\s/g,
  ];

  for (const pattern of answerPatterns) {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      const num = parseInt(match[1]);
      const answer = match[2];
      if (num > 0) {
        const q = questions.find(q => q.number === num);
        if (q) {
          q.correctAnswer = answer;
          q.needsReview = false;
        }
      }
    }
  }

  // Detect question types from instructions
  const instructionEls = doc.querySelectorAll('.question-instruction, .instruction, p[style*="italic"]');
  instructionEls.forEach(el => {
    const text = getText(el);
    if (text) {
      const qType = detectQuestionType(text, []);
      questions.forEach(q => {
        if (q.type === 'multiple_choice' && qType !== 'multiple_choice') {
          q.type = qType;
        }
      });
    }
  });

  // Sort by number
  questions.sort((a, b) => a.number - b.number);

  return questions;
}

// ===== Extract Passages (Reading) =====
function extractPassages(doc: Document, html: string): ImportedPassage[] {
  const passages: ImportedPassage[] = [];

  // Look for passage containers
  const passageSelectors = [
    '.passage', '.reading-passage', '[class*="passage"]',
    '.text-block', 'article', '.content-area',
    '#passage', '#text',
  ];

  for (const selector of passageSelectors) {
    const els = doc.querySelectorAll(selector);
    if (els.length >= 2) { // At least 2 passages for reading
      els.forEach((el, i) => {
        const title = el.querySelector('h2, h3, .passage-title')?.textContent || `Passage ${i + 1}`;
        const content = getText(el);
        const wordCount = content.split(/\s+/).length;

        if (wordCount > 100) { // Only real passages
          passages.push({
            id: `passage-${i + 1}`,
            title: title.trim(),
            content: content,
            wordCount,
            questions: [],
          });
        }
      });
      if (passages.length >= 2) break;
    }
  }

  // Fallback: split by large text blocks
  if (passages.length === 0) {
    const allText = doc.body?.textContent || '';
    const blocks = allText.split(/\n{3,}/).filter(b => b.trim().split(/\s+/).length > 200);
    blocks.forEach((block, i) => {
      passages.push({
        id: `passage-${i + 1}`,
        title: `Passage ${i + 1}`,
        content: block.trim(),
        wordCount: block.trim().split(/\s+/).length,
        questions: [],
      });
    });
  }

  return passages;
}

// ===== Extract Sections (Listening) =====
function extractSections(doc: Document, html: string): ImportedSection[] {
  const sections: ImportedSection[] = [];

  // Look for section containers
  const sectionSelectors = [
    '.part-content', '[id^="part"]', '.section',
    '[class*="section"]', '.questions-section',
  ];

  const sectionEls = doc.querySelectorAll(sectionSelectors.join(', '));
  sectionEls.forEach((el, i) => {
    const title = el.querySelector('h2, h3, .part-title, .section-title')?.textContent || `Section ${i + 1}`;
    const questions = extractQuestionsFromElement(el);

    if (questions.length > 0) {
      sections.push({
        id: `section-${i + 1}`,
        title: title.trim(),
        questions,
      });
    }
  });

  // Look for audio references
  const audioEls = doc.querySelectorAll('audio, [data-audio], [data-src]');
  audioEls.forEach((el, i) => {
    const src = el.getAttribute('src') || el.getAttribute('data-audio') || el.getAttribute('data-src') || '';
    if (src && sections[i]) {
      sections[i].audioUrl = src;
    }
  });

  // Check for audio missing
  if (sections.length > 0 && !sections.some(s => s.audioUrl)) {
    sections.forEach(s => { s.audioMissing = true; });
  }

  // Fallback: create 4 sections from question numbers
  if (sections.length === 0) {
    const questions = extractQuestions(doc, html);
    if (questions.length > 0) {
      const perSection = Math.ceil(questions.length / 4);
      for (let i = 0; i < 4; i++) {
        const start = i * perSection;
        const end = Math.min(start + perSection, questions.length);
        if (start < questions.length) {
          sections.push({
            id: `section-${i + 1}`,
            title: `Section ${i + 1}`,
            questions: questions.slice(start, end),
            audioMissing: true,
          });
        }
      }
    }
  }

  return sections;
}

function extractQuestionsFromElement(el: Element): ImportedQuestion[] {
  const questions: ImportedQuestion[] = [];
  const seen = new Set<number>();

  // Look for numbered items
  const items = el.querySelectorAll('li, .question, [class*="question"]');
  items.forEach(item => {
    const text = getText(item);
    const match = text.match(/^(\d{1,3})\s*[.)]\s*(.+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > 0 && !seen.has(num)) {
        seen.add(num);
        questions.push({
          number: num,
          type: 'multiple_choice',
          question: match[2].trim(),
          options: [],
          correctAnswer: null,
          explanation: null,
          needsReview: true,
        });
      }
    }
  });

  // Look for inputs
  el.querySelectorAll('input[data-question], .answer-input').forEach(input => {
    const qNum = parseInt(
      input.getAttribute('data-question') ||
      input.getAttribute('name')?.replace(/[^0-9]/g, '') ||
      '0'
    );
    if (qNum > 0 && !seen.has(qNum)) {
      seen.add(qNum);
      let parent = input.parentElement;
      let context = '';
      for (let i = 0; i < 5 && parent; i++) {
        const t = getText(parent);
        if (t.length > 20) { context = t; break; }
        parent = parent.parentElement;
      }
      questions.push({
        number: qNum,
        type: 'multiple_choice',
        question: context || `Question ${qNum}`,
        options: [],
        correctAnswer: null,
        explanation: null,
        needsReview: true,
      });
    }
  });

  return questions.sort((a, b) => a.number - b.number);
}

// ===== Extract Writing Tasks =====
function extractTasks(doc: Document, html: string): ImportedTask[] {
  const tasks: ImportedTask[] = [];

  const taskPatterns = [
    /writing\s*task\s*1/gi,
    /writing\s*task\s*2/gi,
    /task\s*1/gi,
    /task\s*2/gi,
  ];

  const allText = doc.body?.textContent || '';

  taskPatterns.forEach((pattern, i) => {
    if (pattern.test(allText)) {
      const taskNum = i < 2 ? i + 1 : (i % 2) + 1;
      // Find the task content
      const taskSection = allText.substring(
        allText.indexOf(pattern.source.replace(/[.*?^${}()|[\]\\]/g, '\\$&')),
        allText.indexOf(`task ${taskNum + 1}`) || allText.length
      );

      tasks.push({
        task: taskNum,
        prompt: taskSection.substring(0, 500).trim(),
        instructions: 'Write at least 250 words.',
        imageUrl: null,
      });
    }
  });

  // If no tasks found but skill is writing, create generic ones
  if (tasks.length === 0) {
    const skill = detectSkill(doc, html);
    if (skill === 'writing') {
      tasks.push(
        { task: 1, prompt: 'Task 1 prompt', instructions: 'Write at least 150 words.', imageUrl: null },
        { task: 2, prompt: 'Task 2 prompt', instructions: 'Write at least 250 words.', imageUrl: null }
      );
    }
  }

  return tasks;
}

// ===== Extract Speaking Parts =====
function extractSpeakingParts(doc: Document, html: string): ImportedSpeakingPart[] {
  const parts: ImportedSpeakingPart[] = [];
  const allText = doc.body?.textContent || '';

  for (let i = 1; i <= 3; i++) {
    const partRegex = new RegExp(`part\\s*${i}[\\s:]*([\\s\\S]*?)(?=part\\s*${i + 1}|$)`, 'i');
    const match = allText.match(partRegex);

    if (match) {
      const content = match[1].trim();
      const questions = content.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 10 && /\?/.test(l));

      const part: ImportedSpeakingPart = {
        part: i,
        title: `Part ${i}`,
        questions: questions.length > 0 ? questions : [content.substring(0, 200)],
      };

      if (i === 2) {
        // Look for cue card
        const cueCardMatch = content.match(/cue\s*card[:\s]*([\s\S]*?)(?=\d|$)/i);
        if (cueCardMatch) {
          part.cueCard = cueCardMatch[1].trim();
          part.preparationTime = 60;
          part.speakingTime = 120;
        }
      }

      parts.push(part);
    }
  }

  return parts;
}

// ===== Estimate Duration =====
function estimateDuration(skill: ImportSkill, questionCount: number): number {
  switch (skill) {
    case 'listening': return 40;
    case 'reading': return 60;
    case 'writing': return 60;
    case 'speaking': return 15;
    default: return Math.max(30, Math.ceil(questionCount * 1.5));
  }
}

// ===== Confidence Calculation =====
function calculateConfidence(test: Omit<ImportedTest, 'confidence' | 'confidenceLevel'>): number {
  let score = 50; // Base score

  // Title detection
  if (test.title && !/untitled|document|test/i.test(test.title)) score += 10;

  // Skill detection
  if (test.skill !== 'unknown') score += 15;

  // Questions found
  if (test.totalQuestions > 0) score += 10;
  if (test.totalQuestions >= 10) score += 5;
  if (test.totalQuestions >= 30) score += 5;

  // Answers found
  if (test.questionsWithAnswers > 0) {
    const ratio = test.questionsWithAnswers / Math.max(test.totalQuestions, 1);
    score += Math.floor(ratio * 10);
  }

  // Sections/Passages
  if (test.passages.length > 0 || test.sections.length > 0) score += 5;

  // Warnings reduce confidence
  score -= test.warnings.length * 3;
  score -= test.errors.length * 5;
  score -= test.parsingErrors.length * 2;

  return Math.max(0, Math.min(100, score));
}

// ===== Main Parse Function =====
export function parseHtmlTest(html: string, filename: string): ImportedTest {
  // Sanitize
  const sanitized = sanitizeHtml(html);

  // Parse
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');

  // Detect properties
  const title = detectTitle(doc, filename);
  const skill = detectSkill(doc, html);
  const testType = detectTestType(html);

  // Extract content based on skill
  const passages = skill === 'reading' ? extractPassages(doc, html) : [];
  const sections = skill === 'listening' ? extractSections(doc, html) : [];
  const tasks = skill === 'writing' ? extractTasks(doc, html) : [];
  const speakingParts = skill === 'speaking' ? extractSpeakingParts(doc, html) : [];

  // Extract questions
  let questions: ImportedQuestion[] = [];
  if (passages.length > 0) {
    passages.forEach(p => {
      p.questions = extractQuestions(doc, html);
    });
    questions = passages.flatMap(p => p.questions);
  } else if (sections.length > 0) {
    sections.forEach(s => {
      if (s.questions.length === 0) {
        s.questions = extractQuestions(doc, html);
      }
    });
    questions = sections.flatMap(s => s.questions);
  } else {
    questions = extractQuestions(doc, html);
  }

  // Stats
  const totalQuestions = questions.length;
  const questionsWithAnswers = questions.filter(q => q.correctAnswer !== null).length;
  const questionsNeedingReview = questions.filter(q => q.needsReview).length;
  const audioMissing = sections.some(s => s.audioMissing) && skill === 'listening';

  // Warnings
  const warnings: string[] = [];
  const errors: string[] = [];
  const parsingErrors: string[] = [];

  if (skill === 'unknown') warnings.push('Could not determine test skill type');
  if (totalQuestions === 0) warnings.push('No questions found in the HTML');
  if (questionsWithAnswers === 0 && totalQuestions > 0) warnings.push('No answer keys found');
  if (audioMissing) warnings.push('Audio files not found in the HTML');
  if (passages.length === 0 && skill === 'reading') warnings.push('No passages detected');
  if (sections.length === 0 && skill === 'listening') warnings.push('No sections detected');
  if (tasks.length === 0 && skill === 'writing') warnings.push('No writing tasks detected');
  if (speakingParts.length === 0 && skill === 'speaking') warnings.push('No speaking parts detected');

  // Build test object
  const estimatedMinutes = estimateDuration(skill, totalQuestions);
  const difficulty: 'easy' | 'medium' | 'hard' = totalQuestions > 30 ? 'hard' : totalQuestions > 15 ? 'medium' : 'easy';

  const baseTest = {
    id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    filename,
    title,
    skill,
    testType,
    difficulty,
    estimatedMinutes,
    passages,
    sections,
    tasks,
    speakingParts,
    totalQuestions,
    questionsWithAnswers,
    questionsNeedingReview,
    audioMissing,
    warnings,
    errors,
    parsingErrors,
    originalHtml: html,
    contentHash: simpleHash(html),
  };

  const confidence = calculateConfidence(baseTest);
  const confidenceLevel: ConfidenceLevel =
    confidence >= 90 ? 'ready' :
    confidence >= 70 ? 'review' : 'needs_review';

  return {
    ...baseTest,
    confidence,
    confidenceLevel,
  };
}

// ===== Duplicate Detection =====
export function checkDuplicate(
  newTest: ImportedTest,
  existingTests: { filename: string; title: string; contentHash: string }[]
): { isDuplicate: boolean; matchedBy: string; confidence: number } {
  for (const existing of existingTests) {
    // Exact hash match
    if (existing.contentHash === newTest.contentHash) {
      return { isDuplicate: true, matchedBy: 'content_hash', confidence: 100 };
    }

    // Filename match
    if (existing.filename === newTest.filename) {
      return { isDuplicate: true, matchedBy: 'filename', confidence: 95 };
    }

    // Title similarity
    if (existing.title && newTest.title) {
      const similarity = calculateSimilarity(existing.title, newTest.title);
      if (similarity > 0.85) {
        return { isDuplicate: true, matchedBy: 'title_similarity', confidence: Math.floor(similarity * 100) };
      }
    }
  }

  return { isDuplicate: false, matchedBy: '', confidence: 0 };
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = b.toLowerCase().split(/\s+/);
  const intersection = wordsA.filter(w => wordsB.includes(w));
  return intersection.length / Math.max(wordsA.length, wordsB.length);
}

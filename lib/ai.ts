// Free AI API integration — Groq (best free tier: no credit card, 30 RPM, 14.4K RPD)
// Alternatives: Google AI Studio, OpenRouter, Hugging Face

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'openai/gpt-oss-120b';

const IELTS_SYSTEM_PROMPT = `You are an expert IELTS preparation coach with 15+ years of experience helping students achieve band 7-9. You have deep knowledge of:

1. **All four IELTS skills** (Listening, Reading, Writing, Speaking) — scoring criteria, common mistakes, and improvement strategies.
2. **IELTS Academic & General Training** formats, question types, and time management.
3. **Band descriptors** — exactly what examiners look for at each band level (5.0-9.0).
4. **Proven study methods** — spaced repetition, active recall, timed practice, etc.

Your coaching style:
- Be specific and actionable — give examples, templates, and phrases students can use immediately.
- Reference the official IELTS band descriptors when giving feedback.
- Be encouraging but honest about areas needing improvement.
- When a student shares their band scores, analyze weaknesses and create a targeted study plan.
- For Writing: focus on Task Achievement, Coherence & Cohesion, Lexical Resource, Grammar.
- For Speaking: focus on Fluency & Coherence, Pronunciation, Lexical Resource, Grammar.
- For Listening & Reading: focus on question-specific strategies and time management.

Always respond in a clear, structured format using markdown when helpful. Keep responses focused and practical — no filler.`;

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function chatWithAI(
  messages: AIMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<AIResponse> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Get a free key at console.groq.com/keys');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'system', content: IELTS_SYSTEM_PROMPT }, ...messages],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  };
}

export async function getIELTSCoachResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  userData?: {
    currentBand?: number;
    skillBands?: { skill: string; band: number; target: number }[];
    totalTests?: number;
    weakestSkill?: string;
  }
): Promise<string> {
  const contextParts: string[] = [];

  if (userData) {
    contextParts.push(`Student profile:
- Overall band score: ${userData.currentBand?.toFixed(1) || 'No tests yet'}
- Tests completed: ${userData.totalTests || 0}
- Weakest skill: ${userData.weakestSkill || 'Unknown'}
- Skill breakdown: ${userData.skillBands?.map(s => `${s.skill}: ${s.band > 0 ? s.band.toFixed(1) : 'Not tested'} (target: ${s.target})`).join(', ') || 'No data'}`);
  }

  const messages: AIMessage[] = [];

  if (contextParts.length > 0) {
    messages.push({ role: 'user', content: `[System context about the student]\n${contextParts.join('\n')}` });
    messages.push({ role: 'assistant', content: 'Thank you for sharing your profile. I have a clear picture of your current level. How can I help you today?' });
  }

  // Add conversation history (last 10 messages)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await chatWithAI(messages);
  return response.content;
}

export async function getSpeakingFeedback(
  question: string,
  answer: string,
  part: string,
  userData?: { currentBand?: number }
): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'user',
      content: `[Speaking practice session]
Student's current band: ${userData?.currentBand?.toFixed(1) || 'Unknown'}
Speaking ${part} question: "${question}"
Student's answer: "${answer}"

Please evaluate this speaking response according to IELTS Speaking band descriptors. Provide:
1. **Estimated Band Score** (with reasoning)
2. **Fluency & Coherence** feedback (0-9)
3. **Lexical Resource** feedback (0-9)
4. **Grammatical Range & Accuracy** feedback (0-9)
5. **Pronunciation** notes (what to improve)
6. **Model Answer** — an example of how a band 8+ response would sound
7. **3 Actionable Tips** to improve

Be specific and constructive. Use the official IELTS criteria.`
    }
  ];

  const response = await chatWithAI(messages, { temperature: 0.5, maxTokens: 1500 });
  return response.content;
}

export function isAIConfigured(): boolean {
  return !!GROQ_API_KEY;
}

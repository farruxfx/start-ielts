// ═══════════════════════════════════════════════════════════════════════
//  CAPTCHA — self-hosted image captcha for signup / signin (bot guard)
//
//  • GET /api/captcha          → { svg, token }
//  • POST /api/captcha/verify  → { ok }   (token single-use, 10 min TTL)
//
//  Server truth: the answer text is HMAC-signed into the token. It is
//  never sent to the client (the SVG is pre-bent text only). No external
//  service (reCAPTCHA/hCaptcha) needed; works with or without Supabase.
// ═══════════════════════════════════════════════════════════════════════

import { createHmac, randomBytes, timingSafeEqual, createHash } from 'crypto';

// Visible alphabet — no visually ambiguous characters.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CAPTCHA_LENGTH = 5;
const CAPTCHA_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** HMAC secret: dedicated env first, then the session JWK, then a dev-only fallback. */
function getSecret(): string {
  return (
    process.env.CAPTCHA_SECRET ||
    process.env.SESSION_PRIVATE_JWK ||
    'startielts-dev-captcha-secret-NOT-FOR-PRODUCTION'
  );
}

// ─── Token helpers ────────────────────────────────────────────────────

function b64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', getSecret()).update(payload).digest());
}

function makeToken(text: string): string {
  const jti = randomBytes(8).toString('hex');
  const payload = b64url(JSON.stringify({ c: text, j: jti, e: Date.now() + CAPTCHA_TTL_MS }));
  return payload + '.' + sign(payload);
}

/** Normalise user input before comparison. */
export function normalizeCaptchaAnswer(input: string): string {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function hashCaptchaAnswer(input: string): string {
  return createHash('sha256').update(normalizeCaptchaAnswer(input)).digest('hex');
}

// In-memory single-use ledger (per instance; the 10-min TTL caps replay risk).
const usedJti = new Set<string>();
function markUsed(jti: string): void {
  usedJti.add(jti);
  if (usedJti.size > 10_000) {
    // Keep the set bounded; old entries expire by TTL anyway.
    const firstValues = Array.from(usedJti).slice(0, 5_000);
    for (const v of firstValues) usedJti.delete(v);
  }
}

export interface CaptchaVerification {
  ok: boolean;
  error?: string;
}

export function verifyCaptchaToken(token: string, answer: string): CaptchaVerification {
  if (!token || !answer) return { ok: false, error: "Captcha javobi kiritilmadi" };

  const dot = token.indexOf('.');
  if (dot <= 0) return { ok: false, error: 'Captcha token yaroqsiz' };
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (sign(payload) !== sig) return { ok: false, error: 'Captcha token yaroqsiz' };

  let data: { c?: string; j?: string; e?: number };
  try {
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Captcha token yaroqsiz' };
  }

  if (!data.c || !data.j) return { ok: false, error: 'Captcha token yaroqsiz' };
  if (typeof data.e === 'number' && Date.now() > data.e) {
    return { ok: false, error: 'Captcha vaqti o‘tdi — yangisini tanlang' };
  }
  if (usedJti.has(data.j)) {
    return { ok: false, error: 'Captcha allaqachon ishlatilgan — yangisini tanlang' };
  }

  const expected = Buffer.from(normalizeCaptchaAnswer(data.c));
  const given = Buffer.from(normalizeCaptchaAnswer(answer));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, error: "Captcha javobi noto'g'ri — yangisini tanlang" };
  }

  markUsed(data.j);
  return { ok: true };
}

// ─── SVG rendering ────────────────────────────────────────────────────

interface RenderedCaptcha {
  svg: string;
  token: string;
}

export function generateCaptcha(): RenderedCaptcha {
  let text = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    text += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }

  const width = 180;
  const height = 60;
  const step = (width - 30) / CAPTCHA_LENGTH;

  let chars = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    const x = 20 + i * step;
    const y = 42 + Math.floor(Math.random() * 7) - 3;
    const rot = Math.floor(Math.random() * 36) - 18;
    const fontSize = 26 + Math.floor(Math.random() * 8);
    const shade = ['#334155', '#1e293b', '#0f172a', '#475569'][i % 4];
    chars +=
      `<text x="${x}" y="${y}" font-family="Georgia,serif" font-size="${fontSize}" ` +
      `fill="${shade}" transform="rotate(${rot} ${x} ${y})">${text[i]}</text>`;
  }

  let lines = '';
  for (let i = 0; i < 4; i++) {
    const y = Math.floor(Math.random() * height);
    lines += `<line x1="0" y1="${y}" x2="${width}" y2="${Math.floor(Math.random() * height)}" ` +
      `stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  }
  let dots = '';
  for (let i = 0; i < 14; i++) {
    dots += `<circle cx="${Math.floor(Math.random() * width)}" cy="${Math.floor(Math.random() * height)}" ` +
      `r="1.4" fill="#94a3b8" opacity="0.5"/>`;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<rect width="${width}" height="${height}" fill="#f8fafc" rx="8"/>` +
    lines + dots +
    `<g stroke="#64748b" stroke-width="1" opacity="0.35">` +
    `<path d="M0 ${height / 2} Q ${width / 3} ${height / 4}, ${width / 2} ${height / 2} T ${width} ${height / 2}" fill="none"/>` +
    `<path d="M0 ${height / 3} Q ${width / 2} ${height}, ${width} ${height / 4}" fill="none"/>` +
    `</g>` + chars + `</svg>`;

  return { svg, token: makeToken(text) };
}

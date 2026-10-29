import { NextRequest, NextResponse } from 'next/server';
import { generateCaptcha, verifyCaptchaToken } from '@/lib/captcha';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex',
};

// GET → { svg, token } — new captcha challenge.
export async function GET(req: NextRequest) {
  void req;
  const { svg, token } = generateCaptcha();
  return NextResponse.json(
    { svg, token },
    { headers: { ...NO_STORE_HEADERS, 'Content-Type': 'application/json' } },
  );
}

// POST { token, answer } → { ok } — verify and consume the token.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = verifyCaptchaToken(String(body.token || ''), String(body.answer || ''));
    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
      headers: { ...NO_STORE_HEADERS },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: { ...NO_STORE_HEADERS } },
    );
  }
}

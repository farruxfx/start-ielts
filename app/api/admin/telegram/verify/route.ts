// POST { botToken } → getMe check (admin test button)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import { verifyBotToken } from '@/lib/telegram-listener';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.botToken === 'string' ? body.botToken.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'botToken required' }, { status: 400 });
    }
    const result = await verifyBotToken(token);
    return NextResponse.json(result);
  } catch (e) {
    console.error('[api/admin/telegram/verify] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

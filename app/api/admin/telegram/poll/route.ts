// POST → run one listener cycle: pull new messages, match amounts to
// pending orders, confirm paid orders, log everything.

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import { runTelegramListener } from '@/lib/telegram-listener';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  try {
    const result = await runTelegramListener();
    return NextResponse.json(result);
  } catch (e) {
    console.error('[api/admin/telegram/poll] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

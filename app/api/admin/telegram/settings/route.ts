// GET  → current Telegram listener settings (token masked)
// POST → save bot token / chat id / enabled

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import {
  getTelegramSettings,
  saveTelegramSettings,
} from '@/lib/telegram-listener';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const s = await getTelegramSettings();
  return NextResponse.json({
    configured: !!s,
    botTokenMasked: s ? '••••' + s.botToken.slice(-4) : '',
    chatId: s?.chatId || '',
    enabled: s?.enabled ?? false,
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.botToken === 'string' ? body.botToken.trim() : '';
    const chatId = typeof body.chatId === 'string' ? body.chatId.trim() : '';
    const enabled = !!body.enabled;

    if (!token || token.split(':').length < 2) {
      return NextResponse.json({ error: "Bot token noto'g'ri (format: 123456:ABC-DEF...)" }, { status: 400 });
    }

    const ok = await saveTelegramSettings(token, chatId, enabled);
    if (!ok) {
      return NextResponse.json({
        error: "Saqlanmadi. Demo rejimda TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID env o'zgaruvchilarini o'rnating.",
      }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/admin/telegram/settings] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET  → current Telegram listener settings (token masked)
// POST → save bot token / chat id / enabled

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import {
  getTelegramSettings,
  saveTelegramSettings,
  getMtprotoSettings,
  saveMtprotoSettings,
} from '@/lib/telegram-listener';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const s = await getTelegramSettings();
  const m = await getMtprotoSettings();
  return NextResponse.json({
    configured: !!s,
    botTokenMasked: s ? '••••' + s.botToken.slice(-4) : '',
    chatId: s?.chatId || '',
    enabled: s?.enabled ?? false,
    mtproto: m
      ? {
          configured: true,
          apiIdMasked: m.apiId.slice(0, 3) + '••••',
          apiHashMasked: '••••' + m.apiHash.slice(-4),
          phoneMasked: m.phone ? '••••••' + m.phone.slice(-2) : '',
          webhookSecretMasked: m.webhookSecret ? '••••' + m.webhookSecret.slice(-4) : '',
        }
      : { configured: false },
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

    // MTProto (my.telegram.org) configuration branch — user-account listener.
    if (body.mtproto === true) {
      const apiId = typeof body.apiId === 'string' ? body.apiId.replace(/\D/g, '') : '';
      const apiHash = typeof body.apiHash === 'string' ? body.apiHash.trim() : '';
      const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
      const webhookSecret = typeof body.webhookSecret === 'string' ? body.webhookSecret.trim() : '';
      if (!apiId || apiId.length < 5) {
        return NextResponse.json({ error: "api_id noto'g'ri (my.telegram.org → API development tools)" }, { status: 400 });
      }
      if (apiHash.length < 16) {
        return NextResponse.json({ error: "api_hash noto'g'ri (32 belgi bo'lishi kerak)" }, { status: 400 });
      }
      if (!webhookSecret) {
        return NextResponse.json({ error: "Webhook secret kiritilishi shart (skript ↔ sayt handshake uchun)" }, { status: 400 });
      }
      const ok = await saveMtprotoSettings(apiId, apiHash, phone, webhookSecret);
      if (!ok) {
        return NextResponse.json({
          error: "Saqlanmadi. Demo rejimda TELEGRAM_API_ID / TELEGRAM_API_HASH env o'zgaruvchilarini o'rnating.",
        }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

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

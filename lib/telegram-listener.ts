// ═══════════════════════════════════════════════════════════════════════
//  TELEGRAM PAYMENT LISTENER — server-side payment auto-confirmation
//
//  Admin stores a bot token + source chat id in the admin panel. A polling
//  endpoint (POST /api/admin/telegram/poll, admin-only) pulls new messages
//  via getUpdates, extracts payment amounts from bank-bot messages, matches
//  them against pending payment_orders (unique exact_amount) and confirms
//  the order. Every message is logged into transaction_logs (dedupe by
//  message id) so payments are never double-processed.
//
//  Settings storage:
//    - Supabase table telegram_settings (single row id='default')
//    - Demo fallback: env TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID, offset in memory
// ═══════════════════════════════════════════════════════════════════════

import { isSupabaseConfigured, supabase } from './supabase';
import {
  confirmPaymentOrder,
  matchTransactionToOrder,
  logTransaction,
  getPaymentOrder,
} from './payment-system';

export interface TelegramListenerSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
  lastUpdateId: number;
}

// ─── Settings storage ─────────────────────────────────────────────────

let memoryOffset = 0; // demo mode only

export async function getTelegramSettings(): Promise<TelegramListenerSettings | null> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('telegram_settings')
        .select('bot_token, chat_id, enabled, last_update_id')
        .eq('id', 'default')
        .maybeSingle();
      if (data?.bot_token) {
        return {
          botToken: data.bot_token,
          chatId: data.chat_id || '',
          enabled: !!data.enabled,
          lastUpdateId: Number(data.last_update_id || 0),
        };
      }
    } catch { /* fall through */ }
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) {
    return {
      botToken: token,
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      enabled: true,
      lastUpdateId: memoryOffset,
    };
  }
  return null;
}

export async function saveTelegramSettings(
  botToken: string,
  chatId: string,
  enabled: boolean,
): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('telegram_settings')
      .upsert(
        {
          id: 'default',
          bot_token: botToken,
          chat_id: chatId,
          enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
    return !error;
  }
  // Demo mode: cannot persist — set TELEGRAM_BOT_TOKEN env instead.
  return false;
}

async function persistOffset(updateId: number): Promise<void> {
  memoryOffset = updateId;
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('telegram_settings')
        .update({ last_update_id: updateId })
        .eq('id', 'default');
    } catch { /* best effort */ }
  }
}

// ─── Amount parsing ───────────────────────────────────────────────────

/**
 * Extract candidate payment amounts from a message. Handles formatted
 * numbers: "590 130", "590,130", "590.130", "590130", "590 130,00 so'm".
 */
export function extractAmounts(text: string): number[] {
  if (!text) return [];
  const out = new Set<number>();

  // 1) Groups like 590 130 / 590,130 / 590.130 (with optional ,00 decimals)
  const groupRe = /(\d{1,3}(?:[ ., ]\d{3})+)(?:[.,](\d{2}))?/g;
  let m: RegExpExecArray | null;
  while ((m = groupRe.exec(text))) {
    const digits = m[1].replace(/[^\d]/g, '');
    if (digits.length >= 4) out.add(Number(digits));
  }

  // 2) Plain long numbers (>= 4 digits)
  const plainRe = /(?<!\S)(\d{4,})(?!\S)/g;
  while ((m = plainRe.exec(text))) {
    out.add(Number(m[1]));
  }

  return Array.from(out);
}

// ─── Telegram API ─────────────────────────────────────────────────────

interface TgUpdate {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    date?: number;
    from?: { id?: number | string };
    chat?: { id?: number | string };
  };
  channel_post?: {
    message_id: number;
    text?: string;
    date?: number;
    sender_chat?: { id?: number | string };
  };
}

async function tgGetUpdates(token: string, offset: number): Promise<TgUpdate[] | null> {
  try {
    const res = await fetch(
      'https://api.telegram.org/bot' + token + '/getUpdates?offset=' + (offset + 1) +
        '&timeout=0&allowed_updates=' + encodeURIComponent(JSON.stringify(['message', 'channel_post'])),
    );
    const json = await res.json();
    if (!json.ok) return null;
    return json.result as TgUpdate[];
  } catch {
    return null;
  }
}

async function alreadyProcessed(messageId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false; // local store dedupes via processed_at
  try {
    const { data } = await supabase
      .from('transaction_logs')
      .select('id')
      .eq('source_message_id', String(messageId))
      .limit(1);
    return !!(data && data.length > 0);
  } catch {
    return false;
  }
}

// ─── Listener core ────────────────────────────────────────────────────

export interface ListenerRunResult {
  ok: boolean;
  error?: string;
  scanned: number;
  amountsFound: number;
  matched: number;
  unmatched: number;
  duplicates: number;
  lastUpdateId: number;
}

export async function runTelegramListener(): Promise<ListenerRunResult> {
  const settings = await getTelegramSettings();
  const empty: ListenerRunResult = { ok: false, scanned: 0, amountsFound: 0, matched: 0, unmatched: 0, duplicates: 0, lastUpdateId: 0 };
  if (!settings) return { ...empty, error: "Telegram sozlanmagan (bot token yo'q)" };
  if (!settings.enabled) return { ...empty, error: "Listener o'chirilgan" };

  const updates = await tgGetUpdates(settings.botToken, settings.lastUpdateId);
  if (!updates) return { ...empty, error: 'Telegram API xatosi (getUpdates). Bot tokenni tekshiring.' };

  let scanned = 0, amountsFound = 0, matched = 0, unmatched = 0, duplicates = 0;
  let maxUpdateId = settings.lastUpdateId;

  for (const u of updates) {
    if (u.update_id > maxUpdateId) maxUpdateId = u.update_id;
    const msg = u.message || u.channel_post;
    if (!msg || !msg.text) continue;

    // Only listen to the configured source chat (if set).
    if (settings.chatId) {
      const chat = u.message?.chat?.id ?? u.channel_post?.sender_chat?.id;
      if (chat !== undefined && String(chat) !== String(settings.chatId)) continue;
    }

    scanned++;
    const messageId = 'tg_' + (u.message?.message_id ?? u.channel_post?.message_id ?? u.update_id);
    if (await alreadyProcessed(messageId)) { duplicates++; continue; }

    const amounts = extractAmounts(msg.text);
    if (amounts.length === 0) continue;
    amountsFound += amounts.length;

    const senderId = String(u.message?.from?.id ?? u.channel_post?.sender_chat?.id ?? u.update_id);
    let confirmed = false;

    for (const amount of amounts) {
      const order = await matchTransactionToOrder(amount, senderId);
      if (order) {
        const ok = await confirmPaymentOrder(order.id, messageId, senderId);
        await logTransaction({
          source: 'telegram_listener',
          source_message_id: messageId,
          amount,
          direction: 'incoming',
          raw_message: msg.text.slice(0, 1000),
          parsed_data: { orderId: order.id, planId: order.plan_id, confirmed: ok },
          matched_payment_order_id: ok ? order.id : null,
          processing_status: ok ? 'matched' : 'error',
        });
        if (ok) { matched++; confirmed = true; }
        break; // one order per message
      }
    }

    if (!confirmed) {
      unmatched++;
      await logTransaction({
        source: 'telegram_listener',
        source_message_id: messageId,
        amount: amounts[0],
        direction: 'incoming',
        raw_message: msg.text.slice(0, 1000),
        parsed_data: { candidates: amounts },
        matched_payment_order_id: null,
        processing_status: 'unmatched',
      });
    }
  }

  await persistOffset(maxUpdateId);

  return { ok: true, scanned, amountsFound, matched, unmatched, duplicates, lastUpdateId: maxUpdateId };
}

/** Verify bot credentials via getMe (admin panel test button). */
export async function verifyBotToken(token: string): Promise<{ ok: boolean; name?: string; username?: string; error?: string }> {
  try {
    const res = await fetch('https://api.telegram.org/bot' + token + '/getMe');
    const json = await res.json();
    if (!json.ok) return { ok: false, error: json.description || "Noto'g'ri token" };
    return { ok: true, name: json.result.first_name, username: json.result.username };
  } catch {
    return { ok: false, error: 'Telegram API ga ulanmadi' };
  }
}

// Order re-check helper (API surface completeness).
export async function recheckOrder(orderId: string): Promise<boolean> {
  const order = await getPaymentOrder(orderId);
  return !!order && order.status === 'paid';
}

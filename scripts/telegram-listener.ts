#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
//  TELEGRAM LISTENER — bank transaction monitor (MTProto USER account)
//  Connects as a USER account (my.telegram.org api_id/api_hash) to read
//  bank-bot messages. Credentials are loaded from the admin panel DB,
//  never hard-coded here.
//  
//  USAGE: npx tsx scripts/telegram-listener.ts
// ═══════════════════════════════════════════════════════════════════════

const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NEW_MESSAGE } = require('telegram/Events');
const fs = require('fs');
const readline = require('readline');

// ═══════════════════════════════════════════════════════════════════
//  CONFIG — credentials are NEVER hard-coded here (no secrets in git).
//
//  Priority order:
//   1. telegram_settings row (admin panel MTProto card) — read with the
//      SUPABASE_SERVICE_ROLE_KEY service-role key (env only, not in git).
//   2. Environment fallback: TELEGRAM_API_ID / TELEGRAM_API_HASH /
//      TELEGRAM_PHONE / PAYMENT_WEBHOOK_SECRET.
//
//  The webhook secret MUST come from the admin panel (webhook_secret
//  column) or PAYMENT_WEBHOOK_SECRET env. There is NO default secret.
// ═══════════════════════════════════════════════════════════════════
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SESSION_FILE = './.telegram-session'; // cached MTProto session string

let API_ID = 0;
let API_HASH = '';
let PHONE = '';
let WEBHOOK_SECRET = '';

async function loadConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const db = createClient(url, key, { auth: { persistSession: false } });
      const { data } = await db
        .from('telegram_settings')
        .select('mtproto_api_id, mtproto_api_hash, mtproto_phone, webhook_secret')
        .eq('id', 'default')
        .maybeSingle();
      if (data && data.mtproto_api_id && data.mtproto_api_hash) {
        API_ID = Number(data.mtproto_api_id);
        API_HASH = String(data.mtproto_api_hash);
        PHONE = String(data.mtproto_phone || '');
        WEBHOOK_SECRET = String(data.webhook_secret || '');
        console.log('✅ MTProto creds loaded from admin panel (telegram_settings)');
      }
    } catch (e) {
      console.warn('⚠️  DB config read failed:', e.message);
    }
  }
  if (!API_ID) API_ID = parseInt(process.env.TELEGRAM_API_ID || '0');
  if (!API_HASH) API_HASH = process.env.TELEGRAM_API_HASH || '';
  if (!PHONE) PHONE = process.env.TELEGRAM_PHONE || '';
  if (!WEBHOOK_SECRET) WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || '';
}

// Bank bot usernames to monitor (environment override: TELEGRAM_SOURCE_BOTS).
const BANK_BOT_USERNAMES = (process.env.TELEGRAM_SOURCE_BOTS || 'HUMOcardbot,humocardbot')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** Best-effort: share the session string back to the admin panel DB. */
async function persistSessionToDb(session) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const db = createClient(url, key, { auth: { persistSession: false } });
    await db
      .from('telegram_settings')
      .upsert({ id: 'default', mtproto_session: session }, { onConflict: 'id' });
    console.log('💾 Session pushed to admin panel (telegram_settings)');
  } catch {
    /* best effort */
  }
}

// ─── Parser ───────────────────────────────────────────────────────────

function parseHumoNotification(text) {
  const result = {
    isValid: false,
    direction: null,
    amount: null,
    error: null,
  };

  if (!text || !text.trim()) {
    result.error = 'Empty message';
    return result;
  }

  // Direction detection
  const outgoingPatterns = [/списани/i, /debited/i, /outgoing/i, /оплата/i, /📤/, /➖/];
  const incomingPatterns = [/поступлени/i, /credited/i, /incoming/i, /вам\s+(?:перевели|поступило)/i, /💰/, /➕/, /📥/];

  for (const p of outgoingPatterns) {
    if (p.test(text)) { result.direction = 'outgoing'; break; }
  }
  if (!result.direction) {
    for (const p of incomingPatterns) {
      if (p.test(text)) { result.direction = 'incoming'; break; }
    }
  }
  if (!result.direction) {
    if (/[+] *\d/.test(text)) result.direction = 'incoming';
    else if (/[-] *\d/.test(text)) result.direction = 'outgoing';
    else { result.error = 'Cannot determine direction'; return result; }
  }

  // Amount extraction
  const amountPatterns = [
    /(?:поступлен|списани|credited|debited)[:\s]+([+\-]?\s*[\d\s,\.]+)\s*(?:сум|uzs|UZS)?/i,
    /[+]?\s*([\d][\d\s,\.]+)\s*(?:сум|uzs|UZS)/i,
    /(\d{1,3}(?:[\s,]\d{3})+)\s*(?:сум|uzs|UZS)/i,
    /[+]\s*(\d[\d\s,\.]*)/,
  ];

  for (const p of amountPatterns) {
    const m = text.match(p);
    if (m) {
      const raw = m[1].replace(/[^\d]/g, '');
      const amount = parseInt(raw, 10);
      if (amount > 0 && amount < 100000000) { result.amount = amount; break; }
    }
  }

  if (!result.amount) { result.error = 'Could not extract amount'; return result; }
  result.isValid = true;
  return result;
}

// ─── Webhook Caller ───────────────────────────────────────────────────

async function reportToWebhook(data) {
  try {
    const res = await fetch(`${APP_URL}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      console.log(`  ✅ MATCHED! Order: ${result.orderId}, Amount: ${result.amount} UZS`);
    } else {
      console.log(`  ℹ️  No match: ${result.reason || result.error || 'unknown'}`);
    }
  } catch (err) {
    console.error('  ❌ Webhook error:', err.message);
  }
}

// ─── Session ──────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer || null); });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🏦 StartIELTS — Bank transaction listener (MTProto user account)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  await loadConfig();

  if (!API_ID || !API_HASH) {
    console.error(
      '❌ MTProto kredensiallar topilmadi. Admin paneldan (Telegram listener → MTProto)\n' +
        '   saqlangan bo‘lsin yoki .env.local ga TELEGRAM_API_ID / TELEGRAM_API_HASH yozilsin.'
    );
    process.exit(1);
  }
  if (!WEBHOOK_SECRET) {
    console.error(
      '❌ PAYMENT_WEBHOOK_SECRET yo‘q. Admin panelda webhook_secret saqlangan\n' +
        '   bo‘lsin yoki .env.local ga PAYMENT_WEBHOOK_SECRET yozilsin (default yo‘q).'
    );
    process.exit(1);
  }

  // Load session
  let sessionString = '';
  if (fs.existsSync(SESSION_FILE)) {
    sessionString = fs.readFileSync(SESSION_FILE, 'utf-8');
    console.log('📂 Session loaded from file');
  }

  const client = new TelegramClient(
    new StringSession(sessionString),
    API_ID,
    API_HASH,
    { connectionRetries: 5, retryDelay: 2000, autoReconnect: true }
  );

  console.log('🔌 Connecting to Telegram...');

  // Load session from file only (manual login once); skip interactive re-login.
  console.log('🔌 Connecting to Telegram...');

  await client.start({
    phoneNumber: async () => PHONE || await prompt('📱 Phone number: '),
    password: async () => await prompt('🔑 2FA Password (leave empty if none): '),
    phoneCode: async () => await prompt('📲 Verification code: '),
    onError: (err) => console.error('Client error:', err.message),
  });

  // Save session to file (also pushed to admin panel for reuse).
  const savedSession = client.session.save();
  fs.writeFileSync(SESSION_FILE, savedSession);
  console.log('💾 Session saved to file');
  persistSessionToDb(String(savedSession));
  console.log('');
  console.log('✅ Connected to Telegram!');
  console.log(`📡 Webhook: ${APP_URL}/api/payment/webhook`);
  console.log(`👂 Monitoring for @${BANK_BOT_USERNAMES.join('/ @')} messages...`);
  console.log('');
  console.log('Waiting for incoming transactions... (Press Ctrl+C to stop)');
  console.log('');

  // Listen for new messages
  client.addEventHandler(async (event) => {
    try {
      const message = event.message;
      if (!message || !message.message) return;

      // Get sender
      const sender = await message.getSender();
      if (!sender) return;

      const username = sender.username || '';
      const senderId = sender.id?.toString() || '';

      // Check if from a monitored bank bot
      const isBankBot = BANK_BOT_USERNAMES.some(
        name => username.toLowerCase() === name.toLowerCase()
      );

      if (!isBankBot) return;

      const text = message.message;
      const msgId = message.id?.toString() || Date.now().toString();

      console.log(`📩 Message from @${username}:`);
      console.log(`   ${text.substring(0, 200)}`);

      // Parse
      const parsed = parseHumoNotification(text);
      if (!parsed.isValid) {
        console.log(`   ⚠️  Parse failed: ${parsed.error}`);
        return;
      }

      console.log(`   💰 Direction: ${parsed.direction}, Amount: ${parsed.amount} UZS`);

      if (parsed.direction !== 'incoming') {
        console.log(`   📤 Outgoing — skipping`);
        return;
      }

      // Report to webhook
      await reportToWebhook({
        rawMessage: text,
        messageId: msgId,
        senderId,
        senderUsername: username,
      });
    } catch (err) {
      console.error('❌ Handler error:', err.message);
    }
  }, new NEW_MESSAGE({}));

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down...');
    try { await client.disconnect(); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});

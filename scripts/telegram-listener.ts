#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════
//  TELEGRAM LISTENER — @HUMOcardbot Transaction Monitor
//  Connects as a USER account to read @HUMOcardbot messages
//  
//  USAGE: npx tsx scripts/telegram-listener.ts
// ═══════════════════════════════════════════════════════════════════════

const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NEW_MESSAGE } = require('telegram/Events');
const fs = require('fs');
const readline = require('readline');

// ─── Configuration ────────────────────────────────────────────────────

const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0');
const API_HASH = process.env.TELEGRAM_API_HASH || '';
const PHONE = process.env.TELEGRAM_PHONE || '';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'startielts-payment-webhook-2024';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SESSION_FILE = './.telegram-humo-session';

// HUMO Bot usernames to monitor
const HUMO_BOT_USERNAMES = ['HUMOcardbot', 'humocardbot'];

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
  console.log('  🏦 StartIELTS — HUMO Card Transaction Listener');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (!API_ID || !API_HASH) {
    console.error('❌ Missing TELEGRAM_API_ID or TELEGRAM_API_HASH in .env.local');
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

  await client.start({
    phoneNumber: async () => PHONE || await prompt('📱 Phone number: '),
    password: async () => await prompt('🔑 2FA Password (leave empty if none): '),
    phoneCode: async () => await prompt('📲 Verification code: '),
    onError: (err) => console.error('Client error:', err.message),
  });

  // Save session
  fs.writeFileSync(SESSION_FILE, client.session.save());
  console.log('💾 Session saved');
  console.log('');
  console.log('✅ Connected to Telegram!');
  console.log(`📡 Webhook: ${APP_URL}/api/payment/webhook`);
  console.log(`👂 Monitoring for @HUMOcardbot messages...`);
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

      // Check if from HUMO bot
      const isHumoBot = HUMO_BOT_USERNAMES.some(
        name => username.toLowerCase() === name.toLowerCase()
      );

      if (!isHumoBot) return;

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

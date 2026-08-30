// ═══════════════════════════════════════════════════════════════════════
//  HUMO CARD BOT — Telegram Notification Parser
//  Parses incoming transaction messages from @HUMOcardbot
// ═══════════════════════════════════════════════════════════════════════

export interface ParsedTransaction {
  isValid: boolean;
  direction: 'incoming' | 'outgoing';
  amount: number | null;
  currency: string;
  cardIdentifier: string | null;
  transactionTime: string | null;
  telegramMessageId: string | null;
  senderId: string | null;
  error?: string;
}

// Expected sender username/userid for HUMO notifications
const VALID_SOURCES = ['HUMOcardbot', 'humocardbot'];

/**
 * Validate that the message is from the configured HUMO notification source.
 */
export function isValidSource(senderUsername?: string | null): boolean {
  if (!senderUsername) return false;
  const normalized = senderUsername.replace('@', '').toLowerCase();
  return VALID_SOURCES.some(s => normalized === s.toLowerCase());
}

/**
 * Parse a @HUMOcardbot transaction notification.
 * 
 * Typical @HUMOcardbot message formats:
 * 
 * ── Incoming (money received) ──
 * 💰沈 沈沈沈沈
 * 📲 沈沈沈沈: +998 9X XXX XX XX
 * 💰 Поступление: 59 047 сум
 * 💳 Карта: **** 1234
 * 📅 Дата: 2024-01-15 14:30:22
 * 
 * ── Outgoing (money sent) ──
 * 📤 списание: 59 047 сум
 * 💳 Карта: **** 1234
 * 
 * We need to handle variations in formatting.
 */
export function parseHumoNotification(message: string, meta?: {
  messageId?: string | null;
  senderId?: string | null;
  senderUsername?: string | null;
}): ParsedTransaction {
  const result: ParsedTransaction = {
    isValid: false,
    direction: 'incoming',
    amount: null,
    currency: 'UZS',
    cardIdentifier: null,
    transactionTime: null,
    telegramMessageId: meta?.messageId || null,
    senderId: meta?.senderId || null,
  };

  // Validate source
  if (meta?.senderUsername && !isValidSource(meta.senderUsername)) {
    result.error = `Unknown sender: ${meta.senderUsername}`;
    return result;
  }

  // Normalize the message text
  const text = message.replace(/\r\n/g, '\n').trim();

  // ─── Direction Detection ─────────────────────────────────────
  // Incoming: Поступление, поступление,credited,incoming,+amount
  // Outgoing: Списание, списание, debited, outgoing,-amount
  
  const outgoingPatterns = [
    /списани/i,
    /debited/i,
    /outgoing/i,
    /перевод\s+(?:отправлен|сделан)/i,
    /оплата/i,
    /вы\s+(?:отправили|перевели)/i,
    /📤/,
    /➖/,
  ];

  const incomingPatterns = [
    /поступлени/i,
    /credited/i,
    /incoming/i,
    /перевод\s+(?:получен|входящий)/i,
    /вам\s+(?:перевели|поступило)/i,
    /💰/,
    /➕/,
    /📥/,
  ];

  let directionDetected = false;
  
  for (const pattern of outgoingPatterns) {
    if (pattern.test(text)) {
      result.direction = 'outgoing';
      directionDetected = true;
      break;
    }
  }

  if (!directionDetected) {
    for (const pattern of incomingPatterns) {
      if (pattern.test(text)) {
        result.direction = 'incoming';
        directionDetected = true;
        break;
      }
    }
  }

  // If no direction detected, try to infer from +/- signs
  if (!directionDetected) {
    if (/[+] *\d/.test(text)) {
      result.direction = 'incoming';
    } else if (/[-] *\d/.test(text)) {
      result.direction = 'outgoing';
    } else {
      result.error = 'Could not determine transaction direction';
      return result;
    }
  }

  // ─── Amount Extraction ───────────────────────────────────────
  // Match patterns like: 59 047, 59047, 59,047, +59047, 59 047 сум
  
  const amountPatterns = [
    // "Поступление: 59 047 сум" or "Списание: 59 047 сум"
    /(?:поступлен|списани|credited|debited)[:\s]+([+\-]?\s*[\d\s,\.]+)\s*(?:сум|uzs|UZS)?/i,
    // "+998 9X ... → +59 047 сум"
    /[+]?\s*([\d][\d\s,\.]+)\s*(?:сум|uzs|UZS)/i,
    // Just a large number (likely amount)
    /(\d{1,3}(?:[\s,]\d{3})+)\s*(?:сум|uzs|UZS)/i,
    // Standalone large number
    /(?:^|\n)\s*(\d{4,7})\s*(?:сум|uzs)?\s*(?:\n|$)/m,
    // With + prefix
    /[+]\s*(\d[\d\s,\.]*)/,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean the amount string
      const raw = match[1].replace(/[^\d]/g, '');
      const amount = parseInt(raw, 10);
      if (amount > 0 && amount < 100000000) { // Sanity check: less than 100M
        result.amount = amount;
        break;
      }
    }
  }

  if (!result.amount) {
    result.error = 'Could not extract transaction amount';
    return result;
  }

  // ─── Card Identifier ─────────────────────────────────────────
  const cardMatch = text.match(/(?:\*{4}|карта|card)[:\s]*(\d{4})/i)
    || text.match(/(?:\*{4}|XXXX)\s*(\d{4})/);
  if (cardMatch) {
    result.cardIdentifier = cardMatch[1];
  }

  // ─── Transaction Time ────────────────────────────────────────
  const timeMatch = text.match(/(?:дата|date|время|time)[:\s]*(\d{4}[-/.]\d{2}[-/.]\d{2}[\sT]\d{2}:\d{2}(?::\d{2})?)/i)
    || text.match(/(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}(?::\d{2})?)/)
    || text.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?)/);
  if (timeMatch) {
    result.transactionTime = timeMatch[1];
  }

  // ─── Validation ──────────────────────────────────────────────
  if (result.amount && result.direction) {
    result.isValid = true;
  }

  return result;
}

/**
 * Check if a parsed transaction matches a payment order's exact amount.
 */
export function matchesOrderAmount(parsedAmount: number, orderExactAmount: number): boolean {
  return parsedAmount === orderExactAmount;
}

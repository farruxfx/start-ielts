import { NextRequest, NextResponse } from 'next/server';
import {
  confirmPaymentOrder,
  matchTransactionToOrder,
  activateSubscriptionFromPayment,
  logTransaction,
  getPaymentOrder,
} from '@/lib/payment-system';
import { parseHumoNotification } from '@/lib/humo-parser';

// Shared secret for Telegram listener authentication
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'startielts-payment-webhook-2024';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the webhook caller
    const authHeader = req.headers.get('x-webhook-secret');
    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { rawMessage, messageId, senderId, senderUsername } = body;

    if (!rawMessage || !messageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse the notification
    const parsed = parseHumoNotification(rawMessage, {
      messageId,
      senderId,
      senderUsername,
    });

    if (!parsed.isValid) {
      // Log invalid message
      await logTransaction({
        source: 'telegram_humo',
        source_message_id: messageId,
        amount: parsed.amount || 0,
        direction: parsed.direction,
        raw_message: rawMessage,
        parsed_data: parsed as unknown as Record<string, unknown>,
        matched_payment_order_id: null,
        processing_status: 'error',
      });

      return NextResponse.json({
        success: false,
        error: parsed.error || 'Could not parse transaction',
      });
    }

    // Only process incoming transactions
    if (parsed.direction !== 'incoming') {
      await logTransaction({
        source: 'telegram_humo',
        source_message_id: messageId,
        amount: parsed.amount!,
        direction: parsed.direction,
        raw_message: rawMessage,
        parsed_data: parsed as unknown as Record<string, unknown>,
        matched_payment_order_id: null,
        processing_status: 'ignored',
      });

      return NextResponse.json({
        success: false,
        reason: 'Outgoing transaction ignored',
      });
    }

    // Match transaction to a payment order
    const matchedOrder = await matchTransactionToOrder(parsed.amount!, senderId || '');

    if (!matchedOrder) {
      // No match found — log as unmatched
      await logTransaction({
        source: 'telegram_humo',
        source_message_id: messageId,
        amount: parsed.amount!,
        direction: parsed.direction,
        raw_message: rawMessage,
        parsed_data: parsed as unknown as Record<string, unknown>,
        matched_payment_order_id: null,
        processing_status: 'unmatched',
      });

      return NextResponse.json({
        success: false,
        reason: 'No matching payment order found',
        amount: parsed.amount,
      });
    }

    // Confirm the payment order
    const confirmed = await confirmPaymentOrder(
      matchedOrder.id,
      messageId,
      senderId || '',
    );

    if (!confirmed) {
      await logTransaction({
        source: 'telegram_humo',
        source_message_id: messageId,
        amount: parsed.amount!,
        direction: parsed.direction,
        raw_message: rawMessage,
        parsed_data: parsed as unknown as Record<string, unknown>,
        matched_payment_order_id: matchedOrder.id,
        processing_status: 'error',
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to confirm payment order',
      });
    }

    // Activate subscription
    const refreshedOrder = await getPaymentOrder(matchedOrder.id);
    if (refreshedOrder) {
      await activateSubscriptionFromPayment(refreshedOrder);
    }

    // Log successful match
    await logTransaction({
      source: 'telegram_humo',
      source_message_id: messageId,
      amount: parsed.amount!,
      direction: parsed.direction,
      raw_message: rawMessage,
      parsed_data: parsed as unknown as Record<string, unknown>,
      matched_payment_order_id: matchedOrder.id,
      processing_status: 'matched',
    });

    return NextResponse.json({
      success: true,
      orderId: matchedOrder.id,
      amount: parsed.amount,
      planId: matchedOrder.plan_id,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

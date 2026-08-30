-- ═══════════════════════════════════════════════════════════════════════
--  PAYMENT SYSTEM — Database Migration
--  StartIELTS Automated Payment Verification via HUMO Card Bot
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Payment Methods (admin-managed card details)
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  card_number TEXT NOT NULL,
  card_holder TEXT NOT NULL,
  bank_name TEXT NOT NULL DEFAULT 'HUMO',
  instructions TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Payment Orders
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  payment_method_id TEXT NOT NULL REFERENCES payment_methods(id),
  base_amount INTEGER NOT NULL,
  exact_amount INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'failed')),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  transaction_message_id TEXT,
  transaction_sender_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast transaction matching
CREATE INDEX IF NOT EXISTS idx_payment_orders_exact_amount ON payment_orders(exact_amount);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_expires_at ON payment_orders(expires_at);

-- 3. Transaction Logs (from Telegram listener)
CREATE TABLE IF NOT EXISTS transaction_logs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'telegram_humo',
  source_message_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  raw_message TEXT NOT NULL,
  parsed_data JSONB DEFAULT '{}',
  matched_payment_order_id TEXT REFERENCES payment_orders(id),
  processing_status TEXT NOT NULL DEFAULT 'unmatched' CHECK (processing_status IN ('matched', 'unmatched', 'ambiguous', 'error', 'duplicate', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_logs_status ON transaction_logs(processing_status);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_amount ON transaction_logs(amount);

-- 4. Listener Health Status
CREATE TABLE IF NOT EXISTS listener_health (
  id TEXT PRIMARY KEY DEFAULT 'main',
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
  last_message_at TIMESTAMPTZ,
  last_error TEXT,
  messages_processed INTEGER DEFAULT 0,
  payments_matched INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default health record
INSERT INTO listener_health (id, status) VALUES ('main', 'offline')
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS (Row Level Security)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_health ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role full access on payment_methods" ON payment_methods FOR ALL USING (true);
CREATE POLICY "Service role full access on payment_orders" ON payment_orders FOR ALL USING (true);
CREATE POLICY "Service role full access on transaction_logs" ON transaction_logs FOR ALL USING (true);
CREATE POLICY "Service role full access on listener_health" ON listener_health FOR ALL USING (true);

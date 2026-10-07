-- ═════════════════════════════════════════════════════════════════════════
--  TELEGRAM LISTENER + ADMIN PRICING OVERRIDES
--  Requires: payment_orders, transaction_logs (20240101_payment_system.sql)
--  Run BEFORE this if not applied yet.
-- ═════════════════════════════════════════════════════════════════════════

-- 1. Telegram listener settings (single row, admin-edited)
CREATE TABLE IF NOT EXISTS telegram_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  bot_token TEXT NOT NULL,
  chat_id TEXT DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_update_id BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;

-- Server-side (service role / API routes) only; clients never read the token.
DROP POLICY IF EXISTS "telegram_settings_service_only" ON telegram_settings;
CREATE POLICY "telegram_settings_service_only" ON telegram_settings
  FOR ALL USING (false) WITH CHECK (false);

-- 2. Admin-editable plan prices (pricing page + payment orders)
CREATE TABLE IF NOT EXISTS plan_overrides (
  plan_id TEXT PRIMARY KEY CHECK (plan_id IN ('daily', 'start', 'basic', 'pro')),
  price INTEGER,
  daily_price INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

ALTER TABLE plan_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plan_overrides_public_read" ON plan_overrides;
CREATE POLICY "plan_overrides_public_read" ON plan_overrides
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "plan_overrides_service_write" ON plan_overrides;
CREATE POLICY "plan_overrides_service_write" ON plan_overrides
  FOR ALL USING (true) WITH CHECK (true);

-- transaction_logs may predate the telegram_listener source: widen nothing,
-- the column accepts any TEXT; just make sure the unique dedupe index exists.
CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_logs_source_message_id
  ON transaction_logs(source_message_id);

-- profiles.role must exist for the admin API guard.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ═════════════════════════════════════════════════════════════════════════
--  FREE ACCESS CONFIG + PROMO CODES
--  • app_free_access: admin-manageable free content (free mock exam ids)
--  • promo_codes: admin-created discount codes applied at checkout;
--    the discounted price becomes the order base + exact amount,
--    so the payment page and Telegram listener work with the promo sum.
--  Requires payment_orders (20240101_payment_system.sql).
-- ═════════════════════════════════════════════════════════════════════════

-- 1. Free-access configuration (key/value, admin-editable)
CREATE TABLE IF NOT EXISTS app_free_access (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_free_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_free_access_public_read" ON app_free_access;
CREATE POLICY "app_free_access_public_read" ON app_free_access
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_free_access_service_write" ON app_free_access;
CREATE POLICY "app_free_access_service_write" ON app_free_access
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed the default free mock-exam row
INSERT INTO app_free_access (key, value) VALUES ('mock_exam', '["mock-1", "mock-2"]'::jsonb)
  ON CONFLICT (key) DO NOTHING;

-- 2. Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'percentage' CHECK (kind IN ('percentage', 'fixed')),
  value INTEGER NOT NULL CHECK (value > 0),
  plan_ids TEXT[],
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_until TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_codes_public_read" ON promo_codes;
CREATE POLICY "promo_codes_public_read" ON promo_codes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "promo_codes_service_write" ON promo_codes;
CREATE POLICY "promo_codes_service_write" ON promo_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active);

-- 3. payment_orders: promo columns
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;

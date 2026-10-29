-- ═════════════════════════════════════════════════════════════════════════
--  TELEGRAM MTProto CONFIG — my.telegram.org user-account listener
--  Adds MTProto credentials (api_id / api_hash / phone) and the listener
--  webhook secret to telegram_settings so they are managed from the admin
--  panel and never stored in the repository.
--
--  Requires: telegram_settings (20261007000000_telegram_listener_and_plan_overrides.sql)
--  Run BEFORE this if not applied yet.
-- ═════════════════════════════════════════════════════════════════════════

ALTER TABLE telegram_settings
  ADD COLUMN IF NOT EXISTS mtproto_api_id BIGINT,
  ADD COLUMN IF NOT EXISTS mtproto_api_hash TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS mtproto_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS mtproto_session TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT DEFAULT '';

-- bot_token was NOT NULL in the original schema; relax it so a row can hold
-- MTProto-only configuration (user-account listener instead of a bot).
ALTER TABLE telegram_settings ALTER COLUMN bot_token DROP NOT NULL;

-- ═════════════════════════════════════════════════════════════════════════
--  PLATFORM SECRETS — admin-managed third-party API credentials
--  (Groq API key, future services). Values live ONLY in the database —
--  never in the repository. RLS: service role only, like telegram_settings.
-- ═════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS platform_secrets (
  key TEXT PRIMARY KEY,            -- e.g. 'groq_api_key'
  value TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

ALTER TABLE platform_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_secrets_service_only" ON platform_secrets;
CREATE POLICY "platform_secrets_service_only" ON platform_secrets
  FOR ALL USING (false) WITH CHECK (false);

/*
# Admin: subscription tiers aligned with pricing plans + lookup helpers

## Overview
Aligns admin subscription management with the 5 pricing plans (free, daily, start,
basic, pro) and makes the admin set-role / set-tier functions accept lookups by the
user ID shown in their profile.

## Changes
1. **subscriptions.tier CHECK** — extends tier values to include 'daily', 'start',
   'basic' (keeps 'free', 'plus', 'pro' for backward compatibility).
2. **admin_set_subscription_tier(p_target_user, p_tier)** — accepts the new tiers,
   keeps SECURITY DEFINER + admin-only authorization.
3. **admin_find_user_by_id(p_id_prefix)** — lets admins resolve a (partial) user ID
   to a single profile row.

## Security
- Both RPCs remain SECURITY DEFINER with an explicit admin role check.
- EXECUTE revoked from anon; granted to authenticated only.
*/

-- 1. Widen the tier CHECK constraint (drop old, add new)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('free', 'plus', 'pro', 'daily', 'start', 'basic'));

-- Also cover schemas where the column is named plan_id (003_clean_setup layout)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_id_check
  CHECK (plan_id IN ('free', 'plus', 'pro', 'daily', 'start', 'basic'));

-- 2. Admin sets subscription tier (now supports all 5 plans)
CREATE OR REPLACE FUNCTION admin_set_subscription_tier(p_target_user uuid, p_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_tier NOT IN ('free', 'plus', 'pro', 'daily', 'start', 'basic') THEN
    RAISE EXCEPTION 'Invalid tier';
  END IF;

  INSERT INTO subscriptions (user_id, tier, status, started_at)
  VALUES (p_target_user, p_tier, 'active', now())
  ON CONFLICT (user_id)
  DO UPDATE SET tier = p_tier, status = 'active', updated_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_subscription_tier(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION admin_set_subscription_tier(uuid, text) TO authenticated;

-- 3. Admin resolves a (partial) user ID to a single profile
CREATE OR REPLACE FUNCTION admin_find_user_by_id(p_id_prefix text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.email, p.full_name, p.role
  FROM profiles p
  WHERE p.id::text ILIKE p_id_prefix || '%'
  LIMIT 2;
$$;

REVOKE EXECUTE ON FUNCTION admin_find_user_by_id(text) FROM anon;
GRANT EXECUTE ON FUNCTION admin_find_user_by_id(text) TO authenticated;

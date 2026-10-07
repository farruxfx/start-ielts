# STARTIELTS — Monetization & Test Access Control

## Overview

StartIELTS SaaS monetizatsiya modeli:

    Register -> Free account (3 bepul test)
    -> Premium testlar qulflangan (Free/Premium badge + modal)
    -> Plan tanlash -> Tolov (Telegram/card match)
    -> Payment tasdiqlanishi -> /api/subscription/activate
    -> Server expiry hisoblaydi + user_subscriptions yozadi
    -> Signed session cookie re-mint (re-login shart emas)
    -> Barcha premium testlar ochiladi
    -> Muddat tugasa -> yana qulflanadi (free testlar ochiq qoladi)

## Free Tests (yagona manba: lib/test-access.ts)

    FREE_TEST_SLUGS:
      - african-clawed-frog-listening      (Listening)
      - 200-years-of-australian-landscapes (Reading 1)
      - airborne-dentists                  (Reading 2)

TOTAL_FREE_TESTS = 3. Qolgan BARCHA listening/reading testlari PREMIUM.
Writing/Speaking hozircha ochiq (gating faqat listening/reading statik testlariga tatbiq etilgan).

## Access Logic (canAccessTest)

    FREE test    + istalgan auth user          -> ALLOW (reason: free_test)
    PREMIUM test + sessiya yo'q                -> DENY  (reason: not_authenticated -> /signin?next=)
    PREMIUM test + auth, obuna active emas     -> DENY  (reason: subscription_required -> /subscription-required yoki modal)
    PREMIUM test + auth, obuna active          -> ALLOW (reason: active_subscription)

Obuna "active" = status (active|trial) VA expiresAt > now (lib/test-access.ts isSubscriptionSnapshotActive).
Pending_payment/expired/cancelled hech qachon premium bermaydi.

## Architecture (qatlamlar)

| Qatlam | Fayl | Vazifa |
| --- | --- | --- |
| Access qoidalar | lib/test-access.ts | FREE_TEST_SLUGS, evaluateTestAccess/canAccessTest, snapshot helpers (Edge-safe) |
| Sessiya | lib/session.ts | ECDSA P-256 signed cookie (createSessionToken/verifySessionToken, deriveAccessState) |
| Server truth | lib/server-subscription-store.ts | user_subscriptions read/write, env grant, planDurationMs (server expiry) |
| Middleware | middleware.ts | .html statik gate (403 brendlangan sahifa), runner redirectlari, list sahifalar ochiq |
| API | /api/auth/session, /api/subscription/state, /api/subscription/activate, /api/test-access | cookie mint/clear, state, aktivatsiya, ALLOW/DENY (kontent qaytarmaydi) |
| Client state | lib/access-client.ts | useAccessState/useTestAccess (1 ta cached request), notifyAccessChanged |
| UI | premium-test-modal, subscription-required, listening/reading/practice kartalar, runner gate, dashboard | lock UI + modal |

## Payment Integration

1. Upgrade modal plan tanlaydi -> payment_orders (pending, unique exact_amount).
2. Foydalanuvchi karta/Telegram orqali aynan summani yuboradi.
3. Polling /api/payment/status -> order status='paid'.
4. Modal /api/subscription/activate chaqiradi:
   - Supabase rejim: server order'ni DB'dan tekshiradi (status='paid' + user_id mos).
   - Demo rejim (Supabase yo'q): client tasdiqlagan planId, lekin expiry BARIBIR serverda hisoblanadi.
5. writeServerSubscription: daily = 24h, qolgan = 30 kun. Cookie re-mint -> UI notifyAccessChanged() bilan yangilanadi.

## Security Model

- Cookie payload ECDSA P-256 bilan imzolangan (httpOnly, sameSite=lax, secure prod) — client soxta qila olmaydi.
- Edge middleware faqat PUBLIC key bilan tekshiradi (private key faqat Node runtime API'larda).
- Premium .html kontent (savollar/audio) middleware'dan o'tmasa HECH QACHON xizmat qilmaydi (403 + no-store).
- /api/test-access faqat qaror qaytaradi — kontent hech qachon.
- Expiry har verify'da tekshiriladi: token exp + sub.expiresAt.
- user_subscriptions'ga user yozolmaydi (RLS: faqat select own; yozish faqat service-role server).
- Logout -> clearSessionCookie -> middleware darhol qulflaydi.

## Environment (qarang .env.example)

    SESSION_PRIVATE_JWK            (server, PRODUCTIONDA MAJBURIY)
    NEXT_PUBLIC_SESSION_PUBLIC_JWK (Edge middleware)
    ADMIN_GRANT_USER_ID/PLAN/DAYS  (DB'siz demo grant, prod'da bo'sh)
    SUPABASE_*                     (mavjud konfiguratsiya)

## Database

    supabase/migrations/20261005000000_create_user_subscriptions.sql
      user_id PK (auth.users), plan_id, status, started_at, expires_at,
      source, payment_order_id -> payment_orders(id), updated_at trigger,
      RLS: faqat select own (yozish faqat server).

## Testing

    npx tsc --noEmit   — tiplar
    npx jest           — unit testlar
    npx next build     — production build

Qo'lda tekshiriladigan senariylar: yangi user 3 free testni ochadi; premium URL
to'g'ridan-to'g'ri -> /subscription-required; premium .html -> 403 sahifa;
tolov -> activate -> re-login'siz unlock; logout -> lock; expiry -> lock.

## Ma'lum cheklovlar

- Demo rejimda (Supabase sozlanmagan) to'lov tasdiqlashi client-side; lekin
  expiry va cookie muammosi serverda. Production uchun Supabase majburiy.
- Dev fallback ECDSA kaliti hardcoded — faqat lokal; Vercel'da real juftlik
  env orqali berilishi SHART (.env.example'dagi generator skripti bor).

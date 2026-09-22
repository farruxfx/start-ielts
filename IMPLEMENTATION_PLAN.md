# StartIELTS — Implementation Plan (Amalga oshirish Rejasi)

## 📋 Umumiy Qarash

Ushbu plan loyihani **"demo"** dan **"real product"** ga aylantirish uchun tuzilgan.
Har bir phase mustaqil ishlatish mumkin — birinchi bosqich tugagandan keyin loyiha allaqachon foydali bo'ladi.

**Umumiy muddat:** 8-12 hafta (2-3 oy)
**Kunlik vaqt:** 4-6 soat

---

## 🎯 Phase 0: Tayyorgarlik (1-2 kun)

### Maqsad:
- Loyiha holatini tekshirish
- Kerakli vositalarni o'rnatish
- Database tuzilmasini tayyorlash

### Vazifalar:

| # | Vazifa | Batafsil | Vaqt |
|---|--------|----------|------|
| 0.1 | Supabase loyihasini yaratish | supabase.com da yangi loyiha ochish | 30 min |
| 0.2 | Environment variables o'rnatish | `.env.local` ga Supabase URL va key qo'shish | 15 min |
| 0.3 | Database schema yaratish | SQL migration fayllarini tayyorlash | 2 soat |
| 0.4 | Git branching strategiyasi | `main` → `develop` → `feature/*` | 15 min |
| 0.5 | ESLint/Prettier config | Code style ni standartlashtirish | 30 min |

### Database Schema (SQL):

```sql
-- 1. Foydalanuvchilar (Supabase Auth bilan avtomatik)
-- auth.users jadvalida saqlanadi

-- 2. User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  target_band DECIMAL(3,1) DEFAULT 7.5,
  exam_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Test Results
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('reading','listening','writing','speaking','mock')),
  overall_band DECIMAL(3,1) NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vocabulary
CREATE TABLE vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT,
  example TEXT,
  synonyms TEXT[],
  word_family JSONB,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  category TEXT,
  mastery_level INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mistakes
CREATE TABLE mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  your_answer TEXT,
  correct_answer TEXT,
  explanation TEXT,
  category TEXT,
  difficulty TEXT,
  skill TEXT,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'free',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_id TEXT
);

-- 7. Payment Orders
CREATE TABLE payment_orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  plan_id TEXT NOT NULL,
  payment_method_id TEXT,
  base_amount INTEGER NOT NULL,
  exact_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  transaction_message_id TEXT,
  transaction_sender_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Mock Exam Sessions
CREATE TABLE mock_exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'not_started',
  current_section TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  section_scores JSONB,
  overall_band DECIMAL(3,1)
);

-- 9. Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- 10. Daily Goals
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  listening BOOLEAN DEFAULT FALSE,
  reading BOOLEAN DEFAULT FALSE,
  writing BOOLEAN DEFAULT FALSE,
  speaking BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Har bir foydalanuvchi faqat o'z ma'lumotlarini ko'radi
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own results" ON test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🔐 Phase 1: Authentication (3-5 kun)

### Maqsad:
- Hardcoded user ID ni o'chirish
- Haqiqiy Supabase Auth integratsiyasi
- Sign up / Sign in / Sign out flow

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 1.1 | Auth Provider ni yangilash | `components/auth/auth-provider.tsx` | 4 soat |
| 1.2 | Mock Auth ni o'chirish yoki fallback sifatida qoldirish | `components/auth/mock-auth-provider.ts` | 1 soat |
| 1.3 | Sign Up sahifasini yangilash | `app/signup/page.tsx` | 3 soat |
| 1.4 | Sign In sahifasini yangilash | `app/signin/page.tsx` | 2 soat |
| 1.5 | Middleware yaratish (auth guard) | `middleware.ts` | 2 soat |
| 1.6 | Onboarding flow ni yangilash | `app/onboarding/page.tsx` | 3 soat |
| 1.7 | Session management | `lib/supabase.ts` | 2 soat |
| 1.8 | User profile CRUD | `lib/user-profile.ts` (yangi) | 3 soat |

### Key Implementation Details:

```typescript
// components/auth/auth-provider.tsx — yangilangan versiya
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create/update user profile on first login
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message || null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role: null, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Middleware (middleware.ts):

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/dashboard', '/practice', '/analytics', '/settings', '/subscription'];
  const isProtected = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}
```

---

## 🗄️ Phase 2: Database Migration (5-7 kun)

### Maqsad:
- Barcha localStorage ma'lumotlarini Supabase ga o'tkazish
- Data access layer yaratish
- Sync mechanism

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 2.1 | Database helper functions | `lib/db.ts` (yangi) | 4 soat |
| 2.2 | User profile → Supabase | `lib/db-profile.ts` (yangi) | 3 soat |
| 2.3 | Test results → Supabase | `lib/db-test-results.ts` (yangi) | 4 soat |
| 2.4 | Vocabulary → Supabase | `lib/db-vocabulary.ts` (yangi) | 3 soat |
| 2.5 | Mistakes → Supabase | `lib/db-mistakes.ts` (yangi) | 2 soat |
| 2.6 | Achievements → Supabase | `lib/db-achievements.ts` (yangi) | 2 soat |
| 2.7 | Mock exam sessions → Supabase | `lib/db-mock-exams.ts` (yangi) | 3 soat |
| 2.8 | Data migration script | `scripts/migrate-localstorage.ts` | 4 soat |
| 2.9 | Old store.ts ni yangilash | `lib/store.ts` | 4 soat |
| 2.10 | Offline fallback (localStorage) | `lib/db-offline.ts` (yangi) | 3 soat |

### Data Access Layer Pattern:

```typescript
// lib/db.ts — Umumiy helper
import { supabase, isSupabaseConfigured } from './supabase';

export async function dbQuery<T>(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  options?: {
    filters?: Record<string, unknown>;
    data?: Record<string, unknown>;
    single?: boolean;
  }
): Promise<T | null> {
  if (!isSupabaseConfigured) {
    return fallbackToLocal(table, operation, options);
  }

  let query = supabase.from(table);

  switch (operation) {
    case 'select':
      query = query.select('*');
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      break;
    case 'insert':
      query = query.insert(options?.data);
      break;
    case 'update':
      query = query.update(options?.data);
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      break;
    case 'delete':
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.delete().eq(key, value);
        });
      }
      break;
  }

  const { data, error } = options?.single
    ? await query.single()
    : await query;

  if (error) {
    console.error(`DB Error [${table}]:`, error);
    return fallbackToLocal(table, operation, options);
  }

  return data as T;
}

// Offline fallback — Supabase ishlamasa localStorage ga yozish
function fallbackToLocal<T>(table: string, operation: string, options?: any): T | null {
  // localStorage fallback logic
  return null;
}
```

### Migration Script:

```typescript
// scripts/migrate-localstorage.ts
// Browser console da ishga tushiriladi

import { supabase } from '@/lib/supabase';

export async function migrateLocalStorageToSupabase() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    alert('Iltimos, avval tizimga kiring!');
    return;
  }

  // 1. User Profile
  const profile = localStorage.getItem('ieltspro_user_profile');
  if (profile) {
    const parsed = JSON.parse(profile);
    await supabase.from('user_profiles').upsert({
      id: user.id,
      name: parsed.name,
      target_band: parsed.targetBand,
    });
  }

  // 2. Test Results
  const results = localStorage.getItem('ieltspro_test_results');
  if (results) {
    const parsed = JSON.parse(results);
    for (const result of parsed) {
      await supabase.from('test_results').insert({
        user_id: user.id,
        test_id: result.testId,
        test_title: result.testTitle,
        skill: result.skill,
        overall_band: result.overallBand,
        correct_answers: result.correctAnswers,
        total_questions: result.totalQuestions,
        accuracy: result.accuracy,
        time_spent_minutes: result.timeSpentMinutes,
        completed_at: result.completedAt,
      });
    }
  }

  // 3. Vocabulary, Mistakes, Achievements...
  // (similar pattern)

  alert('Migration muvaffaqiyatli yakunlandi!');
}
```

---

## 🔌 Phase 3: REST API (5-7 kun)

### Maqsad:
- To'liq REST API endpointlar
- Server-side data operations
- Validation va error handling

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 3.1 | API utilities | `lib/api-utils.ts` (yangi) | 2 soat |
| 3.2 | User profile API | `app/api/profile/route.ts` | 2 soat |
| 3.3 | Test results API | `app/api/test-results/route.ts` | 3 soat |
| 3.4 | Vocabulary API | `app/api/vocabulary/route.ts` | 2 soat |
| 3.5 | Mistakes API | `app/api/mistakes/route.ts` | 2 soat |
| 3.6 | Achievements API | `app/api/achievements/route.ts` | 1 soat |
| 3.7 | Mock exam API | `app/api/mock-exams/route.ts` | 3 soat |
| 3.8 | Analytics API | `app/api/analytics/route.ts` | 3 soat |
| 3.9 | Subscription API | `app/api/subscription/route.ts` | 2 soat |
| 3.10 | Payment webhook | `app/api/payment/webhook/route.ts` | 4 soat |

### API Pattern:

```typescript
// app/api/test-results/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill');

  let query = supabase
    .from('test_results')
    .select('*')
    .eq('user_id', session.user.id)
    .order('completed_at', { ascending: false });

  if (skill) {
    query = query.eq('skill', skill);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Validation
  const required = ['test_id', 'test_title', 'skill', 'overall_band'];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('test_results')
    .insert({
      user_id: session.user.id,
      test_id: body.test_id,
      test_title: body.test_title,
      skill: body.skill,
      overall_band: body.overall_band,
      correct_answers: body.correct_answers || 0,
      total_questions: body.total_questions || 0,
      accuracy: body.accuracy || 0,
      time_spent_minutes: body.time_spent_minutes || 0,
      answers: body.answers || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

---

## 💳 Phase 4: To'lov Tizimi (5-7 kun)

### Maqsad:
- Click/Payme API integratsiyasi
- Telegram bot orqali tasdiqlash
- Webhook endpointlar

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 4.1 | Click API service | `lib/services/click.ts` (yangi) | 4 soat |
| 4.2 | Payme API service | `lib/services/payme.ts` (yangi) | 4 soat |
| 4.3 | Payment factory | `lib/services/payment-factory.ts` (yangi) | 2 soat |
| 4.4 | Click webhook | `app/api/payment/click/route.ts` | 3 soat |
| 4.5 | Payme webhook | `app/api/payment/payme/route.ts` | 3 soat |
| 4.6 | Telegram bot | `lib/services/telegram-bot.ts` | 4 soat |
| 4.7 | Payment UI yangilash | `app/payment/[orderId]/page.tsx` | 3 soat |
| 4.8 | Subscription activation | `lib/services/subscription-service.ts` | 2 soat |

### Click API Integration:

```typescript
// lib/services/click.ts
import crypto from 'crypto';

const CLICK_SECRET = process.env.CLICK_SECRET_KEY || '';
const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || '';

export interface ClickPaymentRequest {
  click_trans_id: string;
  service_id: number;
  click_paydoc_id: number;
  amount: number;
  action: number; // 0 = create, 1 = verify
  error_code: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

export function verifyClickSignature(request: ClickPaymentRequest): boolean {
  const signString = `${request.click_trans_id}${request.service_id}${request.click_paydoc_id}${request.amount}${request.action}${request.sign_time}${CLICK_SECRET}`;
  const expectedSignature = crypto.createHash('md5').update(signString).digest('hex');
  return expectedSignature === request.sign_string;
}

export function generateClickSignature(
  transId: string,
  serviceId: number,
  payDocId: number,
  amount: number
): string {
  const signString = `${transId}${serviceId}${payDocId}${amount}${CLICK_SECRET}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}
```

### Telegram Bot:

```typescript
// lib/services/telegram-bot.ts
import { Bot } from 'grammy';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

const bot = new Bot(BOT_TOKEN);

export async function notifyPaymentReceived(data: {
  orderId: string;
  amount: number;
  senderId: string;
  planId: string;
}) {
  const message = `
💳 *Yangi to'lov qabul qilindi!*

📦 Buyurtma: ${data.orderId}
💰 Summa: ${data.amount.toLocaleString()} so'm
👤 Yuboruvchi: ${data.senderId}
📋 Plan: ${data.planId}

✅ Tasdiqlash: /confirm_${data.orderId}
❌ Rad etish: /reject_${data.orderId}
  `;

  await bot.api.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
}

export async function confirmPayment(orderId: string) {
  // Payment order ni tasdiqlash
  // Subscription ni aktivlashtirish
}
```

---

## 🐛 Phase 5: Error Handling & UX (3-5 kun)

### Maqsad:
- Comprehensive error handling
- Loading states
- Toast notifications
- User feedback

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 5.1 | Error boundary | `components/error-boundary.tsx` (yangi) | 2 soat |
| 5.2 | Toast system | `lib/toast.ts` (yangi) | 2 soat |
| 5.3 | Loading skeleton | `components/ui/skeleton.tsx` | 1 soat |
| 5.4 | API error handling | `lib/api-errors.ts` (yangi) | 2 soat |
| 5.5 | Global error handler | `app/error.tsx` | 2 soat |
| 5.6 | Not found page | `app/not-found.tsx` | 1 soat |
| 5.7 | Form validation | React Hook Form + Zod | 3 soat |

### Error Boundary:

```typescript
// components/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <div className="text-6xl">😵</div>
          <h2 className="text-xl font-bold">Xatolik yuz berdi</h2>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Qayta urinish
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## ⚡ Phase 6: Performance (3-5 kun)

### Maqsad:
- Bundle size kamaytirish
- Caching strategy
- Lazy loading
- Image optimization

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 6.1 | Dynamic imports | Barcha sahifalar | 3 soat |
| 6.2 | Image optimization | `next.config.js` | 2 soat |
| 6.3 | Bundle analysis | `next.config.js` | 1 soat |
| 6.4 | Caching headers | `next.config.js` | 2 soat |
| 6.5 | Skeleton loading | Dashboard, Practice | 3 soat |
| 6.6 | Virtual scrolling | Long lists | 3 soat |

### Dynamic Imports:

```typescript
// app/dashboard/page.tsx
import dynamic from 'next/dynamic';

const ProgressCharts = dynamic(
  () => import('@/components/dashboard/progress-charts'),
  { loading: () => <Skeleton className="h-[300px] w-full" /> }
);

const AchievementsWidget = dynamic(
  () => import('@/components/dashboard/achievements-widget'),
  { loading: () => <Skeleton className="h-[200px] w-full" /> }
);
```

---

## 🔍 Phase 7: SEO (2-3 kun)

### Maqsad:
- Meta tags
- Open Graph
- Sitemap
- robots.txt

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 7.1 | Metadata generation | `lib/seo.ts` (yangi) | 2 soat |
| 7.2 | Sitemap | `app/sitemap.ts` | 1 soat |
| 7.3 | robots.txt | `app/robots.ts` | 30 min |
| 7.4 | Open Graph images | `public/og/` | 2 soat |
| 7.5 | Structured data | JSON-LD | 2 soat |

### Sitemap:

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://startielts.com';

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/signin`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];
}
```

---

## 🧪 Phase 8: Testing (5-7 kun)

### Maqsad:
- Unit testlar
- Integration testlar
- E2E testlar

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 8.1 | Jest o'rnatish | `jest.config.ts` | 1 soat |
| 8.2 | Unit testlar (lib) | `lib/__tests__/` | 4 soat |
| 8.3 | Component testlar | `components/__tests__/` | 4 soat |
| 8.4 | API testlar | `app/api/__tests__/` | 3 soat |
| 8.5 | Cypress o'rnatish | `cypress.config.ts` | 2 soat |
| 8.6 | E2E testlar | `cypress/e2e/` | 5 soat |

### Example Unit Test:

```typescript
// lib/__tests__/store.test.ts
import { calculateOverallBand, addTestResult } from '../store';

describe('Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('calculateOverallBand returns 0 when no results', () => {
    expect(calculateOverallBand()).toBe(0);
  });

  test('addTestResult saves to localStorage', () => {
    const result = {
      id: '1',
      testId: 'test-1',
      testTitle: 'Reading Test 1',
      skill: 'reading' as const,
      overallBand: 7.5,
      correctAnswers: 35,
      totalQuestions: 40,
      accuracy: 88,
      timeSpentMinutes: 60,
      completedAt: new Date().toISOString(),
    };

    addTestResult(result);
    const results = JSON.parse(localStorage.getItem('ieltspro_test_results') || '[]');
    expect(results).toHaveLength(1);
  });
});
```

---

## 📱 Phase 9: PWA (3-5 kun)

### Maqsad:
- Offline support
- Install prompt
- Service worker

### Vazifalar:

| # | Vazifa | Fayllar | Vaqt |
|---|--------|---------|------|
| 9.1 | manifest.json | `public/manifest.json` | 1 soat |
| 9.2 | Service worker | `public/sw.js` | 3 soat |
| 9.3 | Offline fallback | `public/offline.html` | 2 soat |
| 9.4 | Install prompt | `components/pwa-install.tsx` | 2 soat |
| 9.5 | Cache strategy | Service worker | 2 soat |

---

## 📊 Loyiha Jadvali (Gantt Chart)

```
Hafta 1-2:  [Phase 0] Tayyorgarlik
Hafta 2-3:  [Phase 1] Authentication
Hafta 3-5:  [Phase 2] Database Migration
Hafta 5-7:  [Phase 3] REST API
Hafta 7-9:  [Phase 4] To'lov Tizimi
Hafta 9-10: [Phase 5] Error Handling
Hafta 10-11: [Phase 6] Performance
Hafta 11-12: [Phase 7] SEO
Hafta 12-13: [Phase 8] Testing
Hafta 13-14: [Phase 9] PWA
```

---

## 🎯 Milestone Summary

| Milestone | Vaqt | Natija |
|-----------|------|--------|
| M1: Auth Working | 1 hafta | Sign up/in/out ishlaydi |
| M2: Data in DB | 2 hafta | Ma'lumotlar Supabase da |
| M3: API Complete | 3 hafta | REST API tayyor |
| M4: Payments Live | 4 hafta | Haqiqiy to'lov ishlaydi |
| M5: Production Ready | 6 hafta | Error handling, SEO, testing |
| M6: PWA | 7 hafta | Offline support |

---

## 🔧 Kerakli Tools & Libraries

### Already Installed:
- ✅ Next.js 13.5
- ✅ Supabase JS
- ✅ Radix UI
- ✅ Tailwind CSS
- ✅ Zod (validation)
- ✅ React Hook Form

### Need to Install:
```bash
# Testing
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress

# PWA
npm install next-pwa

# SEO
npm install next-sitemap

# Performance
npm install @next/bundle-analyzer

# Monitoring
npm install @sentry/nextjs
```

---

## 💡 Important Notes

1. **Phase 1 va 2 birgalikda** — Auth va DB migration bir vaqtda qilinishi kerak
2. **Backward compatibility** — Eski localStorage ma'lumotlari saqlanishi kerak
3. **Incremental migration** — Barcha ma'lumotlar bir zumda o'tkazilmaydi, user by user
4. **Testing** — Har bir phase tugagandan keyin test qilish kerak
5. **Documentation** — API docs yozish kerak (Swagger/OpenAPI)

---

*Yaratildi: 2026-yil 21-sentabr*
*Versiya: 1.0*

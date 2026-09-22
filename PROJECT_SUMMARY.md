# StartIELTS — Loyiha Xulosasi

## 📋 Loyiha Haqida Umumiy Ma'lumot

**StartIELTS** — bu IELTS imtihoniga tayyorlanish uchun to'liq onlayn platforma. Foydalanuvchilar barcha 4 ta ko'nikmani (Listening, Reading, Writing, Speaking) rivojlantirishi, mock imtihonlarni topshirishi, progressini kuzatishi va AI yordamida o'zlarini baholatishi mumkin.

**Texnologiyalar:**
- **Frontend:** Next.js 13.5, React 18, TypeScript, Tailwind CSS
- **UI Komponentlar:** Radix UI (shadcn/ui), Lucide React, Recharts
- **Backend/DB:** Supabase (PostgreSQL + Auth)
- **AI:** Groq API (GPT-OSS-120B modeli)
- **To'lov:** Click, Payme, Humo, UzCard (O'zbekiston)
- **Deploy:** Netlify

---

## 🏗 Loyiha Tuzilishi

```
app/
├── page.tsx              # Landing page (Hero, Skills, Pricing, etc.)
├── layout.tsx            # Root layout
├── dashboard/            # Asosiy dashboard
├── practice/             # Mashq testlari
├── listening/            # Listening mashqlari
├── reading/              # Reading mashqlari
├── writing/              # Writing mashqlari
├── speaking/             # Speaking mashqlari
├── vocabulary/           # Lug'at bo'limi
├── mock-exam/            # Mock imtihonlar
├── ai-coach/             # AI murabbiy
├── analytics/            # Statistika va tahlil
├── settings/             # Sozlamalar
├── subscription/         # Obuna boshqaruvi
├── pricing/              # Narxlar sahifasi
├── admin/                # Admin panel
├── teacher/              # O'qituvchi paneli
├── api/                  # API endpointlar
│   ├── chat/             # AI chat endpointi
│   ├── payment/          # To'lov endpointi
│   └── speaking-feedback/ # Speaking baholash
├── signin/               # Kirish
├── signup/               # Ro'yxatdan o'tish
└── onboarding/           # Boshlang'ich sozlamalar
```

---

## ✅ mavjud Funksiyalar

### 1. **Landing Page**
- Hero section (animatsiyalar bilan)
- Skills showcase
- Mock Exam showcase
- Pricing plans
- Testimonials
- FAQ
- Footer

### 2. **Autentifikatsiya**
- Email/Password bilan kirish
- Google Auth (Supabase orqali)
- Onboarding (target band, exam date, etc.)

### 3. **Practice (Mashq)**
- Reading testlari ( Passage + savollar)
- Listening testlari (Audio bilan)
- Writing testlari (Task 1 & Task 2)
- Speaking testlari (Part 1, 2, 3)
- Har bir test uchun:
  - Multiple choice
  - True/False/Not Given
  - Sentence completion
  - Matching
  - va boshqa savol turlari

### 4. **Mock Imtihonlar**
- To'liq mock imtihonlar (4 ta skill)
- Timer bilan
- Section-by-section progress
- Natijalar sahifasi

### 5. **AI Coach (Groq API)**
- IELTS bo'yicha AI murabbiy
- Writing tahlili (band score, feedback)
- Speaking tahlili (fluency, pronunciation, etc.)
- Personalized recommendations

### 6. **Vocabulary (Lug'at)**
- So'zlar bazasi
- Synonyms, word family
- Spaced repetition tizimi
- Kategoriyalar bo'yicha

### 7. **Analytics Dashboard**
- Progress charts (Recharts)
- Skill breakdown
- Weekly activity
- Streak tracking
- Target band tracking

### 8. **Subscription System (5 ta plan)**
| Plan | Narx (oylik) | Imkoniyatlar |
|------|-------------|--------------|
| Free | Bepul | Limited testlar, 1 demo mock |
| Daily Pass | 7,900 so'm | 24 soat to'liq kirish |
| Start | 29,000 so'm | Extended practice |
| Basic | 59,000 so'm | Full access + Study plan |
| Pro | 99,000 so'm | AI tahlil + Advanced analytics |

### 9. **To'lov Tizimi**
- Click, Payme, Humo, UzCard
- Telegram bot orqali to'lovni tasdiqlash
- Unique amount generator (tekshirish uchun)
- Payment orders (Supabase + localStorage fallback)

### 10. **Admin Panel**
- Foydalanuvchilar boshqaruvi
- To'lov buyurtmalari
- Test kutubxonasi
- Import testlar
- Subscription boshqaruvi

### 11. **Teacher Panel**
- Guruhlar yaratish
- Testlar yaratish
- Natijalarni ko'rish

### 12. **UI/UX**
- Responsive design (mobile + desktop)
- Dark mode support (next-themes)
- Animations (Tailwind + custom)
- Copy protection
- Theme toggle

---

## ⚠️ Kamchiliklar va Mavjud Muammolar

### 1. **Data Persistence (Eng muhim muammo)**
- **Hozir:** Barcha ma'lumotlar `localStorage` da saqlanadi
- **Muammo:**
  - Foydalanuvchi boshqa qurilmaga o'tsa ma'lumotlari yo'qoladi
  - Brauzer ma'lumotlarni tozalasa hamma narsa yo'qoladi
  - Bitta foydalanuvchi ID si ishlatilmoqda: `"default-user"`
  - Real Supabase database integratsiyasi to'liq emas
- **Yechim:** Supabase database ga to'liq migratsiya qilish kerak

### 2. **Authentication Xavfsizligi**
- **Hozir:** Hardcoded user ID: `"default-user"`
- **Muammo:**
  - Haqiqiy auth flow to'liq ishlamayapti
  - Supabase auth integratsiyasi yarim-yakun
  - Session management to'g'ri o'rnatilmagan
- **Yechim:** Supabase Auth ni to'liq integratsiya qilish

### 3. **To'lov Tizimi**
- **Hozir:** Mock payment provider ishlatilmoqda
- **Muammo:**
  - Haqiqiy Click/Payme API integratsiyasi yo'q
  - Telegram bot to'lovni qayta ishlash hali ishga tushirilmagan
  - Webhook endpointlar mavjud emas
- **Yechim:** Click/Payme API ni integratsiya qilish

### 4. **Backend API Endpointlar**
- **Hozir:** Faqat 3 ta API route mavjud
  - `/api/chat` (AI chat)
  - `/api/speaking-feedback`
  - `/api/payment/create`
- **Muammo:**
  - REST API endpointlar yetarli emas
  - CRUD operatsiyalar client-side da
  - Server-side rendering limited
- **Yechim:** To'liq REST API yaratish

### 5. **Test Ma'lumotlari**
- **Hozir:** Testlar hardcoded JSON fayllarda
- **Muammo:**
  - Yangi testlar qo'shish qiyin
  - Database da saqlanmayapti
  - Dynamic test generation yo'q
- **Yechim:** Testlarni Supabase ga migratsiya qilish

### 6. **Xatoliklarni Boshqarish (Error Handling)**
- **Hozir:** Minimal error handling
- **Muammo:**
  - API xatoliklari to'g'ri qayta ishlanmayapti
  - User-facing xabarlar yo'q
  - Loading states yetarli emas
- **Yechim:** Comprehensive error handling + toast notifications

### 7. **Performance**
- **Muammo:**
  - Large bundle size (ko'p dependencies)
  - Image optimization disabled (`images: { unoptimized: true }`)
  - No ISR/SSG for static pages
  - No caching strategy
- **Yechim:** Bundle optimization, caching, lazy loading

### 8. **SEO**
- **Muammo:**
  - Meta tags limited
  - Open Graph images yo'q
  - Sitemap.xml mavjud emas
  - robots.txt mavjud emas
- **Yechim:** SEO optimization qilish

### 9. **Testing**
- **Muammo:**
  - Unit testlar yo'q
  - Integration testlar yo'q
  - E2E testlar yo'q
- **Yechim:** Testing framework o'rnatish (Jest, Cypress)

### 10. **Security**
- **Muammo:**
  - API keys client-side da ko'rinishi mumkin
  - CSRF protection yo'q
  - Rate limiting yo'q
  - Input validation limited
- **Yechim:** Security best practices qo'llash

### 11. **Internationalization (i18n)**
- **Hozir:** Faqat Ingliz tili
- **Muammo:**
  - O'zbek tili qo'llab-quvvatlanmayapti
  - RTL support yo'q
- **Yechim:** i18n tizimini o'rnatish

### 12. **Mobile App**
- **Muammo:**
  - PWA emas
  - Native app yo'q
  - Offline support yo'q
- **Yechim:** PWA yoki React Native app

---

## 🚀 Keyingi Qadamlar (Tavsiyalar)

### 1. **Darhol bajarilishi kerak:**
1. ✅ Supabase Auth ni to'liq integratsiya qilish
2. ✅ Ma'lumotlarni localStorage → Supabase ga o'tkazish
3. ✅ Hardcoded user ID ni o'chirib, real auth flow qilish

### 2. **Qisqa muddatda (1-2 hafta):**
1. REST API endpointlar yaratish
2. To'lov tizimini real qilish (Click/Payme)
3. Error handling ni yaxshilash
4. Loading states qo'shish

### 3. **O'rta muddatda (1-2 oy):**
1. Unit testlar yozish
2. Performance optimization
3. SEO optimization
4. Admin panelini boyitish

### 4. **Uzoq muddatda (3+ oy):**
1. PWA qilish
2. Mobile app (React Native)
3. O'zbek tili qo'shish
4. Offline support

---

## 📊 Loyiha Statistikasi

- **Jami sahifalar:** ~30+ sahifalar
- **Jami komponentlar:** ~50+ komponentlar
- **Jami kutubxonalar:** 60+ dependencies
- **API endpointlar:** 3 ta
- **Testlar:** 0 ta (testlar yo'q)
- **Deployment:** Netlify

---

## 💡 Xulosa

**StartIELTS** — bu juda yaxshi g'oya va yaxshi boshlang'ich loyiha. Asosiy funksiyalar mavjud va UI/UX yaxshi darajada. Biroq, **eng muhim kamchilik** — bu ma'lumotlarning `localStorage` da saqlanishi va haqiqiy autentifikatsiyaning ishlamasligidir.

**Eng birinchi qadam:** Supabase database va Auth ni to'liq integratsiya qilish — bu loyihani haqiqiy productga aylantirish uchun zarur.

---

*Yaratildi: 2026-yil 21-sentabr*
*Loyiha versiyasi: 0.1.0*
